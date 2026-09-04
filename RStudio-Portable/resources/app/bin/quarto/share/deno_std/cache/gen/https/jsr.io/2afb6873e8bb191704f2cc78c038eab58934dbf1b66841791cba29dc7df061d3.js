// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
import { isBoolean } from "../_utils.ts";
function resolveYamlBoolean(data) {
  const max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
export const bool = new Type("tag:yaml.org,2002:bool", {
  construct: constructYamlBoolean,
  defaultStyle: "lowercase",
  kind: "scalar",
  predicate: isBoolean,
  represent: {
    lowercase (object) {
      return object ? "true" : "false";
    },
    uppercase (object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase (object) {
      return object ? "True" : "False";
    }
  },
  resolve: resolveYamlBoolean
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL190eXBlL2Jvb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9ydGVkIGZyb20ganMteWFtbCB2My4xMy4xOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVjYS9qcy15YW1sL2NvbW1pdC82NjVhYWRkYTQyMzQ5ZGNhZTg2OWYxMjA0MGQ5YjEwZWYxOGQxMmRhXG4vLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHsgVHlwZSB9IGZyb20gXCIuLi90eXBlLnRzXCI7XG5pbXBvcnQgeyBpc0Jvb2xlYW4gfSBmcm9tIFwiLi4vX3V0aWxzLnRzXCI7XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sQm9vbGVhbihkYXRhOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgbWF4ID0gZGF0YS5sZW5ndGg7XG5cbiAgcmV0dXJuIChcbiAgICAobWF4ID09PSA0ICYmIChkYXRhID09PSBcInRydWVcIiB8fCBkYXRhID09PSBcIlRydWVcIiB8fCBkYXRhID09PSBcIlRSVUVcIikpIHx8XG4gICAgKG1heCA9PT0gNSAmJiAoZGF0YSA9PT0gXCJmYWxzZVwiIHx8IGRhdGEgPT09IFwiRmFsc2VcIiB8fCBkYXRhID09PSBcIkZBTFNFXCIpKVxuICApO1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sQm9vbGVhbihkYXRhOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGRhdGEgPT09IFwidHJ1ZVwiIHx8IGRhdGEgPT09IFwiVHJ1ZVwiIHx8IGRhdGEgPT09IFwiVFJVRVwiO1xufVxuXG5leHBvcnQgY29uc3QgYm9vbCA9IG5ldyBUeXBlKFwidGFnOnlhbWwub3JnLDIwMDI6Ym9vbFwiLCB7XG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbEJvb2xlYW4sXG4gIGRlZmF1bHRTdHlsZTogXCJsb3dlcmNhc2VcIixcbiAga2luZDogXCJzY2FsYXJcIixcbiAgcHJlZGljYXRlOiBpc0Jvb2xlYW4sXG4gIHJlcHJlc2VudDoge1xuICAgIGxvd2VyY2FzZShvYmplY3Q6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIG9iamVjdCA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiO1xuICAgIH0sXG4gICAgdXBwZXJjYXNlKG9iamVjdDogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgICByZXR1cm4gb2JqZWN0ID8gXCJUUlVFXCIgOiBcIkZBTFNFXCI7XG4gICAgfSxcbiAgICBjYW1lbGNhc2Uob2JqZWN0OiBib29sZWFuKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBvYmplY3QgPyBcIlRydWVcIiA6IFwiRmFsc2VcIjtcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEJvb2xlYW4sXG59KTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0Isb0ZBQW9GO0FBQ3BGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFFMUUsU0FBUyxJQUFJLFFBQVEsYUFBYTtBQUNsQyxTQUFTLFNBQVMsUUFBUSxlQUFlO0FBRXpDLFNBQVMsbUJBQW1CLElBQVk7RUFDdEMsTUFBTSxNQUFNLEtBQUssTUFBTTtFQUV2QixPQUNFLEFBQUMsUUFBUSxLQUFLLENBQUMsU0FBUyxVQUFVLFNBQVMsVUFBVSxTQUFTLE1BQU0sS0FDbkUsUUFBUSxLQUFLLENBQUMsU0FBUyxXQUFXLFNBQVMsV0FBVyxTQUFTLE9BQU87QUFFM0U7QUFFQSxTQUFTLHFCQUFxQixJQUFZO0VBQ3hDLE9BQU8sU0FBUyxVQUFVLFNBQVMsVUFBVSxTQUFTO0FBQ3hEO0FBRUEsT0FBTyxNQUFNLE9BQU8sSUFBSSxLQUFLLDBCQUEwQjtFQUNyRCxXQUFXO0VBQ1gsY0FBYztFQUNkLE1BQU07RUFDTixXQUFXO0VBQ1gsV0FBVztJQUNULFdBQVUsTUFBZTtNQUN2QixPQUFPLFNBQVMsU0FBUztJQUMzQjtJQUNBLFdBQVUsTUFBZTtNQUN2QixPQUFPLFNBQVMsU0FBUztJQUMzQjtJQUNBLFdBQVUsTUFBZTtNQUN2QixPQUFPLFNBQVMsU0FBUztJQUMzQjtFQUNGO0VBQ0EsU0FBUztBQUNYLEdBQUcifQ==
// denoCacheMetadata=6963344333060836752,15393245903455027831