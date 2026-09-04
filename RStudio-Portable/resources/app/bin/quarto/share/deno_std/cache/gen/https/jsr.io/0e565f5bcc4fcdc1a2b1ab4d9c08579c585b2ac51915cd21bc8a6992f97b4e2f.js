// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { readerFromStreamReader as _readerFromStreamReader } from "jsr:/@std/io@^0.224.1/reader-from-stream-reader";
/**
 * Create a {@linkcode https://jsr.io/@std/io/doc/types/~/Reader | Reader} from a {@linkcode ReadableStreamDefaultReader}.
 *
 * @param streamReader A `ReadableStreamDefaultReader` to convert into a `Reader`.
 * @returns A `Reader` that reads from the `streamReader`.
 *
 * @example Copy the response body of a fetch request to the blackhole
 * ```ts no-eval no-assert
 * import { copy } from "@std/io/copy";
 * import { readerFromStreamReader } from "@std/streams/reader-from-stream-reader";
 * import { devNull } from "node:os";
 *
 * const res = await fetch("https://deno.land");
 * using blackhole = await Deno.open(devNull, { write: true });
 *
 * const reader = readerFromStreamReader(res.body!.getReader());
 * await copy(reader, blackhole);
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Import from
 * {@link https://jsr.io/@std/io | @std/io} instead.
 */ export function readerFromStreamReader(streamReader) {
  return _readerFromStreamReader(streamReader);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L3JlYWRlcl9mcm9tX3N0cmVhbV9yZWFkZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgcmVhZGVyRnJvbVN0cmVhbVJlYWRlciBhcyBfcmVhZGVyRnJvbVN0cmVhbVJlYWRlciB9IGZyb20gXCJqc3I6L0BzdGQvaW9AXjAuMjI0LjEvcmVhZGVyLWZyb20tc3RyZWFtLXJlYWRlclwiO1xuaW1wb3J0IHR5cGUgeyBSZWFkZXIgfSBmcm9tIFwianNyOi9Ac3RkL2lvQF4wLjIyNC4xL3R5cGVzXCI7XG5cbi8qKlxuICogQ3JlYXRlIGEge0BsaW5rY29kZSBodHRwczovL2pzci5pby9Ac3RkL2lvL2RvYy90eXBlcy9+L1JlYWRlciB8IFJlYWRlcn0gZnJvbSBhIHtAbGlua2NvZGUgUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyfS5cbiAqXG4gKiBAcGFyYW0gc3RyZWFtUmVhZGVyIEEgYFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlcmAgdG8gY29udmVydCBpbnRvIGEgYFJlYWRlcmAuXG4gKiBAcmV0dXJucyBBIGBSZWFkZXJgIHRoYXQgcmVhZHMgZnJvbSB0aGUgYHN0cmVhbVJlYWRlcmAuXG4gKlxuICogQGV4YW1wbGUgQ29weSB0aGUgcmVzcG9uc2UgYm9keSBvZiBhIGZldGNoIHJlcXVlc3QgdG8gdGhlIGJsYWNraG9sZVxuICogYGBgdHMgbm8tZXZhbCBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGNvcHkgfSBmcm9tIFwiQHN0ZC9pby9jb3B5XCI7XG4gKiBpbXBvcnQgeyByZWFkZXJGcm9tU3RyZWFtUmVhZGVyIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9yZWFkZXItZnJvbS1zdHJlYW0tcmVhZGVyXCI7XG4gKiBpbXBvcnQgeyBkZXZOdWxsIH0gZnJvbSBcIm5vZGU6b3NcIjtcbiAqXG4gKiBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vZGVuby5sYW5kXCIpO1xuICogdXNpbmcgYmxhY2tob2xlID0gYXdhaXQgRGVuby5vcGVuKGRldk51bGwsIHsgd3JpdGU6IHRydWUgfSk7XG4gKlxuICogY29uc3QgcmVhZGVyID0gcmVhZGVyRnJvbVN0cmVhbVJlYWRlcihyZXMuYm9keSEuZ2V0UmVhZGVyKCkpO1xuICogYXdhaXQgY29weShyZWFkZXIsIGJsYWNraG9sZSk7XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gSW1wb3J0IGZyb21cbiAqIHtAbGluayBodHRwczovL2pzci5pby9Ac3RkL2lvIHwgQHN0ZC9pb30gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlYWRlckZyb21TdHJlYW1SZWFkZXIoXG4gIHN0cmVhbVJlYWRlcjogUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyPFVpbnQ4QXJyYXk+LFxuKTogUmVhZGVyIHtcbiAgcmV0dXJuIF9yZWFkZXJGcm9tU3RyZWFtUmVhZGVyKHN0cmVhbVJlYWRlcik7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLDBCQUEwQix1QkFBdUIsUUFBUSxrREFBa0Q7QUFHcEg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCQyxHQUNELE9BQU8sU0FBUyx1QkFDZCxZQUFxRDtFQUVyRCxPQUFPLHdCQUF3QjtBQUNqQyJ9
// denoCacheMetadata=8816237290870890630,6869506171347411262