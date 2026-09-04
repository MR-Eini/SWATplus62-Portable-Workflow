// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { consumeMediaParam, decode2331Encoding } from "./_util.ts";
/**
 * Parses the media type and any optional parameters, per
 * {@link https://datatracker.ietf.org/doc/html/rfc1521 | RFC 1521}.
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
 * import { assertEquals } from "@std/assert/assert-equals";
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
      if (rest.trim() === ";") {
        break;
      }
      throw new TypeError("Invalid media parameter.");
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
      throw new TypeError("Duplicate key parsed.");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMC4yMjQuMS9wYXJzZV9tZWRpYV90eXBlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGNvbnN1bWVNZWRpYVBhcmFtLCBkZWNvZGUyMzMxRW5jb2RpbmcgfSBmcm9tIFwiLi9fdXRpbC50c1wiO1xuXG4vKipcbiAqIFBhcnNlcyB0aGUgbWVkaWEgdHlwZSBhbmQgYW55IG9wdGlvbmFsIHBhcmFtZXRlcnMsIHBlclxuICoge0BsaW5rIGh0dHBzOi8vZGF0YXRyYWNrZXIuaWV0Zi5vcmcvZG9jL2h0bWwvcmZjMTUyMSB8IFJGQyAxNTIxfS5cbiAqXG4gKiBNZWRpYSB0eXBlcyBhcmUgdGhlIHZhbHVlcyBpbiBgQ29udGVudC1UeXBlYCBhbmQgYENvbnRlbnQtRGlzcG9zaXRpb25gXG4gKiBoZWFkZXJzLiBPbiBzdWNjZXNzIHRoZSBmdW5jdGlvbiByZXR1cm5zIGEgdHVwbGUgd2hlcmUgdGhlIGZpcnN0IGVsZW1lbnQgaXNcbiAqIHRoZSBtZWRpYSB0eXBlIGFuZCB0aGUgc2Vjb25kIGVsZW1lbnQgaXMgdGhlIG9wdGlvbmFsIHBhcmFtZXRlcnMgb3JcbiAqIGB1bmRlZmluZWRgIGlmIHRoZXJlIGFyZSBub25lLlxuICpcbiAqIFRoZSBmdW5jdGlvbiB3aWxsIHRocm93IGlmIHRoZSBwYXJzZWQgdmFsdWUgaXMgaW52YWxpZC5cbiAqXG4gKiBUaGUgcmV0dXJuZWQgbWVkaWEgdHlwZSB3aWxsIGJlIG5vcm1hbGl6ZWQgdG8gYmUgbG93ZXIgY2FzZSwgYW5kIHJldHVybmVkXG4gKiBwYXJhbXMga2V5cyB3aWxsIGJlIG5vcm1hbGl6ZWQgdG8gbG93ZXIgY2FzZSwgYnV0IHByZXNlcnZlcyB0aGUgY2FzaW5nIG9mXG4gKiB0aGUgdmFsdWUuXG4gKlxuICogQHBhcmFtIHR5cGUgVGhlIG1lZGlhIHR5cGUgdG8gcGFyc2UuXG4gKlxuICogQHJldHVybnMgQSB0dXBsZSB3aGVyZSB0aGUgZmlyc3QgZWxlbWVudCBpcyB0aGUgbWVkaWEgdHlwZSBhbmQgdGhlIHNlY29uZFxuICogZWxlbWVudCBpcyB0aGUgb3B0aW9uYWwgcGFyYW1ldGVycyBvciBgdW5kZWZpbmVkYCBpZiB0aGVyZSBhcmUgbm9uZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlTWVkaWFUeXBlIH0gZnJvbSBcIkBzdGQvbWVkaWEtdHlwZXMvcGFyc2UtbWVkaWEtdHlwZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMocGFyc2VNZWRpYVR5cGUoXCJhcHBsaWNhdGlvbi9KU09OXCIpLCBbXCJhcHBsaWNhdGlvbi9qc29uXCIsIHVuZGVmaW5lZF0pO1xuICogYXNzZXJ0RXF1YWxzKHBhcnNlTWVkaWFUeXBlKFwidGV4dC9odG1sOyBjaGFyc2V0PVVURi04XCIpLCBbXCJ0ZXh0L2h0bWxcIiwgeyBjaGFyc2V0OiBcIlVURi04XCIgfV0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1lZGlhVHlwZShcbiAgdHlwZTogc3RyaW5nLFxuKTogW21lZGlhVHlwZTogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfCB1bmRlZmluZWRdIHtcbiAgY29uc3QgW2Jhc2VdID0gdHlwZS5zcGxpdChcIjtcIikgYXMgW3N0cmluZ107XG4gIGNvbnN0IG1lZGlhVHlwZSA9IGJhc2UudG9Mb3dlckNhc2UoKS50cmltKCk7XG5cbiAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gIC8vIE1hcCBvZiBiYXNlIHBhcmFtZXRlciBuYW1lIC0+IHBhcmFtZXRlciBuYW1lIC0+IHZhbHVlXG4gIC8vIGZvciBwYXJhbWV0ZXJzIGNvbnRhaW5pbmcgYSAnKicgY2hhcmFjdGVyLlxuICBjb25zdCBjb250aW51YXRpb24gPSBuZXcgTWFwPHN0cmluZywgUmVjb3JkPHN0cmluZywgc3RyaW5nPj4oKTtcblxuICB0eXBlID0gdHlwZS5zbGljZShiYXNlLmxlbmd0aCk7XG4gIHdoaWxlICh0eXBlLmxlbmd0aCkge1xuICAgIHR5cGUgPSB0eXBlLnRyaW1TdGFydCgpO1xuICAgIGlmICh0eXBlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IFtrZXksIHZhbHVlLCByZXN0XSA9IGNvbnN1bWVNZWRpYVBhcmFtKHR5cGUpO1xuICAgIGlmICgha2V5KSB7XG4gICAgICBpZiAocmVzdC50cmltKCkgPT09IFwiO1wiKSB7XG4gICAgICAgIC8vIGlnbm9yZSB0cmFpbGluZyBzZW1pY29sb25zXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgbWVkaWEgcGFyYW1ldGVyLlwiKTtcbiAgICB9XG5cbiAgICBsZXQgcG1hcCA9IHBhcmFtcztcbiAgICBjb25zdCBbYmFzZU5hbWUsIHJlc3QyXSA9IGtleS5zcGxpdChcIipcIik7XG4gICAgaWYgKGJhc2VOYW1lICYmIHJlc3QyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghY29udGludWF0aW9uLmhhcyhiYXNlTmFtZSkpIHtcbiAgICAgICAgY29udGludWF0aW9uLnNldChiYXNlTmFtZSwge30pO1xuICAgICAgfVxuICAgICAgcG1hcCA9IGNvbnRpbnVhdGlvbi5nZXQoYmFzZU5hbWUpITtcbiAgICB9XG4gICAgaWYgKGtleSBpbiBwbWFwKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRHVwbGljYXRlIGtleSBwYXJzZWQuXCIpO1xuICAgIH1cbiAgICBwbWFwW2tleV0gPSB2YWx1ZTtcbiAgICB0eXBlID0gcmVzdDtcbiAgfVxuXG4gIC8vIFN0aXRjaCB0b2dldGhlciBhbnkgY29udGludWF0aW9ucyBvciB0aGluZ3Mgd2l0aCBzdGFyc1xuICAvLyAoaS5lLiBSRkMgMjIzMSB0aGluZ3Mgd2l0aCBzdGFyczogXCJmb28qMFwiIG9yIFwiZm9vKlwiKVxuICBsZXQgc3RyID0gXCJcIjtcbiAgZm9yIChjb25zdCBba2V5LCBwaWVjZU1hcF0gb2YgY29udGludWF0aW9uKSB7XG4gICAgY29uc3Qgc2luZ2xlUGFydEtleSA9IGAke2tleX0qYDtcbiAgICBjb25zdCB0eXBlID0gcGllY2VNYXBbc2luZ2xlUGFydEtleV07XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIGNvbnN0IGRlY3YgPSBkZWNvZGUyMzMxRW5jb2RpbmcodHlwZSk7XG4gICAgICBpZiAoZGVjdikge1xuICAgICAgICBwYXJhbXNba2V5XSA9IGRlY3Y7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBzdHIgPSBcIlwiO1xuICAgIGxldCB2YWxpZCA9IGZhbHNlO1xuICAgIGZvciAobGV0IG4gPSAwOzsgbisrKSB7XG4gICAgICBjb25zdCBzaW1wbGVQYXJ0ID0gYCR7a2V5fSoke259YDtcbiAgICAgIGxldCB0eXBlID0gcGllY2VNYXBbc2ltcGxlUGFydF07XG4gICAgICBpZiAodHlwZSkge1xuICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgIHN0ciArPSB0eXBlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVuY29kZWRQYXJ0ID0gYCR7c2ltcGxlUGFydH0qYDtcbiAgICAgIHR5cGUgPSBwaWVjZU1hcFtlbmNvZGVkUGFydF07XG4gICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB2YWxpZCA9IHRydWU7XG4gICAgICBpZiAobiA9PT0gMCkge1xuICAgICAgICBjb25zdCBkZWN2ID0gZGVjb2RlMjMzMUVuY29kaW5nKHR5cGUpO1xuICAgICAgICBpZiAoZGVjdikge1xuICAgICAgICAgIHN0ciArPSBkZWN2O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkZWN2ID0gZGVjb2RlVVJJKHR5cGUpO1xuICAgICAgICBzdHIgKz0gZGVjdjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhbGlkKSB7XG4gICAgICBwYXJhbXNba2V5XSA9IHN0cjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gW21lZGlhVHlwZSwgT2JqZWN0LmtleXMocGFyYW1zKS5sZW5ndGggPyBwYXJhbXMgOiB1bmRlZmluZWRdO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxpQkFBaUIsRUFBRSxrQkFBa0IsUUFBUSxhQUFhO0FBRW5FOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNEJDLEdBQ0QsT0FBTyxTQUFTLGVBQ2QsSUFBWTtFQUVaLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxLQUFLLENBQUM7RUFDMUIsTUFBTSxZQUFZLEtBQUssV0FBVyxHQUFHLElBQUk7RUFFekMsTUFBTSxTQUFpQyxDQUFDO0VBQ3hDLHdEQUF3RDtFQUN4RCw2Q0FBNkM7RUFDN0MsTUFBTSxlQUFlLElBQUk7RUFFekIsT0FBTyxLQUFLLEtBQUssQ0FBQyxLQUFLLE1BQU07RUFDN0IsTUFBTyxLQUFLLE1BQU0sQ0FBRTtJQUNsQixPQUFPLEtBQUssU0FBUztJQUNyQixJQUFJLEtBQUssTUFBTSxLQUFLLEdBQUc7TUFDckI7SUFDRjtJQUNBLE1BQU0sQ0FBQyxLQUFLLE9BQU8sS0FBSyxHQUFHLGtCQUFrQjtJQUM3QyxJQUFJLENBQUMsS0FBSztNQUNSLElBQUksS0FBSyxJQUFJLE9BQU8sS0FBSztRQUV2QjtNQUNGO01BQ0EsTUFBTSxJQUFJLFVBQVU7SUFDdEI7SUFFQSxJQUFJLE9BQU87SUFDWCxNQUFNLENBQUMsVUFBVSxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUM7SUFDcEMsSUFBSSxZQUFZLFVBQVUsV0FBVztNQUNuQyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsV0FBVztRQUMvQixhQUFhLEdBQUcsQ0FBQyxVQUFVLENBQUM7TUFDOUI7TUFDQSxPQUFPLGFBQWEsR0FBRyxDQUFDO0lBQzFCO0lBQ0EsSUFBSSxPQUFPLE1BQU07TUFDZixNQUFNLElBQUksVUFBVTtJQUN0QjtJQUNBLElBQUksQ0FBQyxJQUFJLEdBQUc7SUFDWixPQUFPO0VBQ1Q7RUFFQSx5REFBeUQ7RUFDekQsdURBQXVEO0VBQ3ZELElBQUksTUFBTTtFQUNWLEtBQUssTUFBTSxDQUFDLEtBQUssU0FBUyxJQUFJLGFBQWM7SUFDMUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMvQixNQUFNLE9BQU8sUUFBUSxDQUFDLGNBQWM7SUFDcEMsSUFBSSxNQUFNO01BQ1IsTUFBTSxPQUFPLG1CQUFtQjtNQUNoQyxJQUFJLE1BQU07UUFDUixNQUFNLENBQUMsSUFBSSxHQUFHO01BQ2hCO01BQ0E7SUFDRjtJQUVBLE1BQU07SUFDTixJQUFJLFFBQVE7SUFDWixJQUFLLElBQUksSUFBSSxJQUFJLElBQUs7TUFDcEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRztNQUNoQyxJQUFJLE9BQU8sUUFBUSxDQUFDLFdBQVc7TUFDL0IsSUFBSSxNQUFNO1FBQ1IsUUFBUTtRQUNSLE9BQU87UUFDUDtNQUNGO01BQ0EsTUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLENBQUM7TUFDcEMsT0FBTyxRQUFRLENBQUMsWUFBWTtNQUM1QixJQUFJLENBQUMsTUFBTTtRQUNUO01BQ0Y7TUFDQSxRQUFRO01BQ1IsSUFBSSxNQUFNLEdBQUc7UUFDWCxNQUFNLE9BQU8sbUJBQW1CO1FBQ2hDLElBQUksTUFBTTtVQUNSLE9BQU87UUFDVDtNQUNGLE9BQU87UUFDTCxNQUFNLE9BQU8sVUFBVTtRQUN2QixPQUFPO01BQ1Q7SUFDRjtJQUNBLElBQUksT0FBTztNQUNULE1BQU0sQ0FBQyxJQUFJLEdBQUc7SUFDaEI7RUFDRjtFQUVBLE9BQU87SUFBQztJQUFXLE9BQU8sSUFBSSxDQUFDLFFBQVEsTUFBTSxHQUFHLFNBQVM7R0FBVTtBQUNyRSJ9
// denoCacheMetadata=16928395444406889226,16499786307377491767