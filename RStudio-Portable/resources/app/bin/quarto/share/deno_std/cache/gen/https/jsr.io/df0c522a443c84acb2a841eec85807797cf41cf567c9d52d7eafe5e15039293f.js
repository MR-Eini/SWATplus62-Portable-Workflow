// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assertArgs, lastPathSegment, stripSuffix } from "../_common/basename.ts";
import { stripTrailingSeparators } from "../_common/strip_trailing_separators.ts";
import { isPosixPathSeparator } from "./_util.ts";
/**
 * Return the last portion of a `path`.
 * Trailing directory separators are ignored, and optional suffix is removed.
 *
 * @example
 * ```ts
 * import { basename } from "@std/path/basename";
 *
 * console.log(basename("/home/user/Documents/")); // "Documents"
 * console.log(basename("/home/user/Documents/image.png")); // "image.png"
 * console.log(basename("/home/user/Documents/image.png", ".png")); // "image"
 * ```
 *
 * @param path - path to extract the name from.
 * @param [suffix] - suffix to remove from extracted name.
 */ export function basename(path, suffix = "") {
  assertArgs(path, suffix);
  const lastSegment = lastPathSegment(path, isPosixPathSeparator);
  const strippedSegment = stripTrailingSeparators(lastSegment, isPosixPathSeparator);
  return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3Bvc2l4L2Jhc2VuYW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7XG4gIGFzc2VydEFyZ3MsXG4gIGxhc3RQYXRoU2VnbWVudCxcbiAgc3RyaXBTdWZmaXgsXG59IGZyb20gXCIuLi9fY29tbW9uL2Jhc2VuYW1lLnRzXCI7XG5pbXBvcnQgeyBzdHJpcFRyYWlsaW5nU2VwYXJhdG9ycyB9IGZyb20gXCIuLi9fY29tbW9uL3N0cmlwX3RyYWlsaW5nX3NlcGFyYXRvcnMudHNcIjtcbmltcG9ydCB7IGlzUG9zaXhQYXRoU2VwYXJhdG9yIH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxhc3QgcG9ydGlvbiBvZiBhIGBwYXRoYC5cbiAqIFRyYWlsaW5nIGRpcmVjdG9yeSBzZXBhcmF0b3JzIGFyZSBpZ25vcmVkLCBhbmQgb3B0aW9uYWwgc3VmZml4IGlzIHJlbW92ZWQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBiYXNlbmFtZSB9IGZyb20gXCJAc3RkL3BhdGgvYmFzZW5hbWVcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhiYXNlbmFtZShcIi9ob21lL3VzZXIvRG9jdW1lbnRzL1wiKSk7IC8vIFwiRG9jdW1lbnRzXCJcbiAqIGNvbnNvbGUubG9nKGJhc2VuYW1lKFwiL2hvbWUvdXNlci9Eb2N1bWVudHMvaW1hZ2UucG5nXCIpKTsgLy8gXCJpbWFnZS5wbmdcIlxuICogY29uc29sZS5sb2coYmFzZW5hbWUoXCIvaG9tZS91c2VyL0RvY3VtZW50cy9pbWFnZS5wbmdcIiwgXCIucG5nXCIpKTsgLy8gXCJpbWFnZVwiXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gcGF0aCAtIHBhdGggdG8gZXh0cmFjdCB0aGUgbmFtZSBmcm9tLlxuICogQHBhcmFtIFtzdWZmaXhdIC0gc3VmZml4IHRvIHJlbW92ZSBmcm9tIGV4dHJhY3RlZCBuYW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZW5hbWUocGF0aDogc3RyaW5nLCBzdWZmaXggPSBcIlwiKTogc3RyaW5nIHtcbiAgYXNzZXJ0QXJncyhwYXRoLCBzdWZmaXgpO1xuXG4gIGNvbnN0IGxhc3RTZWdtZW50ID0gbGFzdFBhdGhTZWdtZW50KHBhdGgsIGlzUG9zaXhQYXRoU2VwYXJhdG9yKTtcbiAgY29uc3Qgc3RyaXBwZWRTZWdtZW50ID0gc3RyaXBUcmFpbGluZ1NlcGFyYXRvcnMoXG4gICAgbGFzdFNlZ21lbnQsXG4gICAgaXNQb3NpeFBhdGhTZXBhcmF0b3IsXG4gICk7XG4gIHJldHVybiBzdWZmaXggPyBzdHJpcFN1ZmZpeChzdHJpcHBlZFNlZ21lbnQsIHN1ZmZpeCkgOiBzdHJpcHBlZFNlZ21lbnQ7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUNFLFVBQVUsRUFDVixlQUFlLEVBQ2YsV0FBVyxRQUNOLHlCQUF5QjtBQUNoQyxTQUFTLHVCQUF1QixRQUFRLDBDQUEwQztBQUNsRixTQUFTLG9CQUFvQixRQUFRLGFBQWE7QUFFbEQ7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBQ0QsT0FBTyxTQUFTLFNBQVMsSUFBWSxFQUFFLFNBQVMsRUFBRTtFQUNoRCxXQUFXLE1BQU07RUFFakIsTUFBTSxjQUFjLGdCQUFnQixNQUFNO0VBQzFDLE1BQU0sa0JBQWtCLHdCQUN0QixhQUNBO0VBRUYsT0FBTyxTQUFTLFlBQVksaUJBQWlCLFVBQVU7QUFDekQifQ==
// denoCacheMetadata=17241532792480248861,527678173263506966