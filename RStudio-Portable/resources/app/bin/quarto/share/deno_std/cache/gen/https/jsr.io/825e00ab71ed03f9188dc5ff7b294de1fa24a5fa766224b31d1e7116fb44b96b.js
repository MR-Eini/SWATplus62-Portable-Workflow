// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { relative as posixRelative } from "./posix/relative.ts";
import { relative as windowsRelative } from "./windows/relative.ts";
/**
 * Return the relative path from `from` to `to` based on current working
 * directory.
 *
 * @example Usage
 * ```ts
 * import { relative } from "@std/path/relative";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * if (Deno.build.os === "windows") {
 *   const path = relative("C:\\foobar\\test\\aaa", "C:\\foobar\\impl\\bbb");
 *   assertEquals(path, "..\\..\\impl\\bbb");
 * } else {
 *   const path = relative("/data/foobar/test/aaa", "/data/foobar/impl/bbb");
 *   assertEquals(path, "../../impl/bbb");
 * }
 * ```
 *
 * @param from Path in current working directory.
 * @param to Path in current working directory.
 * @returns The relative path from `from` to `to`.
 */ export function relative(from, to) {
  return isWindows ? windowsRelative(from, to) : posixRelative(from, to);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjAuMC1yYy4yL3JlbGF0aXZlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGlzV2luZG93cyB9IGZyb20gXCIuL19vcy50c1wiO1xuaW1wb3J0IHsgcmVsYXRpdmUgYXMgcG9zaXhSZWxhdGl2ZSB9IGZyb20gXCIuL3Bvc2l4L3JlbGF0aXZlLnRzXCI7XG5pbXBvcnQgeyByZWxhdGl2ZSBhcyB3aW5kb3dzUmVsYXRpdmUgfSBmcm9tIFwiLi93aW5kb3dzL3JlbGF0aXZlLnRzXCI7XG5cbi8qKlxuICogUmV0dXJuIHRoZSByZWxhdGl2ZSBwYXRoIGZyb20gYGZyb21gIHRvIGB0b2AgYmFzZWQgb24gY3VycmVudCB3b3JraW5nXG4gKiBkaXJlY3RvcnkuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyByZWxhdGl2ZSB9IGZyb20gXCJAc3RkL3BhdGgvcmVsYXRpdmVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogaWYgKERlbm8uYnVpbGQub3MgPT09IFwid2luZG93c1wiKSB7XG4gKiAgIGNvbnN0IHBhdGggPSByZWxhdGl2ZShcIkM6XFxcXGZvb2JhclxcXFx0ZXN0XFxcXGFhYVwiLCBcIkM6XFxcXGZvb2JhclxcXFxpbXBsXFxcXGJiYlwiKTtcbiAqICAgYXNzZXJ0RXF1YWxzKHBhdGgsIFwiLi5cXFxcLi5cXFxcaW1wbFxcXFxiYmJcIik7XG4gKiB9IGVsc2Uge1xuICogICBjb25zdCBwYXRoID0gcmVsYXRpdmUoXCIvZGF0YS9mb29iYXIvdGVzdC9hYWFcIiwgXCIvZGF0YS9mb29iYXIvaW1wbC9iYmJcIik7XG4gKiAgIGFzc2VydEVxdWFscyhwYXRoLCBcIi4uLy4uL2ltcGwvYmJiXCIpO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIGZyb20gUGF0aCBpbiBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlxuICogQHBhcmFtIHRvIFBhdGggaW4gY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAqIEByZXR1cm5zIFRoZSByZWxhdGl2ZSBwYXRoIGZyb20gYGZyb21gIHRvIGB0b2AuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWxhdGl2ZShmcm9tOiBzdHJpbmcsIHRvOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaXNXaW5kb3dzID8gd2luZG93c1JlbGF0aXZlKGZyb20sIHRvKSA6IHBvc2l4UmVsYXRpdmUoZnJvbSwgdG8pO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxTQUFTLFFBQVEsV0FBVztBQUNyQyxTQUFTLFlBQVksYUFBYSxRQUFRLHNCQUFzQjtBQUNoRSxTQUFTLFlBQVksZUFBZSxRQUFRLHdCQUF3QjtBQUVwRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBcUJDLEdBQ0QsT0FBTyxTQUFTLFNBQVMsSUFBWSxFQUFFLEVBQVU7RUFDL0MsT0FBTyxZQUFZLGdCQUFnQixNQUFNLE1BQU0sY0FBYyxNQUFNO0FBQ3JFIn0=
// denoCacheMetadata=8413170878425318173,7531017726530624253