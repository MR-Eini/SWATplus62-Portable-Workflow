// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Calls the given reducer on each element of the given collection, passing its
 * result as the accumulator to the next respective call, starting with the
 * given initialValue. Returns all intermediate accumulator results.
 *
 * @template T The type of the elements in the array.
 * @template O The type of the accumulator.
 *
 * @param array The array to reduce.
 * @param reducer The reducer function to apply to each element.
 * @param initialValue The initial value of the accumulator.
 *
 * @returns An array of all intermediate accumulator results.
 *
 * @example Basic usage
 * ```ts
 * import { runningReduce } from "@std/collections/running-reduce";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const numbers = [1, 2, 3, 4, 5];
 * const sumSteps = runningReduce(numbers, (sum, current) => sum + current, 0);
 *
 * assertEquals(sumSteps, [1, 3, 6, 10, 15]);
 * ```
 */ export function runningReduce(array, reducer, initialValue) {
  let currentResult = initialValue;
  return array.map((el, currentIndex)=>currentResult = reducer(currentResult, el, currentIndex));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9ydW5uaW5nX3JlZHVjZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIENhbGxzIHRoZSBnaXZlbiByZWR1Y2VyIG9uIGVhY2ggZWxlbWVudCBvZiB0aGUgZ2l2ZW4gY29sbGVjdGlvbiwgcGFzc2luZyBpdHNcbiAqIHJlc3VsdCBhcyB0aGUgYWNjdW11bGF0b3IgdG8gdGhlIG5leHQgcmVzcGVjdGl2ZSBjYWxsLCBzdGFydGluZyB3aXRoIHRoZVxuICogZ2l2ZW4gaW5pdGlhbFZhbHVlLiBSZXR1cm5zIGFsbCBpbnRlcm1lZGlhdGUgYWNjdW11bGF0b3IgcmVzdWx0cy5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdHlwZSBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIGFycmF5LlxuICogQHRlbXBsYXRlIE8gVGhlIHR5cGUgb2YgdGhlIGFjY3VtdWxhdG9yLlxuICpcbiAqIEBwYXJhbSBhcnJheSBUaGUgYXJyYXkgdG8gcmVkdWNlLlxuICogQHBhcmFtIHJlZHVjZXIgVGhlIHJlZHVjZXIgZnVuY3Rpb24gdG8gYXBwbHkgdG8gZWFjaCBlbGVtZW50LlxuICogQHBhcmFtIGluaXRpYWxWYWx1ZSBUaGUgaW5pdGlhbCB2YWx1ZSBvZiB0aGUgYWNjdW11bGF0b3IuXG4gKlxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgYWxsIGludGVybWVkaWF0ZSBhY2N1bXVsYXRvciByZXN1bHRzLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcnVubmluZ1JlZHVjZSB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL3J1bm5pbmctcmVkdWNlXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IG51bWJlcnMgPSBbMSwgMiwgMywgNCwgNV07XG4gKiBjb25zdCBzdW1TdGVwcyA9IHJ1bm5pbmdSZWR1Y2UobnVtYmVycywgKHN1bSwgY3VycmVudCkgPT4gc3VtICsgY3VycmVudCwgMCk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKHN1bVN0ZXBzLCBbMSwgMywgNiwgMTAsIDE1XSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bm5pbmdSZWR1Y2U8VCwgTz4oXG4gIGFycmF5OiByZWFkb25seSBUW10sXG4gIHJlZHVjZXI6IChhY2N1bXVsYXRvcjogTywgY3VycmVudDogVCwgY3VycmVudEluZGV4OiBudW1iZXIpID0+IE8sXG4gIGluaXRpYWxWYWx1ZTogTyxcbik6IE9bXSB7XG4gIGxldCBjdXJyZW50UmVzdWx0ID0gaW5pdGlhbFZhbHVlO1xuICByZXR1cm4gYXJyYXkubWFwKChlbCwgY3VycmVudEluZGV4KSA9PlxuICAgIGN1cnJlbnRSZXN1bHQgPSByZWR1Y2VyKGN1cnJlbnRSZXN1bHQsIGVsLCBjdXJyZW50SW5kZXgpXG4gICk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0JDLEdBQ0QsT0FBTyxTQUFTLGNBQ2QsS0FBbUIsRUFDbkIsT0FBZ0UsRUFDaEUsWUFBZTtFQUVmLElBQUksZ0JBQWdCO0VBQ3BCLE9BQU8sTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLGVBQ3BCLGdCQUFnQixRQUFRLGVBQWUsSUFBSTtBQUUvQyJ9
// denoCacheMetadata=14760951290281650437,4330789344954120385