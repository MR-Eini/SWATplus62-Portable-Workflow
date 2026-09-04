// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { readShort } from "./read_short.ts";
/**
 * Read big endian 32bit integer from a {@linkcode BufReader}.
 *
 * @example Usage
 * ```ts
 * import { Buffer } from "@std/io/buffer"
 * import { BufReader } from "@std/io/buf-reader";
 * import { readInt } from "@std/io/read-int";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const buf = new BufReader(new Buffer(new Uint8Array([0x12, 0x34, 0x56, 0x78])));
 * const int = await readInt(buf);
 * assertEquals(int, 0x12345678);
 * ```
 *
 * @param buf The buffer reader to read from
 * @returns The 32bit integer
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export async function readInt(buf) {
  const high = await readShort(buf);
  if (high === null) return null;
  const low = await readShort(buf);
  if (low === null) throw new Deno.errors.UnexpectedEof();
  return high << 16 | low;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9yZWFkX2ludC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgdHlwZSB7IEJ1ZlJlYWRlciB9IGZyb20gXCIuL2J1Zl9yZWFkZXIudHNcIjtcbmltcG9ydCB7IHJlYWRTaG9ydCB9IGZyb20gXCIuL3JlYWRfc2hvcnQudHNcIjtcblxuLyoqXG4gKiBSZWFkIGJpZyBlbmRpYW4gMzJiaXQgaW50ZWdlciBmcm9tIGEge0BsaW5rY29kZSBCdWZSZWFkZXJ9LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIkBzdGQvaW8vYnVmZmVyXCJcbiAqIGltcG9ydCB7IEJ1ZlJlYWRlciB9IGZyb20gXCJAc3RkL2lvL2J1Zi1yZWFkZXJcIjtcbiAqIGltcG9ydCB7IHJlYWRJbnQgfSBmcm9tIFwiQHN0ZC9pby9yZWFkLWludFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICpcbiAqIGNvbnN0IGJ1ZiA9IG5ldyBCdWZSZWFkZXIobmV3IEJ1ZmZlcihuZXcgVWludDhBcnJheShbMHgxMiwgMHgzNCwgMHg1NiwgMHg3OF0pKSk7XG4gKiBjb25zdCBpbnQgPSBhd2FpdCByZWFkSW50KGJ1Zik7XG4gKiBhc3NlcnRFcXVhbHMoaW50LCAweDEyMzQ1Njc4KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBidWYgVGhlIGJ1ZmZlciByZWFkZXIgdG8gcmVhZCBmcm9tXG4gKiBAcmV0dXJucyBUaGUgMzJiaXQgaW50ZWdlclxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2UgdGhlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvU3RyZWFtc19BUEkgfCBXZWIgU3RyZWFtcyBBUEl9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkSW50KGJ1ZjogQnVmUmVhZGVyKTogUHJvbWlzZTxudW1iZXIgfCBudWxsPiB7XG4gIGNvbnN0IGhpZ2ggPSBhd2FpdCByZWFkU2hvcnQoYnVmKTtcbiAgaWYgKGhpZ2ggPT09IG51bGwpIHJldHVybiBudWxsO1xuICBjb25zdCBsb3cgPSBhd2FpdCByZWFkU2hvcnQoYnVmKTtcbiAgaWYgKGxvdyA9PT0gbnVsbCkgdGhyb3cgbmV3IERlbm8uZXJyb3JzLlVuZXhwZWN0ZWRFb2YoKTtcbiAgcmV0dXJuIChoaWdoIDw8IDE2KSB8IGxvdztcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFHMUUsU0FBUyxTQUFTLFFBQVEsa0JBQWtCO0FBRTVDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBQ0QsT0FBTyxlQUFlLFFBQVEsR0FBYztFQUMxQyxNQUFNLE9BQU8sTUFBTSxVQUFVO0VBQzdCLElBQUksU0FBUyxNQUFNLE9BQU87RUFDMUIsTUFBTSxNQUFNLE1BQU0sVUFBVTtFQUM1QixJQUFJLFFBQVEsTUFBTSxNQUFNLElBQUksS0FBSyxNQUFNLENBQUMsYUFBYTtFQUNyRCxPQUFPLEFBQUMsUUFBUSxLQUFNO0FBQ3hCIn0=
// denoCacheMetadata=1854642662073699765,14447780327066620452