// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Utilities for working with the
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Streams API}.
 *
 * Includes buffering and conversion.
 *
 * ```ts
 * import { toText } from "@std/streams";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from("Hello, world!");
 * const text = await toText(stream);
 *
 * assertEquals(text, "Hello, world!");
 * ```
 *
 * @module
 */ export * from "./buffer.ts";
export * from "./byte_slice_stream.ts";
export * from "./concat_readable_streams.ts";
export * from "./delimiter_stream.ts";
export * from "./early_zip_readable_streams.ts";
export * from "./iterate_reader.ts";
export * from "./limited_bytes_transform_stream.ts";
export * from "./limited_transform_stream.ts";
export * from "./merge_readable_streams.ts";
export * from "./readable_stream_from_reader.ts";
export * from "./reader_from_iterable.ts";
export * from "./reader_from_stream_reader.ts";
export * from "./text_delimiter_stream.ts";
export * from "./text_line_stream.ts";
export * from "./to_array_buffer.ts";
export * from "./to_blob.ts";
export * from "./to_json.ts";
export * from "./to_text.ts";
export * from "./to_transform_stream.ts";
export * from "./writable_stream_from_writer.ts";
export * from "./writer_from_stream_writer.ts";
export * from "./zip_readable_streams.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L21vZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yIHdvcmtpbmcgd2l0aCB0aGVcbiAqIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvU3RyZWFtc19BUEkgfCBTdHJlYW1zIEFQSX0uXG4gKlxuICogSW5jbHVkZXMgYnVmZmVyaW5nIGFuZCBjb252ZXJzaW9uLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB0b1RleHQgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHN0cmVhbSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oXCJIZWxsbywgd29ybGQhXCIpO1xuICogY29uc3QgdGV4dCA9IGF3YWl0IHRvVGV4dChzdHJlYW0pO1xuICpcbiAqIGFzc2VydEVxdWFscyh0ZXh0LCBcIkhlbGxvLCB3b3JsZCFcIik7XG4gKiBgYGBcbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuZXhwb3J0ICogZnJvbSBcIi4vYnVmZmVyLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9ieXRlX3NsaWNlX3N0cmVhbS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vY29uY2F0X3JlYWRhYmxlX3N0cmVhbXMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2RlbGltaXRlcl9zdHJlYW0udHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2Vhcmx5X3ppcF9yZWFkYWJsZV9zdHJlYW1zLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9pdGVyYXRlX3JlYWRlci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbGltaXRlZF9ieXRlc190cmFuc2Zvcm1fc3RyZWFtLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9saW1pdGVkX3RyYW5zZm9ybV9zdHJlYW0udHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL21lcmdlX3JlYWRhYmxlX3N0cmVhbXMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3JlYWRhYmxlX3N0cmVhbV9mcm9tX3JlYWRlci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcmVhZGVyX2Zyb21faXRlcmFibGUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3JlYWRlcl9mcm9tX3N0cmVhbV9yZWFkZXIudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3RleHRfZGVsaW1pdGVyX3N0cmVhbS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdGV4dF9saW5lX3N0cmVhbS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdG9fYXJyYXlfYnVmZmVyLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi90b19ibG9iLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi90b19qc29uLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi90b190ZXh0LnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi90b190cmFuc2Zvcm1fc3RyZWFtLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi93cml0YWJsZV9zdHJlYW1fZnJvbV93cml0ZXIudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3dyaXRlcl9mcm9tX3N0cmVhbV93cml0ZXIudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3ppcF9yZWFkYWJsZV9zdHJlYW1zLnRzXCI7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCQyxHQUVELGNBQWMsY0FBYztBQUM1QixjQUFjLHlCQUF5QjtBQUN2QyxjQUFjLCtCQUErQjtBQUM3QyxjQUFjLHdCQUF3QjtBQUN0QyxjQUFjLGtDQUFrQztBQUNoRCxjQUFjLHNCQUFzQjtBQUNwQyxjQUFjLHNDQUFzQztBQUNwRCxjQUFjLGdDQUFnQztBQUM5QyxjQUFjLDhCQUE4QjtBQUM1QyxjQUFjLG1DQUFtQztBQUNqRCxjQUFjLDRCQUE0QjtBQUMxQyxjQUFjLGlDQUFpQztBQUMvQyxjQUFjLDZCQUE2QjtBQUMzQyxjQUFjLHdCQUF3QjtBQUN0QyxjQUFjLHVCQUF1QjtBQUNyQyxjQUFjLGVBQWU7QUFDN0IsY0FBYyxlQUFlO0FBQzdCLGNBQWMsZUFBZTtBQUM3QixjQUFjLDJCQUEyQjtBQUN6QyxjQUFjLG1DQUFtQztBQUNqRCxjQUFjLGlDQUFpQztBQUMvQyxjQUFjLDRCQUE0QiJ9
// denoCacheMetadata=7189426611850743787,10556168182658304449