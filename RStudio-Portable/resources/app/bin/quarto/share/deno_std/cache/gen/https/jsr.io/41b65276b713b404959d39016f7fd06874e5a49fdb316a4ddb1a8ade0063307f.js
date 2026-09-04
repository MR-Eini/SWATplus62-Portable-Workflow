// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { CHAR_BACKWARD_SLASH } from "../_common/constants.ts";
import { resolve } from "./resolve.ts";
import { assertArgs } from "../_common/relative.ts";
/**
 * Return the relative path from `from` to `to` based on current working directory.
 *
 * An example in windws, for instance:
 *  from = 'C:\\orandea\\test\\aaa'
 *  to = 'C:\\orandea\\impl\\bbb'
 * The output of the function should be: '..\\..\\impl\\bbb'
 *
 * @param from path in current working directory
 * @param to path in current working directory
 */ export function relative(from, to) {
  assertArgs(from, to);
  const fromOrig = resolve(from);
  const toOrig = resolve(to);
  if (fromOrig === toOrig) return "";
  from = fromOrig.toLowerCase();
  to = toOrig.toLowerCase();
  if (from === to) return "";
  // Trim any leading backslashes
  let fromStart = 0;
  let fromEnd = from.length;
  for(; fromStart < fromEnd; ++fromStart){
    if (from.charCodeAt(fromStart) !== CHAR_BACKWARD_SLASH) break;
  }
  // Trim trailing backslashes (applicable to UNC paths only)
  for(; fromEnd - 1 > fromStart; --fromEnd){
    if (from.charCodeAt(fromEnd - 1) !== CHAR_BACKWARD_SLASH) break;
  }
  const fromLen = fromEnd - fromStart;
  // Trim any leading backslashes
  let toStart = 0;
  let toEnd = to.length;
  for(; toStart < toEnd; ++toStart){
    if (to.charCodeAt(toStart) !== CHAR_BACKWARD_SLASH) break;
  }
  // Trim trailing backslashes (applicable to UNC paths only)
  for(; toEnd - 1 > toStart; --toEnd){
    if (to.charCodeAt(toEnd - 1) !== CHAR_BACKWARD_SLASH) break;
  }
  const toLen = toEnd - toStart;
  // Compare paths to find the longest common path from root
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i = 0;
  for(; i <= length; ++i){
    if (i === length) {
      if (toLen > length) {
        if (to.charCodeAt(toStart + i) === CHAR_BACKWARD_SLASH) {
          // We get here if `from` is the exact base path for `to`.
          // For example: from='C:\\foo\\bar'; to='C:\\foo\\bar\\baz'
          return toOrig.slice(toStart + i + 1);
        } else if (i === 2) {
          // We get here if `from` is the device root.
          // For example: from='C:\\'; to='C:\\foo'
          return toOrig.slice(toStart + i);
        }
      }
      if (fromLen > length) {
        if (from.charCodeAt(fromStart + i) === CHAR_BACKWARD_SLASH) {
          // We get here if `to` is the exact base path for `from`.
          // For example: from='C:\\foo\\bar'; to='C:\\foo'
          lastCommonSep = i;
        } else if (i === 2) {
          // We get here if `to` is the device root.
          // For example: from='C:\\foo\\bar'; to='C:\\'
          lastCommonSep = 3;
        }
      }
      break;
    }
    const fromCode = from.charCodeAt(fromStart + i);
    const toCode = to.charCodeAt(toStart + i);
    if (fromCode !== toCode) break;
    else if (fromCode === CHAR_BACKWARD_SLASH) lastCommonSep = i;
  }
  // We found a mismatch before the first common path separator was seen, so
  // return the original `to`.
  if (i !== length && lastCommonSep === -1) {
    return toOrig;
  }
  let out = "";
  if (lastCommonSep === -1) lastCommonSep = 0;
  // Generate the relative path based on the path difference between `to` and
  // `from`
  for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
    if (i === fromEnd || from.charCodeAt(i) === CHAR_BACKWARD_SLASH) {
      if (out.length === 0) out += "..";
      else out += "\\..";
    }
  }
  // Lastly, append the rest of the destination (`to`) path that comes after
  // the common path parts
  if (out.length > 0) {
    return out + toOrig.slice(toStart + lastCommonSep, toEnd);
  } else {
    toStart += lastCommonSep;
    if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) ++toStart;
    return toOrig.slice(toStart, toEnd);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3dpbmRvd3MvcmVsYXRpdmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgQ0hBUl9CQUNLV0FSRF9TTEFTSCB9IGZyb20gXCIuLi9fY29tbW9uL2NvbnN0YW50cy50c1wiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCIuL3Jlc29sdmUudHNcIjtcbmltcG9ydCB7IGFzc2VydEFyZ3MgfSBmcm9tIFwiLi4vX2NvbW1vbi9yZWxhdGl2ZS50c1wiO1xuXG4vKipcbiAqIFJldHVybiB0aGUgcmVsYXRpdmUgcGF0aCBmcm9tIGBmcm9tYCB0byBgdG9gIGJhc2VkIG9uIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXG4gKlxuICogQW4gZXhhbXBsZSBpbiB3aW5kd3MsIGZvciBpbnN0YW5jZTpcbiAqICBmcm9tID0gJ0M6XFxcXG9yYW5kZWFcXFxcdGVzdFxcXFxhYWEnXG4gKiAgdG8gPSAnQzpcXFxcb3JhbmRlYVxcXFxpbXBsXFxcXGJiYidcbiAqIFRoZSBvdXRwdXQgb2YgdGhlIGZ1bmN0aW9uIHNob3VsZCBiZTogJy4uXFxcXC4uXFxcXGltcGxcXFxcYmJiJ1xuICpcbiAqIEBwYXJhbSBmcm9tIHBhdGggaW4gY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICogQHBhcmFtIHRvIHBhdGggaW4gY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVsYXRpdmUoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogc3RyaW5nIHtcbiAgYXNzZXJ0QXJncyhmcm9tLCB0byk7XG5cbiAgY29uc3QgZnJvbU9yaWcgPSByZXNvbHZlKGZyb20pO1xuICBjb25zdCB0b09yaWcgPSByZXNvbHZlKHRvKTtcblxuICBpZiAoZnJvbU9yaWcgPT09IHRvT3JpZykgcmV0dXJuIFwiXCI7XG5cbiAgZnJvbSA9IGZyb21PcmlnLnRvTG93ZXJDYXNlKCk7XG4gIHRvID0gdG9PcmlnLnRvTG93ZXJDYXNlKCk7XG5cbiAgaWYgKGZyb20gPT09IHRvKSByZXR1cm4gXCJcIjtcblxuICAvLyBUcmltIGFueSBsZWFkaW5nIGJhY2tzbGFzaGVzXG4gIGxldCBmcm9tU3RhcnQgPSAwO1xuICBsZXQgZnJvbUVuZCA9IGZyb20ubGVuZ3RoO1xuICBmb3IgKDsgZnJvbVN0YXJ0IDwgZnJvbUVuZDsgKytmcm9tU3RhcnQpIHtcbiAgICBpZiAoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCkgIT09IENIQVJfQkFDS1dBUkRfU0xBU0gpIGJyZWFrO1xuICB9XG4gIC8vIFRyaW0gdHJhaWxpbmcgYmFja3NsYXNoZXMgKGFwcGxpY2FibGUgdG8gVU5DIHBhdGhzIG9ubHkpXG4gIGZvciAoOyBmcm9tRW5kIC0gMSA+IGZyb21TdGFydDsgLS1mcm9tRW5kKSB7XG4gICAgaWYgKGZyb20uY2hhckNvZGVBdChmcm9tRW5kIC0gMSkgIT09IENIQVJfQkFDS1dBUkRfU0xBU0gpIGJyZWFrO1xuICB9XG4gIGNvbnN0IGZyb21MZW4gPSBmcm9tRW5kIC0gZnJvbVN0YXJ0O1xuXG4gIC8vIFRyaW0gYW55IGxlYWRpbmcgYmFja3NsYXNoZXNcbiAgbGV0IHRvU3RhcnQgPSAwO1xuICBsZXQgdG9FbmQgPSB0by5sZW5ndGg7XG4gIGZvciAoOyB0b1N0YXJ0IDwgdG9FbmQ7ICsrdG9TdGFydCkge1xuICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQpICE9PSBDSEFSX0JBQ0tXQVJEX1NMQVNIKSBicmVhaztcbiAgfVxuICAvLyBUcmltIHRyYWlsaW5nIGJhY2tzbGFzaGVzIChhcHBsaWNhYmxlIHRvIFVOQyBwYXRocyBvbmx5KVxuICBmb3IgKDsgdG9FbmQgLSAxID4gdG9TdGFydDsgLS10b0VuZCkge1xuICAgIGlmICh0by5jaGFyQ29kZUF0KHRvRW5kIC0gMSkgIT09IENIQVJfQkFDS1dBUkRfU0xBU0gpIGJyZWFrO1xuICB9XG4gIGNvbnN0IHRvTGVuID0gdG9FbmQgLSB0b1N0YXJ0O1xuXG4gIC8vIENvbXBhcmUgcGF0aHMgdG8gZmluZCB0aGUgbG9uZ2VzdCBjb21tb24gcGF0aCBmcm9tIHJvb3RcbiAgY29uc3QgbGVuZ3RoID0gZnJvbUxlbiA8IHRvTGVuID8gZnJvbUxlbiA6IHRvTGVuO1xuICBsZXQgbGFzdENvbW1vblNlcCA9IC0xO1xuICBsZXQgaSA9IDA7XG4gIGZvciAoOyBpIDw9IGxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGkgPT09IGxlbmd0aCkge1xuICAgICAgaWYgKHRvTGVuID4gbGVuZ3RoKSB7XG4gICAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSCkge1xuICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGBmcm9tYCBpcyB0aGUgZXhhY3QgYmFzZSBwYXRoIGZvciBgdG9gLlxuICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPSdDOlxcXFxmb29cXFxcYmFyJzsgdG89J0M6XFxcXGZvb1xcXFxiYXJcXFxcYmF6J1xuICAgICAgICAgIHJldHVybiB0b09yaWcuc2xpY2UodG9TdGFydCArIGkgKyAxKTtcbiAgICAgICAgfSBlbHNlIGlmIChpID09PSAyKSB7XG4gICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSBkZXZpY2Ugcm9vdC5cbiAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nQzpcXFxcJzsgdG89J0M6XFxcXGZvbydcbiAgICAgICAgICByZXR1cm4gdG9PcmlnLnNsaWNlKHRvU3RhcnQgKyBpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZyb21MZW4gPiBsZW5ndGgpIHtcbiAgICAgICAgaWYgKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSCkge1xuICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGB0b2AgaXMgdGhlIGV4YWN0IGJhc2UgcGF0aCBmb3IgYGZyb21gLlxuICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPSdDOlxcXFxmb29cXFxcYmFyJzsgdG89J0M6XFxcXGZvbydcbiAgICAgICAgICBsYXN0Q29tbW9uU2VwID0gaTtcbiAgICAgICAgfSBlbHNlIGlmIChpID09PSAyKSB7XG4gICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgZGV2aWNlIHJvb3QuXG4gICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209J0M6XFxcXGZvb1xcXFxiYXInOyB0bz0nQzpcXFxcJ1xuICAgICAgICAgIGxhc3RDb21tb25TZXAgPSAzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY29uc3QgZnJvbUNvZGUgPSBmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSk7XG4gICAgY29uc3QgdG9Db2RlID0gdG8uY2hhckNvZGVBdCh0b1N0YXJ0ICsgaSk7XG4gICAgaWYgKGZyb21Db2RlICE9PSB0b0NvZGUpIGJyZWFrO1xuICAgIGVsc2UgaWYgKGZyb21Db2RlID09PSBDSEFSX0JBQ0tXQVJEX1NMQVNIKSBsYXN0Q29tbW9uU2VwID0gaTtcbiAgfVxuXG4gIC8vIFdlIGZvdW5kIGEgbWlzbWF0Y2ggYmVmb3JlIHRoZSBmaXJzdCBjb21tb24gcGF0aCBzZXBhcmF0b3Igd2FzIHNlZW4sIHNvXG4gIC8vIHJldHVybiB0aGUgb3JpZ2luYWwgYHRvYC5cbiAgaWYgKGkgIT09IGxlbmd0aCAmJiBsYXN0Q29tbW9uU2VwID09PSAtMSkge1xuICAgIHJldHVybiB0b09yaWc7XG4gIH1cblxuICBsZXQgb3V0ID0gXCJcIjtcbiAgaWYgKGxhc3RDb21tb25TZXAgPT09IC0xKSBsYXN0Q29tbW9uU2VwID0gMDtcbiAgLy8gR2VuZXJhdGUgdGhlIHJlbGF0aXZlIHBhdGggYmFzZWQgb24gdGhlIHBhdGggZGlmZmVyZW5jZSBiZXR3ZWVuIGB0b2AgYW5kXG4gIC8vIGBmcm9tYFxuICBmb3IgKGkgPSBmcm9tU3RhcnQgKyBsYXN0Q29tbW9uU2VwICsgMTsgaSA8PSBmcm9tRW5kOyArK2kpIHtcbiAgICBpZiAoaSA9PT0gZnJvbUVuZCB8fCBmcm9tLmNoYXJDb2RlQXQoaSkgPT09IENIQVJfQkFDS1dBUkRfU0xBU0gpIHtcbiAgICAgIGlmIChvdXQubGVuZ3RoID09PSAwKSBvdXQgKz0gXCIuLlwiO1xuICAgICAgZWxzZSBvdXQgKz0gXCJcXFxcLi5cIjtcbiAgICB9XG4gIH1cblxuICAvLyBMYXN0bHksIGFwcGVuZCB0aGUgcmVzdCBvZiB0aGUgZGVzdGluYXRpb24gKGB0b2ApIHBhdGggdGhhdCBjb21lcyBhZnRlclxuICAvLyB0aGUgY29tbW9uIHBhdGggcGFydHNcbiAgaWYgKG91dC5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIG91dCArIHRvT3JpZy5zbGljZSh0b1N0YXJ0ICsgbGFzdENvbW1vblNlcCwgdG9FbmQpO1xuICB9IGVsc2Uge1xuICAgIHRvU3RhcnQgKz0gbGFzdENvbW1vblNlcDtcbiAgICBpZiAodG9PcmlnLmNoYXJDb2RlQXQodG9TdGFydCkgPT09IENIQVJfQkFDS1dBUkRfU0xBU0gpICsrdG9TdGFydDtcbiAgICByZXR1cm4gdG9PcmlnLnNsaWNlKHRvU3RhcnQsIHRvRW5kKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxtQkFBbUIsUUFBUSwwQkFBMEI7QUFDOUQsU0FBUyxPQUFPLFFBQVEsZUFBZTtBQUN2QyxTQUFTLFVBQVUsUUFBUSx5QkFBeUI7QUFFcEQ7Ozs7Ozs7Ozs7Q0FVQyxHQUNELE9BQU8sU0FBUyxTQUFTLElBQVksRUFBRSxFQUFVO0VBQy9DLFdBQVcsTUFBTTtFQUVqQixNQUFNLFdBQVcsUUFBUTtFQUN6QixNQUFNLFNBQVMs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
// denoCacheMetadata=13281266023773858519,14485446999570476179