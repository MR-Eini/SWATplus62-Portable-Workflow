// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Associates each element of an array with a value returned by a selector
 * function.
 *
 * If any of two pairs would have the same value the latest on will be used
 * (overriding the ones before it).
 *
 * @template T The type of the values returned by the selector function.
 *
 * @param array The array of elements to associate with values.
 * @param selector The selector function that returns a value for each element.
 *
 * @returns An object where each element of the array is associated with a value
 * returned by the selector function.
 *
 * @example Basic usage
 * ```ts
 * import { associateWith } from "@std/collections/associate-with";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const names = ["Kim", "Lara", "Jonathan"];
 *
 * const namesToLength = associateWith(names, (person) => person.length);
 *
 * assertEquals(namesToLength, {
 *   "Kim": 3,
 *   "Lara": 4,
 *   "Jonathan": 8,
 * });
 * ```
 */ export function associateWith(array, selector) {
  const result = {};
  for (const element of array){
    result[element] = selector(element);
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9hc3NvY2lhdGVfd2l0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIEFzc29jaWF0ZXMgZWFjaCBlbGVtZW50IG9mIGFuIGFycmF5IHdpdGggYSB2YWx1ZSByZXR1cm5lZCBieSBhIHNlbGVjdG9yXG4gKiBmdW5jdGlvbi5cbiAqXG4gKiBJZiBhbnkgb2YgdHdvIHBhaXJzIHdvdWxkIGhhdmUgdGhlIHNhbWUgdmFsdWUgdGhlIGxhdGVzdCBvbiB3aWxsIGJlIHVzZWRcbiAqIChvdmVycmlkaW5nIHRoZSBvbmVzIGJlZm9yZSBpdCkuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGhlIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgc2VsZWN0b3IgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIGFycmF5IFRoZSBhcnJheSBvZiBlbGVtZW50cyB0byBhc3NvY2lhdGUgd2l0aCB2YWx1ZXMuXG4gKiBAcGFyYW0gc2VsZWN0b3IgVGhlIHNlbGVjdG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHZhbHVlIGZvciBlYWNoIGVsZW1lbnQuXG4gKlxuICogQHJldHVybnMgQW4gb2JqZWN0IHdoZXJlIGVhY2ggZWxlbWVudCBvZiB0aGUgYXJyYXkgaXMgYXNzb2NpYXRlZCB3aXRoIGEgdmFsdWVcbiAqIHJldHVybmVkIGJ5IHRoZSBzZWxlY3RvciBmdW5jdGlvbi5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGFzc29jaWF0ZVdpdGggfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9ucy9hc3NvY2lhdGUtd2l0aFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBuYW1lcyA9IFtcIktpbVwiLCBcIkxhcmFcIiwgXCJKb25hdGhhblwiXTtcbiAqXG4gKiBjb25zdCBuYW1lc1RvTGVuZ3RoID0gYXNzb2NpYXRlV2l0aChuYW1lcywgKHBlcnNvbikgPT4gcGVyc29uLmxlbmd0aCk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKG5hbWVzVG9MZW5ndGgsIHtcbiAqICAgXCJLaW1cIjogMyxcbiAqICAgXCJMYXJhXCI6IDQsXG4gKiAgIFwiSm9uYXRoYW5cIjogOCxcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NvY2lhdGVXaXRoPFQ+KFxuICBhcnJheTogSXRlcmFibGU8c3RyaW5nPixcbiAgc2VsZWN0b3I6IChrZXk6IHN0cmluZykgPT4gVCxcbik6IFJlY29yZDxzdHJpbmcsIFQ+IHtcbiAgY29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBUPiA9IHt9O1xuXG4gIGZvciAoY29uc3QgZWxlbWVudCBvZiBhcnJheSkge1xuICAgIHJlc3VsdFtlbGVtZW50XSA9IHNlbGVjdG9yKGVsZW1lbnQpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E4QkMsR0FDRCxPQUFPLFNBQVMsY0FDZCxLQUF1QixFQUN2QixRQUE0QjtFQUU1QixNQUFNLFNBQTRCLENBQUM7RUFFbkMsS0FBSyxNQUFNLFdBQVcsTUFBTztJQUMzQixNQUFNLENBQUMsUUFBUSxHQUFHLFNBQVM7RUFDN0I7RUFFQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=3034166049976302629,6178771792515357013