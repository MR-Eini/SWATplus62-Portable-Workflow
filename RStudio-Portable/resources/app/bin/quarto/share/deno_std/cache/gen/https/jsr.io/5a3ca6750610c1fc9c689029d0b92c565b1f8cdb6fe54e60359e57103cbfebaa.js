// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
const YAML_TRUE_BOOLEANS = [
  "true",
  "True",
  "TRUE"
];
const YAML_FALSE_BOOLEANS = [
  "false",
  "False",
  "FALSE"
];
const YAML_BOOLEANS = [
  ...YAML_TRUE_BOOLEANS,
  ...YAML_FALSE_BOOLEANS
];
export const bool = {
  tag: "tag:yaml.org,2002:bool",
  kind: "scalar",
  defaultStyle: "lowercase",
  predicate: (value)=>typeof value === "boolean" || value instanceof Boolean,
  construct: (data)=>YAML_TRUE_BOOLEANS.includes(data),
  resolve: (data)=>YAML_BOOLEANS.includes(data),
  represent: {
    // deno-lint-ignore ban-types
    lowercase: (object)=>{
      const value = object instanceof Boolean ? object.valueOf() : object;
      return value ? "true" : "false";
    },
    // deno-lint-ignore ban-types
    uppercase: (object)=>{
      const value = object instanceof Boolean ? object.valueOf() : object;
      return value ? "TRUE" : "FALSE";
    },
    // deno-lint-ignore ban-types
    camelcase: (object)=>{
      const value = object instanceof Boolean ? object.valueOf() : object;
      return value ? "True" : "False";
    }
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8xLjAuNS9fdHlwZS9ib29sLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB0eXBlIHsgVHlwZSB9IGZyb20gXCIuLi9fdHlwZS50c1wiO1xuXG5jb25zdCBZQU1MX1RSVUVfQk9PTEVBTlMgPSBbXCJ0cnVlXCIsIFwiVHJ1ZVwiLCBcIlRSVUVcIl07XG5jb25zdCBZQU1MX0ZBTFNFX0JPT0xFQU5TID0gW1wiZmFsc2VcIiwgXCJGYWxzZVwiLCBcIkZBTFNFXCJdO1xuY29uc3QgWUFNTF9CT09MRUFOUyA9IFsuLi5ZQU1MX1RSVUVfQk9PTEVBTlMsIC4uLllBTUxfRkFMU0VfQk9PTEVBTlNdO1xuXG5leHBvcnQgY29uc3QgYm9vbDogVHlwZTxcInNjYWxhclwiLCBib29sZWFuPiA9IHtcbiAgdGFnOiBcInRhZzp5YW1sLm9yZywyMDAyOmJvb2xcIixcbiAga2luZDogXCJzY2FsYXJcIixcbiAgZGVmYXVsdFN0eWxlOiBcImxvd2VyY2FzZVwiLFxuICBwcmVkaWNhdGU6ICh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIGJvb2xlYW4gPT5cbiAgICB0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiIHx8IHZhbHVlIGluc3RhbmNlb2YgQm9vbGVhbixcbiAgY29uc3RydWN0OiAoZGF0YTogc3RyaW5nKTogYm9vbGVhbiA9PiBZQU1MX1RSVUVfQk9PTEVBTlMuaW5jbHVkZXMoZGF0YSksXG4gIHJlc29sdmU6IChkYXRhOiBzdHJpbmcpOiBib29sZWFuID0+IFlBTUxfQk9PTEVBTlMuaW5jbHVkZXMoZGF0YSksXG4gIHJlcHJlc2VudDoge1xuICAgIC8vIGRlbm8tbGludC1pZ25vcmUgYmFuLXR5cGVzXG4gICAgbG93ZXJjYXNlOiAob2JqZWN0OiBib29sZWFuIHwgQm9vbGVhbik6IHN0cmluZyA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IG9iamVjdCBpbnN0YW5jZW9mIEJvb2xlYW4gPyBvYmplY3QudmFsdWVPZigpIDogb2JqZWN0O1xuICAgICAgcmV0dXJuIHZhbHVlID8gXCJ0cnVlXCIgOiBcImZhbHNlXCI7XG4gICAgfSxcbiAgICAvLyBkZW5vLWxpbnQtaWdub3JlIGJhbi10eXBlc1xuICAgIHVwcGVyY2FzZTogKG9iamVjdDogYm9vbGVhbiB8IEJvb2xlYW4pOiBzdHJpbmcgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBvYmplY3QgaW5zdGFuY2VvZiBCb29sZWFuID8gb2JqZWN0LnZhbHVlT2YoKSA6IG9iamVjdDtcbiAgICAgIHJldHVybiB2YWx1ZSA/IFwiVFJVRVwiIDogXCJGQUxTRVwiO1xuICAgIH0sXG4gICAgLy8gZGVuby1saW50LWlnbm9yZSBiYW4tdHlwZXNcbiAgICBjYW1lbGNhc2U6IChvYmplY3Q6IGJvb2xlYW4gfCBCb29sZWFuKTogc3RyaW5nID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gb2JqZWN0IGluc3RhbmNlb2YgQm9vbGVhbiA/IG9iamVjdC52YWx1ZU9mKCkgOiBvYmplY3Q7XG4gICAgICByZXR1cm4gdmFsdWUgPyBcIlRydWVcIiA6IFwiRmFsc2VcIjtcbiAgICB9LFxuICB9LFxufTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0Isb0ZBQW9GO0FBQ3BGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFJMUUsTUFBTSxxQkFBcUI7RUFBQztFQUFRO0VBQVE7Q0FBTztBQUNuRCxNQUFNLHNCQUFzQjtFQUFDO0VBQVM7RUFBUztDQUFRO0FBQ3ZELE1BQU0sZ0JBQWdCO0tBQUk7S0FBdUI7Q0FBb0I7QUFFckUsT0FBTyxNQUFNLE9BQWdDO0VBQzNDLEtBQUs7RUFDTCxNQUFNO0VBQ04sY0FBYztFQUNkLFdBQVcsQ0FBQyxRQUNWLE9BQU8sVUFBVSxhQUFhLGlCQUFpQjtFQUNqRCxXQUFXLENBQUMsT0FBMEIsbUJBQW1CLFFBQVEsQ0FBQztFQUNsRSxTQUFTLENBQUMsT0FBMEIsY0FBYyxRQUFRLENBQUM7RUFDM0QsV0FBVztJQUNULDZCQUE2QjtJQUM3QixXQUFXLENBQUM7TUFDVixNQUFNLFFBQVEsa0JBQWtCLFVBQVUsT0FBTyxPQUFPLEtBQUs7TUFDN0QsT0FBTyxRQUFRLFNBQVM7SUFDMUI7SUFDQSw2QkFBNkI7SUFDN0IsV0FBVyxDQUFDO01BQ1YsTUFBTSxRQUFRLGtCQUFrQixVQUFVLE9BQU8sT0FBTyxLQUFLO01BQzdELE9BQU8sUUFBUSxTQUFTO0lBQzFCO0lBQ0EsNkJBQTZCO0lBQzdCLFdBQVcsQ0FBQztNQUNWLE1BQU0sUUFBUSxrQkFBa0IsVUFBVSxPQUFPLE9BQU8sS0FBSztNQUM3RCxPQUFPLFFBQVEsU0FBUztJQUMxQjtFQUNGO0FBQ0YsRUFBRSJ9
// denoCacheMetadata=8146728923526133280,4539412546132422002