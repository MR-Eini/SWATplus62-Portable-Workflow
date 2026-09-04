// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { BufReader } from "./buf_reader.ts";
import { concat } from "jsr:@std/bytes@^1.0.2/concat";
/**
 * Read strings line-by-line from a {@linkcode Reader}.
 *
 * @example Usage
 * ```ts
 * import { readLines } from "@std/io/read-lines";
 * import { assert } from "@std/assert/assert"
 *
 * let fileReader = await Deno.open("README.md");
 *
 * for await (let line of readLines(fileReader)) {
 *   assert(typeof line === "string");
 * }
 * ```
 *
 * @param reader The reader to read from
 * @param decoderOpts The options
 * @returns The async iterator of strings
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export async function* readLines(reader, decoderOpts) {
  const bufReader = new BufReader(reader);
  let chunks = [];
  const decoder = new TextDecoder(decoderOpts?.encoding, decoderOpts);
  while(true){
    const res = await bufReader.readLine();
    if (!res) {
      if (chunks.length > 0) {
        yield decoder.decode(concat(chunks));
      }
      break;
    }
    chunks.push(res.line);
    if (!res.more) {
      yield decoder.decode(concat(chunks));
      chunks = [];
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9yZWFkX2xpbmVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB0eXBlIHsgUmVhZGVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IEJ1ZlJlYWRlciB9IGZyb20gXCIuL2J1Zl9yZWFkZXIudHNcIjtcbmltcG9ydCB7IGNvbmNhdCB9IGZyb20gXCJqc3I6QHN0ZC9ieXRlc0BeMS4wLjIvY29uY2F0XCI7XG5cbi8qKlxuICogUmVhZCBzdHJpbmdzIGxpbmUtYnktbGluZSBmcm9tIGEge0BsaW5rY29kZSBSZWFkZXJ9LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcmVhZExpbmVzIH0gZnJvbSBcIkBzdGQvaW8vcmVhZC1saW5lc1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydFwiXG4gKlxuICogbGV0IGZpbGVSZWFkZXIgPSBhd2FpdCBEZW5vLm9wZW4oXCJSRUFETUUubWRcIik7XG4gKlxuICogZm9yIGF3YWl0IChsZXQgbGluZSBvZiByZWFkTGluZXMoZmlsZVJlYWRlcikpIHtcbiAqICAgYXNzZXJ0KHR5cGVvZiBsaW5lID09PSBcInN0cmluZ1wiKTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSByZWFkZXIgVGhlIHJlYWRlciB0byByZWFkIGZyb21cbiAqIEBwYXJhbSBkZWNvZGVyT3B0cyBUaGUgb3B0aW9uc1xuICogQHJldHVybnMgVGhlIGFzeW5jIGl0ZXJhdG9yIG9mIHN0cmluZ3NcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0cmVhbXNfQVBJIHwgV2ViIFN0cmVhbXMgQVBJfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24qIHJlYWRMaW5lcyhcbiAgcmVhZGVyOiBSZWFkZXIsXG4gIGRlY29kZXJPcHRzPzoge1xuICAgIGVuY29kaW5nPzogc3RyaW5nO1xuICAgIGZhdGFsPzogYm9vbGVhbjtcbiAgICBpZ25vcmVCT00/OiBib29sZWFuO1xuICB9LFxuKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPHN0cmluZz4ge1xuICBjb25zdCBidWZSZWFkZXIgPSBuZXcgQnVmUmVhZGVyKHJlYWRlcik7XG4gIGxldCBjaHVua3M6IFVpbnQ4QXJyYXlbXSA9IFtdO1xuICBjb25zdCBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKGRlY29kZXJPcHRzPy5lbmNvZGluZywgZGVjb2Rlck9wdHMpO1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGJ1ZlJlYWRlci5yZWFkTGluZSgpO1xuICAgIGlmICghcmVzKSB7XG4gICAgICBpZiAoY2h1bmtzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgeWllbGQgZGVjb2Rlci5kZWNvZGUoY29uY2F0KGNodW5rcykpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNodW5rcy5wdXNoKHJlcy5saW5lKTtcbiAgICBpZiAoIXJlcy5tb3JlKSB7XG4gICAgICB5aWVsZCBkZWNvZGVyLmRlY29kZShjb25jYXQoY2h1bmtzKSk7XG4gICAgICBjaHVua3MgPSBbXTtcbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBR3JDLFNBQVMsU0FBUyxRQUFRLGtCQUFrQjtBQUM1QyxTQUFTLE1BQU0sUUFBUSwrQkFBK0I7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0JDLEdBQ0QsT0FBTyxnQkFBZ0IsVUFDckIsTUFBYyxFQUNkLFdBSUM7RUFFRCxNQUFNLFlBQVksSUFBSSxVQUFVO0VBQ2hDLElBQUksU0FBdUIsRUFBRTtFQUM3QixNQUFNLFVBQVUsSUFBSSxZQUFZLGFBQWEsVUFBVTtFQUN2RCxNQUFPLEtBQU07SUFDWCxNQUFNLE1BQU0sTUFBTSxVQUFVLFFBQVE7SUFDcEMsSUFBSSxDQUFDLEtBQUs7TUFDUixJQUFJLE9BQU8sTUFBTSxHQUFHLEdBQUc7UUFDckIsTUFBTSxRQUFRLE1BQU0sQ0FBQyxPQUFPO01BQzlCO01BQ0E7SUFDRjtJQUNBLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSTtJQUNwQixJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUU7TUFDYixNQUFNLFFBQVEsTUFBTSxDQUFDLE9BQU87TUFDNUIsU0FBUyxFQUFFO0lBQ2I7RUFDRjtBQUNGIn0=
// denoCacheMetadata=2026400862455393613,16660206081423292585