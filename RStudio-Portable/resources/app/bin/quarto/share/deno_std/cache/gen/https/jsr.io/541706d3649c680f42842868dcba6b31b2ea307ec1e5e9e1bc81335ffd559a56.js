// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Options for {@linkcode delay}. */ /**
 * Resolve a {@linkcode Promise} after a given amount of milliseconds.
 *
 * @throws {DOMException} If the optional signal is aborted before the delay
 * duration, and `signal.reason` is undefined.
 * @param ms Duration in milliseconds for how long the delay should last.
 * @param options Additional options.
 *
 * @example Basic usage
 * ```ts no-assert
 * import { delay } from "@std/async/delay";
 *
 * // ...
 * const delayedPromise = delay(100);
 * const result = await delayedPromise;
 * // ...
 * ```
 *
 * @example Disable persistence
 *
 * Setting `persistent` to `false` will allow the process to continue to run as
 * long as the timer exists.
 *
 * ```ts no-assert
 * import { delay } from "@std/async/delay";
 *
 * // ...
 * await delay(100, { persistent: false });
 * // ...
 * ```
 */ export function delay(ms, options = {}) {
  const { signal, persistent = true } = options;
  if (signal?.aborted) return Promise.reject(signal.reason);
  return new Promise((resolve, reject)=>{
    const abort = ()=>{
      clearTimeout(i);
      reject(signal?.reason);
    };
    const done = ()=>{
      signal?.removeEventListener("abort", abort);
      resolve();
    };
    const i = setTimeout(done, ms);
    signal?.addEventListener("abort", abort, {
      once: true
    });
    if (persistent === false) {
      try {
        // @ts-ignore For browser compatibility
        Deno.unrefTimer(i);
      } catch (error) {
        if (!(error instanceof ReferenceError)) {
          throw error;
        }
        console.error("`persistent` option is only available in Deno");
      }
    }
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXN5bmMvMS4wLjUvZGVsYXkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqIE9wdGlvbnMgZm9yIHtAbGlua2NvZGUgZGVsYXl9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZWxheU9wdGlvbnMge1xuICAvKiogU2lnbmFsIHVzZWQgdG8gYWJvcnQgdGhlIGRlbGF5LiAqL1xuICBzaWduYWw/OiBBYm9ydFNpZ25hbDtcbiAgLyoqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBwcm9jZXNzIHNob3VsZCBjb250aW51ZSB0byBydW4gYXMgbG9uZyBhcyB0aGUgdGltZXIgZXhpc3RzLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7dHJ1ZX1cbiAgICovXG4gIHBlcnNpc3RlbnQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFJlc29sdmUgYSB7QGxpbmtjb2RlIFByb21pc2V9IGFmdGVyIGEgZ2l2ZW4gYW1vdW50IG9mIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAdGhyb3dzIHtET01FeGNlcHRpb259IElmIHRoZSBvcHRpb25hbCBzaWduYWwgaXMgYWJvcnRlZCBiZWZvcmUgdGhlIGRlbGF5XG4gKiBkdXJhdGlvbiwgYW5kIGBzaWduYWwucmVhc29uYCBpcyB1bmRlZmluZWQuXG4gKiBAcGFyYW0gbXMgRHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIGZvciBob3cgbG9uZyB0aGUgZGVsYXkgc2hvdWxkIGxhc3QuXG4gKiBAcGFyYW0gb3B0aW9ucyBBZGRpdGlvbmFsIG9wdGlvbnMuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgZGVsYXkgfSBmcm9tIFwiQHN0ZC9hc3luYy9kZWxheVwiO1xuICpcbiAqIC8vIC4uLlxuICogY29uc3QgZGVsYXllZFByb21pc2UgPSBkZWxheSgxMDApO1xuICogY29uc3QgcmVzdWx0ID0gYXdhaXQgZGVsYXllZFByb21pc2U7XG4gKiAvLyAuLi5cbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIERpc2FibGUgcGVyc2lzdGVuY2VcbiAqXG4gKiBTZXR0aW5nIGBwZXJzaXN0ZW50YCB0byBgZmFsc2VgIHdpbGwgYWxsb3cgdGhlIHByb2Nlc3MgdG8gY29udGludWUgdG8gcnVuIGFzXG4gKiBsb25nIGFzIHRoZSB0aW1lciBleGlzdHMuXG4gKlxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBkZWxheSB9IGZyb20gXCJAc3RkL2FzeW5jL2RlbGF5XCI7XG4gKlxuICogLy8gLi4uXG4gKiBhd2FpdCBkZWxheSgxMDAsIHsgcGVyc2lzdGVudDogZmFsc2UgfSk7XG4gKiAvLyAuLi5cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVsYXkobXM6IG51bWJlciwgb3B0aW9uczogRGVsYXlPcHRpb25zID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgeyBzaWduYWwsIHBlcnNpc3RlbnQgPSB0cnVlIH0gPSBvcHRpb25zO1xuICBpZiAoc2lnbmFsPy5hYm9ydGVkKSByZXR1cm4gUHJvbWlzZS5yZWplY3Qoc2lnbmFsLnJlYXNvbik7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgYWJvcnQgPSAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQoaSk7XG4gICAgICByZWplY3Qoc2lnbmFsPy5yZWFzb24pO1xuICAgIH07XG4gICAgY29uc3QgZG9uZSA9ICgpID0+IHtcbiAgICAgIHNpZ25hbD8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0KTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9O1xuICAgIGNvbnN0IGkgPSBzZXRUaW1lb3V0KGRvbmUsIG1zKTtcbiAgICBzaWduYWw/LmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBhYm9ydCwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIGlmIChwZXJzaXN0ZW50ID09PSBmYWxzZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBGb3IgYnJvd3NlciBjb21wYXRpYmlsaXR5XG4gICAgICAgIERlbm8udW5yZWZUaW1lcihpKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgUmVmZXJlbmNlRXJyb3IpKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5lcnJvcihcImBwZXJzaXN0ZW50YCBvcHRpb24gaXMgb25seSBhdmFpbGFibGUgaW4gRGVub1wiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsbUNBQW1DLEdBV25DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E4QkMsR0FDRCxPQUFPLFNBQVMsTUFBTSxFQUFVLEVBQUUsVUFBd0IsQ0FBQyxDQUFDO0VBQzFELE1BQU0sRUFBRSxNQUFNLEVBQUUsYUFBYSxJQUFJLEVBQUUsR0FBRztFQUN0QyxJQUFJLFFBQVEsU0FBUyxPQUFPLFFBQVEsTUFBTSxDQUFDLE9BQU8sTUFBTTtFQUN4RCxPQUFPLElBQUksUUFBUSxDQUFDLFNBQVM7SUFDM0IsTUFBTSxRQUFRO01BQ1osYUFBYTtNQUNiLE9BQU8sUUFBUTtJQUNqQjtJQUNBLE1BQU0sT0FBTztNQUNYLFFBQVEsb0JBQW9CLFNBQVM7TUFDckM7SUFDRjtJQUNBLE1BQU0sSUFBSSxXQUFXLE1BQU07SUFDM0IsUUFBUSxpQkFBaUIsU0FBUyxPQUFPO01BQUUsTUFBTTtJQUFLO0lBQ3RELElBQUksZUFBZSxPQUFPO01BQ3hCLElBQUk7UUFDRix1Q0FBdUM7UUFDdkMsS0FBSyxVQUFVLENBQUM7TUFDbEIsRUFBRSxPQUFPLE9BQU87UUFDZCxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsY0FBYyxHQUFHO1VBQ3RDLE1BQU07UUFDUjtRQUNBLFFBQVEsS0FBSyxDQUFDO01BQ2hCO0lBQ0Y7RUFDRjtBQUNGIn0=
// denoCacheMetadata=6566733661522352877,17393624140127415704