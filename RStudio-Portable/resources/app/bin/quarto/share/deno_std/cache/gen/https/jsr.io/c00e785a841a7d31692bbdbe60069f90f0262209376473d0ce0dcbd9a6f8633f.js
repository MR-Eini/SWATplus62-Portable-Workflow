// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Read big endian 16bit short from a {@linkcode BufReader}.
 *
 * @example Usage
 * ```ts
 * import { Buffer } from "@std/io/buffer"
 * import { BufReader } from "@std/io/buf-reader";
 * import { readShort } from "@std/io/read-short";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const buf = new BufReader(new Buffer(new Uint8Array([0x12, 0x34])));
 * const short = await readShort(buf);
 * assertEquals(short, 0x1234);
 * ```
 *
 * @param buf The reader to read from
 * @returns The 16bit short
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export async function readShort(buf) {
  const high = await buf.readByte();
  if (high === null) return null;
  const low = await buf.readByte();
  if (low === null) throw new Deno.errors.UnexpectedEof();
  return high << 8 | low;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9yZWFkX3Nob3J0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB0eXBlIHsgQnVmUmVhZGVyIH0gZnJvbSBcIi4vYnVmX3JlYWRlci50c1wiO1xuXG4vKipcbiAqIFJlYWQgYmlnIGVuZGlhbiAxNmJpdCBzaG9ydCBmcm9tIGEge0BsaW5rY29kZSBCdWZSZWFkZXJ9LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIkBzdGQvaW8vYnVmZmVyXCJcbiAqIGltcG9ydCB7IEJ1ZlJlYWRlciB9IGZyb20gXCJAc3RkL2lvL2J1Zi1yZWFkZXJcIjtcbiAqIGltcG9ydCB7IHJlYWRTaG9ydCB9IGZyb20gXCJAc3RkL2lvL3JlYWQtc2hvcnRcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBidWYgPSBuZXcgQnVmUmVhZGVyKG5ldyBCdWZmZXIobmV3IFVpbnQ4QXJyYXkoWzB4MTIsIDB4MzRdKSkpO1xuICogY29uc3Qgc2hvcnQgPSBhd2FpdCByZWFkU2hvcnQoYnVmKTtcbiAqIGFzc2VydEVxdWFscyhzaG9ydCwgMHgxMjM0KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBidWYgVGhlIHJlYWRlciB0byByZWFkIGZyb21cbiAqIEByZXR1cm5zIFRoZSAxNmJpdCBzaG9ydFxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2UgdGhlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvU3RyZWFtc19BUEkgfCBXZWIgU3RyZWFtcyBBUEl9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkU2hvcnQoYnVmOiBCdWZSZWFkZXIpOiBQcm9taXNlPG51bWJlciB8IG51bGw+IHtcbiAgY29uc3QgaGlnaCA9IGF3YWl0IGJ1Zi5yZWFkQnl0ZSgpO1xuICBpZiAoaGlnaCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGxvdyA9IGF3YWl0IGJ1Zi5yZWFkQnl0ZSgpO1xuICBpZiAobG93ID09PSBudWxsKSB0aHJvdyBuZXcgRGVuby5lcnJvcnMuVW5leHBlY3RlZEVvZigpO1xuICByZXR1cm4gKGhpZ2ggPDwgOCkgfCBsb3c7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBSTFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBQ0QsT0FBTyxlQUFlLFVBQVUsR0FBYztFQUM1QyxNQUFNLE9BQU8sTUFBTSxJQUFJLFFBQVE7RUFDL0IsSUFBSSxTQUFTLE1BQU0sT0FBTztFQUMxQixNQUFNLE1BQU0sTUFBTSxJQUFJLFFBQVE7RUFDOUIsSUFBSSxRQUFRLE1BQU0sTUFBTSxJQUFJLEtBQUssTUFBTSxDQUFDLGFBQWE7RUFDckQsT0FBTyxBQUFDLFFBQVEsSUFBSztBQUN2QiJ9
// denoCacheMetadata=36676892604504806,10266059911877863873