// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { parserFactory, toml } from "./_parser.ts";
/**
 * Parses a {@link https://toml.io | TOML} string into an object.
 *
 * @example Usage
 * ```ts
 * import { parse } from "@std/toml/parse";
 * import { assertEquals } from "@std/assert";
 *
 * const tomlString = `title = "TOML Example"
 * [owner]
 * name = "Alice"
 * bio = "Alice is a programmer."`;
 *
 * const obj = parse(tomlString);
 * assertEquals(obj, { title: "TOML Example", owner: { name: "Alice", bio: "Alice is a programmer." } });
 * ```
 * @param tomlString TOML string to be parsed.
 * @returns The parsed JS object.
 */ export function parse(tomlString) {
  return parserFactory(toml)(tomlString);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvdG9tbC8xLjAuMS9wYXJzZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBwYXJzZXJGYWN0b3J5LCB0b21sIH0gZnJvbSBcIi4vX3BhcnNlci50c1wiO1xuXG4vKipcbiAqIFBhcnNlcyBhIHtAbGluayBodHRwczovL3RvbWwuaW8gfCBUT01MfSBzdHJpbmcgaW50byBhbiBvYmplY3QuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJAc3RkL3RvbWwvcGFyc2VcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHRvbWxTdHJpbmcgPSBgdGl0bGUgPSBcIlRPTUwgRXhhbXBsZVwiXG4gKiBbb3duZXJdXG4gKiBuYW1lID0gXCJBbGljZVwiXG4gKiBiaW8gPSBcIkFsaWNlIGlzIGEgcHJvZ3JhbW1lci5cImA7XG4gKlxuICogY29uc3Qgb2JqID0gcGFyc2UodG9tbFN0cmluZyk7XG4gKiBhc3NlcnRFcXVhbHMob2JqLCB7IHRpdGxlOiBcIlRPTUwgRXhhbXBsZVwiLCBvd25lcjogeyBuYW1lOiBcIkFsaWNlXCIsIGJpbzogXCJBbGljZSBpcyBhIHByb2dyYW1tZXIuXCIgfSB9KTtcbiAqIGBgYFxuICogQHBhcmFtIHRvbWxTdHJpbmcgVE9NTCBzdHJpbmcgdG8gYmUgcGFyc2VkLlxuICogQHJldHVybnMgVGhlIHBhcnNlZCBKUyBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZSh0b21sU3RyaW5nOiBzdHJpbmcpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIHJldHVybiBwYXJzZXJGYWN0b3J5KHRvbWwpKHRvbWxTdHJpbmcpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxhQUFhLEVBQUUsSUFBSSxRQUFRLGVBQWU7QUFFbkQ7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWtCQyxHQUNELE9BQU8sU0FBUyxNQUFNLFVBQWtCO0VBQ3RDLE9BQU8sY0FBYyxNQUFNO0FBQzdCIn0=
// denoCacheMetadata=1036674356141503352,13675502210533327488