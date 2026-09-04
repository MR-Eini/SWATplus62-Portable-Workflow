// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { Schema } from "../schema.ts";
import { binary, merge, omap, pairs, set, timestamp } from "../_type/mod.ts";
import { CORE_SCHEMA } from "./core.ts";
/**
 * Default YAML schema. It is not described in the YAML specification.
 */ export const DEFAULT_SCHEMA = new Schema({
  explicit: [
    binary,
    omap,
    pairs,
    set
  ],
  implicit: [
    timestamp,
    merge
  ],
  include: [
    CORE_SCHEMA
  ]
});
/**
 * Default YAML schema. It is not described in the YAML specification.
 *
 * @deprecated This will be removed in 1.0.0. Use {@link DEFAULT_SCHEMA} instead.
 */ export const def = DEFAULT_SCHEMA;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL3NjaGVtYS9kZWZhdWx0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IFNjaGVtYSB9IGZyb20gXCIuLi9zY2hlbWEudHNcIjtcbmltcG9ydCB7IGJpbmFyeSwgbWVyZ2UsIG9tYXAsIHBhaXJzLCBzZXQsIHRpbWVzdGFtcCB9IGZyb20gXCIuLi9fdHlwZS9tb2QudHNcIjtcbmltcG9ydCB7IENPUkVfU0NIRU1BIH0gZnJvbSBcIi4vY29yZS50c1wiO1xuXG4vKipcbiAqIERlZmF1bHQgWUFNTCBzY2hlbWEuIEl0IGlzIG5vdCBkZXNjcmliZWQgaW4gdGhlIFlBTUwgc3BlY2lmaWNhdGlvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0NIRU1BOiBTY2hlbWEgPSBuZXcgU2NoZW1hKHtcbiAgZXhwbGljaXQ6IFtiaW5hcnksIG9tYXAsIHBhaXJzLCBzZXRdLFxuICBpbXBsaWNpdDogW3RpbWVzdGFtcCwgbWVyZ2VdLFxuICBpbmNsdWRlOiBbQ09SRV9TQ0hFTUFdLFxufSk7XG5cbi8qKlxuICogRGVmYXVsdCBZQU1MIHNjaGVtYS4gSXQgaXMgbm90IGRlc2NyaWJlZCBpbiB0aGUgWUFNTCBzcGVjaWZpY2F0aW9uLlxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2Uge0BsaW5rIERFRkFVTFRfU0NIRU1BfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgZGVmID0gREVGQVVMVF9TQ0hFTUE7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLE1BQU0sUUFBUSxlQUFlO0FBQ3RDLFNBQVMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxTQUFTLFFBQVEsa0JBQWtCO0FBQzdFLFNBQVMsV0FBVyxRQUFRLFlBQVk7QUFFeEM7O0NBRUMsR0FDRCxPQUFPLE1BQU0saUJBQXlCLElBQUksT0FBTztFQUMvQyxVQUFVO0lBQUM7SUFBUTtJQUFNO0lBQU87R0FBSTtFQUNwQyxVQUFVO0lBQUM7SUFBVztHQUFNO0VBQzVCLFNBQVM7SUFBQztHQUFZO0FBQ3hCLEdBQUc7QUFFSDs7OztDQUlDLEdBQ0QsT0FBTyxNQUFNLE1BQU0sZUFBZSJ9
// denoCacheMetadata=14373288823645655409,7773191803214121134