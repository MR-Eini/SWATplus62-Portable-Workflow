// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns a new record with all entries of the given record except the ones
 * that do not match the given predicate.
 *
 * @template T The type of the values in the input record.
 *
 * @param record The record to filter entries from.
 * @param predicate The function to test each entry for a condition.
 *
 * @returns A new record with all entries that match the given predicate.
 *
 * @example Basic usage
 * ```ts
 * import { filterEntries } from "@std/collections/filter-entries";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const menu = {
 *   Salad: 11,
 *   Soup: 8,
 *   Pasta: 13,
 * };
 *
 * const myOptions = filterEntries(
 *   menu,
 *   ([item, price]) => item !== "Pasta" && price < 10,
 * );
 *
 * assertEquals(myOptions, { Soup: 8 });
 * ```
 */ export function filterEntries(record, predicate) {
  const result = {};
  const entries = Object.entries(record);
  for (const [key, value] of entries){
    if (predicate([
      key,
      value
    ])) {
      result[key] = value;
    }
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9maWx0ZXJfZW50cmllcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgYSBuZXcgcmVjb3JkIHdpdGggYWxsIGVudHJpZXMgb2YgdGhlIGdpdmVuIHJlY29yZCBleGNlcHQgdGhlIG9uZXNcbiAqIHRoYXQgZG8gbm90IG1hdGNoIHRoZSBnaXZlbiBwcmVkaWNhdGUuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGhlIHZhbHVlcyBpbiB0aGUgaW5wdXQgcmVjb3JkLlxuICpcbiAqIEBwYXJhbSByZWNvcmQgVGhlIHJlY29yZCB0byBmaWx0ZXIgZW50cmllcyBmcm9tLlxuICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gdG8gdGVzdCBlYWNoIGVudHJ5IGZvciBhIGNvbmRpdGlvbi5cbiAqXG4gKiBAcmV0dXJucyBBIG5ldyByZWNvcmQgd2l0aCBhbGwgZW50cmllcyB0aGF0IG1hdGNoIHRoZSBnaXZlbiBwcmVkaWNhdGUuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBmaWx0ZXJFbnRyaWVzIH0gZnJvbSBcIkBzdGQvY29sbGVjdGlvbnMvZmlsdGVyLWVudHJpZXNcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgbWVudSA9IHtcbiAqICAgU2FsYWQ6IDExLFxuICogICBTb3VwOiA4LFxuICogICBQYXN0YTogMTMsXG4gKiB9O1xuICpcbiAqIGNvbnN0IG15T3B0aW9ucyA9IGZpbHRlckVudHJpZXMoXG4gKiAgIG1lbnUsXG4gKiAgIChbaXRlbSwgcHJpY2VdKSA9PiBpdGVtICE9PSBcIlBhc3RhXCIgJiYgcHJpY2UgPCAxMCxcbiAqICk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKG15T3B0aW9ucywgeyBTb3VwOiA4IH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJFbnRyaWVzPFQ+KFxuICByZWNvcmQ6IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIFQ+PixcbiAgcHJlZGljYXRlOiAoZW50cnk6IFtzdHJpbmcsIFRdKSA9PiBib29sZWFuLFxuKTogUmVjb3JkPHN0cmluZywgVD4ge1xuICBjb25zdCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIFQ+ID0ge307XG4gIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhyZWNvcmQpO1xuXG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGVudHJpZXMpIHtcbiAgICBpZiAocHJlZGljYXRlKFtrZXksIHZhbHVlXSkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTZCQyxHQUNELE9BQU8sU0FBUyxjQUNkLE1BQW1DLEVBQ25DLFNBQTBDO0VBRTFDLE1BQU0sU0FBNEIsQ0FBQztFQUNuQyxNQUFNLFVBQVUsT0FBTyxPQUFPLENBQUM7RUFFL0IsS0FBSyxNQUFNLENBQUMsS0FBSyxNQUFNLElBQUksUUFBUztJQUNsQyxJQUFJLFVBQVU7TUFBQztNQUFLO0tBQU0sR0FBRztNQUMzQixNQUFNLENBQUMsSUFBSSxHQUFHO0lBQ2hCO0VBQ0Y7RUFFQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=3179092900398819898,15042536165145934570