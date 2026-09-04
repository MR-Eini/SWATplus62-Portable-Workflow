// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Options for {@linkcode slidingWindows}. */ /**
 * Generates sliding views of the given array of the given size and returns a
 * new array containing all of them.
 *
 * If step is set, each window will start that many elements after the last
 * window's start. (Default: 1)
 *
 * If partial is set, windows will be generated for the last elements of the
 * collection, resulting in some undefined values if size is greater than 1.
 *
 * @template T The type of the array elements.
 *
 * @param array The array to generate sliding windows from.
 * @param size The size of the sliding windows.
 * @param options The options for generating sliding windows.
 *
 * @returns A new array containing all sliding windows of the given size.
 *
 * @example Usage
 * ```ts
 * import { slidingWindows } from "@std/collections/sliding-windows";
 * import { assertEquals } from "@std/assert/assert-equals";
 * const numbers = [1, 2, 3, 4, 5];
 *
 * const windows = slidingWindows(numbers, 3);
 * assertEquals(windows, [
 *   [1, 2, 3],
 *   [2, 3, 4],
 *   [3, 4, 5],
 * ]);
 *
 * const windowsWithStep = slidingWindows(numbers, 3, { step: 2 });
 * assertEquals(windowsWithStep, [
 *   [1, 2, 3],
 *   [3, 4, 5],
 * ]);
 *
 * const windowsWithPartial = slidingWindows(numbers, 3, { partial: true });
 * assertEquals(windowsWithPartial, [
 *   [1, 2, 3],
 *   [2, 3, 4],
 *   [3, 4, 5],
 *   [4, 5],
 *   [5],
 * ]);
 * ```
 */ export function slidingWindows(array, size, options = {}) {
  const { step = 1, partial = false } = options;
  if (!Number.isInteger(size) || !Number.isInteger(step) || size <= 0 || step <= 0) {
    throw new RangeError("Both size and step must be positive integer.");
  }
  return Array.from({
    length: Math.floor((array.length - (partial ? 1 : size)) / step + 1)
  }, (_, i)=>array.slice(i * step, i * step + size));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9zbGlkaW5nX3dpbmRvd3MudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqIE9wdGlvbnMgZm9yIHtAbGlua2NvZGUgc2xpZGluZ1dpbmRvd3N9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBTbGlkaW5nV2luZG93c09wdGlvbnMge1xuICAvKipcbiAgICogSWYgc3RlcCBpcyBzZXQsIGVhY2ggd2luZG93IHdpbGwgc3RhcnQgdGhhdCBtYW55IGVsZW1lbnRzIGFmdGVyIHRoZSBsYXN0XG4gICAqIHdpbmRvdydzIHN0YXJ0LlxuICAgKlxuICAgKiBAZGVmYXVsdCB7MX1cbiAgICovXG4gIHN0ZXA/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBJZiBwYXJ0aWFsIGlzIHNldCwgd2luZG93cyB3aWxsIGJlIGdlbmVyYXRlZCBmb3IgdGhlIGxhc3QgZWxlbWVudHMgb2YgdGhlXG4gICAqIGNvbGxlY3Rpb24sIHJlc3VsdGluZyBpbiBzb21lIHVuZGVmaW5lZCB2YWx1ZXMgaWYgc2l6ZSBpcyBncmVhdGVyIHRoYW4gMS5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgcGFydGlhbD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHNsaWRpbmcgdmlld3Mgb2YgdGhlIGdpdmVuIGFycmF5IG9mIHRoZSBnaXZlbiBzaXplIGFuZCByZXR1cm5zIGFcbiAqIG5ldyBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGVtLlxuICpcbiAqIElmIHN0ZXAgaXMgc2V0LCBlYWNoIHdpbmRvdyB3aWxsIHN0YXJ0IHRoYXQgbWFueSBlbGVtZW50cyBhZnRlciB0aGUgbGFzdFxuICogd2luZG93J3Mgc3RhcnQuIChEZWZhdWx0OiAxKVxuICpcbiAqIElmIHBhcnRpYWwgaXMgc2V0LCB3aW5kb3dzIHdpbGwgYmUgZ2VuZXJhdGVkIGZvciB0aGUgbGFzdCBlbGVtZW50cyBvZiB0aGVcbiAqIGNvbGxlY3Rpb24sIHJlc3VsdGluZyBpbiBzb21lIHVuZGVmaW5lZCB2YWx1ZXMgaWYgc2l6ZSBpcyBncmVhdGVyIHRoYW4gMS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdHlwZSBvZiB0aGUgYXJyYXkgZWxlbWVudHMuXG4gKlxuICogQHBhcmFtIGFycmF5IFRoZSBhcnJheSB0byBnZW5lcmF0ZSBzbGlkaW5nIHdpbmRvd3MgZnJvbS5cbiAqIEBwYXJhbSBzaXplIFRoZSBzaXplIG9mIHRoZSBzbGlkaW5nIHdpbmRvd3MuXG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgb3B0aW9ucyBmb3IgZ2VuZXJhdGluZyBzbGlkaW5nIHdpbmRvd3MuXG4gKlxuICogQHJldHVybnMgQSBuZXcgYXJyYXkgY29udGFpbmluZyBhbGwgc2xpZGluZyB3aW5kb3dzIG9mIHRoZSBnaXZlbiBzaXplLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgc2xpZGluZ1dpbmRvd3MgfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9ucy9zbGlkaW5nLXdpbmRvd3NcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKiBjb25zdCBudW1iZXJzID0gWzEsIDIsIDMsIDQsIDVdO1xuICpcbiAqIGNvbnN0IHdpbmRvd3MgPSBzbGlkaW5nV2luZG93cyhudW1iZXJzLCAzKTtcbiAqIGFzc2VydEVxdWFscyh3aW5kb3dzLCBbXG4gKiAgIFsxLCAyLCAzXSxcbiAqICAgWzIsIDMsIDRdLFxuICogICBbMywgNCwgNV0sXG4gKiBdKTtcbiAqXG4gKiBjb25zdCB3aW5kb3dzV2l0aFN0ZXAgPSBzbGlkaW5nV2luZG93cyhudW1iZXJzLCAzLCB7IHN0ZXA6IDIgfSk7XG4gKiBhc3NlcnRFcXVhbHMod2luZG93c1dpdGhTdGVwLCBbXG4gKiAgIFsxLCAyLCAzXSxcbiAqICAgWzMsIDQsIDVdLFxuICogXSk7XG4gKlxuICogY29uc3Qgd2luZG93c1dpdGhQYXJ0aWFsID0gc2xpZGluZ1dpbmRvd3MobnVtYmVycywgMywgeyBwYXJ0aWFsOiB0cnVlIH0pO1xuICogYXNzZXJ0RXF1YWxzKHdpbmRvd3NXaXRoUGFydGlhbCwgW1xuICogICBbMSwgMiwgM10sXG4gKiAgIFsyLCAzLCA0XSxcbiAqICAgWzMsIDQsIDVdLFxuICogICBbNCwgNV0sXG4gKiAgIFs1XSxcbiAqIF0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbGlkaW5nV2luZG93czxUPihcbiAgYXJyYXk6IHJlYWRvbmx5IFRbXSxcbiAgc2l6ZTogbnVtYmVyLFxuICBvcHRpb25zOiBTbGlkaW5nV2luZG93c09wdGlvbnMgPSB7fSxcbik6IFRbXVtdIHtcbiAgY29uc3QgeyBzdGVwID0gMSwgcGFydGlhbCA9IGZhbHNlIH0gPSBvcHRpb25zO1xuXG4gIGlmIChcbiAgICAhTnVtYmVyLmlzSW50ZWdlcihzaXplKSB8fCAhTnVtYmVyLmlzSW50ZWdlcihzdGVwKSB8fCBzaXplIDw9IDAgfHwgc3RlcCA8PSAwXG4gICkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiQm90aCBzaXplIGFuZCBzdGVwIG11c3QgYmUgcG9zaXRpdmUgaW50ZWdlci5cIik7XG4gIH1cblxuICByZXR1cm4gQXJyYXkuZnJvbShcbiAgICB7IGxlbmd0aDogTWF0aC5mbG9vcigoYXJyYXkubGVuZ3RoIC0gKHBhcnRpYWwgPyAxIDogc2l6ZSkpIC8gc3RlcCArIDEpIH0sXG4gICAgKF8sIGkpID0+IGFycmF5LnNsaWNlKGkgKiBzdGVwLCBpICogc3RlcCArIHNpemUpLFxuICApO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsNENBQTRDLEdBa0I1Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQThDQyxHQUNELE9BQU8sU0FBUyxlQUNkLEtBQW1CLEVBQ25CLElBQVksRUFDWixVQUFpQyxDQUFDLENBQUM7RUFFbkMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUFFLFVBQVUsS0FBSyxFQUFFLEdBQUc7RUFFdEMsSUFDRSxDQUFDLE9BQU8sU0FBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLFNBQVMsQ0FBQyxTQUFTLFFBQVEsS0FBSyxRQUFRLEdBQzNFO0lBQ0EsTUFBTSxJQUFJLFdBQVc7RUFDdkI7RUFFQSxPQUFPLE1BQU0sSUFBSSxDQUNmO0lBQUUsUUFBUSxLQUFLLEtBQUssQ0FBQyxDQUFDLE1BQU0sTUFBTSxHQUFHLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxJQUFJLE9BQU87RUFBRyxHQUN2RSxDQUFDLEdBQUcsSUFBTSxNQUFNLEtBQUssQ0FBQyxJQUFJLE1BQU0sSUFBSSxPQUFPO0FBRS9DIn0=
// denoCacheMetadata=6654211449463433911,8647293201692230253