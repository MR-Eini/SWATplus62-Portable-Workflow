// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { compare } from "./compare.ts";
/**
 * Greater than or equal to comparison
 *
 * This is equal to `compare(s0, s1) >= 0`.
 *
 * @example Usage
 * ```ts
 * import { parse, greaterOrEqual } from "@std/semver";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const s0 = parse("1.2.3");
 * const s1 = parse("1.2.4");
 * assert(greaterOrEqual(s1, s0));
 * assertFalse(greaterOrEqual(s0, s1));
 * assert(greaterOrEqual(s0, s0));
 * ```
 *
 * @param s0 The first version to compare
 * @param s1 The second version to compare
 * @returns `true` if `s0` is greater than or equal to `s1`, `false` otherwise
 */ export function greaterOrEqual(s0, s1) {
  return compare(s0, s1) >= 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvZ3JlYXRlcl9vcl9lcXVhbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHR5cGUgeyBTZW1WZXIgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHsgY29tcGFyZSB9IGZyb20gXCIuL2NvbXBhcmUudHNcIjtcblxuLyoqXG4gKiBHcmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gY29tcGFyaXNvblxuICpcbiAqIFRoaXMgaXMgZXF1YWwgdG8gYGNvbXBhcmUoczAsIHMxKSA+PSAwYC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlLCBncmVhdGVyT3JFcXVhbCB9IGZyb20gXCJAc3RkL3NlbXZlclwiO1xuICogaW1wb3J0IHsgYXNzZXJ0LCBhc3NlcnRGYWxzZSB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHMwID0gcGFyc2UoXCIxLjIuM1wiKTtcbiAqIGNvbnN0IHMxID0gcGFyc2UoXCIxLjIuNFwiKTtcbiAqIGFzc2VydChncmVhdGVyT3JFcXVhbChzMSwgczApKTtcbiAqIGFzc2VydEZhbHNlKGdyZWF0ZXJPckVxdWFsKHMwLCBzMSkpO1xuICogYXNzZXJ0KGdyZWF0ZXJPckVxdWFsKHMwLCBzMCkpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHMwIFRoZSBmaXJzdCB2ZXJzaW9uIHRvIGNvbXBhcmVcbiAqIEBwYXJhbSBzMSBUaGUgc2Vjb25kIHZlcnNpb24gdG8gY29tcGFyZVxuICogQHJldHVybnMgYHRydWVgIGlmIGBzMGAgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIGBzMWAsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncmVhdGVyT3JFcXVhbChzMDogU2VtVmVyLCBzMTogU2VtVmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb21wYXJlKHMwLCBzMSkgPj0gMDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsT0FBTyxRQUFRLGVBQWU7QUFFdkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0JDLEdBQ0QsT0FBTyxTQUFTLGVBQWUsRUFBVSxFQUFFLEVBQVU7RUFDbkQsT0FBTyxRQUFRLElBQUksT0FBTztBQUM1QiJ9
// denoCacheMetadata=16631736233626098484,18359154230297260197