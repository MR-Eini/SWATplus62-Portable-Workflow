// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { copy } from "./copy.ts";
/**
 * Returns a new byte slice composed of `count` repetitions of the `source`
 * array.
 *
 * @param source Source array to repeat.
 * @param count Number of times to repeat the source array.
 * @returns A new byte slice composed of `count` repetitions of the `source`
 * array.
 *
 * @example Basic usage
 * ```ts
 * import { repeat } from "@std/bytes/repeat";
 *
 * const source = new Uint8Array([0, 1, 2]);
 *
 * repeat(source, 3); // Uint8Array(9) [0, 1, 2, 0, 1, 2, 0, 1, 2]
 *
 * repeat(source, 0); // Uint8Array(0) []
 *
 * repeat(source, -1); // Throws `RangeError`
 * ```
 */ export function repeat(source, count) {
  if (count < 0 || !Number.isInteger(count)) {
    throw new RangeError("Count must be a non-negative integer");
  }
  const repeated = new Uint8Array(source.length * count);
  let offset = 0;
  while(offset < repeated.length){
    offset += copy(source, repeated, offset);
  }
  return repeated;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMC4yMjQuMC9yZXBlYXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB7IGNvcHkgfSBmcm9tIFwiLi9jb3B5LnRzXCI7XG5cbi8qKlxuICogUmV0dXJucyBhIG5ldyBieXRlIHNsaWNlIGNvbXBvc2VkIG9mIGBjb3VudGAgcmVwZXRpdGlvbnMgb2YgdGhlIGBzb3VyY2VgXG4gKiBhcnJheS5cbiAqXG4gKiBAcGFyYW0gc291cmNlIFNvdXJjZSBhcnJheSB0byByZXBlYXQuXG4gKiBAcGFyYW0gY291bnQgTnVtYmVyIG9mIHRpbWVzIHRvIHJlcGVhdCB0aGUgc291cmNlIGFycmF5LlxuICogQHJldHVybnMgQSBuZXcgYnl0ZSBzbGljZSBjb21wb3NlZCBvZiBgY291bnRgIHJlcGV0aXRpb25zIG9mIHRoZSBgc291cmNlYFxuICogYXJyYXkuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyByZXBlYXQgfSBmcm9tIFwiQHN0ZC9ieXRlcy9yZXBlYXRcIjtcbiAqXG4gKiBjb25zdCBzb3VyY2UgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMl0pO1xuICpcbiAqIHJlcGVhdChzb3VyY2UsIDMpOyAvLyBVaW50OEFycmF5KDkpIFswLCAxLCAyLCAwLCAxLCAyLCAwLCAxLCAyXVxuICpcbiAqIHJlcGVhdChzb3VyY2UsIDApOyAvLyBVaW50OEFycmF5KDApIFtdXG4gKlxuICogcmVwZWF0KHNvdXJjZSwgLTEpOyAvLyBUaHJvd3MgYFJhbmdlRXJyb3JgXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcGVhdChzb3VyY2U6IFVpbnQ4QXJyYXksIGNvdW50OiBudW1iZXIpOiBVaW50OEFycmF5IHtcbiAgaWYgKGNvdW50IDwgMCB8fCAhTnVtYmVyLmlzSW50ZWdlcihjb3VudCkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIkNvdW50IG11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlclwiKTtcbiAgfVxuXG4gIGNvbnN0IHJlcGVhdGVkID0gbmV3IFVpbnQ4QXJyYXkoc291cmNlLmxlbmd0aCAqIGNvdW50KTtcbiAgbGV0IG9mZnNldCA9IDA7XG5cbiAgd2hpbGUgKG9mZnNldCA8IHJlcGVhdGVkLmxlbmd0aCkge1xuICAgIG9mZnNldCArPSBjb3B5KHNvdXJjZSwgcmVwZWF0ZWQsIG9mZnNldCk7XG4gIH1cblxuICByZXR1cm4gcmVwZWF0ZWQ7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUNyQyxTQUFTLElBQUksUUFBUSxZQUFZO0FBRWpDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FxQkMsR0FDRCxPQUFPLFNBQVMsT0FBTyxNQUFrQixFQUFFLEtBQWE7RUFDdEQsSUFBSSxRQUFRLEtBQUssQ0FBQyxPQUFPLFNBQVMsQ0FBQyxRQUFRO0lBQ3pDLE1BQU0sSUFBSSxXQUFXO0VBQ3ZCO0VBRUEsTUFBTSxXQUFXLElBQUksV0FBVyxPQUFPLE1BQU0sR0FBRztFQUNoRCxJQUFJLFNBQVM7RUFFYixNQUFPLFNBQVMsU0FBUyxNQUFNLENBQUU7SUFDL0IsVUFBVSxLQUFLLFFBQVEsVUFBVTtFQUNuQztFQUVBLE9BQU87QUFDVCJ9
// denoCacheMetadata=15356750086962251244,913303605205677727