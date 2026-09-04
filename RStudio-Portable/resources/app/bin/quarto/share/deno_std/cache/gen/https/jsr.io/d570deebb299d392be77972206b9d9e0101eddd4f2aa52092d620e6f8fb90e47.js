// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { format } from "./format.ts";
function formatComparator(comparator) {
  const { operator } = comparator;
  return `${operator === undefined ? "" : operator}${format(comparator)}`;
}
/**
 * Formats the range into a string
 * @example Usage
 * ```ts
 * import { formatRange, parseRange } from "@std/semver";
 * import { assertEquals } from "@std/assert";
 *
 * const range = parseRange(">=1.2.3 <1.2.4");
 * assertEquals(formatRange(range), ">=1.2.3 <1.2.4");
 * ```
 *
 * @param range The range to format
 * @returns A string representation of the range
 */ export function formatRange(range) {
  return range.map((c)=>c.map((c)=>formatComparator(c)).join(" ")).join("||");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvZm9ybWF0X3JhbmdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBmb3JtYXQgfSBmcm9tIFwiLi9mb3JtYXQudHNcIjtcbmltcG9ydCB0eXBlIHsgQ29tcGFyYXRvciwgUmFuZ2UgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuXG5mdW5jdGlvbiBmb3JtYXRDb21wYXJhdG9yKGNvbXBhcmF0b3I6IENvbXBhcmF0b3IpOiBzdHJpbmcge1xuICBjb25zdCB7IG9wZXJhdG9yIH0gPSBjb21wYXJhdG9yO1xuICByZXR1cm4gYCR7b3BlcmF0b3IgPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBvcGVyYXRvcn0ke2Zvcm1hdChjb21wYXJhdG9yKX1gO1xufVxuXG4vKipcbiAqIEZvcm1hdHMgdGhlIHJhbmdlIGludG8gYSBzdHJpbmdcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZm9ybWF0UmFuZ2UsIHBhcnNlUmFuZ2UgfSBmcm9tIFwiQHN0ZC9zZW12ZXJcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHJhbmdlID0gcGFyc2VSYW5nZShcIj49MS4yLjMgPDEuMi40XCIpO1xuICogYXNzZXJ0RXF1YWxzKGZvcm1hdFJhbmdlKHJhbmdlKSwgXCI+PTEuMi4zIDwxLjIuNFwiKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSByYW5nZSBUaGUgcmFuZ2UgdG8gZm9ybWF0XG4gKiBAcmV0dXJucyBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgcmFuZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFJhbmdlKHJhbmdlOiBSYW5nZSk6IHN0cmluZyB7XG4gIHJldHVybiByYW5nZS5tYXAoKGMpID0+IGMubWFwKChjKSA9PiBmb3JtYXRDb21wYXJhdG9yKGMpKS5qb2luKFwiIFwiKSlcbiAgICAuam9pbihcInx8XCIpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsU0FBUyxNQUFNLFFBQVEsY0FBYztBQUdyQyxTQUFTLGlCQUFpQixVQUFzQjtFQUM5QyxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDckIsT0FBTyxHQUFHLGFBQWEsWUFBWSxLQUFLLFdBQVcsT0FBTyxhQUFhO0FBQ3pFO0FBRUE7Ozs7Ozs7Ozs7Ozs7Q0FhQyxHQUNELE9BQU8sU0FBUyxZQUFZLEtBQVk7RUFDdEMsT0FBTyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFNLGlCQUFpQixJQUFJLElBQUksQ0FBQyxNQUM1RCxJQUFJLENBQUM7QUFDViJ9
// denoCacheMetadata=5660234986141644100,14437050228325754416