// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/** End-of-line character for POSIX platforms such as macOS and Linux. */ export const LF = "\n";
/** End-of-line character for Windows platforms. */ export const CRLF = "\r\n";
/**
 * End-of-line character evaluated for the current platform.
 *
 * @example
 * ```ts
 * import { EOL } from "@std/fs/eol";
 *
 * EOL; // "\n" on POSIX platforms and "\r\n" on Windows
 * ```
 */ export const EOL = Deno?.build.os === "windows" ? CRLF : LF;
const regDetect = /(?:\r?\n)/g;
/**
 * Returns the detected EOL character(s) detected in the input string. If no EOL
 * character is detected, `null` is returned.
 *
 * @param content The input string to detect EOL characters.
 * @returns The detected EOL character(s) or `null` if no EOL character is detected.
 *
 * @example
 * ```ts
 * import { detect } from "@std/fs/eol";
 *
 * detect("deno\r\nis not\r\nnode"); // "\r\n"
 * detect("deno\nis not\r\nnode"); // "\r\n"
 * detect("deno\nis not\nnode"); // "\n"
 * detect("deno is not node"); // null
 * ```
 */ export function detect(content) {
  const d = content.match(regDetect);
  if (!d || d.length === 0) {
    return null;
  }
  const hasCRLF = d.some((x)=>x === CRLF);
  return hasCRLF ? CRLF : LF;
}
/**
 * Normalize the input string to the targeted EOL.
 *
 * @param content The input string to normalize.
 * @param eol The EOL character(s) to normalize the input string to.
 * @returns The input string normalized to the targeted EOL.
 *
 * @example
 * ```ts
 * import { LF, format } from "@std/fs/eol";
 *
 * const CRLFinput = "deno\r\nis not\r\nnode";
 *
 * format(CRLFinput, LF); // "deno\nis not\nnode"
 * ```
 */ export function format(content, eol) {
  return content.replace(regDetect, eol);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC9lb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuLyoqIEVuZC1vZi1saW5lIGNoYXJhY3RlciBmb3IgUE9TSVggcGxhdGZvcm1zIHN1Y2ggYXMgbWFjT1MgYW5kIExpbnV4LiAqL1xuZXhwb3J0IGNvbnN0IExGID0gXCJcXG5cIiBhcyBjb25zdDtcblxuLyoqIEVuZC1vZi1saW5lIGNoYXJhY3RlciBmb3IgV2luZG93cyBwbGF0Zm9ybXMuICovXG5leHBvcnQgY29uc3QgQ1JMRiA9IFwiXFxyXFxuXCIgYXMgY29uc3Q7XG5cbi8qKlxuICogRW5kLW9mLWxpbmUgY2hhcmFjdGVyIGV2YWx1YXRlZCBmb3IgdGhlIGN1cnJlbnQgcGxhdGZvcm0uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBFT0wgfSBmcm9tIFwiQHN0ZC9mcy9lb2xcIjtcbiAqXG4gKiBFT0w7IC8vIFwiXFxuXCIgb24gUE9TSVggcGxhdGZvcm1zIGFuZCBcIlxcclxcblwiIG9uIFdpbmRvd3NcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgRU9MOiBcIlxcblwiIHwgXCJcXHJcXG5cIiA9IERlbm8/LmJ1aWxkLm9zID09PSBcIndpbmRvd3NcIiA/IENSTEYgOiBMRjtcblxuY29uc3QgcmVnRGV0ZWN0ID0gLyg/Olxccj9cXG4pL2c7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGV0ZWN0ZWQgRU9MIGNoYXJhY3RlcihzKSBkZXRlY3RlZCBpbiB0aGUgaW5wdXQgc3RyaW5nLiBJZiBubyBFT0xcbiAqIGNoYXJhY3RlciBpcyBkZXRlY3RlZCwgYG51bGxgIGlzIHJldHVybmVkLlxuICpcbiAqIEBwYXJhbSBjb250ZW50IFRoZSBpbnB1dCBzdHJpbmcgdG8gZGV0ZWN0IEVPTCBjaGFyYWN0ZXJzLlxuICogQHJldHVybnMgVGhlIGRldGVjdGVkIEVPTCBjaGFyYWN0ZXIocykgb3IgYG51bGxgIGlmIG5vIEVPTCBjaGFyYWN0ZXIgaXMgZGV0ZWN0ZWQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkZXRlY3QgfSBmcm9tIFwiQHN0ZC9mcy9lb2xcIjtcbiAqXG4gKiBkZXRlY3QoXCJkZW5vXFxyXFxuaXMgbm90XFxyXFxubm9kZVwiKTsgLy8gXCJcXHJcXG5cIlxuICogZGV0ZWN0KFwiZGVub1xcbmlzIG5vdFxcclxcbm5vZGVcIik7IC8vIFwiXFxyXFxuXCJcbiAqIGRldGVjdChcImRlbm9cXG5pcyBub3RcXG5ub2RlXCIpOyAvLyBcIlxcblwiXG4gKiBkZXRlY3QoXCJkZW5vIGlzIG5vdCBub2RlXCIpOyAvLyBudWxsXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdChjb250ZW50OiBzdHJpbmcpOiB0eXBlb2YgRU9MIHwgbnVsbCB7XG4gIGNvbnN0IGQgPSBjb250ZW50Lm1hdGNoKHJlZ0RldGVjdCk7XG4gIGlmICghZCB8fCBkLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGhhc0NSTEYgPSBkLnNvbWUoKHg6IHN0cmluZyk6IGJvb2xlYW4gPT4geCA9PT0gQ1JMRik7XG5cbiAgcmV0dXJuIGhhc0NSTEYgPyBDUkxGIDogTEY7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSBpbnB1dCBzdHJpbmcgdG8gdGhlIHRhcmdldGVkIEVPTC5cbiAqXG4gKiBAcGFyYW0gY29udGVudCBUaGUgaW5wdXQgc3RyaW5nIHRvIG5vcm1hbGl6ZS5cbiAqIEBwYXJhbSBlb2wgVGhlIEVPTCBjaGFyYWN0ZXIocykgdG8gbm9ybWFsaXplIHRoZSBpbnB1dCBzdHJpbmcgdG8uXG4gKiBAcmV0dXJucyBUaGUgaW5wdXQgc3RyaW5nIG5vcm1hbGl6ZWQgdG8gdGhlIHRhcmdldGVkIEVPTC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IExGLCBmb3JtYXQgfSBmcm9tIFwiQHN0ZC9mcy9lb2xcIjtcbiAqXG4gKiBjb25zdCBDUkxGaW5wdXQgPSBcImRlbm9cXHJcXG5pcyBub3RcXHJcXG5ub2RlXCI7XG4gKlxuICogZm9ybWF0KENSTEZpbnB1dCwgTEYpOyAvLyBcImRlbm9cXG5pcyBub3RcXG5ub2RlXCJcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0KGNvbnRlbnQ6IHN0cmluZywgZW9sOiB0eXBlb2YgRU9MKTogc3RyaW5nIHtcbiAgcmV0dXJuIGNvbnRlbnQucmVwbGFjZShyZWdEZXRlY3QsIGVvbCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLHVFQUF1RSxHQUN2RSxPQUFPLE1BQU0sS0FBSyxLQUFjO0FBRWhDLGlEQUFpRCxHQUNqRCxPQUFPLE1BQU0sT0FBTyxPQUFnQjtBQUVwQzs7Ozs7Ozs7O0NBU0MsR0FDRCxPQUFPLE1BQU0sTUFBcUIsTUFBTSxNQUFNLE9BQU8sWUFBWSxPQUFPLEdBQUc7QUFFM0UsTUFBTSxZQUFZO0FBRWxCOzs7Ozs7Ozs7Ozs7Ozs7O0NBZ0JDLEdBQ0QsT0FBTyxTQUFTLE9BQU8sT0FBZTtFQUNwQyxNQUFNLElBQUksUUFBUSxLQUFLLENBQUM7RUFDeEIsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEtBQUssR0FBRztJQUN4QixPQUFPO0VBQ1Q7RUFDQSxNQUFNLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUF1QixNQUFNO0VBRXJELE9BQU8sVUFBVSxPQUFPO0FBQzFCO0FBRUE7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBQ0QsT0FBTyxTQUFTLE9BQU8sT0FBZSxFQUFFLEdBQWU7RUFDckQsT0FBTyxRQUFRLE9BQU8sQ0FBQyxXQUFXO0FBQ3BDIn0=
// denoCacheMetadata=15848119569411233497,16596610622036854773