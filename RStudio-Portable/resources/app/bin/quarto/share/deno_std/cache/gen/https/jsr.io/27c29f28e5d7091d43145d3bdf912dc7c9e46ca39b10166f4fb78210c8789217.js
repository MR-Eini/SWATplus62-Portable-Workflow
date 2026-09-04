// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { satisfies } from "./satisfies.ts";
import { lessThan } from "./less_than.ts";
/**
 * Returns the lowest version in the list that satisfies the range, or `undefined` if
 * none of them do.
 *
 * @example Usage
 * ```ts
 * import { parse, parseRange, minSatisfying } from "@std/semver";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const versions = ["0.2.0", "1.2.3", "1.3.0", "2.0.0", "2.1.0"].map(parse);
 * const range = parseRange(">=1.0.0 <2.0.0");
 *
 * assertEquals(minSatisfying(versions, range), parse("1.2.3"));
 * ```
 *
 * @param versions The versions to check.
 * @param range The range of possible versions to compare to.
 * @returns The lowest version in versions that satisfies the range.
 */ export function minSatisfying(versions, range) {
  let min;
  for (const version of versions){
    if (!satisfies(version, range)) continue;
    min = min && lessThan(min, version) ? min : version;
  }
  return min;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvbWluX3NhdGlzZnlpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB0eXBlIHsgUmFuZ2UsIFNlbVZlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBzYXRpc2ZpZXMgfSBmcm9tIFwiLi9zYXRpc2ZpZXMudHNcIjtcbmltcG9ydCB7IGxlc3NUaGFuIH0gZnJvbSBcIi4vbGVzc190aGFuLnRzXCI7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbG93ZXN0IHZlcnNpb24gaW4gdGhlIGxpc3QgdGhhdCBzYXRpc2ZpZXMgdGhlIHJhbmdlLCBvciBgdW5kZWZpbmVkYCBpZlxuICogbm9uZSBvZiB0aGVtIGRvLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcGFyc2UsIHBhcnNlUmFuZ2UsIG1pblNhdGlzZnlpbmcgfSBmcm9tIFwiQHN0ZC9zZW12ZXJcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgdmVyc2lvbnMgPSBbXCIwLjIuMFwiLCBcIjEuMi4zXCIsIFwiMS4zLjBcIiwgXCIyLjAuMFwiLCBcIjIuMS4wXCJdLm1hcChwYXJzZSk7XG4gKiBjb25zdCByYW5nZSA9IHBhcnNlUmFuZ2UoXCI+PTEuMC4wIDwyLjAuMFwiKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMobWluU2F0aXNmeWluZyh2ZXJzaW9ucywgcmFuZ2UpLCBwYXJzZShcIjEuMi4zXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB2ZXJzaW9ucyBUaGUgdmVyc2lvbnMgdG8gY2hlY2suXG4gKiBAcGFyYW0gcmFuZ2UgVGhlIHJhbmdlIG9mIHBvc3NpYmxlIHZlcnNpb25zIHRvIGNvbXBhcmUgdG8uXG4gKiBAcmV0dXJucyBUaGUgbG93ZXN0IHZlcnNpb24gaW4gdmVyc2lvbnMgdGhhdCBzYXRpc2ZpZXMgdGhlIHJhbmdlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWluU2F0aXNmeWluZyhcbiAgdmVyc2lvbnM6IFNlbVZlcltdLFxuICByYW5nZTogUmFuZ2UsXG4pOiBTZW1WZXIgfCB1bmRlZmluZWQge1xuICBsZXQgbWluO1xuICBmb3IgKGNvbnN0IHZlcnNpb24gb2YgdmVyc2lvbnMpIHtcbiAgICBpZiAoIXNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSkpIGNvbnRpbnVlO1xuICAgIG1pbiA9IG1pbiAmJiBsZXNzVGhhbihtaW4sIHZlcnNpb24pID8gbWluIDogdmVyc2lvbjtcbiAgfVxuICByZXR1cm4gbWluO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxTQUFTLFFBQVEsaUJBQWlCO0FBQzNDLFNBQVMsUUFBUSxRQUFRLGlCQUFpQjtBQUUxQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLEdBQ0QsT0FBTyxTQUFTLGNBQ2QsUUFBa0IsRUFDbEIsS0FBWTtFQUVaLElBQUk7RUFDSixLQUFLLE1BQU0sV0FBVyxTQUFVO0lBQzlCLElBQUksQ0FBQyxVQUFVLFNBQVMsUUFBUTtJQUNoQyxNQUFNLE9BQU8sU0FBUyxLQUFLLFdBQVcsTUFBTTtFQUM5QztFQUNBLE9BQU87QUFDVCJ9
// denoCacheMetadata=12749477032509117196,6297625153662157598