// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns an array excluding all given values.
 *
 * @template T The type of the array elements.
 *
 * @param array The array to exclude values from.
 * @param values The values to exclude from the array.
 *
 * @returns A new array containing all elements from the given array except the
 * ones that are in the values array.
 *
 * @example Basic usage
 * ```ts
 * import { withoutAll } from "@std/collections/without-all";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const withoutList = withoutAll([2, 1, 2, 3], [1, 2]);
 *
 * assertEquals(withoutList, [3]);
 * ```
 */ export function withoutAll(array, values) {
  const toExclude = new Set(values);
  return array.filter((it)=>!toExclude.has(it));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi93aXRob3V0X2FsbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgZXhjbHVkaW5nIGFsbCBnaXZlbiB2YWx1ZXMuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGhlIGFycmF5IGVsZW1lbnRzLlxuICpcbiAqIEBwYXJhbSBhcnJheSBUaGUgYXJyYXkgdG8gZXhjbHVkZSB2YWx1ZXMgZnJvbS5cbiAqIEBwYXJhbSB2YWx1ZXMgVGhlIHZhbHVlcyB0byBleGNsdWRlIGZyb20gdGhlIGFycmF5LlxuICpcbiAqIEByZXR1cm5zIEEgbmV3IGFycmF5IGNvbnRhaW5pbmcgYWxsIGVsZW1lbnRzIGZyb20gdGhlIGdpdmVuIGFycmF5IGV4Y2VwdCB0aGVcbiAqIG9uZXMgdGhhdCBhcmUgaW4gdGhlIHZhbHVlcyBhcnJheS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHdpdGhvdXRBbGwgfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9ucy93aXRob3V0LWFsbFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCB3aXRob3V0TGlzdCA9IHdpdGhvdXRBbGwoWzIsIDEsIDIsIDNdLCBbMSwgMl0pO1xuICpcbiAqIGFzc2VydEVxdWFscyh3aXRob3V0TGlzdCwgWzNdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aG91dEFsbDxUPihhcnJheTogcmVhZG9ubHkgVFtdLCB2YWx1ZXM6IHJlYWRvbmx5IFRbXSk6IFRbXSB7XG4gIGNvbnN0IHRvRXhjbHVkZSA9IG5ldyBTZXQodmFsdWVzKTtcbiAgcmV0dXJuIGFycmF5LmZpbHRlcigoaXQpID0+ICF0b0V4Y2x1ZGUuaGFzKGl0KSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvQkMsR0FDRCxPQUFPLFNBQVMsV0FBYyxLQUFtQixFQUFFLE1BQW9CO0VBQ3JFLE1BQU0sWUFBWSxJQUFJLElBQUk7RUFDMUIsT0FBTyxNQUFNLE1BQU0sQ0FBQyxDQUFDLEtBQU8sQ0FBQyxVQUFVLEdBQUcsQ0FBQztBQUM3QyJ9
// denoCacheMetadata=1769054621009237128,3332373179003151850