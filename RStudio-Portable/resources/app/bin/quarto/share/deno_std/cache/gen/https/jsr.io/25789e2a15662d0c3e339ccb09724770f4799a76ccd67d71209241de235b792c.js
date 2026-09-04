// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isEOL } from "./_chars.ts";
import { LoaderState } from "./_loader_state.ts";
import { SCHEMA_MAP } from "./_schema.ts";
function sanitizeInput(input) {
  input = String(input);
  if (input.length > 0) {
    // Add trailing `\n` if not exists
    if (!isEOL(input.charCodeAt(input.length - 1))) input += "\n";
    // Strip BOM
    if (input.charCodeAt(0) === 0xfeff) input = input.slice(1);
  }
  // Use 0 as string terminator. That significantly simplifies bounds check.
  input += "\0";
  return input;
}
/**
 * Parse and return a YAML string as a parsed YAML document object.
 *
 * Note: This does not support functions. Untrusted data is safe to parse.
 *
 * @example Usage
 * ```ts
 * import { parse } from "@std/yaml/parse";
 * import { assertEquals } from "@std/assert";
 *
 * const data = parse(`
 * id: 1
 * name: Alice
 * `);
 *
 * assertEquals(data, { id: 1, name: "Alice" });
 * ```
 *
 * @throws {SyntaxError} Throws error on invalid YAML.
 * @param content YAML string to parse.
 * @param options Parsing options.
 * @returns Parsed document.
 */ export function parse(content, options = {}) {
  content = sanitizeInput(content);
  const state = new LoaderState(content, {
    ...options,
    schema: SCHEMA_MAP.get(options.schema)
  });
  const documentGenerator = state.readDocuments();
  const document = documentGenerator.next().value;
  if (!documentGenerator.next().done) {
    throw new SyntaxError("Found more than 1 document in the stream: expected a single document");
  }
  return document ?? null;
}
/**
 * Same as {@linkcode parse}, but understands multi-document YAML sources, and
 * returns multiple parsed YAML document objects.
 *
 * @example Usage
 * ```ts
 * import { parseAll } from "@std/yaml/parse";
 * import { assertEquals } from "@std/assert";
 *
 * const data = parseAll(`
 * ---
 * id: 1
 * name: Alice
 * ---
 * id: 2
 * name: Bob
 * ---
 * id: 3
 * name: Eve
 * `);
 * assertEquals(data, [ { id: 1, name: "Alice" }, { id: 2, name: "Bob" }, { id: 3, name: "Eve" }]);
 * ```
 *
 * @param content YAML string to parse.
 * @param options Parsing options.
 * @returns Array of parsed documents.
 */ export function parseAll(content, options = {}) {
  content = sanitizeInput(content);
  const state = new LoaderState(content, {
    ...options,
    schema: SCHEMA_MAP.get(options.schema)
  });
  return [
    ...state.readDocuments()
  ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8xLjAuNS9wYXJzZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb3J0ZWQgZnJvbSBqcy15YW1sIHYzLjEzLjE6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwvY29tbWl0LzY2NWFhZGRhNDIzNDlkY2FlODY5ZjEyMDQwZDliMTBlZjE4ZDEyZGFcbi8vIENvcHlyaWdodCAyMDExLTIwMTUgYnkgVml0YWx5IFB1enJpbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBpc0VPTCB9IGZyb20gXCIuL19jaGFycy50c1wiO1xuaW1wb3J0IHsgTG9hZGVyU3RhdGUgfSBmcm9tIFwiLi9fbG9hZGVyX3N0YXRlLnRzXCI7XG5pbXBvcnQgeyBTQ0hFTUFfTUFQLCB0eXBlIFNjaGVtYVR5cGUgfSBmcm9tIFwiLi9fc2NoZW1hLnRzXCI7XG5cbmV4cG9ydCB0eXBlIHsgU2NoZW1hVHlwZSB9O1xuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBwYXJzZX0uICovXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBzY2hlbWEgdG8gdXNlLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7XCJkZWZhdWx0XCJ9XG4gICAqL1xuICBzY2hlbWE/OiBTY2hlbWFUeXBlO1xuICAvKipcbiAgICogSWYgYHRydWVgLCBkdXBsaWNhdGUga2V5cyB3aWxsIG92ZXJ3cml0ZSBwcmV2aW91cyB2YWx1ZXMuIE90aGVyd2lzZSxcbiAgICogZHVwbGljYXRlIGtleXMgd2lsbCB0aHJvdyBhIHtAbGlua2NvZGUgU3ludGF4RXJyb3J9LlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBhbGxvd0R1cGxpY2F0ZUtleXM/OiBib29sZWFuO1xuICAvKipcbiAgICogSWYgZGVmaW5lZCwgYSBmdW5jdGlvbiB0byBjYWxsIG9uIHdhcm5pbmcgbWVzc2FnZXMgdGFraW5nIGFuXG4gICAqIHtAbGlua2NvZGUgRXJyb3J9IGFzIGl0cyBvbmx5IGFyZ3VtZW50LlxuICAgKi9cbiAgb25XYXJuaW5nPyhlcnJvcjogRXJyb3IpOiB2b2lkO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZUlucHV0KGlucHV0OiBzdHJpbmcpIHtcbiAgaW5wdXQgPSBTdHJpbmcoaW5wdXQpO1xuXG4gIGlmIChpbnB1dC5sZW5ndGggPiAwKSB7XG4gICAgLy8gQWRkIHRyYWlsaW5nIGBcXG5gIGlmIG5vdCBleGlzdHNcbiAgICBpZiAoIWlzRU9MKGlucHV0LmNoYXJDb2RlQXQoaW5wdXQubGVuZ3RoIC0gMSkpKSBpbnB1dCArPSBcIlxcblwiO1xuXG4gICAgLy8gU3RyaXAgQk9NXG4gICAgaWYgKGlucHV0LmNoYXJDb2RlQXQoMCkgPT09IDB4ZmVmZikgaW5wdXQgPSBpbnB1dC5zbGljZSgxKTtcbiAgfVxuXG4gIC8vIFVzZSAwIGFzIHN0cmluZyB0ZXJtaW5hdG9yLiBUaGF0IHNpZ25pZmljYW50bHkgc2ltcGxpZmllcyBib3VuZHMgY2hlY2suXG4gIGlucHV0ICs9IFwiXFwwXCI7XG5cbiAgcmV0dXJuIGlucHV0O1xufVxuXG4vKipcbiAqIFBhcnNlIGFuZCByZXR1cm4gYSBZQU1MIHN0cmluZyBhcyBhIHBhcnNlZCBZQU1MIGRvY3VtZW50IG9iamVjdC5cbiAqXG4gKiBOb3RlOiBUaGlzIGRvZXMgbm90IHN1cHBvcnQgZnVuY3Rpb25zLiBVbnRydXN0ZWQgZGF0YSBpcyBzYWZlIHRvIHBhcnNlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcGFyc2UgfSBmcm9tIFwiQHN0ZC95YW1sL3BhcnNlXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCBkYXRhID0gcGFyc2UoYFxuICogaWQ6IDFcbiAqIG5hbWU6IEFsaWNlXG4gKiBgKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZGF0YSwgeyBpZDogMSwgbmFtZTogXCJBbGljZVwiIH0pO1xuICogYGBgXG4gKlxuICogQHRocm93cyB7U3ludGF4RXJyb3J9IFRocm93cyBlcnJvciBvbiBpbnZhbGlkIFlBTUwuXG4gKiBAcGFyYW0gY29udGVudCBZQU1MIHN0cmluZyB0byBwYXJzZS5cbiAqIEBwYXJhbSBvcHRpb25zIFBhcnNpbmcgb3B0aW9ucy5cbiAqIEByZXR1cm5zIFBhcnNlZCBkb2N1bWVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKFxuICBjb250ZW50OiBzdHJpbmcsXG4gIG9wdGlvbnM6IFBhcnNlT3B0aW9ucyA9IHt9LFxuKTogdW5rbm93biB7XG4gIGNvbnRlbnQgPSBzYW5pdGl6ZUlucHV0KGNvbnRlbnQpO1xuICBjb25zdCBzdGF0ZSA9IG5ldyBMb2FkZXJTdGF0ZShjb250ZW50LCB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBzY2hlbWE6IFNDSEVNQV9NQVAuZ2V0KG9wdGlvbnMuc2NoZW1hISkhLFxuICB9KTtcbiAgY29uc3QgZG9jdW1lbnRHZW5lcmF0b3IgPSBzdGF0ZS5yZWFkRG9jdW1lbnRzKCk7XG4gIGNvbnN0IGRvY3VtZW50ID0gZG9jdW1lbnRHZW5lcmF0b3IubmV4dCgpLnZhbHVlO1xuICBpZiAoIWRvY3VtZW50R2VuZXJhdG9yLm5leHQoKS5kb25lKSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgXCJGb3VuZCBtb3JlIHRoYW4gMSBkb2N1bWVudCBpbiB0aGUgc3RyZWFtOiBleHBlY3RlZCBhIHNpbmdsZSBkb2N1bWVudFwiLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIGRvY3VtZW50ID8/IG51bGw7XG59XG5cbi8qKlxuICogU2FtZSBhcyB7QGxpbmtjb2RlIHBhcnNlfSwgYnV0IHVuZGVyc3RhbmRzIG11bHRpLWRvY3VtZW50IFlBTUwgc291cmNlcywgYW5kXG4gKiByZXR1cm5zIG11bHRpcGxlIHBhcnNlZCBZQU1MIGRvY3VtZW50IG9iamVjdHMuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZUFsbCB9IGZyb20gXCJAc3RkL3lhbWwvcGFyc2VcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IGRhdGEgPSBwYXJzZUFsbChgXG4gKiAtLS1cbiAqIGlkOiAxXG4gKiBuYW1lOiBBbGljZVxuICogLS0tXG4gKiBpZDogMlxuICogbmFtZTogQm9iXG4gKiAtLS1cbiAqIGlkOiAzXG4gKiBuYW1lOiBFdmVcbiAqIGApO1xuICogYXNzZXJ0RXF1YWxzKGRhdGEsIFsgeyBpZDogMSwgbmFtZTogXCJBbGljZVwiIH0sIHsgaWQ6IDIsIG5hbWU6IFwiQm9iXCIgfSwgeyBpZDogMywgbmFtZTogXCJFdmVcIiB9XSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gY29udGVudCBZQU1MIHN0cmluZyB0byBwYXJzZS5cbiAqIEBwYXJhbSBvcHRpb25zIFBhcnNpbmcgb3B0aW9ucy5cbiAqIEByZXR1cm5zIEFycmF5IG9mIHBhcnNlZCBkb2N1bWVudHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUFsbChjb250ZW50OiBzdHJpbmcsIG9wdGlvbnM6IFBhcnNlT3B0aW9ucyA9IHt9KTogdW5rbm93biB7XG4gIGNvbnRlbnQgPSBzYW5pdGl6ZUlucHV0KGNvbnRlbnQpO1xuICBjb25zdCBzdGF0ZSA9IG5ldyBMb2FkZXJTdGF0ZShjb250ZW50LCB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBzY2hlbWE6IFNDSEVNQV9NQVAuZ2V0KG9wdGlvbnMuc2NoZW1hISkhLFxuICB9KTtcbiAgcmV0dXJuIFsuLi5zdGF0ZS5yZWFkRG9jdW1lbnRzKCldO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxLQUFLLFFBQVEsY0FBYztBQUNwQyxTQUFTLFdBQVcsUUFBUSxxQkFBcUI7QUFDakQsU0FBUyxVQUFVLFFBQXlCLGVBQWU7QUEwQjNELFNBQVMsY0FBYyxLQUFhO0VBQ2xDLFFBQVEsT0FBTztFQUVmLElBQUksTUFBTSxNQUFNLEdBQUcsR0FBRztJQUNwQixrQ0FBa0M7SUFDbEMsSUFBSSxDQUFDLE1BQU0sTUFBTSxVQUFVLENBQUMsTUFBTSxNQUFNLEdBQUcsS0FBSyxTQUFTO0lBRXpELFlBQVk7SUFDWixJQUFJLE1BQU0sVUFBVSxDQUFDLE9BQU8sUUFBUSxRQUFRLE1BQU0sS0FBSyxDQUFDO0VBQzFEO0VBRUEsMEVBQTBFO0VBQzFFLFNBQVM7RUFFVCxPQUFPO0FBQ1Q7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXNCQyxHQUNELE9BQU8sU0FBUyxNQUNkLE9BQWUsRUFDZixVQUF3QixDQUFDLENBQUM7RUFFMUIsVUFBVSxjQUFjO0VBQ3hCLE1BQU0sUUFBUSxJQUFJLFlBQVksU0FBUztJQUNyQyxHQUFHLE9BQU87SUFDVixRQUFRLFdBQVcsR0FBRyxDQUFDLFFBQVEsTUFBTTtFQUN2QztFQUNBLE1BQU0sb0JBQW9CLE1BQU0sYUFBYTtFQUM3QyxNQUFNLFdBQVcsa0JBQWtCLElBQUksR0FBRyxLQUFLO0VBQy9DLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxHQUFHLElBQUksRUFBRTtJQUNsQyxNQUFNLElBQUksWUFDUjtFQUVKO0VBQ0EsT0FBTyxZQUFZO0FBQ3JCO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMEJDLEdBQ0QsT0FBTyxTQUFTLFNBQVMsT0FBZSxFQUFFLFVBQXdCLENBQUMsQ0FBQztFQUNsRSxVQUFVLGNBQWM7RUFDeEIsTUFBTSxRQUFRLElBQUksWUFBWSxTQUFTO0lBQ3JDLEdBQUcsT0FBTztJQUNWLFFBQVEsV0FBVyxHQUFHLENBQUMsUUFBUSxNQUFNO0VBQ3ZDO0VBQ0EsT0FBTztPQUFJLE1BQU0sYUFBYTtHQUFHO0FBQ25DIn0=
// denoCacheMetadata=15683604796757532920,16490395702545262594