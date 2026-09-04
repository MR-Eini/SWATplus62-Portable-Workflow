// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assertPath } from "../_common/assert_path.ts";
import { normalize } from "./normalize.ts";
/**
 * Join all given a sequence of `paths`,then normalizes the resulting path.
 *
 * @example Usage
 * ```ts
 * import { join } from "@std/path/posix/join";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const path = join("/foo", "bar", "baz/asdf", "quux", "..");
 * assertEquals(path, "/foo/bar/baz/asdf");
 * ```
 *
 * @param paths The paths to join.
 * @returns The joined path.
 */ export function join(...paths) {
  if (paths.length === 0) return ".";
  paths.forEach((path)=>assertPath(path));
  const joined = paths.filter((path)=>path.length > 0).join("/");
  return joined === "" ? "." : normalize(joined);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjAuMC1yYy4yL3Bvc2l4L2pvaW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgYXNzZXJ0UGF0aCB9IGZyb20gXCIuLi9fY29tbW9uL2Fzc2VydF9wYXRoLnRzXCI7XG5pbXBvcnQgeyBub3JtYWxpemUgfSBmcm9tIFwiLi9ub3JtYWxpemUudHNcIjtcblxuLyoqXG4gKiBKb2luIGFsbCBnaXZlbiBhIHNlcXVlbmNlIG9mIGBwYXRoc2AsdGhlbiBub3JtYWxpemVzIHRoZSByZXN1bHRpbmcgcGF0aC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGpvaW4gfSBmcm9tIFwiQHN0ZC9wYXRoL3Bvc2l4L2pvaW5cIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgcGF0aCA9IGpvaW4oXCIvZm9vXCIsIFwiYmFyXCIsIFwiYmF6L2FzZGZcIiwgXCJxdXV4XCIsIFwiLi5cIik7XG4gKiBhc3NlcnRFcXVhbHMocGF0aCwgXCIvZm9vL2Jhci9iYXovYXNkZlwiKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBwYXRocyBUaGUgcGF0aHMgdG8gam9pbi5cbiAqIEByZXR1cm5zIFRoZSBqb2luZWQgcGF0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGpvaW4oLi4ucGF0aHM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgaWYgKHBhdGhzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFwiLlwiO1xuICBwYXRocy5mb3JFYWNoKChwYXRoKSA9PiBhc3NlcnRQYXRoKHBhdGgpKTtcbiAgY29uc3Qgam9pbmVkID0gcGF0aHMuZmlsdGVyKChwYXRoKSA9PiBwYXRoLmxlbmd0aCA+IDApLmpvaW4oXCIvXCIpO1xuICByZXR1cm4gam9pbmVkID09PSBcIlwiID8gXCIuXCIgOiBub3JtYWxpemUoam9pbmVkKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsVUFBVSxRQUFRLDRCQUE0QjtBQUN2RCxTQUFTLFNBQVMsUUFBUSxpQkFBaUI7QUFFM0M7Ozs7Ozs7Ozs7Ozs7O0NBY0MsR0FDRCxPQUFPLFNBQVMsS0FBSyxHQUFHLEtBQWU7RUFDckMsSUFBSSxNQUFNLE1BQU0sS0FBSyxHQUFHLE9BQU87RUFDL0IsTUFBTSxPQUFPLENBQUMsQ0FBQyxPQUFTLFdBQVc7RUFDbkMsTUFBTSxTQUFTLE1BQU0sTUFBTSxDQUFDLENBQUMsT0FBUyxLQUFLLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQztFQUM1RCxPQUFPLFdBQVcsS0FBSyxNQUFNLFVBQVU7QUFDekMifQ==
// denoCacheMetadata=9042087310289194102,16135357932758214167