// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// Copyright the Browserify authors. MIT License.
import { SEPARATOR } from "jsr:/@std/path@^0.224.0/constants";
import { toPathString } from "./_to_path_string.ts";
/**
 * Test whether or not `dest` is a sub-directory of `src`
 * @param src src file path
 * @param dest dest file path
 * @param sep path separator
 */ export function isSubdir(src, dest, sep = SEPARATOR) {
  if (src === dest) {
    return false;
  }
  src = toPathString(src);
  const srcArray = src.split(sep);
  dest = toPathString(dest);
  const destArray = dest.split(sep);
  return srcArray.every((current, i)=>destArray[i] === current);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC9faXNfc3ViZGlyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgdGhlIEJyb3dzZXJpZnkgYXV0aG9ycy4gTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IFNFUEFSQVRPUiB9IGZyb20gXCJqc3I6L0BzdGQvcGF0aEBeMC4yMjQuMC9jb25zdGFudHNcIjtcbmltcG9ydCB7IHRvUGF0aFN0cmluZyB9IGZyb20gXCIuL190b19wYXRoX3N0cmluZy50c1wiO1xuXG4vKipcbiAqIFRlc3Qgd2hldGhlciBvciBub3QgYGRlc3RgIGlzIGEgc3ViLWRpcmVjdG9yeSBvZiBgc3JjYFxuICogQHBhcmFtIHNyYyBzcmMgZmlsZSBwYXRoXG4gKiBAcGFyYW0gZGVzdCBkZXN0IGZpbGUgcGF0aFxuICogQHBhcmFtIHNlcCBwYXRoIHNlcGFyYXRvclxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTdWJkaXIoXG4gIHNyYzogc3RyaW5nIHwgVVJMLFxuICBkZXN0OiBzdHJpbmcgfCBVUkwsXG4gIHNlcCA9IFNFUEFSQVRPUixcbik6IGJvb2xlYW4ge1xuICBpZiAoc3JjID09PSBkZXN0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHNyYyA9IHRvUGF0aFN0cmluZyhzcmMpO1xuICBjb25zdCBzcmNBcnJheSA9IHNyYy5zcGxpdChzZXApO1xuICBkZXN0ID0gdG9QYXRoU3RyaW5nKGRlc3QpO1xuICBjb25zdCBkZXN0QXJyYXkgPSBkZXN0LnNwbGl0KHNlcCk7XG4gIHJldHVybiBzcmNBcnJheS5ldmVyeSgoY3VycmVudCwgaSkgPT4gZGVzdEFycmF5W2ldID09PSBjdXJyZW50KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsaURBQWlEO0FBRWpELFNBQVMsU0FBUyxRQUFRLG9DQUFvQztBQUM5RCxTQUFTLFlBQVksUUFBUSx1QkFBdUI7QUFFcEQ7Ozs7O0NBS0MsR0FDRCxPQUFPLFNBQVMsU0FDZCxHQUFpQixFQUNqQixJQUFrQixFQUNsQixNQUFNLFNBQVM7RUFFZixJQUFJLFFBQVEsTUFBTTtJQUNoQixPQUFPO0VBQ1Q7RUFDQSxNQUFNLGFBQWE7RUFDbkIsTUFBTSxXQUFXLElBQUksS0FBSyxDQUFDO0VBQzNCLE9BQU8sYUFBYTtFQUNwQixNQUFNLFlBQVksS0FBSyxLQUFLLENBQUM7RUFDN0IsT0FBTyxTQUFTLEtBQUssQ0FBQyxDQUFDLFNBQVMsSUFBTSxTQUFTLENBQUMsRUFBRSxLQUFLO0FBQ3pEIn0=
// denoCacheMetadata=9465883141190098023,50826422111643072