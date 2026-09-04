// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns a new array that drops all elements in the given collection until the
 * last element that does not match the given predicate.
 *
 * @template T The type of the elements in the input array.
 *
 * @param array The array to drop elements from.
 * @param predicate The function to test each element for a condition.
 *
 * @returns A new array that drops all elements until the last element that does
 * not match the given predicate.
 *
 * @example Basic usage
 * ```ts
 * import { dropLastWhile } from "@std/collections/drop-last-while";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const numbers = [20, 33, 44];
 *
 * const notFortyFour = dropLastWhile(numbers, (number) => number > 30);
 *
 * assertEquals(notFortyFour, [20]);
 * ```
 */ export function dropLastWhile(array, predicate) {
  let offset = array.length;
  while(0 < offset && predicate(array[offset - 1]))offset--;
  return array.slice(0, offset);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9kcm9wX2xhc3Rfd2hpbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBSZXR1cm5zIGEgbmV3IGFycmF5IHRoYXQgZHJvcHMgYWxsIGVsZW1lbnRzIGluIHRoZSBnaXZlbiBjb2xsZWN0aW9uIHVudGlsIHRoZVxuICogbGFzdCBlbGVtZW50IHRoYXQgZG9lcyBub3QgbWF0Y2ggdGhlIGdpdmVuIHByZWRpY2F0ZS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdHlwZSBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIGlucHV0IGFycmF5LlxuICpcbiAqIEBwYXJhbSBhcnJheSBUaGUgYXJyYXkgdG8gZHJvcCBlbGVtZW50cyBmcm9tLlxuICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gdG8gdGVzdCBlYWNoIGVsZW1lbnQgZm9yIGEgY29uZGl0aW9uLlxuICpcbiAqIEByZXR1cm5zIEEgbmV3IGFycmF5IHRoYXQgZHJvcHMgYWxsIGVsZW1lbnRzIHVudGlsIHRoZSBsYXN0IGVsZW1lbnQgdGhhdCBkb2VzXG4gKiBub3QgbWF0Y2ggdGhlIGdpdmVuIHByZWRpY2F0ZS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGRyb3BMYXN0V2hpbGUgfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9ucy9kcm9wLWxhc3Qtd2hpbGVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgbnVtYmVycyA9IFsyMCwgMzMsIDQ0XTtcbiAqXG4gKiBjb25zdCBub3RGb3J0eUZvdXIgPSBkcm9wTGFzdFdoaWxlKG51bWJlcnMsIChudW1iZXIpID0+IG51bWJlciA+IDMwKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMobm90Rm9ydHlGb3VyLCBbMjBdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZHJvcExhc3RXaGlsZTxUPihcbiAgYXJyYXk6IHJlYWRvbmx5IFRbXSxcbiAgcHJlZGljYXRlOiAoZWw6IFQpID0+IGJvb2xlYW4sXG4pOiBUW10ge1xuICBsZXQgb2Zmc2V0ID0gYXJyYXkubGVuZ3RoO1xuICB3aGlsZSAoMCA8IG9mZnNldCAmJiBwcmVkaWNhdGUoYXJyYXlbb2Zmc2V0IC0gMV0gYXMgVCkpIG9mZnNldC0tO1xuXG4gIHJldHVybiBhcnJheS5zbGljZSgwLCBvZmZzZXQpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJDLEdBQ0QsT0FBTyxTQUFTLGNBQ2QsS0FBbUIsRUFDbkIsU0FBNkI7RUFFN0IsSUFBSSxTQUFTLE1BQU0sTUFBTTtFQUN6QixNQUFPLElBQUksVUFBVSxVQUFVLEtBQUssQ0FBQyxTQUFTLEVBQUUsRUFBUTtFQUV4RCxPQUFPLE1BQU0sS0FBSyxDQUFDLEdBQUc7QUFDeEIifQ==
// denoCacheMetadata=13496784665228295409,17879154978139118875