// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { consumeMediaParam, decode2331Encoding } from "./_util.ts";
const SEMICOLON_REGEXP = /^\s*;\s*$/;
/**
 * Parses the media type and any optional parameters, per
 * {@link https://www.rfc-editor.org/rfc/rfc1521.html | RFC 1521}.
 *
 * Media types are the values in `Content-Type` and `Content-Disposition`
 * headers. On success the function returns a tuple where the first element is
 * the media type and the second element is the optional parameters or
 * `undefined` if there are none.
 *
 * The function will throw if the parsed value is invalid.
 *
 * The returned media type will be normalized to be lower case, and returned
 * params keys will be normalized to lower case, but preserves the casing of
 * the value.
 *
 * @param type The media type to parse.
 *
 * @returns A tuple where the first element is the media type and the second
 * element is the optional parameters or `undefined` if there are none.
 *
 * @example Usage
 * ```ts
 * import { parseMediaType } from "@std/media-types/parse-media-type";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(parseMediaType("application/JSON"), ["application/json", undefined]);
 * assertEquals(parseMediaType("text/html; charset=UTF-8"), ["text/html", { charset: "UTF-8" }]);
 * ```
 */ export function parseMediaType(type) {
  const [base] = type.split(";");
  const mediaType = base.toLowerCase().trim();
  const params = {};
  // Map of base parameter name -> parameter name -> value
  // for parameters containing a '*' character.
  const continuation = new Map();
  type = type.slice(base.length);
  while(type.length){
    type = type.trimStart();
    if (type.length === 0) {
      break;
    }
    const [key, value, rest] = consumeMediaParam(type);
    if (!key) {
      if (SEMICOLON_REGEXP.test(rest)) {
        break;
      }
      throw new TypeError(`Cannot parse media type: invalid parameter "${type}"`);
    }
    let pmap = params;
    const [baseName, rest2] = key.split("*");
    if (baseName && rest2 !== undefined) {
      if (!continuation.has(baseName)) {
        continuation.set(baseName, {});
      }
      pmap = continuation.get(baseName);
    }
    if (key in pmap) {
      throw new TypeError("Cannot parse media type: duplicate key");
    }
    pmap[key] = value;
    type = rest;
  }
  // Stitch together any continuations or things with stars
  // (i.e. RFC 2231 things with stars: "foo*0" or "foo*")
  let str = "";
  for (const [key, pieceMap] of continuation){
    const singlePartKey = `${key}*`;
    const type = pieceMap[singlePartKey];
    if (type) {
      const decv = decode2331Encoding(type);
      if (decv) {
        params[key] = decv;
      }
      continue;
    }
    str = "";
    let valid = false;
    for(let n = 0;; n++){
      const simplePart = `${key}*${n}`;
      let type = pieceMap[simplePart];
      if (type) {
        valid = true;
        str += type;
        continue;
      }
      const encodedPart = `${simplePart}*`;
      type = pieceMap[encodedPart];
      if (!type) {
        break;
      }
      valid = true;
      if (n === 0) {
        const decv = decode2331Encoding(type);
        if (decv) {
          str += decv;
        }
      } else {
        const decv = decodeURI(type);
        str += decv;
      }
    }
    if (valid) {
      params[key] = str;
    }
  }
  return [
    mediaType,
    Object.keys(params).length ? params : undefined
  ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMS4wLjMvcGFyc2VfbWVkaWFfdHlwZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBjb25zdW1lTWVkaWFQYXJhbSwgZGVjb2RlMjMzMUVuY29kaW5nIH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcblxuY29uc3QgU0VNSUNPTE9OX1JFR0VYUCA9IC9eXFxzKjtcXHMqJC87XG4vKipcbiAqIFBhcnNlcyB0aGUgbWVkaWEgdHlwZSBhbmQgYW55IG9wdGlvbmFsIHBhcmFtZXRlcnMsIHBlclxuICoge0BsaW5rIGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmMxNTIxLmh0bWwgfCBSRkMgMTUyMX0uXG4gKlxuICogTWVkaWEgdHlwZXMgYXJlIHRoZSB2YWx1ZXMgaW4gYENvbnRlbnQtVHlwZWAgYW5kIGBDb250ZW50LURpc3Bvc2l0aW9uYFxuICogaGVhZGVycy4gT24gc3VjY2VzcyB0aGUgZnVuY3Rpb24gcmV0dXJucyBhIHR1cGxlIHdoZXJlIHRoZSBmaXJzdCBlbGVtZW50IGlzXG4gKiB0aGUgbWVkaWEgdHlwZSBhbmQgdGhlIHNlY29uZCBlbGVtZW50IGlzIHRoZSBvcHRpb25hbCBwYXJhbWV0ZXJzIG9yXG4gKiBgdW5kZWZpbmVkYCBpZiB0aGVyZSBhcmUgbm9uZS5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gd2lsbCB0aHJvdyBpZiB0aGUgcGFyc2VkIHZhbHVlIGlzIGludmFsaWQuXG4gKlxuICogVGhlIHJldHVybmVkIG1lZGlhIHR5cGUgd2lsbCBiZSBub3JtYWxpemVkIHRvIGJlIGxvd2VyIGNhc2UsIGFuZCByZXR1cm5lZFxuICogcGFyYW1zIGtleXMgd2lsbCBiZSBub3JtYWxpemVkIHRvIGxvd2VyIGNhc2UsIGJ1dCBwcmVzZXJ2ZXMgdGhlIGNhc2luZyBvZlxuICogdGhlIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB0eXBlIFRoZSBtZWRpYSB0eXBlIHRvIHBhcnNlLlxuICpcbiAqIEByZXR1cm5zIEEgdHVwbGUgd2hlcmUgdGhlIGZpcnN0IGVsZW1lbnQgaXMgdGhlIG1lZGlhIHR5cGUgYW5kIHRoZSBzZWNvbmRcbiAqIGVsZW1lbnQgaXMgdGhlIG9wdGlvbmFsIHBhcmFtZXRlcnMgb3IgYHVuZGVmaW5lZGAgaWYgdGhlcmUgYXJlIG5vbmUuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZU1lZGlhVHlwZSB9IGZyb20gXCJAc3RkL21lZGlhLXR5cGVzL3BhcnNlLW1lZGlhLXR5cGVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydEVxdWFscyhwYXJzZU1lZGlhVHlwZShcImFwcGxpY2F0aW9uL0pTT05cIiksIFtcImFwcGxpY2F0aW9uL2pzb25cIiwgdW5kZWZpbmVkXSk7XG4gKiBhc3NlcnRFcXVhbHMocGFyc2VNZWRpYVR5cGUoXCJ0ZXh0L2h0bWw7IGNoYXJzZXQ9VVRGLThcIiksIFtcInRleHQvaHRtbFwiLCB7IGNoYXJzZXQ6IFwiVVRGLThcIiB9XSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTWVkaWFUeXBlKFxuICB0eXBlOiBzdHJpbmcsXG4pOiBbbWVkaWFUeXBlOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IHVuZGVmaW5lZF0ge1xuICBjb25zdCBbYmFzZV0gPSB0eXBlLnNwbGl0KFwiO1wiKSBhcyBbc3RyaW5nXTtcbiAgY29uc3QgbWVkaWFUeXBlID0gYmFzZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcblxuICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgLy8gTWFwIG9mIGJhc2UgcGFyYW1ldGVyIG5hbWUgLT4gcGFyYW1ldGVyIG5hbWUgLT4gdmFsdWVcbiAgLy8gZm9yIHBhcmFtZXRlcnMgY29udGFpbmluZyBhICcqJyBjaGFyYWN0ZXIuXG4gIGNvbnN0IGNvbnRpbnVhdGlvbiA9IG5ldyBNYXA8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PigpO1xuXG4gIHR5cGUgPSB0eXBlLnNsaWNlKGJhc2UubGVuZ3RoKTtcbiAgd2hpbGUgKHR5cGUubGVuZ3RoKSB7XG4gICAgdHlwZSA9IHR5cGUudHJpbVN0YXJ0KCk7XG4gICAgaWYgKHR5cGUubGVuZ3RoID09PSAwKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY29uc3QgW2tleSwgdmFsdWUsIHJlc3RdID0gY29uc3VtZU1lZGlhUGFyYW0odHlwZSk7XG4gICAgaWYgKCFrZXkpIHtcbiAgICAgIGlmIChTRU1JQ09MT05fUkVHRVhQLnRlc3QocmVzdCkpIHtcbiAgICAgICAgLy8gaWdub3JlIHRyYWlsaW5nIHNlbWljb2xvbnNcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBgQ2Fubm90IHBhcnNlIG1lZGlhIHR5cGU6IGludmFsaWQgcGFyYW1ldGVyIFwiJHt0eXBlfVwiYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHBtYXAgPSBwYXJhbXM7XG4gICAgY29uc3QgW2Jhc2VOYW1lLCByZXN0Ml0gPSBrZXkuc3BsaXQoXCIqXCIpO1xuICAgIGlmIChiYXNlTmFtZSAmJiByZXN0MiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIWNvbnRpbnVhdGlvbi5oYXMoYmFzZU5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVhdGlvbi5zZXQoYmFzZU5hbWUsIHt9KTtcbiAgICAgIH1cbiAgICAgIHBtYXAgPSBjb250aW51YXRpb24uZ2V0KGJhc2VOYW1lKSE7XG4gICAgfVxuICAgIGlmIChrZXkgaW4gcG1hcCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBwYXJzZSBtZWRpYSB0eXBlOiBkdXBsaWNhdGUga2V5XCIpO1xuICAgIH1cbiAgICBwbWFwW2tleV0gPSB2YWx1ZTtcbiAgICB0eXBlID0gcmVzdDtcbiAgfVxuXG4gIC8vIFN0aXRjaCB0b2dldGhlciBhbnkgY29udGludWF0aW9ucyBvciB0aGluZ3Mgd2l0aCBzdGFyc1xuICAvLyAoaS5lLiBSRkMgMjIzMSB0aGluZ3Mgd2l0aCBzdGFyczogXCJmb28qMFwiIG9yIFwiZm9vKlwiKVxuICBsZXQgc3RyID0gXCJcIjtcbiAgZm9yIChjb25zdCBba2V5LCBwaWVjZU1hcF0gb2YgY29udGludWF0aW9uKSB7XG4gICAgY29uc3Qgc2luZ2xlUGFydEtleSA9IGAke2tleX0qYDtcbiAgICBjb25zdCB0eXBlID0gcGllY2VNYXBbc2luZ2xlUGFydEtleV07XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIGNvbnN0IGRlY3YgPSBkZWNvZGUyMzMxRW5jb2RpbmcodHlwZSk7XG4gICAgICBpZiAoZGVjdikge1xuICAgICAgICBwYXJhbXNba2V5XSA9IGRlY3Y7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBzdHIgPSBcIlwiO1xuICAgIGxldCB2YWxpZCA9IGZhbHNlO1xuICAgIGZvciAobGV0IG4gPSAwOzsgbisrKSB7XG4gICAgICBjb25zdCBzaW1wbGVQYXJ0ID0gYCR7a2V5fSoke259YDtcbiAgICAgIGxldCB0eXBlID0gcGllY2VNYXBbc2ltcGxlUGFydF07XG4gICAgICBpZiAodHlwZSkge1xuICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgIHN0ciArPSB0eXBlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVuY29kZWRQYXJ0ID0gYCR7c2ltcGxlUGFydH0qYDtcbiAgICAgIHR5cGUgPSBwaWVjZU1hcFtlbmNvZGVkUGFydF07XG4gICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB2YWxpZCA9IHRydWU7XG4gICAgICBpZiAobiA9PT0gMCkge1xuICAgICAgICBjb25zdCBkZWN2ID0gZGVjb2RlMjMzMUVuY29kaW5nKHR5cGUpO1xuICAgICAgICBpZiAoZGVjdikge1xuICAgICAgICAgIHN0ciArPSBkZWN2O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkZWN2ID0gZGVjb2RlVVJJKHR5cGUpO1xuICAgICAgICBzdHIgKz0gZGVjdjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhbGlkKSB7XG4gICAgICBwYXJhbXNba2V5XSA9IHN0cjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gW21lZGlhVHlwZSwgT2JqZWN0LmtleXMocGFyYW1zKS5sZW5ndGggPyBwYXJhbXMgOiB1bmRlZmluZWRdO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxpQkFBaUIsRUFBRSxrQkFBa0IsUUFBUSxhQUFhO0FBRW5FLE1BQU0sbUJBQW1CO0FBQ3pCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNEJDLEdBQ0QsT0FBTyxTQUFTLGVBQ2QsSUFBWTtFQUVaLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxLQUFLLENBQUM7RUFDMUIsTUFBTSxZQUFZLEtBQUssV0FBVyxHQUFHLElBQUk7RUFFekMsTUFBTSxTQUFpQyxDQUFDO0VBQ3hDLHdEQUF3RDtFQUN4RCw2Q0FBNkM7RUFDN0MsTUFBTSxlQUFlLElBQUk7RUFFekIsT0FBTyxLQUFLLEtBQUssQ0FBQyxLQUFLLE1BQU07RUFDN0IsTUFBTyxLQUFLLE1BQU0sQ0FBRTtJQUNsQixPQUFPLEtBQUssU0FBUztJQUNyQixJQUFJLEtBQUssTUFBTSxLQUFLLEdBQUc7TUFDckI7SUFDRjtJQUNBLE1BQU0sQ0FBQyxLQUFLLE9BQU8sS0FBSyxHQUFHLGtCQUFrQjtJQUM3QyxJQUFJLENBQUMsS0FBSztNQUNSLElBQUksaUJBQWlCLElBQUksQ0FBQyxPQUFPO1FBRS9CO01BQ0Y7TUFDQSxNQUFNLElBQUksVUFDUixDQUFDLDRDQUE0QyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTFEO0lBRUEsSUFBSSxPQUFPO0lBQ1gsTUFBTSxDQUFDLFVBQVUsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDO0lBQ3BDLElBQUksWUFBWSxVQUFVLFdBQVc7TUFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLFdBQVc7UUFDL0IsYUFBYSxHQUFHLENBQUMsVUFBVSxDQUFDO01BQzlCO01BQ0EsT0FBTyxhQUFhLEdBQUcsQ0FBQztJQUMxQjtJQUNBLElBQUksT0FBTyxNQUFNO01BQ2YsTUFBTSxJQUFJLFVBQVU7SUFDdEI7SUFDQSxJQUFJLENBQUMsSUFBSSxHQUFHO0lBQ1osT0FBTztFQUNUO0VBRUEseURBQXlEO0VBQ3pELHVEQUF1RDtFQUN2RCxJQUFJLE1BQU07RUFDVixLQUFLLE1BQU0sQ0FBQyxLQUFLLFNBQVMsSUFBSSxhQUFjO0lBQzFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDL0IsTUFBTSxPQUFPLFFBQVEsQ0FBQyxjQUFjO0lBQ3BDLElBQUksTUFBTTtNQUNSLE1BQU0sT0FBTyxtQkFBbUI7TUFDaEMsSUFBSSxNQUFNO1FBQ1IsTUFBTSxDQUFDLElBQUksR0FBRztNQUNoQjtNQUNBO0lBQ0Y7SUFFQSxNQUFNO0lBQ04sSUFBSSxRQUFRO0lBQ1osSUFBSyxJQUFJLElBQUksSUFBSSxJQUFLO01BQ3BCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUc7TUFDaEMsSUFBSSxPQUFPLFFBQVEsQ0FBQyxXQUFXO01BQy9CLElBQUksTUFBTTtRQUNSLFFBQVE7UUFDUixPQUFPO1FBQ1A7TUFDRjtNQUNBLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxDQUFDO01BQ3BDLE9BQU8sUUFBUSxDQUFDLFlBQVk7TUFDNUIsSUFBSSxDQUFDLE1BQU07UUFDVDtNQUNGO01BQ0EsUUFBUTtNQUNSLElBQUksTUFBTSxHQUFHO1FBQ1gsTUFBTSxPQUFPLG1CQUFtQjtRQUNoQyxJQUFJLE1BQU07VUFDUixPQUFPO1FBQ1Q7TUFDRixPQUFPO1FBQ0wsTUFBTSxPQUFPLFVBQVU7UUFDdkIsT0FBTztNQUNUO0lBQ0Y7SUFDQSxJQUFJLE9BQU87TUFDVCxNQUFNLENBQUMsSUFBSSxHQUFHO0lBQ2hCO0VBQ0Y7RUFFQSxPQUFPO0lBQUM7SUFBVyxPQUFPLElBQUksQ0FBQyxRQUFRLE1BQU0sR0FBRyxTQUFTO0dBQVU7QUFDckUifQ==
// denoCacheMetadata=137374090702534386,14372999669487573305