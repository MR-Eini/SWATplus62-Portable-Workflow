// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns all elements in the given array after the last element that does not
 * match the given predicate.
 *
 * @template T The type of the array elements.
 *
 * @param array The array to take elements from.
 * @param predicate The predicate function to determine if an element should be
 * included.
 *
 * @returns A new array containing all elements after the last element that does
 * not match the predicate.
 *
 * @example Basic usage
 * ```ts
 * import { takeLastWhile } from "@std/collections/take-last-while";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const numbers = [1, 2, 3, 4, 5, 6];
 *
 * const result = takeLastWhile(numbers, (number) => number > 4);
 *
 * assertEquals(result, [5, 6]);
 * ```
 */ export function takeLastWhile(array, predicate) {
  let offset = array.length;
  while(0 < offset && predicate(array[offset - 1]))offset--;
  return array.slice(offset, array.length);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi90YWtlX2xhc3Rfd2hpbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBSZXR1cm5zIGFsbCBlbGVtZW50cyBpbiB0aGUgZ2l2ZW4gYXJyYXkgYWZ0ZXIgdGhlIGxhc3QgZWxlbWVudCB0aGF0IGRvZXMgbm90XG4gKiBtYXRjaCB0aGUgZ2l2ZW4gcHJlZGljYXRlLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0eXBlIG9mIHRoZSBhcnJheSBlbGVtZW50cy5cbiAqXG4gKiBAcGFyYW0gYXJyYXkgVGhlIGFycmF5IHRvIHRha2UgZWxlbWVudHMgZnJvbS5cbiAqIEBwYXJhbSBwcmVkaWNhdGUgVGhlIHByZWRpY2F0ZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgaWYgYW4gZWxlbWVudCBzaG91bGQgYmVcbiAqIGluY2x1ZGVkLlxuICpcbiAqIEByZXR1cm5zIEEgbmV3IGFycmF5IGNvbnRhaW5pbmcgYWxsIGVsZW1lbnRzIGFmdGVyIHRoZSBsYXN0IGVsZW1lbnQgdGhhdCBkb2VzXG4gKiBub3QgbWF0Y2ggdGhlIHByZWRpY2F0ZS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHRha2VMYXN0V2hpbGUgfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9ucy90YWtlLWxhc3Qtd2hpbGVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgbnVtYmVycyA9IFsxLCAyLCAzLCA0LCA1LCA2XTtcbiAqXG4gKiBjb25zdCByZXN1bHQgPSB0YWtlTGFzdFdoaWxlKG51bWJlcnMsIChudW1iZXIpID0+IG51bWJlciA+IDQpO1xuICpcbiAqIGFzc2VydEVxdWFscyhyZXN1bHQsIFs1LCA2XSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRha2VMYXN0V2hpbGU8VD4oXG4gIGFycmF5OiByZWFkb25seSBUW10sXG4gIHByZWRpY2F0ZTogKGVsOiBUKSA9PiBib29sZWFuLFxuKTogVFtdIHtcbiAgbGV0IG9mZnNldCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKDAgPCBvZmZzZXQgJiYgcHJlZGljYXRlKGFycmF5W29mZnNldCAtIDFdIGFzIFQpKSBvZmZzZXQtLTtcblxuICByZXR1cm4gYXJyYXkuc2xpY2Uob2Zmc2V0LCBhcnJheS5sZW5ndGgpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCQyxHQUNELE9BQU8sU0FBUyxjQUNkLEtBQW1CLEVBQ25CLFNBQTZCO0VBRTdCLElBQUksU0FBUyxNQUFNLE1BQU07RUFDekIsTUFBTyxJQUFJLFVBQVUsVUFBVSxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQVE7RUFFeEQsT0FBTyxNQUFNLEtBQUssQ0FBQyxRQUFRLE1BQU0sTUFBTTtBQUN6QyJ9
// denoCacheMetadata=5273303353571993222,12861951987690621714