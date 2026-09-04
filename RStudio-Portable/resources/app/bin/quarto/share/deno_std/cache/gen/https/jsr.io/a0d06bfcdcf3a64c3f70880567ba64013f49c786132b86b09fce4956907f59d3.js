// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
const textDecoder = new TextDecoder();
/**
 * Converts a {@linkcode ReadableSteam} of strings or {@linkcode Uint8Array}s
 * to a single string. Works the same as {@linkcode Response.text}.
 *
 * @param readableStream A `ReadableStream` to convert into a `string`.
 * @returns A `Promise` that resolves to the `string`.
 *
 * @example Basic usage
 * ```ts
 * import { toText } from "@std/streams/to-text";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from(["Hello, ", "world!"]);
 * assertEquals(await toText(stream), "Hello, world!");
 * ```
 */ export async function toText(readableStream) {
  const reader = readableStream.getReader();
  let result = "";
  while(true){
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result += typeof value === "string" ? value : textDecoder.decode(value);
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L3RvX3RleHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuY29uc3QgdGV4dERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIHtAbGlua2NvZGUgUmVhZGFibGVTdGVhbX0gb2Ygc3RyaW5ncyBvciB7QGxpbmtjb2RlIFVpbnQ4QXJyYXl9c1xuICogdG8gYSBzaW5nbGUgc3RyaW5nLiBXb3JrcyB0aGUgc2FtZSBhcyB7QGxpbmtjb2RlIFJlc3BvbnNlLnRleHR9LlxuICpcbiAqIEBwYXJhbSByZWFkYWJsZVN0cmVhbSBBIGBSZWFkYWJsZVN0cmVhbWAgdG8gY29udmVydCBpbnRvIGEgYHN0cmluZ2AuXG4gKiBAcmV0dXJucyBBIGBQcm9taXNlYCB0aGF0IHJlc29sdmVzIHRvIHRoZSBgc3RyaW5nYC5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHRvVGV4dCB9IGZyb20gXCJAc3RkL3N0cmVhbXMvdG8tdGV4dFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzdHJlYW0gPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcIkhlbGxvLCBcIiwgXCJ3b3JsZCFcIl0pO1xuICogYXNzZXJ0RXF1YWxzKGF3YWl0IHRvVGV4dChzdHJlYW0pLCBcIkhlbGxvLCB3b3JsZCFcIik7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRvVGV4dChcbiAgcmVhZGFibGVTdHJlYW06IFJlYWRhYmxlU3RyZWFtLFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgcmVhZGVyID0gcmVhZGFibGVTdHJlYW0uZ2V0UmVhZGVyKCk7XG4gIGxldCByZXN1bHQgPSBcIlwiO1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgY29uc3QgeyBkb25lLCB2YWx1ZSB9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcblxuICAgIGlmIChkb25lKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXN1bHQgKz0gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiID8gdmFsdWUgOiB0ZXh0RGVjb2Rlci5kZWNvZGUodmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLE1BQU0sY0FBYyxJQUFJO0FBRXhCOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUNELE9BQU8sZUFBZSxPQUNwQixjQUE4QjtFQUU5QixNQUFNLFNBQVMsZUFBZSxTQUFTO0VBQ3ZDLElBQUksU0FBUztFQUViLE1BQU8sS0FBTTtJQUNYLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxPQUFPLElBQUk7SUFFekMsSUFBSSxNQUFNO01BQ1I7SUFDRjtJQUVBLFVBQVUsT0FBTyxVQUFVLFdBQVcsUUFBUSxZQUFZLE1BQU0sQ0FBQztFQUNuRTtFQUVBLE9BQU87QUFDVCJ9
// denoCacheMetadata=4514018902557201935,10154899453467601430