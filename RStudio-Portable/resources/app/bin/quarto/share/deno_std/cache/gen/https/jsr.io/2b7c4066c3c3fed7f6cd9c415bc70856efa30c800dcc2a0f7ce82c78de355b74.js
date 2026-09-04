// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Applies the given transformer to all keys in the given record's entries and
 * returns a new record containing the transformed entries.
 *
 * If the transformed entries contain the same key multiple times, only the last
 * one will appear in the returned record.
 *
 * @template T The type of the values in the input record.
 *
 * @param record The record to map keys from.
 * @param transformer The function to transform each key.
 *
 * @returns A new record with all keys transformed by the given transformer.
 *
 * @example Basic usage
 * ```ts
 * import { mapKeys } from "@std/collections/map-keys";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const counts = { a: 5, b: 3, c: 8 };
 *
 * assertEquals(
 *   mapKeys(counts, (key) => key.toUpperCase()),
 *   {
 *     A: 5,
 *     B: 3,
 *     C: 8,
 *   },
 * );
 * ```
 */ export function mapKeys(record, transformer) {
  const result = {};
  for (const [key, value] of Object.entries(record)){
    const mappedKey = transformer(key);
    result[mappedKey] = value;
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9tYXBfa2V5cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIEFwcGxpZXMgdGhlIGdpdmVuIHRyYW5zZm9ybWVyIHRvIGFsbCBrZXlzIGluIHRoZSBnaXZlbiByZWNvcmQncyBlbnRyaWVzIGFuZFxuICogcmV0dXJucyBhIG5ldyByZWNvcmQgY29udGFpbmluZyB0aGUgdHJhbnNmb3JtZWQgZW50cmllcy5cbiAqXG4gKiBJZiB0aGUgdHJhbnNmb3JtZWQgZW50cmllcyBjb250YWluIHRoZSBzYW1lIGtleSBtdWx0aXBsZSB0aW1lcywgb25seSB0aGUgbGFzdFxuICogb25lIHdpbGwgYXBwZWFyIGluIHRoZSByZXR1cm5lZCByZWNvcmQuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGhlIHZhbHVlcyBpbiB0aGUgaW5wdXQgcmVjb3JkLlxuICpcbiAqIEBwYXJhbSByZWNvcmQgVGhlIHJlY29yZCB0byBtYXAga2V5cyBmcm9tLlxuICogQHBhcmFtIHRyYW5zZm9ybWVyIFRoZSBmdW5jdGlvbiB0byB0cmFuc2Zvcm0gZWFjaCBrZXkuXG4gKlxuICogQHJldHVybnMgQSBuZXcgcmVjb3JkIHdpdGggYWxsIGtleXMgdHJhbnNmb3JtZWQgYnkgdGhlIGdpdmVuIHRyYW5zZm9ybWVyLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgbWFwS2V5cyB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL21hcC1rZXlzXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IGNvdW50cyA9IHsgYTogNSwgYjogMywgYzogOCB9O1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgbWFwS2V5cyhjb3VudHMsIChrZXkpID0+IGtleS50b1VwcGVyQ2FzZSgpKSxcbiAqICAge1xuICogICAgIEE6IDUsXG4gKiAgICAgQjogMyxcbiAqICAgICBDOiA4LFxuICogICB9LFxuICogKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwS2V5czxUPihcbiAgcmVjb3JkOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBUPj4sXG4gIHRyYW5zZm9ybWVyOiAoa2V5OiBzdHJpbmcpID0+IHN0cmluZyxcbik6IFJlY29yZDxzdHJpbmcsIFQ+IHtcbiAgY29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBUPiA9IHt9O1xuXG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHJlY29yZCkpIHtcbiAgICBjb25zdCBtYXBwZWRLZXkgPSB0cmFuc2Zvcm1lcihrZXkpO1xuICAgIHJlc3VsdFttYXBwZWRLZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQThCQyxHQUNELE9BQU8sU0FBUyxRQUNkLE1BQW1DLEVBQ25DLFdBQW9DO0VBRXBDLE1BQU0sU0FBNEIsQ0FBQztFQUVuQyxLQUFLLE1BQU0sQ0FBQyxLQUFLLE1BQU0sSUFBSSxPQUFPLE9BQU8sQ0FBQyxRQUFTO0lBQ2pELE1BQU0sWUFBWSxZQUFZO0lBQzlCLE1BQU0sQ0FBQyxVQUFVLEdBQUc7RUFDdEI7RUFFQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=1080753907212770049,4301885604933934764