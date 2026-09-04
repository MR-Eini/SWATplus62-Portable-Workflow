// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns all distinct elements in the given array, preserving order by first
 * occurrence.
 *
 * @template T The type of the elements in the input array.
 *
 * @param array The array to filter for distinct elements.
 *
 * @returns An array of distinct elements in the input array.
 *
 * @example Basic usage
 * ```ts
 * import { distinct } from "@std/collections/distinct";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const numbers = [3, 2, 5, 2, 5];
 * const distinctNumbers = distinct(numbers);
 *
 * assertEquals(distinctNumbers, [3, 2, 5]);
 * ```
 */ export function distinct(array) {
  const set = new Set(array);
  return Array.from(set);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9kaXN0aW5jdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgYWxsIGRpc3RpbmN0IGVsZW1lbnRzIGluIHRoZSBnaXZlbiBhcnJheSwgcHJlc2VydmluZyBvcmRlciBieSBmaXJzdFxuICogb2NjdXJyZW5jZS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdHlwZSBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIGlucHV0IGFycmF5LlxuICpcbiAqIEBwYXJhbSBhcnJheSBUaGUgYXJyYXkgdG8gZmlsdGVyIGZvciBkaXN0aW5jdCBlbGVtZW50cy5cbiAqXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBkaXN0aW5jdCBlbGVtZW50cyBpbiB0aGUgaW5wdXQgYXJyYXkuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkaXN0aW5jdCB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL2Rpc3RpbmN0XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IG51bWJlcnMgPSBbMywgMiwgNSwgMiwgNV07XG4gKiBjb25zdCBkaXN0aW5jdE51bWJlcnMgPSBkaXN0aW5jdChudW1iZXJzKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZGlzdGluY3ROdW1iZXJzLCBbMywgMiwgNV0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0aW5jdDxUPihhcnJheTogSXRlcmFibGU8VD4pOiBUW10ge1xuICBjb25zdCBzZXQgPSBuZXcgU2V0KGFycmF5KTtcblxuICByZXR1cm4gQXJyYXkuZnJvbShzZXQpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0JDLEdBQ0QsT0FBTyxTQUFTLFNBQVksS0FBa0I7RUFDNUMsTUFBTSxNQUFNLElBQUksSUFBSTtFQUVwQixPQUFPLE1BQU0sSUFBSSxDQUFDO0FBQ3BCIn0=
// denoCacheMetadata=13167191609257901815,14478072658213424977