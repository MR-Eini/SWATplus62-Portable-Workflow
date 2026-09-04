// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { ParserFactory, Toml } from "./_parser.ts";
/**
 * Parse parses TOML string into an object.
 *
 * @example Decode TOML string
 * ```ts
 * import { parse } from "@std/toml/parse";
 * import { assertEquals } from "@std/assert/assert-equals"
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
 */ export const parse = ParserFactory(Toml);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvdG9tbC8wLjIyNC4xL3BhcnNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IFBhcnNlckZhY3RvcnksIFRvbWwgfSBmcm9tIFwiLi9fcGFyc2VyLnRzXCI7XG5cbi8qKlxuICogUGFyc2UgcGFyc2VzIFRPTUwgc3RyaW5nIGludG8gYW4gb2JqZWN0LlxuICpcbiAqIEBleGFtcGxlIERlY29kZSBUT01MIHN0cmluZ1xuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlIH0gZnJvbSBcIkBzdGQvdG9tbC9wYXJzZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIlxuICpcbiAqIGNvbnN0IHRvbWxTdHJpbmcgPSBgdGl0bGUgPSBcIlRPTUwgRXhhbXBsZVwiXG4gKiBbb3duZXJdXG4gKiBuYW1lID0gXCJBbGljZVwiXG4gKiBiaW8gPSBcIkFsaWNlIGlzIGEgcHJvZ3JhbW1lci5cImA7XG4gKlxuICogY29uc3Qgb2JqID0gcGFyc2UodG9tbFN0cmluZyk7XG4gKiBhc3NlcnRFcXVhbHMob2JqLCB7IHRpdGxlOiBcIlRPTUwgRXhhbXBsZVwiLCBvd25lcjogeyBuYW1lOiBcIkFsaWNlXCIsIGJpbzogXCJBbGljZSBpcyBhIHByb2dyYW1tZXIuXCIgfSB9KTtcbiAqIGBgYFxuICogQHBhcmFtIHRvbWxTdHJpbmcgVE9NTCBzdHJpbmcgdG8gYmUgcGFyc2VkLlxuICogQHJldHVybnMgVGhlIHBhcnNlZCBKUyBvYmplY3QuXG4gKi9cbmV4cG9ydCBjb25zdCBwYXJzZTogKHRvbWxTdHJpbmc6IHN0cmluZykgPT4gUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPVxuICBQYXJzZXJGYWN0b3J5KFRvbWwpO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxhQUFhLEVBQUUsSUFBSSxRQUFRLGVBQWU7QUFFbkQ7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWtCQyxHQUNELE9BQU8sTUFBTSxRQUNYLGNBQWMsTUFBTSJ9
// denoCacheMetadata=6361353535286669403,11521376924632380385