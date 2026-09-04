// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assertArgs, lastPathSegment, stripSuffix } from "../_common/basename.ts";
import { CHAR_COLON } from "../_common/constants.ts";
import { stripTrailingSeparators } from "../_common/strip_trailing_separators.ts";
import { isPathSeparator, isWindowsDeviceRoot } from "./_util.ts";
/**
 * Return the last portion of a `path`.
 * Trailing directory separators are ignored, and optional suffix is removed.
 *
 * @example
 * ```ts
 * import { basename } from "@std/path/basename";
 *
 * basename("C:\\user\\Documents\\"); // "Documents"
 * basename("C:\\user\\Documents\\image.png"); // "image.png"
 * basename("C:\\user\\Documents\\image.png", ".png"); // "image"
 * ```
 *
 * @param path - path to extract the name from.
 * @param [suffix] - suffix to remove from extracted name.
 */ export function basename(path, suffix = "") {
  assertArgs(path, suffix);
  // Check for a drive letter prefix so as not to mistake the following
  // path separator as an extra separator at the end of the path that can be
  // disregarded
  let start = 0;
  if (path.length >= 2) {
    const drive = path.charCodeAt(0);
    if (isWindowsDeviceRoot(drive)) {
      if (path.charCodeAt(1) === CHAR_COLON) start = 2;
    }
  }
  const lastSegment = lastPathSegment(path, isPathSeparator, start);
  const strippedSegment = stripTrailingSeparators(lastSegment, isPathSeparator);
  return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3dpbmRvd3MvYmFzZW5hbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHtcbiAgYXNzZXJ0QXJncyxcbiAgbGFzdFBhdGhTZWdtZW50LFxuICBzdHJpcFN1ZmZpeCxcbn0gZnJvbSBcIi4uL19jb21tb24vYmFzZW5hbWUudHNcIjtcbmltcG9ydCB7IENIQVJfQ09MT04gfSBmcm9tIFwiLi4vX2NvbW1vbi9jb25zdGFudHMudHNcIjtcbmltcG9ydCB7IHN0cmlwVHJhaWxpbmdTZXBhcmF0b3JzIH0gZnJvbSBcIi4uL19jb21tb24vc3RyaXBfdHJhaWxpbmdfc2VwYXJhdG9ycy50c1wiO1xuaW1wb3J0IHsgaXNQYXRoU2VwYXJhdG9yLCBpc1dpbmRvd3NEZXZpY2VSb290IH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxhc3QgcG9ydGlvbiBvZiBhIGBwYXRoYC5cbiAqIFRyYWlsaW5nIGRpcmVjdG9yeSBzZXBhcmF0b3JzIGFyZSBpZ25vcmVkLCBhbmQgb3B0aW9uYWwgc3VmZml4IGlzIHJlbW92ZWQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBiYXNlbmFtZSB9IGZyb20gXCJAc3RkL3BhdGgvYmFzZW5hbWVcIjtcbiAqXG4gKiBiYXNlbmFtZShcIkM6XFxcXHVzZXJcXFxcRG9jdW1lbnRzXFxcXFwiKTsgLy8gXCJEb2N1bWVudHNcIlxuICogYmFzZW5hbWUoXCJDOlxcXFx1c2VyXFxcXERvY3VtZW50c1xcXFxpbWFnZS5wbmdcIik7IC8vIFwiaW1hZ2UucG5nXCJcbiAqIGJhc2VuYW1lKFwiQzpcXFxcdXNlclxcXFxEb2N1bWVudHNcXFxcaW1hZ2UucG5nXCIsIFwiLnBuZ1wiKTsgLy8gXCJpbWFnZVwiXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gcGF0aCAtIHBhdGggdG8gZXh0cmFjdCB0aGUgbmFtZSBmcm9tLlxuICogQHBhcmFtIFtzdWZmaXhdIC0gc3VmZml4IHRvIHJlbW92ZSBmcm9tIGV4dHJhY3RlZCBuYW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZW5hbWUocGF0aDogc3RyaW5nLCBzdWZmaXggPSBcIlwiKTogc3RyaW5nIHtcbiAgYXNzZXJ0QXJncyhwYXRoLCBzdWZmaXgpO1xuXG4gIC8vIENoZWNrIGZvciBhIGRyaXZlIGxldHRlciBwcmVmaXggc28gYXMgbm90IHRvIG1pc3Rha2UgdGhlIGZvbGxvd2luZ1xuICAvLyBwYXRoIHNlcGFyYXRvciBhcyBhbiBleHRyYSBzZXBhcmF0b3IgYXQgdGhlIGVuZCBvZiB0aGUgcGF0aCB0aGF0IGNhbiBiZVxuICAvLyBkaXNyZWdhcmRlZFxuICBsZXQgc3RhcnQgPSAwO1xuICBpZiAocGF0aC5sZW5ndGggPj0gMikge1xuICAgIGNvbnN0IGRyaXZlID0gcGF0aC5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChpc1dpbmRvd3NEZXZpY2VSb290KGRyaXZlKSkge1xuICAgICAgaWYgKHBhdGguY2hhckNvZGVBdCgxKSA9PT0gQ0hBUl9DT0xPTikgc3RhcnQgPSAyO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGxhc3RTZWdtZW50ID0gbGFzdFBhdGhTZWdtZW50KHBhdGgsIGlzUGF0aFNlcGFyYXRvciwgc3RhcnQpO1xuICBjb25zdCBzdHJpcHBlZFNlZ21lbnQgPSBzdHJpcFRyYWlsaW5nU2VwYXJhdG9ycyhsYXN0U2VnbWVudCwgaXNQYXRoU2VwYXJhdG9yKTtcbiAgcmV0dXJuIHN1ZmZpeCA/IHN0cmlwU3VmZml4KHN0cmlwcGVkU2VnbWVudCwgc3VmZml4KSA6IHN0cmlwcGVkU2VnbWVudDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQ0UsVUFBVSxFQUNWLGVBQWUsRUFDZixXQUFXLFFBQ04seUJBQXlCO0FBQ2hDLFNBQVMsVUFBVSxRQUFRLDBCQUEwQjtBQUNyRCxTQUFTLHVCQUF1QixRQUFRLDBDQUEwQztBQUNsRixTQUFTLGVBQWUsRUFBRSxtQkFBbUIsUUFBUSxhQUFhO0FBRWxFOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUNELE9BQU8sU0FBUyxTQUFTLElBQVksRUFBRSxTQUFTLEVBQUU7RUFDaEQsV0FBVyxNQUFNO0VBRWpCLHFFQUFxRTtFQUNyRSwwRUFBMEU7RUFDMUUsY0FBYztFQUNkLElBQUksUUFBUTtFQUNaLElBQUksS0FBSyxNQUFNLElBQUksR0FBRztJQUNwQixNQUFNLFFBQVEsS0FBSyxVQUFVLENBQUM7SUFDOUIsSUFBSSxvQkFBb0IsUUFBUTtNQUM5QixJQUFJLEtBQUssVUFBVSxDQUFDLE9BQU8sWUFBWSxRQUFRO0lBQ2pEO0VBQ0Y7RUFFQSxNQUFNLGNBQWMsZ0JBQWdCLE1BQU0saUJBQWlCO0VBQzNELE1BQU0sa0JBQWtCLHdCQUF3QixhQUFhO0VBQzdELE9BQU8sU0FBUyxZQUFZLGlCQUFpQixVQUFVO0FBQ3pEIn0=
// denoCacheMetadata=8740052157128334043,7183144526211188312