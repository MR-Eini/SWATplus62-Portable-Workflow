// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns a new array that drops all elements in the given collection until the
 * first element that does not match the given predicate.
 *
 * @template T The type of the elements in the input array.
 *
 * @param array The array to drop elements from.
 * @param predicate The function to test each element for a condition.
 *
 * @returns A new array that drops all elements until the first element that
 * does not match the given predicate.
 *
 * @example Basic usage
 * ```ts
 * import { dropWhile } from "@std/collections/drop-while";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const numbers = [3, 2, 5, 2, 5];
 * const dropWhileNumbers = dropWhile(numbers, (number) => number !== 2);
 *
 * assertEquals(dropWhileNumbers, [2, 5, 2, 5]);
 * ```
 */ export function dropWhile(array, predicate) {
  let offset = 0;
  const length = array.length;
  while(length > offset && predicate(array[offset])){
    offset++;
  }
  return array.slice(offset, length);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9kcm9wX3doaWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogUmV0dXJucyBhIG5ldyBhcnJheSB0aGF0IGRyb3BzIGFsbCBlbGVtZW50cyBpbiB0aGUgZ2l2ZW4gY29sbGVjdGlvbiB1bnRpbCB0aGVcbiAqIGZpcnN0IGVsZW1lbnQgdGhhdCBkb2VzIG5vdCBtYXRjaCB0aGUgZ2l2ZW4gcHJlZGljYXRlLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0eXBlIG9mIHRoZSBlbGVtZW50cyBpbiB0aGUgaW5wdXQgYXJyYXkuXG4gKlxuICogQHBhcmFtIGFycmF5IFRoZSBhcnJheSB0byBkcm9wIGVsZW1lbnRzIGZyb20uXG4gKiBAcGFyYW0gcHJlZGljYXRlIFRoZSBmdW5jdGlvbiB0byB0ZXN0IGVhY2ggZWxlbWVudCBmb3IgYSBjb25kaXRpb24uXG4gKlxuICogQHJldHVybnMgQSBuZXcgYXJyYXkgdGhhdCBkcm9wcyBhbGwgZWxlbWVudHMgdW50aWwgdGhlIGZpcnN0IGVsZW1lbnQgdGhhdFxuICogZG9lcyBub3QgbWF0Y2ggdGhlIGdpdmVuIHByZWRpY2F0ZS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGRyb3BXaGlsZSB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL2Ryb3Atd2hpbGVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgbnVtYmVycyA9IFszLCAyLCA1LCAyLCA1XTtcbiAqIGNvbnN0IGRyb3BXaGlsZU51bWJlcnMgPSBkcm9wV2hpbGUobnVtYmVycywgKG51bWJlcikgPT4gbnVtYmVyICE9PSAyKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZHJvcFdoaWxlTnVtYmVycywgWzIsIDUsIDIsIDVdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZHJvcFdoaWxlPFQ+KFxuICBhcnJheTogcmVhZG9ubHkgVFtdLFxuICBwcmVkaWNhdGU6IChlbDogVCkgPT4gYm9vbGVhbixcbik6IFRbXSB7XG4gIGxldCBvZmZzZXQgPSAwO1xuICBjb25zdCBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKGxlbmd0aCA+IG9mZnNldCAmJiBwcmVkaWNhdGUoYXJyYXlbb2Zmc2V0XSBhcyBUKSkge1xuICAgIG9mZnNldCsrO1xuICB9XG5cbiAgcmV0dXJuIGFycmF5LnNsaWNlKG9mZnNldCwgbGVuZ3RoKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0JDLEdBQ0QsT0FBTyxTQUFTLFVBQ2QsS0FBbUIsRUFDbkIsU0FBNkI7RUFFN0IsSUFBSSxTQUFTO0VBQ2IsTUFBTSxTQUFTLE1BQU0sTUFBTTtFQUUzQixNQUFPLFNBQVMsVUFBVSxVQUFVLEtBQUssQ0FBQyxPQUFPLEVBQVE7SUFDdkQ7RUFDRjtFQUVBLE9BQU8sTUFBTSxLQUFLLENBQUMsUUFBUTtBQUM3QiJ9
// denoCacheMetadata=7428371387438619530,12338445471950245890