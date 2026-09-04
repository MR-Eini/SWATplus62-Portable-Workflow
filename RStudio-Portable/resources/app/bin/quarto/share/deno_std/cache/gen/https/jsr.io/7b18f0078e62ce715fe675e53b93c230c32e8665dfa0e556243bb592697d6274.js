// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { minOf } from "./min_of.ts";
/**
 * Builds N-tuples of elements from the given N arrays with matching indices,
 * stopping when the smallest array's end is reached.
 *
 * @template T the type of the tuples produced by this function.
 *
 * @param arrays The arrays to zip.
 *
 * @returns A new array containing N-tuples of elements from the given arrays.
 *
 * @example Basic usage
 * ```ts
 * import { zip } from "@std/collections/zip";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const numbers = [1, 2, 3, 4];
 * const letters = ["a", "b", "c", "d"];
 * const pairs = zip(numbers, letters);
 *
 * assertEquals(
 *   pairs,
 *   [
 *     [1, "a"],
 *     [2, "b"],
 *     [3, "c"],
 *     [4, "d"],
 *   ],
 * );
 * ```
 */ export function zip(...arrays) {
  const minLength = minOf(arrays, (element)=>element.length) ?? 0;
  const result = new Array(minLength);
  for(let i = 0; i < minLength; i += 1){
    const arr = arrays.map((it)=>it[i]);
    result[i] = arr;
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi96aXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgbWluT2YgfSBmcm9tIFwiLi9taW5fb2YudHNcIjtcblxuLyoqXG4gKiBCdWlsZHMgTi10dXBsZXMgb2YgZWxlbWVudHMgZnJvbSB0aGUgZ2l2ZW4gTiBhcnJheXMgd2l0aCBtYXRjaGluZyBpbmRpY2VzLFxuICogc3RvcHBpbmcgd2hlbiB0aGUgc21hbGxlc3QgYXJyYXkncyBlbmQgaXMgcmVhY2hlZC5cbiAqXG4gKiBAdGVtcGxhdGUgVCB0aGUgdHlwZSBvZiB0aGUgdHVwbGVzIHByb2R1Y2VkIGJ5IHRoaXMgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIGFycmF5cyBUaGUgYXJyYXlzIHRvIHppcC5cbiAqXG4gKiBAcmV0dXJucyBBIG5ldyBhcnJheSBjb250YWluaW5nIE4tdHVwbGVzIG9mIGVsZW1lbnRzIGZyb20gdGhlIGdpdmVuIGFycmF5cy5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHppcCB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL3ppcFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBudW1iZXJzID0gWzEsIDIsIDMsIDRdO1xuICogY29uc3QgbGV0dGVycyA9IFtcImFcIiwgXCJiXCIsIFwiY1wiLCBcImRcIl07XG4gKiBjb25zdCBwYWlycyA9IHppcChudW1iZXJzLCBsZXR0ZXJzKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIHBhaXJzLFxuICogICBbXG4gKiAgICAgWzEsIFwiYVwiXSxcbiAqICAgICBbMiwgXCJiXCJdLFxuICogICAgIFszLCBcImNcIl0sXG4gKiAgICAgWzQsIFwiZFwiXSxcbiAqICAgXSxcbiAqICk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHppcDxUIGV4dGVuZHMgdW5rbm93bltdPihcbiAgLi4uYXJyYXlzOiB7IFtLIGluIGtleW9mIFRdOiBSZWFkb25seUFycmF5PFRbS10+IH1cbik6IFRbXSB7XG4gIGNvbnN0IG1pbkxlbmd0aCA9IG1pbk9mKGFycmF5cywgKGVsZW1lbnQpID0+IGVsZW1lbnQubGVuZ3RoKSA/PyAwO1xuXG4gIGNvbnN0IHJlc3VsdDogVFtdID0gbmV3IEFycmF5KG1pbkxlbmd0aCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtaW5MZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbnN0IGFyciA9IGFycmF5cy5tYXAoKGl0KSA9PiBpdFtpXSk7XG4gICAgcmVzdWx0W2ldID0gYXJyIGFzIFQ7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxLQUFLLFFBQVEsY0FBYztBQUVwQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E2QkMsR0FDRCxPQUFPLFNBQVMsSUFDZCxHQUFHLE1BQStDO0VBRWxELE1BQU0sWUFBWSxNQUFNLFFBQVEsQ0FBQyxVQUFZLFFBQVEsTUFBTSxLQUFLO0VBRWhFLE1BQU0sU0FBYyxJQUFJLE1BQU07RUFFOUIsSUFBSyxJQUFJLElBQUksR0FBRyxJQUFJLFdBQVcsS0FBSyxFQUFHO0lBQ3JDLE1BQU0sTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLEtBQU8sRUFBRSxDQUFDLEVBQUU7SUFDcEMsTUFBTSxDQUFDLEVBQUUsR0FBRztFQUNkO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=13693580783676402874,7741020132120413938