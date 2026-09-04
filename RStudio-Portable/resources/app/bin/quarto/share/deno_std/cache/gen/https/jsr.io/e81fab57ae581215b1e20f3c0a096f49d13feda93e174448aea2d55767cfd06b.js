// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assertArg } from "../_common/dirname.ts";
import { stripTrailingSeparators } from "../_common/strip_trailing_separators.ts";
import { isPosixPathSeparator } from "./_util.ts";
/**
 * Return the directory path of a `path`.
 *
 * @example
 * ```ts
 * import { dirname } from "@std/path/dirname";
 *
 * console.log(dirname("/home/user/Documents/")); // "/home/user"
 * console.log(dirname("/home/user/Documents/image.png")); // "/home/user/Documents"
 * ```
 *
 * @param path - path to extract the directory from.
 */ export function dirname(path) {
  assertArg(path);
  let end = -1;
  let matchedNonSeparator = false;
  for(let i = path.length - 1; i >= 1; --i){
    if (isPosixPathSeparator(path.charCodeAt(i))) {
      if (matchedNonSeparator) {
        end = i;
        break;
      }
    } else {
      matchedNonSeparator = true;
    }
  }
  // No matches. Fallback based on provided path:
  //
  // - leading slashes paths
  //     "/foo" => "/"
  //     "///foo" => "/"
  // - no slash path
  //     "foo" => "."
  if (end === -1) {
    return isPosixPathSeparator(path.charCodeAt(0)) ? "/" : ".";
  }
  return stripTrailingSeparators(path.slice(0, end), isPosixPathSeparator);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3Bvc2l4L2Rpcm5hbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgYXNzZXJ0QXJnIH0gZnJvbSBcIi4uL19jb21tb24vZGlybmFtZS50c1wiO1xuaW1wb3J0IHsgc3RyaXBUcmFpbGluZ1NlcGFyYXRvcnMgfSBmcm9tIFwiLi4vX2NvbW1vbi9zdHJpcF90cmFpbGluZ19zZXBhcmF0b3JzLnRzXCI7XG5pbXBvcnQgeyBpc1Bvc2l4UGF0aFNlcGFyYXRvciB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBkaXJlY3RvcnkgcGF0aCBvZiBhIGBwYXRoYC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGRpcm5hbWUgfSBmcm9tIFwiQHN0ZC9wYXRoL2Rpcm5hbWVcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhkaXJuYW1lKFwiL2hvbWUvdXNlci9Eb2N1bWVudHMvXCIpKTsgLy8gXCIvaG9tZS91c2VyXCJcbiAqIGNvbnNvbGUubG9nKGRpcm5hbWUoXCIvaG9tZS91c2VyL0RvY3VtZW50cy9pbWFnZS5wbmdcIikpOyAvLyBcIi9ob21lL3VzZXIvRG9jdW1lbnRzXCJcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBwYXRoIC0gcGF0aCB0byBleHRyYWN0IHRoZSBkaXJlY3RvcnkgZnJvbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpcm5hbWUocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgYXNzZXJ0QXJnKHBhdGgpO1xuXG4gIGxldCBlbmQgPSAtMTtcbiAgbGV0IG1hdGNoZWROb25TZXBhcmF0b3IgPSBmYWxzZTtcblxuICBmb3IgKGxldCBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDE7IC0taSkge1xuICAgIGlmIChpc1Bvc2l4UGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoaSkpKSB7XG4gICAgICBpZiAobWF0Y2hlZE5vblNlcGFyYXRvcikge1xuICAgICAgICBlbmQgPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWF0Y2hlZE5vblNlcGFyYXRvciA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gTm8gbWF0Y2hlcy4gRmFsbGJhY2sgYmFzZWQgb24gcHJvdmlkZWQgcGF0aDpcbiAgLy9cbiAgLy8gLSBsZWFkaW5nIHNsYXNoZXMgcGF0aHNcbiAgLy8gICAgIFwiL2Zvb1wiID0+IFwiL1wiXG4gIC8vICAgICBcIi8vL2Zvb1wiID0+IFwiL1wiXG4gIC8vIC0gbm8gc2xhc2ggcGF0aFxuICAvLyAgICAgXCJmb29cIiA9PiBcIi5cIlxuICBpZiAoZW5kID09PSAtMSkge1xuICAgIHJldHVybiBpc1Bvc2l4UGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoMCkpID8gXCIvXCIgOiBcIi5cIjtcbiAgfVxuXG4gIHJldHVybiBzdHJpcFRyYWlsaW5nU2VwYXJhdG9ycyhcbiAgICBwYXRoLnNsaWNlKDAsIGVuZCksXG4gICAgaXNQb3NpeFBhdGhTZXBhcmF0b3IsXG4gICk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFNBQVMsUUFBUSx3QkFBd0I7QUFDbEQsU0FBUyx1QkFBdUIsUUFBUSwwQ0FBMEM7QUFDbEYsU0FBUyxvQkFBb0IsUUFBUSxhQUFhO0FBRWxEOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxRQUFRLElBQVk7RUFDbEMsVUFBVTtFQUVWLElBQUksTUFBTSxDQUFDO0VBQ1gsSUFBSSxzQkFBc0I7RUFFMUIsSUFBSyxJQUFJLElBQUksS0FBSyxNQUFNLEdBQUcsR0FBRyxLQUFLLEdBQUcsRUFBRSxFQUFHO0lBQ3pDLElBQUkscUJBQXFCLEtBQUssVUFBVSxDQUFDLEtBQUs7TUFDNUMsSUFBSSxxQkFBcUI7UUFDdkIsTUFBTTtRQUNOO01BQ0Y7SUFDRixPQUFPO01BQ0wsc0JBQXNCO0lBQ3hCO0VBQ0Y7RUFFQSwrQ0FBK0M7RUFDL0MsRUFBRTtFQUNGLDBCQUEwQjtFQUMxQixvQkFBb0I7RUFDcEIsc0JBQXNCO0VBQ3RCLGtCQUFrQjtFQUNsQixtQkFBbUI7RUFDbkIsSUFBSSxRQUFRLENBQUMsR0FBRztJQUNkLE9BQU8scUJBQXFCLEtBQUssVUFBVSxDQUFDLE1BQU0sTUFBTTtFQUMxRDtFQUVBLE9BQU8sd0JBQ0wsS0FBSyxLQUFLLENBQUMsR0FBRyxNQUNkO0FBRUoifQ==
// denoCacheMetadata=16406160557226160753,12878946537026388655