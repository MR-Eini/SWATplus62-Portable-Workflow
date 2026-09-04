// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWildcardComparator } from "./_shared.ts";
function formatNumber(value) {
  if (value === Number.POSITIVE_INFINITY) {
    return "∞";
  } else if (value === Number.NEGATIVE_INFINITY) {
    return "⧞";
  } else {
    return value.toFixed(0);
  }
}
/**
 * Format a SemVer object into a string.
 *
 * If any number is NaN then NaN will be printed.
 *
 * If any number is positive or negative infinity then '∞' or '⧞' will be printed instead.
 *
 * @example Usage
 * ```ts
 * import { format } from "@std/semver/format";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const semver = {
 *   major: 1,
 *   minor: 2,
 *   patch: 3,
 * };
 * assertEquals(format(semver), "1.2.3");
 * ```
 *
 * @param semver The SemVer to format
 * @returns The string representation of a semantic version.
 */ export function format(semver) {
  if (isWildcardComparator(semver)) {
    return "*";
  }
  const major = formatNumber(semver.major);
  const minor = formatNumber(semver.minor);
  const patch = formatNumber(semver.patch);
  const pre = semver.prerelease?.join(".") ?? "";
  const build = semver.build?.join(".") ?? "";
  const primary = `${major}.${minor}.${patch}`;
  const release = [
    primary,
    pre
  ].filter((v)=>v).join("-");
  return [
    release,
    build
  ].filter((v)=>v).join("+");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvZm9ybWF0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgdHlwZSB7IFNlbVZlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBpc1dpbGRjYXJkQ29tcGFyYXRvciB9IGZyb20gXCIuL19zaGFyZWQudHNcIjtcblxuZnVuY3Rpb24gZm9ybWF0TnVtYmVyKHZhbHVlOiBudW1iZXIpIHtcbiAgaWYgKHZhbHVlID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICByZXR1cm4gXCLiiJ5cIjtcbiAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKSB7XG4gICAgcmV0dXJuIFwi4qeeXCI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvRml4ZWQoMCk7XG4gIH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgYSBTZW1WZXIgb2JqZWN0IGludG8gYSBzdHJpbmcuXG4gKlxuICogSWYgYW55IG51bWJlciBpcyBOYU4gdGhlbiBOYU4gd2lsbCBiZSBwcmludGVkLlxuICpcbiAqIElmIGFueSBudW1iZXIgaXMgcG9zaXRpdmUgb3IgbmVnYXRpdmUgaW5maW5pdHkgdGhlbiAn4oieJyBvciAn4qeeJyB3aWxsIGJlIHByaW50ZWQgaW5zdGVhZC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGZvcm1hdCB9IGZyb20gXCJAc3RkL3NlbXZlci9mb3JtYXRcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgc2VtdmVyID0ge1xuICogICBtYWpvcjogMSxcbiAqICAgbWlub3I6IDIsXG4gKiAgIHBhdGNoOiAzLFxuICogfTtcbiAqIGFzc2VydEVxdWFscyhmb3JtYXQoc2VtdmVyKSwgXCIxLjIuM1wiKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzZW12ZXIgVGhlIFNlbVZlciB0byBmb3JtYXRcbiAqIEByZXR1cm5zIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBzZW1hbnRpYyB2ZXJzaW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0KHNlbXZlcjogU2VtVmVyKTogc3RyaW5nIHtcbiAgaWYgKGlzV2lsZGNhcmRDb21wYXJhdG9yKHNlbXZlcikpIHtcbiAgICByZXR1cm4gXCIqXCI7XG4gIH1cblxuICBjb25zdCBtYWpvciA9IGZvcm1hdE51bWJlcihzZW12ZXIubWFqb3IpO1xuICBjb25zdCBtaW5vciA9IGZvcm1hdE51bWJlcihzZW12ZXIubWlub3IpO1xuICBjb25zdCBwYXRjaCA9IGZvcm1hdE51bWJlcihzZW12ZXIucGF0Y2gpO1xuICBjb25zdCBwcmUgPSBzZW12ZXIucHJlcmVsZWFzZT8uam9pbihcIi5cIikgPz8gXCJcIjtcbiAgY29uc3QgYnVpbGQgPSBzZW12ZXIuYnVpbGQ/LmpvaW4oXCIuXCIpID8/IFwiXCI7XG5cbiAgY29uc3QgcHJpbWFyeSA9IGAke21ham9yfS4ke21pbm9yfS4ke3BhdGNofWA7XG4gIGNvbnN0IHJlbGVhc2UgPSBbcHJpbWFyeSwgcHJlXS5maWx0ZXIoKHYpID0+IHYpLmpvaW4oXCItXCIpO1xuICByZXR1cm4gW3JlbGVhc2UsIGJ1aWxkXS5maWx0ZXIoKHYpID0+IHYpLmpvaW4oXCIrXCIpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxvQkFBb0IsUUFBUSxlQUFlO0FBRXBELFNBQVMsYUFBYSxLQUFhO0VBQ2pDLElBQUksVUFBVSxPQUFPLGlCQUFpQixFQUFFO0lBQ3RDLE9BQU87RUFDVCxPQUFPLElBQUksVUFBVSxPQUFPLGlCQUFpQixFQUFFO0lBQzdDLE9BQU87RUFDVCxPQUFPO0lBQ0wsT0FBTyxNQUFNLE9BQU8sQ0FBQztFQUN2QjtBQUNGO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FzQkMsR0FDRCxPQUFPLFNBQVMsT0FBTyxNQUFjO0VBQ25DLElBQUkscUJBQXFCLFNBQVM7SUFDaEMsT0FBTztFQUNUO0VBRUEsTUFBTSxRQUFRLGFBQWEsT0FBTyxLQUFLO0VBQ3ZDLE1BQU0sUUFBUSxhQUFhLE9BQU8sS0FBSztFQUN2QyxNQUFNLFFBQVEsYUFBYSxPQUFPLEtBQUs7RUFDdkMsTUFBTSxNQUFNLE9BQU8sVUFBVSxFQUFFLEtBQUssUUFBUTtFQUM1QyxNQUFNLFFBQVEsT0FBTyxLQUFLLEVBQUUsS0FBSyxRQUFRO0VBRXpDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFLE9BQU87RUFDNUMsTUFBTSxVQUFVO0lBQUM7SUFBUztHQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBTSxHQUFHLElBQUksQ0FBQztFQUNyRCxPQUFPO0lBQUM7SUFBUztHQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBTSxHQUFHLElBQUksQ0FBQztBQUNoRCJ9
// denoCacheMetadata=12543858333194599593,4011825140090793401