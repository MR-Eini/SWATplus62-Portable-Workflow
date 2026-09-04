// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { createAbortError } from "./_util.ts";
export function abortable(p, signal) {
  if (p instanceof Promise) {
    return abortablePromise(p, signal);
  } else {
    return abortableAsyncIterable(p, signal);
  }
}
/**
 * Make a {@linkcode Promise} abortable with the given signal.
 *
 * @typeParam T The type of the provided and returned promise.
 * @param p The promise to make abortable.
 * @param signal The signal to abort the promise with.
 * @returns A promise that can be aborted.
 *
 * @example Usage
 * ```ts no-eval
 * import { abortablePromise } from "@std/async/abortable";
 *
 * const request = fetch("https://example.com");
 *
 * const c = new AbortController();
 * setTimeout(() => c.abort(), 100);
 *
 * const p = abortablePromise(request, c.signal);
 *
 * // The below throws if the request didn't resolve in 100ms
 * await p;
 * ```
 */ export function abortablePromise(p, signal) {
  if (signal.aborted) {
    return Promise.reject(createAbortError(signal.reason));
  }
  const { promise, reject } = Promise.withResolvers();
  const abort = ()=>reject(createAbortError(signal.reason));
  signal.addEventListener("abort", abort, {
    once: true
  });
  return Promise.race([
    promise,
    p
  ]).finally(()=>{
    signal.removeEventListener("abort", abort);
  });
}
/**
 * Make an {@linkcode AsyncIterable} abortable with the given signal.
 *
 * @typeParam T The type of the provided and returned async iterable.
 * @param p The async iterable to make abortable.
 * @param signal The signal to abort the promise with.
 * @returns An async iterable that can be aborted.
 *
 * @example Usage
 * ```ts no-eval
 * import {
 *   abortableAsyncIterable,
 *   delay,
 * } from "@std/async";
 *
 * const p = async function* () {
 *   yield "Hello";
 *   await delay(1000);
 *   yield "World";
 * };
 * const c = new AbortController();
 * setTimeout(() => c.abort(), 100);
 *
 * // Below throws `DOMException` after 100 ms
 * // and items become `["Hello"]`
 * const items: string[] = [];
 * for await (const item of abortableAsyncIterable(p(), c.signal)) {
 *   items.push(item);
 * }
 * ```
 */ export async function* abortableAsyncIterable(p, signal) {
  if (signal.aborted) {
    throw createAbortError(signal.reason);
  }
  const { promise, reject } = Promise.withResolvers();
  const abort = ()=>reject(createAbortError(signal.reason));
  signal.addEventListener("abort", abort, {
    once: true
  });
  const it = p[Symbol.asyncIterator]();
  while(true){
    const race = Promise.race([
      promise,
      it.next()
    ]);
    race.catch(()=>{
      signal.removeEventListener("abort", abort);
    });
    const { done, value } = await race;
    if (done) {
      signal.removeEventListener("abort", abort);
      return;
    }
    yield value;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXN5bmMvMC4yMjQuMi9hYm9ydGFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgY3JlYXRlQWJvcnRFcnJvciB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5cbi8qKlxuICogTWFrZSBhIHtAbGlua2NvZGUgUHJvbWlzZX0gYWJvcnRhYmxlIHdpdGggdGhlIGdpdmVuIHNpZ25hbC5cbiAqXG4gKiBAdHlwZVBhcmFtIFQgVGhlIHR5cGUgb2YgdGhlIHByb3ZpZGVkIGFuZCByZXR1cm5lZCBwcm9taXNlLlxuICogQHBhcmFtIHAgVGhlIHByb21pc2UgdG8gbWFrZSBhYm9ydGFibGUuXG4gKiBAcGFyYW0gc2lnbmFsIFRoZSBzaWduYWwgdG8gYWJvcnQgdGhlIHByb21pc2Ugd2l0aC5cbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IGNhbiBiZSBhYm9ydGVkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQge1xuICogICBhYm9ydGFibGUsXG4gKiAgIGRlbGF5LFxuICogfSBmcm9tIFwiQHN0ZC9hc3luY1wiO1xuICpcbiAqIGNvbnN0IHAgPSBkZWxheSgxMDAwKTtcbiAqIGNvbnN0IGMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gKiBzZXRUaW1lb3V0KCgpID0+IGMuYWJvcnQoKSwgMTAwKTtcbiAqXG4gKiAvLyBCZWxvdyB0aHJvd3MgYERPTUV4Y2VwdGlvbmAgYWZ0ZXIgMTAwIG1zXG4gKiBhd2FpdCBhYm9ydGFibGUocCwgYy5zaWduYWwpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhYm9ydGFibGU8VD4ocDogUHJvbWlzZTxUPiwgc2lnbmFsOiBBYm9ydFNpZ25hbCk6IFByb21pc2U8VD47XG4vKipcbiAqIE1ha2UgYW4ge0BsaW5rY29kZSBBc3luY0l0ZXJhYmxlfSBhYm9ydGFibGUgd2l0aCB0aGUgZ2l2ZW4gc2lnbmFsLlxuICpcbiAqIEB0eXBlUGFyYW0gVCBUaGUgdHlwZSBvZiB0aGUgcHJvdmlkZWQgYW5kIHJldHVybmVkIGFzeW5jIGl0ZXJhYmxlLlxuICogQHBhcmFtIHAgVGhlIGFzeW5jIGl0ZXJhYmxlIHRvIG1ha2UgYWJvcnRhYmxlLlxuICogQHBhcmFtIHNpZ25hbCBUaGUgc2lnbmFsIHRvIGFib3J0IHRoZSBwcm9taXNlIHdpdGguXG4gKiBAcmV0dXJucyBBbiBhc3luYyBpdGVyYWJsZSB0aGF0IGNhbiBiZSBhYm9ydGVkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQge1xuICogICBhYm9ydGFibGUsXG4gKiAgIGRlbGF5LFxuICogfSBmcm9tIFwiQHN0ZC9hc3luY1wiO1xuICpcbiAqIGNvbnN0IHAgPSBhc3luYyBmdW5jdGlvbiogKCkge1xuICogICB5aWVsZCBcIkhlbGxvXCI7XG4gKiAgIGF3YWl0IGRlbGF5KDEwMDApO1xuICogICB5aWVsZCBcIldvcmxkXCI7XG4gKiB9O1xuICogY29uc3QgYyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAqIHNldFRpbWVvdXQoKCkgPT4gYy5hYm9ydCgpLCAxMDApO1xuICpcbiAqIC8vIEJlbG93IHRocm93cyBgRE9NRXhjZXB0aW9uYCBhZnRlciAxMDAgbXNcbiAqIC8vIGFuZCBpdGVtcyBiZWNvbWUgYFtcIkhlbGxvXCJdYFxuICogY29uc3QgaXRlbXM6IHN0cmluZ1tdID0gW107XG4gKiBmb3IgYXdhaXQgKGNvbnN0IGl0ZW0gb2YgYWJvcnRhYmxlKHAoKSwgYy5zaWduYWwpKSB7XG4gKiAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFib3J0YWJsZTxUPihcbiAgcDogQXN5bmNJdGVyYWJsZTxUPixcbiAgc2lnbmFsOiBBYm9ydFNpZ25hbCxcbik6IEFzeW5jR2VuZXJhdG9yPFQ+O1xuZXhwb3J0IGZ1bmN0aW9uIGFib3J0YWJsZTxUPihcbiAgcDogUHJvbWlzZTxUPiB8IEFzeW5jSXRlcmFibGU8VD4sXG4gIHNpZ25hbDogQWJvcnRTaWduYWwsXG4pOiBQcm9taXNlPFQ+IHwgQXN5bmNJdGVyYWJsZTxUPiB7XG4gIGlmIChwIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgIHJldHVybiBhYm9ydGFibGVQcm9taXNlKHAsIHNpZ25hbCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGFib3J0YWJsZUFzeW5jSXRlcmFibGUocCwgc2lnbmFsKTtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2UgYSB7QGxpbmtjb2RlIFByb21pc2V9IGFib3J0YWJsZSB3aXRoIHRoZSBnaXZlbiBzaWduYWwuXG4gKlxuICogQHR5cGVQYXJhbSBUIFRoZSB0eXBlIG9mIHRoZSBwcm92aWRlZCBhbmQgcmV0dXJuZWQgcHJvbWlzZS5cbiAqIEBwYXJhbSBwIFRoZSBwcm9taXNlIHRvIG1ha2UgYWJvcnRhYmxlLlxuICogQHBhcmFtIHNpZ25hbCBUaGUgc2lnbmFsIHRvIGFib3J0IHRoZSBwcm9taXNlIHdpdGguXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCBjYW4gYmUgYWJvcnRlZC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgYWJvcnRhYmxlUHJvbWlzZSB9IGZyb20gXCJAc3RkL2FzeW5jL2Fib3J0YWJsZVwiO1xuICpcbiAqIGNvbnN0IHJlcXVlc3QgPSBmZXRjaChcImh0dHBzOi8vZXhhbXBsZS5jb21cIik7XG4gKlxuICogY29uc3QgYyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAqIHNldFRpbWVvdXQoKCkgPT4gYy5hYm9ydCgpLCAxMDApO1xuICpcbiAqIGNvbnN0IHAgPSBhYm9ydGFibGVQcm9taXNlKHJlcXVlc3QsIGMuc2lnbmFsKTtcbiAqXG4gKiAvLyBUaGUgYmVsb3cgdGhyb3dzIGlmIHRoZSByZXF1ZXN0IGRpZG4ndCByZXNvbHZlIGluIDEwMG1zXG4gKiBhd2FpdCBwO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhYm9ydGFibGVQcm9taXNlPFQ+KFxuICBwOiBQcm9taXNlPFQ+LFxuICBzaWduYWw6IEFib3J0U2lnbmFsLFxuKTogUHJvbWlzZTxUPiB7XG4gIGlmIChzaWduYWwuYWJvcnRlZCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChjcmVhdGVBYm9ydEVycm9yKHNpZ25hbC5yZWFzb24pKTtcbiAgfVxuICBjb25zdCB7IHByb21pc2UsIHJlamVjdCB9ID0gUHJvbWlzZS53aXRoUmVzb2x2ZXJzPG5ldmVyPigpO1xuICBjb25zdCBhYm9ydCA9ICgpID0+IHJlamVjdChjcmVhdGVBYm9ydEVycm9yKHNpZ25hbC5yZWFzb24pKTtcbiAgc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBhYm9ydCwgeyBvbmNlOiB0cnVlIH0pO1xuICByZXR1cm4gUHJvbWlzZS5yYWNlKFtwcm9taXNlLCBwXSkuZmluYWxseSgoKSA9PiB7XG4gICAgc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBhYm9ydCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIE1ha2UgYW4ge0BsaW5rY29kZSBBc3luY0l0ZXJhYmxlfSBhYm9ydGFibGUgd2l0aCB0aGUgZ2l2ZW4gc2lnbmFsLlxuICpcbiAqIEB0eXBlUGFyYW0gVCBUaGUgdHlwZSBvZiB0aGUgcHJvdmlkZWQgYW5kIHJldHVybmVkIGFzeW5jIGl0ZXJhYmxlLlxuICogQHBhcmFtIHAgVGhlIGFzeW5jIGl0ZXJhYmxlIHRvIG1ha2UgYWJvcnRhYmxlLlxuICogQHBhcmFtIHNpZ25hbCBUaGUgc2lnbmFsIHRvIGFib3J0IHRoZSBwcm9taXNlIHdpdGguXG4gKiBAcmV0dXJucyBBbiBhc3luYyBpdGVyYWJsZSB0aGF0IGNhbiBiZSBhYm9ydGVkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQge1xuICogICBhYm9ydGFibGVBc3luY0l0ZXJhYmxlLFxuICogICBkZWxheSxcbiAqIH0gZnJvbSBcIkBzdGQvYXN5bmNcIjtcbiAqXG4gKiBjb25zdCBwID0gYXN5bmMgZnVuY3Rpb24qICgpIHtcbiAqICAgeWllbGQgXCJIZWxsb1wiO1xuICogICBhd2FpdCBkZWxheSgxMDAwKTtcbiAqICAgeWllbGQgXCJXb3JsZFwiO1xuICogfTtcbiAqIGNvbnN0IGMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gKiBzZXRUaW1lb3V0KCgpID0+IGMuYWJvcnQoKSwgMTAwKTtcbiAqXG4gKiAvLyBCZWxvdyB0aHJvd3MgYERPTUV4Y2VwdGlvbmAgYWZ0ZXIgMTAwIG1zXG4gKiAvLyBhbmQgaXRlbXMgYmVjb21lIGBbXCJIZWxsb1wiXWBcbiAqIGNvbnN0IGl0ZW1zOiBzdHJpbmdbXSA9IFtdO1xuICogZm9yIGF3YWl0IChjb25zdCBpdGVtIG9mIGFib3J0YWJsZUFzeW5jSXRlcmFibGUocCgpLCBjLnNpZ25hbCkpIHtcbiAqICAgaXRlbXMucHVzaChpdGVtKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24qIGFib3J0YWJsZUFzeW5jSXRlcmFibGU8VD4oXG4gIHA6IEFzeW5jSXRlcmFibGU8VD4sXG4gIHNpZ25hbDogQWJvcnRTaWduYWwsXG4pOiBBc3luY0dlbmVyYXRvcjxUPiB7XG4gIGlmIChzaWduYWwuYWJvcnRlZCkge1xuICAgIHRocm93IGNyZWF0ZUFib3J0RXJyb3Ioc2lnbmFsLnJlYXNvbik7XG4gIH1cbiAgY29uc3QgeyBwcm9taXNlLCByZWplY3QgfSA9IFByb21pc2Uud2l0aFJlc29sdmVyczxuZXZlcj4oKTtcbiAgY29uc3QgYWJvcnQgPSAoKSA9PiByZWplY3QoY3JlYXRlQWJvcnRFcnJvcihzaWduYWwucmVhc29uKSk7XG4gIHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgYWJvcnQsIHsgb25jZTogdHJ1ZSB9KTtcblxuICBjb25zdCBpdCA9IHBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgY29uc3QgcmFjZSA9IFByb21pc2UucmFjZShbcHJvbWlzZSwgaXQubmV4dCgpXSk7XG4gICAgcmFjZS5jYXRjaCgoKSA9PiB7XG4gICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0KTtcbiAgICB9KTtcbiAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByYWNlO1xuICAgIGlmIChkb25lKSB7XG4gICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgeWllbGQgdmFsdWU7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsZ0JBQWdCLFFBQVEsYUFBYTtBQTZEOUMsT0FBTyxTQUFTLFVBQ2QsQ0FBZ0MsRUFDaEMsTUFBbUI7RUFFbkIsSUFBSSxhQUFhLFNBQVM7SUFDeEIsT0FBTyxpQkFBaUIsR0FBRztFQUM3QixPQUFPO0lBQ0wsT0FBTyx1QkFBdUIsR0FBRztFQUNuQztBQUNGO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FzQkMsR0FDRCxPQUFPLFNBQVMsaUJBQ2QsQ0FBYSxFQUNiLE1BQW1CO0VBRW5CLElBQUksT0FBTyxPQUFPLEVBQUU7SUFDbEIsT0FBTyxRQUFRLE1BQU0sQ0FBQyxpQkFBaUIsT0FBTyxNQUFNO0VBQ3REO0VBQ0EsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxRQUFRLGFBQWE7RUFDakQsTUFBTSxRQUFRLElBQU0sT0FBTyxpQkFBaUIsT0FBTyxNQUFNO0VBQ3pELE9BQU8sZ0JBQWdCLENBQUMsU0FBUyxPQUFPO0lBQUUsTUFBTTtFQUFLO0VBQ3JELE9BQU8sUUFBUSxJQUFJLENBQUM7SUFBQztJQUFTO0dBQUUsRUFBRSxPQUFPLENBQUM7SUFDeEMsT0FBTyxtQkFBbUIsQ0FBQyxTQUFTO0VBQ3RDO0FBQ0Y7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBOEJDLEdBQ0QsT0FBTyxnQkFBZ0IsdUJBQ3JCLENBQW1CLEVBQ25CLE1BQW1CO0VBRW5CLElBQUksT0FBTyxPQUFPLEVBQUU7SUFDbEIsTUFBTSxpQkFBaUIsT0FBTyxNQUFNO0VBQ3RDO0VBQ0EsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxRQUFRLGFBQWE7RUFDakQsTUFBTSxRQUFRLElBQU0sT0FBTyxpQkFBaUIsT0FBTyxNQUFNO0VBQ3pELE9BQU8sZ0JBQWdCLENBQUMsU0FBUyxPQUFPO0lBQUUsTUFBTTtFQUFLO0VBRXJELE1BQU0sS0FBSyxDQUFDLENBQUMsT0FBTyxhQUFhLENBQUM7RUFDbEMsTUFBTyxLQUFNO0lBQ1gsTUFBTSxPQUFPLFFBQVEsSUFBSSxDQUFDO01BQUM7TUFBUyxHQUFHLElBQUk7S0FBRztJQUM5QyxLQUFLLEtBQUssQ0FBQztNQUNULE9BQU8sbUJBQW1CLENBQUMsU0FBUztJQUN0QztJQUNBLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTTtJQUM5QixJQUFJLE1BQU07TUFDUixPQUFPLG1CQUFtQixDQUFDLFNBQVM7TUFDcEM7SUFDRjtJQUNBLE1BQU07RUFDUjtBQUNGIn0=
// denoCacheMetadata=16246851254704765765,7275751289923051505