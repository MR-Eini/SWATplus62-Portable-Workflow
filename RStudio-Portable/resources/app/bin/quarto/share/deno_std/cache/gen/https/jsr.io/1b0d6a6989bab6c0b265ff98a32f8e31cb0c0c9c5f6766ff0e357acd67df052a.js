// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Utilities for
 * {@link https://www.rfc-editor.org/rfc/rfc4648.html#section-4 | base64}
 * encoding and decoding.
 *
 * This module is browser compatible.
 *
 * ```ts
 * import {
 *   encodeBase64,
 *   decodeBase64,
 * } from "@std/encoding/base64";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const foobar = new TextEncoder().encode("foobar");
 *
 * assertEquals(encodeBase64(foobar), "Zm9vYmFy");
 * assertEquals(decodeBase64("Zm9vYmFy"), foobar);
 * ```
 *
 * @module
 */ import { validateBinaryLike } from "./_validate_binary_like.ts";
const base64abc = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "+",
  "/"
];
/**
 * Converts data into a base64-encoded string.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc4648.html#section-4}
 *
 * @param data The data to encode.
 * @returns The base64-encoded string.
 *
 * @example Usage
 * ```ts
 * import { encodeBase64 } from "@std/encoding/base64";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(encodeBase64("foobar"), "Zm9vYmFy");
 * ```
 */ export function encodeBase64(data) {
  // CREDIT: https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727
  const uint8 = validateBinaryLike(data);
  let result = "";
  let i;
  const l = uint8.length;
  for(i = 2; i < l; i += 3){
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
    result += base64abc[(uint8[i - 1] & 0x0f) << 2 | uint8[i] >> 6];
    result += base64abc[uint8[i] & 0x3f];
  }
  if (i === l + 1) {
    // 1 octet yet to write
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 0x03) << 4];
    result += "==";
  }
  if (i === l) {
    // 2 octets yet to write
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
    result += base64abc[(uint8[i - 1] & 0x0f) << 2];
    result += "=";
  }
  return result;
}
/**
 * Decodes a base64-encoded string.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc4648.html#section-4}
 *
 * @param b64 The base64-encoded string to decode.
 * @returns The decoded data.
 *
 * @example Usage
 * ```ts
 * import { decodeBase64 } from "@std/encoding/base64";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(
 *   decodeBase64("Zm9vYmFy"),
 *   new TextEncoder().encode("foobar")
 * );
 * ```
 */ export function decodeBase64(b64) {
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for(let i = 0; i < size; i++){
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZW5jb2RpbmcvMC4yMjQuMy9iYXNlNjQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzQ2NDguaHRtbCNzZWN0aW9uLTQgfCBiYXNlNjR9XG4gKiBlbmNvZGluZyBhbmQgZGVjb2RpbmcuXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQge1xuICogICBlbmNvZGVCYXNlNjQsXG4gKiAgIGRlY29kZUJhc2U2NCxcbiAqIH0gZnJvbSBcIkBzdGQvZW5jb2RpbmcvYmFzZTY0XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IGZvb2JhciA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImZvb2JhclwiKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZW5jb2RlQmFzZTY0KGZvb2JhciksIFwiWm05dlltRnlcIik7XG4gKiBhc3NlcnRFcXVhbHMoZGVjb2RlQmFzZTY0KFwiWm05dlltRnlcIiksIGZvb2Jhcik7XG4gKiBgYGBcbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0IHsgdmFsaWRhdGVCaW5hcnlMaWtlIH0gZnJvbSBcIi4vX3ZhbGlkYXRlX2JpbmFyeV9saWtlLnRzXCI7XG5cbmNvbnN0IGJhc2U2NGFiYyA9IFtcbiAgXCJBXCIsXG4gIFwiQlwiLFxuICBcIkNcIixcbiAgXCJEXCIsXG4gIFwiRVwiLFxuICBcIkZcIixcbiAgXCJHXCIsXG4gIFwiSFwiLFxuICBcIklcIixcbiAgXCJKXCIsXG4gIFwiS1wiLFxuICBcIkxcIixcbiAgXCJNXCIsXG4gIFwiTlwiLFxuICBcIk9cIixcbiAgXCJQXCIsXG4gIFwiUVwiLFxuICBcIlJcIixcbiAgXCJTXCIsXG4gIFwiVFwiLFxuICBcIlVcIixcbiAgXCJWXCIsXG4gIFwiV1wiLFxuICBcIlhcIixcbiAgXCJZXCIsXG4gIFwiWlwiLFxuICBcImFcIixcbiAgXCJiXCIsXG4gIFwiY1wiLFxuICBcImRcIixcbiAgXCJlXCIsXG4gIFwiZlwiLFxuICBcImdcIixcbiAgXCJoXCIsXG4gIFwiaVwiLFxuICBcImpcIixcbiAgXCJrXCIsXG4gIFwibFwiLFxuICBcIm1cIixcbiAgXCJuXCIsXG4gIFwib1wiLFxuICBcInBcIixcbiAgXCJxXCIsXG4gIFwiclwiLFxuICBcInNcIixcbiAgXCJ0XCIsXG4gIFwidVwiLFxuICBcInZcIixcbiAgXCJ3XCIsXG4gIFwieFwiLFxuICBcInlcIixcbiAgXCJ6XCIsXG4gIFwiMFwiLFxuICBcIjFcIixcbiAgXCIyXCIsXG4gIFwiM1wiLFxuICBcIjRcIixcbiAgXCI1XCIsXG4gIFwiNlwiLFxuICBcIjdcIixcbiAgXCI4XCIsXG4gIFwiOVwiLFxuICBcIitcIixcbiAgXCIvXCIsXG5dO1xuXG4vKipcbiAqIENvbnZlcnRzIGRhdGEgaW50byBhIGJhc2U2NC1lbmNvZGVkIHN0cmluZy5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjNDY0OC5odG1sI3NlY3Rpb24tNH1cbiAqXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBlbmNvZGUuXG4gKiBAcmV0dXJucyBUaGUgYmFzZTY0LWVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5jb2RlQmFzZTY0IH0gZnJvbSBcIkBzdGQvZW5jb2RpbmcvYmFzZTY0XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGFzc2VydEVxdWFscyhlbmNvZGVCYXNlNjQoXCJmb29iYXJcIiksIFwiWm05dlltRnlcIik7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUJhc2U2NChkYXRhOiBBcnJheUJ1ZmZlciB8IFVpbnQ4QXJyYXkgfCBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBDUkVESVQ6IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2VuZXBvbW55YXNjaGloLzcyYzQyM2Y3MjdkMzk1ZWVhYTA5Njk3MDU4MjM4NzI3XG4gIGNvbnN0IHVpbnQ4ID0gdmFsaWRhdGVCaW5hcnlMaWtlKGRhdGEpO1xuICBsZXQgcmVzdWx0ID0gXCJcIjtcbiAgbGV0IGk7XG4gIGNvbnN0IGwgPSB1aW50OC5sZW5ndGg7XG4gIGZvciAoaSA9IDI7IGkgPCBsOyBpICs9IDMpIHtcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjWyh1aW50OFtpIC0gMl0hKSA+PiAyXTtcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjW1xuICAgICAgKCgodWludDhbaSAtIDJdISkgJiAweDAzKSA8PCA0KSB8XG4gICAgICAoKHVpbnQ4W2kgLSAxXSEpID4+IDQpXG4gICAgXTtcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjW1xuICAgICAgKCgodWludDhbaSAtIDFdISkgJiAweDBmKSA8PCAyKSB8XG4gICAgICAoKHVpbnQ4W2ldISkgPj4gNilcbiAgICBdO1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbKHVpbnQ4W2ldISkgJiAweDNmXTtcbiAgfVxuICBpZiAoaSA9PT0gbCArIDEpIHtcbiAgICAvLyAxIG9jdGV0IHlldCB0byB3cml0ZVxuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbKHVpbnQ4W2kgLSAyXSEpID4+IDJdO1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbKCh1aW50OFtpIC0gMl0hKSAmIDB4MDMpIDw8IDRdO1xuICAgIHJlc3VsdCArPSBcIj09XCI7XG4gIH1cbiAgaWYgKGkgPT09IGwpIHtcbiAgICAvLyAyIG9jdGV0cyB5ZXQgdG8gd3JpdGVcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjWyh1aW50OFtpIC0gMl0hKSA+PiAyXTtcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjW1xuICAgICAgKCgodWludDhbaSAtIDJdISkgJiAweDAzKSA8PCA0KSB8XG4gICAgICAoKHVpbnQ4W2kgLSAxXSEpID4+IDQpXG4gICAgXTtcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjWygodWludDhbaSAtIDFdISkgJiAweDBmKSA8PCAyXTtcbiAgICByZXN1bHQgKz0gXCI9XCI7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZWNvZGVzIGEgYmFzZTY0LWVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM0NjQ4Lmh0bWwjc2VjdGlvbi00fVxuICpcbiAqIEBwYXJhbSBiNjQgVGhlIGJhc2U2NC1lbmNvZGVkIHN0cmluZyB0byBkZWNvZGUuXG4gKiBAcmV0dXJucyBUaGUgZGVjb2RlZCBkYXRhLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZGVjb2RlQmFzZTY0IH0gZnJvbSBcIkBzdGQvZW5jb2RpbmcvYmFzZTY0XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgZGVjb2RlQmFzZTY0KFwiWm05dlltRnlcIiksXG4gKiAgIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImZvb2JhclwiKVxuICogKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlQmFzZTY0KGI2NDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGNvbnN0IGJpblN0cmluZyA9IGF0b2IoYjY0KTtcbiAgY29uc3Qgc2l6ZSA9IGJpblN0cmluZy5sZW5ndGg7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgYnl0ZXNbaV0gPSBiaW5TdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgfVxuICByZXR1cm4gYnl0ZXM7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBcUJDLEdBRUQsU0FBUyxrQkFBa0IsUUFBUSw2QkFBNkI7QUFFaEUsTUFBTSxZQUFZO0VBQ2hCO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0NBQ0Q7QUFFRDs7Ozs7Ozs7Ozs7Ozs7O0NBZUMsR0FDRCxPQUFPLFNBQVMsYUFBYSxJQUF1QztFQUNsRSxrRkFBa0Y7RUFDbEYsTUFBTSxRQUFRLG1CQUFtQjtFQUNqQyxJQUFJLFNBQVM7RUFDYixJQUFJO0VBQ0osTUFBTSxJQUFJLE1BQU0sTUFBTTtFQUN0QixJQUFLLElBQUksR0FBRyxJQUFJLEdBQUcsS0FBSyxFQUFHO0lBQ3pCLFVBQVUsU0FBUyxDQUFDLEFBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFNLEVBQUU7SUFDekMsVUFBVSxTQUFTLENBQ2pCLEFBQUMsQ0FBQyxBQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBSyxJQUFJLEtBQUssSUFDNUIsQUFBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQU0sRUFDckI7SUFDRCxVQUFVLFNBQVMsQ0FDakIsQUFBQyxDQUFDLEFBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFLLElBQUksS0FBSyxJQUM1QixBQUFDLEtBQUssQ0FBQyxFQUFFLElBQU0sRUFDakI7SUFDRCxVQUFVLFNBQVMsQ0FBQyxBQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUssS0FBSztFQUN6QztFQUNBLElBQUksTUFBTSxJQUFJLEdBQUc7SUFDZix1QkFBdUI7SUFDdkIsVUFBVSxTQUFTLENBQUMsQUFBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQU0sRUFBRTtJQUN6QyxVQUFVLFNBQVMsQ0FBQyxDQUFDLEFBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFLLElBQUksS0FBSyxFQUFFO0lBQ2xELFVBQVU7RUFDWjtFQUNBLElBQUksTUFBTSxHQUFHO0lBQ1gsd0JBQXdCO0lBQ3hCLFVBQVUsU0FBUyxDQUFDLEFBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFNLEVBQUU7SUFDekMsVUFBVSxTQUFTLENBQ2pCLEFBQUMsQ0FBQyxBQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBSyxJQUFJLEtBQUssSUFDNUIsQUFBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQU0sRUFDckI7SUFDRCxVQUFVLFNBQVMsQ0FBQyxDQUFDLEFBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFLLElBQUksS0FBSyxFQUFFO0lBQ2xELFVBQVU7RUFDWjtFQUNBLE9BQU87QUFDVDtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FrQkMsR0FDRCxPQUFPLFNBQVMsYUFBYSxHQUFXO0VBQ3RDLE1BQU0sWUFBWSxLQUFLO0VBQ3ZCLE1BQU0sT0FBTyxVQUFVLE1BQU07RUFDN0IsTUFBTSxRQUFRLElBQUksV0FBVztFQUM3QixJQUFLLElBQUksSUFBSSxHQUFHLElBQUksTUFBTSxJQUFLO0lBQzdCLEtBQUssQ0FBQyxFQUFFLEdBQUcsVUFBVSxVQUFVLENBQUM7RUFDbEM7RUFDQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=3184998414806561682,8382848191776118513