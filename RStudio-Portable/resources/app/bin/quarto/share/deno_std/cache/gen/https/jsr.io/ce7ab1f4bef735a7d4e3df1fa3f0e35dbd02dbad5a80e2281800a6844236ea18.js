// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { parse } from "./parse.ts";
/**
 * Returns true if the string can be parsed as SemVer.
 *
 * @example Usage
 * ```ts
 * import { canParse } from "@std/semver/can-parse";
 * import { assert, assertFalse } from "@std/assert";
 *
 * assert(canParse("1.2.3"));
 * assertFalse(canParse("invalid"));
 * ```
 *
 * @param version The version string to check
 * @returns `true` if the string can be parsed as SemVer, `false` otherwise
 */ export function canParse(version) {
  try {
    parse(version);
    return true;
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    return false;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvY2FuX3BhcnNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gXCIuL3BhcnNlLnRzXCI7XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzdHJpbmcgY2FuIGJlIHBhcnNlZCBhcyBTZW1WZXIuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBjYW5QYXJzZSB9IGZyb20gXCJAc3RkL3NlbXZlci9jYW4tcGFyc2VcIjtcbiAqIGltcG9ydCB7IGFzc2VydCwgYXNzZXJ0RmFsc2UgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnQoY2FuUGFyc2UoXCIxLjIuM1wiKSk7XG4gKiBhc3NlcnRGYWxzZShjYW5QYXJzZShcImludmFsaWRcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHZlcnNpb24gVGhlIHZlcnNpb24gc3RyaW5nIHRvIGNoZWNrXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHN0cmluZyBjYW4gYmUgcGFyc2VkIGFzIFNlbVZlciwgYGZhbHNlYCBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhblBhcnNlKHZlcnNpb246IHN0cmluZyk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIHBhcnNlKHZlcnNpb24pO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBUeXBlRXJyb3IpKSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsU0FBUyxLQUFLLFFBQVEsYUFBYTtBQUVuQzs7Ozs7Ozs7Ozs7Ozs7Q0FjQyxHQUNELE9BQU8sU0FBUyxTQUFTLE9BQWU7RUFDdEMsSUFBSTtJQUNGLE1BQU07SUFDTixPQUFPO0VBQ1QsRUFBRSxPQUFPLEtBQUs7SUFDWixJQUFJLENBQUMsQ0FBQyxlQUFlLFNBQVMsR0FBRztNQUMvQixNQUFNO0lBQ1I7SUFDQSxPQUFPO0VBQ1Q7QUFDRiJ9
// denoCacheMetadata=2699034600661357469,8450053275400699666