// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
const DEFAULT_BUFFER_SIZE = 32 * 1024;
/**
 * Copy N size at the most. If read size is lesser than N, then returns nread
 *
 * @example Usage
 * ```ts
 * import { copyN } from "@std/io/copy-n";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const source = await Deno.open("README.md");
 *
 * const res = await copyN(source, Deno.stdout, 10);
 * assertEquals(res, 10);
 * ```
 *
 * @param r Reader
 * @param dest Writer
 * @param size Read size
 * @returns Number of bytes copied
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export async function copyN(r, dest, size) {
  let bytesRead = 0;
  let buf = new Uint8Array(DEFAULT_BUFFER_SIZE);
  while(bytesRead < size){
    if (size - bytesRead < DEFAULT_BUFFER_SIZE) {
      buf = new Uint8Array(size - bytesRead);
    }
    const result = await r.read(buf);
    const nread = result ?? 0;
    bytesRead += nread;
    if (nread > 0) {
      let n = 0;
      while(n < nread){
        n += await dest.write(buf.slice(n, nread));
      }
      if (n !== nread) {
        throw new Error("Could not write");
      }
    }
    if (result === null) {
      break;
    }
  }
  return bytesRead;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9jb3B5X24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHR5cGUgeyBSZWFkZXIsIFdyaXRlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5cbmNvbnN0IERFRkFVTFRfQlVGRkVSX1NJWkUgPSAzMiAqIDEwMjQ7XG5cbi8qKlxuICogQ29weSBOIHNpemUgYXQgdGhlIG1vc3QuIElmIHJlYWQgc2l6ZSBpcyBsZXNzZXIgdGhhbiBOLCB0aGVuIHJldHVybnMgbnJlYWRcbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNvcHlOIH0gZnJvbSBcIkBzdGQvaW8vY29weS1uXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gYXdhaXQgRGVuby5vcGVuKFwiUkVBRE1FLm1kXCIpO1xuICpcbiAqIGNvbnN0IHJlcyA9IGF3YWl0IGNvcHlOKHNvdXJjZSwgRGVuby5zdGRvdXQsIDEwKTtcbiAqIGFzc2VydEVxdWFscyhyZXMsIDEwKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSByIFJlYWRlclxuICogQHBhcmFtIGRlc3QgV3JpdGVyXG4gKiBAcGFyYW0gc2l6ZSBSZWFkIHNpemVcbiAqIEByZXR1cm5zIE51bWJlciBvZiBieXRlcyBjb3BpZWRcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0cmVhbXNfQVBJIHwgV2ViIFN0cmVhbXMgQVBJfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29weU4oXG4gIHI6IFJlYWRlcixcbiAgZGVzdDogV3JpdGVyLFxuICBzaXplOiBudW1iZXIsXG4pOiBQcm9taXNlPG51bWJlcj4ge1xuICBsZXQgYnl0ZXNSZWFkID0gMDtcbiAgbGV0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KERFRkFVTFRfQlVGRkVSX1NJWkUpO1xuICB3aGlsZSAoYnl0ZXNSZWFkIDwgc2l6ZSkge1xuICAgIGlmIChzaXplIC0gYnl0ZXNSZWFkIDwgREVGQVVMVF9CVUZGRVJfU0laRSkge1xuICAgICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSAtIGJ5dGVzUmVhZCk7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHIucmVhZChidWYpO1xuICAgIGNvbnN0IG5yZWFkID0gcmVzdWx0ID8/IDA7XG4gICAgYnl0ZXNSZWFkICs9IG5yZWFkO1xuICAgIGlmIChucmVhZCA+IDApIHtcbiAgICAgIGxldCBuID0gMDtcbiAgICAgIHdoaWxlIChuIDwgbnJlYWQpIHtcbiAgICAgICAgbiArPSBhd2FpdCBkZXN0LndyaXRlKGJ1Zi5zbGljZShuLCBucmVhZCkpO1xuICAgICAgfVxuICAgICAgaWYgKG4gIT09IG5yZWFkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCB3cml0ZVwiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlc1JlYWQ7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUlyQyxNQUFNLHNCQUFzQixLQUFLO0FBRWpDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW9CQyxHQUNELE9BQU8sZUFBZSxNQUNwQixDQUFTLEVBQ1QsSUFBWSxFQUNaLElBQVk7RUFFWixJQUFJLFlBQVk7RUFDaEIsSUFBSSxNQUFNLElBQUksV0FBVztFQUN6QixNQUFPLFlBQVksS0FBTTtJQUN2QixJQUFJLE9BQU8sWUFBWSxxQkFBcUI7TUFDMUMsTUFBTSxJQUFJLFdBQVcsT0FBTztJQUM5QjtJQUNBLE1BQU0sU0FBUyxNQUFNLEVBQUUsSUFBSSxDQUFDO0lBQzVCLE1BQU0sUUFBUSxVQUFVO0lBQ3hCLGFBQWE7SUFDYixJQUFJLFFBQVEsR0FBRztNQUNiLElBQUksSUFBSTtNQUNSLE1BQU8sSUFBSSxNQUFPO1FBQ2hCLEtBQUssTUFBTSxLQUFLLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHO01BQ3JDO01BQ0EsSUFBSSxNQUFNLE9BQU87UUFDZixNQUFNLElBQUksTUFBTTtNQUNsQjtJQUNGO0lBQ0EsSUFBSSxXQUFXLE1BQU07TUFDbkI7SUFDRjtFQUNGO0VBQ0EsT0FBTztBQUNUIn0=
// denoCacheMetadata=14702071403330710331,945842348242751518