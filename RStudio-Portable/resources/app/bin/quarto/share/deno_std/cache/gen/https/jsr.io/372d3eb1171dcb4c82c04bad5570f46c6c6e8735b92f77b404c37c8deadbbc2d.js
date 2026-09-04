// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Slice number into 64bit big endian byte array.
 *
 * @example Usage
 * ```ts
 * import { sliceLongToBytes } from "@std/io/slice-long-to-bytes";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const dest = sliceLongToBytes(0x123456789a);
 * assertEquals(dest, [0, 0, 0, 0x12, 0x34, 0x56, 0x78, 0x9a]);
 * ```
 *
 * @param d The number to be sliced
 * @param dest The array to store the sliced bytes
 * @returns The sliced bytes
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export function sliceLongToBytes(d, dest = Array.from({
  length: 8
})) {
  let big = BigInt(d);
  for(let i = 0; i < 8; i++){
    dest[7 - i] = Number(big & 0xffn);
    big >>= 8n;
  }
  return dest;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9zbGljZV9sb25nX3RvX2J5dGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogU2xpY2UgbnVtYmVyIGludG8gNjRiaXQgYmlnIGVuZGlhbiBieXRlIGFycmF5LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgc2xpY2VMb25nVG9CeXRlcyB9IGZyb20gXCJAc3RkL2lvL3NsaWNlLWxvbmctdG8tYnl0ZXNcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBkZXN0ID0gc2xpY2VMb25nVG9CeXRlcygweDEyMzQ1Njc4OWEpO1xuICogYXNzZXJ0RXF1YWxzKGRlc3QsIFswLCAwLCAwLCAweDEyLCAweDM0LCAweDU2LCAweDc4LCAweDlhXSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gZCBUaGUgbnVtYmVyIHRvIGJlIHNsaWNlZFxuICogQHBhcmFtIGRlc3QgVGhlIGFycmF5IHRvIHN0b3JlIHRoZSBzbGljZWQgYnl0ZXNcbiAqIEByZXR1cm5zIFRoZSBzbGljZWQgYnl0ZXNcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0cmVhbXNfQVBJIHwgV2ViIFN0cmVhbXMgQVBJfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2xpY2VMb25nVG9CeXRlcyhcbiAgZDogbnVtYmVyLFxuICBkZXN0OiBudW1iZXJbXSA9IEFycmF5LmZyb208bnVtYmVyPih7IGxlbmd0aDogOCB9KSxcbik6IG51bWJlcltdIHtcbiAgbGV0IGJpZyA9IEJpZ0ludChkKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICBkZXN0WzcgLSBpXSA9IE51bWJlcihiaWcgJiAweGZmbik7XG4gICAgYmlnID4+PSA4bjtcbiAgfVxuICByZXR1cm4gZGVzdDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCQyxHQUNELE9BQU8sU0FBUyxpQkFDZCxDQUFTLEVBQ1QsT0FBaUIsTUFBTSxJQUFJLENBQVM7RUFBRSxRQUFRO0FBQUUsRUFBRTtFQUVsRCxJQUFJLE1BQU0sT0FBTztFQUNqQixJQUFLLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFLO0lBQzFCLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxPQUFPLE1BQU0sS0FBSztJQUNoQyxRQUFRLEVBQUU7RUFDWjtFQUNBLE9BQU87QUFDVCJ9
// denoCacheMetadata=11143754929139686791,10867993379403083476