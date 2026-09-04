// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { DAY } from "./constants.ts";
/**
 * Returns the number of the day in the year in the local time zone.
 *
 * @param date Date to get the day of the year of.
 * @return Number of the day in the year in the local time zone.
 *
 * @example Basic usage
 * ```ts
 * import { dayOfYear } from "@std/datetime/day-of-year";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(dayOfYear(new Date("2019-03-11T03:24:00")), 70);
 * ```
 */ export function dayOfYear(date) {
  // Values from 0 to 99 map to the years 1900 to 1999. All other values are the actual year. (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date)
  // Using setFullYear as a workaround
  const yearStart = new Date(date);
  yearStart.setFullYear(date.getFullYear(), 0, 0);
  const diff = date.getTime() - date.getTimezoneOffset() * 60 * 1000 - (yearStart.getTime() - yearStart.getTimezoneOffset() * 60 * 1000);
  return Math.floor(diff / DAY);
}
/**
 * Returns the number of the day in the year in UTC time.
 *
 * @param date Date to get the day of the year of.
 * @return Number of the day in the year in UTC time.
 *
 * @example Usage
 * ```ts
 * import { dayOfYearUtc } from "@std/datetime/day-of-year";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(dayOfYearUtc(new Date("2019-03-11T03:24:00.000Z")), 70);
 * ```
 */ export function dayOfYearUtc(date) {
  // Values from 0 to 99 map to the years 1900 to 1999. All other values are the actual year. (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date)
  // Using setUTCFullYear as a workaround
  const yearStart = new Date(date);
  yearStart.setUTCFullYear(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - yearStart.getTime();
  return Math.floor(diff / DAY);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZGF0ZXRpbWUvMC4yMjQuNS9kYXlfb2ZfeWVhci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBEQVkgfSBmcm9tIFwiLi9jb25zdGFudHMudHNcIjtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgdGhlIGRheSBpbiB0aGUgeWVhciBpbiB0aGUgbG9jYWwgdGltZSB6b25lLlxuICpcbiAqIEBwYXJhbSBkYXRlIERhdGUgdG8gZ2V0IHRoZSBkYXkgb2YgdGhlIHllYXIgb2YuXG4gKiBAcmV0dXJuIE51bWJlciBvZiB0aGUgZGF5IGluIHRoZSB5ZWFyIGluIHRoZSBsb2NhbCB0aW1lIHpvbmUuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkYXlPZlllYXIgfSBmcm9tIFwiQHN0ZC9kYXRldGltZS9kYXktb2YteWVhclwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGRheU9mWWVhcihuZXcgRGF0ZShcIjIwMTktMDMtMTFUMDM6MjQ6MDBcIikpLCA3MCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRheU9mWWVhcihkYXRlOiBEYXRlKTogbnVtYmVyIHtcbiAgLy8gVmFsdWVzIGZyb20gMCB0byA5OSBtYXAgdG8gdGhlIHllYXJzIDE5MDAgdG8gMTk5OS4gQWxsIG90aGVyIHZhbHVlcyBhcmUgdGhlIGFjdHVhbCB5ZWFyLiAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRGF0ZS9EYXRlKVxuICAvLyBVc2luZyBzZXRGdWxsWWVhciBhcyBhIHdvcmthcm91bmRcblxuICBjb25zdCB5ZWFyU3RhcnQgPSBuZXcgRGF0ZShkYXRlKTtcblxuICB5ZWFyU3RhcnQuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpLCAwLCAwKTtcbiAgY29uc3QgZGlmZiA9IChkYXRlLmdldFRpbWUoKSAtIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSAqIDYwICogMTAwMCkgLVxuICAgICh5ZWFyU3RhcnQuZ2V0VGltZSgpIC0geWVhclN0YXJ0LmdldFRpbWV6b25lT2Zmc2V0KCkgKiA2MCAqIDEwMDApO1xuXG4gIHJldHVybiBNYXRoLmZsb29yKGRpZmYgLyBEQVkpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiB0aGUgZGF5IGluIHRoZSB5ZWFyIGluIFVUQyB0aW1lLlxuICpcbiAqIEBwYXJhbSBkYXRlIERhdGUgdG8gZ2V0IHRoZSBkYXkgb2YgdGhlIHllYXIgb2YuXG4gKiBAcmV0dXJuIE51bWJlciBvZiB0aGUgZGF5IGluIHRoZSB5ZWFyIGluIFVUQyB0aW1lLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZGF5T2ZZZWFyVXRjIH0gZnJvbSBcIkBzdGQvZGF0ZXRpbWUvZGF5LW9mLXllYXJcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydEVxdWFscyhkYXlPZlllYXJVdGMobmV3IERhdGUoXCIyMDE5LTAzLTExVDAzOjI0OjAwLjAwMFpcIikpLCA3MCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRheU9mWWVhclV0YyhkYXRlOiBEYXRlKTogbnVtYmVyIHtcbiAgLy8gVmFsdWVzIGZyb20gMCB0byA5OSBtYXAgdG8gdGhlIHllYXJzIDE5MDAgdG8gMTk5OS4gQWxsIG90aGVyIHZhbHVlcyBhcmUgdGhlIGFjdHVhbCB5ZWFyLiAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRGF0ZS9EYXRlKVxuICAvLyBVc2luZyBzZXRVVENGdWxsWWVhciBhcyBhIHdvcmthcm91bmRcblxuICBjb25zdCB5ZWFyU3RhcnQgPSBuZXcgRGF0ZShkYXRlKTtcblxuICB5ZWFyU3RhcnQuc2V0VVRDRnVsbFllYXIoZGF0ZS5nZXRVVENGdWxsWWVhcigpLCAwLCAwKTtcbiAgY29uc3QgZGlmZiA9IGRhdGUuZ2V0VGltZSgpIC0geWVhclN0YXJ0LmdldFRpbWUoKTtcblxuICByZXR1cm4gTWF0aC5mbG9vcihkaWZmIC8gREFZKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsR0FBRyxRQUFRLGlCQUFpQjtBQUVyQzs7Ozs7Ozs7Ozs7OztDQWFDLEdBQ0QsT0FBTyxTQUFTLFVBQVUsSUFBVTtFQUNsQyx3TEFBd0w7RUFDeEwsb0NBQW9DO0VBRXBDLE1BQU0sWUFBWSxJQUFJLEtBQUs7RUFFM0IsVUFBVSxXQUFXLENBQUMsS0FBSyxXQUFXLElBQUksR0FBRztFQUM3QyxNQUFNLE9BQU8sQUFBQyxLQUFLLE9BQU8sS0FBSyxLQUFLLGlCQUFpQixLQUFLLEtBQUssT0FDN0QsQ0FBQyxVQUFVLE9BQU8sS0FBSyxVQUFVLGlCQUFpQixLQUFLLEtBQUssSUFBSTtFQUVsRSxPQUFPLEtBQUssS0FBSyxDQUFDLE9BQU87QUFDM0I7QUFFQTs7Ozs7Ozs7Ozs7OztDQWFDLEdBQ0QsT0FBTyxTQUFTLGFBQWEsSUFBVTtFQUNyQyx3TEFBd0w7RUFDeEwsdUNBQXVDO0VBRXZDLE1BQU0sWUFBWSxJQUFJLEtBQUs7RUFFM0IsVUFBVSxjQUFjLENBQUMsS0FBSyxjQUFjLElBQUksR0FBRztFQUNuRCxNQUFNLE9BQU8sS0FBSyxPQUFPLEtBQUssVUFBVSxPQUFPO0VBRS9DLE9BQU8sS0FBSyxLQUFLLENBQUMsT0FBTztBQUMzQiJ9
// denoCacheMetadata=7741365642210398761,1390878999602549585