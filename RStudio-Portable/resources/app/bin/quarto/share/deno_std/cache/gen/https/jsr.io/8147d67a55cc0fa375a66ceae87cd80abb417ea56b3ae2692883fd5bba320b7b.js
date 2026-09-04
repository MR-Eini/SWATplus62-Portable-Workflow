// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns `true` if the prefix array appears at the start of the source array,
 * `false` otherwise.
 *
 * The complexity of this function is `O(prefix.length)`.
 *
 * @param source Source array to check.
 * @param prefix Prefix array to check for.
 * @returns `true` if the prefix array appears at the start of the source array,
 * `false` otherwise.
 *
 * @example Basic usage
 * ```ts
 * import { startsWith } from "@std/bytes/starts-with";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const prefix = new Uint8Array([0, 1, 2]);
 *
 * startsWith(source, prefix); // true
 * ```
 */ export function startsWith(source, prefix) {
  for(let i = 0; i < prefix.length; i++){
    if (source[i] !== prefix[i]) return false;
  }
  return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMC4yMjQuMC9zdGFydHNfd2l0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBwcmVmaXggYXJyYXkgYXBwZWFycyBhdCB0aGUgc3RhcnQgb2YgdGhlIHNvdXJjZSBhcnJheSxcbiAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICpcbiAqIFRoZSBjb21wbGV4aXR5IG9mIHRoaXMgZnVuY3Rpb24gaXMgYE8ocHJlZml4Lmxlbmd0aClgLlxuICpcbiAqIEBwYXJhbSBzb3VyY2UgU291cmNlIGFycmF5IHRvIGNoZWNrLlxuICogQHBhcmFtIHByZWZpeCBQcmVmaXggYXJyYXkgdG8gY2hlY2sgZm9yLlxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBwcmVmaXggYXJyYXkgYXBwZWFycyBhdCB0aGUgc3RhcnQgb2YgdGhlIHNvdXJjZSBhcnJheSxcbiAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgc3RhcnRzV2l0aCB9IGZyb20gXCJAc3RkL2J5dGVzL3N0YXJ0cy13aXRoXCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDEsIDIsIDEsIDIsIDNdKTtcbiAqIGNvbnN0IHByZWZpeCA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyXSk7XG4gKlxuICogc3RhcnRzV2l0aChzb3VyY2UsIHByZWZpeCk7IC8vIHRydWVcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRzV2l0aChzb3VyY2U6IFVpbnQ4QXJyYXksIHByZWZpeDogVWludDhBcnJheSk6IGJvb2xlYW4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeC5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzb3VyY2VbaV0gIT09IHByZWZpeFtpXSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0JDLEdBQ0QsT0FBTyxTQUFTLFdBQVcsTUFBa0IsRUFBRSxNQUFrQjtFQUMvRCxJQUFLLElBQUksSUFBSSxHQUFHLElBQUksT0FBTyxNQUFNLEVBQUUsSUFBSztJQUN0QyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPO0VBQ3RDO0VBQ0EsT0FBTztBQUNUIn0=
// denoCacheMetadata=4016507012328345141,1396477387113091200