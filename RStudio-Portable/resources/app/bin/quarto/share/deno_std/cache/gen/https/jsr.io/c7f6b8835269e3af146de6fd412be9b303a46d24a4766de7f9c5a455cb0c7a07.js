// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isPosixPathSeparator } from "./_util.ts";
import { resolve } from "./resolve.ts";
import { assertArgs } from "../_common/relative.ts";
/**
 * Return the relative path from `from` to `to` based on current working directory.
 *
 * If `from` and `to` are the same, return an empty string.
 *
 * @example Usage
 * ```ts
 * import { relative } from "@std/path/posix/relative";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const path = relative("/data/orandea/test/aaa", "/data/orandea/impl/bbb");
 * assertEquals(path, "../../impl/bbb");
 * ```
 *
 * @param from The path to start from.
 * @param to The path to reach.
 * @returns The relative path.
 */ export function relative(from, to) {
  assertArgs(from, to);
  from = resolve(from);
  to = resolve(to);
  if (from === to) return "";
  // Trim any leading backslashes
  let fromStart = 1;
  const fromEnd = from.length;
  for(; fromStart < fromEnd; ++fromStart){
    if (!isPosixPathSeparator(from.charCodeAt(fromStart))) break;
  }
  const fromLen = fromEnd - fromStart;
  // Trim any leading backslashes
  let toStart = 1;
  const toEnd = to.length;
  for(; toStart < toEnd; ++toStart){
    if (!isPosixPathSeparator(to.charCodeAt(toStart))) break;
  }
  const toLen = toEnd - toStart;
  // Compare paths to find the longest common path from root
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i = 0;
  for(; i <= length; ++i){
    if (i === length) {
      if (toLen > length) {
        if (isPosixPathSeparator(to.charCodeAt(toStart + i))) {
          // We get here if `from` is the exact base path for `to`.
          // For example: from='/foo/bar'; to='/foo/bar/baz'
          return to.slice(toStart + i + 1);
        } else if (i === 0) {
          // We get here if `from` is the root
          // For example: from='/'; to='/foo'
          return to.slice(toStart + i);
        }
      } else if (fromLen > length) {
        if (isPosixPathSeparator(from.charCodeAt(fromStart + i))) {
          // We get here if `to` is the exact base path for `from`.
          // For example: from='/foo/bar/baz'; to='/foo/bar'
          lastCommonSep = i;
        } else if (i === 0) {
          // We get here if `to` is the root.
          // For example: from='/foo'; to='/'
          lastCommonSep = 0;
        }
      }
      break;
    }
    const fromCode = from.charCodeAt(fromStart + i);
    const toCode = to.charCodeAt(toStart + i);
    if (fromCode !== toCode) break;
    else if (isPosixPathSeparator(fromCode)) lastCommonSep = i;
  }
  let out = "";
  // Generate the relative path based on the path difference between `to`
  // and `from`
  for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
    if (i === fromEnd || isPosixPathSeparator(from.charCodeAt(i))) {
      if (out.length === 0) out += "..";
      else out += "/..";
    }
  }
  // Lastly, append the rest of the destination (`to`) path that comes after
  // the common path parts
  if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
  else {
    toStart += lastCommonSep;
    if (isPosixPathSeparator(to.charCodeAt(toStart))) ++toStart;
    return to.slice(toStart);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjAuMC1yYy4yL3Bvc2l4L3JlbGF0aXZlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGlzUG9zaXhQYXRoU2VwYXJhdG9yIH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwiLi9yZXNvbHZlLnRzXCI7XG5pbXBvcnQgeyBhc3NlcnRBcmdzIH0gZnJvbSBcIi4uL19jb21tb24vcmVsYXRpdmUudHNcIjtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHJlbGF0aXZlIHBhdGggZnJvbSBgZnJvbWAgdG8gYHRvYCBiYXNlZCBvbiBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlxuICpcbiAqIElmIGBmcm9tYCBhbmQgYHRvYCBhcmUgdGhlIHNhbWUsIHJldHVybiBhbiBlbXB0eSBzdHJpbmcuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyByZWxhdGl2ZSB9IGZyb20gXCJAc3RkL3BhdGgvcG9zaXgvcmVsYXRpdmVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgcGF0aCA9IHJlbGF0aXZlKFwiL2RhdGEvb3JhbmRlYS90ZXN0L2FhYVwiLCBcIi9kYXRhL29yYW5kZWEvaW1wbC9iYmJcIik7XG4gKiBhc3NlcnRFcXVhbHMocGF0aCwgXCIuLi8uLi9pbXBsL2JiYlwiKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBmcm9tIFRoZSBwYXRoIHRvIHN0YXJ0IGZyb20uXG4gKiBAcGFyYW0gdG8gVGhlIHBhdGggdG8gcmVhY2guXG4gKiBAcmV0dXJucyBUaGUgcmVsYXRpdmUgcGF0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbGF0aXZlKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gIGFzc2VydEFyZ3MoZnJvbSwgdG8pO1xuXG4gIGZyb20gPSByZXNvbHZlKGZyb20pO1xuICB0byA9IHJlc29sdmUodG8pO1xuXG4gIGlmIChmcm9tID09PSB0bykgcmV0dXJuIFwiXCI7XG5cbiAgLy8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xuICBsZXQgZnJvbVN0YXJ0ID0gMTtcbiAgY29uc3QgZnJvbUVuZCA9IGZyb20ubGVuZ3RoO1xuICBmb3IgKDsgZnJvbVN0YXJ0IDwgZnJvbUVuZDsgKytmcm9tU3RhcnQpIHtcbiAgICBpZiAoIWlzUG9zaXhQYXRoU2VwYXJhdG9yKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQpKSkgYnJlYWs7XG4gIH1cbiAgY29uc3QgZnJvbUxlbiA9IGZyb21FbmQgLSBmcm9tU3RhcnQ7XG5cbiAgLy8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xuICBsZXQgdG9TdGFydCA9IDE7XG4gIGNvbnN0IHRvRW5kID0gdG8ubGVuZ3RoO1xuICBmb3IgKDsgdG9TdGFydCA8IHRvRW5kOyArK3RvU3RhcnQpIHtcbiAgICBpZiAoIWlzUG9zaXhQYXRoU2VwYXJhdG9yKHRvLmNoYXJDb2RlQXQodG9TdGFydCkpKSBicmVhaztcbiAgfVxuICBjb25zdCB0b0xlbiA9IHRvRW5kIC0gdG9TdGFydDtcblxuICAvLyBDb21wYXJlIHBhdGhzIHRvIGZpbmQgdGhlIGxvbmdlc3QgY29tbW9uIHBhdGggZnJvbSByb290XG4gIGNvbnN0IGxlbmd0aCA9IGZyb21MZW4gPCB0b0xlbiA/IGZyb21MZW4gOiB0b0xlbjtcbiAgbGV0IGxhc3RDb21tb25TZXAgPSAtMTtcbiAgbGV0IGkgPSAwO1xuICBmb3IgKDsgaSA8PSBsZW5ndGg7ICsraSkge1xuICAgIGlmIChpID09PSBsZW5ndGgpIHtcbiAgICAgIGlmICh0b0xlbiA+IGxlbmd0aCkge1xuICAgICAgICBpZiAoaXNQb3NpeFBhdGhTZXBhcmF0b3IodG8uY2hhckNvZGVBdCh0b1N0YXJ0ICsgaSkpKSB7XG4gICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGB0b2AuXG4gICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28vYmFyJzsgdG89Jy9mb28vYmFyL2JheidcbiAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkgKyAxKTtcbiAgICAgICAgfSBlbHNlIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSByb290XG4gICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy8nOyB0bz0nL2ZvbydcbiAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGZyb21MZW4gPiBsZW5ndGgpIHtcbiAgICAgICAgaWYgKGlzUG9zaXhQYXRoU2VwYXJhdG9yKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKSkpIHtcbiAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgdG9gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGBmcm9tYC5cbiAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvby9iYXIvYmF6JzsgdG89Jy9mb28vYmFyJ1xuICAgICAgICAgIGxhc3RDb21tb25TZXAgPSBpO1xuICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgdG9gIGlzIHRoZSByb290LlxuICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vJzsgdG89Jy8nXG4gICAgICAgICAgbGFzdENvbW1vblNlcCA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjb25zdCBmcm9tQ29kZSA9IGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKTtcbiAgICBjb25zdCB0b0NvZGUgPSB0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKTtcbiAgICBpZiAoZnJvbUNvZGUgIT09IHRvQ29kZSkgYnJlYWs7XG4gICAgZWxzZSBpZiAoaXNQb3NpeFBhdGhTZXBhcmF0b3IoZnJvbUNvZGUpKSBsYXN0Q29tbW9uU2VwID0gaTtcbiAgfVxuXG4gIGxldCBvdXQgPSBcIlwiO1xuICAvLyBHZW5lcmF0ZSB0aGUgcmVsYXRpdmUgcGF0aCBiYXNlZCBvbiB0aGUgcGF0aCBkaWZmZXJlbmNlIGJldHdlZW4gYHRvYFxuICAvLyBhbmQgYGZyb21gXG4gIGZvciAoaSA9IGZyb21TdGFydCArIGxhc3RDb21tb25TZXAgKyAxOyBpIDw9IGZyb21FbmQ7ICsraSkge1xuICAgIGlmIChpID09PSBmcm9tRW5kIHx8IGlzUG9zaXhQYXRoU2VwYXJhdG9yKGZyb20uY2hhckNvZGVBdChpKSkpIHtcbiAgICAgIGlmIChvdXQubGVuZ3RoID09PSAwKSBvdXQgKz0gXCIuLlwiO1xuICAgICAgZWxzZSBvdXQgKz0gXCIvLi5cIjtcbiAgICB9XG4gIH1cblxuICAvLyBMYXN0bHksIGFwcGVuZCB0aGUgcmVzdCBvZiB0aGUgZGVzdGluYXRpb24gKGB0b2ApIHBhdGggdGhhdCBjb21lcyBhZnRlclxuICAvLyB0aGUgY29tbW9uIHBhdGggcGFydHNcbiAgaWYgKG91dC5sZW5ndGggPiAwKSByZXR1cm4gb3V0ICsgdG8uc2xpY2UodG9TdGFydCArIGxhc3RDb21tb25TZXApO1xuICBlbHNlIHtcbiAgICB0b1N0YXJ0ICs9IGxhc3RDb21tb25TZXA7XG4gICAgaWYgKGlzUG9zaXhQYXRoU2VwYXJhdG9yKHRvLmNoYXJDb2RlQXQodG9TdGFydCkpKSArK3RvU3RhcnQ7XG4gICAgcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQpO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFB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
// denoCacheMetadata=785850630008785675,16049999044822231383