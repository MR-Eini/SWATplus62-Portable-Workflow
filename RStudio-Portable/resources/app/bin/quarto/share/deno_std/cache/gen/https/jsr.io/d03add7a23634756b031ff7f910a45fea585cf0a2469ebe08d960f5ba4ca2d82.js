// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns the first element having the smallest value according to the provided
 * comparator or undefined if there are no elements.
 *
 * @template T The type of the elements in the array.
 *
 * @param array The array to find the minimum element in.
 * @param comparator The function to compare elements.
 *
 * @returns The first element that is the smallest value of the given function
 * or undefined if there are no elements.
 *
 * @example Basic usage
 * ```ts
 * import { minWith } from "@std/collections/min-with";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const people = ["Kim", "Anna", "John"];
 * const smallestName = minWith(people, (a, b) => a.length - b.length);
 *
 * assertEquals(smallestName, "Kim");
 * ```
 */ export function minWith(array, comparator) {
  let min;
  let isFirst = true;
  for (const current of array){
    if (isFirst || comparator(current, min) < 0) {
      min = current;
      isFirst = false;
    }
  }
  return min;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9taW5fd2l0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IGVsZW1lbnQgaGF2aW5nIHRoZSBzbWFsbGVzdCB2YWx1ZSBhY2NvcmRpbmcgdG8gdGhlIHByb3ZpZGVkXG4gKiBjb21wYXJhdG9yIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbm8gZWxlbWVudHMuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBhcnJheS5cbiAqXG4gKiBAcGFyYW0gYXJyYXkgVGhlIGFycmF5IHRvIGZpbmQgdGhlIG1pbmltdW0gZWxlbWVudCBpbi5cbiAqIEBwYXJhbSBjb21wYXJhdG9yIFRoZSBmdW5jdGlvbiB0byBjb21wYXJlIGVsZW1lbnRzLlxuICpcbiAqIEByZXR1cm5zIFRoZSBmaXJzdCBlbGVtZW50IHRoYXQgaXMgdGhlIHNtYWxsZXN0IHZhbHVlIG9mIHRoZSBnaXZlbiBmdW5jdGlvblxuICogb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBubyBlbGVtZW50cy5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IG1pbldpdGggfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9ucy9taW4td2l0aFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBwZW9wbGUgPSBbXCJLaW1cIiwgXCJBbm5hXCIsIFwiSm9oblwiXTtcbiAqIGNvbnN0IHNtYWxsZXN0TmFtZSA9IG1pbldpdGgocGVvcGxlLCAoYSwgYikgPT4gYS5sZW5ndGggLSBiLmxlbmd0aCk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKHNtYWxsZXN0TmFtZSwgXCJLaW1cIik7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbldpdGg8VD4oXG4gIGFycmF5OiBJdGVyYWJsZTxUPixcbiAgY29tcGFyYXRvcjogKGE6IFQsIGI6IFQpID0+IG51bWJlcixcbik6IFQgfCB1bmRlZmluZWQge1xuICBsZXQgbWluOiBUIHwgdW5kZWZpbmVkO1xuICBsZXQgaXNGaXJzdCA9IHRydWU7XG5cbiAgZm9yIChjb25zdCBjdXJyZW50IG9mIGFycmF5KSB7XG4gICAgaWYgKGlzRmlyc3QgfHwgY29tcGFyYXRvcihjdXJyZW50LCA8VD4gbWluKSA8IDApIHtcbiAgICAgIG1pbiA9IGN1cnJlbnQ7XG4gICAgICBpc0ZpcnN0ID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1pbjtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0JDLEdBQ0QsT0FBTyxTQUFTLFFBQ2QsS0FBa0IsRUFDbEIsVUFBa0M7RUFFbEMsSUFBSTtFQUNKLElBQUksVUFBVTtFQUVkLEtBQUssTUFBTSxXQUFXLE1BQU87SUFDM0IsSUFBSSxXQUFXLFdBQVcsU0FBYSxPQUFPLEdBQUc7TUFDL0MsTUFBTTtNQUNOLFVBQVU7SUFDWjtFQUNGO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=17372799876172837291,11399972579617589671