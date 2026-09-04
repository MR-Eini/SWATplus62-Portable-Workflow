// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { createExtractor } from "./create_extractor.ts";
/**
 * Extracts and parses {@link https://www.json.org/ | JSON } from the metadata
 * of front matter content.
 *
 * @example Extract JSON front matter
 * ```ts
 * import { extract } from "@std/front-matter/json";
 * import { assertEquals } from "@std/assert";
 *
 * const output = `---json
 * {
 *   "title": "Three dashes marks the spot"
 * }
 * ---
 * Hello, world!`;
 * const result = extract(output);
 *
 * assertEquals(result, {
 *   frontMatter: '{\n  "title": "Three dashes marks the spot"\n}',
 *   body: "Hello, world!",
 *   attrs: { title: "Three dashes marks the spot" },
 * });
 * ```
 */ export const extract = createExtractor({
  json: JSON.parse
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnJvbnQtbWF0dGVyLzAuMjI0LjMvanNvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQge1xuICBjcmVhdGVFeHRyYWN0b3IsXG4gIHR5cGUgRXh0cmFjdG9yLFxuICB0eXBlIFBhcnNlcixcbn0gZnJvbSBcIi4vY3JlYXRlX2V4dHJhY3Rvci50c1wiO1xuXG4vKipcbiAqIEV4dHJhY3RzIGFuZCBwYXJzZXMge0BsaW5rIGh0dHBzOi8vd3d3Lmpzb24ub3JnLyB8IEpTT04gfSBmcm9tIHRoZSBtZXRhZGF0YVxuICogb2YgZnJvbnQgbWF0dGVyIGNvbnRlbnQuXG4gKlxuICogQGV4YW1wbGUgRXh0cmFjdCBKU09OIGZyb250IG1hdHRlclxuICogYGBgdHNcbiAqIGltcG9ydCB7IGV4dHJhY3QgfSBmcm9tIFwiQHN0ZC9mcm9udC1tYXR0ZXIvanNvblwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3Qgb3V0cHV0ID0gYC0tLWpzb25cbiAqIHtcbiAqICAgXCJ0aXRsZVwiOiBcIlRocmVlIGRhc2hlcyBtYXJrcyB0aGUgc3BvdFwiXG4gKiB9XG4gKiAtLS1cbiAqIEhlbGxvLCB3b3JsZCFgO1xuICogY29uc3QgcmVzdWx0ID0gZXh0cmFjdChvdXRwdXQpO1xuICpcbiAqIGFzc2VydEVxdWFscyhyZXN1bHQsIHtcbiAqICAgZnJvbnRNYXR0ZXI6ICd7XFxuICBcInRpdGxlXCI6IFwiVGhyZWUgZGFzaGVzIG1hcmtzIHRoZSBzcG90XCJcXG59JyxcbiAqICAgYm9keTogXCJIZWxsbywgd29ybGQhXCIsXG4gKiAgIGF0dHJzOiB7IHRpdGxlOiBcIlRocmVlIGRhc2hlcyBtYXJrcyB0aGUgc3BvdFwiIH0sXG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgZXh0cmFjdDogRXh0cmFjdG9yID0gY3JlYXRlRXh0cmFjdG9yKHtcbiAganNvbjogSlNPTi5wYXJzZSBhcyBQYXJzZXIsXG59KTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUUsU0FDRSxlQUFlLFFBR1Ysd0JBQXdCO0FBRS9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVCQyxHQUNELE9BQU8sTUFBTSxVQUFxQixnQkFBZ0I7RUFDaEQsTUFBTSxLQUFLLEtBQUs7QUFDbEIsR0FBRyJ9
// denoCacheMetadata=1789185542712676855,17892248591840362393