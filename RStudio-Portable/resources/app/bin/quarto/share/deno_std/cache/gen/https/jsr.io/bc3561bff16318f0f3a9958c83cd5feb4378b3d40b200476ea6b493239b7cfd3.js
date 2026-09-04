// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { toFileUrl as posixToFileUrl } from "./posix/to_file_url.ts";
import { toFileUrl as windowsToFileUrl } from "./windows/to_file_url.ts";
/**
 * Converts a path string to a file URL.
 *
 * ```ts
 * import { toFileUrl } from "@std/path/to-file-url";
 *
 * // posix
 * toFileUrl("/home/foo"); // new URL("file:///home/foo")
 *
 * // win32
 * toFileUrl("\\home\\foo"); // new URL("file:///home/foo")
 * toFileUrl("C:\\Users\\foo"); // new URL("file:///C:/Users/foo")
 * toFileUrl("\\\\127.0.0.1\\home\\foo"); // new URL("file://127.0.0.1/home/foo")
 * ```
 * @param path to convert to file URL
 */ export function toFileUrl(path) {
  return isWindows ? windowsToFileUrl(path) : posixToFileUrl(path);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3RvX2ZpbGVfdXJsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGlzV2luZG93cyB9IGZyb20gXCIuL19vcy50c1wiO1xuaW1wb3J0IHsgdG9GaWxlVXJsIGFzIHBvc2l4VG9GaWxlVXJsIH0gZnJvbSBcIi4vcG9zaXgvdG9fZmlsZV91cmwudHNcIjtcbmltcG9ydCB7IHRvRmlsZVVybCBhcyB3aW5kb3dzVG9GaWxlVXJsIH0gZnJvbSBcIi4vd2luZG93cy90b19maWxlX3VybC50c1wiO1xuXG4vKipcbiAqIENvbnZlcnRzIGEgcGF0aCBzdHJpbmcgdG8gYSBmaWxlIFVSTC5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgdG9GaWxlVXJsIH0gZnJvbSBcIkBzdGQvcGF0aC90by1maWxlLXVybFwiO1xuICpcbiAqIC8vIHBvc2l4XG4gKiB0b0ZpbGVVcmwoXCIvaG9tZS9mb29cIik7IC8vIG5ldyBVUkwoXCJmaWxlOi8vL2hvbWUvZm9vXCIpXG4gKlxuICogLy8gd2luMzJcbiAqIHRvRmlsZVVybChcIlxcXFxob21lXFxcXGZvb1wiKTsgLy8gbmV3IFVSTChcImZpbGU6Ly8vaG9tZS9mb29cIilcbiAqIHRvRmlsZVVybChcIkM6XFxcXFVzZXJzXFxcXGZvb1wiKTsgLy8gbmV3IFVSTChcImZpbGU6Ly8vQzovVXNlcnMvZm9vXCIpXG4gKiB0b0ZpbGVVcmwoXCJcXFxcXFxcXDEyNy4wLjAuMVxcXFxob21lXFxcXGZvb1wiKTsgLy8gbmV3IFVSTChcImZpbGU6Ly8xMjcuMC4wLjEvaG9tZS9mb29cIilcbiAqIGBgYFxuICogQHBhcmFtIHBhdGggdG8gY29udmVydCB0byBmaWxlIFVSTFxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9GaWxlVXJsKHBhdGg6IHN0cmluZyk6IFVSTCB7XG4gIHJldHVybiBpc1dpbmRvd3MgPyB3aW5kb3dzVG9GaWxlVXJsKHBhdGgpIDogcG9zaXhUb0ZpbGVVcmwocGF0aCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFNBQVMsUUFBUSxXQUFXO0FBQ3JDLFNBQVMsYUFBYSxjQUFjLFFBQVEseUJBQXlCO0FBQ3JFLFNBQVMsYUFBYSxnQkFBZ0IsUUFBUSwyQkFBMkI7QUFFekU7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBQ0QsT0FBTyxTQUFTLFVBQVUsSUFBWTtFQUNwQyxPQUFPLFlBQVksaUJBQWlCLFFBQVEsZUFBZTtBQUM3RCJ9
// denoCacheMetadata=3103141589563416263,7800855249299287139