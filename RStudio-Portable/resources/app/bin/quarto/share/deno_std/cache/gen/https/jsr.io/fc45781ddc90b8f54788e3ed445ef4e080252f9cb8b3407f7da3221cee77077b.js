// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Create a {@linkcode https://jsr.io/@std/io/doc/types/~/Writer | Writer} from a {@linkcode WritableStreamDefaultWriter}.
 *
 * @param streamWriter A `WritableStreamDefaultWriter` to convert into a `Writer`.
 * @returns A `Writer` that writes to the `WritableStreamDefaultWriter`.
 *
 * @example Read from a file and write to stdout using a writable stream
 * ```ts no-eval no-assert
 * import { copy } from "@std/io/copy";
 * import { writerFromStreamWriter } from "@std/streams/writer-from-stream-writer";
 *
 * using file = await Deno.open("./README.md", { read: true });
 *
 * const writableStream = new WritableStream({
 *   write(chunk): void {
 *     console.log(chunk);
 *   },
 * });
 * const writer = writerFromStreamWriter(writableStream.getWriter());
 * await copy(file, writer);
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode WritableStreamDefaultWriter} directly.
 */ export function writerFromStreamWriter(streamWriter) {
  return {
    async write (p) {
      await streamWriter.ready;
      await streamWriter.write(p);
      return p.length;
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L3dyaXRlcl9mcm9tX3N0cmVhbV93cml0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHR5cGUgeyBXcml0ZXIgfSBmcm9tIFwianNyOi9Ac3RkL2lvQF4wLjIyNC4xL3R5cGVzXCI7XG5cbmV4cG9ydCB0eXBlIHsgV3JpdGVyIH07XG5cbi8qKlxuICogQ3JlYXRlIGEge0BsaW5rY29kZSBodHRwczovL2pzci5pby9Ac3RkL2lvL2RvYy90eXBlcy9+L1dyaXRlciB8IFdyaXRlcn0gZnJvbSBhIHtAbGlua2NvZGUgV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyfS5cbiAqXG4gKiBAcGFyYW0gc3RyZWFtV3JpdGVyIEEgYFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlcmAgdG8gY29udmVydCBpbnRvIGEgYFdyaXRlcmAuXG4gKiBAcmV0dXJucyBBIGBXcml0ZXJgIHRoYXQgd3JpdGVzIHRvIHRoZSBgV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyYC5cbiAqXG4gKiBAZXhhbXBsZSBSZWFkIGZyb20gYSBmaWxlIGFuZCB3cml0ZSB0byBzdGRvdXQgdXNpbmcgYSB3cml0YWJsZSBzdHJlYW1cbiAqIGBgYHRzIG5vLWV2YWwgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBjb3B5IH0gZnJvbSBcIkBzdGQvaW8vY29weVwiO1xuICogaW1wb3J0IHsgd3JpdGVyRnJvbVN0cmVhbVdyaXRlciB9IGZyb20gXCJAc3RkL3N0cmVhbXMvd3JpdGVyLWZyb20tc3RyZWFtLXdyaXRlclwiO1xuICpcbiAqIHVzaW5nIGZpbGUgPSBhd2FpdCBEZW5vLm9wZW4oXCIuL1JFQURNRS5tZFwiLCB7IHJlYWQ6IHRydWUgfSk7XG4gKlxuICogY29uc3Qgd3JpdGFibGVTdHJlYW0gPSBuZXcgV3JpdGFibGVTdHJlYW0oe1xuICogICB3cml0ZShjaHVuayk6IHZvaWQge1xuICogICAgIGNvbnNvbGUubG9nKGNodW5rKTtcbiAqICAgfSxcbiAqIH0pO1xuICogY29uc3Qgd3JpdGVyID0gd3JpdGVyRnJvbVN0cmVhbVdyaXRlcih3cml0YWJsZVN0cmVhbS5nZXRXcml0ZXIoKSk7XG4gKiBhd2FpdCBjb3B5KGZpbGUsIHdyaXRlcik7XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHtAbGlua2NvZGUgV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyfSBkaXJlY3RseS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlckZyb21TdHJlYW1Xcml0ZXIoXG4gIHN0cmVhbVdyaXRlcjogV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyPFVpbnQ4QXJyYXk+LFxuKTogV3JpdGVyIHtcbiAgcmV0dXJuIHtcbiAgICBhc3luYyB3cml0ZShwOiBVaW50OEFycmF5KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgIGF3YWl0IHN0cmVhbVdyaXRlci5yZWFkeTtcbiAgICAgIGF3YWl0IHN0cmVhbVdyaXRlci53cml0ZShwKTtcbiAgICAgIHJldHVybiBwLmxlbmd0aDtcbiAgICB9LFxuICB9O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFNckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJDLEdBQ0QsT0FBTyxTQUFTLHVCQUNkLFlBQXFEO0VBRXJELE9BQU87SUFDTCxNQUFNLE9BQU0sQ0FBYTtNQUN2QixNQUFNLGFBQWEsS0FBSztNQUN4QixNQUFNLGFBQWEsS0FBSyxDQUFDO01BQ3pCLE9BQU8sRUFBRSxNQUFNO0lBQ2pCO0VBQ0Y7QUFDRiJ9
// denoCacheMetadata=7630517332494223267,3033149878103576245