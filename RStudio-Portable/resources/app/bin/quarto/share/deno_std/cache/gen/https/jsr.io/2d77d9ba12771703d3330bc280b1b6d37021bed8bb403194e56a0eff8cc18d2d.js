// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns a new record with all entries of the given record except the ones that
 * have a key that does not match the given predicate.
 *
 * @template T The type of the values in the input record.
 *
 * @param record The record to filter keys from.
 * @param predicate The function to test each key for a condition.
 *
 * @returns A new record with all entries that have a key that matches the given
 * predicate.
 *
 * @example Basic usage
 * ```ts
 * import { filterKeys } from "@std/collections/filter-keys";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const menu = {
 *   Salad: 11,
 *   Soup: 8,
 *   Pasta: 13,
 * };
 *
 * const menuWithoutSalad = filterKeys(menu, (item) => item !== "Salad");
 *
 * assertEquals(
 *   menuWithoutSalad,
 *   {
 *     Soup: 8,
 *     Pasta: 13,
 *   },
 * );
 * ```
 */ export function filterKeys(record, predicate) {
  const result = {};
  for (const [key, value] of Object.entries(record)){
    if (predicate(key)) {
      result[key] = value;
    }
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9maWx0ZXJfa2V5cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgYSBuZXcgcmVjb3JkIHdpdGggYWxsIGVudHJpZXMgb2YgdGhlIGdpdmVuIHJlY29yZCBleGNlcHQgdGhlIG9uZXMgdGhhdFxuICogaGF2ZSBhIGtleSB0aGF0IGRvZXMgbm90IG1hdGNoIHRoZSBnaXZlbiBwcmVkaWNhdGUuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGhlIHZhbHVlcyBpbiB0aGUgaW5wdXQgcmVjb3JkLlxuICpcbiAqIEBwYXJhbSByZWNvcmQgVGhlIHJlY29yZCB0byBmaWx0ZXIga2V5cyBmcm9tLlxuICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gdG8gdGVzdCBlYWNoIGtleSBmb3IgYSBjb25kaXRpb24uXG4gKlxuICogQHJldHVybnMgQSBuZXcgcmVjb3JkIHdpdGggYWxsIGVudHJpZXMgdGhhdCBoYXZlIGEga2V5IHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW5cbiAqIHByZWRpY2F0ZS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGZpbHRlcktleXMgfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9ucy9maWx0ZXIta2V5c1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBtZW51ID0ge1xuICogICBTYWxhZDogMTEsXG4gKiAgIFNvdXA6IDgsXG4gKiAgIFBhc3RhOiAxMyxcbiAqIH07XG4gKlxuICogY29uc3QgbWVudVdpdGhvdXRTYWxhZCA9IGZpbHRlcktleXMobWVudSwgKGl0ZW0pID0+IGl0ZW0gIT09IFwiU2FsYWRcIik7XG4gKlxuICogYXNzZXJ0RXF1YWxzKFxuICogICBtZW51V2l0aG91dFNhbGFkLFxuICogICB7XG4gKiAgICAgU291cDogOCxcbiAqICAgICBQYXN0YTogMTMsXG4gKiAgIH0sXG4gKiApO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJLZXlzPFQ+KFxuICByZWNvcmQ6IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIFQ+PixcbiAgcHJlZGljYXRlOiAoa2V5OiBzdHJpbmcpID0+IGJvb2xlYW4sXG4pOiBSZWNvcmQ8c3RyaW5nLCBUPiB7XG4gIGNvbnN0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgVD4gPSB7fTtcblxuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhyZWNvcmQpKSB7XG4gICAgaWYgKHByZWRpY2F0ZShrZXkpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaUNDLEdBQ0QsT0FBTyxTQUFTLFdBQ2QsTUFBbUMsRUFDbkMsU0FBbUM7RUFFbkMsTUFBTSxTQUE0QixDQUFDO0VBRW5DLEtBQUssTUFBTSxDQUFDLEtBQUssTUFBTSxJQUFJLE9BQU8sT0FBTyxDQUFDLFFBQVM7SUFDakQsSUFBSSxVQUFVLE1BQU07TUFDbEIsTUFBTSxDQUFDLElBQUksR0FBRztJQUNoQjtFQUNGO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=6282108073744636607,12648456847162197568