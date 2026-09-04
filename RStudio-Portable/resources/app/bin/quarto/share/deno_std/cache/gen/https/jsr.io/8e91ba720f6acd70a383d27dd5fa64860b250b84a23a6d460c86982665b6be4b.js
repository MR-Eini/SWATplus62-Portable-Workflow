// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { mapEntries } from "./map_entries.ts";
/**
 * Applies the given aggregator to each group in the given grouping, returning the
 * results together with the respective group keys
 *
 * @template T Type of the values in the input record.
 * @template A Type of the accumulator value, which will match the returned
 * record's values.
 *
 * @param record The grouping to aggregate.
 * @param aggregator The function to apply to each group.
 *
 * @returns A record with the same keys as the input record, but with the values
 * being the result of applying the aggregator to each group.
 *
 * @example Basic usage
 * ```ts
 * import { aggregateGroups } from "@std/collections/aggregate-groups";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const foodProperties = {
 *   Curry: ["spicy", "vegan"],
 *   Omelette: ["creamy", "vegetarian"],
 * };
 *
 * const descriptions = aggregateGroups(
 *   foodProperties,
 *   (current, key, first, acc) => {
 *     return first
 *       ? `${key} is ${current}`
 *       : `${acc} and ${current}`;
 *   },
 * );
 *
 * assertEquals(descriptions, {
 *   Curry: "Curry is spicy and vegan",
 *   Omelette: "Omelette is creamy and vegetarian",
 * });
 * ```
 */ export function aggregateGroups(record, aggregator) {
  return mapEntries(record, ([key, values])=>[
      key,
      // Need the type assertions here because the reduce type does not support
      // the type transition we need
      values.reduce((accumulator, current, currentIndex)=>aggregator(current, key, currentIndex === 0, accumulator), undefined)
    ]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9hZ2dyZWdhdGVfZ3JvdXBzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IG1hcEVudHJpZXMgfSBmcm9tIFwiLi9tYXBfZW50cmllcy50c1wiO1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIGdpdmVuIGFnZ3JlZ2F0b3IgdG8gZWFjaCBncm91cCBpbiB0aGUgZ2l2ZW4gZ3JvdXBpbmcsIHJldHVybmluZyB0aGVcbiAqIHJlc3VsdHMgdG9nZXRoZXIgd2l0aCB0aGUgcmVzcGVjdGl2ZSBncm91cCBrZXlzXG4gKlxuICogQHRlbXBsYXRlIFQgVHlwZSBvZiB0aGUgdmFsdWVzIGluIHRoZSBpbnB1dCByZWNvcmQuXG4gKiBAdGVtcGxhdGUgQSBUeXBlIG9mIHRoZSBhY2N1bXVsYXRvciB2YWx1ZSwgd2hpY2ggd2lsbCBtYXRjaCB0aGUgcmV0dXJuZWRcbiAqIHJlY29yZCdzIHZhbHVlcy5cbiAqXG4gKiBAcGFyYW0gcmVjb3JkIFRoZSBncm91cGluZyB0byBhZ2dyZWdhdGUuXG4gKiBAcGFyYW0gYWdncmVnYXRvciBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgdG8gZWFjaCBncm91cC5cbiAqXG4gKiBAcmV0dXJucyBBIHJlY29yZCB3aXRoIHRoZSBzYW1lIGtleXMgYXMgdGhlIGlucHV0IHJlY29yZCwgYnV0IHdpdGggdGhlIHZhbHVlc1xuICogYmVpbmcgdGhlIHJlc3VsdCBvZiBhcHBseWluZyB0aGUgYWdncmVnYXRvciB0byBlYWNoIGdyb3VwLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgYWdncmVnYXRlR3JvdXBzIH0gZnJvbSBcIkBzdGQvY29sbGVjdGlvbnMvYWdncmVnYXRlLWdyb3Vwc1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBmb29kUHJvcGVydGllcyA9IHtcbiAqICAgQ3Vycnk6IFtcInNwaWN5XCIsIFwidmVnYW5cIl0sXG4gKiAgIE9tZWxldHRlOiBbXCJjcmVhbXlcIiwgXCJ2ZWdldGFyaWFuXCJdLFxuICogfTtcbiAqXG4gKiBjb25zdCBkZXNjcmlwdGlvbnMgPSBhZ2dyZWdhdGVHcm91cHMoXG4gKiAgIGZvb2RQcm9wZXJ0aWVzLFxuICogICAoY3VycmVudCwga2V5LCBmaXJzdCwgYWNjKSA9PiB7XG4gKiAgICAgcmV0dXJuIGZpcnN0XG4gKiAgICAgICA/IGAke2tleX0gaXMgJHtjdXJyZW50fWBcbiAqICAgICAgIDogYCR7YWNjfSBhbmQgJHtjdXJyZW50fWA7XG4gKiAgIH0sXG4gKiApO1xuICpcbiAqIGFzc2VydEVxdWFscyhkZXNjcmlwdGlvbnMsIHtcbiAqICAgQ3Vycnk6IFwiQ3VycnkgaXMgc3BpY3kgYW5kIHZlZ2FuXCIsXG4gKiAgIE9tZWxldHRlOiBcIk9tZWxldHRlIGlzIGNyZWFteSBhbmQgdmVnZXRhcmlhblwiLFxuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFnZ3JlZ2F0ZUdyb3VwczxULCBBPihcbiAgcmVjb3JkOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBSZWFkb25seUFycmF5PFQ+Pj4sXG4gIGFnZ3JlZ2F0b3I6IChjdXJyZW50OiBULCBrZXk6IHN0cmluZywgZmlyc3Q6IGJvb2xlYW4sIGFjY3VtdWxhdG9yPzogQSkgPT4gQSxcbik6IFJlY29yZDxzdHJpbmcsIEE+IHtcbiAgcmV0dXJuIG1hcEVudHJpZXMoXG4gICAgcmVjb3JkLFxuICAgIChba2V5LCB2YWx1ZXNdKSA9PiBbXG4gICAgICBrZXksXG4gICAgICAvLyBOZWVkIHRoZSB0eXBlIGFzc2VydGlvbnMgaGVyZSBiZWNhdXNlIHRoZSByZWR1Y2UgdHlwZSBkb2VzIG5vdCBzdXBwb3J0XG4gICAgICAvLyB0aGUgdHlwZSB0cmFuc2l0aW9uIHdlIG5lZWRcbiAgICAgIHZhbHVlcy5yZWR1Y2UoXG4gICAgICAgIChhY2N1bXVsYXRvciwgY3VycmVudCwgY3VycmVudEluZGV4KSA9PlxuICAgICAgICAgIGFnZ3JlZ2F0b3IoY3VycmVudCwga2V5LCBjdXJyZW50SW5kZXggPT09IDAsIGFjY3VtdWxhdG9yKSxcbiAgICAgICAgdW5kZWZpbmVkIGFzIEEgfCB1bmRlZmluZWQsXG4gICAgICApIGFzIEEsXG4gICAgXSxcbiAgKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsVUFBVSxRQUFRLG1CQUFtQjtBQUU5Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FzQ0MsR0FDRCxPQUFPLFNBQVMsZ0JBQ2QsTUFBa0QsRUFDbEQsVUFBMkU7RUFFM0UsT0FBTyxXQUNMLFFBQ0EsQ0FBQyxDQUFDLEtBQUssT0FBTyxHQUFLO01BQ2pCO01BQ0EseUVBQXlFO01BQ3pFLDhCQUE4QjtNQUM5QixPQUFPLE1BQU0sQ0FDWCxDQUFDLGFBQWEsU0FBUyxlQUNyQixXQUFXLFNBQVMsS0FBSyxpQkFBaUIsR0FBRyxjQUMvQztLQUVIO0FBRUwifQ==
// denoCacheMetadata=12796724874943105360,9791046784098309333