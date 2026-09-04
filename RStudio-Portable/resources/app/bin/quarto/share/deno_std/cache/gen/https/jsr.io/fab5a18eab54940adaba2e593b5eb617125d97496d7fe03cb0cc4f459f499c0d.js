// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { filterInPlace } from "./_utils.ts";
/**
 * Returns all distinct elements that appear at least once in each of the given
 * arrays.
 *
 * @template T The type of the elements in the input arrays.
 *
 * @param arrays The arrays to intersect.
 *
 * @returns An array of distinct elements that appear at least once in each of
 * the given arrays.
 *
 * @example Basic usage
 * ```ts
 * import { intersect } from "@std/collections/intersect";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const lisaInterests = ["Cooking", "Music", "Hiking"];
 * const kimInterests = ["Music", "Tennis", "Cooking"];
 * const commonInterests = intersect(lisaInterests, kimInterests);
 *
 * assertEquals(commonInterests, ["Cooking", "Music"]);
 * ```
 */ export function intersect(...arrays) {
  const [originalHead, ...tail] = arrays;
  const head = [
    ...new Set(originalHead)
  ];
  const tailSets = tail.map((it)=>new Set(it));
  for (const set of tailSets){
    filterInPlace(head, (it)=>set.has(it));
    if (head.length === 0) return head;
  }
  return head;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9pbnRlcnNlY3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgZmlsdGVySW5QbGFjZSB9IGZyb20gXCIuL191dGlscy50c1wiO1xuXG4vKipcbiAqIFJldHVybnMgYWxsIGRpc3RpbmN0IGVsZW1lbnRzIHRoYXQgYXBwZWFyIGF0IGxlYXN0IG9uY2UgaW4gZWFjaCBvZiB0aGUgZ2l2ZW5cbiAqIGFycmF5cy5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdHlwZSBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIGlucHV0IGFycmF5cy5cbiAqXG4gKiBAcGFyYW0gYXJyYXlzIFRoZSBhcnJheXMgdG8gaW50ZXJzZWN0LlxuICpcbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGRpc3RpbmN0IGVsZW1lbnRzIHRoYXQgYXBwZWFyIGF0IGxlYXN0IG9uY2UgaW4gZWFjaCBvZlxuICogdGhlIGdpdmVuIGFycmF5cy5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGludGVyc2VjdCB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL2ludGVyc2VjdFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBsaXNhSW50ZXJlc3RzID0gW1wiQ29va2luZ1wiLCBcIk11c2ljXCIsIFwiSGlraW5nXCJdO1xuICogY29uc3Qga2ltSW50ZXJlc3RzID0gW1wiTXVzaWNcIiwgXCJUZW5uaXNcIiwgXCJDb29raW5nXCJdO1xuICogY29uc3QgY29tbW9uSW50ZXJlc3RzID0gaW50ZXJzZWN0KGxpc2FJbnRlcmVzdHMsIGtpbUludGVyZXN0cyk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGNvbW1vbkludGVyZXN0cywgW1wiQ29va2luZ1wiLCBcIk11c2ljXCJdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJzZWN0PFQ+KC4uLmFycmF5czogKHJlYWRvbmx5IFRbXSlbXSk6IFRbXSB7XG4gIGNvbnN0IFtvcmlnaW5hbEhlYWQsIC4uLnRhaWxdID0gYXJyYXlzO1xuICBjb25zdCBoZWFkID0gWy4uLm5ldyBTZXQob3JpZ2luYWxIZWFkKV07XG4gIGNvbnN0IHRhaWxTZXRzID0gdGFpbC5tYXAoKGl0KSA9PiBuZXcgU2V0KGl0KSk7XG5cbiAgZm9yIChjb25zdCBzZXQgb2YgdGFpbFNldHMpIHtcbiAgICBmaWx0ZXJJblBsYWNlKGhlYWQsIChpdCkgPT4gc2V0LmhhcyhpdCkpO1xuICAgIGlmIChoZWFkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGhlYWQ7XG4gIH1cblxuICByZXR1cm4gaGVhZDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsYUFBYSxRQUFRLGNBQWM7QUFFNUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FzQkMsR0FDRCxPQUFPLFNBQVMsVUFBYSxHQUFHLE1BQXdCO0VBQ3RELE1BQU0sQ0FBQyxjQUFjLEdBQUcsS0FBSyxHQUFHO0VBQ2hDLE1BQU0sT0FBTztPQUFJLElBQUksSUFBSTtHQUFjO0VBQ3ZDLE1BQU0sV0FBVyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQU8sSUFBSSxJQUFJO0VBRTFDLEtBQUssTUFBTSxPQUFPLFNBQVU7SUFDMUIsY0FBYyxNQUFNLENBQUMsS0FBTyxJQUFJLEdBQUcsQ0FBQztJQUNwQyxJQUFJLEtBQUssTUFBTSxLQUFLLEdBQUcsT0FBTztFQUNoQztFQUVBLE9BQU87QUFDVCJ9
// denoCacheMetadata=15393850607567495266,11434395555095997862