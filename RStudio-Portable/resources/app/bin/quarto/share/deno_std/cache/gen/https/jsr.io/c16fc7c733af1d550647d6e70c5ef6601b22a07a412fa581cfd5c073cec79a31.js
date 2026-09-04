// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { join as posixJoin } from "./posix/join.ts";
import { join as windowsJoin } from "./windows/join.ts";
/**
 * Joins a sequence of paths, then normalizes the resulting path.
 *
 * @example Usage
 * ```ts
 * import { join } from "@std/path/join";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(join("C:\\foo", "bar", "baz\\quux", "garply", ".."), "C:\\foo\\bar\\baz\\quux");
 * } else {
 *   assertEquals(join("/foo", "bar", "baz/quux", "garply", ".."), "/foo/bar/baz/quux");
 * }
 * ```
 *
 * @param paths Paths to be joined and normalized.
 * @returns The joined and normalized path.
 */ export function join(...paths) {
  return isWindows ? windowsJoin(...paths) : posixJoin(...paths);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjAuMC1yYy4yL2pvaW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgaXNXaW5kb3dzIH0gZnJvbSBcIi4vX29zLnRzXCI7XG5pbXBvcnQgeyBqb2luIGFzIHBvc2l4Sm9pbiB9IGZyb20gXCIuL3Bvc2l4L2pvaW4udHNcIjtcbmltcG9ydCB7IGpvaW4gYXMgd2luZG93c0pvaW4gfSBmcm9tIFwiLi93aW5kb3dzL2pvaW4udHNcIjtcblxuLyoqXG4gKiBKb2lucyBhIHNlcXVlbmNlIG9mIHBhdGhzLCB0aGVuIG5vcm1hbGl6ZXMgdGhlIHJlc3VsdGluZyBwYXRoLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgam9pbiB9IGZyb20gXCJAc3RkL3BhdGgvam9pblwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBpZiAoRGVuby5idWlsZC5vcyA9PT0gXCJ3aW5kb3dzXCIpIHtcbiAqICAgYXNzZXJ0RXF1YWxzKGpvaW4oXCJDOlxcXFxmb29cIiwgXCJiYXJcIiwgXCJiYXpcXFxccXV1eFwiLCBcImdhcnBseVwiLCBcIi4uXCIpLCBcIkM6XFxcXGZvb1xcXFxiYXJcXFxcYmF6XFxcXHF1dXhcIik7XG4gKiB9IGVsc2Uge1xuICogICBhc3NlcnRFcXVhbHMoam9pbihcIi9mb29cIiwgXCJiYXJcIiwgXCJiYXovcXV1eFwiLCBcImdhcnBseVwiLCBcIi4uXCIpLCBcIi9mb28vYmFyL2Jhei9xdXV4XCIpO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIHBhdGhzIFBhdGhzIHRvIGJlIGpvaW5lZCBhbmQgbm9ybWFsaXplZC5cbiAqIEByZXR1cm5zIFRoZSBqb2luZWQgYW5kIG5vcm1hbGl6ZWQgcGF0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGpvaW4oLi4ucGF0aHM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlzV2luZG93cyA/IHdpbmRvd3NKb2luKC4uLnBhdGhzKSA6IHBvc2l4Sm9pbiguLi5wYXRocyk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFNBQVMsUUFBUSxXQUFXO0FBQ3JDLFNBQVMsUUFBUSxTQUFTLFFBQVEsa0JBQWtCO0FBQ3BELFNBQVMsUUFBUSxXQUFXLFFBQVEsb0JBQW9CO0FBRXhEOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCQyxHQUNELE9BQU8sU0FBUyxLQUFLLEdBQUcsS0FBZTtFQUNyQyxPQUFPLFlBQVksZUFBZSxTQUFTLGFBQWE7QUFDMUQifQ==
// denoCacheMetadata=9334128510250377984,14622219121950236118