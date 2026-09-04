// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { Schema } from "../schema.ts";
import { bool, float, int, nil } from "../_type/mod.ts";
import { FAILSAFE_SCHEMA } from "./failsafe.ts";
/**
 * Standard YAML's JSON schema.
 *
 * @see {@link http://www.yaml.org/spec/1.2/spec.html#id2803231}
 *
 * @deprecated This will be removed in 1.0.0. Use {@link JSON_SCHEMA} instead.
 */ export const JSON_SCHEMA = new Schema({
  implicit: [
    nil,
    bool,
    int,
    float
  ],
  include: [
    FAILSAFE_SCHEMA
  ]
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL3NjaGVtYS9qc29uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IFNjaGVtYSB9IGZyb20gXCIuLi9zY2hlbWEudHNcIjtcbmltcG9ydCB7IGJvb2wsIGZsb2F0LCBpbnQsIG5pbCB9IGZyb20gXCIuLi9fdHlwZS9tb2QudHNcIjtcbmltcG9ydCB7IEZBSUxTQUZFX1NDSEVNQSB9IGZyb20gXCIuL2ZhaWxzYWZlLnRzXCI7XG5cbi8qKlxuICogU3RhbmRhcmQgWUFNTCdzIEpTT04gc2NoZW1hLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly93d3cueWFtbC5vcmcvc3BlYy8xLjIvc3BlYy5odG1sI2lkMjgwMzIzMX1cbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHtAbGluayBKU09OX1NDSEVNQX0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNvbnN0IEpTT05fU0NIRU1BOiBTY2hlbWEgPSBuZXcgU2NoZW1hKHtcbiAgaW1wbGljaXQ6IFtuaWwsIGJvb2wsIGludCwgZmxvYXRdLFxuICBpbmNsdWRlOiBbRkFJTFNBRkVfU0NIRU1BXSxcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxNQUFNLFFBQVEsZUFBZTtBQUN0QyxTQUFTLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsUUFBUSxrQkFBa0I7QUFDeEQsU0FBUyxlQUFlLFFBQVEsZ0JBQWdCO0FBRWhEOzs7Ozs7Q0FNQyxHQUNELE9BQU8sTUFBTSxjQUFzQixJQUFJLE9BQU87RUFDNUMsVUFBVTtJQUFDO0lBQUs7SUFBTTtJQUFLO0dBQU07RUFDakMsU0FBUztJQUFDO0dBQWdCO0FBQzVCLEdBQUcifQ==
// denoCacheMetadata=16634309861944477824,2199307874255463936