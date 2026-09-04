// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { resolve as posixResolve } from "./posix/resolve.ts";
import { resolve as windowsResolve } from "./windows/resolve.ts";
/**
 * Resolves path segments into a path.
 *
 * @example Usage
 * ```ts
 * import { resolve } from "@std/path/resolve";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(resolve("C:\\foo", "bar", "baz"), "C:\\foo\\bar\\baz");
 *   assertEquals(resolve("C:\\foo", "C:\\bar", "baz"), "C:\\bar\\baz");
 * } else {
 *   assertEquals(resolve("/foo", "bar", "baz"), "/foo/bar/baz");
 *   assertEquals(resolve("/foo", "/bar", "baz"), "/bar/baz");
 * }
 * ```
 *
 * @param pathSegments Path segments to process to path.
 * @returns The resolved path.
 */ export function resolve(...pathSegments) {
  return isWindows ? windowsResolve(...pathSegments) : posixResolve(...pathSegments);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjAuMC1yYy4yL3Jlc29sdmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgaXNXaW5kb3dzIH0gZnJvbSBcIi4vX29zLnRzXCI7XG5pbXBvcnQgeyByZXNvbHZlIGFzIHBvc2l4UmVzb2x2ZSB9IGZyb20gXCIuL3Bvc2l4L3Jlc29sdmUudHNcIjtcbmltcG9ydCB7IHJlc29sdmUgYXMgd2luZG93c1Jlc29sdmUgfSBmcm9tIFwiLi93aW5kb3dzL3Jlc29sdmUudHNcIjtcblxuLyoqXG4gKiBSZXNvbHZlcyBwYXRoIHNlZ21lbnRzIGludG8gYSBwYXRoLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJAc3RkL3BhdGgvcmVzb2x2ZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBpZiAoRGVuby5idWlsZC5vcyA9PT0gXCJ3aW5kb3dzXCIpIHtcbiAqICAgYXNzZXJ0RXF1YWxzKHJlc29sdmUoXCJDOlxcXFxmb29cIiwgXCJiYXJcIiwgXCJiYXpcIiksIFwiQzpcXFxcZm9vXFxcXGJhclxcXFxiYXpcIik7XG4gKiAgIGFzc2VydEVxdWFscyhyZXNvbHZlKFwiQzpcXFxcZm9vXCIsIFwiQzpcXFxcYmFyXCIsIFwiYmF6XCIpLCBcIkM6XFxcXGJhclxcXFxiYXpcIik7XG4gKiB9IGVsc2Uge1xuICogICBhc3NlcnRFcXVhbHMocmVzb2x2ZShcIi9mb29cIiwgXCJiYXJcIiwgXCJiYXpcIiksIFwiL2Zvby9iYXIvYmF6XCIpO1xuICogICBhc3NlcnRFcXVhbHMocmVzb2x2ZShcIi9mb29cIiwgXCIvYmFyXCIsIFwiYmF6XCIpLCBcIi9iYXIvYmF6XCIpO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIHBhdGhTZWdtZW50cyBQYXRoIHNlZ21lbnRzIHRvIHByb2Nlc3MgdG8gcGF0aC5cbiAqIEByZXR1cm5zIFRoZSByZXNvbHZlZCBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZSguLi5wYXRoU2VnbWVudHM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlzV2luZG93c1xuICAgID8gd2luZG93c1Jlc29sdmUoLi4ucGF0aFNlZ21lbnRzKVxuICAgIDogcG9zaXhSZXNvbHZlKC4uLnBhdGhTZWdtZW50cyk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFNBQVMsUUFBUSxXQUFXO0FBQ3JDLFNBQVMsV0FBVyxZQUFZLFFBQVEscUJBQXFCO0FBQzdELFNBQVMsV0FBVyxjQUFjLFFBQVEsdUJBQXVCO0FBRWpFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBQ0QsT0FBTyxTQUFTLFFBQVEsR0FBRyxZQUFzQjtFQUMvQyxPQUFPLFlBQ0gsa0JBQWtCLGdCQUNsQixnQkFBZ0I7QUFDdEIifQ==
// denoCacheMetadata=1983195832378132576,18275712160344919100