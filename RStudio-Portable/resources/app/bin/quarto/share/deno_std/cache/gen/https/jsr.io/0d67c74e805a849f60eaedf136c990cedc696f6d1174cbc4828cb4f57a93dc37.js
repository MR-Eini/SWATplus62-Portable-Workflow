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
 * import { assertEquals } from "@std/assert";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMS4wLjMvZ2V0X2NoYXJzZXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgcGFyc2VNZWRpYVR5cGUgfSBmcm9tIFwiLi9wYXJzZV9tZWRpYV90eXBlLnRzXCI7XG5pbXBvcnQgdHlwZSB7IERCRW50cnkgfSBmcm9tIFwiLi9fdXRpbC50c1wiO1xuaW1wb3J0IHsgZGIsIHR5cGUgS2V5T2ZEYiB9IGZyb20gXCIuL19kYi50c1wiO1xuXG4vKipcbiAqIEdpdmVuIGEgbWVkaWEgdHlwZSBvciBoZWFkZXIgdmFsdWUsIGlkZW50aWZ5IHRoZSBlbmNvZGluZyBjaGFyc2V0LiBJZiB0aGVcbiAqIGNoYXJzZXQgY2Fubm90IGJlIGRldGVybWluZWQsIHRoZSBmdW5jdGlvbiByZXR1cm5zIGB1bmRlZmluZWRgLlxuICpcbiAqIEBwYXJhbSB0eXBlIFRoZSBtZWRpYSB0eXBlIG9yIGhlYWRlciB2YWx1ZSB0byBnZXQgdGhlIGNoYXJzZXQgZm9yLlxuICpcbiAqIEByZXR1cm5zIFRoZSBjaGFyc2V0IGZvciB0aGUgZ2l2ZW4gbWVkaWEgdHlwZSBvciBoZWFkZXIgdmFsdWUsIG9yIGB1bmRlZmluZWRgXG4gKiBpZiB0aGUgY2hhcnNldCBjYW5ub3QgYmUgZGV0ZXJtaW5lZC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGdldENoYXJzZXQgfSBmcm9tIFwiQHN0ZC9tZWRpYS10eXBlcy9nZXQtY2hhcnNldFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGdldENoYXJzZXQoXCJ0ZXh0L3BsYWluXCIpLCBcIlVURi04XCIpO1xuICogYXNzZXJ0RXF1YWxzKGdldENoYXJzZXQoXCJhcHBsaWNhdGlvbi9mb29cIiksIHVuZGVmaW5lZCk7XG4gKiBhc3NlcnRFcXVhbHMoZ2V0Q2hhcnNldChcImFwcGxpY2F0aW9uL25ld3MtY2hlY2tncm91cHNcIiksIFwiVVMtQVNDSUlcIik7XG4gKiBhc3NlcnRFcXVhbHMoZ2V0Q2hhcnNldChcImFwcGxpY2F0aW9uL25ld3MtY2hlY2tncm91cHM7IGNoYXJzZXQ9VVRGLThcIiksIFwiVVRGLThcIik7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENoYXJzZXQodHlwZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBbbWVkaWFUeXBlLCBwYXJhbXNdID0gcGFyc2VNZWRpYVR5cGUodHlwZSk7XG4gICAgaWYgKHBhcmFtcz8uY2hhcnNldCkge1xuICAgICAgcmV0dXJuIHBhcmFtcy5jaGFyc2V0O1xuICAgIH1cbiAgICBjb25zdCBlbnRyeSA9IGRiW21lZGlhVHlwZSBhcyBLZXlPZkRiXSBhcyBEQkVudHJ5O1xuICAgIGlmIChlbnRyeT8uY2hhcnNldCkge1xuICAgICAgcmV0dXJuIGVudHJ5LmNoYXJzZXQ7XG4gICAgfVxuICAgIGlmIChtZWRpYVR5cGUuc3RhcnRzV2l0aChcInRleHQvXCIpKSB7XG4gICAgICByZXR1cm4gXCJVVEYtOFwiO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLy8ganVzdCBzd2FsbG93IGVycm9ycywgcmV0dXJuaW5nIHVuZGVmaW5lZFxuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLGNBQWMsUUFBUSx3QkFBd0I7QUFFdkQsU0FBUyxFQUFFLFFBQXNCLFdBQVc7QUFFNUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQkMsR0FDRCxPQUFPLFNBQVMsV0FBVyxJQUFZO0VBQ3JDLElBQUk7SUFDRixNQUFNLENBQUMsV0FBVyxPQUFPLEdBQUcsZUFBZTtJQUMzQyxJQUFJLFFBQVEsU0FBUztNQUNuQixPQUFPLE9BQU8sT0FBTztJQUN2QjtJQUNBLE1BQU0sUUFBUSxFQUFFLENBQUMsVUFBcUI7SUFDdEMsSUFBSSxPQUFPLFNBQVM7TUFDbEIsT0FBTyxNQUFNLE9BQU87SUFDdEI7SUFDQSxJQUFJLFVBQVUsVUFBVSxDQUFDLFVBQVU7TUFDakMsT0FBTztJQUNUO0VBQ0YsRUFBRSxPQUFNO0VBQ04sMkNBQTJDO0VBQzdDO0VBQ0EsT0FBTztBQUNUIn0=
// denoCacheMetadata=3196844239478193188,10466593184192381521