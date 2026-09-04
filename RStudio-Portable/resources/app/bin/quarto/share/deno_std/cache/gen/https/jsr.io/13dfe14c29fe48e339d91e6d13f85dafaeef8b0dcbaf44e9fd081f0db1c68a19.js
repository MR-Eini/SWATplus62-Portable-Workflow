// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns true if the given value is part of the given object, otherwise it
 * returns false.
 *
 * Note: this doesn't work with non-primitive values. For example,
 * `includesValue({x: {}}, {})` returns false.
 *
 * @template T The type of the values in the input record.
 *
 * @param record The record to check for the given value.
 * @param value The value to check for in the record.
 *
 * @returns `true` if the value is part of the record, otherwise `false`.
 *
 * @example Basic usage
 * ```ts
 * import { includesValue } from "@std/collections/includes-value";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const input = {
 *   first: 33,
 *   second: 34,
 * };
 *
 * assertEquals(includesValue(input, 34), true);
 * ```
 */ export function includesValue(record, value) {
  for(const i in record){
    if (Object.hasOwn(record, i) && (record[i] === value || Number.isNaN(value) && Number.isNaN(record[i]))) {
      return true;
    }
  }
  return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9pbmNsdWRlc192YWx1ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgcGFydCBvZiB0aGUgZ2l2ZW4gb2JqZWN0LCBvdGhlcndpc2UgaXRcbiAqIHJldHVybnMgZmFsc2UuXG4gKlxuICogTm90ZTogdGhpcyBkb2Vzbid0IHdvcmsgd2l0aCBub24tcHJpbWl0aXZlIHZhbHVlcy4gRm9yIGV4YW1wbGUsXG4gKiBgaW5jbHVkZXNWYWx1ZSh7eDoge319LCB7fSlgIHJldHVybnMgZmFsc2UuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGhlIHZhbHVlcyBpbiB0aGUgaW5wdXQgcmVjb3JkLlxuICpcbiAqIEBwYXJhbSByZWNvcmQgVGhlIHJlY29yZCB0byBjaGVjayBmb3IgdGhlIGdpdmVuIHZhbHVlLlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjayBmb3IgaW4gdGhlIHJlY29yZC5cbiAqXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlIGlzIHBhcnQgb2YgdGhlIHJlY29yZCwgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBpbmNsdWRlc1ZhbHVlIH0gZnJvbSBcIkBzdGQvY29sbGVjdGlvbnMvaW5jbHVkZXMtdmFsdWVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgaW5wdXQgPSB7XG4gKiAgIGZpcnN0OiAzMyxcbiAqICAgc2Vjb25kOiAzNCxcbiAqIH07XG4gKlxuICogYXNzZXJ0RXF1YWxzKGluY2x1ZGVzVmFsdWUoaW5wdXQsIDM0KSwgdHJ1ZSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluY2x1ZGVzVmFsdWU8VD4oXG4gIHJlY29yZDogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgVD4+LFxuICB2YWx1ZTogVCxcbik6IGJvb2xlYW4ge1xuICBmb3IgKGNvbnN0IGkgaW4gcmVjb3JkKSB7XG4gICAgaWYgKFxuICAgICAgT2JqZWN0Lmhhc093bihyZWNvcmQsIGkpICYmXG4gICAgICAocmVjb3JkW2ldID09PSB2YWx1ZSB8fCBOdW1iZXIuaXNOYU4odmFsdWUpICYmIE51bWJlci5pc05hTihyZWNvcmRbaV0pKVxuICAgICkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMEJDLEdBQ0QsT0FBTyxTQUFTLGNBQ2QsTUFBbUMsRUFDbkMsS0FBUTtFQUVSLElBQUssTUFBTSxLQUFLLE9BQVE7SUFDdEIsSUFDRSxPQUFPLE1BQU0sQ0FBQyxRQUFRLE1BQ3RCLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxTQUFTLE9BQU8sS0FBSyxDQUFDLFVBQVUsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUN0RTtNQUNBLE9BQU87SUFDVDtFQUNGO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=1816195347026003566,14668430128917239746