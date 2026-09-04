// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Reads and writes comma-separated values (CSV) files.
 *
 * There are many kinds of CSV files; this module supports the format described
 * in {@link https://www.rfc-editor.org/rfc/rfc4180.html | RFC 4180}.
 *
 * A csv file contains zero or more records of one or more fields per record.
 * Each record is separated by the newline character. The final record may
 * optionally be followed by a newline character.
 *
 * ```csv
 * field1,field2,field3
 * ```
 *
 * White space is considered part of a field.
 *
 * Carriage returns before newline characters are silently removed.
 *
 * Blank lines are ignored. A line with only whitespace characters (excluding
 * the ending newline character) is not considered a blank line.
 *
 * Fields which start and stop with the quote character " are called
 * quoted-fields. The beginning and ending quote are not part of the field.
 *
 * The source:
 *
 * ```csv
 * normal string,"quoted-field"
 * ```
 *
 * results in the fields
 *
 * ```ts no-assert
 * [`normal string`, `quoted-field`]
 * ```
 *
 * Within a quoted-field a quote character followed by a second quote character is considered a single quote.
 *
 * ```csv
 * "the ""word"" is true","a ""quoted-field"""
 * ```
 *
 * results in
 *
 * [`the "word" is true`, `a "quoted-field"`]
 *
 * Newlines and commas may be included in a quoted-field
 *
 * ```csv
 * "Multi-line
 * field","comma is ,"
 * ```
 *
 * results in
 *
 * ```ts no-assert
 * [`Multi-line
 * field`, `comma is ,`]
 * ```
 *
 * @module
 */ export * from "./stringify.ts";
export * from "./parse.ts";
export * from "./csv_parse_stream.ts";
export * from "./csv_stringify_stream.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY3N2LzAuMjI0LjMvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKiBSZWFkcyBhbmQgd3JpdGVzIGNvbW1hLXNlcGFyYXRlZCB2YWx1ZXMgKENTVikgZmlsZXMuXG4gKlxuICogVGhlcmUgYXJlIG1hbnkga2luZHMgb2YgQ1NWIGZpbGVzOyB0aGlzIG1vZHVsZSBzdXBwb3J0cyB0aGUgZm9ybWF0IGRlc2NyaWJlZFxuICogaW4ge0BsaW5rIGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM0MTgwLmh0bWwgfCBSRkMgNDE4MH0uXG4gKlxuICogQSBjc3YgZmlsZSBjb250YWlucyB6ZXJvIG9yIG1vcmUgcmVjb3JkcyBvZiBvbmUgb3IgbW9yZSBmaWVsZHMgcGVyIHJlY29yZC5cbiAqIEVhY2ggcmVjb3JkIGlzIHNlcGFyYXRlZCBieSB0aGUgbmV3bGluZSBjaGFyYWN0ZXIuIFRoZSBmaW5hbCByZWNvcmQgbWF5XG4gKiBvcHRpb25hbGx5IGJlIGZvbGxvd2VkIGJ5IGEgbmV3bGluZSBjaGFyYWN0ZXIuXG4gKlxuICogYGBgY3N2XG4gKiBmaWVsZDEsZmllbGQyLGZpZWxkM1xuICogYGBgXG4gKlxuICogV2hpdGUgc3BhY2UgaXMgY29uc2lkZXJlZCBwYXJ0IG9mIGEgZmllbGQuXG4gKlxuICogQ2FycmlhZ2UgcmV0dXJucyBiZWZvcmUgbmV3bGluZSBjaGFyYWN0ZXJzIGFyZSBzaWxlbnRseSByZW1vdmVkLlxuICpcbiAqIEJsYW5rIGxpbmVzIGFyZSBpZ25vcmVkLiBBIGxpbmUgd2l0aCBvbmx5IHdoaXRlc3BhY2UgY2hhcmFjdGVycyAoZXhjbHVkaW5nXG4gKiB0aGUgZW5kaW5nIG5ld2xpbmUgY2hhcmFjdGVyKSBpcyBub3QgY29uc2lkZXJlZCBhIGJsYW5rIGxpbmUuXG4gKlxuICogRmllbGRzIHdoaWNoIHN0YXJ0IGFuZCBzdG9wIHdpdGggdGhlIHF1b3RlIGNoYXJhY3RlciBcIiBhcmUgY2FsbGVkXG4gKiBxdW90ZWQtZmllbGRzLiBUaGUgYmVnaW5uaW5nIGFuZCBlbmRpbmcgcXVvdGUgYXJlIG5vdCBwYXJ0IG9mIHRoZSBmaWVsZC5cbiAqXG4gKiBUaGUgc291cmNlOlxuICpcbiAqIGBgYGNzdlxuICogbm9ybWFsIHN0cmluZyxcInF1b3RlZC1maWVsZFwiXG4gKiBgYGBcbiAqXG4gKiByZXN1bHRzIGluIHRoZSBmaWVsZHNcbiAqXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIFtgbm9ybWFsIHN0cmluZ2AsIGBxdW90ZWQtZmllbGRgXVxuICogYGBgXG4gKlxuICogV2l0aGluIGEgcXVvdGVkLWZpZWxkIGEgcXVvdGUgY2hhcmFjdGVyIGZvbGxvd2VkIGJ5IGEgc2Vjb25kIHF1b3RlIGNoYXJhY3RlciBpcyBjb25zaWRlcmVkIGEgc2luZ2xlIHF1b3RlLlxuICpcbiAqIGBgYGNzdlxuICogXCJ0aGUgXCJcIndvcmRcIlwiIGlzIHRydWVcIixcImEgXCJcInF1b3RlZC1maWVsZFwiXCJcIlxuICogYGBgXG4gKlxuICogcmVzdWx0cyBpblxuICpcbiAqIFtgdGhlIFwid29yZFwiIGlzIHRydWVgLCBgYSBcInF1b3RlZC1maWVsZFwiYF1cbiAqXG4gKiBOZXdsaW5lcyBhbmQgY29tbWFzIG1heSBiZSBpbmNsdWRlZCBpbiBhIHF1b3RlZC1maWVsZFxuICpcbiAqIGBgYGNzdlxuICogXCJNdWx0aS1saW5lXG4gKiBmaWVsZFwiLFwiY29tbWEgaXMgLFwiXG4gKiBgYGBcbiAqXG4gKiByZXN1bHRzIGluXG4gKlxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBbYE11bHRpLWxpbmVcbiAqIGZpZWxkYCwgYGNvbW1hIGlzICxgXVxuICogYGBgXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmV4cG9ydCAqIGZyb20gXCIuL3N0cmluZ2lmeS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcGFyc2UudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2Nzdl9wYXJzZV9zdHJlYW0udHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2Nzdl9zdHJpbmdpZnlfc3RyZWFtLnRzXCI7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNERDLEdBRUQsY0FBYyxpQkFBaUI7QUFDL0IsY0FBYyxhQUFhO0FBQzNCLGNBQWMsd0JBQXdCO0FBQ3RDLGNBQWMsNEJBQTRCIn0=
// denoCacheMetadata=12286923879007721389,11825627747007403576