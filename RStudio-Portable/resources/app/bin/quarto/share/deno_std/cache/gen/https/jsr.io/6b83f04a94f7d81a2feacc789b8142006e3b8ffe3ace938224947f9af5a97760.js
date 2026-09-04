// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assertPath } from "../_common/assert_path.ts";
import { isPathSeparator } from "./_util.ts";
import { normalize } from "./normalize.ts";
/**
 * Join all given a sequence of `paths`,then normalizes the resulting path.
 *
 * @example Usage
 * ```ts
 * import { join } from "@std/path/windows/join";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const joined = join("C:\\foo", "bar", "baz\\..");
 * assertEquals(joined, "C:\\foo\\bar");
 * ```
 *
 * @param paths The paths to join.
 * @returns The joined path.
 */ export function join(...paths) {
  paths.forEach((path)=>assertPath(path));
  paths = paths.filter((path)=>path.length > 0);
  if (paths.length === 0) return ".";
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
  //   path.join('//server', 'share') -> '\\\\server\\share\\'
  let needsReplace = true;
  let slashCount = 0;
  const firstPart = paths[0];
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
  let joined = paths.join("\\");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjAuMC1yYy4yL3dpbmRvd3Mvam9pbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBhc3NlcnRQYXRoIH0gZnJvbSBcIi4uL19jb21tb24vYXNzZXJ0X3BhdGgudHNcIjtcbmltcG9ydCB7IGlzUGF0aFNlcGFyYXRvciB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5pbXBvcnQgeyBub3JtYWxpemUgfSBmcm9tIFwiLi9ub3JtYWxpemUudHNcIjtcblxuLyoqXG4gKiBKb2luIGFsbCBnaXZlbiBhIHNlcXVlbmNlIG9mIGBwYXRoc2AsdGhlbiBub3JtYWxpemVzIHRoZSByZXN1bHRpbmcgcGF0aC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGpvaW4gfSBmcm9tIFwiQHN0ZC9wYXRoL3dpbmRvd3Mvam9pblwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBqb2luZWQgPSBqb2luKFwiQzpcXFxcZm9vXCIsIFwiYmFyXCIsIFwiYmF6XFxcXC4uXCIpO1xuICogYXNzZXJ0RXF1YWxzKGpvaW5lZCwgXCJDOlxcXFxmb29cXFxcYmFyXCIpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHBhdGhzIFRoZSBwYXRocyB0byBqb2luLlxuICogQHJldHVybnMgVGhlIGpvaW5lZCBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gam9pbiguLi5wYXRoczogc3RyaW5nW10pOiBzdHJpbmcge1xuICBwYXRocy5mb3JFYWNoKChwYXRoKSA9PiBhc3NlcnRQYXRoKHBhdGgpKTtcbiAgcGF0aHMgPSBwYXRocy5maWx0ZXIoKHBhdGgpID0+IHBhdGgubGVuZ3RoID4gMCk7XG4gIGlmIChwYXRocy5sZW5ndGggPT09IDApIHJldHVybiBcIi5cIjtcblxuICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgam9pbmVkIHBhdGggZG9lc24ndCBzdGFydCB3aXRoIHR3byBzbGFzaGVzLCBiZWNhdXNlXG4gIC8vIG5vcm1hbGl6ZSgpIHdpbGwgbWlzdGFrZSBpdCBmb3IgYW4gVU5DIHBhdGggdGhlbi5cbiAgLy9cbiAgLy8gVGhpcyBzdGVwIGlzIHNraXBwZWQgd2hlbiBpdCBpcyB2ZXJ5IGNsZWFyIHRoYXQgdGhlIHVzZXIgYWN0dWFsbHlcbiAgLy8gaW50ZW5kZWQgdG8gcG9pbnQgYXQgYW4gVU5DIHBhdGguIFRoaXMgaXMgYXNzdW1lZCB3aGVuIHRoZSBmaXJzdFxuICAvLyBub24tZW1wdHkgc3RyaW5nIGFyZ3VtZW50cyBzdGFydHMgd2l0aCBleGFjdGx5IHR3byBzbGFzaGVzIGZvbGxvd2VkIGJ5XG4gIC8vIGF0IGxlYXN0IG9uZSBtb3JlIG5vbi1zbGFzaCBjaGFyYWN0ZXIuXG4gIC8vXG4gIC8vIE5vdGUgdGhhdCBmb3Igbm9ybWFsaXplKCkgdG8gdHJlYXQgYSBwYXRoIGFzIGFuIFVOQyBwYXRoIGl0IG5lZWRzIHRvXG4gIC8vIGhhdmUgYXQgbGVhc3QgMiBjb21wb25lbnRzLCBzbyB3ZSBkb24ndCBmaWx0ZXIgZm9yIHRoYXQgaGVyZS5cbiAgLy8gVGhpcyBtZWFucyB0aGF0IHRoZSB1c2VyIGNhbiB1c2Ugam9pbiB0byBjb25zdHJ1Y3QgVU5DIHBhdGhzIGZyb21cbiAgLy8gYSBzZXJ2ZXIgbmFtZSBhbmQgYSBzaGFyZSBuYW1lOyBmb3IgZXhhbXBsZTpcbiAgLy8gICBwYXRoLmpvaW4oJy8vc2VydmVyJywgJ3NoYXJlJykgLT4gJ1xcXFxcXFxcc2VydmVyXFxcXHNoYXJlXFxcXCdcbiAgbGV0IG5lZWRzUmVwbGFjZSA9IHRydWU7XG4gIGxldCBzbGFzaENvdW50ID0gMDtcbiAgY29uc3QgZmlyc3RQYXJ0ID0gcGF0aHNbMF0hO1xuICBpZiAoaXNQYXRoU2VwYXJhdG9yKGZpcnN0UGFydC5jaGFyQ29kZUF0KDApKSkge1xuICAgICsrc2xhc2hDb3VudDtcbiAgICBjb25zdCBmaXJzdExlbiA9IGZpcnN0UGFydC5sZW5ndGg7XG4gICAgaWYgKGZpcnN0TGVuID4gMSkge1xuICAgICAgaWYgKGlzUGF0aFNlcGFyYXRvcihmaXJzdFBhcnQuY2hhckNvZGVBdCgxKSkpIHtcbiAgICAgICAgKytzbGFzaENvdW50O1xuICAgICAgICBpZiAoZmlyc3RMZW4gPiAyKSB7XG4gICAgICAgICAgaWYgKGlzUGF0aFNlcGFyYXRvcihmaXJzdFBhcnQuY2hhckNvZGVBdCgyKSkpICsrc2xhc2hDb3VudDtcbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdlIG1hdGNoZWQgYSBVTkMgcGF0aCBpbiB0aGUgZmlyc3QgcGFydFxuICAgICAgICAgICAgbmVlZHNSZXBsYWNlID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGxldCBqb2luZWQgPSBwYXRocy5qb2luKFwiXFxcXFwiKTtcbiAgaWYgKG5lZWRzUmVwbGFjZSkge1xuICAgIC8vIEZpbmQgYW55IG1vcmUgY29uc2VjdXRpdmUgc2xhc2hlcyB3ZSBuZWVkIHRvIHJlcGxhY2VcbiAgICBmb3IgKDsgc2xhc2hDb3VudCA8IGpvaW5lZC5sZW5ndGg7ICsrc2xhc2hDb3VudCkge1xuICAgICAgaWYgKCFpc1BhdGhTZXBhcmF0b3Ioam9pbmVkLmNoYXJDb2RlQXQoc2xhc2hDb3VudCkpKSBicmVhaztcbiAgICB9XG5cbiAgICAvLyBSZXBsYWNlIHRoZSBzbGFzaGVzIGlmIG5lZWRlZFxuICAgIGlmIChzbGFzaENvdW50ID49IDIpIGpvaW5lZCA9IGBcXFxcJHtqb2luZWQuc2xpY2Uoc2xhc2hDb3VudCl9YDtcbiAgfVxuXG4gIHJldHVybiBub3JtYWxpemUoam9pbmVkKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsVUFBVSxRQUFRLDRCQUE0QjtBQUN2RCxTQUFTLGVBQWUsUUFBUSxhQUFhO0FBQzdDLFNBQVMsU0FBUyxRQUFRLGlCQUFpQjtBQUUzQzs7Ozs7Ozs7Ozs7Ozs7Q0FjQyxHQUNELE9BQU8sU0FBUyxLQUFLLEdBQUcsS0FBZTtFQUNyQyxNQUFNLE9BQU8sQ0FBQyxDQUFDLE9BQVMsV0FBVztFQUNuQyxRQUFRLE1BQU0sTUFBTSxDQUFDLENBQUMsT0FBUyxLQUFLLE1BQU0sR0FBRztFQUM3QyxJQUFJLE1BQU0sTUFBTSxLQUFLLEdBQUcsT0FBTztFQUUvQix5RUFBeUU7RUFDekUsb0RBQW9EO0VBQ3BELEVBQUU7RUFDRixvRUFBb0U7RUFDcEUsbUVBQW1FO0VBQ25FLHlFQUF5RTtFQUN6RSx5Q0FBeUM7RUFDekMsRUFBRTtFQUNGLHVFQUF1RTtFQUN2RSxnRUFBZ0U7RUFDaEUsb0VBQW9FO0VBQ3BFLCtDQUErQztFQUMvQyw0REFBNEQ7RUFDNUQsSUFBSSxlQUFlO0VBQ25CLElBQUksYUFBYTtFQUNqQixNQUFNLFlBQVksS0FBSyxDQUFDLEVBQUU7RUFDMUIsSUFBSSxnQkFBZ0IsVUFBVSxVQUFVLENBQUMsS0FBSztJQUM1QyxFQUFFO0lBQ0YsTUFBTSxXQUFXLFVBQVUsTUFBTTtJQUNqQyxJQUFJLFdBQVcsR0FBRztNQUNoQixJQUFJLGdCQUFnQixVQUFVLFVBQVUsQ0FBQyxLQUFLO1FBQzVDLEVBQUU7UUFDRixJQUFJLFdBQVcsR0FBRztVQUNoQixJQUFJLGdCQUFnQixVQUFVLFVBQVUsQ0FBQyxLQUFLLEVBQUU7ZUFDM0M7WUFDSCwwQ0FBMEM7WUFDMUMsZUFBZTtVQUNqQjtRQUNGO01BQ0Y7SUFDRjtFQUNGO0VBQ0EsSUFBSSxTQUFTLE1BQU0sSUFBSSxDQUFDO0VBQ3hCLElBQUksY0FBYztJQUNoQix1REFBdUQ7SUFDdkQsTUFBTyxhQUFhLE9BQU8sTUFBTSxFQUFFLEVBQUUsV0FBWTtNQUMvQyxJQUFJLENBQUMsZ0JBQWdCLE9BQU8sVUFBVSxDQUFDLGNBQWM7SUFDdkQ7SUFFQSxnQ0FBZ0M7SUFDaEMsSUFBSSxjQUFjLEdBQUcsU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLEtBQUssQ0FBQyxhQUFhO0VBQy9EO0VBRUEsT0FBTyxVQUFVO0FBQ25CIn0=
// denoCacheMetadata=4601173819820608725,2225031798529801705