// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { DateTimeFormatter } from "./_date_time_formatter.ts";
/**
 * Formats a date to a string with the specified format.
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
 * @param date The date to be formatted.
 * @param formatString The date time string format.
 * @param options The options to customize the formatting of the date.
 * @return The formatted date string.
 *
 * @example Basic usage
 * ```ts no-eval
 * import { format } from "@std/datetime/format";
 * import { assertEquals } from "@std/assert";
 *
 * const date = new Date(2019, 0, 20, 16, 34, 23, 123);
 *
 * assertEquals(format(date, "dd-MM-yyyy"), "20-01-2019");
 *
 * assertEquals(format(date, "MM-dd-yyyy HH:mm:ss.SSS"), "01-20-2019 16:34:23.123");
 *
 * assertEquals(format(date, "'today:' yyyy-MM-dd"), "today: 2019-01-20");
 * ```
 *
 * @example UTC formatting
 *
 * Enable UTC formatting by setting the `utc` option to `true`.
 *
 * ```ts no-eval
 * import { format } from "@std/datetime/format";
 * import { assertEquals } from "@std/assert";
 *
 * const date = new Date(2019, 0, 20, 16, 34, 23, 123);
 *
 * assertEquals(format(date, "yyyy-MM-dd HH:mm:ss", { utc: true }), "2019-01-20 05:34:23");
 * ```
 */ export function format(date, formatString, options = {}) {
  const formatter = new DateTimeFormatter(formatString);
  return formatter.format(date, options.utc ? {
    timeZone: "UTC"
  } : undefined);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZGF0ZXRpbWUvMC4yMjQuNS9mb3JtYXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgRGF0ZVRpbWVGb3JtYXR0ZXIgfSBmcm9tIFwiLi9fZGF0ZV90aW1lX2Zvcm1hdHRlci50c1wiO1xuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBmb3JtYXR9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBGb3JtYXRPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgcmV0dXJucyB0aGUgZm9ybWF0dGVkIGRhdGUgaW4gVVRDIGluc3RlYWQgb2YgbG9jYWwgdGltZS5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgdXRjPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBGb3JtYXRzIGEgZGF0ZSB0byBhIHN0cmluZyB3aXRoIHRoZSBzcGVjaWZpZWQgZm9ybWF0LlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgc3ltYm9scyBmcm9tXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cudW5pY29kZS5vcmcvcmVwb3J0cy90cjM1L3RyMzUtZGF0ZXMuaHRtbCNEYXRlX0ZpZWxkX1N5bWJvbF9UYWJsZSB8IHVuaWNvZGUgTERNTH1cbiAqIGFyZSBzdXBwb3J0ZWQ6XG4gKiAtIGB5eXl5YCAtIG51bWVyaWMgeWVhclxuICogLSBgeXlgIC0gMi1kaWdpdCB5ZWFyXG4gKiAtIGBNYCAtIG51bWVyaWMgbW9udGhcbiAqIC0gYE1NYCAtIDItZGlnaXQgbW9udGhcbiAqIC0gYGRgIC0gbnVtZXJpYyBkYXlcbiAqIC0gYGRkYCAtIDItZGlnaXQgZGF5XG4gKiAtIGBIYCAtIG51bWVyaWMgaG91ciAoMC0yMyBob3VycylcbiAqIC0gYEhIYCAtIDItZGlnaXQgaG91ciAoMDAtMjMgaG91cnMpXG4gKiAtIGBoYCAtIG51bWVyaWMgaG91ciAoMS0xMiBob3VycylcbiAqIC0gYGhoYCAtIDItZGlnaXQgaG91ciAoMDEtMTIgaG91cnMpXG4gKiAtIGBtYCAtIG51bWVyaWMgbWludXRlXG4gKiAtIGBtbWAgLSAyLWRpZ2l0IG1pbnV0ZVxuICogLSBgc2AgLSBudW1lcmljIHNlY29uZFxuICogLSBgc3NgIC0gMi1kaWdpdCBzZWNvbmRcbiAqIC0gYFNgIC0gMS1kaWdpdCBmcmFjdGlvbmFsIHNlY29uZFxuICogLSBgU1NgIC0gMi1kaWdpdCBmcmFjdGlvbmFsIHNlY29uZFxuICogLSBgU1NTYCAtIDMtZGlnaXQgZnJhY3Rpb25hbCBzZWNvbmRcbiAqIC0gYGFgIC0gZGF5UGVyaW9kLCBlaXRoZXIgYEFNYCBvciBgUE1gXG4gKiAtIGAnZm9vJ2AgLSBxdW90ZWQgbGl0ZXJhbFxuICogLSBgLi8tYCAtIHVucXVvdGVkIGxpdGVyYWxcbiAqXG4gKiBAcGFyYW0gZGF0ZSBUaGUgZGF0ZSB0byBiZSBmb3JtYXR0ZWQuXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBkYXRlIHRpbWUgc3RyaW5nIGZvcm1hdC5cbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBvcHRpb25zIHRvIGN1c3RvbWl6ZSB0aGUgZm9ybWF0dGluZyBvZiB0aGUgZGF0ZS5cbiAqIEByZXR1cm4gVGhlIGZvcm1hdHRlZCBkYXRlIHN0cmluZy5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcIkBzdGQvZGF0ZXRpbWUvZm9ybWF0XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCBkYXRlID0gbmV3IERhdGUoMjAxOSwgMCwgMjAsIDE2LCAzNCwgMjMsIDEyMyk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGZvcm1hdChkYXRlLCBcImRkLU1NLXl5eXlcIiksIFwiMjAtMDEtMjAxOVwiKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZm9ybWF0KGRhdGUsIFwiTU0tZGQteXl5eSBISDptbTpzcy5TU1NcIiksIFwiMDEtMjAtMjAxOSAxNjozNDoyMy4xMjNcIik7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGZvcm1hdChkYXRlLCBcIid0b2RheTonIHl5eXktTU0tZGRcIiksIFwidG9kYXk6IDIwMTktMDEtMjBcIik7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBVVEMgZm9ybWF0dGluZ1xuICpcbiAqIEVuYWJsZSBVVEMgZm9ybWF0dGluZyBieSBzZXR0aW5nIHRoZSBgdXRjYCBvcHRpb24gdG8gYHRydWVgLlxuICpcbiAqIGBgYHRzIG5vLWV2YWxcbiAqIGltcG9ydCB7IGZvcm1hdCB9IGZyb20gXCJAc3RkL2RhdGV0aW1lL2Zvcm1hdFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3QgZGF0ZSA9IG5ldyBEYXRlKDIwMTksIDAsIDIwLCAxNiwgMzQsIDIzLCAxMjMpO1xuICpcbiAqIGFzc2VydEVxdWFscyhmb3JtYXQoZGF0ZSwgXCJ5eXl5LU1NLWRkIEhIOm1tOnNzXCIsIHsgdXRjOiB0cnVlIH0pLCBcIjIwMTktMDEtMjAgMDU6MzQ6MjNcIik7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChcbiAgZGF0ZTogRGF0ZSxcbiAgZm9ybWF0U3RyaW5nOiBzdHJpbmcsXG4gIG9wdGlvbnM6IEZvcm1hdE9wdGlvbnMgPSB7fSxcbik6IHN0cmluZyB7XG4gIGNvbnN0IGZvcm1hdHRlciA9IG5ldyBEYXRlVGltZUZvcm1hdHRlcihmb3JtYXRTdHJpbmcpO1xuICByZXR1cm4gZm9ybWF0dGVyLmZvcm1hdChcbiAgICBkYXRlLFxuICAgIG9wdGlvbnMudXRjID8geyB0aW1lWm9uZTogXCJVVENcIiB9IDogdW5kZWZpbmVkLFxuICApO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxpQkFBaUIsUUFBUSw0QkFBNEI7QUFZOUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EwREMsR0FDRCxPQUFPLFNBQVMsT0FDZCxJQUFVLEVBQ1YsWUFBb0IsRUFDcEIsVUFBeUIsQ0FBQyxDQUFDO0VBRTNCLE1BQU0sWUFBWSxJQUFJLGtCQUFrQjtFQUN4QyxPQUFPLFVBQVUsTUFBTSxDQUNyQixNQUNBLFFBQVEsR0FBRyxHQUFHO0lBQUUsVUFBVTtFQUFNLElBQUk7QUFFeEMifQ==
// denoCacheMetadata=1730640184292934401,1157481010634117100