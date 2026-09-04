// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWildcardComparator } from "./_shared.ts";
import { compare } from "./compare.ts";
import { satisfies } from "./satisfies.ts";
function comparatorIntersects(c0, c1) {
  const op0 = c0.operator;
  const op1 = c1.operator;
  if (op0 === undefined) {
    // if c0 is empty comparator, then returns true
    if (isWildcardComparator(c0)) return true;
    return satisfies(c0, [
      [
        c1
      ]
    ]);
  }
  if (op1 === undefined) {
    if (isWildcardComparator(c1)) return true;
    return satisfies(c1, [
      [
        c0
      ]
    ]);
  }
  const cmp = compare(c0, c1);
  const sameDirectionIncreasing = (op0 === ">=" || op0 === ">") && (op1 === ">=" || op1 === ">");
  const sameDirectionDecreasing = (op0 === "<=" || op0 === "<") && (op1 === "<=" || op1 === "<");
  const sameSemVer = cmp === 0;
  const differentDirectionsInclusive = (op0 === ">=" || op0 === "<=") && (op1 === ">=" || op1 === "<=");
  const oppositeDirectionsLessThan = cmp === -1 && (op0 === ">=" || op0 === ">") && (op1 === "<=" || op1 === "<");
  const oppositeDirectionsGreaterThan = cmp === 1 && (op0 === "<=" || op0 === "<") && (op1 === ">=" || op1 === ">");
  return sameDirectionIncreasing || sameDirectionDecreasing || sameSemVer && differentDirectionsInclusive || oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
}
function rangesSatisfiable(ranges) {
  return ranges.every((r)=>{
    // For each OR at least one AND must be satisfiable
    return r.some((comparators)=>comparatorsSatisfiable(comparators));
  });
}
function comparatorsSatisfiable(comparators) {
  // Comparators are satisfiable if they all intersect with each other
  for(let i = 0; i < comparators.length - 1; i++){
    const c0 = comparators[i];
    for (const c1 of comparators.slice(i + 1)){
      if (!comparatorIntersects(c0, c1)) {
        return false;
      }
    }
  }
  return true;
}
/**
 * The ranges intersect every range of AND comparators intersects with a least one range of OR ranges.
 *
 * @example Usage
 * ```ts
 * import { parseRange, rangeIntersects } from "@std/semver";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const r0 = parseRange(">=1.0.0 <2.0.0");
 * const r1 = parseRange(">=1.0.0 <1.2.3");
 * const r2 = parseRange(">=1.2.3 <2.0.0");
 *
 * assert(rangeIntersects(r0, r1));
 * assert(rangeIntersects(r0, r2));
 * assertFalse(rangeIntersects(r1, r2));
 * ```
 *
 * @param r0 range 0
 * @param r1 range 1
 * @returns returns true if the given ranges intersect, false otherwise
 */ export function rangeIntersects(r0, r1) {
  return rangesSatisfiable([
    r0,
    r1
  ]) && r0.some((r00)=>{
    return r1.some((r11)=>{
      return r00.every((c0)=>{
        return r11.every((c1)=>comparatorIntersects(c0, c1));
      });
    });
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvcmFuZ2VfaW50ZXJzZWN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHsgaXNXaWxkY2FyZENvbXBhcmF0b3IgfSBmcm9tIFwiLi9fc2hhcmVkLnRzXCI7XG5pbXBvcnQgeyBjb21wYXJlIH0gZnJvbSBcIi4vY29tcGFyZS50c1wiO1xuaW1wb3J0IHsgc2F0aXNmaWVzIH0gZnJvbSBcIi4vc2F0aXNmaWVzLnRzXCI7XG5pbXBvcnQgdHlwZSB7IENvbXBhcmF0b3IsIFJhbmdlIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcblxuZnVuY3Rpb24gY29tcGFyYXRvckludGVyc2VjdHMoXG4gIGMwOiBDb21wYXJhdG9yLFxuICBjMTogQ29tcGFyYXRvcixcbik6IGJvb2xlYW4ge1xuICBjb25zdCBvcDAgPSBjMC5vcGVyYXRvcjtcbiAgY29uc3Qgb3AxID0gYzEub3BlcmF0b3I7XG5cbiAgaWYgKG9wMCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gaWYgYzAgaXMgZW1wdHkgY29tcGFyYXRvciwgdGhlbiByZXR1cm5zIHRydWVcbiAgICBpZiAoaXNXaWxkY2FyZENvbXBhcmF0b3IoYzApKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gc2F0aXNmaWVzKGMwLCBbW2MxXV0pO1xuICB9XG4gIGlmIChvcDEgPT09IHVuZGVmaW5lZCkge1xuICAgIGlmIChpc1dpbGRjYXJkQ29tcGFyYXRvcihjMSkpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBzYXRpc2ZpZXMoYzEsIFtbYzBdXSk7XG4gIH1cblxuICBjb25zdCBjbXAgPSBjb21wYXJlKGMwLCBjMSk7XG5cbiAgY29uc3Qgc2FtZURpcmVjdGlvbkluY3JlYXNpbmcgPSAob3AwID09PSBcIj49XCIgfHwgb3AwID09PSBcIj5cIikgJiZcbiAgICAob3AxID09PSBcIj49XCIgfHwgb3AxID09PSBcIj5cIik7XG4gIGNvbnN0IHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nID0gKG9wMCA9PT0gXCI8PVwiIHx8IG9wMCA9PT0gXCI8XCIpICYmXG4gICAgKG9wMSA9PT0gXCI8PVwiIHx8IG9wMSA9PT0gXCI8XCIpO1xuICBjb25zdCBzYW1lU2VtVmVyID0gY21wID09PSAwO1xuICBjb25zdCBkaWZmZXJlbnREaXJlY3Rpb25zSW5jbHVzaXZlID0gKG9wMCA9PT0gXCI+PVwiIHx8IG9wMCA9PT0gXCI8PVwiKSAmJlxuICAgIChvcDEgPT09IFwiPj1cIiB8fCBvcDEgPT09IFwiPD1cIik7XG4gIGNvbnN0IG9wcG9zaXRlRGlyZWN0aW9uc0xlc3NUaGFuID0gY21wID09PSAtMSAmJlxuICAgIChvcDAgPT09IFwiPj1cIiB8fCBvcDAgPT09IFwiPlwiKSAmJlxuICAgIChvcDEgPT09IFwiPD1cIiB8fCBvcDEgPT09IFwiPFwiKTtcbiAgY29uc3Qgb3Bwb3NpdGVEaXJlY3Rpb25zR3JlYXRlclRoYW4gPSBjbXAgPT09IDEgJiZcbiAgICAob3AwID09PSBcIjw9XCIgfHwgb3AwID09PSBcIjxcIikgJiZcbiAgICAob3AxID09PSBcIj49XCIgfHwgb3AxID09PSBcIj5cIik7XG5cbiAgcmV0dXJuIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nIHx8XG4gICAgc2FtZURpcmVjdGlvbkRlY3JlYXNpbmcgfHxcbiAgICAoc2FtZVNlbVZlciAmJiBkaWZmZXJlbnREaXJlY3Rpb25zSW5jbHVzaXZlKSB8fFxuICAgIG9wcG9zaXRlRGlyZWN0aW9uc0xlc3NUaGFuIHx8XG4gICAgb3Bwb3NpdGVEaXJlY3Rpb25zR3JlYXRlclRoYW47XG59XG5cbmZ1bmN0aW9uIHJhbmdlc1NhdGlzZmlhYmxlKHJhbmdlczogUmFuZ2VbXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcmFuZ2VzLmV2ZXJ5KChyKSA9PiB7XG4gICAgLy8gRm9yIGVhY2ggT1IgYXQgbGVhc3Qgb25lIEFORCBtdXN0IGJlIHNhdGlzZmlhYmxlXG4gICAgcmV0dXJuIHIuc29tZSgoY29tcGFyYXRvcnMpID0+IGNvbXBhcmF0b3JzU2F0aXNmaWFibGUoY29tcGFyYXRvcnMpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmF0b3JzU2F0aXNmaWFibGUoY29tcGFyYXRvcnM6IENvbXBhcmF0b3JbXSk6IGJvb2xlYW4ge1xuICAvLyBDb21wYXJhdG9ycyBhcmUgc2F0aXNmaWFibGUgaWYgdGhleSBhbGwgaW50ZXJzZWN0IHdpdGggZWFjaCBvdGhlclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbXBhcmF0b3JzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGNvbnN0IGMwID0gY29tcGFyYXRvcnNbaV0hO1xuICAgIGZvciAoY29uc3QgYzEgb2YgY29tcGFyYXRvcnMuc2xpY2UoaSArIDEpKSB7XG4gICAgICBpZiAoIWNvbXBhcmF0b3JJbnRlcnNlY3RzKGMwLCBjMSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBUaGUgcmFuZ2VzIGludGVyc2VjdCBldmVyeSByYW5nZSBvZiBBTkQgY29tcGFyYXRvcnMgaW50ZXJzZWN0cyB3aXRoIGEgbGVhc3Qgb25lIHJhbmdlIG9mIE9SIHJhbmdlcy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlUmFuZ2UsIHJhbmdlSW50ZXJzZWN0cyB9IGZyb20gXCJAc3RkL3NlbXZlclwiO1xuICogaW1wb3J0IHsgYXNzZXJ0LCBhc3NlcnRGYWxzZSB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHIwID0gcGFyc2VSYW5nZShcIj49MS4wLjAgPDIuMC4wXCIpO1xuICogY29uc3QgcjEgPSBwYXJzZVJhbmdlKFwiPj0xLjAuMCA8MS4yLjNcIik7XG4gKiBjb25zdCByMiA9IHBhcnNlUmFuZ2UoXCI+PTEuMi4zIDwyLjAuMFwiKTtcbiAqXG4gKiBhc3NlcnQocmFuZ2VJbnRlcnNlY3RzKHIwLCByMSkpO1xuICogYXNzZXJ0KHJhbmdlSW50ZXJzZWN0cyhyMCwgcjIpKTtcbiAqIGFzc2VydEZhbHNlKHJhbmdlSW50ZXJzZWN0cyhyMSwgcjIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSByMCByYW5nZSAwXG4gKiBAcGFyYW0gcjEgcmFuZ2UgMVxuICogQHJldHVybnMgcmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiByYW5nZXMgaW50ZXJzZWN0LCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmdlSW50ZXJzZWN0cyhcbiAgcjA6IFJhbmdlLFxuICByMTogUmFuZ2UsXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIHJhbmdlc1NhdGlzZmlhYmxlKFtyMCwgcjFdKSAmJlxuICAgIHIwLnNvbWUoKHIwMCkgPT4ge1xuICAgICAgcmV0dXJuIHIxLnNvbWUoKHIxMSkgPT4ge1xuICAgICAgICByZXR1cm4gcjAwLmV2ZXJ5KChjMCkgPT4ge1xuICAgICAgICAgIHJldHVybiByMTEuZXZlcnkoKGMxKSA9PiBjb21wYXJhdG9ySW50ZXJzZWN0cyhjMCwgYzEpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBQ3JDLFNBQVMsb0JBQW9CLFFBQVEsZUFBZTtBQUNwRCxTQUFTLE9BQU8sUUFBUSxlQUFlO0FBQ3ZDLFNBQVMsU0FBUyxRQUFRLGlCQUFpQjtBQUczQyxTQUFTLHFCQUNQLEVBQWMsRUFDZCxFQUFjO0VBRWQsTUFBTSxNQUFNLEdBQUcsUUFBUTtFQUN2QixNQUFNLE1BQU0sR0FBRyxRQUFRO0VBRXZCLElBQUksUUFBUSxXQUFXO0lBQ3JCLCtDQUErQztJQUMvQyxJQUFJLHFCQUFxQixLQUFLLE9BQU87SUFDckMsT0FBTyxVQUFVLElBQUk7TUFBQztRQUFDO09BQUc7S0FBQztFQUM3QjtFQUNBLElBQUksUUFBUSxXQUFXO0lBQ3JCLElBQUkscUJBQXFCLEtBQUssT0FBTztJQUNyQyxPQUFPLFVBQVUsSUFBSTtNQUFDO1FBQUM7T0FBRztLQUFDO0VBQzdCO0VBRUEsTUFBTSxNQUFNLFFBQVEsSUFBSTtFQUV4QixNQUFNLDBCQUEwQixDQUFDLFFBQVEsUUFBUSxRQUFRLEdBQUcsS0FDMUQsQ0FBQyxRQUFRLFFBQVEsUUFBUSxHQUFHO0VBQzlCLE1BQU0sMEJBQTBCLENBQUMsUUFBUSxRQUFRLFFBQVEsR0FBRyxLQUMxRCxDQUFDLFFBQVEsUUFBUSxRQUFRLEdBQUc7RUFDOUIsTUFBTSxhQUFhLFFBQVE7RUFDM0IsTUFBTSwrQkFBK0IsQ0FBQyxRQUFRLFFBQVEsUUFBUSxJQUFJLEtBQ2hFLENBQUMsUUFBUSxRQUFRLFFBQVEsSUFBSTtFQUMvQixNQUFNLDZCQUE2QixRQUFRLENBQUMsS0FDMUMsQ0FBQyxRQUFRLFFBQVEsUUFBUSxHQUFHLEtBQzVCLENBQUMsUUFBUSxRQUFRLFFBQVEsR0FBRztFQUM5QixNQUFNLGdDQUFnQyxRQUFRLEtBQzVDLENBQUMsUUFBUSxRQUFRLFFBQVEsR0FBRyxLQUM1QixDQUFDLFFBQVEsUUFBUSxRQUFRLEdBQUc7RUFFOUIsT0FBTywyQkFDTCwyQkFDQyxjQUFjLGdDQUNmLDhCQUNBO0FBQ0o7QUFFQSxTQUFTLGtCQUFrQixNQUFlO0VBQ3hDLE9BQU8sT0FBTyxLQUFLLENBQUMsQ0FBQztJQUNuQixtREFBbUQ7SUFDbkQsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLGNBQWdCLHVCQUF1QjtFQUN4RDtBQUNGO0FBRUEsU0FBUyx1QkFBdUIsV0FBeUI7RUFDdkQsb0VBQW9FO0VBQ3BFLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxZQUFZLE1BQU0sR0FBRyxHQUFHLElBQUs7SUFDL0MsTUFBTSxLQUFLLFdBQVcsQ0FBQyxFQUFFO0lBQ3pCLEtBQUssTUFBTSxNQUFNLFlBQVksS0FBSyxDQUFDLElBQUksR0FBSTtNQUN6QyxJQUFJLENBQUMscUJBQXFCLElBQUksS0FBSztRQUNqQyxPQUFPO01BQ1Q7SUFDRjtFQUNGO0VBQ0EsT0FBTztBQUNUO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0JDLEdBQ0QsT0FBTyxTQUFTLGdCQUNkLEVBQVMsRUFDVCxFQUFTO0VBRVQsT0FBTyxrQkFBa0I7SUFBQztJQUFJO0dBQUcsS0FDL0IsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNQLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQztNQUNkLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQztRQUNoQixPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsS0FBTyxxQkFBcUIsSUFBSTtNQUNwRDtJQUNGO0VBQ0Y7QUFDSiJ9
// denoCacheMetadata=9885350475491084982,9237634949301127888