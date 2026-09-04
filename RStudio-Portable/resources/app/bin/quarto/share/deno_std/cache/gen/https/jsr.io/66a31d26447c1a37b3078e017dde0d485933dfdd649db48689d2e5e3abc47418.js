// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { testComparatorSet } from "./_test_comparator_set.ts";
import { isWildcardComparator } from "./_shared.ts";
import { compare } from "./compare.ts";
/**
 * Check if the SemVer is greater than the range.
 *
 * @example Usage
 * ```ts
 * import { parse, parseRange, greaterThanRange } from "@std/semver";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const v0 = parse("1.2.3");
 * const v1 = parse("1.2.4");
 * const range = parseRange(">=1.2.3 <1.2.4");
 * assertFalse(greaterThanRange(v0, range));
 * assert(greaterThanRange(v1, range));
 * ```
 *
 * @param semver The version to check.
 * @param range The range to check against.
 * @returns `true` if the semver is greater than the range, `false` otherwise.
 */ export function greaterThanRange(semver, range) {
  return range.every((comparatorSet)=>greaterThanComparatorSet(semver, comparatorSet));
}
function greaterThanComparatorSet(semver, comparatorSet) {
  // If the comparator set contains wildcard, then the semver is not greater than the range.
  if (comparatorSet.some(isWildcardComparator)) return false;
  // If the semver satisfies the comparator set, then it's not greater than the range.
  if (testComparatorSet(semver, comparatorSet)) return false;
  // If the semver is less than any of the comparator set, then it's not greater than the range.
  if (comparatorSet.some((comparator)=>lessThanComparator(semver, comparator))) return false;
  return true;
}
function lessThanComparator(semver, comparator) {
  const cmp = compare(semver, comparator);
  switch(comparator.operator){
    case "=":
    case undefined:
      return cmp < 0;
    case "!=":
      return false;
    case ">":
      return cmp <= 0;
    case "<":
      return false;
    case ">=":
      return cmp < 0;
    case "<=":
      return false;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvZ3JlYXRlcl90aGFuX3JhbmdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB0eXBlIHsgQ29tcGFyYXRvciwgUmFuZ2UsIFNlbVZlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyB0ZXN0Q29tcGFyYXRvclNldCB9IGZyb20gXCIuL190ZXN0X2NvbXBhcmF0b3Jfc2V0LnRzXCI7XG5pbXBvcnQgeyBpc1dpbGRjYXJkQ29tcGFyYXRvciB9IGZyb20gXCIuL19zaGFyZWQudHNcIjtcbmltcG9ydCB7IGNvbXBhcmUgfSBmcm9tIFwiLi9jb21wYXJlLnRzXCI7XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIFNlbVZlciBpcyBncmVhdGVyIHRoYW4gdGhlIHJhbmdlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcGFyc2UsIHBhcnNlUmFuZ2UsIGdyZWF0ZXJUaGFuUmFuZ2UgfSBmcm9tIFwiQHN0ZC9zZW12ZXJcIjtcbiAqIGltcG9ydCB7IGFzc2VydCwgYXNzZXJ0RmFsc2UgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCB2MCA9IHBhcnNlKFwiMS4yLjNcIik7XG4gKiBjb25zdCB2MSA9IHBhcnNlKFwiMS4yLjRcIik7XG4gKiBjb25zdCByYW5nZSA9IHBhcnNlUmFuZ2UoXCI+PTEuMi4zIDwxLjIuNFwiKTtcbiAqIGFzc2VydEZhbHNlKGdyZWF0ZXJUaGFuUmFuZ2UodjAsIHJhbmdlKSk7XG4gKiBhc3NlcnQoZ3JlYXRlclRoYW5SYW5nZSh2MSwgcmFuZ2UpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzZW12ZXIgVGhlIHZlcnNpb24gdG8gY2hlY2suXG4gKiBAcGFyYW0gcmFuZ2UgVGhlIHJhbmdlIHRvIGNoZWNrIGFnYWluc3QuXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHNlbXZlciBpcyBncmVhdGVyIHRoYW4gdGhlIHJhbmdlLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyZWF0ZXJUaGFuUmFuZ2Uoc2VtdmVyOiBTZW1WZXIsIHJhbmdlOiBSYW5nZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcmFuZ2UuZXZlcnkoKGNvbXBhcmF0b3JTZXQpID0+XG4gICAgZ3JlYXRlclRoYW5Db21wYXJhdG9yU2V0KHNlbXZlciwgY29tcGFyYXRvclNldClcbiAgKTtcbn1cblxuZnVuY3Rpb24gZ3JlYXRlclRoYW5Db21wYXJhdG9yU2V0KFxuICBzZW12ZXI6IFNlbVZlcixcbiAgY29tcGFyYXRvclNldDogQ29tcGFyYXRvcltdLFxuKTogYm9vbGVhbiB7XG4gIC8vIElmIHRoZSBjb21wYXJhdG9yIHNldCBjb250YWlucyB3aWxkY2FyZCwgdGhlbiB0aGUgc2VtdmVyIGlzIG5vdCBncmVhdGVyIHRoYW4gdGhlIHJhbmdlLlxuICBpZiAoY29tcGFyYXRvclNldC5zb21lKGlzV2lsZGNhcmRDb21wYXJhdG9yKSkgcmV0dXJuIGZhbHNlO1xuICAvLyBJZiB0aGUgc2VtdmVyIHNhdGlzZmllcyB0aGUgY29tcGFyYXRvciBzZXQsIHRoZW4gaXQncyBub3QgZ3JlYXRlciB0aGFuIHRoZSByYW5nZS5cbiAgaWYgKHRlc3RDb21wYXJhdG9yU2V0KHNlbXZlciwgY29tcGFyYXRvclNldCkpIHJldHVybiBmYWxzZTtcbiAgLy8gSWYgdGhlIHNlbXZlciBpcyBsZXNzIHRoYW4gYW55IG9mIHRoZSBjb21wYXJhdG9yIHNldCwgdGhlbiBpdCdzIG5vdCBncmVhdGVyIHRoYW4gdGhlIHJhbmdlLlxuICBpZiAoXG4gICAgY29tcGFyYXRvclNldC5zb21lKChjb21wYXJhdG9yKSA9PiBsZXNzVGhhbkNvbXBhcmF0b3Ioc2VtdmVyLCBjb21wYXJhdG9yKSlcbiAgKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBsZXNzVGhhbkNvbXBhcmF0b3Ioc2VtdmVyOiBTZW1WZXIsIGNvbXBhcmF0b3I6IENvbXBhcmF0b3IpOiBib29sZWFuIHtcbiAgY29uc3QgY21wID0gY29tcGFyZShzZW12ZXIsIGNvbXBhcmF0b3IpO1xuICBzd2l0Y2ggKGNvbXBhcmF0b3Iub3BlcmF0b3IpIHtcbiAgICBjYXNlIFwiPVwiOlxuICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgcmV0dXJuIGNtcCA8IDA7XG4gICAgY2FzZSBcIiE9XCI6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgY2FzZSBcIj5cIjpcbiAgICAgIHJldHVybiBjbXAgPD0gMDtcbiAgICBjYXNlIFwiPFwiOlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNhc2UgXCI+PVwiOlxuICAgICAgcmV0dXJuIGNtcCA8IDA7XG4gICAgY2FzZSBcIjw9XCI6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBR3JDLFNBQVMsaUJBQWlCLFFBQVEsNEJBQTRCO0FBQzlELFNBQVMsb0JBQW9CLFFBQVEsZUFBZTtBQUNwRCxTQUFTLE9BQU8sUUFBUSxlQUFlO0FBRXZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FrQkMsR0FDRCxPQUFPLFNBQVMsaUJBQWlCLE1BQWMsRUFBRSxLQUFZO0VBQzNELE9BQU8sTUFBTSxLQUFLLENBQUMsQ0FBQyxnQkFDbEIseUJBQXlCLFFBQVE7QUFFckM7QUFFQSxTQUFTLHlCQUNQLE1BQWMsRUFDZCxhQUEyQjtFQUUzQiwwRkFBMEY7RUFDMUYsSUFBSSxjQUFjLElBQUksQ0FBQyx1QkFBdUIsT0FBTztFQUNyRCxvRkFBb0Y7RUFDcEYsSUFBSSxrQkFBa0IsUUFBUSxnQkFBZ0IsT0FBTztFQUNyRCw4RkFBOEY7RUFDOUYsSUFDRSxjQUFjLElBQUksQ0FBQyxDQUFDLGFBQWUsbUJBQW1CLFFBQVEsY0FDOUQsT0FBTztFQUNULE9BQU87QUFDVDtBQUVBLFNBQVMsbUJBQW1CLE1BQWMsRUFBRSxVQUFzQjtFQUNoRSxNQUFNLE1BQU0sUUFBUSxRQUFRO0VBQzVCLE9BQVEsV0FBVyxRQUFRO0lBQ3pCLEtBQUs7SUFDTCxLQUFLO01BQ0gsT0FBTyxNQUFNO0lBQ2YsS0FBSztNQUNILE9BQU87SUFDVCxLQUFLO01BQ0gsT0FBTyxPQUFPO0lBQ2hCLEtBQUs7TUFDSCxPQUFPO0lBQ1QsS0FBSztNQUNILE9BQU8sTUFBTTtJQUNmLEtBQUs7TUFDSCxPQUFPO0VBQ1g7QUFDRiJ9
// denoCacheMetadata=7155394817444634204,18383002258241311059