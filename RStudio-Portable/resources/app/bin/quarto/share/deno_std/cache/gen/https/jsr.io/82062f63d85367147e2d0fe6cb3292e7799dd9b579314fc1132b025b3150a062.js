// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { Schema } from "../schema.ts";
import { regexp, undefinedType } from "../_type/mod.ts";
import { DEFAULT_SCHEMA } from "./default.ts";
/***
 * Extends JS-YAML default schema with additional JavaScript types
 * It is not described in the YAML specification.
 * Functions are no longer supported for security reasons.
 *
 * @example
 * ```ts
 * import {
 *   EXTENDED_SCHEMA,
 *   parse,
 * } from "@std/yaml";
 *
 * const data = parse(
 *   `
 *   regexp:
 *     simple: !!js/regexp foobar
 *     modifiers: !!js/regexp /foobar/mi
 *   undefined: !!js/undefined ~
 * # Disabled, see: https://github.com/denoland/deno_std/pull/1275
 * #  function: !!js/function >
 * #    function foobar() {
 * #      return 'hello world!';
 * #    }
 * `,
 *   { schema: EXTENDED_SCHEMA },
 * );
 * ```
 */ export const EXTENDED_SCHEMA = new Schema({
  explicit: [
    regexp,
    undefinedType
  ],
  include: [
    DEFAULT_SCHEMA
  ]
});
/***
 * Extends JS-YAML default schema with additional JavaScript types
 * It is not described in the YAML specification.
 * Functions are no longer supported for security reasons.
 *
 * @example
 * ```ts
 * import {
 *   EXTENDED_SCHEMA,
 *   parse,
 * } from "@std/yaml";
 *
 * const data = parse(
 *   `
 *   regexp:
 *     simple: !!js/regexp foobar
 *     modifiers: !!js/regexp /foobar/mi
 *   undefined: !!js/undefined ~
 * # Disabled, see: https://github.com/denoland/deno_std/pull/1275
 * #  function: !!js/function >
 * #    function foobar() {
 * #      return 'hello world!';
 * #    }
 * `,
 *   { schema: EXTENDED_SCHEMA },
 * );
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use {@link EXTENDED_SCHEMA} instead.
 */ export const extended = EXTENDED_SCHEMA;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL3NjaGVtYS9leHRlbmRlZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBTY2hlbWEgfSBmcm9tIFwiLi4vc2NoZW1hLnRzXCI7XG5pbXBvcnQgeyByZWdleHAsIHVuZGVmaW5lZFR5cGUgfSBmcm9tIFwiLi4vX3R5cGUvbW9kLnRzXCI7XG5pbXBvcnQgeyBERUZBVUxUX1NDSEVNQSB9IGZyb20gXCIuL2RlZmF1bHQudHNcIjtcblxuLyoqKlxuICogRXh0ZW5kcyBKUy1ZQU1MIGRlZmF1bHQgc2NoZW1hIHdpdGggYWRkaXRpb25hbCBKYXZhU2NyaXB0IHR5cGVzXG4gKiBJdCBpcyBub3QgZGVzY3JpYmVkIGluIHRoZSBZQU1MIHNwZWNpZmljYXRpb24uXG4gKiBGdW5jdGlvbnMgYXJlIG5vIGxvbmdlciBzdXBwb3J0ZWQgZm9yIHNlY3VyaXR5IHJlYXNvbnMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQge1xuICogICBFWFRFTkRFRF9TQ0hFTUEsXG4gKiAgIHBhcnNlLFxuICogfSBmcm9tIFwiQHN0ZC95YW1sXCI7XG4gKlxuICogY29uc3QgZGF0YSA9IHBhcnNlKFxuICogICBgXG4gKiAgIHJlZ2V4cDpcbiAqICAgICBzaW1wbGU6ICEhanMvcmVnZXhwIGZvb2JhclxuICogICAgIG1vZGlmaWVyczogISFqcy9yZWdleHAgL2Zvb2Jhci9taVxuICogICB1bmRlZmluZWQ6ICEhanMvdW5kZWZpbmVkIH5cbiAqICMgRGlzYWJsZWQsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2Rlbm9fc3RkL3B1bGwvMTI3NVxuICogIyAgZnVuY3Rpb246ICEhanMvZnVuY3Rpb24gPlxuICogIyAgICBmdW5jdGlvbiBmb29iYXIoKSB7XG4gKiAjICAgICAgcmV0dXJuICdoZWxsbyB3b3JsZCEnO1xuICogIyAgICB9XG4gKiBgLFxuICogICB7IHNjaGVtYTogRVhURU5ERURfU0NIRU1BIH0sXG4gKiApO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBFWFRFTkRFRF9TQ0hFTUE6IFNjaGVtYSA9IG5ldyBTY2hlbWEoe1xuICBleHBsaWNpdDogW3JlZ2V4cCwgdW5kZWZpbmVkVHlwZV0sXG4gIGluY2x1ZGU6IFtERUZBVUxUX1NDSEVNQV0sXG59KTtcblxuLyoqKlxuICogRXh0ZW5kcyBKUy1ZQU1MIGRlZmF1bHQgc2NoZW1hIHdpdGggYWRkaXRpb25hbCBKYXZhU2NyaXB0IHR5cGVzXG4gKiBJdCBpcyBub3QgZGVzY3JpYmVkIGluIHRoZSBZQU1MIHNwZWNpZmljYXRpb24uXG4gKiBGdW5jdGlvbnMgYXJlIG5vIGxvbmdlciBzdXBwb3J0ZWQgZm9yIHNlY3VyaXR5IHJlYXNvbnMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQge1xuICogICBFWFRFTkRFRF9TQ0hFTUEsXG4gKiAgIHBhcnNlLFxuICogfSBmcm9tIFwiQHN0ZC95YW1sXCI7XG4gKlxuICogY29uc3QgZGF0YSA9IHBhcnNlKFxuICogICBgXG4gKiAgIHJlZ2V4cDpcbiAqICAgICBzaW1wbGU6ICEhanMvcmVnZXhwIGZvb2JhclxuICogICAgIG1vZGlmaWVyczogISFqcy9yZWdleHAgL2Zvb2Jhci9taVxuICogICB1bmRlZmluZWQ6ICEhanMvdW5kZWZpbmVkIH5cbiAqICMgRGlzYWJsZWQsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2Rlbm9fc3RkL3B1bGwvMTI3NVxuICogIyAgZnVuY3Rpb246ICEhanMvZnVuY3Rpb24gPlxuICogIyAgICBmdW5jdGlvbiBmb29iYXIoKSB7XG4gKiAjICAgICAgcmV0dXJuICdoZWxsbyB3b3JsZCEnO1xuICogIyAgICB9XG4gKiBgLFxuICogICB7IHNjaGVtYTogRVhURU5ERURfU0NIRU1BIH0sXG4gKiApO1xuICogYGBgXG4gKlxuICogQGRlcHJlY2F0ZWQgVGhpcyB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAuIFVzZSB7QGxpbmsgRVhURU5ERURfU0NIRU1BfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgZXh0ZW5kZWQgPSBFWFRFTkRFRF9TQ0hFTUE7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLE1BQU0sUUFBUSxlQUFlO0FBQ3RDLFNBQVMsTUFBTSxFQUFFLGFBQWEsUUFBUSxrQkFBa0I7QUFDeEQsU0FBUyxjQUFjLFFBQVEsZUFBZTtBQUU5Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMkJDLEdBQ0QsT0FBTyxNQUFNLGtCQUEwQixJQUFJLE9BQU87RUFDaEQsVUFBVTtJQUFDO0lBQVE7R0FBYztFQUNqQyxTQUFTO0lBQUM7R0FBZTtBQUMzQixHQUFHO0FBRUg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNkJDLEdBQ0QsT0FBTyxNQUFNLFdBQVcsZ0JBQWdCIn0=
// denoCacheMetadata=5280905678120168851,8917527178260405755