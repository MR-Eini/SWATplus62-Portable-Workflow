// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { compare } from "./compare.ts";
/**
 * Greater than comparison
 *
 * This is equal to `compare(s0, s1) > 0`.
 *
 * @example Usage
 * ```ts
 * import { parse, greaterThan } from "@std/semver";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const s0 = parse("1.2.3");
 * const s1 = parse("1.2.4");
 * assert(greaterThan(s1, s0));
 * assertFalse(greaterThan(s0, s1));
 * assertFalse(greaterThan(s0, s0));
 * ```
 *
 * @param s0 The first version to compare
 * @param s1 The second version to compare
 * @returns `true` if `s0` is greater than `s1`, `false` otherwise
 */ export function greaterThan(s0, s1) {
  return compare(s0, s1) > 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvZ3JlYXRlcl90aGFuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB0eXBlIHsgU2VtVmVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IGNvbXBhcmUgfSBmcm9tIFwiLi9jb21wYXJlLnRzXCI7XG5cbi8qKlxuICogR3JlYXRlciB0aGFuIGNvbXBhcmlzb25cbiAqXG4gKiBUaGlzIGlzIGVxdWFsIHRvIGBjb21wYXJlKHMwLCBzMSkgPiAwYC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlLCBncmVhdGVyVGhhbiB9IGZyb20gXCJAc3RkL3NlbXZlclwiO1xuICogaW1wb3J0IHsgYXNzZXJ0LCBhc3NlcnRGYWxzZSB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHMwID0gcGFyc2UoXCIxLjIuM1wiKTtcbiAqIGNvbnN0IHMxID0gcGFyc2UoXCIxLjIuNFwiKTtcbiAqIGFzc2VydChncmVhdGVyVGhhbihzMSwgczApKTtcbiAqIGFzc2VydEZhbHNlKGdyZWF0ZXJUaGFuKHMwLCBzMSkpO1xuICogYXNzZXJ0RmFsc2UoZ3JlYXRlclRoYW4oczAsIHMwKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gczAgVGhlIGZpcnN0IHZlcnNpb24gdG8gY29tcGFyZVxuICogQHBhcmFtIHMxIFRoZSBzZWNvbmQgdmVyc2lvbiB0byBjb21wYXJlXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYHMwYCBpcyBncmVhdGVyIHRoYW4gYHMxYCwgYGZhbHNlYCBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyZWF0ZXJUaGFuKHMwOiBTZW1WZXIsIHMxOiBTZW1WZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvbXBhcmUoczAsIHMxKSA+IDA7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUdyQyxTQUFTLE9BQU8sUUFBUSxlQUFlO0FBRXZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW9CQyxHQUNELE9BQU8sU0FBUyxZQUFZLEVBQVUsRUFBRSxFQUFVO0VBQ2hELE9BQU8sUUFBUSxJQUFJLE1BQU07QUFDM0IifQ==
// denoCacheMetadata=13704518709391257298,3201611735255737167