// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Utilities for dealing with {@linkcode Date} objects.
 *
 * ```ts
 * import { dayOfYear, isLeap, difference } from "@std/datetime";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(dayOfYear(new Date("2019-03-11T03:24:00")), 70);
 * assertEquals(isLeap(1970), false);
 *
 * const date0 = new Date("2018-05-14");
 * const date1 = new Date("2020-05-13");
 * assertEquals(difference(date0, date1).years, 1);
 * ```
 *
 * @module
 */ export * from "./constants.ts";
export * from "./day_of_year.ts";
export * from "./difference.ts";
export * from "./format.ts";
export * from "./is_leap.ts";
export * from "./parse.ts";
export * from "./week_of_year.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZGF0ZXRpbWUvMC4yMjQuNS9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yIGRlYWxpbmcgd2l0aCB7QGxpbmtjb2RlIERhdGV9IG9iamVjdHMuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGRheU9mWWVhciwgaXNMZWFwLCBkaWZmZXJlbmNlIH0gZnJvbSBcIkBzdGQvZGF0ZXRpbWVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydEVxdWFscyhkYXlPZlllYXIobmV3IERhdGUoXCIyMDE5LTAzLTExVDAzOjI0OjAwXCIpKSwgNzApO1xuICogYXNzZXJ0RXF1YWxzKGlzTGVhcCgxOTcwKSwgZmFsc2UpO1xuICpcbiAqIGNvbnN0IGRhdGUwID0gbmV3IERhdGUoXCIyMDE4LTA1LTE0XCIpO1xuICogY29uc3QgZGF0ZTEgPSBuZXcgRGF0ZShcIjIwMjAtMDUtMTNcIik7XG4gKiBhc3NlcnRFcXVhbHMoZGlmZmVyZW5jZShkYXRlMCwgZGF0ZTEpLnllYXJzLCAxKTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuZXhwb3J0ICogZnJvbSBcIi4vY29uc3RhbnRzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9kYXlfb2ZfeWVhci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZGlmZmVyZW5jZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZm9ybWF0LnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9pc19sZWFwLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9wYXJzZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vd2Vla19vZl95ZWFyLnRzXCI7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUNELGNBQWMsaUJBQWlCO0FBQy9CLGNBQWMsbUJBQW1CO0FBQ2pDLGNBQWMsa0JBQWtCO0FBQ2hDLGNBQWMsY0FBYztBQUM1QixjQUFjLGVBQWU7QUFDN0IsY0FBYyxhQUFhO0FBQzNCLGNBQWMsb0JBQW9CIn0=
// denoCacheMetadata=18359637748814267531,3424857911363525931