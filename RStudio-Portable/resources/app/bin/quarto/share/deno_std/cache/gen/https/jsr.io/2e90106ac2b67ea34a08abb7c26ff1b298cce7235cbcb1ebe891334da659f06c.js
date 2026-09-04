// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { types } from "./_db.ts";
/**
 * Returns the media type associated with the file extension, or `undefined` if
 * no media type is found.
 *
 * Values are normalized to lower case and matched irrespective of a leading
 * `.`.
 *
 * @param extension The file extension to get the media type for.
 *
 * @returns The media type associated with the file extension, or `undefined` if
 * no media type is found.
 *
 * @example Usage
 * ```ts
 * import { typeByExtension } from "@std/media-types/type-by-extension";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(typeByExtension("js"), "application/javascript");
 * assertEquals(typeByExtension(".HTML"), "text/html");
 * assertEquals(typeByExtension("foo"), undefined);
 * assertEquals(typeByExtension("file.json"), undefined);
 * ```
 */ export function typeByExtension(extension) {
  extension = extension.startsWith(".") ? extension.slice(1) : extension;
  // @ts-ignore Work around https://github.com/denoland/dnt/issues/148
  return types.get(extension.toLowerCase());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMC4yMjQuMS90eXBlX2J5X2V4dGVuc2lvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyB0eXBlcyB9IGZyb20gXCIuL19kYi50c1wiO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1lZGlhIHR5cGUgYXNzb2NpYXRlZCB3aXRoIHRoZSBmaWxlIGV4dGVuc2lvbiwgb3IgYHVuZGVmaW5lZGAgaWZcbiAqIG5vIG1lZGlhIHR5cGUgaXMgZm91bmQuXG4gKlxuICogVmFsdWVzIGFyZSBub3JtYWxpemVkIHRvIGxvd2VyIGNhc2UgYW5kIG1hdGNoZWQgaXJyZXNwZWN0aXZlIG9mIGEgbGVhZGluZ1xuICogYC5gLlxuICpcbiAqIEBwYXJhbSBleHRlbnNpb24gVGhlIGZpbGUgZXh0ZW5zaW9uIHRvIGdldCB0aGUgbWVkaWEgdHlwZSBmb3IuXG4gKlxuICogQHJldHVybnMgVGhlIG1lZGlhIHR5cGUgYXNzb2NpYXRlZCB3aXRoIHRoZSBmaWxlIGV4dGVuc2lvbiwgb3IgYHVuZGVmaW5lZGAgaWZcbiAqIG5vIG1lZGlhIHR5cGUgaXMgZm91bmQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB0eXBlQnlFeHRlbnNpb24gfSBmcm9tIFwiQHN0ZC9tZWRpYS10eXBlcy90eXBlLWJ5LWV4dGVuc2lvblwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHModHlwZUJ5RXh0ZW5zaW9uKFwianNcIiksIFwiYXBwbGljYXRpb24vamF2YXNjcmlwdFwiKTtcbiAqIGFzc2VydEVxdWFscyh0eXBlQnlFeHRlbnNpb24oXCIuSFRNTFwiKSwgXCJ0ZXh0L2h0bWxcIik7XG4gKiBhc3NlcnRFcXVhbHModHlwZUJ5RXh0ZW5zaW9uKFwiZm9vXCIpLCB1bmRlZmluZWQpO1xuICogYXNzZXJ0RXF1YWxzKHR5cGVCeUV4dGVuc2lvbihcImZpbGUuanNvblwiKSwgdW5kZWZpbmVkKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHlwZUJ5RXh0ZW5zaW9uKGV4dGVuc2lvbjogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgZXh0ZW5zaW9uID0gZXh0ZW5zaW9uLnN0YXJ0c1dpdGgoXCIuXCIpID8gZXh0ZW5zaW9uLnNsaWNlKDEpIDogZXh0ZW5zaW9uO1xuICAvLyBAdHMtaWdub3JlIFdvcmsgYXJvdW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9kZW5vbGFuZC9kbnQvaXNzdWVzLzE0OFxuICByZXR1cm4gdHlwZXMuZ2V0KGV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsS0FBSyxRQUFRLFdBQVc7QUFFakM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FzQkMsR0FDRCxPQUFPLFNBQVMsZ0JBQWdCLFNBQWlCO0VBQy9DLFlBQVksVUFBVSxVQUFVLENBQUMsT0FBTyxVQUFVLEtBQUssQ0FBQyxLQUFLO0VBQzdELG9FQUFvRTtFQUNwRSxPQUFPLE1BQU0sR0FBRyxDQUFDLFVBQVUsV0FBVztBQUN4QyJ9
// denoCacheMetadata=3429119099899259861,5764128829375607821