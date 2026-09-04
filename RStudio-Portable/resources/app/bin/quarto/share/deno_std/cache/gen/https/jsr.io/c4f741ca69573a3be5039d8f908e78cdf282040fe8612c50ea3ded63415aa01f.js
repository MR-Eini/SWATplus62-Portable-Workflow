// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assertPath } from "../_common/assert_path.ts";
import { normalize } from "./normalize.ts";
/**
 * Join all given a sequence of `paths`,then normalizes the resulting path.
 * @param paths to be joined and normalized
 */ export function join(...paths) {
  if (paths.length === 0) return ".";
  let joined;
  for(let i = 0; i < paths.length; ++i){
    const path = paths[i];
    assertPath(path);
    if (path.length > 0) {
      if (!joined) joined = path;
      else joined += `/${path}`;
    }
  }
  if (!joined) return ".";
  return normalize(joined);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3Bvc2l4L2pvaW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgYXNzZXJ0UGF0aCB9IGZyb20gXCIuLi9fY29tbW9uL2Fzc2VydF9wYXRoLnRzXCI7XG5pbXBvcnQgeyBub3JtYWxpemUgfSBmcm9tIFwiLi9ub3JtYWxpemUudHNcIjtcblxuLyoqXG4gKiBKb2luIGFsbCBnaXZlbiBhIHNlcXVlbmNlIG9mIGBwYXRoc2AsdGhlbiBub3JtYWxpemVzIHRoZSByZXN1bHRpbmcgcGF0aC5cbiAqIEBwYXJhbSBwYXRocyB0byBiZSBqb2luZWQgYW5kIG5vcm1hbGl6ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGpvaW4oLi4ucGF0aHM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgaWYgKHBhdGhzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFwiLlwiO1xuXG4gIGxldCBqb2luZWQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRocy5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IHBhdGggPSBwYXRoc1tpXSE7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcbiAgICBpZiAocGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoIWpvaW5lZCkgam9pbmVkID0gcGF0aDtcbiAgICAgIGVsc2Ugam9pbmVkICs9IGAvJHtwYXRofWA7XG4gICAgfVxuICB9XG4gIGlmICgham9pbmVkKSByZXR1cm4gXCIuXCI7XG4gIHJldHVybiBub3JtYWxpemUoam9pbmVkKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsVUFBVSxRQUFRLDRCQUE0QjtBQUN2RCxTQUFTLFNBQVMsUUFBUSxpQkFBaUI7QUFFM0M7OztDQUdDLEdBQ0QsT0FBTyxTQUFTLEtBQUssR0FBRyxLQUFlO0VBQ3JDLElBQUksTUFBTSxNQUFNLEtBQUssR0FBRyxPQUFPO0VBRS9CLElBQUk7RUFDSixJQUFLLElBQUksSUFBSSxHQUFHLElBQUksTUFBTSxNQUFNLEVBQUUsRUFBRSxFQUFHO0lBQ3JDLE1BQU0sT0FBTyxLQUFLLENBQUMsRUFBRTtJQUNyQixXQUFXO0lBQ1gsSUFBSSxLQUFLLE1BQU0sR0FBRyxHQUFHO01BQ25CLElBQUksQ0FBQyxRQUFRLFNBQVM7V0FDakIsVUFBVSxDQUFDLENBQUMsRUFBRSxNQUFNO0lBQzNCO0VBQ0Y7RUFDQSxJQUFJLENBQUMsUUFBUSxPQUFPO0VBQ3BCLE9BQU8sVUFBVTtBQUNuQiJ9
// denoCacheMetadata=11647138543468121950,15616938875322277664