// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns the index of the last occurrence of the needle array in the source
 * array, or -1 if it is not present.
 *
 * The complexity of this function is `O(source.length * needle.length)`.
 *
 * @param source Source array to check.
 * @param needle Needle array to check for.
 * @param start Start index in the source array to begin the search. Defaults to
 * the end of the array.
 * @returns Index of the last occurrence of the needle array in the source
 * array, or -1 if it is not present.
 *
 * @example Basic usage
 * ```ts
 * import { lastIndexOfNeedle } from "@std/bytes/last-index-of-needle";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 * const notNeedle = new Uint8Array([5, 0]);
 *
 * lastIndexOfNeedle(source, needle); // 5
 * lastIndexOfNeedle(source, notNeedle); // -1
 * ```
 *
 * @example Start index
 * ```ts
 * import { lastIndexOfNeedle } from "@std/bytes/last-index-of-needle";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 *
 * lastIndexOfNeedle(source, needle, 2); // 1
 * lastIndexOfNeedle(source, needle, 6); // 3
 * ```
 * Defining a start index will begin the search at the specified index in the
 * source array.
 */ export function lastIndexOfNeedle(source, needle, start = source.length - 1) {
  if (start < 0) {
    return -1;
  }
  if (start >= source.length) {
    start = source.length - 1;
  }
  const e = needle[needle.length - 1];
  for(let i = start; i >= 0; i--){
    if (source[i] !== e) continue;
    let matched = 1;
    let j = i;
    while(matched < needle.length && source[--j] === needle[needle.length - 1 - (i - j)]){
      matched++;
    }
    if (matched === needle.length) {
      return i - needle.length + 1;
    }
  }
  return -1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMC4yMjQuMC9sYXN0X2luZGV4X29mX25lZWRsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIG5lZWRsZSBhcnJheSBpbiB0aGUgc291cmNlXG4gKiBhcnJheSwgb3IgLTEgaWYgaXQgaXMgbm90IHByZXNlbnQuXG4gKlxuICogVGhlIGNvbXBsZXhpdHkgb2YgdGhpcyBmdW5jdGlvbiBpcyBgTyhzb3VyY2UubGVuZ3RoICogbmVlZGxlLmxlbmd0aClgLlxuICpcbiAqIEBwYXJhbSBzb3VyY2UgU291cmNlIGFycmF5IHRvIGNoZWNrLlxuICogQHBhcmFtIG5lZWRsZSBOZWVkbGUgYXJyYXkgdG8gY2hlY2sgZm9yLlxuICogQHBhcmFtIHN0YXJ0IFN0YXJ0IGluZGV4IGluIHRoZSBzb3VyY2UgYXJyYXkgdG8gYmVnaW4gdGhlIHNlYXJjaC4gRGVmYXVsdHMgdG9cbiAqIHRoZSBlbmQgb2YgdGhlIGFycmF5LlxuICogQHJldHVybnMgSW5kZXggb2YgdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgbmVlZGxlIGFycmF5IGluIHRoZSBzb3VyY2VcbiAqIGFycmF5LCBvciAtMSBpZiBpdCBpcyBub3QgcHJlc2VudC5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGxhc3RJbmRleE9mTmVlZGxlIH0gZnJvbSBcIkBzdGQvYnl0ZXMvbGFzdC1pbmRleC1vZi1uZWVkbGVcIjtcbiAqXG4gKiBjb25zdCBzb3VyY2UgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMiwgMSwgMiwgMSwgMiwgM10pO1xuICogY29uc3QgbmVlZGxlID0gbmV3IFVpbnQ4QXJyYXkoWzEsIDJdKTtcbiAqIGNvbnN0IG5vdE5lZWRsZSA9IG5ldyBVaW50OEFycmF5KFs1LCAwXSk7XG4gKlxuICogbGFzdEluZGV4T2ZOZWVkbGUoc291cmNlLCBuZWVkbGUpOyAvLyA1XG4gKiBsYXN0SW5kZXhPZk5lZWRsZShzb3VyY2UsIG5vdE5lZWRsZSk7IC8vIC0xXG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBTdGFydCBpbmRleFxuICogYGBgdHNcbiAqIGltcG9ydCB7IGxhc3RJbmRleE9mTmVlZGxlIH0gZnJvbSBcIkBzdGQvYnl0ZXMvbGFzdC1pbmRleC1vZi1uZWVkbGVcIjtcbiAqXG4gKiBjb25zdCBzb3VyY2UgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMiwgMSwgMiwgMSwgMiwgM10pO1xuICogY29uc3QgbmVlZGxlID0gbmV3IFVpbnQ4QXJyYXkoWzEsIDJdKTtcbiAqXG4gKiBsYXN0SW5kZXhPZk5lZWRsZShzb3VyY2UsIG5lZWRsZSwgMik7IC8vIDFcbiAqIGxhc3RJbmRleE9mTmVlZGxlKHNvdXJjZSwgbmVlZGxlLCA2KTsgLy8gM1xuICogYGBgXG4gKiBEZWZpbmluZyBhIHN0YXJ0IGluZGV4IHdpbGwgYmVnaW4gdGhlIHNlYXJjaCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4IGluIHRoZVxuICogc291cmNlIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGFzdEluZGV4T2ZOZWVkbGUoXG4gIHNvdXJjZTogVWludDhBcnJheSxcbiAgbmVlZGxlOiBVaW50OEFycmF5LFxuICBzdGFydDogbnVtYmVyID0gc291cmNlLmxlbmd0aCAtIDEsXG4pOiBudW1iZXIge1xuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGlmIChzdGFydCA+PSBzb3VyY2UubGVuZ3RoKSB7XG4gICAgc3RhcnQgPSBzb3VyY2UubGVuZ3RoIC0gMTtcbiAgfVxuICBjb25zdCBlID0gbmVlZGxlW25lZWRsZS5sZW5ndGggLSAxXTtcbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpID49IDA7IGktLSkge1xuICAgIGlmIChzb3VyY2VbaV0gIT09IGUpIGNvbnRpbnVlO1xuICAgIGxldCBtYXRjaGVkID0gMTtcbiAgICBsZXQgaiA9IGk7XG4gICAgd2hpbGUgKFxuICAgICAgbWF0Y2hlZCA8IG5lZWRsZS5sZW5ndGggJiZcbiAgICAgIHNvdXJjZVstLWpdID09PSBuZWVkbGVbbmVlZGxlLmxlbmd0aCAtIDEgLSAoaSAtIGopXVxuICAgICkge1xuICAgICAgbWF0Y2hlZCsrO1xuICAgIH1cbiAgICBpZiAobWF0Y2hlZCA9PT0gbmVlZGxlLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGkgLSBuZWVkbGUubGVuZ3RoICsgMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FxQ0MsR0FDRCxPQUFPLFNBQVMsa0JBQ2QsTUFBa0IsRUFDbEIsTUFBa0IsRUFDbEIsUUFBZ0IsT0FBTyxNQUFNLEdBQUcsQ0FBQztFQUVqQyxJQUFJLFFBQVEsR0FBRztJQUNiLE9BQU8sQ0FBQztFQUNWO0VBQ0EsSUFBSSxTQUFTLE9BQU8sTUFBTSxFQUFFO0lBQzFCLFFBQVEsT0FBTyxNQUFNLEdBQUc7RUFDMUI7RUFDQSxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sTUFBTSxHQUFHLEVBQUU7RUFDbkMsSUFBSyxJQUFJLElBQUksT0FBTyxLQUFLLEdBQUcsSUFBSztJQUMvQixJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssR0FBRztJQUNyQixJQUFJLFVBQVU7SUFDZCxJQUFJLElBQUk7SUFDUixNQUNFLFVBQVUsT0FBTyxNQUFNLElBQ3ZCLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxNQUFNLENBQUMsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQ25EO01BQ0E7SUFDRjtJQUNBLElBQUksWUFBWSxPQUFPLE1BQU0sRUFBRTtNQUM3QixPQUFPLElBQUksT0FBTyxNQUFNLEdBQUc7SUFDN0I7RUFDRjtFQUNBLE9BQU8sQ0FBQztBQUNWIn0=
// denoCacheMetadata=868244332942719194,4982843570272164244