// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Creates a new object by including the specified keys from the provided
 * object.
 *
 * @template T The type of the object.
 * @template K The type of the keys.
 *
 * @param obj The object to pick keys from.
 * @param keys The keys to include in the new object.
 *
 * @returns A new object with the specified keys from the provided object.
 *
 * @example Basic usage
 * ```ts
 * import { pick } from "@std/collections/pick";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const obj = { a: 5, b: 6, c: 7, d: 8 };
 * const picked = pick(obj, ["a", "c"]);
 *
 * assertEquals(picked, { a: 5, c: 7 });
 * ```
 */ export function pick(obj, keys) {
  return Object.fromEntries(keys.map((k)=>[
      k,
      obj[k]
    ]));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9waWNrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBvYmplY3QgYnkgaW5jbHVkaW5nIHRoZSBzcGVjaWZpZWQga2V5cyBmcm9tIHRoZSBwcm92aWRlZFxuICogb2JqZWN0LlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0eXBlIG9mIHRoZSBvYmplY3QuXG4gKiBAdGVtcGxhdGUgSyBUaGUgdHlwZSBvZiB0aGUga2V5cy5cbiAqXG4gKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgdG8gcGljayBrZXlzIGZyb20uXG4gKiBAcGFyYW0ga2V5cyBUaGUga2V5cyB0byBpbmNsdWRlIGluIHRoZSBuZXcgb2JqZWN0LlxuICpcbiAqIEByZXR1cm5zIEEgbmV3IG9iamVjdCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5cyBmcm9tIHRoZSBwcm92aWRlZCBvYmplY3QuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwaWNrIH0gZnJvbSBcIkBzdGQvY29sbGVjdGlvbnMvcGlja1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBvYmogPSB7IGE6IDUsIGI6IDYsIGM6IDcsIGQ6IDggfTtcbiAqIGNvbnN0IHBpY2tlZCA9IHBpY2sob2JqLCBbXCJhXCIsIFwiY1wiXSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKHBpY2tlZCwgeyBhOiA1LCBjOiA3IH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaWNrPFQgZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBUPihcbiAgb2JqOiBSZWFkb25seTxUPixcbiAga2V5czogcmVhZG9ubHkgS1tdLFxuKTogUGljazxULCBLPiB7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoa2V5cy5tYXAoKGspID0+IFtrLCBvYmpba11dKSkgYXMgUGljazxULCBLPjtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0JDLEdBQ0QsT0FBTyxTQUFTLEtBQ2QsR0FBZ0IsRUFDaEIsSUFBa0I7RUFFbEIsT0FBTyxPQUFPLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQU07TUFBQztNQUFHLEdBQUcsQ0FBQyxFQUFFO0tBQUM7QUFDdkQifQ==
// denoCacheMetadata=9999484574619158228,1349448840656842895