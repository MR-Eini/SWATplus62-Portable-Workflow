// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { readInt } from "./read_int.ts";
const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
/**
 * Read big endian 64bit long from a {@linkcode BufReader}.
 *
 * @example Usage
 * ```ts
 * import { Buffer } from "@std/io/buffer"
 * import { BufReader } from "@std/io/buf-reader";
 * import { readLong } from "@std/io/read-long";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const buf = new BufReader(new Buffer(new Uint8Array([0, 0, 0, 0x12, 0x34, 0x56, 0x78, 0x9a])));
 * const long = await readLong(buf);
 * assertEquals(long, 0x123456789a);
 * ```
 *
 * @param buf The BufReader to read from
 * @returns The 64bit long
 * @throws {Deno.errors.UnexpectedEof} If the reader returns unexpected EOF
 * @throws {RangeError} If the long value is too big to be represented as a JavaScript number
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export async function readLong(buf) {
  const high = await readInt(buf);
  if (high === null) return null;
  const low = await readInt(buf);
  if (low === null) throw new Deno.errors.UnexpectedEof();
  const big = BigInt(high) << 32n | BigInt(low);
  // We probably should provide a similar API that returns BigInt values.
  if (big > MAX_SAFE_INTEGER) {
    throw new RangeError("Long value too big to be represented as a JavaScript number.");
  }
  return Number(big);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9yZWFkX2xvbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHR5cGUgeyBCdWZSZWFkZXIgfSBmcm9tIFwiLi9idWZfcmVhZGVyLnRzXCI7XG5pbXBvcnQgeyByZWFkSW50IH0gZnJvbSBcIi4vcmVhZF9pbnQudHNcIjtcblxuY29uc3QgTUFYX1NBRkVfSU5URUdFUiA9IEJpZ0ludChOdW1iZXIuTUFYX1NBRkVfSU5URUdFUik7XG5cbi8qKlxuICogUmVhZCBiaWcgZW5kaWFuIDY0Yml0IGxvbmcgZnJvbSBhIHtAbGlua2NvZGUgQnVmUmVhZGVyfS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJAc3RkL2lvL2J1ZmZlclwiXG4gKiBpbXBvcnQgeyBCdWZSZWFkZXIgfSBmcm9tIFwiQHN0ZC9pby9idWYtcmVhZGVyXCI7XG4gKiBpbXBvcnQgeyByZWFkTG9uZyB9IGZyb20gXCJAc3RkL2lvL3JlYWQtbG9uZ1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICpcbiAqIGNvbnN0IGJ1ZiA9IG5ldyBCdWZSZWFkZXIobmV3IEJ1ZmZlcihuZXcgVWludDhBcnJheShbMCwgMCwgMCwgMHgxMiwgMHgzNCwgMHg1NiwgMHg3OCwgMHg5YV0pKSk7XG4gKiBjb25zdCBsb25nID0gYXdhaXQgcmVhZExvbmcoYnVmKTtcbiAqIGFzc2VydEVxdWFscyhsb25nLCAweDEyMzQ1Njc4OWEpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIGJ1ZiBUaGUgQnVmUmVhZGVyIHRvIHJlYWQgZnJvbVxuICogQHJldHVybnMgVGhlIDY0Yml0IGxvbmdcbiAqIEB0aHJvd3Mge0Rlbm8uZXJyb3JzLlVuZXhwZWN0ZWRFb2Z9IElmIHRoZSByZWFkZXIgcmV0dXJucyB1bmV4cGVjdGVkIEVPRlxuICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgdGhlIGxvbmcgdmFsdWUgaXMgdG9vIGJpZyB0byBiZSByZXByZXNlbnRlZCBhcyBhIEphdmFTY3JpcHQgbnVtYmVyXG4gKlxuICogQGRlcHJlY2F0ZWQgVGhpcyB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAuIFVzZSB0aGUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9TdHJlYW1zX0FQSSB8IFdlYiBTdHJlYW1zIEFQSX0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRMb25nKGJ1ZjogQnVmUmVhZGVyKTogUHJvbWlzZTxudW1iZXIgfCBudWxsPiB7XG4gIGNvbnN0IGhpZ2ggPSBhd2FpdCByZWFkSW50KGJ1Zik7XG4gIGlmIChoaWdoID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgbG93ID0gYXdhaXQgcmVhZEludChidWYpO1xuICBpZiAobG93ID09PSBudWxsKSB0aHJvdyBuZXcgRGVuby5lcnJvcnMuVW5leHBlY3RlZEVvZigpO1xuICBjb25zdCBiaWcgPSAoQmlnSW50KGhpZ2gpIDw8IDMybikgfCBCaWdJbnQobG93KTtcbiAgLy8gV2UgcHJvYmFibHkgc2hvdWxkIHByb3ZpZGUgYSBzaW1pbGFyIEFQSSB0aGF0IHJldHVybnMgQmlnSW50IHZhbHVlcy5cbiAgaWYgKGJpZyA+IE1BWF9TQUZFX0lOVEVHRVIpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcbiAgICAgIFwiTG9uZyB2YWx1ZSB0b28gYmlnIHRvIGJlIHJlcHJlc2VudGVkIGFzIGEgSmF2YVNjcmlwdCBudW1iZXIuXCIsXG4gICAgKTtcbiAgfVxuICByZXR1cm4gTnVtYmVyKGJpZyk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRzFFLFNBQVMsT0FBTyxRQUFRLGdCQUFnQjtBQUV4QyxNQUFNLG1CQUFtQixPQUFPLE9BQU8sZ0JBQWdCO0FBRXZEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FxQkMsR0FDRCxPQUFPLGVBQWUsU0FBUyxHQUFjO0VBQzNDLE1BQU0sT0FBTyxNQUFNLFFBQVE7RUFDM0IsSUFBSSxTQUFTLE1BQU0sT0FBTztFQUMxQixNQUFNLE1BQU0sTUFBTSxRQUFRO0VBQzFCLElBQUksUUFBUSxNQUFNLE1BQU0sSUFBSSxLQUFLLE1BQU0sQ0FBQyxhQUFhO0VBQ3JELE1BQU0sTUFBTSxBQUFDLE9BQU8sU0FBUyxHQUFHLEdBQUksT0FBTztFQUMzQyx1RUFBdUU7RUFDdkUsSUFBSSxNQUFNLGtCQUFrQjtJQUMxQixNQUFNLElBQUksV0FDUjtFQUVKO0VBQ0EsT0FBTyxPQUFPO0FBQ2hCIn0=
// denoCacheMetadata=15746041148496590549,11844250189653459408