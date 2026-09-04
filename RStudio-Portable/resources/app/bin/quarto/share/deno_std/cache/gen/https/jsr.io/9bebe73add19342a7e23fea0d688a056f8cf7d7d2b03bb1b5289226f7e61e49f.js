// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { compareIdentifier } from "./_shared.ts";
/**
 * Returns difference between two versions by the release type,
 * or `undefined` if the versions are the same.
 *
 * @example Usage
 * ```ts
 * import { parse, difference } from "@std/semver";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const s0 = parse("1.2.3");
 * const s1 = parse("1.2.4");
 * const s2 = parse("1.3.0");
 * const s3 = parse("2.0.0");
 *
 * assertEquals(difference(s0, s1), "patch");
 * assertEquals(difference(s0, s2), "minor");
 * assertEquals(difference(s0, s3), "major");
 * assertEquals(difference(s0, s0), undefined);
 * ```
 *
 * @param s0 The first SemVer to compare
 * @param s1 The second SemVer to compare
 * @returns The release type difference or `undefined` if the versions are the same
 */ export function difference(s0, s1) {
  const hasPrerelease = s0.prerelease?.length || s1.prerelease?.length;
  if (s0.major !== s1.major) return hasPrerelease ? "premajor" : "major";
  if (s0.minor !== s1.minor) return hasPrerelease ? "preminor" : "minor";
  if (s0.patch !== s1.patch) return hasPrerelease ? "prepatch" : "patch";
  if (compareIdentifier(s0.prerelease, s1.prerelease) !== 0) {
    return "prerelease";
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvZGlmZmVyZW5jZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHR5cGUgeyBSZWxlYXNlVHlwZSwgU2VtVmVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IGNvbXBhcmVJZGVudGlmaWVyIH0gZnJvbSBcIi4vX3NoYXJlZC50c1wiO1xuXG4vKipcbiAqIFJldHVybnMgZGlmZmVyZW5jZSBiZXR3ZWVuIHR3byB2ZXJzaW9ucyBieSB0aGUgcmVsZWFzZSB0eXBlLFxuICogb3IgYHVuZGVmaW5lZGAgaWYgdGhlIHZlcnNpb25zIGFyZSB0aGUgc2FtZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlLCBkaWZmZXJlbmNlIH0gZnJvbSBcIkBzdGQvc2VtdmVyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHMwID0gcGFyc2UoXCIxLjIuM1wiKTtcbiAqIGNvbnN0IHMxID0gcGFyc2UoXCIxLjIuNFwiKTtcbiAqIGNvbnN0IHMyID0gcGFyc2UoXCIxLjMuMFwiKTtcbiAqIGNvbnN0IHMzID0gcGFyc2UoXCIyLjAuMFwiKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZGlmZmVyZW5jZShzMCwgczEpLCBcInBhdGNoXCIpO1xuICogYXNzZXJ0RXF1YWxzKGRpZmZlcmVuY2UoczAsIHMyKSwgXCJtaW5vclwiKTtcbiAqIGFzc2VydEVxdWFscyhkaWZmZXJlbmNlKHMwLCBzMyksIFwibWFqb3JcIik7XG4gKiBhc3NlcnRFcXVhbHMoZGlmZmVyZW5jZShzMCwgczApLCB1bmRlZmluZWQpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHMwIFRoZSBmaXJzdCBTZW1WZXIgdG8gY29tcGFyZVxuICogQHBhcmFtIHMxIFRoZSBzZWNvbmQgU2VtVmVyIHRvIGNvbXBhcmVcbiAqIEByZXR1cm5zIFRoZSByZWxlYXNlIHR5cGUgZGlmZmVyZW5jZSBvciBgdW5kZWZpbmVkYCBpZiB0aGUgdmVyc2lvbnMgYXJlIHRoZSBzYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaWZmZXJlbmNlKHMwOiBTZW1WZXIsIHMxOiBTZW1WZXIpOiBSZWxlYXNlVHlwZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGhhc1ByZXJlbGVhc2UgPSBzMC5wcmVyZWxlYXNlPy5sZW5ndGggfHwgczEucHJlcmVsZWFzZT8ubGVuZ3RoO1xuXG4gIGlmIChzMC5tYWpvciAhPT0gczEubWFqb3IpIHJldHVybiBoYXNQcmVyZWxlYXNlID8gXCJwcmVtYWpvclwiIDogXCJtYWpvclwiO1xuICBpZiAoczAubWlub3IgIT09IHMxLm1pbm9yKSByZXR1cm4gaGFzUHJlcmVsZWFzZSA/IFwicHJlbWlub3JcIiA6IFwibWlub3JcIjtcbiAgaWYgKHMwLnBhdGNoICE9PSBzMS5wYXRjaCkgcmV0dXJuIGhhc1ByZXJlbGVhc2UgPyBcInByZXBhdGNoXCIgOiBcInBhdGNoXCI7XG5cbiAgaWYgKGNvbXBhcmVJZGVudGlmaWVyKHMwLnByZXJlbGVhc2UsIHMxLnByZXJlbGVhc2UpICE9PSAwKSB7XG4gICAgcmV0dXJuIFwicHJlcmVsZWFzZVwiO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLGlCQUFpQixRQUFRLGVBQWU7QUFFakQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJDLEdBQ0QsT0FBTyxTQUFTLFdBQVcsRUFBVSxFQUFFLEVBQVU7RUFDL0MsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLEVBQUUsVUFBVSxHQUFHLFVBQVUsRUFBRTtFQUU5RCxJQUFJLEdBQUcsS0FBSyxLQUFLLEdBQUcsS0FBSyxFQUFFLE9BQU8sZ0JBQWdCLGFBQWE7RUFDL0QsSUFBSSxHQUFHLEtBQUssS0FBSyxHQUFHLEtBQUssRUFBRSxPQUFPLGdCQUFnQixhQUFhO0VBQy9ELElBQUksR0FBRyxLQUFLLEtBQUssR0FBRyxLQUFLLEVBQUUsT0FBTyxnQkFBZ0IsYUFBYTtFQUUvRCxJQUFJLGtCQUFrQixHQUFHLFVBQVUsRUFBRSxHQUFHLFVBQVUsTUFBTSxHQUFHO0lBQ3pELE9BQU87RUFDVDtBQUNGIn0=
// denoCacheMetadata=4407217859158485762,17596702160840694013