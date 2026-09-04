// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { compare } from "./compare.ts";
/**
 * Less than or equal to comparison
 *
 * This is equal to `compare(s0, s1) <= 0`.
 *
 * @example Usage
 * ```ts
 * import { parse, lessOrEqual } from "@std/semver";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const s0 = parse("1.2.3");
 * const s1 = parse("1.2.4");
 * assert(lessOrEqual(s0, s1));
 * assertFalse(lessOrEqual(s1, s0));
 * assert(lessOrEqual(s0, s0));
 * ```
 *
 * @param s0 the first version to compare
 * @param s1 the second version to compare
 * @returns `true` if `s0` is less than or equal to `s1`, `false` otherwise
 */ export function lessOrEqual(s0, s1) {
  return compare(s0, s1) <= 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvbGVzc19vcl9lcXVhbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHR5cGUgeyBTZW1WZXIgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHsgY29tcGFyZSB9IGZyb20gXCIuL2NvbXBhcmUudHNcIjtcblxuLyoqXG4gKiBMZXNzIHRoYW4gb3IgZXF1YWwgdG8gY29tcGFyaXNvblxuICpcbiAqIFRoaXMgaXMgZXF1YWwgdG8gYGNvbXBhcmUoczAsIHMxKSA8PSAwYC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlLCBsZXNzT3JFcXVhbCB9IGZyb20gXCJAc3RkL3NlbXZlclwiO1xuICogaW1wb3J0IHsgYXNzZXJ0LCBhc3NlcnRGYWxzZSB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHMwID0gcGFyc2UoXCIxLjIuM1wiKTtcbiAqIGNvbnN0IHMxID0gcGFyc2UoXCIxLjIuNFwiKTtcbiAqIGFzc2VydChsZXNzT3JFcXVhbChzMCwgczEpKTtcbiAqIGFzc2VydEZhbHNlKGxlc3NPckVxdWFsKHMxLCBzMCkpO1xuICogYXNzZXJ0KGxlc3NPckVxdWFsKHMwLCBzMCkpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHMwIHRoZSBmaXJzdCB2ZXJzaW9uIHRvIGNvbXBhcmVcbiAqIEBwYXJhbSBzMSB0aGUgc2Vjb25kIHZlcnNpb24gdG8gY29tcGFyZVxuICogQHJldHVybnMgYHRydWVgIGlmIGBzMGAgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGBzMWAsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXNzT3JFcXVhbChzMDogU2VtVmVyLCBzMTogU2VtVmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb21wYXJlKHMwLCBzMSkgPD0gMDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsT0FBTyxRQUFRLGVBQWU7QUFFdkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0JDLEdBQ0QsT0FBTyxTQUFTLFlBQVksRUFBVSxFQUFFLEVBQVU7RUFDaEQsT0FBTyxRQUFRLElBQUksT0FBTztBQUM1QiJ9
// denoCacheMetadata=4469307251554745688,2288247002227092901