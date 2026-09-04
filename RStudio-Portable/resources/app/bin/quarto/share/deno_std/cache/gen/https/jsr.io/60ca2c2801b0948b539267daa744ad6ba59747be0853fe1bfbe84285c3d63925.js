// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { normalize } from "./normalize.ts";
import { SEPARATOR_PATTERN } from "./constants.ts";
/** Like normalize(), but doesn't collapse "**\/.." when `globstar` is true. */ export function normalizeGlob(glob, { globstar = false } = {}) {
  if (glob.match(/\0/g)) {
    throw new Error(`Glob contains invalid characters: "${glob}"`);
  }
  if (!globstar) {
    return normalize(glob);
  }
  const s = SEPARATOR_PATTERN.source;
  const badParentPattern = new RegExp(`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`, "g");
  return normalize(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3Bvc2l4L25vcm1hbGl6ZV9nbG9iLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB0eXBlIHsgR2xvYk9wdGlvbnMgfSBmcm9tIFwiLi4vX2NvbW1vbi9nbG9iX3RvX3JlZ19leHAudHNcIjtcbmltcG9ydCB7IG5vcm1hbGl6ZSB9IGZyb20gXCIuL25vcm1hbGl6ZS50c1wiO1xuaW1wb3J0IHsgU0VQQVJBVE9SX1BBVFRFUk4gfSBmcm9tIFwiLi9jb25zdGFudHMudHNcIjtcblxuZXhwb3J0IHR5cGUgeyBHbG9iT3B0aW9ucyB9O1xuXG4vKiogTGlrZSBub3JtYWxpemUoKSwgYnV0IGRvZXNuJ3QgY29sbGFwc2UgXCIqKlxcLy4uXCIgd2hlbiBgZ2xvYnN0YXJgIGlzIHRydWUuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplR2xvYihcbiAgZ2xvYjogc3RyaW5nLFxuICB7IGdsb2JzdGFyID0gZmFsc2UgfTogR2xvYk9wdGlvbnMgPSB7fSxcbik6IHN0cmluZyB7XG4gIGlmIChnbG9iLm1hdGNoKC9cXDAvZykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEdsb2IgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzOiBcIiR7Z2xvYn1cImApO1xuICB9XG4gIGlmICghZ2xvYnN0YXIpIHtcbiAgICByZXR1cm4gbm9ybWFsaXplKGdsb2IpO1xuICB9XG4gIGNvbnN0IHMgPSBTRVBBUkFUT1JfUEFUVEVSTi5zb3VyY2U7XG4gIGNvbnN0IGJhZFBhcmVudFBhdHRlcm4gPSBuZXcgUmVnRXhwKFxuICAgIGAoPzw9KCR7c318XilcXFxcKlxcXFwqJHtzfSlcXFxcLlxcXFwuKD89JHtzfXwkKWAsXG4gICAgXCJnXCIsXG4gICk7XG4gIHJldHVybiBub3JtYWxpemUoZ2xvYi5yZXBsYWNlKGJhZFBhcmVudFBhdHRlcm4sIFwiXFwwXCIpKS5yZXBsYWNlKC9cXDAvZywgXCIuLlwiKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBR3JDLFNBQVMsU0FBUyxRQUFRLGlCQUFpQjtBQUMzQyxTQUFTLGlCQUFpQixRQUFRLGlCQUFpQjtBQUluRCw2RUFBNkUsR0FDN0UsT0FBTyxTQUFTLGNBQ2QsSUFBWSxFQUNaLEVBQUUsV0FBVyxLQUFLLEVBQWUsR0FBRyxDQUFDLENBQUM7RUFFdEMsSUFBSSxLQUFLLEtBQUssQ0FBQyxRQUFRO0lBQ3JCLE1BQU0sSUFBSSxNQUFNLENBQUMsbUNBQW1DLEVBQUUsS0FBSyxDQUFDLENBQUM7RUFDL0Q7RUFDQSxJQUFJLENBQUMsVUFBVTtJQUNiLE9BQU8sVUFBVTtFQUNuQjtFQUNBLE1BQU0sSUFBSSxrQkFBa0IsTUFBTTtFQUNsQyxNQUFNLG1CQUFtQixJQUFJLE9BQzNCLENBQUMsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQ3pDO0VBRUYsT0FBTyxVQUFVLEtBQUssT0FBTyxDQUFDLGtCQUFrQixPQUFPLE9BQU8sQ0FBQyxPQUFPO0FBQ3hFIn0=
// denoCacheMetadata=7744280443030031126,7419318100652221730