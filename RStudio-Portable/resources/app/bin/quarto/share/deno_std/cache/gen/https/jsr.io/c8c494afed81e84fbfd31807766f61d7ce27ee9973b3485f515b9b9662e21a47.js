// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
function resolveYamlNull(data) {
  const max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
export const nil = new Type("tag:yaml.org,2002:null", {
  construct: constructYamlNull,
  defaultStyle: "lowercase",
  kind: "scalar",
  predicate: isNull,
  represent: {
    canonical () {
      return "~";
    },
    lowercase () {
      return "null";
    },
    uppercase () {
      return "NULL";
    },
    camelcase () {
      return "Null";
    }
  },
  resolve: resolveYamlNull
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL190eXBlL25pbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb3J0ZWQgZnJvbSBqcy15YW1sIHYzLjEzLjE6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwvY29tbWl0LzY2NWFhZGRhNDIzNDlkY2FlODY5ZjEyMDQwZDliMTBlZjE4ZDEyZGFcbi8vIENvcHlyaWdodCAyMDExLTIwMTUgYnkgVml0YWx5IFB1enJpbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBUeXBlIH0gZnJvbSBcIi4uL3R5cGUudHNcIjtcblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxOdWxsKGRhdGE6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBtYXggPSBkYXRhLmxlbmd0aDtcblxuICByZXR1cm4gKFxuICAgIChtYXggPT09IDEgJiYgZGF0YSA9PT0gXCJ+XCIpIHx8XG4gICAgKG1heCA9PT0gNCAmJiAoZGF0YSA9PT0gXCJudWxsXCIgfHwgZGF0YSA9PT0gXCJOdWxsXCIgfHwgZGF0YSA9PT0gXCJOVUxMXCIpKVxuICApO1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sTnVsbCgpOiBudWxsIHtcbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzTnVsbChvYmplY3Q6IHVua25vd24pOiBvYmplY3QgaXMgbnVsbCB7XG4gIHJldHVybiBvYmplY3QgPT09IG51bGw7XG59XG5cbmV4cG9ydCBjb25zdCBuaWwgPSBuZXcgVHlwZShcInRhZzp5YW1sLm9yZywyMDAyOm51bGxcIiwge1xuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxOdWxsLFxuICBkZWZhdWx0U3R5bGU6IFwibG93ZXJjYXNlXCIsXG4gIGtpbmQ6IFwic2NhbGFyXCIsXG4gIHByZWRpY2F0ZTogaXNOdWxsLFxuICByZXByZXNlbnQ6IHtcbiAgICBjYW5vbmljYWwoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBcIn5cIjtcbiAgICB9LFxuICAgIGxvd2VyY2FzZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIFwibnVsbFwiO1xuICAgIH0sXG4gICAgdXBwZXJjYXNlKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gXCJOVUxMXCI7XG4gICAgfSxcbiAgICBjYW1lbGNhc2UoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBcIk51bGxcIjtcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiByZXNvbHZlWWFtbE51bGwsXG59KTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0Isb0ZBQW9GO0FBQ3BGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFFMUUsU0FBUyxJQUFJLFFBQVEsYUFBYTtBQUVsQyxTQUFTLGdCQUFnQixJQUFZO0VBQ25DLE1BQU0sTUFBTSxLQUFLLE1BQU07RUFFdkIsT0FDRSxBQUFDLFFBQVEsS0FBSyxTQUFTLE9BQ3RCLFFBQVEsS0FBSyxDQUFDLFNBQVMsVUFBVSxTQUFTLFVBQVUsU0FBUyxNQUFNO0FBRXhFO0FBRUEsU0FBUztFQUNQLE9BQU87QUFDVDtBQUVBLFNBQVMsT0FBTyxNQUFlO0VBQzdCLE9BQU8sV0FBVztBQUNwQjtBQUVBLE9BQU8sTUFBTSxNQUFNLElBQUksS0FBSywwQkFBMEI7RUFDcEQsV0FBVztFQUNYLGNBQWM7RUFDZCxNQUFNO0VBQ04sV0FBVztFQUNYLFdBQVc7SUFDVDtNQUNFLE9BQU87SUFDVDtJQUNBO01BQ0UsT0FBTztJQUNUO0lBQ0E7TUFDRSxPQUFPO0lBQ1Q7SUFDQTtNQUNFLE9BQU87SUFDVDtFQUNGO0VBQ0EsU0FBUztBQUNYLEdBQUcifQ==
// denoCacheMetadata=11163962126029748268,14382494036986302373