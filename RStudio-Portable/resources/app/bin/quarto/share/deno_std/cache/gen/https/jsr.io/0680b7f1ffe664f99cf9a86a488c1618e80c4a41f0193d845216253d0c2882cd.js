// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { extname as posixExtname } from "./posix/extname.ts";
import { extname as windowsExtname } from "./windows/extname.ts";
/**
 * Return the extension of the path with leading period (".").
 *
 * @example Usage
 * ```ts
 * import { extname } from "@std/path/extname";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(extname("C:\\home\\user\\Documents\\image.png"), ".png");
 * } else {
 *   assertEquals(extname("/home/user/Documents/image.png"), ".png");
 * }
 * ```
 *
 * @param path Path with extension.
 * @returns The file extension. E.g. returns `.ts` for `file.ts`.
 */ export function extname(path) {
  return isWindows ? windowsExtname(path) : posixExtname(path);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjAuMC1yYy4yL2V4dG5hbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgaXNXaW5kb3dzIH0gZnJvbSBcIi4vX29zLnRzXCI7XG5pbXBvcnQgeyBleHRuYW1lIGFzIHBvc2l4RXh0bmFtZSB9IGZyb20gXCIuL3Bvc2l4L2V4dG5hbWUudHNcIjtcbmltcG9ydCB7IGV4dG5hbWUgYXMgd2luZG93c0V4dG5hbWUgfSBmcm9tIFwiLi93aW5kb3dzL2V4dG5hbWUudHNcIjtcbi8qKlxuICogUmV0dXJuIHRoZSBleHRlbnNpb24gb2YgdGhlIHBhdGggd2l0aCBsZWFkaW5nIHBlcmlvZCAoXCIuXCIpLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZXh0bmFtZSB9IGZyb20gXCJAc3RkL3BhdGgvZXh0bmFtZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBpZiAoRGVuby5idWlsZC5vcyA9PT0gXCJ3aW5kb3dzXCIpIHtcbiAqICAgYXNzZXJ0RXF1YWxzKGV4dG5hbWUoXCJDOlxcXFxob21lXFxcXHVzZXJcXFxcRG9jdW1lbnRzXFxcXGltYWdlLnBuZ1wiKSwgXCIucG5nXCIpO1xuICogfSBlbHNlIHtcbiAqICAgYXNzZXJ0RXF1YWxzKGV4dG5hbWUoXCIvaG9tZS91c2VyL0RvY3VtZW50cy9pbWFnZS5wbmdcIiksIFwiLnBuZ1wiKTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBwYXRoIFBhdGggd2l0aCBleHRlbnNpb24uXG4gKiBAcmV0dXJucyBUaGUgZmlsZSBleHRlbnNpb24uIEUuZy4gcmV0dXJucyBgLnRzYCBmb3IgYGZpbGUudHNgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0bmFtZShwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaXNXaW5kb3dzID8gd2luZG93c0V4dG5hbWUocGF0aCkgOiBwb3NpeEV4dG5hbWUocGF0aCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFNBQVMsUUFBUSxXQUFXO0FBQ3JDLFNBQVMsV0FBVyxZQUFZLFFBQVEscUJBQXFCO0FBQzdELFNBQVMsV0FBVyxjQUFjLFFBQVEsdUJBQXVCO0FBQ2pFOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCQyxHQUNELE9BQU8sU0FBUyxRQUFRLElBQVk7RUFDbEMsT0FBTyxZQUFZLGVBQWUsUUFBUSxhQUFhO0FBQ3pEIn0=
// denoCacheMetadata=10770234536656935660,4127980098153989219