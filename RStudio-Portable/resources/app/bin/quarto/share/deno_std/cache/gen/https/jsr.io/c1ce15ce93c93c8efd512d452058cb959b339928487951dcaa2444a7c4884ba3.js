// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { concat } from "jsr:@std/bytes@^1.0.2/concat";
import { DEFAULT_CHUNK_SIZE } from "./_constants.ts";
/**
 * Read {@linkcode Reader} `r` until EOF (`null`) and resolve to the content as
 * {@linkcode Uint8Array}.
 *
 * @example Usage
 * ```ts no-eval
 * import { readAll } from "@std/io/read-all";
 *
 * // Example from stdin
 * const stdinContent = await readAll(Deno.stdin);
 *
 * // Example from file
 * using file = await Deno.open("my_file.txt", {read: true});
 * const myFileContent = await readAll(file);
 * ```
 *
 * @param reader The reader to read from
 * @returns The content as Uint8Array
 */ export async function readAll(reader) {
  const chunks = [];
  while(true){
    let chunk = new Uint8Array(DEFAULT_CHUNK_SIZE);
    const n = await reader.read(chunk);
    if (n === null) {
      break;
    }
    if (n < DEFAULT_CHUNK_SIZE) {
      chunk = chunk.subarray(0, n);
    }
    chunks.push(chunk);
  }
  return concat(chunks);
}
/**
 * Synchronously reads {@linkcode ReaderSync} `r` until EOF (`null`) and returns
 * the content as {@linkcode Uint8Array}.
 *
 * @example Usage
 * ```ts no-eval
 * import { readAllSync } from "@std/io/read-all";
 *
 * // Example from stdin
 * const stdinContent = readAllSync(Deno.stdin);
 *
 * // Example from file
 * using file = Deno.openSync("my_file.txt", {read: true});
 * const myFileContent = readAllSync(file);
 * ```
 *
 * @param reader The reader to read from
 * @returns The content as Uint8Array
 */ export function readAllSync(reader) {
  const chunks = [];
  while(true){
    const chunk = new Uint8Array(DEFAULT_CHUNK_SIZE);
    const n = reader.readSync(chunk);
    if (n === null) {
      break;
    }
    if (n < DEFAULT_CHUNK_SIZE) {
      chunks.push(chunk.subarray(0, n));
      break;
    }
    chunks.push(chunk);
  }
  return concat(chunks);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9yZWFkX2FsbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBjb25jYXQgfSBmcm9tIFwianNyOkBzdGQvYnl0ZXNAXjEuMC4yL2NvbmNhdFwiO1xuaW1wb3J0IHsgREVGQVVMVF9DSFVOS19TSVpFIH0gZnJvbSBcIi4vX2NvbnN0YW50cy50c1wiO1xuaW1wb3J0IHR5cGUgeyBSZWFkZXIsIFJlYWRlclN5bmMgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuXG4vKipcbiAqIFJlYWQge0BsaW5rY29kZSBSZWFkZXJ9IGByYCB1bnRpbCBFT0YgKGBudWxsYCkgYW5kIHJlc29sdmUgdG8gdGhlIGNvbnRlbnQgYXNcbiAqIHtAbGlua2NvZGUgVWludDhBcnJheX0uXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWV2YWxcbiAqIGltcG9ydCB7IHJlYWRBbGwgfSBmcm9tIFwiQHN0ZC9pby9yZWFkLWFsbFwiO1xuICpcbiAqIC8vIEV4YW1wbGUgZnJvbSBzdGRpblxuICogY29uc3Qgc3RkaW5Db250ZW50ID0gYXdhaXQgcmVhZEFsbChEZW5vLnN0ZGluKTtcbiAqXG4gKiAvLyBFeGFtcGxlIGZyb20gZmlsZVxuICogdXNpbmcgZmlsZSA9IGF3YWl0IERlbm8ub3BlbihcIm15X2ZpbGUudHh0XCIsIHtyZWFkOiB0cnVlfSk7XG4gKiBjb25zdCBteUZpbGVDb250ZW50ID0gYXdhaXQgcmVhZEFsbChmaWxlKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSByZWFkZXIgVGhlIHJlYWRlciB0byByZWFkIGZyb21cbiAqIEByZXR1cm5zIFRoZSBjb250ZW50IGFzIFVpbnQ4QXJyYXlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRBbGwocmVhZGVyOiBSZWFkZXIpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcbiAgY29uc3QgY2h1bmtzOiBVaW50OEFycmF5W10gPSBbXTtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBsZXQgY2h1bmsgPSBuZXcgVWludDhBcnJheShERUZBVUxUX0NIVU5LX1NJWkUpO1xuICAgIGNvbnN0IG4gPSBhd2FpdCByZWFkZXIucmVhZChjaHVuayk7XG4gICAgaWYgKG4gPT09IG51bGwpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAobiA8IERFRkFVTFRfQ0hVTktfU0laRSkge1xuICAgICAgY2h1bmsgPSBjaHVuay5zdWJhcnJheSgwLCBuKTtcbiAgICB9XG4gICAgY2h1bmtzLnB1c2goY2h1bmspO1xuICB9XG4gIHJldHVybiBjb25jYXQoY2h1bmtzKTtcbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91c2x5IHJlYWRzIHtAbGlua2NvZGUgUmVhZGVyU3luY30gYHJgIHVudGlsIEVPRiAoYG51bGxgKSBhbmQgcmV0dXJuc1xuICogdGhlIGNvbnRlbnQgYXMge0BsaW5rY29kZSBVaW50OEFycmF5fS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgcmVhZEFsbFN5bmMgfSBmcm9tIFwiQHN0ZC9pby9yZWFkLWFsbFwiO1xuICpcbiAqIC8vIEV4YW1wbGUgZnJvbSBzdGRpblxuICogY29uc3Qgc3RkaW5Db250ZW50ID0gcmVhZEFsbFN5bmMoRGVuby5zdGRpbik7XG4gKlxuICogLy8gRXhhbXBsZSBmcm9tIGZpbGVcbiAqIHVzaW5nIGZpbGUgPSBEZW5vLm9wZW5TeW5jKFwibXlfZmlsZS50eHRcIiwge3JlYWQ6IHRydWV9KTtcbiAqIGNvbnN0IG15RmlsZUNvbnRlbnQgPSByZWFkQWxsU3luYyhmaWxlKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSByZWFkZXIgVGhlIHJlYWRlciB0byByZWFkIGZyb21cbiAqIEByZXR1cm5zIFRoZSBjb250ZW50IGFzIFVpbnQ4QXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlYWRBbGxTeW5jKHJlYWRlcjogUmVhZGVyU3luYyk6IFVpbnQ4QXJyYXkge1xuICBjb25zdCBjaHVua3M6IFVpbnQ4QXJyYXlbXSA9IFtdO1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIGNvbnN0IGNodW5rID0gbmV3IFVpbnQ4QXJyYXkoREVGQVVMVF9DSFVOS19TSVpFKTtcbiAgICBjb25zdCBuID0gcmVhZGVyLnJlYWRTeW5jKGNodW5rKTtcbiAgICBpZiAobiA9PT0gbnVsbCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChuIDwgREVGQVVMVF9DSFVOS19TSVpFKSB7XG4gICAgICBjaHVua3MucHVzaChjaHVuay5zdWJhcnJheSgwLCBuKSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2h1bmtzLnB1c2goY2h1bmspO1xuICB9XG4gIHJldHVybiBjb25jYXQoY2h1bmtzKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsTUFBTSxRQUFRLCtCQUErQjtBQUN0RCxTQUFTLGtCQUFrQixRQUFRLGtCQUFrQjtBQUdyRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLEdBQ0QsT0FBTyxlQUFlLFFBQVEsTUFBYztFQUMxQyxNQUFNLFNBQXVCLEVBQUU7RUFDL0IsTUFBTyxLQUFNO0lBQ1gsSUFBSSxRQUFRLElBQUksV0FBVztJQUMzQixNQUFNLElBQUksTUFBTSxPQUFPLElBQUksQ0FBQztJQUM1QixJQUFJLE1BQU0sTUFBTTtNQUNkO0lBQ0Y7SUFDQSxJQUFJLElBQUksb0JBQW9CO01BQzFCLFFBQVEsTUFBTSxRQUFRLENBQUMsR0FBRztJQUM1QjtJQUNBLE9BQU8sSUFBSSxDQUFDO0VBQ2Q7RUFDQSxPQUFPLE9BQU87QUFDaEI7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLEdBQ0QsT0FBTyxTQUFTLFlBQVksTUFBa0I7RUFDNUMsTUFBTSxTQUF1QixFQUFFO0VBQy9CLE1BQU8sS0FBTTtJQUNYLE1BQU0sUUFBUSxJQUFJLFdBQVc7SUFDN0IsTUFBTSxJQUFJLE9BQU8sUUFBUSxDQUFDO0lBQzFCLElBQUksTUFBTSxNQUFNO01BQ2Q7SUFDRjtJQUNBLElBQUksSUFBSSxvQkFBb0I7TUFDMUIsT0FBTyxJQUFJLENBQUMsTUFBTSxRQUFRLENBQUMsR0FBRztNQUM5QjtJQUNGO0lBQ0EsT0FBTyxJQUFJLENBQUM7RUFDZDtFQUNBLE9BQU8sT0FBTztBQUNoQiJ9
// denoCacheMetadata=16608018780271586556,17345189021366540263