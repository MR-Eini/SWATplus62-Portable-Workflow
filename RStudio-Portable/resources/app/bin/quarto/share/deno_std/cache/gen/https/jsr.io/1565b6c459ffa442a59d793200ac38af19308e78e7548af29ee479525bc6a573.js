// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns all elements in the given collection until the first element that
 * does not match the given predicate.
 *
 * @template T The type of the array elements.
 *
 * @param array The array to take elements from.
 * @param predicate The predicate function to determine if an element should be
 * included.
 *
 * @returns A new array containing all elements until the first element that
 * does not match the predicate.
 *
 * @example Basic usage
 * ```ts
 * import { takeWhile } from "@std/collections/take-while";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const numbers = [1, 2, 3, 4, 5, 6];
 *
 * const result = takeWhile(numbers, (number) => number < 4);
 *
 * assertEquals(result, [1, 2, 3]);
 * ```
 */ export function takeWhile(array, predicate) {
  let offset = 0;
  const length = array.length;
  while(length > offset && predicate(array[offset])){
    offset++;
  }
  return array.slice(0, offset);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi90YWtlX3doaWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogUmV0dXJucyBhbGwgZWxlbWVudHMgaW4gdGhlIGdpdmVuIGNvbGxlY3Rpb24gdW50aWwgdGhlIGZpcnN0IGVsZW1lbnQgdGhhdFxuICogZG9lcyBub3QgbWF0Y2ggdGhlIGdpdmVuIHByZWRpY2F0ZS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdHlwZSBvZiB0aGUgYXJyYXkgZWxlbWVudHMuXG4gKlxuICogQHBhcmFtIGFycmF5IFRoZSBhcnJheSB0byB0YWtlIGVsZW1lbnRzIGZyb20uXG4gKiBAcGFyYW0gcHJlZGljYXRlIFRoZSBwcmVkaWNhdGUgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGFuIGVsZW1lbnQgc2hvdWxkIGJlXG4gKiBpbmNsdWRlZC5cbiAqXG4gKiBAcmV0dXJucyBBIG5ldyBhcnJheSBjb250YWluaW5nIGFsbCBlbGVtZW50cyB1bnRpbCB0aGUgZmlyc3QgZWxlbWVudCB0aGF0XG4gKiBkb2VzIG5vdCBtYXRjaCB0aGUgcHJlZGljYXRlLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgdGFrZVdoaWxlIH0gZnJvbSBcIkBzdGQvY29sbGVjdGlvbnMvdGFrZS13aGlsZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBudW1iZXJzID0gWzEsIDIsIDMsIDQsIDUsIDZdO1xuICpcbiAqIGNvbnN0IHJlc3VsdCA9IHRha2VXaGlsZShudW1iZXJzLCAobnVtYmVyKSA9PiBudW1iZXIgPCA0KTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMocmVzdWx0LCBbMSwgMiwgM10pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0YWtlV2hpbGU8VD4oXG4gIGFycmF5OiByZWFkb25seSBUW10sXG4gIHByZWRpY2F0ZTogKGVsOiBUKSA9PiBib29sZWFuLFxuKTogVFtdIHtcbiAgbGV0IG9mZnNldCA9IDA7XG4gIGNvbnN0IGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAobGVuZ3RoID4gb2Zmc2V0ICYmIHByZWRpY2F0ZShhcnJheVtvZmZzZXRdIGFzIFQpKSB7XG4gICAgb2Zmc2V0Kys7XG4gIH1cblxuICByZXR1cm4gYXJyYXkuc2xpY2UoMCwgb2Zmc2V0KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3QkMsR0FDRCxPQUFPLFNBQVMsVUFDZCxLQUFtQixFQUNuQixTQUE2QjtFQUU3QixJQUFJLFNBQVM7RUFDYixNQUFNLFNBQVMsTUFBTSxNQUFNO0VBRTNCLE1BQU8sU0FBUyxVQUFVLFVBQVUsS0FBSyxDQUFDLE9BQU8sRUFBUTtJQUN2RDtFQUNGO0VBRUEsT0FBTyxNQUFNLEtBQUssQ0FBQyxHQUFHO0FBQ3hCIn0=
// denoCacheMetadata=8855080046516120716,11882718835799789152