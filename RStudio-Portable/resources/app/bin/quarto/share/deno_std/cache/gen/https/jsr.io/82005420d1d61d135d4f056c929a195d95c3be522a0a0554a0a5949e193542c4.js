// Copyright 2014-2021 Sindre Sorhus. All rights reserved. MIT license.
// Copyright 2021 Yoshiya Hinosawa. All rights reserved. MIT license.
// Copyright 2021 Giuseppe Eletto. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Convert bytes to a human-readable string: 1337 → 1.34 kB
 *
 * Based on {@link https://github.com/sindresorhus/pretty-bytes | pretty-bytes}.
 * A utility for displaying file sizes for humans.
 *
 * @param num The bytes value to format
 * @param options The options for formatting
 * @returns The formatted string
 *
 * @example Basic usage
 * ```ts
 * import { format } from "@std/fmt/bytes";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(format(1337), "1.34 kB");
 * assertEquals(format(100), "100 B");
 * ```
 *
 * @example Include bits representation
 *
 * ```ts
 * import { format } from "@std/fmt/bytes";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(format(1337, { bits: true }), "1.34 kbit");
 * ```
 *
 * @example Include sign
 *
 * ```ts
 * import { format } from "@std/fmt/bytes";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(format(42, { signed: true }), "+42 B");
 * assertEquals(format(-42, { signed: true }), "-42 B");
 * ```
 *
 * @example Change locale
 *
 * ```ts
 * import { format } from "@std/fmt/bytes";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(format(1337, { locale: "de" }), "1,34 kB");
 * ```
 */ export function format(num, options = {}) {
  if (!Number.isFinite(num)) {
    throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`);
  }
  const UNITS_FIRSTLETTER = (options.bits ? "b" : "B") + "kMGTPEZY";
  if (options.signed && num === 0) {
    return ` 0 ${UNITS_FIRSTLETTER[0]}`;
  }
  const prefix = num < 0 ? "-" : options.signed ? "+" : "";
  num = Math.abs(num);
  const localeOptions = getLocaleOptions(options);
  if (num < 1) {
    const numberString = toLocaleString(num, options.locale, localeOptions);
    return prefix + numberString + " " + UNITS_FIRSTLETTER[0];
  }
  const exponent = Math.min(Math.floor(options.binary ? Math.log(num) / Math.log(1024) : Math.log10(num) / 3), UNITS_FIRSTLETTER.length - 1);
  num /= Math.pow(options.binary ? 1024 : 1000, exponent);
  if (!localeOptions) {
    num = Number(num.toPrecision(3));
  }
  const numberString = toLocaleString(num, options.locale, localeOptions);
  let unit = UNITS_FIRSTLETTER[exponent];
  if (exponent > 0) {
    unit += options.binary ? "i" : "";
    unit += options.bits ? "bit" : "B";
  }
  return prefix + numberString + " " + unit;
}
function getLocaleOptions({ maximumFractionDigits, minimumFractionDigits }) {
  if (maximumFractionDigits || minimumFractionDigits) {
    return {
      maximumFractionDigits,
      minimumFractionDigits
    };
  }
}
/**
 * Formats the given number using `Number#toLocaleString`.
 * - If locale is a string, the value is expected to be a locale-key (for example: `de`).
 * - If locale is true, the system default locale is used for translation.
 * - If no value for locale is specified, the number is returned unmodified.
 */ function toLocaleString(num, locale, options) {
  if (typeof locale === "string" || Array.isArray(locale)) {
    return num.toLocaleString(locale, options);
  } else if (locale === true || options !== undefined) {
    return num.toLocaleString(undefined, options);
  }
  return num.toString();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZm10LzAuMjI1LjYvYnl0ZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSBTaW5kcmUgU29yaHVzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDIxIFlvc2hpeWEgSGlub3Nhd2EuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMjEgR2l1c2VwcGUgRWxldHRvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbnR5cGUgTG9jYWxlT3B0aW9ucyA9IHtcbiAgbWluaW11bUZyYWN0aW9uRGlnaXRzPzogbnVtYmVyO1xuICBtYXhpbXVtRnJhY3Rpb25EaWdpdHM/OiBudW1iZXI7XG59O1xuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBmb3JtYXR9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBGb3JtYXRPcHRpb25zIHtcbiAgLyoqXG4gICAqIFVzZXMgYml0cyByZXByZXNlbnRhdGlvbi5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgYml0cz86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBVc2VzIGJpbmFyeSBieXRlcyAoZS5nLiBraWJpYnl0ZSkuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtmYWxzZX1cbiAgICovXG4gIGJpbmFyeT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBJbmNsdWRlIHBsdXMgc2lnbiBmb3IgcG9zaXRpdmUgbnVtYmVycy5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgc2lnbmVkPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFVzZXMgbG9jYWxpemVkIG51bWJlciBmb3JtYXR0aW5nLiBJZiBpdCBpcyBzZXQgdG8gdHJ1ZSwgdXNlcyBkZWZhdWx0XG4gICAqIGxvY2FsZSBvbiB0aGUgc3lzdGVtLiBJZiBpdCdzIHNldCB0byBzdHJpbmcsIHVzZXMgdGhhdCBsb2NhbGUuIFRoZSBnaXZlblxuICAgKiBzdHJpbmcgc2hvdWxkIGJlIGFcbiAgICoge0BsaW5rIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lFVEZfbGFuZ3VhZ2VfdGFnIHwgQkNQIDQ3IGxhbmd1YWdlIHRhZ30uXG4gICAqIFlvdSBjYW4gYWxzbyBnaXZlIHRoZSBsaXN0IG9mIGxhbmd1YWdlIHRhZ3MuXG4gICAqL1xuICBsb2NhbGU/OiBib29sZWFuIHwgc3RyaW5nIHwgc3RyaW5nW107XG4gIC8qKlxuICAgKiBUaGUgbWluaW11bSBudW1iZXIgb2YgZnJhY3Rpb24gZGlnaXRzIHRvIGRpc3BsYXkuIElmIG5laXRoZXJcbiAgICoge0BsaW5rY29kZSBtaW5pbXVtRnJhY3Rpb25EaWdpdHN9IG9yIHtAbGlua2NvZGUgbWF4aW11bUZyYWN0aW9uRGlnaXRzfVxuICAgKiBhcmUgc2V0LCB0aGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0byByb3VuZCB0byAzIHNpZ25pZmljYW50IGRpZ2l0cy5cbiAgICovXG4gIG1pbmltdW1GcmFjdGlvbkRpZ2l0cz86IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBmcmFjdGlvbiBkaWdpdHMgdG8gZGlzcGxheS4gSWYgbmVpdGhlclxuICAgKiB7QGxpbmtjb2RlIG1pbmltdW1GcmFjdGlvbkRpZ2l0c30gb3Ige0BsaW5rY29kZSBtYXhpbXVtRnJhY3Rpb25EaWdpdHN9XG4gICAqIGFyZSBzZXQsIHRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvIHJvdW5kIHRvIDMgc2lnbmlmaWNhbnQgZGlnaXRzLlxuICAgKi9cbiAgbWF4aW11bUZyYWN0aW9uRGlnaXRzPzogbnVtYmVyO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYnl0ZXMgdG8gYSBodW1hbi1yZWFkYWJsZSBzdHJpbmc6IDEzMzcg4oaSIDEuMzQga0JcbiAqXG4gKiBCYXNlZCBvbiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9wcmV0dHktYnl0ZXMgfCBwcmV0dHktYnl0ZXN9LlxuICogQSB1dGlsaXR5IGZvciBkaXNwbGF5aW5nIGZpbGUgc2l6ZXMgZm9yIGh1bWFucy5cbiAqXG4gKiBAcGFyYW0gbnVtIFRoZSBieXRlcyB2YWx1ZSB0byBmb3JtYXRcbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBvcHRpb25zIGZvciBmb3JtYXR0aW5nXG4gKiBAcmV0dXJucyBUaGUgZm9ybWF0dGVkIHN0cmluZ1xuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcIkBzdGQvZm10L2J5dGVzXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZm9ybWF0KDEzMzcpLCBcIjEuMzQga0JcIik7XG4gKiBhc3NlcnRFcXVhbHMoZm9ybWF0KDEwMCksIFwiMTAwIEJcIik7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBJbmNsdWRlIGJpdHMgcmVwcmVzZW50YXRpb25cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcIkBzdGQvZm10L2J5dGVzXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZm9ybWF0KDEzMzcsIHsgYml0czogdHJ1ZSB9KSwgXCIxLjM0IGtiaXRcIik7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBJbmNsdWRlIHNpZ25cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcIkBzdGQvZm10L2J5dGVzXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZm9ybWF0KDQyLCB7IHNpZ25lZDogdHJ1ZSB9KSwgXCIrNDIgQlwiKTtcbiAqIGFzc2VydEVxdWFscyhmb3JtYXQoLTQyLCB7IHNpZ25lZDogdHJ1ZSB9KSwgXCItNDIgQlwiKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIENoYW5nZSBsb2NhbGVcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcIkBzdGQvZm10L2J5dGVzXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZm9ybWF0KDEzMzcsIHsgbG9jYWxlOiBcImRlXCIgfSksIFwiMSwzNCBrQlwiKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0KFxuICBudW06IG51bWJlcixcbiAgb3B0aW9uczogRm9ybWF0T3B0aW9ucyA9IHt9LFxuKTogc3RyaW5nIHtcbiAgaWYgKCFOdW1iZXIuaXNGaW5pdGUobnVtKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGEgZmluaXRlIG51bWJlciwgZ290ICR7dHlwZW9mIG51bX06ICR7bnVtfWApO1xuICB9XG5cbiAgY29uc3QgVU5JVFNfRklSU1RMRVRURVIgPSAob3B0aW9ucy5iaXRzID8gXCJiXCIgOiBcIkJcIikgKyBcImtNR1RQRVpZXCI7XG5cbiAgaWYgKG9wdGlvbnMuc2lnbmVkICYmIG51bSA9PT0gMCkge1xuICAgIHJldHVybiBgIDAgJHtVTklUU19GSVJTVExFVFRFUlswXX1gO1xuICB9XG5cbiAgY29uc3QgcHJlZml4ID0gbnVtIDwgMCA/IFwiLVwiIDogKG9wdGlvbnMuc2lnbmVkID8gXCIrXCIgOiBcIlwiKTtcbiAgbnVtID0gTWF0aC5hYnMobnVtKTtcblxuICBjb25zdCBsb2NhbGVPcHRpb25zID0gZ2V0TG9jYWxlT3B0aW9ucyhvcHRpb25zKTtcblxuICBpZiAobnVtIDwgMSkge1xuICAgIGNvbnN0IG51bWJlclN0cmluZyA9IHRvTG9jYWxlU3RyaW5nKG51bSwgb3B0aW9ucy5sb2NhbGUsIGxvY2FsZU9wdGlvbnMpO1xuICAgIHJldHVybiBwcmVmaXggKyBudW1iZXJTdHJpbmcgKyBcIiBcIiArIFVOSVRTX0ZJUlNUTEVUVEVSWzBdO1xuICB9XG5cbiAgY29uc3QgZXhwb25lbnQgPSBNYXRoLm1pbihcbiAgICBNYXRoLmZsb29yKFxuICAgICAgb3B0aW9ucy5iaW5hcnkgPyBNYXRoLmxvZyhudW0pIC8gTWF0aC5sb2coMTAyNCkgOiBNYXRoLmxvZzEwKG51bSkgLyAzLFxuICAgICksXG4gICAgVU5JVFNfRklSU1RMRVRURVIubGVuZ3RoIC0gMSxcbiAgKTtcbiAgbnVtIC89IE1hdGgucG93KG9wdGlvbnMuYmluYXJ5ID8gMTAyNCA6IDEwMDAsIGV4cG9uZW50KTtcblxuICBpZiAoIWxvY2FsZU9wdGlvbnMpIHtcbiAgICBudW0gPSBOdW1iZXIobnVtLnRvUHJlY2lzaW9uKDMpKTtcbiAgfVxuXG4gIGNvbnN0IG51bWJlclN0cmluZyA9IHRvTG9jYWxlU3RyaW5nKFxuICAgIG51bSxcbiAgICBvcHRpb25zLmxvY2FsZSxcbiAgICBsb2NhbGVPcHRpb25zLFxuICApO1xuXG4gIGxldCB1bml0ID0gVU5JVFNfRklSU1RMRVRURVJbZXhwb25lbnRdO1xuICBpZiAoZXhwb25lbnQgPiAwKSB7XG4gICAgdW5pdCArPSBvcHRpb25zLmJpbmFyeSA/IFwiaVwiIDogXCJcIjtcbiAgICB1bml0ICs9IG9wdGlvbnMuYml0cyA/IFwiYml0XCIgOiBcIkJcIjtcbiAgfVxuXG4gIHJldHVybiBwcmVmaXggKyBudW1iZXJTdHJpbmcgKyBcIiBcIiArIHVuaXQ7XG59XG5cbmZ1bmN0aW9uIGdldExvY2FsZU9wdGlvbnMoXG4gIHsgbWF4aW11bUZyYWN0aW9uRGlnaXRzLCBtaW5pbXVtRnJhY3Rpb25EaWdpdHMgfTogRm9ybWF0T3B0aW9ucyxcbik6IExvY2FsZU9wdGlvbnMgfCB1bmRlZmluZWQge1xuICBpZiAobWF4aW11bUZyYWN0aW9uRGlnaXRzIHx8IG1pbmltdW1GcmFjdGlvbkRpZ2l0cykge1xuICAgIHJldHVybiB7XG4gICAgICBtYXhpbXVtRnJhY3Rpb25EaWdpdHMsXG4gICAgICBtaW5pbXVtRnJhY3Rpb25EaWdpdHMsXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIEZvcm1hdHMgdGhlIGdpdmVuIG51bWJlciB1c2luZyBgTnVtYmVyI3RvTG9jYWxlU3RyaW5nYC5cbiAqIC0gSWYgbG9jYWxlIGlzIGEgc3RyaW5nLCB0aGUgdmFsdWUgaXMgZXhwZWN0ZWQgdG8gYmUgYSBsb2NhbGUta2V5IChmb3IgZXhhbXBsZTogYGRlYCkuXG4gKiAtIElmIGxvY2FsZSBpcyB0cnVlLCB0aGUgc3lzdGVtIGRlZmF1bHQgbG9jYWxlIGlzIHVzZWQgZm9yIHRyYW5zbGF0aW9uLlxuICogLSBJZiBubyB2YWx1ZSBmb3IgbG9jYWxlIGlzIHNwZWNpZmllZCwgdGhlIG51bWJlciBpcyByZXR1cm5lZCB1bm1vZGlmaWVkLlxuICovXG5mdW5jdGlvbiB0b0xvY2FsZVN0cmluZyhcbiAgbnVtOiBudW1iZXIsXG4gIGxvY2FsZTogYm9vbGVhbiB8IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkLFxuICBvcHRpb25zOiBMb2NhbGVPcHRpb25zIHwgdW5kZWZpbmVkLFxuKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiBsb2NhbGUgPT09IFwic3RyaW5nXCIgfHwgQXJyYXkuaXNBcnJheShsb2NhbGUpKSB7XG4gICAgcmV0dXJuIG51bS50b0xvY2FsZVN0cmluZyhsb2NhbGUsIG9wdGlvbnMpO1xuICB9IGVsc2UgaWYgKGxvY2FsZSA9PT0gdHJ1ZSB8fCBvcHRpb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbnVtLnRvTG9jYWxlU3RyaW5nKHVuZGVmaW5lZCwgb3B0aW9ucyk7XG4gIH1cblxuICByZXR1cm4gbnVtLnRvU3RyaW5nKCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsdUVBQXVFO0FBQ3ZFLHFFQUFxRTtBQUNyRSxvRUFBb0U7QUFDcEUsMEVBQTBFO0FBQzFFLHFDQUFxQztBQWlEckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E4Q0MsR0FDRCxPQUFPLFNBQVMsT0FDZCxHQUFXLEVBQ1gsVUFBeUIsQ0FBQyxDQUFDO0VBRTNCLElBQUksQ0FBQyxPQUFPLFFBQVEsQ0FBQyxNQUFNO0lBQ3pCLE1BQU0sSUFBSSxVQUFVLENBQUMsOEJBQThCLEVBQUUsT0FBTyxJQUFJLEVBQUUsRUFBRSxLQUFLO0VBQzNFO0VBRUEsTUFBTSxvQkFBb0IsQ0FBQyxRQUFRLElBQUksR0FBRyxNQUFNLEdBQUcsSUFBSTtFQUV2RCxJQUFJLFFBQVEsTUFBTSxJQUFJLFFBQVEsR0FBRztJQUMvQixPQUFPLENBQUMsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEVBQUUsRUFBRTtFQUNyQztFQUVBLE1BQU0sU0FBUyxNQUFNLElBQUksTUFBTyxRQUFRLE1BQU0sR0FBRyxNQUFNO0VBQ3ZELE1BQU0sS0FBSyxHQUFHLENBQUM7RUFFZixNQUFNLGdCQUFnQixpQkFBaUI7RUFFdkMsSUFBSSxNQUFNLEdBQUc7SUFDWCxNQUFNLGVBQWUsZUFBZSxLQUFLLFFBQVEsTUFBTSxFQUFFO0lBQ3pELE9BQU8sU0FBUyxlQUFlLE1BQU0saUJBQWlCLENBQUMsRUFBRTtFQUMzRDtFQUVBLE1BQU0sV0FBVyxLQUFLLEdBQUcsQ0FDdkIsS0FBSyxLQUFLLENBQ1IsUUFBUSxNQUFNLEdBQUcsS0FBSyxHQUFHLENBQUMsT0FBTyxLQUFLLEdBQUcsQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLE9BQU8sSUFFdEUsa0JBQWtCLE1BQU0sR0FBRztFQUU3QixPQUFPLEtBQUssR0FBRyxDQUFDLFFBQVEsTUFBTSxHQUFHLE9BQU8sTUFBTTtFQUU5QyxJQUFJLENBQUMsZUFBZTtJQUNsQixNQUFNLE9BQU8sSUFBSSxXQUFXLENBQUM7RUFDL0I7RUFFQSxNQUFNLGVBQWUsZUFDbkIsS0FDQSxRQUFRLE1BQU0sRUFDZDtFQUdGLElBQUksT0FBTyxpQkFBaUIsQ0FBQyxTQUFTO0VBQ3RDLElBQUksV0FBVyxHQUFHO0lBQ2hCLFFBQVEsUUFBUSxNQUFNLEdBQUcsTUFBTTtJQUMvQixRQUFRLFFBQVEsSUFBSSxHQUFHLFFBQVE7RUFDakM7RUFFQSxPQUFPLFNBQVMsZUFBZSxNQUFNO0FBQ3ZDO0FBRUEsU0FBUyxpQkFDUCxFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUFpQjtFQUUvRCxJQUFJLHlCQUF5Qix1QkFBdUI7SUFDbEQsT0FBTztNQUNMO01BQ0E7SUFDRjtFQUNGO0FBQ0Y7QUFFQTs7Ozs7Q0FLQyxHQUNELFNBQVMsZUFDUCxHQUFXLEVBQ1gsTUFBK0MsRUFDL0MsT0FBa0M7RUFFbEMsSUFBSSxPQUFPLFdBQVcsWUFBWSxNQUFNLE9BQU8sQ0FBQyxTQUFTO0lBQ3ZELE9BQU8sSUFBSSxjQUFjLENBQUMsUUFBUTtFQUNwQyxPQUFPLElBQUksV0FBVyxRQUFRLFlBQVksV0FBVztJQUNuRCxPQUFPLElBQUksY0FBYyxDQUFDLFdBQVc7RUFDdkM7RUFFQSxPQUFPLElBQUksUUFBUTtBQUNyQiJ9
// denoCacheMetadata=14258001743395610918,7438133267949706511