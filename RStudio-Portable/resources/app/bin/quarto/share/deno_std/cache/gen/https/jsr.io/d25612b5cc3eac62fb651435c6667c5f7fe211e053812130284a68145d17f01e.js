// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns a new array, containing all elements in the given array transformed
 * using the given transformer, except the ones that were transformed to `null`
 * or `undefined`.
 *
 * @template T The type of the elements in the input array.
 * @template O The type of the elements in the output array.
 *
 * @param array The array to map elements from.
 * @param transformer The function to transform each element.
 *
 * @returns A new array with all elements transformed by the given transformer,
 * except the ones that were transformed to `null` or `undefined`.
 *
 * @example Basic usage
 * ```ts
 * import { mapNotNullish } from "@std/collections/map-not-nullish";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const people = [
 *   { middleName: null },
 *   { middleName: "William" },
 *   { middleName: undefined },
 *   { middleName: "Martha" },
 * ];
 * const foundMiddleNames = mapNotNullish(people, (people) => people.middleName);
 *
 * assertEquals(foundMiddleNames, ["William", "Martha"]);
 * ```
 */ export function mapNotNullish(array, transformer) {
  const result = [];
  for (const element of array){
    const transformedElement = transformer(element);
    if (transformedElement !== undefined && transformedElement !== null) {
      result.push(transformedElement);
    }
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9tYXBfbm90X251bGxpc2gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBSZXR1cm5zIGEgbmV3IGFycmF5LCBjb250YWluaW5nIGFsbCBlbGVtZW50cyBpbiB0aGUgZ2l2ZW4gYXJyYXkgdHJhbnNmb3JtZWRcbiAqIHVzaW5nIHRoZSBnaXZlbiB0cmFuc2Zvcm1lciwgZXhjZXB0IHRoZSBvbmVzIHRoYXQgd2VyZSB0cmFuc2Zvcm1lZCB0byBgbnVsbGBcbiAqIG9yIGB1bmRlZmluZWRgLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0eXBlIG9mIHRoZSBlbGVtZW50cyBpbiB0aGUgaW5wdXQgYXJyYXkuXG4gKiBAdGVtcGxhdGUgTyBUaGUgdHlwZSBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIG91dHB1dCBhcnJheS5cbiAqXG4gKiBAcGFyYW0gYXJyYXkgVGhlIGFycmF5IHRvIG1hcCBlbGVtZW50cyBmcm9tLlxuICogQHBhcmFtIHRyYW5zZm9ybWVyIFRoZSBmdW5jdGlvbiB0byB0cmFuc2Zvcm0gZWFjaCBlbGVtZW50LlxuICpcbiAqIEByZXR1cm5zIEEgbmV3IGFycmF5IHdpdGggYWxsIGVsZW1lbnRzIHRyYW5zZm9ybWVkIGJ5IHRoZSBnaXZlbiB0cmFuc2Zvcm1lcixcbiAqIGV4Y2VwdCB0aGUgb25lcyB0aGF0IHdlcmUgdHJhbnNmb3JtZWQgdG8gYG51bGxgIG9yIGB1bmRlZmluZWRgLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgbWFwTm90TnVsbGlzaCB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL21hcC1ub3QtbnVsbGlzaFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBwZW9wbGUgPSBbXG4gKiAgIHsgbWlkZGxlTmFtZTogbnVsbCB9LFxuICogICB7IG1pZGRsZU5hbWU6IFwiV2lsbGlhbVwiIH0sXG4gKiAgIHsgbWlkZGxlTmFtZTogdW5kZWZpbmVkIH0sXG4gKiAgIHsgbWlkZGxlTmFtZTogXCJNYXJ0aGFcIiB9LFxuICogXTtcbiAqIGNvbnN0IGZvdW5kTWlkZGxlTmFtZXMgPSBtYXBOb3ROdWxsaXNoKHBlb3BsZSwgKHBlb3BsZSkgPT4gcGVvcGxlLm1pZGRsZU5hbWUpO1xuICpcbiAqIGFzc2VydEVxdWFscyhmb3VuZE1pZGRsZU5hbWVzLCBbXCJXaWxsaWFtXCIsIFwiTWFydGhhXCJdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwTm90TnVsbGlzaDxULCBPPihcbiAgYXJyYXk6IEl0ZXJhYmxlPFQ+LFxuICB0cmFuc2Zvcm1lcjogKGVsOiBUKSA9PiBPLFxuKTogTm9uTnVsbGFibGU8Tz5bXSB7XG4gIGNvbnN0IHJlc3VsdDogTm9uTnVsbGFibGU8Tz5bXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgZWxlbWVudCBvZiBhcnJheSkge1xuICAgIGNvbnN0IHRyYW5zZm9ybWVkRWxlbWVudCA9IHRyYW5zZm9ybWVyKGVsZW1lbnQpO1xuXG4gICAgaWYgKHRyYW5zZm9ybWVkRWxlbWVudCAhPT0gdW5kZWZpbmVkICYmIHRyYW5zZm9ybWVkRWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgcmVzdWx0LnB1c2godHJhbnNmb3JtZWRFbGVtZW50IGFzIE5vbk51bGxhYmxlPE8+KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNkJDLEdBQ0QsT0FBTyxTQUFTLGNBQ2QsS0FBa0IsRUFDbEIsV0FBeUI7RUFFekIsTUFBTSxTQUEyQixFQUFFO0VBRW5DLEtBQUssTUFBTSxXQUFXLE1BQU87SUFDM0IsTUFBTSxxQkFBcUIsWUFBWTtJQUV2QyxJQUFJLHVCQUF1QixhQUFhLHVCQUF1QixNQUFNO01BQ25FLE9BQU8sSUFBSSxDQUFDO0lBQ2Q7RUFDRjtFQUVBLE9BQU87QUFDVCJ9
// denoCacheMetadata=13965563728736556835,11836670976440663359