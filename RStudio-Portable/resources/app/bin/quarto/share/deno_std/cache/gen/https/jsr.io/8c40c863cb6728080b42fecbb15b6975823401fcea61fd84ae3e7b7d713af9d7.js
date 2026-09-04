// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Check whether byte slices are equal to each other using 8-bit comparisons.
 *
 * @param a First array to check equality
 * @param b Second array to check equality
 * @returns `true` if the arrays are equal, `false` otherwise
 *
 * @private
 */ function equalsNaive(a, b) {
  for(let i = 0; i < b.length; i++){
    if (a[i] !== b[i]) return false;
  }
  return true;
}
/** Check whether byte slices are equal to each other using 32-bit comparisons.
 *
 * @param a First array to check equality.
 * @param b Second array to check equality.
 * @returns `true` if the arrays are equal, `false` otherwise.
 *
 * @private
 */ function equals32Bit(a, b) {
  const len = a.length;
  const compactOffset = 3 - (a.byteOffset + 3) % 4;
  const compactLen = Math.floor((len - compactOffset) / 4);
  const compactA = new Uint32Array(a.buffer, a.byteOffset + compactOffset, compactLen);
  const compactB = new Uint32Array(b.buffer, b.byteOffset + compactOffset, compactLen);
  for(let i = 0; i < compactOffset; i++){
    if (a[i] !== b[i]) return false;
  }
  for(let i = 0; i < compactA.length; i++){
    if (compactA[i] !== compactB[i]) return false;
  }
  for(let i = compactOffset + compactLen * 4; i < len; i++){
    if (a[i] !== b[i]) return false;
  }
  return true;
}
/**
 * Byte length threshold for when to use 32-bit comparisons, based on
 * benchmarks.
 *
 * @see {@link https://github.com/denoland/deno_std/pull/4635}
 */ const THRESHOLD_32_BIT = 160;
/**
 * Check whether byte slices are equal to each other.
 *
 * @param a First array to check equality.
 * @param b Second array to check equality.
 * @returns `true` if the arrays are equal, `false` otherwise.
 *
 * @example Basic usage
 * ```ts
 * import { equals } from "@std/bytes/equals";
 *
 * const a = new Uint8Array([1, 2, 3]);
 * const b = new Uint8Array([1, 2, 3]);
 * const c = new Uint8Array([4, 5, 6]);
 *
 * equals(a, b); // true
 * equals(b, c); // false
 * ```
 */ export function equals(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return a.length >= THRESHOLD_32_BIT && a.byteOffset % 4 === b.byteOffset % 4 ? equals32Bit(a, b) : equalsNaive(a, b);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMC4yMjQuMC9lcXVhbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGJ5dGUgc2xpY2VzIGFyZSBlcXVhbCB0byBlYWNoIG90aGVyIHVzaW5nIDgtYml0IGNvbXBhcmlzb25zLlxuICpcbiAqIEBwYXJhbSBhIEZpcnN0IGFycmF5IHRvIGNoZWNrIGVxdWFsaXR5XG4gKiBAcGFyYW0gYiBTZWNvbmQgYXJyYXkgdG8gY2hlY2sgZXF1YWxpdHlcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJyYXlzIGFyZSBlcXVhbCwgYGZhbHNlYCBvdGhlcndpc2VcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBlcXVhbHNOYWl2ZShhOiBVaW50OEFycmF5LCBiOiBVaW50OEFycmF5KTogYm9vbGVhbiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYi5sZW5ndGg7IGkrKykge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKiBDaGVjayB3aGV0aGVyIGJ5dGUgc2xpY2VzIGFyZSBlcXVhbCB0byBlYWNoIG90aGVyIHVzaW5nIDMyLWJpdCBjb21wYXJpc29ucy5cbiAqXG4gKiBAcGFyYW0gYSBGaXJzdCBhcnJheSB0byBjaGVjayBlcXVhbGl0eS5cbiAqIEBwYXJhbSBiIFNlY29uZCBhcnJheSB0byBjaGVjayBlcXVhbGl0eS5cbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJyYXlzIGFyZSBlcXVhbCwgYGZhbHNlYCBvdGhlcndpc2UuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZXF1YWxzMzJCaXQoYTogVWludDhBcnJheSwgYjogVWludDhBcnJheSk6IGJvb2xlYW4ge1xuICBjb25zdCBsZW4gPSBhLmxlbmd0aDtcbiAgY29uc3QgY29tcGFjdE9mZnNldCA9IDMgLSAoKGEuYnl0ZU9mZnNldCArIDMpICUgNCk7XG4gIGNvbnN0IGNvbXBhY3RMZW4gPSBNYXRoLmZsb29yKChsZW4gLSBjb21wYWN0T2Zmc2V0KSAvIDQpO1xuICBjb25zdCBjb21wYWN0QSA9IG5ldyBVaW50MzJBcnJheShcbiAgICBhLmJ1ZmZlcixcbiAgICBhLmJ5dGVPZmZzZXQgKyBjb21wYWN0T2Zmc2V0LFxuICAgIGNvbXBhY3RMZW4sXG4gICk7XG4gIGNvbnN0IGNvbXBhY3RCID0gbmV3IFVpbnQzMkFycmF5KFxuICAgIGIuYnVmZmVyLFxuICAgIGIuYnl0ZU9mZnNldCArIGNvbXBhY3RPZmZzZXQsXG4gICAgY29tcGFjdExlbixcbiAgKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wYWN0T2Zmc2V0OyBpKyspIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcGFjdEEubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoY29tcGFjdEFbaV0gIT09IGNvbXBhY3RCW2ldKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yIChsZXQgaSA9IGNvbXBhY3RPZmZzZXQgKyBjb21wYWN0TGVuICogNDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBCeXRlIGxlbmd0aCB0aHJlc2hvbGQgZm9yIHdoZW4gdG8gdXNlIDMyLWJpdCBjb21wYXJpc29ucywgYmFzZWQgb25cbiAqIGJlbmNobWFya3MuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2Rlbm9fc3RkL3B1bGwvNDYzNX1cbiAqL1xuY29uc3QgVEhSRVNIT0xEXzMyX0JJVCA9IDE2MDtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGJ5dGUgc2xpY2VzIGFyZSBlcXVhbCB0byBlYWNoIG90aGVyLlxuICpcbiAqIEBwYXJhbSBhIEZpcnN0IGFycmF5IHRvIGNoZWNrIGVxdWFsaXR5LlxuICogQHBhcmFtIGIgU2Vjb25kIGFycmF5IHRvIGNoZWNrIGVxdWFsaXR5LlxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBhcnJheXMgYXJlIGVxdWFsLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVxdWFscyB9IGZyb20gXCJAc3RkL2J5dGVzL2VxdWFsc1wiO1xuICpcbiAqIGNvbnN0IGEgPSBuZXcgVWludDhBcnJheShbMSwgMiwgM10pO1xuICogY29uc3QgYiA9IG5ldyBVaW50OEFycmF5KFsxLCAyLCAzXSk7XG4gKiBjb25zdCBjID0gbmV3IFVpbnQ4QXJyYXkoWzQsIDUsIDZdKTtcbiAqXG4gKiBlcXVhbHMoYSwgYik7IC8vIHRydWVcbiAqIGVxdWFscyhiLCBjKTsgLy8gZmFsc2VcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGE6IFVpbnQ4QXJyYXksIGI6IFVpbnQ4QXJyYXkpOiBib29sZWFuIHtcbiAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gYS5sZW5ndGggPj0gVEhSRVNIT0xEXzMyX0JJVCAmJlxuICAgICAgKGEuYnl0ZU9mZnNldCAlIDQpID09PSAoYi5ieXRlT2Zmc2V0ICUgNClcbiAgICA/IGVxdWFsczMyQml0KGEsIGIpXG4gICAgOiBlcXVhbHNOYWl2ZShhLCBiKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7OztDQVFDLEdBQ0QsU0FBUyxZQUFZLENBQWEsRUFBRSxDQUFhO0VBQy9DLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFLO0lBQ2pDLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLE9BQU87RUFDNUI7RUFDQSxPQUFPO0FBQ1Q7QUFFQTs7Ozs7OztDQU9DLEdBQ0QsU0FBUyxZQUFZLENBQWEsRUFBRSxDQUFhO0VBQy9DLE1BQU0sTUFBTSxFQUFFLE1BQU07RUFDcEIsTUFBTSxnQkFBZ0IsSUFBSyxDQUFDLEVBQUUsVUFBVSxHQUFHLENBQUMsSUFBSTtFQUNoRCxNQUFNLGFBQWEsS0FBSyxLQUFLLENBQUMsQ0FBQyxNQUFNLGFBQWEsSUFBSTtFQUN0RCxNQUFNLFdBQVcsSUFBSSxZQUNuQixFQUFFLE1BQU0sRUFDUixFQUFFLFVBQVUsR0FBRyxlQUNmO0VBRUYsTUFBTSxXQUFXLElBQUksWUFDbkIsRUFBRSxNQUFNLEVBQ1IsRUFBRSxVQUFVLEdBQUcsZUFDZjtFQUVGLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxlQUFlLElBQUs7SUFDdEMsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTztFQUM1QjtFQUNBLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxTQUFTLE1BQU0sRUFBRSxJQUFLO0lBQ3hDLElBQUksUUFBUSxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUMsRUFBRSxFQUFFLE9BQU87RUFDMUM7RUFDQSxJQUFLLElBQUksSUFBSSxnQkFBZ0IsYUFBYSxHQUFHLElBQUksS0FBSyxJQUFLO0lBQ3pELElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLE9BQU87RUFDNUI7RUFDQSxPQUFPO0FBQ1Q7QUFFQTs7Ozs7Q0FLQyxHQUNELE1BQU0sbUJBQW1CO0FBRXpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FrQkMsR0FDRCxPQUFPLFNBQVMsT0FBTyxDQUFhLEVBQUUsQ0FBYTtFQUNqRCxJQUFJLEVBQUUsTUFBTSxLQUFLLEVBQUUsTUFBTSxFQUFFO0lBQ3pCLE9BQU87RUFDVDtFQUNBLE9BQU8sRUFBRSxNQUFNLElBQUksb0JBQ2YsQUFBQyxFQUFFLFVBQVUsR0FBRyxNQUFRLEVBQUUsVUFBVSxHQUFHLElBQ3ZDLFlBQVksR0FBRyxLQUNmLFlBQVksR0FBRztBQUNyQiJ9
// denoCacheMetadata=7196238214102290088,6947523344377002610