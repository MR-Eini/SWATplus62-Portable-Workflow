// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Utilities for
 * {@link https://www.rfc-editor.org/rfc/rfc4648.html#section-4 | base64}
 * encoding and decoding.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZW5jb2RpbmcvMS4wLjAtcmMuMi9iYXNlNjQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzQ2NDguaHRtbCNzZWN0aW9uLTQgfCBiYXNlNjR9XG4gKiBlbmNvZGluZyBhbmQgZGVjb2RpbmcuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7XG4gKiAgIGVuY29kZUJhc2U2NCxcbiAqICAgZGVjb2RlQmFzZTY0LFxuICogfSBmcm9tIFwiQHN0ZC9lbmNvZGluZy9iYXNlNjRcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgZm9vYmFyID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFwiZm9vYmFyXCIpO1xuICpcbiAqIGFzc2VydEVxdWFscyhlbmNvZGVCYXNlNjQoZm9vYmFyKSwgXCJabTl2WW1GeVwiKTtcbiAqIGFzc2VydEVxdWFscyhkZWNvZGVCYXNlNjQoXCJabTl2WW1GeVwiKSwgZm9vYmFyKTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgeyB2YWxpZGF0ZUJpbmFyeUxpa2UgfSBmcm9tIFwiLi9fdmFsaWRhdGVfYmluYXJ5X2xpa2UudHNcIjtcblxuY29uc3QgYmFzZTY0YWJjID0gW1xuICBcIkFcIixcbiAgXCJCXCIsXG4gIFwiQ1wiLFxuICBcIkRcIixcbiAgXCJFXCIsXG4gIFwiRlwiLFxuICBcIkdcIixcbiAgXCJIXCIsXG4gIFwiSVwiLFxuICBcIkpcIixcbiAgXCJLXCIsXG4gIFwiTFwiLFxuICBcIk1cIixcbiAgXCJOXCIsXG4gIFwiT1wiLFxuICBcIlBcIixcbiAgXCJRXCIsXG4gIFwiUlwiLFxuICBcIlNcIixcbiAgXCJUXCIsXG4gIFwiVVwiLFxuICBcIlZcIixcbiAgXCJXXCIsXG4gIFwiWFwiLFxuICBcIllcIixcbiAgXCJaXCIsXG4gIFwiYVwiLFxuICBcImJcIixcbiAgXCJjXCIsXG4gIFwiZFwiLFxuICBcImVcIixcbiAgXCJmXCIsXG4gIFwiZ1wiLFxuICBcImhcIixcbiAgXCJpXCIsXG4gIFwialwiLFxuICBcImtcIixcbiAgXCJsXCIsXG4gIFwibVwiLFxuICBcIm5cIixcbiAgXCJvXCIsXG4gIFwicFwiLFxuICBcInFcIixcbiAgXCJyXCIsXG4gIFwic1wiLFxuICBcInRcIixcbiAgXCJ1XCIsXG4gIFwidlwiLFxuICBcIndcIixcbiAgXCJ4XCIsXG4gIFwieVwiLFxuICBcInpcIixcbiAgXCIwXCIsXG4gIFwiMVwiLFxuICBcIjJcIixcbiAgXCIzXCIsXG4gIFwiNFwiLFxuICBcIjVcIixcbiAgXCI2XCIsXG4gIFwiN1wiLFxuICBcIjhcIixcbiAgXCI5XCIsXG4gIFwiK1wiLFxuICBcIi9cIixcbl07XG5cbi8qKlxuICogQ29udmVydHMgZGF0YSBpbnRvIGEgYmFzZTY0LWVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM0NjQ4Lmh0bWwjc2VjdGlvbi00fVxuICpcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGVuY29kZS5cbiAqIEByZXR1cm5zIFRoZSBiYXNlNjQtZW5jb2RlZCBzdHJpbmcuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlbmNvZGVCYXNlNjQgfSBmcm9tIFwiQHN0ZC9lbmNvZGluZy9iYXNlNjRcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGVuY29kZUJhc2U2NChcImZvb2JhclwiKSwgXCJabTl2WW1GeVwiKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQmFzZTY0KGRhdGE6IEFycmF5QnVmZmVyIHwgVWludDhBcnJheSB8IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIENSRURJVDogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZW5lcG9tbnlhc2NoaWgvNzJjNDIzZjcyN2QzOTVlZWFhMDk2OTcwNTgyMzg3MjdcbiAgY29uc3QgdWludDggPSB2YWxpZGF0ZUJpbmFyeUxpa2UoZGF0YSk7XG4gIGxldCByZXN1bHQgPSBcIlwiO1xuICBsZXQgaTtcbiAgY29uc3QgbCA9IHVpbnQ4Lmxlbmd0aDtcbiAgZm9yIChpID0gMjsgaSA8IGw7IGkgKz0gMykge1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbKHVpbnQ4W2kgLSAyXSEpID4+IDJdO1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbXG4gICAgICAoKCh1aW50OFtpIC0gMl0hKSAmIDB4MDMpIDw8IDQpIHxcbiAgICAgICgodWludDhbaSAtIDFdISkgPj4gNClcbiAgICBdO1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbXG4gICAgICAoKCh1aW50OFtpIC0gMV0hKSAmIDB4MGYpIDw8IDIpIHxcbiAgICAgICgodWludDhbaV0hKSA+PiA2KVxuICAgIF07XG4gICAgcmVzdWx0ICs9IGJhc2U2NGFiY1sodWludDhbaV0hKSAmIDB4M2ZdO1xuICB9XG4gIGlmIChpID09PSBsICsgMSkge1xuICAgIC8vIDEgb2N0ZXQgeWV0IHRvIHdyaXRlXG4gICAgcmVzdWx0ICs9IGJhc2U2NGFiY1sodWludDhbaSAtIDJdISkgPj4gMl07XG4gICAgcmVzdWx0ICs9IGJhc2U2NGFiY1soKHVpbnQ4W2kgLSAyXSEpICYgMHgwMykgPDwgNF07XG4gICAgcmVzdWx0ICs9IFwiPT1cIjtcbiAgfVxuICBpZiAoaSA9PT0gbCkge1xuICAgIC8vIDIgb2N0ZXRzIHlldCB0byB3cml0ZVxuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbKHVpbnQ4W2kgLSAyXSEpID4+IDJdO1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbXG4gICAgICAoKCh1aW50OFtpIC0gMl0hKSAmIDB4MDMpIDw8IDQpIHxcbiAgICAgICgodWludDhbaSAtIDFdISkgPj4gNClcbiAgICBdO1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbKCh1aW50OFtpIC0gMV0hKSAmIDB4MGYpIDw8IDJdO1xuICAgIHJlc3VsdCArPSBcIj1cIjtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERlY29kZXMgYSBiYXNlNjQtZW5jb2RlZCBzdHJpbmcuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzQ2NDguaHRtbCNzZWN0aW9uLTR9XG4gKlxuICogQHBhcmFtIGI2NCBUaGUgYmFzZTY0LWVuY29kZWQgc3RyaW5nIHRvIGRlY29kZS5cbiAqIEByZXR1cm5zIFRoZSBkZWNvZGVkIGRhdGEuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkZWNvZGVCYXNlNjQgfSBmcm9tIFwiQHN0ZC9lbmNvZGluZy9iYXNlNjRcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKFxuICogICBkZWNvZGVCYXNlNjQoXCJabTl2WW1GeVwiKSxcbiAqICAgbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFwiZm9vYmFyXCIpXG4gKiApO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVCYXNlNjQoYjY0OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgYmluU3RyaW5nID0gYXRvYihiNjQpO1xuICBjb25zdCBzaXplID0gYmluU3RyaW5nLmxlbmd0aDtcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShzaXplKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICBieXRlc1tpXSA9IGJpblN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICB9XG4gIHJldHVybiBieXRlcztcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBRUQsU0FBUyxrQkFBa0IsUUFBUSw2QkFBNkI7QUFFaEUsTUFBTSxZQUFZO0VBQ2hCO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0NBQ0Q7QUFFRDs7Ozs7Ozs7Ozs7Ozs7O0NBZUMsR0FDRCxPQUFPLFNBQVMsYUFBYSxJQUF1QztFQUNsRSxrRkFBa0Y7RUFDbEYsTUFBTSxRQUFRLG1CQUFtQjtFQUNqQyxJQUFJLFNBQVM7RUFDYixJQUFJO0VBQ0osTUFBTSxJQUFJLE1BQU0sTUFBTTtFQUN0QixJQUFLLElBQUksR0FBRyxJQUFJLEdBQUcsS0FBSyxFQUFHO0lBQ3pCLFVBQVUsU0FBUyxDQUFDLEFBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFNLEVBQUU7SUFDekMsVUFBVSxTQUFTLENBQ2pCLEFBQUMsQ0FBQyxBQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBSyxJQUFJLEtBQUssSUFDNUIsQUFBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQU0sRUFDckI7SUFDRCxVQUFVLFNBQVMsQ0FDakIsQUFBQyxDQUFDLEFBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFLLElBQUksS0FBSyxJQUM1QixBQUFDLEtBQUssQ0FBQyxFQUFFLElBQU0sRUFDakI7SUFDRCxVQUFVLFNBQVMsQ0FBQyxBQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUssS0FBSztFQUN6QztFQUNBLElBQUksTUFBTSxJQUFJLEdBQUc7SUFDZix1QkFBdUI7SUFDdkIsVUFBVSxTQUFTLENBQUMsQUFBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQU0sRUFBRTtJQUN6QyxVQUFVLFNBQVMsQ0FBQyxDQUFDLEFBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFLLElBQUksS0FBSyxFQUFFO0lBQ2xELFVBQVU7RUFDWjtFQUNBLElBQUksTUFBTSxHQUFHO0lBQ1gsd0JBQXdCO0lBQ3hCLFVBQVUsU0FBUyxDQUFDLEFBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFNLEVBQUU7SUFDekMsVUFBVSxTQUFTLENBQ2pCLEFBQUMsQ0FBQyxBQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBSyxJQUFJLEtBQUssSUFDNUIsQUFBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQU0sRUFDckI7SUFDRCxVQUFVLFNBQVMsQ0FBQyxDQUFDLEFBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFLLElBQUksS0FBSyxFQUFFO0lBQ2xELFVBQVU7RUFDWjtFQUNBLE9BQU87QUFDVDtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FrQkMsR0FDRCxPQUFPLFNBQVMsYUFBYSxHQUFXO0VBQ3RDLE1BQU0sWUFBWSxLQUFLO0VBQ3ZCLE1BQU0sT0FBTyxVQUFVLE1BQU07RUFDN0IsTUFBTSxRQUFRLElBQUksV0FBVztFQUM3QixJQUFLLElBQUksSUFBSSxHQUFHLElBQUksTUFBTSxJQUFLO0lBQzdCLEtBQUssQ0FBQyxFQUFFLEdBQUcsVUFBVSxVQUFVLENBQUM7RUFDbEM7RUFDQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=3614293870610908060,9164785640503976758