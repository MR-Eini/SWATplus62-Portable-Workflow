// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { indexOfNeedle } from "./index_of_needle.ts";
/**
 * Determines whether the source array contains the needle array.
 *
 * The complexity of this function is `O(source.length * needle.length)`.
 *
 * @param source Source array to check.
 * @param needle Needle array to check for.
 * @param start Start index in the source array to begin the search. Defaults to
 * 0.
 * @returns `true` if the source array contains the needle array, `false`
 * otherwise.
 *
 * @example Basic usage
 * ```ts
 * import { includesNeedle } from "@std/bytes/includes-needle";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 *
 * includesNeedle(source, needle); // true
 * ```
 *
 * @example Start index
 * ```ts
 * import { includesNeedle } from "@std/bytes/includes-needle";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 *
 * includesNeedle(source, needle, 6); // false
 * ```
 * The search will start at the specified index in the source array.
 */ export function includesNeedle(source, needle, start = 0) {
  return indexOfNeedle(source, needle, start) !== -1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMC4yMjQuMC9pbmNsdWRlc19uZWVkbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgaW5kZXhPZk5lZWRsZSB9IGZyb20gXCIuL2luZGV4X29mX25lZWRsZS50c1wiO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc291cmNlIGFycmF5IGNvbnRhaW5zIHRoZSBuZWVkbGUgYXJyYXkuXG4gKlxuICogVGhlIGNvbXBsZXhpdHkgb2YgdGhpcyBmdW5jdGlvbiBpcyBgTyhzb3VyY2UubGVuZ3RoICogbmVlZGxlLmxlbmd0aClgLlxuICpcbiAqIEBwYXJhbSBzb3VyY2UgU291cmNlIGFycmF5IHRvIGNoZWNrLlxuICogQHBhcmFtIG5lZWRsZSBOZWVkbGUgYXJyYXkgdG8gY2hlY2sgZm9yLlxuICogQHBhcmFtIHN0YXJ0IFN0YXJ0IGluZGV4IGluIHRoZSBzb3VyY2UgYXJyYXkgdG8gYmVnaW4gdGhlIHNlYXJjaC4gRGVmYXVsdHMgdG9cbiAqIDAuXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHNvdXJjZSBhcnJheSBjb250YWlucyB0aGUgbmVlZGxlIGFycmF5LCBgZmFsc2VgXG4gKiBvdGhlcndpc2UuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBpbmNsdWRlc05lZWRsZSB9IGZyb20gXCJAc3RkL2J5dGVzL2luY2x1ZGVzLW5lZWRsZVwiO1xuICpcbiAqIGNvbnN0IHNvdXJjZSA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyLCAxLCAyLCAxLCAyLCAzXSk7XG4gKiBjb25zdCBuZWVkbGUgPSBuZXcgVWludDhBcnJheShbMSwgMl0pO1xuICpcbiAqIGluY2x1ZGVzTmVlZGxlKHNvdXJjZSwgbmVlZGxlKTsgLy8gdHJ1ZVxuICogYGBgXG4gKlxuICogQGV4YW1wbGUgU3RhcnQgaW5kZXhcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBpbmNsdWRlc05lZWRsZSB9IGZyb20gXCJAc3RkL2J5dGVzL2luY2x1ZGVzLW5lZWRsZVwiO1xuICpcbiAqIGNvbnN0IHNvdXJjZSA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyLCAxLCAyLCAxLCAyLCAzXSk7XG4gKiBjb25zdCBuZWVkbGUgPSBuZXcgVWludDhBcnJheShbMSwgMl0pO1xuICpcbiAqIGluY2x1ZGVzTmVlZGxlKHNvdXJjZSwgbmVlZGxlLCA2KTsgLy8gZmFsc2VcbiAqIGBgYFxuICogVGhlIHNlYXJjaCB3aWxsIHN0YXJ0IGF0IHRoZSBzcGVjaWZpZWQgaW5kZXggaW4gdGhlIHNvdXJjZSBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluY2x1ZGVzTmVlZGxlKFxuICBzb3VyY2U6IFVpbnQ4QXJyYXksXG4gIG5lZWRsZTogVWludDhBcnJheSxcbiAgc3RhcnQgPSAwLFxuKTogYm9vbGVhbiB7XG4gIHJldHVybiBpbmRleE9mTmVlZGxlKHNvdXJjZSwgbmVlZGxlLCBzdGFydCkgIT09IC0xO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxhQUFhLFFBQVEsdUJBQXVCO0FBRXJEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWdDQyxHQUNELE9BQU8sU0FBUyxlQUNkLE1BQWtCLEVBQ2xCLE1BQWtCLEVBQ2xCLFFBQVEsQ0FBQztFQUVULE9BQU8sY0FBYyxRQUFRLFFBQVEsV0FBVyxDQUFDO0FBQ25EIn0=
// denoCacheMetadata=18113003619897337643,864704018972451964