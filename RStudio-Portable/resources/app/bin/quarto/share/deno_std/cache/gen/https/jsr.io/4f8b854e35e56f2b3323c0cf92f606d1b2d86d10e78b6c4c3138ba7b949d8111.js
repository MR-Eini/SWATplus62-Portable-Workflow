// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { parse } from "./parse.ts";
/**
 * Returns the parsed version, or undefined if it's not valid.
 *
 * @example Usage
 * ```ts
 * import { tryParse } from "@std/semver/try-parse";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(tryParse("1.2.3"), { major: 1, minor: 2, patch: 3, prerelease: [], build: [] });
 * assertEquals(tryParse("1.2.3-alpha"), { major: 1, minor: 2, patch: 3, prerelease: ["alpha"], build: [] });
 * assertEquals(tryParse("1.2.3+build"), { major: 1, minor: 2, patch: 3, prerelease: [], build: ["build"] });
 * assertEquals(tryParse("1.2.3-alpha.1+build.1"), { major: 1, minor: 2, patch: 3, prerelease: ["alpha", 1], build: ["build", "1"] });
 * assertEquals(tryParse(" invalid "), undefined);
 * ```
 *
 * @param version The version string to parse
 * @returns A valid SemVer or `undefined`
 */ export function tryParse(version) {
  if (version === undefined) {
    return undefined;
  }
  try {
    return parse(version);
  } catch  {
    return undefined;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvdHJ5X3BhcnNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgdHlwZSB7IFNlbVZlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gXCIuL3BhcnNlLnRzXCI7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGFyc2VkIHZlcnNpb24sIG9yIHVuZGVmaW5lZCBpZiBpdCdzIG5vdCB2YWxpZC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHRyeVBhcnNlIH0gZnJvbSBcIkBzdGQvc2VtdmVyL3RyeS1wYXJzZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHModHJ5UGFyc2UoXCIxLjIuM1wiKSwgeyBtYWpvcjogMSwgbWlub3I6IDIsIHBhdGNoOiAzLCBwcmVyZWxlYXNlOiBbXSwgYnVpbGQ6IFtdIH0pO1xuICogYXNzZXJ0RXF1YWxzKHRyeVBhcnNlKFwiMS4yLjMtYWxwaGFcIiksIHsgbWFqb3I6IDEsIG1pbm9yOiAyLCBwYXRjaDogMywgcHJlcmVsZWFzZTogW1wiYWxwaGFcIl0sIGJ1aWxkOiBbXSB9KTtcbiAqIGFzc2VydEVxdWFscyh0cnlQYXJzZShcIjEuMi4zK2J1aWxkXCIpLCB7IG1ham9yOiAxLCBtaW5vcjogMiwgcGF0Y2g6IDMsIHByZXJlbGVhc2U6IFtdLCBidWlsZDogW1wiYnVpbGRcIl0gfSk7XG4gKiBhc3NlcnRFcXVhbHModHJ5UGFyc2UoXCIxLjIuMy1hbHBoYS4xK2J1aWxkLjFcIiksIHsgbWFqb3I6IDEsIG1pbm9yOiAyLCBwYXRjaDogMywgcHJlcmVsZWFzZTogW1wiYWxwaGFcIiwgMV0sIGJ1aWxkOiBbXCJidWlsZFwiLCBcIjFcIl0gfSk7XG4gKiBhc3NlcnRFcXVhbHModHJ5UGFyc2UoXCIgaW52YWxpZCBcIiksIHVuZGVmaW5lZCk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gdmVyc2lvbiBUaGUgdmVyc2lvbiBzdHJpbmcgdG8gcGFyc2VcbiAqIEByZXR1cm5zIEEgdmFsaWQgU2VtVmVyIG9yIGB1bmRlZmluZWRgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlQYXJzZSh2ZXJzaW9uPzogc3RyaW5nKTogU2VtVmVyIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHZlcnNpb24gPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgdHJ5IHtcbiAgICByZXR1cm4gcGFyc2UodmVyc2lvbik7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsS0FBSyxRQUFRLGFBQWE7QUFFbkM7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaUJDLEdBQ0QsT0FBTyxTQUFTLFNBQVMsT0FBZ0I7RUFDdkMsSUFBSSxZQUFZLFdBQVc7SUFDekIsT0FBTztFQUNUO0VBQ0EsSUFBSTtJQUNGLE9BQU8sTUFBTTtFQUNmLEVBQUUsT0FBTTtJQUNOLE9BQU87RUFDVDtBQUNGIn0=
// denoCacheMetadata=1146970010866532210,10138322621035225487