// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Convert the generator function into a {@linkcode TransformStream}.
 *
 * @typeparam I The type of the chunks in the source stream.
 * @typeparam O The type of the chunks in the transformed stream.
 * @param transformer A function to transform.
 * @param writableStrategy An object that optionally defines a queuing strategy for the stream.
 * @param readableStrategy An object that optionally defines a queuing strategy for the stream.
 * @returns A {@linkcode TransformStream} that transforms the source stream as defined by the provided transformer.
 *
 * @example Build a transform stream that multiplies each value by 100
 * ```ts
 * import { toTransformStream } from "@std/streams/to-transform-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from([0, 1, 2])
 *   .pipeThrough(toTransformStream(async function* (src) {
 *     for await (const chunk of src) {
 *       yield chunk * 100;
 *     }
 *   }));
 *
 * assertEquals(
 *   await Array.fromAsync(stream),
 *   [0, 100, 200],
 * );
 * ```
 *
 * @example JSON Lines
 * ```ts
 * import { TextLineStream } from "@std/streams/text-line-stream";
 * import { toTransformStream } from "@std/streams/to-transform-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from([
 *   '{"name": "Alice", "age": ',
 *   '30}\n{"name": "Bob", "age"',
 *   ": 25}\n",
 * ]);
 *
 * type Person = { name: string; age: number };
 *
 * // Split the stream by newline and parse each line as a JSON object
 * const jsonStream = stream.pipeThrough(new TextLineStream())
 *   .pipeThrough(toTransformStream(async function* (src) {
 *     for await (const chunk of src) {
 *       if (chunk.trim().length === 0) {
 *         continue;
 *       }
 *       yield JSON.parse(chunk) as Person;
 *     }
 *   }));
 *
 * assertEquals(
 *   await Array.fromAsync(jsonStream),
 *   [{ "name": "Alice", "age": 30 }, { "name": "Bob", "age": 25 }],
 * );
 * ```
 */ export function toTransformStream(transformer, writableStrategy, readableStrategy) {
  const { writable, readable } = new TransformStream(undefined, writableStrategy);
  const iterable = transformer(readable);
  const iterator = iterable[Symbol.asyncIterator]?.() ?? iterable[Symbol.iterator]?.();
  return {
    writable,
    readable: new ReadableStream({
      async pull (controller) {
        let result;
        try {
          result = await iterator.next();
        } catch (error) {
          // Propagate error to stream from iterator
          // If the stream status is "errored", it will be thrown, but ignore.
          await readable.cancel(error).catch(()=>{});
          controller.error(error);
          return;
        }
        if (result.done) {
          controller.close();
          return;
        }
        controller.enqueue(result.value);
      },
      async cancel (reason) {
        // Propagate cancellation to readable and iterator
        if (typeof iterator.throw === "function") {
          try {
            await iterator.throw(reason);
          } catch  {
          /* `iterator.throw()` always throws on site. We catch it. */ }
        }
        await readable.cancel(reason);
      }
    }, readableStrategy)
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L3RvX3RyYW5zZm9ybV9zdHJlYW0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBDb252ZXJ0IHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24gaW50byBhIHtAbGlua2NvZGUgVHJhbnNmb3JtU3RyZWFtfS5cbiAqXG4gKiBAdHlwZXBhcmFtIEkgVGhlIHR5cGUgb2YgdGhlIGNodW5rcyBpbiB0aGUgc291cmNlIHN0cmVhbS5cbiAqIEB0eXBlcGFyYW0gTyBUaGUgdHlwZSBvZiB0aGUgY2h1bmtzIGluIHRoZSB0cmFuc2Zvcm1lZCBzdHJlYW0uXG4gKiBAcGFyYW0gdHJhbnNmb3JtZXIgQSBmdW5jdGlvbiB0byB0cmFuc2Zvcm0uXG4gKiBAcGFyYW0gd3JpdGFibGVTdHJhdGVneSBBbiBvYmplY3QgdGhhdCBvcHRpb25hbGx5IGRlZmluZXMgYSBxdWV1aW5nIHN0cmF0ZWd5IGZvciB0aGUgc3RyZWFtLlxuICogQHBhcmFtIHJlYWRhYmxlU3RyYXRlZ3kgQW4gb2JqZWN0IHRoYXQgb3B0aW9uYWxseSBkZWZpbmVzIGEgcXVldWluZyBzdHJhdGVneSBmb3IgdGhlIHN0cmVhbS5cbiAqIEByZXR1cm5zIEEge0BsaW5rY29kZSBUcmFuc2Zvcm1TdHJlYW19IHRoYXQgdHJhbnNmb3JtcyB0aGUgc291cmNlIHN0cmVhbSBhcyBkZWZpbmVkIGJ5IHRoZSBwcm92aWRlZCB0cmFuc2Zvcm1lci5cbiAqXG4gKiBAZXhhbXBsZSBCdWlsZCBhIHRyYW5zZm9ybSBzdHJlYW0gdGhhdCBtdWx0aXBsaWVzIGVhY2ggdmFsdWUgYnkgMTAwXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgdG9UcmFuc2Zvcm1TdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL3RvLXRyYW5zZm9ybS1zdHJlYW1cIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgc3RyZWFtID0gUmVhZGFibGVTdHJlYW0uZnJvbShbMCwgMSwgMl0pXG4gKiAgIC5waXBlVGhyb3VnaCh0b1RyYW5zZm9ybVN0cmVhbShhc3luYyBmdW5jdGlvbiogKHNyYykge1xuICogICAgIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2Ygc3JjKSB7XG4gKiAgICAgICB5aWVsZCBjaHVuayAqIDEwMDtcbiAqICAgICB9XG4gKiAgIH0pKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGF3YWl0IEFycmF5LmZyb21Bc3luYyhzdHJlYW0pLFxuICogICBbMCwgMTAwLCAyMDBdLFxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIEpTT04gTGluZXNcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBUZXh0TGluZVN0cmVhbSB9IGZyb20gXCJAc3RkL3N0cmVhbXMvdGV4dC1saW5lLXN0cmVhbVwiO1xuICogaW1wb3J0IHsgdG9UcmFuc2Zvcm1TdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL3RvLXRyYW5zZm9ybS1zdHJlYW1cIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgc3RyZWFtID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXG4gKiAgICd7XCJuYW1lXCI6IFwiQWxpY2VcIiwgXCJhZ2VcIjogJyxcbiAqICAgJzMwfVxcbntcIm5hbWVcIjogXCJCb2JcIiwgXCJhZ2VcIicsXG4gKiAgIFwiOiAyNX1cXG5cIixcbiAqIF0pO1xuICpcbiAqIHR5cGUgUGVyc29uID0geyBuYW1lOiBzdHJpbmc7IGFnZTogbnVtYmVyIH07XG4gKlxuICogLy8gU3BsaXQgdGhlIHN0cmVhbSBieSBuZXdsaW5lIGFuZCBwYXJzZSBlYWNoIGxpbmUgYXMgYSBKU09OIG9iamVjdFxuICogY29uc3QganNvblN0cmVhbSA9IHN0cmVhbS5waXBlVGhyb3VnaChuZXcgVGV4dExpbmVTdHJlYW0oKSlcbiAqICAgLnBpcGVUaHJvdWdoKHRvVHJhbnNmb3JtU3RyZWFtKGFzeW5jIGZ1bmN0aW9uKiAoc3JjKSB7XG4gKiAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiBzcmMpIHtcbiAqICAgICAgIGlmIChjaHVuay50cmltKCkubGVuZ3RoID09PSAwKSB7XG4gKiAgICAgICAgIGNvbnRpbnVlO1xuICogICAgICAgfVxuICogICAgICAgeWllbGQgSlNPTi5wYXJzZShjaHVuaykgYXMgUGVyc29uO1xuICogICAgIH1cbiAqICAgfSkpO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgYXdhaXQgQXJyYXkuZnJvbUFzeW5jKGpzb25TdHJlYW0pLFxuICogICBbeyBcIm5hbWVcIjogXCJBbGljZVwiLCBcImFnZVwiOiAzMCB9LCB7IFwibmFtZVwiOiBcIkJvYlwiLCBcImFnZVwiOiAyNSB9XSxcbiAqICk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvVHJhbnNmb3JtU3RyZWFtPEksIE8+KFxuICB0cmFuc2Zvcm1lcjogKHNyYzogUmVhZGFibGVTdHJlYW08ST4pID0+IEl0ZXJhYmxlPE8+IHwgQXN5bmNJdGVyYWJsZTxPPixcbiAgd3JpdGFibGVTdHJhdGVneT86IFF1ZXVpbmdTdHJhdGVneTxJPixcbiAgcmVhZGFibGVTdHJhdGVneT86IFF1ZXVpbmdTdHJhdGVneTxPPixcbik6IFRyYW5zZm9ybVN0cmVhbTxJLCBPPiB7XG4gIGNvbnN0IHtcbiAgICB3cml0YWJsZSxcbiAgICByZWFkYWJsZSxcbiAgfSA9IG5ldyBUcmFuc2Zvcm1TdHJlYW08SSwgST4odW5kZWZpbmVkLCB3cml0YWJsZVN0cmF0ZWd5KTtcblxuICBjb25zdCBpdGVyYWJsZSA9IHRyYW5zZm9ybWVyKHJlYWRhYmxlKTtcbiAgY29uc3QgaXRlcmF0b3I6IEl0ZXJhdG9yPE8+IHwgQXN5bmNJdGVyYXRvcjxPPiA9XG4gICAgKGl0ZXJhYmxlIGFzIEFzeW5jSXRlcmFibGU8Tz4pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXT8uKCkgPz9cbiAgICAgIChpdGVyYWJsZSBhcyBJdGVyYWJsZTxPPilbU3ltYm9sLml0ZXJhdG9yXT8uKCk7XG4gIHJldHVybiB7XG4gICAgd3JpdGFibGUsXG4gICAgcmVhZGFibGU6IG5ldyBSZWFkYWJsZVN0cmVhbTxPPih7XG4gICAgICBhc3luYyBwdWxsKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgbGV0IHJlc3VsdDogSXRlcmF0b3JSZXN1bHQ8Tz47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzdWx0ID0gYXdhaXQgaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIC8vIFByb3BhZ2F0ZSBlcnJvciB0byBzdHJlYW0gZnJvbSBpdGVyYXRvclxuICAgICAgICAgIC8vIElmIHRoZSBzdHJlYW0gc3RhdHVzIGlzIFwiZXJyb3JlZFwiLCBpdCB3aWxsIGJlIHRocm93biwgYnV0IGlnbm9yZS5cbiAgICAgICAgICBhd2FpdCByZWFkYWJsZS5jYW5jZWwoZXJyb3IpLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgICAgICBjb250cm9sbGVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgY29udHJvbGxlci5jbG9zZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb250cm9sbGVyLmVucXVldWUocmVzdWx0LnZhbHVlKTtcbiAgICAgIH0sXG4gICAgICBhc3luYyBjYW5jZWwocmVhc29uKSB7XG4gICAgICAgIC8vIFByb3BhZ2F0ZSBjYW5jZWxsYXRpb24gdG8gcmVhZGFibGUgYW5kIGl0ZXJhdG9yXG4gICAgICAgIGlmICh0eXBlb2YgaXRlcmF0b3IudGhyb3cgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBpdGVyYXRvci50aHJvdyhyZWFzb24pO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLyogYGl0ZXJhdG9yLnRocm93KClgIGFsd2F5cyB0aHJvd3Mgb24gc2l0ZS4gV2UgY2F0Y2ggaXQuICovXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHJlYWRhYmxlLmNhbmNlbChyZWFzb24pO1xuICAgICAgfSxcbiAgICB9LCByZWFkYWJsZVN0cmF0ZWd5KSxcbiAgfTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMERDLEdBQ0QsT0FBTyxTQUFTLGtCQUNkLFdBQXVFLEVBQ3ZFLGdCQUFxQyxFQUNyQyxnQkFBcUM7RUFFckMsTUFBTSxFQUNKLFFBQVEsRUFDUixRQUFRLEVBQ1QsR0FBRyxJQUFJLGdCQUFzQixXQUFXO0VBRXpDLE1BQU0sV0FBVyxZQUFZO0VBQzdCLE1BQU0sV0FDSixBQUFDLFFBQTZCLENBQUMsT0FBTyxhQUFhLENBQUMsUUFDbEQsQUFBQyxRQUF3QixDQUFDLE9BQU8sUUFBUSxDQUFDO0VBQzlDLE9BQU87SUFDTDtJQUNBLFVBQVUsSUFBSSxlQUFrQjtNQUM5QixNQUFNLE1BQUssVUFBVTtRQUNuQixJQUFJO1FBQ0osSUFBSTtVQUNGLFNBQVMsTUFBTSxTQUFTLElBQUk7UUFDOUIsRUFBRSxPQUFPLE9BQU87VUFDZCwwQ0FBMEM7VUFDMUMsb0VBQW9FO1VBQ3BFLE1BQU0sU0FBUyxNQUFNLENBQUMsT0FBTyxLQUFLLENBQUMsS0FBTztVQUMxQyxXQUFXLEtBQUssQ0FBQztVQUNqQjtRQUNGO1FBQ0EsSUFBSSxPQUFPLElBQUksRUFBRTtVQUNmLFdBQVcsS0FBSztVQUNoQjtRQUNGO1FBQ0EsV0FBVyxPQUFPLENBQUMsT0FBTyxLQUFLO01BQ2pDO01BQ0EsTUFBTSxRQUFPLE1BQU07UUFDakIsa0RBQWtEO1FBQ2xELElBQUksT0FBTyxTQUFTLEtBQUssS0FBSyxZQUFZO1VBQ3hDLElBQUk7WUFDRixNQUFNLFNBQVMsS0FBSyxDQUFDO1VBQ3ZCLEVBQUUsT0FBTTtVQUNOLDBEQUEwRCxHQUM1RDtRQUNGO1FBQ0EsTUFBTSxTQUFTLE1BQU0sQ0FBQztNQUN4QjtJQUNGLEdBQUc7RUFDTDtBQUNGIn0=
// denoCacheMetadata=10969340463410442382,7628304096248641829