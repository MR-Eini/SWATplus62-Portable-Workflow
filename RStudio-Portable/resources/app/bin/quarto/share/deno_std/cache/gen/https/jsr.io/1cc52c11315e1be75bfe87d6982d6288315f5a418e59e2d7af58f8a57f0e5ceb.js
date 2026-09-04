// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { types } from "./_db.ts";
/**
 * Returns the media type associated with the file extension, or `undefined` if
 * no media type is found.
 *
 * Values are normalized to lower case and matched irrespective of a leading
 * `.`.
 *
 * @param extension The file extension to get the media type for.
 *
 * @returns The media type associated with the file extension, or `undefined` if
 * no media type is found.
 *
 * @example Usage
 * ```ts
 * import { typeByExtension } from "@std/media-types/type-by-extension";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(typeByExtension("js"), "text/javascript");
 * assertEquals(typeByExtension(".HTML"), "text/html");
 * assertEquals(typeByExtension("foo"), undefined);
 * assertEquals(typeByExtension("file.json"), undefined);
 * ```
 */ export function typeByExtension(extension) {
  extension = extension.startsWith(".") ? extension.slice(1) : extension;
  // @ts-ignore Work around https://github.com/denoland/dnt/issues/148
  return types.get(extension.toLowerCase());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMS4wLjMvdHlwZV9ieV9leHRlbnNpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgdHlwZXMgfSBmcm9tIFwiLi9fZGIudHNcIjtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtZWRpYSB0eXBlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZmlsZSBleHRlbnNpb24sIG9yIGB1bmRlZmluZWRgIGlmXG4gKiBubyBtZWRpYSB0eXBlIGlzIGZvdW5kLlxuICpcbiAqIFZhbHVlcyBhcmUgbm9ybWFsaXplZCB0byBsb3dlciBjYXNlIGFuZCBtYXRjaGVkIGlycmVzcGVjdGl2ZSBvZiBhIGxlYWRpbmdcbiAqIGAuYC5cbiAqXG4gKiBAcGFyYW0gZXh0ZW5zaW9uIFRoZSBmaWxlIGV4dGVuc2lvbiB0byBnZXQgdGhlIG1lZGlhIHR5cGUgZm9yLlxuICpcbiAqIEByZXR1cm5zIFRoZSBtZWRpYSB0eXBlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZmlsZSBleHRlbnNpb24sIG9yIGB1bmRlZmluZWRgIGlmXG4gKiBubyBtZWRpYSB0eXBlIGlzIGZvdW5kLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgdHlwZUJ5RXh0ZW5zaW9uIH0gZnJvbSBcIkBzdGQvbWVkaWEtdHlwZXMvdHlwZS1ieS1leHRlbnNpb25cIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydEVxdWFscyh0eXBlQnlFeHRlbnNpb24oXCJqc1wiKSwgXCJ0ZXh0L2phdmFzY3JpcHRcIik7XG4gKiBhc3NlcnRFcXVhbHModHlwZUJ5RXh0ZW5zaW9uKFwiLkhUTUxcIiksIFwidGV4dC9odG1sXCIpO1xuICogYXNzZXJ0RXF1YWxzKHR5cGVCeUV4dGVuc2lvbihcImZvb1wiKSwgdW5kZWZpbmVkKTtcbiAqIGFzc2VydEVxdWFscyh0eXBlQnlFeHRlbnNpb24oXCJmaWxlLmpzb25cIiksIHVuZGVmaW5lZCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHR5cGVCeUV4dGVuc2lvbihleHRlbnNpb246IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGV4dGVuc2lvbiA9IGV4dGVuc2lvbi5zdGFydHNXaXRoKFwiLlwiKSA/IGV4dGVuc2lvbi5zbGljZSgxKSA6IGV4dGVuc2lvbjtcbiAgLy8gQHRzLWlnbm9yZSBXb3JrIGFyb3VuZCBodHRwczovL2dpdGh1Yi5jb20vZGVub2xhbmQvZG50L2lzc3Vlcy8xNDhcbiAgcmV0dXJuIHR5cGVzLmdldChleHRlbnNpb24udG9Mb3dlckNhc2UoKSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLEtBQUssUUFBUSxXQUFXO0FBRWpDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0JDLEdBQ0QsT0FBTyxTQUFTLGdCQUFnQixTQUFpQjtFQUMvQyxZQUFZLFVBQVUsVUFBVSxDQUFDLE9BQU8sVUFBVSxLQUFLLENBQUMsS0FBSztFQUM3RCxvRUFBb0U7RUFDcEUsT0FBTyxNQUFNLEdBQUcsQ0FBQyxVQUFVLFdBQVc7QUFDeEMifQ==
// denoCacheMetadata=8591544942896653770,9590395149453923078