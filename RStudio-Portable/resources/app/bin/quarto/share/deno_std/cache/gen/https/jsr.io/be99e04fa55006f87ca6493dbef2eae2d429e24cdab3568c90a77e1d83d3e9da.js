// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
const { hasOwn } = Object;
function resolveYamlSet(data) {
  if (data === null) return true;
  for(const key in data){
    if (hasOwn(data, key)) {
      if (data[key] !== null) return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
export const set = new Type("tag:yaml.org,2002:set", {
  construct: constructYamlSet,
  kind: "mapping",
  resolve: resolveYamlSet
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL190eXBlL3NldC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb3J0ZWQgZnJvbSBqcy15YW1sIHYzLjEzLjE6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwvY29tbWl0LzY2NWFhZGRhNDIzNDlkY2FlODY5ZjEyMDQwZDliMTBlZjE4ZDEyZGFcbi8vIENvcHlyaWdodCAyMDExLTIwMTUgYnkgVml0YWx5IFB1enJpbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBUeXBlIH0gZnJvbSBcIi4uL3R5cGUudHNcIjtcbmltcG9ydCB0eXBlIHsgQW55IH0gZnJvbSBcIi4uL191dGlscy50c1wiO1xuXG5jb25zdCB7IGhhc093biB9ID0gT2JqZWN0O1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbFNldChkYXRhOiBBbnkpOiBib29sZWFuIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiB0cnVlO1xuXG4gIGZvciAoY29uc3Qga2V5IGluIGRhdGEpIHtcbiAgICBpZiAoaGFzT3duKGRhdGEsIGtleSkpIHtcbiAgICAgIGlmIChkYXRhW2tleV0gIT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0WWFtbFNldChkYXRhOiBzdHJpbmcpOiBBbnkge1xuICByZXR1cm4gZGF0YSAhPT0gbnVsbCA/IGRhdGEgOiB7fTtcbn1cblxuZXhwb3J0IGNvbnN0IHNldCA9IG5ldyBUeXBlKFwidGFnOnlhbWwub3JnLDIwMDI6c2V0XCIsIHtcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sU2V0LFxuICBraW5kOiBcIm1hcHBpbmdcIixcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxTZXQsXG59KTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0Isb0ZBQW9GO0FBQ3BGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFFMUUsU0FBUyxJQUFJLFFBQVEsYUFBYTtBQUdsQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUc7QUFFbkIsU0FBUyxlQUFlLElBQVM7RUFDL0IsSUFBSSxTQUFTLE1BQU0sT0FBTztFQUUxQixJQUFLLE1BQU0sT0FBTyxLQUFNO0lBQ3RCLElBQUksT0FBTyxNQUFNLE1BQU07TUFDckIsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sT0FBTztJQUNqQztFQUNGO0VBRUEsT0FBTztBQUNUO0FBRUEsU0FBUyxpQkFBaUIsSUFBWTtFQUNwQyxPQUFPLFNBQVMsT0FBTyxPQUFPLENBQUM7QUFDakM7QUFFQSxPQUFPLE1BQU0sTUFBTSxJQUFJLEtBQUsseUJBQXlCO0VBQ25ELFdBQVc7RUFDWCxNQUFNO0VBQ04sU0FBUztBQUNYLEdBQUcifQ==
// denoCacheMetadata=5142060020231687215,153230017626800424