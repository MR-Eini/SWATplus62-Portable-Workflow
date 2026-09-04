// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns the index of the first occurrence of the needle array in the source
 * array, or -1 if it is not present.
 *
 * A start index can be specified as the third argument that begins the search
 * at that given index. The start index defaults to the start of the array.
 *
 * The complexity of this function is `O(source.length * needle.length)`.
 *
 * @param source Source array to check.
 * @param needle Needle array to check for.
 * @param start Start index in the source array to begin the search. Defaults to
 * 0.
 * @returns Index of the first occurrence of the needle array in the source
 * array, or -1 if it is not present.
 *
 * @example Basic usage
 * ```ts
 * import { indexOfNeedle } from "@std/bytes/index-of-needle";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 * const notNeedle = new Uint8Array([5, 0]);
 *
 * indexOfNeedle(source, needle); // 1
 * indexOfNeedle(source, notNeedle); // -1
 * ```
 *
 * @example Start index
 * ```ts
 * import { indexOfNeedle } from "@std/bytes/index-of-needle";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 *
 * indexOfNeedle(source, needle, 2); // 3
 * indexOfNeedle(source, needle, 6); // -1
 * ```
 * Defining a start index will begin the search at the specified index in the
 * source array.
 */ export function indexOfNeedle(source, needle, start = 0) {
  if (start >= source.length) {
    return -1;
  }
  if (start < 0) {
    start = Math.max(0, source.length + start);
  }
  const s = needle[0];
  for(let i = start; i < source.length; i++){
    if (source[i] !== s) continue;
    let matched = 1;
    let j = i + 1;
    while(matched < needle.length && source[j] === needle[j - i]){
      matched++;
      j++;
    }
    if (matched === needle.length) {
      return i;
    }
  }
  return -1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMC4yMjQuMC9pbmRleF9vZl9uZWVkbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgbmVlZGxlIGFycmF5IGluIHRoZSBzb3VyY2VcbiAqIGFycmF5LCBvciAtMSBpZiBpdCBpcyBub3QgcHJlc2VudC5cbiAqXG4gKiBBIHN0YXJ0IGluZGV4IGNhbiBiZSBzcGVjaWZpZWQgYXMgdGhlIHRoaXJkIGFyZ3VtZW50IHRoYXQgYmVnaW5zIHRoZSBzZWFyY2hcbiAqIGF0IHRoYXQgZ2l2ZW4gaW5kZXguIFRoZSBzdGFydCBpbmRleCBkZWZhdWx0cyB0byB0aGUgc3RhcnQgb2YgdGhlIGFycmF5LlxuICpcbiAqIFRoZSBjb21wbGV4aXR5IG9mIHRoaXMgZnVuY3Rpb24gaXMgYE8oc291cmNlLmxlbmd0aCAqIG5lZWRsZS5sZW5ndGgpYC5cbiAqXG4gKiBAcGFyYW0gc291cmNlIFNvdXJjZSBhcnJheSB0byBjaGVjay5cbiAqIEBwYXJhbSBuZWVkbGUgTmVlZGxlIGFycmF5IHRvIGNoZWNrIGZvci5cbiAqIEBwYXJhbSBzdGFydCBTdGFydCBpbmRleCBpbiB0aGUgc291cmNlIGFycmF5IHRvIGJlZ2luIHRoZSBzZWFyY2guIERlZmF1bHRzIHRvXG4gKiAwLlxuICogQHJldHVybnMgSW5kZXggb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIG5lZWRsZSBhcnJheSBpbiB0aGUgc291cmNlXG4gKiBhcnJheSwgb3IgLTEgaWYgaXQgaXMgbm90IHByZXNlbnQuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBpbmRleE9mTmVlZGxlIH0gZnJvbSBcIkBzdGQvYnl0ZXMvaW5kZXgtb2YtbmVlZGxlXCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDEsIDIsIDEsIDIsIDNdKTtcbiAqIGNvbnN0IG5lZWRsZSA9IG5ldyBVaW50OEFycmF5KFsxLCAyXSk7XG4gKiBjb25zdCBub3ROZWVkbGUgPSBuZXcgVWludDhBcnJheShbNSwgMF0pO1xuICpcbiAqIGluZGV4T2ZOZWVkbGUoc291cmNlLCBuZWVkbGUpOyAvLyAxXG4gKiBpbmRleE9mTmVlZGxlKHNvdXJjZSwgbm90TmVlZGxlKTsgLy8gLTFcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIFN0YXJ0IGluZGV4XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgaW5kZXhPZk5lZWRsZSB9IGZyb20gXCJAc3RkL2J5dGVzL2luZGV4LW9mLW5lZWRsZVwiO1xuICpcbiAqIGNvbnN0IHNvdXJjZSA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyLCAxLCAyLCAxLCAyLCAzXSk7XG4gKiBjb25zdCBuZWVkbGUgPSBuZXcgVWludDhBcnJheShbMSwgMl0pO1xuICpcbiAqIGluZGV4T2ZOZWVkbGUoc291cmNlLCBuZWVkbGUsIDIpOyAvLyAzXG4gKiBpbmRleE9mTmVlZGxlKHNvdXJjZSwgbmVlZGxlLCA2KTsgLy8gLTFcbiAqIGBgYFxuICogRGVmaW5pbmcgYSBzdGFydCBpbmRleCB3aWxsIGJlZ2luIHRoZSBzZWFyY2ggYXQgdGhlIHNwZWNpZmllZCBpbmRleCBpbiB0aGVcbiAqIHNvdXJjZSBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluZGV4T2ZOZWVkbGUoXG4gIHNvdXJjZTogVWludDhBcnJheSxcbiAgbmVlZGxlOiBVaW50OEFycmF5LFxuICBzdGFydCA9IDAsXG4pOiBudW1iZXIge1xuICBpZiAoc3RhcnQgPj0gc291cmNlLmxlbmd0aCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgPSBNYXRoLm1heCgwLCBzb3VyY2UubGVuZ3RoICsgc3RhcnQpO1xuICB9XG4gIGNvbnN0IHMgPSBuZWVkbGVbMF07XG4gIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IHNvdXJjZS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzb3VyY2VbaV0gIT09IHMpIGNvbnRpbnVlO1xuICAgIGxldCBtYXRjaGVkID0gMTtcbiAgICBsZXQgaiA9IGkgKyAxO1xuICAgIHdoaWxlIChtYXRjaGVkIDwgbmVlZGxlLmxlbmd0aCAmJiBzb3VyY2Vbal0gPT09IG5lZWRsZVtqIC0gaV0pIHtcbiAgICAgIG1hdGNoZWQrKztcbiAgICAgIGorKztcbiAgICB9XG4gICAgaWYgKG1hdGNoZWQgPT09IG5lZWRsZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdDQyxHQUNELE9BQU8sU0FBUyxjQUNkLE1BQWtCLEVBQ2xCLE1BQWtCLEVBQ2xCLFFBQVEsQ0FBQztFQUVULElBQUksU0FBUyxPQUFPLE1BQU0sRUFBRTtJQUMxQixPQUFPLENBQUM7RUFDVjtFQUNBLElBQUksUUFBUSxHQUFHO0lBQ2IsUUFBUSxLQUFLLEdBQUcsQ0FBQyxHQUFHLE9BQU8sTUFBTSxHQUFHO0VBQ3RDO0VBQ0EsTUFBTSxJQUFJLE1BQU0sQ0FBQyxFQUFFO0VBQ25CLElBQUssSUFBSSxJQUFJLE9BQU8sSUFBSSxPQUFPLE1BQU0sRUFBRSxJQUFLO0lBQzFDLElBQUksTUFBTSxDQUFDLEVBQUUsS0FBSyxHQUFHO0lBQ3JCLElBQUksVUFBVTtJQUNkLElBQUksSUFBSSxJQUFJO0lBQ1osTUFBTyxVQUFVLE9BQU8sTUFBTSxJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxDQUFFO01BQzdEO01BQ0E7SUFDRjtJQUNBLElBQUksWUFBWSxPQUFPLE1BQU0sRUFBRTtNQUM3QixPQUFPO0lBQ1Q7RUFDRjtFQUNBLE9BQU8sQ0FBQztBQUNWIn0=
// denoCacheMetadata=11442668519517388640,17841408344636142532