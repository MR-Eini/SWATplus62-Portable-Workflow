// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { Schema } from "../schema.ts";
import { JSON_SCHEMA } from "./json.ts";
/**
 * Standard YAML's core schema.
 *
 * @see {@link http://www.yaml.org/spec/1.2/spec.html#id2804923}
 */ export const CORE_SCHEMA = new Schema({
  include: [
    JSON_SCHEMA
  ]
});
/**
 * Standard YAML's core schema.
 *
 * @see {@link http://www.yaml.org/spec/1.2/spec.html#id2804923}
 *
 * @deprecated This will be removed in 1.0.0. Use {@link CORE_SCHEMA} instead.
 */ export const core = CORE_SCHEMA;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL3NjaGVtYS9jb3JlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IFNjaGVtYSB9IGZyb20gXCIuLi9zY2hlbWEudHNcIjtcbmltcG9ydCB7IEpTT05fU0NIRU1BIH0gZnJvbSBcIi4vanNvbi50c1wiO1xuXG4vKipcbiAqIFN0YW5kYXJkIFlBTUwncyBjb3JlIHNjaGVtYS5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwOi8vd3d3LnlhbWwub3JnL3NwZWMvMS4yL3NwZWMuaHRtbCNpZDI4MDQ5MjN9XG4gKi9cbmV4cG9ydCBjb25zdCBDT1JFX1NDSEVNQTogU2NoZW1hID0gbmV3IFNjaGVtYSh7XG4gIGluY2x1ZGU6IFtKU09OX1NDSEVNQV0sXG59KTtcblxuLyoqXG4gKiBTdGFuZGFyZCBZQU1MJ3MgY29yZSBzY2hlbWEuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cDovL3d3dy55YW1sLm9yZy9zcGVjLzEuMi9zcGVjLmh0bWwjaWQyODA0OTIzfVxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2Uge0BsaW5rIENPUkVfU0NIRU1BfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgY29yZSA9IENPUkVfU0NIRU1BO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxNQUFNLFFBQVEsZUFBZTtBQUN0QyxTQUFTLFdBQVcsUUFBUSxZQUFZO0FBRXhDOzs7O0NBSUMsR0FDRCxPQUFPLE1BQU0sY0FBc0IsSUFBSSxPQUFPO0VBQzVDLFNBQVM7SUFBQztHQUFZO0FBQ3hCLEdBQUc7QUFFSDs7Ozs7O0NBTUMsR0FDRCxPQUFPLE1BQU0sT0FBTyxZQUFZIn0=
// denoCacheMetadata=3117535789248913116,4106562306740054637