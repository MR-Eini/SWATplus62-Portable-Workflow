// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assertArg } from "../_common/dirname.ts";
import { CHAR_COLON } from "../_common/constants.ts";
import { stripTrailingSeparators } from "../_common/strip_trailing_separators.ts";
import { isPathSeparator, isPosixPathSeparator, isWindowsDeviceRoot } from "./_util.ts";
/**
 * Return the directory path of a `path`.
 * @param path - path to extract the directory from.
 */ export function dirname(path) {
  assertArg(path);
  const len = path.length;
  let rootEnd = -1;
  let end = -1;
  let matchedSlash = true;
  let offset = 0;
  const code = path.charCodeAt(0);
  // Try to match a root
  if (len > 1) {
    if (isPathSeparator(code)) {
      // Possible UNC root
      rootEnd = offset = 1;
      if (isPathSeparator(path.charCodeAt(1))) {
        // Matched double path separator at beginning
        let j = 2;
        let last = j;
        // Match 1 or more non-path separators
        for(; j < len; ++j){
          if (isPathSeparator(path.charCodeAt(j))) break;
        }
        if (j < len && j !== last) {
          // Matched!
          last = j;
          // Match 1 or more path separators
          for(; j < len; ++j){
            if (!isPathSeparator(path.charCodeAt(j))) break;
          }
          if (j < len && j !== last) {
            // Matched!
            last = j;
            // Match 1 or more non-path separators
            for(; j < len; ++j){
              if (isPathSeparator(path.charCodeAt(j))) break;
            }
            if (j === len) {
              // We matched a UNC root only
              return path;
            }
            if (j !== last) {
              // We matched a UNC root with leftovers
              // Offset by 1 to include the separator after the UNC root to
              // treat it as a "normal root" on top of a (UNC) root
              rootEnd = offset = j + 1;
            }
          }
        }
      }
    } else if (isWindowsDeviceRoot(code)) {
      // Possible device root
      if (path.charCodeAt(1) === CHAR_COLON) {
        rootEnd = offset = 2;
        if (len > 2) {
          if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
        }
      }
    }
  } else if (isPathSeparator(code)) {
    // `path` contains just a path separator, exit early to avoid
    // unnecessary work
    return path;
  }
  for(let i = len - 1; i >= offset; --i){
    if (isPathSeparator(path.charCodeAt(i))) {
      if (!matchedSlash) {
        end = i;
        break;
      }
    } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }
  if (end === -1) {
    if (rootEnd === -1) return ".";
    else end = rootEnd;
  }
  return stripTrailingSeparators(path.slice(0, end), isPosixPathSeparator);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3dpbmRvd3MvZGlybmFtZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBhc3NlcnRBcmcgfSBmcm9tIFwiLi4vX2NvbW1vbi9kaXJuYW1lLnRzXCI7XG5pbXBvcnQgeyBDSEFSX0NPTE9OIH0gZnJvbSBcIi4uL19jb21tb24vY29uc3RhbnRzLnRzXCI7XG5pbXBvcnQgeyBzdHJpcFRyYWlsaW5nU2VwYXJhdG9ycyB9IGZyb20gXCIuLi9fY29tbW9uL3N0cmlwX3RyYWlsaW5nX3NlcGFyYXRvcnMudHNcIjtcbmltcG9ydCB7XG4gIGlzUGF0aFNlcGFyYXRvcixcbiAgaXNQb3NpeFBhdGhTZXBhcmF0b3IsXG4gIGlzV2luZG93c0RldmljZVJvb3QsXG59IGZyb20gXCIuL191dGlsLnRzXCI7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBkaXJlY3RvcnkgcGF0aCBvZiBhIGBwYXRoYC5cbiAqIEBwYXJhbSBwYXRoIC0gcGF0aCB0byBleHRyYWN0IHRoZSBkaXJlY3RvcnkgZnJvbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpcm5hbWUocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgYXNzZXJ0QXJnKHBhdGgpO1xuXG4gIGNvbnN0IGxlbiA9IHBhdGgubGVuZ3RoO1xuICBsZXQgcm9vdEVuZCA9IC0xO1xuICBsZXQgZW5kID0gLTE7XG4gIGxldCBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICBsZXQgb2Zmc2V0ID0gMDtcbiAgY29uc3QgY29kZSA9IHBhdGguY2hhckNvZGVBdCgwKTtcblxuICAvLyBUcnkgdG8gbWF0Y2ggYSByb290XG4gIGlmIChsZW4gPiAxKSB7XG4gICAgaWYgKGlzUGF0aFNlcGFyYXRvcihjb2RlKSkge1xuICAgICAgLy8gUG9zc2libGUgVU5DIHJvb3RcblxuICAgICAgcm9vdEVuZCA9IG9mZnNldCA9IDE7XG5cbiAgICAgIGlmIChpc1BhdGhTZXBhcmF0b3IocGF0aC5jaGFyQ29kZUF0KDEpKSkge1xuICAgICAgICAvLyBNYXRjaGVkIGRvdWJsZSBwYXRoIHNlcGFyYXRvciBhdCBiZWdpbm5pbmdcbiAgICAgICAgbGV0IGogPSAyO1xuICAgICAgICBsZXQgbGFzdCA9IGo7XG4gICAgICAgIC8vIE1hdGNoIDEgb3IgbW9yZSBub24tcGF0aCBzZXBhcmF0b3JzXG4gICAgICAgIGZvciAoOyBqIDwgbGVuOyArK2opIHtcbiAgICAgICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdChqKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChqIDwgbGVuICYmIGogIT09IGxhc3QpIHtcbiAgICAgICAgICAvLyBNYXRjaGVkIVxuICAgICAgICAgIGxhc3QgPSBqO1xuICAgICAgICAgIC8vIE1hdGNoIDEgb3IgbW9yZSBwYXRoIHNlcGFyYXRvcnNcbiAgICAgICAgICBmb3IgKDsgaiA8IGxlbjsgKytqKSB7XG4gICAgICAgICAgICBpZiAoIWlzUGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoaikpKSBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGogPCBsZW4gJiYgaiAhPT0gbGFzdCkge1xuICAgICAgICAgICAgLy8gTWF0Y2hlZCFcbiAgICAgICAgICAgIGxhc3QgPSBqO1xuICAgICAgICAgICAgLy8gTWF0Y2ggMSBvciBtb3JlIG5vbi1wYXRoIHNlcGFyYXRvcnNcbiAgICAgICAgICAgIGZvciAoOyBqIDwgbGVuOyArK2opIHtcbiAgICAgICAgICAgICAgaWYgKGlzUGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoaikpKSBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChqID09PSBsZW4pIHtcbiAgICAgICAgICAgICAgLy8gV2UgbWF0Y2hlZCBhIFVOQyByb290IG9ubHlcbiAgICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaiAhPT0gbGFzdCkge1xuICAgICAgICAgICAgICAvLyBXZSBtYXRjaGVkIGEgVU5DIHJvb3Qgd2l0aCBsZWZ0b3ZlcnNcblxuICAgICAgICAgICAgICAvLyBPZmZzZXQgYnkgMSB0byBpbmNsdWRlIHRoZSBzZXBhcmF0b3IgYWZ0ZXIgdGhlIFVOQyByb290IHRvXG4gICAgICAgICAgICAgIC8vIHRyZWF0IGl0IGFzIGEgXCJub3JtYWwgcm9vdFwiIG9uIHRvcCBvZiBhIChVTkMpIHJvb3RcbiAgICAgICAgICAgICAgcm9vdEVuZCA9IG9mZnNldCA9IGogKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNXaW5kb3dzRGV2aWNlUm9vdChjb2RlKSkge1xuICAgICAgLy8gUG9zc2libGUgZGV2aWNlIHJvb3RcblxuICAgICAgaWYgKHBhdGguY2hhckNvZGVBdCgxKSA9PT0gQ0hBUl9DT0xPTikge1xuICAgICAgICByb290RW5kID0gb2Zmc2V0ID0gMjtcbiAgICAgICAgaWYgKGxlbiA+IDIpIHtcbiAgICAgICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdCgyKSkpIHJvb3RFbmQgPSBvZmZzZXQgPSAzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzUGF0aFNlcGFyYXRvcihjb2RlKSkge1xuICAgIC8vIGBwYXRoYCBjb250YWlucyBqdXN0IGEgcGF0aCBzZXBhcmF0b3IsIGV4aXQgZWFybHkgdG8gYXZvaWRcbiAgICAvLyB1bm5lY2Vzc2FyeSB3b3JrXG4gICAgcmV0dXJuIHBhdGg7XG4gIH1cblxuICBmb3IgKGxldCBpID0gbGVuIC0gMTsgaSA+PSBvZmZzZXQ7IC0taSkge1xuICAgIGlmIChpc1BhdGhTZXBhcmF0b3IocGF0aC5jaGFyQ29kZUF0KGkpKSkge1xuICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgZW5kID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yXG4gICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBpZiAoZW5kID09PSAtMSkge1xuICAgIGlmIChyb290RW5kID09PSAtMSkgcmV0dXJuIFwiLlwiO1xuICAgIGVsc2UgZW5kID0gcm9vdEVuZDtcbiAgfVxuICByZXR1cm4gc3RyaXBUcmFpbGluZ1NlcGFyYXRvcnMocGF0aC5zbGljZSgwLCBlbmQpLCBpc1Bvc2l4UGF0aFNlcGFyYXRvcik7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFNBQVMsUUFBUSx3QkFBd0I7QUFDbEQsU0FBUyxVQUFVLFFBQVEsMEJBQTBCO0FBQ3JELFNBQVMsdUJBQXVCLFFBQVEsMENBQTBDO0FBQ2xGLFNBQ0UsZUFBZSxFQUNmLG9CQUFvQixFQUNwQixtQkFBbUIsUUFDZCxhQUFhO0FBRXBCOzs7Q0FHQyxHQUNELE9BQU8sU0FBUyxRQUFRLElBQVk7RUFDbEMsVUFBVTtFQUVWLE1BQU0sTUFBTSxLQUFLLE1BQU07RUFDdkIsSUFBSSxVQUFVLENBQUM7RUFDZixJQUFJLE1BQU0sQ0FBQztFQUNYLElBQUksZUFBZTtFQUNuQixJQUFJLFNBQVM7RUFDYixNQUFNLE9BQU8sS0FBSyxVQUFVLENBQUM7RUFFN0Isc0JBQXNCO0VBQ3RCLElBQUksTUFBTSxHQUFHO0lBQ1gsSUFBSSxnQkFBZ0IsT0FBTztNQUN6QixvQkFBb0I7TUFFcEIsVUFBVSxTQUFTO01BRW5CLElBQUksZ0JBQWdCLEtBQUssVUFBVSxDQUFDLEtBQUs7UUFDdkMsNkNBQTZDO1FBQzdDLElBQUksSUFBSTtRQUNSLElBQUksT0FBTztRQUNYLHNDQUFzQztRQUN0QyxNQUFPLElBQUksS0FBSyxFQUFFLEVBQUc7VUFDbkIsSUFBSSxnQkFBZ0IsS0FBSyxVQUFVLENBQUMsS0FBSztRQUMzQztRQUNBLElBQUksSUFBSSxPQUFPLE1BQU0sTUFBTTtVQUN6QixXQUFXO1VBQ1gsT0FBTztVQUNQLGtDQUFrQztVQUNsQyxNQUFPLElBQUksS0FBSyxFQUFFLEVBQUc7WUFDbkIsSUFBSSxDQUFDLGdCQUFnQixLQUFLLFVBQVUsQ0FBQyxLQUFLO1VBQzVDO1VBQ0EsSUFBSSxJQUFJLE9BQU8sTUFBTSxNQUFNO1lBQ3pCLFdBQVc7WUFDWCxPQUFPO1lBQ1Asc0NBQXNDO1lBQ3RDLE1BQU8sSUFBSSxLQUFLLEVBQUUsRUFBRztjQUNuQixJQUFJLGdCQUFnQixLQUFLLFVBQVUsQ0FBQyxLQUFLO1lBQzNDO1lBQ0EsSUFBSSxNQUFNLEtBQUs7Y0FDYiw2QkFBNkI7Y0FDN0IsT0FBTztZQUNUO1lBQ0EsSUFBSSxNQUFNLE1BQU07Y0FDZCx1Q0FBdUM7Y0FFdkMsNkRBQTZEO2NBQzdELHFEQUFxRDtjQUNyRCxVQUFVLFNBQVMsSUFBSTtZQUN6QjtVQUNGO1FBQ0Y7TUFDRjtJQUNGLE9BQU8sSUFBSSxvQkFBb0IsT0FBTztNQUNwQyx1QkFBdUI7TUFFdkIsSUFBSSxLQUFLLFVBQVUsQ0FBQyxPQUFPLFlBQVk7UUFDckMsVUFBVSxTQUFTO1FBQ25CLElBQUksTUFBTSxHQUFHO1VBQ1gsSUFBSSxnQkFBZ0IsS0FBSyxVQUFVLENBQUMsS0FBSyxVQUFVLFNBQVM7UUFDOUQ7TUFDRjtJQUNGO0VBQ0YsT0FBTyxJQUFJLGdCQUFnQixPQUFPO0lBQ2hDLDZEQUE2RDtJQUM3RCxtQkFBbUI7SUFDbkIsT0FBTztFQUNUO0VBRUEsSUFBSyxJQUFJLElBQUksTUFBTSxHQUFHLEtBQUssUUFBUSxFQUFFLEVBQUc7SUFDdEMsSUFBSSxnQkFBZ0IsS0FBSyxVQUFVLENBQUMsS0FBSztNQUN2QyxJQUFJLENBQUMsY0FBYztRQUNqQixNQUFNO1FBQ047TUFDRjtJQUNGLE9BQU87TUFDTCxzQ0FBc0M7TUFDdEMsZUFBZTtJQUNqQjtFQUNGO0VBRUEsSUFBSSxRQUFRLENBQUMsR0FBRztJQUNkLElBQUksWUFBWSxDQUFDLEdBQUcsT0FBTztTQUN0QixNQUFNO0VBQ2I7RUFDQSxPQUFPLHdCQUF3QixLQUFLLEtBQUssQ0FBQyxHQUFHLE1BQU07QUFDckQifQ==
// denoCacheMetadata=8862278836455811414,10617250936559112819