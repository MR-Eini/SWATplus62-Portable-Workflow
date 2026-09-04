// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { delay } from "./delay.ts";
/**
 * Error thrown when {@linkcode deadline} times out.
 *
 * @example Usage
 * ```ts no-assert
 * import { DeadlineError } from "@std/async/deadline";
 *
 * const error = new DeadlineError();
 * ```
 */ export class DeadlineError extends Error {
  constructor(){
    super("Deadline");
    this.name = this.constructor.name;
  }
}
/**
 * Create a promise which will be rejected with {@linkcode DeadlineError} when
 * a given delay is exceeded.
 *
 * Note: Prefer to use {@linkcode AbortSignal.timeout} instead for the APIs
 * that accept {@linkcode AbortSignal}.
 *
 * @typeParam T The type of the provided and returned promise.
 * @param p The promise to make rejectable.
 * @param ms Duration in milliseconds for when the promise should time out.
 * @param options Additional options.
 * @returns A promise that will reject if the provided duration runs out before resolving.
 *
 * @example Usage
 * ```ts no-eval
 * import { deadline } from "@std/async/deadline";
 * import { delay } from "@std/async/delay";
 *
 * const delayedPromise = delay(1000);
 * // Below throws `DeadlineError` after 10 ms
 * const result = await deadline(delayedPromise, 10);
 * ```
 */ export function deadline(p, ms, options = {}) {
  const controller = new AbortController();
  const { signal } = options;
  if (signal?.aborted) {
    return Promise.reject(new DeadlineError());
  }
  signal?.addEventListener("abort", ()=>controller.abort(signal.reason));
  const d = delay(ms, {
    signal: controller.signal
  }).catch(()=>{}) // Do NOTHING on abort.
  .then(()=>Promise.reject(new DeadlineError()));
  return Promise.race([
    p.finally(()=>controller.abort()),
    d
  ]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXN5bmMvMC4yMjQuMi9kZWFkbGluZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBkZWxheSB9IGZyb20gXCIuL2RlbGF5LnRzXCI7XG5cbi8qKiBPcHRpb25zIGZvciB7QGxpbmtjb2RlIGRlYWRsaW5lfS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVhZGxpbmVPcHRpb25zIHtcbiAgLyoqIFNpZ25hbCB1c2VkIHRvIGFib3J0IHRoZSBkZWFkbGluZS4gKi9cbiAgc2lnbmFsPzogQWJvcnRTaWduYWw7XG59XG5cbi8qKlxuICogRXJyb3IgdGhyb3duIHdoZW4ge0BsaW5rY29kZSBkZWFkbGluZX0gdGltZXMgb3V0LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IERlYWRsaW5lRXJyb3IgfSBmcm9tIFwiQHN0ZC9hc3luYy9kZWFkbGluZVwiO1xuICpcbiAqIGNvbnN0IGVycm9yID0gbmV3IERlYWRsaW5lRXJyb3IoKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgRGVhZGxpbmVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoXCJEZWFkbGluZVwiKTtcbiAgICB0aGlzLm5hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBwcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aCB7QGxpbmtjb2RlIERlYWRsaW5lRXJyb3J9IHdoZW5cbiAqIGEgZ2l2ZW4gZGVsYXkgaXMgZXhjZWVkZWQuXG4gKlxuICogTm90ZTogUHJlZmVyIHRvIHVzZSB7QGxpbmtjb2RlIEFib3J0U2lnbmFsLnRpbWVvdXR9IGluc3RlYWQgZm9yIHRoZSBBUElzXG4gKiB0aGF0IGFjY2VwdCB7QGxpbmtjb2RlIEFib3J0U2lnbmFsfS5cbiAqXG4gKiBAdHlwZVBhcmFtIFQgVGhlIHR5cGUgb2YgdGhlIHByb3ZpZGVkIGFuZCByZXR1cm5lZCBwcm9taXNlLlxuICogQHBhcmFtIHAgVGhlIHByb21pc2UgdG8gbWFrZSByZWplY3RhYmxlLlxuICogQHBhcmFtIG1zIER1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyBmb3Igd2hlbiB0aGUgcHJvbWlzZSBzaG91bGQgdGltZSBvdXQuXG4gKiBAcGFyYW0gb3B0aW9ucyBBZGRpdGlvbmFsIG9wdGlvbnMuXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCB3aWxsIHJlamVjdCBpZiB0aGUgcHJvdmlkZWQgZHVyYXRpb24gcnVucyBvdXQgYmVmb3JlIHJlc29sdmluZy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgZGVhZGxpbmUgfSBmcm9tIFwiQHN0ZC9hc3luYy9kZWFkbGluZVwiO1xuICogaW1wb3J0IHsgZGVsYXkgfSBmcm9tIFwiQHN0ZC9hc3luYy9kZWxheVwiO1xuICpcbiAqIGNvbnN0IGRlbGF5ZWRQcm9taXNlID0gZGVsYXkoMTAwMCk7XG4gKiAvLyBCZWxvdyB0aHJvd3MgYERlYWRsaW5lRXJyb3JgIGFmdGVyIDEwIG1zXG4gKiBjb25zdCByZXN1bHQgPSBhd2FpdCBkZWFkbGluZShkZWxheWVkUHJvbWlzZSwgMTApO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWFkbGluZTxUPihcbiAgcDogUHJvbWlzZTxUPixcbiAgbXM6IG51bWJlcixcbiAgb3B0aW9uczogRGVhZGxpbmVPcHRpb25zID0ge30sXG4pOiBQcm9taXNlPFQ+IHtcbiAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgY29uc3QgeyBzaWduYWwgfSA9IG9wdGlvbnM7XG4gIGlmIChzaWduYWw/LmFib3J0ZWQpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IERlYWRsaW5lRXJyb3IoKSk7XG4gIH1cbiAgc2lnbmFsPy5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgKCkgPT4gY29udHJvbGxlci5hYm9ydChzaWduYWwucmVhc29uKSk7XG4gIGNvbnN0IGQgPSBkZWxheShtcywgeyBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsIH0pXG4gICAgLmNhdGNoKCgpID0+IHt9KSAvLyBEbyBOT1RISU5HIG9uIGFib3J0LlxuICAgIC50aGVuKCgpID0+IFByb21pc2UucmVqZWN0KG5ldyBEZWFkbGluZUVycm9yKCkpKTtcbiAgcmV0dXJuIFByb21pc2UucmFjZShbcC5maW5hbGx5KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSksIGRdKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsS0FBSyxRQUFRLGFBQWE7QUFRbkM7Ozs7Ozs7OztDQVNDLEdBQ0QsT0FBTyxNQUFNLHNCQUFzQjtFQUNqQyxhQUFjO0lBQ1osS0FBSyxDQUFDO0lBQ04sSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUk7RUFDbkM7QUFDRjtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0JDLEdBQ0QsT0FBTyxTQUFTLFNBQ2QsQ0FBYSxFQUNiLEVBQVUsRUFDVixVQUEyQixDQUFDLENBQUM7RUFFN0IsTUFBTSxhQUFhLElBQUk7RUFDdkIsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHO0VBQ25CLElBQUksUUFBUSxTQUFTO0lBQ25CLE9BQU8sUUFBUSxNQUFNLENBQUMsSUFBSTtFQUM1QjtFQUNBLFFBQVEsaUJBQWlCLFNBQVMsSUFBTSxXQUFXLEtBQUssQ0FBQyxPQUFPLE1BQU07RUFDdEUsTUFBTSxJQUFJLE1BQU0sSUFBSTtJQUFFLFFBQVEsV0FBVyxNQUFNO0VBQUMsR0FDN0MsS0FBSyxDQUFDLEtBQU8sR0FBRyx1QkFBdUI7R0FDdkMsSUFBSSxDQUFDLElBQU0sUUFBUSxNQUFNLENBQUMsSUFBSTtFQUNqQyxPQUFPLFFBQVEsSUFBSSxDQUFDO0lBQUMsRUFBRSxPQUFPLENBQUMsSUFBTSxXQUFXLEtBQUs7SUFBSztHQUFFO0FBQzlEIn0=
// denoCacheMetadata=2521406554005096763,12745132003093752177