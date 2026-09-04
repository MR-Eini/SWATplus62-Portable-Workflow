// Ported and adapted from js-yaml-js-types v1.0.0:
// https://github.com/nodeca/js-yaml-js-types/tree/ac537e7bbdd3c2cbbd9882ca3919c520c2dc022b
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
const REGEXP = /^\/(?<regexp>[\s\S]+)\/(?<modifiers>[gismuy]*)$/;
export const regexp = {
  tag: "tag:yaml.org,2002:js/regexp",
  kind: "scalar",
  resolve (data) {
    if (data === null || !data.length) return false;
    if (data.charAt(0) === "/") {
      // Ensure regex is properly terminated
      const groups = data.match(REGEXP)?.groups;
      if (!groups) return false;
      // Check no duplicate modifiers
      const modifiers = groups.modifiers ?? "";
      if (new Set(modifiers).size < modifiers.length) return false;
    }
    return true;
  },
  construct (data) {
    const { regexp = data, modifiers = "" } = data.match(REGEXP)?.groups ?? {};
    return new RegExp(regexp, modifiers);
  },
  predicate: (object)=>object instanceof RegExp,
  represent: (object)=>object.toString()
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8xLjAuNS9fdHlwZS9yZWdleHAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9ydGVkIGFuZCBhZGFwdGVkIGZyb20ganMteWFtbC1qcy10eXBlcyB2MS4wLjA6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwtanMtdHlwZXMvdHJlZS9hYzUzN2U3YmJkZDNjMmNiYmQ5ODgyY2EzOTE5YzUyMGMyZGMwMjJiXG4vLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHR5cGUgeyBUeXBlIH0gZnJvbSBcIi4uL190eXBlLnRzXCI7XG5cbmNvbnN0IFJFR0VYUCA9IC9eXFwvKD88cmVnZXhwPltcXHNcXFNdKylcXC8oPzxtb2RpZmllcnM+W2dpc211eV0qKSQvO1xuXG5leHBvcnQgY29uc3QgcmVnZXhwOiBUeXBlPFwic2NhbGFyXCIsIFJlZ0V4cD4gPSB7XG4gIHRhZzogXCJ0YWc6eWFtbC5vcmcsMjAwMjpqcy9yZWdleHBcIixcbiAga2luZDogXCJzY2FsYXJcIixcbiAgcmVzb2x2ZShkYXRhOiBzdHJpbmcgfCBudWxsKTogYm9vbGVhbiB7XG4gICAgaWYgKGRhdGEgPT09IG51bGwgfHwgIWRhdGEubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAoZGF0YS5jaGFyQXQoMCkgPT09IFwiL1wiKSB7XG4gICAgICAvLyBFbnN1cmUgcmVnZXggaXMgcHJvcGVybHkgdGVybWluYXRlZFxuICAgICAgY29uc3QgZ3JvdXBzID0gZGF0YS5tYXRjaChSRUdFWFApPy5ncm91cHM7XG4gICAgICBpZiAoIWdyb3VwcykgcmV0dXJuIGZhbHNlO1xuICAgICAgLy8gQ2hlY2sgbm8gZHVwbGljYXRlIG1vZGlmaWVyc1xuICAgICAgY29uc3QgbW9kaWZpZXJzID0gZ3JvdXBzLm1vZGlmaWVycyA/PyBcIlwiO1xuICAgICAgaWYgKG5ldyBTZXQobW9kaWZpZXJzKS5zaXplIDwgbW9kaWZpZXJzLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBjb25zdHJ1Y3QoZGF0YTogc3RyaW5nKTogUmVnRXhwIHtcbiAgICBjb25zdCB7IHJlZ2V4cCA9IGRhdGEsIG1vZGlmaWVycyA9IFwiXCIgfSA9IGRhdGEubWF0Y2goUkVHRVhQKT8uZ3JvdXBzID8/IHt9O1xuICAgIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4cCwgbW9kaWZpZXJzKTtcbiAgfSxcbiAgcHJlZGljYXRlOiAob2JqZWN0OiB1bmtub3duKTogb2JqZWN0IGlzIFJlZ0V4cCA9PiBvYmplY3QgaW5zdGFuY2VvZiBSZWdFeHAsXG4gIHJlcHJlc2VudDogKG9iamVjdDogUmVnRXhwKTogc3RyaW5nID0+IG9iamVjdC50b1N0cmluZygpLFxufTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtREFBbUQ7QUFDbkQsMkZBQTJGO0FBQzNGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFJMUUsTUFBTSxTQUFTO0FBRWYsT0FBTyxNQUFNLFNBQWlDO0VBQzVDLEtBQUs7RUFDTCxNQUFNO0VBQ04sU0FBUSxJQUFtQjtJQUN6QixJQUFJLFNBQVMsUUFBUSxDQUFDLEtBQUssTUFBTSxFQUFFLE9BQU87SUFFMUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxPQUFPLEtBQUs7TUFDMUIsc0NBQXNDO01BQ3RDLE1BQU0sU0FBUyxLQUFLLEtBQUssQ0FBQyxTQUFTO01BQ25DLElBQUksQ0FBQyxRQUFRLE9BQU87TUFDcEIsK0JBQStCO01BQy9CLE1BQU0sWUFBWSxPQUFPLFNBQVMsSUFBSTtNQUN0QyxJQUFJLElBQUksSUFBSSxXQUFXLElBQUksR0FBRyxVQUFVLE1BQU0sRUFBRSxPQUFPO0lBQ3pEO0lBRUEsT0FBTztFQUNUO0VBQ0EsV0FBVSxJQUFZO0lBQ3BCLE1BQU0sRUFBRSxTQUFTLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxHQUFHLEtBQUssS0FBSyxDQUFDLFNBQVMsVUFBVSxDQUFDO0lBQ3pFLE9BQU8sSUFBSSxPQUFPLFFBQVE7RUFDNUI7RUFDQSxXQUFXLENBQUMsU0FBc0Msa0JBQWtCO0VBQ3BFLFdBQVcsQ0FBQyxTQUEyQixPQUFPLFFBQVE7QUFDeEQsRUFBRSJ9
// denoCacheMetadata=1115007631271573699,7561262510825112000