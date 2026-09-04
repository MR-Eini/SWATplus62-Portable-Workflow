// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { extensionsByType } from "./extensions_by_type.ts";
/**
 * Returns the most relevant extension for the given media type, or `undefined`
 * if no extension can be found.
 *
 * Extensions are returned without a leading `.`.
 *
 * @param type The media type to get the extension for.
 *
 * @returns The extension for the given media type, or `undefined` if no
 * extension is found.
 *
 * @example Usage
 * ```ts
 * import { extension } from "@std/media-types/extension";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(extension("text/plain"), "txt");
 * assertEquals(extension("application/json"), "json");
 * assertEquals(extension("text/html; charset=UTF-8"), "html");
 * assertEquals(extension("application/foo"), undefined);
 * ```
 */ export function extension(type) {
  return extensionsByType(type)?.[0];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMC4yMjQuMS9leHRlbnNpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgZXh0ZW5zaW9uc0J5VHlwZSB9IGZyb20gXCIuL2V4dGVuc2lvbnNfYnlfdHlwZS50c1wiO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1vc3QgcmVsZXZhbnQgZXh0ZW5zaW9uIGZvciB0aGUgZ2l2ZW4gbWVkaWEgdHlwZSwgb3IgYHVuZGVmaW5lZGBcbiAqIGlmIG5vIGV4dGVuc2lvbiBjYW4gYmUgZm91bmQuXG4gKlxuICogRXh0ZW5zaW9ucyBhcmUgcmV0dXJuZWQgd2l0aG91dCBhIGxlYWRpbmcgYC5gLlxuICpcbiAqIEBwYXJhbSB0eXBlIFRoZSBtZWRpYSB0eXBlIHRvIGdldCB0aGUgZXh0ZW5zaW9uIGZvci5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZXh0ZW5zaW9uIGZvciB0aGUgZ2l2ZW4gbWVkaWEgdHlwZSwgb3IgYHVuZGVmaW5lZGAgaWYgbm9cbiAqIGV4dGVuc2lvbiBpcyBmb3VuZC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGV4dGVuc2lvbiB9IGZyb20gXCJAc3RkL21lZGlhLXR5cGVzL2V4dGVuc2lvblwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZXh0ZW5zaW9uKFwidGV4dC9wbGFpblwiKSwgXCJ0eHRcIik7XG4gKiBhc3NlcnRFcXVhbHMoZXh0ZW5zaW9uKFwiYXBwbGljYXRpb24vanNvblwiKSwgXCJqc29uXCIpO1xuICogYXNzZXJ0RXF1YWxzKGV4dGVuc2lvbihcInRleHQvaHRtbDsgY2hhcnNldD1VVEYtOFwiKSwgXCJodG1sXCIpO1xuICogYXNzZXJ0RXF1YWxzKGV4dGVuc2lvbihcImFwcGxpY2F0aW9uL2Zvb1wiKSwgdW5kZWZpbmVkKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5zaW9uKHR5cGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBleHRlbnNpb25zQnlUeXBlKHR5cGUpPy5bMF07XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLGdCQUFnQixRQUFRLDBCQUEwQjtBQUUzRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBcUJDLEdBQ0QsT0FBTyxTQUFTLFVBQVUsSUFBWTtFQUNwQyxPQUFPLGlCQUFpQixPQUFPLENBQUMsRUFBRTtBQUNwQyJ9
// denoCacheMetadata=8011232411611526587,13201220424030288461