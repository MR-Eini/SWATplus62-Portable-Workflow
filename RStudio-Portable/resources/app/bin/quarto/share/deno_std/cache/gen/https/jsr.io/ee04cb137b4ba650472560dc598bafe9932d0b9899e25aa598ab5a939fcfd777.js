// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { toText } from "./to_text.ts";
/**
 * Converts a JSON-formatted {@linkcode ReadableSteam} of strings or
 * {@linkcode Uint8Array}s to an object. Works the same as
 * {@linkcode Response.json}.
 *
 * @param readableStream A `ReadableStream` whose chunks compose a JSON.
 * @returns A promise that resolves to the parsed JSON.
 *
 * @example Basic usage
 * ```ts
 * import { toJson } from "@std/streams/to-json";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from([
 *   "[1, true",
 *   ', [], {}, "hello',
 *   '", null]',
 * ]);
 * const json = await toJson(stream);
 * assertEquals(json, [1, true, [], {}, "hello", null]);
 * ```
 */ export function toJson(readableStream) {
  return toText(readableStream).then(JSON.parse);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L3RvX2pzb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgdG9UZXh0IH0gZnJvbSBcIi4vdG9fdGV4dC50c1wiO1xuXG4vKipcbiAqIENvbnZlcnRzIGEgSlNPTi1mb3JtYXR0ZWQge0BsaW5rY29kZSBSZWFkYWJsZVN0ZWFtfSBvZiBzdHJpbmdzIG9yXG4gKiB7QGxpbmtjb2RlIFVpbnQ4QXJyYXl9cyB0byBhbiBvYmplY3QuIFdvcmtzIHRoZSBzYW1lIGFzXG4gKiB7QGxpbmtjb2RlIFJlc3BvbnNlLmpzb259LlxuICpcbiAqIEBwYXJhbSByZWFkYWJsZVN0cmVhbSBBIGBSZWFkYWJsZVN0cmVhbWAgd2hvc2UgY2h1bmtzIGNvbXBvc2UgYSBKU09OLlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHBhcnNlZCBKU09OLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgdG9Kc29uIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy90by1qc29uXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHN0cmVhbSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1xuICogICBcIlsxLCB0cnVlXCIsXG4gKiAgICcsIFtdLCB7fSwgXCJoZWxsbycsXG4gKiAgICdcIiwgbnVsbF0nLFxuICogXSk7XG4gKiBjb25zdCBqc29uID0gYXdhaXQgdG9Kc29uKHN0cmVhbSk7XG4gKiBhc3NlcnRFcXVhbHMoanNvbiwgWzEsIHRydWUsIFtdLCB7fSwgXCJoZWxsb1wiLCBudWxsXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvSnNvbihcbiAgcmVhZGFibGVTdHJlYW06IFJlYWRhYmxlU3RyZWFtLFxuKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHJldHVybiB0b1RleHQocmVhZGFibGVTdHJlYW0pLnRoZW4oSlNPTi5wYXJzZSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLE1BQU0sUUFBUSxlQUFlO0FBRXRDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FxQkMsR0FDRCxPQUFPLFNBQVMsT0FDZCxjQUE4QjtFQUU5QixPQUFPLE9BQU8sZ0JBQWdCLElBQUksQ0FBQyxLQUFLLEtBQUs7QUFDL0MifQ==
// denoCacheMetadata=5082305199547009427,13516631453056601360