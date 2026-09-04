// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { iterateReader as _iterateReader, iterateReaderSync as _iterateReaderSync } from "jsr:/@std/io@^0.224.1/iterate-reader";
/**
 * Turns a {@linkcode https://jsr.io/@std/io/doc/types/~/Reader | Reader}, `r`, into an async iterator.
 *
 * @param r A reader to turn into an async iterator.
 * @param options Options for the iterateReader function.
 * @returns An async iterator that yields Uint8Array.
 *
 * @example Convert a `Deno.FsFile` into an async iterator and iterate over it
 * ```ts no-assert no-eval
 * import { iterateReader } from "@std/streams/iterate-reader";
 *
 * using f = await Deno.open("./README.md");
 * for await (const chunk of iterateReader(f)) {
 *   console.log(chunk);
 * }
 * ```
 *
 * @example Specify a buffer size of 1MiB
 * ```ts no-assert no-eval
 * import { iterateReader } from "@std/streams/iterate-reader";
 *
 * using f = await Deno.open("./README.md");
 * const it = iterateReader(f, {
 *   bufSize: 1024 * 1024
 * });
 * for await (const chunk of it) {
 *   console.log(chunk);
 * }
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Import from
 * {@link https://jsr.io/@std/io | @std/io} instead.
 */ export function iterateReader(r, options) {
  return _iterateReader(r, options);
}
/**
 * Turns a {@linkcode https://jsr.io/@std/io/doc/types/~/ReaderSync | ReaderSync}, `r`, into an iterator.
 *
 * @param r A reader to turn into an iterator.
 * @param options Options for the iterateReaderSync function.
 * @returns An iterator that yields Uint8Array.
 *
 * @example Convert a `Deno.FsFile` into an iterator and iterate over it
 * ```ts no-eval no-assert
 * import { iterateReaderSync } from "@std/streams/iterate-reader";
 *
 * using f = Deno.openSync("./README.md");
 * for (const chunk of iterateReaderSync(f)) {
 *   console.log(chunk);
 * }
 * ```
 *
 * @example Specify a buffer size of 1MiB
 * ```ts no-eval no-assert
 * import { iterateReaderSync } from "@std/streams/iterate-reader";
 *
 * using f = await Deno.open("./README.md");
 * const iter = iterateReaderSync(f, {
 *   bufSize: 1024 * 1024
 * });
 * for (const chunk of iter) {
 *   console.log(chunk);
 * }
 * ```
 *
 * Iterator uses an internal buffer of fixed size for efficiency; it returns
 * a view on that buffer on each iteration. It is therefore caller's
 * responsibility to copy contents of the buffer if needed; otherwise the
 * next iteration will overwrite contents of previously returned chunk.
 *
 * @deprecated This will be removed in 1.0.0. Import from
 * {@link https://jsr.io/@std/io | @std/io} instead.
 */ export function iterateReaderSync(r, options) {
  return _iterateReaderSync(r, options);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L2l0ZXJhdGVfcmVhZGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7XG4gIGl0ZXJhdGVSZWFkZXIgYXMgX2l0ZXJhdGVSZWFkZXIsXG4gIGl0ZXJhdGVSZWFkZXJTeW5jIGFzIF9pdGVyYXRlUmVhZGVyU3luYyxcbn0gZnJvbSBcImpzcjovQHN0ZC9pb0BeMC4yMjQuMS9pdGVyYXRlLXJlYWRlclwiO1xuaW1wb3J0IHR5cGUgeyBSZWFkZXIsIFJlYWRlclN5bmMgfSBmcm9tIFwianNyOi9Ac3RkL2lvQF4wLjIyNC4xL3R5cGVzXCI7XG5cbmV4cG9ydCB0eXBlIHsgUmVhZGVyLCBSZWFkZXJTeW5jIH07XG5cbi8qKlxuICogVHVybnMgYSB7QGxpbmtjb2RlIGh0dHBzOi8vanNyLmlvL0BzdGQvaW8vZG9jL3R5cGVzL34vUmVhZGVyIHwgUmVhZGVyfSwgYHJgLCBpbnRvIGFuIGFzeW5jIGl0ZXJhdG9yLlxuICpcbiAqIEBwYXJhbSByIEEgcmVhZGVyIHRvIHR1cm4gaW50byBhbiBhc3luYyBpdGVyYXRvci5cbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIHRoZSBpdGVyYXRlUmVhZGVyIGZ1bmN0aW9uLlxuICogQHJldHVybnMgQW4gYXN5bmMgaXRlcmF0b3IgdGhhdCB5aWVsZHMgVWludDhBcnJheS5cbiAqXG4gKiBAZXhhbXBsZSBDb252ZXJ0IGEgYERlbm8uRnNGaWxlYCBpbnRvIGFuIGFzeW5jIGl0ZXJhdG9yIGFuZCBpdGVyYXRlIG92ZXIgaXRcbiAqIGBgYHRzIG5vLWFzc2VydCBuby1ldmFsXG4gKiBpbXBvcnQgeyBpdGVyYXRlUmVhZGVyIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9pdGVyYXRlLXJlYWRlclwiO1xuICpcbiAqIHVzaW5nIGYgPSBhd2FpdCBEZW5vLm9wZW4oXCIuL1JFQURNRS5tZFwiKTtcbiAqIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2YgaXRlcmF0ZVJlYWRlcihmKSkge1xuICogICBjb25zb2xlLmxvZyhjaHVuayk7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBTcGVjaWZ5IGEgYnVmZmVyIHNpemUgb2YgMU1pQlxuICogYGBgdHMgbm8tYXNzZXJ0IG5vLWV2YWxcbiAqIGltcG9ydCB7IGl0ZXJhdGVSZWFkZXIgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2l0ZXJhdGUtcmVhZGVyXCI7XG4gKlxuICogdXNpbmcgZiA9IGF3YWl0IERlbm8ub3BlbihcIi4vUkVBRE1FLm1kXCIpO1xuICogY29uc3QgaXQgPSBpdGVyYXRlUmVhZGVyKGYsIHtcbiAqICAgYnVmU2l6ZTogMTAyNCAqIDEwMjRcbiAqIH0pO1xuICogZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiBpdCkge1xuICogICBjb25zb2xlLmxvZyhjaHVuayk7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gSW1wb3J0IGZyb21cbiAqIHtAbGluayBodHRwczovL2pzci5pby9Ac3RkL2lvIHwgQHN0ZC9pb30gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhdGVSZWFkZXIoXG4gIHI6IFJlYWRlcixcbiAgb3B0aW9ucz86IHtcbiAgICBidWZTaXplPzogbnVtYmVyO1xuICB9LFxuKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFVpbnQ4QXJyYXk+IHtcbiAgcmV0dXJuIF9pdGVyYXRlUmVhZGVyKHIsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIFR1cm5zIGEge0BsaW5rY29kZSBodHRwczovL2pzci5pby9Ac3RkL2lvL2RvYy90eXBlcy9+L1JlYWRlclN5bmMgfCBSZWFkZXJTeW5jfSwgYHJgLCBpbnRvIGFuIGl0ZXJhdG9yLlxuICpcbiAqIEBwYXJhbSByIEEgcmVhZGVyIHRvIHR1cm4gaW50byBhbiBpdGVyYXRvci5cbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIHRoZSBpdGVyYXRlUmVhZGVyU3luYyBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIEFuIGl0ZXJhdG9yIHRoYXQgeWllbGRzIFVpbnQ4QXJyYXkuXG4gKlxuICogQGV4YW1wbGUgQ29udmVydCBhIGBEZW5vLkZzRmlsZWAgaW50byBhbiBpdGVyYXRvciBhbmQgaXRlcmF0ZSBvdmVyIGl0XG4gKiBgYGB0cyBuby1ldmFsIG5vLWFzc2VydFxuICogaW1wb3J0IHsgaXRlcmF0ZVJlYWRlclN5bmMgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2l0ZXJhdGUtcmVhZGVyXCI7XG4gKlxuICogdXNpbmcgZiA9IERlbm8ub3BlblN5bmMoXCIuL1JFQURNRS5tZFwiKTtcbiAqIGZvciAoY29uc3QgY2h1bmsgb2YgaXRlcmF0ZVJlYWRlclN5bmMoZikpIHtcbiAqICAgY29uc29sZS5sb2coY2h1bmspO1xuICogfVxuICogYGBgXG4gKlxuICogQGV4YW1wbGUgU3BlY2lmeSBhIGJ1ZmZlciBzaXplIG9mIDFNaUJcbiAqIGBgYHRzIG5vLWV2YWwgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBpdGVyYXRlUmVhZGVyU3luYyB9IGZyb20gXCJAc3RkL3N0cmVhbXMvaXRlcmF0ZS1yZWFkZXJcIjtcbiAqXG4gKiB1c2luZyBmID0gYXdhaXQgRGVuby5vcGVuKFwiLi9SRUFETUUubWRcIik7XG4gKiBjb25zdCBpdGVyID0gaXRlcmF0ZVJlYWRlclN5bmMoZiwge1xuICogICBidWZTaXplOiAxMDI0ICogMTAyNFxuICogfSk7XG4gKiBmb3IgKGNvbnN0IGNodW5rIG9mIGl0ZXIpIHtcbiAqICAgY29uc29sZS5sb2coY2h1bmspO1xuICogfVxuICogYGBgXG4gKlxuICogSXRlcmF0b3IgdXNlcyBhbiBpbnRlcm5hbCBidWZmZXIgb2YgZml4ZWQgc2l6ZSBmb3IgZWZmaWNpZW5jeTsgaXQgcmV0dXJuc1xuICogYSB2aWV3IG9uIHRoYXQgYnVmZmVyIG9uIGVhY2ggaXRlcmF0aW9uLiBJdCBpcyB0aGVyZWZvcmUgY2FsbGVyJ3NcbiAqIHJlc3BvbnNpYmlsaXR5IHRvIGNvcHkgY29udGVudHMgb2YgdGhlIGJ1ZmZlciBpZiBuZWVkZWQ7IG90aGVyd2lzZSB0aGVcbiAqIG5leHQgaXRlcmF0aW9uIHdpbGwgb3ZlcndyaXRlIGNvbnRlbnRzIG9mIHByZXZpb3VzbHkgcmV0dXJuZWQgY2h1bmsuXG4gKlxuICogQGRlcHJlY2F0ZWQgVGhpcyB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAuIEltcG9ydCBmcm9tXG4gKiB7QGxpbmsgaHR0cHM6Ly9qc3IuaW8vQHN0ZC9pbyB8IEBzdGQvaW99IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpdGVyYXRlUmVhZGVyU3luYyhcbiAgcjogUmVhZGVyU3luYyxcbiAgb3B0aW9ucz86IHtcbiAgICBidWZTaXplPzogbnVtYmVyO1xuICB9LFxuKTogSXRlcmFibGVJdGVyYXRvcjxVaW50OEFycmF5PiB7XG4gIHJldHVybiBfaXRlcmF0ZVJlYWRlclN5bmMociwgb3B0aW9ucyk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUNFLGlCQUFpQixjQUFjLEVBQy9CLHFCQUFxQixrQkFBa0IsUUFDbEMsdUNBQXVDO0FBSzlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWdDQyxHQUNELE9BQU8sU0FBUyxjQUNkLENBQVMsRUFDVCxPQUVDO0VBRUQsT0FBTyxlQUFlLEdBQUc7QUFDM0I7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFDQyxHQUNELE9BQU8sU0FBUyxrQkFDZCxDQUFhLEVBQ2IsT0FFQztFQUVELE9BQU8sbUJBQW1CLEdBQUc7QUFDL0IifQ==
// denoCacheMetadata=3392681499724175827,10714130726145705319