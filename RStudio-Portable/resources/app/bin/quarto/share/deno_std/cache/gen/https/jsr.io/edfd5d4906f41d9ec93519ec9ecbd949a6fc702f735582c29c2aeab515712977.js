// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isIterator, isToken, needsEncoding } from "./_util.ts";
/**
 * Serializes the media type and the optional parameters as a media type
 * conforming to {@link https://www.ietf.org/rfc/rfc2045.txt | RFC 2045} and
 * {@link https://www.ietf.org/rfc/rfc2616.txt | RFC 2616}.
 *
 * The type and parameter names are written in lower-case.
 *
 * When any of the arguments results in a standard violation then the return
 * value will be an empty string (`""`).
 *
 * @param type The media type to serialize.
 * @param param Optional parameters to serialize.
 *
 * @returns The serialized media type.
 *
 * @example Basic usage
 * ```ts
 * import { formatMediaType } from "@std/media-types/format-media-type";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(formatMediaType("text/plain"), "text/plain");
 * ```
 *
 * @example With parameters
 * ```ts
 * import { formatMediaType } from "@std/media-types/format-media-type";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(formatMediaType("text/plain", { charset: "UTF-8" }), "text/plain; charset=UTF-8");
 * ```
 */ export function formatMediaType(type, param) {
  let serializedMediaType = "";
  const [major = "", sub] = type.split("/");
  if (!sub) {
    if (!isToken(type)) {
      return "";
    }
    serializedMediaType += type.toLowerCase();
  } else {
    if (!isToken(major) || !isToken(sub)) {
      return "";
    }
    serializedMediaType += `${major.toLowerCase()}/${sub.toLowerCase()}`;
  }
  if (param) {
    param = isIterator(param) ? Object.fromEntries(param) : param;
    const attrs = Object.keys(param);
    attrs.sort();
    for (const attribute of attrs){
      if (!isToken(attribute)) {
        return "";
      }
      const value = param[attribute];
      serializedMediaType += `; ${attribute.toLowerCase()}`;
      const needEnc = needsEncoding(value);
      if (needEnc) {
        serializedMediaType += "*";
      }
      serializedMediaType += "=";
      if (needEnc) {
        serializedMediaType += `utf-8''${encodeURIComponent(value)}`;
        continue;
      }
      if (isToken(value)) {
        serializedMediaType += value;
        continue;
      }
      serializedMediaType += `"${value.replace(/["\\]/gi, (m)=>`\\${m}`)}"`;
    }
  }
  return serializedMediaType;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMC4yMjQuMS9mb3JtYXRfbWVkaWFfdHlwZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBpc0l0ZXJhdG9yLCBpc1Rva2VuLCBuZWVkc0VuY29kaW5nIH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcblxuLyoqXG4gKiBTZXJpYWxpemVzIHRoZSBtZWRpYSB0eXBlIGFuZCB0aGUgb3B0aW9uYWwgcGFyYW1ldGVycyBhcyBhIG1lZGlhIHR5cGVcbiAqIGNvbmZvcm1pbmcgdG8ge0BsaW5rIGh0dHBzOi8vd3d3LmlldGYub3JnL3JmYy9yZmMyMDQ1LnR4dCB8IFJGQyAyMDQ1fSBhbmRcbiAqIHtAbGluayBodHRwczovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMjYxNi50eHQgfCBSRkMgMjYxNn0uXG4gKlxuICogVGhlIHR5cGUgYW5kIHBhcmFtZXRlciBuYW1lcyBhcmUgd3JpdHRlbiBpbiBsb3dlci1jYXNlLlxuICpcbiAqIFdoZW4gYW55IG9mIHRoZSBhcmd1bWVudHMgcmVzdWx0cyBpbiBhIHN0YW5kYXJkIHZpb2xhdGlvbiB0aGVuIHRoZSByZXR1cm5cbiAqIHZhbHVlIHdpbGwgYmUgYW4gZW1wdHkgc3RyaW5nIChgXCJcImApLlxuICpcbiAqIEBwYXJhbSB0eXBlIFRoZSBtZWRpYSB0eXBlIHRvIHNlcmlhbGl6ZS5cbiAqIEBwYXJhbSBwYXJhbSBPcHRpb25hbCBwYXJhbWV0ZXJzIHRvIHNlcmlhbGl6ZS5cbiAqXG4gKiBAcmV0dXJucyBUaGUgc2VyaWFsaXplZCBtZWRpYSB0eXBlLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZm9ybWF0TWVkaWFUeXBlIH0gZnJvbSBcIkBzdGQvbWVkaWEtdHlwZXMvZm9ybWF0LW1lZGlhLXR5cGVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGZvcm1hdE1lZGlhVHlwZShcInRleHQvcGxhaW5cIiksIFwidGV4dC9wbGFpblwiKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIFdpdGggcGFyYW1ldGVyc1xuICogYGBgdHNcbiAqIGltcG9ydCB7IGZvcm1hdE1lZGlhVHlwZSB9IGZyb20gXCJAc3RkL21lZGlhLXR5cGVzL2Zvcm1hdC1tZWRpYS10eXBlXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGFzc2VydEVxdWFscyhmb3JtYXRNZWRpYVR5cGUoXCJ0ZXh0L3BsYWluXCIsIHsgY2hhcnNldDogXCJVVEYtOFwiIH0pLCBcInRleHQvcGxhaW47IGNoYXJzZXQ9VVRGLThcIik7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdE1lZGlhVHlwZShcbiAgdHlwZTogc3RyaW5nLFxuICBwYXJhbT86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfCBJdGVyYWJsZTxbc3RyaW5nLCBzdHJpbmddPixcbik6IHN0cmluZyB7XG4gIGxldCBzZXJpYWxpemVkTWVkaWFUeXBlID0gXCJcIjtcbiAgY29uc3QgW21ham9yID0gXCJcIiwgc3ViXSA9IHR5cGUuc3BsaXQoXCIvXCIpO1xuICBpZiAoIXN1Yikge1xuICAgIGlmICghaXNUb2tlbih0eXBlKSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHNlcmlhbGl6ZWRNZWRpYVR5cGUgKz0gdHlwZS50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGlmICghaXNUb2tlbihtYWpvcikgfHwgIWlzVG9rZW4oc3ViKSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHNlcmlhbGl6ZWRNZWRpYVR5cGUgKz0gYCR7bWFqb3IudG9Mb3dlckNhc2UoKX0vJHtzdWIudG9Mb3dlckNhc2UoKX1gO1xuICB9XG5cbiAgaWYgKHBhcmFtKSB7XG4gICAgcGFyYW0gPSBpc0l0ZXJhdG9yKHBhcmFtKSA/IE9iamVjdC5mcm9tRW50cmllcyhwYXJhbSkgOiBwYXJhbTtcbiAgICBjb25zdCBhdHRycyA9IE9iamVjdC5rZXlzKHBhcmFtKTtcbiAgICBhdHRycy5zb3J0KCk7XG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBhdHRycykge1xuICAgICAgaWYgKCFpc1Rva2VuKGF0dHJpYnV0ZSkpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICB9XG4gICAgICBjb25zdCB2YWx1ZSA9IHBhcmFtW2F0dHJpYnV0ZV0hO1xuICAgICAgc2VyaWFsaXplZE1lZGlhVHlwZSArPSBgOyAke2F0dHJpYnV0ZS50b0xvd2VyQ2FzZSgpfWA7XG5cbiAgICAgIGNvbnN0IG5lZWRFbmMgPSBuZWVkc0VuY29kaW5nKHZhbHVlKTtcbiAgICAgIGlmIChuZWVkRW5jKSB7XG4gICAgICAgIHNlcmlhbGl6ZWRNZWRpYVR5cGUgKz0gXCIqXCI7XG4gICAgICB9XG4gICAgICBzZXJpYWxpemVkTWVkaWFUeXBlICs9IFwiPVwiO1xuXG4gICAgICBpZiAobmVlZEVuYykge1xuICAgICAgICBzZXJpYWxpemVkTWVkaWFUeXBlICs9IGB1dGYtOCcnJHtlbmNvZGVVUklDb21wb25lbnQodmFsdWUpfWA7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNUb2tlbih2YWx1ZSkpIHtcbiAgICAgICAgc2VyaWFsaXplZE1lZGlhVHlwZSArPSB2YWx1ZTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBzZXJpYWxpemVkTWVkaWFUeXBlICs9IGBcIiR7dmFsdWUucmVwbGFjZSgvW1wiXFxcXF0vZ2ksIChtKSA9PiBgXFxcXCR7bX1gKX1cImA7XG4gICAgfVxuICB9XG4gIHJldHVybiBzZXJpYWxpemVkTWVkaWFUeXBlO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxVQUFVLEVBQUUsT0FBTyxFQUFFLGFBQWEsUUFBUSxhQUFhO0FBRWhFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E4QkMsR0FDRCxPQUFPLFNBQVMsZ0JBQ2QsSUFBWSxFQUNaLEtBQTJEO0VBRTNELElBQUksc0JBQXNCO0VBQzFCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEdBQUcsS0FBSyxLQUFLLENBQUM7RUFDckMsSUFBSSxDQUFDLEtBQUs7SUFDUixJQUFJLENBQUMsUUFBUSxPQUFPO01BQ2xCLE9BQU87SUFDVDtJQUNBLHVCQUF1QixLQUFLLFdBQVc7RUFDekMsT0FBTztJQUNMLElBQUksQ0FBQyxRQUFRLFVBQVUsQ0FBQyxRQUFRLE1BQU07TUFDcEMsT0FBTztJQUNUO0lBQ0EsdUJBQXVCLEdBQUcsTUFBTSxXQUFXLEdBQUcsQ0FBQyxFQUFFLElBQUksV0FBVyxJQUFJO0VBQ3RFO0VBRUEsSUFBSSxPQUFPO0lBQ1QsUUFBUSxXQUFXLFNBQVMsT0FBTyxXQUFXLENBQUMsU0FBUztJQUN4RCxNQUFNLFFBQVEsT0FBTyxJQUFJLENBQUM7SUFDMUIsTUFBTSxJQUFJO0lBRVYsS0FBSyxNQUFNLGFBQWEsTUFBTztNQUM3QixJQUFJLENBQUMsUUFBUSxZQUFZO1FBQ3ZCLE9BQU87TUFDVDtNQUNBLE1BQU0sUUFBUSxLQUFLLENBQUMsVUFBVTtNQUM5Qix1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsVUFBVSxXQUFXLElBQUk7TUFFckQsTUFBTSxVQUFVLGNBQWM7TUFDOUIsSUFBSSxTQUFTO1FBQ1gsdUJBQXVCO01BQ3pCO01BQ0EsdUJBQXVCO01BRXZCLElBQUksU0FBUztRQUNYLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxtQkFBbUIsUUFBUTtRQUM1RDtNQUNGO01BRUEsSUFBSSxRQUFRLFFBQVE7UUFDbEIsdUJBQXVCO1FBQ3ZCO01BQ0Y7TUFDQSx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsTUFBTSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUN6RTtFQUNGO0VBQ0EsT0FBTztBQUNUIn0=
// denoCacheMetadata=6342053655132995499,8460792868046711221