// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Concatenates multiple `ReadableStream`s into a single ordered
 * `ReadableStream`.
 *
 * Cancelling the resulting stream will cancel all the input streams.
 *
 * @typeParam T The type of the chunks in the streams.
 * @param streams An iterable of `ReadableStream`s to concat.
 * @returns A `ReadableStream` that will emit the concatenated chunks.
 *
 * @example Usage
 * ```ts
 * import { concatReadableStreams } from "@std/streams/concat-readable-streams";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream1 = ReadableStream.from([1, 2, 3]);
 * const stream2 = ReadableStream.from([4, 5, 6]);
 * const stream3 = ReadableStream.from([7, 8, 9]);
 *
 * assertEquals(
 *   await Array.fromAsync(concatReadableStreams(stream1, stream2, stream3)),
 *   [1, 2, 3, 4, 5, 6, 7, 8, 9],
 * );
 * ```
 */ export function concatReadableStreams(...streams) {
  let i = 0;
  return new ReadableStream({
    async pull (controller) {
      const reader = streams[i].getReader();
      const { done, value } = await reader.read();
      if (done) {
        if (streams.length === ++i) {
          return controller.close();
        }
        return await this.pull(controller);
      }
      controller.enqueue(value);
      reader.releaseLock();
    },
    async cancel (reason) {
      const promises = streams.map((stream)=>stream.cancel(reason));
      await Promise.allSettled(promises);
    }
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L2NvbmNhdF9yZWFkYWJsZV9zdHJlYW1zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbi8qKlxuICogQ29uY2F0ZW5hdGVzIG11bHRpcGxlIGBSZWFkYWJsZVN0cmVhbWBzIGludG8gYSBzaW5nbGUgb3JkZXJlZFxuICogYFJlYWRhYmxlU3RyZWFtYC5cbiAqXG4gKiBDYW5jZWxsaW5nIHRoZSByZXN1bHRpbmcgc3RyZWFtIHdpbGwgY2FuY2VsIGFsbCB0aGUgaW5wdXQgc3RyZWFtcy5cbiAqXG4gKiBAdHlwZVBhcmFtIFQgVGhlIHR5cGUgb2YgdGhlIGNodW5rcyBpbiB0aGUgc3RyZWFtcy5cbiAqIEBwYXJhbSBzdHJlYW1zIEFuIGl0ZXJhYmxlIG9mIGBSZWFkYWJsZVN0cmVhbWBzIHRvIGNvbmNhdC5cbiAqIEByZXR1cm5zIEEgYFJlYWRhYmxlU3RyZWFtYCB0aGF0IHdpbGwgZW1pdCB0aGUgY29uY2F0ZW5hdGVkIGNodW5rcy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNvbmNhdFJlYWRhYmxlU3RyZWFtcyB9IGZyb20gXCJAc3RkL3N0cmVhbXMvY29uY2F0LXJlYWRhYmxlLXN0cmVhbXNcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgc3RyZWFtMSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oWzEsIDIsIDNdKTtcbiAqIGNvbnN0IHN0cmVhbTIgPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFs0LCA1LCA2XSk7XG4gKiBjb25zdCBzdHJlYW0zID0gUmVhZGFibGVTdHJlYW0uZnJvbShbNywgOCwgOV0pO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgYXdhaXQgQXJyYXkuZnJvbUFzeW5jKGNvbmNhdFJlYWRhYmxlU3RyZWFtcyhzdHJlYW0xLCBzdHJlYW0yLCBzdHJlYW0zKSksXG4gKiAgIFsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSxcbiAqICk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdFJlYWRhYmxlU3RyZWFtczxUPihcbiAgLi4uc3RyZWFtczogUmVhZGFibGVTdHJlYW08VD5bXVxuKTogUmVhZGFibGVTdHJlYW08VD4ge1xuICBsZXQgaSA9IDA7XG4gIHJldHVybiBuZXcgUmVhZGFibGVTdHJlYW08VD4oe1xuICAgIGFzeW5jIHB1bGwoY29udHJvbGxlcikge1xuICAgICAgY29uc3QgcmVhZGVyID0gc3RyZWFtc1tpXSEuZ2V0UmVhZGVyKCk7XG4gICAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgaWYgKHN0cmVhbXMubGVuZ3RoID09PSArK2kpIHtcbiAgICAgICAgICByZXR1cm4gY29udHJvbGxlci5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnB1bGwhKGNvbnRyb2xsZXIpO1xuICAgICAgfVxuICAgICAgY29udHJvbGxlci5lbnF1ZXVlKHZhbHVlKTtcbiAgICAgIHJlYWRlci5yZWxlYXNlTG9jaygpO1xuICAgIH0sXG4gICAgYXN5bmMgY2FuY2VsKHJlYXNvbikge1xuICAgICAgY29uc3QgcHJvbWlzZXMgPSBzdHJlYW1zLm1hcCgoc3RyZWFtKSA9PiBzdHJlYW0uY2FuY2VsKHJlYXNvbikpO1xuICAgICAgYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKHByb21pc2VzKTtcbiAgICB9LFxuICB9KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCQyxHQUNELE9BQU8sU0FBUyxzQkFDZCxHQUFHLE9BQTRCO0VBRS9CLElBQUksSUFBSTtFQUNSLE9BQU8sSUFBSSxlQUFrQjtJQUMzQixNQUFNLE1BQUssVUFBVTtNQUNuQixNQUFNLFNBQVMsT0FBTyxDQUFDLEVBQUUsQ0FBRSxTQUFTO01BQ3BDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxPQUFPLElBQUk7TUFDekMsSUFBSSxNQUFNO1FBQ1IsSUFBSSxRQUFRLE1BQU0sS0FBSyxFQUFFLEdBQUc7VUFDMUIsT0FBTyxXQUFXLEtBQUs7UUFDekI7UUFDQSxPQUFPLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBRTtNQUMxQjtNQUNBLFdBQVcsT0FBTyxDQUFDO01BQ25CLE9BQU8sV0FBVztJQUNwQjtJQUNBLE1BQU0sUUFBTyxNQUFNO01BQ2pCLE1BQU0sV0FBVyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQVcsT0FBTyxNQUFNLENBQUM7TUFDdkQsTUFBTSxRQUFRLFVBQVUsQ0FBQztJQUMzQjtFQUNGO0FBQ0YifQ==
// denoCacheMetadata=12562650007468222700,10668388809721926675