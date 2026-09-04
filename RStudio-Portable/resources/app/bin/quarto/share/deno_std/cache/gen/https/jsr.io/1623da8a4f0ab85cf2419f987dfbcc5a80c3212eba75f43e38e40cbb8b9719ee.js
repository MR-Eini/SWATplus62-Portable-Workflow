// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { INVALID, MAX } from "./constants.ts";
import { satisfies } from "./satisfies.ts";
import { greaterThan } from "./greater_than.ts";
import { isWildcardComparator } from "./_shared.ts";
function comparatorMax(comparator) {
  const semver = comparator;
  if (isWildcardComparator(comparator)) return MAX;
  switch(comparator.operator){
    case "!=":
    case ">":
    case ">=":
      return MAX;
    case undefined:
    case "=":
    case "<=":
      return {
        major: semver.major,
        minor: semver.minor,
        patch: semver.patch,
        prerelease: semver.prerelease,
        build: semver.build
      };
    case "<":
      {
        const patch = semver.patch - 1;
        const minor = patch >= 0 ? semver.minor : semver.minor - 1;
        const major = minor >= 0 ? semver.major : semver.major - 1;
        // if you try to do <0.0.0 it will Give you -∞.∞.∞
        // which means no SemVer can compare successfully to it.
        if (major < 0) return INVALID;
        return {
          major,
          minor: minor >= 0 ? minor : Number.POSITIVE_INFINITY,
          patch: patch >= 0 ? patch : Number.POSITIVE_INFINITY,
          prerelease: [],
          build: []
        };
      }
  }
}
/**
 * The maximum valid SemVer for a given range or INVALID
 *
 * @example Usage
 * ```ts
 * import { parseRange } from "@std/semver/parse-range";
 * import { rangeMax } from "@std/semver/range-max";
 * import { equals } from "@std/semver/equals";
 * import { assert } from "@std/assert/assert";
 *
 * assert(equals(rangeMax(parseRange(">1.0.0 <=2.0.0")), { major: 2, minor: 0, patch: 0 }));
 * ```
 *
 * @param range The range to calculate the max for
 * @returns A valid SemVer or INVALID
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode greaterThanRange} or
 * {@linkcode lessThanRange} for comparing ranges and SemVers. The maximum
 * version of a range is often not well defined, and therefore this API
 * shouldn't be used. See
 * {@link https://github.com/denoland/deno_std/issues/4365} for details.
 */ export function rangeMax(range) {
  let max;
  for (const comparators of range){
    for (const comparator of comparators){
      const candidate = comparatorMax(comparator);
      if (!satisfies(candidate, range)) continue;
      max = max && greaterThan(max, candidate) ? max : candidate;
    }
  }
  return max ?? INVALID;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvcmFuZ2VfbWF4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBJTlZBTElELCBNQVggfSBmcm9tIFwiLi9jb25zdGFudHMudHNcIjtcbmltcG9ydCB7IHNhdGlzZmllcyB9IGZyb20gXCIuL3NhdGlzZmllcy50c1wiO1xuaW1wb3J0IHR5cGUgeyBDb21wYXJhdG9yLCBSYW5nZSwgU2VtVmVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IGdyZWF0ZXJUaGFuIH0gZnJvbSBcIi4vZ3JlYXRlcl90aGFuLnRzXCI7XG5pbXBvcnQgeyBpc1dpbGRjYXJkQ29tcGFyYXRvciB9IGZyb20gXCIuL19zaGFyZWQudHNcIjtcblxuZnVuY3Rpb24gY29tcGFyYXRvck1heChjb21wYXJhdG9yOiBDb21wYXJhdG9yKTogU2VtVmVyIHtcbiAgY29uc3Qgc2VtdmVyID0gY29tcGFyYXRvcjtcbiAgaWYgKGlzV2lsZGNhcmRDb21wYXJhdG9yKGNvbXBhcmF0b3IpKSByZXR1cm4gTUFYO1xuICBzd2l0Y2ggKGNvbXBhcmF0b3Iub3BlcmF0b3IpIHtcbiAgICBjYXNlIFwiIT1cIjpcbiAgICBjYXNlIFwiPlwiOlxuICAgIGNhc2UgXCI+PVwiOlxuICAgICAgcmV0dXJuIE1BWDtcbiAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICBjYXNlIFwiPVwiOlxuICAgIGNhc2UgXCI8PVwiOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWFqb3I6IHNlbXZlci5tYWpvcixcbiAgICAgICAgbWlub3I6IHNlbXZlci5taW5vcixcbiAgICAgICAgcGF0Y2g6IHNlbXZlci5wYXRjaCxcbiAgICAgICAgcHJlcmVsZWFzZTogc2VtdmVyLnByZXJlbGVhc2UsXG4gICAgICAgIGJ1aWxkOiBzZW12ZXIuYnVpbGQsXG4gICAgICB9O1xuICAgIGNhc2UgXCI8XCI6IHtcbiAgICAgIGNvbnN0IHBhdGNoID0gc2VtdmVyLnBhdGNoIC0gMTtcbiAgICAgIGNvbnN0IG1pbm9yID0gcGF0Y2ggPj0gMCA/IHNlbXZlci5taW5vciA6IHNlbXZlci5taW5vciAtIDE7XG4gICAgICBjb25zdCBtYWpvciA9IG1pbm9yID49IDAgPyBzZW12ZXIubWFqb3IgOiBzZW12ZXIubWFqb3IgLSAxO1xuICAgICAgLy8gaWYgeW91IHRyeSB0byBkbyA8MC4wLjAgaXQgd2lsbCBHaXZlIHlvdSAt4oieLuKIni7iiJ5cbiAgICAgIC8vIHdoaWNoIG1lYW5zIG5vIFNlbVZlciBjYW4gY29tcGFyZSBzdWNjZXNzZnVsbHkgdG8gaXQuXG4gICAgICBpZiAobWFqb3IgPCAwKSByZXR1cm4gSU5WQUxJRDtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWFqb3IsXG4gICAgICAgIG1pbm9yOiBtaW5vciA+PSAwID8gbWlub3IgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgICAgIHBhdGNoOiBwYXRjaCA+PSAwID8gcGF0Y2ggOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgICAgIHByZXJlbGVhc2U6IFtdLFxuICAgICAgICBidWlsZDogW10sXG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRoZSBtYXhpbXVtIHZhbGlkIFNlbVZlciBmb3IgYSBnaXZlbiByYW5nZSBvciBJTlZBTElEXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZVJhbmdlIH0gZnJvbSBcIkBzdGQvc2VtdmVyL3BhcnNlLXJhbmdlXCI7XG4gKiBpbXBvcnQgeyByYW5nZU1heCB9IGZyb20gXCJAc3RkL3NlbXZlci9yYW5nZS1tYXhcIjtcbiAqIGltcG9ydCB7IGVxdWFscyB9IGZyb20gXCJAc3RkL3NlbXZlci9lcXVhbHNcIjtcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnQoZXF1YWxzKHJhbmdlTWF4KHBhcnNlUmFuZ2UoXCI+MS4wLjAgPD0yLjAuMFwiKSksIHsgbWFqb3I6IDIsIG1pbm9yOiAwLCBwYXRjaDogMCB9KSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gcmFuZ2UgVGhlIHJhbmdlIHRvIGNhbGN1bGF0ZSB0aGUgbWF4IGZvclxuICogQHJldHVybnMgQSB2YWxpZCBTZW1WZXIgb3IgSU5WQUxJRFxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2Uge0BsaW5rY29kZSBncmVhdGVyVGhhblJhbmdlfSBvclxuICoge0BsaW5rY29kZSBsZXNzVGhhblJhbmdlfSBmb3IgY29tcGFyaW5nIHJhbmdlcyBhbmQgU2VtVmVycy4gVGhlIG1heGltdW1cbiAqIHZlcnNpb24gb2YgYSByYW5nZSBpcyBvZnRlbiBub3Qgd2VsbCBkZWZpbmVkLCBhbmQgdGhlcmVmb3JlIHRoaXMgQVBJXG4gKiBzaG91bGRuJ3QgYmUgdXNlZC4gU2VlXG4gKiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2Rlbm9fc3RkL2lzc3Vlcy80MzY1fSBmb3IgZGV0YWlscy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmdlTWF4KHJhbmdlOiBSYW5nZSk6IFNlbVZlciB7XG4gIGxldCBtYXg7XG4gIGZvciAoY29uc3QgY29tcGFyYXRvcnMgb2YgcmFuZ2UpIHtcbiAgICBmb3IgKGNvbnN0IGNvbXBhcmF0b3Igb2YgY29tcGFyYXRvcnMpIHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZSA9IGNvbXBhcmF0b3JNYXgoY29tcGFyYXRvcik7XG4gICAgICBpZiAoIXNhdGlzZmllcyhjYW5kaWRhdGUsIHJhbmdlKSkgY29udGludWU7XG4gICAgICBtYXggPSAobWF4ICYmIGdyZWF0ZXJUaGFuKG1heCwgY2FuZGlkYXRlKSkgPyBtYXggOiBjYW5kaWRhdGU7XG4gICAgfVxuICB9XG4gIHJldHVybiBtYXggPz8gSU5WQUxJRDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBQ3JDLFNBQVMsT0FBTyxFQUFFLEdBQUcsUUFBUSxpQkFBaUI7QUFDOUMsU0FBUyxTQUFTLFFBQVEsaUJBQWlCO0FBRTNDLFNBQVMsV0FBVyxRQUFRLG9CQUFvQjtBQUNoRCxTQUFTLG9CQUFvQixRQUFRLGVBQWU7QUFFcEQsU0FBUyxjQUFjLFVBQXNCO0VBQzNDLE1BQU0sU0FBUztFQUNmLElBQUkscUJBQXFCLGFBQWEsT0FBTztFQUM3QyxPQUFRLFdBQVcsUUFBUTtJQUN6QixLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7TUFDSCxPQUFPO0lBQ1QsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO01BQ0gsT0FBTztRQUNMLE9BQU8sT0FBTyxLQUFLO1FBQ25CLE9BQU8sT0FBTyxLQUFLO1FBQ25CLE9BQU8sT0FBTyxLQUFLO1FBQ25CLFlBQVksT0FBTyxVQUFVO1FBQzdCLE9BQU8sT0FBTyxLQUFLO01BQ3JCO0lBQ0YsS0FBSztNQUFLO1FBQ1IsTUFBTSxRQUFRLE9BQU8sS0FBSyxHQUFHO1FBQzdCLE1BQU0sUUFBUSxTQUFTLElBQUksT0FBTyxLQUFLLEdBQUcsT0FBTyxLQUFLLEdBQUc7UUFDekQsTUFBTSxRQUFRLFNBQVMsSUFBSSxPQUFPLEtBQUssR0FBRyxPQUFPLEtBQUssR0FBRztRQUN6RCxrREFBa0Q7UUFDbEQsd0RBQXdEO1FBQ3hELElBQUksUUFBUSxHQUFHLE9BQU87UUFFdEIsT0FBTztVQUNMO1VBQ0EsT0FBTyxTQUFTLElBQUksUUFBUSxPQUFPLGlCQUFpQjtVQUNwRCxPQUFPLFNBQVMsSUFBSSxRQUFRLE9BQU8saUJBQWlCO1VBQ3BELFlBQVksRUFBRTtVQUNkLE9BQU8sRUFBRTtRQUNYO01BQ0Y7RUFDRjtBQUNGO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCQyxHQUNELE9BQU8sU0FBUyxTQUFTLEtBQVk7RUFDbkMsSUFBSTtFQUNKLEtBQUssTUFBTSxlQUFlLE1BQU87SUFDL0IsS0FBSyxNQUFNLGNBQWMsWUFBYTtNQUNwQyxNQUFNLFlBQVksY0FBYztNQUNoQyxJQUFJLENBQUMsVUFBVSxXQUFXLFFBQVE7TUFDbEMsTUFBTSxBQUFDLE9BQU8sWUFBWSxLQUFLLGFBQWMsTUFBTTtJQUNyRDtFQUNGO0VBQ0EsT0FBTyxPQUFPO0FBQ2hCIn0=
// denoCacheMetadata=16535098684222584072,8904842991708062234