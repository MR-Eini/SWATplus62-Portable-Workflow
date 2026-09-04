// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { EXTRACT_REGEXP_MAP, RECOGNIZE_REGEXP_MAP } from "./_formats.ts";
function _extract(str, rx, parse) {
  const match = rx.exec(str);
  if (!match || match.index !== 0) {
    throw new TypeError("Unexpected end of input");
  }
  const frontMatter = match.at(-1)?.replace(/^\s+|\s+$/g, "") || "";
  const attrs = parse(frontMatter);
  const body = str.replace(match[0], "");
  return {
    frontMatter,
    body,
    attrs
  };
}
/**
 * Recognizes the format of the front matter in a string.
 * Supports {@link https://yaml.org | YAML}, {@link https://toml.io | TOML} and
 * {@link https://www.json.org/ | JSON}.
 *
 * @param str String to recognize.
 * @param formats A list of formats to recognize. Defaults to all supported formats.
 */ function recognize(str, formats) {
  if (!formats) {
    formats = Object.keys(RECOGNIZE_REGEXP_MAP);
  }
  const [firstLine] = str.split(/(\r?\n)/);
  for (const format of formats){
    if (format === "unknown") {
      continue;
    }
    if (RECOGNIZE_REGEXP_MAP[format].test(firstLine)) {
      return format;
    }
  }
  return "unknown";
}
/**
 * Factory that creates a function that extracts front matter from a string with
 * the given parsers. Supports {@link https://yaml.org | YAML},
 * {@link https://toml.io | TOML} and {@link https://www.json.org/ | JSON}.
 *
 * For simple use cases where you know which format to parse in advance, use the
 * pre-built extractors:
 *
 * - {@linkcode https://jsr.io/@std/front-matter/doc/yaml/~/extract | extractYaml}
 * - {@linkcode https://jsr.io/@std/front-matter/doc/toml/~/extract | extractToml}
 * - {@linkcode https://jsr.io/@std/front-matter/doc/json/~/extract | extractJson}
 *
 * @param formats A descriptor containing Format-parser pairs to use for each format.
 * @returns A function that extracts front matter from a string with the given parsers.
 *
 * @example Extract YAML front matter
 * ```ts
 * import { createExtractor, Parser } from "@std/front-matter";
 * import { assertEquals } from "@std/assert";
 * import { parse as parseYaml } from "@std/yaml/parse";
 *
 * const extractYaml = createExtractor({ yaml: parseYaml as Parser });
 * const { attrs, body, frontMatter } = extractYaml<{ title: string }>(
 * `---
 * title: Three dashes marks the spot
 * ---
 * ferret`);
 * assertEquals(attrs.title, "Three dashes marks the spot");
 * assertEquals(body, "ferret");
 * assertEquals(frontMatter, "title: Three dashes marks the spot");
 * ```
 *
 * @example Extract TOML front matter
 * ```ts
 * import { createExtractor, Parser } from "@std/front-matter";
 * import { assertEquals } from "@std/assert";
 * import { parse as parseToml } from "@std/toml/parse";
 *
 * const extractToml = createExtractor({ toml: parseToml as Parser });
 * const { attrs, body, frontMatter } = extractToml<{ title: string }>(
 * `---toml
 * title = 'Three dashes followed by format marks the spot'
 * ---
 * `);
 * assertEquals(attrs.title, "Three dashes followed by format marks the spot");
 * assertEquals(body, "");
 * assertEquals(frontMatter, "title = 'Three dashes followed by format marks the spot'");
 * ```
 *
 * @example Extract JSON front matter
 * ```ts
 * import { createExtractor, Parser } from "@std/front-matter";
 * import { assertEquals } from "@std/assert";
 *
 * const extractJson = createExtractor({ json: JSON.parse as Parser });
 * const { attrs, body, frontMatter } = extractJson<{ title: string }>(
 * `---json
 * {"title": "Three dashes followed by format marks the spot"}
 * ---
 * goat`);
 * assertEquals(attrs.title, "Three dashes followed by format marks the spot");
 * assertEquals(body, "goat");
 * assertEquals(frontMatter, `{"title": "Three dashes followed by format marks the spot"}`);
 * ```
 *
 * @example Extract YAML or JSON front matter
 * ```ts
 * import { createExtractor, Parser } from "@std/front-matter";
 * import { assertEquals } from "@std/assert";
 * import { parse as parseYaml } from "@std/yaml/parse";
 *
 * const extractYamlOrJson = createExtractor({
 *   yaml: parseYaml as Parser,
 *   json: JSON.parse as Parser,
 * });
 *
 * let { attrs, body, frontMatter } = extractYamlOrJson<{ title: string }>(
 * `---
 * title: Three dashes marks the spot
 * ---
 * ferret`);
 * assertEquals(attrs.title, "Three dashes marks the spot");
 * assertEquals(body, "ferret");
 * assertEquals(frontMatter, "title: Three dashes marks the spot");
 *
 * ({ attrs, body, frontMatter } = extractYamlOrJson<{ title: string }>(
 * `---json
 * {"title": "Three dashes followed by format marks the spot"}
 * ---
 * goat`));
 * assertEquals(attrs.title, "Three dashes followed by format marks the spot");
 * assertEquals(body, "goat");
 * assertEquals(frontMatter, `{"title": "Three dashes followed by format marks the spot"}`);
 * ```
 */ export function createExtractor(formats) {
  const formatKeys = Object.keys(formats);
  return function extract(str) {
    const format = recognize(str, formatKeys);
    const parser = formats[format];
    if (format === "unknown" || !parser) {
      throw new TypeError(`Unsupported front matter format`);
    }
    return _extract(str, EXTRACT_REGEXP_MAP[format], parser);
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnJvbnQtbWF0dGVyLzAuMjI0LjMvY3JlYXRlX2V4dHJhY3Rvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBFWFRSQUNUX1JFR0VYUF9NQVAsIFJFQ09HTklaRV9SRUdFWFBfTUFQIH0gZnJvbSBcIi4vX2Zvcm1hdHMudHNcIjtcbmltcG9ydCB0eXBlIHsgRm9ybWF0IH0gZnJvbSBcIi4vX3R5cGVzLnRzXCI7XG5cbi8qKiBSZXR1cm4gdHlwZSBmb3Ige0BsaW5rY29kZSBFeHRyYWN0b3J9LiAqL1xuZXhwb3J0IHR5cGUgRXh0cmFjdDxUPiA9IHtcbiAgZnJvbnRNYXR0ZXI6IHN0cmluZztcbiAgYm9keTogc3RyaW5nO1xuICBhdHRyczogVDtcbn07XG5cbi8qKiBGdW5jdGlvbiByZXR1cm4gdHlwZSBmb3Ige0BsaW5rY29kZSBjcmVhdGVFeHRyYWN0b3J9LiAqL1xuZXhwb3J0IHR5cGUgRXh0cmFjdG9yID0gPFQgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oXG4gIHN0cjogc3RyaW5nLFxuKSA9PiBFeHRyYWN0PFQ+O1xuXG4vKiogUGFyc2VyIGZ1bmN0aW9uIHR5cGUgdXNlZCBhbG9uZ3NpZGUge0BsaW5rY29kZSBjcmVhdGVFeHRyYWN0b3J9LiAqL1xuZXhwb3J0IHR5cGUgUGFyc2VyID0gPFQgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oc3RyOiBzdHJpbmcpID0+IFQ7XG5cbmZ1bmN0aW9uIF9leHRyYWN0PFQ+KFxuICBzdHI6IHN0cmluZyxcbiAgcng6IFJlZ0V4cCxcbiAgcGFyc2U6IFBhcnNlcixcbik6IEV4dHJhY3Q8VD4ge1xuICBjb25zdCBtYXRjaCA9IHJ4LmV4ZWMoc3RyKTtcbiAgaWYgKCFtYXRjaCB8fCBtYXRjaC5pbmRleCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmV4cGVjdGVkIGVuZCBvZiBpbnB1dFwiKTtcbiAgfVxuICBjb25zdCBmcm9udE1hdHRlciA9IG1hdGNoLmF0KC0xKT8ucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgXCJcIikgfHwgXCJcIjtcbiAgY29uc3QgYXR0cnMgPSBwYXJzZShmcm9udE1hdHRlcikgYXMgVDtcbiAgY29uc3QgYm9keSA9IHN0ci5yZXBsYWNlKG1hdGNoWzBdLCBcIlwiKTtcbiAgcmV0dXJuIHsgZnJvbnRNYXR0ZXIsIGJvZHksIGF0dHJzIH07XG59XG5cbi8qKlxuICogUmVjb2duaXplcyB0aGUgZm9ybWF0IG9mIHRoZSBmcm9udCBtYXR0ZXIgaW4gYSBzdHJpbmcuXG4gKiBTdXBwb3J0cyB7QGxpbmsgaHR0cHM6Ly95YW1sLm9yZyB8IFlBTUx9LCB7QGxpbmsgaHR0cHM6Ly90b21sLmlvIHwgVE9NTH0gYW5kXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cuanNvbi5vcmcvIHwgSlNPTn0uXG4gKlxuICogQHBhcmFtIHN0ciBTdHJpbmcgdG8gcmVjb2duaXplLlxuICogQHBhcmFtIGZvcm1hdHMgQSBsaXN0IG9mIGZvcm1hdHMgdG8gcmVjb2duaXplLiBEZWZhdWx0cyB0byBhbGwgc3VwcG9ydGVkIGZvcm1hdHMuXG4gKi9cbmZ1bmN0aW9uIHJlY29nbml6ZShzdHI6IHN0cmluZywgZm9ybWF0cz86IEZvcm1hdFtdKTogRm9ybWF0IHtcbiAgaWYgKCFmb3JtYXRzKSB7XG4gICAgZm9ybWF0cyA9IE9iamVjdC5rZXlzKFJFQ09HTklaRV9SRUdFWFBfTUFQKSBhcyBGb3JtYXRbXTtcbiAgfVxuXG4gIGNvbnN0IFtmaXJzdExpbmVdID0gc3RyLnNwbGl0KC8oXFxyP1xcbikvKSBhcyBbc3RyaW5nXTtcblxuICBmb3IgKGNvbnN0IGZvcm1hdCBvZiBmb3JtYXRzKSB7XG4gICAgaWYgKGZvcm1hdCA9PT0gXCJ1bmtub3duXCIpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChSRUNPR05JWkVfUkVHRVhQX01BUFtmb3JtYXRdLnRlc3QoZmlyc3RMaW5lKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gXCJ1bmtub3duXCI7XG59XG5cbi8qKlxuICogRmFjdG9yeSB0aGF0IGNyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGV4dHJhY3RzIGZyb250IG1hdHRlciBmcm9tIGEgc3RyaW5nIHdpdGhcbiAqIHRoZSBnaXZlbiBwYXJzZXJzLiBTdXBwb3J0cyB7QGxpbmsgaHR0cHM6Ly95YW1sLm9yZyB8IFlBTUx9LFxuICoge0BsaW5rIGh0dHBzOi8vdG9tbC5pbyB8IFRPTUx9IGFuZCB7QGxpbmsgaHR0cHM6Ly93d3cuanNvbi5vcmcvIHwgSlNPTn0uXG4gKlxuICogRm9yIHNpbXBsZSB1c2UgY2FzZXMgd2hlcmUgeW91IGtub3cgd2hpY2ggZm9ybWF0IHRvIHBhcnNlIGluIGFkdmFuY2UsIHVzZSB0aGVcbiAqIHByZS1idWlsdCBleHRyYWN0b3JzOlxuICpcbiAqIC0ge0BsaW5rY29kZSBodHRwczovL2pzci5pby9Ac3RkL2Zyb250LW1hdHRlci9kb2MveWFtbC9+L2V4dHJhY3QgfCBleHRyYWN0WWFtbH1cbiAqIC0ge0BsaW5rY29kZSBodHRwczovL2pzci5pby9Ac3RkL2Zyb250LW1hdHRlci9kb2MvdG9tbC9+L2V4dHJhY3QgfCBleHRyYWN0VG9tbH1cbiAqIC0ge0BsaW5rY29kZSBodHRwczovL2pzci5pby9Ac3RkL2Zyb250LW1hdHRlci9kb2MvanNvbi9+L2V4dHJhY3QgfCBleHRyYWN0SnNvbn1cbiAqXG4gKiBAcGFyYW0gZm9ybWF0cyBBIGRlc2NyaXB0b3IgY29udGFpbmluZyBGb3JtYXQtcGFyc2VyIHBhaXJzIHRvIHVzZSBmb3IgZWFjaCBmb3JtYXQuXG4gKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRoYXQgZXh0cmFjdHMgZnJvbnQgbWF0dGVyIGZyb20gYSBzdHJpbmcgd2l0aCB0aGUgZ2l2ZW4gcGFyc2Vycy5cbiAqXG4gKiBAZXhhbXBsZSBFeHRyYWN0IFlBTUwgZnJvbnQgbWF0dGVyXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY3JlYXRlRXh0cmFjdG9yLCBQYXJzZXIgfSBmcm9tIFwiQHN0ZC9mcm9udC1tYXR0ZXJcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICogaW1wb3J0IHsgcGFyc2UgYXMgcGFyc2VZYW1sIH0gZnJvbSBcIkBzdGQveWFtbC9wYXJzZVwiO1xuICpcbiAqIGNvbnN0IGV4dHJhY3RZYW1sID0gY3JlYXRlRXh0cmFjdG9yKHsgeWFtbDogcGFyc2VZYW1sIGFzIFBhcnNlciB9KTtcbiAqIGNvbnN0IHsgYXR0cnMsIGJvZHksIGZyb250TWF0dGVyIH0gPSBleHRyYWN0WWFtbDx7IHRpdGxlOiBzdHJpbmcgfT4oXG4gKiBgLS0tXG4gKiB0aXRsZTogVGhyZWUgZGFzaGVzIG1hcmtzIHRoZSBzcG90XG4gKiAtLS1cbiAqIGZlcnJldGApO1xuICogYXNzZXJ0RXF1YWxzKGF0dHJzLnRpdGxlLCBcIlRocmVlIGRhc2hlcyBtYXJrcyB0aGUgc3BvdFwiKTtcbiAqIGFzc2VydEVxdWFscyhib2R5LCBcImZlcnJldFwiKTtcbiAqIGFzc2VydEVxdWFscyhmcm9udE1hdHRlciwgXCJ0aXRsZTogVGhyZWUgZGFzaGVzIG1hcmtzIHRoZSBzcG90XCIpO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgRXh0cmFjdCBUT01MIGZyb250IG1hdHRlclxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNyZWF0ZUV4dHJhY3RvciwgUGFyc2VyIH0gZnJvbSBcIkBzdGQvZnJvbnQtbWF0dGVyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqIGltcG9ydCB7IHBhcnNlIGFzIHBhcnNlVG9tbCB9IGZyb20gXCJAc3RkL3RvbWwvcGFyc2VcIjtcbiAqXG4gKiBjb25zdCBleHRyYWN0VG9tbCA9IGNyZWF0ZUV4dHJhY3Rvcih7IHRvbWw6IHBhcnNlVG9tbCBhcyBQYXJzZXIgfSk7XG4gKiBjb25zdCB7IGF0dHJzLCBib2R5LCBmcm9udE1hdHRlciB9ID0gZXh0cmFjdFRvbWw8eyB0aXRsZTogc3RyaW5nIH0+KFxuICogYC0tLXRvbWxcbiAqIHRpdGxlID0gJ1RocmVlIGRhc2hlcyBmb2xsb3dlZCBieSBmb3JtYXQgbWFya3MgdGhlIHNwb3QnXG4gKiAtLS1cbiAqIGApO1xuICogYXNzZXJ0RXF1YWxzKGF0dHJzLnRpdGxlLCBcIlRocmVlIGRhc2hlcyBmb2xsb3dlZCBieSBmb3JtYXQgbWFya3MgdGhlIHNwb3RcIik7XG4gKiBhc3NlcnRFcXVhbHMoYm9keSwgXCJcIik7XG4gKiBhc3NlcnRFcXVhbHMoZnJvbnRNYXR0ZXIsIFwidGl0bGUgPSAnVGhyZWUgZGFzaGVzIGZvbGxvd2VkIGJ5IGZvcm1hdCBtYXJrcyB0aGUgc3BvdCdcIik7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBFeHRyYWN0IEpTT04gZnJvbnQgbWF0dGVyXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY3JlYXRlRXh0cmFjdG9yLCBQYXJzZXIgfSBmcm9tIFwiQHN0ZC9mcm9udC1tYXR0ZXJcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IGV4dHJhY3RKc29uID0gY3JlYXRlRXh0cmFjdG9yKHsganNvbjogSlNPTi5wYXJzZSBhcyBQYXJzZXIgfSk7XG4gKiBjb25zdCB7IGF0dHJzLCBib2R5LCBmcm9udE1hdHRlciB9ID0gZXh0cmFjdEpzb248eyB0aXRsZTogc3RyaW5nIH0+KFxuICogYC0tLWpzb25cbiAqIHtcInRpdGxlXCI6IFwiVGhyZWUgZGFzaGVzIGZvbGxvd2VkIGJ5IGZvcm1hdCBtYXJrcyB0aGUgc3BvdFwifVxuICogLS0tXG4gKiBnb2F0YCk7XG4gKiBhc3NlcnRFcXVhbHMoYXR0cnMudGl0bGUsIFwiVGhyZWUgZGFzaGVzIGZvbGxvd2VkIGJ5IGZvcm1hdCBtYXJrcyB0aGUgc3BvdFwiKTtcbiAqIGFzc2VydEVxdWFscyhib2R5LCBcImdvYXRcIik7XG4gKiBhc3NlcnRFcXVhbHMoZnJvbnRNYXR0ZXIsIGB7XCJ0aXRsZVwiOiBcIlRocmVlIGRhc2hlcyBmb2xsb3dlZCBieSBmb3JtYXQgbWFya3MgdGhlIHNwb3RcIn1gKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIEV4dHJhY3QgWUFNTCBvciBKU09OIGZyb250IG1hdHRlclxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNyZWF0ZUV4dHJhY3RvciwgUGFyc2VyIH0gZnJvbSBcIkBzdGQvZnJvbnQtbWF0dGVyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqIGltcG9ydCB7IHBhcnNlIGFzIHBhcnNlWWFtbCB9IGZyb20gXCJAc3RkL3lhbWwvcGFyc2VcIjtcbiAqXG4gKiBjb25zdCBleHRyYWN0WWFtbE9ySnNvbiA9IGNyZWF0ZUV4dHJhY3Rvcih7XG4gKiAgIHlhbWw6IHBhcnNlWWFtbCBhcyBQYXJzZXIsXG4gKiAgIGpzb246IEpTT04ucGFyc2UgYXMgUGFyc2VyLFxuICogfSk7XG4gKlxuICogbGV0IHsgYXR0cnMsIGJvZHksIGZyb250TWF0dGVyIH0gPSBleHRyYWN0WWFtbE9ySnNvbjx7IHRpdGxlOiBzdHJpbmcgfT4oXG4gKiBgLS0tXG4gKiB0aXRsZTogVGhyZWUgZGFzaGVzIG1hcmtzIHRoZSBzcG90XG4gKiAtLS1cbiAqIGZlcnJldGApO1xuICogYXNzZXJ0RXF1YWxzKGF0dHJzLnRpdGxlLCBcIlRocmVlIGRhc2hlcyBtYXJrcyB0aGUgc3BvdFwiKTtcbiAqIGFzc2VydEVxdWFscyhib2R5LCBcImZlcnJldFwiKTtcbiAqIGFzc2VydEVxdWFscyhmcm9udE1hdHRlciwgXCJ0aXRsZTogVGhyZWUgZGFzaGVzIG1hcmtzIHRoZSBzcG90XCIpO1xuICpcbiAqICh7IGF0dHJzLCBib2R5LCBmcm9udE1hdHRlciB9ID0gZXh0cmFjdFlhbWxPckpzb248eyB0aXRsZTogc3RyaW5nIH0+KFxuICogYC0tLWpzb25cbiAqIHtcInRpdGxlXCI6IFwiVGhyZWUgZGFzaGVzIGZvbGxvd2VkIGJ5IGZvcm1hdCBtYXJrcyB0aGUgc3BvdFwifVxuICogLS0tXG4gKiBnb2F0YCkpO1xuICogYXNzZXJ0RXF1YWxzKGF0dHJzLnRpdGxlLCBcIlRocmVlIGRhc2hlcyBmb2xsb3dlZCBieSBmb3JtYXQgbWFya3MgdGhlIHNwb3RcIik7XG4gKiBhc3NlcnRFcXVhbHMoYm9keSwgXCJnb2F0XCIpO1xuICogYXNzZXJ0RXF1YWxzKGZyb250TWF0dGVyLCBge1widGl0bGVcIjogXCJUaHJlZSBkYXNoZXMgZm9sbG93ZWQgYnkgZm9ybWF0IG1hcmtzIHRoZSBzcG90XCJ9YCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV4dHJhY3RvcihcbiAgZm9ybWF0czogUGFydGlhbDxSZWNvcmQ8Rm9ybWF0LCBQYXJzZXI+Pixcbik6IEV4dHJhY3RvciB7XG4gIGNvbnN0IGZvcm1hdEtleXMgPSBPYmplY3Qua2V5cyhmb3JtYXRzKSBhcyBGb3JtYXRbXTtcblxuICByZXR1cm4gZnVuY3Rpb24gZXh0cmFjdDxUPihzdHI6IHN0cmluZyk6IEV4dHJhY3Q8VD4ge1xuICAgIGNvbnN0IGZvcm1hdCA9IHJlY29nbml6ZShzdHIsIGZvcm1hdEtleXMpO1xuICAgIGNvbnN0IHBhcnNlciA9IGZvcm1hdHNbZm9ybWF0XTtcblxuICAgIGlmIChmb3JtYXQgPT09IFwidW5rbm93blwiIHx8ICFwYXJzZXIpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFVuc3VwcG9ydGVkIGZyb250IG1hdHRlciBmb3JtYXRgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gX2V4dHJhY3Qoc3RyLCBFWFRSQUNUX1JFR0VYUF9NQVBbZm9ybWF0XSwgcGFyc2VyKTtcbiAgfTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUUsU0FBUyxrQkFBa0IsRUFBRSxvQkFBb0IsUUFBUSxnQkFBZ0I7QUFrQnpFLFNBQVMsU0FDUCxHQUFXLEVBQ1gsRUFBVSxFQUNWLEtBQWE7RUFFYixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUM7RUFDdEIsSUFBSSxDQUFDLFNBQVMsTUFBTSxLQUFLLEtBQUssR0FBRztJQUMvQixNQUFNLElBQUksVUFBVTtFQUN0QjtFQUNBLE1BQU0sY0FBYyxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxjQUFjLE9BQU87RUFDL0QsTUFBTSxRQUFRLE1BQU07RUFDcEIsTUFBTSxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUU7RUFDbkMsT0FBTztJQUFFO0lBQWE7SUFBTTtFQUFNO0FBQ3BDO0FBRUE7Ozs7Ozs7Q0FPQyxHQUNELFNBQVMsVUFBVSxHQUFXLEVBQUUsT0FBa0I7RUFDaEQsSUFBSSxDQUFDLFNBQVM7SUFDWixVQUFVLE9BQU8sSUFBSSxDQUFDO0VBQ3hCO0VBRUEsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQztFQUU5QixLQUFLLE1BQU0sVUFBVSxRQUFTO0lBQzVCLElBQUksV0FBVyxXQUFXO01BQ3hCO0lBQ0Y7SUFFQSxJQUFJLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWTtNQUNoRCxPQUFPO0lBQ1Q7RUFDRjtFQUVBLE9BQU87QUFDVDtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBOEZDLEdBQ0QsT0FBTyxTQUFTLGdCQUNkLE9BQXdDO0VBRXhDLE1BQU0sYUFBYSxPQUFPLElBQUksQ0FBQztFQUUvQixPQUFPLFNBQVMsUUFBVyxHQUFXO0lBQ3BDLE1BQU0sU0FBUyxVQUFVLEtBQUs7SUFDOUIsTUFBTSxTQUFTLE9BQU8sQ0FBQyxPQUFPO0lBRTlCLElBQUksV0FBVyxhQUFhLENBQUMsUUFBUTtNQUNuQyxNQUFNLElBQUksVUFBVSxDQUFDLCtCQUErQixDQUFDO0lBQ3ZEO0lBRUEsT0FBTyxTQUFTLEtBQUssa0JBQWtCLENBQUMsT0FBTyxFQUFFO0VBQ25EO0FBQ0YifQ==
// denoCacheMetadata=5454319154434537494,2206672930198482813