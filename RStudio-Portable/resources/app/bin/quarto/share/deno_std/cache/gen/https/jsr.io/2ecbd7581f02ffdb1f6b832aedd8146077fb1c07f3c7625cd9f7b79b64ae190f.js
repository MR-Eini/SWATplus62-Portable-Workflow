// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { satisfies } from "./satisfies.ts";
/**
 * Test to see if the version satisfies the range.
 *
 * @example Usage
 * ```ts
 * import { parse, parseRange, testRange } from "@std/semver";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const version = parse("1.2.3");
 * const range0 = parseRange(">=1.0.0 <2.0.0");
 * const range1 = parseRange(">=1.0.0 <1.3.0");
 * const range2 = parseRange(">=1.0.0 <1.2.3");
 *
 * assert(testRange(version, range0));
 * assert(testRange(version, range1));
 * assertFalse(testRange(version, range2));
 * ```
 * @param version The version to test
 * @param range The range to check
 * @returns true if the version is in the range
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode satisfies}
 * instead. See https://github.com/denoland/deno_std/pull/4364.
 */ export function testRange(version, range) {
  return satisfies(version, range);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvdGVzdF9yYW5nZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuaW1wb3J0IHR5cGUgeyBSYW5nZSwgU2VtVmVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IHNhdGlzZmllcyB9IGZyb20gXCIuL3NhdGlzZmllcy50c1wiO1xuXG4vKipcbiAqIFRlc3QgdG8gc2VlIGlmIHRoZSB2ZXJzaW9uIHNhdGlzZmllcyB0aGUgcmFuZ2UuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZSwgcGFyc2VSYW5nZSwgdGVzdFJhbmdlIH0gZnJvbSBcIkBzdGQvc2VtdmVyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnQsIGFzc2VydEZhbHNlIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3QgdmVyc2lvbiA9IHBhcnNlKFwiMS4yLjNcIik7XG4gKiBjb25zdCByYW5nZTAgPSBwYXJzZVJhbmdlKFwiPj0xLjAuMCA8Mi4wLjBcIik7XG4gKiBjb25zdCByYW5nZTEgPSBwYXJzZVJhbmdlKFwiPj0xLjAuMCA8MS4zLjBcIik7XG4gKiBjb25zdCByYW5nZTIgPSBwYXJzZVJhbmdlKFwiPj0xLjAuMCA8MS4yLjNcIik7XG4gKlxuICogYXNzZXJ0KHRlc3RSYW5nZSh2ZXJzaW9uLCByYW5nZTApKTtcbiAqIGFzc2VydCh0ZXN0UmFuZ2UodmVyc2lvbiwgcmFuZ2UxKSk7XG4gKiBhc3NlcnRGYWxzZSh0ZXN0UmFuZ2UodmVyc2lvbiwgcmFuZ2UyKSk7XG4gKiBgYGBcbiAqIEBwYXJhbSB2ZXJzaW9uIFRoZSB2ZXJzaW9uIHRvIHRlc3RcbiAqIEBwYXJhbSByYW5nZSBUaGUgcmFuZ2UgdG8gY2hlY2tcbiAqIEByZXR1cm5zIHRydWUgaWYgdGhlIHZlcnNpb24gaXMgaW4gdGhlIHJhbmdlXG4gKlxuICogQGRlcHJlY2F0ZWQgVGhpcyB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAuIFVzZSB7QGxpbmtjb2RlIHNhdGlzZmllc31cbiAqIGluc3RlYWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZGVub2xhbmQvZGVub19zdGQvcHVsbC80MzY0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVzdFJhbmdlKHZlcnNpb246IFNlbVZlciwgcmFuZ2U6IFJhbmdlKTogYm9vbGVhbiB7XG4gIHJldHVybiBzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRSxTQUFTLFNBQVMsUUFBUSxpQkFBaUI7QUFFM0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJDLEdBQ0QsT0FBTyxTQUFTLFVBQVUsT0FBZSxFQUFFLEtBQVk7RUFDckQsT0FBTyxVQUFVLFNBQVM7QUFDNUIifQ==
// denoCacheMetadata=4397135615159990943,3948047140828360319