// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * The number of milliseconds in a second.
 *
 * @example
 * ```ts
 * import { SECOND } from "@std/datetime/constants";
 *
 * SECOND; // 1_000
 * ```
 */ export const SECOND = 1e3;
/**
 * The number of milliseconds in a minute.
 *
 * @example
 * ```ts
 * import { MINUTE } from "@std/datetime/constants";
 *
 * MINUTE; // 60_000
 * ```
 */ export const MINUTE = SECOND * 60;
/**
 * The number of milliseconds in an hour.
 *
 * @example
 * ```ts
 * import { HOUR } from "@std/datetime/constants";
 *
 * HOUR; // 3_600_000
 * ```
 */ export const HOUR = MINUTE * 60;
/**
 * The number of milliseconds in a day.
 *
 * @example
 * ```ts
 * import { DAY } from "@std/datetime/constants";
 *
 * DAY; // 86_400_000
 * ```
 */ export const DAY = HOUR * 24;
/**
 * The number of milliseconds in a week.
 *
 * @example
 * ```ts
 * import { WEEK } from "@std/datetime/constants";
 *
 * WEEK; // 604_800_000
 * ```
 */ export const WEEK = DAY * 7;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZGF0ZXRpbWUvMC4yMjQuNS9jb25zdGFudHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpbiBhIHNlY29uZC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IFNFQ09ORCB9IGZyb20gXCJAc3RkL2RhdGV0aW1lL2NvbnN0YW50c1wiO1xuICpcbiAqIFNFQ09ORDsgLy8gMV8wMDBcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgU0VDT05EID0gMWUzO1xuLyoqXG4gKiBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpbiBhIG1pbnV0ZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IE1JTlVURSB9IGZyb20gXCJAc3RkL2RhdGV0aW1lL2NvbnN0YW50c1wiO1xuICpcbiAqIE1JTlVURTsgLy8gNjBfMDAwXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IE1JTlVURTogbnVtYmVyID0gU0VDT05EICogNjA7XG4vKipcbiAqIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGluIGFuIGhvdXIuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBIT1VSIH0gZnJvbSBcIkBzdGQvZGF0ZXRpbWUvY29uc3RhbnRzXCI7XG4gKlxuICogSE9VUjsgLy8gM182MDBfMDAwXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IEhPVVI6IG51bWJlciA9IE1JTlVURSAqIDYwO1xuLyoqXG4gKiBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpbiBhIGRheS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IERBWSB9IGZyb20gXCJAc3RkL2RhdGV0aW1lL2NvbnN0YW50c1wiO1xuICpcbiAqIERBWTsgLy8gODZfNDAwXzAwMFxuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBEQVk6IG51bWJlciA9IEhPVVIgKiAyNDtcbi8qKlxuICogVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaW4gYSB3ZWVrLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgV0VFSyB9IGZyb20gXCJAc3RkL2RhdGV0aW1lL2NvbnN0YW50c1wiO1xuICpcbiAqIFdFRUs7IC8vIDYwNF84MDBfMDAwXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFdFRUs6IG51bWJlciA9IERBWSAqIDc7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7O0NBU0MsR0FDRCxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQzFCOzs7Ozs7Ozs7Q0FTQyxHQUNELE9BQU8sTUFBTSxTQUFpQixTQUFTLEdBQUc7QUFDMUM7Ozs7Ozs7OztDQVNDLEdBQ0QsT0FBTyxNQUFNLE9BQWUsU0FBUyxHQUFHO0FBQ3hDOzs7Ozs7Ozs7Q0FTQyxHQUNELE9BQU8sTUFBTSxNQUFjLE9BQU8sR0FBRztBQUNyQzs7Ozs7Ozs7O0NBU0MsR0FDRCxPQUFPLE1BQU0sT0FBZSxNQUFNLEVBQUUifQ==
// denoCacheMetadata=15947429187773588884,12833288989798483951