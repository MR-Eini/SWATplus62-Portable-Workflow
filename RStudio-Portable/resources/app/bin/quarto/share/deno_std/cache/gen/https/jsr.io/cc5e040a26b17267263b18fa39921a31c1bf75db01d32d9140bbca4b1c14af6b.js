// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Options for {@linkcode delay}. */ /**
 * Resolve a {@linkcode Promise} after a given amount of milliseconds.
 *
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXN5bmMvMC4yMjQuMi9kZWxheS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBkZWxheX0uICovXG5leHBvcnQgaW50ZXJmYWNlIERlbGF5T3B0aW9ucyB7XG4gIC8qKiBTaWduYWwgdXNlZCB0byBhYm9ydCB0aGUgZGVsYXkuICovXG4gIHNpZ25hbD86IEFib3J0U2lnbmFsO1xuICAvKiogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHByb2Nlc3Mgc2hvdWxkIGNvbnRpbnVlIHRvIHJ1biBhcyBsb25nIGFzIHRoZSB0aW1lciBleGlzdHMuXG4gICAqXG4gICAqIEBkZWZhdWx0IHt0cnVlfVxuICAgKi9cbiAgcGVyc2lzdGVudD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIHtAbGlua2NvZGUgUHJvbWlzZX0gYWZ0ZXIgYSBnaXZlbiBhbW91bnQgb2YgbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSBtcyBEdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgZm9yIGhvdyBsb25nIHRoZSBkZWxheSBzaG91bGQgbGFzdC5cbiAqIEBwYXJhbSBvcHRpb25zIEFkZGl0aW9uYWwgb3B0aW9ucy5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBkZWxheSB9IGZyb20gXCJAc3RkL2FzeW5jL2RlbGF5XCI7XG4gKlxuICogLy8gLi4uXG4gKiBjb25zdCBkZWxheWVkUHJvbWlzZSA9IGRlbGF5KDEwMCk7XG4gKiBjb25zdCByZXN1bHQgPSBhd2FpdCBkZWxheWVkUHJvbWlzZTtcbiAqIC8vIC4uLlxuICogYGBgXG4gKlxuICogQGV4YW1wbGUgRGlzYWJsZSBwZXJzaXN0ZW5jZVxuICpcbiAqIFNldHRpbmcgYHBlcnNpc3RlbnRgIHRvIGBmYWxzZWAgd2lsbCBhbGxvdyB0aGUgcHJvY2VzcyB0byBjb250aW51ZSB0byBydW4gYXNcbiAqIGxvbmcgYXMgdGhlIHRpbWVyIGV4aXN0cy5cbiAqXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGRlbGF5IH0gZnJvbSBcIkBzdGQvYXN5bmMvZGVsYXlcIjtcbiAqXG4gKiAvLyAuLi5cbiAqIGF3YWl0IGRlbGF5KDEwMCwgeyBwZXJzaXN0ZW50OiBmYWxzZSB9KTtcbiAqIC8vIC4uLlxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxheShtczogbnVtYmVyLCBvcHRpb25zOiBEZWxheU9wdGlvbnMgPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IHNpZ25hbCwgcGVyc2lzdGVudCA9IHRydWUgfSA9IG9wdGlvbnM7XG4gIGlmIChzaWduYWw/LmFib3J0ZWQpIHJldHVybiBQcm9taXNlLnJlamVjdChzaWduYWwucmVhc29uKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBhYm9ydCA9ICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dChpKTtcbiAgICAgIHJlamVjdChzaWduYWw/LnJlYXNvbik7XG4gICAgfTtcbiAgICBjb25zdCBkb25lID0gKCkgPT4ge1xuICAgICAgc2lnbmFsPy5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgYWJvcnQpO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH07XG4gICAgY29uc3QgaSA9IHNldFRpbWVvdXQoZG9uZSwgbXMpO1xuICAgIHNpZ25hbD8uYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgaWYgKHBlcnNpc3RlbnQgPT09IGZhbHNlKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBAdHMtaWdub3JlIEZvciBicm93c2VyIGNvbXBhdGliaWxpdHlcbiAgICAgICAgRGVuby51bnJlZlRpbWVyKGkpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBSZWZlcmVuY2VFcnJvcikpIHtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmVycm9yKFwiYHBlcnNpc3RlbnRgIG9wdGlvbiBpcyBvbmx5IGF2YWlsYWJsZSBpbiBEZW5vXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxtQ0FBbUMsR0FXbkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E0QkMsR0FDRCxPQUFPLFNBQVMsTUFBTSxFQUFVLEVBQUUsVUFBd0IsQ0FBQyxDQUFDO0VBQzFELE1BQU0sRUFBRSxNQUFNLEVBQUUsYUFBYSxJQUFJLEVBQUUsR0FBRztFQUN0QyxJQUFJLFFBQVEsU0FBUyxPQUFPLFFBQVEsTUFBTSxDQUFDLE9BQU8sTUFBTTtFQUN4RCxPQUFPLElBQUksUUFBUSxDQUFDLFNBQVM7SUFDM0IsTUFBTSxRQUFRO01BQ1osYUFBYTtNQUNiLE9BQU8sUUFBUTtJQUNqQjtJQUNBLE1BQU0sT0FBTztNQUNYLFFBQVEsb0JBQW9CLFNBQVM7TUFDckM7SUFDRjtJQUNBLE1BQU0sSUFBSSxXQUFXLE1BQU07SUFDM0IsUUFBUSxpQkFBaUIsU0FBUyxPQUFPO01BQUUsTUFBTTtJQUFLO0lBQ3RELElBQUksZUFBZSxPQUFPO01BQ3hCLElBQUk7UUFDRix1Q0FBdUM7UUFDdkMsS0FBSyxVQUFVLENBQUM7TUFDbEIsRUFBRSxPQUFPLE9BQU87UUFDZCxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsY0FBYyxHQUFHO1VBQ3RDLE1BQU07UUFDUjtRQUNBLFFBQVEsS0FBSyxDQUFDO01BQ2hCO0lBQ0Y7RUFDRjtBQUNGIn0=
// denoCacheMetadata=10106634555777179370,2700415105534612787