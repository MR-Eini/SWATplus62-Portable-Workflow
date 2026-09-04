// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Copy bytes from the source array to the destination array and returns the
 * number of bytes copied.
 *
 * If the source array is larger than what the `dst` array can hold, only the
 * amount of bytes that fit in the `dst` array are copied.
 *
 * @param src Source array to copy from.
 * @param dst Destination array to copy to.
 * @param offset Offset in the destination array to start copying to. Defaults
 * to 0.
 * @returns Number of bytes copied.
 *
 * @example Basic usage
 * ```ts
 * import { copy } from "@std/bytes/copy";
 *
 * const src = new Uint8Array([9, 8, 7]);
 * const dst = new Uint8Array([0, 1, 2, 3, 4, 5]);
 *
 * copy(src, dst); // 3
 * dst; // Uint8Array(6) [9, 8, 7, 3, 4, 5]
 * ```
 *
 * @example Copy with offset
 * ```ts
 * import { copy } from "@std/bytes/copy";
 *
 * const src = new Uint8Array([1, 1, 1, 1]);
 * const dst = new Uint8Array([0, 0, 0, 0]);
 *
 * copy(src, dst, 1); // 3
 * dst; // Uint8Array(4) [0, 1, 1, 1]
 * ```
 * Defining an offset will start copying at the specified index in the
 * destination array.
 */ export function copy(src, dst, offset = 0) {
  offset = Math.max(0, Math.min(offset, dst.byteLength));
  const dstBytesAvailable = dst.byteLength - offset;
  if (src.byteLength > dstBytesAvailable) {
    src = src.subarray(0, dstBytesAvailable);
  }
  dst.set(src, offset);
  return src.byteLength;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMC4yMjQuMC9jb3B5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogQ29weSBieXRlcyBmcm9tIHRoZSBzb3VyY2UgYXJyYXkgdG8gdGhlIGRlc3RpbmF0aW9uIGFycmF5IGFuZCByZXR1cm5zIHRoZVxuICogbnVtYmVyIG9mIGJ5dGVzIGNvcGllZC5cbiAqXG4gKiBJZiB0aGUgc291cmNlIGFycmF5IGlzIGxhcmdlciB0aGFuIHdoYXQgdGhlIGBkc3RgIGFycmF5IGNhbiBob2xkLCBvbmx5IHRoZVxuICogYW1vdW50IG9mIGJ5dGVzIHRoYXQgZml0IGluIHRoZSBgZHN0YCBhcnJheSBhcmUgY29waWVkLlxuICpcbiAqIEBwYXJhbSBzcmMgU291cmNlIGFycmF5IHRvIGNvcHkgZnJvbS5cbiAqIEBwYXJhbSBkc3QgRGVzdGluYXRpb24gYXJyYXkgdG8gY29weSB0by5cbiAqIEBwYXJhbSBvZmZzZXQgT2Zmc2V0IGluIHRoZSBkZXN0aW5hdGlvbiBhcnJheSB0byBzdGFydCBjb3B5aW5nIHRvLiBEZWZhdWx0c1xuICogdG8gMC5cbiAqIEByZXR1cm5zIE51bWJlciBvZiBieXRlcyBjb3BpZWQuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBjb3B5IH0gZnJvbSBcIkBzdGQvYnl0ZXMvY29weVwiO1xuICpcbiAqIGNvbnN0IHNyYyA9IG5ldyBVaW50OEFycmF5KFs5LCA4LCA3XSk7XG4gKiBjb25zdCBkc3QgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMiwgMywgNCwgNV0pO1xuICpcbiAqIGNvcHkoc3JjLCBkc3QpOyAvLyAzXG4gKiBkc3Q7IC8vIFVpbnQ4QXJyYXkoNikgWzksIDgsIDcsIDMsIDQsIDVdXG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBDb3B5IHdpdGggb2Zmc2V0XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY29weSB9IGZyb20gXCJAc3RkL2J5dGVzL2NvcHlcIjtcbiAqXG4gKiBjb25zdCBzcmMgPSBuZXcgVWludDhBcnJheShbMSwgMSwgMSwgMV0pO1xuICogY29uc3QgZHN0ID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDAsIDAsIDBdKTtcbiAqXG4gKiBjb3B5KHNyYywgZHN0LCAxKTsgLy8gM1xuICogZHN0OyAvLyBVaW50OEFycmF5KDQpIFswLCAxLCAxLCAxXVxuICogYGBgXG4gKiBEZWZpbmluZyBhbiBvZmZzZXQgd2lsbCBzdGFydCBjb3B5aW5nIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXggaW4gdGhlXG4gKiBkZXN0aW5hdGlvbiBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkoc3JjOiBVaW50OEFycmF5LCBkc3Q6IFVpbnQ4QXJyYXksIG9mZnNldCA9IDApOiBudW1iZXIge1xuICBvZmZzZXQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihvZmZzZXQsIGRzdC5ieXRlTGVuZ3RoKSk7XG4gIGNvbnN0IGRzdEJ5dGVzQXZhaWxhYmxlID0gZHN0LmJ5dGVMZW5ndGggLSBvZmZzZXQ7XG4gIGlmIChzcmMuYnl0ZUxlbmd0aCA+IGRzdEJ5dGVzQXZhaWxhYmxlKSB7XG4gICAgc3JjID0gc3JjLnN1YmFycmF5KDAsIGRzdEJ5dGVzQXZhaWxhYmxlKTtcbiAgfVxuICBkc3Quc2V0KHNyYywgb2Zmc2V0KTtcbiAgcmV0dXJuIHNyYy5ieXRlTGVuZ3RoO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW9DQyxHQUNELE9BQU8sU0FBUyxLQUFLLEdBQWUsRUFBRSxHQUFlLEVBQUUsU0FBUyxDQUFDO0VBQy9ELFNBQVMsS0FBSyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxRQUFRLElBQUksVUFBVTtFQUNwRCxNQUFNLG9CQUFvQixJQUFJLFVBQVUsR0FBRztFQUMzQyxJQUFJLElBQUksVUFBVSxHQUFHLG1CQUFtQjtJQUN0QyxNQUFNLElBQUksUUFBUSxDQUFDLEdBQUc7RUFDeEI7RUFDQSxJQUFJLEdBQUcsQ0FBQyxLQUFLO0VBQ2IsT0FBTyxJQUFJLFVBQVU7QUFDdkIifQ==
// denoCacheMetadata=2042065107372331318,1508312369744984799