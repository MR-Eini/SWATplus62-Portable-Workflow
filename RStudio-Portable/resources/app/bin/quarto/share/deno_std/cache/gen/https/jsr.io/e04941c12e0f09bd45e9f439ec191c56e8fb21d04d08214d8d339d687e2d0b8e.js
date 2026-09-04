// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Provides tools for working with JSONC (JSON with comments). Currently, this
 * module only provides a means of parsing JSONC. JSONC serialization is not
 * yet supported.
 *
 * ```ts
 * import { parse } from "@std/jsonc";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(parse('{"foo": "bar", } // comment'), { foo: "bar" });
 *
 * assertEquals(parse('{"foo": "bar", } /* comment *\/'), { foo: "bar" });
 *
 * assertEquals(
 *   parse('{"foo": "bar" } // comment', { allowTrailingComma: false }),
 *   { foo: "bar" }
 * );
 * ```
 *
 * @module
 */ export * from "./parse.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvanNvbmMvMC4yMjQuMy9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBQcm92aWRlcyB0b29scyBmb3Igd29ya2luZyB3aXRoIEpTT05DIChKU09OIHdpdGggY29tbWVudHMpLiBDdXJyZW50bHksIHRoaXNcbiAqIG1vZHVsZSBvbmx5IHByb3ZpZGVzIGEgbWVhbnMgb2YgcGFyc2luZyBKU09OQy4gSlNPTkMgc2VyaWFsaXphdGlvbiBpcyBub3RcbiAqIHlldCBzdXBwb3J0ZWQuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlIH0gZnJvbSBcIkBzdGQvanNvbmNcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKHBhcnNlKCd7XCJmb29cIjogXCJiYXJcIiwgfSAvLyBjb21tZW50JyksIHsgZm9vOiBcImJhclwiIH0pO1xuICpcbiAqIGFzc2VydEVxdWFscyhwYXJzZSgne1wiZm9vXCI6IFwiYmFyXCIsIH0gLyogY29tbWVudCAqXFwvJyksIHsgZm9vOiBcImJhclwiIH0pO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgcGFyc2UoJ3tcImZvb1wiOiBcImJhclwiIH0gLy8gY29tbWVudCcsIHsgYWxsb3dUcmFpbGluZ0NvbW1hOiBmYWxzZSB9KSxcbiAqICAgeyBmb286IFwiYmFyXCIgfVxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuZXhwb3J0ICogZnJvbSBcIi4vcGFyc2UudHNcIjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW9CQyxHQUNELGNBQWMsYUFBYSJ9
// denoCacheMetadata=11447206720557317330,4976663645366708546