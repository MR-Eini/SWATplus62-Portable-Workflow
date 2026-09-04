// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { DateTimeFormatter } from "./_date_time_formatter.ts";
/**
 * Parses a date string using the specified format string.
 *
 * The following symbols from
 * {@link https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table | unicode LDML}
 * are supported:
 * - `yyyy` - numeric year
 * - `yy` - 2-digit year
 * - `M` - numeric month
 * - `MM` - 2-digit month
 * - `d` - numeric day
 * - `dd` - 2-digit day
 * - `H` - numeric hour (0-23 hours)
 * - `HH` - 2-digit hour (00-23 hours)
 * - `h` - numeric hour (1-12 hours)
 * - `hh` - 2-digit hour (01-12 hours)
 * - `m` - numeric minute
 * - `mm` - 2-digit minute
 * - `s` - numeric second
 * - `ss` - 2-digit second
 * - `S` - 1-digit fractional second
 * - `SS` - 2-digit fractional second
 * - `SSS` - 3-digit fractional second
 * - `a` - dayPeriod, either `AM` or `PM`
 * - `'foo'` - quoted literal
 * - `./-` - unquoted literal
 *
 * @param dateString The date string to parse.
 * @param formatString The date time string format.
 * @return The parsed date.
 *
 * @example Basic usage
 * ```ts
 * import { parse } from "@std/datetime/parse";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(parse("01-03-2019 16:30", "MM-dd-yyyy HH:mm"), new Date(2019, 0, 3, 16, 30));
 *
 * assertEquals(parse("01-03-2019 16:33:23.123", "MM-dd-yyyy HH:mm:ss.SSS"), new Date(2019, 0, 3, 16, 33, 23, 123));
 * ```
 */ export function parse(dateString, formatString) {
  const formatter = new DateTimeFormatter(formatString);
  const parts = formatter.parseToParts(dateString);
  const sortParts = formatter.sortDateTimeFormatPart(parts);
  return formatter.partsToDate(sortParts);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZGF0ZXRpbWUvMC4yMjQuNS9wYXJzZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBEYXRlVGltZUZvcm1hdHRlciB9IGZyb20gXCIuL19kYXRlX3RpbWVfZm9ybWF0dGVyLnRzXCI7XG5cbi8qKlxuICogUGFyc2VzIGEgZGF0ZSBzdHJpbmcgdXNpbmcgdGhlIHNwZWNpZmllZCBmb3JtYXQgc3RyaW5nLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgc3ltYm9scyBmcm9tXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cudW5pY29kZS5vcmcvcmVwb3J0cy90cjM1L3RyMzUtZGF0ZXMuaHRtbCNEYXRlX0ZpZWxkX1N5bWJvbF9UYWJsZSB8IHVuaWNvZGUgTERNTH1cbiAqIGFyZSBzdXBwb3J0ZWQ6XG4gKiAtIGB5eXl5YCAtIG51bWVyaWMgeWVhclxuICogLSBgeXlgIC0gMi1kaWdpdCB5ZWFyXG4gKiAtIGBNYCAtIG51bWVyaWMgbW9udGhcbiAqIC0gYE1NYCAtIDItZGlnaXQgbW9udGhcbiAqIC0gYGRgIC0gbnVtZXJpYyBkYXlcbiAqIC0gYGRkYCAtIDItZGlnaXQgZGF5XG4gKiAtIGBIYCAtIG51bWVyaWMgaG91ciAoMC0yMyBob3VycylcbiAqIC0gYEhIYCAtIDItZGlnaXQgaG91ciAoMDAtMjMgaG91cnMpXG4gKiAtIGBoYCAtIG51bWVyaWMgaG91ciAoMS0xMiBob3VycylcbiAqIC0gYGhoYCAtIDItZGlnaXQgaG91ciAoMDEtMTIgaG91cnMpXG4gKiAtIGBtYCAtIG51bWVyaWMgbWludXRlXG4gKiAtIGBtbWAgLSAyLWRpZ2l0IG1pbnV0ZVxuICogLSBgc2AgLSBudW1lcmljIHNlY29uZFxuICogLSBgc3NgIC0gMi1kaWdpdCBzZWNvbmRcbiAqIC0gYFNgIC0gMS1kaWdpdCBmcmFjdGlvbmFsIHNlY29uZFxuICogLSBgU1NgIC0gMi1kaWdpdCBmcmFjdGlvbmFsIHNlY29uZFxuICogLSBgU1NTYCAtIDMtZGlnaXQgZnJhY3Rpb25hbCBzZWNvbmRcbiAqIC0gYGFgIC0gZGF5UGVyaW9kLCBlaXRoZXIgYEFNYCBvciBgUE1gXG4gKiAtIGAnZm9vJ2AgLSBxdW90ZWQgbGl0ZXJhbFxuICogLSBgLi8tYCAtIHVucXVvdGVkIGxpdGVyYWxcbiAqXG4gKiBAcGFyYW0gZGF0ZVN0cmluZyBUaGUgZGF0ZSBzdHJpbmcgdG8gcGFyc2UuXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBkYXRlIHRpbWUgc3RyaW5nIGZvcm1hdC5cbiAqIEByZXR1cm4gVGhlIHBhcnNlZCBkYXRlLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcGFyc2UgfSBmcm9tIFwiQHN0ZC9kYXRldGltZS9wYXJzZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKHBhcnNlKFwiMDEtMDMtMjAxOSAxNjozMFwiLCBcIk1NLWRkLXl5eXkgSEg6bW1cIiksIG5ldyBEYXRlKDIwMTksIDAsIDMsIDE2LCAzMCkpO1xuICpcbiAqIGFzc2VydEVxdWFscyhwYXJzZShcIjAxLTAzLTIwMTkgMTY6MzM6MjMuMTIzXCIsIFwiTU0tZGQteXl5eSBISDptbTpzcy5TU1NcIiksIG5ldyBEYXRlKDIwMTksIDAsIDMsIDE2LCAzMywgMjMsIDEyMykpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShkYXRlU3RyaW5nOiBzdHJpbmcsIGZvcm1hdFN0cmluZzogc3RyaW5nKTogRGF0ZSB7XG4gIGNvbnN0IGZvcm1hdHRlciA9IG5ldyBEYXRlVGltZUZvcm1hdHRlcihmb3JtYXRTdHJpbmcpO1xuICBjb25zdCBwYXJ0cyA9IGZvcm1hdHRlci5wYXJzZVRvUGFydHMoZGF0ZVN0cmluZyk7XG4gIGNvbnN0IHNvcnRQYXJ0cyA9IGZvcm1hdHRlci5zb3J0RGF0ZVRpbWVGb3JtYXRQYXJ0KHBhcnRzKTtcbiAgcmV0dXJuIGZvcm1hdHRlci5wYXJ0c1RvRGF0ZShzb3J0UGFydHMpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxpQkFBaUIsUUFBUSw0QkFBNEI7QUFFOUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3Q0MsR0FDRCxPQUFPLFNBQVMsTUFBTSxVQUFrQixFQUFFLFlBQW9CO0VBQzVELE1BQU0sWUFBWSxJQUFJLGtCQUFrQjtFQUN4QyxNQUFNLFFBQVEsVUFBVSxZQUFZLENBQUM7RUFDckMsTUFBTSxZQUFZLFVBQVUsc0JBQXNCLENBQUM7RUFDbkQsT0FBTyxVQUFVLFdBQVcsQ0FBQztBQUMvQiJ9
// denoCacheMetadata=4658986365162348126,11771793289162901968