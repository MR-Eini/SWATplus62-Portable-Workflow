// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { _common } from "../_common/common.ts";
import { SEPARATOR } from "./constants.ts";
/** Determines the common path from a set of paths, using an optional separator,
 * which defaults to the OS default separator.
 *
 * ```ts
 *       import { common } from "@std/path";
 *       const p = common([
 *         "./deno/std/path/mod.ts",
 *         "./deno/std/fs/mod.ts",
 *       ]);
 *       console.log(p); // "./deno/std/"
 * ```
 */ export function common(paths, sep = SEPARATOR) {
  return _common(paths, sep);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3Bvc2l4L2NvbW1vbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBfY29tbW9uIH0gZnJvbSBcIi4uL19jb21tb24vY29tbW9uLnRzXCI7XG5pbXBvcnQgeyBTRVBBUkFUT1IgfSBmcm9tIFwiLi9jb25zdGFudHMudHNcIjtcblxuLyoqIERldGVybWluZXMgdGhlIGNvbW1vbiBwYXRoIGZyb20gYSBzZXQgb2YgcGF0aHMsIHVzaW5nIGFuIG9wdGlvbmFsIHNlcGFyYXRvcixcbiAqIHdoaWNoIGRlZmF1bHRzIHRvIHRoZSBPUyBkZWZhdWx0IHNlcGFyYXRvci5cbiAqXG4gKiBgYGB0c1xuICogICAgICAgaW1wb3J0IHsgY29tbW9uIH0gZnJvbSBcIkBzdGQvcGF0aFwiO1xuICogICAgICAgY29uc3QgcCA9IGNvbW1vbihbXG4gKiAgICAgICAgIFwiLi9kZW5vL3N0ZC9wYXRoL21vZC50c1wiLFxuICogICAgICAgICBcIi4vZGVuby9zdGQvZnMvbW9kLnRzXCIsXG4gKiAgICAgICBdKTtcbiAqICAgICAgIGNvbnNvbGUubG9nKHApOyAvLyBcIi4vZGVuby9zdGQvXCJcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tbW9uKFxuICBwYXRoczogc3RyaW5nW10sXG4gIHNlcDogc3RyaW5nID0gU0VQQVJBVE9SLFxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIF9jb21tb24ocGF0aHMsIHNlcCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLE9BQU8sUUFBUSx1QkFBdUI7QUFDL0MsU0FBUyxTQUFTLFFBQVEsaUJBQWlCO0FBRTNDOzs7Ozs7Ozs7OztDQVdDLEdBQ0QsT0FBTyxTQUFTLE9BQ2QsS0FBZSxFQUNmLE1BQWMsU0FBUztFQUV2QixPQUFPLFFBQVEsT0FBTztBQUN4QiJ9
// denoCacheMetadata=13734429436927150056,14701963386888181422