// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Builds two separate arrays from the given array of 2-tuples, with the first
 * returned array holding all first tuple elements and the second one holding
 * all the second elements.
 *
 * @template T The type of the first tuple elements.
 * @template U The type of the second tuple elements.
 *
 * @param pairs The array of 2-tuples to unzip.
 *
 * @returns A tuple containing two arrays, the first one holding all first tuple
 * elements and the second one holding all second elements.
 *
 * @example Basic usage
 * ```ts
 * import { unzip } from "@std/collections/unzip";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const parents = [
 *   ["Maria", "Jeff"],
 *   ["Anna", "Kim"],
 *   ["John", "Leroy"],
 * ] as [string, string][];
 *
 * const [moms, dads] = unzip(parents);
 *
 * assertEquals(moms, ["Maria", "Anna", "John"]);
 * assertEquals(dads, ["Jeff", "Kim", "Leroy"]);
 * ```
 */ export function unzip(pairs) {
  const { length } = pairs;
  const result = [
    Array(length),
    Array(length)
  ];
  pairs.forEach(([first, second], index)=>{
    result[0][index] = first;
    result[1][index] = second;
  });
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi91bnppcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIEJ1aWxkcyB0d28gc2VwYXJhdGUgYXJyYXlzIGZyb20gdGhlIGdpdmVuIGFycmF5IG9mIDItdHVwbGVzLCB3aXRoIHRoZSBmaXJzdFxuICogcmV0dXJuZWQgYXJyYXkgaG9sZGluZyBhbGwgZmlyc3QgdHVwbGUgZWxlbWVudHMgYW5kIHRoZSBzZWNvbmQgb25lIGhvbGRpbmdcbiAqIGFsbCB0aGUgc2Vjb25kIGVsZW1lbnRzLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0eXBlIG9mIHRoZSBmaXJzdCB0dXBsZSBlbGVtZW50cy5cbiAqIEB0ZW1wbGF0ZSBVIFRoZSB0eXBlIG9mIHRoZSBzZWNvbmQgdHVwbGUgZWxlbWVudHMuXG4gKlxuICogQHBhcmFtIHBhaXJzIFRoZSBhcnJheSBvZiAyLXR1cGxlcyB0byB1bnppcC5cbiAqXG4gKiBAcmV0dXJucyBBIHR1cGxlIGNvbnRhaW5pbmcgdHdvIGFycmF5cywgdGhlIGZpcnN0IG9uZSBob2xkaW5nIGFsbCBmaXJzdCB0dXBsZVxuICogZWxlbWVudHMgYW5kIHRoZSBzZWNvbmQgb25lIGhvbGRpbmcgYWxsIHNlY29uZCBlbGVtZW50cy5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHVuemlwIH0gZnJvbSBcIkBzdGQvY29sbGVjdGlvbnMvdW56aXBcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgcGFyZW50cyA9IFtcbiAqICAgW1wiTWFyaWFcIiwgXCJKZWZmXCJdLFxuICogICBbXCJBbm5hXCIsIFwiS2ltXCJdLFxuICogICBbXCJKb2huXCIsIFwiTGVyb3lcIl0sXG4gKiBdIGFzIFtzdHJpbmcsIHN0cmluZ11bXTtcbiAqXG4gKiBjb25zdCBbbW9tcywgZGFkc10gPSB1bnppcChwYXJlbnRzKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMobW9tcywgW1wiTWFyaWFcIiwgXCJBbm5hXCIsIFwiSm9oblwiXSk7XG4gKiBhc3NlcnRFcXVhbHMoZGFkcywgW1wiSmVmZlwiLCBcIktpbVwiLCBcIkxlcm95XCJdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdW56aXA8VCwgVT4ocGFpcnM6IHJlYWRvbmx5IFtULCBVXVtdKTogW1RbXSwgVVtdXSB7XG4gIGNvbnN0IHsgbGVuZ3RoIH0gPSBwYWlycztcbiAgY29uc3QgcmVzdWx0OiBbVFtdLCBVW11dID0gW1xuICAgIEFycmF5PFQ+KGxlbmd0aCksXG4gICAgQXJyYXk8VT4obGVuZ3RoKSxcbiAgXTtcblxuICBwYWlycy5mb3JFYWNoKChbZmlyc3QsIHNlY29uZF0sIGluZGV4KSA9PiB7XG4gICAgcmVzdWx0WzBdW2luZGV4XSA9IGZpcnN0O1xuICAgIHJlc3VsdFsxXVtpbmRleF0gPSBzZWNvbmQ7XG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E2QkMsR0FDRCxPQUFPLFNBQVMsTUFBWSxLQUF3QjtFQUNsRCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUc7RUFDbkIsTUFBTSxTQUFxQjtJQUN6QixNQUFTO0lBQ1QsTUFBUztHQUNWO0VBRUQsTUFBTSxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sT0FBTyxFQUFFO0lBQzlCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHO0lBQ25CLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHO0VBQ3JCO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=15196811645381785327,3581849938812418053