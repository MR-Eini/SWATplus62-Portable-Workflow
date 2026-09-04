// Ported and adapted from js-yaml-js-types v1.0.0:
// https://github.com/nodeca/js-yaml-js-types/tree/ac537e7bbdd3c2cbbd9882ca3919c520c2dc022b
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
// Note: original implementation used Esprima to handle functions
// To avoid dependencies, we'll just try to check if we can construct a function from given string
function reconstructFunction(code) {
  const func = new Function(`return ${code}`)();
  if (!(func instanceof Function)) {
    throw new TypeError(`Expected function but got ${typeof func}: ${code}`);
  }
  return func;
}
export const func = new Type("tag:yaml.org,2002:js/function", {
  kind: "scalar",
  resolve (data) {
    if (data === null) {
      return false;
    }
    try {
      reconstructFunction(`${data}`);
      return true;
    } catch (_err) {
      return false;
    }
  },
  construct (data) {
    return reconstructFunction(data);
  },
  predicate (object) {
    return object instanceof Function;
  },
  represent (object) {
    return object.toString();
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL190eXBlL2Z1bmN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBhbmQgYWRhcHRlZCBmcm9tIGpzLXlhbWwtanMtdHlwZXMgdjEuMC4wOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVjYS9qcy15YW1sLWpzLXR5cGVzL3RyZWUvYWM1MzdlN2JiZGQzYzJjYmJkOTg4MmNhMzkxOWM1MjBjMmRjMDIyYlxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IFR5cGUgfSBmcm9tIFwiLi4vdHlwZS50c1wiO1xuaW1wb3J0IHR5cGUgeyBBbnkgfSBmcm9tIFwiLi4vX3V0aWxzLnRzXCI7XG5cbi8vIE5vdGU6IG9yaWdpbmFsIGltcGxlbWVudGF0aW9uIHVzZWQgRXNwcmltYSB0byBoYW5kbGUgZnVuY3Rpb25zXG4vLyBUbyBhdm9pZCBkZXBlbmRlbmNpZXMsIHdlJ2xsIGp1c3QgdHJ5IHRvIGNoZWNrIGlmIHdlIGNhbiBjb25zdHJ1Y3QgYSBmdW5jdGlvbiBmcm9tIGdpdmVuIHN0cmluZ1xuZnVuY3Rpb24gcmVjb25zdHJ1Y3RGdW5jdGlvbihjb2RlOiBzdHJpbmcpIHtcbiAgY29uc3QgZnVuYyA9IG5ldyBGdW5jdGlvbihgcmV0dXJuICR7Y29kZX1gKSgpO1xuICBpZiAoIShmdW5jIGluc3RhbmNlb2YgRnVuY3Rpb24pKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgZnVuY3Rpb24gYnV0IGdvdCAke3R5cGVvZiBmdW5jfTogJHtjb2RlfWApO1xuICB9XG4gIHJldHVybiBmdW5jO1xufVxuXG5leHBvcnQgY29uc3QgZnVuYyA9IG5ldyBUeXBlKFwidGFnOnlhbWwub3JnLDIwMDI6anMvZnVuY3Rpb25cIiwge1xuICBraW5kOiBcInNjYWxhclwiLFxuICByZXNvbHZlKGRhdGE6IEFueSkge1xuICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZWNvbnN0cnVjdEZ1bmN0aW9uKGAke2RhdGF9YCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChfZXJyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9LFxuICBjb25zdHJ1Y3QoZGF0YTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHJlY29uc3RydWN0RnVuY3Rpb24oZGF0YSk7XG4gIH0sXG4gIHByZWRpY2F0ZShvYmplY3Q6IHVua25vd24pIHtcbiAgICByZXR1cm4gb2JqZWN0IGluc3RhbmNlb2YgRnVuY3Rpb247XG4gIH0sXG4gIHJlcHJlc2VudChvYmplY3Q6ICguLi5hcmdzOiBBbnlbXSkgPT4gQW55KSB7XG4gICAgcmV0dXJuIG9iamVjdC50b1N0cmluZygpO1xuICB9LFxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsbURBQW1EO0FBQ25ELDJGQUEyRjtBQUMzRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBRTFFLFNBQVMsSUFBSSxRQUFRLGFBQWE7QUFHbEMsaUVBQWlFO0FBQ2pFLGtHQUFrRztBQUNsRyxTQUFTLG9CQUFvQixJQUFZO0VBQ3ZDLE1BQU0sT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTTtFQUMxQyxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsUUFBUSxHQUFHO0lBQy9CLE1BQU0sSUFBSSxVQUFVLENBQUMsMEJBQTBCLEVBQUUsT0FBTyxLQUFLLEVBQUUsRUFBRSxNQUFNO0VBQ3pFO0VBQ0EsT0FBTztBQUNUO0FBRUEsT0FBTyxNQUFNLE9BQU8sSUFBSSxLQUFLLGlDQUFpQztFQUM1RCxNQUFNO0VBQ04sU0FBUSxJQUFTO0lBQ2YsSUFBSSxTQUFTLE1BQU07TUFDakIsT0FBTztJQUNUO0lBQ0EsSUFBSTtNQUNGLG9CQUFvQixHQUFHLE1BQU07TUFDN0IsT0FBTztJQUNULEVBQUUsT0FBTyxNQUFNO01BQ2IsT0FBTztJQUNUO0VBQ0Y7RUFDQSxXQUFVLElBQVk7SUFDcEIsT0FBTyxvQkFBb0I7RUFDN0I7RUFDQSxXQUFVLE1BQWU7SUFDdkIsT0FBTyxrQkFBa0I7RUFDM0I7RUFDQSxXQUFVLE1BQStCO0lBQ3ZDLE9BQU8sT0FBTyxRQUFRO0VBQ3hCO0FBQ0YsR0FBRyJ9
// denoCacheMetadata=16163424916376196006,4577161021234095025