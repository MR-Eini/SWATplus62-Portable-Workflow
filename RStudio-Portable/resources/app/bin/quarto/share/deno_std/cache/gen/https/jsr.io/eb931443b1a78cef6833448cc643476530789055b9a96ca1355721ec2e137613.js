// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Extensions to the
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API | Web Crypto}
 * supporting additional encryption APIs, but also delegating to the built-in
 * APIs when possible.
 *
 * ```ts
 * import { crypto } from "@std/crypto/crypto";
 *
 * const message = "Hello, Deno!";
 * const encoder = new TextEncoder();
 * const data = encoder.encode(message);
 *
 * await crypto.subtle.digest("BLAKE3", data);
 * ```
 *
 * @module
 */ export * from "./crypto.ts";
export * from "./unstable_keystack.ts";
export * from "./timing_safe_equal.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY3J5cHRvLzAuMjI0LjAvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogRXh0ZW5zaW9ucyB0byB0aGVcbiAqIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViX0NyeXB0b19BUEkgfCBXZWIgQ3J5cHRvfVxuICogc3VwcG9ydGluZyBhZGRpdGlvbmFsIGVuY3J5cHRpb24gQVBJcywgYnV0IGFsc28gZGVsZWdhdGluZyB0byB0aGUgYnVpbHQtaW5cbiAqIEFQSXMgd2hlbiBwb3NzaWJsZS5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY3J5cHRvIH0gZnJvbSBcIkBzdGQvY3J5cHRvL2NyeXB0b1wiO1xuICpcbiAqIGNvbnN0IG1lc3NhZ2UgPSBcIkhlbGxvLCBEZW5vIVwiO1xuICogY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICogY29uc3QgZGF0YSA9IGVuY29kZXIuZW5jb2RlKG1lc3NhZ2UpO1xuICpcbiAqIGF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KFwiQkxBS0UzXCIsIGRhdGEpO1xuICogYGBgXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmV4cG9ydCAqIGZyb20gXCIuL2NyeXB0by50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdW5zdGFibGVfa2V5c3RhY2sudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3RpbWluZ19zYWZlX2VxdWFsLnRzXCI7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FpQkMsR0FFRCxjQUFjLGNBQWM7QUFDNUIsY0FBYyx5QkFBeUI7QUFDdkMsY0FBYyx5QkFBeUIifQ==
// denoCacheMetadata=11053408368675512972,17809766190411137890