// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns an element if and only if that element is the only one matching the
 * given condition. Returns `undefined` otherwise.
 *
 * @template T The type of the elements in the input array.
 *
 * @param array The array to find a single element in.
 * @param predicate The function to test each element for a condition.
 *
 * @returns The single element that matches the given condition or `undefined`
 * if there are zero or more than one matching elements.
 *
 * @example Basic usage
 * ```ts
 * import { findSingle } from "@std/collections/find-single";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const bookings = [
 *   { month: "January", active: false },
 *   { month: "March", active: false },
 *   { month: "June", active: true },
 * ];
 * const activeBooking = findSingle(bookings, (booking) => booking.active);
 * const inactiveBooking = findSingle(bookings, (booking) => !booking.active);
 *
 * assertEquals(activeBooking, { month: "June", active: true });
 * assertEquals(inactiveBooking, undefined); // There are two applicable items
 * ```
 */ export function findSingle(array, predicate) {
  let match;
  let found = false;
  for (const element of array){
    if (predicate(element)) {
      if (found) return undefined;
      found = true;
      match = element;
    }
  }
  return match;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9maW5kX3NpbmdsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgYW4gZWxlbWVudCBpZiBhbmQgb25seSBpZiB0aGF0IGVsZW1lbnQgaXMgdGhlIG9ubHkgb25lIG1hdGNoaW5nIHRoZVxuICogZ2l2ZW4gY29uZGl0aW9uLiBSZXR1cm5zIGB1bmRlZmluZWRgIG90aGVyd2lzZS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdHlwZSBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIGlucHV0IGFycmF5LlxuICpcbiAqIEBwYXJhbSBhcnJheSBUaGUgYXJyYXkgdG8gZmluZCBhIHNpbmdsZSBlbGVtZW50IGluLlxuICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gdG8gdGVzdCBlYWNoIGVsZW1lbnQgZm9yIGEgY29uZGl0aW9uLlxuICpcbiAqIEByZXR1cm5zIFRoZSBzaW5nbGUgZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIGdpdmVuIGNvbmRpdGlvbiBvciBgdW5kZWZpbmVkYFxuICogaWYgdGhlcmUgYXJlIHplcm8gb3IgbW9yZSB0aGFuIG9uZSBtYXRjaGluZyBlbGVtZW50cy5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGZpbmRTaW5nbGUgfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9ucy9maW5kLXNpbmdsZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBib29raW5ncyA9IFtcbiAqICAgeyBtb250aDogXCJKYW51YXJ5XCIsIGFjdGl2ZTogZmFsc2UgfSxcbiAqICAgeyBtb250aDogXCJNYXJjaFwiLCBhY3RpdmU6IGZhbHNlIH0sXG4gKiAgIHsgbW9udGg6IFwiSnVuZVwiLCBhY3RpdmU6IHRydWUgfSxcbiAqIF07XG4gKiBjb25zdCBhY3RpdmVCb29raW5nID0gZmluZFNpbmdsZShib29raW5ncywgKGJvb2tpbmcpID0+IGJvb2tpbmcuYWN0aXZlKTtcbiAqIGNvbnN0IGluYWN0aXZlQm9va2luZyA9IGZpbmRTaW5nbGUoYm9va2luZ3MsIChib29raW5nKSA9PiAhYm9va2luZy5hY3RpdmUpO1xuICpcbiAqIGFzc2VydEVxdWFscyhhY3RpdmVCb29raW5nLCB7IG1vbnRoOiBcIkp1bmVcIiwgYWN0aXZlOiB0cnVlIH0pO1xuICogYXNzZXJ0RXF1YWxzKGluYWN0aXZlQm9va2luZywgdW5kZWZpbmVkKTsgLy8gVGhlcmUgYXJlIHR3byBhcHBsaWNhYmxlIGl0ZW1zXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRTaW5nbGU8VD4oXG4gIGFycmF5OiBJdGVyYWJsZTxUPixcbiAgcHJlZGljYXRlOiAoZWw6IFQpID0+IGJvb2xlYW4sXG4pOiBUIHwgdW5kZWZpbmVkIHtcbiAgbGV0IG1hdGNoOiBUIHwgdW5kZWZpbmVkO1xuICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgZm9yIChjb25zdCBlbGVtZW50IG9mIGFycmF5KSB7XG4gICAgaWYgKHByZWRpY2F0ZShlbGVtZW50KSkge1xuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgbWF0Y2ggPSBlbGVtZW50O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXRjaDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNEJDLEdBQ0QsT0FBTyxTQUFTLFdBQ2QsS0FBa0IsRUFDbEIsU0FBNkI7RUFFN0IsSUFBSTtFQUNKLElBQUksUUFBUTtFQUNaLEtBQUssTUFBTSxXQUFXLE1BQU87SUFDM0IsSUFBSSxVQUFVLFVBQVU7TUFDdEIsSUFBSSxPQUFPLE9BQU87TUFDbEIsUUFBUTtNQUNSLFFBQVE7SUFDVjtFQUNGO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=17807739063671610532,11171854321966656482