// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Converts a {@linkcode ReadableStream} of {@linkcode Uint8Array}s to a
 * {@linkcode Blob}. Works the same as {@linkcode Response.blob}.
 *
 * @param stream A `ReadableStream` of `Uint8Array`s to convert into a `Blob`.
 * @returns A `Promise` that resolves to the `Blob`.
 *
 * @example Basic usage
 * ```ts
 * import { toBlob } from "@std/streams/to-blob";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from([
 *   new Uint8Array([1, 2]),
 *   new Uint8Array([3, 4, 5]),
 * ]);
 * const blob = await toBlob(stream);
 * assertEquals(blob.size, 5);
 * ```
 */ export async function toBlob(stream) {
  return await new Response(stream).blob();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L3RvX2Jsb2IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBDb252ZXJ0cyBhIHtAbGlua2NvZGUgUmVhZGFibGVTdHJlYW19IG9mIHtAbGlua2NvZGUgVWludDhBcnJheX1zIHRvIGFcbiAqIHtAbGlua2NvZGUgQmxvYn0uIFdvcmtzIHRoZSBzYW1lIGFzIHtAbGlua2NvZGUgUmVzcG9uc2UuYmxvYn0uXG4gKlxuICogQHBhcmFtIHN0cmVhbSBBIGBSZWFkYWJsZVN0cmVhbWAgb2YgYFVpbnQ4QXJyYXlgcyB0byBjb252ZXJ0IGludG8gYSBgQmxvYmAuXG4gKiBAcmV0dXJucyBBIGBQcm9taXNlYCB0aGF0IHJlc29sdmVzIHRvIHRoZSBgQmxvYmAuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB0b0Jsb2IgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL3RvLWJsb2JcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgc3RyZWFtID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXG4gKiAgIG5ldyBVaW50OEFycmF5KFsxLCAyXSksXG4gKiAgIG5ldyBVaW50OEFycmF5KFszLCA0LCA1XSksXG4gKiBdKTtcbiAqIGNvbnN0IGJsb2IgPSBhd2FpdCB0b0Jsb2Ioc3RyZWFtKTtcbiAqIGFzc2VydEVxdWFscyhibG9iLnNpemUsIDUpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b0Jsb2IoXG4gIHN0cmVhbTogUmVhZGFibGVTdHJlYW08VWludDhBcnJheT4sXG4pOiBQcm9taXNlPEJsb2I+IHtcbiAgcmV0dXJuIGF3YWl0IG5ldyBSZXNwb25zZShzdHJlYW0pLmJsb2IoKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBQ0QsT0FBTyxlQUFlLE9BQ3BCLE1BQWtDO0VBRWxDLE9BQU8sTUFBTSxJQUFJLFNBQVMsUUFBUSxJQUFJO0FBQ3hDIn0=
// denoCacheMetadata=16965301661123990376,2181176114352347964