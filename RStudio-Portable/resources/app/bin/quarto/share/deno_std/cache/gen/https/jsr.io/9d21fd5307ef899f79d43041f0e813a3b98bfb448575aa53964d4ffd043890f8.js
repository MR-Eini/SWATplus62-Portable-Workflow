// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { mapValues } from "./map_values.ts";
/**
 * Applies the given reducer to each group in the given grouping, returning the
 * results together with the respective group keys.
 *
 * @template T input type of an item in a group in the given grouping.
 * @template A type of the accumulator value, which will match the returned
 * record's values.
 *
 * @param record The grouping to reduce.
 * @param reducer The reducer function to apply to each group.
 * @param initialValue The initial value of the accumulator.
 *
 * @returns A record with the same keys as the input grouping, where each value
 * is the result of applying the reducer to the respective group.
 *
 * @example Basic usage
 * ```ts
 * import { reduceGroups } from "@std/collections/reduce-groups";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const votes = {
 *   Woody: [2, 3, 1, 4],
 *   Buzz: [5, 9],
 * };
 *
 * const totalVotes = reduceGroups(votes, (sum, vote) => sum + vote, 0);
 *
 * assertEquals(totalVotes, {
 *   Woody: 10,
 *   Buzz: 14,
 * });
 * ```
 */ export function reduceGroups(record, reducer, initialValue) {
  return mapValues(record, (value)=>value.reduce(reducer, initialValue));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9yZWR1Y2VfZ3JvdXBzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IG1hcFZhbHVlcyB9IGZyb20gXCIuL21hcF92YWx1ZXMudHNcIjtcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBnaXZlbiByZWR1Y2VyIHRvIGVhY2ggZ3JvdXAgaW4gdGhlIGdpdmVuIGdyb3VwaW5nLCByZXR1cm5pbmcgdGhlXG4gKiByZXN1bHRzIHRvZ2V0aGVyIHdpdGggdGhlIHJlc3BlY3RpdmUgZ3JvdXAga2V5cy5cbiAqXG4gKiBAdGVtcGxhdGUgVCBpbnB1dCB0eXBlIG9mIGFuIGl0ZW0gaW4gYSBncm91cCBpbiB0aGUgZ2l2ZW4gZ3JvdXBpbmcuXG4gKiBAdGVtcGxhdGUgQSB0eXBlIG9mIHRoZSBhY2N1bXVsYXRvciB2YWx1ZSwgd2hpY2ggd2lsbCBtYXRjaCB0aGUgcmV0dXJuZWRcbiAqIHJlY29yZCdzIHZhbHVlcy5cbiAqXG4gKiBAcGFyYW0gcmVjb3JkIFRoZSBncm91cGluZyB0byByZWR1Y2UuXG4gKiBAcGFyYW0gcmVkdWNlciBUaGUgcmVkdWNlciBmdW5jdGlvbiB0byBhcHBseSB0byBlYWNoIGdyb3VwLlxuICogQHBhcmFtIGluaXRpYWxWYWx1ZSBUaGUgaW5pdGlhbCB2YWx1ZSBvZiB0aGUgYWNjdW11bGF0b3IuXG4gKlxuICogQHJldHVybnMgQSByZWNvcmQgd2l0aCB0aGUgc2FtZSBrZXlzIGFzIHRoZSBpbnB1dCBncm91cGluZywgd2hlcmUgZWFjaCB2YWx1ZVxuICogaXMgdGhlIHJlc3VsdCBvZiBhcHBseWluZyB0aGUgcmVkdWNlciB0byB0aGUgcmVzcGVjdGl2ZSBncm91cC5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHJlZHVjZUdyb3VwcyB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL3JlZHVjZS1ncm91cHNcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgdm90ZXMgPSB7XG4gKiAgIFdvb2R5OiBbMiwgMywgMSwgNF0sXG4gKiAgIEJ1eno6IFs1LCA5XSxcbiAqIH07XG4gKlxuICogY29uc3QgdG90YWxWb3RlcyA9IHJlZHVjZUdyb3Vwcyh2b3RlcywgKHN1bSwgdm90ZSkgPT4gc3VtICsgdm90ZSwgMCk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKHRvdGFsVm90ZXMsIHtcbiAqICAgV29vZHk6IDEwLFxuICogICBCdXp6OiAxNCxcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWR1Y2VHcm91cHM8VCwgQT4oXG4gIHJlY29yZDogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgUmVhZG9ubHlBcnJheTxUPj4+LFxuICByZWR1Y2VyOiAoYWNjdW11bGF0b3I6IEEsIGN1cnJlbnQ6IFQpID0+IEEsXG4gIGluaXRpYWxWYWx1ZTogQSxcbik6IFJlY29yZDxzdHJpbmcsIEE+IHtcbiAgcmV0dXJuIG1hcFZhbHVlcyhyZWNvcmQsICh2YWx1ZSkgPT4gdmFsdWUucmVkdWNlKHJlZHVjZXIsIGluaXRpYWxWYWx1ZSkpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxTQUFTLFFBQVEsa0JBQWtCO0FBRTVDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWdDQyxHQUNELE9BQU8sU0FBUyxhQUNkLE1BQWtELEVBQ2xELE9BQTBDLEVBQzFDLFlBQWU7RUFFZixPQUFPLFVBQVUsUUFBUSxDQUFDLFFBQVUsTUFBTSxNQUFNLENBQUMsU0FBUztBQUM1RCJ9
// denoCacheMetadata=3428620303165364163,3786476106084346062