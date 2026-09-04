// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns the first element having the largest value according to the provided
 * comparator or undefined if there are no elements.
 *
 * The comparator is expected to work exactly like one passed to `Array.sort`,
 * which means that `comparator(a, b)` should return a negative number if
 * `a < b`, a positive number if `a > b` and `0` if `a === b`.
 *
 * @template T The type of the elements in the array.
 *
 * @param array The array to find the maximum element in.
 * @param comparator The function to compare elements.
 *
 * @returns The first element that is the largest value of the given function or
 * undefined if there are no elements.
 *
 * @example Basic usage
 * ```ts
 * import { maxWith } from "@std/collections/max-with";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const people = ["Kim", "Anna", "John", "Arthur"];
 * const largestName = maxWith(people, (a, b) => a.length - b.length);
 *
 * assertEquals(largestName, "Arthur");
 * ```
 */ export function maxWith(array, comparator) {
  let max;
  let isFirst = true;
  for (const current of array){
    if (isFirst || comparator(current, max) > 0) {
      max = current;
      isFirst = false;
    }
  }
  return max;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9tYXhfd2l0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IGVsZW1lbnQgaGF2aW5nIHRoZSBsYXJnZXN0IHZhbHVlIGFjY29yZGluZyB0byB0aGUgcHJvdmlkZWRcbiAqIGNvbXBhcmF0b3Igb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBubyBlbGVtZW50cy5cbiAqXG4gKiBUaGUgY29tcGFyYXRvciBpcyBleHBlY3RlZCB0byB3b3JrIGV4YWN0bHkgbGlrZSBvbmUgcGFzc2VkIHRvIGBBcnJheS5zb3J0YCxcbiAqIHdoaWNoIG1lYW5zIHRoYXQgYGNvbXBhcmF0b3IoYSwgYilgIHNob3VsZCByZXR1cm4gYSBuZWdhdGl2ZSBudW1iZXIgaWZcbiAqIGBhIDwgYmAsIGEgcG9zaXRpdmUgbnVtYmVyIGlmIGBhID4gYmAgYW5kIGAwYCBpZiBgYSA9PT0gYmAuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBhcnJheS5cbiAqXG4gKiBAcGFyYW0gYXJyYXkgVGhlIGFycmF5IHRvIGZpbmQgdGhlIG1heGltdW0gZWxlbWVudCBpbi5cbiAqIEBwYXJhbSBjb21wYXJhdG9yIFRoZSBmdW5jdGlvbiB0byBjb21wYXJlIGVsZW1lbnRzLlxuICpcbiAqIEByZXR1cm5zIFRoZSBmaXJzdCBlbGVtZW50IHRoYXQgaXMgdGhlIGxhcmdlc3QgdmFsdWUgb2YgdGhlIGdpdmVuIGZ1bmN0aW9uIG9yXG4gKiB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG5vIGVsZW1lbnRzLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgbWF4V2l0aCB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL21heC13aXRoXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHBlb3BsZSA9IFtcIktpbVwiLCBcIkFubmFcIiwgXCJKb2huXCIsIFwiQXJ0aHVyXCJdO1xuICogY29uc3QgbGFyZ2VzdE5hbWUgPSBtYXhXaXRoKHBlb3BsZSwgKGEsIGIpID0+IGEubGVuZ3RoIC0gYi5sZW5ndGgpO1xuICpcbiAqIGFzc2VydEVxdWFscyhsYXJnZXN0TmFtZSwgXCJBcnRodXJcIik7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heFdpdGg8VD4oXG4gIGFycmF5OiBJdGVyYWJsZTxUPixcbiAgY29tcGFyYXRvcjogKGE6IFQsIGI6IFQpID0+IG51bWJlcixcbik6IFQgfCB1bmRlZmluZWQge1xuICBsZXQgbWF4OiBUIHwgdW5kZWZpbmVkO1xuICBsZXQgaXNGaXJzdCA9IHRydWU7XG5cbiAgZm9yIChjb25zdCBjdXJyZW50IG9mIGFycmF5KSB7XG4gICAgaWYgKGlzRmlyc3QgfHwgY29tcGFyYXRvcihjdXJyZW50LCA8VD4gbWF4KSA+IDApIHtcbiAgICAgIG1heCA9IGN1cnJlbnQ7XG4gICAgICBpc0ZpcnN0ID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1heDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTBCQyxHQUNELE9BQU8sU0FBUyxRQUNkLEtBQWtCLEVBQ2xCLFVBQWtDO0VBRWxDLElBQUk7RUFDSixJQUFJLFVBQVU7RUFFZCxLQUFLLE1BQU0sV0FBVyxNQUFPO0lBQzNCLElBQUksV0FBVyxXQUFXLFNBQWEsT0FBTyxHQUFHO01BQy9DLE1BQU07TUFDTixVQUFVO0lBQ1o7RUFDRjtFQUVBLE9BQU87QUFDVCJ9
// denoCacheMetadata=2361923396190627050,11687204401332407091