// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// Copyright (c) Jason Campbell. MIT license
/**
 * Extracts
 * {@link https://daily-dev-tips.com/posts/what-exactly-is-frontmatter/ | front matter}
 * from strings. Adapted from
 * {@link https://github.com/jxson/front-matter/blob/36f139ef797bd9e5196a9ede03ef481d7fbca18e/index.js | jxson/front-matter}.
 *
 * ## Supported formats
 *
 * ### JSON
 *
 * ```ts
 * import { test, extractJson } from "@std/front-matter";
 * import { assertEquals } from "@std/assert";
 *
 * const str = "---json\n{\"and\": \"this\"}\n---\ndeno is awesome";
 *
 * assertEquals(test(str), true);
 * assertEquals(extractJson(str), {
 *   frontMatter: "{\"and\": \"this\"}",
 *   body: "deno is awesome",
 *   attrs: { and: "this" }
 * });
 * ```
 *
 * {@linkcode extractJson | extract} and {@linkcode test} support the following
 * delimiters.
 *
 * ```markdown
 * ---json
 * {
 *   "and": "this"
 * }
 * ---
 * ```
 *
 * ```markdown
 * {
 *   "is": "JSON"
 * }
 * ```
 *
 * ### TOML
 *
 * ```ts
 * import { test, extractToml } from "@std/front-matter";
 * import { assertEquals } from "@std/assert";
 *
 * const str = "---toml\nmodule = 'front_matter'\n---\ndeno is awesome";
 *
 * assertEquals(test(str), true);
 * assertEquals(extractToml(str), {
 *   frontMatter: "module = 'front_matter'",
 *   body: "deno is awesome",
 *   attrs: { module: "front_matter" }
 * });
 * ```
 *
 * {@linkcode extractToml | extract} and {@linkcode test} support the following
 * delimiters.
 *
 * ```markdown
 * ---toml
 * this = 'is'
 * ---
 * ```
 *
 * ```markdown
 * = toml =
 * parsed = 'as'
 * toml = 'data'
 * = toml =
 * ```
 *
 * ```markdown
 * +++
 * is = 'that'
 * not = 'cool?'
 * +++
 * ```
 *
 * ### YAML
 *
 * ```ts
 * import { test, extractYaml } from "@std/front-matter";
 * import { assertEquals } from "@std/assert";
 *
 * const str = "---yaml\nmodule: front_matter\n---\ndeno is awesome";
 *
 * assertEquals(test(str), true);
 * assertEquals(extractYaml(str), {
 *   frontMatter: "module: front_matter",
 *   body: "deno is awesome",
 *   attrs: { module: "front_matter" }
 * });
 * ```
 *
 * {@linkcode extractYaml | extract} and {@linkcode test} support the following
 * delimiters.
 *
 * ```front_matter
 * ---
 * these: are
 * ---
 * ```
 *
 * ```markdown
 * ---yaml
 * all: recognized
 * ---
 * ```
 *
 * ```markdown
 * = yaml =
 * as: yaml
 * = yaml =
 * ```
 *
 * @module
 */ import { extract as extractJson } from "./json.ts";
import { extract as extractToml } from "./toml.ts";
import { extract as extractYaml } from "./yaml.ts";
export * from "./create_extractor.ts";
export * from "./test.ts";
export { extractJson, extractToml, extractYaml };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnJvbnQtbWF0dGVyLzAuMjI0LjMvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgKGMpIEphc29uIENhbXBiZWxsLiBNSVQgbGljZW5zZVxuXG4vKipcbiAqIEV4dHJhY3RzXG4gKiB7QGxpbmsgaHR0cHM6Ly9kYWlseS1kZXYtdGlwcy5jb20vcG9zdHMvd2hhdC1leGFjdGx5LWlzLWZyb250bWF0dGVyLyB8IGZyb250IG1hdHRlcn1cbiAqIGZyb20gc3RyaW5ncy4gQWRhcHRlZCBmcm9tXG4gKiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2p4c29uL2Zyb250LW1hdHRlci9ibG9iLzM2ZjEzOWVmNzk3YmQ5ZTUxOTZhOWVkZTAzZWY0ODFkN2ZiY2ExOGUvaW5kZXguanMgfCBqeHNvbi9mcm9udC1tYXR0ZXJ9LlxuICpcbiAqICMjIFN1cHBvcnRlZCBmb3JtYXRzXG4gKlxuICogIyMjIEpTT05cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgdGVzdCwgZXh0cmFjdEpzb24gfSBmcm9tIFwiQHN0ZC9mcm9udC1tYXR0ZXJcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHN0ciA9IFwiLS0tanNvblxcbntcXFwiYW5kXFxcIjogXFxcInRoaXNcXFwifVxcbi0tLVxcbmRlbm8gaXMgYXdlc29tZVwiO1xuICpcbiAqIGFzc2VydEVxdWFscyh0ZXN0KHN0ciksIHRydWUpO1xuICogYXNzZXJ0RXF1YWxzKGV4dHJhY3RKc29uKHN0ciksIHtcbiAqICAgZnJvbnRNYXR0ZXI6IFwie1xcXCJhbmRcXFwiOiBcXFwidGhpc1xcXCJ9XCIsXG4gKiAgIGJvZHk6IFwiZGVubyBpcyBhd2Vzb21lXCIsXG4gKiAgIGF0dHJzOiB7IGFuZDogXCJ0aGlzXCIgfVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiB7QGxpbmtjb2RlIGV4dHJhY3RKc29uIHwgZXh0cmFjdH0gYW5kIHtAbGlua2NvZGUgdGVzdH0gc3VwcG9ydCB0aGUgZm9sbG93aW5nXG4gKiBkZWxpbWl0ZXJzLlxuICpcbiAqIGBgYG1hcmtkb3duXG4gKiAtLS1qc29uXG4gKiB7XG4gKiAgIFwiYW5kXCI6IFwidGhpc1wiXG4gKiB9XG4gKiAtLS1cbiAqIGBgYFxuICpcbiAqIGBgYG1hcmtkb3duXG4gKiB7XG4gKiAgIFwiaXNcIjogXCJKU09OXCJcbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBUT01MXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHRlc3QsIGV4dHJhY3RUb21sIH0gZnJvbSBcIkBzdGQvZnJvbnQtbWF0dGVyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCBzdHIgPSBcIi0tLXRvbWxcXG5tb2R1bGUgPSAnZnJvbnRfbWF0dGVyJ1xcbi0tLVxcbmRlbm8gaXMgYXdlc29tZVwiO1xuICpcbiAqIGFzc2VydEVxdWFscyh0ZXN0KHN0ciksIHRydWUpO1xuICogYXNzZXJ0RXF1YWxzKGV4dHJhY3RUb21sKHN0ciksIHtcbiAqICAgZnJvbnRNYXR0ZXI6IFwibW9kdWxlID0gJ2Zyb250X21hdHRlcidcIixcbiAqICAgYm9keTogXCJkZW5vIGlzIGF3ZXNvbWVcIixcbiAqICAgYXR0cnM6IHsgbW9kdWxlOiBcImZyb250X21hdHRlclwiIH1cbiAqIH0pO1xuICogYGBgXG4gKlxuICoge0BsaW5rY29kZSBleHRyYWN0VG9tbCB8IGV4dHJhY3R9IGFuZCB7QGxpbmtjb2RlIHRlc3R9IHN1cHBvcnQgdGhlIGZvbGxvd2luZ1xuICogZGVsaW1pdGVycy5cbiAqXG4gKiBgYGBtYXJrZG93blxuICogLS0tdG9tbFxuICogdGhpcyA9ICdpcydcbiAqIC0tLVxuICogYGBgXG4gKlxuICogYGBgbWFya2Rvd25cbiAqID0gdG9tbCA9XG4gKiBwYXJzZWQgPSAnYXMnXG4gKiB0b21sID0gJ2RhdGEnXG4gKiA9IHRvbWwgPVxuICogYGBgXG4gKlxuICogYGBgbWFya2Rvd25cbiAqICsrK1xuICogaXMgPSAndGhhdCdcbiAqIG5vdCA9ICdjb29sPydcbiAqICsrK1xuICogYGBgXG4gKlxuICogIyMjIFlBTUxcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgdGVzdCwgZXh0cmFjdFlhbWwgfSBmcm9tIFwiQHN0ZC9mcm9udC1tYXR0ZXJcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHN0ciA9IFwiLS0teWFtbFxcbm1vZHVsZTogZnJvbnRfbWF0dGVyXFxuLS0tXFxuZGVubyBpcyBhd2Vzb21lXCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKHRlc3Qoc3RyKSwgdHJ1ZSk7XG4gKiBhc3NlcnRFcXVhbHMoZXh0cmFjdFlhbWwoc3RyKSwge1xuICogICBmcm9udE1hdHRlcjogXCJtb2R1bGU6IGZyb250X21hdHRlclwiLFxuICogICBib2R5OiBcImRlbm8gaXMgYXdlc29tZVwiLFxuICogICBhdHRyczogeyBtb2R1bGU6IFwiZnJvbnRfbWF0dGVyXCIgfVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiB7QGxpbmtjb2RlIGV4dHJhY3RZYW1sIHwgZXh0cmFjdH0gYW5kIHtAbGlua2NvZGUgdGVzdH0gc3VwcG9ydCB0aGUgZm9sbG93aW5nXG4gKiBkZWxpbWl0ZXJzLlxuICpcbiAqIGBgYGZyb250X21hdHRlclxuICogLS0tXG4gKiB0aGVzZTogYXJlXG4gKiAtLS1cbiAqIGBgYFxuICpcbiAqIGBgYG1hcmtkb3duXG4gKiAtLS15YW1sXG4gKiBhbGw6IHJlY29nbml6ZWRcbiAqIC0tLVxuICogYGBgXG4gKlxuICogYGBgbWFya2Rvd25cbiAqID0geWFtbCA9XG4gKiBhczogeWFtbFxuICogPSB5YW1sID1cbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHsgZXh0cmFjdCBhcyBleHRyYWN0SnNvbiB9IGZyb20gXCIuL2pzb24udHNcIjtcbmltcG9ydCB7IGV4dHJhY3QgYXMgZXh0cmFjdFRvbWwgfSBmcm9tIFwiLi90b21sLnRzXCI7XG5pbXBvcnQgeyBleHRyYWN0IGFzIGV4dHJhY3RZYW1sIH0gZnJvbSBcIi4veWFtbC50c1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi9jcmVhdGVfZXh0cmFjdG9yLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi90ZXN0LnRzXCI7XG5cbmV4cG9ydCB7IGV4dHJhY3RKc29uLCBleHRyYWN0VG9tbCwgZXh0cmFjdFlhbWwgfTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsNENBQTRDO0FBRTVDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0hDLEdBQ0QsU0FBUyxXQUFXLFdBQVcsUUFBUSxZQUFZO0FBQ25ELFNBQVMsV0FBVyxXQUFXLFFBQVEsWUFBWTtBQUNuRCxTQUFTLFdBQVcsV0FBVyxRQUFRLFlBQVk7QUFFbkQsY0FBYyx3QkFBd0I7QUFDdEMsY0FBYyxZQUFZO0FBRTFCLFNBQVMsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEdBQUcifQ==
// denoCacheMetadata=17879734551244354642,11787245099398043959