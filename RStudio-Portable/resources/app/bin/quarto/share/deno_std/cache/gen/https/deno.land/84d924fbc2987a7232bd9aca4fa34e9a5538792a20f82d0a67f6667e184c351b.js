// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Utilities for
 * {@link https://datatracker.ietf.org/doc/html/rfc4648#section-4 | base64}
 * encoding and decoding.
 *
 * This module is browser compatible.
 *
 * ```ts
 * import {
 *   encodeBase64,
 *   decodeBase64,
 * } from "https://deno.land/std@$STD_VERSION/encoding/base64.ts";
 *
 * const encoded = encodeBase64("foobar"); // "Zm9vYmFy"
 *
 * decodeBase64(encoded); // Uint8Array(6) [ 102, 111, 111, 98, 97, 114 ]
 * ```
 *
 * @module
 */ import { validateBinaryLike } from "./_util.ts";
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
 * @see {@link https://datatracker.ietf.org/doc/html/rfc4648#section-4}
 *
 * @param data The data to encode.
 * @returns The base64-encoded string.
 *
 * @example
 * ```ts
 * import { encodeBase64 } from "https://deno.land/std@$STD_VERSION/encoding/base64.ts";
 *
 * encodeBase64("foobar"); // "Zm9vYmFy"
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
 * @see {@link https://datatracker.ietf.org/doc/html/rfc4648#section-4}
 *
 * @param b64 The base64-encoded string to decode.
 * @returns The decoded data.
 *
 * @example
 * ```ts
 * import { decodeBase64 } from "https://deno.land/std@$STD_VERSION/encoding/base64.ts";
 *
 * decodeBase64("Zm9vYmFy"); // Uint8Array(6) [ 102, 111, 111, 98, 97, 114 ]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIyNC4wL2VuY29kaW5nL2Jhc2U2NC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFV0aWxpdGllcyBmb3JcbiAqIHtAbGluayBodHRwczovL2RhdGF0cmFja2VyLmlldGYub3JnL2RvYy9odG1sL3JmYzQ2NDgjc2VjdGlvbi00IHwgYmFzZTY0fVxuICogZW5jb2RpbmcgYW5kIGRlY29kaW5nLlxuICpcbiAqIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHtcbiAqICAgZW5jb2RlQmFzZTY0LFxuICogICBkZWNvZGVCYXNlNjQsXG4gKiB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2VuY29kaW5nL2Jhc2U2NC50c1wiO1xuICpcbiAqIGNvbnN0IGVuY29kZWQgPSBlbmNvZGVCYXNlNjQoXCJmb29iYXJcIik7IC8vIFwiWm05dlltRnlcIlxuICpcbiAqIGRlY29kZUJhc2U2NChlbmNvZGVkKTsgLy8gVWludDhBcnJheSg2KSBbIDEwMiwgMTExLCAxMTEsIDk4LCA5NywgMTE0IF1cbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgeyB2YWxpZGF0ZUJpbmFyeUxpa2UgfSBmcm9tIFwiLi9fdXRpbC50c1wiO1xuXG5jb25zdCBiYXNlNjRhYmMgPSBbXG4gIFwiQVwiLFxuICBcIkJcIixcbiAgXCJDXCIsXG4gIFwiRFwiLFxuICBcIkVcIixcbiAgXCJGXCIsXG4gIFwiR1wiLFxuICBcIkhcIixcbiAgXCJJXCIsXG4gIFwiSlwiLFxuICBcIktcIixcbiAgXCJMXCIsXG4gIFwiTVwiLFxuICBcIk5cIixcbiAgXCJPXCIsXG4gIFwiUFwiLFxuICBcIlFcIixcbiAgXCJSXCIsXG4gIFwiU1wiLFxuICBcIlRcIixcbiAgXCJVXCIsXG4gIFwiVlwiLFxuICBcIldcIixcbiAgXCJYXCIsXG4gIFwiWVwiLFxuICBcIlpcIixcbiAgXCJhXCIsXG4gIFwiYlwiLFxuICBcImNcIixcbiAgXCJkXCIsXG4gIFwiZVwiLFxuICBcImZcIixcbiAgXCJnXCIsXG4gIFwiaFwiLFxuICBcImlcIixcbiAgXCJqXCIsXG4gIFwia1wiLFxuICBcImxcIixcbiAgXCJtXCIsXG4gIFwiblwiLFxuICBcIm9cIixcbiAgXCJwXCIsXG4gIFwicVwiLFxuICBcInJcIixcbiAgXCJzXCIsXG4gIFwidFwiLFxuICBcInVcIixcbiAgXCJ2XCIsXG4gIFwid1wiLFxuICBcInhcIixcbiAgXCJ5XCIsXG4gIFwielwiLFxuICBcIjBcIixcbiAgXCIxXCIsXG4gIFwiMlwiLFxuICBcIjNcIixcbiAgXCI0XCIsXG4gIFwiNVwiLFxuICBcIjZcIixcbiAgXCI3XCIsXG4gIFwiOFwiLFxuICBcIjlcIixcbiAgXCIrXCIsXG4gIFwiL1wiLFxuXTtcblxuLyoqXG4gKiBDb252ZXJ0cyBkYXRhIGludG8gYSBiYXNlNjQtZW5jb2RlZCBzdHJpbmcuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kYXRhdHJhY2tlci5pZXRmLm9yZy9kb2MvaHRtbC9yZmM0NjQ4I3NlY3Rpb24tNH1cbiAqXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBlbmNvZGUuXG4gKiBAcmV0dXJucyBUaGUgYmFzZTY0LWVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5jb2RlQmFzZTY0IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZW5jb2RpbmcvYmFzZTY0LnRzXCI7XG4gKlxuICogZW5jb2RlQmFzZTY0KFwiZm9vYmFyXCIpOyAvLyBcIlptOXZZbUZ5XCJcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQmFzZTY0KGRhdGE6IEFycmF5QnVmZmVyIHwgVWludDhBcnJheSB8IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIENSRURJVDogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZW5lcG9tbnlhc2NoaWgvNzJjNDIzZjcyN2QzOTVlZWFhMDk2OTcwNTgyMzg3MjdcbiAgY29uc3QgdWludDggPSB2YWxpZGF0ZUJpbmFyeUxpa2UoZGF0YSk7XG4gIGxldCByZXN1bHQgPSBcIlwiO1xuICBsZXQgaTtcbiAgY29uc3QgbCA9IHVpbnQ4Lmxlbmd0aDtcbiAgZm9yIChpID0gMjsgaSA8IGw7IGkgKz0gMykge1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbKHVpbnQ4W2kgLSAyXSEpID4+IDJdO1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbXG4gICAgICAoKCh1aW50OFtpIC0gMl0hKSAmIDB4MDMpIDw8IDQpIHxcbiAgICAgICgodWludDhbaSAtIDFdISkgPj4gNClcbiAgICBdO1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbXG4gICAgICAoKCh1aW50OFtpIC0gMV0hKSAmIDB4MGYpIDw8IDIpIHxcbiAgICAgICgodWludDhbaV0hKSA+PiA2KVxuICAgIF07XG4gICAgcmVzdWx0ICs9IGJhc2U2NGFiY1sodWludDhbaV0hKSAmIDB4M2ZdO1xuICB9XG4gIGlmIChpID09PSBsICsgMSkge1xuICAgIC8vIDEgb2N0ZXQgeWV0IHRvIHdyaXRlXG4gICAgcmVzdWx0ICs9IGJhc2U2NGFiY1sodWludDhbaSAtIDJdISkgPj4gMl07XG4gICAgcmVzdWx0ICs9IGJhc2U2NGFiY1soKHVpbnQ4W2kgLSAyXSEpICYgMHgwMykgPDwgNF07XG4gICAgcmVzdWx0ICs9IFwiPT1cIjtcbiAgfVxuICBpZiAoaSA9PT0gbCkge1xuICAgIC8vIDIgb2N0ZXRzIHlldCB0byB3cml0ZVxuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbKHVpbnQ4W2kgLSAyXSEpID4+IDJdO1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbXG4gICAgICAoKCh1aW50OFtpIC0gMl0hKSAmIDB4MDMpIDw8IDQpIHxcbiAgICAgICgodWludDhbaSAtIDFdISkgPj4gNClcbiAgICBdO1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbKCh1aW50OFtpIC0gMV0hKSAmIDB4MGYpIDw8IDJdO1xuICAgIHJlc3VsdCArPSBcIj1cIjtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERlY29kZXMgYSBiYXNlNjQtZW5jb2RlZCBzdHJpbmcuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kYXRhdHJhY2tlci5pZXRmLm9yZy9kb2MvaHRtbC9yZmM0NjQ4I3NlY3Rpb24tNH1cbiAqXG4gKiBAcGFyYW0gYjY0IFRoZSBiYXNlNjQtZW5jb2RlZCBzdHJpbmcgdG8gZGVjb2RlLlxuICogQHJldHVybnMgVGhlIGRlY29kZWQgZGF0YS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGRlY29kZUJhc2U2NCB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2VuY29kaW5nL2Jhc2U2NC50c1wiO1xuICpcbiAqIGRlY29kZUJhc2U2NChcIlptOXZZbUZ5XCIpOyAvLyBVaW50OEFycmF5KDYpIFsgMTAyLCAxMTEsIDExMSwgOTgsIDk3LCAxMTQgXVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVCYXNlNjQoYjY0OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgYmluU3RyaW5nID0gYXRvYihiNjQpO1xuICBjb25zdCBzaXplID0gYmluU3RyaW5nLmxlbmd0aDtcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShzaXplKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICBieXRlc1tpXSA9IGJpblN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICB9XG4gIHJldHVybiBieXRlcztcbn1cbiJdLCJuYW1l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
// denoCacheMetadata=369546244633728317,2727450996183324196