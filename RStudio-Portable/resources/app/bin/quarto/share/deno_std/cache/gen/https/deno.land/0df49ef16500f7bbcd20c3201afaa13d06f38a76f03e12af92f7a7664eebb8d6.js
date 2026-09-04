// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Utilities for
 * {@link https://datatracker.ietf.org/doc/html/draft-msporny-base58-03 | base58}
 * encoding and decoding.
 *
 * This module is browser compatible.
 *
 * ```ts
 * import { encodeBase58, decodeBase58 } from "https://deno.land/std@$STD_VERSION/encoding/base58.ts";
 *
 * const encoded = encodeBase58("Hello World!"); // "2NEpo7TZRRrLZSi2U"
 *
 * decodeBase58(encoded);
 * // Uint8Array(12) [ 72, 101, 108, 108, 111, 32,  87, 111, 114, 108, 100, 33 ]
 * ```
 *
 * @module
 */ import { validateBinaryLike } from "./_util.ts";
// deno-fmt-ignore
const mapBase58 = {
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,
  "7": 6,
  "8": 7,
  "9": 8,
  A: 9,
  B: 10,
  C: 11,
  D: 12,
  E: 13,
  F: 14,
  G: 15,
  H: 16,
  J: 17,
  K: 18,
  L: 19,
  M: 20,
  N: 21,
  P: 22,
  Q: 23,
  R: 24,
  S: 25,
  T: 26,
  U: 27,
  V: 28,
  W: 29,
  X: 30,
  Y: 31,
  Z: 32,
  a: 33,
  b: 34,
  c: 35,
  d: 36,
  e: 37,
  f: 38,
  g: 39,
  h: 40,
  i: 41,
  j: 42,
  k: 43,
  m: 44,
  n: 45,
  o: 46,
  p: 47,
  q: 48,
  r: 49,
  s: 50,
  t: 51,
  u: 52,
  v: 53,
  w: 54,
  x: 55,
  y: 56,
  z: 57
};
const base58alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".split("");
/**
 * Converts data into a base58-encoded string.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/draft-msporny-base58-03#section-3}
 *
 * @param data The data to encode.
 * @returns The base58-encoded string.
 *
 * @example
 * ```ts
 * import { encodeBase58 } from "https://deno.land/std@$STD_VERSION/encoding/base58.ts";
 *
 * encodeBase58("Hello World!"); // "2NEpo7TZRRrLZSi2U"
 * ```
 */ export function encodeBase58(data) {
  const uint8tData = validateBinaryLike(data);
  let length = 0;
  let zeroes = 0;
  // Counting leading zeroes
  let index = 0;
  while(uint8tData[index] === 0){
    zeroes++;
    index++;
  }
  const notZeroUint8Data = uint8tData.slice(index);
  const size = Math.round(uint8tData.length * 138 / 100 + 1);
  const b58Encoding = [];
  notZeroUint8Data.forEach((byte)=>{
    let i = 0;
    let carry = byte;
    for(let reverseIterator = size - 1; (carry > 0 || i < length) && reverseIterator !== -1; reverseIterator--, i++){
      carry += (b58Encoding[reverseIterator] || 0) * 256;
      b58Encoding[reverseIterator] = Math.round(carry % 58);
      carry = Math.floor(carry / 58);
    }
    length = i;
  });
  const strResult = Array.from({
    length: b58Encoding.length + zeroes
  });
  if (zeroes > 0) {
    strResult.fill("1", 0, zeroes);
  }
  b58Encoding.forEach((byteValue)=>strResult.push(base58alphabet[byteValue]));
  return strResult.join("");
}
/**
 * Decodes a base58-encoded string.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/draft-msporny-base58-03#section-4}
 *
 * @param b58 The base58-encoded string to decode.
 * @returns The decoded data.
 *
 * @example
 * ```ts
 * import { decodeBase58 } from "https://deno.land/std@$STD_VERSION/encoding/base58.ts";
 *
 * decodeBase58("2NEpo7TZRRrLZSi2U");
 * // Uint8Array(12) [ 72, 101, 108, 108, 111, 32,  87, 111, 114, 108, 100, 33 ]
 * ```
 */ export function decodeBase58(b58) {
  const splitInput = b58.trim().split("");
  let length = 0;
  let ones = 0;
  // Counting leading ones
  let index = 0;
  while(splitInput[index] === "1"){
    ones++;
    index++;
  }
  const notZeroData = splitInput.slice(index);
  const size = Math.round(b58.length * 733 / 1000 + 1);
  const output = [];
  notZeroData.forEach((char, idx)=>{
    let carry = mapBase58[char];
    let i = 0;
    if (carry === undefined) {
      throw new Error(`Invalid base58 char at index ${idx} with value ${char}`);
    }
    for(let reverseIterator = size - 1; (carry > 0 || i < length) && reverseIterator !== -1; reverseIterator--, i++){
      carry += 58 * (output[reverseIterator] || 0);
      output[reverseIterator] = Math.round(carry % 256);
      carry = Math.floor(carry / 256);
    }
    length = i;
  });
  const validOutput = output.filter((item)=>item !== undefined);
  if (ones > 0) {
    const onesResult = Array.from({
      length: ones
    }).fill(0, 0, ones);
    return new Uint8Array([
      ...onesResult,
      ...validOutput
    ]);
  }
  return new Uint8Array(validOutput);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIyNC4wL2VuY29kaW5nL2Jhc2U1OC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFV0aWxpdGllcyBmb3JcbiAqIHtAbGluayBodHRwczovL2RhdGF0cmFja2VyLmlldGYub3JnL2RvYy9odG1sL2RyYWZ0LW1zcG9ybnktYmFzZTU4LTAzIHwgYmFzZTU4fVxuICogZW5jb2RpbmcgYW5kIGRlY29kaW5nLlxuICpcbiAqIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5jb2RlQmFzZTU4LCBkZWNvZGVCYXNlNTggfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9lbmNvZGluZy9iYXNlNTgudHNcIjtcbiAqXG4gKiBjb25zdCBlbmNvZGVkID0gZW5jb2RlQmFzZTU4KFwiSGVsbG8gV29ybGQhXCIpOyAvLyBcIjJORXBvN1RaUlJyTFpTaTJVXCJcbiAqXG4gKiBkZWNvZGVCYXNlNTgoZW5jb2RlZCk7XG4gKiAvLyBVaW50OEFycmF5KDEyKSBbIDcyLCAxMDEsIDEwOCwgMTA4LCAxMTEsIDMyLCAgODcsIDExMSwgMTE0LCAxMDgsIDEwMCwgMzMgXVxuICogYGBgXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCB7IHZhbGlkYXRlQmluYXJ5TGlrZSB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5cbi8vIGRlbm8tZm10LWlnbm9yZVxuY29uc3QgbWFwQmFzZTU4OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge1xuICBcIjFcIjogMCwgXCIyXCI6IDEsIFwiM1wiOiAyLCBcIjRcIjogMywgXCI1XCI6IDQsIFwiNlwiOiA1LCBcIjdcIjogNiwgXCI4XCI6IDcsIFwiOVwiOiA4LCBBOiA5LFxuICBCOiAxMCwgQzogMTEsIEQ6IDEyLCBFOiAxMywgRjogMTQsIEc6IDE1LCBIOiAxNiwgSjogMTcsIEs6IDE4LCBMOiAxOSwgTTogMjAsXG4gIE46IDIxLCBQOiAyMiwgUTogMjMsIFI6IDI0LCBTOiAyNSwgVDogMjYsIFU6IDI3LCBWOiAyOCwgVzogMjksIFg6IDMwLCBZOiAzMSxcbiAgWjogMzIsIGE6IDMzLCBiOiAzNCwgYzogMzUsIGQ6IDM2LCBlOiAzNywgZjogMzgsIGc6IDM5LCBoOiA0MCwgaTogNDEsIGo6IDQyLFxuICBrOiA0MywgbTogNDQsIG46IDQ1LCBvOiA0NiwgcDogNDcsIHE6IDQ4LCByOiA0OSwgczogNTAsIHQ6IDUxLCB1OiA1MiwgdjogNTMsXG4gIHc6IDU0LCB4OiA1NSwgeTogNTYsIHo6IDU3XG59O1xuXG5jb25zdCBiYXNlNThhbHBoYWJldCA9XG4gIFwiMTIzNDU2Nzg5QUJDREVGR0hKS0xNTlBRUlNUVVZXWFlaYWJjZGVmZ2hpamttbm9wcXJzdHV2d3h5elwiLnNwbGl0KFwiXCIpO1xuXG4vKipcbiAqIENvbnZlcnRzIGRhdGEgaW50byBhIGJhc2U1OC1lbmNvZGVkIHN0cmluZy5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RhdGF0cmFja2VyLmlldGYub3JnL2RvYy9odG1sL2RyYWZ0LW1zcG9ybnktYmFzZTU4LTAzI3NlY3Rpb24tM31cbiAqXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBlbmNvZGUuXG4gKiBAcmV0dXJucyBUaGUgYmFzZTU4LWVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5jb2RlQmFzZTU4IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZW5jb2RpbmcvYmFzZTU4LnRzXCI7XG4gKlxuICogZW5jb2RlQmFzZTU4KFwiSGVsbG8gV29ybGQhXCIpOyAvLyBcIjJORXBvN1RaUlJyTFpTaTJVXCJcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQmFzZTU4KGRhdGE6IEFycmF5QnVmZmVyIHwgVWludDhBcnJheSB8IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHVpbnQ4dERhdGEgPSB2YWxpZGF0ZUJpbmFyeUxpa2UoZGF0YSk7XG5cbiAgbGV0IGxlbmd0aCA9IDA7XG4gIGxldCB6ZXJvZXMgPSAwO1xuXG4gIC8vIENvdW50aW5nIGxlYWRpbmcgemVyb2VzXG4gIGxldCBpbmRleCA9IDA7XG4gIHdoaWxlICh1aW50OHREYXRhW2luZGV4XSA9PT0gMCkge1xuICAgIHplcm9lcysrO1xuICAgIGluZGV4Kys7XG4gIH1cblxuICBjb25zdCBub3RaZXJvVWludDhEYXRhID0gdWludDh0RGF0YS5zbGljZShpbmRleCk7XG5cbiAgY29uc3Qgc2l6ZSA9IE1hdGgucm91bmQoKHVpbnQ4dERhdGEubGVuZ3RoICogMTM4KSAvIDEwMCArIDEpO1xuICBjb25zdCBiNThFbmNvZGluZzogbnVtYmVyW10gPSBbXTtcblxuICBub3RaZXJvVWludDhEYXRhLmZvckVhY2goKGJ5dGUpID0+IHtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IGNhcnJ5ID0gYnl0ZTtcblxuICAgIGZvciAoXG4gICAgICBsZXQgcmV2ZXJzZUl0ZXJhdG9yID0gc2l6ZSAtIDE7XG4gICAgICAoY2FycnkgPiAwIHx8IGkgPCBsZW5ndGgpICYmIHJldmVyc2VJdGVyYXRvciAhPT0gLTE7XG4gICAgICByZXZlcnNlSXRlcmF0b3ItLSwgaSsrXG4gICAgKSB7XG4gICAgICBjYXJyeSArPSAoYjU4RW5jb2RpbmdbcmV2ZXJzZUl0ZXJhdG9yXSB8fCAwKSAqIDI1NjtcbiAgICAgIGI1OEVuY29kaW5nW3JldmVyc2VJdGVyYXRvcl0gPSBNYXRoLnJvdW5kKGNhcnJ5ICUgNTgpO1xuICAgICAgY2FycnkgPSBNYXRoLmZsb29yKGNhcnJ5IC8gNTgpO1xuICAgIH1cblxuICAgIGxlbmd0aCA9IGk7XG4gIH0pO1xuXG4gIGNvbnN0IHN0clJlc3VsdDogc3RyaW5nW10gPSBBcnJheS5mcm9tKHtcbiAgICBsZW5ndGg6IGI1OEVuY29kaW5nLmxlbmd0aCArIHplcm9lcyxcbiAgfSk7XG5cbiAgaWYgKHplcm9lcyA+IDApIHtcbiAgICBzdHJSZXN1bHQuZmlsbChcIjFcIiwgMCwgemVyb2VzKTtcbiAgfVxuXG4gIGI1OEVuY29kaW5nLmZvckVhY2goKGJ5dGVWYWx1ZSkgPT5cbiAgICBzdHJSZXN1bHQucHVzaChiYXNlNThhbHBoYWJldFtieXRlVmFsdWVdISlcbiAgKTtcblxuICByZXR1cm4gc3RyUmVzdWx0LmpvaW4oXCJcIik7XG59XG5cbi8qKlxuICogRGVjb2RlcyBhIGJhc2U1OC1lbmNvZGVkIHN0cmluZy5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RhdGF0cmFja2VyLmlldGYub3JnL2RvYy9odG1sL2RyYWZ0LW1zcG9ybnktYmFzZTU4LTAzI3NlY3Rpb24tNH1cbiAqXG4gKiBAcGFyYW0gYjU4IFRoZSBiYXNlNTgtZW5jb2RlZCBzdHJpbmcgdG8gZGVjb2RlLlxuICogQHJldHVybnMgVGhlIGRlY29kZWQgZGF0YS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGRlY29kZUJhc2U1OCB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2VuY29kaW5nL2Jhc2U1OC50c1wiO1xuICpcbiAqIGRlY29kZUJhc2U1OChcIjJORXBvN1RaUlJyTFpTaTJVXCIpO1xuICogLy8gVWludDhBcnJheSgxMikgWyA3MiwgMTAxLCAxMDgsIDEwOCwgMTExLCAzMiwgIDg3LCAxMTEsIDExNCwgMTA4LCAxMDAsIDMzIF1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlQmFzZTU4KGI1ODogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGNvbnN0IHNwbGl0SW5wdXQgPSBiNTgudHJpbSgpLnNwbGl0KFwiXCIpO1xuXG4gIGxldCBsZW5ndGggPSAwO1xuICBsZXQgb25lcyA9IDA7XG5cbiAgLy8gQ291bnRpbmcgbGVhZGluZyBvbmVzXG4gIGxldCBpbmRleCA9IDA7XG4gIHdoaWxlIChzcGxpdElucHV0W2luZGV4XSA9PT0gXCIxXCIpIHtcbiAgICBvbmVzKys7XG4gICAgaW5kZXgrKztcbiAgfVxuXG4gIGNvbnN0IG5vdFplcm9EYXRhID0gc3BsaXRJbnB1dC5zbGljZShpbmRleCk7XG5cbiAgY29uc3Qgc2l6ZSA9IE1hdGgucm91bmQoKGI1OC5sZW5ndGggKiA3MzMpIC8gMTAwMCArIDEpO1xuICBjb25zdCBvdXRwdXQ6IG51bWJlcltdID0gW107XG5cbiAgbm90WmVyb0RhdGEuZm9yRWFjaCgoY2hhciwgaWR4KSA9PiB7XG4gICAgbGV0IGNhcnJ5ID0gbWFwQmFzZTU4W2NoYXJdO1xuICAgIGxldCBpID0gMDtcblxuICAgIGlmIChjYXJyeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgYmFzZTU4IGNoYXIgYXQgaW5kZXggJHtpZHh9IHdpdGggdmFsdWUgJHtjaGFyfWApO1xuICAgIH1cblxuICAgIGZvciAoXG4gICAgICBsZXQgcmV2ZXJzZUl0ZXJhdG9yID0gc2l6ZSAtIDE7XG4gICAgICAoY2FycnkgPiAwIHx8IGkgPCBsZW5ndGgpICYmIHJldmVyc2VJdGVyYXRvciAhPT0gLTE7XG4gICAgICByZXZlcnNlSXRlcmF0b3ItLSwgaSsrXG4gICAgKSB7XG4gICAgICBjYXJyeSArPSA1OCAqIChvdXRwdXRbcmV2ZXJzZUl0ZXJhdG9yXSB8fCAwKTtcbiAgICAgIG91dHB1dFtyZXZlcnNlSXRlcmF0b3JdID0gTWF0aC5yb3VuZChjYXJyeSAlIDI1Nik7XG4gICAgICBjYXJyeSA9IE1hdGguZmxvb3IoY2FycnkgLyAyNTYpO1xuICAgIH1cblxuICAgIGxlbmd0aCA9IGk7XG4gIH0pO1xuXG4gIGNvbnN0IHZhbGlkT3V0cHV0ID0gb3V0cHV0LmZpbHRlcigoaXRlbSkgPT4gaXRlbSAhPT0gdW5kZWZpbmVkKTtcblxuICBpZiAob25lcyA+IDApIHtcbiAgICBjb25zdCBvbmVzUmVzdWx0ID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogb25lcyB9KS5maWxsKDAsIDAsIG9uZXMpO1xuXG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KFsuLi5vbmVzUmVzdWx0LCAuLi52YWxpZE91dHB1dF0gYXMgbnVtYmVyW10pO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHZhbGlkT3V0cHV0KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCQyxHQUVELFNBQVMsa0JBQWtCLFFBQVEsYUFBYTtBQUVoRCxrQkFBa0I7QUFDbEIsTUFBTSxZQUFvQztFQUN4QyxLQUFLO0VBQUcsS0FBSztFQUFHLEtBQUs7RUFBRyxLQUFLO0VBQUcsS0FBSztFQUFHLEtBQUs7RUFBRyxLQUFLO0VBQUcsS0FBSztFQUFHLEtBQUs7RUFBRyxHQUFHO0VBQzNFLEdBQUc7RUFBSSxHQUFHO0VBQUksR0FBRztFQUFJLEdBQUc7RUFBSSxHQUFHO0VBQUksR0FBRztFQUFJLEdBQUc7RUFBSSxHQUFHO0VBQUksR0FBRztFQUFJLEdBQUc7RUFBSSxHQUFHO0VBQ3pFLEdBQUc7RUFBSSxHQUFHO0VBQUksR0FBRztFQUFJLEdBQUc7RUFBSSxHQUFHO0VBQUksR0FBRztFQUFJLEdBQUc7RUFBSSxHQUFHO0VBQUksR0FBRztFQUFJLEdBQUc7RUFBSSxHQUFHO0VBQ3pFLEdBQUc7RUFBSSxHQUFHO0VBQUksR0FBRztFQUFJLEdBQUc7RUFBSSxHQUFHO0VBQUksR0FBRztFQUFJLEdBQUc7RUFBSSxHQUFHO0VBQUksR0FBRztFQUFJLEdBQUc7RUFBSSxHQUFHO0VBQ3pFLEdBQUc7RUFBSSxHQUFHO0VBQUksR0FBRztFQUFJLEdBQUc7RUFBSSxHQUFHO0VBQUksR0FBRztFQUFJLEdBQUc7RUFBSSxHQUFHO0VBQUksR0FBRztFQUFJLEdBQUc7RUFB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
// denoCacheMetadata=16229148562043867401,7438330908299778452