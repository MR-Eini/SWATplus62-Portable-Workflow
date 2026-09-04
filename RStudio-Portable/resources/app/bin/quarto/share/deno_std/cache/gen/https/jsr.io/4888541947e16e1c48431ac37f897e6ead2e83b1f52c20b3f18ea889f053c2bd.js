// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// Structured similarly to Go's cookie.go
// https://github.com/golang/go/blob/master/src/net/http/cookie.go
// This module is browser compatible.
/**
 * Represents an HTTP Cookie.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6265.html#section-4.2.1}
 */ const FIELD_CONTENT_REGEXP = /^(?=[\x20-\x7E]*$)[^()@<>,;:\\"\[\]?={}\s]+$/;
function toString(cookie) {
  if (!cookie.name) {
    return "";
  }
  const out = [];
  validateName(cookie.name);
  validateValue(cookie.name, cookie.value);
  out.push(`${cookie.name}=${cookie.value}`);
  // Fallback for invalid Set-Cookie
  // ref: https://www.rfc-editor.org/rfc/rfc6265.html#section-3.1
  if (cookie.name.startsWith("__Secure")) {
    cookie.secure = true;
  }
  if (cookie.name.startsWith("__Host")) {
    cookie.path = "/";
    cookie.secure = true;
    delete cookie.domain;
  }
  if (cookie.secure) {
    out.push("Secure");
  }
  if (cookie.httpOnly) {
    out.push("HttpOnly");
  }
  if (cookie.partitioned) {
    out.push("Partitioned");
  }
  if (typeof cookie.maxAge === "number" && Number.isInteger(cookie.maxAge)) {
    if (cookie.maxAge < 0) {
      throw new RangeError("Max-Age must be an integer superior or equal to 0. Cookie ignored.");
    }
    out.push(`Max-Age=${cookie.maxAge}`);
  }
  if (cookie.domain) {
    validateDomain(cookie.domain);
    out.push(`Domain=${cookie.domain}`);
  }
  if (cookie.sameSite) {
    out.push(`SameSite=${cookie.sameSite}`);
  }
  if (cookie.path) {
    validatePath(cookie.path);
    out.push(`Path=${cookie.path}`);
  }
  if (cookie.expires) {
    const { expires } = cookie;
    const date = typeof expires === "number" ? new Date(expires) : expires;
    out.push(`Expires=${date.toUTCString()}`);
  }
  if (cookie.unparsed) {
    out.push(cookie.unparsed.join("; "));
  }
  return out.join("; ");
}
/**
 * Validate Cookie Name.
 * @param name Cookie name.
 */ function validateName(name) {
  if (name && !FIELD_CONTENT_REGEXP.test(name)) {
    throw new TypeError(`Invalid cookie name: "${name}".`);
  }
}
/**
 * Validate Path Value.
 * See {@link https://www.rfc-editor.org/rfc/rfc6265.html#section-4.1.2.4}.
 * @param path Path value.
 */ function validatePath(path) {
  if (path === null) {
    return;
  }
  for(let i = 0; i < path.length; i++){
    const c = path.charAt(i);
    if (c < String.fromCharCode(0x20) || c > String.fromCharCode(0x7E) || c === ";") {
      throw new Error(path + ": Invalid cookie path char '" + c + "'");
    }
  }
}
/**
 * Validate Cookie Value.
 * See {@link https://www.rfc-editor.org/rfc/rfc6265.html#section-4.1}.
 * @param value Cookie value.
 */ function validateValue(name, value) {
  if (value === null) return;
  for(let i = 0; i < value.length; i++){
    const c = value.charAt(i);
    if (c < String.fromCharCode(0x21) || c === String.fromCharCode(0x22) || c === String.fromCharCode(0x2c) || c === String.fromCharCode(0x3b) || c === String.fromCharCode(0x5c) || c === String.fromCharCode(0x7f)) {
      throw new Error("RFC2616 cookie '" + name + "' cannot contain character '" + c + "'");
    }
    if (c > String.fromCharCode(0x80)) {
      throw new Error("RFC2616 cookie '" + name + "' can only have US-ASCII chars as value" + c.charCodeAt(0).toString(16));
    }
  }
}
/**
 * Validate Cookie Domain.
 * See {@link https://www.rfc-editor.org/rfc/rfc6265.html#section-4.1.2.3}.
 * @param domain Cookie domain.
 */ function validateDomain(domain) {
  const char1 = domain.charAt(0);
  const charN = domain.charAt(domain.length - 1);
  if (char1 === "-" || charN === "." || charN === "-") {
    throw new Error("Invalid first/last char in cookie domain: " + domain);
  }
}
/**
 * Parse cookies of a header
 *
 * @example Usage
 * ```ts
 * import { getCookies } from "@std/http/cookie";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const headers = new Headers();
 * headers.set("Cookie", "full=of; tasty=chocolate");
 *
 * const cookies = getCookies(headers);
 * assertEquals(cookies, { full: "of", tasty: "chocolate" });
 * ```
 *
 * @param headers The headers instance to get cookies from
 * @return Object with cookie names as keys
 */ export function getCookies(headers) {
  const cookie = headers.get("Cookie");
  if (cookie !== null) {
    const out = {};
    const c = cookie.split(";");
    for (const kv of c){
      const [cookieKey, ...cookieVal] = kv.split("=");
      if (cookieKey === undefined) {
        throw new TypeError("Cookie cannot start with '='");
      }
      const key = cookieKey.trim();
      out[key] = cookieVal.join("=");
    }
    return out;
  }
  return {};
}
/**
 * Set the cookie header properly in the headers
 *
 * @example Usage
 * ```ts
 * import { Cookie, setCookie } from "@std/http/cookie";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const headers = new Headers();
 * const cookie: Cookie = { name: "Space", value: "Cat" };
 * setCookie(headers, cookie);
 *
 * const cookieHeader = headers.get("set-cookie");
 *
 * assertEquals(cookieHeader, "Space=Cat");
 * ```
 *
 * @param headers The headers instance to set the cookie to
 * @param cookie Cookie to set
 */ export function setCookie(headers, cookie) {
  // Parsing cookie headers to make consistent set-cookie header
  // ref: https://www.rfc-editor.org/rfc/rfc6265.html#section-4.1.1
  const v = toString(cookie);
  if (v) {
    headers.append("Set-Cookie", v);
  }
}
/**
 * Set the cookie header with empty value in the headers to delete it
 *
 * > Note: Deleting a `Cookie` will set its expiration date before now. Forcing
 * > the browser to delete it.
 *
 * @example Usage
 * ```ts
 * import { deleteCookie } from "@std/http/cookie";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const headers = new Headers();
 * deleteCookie(headers, "deno");
 *
 * const cookieHeader = headers.get("set-cookie");
 *
 * assertEquals(cookieHeader, "deno=; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
 * ```
 *
 * @param headers The headers instance to delete the cookie from
 * @param name Name of cookie
 * @param attributes Additional cookie attributes
 */ export function deleteCookie(headers, name, attributes) {
  setCookie(headers, {
    name: name,
    value: "",
    expires: new Date(0),
    ...attributes
  });
}
function parseSetCookie(value) {
  const attrs = value.split(";").map((attr)=>{
    const [key, ...values] = attr.trim().split("=");
    return [
      key,
      values.join("=")
    ];
  });
  if (!attrs[0]) {
    return null;
  }
  const cookie = {
    name: attrs[0][0],
    value: attrs[0][1]
  };
  for (const [key, value] of attrs.slice(1)){
    switch(key.toLocaleLowerCase()){
      case "expires":
        cookie.expires = new Date(value);
        break;
      case "max-age":
        cookie.maxAge = Number(value);
        if (cookie.maxAge < 0) {
          console.warn("Max-Age must be an integer superior or equal to 0. Cookie ignored.");
          return null;
        }
        break;
      case "domain":
        cookie.domain = value;
        break;
      case "path":
        cookie.path = value;
        break;
      case "secure":
        cookie.secure = true;
        break;
      case "httponly":
        cookie.httpOnly = true;
        break;
      case "samesite":
        cookie.sameSite = value;
        break;
      default:
        if (!Array.isArray(cookie.unparsed)) {
          cookie.unparsed = [];
        }
        cookie.unparsed.push([
          key,
          value
        ].join("="));
    }
  }
  if (cookie.name.startsWith("__Secure-")) {
    /** This requirement is mentioned in https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie but not the RFC. */ if (!cookie.secure) {
      console.warn("Cookies with names starting with `__Secure-` must be set with the secure flag. Cookie ignored.");
      return null;
    }
  }
  if (cookie.name.startsWith("__Host-")) {
    if (!cookie.secure) {
      console.warn("Cookies with names starting with `__Host-` must be set with the secure flag. Cookie ignored.");
      return null;
    }
    if (cookie.domain !== undefined) {
      console.warn("Cookies with names starting with `__Host-` must not have a domain specified. Cookie ignored.");
      return null;
    }
    if (cookie.path !== "/") {
      console.warn("Cookies with names starting with `__Host-` must have path be `/`. Cookie has been ignored.");
      return null;
    }
  }
  return cookie;
}
/**
 * Parse set-cookies of a header
 *
 * @example Usage
 * ```ts
 * import { getSetCookies } from "@std/http/cookie";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const headers = new Headers([
 *   ["Set-Cookie", "lulu=meow; Secure; Max-Age=3600"],
 *   ["Set-Cookie", "booya=kasha; HttpOnly; Path=/"],
 * ]);
 *
 * const cookies = getSetCookies(headers);
 *
 * assertEquals(cookies[0], {
 *   name: "lulu",
 *   value: "meow",
 *   secure: true,
 *   maxAge: 3600
 * });
 * ```
 *
 * @param headers The headers instance to get set-cookies from
 * @return List of cookies
 */ export function getSetCookies(headers) {
  return headers.getSetCookie()/** Parse each `set-cookie` header separately */ .map(parseSetCookie)/** Skip empty cookies */ .filter(Boolean);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaHR0cC8wLjIyNC41L2Nvb2tpZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gU3RydWN0dXJlZCBzaW1pbGFybHkgdG8gR28ncyBjb29raWUuZ29cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb2xhbmcvZ28vYmxvYi9tYXN0ZXIvc3JjL25ldC9odHRwL2Nvb2tpZS5nb1xuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gSFRUUCBDb29raWUuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzYyNjUuaHRtbCNzZWN0aW9uLTQuMi4xfVxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvb2tpZSB7XG4gIC8qKiBOYW1lIG9mIHRoZSBjb29raWUuICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIFZhbHVlIG9mIHRoZSBjb29raWUuICovXG4gIHZhbHVlOiBzdHJpbmc7XG4gIC8qKiBUaGUgY29va2llJ3MgYEV4cGlyZXNgIGF0dHJpYnV0ZSwgZWl0aGVyIGFzIGFuIGV4cGxpY2l0IGRhdGUgb3IgVVRDIG1pbGxpc2Vjb25kcy5cbiAgICogQGV4YW1wbGUgPGNhcHRpb24+RXhwbGljaXQgZGF0ZTo8L2NhcHRpb24+XG4gICAqXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IENvb2tpZSB9IGZyb20gXCJAc3RkL2h0dHAvY29va2llXCI7XG4gICAqIGNvbnN0IGNvb2tpZTogQ29va2llID0ge1xuICAgKiAgIG5hbWU6ICduYW1lJyxcbiAgICogICB2YWx1ZTogJ3ZhbHVlJyxcbiAgICogICAvLyBleHBpcmVzIG9uIEZyaSBEZWMgMzAgMjAyMlxuICAgKiAgIGV4cGlyZXM6IG5ldyBEYXRlKCcyMDIyLTEyLTMxJylcbiAgICogfVxuICAgKiBgYGBcbiAgICpcbiAgICogQGV4YW1wbGUgPGNhcHRpb24+VVRDIG1pbGxpc2Vjb25kczwvY2FwdGlvbj5cbiAgICpcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgQ29va2llIH0gZnJvbSBcIkBzdGQvaHR0cC9jb29raWVcIjtcbiAgICogY29uc3QgY29va2llOiBDb29raWUgPSB7XG4gICAqICAgbmFtZTogJ25hbWUnLFxuICAgKiAgIHZhbHVlOiAndmFsdWUnLFxuICAgKiAgIC8vIGV4cGlyZXMgMTAgc2Vjb25kcyBmcm9tIG5vd1xuICAgKiAgIGV4cGlyZXM6IERhdGUubm93KCkgKyAxMDAwMFxuICAgKiB9XG4gICAqIGBgYFxuICAgKi9cbiAgZXhwaXJlcz86IERhdGUgfCBudW1iZXI7XG4gIC8qKiBUaGUgY29va2llJ3MgYE1heC1BZ2VgIGF0dHJpYnV0ZSwgaW4gc2Vjb25kcy4gTXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLiBBIGNvb2tpZSB3aXRoIGEgYG1heEFnZWAgb2YgYDBgIGV4cGlyZXMgaW1tZWRpYXRlbHkuICovXG4gIG1heEFnZT86IG51bWJlcjtcbiAgLyoqIFRoZSBjb29raWUncyBgRG9tYWluYCBhdHRyaWJ1dGUuIFNwZWNpZmllcyB0aG9zZSBob3N0cyB0byB3aGljaCB0aGUgY29va2llIHdpbGwgYmUgc2VudC4gKi9cbiAgZG9tYWluPzogc3RyaW5nO1xuICAvKiogVGhlIGNvb2tpZSdzIGBQYXRoYCBhdHRyaWJ1dGUuIEEgY29va2llIHdpdGggYSBwYXRoIHdpbGwgb25seSBiZSBpbmNsdWRlZCBpbiB0aGUgYENvb2tpZWAgcmVxdWVzdCBoZWFkZXIgaWYgdGhlIHJlcXVlc3RlZCBVUkwgbWF0Y2hlcyB0aGF0IHBhdGguICovXG4gIHBhdGg/OiBzdHJpbmc7XG4gIC8qKiBUaGUgY29va2llJ3MgYFNlY3VyZWAgYXR0cmlidXRlLiBJZiBgdHJ1ZWAsIHRoZSBjb29raWUgd2lsbCBvbmx5IGJlIGluY2x1ZGVkIGluIHRoZSBgQ29va2llYCByZXF1ZXN0IGhlYWRlciBpZiB0aGUgY29ubmVjdGlvbiB1c2VzIFNTTCBhbmQgSFRUUFMuICovXG4gIHNlY3VyZT86IGJvb2xlYW47XG4gIC8qKiBUaGUgY29va2llJ3MgYEhUVFBPbmx5YCBhdHRyaWJ1dGUuIElmIGB0cnVlYCwgdGhlIGNvb2tpZSBjYW5ub3QgYmUgYWNjZXNzZWQgdmlhIEphdmFTY3JpcHQuICovXG4gIGh0dHBPbmx5PzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFRoZSBjb29raWUncyBgUGFydGl0aW9uZWRgIGF0dHJpYnV0ZS5cbiAgICogSWYgYHRydWVgLCB0aGUgY29va2llIHdpbGwgYmUgb25seSBiZSBpbmNsdWRlZCBpbiB0aGUgYENvb2tpZWAgcmVxdWVzdCBoZWFkZXIgaWZcbiAgICogdGhlIGRvbWFpbiBpdCBpcyBlbWJlZGRlZCBieSBtYXRjaGVzIHRoZSBkb21haW4gdGhlIGNvb2tpZSB3YXMgb3JpZ2luYWxseSBzZXQgZnJvbS5cbiAgICpcbiAgICogV2FybmluZzogVGhpcyBpcyBhbiBhdHRyaWJ1dGUgdGhhdCBoYXMgbm90IGJlZW4gZnVsbHkgc3RhbmRhcmRpemVkIHlldC5cbiAgICogSXQgbWF5IGNoYW5nZSBpbiB0aGUgZnV0dXJlIHdpdGhvdXQgZm9sbG93aW5nIHRoZSBzZW12ZXIgc2VtYW50aWNzIG9mIHRoZSBwYWNrYWdlLlxuICAgKiBDbGllbnRzIG1heSBpZ25vcmUgdGhlIGF0dHJpYnV0ZSB1bnRpbCB0aGV5IHVuZGVyc3RhbmQgaXQuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtmYWxzZX1cbiAgICovXG4gIHBhcnRpdGlvbmVkPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEFsbG93cyBzZXJ2ZXJzIHRvIGFzc2VydCB0aGF0IGEgY29va2llIG91Z2h0IG5vdCB0b1xuICAgKiBiZSBzZW50IGFsb25nIHdpdGggY3Jvc3Mtc2l0ZSByZXF1ZXN0cy5cbiAgICovXG4gIHNhbWVTaXRlPzogXCJTdHJpY3RcIiB8IFwiTGF4XCIgfCBcIk5vbmVcIjtcbiAgLyoqIEFkZGl0aW9uYWwga2V5IHZhbHVlIHBhaXJzIHdpdGggdGhlIGZvcm0gXCJrZXk9dmFsdWVcIiAqL1xuICB1bnBhcnNlZD86IHN0cmluZ1tdO1xufVxuXG5jb25zdCBGSUVMRF9DT05URU5UX1JFR0VYUCA9IC9eKD89W1xceDIwLVxceDdFXSokKVteKClAPD4sOzpcXFxcXCJcXFtcXF0/PXt9XFxzXSskLztcblxuZnVuY3Rpb24gdG9TdHJpbmcoY29va2llOiBDb29raWUpOiBzdHJpbmcge1xuICBpZiAoIWNvb2tpZS5uYW1lKSB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH1cbiAgY29uc3Qgb3V0OiBzdHJpbmdbXSA9IFtdO1xuICB2YWxpZGF0ZU5hbWUoY29va2llLm5hbWUpO1xuICB2YWxpZGF0ZVZhbHVlKGNvb2tpZS5uYW1lLCBjb29raWUudmFsdWUpO1xuICBvdXQucHVzaChgJHtjb29raWUubmFtZX09JHtjb29raWUudmFsdWV9YCk7XG5cbiAgLy8gRmFsbGJhY2sgZm9yIGludmFsaWQgU2V0LUNvb2tpZVxuICAvLyByZWY6IGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM2MjY1Lmh0bWwjc2VjdGlvbi0zLjFcbiAgaWYgKGNvb2tpZS5uYW1lLnN0YXJ0c1dpdGgoXCJfX1NlY3VyZVwiKSkge1xuICAgIGNvb2tpZS5zZWN1cmUgPSB0cnVlO1xuICB9XG4gIGlmIChjb29raWUubmFtZS5zdGFydHNXaXRoKFwiX19Ib3N0XCIpKSB7XG4gICAgY29va2llLnBhdGggPSBcIi9cIjtcbiAgICBjb29raWUuc2VjdXJlID0gdHJ1ZTtcbiAgICBkZWxldGUgY29va2llLmRvbWFpbjtcbiAgfVxuXG4gIGlmIChjb29raWUuc2VjdXJlKSB7XG4gICAgb3V0LnB1c2goXCJTZWN1cmVcIik7XG4gIH1cbiAgaWYgKGNvb2tpZS5odHRwT25seSkge1xuICAgIG91dC5wdXNoKFwiSHR0cE9ubHlcIik7XG4gIH1cbiAgaWYgKGNvb2tpZS5wYXJ0aXRpb25lZCkge1xuICAgIG91dC5wdXNoKFwiUGFydGl0aW9uZWRcIik7XG4gIH1cbiAgaWYgKHR5cGVvZiBjb29raWUubWF4QWdlID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0ludGVnZXIoY29va2llLm1heEFnZSkpIHtcbiAgICBpZiAoY29va2llLm1heEFnZSA8IDApIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxuICAgICAgICBcIk1heC1BZ2UgbXVzdCBiZSBhbiBpbnRlZ2VyIHN1cGVyaW9yIG9yIGVxdWFsIHRvIDAuIENvb2tpZSBpZ25vcmVkLlwiLFxuICAgICAgKTtcbiAgICB9XG4gICAgb3V0LnB1c2goYE1heC1BZ2U9JHtjb29raWUubWF4QWdlfWApO1xuICB9XG4gIGlmIChjb29raWUuZG9tYWluKSB7XG4gICAgdmFsaWRhdGVEb21haW4oY29va2llLmRvbWFpbik7XG4gICAgb3V0LnB1c2goYERvbWFpbj0ke2Nvb2tpZS5kb21haW59YCk7XG4gIH1cbiAgaWYgKGNvb2tpZS5zYW1lU2l0ZSkge1xuICAgIG91dC5wdXNoKGBTYW1lU2l0ZT0ke2Nvb2tpZS5zYW1lU2l0ZX1gKTtcbiAgfVxuICBpZiAoY29va2llLnBhdGgpIHtcbiAgICB2YWxpZGF0ZVBhdGgoY29va2llLnBhdGgpO1xuICAgIG91dC5wdXNoKGBQYXRoPSR7Y29va2llLnBhdGh9YCk7XG4gIH1cbiAgaWYgKGNvb2tpZS5leHBpcmVzKSB7XG4gICAgY29uc3QgeyBleHBpcmVzIH0gPSBjb29raWU7XG4gICAgY29uc3QgZGF0ZSA9IHR5cGVvZiBleHBpcmVzID09PSBcIm51bWJlclwiID8gbmV3IERhdGUoZXhwaXJlcykgOiBleHBpcmVzO1xuICAgIG91dC5wdXNoKGBFeHBpcmVzPSR7ZGF0ZS50b1VUQ1N0cmluZygpfWApO1xuICB9XG4gIGlmIChjb29raWUudW5wYXJzZWQpIHtcbiAgICBvdXQucHVzaChjb29raWUudW5wYXJzZWQuam9pbihcIjsgXCIpKTtcbiAgfVxuICByZXR1cm4gb3V0LmpvaW4oXCI7IFwiKTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBDb29raWUgTmFtZS5cbiAqIEBwYXJhbSBuYW1lIENvb2tpZSBuYW1lLlxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZU5hbWUobmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCkge1xuICBpZiAobmFtZSAmJiAhRklFTERfQ09OVEVOVF9SRUdFWFAudGVzdChuYW1lKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgY29va2llIG5hbWU6IFwiJHtuYW1lfVwiLmApO1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGUgUGF0aCBWYWx1ZS5cbiAqIFNlZSB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzYyNjUuaHRtbCNzZWN0aW9uLTQuMS4yLjR9LlxuICogQHBhcmFtIHBhdGggUGF0aCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVQYXRoKHBhdGg6IHN0cmluZyB8IG51bGwpIHtcbiAgaWYgKHBhdGggPT09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYyA9IHBhdGguY2hhckF0KGkpO1xuICAgIGlmIChcbiAgICAgIGMgPCBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4MjApIHx8IGMgPiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4N0UpIHx8XG4gICAgICBjID09PSBcIjtcIlxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBwYXRoICsgXCI6IEludmFsaWQgY29va2llIHBhdGggY2hhciAnXCIgKyBjICsgXCInXCIsXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlIENvb2tpZSBWYWx1ZS5cbiAqIFNlZSB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzYyNjUuaHRtbCNzZWN0aW9uLTQuMX0uXG4gKiBAcGFyYW0gdmFsdWUgQ29va2llIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZVZhbHVlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyB8IG51bGwpIHtcbiAgaWYgKHZhbHVlID09PSBudWxsKSByZXR1cm47XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjID0gdmFsdWUuY2hhckF0KGkpO1xuICAgIGlmIChcbiAgICAgIGMgPCBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4MjEpIHx8IGMgPT09IFN0cmluZy5mcm9tQ2hhckNvZGUoMHgyMikgfHxcbiAgICAgIGMgPT09IFN0cmluZy5mcm9tQ2hhckNvZGUoMHgyYykgfHwgYyA9PT0gU3RyaW5nLmZyb21DaGFyQ29kZSgweDNiKSB8fFxuICAgICAgYyA9PT0gU3RyaW5nLmZyb21DaGFyQ29kZSgweDVjKSB8fCBjID09PSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4N2YpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiUkZDMjYxNiBjb29raWUgJ1wiICsgbmFtZSArIFwiJyBjYW5ub3QgY29udGFpbiBjaGFyYWN0ZXIgJ1wiICsgYyArIFwiJ1wiLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGMgPiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ODApKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiUkZDMjYxNiBjb29raWUgJ1wiICsgbmFtZSArIFwiJyBjYW4gb25seSBoYXZlIFVTLUFTQ0lJIGNoYXJzIGFzIHZhbHVlXCIgK1xuICAgICAgICAgIGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNiksXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlIENvb2tpZSBEb21haW4uXG4gKiBTZWUge0BsaW5rIGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM2MjY1Lmh0bWwjc2VjdGlvbi00LjEuMi4zfS5cbiAqIEBwYXJhbSBkb21haW4gQ29va2llIGRvbWFpbi5cbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVEb21haW4oZG9tYWluOiBzdHJpbmcpIHtcbiAgY29uc3QgY2hhcjEgPSBkb21haW4uY2hhckF0KDApO1xuICBjb25zdCBjaGFyTiA9IGRvbWFpbi5jaGFyQXQoZG9tYWluLmxlbmd0aCAtIDEpO1xuICBpZiAoY2hhcjEgPT09IFwiLVwiIHx8IGNoYXJOID09PSBcIi5cIiB8fCBjaGFyTiA9PT0gXCItXCIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkludmFsaWQgZmlyc3QvbGFzdCBjaGFyIGluIGNvb2tpZSBkb21haW46IFwiICsgZG9tYWluLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSBjb29raWVzIG9mIGEgaGVhZGVyXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBnZXRDb29raWVzIH0gZnJvbSBcIkBzdGQvaHR0cC9jb29raWVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgaGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG4gKiBoZWFkZXJzLnNldChcIkNvb2tpZVwiLCBcImZ1bGw9b2Y7IHRhc3R5PWNob2NvbGF0ZVwiKTtcbiAqXG4gKiBjb25zdCBjb29raWVzID0gZ2V0Q29va2llcyhoZWFkZXJzKTtcbiAqIGFzc2VydEVxdWFscyhjb29raWVzLCB7IGZ1bGw6IFwib2ZcIiwgdGFzdHk6IFwiY2hvY29sYXRlXCIgfSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gaGVhZGVycyBUaGUgaGVhZGVycyBpbnN0YW5jZSB0byBnZXQgY29va2llcyBmcm9tXG4gKiBAcmV0dXJuIE9iamVjdCB3aXRoIGNvb2tpZSBuYW1lcyBhcyBrZXlzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb29raWVzKGhlYWRlcnM6IEhlYWRlcnMpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgY29uc3QgY29va2llID0gaGVhZGVycy5nZXQoXCJDb29raWVcIik7XG4gIGlmIChjb29raWUgIT09IG51bGwpIHtcbiAgICBjb25zdCBvdXQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICBjb25zdCBjID0gY29va2llLnNwbGl0KFwiO1wiKTtcbiAgICBmb3IgKGNvbnN0IGt2IG9mIGMpIHtcbiAgICAgIGNvbnN0IFtjb29raWVLZXksIC4uLmNvb2tpZVZhbF0gPSBrdi5zcGxpdChcIj1cIik7XG4gICAgICBpZiAoY29va2llS2V5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNvb2tpZSBjYW5ub3Qgc3RhcnQgd2l0aCAnPSdcIik7XG4gICAgICB9XG4gICAgICBjb25zdCBrZXkgPSBjb29raWVLZXkudHJpbSgpO1xuICAgICAgb3V0W2tleV0gPSBjb29raWVWYWwuam9pbihcIj1cIik7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH1cbiAgcmV0dXJuIHt9O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29va2llIGhlYWRlciBwcm9wZXJseSBpbiB0aGUgaGVhZGVyc1xuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgQ29va2llLCBzZXRDb29raWUgfSBmcm9tIFwiQHN0ZC9odHRwL2Nvb2tpZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcbiAqIGNvbnN0IGNvb2tpZTogQ29va2llID0geyBuYW1lOiBcIlNwYWNlXCIsIHZhbHVlOiBcIkNhdFwiIH07XG4gKiBzZXRDb29raWUoaGVhZGVycywgY29va2llKTtcbiAqXG4gKiBjb25zdCBjb29raWVIZWFkZXIgPSBoZWFkZXJzLmdldChcInNldC1jb29raWVcIik7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGNvb2tpZUhlYWRlciwgXCJTcGFjZT1DYXRcIik7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gaGVhZGVycyBUaGUgaGVhZGVycyBpbnN0YW5jZSB0byBzZXQgdGhlIGNvb2tpZSB0b1xuICogQHBhcmFtIGNvb2tpZSBDb29raWUgdG8gc2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb29raWUoaGVhZGVyczogSGVhZGVycywgY29va2llOiBDb29raWUpIHtcbiAgLy8gUGFyc2luZyBjb29raWUgaGVhZGVycyB0byBtYWtlIGNvbnNpc3RlbnQgc2V0LWNvb2tpZSBoZWFkZXJcbiAgLy8gcmVmOiBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjNjI2NS5odG1sI3NlY3Rpb24tNC4xLjFcbiAgY29uc3QgdiA9IHRvU3RyaW5nKGNvb2tpZSk7XG4gIGlmICh2KSB7XG4gICAgaGVhZGVycy5hcHBlbmQoXCJTZXQtQ29va2llXCIsIHYpO1xuICB9XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb29raWUgaGVhZGVyIHdpdGggZW1wdHkgdmFsdWUgaW4gdGhlIGhlYWRlcnMgdG8gZGVsZXRlIGl0XG4gKlxuICogPiBOb3RlOiBEZWxldGluZyBhIGBDb29raWVgIHdpbGwgc2V0IGl0cyBleHBpcmF0aW9uIGRhdGUgYmVmb3JlIG5vdy4gRm9yY2luZ1xuICogPiB0aGUgYnJvd3NlciB0byBkZWxldGUgaXQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkZWxldGVDb29raWUgfSBmcm9tIFwiQHN0ZC9odHRwL2Nvb2tpZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcbiAqIGRlbGV0ZUNvb2tpZShoZWFkZXJzLCBcImRlbm9cIik7XG4gKlxuICogY29uc3QgY29va2llSGVhZGVyID0gaGVhZGVycy5nZXQoXCJzZXQtY29va2llXCIpO1xuICpcbiAqIGFzc2VydEVxdWFscyhjb29raWVIZWFkZXIsIFwiZGVubz07IEV4cGlyZXM9VGh1LCAwMSBKYW4gMTk3MCAwMDowMDowMCBHTVRcIik7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gaGVhZGVycyBUaGUgaGVhZGVycyBpbnN0YW5jZSB0byBkZWxldGUgdGhlIGNvb2tpZSBmcm9tXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIGNvb2tpZVxuICogQHBhcmFtIGF0dHJpYnV0ZXMgQWRkaXRpb25hbCBjb29raWUgYXR0cmlidXRlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlQ29va2llKFxuICBoZWFkZXJzOiBIZWFkZXJzLFxuICBuYW1lOiBzdHJpbmcsXG4gIGF0dHJpYnV0ZXM/OiB7IHBhdGg/OiBzdHJpbmc7IGRvbWFpbj86IHN0cmluZyB9LFxuKSB7XG4gIHNldENvb2tpZShoZWFkZXJzLCB7XG4gICAgbmFtZTogbmFtZSxcbiAgICB2YWx1ZTogXCJcIixcbiAgICBleHBpcmVzOiBuZXcgRGF0ZSgwKSxcbiAgICAuLi5hdHRyaWJ1dGVzLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gcGFyc2VTZXRDb29raWUodmFsdWU6IHN0cmluZyk6IENvb2tpZSB8IG51bGwge1xuICBjb25zdCBhdHRycyA9IHZhbHVlXG4gICAgLnNwbGl0KFwiO1wiKVxuICAgIC5tYXAoKGF0dHIpID0+IHtcbiAgICAgIGNvbnN0IFtrZXksIC4uLnZhbHVlc10gPSBhdHRyLnRyaW0oKS5zcGxpdChcIj1cIik7XG4gICAgICByZXR1cm4gW2tleSEsIHZhbHVlcy5qb2luKFwiPVwiKV0gYXMgY29uc3Q7XG4gICAgfSk7XG5cbiAgaWYgKCFhdHRyc1swXSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgY29va2llOiBDb29raWUgPSB7XG4gICAgbmFtZTogYXR0cnNbMF1bMF0sXG4gICAgdmFsdWU6IGF0dHJzWzBdWzFdLFxuICB9O1xuXG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGF0dHJzLnNsaWNlKDEpKSB7XG4gICAgc3dpdGNoIChrZXkudG9Mb2NhbGVMb3dlckNhc2UoKSkge1xuICAgICAgY2FzZSBcImV4cGlyZXNcIjpcbiAgICAgICAgY29va2llLmV4cGlyZXMgPSBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm1heC1hZ2VcIjpcbiAgICAgICAgY29va2llLm1heEFnZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICAgIGlmIChjb29raWUubWF4QWdlIDwgMCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgIFwiTWF4LUFnZSBtdXN0IGJlIGFuIGludGVnZXIgc3VwZXJpb3Igb3IgZXF1YWwgdG8gMC4gQ29va2llIGlnbm9yZWQuXCIsXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJkb21haW5cIjpcbiAgICAgICAgY29va2llLmRvbWFpbiA9IHZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJwYXRoXCI6XG4gICAgICAgIGNvb2tpZS5wYXRoID0gdmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInNlY3VyZVwiOlxuICAgICAgICBjb29raWUuc2VjdXJlID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiaHR0cG9ubHlcIjpcbiAgICAgICAgY29va2llLmh0dHBPbmx5ID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwic2FtZXNpdGVcIjpcbiAgICAgICAgY29va2llLnNhbWVTaXRlID0gdmFsdWUgYXMgQ29va2llW1wic2FtZVNpdGVcIl07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGNvb2tpZS51bnBhcnNlZCkpIHtcbiAgICAgICAgICBjb29raWUudW5wYXJzZWQgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBjb29raWUudW5wYXJzZWQucHVzaChba2V5LCB2YWx1ZV0uam9pbihcIj1cIikpO1xuICAgIH1cbiAgfVxuICBpZiAoY29va2llLm5hbWUuc3RhcnRzV2l0aChcIl9fU2VjdXJlLVwiKSkge1xuICAgIC8qKiBUaGlzIHJlcXVpcmVtZW50IGlzIG1lbnRpb25lZCBpbiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVFRQL0hlYWRlcnMvU2V0LUNvb2tpZSBidXQgbm90IHRoZSBSRkMuICovXG4gICAgaWYgKCFjb29raWUuc2VjdXJlKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIFwiQ29va2llcyB3aXRoIG5hbWVzIHN0YXJ0aW5nIHdpdGggYF9fU2VjdXJlLWAgbXVzdCBiZSBzZXQgd2l0aCB0aGUgc2VjdXJlIGZsYWcuIENvb2tpZSBpZ25vcmVkLlwiLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBpZiAoY29va2llLm5hbWUuc3RhcnRzV2l0aChcIl9fSG9zdC1cIikpIHtcbiAgICBpZiAoIWNvb2tpZS5zZWN1cmUpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgXCJDb29raWVzIHdpdGggbmFtZXMgc3RhcnRpbmcgd2l0aCBgX19Ib3N0LWAgbXVzdCBiZSBzZXQgd2l0aCB0aGUgc2VjdXJlIGZsYWcuIENvb2tpZSBpZ25vcmVkLlwiLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoY29va2llLmRvbWFpbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIFwiQ29va2llcyB3aXRoIG5hbWVzIHN0YXJ0aW5nIHdpdGggYF9fSG9zdC1gIG11c3Qgbm90IGhhdmUgYSBkb21haW4gc3BlY2lmaWVkLiBDb29raWUgaWdub3JlZC5cIixcbiAgICAgICk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGNvb2tpZS5wYXRoICE9PSBcIi9cIikge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBcIkNvb2tpZXMgd2l0aCBuYW1lcyBzdGFydGluZyB3aXRoIGBfX0hvc3QtYCBtdXN0IGhhdmUgcGF0aCBiZSBgL2AuIENvb2tpZSBoYXMgYmVlbiBpZ25vcmVkLlwiLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY29va2llO1xufVxuXG4vKipcbiAqIFBhcnNlIHNldC1jb29raWVzIG9mIGEgaGVhZGVyXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBnZXRTZXRDb29raWVzIH0gZnJvbSBcIkBzdGQvaHR0cC9jb29raWVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgaGVhZGVycyA9IG5ldyBIZWFkZXJzKFtcbiAqICAgW1wiU2V0LUNvb2tpZVwiLCBcImx1bHU9bWVvdzsgU2VjdXJlOyBNYXgtQWdlPTM2MDBcIl0sXG4gKiAgIFtcIlNldC1Db29raWVcIiwgXCJib295YT1rYXNoYTsgSHR0cE9ubHk7IFBhdGg9L1wiXSxcbiAqIF0pO1xuICpcbiAqIGNvbnN0IGNvb2tpZXMgPSBnZXRTZXRDb29raWVzKGhlYWRlcnMpO1xuICpcbiAqIGFzc2VydEVxdWFscyhjb29raWVzWzBdLCB7XG4gKiAgIG5hbWU6IFwibHVsdVwiLFxuICogICB2YWx1ZTogXCJtZW93XCIsXG4gKiAgIHNlY3VyZTogdHJ1ZSxcbiAqICAgbWF4QWdlOiAzNjAwXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBoZWFkZXJzIFRoZSBoZWFkZXJzIGluc3RhbmNlIHRvIGdldCBzZXQtY29va2llcyBmcm9tXG4gKiBAcmV0dXJuIExpc3Qgb2YgY29va2llc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2V0Q29va2llcyhoZWFkZXJzOiBIZWFkZXJzKTogQ29va2llW10ge1xuICByZXR1cm4gaGVhZGVycy5nZXRTZXRDb29raWUoKVxuICAgIC8qKiBQYXJzZSBlYWNoIGBzZXQtY29va2llYCBoZWFkZXIgc2VwYXJhdGVseSAqL1xuICAgIC5tYXAocGFyc2VTZXRDb29raWUpXG4gICAgLyoqIFNraXAgZW1wdHkgY29va2llcyAqL1xuICAgIC5maWx0ZXIoQm9vbGVhbikgYXMgQ29va2llW107XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHlDQUF5QztBQUN6QyxrRUFBa0U7QUFDbEUscUNBQXFDO0FBRXJDOzs7O0NBSUMsR0ErREQsTUFBTSx1QkFBdUI7QUFFN0IsU0FBUyxTQUFTLE1BQWM7RUFDOUIsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFO0lBQ2hCLE9BQU87RUFDVDtFQUNBLE1BQU0sTUFBZ0IsRUFBRTtFQUN4QixhQUFhLE9BQU8sSUFBSTtFQUN4QixjQUFjLE9BQU8sSUFBSSxFQUFFLE9BQU8sS0FBSztFQUN2QyxJQUFJLElBQUksQ0FBQyxHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUMsRUFBRSxPQUFPLEtBQUssRUFBRTtFQUV6QyxrQ0FBa0M7RUFDbEMsK0RBQStEO0VBQy9ELElBQUksT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWE7SUFDdEMsT0FBTyxNQUFNLEdBQUc7RUFDbEI7RUFDQSxJQUFJLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXO0lBQ3BDLE9BQU8sSUFBSSxHQUFHO0lBQ2QsT0FBTyxNQUFNLEdBQUc7SUFDaEIsT0FBTyxPQUFPLE1BQU07RUFDdEI7RUFFQSxJQUFJLE9BQU8sTUFBTSxFQUFFO0lBQ2pCLElBQUksSUFBSSxDQUFDO0VBQ1g7RUFDQSxJQUFJLE9BQU8sUUFBUSxFQUFFO0lBQ25CLElBQUksSUFBSSxDQUFDO0VBQ1g7RUFDQSxJQUFJLE9BQU8sV0FBVyxFQUFFO0lBQ3RCLElBQUksSUFBSSxDQUFD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
// denoCacheMetadata=10613891198487587230,12495752678876422321