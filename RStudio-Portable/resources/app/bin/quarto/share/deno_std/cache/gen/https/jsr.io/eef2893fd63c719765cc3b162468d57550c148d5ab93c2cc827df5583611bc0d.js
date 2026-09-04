// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Creates a new object by excluding the specified keys from the provided object.
 *
 * @template T The type of the object.
 * @template K The type of the keys to omit.
 *
 * @param obj The object to omit keys from.
 * @param keys The keys to omit from the object.
 *
 * @returns A new object with the specified keys omitted.
 *
 * @example Basic usage
 * ```ts
 * import { omit } from "@std/collections/omit";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const obj = { a: 5, b: 6, c: 7, d: 8 };
 * const omitted = omit(obj, ["a", "c"]);
 *
 * assertEquals(omitted, { b: 6, d: 8 });
 * ```
 */ export function omit(obj, keys) {
  const excludes = new Set(keys);
  return Object.fromEntries(Object.entries(obj).filter(([k, _])=>!excludes.has(k)));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9vbWl0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBvYmplY3QgYnkgZXhjbHVkaW5nIHRoZSBzcGVjaWZpZWQga2V5cyBmcm9tIHRoZSBwcm92aWRlZCBvYmplY3QuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGhlIG9iamVjdC5cbiAqIEB0ZW1wbGF0ZSBLIFRoZSB0eXBlIG9mIHRoZSBrZXlzIHRvIG9taXQuXG4gKlxuICogQHBhcmFtIG9iaiBUaGUgb2JqZWN0IHRvIG9taXQga2V5cyBmcm9tLlxuICogQHBhcmFtIGtleXMgVGhlIGtleXMgdG8gb21pdCBmcm9tIHRoZSBvYmplY3QuXG4gKlxuICogQHJldHVybnMgQSBuZXcgb2JqZWN0IHdpdGggdGhlIHNwZWNpZmllZCBrZXlzIG9taXR0ZWQuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBvbWl0IH0gZnJvbSBcIkBzdGQvY29sbGVjdGlvbnMvb21pdFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBvYmogPSB7IGE6IDUsIGI6IDYsIGM6IDcsIGQ6IDggfTtcbiAqIGNvbnN0IG9taXR0ZWQgPSBvbWl0KG9iaiwgW1wiYVwiLCBcImNcIl0pO1xuICpcbiAqIGFzc2VydEVxdWFscyhvbWl0dGVkLCB7IGI6IDYsIGQ6IDggfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9taXQ8VCBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIGtleW9mIFQ+KFxuICBvYmo6IFJlYWRvbmx5PFQ+LFxuICBrZXlzOiByZWFkb25seSBLW10sXG4pOiBPbWl0PFQsIEs+IHtcbiAgY29uc3QgZXhjbHVkZXMgPSBuZXcgU2V0KGtleXMpO1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKG9iaikuZmlsdGVyKChbaywgX10pID0+ICFleGNsdWRlcy5oYXMoayBhcyBLKSksXG4gICkgYXMgT21pdDxULCBLPjtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FxQkMsR0FDRCxPQUFPLFNBQVMsS0FDZCxHQUFnQixFQUNoQixJQUFrQjtFQUVsQixNQUFNLFdBQVcsSUFBSSxJQUFJO0VBQ3pCLE9BQU8sT0FBTyxXQUFXLENBQ3ZCLE9BQU8sT0FBTyxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDO0FBRXpEIn0=
// denoCacheMetadata=5257267538922913519,2498068516650230062