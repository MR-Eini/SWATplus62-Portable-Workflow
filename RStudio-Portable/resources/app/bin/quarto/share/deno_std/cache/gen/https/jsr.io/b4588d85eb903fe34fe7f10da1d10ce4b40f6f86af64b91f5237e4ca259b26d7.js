// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
function isYearNumberALeapYear(yearNumber) {
  return yearNumber % 4 === 0 && yearNumber % 100 !== 0 || yearNumber % 400 === 0;
}
/**
 * Returns whether the given year is a leap year. Passing in a
 * {@linkcode Date} object will return the leap year status of the year of that
 * object and take the current timezone into account. Passing in a number will
 * return the leap year status of that number.
 *
 * This is based on
 * {@link https://docs.microsoft.com/en-us/office/troubleshoot/excel/determine-a-leap-year}.
 *
 * @param year The year in number or `Date` format.
 * @returns `true` if the given year is a leap year; `false` otherwise.
 *
 * @example Basic usage
 * ```ts
 * import { isLeap } from "@std/datetime/is-leap";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(isLeap(new Date("1970-01-02")), false);
 *
 * assertEquals(isLeap(1970), false);
 *
 * assertEquals(isLeap(new Date("1972-01-02")), true);
 *
 * assertEquals(isLeap(1972), true);
 * ```
 *
 * @example Accounting for timezones
 * ```ts no-assert
 * import { isLeap } from "@std/datetime/is-leap";
 *
 *  // True if the local timezone is GMT+0; false if the local timezone is GMT-1
 * isLeap(new Date("2000-01-01"));
 *
 * // True regardless of the local timezone
 * isLeap(2000);
 *
 * ```
 */ export function isLeap(year) {
  const yearNumber = year instanceof Date ? year.getFullYear() : year;
  return isYearNumberALeapYear(yearNumber);
}
/**
 * Returns whether the given year is a leap year in UTC time. This always
 * returns the same value regardless of the local timezone.

 * This is based on
 * {@link https://docs.microsoft.com/en-us/office/troubleshoot/excel/determine-a-leap-year}.
 *
 * @param year The year in number or `Date` format.
 * @returns `true` if the given year is a leap year; `false` otherwise.
 *
 * @example Basic usage
 * ```ts
 * import { isUtcLeap } from "@std/datetime/is-leap";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(isUtcLeap(new Date("2000-01-01")), true);
 *
 * assertEquals(isUtcLeap(new Date("December 31, 1999 23:59:59 GMT-01:00")), true);
 *
 * assertEquals(isUtcLeap(2000), true);
 *
 * assertEquals(isUtcLeap(1999), false);
 * ```
 */ export function isUtcLeap(year) {
  const yearNumber = year instanceof Date ? year.getUTCFullYear() : year;
  return isYearNumberALeapYear(yearNumber);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZGF0ZXRpbWUvMC4yMjQuNS9pc19sZWFwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmZ1bmN0aW9uIGlzWWVhck51bWJlckFMZWFwWWVhcih5ZWFyTnVtYmVyOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAoeWVhck51bWJlciAlIDQgPT09IDAgJiYgeWVhck51bWJlciAlIDEwMCAhPT0gMCkgfHwgeWVhck51bWJlciAlIDQwMCA9PT0gMFxuICApO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4geWVhciBpcyBhIGxlYXAgeWVhci4gUGFzc2luZyBpbiBhXG4gKiB7QGxpbmtjb2RlIERhdGV9IG9iamVjdCB3aWxsIHJldHVybiB0aGUgbGVhcCB5ZWFyIHN0YXR1cyBvZiB0aGUgeWVhciBvZiB0aGF0XG4gKiBvYmplY3QgYW5kIHRha2UgdGhlIGN1cnJlbnQgdGltZXpvbmUgaW50byBhY2NvdW50LiBQYXNzaW5nIGluIGEgbnVtYmVyIHdpbGxcbiAqIHJldHVybiB0aGUgbGVhcCB5ZWFyIHN0YXR1cyBvZiB0aGF0IG51bWJlci5cbiAqXG4gKiBUaGlzIGlzIGJhc2VkIG9uXG4gKiB7QGxpbmsgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvb2ZmaWNlL3Ryb3VibGVzaG9vdC9leGNlbC9kZXRlcm1pbmUtYS1sZWFwLXllYXJ9LlxuICpcbiAqIEBwYXJhbSB5ZWFyIFRoZSB5ZWFyIGluIG51bWJlciBvciBgRGF0ZWAgZm9ybWF0LlxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBnaXZlbiB5ZWFyIGlzIGEgbGVhcCB5ZWFyOyBgZmFsc2VgIG90aGVyd2lzZS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGlzTGVhcCB9IGZyb20gXCJAc3RkL2RhdGV0aW1lL2lzLWxlYXBcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydEVxdWFscyhpc0xlYXAobmV3IERhdGUoXCIxOTcwLTAxLTAyXCIpKSwgZmFsc2UpO1xuICpcbiAqIGFzc2VydEVxdWFscyhpc0xlYXAoMTk3MCksIGZhbHNlKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoaXNMZWFwKG5ldyBEYXRlKFwiMTk3Mi0wMS0wMlwiKSksIHRydWUpO1xuICpcbiAqIGFzc2VydEVxdWFscyhpc0xlYXAoMTk3MiksIHRydWUpO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgQWNjb3VudGluZyBmb3IgdGltZXpvbmVzXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGlzTGVhcCB9IGZyb20gXCJAc3RkL2RhdGV0aW1lL2lzLWxlYXBcIjtcbiAqXG4gKiAgLy8gVHJ1ZSBpZiB0aGUgbG9jYWwgdGltZXpvbmUgaXMgR01UKzA7IGZhbHNlIGlmIHRoZSBsb2NhbCB0aW1lem9uZSBpcyBHTVQtMVxuICogaXNMZWFwKG5ldyBEYXRlKFwiMjAwMC0wMS0wMVwiKSk7XG4gKlxuICogLy8gVHJ1ZSByZWdhcmRsZXNzIG9mIHRoZSBsb2NhbCB0aW1lem9uZVxuICogaXNMZWFwKDIwMDApO1xuICpcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNMZWFwKHllYXI6IERhdGUgfCBudW1iZXIpOiBib29sZWFuIHtcbiAgY29uc3QgeWVhck51bWJlciA9IHllYXIgaW5zdGFuY2VvZiBEYXRlID8geWVhci5nZXRGdWxsWWVhcigpIDogeWVhcjtcbiAgcmV0dXJuIGlzWWVhck51bWJlckFMZWFwWWVhcih5ZWFyTnVtYmVyKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIHllYXIgaXMgYSBsZWFwIHllYXIgaW4gVVRDIHRpbWUuIFRoaXMgYWx3YXlzXG4gKiByZXR1cm5zIHRoZSBzYW1lIHZhbHVlIHJlZ2FyZGxlc3Mgb2YgdGhlIGxvY2FsIHRpbWV6b25lLlxuXG4gKiBUaGlzIGlzIGJhc2VkIG9uXG4gKiB7QGxpbmsgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvb2ZmaWNlL3Ryb3VibGVzaG9vdC9leGNlbC9kZXRlcm1pbmUtYS1sZWFwLXllYXJ9LlxuICpcbiAqIEBwYXJhbSB5ZWFyIFRoZSB5ZWFyIGluIG51bWJlciBvciBgRGF0ZWAgZm9ybWF0LlxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBnaXZlbiB5ZWFyIGlzIGEgbGVhcCB5ZWFyOyBgZmFsc2VgIG90aGVyd2lzZS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGlzVXRjTGVhcCB9IGZyb20gXCJAc3RkL2RhdGV0aW1lL2lzLWxlYXBcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydEVxdWFscyhpc1V0Y0xlYXAobmV3IERhdGUoXCIyMDAwLTAxLTAxXCIpKSwgdHJ1ZSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGlzVXRjTGVhcChuZXcgRGF0ZShcIkRlY2VtYmVyIDMxLCAxOTk5IDIzOjU5OjU5IEdNVC0wMTowMFwiKSksIHRydWUpO1xuICpcbiAqIGFzc2VydEVxdWFscyhpc1V0Y0xlYXAoMjAwMCksIHRydWUpO1xuICpcbiAqIGFzc2VydEVxdWFscyhpc1V0Y0xlYXAoMTk5OSksIGZhbHNlKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNVdGNMZWFwKHllYXI6IERhdGUgfCBudW1iZXIpOiBib29sZWFuIHtcbiAgY29uc3QgeWVhck51bWJlciA9IHllYXIgaW5zdGFuY2VvZiBEYXRlID8geWVhci5nZXRVVENGdWxsWWVhcigpIDogeWVhcjtcbiAgcmV0dXJuIGlzWWVhck51bWJlckFMZWFwWWVhcih5ZWFyTnVtYmVyKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsc0JBQXNCLFVBQWtCO0VBQy9DLE9BQ0UsQUFBQyxhQUFhLE1BQU0sS0FBSyxhQUFhLFFBQVEsS0FBTSxhQUFhLFFBQVE7QUFFN0U7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFDQyxHQUNELE9BQU8sU0FBUyxPQUFPLElBQW1CO0VBQ3hDLE1BQU0sYUFBYSxnQkFBZ0IsT0FBTyxLQUFLLFdBQVcsS0FBSztFQUMvRCxPQUFPLHNCQUFzQjtBQUMvQjtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVCQyxHQUNELE9BQU8sU0FBUyxVQUFVLElBQW1CO0VBQzNDLE1BQU0sYUFBYSxnQkFBZ0IsT0FBTyxLQUFLLGNBQWMsS0FBSztFQUNsRSxPQUFPLHNCQUFzQjtBQUMvQiJ9
// denoCacheMetadata=13546184818797965676,12324717948714699761