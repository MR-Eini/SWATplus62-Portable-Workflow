// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { writeAll } from "./write_all.ts";
import { isCloser } from "./_common.ts";
/**
 * Create a {@linkcode WritableStream} from a {@linkcode Writer}.
 *
 * @example Usage
 * ```ts no-assert
 * import { toWritableStream } from "@std/io/to-writable-stream";
 *
 * await ReadableStream.from(["Hello World"])
 *   .pipeThrough(new TextEncoderStream())
 *   .pipeTo(toWritableStream(Deno.stdout));
 * ```
 *
 * @param writer The writer to write to
 * @param options The options
 * @returns The writable stream
 */ export function toWritableStream(writer, options) {
  const { autoClose = true } = options ?? {};
  return new WritableStream({
    async write (chunk, controller) {
      try {
        await writeAll(writer, chunk);
      } catch (e) {
        controller.error(e);
        if (isCloser(writer) && autoClose) {
          writer.close();
        }
      }
    },
    close () {
      if (isCloser(writer) && autoClose) {
        writer.close();
      }
    },
    abort () {
      if (isCloser(writer) && autoClose) {
        writer.close();
      }
    }
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC90b193cml0YWJsZV9zdHJlYW0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgd3JpdGVBbGwgfSBmcm9tIFwiLi93cml0ZV9hbGwudHNcIjtcbmltcG9ydCB0eXBlIHsgV3JpdGVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IGlzQ2xvc2VyIH0gZnJvbSBcIi4vX2NvbW1vbi50c1wiO1xuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSB0b1dyaXRhYmxlU3RyZWFtfS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgdG9Xcml0YWJsZVN0cmVhbU9wdGlvbnMge1xuICAvKipcbiAgICogSWYgdGhlIGB3cml0ZXJgIGlzIGFsc28gYSBgQ2xvc2VyYCwgYXV0b21hdGljYWxseSBjbG9zZSB0aGUgYHdyaXRlcmBcbiAgICogd2hlbiB0aGUgc3RyZWFtIGlzIGNsb3NlZCwgYWJvcnRlZCwgb3IgYSB3cml0ZSBlcnJvciBvY2N1cnMuXG4gICAqXG4gICAqIEBkZWZhdWx0IHt0cnVlfVxuICAgKi9cbiAgYXV0b0Nsb3NlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSB7QGxpbmtjb2RlIFdyaXRhYmxlU3RyZWFtfSBmcm9tIGEge0BsaW5rY29kZSBXcml0ZXJ9LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHRvV3JpdGFibGVTdHJlYW0gfSBmcm9tIFwiQHN0ZC9pby90by13cml0YWJsZS1zdHJlYW1cIjtcbiAqXG4gKiBhd2FpdCBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcIkhlbGxvIFdvcmxkXCJdKVxuICogICAucGlwZVRocm91Z2gobmV3IFRleHRFbmNvZGVyU3RyZWFtKCkpXG4gKiAgIC5waXBlVG8odG9Xcml0YWJsZVN0cmVhbShEZW5vLnN0ZG91dCkpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHdyaXRlciBUaGUgd3JpdGVyIHRvIHdyaXRlIHRvXG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgb3B0aW9uc1xuICogQHJldHVybnMgVGhlIHdyaXRhYmxlIHN0cmVhbVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9Xcml0YWJsZVN0cmVhbShcbiAgd3JpdGVyOiBXcml0ZXIsXG4gIG9wdGlvbnM/OiB0b1dyaXRhYmxlU3RyZWFtT3B0aW9ucyxcbik6IFdyaXRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+IHtcbiAgY29uc3QgeyBhdXRvQ2xvc2UgPSB0cnVlIH0gPSBvcHRpb25zID8/IHt9O1xuXG4gIHJldHVybiBuZXcgV3JpdGFibGVTdHJlYW0oe1xuICAgIGFzeW5jIHdyaXRlKGNodW5rLCBjb250cm9sbGVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB3cml0ZUFsbCh3cml0ZXIsIGNodW5rKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29udHJvbGxlci5lcnJvcihlKTtcbiAgICAgICAgaWYgKGlzQ2xvc2VyKHdyaXRlcikgJiYgYXV0b0Nsb3NlKSB7XG4gICAgICAgICAgd3JpdGVyLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGNsb3NlKCkge1xuICAgICAgaWYgKGlzQ2xvc2VyKHdyaXRlcikgJiYgYXV0b0Nsb3NlKSB7XG4gICAgICAgIHdyaXRlci5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWJvcnQoKSB7XG4gICAgICBpZiAoaXNDbG9zZXIod3JpdGVyKSAmJiBhdXRvQ2xvc2UpIHtcbiAgICAgICAgd3JpdGVyLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFFBQVEsUUFBUSxpQkFBaUI7QUFFMUMsU0FBUyxRQUFRLFFBQVEsZUFBZTtBQWF4Qzs7Ozs7Ozs7Ozs7Ozs7O0NBZUMsR0FDRCxPQUFPLFNBQVMsaUJBQ2QsTUFBYyxFQUNkLE9BQWlDO0VBRWpDLE1BQU0sRUFBRSxZQUFZLElBQUksRUFBRSxHQUFHLFdBQVcsQ0FBQztFQUV6QyxPQUFPLElBQUksZUFBZTtJQUN4QixNQUFNLE9BQU0sS0FBSyxFQUFFLFVBQVU7TUFDM0IsSUFBSTtRQUNGLE1BQU0sU0FBUyxRQUFRO01BQ3pCLEVBQUUsT0FBTyxHQUFHO1FBQ1YsV0FBVyxLQUFLLENBQUM7UUFDakIsSUFBSSxTQUFTLFdBQVcsV0FBVztVQUNqQyxPQUFPLEtBQUs7UUFDZDtNQUNGO0lBQ0Y7SUFDQTtNQUNFLElBQUksU0FBUyxXQUFXLFdBQVc7UUFDakMsT0FBTyxLQUFLO01BQ2Q7SUFDRjtJQUNBO01BQ0UsSUFBSSxTQUFTLFdBQVcsV0FBVztRQUNqQyxPQUFPLEtBQUs7TUFDZDtJQUNGO0VBQ0Y7QUFDRiJ9
// denoCacheMetadata=780683488202789367,5590566391913960187