// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Provides user-friendly {@linkcode serve} on top of Deno's native HTTP server
 * and other utilities for creating HTTP servers and clients.
 *
 * ## File Server
 *
 * A small program for serving local files over HTTP.
 *
 * ```sh
 * deno run --allow-net --allow-read --allow-sys jsr:@std/http/file-server
 * > HTTP server listening on http://localhost:4507/
 * ```
 *
 * ## HTTP Status Code and Status Text
 *
 * Helper for processing status code and status text.
 *
 * ## HTTP errors
 *
 * Provides error classes for each HTTP error status code as well as utility
 * functions for handling HTTP errors in a structured way.
 *
 * ## Methods
 *
 * Provides helper functions and types to work with HTTP method strings safely.
 *
 * ## Negotiation
 *
 * A set of functions which can be used to negotiate content types, encodings and
 * languages when responding to requests.
 *
 * > Note: some libraries include accept charset functionality by analyzing the
 * > `Accept-Charset` header. This is a legacy header that
 * > {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Charset | clients omit and servers should ignore}
 * > therefore is not provided.
 *
 * ## Cookie maps
 *
 * An alternative to `cookie.ts` is `cookie_map.ts` which provides `CookieMap`,
 * `SecureCookieMap`, and `mergeHeaders` to manage request and response cookies
 * with the familiar `Map` interface.
 *
 * ## User agent handling
 *
 * The {@linkcode UserAgent} class provides user agent string parsing, allowing
 * a user agent flag to be semantically understood.
 *
 * For example to integrate the user agent provided in the header `User-Agent`
 * in an http request would look like this:
 *
 * ```ts no-eval
 * import { UserAgent } from "@std/http/user-agent";
 *
 * Deno.serve((req) => {
 *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
 *   return new Response(`Hello, ${userAgent.browser.name}
 *     on ${userAgent.os.name} ${userAgent.os.version}!`);
 * });
 * ```
 *
 * @module
 */ export * from "./cookie.ts";
export * from "./etag.ts";
export * from "./status.ts";
export * from "./negotiation.ts";
export * from "./server.ts";
export * from "./unstable_signed_cookie.ts";
export * from "./server_sent_event_stream.ts";
export * from "./user_agent.ts";
export * from "./file_server.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaHR0cC8wLjIyNC41L21vZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLyoqXG4gKiBQcm92aWRlcyB1c2VyLWZyaWVuZGx5IHtAbGlua2NvZGUgc2VydmV9IG9uIHRvcCBvZiBEZW5vJ3MgbmF0aXZlIEhUVFAgc2VydmVyXG4gKiBhbmQgb3RoZXIgdXRpbGl0aWVzIGZvciBjcmVhdGluZyBIVFRQIHNlcnZlcnMgYW5kIGNsaWVudHMuXG4gKlxuICogIyMgRmlsZSBTZXJ2ZXJcbiAqXG4gKiBBIHNtYWxsIHByb2dyYW0gZm9yIHNlcnZpbmcgbG9jYWwgZmlsZXMgb3ZlciBIVFRQLlxuICpcbiAqIGBgYHNoXG4gKiBkZW5vIHJ1biAtLWFsbG93LW5ldCAtLWFsbG93LXJlYWQgLS1hbGxvdy1zeXMganNyOkBzdGQvaHR0cC9maWxlLXNlcnZlclxuICogPiBIVFRQIHNlcnZlciBsaXN0ZW5pbmcgb24gaHR0cDovL2xvY2FsaG9zdDo0NTA3L1xuICogYGBgXG4gKlxuICogIyMgSFRUUCBTdGF0dXMgQ29kZSBhbmQgU3RhdHVzIFRleHRcbiAqXG4gKiBIZWxwZXIgZm9yIHByb2Nlc3Npbmcgc3RhdHVzIGNvZGUgYW5kIHN0YXR1cyB0ZXh0LlxuICpcbiAqICMjIEhUVFAgZXJyb3JzXG4gKlxuICogUHJvdmlkZXMgZXJyb3IgY2xhc3NlcyBmb3IgZWFjaCBIVFRQIGVycm9yIHN0YXR1cyBjb2RlIGFzIHdlbGwgYXMgdXRpbGl0eVxuICogZnVuY3Rpb25zIGZvciBoYW5kbGluZyBIVFRQIGVycm9ycyBpbiBhIHN0cnVjdHVyZWQgd2F5LlxuICpcbiAqICMjIE1ldGhvZHNcbiAqXG4gKiBQcm92aWRlcyBoZWxwZXIgZnVuY3Rpb25zIGFuZCB0eXBlcyB0byB3b3JrIHdpdGggSFRUUCBtZXRob2Qgc3RyaW5ncyBzYWZlbHkuXG4gKlxuICogIyMgTmVnb3RpYXRpb25cbiAqXG4gKiBBIHNldCBvZiBmdW5jdGlvbnMgd2hpY2ggY2FuIGJlIHVzZWQgdG8gbmVnb3RpYXRlIGNvbnRlbnQgdHlwZXMsIGVuY29kaW5ncyBhbmRcbiAqIGxhbmd1YWdlcyB3aGVuIHJlc3BvbmRpbmcgdG8gcmVxdWVzdHMuXG4gKlxuICogPiBOb3RlOiBzb21lIGxpYnJhcmllcyBpbmNsdWRlIGFjY2VwdCBjaGFyc2V0IGZ1bmN0aW9uYWxpdHkgYnkgYW5hbHl6aW5nIHRoZVxuICogPiBgQWNjZXB0LUNoYXJzZXRgIGhlYWRlci4gVGhpcyBpcyBhIGxlZ2FjeSBoZWFkZXIgdGhhdFxuICogPiB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRUUC9IZWFkZXJzL0FjY2VwdC1DaGFyc2V0IHwgY2xpZW50cyBvbWl0IGFuZCBzZXJ2ZXJzIHNob3VsZCBpZ25vcmV9XG4gKiA+IHRoZXJlZm9yZSBpcyBub3QgcHJvdmlkZWQuXG4gKlxuICogIyMgQ29va2llIG1hcHNcbiAqXG4gKiBBbiBhbHRlcm5hdGl2ZSB0byBgY29va2llLnRzYCBpcyBgY29va2llX21hcC50c2Agd2hpY2ggcHJvdmlkZXMgYENvb2tpZU1hcGAsXG4gKiBgU2VjdXJlQ29va2llTWFwYCwgYW5kIGBtZXJnZUhlYWRlcnNgIHRvIG1hbmFnZSByZXF1ZXN0IGFuZCByZXNwb25zZSBjb29raWVzXG4gKiB3aXRoIHRoZSBmYW1pbGlhciBgTWFwYCBpbnRlcmZhY2UuXG4gKlxuICogIyMgVXNlciBhZ2VudCBoYW5kbGluZ1xuICpcbiAqIFRoZSB7QGxpbmtjb2RlIFVzZXJBZ2VudH0gY2xhc3MgcHJvdmlkZXMgdXNlciBhZ2VudCBzdHJpbmcgcGFyc2luZywgYWxsb3dpbmdcbiAqIGEgdXNlciBhZ2VudCBmbGFnIHRvIGJlIHNlbWFudGljYWxseSB1bmRlcnN0b29kLlxuICpcbiAqIEZvciBleGFtcGxlIHRvIGludGVncmF0ZSB0aGUgdXNlciBhZ2VudCBwcm92aWRlZCBpbiB0aGUgaGVhZGVyIGBVc2VyLUFnZW50YFxuICogaW4gYW4gaHR0cCByZXF1ZXN0IHdvdWxkIGxvb2sgbGlrZSB0aGlzOlxuICpcbiAqIGBgYHRzIG5vLWV2YWxcbiAqIGltcG9ydCB7IFVzZXJBZ2VudCB9IGZyb20gXCJAc3RkL2h0dHAvdXNlci1hZ2VudFwiO1xuICpcbiAqIERlbm8uc2VydmUoKHJlcSkgPT4ge1xuICogICBjb25zdCB1c2VyQWdlbnQgPSBuZXcgVXNlckFnZW50KHJlcS5oZWFkZXJzLmdldChcInVzZXItYWdlbnRcIikgPz8gXCJcIik7XG4gKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYEhlbGxvLCAke3VzZXJBZ2VudC5icm93c2VyLm5hbWV9XG4gKiAgICAgb24gJHt1c2VyQWdlbnQub3MubmFtZX0gJHt1c2VyQWdlbnQub3MudmVyc2lvbn0hYCk7XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5leHBvcnQgKiBmcm9tIFwiLi9jb29raWUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2V0YWcudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3N0YXR1cy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbmVnb3RpYXRpb24udHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3NlcnZlci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdW5zdGFibGVfc2lnbmVkX2Nvb2tpZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vc2VydmVyX3NlbnRfZXZlbnRfc3RyZWFtLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi91c2VyX2FnZW50LnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9maWxlX3NlcnZlci50c1wiO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTZEQyxHQUVELGNBQWMsY0FBYztBQUM1QixjQUFjLFlBQVk7QUFDMUIsY0FBYyxjQUFjO0FBQzVCLGNBQWMsbUJBQW1CO0FBQ2pDLGNBQWMsY0FBYztBQUM1QixjQUFjLDhCQUE4QjtBQUM1QyxjQUFjLGdDQUFnQztBQUM5QyxjQUFjLGtCQUFrQjtBQUNoQyxjQUFjLG1CQUFtQiJ9
// denoCacheMetadata=3254559349694741573,11755138498559158385