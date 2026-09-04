// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { fromFileUrl as posixFromFileUrl } from "./posix/from_file_url.ts";
import { fromFileUrl as windowsFromFileUrl } from "./windows/from_file_url.ts";
/**
 * Converts a file URL to a path string.
 *
 * ```ts
 * import { fromFileUrl } from "@std/path/from-file-url";
 *
 * // posix
 * fromFileUrl("file:///home/foo"); // "/home/foo"
 *
 * // win32
 * fromFileUrl("file:///home/foo"); // "\\home\\foo"
 * fromFileUrl("file:///C:/Users/foo"); // "C:\\Users\\foo"
 * fromFileUrl("file://localhost/home/foo"); // "\\\\localhost\\home\\foo"
 * ```
 * @param url of a file URL
 */ export function fromFileUrl(url) {
  return isWindows ? windowsFromFileUrl(url) : posixFromFileUrl(url);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL2Zyb21fZmlsZV91cmwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgaXNXaW5kb3dzIH0gZnJvbSBcIi4vX29zLnRzXCI7XG5pbXBvcnQgeyBmcm9tRmlsZVVybCBhcyBwb3NpeEZyb21GaWxlVXJsIH0gZnJvbSBcIi4vcG9zaXgvZnJvbV9maWxlX3VybC50c1wiO1xuaW1wb3J0IHsgZnJvbUZpbGVVcmwgYXMgd2luZG93c0Zyb21GaWxlVXJsIH0gZnJvbSBcIi4vd2luZG93cy9mcm9tX2ZpbGVfdXJsLnRzXCI7XG5cbi8qKlxuICogQ29udmVydHMgYSBmaWxlIFVSTCB0byBhIHBhdGggc3RyaW5nLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBmcm9tRmlsZVVybCB9IGZyb20gXCJAc3RkL3BhdGgvZnJvbS1maWxlLXVybFwiO1xuICpcbiAqIC8vIHBvc2l4XG4gKiBmcm9tRmlsZVVybChcImZpbGU6Ly8vaG9tZS9mb29cIik7IC8vIFwiL2hvbWUvZm9vXCJcbiAqXG4gKiAvLyB3aW4zMlxuICogZnJvbUZpbGVVcmwoXCJmaWxlOi8vL2hvbWUvZm9vXCIpOyAvLyBcIlxcXFxob21lXFxcXGZvb1wiXG4gKiBmcm9tRmlsZVVybChcImZpbGU6Ly8vQzovVXNlcnMvZm9vXCIpOyAvLyBcIkM6XFxcXFVzZXJzXFxcXGZvb1wiXG4gKiBmcm9tRmlsZVVybChcImZpbGU6Ly9sb2NhbGhvc3QvaG9tZS9mb29cIik7IC8vIFwiXFxcXFxcXFxsb2NhbGhvc3RcXFxcaG9tZVxcXFxmb29cIlxuICogYGBgXG4gKiBAcGFyYW0gdXJsIG9mIGEgZmlsZSBVUkxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21GaWxlVXJsKHVybDogc3RyaW5nIHwgVVJMKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlzV2luZG93cyA/IHdpbmRvd3NGcm9tRmlsZVVybCh1cmwpIDogcG9zaXhGcm9tRmlsZVVybCh1cmwpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxTQUFTLFFBQVEsV0FBVztBQUNyQyxTQUFTLGVBQWUsZ0JBQWdCLFFBQVEsMkJBQTJCO0FBQzNFLFNBQVMsZUFBZSxrQkFBa0IsUUFBUSw2QkFBNkI7QUFFL0U7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBQ0QsT0FBTyxTQUFTLFlBQVksR0FBaUI7RUFDM0MsT0FBTyxZQUFZLG1CQUFtQixPQUFPLGlCQUFpQjtBQUNoRSJ9
// denoCacheMetadata=18227136919210796403,5261607157393875229