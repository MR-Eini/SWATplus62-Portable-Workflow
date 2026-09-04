// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Utilities for working with Deno's readers, writers, and web streams.
 *
 * `Reader` and `Writer` interfaces are deprecated in Deno, and so many of these
 * utilities are also deprecated. Consider using web streams instead.
 *
 * ```ts no-assert
 * import { toReadableStream, toWritableStream } from "@std/io";
 *
 * await toReadableStream(Deno.stdin)
 *   .pipeTo(toWritableStream(Deno.stdout));
 * ```
 *
 * @module
 */ export * from "./buf_reader.ts";
export * from "./buf_writer.ts";
export * from "./buffer.ts";
export * from "./copy.ts";
export * from "./copy_n.ts";
export * from "./iterate_reader.ts";
export * from "./limited_reader.ts";
export * from "./multi_reader.ts";
export * from "./read_all.ts";
export * from "./read_delim.ts";
export * from "./read_int.ts";
export * from "./read_lines.ts";
export * from "./read_long.ts";
export * from "./read_range.ts";
export * from "./read_short.ts";
export * from "./read_string_delim.ts";
export * from "./reader_from_stream_reader.ts";
export * from "./slice_long_to_bytes.ts";
export * from "./string_reader.ts";
export * from "./string_writer.ts";
export * from "./to_readable_stream.ts";
export * from "./to_writable_stream.ts";
export * from "./types.ts";
export * from "./write_all.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yIHdvcmtpbmcgd2l0aCBEZW5vJ3MgcmVhZGVycywgd3JpdGVycywgYW5kIHdlYiBzdHJlYW1zLlxuICpcbiAqIGBSZWFkZXJgIGFuZCBgV3JpdGVyYCBpbnRlcmZhY2VzIGFyZSBkZXByZWNhdGVkIGluIERlbm8sIGFuZCBzbyBtYW55IG9mIHRoZXNlXG4gKiB1dGlsaXRpZXMgYXJlIGFsc28gZGVwcmVjYXRlZC4gQ29uc2lkZXIgdXNpbmcgd2ViIHN0cmVhbXMgaW5zdGVhZC5cbiAqXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHRvUmVhZGFibGVTdHJlYW0sIHRvV3JpdGFibGVTdHJlYW0gfSBmcm9tIFwiQHN0ZC9pb1wiO1xuICpcbiAqIGF3YWl0IHRvUmVhZGFibGVTdHJlYW0oRGVuby5zdGRpbilcbiAqICAgLnBpcGVUbyh0b1dyaXRhYmxlU3RyZWFtKERlbm8uc3Rkb3V0KSk7XG4gKiBgYGBcbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuZXhwb3J0ICogZnJvbSBcIi4vYnVmX3JlYWRlci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vYnVmX3dyaXRlci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vYnVmZmVyLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9jb3B5LnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9jb3B5X24udHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2l0ZXJhdGVfcmVhZGVyLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9saW1pdGVkX3JlYWRlci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbXVsdGlfcmVhZGVyLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9yZWFkX2FsbC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcmVhZF9kZWxpbS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcmVhZF9pbnQudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3JlYWRfbGluZXMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3JlYWRfbG9uZy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcmVhZF9yYW5nZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcmVhZF9zaG9ydC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcmVhZF9zdHJpbmdfZGVsaW0udHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3JlYWRlcl9mcm9tX3N0cmVhbV9yZWFkZXIudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3NsaWNlX2xvbmdfdG9fYnl0ZXMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3N0cmluZ19yZWFkZXIudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3N0cmluZ193cml0ZXIudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3RvX3JlYWRhYmxlX3N0cmVhbS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdG9fd3JpdGFibGVfc3RyZWFtLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi90eXBlcy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vd3JpdGVfYWxsLnRzXCI7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFOzs7Ozs7Ozs7Ozs7OztDQWNDLEdBRUQsY0FBYyxrQkFBa0I7QUFDaEMsY0FBYyxrQkFBa0I7QUFDaEMsY0FBYyxjQUFjO0FBQzVCLGNBQWMsWUFBWTtBQUMxQixjQUFjLGNBQWM7QUFDNUIsY0FBYyxzQkFBc0I7QUFDcEMsY0FBYyxzQkFBc0I7QUFDcEMsY0FBYyxvQkFBb0I7QUFDbEMsY0FBYyxnQkFBZ0I7QUFDOUIsY0FBYyxrQkFBa0I7QUFDaEMsY0FBYyxnQkFBZ0I7QUFDOUIsY0FBYyxrQkFBa0I7QUFDaEMsY0FBYyxpQkFBaUI7QUFDL0IsY0FBYyxrQkFBa0I7QUFDaEMsY0FBYyxrQkFBa0I7QUFDaEMsY0FBYyx5QkFBeUI7QUFDdkMsY0FBYyxpQ0FBaUM7QUFDL0MsY0FBYywyQkFBMkI7QUFDekMsY0FBYyxxQkFBcUI7QUFDbkMsY0FBYyxxQkFBcUI7QUFDbkMsY0FBYywwQkFBMEI7QUFDeEMsY0FBYywwQkFBMEI7QUFDeEMsY0FBYyxhQUFhO0FBQzNCLGNBQWMsaUJBQWlCIn0=
// denoCacheMetadata=3838741206681605532,4341056722961478824