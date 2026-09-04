// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { CHAR_COLON, CHAR_DOT } from "../_common/constants.ts";
import { assertPath } from "../_common/assert_path.ts";
import { isPathSeparator, isWindowsDeviceRoot } from "./_util.ts";
/**
 * Return the extension of the `path` with leading period.
 * @param path with extension
 * @returns extension (ex. for `file.ts` returns `.ts`)
 */ export function extname(path) {
  assertPath(path);
  let start = 0;
  let startDot = -1;
  let startPart = 0;
  let end = -1;
  let matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  let preDotState = 0;
  // Check for a drive letter prefix so as not to mistake the following
  // path separator as an extra separator at the end of the path that can be
  // disregarded
  if (path.length >= 2 && path.charCodeAt(1) === CHAR_COLON && isWindowsDeviceRoot(path.charCodeAt(0))) {
    start = startPart = 2;
  }
  for(let i = path.length - 1; i >= start; --i){
    const code = path.charCodeAt(i);
    if (isPathSeparator(code)) {
      // If we reached a path separator that was not part of a set of path
      // separators at the end of the string, stop now
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === CHAR_DOT) {
      // If this is our first dot, mark it as the start of our extension
      if (startDot === -1) startDot = i;
      else if (preDotState !== 1) preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }
  if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
  preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return "";
  }
  return path.slice(startDot, end);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3dpbmRvd3MvZXh0bmFtZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBDSEFSX0NPTE9OLCBDSEFSX0RPVCB9IGZyb20gXCIuLi9fY29tbW9uL2NvbnN0YW50cy50c1wiO1xuaW1wb3J0IHsgYXNzZXJ0UGF0aCB9IGZyb20gXCIuLi9fY29tbW9uL2Fzc2VydF9wYXRoLnRzXCI7XG5pbXBvcnQgeyBpc1BhdGhTZXBhcmF0b3IsIGlzV2luZG93c0RldmljZVJvb3QgfSBmcm9tIFwiLi9fdXRpbC50c1wiO1xuXG4vKipcbiAqIFJldHVybiB0aGUgZXh0ZW5zaW9uIG9mIHRoZSBgcGF0aGAgd2l0aCBsZWFkaW5nIHBlcmlvZC5cbiAqIEBwYXJhbSBwYXRoIHdpdGggZXh0ZW5zaW9uXG4gKiBAcmV0dXJucyBleHRlbnNpb24gKGV4LiBmb3IgYGZpbGUudHNgIHJldHVybnMgYC50c2ApXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRuYW1lKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGFzc2VydFBhdGgocGF0aCk7XG5cbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IHN0YXJ0RG90ID0gLTE7XG4gIGxldCBzdGFydFBhcnQgPSAwO1xuICBsZXQgZW5kID0gLTE7XG4gIGxldCBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAvLyBUcmFjayB0aGUgc3RhdGUgb2YgY2hhcmFjdGVycyAoaWYgYW55KSB3ZSBzZWUgYmVmb3JlIG91ciBmaXJzdCBkb3QgYW5kXG4gIC8vIGFmdGVyIGFueSBwYXRoIHNlcGFyYXRvciB3ZSBmaW5kXG4gIGxldCBwcmVEb3RTdGF0ZSA9IDA7XG5cbiAgLy8gQ2hlY2sgZm9yIGEgZHJpdmUgbGV0dGVyIHByZWZpeCBzbyBhcyBub3QgdG8gbWlzdGFrZSB0aGUgZm9sbG93aW5nXG4gIC8vIHBhdGggc2VwYXJhdG9yIGFzIGFuIGV4dHJhIHNlcGFyYXRvciBhdCB0aGUgZW5kIG9mIHRoZSBwYXRoIHRoYXQgY2FuIGJlXG4gIC8vIGRpc3JlZ2FyZGVkXG5cbiAgaWYgKFxuICAgIHBhdGgubGVuZ3RoID49IDIgJiZcbiAgICBwYXRoLmNoYXJDb2RlQXQoMSkgPT09IENIQVJfQ09MT04gJiZcbiAgICBpc1dpbmRvd3NEZXZpY2VSb290KHBhdGguY2hhckNvZGVBdCgwKSlcbiAgKSB7XG4gICAgc3RhcnQgPSBzdGFydFBhcnQgPSAyO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSBzdGFydDsgLS1pKSB7XG4gICAgY29uc3QgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKGNvZGUpKSB7XG4gICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxuICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICBzdGFydFBhcnQgPSBpICsgMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGVuZCA9PT0gLTEpIHtcbiAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcbiAgICAgIC8vIGV4dGVuc2lvblxuICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICBlbmQgPSBpICsgMTtcbiAgICB9XG4gICAgaWYgKGNvZGUgPT09IENIQVJfRE9UKSB7XG4gICAgICAvLyBJZiB0aGlzIGlzIG91ciBmaXJzdCBkb3QsIG1hcmsgaXQgYXMgdGhlIHN0YXJ0IG9mIG91ciBleHRlbnNpb25cbiAgICAgIGlmIChzdGFydERvdCA9PT0gLTEpIHN0YXJ0RG90ID0gaTtcbiAgICAgIGVsc2UgaWYgKHByZURvdFN0YXRlICE9PSAxKSBwcmVEb3RTdGF0ZSA9IDE7XG4gICAgfSBlbHNlIGlmIChzdGFydERvdCAhPT0gLTEpIHtcbiAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgYW5kIG5vbi1wYXRoIHNlcGFyYXRvciBiZWZvcmUgb3VyIGRvdCwgc28gd2Ugc2hvdWxkXG4gICAgICAvLyBoYXZlIGEgZ29vZCBjaGFuY2UgYXQgaGF2aW5nIGEgbm9uLWVtcHR5IGV4dGVuc2lvblxuICAgICAgcHJlRG90U3RhdGUgPSAtMTtcbiAgICB9XG4gIH1cblxuICBpZiAoXG4gICAgc3RhcnREb3QgPT09IC0xIHx8XG4gICAgZW5kID09PSAtMSB8fFxuICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgY2hhcmFjdGVyIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZG90XG4gICAgcHJlRG90U3RhdGUgPT09IDAgfHxcbiAgICAvLyBUaGUgKHJpZ2h0LW1vc3QpIHRyaW1tZWQgcGF0aCBjb21wb25lbnQgaXMgZXhhY3RseSAnLi4nXG4gICAgKHByZURvdFN0YXRlID09PSAxICYmIHN0YXJ0RG90ID09PSBlbmQgLSAxICYmIHN0YXJ0RG90ID09PSBzdGFydFBhcnQgKyAxKVxuICApIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxuICByZXR1cm4gcGF0aC5zbGljZShzdGFydERvdCwgZW5kKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsVUFBVSxFQUFFLFFBQVEsUUFBUSwwQkFBMEI7QUFDL0QsU0FBUyxVQUFVLFFBQVEsNEJBQTRCO0FBQ3ZELFNBQVMsZUFBZSxFQUFFLG1CQUFtQixRQUFRLGFBQWE7QUFFbEU7Ozs7Q0FJQyxHQUNELE9BQU8sU0FBUyxRQUFRLElBQVk7RUFDbEMsV0FBVztFQUVYLElBQUksUUFBUTtFQUNaLElBQUksV0FBVyxDQUFDO0VBQ2hCLElBQUksWUFBWTtFQUNoQixJQUFJLE1BQU0sQ0FBQztFQUNYLElBQUksZUFBZTtFQUNuQix5RUFBeUU7RUFDekUsbUNBQW1DO0VBQ25DLElBQUksY0FBYztFQUVsQixxRUFBcUU7RUFDckUsMEVBQTBFO0VBQzFFLGNBQWM7RUFFZCxJQUNFLEtBQUssTUFBTSxJQUFJLEtBQ2YsS0FBSyxVQUFVLENBQUMsT0FBTyxjQUN2QixvQkFBb0IsS0FBSyxVQUFVLENBQUMsS0FDcEM7SUFDQSxRQUFRLFlBQVk7RUFDdEI7RUFFQSxJQUFLLElBQUksSUFBSSxLQUFLLE1BQU0sR0FBRyxHQUFHLEtBQUssT0FBTyxFQUFFLEVBQUc7SUFDN0MsTUFBTSxPQUFPLEtBQUssVUFBVSxDQUFDO0lBQzdCLElBQUksZ0JBQWdCLE9BQU87TUFDekIsb0VBQW9FO01BQ3BFLGdEQUFnRDtNQUNoRCxJQUFJLENBQUMsY0FBYztRQUNqQixZQUFZLElBQUk7UUFDaEI7TUFDRjtNQUNBO0lBQ0Y7SUFDQSxJQUFJLFFBQVEsQ0FBQyxHQUFHO01BQ2QsbUVBQW1FO01BQ25FLFlBQVk7TUFDWixlQUFlO01BQ2YsTUFBTSxJQUFJO0lBQ1o7SUFDQSxJQUFJLFNBQVMsVUFBVTtNQUNyQixrRUFBa0U7TUFDbEUsSUFBSSxhQUFhLENBQUMsR0FBRyxXQUFXO1dBQzNCLElBQUksZ0JBQWdCLEdBQUcsY0FBYztJQUM1QyxPQUFPLElBQUksYUFBYSxDQUFDLEdBQUc7TUFDMUIsdUVBQXVFO01BQ3ZFLHFEQUFxRDtNQUNyRCxjQUFjLENBQUM7SUFDakI7RUFDRjtFQUVBLElBQ0UsYUFBYSxDQUFDLEtBQ2QsUUFBUSxDQUFDLEtBQ1Qsd0RBQXdEO0VBQ3hELGdCQUFnQixLQUNoQiwwREFBMEQ7RUFDekQsZ0JBQWdCLEtBQUssYUFBYSxNQUFNLEtBQUssYUFBYSxZQUFZLEdBQ3ZFO0lBQ0EsT0FBTztFQUNUO0VBQ0EsT0FBTyxLQUFLLEtBQUssQ0FBQyxVQUFVO0FBQzlCIn0=
// denoCacheMetadata=140174965741099929,3046078554432725958