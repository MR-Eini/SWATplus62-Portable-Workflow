// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Builds all possible orders of all elements in the given array
 * Ignores equality of elements, meaning this will always return the same
 * number of permutations for a given length of input.
 *
 * @template T The type of the elements in the array.
 *
 * @param inputArray The array to build permutations from.
 *
 * @returns An array of all possible permutations of the given array.
 *
 * @example Basic usage
 * ```ts
 * import { permutations } from "@std/collections/permutations";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const numbers = [ 1, 2 ];
 * const windows = permutations(numbers);
 *
 * assertEquals(windows, [
 *   [ 1, 2 ],
 *   [ 2, 1 ],
 * ]);
 * ```
 */ export function permutations(inputArray) {
  const result = [];
  const array = [
    ...inputArray
  ];
  const k = array.length;
  if (k === 0) {
    return result;
  }
  // Heap's Algorithm
  const c = new Array(k).fill(0);
  result.push([
    ...array
  ]);
  let i = 1;
  while(i < k){
    if (c[i] < i) {
      if (i % 2 === 0) {
        [array[0], array[i]] = [
          array[i],
          array[0]
        ];
      } else {
        [array[c[i]], array[i]] = [
          array[i],
          array[c[i]]
        ];
      }
      result.push([
        ...array
      ]);
      c[i] += 1;
      i = 1;
    } else {
      c[i] = 0;
      i += 1;
    }
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9wZXJtdXRhdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBCdWlsZHMgYWxsIHBvc3NpYmxlIG9yZGVycyBvZiBhbGwgZWxlbWVudHMgaW4gdGhlIGdpdmVuIGFycmF5XG4gKiBJZ25vcmVzIGVxdWFsaXR5IG9mIGVsZW1lbnRzLCBtZWFuaW5nIHRoaXMgd2lsbCBhbHdheXMgcmV0dXJuIHRoZSBzYW1lXG4gKiBudW1iZXIgb2YgcGVybXV0YXRpb25zIGZvciBhIGdpdmVuIGxlbmd0aCBvZiBpbnB1dC5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdHlwZSBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIGFycmF5LlxuICpcbiAqIEBwYXJhbSBpbnB1dEFycmF5IFRoZSBhcnJheSB0byBidWlsZCBwZXJtdXRhdGlvbnMgZnJvbS5cbiAqXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBhbGwgcG9zc2libGUgcGVybXV0YXRpb25zIG9mIHRoZSBnaXZlbiBhcnJheS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBlcm11dGF0aW9ucyB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL3Blcm11dGF0aW9uc1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBudW1iZXJzID0gWyAxLCAyIF07XG4gKiBjb25zdCB3aW5kb3dzID0gcGVybXV0YXRpb25zKG51bWJlcnMpO1xuICpcbiAqIGFzc2VydEVxdWFscyh3aW5kb3dzLCBbXG4gKiAgIFsgMSwgMiBdLFxuICogICBbIDIsIDEgXSxcbiAqIF0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwZXJtdXRhdGlvbnM8VD4oaW5wdXRBcnJheTogSXRlcmFibGU8VD4pOiBUW11bXSB7XG4gIGNvbnN0IHJlc3VsdDogVFtdW10gPSBbXTtcblxuICBjb25zdCBhcnJheSA9IFsuLi5pbnB1dEFycmF5XTtcblxuICBjb25zdCBrID0gYXJyYXkubGVuZ3RoO1xuXG4gIGlmIChrID09PSAwKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIEhlYXAncyBBbGdvcml0aG1cbiAgY29uc3QgYyA9IG5ldyBBcnJheTxudW1iZXI+KGspLmZpbGwoMCk7XG5cbiAgcmVzdWx0LnB1c2goWy4uLmFycmF5XSk7XG5cbiAgbGV0IGkgPSAxO1xuXG4gIHdoaWxlIChpIDwgaykge1xuICAgIGlmIChjW2ldISA8IGkpIHtcbiAgICAgIGlmIChpICUgMiA9PT0gMCkge1xuICAgICAgICBbYXJyYXlbMF0sIGFycmF5W2ldXSA9IFthcnJheVtpXSwgYXJyYXlbMF1dIGFzIFtULCBUXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFthcnJheVtjW2ldIV0sIGFycmF5W2ldXSA9IFthcnJheVtpXSwgYXJyYXlbY1tpXSFdXSBhcyBbVCwgVF07XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdC5wdXNoKFsuLi5hcnJheV0pO1xuXG4gICAgICBjW2ldICs9IDE7XG4gICAgICBpID0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgY1tpXSA9IDA7XG4gICAgICBpICs9IDE7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3QkMsR0FDRCxPQUFPLFNBQVMsYUFBZ0IsVUFBdUI7RUFDckQsTUFBTSxTQUFnQixFQUFFO0VBRXhCLE1BQU0sUUFBUTtPQUFJO0dBQVc7RUFFN0IsTUFBTSxJQUFJLE1BQU0sTUFBTTtFQUV0QixJQUFJLE1BQU0sR0FBRztJQUNYLE9BQU87RUFDVDtFQUVBLG1CQUFtQjtFQUNuQixNQUFNLElBQUksSUFBSSxNQUFjLEdBQUcsSUFBSSxDQUFDO0VBRXBDLE9BQU8sSUFBSSxDQUFDO09BQUk7R0FBTTtFQUV0QixJQUFJLElBQUk7RUFFUixNQUFPLElBQUksRUFBRztJQUNaLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBSSxHQUFHO01BQ2IsSUFBSSxJQUFJLE1BQU0sR0FBRztRQUNmLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUc7VUFBQyxLQUFLLENBQUMsRUFBRTtVQUFFLEtBQUssQ0FBQyxFQUFFO1NBQUM7TUFDN0MsT0FBTztRQUNMLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUc7VUFBQyxLQUFLLENBQUMsRUFBRTtVQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFFO1NBQUM7TUFDckQ7TUFFQSxPQUFPLElBQUksQ0FBQztXQUFJO09BQU07TUFFdEIsQ0FBQyxDQUFDLEVBQUUsSUFBSTtNQUNSLElBQUk7SUFDTixPQUFPO01BQ0wsQ0FBQyxDQUFDLEVBQUUsR0FBRztNQUNQLEtBQUs7SUFDUDtFQUNGO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=3078958980346983210,2126091527552361326