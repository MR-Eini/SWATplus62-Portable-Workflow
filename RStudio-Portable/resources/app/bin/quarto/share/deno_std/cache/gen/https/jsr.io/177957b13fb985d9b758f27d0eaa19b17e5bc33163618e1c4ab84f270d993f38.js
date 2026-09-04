// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
export const str = new Type("tag:yaml.org,2002:str", {
  construct (data) {
    return data !== null ? data : "";
  },
  kind: "scalar"
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL190eXBlL3N0ci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb3J0ZWQgZnJvbSBqcy15YW1sIHYzLjEzLjE6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwvY29tbWl0LzY2NWFhZGRhNDIzNDlkY2FlODY5ZjEyMDQwZDliMTBlZjE4ZDEyZGFcbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IFR5cGUgfSBmcm9tIFwiLi4vdHlwZS50c1wiO1xuXG5leHBvcnQgY29uc3Qgc3RyID0gbmV3IFR5cGUoXCJ0YWc6eWFtbC5vcmcsMjAwMjpzdHJcIiwge1xuICBjb25zdHJ1Y3QoZGF0YSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGRhdGEgIT09IG51bGwgPyBkYXRhIDogXCJcIjtcbiAgfSxcbiAga2luZDogXCJzY2FsYXJcIixcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBRTFFLFNBQVMsSUFBSSxRQUFRLGFBQWE7QUFFbEMsT0FBTyxNQUFNLE1BQU0sSUFBSSxLQUFLLHlCQUF5QjtFQUNuRCxXQUFVLElBQUk7SUFDWixPQUFPLFNBQVMsT0FBTyxPQUFPO0VBQ2hDO0VBQ0EsTUFBTTtBQUNSLEdBQUcifQ==
// denoCacheMetadata=14693867590890794626,12311896121976498660