// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { checkIdentifier, compareIdentifier, compareNumber } from "./_shared.ts";
/**
 * Compare two semantic version objects.
 *
 * Returns `0` if `s0 === s1`, or `1` if `s0` is greater, or `-1` if `s1` is
 * greater.
 *
 * Sorts in ascending order if passed to `Array.sort()`,
 *
 * @example Usage
 * ```ts
 * import { parse, compare } from "@std/semver";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const s0 = parse("1.2.3");
 * const s1 = parse("1.2.4");
 *
 * assertEquals(compare(s0, s1), -1);
 * assertEquals(compare(s1, s0), 1);
 * assertEquals(compare(s0, s0), 0);
 * ```
 *
 * @param s0 The first SemVer to compare
 * @param s1 The second SemVer to compare
 * @returns `1` if `s0` is greater, `0` if equal, or `-1` if `s1` is greater
 */ export function compare(s0, s1) {
  if (s0 === s1) return 0;
  return compareNumber(s0.major, s1.major) || compareNumber(s0.minor, s1.minor) || compareNumber(s0.patch, s1.patch) || checkIdentifier(s0.prerelease, s1.prerelease) || compareIdentifier(s0.prerelease, s1.prerelease);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvY29tcGFyZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHR5cGUgeyBTZW1WZXIgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHtcbiAgY2hlY2tJZGVudGlmaWVyLFxuICBjb21wYXJlSWRlbnRpZmllcixcbiAgY29tcGFyZU51bWJlcixcbn0gZnJvbSBcIi4vX3NoYXJlZC50c1wiO1xuXG4vKipcbiAqIENvbXBhcmUgdHdvIHNlbWFudGljIHZlcnNpb24gb2JqZWN0cy5cbiAqXG4gKiBSZXR1cm5zIGAwYCBpZiBgczAgPT09IHMxYCwgb3IgYDFgIGlmIGBzMGAgaXMgZ3JlYXRlciwgb3IgYC0xYCBpZiBgczFgIGlzXG4gKiBncmVhdGVyLlxuICpcbiAqIFNvcnRzIGluIGFzY2VuZGluZyBvcmRlciBpZiBwYXNzZWQgdG8gYEFycmF5LnNvcnQoKWAsXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZSwgY29tcGFyZSB9IGZyb20gXCJAc3RkL3NlbXZlclwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzMCA9IHBhcnNlKFwiMS4yLjNcIik7XG4gKiBjb25zdCBzMSA9IHBhcnNlKFwiMS4yLjRcIik7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGNvbXBhcmUoczAsIHMxKSwgLTEpO1xuICogYXNzZXJ0RXF1YWxzKGNvbXBhcmUoczEsIHMwKSwgMSk7XG4gKiBhc3NlcnRFcXVhbHMoY29tcGFyZShzMCwgczApLCAwKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzMCBUaGUgZmlyc3QgU2VtVmVyIHRvIGNvbXBhcmVcbiAqIEBwYXJhbSBzMSBUaGUgc2Vjb25kIFNlbVZlciB0byBjb21wYXJlXG4gKiBAcmV0dXJucyBgMWAgaWYgYHMwYCBpcyBncmVhdGVyLCBgMGAgaWYgZXF1YWwsIG9yIGAtMWAgaWYgYHMxYCBpcyBncmVhdGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlKFxuICBzMDogU2VtVmVyLFxuICBzMTogU2VtVmVyLFxuKTogMSB8IDAgfCAtMSB7XG4gIGlmIChzMCA9PT0gczEpIHJldHVybiAwO1xuICByZXR1cm4gKFxuICAgIGNvbXBhcmVOdW1iZXIoczAubWFqb3IsIHMxLm1ham9yKSB8fFxuICAgIGNvbXBhcmVOdW1iZXIoczAubWlub3IsIHMxLm1pbm9yKSB8fFxuICAgIGNvbXBhcmVOdW1iZXIoczAucGF0Y2gsIHMxLnBhdGNoKSB8fFxuICAgIGNoZWNrSWRlbnRpZmllcihzMC5wcmVyZWxlYXNlLCBzMS5wcmVyZWxlYXNlKSB8fFxuICAgIGNvbXBhcmVJZGVudGlmaWVyKHMwLnByZXJlbGVhc2UsIHMxLnByZXJlbGVhc2UpXG4gICk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUNFLGVBQWUsRUFDZixpQkFBaUIsRUFDakIsYUFBYSxRQUNSLGVBQWU7QUFFdEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCQyxHQUNELE9BQU8sU0FBUyxRQUNkLEVBQVUsRUFDVixFQUFVO0VBRVYsSUFBSSxPQUFPLElBQUksT0FBTztFQUN0QixPQUNFLGNBQWMsR0FBRyxLQUFLLEVBQUUsR0FBRyxLQUFLLEtBQ2hDLGNBQWMsR0FBRyxLQUFLLEVBQUUsR0FBRyxLQUFLLEtBQ2hDLGNBQWMsR0FBRyxLQUFLLEVBQUUsR0FBRyxLQUFLLEtBQ2hDLGdCQUFnQixHQUFHLFVBQVUsRUFBRSxHQUFHLFVBQVUsS0FDNUMsa0JBQWtCLEdBQUcsVUFBVSxFQUFFLEdBQUcsVUFBVTtBQUVsRCJ9
// denoCacheMetadata=10882463946872811689,12995862439823194818