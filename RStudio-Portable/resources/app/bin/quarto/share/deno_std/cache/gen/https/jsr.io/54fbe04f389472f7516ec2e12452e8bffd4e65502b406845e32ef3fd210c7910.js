// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { testComparatorSet } from "./_test_comparator_set.ts";
import { isWildcardComparator } from "./_shared.ts";
import { compare } from "./compare.ts";
/**
 * Check if the SemVer is less than the range.
 *
 * @example Usage
 * ```ts
 * import { parse, parseRange, lessThanRange } from "@std/semver";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const v0 = parse("1.2.3");
 * const v1 = parse("1.0.0");
 * const range = parseRange(">=1.2.3 <1.2.4");
 * assertFalse(lessThanRange(v0, range));
 * assert(lessThanRange(v1, range));
 * ```
 *
 * @param semver The version to check.
 * @param range The range to check against.
 * @returns `true` if the SemVer is less than the range, `false` otherwise.
 */ export function lessThanRange(semver, range) {
  return range.every((comparatorSet)=>lessThanComparatorSet(semver, comparatorSet));
}
function lessThanComparatorSet(semver, comparatorSet) {
  // If the comparator set contains wildcard, then the semver is not greater than the range.
  if (comparatorSet.some(isWildcardComparator)) return false;
  // If the SemVer satisfies the comparator set, then it's not less than the range.
  if (testComparatorSet(semver, comparatorSet)) return false;
  // If the SemVer is greater than any of the comparator set, then it's not less than the range.
  if (comparatorSet.some((comparator)=>greaterThanComparator(semver, comparator))) return false;
  return true;
}
function greaterThanComparator(semver, comparator) {
  const cmp = compare(semver, comparator);
  switch(comparator.operator){
    case "=":
    case undefined:
      return cmp > 0;
    case "!=":
      return false;
    case ">":
      return false;
    case "<":
      return cmp >= 0;
    case ">=":
      return false;
    case "<=":
      return cmp > 0;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvbGVzc190aGFuX3JhbmdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB0eXBlIHsgQ29tcGFyYXRvciwgUmFuZ2UsIFNlbVZlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyB0ZXN0Q29tcGFyYXRvclNldCB9IGZyb20gXCIuL190ZXN0X2NvbXBhcmF0b3Jfc2V0LnRzXCI7XG5pbXBvcnQgeyBpc1dpbGRjYXJkQ29tcGFyYXRvciB9IGZyb20gXCIuL19zaGFyZWQudHNcIjtcbmltcG9ydCB7IGNvbXBhcmUgfSBmcm9tIFwiLi9jb21wYXJlLnRzXCI7XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIFNlbVZlciBpcyBsZXNzIHRoYW4gdGhlIHJhbmdlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcGFyc2UsIHBhcnNlUmFuZ2UsIGxlc3NUaGFuUmFuZ2UgfSBmcm9tIFwiQHN0ZC9zZW12ZXJcIjtcbiAqIGltcG9ydCB7IGFzc2VydCwgYXNzZXJ0RmFsc2UgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCB2MCA9IHBhcnNlKFwiMS4yLjNcIik7XG4gKiBjb25zdCB2MSA9IHBhcnNlKFwiMS4wLjBcIik7XG4gKiBjb25zdCByYW5nZSA9IHBhcnNlUmFuZ2UoXCI+PTEuMi4zIDwxLjIuNFwiKTtcbiAqIGFzc2VydEZhbHNlKGxlc3NUaGFuUmFuZ2UodjAsIHJhbmdlKSk7XG4gKiBhc3NlcnQobGVzc1RoYW5SYW5nZSh2MSwgcmFuZ2UpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzZW12ZXIgVGhlIHZlcnNpb24gdG8gY2hlY2suXG4gKiBAcGFyYW0gcmFuZ2UgVGhlIHJhbmdlIHRvIGNoZWNrIGFnYWluc3QuXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIFNlbVZlciBpcyBsZXNzIHRoYW4gdGhlIHJhbmdlLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlc3NUaGFuUmFuZ2Uoc2VtdmVyOiBTZW1WZXIsIHJhbmdlOiBSYW5nZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcmFuZ2UuZXZlcnkoKGNvbXBhcmF0b3JTZXQpID0+XG4gICAgbGVzc1RoYW5Db21wYXJhdG9yU2V0KHNlbXZlciwgY29tcGFyYXRvclNldClcbiAgKTtcbn1cblxuZnVuY3Rpb24gbGVzc1RoYW5Db21wYXJhdG9yU2V0KHNlbXZlcjogU2VtVmVyLCBjb21wYXJhdG9yU2V0OiBDb21wYXJhdG9yW10pIHtcbiAgLy8gSWYgdGhlIGNvbXBhcmF0b3Igc2V0IGNvbnRhaW5zIHdpbGRjYXJkLCB0aGVuIHRoZSBzZW12ZXIgaXMgbm90IGdyZWF0ZXIgdGhhbiB0aGUgcmFuZ2UuXG4gIGlmIChjb21wYXJhdG9yU2V0LnNvbWUoaXNXaWxkY2FyZENvbXBhcmF0b3IpKSByZXR1cm4gZmFsc2U7XG4gIC8vIElmIHRoZSBTZW1WZXIgc2F0aXNmaWVzIHRoZSBjb21wYXJhdG9yIHNldCwgdGhlbiBpdCdzIG5vdCBsZXNzIHRoYW4gdGhlIHJhbmdlLlxuICBpZiAodGVzdENvbXBhcmF0b3JTZXQoc2VtdmVyLCBjb21wYXJhdG9yU2V0KSkgcmV0dXJuIGZhbHNlO1xuICAvLyBJZiB0aGUgU2VtVmVyIGlzIGdyZWF0ZXIgdGhhbiBhbnkgb2YgdGhlIGNvbXBhcmF0b3Igc2V0LCB0aGVuIGl0J3Mgbm90IGxlc3MgdGhhbiB0aGUgcmFuZ2UuXG4gIGlmIChcbiAgICBjb21wYXJhdG9yU2V0LnNvbWUoKGNvbXBhcmF0b3IpID0+XG4gICAgICBncmVhdGVyVGhhbkNvbXBhcmF0b3Ioc2VtdmVyLCBjb21wYXJhdG9yKVxuICAgIClcbiAgKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBncmVhdGVyVGhhbkNvbXBhcmF0b3IoXG4gIHNlbXZlcjogU2VtVmVyLFxuICBjb21wYXJhdG9yOiBDb21wYXJhdG9yLFxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IGNtcCA9IGNvbXBhcmUoc2VtdmVyLCBjb21wYXJhdG9yKTtcbiAgc3dpdGNoIChjb21wYXJhdG9yLm9wZXJhdG9yKSB7XG4gICAgY2FzZSBcIj1cIjpcbiAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgIHJldHVybiBjbXAgPiAwO1xuICAgIGNhc2UgXCIhPVwiOlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNhc2UgXCI+XCI6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgY2FzZSBcIjxcIjpcbiAgICAgIHJldHVybiBjbXAgPj0gMDtcbiAgICBjYXNlIFwiPj1cIjpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjYXNlIFwiPD1cIjpcbiAgICAgIHJldHVybiBjbXAgPiAwO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUdyQyxTQUFTLGlCQUFpQixRQUFRLDRCQUE0QjtBQUM5RCxTQUFTLG9CQUFvQixRQUFRLGVBQWU7QUFDcEQsU0FBUyxPQUFPLFFBQVEsZUFBZTtBQUV2Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLEdBQ0QsT0FBTyxTQUFTLGNBQWMsTUFBYyxFQUFFLEtBQVk7RUFDeEQsT0FBTyxNQUFNLEtBQUssQ0FBQyxDQUFDLGdCQUNsQixzQkFBc0IsUUFBUTtBQUVsQztBQUVBLFNBQVMsc0JBQXNCLE1BQWMsRUFBRSxhQUEyQjtFQUN4RSwwRkFBMEY7RUFDMUYsSUFBSSxjQUFjLElBQUksQ0FBQyx1QkFBdUIsT0FBTztFQUNyRCxpRkFBaUY7RUFDakYsSUFBSSxrQkFBa0IsUUFBUSxnQkFBZ0IsT0FBTztFQUNyRCw4RkFBOEY7RUFDOUYsSUFDRSxjQUFjLElBQUksQ0FBQyxDQUFDLGFBQ2xCLHNCQUFzQixRQUFRLGNBRWhDLE9BQU87RUFDVCxPQUFPO0FBQ1Q7QUFFQSxTQUFTLHNCQUNQLE1BQWMsRUFDZCxVQUFzQjtFQUV0QixNQUFNLE1BQU0sUUFBUSxRQUFRO0VBQzVCLE9BQVEsV0FBVyxRQUFRO0lBQ3pCLEtBQUs7SUFDTCxLQUFLO01BQ0gsT0FBTyxNQUFNO0lBQ2YsS0FBSztNQUNILE9BQU87SUFDVCxLQUFLO01BQ0gsT0FBTztJQUNULEtBQUs7TUFDSCxPQUFPLE9BQU87SUFDaEIsS0FBSztNQUNILE9BQU87SUFDVCxLQUFLO01BQ0gsT0FBTyxNQUFNO0VBQ2pCO0FBQ0YifQ==
// denoCacheMetadata=438267053820079060,8227843880486913445