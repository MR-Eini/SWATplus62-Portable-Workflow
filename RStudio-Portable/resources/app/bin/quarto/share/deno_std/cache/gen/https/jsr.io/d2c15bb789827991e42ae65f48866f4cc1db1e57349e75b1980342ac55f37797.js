// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Merge multiple streams into a single one, not taking order into account.
 * If a stream ends before other ones, the other will continue adding data,
 * and the finished one will not add any more data.
 *
 * @typeparam T The type of the chunks in the input/output streams.
 * @param streams An iterable of `ReadableStream`s to merge.
 * @returns A `ReadableStream` that will emit the merged chunks.
 *
 * @example Merge 2 streams
 * ```ts
 * import { mergeReadableStreams } from "@std/streams/merge-readable-streams";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream1 = ReadableStream.from([1, 2]);
 * const stream2 = ReadableStream.from([3, 4, 5]);
 *
 * const mergedStream = mergeReadableStreams(stream1, stream2);
 * const merged = await Array.fromAsync(mergedStream);
 * assertEquals(merged.toSorted(), [1, 2, 3, 4, 5]);
 * ```
 *
 * @example Merge 3 streams
 * ```ts
 * import { mergeReadableStreams } from "@std/streams/merge-readable-streams";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream1 = ReadableStream.from([1, 2]);
 * const stream2 = ReadableStream.from([3, 4, 5]);
 * const stream3 = ReadableStream.from([6]);
 *
 * const mergedStream = mergeReadableStreams(stream1, stream2, stream3);
 * const merged = await Array.fromAsync(mergedStream);
 * assertEquals(merged.toSorted(), [1, 2, 3, 4, 5, 6]);
 * ```
 */ export function mergeReadableStreams(...streams) {
  const resolvePromises = streams.map(()=>Promise.withResolvers());
  return new ReadableStream({
    start (controller) {
      let mustClose = false;
      Promise.all(resolvePromises.map(({ promise })=>promise)).then(()=>{
        controller.close();
      }).catch((error)=>{
        mustClose = true;
        controller.error(error);
      });
      for (const [index, stream] of streams.entries()){
        (async ()=>{
          try {
            for await (const data of stream){
              if (mustClose) {
                break;
              }
              controller.enqueue(data);
            }
            resolvePromises[index].resolve();
          } catch (error) {
            resolvePromises[index].reject(error);
          }
        })();
      }
    }
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L21lcmdlX3JlYWRhYmxlX3N0cmVhbXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuLyoqXG4gKiBNZXJnZSBtdWx0aXBsZSBzdHJlYW1zIGludG8gYSBzaW5nbGUgb25lLCBub3QgdGFraW5nIG9yZGVyIGludG8gYWNjb3VudC5cbiAqIElmIGEgc3RyZWFtIGVuZHMgYmVmb3JlIG90aGVyIG9uZXMsIHRoZSBvdGhlciB3aWxsIGNvbnRpbnVlIGFkZGluZyBkYXRhLFxuICogYW5kIHRoZSBmaW5pc2hlZCBvbmUgd2lsbCBub3QgYWRkIGFueSBtb3JlIGRhdGEuXG4gKlxuICogQHR5cGVwYXJhbSBUIFRoZSB0eXBlIG9mIHRoZSBjaHVua3MgaW4gdGhlIGlucHV0L291dHB1dCBzdHJlYW1zLlxuICogQHBhcmFtIHN0cmVhbXMgQW4gaXRlcmFibGUgb2YgYFJlYWRhYmxlU3RyZWFtYHMgdG8gbWVyZ2UuXG4gKiBAcmV0dXJucyBBIGBSZWFkYWJsZVN0cmVhbWAgdGhhdCB3aWxsIGVtaXQgdGhlIG1lcmdlZCBjaHVua3MuXG4gKlxuICogQGV4YW1wbGUgTWVyZ2UgMiBzdHJlYW1zXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgbWVyZ2VSZWFkYWJsZVN0cmVhbXMgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL21lcmdlLXJlYWRhYmxlLXN0cmVhbXNcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgc3RyZWFtMSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oWzEsIDJdKTtcbiAqIGNvbnN0IHN0cmVhbTIgPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFszLCA0LCA1XSk7XG4gKlxuICogY29uc3QgbWVyZ2VkU3RyZWFtID0gbWVyZ2VSZWFkYWJsZVN0cmVhbXMoc3RyZWFtMSwgc3RyZWFtMik7XG4gKiBjb25zdCBtZXJnZWQgPSBhd2FpdCBBcnJheS5mcm9tQXN5bmMobWVyZ2VkU3RyZWFtKTtcbiAqIGFzc2VydEVxdWFscyhtZXJnZWQudG9Tb3J0ZWQoKSwgWzEsIDIsIDMsIDQsIDVdKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIE1lcmdlIDMgc3RyZWFtc1xuICogYGBgdHNcbiAqIGltcG9ydCB7IG1lcmdlUmVhZGFibGVTdHJlYW1zIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9tZXJnZS1yZWFkYWJsZS1zdHJlYW1zXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHN0cmVhbTEgPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFsxLCAyXSk7XG4gKiBjb25zdCBzdHJlYW0yID0gUmVhZGFibGVTdHJlYW0uZnJvbShbMywgNCwgNV0pO1xuICogY29uc3Qgc3RyZWFtMyA9IFJlYWRhYmxlU3RyZWFtLmZyb20oWzZdKTtcbiAqXG4gKiBjb25zdCBtZXJnZWRTdHJlYW0gPSBtZXJnZVJlYWRhYmxlU3RyZWFtcyhzdHJlYW0xLCBzdHJlYW0yLCBzdHJlYW0zKTtcbiAqIGNvbnN0IG1lcmdlZCA9IGF3YWl0IEFycmF5LmZyb21Bc3luYyhtZXJnZWRTdHJlYW0pO1xuICogYXNzZXJ0RXF1YWxzKG1lcmdlZC50b1NvcnRlZCgpLCBbMSwgMiwgMywgNCwgNSwgNl0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVJlYWRhYmxlU3RyZWFtczxUPihcbiAgLi4uc3RyZWFtczogUmVhZGFibGVTdHJlYW08VD5bXVxuKTogUmVhZGFibGVTdHJlYW08VD4ge1xuICBjb25zdCByZXNvbHZlUHJvbWlzZXMgPSBzdHJlYW1zLm1hcCgoKSA9PiBQcm9taXNlLndpdGhSZXNvbHZlcnM8dm9pZD4oKSk7XG4gIHJldHVybiBuZXcgUmVhZGFibGVTdHJlYW08VD4oe1xuICAgIHN0YXJ0KGNvbnRyb2xsZXIpIHtcbiAgICAgIGxldCBtdXN0Q2xvc2UgPSBmYWxzZTtcbiAgICAgIFByb21pc2UuYWxsKHJlc29sdmVQcm9taXNlcy5tYXAoKHsgcHJvbWlzZSB9KSA9PiBwcm9taXNlKSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnRyb2xsZXIuY2xvc2UoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgIG11c3RDbG9zZSA9IHRydWU7XG4gICAgICAgICAgY29udHJvbGxlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgZm9yIChjb25zdCBbaW5kZXgsIHN0cmVhbV0gb2Ygc3RyZWFtcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBkYXRhIG9mIHN0cmVhbSkge1xuICAgICAgICAgICAgICBpZiAobXVzdENsb3NlKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZVByb21pc2VzW2luZGV4XSEucmVzb2x2ZSgpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZXNbaW5kZXhdIS5yZWplY3QoZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkoKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUNDLEdBQ0QsT0FBTyxTQUFTLHFCQUNkLEdBQUcsT0FBNEI7RUFFL0IsTUFBTSxrQkFBa0IsUUFBUSxHQUFHLENBQUMsSUFBTSxRQUFRLGFBQWE7RUFDL0QsT0FBTyxJQUFJLGVBQWtCO0lBQzNCLE9BQU0sVUFBVTtNQUNkLElBQUksWUFBWTtNQUNoQixRQUFRLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBSyxVQUM5QyxJQUFJLENBQUM7UUFDSixXQUFXLEtBQUs7TUFDbEIsR0FDQyxLQUFLLENBQUMsQ0FBQztRQUNOLFlBQVk7UUFDWixXQUFXLEtBQUssQ0FBQztNQUNuQjtNQUNGLEtBQUssTUFBTSxDQUFDLE9BQU8sT0FBTyxJQUFJLFFBQVEsT0FBTyxHQUFJO1FBQy9DLENBQUM7VUFDQyxJQUFJO1lBQ0YsV0FBVyxNQUFNLFFBQVEsT0FBUTtjQUMvQixJQUFJLFdBQVc7Z0JBQ2I7Y0FDRjtjQUNBLFdBQVcsT0FBTyxDQUFDO1lBQ3JCO1lBQ0EsZUFBZSxDQUFDLE1BQU0sQ0FBRSxPQUFPO1VBQ2pDLEVBQUUsT0FBTyxPQUFPO1lBQ2QsZUFBZSxDQUFDLE1BQU0sQ0FBRSxNQUFNLENBQUM7VUFDakM7UUFDRixDQUFDO01BQ0g7SUFDRjtFQUNGO0FBQ0YifQ==
// denoCacheMetadata=10568605214413329825,17903187680679673936