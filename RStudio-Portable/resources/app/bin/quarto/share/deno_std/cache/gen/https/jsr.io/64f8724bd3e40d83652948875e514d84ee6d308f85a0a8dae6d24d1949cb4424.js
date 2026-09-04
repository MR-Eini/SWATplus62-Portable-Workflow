// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { INVALID, MAX, MIN } from "./constants.ts";
import { satisfies } from "./satisfies.ts";
import { lessThan } from "./less_than.ts";
import { greaterThan } from "./greater_than.ts";
import { increment } from "./increment.ts";
import { isWildcardComparator } from "./_shared.ts";
function comparatorMin(comparator) {
  const semver = comparator;
  if (isWildcardComparator(semver)) return MIN;
  switch(comparator.operator){
    case ">":
      return semver.prerelease && semver.prerelease.length > 0 ? increment(semver, "pre") : increment(semver, "patch");
    case "!=":
    case "<=":
    case "<":
      // The min(<0.0.0) is MAX
      return greaterThan(semver, MIN) ? MIN : MAX;
    case ">=":
    case undefined:
    case "=":
      return {
        major: semver.major,
        minor: semver.minor,
        patch: semver.patch,
        prerelease: semver.prerelease,
        build: semver.build
      };
  }
}
/**
 * The minimum valid SemVer for a given range or INVALID
 *
 * @example Usage
 * ```ts
 * import { parseRange } from "@std/semver/parse-range";
 * import { rangeMin } from "@std/semver/range-min";
 * import { equals } from "@std/semver/equals";
 * import { assert } from "@std/assert/assert";
 *
 * assert(equals(rangeMin(parseRange(">=1.0.0 <2.0.0")), { major: 1, minor: 0, patch: 0 }));
 * ```
 *
 * @param range The range to calculate the min for
 * @returns A valid SemVer or INVALID
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode greaterThanRange} or
 * {@linkcode lessThanRange} for comparing ranges and SemVers. The minimum
 * version of a range is often not well defined, and therefore this API
 * shouldn't be used. See
 * {@link https://github.com/denoland/deno_std/issues/4365} for details.
 */ export function rangeMin(range) {
  let min;
  for (const comparators of range){
    for (const comparator of comparators){
      const candidate = comparatorMin(comparator);
      if (!satisfies(candidate, range)) continue;
      min = min && lessThan(min, candidate) ? min : candidate;
    }
  }
  return min ?? INVALID;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvcmFuZ2VfbWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBJTlZBTElELCBNQVgsIE1JTiB9IGZyb20gXCIuL2NvbnN0YW50cy50c1wiO1xuaW1wb3J0IHsgc2F0aXNmaWVzIH0gZnJvbSBcIi4vc2F0aXNmaWVzLnRzXCI7XG5pbXBvcnQgdHlwZSB7IENvbXBhcmF0b3IsIFJhbmdlLCBTZW1WZXIgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHsgbGVzc1RoYW4gfSBmcm9tIFwiLi9sZXNzX3RoYW4udHNcIjtcbmltcG9ydCB7IGdyZWF0ZXJUaGFuIH0gZnJvbSBcIi4vZ3JlYXRlcl90aGFuLnRzXCI7XG5pbXBvcnQgeyBpbmNyZW1lbnQgfSBmcm9tIFwiLi9pbmNyZW1lbnQudHNcIjtcbmltcG9ydCB7IGlzV2lsZGNhcmRDb21wYXJhdG9yIH0gZnJvbSBcIi4vX3NoYXJlZC50c1wiO1xuXG5mdW5jdGlvbiBjb21wYXJhdG9yTWluKGNvbXBhcmF0b3I6IENvbXBhcmF0b3IpOiBTZW1WZXIge1xuICBjb25zdCBzZW12ZXIgPSBjb21wYXJhdG9yO1xuICBpZiAoaXNXaWxkY2FyZENvbXBhcmF0b3Ioc2VtdmVyKSkgcmV0dXJuIE1JTjtcbiAgc3dpdGNoIChjb21wYXJhdG9yLm9wZXJhdG9yKSB7XG4gICAgY2FzZSBcIj5cIjpcbiAgICAgIHJldHVybiBzZW12ZXIucHJlcmVsZWFzZSAmJiBzZW12ZXIucHJlcmVsZWFzZS5sZW5ndGggPiAwXG4gICAgICAgID8gaW5jcmVtZW50KHNlbXZlciwgXCJwcmVcIilcbiAgICAgICAgOiBpbmNyZW1lbnQoc2VtdmVyLCBcInBhdGNoXCIpO1xuICAgIGNhc2UgXCIhPVwiOlxuICAgIGNhc2UgXCI8PVwiOlxuICAgIGNhc2UgXCI8XCI6XG4gICAgICAvLyBUaGUgbWluKDwwLjAuMCkgaXMgTUFYXG4gICAgICByZXR1cm4gZ3JlYXRlclRoYW4oc2VtdmVyLCBNSU4pID8gTUlOIDogTUFYO1xuICAgIGNhc2UgXCI+PVwiOlxuICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgIGNhc2UgXCI9XCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYWpvcjogc2VtdmVyLm1ham9yLFxuICAgICAgICBtaW5vcjogc2VtdmVyLm1pbm9yLFxuICAgICAgICBwYXRjaDogc2VtdmVyLnBhdGNoLFxuICAgICAgICBwcmVyZWxlYXNlOiBzZW12ZXIucHJlcmVsZWFzZSxcbiAgICAgICAgYnVpbGQ6IHNlbXZlci5idWlsZCxcbiAgICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgbWluaW11bSB2YWxpZCBTZW1WZXIgZm9yIGEgZ2l2ZW4gcmFuZ2Ugb3IgSU5WQUxJRFxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcGFyc2VSYW5nZSB9IGZyb20gXCJAc3RkL3NlbXZlci9wYXJzZS1yYW5nZVwiO1xuICogaW1wb3J0IHsgcmFuZ2VNaW4gfSBmcm9tIFwiQHN0ZC9zZW12ZXIvcmFuZ2UtbWluXCI7XG4gKiBpbXBvcnQgeyBlcXVhbHMgfSBmcm9tIFwiQHN0ZC9zZW12ZXIvZXF1YWxzXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0KGVxdWFscyhyYW5nZU1pbihwYXJzZVJhbmdlKFwiPj0xLjAuMCA8Mi4wLjBcIikpLCB7IG1ham9yOiAxLCBtaW5vcjogMCwgcGF0Y2g6IDAgfSkpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHJhbmdlIFRoZSByYW5nZSB0byBjYWxjdWxhdGUgdGhlIG1pbiBmb3JcbiAqIEByZXR1cm5zIEEgdmFsaWQgU2VtVmVyIG9yIElOVkFMSURcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHtAbGlua2NvZGUgZ3JlYXRlclRoYW5SYW5nZX0gb3JcbiAqIHtAbGlua2NvZGUgbGVzc1RoYW5SYW5nZX0gZm9yIGNvbXBhcmluZyByYW5nZXMgYW5kIFNlbVZlcnMuIFRoZSBtaW5pbXVtXG4gKiB2ZXJzaW9uIG9mIGEgcmFuZ2UgaXMgb2Z0ZW4gbm90IHdlbGwgZGVmaW5lZCwgYW5kIHRoZXJlZm9yZSB0aGlzIEFQSVxuICogc2hvdWxkbid0IGJlIHVzZWQuIFNlZVxuICoge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9kZW5vbGFuZC9kZW5vX3N0ZC9pc3N1ZXMvNDM2NX0gZm9yIGRldGFpbHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5nZU1pbihyYW5nZTogUmFuZ2UpOiBTZW1WZXIge1xuICBsZXQgbWluO1xuICBmb3IgKGNvbnN0IGNvbXBhcmF0b3JzIG9mIHJhbmdlKSB7XG4gICAgZm9yIChjb25zdCBjb21wYXJhdG9yIG9mIGNvbXBhcmF0b3JzKSB7XG4gICAgICBjb25zdCBjYW5kaWRhdGUgPSBjb21wYXJhdG9yTWluKGNvbXBhcmF0b3IpO1xuICAgICAgaWYgKCFzYXRpc2ZpZXMoY2FuZGlkYXRlLCByYW5nZSkpIGNvbnRpbnVlO1xuICAgICAgbWluID0gKG1pbiAmJiBsZXNzVGhhbihtaW4sIGNhbmRpZGF0ZSkpID8gbWluIDogY2FuZGlkYXRlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbWluID8/IElOVkFMSUQ7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUNyQyxTQUFTLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxRQUFRLGlCQUFpQjtBQUNuRCxTQUFTLFNBQVMsUUFBUSxpQkFBaUI7QUFFM0MsU0FBUyxRQUFRLFFBQVEsaUJBQWlCO0FBQzFDLFNBQVMsV0FBVyxRQUFRLG9CQUFvQjtBQUNoRCxTQUFTLFNBQVMsUUFBUSxpQkFBaUI7QUFDM0MsU0FBUyxvQkFBb0IsUUFBUSxlQUFlO0FBRXBELFNBQVMsY0FBYyxVQUFzQjtFQUMzQyxNQUFNLFNBQVM7RUFDZixJQUFJLHFCQUFxQixTQUFTLE9BQU87RUFDekMsT0FBUSxXQUFXLFFBQVE7SUFDekIsS0FBSztNQUNILE9BQU8sT0FBTyxVQUFVLElBQUksT0FBTyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQ25ELFVBQVUsUUFBUSxTQUNsQixVQUFVLFFBQVE7SUFDeEIsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO01BQ0gseUJBQXlCO01BQ3pCLE9BQU8sWUFBWSxRQUFRLE9BQU8sTUFBTTtJQUMxQyxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7TUFDSCxPQUFPO1FBQ0wsT0FBTyxPQUFPLEtBQUs7UUFDbkIsT0FBTyxPQUFPLEtBQUs7UUFDbkIsT0FBTyxPQUFPLEtBQUs7UUFDbkIsWUFBWSxPQUFPLFVBQVU7UUFDN0IsT0FBTyxPQUFPLEtBQUs7TUFDckI7RUFDSjtBQUNGO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCQyxHQUNELE9BQU8sU0FBUyxTQUFTLEtBQVk7RUFDbkMsSUFBSTtFQUNKLEtBQUssTUFBTSxlQUFlLE1BQU87SUFDL0IsS0FBSyxNQUFNLGNBQWMsWUFBYTtNQUNwQyxNQUFNLFlBQVksY0FBYztNQUNoQyxJQUFJLENBQUMsVUFBVSxXQUFXLFFBQVE7TUFDbEMsTUFBTSxBQUFDLE9BQU8sU0FBUyxLQUFLLGFBQWMsTUFBTTtJQUNsRDtFQUNGO0VBQ0EsT0FBTyxPQUFPO0FBQ2hCIn0=
// denoCacheMetadata=15024519019190563679,7482769262399297301