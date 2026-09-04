// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * MAX is a sentinel value used by some range calculations.
 * It is equivalent to `∞.∞.∞`.
 */ export const MAX = {
  major: Number.POSITIVE_INFINITY,
  minor: Number.POSITIVE_INFINITY,
  patch: Number.POSITIVE_INFINITY,
  prerelease: [],
  build: []
};
/**
 * The minimum valid SemVer object. Equivalent to `0.0.0`.
 */ export const MIN = {
  major: 0,
  minor: 0,
  patch: 0,
  prerelease: [],
  build: []
};
/**
 * A sentinel value used to denote an invalid SemVer object
 * which may be the result of impossible ranges or comparator operations.
 * @example
 * ```ts
 * import { equals } from "@std/semver/equals";
 * import { parse } from "@std/semver/parse";
 * import { INVALID } from "@std/semver/constants"
 * equals(parse("1.2.3"), INVALID);
 * ```
 */ export const INVALID = {
  major: Number.NEGATIVE_INFINITY,
  minor: Number.POSITIVE_INFINITY,
  patch: Number.POSITIVE_INFINITY,
  prerelease: [],
  build: []
};
/**
 * ANY is a sentinel value used by some range calculations. It is not a valid
 * SemVer object and should not be used directly.
 * @example
 * ```ts
 * import { equals } from "@std/semver/equals";
 * import { parse } from "@std/semver/parse";
 * import { ANY } from "@std/semver/constants"
 * equals(parse("1.2.3"), ANY); // false
 * ```
 */ export const ANY = {
  major: Number.NaN,
  minor: Number.NaN,
  patch: Number.NaN,
  prerelease: [],
  build: []
};
/**
 * A comparator which will span all valid semantic versions
 */ export const ALL = {
  operator: undefined,
  ...ANY
};
/**
 * A comparator which will not span any semantic versions
 */ export const NONE = {
  operator: "<",
  ...MIN
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvY29uc3RhbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgdHlwZSB7IENvbXBhcmF0b3IsIFNlbVZlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5cbi8qKlxuICogTUFYIGlzIGEgc2VudGluZWwgdmFsdWUgdXNlZCBieSBzb21lIHJhbmdlIGNhbGN1bGF0aW9ucy5cbiAqIEl0IGlzIGVxdWl2YWxlbnQgdG8gYOKIni7iiJ4u4oieYC5cbiAqL1xuZXhwb3J0IGNvbnN0IE1BWDogU2VtVmVyID0ge1xuICBtYWpvcjogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICBtaW5vcjogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICBwYXRjaDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICBwcmVyZWxlYXNlOiBbXSxcbiAgYnVpbGQ6IFtdLFxufTtcblxuLyoqXG4gKiBUaGUgbWluaW11bSB2YWxpZCBTZW1WZXIgb2JqZWN0LiBFcXVpdmFsZW50IHRvIGAwLjAuMGAuXG4gKi9cbmV4cG9ydCBjb25zdCBNSU46IFNlbVZlciA9IHtcbiAgbWFqb3I6IDAsXG4gIG1pbm9yOiAwLFxuICBwYXRjaDogMCxcbiAgcHJlcmVsZWFzZTogW10sXG4gIGJ1aWxkOiBbXSxcbn07XG5cbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB1c2VkIHRvIGRlbm90ZSBhbiBpbnZhbGlkIFNlbVZlciBvYmplY3RcbiAqIHdoaWNoIG1heSBiZSB0aGUgcmVzdWx0IG9mIGltcG9zc2libGUgcmFuZ2VzIG9yIGNvbXBhcmF0b3Igb3BlcmF0aW9ucy5cbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZXF1YWxzIH0gZnJvbSBcIkBzdGQvc2VtdmVyL2VxdWFsc1wiO1xuICogaW1wb3J0IHsgcGFyc2UgfSBmcm9tIFwiQHN0ZC9zZW12ZXIvcGFyc2VcIjtcbiAqIGltcG9ydCB7IElOVkFMSUQgfSBmcm9tIFwiQHN0ZC9zZW12ZXIvY29uc3RhbnRzXCJcbiAqIGVxdWFscyhwYXJzZShcIjEuMi4zXCIpLCBJTlZBTElEKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgSU5WQUxJRDogU2VtVmVyID0ge1xuICBtYWpvcjogTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLFxuICBtaW5vcjogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICBwYXRjaDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICBwcmVyZWxlYXNlOiBbXSxcbiAgYnVpbGQ6IFtdLFxufTtcblxuLyoqXG4gKiBBTlkgaXMgYSBzZW50aW5lbCB2YWx1ZSB1c2VkIGJ5IHNvbWUgcmFuZ2UgY2FsY3VsYXRpb25zLiBJdCBpcyBub3QgYSB2YWxpZFxuICogU2VtVmVyIG9iamVjdCBhbmQgc2hvdWxkIG5vdCBiZSB1c2VkIGRpcmVjdGx5LlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlcXVhbHMgfSBmcm9tIFwiQHN0ZC9zZW12ZXIvZXF1YWxzXCI7XG4gKiBpbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJAc3RkL3NlbXZlci9wYXJzZVwiO1xuICogaW1wb3J0IHsgQU5ZIH0gZnJvbSBcIkBzdGQvc2VtdmVyL2NvbnN0YW50c1wiXG4gKiBlcXVhbHMocGFyc2UoXCIxLjIuM1wiKSwgQU5ZKTsgLy8gZmFsc2VcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgQU5ZOiBTZW1WZXIgPSB7XG4gIG1ham9yOiBOdW1iZXIuTmFOLFxuICBtaW5vcjogTnVtYmVyLk5hTixcbiAgcGF0Y2g6IE51bWJlci5OYU4sXG4gIHByZXJlbGVhc2U6IFtdLFxuICBidWlsZDogW10sXG59O1xuXG4vKipcbiAqIEEgY29tcGFyYXRvciB3aGljaCB3aWxsIHNwYW4gYWxsIHZhbGlkIHNlbWFudGljIHZlcnNpb25zXG4gKi9cbmV4cG9ydCBjb25zdCBBTEw6IENvbXBhcmF0b3IgPSB7XG4gIG9wZXJhdG9yOiB1bmRlZmluZWQsXG4gIC4uLkFOWSxcbn07XG5cbi8qKlxuICogQSBjb21wYXJhdG9yIHdoaWNoIHdpbGwgbm90IHNwYW4gYW55IHNlbWFudGljIHZlcnNpb25zXG4gKi9cbmV4cG9ydCBjb25zdCBOT05FOiBDb21wYXJhdG9yID0ge1xuICBvcGVyYXRvcjogXCI8XCIsXG4gIC4uLk1JTixcbn07XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUdyQzs7O0NBR0MsR0FDRCxPQUFPLE1BQU0sTUFBYztFQUN6QixPQUFPLE9BQU8saUJBQWlCO0VBQy9CLE9BQU8sT0FBTyxpQkFBaUI7RUFDL0IsT0FBTyxPQUFPLGlCQUFpQjtFQUMvQixZQUFZLEVBQUU7RUFDZCxPQUFPLEVBQUU7QUFDWCxFQUFFO0FBRUY7O0NBRUMsR0FDRCxPQUFPLE1BQU0sTUFBYztFQUN6QixPQUFPO0VBQ1AsT0FBTztFQUNQLE9BQU87RUFDUCxZQUFZLEVBQUU7RUFDZCxPQUFPLEVBQUU7QUFDWCxFQUFFO0FBRUY7Ozs7Ozs7Ozs7Q0FVQyxHQUNELE9BQU8sTUFBTSxVQUFrQjtFQUM3QixPQUFPLE9BQU8saUJBQWlCO0VBQy9CLE9BQU8sT0FBTyxpQkFBaUI7RUFDL0IsT0FBTyxPQUFPLGlCQUFpQjtFQUMvQixZQUFZLEVBQUU7RUFDZCxPQUFPLEVBQUU7QUFDWCxFQUFFO0FBRUY7Ozs7Ozs7Ozs7Q0FVQyxHQUNELE9BQU8sTUFBTSxNQUFjO0VBQ3pCLE9BQU8sT0FBTyxHQUFHO0VBQ2pCLE9BQU8sT0FBTyxHQUFHO0VBQ2pCLE9BQU8sT0FBTyxHQUFHO0VBQ2pCLFlBQVksRUFBRTtFQUNkLE9BQU8sRUFBRTtBQUNYLEVBQUU7QUFFRjs7Q0FFQyxHQUNELE9BQU8sTUFBTSxNQUFrQjtFQUM3QixVQUFVO0VBQ1YsR0FBRyxHQUFHO0FBQ1IsRUFBRTtBQUVGOztDQUVDLEdBQ0QsT0FBTyxNQUFNLE9BQW1CO0VBQzlCLFVBQVU7RUFDVixHQUFHLEdBQUc7QUFDUixFQUFFIn0=
// denoCacheMetadata=9040691919287369013,6981289249470400086