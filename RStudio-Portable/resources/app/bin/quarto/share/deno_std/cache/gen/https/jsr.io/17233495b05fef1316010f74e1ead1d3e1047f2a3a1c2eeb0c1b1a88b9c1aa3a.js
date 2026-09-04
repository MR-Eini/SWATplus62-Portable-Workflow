// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { parseBuild, parseNumber, parsePrerelease } from "./_shared.ts";
import { FULL_REGEXP, MAX_LENGTH } from "./_shared.ts";
/**
 * Attempt to parse a string as a semantic version, returning either a `SemVer`
 * object or throws a TypeError.
 *
 * @example Usage
 * ```ts
 * import { parse } from "@std/semver/parse";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const version = parse("1.2.3");
 * assertEquals(version, {
 *   major: 1,
 *   minor: 2,
 *   patch: 3,
 *   prerelease: [],
 *   build: [],
 * });
 * ```
 *
 * @param version The version string to parse
 * @returns A valid SemVer
 */ export function parse(version) {
  if (typeof version !== "string") {
    throw new TypeError(`version must be a string`);
  }
  if (version.length > MAX_LENGTH) {
    throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
  }
  version = version.trim();
  const groups = version.match(FULL_REGEXP)?.groups;
  if (!groups) throw new TypeError(`Invalid Version: ${version}`);
  const major = parseNumber(groups.major, "Invalid major version");
  const minor = parseNumber(groups.minor, "Invalid minor version");
  const patch = parseNumber(groups.patch, "Invalid patch version");
  const prerelease = groups.prerelease ? parsePrerelease(groups.prerelease) : [];
  const build = groups.buildmetadata ? parseBuild(groups.buildmetadata) : [];
  return {
    major,
    minor,
    patch,
    prerelease,
    build
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvcGFyc2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB0eXBlIHsgU2VtVmVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IHBhcnNlQnVpbGQsIHBhcnNlTnVtYmVyLCBwYXJzZVByZXJlbGVhc2UgfSBmcm9tIFwiLi9fc2hhcmVkLnRzXCI7XG5pbXBvcnQgeyBGVUxMX1JFR0VYUCwgTUFYX0xFTkdUSCB9IGZyb20gXCIuL19zaGFyZWQudHNcIjtcblxuLyoqXG4gKiBBdHRlbXB0IHRvIHBhcnNlIGEgc3RyaW5nIGFzIGEgc2VtYW50aWMgdmVyc2lvbiwgcmV0dXJuaW5nIGVpdGhlciBhIGBTZW1WZXJgXG4gKiBvYmplY3Qgb3IgdGhyb3dzIGEgVHlwZUVycm9yLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcGFyc2UgfSBmcm9tIFwiQHN0ZC9zZW12ZXIvcGFyc2VcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgdmVyc2lvbiA9IHBhcnNlKFwiMS4yLjNcIik7XG4gKiBhc3NlcnRFcXVhbHModmVyc2lvbiwge1xuICogICBtYWpvcjogMSxcbiAqICAgbWlub3I6IDIsXG4gKiAgIHBhdGNoOiAzLFxuICogICBwcmVyZWxlYXNlOiBbXSxcbiAqICAgYnVpbGQ6IFtdLFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gdmVyc2lvbiBUaGUgdmVyc2lvbiBzdHJpbmcgdG8gcGFyc2VcbiAqIEByZXR1cm5zIEEgdmFsaWQgU2VtVmVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZSh2ZXJzaW9uOiBzdHJpbmcpOiBTZW1WZXIge1xuICBpZiAodHlwZW9mIHZlcnNpb24gIT09IFwic3RyaW5nXCIpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgYHZlcnNpb24gbXVzdCBiZSBhIHN0cmluZ2AsXG4gICAgKTtcbiAgfVxuXG4gIGlmICh2ZXJzaW9uLmxlbmd0aCA+IE1BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgYHZlcnNpb24gaXMgbG9uZ2VyIHRoYW4gJHtNQVhfTEVOR1RIfSBjaGFyYWN0ZXJzYCxcbiAgICApO1xuICB9XG5cbiAgdmVyc2lvbiA9IHZlcnNpb24udHJpbSgpO1xuXG4gIGNvbnN0IGdyb3VwcyA9IHZlcnNpb24ubWF0Y2goRlVMTF9SRUdFWFApPy5ncm91cHM7XG4gIGlmICghZ3JvdXBzKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIFZlcnNpb246ICR7dmVyc2lvbn1gKTtcblxuICBjb25zdCBtYWpvciA9IHBhcnNlTnVtYmVyKGdyb3Vwcy5tYWpvciEsIFwiSW52YWxpZCBtYWpvciB2ZXJzaW9uXCIpO1xuICBjb25zdCBtaW5vciA9IHBhcnNlTnVtYmVyKGdyb3Vwcy5taW5vciEsIFwiSW52YWxpZCBtaW5vciB2ZXJzaW9uXCIpO1xuICBjb25zdCBwYXRjaCA9IHBhcnNlTnVtYmVyKGdyb3Vwcy5wYXRjaCEsIFwiSW52YWxpZCBwYXRjaCB2ZXJzaW9uXCIpO1xuXG4gIGNvbnN0IHByZXJlbGVhc2UgPSBncm91cHMucHJlcmVsZWFzZVxuICAgID8gcGFyc2VQcmVyZWxlYXNlKGdyb3Vwcy5wcmVyZWxlYXNlKVxuICAgIDogW107XG4gIGNvbnN0IGJ1aWxkID0gZ3JvdXBzLmJ1aWxkbWV0YWRhdGEgPyBwYXJzZUJ1aWxkKGdyb3Vwcy5idWlsZG1ldGFkYXRhKSA6IFtdO1xuXG4gIHJldHVybiB7XG4gICAgbWFqb3IsXG4gICAgbWlub3IsXG4gICAgcGF0Y2gsXG4gICAgcHJlcmVsZWFzZSxcbiAgICBidWlsZCxcbiAgfTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsVUFBVSxFQUFFLFdBQVcsRUFBRSxlQUFlLFFBQVEsZUFBZTtBQUN4RSxTQUFTLFdBQVcsRUFBRSxVQUFVLFFBQVEsZUFBZTtBQUV2RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBcUJDLEdBQ0QsT0FBTyxTQUFTLE1BQU0sT0FBZTtFQUNuQyxJQUFJLE9BQU8sWUFBWSxVQUFVO0lBQy9CLE1BQU0sSUFBSSxVQUNSLENBQUMsd0JBQXdCLENBQUM7RUFFOUI7RUFFQSxJQUFJLFFBQVEsTUFBTSxHQUFHLFlBQVk7SUFDL0IsTUFBTSxJQUFJLFVBQ1IsQ0FBQyx1QkFBdUIsRUFBRSxXQUFXLFdBQVcsQ0FBQztFQUVyRDtFQUVBLFVBQVUsUUFBUSxJQUFJO0VBRXRCLE1BQU0sU0FBUyxRQUFRLEtBQUssQ0FBQyxjQUFjO0VBQzNDLElBQUksQ0FBQyxRQUFRLE1BQU0sSUFBSSxVQUFVLENBQUMsaUJBQWlCLEVBQUUsU0FBUztFQUU5RCxNQUFNLFFBQVEsWUFBWSxPQUFPLEtBQUssRUFBRztFQUN6QyxNQUFNLFFBQVEsWUFBWSxPQUFPLEtBQUssRUFBRztFQUN6QyxNQUFNLFFBQVEsWUFBWSxPQUFPLEtBQUssRUFBRztFQUV6QyxNQUFNLGFBQWEsT0FBTyxVQUFVLEdBQ2hDLGdCQUFnQixPQUFPLFVBQVUsSUFDakMsRUFBRTtFQUNOLE1BQU0sUUFBUSxPQUFPLGFBQWEsR0FBRyxXQUFXLE9BQU8sYUFBYSxJQUFJLEVBQUU7RUFFMUUsT0FBTztJQUNMO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7RUFDRjtBQUNGIn0=
// denoCacheMetadata=15807965135598969035,11128079024993104841