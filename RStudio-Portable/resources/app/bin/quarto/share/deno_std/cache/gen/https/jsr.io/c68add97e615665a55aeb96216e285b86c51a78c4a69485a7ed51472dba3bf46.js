// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { Schema } from "../schema.ts";
import { map, seq, str } from "../_type/mod.ts";
/**
 * Standard YAML's failsafe schema.
 *
 * @see {@link http://www.yaml.org/spec/1.2/spec.html#id2802346}
 */ export const FAILSAFE_SCHEMA = new Schema({
  explicit: [
    str,
    seq,
    map
  ]
});
/**
 * Standard YAML's failsafe schema.
 *
 * @see {@link http://www.yaml.org/spec/1.2/spec.html#id2802346}
 *
 * @deprecated This will be removed in 1.0.0. Use {@link FAILSAFE_SCHEMA} instead.
 */ export const failsafe = FAILSAFE_SCHEMA;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL3NjaGVtYS9mYWlsc2FmZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb3J0ZWQgZnJvbSBqcy15YW1sIHYzLjEzLjE6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwvY29tbWl0LzY2NWFhZGRhNDIzNDlkY2FlODY5ZjEyMDQwZDliMTBlZjE4ZDEyZGFcbi8vIENvcHlyaWdodCAyMDExLTIwMTUgYnkgVml0YWx5IFB1enJpbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBTY2hlbWEgfSBmcm9tIFwiLi4vc2NoZW1hLnRzXCI7XG5pbXBvcnQgeyBtYXAsIHNlcSwgc3RyIH0gZnJvbSBcIi4uL190eXBlL21vZC50c1wiO1xuXG4vKipcbiAqIFN0YW5kYXJkIFlBTUwncyBmYWlsc2FmZSBzY2hlbWEuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cDovL3d3dy55YW1sLm9yZy9zcGVjLzEuMi9zcGVjLmh0bWwjaWQyODAyMzQ2fVxuICovXG5leHBvcnQgY29uc3QgRkFJTFNBRkVfU0NIRU1BOiBTY2hlbWEgPSBuZXcgU2NoZW1hKHtcbiAgZXhwbGljaXQ6IFtzdHIsIHNlcSwgbWFwXSxcbn0pO1xuXG4vKipcbiAqIFN0YW5kYXJkIFlBTUwncyBmYWlsc2FmZSBzY2hlbWEuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cDovL3d3dy55YW1sLm9yZy9zcGVjLzEuMi9zcGVjLmh0bWwjaWQyODAyMzQ2fVxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2Uge0BsaW5rIEZBSUxTQUZFX1NDSEVNQX0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGZhaWxzYWZlID0gRkFJTFNBRkVfU0NIRU1BO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxNQUFNLFFBQVEsZUFBZTtBQUN0QyxTQUFTLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxRQUFRLGtCQUFrQjtBQUVoRDs7OztDQUlDLEdBQ0QsT0FBTyxNQUFNLGtCQUEwQixJQUFJLE9BQU87RUFDaEQsVUFBVTtJQUFDO0lBQUs7SUFBSztHQUFJO0FBQzNCLEdBQUc7QUFFSDs7Ozs7O0NBTUMsR0FDRCxPQUFPLE1BQU0sV0FBVyxnQkFBZ0IifQ==
// denoCacheMetadata=13361319104507636490,1615365478402917991