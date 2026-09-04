// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { compare } from "./compare.ts";
/**
 * Not equal comparison
 *
 * This is equal to `compare(s0, s1) !== 0`.
 *
 * @example Usage
 * ```ts
 * import { parse, notEquals } from "@std/semver";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const s0 = parse("1.2.3");
 * const s1 = parse("1.2.4");
 * assert(notEquals(s0, s1));
 * assertFalse(notEquals(s0, s0));
 * ```
 *
 * @param s0 The first version to compare
 * @param s1 The second version to compare
 * @returns `true` if `s0` is not equal to `s1`, `false` otherwise
 */ export function notEquals(s0, s1) {
  return compare(s0, s1) !== 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvbm90X2VxdWFscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHR5cGUgeyBTZW1WZXIgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHsgY29tcGFyZSB9IGZyb20gXCIuL2NvbXBhcmUudHNcIjtcblxuLyoqXG4gKiBOb3QgZXF1YWwgY29tcGFyaXNvblxuICpcbiAqIFRoaXMgaXMgZXF1YWwgdG8gYGNvbXBhcmUoczAsIHMxKSAhPT0gMGAuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZSwgbm90RXF1YWxzIH0gZnJvbSBcIkBzdGQvc2VtdmVyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnQsIGFzc2VydEZhbHNlIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3QgczAgPSBwYXJzZShcIjEuMi4zXCIpO1xuICogY29uc3QgczEgPSBwYXJzZShcIjEuMi40XCIpO1xuICogYXNzZXJ0KG5vdEVxdWFscyhzMCwgczEpKTtcbiAqIGFzc2VydEZhbHNlKG5vdEVxdWFscyhzMCwgczApKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzMCBUaGUgZmlyc3QgdmVyc2lvbiB0byBjb21wYXJlXG4gKiBAcGFyYW0gczEgVGhlIHNlY29uZCB2ZXJzaW9uIHRvIGNvbXBhcmVcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBgczBgIGlzIG5vdCBlcXVhbCB0byBgczFgLCBgZmFsc2VgIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbm90RXF1YWxzKHMwOiBTZW1WZXIsIHMxOiBTZW1WZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvbXBhcmUoczAsIHMxKSAhPT0gMDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsT0FBTyxRQUFRLGVBQWU7QUFFdkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQkMsR0FDRCxPQUFPLFNBQVMsVUFBVSxFQUFVLEVBQUUsRUFBVTtFQUM5QyxPQUFPLFFBQVEsSUFBSSxRQUFRO0FBQzdCIn0=
// denoCacheMetadata=2336561364476310378,1836300818273421972