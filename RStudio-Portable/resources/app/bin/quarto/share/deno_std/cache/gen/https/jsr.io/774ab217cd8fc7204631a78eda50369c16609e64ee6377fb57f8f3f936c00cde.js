// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { DAY, HOUR, MINUTE, SECOND, WEEK } from "./constants.ts";
function calculateMonthsDifference(from, to) {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) {
    months--;
  }
  return months;
}
/**
 * Calculates the difference of the 2 given dates in various units. If the units
 * are omitted, it returns the difference in the all available units.
 *
 * @param from Year to calculate difference from.
 * @param to Year to calculate difference to.
 * @param options Options such as units to calculate difference in.
 * @returns The difference of the 2 given dates in various units.
 *
 * @example Basic usage
 * ```ts
 * import { difference } from "@std/datetime/difference";
 * import { assertEquals } from "@std/assert";
 *
 * const date0 = new Date("2018-05-14");
 * const date1 = new Date("2020-05-13");
 *
 * assertEquals(difference(date0, date1), {
 *   milliseconds: 63072000000,
 *   seconds: 63072000,
 *   minutes: 1051200,
 *   hours: 17520,
 *   days: 730,
 *   weeks: 104,
 *   months: 23,
 *   quarters: 7,
 *   years: 1
 * });
 * ```
 *
 * @example Calculate difference in specific units
 *
 * The `units` option defines which units to calculate the difference in.
 *
 * ```ts
 * import { difference } from "@std/datetime/difference";
 * import { assertEquals } from "@std/assert";
 *
 * const date0 = new Date("2018-05-14");
 * const date1 = new Date("2020-05-13");
 *
 * const result = difference(date0, date1, { units: ["days", "months", "years"] });
 *
 * assertEquals(result, {
 *   days: 730,
 *   months: 23,
 *   years: 1
 * });
 * ```
 */ export function difference(from, to, options) {
  [from, to] = from < to ? [
    from,
    to
  ] : [
    to,
    from
  ];
  const uniqueUnits = options?.units ? [
    ...new Set(options?.units)
  ] : [
    "milliseconds",
    "seconds",
    "minutes",
    "hours",
    "days",
    "weeks",
    "months",
    "quarters",
    "years"
  ];
  const differenceInMs = Math.abs(from.getTime() - to.getTime());
  const differences = {};
  for (const uniqueUnit of uniqueUnits){
    switch(uniqueUnit){
      case "milliseconds":
        differences.milliseconds = differenceInMs;
        break;
      case "seconds":
        differences.seconds = Math.floor(differenceInMs / SECOND);
        break;
      case "minutes":
        differences.minutes = Math.floor(differenceInMs / MINUTE);
        break;
      case "hours":
        differences.hours = Math.floor(differenceInMs / HOUR);
        break;
      case "days":
        differences.days = Math.floor(differenceInMs / DAY);
        break;
      case "weeks":
        differences.weeks = Math.floor(differenceInMs / WEEK);
        break;
      case "months":
        differences.months = calculateMonthsDifference(from, to);
        break;
      case "quarters":
        differences.quarters = Math.floor(differences.months !== undefined && differences.months / 3 || calculateMonthsDifference(from, to) / 3);
        break;
      case "years":
        differences.years = Math.floor(differences.months !== undefined && differences.months / 12 || calculateMonthsDifference(from, to) / 12);
        break;
    }
  }
  return differences;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZGF0ZXRpbWUvMC4yMjQuNS9kaWZmZXJlbmNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IERBWSwgSE9VUiwgTUlOVVRFLCBTRUNPTkQsIFdFRUsgfSBmcm9tIFwiLi9jb25zdGFudHMudHNcIjtcblxuLyoqXG4gKiBEdXJhdGlvbiB1bml0cyBmb3Ige0BsaW5rY29kZSBEaWZmZXJlbmNlRm9ybWF0fSBhbmRcbiAqIHtAbGlua2NvZGUgRGlmZmVyZW5jZU9wdGlvbnN9LlxuICovXG5leHBvcnQgdHlwZSBVbml0ID1cbiAgfCBcIm1pbGxpc2Vjb25kc1wiXG4gIHwgXCJzZWNvbmRzXCJcbiAgfCBcIm1pbnV0ZXNcIlxuICB8IFwiaG91cnNcIlxuICB8IFwiZGF5c1wiXG4gIHwgXCJ3ZWVrc1wiXG4gIHwgXCJtb250aHNcIlxuICB8IFwicXVhcnRlcnNcIlxuICB8IFwieWVhcnNcIjtcblxuLyoqIFJldHVybiB0eXBlIGZvciB7QGxpbmtjb2RlIGRpZmZlcmVuY2V9LiAqL1xuZXhwb3J0IHR5cGUgRGlmZmVyZW5jZUZvcm1hdCA9IFBhcnRpYWw8UmVjb3JkPFVuaXQsIG51bWJlcj4+O1xuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBkaWZmZXJlbmNlfS4gKi9cbmV4cG9ydCB0eXBlIERpZmZlcmVuY2VPcHRpb25zID0ge1xuICAvKipcbiAgICogVW5pdHMgdG8gY2FsY3VsYXRlIGRpZmZlcmVuY2UgaW4uIERlZmF1bHRzIHRvIGFsbCB1bml0cy5cbiAgICovXG4gIHVuaXRzPzogVW5pdFtdO1xufTtcblxuZnVuY3Rpb24gY2FsY3VsYXRlTW9udGhzRGlmZmVyZW5jZShmcm9tOiBEYXRlLCB0bzogRGF0ZSk6IG51bWJlciB7XG4gIGxldCBtb250aHMgPSAodG8uZ2V0RnVsbFllYXIoKSAtIGZyb20uZ2V0RnVsbFllYXIoKSkgKiAxMiArXG4gICAgKHRvLmdldE1vbnRoKCkgLSBmcm9tLmdldE1vbnRoKCkpO1xuICBpZiAodG8uZ2V0RGF0ZSgpIDwgZnJvbS5nZXREYXRlKCkpIHtcbiAgICBtb250aHMtLTtcbiAgfVxuICByZXR1cm4gbW9udGhzO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRpZmZlcmVuY2Ugb2YgdGhlIDIgZ2l2ZW4gZGF0ZXMgaW4gdmFyaW91cyB1bml0cy4gSWYgdGhlIHVuaXRzXG4gKiBhcmUgb21pdHRlZCwgaXQgcmV0dXJucyB0aGUgZGlmZmVyZW5jZSBpbiB0aGUgYWxsIGF2YWlsYWJsZSB1bml0cy5cbiAqXG4gKiBAcGFyYW0gZnJvbSBZZWFyIHRvIGNhbGN1bGF0ZSBkaWZmZXJlbmNlIGZyb20uXG4gKiBAcGFyYW0gdG8gWWVhciB0byBjYWxjdWxhdGUgZGlmZmVyZW5jZSB0by5cbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgc3VjaCBhcyB1bml0cyB0byBjYWxjdWxhdGUgZGlmZmVyZW5jZSBpbi5cbiAqIEByZXR1cm5zIFRoZSBkaWZmZXJlbmNlIG9mIHRoZSAyIGdpdmVuIGRhdGVzIGluIHZhcmlvdXMgdW5pdHMuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkaWZmZXJlbmNlIH0gZnJvbSBcIkBzdGQvZGF0ZXRpbWUvZGlmZmVyZW5jZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3QgZGF0ZTAgPSBuZXcgRGF0ZShcIjIwMTgtMDUtMTRcIik7XG4gKiBjb25zdCBkYXRlMSA9IG5ldyBEYXRlKFwiMjAyMC0wNS0xM1wiKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZGlmZmVyZW5jZShkYXRlMCwgZGF0ZTEpLCB7XG4gKiAgIG1pbGxpc2Vjb25kczogNjMwNzIwMDAwMDAsXG4gKiAgIHNlY29uZHM6IDYzMDcyMDAwLFxuICogICBtaW51dGVzOiAxMDUxMjAwLFxuICogICBob3VyczogMTc1MjAsXG4gKiAgIGRheXM6IDczMCxcbiAqICAgd2Vla3M6IDEwNCxcbiAqICAgbW9udGhzOiAyMyxcbiAqICAgcXVhcnRlcnM6IDcsXG4gKiAgIHllYXJzOiAxXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIENhbGN1bGF0ZSBkaWZmZXJlbmNlIGluIHNwZWNpZmljIHVuaXRzXG4gKlxuICogVGhlIGB1bml0c2Agb3B0aW9uIGRlZmluZXMgd2hpY2ggdW5pdHMgdG8gY2FsY3VsYXRlIHRoZSBkaWZmZXJlbmNlIGluLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkaWZmZXJlbmNlIH0gZnJvbSBcIkBzdGQvZGF0ZXRpbWUvZGlmZmVyZW5jZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3QgZGF0ZTAgPSBuZXcgRGF0ZShcIjIwMTgtMDUtMTRcIik7XG4gKiBjb25zdCBkYXRlMSA9IG5ldyBEYXRlKFwiMjAyMC0wNS0xM1wiKTtcbiAqXG4gKiBjb25zdCByZXN1bHQgPSBkaWZmZXJlbmNlKGRhdGUwLCBkYXRlMSwgeyB1bml0czogW1wiZGF5c1wiLCBcIm1vbnRoc1wiLCBcInllYXJzXCJdIH0pO1xuICpcbiAqIGFzc2VydEVxdWFscyhyZXN1bHQsIHtcbiAqICAgZGF5czogNzMwLFxuICogICBtb250aHM6IDIzLFxuICogICB5ZWFyczogMVxuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZlcmVuY2UoXG4gIGZyb206IERhdGUsXG4gIHRvOiBEYXRlLFxuICBvcHRpb25zPzogRGlmZmVyZW5jZU9wdGlvbnMsXG4pOiBEaWZmZXJlbmNlRm9ybWF0IHtcbiAgW2Zyb20sIHRvXSA9IGZyb20gPCB0byA/IFtmcm9tLCB0b10gOiBbdG8sIGZyb21dO1xuICBjb25zdCB1bmlxdWVVbml0cyA9IG9wdGlvbnM/LnVuaXRzID8gWy4uLm5ldyBTZXQob3B0aW9ucz8udW5pdHMpXSA6IFtcbiAgICBcIm1pbGxpc2Vjb25kc1wiLFxuICAgIFwic2Vjb25kc1wiLFxuICAgIFwibWludXRlc1wiLFxuICAgIFwiaG91cnNcIixcbiAgICBcImRheXNcIixcbiAgICBcIndlZWtzXCIsXG4gICAgXCJtb250aHNcIixcbiAgICBcInF1YXJ0ZXJzXCIsXG4gICAgXCJ5ZWFyc1wiLFxuICBdO1xuXG4gIGNvbnN0IGRpZmZlcmVuY2VJbk1zID0gTWF0aC5hYnMoZnJvbS5nZXRUaW1lKCkgLSB0by5nZXRUaW1lKCkpO1xuXG4gIGNvbnN0IGRpZmZlcmVuY2VzOiBEaWZmZXJlbmNlRm9ybWF0ID0ge307XG5cbiAgZm9yIChjb25zdCB1bmlxdWVVbml0IG9mIHVuaXF1ZVVuaXRzKSB7XG4gICAgc3dpdGNoICh1bmlxdWVVbml0KSB7XG4gICAgICBjYXNlIFwibWlsbGlzZWNvbmRzXCI6XG4gICAgICAgIGRpZmZlcmVuY2VzLm1pbGxpc2Vjb25kcyA9IGRpZmZlcmVuY2VJbk1zO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJzZWNvbmRzXCI6XG4gICAgICAgIGRpZmZlcmVuY2VzLnNlY29uZHMgPSBNYXRoLmZsb29yKGRpZmZlcmVuY2VJbk1zIC8gU0VDT05EKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwibWludXRlc1wiOlxuICAgICAgICBkaWZmZXJlbmNlcy5taW51dGVzID0gTWF0aC5mbG9vcihkaWZmZXJlbmNlSW5NcyAvIE1JTlVURSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImhvdXJzXCI6XG4gICAgICAgIGRpZmZlcmVuY2VzLmhvdXJzID0gTWF0aC5mbG9vcihkaWZmZXJlbmNlSW5NcyAvIEhPVVIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJkYXlzXCI6XG4gICAgICAgIGRpZmZlcmVuY2VzLmRheXMgPSBNYXRoLmZsb29yKGRpZmZlcmVuY2VJbk1zIC8gREFZKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwid2Vla3NcIjpcbiAgICAgICAgZGlmZmVyZW5jZXMud2Vla3MgPSBNYXRoLmZsb29yKGRpZmZlcmVuY2VJbk1zIC8gV0VFSyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm1vbnRoc1wiOlxuICAgICAgICBkaWZmZXJlbmNlcy5tb250aHMgPSBjYWxjdWxhdGVNb250aHNEaWZmZXJlbmNlKGZyb20sIHRvKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwicXVhcnRlcnNcIjpcbiAgICAgICAgZGlmZmVyZW5jZXMucXVhcnRlcnMgPSBNYXRoLmZsb29yKFxuICAgICAgICAgIChkaWZmZXJlbmNlcy5tb250aHMgIT09IHVuZGVmaW5lZCAmJiBkaWZmZXJlbmNlcy5tb250aHMgLyAzKSB8fFxuICAgICAgICAgICAgY2FsY3VsYXRlTW9udGhzRGlmZmVyZW5jZShmcm9tLCB0bykgLyAzLFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJ5ZWFyc1wiOlxuICAgICAgICBkaWZmZXJlbmNlcy55ZWFycyA9IE1hdGguZmxvb3IoXG4gICAgICAgICAgKGRpZmZlcmVuY2VzLm1vbnRocyAhPT0gdW5kZWZpbmVkICYmIGRpZmZlcmVuY2VzLm1vbnRocyAvIDEyKSB8fFxuICAgICAgICAgICAgY2FsY3VsYXRlTW9udGhzRGlmZmVyZW5jZShmcm9tLCB0bykgLyAxMixcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRpZmZlcmVuY2VzO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxRQUFRLGlCQUFpQjtBQTRCakUsU0FBUywwQkFBMEIsSUFBVSxFQUFFLEVBQVE7RUFDckQsSUFBSSxTQUFTLENBQUMsR0FBRyxXQUFXLEtBQUssS0FBSyxXQUFXLEVBQUUsSUFBSSxLQUNyRCxDQUFDLEdBQUcsUUFBUSxLQUFLLEtBQUssUUFBUSxFQUFFO0VBQ2xDLElBQUksR0FBRyxPQUFPLEtBQUssS0FBSyxPQUFPLElBQUk7SUFDakM7RUFDRjtFQUNBLE9BQU87QUFDVDtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaURDLEdBQ0QsT0FBTyxTQUFTLFdBQ2QsSUFBVSxFQUNWLEVBQVEsRUFDUixPQUEyQjtFQUUzQixDQUFDLE1BQU0sR0FBRyxHQUFHLE9BQU8sS0FBSztJQUFDO0lBQU07R0FBRyxHQUFHO0lBQUM7SUFBSTtHQUFLO0VBQ2hELE1BQU0sY0FBYyxTQUFTLFFBQVE7T0FBSSxJQUFJLElBQUksU0FBUztHQUFPLEdBQUc7SUFDbEU7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0dBQ0Q7RUFFRCxNQUFNLGlCQUFpQixLQUFLLEdBQUcsQ0FBQyxLQUFLLE9BQU8sS0FBSyxHQUFHLE9BQU87RUFFM0QsTUFBTSxjQUFnQyxDQUFDO0VBRXZDLEtBQUssTUFBTSxjQUFjLFlBQWE7SUFDcEMsT0FBUTtNQUNOLEtBQUs7UUFDSCxZQUFZLFlBQVksR0FBRztRQUMzQjtNQUNGLEtBQUs7UUFDSCxZQUFZLE9BQU8sR0FBRyxLQUFLLEtBQUssQ0FBQyxpQkFBaUI7UUFDbEQ7TUFDRixLQUFLO1FBQ0gsWUFBWSxPQUFPLEdBQUcsS0FBSyxLQUFLLENBQUMsaUJBQWlCO1FBQ2xEO01BQ0YsS0FBSztRQUNILFlBQVksS0FBSyxHQUFHLEtBQUssS0FBSyxDQUFDLGlCQUFpQjtRQUNoRDtNQUNGLEtBQUs7UUFDSCxZQUFZLElBQUksR0FBRyxLQUFLLEtBQUssQ0FBQyxpQkFBaUI7UUFDL0M7TUFDRixLQUFLO1FBQ0gsWUFBWSxLQUFLLEdBQUcsS0FBSyxLQUFLLENBQUMsaUJBQWlCO1FBQ2hEO01BQ0YsS0FBSztRQUNILFlBQVksTUFBTSxHQUFHLDBCQUEwQixNQUFNO1FBQ3JEO01BQ0YsS0FBSztRQUNILFlBQVksUUFBUSxHQUFHLEtBQUssS0FBSyxDQUMvQixBQUFDLFlBQVksTUFBTSxLQUFLLGFBQWEsWUFBWSxNQUFNLEdBQUcsS0FDeEQsMEJBQTBCLE1BQU0sTUFBTTtRQUUxQztNQUNGLEtBQUs7UUFDSCxZQUFZLEtBQUssR0FBRyxLQUFLLEtBQUssQ0FDNUIsQUFBQyxZQUFZLE1BQU0sS0FBSyxhQUFhLFlBQVksTUFBTSxHQUFHLE1BQ3hELDBCQUEwQixNQUFNLE1BQU07UUFFMUM7SUFDSjtFQUNGO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=6811212854172035080,6182107554748951882