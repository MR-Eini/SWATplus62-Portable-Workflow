// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { ANY, INVALID } from "./constants.ts";
import { isValidNumber, isValidString } from "./_shared.ts";
/**
 * Checks to see if value is a valid SemVer object. It does a check
 * into each field including prerelease and build.
 *
 * Some invalid SemVer sentinels can still return true such as ANY and INVALID.
 * An object which has the same value as a sentinel but isn't reference equal
 * will still fail.
 *
 * Objects which are valid SemVer objects but have _extra_ fields are still
 * considered SemVer objects and this will return true.
 *
 * A type assertion is added to the value.
 *
 * @example Usage
 * ```ts
 * import { isSemVer } from "@std/semver/is-semver";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const value = {
 *   major: 1,
 *   minor: 2,
 *   patch: 3,
 * };
 *
 * assert(isSemVer(value));
 * assertFalse(isSemVer({ major: 1, minor: 2 }));
 * ```
 *
 * @param value The value to check to see if its a valid SemVer object
 * @returns True if value is a valid SemVer otherwise false
 */ export function isSemVer(value) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return false;
  if (typeof value !== "object") return false;
  if (value === INVALID) return true;
  if (value === ANY) return true;
  const { major, minor, patch, build = [], prerelease = [] } = value;
  return isValidNumber(major) && isValidNumber(minor) && isValidNumber(patch) && Array.isArray(prerelease) && prerelease.every((v)=>isValidString(v) || isValidNumber(v)) && Array.isArray(build) && build.every(isValidString);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvaXNfc2VtdmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBBTlksIElOVkFMSUQgfSBmcm9tIFwiLi9jb25zdGFudHMudHNcIjtcbmltcG9ydCB0eXBlIHsgU2VtVmVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IGlzVmFsaWROdW1iZXIsIGlzVmFsaWRTdHJpbmcgfSBmcm9tIFwiLi9fc2hhcmVkLnRzXCI7XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiB2YWx1ZSBpcyBhIHZhbGlkIFNlbVZlciBvYmplY3QuIEl0IGRvZXMgYSBjaGVja1xuICogaW50byBlYWNoIGZpZWxkIGluY2x1ZGluZyBwcmVyZWxlYXNlIGFuZCBidWlsZC5cbiAqXG4gKiBTb21lIGludmFsaWQgU2VtVmVyIHNlbnRpbmVscyBjYW4gc3RpbGwgcmV0dXJuIHRydWUgc3VjaCBhcyBBTlkgYW5kIElOVkFMSUQuXG4gKiBBbiBvYmplY3Qgd2hpY2ggaGFzIHRoZSBzYW1lIHZhbHVlIGFzIGEgc2VudGluZWwgYnV0IGlzbid0IHJlZmVyZW5jZSBlcXVhbFxuICogd2lsbCBzdGlsbCBmYWlsLlxuICpcbiAqIE9iamVjdHMgd2hpY2ggYXJlIHZhbGlkIFNlbVZlciBvYmplY3RzIGJ1dCBoYXZlIF9leHRyYV8gZmllbGRzIGFyZSBzdGlsbFxuICogY29uc2lkZXJlZCBTZW1WZXIgb2JqZWN0cyBhbmQgdGhpcyB3aWxsIHJldHVybiB0cnVlLlxuICpcbiAqIEEgdHlwZSBhc3NlcnRpb24gaXMgYWRkZWQgdG8gdGhlIHZhbHVlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgaXNTZW1WZXIgfSBmcm9tIFwiQHN0ZC9zZW12ZXIvaXMtc2VtdmVyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnQsIGFzc2VydEZhbHNlIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3QgdmFsdWUgPSB7XG4gKiAgIG1ham9yOiAxLFxuICogICBtaW5vcjogMixcbiAqICAgcGF0Y2g6IDMsXG4gKiB9O1xuICpcbiAqIGFzc2VydChpc1NlbVZlcih2YWx1ZSkpO1xuICogYXNzZXJ0RmFsc2UoaXNTZW1WZXIoeyBtYWpvcjogMSwgbWlub3I6IDIgfSkpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjayB0byBzZWUgaWYgaXRzIGEgdmFsaWQgU2VtVmVyIG9iamVjdFxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZhbGlkIFNlbVZlciBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2VtVmVyKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgU2VtVmVyIHtcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIpIHJldHVybiBmYWxzZTtcbiAgaWYgKHZhbHVlID09PSBJTlZBTElEKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKHZhbHVlID09PSBBTlkpIHJldHVybiB0cnVlO1xuXG4gIGNvbnN0IHtcbiAgICBtYWpvcixcbiAgICBtaW5vcixcbiAgICBwYXRjaCxcbiAgICBidWlsZCA9IFtdLFxuICAgIHByZXJlbGVhc2UgPSBbXSxcbiAgfSA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICByZXR1cm4gKFxuICAgIGlzVmFsaWROdW1iZXIobWFqb3IpICYmXG4gICAgaXNWYWxpZE51bWJlcihtaW5vcikgJiZcbiAgICBpc1ZhbGlkTnVtYmVyKHBhdGNoKSAmJlxuICAgIEFycmF5LmlzQXJyYXkocHJlcmVsZWFzZSkgJiZcbiAgICBwcmVyZWxlYXNlLmV2ZXJ5KCh2KSA9PiBpc1ZhbGlkU3RyaW5nKHYpIHx8IGlzVmFsaWROdW1iZXIodikpICYmXG4gICAgQXJyYXkuaXNBcnJheShidWlsZCkgJiZcbiAgICBidWlsZC5ldmVyeShpc1ZhbGlkU3RyaW5nKVxuICApO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsU0FBUyxHQUFHLEVBQUUsT0FBTyxRQUFRLGlCQUFpQjtBQUU5QyxTQUFTLGFBQWEsRUFBRSxhQUFhLFFBQVEsZUFBZTtBQUU1RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBOEJDLEdBQ0QsT0FBTyxTQUFTLFNBQVMsS0FBYztFQUNyQyxJQUFJLFVBQVUsUUFBUSxVQUFVLFdBQVcsT0FBTztFQUNsRCxJQUFJLE1BQU0sT0FBTyxDQUFDLFFBQVEsT0FBTztFQUNqQyxJQUFJLE9BQU8sVUFBVSxVQUFVLE9BQU87RUFDdEMsSUFBSSxVQUFVLFNBQVMsT0FBTztFQUM5QixJQUFJLFVBQVUsS0FBSyxPQUFPO0VBRTFCLE1BQU0sRUFDSixLQUFLLEVBQ0wsS0FBSyxFQUNMLEtBQUssRUFDTCxRQUFRLEVBQUUsRUFDVixhQUFhLEVBQUUsRUFDaEIsR0FBRztFQUNKLE9BQ0UsY0FBYyxVQUNkLGNBQWMsVUFDZCxjQUFjLFVBQ2QsTUFBTSxPQUFPLENBQUMsZUFDZCxXQUFXLEtBQUssQ0FBQyxDQUFDLElBQU0sY0FBYyxNQUFNLGNBQWMsT0FDMUQsTUFBTSxPQUFPLENBQUMsVUFDZCxNQUFNLEtBQUssQ0FBQztBQUVoQiJ9
// denoCacheMetadata=8606309512176174077,1540927354811010794