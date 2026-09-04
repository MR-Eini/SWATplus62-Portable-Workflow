// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * A debounced function that will be delayed by a given `wait`
 * time in milliseconds. If the method is called again before
 * the timeout expires, the previous call will be aborted.
 */ /**
 * Creates a debounced function that delays the given `func`
 * by a given `wait` time in milliseconds. If the method is called
 * again before the timeout expires, the previous call will be
 * aborted.
 *
 * @example Usage
 * ```ts no-eval
 * import { debounce } from "@std/async/debounce";
 *
 * await Array.fromAsync(
 *   Deno.watchFs('./'),
 *   debounce((event) => {
 *     console.log('[%s] %s', event.kind, event.paths[0]);
 *   }, 200),
 * );
 * // wait 200ms ...
 * // output: Function debounced after 200ms with baz
 * ```
 *
 * @typeParam T The arguments of the provided function.
 * @param fn The function to debounce.
 * @param wait The time in milliseconds to delay the function.
 * @returns The debounced function.
 */ // deno-lint-ignore no-explicit-any
export function debounce(fn, wait) {
  let timeout = null;
  let flush = null;
  const debounced = (...args)=>{
    debounced.clear();
    flush = ()=>{
      debounced.clear();
      fn.call(debounced, ...args);
    };
    timeout = setTimeout(flush, wait);
  };
  debounced.clear = ()=>{
    if (typeof timeout === "number") {
      clearTimeout(timeout);
      timeout = null;
      flush = null;
    }
  };
  debounced.flush = ()=>{
    flush?.();
  };
  Object.defineProperty(debounced, "pending", {
    get: ()=>typeof timeout === "number"
  });
  return debounced;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXN5bmMvMC4yMjQuMi9kZWJvdW5jZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIEEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBkZWxheWVkIGJ5IGEgZ2l2ZW4gYHdhaXRgXG4gKiB0aW1lIGluIG1pbGxpc2Vjb25kcy4gSWYgdGhlIG1ldGhvZCBpcyBjYWxsZWQgYWdhaW4gYmVmb3JlXG4gKiB0aGUgdGltZW91dCBleHBpcmVzLCB0aGUgcHJldmlvdXMgY2FsbCB3aWxsIGJlIGFib3J0ZWQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVib3VuY2VkRnVuY3Rpb248VCBleHRlbmRzIEFycmF5PHVua25vd24+PiB7XG4gICguLi5hcmdzOiBUKTogdm9pZDtcbiAgLyoqIENsZWFycyB0aGUgZGVib3VuY2UgdGltZW91dCBhbmQgb21pdHMgY2FsbGluZyB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uLiAqL1xuICBjbGVhcigpOiB2b2lkO1xuICAvKiogQ2xlYXJzIHRoZSBkZWJvdW5jZSB0aW1lb3V0IGFuZCBjYWxscyB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIGltbWVkaWF0ZWx5LiAqL1xuICBmbHVzaCgpOiB2b2lkO1xuICAvKiogUmV0dXJucyBhIGJvb2xlYW4gd2hldGhlciBhIGRlYm91bmNlIGNhbGwgaXMgcGVuZGluZyBvciBub3QuICovXG4gIHJlYWRvbmx5IHBlbmRpbmc6IGJvb2xlYW47XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlYm91bmNlZCBmdW5jdGlvbiB0aGF0IGRlbGF5cyB0aGUgZ2l2ZW4gYGZ1bmNgXG4gKiBieSBhIGdpdmVuIGB3YWl0YCB0aW1lIGluIG1pbGxpc2Vjb25kcy4gSWYgdGhlIG1ldGhvZCBpcyBjYWxsZWRcbiAqIGFnYWluIGJlZm9yZSB0aGUgdGltZW91dCBleHBpcmVzLCB0aGUgcHJldmlvdXMgY2FsbCB3aWxsIGJlXG4gKiBhYm9ydGVkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQgeyBkZWJvdW5jZSB9IGZyb20gXCJAc3RkL2FzeW5jL2RlYm91bmNlXCI7XG4gKlxuICogYXdhaXQgQXJyYXkuZnJvbUFzeW5jKFxuICogICBEZW5vLndhdGNoRnMoJy4vJyksXG4gKiAgIGRlYm91bmNlKChldmVudCkgPT4ge1xuICogICAgIGNvbnNvbGUubG9nKCdbJXNdICVzJywgZXZlbnQua2luZCwgZXZlbnQucGF0aHNbMF0pO1xuICogICB9LCAyMDApLFxuICogKTtcbiAqIC8vIHdhaXQgMjAwbXMgLi4uXG4gKiAvLyBvdXRwdXQ6IEZ1bmN0aW9uIGRlYm91bmNlZCBhZnRlciAyMDBtcyB3aXRoIGJhelxuICogYGBgXG4gKlxuICogQHR5cGVQYXJhbSBUIFRoZSBhcmd1bWVudHMgb2YgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uLlxuICogQHBhcmFtIGZuIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB3YWl0IFRoZSB0aW1lIGluIG1pbGxpc2Vjb25kcyB0byBkZWxheSB0aGUgZnVuY3Rpb24uXG4gKiBAcmV0dXJucyBUaGUgZGVib3VuY2VkIGZ1bmN0aW9uLlxuICovXG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuZXhwb3J0IGZ1bmN0aW9uIGRlYm91bmNlPFQgZXh0ZW5kcyBBcnJheTxhbnk+PihcbiAgZm46ICh0aGlzOiBEZWJvdW5jZWRGdW5jdGlvbjxUPiwgLi4uYXJnczogVCkgPT4gdm9pZCxcbiAgd2FpdDogbnVtYmVyLFxuKTogRGVib3VuY2VkRnVuY3Rpb248VD4ge1xuICBsZXQgdGltZW91dDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gIGxldCBmbHVzaDogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3QgZGVib3VuY2VkOiBEZWJvdW5jZWRGdW5jdGlvbjxUPiA9ICgoLi4uYXJnczogVCkgPT4ge1xuICAgIGRlYm91bmNlZC5jbGVhcigpO1xuICAgIGZsdXNoID0gKCkgPT4ge1xuICAgICAgZGVib3VuY2VkLmNsZWFyKCk7XG4gICAgICBmbi5jYWxsKGRlYm91bmNlZCwgLi4uYXJncyk7XG4gICAgfTtcbiAgICB0aW1lb3V0ID0gc2V0VGltZW91dChmbHVzaCwgd2FpdCk7XG4gIH0pIGFzIERlYm91bmNlZEZ1bmN0aW9uPFQ+O1xuXG4gIGRlYm91bmNlZC5jbGVhciA9ICgpID0+IHtcbiAgICBpZiAodHlwZW9mIHRpbWVvdXQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgZmx1c2ggPSBudWxsO1xuICAgIH1cbiAgfTtcblxuICBkZWJvdW5jZWQuZmx1c2ggPSAoKSA9PiB7XG4gICAgZmx1c2g/LigpO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkZWJvdW5jZWQsIFwicGVuZGluZ1wiLCB7XG4gICAgZ2V0OiAoKSA9PiB0eXBlb2YgdGltZW91dCA9PT0gXCJudW1iZXJcIixcbiAgfSk7XG5cbiAgcmV0dXJuIGRlYm91bmNlZDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7O0NBSUMsR0FXRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0JDLEdBQ0QsbUNBQW1DO0FBQ25DLE9BQU8sU0FBUyxTQUNkLEVBQW9ELEVBQ3BELElBQVk7RUFFWixJQUFJLFVBQXlCO0VBQzdCLElBQUksUUFBNkI7RUFFakMsTUFBTSxZQUFtQyxDQUFDLEdBQUc7SUFDM0MsVUFBVSxLQUFLO0lBQ2YsUUFBUTtNQUNOLFVBQVUsS0FBSztNQUNmLEdBQUcsSUFBSSxDQUFDLGNBQWM7SUFDeEI7SUFDQSxVQUFVLFdBQVcsT0FBTztFQUM5QjtFQUVBLFVBQVUsS0FBSyxHQUFHO0lBQ2hCLElBQUksT0FBTyxZQUFZLFVBQVU7TUFDL0IsYUFBYTtNQUNiLFVBQVU7TUFDVixRQUFRO0lBQ1Y7RUFDRjtFQUVBLFVBQVUsS0FBSyxHQUFHO0lBQ2hCO0VBQ0Y7RUFFQSxPQUFPLGNBQWMsQ0FBQyxXQUFXLFdBQVc7SUFDMUMsS0FBSyxJQUFNLE9BQU8sWUFBWTtFQUNoQztFQUVBLE9BQU87QUFDVCJ9
// denoCacheMetadata=3057091546500163184,10360685571838768217