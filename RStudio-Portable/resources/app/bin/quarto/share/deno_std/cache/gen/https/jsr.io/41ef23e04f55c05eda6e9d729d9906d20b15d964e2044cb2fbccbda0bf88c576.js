// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Concatenate an array of byte slices into a single slice.
 *
 * @param buffers Array of byte slices to concatenate.
 * @returns A new byte slice containing all the input slices concatenated.
 *
 * @example Basic usage
 * ```ts
 * import { concat } from "@std/bytes/concat";
 * import { assertEquals } from "@std/assert";
 *
 * const a = new Uint8Array([0, 1, 2]);
 * const b = new Uint8Array([3, 4, 5]);
 *
 * assertEquals(concat([a, b]), new Uint8Array([0, 1, 2, 3, 4, 5]));
 * ```
 */ export function concat(buffers) {
  let length = 0;
  for (const buffer of buffers){
    length += buffer.length;
  }
  const output = new Uint8Array(length);
  let index = 0;
  for (const buffer of buffers){
    output.set(buffer, index);
    index += buffer.length;
  }
  return output;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMS4wLjIvY29uY2F0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogQ29uY2F0ZW5hdGUgYW4gYXJyYXkgb2YgYnl0ZSBzbGljZXMgaW50byBhIHNpbmdsZSBzbGljZS5cbiAqXG4gKiBAcGFyYW0gYnVmZmVycyBBcnJheSBvZiBieXRlIHNsaWNlcyB0byBjb25jYXRlbmF0ZS5cbiAqIEByZXR1cm5zIEEgbmV3IGJ5dGUgc2xpY2UgY29udGFpbmluZyBhbGwgdGhlIGlucHV0IHNsaWNlcyBjb25jYXRlbmF0ZWQuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBjb25jYXQgfSBmcm9tIFwiQHN0ZC9ieXRlcy9jb25jYXRcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IGEgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMl0pO1xuICogY29uc3QgYiA9IG5ldyBVaW50OEFycmF5KFszLCA0LCA1XSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGNvbmNhdChbYSwgYl0pLCBuZXcgVWludDhBcnJheShbMCwgMSwgMiwgMywgNCwgNV0pKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uY2F0KGJ1ZmZlcnM6IFVpbnQ4QXJyYXlbXSk6IFVpbnQ4QXJyYXkge1xuICBsZXQgbGVuZ3RoID0gMDtcbiAgZm9yIChjb25zdCBidWZmZXIgb2YgYnVmZmVycykge1xuICAgIGxlbmd0aCArPSBidWZmZXIubGVuZ3RoO1xuICB9XG4gIGNvbnN0IG91dHB1dCA9IG5ldyBVaW50OEFycmF5KGxlbmd0aCk7XG4gIGxldCBpbmRleCA9IDA7XG4gIGZvciAoY29uc3QgYnVmZmVyIG9mIGJ1ZmZlcnMpIHtcbiAgICBvdXRwdXQuc2V0KGJ1ZmZlciwgaW5kZXgpO1xuICAgIGluZGV4ICs9IGJ1ZmZlci5sZW5ndGg7XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQkMsR0FDRCxPQUFPLFNBQVMsT0FBTyxPQUFxQjtFQUMxQyxJQUFJLFNBQVM7RUFDYixLQUFLLE1BQU0sVUFBVSxRQUFTO0lBQzVCLFVBQVUsT0FBTyxNQUFNO0VBQ3pCO0VBQ0EsTUFBTSxTQUFTLElBQUksV0FBVztFQUM5QixJQUFJLFFBQVE7RUFDWixLQUFLLE1BQU0sVUFBVSxRQUFTO0lBQzVCLE9BQU8sR0FBRyxDQUFDLFFBQVE7SUFDbkIsU0FBUyxPQUFPLE1BQU07RUFDeEI7RUFFQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=6556924817517215674,13563302325655300813