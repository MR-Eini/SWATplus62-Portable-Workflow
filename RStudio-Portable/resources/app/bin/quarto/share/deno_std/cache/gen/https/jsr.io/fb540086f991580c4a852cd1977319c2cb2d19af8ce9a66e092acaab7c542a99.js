// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { DAY, WEEK } from "./constants.ts";
const DAYS_PER_WEEK = 7;
const Day = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};
/**
 * Returns the ISO week number of the provided date (1-53).
 *
 * @param date Date to get the week number of.
 * @returns The week number of the provided date.
 *
 * @example Basic usage
 * ```ts
 * import { weekOfYear } from "@std/datetime/week-of-year";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(weekOfYear(new Date("2020-12-28T03:24:00")), 53);
 *
 * assertEquals(weekOfYear(new Date("2020-07-10T03:24:00")), 28);
 * ```
 */ export function weekOfYear(date) {
  const workingDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = workingDate.getUTCDay();
  const nearestThursday = workingDate.getUTCDate() + Day.Thu - (day === Day.Sun ? DAYS_PER_WEEK : day);
  workingDate.setUTCDate(nearestThursday);
  // Get first day of year
  const yearStart = new Date(Date.UTC(workingDate.getUTCFullYear(), 0, 1));
  // return the calculated full weeks to nearest Thursday
  return Math.ceil((workingDate.getTime() - yearStart.getTime() + DAY) / WEEK);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZGF0ZXRpbWUvMC4yMjQuNS93ZWVrX29mX3llYXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgREFZLCBXRUVLIH0gZnJvbSBcIi4vY29uc3RhbnRzLnRzXCI7XG5cbmNvbnN0IERBWVNfUEVSX1dFRUsgPSA3O1xuXG5jb25zdCBEYXkgPSB7XG4gIFN1bjogMCxcbiAgTW9uOiAxLFxuICBUdWU6IDIsXG4gIFdlZDogMyxcbiAgVGh1OiA0LFxuICBGcmk6IDUsXG4gIFNhdDogNixcbn0gYXMgY29uc3Q7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgSVNPIHdlZWsgbnVtYmVyIG9mIHRoZSBwcm92aWRlZCBkYXRlICgxLTUzKS5cbiAqXG4gKiBAcGFyYW0gZGF0ZSBEYXRlIHRvIGdldCB0aGUgd2VlayBudW1iZXIgb2YuXG4gKiBAcmV0dXJucyBUaGUgd2VlayBudW1iZXIgb2YgdGhlIHByb3ZpZGVkIGRhdGUuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB3ZWVrT2ZZZWFyIH0gZnJvbSBcIkBzdGQvZGF0ZXRpbWUvd2Vlay1vZi15ZWFyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMod2Vla09mWWVhcihuZXcgRGF0ZShcIjIwMjAtMTItMjhUMDM6MjQ6MDBcIikpLCA1Myk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKHdlZWtPZlllYXIobmV3IERhdGUoXCIyMDIwLTA3LTEwVDAzOjI0OjAwXCIpKSwgMjgpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3ZWVrT2ZZZWFyKGRhdGU6IERhdGUpOiBudW1iZXIge1xuICBjb25zdCB3b3JraW5nRGF0ZSA9IG5ldyBEYXRlKFxuICAgIERhdGUuVVRDKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSksXG4gICk7XG5cbiAgY29uc3QgZGF5ID0gd29ya2luZ0RhdGUuZ2V0VVRDRGF5KCk7XG5cbiAgY29uc3QgbmVhcmVzdFRodXJzZGF5ID0gd29ya2luZ0RhdGUuZ2V0VVRDRGF0ZSgpICtcbiAgICBEYXkuVGh1IC1cbiAgICAoZGF5ID09PSBEYXkuU3VuID8gREFZU19QRVJfV0VFSyA6IGRheSk7XG5cbiAgd29ya2luZ0RhdGUuc2V0VVRDRGF0ZShuZWFyZXN0VGh1cnNkYXkpO1xuXG4gIC8vIEdldCBmaXJzdCBkYXkgb2YgeWVhclxuICBjb25zdCB5ZWFyU3RhcnQgPSBuZXcgRGF0ZShEYXRlLlVUQyh3b3JraW5nRGF0ZS5nZXRVVENGdWxsWWVhcigpLCAwLCAxKSk7XG5cbiAgLy8gcmV0dXJuIHRoZSBjYWxjdWxhdGVkIGZ1bGwgd2Vla3MgdG8gbmVhcmVzdCBUaHVyc2RheVxuICByZXR1cm4gTWF0aC5jZWlsKCh3b3JraW5nRGF0ZS5nZXRUaW1lKCkgLSB5ZWFyU3RhcnQuZ2V0VGltZSgpICsgREFZKSAvIFdFRUspO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxHQUFHLEVBQUUsSUFBSSxRQUFRLGlCQUFpQjtBQUUzQyxNQUFNLGdCQUFnQjtBQUV0QixNQUFNLE1BQU07RUFDVixLQUFLO0VBQ0wsS0FBSztFQUNMLEtBQUs7RUFDTCxLQUFLO0VBQ0wsS0FBSztFQUNMLEtBQUs7RUFDTCxLQUFLO0FBQ1A7QUFFQTs7Ozs7Ozs7Ozs7Ozs7O0NBZUMsR0FDRCxPQUFPLFNBQVMsV0FBVyxJQUFVO0VBQ25DLE1BQU0sY0FBYyxJQUFJLEtBQ3RCLEtBQUssR0FBRyxDQUFDLEtBQUssV0FBVyxJQUFJLEtBQUssUUFBUSxJQUFJLEtBQUssT0FBTztFQUc1RCxNQUFNLE1BQU0sWUFBWSxTQUFTO0VBRWpDLE1BQU0sa0JBQWtCLFlBQVksVUFBVSxLQUM1QyxJQUFJLEdBQUcsR0FDUCxDQUFDLFFBQVEsSUFBSSxHQUFHLEdBQUcsZ0JBQWdCLEdBQUc7RUFFeEMsWUFBWSxVQUFVLENBQUM7RUFFdkIsd0JBQXdCO0VBQ3hCLE1BQU0sWUFBWSxJQUFJLEtBQUssS0FBSyxHQUFHLENBQUMsWUFBWSxjQUFjLElBQUksR0FBRztFQUVyRSx1REFBdUQ7RUFDdkQsT0FBTyxLQUFLLElBQUksQ0FBQyxDQUFDLFlBQVksT0FBTyxLQUFLLFVBQVUsT0FBTyxLQUFLLEdBQUcsSUFBSTtBQUN6RSJ9
// denoCacheMetadata=12557034343570285270,7505730036496778188