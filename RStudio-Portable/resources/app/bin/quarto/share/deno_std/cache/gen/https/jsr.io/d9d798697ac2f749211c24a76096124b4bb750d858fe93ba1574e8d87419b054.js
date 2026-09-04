// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * {@linkcode parse} and {@linkcode stringify} for handling
 * {@link https://yaml.org/ | YAML} encoded data.
 *
 * Ported from
 * {@link https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da | js-yaml v3.13.1}.
 *
 * If your YAML contains multiple documents in it, you can use {@linkcode parseAll} for
 * handling it.
 *
 * To handle `regexp`, and `undefined` types, use {@linkcode EXTENDED_SCHEMA}.
 * You can also use custom types by extending schemas.
 *
 * ## :warning: Limitations
 * - `binary` type is currently not stable.
 *
 * For further examples see https://github.com/nodeca/js-yaml/tree/master/examples.
 * @example
 * ```ts
 * import {
 *   parse,
 *   stringify,
 * } from "@std/yaml";
 *
 * const data = parse(`
 * foo: bar
 * baz:
 *   - qux
 *   - quux
 * `);
 * console.log(data);
 * // => { foo: "bar", baz: [ "qux", "quux" ] }
 *
 * const yaml = stringify({ foo: "bar", baz: ["qux", "quux"] });
 * console.log(yaml);
 * // =>
 * // foo: bar
 * // baz:
 * //   - qux
 * //   - quux
 * ```
 *
 * @module
 */ export * from "./parse.ts";
export * from "./stringify.ts";
export * from "./type.ts";
export * from "./schema/mod.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL21vZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiB7QGxpbmtjb2RlIHBhcnNlfSBhbmQge0BsaW5rY29kZSBzdHJpbmdpZnl9IGZvciBoYW5kbGluZ1xuICoge0BsaW5rIGh0dHBzOi8veWFtbC5vcmcvIHwgWUFNTH0gZW5jb2RlZCBkYXRhLlxuICpcbiAqIFBvcnRlZCBmcm9tXG4gKiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL25vZGVjYS9qcy15YW1sL2NvbW1pdC82NjVhYWRkYTQyMzQ5ZGNhZTg2OWYxMjA0MGQ5YjEwZWYxOGQxMmRhIHwganMteWFtbCB2My4xMy4xfS5cbiAqXG4gKiBJZiB5b3VyIFlBTUwgY29udGFpbnMgbXVsdGlwbGUgZG9jdW1lbnRzIGluIGl0LCB5b3UgY2FuIHVzZSB7QGxpbmtjb2RlIHBhcnNlQWxsfSBmb3JcbiAqIGhhbmRsaW5nIGl0LlxuICpcbiAqIFRvIGhhbmRsZSBgcmVnZXhwYCwgYW5kIGB1bmRlZmluZWRgIHR5cGVzLCB1c2Uge0BsaW5rY29kZSBFWFRFTkRFRF9TQ0hFTUF9LlxuICogWW91IGNhbiBhbHNvIHVzZSBjdXN0b20gdHlwZXMgYnkgZXh0ZW5kaW5nIHNjaGVtYXMuXG4gKlxuICogIyMgOndhcm5pbmc6IExpbWl0YXRpb25zXG4gKiAtIGBiaW5hcnlgIHR5cGUgaXMgY3VycmVudGx5IG5vdCBzdGFibGUuXG4gKlxuICogRm9yIGZ1cnRoZXIgZXhhbXBsZXMgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC90cmVlL21hc3Rlci9leGFtcGxlcy5cbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHtcbiAqICAgcGFyc2UsXG4gKiAgIHN0cmluZ2lmeSxcbiAqIH0gZnJvbSBcIkBzdGQveWFtbFwiO1xuICpcbiAqIGNvbnN0IGRhdGEgPSBwYXJzZShgXG4gKiBmb286IGJhclxuICogYmF6OlxuICogICAtIHF1eFxuICogICAtIHF1dXhcbiAqIGApO1xuICogY29uc29sZS5sb2coZGF0YSk7XG4gKiAvLyA9PiB7IGZvbzogXCJiYXJcIiwgYmF6OiBbIFwicXV4XCIsIFwicXV1eFwiIF0gfVxuICpcbiAqIGNvbnN0IHlhbWwgPSBzdHJpbmdpZnkoeyBmb286IFwiYmFyXCIsIGJhejogW1wicXV4XCIsIFwicXV1eFwiXSB9KTtcbiAqIGNvbnNvbGUubG9nKHlhbWwpO1xuICogLy8gPT5cbiAqIC8vIGZvbzogYmFyXG4gKiAvLyBiYXo6XG4gKiAvLyAgIC0gcXV4XG4gKiAvLyAgIC0gcXV1eFxuICogYGBgXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmV4cG9ydCAqIGZyb20gXCIuL3BhcnNlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9zdHJpbmdpZnkudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3R5cGUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3NjaGVtYS9tb2QudHNcIjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTJDQyxHQUVELGNBQWMsYUFBYTtBQUMzQixjQUFjLGlCQUFpQjtBQUMvQixjQUFjLFlBQVk7QUFDMUIsY0FBYyxrQkFBa0IifQ==
// denoCacheMetadata=1652436288069824604,10337564811036286688