// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion that actual is not null or undefined.
 * If not then throw.
 *
 * @example
 * ```ts
 * import { assertExists } from "@std/assert/assert-exists";
 *
 * assertExists("something"); // Doesn't throw
 * assertExists(undefined); // Throws
 * ```
 */ export function assertExists(actual, msg) {
  if (actual === undefined || actual === null) {
    const msgSuffix = msg ? `: ${msg}` : ".";
    msg = `Expected actual: "${actual}" to not be null or undefined${msgSuffix}`;
    throw new AssertionError(msg);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzAuMjI0LjAvYXNzZXJ0X2V4aXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHsgQXNzZXJ0aW9uRXJyb3IgfSBmcm9tIFwiLi9hc3NlcnRpb25fZXJyb3IudHNcIjtcblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGFjdHVhbCBpcyBub3QgbnVsbCBvciB1bmRlZmluZWQuXG4gKiBJZiBub3QgdGhlbiB0aHJvdy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGFzc2VydEV4aXN0cyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXhpc3RzXCI7XG4gKlxuICogYXNzZXJ0RXhpc3RzKFwic29tZXRoaW5nXCIpOyAvLyBEb2Vzbid0IHRocm93XG4gKiBhc3NlcnRFeGlzdHModW5kZWZpbmVkKTsgLy8gVGhyb3dzXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEV4aXN0czxUPihcbiAgYWN0dWFsOiBULFxuICBtc2c/OiBzdHJpbmcsXG4pOiBhc3NlcnRzIGFjdHVhbCBpcyBOb25OdWxsYWJsZTxUPiB7XG4gIGlmIChhY3R1YWwgPT09IHVuZGVmaW5lZCB8fCBhY3R1YWwgPT09IG51bGwpIHtcbiAgICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gICAgbXNnID1cbiAgICAgIGBFeHBlY3RlZCBhY3R1YWw6IFwiJHthY3R1YWx9XCIgdG8gbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJHttc2dTdWZmaXh9YDtcbiAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsU0FBUyxjQUFjLFFBQVEsdUJBQXVCO0FBRXREOzs7Ozs7Ozs7OztDQVdDLEdBQ0QsT0FBTyxTQUFTLGFBQ2QsTUFBUyxFQUNULEdBQVk7RUFFWixJQUFJLFdBQVcsYUFBYSxXQUFXLE1BQU07SUFDM0MsTUFBTSxZQUFZLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHO0lBQ3JDLE1BQ0UsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLDZCQUE2QixFQUFFLFdBQVc7SUFDeEUsTUFBTSxJQUFJLGVBQWU7RUFDM0I7QUFDRiJ9
// denoCacheMetadata=14261364607581849884,6238614436240007597