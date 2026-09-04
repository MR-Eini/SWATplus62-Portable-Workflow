// Copyright Isaac Z. Schlueter and Contributors. All rights reserved. ISC license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * The Semantic Version parser.
 *
 * Adapted directly from {@link https://github.com/npm/node-semver | semver}.
 *
 * ```ts
 * import {
 *   parse,
 *   parseRange,
 *   greaterThan,
 *   lessThan,
 *   format
 * } from "@std/semver";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const semver = parse("1.2.3");
 * assertEquals(semver, {
 *   major: 1,
 *   minor: 2,
 *   patch: 3,
 *   prerelease: [],
 *   build: []
 * });
 *
 * assertEquals(format(semver), "1.2.3");
 *
 * const range = parseRange("1.x || >=2.5.0 || 5.0.0 - 7.2.3");
 *
 * const s0 = parse("1.2.3");
 * const s1 = parse("9.8.7");
 *
 * assertEquals(greaterThan(s0, s1), false);
 * assertEquals(lessThan(s0, s1), true);
 * ```
 *
 * ## Versions
 *
 * A "version" is described by the `v2.0.0` specification found at
 * <https://semver.org>.
 *
 * A leading `"="` or `"v"` character is stripped off and ignored.
 *
 * ## Format
 *
 * Semantic versions can be formatted as strings, by default they
 * are formatted as `full`. Below is a diagram showing the various
 * formatting options.
 *
 * ```
 *           ┌───── full
 *       ┌───┴───┐
 *       ├───────── release
 *   ┌───┴───┐   │
 *   ├───────────── primary
 * ┌─┴─┐     │   │
 * 1.2.3-pre.1+b.1
 * │ │ │ └─┬─┘ └┬┘
 * │ │ │   │    └── build
 * │ │ │   └─────── pre
 * │ │ └─────────── patch
 * │ └───────────── minor
 * └─────────────── major
 * ```
 *
 * ## Ranges
 *
 * A `version range` is a set of `comparators` which specify versions that satisfy
 * the range.
 *
 * A `comparator` is composed of an `operator` and a `version`. The set of
 * primitive `operators` is:
 *
 * - `<` Less than
 * - `<=` Less than or equal to
 * - `>` Greater than
 * - `>=` Greater than or equal to
 * - `=` Equal. If no operator is specified, then equality is assumed, so this
 *   operator is optional, but MAY be included.
 *
 * For example, the comparator `>=1.2.7` would match the versions `1.2.7`, `1.2.8`,
 * `2.5.3`, and `1.3.9`, but not the versions `1.2.6` or `1.1.0`.
 *
 * Comparators can be joined by whitespace to form a `comparator set`, which is
 * satisfied by the **intersection** of all of the comparators it includes.
 *
 * A range is composed of one or more comparator sets, joined by `||`. A version
 * matches a range if and only if every comparator in at least one of the
 * `||`-separated comparator sets is satisfied by the version.
 *
 * For example, the range `>=1.2.7 <1.3.0` would match the versions `1.2.7`,
 * `1.2.8`, and `1.2.99`, but not the versions `1.2.6`, `1.3.0`, or `1.1.0`.
 *
 * The range `1.2.7 || >=1.2.9 <2.0.0` would match the versions `1.2.7`, `1.2.9`,
 * and `1.4.6`, but not the versions `1.2.8` or `2.0.0`.
 *
 * ### Prerelease Tags
 *
 * If a version has a prerelease tag (for example, `1.2.3-alpha.3`) then it will
 * only be allowed to satisfy comparator sets if at least one comparator with the
 * same `[major, minor, patch]` tuple also has a prerelease tag.
 *
 * For example, the range `>1.2.3-alpha.3` would be allowed to match the version
 * `1.2.3-alpha.7`, but it would _not_ be satisfied by `3.4.5-alpha.9`, even though
 * `3.4.5-alpha.9` is technically "greater than" `1.2.3-alpha.3` according to the
 * SemVer sort rules. The version range only accepts prerelease tags on the `1.2.3`
 * version. The version `3.4.5` _would_ satisfy the range, because it does not have
 * a prerelease flag, and `3.4.5` is greater than `1.2.3-alpha.7`.
 *
 * The purpose for this behavior is twofold. First, prerelease versions frequently
 * are updated very quickly, and contain many breaking changes that are (by the
 * author"s design) not yet fit for public consumption. Therefore, by default, they
 * are excluded from range matching semantics.
 *
 * Second, a user who has opted into using a prerelease version has clearly
 * indicated the intent to use _that specific_ set of alpha/beta/rc versions. By
 * including a prerelease tag in the range, the user is indicating that they are
 * aware of the risk. However, it is still not appropriate to assume that they have
 * opted into taking a similar risk on the _next_ set of prerelease versions.
 *
 * #### Prerelease Identifiers
 *
 * The method `.increment` takes an additional `identifier` string argument that
 * will append the value of the string as a prerelease identifier:
 *
 * ```javascript
 * semver.increment(parse("1.2.3"), "prerelease", "beta");
 * // "1.2.4-beta.0"
 * ```
 *
 * ### Build Metadata
 *
 * Build metadata is `.` delimited alpha-numeric string.
 * When parsing a version it is retained on the `build: string[]` field
 * of the SemVer instance. When incrementing there is an additional parameter that
 * can set the build metadata on the SemVer instance.
 *
 * ### Advanced Range Syntax
 *
 * Advanced range syntax desugars to primitive comparators in deterministic ways.
 *
 * Advanced ranges may be combined in the same way as primitive comparators using
 * white space or `||`.
 *
 * #### Hyphen Ranges `X.Y.Z - A.B.C`
 *
 * Specifies an inclusive set.
 *
 * - `1.2.3 - 2.3.4` := `>=1.2.3 <=2.3.4`
 *
 * If a partial version is provided as the first version in the inclusive range,
 * then the missing pieces are replaced with zeroes.
 *
 * - `1.2 - 2.3.4` := `>=1.2.0 <=2.3.4`
 *
 * If a partial version is provided as the second version in the inclusive range,
 * then all versions that start with the supplied parts of the tuple are accepted,
 * but nothing that would be greater than the provided tuple parts.
 *
 * - `1.2.3 - 2.3` := `>=1.2.3 <2.4.0`
 * - `1.2.3 - 2` := `>=1.2.3 <3.0.0`
 *
 * #### X-Ranges `1.2.x` `1.X` `1.2.*` `*`
 *
 * Any of `X`, `x`, or `*` may be used to "stand in" for one of the numeric values
 * in the `[major, minor, patch]` tuple.
 *
 * - `*` := `>=0.0.0` (Any version satisfies)
 * - `1.x` := `>=1.0.0 <2.0.0` (Matching major version)
 * - `1.2.x` := `>=1.2.0 <1.3.0` (Matching major and minor versions)
 *
 * A partial version range is treated as an X-Range, so the special character is in
 * fact optional.
 *
 * - `""` (empty string) := `*` := `>=0.0.0`
 * - `1` := `1.x.x` := `>=1.0.0 <2.0.0`
 * - `1.2` := `1.2.x` := `>=1.2.0 <1.3.0`
 *
 * #### Tilde Ranges `~1.2.3` `~1.2` `~1`
 *
 * Allows patch-level changes if a minor version is specified on the comparator.
 * Allows minor-level changes if not.
 *
 * - `~1.2.3` := `>=1.2.3 <1.(2+1).0` := `>=1.2.3 <1.3.0`
 * - `~1.2` := `>=1.2.0 <1.(2+1).0` := `>=1.2.0 <1.3.0` (Same as `1.2.x`)
 * - `~1` := `>=1.0.0 <(1+1).0.0` := `>=1.0.0 <2.0.0` (Same as `1.x`)
 * - `~0.2.3` := `>=0.2.3 <0.(2+1).0` := `>=0.2.3 <0.3.0`
 * - `~0.2` := `>=0.2.0 <0.(2+1).0` := `>=0.2.0 <0.3.0` (Same as `0.2.x`)
 * - `~0` := `>=0.0.0 <(0+1).0.0` := `>=0.0.0 <1.0.0` (Same as `0.x`)
 * - `~1.2.3-beta.2` := `>=1.2.3-beta.2 <1.3.0` Note that prereleases in the
 *   `1.2.3` version will be allowed, if they are greater than or equal to
 *   `beta.2`. So, `1.2.3-beta.4` would be allowed, but `1.2.4-beta.2` would not,
 *   because it is a prerelease of a different `[major, minor, patch]` tuple.
 *
 * #### Caret Ranges `^1.2.3` `^0.2.5` `^0.0.4`
 *
 * Allows changes that do not modify the left-most non-zero element in the
 * `[major, minor, patch]` tuple. In other words, this allows patch and minor
 * updates for versions `1.0.0` and above, patch updates for versions
 * `0.X >=0.1.0`, and _no_ updates for versions `0.0.X`.
 *
 * Many authors treat a `0.x` version as if the `x` were the major
 * "breaking-change" indicator.
 *
 * Caret ranges are ideal when an author may make breaking changes between `0.2.4`
 * and `0.3.0` releases, which is a common practice. However, it presumes that
 * there will _not_ be breaking changes between `0.2.4` and `0.2.5`. It allows for
 * changes that are presumed to be additive (but non-breaking), according to
 * commonly observed practices.
 *
 * - `^1.2.3` := `>=1.2.3 <2.0.0`
 * - `^0.2.3` := `>=0.2.3 <0.3.0`
 * - `^0.0.3` := `>=0.0.3 <0.0.4`
 * - `^1.2.3-beta.2` := `>=1.2.3-beta.2 <2.0.0` Note that prereleases in the
 *   `1.2.3` version will be allowed, if they are greater than or equal to
 *   `beta.2`. So, `1.2.3-beta.4` would be allowed, but `1.2.4-beta.2` would not,
 *   because it is a prerelease of a different `[major, minor, patch]` tuple.
 * - `^0.0.3-beta` := `>=0.0.3-beta <0.0.4` Note that prereleases in the `0.0.3`
 *   version _only_ will be allowed, if they are greater than or equal to `beta`.
 *   So, `0.0.3-pr.2` would be allowed.
 *
 * When parsing caret ranges, a missing `patch` value desugars to the number `0`,
 * but will allow flexibility within that value, even if the major and minor
 * versions are both `0`.
 *
 * - `^1.2.x` := `>=1.2.0 <2.0.0`
 * - `^0.0.x` := `>=0.0.0 <0.1.0`
 * - `^0.0` := `>=0.0.0 <0.1.0`
 *
 * A missing `minor` and `patch` values will desugar to zero, but also allow
 * flexibility within those values, even if the major version is zero.
 *
 * - `^1.x` := `>=1.0.0 <2.0.0`
 * - `^0.x` := `>=0.0.0 <1.0.0`
 *
 * ### Range Grammar
 *
 * Putting all this together, here is a Backus-Naur grammar for ranges, for the
 * benefit of parser authors:
 *
 * ```bnf
 * range-set  ::= range ( logical-or range ) *
 * logical-or ::= ( " " ) * "||" ( " " ) *
 * range      ::= hyphen | simple ( " " simple ) * | ""
 * hyphen     ::= partial " - " partial
 * simple     ::= primitive | partial | tilde | caret
 * primitive  ::= ( "<" | ">" | ">=" | "<=" | "=" ) partial
 * partial    ::= xr ( "." xr ( "." xr qualifier ? )? )?
 * xr         ::= "x" | "X" | "*" | nr
 * nr         ::= "0" | ["1"-"9"] ( ["0"-"9"] ) *
 * tilde      ::= "~" partial
 * caret      ::= "^" partial
 * qualifier  ::= ( "-" pre )? ( "+" build )?
 * pre        ::= parts
 * build      ::= parts
 * parts      ::= part ( "." part ) *
 * part       ::= nr | [-0-9A-Za-z]+
 * ```
 *
 * Note that, since ranges may be non-contiguous, a version might not be greater
 * than a range, less than a range, _or_ satisfy a range! For example, the range
 * `1.2 <1.2.9 || >2.0.0` would have a hole from `1.2.9` until `2.0.0`, so the
 * version `1.2.10` would not be greater than the range (because `2.0.1` satisfies,
 * which is higher), nor less than the range (since `1.2.8` satisfies, which is
 * lower), and it also does not satisfy the range.
 *
 * If you want to know if a version satisfies or does not satisfy a range, use the
 * {@linkcode satisfies} function.
 *
 *
 *

 *
 * @module
 */ export * from "./compare.ts";
export * from "./constants.ts";
export * from "./difference.ts";
export * from "./format.ts";
export * from "./test_range.ts";
export * from "./satisfies.ts";
export * from "./increment.ts";
export * from "./is_semver.ts";
export * from "./max_satisfying.ts";
export * from "./min_satisfying.ts";
export * from "./parse_range.ts";
export * from "./parse.ts";
export * from "./range_intersects.ts";
export * from "./range_max.ts";
export * from "./range_min.ts";
export * from "./types.ts";
export * from "./try_parse_range.ts";
export * from "./is_range.ts";
export * from "./can_parse.ts";
export * from "./try_parse.ts";
export * from "./format_range.ts";
export * from "./equals.ts";
export * from "./not_equals.ts";
export * from "./greater_than.ts";
export * from "./greater_than_range.ts";
export * from "./greater_or_equal.ts";
export * from "./less_than.ts";
export * from "./less_than_range.ts";
export * from "./less_or_equal.ts";
/** The SemVer spec version */ export const SEMVER_SPEC_VERSION = "2.0.0";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCBJc2FhYyBaLiBTY2hsdWV0ZXIgYW5kIENvbnRyaWJ1dG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gSVNDIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFRoZSBTZW1hbnRpYyBWZXJzaW9uIHBhcnNlci5cbiAqXG4gKiBBZGFwdGVkIGRpcmVjdGx5IGZyb20ge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9ucG0vbm9kZS1zZW12ZXIgfCBzZW12ZXJ9LlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQge1xuICogICBwYXJzZSxcbiAqICAgcGFyc2VSYW5nZSxcbiAqICAgZ3JlYXRlclRoYW4sXG4gKiAgIGxlc3NUaGFuLFxuICogICBmb3JtYXRcbiAqIH0gZnJvbSBcIkBzdGQvc2VtdmVyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHNlbXZlciA9IHBhcnNlKFwiMS4yLjNcIik7XG4gKiBhc3NlcnRFcXVhbHMoc2VtdmVyLCB7XG4gKiAgIG1ham9yOiAxLFxuICogICBtaW5vcjogMixcbiAqICAgcGF0Y2g6IDMsXG4gKiAgIHByZXJlbGVhc2U6IFtdLFxuICogICBidWlsZDogW11cbiAqIH0pO1xuICpcbiAqIGFzc2VydEVxdWFscyhmb3JtYXQoc2VtdmVyKSwgXCIxLjIuM1wiKTtcbiAqXG4gKiBjb25zdCByYW5nZSA9IHBhcnNlUmFuZ2UoXCIxLnggfHwgPj0yLjUuMCB8fCA1LjAuMCAtIDcuMi4zXCIpO1xuICpcbiAqIGNvbnN0IHMwID0gcGFyc2UoXCIxLjIuM1wiKTtcbiAqIGNvbnN0IHMxID0gcGFyc2UoXCI5LjguN1wiKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZ3JlYXRlclRoYW4oczAsIHMxKSwgZmFsc2UpO1xuICogYXNzZXJ0RXF1YWxzKGxlc3NUaGFuKHMwLCBzMSksIHRydWUpO1xuICogYGBgXG4gKlxuICogIyMgVmVyc2lvbnNcbiAqXG4gKiBBIFwidmVyc2lvblwiIGlzIGRlc2NyaWJlZCBieSB0aGUgYHYyLjAuMGAgc3BlY2lmaWNhdGlvbiBmb3VuZCBhdFxuICogPGh0dHBzOi8vc2VtdmVyLm9yZz4uXG4gKlxuICogQSBsZWFkaW5nIGBcIj1cImAgb3IgYFwidlwiYCBjaGFyYWN0ZXIgaXMgc3RyaXBwZWQgb2ZmIGFuZCBpZ25vcmVkLlxuICpcbiAqICMjIEZvcm1hdFxuICpcbiAqIFNlbWFudGljIHZlcnNpb25zIGNhbiBiZSBmb3JtYXR0ZWQgYXMgc3RyaW5ncywgYnkgZGVmYXVsdCB0aGV5XG4gKiBhcmUgZm9ybWF0dGVkIGFzIGBmdWxsYC4gQmVsb3cgaXMgYSBkaWFncmFtIHNob3dpbmcgdGhlIHZhcmlvdXNcbiAqIGZvcm1hdHRpbmcgb3B0aW9ucy5cbiAqXG4gKiBgYGBcbiAqICAgICAgICAgICDilIzilIDilIDilIDilIDilIAgZnVsbFxuICogICAgICAg4pSM4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSQXG4gKiAgICAgICDilJzilIDilIDilIDilIDilIDilIDilIDilIDilIAgcmVsZWFzZVxuICogICDilIzilIDilIDilIDilLTilIDilIDilIDilJAgICDilIJcbiAqICAg4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAIHByaW1hcnlcbiAqIOKUjOKUgOKUtOKUgOKUkCAgICAg4pSCICAg4pSCXG4gKiAxLjIuMy1wcmUuMStiLjFcbiAqIOKUgiDilIIg4pSCIOKUlOKUgOKUrOKUgOKUmCDilJTilKzilJhcbiAqIOKUgiDilIIg4pSCICAg4pSCICAgIOKUlOKUgOKUgCBidWlsZFxuICog4pSCIOKUgiDilIIgICDilJTilIDilIDilIDilIDilIDilIDilIAgcHJlXG4gKiDilIIg4pSCIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgCBwYXRjaFxuICog4pSCIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgCBtaW5vclxuICog4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAIG1ham9yXG4gKiBgYGBcbiAqXG4gKiAjIyBSYW5nZXNcbiAqXG4gKiBBIGB2ZXJzaW9uIHJhbmdlYCBpcyBhIHNldCBvZiBgY29tcGFyYXRvcnNgIHdoaWNoIHNwZWNpZnkgdmVyc2lvbnMgdGhhdCBzYXRpc2Z5XG4gKiB0aGUgcmFuZ2UuXG4gKlxuICogQSBgY29tcGFyYXRvcmAgaXMgY29tcG9zZWQgb2YgYW4gYG9wZXJhdG9yYCBhbmQgYSBgdmVyc2lvbmAuIFRoZSBzZXQgb2ZcbiAqIHByaW1pdGl2ZSBgb3BlcmF0b3JzYCBpczpcbiAqXG4gKiAtIGA8YCBMZXNzIHRoYW5cbiAqIC0gYDw9YCBMZXNzIHRoYW4gb3IgZXF1YWwgdG9cbiAqIC0gYD5gIEdyZWF0ZXIgdGhhblxuICogLSBgPj1gIEdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0b1xuICogLSBgPWAgRXF1YWwuIElmIG5vIG9wZXJhdG9yIGlzIHNwZWNpZmllZCwgdGhlbiBlcXVhbGl0eSBpcyBhc3N1bWVkLCBzbyB0aGlzXG4gKiAgIG9wZXJhdG9yIGlzIG9wdGlvbmFsLCBidXQgTUFZIGJlIGluY2x1ZGVkLlxuICpcbiAqIEZvciBleGFtcGxlLCB0aGUgY29tcGFyYXRvciBgPj0xLjIuN2Agd291bGQgbWF0Y2ggdGhlIHZlcnNpb25zIGAxLjIuN2AsIGAxLjIuOGAsXG4gKiBgMi41LjNgLCBhbmQgYDEuMy45YCwgYnV0IG5vdCB0aGUgdmVyc2lvbnMgYDEuMi42YCBvciBgMS4xLjBgLlxuICpcbiAqIENvbXBhcmF0b3JzIGNhbiBiZSBqb2luZWQgYnkgd2hpdGVzcGFjZSB0byBmb3JtIGEgYGNvbXBhcmF0b3Igc2V0YCwgd2hpY2ggaXNcbiAqIHNhdGlzZmllZCBieSB0aGUgKippbnRlcnNlY3Rpb24qKiBvZiBhbGwgb2YgdGhlIGNvbXBhcmF0b3JzIGl0IGluY2x1ZGVzLlxuICpcbiAqIEEgcmFuZ2UgaXMgY29tcG9zZWQgb2Ygb25lIG9yIG1vcmUgY29tcGFyYXRvciBzZXRzLCBqb2luZWQgYnkgYHx8YC4gQSB2ZXJzaW9uXG4gKiBtYXRjaGVzIGEgcmFuZ2UgaWYgYW5kIG9ubHkgaWYgZXZlcnkgY29tcGFyYXRvciBpbiBhdCBsZWFzdCBvbmUgb2YgdGhlXG4gKiBgfHxgLXNlcGFyYXRlZCBjb21wYXJhdG9yIHNldHMgaXMgc2F0aXNmaWVkIGJ5IHRoZSB2ZXJzaW9uLlxuICpcbiAqIEZvciBleGFtcGxlLCB0aGUgcmFuZ2UgYD49MS4yLjcgPDEuMy4wYCB3b3VsZCBtYXRjaCB0aGUgdmVyc2lvbnMgYDEuMi43YCxcbiAqIGAxLjIuOGAsIGFuZCBgMS4yLjk5YCwgYnV0IG5vdCB0aGUgdmVyc2lvbnMgYDEuMi42YCwgYDEuMy4wYCwgb3IgYDEuMS4wYC5cbiAqXG4gKiBUaGUgcmFuZ2UgYDEuMi43IHx8ID49MS4yLjkgPDIuMC4wYCB3b3VsZCBtYXRjaCB0aGUgdmVyc2lvbnMgYDEuMi43YCwgYDEuMi45YCxcbiAqIGFuZCBgMS40LjZgLCBidXQgbm90IHRoZSB2ZXJzaW9ucyBgMS4yLjhgIG9yIGAyLjAuMGAuXG4gKlxuICogIyMjIFByZXJlbGVhc2UgVGFnc1xuICpcbiAqIElmIGEgdmVyc2lvbiBoYXMgYSBwcmVyZWxlYXNlIHRhZyAoZm9yIGV4YW1wbGUsIGAxLjIuMy1hbHBoYS4zYCkgdGhlbiBpdCB3aWxsXG4gKiBvbmx5IGJlIGFsbG93ZWQgdG8gc2F0aXNmeSBjb21wYXJhdG9yIHNldHMgaWYgYXQgbGVhc3Qgb25lIGNvbXBhcmF0b3Igd2l0aCB0aGVcbiAqIHNhbWUgYFttYWpvciwgbWlub3IsIHBhdGNoXWAgdHVwbGUgYWxzbyBoYXMgYSBwcmVyZWxlYXNlIHRhZy5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgdGhlIHJhbmdlIGA+MS4yLjMtYWxwaGEuM2Agd291bGQgYmUgYWxsb3dlZCB0byBtYXRjaCB0aGUgdmVyc2lvblxuICogYDEuMi4zLWFscGhhLjdgLCBidXQgaXQgd291bGQgX25vdF8gYmUgc2F0aXNmaWVkIGJ5IGAzLjQuNS1hbHBoYS45YCwgZXZlbiB0aG91Z2hcbiAqIGAzLjQuNS1hbHBoYS45YCBpcyB0ZWNobmljYWxseSBcImdyZWF0ZXIgdGhhblwiIGAxLjIuMy1hbHBoYS4zYCBhY2NvcmRpbmcgdG8gdGhlXG4gKiBTZW1WZXIgc29ydCBydWxlcy4gVGhlIHZlcnNpb24gcmFuZ2Ugb25seSBhY2NlcHRzIHByZXJlbGVhc2UgdGFncyBvbiB0aGUgYDEuMi4zYFxuICogdmVyc2lvbi4gVGhlIHZlcnNpb24gYDMuNC41YCBfd291bGRfIHNhdGlzZnkgdGhlIHJhbmdlLCBiZWNhdXNlIGl0IGRvZXMgbm90IGhhdmVcbiAqIGEgcHJlcmVsZWFzZSBmbGFnLCBhbmQgYDMuNC41YCBpcyBncmVhdGVyIHRoYW4gYDEuMi4zLWFscGhhLjdgLlxuICpcbiAqIFRoZSBwdXJwb3NlIGZvciB0aGlzIGJlaGF2aW9yIGlzIHR3b2ZvbGQuIEZpcnN0LCBwcmVyZWxlYXNlIHZlcnNpb25zIGZyZXF1ZW50bHlcbiAqIGFyZSB1cGRhdGVkIHZlcnkgcXVpY2tseSwgYW5kIGNvbnRhaW4gbWFueSBicmVha2luZyBjaGFuZ2VzIHRoYXQgYXJlIChieSB0aGVcbiAqIGF1dGhvclwicyBkZXNpZ24pIG5vdCB5ZXQgZml0IGZvciBwdWJsaWMgY29uc3VtcHRpb24uIFRoZXJlZm9yZSwgYnkgZGVmYXVsdCwgdGhleVxuICogYXJlIGV4Y2x1ZGVkIGZyb20gcmFuZ2UgbWF0Y2hpbmcgc2VtYW50aWNzLlxuICpcbiAqIFNlY29uZCwgYSB1c2VyIHdobyBoYXMgb3B0ZWQgaW50byB1c2luZyBhIHByZXJlbGVhc2UgdmVyc2lvbiBoYXMgY2xlYXJseVxuICogaW5kaWNhdGVkIHRoZSBpbnRlbnQgdG8gdXNlIF90aGF0IHNwZWNpZmljXyBzZXQgb2YgYWxwaGEvYmV0YS9yYyB2ZXJzaW9ucy4gQnlcbiAqIGluY2x1ZGluZyBhIHByZXJlbGVhc2UgdGFnIGluIHRoZSByYW5nZSwgdGhlIHVzZXIgaXMgaW5kaWNhdGluZyB0aGF0IHRoZXkgYXJlXG4gKiBhd2FyZSBvZiB0aGUgcmlzay4gSG93ZXZlciwgaXQgaXMgc3RpbGwgbm90IGFwcHJvcHJpYXRlIHRvIGFzc3VtZSB0aGF0IHRoZXkgaGF2ZVxuICogb3B0ZWQgaW50byB0YWtpbmcgYSBzaW1pbGFyIHJpc2sgb24gdGhlIF9uZXh0XyBzZXQgb2YgcHJlcmVsZWFzZSB2ZXJzaW9ucy5cbiAqXG4gKiAjIyMjIFByZXJlbGVhc2UgSWRlbnRpZmllcnNcbiAqXG4gKiBUaGUgbWV0aG9kIGAuaW5jcmVtZW50YCB0YWtlcyBhbiBhZGRpdGlvbmFsIGBpZGVudGlmaWVyYCBzdHJpbmcgYXJndW1lbnQgdGhhdFxuICogd2lsbCBhcHBlbmQgdGhlIHZhbHVlIG9mIHRoZSBzdHJpbmcgYXMgYSBwcmVyZWxlYXNlIGlkZW50aWZpZXI6XG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogc2VtdmVyLmluY3JlbWVudChwYXJzZShcIjEuMi4zXCIpLCBcInByZXJlbGVhc2VcIiwgXCJiZXRhXCIpO1xuICogLy8gXCIxLjIuNC1iZXRhLjBcIlxuICogYGBgXG4gKlxuICogIyMjIEJ1aWxkIE1ldGFkYXRhXG4gKlxuICogQnVpbGQgbWV0YWRhdGEgaXMgYC5gIGRlbGltaXRlZCBhbHBoYS1udW1lcmljIHN0cmluZy5cbiAqIFdoZW4gcGFyc2luZyBhIHZlcnNpb24gaXQgaXMgcmV0YWluZWQgb24gdGhlIGBidWlsZDogc3RyaW5nW11gIGZpZWxkXG4gKiBvZiB0aGUgU2VtVmVyIGluc3RhbmNlLiBXaGVuIGluY3JlbWVudGluZyB0aGVyZSBpcyBhbiBhZGRpdGlvbmFsIHBhcmFtZXRlciB0aGF0XG4gKiBjYW4gc2V0IHRoZSBidWlsZCBtZXRhZGF0YSBvbiB0aGUgU2VtVmVyIGluc3RhbmNlLlxuICpcbiAqICMjIyBBZHZhbmNlZCBSYW5nZSBTeW50YXhcbiAqXG4gKiBBZHZhbmNlZCByYW5nZSBzeW50YXggZGVzdWdhcnMgdG8gcHJpbWl0aXZlIGNvbXBhcmF0b3JzIGluIGRldGVybWluaXN0aWMgd2F5cy5cbiAqXG4gKiBBZHZhbmNlZCByYW5nZXMgbWF5IGJlIGNvbWJpbmVkIGluIHRoZSBzYW1lIHdheSBhcyBwcmltaXRpdmUgY29tcGFyYXRvcnMgdXNpbmdcbiAqIHdoaXRlIHNwYWNlIG9yIGB8fGAuXG4gKlxuICogIyMjIyBIeXBoZW4gUmFuZ2VzIGBYLlkuWiAtIEEuQi5DYFxuICpcbiAqIFNwZWNpZmllcyBhbiBpbmNsdXNpdmUgc2V0LlxuICpcbiAqIC0gYDEuMi4zIC0gMi4zLjRgIDo9IGA+PTEuMi4zIDw9Mi4zLjRgXG4gKlxuICogSWYgYSBwYXJ0aWFsIHZlcnNpb24gaXMgcHJvdmlkZWQgYXMgdGhlIGZpcnN0IHZlcnNpb24gaW4gdGhlIGluY2x1c2l2ZSByYW5nZSxcbiAqIHRoZW4gdGhlIG1pc3NpbmcgcGllY2VzIGFyZSByZXBsYWNlZCB3aXRoIHplcm9lcy5cbiAqXG4gKiAtIGAxLjIgLSAyLjMuNGAgOj0gYD49MS4yLjAgPD0yLjMuNGBcbiAqXG4gKiBJZiBhIHBhcnRpYWwgdmVyc2lvbiBpcyBwcm92aWRlZCBhcyB0aGUgc2Vjb25kIHZlcnNpb24gaW4gdGhlIGluY2x1c2l2ZSByYW5nZSxcbiAqIHRoZW4gYWxsIHZlcnNpb25zIHRoYXQgc3RhcnQgd2l0aCB0aGUgc3VwcGxpZWQgcGFydHMgb2YgdGhlIHR1cGxlIGFyZSBhY2NlcHRlZCxcbiAqIGJ1dCBub3RoaW5nIHRoYXQgd291bGQgYmUgZ3JlYXRlciB0aGFuIHRoZSBwcm92aWRlZCB0dXBsZSBwYXJ0cy5cbiAqXG4gKiAtIGAxLjIuMyAtIDIuM2AgOj0gYD49MS4yLjMgPDIuNC4wYFxuICogLSBgMS4yLjMgLSAyYCA6PSBgPj0xLjIuMyA8My4wLjBgXG4gKlxuICogIyMjIyBYLVJhbmdlcyBgMS4yLnhgIGAxLlhgIGAxLjIuKmAgYCpgXG4gKlxuICogQW55IG9mIGBYYCwgYHhgLCBvciBgKmAgbWF5IGJlIHVzZWQgdG8gXCJzdGFuZCBpblwiIGZvciBvbmUgb2YgdGhlIG51bWVyaWMgdmFsdWVzXG4gKiBpbiB0aGUgYFttYWpvciwgbWlub3IsIHBhdGNoXWAgdHVwbGUuXG4gKlxuICogLSBgKmAgOj0gYD49MC4wLjBgIChBbnkgdmVyc2lvbiBzYXRpc2ZpZXMpXG4gKiAtIGAxLnhgIDo9IGA+PTEuMC4wIDwyLjAuMGAgKE1hdGNoaW5nIG1ham9yIHZlcnNpb24pXG4gKiAtIGAxLjIueGAgOj0gYD49MS4yLjAgPDEuMy4wYCAoTWF0Y2hpbmcgbWFqb3IgYW5kIG1pbm9yIHZlcnNpb25zKVxuICpcbiAqIEEgcGFydGlhbCB2ZXJzaW9uIHJhbmdlIGlzIHRyZWF0ZWQgYXMgYW4gWC1SYW5nZSwgc28gdGhlIHNwZWNpYWwgY2hhcmFjdGVyIGlzIGluXG4gKiBmYWN0IG9wdGlvbmFsLlxuICpcbiAqIC0gYFwiXCJgIChlbXB0eSBzdHJpbmcpIDo9IGAqYCA6PSBgPj0wLjAuMGBcbiAqIC0gYDFgIDo9IGAxLngueGAgOj0gYD49MS4wLjAgPDIuMC4wYFxuICogLSBgMS4yYCA6PSBgMS4yLnhgIDo9IGA+PTEuMi4wIDwxLjMuMGBcbiAqXG4gKiAjIyMjIFRpbGRlIFJhbmdlcyBgfjEuMi4zYCBgfjEuMmAgYH4xYFxuICpcbiAqIEFsbG93cyBwYXRjaC1sZXZlbCBjaGFuZ2VzIGlmIGEgbWlub3IgdmVyc2lvbiBpcyBzcGVjaWZpZWQgb24gdGhlIGNvbXBhcmF0b3IuXG4gKiBBbGxvd3MgbWlub3ItbGV2ZWwgY2hhbmdlcyBpZiBub3QuXG4gKlxuICogLSBgfjEuMi4zYCA6PSBgPj0xLjIuMyA8MS4oMisxKS4wYCA6PSBgPj0xLjIuMyA8MS4zLjBgXG4gKiAtIGB+MS4yYCA6PSBgPj0xLjIuMCA8MS4oMisxKS4wYCA6PSBgPj0xLjIuMCA8MS4zLjBgIChTYW1lIGFzIGAxLjIueGApXG4gKiAtIGB+MWAgOj0gYD49MS4wLjAgPCgxKzEpLjAuMGAgOj0gYD49MS4wLjAgPDIuMC4wYCAoU2FtZSBhcyBgMS54YClcbiAqIC0gYH4wLjIuM2AgOj0gYD49MC4yLjMgPDAuKDIrMSkuMGAgOj0gYD49MC4yLjMgPDAuMy4wYFxuICogLSBgfjAuMmAgOj0gYD49MC4yLjAgPDAuKDIrMSkuMGAgOj0gYD49MC4yLjAgPDAuMy4wYCAoU2FtZSBhcyBgMC4yLnhgKVxuICogLSBgfjBgIDo9IGA+PTAuMC4wIDwoMCsxKS4wLjBgIDo9IGA+PTAuMC4wIDwxLjAuMGAgKFNhbWUgYXMgYDAueGApXG4gKiAtIGB+MS4yLjMtYmV0YS4yYCA6PSBgPj0xLjIuMy1iZXRhLjIgPDEuMy4wYCBOb3RlIHRoYXQgcHJlcmVsZWFzZXMgaW4gdGhlXG4gKiAgIGAxLjIuM2AgdmVyc2lvbiB3aWxsIGJlIGFsbG93ZWQsIGlmIHRoZXkgYXJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0b1xuICogICBgYmV0YS4yYC4gU28sIGAxLjIuMy1iZXRhLjRgIHdvdWxkIGJlIGFsbG93ZWQsIGJ1dCBgMS4yLjQtYmV0YS4yYCB3b3VsZCBub3QsXG4gKiAgIGJlY2F1c2UgaXQgaXMgYSBwcmVyZWxlYXNlIG9mIGEgZGlmZmVyZW50IGBbbWFqb3IsIG1pbm9yLCBwYXRjaF1gIHR1cGxlLlxuICpcbiAqICMjIyMgQ2FyZXQgUmFuZ2VzIGBeMS4yLjNgIGBeMC4yLjVgIGBeMC4wLjRgXG4gKlxuICogQWxsb3dzIGNoYW5nZXMgdGhhdCBkbyBub3QgbW9kaWZ5IHRoZSBsZWZ0LW1vc3Qgbm9uLXplcm8gZWxlbWVudCBpbiB0aGVcbiAqIGBbbWFqb3IsIG1pbm9yLCBwYXRjaF1gIHR1cGxlLiBJbiBvdGhlciB3b3JkcywgdGhpcyBhbGxvd3MgcGF0Y2ggYW5kIG1pbm9yXG4gKiB1cGRhdGVzIGZvciB2ZXJzaW9ucyBgMS4wLjBgIGFuZCBhYm92ZSwgcGF0Y2ggdXBkYXRlcyBmb3IgdmVyc2lvbnNcbiAqIGAwLlggPj0wLjEuMGAsIGFuZCBfbm9fIHVwZGF0ZXMgZm9yIHZlcnNpb25zIGAwLjAuWGAuXG4gKlxuICogTWFueSBhdXRob3JzIHRyZWF0IGEgYDAueGAgdmVyc2lvbiBhcyBpZiB0aGUgYHhgIHdlcmUgdGhlIG1ham9yXG4gKiBcImJyZWFraW5nLWNoYW5nZVwiIGluZGljYXRvci5cbiAqXG4gKiBDYXJldCByYW5nZXMgYXJlIGlkZWFsIHdoZW4gYW4gYXV0aG9yIG1heSBtYWtlIGJyZWFraW5nIGNoYW5nZXMgYmV0d2VlbiBgMC4yLjRgXG4gKiBhbmQgYDAuMy4wYCByZWxlYXNlcywgd2hpY2ggaXMgYSBjb21tb24gcHJhY3RpY2UuIEhvd2V2ZXIsIGl0IHByZXN1bWVzIHRoYXRcbiAqIHRoZXJlIHdpbGwgX25vdF8gYmUgYnJlYWtpbmcgY2hhbmdlcyBiZXR3ZWVuIGAwLjIuNGAgYW5kIGAwLjIuNWAuIEl0IGFsbG93cyBmb3JcbiAqIGNoYW5nZXMgdGhhdCBhcmUgcHJlc3VtZWQgdG8gYmUgYWRkaXRpdmUgKGJ1dCBub24tYnJlYWtpbmcpLCBhY2NvcmRpbmcgdG9cbiAqIGNvbW1vbmx5IG9ic2VydmVkIHByYWN0aWNlcy5cbiAqXG4gKiAtIGBeMS4yLjNgIDo9IGA+PTEuMi4zIDwyLjAuMGBcbiAqIC0gYF4wLjIuM2AgOj0gYD49MC4yLjMgPDAuMy4wYFxuICogLSBgXjAuMC4zYCA6PSBgPj0wLjAuMyA8MC4wLjRgXG4gKiAtIGBeMS4yLjMtYmV0YS4yYCA6PSBgPj0xLjIuMy1iZXRhLjIgPDIuMC4wYCBOb3RlIHRoYXQgcHJlcmVsZWFzZXMgaW4gdGhlXG4gKiAgIGAxLjIuM2AgdmVyc2lvbiB3aWxsIGJlIGFsbG93ZWQsIGlmIHRoZXkgYXJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0b1xuICogICBgYmV0YS4yYC4gU28sIGAxLjIuMy1iZXRhLjRgIHdvdWxkIGJlIGFsbG93ZWQsIGJ1dCBgMS4yLjQtYmV0YS4yYCB3b3VsZCBub3QsXG4gKiAgIGJlY2F1c2UgaXQgaXMgYSBwcmVyZWxlYXNlIG9mIGEgZGlmZmVyZW50IGBbbWFqb3IsIG1pbm9yLCBwYXRjaF1gIHR1cGxlLlxuICogLSBgXjAuMC4zLWJldGFgIDo9IGA+PTAuMC4zLWJldGEgPDAuMC40YCBOb3RlIHRoYXQgcHJlcmVsZWFzZXMgaW4gdGhlIGAwLjAuM2BcbiAqICAgdmVyc2lvbiBfb25seV8gd2lsbCBiZSBhbGxvd2VkLCBpZiB0aGV5IGFyZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYGJldGFgLlxuICogICBTbywgYDAuMC4zLXByLjJgIHdvdWxkIGJlIGFsbG93ZWQuXG4gKlxuICogV2hlbiBwYXJzaW5nIGNhcmV0IHJhbmdlcywgYSBtaXNzaW5nIGBwYXRjaGAgdmFsdWUgZGVzdWdhcnMgdG8gdGhlIG51bWJlciBgMGAsXG4gKiBidXQgd2lsbCBhbGxvdyBmbGV4aWJpbGl0eSB3aXRoaW4gdGhhdCB2YWx1ZSwgZXZlbiBpZiB0aGUgbWFqb3IgYW5kIG1pbm9yXG4gKiB2ZXJzaW9ucyBhcmUgYm90aCBgMGAuXG4gKlxuICogLSBgXjEuMi54YCA6PSBgPj0xLjIuMCA8Mi4wLjBgXG4gKiAtIGBeMC4wLnhgIDo9IGA+PTAuMC4wIDwwLjEuMGBcbiAqIC0gYF4wLjBgIDo9IGA+PTAuMC4wIDwwLjEuMGBcbiAqXG4gKiBBIG1pc3NpbmcgYG1pbm9yYCBhbmQgYHBhdGNoYCB2YWx1ZXMgd2lsbCBkZXN1Z2FyIHRvIHplcm8sIGJ1dCBhbHNvIGFsbG93XG4gKiBmbGV4aWJpbGl0eSB3aXRoaW4gdGhvc2UgdmFsdWVzLCBldmVuIGlmIHRoZSBtYWpvciB2ZXJzaW9uIGlzIHplcm8uXG4gKlxuICogLSBgXjEueGAgOj0gYD49MS4wLjAgPDIuMC4wYFxuICogLSBgXjAueGAgOj0gYD49MC4wLjAgPDEuMC4wYFxuICpcbiAqICMjIyBSYW5nZSBHcmFtbWFyXG4gKlxuICogUHV0dGluZyBhbGwgdGhpcyB0b2dldGhlciwgaGVyZSBpcyBhIEJhY2t1cy1OYXVyIGdyYW1tYXIgZm9yIHJhbmdlcywgZm9yIHRoZVxuICogYmVuZWZpdCBvZiBwYXJzZXIgYXV0aG9yczpcbiAqXG4gKiBgYGBibmZcbiAqIHJhbmdlLXNldCAgOjo9IHJhbmdlICggbG9naWNhbC1vciByYW5nZSApICpcbiAqIGxvZ2ljYWwtb3IgOjo9ICggXCIgXCIgKSAqIFwifHxcIiAoIFwiIFwiICkgKlxuICogcmFuZ2UgICAgICA6Oj0gaHlwaGVuIHwgc2ltcGxlICggXCIgXCIgc2ltcGxlICkgKiB8IFwiXCJcbiAqIGh5cGhlbiAgICAgOjo9IHBhcnRpYWwgXCIgLSBcIiBwYXJ0aWFsXG4gKiBzaW1wbGUgICAgIDo6PSBwcmltaXRpdmUgfCBwYXJ0aWFsIHwgdGlsZGUgfCBjYXJldFxuICogcHJpbWl0aXZlICA6Oj0gKCBcIjxcIiB8IFwiPlwiIHwgXCI+PVwiIHwgXCI8PVwiIHwgXCI9XCIgKSBwYXJ0aWFsXG4gKiBwYXJ0aWFsICAgIDo6PSB4ciAoIFwiLlwiIHhyICggXCIuXCIgeHIgcXVhbGlmaWVyID8gKT8gKT9cbiAqIHhyICAgICAgICAgOjo9IFwieFwiIHwgXCJYXCIgfCBcIipcIiB8IG5yXG4gKiBuciAgICAgICAgIDo6PSBcIjBcIiB8IFtcIjFcIi1cIjlcIl0gKCBbXCIwXCItXCI5XCJdICkgKlxuICogdGlsZGUgICAgICA6Oj0gXCJ+XCIgcGFydGlhbFxuICogY2FyZXQgICAgICA6Oj0gXCJeXCIgcGFydGlhbFxuICogcXVhbGlmaWVyICA6Oj0gKCBcIi1cIiBwcmUgKT8gKCBcIitcIiBidWlsZCApP1xuICogcHJlICAgICAgICA6Oj0gcGFydHNcbiAqIGJ1aWxkICAgICAgOjo9IHBhcnRzXG4gKiBwYXJ0cyAgICAgIDo6PSBwYXJ0ICggXCIuXCIgcGFydCApICpcbiAqIHBhcnQgICAgICAgOjo9IG5yIHwgWy0wLTlBLVphLXpdK1xuICogYGBgXG4gKlxuICogTm90ZSB0aGF0LCBzaW5jZSByYW5nZXMgbWF5IGJlIG5vbi1jb250aWd1b3VzLCBhIHZlcnNpb24gbWlnaHQgbm90IGJlIGdyZWF0ZXJcbiAqIHRoYW4gYSByYW5nZSwgbGVzcyB0aGFuIGEgcmFuZ2UsIF9vcl8gc2F0aXNmeSBhIHJhbmdlISBGb3IgZXhhbXBsZSwgdGhlIHJhbmdlXG4gKiBgMS4yIDwxLjIuOSB8fCA+Mi4wLjBgIHdvdWxkIGhhdmUgYSBob2xlIGZyb20gYDEuMi45YCB1bnRpbCBgMi4wLjBgLCBzbyB0aGVcbiAqIHZlcnNpb24gYDEuMi4xMGAgd291bGQgbm90IGJlIGdyZWF0ZXIgdGhhbiB0aGUgcmFuZ2UgKGJlY2F1c2UgYDIuMC4xYCBzYXRpc2ZpZXMsXG4gKiB3aGljaCBpcyBoaWdoZXIpLCBub3IgbGVzcyB0aGFuIHRoZSByYW5nZSAoc2luY2UgYDEuMi44YCBzYXRpc2ZpZXMsIHdoaWNoIGlzXG4gKiBsb3dlciksIGFuZCBpdCBhbHNvIGRvZXMgbm90IHNhdGlzZnkgdGhlIHJhbmdlLlxuICpcbiAqIElmIHlvdSB3YW50IHRvIGtub3cgaWYgYSB2ZXJzaW9uIHNhdGlzZmllcyBvciBkb2VzIG5vdCBzYXRpc2Z5IGEgcmFuZ2UsIHVzZSB0aGVcbiAqIHtAbGlua2NvZGUgc2F0aXNmaWVzfSBmdW5jdGlvbi5cbiAqXG4gKlxuICpcblxuICpcbiAqIEBtb2R1bGVcbiAqL1xuZXhwb3J0ICogZnJvbSBcIi4vY29tcGFyZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vY29uc3RhbnRzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9kaWZmZXJlbmNlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9mb3JtYXQudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3Rlc3RfcmFuZ2UudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3NhdGlzZmllcy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaW5jcmVtZW50LnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9pc19zZW12ZXIudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL21heF9zYXRpc2Z5aW5nLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9taW5fc2F0aXNmeWluZy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcGFyc2VfcmFuZ2UudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3BhcnNlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9yYW5nZV9pbnRlcnNlY3RzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9yYW5nZV9tYXgudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3JhbmdlX21pbi50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdHlwZXMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3RyeV9wYXJzZV9yYW5nZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaXNfcmFuZ2UudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2Nhbl9wYXJzZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdHJ5X3BhcnNlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9mb3JtYXRfcmFuZ2UudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2VxdWFscy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbm90X2VxdWFscy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZ3JlYXRlcl90aGFuLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9ncmVhdGVyX3RoYW5fcmFuZ2UudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2dyZWF0ZXJfb3JfZXF1YWwudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2xlc3NfdGhhbi50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbGVzc190aGFuX3JhbmdlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9sZXNzX29yX2VxdWFsLnRzXCI7XG5cbi8qKiBUaGUgU2VtVmVyIHNwZWMgdmVyc2lvbiAqL1xuZXhwb3J0IGNvbnN0IFNFTVZFUl9TUEVDX1ZFUlNJT04gPSBcIjIuMC4wXCI7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsbUZBQW1GO0FBQ25GLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWlSQyxHQUNELGNBQWMsZUFBZTtBQUM3QixjQUFjLGlCQUFpQjtBQUMvQixjQUFjLGtCQUFrQjtBQUNoQyxjQUFjLGNBQWM7QUFDNUIsY0FBYyxrQkFBa0I7QUFDaEMsY0FBYyxpQkFBaUI7QUFDL0IsY0FBYyxpQkFBaUI7QUFDL0IsY0FBYyxpQkFBaUI7QUFDL0IsY0FBYyxzQkFBc0I7QUFDcEMsY0FBYyxzQkFBc0I7QUFDcEMsY0FBYyxtQkFBbUI7QUFDakMsY0FBYyxhQUFhO0FBQzNCLGNBQWMsd0JBQXdCO0FBQ3RDLGNBQWMsaUJBQWlCO0FBQy9CLGNBQWMsaUJBQWlCO0FBQy9CLGNBQWMsYUFBYTtBQUMzQixjQUFjLHVCQUF1QjtBQUNyQyxjQUFjLGdCQUFnQjtBQUM5QixjQUFjLGlCQUFpQjtBQUMvQixjQUFjLGlCQUFpQjtBQUMvQixjQUFjLG9CQUFvQjtBQUNsQyxjQUFjLGNBQWM7QUFDNUIsY0FBYyxrQkFBa0I7QUFDaEMsY0FBYyxvQkFBb0I7QUFDbEMsY0FBYywwQkFBMEI7QUFDeEMsY0FBYyx3QkFBd0I7QUFDdEMsY0FBYyxpQkFBaUI7QUFDL0IsY0FBYyx1QkFBdUI7QUFDckMsY0FBYyxxQkFBcUI7QUFFbkMsNEJBQTRCLEdBQzVCLE9BQU8sTUFBTSxzQkFBc0IsUUFBUSJ9
// denoCacheMetadata=6793997152955785476,3921467404113320543