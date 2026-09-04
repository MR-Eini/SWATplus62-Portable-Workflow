// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assert } from "jsr:/@std/assert@^0.224.0/assert";
import { assertPath } from "../_common/assert_path.ts";
import { isPathSeparator } from "./_util.ts";
import { normalize } from "./normalize.ts";
/**
 * Join all given a sequence of `paths`,then normalizes the resulting path.
 * @param paths to be joined and normalized
 */ export function join(...paths) {
  if (paths.length === 0) return ".";
  let joined;
  let firstPart = null;
  for(let i = 0; i < paths.length; ++i){
    const path = paths[i];
    assertPath(path);
    if (path.length > 0) {
      if (joined === undefined) joined = firstPart = path;
      else joined += `\\${path}`;
    }
  }
  if (joined === undefined) return ".";
  // Make sure that the joined path doesn't start with two slashes, because
  // normalize() will mistake it for an UNC path then.
  //
  // This step is skipped when it is very clear that the user actually
  // intended to point at an UNC path. This is assumed when the first
  // non-empty string arguments starts with exactly two slashes followed by
  // at least one more non-slash character.
  //
  // Note that for normalize() to treat a path as an UNC path it needs to
  // have at least 2 components, so we don't filter for that here.
  // This means that the user can use join to construct UNC paths from
  // a server name and a share name; for example:
  //   path.join('//server', 'share') -> '\\\\server\\share\\')
  let needsReplace = true;
  let slashCount = 0;
  assert(firstPart !== null);
  if (isPathSeparator(firstPart.charCodeAt(0))) {
    ++slashCount;
    const firstLen = firstPart.length;
    if (firstLen > 1) {
      if (isPathSeparator(firstPart.charCodeAt(1))) {
        ++slashCount;
        if (firstLen > 2) {
          if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
          else {
            // We matched a UNC path in the first part
            needsReplace = false;
          }
        }
      }
    }
  }
  if (needsReplace) {
    // Find any more consecutive slashes we need to replace
    for(; slashCount < joined.length; ++slashCount){
      if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
    }
    // Replace the slashes if needed
    if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
  }
  return normalize(joined);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3dpbmRvd3Mvam9pbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwianNyOi9Ac3RkL2Fzc2VydEBeMC4yMjQuMC9hc3NlcnRcIjtcbmltcG9ydCB7IGFzc2VydFBhdGggfSBmcm9tIFwiLi4vX2NvbW1vbi9hc3NlcnRfcGF0aC50c1wiO1xuaW1wb3J0IHsgaXNQYXRoU2VwYXJhdG9yIH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcbmltcG9ydCB7IG5vcm1hbGl6ZSB9IGZyb20gXCIuL25vcm1hbGl6ZS50c1wiO1xuXG4vKipcbiAqIEpvaW4gYWxsIGdpdmVuIGEgc2VxdWVuY2Ugb2YgYHBhdGhzYCx0aGVuIG5vcm1hbGl6ZXMgdGhlIHJlc3VsdGluZyBwYXRoLlxuICogQHBhcmFtIHBhdGhzIHRvIGJlIGpvaW5lZCBhbmQgbm9ybWFsaXplZFxuICovXG5leHBvcnQgZnVuY3Rpb24gam9pbiguLi5wYXRoczogc3RyaW5nW10pOiBzdHJpbmcge1xuICBpZiAocGF0aHMubGVuZ3RoID09PSAwKSByZXR1cm4gXCIuXCI7XG5cbiAgbGV0IGpvaW5lZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBsZXQgZmlyc3RQYXJ0OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRocy5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IHBhdGggPSBwYXRoc1tpXSE7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcbiAgICBpZiAocGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoam9pbmVkID09PSB1bmRlZmluZWQpIGpvaW5lZCA9IGZpcnN0UGFydCA9IHBhdGg7XG4gICAgICBlbHNlIGpvaW5lZCArPSBgXFxcXCR7cGF0aH1gO1xuICAgIH1cbiAgfVxuXG4gIGlmIChqb2luZWQgPT09IHVuZGVmaW5lZCkgcmV0dXJuIFwiLlwiO1xuXG4gIC8vIE1ha2Ugc3VyZSB0aGF0IHRoZSBqb2luZWQgcGF0aCBkb2Vzbid0IHN0YXJ0IHdpdGggdHdvIHNsYXNoZXMsIGJlY2F1c2VcbiAgLy8gbm9ybWFsaXplKCkgd2lsbCBtaXN0YWtlIGl0IGZvciBhbiBVTkMgcGF0aCB0aGVuLlxuICAvL1xuICAvLyBUaGlzIHN0ZXAgaXMgc2tpcHBlZCB3aGVuIGl0IGlzIHZlcnkgY2xlYXIgdGhhdCB0aGUgdXNlciBhY3R1YWxseVxuICAvLyBpbnRlbmRlZCB0byBwb2ludCBhdCBhbiBVTkMgcGF0aC4gVGhpcyBpcyBhc3N1bWVkIHdoZW4gdGhlIGZpcnN0XG4gIC8vIG5vbi1lbXB0eSBzdHJpbmcgYXJndW1lbnRzIHN0YXJ0cyB3aXRoIGV4YWN0bHkgdHdvIHNsYXNoZXMgZm9sbG93ZWQgYnlcbiAgLy8gYXQgbGVhc3Qgb25lIG1vcmUgbm9uLXNsYXNoIGNoYXJhY3Rlci5cbiAgLy9cbiAgLy8gTm90ZSB0aGF0IGZvciBub3JtYWxpemUoKSB0byB0cmVhdCBhIHBhdGggYXMgYW4gVU5DIHBhdGggaXQgbmVlZHMgdG9cbiAgLy8gaGF2ZSBhdCBsZWFzdCAyIGNvbXBvbmVudHMsIHNvIHdlIGRvbid0IGZpbHRlciBmb3IgdGhhdCBoZXJlLlxuICAvLyBUaGlzIG1lYW5zIHRoYXQgdGhlIHVzZXIgY2FuIHVzZSBqb2luIHRvIGNvbnN0cnVjdCBVTkMgcGF0aHMgZnJvbVxuICAvLyBhIHNlcnZlciBuYW1lIGFuZCBhIHNoYXJlIG5hbWU7IGZvciBleGFtcGxlOlxuICAvLyAgIHBhdGguam9pbignLy9zZXJ2ZXInLCAnc2hhcmUnKSAtPiAnXFxcXFxcXFxzZXJ2ZXJcXFxcc2hhcmVcXFxcJylcbiAgbGV0IG5lZWRzUmVwbGFjZSA9IHRydWU7XG4gIGxldCBzbGFzaENvdW50ID0gMDtcbiAgYXNzZXJ0KGZpcnN0UGFydCAhPT0gbnVsbCk7XG4gIGlmIChpc1BhdGhTZXBhcmF0b3IoZmlyc3RQYXJ0LmNoYXJDb2RlQXQoMCkpKSB7XG4gICAgKytzbGFzaENvdW50O1xuICAgIGNvbnN0IGZpcnN0TGVuID0gZmlyc3RQYXJ0Lmxlbmd0aDtcbiAgICBpZiAoZmlyc3RMZW4gPiAxKSB7XG4gICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKGZpcnN0UGFydC5jaGFyQ29kZUF0KDEpKSkge1xuICAgICAgICArK3NsYXNoQ291bnQ7XG4gICAgICAgIGlmIChmaXJzdExlbiA+IDIpIHtcbiAgICAgICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKGZpcnN0UGFydC5jaGFyQ29kZUF0KDIpKSkgKytzbGFzaENvdW50O1xuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gV2UgbWF0Y2hlZCBhIFVOQyBwYXRoIGluIHRoZSBmaXJzdCBwYXJ0XG4gICAgICAgICAgICBuZWVkc1JlcGxhY2UgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKG5lZWRzUmVwbGFjZSkge1xuICAgIC8vIEZpbmQgYW55IG1vcmUgY29uc2VjdXRpdmUgc2xhc2hlcyB3ZSBuZWVkIHRvIHJlcGxhY2VcbiAgICBmb3IgKDsgc2xhc2hDb3VudCA8IGpvaW5lZC5sZW5ndGg7ICsrc2xhc2hDb3VudCkge1xuICAgICAgaWYgKCFpc1BhdGhTZXBhcmF0b3Ioam9pbmVkLmNoYXJDb2RlQXQoc2xhc2hDb3VudCkpKSBicmVhaztcbiAgICB9XG5cbiAgICAvLyBSZXBsYWNlIHRoZSBzbGFzaGVzIGlmIG5lZWRlZFxuICAgIGlmIChzbGFzaENvdW50ID49IDIpIGpvaW5lZCA9IGBcXFxcJHtqb2luZWQuc2xpY2Uoc2xhc2hDb3VudCl9YDtcbiAgfVxuXG4gIHJldHVybiBub3JtYWxpemUoam9pbmVkKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsTUFBTSxRQUFRLG1DQUFtQztBQUMxRCxTQUFTLFVBQVUsUUFBUSw0QkFBNEI7QUFDdkQsU0FBUyxlQUFlLFFBQVEsYUFBYTtBQUM3QyxTQUFTLFNBQVMsUUFBUSxpQkFBaUI7QUFFM0M7OztDQUdDLEdBQ0QsT0FBTyxTQUFTLEtBQUssR0FBRyxLQUFlO0VBQ3JDLElBQUksTUFBTSxNQUFNLEtBQUssR0FBRyxPQUFPO0VBRS9CLElBQUk7RUFDSixJQUFJLFlBQTJCO0VBQy9CLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxNQUFNLE1BQU0sRUFBRSxFQUFFLEVBQUc7SUFDckMsTUFBTSxPQUFPLEtBQUssQ0FBQyxFQUFFO0lBQ3JCLFdBQVc7SUFDWCxJQUFJLEtBQUssTUFBTSxHQUFHLEdBQUc7TUFDbkIsSUFBSSxXQUFXLFdBQVcsU0FBUyxZQUFZO1dBQzFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsTUFBTTtJQUM1QjtFQUNGO0VBRUEsSUFBSSxXQUFXLFdBQVcsT0FBTztFQUVqQyx5RUFBeUU7RUFDekUsb0RBQW9EO0VBQ3BELEVBQUU7RUFDRixvRUFBb0U7RUFDcEUsbUVBQW1FO0VBQ25FLHlFQUF5RTtFQUN6RSx5Q0FBeUM7RUFDekMsRUFBRTtFQUNGLHVFQUF1RTtFQUN2RSxnRUFBZ0U7RUFDaEUsb0VBQW9FO0VBQ3BFLCtDQUErQztFQUMvQyw2REFBNkQ7RUFDN0QsSUFBSSxlQUFlO0VBQ25CLElBQUksYUFBYTtFQUNqQixPQUFPLGNBQWM7RUFDckIsSUFBSSxnQkFBZ0IsVUFBVSxVQUFVLENBQUMsS0FBSztJQUM1QyxFQUFFO0lBQ0YsTUFBTSxXQUFXLFVBQVUsTUFBTTtJQUNqQyxJQUFJLFdBQVcsR0FBRztNQUNoQixJQUFJLGdCQUFnQixVQUFVLFVBQVUsQ0FBQyxLQUFLO1FBQzVDLEVBQUU7UUFDRixJQUFJLFdBQVcsR0FBRztVQUNoQixJQUFJLGdCQUFnQixVQUFVLFVBQVUsQ0FBQyxLQUFLLEVBQUU7ZUFDM0M7WUFDSCwwQ0FBMEM7WUFDMUMsZUFBZTtVQUNqQjtRQUNGO01BQ0Y7SUFDRjtFQUNGO0VBQ0EsSUFBSSxjQUFjO0lBQ2hCLHVEQUF1RDtJQUN2RCxNQUFPLGFBQWEsT0FBTyxNQUFNLEVBQUUsRUFBRSxXQUFZO01BQy9DLElBQUksQ0FBQyxnQkFBZ0IsT0FBTyxVQUFVLENBQUMsY0FBYztJQUN2RDtJQUVBLGdDQUFnQztJQUNoQyxJQUFJLGNBQWMsR0FBRyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sS0FBSyxDQUFDLGFBQWE7RUFDL0Q7RUFFQSxPQUFPLFVBQVU7QUFDbkIifQ==
// denoCacheMetadata=4829838086403519738,13076725561271443185