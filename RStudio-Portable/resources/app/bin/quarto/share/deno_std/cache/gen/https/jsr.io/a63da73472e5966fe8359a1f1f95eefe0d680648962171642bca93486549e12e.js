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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3Bvc2l4L2pvaW5fZ2xvYnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHR5cGUgeyBHbG9iT3B0aW9ucyB9IGZyb20gXCIuLi9fY29tbW9uL2dsb2JfdG9fcmVnX2V4cC50c1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCIuL2pvaW4udHNcIjtcbmltcG9ydCB7IFNFUEFSQVRPUiB9IGZyb20gXCIuL2NvbnN0YW50cy50c1wiO1xuaW1wb3J0IHsgbm9ybWFsaXplR2xvYiB9IGZyb20gXCIuL25vcm1hbGl6ZV9nbG9iLnRzXCI7XG5cbmV4cG9ydCB0eXBlIHsgR2xvYk9wdGlvbnMgfTtcblxuLyoqIExpa2Ugam9pbigpLCBidXQgZG9lc24ndCBjb2xsYXBzZSBcIioqXFwvLi5cIiB3aGVuIGBnbG9ic3RhcmAgaXMgdHJ1ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBqb2luR2xvYnMoXG4gIGdsb2JzOiBzdHJpbmdbXSxcbiAgeyBleHRlbmRlZCA9IHRydWUsIGdsb2JzdGFyID0gZmFsc2UgfTogR2xvYk9wdGlvbnMgPSB7fSxcbik6IHN0cmluZyB7XG4gIGlmICghZ2xvYnN0YXIgfHwgZ2xvYnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGpvaW4oLi4uZ2xvYnMpO1xuICB9XG4gIGlmIChnbG9icy5sZW5ndGggPT09IDApIHJldHVybiBcIi5cIjtcbiAgbGV0IGpvaW5lZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBmb3IgKGNvbnN0IGdsb2Igb2YgZ2xvYnMpIHtcbiAgICBjb25zdCBwYXRoID0gZ2xvYjtcbiAgICBpZiAocGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoIWpvaW5lZCkgam9pbmVkID0gcGF0aDtcbiAgICAgIGVsc2Ugam9pbmVkICs9IGAke1NFUEFSQVRPUn0ke3BhdGh9YDtcbiAgICB9XG4gIH1cbiAgaWYgKCFqb2luZWQpIHJldHVybiBcIi5cIjtcbiAgcmV0dXJuIG5vcm1hbGl6ZUdsb2Ioam9pbmVkLCB7IGV4dGVuZGVkLCBnbG9ic3RhciB9KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBR3JDLFNBQVMsSUFBSSxRQUFRLFlBQVk7QUFDakMsU0FBUyxTQUFTLFFBQVEsaUJBQWlCO0FBQzNDLFNBQVMsYUFBYSxRQUFRLHNCQUFzQjtBQUlwRCx3RUFBd0UsR0FDeEUsT0FBTyxTQUFTLFVBQ2QsS0FBZSxFQUNmLEVBQUUsV0FBVyxJQUFJLEVBQUUsV0FBVyxLQUFLLEVBQWUsR0FBRyxDQUFDLENBQUM7RUFFdkQsSUFBSSxDQUFDLFlBQVksTUFBTSxNQUFNLEtBQUssR0FBRztJQUNuQyxPQUFPLFFBQVE7RUFDakI7RUFDQSxJQUFJLE1BQU0sTUFBTSxLQUFLLEdBQUcsT0FBTztFQUMvQixJQUFJO0VBQ0osS0FBSyxNQUFNLFFBQVEsTUFBTztJQUN4QixNQUFNLE9BQU87SUFDYixJQUFJLEtBQUssTUFBTSxHQUFHLEdBQUc7TUFDbkIsSUFBSSxDQUFDLFFBQVEsU0FBUztXQUNqQixVQUFVLEdBQUcsWUFBWSxNQUFNO0lBQ3RDO0VBQ0Y7RUFDQSxJQUFJLENBQUMsUUFBUSxPQUFPO0VBQ3BCLE9BQU8sY0FBYyxRQUFRO0lBQUU7SUFBVTtFQUFTO0FBQ3BEIn0=
// denoCacheMetadata=3673901116555486993,11408108383832075811