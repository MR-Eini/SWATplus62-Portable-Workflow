// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Concatenate an array of byte slices into a single slice.
 *
 * @param buffers Array of byte slices to concatenate.
 * @returns Hello
 *
 * @example Basic usage
 * ```ts
 * import { concat } from "@std/bytes/concat";
 *
 * const a = new Uint8Array([0, 1, 2]);
 * const b = new Uint8Array([3, 4, 5]);
 *
 * concat([a, b]); // Uint8Array(6) [ 0, 1, 2, 3, 4, 5 ]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMC4yMjQuMC9jb25jYXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBDb25jYXRlbmF0ZSBhbiBhcnJheSBvZiBieXRlIHNsaWNlcyBpbnRvIGEgc2luZ2xlIHNsaWNlLlxuICpcbiAqIEBwYXJhbSBidWZmZXJzIEFycmF5IG9mIGJ5dGUgc2xpY2VzIHRvIGNvbmNhdGVuYXRlLlxuICogQHJldHVybnMgSGVsbG9cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNvbmNhdCB9IGZyb20gXCJAc3RkL2J5dGVzL2NvbmNhdFwiO1xuICpcbiAqIGNvbnN0IGEgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMl0pO1xuICogY29uc3QgYiA9IG5ldyBVaW50OEFycmF5KFszLCA0LCA1XSk7XG4gKlxuICogY29uY2F0KFthLCBiXSk7IC8vIFVpbnQ4QXJyYXkoNikgWyAwLCAxLCAyLCAzLCA0LCA1IF1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uY2F0KGJ1ZmZlcnM6IFVpbnQ4QXJyYXlbXSk6IFVpbnQ4QXJyYXkge1xuICBsZXQgbGVuZ3RoID0gMDtcbiAgZm9yIChjb25zdCBidWZmZXIgb2YgYnVmZmVycykge1xuICAgIGxlbmd0aCArPSBidWZmZXIubGVuZ3RoO1xuICB9XG4gIGNvbnN0IG91dHB1dCA9IG5ldyBVaW50OEFycmF5KGxlbmd0aCk7XG4gIGxldCBpbmRleCA9IDA7XG4gIGZvciAoY29uc3QgYnVmZmVyIG9mIGJ1ZmZlcnMpIHtcbiAgICBvdXRwdXQuc2V0KGJ1ZmZlciwgaW5kZXgpO1xuICAgIGluZGV4ICs9IGJ1ZmZlci5sZW5ndGg7XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBQ0QsT0FBTyxTQUFTLE9BQU8sT0FBcUI7RUFDMUMsSUFBSSxTQUFTO0VBQ2IsS0FBSyxNQUFNLFVBQVUsUUFBUztJQUM1QixVQUFVLE9BQU8sTUFBTTtFQUN6QjtFQUNBLE1BQU0sU0FBUyxJQUFJLFdBQVc7RUFDOUIsSUFBSSxRQUFRO0VBQ1osS0FBSyxNQUFNLFVBQVUsUUFBUztJQUM1QixPQUFPLEdBQUcsQ0FBQyxRQUFRO0lBQ25CLFNBQVMsT0FBTyxNQUFNO0VBQ3hCO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=10128575303895690128,2668464580062374034