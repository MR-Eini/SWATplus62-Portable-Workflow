// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { compare } from "./compare.ts";
/**
 * Less than comparison
 *
 * This is equal to `compare(s0, s1) < 0`.
 *
 * @example Usage
 * ```ts
 * import { parse, lessThan } from "@std/semver";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const s0 = parse("1.2.3");
 * const s1 = parse("1.2.4");
 * assert(lessThan(s0, s1));
 * assertFalse(lessThan(s1, s0));
 * assertFalse(lessThan(s0, s0));
 * ```
 *
 * @param s0 the first version to compare
 * @param s1 the second version to compare
 * @returns `true` if `s0` is less than `s1`, `false` otherwise
 */ export function lessThan(s0, s1) {
  return compare(s0, s1) < 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvbGVzc190aGFuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgdHlwZSB7IFNlbVZlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBjb21wYXJlIH0gZnJvbSBcIi4vY29tcGFyZS50c1wiO1xuXG4vKipcbiAqIExlc3MgdGhhbiBjb21wYXJpc29uXG4gKlxuICogVGhpcyBpcyBlcXVhbCB0byBgY29tcGFyZShzMCwgczEpIDwgMGAuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZSwgbGVzc1RoYW4gfSBmcm9tIFwiQHN0ZC9zZW12ZXJcIjtcbiAqIGltcG9ydCB7IGFzc2VydCwgYXNzZXJ0RmFsc2UgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCBzMCA9IHBhcnNlKFwiMS4yLjNcIik7XG4gKiBjb25zdCBzMSA9IHBhcnNlKFwiMS4yLjRcIik7XG4gKiBhc3NlcnQobGVzc1RoYW4oczAsIHMxKSk7XG4gKiBhc3NlcnRGYWxzZShsZXNzVGhhbihzMSwgczApKTtcbiAqIGFzc2VydEZhbHNlKGxlc3NUaGFuKHMwLCBzMCkpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHMwIHRoZSBmaXJzdCB2ZXJzaW9uIHRvIGNvbXBhcmVcbiAqIEBwYXJhbSBzMSB0aGUgc2Vjb25kIHZlcnNpb24gdG8gY29tcGFyZVxuICogQHJldHVybnMgYHRydWVgIGlmIGBzMGAgaXMgbGVzcyB0aGFuIGBzMWAsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXNzVGhhbihzMDogU2VtVmVyLCBzMTogU2VtVmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb21wYXJlKHMwLCBzMSkgPCAwO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxPQUFPLFFBQVEsZUFBZTtBQUV2Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvQkMsR0FDRCxPQUFPLFNBQVMsU0FBUyxFQUFVLEVBQUUsRUFBVTtFQUM3QyxPQUFPLFFBQVEsSUFBSSxNQUFNO0FBQzNCIn0=
// denoCacheMetadata=10908125522260957758,16644637713621732225