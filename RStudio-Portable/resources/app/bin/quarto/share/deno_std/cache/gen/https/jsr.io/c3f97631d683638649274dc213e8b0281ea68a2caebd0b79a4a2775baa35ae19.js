// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { testComparatorSet } from "./_test_comparator_set.ts";
/**
 * Test to see if the version satisfies the range.
 *
 * @example Usage
 * ```ts
 * import { parse, parseRange, satisfies } from "@std/semver";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const version = parse("1.2.3");
 * const range0 = parseRange(">=1.0.0 <2.0.0");
 * const range1 = parseRange(">=1.0.0 <1.3.0");
 * const range2 = parseRange(">=1.0.0 <1.2.3");
 *
 * assert(satisfies(version, range0));
 * assert(satisfies(version, range1));
 * assertFalse(satisfies(version, range2));
 * ```
 * @param version The version to test
 * @param range The range to check
 * @returns true if the version is in the range
 */ export function satisfies(version, range) {
  return range.some((set)=>testComparatorSet(version, set));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvc2F0aXNmaWVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB0eXBlIHsgUmFuZ2UsIFNlbVZlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyB0ZXN0Q29tcGFyYXRvclNldCB9IGZyb20gXCIuL190ZXN0X2NvbXBhcmF0b3Jfc2V0LnRzXCI7XG5cbi8qKlxuICogVGVzdCB0byBzZWUgaWYgdGhlIHZlcnNpb24gc2F0aXNmaWVzIHRoZSByYW5nZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlLCBwYXJzZVJhbmdlLCBzYXRpc2ZpZXMgfSBmcm9tIFwiQHN0ZC9zZW12ZXJcIjtcbiAqIGltcG9ydCB7IGFzc2VydCwgYXNzZXJ0RmFsc2UgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCB2ZXJzaW9uID0gcGFyc2UoXCIxLjIuM1wiKTtcbiAqIGNvbnN0IHJhbmdlMCA9IHBhcnNlUmFuZ2UoXCI+PTEuMC4wIDwyLjAuMFwiKTtcbiAqIGNvbnN0IHJhbmdlMSA9IHBhcnNlUmFuZ2UoXCI+PTEuMC4wIDwxLjMuMFwiKTtcbiAqIGNvbnN0IHJhbmdlMiA9IHBhcnNlUmFuZ2UoXCI+PTEuMC4wIDwxLjIuM1wiKTtcbiAqXG4gKiBhc3NlcnQoc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlMCkpO1xuICogYXNzZXJ0KHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZTEpKTtcbiAqIGFzc2VydEZhbHNlKHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZTIpKTtcbiAqIGBgYFxuICogQHBhcmFtIHZlcnNpb24gVGhlIHZlcnNpb24gdG8gdGVzdFxuICogQHBhcmFtIHJhbmdlIFRoZSByYW5nZSB0byBjaGVja1xuICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgdmVyc2lvbiBpcyBpbiB0aGUgcmFuZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhdGlzZmllcyhcbiAgdmVyc2lvbjogU2VtVmVyLFxuICByYW5nZTogUmFuZ2UsXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIHJhbmdlLnNvbWUoKHNldCkgPT4gdGVzdENvbXBhcmF0b3JTZXQodmVyc2lvbiwgc2V0KSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRzFFLFNBQVMsaUJBQWlCLFFBQVEsNEJBQTRCO0FBRTlEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW9CQyxHQUNELE9BQU8sU0FBUyxVQUNkLE9BQWUsRUFDZixLQUFZO0VBRVosT0FBTyxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQVEsa0JBQWtCLFNBQVM7QUFDeEQifQ==
// denoCacheMetadata=16118141726542357151,10012827635021550166