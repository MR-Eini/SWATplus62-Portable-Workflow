// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Utilities for
 * {@link https://datatracker.ietf.org/doc/html/rfc4648#section-5 | base64url}
 * encoding and decoding.
 *
 * This module is browser compatible.
 *
 * @module
 */ import * as base64 from "./base64.ts";
/**
 * Some variants allow or require omitting the padding '=' signs:
 * https://en.wikipedia.org/wiki/Base64#The_URL_applications
 *
 * @param base64url
 */ function addPaddingToBase64url(base64url) {
  if (base64url.length % 4 === 2) return base64url + "==";
  if (base64url.length % 4 === 3) return base64url + "=";
  if (base64url.length % 4 === 1) {
    throw new TypeError("Illegal base64url string!");
  }
  return base64url;
}
function convertBase64urlToBase64(b64url) {
  if (!/^[-_A-Z0-9]*?={0,2}$/i.test(b64url)) {
    // Contains characters not part of base64url spec.
    throw new TypeError("Failed to decode base64url: invalid character");
  }
  return addPaddingToBase64url(b64url).replace(/\-/g, "+").replace(/_/g, "/");
}
function convertBase64ToBase64url(b64) {
  return b64.endsWith("=") ? b64.endsWith("==") ? b64.replace(/\+/g, "-").replace(/\//g, "_").slice(0, -2) : b64.replace(/\+/g, "-").replace(/\//g, "_").slice(0, -1) : b64.replace(/\+/g, "-").replace(/\//g, "_");
}
/**
 * Convert data into a base64url-encoded string.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc4648#section-5}
 *
 * @param data The data to encode.
 * @returns The base64url-encoded string.
 *
 * @example
 * ```ts
 * import { encodeBase64Url } from "https://deno.land/std@$STD_VERSION/encoding/base64url.ts";
 *
 * encodeBase64Url("foobar"); // "Zm9vYmFy"
 * ```
 */ export function encodeBase64Url(data) {
  return convertBase64ToBase64url(base64.encodeBase64(data));
}
/**
 * Decodes a given base64url-encoded string.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc4648#section-5}
 *
 * @param b64url The base64url-encoded string to decode.
 * @returns The decoded data.
 *
 * @example
 * ```ts
 * import { decodeBase64Url } from "https://deno.land/std@$STD_VERSION/encoding/base64url.ts";
 *
 * decodeBase64Url("Zm9vYmFy"); // Uint8Array(6) [ 102, 111, 111, 98, 97, 114 ]
 * ```
 */ export function decodeBase64Url(b64url) {
  return base64.decodeBase64(convertBase64urlToBase64(b64url));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIyNC4wL2VuY29kaW5nL2Jhc2U2NHVybC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFV0aWxpdGllcyBmb3JcbiAqIHtAbGluayBodHRwczovL2RhdGF0cmFja2VyLmlldGYub3JnL2RvYy9odG1sL3JmYzQ2NDgjc2VjdGlvbi01IHwgYmFzZTY0dXJsfVxuICogZW5jb2RpbmcgYW5kIGRlY29kaW5nLlxuICpcbiAqIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0ICogYXMgYmFzZTY0IGZyb20gXCIuL2Jhc2U2NC50c1wiO1xuXG4vKipcbiAqIFNvbWUgdmFyaWFudHMgYWxsb3cgb3IgcmVxdWlyZSBvbWl0dGluZyB0aGUgcGFkZGluZyAnPScgc2lnbnM6XG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CYXNlNjQjVGhlX1VSTF9hcHBsaWNhdGlvbnNcbiAqXG4gKiBAcGFyYW0gYmFzZTY0dXJsXG4gKi9cbmZ1bmN0aW9uIGFkZFBhZGRpbmdUb0Jhc2U2NHVybChiYXNlNjR1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChiYXNlNjR1cmwubGVuZ3RoICUgNCA9PT0gMikgcmV0dXJuIGJhc2U2NHVybCArIFwiPT1cIjtcbiAgaWYgKGJhc2U2NHVybC5sZW5ndGggJSA0ID09PSAzKSByZXR1cm4gYmFzZTY0dXJsICsgXCI9XCI7XG4gIGlmIChiYXNlNjR1cmwubGVuZ3RoICUgNCA9PT0gMSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbGxlZ2FsIGJhc2U2NHVybCBzdHJpbmchXCIpO1xuICB9XG4gIHJldHVybiBiYXNlNjR1cmw7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRCYXNlNjR1cmxUb0Jhc2U2NChiNjR1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghL15bLV9BLVowLTldKj89ezAsMn0kL2kudGVzdChiNjR1cmwpKSB7XG4gICAgLy8gQ29udGFpbnMgY2hhcmFjdGVycyBub3QgcGFydCBvZiBiYXNlNjR1cmwgc3BlYy5cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGRlY29kZSBiYXNlNjR1cmw6IGludmFsaWQgY2hhcmFjdGVyXCIpO1xuICB9XG4gIHJldHVybiBhZGRQYWRkaW5nVG9CYXNlNjR1cmwoYjY0dXJsKS5yZXBsYWNlKC9cXC0vZywgXCIrXCIpLnJlcGxhY2UoL18vZywgXCIvXCIpO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0QmFzZTY0VG9CYXNlNjR1cmwoYjY0OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGI2NC5lbmRzV2l0aChcIj1cIilcbiAgICA/IGI2NC5lbmRzV2l0aChcIj09XCIpXG4gICAgICA/IGI2NC5yZXBsYWNlKC9cXCsvZywgXCItXCIpLnJlcGxhY2UoL1xcLy9nLCBcIl9cIikuc2xpY2UoMCwgLTIpXG4gICAgICA6IGI2NC5yZXBsYWNlKC9cXCsvZywgXCItXCIpLnJlcGxhY2UoL1xcLy9nLCBcIl9cIikuc2xpY2UoMCwgLTEpXG4gICAgOiBiNjQucmVwbGFjZSgvXFwrL2csIFwiLVwiKS5yZXBsYWNlKC9cXC8vZywgXCJfXCIpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgZGF0YSBpbnRvIGEgYmFzZTY0dXJsLWVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGF0YXRyYWNrZXIuaWV0Zi5vcmcvZG9jL2h0bWwvcmZjNDY0OCNzZWN0aW9uLTV9XG4gKlxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gZW5jb2RlLlxuICogQHJldHVybnMgVGhlIGJhc2U2NHVybC1lbmNvZGVkIHN0cmluZy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVuY29kZUJhc2U2NFVybCB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2VuY29kaW5nL2Jhc2U2NHVybC50c1wiO1xuICpcbiAqIGVuY29kZUJhc2U2NFVybChcImZvb2JhclwiKTsgLy8gXCJabTl2WW1GeVwiXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUJhc2U2NFVybChcbiAgZGF0YTogQXJyYXlCdWZmZXIgfCBVaW50OEFycmF5IHwgc3RyaW5nLFxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGNvbnZlcnRCYXNlNjRUb0Jhc2U2NHVybChiYXNlNjQuZW5jb2RlQmFzZTY0KGRhdGEpKTtcbn1cblxuLyoqXG4gKiBEZWNvZGVzIGEgZ2l2ZW4gYmFzZTY0dXJsLWVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGF0YXRyYWNrZXIuaWV0Zi5vcmcvZG9jL2h0bWwvcmZjNDY0OCNzZWN0aW9uLTV9XG4gKlxuICogQHBhcmFtIGI2NHVybCBUaGUgYmFzZTY0dXJsLWVuY29kZWQgc3RyaW5nIHRvIGRlY29kZS5cbiAqIEByZXR1cm5zIFRoZSBkZWNvZGVkIGRhdGEuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkZWNvZGVCYXNlNjRVcmwgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9lbmNvZGluZy9iYXNlNjR1cmwudHNcIjtcbiAqXG4gKiBkZWNvZGVCYXNlNjRVcmwoXCJabTl2WW1GeVwiKTsgLy8gVWludDhBcnJheSg2KSBbIDEwMiwgMTExLCAxMTEsIDk4LCA5NywgMTE0IF1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlQmFzZTY0VXJsKGI2NHVybDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIHJldHVybiBiYXNlNjQuZGVjb2RlQmFzZTY0KGNvbnZlcnRCYXNlNjR1cmxUb0Jhc2U2NChiNjR1cmwpKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7OztDQVFDLEdBRUQsWUFBWSxZQUFZLGNBQWM7QUFFdEM7Ozs7O0NBS0MsR0FDRCxTQUFTLHNCQUFzQixTQUFpQjtFQUM5QyxJQUFJLFVBQVUsTUFBTSxHQUFHLE1BQU0sR0FBRyxPQUFPLFlBQVk7RUFDbkQsSUFBSSxVQUFVLE1BQU0sR0FBRyxNQUFNLEdBQUcsT0FBTyxZQUFZO0VBQ25ELElBQUksVUFBVSxNQUFNLEdBQUcsTUFBTSxHQUFHO0lBQzlCLE1BQU0sSUFBSSxVQUFVO0VBQ3RCO0VBQ0EsT0FBTztBQUNUO0FBRUEsU0FBUyx5QkFBeUIsTUFBYztFQUM5QyxJQUFJLENBQUMsd0JBQXdCLElBQUksQ0FBQyxTQUFTO0lBQ3pDLGtEQUFrRDtJQUNsRCxNQUFNLElBQUksVUFBVTtFQUN0QjtFQUNBLE9BQU8sc0JBQXNCLFFBQVEsT0FBTyxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUMsTUFBTTtBQUN6RTtBQUVBLFNBQVMseUJBQXlCLEdBQVc7RUFDM0MsT0FBTyxJQUFJLFFBQVEsQ0FBQyxPQUNoQixJQUFJLFFBQVEsQ0FBQyxRQUNYLElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FDdEQsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLE9BQU8sQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUN4RCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLE9BQU87QUFDN0M7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Q0FjQyxHQUNELE9BQU8sU0FBUyxnQkFDZCxJQUF1QztFQUV2QyxPQUFPLHlCQUF5QixPQUFPLFlBQVksQ0FBQztBQUN0RDtBQUVBOzs7Ozs7Ozs7Ozs7OztDQWNDLEdBQ0QsT0FBTyxTQUFTLGdCQUFnQixNQUFjO0VBQzVDLE9BQU8sT0FBTyxZQUFZLENBQUMseUJBQXlCO0FBQ3REIn0=
// denoCacheMetadata=15248884665321969825,9927394792917822749