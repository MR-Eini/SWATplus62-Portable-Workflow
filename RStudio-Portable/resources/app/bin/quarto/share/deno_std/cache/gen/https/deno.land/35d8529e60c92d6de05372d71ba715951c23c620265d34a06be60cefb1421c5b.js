// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// Copyright 2020 Keith Cirkel. All rights reserved. MIT license.
// Copyright 2023 Skye "MierenManz". All rights reserved. MIT license.
/**
 * Functions for encoding typed integers in array buffers.
 *
 * ```ts
 * import { encode, decode } from "https://deno.land/std@$STD_VERSION/encoding/varint.ts";
 *
 * const buf = new Uint8Array(10);
 * const [encoded, bytesWritten] = encode(42n, buf);
 * // [ Uint8Array(1) [ 42 ], 1 ];
 *
 * decode(encoded); // [ 42n, 1 ];
 * ```
 *
 * @module
 */ // This implementation is a port of https://deno.land/x/varint@v2.0.0 by @keithamus
// This module is browser compatible.
export const MaxUInt64 = 18446744073709551615n;
export const MaxVarIntLen64 = 10;
export const MaxVarIntLen32 = 5;
const MSB = 0x80;
const REST = 0x7f;
const SHIFT = 7;
const MSBN = 0x80n;
const SHIFTN = 7n;
// ArrayBuffer and TypedArray's for "pointer casting"
const AB = new ArrayBuffer(8);
const U32_VIEW = new Uint32Array(AB);
const U64_VIEW = new BigUint64Array(AB);
/**
 * Given a non empty `buf`, starting at `offset` (default: 0), begin decoding bytes as
 * VarInt encoded bytes, for a maximum of 10 bytes (offset + 10). The returned
 * tuple is of the decoded varint 32-bit number, and the new offset with which
 * to continue decoding other data.
 *
 * If a `bigint` in return is undesired, the `decode32` function will return a
 * `number`, but this should only be used in cases where the varint is
 * _assured_ to be 32-bits. If in doubt, use `decode()`.
 *
 * To know how many bytes the VarInt took to encode, simply negate `offset`
 * from the returned new `offset`.
 *
 * @param buf The buffer to decode from.
 * @param offset The offset to start decoding from.
 * @returns A tuple of the decoded varint 64-bit number, and the new offset.
 *
 * @example
 * ```ts
 * import { decode } from "https://deno.land/std@$STD_VERSION/encoding/varint.ts";
 *
 * const buf = new Uint8Array([0x8E, 0x02]);
 * decode(buf); // [ 300n, 2 ];
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode decodeVarint}
 * instead.
 */ export function decode(buf, offset = 0) {
  return decodeVarint(buf, offset);
}
/**
 * Given a non empty `buf`, starting at `offset` (default: 0), begin decoding bytes as
 * VarInt encoded bytes, for a maximum of 10 bytes (offset + 10). The returned
 * tuple is of the decoded varint 32-bit number, and the new offset with which
 * to continue decoding other data.
 *
 * If a `bigint` in return is undesired, the `decode32` function will return a
 * `number`, but this should only be used in cases where the varint is
 * _assured_ to be 32-bits. If in doubt, use `decode()`.
 *
 * To know how many bytes the VarInt took to encode, simply negate `offset`
 * from the returned new `offset`.
 *
 * @param buf The buffer to decode from.
 * @param offset The offset to start decoding from.
 * @returns A tuple of the decoded varint 64-bit number, and the new offset.
 *
 * @example
 * ```ts
 * import { decodeVarint } from "https://deno.land/std@$STD_VERSION/encoding/varint.ts";
 *
 * const buf = new Uint8Array([0x8E, 0x02]);
 * decodeVarint(buf); // [ 300n, 2 ];
 * ```
 */ export function decodeVarint(buf, offset = 0) {
  // Clear the last result from the Two's complement view
  U64_VIEW[0] = 0n;
  // Setup the initiat state of the function
  let intermediate = 0;
  let position = 0;
  let i = offset;
  // If the buffer is empty Throw
  if (buf.length === 0) throw new RangeError("Cannot read empty buffer");
  let byte;
  do {
    // Get a single byte from the buffer
    byte = buf[i];
    // 1. Take the lower 7 bits of the byte.
    // 2. Shift the bits into the correct position.
    // 3. Bitwise OR it with the intermediate value
    // QUIRK: in the 5th (and 10th) iteration of this loop it will overflow on the shift.
    // This causes only the lower 4 bits to be shifted into place and removing the upper 3 bits
    intermediate |= (byte & 0b01111111) << position;
    // If position is 28
    // it means that this iteration needs to be written the the two's complement view
    // This only happens once due to the `-4` in this branch
    if (position === 28) {
      // Write to the view
      U32_VIEW[0] = intermediate;
      // set `intermediate` to the remaining 3 bits
      // We only want the remaining three bits because the other 4 have been "consumed" on line 21
      intermediate = (byte & 0b01110000) >>> 4;
      // set `position` to -4 because later 7 will be added, making it 3
      position = -4;
    }
    // Increment the shift position by 7
    position += 7;
    // Increment the iterator by 1
    i++;
  // Keep going while there is a continuation bit
  }while ((byte & 0b10000000) === 0b10000000)
  // subtract the initial offset from `i` to get the bytes read
  const nRead = i - offset;
  // If 10 bytes have been read and intermediate has overflown
  // it means that the varint is malformed
  // If 11 bytes have been read it means that the varint is malformed
  // If `i` is bigger than the buffer it means we overread the buffer and the varint is malformed
  if (nRead === 10 && intermediate > -1 || nRead === 11 || i > buf.length) {
    throw new RangeError("malformed or overflow varint");
  }
  // Write the intermediate value to the "empty" slot
  // if the first slot is taken. Take the second slot
  U32_VIEW[Number(nRead > 4)] = intermediate;
  return [
    U64_VIEW[0],
    i
  ];
}
/**
 * Given a `buf`, starting at `offset` (default: 0), begin decoding bytes as
 * VarInt encoded bytes, for a maximum of 5 bytes (offset + 5). The returned
 * tuple is of the decoded varint 32-bit number, and the new offset with which
 * to continue decoding other data.
 *
 * VarInts are _not 32-bit by default_ so this should only be used in cases
 * where the varint is _assured_ to be 32-bits. If in doubt, use `decode()`.
 *
 * To know how many bytes the VarInt took to encode, simply negate `offset`
 * from the returned new `offset`.
 *
 * @param buf The buffer to decode from.
 * @param offset The offset to start decoding from.
 * @returns A tuple of the decoded varint 32-bit number, and the new offset.
 *
 * @example
 * ```ts
 * import { decode32 } from "https://deno.land/std@$STD_VERSION/encoding/varint.ts";
 *
 * const buf = new Uint8Array([0x8E, 0x02]);
 * decode32(buf); // [ 300, 2 ];
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode decodeVarint32}
 * instead.
 */ export function decode32(buf, offset = 0) {
  return decodeVarint32(buf, offset);
}
/**
 * Given a `buf`, starting at `offset` (default: 0), begin decoding bytes as
 * VarInt encoded bytes, for a maximum of 5 bytes (offset + 5). The returned
 * tuple is of the decoded varint 32-bit number, and the new offset with which
 * to continue decoding other data.
 *
 * VarInts are _not 32-bit by default_ so this should only be used in cases
 * where the varint is _assured_ to be 32-bits. If in doubt, use `decode()`.
 *
 * To know how many bytes the VarInt took to encode, simply negate `offset`
 * from the returned new `offset`.
 *
 * @param buf The buffer to decode from.
 * @param offset The offset to start decoding from.
 * @returns A tuple of the decoded varint 32-bit number, and the new offset.
 *
 * @example
 * ```ts
 * import { decodeVarint32 } from "https://deno.land/std@$STD_VERSION/encoding/varint.ts";
 *
 * const buf = new Uint8Array([0x8E, 0x02]);
 * decodeVarint32(buf); // [ 300, 2 ];
 * ```
 */ export function decodeVarint32(buf, offset = 0) {
  let shift = 0;
  let decoded = 0;
  for(let i = offset; i <= Math.min(buf.length, offset + MaxVarIntLen32); i += 1, shift += SHIFT){
    const byte = buf[i];
    decoded += (byte & REST) * Math.pow(2, shift);
    if (!(byte & MSB)) return [
      decoded,
      i + 1
    ];
  }
  throw new RangeError("malformed or overflow varint");
}
/**
 * Takes unsigned number `num` and converts it into a VarInt encoded
 * `Uint8Array`, returning a tuple consisting of a `Uint8Array` slice of the
 * encoded VarInt, and an offset where the VarInt encoded bytes end within the
 * `Uint8Array`.
 *
 * If `buf` is not given then a Uint8Array will be created.
 * `offset` defaults to `0`.
 *
 * If passed `buf` then that will be written into, starting at `offset`. The
 * resulting returned `Uint8Array` will be a slice of `buf`. The resulting
 * returned number is effectively `offset + bytesWritten`.
 *
 * @param num The number to encode.
 * @param buf The buffer to write into.
 * @param offset The offset to start writing at.
 * @returns A tuple of the encoded VarInt `Uint8Array` and the new offset.
 *
 * @example
 * ```ts
 * import { encode } from "https://deno.land/std@$STD_VERSION/encoding/varint.ts";
 *
 * const buf = new Uint8Array(10);
 * encode(42n, buf); // [ Uint8Array(1) [ 42 ], 1 ];
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode encodeVarint} instead.
 */ export function encode(num, buf = new Uint8Array(MaxVarIntLen64), offset = 0) {
  return encodeVarint(num, buf, offset);
}
/**
 * Takes unsigned number `num` and converts it into a VarInt encoded
 * `Uint8Array`, returning a tuple consisting of a `Uint8Array` slice of the
 * encoded VarInt, and an offset where the VarInt encoded bytes end within the
 * `Uint8Array`.
 *
 * If `buf` is not given then a Uint8Array will be created.
 * `offset` defaults to `0`.
 *
 * If passed `buf` then that will be written into, starting at `offset`. The
 * resulting returned `Uint8Array` will be a slice of `buf`. The resulting
 * returned number is effectively `offset + bytesWritten`.
 *
 * @param num The number to encode.
 * @param buf The buffer to write into.
 * @param offset The offset to start writing at.
 * @returns A tuple of the encoded VarInt `Uint8Array` and the new offset.
 *
 * @example
 * ```ts
 * import { encodeVarint } from "https://deno.land/std@$STD_VERSION/encoding/varint.ts";
 *
 * const buf = new Uint8Array(10);
 * encodeVarint(42n, buf); // [ Uint8Array(1) [ 42 ], 1 ];
 * ```
 */ export function encodeVarint(num, buf = new Uint8Array(MaxVarIntLen64), offset = 0) {
  num = BigInt(num);
  if (num < 0n) throw new RangeError("signed input given");
  for(let i = offset; i <= Math.min(buf.length, MaxVarIntLen64); i += 1){
    if (num < MSBN) {
      buf[i] = Number(num);
      i += 1;
      return [
        buf.slice(offset, i),
        i
      ];
    }
    buf[i] = Number(num & 0xFFn | MSBN);
    num >>= SHIFTN;
  }
  throw new RangeError(`${num} overflows uint64`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIyNC4wL2VuY29kaW5nL3ZhcmludC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMjAgS2VpdGggQ2lya2VsLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDIzIFNreWUgXCJNaWVyZW5NYW56XCIuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLyoqXG4gKiBGdW5jdGlvbnMgZm9yIGVuY29kaW5nIHR5cGVkIGludGVnZXJzIGluIGFycmF5IGJ1ZmZlcnMuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVuY29kZSwgZGVjb2RlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZW5jb2RpbmcvdmFyaW50LnRzXCI7XG4gKlxuICogY29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkoMTApO1xuICogY29uc3QgW2VuY29kZWQsIGJ5dGVzV3JpdHRlbl0gPSBlbmNvZGUoNDJuLCBidWYpO1xuICogLy8gWyBVaW50OEFycmF5KDEpIFsgNDIgXSwgMSBdO1xuICpcbiAqIGRlY29kZShlbmNvZGVkKTsgLy8gWyA0Mm4sIDEgXTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG4vLyBUaGlzIGltcGxlbWVudGF0aW9uIGlzIGEgcG9ydCBvZiBodHRwczovL2Rlbm8ubGFuZC94L3ZhcmludEB2Mi4wLjAgYnkgQGtlaXRoYW11c1xuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5leHBvcnQgY29uc3QgTWF4VUludDY0ID0gMTg0NDY3NDQwNzM3MDk1NTE2MTVuO1xuZXhwb3J0IGNvbnN0IE1heFZhckludExlbjY0ID0gMTA7XG5leHBvcnQgY29uc3QgTWF4VmFySW50TGVuMzIgPSA1O1xuXG5jb25zdCBNU0IgPSAweDgwO1xuY29uc3QgUkVTVCA9IDB4N2Y7XG5jb25zdCBTSElGVCA9IDc7XG5jb25zdCBNU0JOID0gMHg4MG47XG5jb25zdCBTSElGVE4gPSA3bjtcblxuLy8gQXJyYXlCdWZmZXIgYW5kIFR5cGVkQXJyYXkncyBmb3IgXCJwb2ludGVyIGNhc3RpbmdcIlxuY29uc3QgQUIgPSBuZXcgQXJyYXlCdWZmZXIoOCk7XG5jb25zdCBVMzJfVklFVyA9IG5ldyBVaW50MzJBcnJheShBQik7XG5jb25zdCBVNjRfVklFVyA9IG5ldyBCaWdVaW50NjRBcnJheShBQik7XG5cbi8qKlxuICogR2l2ZW4gYSBub24gZW1wdHkgYGJ1ZmAsIHN0YXJ0aW5nIGF0IGBvZmZzZXRgIChkZWZhdWx0OiAwKSwgYmVnaW4gZGVjb2RpbmcgYnl0ZXMgYXNcbiAqIFZhckludCBlbmNvZGVkIGJ5dGVzLCBmb3IgYSBtYXhpbXVtIG9mIDEwIGJ5dGVzIChvZmZzZXQgKyAxMCkuIFRoZSByZXR1cm5lZFxuICogdHVwbGUgaXMgb2YgdGhlIGRlY29kZWQgdmFyaW50IDMyLWJpdCBudW1iZXIsIGFuZCB0aGUgbmV3IG9mZnNldCB3aXRoIHdoaWNoXG4gKiB0byBjb250aW51ZSBkZWNvZGluZyBvdGhlciBkYXRhLlxuICpcbiAqIElmIGEgYGJpZ2ludGAgaW4gcmV0dXJuIGlzIHVuZGVzaXJlZCwgdGhlIGBkZWNvZGUzMmAgZnVuY3Rpb24gd2lsbCByZXR1cm4gYVxuICogYG51bWJlcmAsIGJ1dCB0aGlzIHNob3VsZCBvbmx5IGJlIHVzZWQgaW4gY2FzZXMgd2hlcmUgdGhlIHZhcmludCBpc1xuICogX2Fzc3VyZWRfIHRvIGJlIDMyLWJpdHMuIElmIGluIGRvdWJ0LCB1c2UgYGRlY29kZSgpYC5cbiAqXG4gKiBUbyBrbm93IGhvdyBtYW55IGJ5dGVzIHRoZSBWYXJJbnQgdG9vayB0byBlbmNvZGUsIHNpbXBseSBuZWdhdGUgYG9mZnNldGBcbiAqIGZyb20gdGhlIHJldHVybmVkIG5ldyBgb2Zmc2V0YC5cbiAqXG4gKiBAcGFyYW0gYnVmIFRoZSBidWZmZXIgdG8gZGVjb2RlIGZyb20uXG4gKiBAcGFyYW0gb2Zmc2V0IFRoZSBvZmZzZXQgdG8gc3RhcnQgZGVjb2RpbmcgZnJvbS5cbiAqIEByZXR1cm5zIEEgdHVwbGUgb2YgdGhlIGRlY29kZWQgdmFyaW50IDY0LWJpdCBudW1iZXIsIGFuZCB0aGUgbmV3IG9mZnNldC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGRlY29kZSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2VuY29kaW5nL3ZhcmludC50c1wiO1xuICpcbiAqIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KFsweDhFLCAweDAyXSk7XG4gKiBkZWNvZGUoYnVmKTsgLy8gWyAzMDBuLCAyIF07XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHtAbGlua2NvZGUgZGVjb2RlVmFyaW50fVxuICogaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZShidWY6IFVpbnQ4QXJyYXksIG9mZnNldCA9IDApOiBbYmlnaW50LCBudW1iZXJdIHtcbiAgcmV0dXJuIGRlY29kZVZhcmludChidWYsIG9mZnNldCk7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBub24gZW1wdHkgYGJ1ZmAsIHN0YXJ0aW5nIGF0IGBvZmZzZXRgIChkZWZhdWx0OiAwKSwgYmVnaW4gZGVjb2RpbmcgYnl0ZXMgYXNcbiAqIFZhckludCBlbmNvZGVkIGJ5dGVzLCBmb3IgYSBtYXhpbXVtIG9mIDEwIGJ5dGVzIChvZmZzZXQgKyAxMCkuIFRoZSByZXR1cm5lZFxuICogdHVwbGUgaXMgb2YgdGhlIGRlY29kZWQgdmFyaW50IDMyLWJpdCBudW1iZXIsIGFuZCB0aGUgbmV3IG9mZnNldCB3aXRoIHdoaWNoXG4gKiB0byBjb250aW51ZSBkZWNvZGluZyBvdGhlciBkYXRhLlxuICpcbiAqIElmIGEgYGJpZ2ludGAgaW4gcmV0dXJuIGlzIHVuZGVzaXJlZCwgdGhlIGBkZWNvZGUzMmAgZnVuY3Rpb24gd2lsbCByZXR1cm4gYVxuICogYG51bWJlcmAsIGJ1dCB0aGlzIHNob3VsZCBvbmx5IGJlIHVzZWQgaW4gY2FzZXMgd2hlcmUgdGhlIHZhcmludCBpc1xuICogX2Fzc3VyZWRfIHRvIGJlIDMyLWJpdHMuIElmIGluIGRvdWJ0LCB1c2UgYGRlY29kZSgpYC5cbiAqXG4gKiBUbyBrbm93IGhvdyBtYW55IGJ5dGVzIHRoZSBWYXJJbnQgdG9vayB0byBlbmNvZGUsIHNpbXBseSBuZWdhdGUgYG9mZnNldGBcbiAqIGZyb20gdGhlIHJldHVybmVkIG5ldyBgb2Zmc2V0YC5cbiAqXG4gKiBAcGFyYW0gYnVmIFRoZSBidWZmZXIgdG8gZGVjb2RlIGZyb20uXG4gKiBAcGFyYW0gb2Zmc2V0IFRoZSBvZmZzZXQgdG8gc3RhcnQgZGVjb2RpbmcgZnJvbS5cbiAqIEByZXR1cm5zIEEgdHVwbGUgb2YgdGhlIGRlY29kZWQgdmFyaW50IDY0LWJpdCBudW1iZXIsIGFuZCB0aGUgbmV3IG9mZnNldC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGRlY29kZVZhcmludCB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2VuY29kaW5nL3ZhcmludC50c1wiO1xuICpcbiAqIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KFsweDhFLCAweDAyXSk7XG4gKiBkZWNvZGVWYXJpbnQoYnVmKTsgLy8gWyAzMDBuLCAyIF07XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZVZhcmludChidWY6IFVpbnQ4QXJyYXksIG9mZnNldCA9IDApOiBbYmlnaW50LCBudW1iZXJdIHtcbiAgLy8gQ2xlYXIgdGhlIGxhc3QgcmVzdWx0IGZyb20gdGhlIFR3bydzIGNvbXBsZW1lbnQgdmlld1xuICBVNjRfVklFV1swXSA9IDBuO1xuXG4gIC8vIFNldHVwIHRoZSBpbml0aWF0IHN0YXRlIG9mIHRoZSBmdW5jdGlvblxuICBsZXQgaW50ZXJtZWRpYXRlID0gMDtcbiAgbGV0IHBvc2l0aW9uID0gMDtcbiAgbGV0IGkgPSBvZmZzZXQ7XG5cbiAgLy8gSWYgdGhlIGJ1ZmZlciBpcyBlbXB0eSBUaHJvd1xuICBpZiAoYnVmLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJDYW5ub3QgcmVhZCBlbXB0eSBidWZmZXJcIik7XG5cbiAgbGV0IGJ5dGU7XG4gIGRvIHtcbiAgICAvLyBHZXQgYSBzaW5nbGUgYnl0ZSBmcm9tIHRoZSBidWZmZXJcbiAgICBieXRlID0gYnVmW2ldITtcblxuICAgIC8vIDEuIFRha2UgdGhlIGxvd2VyIDcgYml0cyBvZiB0aGUgYnl0ZS5cbiAgICAvLyAyLiBTaGlmdCB0aGUgYml0cyBpbnRvIHRoZSBjb3JyZWN0IHBvc2l0aW9uLlxuICAgIC8vIDMuIEJpdHdpc2UgT1IgaXQgd2l0aCB0aGUgaW50ZXJtZWRpYXRlIHZhbHVlXG4gICAgLy8gUVVJUks6IGluIHRoZSA1dGggKGFuZCAxMHRoKSBpdGVyYXRpb24gb2YgdGhpcyBsb29wIGl0IHdpbGwgb3ZlcmZsb3cgb24gdGhlIHNoaWZ0LlxuICAgIC8vIFRoaXMgY2F1c2VzIG9ubHkgdGhlIGxvd2VyIDQgYml0cyB0byBiZSBzaGlmdGVkIGludG8gcGxhY2UgYW5kIHJlbW92aW5nIHRoZSB1cHBlciAzIGJpdHNcbiAgICBpbnRlcm1lZGlhdGUgfD0gKGJ5dGUgJiAwYjAxMTExMTExKSA8PCBwb3NpdGlvbjtcblxuICAgIC8vIElmIHBvc2l0aW9uIGlzIDI4XG4gICAgLy8gaXQgbWVhbnMgdGhhdCB0aGlzIGl0ZXJhdGlvbiBuZWVkcyB0byBiZSB3cml0dGVuIHRoZSB0aGUgdHdvJ3MgY29tcGxlbWVudCB2aWV3XG4gICAgLy8gVGhpcyBvbmx5IGhhcHBlbnMgb25jZSBkdWUgdG8gdGhlIGAtNGAgaW4gdGhpcyBicmFuY2hcbiAgICBpZiAocG9zaXRpb24gPT09IDI4KSB7XG4gICAgICAvLyBXcml0ZSB0byB0aGUgdmlld1xuICAgICAgVTMyX1ZJRVdbMF0gPSBpbnRlcm1lZGlhdGU7XG4gICAgICAvLyBzZXQgYGludGVybWVkaWF0ZWAgdG8gdGhlIHJlbWFpbmluZyAzIGJpdHNcbiAgICAgIC8vIFdlIG9ubHkgd2FudCB0aGUgcmVtYWluaW5nIHRocmVlIGJpdHMgYmVjYXVzZSB0aGUgb3RoZXIgNCBoYXZlIGJlZW4gXCJjb25zdW1lZFwiIG9uIGxpbmUgMjFcbiAgICAgIGludGVybWVkaWF0ZSA9IChieXRlICYgMGIwMTExMDAwMCkgPj4+IDQ7XG4gICAgICAvLyBzZXQgYHBvc2l0aW9uYCB0byAtNCBiZWNhdXNlIGxhdGVyIDcgd2lsbCBiZSBhZGRlZCwgbWFraW5nIGl0IDNcbiAgICAgIHBvc2l0aW9uID0gLTQ7XG4gICAgfVxuXG4gICAgLy8gSW5jcmVtZW50IHRoZSBzaGlmdCBwb3NpdGlvbiBieSA3XG4gICAgcG9zaXRpb24gKz0gNztcbiAgICAvLyBJbmNyZW1lbnQgdGhlIGl0ZXJhdG9yIGJ5IDFcbiAgICBpKys7XG4gICAgLy8gS2VlcCBnb2luZyB3aGlsZSB0aGVyZSBpcyBhIGNvbnRpbnVhdGlvbiBiaXRcbiAgfSB3aGlsZSAoKGJ5dGUgJiAwYjEwMDAwMDAwKSA9PT0gMGIxMDAwMDAwMCk7XG4gIC8vIHN1YnRyYWN0IHRoZSBpbml0aWFsIG9mZnNldCBmcm9tIGBpYCB0byBnZXQgdGhlIGJ5dGVzIHJlYWRcbiAgY29uc3QgblJlYWQgPSBpIC0gb2Zmc2V0O1xuXG4gIC8vIElmIDEwIGJ5dGVzIGhhdmUgYmVlbiByZWFkIGFuZCBpbnRlcm1lZGlhdGUgaGFzIG92ZXJmbG93blxuICAvLyBpdCBtZWFucyB0aGF0IHRoZSB2YXJpbnQgaXMgbWFsZm9ybWVkXG4gIC8vIElmIDExIGJ5dGVzIGhhdmUgYmVlbiByZWFkIGl0IG1lYW5zIHRoYXQgdGhlIHZhcmludCBpcyBtYWxmb3JtZWRcbiAgLy8gSWYgYGlgIGlzIGJpZ2dlciB0aGFuIHRoZSBidWZmZXIgaXQgbWVhbnMgd2Ugb3ZlcnJlYWQgdGhlIGJ1ZmZlciBhbmQgdGhlIHZhcmludCBpcyBtYWxmb3JtZWRcbiAgaWYgKChuUmVhZCA9PT0gMTAgJiYgaW50ZXJtZWRpYXRlID4gLTEpIHx8IG5SZWFkID09PSAxMSB8fCBpID4gYnVmLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwibWFsZm9ybWVkIG9yIG92ZXJmbG93IHZhcmludFwiKTtcbiAgfVxuXG4gIC8vIFdyaXRlIHRoZSBpbnRlcm1lZGlhdGUgdmFsdWUgdG8gdGhlIFwiZW1wdHlcIiBzbG90XG4gIC8vIGlmIHRoZSBmaXJzdCBzbG90IGlzIHRha2VuLiBUYWtlIHRoZSBzZWNvbmQgc2xvdFxuICBVMzJfVklFV1tOdW1iZXIoblJlYWQgPiA0KV0gPSBpbnRlcm1lZGlhdGU7XG5cbiAgcmV0dXJuIFtVNjRfVklFV1swXSwgaV07XG59XG5cbi8qKlxuICogR2l2ZW4gYSBgYnVmYCwgc3RhcnRpbmcgYXQgYG9mZnNldGAgKGRlZmF1bHQ6IDApLCBiZWdpbiBkZWNvZGluZyBieXRlcyBhc1xuICogVmFySW50IGVuY29kZWQgYnl0ZXMsIGZvciBhIG1heGltdW0gb2YgNSBieXRlcyAob2Zmc2V0ICsgNSkuIFRoZSByZXR1cm5lZFxuICogdHVwbGUgaXMgb2YgdGhlIGRlY29kZWQgdmFyaW50IDMyLWJpdCBudW1iZXIsIGFuZCB0aGUgbmV3IG9mZnNldCB3aXRoIHdoaWNoXG4gKiB0byBjb250aW51ZSBkZWNvZGluZyBvdGhlciBkYXRhLlxuICpcbiAqIFZhckludHMgYXJlIF9ub3QgMzItYml0IGJ5IGRlZmF1bHRfIHNvIHRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZCBpbiBjYXNlc1xuICogd2hlcmUgdGhlIHZhcmludCBpcyBfYXNzdXJlZF8gdG8gYmUgMzItYml0cy4gSWYgaW4gZG91YnQsIHVzZSBgZGVjb2RlKClgLlxuICpcbiAqIFRvIGtub3cgaG93IG1hbnkgYnl0ZXMgdGhlIFZhckludCB0b29rIHRvIGVuY29kZSwgc2ltcGx5IG5lZ2F0ZSBgb2Zmc2V0YFxuICogZnJvbSB0aGUgcmV0dXJuZWQgbmV3IGBvZmZzZXRgLlxuICpcbiAqIEBwYXJhbSBidWYgVGhlIGJ1ZmZlciB0byBkZWNvZGUgZnJvbS5cbiAqIEBwYXJhbSBvZmZzZXQgVGhlIG9mZnNldCB0byBzdGFydCBkZWNvZGluZyBmcm9tLlxuICogQHJldHVybnMgQSB0dXBsZSBvZiB0aGUgZGVjb2RlZCB2YXJpbnQgMzItYml0IG51bWJlciwgYW5kIHRoZSBuZXcgb2Zmc2V0LlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZGVjb2RlMzIgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9lbmNvZGluZy92YXJpbnQudHNcIjtcbiAqXG4gKiBjb25zdCBidWYgPSBuZXcgVWludDhBcnJheShbMHg4RSwgMHgwMl0pO1xuICogZGVjb2RlMzIoYnVmKTsgLy8gWyAzMDAsIDIgXTtcbiAqIGBgYFxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2Uge0BsaW5rY29kZSBkZWNvZGVWYXJpbnQzMn1cbiAqIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGUzMihidWY6IFVpbnQ4QXJyYXksIG9mZnNldCA9IDApOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgcmV0dXJuIGRlY29kZVZhcmludDMyKGJ1Ziwgb2Zmc2V0KTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIGBidWZgLCBzdGFydGluZyBhdCBgb2Zmc2V0YCAoZGVmYXVsdDogMCksIGJlZ2luIGRlY29kaW5nIGJ5dGVzIGFzXG4gKiBWYXJJbnQgZW5jb2RlZCBieXRlcywgZm9yIGEgbWF4aW11bSBvZiA1IGJ5dGVzIChvZmZzZXQgKyA1KS4gVGhlIHJldHVybmVkXG4gKiB0dXBsZSBpcyBvZiB0aGUgZGVjb2RlZCB2YXJpbnQgMzItYml0IG51bWJlciwgYW5kIHRoZSBuZXcgb2Zmc2V0IHdpdGggd2hpY2hcbiAqIHRvIGNvbnRpbnVlIGRlY29kaW5nIG90aGVyIGRhdGEuXG4gKlxuICogVmFySW50cyBhcmUgX25vdCAzMi1iaXQgYnkgZGVmYXVsdF8gc28gdGhpcyBzaG91bGQgb25seSBiZSB1c2VkIGluIGNhc2VzXG4gKiB3aGVyZSB0aGUgdmFyaW50IGlzIF9hc3N1cmVkXyB0byBiZSAzMi1iaXRzLiBJZiBpbiBkb3VidCwgdXNlIGBkZWNvZGUoKWAuXG4gKlxuICogVG8ga25vdyBob3cgbWFueSBieXRlcyB0aGUgVmFySW50IHRvb2sgdG8gZW5jb2RlLCBzaW1wbHkgbmVnYXRlIGBvZmZzZXRgXG4gKiBmcm9tIHRoZSByZXR1cm5lZCBuZXcgYG9mZnNldGAuXG4gKlxuICogQHBhcmFtIGJ1ZiBUaGUgYnVmZmVyIHRvIGRlY29kZSBmcm9tLlxuICogQHBhcmFtIG9mZnNldCBUaGUgb2Zmc2V0IHRvIHN0YXJ0IGRlY29kaW5nIGZyb20uXG4gKiBAcmV0dXJucyBBIHR1cGxlIG9mIHRoZSBkZWNvZGVkIHZhcmludCAzMi1iaXQgbnVtYmVyLCBhbmQgdGhlIG5ldyBvZmZzZXQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkZWNvZGVWYXJpbnQzMiB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2VuY29kaW5nL3ZhcmludC50c1wiO1xuICpcbiAqIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KFsweDhFLCAweDAyXSk7XG4gKiBkZWNvZGVWYXJpbnQzMihidWYpOyAvLyBbIDMwMCwgMiBdO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVWYXJpbnQzMihidWY6IFVpbnQ4QXJyYXksIG9mZnNldCA9IDApOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgbGV0IHNoaWZ0ID0gMDtcbiAgbGV0IGRlY29kZWQgPSAwO1xuICBmb3IgKFxuICAgIGxldCBpID0gb2Zmc2V0O1xuICAgIGkgPD0gTWF0aC5taW4oYnVmLmxlbmd0aCwgb2Zmc2V0ICsgTWF4VmFySW50TGVuMzIpO1xuICAgIGkgKz0gMSwgc2hpZnQgKz0gU0hJRlRcbiAgKSB7XG4gICAgY29uc3QgYnl0ZSA9IGJ1ZltpXSE7XG4gICAgZGVjb2RlZCArPSAoYnl0ZSAmIFJFU1QpICogTWF0aC5wb3coMiwgc2hpZnQpO1xuICAgIGlmICghKGJ5dGUgJiBNU0IpKSByZXR1cm4gW2RlY29kZWQsIGkgKyAxXTtcbiAgfVxuICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIm1hbGZvcm1lZCBvciBvdmVyZmxvdyB2YXJpbnRcIik7XG59XG5cbi8qKlxuICogVGFrZXMgdW5zaWduZWQgbnVtYmVyIGBudW1gIGFuZCBjb252ZXJ0cyBpdCBpbnRvIGEgVmFySW50IGVuY29kZWRcbiAqIGBVaW50OEFycmF5YCwgcmV0dXJuaW5nIGEgdHVwbGUgY29uc2lzdGluZyBvZiBhIGBVaW50OEFycmF5YCBzbGljZSBvZiB0aGVcbiAqIGVuY29kZWQgVmFySW50LCBhbmQgYW4gb2Zmc2V0IHdoZXJlIHRoZSBWYXJJbnQgZW5jb2RlZCBieXRlcyBlbmQgd2l0aGluIHRoZVxuICogYFVpbnQ4QXJyYXlgLlxuICpcbiAqIElmIGBidWZgIGlzIG5vdCBnaXZlbiB0aGVuIGEgVWludDhBcnJheSB3aWxsIGJlIGNyZWF0ZWQuXG4gKiBgb2Zmc2V0YCBkZWZhdWx0cyB0byBgMGAuXG4gKlxuICogSWYgcGFzc2VkIGBidWZgIHRoZW4gdGhhdCB3aWxsIGJlIHdyaXR0ZW4gaW50bywgc3RhcnRpbmcgYXQgYG9mZnNldGAuIFRoZVxuICogcmVzdWx0aW5nIHJldHVybmVkIGBVaW50OEFycmF5YCB3aWxsIGJlIGEgc2xpY2Ugb2YgYGJ1ZmAuIFRoZSByZXN1bHRpbmdcbiAqIHJldHVybmVkIG51bWJlciBpcyBlZmZlY3RpdmVseSBgb2Zmc2V0ICsgYnl0ZXNXcml0dGVuYC5cbiAqXG4gKiBAcGFyYW0gbnVtIFRoZSBudW1iZXIgdG8gZW5jb2RlLlxuICogQHBhcmFtIGJ1ZiBUaGUgYnVmZmVyIHRvIHdyaXRlIGludG8uXG4gKiBAcGFyYW0gb2Zmc2V0IFRoZSBvZmZzZXQgdG8gc3RhcnQgd3JpdGluZyBhdC5cbiAqIEByZXR1cm5zIEEgdHVwbGUgb2YgdGhlIGVuY29kZWQgVmFySW50IGBVaW50OEFycmF5YCBhbmQgdGhlIG5ldyBvZmZzZXQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlbmNvZGUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9lbmNvZGluZy92YXJpbnQudHNcIjtcbiAqXG4gKiBjb25zdCBidWYgPSBuZXcgVWludDhBcnJheSgxMCk7XG4gKiBlbmNvZGUoNDJuLCBidWYpOyAvLyBbIFVpbnQ4QXJyYXkoMSkgWyA0MiBdLCAxIF07XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHtAbGlua2NvZGUgZW5jb2RlVmFyaW50fSBpbnN0ZWFkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlKFxuICBudW06IGJpZ2ludCB8IG51bWJlcixcbiAgYnVmOiBVaW50OEFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoTWF4VmFySW50TGVuNjQpLFxuICBvZmZzZXQgPSAwLFxuKTogW1VpbnQ4QXJyYXksIG51bWJlcl0ge1xuICByZXR1cm4gZW5jb2RlVmFyaW50KG51bSwgYnVmLCBvZmZzZXQpO1xufVxuXG4vKipcbiAqIFRha2VzIHVuc2lnbmVkIG51bWJlciBgbnVtYCBhbmQgY29udmVydHMgaXQgaW50byBhIFZhckludCBlbmNvZGVkXG4gKiBgVWludDhBcnJheWAsIHJldHVybmluZyBhIHR1cGxlIGNvbnNpc3Rpbmcgb2YgYSBgVWludDhBcnJheWAgc2xpY2Ugb2YgdGhlXG4gKiBlbmNvZGVkIFZhckludCwgYW5kIGFuIG9mZnNldCB3aGVyZSB0aGUgVmFySW50IGVuY29kZWQgYnl0ZXMgZW5kIHdpdGhpbiB0aGVcbiAqIGBVaW50OEFycmF5YC5cbiAqXG4gKiBJZiBgYnVmYCBpcyBub3QgZ2l2ZW4gdGhlbiBhIFVpbnQ4QXJyYXkgd2lsbCBiZSBjcmVhdGVkLlxuICogYG9mZnNldGAgZGVmYXVsdHMgdG8gYDBgLlxuICpcbiAqIElmIHBhc3NlZCBgYnVmYCB0aGVuIHRoYXQgd2lsbCBiZSB3cml0dGVuIGludG8sIHN0YXJ0aW5nIGF0IGBvZmZzZXRgLiBUaGVcbiAqIHJlc3VsdGluZyByZXR1cm5lZCBgVWludDhBcnJheWAgd2lsbCBiZSBhIHNsaWNlIG9mIGBidWZgLiBUaGUgcmVzdWx0aW5nXG4gKiByZXR1cm5lZCBudW1iZXIgaXMgZWZmZWN0aXZlbHkgYG9mZnNldCArIGJ5dGVzV3JpdHRlbmAuXG4gKlxuICogQHBhcmFtIG51bSBUaGUgbnVtYmVyIHRvIGVuY29kZS5cbiAqIEBwYXJhbSBidWYgVGhlIGJ1ZmZlciB0byB3cml0ZSBpbnRvLlxuICogQHBhcmFtIG9mZnNldCBUaGUgb2Zmc2V0IHRvIHN0YXJ0IHdyaXRpbmcgYXQuXG4gKiBAcmV0dXJucyBBIHR1cGxlIG9mIHRoZSBlbmNvZGVkIFZhckludCBgVWludDhBcnJheWAgYW5kIHRoZSBuZXcgb2Zmc2V0LlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5jb2RlVmFyaW50IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZW5jb2RpbmcvdmFyaW50LnRzXCI7XG4gKlxuICogY29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkoMTApO1xuICogZW5jb2RlVmFyaW50KDQybiwgYnVmKTsgLy8gWyBVaW50OEFycmF5KDEpIFsgNDIgXSwgMSBdO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVWYXJpbnQoXG4gIG51bTogYmlnaW50IHwgbnVtYmVyLFxuICBidWY6IFVpbnQ4QXJyYXkgPSBuZXcgVWludDhBcnJheShNYXhWYXJJbnRMZW42NCksXG4gIG9mZnNldCA9IDAsXG4pOiBbVWludDhBcnJheSwgbnVtYmVyXSB7XG4gIG51bSA9IEJpZ0ludChudW0pO1xuICBpZiAobnVtIDwgMG4pIHRocm93IG5ldyBSYW5nZUVycm9yKFwic2lnbmVkIGlucHV0IGdpdmVuXCIpO1xuICBmb3IgKFxuICAgIGxldCBpID0gb2Zmc2V0O1xuICAgIGkgPD0gTWF0aC5taW4oYnVmLmxlbmd0aCwgTWF4VmFySW50TGVuNjQpO1xuICAgIGkgKz0gMVxuICApIHtcbiAgICBpZiAobnVtIDwgTVNCTikge1xuICAgICAgYnVmW2ldID0gTnVtYmVyKG51bSk7XG4gICAgICBpICs9IDE7XG4gICAgICByZXR1cm4gW2J1Zi5zbGljZShvZmZzZXQsIGkpLCBpXTtcbiAgICB9XG4gICAgYnVmW2ldID0gTnVtYmVyKChudW0gJiAweEZGbikgfCBNU0JOKTtcbiAgICBudW0gPj49IFNISUZUTjtcbiAgfVxuICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgJHtudW19IG92ZXJmbG93cyB1aW50NjRgKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsaUVBQWlFO0FBQ2pFLHNFQUFzRTtBQUN0RTs7Ozs7Ozs7Ozs7Ozs7Q0FjQyxHQUVELG1GQUFtRjtBQUNuRixxQ0FBcUM7QUFFckMsT0FBTyxNQUFNLFlBQVkscUJBQXFCLENBQUM7QUFDL0MsT0FBTyxNQUFNLGlCQUFpQixHQUFHO0FBQ2pDLE9BQU8sTUFBTSxpQkFBaUIsRUFBRTtBQUVoQyxNQUFNLE1BQU07QUFDWixNQUFNLE9BQU87QUFDYixNQUFNLFFBQVE7QUFDZCxNQUFNLE9BQU8sS0FBSztBQUNsQixNQUFNLFNBQVMsRUFBRTtBQUVqQixxREFBcUQ7QUFDckQsTUFBTSxLQUFLLElBQUksWUFBWTtBQUMzQixNQUFNLFdBQVcsSUFBSSxZQUFZO0FBQ2pDLE1BQU0sV0FBVyxJQUFJLGVBQWU7QUFFcEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTJCQyxHQUNELE9BQU8sU0FBUyxPQUFPLEdBQWUsRUFBRSxTQUFTLENBQUM7RUFDaEQsT0FBTyxhQUFhLEtBQUs7QUFDM0I7QUFFQTs7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
// denoCacheMetadata=13116889303693562147,12514693126222468567