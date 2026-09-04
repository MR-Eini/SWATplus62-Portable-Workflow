// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion, error will be thrown if `expr` does not have truthy value.
 *
 * @example
 * ```ts
 * import { assert } from "@std/assert/assert";
 *
 * assert("hello".includes("ello")); // Doesn't throw
 * assert("hello".includes("world")); // Throws
 * ```
 */ export function assert(expr, msg = "") {
  if (!expr) {
    throw new AssertionError(msg);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzAuMjI0LjAvYXNzZXJ0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBBc3NlcnRpb25FcnJvciB9IGZyb20gXCIuL2Fzc2VydGlvbl9lcnJvci50c1wiO1xuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uLCBlcnJvciB3aWxsIGJlIHRocm93biBpZiBgZXhwcmAgZG9lcyBub3QgaGF2ZSB0cnV0aHkgdmFsdWUuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0KFwiaGVsbG9cIi5pbmNsdWRlcyhcImVsbG9cIikpOyAvLyBEb2Vzbid0IHRocm93XG4gKiBhc3NlcnQoXCJoZWxsb1wiLmluY2x1ZGVzKFwid29ybGRcIikpOyAvLyBUaHJvd3NcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0KGV4cHI6IHVua25vd24sIG1zZyA9IFwiXCIpOiBhc3NlcnRzIGV4cHIge1xuICBpZiAoIWV4cHIpIHtcbiAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsU0FBUyxjQUFjLFFBQVEsdUJBQXVCO0FBRXREOzs7Ozs7Ozs7O0NBVUMsR0FDRCxPQUFPLFNBQVMsT0FBTyxJQUFhLEVBQUUsTUFBTSxFQUFFO0VBQzVDLElBQUksQ0FBQyxNQUFNO0lBQ1QsTUFBTSxJQUFJLGVBQWU7RUFDM0I7QUFDRiJ9
// denoCacheMetadata=5130679775943368584,8266193691877360064