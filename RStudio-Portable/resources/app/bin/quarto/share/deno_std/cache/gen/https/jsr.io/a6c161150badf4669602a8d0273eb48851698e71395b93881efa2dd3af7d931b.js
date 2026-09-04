// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { binary } from "./_type/binary.ts";
import { bool } from "./_type/bool.ts";
import { float } from "./_type/float.ts";
import { int } from "./_type/int.ts";
import { map } from "./_type/map.ts";
import { merge } from "./_type/merge.ts";
import { nil } from "./_type/nil.ts";
import { omap } from "./_type/omap.ts";
import { pairs } from "./_type/pairs.ts";
import { regexp } from "./_type/regexp.ts";
import { seq } from "./_type/seq.ts";
import { set } from "./_type/set.ts";
import { str } from "./_type/str.ts";
import { timestamp } from "./_type/timestamp.ts";
import { undefinedType } from "./_type/undefined.ts";
function createTypeMap(implicitTypes, explicitTypes) {
  const result = {
    fallback: new Map(),
    mapping: new Map(),
    scalar: new Map(),
    sequence: new Map()
  };
  const fallbackMap = result.fallback;
  for (const type of [
    ...implicitTypes,
    ...explicitTypes
  ]){
    const map = result[type.kind];
    map.set(type.tag, type);
    fallbackMap.set(type.tag, type);
  }
  return result;
}
function createSchema({ explicitTypes = [], implicitTypes = [], include }) {
  if (include) {
    implicitTypes.push(...include.implicitTypes);
    explicitTypes.push(...include.explicitTypes);
  }
  const typeMap = createTypeMap(implicitTypes, explicitTypes);
  return {
    implicitTypes,
    explicitTypes,
    typeMap
  };
}
/**
 * Standard YAML's failsafe schema.
 *
 * @see {@link http://www.yaml.org/spec/1.2/spec.html#id2802346}
 */ const FAILSAFE_SCHEMA = createSchema({
  explicitTypes: [
    str,
    seq,
    map
  ]
});
/**
 * Standard YAML's JSON schema.
 *
 * @see {@link http://www.yaml.org/spec/1.2/spec.html#id2803231}
 */ const JSON_SCHEMA = createSchema({
  implicitTypes: [
    nil,
    bool,
    int,
    float
  ],
  include: FAILSAFE_SCHEMA
});
/**
 * Standard YAML's core schema.
 *
 * @see {@link http://www.yaml.org/spec/1.2/spec.html#id2804923}
 */ const CORE_SCHEMA = createSchema({
  include: JSON_SCHEMA
});
/**
 * Default YAML schema. It is not described in the YAML specification.
 */ export const DEFAULT_SCHEMA = createSchema({
  explicitTypes: [
    binary,
    omap,
    pairs,
    set
  ],
  implicitTypes: [
    timestamp,
    merge
  ],
  include: CORE_SCHEMA
});
/***
 * Extends JS-YAML default schema with additional JavaScript types
 * It is not described in the YAML specification.
 * Functions are no longer supported for security reasons.
 *
 * @example
 * ```ts
 * import { parse } from "@std/yaml";
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
 *   { schema: "extended" },
 * );
 * ```
 */ const EXTENDED_SCHEMA = createSchema({
  explicitTypes: [
    regexp,
    undefinedType
  ],
  include: DEFAULT_SCHEMA
});
export const SCHEMA_MAP = new Map([
  [
    "core",
    CORE_SCHEMA
  ],
  [
    "default",
    DEFAULT_SCHEMA
  ],
  [
    "failsafe",
    FAILSAFE_SCHEMA
  ],
  [
    "json",
    JSON_SCHEMA
  ],
  [
    "extended",
    EXTENDED_SCHEMA
  ]
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8xLjAuNS9fc2NoZW1hLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB0eXBlIHsgS2luZFR5cGUsIFR5cGUgfSBmcm9tIFwiLi9fdHlwZS50c1wiO1xuaW1wb3J0IHsgYmluYXJ5IH0gZnJvbSBcIi4vX3R5cGUvYmluYXJ5LnRzXCI7XG5pbXBvcnQgeyBib29sIH0gZnJvbSBcIi4vX3R5cGUvYm9vbC50c1wiO1xuaW1wb3J0IHsgZmxvYXQgfSBmcm9tIFwiLi9fdHlwZS9mbG9hdC50c1wiO1xuaW1wb3J0IHsgaW50IH0gZnJvbSBcIi4vX3R5cGUvaW50LnRzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwiLi9fdHlwZS9tYXAudHNcIjtcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSBcIi4vX3R5cGUvbWVyZ2UudHNcIjtcbmltcG9ydCB7IG5pbCB9IGZyb20gXCIuL190eXBlL25pbC50c1wiO1xuaW1wb3J0IHsgb21hcCB9IGZyb20gXCIuL190eXBlL29tYXAudHNcIjtcbmltcG9ydCB7IHBhaXJzIH0gZnJvbSBcIi4vX3R5cGUvcGFpcnMudHNcIjtcbmltcG9ydCB7IHJlZ2V4cCB9IGZyb20gXCIuL190eXBlL3JlZ2V4cC50c1wiO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSBcIi4vX3R5cGUvc2VxLnRzXCI7XG5pbXBvcnQgeyBzZXQgfSBmcm9tIFwiLi9fdHlwZS9zZXQudHNcIjtcbmltcG9ydCB7IHN0ciB9IGZyb20gXCIuL190eXBlL3N0ci50c1wiO1xuaW1wb3J0IHsgdGltZXN0YW1wIH0gZnJvbSBcIi4vX3R5cGUvdGltZXN0YW1wLnRzXCI7XG5pbXBvcnQgeyB1bmRlZmluZWRUeXBlIH0gZnJvbSBcIi4vX3R5cGUvdW5kZWZpbmVkLnRzXCI7XG5cbi8qKlxuICogTmFtZSBvZiB0aGUgc2NoZW1hIHRvIHVzZS5cbiAqXG4gKiA+IFshTk9URV1cbiAqID4gSXQgaXMgcmVjb21tZW5kZWQgdG8gdXNlIHRoZSBzY2hlbWEgdGhhdCBpcyBtb3N0IGFwcHJvcHJpYXRlIGZvciB5b3VyIHVzZVxuICogPiBjYXNlLiBEb2luZyBzbyB3aWxsIGF2b2lkIGFueSB1bm5lY2Vzc2FyeSBwcm9jZXNzaW5nIGFuZCBiZW5lZml0XG4gKiA+IHBlcmZvcm1hbmNlLlxuICpcbiAqIE9wdGlvbnMgaW5jbHVkZTpcbiAqIC0gYGZhaWxzYWZlYDogc3VwcG9ydHMgZ2VuZXJpYyBtYXBwaW5ncywgZ2VuZXJpYyBzZXF1ZW5jZXMgYW5kIGdlbmVyaWNcbiAqIHN0cmluZ3MuXG4gKiAtIGBqc29uYDogZXh0ZW5kcyBgZmFpbHNhZmVgIHNjaGVtYSBieSBhbHNvIHN1cHBvcnRpbmcgbnVsbHMsIGJvb2xlYW5zLFxuICogaW50ZWdlcnMgYW5kIGZsb2F0cy5cbiAqIC0gYGNvcmVgOiBmdW5jdGlvbmFsbHkgdGhlIHNhbWUgYXMgYGpzb25gIHNjaGVtYS5cbiAqIC0gYGRlZmF1bHRgOiBleHRlbmRzIGBjb3JlYCBzY2hlbWEgYnkgYWxzbyBzdXBwb3J0aW5nIGJpbmFyeSwgb21hcCwgcGFpcnMgYW5kXG4gKiBzZXQgdHlwZXMuXG4gKiAtIGBleHRlbmRlZGA6IGV4dGVuZHMgYGRlZmF1bHRgIHNjaGVtYSBieSBhbHNvIHN1cHBvcnRpbmcgcmVndWxhclxuICogZXhwcmVzc2lvbnMgYW5kIHVuZGVmaW5lZCB2YWx1ZXMuXG4gKlxuICogU2VlXG4gKiB7QGxpbmsgaHR0cHM6Ly95YW1sLm9yZy9zcGVjLzEuMi4yLyNjaGFwdGVyLTEwLXJlY29tbWVuZGVkLXNjaGVtYXMgfCBZQU1MIDEuMiBzcGVjfVxuICogZm9yIG1vcmUgZGV0YWlscyBvbiB0aGUgYGZhaWxzYWZlYCwgYGpzb25gIGFuZCBgY29yZWAgc2NoZW1hcy5cbiAqL1xuZXhwb3J0IHR5cGUgU2NoZW1hVHlwZSA9IFwiZmFpbHNhZmVcIiB8IFwianNvblwiIHwgXCJjb3JlXCIgfCBcImRlZmF1bHRcIiB8IFwiZXh0ZW5kZWRcIjtcblxudHlwZSBJbXBsaWNpdFR5cGUgPSBUeXBlPFwic2NhbGFyXCI+O1xudHlwZSBFeHBsaWNpdFR5cGUgPSBUeXBlPEtpbmRUeXBlPjtcblxuZXhwb3J0IHR5cGUgVHlwZU1hcCA9IFJlY29yZDxcbiAgS2luZFR5cGUgfCBcImZhbGxiYWNrXCIsXG4gIE1hcDxzdHJpbmcsIEV4cGxpY2l0VHlwZT5cbj47XG5cbmZ1bmN0aW9uIGNyZWF0ZVR5cGVNYXAoXG4gIGltcGxpY2l0VHlwZXM6IEltcGxpY2l0VHlwZVtdLFxuICBleHBsaWNpdFR5cGVzOiBFeHBsaWNpdFR5cGVbXSxcbik6IFR5cGVNYXAge1xuICBjb25zdCByZXN1bHQ6IFR5cGVNYXAgPSB7XG4gICAgZmFsbGJhY2s6IG5ldyBNYXAoKSxcbiAgICBtYXBwaW5nOiBuZXcgTWFwKCksXG4gICAgc2NhbGFyOiBuZXcgTWFwKCksXG4gICAgc2VxdWVuY2U6IG5ldyBNYXAoKSxcbiAgfTtcbiAgY29uc3QgZmFsbGJhY2tNYXAgPSByZXN1bHQuZmFsbGJhY2s7XG4gIGZvciAoY29uc3QgdHlwZSBvZiBbLi4uaW1wbGljaXRUeXBlcywgLi4uZXhwbGljaXRUeXBlc10pIHtcbiAgICBjb25zdCBtYXAgPSByZXN1bHRbdHlwZS5raW5kXTtcbiAgICBtYXAuc2V0KHR5cGUudGFnLCB0eXBlKTtcbiAgICBmYWxsYmFja01hcC5zZXQodHlwZS50YWcsIHR5cGUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NoZW1hIHtcbiAgaW1wbGljaXRUeXBlczogSW1wbGljaXRUeXBlW107XG4gIGV4cGxpY2l0VHlwZXM6IEV4cGxpY2l0VHlwZVtdO1xuICB0eXBlTWFwOiBUeXBlTWFwO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTY2hlbWEoeyBleHBsaWNpdFR5cGVzID0gW10sIGltcGxpY2l0VHlwZXMgPSBbXSwgaW5jbHVkZSB9OiB7XG4gIGltcGxpY2l0VHlwZXM/OiBJbXBsaWNpdFR5cGVbXTtcbiAgZXhwbGljaXRUeXBlcz86IEV4cGxpY2l0VHlwZVtdO1xuICBpbmNsdWRlPzogU2NoZW1hO1xufSk6IFNjaGVtYSB7XG4gIGlmIChpbmNsdWRlKSB7XG4gICAgaW1wbGljaXRUeXBlcy5wdXNoKC4uLmluY2x1ZGUuaW1wbGljaXRUeXBlcyk7XG4gICAgZXhwbGljaXRUeXBlcy5wdXNoKC4uLmluY2x1ZGUuZXhwbGljaXRUeXBlcyk7XG4gIH1cbiAgY29uc3QgdHlwZU1hcCA9IGNyZWF0ZVR5cGVNYXAoaW1wbGljaXRUeXBlcywgZXhwbGljaXRUeXBlcyk7XG4gIHJldHVybiB7IGltcGxpY2l0VHlwZXMsIGV4cGxpY2l0VHlwZXMsIHR5cGVNYXAgfTtcbn1cblxuLyoqXG4gKiBTdGFuZGFyZCBZQU1MJ3MgZmFpbHNhZmUgc2NoZW1hLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly93d3cueWFtbC5vcmcvc3BlYy8xLjIvc3BlYy5odG1sI2lkMjgwMjM0Nn1cbiAqL1xuY29uc3QgRkFJTFNBRkVfU0NIRU1BID0gY3JlYXRlU2NoZW1hKHtcbiAgZXhwbGljaXRUeXBlczogW3N0ciwgc2VxLCBtYXBdLFxufSk7XG5cbi8qKlxuICogU3RhbmRhcmQgWUFNTCdzIEpTT04gc2NoZW1hLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly93d3cueWFtbC5vcmcvc3BlYy8xLjIvc3BlYy5odG1sI2lkMjgwMzIzMX1cbiAqL1xuY29uc3QgSlNPTl9TQ0hFTUEgPSBjcmVhdGVTY2hlbWEoe1xuICBpbXBsaWNpdFR5cGVzOiBbbmlsLCBib29sLCBpbnQsIGZsb2F0XSxcbiAgaW5jbHVkZTogRkFJTFNBRkVfU0NIRU1BLFxufSk7XG5cbi8qKlxuICogU3RhbmRhcmQgWUFNTCdzIGNvcmUgc2NoZW1hLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly93d3cueWFtbC5vcmcvc3BlYy8xLjIvc3BlYy5odG1sI2lkMjgwNDkyM31cbiAqL1xuY29uc3QgQ09SRV9TQ0hFTUEgPSBjcmVhdGVTY2hlbWEoe1xuICBpbmNsdWRlOiBKU09OX1NDSEVNQSxcbn0pO1xuXG4vKipcbiAqIERlZmF1bHQgWUFNTCBzY2hlbWEuIEl0IGlzIG5vdCBkZXNjcmliZWQgaW4gdGhlIFlBTUwgc3BlY2lmaWNhdGlvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0NIRU1BID0gY3JlYXRlU2NoZW1hKHtcbiAgZXhwbGljaXRUeXBlczogW2JpbmFyeSwgb21hcCwgcGFpcnMsIHNldF0sXG4gIGltcGxpY2l0VHlwZXM6IFt0aW1lc3RhbXAsIG1lcmdlXSxcbiAgaW5jbHVkZTogQ09SRV9TQ0hFTUEsXG59KTtcblxuLyoqKlxuICogRXh0ZW5kcyBKUy1ZQU1MIGRlZmF1bHQgc2NoZW1hIHdpdGggYWRkaXRpb25hbCBKYXZhU2NyaXB0IHR5cGVzXG4gKiBJdCBpcyBub3QgZGVzY3JpYmVkIGluIHRoZSBZQU1MIHNwZWNpZmljYXRpb24uXG4gKiBGdW5jdGlvbnMgYXJlIG5vIGxvbmdlciBzdXBwb3J0ZWQgZm9yIHNlY3VyaXR5IHJlYXNvbnMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJAc3RkL3lhbWxcIjtcbiAqXG4gKiBjb25zdCBkYXRhID0gcGFyc2UoXG4gKiAgIGBcbiAqICAgcmVnZXhwOlxuICogICAgIHNpbXBsZTogISFqcy9yZWdleHAgZm9vYmFyXG4gKiAgICAgbW9kaWZpZXJzOiAhIWpzL3JlZ2V4cCAvZm9vYmFyL21pXG4gKiAgIHVuZGVmaW5lZDogISFqcy91bmRlZmluZWQgflxuICogIyBEaXNhYmxlZCwgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vZGVub2xhbmQvZGVub19zdGQvcHVsbC8xMjc1XG4gKiAjICBmdW5jdGlvbjogISFqcy9mdW5jdGlvbiA+XG4gKiAjICAgIGZ1bmN0aW9uIGZvb2JhcigpIHtcbiAqICMgICAgICByZXR1cm4gJ2hlbGxvIHdvcmxkISc7XG4gKiAjICAgIH1cbiAqIGAsXG4gKiAgIHsgc2NoZW1hOiBcImV4dGVuZGVkXCIgfSxcbiAqICk7XG4gKiBgYGBcbiAqL1xuY29uc3QgRVhURU5ERURfU0NIRU1BID0gY3JlYXRlU2NoZW1hKHtcbiAgZXhwbGljaXRUeXBlczogW3JlZ2V4cCwgdW5kZWZpbmVkVHlwZV0sXG4gIGluY2x1ZGU6IERFRkFVTFRfU0NIRU1BLFxufSk7XG5cbmV4cG9ydCBjb25zdCBTQ0hFTUFfTUFQID0gbmV3IE1hcDxTY2hlbWFUeXBlLCBTY2hlbWE+KFtcbiAgW1wiY29yZVwiLCBDT1JFX1NDSEVNQV0sXG4gIFtcImRlZmF1bHRcIiwgREVGQVVMVF9TQ0hFTUFdLFxuICBbXCJmYWlsc2FmZVwiLCBGQUlMU0FGRV9TQ0hFTUFdLFxuICBbXCJqc29uXCIsIEpTT05fU0NIRU1BXSxcbiAgW1wiZXh0ZW5kZWRcIiwgRVhURU5ERURfU0NIRU1BXSxcbl0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFHckMsU0FBUyxNQUFNLFFBQVEsb0JBQW9CO0FBQzNDLFNBQVMsSUFBSSxRQUFRLGtCQUFrQjtBQUN2QyxTQUFTLEtBQUssUUFBUSxtQkFBbUI7QUFDekMsU0FBUyxHQUFHLFFBQVEsaUJBQWlCO0FBQ3JDLFNBQVMsR0FBRyxRQUFRLGlCQUFpQjtBQUNyQyxTQUFTLEtBQUssUUFBUSxtQkFBbUI7QUFDekMsU0FBUyxHQUFHLFFBQVEsaUJBQWlCO0FBQ3JDLFNBQVMsSUFBSSxRQUFRLGtCQUFrQjtBQUN2QyxTQUFTLEtBQUssUUFBUSxtQkFBbUI7QUFDekMsU0FBUyxNQUFNLFFBQVEsb0JBQW9CO0FBQzNDLFNBQVMsR0FBRyxRQUFRLGlCQUFpQjtBQUNyQyxTQUFTLEdBQUcsUUFBUSxpQkFBaUI7QUFDckMsU0FBUyxHQUFHLFFBQVEsaUJBQWlCO0FBQ3JDLFNBQVMsU0FBUyxRQUFRLHVCQUF1QjtBQUNqRCxTQUFTLGFBQWEsUUFBUSx1QkFBdUI7QUFtQ3JELFNBQVMsY0FDUCxhQUE2QixFQUM3QixhQUE2QjtFQUU3QixNQUFNLFNBQWtCO0lBQ3RCLFVBQVUsSUFBSTtJQUNkLFNBQVMsSUFBSTtJQUNiLFFBQVEsSUFBSTtJQUNaLFVBQVUsSUFBSTtFQUNoQjtFQUNBLE1BQU0sY0FBYyxPQUFPLFFBQVE7RUFDbkMsS0FBSyxNQUFNLFFBQVE7T0FBSTtPQUFrQjtHQUFjLENBQUU7SUFDdkQsTUFBTSxNQUFNLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQztJQUM3QixJQUFJLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRTtJQUNsQixZQUFZLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRTtFQUM1QjtFQUNBLE9BQU87QUFDVDtBQVFBLFNBQVMsYUFBYSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxPQUFPLEVBSXRFO0VBQ0MsSUFBSSxTQUFTO0lBQ1gsY0FBYyxJQUFJLElBQUksUUFBUSxhQUFhO0lBQzNDLGNBQWMsSUFBSSxJQUFJLFFBQVEsYUFBYTtFQUM3QztFQUNBLE1BQU0sVUFBVSxjQUFjLGVBQWU7RUFDN0MsT0FBTztJQUFFO0lBQWU7SUFBZTtFQUFRO0FBQ2pEO0FBRUE7Ozs7Q0FJQyxHQUNELE1BQU0sa0JBQWtCLGFBQWE7RUFDbkMsZUFBZTtJQUFDO0lBQUs7SUFBSztHQUFJO0FBQ2hDO0FBRUE7Ozs7Q0FJQyxHQUNELE1BQU0sY0FBYyxhQUFhO0VBQy9CLGVBQWU7SUFBQztJQUFLO0lBQU07SUFBSztHQUFNO0VBQ3RDLFNBQVM7QUFDWDtBQUVBOzs7O0NBSUMsR0FDRCxNQUFNLGNBQWMsYUFBYTtFQUMvQixTQUFTO0FBQ1g7QUFFQTs7Q0FFQyxHQUNELE9BQU8sTUFBTSxpQkFBaUIsYUFBYTtFQUN6QyxlQUFlO0lBQUM7SUFBUTtJQUFNO0lBQU87R0FBSTtFQUN6QyxlQUFlO0lBQUM7SUFBVztHQUFNO0VBQ2pDLFNBQVM7QUFDWCxHQUFHO0FBRUg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCQyxHQUNELE1BQU0sa0JBQWtCLGFBQWE7RUFDbkMsZUFBZTtJQUFDO0lBQVE7R0FBYztFQUN0QyxTQUFTO0FBQ1g7QUFFQSxPQUFPLE1BQU0sYUFBYSxJQUFJLElBQXdCO0VBQ3BEO0lBQUM7SUFBUTtHQUFZO0VBQ3JCO0lBQUM7SUFBVztHQUFlO0VBQzNCO0lBQUM7SUFBWTtHQUFnQjtFQUM3QjtJQUFDO0lBQVE7R0FBWTtFQUNyQjtJQUFDO0lBQVk7R0FBZ0I7Q0FDOUIsRUFBRSJ9
// denoCacheMetadata=2566055798250853282,9772910848456874902