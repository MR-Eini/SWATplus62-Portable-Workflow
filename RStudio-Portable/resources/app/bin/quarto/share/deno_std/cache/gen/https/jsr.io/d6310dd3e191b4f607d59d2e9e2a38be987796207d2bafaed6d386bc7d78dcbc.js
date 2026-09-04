// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isIterator, isToken, needsEncoding } from "./_util.ts";
/**
 * Serializes the media type and the optional parameters as a media type
 * conforming to {@link https://www.rfc-editor.org/rfc/rfc2045.html | RFC 2045} and
 * {@link https://www.rfc-editor.org/rfc/rfc2616.html | RFC 2616}.
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
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(formatMediaType("text/plain"), "text/plain");
 * ```
 *
 * @example With parameters
 * ```ts
 * import { formatMediaType } from "@std/media-types/format-media-type";
 * import { assertEquals } from "@std/assert";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMS4wLjMvZm9ybWF0X21lZGlhX3R5cGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgaXNJdGVyYXRvciwgaXNUb2tlbiwgbmVlZHNFbmNvZGluZyB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5cbi8qKlxuICogU2VyaWFsaXplcyB0aGUgbWVkaWEgdHlwZSBhbmQgdGhlIG9wdGlvbmFsIHBhcmFtZXRlcnMgYXMgYSBtZWRpYSB0eXBlXG4gKiBjb25mb3JtaW5nIHRvIHtAbGluayBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjMjA0NS5odG1sIHwgUkZDIDIwNDV9IGFuZFxuICoge0BsaW5rIGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmMyNjE2Lmh0bWwgfCBSRkMgMjYxNn0uXG4gKlxuICogVGhlIHR5cGUgYW5kIHBhcmFtZXRlciBuYW1lcyBhcmUgd3JpdHRlbiBpbiBsb3dlci1jYXNlLlxuICpcbiAqIFdoZW4gYW55IG9mIHRoZSBhcmd1bWVudHMgcmVzdWx0cyBpbiBhIHN0YW5kYXJkIHZpb2xhdGlvbiB0aGVuIHRoZSByZXR1cm5cbiAqIHZhbHVlIHdpbGwgYmUgYW4gZW1wdHkgc3RyaW5nIChgXCJcImApLlxuICpcbiAqIEBwYXJhbSB0eXBlIFRoZSBtZWRpYSB0eXBlIHRvIHNlcmlhbGl6ZS5cbiAqIEBwYXJhbSBwYXJhbSBPcHRpb25hbCBwYXJhbWV0ZXJzIHRvIHNlcmlhbGl6ZS5cbiAqXG4gKiBAcmV0dXJucyBUaGUgc2VyaWFsaXplZCBtZWRpYSB0eXBlLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZm9ybWF0TWVkaWFUeXBlIH0gZnJvbSBcIkBzdGQvbWVkaWEtdHlwZXMvZm9ybWF0LW1lZGlhLXR5cGVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydEVxdWFscyhmb3JtYXRNZWRpYVR5cGUoXCJ0ZXh0L3BsYWluXCIpLCBcInRleHQvcGxhaW5cIik7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBXaXRoIHBhcmFtZXRlcnNcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBmb3JtYXRNZWRpYVR5cGUgfSBmcm9tIFwiQHN0ZC9tZWRpYS10eXBlcy9mb3JtYXQtbWVkaWEtdHlwZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGZvcm1hdE1lZGlhVHlwZShcInRleHQvcGxhaW5cIiwgeyBjaGFyc2V0OiBcIlVURi04XCIgfSksIFwidGV4dC9wbGFpbjsgY2hhcnNldD1VVEYtOFwiKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0TWVkaWFUeXBlKFxuICB0eXBlOiBzdHJpbmcsXG4gIHBhcmFtPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IEl0ZXJhYmxlPFtzdHJpbmcsIHN0cmluZ10+LFxuKTogc3RyaW5nIHtcbiAgbGV0IHNlcmlhbGl6ZWRNZWRpYVR5cGUgPSBcIlwiO1xuICBjb25zdCBbbWFqb3IgPSBcIlwiLCBzdWJdID0gdHlwZS5zcGxpdChcIi9cIik7XG4gIGlmICghc3ViKSB7XG4gICAgaWYgKCFpc1Rva2VuKHR5cGUpKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgc2VyaWFsaXplZE1lZGlhVHlwZSArPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFpc1Rva2VuKG1ham9yKSB8fCAhaXNUb2tlbihzdWIpKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgc2VyaWFsaXplZE1lZGlhVHlwZSArPSBgJHttYWpvci50b0xvd2VyQ2FzZSgpfS8ke3N1Yi50b0xvd2VyQ2FzZSgpfWA7XG4gIH1cblxuICBpZiAocGFyYW0pIHtcbiAgICBwYXJhbSA9IGlzSXRlcmF0b3IocGFyYW0pID8gT2JqZWN0LmZyb21FbnRyaWVzKHBhcmFtKSA6IHBhcmFtO1xuICAgIGNvbnN0IGF0dHJzID0gT2JqZWN0LmtleXMocGFyYW0pO1xuICAgIGF0dHJzLnNvcnQoKTtcblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlIG9mIGF0dHJzKSB7XG4gICAgICBpZiAoIWlzVG9rZW4oYXR0cmlidXRlKSkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHZhbHVlID0gcGFyYW1bYXR0cmlidXRlXSE7XG4gICAgICBzZXJpYWxpemVkTWVkaWFUeXBlICs9IGA7ICR7YXR0cmlidXRlLnRvTG93ZXJDYXNlKCl9YDtcblxuICAgICAgY29uc3QgbmVlZEVuYyA9IG5lZWRzRW5jb2RpbmcodmFsdWUpO1xuICAgICAgaWYgKG5lZWRFbmMpIHtcbiAgICAgICAgc2VyaWFsaXplZE1lZGlhVHlwZSArPSBcIipcIjtcbiAgICAgIH1cbiAgICAgIHNlcmlhbGl6ZWRNZWRpYVR5cGUgKz0gXCI9XCI7XG5cbiAgICAgIGlmIChuZWVkRW5jKSB7XG4gICAgICAgIHNlcmlhbGl6ZWRNZWRpYVR5cGUgKz0gYHV0Zi04Jycke2VuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSl9YDtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1Rva2VuKHZhbHVlKSkge1xuICAgICAgICBzZXJpYWxpemVkTWVkaWFUeXBlICs9IHZhbHVlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHNlcmlhbGl6ZWRNZWRpYVR5cGUgKz0gYFwiJHt2YWx1ZS5yZXBsYWNlKC9bXCJcXFxcXS9naSwgKG0pID0+IGBcXFxcJHttfWApfVwiYDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHNlcmlhbGl6ZWRNZWRpYVR5cGU7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFVBQVUsRUFBRSxPQUFPLEVBQUUsYUFBYSxRQUFRLGFBQWE7QUFFaEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQThCQyxHQUNELE9BQU8sU0FBUyxnQkFDZCxJQUFZLEVBQ1osS0FBMkQ7RUFFM0QsSUFBSSxzQkFBc0I7RUFDMUIsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksR0FBRyxLQUFLLEtBQUssQ0FBQztFQUNyQyxJQUFJLENBQUMsS0FBSztJQUNSLElBQUksQ0FBQyxRQUFRLE9BQU87TUFDbEIsT0FBTztJQUNUO0lBQ0EsdUJBQXVCLEtBQUssV0FBVztFQUN6QyxPQUFPO0lBQ0wsSUFBSSxDQUFDLFFBQVEsVUFBVSxDQUFDLFFBQVEsTUFBTTtNQUNwQyxPQUFPO0lBQ1Q7SUFDQSx1QkFBdUIsR0FBRyxNQUFNLFdBQVcsR0FBRyxDQUFDLEVBQUUsSUFBSSxXQUFXLElBQUk7RUFDdEU7RUFFQSxJQUFJLE9BQU87SUFDVCxRQUFRLFdBQVcsU0FBUyxPQUFPLFdBQVcsQ0FBQyxTQUFTO0lBQ3hELE1BQU0sUUFBUSxPQUFPLElBQUksQ0FBQztJQUMxQixNQUFNLElBQUk7SUFFVixLQUFLLE1BQU0sYUFBYSxNQUFPO01BQzdCLElBQUksQ0FBQyxRQUFRLFlBQVk7UUFDdkIsT0FBTztNQUNUO01BQ0EsTUFBTSxRQUFRLEtBQUssQ0FBQyxVQUFVO01BQzlCLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxVQUFVLFdBQVcsSUFBSTtNQUVyRCxNQUFNLFVBQVUsY0FBYztNQUM5QixJQUFJLFNBQVM7UUFDWCx1QkFBdUI7TUFDekI7TUFDQSx1QkFBdUI7TUFFdkIsSUFBSSxTQUFTO1FBQ1gsdUJBQXVCLENBQUMsT0FBTyxFQUFFLG1CQUFtQixRQUFRO1FBQzVEO01BQ0Y7TUFFQSxJQUFJLFFBQVEsUUFBUTtRQUNsQix1QkFBdUI7UUFDdkI7TUFDRjtNQUNBLHVCQUF1QixDQUFDLENBQUMsRUFBRSxNQUFNLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFO0VBQ0Y7RUFDQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=6621803313219104530,12502967089413917547