// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { parseMediaType } from "./parse_media_type.ts";
import { db } from "./_db.ts";
/**
 * Given a media type or header value, identify the encoding charset. If the
 * charset cannot be determined, the function returns `undefined`.
 *
 * @param type The media type or header value to get the charset for.
 *
 * @returns The charset for the given media type or header value, or `undefined`
 * if the charset cannot be determined.
 *
 * @example Usage
 * ```ts
 * import { getCharset } from "@std/media-types/get-charset";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(getCharset("text/plain"), "UTF-8");
 * assertEquals(getCharset("application/foo"), undefined);
 * assertEquals(getCharset("application/news-checkgroups"), "US-ASCII");
 * assertEquals(getCharset("application/news-checkgroups; charset=UTF-8"), "UTF-8");
 * ```
 */ export function getCharset(type) {
  try {
    const [mediaType, params] = parseMediaType(type);
    if (params?.charset) {
      return params.charset;
    }
    const entry = db[mediaType];
    if (entry?.charset) {
      return entry.charset;
    }
    if (mediaType.startsWith("text/")) {
      return "UTF-8";
    }
  } catch  {
  // just swallow errors, returning undefined
  }
  return undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMC4yMjQuMS9nZXRfY2hhcnNldC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBwYXJzZU1lZGlhVHlwZSB9IGZyb20gXCIuL3BhcnNlX21lZGlhX3R5cGUudHNcIjtcbmltcG9ydCB0eXBlIHsgREJFbnRyeSB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5pbXBvcnQgeyBkYiwgdHlwZSBLZXlPZkRiIH0gZnJvbSBcIi4vX2RiLnRzXCI7XG5cbi8qKlxuICogR2l2ZW4gYSBtZWRpYSB0eXBlIG9yIGhlYWRlciB2YWx1ZSwgaWRlbnRpZnkgdGhlIGVuY29kaW5nIGNoYXJzZXQuIElmIHRoZVxuICogY2hhcnNldCBjYW5ub3QgYmUgZGV0ZXJtaW5lZCwgdGhlIGZ1bmN0aW9uIHJldHVybnMgYHVuZGVmaW5lZGAuXG4gKlxuICogQHBhcmFtIHR5cGUgVGhlIG1lZGlhIHR5cGUgb3IgaGVhZGVyIHZhbHVlIHRvIGdldCB0aGUgY2hhcnNldCBmb3IuXG4gKlxuICogQHJldHVybnMgVGhlIGNoYXJzZXQgZm9yIHRoZSBnaXZlbiBtZWRpYSB0eXBlIG9yIGhlYWRlciB2YWx1ZSwgb3IgYHVuZGVmaW5lZGBcbiAqIGlmIHRoZSBjaGFyc2V0IGNhbm5vdCBiZSBkZXRlcm1pbmVkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZ2V0Q2hhcnNldCB9IGZyb20gXCJAc3RkL21lZGlhLXR5cGVzL2dldC1jaGFyc2V0XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGFzc2VydEVxdWFscyhnZXRDaGFyc2V0KFwidGV4dC9wbGFpblwiKSwgXCJVVEYtOFwiKTtcbiAqIGFzc2VydEVxdWFscyhnZXRDaGFyc2V0KFwiYXBwbGljYXRpb24vZm9vXCIpLCB1bmRlZmluZWQpO1xuICogYXNzZXJ0RXF1YWxzKGdldENoYXJzZXQoXCJhcHBsaWNhdGlvbi9uZXdzLWNoZWNrZ3JvdXBzXCIpLCBcIlVTLUFTQ0lJXCIpO1xuICogYXNzZXJ0RXF1YWxzKGdldENoYXJzZXQoXCJhcHBsaWNhdGlvbi9uZXdzLWNoZWNrZ3JvdXBzOyBjaGFyc2V0PVVURi04XCIpLCBcIlVURi04XCIpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDaGFyc2V0KHR5cGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHRyeSB7XG4gICAgY29uc3QgW21lZGlhVHlwZSwgcGFyYW1zXSA9IHBhcnNlTWVkaWFUeXBlKHR5cGUpO1xuICAgIGlmIChwYXJhbXM/LmNoYXJzZXQpIHtcbiAgICAgIHJldHVybiBwYXJhbXMuY2hhcnNldDtcbiAgICB9XG4gICAgY29uc3QgZW50cnkgPSBkYlttZWRpYVR5cGUgYXMgS2V5T2ZEYl0gYXMgREJFbnRyeTtcbiAgICBpZiAoZW50cnk/LmNoYXJzZXQpIHtcbiAgICAgIHJldHVybiBlbnRyeS5jaGFyc2V0O1xuICAgIH1cbiAgICBpZiAobWVkaWFUeXBlLnN0YXJ0c1dpdGgoXCJ0ZXh0L1wiKSkge1xuICAgICAgcmV0dXJuIFwiVVRGLThcIjtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIC8vIGp1c3Qgc3dhbGxvdyBlcnJvcnMsIHJldHVybmluZyB1bmRlZmluZWRcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxjQUFjLFFBQVEsd0JBQXdCO0FBRXZELFNBQVMsRUFBRSxRQUFzQixXQUFXO0FBRTVDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBQ0QsT0FBTyxTQUFTLFdBQVcsSUFBWTtFQUNyQyxJQUFJO0lBQ0YsTUFBTSxDQUFDLFdBQVcsT0FBTyxHQUFHLGVBQWU7SUFDM0MsSUFBSSxRQUFRLFNBQVM7TUFDbkIsT0FBTyxPQUFPLE9BQU87SUFDdkI7SUFDQSxNQUFNLFFBQVEsRUFBRSxDQUFDLFVBQXFCO0lBQ3RDLElBQUksT0FBTyxTQUFTO01BQ2xCLE9BQU8sTUFBTSxPQUFPO0lBQ3RCO0lBQ0EsSUFBSSxVQUFVLFVBQVUsQ0FBQyxVQUFVO01BQ2pDLE9BQU87SUFDVDtFQUNGLEVBQUUsT0FBTTtFQUNOLDJDQUEyQztFQUM3QztFQUNBLE9BQU87QUFDVCJ9
// denoCacheMetadata=6562116167259659414,10904058801839815681