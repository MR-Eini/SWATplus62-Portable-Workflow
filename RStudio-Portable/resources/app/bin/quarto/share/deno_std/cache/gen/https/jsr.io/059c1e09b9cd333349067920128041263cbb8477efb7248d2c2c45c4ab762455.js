// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { OPERATORS } from "./_constants.ts";
import { ALL, NONE } from "./constants.ts";
import { isSemVer } from "./is_semver.ts";
function isComparator(value) {
  if (value === null || value === undefined || Array.isArray(value) || typeof value !== "object") return false;
  if (value === NONE || value === ALL) return true;
  const { operator } = value;
  return (operator === undefined || OPERATORS.includes(operator)) && isSemVer(value);
}
/**
 * Does a deep check on the object to determine if its a valid range.
 *
 * Objects with extra fields are still considered valid if they have at
 * least the correct fields.
 *
 * Adds a type assertion if true.
 *
 * @example Usage
 * ```ts
 * import { isRange } from "@std/semver/is-range";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const range = [[{ major: 1, minor: 2, patch: 3 }]];
 * assert(isRange(range));
 * assertFalse(isRange({}));
 * ```
 * @param value The value to check if its a valid Range
 * @returns True if its a valid Range otherwise false.
 */ export function isRange(value) {
  return Array.isArray(value) && value.every((r)=>Array.isArray(r) && r.every((c)=>isComparator(c)));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvaXNfcmFuZ2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB0eXBlIHsgQ29tcGFyYXRvciwgUmFuZ2UgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHsgT1BFUkFUT1JTIH0gZnJvbSBcIi4vX2NvbnN0YW50cy50c1wiO1xuaW1wb3J0IHsgQUxMLCBOT05FIH0gZnJvbSBcIi4vY29uc3RhbnRzLnRzXCI7XG5pbXBvcnQgeyBpc1NlbVZlciB9IGZyb20gXCIuL2lzX3NlbXZlci50c1wiO1xuXG5mdW5jdGlvbiBpc0NvbXBhcmF0b3IodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBDb21wYXJhdG9yIHtcbiAgaWYgKFxuICAgIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHxcbiAgICB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCJcbiAgKSByZXR1cm4gZmFsc2U7XG4gIGlmICh2YWx1ZSA9PT0gTk9ORSB8fCB2YWx1ZSA9PT0gQUxMKSByZXR1cm4gdHJ1ZTtcbiAgY29uc3QgeyBvcGVyYXRvciB9ID0gdmFsdWUgYXMgQ29tcGFyYXRvcjtcbiAgcmV0dXJuIChcbiAgICAob3BlcmF0b3IgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgT1BFUkFUT1JTLmluY2x1ZGVzKG9wZXJhdG9yKSkgJiZcbiAgICBpc1NlbVZlcih2YWx1ZSlcbiAgKTtcbn1cblxuLyoqXG4gKiBEb2VzIGEgZGVlcCBjaGVjayBvbiB0aGUgb2JqZWN0IHRvIGRldGVybWluZSBpZiBpdHMgYSB2YWxpZCByYW5nZS5cbiAqXG4gKiBPYmplY3RzIHdpdGggZXh0cmEgZmllbGRzIGFyZSBzdGlsbCBjb25zaWRlcmVkIHZhbGlkIGlmIHRoZXkgaGF2ZSBhdFxuICogbGVhc3QgdGhlIGNvcnJlY3QgZmllbGRzLlxuICpcbiAqIEFkZHMgYSB0eXBlIGFzc2VydGlvbiBpZiB0cnVlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgaXNSYW5nZSB9IGZyb20gXCJAc3RkL3NlbXZlci9pcy1yYW5nZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0LCBhc3NlcnRGYWxzZSB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHJhbmdlID0gW1t7IG1ham9yOiAxLCBtaW5vcjogMiwgcGF0Y2g6IDMgfV1dO1xuICogYXNzZXJ0KGlzUmFuZ2UocmFuZ2UpKTtcbiAqIGFzc2VydEZhbHNlKGlzUmFuZ2Uoe30pKTtcbiAqIGBgYFxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjayBpZiBpdHMgYSB2YWxpZCBSYW5nZVxuICogQHJldHVybnMgVHJ1ZSBpZiBpdHMgYSB2YWxpZCBSYW5nZSBvdGhlcndpc2UgZmFsc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1JhbmdlKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUmFuZ2Uge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiZcbiAgICB2YWx1ZS5ldmVyeSgocikgPT4gQXJyYXkuaXNBcnJheShyKSAmJiByLmV2ZXJ5KChjKSA9PiBpc0NvbXBhcmF0b3IoYykpKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsU0FBUyxRQUFRLGtCQUFrQjtBQUM1QyxTQUFTLEdBQUcsRUFBRSxJQUFJLFFBQVEsaUJBQWlCO0FBQzNDLFNBQVMsUUFBUSxRQUFRLGlCQUFpQjtBQUUxQyxTQUFTLGFBQWEsS0FBYztFQUNsQyxJQUNFLFVBQVUsUUFBUSxVQUFVLGFBQWEsTUFBTSxPQUFPLENBQUMsVUFDdkQsT0FBTyxVQUFVLFVBQ2pCLE9BQU87RUFDVCxJQUFJLFVBQVUsUUFBUSxVQUFVLEtBQUssT0FBTztFQUM1QyxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDckIsT0FDRSxDQUFDLGFBQWEsYUFDWixVQUFVLFFBQVEsQ0FBQyxTQUFTLEtBQzlCLFNBQVM7QUFFYjtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBQ0QsT0FBTyxTQUFTLFFBQVEsS0FBYztFQUNwQyxPQUFPLE1BQU0sT0FBTyxDQUFDLFVBQ25CLE1BQU0sS0FBSyxDQUFDLENBQUMsSUFBTSxNQUFNLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBTSxhQUFhO0FBQ3ZFIn0=
// denoCacheMetadata=3748562007326727714,15387999461384448192