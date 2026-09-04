// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Applies the given transformer to all entries in the given record and returns
 * a new record containing the results.
 *
 * @template T The type of the values in the input record.
 * @template O The type of the values in the output record.
 *
 * @param record The record to map entries from.
 * @param transformer The function to transform each entry.
 *
 * @returns A new record with all entries transformed by the given transformer.
 *
 * @example Basic usage
 * ```ts
 * import { mapEntries } from "@std/collections/map-entries";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const usersById = {
 *   "a2e": { name: "Kim", age: 22 },
 *   "dfe": { name: "Anna", age: 31 },
 *   "34b": { name: "Tim", age: 58 },
 * };
 *
 * const agesByNames = mapEntries(usersById, ([id, { name, age }]) => [name, age]);
 *
 * assertEquals(
 *   agesByNames,
 *   {
 *     Kim: 22,
 *     Anna: 31,
 *     Tim: 58,
 *   },
 * );
 * ```
 */ export function mapEntries(record, transformer) {
  const result = {};
  const entries = Object.entries(record);
  for (const entry of entries){
    const [mappedKey, mappedValue] = transformer(entry);
    result[mappedKey] = mappedValue;
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9tYXBfZW50cmllcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIEFwcGxpZXMgdGhlIGdpdmVuIHRyYW5zZm9ybWVyIHRvIGFsbCBlbnRyaWVzIGluIHRoZSBnaXZlbiByZWNvcmQgYW5kIHJldHVybnNcbiAqIGEgbmV3IHJlY29yZCBjb250YWluaW5nIHRoZSByZXN1bHRzLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0eXBlIG9mIHRoZSB2YWx1ZXMgaW4gdGhlIGlucHV0IHJlY29yZC5cbiAqIEB0ZW1wbGF0ZSBPIFRoZSB0eXBlIG9mIHRoZSB2YWx1ZXMgaW4gdGhlIG91dHB1dCByZWNvcmQuXG4gKlxuICogQHBhcmFtIHJlY29yZCBUaGUgcmVjb3JkIHRvIG1hcCBlbnRyaWVzIGZyb20uXG4gKiBAcGFyYW0gdHJhbnNmb3JtZXIgVGhlIGZ1bmN0aW9uIHRvIHRyYW5zZm9ybSBlYWNoIGVudHJ5LlxuICpcbiAqIEByZXR1cm5zIEEgbmV3IHJlY29yZCB3aXRoIGFsbCBlbnRyaWVzIHRyYW5zZm9ybWVkIGJ5IHRoZSBnaXZlbiB0cmFuc2Zvcm1lci5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IG1hcEVudHJpZXMgfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9ucy9tYXAtZW50cmllc1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCB1c2Vyc0J5SWQgPSB7XG4gKiAgIFwiYTJlXCI6IHsgbmFtZTogXCJLaW1cIiwgYWdlOiAyMiB9LFxuICogICBcImRmZVwiOiB7IG5hbWU6IFwiQW5uYVwiLCBhZ2U6IDMxIH0sXG4gKiAgIFwiMzRiXCI6IHsgbmFtZTogXCJUaW1cIiwgYWdlOiA1OCB9LFxuICogfTtcbiAqXG4gKiBjb25zdCBhZ2VzQnlOYW1lcyA9IG1hcEVudHJpZXModXNlcnNCeUlkLCAoW2lkLCB7IG5hbWUsIGFnZSB9XSkgPT4gW25hbWUsIGFnZV0pO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgYWdlc0J5TmFtZXMsXG4gKiAgIHtcbiAqICAgICBLaW06IDIyLFxuICogICAgIEFubmE6IDMxLFxuICogICAgIFRpbTogNTgsXG4gKiAgIH0sXG4gKiApO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBFbnRyaWVzPFQsIE8+KFxuICByZWNvcmQ6IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIFQ+PixcbiAgdHJhbnNmb3JtZXI6IChlbnRyeTogW3N0cmluZywgVF0pID0+IFtzdHJpbmcsIE9dLFxuKTogUmVjb3JkPHN0cmluZywgTz4ge1xuICBjb25zdCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIE8+ID0ge307XG4gIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhyZWNvcmQpO1xuXG4gIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgIGNvbnN0IFttYXBwZWRLZXksIG1hcHBlZFZhbHVlXSA9IHRyYW5zZm9ybWVyKGVudHJ5KTtcblxuICAgIHJlc3VsdFttYXBwZWRLZXldID0gbWFwcGVkVmFsdWU7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FrQ0MsR0FDRCxPQUFPLFNBQVMsV0FDZCxNQUFtQyxFQUNuQyxXQUFnRDtFQUVoRCxNQUFNLFNBQTRCLENBQUM7RUFDbkMsTUFBTSxVQUFVLE9BQU8sT0FBTyxDQUFDO0VBRS9CLEtBQUssTUFBTSxTQUFTLFFBQVM7SUFDM0IsTUFBTSxDQUFDLFdBQVcsWUFBWSxHQUFHLFlBQVk7SUFFN0MsTUFBTSxDQUFDLFVBQVUsR0FBRztFQUN0QjtFQUVBLE9BQU87QUFDVCJ9
// denoCacheMetadata=6318393090343558631,14127311881074589931