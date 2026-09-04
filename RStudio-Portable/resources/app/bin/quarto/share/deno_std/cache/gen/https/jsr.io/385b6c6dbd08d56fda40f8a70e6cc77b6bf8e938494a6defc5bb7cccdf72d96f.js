// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { readDelim } from "./read_delim.ts";
/**
 * Read {@linkcode Reader} chunk by chunk, splitting based on delimiter.
 *
 * @example Usage
 * ```ts
 * import { readStringDelim } from "@std/io/read-string-delim";
 * import { assert } from "@std/assert/assert"
 *
 * let fileReader = await Deno.open("README.md");
 *
 * for await (let line of readStringDelim(fileReader, "\n")) {
 *   assert(typeof line === "string");
 * }
 * ```
 *
 * @param reader The reader to read from
 * @param delim The delimiter to split the reader by
 * @param decoderOpts The options
 * @returns The async iterator of strings
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export async function* readStringDelim(reader, delim, decoderOpts) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder(decoderOpts?.encoding, decoderOpts);
  for await (const chunk of readDelim(reader, encoder.encode(delim))){
    yield decoder.decode(chunk);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9yZWFkX3N0cmluZ19kZWxpbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgdHlwZSB7IFJlYWRlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyByZWFkRGVsaW0gfSBmcm9tIFwiLi9yZWFkX2RlbGltLnRzXCI7XG5cbi8qKlxuICogUmVhZCB7QGxpbmtjb2RlIFJlYWRlcn0gY2h1bmsgYnkgY2h1bmssIHNwbGl0dGluZyBiYXNlZCBvbiBkZWxpbWl0ZXIuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyByZWFkU3RyaW5nRGVsaW0gfSBmcm9tIFwiQHN0ZC9pby9yZWFkLXN0cmluZy1kZWxpbVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydFwiXG4gKlxuICogbGV0IGZpbGVSZWFkZXIgPSBhd2FpdCBEZW5vLm9wZW4oXCJSRUFETUUubWRcIik7XG4gKlxuICogZm9yIGF3YWl0IChsZXQgbGluZSBvZiByZWFkU3RyaW5nRGVsaW0oZmlsZVJlYWRlciwgXCJcXG5cIikpIHtcbiAqICAgYXNzZXJ0KHR5cGVvZiBsaW5lID09PSBcInN0cmluZ1wiKTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSByZWFkZXIgVGhlIHJlYWRlciB0byByZWFkIGZyb21cbiAqIEBwYXJhbSBkZWxpbSBUaGUgZGVsaW1pdGVyIHRvIHNwbGl0IHRoZSByZWFkZXIgYnlcbiAqIEBwYXJhbSBkZWNvZGVyT3B0cyBUaGUgb3B0aW9uc1xuICogQHJldHVybnMgVGhlIGFzeW5jIGl0ZXJhdG9yIG9mIHN0cmluZ3NcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0cmVhbXNfQVBJIHwgV2ViIFN0cmVhbXMgQVBJfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24qIHJlYWRTdHJpbmdEZWxpbShcbiAgcmVhZGVyOiBSZWFkZXIsXG4gIGRlbGltOiBzdHJpbmcsXG4gIGRlY29kZXJPcHRzPzoge1xuICAgIGVuY29kaW5nPzogc3RyaW5nO1xuICAgIGZhdGFsPzogYm9vbGVhbjtcbiAgICBpZ25vcmVCT00/OiBib29sZWFuO1xuICB9LFxuKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPHN0cmluZz4ge1xuICBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoZGVjb2Rlck9wdHM/LmVuY29kaW5nLCBkZWNvZGVyT3B0cyk7XG4gIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2YgcmVhZERlbGltKHJlYWRlciwgZW5jb2Rlci5lbmNvZGUoZGVsaW0pKSkge1xuICAgIHlpZWxkIGRlY29kZXIuZGVjb2RlKGNodW5rKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFHckMsU0FBUyxTQUFTLFFBQVEsa0JBQWtCO0FBRTVDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FxQkMsR0FDRCxPQUFPLGdCQUFnQixnQkFDckIsTUFBYyxFQUNkLEtBQWEsRUFDYixXQUlDO0VBRUQsTUFBTSxVQUFVLElBQUk7RUFDcEIsTUFBTSxVQUFVLElBQUksWUFBWSxhQUFhLFVBQVU7RUFDdkQsV0FBVyxNQUFNLFNBQVMsVUFBVSxRQUFRLFFBQVEsTUFBTSxDQUFDLFFBQVM7SUFDbEUsTUFBTSxRQUFRLE1BQU0sQ0FBQztFQUN2QjtBQUNGIn0=
// denoCacheMetadata=6591962981425653213,14279897413425291455