// Copyright 2009 The Go Authors. All rights reserved.
// https://github.com/golang/go/blob/master/LICENSE
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Port of the Go
 * {@link https://github.com/golang/go/blob/go1.12.5/src/encoding/hex/hex.go | encoding/hex}
 * library.
 *
 * ```ts
 * import {
 *   decodeHex,
 *   encodeHex,
 * } from "@std/encoding/hex";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(encodeHex("abc"), "616263");
 *
 * assertEquals(
 *   decodeHex("616263"),
 *   new TextEncoder().encode("abc"),
 * );
 * ```
 *
 * @module
 */ import { validateBinaryLike } from "./_validate_binary_like.ts";
const hexTable = new TextEncoder().encode("0123456789abcdef");
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
function errInvalidByte(byte) {
  return new TypeError(`Invalid byte '${String.fromCharCode(byte)}'`);
}
function errLength() {
  return new RangeError("Odd length hex string");
}
/** Converts a hex character into its value. */ function fromHexChar(byte) {
  // '0' <= byte && byte <= '9'
  if (48 <= byte && byte <= 57) return byte - 48;
  // 'a' <= byte && byte <= 'f'
  if (97 <= byte && byte <= 102) return byte - 97 + 10;
  // 'A' <= byte && byte <= 'F'
  if (65 <= byte && byte <= 70) return byte - 65 + 10;
  throw errInvalidByte(byte);
}
/**
 * Converts data into a hex-encoded string.
 *
 * @param src The data to encode.
 *
 * @returns The hex-encoded string.
 *
 * @example Usage
 * ```ts
 * import { encodeHex } from "@std/encoding/hex";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(encodeHex("abc"), "616263");
 * ```
 */ export function encodeHex(src) {
  const u8 = validateBinaryLike(src);
  const dst = new Uint8Array(u8.length * 2);
  for(let i = 0; i < dst.length; i++){
    const v = u8[i];
    dst[i * 2] = hexTable[v >> 4];
    dst[i * 2 + 1] = hexTable[v & 0x0f];
  }
  return textDecoder.decode(dst);
}
/**
 * Decodes the given hex-encoded string. If the input is malformed, an error is
 * thrown.
 *
 * @param src The hex-encoded string to decode.
 *
 * @returns The decoded data.
 *
 * @example Usage
 * ```ts
 * import { decodeHex } from "@std/encoding/hex";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(
 *   decodeHex("616263"),
 *   new TextEncoder().encode("abc"),
 * );
 * ```
 */ export function decodeHex(src) {
  const u8 = textEncoder.encode(src);
  const dst = new Uint8Array(u8.length / 2);
  for(let i = 0; i < dst.length; i++){
    const a = fromHexChar(u8[i * 2]);
    const b = fromHexChar(u8[i * 2 + 1]);
    dst[i] = a << 4 | b;
  }
  if (u8.length % 2 === 1) {
    // Check for invalid char before reporting bad length,
    // since the invalid char (if present) is an earlier problem.
    fromHexChar(u8[dst.length * 2]);
    throw errLength();
  }
  return dst;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZW5jb2RpbmcvMS4wLjAtcmMuMi9oZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMDkgVGhlIEdvIEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29sYW5nL2dvL2Jsb2IvbWFzdGVyL0xJQ0VOU0Vcbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogUG9ydCBvZiB0aGUgR29cbiAqIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZ29sYW5nL2dvL2Jsb2IvZ28xLjEyLjUvc3JjL2VuY29kaW5nL2hleC9oZXguZ28gfCBlbmNvZGluZy9oZXh9XG4gKiBsaWJyYXJ5LlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQge1xuICogICBkZWNvZGVIZXgsXG4gKiAgIGVuY29kZUhleCxcbiAqIH0gZnJvbSBcIkBzdGQvZW5jb2RpbmcvaGV4XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGFzc2VydEVxdWFscyhlbmNvZGVIZXgoXCJhYmNcIiksIFwiNjE2MjYzXCIpO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgZGVjb2RlSGV4KFwiNjE2MjYzXCIpLFxuICogICBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJhYmNcIiksXG4gKiApO1xuICogYGBgXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCB7IHZhbGlkYXRlQmluYXJ5TGlrZSB9IGZyb20gXCIuL192YWxpZGF0ZV9iaW5hcnlfbGlrZS50c1wiO1xuXG5jb25zdCBoZXhUYWJsZSA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcIjAxMjM0NTY3ODlhYmNkZWZcIik7XG5jb25zdCB0ZXh0RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuY29uc3QgdGV4dERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcblxuZnVuY3Rpb24gZXJySW52YWxpZEJ5dGUoYnl0ZTogbnVtYmVyKSB7XG4gIHJldHVybiBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGJ5dGUgJyR7U3RyaW5nLmZyb21DaGFyQ29kZShieXRlKX0nYCk7XG59XG5cbmZ1bmN0aW9uIGVyckxlbmd0aCgpIHtcbiAgcmV0dXJuIG5ldyBSYW5nZUVycm9yKFwiT2RkIGxlbmd0aCBoZXggc3RyaW5nXCIpO1xufVxuXG4vKiogQ29udmVydHMgYSBoZXggY2hhcmFjdGVyIGludG8gaXRzIHZhbHVlLiAqL1xuZnVuY3Rpb24gZnJvbUhleENoYXIoYnl0ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgLy8gJzAnIDw9IGJ5dGUgJiYgYnl0ZSA8PSAnOSdcbiAgaWYgKDQ4IDw9IGJ5dGUgJiYgYnl0ZSA8PSA1NykgcmV0dXJuIGJ5dGUgLSA0ODtcbiAgLy8gJ2EnIDw9IGJ5dGUgJiYgYnl0ZSA8PSAnZidcbiAgaWYgKDk3IDw9IGJ5dGUgJiYgYnl0ZSA8PSAxMDIpIHJldHVybiBieXRlIC0gOTcgKyAxMDtcbiAgLy8gJ0EnIDw9IGJ5dGUgJiYgYnl0ZSA8PSAnRidcbiAgaWYgKDY1IDw9IGJ5dGUgJiYgYnl0ZSA8PSA3MCkgcmV0dXJuIGJ5dGUgLSA2NSArIDEwO1xuXG4gIHRocm93IGVyckludmFsaWRCeXRlKGJ5dGUpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGRhdGEgaW50byBhIGhleC1lbmNvZGVkIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gc3JjIFRoZSBkYXRhIHRvIGVuY29kZS5cbiAqXG4gKiBAcmV0dXJucyBUaGUgaGV4LWVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5jb2RlSGV4IH0gZnJvbSBcIkBzdGQvZW5jb2RpbmcvaGV4XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGFzc2VydEVxdWFscyhlbmNvZGVIZXgoXCJhYmNcIiksIFwiNjE2MjYzXCIpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVIZXgoc3JjOiBzdHJpbmcgfCBVaW50OEFycmF5IHwgQXJyYXlCdWZmZXIpOiBzdHJpbmcge1xuICBjb25zdCB1OCA9IHZhbGlkYXRlQmluYXJ5TGlrZShzcmMpO1xuXG4gIGNvbnN0IGRzdCA9IG5ldyBVaW50OEFycmF5KHU4Lmxlbmd0aCAqIDIpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGRzdC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHYgPSB1OFtpXSE7XG4gICAgZHN0W2kgKiAyXSA9IGhleFRhYmxlW3YgPj4gNF0hO1xuICAgIGRzdFtpICogMiArIDFdID0gaGV4VGFibGVbdiAmIDB4MGZdITtcbiAgfVxuICByZXR1cm4gdGV4dERlY29kZXIuZGVjb2RlKGRzdCk7XG59XG5cbi8qKlxuICogRGVjb2RlcyB0aGUgZ2l2ZW4gaGV4LWVuY29kZWQgc3RyaW5nLiBJZiB0aGUgaW5wdXQgaXMgbWFsZm9ybWVkLCBhbiBlcnJvciBpc1xuICogdGhyb3duLlxuICpcbiAqIEBwYXJhbSBzcmMgVGhlIGhleC1lbmNvZGVkIHN0cmluZyB0byBkZWNvZGUuXG4gKlxuICogQHJldHVybnMgVGhlIGRlY29kZWQgZGF0YS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGRlY29kZUhleCB9IGZyb20gXCJAc3RkL2VuY29kaW5nL2hleFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGRlY29kZUhleChcIjYxNjI2M1wiKSxcbiAqICAgbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFwiYWJjXCIpLFxuICogKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlSGV4KHNyYzogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGNvbnN0IHU4ID0gdGV4dEVuY29kZXIuZW5jb2RlKHNyYyk7XG4gIGNvbnN0IGRzdCA9IG5ldyBVaW50OEFycmF5KHU4Lmxlbmd0aCAvIDIpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGRzdC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGEgPSBmcm9tSGV4Q2hhcih1OFtpICogMl0hKTtcbiAgICBjb25zdCBiID0gZnJvbUhleENoYXIodThbaSAqIDIgKyAxXSEpO1xuICAgIGRzdFtpXSA9IChhIDw8IDQpIHwgYjtcbiAgfVxuXG4gIGlmICh1OC5sZW5ndGggJSAyID09PSAxKSB7XG4gICAgLy8gQ2hlY2sgZm9yIGludmFsaWQgY2hhciBiZWZvcmUgcmVwb3J0aW5nIGJhZCBsZW5ndGgsXG4gICAgLy8gc2luY2UgdGhlIGludmFsaWQgY2hhciAoaWYgcHJlc2VudCkgaXMgYW4gZWFybGllciBwcm9ibGVtLlxuICAgIGZyb21IZXhDaGFyKHU4W2RzdC5sZW5ndGggKiAyXSEpO1xuICAgIHRocm93IGVyckxlbmd0aCgpO1xuICB9XG5cbiAgcmV0dXJuIGRzdDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFDdEQsbURBQW1EO0FBQ25ELDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCQyxHQUVELFNBQVMsa0JBQWtCLFFBQVEsNkJBQTZCO0FBRWhFLE1BQU0sV0FBVyxJQUFJLGNBQWMsTUFBTSxDQUFDO0FBQzFDLE1BQU0sY0FBYyxJQUFJO0FBQ3hCLE1BQU0sY0FBYyxJQUFJO0FBRXhCLFNBQVMsZUFBZSxJQUFZO0VBQ2xDLE9BQU8sSUFBSSxVQUFVLENBQUMsY0FBYyxFQUFFLE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BFO0FBRUEsU0FBUztFQUNQLE9BQU8sSUFBSSxXQUFXO0FBQ3hCO0FBRUEsNkNBQTZDLEdBQzdDLFNBQVMsWUFBWSxJQUFZO0VBQy9CLDZCQUE2QjtFQUM3QixJQUFJLE1BQU0sUUFBUSxRQUFRLElBQUksT0FBTyxPQUFPO0VBQzVDLDZCQUE2QjtFQUM3QixJQUFJLE1BQU0sUUFBUSxRQUFRLEtBQUssT0FBTyxPQUFPLEtBQUs7RUFDbEQsNkJBQTZCO0VBQzdCLElBQUksTUFBTSxRQUFRLFFBQVEsSUFBSSxPQUFPLE9BQU8sS0FBSztFQUVqRCxNQUFNLGVBQWU7QUFDdkI7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Q0FjQyxHQUNELE9BQU8sU0FBUyxVQUFVLEdBQXNDO0VBQzlELE1BQU0sS0FBSyxtQkFBbUI7RUFFOUIsTUFBTSxNQUFNLElBQUksV0FBVyxHQUFHLE1BQU0sR0FBRztFQUN2QyxJQUFLLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxNQUFNLEVBQUUsSUFBSztJQUNuQyxNQUFNLElBQUksRUFBRSxDQUFDLEVBQUU7SUFDZixHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRTtJQUM3QixHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxLQUFLO0VBQ3JDO0VBQ0EsT0FBTyxZQUFZLE1BQU0sQ0FBQztBQUM1QjtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FrQkMsR0FDRCxPQUFPLFNBQVMsVUFBVSxHQUFXO0VBQ25DLE1BQU0sS0FBSyxZQUFZLE1BQU0sQ0FBQztFQUM5QixNQUFNLE1BQU0sSUFBSSxXQUFXLEdBQUcsTUFBTSxHQUFHO0VBQ3ZDLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLE1BQU0sRUFBRSxJQUFLO0lBQ25DLE1BQU0sSUFBSSxZQUFZLEVBQUUsQ0FBQyxJQUFJLEVBQUU7SUFDL0IsTUFBTSxJQUFJLFlBQVksRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFO0lBQ25DLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQUFBQyxLQUFLLElBQUs7RUFDdEI7RUFFQSxJQUFJLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRztJQUN2QixzREFBc0Q7SUFDdEQsNkRBQTZEO0lBQzdELFlBQVksRUFBRSxDQUFDLElBQUksTUFBTSxHQUFHLEVBQUU7SUFDOUIsTUFBTTtFQUNSO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=16014611247047164446,12623545026165698707