// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { dirname } from "jsr:/@std/path@^0.224.0/dirname";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { toPathString } from "./_to_path_string.ts";
/**
 * Asynchronously ensures that the hard link exists. If the directory structure
 * does not exist, it is created.
 *
 * @param src The source file path as a string or URL. Directory hard links are
 * not allowed.
 * @param dest The destination link path as a string or URL.
 * @returns A void promise that resolves once the hard link exists.
 *
 * @example
 * ```ts
 * import { ensureLink } from "@std/fs/ensure-link";
 *
 * await ensureLink("./folder/targetFile.dat", "./folder/targetFile.link.dat");
 * ```
 */ export async function ensureLink(src, dest) {
  dest = toPathString(dest);
  await ensureDir(dirname(dest));
  await Deno.link(toPathString(src), dest);
}
/**
 * Synchronously ensures that the hard link exists. If the directory structure
 * does not exist, it is created.
 *
 * @param src The source file path as a string or URL. Directory hard links are
 * not allowed.
 * @param dest The destination link path as a string or URL.
 * @returns A void value that returns once the hard link exists.
 *
 * @example
 * ```ts
 * import { ensureLinkSync } from "@std/fs/ensure-link";
 *
 * ensureLinkSync("./folder/targetFile.dat", "./folder/targetFile.link.dat");
 * ```
 */ export function ensureLinkSync(src, dest) {
  dest = toPathString(dest);
  ensureDirSync(dirname(dest));
  Deno.linkSync(toPathString(src), dest);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC9lbnN1cmVfbGluay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gXCJqc3I6L0BzdGQvcGF0aEBeMC4yMjQuMC9kaXJuYW1lXCI7XG5pbXBvcnQgeyBlbnN1cmVEaXIsIGVuc3VyZURpclN5bmMgfSBmcm9tIFwiLi9lbnN1cmVfZGlyLnRzXCI7XG5pbXBvcnQgeyB0b1BhdGhTdHJpbmcgfSBmcm9tIFwiLi9fdG9fcGF0aF9zdHJpbmcudHNcIjtcblxuLyoqXG4gKiBBc3luY2hyb25vdXNseSBlbnN1cmVzIHRoYXQgdGhlIGhhcmQgbGluayBleGlzdHMuIElmIHRoZSBkaXJlY3Rvcnkgc3RydWN0dXJlXG4gKiBkb2VzIG5vdCBleGlzdCwgaXQgaXMgY3JlYXRlZC5cbiAqXG4gKiBAcGFyYW0gc3JjIFRoZSBzb3VyY2UgZmlsZSBwYXRoIGFzIGEgc3RyaW5nIG9yIFVSTC4gRGlyZWN0b3J5IGhhcmQgbGlua3MgYXJlXG4gKiBub3QgYWxsb3dlZC5cbiAqIEBwYXJhbSBkZXN0IFRoZSBkZXN0aW5hdGlvbiBsaW5rIHBhdGggYXMgYSBzdHJpbmcgb3IgVVJMLlxuICogQHJldHVybnMgQSB2b2lkIHByb21pc2UgdGhhdCByZXNvbHZlcyBvbmNlIHRoZSBoYXJkIGxpbmsgZXhpc3RzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5zdXJlTGluayB9IGZyb20gXCJAc3RkL2ZzL2Vuc3VyZS1saW5rXCI7XG4gKlxuICogYXdhaXQgZW5zdXJlTGluayhcIi4vZm9sZGVyL3RhcmdldEZpbGUuZGF0XCIsIFwiLi9mb2xkZXIvdGFyZ2V0RmlsZS5saW5rLmRhdFwiKTtcbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5zdXJlTGluayhzcmM6IHN0cmluZyB8IFVSTCwgZGVzdDogc3RyaW5nIHwgVVJMKSB7XG4gIGRlc3QgPSB0b1BhdGhTdHJpbmcoZGVzdCk7XG4gIGF3YWl0IGVuc3VyZURpcihkaXJuYW1lKGRlc3QpKTtcblxuICBhd2FpdCBEZW5vLmxpbmsodG9QYXRoU3RyaW5nKHNyYyksIGRlc3QpO1xufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzbHkgZW5zdXJlcyB0aGF0IHRoZSBoYXJkIGxpbmsgZXhpc3RzLiBJZiB0aGUgZGlyZWN0b3J5IHN0cnVjdHVyZVxuICogZG9lcyBub3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQuXG4gKlxuICogQHBhcmFtIHNyYyBUaGUgc291cmNlIGZpbGUgcGF0aCBhcyBhIHN0cmluZyBvciBVUkwuIERpcmVjdG9yeSBoYXJkIGxpbmtzIGFyZVxuICogbm90IGFsbG93ZWQuXG4gKiBAcGFyYW0gZGVzdCBUaGUgZGVzdGluYXRpb24gbGluayBwYXRoIGFzIGEgc3RyaW5nIG9yIFVSTC5cbiAqIEByZXR1cm5zIEEgdm9pZCB2YWx1ZSB0aGF0IHJldHVybnMgb25jZSB0aGUgaGFyZCBsaW5rIGV4aXN0cy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVuc3VyZUxpbmtTeW5jIH0gZnJvbSBcIkBzdGQvZnMvZW5zdXJlLWxpbmtcIjtcbiAqXG4gKiBlbnN1cmVMaW5rU3luYyhcIi4vZm9sZGVyL3RhcmdldEZpbGUuZGF0XCIsIFwiLi9mb2xkZXIvdGFyZ2V0RmlsZS5saW5rLmRhdFwiKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlTGlua1N5bmMoc3JjOiBzdHJpbmcgfCBVUkwsIGRlc3Q6IHN0cmluZyB8IFVSTCkge1xuICBkZXN0ID0gdG9QYXRoU3RyaW5nKGRlc3QpO1xuICBlbnN1cmVEaXJTeW5jKGRpcm5hbWUoZGVzdCkpO1xuXG4gIERlbm8ubGlua1N5bmModG9QYXRoU3RyaW5nKHNyYyksIGRlc3QpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxTQUFTLE9BQU8sUUFBUSxrQ0FBa0M7QUFDMUQsU0FBUyxTQUFTLEVBQUUsYUFBYSxRQUFRLGtCQUFrQjtBQUMzRCxTQUFTLFlBQVksUUFBUSx1QkFBdUI7QUFFcEQ7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBQ0QsT0FBTyxlQUFlLFdBQVcsR0FBaUIsRUFBRSxJQUFrQjtFQUNwRSxPQUFPLGFBQWE7RUFDcEIsTUFBTSxVQUFVLFFBQVE7RUFFeEIsTUFBTSxLQUFLLElBQUksQ0FBQyxhQUFhLE1BQU07QUFDckM7QUFFQTs7Ozs7Ozs7Ozs7Ozs7O0NBZUMsR0FDRCxPQUFPLFNBQVMsZUFBZSxHQUFpQixFQUFFLElBQWtCO0VBQ2xFLE9BQU8sYUFBYTtFQUNwQixjQUFjLFFBQVE7RUFFdEIsS0FBSyxRQUFRLENBQUMsYUFBYSxNQUFNO0FBQ25DIn0=
// denoCacheMetadata=8261246994865261796,18040330414662928666