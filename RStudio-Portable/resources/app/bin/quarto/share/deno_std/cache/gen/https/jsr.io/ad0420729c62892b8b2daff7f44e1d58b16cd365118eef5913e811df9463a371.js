// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { exponentialBackoffWithJitter } from "./_util.ts";
/**
 * Error thrown in {@linkcode retry} once the maximum number of failed attempts
 * has been reached.
 *
 * @example Usage
 * ```ts no-assert no-eval
 * import { RetryError } from "@std/async/retry";
 *
 * throw new RetryError({ foo: "bar" }, 3);
 * ```
 */ export class RetryError extends Error {
  /**
   * Constructs a new {@linkcode RetryError} instance.
   *
   * @param cause the cause for this error.
   * @param attempts the number of retry attempts made.
   *
   * @example Usage
   * ```ts no-assert no-eval
   * import { RetryError } from "@std/async/retry";
   *
   * throw new RetryError({ foo: "bar" }, 3);
   * ```
   */ constructor(cause, attempts){
    super(`Retrying exceeded the maxAttempts (${attempts}).`);
    this.name = "RetryError";
    this.cause = cause;
  }
}
const defaultRetryOptions = {
  multiplier: 2,
  maxTimeout: 60000,
  maxAttempts: 5,
  minTimeout: 1000,
  jitter: 1
};
/**
 * Calls the given (possibly asynchronous) function up to `maxAttempts` times.
 * Retries as long as the given function throws. If the attempts are exhausted,
 * throws a {@linkcode RetryError} with `cause` set to the inner exception.
 *
 * The backoff is calculated by multiplying `minTimeout` with `multiplier` to the power of the current attempt counter (starting at 0 up to `maxAttempts - 1`). It is capped at `maxTimeout` however.
 * How long the actual delay is, depends on `jitter`.
 *
 * When `jitter` is the default value of `1`, waits between two attempts for a
 * randomized amount between 0 and the backoff time. With the default options
 * the maximal delay will be `15s = 1s + 2s + 4s + 8s`. If all five attempts
 * are exhausted the mean delay will be `9.5s = ½(4s + 15s)`.
 *
 * When `jitter` is `0`, waits the full backoff time.
 *
 * @example Example configuration 1
 * ```ts no-assert
 * import { retry } from "@std/async/retry";
 * const req = async () => {
 *  // some function that throws sometimes
 * };
 *
 * // Below resolves to the first non-error result of `req`
 * const retryPromise = await retry(req, {
 *  multiplier: 2,
 *  maxTimeout: 60000,
 *  maxAttempts: 5,
 *  minTimeout: 100,
 *  jitter: 1,
 * });
 * ```
 *
 * @example Example configuration 2
 * ```ts no-assert
 * import { retry } from "@std/async/retry";
 * const req = async () => {
 *  // some function that throws sometimes
 * };
 *
 * // Make sure we wait at least 1 minute, but at most 2 minutes
 * const retryPromise = await retry(req, {
 *  multiplier: 2.34,
 *  maxTimeout: 80000,
 *  maxAttempts: 7,
 *  minTimeout: 1000,
 *  jitter: 0.5,
 * });
 * ```
 *
 * @typeParam T The return type of the function to retry and returned promise.
 * @param fn The function to retry.
 * @param opts Additional options.
 * @returns The promise that resolves with the value returned by the function to retry.
 */ export async function retry(fn, opts) {
  const options = {
    ...defaultRetryOptions,
    ...opts
  };
  if (options.maxTimeout <= 0) throw new TypeError("maxTimeout is less than 0");
  if (options.minTimeout > options.maxTimeout) {
    throw new TypeError("minTimeout is greater than maxTimeout");
  }
  if (options.jitter > 1) throw new TypeError("jitter is greater than 1");
  let attempt = 0;
  while(true){
    try {
      return await fn();
    } catch (error) {
      if (attempt + 1 >= options.maxAttempts) {
        throw new RetryError(error, options.maxAttempts);
      }
      const timeout = exponentialBackoffWithJitter(options.maxTimeout, options.minTimeout, attempt, options.multiplier, options.jitter);
      await new Promise((r)=>setTimeout(r, timeout));
    }
    attempt++;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXN5bmMvMC4yMjQuMi9yZXRyeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBleHBvbmVudGlhbEJhY2tvZmZXaXRoSml0dGVyIH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcblxuLyoqXG4gKiBFcnJvciB0aHJvd24gaW4ge0BsaW5rY29kZSByZXRyeX0gb25jZSB0aGUgbWF4aW11bSBudW1iZXIgb2YgZmFpbGVkIGF0dGVtcHRzXG4gKiBoYXMgYmVlbiByZWFjaGVkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnQgbm8tZXZhbFxuICogaW1wb3J0IHsgUmV0cnlFcnJvciB9IGZyb20gXCJAc3RkL2FzeW5jL3JldHJ5XCI7XG4gKlxuICogdGhyb3cgbmV3IFJldHJ5RXJyb3IoeyBmb286IFwiYmFyXCIgfSwgMyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJldHJ5RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgbmV3IHtAbGlua2NvZGUgUmV0cnlFcnJvcn0gaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBjYXVzZSB0aGUgY2F1c2UgZm9yIHRoaXMgZXJyb3IuXG4gICAqIEBwYXJhbSBhdHRlbXB0cyB0aGUgbnVtYmVyIG9mIHJldHJ5IGF0dGVtcHRzIG1hZGUuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzIG5vLWFzc2VydCBuby1ldmFsXG4gICAqIGltcG9ydCB7IFJldHJ5RXJyb3IgfSBmcm9tIFwiQHN0ZC9hc3luYy9yZXRyeVwiO1xuICAgKlxuICAgKiB0aHJvdyBuZXcgUmV0cnlFcnJvcih7IGZvbzogXCJiYXJcIiB9LCAzKTtcbiAgICogYGBgXG4gICAqL1xuICBjb25zdHJ1Y3RvcihjYXVzZTogdW5rbm93biwgYXR0ZW1wdHM6IG51bWJlcikge1xuICAgIHN1cGVyKGBSZXRyeWluZyBleGNlZWRlZCB0aGUgbWF4QXR0ZW1wdHMgKCR7YXR0ZW1wdHN9KS5gKTtcbiAgICB0aGlzLm5hbWUgPSBcIlJldHJ5RXJyb3JcIjtcbiAgICB0aGlzLmNhdXNlID0gY2F1c2U7XG4gIH1cbn1cblxuLyoqIE9wdGlvbnMgZm9yIHtAbGlua2NvZGUgcmV0cnl9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXRyeU9wdGlvbnMge1xuICAvKipcbiAgICogSG93IG11Y2ggdG8gYmFja29mZiBhZnRlciBlYWNoIHJldHJ5LlxuICAgKlxuICAgKiBAZGVmYXVsdCB7Mn1cbiAgICovXG4gIG11bHRpcGxpZXI/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgbWF4aW11bSBtaWxsaXNlY29uZHMgYmV0d2VlbiBhdHRlbXB0cy5cbiAgICpcbiAgICogQGRlZmF1bHQgezYwMDAwfVxuICAgKi9cbiAgbWF4VGltZW91dD86IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSBtYXhpbXVtIGFtb3VudCBvZiBhdHRlbXB0cyB1bnRpbCBmYWlsdXJlLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7NX1cbiAgICovXG4gIG1heEF0dGVtcHRzPzogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIGluaXRpYWwgYW5kIG1pbmltdW0gYW1vdW50IG9mIG1pbGxpc2Vjb25kcyBiZXR3ZWVuIGF0dGVtcHRzLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7MTAwMH1cbiAgICovXG4gIG1pblRpbWVvdXQ/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBBbW91bnQgb2Ygaml0dGVyIHRvIGludHJvZHVjZSB0byB0aGUgdGltZSBiZXR3ZWVuIGF0dGVtcHRzLiBUaGlzIGlzIGAxYFxuICAgKiBmb3IgZnVsbCBqaXR0ZXIgYnkgZGVmYXVsdC5cbiAgICpcbiAgICogQGRlZmF1bHQgezF9XG4gICAqL1xuICBqaXR0ZXI/OiBudW1iZXI7XG59XG5cbmNvbnN0IGRlZmF1bHRSZXRyeU9wdGlvbnM6IFJlcXVpcmVkPFJldHJ5T3B0aW9ucz4gPSB7XG4gIG11bHRpcGxpZXI6IDIsXG4gIG1heFRpbWVvdXQ6IDYwMDAwLFxuICBtYXhBdHRlbXB0czogNSxcbiAgbWluVGltZW91dDogMTAwMCxcbiAgaml0dGVyOiAxLFxufTtcblxuLyoqXG4gKiBDYWxscyB0aGUgZ2l2ZW4gKHBvc3NpYmx5IGFzeW5jaHJvbm91cykgZnVuY3Rpb24gdXAgdG8gYG1heEF0dGVtcHRzYCB0aW1lcy5cbiAqIFJldHJpZXMgYXMgbG9uZyBhcyB0aGUgZ2l2ZW4gZnVuY3Rpb24gdGhyb3dzLiBJZiB0aGUgYXR0ZW1wdHMgYXJlIGV4aGF1c3RlZCxcbiAqIHRocm93cyBhIHtAbGlua2NvZGUgUmV0cnlFcnJvcn0gd2l0aCBgY2F1c2VgIHNldCB0byB0aGUgaW5uZXIgZXhjZXB0aW9uLlxuICpcbiAqIFRoZSBiYWNrb2ZmIGlzIGNhbGN1bGF0ZWQgYnkgbXVsdGlwbHlpbmcgYG1pblRpbWVvdXRgIHdpdGggYG11bHRpcGxpZXJgIHRvIHRoZSBwb3dlciBvZiB0aGUgY3VycmVudCBhdHRlbXB0IGNvdW50ZXIgKHN0YXJ0aW5nIGF0IDAgdXAgdG8gYG1heEF0dGVtcHRzIC0gMWApLiBJdCBpcyBjYXBwZWQgYXQgYG1heFRpbWVvdXRgIGhvd2V2ZXIuXG4gKiBIb3cgbG9uZyB0aGUgYWN0dWFsIGRlbGF5IGlzLCBkZXBlbmRzIG9uIGBqaXR0ZXJgLlxuICpcbiAqIFdoZW4gYGppdHRlcmAgaXMgdGhlIGRlZmF1bHQgdmFsdWUgb2YgYDFgLCB3YWl0cyBiZXR3ZWVuIHR3byBhdHRlbXB0cyBmb3IgYVxuICogcmFuZG9taXplZCBhbW91bnQgYmV0d2VlbiAwIGFuZCB0aGUgYmFja29mZiB0aW1lLiBXaXRoIHRoZSBkZWZhdWx0IG9wdGlvbnNcbiAqIHRoZSBtYXhpbWFsIGRlbGF5IHdpbGwgYmUgYDE1cyA9IDFzICsgMnMgKyA0cyArIDhzYC4gSWYgYWxsIGZpdmUgYXR0ZW1wdHNcbiAqIGFyZSBleGhhdXN0ZWQgdGhlIG1lYW4gZGVsYXkgd2lsbCBiZSBgOS41cyA9IMK9KDRzICsgMTVzKWAuXG4gKlxuICogV2hlbiBgaml0dGVyYCBpcyBgMGAsIHdhaXRzIHRoZSBmdWxsIGJhY2tvZmYgdGltZS5cbiAqXG4gKiBAZXhhbXBsZSBFeGFtcGxlIGNvbmZpZ3VyYXRpb24gMVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyByZXRyeSB9IGZyb20gXCJAc3RkL2FzeW5jL3JldHJ5XCI7XG4gKiBjb25zdCByZXEgPSBhc3luYyAoKSA9PiB7XG4gKiAgLy8gc29tZSBmdW5jdGlvbiB0aGF0IHRocm93cyBzb21ldGltZXNcbiAqIH07XG4gKlxuICogLy8gQmVsb3cgcmVzb2x2ZXMgdG8gdGhlIGZpcnN0IG5vbi1lcnJvciByZXN1bHQgb2YgYHJlcWBcbiAqIGNvbnN0IHJldHJ5UHJvbWlzZSA9IGF3YWl0IHJldHJ5KHJlcSwge1xuICogIG11bHRpcGxpZXI6IDIsXG4gKiAgbWF4VGltZW91dDogNjAwMDAsXG4gKiAgbWF4QXR0ZW1wdHM6IDUsXG4gKiAgbWluVGltZW91dDogMTAwLFxuICogIGppdHRlcjogMSxcbiAqIH0pO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgRXhhbXBsZSBjb25maWd1cmF0aW9uIDJcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgcmV0cnkgfSBmcm9tIFwiQHN0ZC9hc3luYy9yZXRyeVwiO1xuICogY29uc3QgcmVxID0gYXN5bmMgKCkgPT4ge1xuICogIC8vIHNvbWUgZnVuY3Rpb24gdGhhdCB0aHJvd3Mgc29tZXRpbWVzXG4gKiB9O1xuICpcbiAqIC8vIE1ha2Ugc3VyZSB3ZSB3YWl0IGF0IGxlYXN0IDEgbWludXRlLCBidXQgYXQgbW9zdCAyIG1pbnV0ZXNcbiAqIGNvbnN0IHJldHJ5UHJvbWlzZSA9IGF3YWl0IHJldHJ5KHJlcSwge1xuICogIG11bHRpcGxpZXI6IDIuMzQsXG4gKiAgbWF4VGltZW91dDogODAwMDAsXG4gKiAgbWF4QXR0ZW1wdHM6IDcsXG4gKiAgbWluVGltZW91dDogMTAwMCxcbiAqICBqaXR0ZXI6IDAuNSxcbiAqIH0pO1xuICogYGBgXG4gKlxuICogQHR5cGVQYXJhbSBUIFRoZSByZXR1cm4gdHlwZSBvZiB0aGUgZnVuY3Rpb24gdG8gcmV0cnkgYW5kIHJldHVybmVkIHByb21pc2UuXG4gKiBAcGFyYW0gZm4gVGhlIGZ1bmN0aW9uIHRvIHJldHJ5LlxuICogQHBhcmFtIG9wdHMgQWRkaXRpb25hbCBvcHRpb25zLlxuICogQHJldHVybnMgVGhlIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSB2YWx1ZSByZXR1cm5lZCBieSB0aGUgZnVuY3Rpb24gdG8gcmV0cnkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXRyeTxUPihcbiAgZm46ICgoKSA9PiBQcm9taXNlPFQ+KSB8ICgoKSA9PiBUKSxcbiAgb3B0cz86IFJldHJ5T3B0aW9ucyxcbik6IFByb21pc2U8VD4ge1xuICBjb25zdCBvcHRpb25zOiBSZXF1aXJlZDxSZXRyeU9wdGlvbnM+ID0ge1xuICAgIC4uLmRlZmF1bHRSZXRyeU9wdGlvbnMsXG4gICAgLi4ub3B0cyxcbiAgfTtcblxuICBpZiAob3B0aW9ucy5tYXhUaW1lb3V0IDw9IDApIHRocm93IG5ldyBUeXBlRXJyb3IoXCJtYXhUaW1lb3V0IGlzIGxlc3MgdGhhbiAwXCIpO1xuICBpZiAob3B0aW9ucy5taW5UaW1lb3V0ID4gb3B0aW9ucy5tYXhUaW1lb3V0KSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIm1pblRpbWVvdXQgaXMgZ3JlYXRlciB0aGFuIG1heFRpbWVvdXRcIik7XG4gIH1cbiAgaWYgKG9wdGlvbnMuaml0dGVyID4gMSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcImppdHRlciBpcyBncmVhdGVyIHRoYW4gMVwiKTtcblxuICBsZXQgYXR0ZW1wdCA9IDA7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBmbigpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoYXR0ZW1wdCArIDEgPj0gb3B0aW9ucy5tYXhBdHRlbXB0cykge1xuICAgICAgICB0aHJvdyBuZXcgUmV0cnlFcnJvcihlcnJvciwgb3B0aW9ucy5tYXhBdHRlbXB0cyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBleHBvbmVudGlhbEJhY2tvZmZXaXRoSml0dGVyKFxuICAgICAgICBvcHRpb25zLm1heFRpbWVvdXQsXG4gICAgICAgIG9wdGlvbnMubWluVGltZW91dCxcbiAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgb3B0aW9ucy5tdWx0aXBsaWVyLFxuICAgICAgICBvcHRpb25zLmppdHRlcixcbiAgICAgICk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dChyLCB0aW1lb3V0KSk7XG4gICAgfVxuICAgIGF0dGVtcHQrKztcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyw0QkFBNEIsUUFBUSxhQUFhO0FBRTFEOzs7Ozs7Ozs7O0NBVUMsR0FDRCxPQUFPLE1BQU0sbUJBQW1CO0VBQzlCOzs7Ozs7Ozs7Ozs7R0FZQyxHQUNELFlBQVksS0FBYyxFQUFFLFFBQWdCLENBQUU7SUFDNUMsS0FBSyxDQUFDLENBQUMsbUNBQW1DLEVBQUUsU0FBUyxFQUFFLENBQUM7SUFDeEQsSUFBSSxDQUFDLElBQUksR0FBRztJQUNaLElBQUksQ0FBQyxLQUFLLEdBQUc7RUFDZjtBQUNGO0FBcUNBLE1BQU0sc0JBQThDO0VBQ2xELFlBQVk7RUFDWixZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixRQUFRO0FBQ1Y7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FxREMsR0FDRCxPQUFPLGVBQWUsTUFDcEIsRUFBa0MsRUFDbEMsSUFBbUI7RUFFbkIsTUFBTSxVQUFrQztJQUN0QyxHQUFHLG1CQUFtQjtJQUN0QixHQUFHLElBQUk7RUFDVDtFQUVBLElBQUksUUFBUSxVQUFVLElBQUksR0FBRyxNQUFNLElBQUksVUFBVTtFQUNqRCxJQUFJLFFBQVEsVUFBVSxHQUFHLFFBQVEsVUFBVSxFQUFFO0lBQzNDLE1BQU0sSUFBSSxVQUFVO0VBQ3RCO0VBQ0EsSUFBSSxRQUFRLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxVQUFVO0VBRTVDLElBQUksVUFBVTtFQUNkLE1BQU8sS0FBTTtJQUNYLElBQUk7TUFDRixPQUFPLE1BQU07SUFDZixFQUFFLE9BQU8sT0FBTztNQUNkLElBQUksVUFBVSxLQUFLLFFBQVEsV0FBVyxFQUFFO1FBQ3RDLE1BQU0sSUFBSSxXQUFXLE9BQU8sUUFBUSxXQUFXO01BQ2pEO01BRUEsTUFBTSxVQUFVLDZCQUNkLFFBQVEsVUFBVSxFQUNsQixRQUFRLFVBQVUsRUFDbEIsU0FDQSxRQUFRLFVBQVUsRUFDbEIsUUFBUSxNQUFNO01BRWhCLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBTSxXQUFXLEdBQUc7SUFDekM7SUFDQTtFQUNGO0FBQ0YifQ==
// denoCacheMetadata=7083604912809845716,18360767086579040423