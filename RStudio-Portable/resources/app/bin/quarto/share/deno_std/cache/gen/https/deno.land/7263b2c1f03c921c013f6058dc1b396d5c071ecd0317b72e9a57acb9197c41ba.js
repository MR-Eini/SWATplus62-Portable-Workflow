// Copyright 2009 The Go Authors. All rights reserved.
// https://github.com/golang/go/blob/master/LICENSE
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Port of the Go
 * {@link https://github.com/golang/go/blob/go1.12.5/src/encoding/hex/hex.go | encoding/hex}
 * library.
 *
 * This module is browser compatible.
 *
 * ```ts
 * import {
 *   decodeHex,
 *   encodeHex,
 * } from "https://deno.land/std@$STD_VERSION/encoding/hex.ts";
 *
 * const encoded = encodeHex("abc"); // "616263"
 *
 * decodeHex(encoded); // Uint8Array(3) [ 97, 98, 99 ]
 * ```
 *
 * @module
 */ import { validateBinaryLike } from "./_util.ts";
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
 * @example
 * ```ts
 * import { encodeHex } from "https://deno.land/std@$STD_VERSION/encoding/hex.ts";
 *
 * encodeHex("abc"); // "616263"
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
 * @example
 * ```ts
 * import { decodeHex } from "https://deno.land/std@$STD_VERSION/encoding/hex.ts";
 *
 * decodeHex("616263"); // Uint8Array(3) [ 97, 98, 99 ]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIyNC4wL2VuY29kaW5nL2hleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAwOSBUaGUgR28gQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb2xhbmcvZ28vYmxvYi9tYXN0ZXIvTElDRU5TRVxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBQb3J0IG9mIHRoZSBHb1xuICoge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9nb2xhbmcvZ28vYmxvYi9nbzEuMTIuNS9zcmMvZW5jb2RpbmcvaGV4L2hleC5nbyB8IGVuY29kaW5nL2hleH1cbiAqIGxpYnJhcnkuXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQge1xuICogICBkZWNvZGVIZXgsXG4gKiAgIGVuY29kZUhleCxcbiAqIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZW5jb2RpbmcvaGV4LnRzXCI7XG4gKlxuICogY29uc3QgZW5jb2RlZCA9IGVuY29kZUhleChcImFiY1wiKTsgLy8gXCI2MTYyNjNcIlxuICpcbiAqIGRlY29kZUhleChlbmNvZGVkKTsgLy8gVWludDhBcnJheSgzKSBbIDk3LCA5OCwgOTkgXVxuICogYGBgXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCB7IHZhbGlkYXRlQmluYXJ5TGlrZSB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5cbmNvbnN0IGhleFRhYmxlID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFwiMDEyMzQ1Njc4OWFiY2RlZlwiKTtcbmNvbnN0IHRleHRFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG5jb25zdCB0ZXh0RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuXG5mdW5jdGlvbiBlcnJJbnZhbGlkQnl0ZShieXRlOiBudW1iZXIpIHtcbiAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoYEludmFsaWQgYnl0ZSAnJHtTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGUpfSdgKTtcbn1cblxuZnVuY3Rpb24gZXJyTGVuZ3RoKCkge1xuICByZXR1cm4gbmV3IFJhbmdlRXJyb3IoXCJPZGQgbGVuZ3RoIGhleCBzdHJpbmdcIik7XG59XG5cbi8qKiBDb252ZXJ0cyBhIGhleCBjaGFyYWN0ZXIgaW50byBpdHMgdmFsdWUuICovXG5mdW5jdGlvbiBmcm9tSGV4Q2hhcihieXRlOiBudW1iZXIpOiBudW1iZXIge1xuICAvLyAnMCcgPD0gYnl0ZSAmJiBieXRlIDw9ICc5J1xuICBpZiAoNDggPD0gYnl0ZSAmJiBieXRlIDw9IDU3KSByZXR1cm4gYnl0ZSAtIDQ4O1xuICAvLyAnYScgPD0gYnl0ZSAmJiBieXRlIDw9ICdmJ1xuICBpZiAoOTcgPD0gYnl0ZSAmJiBieXRlIDw9IDEwMikgcmV0dXJuIGJ5dGUgLSA5NyArIDEwO1xuICAvLyAnQScgPD0gYnl0ZSAmJiBieXRlIDw9ICdGJ1xuICBpZiAoNjUgPD0gYnl0ZSAmJiBieXRlIDw9IDcwKSByZXR1cm4gYnl0ZSAtIDY1ICsgMTA7XG5cbiAgdGhyb3cgZXJySW52YWxpZEJ5dGUoYnl0ZSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgZGF0YSBpbnRvIGEgaGV4LWVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5jb2RlSGV4IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZW5jb2RpbmcvaGV4LnRzXCI7XG4gKlxuICogZW5jb2RlSGV4KFwiYWJjXCIpOyAvLyBcIjYxNjI2M1wiXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUhleChzcmM6IHN0cmluZyB8IFVpbnQ4QXJyYXkgfCBBcnJheUJ1ZmZlcik6IHN0cmluZyB7XG4gIGNvbnN0IHU4ID0gdmFsaWRhdGVCaW5hcnlMaWtlKHNyYyk7XG5cbiAgY29uc3QgZHN0ID0gbmV3IFVpbnQ4QXJyYXkodTgubGVuZ3RoICogMik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZHN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgdiA9IHU4W2ldITtcbiAgICBkc3RbaSAqIDJdID0gaGV4VGFibGVbdiA+PiA0XSE7XG4gICAgZHN0W2kgKiAyICsgMV0gPSBoZXhUYWJsZVt2ICYgMHgwZl0hO1xuICB9XG4gIHJldHVybiB0ZXh0RGVjb2Rlci5kZWNvZGUoZHN0KTtcbn1cblxuLyoqXG4gKiBEZWNvZGVzIHRoZSBnaXZlbiBoZXgtZW5jb2RlZCBzdHJpbmcuIElmIHRoZSBpbnB1dCBpcyBtYWxmb3JtZWQsIGFuIGVycm9yIGlzXG4gKiB0aHJvd24uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkZWNvZGVIZXggfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9lbmNvZGluZy9oZXgudHNcIjtcbiAqXG4gKiBkZWNvZGVIZXgoXCI2MTYyNjNcIik7IC8vIFVpbnQ4QXJyYXkoMykgWyA5NywgOTgsIDk5IF1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlSGV4KHNyYzogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGNvbnN0IHU4ID0gdGV4dEVuY29kZXIuZW5jb2RlKHNyYyk7XG4gIGNvbnN0IGRzdCA9IG5ldyBVaW50OEFycmF5KHU4Lmxlbmd0aCAvIDIpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGRzdC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGEgPSBmcm9tSGV4Q2hhcih1OFtpICogMl0hKTtcbiAgICBjb25zdCBiID0gZnJvbUhleENoYXIodThbaSAqIDIgKyAxXSEpO1xuICAgIGRzdFtpXSA9IChhIDw8IDQpIHwgYjtcbiAgfVxuXG4gIGlmICh1OC5sZW5ndGggJSAyID09PSAxKSB7XG4gICAgLy8gQ2hlY2sgZm9yIGludmFsaWQgY2hhciBiZWZvcmUgcmVwb3J0aW5nIGJhZCBsZW5ndGgsXG4gICAgLy8gc2luY2UgdGhlIGludmFsaWQgY2hhciAoaWYgcHJlc2VudCkgaXMgYW4gZWFybGllciBwcm9ibGVtLlxuICAgIGZyb21IZXhDaGFyKHU4W2RzdC5sZW5ndGggKiAyXSEpO1xuICAgIHRocm93IGVyckxlbmd0aCgpO1xuICB9XG5cbiAgcmV0dXJuIGRzdDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFDdEQsbURBQW1EO0FBQ25ELDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQkMsR0FFRCxTQUFTLGtCQUFrQixRQUFRLGFBQWE7QUFFaEQsTUFBTSxXQUFXLElBQUksY0FBYyxNQUFNLENBQUM7QUFDMUMsTUFBTSxjQUFjLElBQUk7QUFDeEIsTUFBTSxjQUFjLElBQUk7QUFFeEIsU0FBUyxlQUFlLElBQVk7RUFDbEMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxjQUFjLEVBQUUsT0FBTyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEU7QUFFQSxTQUFTO0VBQ1AsT0FBTyxJQUFJLFdBQVc7QUFDeEI7QUFFQSw2Q0FBNkMsR0FDN0MsU0FBUyxZQUFZLElBQVk7RUFDL0IsNkJBQTZCO0VBQzdCLElBQUksTUFBTSxRQUFRLFFBQVEsSUFBSSxPQUFPLE9BQU87RUFDNUMsNkJBQTZCO0VBQzdCLElBQUksTUFBTSxRQUFRLFFBQVEsS0FBSyxPQUFPLE9BQU8sS0FBSztFQUNsRCw2QkFBNkI7RUFDN0IsSUFBSSxNQUFNLFFBQVEsUUFBUSxJQUFJLE9BQU8sT0FBTyxLQUFLO0VBRWpELE1BQU0sZUFBZTtBQUN2QjtBQUVBOzs7Ozs7Ozs7Q0FTQyxHQUNELE9BQU8sU0FBUyxVQUFVLEdBQXNDO0VBQzlELE1BQU0sS0FBSyxtQkFBbUI7RUFFOUIsTUFBTSxNQUFNLElBQUksV0FBVyxHQUFHLE1BQU0sR0FBRztFQUN2QyxJQUFLLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxNQUFNLEVBQUUsSUFBSztJQUNuQyxNQUFNLElBQUksRUFBRSxDQUFDLEVBQUU7SUFDZixHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRTtJQUM3QixHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxLQUFLO0VBQ3JDO0VBQ0EsT0FBTyxZQUFZLE1BQU0sQ0FBQztBQUM1QjtBQUVBOzs7Ozs7Ozs7O0NBVUMsR0FDRCxPQUFPLFNBQVMsVUFBVSxHQUFXO0VBQ25DLE1BQU0sS0FBSyxZQUFZLE1BQU0sQ0FBQztFQUM5QixNQUFNLE1BQU0sSUFBSSxXQUFXLEdBQUcsTUFBTSxHQUFHO0VBQ3ZDLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLE1BQU0sRUFBRSxJQUFLO0lBQ25DLE1BQU0sSUFBSSxZQUFZLEVBQUUsQ0FBQyxJQUFJLEVBQUU7SUFDL0IsTUFBTSxJQUFJLFlBQVksRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFO0lBQ25DLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQUFBQyxLQUFLLElBQUs7RUFDdEI7RUFFQSxJQUFJLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRztJQUN2QixzREFBc0Q7SUFDdEQsNkRBQTZEO0lBQzdELFlBQVksRUFBRSxDQUFDLElBQUksTUFBTSxHQUFHLEVBQUU7SUFDOUIsTUFBTTtFQUNSO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=5892557571412285672,7042479296052976308