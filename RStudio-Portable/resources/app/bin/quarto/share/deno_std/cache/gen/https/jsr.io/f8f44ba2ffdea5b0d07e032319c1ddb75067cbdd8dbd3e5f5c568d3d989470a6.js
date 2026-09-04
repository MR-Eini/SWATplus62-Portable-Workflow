// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Applies the given selector to elements in the given array until a value is
 * produced that is neither `null` nor `undefined` and returns that value.
 * Returns `undefined` if no such value is produced.
 *
 * @template T The type of the elements in the input array.
 * @template O The type of the value produced by the selector function.
 *
 * @param array The array to select a value from.
 * @param selector The function to extract a value from an element.
 *
 * @returns The first non-`null` and non-`undefined` value produced by the
 * selector function, or `undefined` if no such value is produced.
 *
 * @example Basic usage
 * ```ts
 * import { firstNotNullishOf } from "@std/collections/first-not-nullish-of";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const tables = [
 *   { number: 11, order: null },
 *   { number: 12, order: "Soup" },
 *   { number: 13, order: "Salad" },
 * ];
 *
 * const nextOrder = firstNotNullishOf(tables, (table) => table.order);
 *
 * assertEquals(nextOrder, "Soup");
 * ```
 */ export function firstNotNullishOf(array, selector) {
  for (const current of array){
    const selected = selector(current);
    if (selected !== null && selected !== undefined) {
      return selected;
    }
  }
  return undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9maXJzdF9ub3RfbnVsbGlzaF9vZi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIEFwcGxpZXMgdGhlIGdpdmVuIHNlbGVjdG9yIHRvIGVsZW1lbnRzIGluIHRoZSBnaXZlbiBhcnJheSB1bnRpbCBhIHZhbHVlIGlzXG4gKiBwcm9kdWNlZCB0aGF0IGlzIG5laXRoZXIgYG51bGxgIG5vciBgdW5kZWZpbmVkYCBhbmQgcmV0dXJucyB0aGF0IHZhbHVlLlxuICogUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBubyBzdWNoIHZhbHVlIGlzIHByb2R1Y2VkLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0eXBlIG9mIHRoZSBlbGVtZW50cyBpbiB0aGUgaW5wdXQgYXJyYXkuXG4gKiBAdGVtcGxhdGUgTyBUaGUgdHlwZSBvZiB0aGUgdmFsdWUgcHJvZHVjZWQgYnkgdGhlIHNlbGVjdG9yIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBhcnJheSBUaGUgYXJyYXkgdG8gc2VsZWN0IGEgdmFsdWUgZnJvbS5cbiAqIEBwYXJhbSBzZWxlY3RvciBUaGUgZnVuY3Rpb24gdG8gZXh0cmFjdCBhIHZhbHVlIGZyb20gYW4gZWxlbWVudC5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZmlyc3Qgbm9uLWBudWxsYCBhbmQgbm9uLWB1bmRlZmluZWRgIHZhbHVlIHByb2R1Y2VkIGJ5IHRoZVxuICogc2VsZWN0b3IgZnVuY3Rpb24sIG9yIGB1bmRlZmluZWRgIGlmIG5vIHN1Y2ggdmFsdWUgaXMgcHJvZHVjZWQuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBmaXJzdE5vdE51bGxpc2hPZiB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL2ZpcnN0LW5vdC1udWxsaXNoLW9mXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHRhYmxlcyA9IFtcbiAqICAgeyBudW1iZXI6IDExLCBvcmRlcjogbnVsbCB9LFxuICogICB7IG51bWJlcjogMTIsIG9yZGVyOiBcIlNvdXBcIiB9LFxuICogICB7IG51bWJlcjogMTMsIG9yZGVyOiBcIlNhbGFkXCIgfSxcbiAqIF07XG4gKlxuICogY29uc3QgbmV4dE9yZGVyID0gZmlyc3ROb3ROdWxsaXNoT2YodGFibGVzLCAodGFibGUpID0+IHRhYmxlLm9yZGVyKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMobmV4dE9yZGVyLCBcIlNvdXBcIik7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpcnN0Tm90TnVsbGlzaE9mPFQsIE8+KFxuICBhcnJheTogSXRlcmFibGU8VD4sXG4gIHNlbGVjdG9yOiAoaXRlbTogVCkgPT4gTyB8IHVuZGVmaW5lZCB8IG51bGwsXG4pOiBOb25OdWxsYWJsZTxPPiB8IHVuZGVmaW5lZCB7XG4gIGZvciAoY29uc3QgY3VycmVudCBvZiBhcnJheSkge1xuICAgIGNvbnN0IHNlbGVjdGVkID0gc2VsZWN0b3IoY3VycmVudCk7XG5cbiAgICBpZiAoc2VsZWN0ZWQgIT09IG51bGwgJiYgc2VsZWN0ZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHNlbGVjdGVkIGFzIE5vbk51bGxhYmxlPE8+O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E2QkMsR0FDRCxPQUFPLFNBQVMsa0JBQ2QsS0FBa0IsRUFDbEIsUUFBMkM7RUFFM0MsS0FBSyxNQUFNLFdBQVcsTUFBTztJQUMzQixNQUFNLFdBQVcsU0FBUztJQUUxQixJQUFJLGFBQWEsUUFBUSxhQUFhLFdBQVc7TUFDL0MsT0FBTztJQUNUO0VBQ0Y7RUFFQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=6808807346253518779,16165549341817282251