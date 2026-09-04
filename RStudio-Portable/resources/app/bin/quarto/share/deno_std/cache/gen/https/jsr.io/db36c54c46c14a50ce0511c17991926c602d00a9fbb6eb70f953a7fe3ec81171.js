// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { parseMediaType } from "./parse_media_type.ts";
import { extensions } from "./_db.ts";
export { extensions };
/**
 * Returns the extensions known to be associated with the media type `type`, or
 * `undefined` if no extensions are found.
 *
 * Extensions are returned without a leading `.`.
 *
 * @param type The media type to get the extensions for.
 *
 * @returns The extensions for the given media type, or `undefined` if no
 * extensions are found.
 *
 * @example
 * ```ts
 * import { extensionsByType } from "@std/media-types/extensions-by-type";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(extensionsByType("application/json"), ["json", "map"]);
 * assertEquals(extensionsByType("text/html; charset=UTF-8"), ["html", "htm", "shtml"]);
 * assertEquals(extensionsByType("application/foo"), undefined);
 * ```
 */ export function extensionsByType(type) {
  try {
    const [mediaType] = parseMediaType(type);
    return extensions.get(mediaType);
  } catch  {
  // just swallow errors, returning undefined
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMC4yMjQuMS9leHRlbnNpb25zX2J5X3R5cGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgcGFyc2VNZWRpYVR5cGUgfSBmcm9tIFwiLi9wYXJzZV9tZWRpYV90eXBlLnRzXCI7XG5pbXBvcnQgeyBleHRlbnNpb25zIH0gZnJvbSBcIi4vX2RiLnRzXCI7XG5cbmV4cG9ydCB7IGV4dGVuc2lvbnMgfTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBleHRlbnNpb25zIGtub3duIHRvIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgbWVkaWEgdHlwZSBgdHlwZWAsIG9yXG4gKiBgdW5kZWZpbmVkYCBpZiBubyBleHRlbnNpb25zIGFyZSBmb3VuZC5cbiAqXG4gKiBFeHRlbnNpb25zIGFyZSByZXR1cm5lZCB3aXRob3V0IGEgbGVhZGluZyBgLmAuXG4gKlxuICogQHBhcmFtIHR5cGUgVGhlIG1lZGlhIHR5cGUgdG8gZ2V0IHRoZSBleHRlbnNpb25zIGZvci5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZXh0ZW5zaW9ucyBmb3IgdGhlIGdpdmVuIG1lZGlhIHR5cGUsIG9yIGB1bmRlZmluZWRgIGlmIG5vXG4gKiBleHRlbnNpb25zIGFyZSBmb3VuZC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGV4dGVuc2lvbnNCeVR5cGUgfSBmcm9tIFwiQHN0ZC9tZWRpYS10eXBlcy9leHRlbnNpb25zLWJ5LXR5cGVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGV4dGVuc2lvbnNCeVR5cGUoXCJhcHBsaWNhdGlvbi9qc29uXCIpLCBbXCJqc29uXCIsIFwibWFwXCJdKTtcbiAqIGFzc2VydEVxdWFscyhleHRlbnNpb25zQnlUeXBlKFwidGV4dC9odG1sOyBjaGFyc2V0PVVURi04XCIpLCBbXCJodG1sXCIsIFwiaHRtXCIsIFwic2h0bWxcIl0pO1xuICogYXNzZXJ0RXF1YWxzKGV4dGVuc2lvbnNCeVR5cGUoXCJhcHBsaWNhdGlvbi9mb29cIiksIHVuZGVmaW5lZCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuc2lvbnNCeVR5cGUodHlwZTogc3RyaW5nKTogc3RyaW5nW10gfCB1bmRlZmluZWQge1xuICB0cnkge1xuICAgIGNvbnN0IFttZWRpYVR5cGVdID0gcGFyc2VNZWRpYVR5cGUodHlwZSk7XG4gICAgcmV0dXJuIGV4dGVuc2lvbnMuZ2V0KG1lZGlhVHlwZSk7XG4gIH0gY2F0Y2gge1xuICAgIC8vIGp1c3Qgc3dhbGxvdyBlcnJvcnMsIHJldHVybmluZyB1bmRlZmluZWRcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxjQUFjLFFBQVEsd0JBQXdCO0FBQ3ZELFNBQVMsVUFBVSxRQUFRLFdBQVc7QUFFdEMsU0FBUyxVQUFVLEdBQUc7QUFFdEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0JDLEdBQ0QsT0FBTyxTQUFTLGlCQUFpQixJQUFZO0VBQzNDLElBQUk7SUFDRixNQUFNLENBQUMsVUFBVSxHQUFHLGVBQWU7SUFDbkMsT0FBTyxXQUFXLEdBQUcsQ0FBQztFQUN4QixFQUFFLE9BQU07RUFDTiwyQ0FBMkM7RUFDN0M7QUFDRiJ9
// denoCacheMetadata=16010105751419016560,12278180200744677900