// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Merge multiple streams into a single one, taking order into account, and each
 * stream will wait for a chunk to enqueue before the next stream can append
 * another chunk.
 *
 * If a stream ends before other ones, the others will be cancelled after the
 * last chunk of said stream is read. See the examples below for more
 * comprehensible information. If you want to continue reading the other streams
 * even after one of them ends, use {@linkcode zipReadableStreams}.
 *
 * @typeparam T The type of the chunks in the input streams.
 * @returns A `ReadableStream` that will emit the zipped chunks
 *
 * @example Zip 2 streams with the same length
 * ```ts
 * import { earlyZipReadableStreams } from "@std/streams/early-zip-readable-streams";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream1 = ReadableStream.from(["1", "2", "3"]);
 * const stream2 = ReadableStream.from(["a", "b", "c"]);
 * const zippedStream = earlyZipReadableStreams(stream1, stream2);
 *
 * assertEquals(
 *   await Array.fromAsync(zippedStream),
 *   ["1", "a", "2", "b", "3", "c"],
 * );
 * ```
 *
 * @example Zip 2 streams with different length (first one is shorter)
 * ```ts
 * import { earlyZipReadableStreams } from "@std/streams/early-zip-readable-streams";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream1 = ReadableStream.from(["1", "2"]);
 * const stream2 = ReadableStream.from(["a", "b", "c", "d"]);
 * const zippedStream = earlyZipReadableStreams(stream1, stream2);
 *
 * // The first stream ends before the second one. When the first stream ends,
 * // the second one is cancelled and no more data is read or added to the
 * // zipped stream.
 * assertEquals(
 *   await Array.fromAsync(zippedStream),
 *   ["1", "a", "2", "b"],
 * );
 * ```
 *
 * @example Zip 2 streams with different length (first one is longer)
 * ```ts
 * import { earlyZipReadableStreams } from "@std/streams/early-zip-readable-streams";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream1 = ReadableStream.from(["1", "2", "3", "4"]);
 * const stream2 = ReadableStream.from(["a", "b"]);
 * const zippedStream = earlyZipReadableStreams(stream1, stream2);
 *
 * // The second stream ends before the first one. When the second stream ends,
 * // the first one is cancelled, but the chunk of "3" is already read so it
 * // is added to the zipped stream.
 * assertEquals(
 *   await Array.fromAsync(zippedStream),
 *   ["1", "a", "2", "b", "3"],
 * );
 * ```
 *
 * @example Zip 3 streams
 * ```ts
 * import { earlyZipReadableStreams } from "@std/streams/early-zip-readable-streams";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream1 = ReadableStream.from(["1"]);
 * const stream2 = ReadableStream.from(["a", "b"]);
 * const stream3 = ReadableStream.from(["A", "B", "C"]);
 * const zippedStream = earlyZipReadableStreams(stream1, stream2, stream3);
 *
 * assertEquals(
 *   await Array.fromAsync(zippedStream),
 *   ["1", "a", "A"],
 * );
 * ```
 */ export function earlyZipReadableStreams(...streams) {
  const readers = streams.map((s)=>s.getReader());
  return new ReadableStream({
    async start (controller) {
      try {
        loop: while(true){
          for (const reader of readers){
            const { value, done } = await reader.read();
            if (!done) {
              controller.enqueue(value);
            } else {
              await Promise.all(readers.map((reader)=>reader.cancel()));
              break loop;
            }
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    }
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L2Vhcmx5X3ppcF9yZWFkYWJsZV9zdHJlYW1zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogTWVyZ2UgbXVsdGlwbGUgc3RyZWFtcyBpbnRvIGEgc2luZ2xlIG9uZSwgdGFraW5nIG9yZGVyIGludG8gYWNjb3VudCwgYW5kIGVhY2hcbiAqIHN0cmVhbSB3aWxsIHdhaXQgZm9yIGEgY2h1bmsgdG8gZW5xdWV1ZSBiZWZvcmUgdGhlIG5leHQgc3RyZWFtIGNhbiBhcHBlbmRcbiAqIGFub3RoZXIgY2h1bmsuXG4gKlxuICogSWYgYSBzdHJlYW0gZW5kcyBiZWZvcmUgb3RoZXIgb25lcywgdGhlIG90aGVycyB3aWxsIGJlIGNhbmNlbGxlZCBhZnRlciB0aGVcbiAqIGxhc3QgY2h1bmsgb2Ygc2FpZCBzdHJlYW0gaXMgcmVhZC4gU2VlIHRoZSBleGFtcGxlcyBiZWxvdyBmb3IgbW9yZVxuICogY29tcHJlaGVuc2libGUgaW5mb3JtYXRpb24uIElmIHlvdSB3YW50IHRvIGNvbnRpbnVlIHJlYWRpbmcgdGhlIG90aGVyIHN0cmVhbXNcbiAqIGV2ZW4gYWZ0ZXIgb25lIG9mIHRoZW0gZW5kcywgdXNlIHtAbGlua2NvZGUgemlwUmVhZGFibGVTdHJlYW1zfS5cbiAqXG4gKiBAdHlwZXBhcmFtIFQgVGhlIHR5cGUgb2YgdGhlIGNodW5rcyBpbiB0aGUgaW5wdXQgc3RyZWFtcy5cbiAqIEByZXR1cm5zIEEgYFJlYWRhYmxlU3RyZWFtYCB0aGF0IHdpbGwgZW1pdCB0aGUgemlwcGVkIGNodW5rc1xuICpcbiAqIEBleGFtcGxlIFppcCAyIHN0cmVhbXMgd2l0aCB0aGUgc2FtZSBsZW5ndGhcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlYXJseVppcFJlYWRhYmxlU3RyZWFtcyB9IGZyb20gXCJAc3RkL3N0cmVhbXMvZWFybHktemlwLXJlYWRhYmxlLXN0cmVhbXNcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgc3RyZWFtMSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1wiMVwiLCBcIjJcIiwgXCIzXCJdKTtcbiAqIGNvbnN0IHN0cmVhbTIgPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcImFcIiwgXCJiXCIsIFwiY1wiXSk7XG4gKiBjb25zdCB6aXBwZWRTdHJlYW0gPSBlYXJseVppcFJlYWRhYmxlU3RyZWFtcyhzdHJlYW0xLCBzdHJlYW0yKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGF3YWl0IEFycmF5LmZyb21Bc3luYyh6aXBwZWRTdHJlYW0pLFxuICogICBbXCIxXCIsIFwiYVwiLCBcIjJcIiwgXCJiXCIsIFwiM1wiLCBcImNcIl0sXG4gKiApO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgWmlwIDIgc3RyZWFtcyB3aXRoIGRpZmZlcmVudCBsZW5ndGggKGZpcnN0IG9uZSBpcyBzaG9ydGVyKVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVhcmx5WmlwUmVhZGFibGVTdHJlYW1zIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9lYXJseS16aXAtcmVhZGFibGUtc3RyZWFtc1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzdHJlYW0xID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXCIxXCIsIFwiMlwiXSk7XG4gKiBjb25zdCBzdHJlYW0yID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXCJhXCIsIFwiYlwiLCBcImNcIiwgXCJkXCJdKTtcbiAqIGNvbnN0IHppcHBlZFN0cmVhbSA9IGVhcmx5WmlwUmVhZGFibGVTdHJlYW1zKHN0cmVhbTEsIHN0cmVhbTIpO1xuICpcbiAqIC8vIFRoZSBmaXJzdCBzdHJlYW0gZW5kcyBiZWZvcmUgdGhlIHNlY29uZCBvbmUuIFdoZW4gdGhlIGZpcnN0IHN0cmVhbSBlbmRzLFxuICogLy8gdGhlIHNlY29uZCBvbmUgaXMgY2FuY2VsbGVkIGFuZCBubyBtb3JlIGRhdGEgaXMgcmVhZCBvciBhZGRlZCB0byB0aGVcbiAqIC8vIHppcHBlZCBzdHJlYW0uXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGF3YWl0IEFycmF5LmZyb21Bc3luYyh6aXBwZWRTdHJlYW0pLFxuICogICBbXCIxXCIsIFwiYVwiLCBcIjJcIiwgXCJiXCJdLFxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIFppcCAyIHN0cmVhbXMgd2l0aCBkaWZmZXJlbnQgbGVuZ3RoIChmaXJzdCBvbmUgaXMgbG9uZ2VyKVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVhcmx5WmlwUmVhZGFibGVTdHJlYW1zIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9lYXJseS16aXAtcmVhZGFibGUtc3RyZWFtc1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzdHJlYW0xID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXCIxXCIsIFwiMlwiLCBcIjNcIiwgXCI0XCJdKTtcbiAqIGNvbnN0IHN0cmVhbTIgPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcImFcIiwgXCJiXCJdKTtcbiAqIGNvbnN0IHppcHBlZFN0cmVhbSA9IGVhcmx5WmlwUmVhZGFibGVTdHJlYW1zKHN0cmVhbTEsIHN0cmVhbTIpO1xuICpcbiAqIC8vIFRoZSBzZWNvbmQgc3RyZWFtIGVuZHMgYmVmb3JlIHRoZSBmaXJzdCBvbmUuIFdoZW4gdGhlIHNlY29uZCBzdHJlYW0gZW5kcyxcbiAqIC8vIHRoZSBmaXJzdCBvbmUgaXMgY2FuY2VsbGVkLCBidXQgdGhlIGNodW5rIG9mIFwiM1wiIGlzIGFscmVhZHkgcmVhZCBzbyBpdFxuICogLy8gaXMgYWRkZWQgdG8gdGhlIHppcHBlZCBzdHJlYW0uXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGF3YWl0IEFycmF5LmZyb21Bc3luYyh6aXBwZWRTdHJlYW0pLFxuICogICBbXCIxXCIsIFwiYVwiLCBcIjJcIiwgXCJiXCIsIFwiM1wiXSxcbiAqICk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBaaXAgMyBzdHJlYW1zXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZWFybHlaaXBSZWFkYWJsZVN0cmVhbXMgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2Vhcmx5LXppcC1yZWFkYWJsZS1zdHJlYW1zXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHN0cmVhbTEgPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcIjFcIl0pO1xuICogY29uc3Qgc3RyZWFtMiA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1wiYVwiLCBcImJcIl0pO1xuICogY29uc3Qgc3RyZWFtMyA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1wiQVwiLCBcIkJcIiwgXCJDXCJdKTtcbiAqIGNvbnN0IHppcHBlZFN0cmVhbSA9IGVhcmx5WmlwUmVhZGFibGVTdHJlYW1zKHN0cmVhbTEsIHN0cmVhbTIsIHN0cmVhbTMpO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgYXdhaXQgQXJyYXkuZnJvbUFzeW5jKHppcHBlZFN0cmVhbSksXG4gKiAgIFtcIjFcIiwgXCJhXCIsIFwiQVwiXSxcbiAqICk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVhcmx5WmlwUmVhZGFibGVTdHJlYW1zPFQ+KFxuICAuLi5zdHJlYW1zOiBSZWFkYWJsZVN0cmVhbTxUPltdXG4pOiBSZWFkYWJsZVN0cmVhbTxUPiB7XG4gIGNvbnN0IHJlYWRlcnMgPSBzdHJlYW1zLm1hcCgocykgPT4gcy5nZXRSZWFkZXIoKSk7XG4gIHJldHVybiBuZXcgUmVhZGFibGVTdHJlYW08VD4oe1xuICAgIGFzeW5jIHN0YXJ0KGNvbnRyb2xsZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxvb3A6XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgZm9yIChjb25zdCByZWFkZXIgb2YgcmVhZGVycykge1xuICAgICAgICAgICAgY29uc3QgeyB2YWx1ZSwgZG9uZSB9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgICAgICAgIGlmICghZG9uZSkge1xuICAgICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUodmFsdWUhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHJlYWRlcnMubWFwKChyZWFkZXIpID0+IHJlYWRlci5jYW5jZWwoKSkpO1xuICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb250cm9sbGVyLmNsb3NlKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnRyb2xsZXIuZXJyb3IoZSk7XG4gICAgICB9XG4gICAgfSxcbiAgfSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQStFQyxHQUNELE9BQU8sU0FBUyx3QkFDZCxHQUFHLE9BQTRCO0VBRS9CLE1BQU0sVUFBVSxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQU0sRUFBRSxTQUFTO0VBQzlDLE9BQU8sSUFBSSxlQUFrQjtJQUMzQixNQUFNLE9BQU0sVUFBVTtNQUNwQixJQUFJO1FBQ0YsTUFDQSxNQUFPLEtBQU07VUFDWCxLQUFLLE1BQU0sVUFBVSxRQUFTO1lBQzVCLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxPQUFPLElBQUk7WUFDekMsSUFBSSxDQUFDLE1BQU07Y0FDVCxXQUFXLE9BQU8sQ0FBQztZQUNyQixPQUFPO2NBQ0wsTUFBTSxRQUFRLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQVcsT0FBTyxNQUFNO2NBQ3ZELE1BQU07WUFDUjtVQUNGO1FBQ0Y7UUFDQSxXQUFXLEtBQUs7TUFDbEIsRUFBRSxPQUFPLEdBQUc7UUFDVixXQUFXLEtBQUssQ0FBQztNQUNuQjtJQUNGO0VBQ0Y7QUFDRiJ9
// denoCacheMetadata=11176701599952579284,2491678052211301781