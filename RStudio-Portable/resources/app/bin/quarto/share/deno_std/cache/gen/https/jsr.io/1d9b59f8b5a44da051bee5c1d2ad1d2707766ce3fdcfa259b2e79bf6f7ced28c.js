// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Provide help with asynchronous tasks like delays, debouncing, deferring, or
 * pooling.
 *
 * ```ts no-assert
 * import { delay } from "@std/async/delay";
 *
 * await delay(100); // waits for 100 milliseconds
 * ```
 *
 * @module
 */ export * from "./abortable.ts";
export * from "./deadline.ts";
export * from "./debounce.ts";
export * from "./delay.ts";
export * from "./mux_async_iterator.ts";
export * from "./pool.ts";
export * from "./tee.ts";
export * from "./retry.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXN5bmMvMC4yMjQuMi9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBQcm92aWRlIGhlbHAgd2l0aCBhc3luY2hyb25vdXMgdGFza3MgbGlrZSBkZWxheXMsIGRlYm91bmNpbmcsIGRlZmVycmluZywgb3JcbiAqIHBvb2xpbmcuXG4gKlxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBkZWxheSB9IGZyb20gXCJAc3RkL2FzeW5jL2RlbGF5XCI7XG4gKlxuICogYXdhaXQgZGVsYXkoMTAwKTsgLy8gd2FpdHMgZm9yIDEwMCBtaWxsaXNlY29uZHNcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5leHBvcnQgKiBmcm9tIFwiLi9hYm9ydGFibGUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2RlYWRsaW5lLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9kZWJvdW5jZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZGVsYXkudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL211eF9hc3luY19pdGVyYXRvci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcG9vbC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdGVlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9yZXRyeS50c1wiO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7O0NBV0MsR0FFRCxjQUFjLGlCQUFpQjtBQUMvQixjQUFjLGdCQUFnQjtBQUM5QixjQUFjLGdCQUFnQjtBQUM5QixjQUFjLGFBQWE7QUFDM0IsY0FBYywwQkFBMEI7QUFDeEMsY0FBYyxZQUFZO0FBQzFCLGNBQWMsV0FBVztBQUN6QixjQUFjLGFBQWEifQ==
// denoCacheMetadata=1610333318752078329,8589332487888037986