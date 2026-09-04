// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { concat } from "jsr:/@std/bytes@^1.0.0-rc.3/concat";
/**
 * Converts a {@linkcode ReadableStream} of {@linkcode Uint8Array}s to an
 * {@linkcode ArrayBuffer}. Works the same as {@linkcode Response.arrayBuffer}.
 *
 * @param readableStream A `ReadableStream` of `Uint8Array`s to convert into an `ArrayBuffer`.
 * @returns A promise that resolves with the `ArrayBuffer` containing all the data from the stream.
 *
 * @example Basic usage
 * ```ts
 * import { toArrayBuffer } from "@std/streams/to-array-buffer";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from([
 *   new Uint8Array([1, 2]),
 *   new Uint8Array([3, 4, 5]),
 * ]);
 * const buf = await toArrayBuffer(stream);
 * assertEquals(buf.byteLength, 5);
 * ```
 */ export async function toArrayBuffer(readableStream) {
  const reader = readableStream.getReader();
  const chunks = [];
  while(true){
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
  }
  return concat(chunks).buffer;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L3RvX2FycmF5X2J1ZmZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBjb25jYXQgfSBmcm9tIFwianNyOi9Ac3RkL2J5dGVzQF4xLjAuMC1yYy4zL2NvbmNhdFwiO1xuXG4vKipcbiAqIENvbnZlcnRzIGEge0BsaW5rY29kZSBSZWFkYWJsZVN0cmVhbX0gb2Yge0BsaW5rY29kZSBVaW50OEFycmF5fXMgdG8gYW5cbiAqIHtAbGlua2NvZGUgQXJyYXlCdWZmZXJ9LiBXb3JrcyB0aGUgc2FtZSBhcyB7QGxpbmtjb2RlIFJlc3BvbnNlLmFycmF5QnVmZmVyfS5cbiAqXG4gKiBAcGFyYW0gcmVhZGFibGVTdHJlYW0gQSBgUmVhZGFibGVTdHJlYW1gIG9mIGBVaW50OEFycmF5YHMgdG8gY29udmVydCBpbnRvIGFuIGBBcnJheUJ1ZmZlcmAuXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBgQXJyYXlCdWZmZXJgIGNvbnRhaW5pbmcgYWxsIHRoZSBkYXRhIGZyb20gdGhlIHN0cmVhbS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHRvQXJyYXlCdWZmZXIgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL3RvLWFycmF5LWJ1ZmZlclwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzdHJlYW0gPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcbiAqICAgbmV3IFVpbnQ4QXJyYXkoWzEsIDJdKSxcbiAqICAgbmV3IFVpbnQ4QXJyYXkoWzMsIDQsIDVdKSxcbiAqIF0pO1xuICogY29uc3QgYnVmID0gYXdhaXQgdG9BcnJheUJ1ZmZlcihzdHJlYW0pO1xuICogYXNzZXJ0RXF1YWxzKGJ1Zi5ieXRlTGVuZ3RoLCA1KTtcbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9BcnJheUJ1ZmZlcihcbiAgcmVhZGFibGVTdHJlYW06IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+LFxuKTogUHJvbWlzZTxBcnJheUJ1ZmZlcj4ge1xuICBjb25zdCByZWFkZXIgPSByZWFkYWJsZVN0cmVhbS5nZXRSZWFkZXIoKTtcbiAgY29uc3QgY2h1bmtzOiBVaW50OEFycmF5W10gPSBbXTtcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG5cbiAgICBpZiAoZG9uZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY2h1bmtzLnB1c2godmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIGNvbmNhdChjaHVua3MpLmJ1ZmZlcjtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsTUFBTSxRQUFRLHFDQUFxQztBQUU1RDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CQyxHQUNELE9BQU8sZUFBZSxjQUNwQixjQUEwQztFQUUxQyxNQUFNLFNBQVMsZUFBZSxTQUFTO0VBQ3ZDLE1BQU0sU0FBdUIsRUFBRTtFQUUvQixNQUFPLEtBQU07SUFDWCxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sT0FBTyxJQUFJO0lBRXpDLElBQUksTUFBTTtNQUNSO0lBQ0Y7SUFFQSxPQUFPLElBQUksQ0FBQztFQUNkO0VBRUEsT0FBTyxPQUFPLFFBQVEsTUFBTTtBQUM5QiJ9
// denoCacheMetadata=16446692233822736266,5624212740734580434