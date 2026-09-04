// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Utilities for working with {@link https://en.wikipedia.org/wiki/Ascii85 | ascii85} encoding.
 *
 * This module is browser compatible.
 *
 * ## Specifying a standard and delimiter
 *
 * By default, all functions are using the most popular Adobe version of ascii85
 * and not adding any delimiter. However, there are three more standards
 * supported - btoa (different delimiter and additional compression of 4 bytes
 * equal to 32), {@link https://rfc.zeromq.org/spec/32/ | Z85} and
 * {@link https://tools.ietf.org/html/rfc1924 | RFC 1924}. It's possible to use a
 * different encoding by specifying it in `options` object as a second parameter.
 *
 * Similarly, it's possible to make `encode` add a delimiter (`<~` and `~>` for
 * Adobe, `xbtoa Begin` and `xbtoa End` with newlines between the delimiters and
 * encoded data for btoa. Checksums for btoa are not supported. Delimiters are not
 * supported by other encodings.)
 *
 * @module
 */ import { validateBinaryLike } from "./_util.ts";
const rfc1924 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~";
const Z85 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#";
/**
 * Converts data into an ascii58-encoded string.
 *
 * @example
 * ```ts
 * import { encodeAscii85 } from "https://deno.land/std@$STD_VERSION/encoding/ascii85.ts";
 *
 * encodeAscii85("Hello world!"); // "87cURD]j7BEbo80"
 * ```
 */ export function encodeAscii85(data, options) {
  let uint8 = validateBinaryLike(data);
  const standard = options?.standard ?? "Adobe";
  let output = [];
  let v;
  let n = 0;
  let difference = 0;
  if (uint8.length % 4 !== 0) {
    const tmp = uint8;
    difference = 4 - tmp.length % 4;
    uint8 = new Uint8Array(tmp.length + difference);
    uint8.set(tmp);
  }
  const view = new DataView(uint8.buffer, uint8.byteOffset, uint8.byteLength);
  for(let i = 0; i < uint8.length; i += 4){
    v = view.getUint32(i);
    // Adobe and btoa standards compress 4 zeroes to single "z" character
    if ((standard === "Adobe" || standard === "btoa") && v === 0 && i < uint8.length - difference - 3) {
      output[n++] = "z";
      continue;
    }
    // btoa compresses 4 spaces - that is, bytes equal to 32 - into single "y" character
    if (standard === "btoa" && v === 538976288) {
      output[n++] = "y";
      continue;
    }
    for(let j = 4; j >= 0; j--){
      output[n + j] = String.fromCharCode(v % 85 + 33);
      v = Math.trunc(v / 85);
    }
    n += 5;
  }
  switch(standard){
    case "Adobe":
      if (options?.delimiter) {
        return `<~${output.slice(0, output.length - difference).join("")}~>`;
      }
      break;
    case "btoa":
      if (options?.delimiter) {
        return `xbtoa Begin\n${output.slice(0, output.length - difference).join("")}\nxbtoa End`;
      }
      break;
    case "RFC 1924":
      output = output.map((val)=>rfc1924[val.charCodeAt(0) - 33]);
      break;
    case "Z85":
      output = output.map((val)=>Z85[val.charCodeAt(0) - 33]);
      break;
  }
  return output.slice(0, output.length - difference).join("");
}
/**
 * Decodes a ascii85-encoded string.
 *
 * @param ascii85 The ascii85-encoded string to decode.
 * @param options Options for decoding.
 * @returns The decoded data.
 *
 * @example
 * ```ts
 * import { decodeAscii85 } from "https://deno.land/std@$STD_VERSION/encoding/ascii85.ts";
 *
 * decodeAscii85("87cURD]j7BEbo80");
 * // Uint8Array(12) [ 72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33 ]
 * ```
 */ export function decodeAscii85(ascii85, options) {
  const encoding = options?.standard ?? "Adobe";
  // translate all encodings to most basic adobe/btoa one and decompress some special characters ("z" and "y")
  switch(encoding){
    case "Adobe":
      ascii85 = ascii85.replaceAll(/(<~|~>)/g, "").replaceAll("z", "!!!!!");
      break;
    case "btoa":
      ascii85 = ascii85.replaceAll(/(xbtoa Begin|xbtoa End|\n)/g, "").replaceAll("z", "!!!!!").replaceAll("y", "+<VdL");
      break;
    case "RFC 1924":
      ascii85 = ascii85.replaceAll(/./g, (match)=>String.fromCharCode(rfc1924.indexOf(match) + 33));
      break;
    case "Z85":
      ascii85 = ascii85.replaceAll(/./g, (match)=>String.fromCharCode(Z85.indexOf(match) + 33));
      break;
  }
  // remove all invalid characters
  ascii85 = ascii85.replaceAll(/[^!-u]/g, "");
  const len = ascii85.length;
  const output = new Uint8Array(len + 4 - len % 4);
  const view = new DataView(output.buffer);
  let v = 0;
  let n = 0;
  let max = 0;
  for(let i = 0; i < len;){
    for(max += 5; i < max; i++){
      v = v * 85 + (i < len ? ascii85.charCodeAt(i) : 117) - 33;
    }
    view.setUint32(n, v);
    v = 0;
    n += 4;
  }
  return output.slice(0, Math.trunc(len * 0.8));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIyNC4wL2VuY29kaW5nL2FzY2lpODUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yIHdvcmtpbmcgd2l0aCB7QGxpbmsgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQXNjaWk4NSB8IGFzY2lpODV9IGVuY29kaW5nLlxuICpcbiAqIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbiAqXG4gKiAjIyBTcGVjaWZ5aW5nIGEgc3RhbmRhcmQgYW5kIGRlbGltaXRlclxuICpcbiAqIEJ5IGRlZmF1bHQsIGFsbCBmdW5jdGlvbnMgYXJlIHVzaW5nIHRoZSBtb3N0IHBvcHVsYXIgQWRvYmUgdmVyc2lvbiBvZiBhc2NpaTg1XG4gKiBhbmQgbm90IGFkZGluZyBhbnkgZGVsaW1pdGVyLiBIb3dldmVyLCB0aGVyZSBhcmUgdGhyZWUgbW9yZSBzdGFuZGFyZHNcbiAqIHN1cHBvcnRlZCAtIGJ0b2EgKGRpZmZlcmVudCBkZWxpbWl0ZXIgYW5kIGFkZGl0aW9uYWwgY29tcHJlc3Npb24gb2YgNCBieXRlc1xuICogZXF1YWwgdG8gMzIpLCB7QGxpbmsgaHR0cHM6Ly9yZmMuemVyb21xLm9yZy9zcGVjLzMyLyB8IFo4NX0gYW5kXG4gKiB7QGxpbmsgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzE5MjQgfCBSRkMgMTkyNH0uIEl0J3MgcG9zc2libGUgdG8gdXNlIGFcbiAqIGRpZmZlcmVudCBlbmNvZGluZyBieSBzcGVjaWZ5aW5nIGl0IGluIGBvcHRpb25zYCBvYmplY3QgYXMgYSBzZWNvbmQgcGFyYW1ldGVyLlxuICpcbiAqIFNpbWlsYXJseSwgaXQncyBwb3NzaWJsZSB0byBtYWtlIGBlbmNvZGVgIGFkZCBhIGRlbGltaXRlciAoYDx+YCBhbmQgYH4+YCBmb3JcbiAqIEFkb2JlLCBgeGJ0b2EgQmVnaW5gIGFuZCBgeGJ0b2EgRW5kYCB3aXRoIG5ld2xpbmVzIGJldHdlZW4gdGhlIGRlbGltaXRlcnMgYW5kXG4gKiBlbmNvZGVkIGRhdGEgZm9yIGJ0b2EuIENoZWNrc3VtcyBmb3IgYnRvYSBhcmUgbm90IHN1cHBvcnRlZC4gRGVsaW1pdGVycyBhcmUgbm90XG4gKiBzdXBwb3J0ZWQgYnkgb3RoZXIgZW5jb2RpbmdzLilcbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0IHsgdmFsaWRhdGVCaW5hcnlMaWtlIH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcblxuLyoqIFN1cHBvcnRlZCBhc2NpaTg1IHN0YW5kYXJkcyBmb3Ige0BsaW5rY29kZSBBc2NpaTg1T3B0aW9uc30uICovXG5leHBvcnQgdHlwZSBBc2NpaTg1U3RhbmRhcmQgPSBcIkFkb2JlXCIgfCBcImJ0b2FcIiB8IFwiUkZDIDE5MjRcIiB8IFwiWjg1XCI7XG5cbi8qKiBPcHRpb25zIGZvciB7QGxpbmtjb2RlIGVuY29kZUFzY2lpODV9IGFuZCB7QGxpbmtjb2RlIGRlY29kZUFzY2lpODV9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBBc2NpaTg1T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBDaGFyYWN0ZXIgc2V0IGFuZCBkZWxpbWl0ZXIgKGlmIHN1cHBvcnRlZCBhbmQgdXNlZCkuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtcIkFkb2JlXCJ9XG4gICAqL1xuICBzdGFuZGFyZD86IEFzY2lpODVTdGFuZGFyZDtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gdXNlIGEgZGVsaW1pdGVyIChpZiBzdXBwb3J0ZWQpLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBkZWxpbWl0ZXI/OiBib29sZWFuO1xufVxuY29uc3QgcmZjMTkyNCA9XG4gIFwiMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXohIyQlJigpKistOzw9Pj9AXl9ge3x9flwiIGFzIGNvbnN0O1xuY29uc3QgWjg1ID1cbiAgXCIwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWi4tOis9XiEvKj8mPD4oKVtde31AJSQjXCIgYXMgY29uc3Q7XG5cbi8qKlxuICogQ29udmVydHMgZGF0YSBpbnRvIGFuIGFzY2lpNTgtZW5jb2RlZCBzdHJpbmcuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlbmNvZGVBc2NpaTg1IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZW5jb2RpbmcvYXNjaWk4NS50c1wiO1xuICpcbiAqIGVuY29kZUFzY2lpODUoXCJIZWxsbyB3b3JsZCFcIik7IC8vIFwiODdjVVJEXWo3QkVibzgwXCJcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQXNjaWk4NShcbiAgZGF0YTogQXJyYXlCdWZmZXIgfCBVaW50OEFycmF5IHwgc3RyaW5nLFxuICBvcHRpb25zPzogQXNjaWk4NU9wdGlvbnMsXG4pOiBzdHJpbmcge1xuICBsZXQgdWludDggPSB2YWxpZGF0ZUJpbmFyeUxpa2UoZGF0YSk7XG5cbiAgY29uc3Qgc3RhbmRhcmQgPSBvcHRpb25zPy5zdGFuZGFyZCA/PyBcIkFkb2JlXCI7XG4gIGxldCBvdXRwdXQ6IHN0cmluZ1tdID0gW107XG4gIGxldCB2OiBudW1iZXI7XG4gIGxldCBuID0gMDtcbiAgbGV0IGRpZmZlcmVuY2UgPSAwO1xuICBpZiAodWludDgubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgIGNvbnN0IHRtcCA9IHVpbnQ4O1xuICAgIGRpZmZlcmVuY2UgPSA0IC0gKHRtcC5sZW5ndGggJSA0KTtcbiAgICB1aW50OCA9IG5ldyBVaW50OEFycmF5KHRtcC5sZW5ndGggKyBkaWZmZXJlbmNlKTtcbiAgICB1aW50OC5zZXQodG1wKTtcbiAgfVxuICBjb25zdCB2aWV3ID0gbmV3IERhdGFWaWV3KHVpbnQ4LmJ1ZmZlciwgdWludDguYnl0ZU9mZnNldCwgdWludDguYnl0ZUxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdWludDgubGVuZ3RoOyBpICs9IDQpIHtcbiAgICB2ID0gdmlldy5nZXRVaW50MzIoaSk7XG4gICAgLy8gQWRvYmUgYW5kIGJ0b2Egc3RhbmRhcmRzIGNvbXByZXNzIDQgemVyb2VzIHRvIHNpbmdsZSBcInpcIiBjaGFyYWN0ZXJcbiAgICBpZiAoXG4gICAgICAoc3RhbmRhcmQgPT09IFwiQWRvYmVcIiB8fCBzdGFuZGFyZCA9PT0gXCJidG9hXCIpICYmXG4gICAgICB2ID09PSAwICYmXG4gICAgICBpIDwgdWludDgubGVuZ3RoIC0gZGlmZmVyZW5jZSAtIDNcbiAgICApIHtcbiAgICAgIG91dHB1dFtuKytdID0gXCJ6XCI7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gYnRvYSBjb21wcmVzc2VzIDQgc3BhY2VzIC0gdGhhdCBpcywgYnl0ZXMgZXF1YWwgdG8gMzIgLSBpbnRvIHNpbmdsZSBcInlcIiBjaGFyYWN0ZXJcbiAgICBpZiAoc3RhbmRhcmQgPT09IFwiYnRvYVwiICYmIHYgPT09IDUzODk3NjI4OCkge1xuICAgICAgb3V0cHV0W24rK10gPSBcInlcIjtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBmb3IgKGxldCBqID0gNDsgaiA+PSAwOyBqLS0pIHtcbiAgICAgIG91dHB1dFtuICsgal0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCh2ICUgODUpICsgMzMpO1xuICAgICAgdiA9IE1hdGgudHJ1bmModiAvIDg1KTtcbiAgICB9XG4gICAgbiArPSA1O1xuICB9XG4gIHN3aXRjaCAoc3RhbmRhcmQpIHtcbiAgICBjYXNlIFwiQWRvYmVcIjpcbiAgICAgIGlmIChvcHRpb25zPy5kZWxpbWl0ZXIpIHtcbiAgICAgICAgcmV0dXJuIGA8fiR7b3V0cHV0LnNsaWNlKDAsIG91dHB1dC5sZW5ndGggLSBkaWZmZXJlbmNlKS5qb2luKFwiXCIpfX4+YDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJidG9hXCI6XG4gICAgICBpZiAob3B0aW9ucz8uZGVsaW1pdGVyKSB7XG4gICAgICAgIHJldHVybiBgeGJ0b2EgQmVnaW5cXG4ke1xuICAgICAgICAgIG91dHB1dFxuICAgICAgICAgICAgLnNsaWNlKDAsIG91dHB1dC5sZW5ndGggLSBkaWZmZXJlbmNlKVxuICAgICAgICAgICAgLmpvaW4oXCJcIilcbiAgICAgICAgfVxcbnhidG9hIEVuZGA7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiUkZDIDE5MjRcIjpcbiAgICAgIG91dHB1dCA9IG91dHB1dC5tYXAoKHZhbCkgPT4gcmZjMTkyNFt2YWwuY2hhckNvZGVBdCgwKSAtIDMzXSEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIlo4NVwiOlxuICAgICAgb3V0cHV0ID0gb3V0cHV0Lm1hcCgodmFsKSA9PiBaODVbdmFsLmNoYXJDb2RlQXQoMCkgLSAzM10hKTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBvdXRwdXQuc2xpY2UoMCwgb3V0cHV0Lmxlbmd0aCAtIGRpZmZlcmVuY2UpLmpvaW4oXCJcIik7XG59XG5cbi8qKlxuICogRGVjb2RlcyBhIGFzY2lpODUtZW5jb2RlZCBzdHJpbmcuXG4gKlxuICogQHBhcmFtIGFzY2lpODUgVGhlIGFzY2lpODUtZW5jb2RlZCBzdHJpbmcgdG8gZGVjb2RlLlxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZGVjb2RpbmcuXG4gKiBAcmV0dXJucyBUaGUgZGVjb2RlZCBkYXRhLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZGVjb2RlQXNjaWk4NSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2VuY29kaW5nL2FzY2lpODUudHNcIjtcbiAqXG4gKiBkZWNvZGVBc2NpaTg1KFwiODdjVVJEXWo3QkVibzgwXCIpO1xuICogLy8gVWludDhBcnJheSgxMikgWyA3MiwgMTAxLCAxMDgsIDEwOCwgMTExLCAzMiwgMTE5LCAxMTEsIDExNCwgMTA4LCAxMDAsIDMzIF1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlQXNjaWk4NShcbiAgYXNjaWk4NTogc3RyaW5nLFxuICBvcHRpb25zPzogQXNjaWk4NU9wdGlvbnMsXG4pOiBVaW50OEFycmF5IHtcbiAgY29uc3QgZW5jb2RpbmcgPSBvcHRpb25zPy5zdGFuZGFyZCA/PyBcIkFkb2JlXCI7XG4gIC8vIHRyYW5zbGF0ZSBhbGwgZW5jb2RpbmdzIHRvIG1vc3QgYmFzaWMgYWRvYmUvYnRvYSBvbmUgYW5kIGRlY29tcHJlc3Mgc29tZSBzcGVjaWFsIGNoYXJhY3RlcnMgKFwielwiIGFuZCBcInlcIilcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgXCJBZG9iZVwiOlxuICAgICAgYXNjaWk4NSA9IGFzY2lpODUucmVwbGFjZUFsbCgvKDx+fH4+KS9nLCBcIlwiKS5yZXBsYWNlQWxsKFwielwiLCBcIiEhISEhXCIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImJ0b2FcIjpcbiAgICAgIGFzY2lpODUgPSBhc2NpaTg1XG4gICAgICAgIC5yZXBsYWNlQWxsKC8oeGJ0b2EgQmVnaW58eGJ0b2EgRW5kfFxcbikvZywgXCJcIilcbiAgICAgICAgLnJlcGxhY2VBbGwoXCJ6XCIsIFwiISEhISFcIilcbiAgICAgICAgLnJlcGxhY2VBbGwoXCJ5XCIsIFwiKzxWZExcIik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiUkZDIDE5MjRcIjpcbiAgICAgIGFzY2lpODUgPSBhc2NpaTg1LnJlcGxhY2VBbGwoXG4gICAgICAgIC8uL2csXG4gICAgICAgIChtYXRjaCkgPT4gU3RyaW5nLmZyb21DaGFyQ29kZShyZmMxOTI0LmluZGV4T2YobWF0Y2gpICsgMzMpLFxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJaODVcIjpcbiAgICAgIGFzY2lpODUgPSBhc2NpaTg1LnJlcGxhY2VBbGwoXG4gICAgICAgIC8uL2csXG4gICAgICAgIChtYXRjaCkgPT4gU3RyaW5nLmZyb21DaGFyQ29kZShaODUuaW5kZXhPZihtYXRjaCkgKyAzMyksXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgLy8gcmVtb3ZlIGFsbCBpbnZhbGlkIGNoYXJhY3RlcnNcbiAgYXNjaWk4NSA9IGFzY2lpODUucmVwbGFjZUFsbCgvW14hLXVdL2csIFwiXCIpO1xuICBjb25zdCBsZW4gPSBhc2NpaTg1Lmxlbmd0aDtcbiAgY29uc3Qgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkobGVuICsgNCAtIChsZW4gJSA0KSk7XG4gIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcob3V0cHV0LmJ1ZmZlcik7XG4gIGxldCB2ID0gMDtcbiAgbGV0IG4gPSAwO1xuICBsZXQgbWF4ID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47KSB7XG4gICAgZm9yIChtYXggKz0gNTsgaSA8IG1heDsgaSsrKSB7XG4gICAgICB2ID0gdiAqIDg1ICsgKGkgPCBsZW4gPyBhc2NpaTg1LmNoYXJDb2RlQXQoaSkgOiAxMTcpIC0gMzM7XG4gICAgfVxuICAgIHZpZXcuc2V0VWludDMyKG4sIHYpO1xuICAgIHYgPSAwO1xuICAgIG4gKz0gNDtcbiAgfVxuICByZXR1cm4gb3V0cHV0LnNsaWNlKDAsIE1hdGgudHJ1bmMobGVuICogMC44KSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvQkMsR0FFRCxTQUFTLGtCQUFrQixRQUFRLGFBQWE7QUFvQmhELE1BQU0sVUFDSjtBQUNGLE1BQU0sTUFDSjtBQUVGOzs7Ozs7Ozs7Q0FTQyxHQUNELE9BQU8sU0FBUyxjQUNkLElBQXVDLEVBQ3ZDLE9BQXdCO0VBRXhCLElBQUksUUFBUSxtQkFBbUI7RUFF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
// denoCacheMetadata=14238711145963608563,772428266452090021