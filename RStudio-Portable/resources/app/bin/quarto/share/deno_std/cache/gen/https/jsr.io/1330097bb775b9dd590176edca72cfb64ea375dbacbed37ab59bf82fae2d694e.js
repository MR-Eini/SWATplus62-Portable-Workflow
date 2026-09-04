// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Return type for {@linkcode invert}. */ /**
 * Composes a new record with all keys and values inverted.
 *
 * If the record contains duplicate values, subsequent values overwrite property
 * assignments of previous values. If the record contains values which aren't
 * {@linkcode PropertyKey}s their string representation is used as the key.
 *
 * @template T The type of the input record.
 *
 * @param record The record to invert.
 *
 * @returns A new record with all keys and values inverted.
 *
 * @example Basic usage
 * ```ts
 * import { invert } from "@std/collections/invert";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const record = { a: "x", b: "y", c: "z" };
 *
 * assertEquals(invert(record), { x: "a", y: "b", z: "c" });
 * ```
 */ export function invert(record) {
  return Object.fromEntries(Object.entries(record).map(([key, value])=>[
      value,
      key
    ]));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9pbnZlcnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqIFJldHVybiB0eXBlIGZvciB7QGxpbmtjb2RlIGludmVydH0uICovXG5leHBvcnQgdHlwZSBJbnZlcnRSZXN1bHQ8VCBleHRlbmRzIFJlY29yZDxQcm9wZXJ0eUtleSwgUHJvcGVydHlLZXk+PiA9IHtcbiAgW1AgaW4ga2V5b2YgVCBhcyBUW1BdXTogUDtcbn07XG5cbi8qKlxuICogQ29tcG9zZXMgYSBuZXcgcmVjb3JkIHdpdGggYWxsIGtleXMgYW5kIHZhbHVlcyBpbnZlcnRlZC5cbiAqXG4gKiBJZiB0aGUgcmVjb3JkIGNvbnRhaW5zIGR1cGxpY2F0ZSB2YWx1ZXMsIHN1YnNlcXVlbnQgdmFsdWVzIG92ZXJ3cml0ZSBwcm9wZXJ0eVxuICogYXNzaWdubWVudHMgb2YgcHJldmlvdXMgdmFsdWVzLiBJZiB0aGUgcmVjb3JkIGNvbnRhaW5zIHZhbHVlcyB3aGljaCBhcmVuJ3RcbiAqIHtAbGlua2NvZGUgUHJvcGVydHlLZXl9cyB0aGVpciBzdHJpbmcgcmVwcmVzZW50YXRpb24gaXMgdXNlZCBhcyB0aGUga2V5LlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0eXBlIG9mIHRoZSBpbnB1dCByZWNvcmQuXG4gKlxuICogQHBhcmFtIHJlY29yZCBUaGUgcmVjb3JkIHRvIGludmVydC5cbiAqXG4gKiBAcmV0dXJucyBBIG5ldyByZWNvcmQgd2l0aCBhbGwga2V5cyBhbmQgdmFsdWVzIGludmVydGVkLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgaW52ZXJ0IH0gZnJvbSBcIkBzdGQvY29sbGVjdGlvbnMvaW52ZXJ0XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHJlY29yZCA9IHsgYTogXCJ4XCIsIGI6IFwieVwiLCBjOiBcInpcIiB9O1xuICpcbiAqIGFzc2VydEVxdWFscyhpbnZlcnQocmVjb3JkKSwgeyB4OiBcImFcIiwgeTogXCJiXCIsIHo6IFwiY1wiIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQ8VCBleHRlbmRzIFJlY29yZDxQcm9wZXJ0eUtleSwgUHJvcGVydHlLZXk+PihcbiAgcmVjb3JkOiBSZWFkb25seTxUPixcbik6IEludmVydFJlc3VsdDxUPiB7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMocmVjb3JkKS5tYXAoKFtrZXksIHZhbHVlXSkgPT4gW3ZhbHVlLCBrZXldKSxcbiAgKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLHdDQUF3QyxHQUt4Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXNCQyxHQUNELE9BQU8sU0FBUyxPQUNkLE1BQW1CO0VBRW5CLE9BQU8sT0FBTyxXQUFXLENBQ3ZCLE9BQU8sT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sR0FBSztNQUFDO01BQU87S0FBSTtBQUU3RCJ9
// denoCacheMetadata=3202407535597600664,9637686224891610628