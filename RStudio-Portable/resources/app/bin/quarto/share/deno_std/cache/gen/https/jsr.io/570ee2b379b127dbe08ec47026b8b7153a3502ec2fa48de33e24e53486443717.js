// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { createExtractor } from "./create_extractor.ts";
import { parse } from "jsr:/@std/yaml@^1.0.0-rc.1/parse";
/**
 * Extracts and parses {@link https://yaml.org | YAML} from the metadata of
 * front matter content.
 *
 * @example Extract YAML front matter
 * ```ts
 * import { extract } from "@std/front-matter/yaml";
 * import { assertEquals } from "@std/assert";
 *
 * const output = `---yaml
 * title: Three dashes marks the spot
 * ---
 * Hello, world!`;
 * const result = extract(output);
 *
 * assertEquals(result, {
 *   frontMatter: "title: Three dashes marks the spot",
 *   body: "Hello, world!",
 *   attrs: { title: "Three dashes marks the spot" },
 * });
 * ```
 */ export const extract = createExtractor({
  ["yaml"]: parse
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnJvbnQtbWF0dGVyLzAuMjI0LjMveWFtbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQge1xuICBjcmVhdGVFeHRyYWN0b3IsXG4gIHR5cGUgRXh0cmFjdG9yLFxuICB0eXBlIFBhcnNlcixcbn0gZnJvbSBcIi4vY3JlYXRlX2V4dHJhY3Rvci50c1wiO1xuaW1wb3J0IHsgcGFyc2UgfSBmcm9tIFwianNyOi9Ac3RkL3lhbWxAXjEuMC4wLXJjLjEvcGFyc2VcIjtcblxuLyoqXG4gKiBFeHRyYWN0cyBhbmQgcGFyc2VzIHtAbGluayBodHRwczovL3lhbWwub3JnIHwgWUFNTH0gZnJvbSB0aGUgbWV0YWRhdGEgb2ZcbiAqIGZyb250IG1hdHRlciBjb250ZW50LlxuICpcbiAqIEBleGFtcGxlIEV4dHJhY3QgWUFNTCBmcm9udCBtYXR0ZXJcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBleHRyYWN0IH0gZnJvbSBcIkBzdGQvZnJvbnQtbWF0dGVyL3lhbWxcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IG91dHB1dCA9IGAtLS15YW1sXG4gKiB0aXRsZTogVGhyZWUgZGFzaGVzIG1hcmtzIHRoZSBzcG90XG4gKiAtLS1cbiAqIEhlbGxvLCB3b3JsZCFgO1xuICogY29uc3QgcmVzdWx0ID0gZXh0cmFjdChvdXRwdXQpO1xuICpcbiAqIGFzc2VydEVxdWFscyhyZXN1bHQsIHtcbiAqICAgZnJvbnRNYXR0ZXI6IFwidGl0bGU6IFRocmVlIGRhc2hlcyBtYXJrcyB0aGUgc3BvdFwiLFxuICogICBib2R5OiBcIkhlbGxvLCB3b3JsZCFcIixcbiAqICAgYXR0cnM6IHsgdGl0bGU6IFwiVGhyZWUgZGFzaGVzIG1hcmtzIHRoZSBzcG90XCIgfSxcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBleHRyYWN0OiBFeHRyYWN0b3IgPSBjcmVhdGVFeHRyYWN0b3Ioe1xuICBbXCJ5YW1sXCJdOiBwYXJzZSBhcyBQYXJzZXIsXG59KTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUUsU0FDRSxlQUFlLFFBR1Ysd0JBQXdCO0FBQy9CLFNBQVMsS0FBSyxRQUFRLG1DQUFtQztBQUV6RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBcUJDLEdBQ0QsT0FBTyxNQUFNLFVBQXFCLGdCQUFnQjtFQUNoRCxDQUFDLE9BQU8sRUFBRTtBQUNaLEdBQUcifQ==
// denoCacheMetadata=12215185050210367412,12600213910504896219