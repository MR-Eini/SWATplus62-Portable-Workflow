// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/** Options for {@linkcode exists} and {@linkcode existsSync.} */ /**
 * Asynchronously test whether or not the given path exists by checking with
 * the file system.
 *
 * Note: Do not use this function if performing a check before another operation
 * on that file. Doing so creates a race condition. Instead, perform the actual
 * file operation directly. This function is not recommended for this use case.
 * See the recommended method below.
 *
 * @see {@link https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use} for
 * more information on the time-of-check to time-of-use bug.
 *
 * Requires `--allow-read` and `--allow-sys` permissions.
 *
 * @see {@link https://docs.deno.com/runtime/manual/basics/permissions#file-system-access}
 * for more information on Deno's permissions system.
 *
 * @param path The path to the file or directory, as a string or URL.
 * @param options Additional options for the check.
 *
 * @returns A promise that resolves with `true` if the path exists, `false`
 * otherwise.
 *
 * @example Recommended method
 * ```ts no-eval
 * // Notice no use of exists
 * try {
 *   await Deno.remove("./foo", { recursive: true });
 * } catch (error) {
 *   if (!(error instanceof Deno.errors.NotFound)) {
 *     throw error;
 *   }
 *   // Do nothing...
 * }
 * ```
 *
 * Notice that `exists()` is not used in the above example. Doing so avoids a
 * possible race condition. See the above note for details.
 *
 * @example Basic usage
 * ```ts no-eval
 * import { exists } from "@std/fs/exists";
 *
 * await exists("./exists"); // true
 * await exists("./does_not_exist"); // false
 * ```
 *
 * @example Check if a path is readable
 * ```ts no-eval
 * import { exists } from "@std/fs/exists";
 *
 * await exists("./readable", { isReadable: true }); // true
 * await exists("./not_readable", { isReadable: true }); // false
 * ```
 *
 * @example Check if a path is a directory
 * ```ts no-eval
 * import { exists } from "@std/fs/exists";
 *
 * await exists("./directory", { isDirectory: true }); // true
 * await exists("./file", { isDirectory: true }); // false
 * ```
 *
 * @example Check if a path is a file
 * ```ts no-eval
 * import { exists } from "@std/fs/exists";
 *
 * await exists("./file", { isFile: true }); // true
 * await exists("./directory", { isFile: true }); // false
 * ```
 *
 * @example Check if a path is a readable directory
 * ```ts no-eval
 * import { exists } from "@std/fs/exists";
 *
 * await exists("./readable_directory", { isReadable: true, isDirectory: true }); // true
 * await exists("./not_readable_directory", { isReadable: true, isDirectory: true }); // false
 * ```
 *
 * @example Check if a path is a readable file
 * ```ts no-eval
 * import { exists } from "@std/fs/exists";
 *
 * await exists("./readable_file", { isReadable: true, isFile: true }); // true
 * await exists("./not_readable_file", { isReadable: true, isFile: true }); // false
 * ```
 */ export async function exists(path, options) {
  try {
    const stat = await Deno.stat(path);
    if (options && (options.isReadable || options.isDirectory || options.isFile)) {
      if (options.isDirectory && options.isFile) {
        throw new TypeError("ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together");
      }
      if (options.isDirectory && !stat.isDirectory || options.isFile && !stat.isFile) {
        return false;
      }
      if (options.isReadable) {
        return fileIsReadable(stat);
      }
    }
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    if (error instanceof Deno.errors.PermissionDenied) {
      if ((await Deno.permissions.query({
        name: "read",
        path
      })).state === "granted") {
        // --allow-read not missing
        return !options?.isReadable; // PermissionDenied was raised by file system, so the item exists, but can't be read
      }
    }
    throw error;
  }
}
/**
 * Synchronously test whether or not the given path exists by checking with
 * the file system.
 *
 * Note: Do not use this function if performing a check before another operation
 * on that file. Doing so creates a race condition. Instead, perform the actual
 * file operation directly. This function is not recommended for this use case.
 * See the recommended method below.
 *
 * @see {@link https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use} for
 * more information on the time-of-check to time-of-use bug.
 *
 * Requires `--allow-read` and `--allow-sys` permissions.
 *
 * @see {@link https://docs.deno.com/runtime/manual/basics/permissions#file-system-access}
 * for more information on Deno's permissions system.
 *
 * @param path The path to the file or directory, as a string or URL.
 * @param options Additional options for the check.
 *
 * @returns `true` if the path exists, `false` otherwise.
 *
 * @example Recommended method
 * ```ts no-eval
 * // Notice no use of exists
 * try {
 *   Deno.removeSync("./foo", { recursive: true });
 * } catch (error) {
 *   if (!(error instanceof Deno.errors.NotFound)) {
 *     throw error;
 *   }
 *   // Do nothing...
 * }
 * ```
 *
 * Notice that `existsSync()` is not used in the above example. Doing so avoids
 * a possible race condition. See the above note for details.
 *
 * @example Basic usage
 * ```ts no-eval
 * import { existsSync } from "@std/fs/exists";
 *
 * existsSync("./exists"); // true
 * existsSync("./does_not_exist"); // false
 * ```
 *
 * @example Check if a path is readable
 * ```ts no-eval
 * import { existsSync } from "@std/fs/exists";
 *
 * existsSync("./readable", { isReadable: true }); // true
 * existsSync("./not_readable", { isReadable: true }); // false
 * ```
 *
 * @example Check if a path is a directory
 * ```ts no-eval
 * import { existsSync } from "@std/fs/exists";
 *
 * existsSync("./directory", { isDirectory: true }); // true
 * existsSync("./file", { isDirectory: true }); // false
 * ```
 *
 * @example Check if a path is a file
 * ```ts no-eval
 * import { existsSync } from "@std/fs/exists";
 *
 * existsSync("./file", { isFile: true }); // true
 * existsSync("./directory", { isFile: true }); // false
 * ```
 *
 * @example Check if a path is a readable directory
 * ```ts no-eval
 * import { existsSync } from "@std/fs/exists";
 *
 * existsSync("./readable_directory", { isReadable: true, isDirectory: true }); // true
 * existsSync("./not_readable_directory", { isReadable: true, isDirectory: true }); // false
 * ```
 *
 * @example Check if a path is a readable file
 * ```ts no-eval
 * import { existsSync } from "@std/fs/exists";
 *
 * existsSync("./readable_file", { isReadable: true, isFile: true }); // true
 * existsSync("./not_readable_file", { isReadable: true, isFile: true }); // false
 * ```
 */ export function existsSync(path, options) {
  try {
    const stat = Deno.statSync(path);
    if (options && (options.isReadable || options.isDirectory || options.isFile)) {
      if (options.isDirectory && options.isFile) {
        throw new TypeError("ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together");
      }
      if (options.isDirectory && !stat.isDirectory || options.isFile && !stat.isFile) {
        return false;
      }
      if (options.isReadable) {
        return fileIsReadable(stat);
      }
    }
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    if (error instanceof Deno.errors.PermissionDenied) {
      if (Deno.permissions.querySync({
        name: "read",
        path
      }).state === "granted") {
        // --allow-read not missing
        return !options?.isReadable; // PermissionDenied was raised by file system, so the item exists, but can't be read
      }
    }
    throw error;
  }
}
function fileIsReadable(stat) {
  if (stat.mode === null) {
    return true; // Exclusive on Non-POSIX systems
  } else if (Deno.uid() === stat.uid) {
    return (stat.mode & 0o400) === 0o400; // User is owner and can read?
  } else if (Deno.gid() === stat.gid) {
    return (stat.mode & 0o040) === 0o040; // User group is owner and can read?
  }
  return (stat.mode & 0o004) === 0o004; // Others can read?
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMS4wLjMvZXhpc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbi8qKiBPcHRpb25zIGZvciB7QGxpbmtjb2RlIGV4aXN0c30gYW5kIHtAbGlua2NvZGUgZXhpc3RzU3luYy59ICovXG5leHBvcnQgaW50ZXJmYWNlIEV4aXN0c09wdGlvbnMge1xuICAvKipcbiAgICogV2hlbiBgdHJ1ZWAsIHdpbGwgY2hlY2sgaWYgdGhlIHBhdGggaXMgcmVhZGFibGUgYnkgdGhlIHVzZXIgYXMgd2VsbC5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgaXNSZWFkYWJsZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBXaGVuIGB0cnVlYCwgd2lsbCBjaGVjayBpZiB0aGUgcGF0aCBpcyBhIGRpcmVjdG9yeSBhcyB3ZWxsLiBEaXJlY3RvcnlcbiAgICogc3ltbGlua3MgYXJlIGluY2x1ZGVkLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBpc0RpcmVjdG9yeT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBXaGVuIGB0cnVlYCwgd2lsbCBjaGVjayBpZiB0aGUgcGF0aCBpcyBhIGZpbGUgYXMgd2VsbC4gRmlsZSBzeW1saW5rcyBhcmVcbiAgICogaW5jbHVkZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtmYWxzZX1cbiAgICovXG4gIGlzRmlsZT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogQXN5bmNocm9ub3VzbHkgdGVzdCB3aGV0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gcGF0aCBleGlzdHMgYnkgY2hlY2tpbmcgd2l0aFxuICogdGhlIGZpbGUgc3lzdGVtLlxuICpcbiAqIE5vdGU6IERvIG5vdCB1c2UgdGhpcyBmdW5jdGlvbiBpZiBwZXJmb3JtaW5nIGEgY2hlY2sgYmVmb3JlIGFub3RoZXIgb3BlcmF0aW9uXG4gKiBvbiB0aGF0IGZpbGUuIERvaW5nIHNvIGNyZWF0ZXMgYSByYWNlIGNvbmRpdGlvbi4gSW5zdGVhZCwgcGVyZm9ybSB0aGUgYWN0dWFsXG4gKiBmaWxlIG9wZXJhdGlvbiBkaXJlY3RseS4gVGhpcyBmdW5jdGlvbiBpcyBub3QgcmVjb21tZW5kZWQgZm9yIHRoaXMgdXNlIGNhc2UuXG4gKiBTZWUgdGhlIHJlY29tbWVuZGVkIG1ldGhvZCBiZWxvdy5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9UaW1lLW9mLWNoZWNrX3RvX3RpbWUtb2YtdXNlfSBmb3JcbiAqIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlIHRpbWUtb2YtY2hlY2sgdG8gdGltZS1vZi11c2UgYnVnLlxuICpcbiAqIFJlcXVpcmVzIGAtLWFsbG93LXJlYWRgIGFuZCBgLS1hbGxvdy1zeXNgIHBlcm1pc3Npb25zLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZG9jcy5kZW5vLmNvbS9ydW50aW1lL21hbnVhbC9iYXNpY3MvcGVybWlzc2lvbnMjZmlsZS1zeXN0ZW0tYWNjZXNzfVxuICogZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gRGVubydzIHBlcm1pc3Npb25zIHN5c3RlbS5cbiAqXG4gKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCB0byB0aGUgZmlsZSBvciBkaXJlY3RvcnksIGFzIGEgc3RyaW5nIG9yIFVSTC5cbiAqIEBwYXJhbSBvcHRpb25zIEFkZGl0aW9uYWwgb3B0aW9ucyBmb3IgdGhlIGNoZWNrLlxuICpcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggYHRydWVgIGlmIHRoZSBwYXRoIGV4aXN0cywgYGZhbHNlYFxuICogb3RoZXJ3aXNlLlxuICpcbiAqIEBleGFtcGxlIFJlY29tbWVuZGVkIG1ldGhvZFxuICogYGBgdHMgbm8tZXZhbFxuICogLy8gTm90aWNlIG5vIHVzZSBvZiBleGlzdHNcbiAqIHRyeSB7XG4gKiAgIGF3YWl0IERlbm8ucmVtb3ZlKFwiLi9mb29cIiwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSkge1xuICogICAgIHRocm93IGVycm9yO1xuICogICB9XG4gKiAgIC8vIERvIG5vdGhpbmcuLi5cbiAqIH1cbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IGBleGlzdHMoKWAgaXMgbm90IHVzZWQgaW4gdGhlIGFib3ZlIGV4YW1wbGUuIERvaW5nIHNvIGF2b2lkcyBhXG4gKiBwb3NzaWJsZSByYWNlIGNvbmRpdGlvbi4gU2VlIHRoZSBhYm92ZSBub3RlIGZvciBkZXRhaWxzLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQgeyBleGlzdHMgfSBmcm9tIFwiQHN0ZC9mcy9leGlzdHNcIjtcbiAqXG4gKiBhd2FpdCBleGlzdHMoXCIuL2V4aXN0c1wiKTsgLy8gdHJ1ZVxuICogYXdhaXQgZXhpc3RzKFwiLi9kb2VzX25vdF9leGlzdFwiKTsgLy8gZmFsc2VcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIENoZWNrIGlmIGEgcGF0aCBpcyByZWFkYWJsZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgZXhpc3RzIH0gZnJvbSBcIkBzdGQvZnMvZXhpc3RzXCI7XG4gKlxuICogYXdhaXQgZXhpc3RzKFwiLi9yZWFkYWJsZVwiLCB7IGlzUmVhZGFibGU6IHRydWUgfSk7IC8vIHRydWVcbiAqIGF3YWl0IGV4aXN0cyhcIi4vbm90X3JlYWRhYmxlXCIsIHsgaXNSZWFkYWJsZTogdHJ1ZSB9KTsgLy8gZmFsc2VcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIENoZWNrIGlmIGEgcGF0aCBpcyBhIGRpcmVjdG9yeVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgZXhpc3RzIH0gZnJvbSBcIkBzdGQvZnMvZXhpc3RzXCI7XG4gKlxuICogYXdhaXQgZXhpc3RzKFwiLi9kaXJlY3RvcnlcIiwgeyBpc0RpcmVjdG9yeTogdHJ1ZSB9KTsgLy8gdHJ1ZVxuICogYXdhaXQgZXhpc3RzKFwiLi9maWxlXCIsIHsgaXNEaXJlY3Rvcnk6IHRydWUgfSk7IC8vIGZhbHNlXG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBDaGVjayBpZiBhIHBhdGggaXMgYSBmaWxlXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQgeyBleGlzdHMgfSBmcm9tIFwiQHN0ZC9mcy9leGlzdHNcIjtcbiAqXG4gKiBhd2FpdCBleGlzdHMoXCIuL2ZpbGVcIiwgeyBpc0ZpbGU6IHRydWUgfSk7IC8vIHRydWVcbiAqIGF3YWl0IGV4aXN0cyhcIi4vZGlyZWN0b3J5XCIsIHsgaXNGaWxlOiB0cnVlIH0pOyAvLyBmYWxzZVxuICogYGBgXG4gKlxuICogQGV4YW1wbGUgQ2hlY2sgaWYgYSBwYXRoIGlzIGEgcmVhZGFibGUgZGlyZWN0b3J5XG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQgeyBleGlzdHMgfSBmcm9tIFwiQHN0ZC9mcy9leGlzdHNcIjtcbiAqXG4gKiBhd2FpdCBleGlzdHMoXCIuL3JlYWRhYmxlX2RpcmVjdG9yeVwiLCB7IGlzUmVhZGFibGU6IHRydWUsIGlzRGlyZWN0b3J5OiB0cnVlIH0pOyAvLyB0cnVlXG4gKiBhd2FpdCBleGlzdHMoXCIuL25vdF9yZWFkYWJsZV9kaXJlY3RvcnlcIiwgeyBpc1JlYWRhYmxlOiB0cnVlLCBpc0RpcmVjdG9yeTogdHJ1ZSB9KTsgLy8gZmFsc2VcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIENoZWNrIGlmIGEgcGF0aCBpcyBhIHJlYWRhYmxlIGZpbGVcbiAqIGBgYHRzIG5vLWV2YWxcbiAqIGltcG9ydCB7IGV4aXN0cyB9IGZyb20gXCJAc3RkL2ZzL2V4aXN0c1wiO1xuICpcbiAqIGF3YWl0IGV4aXN0cyhcIi4vcmVhZGFibGVfZmlsZVwiLCB7IGlzUmVhZGFibGU6IHRydWUsIGlzRmlsZTogdHJ1ZSB9KTsgLy8gdHJ1ZVxuICogYXdhaXQgZXhpc3RzKFwiLi9ub3RfcmVhZGFibGVfZmlsZVwiLCB7IGlzUmVhZGFibGU6IHRydWUsIGlzRmlsZTogdHJ1ZSB9KTsgLy8gZmFsc2VcbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhpc3RzKFxuICBwYXRoOiBzdHJpbmcgfCBVUkwsXG4gIG9wdGlvbnM/OiBFeGlzdHNPcHRpb25zLFxuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3RhdCA9IGF3YWl0IERlbm8uc3RhdChwYXRoKTtcbiAgICBpZiAoXG4gICAgICBvcHRpb25zICYmXG4gICAgICAob3B0aW9ucy5pc1JlYWRhYmxlIHx8IG9wdGlvbnMuaXNEaXJlY3RvcnkgfHwgb3B0aW9ucy5pc0ZpbGUpXG4gICAgKSB7XG4gICAgICBpZiAob3B0aW9ucy5pc0RpcmVjdG9yeSAmJiBvcHRpb25zLmlzRmlsZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiRXhpc3RzT3B0aW9ucy5vcHRpb25zLmlzRGlyZWN0b3J5IGFuZCBFeGlzdHNPcHRpb25zLm9wdGlvbnMuaXNGaWxlIG11c3Qgbm90IGJlIHRydWUgdG9nZXRoZXJcIixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChcbiAgICAgICAgKG9wdGlvbnMuaXNEaXJlY3RvcnkgJiYgIXN0YXQuaXNEaXJlY3RvcnkpIHx8XG4gICAgICAgIChvcHRpb25zLmlzRmlsZSAmJiAhc3RhdC5pc0ZpbGUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMuaXNSZWFkYWJsZSkge1xuICAgICAgICByZXR1cm4gZmlsZUlzUmVhZGFibGUoc3RhdCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLlBlcm1pc3Npb25EZW5pZWQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgKGF3YWl0IERlbm8ucGVybWlzc2lvbnMucXVlcnkoeyBuYW1lOiBcInJlYWRcIiwgcGF0aCB9KSkuc3RhdGUgPT09XG4gICAgICAgICAgXCJncmFudGVkXCJcbiAgICAgICkge1xuICAgICAgICAvLyAtLWFsbG93LXJlYWQgbm90IG1pc3NpbmdcbiAgICAgICAgcmV0dXJuICFvcHRpb25zPy5pc1JlYWRhYmxlOyAvLyBQZXJtaXNzaW9uRGVuaWVkIHdhcyByYWlzZWQgYnkgZmlsZSBzeXN0ZW0sIHNvIHRoZSBpdGVtIGV4aXN0cywgYnV0IGNhbid0IGJlIHJlYWRcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91c2x5IHRlc3Qgd2hldGhlciBvciBub3QgdGhlIGdpdmVuIHBhdGggZXhpc3RzIGJ5IGNoZWNraW5nIHdpdGhcbiAqIHRoZSBmaWxlIHN5c3RlbS5cbiAqXG4gKiBOb3RlOiBEbyBub3QgdXNlIHRoaXMgZnVuY3Rpb24gaWYgcGVyZm9ybWluZyBhIGNoZWNrIGJlZm9yZSBhbm90aGVyIG9wZXJhdGlvblxuICogb24gdGhhdCBmaWxlLiBEb2luZyBzbyBjcmVhdGVzIGEgcmFjZSBjb25kaXRpb24uIEluc3RlYWQsIHBlcmZvcm0gdGhlIGFjdHVhbFxuICogZmlsZSBvcGVyYXRpb24gZGlyZWN0bHkuIFRoaXMgZnVuY3Rpb24gaXMgbm90IHJlY29tbWVuZGVkIGZvciB0aGlzIHVzZSBjYXNlLlxuICogU2VlIHRoZSByZWNvbW1lbmRlZCBtZXRob2QgYmVsb3cuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVGltZS1vZi1jaGVja190b190aW1lLW9mLXVzZX0gZm9yXG4gKiBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZSB0aW1lLW9mLWNoZWNrIHRvIHRpbWUtb2YtdXNlIGJ1Zy5cbiAqXG4gKiBSZXF1aXJlcyBgLS1hbGxvdy1yZWFkYCBhbmQgYC0tYWxsb3ctc3lzYCBwZXJtaXNzaW9ucy5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RvY3MuZGVuby5jb20vcnVudGltZS9tYW51YWwvYmFzaWNzL3Blcm1pc3Npb25zI2ZpbGUtc3lzdGVtLWFjY2Vzc31cbiAqIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIERlbm8ncyBwZXJtaXNzaW9ucyBzeXN0ZW0uXG4gKlxuICogQHBhcmFtIHBhdGggVGhlIHBhdGggdG8gdGhlIGZpbGUgb3IgZGlyZWN0b3J5LCBhcyBhIHN0cmluZyBvciBVUkwuXG4gKiBAcGFyYW0gb3B0aW9ucyBBZGRpdGlvbmFsIG9wdGlvbnMgZm9yIHRoZSBjaGVjay5cbiAqXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHBhdGggZXhpc3RzLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAqXG4gKiBAZXhhbXBsZSBSZWNvbW1lbmRlZCBtZXRob2RcbiAqIGBgYHRzIG5vLWV2YWxcbiAqIC8vIE5vdGljZSBubyB1c2Ugb2YgZXhpc3RzXG4gKiB0cnkge1xuICogICBEZW5vLnJlbW92ZVN5bmMoXCIuL2Zvb1wiLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpKSB7XG4gKiAgICAgdGhyb3cgZXJyb3I7XG4gKiAgIH1cbiAqICAgLy8gRG8gbm90aGluZy4uLlxuICogfVxuICogYGBgXG4gKlxuICogTm90aWNlIHRoYXQgYGV4aXN0c1N5bmMoKWAgaXMgbm90IHVzZWQgaW4gdGhlIGFib3ZlIGV4YW1wbGUuIERvaW5nIHNvIGF2b2lkc1xuICogYSBwb3NzaWJsZSByYWNlIGNvbmRpdGlvbi4gU2VlIHRoZSBhYm92ZSBub3RlIGZvciBkZXRhaWxzLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcIkBzdGQvZnMvZXhpc3RzXCI7XG4gKlxuICogZXhpc3RzU3luYyhcIi4vZXhpc3RzXCIpOyAvLyB0cnVlXG4gKiBleGlzdHNTeW5jKFwiLi9kb2VzX25vdF9leGlzdFwiKTsgLy8gZmFsc2VcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIENoZWNrIGlmIGEgcGF0aCBpcyByZWFkYWJsZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gXCJAc3RkL2ZzL2V4aXN0c1wiO1xuICpcbiAqIGV4aXN0c1N5bmMoXCIuL3JlYWRhYmxlXCIsIHsgaXNSZWFkYWJsZTogdHJ1ZSB9KTsgLy8gdHJ1ZVxuICogZXhpc3RzU3luYyhcIi4vbm90X3JlYWRhYmxlXCIsIHsgaXNSZWFkYWJsZTogdHJ1ZSB9KTsgLy8gZmFsc2VcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIENoZWNrIGlmIGEgcGF0aCBpcyBhIGRpcmVjdG9yeVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gXCJAc3RkL2ZzL2V4aXN0c1wiO1xuICpcbiAqIGV4aXN0c1N5bmMoXCIuL2RpcmVjdG9yeVwiLCB7IGlzRGlyZWN0b3J5OiB0cnVlIH0pOyAvLyB0cnVlXG4gKiBleGlzdHNTeW5jKFwiLi9maWxlXCIsIHsgaXNEaXJlY3Rvcnk6IHRydWUgfSk7IC8vIGZhbHNlXG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBDaGVjayBpZiBhIHBhdGggaXMgYSBmaWxlXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcIkBzdGQvZnMvZXhpc3RzXCI7XG4gKlxuICogZXhpc3RzU3luYyhcIi4vZmlsZVwiLCB7IGlzRmlsZTogdHJ1ZSB9KTsgLy8gdHJ1ZVxuICogZXhpc3RzU3luYyhcIi4vZGlyZWN0b3J5XCIsIHsgaXNGaWxlOiB0cnVlIH0pOyAvLyBmYWxzZVxuICogYGBgXG4gKlxuICogQGV4YW1wbGUgQ2hlY2sgaWYgYSBwYXRoIGlzIGEgcmVhZGFibGUgZGlyZWN0b3J5XG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcIkBzdGQvZnMvZXhpc3RzXCI7XG4gKlxuICogZXhpc3RzU3luYyhcIi4vcmVhZGFibGVfZGlyZWN0b3J5XCIsIHsgaXNSZWFkYWJsZTogdHJ1ZSwgaXNEaXJlY3Rvcnk6IHRydWUgfSk7IC8vIHRydWVcbiAqIGV4aXN0c1N5bmMoXCIuL25vdF9yZWFkYWJsZV9kaXJlY3RvcnlcIiwgeyBpc1JlYWRhYmxlOiB0cnVlLCBpc0RpcmVjdG9yeTogdHJ1ZSB9KTsgLy8gZmFsc2VcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIENoZWNrIGlmIGEgcGF0aCBpcyBhIHJlYWRhYmxlIGZpbGVcbiAqIGBgYHRzIG5vLWV2YWxcbiAqIGltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwiQHN0ZC9mcy9leGlzdHNcIjtcbiAqXG4gKiBleGlzdHNTeW5jKFwiLi9yZWFkYWJsZV9maWxlXCIsIHsgaXNSZWFkYWJsZTogdHJ1ZSwgaXNGaWxlOiB0cnVlIH0pOyAvLyB0cnVlXG4gKiBleGlzdHNTeW5jKFwiLi9ub3RfcmVhZGFibGVfZmlsZVwiLCB7IGlzUmVhZGFibGU6IHRydWUsIGlzRmlsZTogdHJ1ZSB9KTsgLy8gZmFsc2VcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhpc3RzU3luYyhcbiAgcGF0aDogc3RyaW5nIHwgVVJMLFxuICBvcHRpb25zPzogRXhpc3RzT3B0aW9ucyxcbik6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIGNvbnN0IHN0YXQgPSBEZW5vLnN0YXRTeW5jKHBhdGgpO1xuICAgIGlmIChcbiAgICAgIG9wdGlvbnMgJiZcbiAgICAgIChvcHRpb25zLmlzUmVhZGFibGUgfHwgb3B0aW9ucy5pc0RpcmVjdG9yeSB8fCBvcHRpb25zLmlzRmlsZSlcbiAgICApIHtcbiAgICAgIGlmIChvcHRpb25zLmlzRGlyZWN0b3J5ICYmIG9wdGlvbnMuaXNGaWxlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJFeGlzdHNPcHRpb25zLm9wdGlvbnMuaXNEaXJlY3RvcnkgYW5kIEV4aXN0c09wdGlvbnMub3B0aW9ucy5pc0ZpbGUgbXVzdCBub3QgYmUgdHJ1ZSB0b2dldGhlclwiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKFxuICAgICAgICAob3B0aW9ucy5pc0RpcmVjdG9yeSAmJiAhc3RhdC5pc0RpcmVjdG9yeSkgfHxcbiAgICAgICAgKG9wdGlvbnMuaXNGaWxlICYmICFzdGF0LmlzRmlsZSlcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5pc1JlYWRhYmxlKSB7XG4gICAgICAgIHJldHVybiBmaWxlSXNSZWFkYWJsZShzdGF0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuUGVybWlzc2lvbkRlbmllZCkge1xuICAgICAgaWYgKFxuICAgICAgICBEZW5vLnBlcm1pc3Npb25zLnF1ZXJ5U3luYyh7IG5hbWU6IFwicmVhZFwiLCBwYXRoIH0pLnN0YXRlID09PSBcImdyYW50ZWRcIlxuICAgICAgKSB7XG4gICAgICAgIC8vIC0tYWxsb3ctcmVhZCBub3QgbWlzc2luZ1xuICAgICAgICByZXR1cm4gIW9wdGlvbnM/LmlzUmVhZGFibGU7IC8vIFBlcm1pc3Npb25EZW5pZWQgd2FzIHJhaXNlZCBieSBmaWxlIHN5c3RlbSwgc28gdGhlIGl0ZW0gZXhpc3RzLCBidXQgY2FuJ3QgYmUgcmVhZFxuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaWxlSXNSZWFkYWJsZShzdGF0OiBEZW5vLkZpbGVJbmZvKSB7XG4gIGlmIChzdGF0Lm1vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTsgLy8gRXhjbHVzaXZlIG9uIE5vbi1QT1NJWCBzeXN0ZW1zXG4gIH0gZWxzZSBpZiAoRGVuby51aWQoKSA9PT0gc3RhdC51aWQpIHtcbiAgICByZXR1cm4gKHN0YXQubW9kZSAmIDBvNDAwKSA9PT0gMG80MDA7IC8vIFVzZXIgaXMgb3duZXIgYW5kIGNhbiByZWFkP1xuICB9IGVsc2UgaWYgKERlbm8uZ2lkKCkgPT09IHN0YXQuZ2lkKSB7XG4gICAgcmV0dXJuIChzdGF0Lm1vZGUgJiAwbzA0MCkgPT09IDBvMDQwOyAvLyBVc2VyIGdyb3VwIGlzIG93bmVyIGFuZCBjYW4gcmVhZD9cbiAgfVxuICByZXR1cm4gKHN0YXQubW9kZSAmIDBvMDA0KSA9PT0gMG8wMDQ7IC8vIE90aGVycyBjYW4gcmVhZD9cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUUsK0RBQStELEdBd0IvRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FzRkMsR0FDRCxPQUFPLGVBQWUsT0FDcEIsSUFBa0IsRUFDbEIsT0FBdUI7RUFFdkIsSUFBSTtJQUNGLE1BQU0sT0FBTyxNQUFNLEtBQUssSUFBSSxDQUFDO0lBQzdCLElBQ0UsV0FDQSxDQUFDLFFBQVEsVUFBVSxJQUFJLFFBQVEsV0FBVyxJQUFJLFFBQVEsTUFBTSxHQUM1RDtNQUNBLElBQUksUUFBUSxXQUFXLElBQUksUUFBUSxNQUFNLEVBQUU7UUFDekMsTUFBTSxJQUFJLFVBQ1I7TUFFSjtNQUNBLElBQ0UsQUFBQyxRQUFRLFdB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
// denoCacheMetadata=10659112436170299451,9566917297875169634