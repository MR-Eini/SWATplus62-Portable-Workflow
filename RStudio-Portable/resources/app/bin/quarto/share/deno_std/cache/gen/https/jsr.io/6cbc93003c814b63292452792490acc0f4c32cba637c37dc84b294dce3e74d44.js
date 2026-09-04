// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Merge multiple streams into a single one, taking order into account, and
 * each stream will wait for a chunk to enqueue before the next stream can
 * append another chunk.
 *
 * If a stream ends before other ones, the others will continue adding data in
 * order, and the finished one will not add any more data. If you want to cancel
 * the other streams when one of them ends, use {@linkcode earlyZipReadableStreams}.
 *
 * @typeparam T The type of the chunks in the input/output streams.
 * @returns A `ReadableStream` that will emit the zipped chunks.
 *
 * @example Zip 2 streams with the same length
 * ```ts
 * import { zipReadableStreams } from "@std/streams/zip-readable-streams";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream1 = ReadableStream.from(["1", "2", "3"]);
 * const stream2 = ReadableStream.from(["a", "b", "c"]);
 * const zippedStream = zipReadableStreams(stream1, stream2);
 *
 * assertEquals(
 *   await Array.fromAsync(zippedStream),
 *   ["1", "a", "2", "b", "3", "c"],
 * );
 * ```
 *
 * @example Zip 2 streams with different length (first one is shorter)
 * ```ts
 * import { zipReadableStreams } from "@std/streams/zip-readable-streams";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream1 = ReadableStream.from(["1", "2"]);
 * const stream2 = ReadableStream.from(["a", "b", "c", "d"]);
 * const zippedStream = zipReadableStreams(stream1, stream2);
 *
 * assertEquals(
 *   await Array.fromAsync(zippedStream),
 *   ["1", "a", "2", "b", "c", "d"],
 * );
 * ```
 *
 * @example Zip 2 streams with different length (first one is longer)
 * ```ts
 * import { zipReadableStreams } from "@std/streams/zip-readable-streams";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream1 = ReadableStream.from(["1", "2", "3", "4"]);
 * const stream2 = ReadableStream.from(["a", "b"]);
 * const zippedStream = zipReadableStreams(stream1, stream2);
 *
 * assertEquals(
 *   await Array.fromAsync(zippedStream),
 *   ["1", "a", "2", "b", "3", "4"],
 * );
 * ```
 *
 * @example Zip 3 streams
 * ```ts
 * import { zipReadableStreams } from "@std/streams/zip-readable-streams";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream1 = ReadableStream.from(["1"]);
 * const stream2 = ReadableStream.from(["a", "b"]);
 * const stream3 = ReadableStream.from(["A", "B", "C"]);
 * const zippedStream = zipReadableStreams(stream1, stream2, stream3);
 *
 * assertEquals(
 *   await Array.fromAsync(zippedStream),
 *   ["1", "a", "A", "b", "B", "C"],
 * );
 * ```
 */ export function zipReadableStreams(...streams) {
  const readers = new Set(streams.map((s)=>s.getReader()));
  return new ReadableStream({
    async start (controller) {
      try {
        let resolved = 0;
        while(resolved !== streams.length){
          for (const reader of readers){
            const { value, done } = await reader.read();
            if (!done) {
              controller.enqueue(value);
            } else {
              resolved++;
              readers.delete(reader);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L3ppcF9yZWFkYWJsZV9zdHJlYW1zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogTWVyZ2UgbXVsdGlwbGUgc3RyZWFtcyBpbnRvIGEgc2luZ2xlIG9uZSwgdGFraW5nIG9yZGVyIGludG8gYWNjb3VudCwgYW5kXG4gKiBlYWNoIHN0cmVhbSB3aWxsIHdhaXQgZm9yIGEgY2h1bmsgdG8gZW5xdWV1ZSBiZWZvcmUgdGhlIG5leHQgc3RyZWFtIGNhblxuICogYXBwZW5kIGFub3RoZXIgY2h1bmsuXG4gKlxuICogSWYgYSBzdHJlYW0gZW5kcyBiZWZvcmUgb3RoZXIgb25lcywgdGhlIG90aGVycyB3aWxsIGNvbnRpbnVlIGFkZGluZyBkYXRhIGluXG4gKiBvcmRlciwgYW5kIHRoZSBmaW5pc2hlZCBvbmUgd2lsbCBub3QgYWRkIGFueSBtb3JlIGRhdGEuIElmIHlvdSB3YW50IHRvIGNhbmNlbFxuICogdGhlIG90aGVyIHN0cmVhbXMgd2hlbiBvbmUgb2YgdGhlbSBlbmRzLCB1c2Uge0BsaW5rY29kZSBlYXJseVppcFJlYWRhYmxlU3RyZWFtc30uXG4gKlxuICogQHR5cGVwYXJhbSBUIFRoZSB0eXBlIG9mIHRoZSBjaHVua3MgaW4gdGhlIGlucHV0L291dHB1dCBzdHJlYW1zLlxuICogQHJldHVybnMgQSBgUmVhZGFibGVTdHJlYW1gIHRoYXQgd2lsbCBlbWl0IHRoZSB6aXBwZWQgY2h1bmtzLlxuICpcbiAqIEBleGFtcGxlIFppcCAyIHN0cmVhbXMgd2l0aCB0aGUgc2FtZSBsZW5ndGhcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB6aXBSZWFkYWJsZVN0cmVhbXMgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL3ppcC1yZWFkYWJsZS1zdHJlYW1zXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHN0cmVhbTEgPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcIjFcIiwgXCIyXCIsIFwiM1wiXSk7XG4gKiBjb25zdCBzdHJlYW0yID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXCJhXCIsIFwiYlwiLCBcImNcIl0pO1xuICogY29uc3QgemlwcGVkU3RyZWFtID0gemlwUmVhZGFibGVTdHJlYW1zKHN0cmVhbTEsIHN0cmVhbTIpO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgYXdhaXQgQXJyYXkuZnJvbUFzeW5jKHppcHBlZFN0cmVhbSksXG4gKiAgIFtcIjFcIiwgXCJhXCIsIFwiMlwiLCBcImJcIiwgXCIzXCIsIFwiY1wiXSxcbiAqICk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBaaXAgMiBzdHJlYW1zIHdpdGggZGlmZmVyZW50IGxlbmd0aCAoZmlyc3Qgb25lIGlzIHNob3J0ZXIpXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgemlwUmVhZGFibGVTdHJlYW1zIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy96aXAtcmVhZGFibGUtc3RyZWFtc1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzdHJlYW0xID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXCIxXCIsIFwiMlwiXSk7XG4gKiBjb25zdCBzdHJlYW0yID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXCJhXCIsIFwiYlwiLCBcImNcIiwgXCJkXCJdKTtcbiAqIGNvbnN0IHppcHBlZFN0cmVhbSA9IHppcFJlYWRhYmxlU3RyZWFtcyhzdHJlYW0xLCBzdHJlYW0yKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGF3YWl0IEFycmF5LmZyb21Bc3luYyh6aXBwZWRTdHJlYW0pLFxuICogICBbXCIxXCIsIFwiYVwiLCBcIjJcIiwgXCJiXCIsIFwiY1wiLCBcImRcIl0sXG4gKiApO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgWmlwIDIgc3RyZWFtcyB3aXRoIGRpZmZlcmVudCBsZW5ndGggKGZpcnN0IG9uZSBpcyBsb25nZXIpXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgemlwUmVhZGFibGVTdHJlYW1zIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy96aXAtcmVhZGFibGUtc3RyZWFtc1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzdHJlYW0xID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXCIxXCIsIFwiMlwiLCBcIjNcIiwgXCI0XCJdKTtcbiAqIGNvbnN0IHN0cmVhbTIgPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcImFcIiwgXCJiXCJdKTtcbiAqIGNvbnN0IHppcHBlZFN0cmVhbSA9IHppcFJlYWRhYmxlU3RyZWFtcyhzdHJlYW0xLCBzdHJlYW0yKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGF3YWl0IEFycmF5LmZyb21Bc3luYyh6aXBwZWRTdHJlYW0pLFxuICogICBbXCIxXCIsIFwiYVwiLCBcIjJcIiwgXCJiXCIsIFwiM1wiLCBcIjRcIl0sXG4gKiApO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgWmlwIDMgc3RyZWFtc1xuICogYGBgdHNcbiAqIGltcG9ydCB7IHppcFJlYWRhYmxlU3RyZWFtcyB9IGZyb20gXCJAc3RkL3N0cmVhbXMvemlwLXJlYWRhYmxlLXN0cmVhbXNcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgc3RyZWFtMSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1wiMVwiXSk7XG4gKiBjb25zdCBzdHJlYW0yID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXCJhXCIsIFwiYlwiXSk7XG4gKiBjb25zdCBzdHJlYW0zID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXCJBXCIsIFwiQlwiLCBcIkNcIl0pO1xuICogY29uc3QgemlwcGVkU3RyZWFtID0gemlwUmVhZGFibGVTdHJlYW1zKHN0cmVhbTEsIHN0cmVhbTIsIHN0cmVhbTMpO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgYXdhaXQgQXJyYXkuZnJvbUFzeW5jKHppcHBlZFN0cmVhbSksXG4gKiAgIFtcIjFcIiwgXCJhXCIsIFwiQVwiLCBcImJcIiwgXCJCXCIsIFwiQ1wiXSxcbiAqICk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHppcFJlYWRhYmxlU3RyZWFtczxUPihcbiAgLi4uc3RyZWFtczogUmVhZGFibGVTdHJlYW08VD5bXVxuKTogUmVhZGFibGVTdHJlYW08VD4ge1xuICBjb25zdCByZWFkZXJzID0gbmV3IFNldChzdHJlYW1zLm1hcCgocykgPT4gcy5nZXRSZWFkZXIoKSkpO1xuICByZXR1cm4gbmV3IFJlYWRhYmxlU3RyZWFtPFQ+KHtcbiAgICBhc3luYyBzdGFydChjb250cm9sbGVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICBsZXQgcmVzb2x2ZWQgPSAwO1xuICAgICAgICB3aGlsZSAocmVzb2x2ZWQgIT09IHN0cmVhbXMubGVuZ3RoKSB7XG4gICAgICAgICAgZm9yIChjb25zdCByZWFkZXIgb2YgcmVhZGVycykge1xuICAgICAgICAgICAgY29uc3QgeyB2YWx1ZSwgZG9uZSB9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgICAgICAgIGlmICghZG9uZSkge1xuICAgICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUodmFsdWUhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc29sdmVkKys7XG4gICAgICAgICAgICAgIHJlYWRlcnMuZGVsZXRlKHJlYWRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnRyb2xsZXIuY2xvc2UoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29udHJvbGxlci5lcnJvcihlKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3RUMsR0FDRCxPQUFPLFNBQVMsbUJBQ2QsR0FBRyxPQUE0QjtFQUUvQixNQUFNLFVBQVUsSUFBSSxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBTSxFQUFFLFNBQVM7RUFDdEQsT0FBTyxJQUFJLGVBQWtCO0lBQzNCLE1BQU0sT0FBTSxVQUFVO01BQ3BCLElBQUk7UUFDRixJQUFJLFdBQVc7UUFDZixNQUFPLGFBQWEsUUFBUSxNQUFNLENBQUU7VUFDbEMsS0FBSyxNQUFNLFVBQVUsUUFBUztZQUM1QixNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sT0FBTyxJQUFJO1lBQ3pDLElBQUksQ0FBQyxNQUFNO2NBQ1QsV0FBVyxPQUFPLENBQUM7WUFDckIsT0FBTztjQUNMO2NBQ0EsUUFBUSxNQUFNLENBQUM7WUFDakI7VUFDRjtRQUNGO1FBQ0EsV0FBVyxLQUFLO01BQ2xCLEVBQUUsT0FBTyxHQUFHO1FBQ1YsV0FBVyxLQUFLLENBQUM7TUFDbkI7SUFDRjtFQUNGO0FBQ0YifQ==
// denoCacheMetadata=17291222295292072057,8841048248522809018