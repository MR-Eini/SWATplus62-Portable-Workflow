// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { satisfies } from "./satisfies.ts";
import { greaterThan } from "./greater_than.ts";
/**
 * Returns the highest version in the list that satisfies the range, or `undefined`
 * if none of them do.
 *
 * @example Usage
 * ```ts
 * import { parse, parseRange, maxSatisfying } from "@std/semver";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const versions = ["1.2.3", "1.2.4", "1.3.0", "2.0.0", "2.1.0"].map(parse);
 * const range = parseRange(">=1.0.0 <2.0.0");
 *
 * assertEquals(maxSatisfying(versions, range), parse("1.3.0"));
 * ```
 *
 * @param versions The versions to check.
 * @param range The range of possible versions to compare to.
 * @returns The highest version in versions that satisfies the range.
 */ export function maxSatisfying(versions, range) {
  let max;
  for (const version of versions){
    if (!satisfies(version, range)) continue;
    max = max && greaterThan(max, version) ? max : version;
  }
  return max;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvbWF4X3NhdGlzZnlpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB0eXBlIHsgUmFuZ2UsIFNlbVZlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBzYXRpc2ZpZXMgfSBmcm9tIFwiLi9zYXRpc2ZpZXMudHNcIjtcbmltcG9ydCB7IGdyZWF0ZXJUaGFuIH0gZnJvbSBcIi4vZ3JlYXRlcl90aGFuLnRzXCI7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaGlnaGVzdCB2ZXJzaW9uIGluIHRoZSBsaXN0IHRoYXQgc2F0aXNmaWVzIHRoZSByYW5nZSwgb3IgYHVuZGVmaW5lZGBcbiAqIGlmIG5vbmUgb2YgdGhlbSBkby5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlLCBwYXJzZVJhbmdlLCBtYXhTYXRpc2Z5aW5nIH0gZnJvbSBcIkBzdGQvc2VtdmVyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHZlcnNpb25zID0gW1wiMS4yLjNcIiwgXCIxLjIuNFwiLCBcIjEuMy4wXCIsIFwiMi4wLjBcIiwgXCIyLjEuMFwiXS5tYXAocGFyc2UpO1xuICogY29uc3QgcmFuZ2UgPSBwYXJzZVJhbmdlKFwiPj0xLjAuMCA8Mi4wLjBcIik7XG4gKlxuICogYXNzZXJ0RXF1YWxzKG1heFNhdGlzZnlpbmcodmVyc2lvbnMsIHJhbmdlKSwgcGFyc2UoXCIxLjMuMFwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gdmVyc2lvbnMgVGhlIHZlcnNpb25zIHRvIGNoZWNrLlxuICogQHBhcmFtIHJhbmdlIFRoZSByYW5nZSBvZiBwb3NzaWJsZSB2ZXJzaW9ucyB0byBjb21wYXJlIHRvLlxuICogQHJldHVybnMgVGhlIGhpZ2hlc3QgdmVyc2lvbiBpbiB2ZXJzaW9ucyB0aGF0IHNhdGlzZmllcyB0aGUgcmFuZ2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXhTYXRpc2Z5aW5nKFxuICB2ZXJzaW9uczogU2VtVmVyW10sXG4gIHJhbmdlOiBSYW5nZSxcbik6IFNlbVZlciB8IHVuZGVmaW5lZCB7XG4gIGxldCBtYXg7XG4gIGZvciAoY29uc3QgdmVyc2lvbiBvZiB2ZXJzaW9ucykge1xuICAgIGlmICghc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlKSkgY29udGludWU7XG4gICAgbWF4ID0gbWF4ICYmIGdyZWF0ZXJUaGFuKG1heCwgdmVyc2lvbikgPyBtYXggOiB2ZXJzaW9uO1xuICB9XG4gIHJldHVybiBtYXg7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFNBQVMsUUFBUSxpQkFBaUI7QUFDM0MsU0FBUyxXQUFXLFFBQVEsb0JBQW9CO0FBRWhEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FrQkMsR0FDRCxPQUFPLFNBQVMsY0FDZCxRQUFrQixFQUNsQixLQUFZO0VBRVosSUFBSTtFQUNKLEtBQUssTUFBTSxXQUFXLFNBQVU7SUFDOUIsSUFBSSxDQUFDLFVBQVUsU0FBUyxRQUFRO0lBQ2hDLE1BQU0sT0FBTyxZQUFZLEtBQUssV0FBVyxNQUFNO0VBQ2pEO0VBQ0EsT0FBTztBQUNUIn0=
// denoCacheMetadata=10114205804982589459,10717070407075658479