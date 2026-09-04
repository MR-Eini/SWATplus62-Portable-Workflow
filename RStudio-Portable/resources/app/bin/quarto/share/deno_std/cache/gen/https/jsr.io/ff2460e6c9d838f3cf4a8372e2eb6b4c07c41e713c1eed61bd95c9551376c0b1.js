// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { encodeWhitespace } from "../_common/to_file_url.ts";
import { isAbsolute } from "./is_absolute.ts";
/**
 * Converts a path string to a file URL.
 *
 * ```ts
 * import { toFileUrl } from "@std/path/posix/to-file-url";
 *
 * toFileUrl("/home/foo"); // new URL("file:///home/foo")
 * ```
 * @param path to convert to file URL
 */ export function toFileUrl(path) {
  if (!isAbsolute(path)) {
    throw new TypeError("Must be an absolute path.");
  }
  const url = new URL("file:///");
  url.pathname = encodeWhitespace(path.replace(/%/g, "%25").replace(/\\/g, "%5C"));
  return url;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3Bvc2l4L3RvX2ZpbGVfdXJsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGVuY29kZVdoaXRlc3BhY2UgfSBmcm9tIFwiLi4vX2NvbW1vbi90b19maWxlX3VybC50c1wiO1xuaW1wb3J0IHsgaXNBYnNvbHV0ZSB9IGZyb20gXCIuL2lzX2Fic29sdXRlLnRzXCI7XG5cbi8qKlxuICogQ29udmVydHMgYSBwYXRoIHN0cmluZyB0byBhIGZpbGUgVVJMLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB0b0ZpbGVVcmwgfSBmcm9tIFwiQHN0ZC9wYXRoL3Bvc2l4L3RvLWZpbGUtdXJsXCI7XG4gKlxuICogdG9GaWxlVXJsKFwiL2hvbWUvZm9vXCIpOyAvLyBuZXcgVVJMKFwiZmlsZTovLy9ob21lL2Zvb1wiKVxuICogYGBgXG4gKiBAcGFyYW0gcGF0aCB0byBjb252ZXJ0IHRvIGZpbGUgVVJMXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0ZpbGVVcmwocGF0aDogc3RyaW5nKTogVVJMIHtcbiAgaWYgKCFpc0Fic29sdXRlKHBhdGgpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk11c3QgYmUgYW4gYWJzb2x1dGUgcGF0aC5cIik7XG4gIH1cblxuICBjb25zdCB1cmwgPSBuZXcgVVJMKFwiZmlsZTovLy9cIik7XG4gIHVybC5wYXRobmFtZSA9IGVuY29kZVdoaXRlc3BhY2UoXG4gICAgcGF0aC5yZXBsYWNlKC8lL2csIFwiJTI1XCIpLnJlcGxhY2UoL1xcXFwvZywgXCIlNUNcIiksXG4gICk7XG4gIHJldHVybiB1cmw7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLGdCQUFnQixRQUFRLDRCQUE0QjtBQUM3RCxTQUFTLFVBQVUsUUFBUSxtQkFBbUI7QUFFOUM7Ozs7Ozs7OztDQVNDLEdBQ0QsT0FBTyxTQUFTLFVBQVUsSUFBWTtFQUNwQyxJQUFJLENBQUMsV0FBVyxPQUFPO0lBQ3JCLE1BQU0sSUFBSSxVQUFVO0VBQ3RCO0VBRUEsTUFBTSxNQUFNLElBQUksSUFBSTtFQUNwQixJQUFJLFFBQVEsR0FBRyxpQkFDYixLQUFLLE9BQU8sQ0FBQyxNQUFNLE9BQU8sT0FBTyxDQUFDLE9BQU87RUFFM0MsT0FBTztBQUNUIn0=
// denoCacheMetadata=7538119788785808341,16639817966005199953