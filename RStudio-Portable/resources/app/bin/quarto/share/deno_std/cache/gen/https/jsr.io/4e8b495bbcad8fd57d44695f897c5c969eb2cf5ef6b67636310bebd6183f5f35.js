// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { join } from "./join.ts";
import { SEPARATOR } from "./constants.ts";
import { normalizeGlob } from "./normalize_glob.ts";
/** Like join(), but doesn't collapse "**\/.." when `globstar` is true. */ export function joinGlobs(globs, { extended = true, globstar = false } = {}) {
  if (!globstar || globs.length === 0) {
    return join(...globs);
  }
  if (globs.length === 0) return ".";
  let joined;
  for (const glob of globs){
    const path = glob;
    if (path.length > 0) {
      if (!joined) joined = path;
      else joined += `${SEPARATOR}${path}`;
    }
  }
  if (!joined) return ".";
  return normalizeGlob(joined, {
    extended,
    globstar
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3dpbmRvd3Mvam9pbl9nbG9icy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgdHlwZSB7IEdsb2JPcHRpb25zIH0gZnJvbSBcIi4uL19jb21tb24vZ2xvYl90b19yZWdfZXhwLnRzXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcIi4vam9pbi50c1wiO1xuaW1wb3J0IHsgU0VQQVJBVE9SIH0gZnJvbSBcIi4vY29uc3RhbnRzLnRzXCI7XG5pbXBvcnQgeyBub3JtYWxpemVHbG9iIH0gZnJvbSBcIi4vbm9ybWFsaXplX2dsb2IudHNcIjtcblxuZXhwb3J0IHR5cGUgeyBHbG9iT3B0aW9ucyB9O1xuXG4vKiogTGlrZSBqb2luKCksIGJ1dCBkb2Vzbid0IGNvbGxhcHNlIFwiKipcXC8uLlwiIHdoZW4gYGdsb2JzdGFyYCBpcyB0cnVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGpvaW5HbG9icyhcbiAgZ2xvYnM6IHN0cmluZ1tdLFxuICB7IGV4dGVuZGVkID0gdHJ1ZSwgZ2xvYnN0YXIgPSBmYWxzZSB9OiBHbG9iT3B0aW9ucyA9IHt9LFxuKTogc3RyaW5nIHtcbiAgaWYgKCFnbG9ic3RhciB8fCBnbG9icy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gam9pbiguLi5nbG9icyk7XG4gIH1cbiAgaWYgKGdsb2JzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFwiLlwiO1xuICBsZXQgam9pbmVkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIGZvciAoY29uc3QgZ2xvYiBvZiBnbG9icykge1xuICAgIGNvbnN0IHBhdGggPSBnbG9iO1xuICAgIGlmIChwYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICgham9pbmVkKSBqb2luZWQgPSBwYXRoO1xuICAgICAgZWxzZSBqb2luZWQgKz0gYCR7U0VQQVJBVE9SfSR7cGF0aH1gO1xuICAgIH1cbiAgfVxuICBpZiAoIWpvaW5lZCkgcmV0dXJuIFwiLlwiO1xuICByZXR1cm4gbm9ybWFsaXplR2xvYihqb2luZWQsIHsgZXh0ZW5kZWQsIGdsb2JzdGFyIH0pO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFHckMsU0FBUyxJQUFJLFFBQVEsWUFBWTtBQUNqQyxTQUFTLFNBQVMsUUFBUSxpQkFBaUI7QUFDM0MsU0FBUyxhQUFhLFFBQVEsc0JBQXNCO0FBSXBELHdFQUF3RSxHQUN4RSxPQUFPLFNBQVMsVUFDZCxLQUFlLEVBQ2YsRUFBRSxXQUFXLElBQUksRUFBRSxXQUFXLEtBQUssRUFBZSxHQUFHLENBQUMsQ0FBQztFQUV2RCxJQUFJLENBQUMsWUFBWSxNQUFNLE1BQU0sS0FBSyxHQUFHO0lBQ25DLE9BQU8sUUFBUTtFQUNqQjtFQUNBLElBQUksTUFBTSxNQUFNLEtBQUssR0FBRyxPQUFPO0VBQy9CLElBQUk7RUFDSixLQUFLLE1BQU0sUUFBUSxNQUFPO0lBQ3hCLE1BQU0sT0FBTztJQUNiLElBQUksS0FBSyxNQUFNLEdBQUcsR0FBRztNQUNuQixJQUFJLENBQUMsUUFBUSxTQUFTO1dBQ2pCLFVBQVUsR0FBRyxZQUFZLE1BQU07SUFDdEM7RUFDRjtFQUNBLElBQUksQ0FBQyxRQUFRLE9BQU87RUFDcEIsT0FBTyxjQUFjLFFBQVE7SUFBRTtJQUFVO0VBQVM7QUFDcEQifQ==
// denoCacheMetadata=3673901116555486993,16825087829729939433