// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { basename as posixBasename } from "./posix/basename.ts";
import { basename as windowsBasename } from "./windows/basename.ts";
/**
 * Return the last portion of a `path`.
 * Trailing directory separators are ignored, and optional suffix is removed.
 *
 * @example
 * ```ts
 * import { basename } from "@std/path/basename";
 *
 * basename("/home/user/Documents/"); // "Documents"
 * basename("C:\\user\\Documents\\image.png"); // "image.png"
 * basename("/home/user/Documents/image.png", ".png"); // "image"
 * ```
 *
 * @param path - path to extract the name from.
 * @param [suffix] - suffix to remove from extracted name.
 */ export function basename(path, suffix = "") {
  return isWindows ? windowsBasename(path, suffix) : posixBasename(path, suffix);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL2Jhc2VuYW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGlzV2luZG93cyB9IGZyb20gXCIuL19vcy50c1wiO1xuaW1wb3J0IHsgYmFzZW5hbWUgYXMgcG9zaXhCYXNlbmFtZSB9IGZyb20gXCIuL3Bvc2l4L2Jhc2VuYW1lLnRzXCI7XG5pbXBvcnQgeyBiYXNlbmFtZSBhcyB3aW5kb3dzQmFzZW5hbWUgfSBmcm9tIFwiLi93aW5kb3dzL2Jhc2VuYW1lLnRzXCI7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBsYXN0IHBvcnRpb24gb2YgYSBgcGF0aGAuXG4gKiBUcmFpbGluZyBkaXJlY3Rvcnkgc2VwYXJhdG9ycyBhcmUgaWdub3JlZCwgYW5kIG9wdGlvbmFsIHN1ZmZpeCBpcyByZW1vdmVkLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgYmFzZW5hbWUgfSBmcm9tIFwiQHN0ZC9wYXRoL2Jhc2VuYW1lXCI7XG4gKlxuICogYmFzZW5hbWUoXCIvaG9tZS91c2VyL0RvY3VtZW50cy9cIik7IC8vIFwiRG9jdW1lbnRzXCJcbiAqIGJhc2VuYW1lKFwiQzpcXFxcdXNlclxcXFxEb2N1bWVudHNcXFxcaW1hZ2UucG5nXCIpOyAvLyBcImltYWdlLnBuZ1wiXG4gKiBiYXNlbmFtZShcIi9ob21lL3VzZXIvRG9jdW1lbnRzL2ltYWdlLnBuZ1wiLCBcIi5wbmdcIik7IC8vIFwiaW1hZ2VcIlxuICogYGBgXG4gKlxuICogQHBhcmFtIHBhdGggLSBwYXRoIHRvIGV4dHJhY3QgdGhlIG5hbWUgZnJvbS5cbiAqIEBwYXJhbSBbc3VmZml4XSAtIHN1ZmZpeCB0byByZW1vdmUgZnJvbSBleHRyYWN0ZWQgbmFtZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJhc2VuYW1lKHBhdGg6IHN0cmluZywgc3VmZml4ID0gXCJcIik6IHN0cmluZyB7XG4gIHJldHVybiBpc1dpbmRvd3NcbiAgICA/IHdpbmRvd3NCYXNlbmFtZShwYXRoLCBzdWZmaXgpXG4gICAgOiBwb3NpeEJhc2VuYW1lKHBhdGgsIHN1ZmZpeCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFNBQVMsUUFBUSxXQUFXO0FBQ3JDLFNBQVMsWUFBWSxhQUFhLFFBQVEsc0JBQXNCO0FBQ2hFLFNBQVMsWUFBWSxlQUFlLFFBQVEsd0JBQXdCO0FBRXBFOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUNELE9BQU8sU0FBUyxTQUFTLElBQVksRUFBRSxTQUFTLEVBQUU7RUFDaEQsT0FBTyxZQUNILGdCQUFnQixNQUFNLFVBQ3RCLGNBQWMsTUFBTTtBQUMxQiJ9
// denoCacheMetadata=977548189378511334,8191908201675908842