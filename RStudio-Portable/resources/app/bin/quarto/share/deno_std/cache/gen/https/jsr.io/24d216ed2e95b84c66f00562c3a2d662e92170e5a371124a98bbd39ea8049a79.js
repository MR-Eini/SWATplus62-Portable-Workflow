// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { EXTRACT_REGEXP_MAP } from "./_formats.ts";
/**
 * Tests if a string has valid front matter.
 * Supports {@link https://yaml.org | YAML}, {@link https://toml.io | TOML} and
 * {@link https://www.json.org/ | JSON}.
 *
 * @param str String to test.
 * @param formats A list of formats to test for. Defaults to all supported formats.
 * @returns `true` if the string has valid front matter, otherwise `false`.
 *
 * @example Test for valid YAML front matter
 * ```ts
 * import { test } from "@std/front-matter/test";
 * import { assert } from "@std/assert";
 *
 * const result = test(
 * `---
 * title: Three dashes marks the spot
 * ---
 * `);
 * assert(result);
 * ```
 *
 * @example Test for valid TOML front matter
 * ```ts
 * import { test } from "@std/front-matter/test";
 * import { assert } from "@std/assert";
 *
 * const result = test(
 * `---toml
 * title = 'Three dashes followed by format marks the spot'
 * ---
 * `);
 * assert(result);
 * ```
 *
 * @example Test for valid JSON front matter
 * ```ts
 * import { test } from "@std/front-matter/test";
 * import { assert } from "@std/assert";
 *
 * const result = test(
 * `---json
 * {"title": "Three dashes followed by format marks the spot"}
 * ---
 * `);
 * assert(result);
 * ```
 *
 * @example JSON front matter is not valid as YAML
 * ```ts
 * import { test } from "@std/front-matter/test";
 * import { assertFalse } from "@std/assert";
 *
 * const result = test(
 * `---json
 * {"title": "Three dashes followed by format marks the spot"}
 * ---
 * `, ["yaml"]);
 * assertFalse(result);
 * ```
 */ export function test(str, formats) {
  if (!formats) {
    formats = Object.keys(EXTRACT_REGEXP_MAP);
  }
  for (const format of formats){
    if (format === "unknown") {
      throw new TypeError("Unable to test for unknown front matter format");
    }
    const match = EXTRACT_REGEXP_MAP[format].exec(str);
    if (match?.index === 0) {
      return true;
    }
  }
  return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnJvbnQtbWF0dGVyLzAuMjI0LjMvdGVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBFWFRSQUNUX1JFR0VYUF9NQVAgfSBmcm9tIFwiLi9fZm9ybWF0cy50c1wiO1xuaW1wb3J0IHR5cGUgeyBGb3JtYXQgfSBmcm9tIFwiLi9fdHlwZXMudHNcIjtcblxuZXhwb3J0IHR5cGUgeyBGb3JtYXQgfTtcblxuLyoqXG4gKiBUZXN0cyBpZiBhIHN0cmluZyBoYXMgdmFsaWQgZnJvbnQgbWF0dGVyLlxuICogU3VwcG9ydHMge0BsaW5rIGh0dHBzOi8veWFtbC5vcmcgfCBZQU1MfSwge0BsaW5rIGh0dHBzOi8vdG9tbC5pbyB8IFRPTUx9IGFuZFxuICoge0BsaW5rIGh0dHBzOi8vd3d3Lmpzb24ub3JnLyB8IEpTT059LlxuICpcbiAqIEBwYXJhbSBzdHIgU3RyaW5nIHRvIHRlc3QuXG4gKiBAcGFyYW0gZm9ybWF0cyBBIGxpc3Qgb2YgZm9ybWF0cyB0byB0ZXN0IGZvci4gRGVmYXVsdHMgdG8gYWxsIHN1cHBvcnRlZCBmb3JtYXRzLlxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBzdHJpbmcgaGFzIHZhbGlkIGZyb250IG1hdHRlciwgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gKlxuICogQGV4YW1wbGUgVGVzdCBmb3IgdmFsaWQgWUFNTCBmcm9udCBtYXR0ZXJcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB0ZXN0IH0gZnJvbSBcIkBzdGQvZnJvbnQtbWF0dGVyL3Rlc3RcIjtcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHJlc3VsdCA9IHRlc3QoXG4gKiBgLS0tXG4gKiB0aXRsZTogVGhyZWUgZGFzaGVzIG1hcmtzIHRoZSBzcG90XG4gKiAtLS1cbiAqIGApO1xuICogYXNzZXJ0KHJlc3VsdCk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBUZXN0IGZvciB2YWxpZCBUT01MIGZyb250IG1hdHRlclxuICogYGBgdHNcbiAqIGltcG9ydCB7IHRlc3QgfSBmcm9tIFwiQHN0ZC9mcm9udC1tYXR0ZXIvdGVzdFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3QgcmVzdWx0ID0gdGVzdChcbiAqIGAtLS10b21sXG4gKiB0aXRsZSA9ICdUaHJlZSBkYXNoZXMgZm9sbG93ZWQgYnkgZm9ybWF0IG1hcmtzIHRoZSBzcG90J1xuICogLS0tXG4gKiBgKTtcbiAqIGFzc2VydChyZXN1bHQpO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgVGVzdCBmb3IgdmFsaWQgSlNPTiBmcm9udCBtYXR0ZXJcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB0ZXN0IH0gZnJvbSBcIkBzdGQvZnJvbnQtbWF0dGVyL3Rlc3RcIjtcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHJlc3VsdCA9IHRlc3QoXG4gKiBgLS0tanNvblxuICoge1widGl0bGVcIjogXCJUaHJlZSBkYXNoZXMgZm9sbG93ZWQgYnkgZm9ybWF0IG1hcmtzIHRoZSBzcG90XCJ9XG4gKiAtLS1cbiAqIGApO1xuICogYXNzZXJ0KHJlc3VsdCk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBKU09OIGZyb250IG1hdHRlciBpcyBub3QgdmFsaWQgYXMgWUFNTFxuICogYGBgdHNcbiAqIGltcG9ydCB7IHRlc3QgfSBmcm9tIFwiQHN0ZC9mcm9udC1tYXR0ZXIvdGVzdFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RmFsc2UgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCByZXN1bHQgPSB0ZXN0KFxuICogYC0tLWpzb25cbiAqIHtcInRpdGxlXCI6IFwiVGhyZWUgZGFzaGVzIGZvbGxvd2VkIGJ5IGZvcm1hdCBtYXJrcyB0aGUgc3BvdFwifVxuICogLS0tXG4gKiBgLCBbXCJ5YW1sXCJdKTtcbiAqIGFzc2VydEZhbHNlKHJlc3VsdCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRlc3QoXG4gIHN0cjogc3RyaW5nLFxuICBmb3JtYXRzPzogRm9ybWF0W10sXG4pOiBib29sZWFuIHtcbiAgaWYgKCFmb3JtYXRzKSB7XG4gICAgZm9ybWF0cyA9IE9iamVjdC5rZXlzKEVYVFJBQ1RfUkVHRVhQX01BUCkgYXMgRm9ybWF0W107XG4gIH1cblxuICBmb3IgKGNvbnN0IGZvcm1hdCBvZiBmb3JtYXRzKSB7XG4gICAgaWYgKGZvcm1hdCA9PT0gXCJ1bmtub3duXCIpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gdGVzdCBmb3IgdW5rbm93biBmcm9udCBtYXR0ZXIgZm9ybWF0XCIpO1xuICAgIH1cblxuICAgIGNvbnN0IG1hdGNoID0gRVhUUkFDVF9SRUdFWFBfTUFQW2Zvcm1hdF0uZXhlYyhzdHIpO1xuICAgIGlmIChtYXRjaD8uaW5kZXggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUUsU0FBUyxrQkFBa0IsUUFBUSxnQkFBZ0I7QUFLbkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTREQyxHQUNELE9BQU8sU0FBUyxLQUNkLEdBQVcsRUFDWCxPQUFrQjtFQUVsQixJQUFJLENBQUMsU0FBUztJQUNaLFVBQVUsT0FBTyxJQUFJLENBQUM7RUFDeEI7RUFFQSxLQUFLLE1BQU0sVUFBVSxRQUFTO0lBQzVCLElBQUksV0FBVyxXQUFXO01BQ3hCLE1BQU0sSUFBSSxVQUFVO0lBQ3RCO0lBRUEsTUFBTSxRQUFRLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDOUMsSUFBSSxPQUFPLFVBQVUsR0FBRztNQUN0QixPQUFPO0lBQ1Q7RUFDRjtFQUVBLE9BQU87QUFDVCJ9
// denoCacheMetadata=9982988458306329905,10267472091052623276