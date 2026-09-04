// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Utilities for
 * {@link https://www.rfc-editor.org/rfc/rfc4648.html#section-5 | base64url}
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
 * @see {@link https://www.rfc-editor.org/rfc/rfc4648.html#section-5}
 *
 * @param data The data to encode.
 * @returns The base64url-encoded string.
 *
 * @example Usage
 * ```ts
 * import { encodeBase64Url } from "@std/encoding/base64url";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(encodeBase64Url("foobar"), "Zm9vYmFy");
 * ```
 */ export function encodeBase64Url(data) {
  return convertBase64ToBase64url(base64.encodeBase64(data));
}
/**
 * Decodes a given base64url-encoded string.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc4648.html#section-5}
 *
 * @param b64url The base64url-encoded string to decode.
 * @returns The decoded data.
 *
 * @example Usage
 * ```ts
 * import { decodeBase64Url } from "@std/encoding/base64url";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(
 *   decodeBase64Url("Zm9vYmFy"),
 *   new TextEncoder().encode("foobar")
 * );
 * ```
 */ export function decodeBase64Url(b64url) {
  return base64.decodeBase64(convertBase64urlToBase64(b64url));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZW5jb2RpbmcvMC4yMjQuMy9iYXNlNjR1cmwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzQ2NDguaHRtbCNzZWN0aW9uLTUgfCBiYXNlNjR1cmx9XG4gKiBlbmNvZGluZyBhbmQgZGVjb2RpbmcuXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgKiBhcyBiYXNlNjQgZnJvbSBcIi4vYmFzZTY0LnRzXCI7XG5cbi8qKlxuICogU29tZSB2YXJpYW50cyBhbGxvdyBvciByZXF1aXJlIG9taXR0aW5nIHRoZSBwYWRkaW5nICc9JyBzaWduczpcbiAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Jhc2U2NCNUaGVfVVJMX2FwcGxpY2F0aW9uc1xuICpcbiAqIEBwYXJhbSBiYXNlNjR1cmxcbiAqL1xuZnVuY3Rpb24gYWRkUGFkZGluZ1RvQmFzZTY0dXJsKGJhc2U2NHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKGJhc2U2NHVybC5sZW5ndGggJSA0ID09PSAyKSByZXR1cm4gYmFzZTY0dXJsICsgXCI9PVwiO1xuICBpZiAoYmFzZTY0dXJsLmxlbmd0aCAlIDQgPT09IDMpIHJldHVybiBiYXNlNjR1cmwgKyBcIj1cIjtcbiAgaWYgKGJhc2U2NHVybC5sZW5ndGggJSA0ID09PSAxKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIklsbGVnYWwgYmFzZTY0dXJsIHN0cmluZyFcIik7XG4gIH1cbiAgcmV0dXJuIGJhc2U2NHVybDtcbn1cblxuZnVuY3Rpb24gY29udmVydEJhc2U2NHVybFRvQmFzZTY0KGI2NHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCEvXlstX0EtWjAtOV0qPz17MCwyfSQvaS50ZXN0KGI2NHVybCkpIHtcbiAgICAvLyBDb250YWlucyBjaGFyYWN0ZXJzIG5vdCBwYXJ0IG9mIGJhc2U2NHVybCBzcGVjLlxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gZGVjb2RlIGJhc2U2NHVybDogaW52YWxpZCBjaGFyYWN0ZXJcIik7XG4gIH1cbiAgcmV0dXJuIGFkZFBhZGRpbmdUb0Jhc2U2NHVybChiNjR1cmwpLnJlcGxhY2UoL1xcLS9nLCBcIitcIikucmVwbGFjZSgvXy9nLCBcIi9cIik7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRCYXNlNjRUb0Jhc2U2NHVybChiNjQ6IHN0cmluZykge1xuICByZXR1cm4gYjY0LmVuZHNXaXRoKFwiPVwiKVxuICAgID8gYjY0LmVuZHNXaXRoKFwiPT1cIilcbiAgICAgID8gYjY0LnJlcGxhY2UoL1xcKy9nLCBcIi1cIikucmVwbGFjZSgvXFwvL2csIFwiX1wiKS5zbGljZSgwLCAtMilcbiAgICAgIDogYjY0LnJlcGxhY2UoL1xcKy9nLCBcIi1cIikucmVwbGFjZSgvXFwvL2csIFwiX1wiKS5zbGljZSgwLCAtMSlcbiAgICA6IGI2NC5yZXBsYWNlKC9cXCsvZywgXCItXCIpLnJlcGxhY2UoL1xcLy9nLCBcIl9cIik7XG59XG5cbi8qKlxuICogQ29udmVydCBkYXRhIGludG8gYSBiYXNlNjR1cmwtZW5jb2RlZCBzdHJpbmcuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzQ2NDguaHRtbCNzZWN0aW9uLTV9XG4gKlxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gZW5jb2RlLlxuICogQHJldHVybnMgVGhlIGJhc2U2NHVybC1lbmNvZGVkIHN0cmluZy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVuY29kZUJhc2U2NFVybCB9IGZyb20gXCJAc3RkL2VuY29kaW5nL2Jhc2U2NHVybFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZW5jb2RlQmFzZTY0VXJsKFwiZm9vYmFyXCIpLCBcIlptOXZZbUZ5XCIpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVCYXNlNjRVcmwoXG4gIGRhdGE6IEFycmF5QnVmZmVyIHwgVWludDhBcnJheSB8IHN0cmluZyxcbik6IHN0cmluZyB7XG4gIHJldHVybiBjb252ZXJ0QmFzZTY0VG9CYXNlNjR1cmwoYmFzZTY0LmVuY29kZUJhc2U2NChkYXRhKSk7XG59XG5cbi8qKlxuICogRGVjb2RlcyBhIGdpdmVuIGJhc2U2NHVybC1lbmNvZGVkIHN0cmluZy5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjNDY0OC5odG1sI3NlY3Rpb24tNX1cbiAqXG4gKiBAcGFyYW0gYjY0dXJsIFRoZSBiYXNlNjR1cmwtZW5jb2RlZCBzdHJpbmcgdG8gZGVjb2RlLlxuICogQHJldHVybnMgVGhlIGRlY29kZWQgZGF0YS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGRlY29kZUJhc2U2NFVybCB9IGZyb20gXCJAc3RkL2VuY29kaW5nL2Jhc2U2NHVybFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGRlY29kZUJhc2U2NFVybChcIlptOXZZbUZ5XCIpLFxuICogICBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJmb29iYXJcIilcbiAqICk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZUJhc2U2NFVybChiNjR1cmw6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gYmFzZTY0LmRlY29kZUJhc2U2NChjb252ZXJ0QmFzZTY0dXJsVG9CYXNlNjQoYjY0dXJsKSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Q0FRQyxHQUVELFlBQVksWUFBWSxjQUFjO0FBRXRDOzs7OztDQUtDLEdBQ0QsU0FBUyxzQkFBc0IsU0FBaUI7RUFDOUMsSUFBSSxVQUFVLE1BQU0sR0FBRyxNQUFNLEdBQUcsT0FBTyxZQUFZO0VBQ25ELElBQUksVUFBVSxNQUFNLEdBQUcsTUFBTSxHQUFHLE9BQU8sWUFBWTtFQUNuRCxJQUFJLFVBQVUsTUFBTSxHQUFHLE1BQU0sR0FBRztJQUM5QixNQUFNLElBQUksVUFBVTtFQUN0QjtFQUNBLE9BQU87QUFDVDtBQUVBLFNBQVMseUJBQXlCLE1BQWM7RUFDOUMsSUFBSSxDQUFDLHdCQUF3QixJQUFJLENBQUMsU0FBUztJQUN6QyxrREFBa0Q7SUFDbEQsTUFBTSxJQUFJLFVBQVU7RUFDdEI7RUFDQSxPQUFPLHNCQUFzQixRQUFRLE9BQU8sQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLE1BQU07QUFDekU7QUFFQSxTQUFTLHlCQUF5QixHQUFXO0VBQzNDLE9BQU8sSUFBSSxRQUFRLENBQUMsT0FDaEIsSUFBSSxRQUFRLENBQUMsUUFDWCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQ3RELElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FDeEQsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLE9BQU8sQ0FBQyxPQUFPO0FBQzdDO0FBRUE7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBQ0QsT0FBTyxTQUFTLGdCQUNkLElBQXVDO0VBRXZDLE9BQU8seUJBQXlCLE9BQU8sWUFBWSxDQUFDO0FBQ3REO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWtCQyxHQUNELE9BQU8sU0FBUyxnQkFBZ0IsTUFBYztFQUM1QyxPQUFPLE9BQU8sWUFBWSxDQUFDLHlCQUF5QjtBQUN0RCJ9
// denoCacheMetadata=11133906767995100014,1555086319816838719