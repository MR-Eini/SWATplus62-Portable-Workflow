// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { createExtractor } from "./create_extractor.ts";
import { parse } from "jsr:/@std/toml@^1.0.0-rc.3/parse";
/**
 * Extracts and parses {@link https://toml.io | TOML} from the metadata of
 * front matter content.
 *
 * @example Extract TOML front matter
 * ```ts
 * import { extract } from "@std/front-matter/toml";
 * import { assertEquals } from "@std/assert";
 *
 * const output = `---toml
 * title = "Three dashes marks the spot"
 * ---
 * Hello, world!`;
 * const result = extract(output);
 *
 * assertEquals(result, {
 *   frontMatter: 'title = "Three dashes marks the spot"',
 *   body: "Hello, world!",
 *   attrs: { title: "Three dashes marks the spot" },
 * });
 * ```
 */ export const extract = createExtractor({
  ["toml"]: parse
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnJvbnQtbWF0dGVyLzAuMjI0LjMvdG9tbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQge1xuICBjcmVhdGVFeHRyYWN0b3IsXG4gIHR5cGUgRXh0cmFjdG9yLFxuICB0eXBlIFBhcnNlcixcbn0gZnJvbSBcIi4vY3JlYXRlX2V4dHJhY3Rvci50c1wiO1xuaW1wb3J0IHsgcGFyc2UgfSBmcm9tIFwianNyOi9Ac3RkL3RvbWxAXjEuMC4wLXJjLjMvcGFyc2VcIjtcblxuLyoqXG4gKiBFeHRyYWN0cyBhbmQgcGFyc2VzIHtAbGluayBodHRwczovL3RvbWwuaW8gfCBUT01MfSBmcm9tIHRoZSBtZXRhZGF0YSBvZlxuICogZnJvbnQgbWF0dGVyIGNvbnRlbnQuXG4gKlxuICogQGV4YW1wbGUgRXh0cmFjdCBUT01MIGZyb250IG1hdHRlclxuICogYGBgdHNcbiAqIGltcG9ydCB7IGV4dHJhY3QgfSBmcm9tIFwiQHN0ZC9mcm9udC1tYXR0ZXIvdG9tbFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3Qgb3V0cHV0ID0gYC0tLXRvbWxcbiAqIHRpdGxlID0gXCJUaHJlZSBkYXNoZXMgbWFya3MgdGhlIHNwb3RcIlxuICogLS0tXG4gKiBIZWxsbywgd29ybGQhYDtcbiAqIGNvbnN0IHJlc3VsdCA9IGV4dHJhY3Qob3V0cHV0KTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMocmVzdWx0LCB7XG4gKiAgIGZyb250TWF0dGVyOiAndGl0bGUgPSBcIlRocmVlIGRhc2hlcyBtYXJrcyB0aGUgc3BvdFwiJyxcbiAqICAgYm9keTogXCJIZWxsbywgd29ybGQhXCIsXG4gKiAgIGF0dHJzOiB7IHRpdGxlOiBcIlRocmVlIGRhc2hlcyBtYXJrcyB0aGUgc3BvdFwiIH0sXG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgZXh0cmFjdDogRXh0cmFjdG9yID0gY3JlYXRlRXh0cmFjdG9yKHtcbiAgW1widG9tbFwiXTogcGFyc2UgYXMgUGFyc2VyLFxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLFNBQ0UsZUFBZSxRQUdWLHdCQUF3QjtBQUMvQixTQUFTLEtBQUssUUFBUSxtQ0FBbUM7QUFFekQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCQyxHQUNELE9BQU8sTUFBTSxVQUFxQixnQkFBZ0I7RUFDaEQsQ0FBQyxPQUFPLEVBQUU7QUFDWixHQUFHIn0=
// denoCacheMetadata=17102487905548068370,7657404537601046505