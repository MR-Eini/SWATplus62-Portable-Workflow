// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { concat } from "jsr:@std/bytes@^1.0.2/concat";
/** Generate longest proper prefix which is also suffix array. */ function createLPS(pat) {
  const lps = new Uint8Array(pat.length);
  lps[0] = 0;
  let prefixEnd = 0;
  let i = 1;
  while(i < lps.length){
    if (pat[i] === pat[prefixEnd]) {
      prefixEnd++;
      lps[i] = prefixEnd;
      i++;
    } else if (prefixEnd === 0) {
      lps[i] = 0;
      i++;
    } else {
      prefixEnd = lps[prefixEnd - 1];
    }
  }
  return lps;
}
/**
 * Read delimited bytes from a {@linkcode Reader} through an
 * {@linkcode AsyncIterableIterator} of {@linkcode Uint8Array}.
 *
 * @example Usage
 * ```ts
 * import { readDelim } from "@std/io/read-delim";
 * import { assert } from "@std/assert/assert"
 *
 * const fileReader = await Deno.open("README.md");
 * for await (const chunk of readDelim(fileReader, new TextEncoder().encode("\n"))) {
 *   assert(chunk instanceof Uint8Array);
 * }
 * ```
 *
 * @param reader The reader to read from
 * @param delim The delimiter to read until
 * @returns The {@linkcode AsyncIterableIterator} of {@linkcode Uint8Array}s.
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export async function* readDelim(reader, delim) {
  // Avoid unicode problems
  const delimLen = delim.length;
  const delimLPS = createLPS(delim);
  let chunks = new Uint8Array();
  const bufSize = Math.max(1024, delimLen + 1);
  // Modified KMP
  let inspectIndex = 0;
  let matchIndex = 0;
  while(true){
    const inspectArr = new Uint8Array(bufSize);
    const result = await reader.read(inspectArr);
    if (result === null) {
      // Yield last chunk.
      yield chunks;
      return;
    } else if (result < 0) {
      // Discard all remaining and silently fail.
      return;
    }
    chunks = concat([
      chunks,
      inspectArr.slice(0, result)
    ]);
    let localIndex = 0;
    while(inspectIndex < chunks.length){
      if (inspectArr[localIndex] === delim[matchIndex]) {
        inspectIndex++;
        localIndex++;
        matchIndex++;
        if (matchIndex === delimLen) {
          // Full match
          const matchEnd = inspectIndex - delimLen;
          const readyBytes = chunks.slice(0, matchEnd);
          yield readyBytes;
          // Reset match, different from KMP.
          chunks = chunks.slice(inspectIndex);
          inspectIndex = 0;
          matchIndex = 0;
        }
      } else {
        if (matchIndex === 0) {
          inspectIndex++;
          localIndex++;
        } else {
          matchIndex = delimLPS[matchIndex - 1];
        }
      }
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9yZWFkX2RlbGltLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGNvbmNhdCB9IGZyb20gXCJqc3I6QHN0ZC9ieXRlc0BeMS4wLjIvY29uY2F0XCI7XG5pbXBvcnQgdHlwZSB7IFJlYWRlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5cbi8qKiBHZW5lcmF0ZSBsb25nZXN0IHByb3BlciBwcmVmaXggd2hpY2ggaXMgYWxzbyBzdWZmaXggYXJyYXkuICovXG5mdW5jdGlvbiBjcmVhdGVMUFMocGF0OiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIGNvbnN0IGxwcyA9IG5ldyBVaW50OEFycmF5KHBhdC5sZW5ndGgpO1xuICBscHNbMF0gPSAwO1xuICBsZXQgcHJlZml4RW5kID0gMDtcbiAgbGV0IGkgPSAxO1xuICB3aGlsZSAoaSA8IGxwcy5sZW5ndGgpIHtcbiAgICBpZiAocGF0W2ldID09PSBwYXRbcHJlZml4RW5kXSkge1xuICAgICAgcHJlZml4RW5kKys7XG4gICAgICBscHNbaV0gPSBwcmVmaXhFbmQ7XG4gICAgICBpKys7XG4gICAgfSBlbHNlIGlmIChwcmVmaXhFbmQgPT09IDApIHtcbiAgICAgIGxwc1tpXSA9IDA7XG4gICAgICBpKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZWZpeEVuZCA9IGxwc1twcmVmaXhFbmQgLSAxXSE7XG4gICAgfVxuICB9XG4gIHJldHVybiBscHM7XG59XG5cbi8qKlxuICogUmVhZCBkZWxpbWl0ZWQgYnl0ZXMgZnJvbSBhIHtAbGlua2NvZGUgUmVhZGVyfSB0aHJvdWdoIGFuXG4gKiB7QGxpbmtjb2RlIEFzeW5jSXRlcmFibGVJdGVyYXRvcn0gb2Yge0BsaW5rY29kZSBVaW50OEFycmF5fS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHJlYWREZWxpbSB9IGZyb20gXCJAc3RkL2lvL3JlYWQtZGVsaW1cIjtcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnRcIlxuICpcbiAqIGNvbnN0IGZpbGVSZWFkZXIgPSBhd2FpdCBEZW5vLm9wZW4oXCJSRUFETUUubWRcIik7XG4gKiBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHJlYWREZWxpbShmaWxlUmVhZGVyLCBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJcXG5cIikpKSB7XG4gKiAgIGFzc2VydChjaHVuayBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIHJlYWRlciBUaGUgcmVhZGVyIHRvIHJlYWQgZnJvbVxuICogQHBhcmFtIGRlbGltIFRoZSBkZWxpbWl0ZXIgdG8gcmVhZCB1bnRpbFxuICogQHJldHVybnMgVGhlIHtAbGlua2NvZGUgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yfSBvZiB7QGxpbmtjb2RlIFVpbnQ4QXJyYXl9cy5cbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0cmVhbXNfQVBJIHwgV2ViIFN0cmVhbXMgQVBJfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24qIHJlYWREZWxpbShcbiAgcmVhZGVyOiBSZWFkZXIsXG4gIGRlbGltOiBVaW50OEFycmF5LFxuKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFVpbnQ4QXJyYXk+IHtcbiAgLy8gQXZvaWQgdW5pY29kZSBwcm9ibGVtc1xuICBjb25zdCBkZWxpbUxlbiA9IGRlbGltLmxlbmd0aDtcbiAgY29uc3QgZGVsaW1MUFMgPSBjcmVhdGVMUFMoZGVsaW0pO1xuICBsZXQgY2h1bmtzID0gbmV3IFVpbnQ4QXJyYXkoKTtcbiAgY29uc3QgYnVmU2l6ZSA9IE1hdGgubWF4KDEwMjQsIGRlbGltTGVuICsgMSk7XG5cbiAgLy8gTW9kaWZpZWQgS01QXG4gIGxldCBpbnNwZWN0SW5kZXggPSAwO1xuICBsZXQgbWF0Y2hJbmRleCA9IDA7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgY29uc3QgaW5zcGVjdEFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZlNpemUpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlYWRlci5yZWFkKGluc3BlY3RBcnIpO1xuICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICAgIC8vIFlpZWxkIGxhc3QgY2h1bmsuXG4gICAgICB5aWVsZCBjaHVua3M7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChyZXN1bHQgPCAwKSB7XG4gICAgICAvLyBEaXNjYXJkIGFsbCByZW1haW5pbmcgYW5kIHNpbGVudGx5IGZhaWwuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNodW5rcyA9IGNvbmNhdChbY2h1bmtzLCBpbnNwZWN0QXJyLnNsaWNlKDAsIHJlc3VsdCldKTtcbiAgICBsZXQgbG9jYWxJbmRleCA9IDA7XG4gICAgd2hpbGUgKGluc3BlY3RJbmRleCA8IGNodW5rcy5sZW5ndGgpIHtcbiAgICAgIGlmIChpbnNwZWN0QXJyW2xvY2FsSW5kZXhdID09PSBkZWxpbVttYXRjaEluZGV4XSkge1xuICAgICAgICBpbnNwZWN0SW5kZXgrKztcbiAgICAgICAgbG9jYWxJbmRleCsrO1xuICAgICAgICBtYXRjaEluZGV4Kys7XG4gICAgICAgIGlmIChtYXRjaEluZGV4ID09PSBkZWxpbUxlbikge1xuICAgICAgICAgIC8vIEZ1bGwgbWF0Y2hcbiAgICAgICAgICBjb25zdCBtYXRjaEVuZCA9IGluc3BlY3RJbmRleCAtIGRlbGltTGVuO1xuICAgICAgICAgIGNvbnN0IHJlYWR5Qnl0ZXMgPSBjaHVua3Muc2xpY2UoMCwgbWF0Y2hFbmQpO1xuICAgICAgICAgIHlpZWxkIHJlYWR5Qnl0ZXM7XG4gICAgICAgICAgLy8gUmVzZXQgbWF0Y2gsIGRpZmZlcmVudCBmcm9tIEtNUC5cbiAgICAgICAgICBjaHVua3MgPSBjaHVua3Muc2xpY2UoaW5zcGVjdEluZGV4KTtcbiAgICAgICAgICBpbnNwZWN0SW5kZXggPSAwO1xuICAgICAgICAgIG1hdGNoSW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobWF0Y2hJbmRleCA9PT0gMCkge1xuICAgICAgICAgIGluc3BlY3RJbmRleCsrO1xuICAgICAgICAgIGxvY2FsSW5kZXgrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRjaEluZGV4ID0gZGVsaW1MUFNbbWF0Y2hJbmRleCAtIDFdITtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxNQUFNLFFBQVEsK0JBQStCO0FBR3RELCtEQUErRCxHQUMvRCxTQUFTLFVBQVUsR0FBZTtFQUNoQyxNQUFNLE1BQU0sSUFBSSxXQUFXLElBQUksTUFBTTtFQUNyQyxHQUFHLENBQUMsRUFBRSxHQUFHO0VBQ1QsSUFBSSxZQUFZO0VBQ2hCLElBQUksSUFBSTtFQUNSLE1BQU8sSUFBSSxJQUFJLE1BQU0sQ0FBRTtJQUNyQixJQUFJLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLFVBQVUsRUFBRTtNQUM3QjtNQUNBLEdBQUcsQ0FBQyxFQUFFLEdBQUc7TUFDVDtJQUNGLE9BQU8sSUFBSSxjQUFjLEdBQUc7TUFDMUIsR0FBRyxDQUFDLEVBQUUsR0FBRztNQUNUO0lBQ0YsT0FBTztNQUNMLFlBQVksR0FBRyxDQUFDLFlBQVksRUFBRTtJQUNoQztFQUNGO0VBQ0EsT0FBTztBQUNUO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0JDLEdBQ0QsT0FBTyxnQkFBZ0IsVUFDckIsTUFBYyxFQUNkLEtBQWlCO0VBRWpCLHlCQUF5QjtFQUN6QixNQUFNLFdBQVcsTUFBTSxNQUFNO0VBQzdCLE1BQU0sV0FBVyxVQUFVO0VBQzNCLElBQUksU0FBUyxJQUFJO0VBQ2pCLE1BQU0sVUFBVSxLQUFLLEdBQUcsQ0FBQyxNQUFNLFdBQVc7RUFFMUMsZUFBZTtFQUNmLElBQUksZUFBZTtFQUNuQixJQUFJLGFBQWE7RUFDakIsTUFBTyxLQUFNO0lBQ1gsTUFBTSxhQUFhLElBQUksV0FBVztJQUNsQyxNQUFNLFNBQVMsTUFBTSxPQUFPLElBQUksQ0FBQztJQUNqQyxJQUFJLFdBQVcsTUFBTTtNQUNuQixvQkFBb0I7TUFDcEIsTUFBTTtNQUNOO0lBQ0YsT0FBTyxJQUFJLFNBQVMsR0FBRztNQUNyQiwyQ0FBMkM7TUFDM0M7SUFDRjtJQUNBLFNBQVMsT0FBTztNQUFDO01BQVEsV0FBVyxLQUFLLENBQUMsR0FBRztLQUFRO0lBQ3JELElBQUksYUFBYTtJQUNqQixNQUFPLGVBQWUsT0FBTyxNQUFNLENBQUU7TUFDbkMsSUFBSSxVQUFVLENBQUMsV0FBVyxLQUFLLEtBQUssQ0FBQyxXQUFXLEVBQUU7UUFDaEQ7UUFDQTtRQUNBO1FBQ0EsSUFBSSxlQUFlLFVBQVU7VUFDM0IsYUFBYTtVQUNiLE1BQU0sV0FBVyxlQUFlO1VBQ2hDLE1BQU0sYUFBYSxPQUFPLEtBQUssQ0FBQyxHQUFHO1VBQ25DLE1BQU07VUFDTixtQ0FBbUM7VUFDbkMsU0FBUyxPQUFPLEtBQUssQ0FBQztVQUN0QixlQUFlO1VBQ2YsYUFBYTtRQUNmO01BQ0YsT0FBTztRQUNMLElBQUksZUFBZSxHQUFHO1VBQ3BCO1VBQ0E7UUFDRixPQUFPO1VBQ0wsYUFBYSxRQUFRLENBQUMsYUFBYSxFQUFFO1FBQ3ZDO01BQ0Y7SUFDRjtFQUNGO0FBQ0YifQ==
// denoCacheMetadata=10081105226378787019,16696867260272337565