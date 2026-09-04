// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Utility functions for media types (MIME types).
 *
 * This API is inspired by the GoLang {@linkcode https://pkg.go.dev/mime | mime}
 * package and {@link https://github.com/jshttp/mime-types | jshttp/mime-types},
 * and is designed to integrate and improve the APIs from
 * {@link https://deno.land/x/media_types | x/media_types}.
 *
 * The `vendor` folder contains copy of the
 * {@link https://github.com/jshttp/mime-types | jshttp/mime-db} `db.json` file,
 * along with its license.
 *
 * ```ts
 * import { contentType, extensionsByType, getCharset } from "@std/media-types";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(extensionsByType("application/json"), ["json", "map"]);
 *
 * assertEquals(contentType(".json"), "application/json; charset=UTF-8");
 *
 * assertEquals(getCharset("text/plain"), "UTF-8");
 * ```
 *
 * @module
 */ export * from "./content_type.ts";
export * from "./extension.ts";
export * from "./extensions_by_type.ts";
export * from "./format_media_type.ts";
export * from "./get_charset.ts";
export * from "./parse_media_type.ts";
export * from "./type_by_extension.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMC4yMjQuMS9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9ucyBmb3IgbWVkaWEgdHlwZXMgKE1JTUUgdHlwZXMpLlxuICpcbiAqIFRoaXMgQVBJIGlzIGluc3BpcmVkIGJ5IHRoZSBHb0xhbmcge0BsaW5rY29kZSBodHRwczovL3BrZy5nby5kZXYvbWltZSB8IG1pbWV9XG4gKiBwYWNrYWdlIGFuZCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2pzaHR0cC9taW1lLXR5cGVzIHwganNodHRwL21pbWUtdHlwZXN9LFxuICogYW5kIGlzIGRlc2lnbmVkIHRvIGludGVncmF0ZSBhbmQgaW1wcm92ZSB0aGUgQVBJcyBmcm9tXG4gKiB7QGxpbmsgaHR0cHM6Ly9kZW5vLmxhbmQveC9tZWRpYV90eXBlcyB8IHgvbWVkaWFfdHlwZXN9LlxuICpcbiAqIFRoZSBgdmVuZG9yYCBmb2xkZXIgY29udGFpbnMgY29weSBvZiB0aGVcbiAqIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vanNodHRwL21pbWUtdHlwZXMgfCBqc2h0dHAvbWltZS1kYn0gYGRiLmpzb25gIGZpbGUsXG4gKiBhbG9uZyB3aXRoIGl0cyBsaWNlbnNlLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBjb250ZW50VHlwZSwgZXh0ZW5zaW9uc0J5VHlwZSwgZ2V0Q2hhcnNldCB9IGZyb20gXCJAc3RkL21lZGlhLXR5cGVzXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGFzc2VydEVxdWFscyhleHRlbnNpb25zQnlUeXBlKFwiYXBwbGljYXRpb24vanNvblwiKSwgW1wianNvblwiLCBcIm1hcFwiXSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGNvbnRlbnRUeXBlKFwiLmpzb25cIiksIFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOFwiKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZ2V0Q2hhcnNldChcInRleHQvcGxhaW5cIiksIFwiVVRGLThcIik7XG4gKiBgYGBcbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuZXhwb3J0ICogZnJvbSBcIi4vY29udGVudF90eXBlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9leHRlbnNpb24udHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2V4dGVuc2lvbnNfYnlfdHlwZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZm9ybWF0X21lZGlhX3R5cGUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2dldF9jaGFyc2V0LnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9wYXJzZV9tZWRpYV90eXBlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi90eXBlX2J5X2V4dGVuc2lvbi50c1wiO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCQyxHQUVELGNBQWMsb0JBQW9CO0FBQ2xDLGNBQWMsaUJBQWlCO0FBQy9CLGNBQWMsMEJBQTBCO0FBQ3hDLGNBQWMseUJBQXlCO0FBQ3ZDLGNBQWMsbUJBQW1CO0FBQ2pDLGNBQWMsd0JBQXdCO0FBQ3RDLGNBQWMseUJBQXlCIn0=
// denoCacheMetadata=1318485959879182481,8224981994616925046