// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { basename } from "jsr:/@std/path@^0.224.0/basename";
import { join } from "jsr:/@std/path@^0.224.0/join";
import { resolve } from "jsr:/@std/path@^0.224.0/resolve";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { assert } from "jsr:/@std/assert@^0.224.0/assert";
import { getFileInfoType } from "./_get_file_info_type.ts";
import { toPathString } from "./_to_path_string.ts";
import { isSubdir } from "./_is_subdir.ts";
const isWindows = Deno.build.os === "windows";
async function ensureValidCopy(src, dest, options) {
  let destStat;
  try {
    destStat = await Deno.lstat(dest);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return;
    }
    throw err;
  }
  if (options.isFolder && !destStat.isDirectory) {
    throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
  }
  if (!options.overwrite) {
    throw new Deno.errors.AlreadyExists(`'${dest}' already exists.`);
  }
  return destStat;
}
function ensureValidCopySync(src, dest, options) {
  let destStat;
  try {
    destStat = Deno.lstatSync(dest);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return;
    }
    throw err;
  }
  if (options.isFolder && !destStat.isDirectory) {
    throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
  }
  if (!options.overwrite) {
    throw new Deno.errors.AlreadyExists(`'${dest}' already exists.`);
  }
  return destStat;
}
/* copy file to dest */ async function copyFile(src, dest, options) {
  await ensureValidCopy(src, dest, options);
  await Deno.copyFile(src, dest);
  if (options.preserveTimestamps) {
    const statInfo = await Deno.stat(src);
    assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
    assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
    await Deno.utime(dest, statInfo.atime, statInfo.mtime);
  }
}
/* copy file to dest synchronously */ function copyFileSync(src, dest, options) {
  ensureValidCopySync(src, dest, options);
  Deno.copyFileSync(src, dest);
  if (options.preserveTimestamps) {
    const statInfo = Deno.statSync(src);
    assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
    assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
    Deno.utimeSync(dest, statInfo.atime, statInfo.mtime);
  }
}
/* copy symlink to dest */ async function copySymLink(src, dest, options) {
  await ensureValidCopy(src, dest, options);
  const originSrcFilePath = await Deno.readLink(src);
  const type = getFileInfoType(await Deno.lstat(src));
  if (isWindows) {
    await Deno.symlink(originSrcFilePath, dest, {
      type: type === "dir" ? "dir" : "file"
    });
  } else {
    await Deno.symlink(originSrcFilePath, dest);
  }
  if (options.preserveTimestamps) {
    const statInfo = await Deno.lstat(src);
    assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
    assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
    await Deno.utime(dest, statInfo.atime, statInfo.mtime);
  }
}
/* copy symlink to dest synchronously */ function copySymlinkSync(src, dest, options) {
  ensureValidCopySync(src, dest, options);
  const originSrcFilePath = Deno.readLinkSync(src);
  const type = getFileInfoType(Deno.lstatSync(src));
  if (isWindows) {
    Deno.symlinkSync(originSrcFilePath, dest, {
      type: type === "dir" ? "dir" : "file"
    });
  } else {
    Deno.symlinkSync(originSrcFilePath, dest);
  }
  if (options.preserveTimestamps) {
    const statInfo = Deno.lstatSync(src);
    assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
    assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
    Deno.utimeSync(dest, statInfo.atime, statInfo.mtime);
  }
}
/* copy folder from src to dest. */ async function copyDir(src, dest, options) {
  const destStat = await ensureValidCopy(src, dest, {
    ...options,
    isFolder: true
  });
  if (!destStat) {
    await ensureDir(dest);
  }
  if (options.preserveTimestamps) {
    const srcStatInfo = await Deno.stat(src);
    assert(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
    assert(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
    await Deno.utime(dest, srcStatInfo.atime, srcStatInfo.mtime);
  }
  src = toPathString(src);
  dest = toPathString(dest);
  const promises = [];
  for await (const entry of Deno.readDir(src)){
    const srcPath = join(src, entry.name);
    const destPath = join(dest, basename(srcPath));
    if (entry.isSymlink) {
      promises.push(copySymLink(srcPath, destPath, options));
    } else if (entry.isDirectory) {
      promises.push(copyDir(srcPath, destPath, options));
    } else if (entry.isFile) {
      promises.push(copyFile(srcPath, destPath, options));
    }
  }
  await Promise.all(promises);
}
/* copy folder from src to dest synchronously */ function copyDirSync(src, dest, options) {
  const destStat = ensureValidCopySync(src, dest, {
    ...options,
    isFolder: true
  });
  if (!destStat) {
    ensureDirSync(dest);
  }
  if (options.preserveTimestamps) {
    const srcStatInfo = Deno.statSync(src);
    assert(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
    assert(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
    Deno.utimeSync(dest, srcStatInfo.atime, srcStatInfo.mtime);
  }
  src = toPathString(src);
  dest = toPathString(dest);
  for (const entry of Deno.readDirSync(src)){
    const srcPath = join(src, entry.name);
    const destPath = join(dest, basename(srcPath));
    if (entry.isSymlink) {
      copySymlinkSync(srcPath, destPath, options);
    } else if (entry.isDirectory) {
      copyDirSync(srcPath, destPath, options);
    } else if (entry.isFile) {
      copyFileSync(srcPath, destPath, options);
    }
  }
}
/**
 * Asynchronously copy a file or directory. The directory can have contents.
 * Like `cp -r`.
 *
 * If `src` is a directory it will copy everything inside of this directory,
 * not the entire directory itself. If `src` is a file, `dest` cannot be a
 * directory.
 *
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @param src The source file/directory path as a string or URL.
 * @param dest The destination file/directory path as a string or URL.
 * @param options Options for copying.
 * @returns A promise that resolves once the copy operation completes.
 *
 * @example Basic usage
 * ```ts
 * import { copy } from "@std/fs/copy";
 *
 * await copy("./foo", "./bar");
 * ```
 *
 * This will copy the file or directory at `./foo` to `./bar` without
 * overwriting.
 *
 * @example Overwriting files/directories
 * ```ts
 * import { copy } from "@std/fs/copy";
 *
 * await copy("./foo", "./bar", { overwrite: true });
 * ```
 *
 * This will copy the file or directory at `./foo` to `./bar` and overwrite
 * any existing files or directories.
 *
 * @example Preserving timestamps
 * ```ts
 * import { copy } from "@std/fs/copy";
 *
 * await copy("./foo", "./bar", { preserveTimestamps: true });
 * ```
 *
 * This will copy the file or directory at `./foo` to `./bar` and set the
 * last modification and access times to the ones of the original source files.
 */ export async function copy(src, dest, options = {}) {
  src = resolve(toPathString(src));
  dest = resolve(toPathString(dest));
  if (src === dest) {
    throw new Error("Source and destination cannot be the same.");
  }
  const srcStat = await Deno.lstat(src);
  if (srcStat.isDirectory && isSubdir(src, dest)) {
    throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
  }
  if (srcStat.isSymlink) {
    await copySymLink(src, dest, options);
  } else if (srcStat.isDirectory) {
    await copyDir(src, dest, options);
  } else if (srcStat.isFile) {
    await copyFile(src, dest, options);
  }
}
/**
 * Synchronously copy a file or directory. The directory can have contents.
 * Like `cp -r`.
 *
 * If `src` is a directory it will copy everything inside of this directory,
 * not the entire directory itself. If `src` is a file, `dest` cannot be a
 * directory.
 *
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @param src The source file/directory path as a string or URL.
 * @param dest The destination file/directory path as a string or URL.
 * @param options Options for copying.
 * @returns A void value that returns once the copy operation completes.
 *
 * @example Basic usage
 * ```ts
 * import { copySync } from "@std/fs/copy";
 *
 * copySync("./foo", "./bar");
 * ```
 *
 * This will copy the file or directory at `./foo` to `./bar` without
 * overwriting.
 *
 * @example Overwriting files/directories
 * ```ts
 * import { copySync } from "@std/fs/copy";
 *
 * copySync("./foo", "./bar", { overwrite: true });
 * ```
 *
 * This will copy the file or directory at `./foo` to `./bar` and overwrite
 * any existing files or directories.
 *
 * @example Preserving timestamps
 * ```ts
 * import { copySync } from "@std/fs/copy";
 *
 * copySync("./foo", "./bar", { preserveTimestamps: true });
 * ```
 *
 * This will copy the file or directory at `./foo` to `./bar` and set the
 * last modification and access times to the ones of the original source files.
 */ export function copySync(src, dest, options = {}) {
  src = resolve(toPathString(src));
  dest = resolve(toPathString(dest));
  if (src === dest) {
    throw new Error("Source and destination cannot be the same.");
  }
  const srcStat = Deno.lstatSync(src);
  if (srcStat.isDirectory && isSubdir(src, dest)) {
    throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
  }
  if (srcStat.isSymlink) {
    copySymlinkSync(src, dest, options);
  } else if (srcStat.isDirectory) {
    copyDirSync(src, dest, options);
  } else if (srcStat.isFile) {
    copyFileSync(src, dest, options);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC9jb3B5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IGJhc2VuYW1lIH0gZnJvbSBcImpzcjovQHN0ZC9wYXRoQF4wLjIyNC4wL2Jhc2VuYW1lXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcImpzcjovQHN0ZC9wYXRoQF4wLjIyNC4wL2pvaW5cIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwianNyOi9Ac3RkL3BhdGhAXjAuMjI0LjAvcmVzb2x2ZVwiO1xuaW1wb3J0IHsgZW5zdXJlRGlyLCBlbnN1cmVEaXJTeW5jIH0gZnJvbSBcIi4vZW5zdXJlX2Rpci50c1wiO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcImpzcjovQHN0ZC9hc3NlcnRAXjAuMjI0LjAvYXNzZXJ0XCI7XG5pbXBvcnQgeyBnZXRGaWxlSW5mb1R5cGUgfSBmcm9tIFwiLi9fZ2V0X2ZpbGVfaW5mb190eXBlLnRzXCI7XG5pbXBvcnQgeyB0b1BhdGhTdHJpbmcgfSBmcm9tIFwiLi9fdG9fcGF0aF9zdHJpbmcudHNcIjtcbmltcG9ydCB7IGlzU3ViZGlyIH0gZnJvbSBcIi4vX2lzX3N1YmRpci50c1wiO1xuXG5jb25zdCBpc1dpbmRvd3MgPSBEZW5vLmJ1aWxkLm9zID09PSBcIndpbmRvd3NcIjtcblxuLyoqIE9wdGlvbnMgZm9yIHtAbGlua2NvZGUgY29weX0gYW5kIHtAbGlua2NvZGUgY29weVN5bmN9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb3B5T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIG92ZXJ3cml0ZSBleGlzdGluZyBmaWxlIG9yIGRpcmVjdG9yeS5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgb3ZlcndyaXRlPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFdoZW4gYHRydWVgLCB3aWxsIHNldCBsYXN0IG1vZGlmaWNhdGlvbiBhbmQgYWNjZXNzIHRpbWVzIHRvIHRoZSBvbmVzIG9mXG4gICAqIHRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZXMuIFdoZW4gYGZhbHNlYCwgdGltZXN0YW1wIGJlaGF2aW9yIGlzXG4gICAqIE9TLWRlcGVuZGVudC5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgcHJlc2VydmVUaW1lc3RhbXBzPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIEludGVybmFsQ29weU9wdGlvbnMgZXh0ZW5kcyBDb3B5T3B0aW9ucyB7XG4gIC8qKiBAZGVmYXVsdCB7ZmFsc2V9ICovXG4gIGlzRm9sZGVyPzogYm9vbGVhbjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZW5zdXJlVmFsaWRDb3B5KFxuICBzcmM6IHN0cmluZyB8IFVSTCxcbiAgZGVzdDogc3RyaW5nIHwgVVJMLFxuICBvcHRpb25zOiBJbnRlcm5hbENvcHlPcHRpb25zLFxuKTogUHJvbWlzZTxEZW5vLkZpbGVJbmZvIHwgdW5kZWZpbmVkPiB7XG4gIGxldCBkZXN0U3RhdDogRGVuby5GaWxlSW5mbztcblxuICB0cnkge1xuICAgIGRlc3RTdGF0ID0gYXdhaXQgRGVuby5sc3RhdChkZXN0KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmlzRm9sZGVyICYmICFkZXN0U3RhdC5pc0RpcmVjdG9yeSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBDYW5ub3Qgb3ZlcndyaXRlIG5vbi1kaXJlY3RvcnkgJyR7ZGVzdH0nIHdpdGggZGlyZWN0b3J5ICcke3NyY30nLmAsXG4gICAgKTtcbiAgfVxuICBpZiAoIW9wdGlvbnMub3ZlcndyaXRlKSB7XG4gICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkFscmVhZHlFeGlzdHMoYCcke2Rlc3R9JyBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgfVxuXG4gIHJldHVybiBkZXN0U3RhdDtcbn1cblxuZnVuY3Rpb24gZW5zdXJlVmFsaWRDb3B5U3luYyhcbiAgc3JjOiBzdHJpbmcgfCBVUkwsXG4gIGRlc3Q6IHN0cmluZyB8IFVSTCxcbiAgb3B0aW9uczogSW50ZXJuYWxDb3B5T3B0aW9ucyxcbik6IERlbm8uRmlsZUluZm8gfCB1bmRlZmluZWQge1xuICBsZXQgZGVzdFN0YXQ6IERlbm8uRmlsZUluZm87XG4gIHRyeSB7XG4gICAgZGVzdFN0YXQgPSBEZW5vLmxzdGF0U3luYyhkZXN0KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmlzRm9sZGVyICYmICFkZXN0U3RhdC5pc0RpcmVjdG9yeSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBDYW5ub3Qgb3ZlcndyaXRlIG5vbi1kaXJlY3RvcnkgJyR7ZGVzdH0nIHdpdGggZGlyZWN0b3J5ICcke3NyY30nLmAsXG4gICAgKTtcbiAgfVxuICBpZiAoIW9wdGlvbnMub3ZlcndyaXRlKSB7XG4gICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkFscmVhZHlFeGlzdHMoYCcke2Rlc3R9JyBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgfVxuXG4gIHJldHVybiBkZXN0U3RhdDtcbn1cblxuLyogY29weSBmaWxlIHRvIGRlc3QgKi9cbmFzeW5jIGZ1bmN0aW9uIGNvcHlGaWxlKFxuICBzcmM6IHN0cmluZyB8IFVSTCxcbiAgZGVzdDogc3RyaW5nIHwgVVJMLFxuICBvcHRpb25zOiBJbnRlcm5hbENvcHlPcHRpb25zLFxuKSB7XG4gIGF3YWl0IGVuc3VyZVZhbGlkQ29weShzcmMsIGRlc3QsIG9wdGlvbnMpO1xuICBhd2FpdCBEZW5vLmNvcHlGaWxlKHNyYywgZGVzdCk7XG4gIGlmIChvcHRpb25zLnByZXNlcnZlVGltZXN0YW1wcykge1xuICAgIGNvbnN0IHN0YXRJbmZvID0gYXdhaXQgRGVuby5zdGF0KHNyYyk7XG4gICAgYXNzZXJ0KHN0YXRJbmZvLmF0aW1lIGluc3RhbmNlb2YgRGF0ZSwgYHN0YXRJbmZvLmF0aW1lIGlzIHVuYXZhaWxhYmxlYCk7XG4gICAgYXNzZXJ0KHN0YXRJbmZvLm10aW1lIGluc3RhbmNlb2YgRGF0ZSwgYHN0YXRJbmZvLm10aW1lIGlzIHVuYXZhaWxhYmxlYCk7XG4gICAgYXdhaXQgRGVuby51dGltZShkZXN0LCBzdGF0SW5mby5hdGltZSwgc3RhdEluZm8ubXRpbWUpO1xuICB9XG59XG4vKiBjb3B5IGZpbGUgdG8gZGVzdCBzeW5jaHJvbm91c2x5ICovXG5mdW5jdGlvbiBjb3B5RmlsZVN5bmMoXG4gIHNyYzogc3RyaW5nIHwgVVJMLFxuICBkZXN0OiBzdHJpbmcgfCBVUkwsXG4gIG9wdGlvbnM6IEludGVybmFsQ29weU9wdGlvbnMsXG4pIHtcbiAgZW5zdXJlVmFsaWRDb3B5U3luYyhzcmMsIGRlc3QsIG9wdGlvbnMpO1xuICBEZW5vLmNvcHlGaWxlU3luYyhzcmMsIGRlc3QpO1xuICBpZiAob3B0aW9ucy5wcmVzZXJ2ZVRpbWVzdGFtcHMpIHtcbiAgICBjb25zdCBzdGF0SW5mbyA9IERlbm8uc3RhdFN5bmMoc3JjKTtcbiAgICBhc3NlcnQoc3RhdEluZm8uYXRpbWUgaW5zdGFuY2VvZiBEYXRlLCBgc3RhdEluZm8uYXRpbWUgaXMgdW5hdmFpbGFibGVgKTtcbiAgICBhc3NlcnQoc3RhdEluZm8ubXRpbWUgaW5zdGFuY2VvZiBEYXRlLCBgc3RhdEluZm8ubXRpbWUgaXMgdW5hdmFpbGFibGVgKTtcbiAgICBEZW5vLnV0aW1lU3luYyhkZXN0LCBzdGF0SW5mby5hdGltZSwgc3RhdEluZm8ubXRpbWUpO1xuICB9XG59XG5cbi8qIGNvcHkgc3ltbGluayB0byBkZXN0ICovXG5hc3luYyBmdW5jdGlvbiBjb3B5U3ltTGluayhcbiAgc3JjOiBzdHJpbmcgfCBVUkwsXG4gIGRlc3Q6IHN0cmluZyB8IFVSTCxcbiAgb3B0aW9uczogSW50ZXJuYWxDb3B5T3B0aW9ucyxcbikge1xuICBhd2FpdCBlbnN1cmVWYWxpZENvcHkoc3JjLCBkZXN0LCBvcHRpb25zKTtcbiAgY29uc3Qgb3JpZ2luU3JjRmlsZVBhdGggPSBhd2FpdCBEZW5vLnJlYWRMaW5rKHNyYyk7XG4gIGNvbnN0IHR5cGUgPSBnZXRGaWxlSW5mb1R5cGUoYXdhaXQgRGVuby5sc3RhdChzcmMpKTtcbiAgaWYgKGlzV2luZG93cykge1xuICAgIGF3YWl0IERlbm8uc3ltbGluayhvcmlnaW5TcmNGaWxlUGF0aCwgZGVzdCwge1xuICAgICAgdHlwZTogdHlwZSA9PT0gXCJkaXJcIiA/IFwiZGlyXCIgOiBcImZpbGVcIixcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBhd2FpdCBEZW5vLnN5bWxpbmsob3JpZ2luU3JjRmlsZVBhdGgsIGRlc3QpO1xuICB9XG4gIGlmIChvcHRpb25zLnByZXNlcnZlVGltZXN0YW1wcykge1xuICAgIGNvbnN0IHN0YXRJbmZvID0gYXdhaXQgRGVuby5sc3RhdChzcmMpO1xuICAgIGFzc2VydChzdGF0SW5mby5hdGltZSBpbnN0YW5jZW9mIERhdGUsIGBzdGF0SW5mby5hdGltZSBpcyB1bmF2YWlsYWJsZWApO1xuICAgIGFzc2VydChzdGF0SW5mby5tdGltZSBpbnN0YW5jZW9mIERhdGUsIGBzdGF0SW5mby5tdGltZSBpcyB1bmF2YWlsYWJsZWApO1xuICAgIGF3YWl0IERlbm8udXRpbWUoZGVzdCwgc3RhdEluZm8uYXRpbWUsIHN0YXRJbmZvLm10aW1lKTtcbiAgfVxufVxuXG4vKiBjb3B5IHN5bWxpbmsgdG8gZGVzdCBzeW5jaHJvbm91c2x5ICovXG5mdW5jdGlvbiBjb3B5U3ltbGlua1N5bmMoXG4gIHNyYzogc3RyaW5nIHwgVVJMLFxuICBkZXN0OiBzdHJpbmcgfCBVUkwsXG4gIG9wdGlvbnM6IEludGVybmFsQ29weU9wdGlvbnMsXG4pIHtcbiAgZW5zdXJlVmFsaWRDb3B5U3luYyhzcmMsIGRlc3QsIG9wdGlvbnMpO1xuICBjb25zdCBvcmlnaW5TcmNGaWxlUGF0aCA9IERlbm8ucmVhZExpbmtTeW5jKHNyYyk7XG4gIGNvbnN0IHR5cGUgPSBnZXRGaWxlSW5mb1R5cGUoRGVuby5sc3RhdFN5bmMoc3JjKSk7XG4gIGlmIChpc1dpbmRvd3MpIHtcbiAgICBEZW5vLnN5bWxpbmtTeW5jKG9yaWdpblNyY0ZpbGVQYXRoLCBkZXN0LCB7XG4gICAgICB0eXBlOiB0eXBlID09PSBcImRpclwiID8gXCJkaXJcIiA6IFwiZmlsZVwiLFxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIERlbm8uc3ltbGlua1N5bmMob3JpZ2luU3JjRmlsZVBhdGgsIGRlc3QpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMucHJlc2VydmVUaW1lc3RhbXBzKSB7XG4gICAgY29uc3Qgc3RhdEluZm8gPSBEZW5vLmxzdGF0U3luYyhzcmMpO1xuICAgIGFzc2VydChzdGF0SW5mby5hdGltZSBpbnN0YW5jZW9mIERhdGUsIGBzdGF0SW5mby5hdGltZSBpcyB1bmF2YWlsYWJsZWApO1xuICAgIGFzc2VydChzdGF0SW5mby5tdGltZSBpbnN0YW5jZW9mIERhdGUsIGBzdGF0SW5mby5tdGltZSBpcyB1bmF2YWlsYWJsZWApO1xuICAgIERlbm8udXRpbWVTeW5jKGRlc3QsIHN0YXRJbmZvLmF0aW1lLCBzdGF0SW5mby5tdGltZSk7XG4gIH1cbn1cblxuLyogY29weSBmb2xkZXIgZnJvbSBzcmMgdG8gZGVzdC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNvcHlEaXIoXG4gIHNyYzogc3RyaW5nIHwgVVJMLFxuICBkZXN0OiBzdHJpbmcgfCBVUkwsXG4gIG9wdGlvbnM6IENvcHlPcHRpb25zLFxuKSB7XG4gIGNvbnN0IGRlc3RTdGF0ID0gYXdhaXQgZW5zdXJlVmFsaWRDb3B5KHNyYywgZGVzdCwge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgaXNGb2xkZXI6IHRydWUsXG4gIH0pO1xuXG4gIGlmICghZGVzdFN0YXQpIHtcbiAgICBhd2FpdCBlbnN1cmVEaXIoZGVzdCk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5wcmVzZXJ2ZVRpbWVzdGFtcHMpIHtcbiAgICBjb25zdCBzcmNTdGF0SW5mbyA9IGF3YWl0IERlbm8uc3RhdChzcmMpO1xuICAgIGFzc2VydChzcmNTdGF0SW5mby5hdGltZSBpbnN0YW5jZW9mIERhdGUsIGBzdGF0SW5mby5hdGltZSBpcyB1bmF2YWlsYWJsZWApO1xuICAgIGFzc2VydChzcmNTdGF0SW5mby5tdGltZSBpbnN0YW5jZW9mIERhdGUsIGBzdGF0SW5mby5tdGltZSBpcyB1bmF2YWlsYWJsZWApO1xuICAgIGF3YWl0IERlbm8udXRpbWUoZGVzdCwgc3JjU3RhdEluZm8uYXRpbWUsIHNyY1N0YXRJbmZvLm10aW1lKTtcbiAgfVxuXG4gIHNyYyA9IHRvUGF0aFN0cmluZyhzcmMpO1xuICBkZXN0ID0gdG9QYXRoU3RyaW5nKGRlc3QpO1xuXG4gIGNvbnN0IHByb21pc2VzID0gW107XG5cbiAgZm9yIGF3YWl0IChjb25zdCBlbnRyeSBvZiBEZW5vLnJlYWREaXIoc3JjKSkge1xuICAgIGNvbnN0IHNyY1BhdGggPSBqb2luKHNyYywgZW50cnkubmFtZSk7XG4gICAgY29uc3QgZGVzdFBhdGggPSBqb2luKGRlc3QsIGJhc2VuYW1lKHNyY1BhdGggYXMgc3RyaW5nKSk7XG4gICAgaWYgKGVudHJ5LmlzU3ltbGluaykge1xuICAgICAgcHJvbWlzZXMucHVzaChjb3B5U3ltTGluayhzcmNQYXRoLCBkZXN0UGF0aCwgb3B0aW9ucykpO1xuICAgIH0gZWxzZSBpZiAoZW50cnkuaXNEaXJlY3RvcnkpIHtcbiAgICAgIHByb21pc2VzLnB1c2goY29weURpcihzcmNQYXRoLCBkZXN0UGF0aCwgb3B0aW9ucykpO1xuICAgIH0gZWxzZSBpZiAoZW50cnkuaXNGaWxlKSB7XG4gICAgICBwcm9taXNlcy5wdXNoKGNvcHlGaWxlKHNyY1BhdGgsIGRlc3RQYXRoLCBvcHRpb25zKSk7XG4gICAgfVxuICB9XG5cbiAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufVxuXG4vKiBjb3B5IGZvbGRlciBmcm9tIHNyYyB0byBkZXN0IHN5bmNocm9ub3VzbHkgKi9cbmZ1bmN0aW9uIGNvcHlEaXJTeW5jKFxuICBzcmM6IHN0cmluZyB8IFVSTCxcbiAgZGVzdDogc3RyaW5nIHwgVVJMLFxuICBvcHRpb25zOiBDb3B5T3B0aW9ucyxcbikge1xuICBjb25zdCBkZXN0U3RhdCA9IGVuc3VyZVZhbGlkQ29weVN5bmMoc3JjLCBkZXN0LCB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBpc0ZvbGRlcjogdHJ1ZSxcbiAgfSk7XG5cbiAgaWYgKCFkZXN0U3RhdCkge1xuICAgIGVuc3VyZURpclN5bmMoZGVzdCk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5wcmVzZXJ2ZVRpbWVzdGFtcHMpIHtcbiAgICBjb25zdCBzcmNTdGF0SW5mbyA9IERlbm8uc3RhdFN5bmMoc3JjKTtcbiAgICBhc3NlcnQoc3JjU3RhdEluZm8uYXRpbWUgaW5zdGFuY2VvZiBEYXRlLCBgc3RhdEluZm8uYXRpbWUgaXMgdW5hdmFpbGFibGVgKTtcbiAgICBhc3NlcnQoc3JjU3RhdEluZm8ubXRpbWUgaW5zdGFuY2VvZiBEYXRlLCBgc3RhdEluZm8ubXRpbWUgaXMgdW5hdmFpbGFibGVgKTtcbiAgICBEZW5vLnV0aW1lU3luYyhkZXN0LCBzcmNTdGF0SW5mby5hdGltZSwgc3JjU3RhdEluZm8ubXRpbWUpO1xuICB9XG5cbiAgc3JjID0gdG9QYXRoU3RyaW5nKHNyYyk7XG4gIGRlc3QgPSB0b1BhdGhTdHJpbmcoZGVzdCk7XG5cbiAgZm9yIChjb25zdCBlbnRyeSBvZiBEZW5vLnJlYWREaXJTeW5jKHNyYykpIHtcbiAgICBjb25zdCBzcmNQYXRoID0gam9pbihzcmMsIGVudHJ5Lm5hbWUpO1xuICAgIGNvbnN0IGRlc3RQYXRoID0gam9pbihkZXN0LCBiYXNlbmFtZShzcmNQYXRoIGFzIHN0cmluZykpO1xuICAgIGlmIChlbnRyeS5pc1N5bWxpbmspIHtcbiAgICAgIGNvcHlTeW1saW5rU3luYyhzcmNQYXRoLCBkZXN0UGF0aCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIGlmIChlbnRyeS5pc0RpcmVjdG9yeSkge1xuICAgICAgY29weURpclN5bmMoc3JjUGF0aCwgZGVzdFBhdGgsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAoZW50cnkuaXNGaWxlKSB7XG4gICAgICBjb3B5RmlsZVN5bmMoc3JjUGF0aCwgZGVzdFBhdGgsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFzeW5jaHJvbm91c2x5IGNvcHkgYSBmaWxlIG9yIGRpcmVjdG9yeS4gVGhlIGRpcmVjdG9yeSBjYW4gaGF2ZSBjb250ZW50cy5cbiAqIExpa2UgYGNwIC1yYC5cbiAqXG4gKiBJZiBgc3JjYCBpcyBhIGRpcmVjdG9yeSBpdCB3aWxsIGNvcHkgZXZlcnl0aGluZyBpbnNpZGUgb2YgdGhpcyBkaXJlY3RvcnksXG4gKiBub3QgdGhlIGVudGlyZSBkaXJlY3RvcnkgaXRzZWxmLiBJZiBgc3JjYCBpcyBhIGZpbGUsIGBkZXN0YCBjYW5ub3QgYmUgYVxuICogZGlyZWN0b3J5LlxuICpcbiAqIFJlcXVpcmVzIHRoZSBgLS1hbGxvdy1yZWFkYCBhbmQgYC0tYWxsb3ctd3JpdGVgIGZsYWcuXG4gKlxuICogQHBhcmFtIHNyYyBUaGUgc291cmNlIGZpbGUvZGlyZWN0b3J5IHBhdGggYXMgYSBzdHJpbmcgb3IgVVJMLlxuICogQHBhcmFtIGRlc3QgVGhlIGRlc3RpbmF0aW9uIGZpbGUvZGlyZWN0b3J5IHBhdGggYXMgYSBzdHJpbmcgb3IgVVJMLlxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgY29weWluZy5cbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIG9uY2UgdGhlIGNvcHkgb3BlcmF0aW9uIGNvbXBsZXRlcy5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNvcHkgfSBmcm9tIFwiQHN0ZC9mcy9jb3B5XCI7XG4gKlxuICogYXdhaXQgY29weShcIi4vZm9vXCIsIFwiLi9iYXJcIik7XG4gKiBgYGBcbiAqXG4gKiBUaGlzIHdpbGwgY29weSB0aGUgZmlsZSBvciBkaXJlY3RvcnkgYXQgYC4vZm9vYCB0byBgLi9iYXJgIHdpdGhvdXRcbiAqIG92ZXJ3cml0aW5nLlxuICpcbiAqIEBleGFtcGxlIE92ZXJ3cml0aW5nIGZpbGVzL2RpcmVjdG9yaWVzXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY29weSB9IGZyb20gXCJAc3RkL2ZzL2NvcHlcIjtcbiAqXG4gKiBhd2FpdCBjb3B5KFwiLi9mb29cIiwgXCIuL2JhclwiLCB7IG92ZXJ3cml0ZTogdHJ1ZSB9KTtcbiAqIGBgYFxuICpcbiAqIFRoaXMgd2lsbCBjb3B5IHRoZSBmaWxlIG9yIGRpcmVjdG9yeSBhdCBgLi9mb29gIHRvIGAuL2JhcmAgYW5kIG92ZXJ3cml0ZVxuICogYW55IGV4aXN0aW5nIGZpbGVzIG9yIGRpcmVjdG9yaWVzLlxuICpcbiAqIEBleGFtcGxlIFByZXNlcnZpbmcgdGltZXN0YW1wc1xuICogYGBgdHNcbiAqIGltcG9ydCB7IGNvcHkgfSBmcm9tIFwiQHN0ZC9mcy9jb3B5XCI7XG4gKlxuICogYXdhaXQgY29weShcIi4vZm9vXCIsIFwiLi9iYXJcIiwgeyBwcmVzZXJ2ZVRpbWVzdGFtcHM6IHRydWUgfSk7XG4gKiBgYGBcbiAqXG4gKiBUaGlzIHdpbGwgY29weSB0aGUgZmlsZSBvciBkaXJlY3RvcnkgYXQgYC4vZm9vYCB0byBgLi9iYXJgIGFuZCBzZXQgdGhlXG4gKiBsYXN0IG1vZGlmaWNhdGlvbiBhbmQgYWNjZXNzIHRpbWVzIHRvIHRoZSBvbmVzIG9mIHRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb3B5KFxuICBzcmM6IHN0cmluZyB8IFVSTCxcbiAgZGVzdDogc3RyaW5nIHwgVVJMLFxuICBvcHRpb25zOiBDb3B5T3B0aW9ucyA9IHt9LFxuKSB7XG4gIHNyYyA9IHJlc29sdmUodG9QYXRoU3RyaW5nKHNyYykpO1xuICBkZXN0ID0gcmVzb2x2ZSh0b1BhdGhTdHJpbmcoZGVzdCkpO1xuXG4gIGlmIChzcmMgPT09IGRlc3QpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGNhbm5vdCBiZSB0aGUgc2FtZS5cIik7XG4gIH1cblxuICBjb25zdCBzcmNTdGF0ID0gYXdhaXQgRGVuby5sc3RhdChzcmMpO1xuXG4gIGlmIChzcmNTdGF0LmlzRGlyZWN0b3J5ICYmIGlzU3ViZGlyKHNyYywgZGVzdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgQ2Fubm90IGNvcHkgJyR7c3JjfScgdG8gYSBzdWJkaXJlY3Rvcnkgb2YgaXRzZWxmLCAnJHtkZXN0fScuYCxcbiAgICApO1xuICB9XG5cbiAgaWYgKHNyY1N0YXQuaXNTeW1saW5rKSB7XG4gICAgYXdhaXQgY29weVN5bUxpbmsoc3JjLCBkZXN0LCBvcHRpb25zKTtcbiAgfSBlbHNlIGlmIChzcmNTdGF0LmlzRGlyZWN0b3J5KSB7XG4gICAgYXdhaXQgY29weURpcihzcmMsIGRlc3QsIG9wdGlvbnMpO1xuICB9IGVsc2UgaWYgKHNyY1N0YXQuaXNGaWxlKSB7XG4gICAgYXdhaXQgY29weUZpbGUoc3JjLCBkZXN0LCBvcHRpb25zKTtcbiAgfVxufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzbHkgY29weSBhIGZpbGUgb3IgZGlyZWN0b3J5LiBUaGUgZGlyZWN0b3J5IGNhbiBoYXZlIGNvbnRlbnRzLlxuICogTGlrZSBgY3AgLXJgLlxuICpcbiAqIElmIGBzcmNgIGlzIGEgZGlyZWN0b3J5IGl0IHdpbGwgY29weSBldmVyeXRoaW5nIGluc2lkZSBvZiB0aGlzIGRpcmVjdG9yeSxcbiAqIG5vdCB0aGUgZW50aXJlIGRpcmVjdG9yeSBpdHNlbGYuIElmIGBzcmNgIGlzIGEgZmlsZSwgYGRlc3RgIGNhbm5vdCBiZSBhXG4gKiBkaXJlY3RvcnkuXG4gKlxuICogUmVxdWlyZXMgdGhlIGAtLWFsbG93LXJlYWRgIGFuZCBgLS1hbGxvdy13cml0ZWAgZmxhZy5cbiAqXG4gKiBAcGFyYW0gc3JjIFRoZSBzb3VyY2UgZmlsZS9kaXJlY3RvcnkgcGF0aCBhcyBhIHN0cmluZyBvciBVUkwuXG4gKiBAcGFyYW0gZGVzdCBUaGUgZGVzdGluYXRpb24gZmlsZS9kaXJlY3RvcnkgcGF0aCBhcyBhIHN0cmluZyBvciBVUkwuXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBjb3B5aW5nLlxuICogQHJldHVybnMgQSB2b2lkIHZhbHVlIHRoYXQgcmV0dXJucyBvbmNlIHRoZSBjb3B5IG9wZXJhdGlvbiBjb21wbGV0ZXMuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBjb3B5U3luYyB9IGZyb20gXCJAc3RkL2ZzL2NvcHlcIjtcbiAqXG4gKiBjb3B5U3luYyhcIi4vZm9vXCIsIFwiLi9iYXJcIik7XG4gKiBgYGBcbiAqXG4gKiBUaGlzIHdpbGwgY29weSB0aGUgZmlsZSBvciBkaXJlY3RvcnkgYXQgYC4vZm9vYCB0byBgLi9iYXJgIHdpdGhvdXRcbiAqIG92ZXJ3cml0aW5nLlxuICpcbiAqIEBleGFtcGxlIE92ZXJ3cml0aW5nIGZpbGVzL2RpcmVjdG9yaWVzXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY29weVN5bmMgfSBmcm9tIFwiQHN0ZC9mcy9jb3B5XCI7XG4gKlxuICogY29weVN5bmMoXCIuL2Zvb1wiLCBcIi4vYmFyXCIsIHsgb3ZlcndyaXRlOiB0cnVlIH0pO1xuICogYGBgXG4gKlxuICogVGhpcyB3aWxsIGNvcHkgdGhlIGZpbGUgb3IgZGlyZWN0b3J5IGF0IGAuL2Zvb2AgdG8gYC4vYmFyYCBhbmQgb3ZlcndyaXRlXG4gKiBhbnkgZXhpc3RpbmcgZmlsZXMgb3IgZGlyZWN0b3JpZXMuXG4gKlxuICogQGV4YW1wbGUgUHJlc2VydmluZyB0aW1lc3RhbXBzXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY29weVN5bmMgfSBmcm9tIFwiQHN0ZC9mcy9jb3B5XCI7XG4gKlxuICogY29weVN5bmMoXCIuL2Zvb1wiLCBcIi4vYmFyXCIsIHsgcHJlc2VydmVUaW1lc3RhbXBzOiB0cnVlIH0pO1xuICogYGBgXG4gKlxuICogVGhpcyB3aWxsIGNvcHkgdGhlIGZpbGUgb3IgZGlyZWN0b3J5IGF0IGAuL2Zvb2AgdG8gYC4vYmFyYCBhbmQgc2V0IHRoZVxuICogbGFzdCBtb2RpZmljYXRpb24gYW5kIGFjY2VzcyB0aW1lcyB0byB0aGUgb25lcyBvZiB0aGUgb3JpZ2luYWwgc291cmNlIGZpbGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weVN5bmMoXG4gIHNyYzogc3RyaW5nIHwgVVJMLFxuICBkZXN0OiBzdHJpbmcgfCBVUkwsXG4gIG9wdGlvbnM6IENvcHlPcHRpb25zID0ge30sXG4pIHtcbiAgc3JjID0gcmVzb2x2ZSh0b1BhdGhTdHJpbmcoc3JjKSk7XG4gIGRlc3QgPSByZXNvbHZlKHRvUGF0aFN0cmluZyhkZXN0KSk7XG5cbiAgaWYgKHNyYyA9PT0gZGVzdCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNvdXJjZSBhbmQgZGVzdGluYXRpb24gY2Fubm90IGJlIHRoZSBzYW1lLlwiKTtcbiAgfVxuXG4gIGNvbnN0IHNyY1N0YXQgPSBEZW5vLmxzdGF0U3luYyhzcmMpO1xuXG4gIGlmIChzcmNTdGF0LmlzRGlyZWN0b3J5ICYmIGlzU3ViZGlyKHNyYywgZGVzdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgQ2Fubm90IGNvcHkgJyR7c3JjfScgdG8gYSBzdWJkaXJlY3Rvcnkgb2YgaXRzZWxmLCAnJHtkZXN0fScuYCxcbiAgICApO1xuICB9XG5cbiAgaWYgKHNyY1N0YXQuaXNTeW1saW5rKSB7XG4gICAgY29weVN5bWxpbmtTeW5jKHNyYywgZGVzdCwgb3B0aW9ucyk7XG4gIH0gZWxzZSBpZiAoc3JjU3RhdC5pc0RpcmVjdG9yeSkge1xuICAgIGNvcHlEaXJTeW5jKHNyYywgZGVzdCwgb3B0aW9ucyk7XG4gIH0gZWxzZSBpZiAoc3JjU3RhdC5pc0ZpbGUpIHtcbiAgICBjb3B5RmlsZVN5bmMoc3JjLCBkZXN0LCBvcHRpb25zKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRSxTQUFTLFFBQVEsUUFBUSxtQ0FBbUM7QUFDNUQsU0FBUyxJQUFJLFFBQVEsK0JBQStCO0FBQ3BELFNBQVMsT0FBTyxRQUFRLGtDQUFrQztBQUMxRCxTQUFTLFNBQVMsRUFBRSxhQUFhLFFBQVEsa0JBQWtCO0FBQzNELFNBQVMsTUFBTSxRQUFRLG1DQUFtQztBQUMxRCxTQUFTLGVBQWUsUUFBUSwyQkFBMkI7QUFDM0QsU0FBUyxZQUFZLFFBQVEsdUJBQXVCO0FBQ3BELFNBQVMsUUFBUSxRQUFRLGtCQUFrQjtBQUUzQyxNQUFNLFlBQVksS0FBSyxLQUFLLENBQUMsRUFBRSxLQUFLO0FBeUJwQyxlQUFlLGdCQUNiLEdBQWlCLEVBQ2pCLElBQWtCLEVBQ2xCLE9BQTRCO0VBRTVCLElBQUk7RUFFSixJQUFJO0lBQ0YsV0FBVyxNQUFNLEtBQUssS0FBSyxDQUFDO0VBQzlCLEVBQUUsT0FBTyxLQUFLO0lBQ1osSUFBSSxlQUFlLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRTtNQUN2QztJQUNGO0lBQ0EsTUFBTTtFQUNSO0VBRUEsSUFBSSxRQUFRLFFBQVEsSUFBSSxDQUFDLFNBQVMsV0FBVyxFQUFFO0lBQzdDLE1BQU0sSUFBSSxNQUNSLENBQUMsZ0NBQWdDLEVBQUUsS0FBSyxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsQ0FBQztFQUV2RTtFQUNBLElBQUksQ0FBQyxRQUFRLFNBQVMsRUFBRTtJQUN0QixNQUFNLElBQUksS0FBSyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssaUJBQWlCLENBQUM7RUFDakU7RUFFQSxPQUFPO0FBQ1Q7QUFFQSxTQUFTLG9CQUNQLEdBQWlCLEVBQ2pCLElBQWtCLEVBQ2xCLE9BQTRCO0VBRTVCLElBQUk7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
// denoCacheMetadata=3497429399251890283,18423382362092424172