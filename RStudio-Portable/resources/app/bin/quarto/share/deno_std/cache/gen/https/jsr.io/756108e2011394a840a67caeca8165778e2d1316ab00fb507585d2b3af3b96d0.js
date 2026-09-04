// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Helper functions for working with
 * {@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array | Uint8Array}
 * byte slices.
 *
 * ## Concatenate byte slices
 *
 * {@linkcode concat} concatenates an array of byte slices into a single slice.
 *
 * ```ts
 * import { concat } from "@std/bytes/concat";
 *
 * const a = new Uint8Array([0, 1, 2]);
 * const b = new Uint8Array([3, 4, 5]);
 * concat([a, b]); // Uint8Array(6) [ 0, 1, 2, 3, 4, 5 ]
 * ```
 *
 * ## Copy byte slices
 *
 * {@linkcode copy} copies bytes from the `src` array to the `dst` array and
 * returns the number of bytes copied.
 *
 * ```ts
 * import { copy } from "@std/bytes/copy";
 *
 * const src = new Uint8Array([9, 8, 7]);
 * const dst = new Uint8Array([0, 1, 2, 3, 4, 5]);
 *
 * copy(src, dst); // 3
 * dst; // Uint8Array(6) [9, 8, 7, 3, 4, 5]
 * ```
 *
 * ## Check if a byte slice ends with another byte slice
 *
 * {@linkcode endsWith} returns `true` if the suffix array appears at the end of
 * the source array, `false` otherwise.
 *
 * ```ts
 * import { endsWith } from "@std/bytes/ends-with";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const suffix = new Uint8Array([1, 2, 3]);
 *
 * endsWith(source, suffix); // true
 * ```
 *
 * ## Check if two byte slices are equal
 *
 * {@linkcode equals} checks whether byte slices are equal to each other.
 *
 * ```ts
 * import { equals } from "@std/bytes/equals";
 *
 * const a = new Uint8Array([1, 2, 3]);
 * const b = new Uint8Array([1, 2, 3]);
 * const c = new Uint8Array([4, 5, 6]);
 *
 * equals(a, b); // true
 * equals(b, c); // false
 * ```
 *
 * ## Check if a byte slice includes another byte slice
 *
 * {@linkcode includesNeedle} determines whether the source array contains the
 * needle array.
 *
 * ```ts
 * import { includesNeedle } from "@std/bytes/includes-needle";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 *
 * includesNeedle(source, needle); // true
 * ```
 *
 * ## Find the index of a byte slice in another byte slice
 *
 * {@linkcode indexOfNeedle} returns the index of the first occurrence of the
 * needle array in the source array, or -1 if it is not present.
 *
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
 * ## Find the last index of a byte slice in another byte slice
 *
 * {@linkcode lastIndexOfNeedle} returns the index of the last occurrence of the
 * needle array in the source array, or -1 if it is not present.
 *
 * ```ts
 * import { lastIndexOfNeedle } from "@std/bytes/last-index-of-needle";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 * const notNeedle = new Uint8Array([5, 0]);
 *
 * lastIndexOfNeedle(source, needle); // 5
 * lastIndexOfNeedle(source, notNeedle); // -1
 * ```
 *
 * ## Repeat a byte slice
 *
 * {@linkcode repeat} returns a new byte slice composed of `count` repetitions
 * of the `source` array.
 *
 * ```ts
 * import { repeat } from "@std/bytes/repeat";
 *
 * const source = new Uint8Array([0, 1, 2]);
 *
 * repeat(source, 3); // Uint8Array(9) [0, 1, 2, 0, 1, 2, 0, 1, 2]
 *
 * repeat(source, 0); // Uint8Array(0) []
 *
 * repeat(source, -1); // Throws `RangeError`
 * ```
 *
 * ## Check if a byte slice starts with another byte slice
 *
 * {@linkcode startsWith} returns `true` if the prefix array appears at the start
 * of the source array, `false` otherwise.
 *
 * ```ts
 * import { startsWith } from "@std/bytes/starts-with";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const prefix = new Uint8Array([0, 1, 2]);
 *
 * startsWith(source, prefix); // true
 * ```
 *
 * @module
 */ export * from "./concat.ts";
export * from "./copy.ts";
export * from "./ends_with.ts";
export * from "./equals.ts";
export * from "./includes_needle.ts";
export * from "./index_of_needle.ts";
export * from "./last_index_of_needle.ts";
export * from "./repeat.ts";
export * from "./starts_with.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMC4yMjQuMC9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb25zIGZvciB3b3JraW5nIHdpdGhcbiAqIHtAbGlua2NvZGUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvVWludDhBcnJheSB8IFVpbnQ4QXJyYXl9XG4gKiBieXRlIHNsaWNlcy5cbiAqXG4gKiAjIyBDb25jYXRlbmF0ZSBieXRlIHNsaWNlc1xuICpcbiAqIHtAbGlua2NvZGUgY29uY2F0fSBjb25jYXRlbmF0ZXMgYW4gYXJyYXkgb2YgYnl0ZSBzbGljZXMgaW50byBhIHNpbmdsZSBzbGljZS5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY29uY2F0IH0gZnJvbSBcIkBzdGQvYnl0ZXMvY29uY2F0XCI7XG4gKlxuICogY29uc3QgYSA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyXSk7XG4gKiBjb25zdCBiID0gbmV3IFVpbnQ4QXJyYXkoWzMsIDQsIDVdKTtcbiAqIGNvbmNhdChbYSwgYl0pOyAvLyBVaW50OEFycmF5KDYpIFsgMCwgMSwgMiwgMywgNCwgNSBdXG4gKiBgYGBcbiAqXG4gKiAjIyBDb3B5IGJ5dGUgc2xpY2VzXG4gKlxuICoge0BsaW5rY29kZSBjb3B5fSBjb3BpZXMgYnl0ZXMgZnJvbSB0aGUgYHNyY2AgYXJyYXkgdG8gdGhlIGBkc3RgIGFycmF5IGFuZFxuICogcmV0dXJucyB0aGUgbnVtYmVyIG9mIGJ5dGVzIGNvcGllZC5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY29weSB9IGZyb20gXCJAc3RkL2J5dGVzL2NvcHlcIjtcbiAqXG4gKiBjb25zdCBzcmMgPSBuZXcgVWludDhBcnJheShbOSwgOCwgN10pO1xuICogY29uc3QgZHN0ID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDMsIDQsIDVdKTtcbiAqXG4gKiBjb3B5KHNyYywgZHN0KTsgLy8gM1xuICogZHN0OyAvLyBVaW50OEFycmF5KDYpIFs5LCA4LCA3LCAzLCA0LCA1XVxuICogYGBgXG4gKlxuICogIyMgQ2hlY2sgaWYgYSBieXRlIHNsaWNlIGVuZHMgd2l0aCBhbm90aGVyIGJ5dGUgc2xpY2VcbiAqXG4gKiB7QGxpbmtjb2RlIGVuZHNXaXRofSByZXR1cm5zIGB0cnVlYCBpZiB0aGUgc3VmZml4IGFycmF5IGFwcGVhcnMgYXQgdGhlIGVuZCBvZlxuICogdGhlIHNvdXJjZSBhcnJheSwgYGZhbHNlYCBvdGhlcndpc2UuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVuZHNXaXRoIH0gZnJvbSBcIkBzdGQvYnl0ZXMvZW5kcy13aXRoXCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDEsIDIsIDEsIDIsIDNdKTtcbiAqIGNvbnN0IHN1ZmZpeCA9IG5ldyBVaW50OEFycmF5KFsxLCAyLCAzXSk7XG4gKlxuICogZW5kc1dpdGgoc291cmNlLCBzdWZmaXgpOyAvLyB0cnVlXG4gKiBgYGBcbiAqXG4gKiAjIyBDaGVjayBpZiB0d28gYnl0ZSBzbGljZXMgYXJlIGVxdWFsXG4gKlxuICoge0BsaW5rY29kZSBlcXVhbHN9IGNoZWNrcyB3aGV0aGVyIGJ5dGUgc2xpY2VzIGFyZSBlcXVhbCB0byBlYWNoIG90aGVyLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlcXVhbHMgfSBmcm9tIFwiQHN0ZC9ieXRlcy9lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBhID0gbmV3IFVpbnQ4QXJyYXkoWzEsIDIsIDNdKTtcbiAqIGNvbnN0IGIgPSBuZXcgVWludDhBcnJheShbMSwgMiwgM10pO1xuICogY29uc3QgYyA9IG5ldyBVaW50OEFycmF5KFs0LCA1LCA2XSk7XG4gKlxuICogZXF1YWxzKGEsIGIpOyAvLyB0cnVlXG4gKiBlcXVhbHMoYiwgYyk7IC8vIGZhbHNlXG4gKiBgYGBcbiAqXG4gKiAjIyBDaGVjayBpZiBhIGJ5dGUgc2xpY2UgaW5jbHVkZXMgYW5vdGhlciBieXRlIHNsaWNlXG4gKlxuICoge0BsaW5rY29kZSBpbmNsdWRlc05lZWRsZX0gZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzb3VyY2UgYXJyYXkgY29udGFpbnMgdGhlXG4gKiBuZWVkbGUgYXJyYXkuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGluY2x1ZGVzTmVlZGxlIH0gZnJvbSBcIkBzdGQvYnl0ZXMvaW5jbHVkZXMtbmVlZGxlXCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDEsIDIsIDEsIDIsIDNdKTtcbiAqIGNvbnN0IG5lZWRsZSA9IG5ldyBVaW50OEFycmF5KFsxLCAyXSk7XG4gKlxuICogaW5jbHVkZXNOZWVkbGUoc291cmNlLCBuZWVkbGUpOyAvLyB0cnVlXG4gKiBgYGBcbiAqXG4gKiAjIyBGaW5kIHRoZSBpbmRleCBvZiBhIGJ5dGUgc2xpY2UgaW4gYW5vdGhlciBieXRlIHNsaWNlXG4gKlxuICoge0BsaW5rY29kZSBpbmRleE9mTmVlZGxlfSByZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGVcbiAqIG5lZWRsZSBhcnJheSBpbiB0aGUgc291cmNlIGFycmF5LCBvciAtMSBpZiBpdCBpcyBub3QgcHJlc2VudC5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgaW5kZXhPZk5lZWRsZSB9IGZyb20gXCJAc3RkL2J5dGVzL2luZGV4LW9mLW5lZWRsZVwiO1xuICpcbiAqIGNvbnN0IHNvdXJjZSA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyLCAxLCAyLCAxLCAyLCAzXSk7XG4gKiBjb25zdCBuZWVkbGUgPSBuZXcgVWludDhBcnJheShbMSwgMl0pO1xuICogY29uc3Qgbm90TmVlZGxlID0gbmV3IFVpbnQ4QXJyYXkoWzUsIDBdKTtcbiAqXG4gKiBpbmRleE9mTmVlZGxlKHNvdXJjZSwgbmVlZGxlKTsgLy8gMVxuICogaW5kZXhPZk5lZWRsZShzb3VyY2UsIG5vdE5lZWRsZSk7IC8vIC0xXG4gKiBgYGBcbiAqXG4gKiAjIyBGaW5kIHRoZSBsYXN0IGluZGV4IG9mIGEgYnl0ZSBzbGljZSBpbiBhbm90aGVyIGJ5dGUgc2xpY2VcbiAqXG4gKiB7QGxpbmtjb2RlIGxhc3RJbmRleE9mTmVlZGxlfSByZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZVxuICogbmVlZGxlIGFycmF5IGluIHRoZSBzb3VyY2UgYXJyYXksIG9yIC0xIGlmIGl0IGlzIG5vdCBwcmVzZW50LlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBsYXN0SW5kZXhPZk5lZWRsZSB9IGZyb20gXCJAc3RkL2J5dGVzL2xhc3QtaW5kZXgtb2YtbmVlZGxlXCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDEsIDIsIDEsIDIsIDNdKTtcbiAqIGNvbnN0IG5lZWRsZSA9IG5ldyBVaW50OEFycmF5KFsxLCAyXSk7XG4gKiBjb25zdCBub3ROZWVkbGUgPSBuZXcgVWludDhBcnJheShbNSwgMF0pO1xuICpcbiAqIGxhc3RJbmRleE9mTmVlZGxlKHNvdXJjZSwgbmVlZGxlKTsgLy8gNVxuICogbGFzdEluZGV4T2ZOZWVkbGUoc291cmNlLCBub3ROZWVkbGUpOyAvLyAtMVxuICogYGBgXG4gKlxuICogIyMgUmVwZWF0IGEgYnl0ZSBzbGljZVxuICpcbiAqIHtAbGlua2NvZGUgcmVwZWF0fSByZXR1cm5zIGEgbmV3IGJ5dGUgc2xpY2UgY29tcG9zZWQgb2YgYGNvdW50YCByZXBldGl0aW9uc1xuICogb2YgdGhlIGBzb3VyY2VgIGFycmF5LlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyByZXBlYXQgfSBmcm9tIFwiQHN0ZC9ieXRlcy9yZXBlYXRcIjtcbiAqXG4gKiBjb25zdCBzb3VyY2UgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMl0pO1xuICpcbiAqIHJlcGVhdChzb3VyY2UsIDMpOyAvLyBVaW50OEFycmF5KDkpIFswLCAxLCAyLCAwLCAxLCAyLCAwLCAxLCAyXVxuICpcbiAqIHJlcGVhdChzb3VyY2UsIDApOyAvLyBVaW50OEFycmF5KDApIFtdXG4gKlxuICogcmVwZWF0KHNvdXJjZSwgLTEpOyAvLyBUaHJvd3MgYFJhbmdlRXJyb3JgXG4gKiBgYGBcbiAqXG4gKiAjIyBDaGVjayBpZiBhIGJ5dGUgc2xpY2Ugc3RhcnRzIHdpdGggYW5vdGhlciBieXRlIHNsaWNlXG4gKlxuICoge0BsaW5rY29kZSBzdGFydHNXaXRofSByZXR1cm5zIGB0cnVlYCBpZiB0aGUgcHJlZml4IGFycmF5IGFwcGVhcnMgYXQgdGhlIHN0YXJ0XG4gKiBvZiB0aGUgc291cmNlIGFycmF5LCBgZmFsc2VgIG90aGVyd2lzZS5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgc3RhcnRzV2l0aCB9IGZyb20gXCJAc3RkL2J5dGVzL3N0YXJ0cy13aXRoXCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDEsIDIsIDEsIDIsIDNdKTtcbiAqIGNvbnN0IHByZWZpeCA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyXSk7XG4gKlxuICogc3RhcnRzV2l0aChzb3VyY2UsIHByZWZpeCk7IC8vIHRydWVcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5leHBvcnQgKiBmcm9tIFwiLi9jb25jYXQudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2NvcHkudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2VuZHNfd2l0aC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZXF1YWxzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9pbmNsdWRlc19uZWVkbGUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2luZGV4X29mX25lZWRsZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbGFzdF9pbmRleF9vZl9uZWVkbGUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3JlcGVhdC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vc3RhcnRzX3dpdGgudHNcIjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMklDLEdBRUQsY0FBYyxjQUFjO0FBQzVCLGNBQWMsWUFBWTtBQUMxQixjQUFjLGlCQUFpQjtBQUMvQixjQUFjLGNBQWM7QUFDNUIsY0FBYyx1QkFBdUI7QUFDckMsY0FBYyx1QkFBdUI7QUFDckMsY0FBYyw0QkFBNEI7QUFDMUMsY0FBYyxjQUFjO0FBQzVCLGNBQWMsbUJBQW1CIn0=
// denoCacheMetadata=12761300701429860389,5996329566331840883