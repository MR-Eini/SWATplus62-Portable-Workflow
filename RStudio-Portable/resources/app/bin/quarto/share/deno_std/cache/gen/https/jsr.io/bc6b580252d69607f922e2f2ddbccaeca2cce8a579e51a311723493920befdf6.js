// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns a new record with all entries of the given record except the ones
 * that have a value that does not match the given predicate.
 *
 * @template T The type of the values in the input record.
 *
 * @param record The record to filter values from.
 * @param predicate The function to test each value for a condition.
 *
 * @returns A new record with all entries that have a value that matches the
 * given predicate.
 *
 * @example Basic usage
 * ```ts
 * import { filterValues } from "@std/collections/filter-values";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const people = {
 *   Arnold: 37,
 *   Sarah: 7,
 *   Kim: 23,
 * };
 * const adults = filterValues(people, (person) => person >= 18);
 *
 * assertEquals(
 *   adults,
 *   {
 *     Arnold: 37,
 *     Kim: 23,
 *   },
 * );
 * ```
 */ export function filterValues(record, predicate) {
  const result = {};
  const entries = Object.entries(record);
  for (const [key, value] of entries){
    if (predicate(value)) {
      result[key] = value;
    }
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9maWx0ZXJfdmFsdWVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogUmV0dXJucyBhIG5ldyByZWNvcmQgd2l0aCBhbGwgZW50cmllcyBvZiB0aGUgZ2l2ZW4gcmVjb3JkIGV4Y2VwdCB0aGUgb25lc1xuICogdGhhdCBoYXZlIGEgdmFsdWUgdGhhdCBkb2VzIG5vdCBtYXRjaCB0aGUgZ2l2ZW4gcHJlZGljYXRlLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0eXBlIG9mIHRoZSB2YWx1ZXMgaW4gdGhlIGlucHV0IHJlY29yZC5cbiAqXG4gKiBAcGFyYW0gcmVjb3JkIFRoZSByZWNvcmQgdG8gZmlsdGVyIHZhbHVlcyBmcm9tLlxuICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gdG8gdGVzdCBlYWNoIHZhbHVlIGZvciBhIGNvbmRpdGlvbi5cbiAqXG4gKiBAcmV0dXJucyBBIG5ldyByZWNvcmQgd2l0aCBhbGwgZW50cmllcyB0aGF0IGhhdmUgYSB2YWx1ZSB0aGF0IG1hdGNoZXMgdGhlXG4gKiBnaXZlbiBwcmVkaWNhdGUuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBmaWx0ZXJWYWx1ZXMgfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9ucy9maWx0ZXItdmFsdWVzXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHBlb3BsZSA9IHtcbiAqICAgQXJub2xkOiAzNyxcbiAqICAgU2FyYWg6IDcsXG4gKiAgIEtpbTogMjMsXG4gKiB9O1xuICogY29uc3QgYWR1bHRzID0gZmlsdGVyVmFsdWVzKHBlb3BsZSwgKHBlcnNvbikgPT4gcGVyc29uID49IDE4KTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGFkdWx0cyxcbiAqICAge1xuICogICAgIEFybm9sZDogMzcsXG4gKiAgICAgS2ltOiAyMyxcbiAqICAgfSxcbiAqICk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlclZhbHVlczxUPihcbiAgcmVjb3JkOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBUPj4sXG4gIHByZWRpY2F0ZTogKHZhbHVlOiBUKSA9PiBib29sZWFuLFxuKTogUmVjb3JkPHN0cmluZywgVD4ge1xuICBjb25zdCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIFQ+ID0ge307XG4gIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhyZWNvcmQpO1xuXG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGVudHJpZXMpIHtcbiAgICBpZiAocHJlZGljYXRlKHZhbHVlKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBZ0NDLEdBQ0QsT0FBTyxTQUFTLGFBQ2QsTUFBbUMsRUFDbkMsU0FBZ0M7RUFFaEMsTUFBTSxTQUE0QixDQUFDO0VBQ25DLE1BQU0sVUFBVSxPQUFPLE9BQU8sQ0FBQztFQUUvQixLQUFLLE1BQU0sQ0FBQyxLQUFLLE1BQU0sSUFBSSxRQUFTO0lBQ2xDLElBQUksVUFBVSxRQUFRO01BQ3BCLE1BQU0sQ0FBQyxJQUFJLEdBQUc7SUFDaEI7RUFDRjtFQUVBLE9BQU87QUFDVCJ9
// denoCacheMetadata=18091327487114292346,8035997149529333621