// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Return type for {@linkcode invertBy}. */ /**
 * Composes a new record with all keys and values inverted.
 *
 * The new record is generated from the result of running each element of the
 * input record through the given transformer function.
 *
 * The corresponding inverted value of each inverted key is an array of keys
 * responsible for generating the inverted value.
 *
 * @template R The type of the input record.
 * @template T The type of the iterator function.
 *
 * @param record The record to invert.
 * @param transformer The function to transform keys.
 *
 * @returns A new record with all keys and values inverted.
 *
 * @example Basic usage
 * ```ts
 * import { invertBy } from "@std/collections/invert-by";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const record = { a: "x", b: "y", c: "z" };
 *
 * assertEquals(
 *   invertBy(record, (key) => String(key).toUpperCase()),
 *   { X: ["a"], Y: ["b"], Z: ["c"] }
 * );
 * ```
 */ export function invertBy(record, transformer) {
  const result = {};
  for (const [key, value] of Object.entries(record)){
    const mappedKey = transformer(value);
    if (!Object.hasOwn(result, mappedKey)) {
      result[mappedKey] = [
        key
      ];
    } else {
      result[mappedKey].push(key);
    }
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9pbnZlcnRfYnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqIFJldHVybiB0eXBlIGZvciB7QGxpbmtjb2RlIGludmVydEJ5fS4gKi9cbmV4cG9ydCB0eXBlIEludmVydEJ5UmVzdWx0PFxuICBUIGV4dGVuZHMgUmVjb3JkPFByb3BlcnR5S2V5LCBQcm9wZXJ0eUtleT4sXG4gIEsgZXh0ZW5kcyBrZXlvZiBULFxuPiA9IFJlY29yZDxQcm9wZXJ0eUtleSwgS1tdPjtcblxuLyoqXG4gKiBDb21wb3NlcyBhIG5ldyByZWNvcmQgd2l0aCBhbGwga2V5cyBhbmQgdmFsdWVzIGludmVydGVkLlxuICpcbiAqIFRoZSBuZXcgcmVjb3JkIGlzIGdlbmVyYXRlZCBmcm9tIHRoZSByZXN1bHQgb2YgcnVubmluZyBlYWNoIGVsZW1lbnQgb2YgdGhlXG4gKiBpbnB1dCByZWNvcmQgdGhyb3VnaCB0aGUgZ2l2ZW4gdHJhbnNmb3JtZXIgZnVuY3Rpb24uXG4gKlxuICogVGhlIGNvcnJlc3BvbmRpbmcgaW52ZXJ0ZWQgdmFsdWUgb2YgZWFjaCBpbnZlcnRlZCBrZXkgaXMgYW4gYXJyYXkgb2Yga2V5c1xuICogcmVzcG9uc2libGUgZm9yIGdlbmVyYXRpbmcgdGhlIGludmVydGVkIHZhbHVlLlxuICpcbiAqIEB0ZW1wbGF0ZSBSIFRoZSB0eXBlIG9mIHRoZSBpbnB1dCByZWNvcmQuXG4gKiBAdGVtcGxhdGUgVCBUaGUgdHlwZSBvZiB0aGUgaXRlcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHJlY29yZCBUaGUgcmVjb3JkIHRvIGludmVydC5cbiAqIEBwYXJhbSB0cmFuc2Zvcm1lciBUaGUgZnVuY3Rpb24gdG8gdHJhbnNmb3JtIGtleXMuXG4gKlxuICogQHJldHVybnMgQSBuZXcgcmVjb3JkIHdpdGggYWxsIGtleXMgYW5kIHZhbHVlcyBpbnZlcnRlZC5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGludmVydEJ5IH0gZnJvbSBcIkBzdGQvY29sbGVjdGlvbnMvaW52ZXJ0LWJ5XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHJlY29yZCA9IHsgYTogXCJ4XCIsIGI6IFwieVwiLCBjOiBcInpcIiB9O1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgaW52ZXJ0QnkocmVjb3JkLCAoa2V5KSA9PiBTdHJpbmcoa2V5KS50b1VwcGVyQ2FzZSgpKSxcbiAqICAgeyBYOiBbXCJhXCJdLCBZOiBbXCJiXCJdLCBaOiBbXCJjXCJdIH1cbiAqICk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydEJ5PFxuICBSIGV4dGVuZHMgUmVjb3JkPFByb3BlcnR5S2V5LCBQcm9wZXJ0eUtleT4sXG4gIFQgZXh0ZW5kcyAoa2V5OiBQcm9wZXJ0eUtleSkgPT4gUHJvcGVydHlLZXksXG4+KHJlY29yZDogUmVhZG9ubHk8Uj4sIHRyYW5zZm9ybWVyOiBUKTogSW52ZXJ0QnlSZXN1bHQ8Uiwga2V5b2YgUj4ge1xuICBjb25zdCByZXN1bHQgPSB7fSBhcyBJbnZlcnRCeVJlc3VsdDxSLCBrZXlvZiBSPjtcblxuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhyZWNvcmQpKSB7XG4gICAgY29uc3QgbWFwcGVkS2V5ID0gdHJhbnNmb3JtZXIodmFsdWUpO1xuICAgIGlmICghT2JqZWN0Lmhhc093bihyZXN1bHQsIG1hcHBlZEtleSkpIHtcbiAgICAgIHJlc3VsdFttYXBwZWRLZXldID0gW2tleV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFttYXBwZWRLZXldIS5wdXNoKGtleSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLDBDQUEwQyxHQU0xQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E2QkMsR0FDRCxPQUFPLFNBQVMsU0FHZCxNQUFtQixFQUFFLFdBQWM7RUFDbkMsTUFBTSxTQUFTLENBQUM7RUFFaEIsS0FBSyxNQUFNLENBQUMsS0FBSyxNQUFNLElBQUksT0FBTyxPQUFPLENBQUMsUUFBUztJQUNqRCxNQUFNLFlBQVksWUFBWTtJQUM5QixJQUFJLENBQUMsT0FBTyxNQUFNLENBQUMsUUFBUSxZQUFZO01BQ3JDLE1BQU0sQ0FBQyxVQUFVLEdBQUc7UUFBQztPQUFJO0lBQzNCLE9BQU87TUFDTCxNQUFNLENBQUMsVUFBVSxDQUFFLElBQUksQ0FBQztJQUMxQjtFQUNGO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=6568392661412715340,1663433509688970747