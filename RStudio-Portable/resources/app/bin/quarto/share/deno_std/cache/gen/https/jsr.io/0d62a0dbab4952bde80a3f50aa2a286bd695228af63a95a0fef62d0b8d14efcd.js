// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns all distinct elements that appear in any of the given arrays.
 *
 * @template T The type of the array elements.
 *
 * @param arrays The arrays to get the union of.
 *
 * @returns A new array containing all distinct elements from the given arrays.
 *
 * @example Basic usage
 * ```ts
 * import { union } from "@std/collections/union";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const soupIngredients = ["Pepper", "Carrots", "Leek"];
 * const saladIngredients = ["Carrots", "Radicchio", "Pepper"];
 *
 * const shoppingList = union(soupIngredients, saladIngredients);
 *
 * assertEquals(shoppingList, ["Pepper", "Carrots", "Leek", "Radicchio"]);
 * ```
 */ export function union(...arrays) {
  const set = new Set();
  for (const array of arrays){
    for (const element of array){
      set.add(element);
    }
  }
  return Array.from(set);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi91bmlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFJldHVybnMgYWxsIGRpc3RpbmN0IGVsZW1lbnRzIHRoYXQgYXBwZWFyIGluIGFueSBvZiB0aGUgZ2l2ZW4gYXJyYXlzLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0eXBlIG9mIHRoZSBhcnJheSBlbGVtZW50cy5cbiAqXG4gKiBAcGFyYW0gYXJyYXlzIFRoZSBhcnJheXMgdG8gZ2V0IHRoZSB1bmlvbiBvZi5cbiAqXG4gKiBAcmV0dXJucyBBIG5ldyBhcnJheSBjb250YWluaW5nIGFsbCBkaXN0aW5jdCBlbGVtZW50cyBmcm9tIHRoZSBnaXZlbiBhcnJheXMuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB1bmlvbiB9IGZyb20gXCJAc3RkL2NvbGxlY3Rpb25zL3VuaW9uXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHNvdXBJbmdyZWRpZW50cyA9IFtcIlBlcHBlclwiLCBcIkNhcnJvdHNcIiwgXCJMZWVrXCJdO1xuICogY29uc3Qgc2FsYWRJbmdyZWRpZW50cyA9IFtcIkNhcnJvdHNcIiwgXCJSYWRpY2NoaW9cIiwgXCJQZXBwZXJcIl07XG4gKlxuICogY29uc3Qgc2hvcHBpbmdMaXN0ID0gdW5pb24oc291cEluZ3JlZGllbnRzLCBzYWxhZEluZ3JlZGllbnRzKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoc2hvcHBpbmdMaXN0LCBbXCJQZXBwZXJcIiwgXCJDYXJyb3RzXCIsIFwiTGVla1wiLCBcIlJhZGljY2hpb1wiXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaW9uPFQ+KC4uLmFycmF5czogSXRlcmFibGU8VD5bXSk6IFRbXSB7XG4gIGNvbnN0IHNldCA9IG5ldyBTZXQ8VD4oKTtcblxuICBmb3IgKGNvbnN0IGFycmF5IG9mIGFycmF5cykge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBhcnJheSkge1xuICAgICAgc2V0LmFkZChlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gQXJyYXkuZnJvbShzZXQpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCQyxHQUNELE9BQU8sU0FBUyxNQUFTLEdBQUcsTUFBcUI7RUFDL0MsTUFBTSxNQUFNLElBQUk7RUFFaEIsS0FBSyxNQUFNLFNBQVMsT0FBUTtJQUMxQixLQUFLLE1BQU0sV0FBVyxNQUFPO01BQzNCLElBQUksR0FBRyxDQUFDO0lBQ1Y7RUFDRjtFQUVBLE9BQU8sTUFBTSxJQUFJLENBQUM7QUFDcEIifQ==
// denoCacheMetadata=15592805901797475849,2929168608165445604