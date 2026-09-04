// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Error message emitted from the thrown error while mapping. */ export const ERROR_WHILE_MAPPING_MESSAGE = "Threw while mapping.";
/**
 * pooledMap transforms values from an (async) iterable into another async
 * iterable. The transforms are done concurrently, with a max concurrency
 * defined by the poolLimit.
 *
 * If an error is thrown from `iterableFn`, no new transformations will begin.
 * All currently executing transformations are allowed to finish and still
 * yielded on success. After that, the rejections among them are gathered and
 * thrown by the iterator in an `AggregateError`.
 *
 * @example Usage
 * ```ts
 * import { pooledMap } from "@std/async/pool";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const results = pooledMap(
 *   2,
 *   [1, 2, 3],
 *   (i) => new Promise((r) => setTimeout(() => r(i), 1000)),
 * );
 *
 * assertEquals(await Array.fromAsync(results), [1, 2, 3]);
 * ```
 *
 * @typeParam T the input type.
 * @typeParam R the output type.
 * @param poolLimit The maximum count of items being processed concurrently.
 * @param array The input array for mapping.
 * @param iteratorFn The function to call for every item of the array.
 * @returns The async iterator with the transformed values.
 */ export function pooledMap(poolLimit, array, iteratorFn) {
  // Create the async iterable that is returned from this function.
  const res = new TransformStream({
    async transform (p, controller) {
      try {
        const s = await p;
        controller.enqueue(s);
      } catch (e) {
        if (e instanceof AggregateError && e.message === ERROR_WHILE_MAPPING_MESSAGE) {
          controller.error(e);
        }
      }
    }
  });
  // Start processing items from the iterator
  (async ()=>{
    const writer = res.writable.getWriter();
    const executing = [];
    try {
      for await (const item of array){
        const p = Promise.resolve().then(()=>iteratorFn(item));
        // Only write on success. If we `writer.write()` a rejected promise,
        // that will end the iteration. We don't want that yet. Instead let it
        // fail the race, taking us to the catch block where all currently
        // executing jobs are allowed to finish and all rejections among them
        // can be reported together.
        writer.write(p);
        const e = p.then(()=>executing.splice(executing.indexOf(e), 1));
        executing.push(e);
        if (executing.length >= poolLimit) {
          await Promise.race(executing);
        }
      }
      // Wait until all ongoing events have processed, then close the writer.
      await Promise.all(executing);
      writer.close();
    } catch  {
      const errors = [];
      for (const result of (await Promise.allSettled(executing))){
        if (result.status === "rejected") {
          errors.push(result.reason);
        }
      }
      writer.write(Promise.reject(new AggregateError(errors, ERROR_WHILE_MAPPING_MESSAGE))).catch(()=>{});
    }
  })();
  // Feature test until browser coverage is adequate
  return Symbol.asyncIterator in res.readable && typeof res.readable[Symbol.asyncIterator] === "function" ? res.readable[Symbol.asyncIterator]() : async function*() {
    const reader = res.readable.getReader();
    while(true){
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
    reader.releaseLock();
  }();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXN5bmMvMC4yMjQuMi9wb29sLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKiBFcnJvciBtZXNzYWdlIGVtaXR0ZWQgZnJvbSB0aGUgdGhyb3duIGVycm9yIHdoaWxlIG1hcHBpbmcuICovXG5leHBvcnQgY29uc3QgRVJST1JfV0hJTEVfTUFQUElOR19NRVNTQUdFID0gXCJUaHJldyB3aGlsZSBtYXBwaW5nLlwiO1xuXG4vKipcbiAqIHBvb2xlZE1hcCB0cmFuc2Zvcm1zIHZhbHVlcyBmcm9tIGFuIChhc3luYykgaXRlcmFibGUgaW50byBhbm90aGVyIGFzeW5jXG4gKiBpdGVyYWJsZS4gVGhlIHRyYW5zZm9ybXMgYXJlIGRvbmUgY29uY3VycmVudGx5LCB3aXRoIGEgbWF4IGNvbmN1cnJlbmN5XG4gKiBkZWZpbmVkIGJ5IHRoZSBwb29sTGltaXQuXG4gKlxuICogSWYgYW4gZXJyb3IgaXMgdGhyb3duIGZyb20gYGl0ZXJhYmxlRm5gLCBubyBuZXcgdHJhbnNmb3JtYXRpb25zIHdpbGwgYmVnaW4uXG4gKiBBbGwgY3VycmVudGx5IGV4ZWN1dGluZyB0cmFuc2Zvcm1hdGlvbnMgYXJlIGFsbG93ZWQgdG8gZmluaXNoIGFuZCBzdGlsbFxuICogeWllbGRlZCBvbiBzdWNjZXNzLiBBZnRlciB0aGF0LCB0aGUgcmVqZWN0aW9ucyBhbW9uZyB0aGVtIGFyZSBnYXRoZXJlZCBhbmRcbiAqIHRocm93biBieSB0aGUgaXRlcmF0b3IgaW4gYW4gYEFnZ3JlZ2F0ZUVycm9yYC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBvb2xlZE1hcCB9IGZyb20gXCJAc3RkL2FzeW5jL3Bvb2xcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgcmVzdWx0cyA9IHBvb2xlZE1hcChcbiAqICAgMixcbiAqICAgWzEsIDIsIDNdLFxuICogICAoaSkgPT4gbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQoKCkgPT4gcihpKSwgMTAwMCkpLFxuICogKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoYXdhaXQgQXJyYXkuZnJvbUFzeW5jKHJlc3VsdHMpLCBbMSwgMiwgM10pO1xuICogYGBgXG4gKlxuICogQHR5cGVQYXJhbSBUIHRoZSBpbnB1dCB0eXBlLlxuICogQHR5cGVQYXJhbSBSIHRoZSBvdXRwdXQgdHlwZS5cbiAqIEBwYXJhbSBwb29sTGltaXQgVGhlIG1heGltdW0gY291bnQgb2YgaXRlbXMgYmVpbmcgcHJvY2Vzc2VkIGNvbmN1cnJlbnRseS5cbiAqIEBwYXJhbSBhcnJheSBUaGUgaW5wdXQgYXJyYXkgZm9yIG1hcHBpbmcuXG4gKiBAcGFyYW0gaXRlcmF0b3JGbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZXZlcnkgaXRlbSBvZiB0aGUgYXJyYXkuXG4gKiBAcmV0dXJucyBUaGUgYXN5bmMgaXRlcmF0b3Igd2l0aCB0aGUgdHJhbnNmb3JtZWQgdmFsdWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9vbGVkTWFwPFQsIFI+KFxuICBwb29sTGltaXQ6IG51bWJlcixcbiAgYXJyYXk6IEl0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYWJsZTxUPixcbiAgaXRlcmF0b3JGbjogKGRhdGE6IFQpID0+IFByb21pc2U8Uj4sXG4pOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Uj4ge1xuICAvLyBDcmVhdGUgdGhlIGFzeW5jIGl0ZXJhYmxlIHRoYXQgaXMgcmV0dXJuZWQgZnJvbSB0aGlzIGZ1bmN0aW9uLlxuICBjb25zdCByZXMgPSBuZXcgVHJhbnNmb3JtU3RyZWFtPFByb21pc2U8Uj4sIFI+KHtcbiAgICBhc3luYyB0cmFuc2Zvcm0oXG4gICAgICBwOiBQcm9taXNlPFI+LFxuICAgICAgY29udHJvbGxlcjogVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXI8Uj4sXG4gICAgKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzID0gYXdhaXQgcDtcbiAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKHMpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZSBpbnN0YW5jZW9mIEFnZ3JlZ2F0ZUVycm9yICYmXG4gICAgICAgICAgZS5tZXNzYWdlID09PSBFUlJPUl9XSElMRV9NQVBQSU5HX01FU1NBR0VcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29udHJvbGxlci5lcnJvcihlIGFzIHVua25vd24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfSk7XG4gIC8vIFN0YXJ0IHByb2Nlc3NpbmcgaXRlbXMgZnJvbSB0aGUgaXRlcmF0b3JcbiAgKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB3cml0ZXIgPSByZXMud3JpdGFibGUuZ2V0V3JpdGVyKCk7XG4gICAgY29uc3QgZXhlY3V0aW5nOiBBcnJheTxQcm9taXNlPHVua25vd24+PiA9IFtdO1xuICAgIHRyeSB7XG4gICAgICBmb3IgYXdhaXQgKGNvbnN0IGl0ZW0gb2YgYXJyYXkpIHtcbiAgICAgICAgY29uc3QgcCA9IFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4gaXRlcmF0b3JGbihpdGVtKSk7XG4gICAgICAgIC8vIE9ubHkgd3JpdGUgb24gc3VjY2Vzcy4gSWYgd2UgYHdyaXRlci53cml0ZSgpYCBhIHJlamVjdGVkIHByb21pc2UsXG4gICAgICAgIC8vIHRoYXQgd2lsbCBlbmQgdGhlIGl0ZXJhdGlvbi4gV2UgZG9uJ3Qgd2FudCB0aGF0IHlldC4gSW5zdGVhZCBsZXQgaXRcbiAgICAgICAgLy8gZmFpbCB0aGUgcmFjZSwgdGFraW5nIHVzIHRvIHRoZSBjYXRjaCBibG9jayB3aGVyZSBhbGwgY3VycmVudGx5XG4gICAgICAgIC8vIGV4ZWN1dGluZyBqb2JzIGFyZSBhbGxvd2VkIHRvIGZpbmlzaCBhbmQgYWxsIHJlamVjdGlvbnMgYW1vbmcgdGhlbVxuICAgICAgICAvLyBjYW4gYmUgcmVwb3J0ZWQgdG9nZXRoZXIuXG4gICAgICAgIHdyaXRlci53cml0ZShwKTtcbiAgICAgICAgY29uc3QgZTogUHJvbWlzZTx1bmtub3duPiA9IHAudGhlbigoKSA9PlxuICAgICAgICAgIGV4ZWN1dGluZy5zcGxpY2UoZXhlY3V0aW5nLmluZGV4T2YoZSksIDEpXG4gICAgICAgICk7XG4gICAgICAgIGV4ZWN1dGluZy5wdXNoKGUpO1xuICAgICAgICBpZiAoZXhlY3V0aW5nLmxlbmd0aCA+PSBwb29sTGltaXQpIHtcbiAgICAgICAgICBhd2FpdCBQcm9taXNlLnJhY2UoZXhlY3V0aW5nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gV2FpdCB1bnRpbCBhbGwgb25nb2luZyBldmVudHMgaGF2ZSBwcm9jZXNzZWQsIHRoZW4gY2xvc2UgdGhlIHdyaXRlci5cbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGV4ZWN1dGluZyk7XG4gICAgICB3cml0ZXIuY2xvc2UoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKGV4ZWN1dGluZykpIHtcbiAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwicmVqZWN0ZWRcIikge1xuICAgICAgICAgIGVycm9ycy5wdXNoKHJlc3VsdC5yZWFzb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3cml0ZXIud3JpdGUoUHJvbWlzZS5yZWplY3QoXG4gICAgICAgIG5ldyBBZ2dyZWdhdGVFcnJvcihlcnJvcnMsIEVSUk9SX1dISUxFX01BUFBJTkdfTUVTU0FHRSksXG4gICAgICApKS5jYXRjaCgoKSA9PiB7fSk7XG4gICAgfVxuICB9KSgpO1xuICAvLyBGZWF0dXJlIHRlc3QgdW50aWwgYnJvd3NlciBjb3ZlcmFnZSBpcyBhZGVxdWF0ZVxuICByZXR1cm4gU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gcmVzLnJlYWRhYmxlICYmXG4gICAgICB0eXBlb2YgcmVzLnJlYWRhYmxlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9PT0gXCJmdW5jdGlvblwiXG4gICAgPyAocmVzLnJlYWRhYmxlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSBhcyAoKSA9PiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Uj4pKClcbiAgICA6IChhc3luYyBmdW5jdGlvbiogKCkge1xuICAgICAgY29uc3QgcmVhZGVyID0gcmVzLnJlYWRhYmxlLmdldFJlYWRlcigpO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY29uc3QgeyBkb25lLCB2YWx1ZSB9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgICAgaWYgKGRvbmUpIGJyZWFrO1xuICAgICAgICB5aWVsZCB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJlYWRlci5yZWxlYXNlTG9jaygpO1xuICAgIH0pKCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQywrREFBK0QsR0FDL0QsT0FBTyxNQUFNLDhCQUE4Qix1QkFBdUI7QUFFbEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQThCQyxHQUNELE9BQU8sU0FBUyxVQUNkLFNBQWlCLEVBQ2pCLEtBQXFDLEVBQ3JDLFVBQW1DO0VBRW5DLGlFQUFpRTtFQUNqRSxNQUFNLE1BQU0sSUFBSSxnQkFBK0I7SUFDN0MsTUFBTSxXQUNKLENBQWEsRUFDYixVQUErQztNQUUvQyxJQUFJO1FBQ0YsTUFBTSxJQUFJLE1BQU07UUFDaEIsV0FBVyxPQUFPLENBQUM7TUFDckIsRUFBRSxPQUFPLEdBQUc7UUFDVixJQUNFLGFBQWEsa0JBQ2IsRUFBRSxPQUFPLEtBQUssNkJBQ2Q7VUFDQSxXQUFXLEtBQUssQ0FBQztRQUNuQjtNQUNGO0lBQ0Y7RUFDRjtFQUNBLDJDQUEyQztFQUMzQyxDQUFDO0lBQ0MsTUFBTSxTQUFTLElBQUksUUFBUSxDQUFDLFNBQVM7SUFDckMsTUFBTSxZQUFxQyxFQUFFO0lBQzdDLElBQUk7TUFDRixXQUFXLE1BQU0sUUFBUSxNQUFPO1FBQzlCLE1BQU0sSUFBSSxRQUFRLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBTSxXQUFXO1FBQ2xELG9FQUFvRTtRQUNwRSxzRUFBc0U7UUFDdEUsa0VBQWtFO1FBQ2xFLHFFQUFxRTtRQUNyRSw0QkFBNEI7UUFDNUIsT0FBTyxLQUFLLENBQUM7UUFDYixNQUFNLElBQXNCLEVBQUUsSUFBSSxDQUFDLElBQ2pDLFVBQVUsTUFBTSxDQUFDLFVBQVUsT0FBTyxDQUFDLElBQUk7UUFFekMsVUFBVSxJQUFJLENBQUM7UUFDZixJQUFJLFVBQVUsTUFBTSxJQUFJLFdBQVc7VUFDakMsTUFBTSxRQUFRLElBQUksQ0FBQztRQUNyQjtNQUNGO01BQ0EsdUVBQXVFO01BQ3ZFLE1BQU0sUUFBUSxHQUFHLENBQUM7TUFDbEIsT0FBTyxLQUFLO0lBQ2QsRUFBRSxPQUFNO01BQ04sTUFBTSxTQUFTLEVBQUU7TUFDakIsS0FBSyxNQUFNLFVBQVUsQ0FBQSxNQUFNLFFBQVEsVUFBVSxDQUFDLFVBQVMsRUFBRztRQUN4RCxJQUFJLE9BQU8sTUFBTSxLQUFLLFlBQVk7VUFDaEMsT0FBTyxJQUFJLENBQUMsT0FBTyxNQUFNO1FBQzNCO01BQ0Y7TUFDQSxPQUFPLEtBQUssQ0FBQyxRQUFRLE1BQU0sQ0FDekIsSUFBSSxlQUFlLFFBQVEsK0JBQzFCLEtBQUssQ0FBQyxLQUFPO0lBQ2xCO0VBQ0YsQ0FBQztFQUNELGtEQUFrRDtFQUNsRCxPQUFPLE9BQU8sYUFBYSxJQUFJLElBQUksUUFBUSxJQUN2QyxPQUFPLElBQUksUUFBUSxDQUFDLE9BQU8sYUFBYSxDQUFDLEtBQUssYUFDOUMsQUFBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLGFBQWEsQ0FBQyxLQUNuQyxBQUFDO0lBQ0QsTUFBTSxTQUFTLElBQUksUUFBUSxDQUFDLFNBQVM7SUFDckMsTUFBTyxLQUFNO01BQ1gsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxNQUFNLE9BQU8sSUFBSTtNQUN6QyxJQUFJLE1BQU07TUFDVixNQUFNO0lBQ1I7SUFDQSxPQUFPLFdBQVc7RUFDcEI7QUFDSiJ9
// denoCacheMetadata=14344495055523905407,4600706462549014583