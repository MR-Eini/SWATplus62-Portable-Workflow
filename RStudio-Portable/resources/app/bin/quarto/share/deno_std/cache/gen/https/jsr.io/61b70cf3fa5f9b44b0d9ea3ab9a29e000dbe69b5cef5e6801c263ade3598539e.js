// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { randomInteger } from "./_utils.ts";
/**
 * Returns a random element from the given array.
 *
 * @template T The type of the elements in the array.
 * @template O The type of the accumulator.
 *
 * @param array The array to sample from.
 *
 * @returns A random element from the given array, or `undefined` if the array
 * is empty.
 *
 * @example Basic usage
 * ```ts
 * import { sample } from "@std/collections/sample";
 * import { assertArrayIncludes } from "@std/assert/assert-array-includes";
 *
 * const numbers = [1, 2, 3, 4];
 * const random = sample(numbers);
 *
 * assertArrayIncludes(numbers, [random]);
 * ```
 */ export function sample(array) {
  const length = array.length;
  return length ? array[randomInteger(0, length - 1)] : undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9zYW1wbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgcmFuZG9tSW50ZWdlciB9IGZyb20gXCIuL191dGlscy50c1wiO1xuXG4vKipcbiAqIFJldHVybnMgYSByYW5kb20gZWxlbWVudCBmcm9tIHRoZSBnaXZlbiBhcnJheS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdHlwZSBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIGFycmF5LlxuICogQHRlbXBsYXRlIE8gVGhlIHR5cGUgb2YgdGhlIGFjY3VtdWxhdG9yLlxuICpcbiAqIEBwYXJhbSBhcnJheSBUaGUgYXJyYXkgdG8gc2FtcGxlIGZyb20uXG4gKlxuICogQHJldHVybnMgQSByYW5kb20gZWxlbWVudCBmcm9tIHRoZSBnaXZlbiBhcnJheSwgb3IgYHVuZGVmaW5lZGAgaWYgdGhlIGFycmF5XG4gKiBpcyBlbXB0eS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHNhbXBsZSB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL3NhbXBsZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0QXJyYXlJbmNsdWRlcyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtYXJyYXktaW5jbHVkZXNcIjtcbiAqXG4gKiBjb25zdCBudW1iZXJzID0gWzEsIDIsIDMsIDRdO1xuICogY29uc3QgcmFuZG9tID0gc2FtcGxlKG51bWJlcnMpO1xuICpcbiAqIGFzc2VydEFycmF5SW5jbHVkZXMobnVtYmVycywgW3JhbmRvbV0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW1wbGU8VD4oYXJyYXk6IHJlYWRvbmx5IFRbXSk6IFQgfCB1bmRlZmluZWQge1xuICBjb25zdCBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gIHJldHVybiBsZW5ndGggPyBhcnJheVtyYW5kb21JbnRlZ2VyKDAsIGxlbmd0aCAtIDEpXSA6IHVuZGVmaW5lZDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsYUFBYSxRQUFRLGNBQWM7QUFFNUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCQyxHQUNELE9BQU8sU0FBUyxPQUFVLEtBQW1CO0VBQzNDLE1BQU0sU0FBUyxNQUFNLE1BQU07RUFDM0IsT0FBTyxTQUFTLEtBQUssQ0FBQyxjQUFjLEdBQUcsU0FBUyxHQUFHLEdBQUc7QUFDeEQifQ==
// denoCacheMetadata=7288427898296459516,17607026214599192665