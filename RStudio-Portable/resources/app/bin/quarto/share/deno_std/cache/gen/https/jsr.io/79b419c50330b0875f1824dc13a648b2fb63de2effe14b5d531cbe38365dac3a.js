// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Applies the given selector to all elements in the given collection and
 * calculates the sum of the results.
 *
 * @template T The type of the array elements.
 *
 * @param array The array to calculate the sum of.
 * @param selector The selector function to get the value to sum.
 *
 * @returns The sum of all elements in the collection.
 *
 * @example Basic usage
 * ```ts
 * import { sumOf } from "@std/collections/sum-of";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const people = [
 *   { name: "Anna", age: 34 },
 *   { name: "Kim", age: 42 },
 *   { name: "John", age: 23 },
 * ];
 *
 * const totalAge = sumOf(people, (person) => person.age);
 *
 * assertEquals(totalAge, 99);
 * ```
 */ export function sumOf(array, selector) {
  let sum = 0;
  for (const i of array){
    sum += selector(i);
  }
  return sum;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9zdW1fb2YudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBnaXZlbiBzZWxlY3RvciB0byBhbGwgZWxlbWVudHMgaW4gdGhlIGdpdmVuIGNvbGxlY3Rpb24gYW5kXG4gKiBjYWxjdWxhdGVzIHRoZSBzdW0gb2YgdGhlIHJlc3VsdHMuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGhlIGFycmF5IGVsZW1lbnRzLlxuICpcbiAqIEBwYXJhbSBhcnJheSBUaGUgYXJyYXkgdG8gY2FsY3VsYXRlIHRoZSBzdW0gb2YuXG4gKiBAcGFyYW0gc2VsZWN0b3IgVGhlIHNlbGVjdG9yIGZ1bmN0aW9uIHRvIGdldCB0aGUgdmFsdWUgdG8gc3VtLlxuICpcbiAqIEByZXR1cm5zIFRoZSBzdW0gb2YgYWxsIGVsZW1lbnRzIGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgc3VtT2YgfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9ucy9zdW0tb2ZcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgcGVvcGxlID0gW1xuICogICB7IG5hbWU6IFwiQW5uYVwiLCBhZ2U6IDM0IH0sXG4gKiAgIHsgbmFtZTogXCJLaW1cIiwgYWdlOiA0MiB9LFxuICogICB7IG5hbWU6IFwiSm9oblwiLCBhZ2U6IDIzIH0sXG4gKiBdO1xuICpcbiAqIGNvbnN0IHRvdGFsQWdlID0gc3VtT2YocGVvcGxlLCAocGVyc29uKSA9PiBwZXJzb24uYWdlKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHModG90YWxBZ2UsIDk5KTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VtT2Y8VD4oXG4gIGFycmF5OiBJdGVyYWJsZTxUPixcbiAgc2VsZWN0b3I6IChlbDogVCkgPT4gbnVtYmVyLFxuKTogbnVtYmVyIHtcbiAgbGV0IHN1bSA9IDA7XG5cbiAgZm9yIChjb25zdCBpIG9mIGFycmF5KSB7XG4gICAgc3VtICs9IHNlbGVjdG9yKGkpO1xuICB9XG5cbiAgcmV0dXJuIHN1bTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTBCQyxHQUNELE9BQU8sU0FBUyxNQUNkLEtBQWtCLEVBQ2xCLFFBQTJCO0VBRTNCLElBQUksTUFBTTtFQUVWLEtBQUssTUFBTSxLQUFLLE1BQU87SUFDckIsT0FBTyxTQUFTO0VBQ2xCO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=16064813693489538012,13561166678764855029