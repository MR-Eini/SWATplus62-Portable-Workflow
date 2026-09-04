// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { normalizeString } from "../_common/normalize_string.ts";
import { assertPath } from "../_common/assert_path.ts";
import { isPosixPathSeparator } from "./_util.ts";
/**
 * Resolves path segments into a `path`.
 *
 * @example Usage
 * ```ts
 * import { resolve } from "@std/path/posix/resolve";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const path = resolve("/foo", "bar", "baz/asdf", "quux", "..");
 * assertEquals(path, "/foo/bar/baz/asdf");
 * ```
 *
 * @param pathSegments The path segments to resolve.
 * @returns The resolved path.
 */ export function resolve(...pathSegments) {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
    let path;
    if (i >= 0) path = pathSegments[i];
    else {
      // deno-lint-ignore no-explicit-any
      const { Deno } = globalThis;
      if (typeof Deno?.cwd !== "function") {
        throw new TypeError("Resolved a relative path without a CWD.");
      }
      path = Deno.cwd();
    }
    assertPath(path);
    // Skip empty entries
    if (path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isPosixPathSeparator(path.charCodeAt(0));
  }
  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when Deno.cwd() fails)
  // Normalize the path
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
  if (resolvedAbsolute) {
    if (resolvedPath.length > 0) return `/${resolvedPath}`;
    else return "/";
  } else if (resolvedPath.length > 0) return resolvedPath;
  else return ".";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjAuMC1yYy4yL3Bvc2l4L3Jlc29sdmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgbm9ybWFsaXplU3RyaW5nIH0gZnJvbSBcIi4uL19jb21tb24vbm9ybWFsaXplX3N0cmluZy50c1wiO1xuaW1wb3J0IHsgYXNzZXJ0UGF0aCB9IGZyb20gXCIuLi9fY29tbW9uL2Fzc2VydF9wYXRoLnRzXCI7XG5pbXBvcnQgeyBpc1Bvc2l4UGF0aFNlcGFyYXRvciB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5cbi8qKlxuICogUmVzb2x2ZXMgcGF0aCBzZWdtZW50cyBpbnRvIGEgYHBhdGhgLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJAc3RkL3BhdGgvcG9zaXgvcmVzb2x2ZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBwYXRoID0gcmVzb2x2ZShcIi9mb29cIiwgXCJiYXJcIiwgXCJiYXovYXNkZlwiLCBcInF1dXhcIiwgXCIuLlwiKTtcbiAqIGFzc2VydEVxdWFscyhwYXRoLCBcIi9mb28vYmFyL2Jhei9hc2RmXCIpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHBhdGhTZWdtZW50cyBUaGUgcGF0aCBzZWdtZW50cyB0byByZXNvbHZlLlxuICogQHJldHVybnMgVGhlIHJlc29sdmVkIHBhdGguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlKC4uLnBhdGhTZWdtZW50czogc3RyaW5nW10pOiBzdHJpbmcge1xuICBsZXQgcmVzb2x2ZWRQYXRoID0gXCJcIjtcbiAgbGV0IHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblxuICBmb3IgKGxldCBpID0gcGF0aFNlZ21lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIGxldCBwYXRoOiBzdHJpbmc7XG5cbiAgICBpZiAoaSA+PSAwKSBwYXRoID0gcGF0aFNlZ21lbnRzW2ldITtcbiAgICBlbHNlIHtcbiAgICAgIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICAgICBjb25zdCB7IERlbm8gfSA9IGdsb2JhbFRoaXMgYXMgYW55O1xuICAgICAgaWYgKHR5cGVvZiBEZW5vPy5jd2QgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUmVzb2x2ZWQgYSByZWxhdGl2ZSBwYXRoIHdpdGhvdXQgYSBDV0QuXCIpO1xuICAgICAgfVxuICAgICAgcGF0aCA9IERlbm8uY3dkKCk7XG4gICAgfVxuXG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgIC8vIFNraXAgZW1wdHkgZW50cmllc1xuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgcmVzb2x2ZWRQYXRoID0gYCR7cGF0aH0vJHtyZXNvbHZlZFBhdGh9YDtcbiAgICByZXNvbHZlZEFic29sdXRlID0gaXNQb3NpeFBhdGhTZXBhcmF0b3IocGF0aC5jaGFyQ29kZUF0KDApKTtcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbiAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIERlbm8uY3dkKCkgZmFpbHMpXG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZVN0cmluZyhcbiAgICByZXNvbHZlZFBhdGgsXG4gICAgIXJlc29sdmVkQWJzb2x1dGUsXG4gICAgXCIvXCIsXG4gICAgaXNQb3NpeFBhdGhTZXBhcmF0b3IsXG4gICk7XG5cbiAgaWYgKHJlc29sdmVkQWJzb2x1dGUpIHtcbiAgICBpZiAocmVzb2x2ZWRQYXRoLmxlbmd0aCA+IDApIHJldHVybiBgLyR7cmVzb2x2ZWRQYXRofWA7XG4gICAgZWxzZSByZXR1cm4gXCIvXCI7XG4gIH0gZWxzZSBpZiAocmVzb2x2ZWRQYXRoLmxlbmd0aCA+IDApIHJldHVybiByZXNvbHZlZFBhdGg7XG4gIGVsc2UgcmV0dXJuIFwiLlwiO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxlQUFlLFFBQVEsaUNBQWlDO0FBQ2pFLFNBQVMsVUFBVSxRQUFRLDRCQUE0QjtBQUN2RCxTQUFTLG9CQUFvQixRQUFRLGFBQWE7QUFFbEQ7Ozs7Ozs7Ozs7Ozs7O0NBY0MsR0FDRCxPQUFPLFNBQVMsUUFBUSxHQUFHLFlBQXNCO0VBQy9DLElBQUksZUFBZTtFQUNuQixJQUFJLG1CQUFtQjtFQUV2QixJQUFLLElBQUksSUFBSSxhQUFhLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLElBQUs7SUFDdkUsSUFBSTtJQUVKLElBQUksS0FBSyxHQUFHLE9BQU8sWUFBWSxDQUFDLEVBQUU7U0FDN0I7TUFDSCxtQ0FBbUM7TUFDbkMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHO01BQ2pCLElBQUksT0FBTyxNQUFNLFFBQVEsWUFBWTtRQUNuQyxNQUFNLElBQUksVUFBVTtNQUN0QjtNQUNBLE9BQU8sS0FBSyxHQUFHO0lBQ2pCO0lBRUEsV0FBVztJQUVYLHFCQUFxQjtJQUNyQixJQUFJLEtBQUssTUFBTSxLQUFLLEdBQUc7TUFDckI7SUFDRjtJQUVBLGVBQWUsR0FBRyxLQUFLLENBQUMsRUFBRSxjQUFjO0lBQ3hDLG1CQUFtQixxQkFBcUIsS0FBSyxVQUFVLENBQUM7RUFDMUQ7RUFFQSx5RUFBeUU7RUFDekUsd0VBQXdFO0VBRXhFLHFCQUFxQjtFQUNyQixlQUFlLGdCQUNiLGNBQ0EsQ0FBQyxrQkFDRCxLQUNBO0VBR0YsSUFBSSxrQkFBa0I7SUFDcEIsSUFBSSxhQUFhLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsY0FBYztTQUNqRCxPQUFPO0VBQ2QsT0FBTyxJQUFJLGFBQWEsTUFBTSxHQUFHLEdBQUcsT0FBTztPQUN0QyxPQUFPO0FBQ2QifQ==
// denoCacheMetadata=3746298614278984300,4219054853129550646