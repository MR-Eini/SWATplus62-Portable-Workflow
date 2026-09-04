// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { normalize as posixNormalize } from "./posix/normalize.ts";
import { normalize as windowsNormalize } from "./windows/normalize.ts";
/**
 * Normalize the `path`, resolving `'..'` and `'.'` segments.
 * Note that resolving these segments does not necessarily mean that all will be eliminated.
 * A `'..'` at the top-level will be preserved, and an empty path is canonically `'.'`.
 * @param path to be normalized
 */ export function normalize(path) {
  return isWindows ? windowsNormalize(path) : posixNormalize(path);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL25vcm1hbGl6ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBpc1dpbmRvd3MgfSBmcm9tIFwiLi9fb3MudHNcIjtcbmltcG9ydCB7IG5vcm1hbGl6ZSBhcyBwb3NpeE5vcm1hbGl6ZSB9IGZyb20gXCIuL3Bvc2l4L25vcm1hbGl6ZS50c1wiO1xuaW1wb3J0IHsgbm9ybWFsaXplIGFzIHdpbmRvd3NOb3JtYWxpemUgfSBmcm9tIFwiLi93aW5kb3dzL25vcm1hbGl6ZS50c1wiO1xuLyoqXG4gKiBOb3JtYWxpemUgdGhlIGBwYXRoYCwgcmVzb2x2aW5nIGAnLi4nYCBhbmQgYCcuJ2Agc2VnbWVudHMuXG4gKiBOb3RlIHRoYXQgcmVzb2x2aW5nIHRoZXNlIHNlZ21lbnRzIGRvZXMgbm90IG5lY2Vzc2FyaWx5IG1lYW4gdGhhdCBhbGwgd2lsbCBiZSBlbGltaW5hdGVkLlxuICogQSBgJy4uJ2AgYXQgdGhlIHRvcC1sZXZlbCB3aWxsIGJlIHByZXNlcnZlZCwgYW5kIGFuIGVtcHR5IHBhdGggaXMgY2Fub25pY2FsbHkgYCcuJ2AuXG4gKiBAcGFyYW0gcGF0aCB0byBiZSBub3JtYWxpemVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlzV2luZG93cyA/IHdpbmRvd3NOb3JtYWxpemUocGF0aCkgOiBwb3NpeE5vcm1hbGl6ZShwYXRoKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsU0FBUyxRQUFRLFdBQVc7QUFDckMsU0FBUyxhQUFhLGNBQWMsUUFBUSx1QkFBdUI7QUFDbkUsU0FBUyxhQUFhLGdCQUFnQixRQUFRLHlCQUF5QjtBQUN2RTs7Ozs7Q0FLQyxHQUNELE9BQU8sU0FBUyxVQUFVLElBQVk7RUFDcEMsT0FBTyxZQUFZLGlCQUFpQixRQUFRLGVBQWU7QUFDN0QifQ==
// denoCacheMetadata=3029771491097579187,9797230621859109816