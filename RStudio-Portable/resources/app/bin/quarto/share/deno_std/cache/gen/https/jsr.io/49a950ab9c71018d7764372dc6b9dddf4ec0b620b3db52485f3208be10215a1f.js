// Ported and adapted from js-yaml-js-types v1.0.0:
// https://github.com/nodeca/js-yaml-js-types/tree/ac537e7bbdd3c2cbbd9882ca3919c520c2dc022b
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
const REGEXP = /^\/(?<regexp>[\s\S]+)\/(?<modifiers>[gismuy]*)$/;
export const regexp = new Type("tag:yaml.org,2002:js/regexp", {
  kind: "scalar",
  resolve (data) {
    if (data === null || !data.length) {
      return false;
    }
    const regexp = `${data}`;
    if (regexp.charAt(0) === "/") {
      // Ensure regex is properly terminated
      if (!REGEXP.test(data)) {
        return false;
      }
      // Check no duplicate modifiers
      const modifiers = [
        ...regexp.match(REGEXP)?.groups?.modifiers ?? ""
      ];
      if (new Set(modifiers).size < modifiers.length) {
        return false;
      }
    }
    return true;
  },
  construct (data) {
    const { regexp = `${data}`, modifiers = "" } = `${data}`.match(REGEXP)?.groups ?? {};
    return new RegExp(regexp, modifiers);
  },
  predicate (object) {
    return object instanceof RegExp;
  },
  represent (object) {
    return object.toString();
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL190eXBlL3JlZ2V4cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb3J0ZWQgYW5kIGFkYXB0ZWQgZnJvbSBqcy15YW1sLWpzLXR5cGVzIHYxLjAuMDpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC1qcy10eXBlcy90cmVlL2FjNTM3ZTdiYmRkM2MyY2JiZDk4ODJjYTM5MTljNTIwYzJkYzAyMmJcbi8vIENvcHlyaWdodCAyMDExLTIwMTUgYnkgVml0YWx5IFB1enJpbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBUeXBlIH0gZnJvbSBcIi4uL3R5cGUudHNcIjtcbmltcG9ydCB0eXBlIHsgQW55IH0gZnJvbSBcIi4uL191dGlscy50c1wiO1xuXG5jb25zdCBSRUdFWFAgPSAvXlxcLyg/PHJlZ2V4cD5bXFxzXFxTXSspXFwvKD88bW9kaWZpZXJzPltnaXNtdXldKikkLztcblxuZXhwb3J0IGNvbnN0IHJlZ2V4cCA9IG5ldyBUeXBlKFwidGFnOnlhbWwub3JnLDIwMDI6anMvcmVnZXhwXCIsIHtcbiAga2luZDogXCJzY2FsYXJcIixcbiAgcmVzb2x2ZShkYXRhOiBBbnkpIHtcbiAgICBpZiAoKGRhdGEgPT09IG51bGwpIHx8ICghZGF0YS5sZW5ndGgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcmVnZXhwID0gYCR7ZGF0YX1gO1xuICAgIGlmIChyZWdleHAuY2hhckF0KDApID09PSBcIi9cIikge1xuICAgICAgLy8gRW5zdXJlIHJlZ2V4IGlzIHByb3Blcmx5IHRlcm1pbmF0ZWRcbiAgICAgIGlmICghUkVHRVhQLnRlc3QoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gQ2hlY2sgbm8gZHVwbGljYXRlIG1vZGlmaWVyc1xuICAgICAgY29uc3QgbW9kaWZpZXJzID0gWy4uLihyZWdleHAubWF0Y2goUkVHRVhQKT8uZ3JvdXBzPy5tb2RpZmllcnMgPz8gXCJcIildO1xuICAgICAgaWYgKG5ldyBTZXQobW9kaWZpZXJzKS5zaXplIDwgbW9kaWZpZXJzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGNvbnN0cnVjdChkYXRhOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7IHJlZ2V4cCA9IGAke2RhdGF9YCwgbW9kaWZpZXJzID0gXCJcIiB9ID1cbiAgICAgIGAke2RhdGF9YC5tYXRjaChSRUdFWFApPy5ncm91cHMgPz8ge307XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXhwLCBtb2RpZmllcnMpO1xuICB9LFxuICBwcmVkaWNhdGUob2JqZWN0OiB1bmtub3duKSB7XG4gICAgcmV0dXJuIG9iamVjdCBpbnN0YW5jZW9mIFJlZ0V4cDtcbiAgfSxcbiAgcmVwcmVzZW50KG9iamVjdDogUmVnRXhwKSB7XG4gICAgcmV0dXJuIG9iamVjdC50b1N0cmluZygpO1xuICB9LFxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsbURBQW1EO0FBQ25ELDJGQUEyRjtBQUMzRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBRTFFLFNBQVMsSUFBSSxRQUFRLGFBQWE7QUFHbEMsTUFBTSxTQUFTO0FBRWYsT0FBTyxNQUFNLFNBQVMsSUFBSSxLQUFLLCtCQUErQjtFQUM1RCxNQUFNO0VBQ04sU0FBUSxJQUFTO0lBQ2YsSUFBSSxBQUFDLFNBQVMsUUFBVSxDQUFDLEtBQUssTUFBTSxFQUFHO01BQ3JDLE9BQU87SUFDVDtJQUVBLE1BQU0sU0FBUyxHQUFHLE1BQU07SUFDeEIsSUFBSSxPQUFPLE1BQU0sQ0FBQyxPQUFPLEtBQUs7TUFDNUIsc0NBQXNDO01BQ3RDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPO1FBQ3RCLE9BQU87TUFDVDtNQUNBLCtCQUErQjtNQUMvQixNQUFNLFlBQVk7V0FBSyxPQUFPLEtBQUssQ0FBQyxTQUFTLFFBQVEsYUFBYTtPQUFJO01BQ3RFLElBQUksSUFBSSxJQUFJLFdBQVcsSUFBSSxHQUFHLFVBQVUsTUFBTSxFQUFFO1FBQzlDLE9BQU87TUFDVDtJQUNGO0lBRUEsT0FBTztFQUNUO0VBQ0EsV0FBVSxJQUFZO0lBQ3BCLE1BQU0sRUFBRSxTQUFTLEdBQUcsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFLEdBQzFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLFVBQVUsQ0FBQztJQUN0QyxPQUFPLElBQUksT0FBTyxRQUFRO0VBQzVCO0VBQ0EsV0FBVSxNQUFlO0lBQ3ZCLE9BQU8sa0JBQWtCO0VBQzNCO0VBQ0EsV0FBVSxNQUFjO0lBQ3RCLE9BQU8sT0FBTyxRQUFRO0VBQ3hCO0FBQ0YsR0FBRyJ9
// denoCacheMetadata=5451704804729899539,10440242267584200298