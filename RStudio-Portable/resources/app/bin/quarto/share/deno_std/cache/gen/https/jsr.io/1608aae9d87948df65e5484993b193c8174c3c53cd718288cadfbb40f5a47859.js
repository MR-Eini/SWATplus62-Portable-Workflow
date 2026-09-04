// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Options for {@linkcode joinToString}. */ /**
 * Transforms the elements in the given array to strings using the given
 * selector. Joins the produced strings into one using the given `separator`
 * and applying the given `prefix` and `suffix` to the whole string afterwards.
 *
 * If the array could be huge, you can specify a non-negative value of `limit`,
 * in which case only the first `limit` elements will be appended, followed by
 * the `truncated` string.
 *
 * @template T The type of the elements in the input array.
 *
 * @param array The array to join elements from.
 * @param selector The function to transform elements to strings.
 * @param options The options to configure the joining.
 *
 * @returns The resulting string.
 *
 * @example Usage with options
 * ```ts
 * import { joinToString } from "@std/collections/join-to-string";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const users = [
 *   { name: "Kim" },
 *   { name: "Anna" },
 *   { name: "Tim" },
 * ];
 *
 * const message = joinToString(users, (user) => user.name, {
 *   suffix: " are winners",
 *   prefix: "result: ",
 *   separator: " and ",
 *   limit: 1,
 *   truncated: "others",
 * });
 *
 * assertEquals(message, "result: Kim and others are winners");
 * ```
 */ export function joinToString(array, selector, options = {}) {
  const { separator = ",", prefix = "", suffix = "", limit = -1, truncated = "..." } = options;
  let result = "";
  let index = 0;
  for (const el of array){
    if (index > 0) {
      result += separator;
    }
    if (limit >= 0 && index >= limit) {
      result += truncated;
      break;
    }
    result += selector(el);
    index++;
  }
  return prefix + result + suffix;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9qb2luX3RvX3N0cmluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBqb2luVG9TdHJpbmd9LiAqL1xuZXhwb3J0IHR5cGUgSm9pblRvU3RyaW5nT3B0aW9ucyA9IHtcbiAgLyoqXG4gICAqIFRoZSBzdHJpbmcgdG8gdXNlIGFzIGEgc2VwYXJhdG9yIGJldHdlZW4gdGhlIGVsZW1lbnRzLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7XCIsXCJ9XG4gICAqL1xuICBzZXBhcmF0b3I/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgc3RyaW5nIHRvIHVzZSBhcyBhIHByZWZpeCBmb3IgdGhlIHJlc3VsdGluZyBzdHJpbmcuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtcIlwifVxuICAgKi9cbiAgcHJlZml4Pzogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIHN0cmluZyB0byB1c2UgYXMgYSBzdWZmaXggZm9yIHRoZSByZXN1bHRpbmcgc3RyaW5nLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7XCJcIn1cbiAgICovXG4gIHN1ZmZpeD86IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBlbGVtZW50cyB0byBhcHBlbmQuIElmIHRoZSB2YWx1ZSBpcyBuZWdhdGl2ZSwgYWxsXG4gICAqIGVsZW1lbnRzIHdpbGwgYmUgYXBwZW5kZWQsIHdoaWNoIGlzIHRoZSBkZWZhdWx0LlxuICAgKlxuICAgKiBAZGVmYXVsdCB7LTF9XG4gICAqL1xuICBsaW1pdD86IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSBzdHJpbmcgdG8gdXNlIGFzIGEgcGxhY2Vob2xkZXIgZm9yIHRoZSB0cnVuY2F0ZWQgZWxlbWVudHMuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtcIi4uLlwifVxuICAgKi9cbiAgdHJ1bmNhdGVkPzogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSBlbGVtZW50cyBpbiB0aGUgZ2l2ZW4gYXJyYXkgdG8gc3RyaW5ncyB1c2luZyB0aGUgZ2l2ZW5cbiAqIHNlbGVjdG9yLiBKb2lucyB0aGUgcHJvZHVjZWQgc3RyaW5ncyBpbnRvIG9uZSB1c2luZyB0aGUgZ2l2ZW4gYHNlcGFyYXRvcmBcbiAqIGFuZCBhcHBseWluZyB0aGUgZ2l2ZW4gYHByZWZpeGAgYW5kIGBzdWZmaXhgIHRvIHRoZSB3aG9sZSBzdHJpbmcgYWZ0ZXJ3YXJkcy5cbiAqXG4gKiBJZiB0aGUgYXJyYXkgY291bGQgYmUgaHVnZSwgeW91IGNhbiBzcGVjaWZ5IGEgbm9uLW5lZ2F0aXZlIHZhbHVlIG9mIGBsaW1pdGAsXG4gKiBpbiB3aGljaCBjYXNlIG9ubHkgdGhlIGZpcnN0IGBsaW1pdGAgZWxlbWVudHMgd2lsbCBiZSBhcHBlbmRlZCwgZm9sbG93ZWQgYnlcbiAqIHRoZSBgdHJ1bmNhdGVkYCBzdHJpbmcuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBpbnB1dCBhcnJheS5cbiAqXG4gKiBAcGFyYW0gYXJyYXkgVGhlIGFycmF5IHRvIGpvaW4gZWxlbWVudHMgZnJvbS5cbiAqIEBwYXJhbSBzZWxlY3RvciBUaGUgZnVuY3Rpb24gdG8gdHJhbnNmb3JtIGVsZW1lbnRzIHRvIHN0cmluZ3MuXG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgb3B0aW9ucyB0byBjb25maWd1cmUgdGhlIGpvaW5pbmcuXG4gKlxuICogQHJldHVybnMgVGhlIHJlc3VsdGluZyBzdHJpbmcuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2Ugd2l0aCBvcHRpb25zXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgam9pblRvU3RyaW5nIH0gZnJvbSBcIkBzdGQvY29sbGVjdGlvbnMvam9pbi10by1zdHJpbmdcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgdXNlcnMgPSBbXG4gKiAgIHsgbmFtZTogXCJLaW1cIiB9LFxuICogICB7IG5hbWU6IFwiQW5uYVwiIH0sXG4gKiAgIHsgbmFtZTogXCJUaW1cIiB9LFxuICogXTtcbiAqXG4gKiBjb25zdCBtZXNzYWdlID0gam9pblRvU3RyaW5nKHVzZXJzLCAodXNlcikgPT4gdXNlci5uYW1lLCB7XG4gKiAgIHN1ZmZpeDogXCIgYXJlIHdpbm5lcnNcIixcbiAqICAgcHJlZml4OiBcInJlc3VsdDogXCIsXG4gKiAgIHNlcGFyYXRvcjogXCIgYW5kIFwiLFxuICogICBsaW1pdDogMSxcbiAqICAgdHJ1bmNhdGVkOiBcIm90aGVyc1wiLFxuICogfSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKG1lc3NhZ2UsIFwicmVzdWx0OiBLaW0gYW5kIG90aGVycyBhcmUgd2lubmVyc1wiKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gam9pblRvU3RyaW5nPFQ+KFxuICBhcnJheTogSXRlcmFibGU8VD4sXG4gIHNlbGVjdG9yOiAoZWw6IFQpID0+IHN0cmluZyxcbiAgb3B0aW9uczogUmVhZG9ubHk8Sm9pblRvU3RyaW5nT3B0aW9ucz4gPSB7fSxcbik6IHN0cmluZyB7XG4gIGNvbnN0IHtcbiAgICBzZXBhcmF0b3IgPSBcIixcIixcbiAgICBwcmVmaXggPSBcIlwiLFxuICAgIHN1ZmZpeCA9IFwiXCIsXG4gICAgbGltaXQgPSAtMSxcbiAgICB0cnVuY2F0ZWQgPSBcIi4uLlwiLFxuICB9ID0gb3B0aW9ucztcblxuICBsZXQgcmVzdWx0ID0gXCJcIjtcblxuICBsZXQgaW5kZXggPSAwO1xuICBmb3IgKGNvbnN0IGVsIG9mIGFycmF5KSB7XG4gICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgcmVzdWx0ICs9IHNlcGFyYXRvcjtcbiAgICB9XG5cbiAgICBpZiAobGltaXQgPj0gMCAmJiBpbmRleCA+PSBsaW1pdCkge1xuICAgICAgcmVzdWx0ICs9IHRydW5jYXRlZDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJlc3VsdCArPSBzZWxlY3RvcihlbCk7XG4gICAgaW5kZXgrKztcbiAgfVxuXG4gIHJldHVybiBwcmVmaXggKyByZXN1bHQgKyBzdWZmaXg7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQywwQ0FBMEMsR0FtQzFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXNDQyxHQUNELE9BQU8sU0FBUyxhQUNkLEtBQWtCLEVBQ2xCLFFBQTJCLEVBQzNCLFVBQXlDLENBQUMsQ0FBQztFQUUzQyxNQUFNLEVBQ0osWUFBWSxHQUFHLEVBQ2YsU0FBUyxFQUFFLEVBQ1gsU0FBUyxFQUFFLEVBQ1gsUUFBUSxDQUFDLENBQUMsRUFDVixZQUFZLEtBQUssRUFDbEIsR0FBRztFQUVKLElBQUksU0FBUztFQUViLElBQUksUUFBUTtFQUNaLEtBQUssTUFBTSxNQUFNLE1BQU87SUFDdEIsSUFBSSxRQUFRLEdBQUc7TUFDYixVQUFVO0lBQ1o7SUFFQSxJQUFJLFNBQVMsS0FBSyxTQUFTLE9BQU87TUFDaEMsVUFBVTtNQUNWO0lBQ0Y7SUFFQSxVQUFVLFNBQVM7SUFDbkI7RUFDRjtFQUVBLE9BQU8sU0FBUyxTQUFTO0FBQzNCIn0=
// denoCacheMetadata=14201936401403827224,14181153109214326823