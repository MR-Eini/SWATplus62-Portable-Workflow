// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { parseRange } from "./parse_range.ts";
/**
 * Parses the given range string and returns a Range object. If the range string
 * is invalid, `undefined` is returned.
 *
 * @example Usage
 * ```ts
 * import { tryParseRange } from "@std/semver";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(tryParseRange(">=1.2.3 <1.2.4"), [
 *  [
 *    { operator: ">=", major: 1, minor: 2, patch: 3, prerelease: [], build: [] },
 *    { operator: "<", major: 1, minor: 2, patch: 4, prerelease: [], build: [] },
 *  ],
 * ]);
 * ```
 *
 * @param range The range string
 * @returns A Range object if valid otherwise `undefined`
 */ export function tryParseRange(range) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return parseRange(range);
  } catch  {
    return undefined;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvdHJ5X3BhcnNlX3JhbmdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB0eXBlIHsgUmFuZ2UgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHsgcGFyc2VSYW5nZSB9IGZyb20gXCIuL3BhcnNlX3JhbmdlLnRzXCI7XG5cbi8qKlxuICogUGFyc2VzIHRoZSBnaXZlbiByYW5nZSBzdHJpbmcgYW5kIHJldHVybnMgYSBSYW5nZSBvYmplY3QuIElmIHRoZSByYW5nZSBzdHJpbmdcbiAqIGlzIGludmFsaWQsIGB1bmRlZmluZWRgIGlzIHJldHVybmVkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgdHJ5UGFyc2VSYW5nZSB9IGZyb20gXCJAc3RkL3NlbXZlclwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKHRyeVBhcnNlUmFuZ2UoXCI+PTEuMi4zIDwxLjIuNFwiKSwgW1xuICogIFtcbiAqICAgIHsgb3BlcmF0b3I6IFwiPj1cIiwgbWFqb3I6IDEsIG1pbm9yOiAyLCBwYXRjaDogMywgcHJlcmVsZWFzZTogW10sIGJ1aWxkOiBbXSB9LFxuICogICAgeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yOiAxLCBtaW5vcjogMiwgcGF0Y2g6IDQsIHByZXJlbGVhc2U6IFtdLCBidWlsZDogW10gfSxcbiAqICBdLFxuICogXSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gcmFuZ2UgVGhlIHJhbmdlIHN0cmluZ1xuICogQHJldHVybnMgQSBSYW5nZSBvYmplY3QgaWYgdmFsaWQgb3RoZXJ3aXNlIGB1bmRlZmluZWRgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlQYXJzZVJhbmdlKFxuICByYW5nZTogc3RyaW5nLFxuKTogUmFuZ2UgfCB1bmRlZmluZWQge1xuICB0cnkge1xuICAgIC8vIFJldHVybiAnKicgaW5zdGVhZCBvZiAnJyBzbyB0aGF0IHRydXRoaW5lc3Mgd29ya3MuXG4gICAgLy8gVGhpcyB3aWxsIHRocm93IGlmIGl0J3MgaW52YWxpZCBhbnl3YXlcbiAgICByZXR1cm4gcGFyc2VSYW5nZShyYW5nZSk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBR3JDLFNBQVMsVUFBVSxRQUFRLG1CQUFtQjtBQUU5Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CQyxHQUNELE9BQU8sU0FBUyxjQUNkLEtBQWE7RUFFYixJQUFJO0lBQ0YscURBQXFEO0lBQ3JELHlDQUF5QztJQUN6QyxPQUFPLFdBQVc7RUFDcEIsRUFBRSxPQUFNO0lBQ04sT0FBTztFQUNUO0FBQ0YifQ==
// denoCacheMetadata=14658878323226652943,13049197755830428230