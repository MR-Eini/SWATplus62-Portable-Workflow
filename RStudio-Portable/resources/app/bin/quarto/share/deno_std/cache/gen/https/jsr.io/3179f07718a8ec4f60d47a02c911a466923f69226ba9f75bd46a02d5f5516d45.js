// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { compare } from "./compare.ts";
/**
 * Returns `true` if both semantic versions are logically equivalent, even if they're not the exact same version object.
 *
 * This is equal to `compare(s0, s1) === 0`.
 *
 * @example Usage
 * ```ts
 * import { parse, equals } from "@std/semver";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const s0 = parse("1.2.3");
 * const s1 = parse("1.2.3");
 *
 * assert(equals(s0, s1));
 * assertFalse(equals(s0, parse("1.2.4")));
 * ```
 *
 * @param s0 The first SemVer to compare
 * @param s1 The second SemVer to compare
 * @returns `true` if `s0` is equal to `s1`, `false` otherwise
 */ export function equals(s0, s1) {
  return compare(s0, s1) === 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvZXF1YWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBjb21wYXJlIH0gZnJvbSBcIi4vY29tcGFyZS50c1wiO1xuaW1wb3J0IHR5cGUgeyBTZW1WZXIgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuXG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmIGJvdGggc2VtYW50aWMgdmVyc2lvbnMgYXJlIGxvZ2ljYWxseSBlcXVpdmFsZW50LCBldmVuIGlmIHRoZXkncmUgbm90IHRoZSBleGFjdCBzYW1lIHZlcnNpb24gb2JqZWN0LlxuICpcbiAqIFRoaXMgaXMgZXF1YWwgdG8gYGNvbXBhcmUoczAsIHMxKSA9PT0gMGAuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZSwgZXF1YWxzIH0gZnJvbSBcIkBzdGQvc2VtdmVyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnQsIGFzc2VydEZhbHNlIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3QgczAgPSBwYXJzZShcIjEuMi4zXCIpO1xuICogY29uc3QgczEgPSBwYXJzZShcIjEuMi4zXCIpO1xuICpcbiAqIGFzc2VydChlcXVhbHMoczAsIHMxKSk7XG4gKiBhc3NlcnRGYWxzZShlcXVhbHMoczAsIHBhcnNlKFwiMS4yLjRcIikpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzMCBUaGUgZmlyc3QgU2VtVmVyIHRvIGNvbXBhcmVcbiAqIEBwYXJhbSBzMSBUaGUgc2Vjb25kIFNlbVZlciB0byBjb21wYXJlXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYHMwYCBpcyBlcXVhbCB0byBgczFgLCBgZmFsc2VgIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKHMwOiBTZW1WZXIsIHMxOiBTZW1WZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvbXBhcmUoczAsIHMxKSA9PT0gMDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBQ3JDLFNBQVMsT0FBTyxRQUFRLGVBQWU7QUFHdkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0JDLEdBQ0QsT0FBTyxTQUFTLE9BQU8sRUFBVSxFQUFFLEVBQVU7RUFDM0MsT0FBTyxRQUFRLElBQUksUUFBUTtBQUM3QiJ9
// denoCacheMetadata=17516104540035822221,6074297363053259807