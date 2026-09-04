// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns `true` if the suffix array appears at the end of the source array,
 * `false` otherwise.
 *
 * The complexity of this function is `O(suffix.length)`.
 *
 * @param source Source array to check.
 * @param suffix Suffix array to check for.
 * @returns `true` if the suffix array appears at the end of the source array,
 * `false` otherwise.
 *
 * @example Basic usage
 * ```ts
 * import { endsWith } from "@std/bytes/ends-with";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const suffix = new Uint8Array([1, 2, 3]);
 *
 * endsWith(source, suffix); // true
 * ```
 */ export function endsWith(source, suffix) {
  const diff = source.length - suffix.length;
  for(let i = suffix.length - 1; i >= 0; i--){
    if (source[diff + i] !== suffix[i]) {
      return false;
    }
  }
  return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMC4yMjQuMC9lbmRzX3dpdGgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgc3VmZml4IGFycmF5IGFwcGVhcnMgYXQgdGhlIGVuZCBvZiB0aGUgc291cmNlIGFycmF5LFxuICogYGZhbHNlYCBvdGhlcndpc2UuXG4gKlxuICogVGhlIGNvbXBsZXhpdHkgb2YgdGhpcyBmdW5jdGlvbiBpcyBgTyhzdWZmaXgubGVuZ3RoKWAuXG4gKlxuICogQHBhcmFtIHNvdXJjZSBTb3VyY2UgYXJyYXkgdG8gY2hlY2suXG4gKiBAcGFyYW0gc3VmZml4IFN1ZmZpeCBhcnJheSB0byBjaGVjayBmb3IuXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHN1ZmZpeCBhcnJheSBhcHBlYXJzIGF0IHRoZSBlbmQgb2YgdGhlIHNvdXJjZSBhcnJheSxcbiAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5kc1dpdGggfSBmcm9tIFwiQHN0ZC9ieXRlcy9lbmRzLXdpdGhcIjtcbiAqXG4gKiBjb25zdCBzb3VyY2UgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMiwgMSwgMiwgMSwgMiwgM10pO1xuICogY29uc3Qgc3VmZml4ID0gbmV3IFVpbnQ4QXJyYXkoWzEsIDIsIDNdKTtcbiAqXG4gKiBlbmRzV2l0aChzb3VyY2UsIHN1ZmZpeCk7IC8vIHRydWVcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5kc1dpdGgoc291cmNlOiBVaW50OEFycmF5LCBzdWZmaXg6IFVpbnQ4QXJyYXkpOiBib29sZWFuIHtcbiAgY29uc3QgZGlmZiA9IHNvdXJjZS5sZW5ndGggLSBzdWZmaXgubGVuZ3RoO1xuICBmb3IgKGxldCBpID0gc3VmZml4Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKHNvdXJjZVtkaWZmICsgaV0gIT09IHN1ZmZpeFtpXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW9CQyxHQUNELE9BQU8sU0FBUyxTQUFTLE1BQWtCLEVBQUUsTUFBa0I7RUFDN0QsTUFBTSxPQUFPLE9BQU8sTUFBTSxHQUFHLE9BQU8sTUFBTTtFQUMxQyxJQUFLLElBQUksSUFBSSxPQUFPLE1BQU0sR0FBRyxHQUFHLEtBQUssR0FBRyxJQUFLO0lBQzNDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLE1BQU0sQ0FBQyxFQUFFLEVBQUU7TUFDbEMsT0FBTztJQUNUO0VBQ0Y7RUFDQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=10406127535848006079,15480588735079884825