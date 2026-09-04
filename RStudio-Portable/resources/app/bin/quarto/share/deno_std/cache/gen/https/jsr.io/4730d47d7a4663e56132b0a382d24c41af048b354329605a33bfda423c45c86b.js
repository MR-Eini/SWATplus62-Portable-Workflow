// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { isWildcardComparator } from "./_shared.ts";
import { compare } from "./compare.ts";
function testComparator(version, comparator) {
  if (isWildcardComparator(comparator)) {
    return true;
  }
  const cmp = compare(version, comparator);
  switch(comparator.operator){
    case "=":
    case undefined:
      {
        return cmp === 0;
      }
    case "!=":
      {
        return cmp !== 0;
      }
    case ">":
      {
        return cmp > 0;
      }
    case "<":
      {
        return cmp < 0;
      }
    case ">=":
      {
        return cmp >= 0;
      }
    case "<=":
      {
        return cmp <= 0;
      }
  }
}
export function testComparatorSet(version, set) {
  for (const comparator of set){
    if (!testComparator(version, comparator)) {
      return false;
    }
  }
  if (version.prerelease && version.prerelease.length > 0) {
    // Find the comparator that is allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (const comparator of set){
      if (isWildcardComparator(comparator)) {
        continue;
      }
      const { major, minor, patch, prerelease } = comparator;
      if (prerelease && prerelease.length > 0) {
        if (version.major === major && version.minor === minor && version.patch === patch) {
          return true;
        }
      }
    }
    return false;
  }
  return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvX3Rlc3RfY29tcGFyYXRvcl9zZXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHR5cGUgeyBDb21wYXJhdG9yLCBTZW1WZXIgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHsgaXNXaWxkY2FyZENvbXBhcmF0b3IgfSBmcm9tIFwiLi9fc2hhcmVkLnRzXCI7XG5pbXBvcnQgeyBjb21wYXJlIH0gZnJvbSBcIi4vY29tcGFyZS50c1wiO1xuXG5mdW5jdGlvbiB0ZXN0Q29tcGFyYXRvcih2ZXJzaW9uOiBTZW1WZXIsIGNvbXBhcmF0b3I6IENvbXBhcmF0b3IpOiBib29sZWFuIHtcbiAgaWYgKGlzV2lsZGNhcmRDb21wYXJhdG9yKGNvbXBhcmF0b3IpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgY29uc3QgY21wID0gY29tcGFyZSh2ZXJzaW9uLCBjb21wYXJhdG9yKTtcbiAgc3dpdGNoIChjb21wYXJhdG9yLm9wZXJhdG9yKSB7XG4gICAgY2FzZSBcIj1cIjpcbiAgICBjYXNlIHVuZGVmaW5lZDoge1xuICAgICAgcmV0dXJuIGNtcCA9PT0gMDtcbiAgICB9XG4gICAgY2FzZSBcIiE9XCI6IHtcbiAgICAgIHJldHVybiBjbXAgIT09IDA7XG4gICAgfVxuICAgIGNhc2UgXCI+XCI6IHtcbiAgICAgIHJldHVybiBjbXAgPiAwO1xuICAgIH1cbiAgICBjYXNlIFwiPFwiOiB7XG4gICAgICByZXR1cm4gY21wIDwgMDtcbiAgICB9XG4gICAgY2FzZSBcIj49XCI6IHtcbiAgICAgIHJldHVybiBjbXAgPj0gMDtcbiAgICB9XG4gICAgY2FzZSBcIjw9XCI6IHtcbiAgICAgIHJldHVybiBjbXAgPD0gMDtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRlc3RDb21wYXJhdG9yU2V0KFxuICB2ZXJzaW9uOiBTZW1WZXIsXG4gIHNldDogQ29tcGFyYXRvcltdLFxuKTogYm9vbGVhbiB7XG4gIGZvciAoY29uc3QgY29tcGFyYXRvciBvZiBzZXQpIHtcbiAgICBpZiAoIXRlc3RDb21wYXJhdG9yKHZlcnNpb24sIGNvbXBhcmF0b3IpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGlmICh2ZXJzaW9uLnByZXJlbGVhc2UgJiYgdmVyc2lvbi5wcmVyZWxlYXNlLmxlbmd0aCA+IDApIHtcbiAgICAvLyBGaW5kIHRoZSBjb21wYXJhdG9yIHRoYXQgaXMgYWxsb3dlZCB0byBoYXZlIHByZXJlbGVhc2VzXG4gICAgLy8gRm9yIGV4YW1wbGUsIF4xLjIuMy1wci4xIGRlc3VnYXJzIHRvID49MS4yLjMtcHIuMSA8Mi4wLjBcbiAgICAvLyBUaGF0IHNob3VsZCBhbGxvdyBgMS4yLjMtcHIuMmAgdG8gcGFzcy5cbiAgICAvLyBIb3dldmVyLCBgMS4yLjQtYWxwaGEubm90cmVhZHlgIHNob3VsZCBOT1QgYmUgYWxsb3dlZCxcbiAgICAvLyBldmVuIHRob3VnaCBpdCdzIHdpdGhpbiB0aGUgcmFuZ2Ugc2V0IGJ5IHRoZSBjb21wYXJhdG9ycy5cbiAgICBmb3IgKGNvbnN0IGNvbXBhcmF0b3Igb2Ygc2V0KSB7XG4gICAgICBpZiAoaXNXaWxkY2FyZENvbXBhcmF0b3IoY29tcGFyYXRvcikpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCB7IG1ham9yLCBtaW5vciwgcGF0Y2gsIHByZXJlbGVhc2UgfSA9IGNvbXBhcmF0b3I7XG4gICAgICBpZiAocHJlcmVsZWFzZSAmJiBwcmVyZWxlYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHZlcnNpb24ubWFqb3IgPT09IG1ham9yICYmIHZlcnNpb24ubWlub3IgPT09IG1pbm9yICYmXG4gICAgICAgICAgdmVyc2lvbi5wYXRjaCA9PT0gcGF0Y2hcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUcxRSxTQUFTLG9CQUFvQixRQUFRLGVBQWU7QUFDcEQsU0FBUyxPQUFPLFFBQVEsZUFBZTtBQUV2QyxTQUFTLGVBQWUsT0FBZSxFQUFFLFVBQXNCO0VBQzdELElBQUkscUJBQXFCLGFBQWE7SUFDcEMsT0FBTztFQUNUO0VBQ0EsTUFBTSxNQUFNLFFBQVEsU0FBUztFQUM3QixPQUFRLFdBQVcsUUFBUTtJQUN6QixLQUFLO0lBQ0wsS0FBSztNQUFXO1FBQ2QsT0FBTyxRQUFRO01BQ2pCO0lBQ0EsS0FBSztNQUFNO1FBQ1QsT0FBTyxRQUFRO01BQ2pCO0lBQ0EsS0FBSztNQUFLO1FBQ1IsT0FBTyxNQUFNO01BQ2Y7SUFDQSxLQUFLO01BQUs7UUFDUixPQUFPLE1BQU07TUFDZjtJQUNBLEtBQUs7TUFBTTtRQUNULE9BQU8sT0FBTztNQUNoQjtJQUNBLEtBQUs7TUFBTTtRQUNULE9BQU8sT0FBTztNQUNoQjtFQUNGO0FBQ0Y7QUFFQSxPQUFPLFNBQVMsa0JBQ2QsT0FBZSxFQUNmLEdBQWlCO0VBRWpCLEtBQUssTUFBTSxjQUFjLElBQUs7SUFDNUIsSUFBSSxDQUFDLGVBQWUsU0FBUyxhQUFhO01BQ3hDLE9BQU87SUFDVDtFQUNGO0VBQ0EsSUFBSSxRQUFRLFVBQVUsSUFBSSxRQUFRLFVBQVUsQ0FBQyxNQUFNLEdBQUcsR0FBRztJQUN2RCwwREFBMEQ7SUFDMUQsMkRBQTJEO0lBQzNELDBDQUEwQztJQUMxQyx5REFBeUQ7SUFDekQsNERBQTREO0lBQzVELEtBQUssTUFBTSxjQUFjLElBQUs7TUFDNUIsSUFBSSxxQkFBcUIsYUFBYTtRQUNwQztNQUNGO01BQ0EsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxHQUFHO01BQzVDLElBQUksY0FBYyxXQUFXLE1BQU0sR0FBRyxHQUFHO1FBQ3ZDLElBQ0UsUUFBUSxLQUFLLEtBQUssU0FBUyxRQUFRLEtBQUssS0FBSyxTQUM3QyxRQUFRLEtBQUssS0FBSyxPQUNsQjtVQUNBLE9BQU87UUFDVDtNQUNGO0lBQ0Y7SUFDQSxPQUFPO0VBQ1Q7RUFDQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=2061555288831032626,4184181920015102118