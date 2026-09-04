// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { CHAR_DOT } from "../_common/constants.ts";
import { stripTrailingSeparators } from "../_common/strip_trailing_separators.ts";
import { assertPath } from "../_common/assert_path.ts";
import { isPosixPathSeparator } from "./_util.ts";
/**
 * Return a `ParsedPath` object of the `path`.
 * @param path to process
 */ export function parse(path) {
  assertPath(path);
  const ret = {
    root: "",
    dir: "",
    base: "",
    ext: "",
    name: ""
  };
  if (path.length === 0) return ret;
  const isAbsolute = isPosixPathSeparator(path.charCodeAt(0));
  let start;
  if (isAbsolute) {
    ret.root = "/";
    start = 1;
  } else {
    start = 0;
  }
  let startDot = -1;
  let startPart = 0;
  let end = -1;
  let matchedSlash = true;
  let i = path.length - 1;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  let preDotState = 0;
  // Get non-dir info
  for(; i >= start; --i){
    const code = path.charCodeAt(i);
    if (isPosixPathSeparator(code)) {
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
    if (end !== -1) {
      if (startPart === 0 && isAbsolute) {
        ret.base = ret.name = path.slice(1, end);
      } else {
        ret.base = ret.name = path.slice(startPart, end);
      }
    }
    // Fallback to '/' in case there is no basename
    ret.base = ret.base || "/";
  } else {
    if (startPart === 0 && isAbsolute) {
      ret.name = path.slice(1, startDot);
      ret.base = path.slice(1, end);
    } else {
      ret.name = path.slice(startPart, startDot);
      ret.base = path.slice(startPart, end);
    }
    ret.ext = path.slice(startDot, end);
  }
  if (startPart > 0) {
    ret.dir = stripTrailingSeparators(path.slice(0, startPart - 1), isPosixPathSeparator);
  } else if (isAbsolute) ret.dir = "/";
  return ret;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3Bvc2l4L3BhcnNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IENIQVJfRE9UIH0gZnJvbSBcIi4uL19jb21tb24vY29uc3RhbnRzLnRzXCI7XG5pbXBvcnQgdHlwZSB7IFBhcnNlZFBhdGggfSBmcm9tIFwiLi4vX2ludGVyZmFjZS50c1wiO1xuaW1wb3J0IHsgc3RyaXBUcmFpbGluZ1NlcGFyYXRvcnMgfSBmcm9tIFwiLi4vX2NvbW1vbi9zdHJpcF90cmFpbGluZ19zZXBhcmF0b3JzLnRzXCI7XG5pbXBvcnQgeyBhc3NlcnRQYXRoIH0gZnJvbSBcIi4uL19jb21tb24vYXNzZXJ0X3BhdGgudHNcIjtcbmltcG9ydCB7IGlzUG9zaXhQYXRoU2VwYXJhdG9yIH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcblxuZXhwb3J0IHR5cGUgeyBQYXJzZWRQYXRoIH0gZnJvbSBcIi4uL19pbnRlcmZhY2UudHNcIjtcblxuLyoqXG4gKiBSZXR1cm4gYSBgUGFyc2VkUGF0aGAgb2JqZWN0IG9mIHRoZSBgcGF0aGAuXG4gKiBAcGFyYW0gcGF0aCB0byBwcm9jZXNzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShwYXRoOiBzdHJpbmcpOiBQYXJzZWRQYXRoIHtcbiAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICBjb25zdCByZXQ6IFBhcnNlZFBhdGggPSB7IHJvb3Q6IFwiXCIsIGRpcjogXCJcIiwgYmFzZTogXCJcIiwgZXh0OiBcIlwiLCBuYW1lOiBcIlwiIH07XG4gIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJldDtcbiAgY29uc3QgaXNBYnNvbHV0ZSA9IGlzUG9zaXhQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdCgwKSk7XG4gIGxldCBzdGFydDogbnVtYmVyO1xuICBpZiAoaXNBYnNvbHV0ZSkge1xuICAgIHJldC5yb290ID0gXCIvXCI7XG4gICAgc3RhcnQgPSAxO1xuICB9IGVsc2Uge1xuICAgIHN0YXJ0ID0gMDtcbiAgfVxuICBsZXQgc3RhcnREb3QgPSAtMTtcbiAgbGV0IHN0YXJ0UGFydCA9IDA7XG4gIGxldCBlbmQgPSAtMTtcbiAgbGV0IG1hdGNoZWRTbGFzaCA9IHRydWU7XG4gIGxldCBpID0gcGF0aC5sZW5ndGggLSAxO1xuXG4gIC8vIFRyYWNrIHRoZSBzdGF0ZSBvZiBjaGFyYWN0ZXJzIChpZiBhbnkpIHdlIHNlZSBiZWZvcmUgb3VyIGZpcnN0IGRvdCBhbmRcbiAgLy8gYWZ0ZXIgYW55IHBhdGggc2VwYXJhdG9yIHdlIGZpbmRcbiAgbGV0IHByZURvdFN0YXRlID0gMDtcblxuICAvLyBHZXQgbm9uLWRpciBpbmZvXG4gIGZvciAoOyBpID49IHN0YXJ0OyAtLWkpIHtcbiAgICBjb25zdCBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChpc1Bvc2l4UGF0aFNlcGFyYXRvcihjb2RlKSkge1xuICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAvLyBleHRlbnNpb25cbiAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgZW5kID0gaSArIDE7XG4gICAgfVxuICAgIGlmIChjb2RlID09PSBDSEFSX0RPVCkge1xuICAgICAgLy8gSWYgdGhpcyBpcyBvdXIgZmlyc3QgZG90LCBtYXJrIGl0IGFzIHRoZSBzdGFydCBvZiBvdXIgZXh0ZW5zaW9uXG4gICAgICBpZiAoc3RhcnREb3QgPT09IC0xKSBzdGFydERvdCA9IGk7XG4gICAgICBlbHNlIGlmIChwcmVEb3RTdGF0ZSAhPT0gMSkgcHJlRG90U3RhdGUgPSAxO1xuICAgIH0gZWxzZSBpZiAoc3RhcnREb3QgIT09IC0xKSB7XG4gICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxuICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cbiAgICAgIHByZURvdFN0YXRlID0gLTE7XG4gICAgfVxuICB9XG5cbiAgaWYgKFxuICAgIHN0YXJ0RG90ID09PSAtMSB8fFxuICAgIGVuZCA9PT0gLTEgfHxcbiAgICAvLyBXZSBzYXcgYSBub24tZG90IGNoYXJhY3RlciBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRvdFxuICAgIHByZURvdFN0YXRlID09PSAwIHx8XG4gICAgLy8gVGhlIChyaWdodC1tb3N0KSB0cmltbWVkIHBhdGggY29tcG9uZW50IGlzIGV4YWN0bHkgJy4uJ1xuICAgIChwcmVEb3RTdGF0ZSA9PT0gMSAmJiBzdGFydERvdCA9PT0gZW5kIC0gMSAmJiBzdGFydERvdCA9PT0gc3RhcnRQYXJ0ICsgMSlcbiAgKSB7XG4gICAgaWYgKGVuZCAhPT0gLTEpIHtcbiAgICAgIGlmIChzdGFydFBhcnQgPT09IDAgJiYgaXNBYnNvbHV0ZSkge1xuICAgICAgICByZXQuYmFzZSA9IHJldC5uYW1lID0gcGF0aC5zbGljZSgxLCBlbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0LmJhc2UgPSByZXQubmFtZSA9IHBhdGguc2xpY2Uoc3RhcnRQYXJ0LCBlbmQpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBGYWxsYmFjayB0byAnLycgaW4gY2FzZSB0aGVyZSBpcyBubyBiYXNlbmFtZVxuICAgIHJldC5iYXNlID0gcmV0LmJhc2UgfHwgXCIvXCI7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHN0YXJ0UGFydCA9PT0gMCAmJiBpc0Fic29sdXRlKSB7XG4gICAgICByZXQubmFtZSA9IHBhdGguc2xpY2UoMSwgc3RhcnREb3QpO1xuICAgICAgcmV0LmJhc2UgPSBwYXRoLnNsaWNlKDEsIGVuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldC5uYW1lID0gcGF0aC5zbGljZShzdGFydFBhcnQsIHN0YXJ0RG90KTtcbiAgICAgIHJldC5iYXNlID0gcGF0aC5zbGljZShzdGFydFBhcnQsIGVuZCk7XG4gICAgfVxuICAgIHJldC5leHQgPSBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xuICB9XG5cbiAgaWYgKHN0YXJ0UGFydCA+IDApIHtcbiAgICByZXQuZGlyID0gc3RyaXBUcmFpbGluZ1NlcGFyYXRvcnMoXG4gICAgICBwYXRoLnNsaWNlKDAsIHN0YXJ0UGFydCAtIDEpLFxuICAgICAgaXNQb3NpeFBhdGhTZXBhcmF0b3IsXG4gICAgKTtcbiAgfSBlbHNlIGlmIChpc0Fic29sdXRlKSByZXQuZGlyID0gXCIvXCI7XG5cbiAgcmV0dXJuIHJldDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsUUFBUSxRQUFRLDBCQUEwQjtBQUVuRCxTQUFTLHVCQUF1QixRQUFRLDBDQUEwQztBQUNsRixTQUFTLFVBQVUsUUFBUSw0QkFBNEI7QUFDdkQsU0FBUyxvQkFBb0IsUUFBUSxhQUFhO0FBSWxEOzs7Q0FHQyxHQUNELE9BQU8sU0FBUyxNQUFNLElBQVk7RUFDaEMsV0FBVztFQUVYLE1BQU0sTUFBa0I7SUFBRSxNQUFNO0lBQUksS0FBSztJQUFJ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
// denoCacheMetadata=1168153385510920691,3443445702982943298