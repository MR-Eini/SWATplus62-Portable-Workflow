// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns all elements in the given array that produce a distinct value using
 * the given selector, preserving order by first occurrence.
 *
 * @template T The type of the elements in the input array.
 * @template D The type of the values produced by the selector function.
 *
 * @param array The array to filter for distinct elements.
 * @param selector The function to extract the value to compare for
 * distinctness.
 *
 * @returns An array of distinct elements in the input array.
 *
 * @example Basic usage
 * ```ts
 * import { distinctBy } from "@std/collections/distinct-by";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const names = ["Anna", "Kim", "Arnold", "Kate"];
 * const exampleNamesByFirstLetter = distinctBy(names, (name) => name.charAt(0));
 *
 * assertEquals(exampleNamesByFirstLetter, ["Anna", "Kim"]);
 * ```
 */ export function distinctBy(array, selector) {
  const selectedValues = new Set();
  const result = [];
  for (const element of array){
    const selected = selector(element);
    if (!selectedValues.has(selected)) {
      selectedValues.add(selected);
      result.push(element);
    }
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9kaXN0aW5jdF9ieS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgYWxsIGVsZW1lbnRzIGluIHRoZSBnaXZlbiBhcnJheSB0aGF0IHByb2R1Y2UgYSBkaXN0aW5jdCB2YWx1ZSB1c2luZ1xuICogdGhlIGdpdmVuIHNlbGVjdG9yLCBwcmVzZXJ2aW5nIG9yZGVyIGJ5IGZpcnN0IG9jY3VycmVuY2UuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBpbnB1dCBhcnJheS5cbiAqIEB0ZW1wbGF0ZSBEIFRoZSB0eXBlIG9mIHRoZSB2YWx1ZXMgcHJvZHVjZWQgYnkgdGhlIHNlbGVjdG9yIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBhcnJheSBUaGUgYXJyYXkgdG8gZmlsdGVyIGZvciBkaXN0aW5jdCBlbGVtZW50cy5cbiAqIEBwYXJhbSBzZWxlY3RvciBUaGUgZnVuY3Rpb24gdG8gZXh0cmFjdCB0aGUgdmFsdWUgdG8gY29tcGFyZSBmb3JcbiAqIGRpc3RpbmN0bmVzcy5cbiAqXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBkaXN0aW5jdCBlbGVtZW50cyBpbiB0aGUgaW5wdXQgYXJyYXkuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkaXN0aW5jdEJ5IH0gZnJvbSBcIkBzdGQvY29sbGVjdGlvbnMvZGlzdGluY3QtYnlcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgbmFtZXMgPSBbXCJBbm5hXCIsIFwiS2ltXCIsIFwiQXJub2xkXCIsIFwiS2F0ZVwiXTtcbiAqIGNvbnN0IGV4YW1wbGVOYW1lc0J5Rmlyc3RMZXR0ZXIgPSBkaXN0aW5jdEJ5KG5hbWVzLCAobmFtZSkgPT4gbmFtZS5jaGFyQXQoMCkpO1xuICpcbiAqIGFzc2VydEVxdWFscyhleGFtcGxlTmFtZXNCeUZpcnN0TGV0dGVyLCBbXCJBbm5hXCIsIFwiS2ltXCJdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGluY3RCeTxULCBEPihcbiAgYXJyYXk6IEl0ZXJhYmxlPFQ+LFxuICBzZWxlY3RvcjogKGVsOiBUKSA9PiBELFxuKTogVFtdIHtcbiAgY29uc3Qgc2VsZWN0ZWRWYWx1ZXMgPSBuZXcgU2V0PEQ+KCk7XG4gIGNvbnN0IHJlc3VsdDogVFtdID0gW107XG4gIGZvciAoY29uc3QgZWxlbWVudCBvZiBhcnJheSkge1xuICAgIGNvbnN0IHNlbGVjdGVkID0gc2VsZWN0b3IoZWxlbWVudCk7XG4gICAgaWYgKCFzZWxlY3RlZFZhbHVlcy5oYXMoc2VsZWN0ZWQpKSB7XG4gICAgICBzZWxlY3RlZFZhbHVlcy5hZGQoc2VsZWN0ZWQpO1xuICAgICAgcmVzdWx0LnB1c2goZWxlbWVudCk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F1QkMsR0FDRCxPQUFPLFNBQVMsV0FDZCxLQUFrQixFQUNsQixRQUFzQjtFQUV0QixNQUFNLGlCQUFpQixJQUFJO0VBQzNCLE1BQU0sU0FBYyxFQUFFO0VBQ3RCLEtBQUssTUFBTSxXQUFXLE1BQU87SUFDM0IsTUFBTSxXQUFXLFNBQVM7SUFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLFdBQVc7TUFDakMsZUFBZSxHQUFHLENBQUM7TUFDbkIsT0FBTyxJQUFJLENBQUM7SUFDZDtFQUNGO0VBQ0EsT0FBTztBQUNUIn0=
// denoCacheMetadata=1912126682748260935,665767619768154069