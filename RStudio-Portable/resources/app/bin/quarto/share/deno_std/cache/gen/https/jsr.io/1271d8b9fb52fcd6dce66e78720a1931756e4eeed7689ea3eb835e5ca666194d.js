// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { parse as posixParse } from "./posix/parse.ts";
import { parse as windowsParse } from "./windows/parse.ts";
/**
 * Return a `ParsedPath` object of the `path`. Use `format` to reverse the result.
 *
 * @example
 * ```ts
 * import { parse } from "@std/path";
 *
 * const parsedPathObj = parse("/path/to/dir/script.ts");
 * parsedPathObj.root; // "/"
 * parsedPathObj.dir; // "/path/to/dir"
 * parsedPathObj.base; // "script.ts"
 * parsedPathObj.ext; // ".ts"
 * parsedPathObj.name; // "script"
 * ```
 * @param path to process
 */ export function parse(path) {
  return isWindows ? windowsParse(path) : posixParse(path);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3BhcnNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGlzV2luZG93cyB9IGZyb20gXCIuL19vcy50c1wiO1xuaW1wb3J0IHR5cGUgeyBQYXJzZWRQYXRoIH0gZnJvbSBcIi4vX2ludGVyZmFjZS50c1wiO1xuaW1wb3J0IHsgcGFyc2UgYXMgcG9zaXhQYXJzZSB9IGZyb20gXCIuL3Bvc2l4L3BhcnNlLnRzXCI7XG5pbXBvcnQgeyBwYXJzZSBhcyB3aW5kb3dzUGFyc2UgfSBmcm9tIFwiLi93aW5kb3dzL3BhcnNlLnRzXCI7XG5cbmV4cG9ydCB0eXBlIHsgUGFyc2VkUGF0aCB9IGZyb20gXCIuL19pbnRlcmZhY2UudHNcIjtcblxuLyoqXG4gKiBSZXR1cm4gYSBgUGFyc2VkUGF0aGAgb2JqZWN0IG9mIHRoZSBgcGF0aGAuIFVzZSBgZm9ybWF0YCB0byByZXZlcnNlIHRoZSByZXN1bHQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJAc3RkL3BhdGhcIjtcbiAqXG4gKiBjb25zdCBwYXJzZWRQYXRoT2JqID0gcGFyc2UoXCIvcGF0aC90by9kaXIvc2NyaXB0LnRzXCIpO1xuICogcGFyc2VkUGF0aE9iai5yb290OyAvLyBcIi9cIlxuICogcGFyc2VkUGF0aE9iai5kaXI7IC8vIFwiL3BhdGgvdG8vZGlyXCJcbiAqIHBhcnNlZFBhdGhPYmouYmFzZTsgLy8gXCJzY3JpcHQudHNcIlxuICogcGFyc2VkUGF0aE9iai5leHQ7IC8vIFwiLnRzXCJcbiAqIHBhcnNlZFBhdGhPYmoubmFtZTsgLy8gXCJzY3JpcHRcIlxuICogYGBgXG4gKiBAcGFyYW0gcGF0aCB0byBwcm9jZXNzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShwYXRoOiBzdHJpbmcpOiBQYXJzZWRQYXRoIHtcbiAgcmV0dXJuIGlzV2luZG93cyA/IHdpbmRvd3NQYXJzZShwYXRoKSA6IHBvc2l4UGFyc2UocGF0aCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFNBQVMsUUFBUSxXQUFXO0FBRXJDLFNBQVMsU0FBUyxVQUFVLFFBQVEsbUJBQW1CO0FBQ3ZELFNBQVMsU0FBUyxZQUFZLFFBQVEscUJBQXFCO0FBSTNEOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUNELE9BQU8sU0FBUyxNQUFNLElBQVk7RUFDaEMsT0FBTyxZQUFZLGFBQWEsUUFBUSxXQUFXO0FBQ3JEIn0=
// denoCacheMetadata=8416999377079024727,13621271644326185949