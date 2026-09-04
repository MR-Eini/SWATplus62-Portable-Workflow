// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns a tuple of two records with the first one containing all entries of
 * the given record that match the given predicate and the second one containing
 * all that do not.
 *
 * @template T The type of the values in the record.
 *
 * @param record The record to partition.
 * @param predicate The predicate function to determine which entries go where.
 *
 * @returns A tuple containing two records, the first one containing all entries
 * that match the predicate and the second one containing all that do not.
 *
 * @example Basic usage
 * ```ts
 * import { partitionEntries } from "@std/collections/partition-entries";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const menu = {
 *   Salad: 11,
 *   Soup: 8,
 *   Pasta: 13,
 * };
 * const myOptions = partitionEntries(
 *   menu,
 *   ([item, price]) => item !== "Pasta" && price < 10,
 * );
 *
 * assertEquals(
 *   myOptions,
 *   [
 *     { Soup: 8 },
 *     { Salad: 11, Pasta: 13 },
 *   ],
 * );
 * ```
 */ export function partitionEntries(record, predicate) {
  const match = {};
  const rest = {};
  const entries = Object.entries(record);
  for (const [key, value] of entries){
    if (predicate([
      key,
      value
    ])) {
      match[key] = value;
    } else {
      rest[key] = value;
    }
  }
  return [
    match,
    rest
  ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9wYXJ0aXRpb25fZW50cmllcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgYSB0dXBsZSBvZiB0d28gcmVjb3JkcyB3aXRoIHRoZSBmaXJzdCBvbmUgY29udGFpbmluZyBhbGwgZW50cmllcyBvZlxuICogdGhlIGdpdmVuIHJlY29yZCB0aGF0IG1hdGNoIHRoZSBnaXZlbiBwcmVkaWNhdGUgYW5kIHRoZSBzZWNvbmQgb25lIGNvbnRhaW5pbmdcbiAqIGFsbCB0aGF0IGRvIG5vdC5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdHlwZSBvZiB0aGUgdmFsdWVzIGluIHRoZSByZWNvcmQuXG4gKlxuICogQHBhcmFtIHJlY29yZCBUaGUgcmVjb3JkIHRvIHBhcnRpdGlvbi5cbiAqIEBwYXJhbSBwcmVkaWNhdGUgVGhlIHByZWRpY2F0ZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgd2hpY2ggZW50cmllcyBnbyB3aGVyZS5cbiAqXG4gKiBAcmV0dXJucyBBIHR1cGxlIGNvbnRhaW5pbmcgdHdvIHJlY29yZHMsIHRoZSBmaXJzdCBvbmUgY29udGFpbmluZyBhbGwgZW50cmllc1xuICogdGhhdCBtYXRjaCB0aGUgcHJlZGljYXRlIGFuZCB0aGUgc2Vjb25kIG9uZSBjb250YWluaW5nIGFsbCB0aGF0IGRvIG5vdC5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnRpdGlvbkVudHJpZXMgfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9ucy9wYXJ0aXRpb24tZW50cmllc1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBtZW51ID0ge1xuICogICBTYWxhZDogMTEsXG4gKiAgIFNvdXA6IDgsXG4gKiAgIFBhc3RhOiAxMyxcbiAqIH07XG4gKiBjb25zdCBteU9wdGlvbnMgPSBwYXJ0aXRpb25FbnRyaWVzKFxuICogICBtZW51LFxuICogICAoW2l0ZW0sIHByaWNlXSkgPT4gaXRlbSAhPT0gXCJQYXN0YVwiICYmIHByaWNlIDwgMTAsXG4gKiApO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgbXlPcHRpb25zLFxuICogICBbXG4gKiAgICAgeyBTb3VwOiA4IH0sXG4gKiAgICAgeyBTYWxhZDogMTEsIFBhc3RhOiAxMyB9LFxuICogICBdLFxuICogKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFydGl0aW9uRW50cmllczxUPihcbiAgcmVjb3JkOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBUPj4sXG4gIHByZWRpY2F0ZTogKGVudHJ5OiBbc3RyaW5nLCBUXSkgPT4gYm9vbGVhbixcbik6IFttYXRjaDogUmVjb3JkPHN0cmluZywgVD4sIHJlc3Q6IFJlY29yZDxzdHJpbmcsIFQ+XSB7XG4gIGNvbnN0IG1hdGNoOiBSZWNvcmQ8c3RyaW5nLCBUPiA9IHt9O1xuICBjb25zdCByZXN0OiBSZWNvcmQ8c3RyaW5nLCBUPiA9IHt9O1xuICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMocmVjb3JkKTtcblxuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBlbnRyaWVzKSB7XG4gICAgaWYgKHByZWRpY2F0ZShba2V5LCB2YWx1ZV0pKSB7XG4gICAgICBtYXRjaFtrZXldID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3Rba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbbWF0Y2gsIHJlc3RdO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW9DQyxHQUNELE9BQU8sU0FBUyxpQkFDZCxNQUFtQyxFQUNuQyxTQUEwQztFQUUxQyxNQUFNLFFBQTJCLENBQUM7RUFDbEMsTUFBTSxPQUEwQixDQUFDO0VBQ2pDLE1BQU0sVUFBVSxPQUFPLE9BQU8sQ0FBQztFQUUvQixLQUFLLE1BQU0sQ0FBQyxLQUFLLE1BQU0sSUFBSSxRQUFTO0lBQ2xDLElBQUksVUFBVTtNQUFDO01BQUs7S0FBTSxHQUFHO01BQzNCLEtBQUssQ0FBQyxJQUFJLEdBQUc7SUFDZixPQUFPO01BQ0wsSUFBSSxDQUFDLElBQUksR0FBRztJQUNkO0VBQ0Y7RUFFQSxPQUFPO0lBQUM7SUFBTztHQUFLO0FBQ3RCIn0=
// denoCacheMetadata=17510451951123587235,7222439555861713241