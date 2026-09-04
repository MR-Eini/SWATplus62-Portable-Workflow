// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { dirname } from "jsr:/@std/path@^0.224.0/dirname";
import { resolve } from "jsr:/@std/path@^0.224.0/resolve";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { getFileInfoType } from "./_get_file_info_type.ts";
import { toPathString } from "./_to_path_string.ts";
const isWindows = Deno.build.os === "windows";
function resolveSymlinkTarget(target, linkName) {
  if (typeof target !== "string") return target; // URL is always absolute path
  if (typeof linkName === "string") {
    return resolve(dirname(linkName), target);
  } else {
    return new URL(target, linkName);
  }
}
/**
 * Asynchronously ensures that the link exists, and points to a valid file. If
 * the directory structure does not exist, it is created. If the link already
 * exists, it is not modified but error is thrown if it is not point to the
 * given target.
 *
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @param target The source file path as a string or URL.
 * @param linkName The destination link path as a string or URL.
 * @returns A void promise that resolves once the link exists.
 *
 * @example
 * ```ts
 * import { ensureSymlink } from "@std/fs/ensure-symlink";
 *
 * await ensureSymlink("./folder/targetFile.dat", "./folder/targetFile.link.dat");
 * ```
 */ export async function ensureSymlink(target, linkName) {
  const targetRealPath = resolveSymlinkTarget(target, linkName);
  const srcStatInfo = await Deno.lstat(targetRealPath);
  const srcFilePathType = getFileInfoType(srcStatInfo);
  await ensureDir(dirname(toPathString(linkName)));
  const options = isWindows ? {
    type: srcFilePathType === "dir" ? "dir" : "file"
  } : undefined;
  try {
    await Deno.symlink(target, linkName, options);
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
    const linkStatInfo = await Deno.lstat(linkName);
    if (!linkStatInfo.isSymlink) {
      const type = getFileInfoType(linkStatInfo);
      throw new Deno.errors.AlreadyExists(`A '${type}' already exists at the path: ${linkName}`);
    }
    const linkPath = await Deno.readLink(linkName);
    const linkRealPath = resolve(linkPath);
    if (linkRealPath !== targetRealPath) {
      throw new Deno.errors.AlreadyExists(`A symlink targeting to an undesired path already exists: ${linkName} -> ${linkRealPath}`);
    }
  }
}
/**
 * Synchronously ensures that the link exists, and points to a valid file. If
 * the directory structure does not exist, it is created. If the link already
 * exists, it is not modified but error is thrown if it is not point to the
 * given target.
 *
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @param target The source file path as a string or URL.
 * @param linkName The destination link path as a string or URL.
 * @returns A void value that returns once the link exists.
 *
 * @example
 * ```ts
 * import { ensureSymlinkSync } from "@std/fs/ensure-symlink";
 *
 * ensureSymlinkSync("./folder/targetFile.dat", "./folder/targetFile.link.dat");
 * ```
 */ export function ensureSymlinkSync(target, linkName) {
  const targetRealPath = resolveSymlinkTarget(target, linkName);
  const srcStatInfo = Deno.lstatSync(targetRealPath);
  const srcFilePathType = getFileInfoType(srcStatInfo);
  ensureDirSync(dirname(toPathString(linkName)));
  const options = isWindows ? {
    type: srcFilePathType === "dir" ? "dir" : "file"
  } : undefined;
  try {
    Deno.symlinkSync(target, linkName, options);
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
    const linkStatInfo = Deno.lstatSync(linkName);
    if (!linkStatInfo.isSymlink) {
      const type = getFileInfoType(linkStatInfo);
      throw new Deno.errors.AlreadyExists(`A '${type}' already exists at the path: ${linkName}`);
    }
    const linkPath = Deno.readLinkSync(linkName);
    const linkRealPath = resolve(linkPath);
    if (linkRealPath !== targetRealPath) {
      throw new Deno.errors.AlreadyExists(`A symlink targeting to an undesired path already exists: ${linkName} -> ${linkRealPath}`);
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC9lbnN1cmVfc3ltbGluay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gXCJqc3I6L0BzdGQvcGF0aEBeMC4yMjQuMC9kaXJuYW1lXCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcImpzcjovQHN0ZC9wYXRoQF4wLjIyNC4wL3Jlc29sdmVcIjtcbmltcG9ydCB7IGVuc3VyZURpciwgZW5zdXJlRGlyU3luYyB9IGZyb20gXCIuL2Vuc3VyZV9kaXIudHNcIjtcbmltcG9ydCB7IGdldEZpbGVJbmZvVHlwZSB9IGZyb20gXCIuL19nZXRfZmlsZV9pbmZvX3R5cGUudHNcIjtcbmltcG9ydCB7IHRvUGF0aFN0cmluZyB9IGZyb20gXCIuL190b19wYXRoX3N0cmluZy50c1wiO1xuXG5jb25zdCBpc1dpbmRvd3MgPSBEZW5vLmJ1aWxkLm9zID09PSBcIndpbmRvd3NcIjtcblxuZnVuY3Rpb24gcmVzb2x2ZVN5bWxpbmtUYXJnZXQodGFyZ2V0OiBzdHJpbmcgfCBVUkwsIGxpbmtOYW1lOiBzdHJpbmcgfCBVUkwpIHtcbiAgaWYgKHR5cGVvZiB0YXJnZXQgIT09IFwic3RyaW5nXCIpIHJldHVybiB0YXJnZXQ7IC8vIFVSTCBpcyBhbHdheXMgYWJzb2x1dGUgcGF0aFxuICBpZiAodHlwZW9mIGxpbmtOYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIHJlc29sdmUoZGlybmFtZShsaW5rTmFtZSksIHRhcmdldCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBVUkwodGFyZ2V0LCBsaW5rTmFtZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3luY2hyb25vdXNseSBlbnN1cmVzIHRoYXQgdGhlIGxpbmsgZXhpc3RzLCBhbmQgcG9pbnRzIHRvIGEgdmFsaWQgZmlsZS4gSWZcbiAqIHRoZSBkaXJlY3Rvcnkgc3RydWN0dXJlIGRvZXMgbm90IGV4aXN0LCBpdCBpcyBjcmVhdGVkLiBJZiB0aGUgbGluayBhbHJlYWR5XG4gKiBleGlzdHMsIGl0IGlzIG5vdCBtb2RpZmllZCBidXQgZXJyb3IgaXMgdGhyb3duIGlmIGl0IGlzIG5vdCBwb2ludCB0byB0aGVcbiAqIGdpdmVuIHRhcmdldC5cbiAqXG4gKiBSZXF1aXJlcyB0aGUgYC0tYWxsb3ctcmVhZGAgYW5kIGAtLWFsbG93LXdyaXRlYCBmbGFnLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHNvdXJjZSBmaWxlIHBhdGggYXMgYSBzdHJpbmcgb3IgVVJMLlxuICogQHBhcmFtIGxpbmtOYW1lIFRoZSBkZXN0aW5hdGlvbiBsaW5rIHBhdGggYXMgYSBzdHJpbmcgb3IgVVJMLlxuICogQHJldHVybnMgQSB2b2lkIHByb21pc2UgdGhhdCByZXNvbHZlcyBvbmNlIHRoZSBsaW5rIGV4aXN0cy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVuc3VyZVN5bWxpbmsgfSBmcm9tIFwiQHN0ZC9mcy9lbnN1cmUtc3ltbGlua1wiO1xuICpcbiAqIGF3YWl0IGVuc3VyZVN5bWxpbmsoXCIuL2ZvbGRlci90YXJnZXRGaWxlLmRhdFwiLCBcIi4vZm9sZGVyL3RhcmdldEZpbGUubGluay5kYXRcIik7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuc3VyZVN5bWxpbmsoXG4gIHRhcmdldDogc3RyaW5nIHwgVVJMLFxuICBsaW5rTmFtZTogc3RyaW5nIHwgVVJMLFxuKSB7XG4gIGNvbnN0IHRhcmdldFJlYWxQYXRoID0gcmVzb2x2ZVN5bWxpbmtUYXJnZXQodGFyZ2V0LCBsaW5rTmFtZSk7XG4gIGNvbnN0IHNyY1N0YXRJbmZvID0gYXdhaXQgRGVuby5sc3RhdCh0YXJnZXRSZWFsUGF0aCk7XG4gIGNvbnN0IHNyY0ZpbGVQYXRoVHlwZSA9IGdldEZpbGVJbmZvVHlwZShzcmNTdGF0SW5mbyk7XG5cbiAgYXdhaXQgZW5zdXJlRGlyKGRpcm5hbWUodG9QYXRoU3RyaW5nKGxpbmtOYW1lKSkpO1xuXG4gIGNvbnN0IG9wdGlvbnM6IERlbm8uU3ltbGlua09wdGlvbnMgfCB1bmRlZmluZWQgPSBpc1dpbmRvd3NcbiAgICA/IHtcbiAgICAgIHR5cGU6IHNyY0ZpbGVQYXRoVHlwZSA9PT0gXCJkaXJcIiA/IFwiZGlyXCIgOiBcImZpbGVcIixcbiAgICB9XG4gICAgOiB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBEZW5vLnN5bWxpbmsodGFyZ2V0LCBsaW5rTmFtZSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5BbHJlYWR5RXhpc3RzKSkge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICAgIGNvbnN0IGxpbmtTdGF0SW5mbyA9IGF3YWl0IERlbm8ubHN0YXQobGlua05hbWUpO1xuICAgIGlmICghbGlua1N0YXRJbmZvLmlzU3ltbGluaykge1xuICAgICAgY29uc3QgdHlwZSA9IGdldEZpbGVJbmZvVHlwZShsaW5rU3RhdEluZm8pO1xuICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkFscmVhZHlFeGlzdHMoXG4gICAgICAgIGBBICcke3R5cGV9JyBhbHJlYWR5IGV4aXN0cyBhdCB0aGUgcGF0aDogJHtsaW5rTmFtZX1gLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgbGlua1BhdGggPSBhd2FpdCBEZW5vLnJlYWRMaW5rKGxpbmtOYW1lKTtcbiAgICBjb25zdCBsaW5rUmVhbFBhdGggPSByZXNvbHZlKGxpbmtQYXRoKTtcbiAgICBpZiAobGlua1JlYWxQYXRoICE9PSB0YXJnZXRSZWFsUGF0aCkge1xuICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkFscmVhZHlFeGlzdHMoXG4gICAgICAgIGBBIHN5bWxpbmsgdGFyZ2V0aW5nIHRvIGFuIHVuZGVzaXJlZCBwYXRoIGFscmVhZHkgZXhpc3RzOiAke2xpbmtOYW1lfSAtPiAke2xpbmtSZWFsUGF0aH1gLFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91c2x5IGVuc3VyZXMgdGhhdCB0aGUgbGluayBleGlzdHMsIGFuZCBwb2ludHMgdG8gYSB2YWxpZCBmaWxlLiBJZlxuICogdGhlIGRpcmVjdG9yeSBzdHJ1Y3R1cmUgZG9lcyBub3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQuIElmIHRoZSBsaW5rIGFscmVhZHlcbiAqIGV4aXN0cywgaXQgaXMgbm90IG1vZGlmaWVkIGJ1dCBlcnJvciBpcyB0aHJvd24gaWYgaXQgaXMgbm90IHBvaW50IHRvIHRoZVxuICogZ2l2ZW4gdGFyZ2V0LlxuICpcbiAqIFJlcXVpcmVzIHRoZSBgLS1hbGxvdy1yZWFkYCBhbmQgYC0tYWxsb3ctd3JpdGVgIGZsYWcuXG4gKlxuICogQHBhcmFtIHRhcmdldCBUaGUgc291cmNlIGZpbGUgcGF0aCBhcyBhIHN0cmluZyBvciBVUkwuXG4gKiBAcGFyYW0gbGlua05hbWUgVGhlIGRlc3RpbmF0aW9uIGxpbmsgcGF0aCBhcyBhIHN0cmluZyBvciBVUkwuXG4gKiBAcmV0dXJucyBBIHZvaWQgdmFsdWUgdGhhdCByZXR1cm5zIG9uY2UgdGhlIGxpbmsgZXhpc3RzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5zdXJlU3ltbGlua1N5bmMgfSBmcm9tIFwiQHN0ZC9mcy9lbnN1cmUtc3ltbGlua1wiO1xuICpcbiAqIGVuc3VyZVN5bWxpbmtTeW5jKFwiLi9mb2xkZXIvdGFyZ2V0RmlsZS5kYXRcIiwgXCIuL2ZvbGRlci90YXJnZXRGaWxlLmxpbmsuZGF0XCIpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVTeW1saW5rU3luYyhcbiAgdGFyZ2V0OiBzdHJpbmcgfCBVUkwsXG4gIGxpbmtOYW1lOiBzdHJpbmcgfCBVUkwsXG4pIHtcbiAgY29uc3QgdGFyZ2V0UmVhbFBhdGggPSByZXNvbHZlU3ltbGlua1RhcmdldCh0YXJnZXQsIGxpbmtOYW1lKTtcbiAgY29uc3Qgc3JjU3RhdEluZm8gPSBEZW5vLmxzdGF0U3luYyh0YXJnZXRSZWFsUGF0aCk7XG4gIGNvbnN0IHNyY0ZpbGVQYXRoVHlwZSA9IGdldEZpbGVJbmZvVHlwZShzcmNTdGF0SW5mbyk7XG5cbiAgZW5zdXJlRGlyU3luYyhkaXJuYW1lKHRvUGF0aFN0cmluZyhsaW5rTmFtZSkpKTtcblxuICBjb25zdCBvcHRpb25zOiBEZW5vLlN5bWxpbmtPcHRpb25zIHwgdW5kZWZpbmVkID0gaXNXaW5kb3dzXG4gICAgPyB7XG4gICAgICB0eXBlOiBzcmNGaWxlUGF0aFR5cGUgPT09IFwiZGlyXCIgPyBcImRpclwiIDogXCJmaWxlXCIsXG4gICAgfVxuICAgIDogdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgRGVuby5zeW1saW5rU3luYyh0YXJnZXQsIGxpbmtOYW1lLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkFscmVhZHlFeGlzdHMpKSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgY29uc3QgbGlua1N0YXRJbmZvID0gRGVuby5sc3RhdFN5bmMobGlua05hbWUpO1xuICAgIGlmICghbGlua1N0YXRJbmZvLmlzU3ltbGluaykge1xuICAgICAgY29uc3QgdHlwZSA9IGdldEZpbGVJbmZvVHlwZShsaW5rU3RhdEluZm8pO1xuICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkFscmVhZHlFeGlzdHMoXG4gICAgICAgIGBBICcke3R5cGV9JyBhbHJlYWR5IGV4aXN0cyBhdCB0aGUgcGF0aDogJHtsaW5rTmFtZX1gLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgbGlua1BhdGggPSBEZW5vLnJlYWRMaW5rU3luYyhsaW5rTmFtZSk7XG4gICAgY29uc3QgbGlua1JlYWxQYXRoID0gcmVzb2x2ZShsaW5rUGF0aCk7XG4gICAgaWYgKGxpbmtSZWFsUGF0aCAhPT0gdGFyZ2V0UmVhbFBhdGgpIHtcbiAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5BbHJlYWR5RXhpc3RzKFxuICAgICAgICBgQSBzeW1saW5rIHRhcmdldGluZyB0byBhbiB1bmRlc2lyZWQgcGF0aCBhbHJlYWR5IGV4aXN0czogJHtsaW5rTmFtZX0gLT4gJHtsaW5rUmVhbFBhdGh9YCxcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLFNBQVMsT0FBTyxRQUFRLGtDQUFrQztBQUMxRCxTQUFTLE9BQU8sUUFBUSxrQ0FBa0M7QUFDMUQsU0FBUyxTQUFTLEVBQUUsYUFBYSxRQUFRLGtCQUFrQjtBQUMzRCxTQUFTLGVBQWUsUUFBUSwyQkFBMkI7QUFDM0QsU0FBUyxZQUFZLFFBQVEsdUJBQXVCO0FBRXBELE1BQU0sWUFBWSxLQUFLLEtBQUssQ0FBQyxFQUFFLEtBQUs7QUFFcEMsU0FBUyxxQkFBcUIsTUFBb0IsRUFBRSxRQUFzQjtFQUN4RSxJQUFJLE9BQU8sV0FBVyxVQUFVLE9BQU8sUUFBUSw4QkFBOEI7RUFDN0UsSUFBSSxPQUFPLGFBQWEsVUFBVTtJQUNoQyxPQUFPLFFBQVEsUUFBUSxXQUFXO0VBQ3BDLE9BQU87SUFDTCxPQUFPLElBQUksSUFBSSxRQUFRO0VBQ3pCO0FBQ0Y7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLEdBQ0QsT0FBTyxlQUFlLGNBQ3BCLE1BQW9CLEVBQ3BCLFFBQXNCO0VBRXRCLE1BQU0saUJBQWlCLHFCQUFxQixRQUFRO0VBQ3BELE1BQU0sY0FBYyxNQUFNLEtBQUssS0FBSyxDQUFDO0VBQ3JDLE1BQU0sa0JBQWtCLGdCQUFnQjtFQUV4QyxNQUFNLFVBQVUsUUFBUSxhQUFhO0VBRXJDLE1BQU0sVUFBMkMsWUFDN0M7SUFDQSxNQUFNLG9CQUFvQixRQUFRLFFBQVE7RUFDNUMsSUFDRTtFQUVKLElBQUk7SUFDRixNQUFNLEtBQUssT0FBTyxDQUFDLFFBQVEsVUFBVTtFQUN2QyxFQUFFLE9BQU8sT0FBTztJQUNkLElBQUksQ0FBQyxDQUFDLGlCQUFpQixLQUFLLE1BQU0sQ0FBQyxhQUFhLEdBQUc7TUFDakQsTUFBTTtJQUNSO0lBQ0EsTUFBTSxlQUFlLE1BQU0sS0FBSyxLQUFLLENBQUM7SUFDdEMsSUFBSSxDQUFDLGFBQWEsU0FBUyxFQUFFO01BQzNCLE1BQU0sT0FBTyxnQkFBZ0I7TUFDN0IsTUFBTSxJQUFJLEtBQUssTUFBTSxDQUFDLGFBQWEsQ0FDakMsQ0FBQyxHQUFHLEVBQUUsS0FBSyw4QkFBOEIsRUFBRSxVQUFVO0lBRXpEO0lBQ0EsTUFBTSxXQUFXLE1BQU0sS0FBSyxRQUFRLENBQUM7SUFDckMsTUFBTSxlQUFlLFFBQVE7SUFDN0IsSUFBSSxpQkFBaUIsZ0JBQWdCO01BQ25DLE1BQU0sSUFBSSxLQUFLLE1BQU0sQ0FBQyxhQUFhLENBQ2pDLENBQUMseURBQXlELEVBQUUsU0FBUyxJQUFJLEVBQUUsY0FBYztJQUU3RjtFQUNGO0FBQ0Y7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLEdBQ0QsT0FBTyxTQUFTLGtCQUNkLE1BQW9CLEVBQ3BCLFFBQXNCO0VBRXRCLE1BQU0saUJBQWlCLHFCQUFxQixRQUFRO0VBQ3BELE1BQU0sY0FBYyxLQUFLLFNBQVMsQ0FBQztFQUNuQyxNQUFNLGtCQUFrQixnQkFBZ0I7RUFFeEMsY0FBYyxRQUFRLGFBQWE7RUFFbkMsTUFBTSxVQUEyQyxZQUM3QztJQUNBLE1BQU0sb0JBQW9CLFFBQVEsUUFBUTtFQUM1QyxJQUNFO0VBRUosSUFBSTtJQUNGLEtBQUssV0FBVyxDQUFDLFFBQVEsVUFBVTtFQUNyQyxFQUFFLE9BQU8sT0FBTztJQUNkLElBQUksQ0FBQyxDQUFDLGlCQUFpQixLQUFLLE1BQU0sQ0FBQyxhQUFhLEdBQUc7TUFDakQsTUFBTTtJQUNSO0lBQ0EsTUFBTSxlQUFlLEtBQUssU0FBUyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxhQUFhLFNBQVMsRUFBRTtNQUMzQixNQUFNLE9BQU8sZ0JBQWdCO01BQzdCLE1BQU0sSUFBSSxLQUFLLE1BQU0sQ0FBQyxhQUFhLENBQ2pDLENBQUMsR0FBRyxFQUFFLEtBQUssOEJBQThCLEVBQUUsVUFBVTtJQUV6RDtJQUNBLE1BQU0sV0FBVyxLQUFLLFlBQVksQ0FBQztJQUNuQyxNQUFNLGVBQWUsUUFBUTtJQUM3QixJQUFJLGlCQUFpQixnQkFBZ0I7TUFDbkMsTUFBTSxJQUFJLEtBQUssTUFBTSxDQUFDLGFBQWEsQ0FDakMsQ0FBQyx5REFBeUQsRUFBRSxTQUFTLElBQUksRUFBRSxjQUFjO0lBRTdGO0VBQ0Y7QUFDRiJ9
// denoCacheMetadata=344424522653147603,5021511917732077997