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
 * @see https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use
 *
 * @param path The path to the file or directory, as a string or URL.
 * @param options Additional options for the check.
 * @returns A promise that resolves with `true` if the path exists, `false`
 * otherwise.
 *
 * @example Recommended method
 * ```ts
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
 * possible race condition. See the above section for details.
 *
 * @example Basic usage
 * ```ts
 * import { exists } from "@std/fs/exists";
 *
 * await exists("./exists"); // true
 * await exists("./does_not_exist"); // false
 * ```
 *
 * @example Check if a path is readable
 * ```ts
 * import { exists } from "@std/fs/exists";
 *
 * await exists("./readable", { isReadable: true }); // true
 * await exists("./not_readable", { isReadable: true }); // false
 * ```
 *
 * @example Check if a path is a directory
 * ```ts
 * import { exists } from "@std/fs/exists";
 *
 * await exists("./directory", { isDirectory: true }); // true
 * await exists("./file", { isDirectory: true }); // false
 * ```
 *
 * @example Check if a path is a file
 * ```ts
 * import { exists } from "@std/fs/exists";
 *
 * await exists("./file", { isFile: true }); // true
 * await exists("./directory", { isFile: true }); // false
 * ```
 *
 * @example Check if a path is a readable directory
 * ```ts
 * import { exists } from "@std/fs/exists";
 *
 * await exists("./readable_directory", { isReadable: true, isDirectory: true }); // true
 * await exists("./not_readable_directory", { isReadable: true, isDirectory: true }); // false
 * ```
 *
 * @example Check if a path is a readable file
 * ```ts
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
        throw new TypeError("ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together.");
      }
      if (options.isDirectory && !stat.isDirectory || options.isFile && !stat.isFile) {
        return false;
      }
      if (options.isReadable) {
        if (stat.mode === null) {
          return true; // Exclusive on Non-POSIX systems
        }
        if (Deno.uid() === stat.uid) {
          return (stat.mode & 0o400) === 0o400; // User is owner and can read?
        } else if (Deno.gid() === stat.gid) {
          return (stat.mode & 0o040) === 0o040; // User group is owner and can read?
        }
        return (stat.mode & 0o004) === 0o004; // Others can read?
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
 * @see https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use
 *
 * @param path The path to the file or directory, as a string or URL.
 * @param options Additional options for the check.
 * @returns `true` if the path exists, `false` otherwise.
 *
 * @example Recommended method
 * ```ts
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
 * a possible race condition. See the above section for details.
 *
 * @example Basic usage
 * ```ts
 * import { existsSync } from "@std/fs/exists";
 *
 * existsSync("./exists"); // true
 * existsSync("./does_not_exist"); // false
 * ```
 *
 * @example Check if a path is readable
 * ```ts
 * import { existsSync } from "@std/fs/exists";
 *
 * existsSync("./readable", { isReadable: true }); // true
 * existsSync("./not_readable", { isReadable: true }); // false
 * ```
 *
 * @example Check if a path is a directory
 * ```ts
 * import { existsSync } from "@std/fs/exists";
 *
 * existsSync("./directory", { isDirectory: true }); // true
 * existsSync("./file", { isDirectory: true }); // false
 * ```
 *
 * @example Check if a path is a file
 * ```ts
 * import { existsSync } from "@std/fs/exists";
 *
 * existsSync("./file", { isFile: true }); // true
 * existsSync("./directory", { isFile: true }); // false
 * ```
 *
 * @example Check if a path is a readable directory
 * ```ts
 * import { existsSync } from "@std/fs/exists";
 *
 * existsSync("./readable_directory", { isReadable: true, isDirectory: true }); // true
 * existsSync("./not_readable_directory", { isReadable: true, isDirectory: true }); // false
 * ```
 *
 * @example Check if a path is a readable file
 * ```ts
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
        throw new TypeError("ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together.");
      }
      if (options.isDirectory && !stat.isDirectory || options.isFile && !stat.isFile) {
        return false;
      }
      if (options.isReadable) {
        if (stat.mode === null) {
          return true; // Exclusive on Non-POSIX systems
        }
        if (Deno.uid() === stat.uid) {
          return (stat.mode & 0o400) === 0o400; // User is owner and can read?
        } else if (Deno.gid() === stat.gid) {
          return (stat.mode & 0o040) === 0o040; // User group is owner and can read?
        }
        return (stat.mode & 0o004) === 0o004; // Others can read?
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC9leGlzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuLyoqIE9wdGlvbnMgZm9yIHtAbGlua2NvZGUgZXhpc3RzfSBhbmQge0BsaW5rY29kZSBleGlzdHNTeW5jLn0gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhpc3RzT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXaGVuIGB0cnVlYCwgd2lsbCBjaGVjayBpZiB0aGUgcGF0aCBpcyByZWFkYWJsZSBieSB0aGUgdXNlciBhcyB3ZWxsLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBpc1JlYWRhYmxlPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFdoZW4gYHRydWVgLCB3aWxsIGNoZWNrIGlmIHRoZSBwYXRoIGlzIGEgZGlyZWN0b3J5IGFzIHdlbGwuIERpcmVjdG9yeVxuICAgKiBzeW1saW5rcyBhcmUgaW5jbHVkZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtmYWxzZX1cbiAgICovXG4gIGlzRGlyZWN0b3J5PzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFdoZW4gYHRydWVgLCB3aWxsIGNoZWNrIGlmIHRoZSBwYXRoIGlzIGEgZmlsZSBhcyB3ZWxsLiBGaWxlIHN5bWxpbmtzIGFyZVxuICAgKiBpbmNsdWRlZC5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgaXNGaWxlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBc3luY2hyb25vdXNseSB0ZXN0IHdoZXRoZXIgb3Igbm90IHRoZSBnaXZlbiBwYXRoIGV4aXN0cyBieSBjaGVja2luZyB3aXRoXG4gKiB0aGUgZmlsZSBzeXN0ZW0uXG4gKlxuICogTm90ZTogRG8gbm90IHVzZSB0aGlzIGZ1bmN0aW9uIGlmIHBlcmZvcm1pbmcgYSBjaGVjayBiZWZvcmUgYW5vdGhlciBvcGVyYXRpb25cbiAqIG9uIHRoYXQgZmlsZS4gRG9pbmcgc28gY3JlYXRlcyBhIHJhY2UgY29uZGl0aW9uLiBJbnN0ZWFkLCBwZXJmb3JtIHRoZSBhY3R1YWxcbiAqIGZpbGUgb3BlcmF0aW9uIGRpcmVjdGx5LiBUaGlzIGZ1bmN0aW9uIGlzIG5vdCByZWNvbW1lbmRlZCBmb3IgdGhpcyB1c2UgY2FzZS5cbiAqIFNlZSB0aGUgcmVjb21tZW5kZWQgbWV0aG9kIGJlbG93LlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVGltZS1vZi1jaGVja190b190aW1lLW9mLXVzZVxuICpcbiAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIHRvIHRoZSBmaWxlIG9yIGRpcmVjdG9yeSwgYXMgYSBzdHJpbmcgb3IgVVJMLlxuICogQHBhcmFtIG9wdGlvbnMgQWRkaXRpb25hbCBvcHRpb25zIGZvciB0aGUgY2hlY2suXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIGB0cnVlYCBpZiB0aGUgcGF0aCBleGlzdHMsIGBmYWxzZWBcbiAqIG90aGVyd2lzZS5cbiAqXG4gKiBAZXhhbXBsZSBSZWNvbW1lbmRlZCBtZXRob2RcbiAqIGBgYHRzXG4gKiAvLyBOb3RpY2Ugbm8gdXNlIG9mIGV4aXN0c1xuICogdHJ5IHtcbiAqICAgYXdhaXQgRGVuby5yZW1vdmUoXCIuL2Zvb1wiLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpKSB7XG4gKiAgICAgdGhyb3cgZXJyb3I7XG4gKiAgIH1cbiAqICAgLy8gRG8gbm90aGluZy4uLlxuICogfVxuICogYGBgXG4gKlxuICogTm90aWNlIHRoYXQgYGV4aXN0cygpYCBpcyBub3QgdXNlZCBpbiB0aGUgYWJvdmUgZXhhbXBsZS4gRG9pbmcgc28gYXZvaWRzIGFcbiAqIHBvc3NpYmxlIHJhY2UgY29uZGl0aW9uLiBTZWUgdGhlIGFib3ZlIHNlY3Rpb24gZm9yIGRldGFpbHMuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBleGlzdHMgfSBmcm9tIFwiQHN0ZC9mcy9leGlzdHNcIjtcbiAqXG4gKiBhd2FpdCBleGlzdHMoXCIuL2V4aXN0c1wiKTsgLy8gdHJ1ZVxuICogYXdhaXQgZXhpc3RzKFwiLi9kb2VzX25vdF9leGlzdFwiKTsgLy8gZmFsc2VcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIENoZWNrIGlmIGEgcGF0aCBpcyByZWFkYWJsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGV4aXN0cyB9IGZyb20gXCJAc3RkL2ZzL2V4aXN0c1wiO1xuICpcbiAqIGF3YWl0IGV4aXN0cyhcIi4vcmVhZGFibGVcIiwgeyBpc1JlYWRhYmxlOiB0cnVlIH0pOyAvLyB0cnVlXG4gKiBhd2FpdCBleGlzdHMoXCIuL25vdF9yZWFkYWJsZVwiLCB7IGlzUmVhZGFibGU6IHRydWUgfSk7IC8vIGZhbHNlXG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBDaGVjayBpZiBhIHBhdGggaXMgYSBkaXJlY3RvcnlcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBleGlzdHMgfSBmcm9tIFwiQHN0ZC9mcy9leGlzdHNcIjtcbiAqXG4gKiBhd2FpdCBleGlzdHMoXCIuL2RpcmVjdG9yeVwiLCB7IGlzRGlyZWN0b3J5OiB0cnVlIH0pOyAvLyB0cnVlXG4gKiBhd2FpdCBleGlzdHMoXCIuL2ZpbGVcIiwgeyBpc0RpcmVjdG9yeTogdHJ1ZSB9KTsgLy8gZmFsc2VcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIENoZWNrIGlmIGEgcGF0aCBpcyBhIGZpbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBleGlzdHMgfSBmcm9tIFwiQHN0ZC9mcy9leGlzdHNcIjtcbiAqXG4gKiBhd2FpdCBleGlzdHMoXCIuL2ZpbGVcIiwgeyBpc0ZpbGU6IHRydWUgfSk7IC8vIHRydWVcbiAqIGF3YWl0IGV4aXN0cyhcIi4vZGlyZWN0b3J5XCIsIHsgaXNGaWxlOiB0cnVlIH0pOyAvLyBmYWxzZVxuICogYGBgXG4gKlxuICogQGV4YW1wbGUgQ2hlY2sgaWYgYSBwYXRoIGlzIGEgcmVhZGFibGUgZGlyZWN0b3J5XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZXhpc3RzIH0gZnJvbSBcIkBzdGQvZnMvZXhpc3RzXCI7XG4gKlxuICogYXdhaXQgZXhpc3RzKFwiLi9yZWFkYWJsZV9kaXJlY3RvcnlcIiwgeyBpc1JlYWRhYmxlOiB0cnVlLCBpc0RpcmVjdG9yeTogdHJ1ZSB9KTsgLy8gdHJ1ZVxuICogYXdhaXQgZXhpc3RzKFwiLi9ub3RfcmVhZGFibGVfZGlyZWN0b3J5XCIsIHsgaXNSZWFkYWJsZTogdHJ1ZSwgaXNEaXJlY3Rvcnk6IHRydWUgfSk7IC8vIGZhbHNlXG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBDaGVjayBpZiBhIHBhdGggaXMgYSByZWFkYWJsZSBmaWxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZXhpc3RzIH0gZnJvbSBcIkBzdGQvZnMvZXhpc3RzXCI7XG4gKlxuICogYXdhaXQgZXhpc3RzKFwiLi9yZWFkYWJsZV9maWxlXCIsIHsgaXNSZWFkYWJsZTogdHJ1ZSwgaXNGaWxlOiB0cnVlIH0pOyAvLyB0cnVlXG4gKiBhd2FpdCBleGlzdHMoXCIuL25vdF9yZWFkYWJsZV9maWxlXCIsIHsgaXNSZWFkYWJsZTogdHJ1ZSwgaXNGaWxlOiB0cnVlIH0pOyAvLyBmYWxzZVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGlzdHMoXG4gIHBhdGg6IHN0cmluZyB8IFVSTCxcbiAgb3B0aW9ucz86IEV4aXN0c09wdGlvbnMsXG4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzdGF0ID0gYXdhaXQgRGVuby5zdGF0KHBhdGgpO1xuICAgIGlmIChcbiAgICAgIG9wdGlvbnMgJiZcbiAgICAgIChvcHRpb25zLmlzUmVhZGFibGUgfHwgb3B0aW9ucy5pc0RpcmVjdG9yeSB8fCBvcHRpb25zLmlzRmlsZSlcbiAgICApIHtcbiAgICAgIGlmIChvcHRpb25zLmlzRGlyZWN0b3J5ICYmIG9wdGlvbnMuaXNGaWxlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJFeGlzdHNPcHRpb25zLm9wdGlvbnMuaXNEaXJlY3RvcnkgYW5kIEV4aXN0c09wdGlvbnMub3B0aW9ucy5pc0ZpbGUgbXVzdCBub3QgYmUgdHJ1ZSB0b2dldGhlci5cIixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChcbiAgICAgICAgKG9wdGlvbnMuaXNEaXJlY3RvcnkgJiYgIXN0YXQuaXNEaXJlY3RvcnkpIHx8XG4gICAgICAgIChvcHRpb25zLmlzRmlsZSAmJiAhc3RhdC5pc0ZpbGUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMuaXNSZWFkYWJsZSkge1xuICAgICAgICBpZiAoc3RhdC5tb2RlID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7IC8vIEV4Y2x1c2l2ZSBvbiBOb24tUE9TSVggc3lzdGVtc1xuICAgICAgICB9XG4gICAgICAgIGlmIChEZW5vLnVpZCgpID09PSBzdGF0LnVpZCkge1xuICAgICAgICAgIHJldHVybiAoc3RhdC5tb2RlICYgMG80MDApID09PSAwbzQwMDsgLy8gVXNlciBpcyBvd25lciBhbmQgY2FuIHJlYWQ/XG4gICAgICAgIH0gZWxzZSBpZiAoRGVuby5naWQoKSA9PT0gc3RhdC5naWQpIHtcbiAgICAgICAgICByZXR1cm4gKHN0YXQubW9kZSAmIDBvMDQwKSA9PT0gMG8wNDA7IC8vIFVzZXIgZ3JvdXAgaXMgb3duZXIgYW5kIGNhbiByZWFkP1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoc3RhdC5tb2RlICYgMG8wMDQpID09PSAwbzAwNDsgLy8gT3RoZXJzIGNhbiByZWFkP1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5QZXJtaXNzaW9uRGVuaWVkKSB7XG4gICAgICBpZiAoXG4gICAgICAgIChhd2FpdCBEZW5vLnBlcm1pc3Npb25zLnF1ZXJ5KHsgbmFtZTogXCJyZWFkXCIsIHBhdGggfSkpLnN0YXRlID09PVxuICAgICAgICAgIFwiZ3JhbnRlZFwiXG4gICAgICApIHtcbiAgICAgICAgLy8gLS1hbGxvdy1yZWFkIG5vdCBtaXNzaW5nXG4gICAgICAgIHJldHVybiAhb3B0aW9ucz8uaXNSZWFkYWJsZTsgLy8gUGVybWlzc2lvbkRlbmllZCB3YXMgcmFpc2VkIGJ5IGZpbGUgc3lzdGVtLCBzbyB0aGUgaXRlbSBleGlzdHMsIGJ1dCBjYW4ndCBiZSByZWFkXG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogU3luY2hyb25vdXNseSB0ZXN0IHdoZXRoZXIgb3Igbm90IHRoZSBnaXZlbiBwYXRoIGV4aXN0cyBieSBjaGVja2luZyB3aXRoXG4gKiB0aGUgZmlsZSBzeXN0ZW0uXG4gKlxuICogTm90ZTogRG8gbm90IHVzZSB0aGlzIGZ1bmN0aW9uIGlmIHBlcmZvcm1pbmcgYSBjaGVjayBiZWZvcmUgYW5vdGhlciBvcGVyYXRpb25cbiAqIG9uIHRoYXQgZmlsZS4gRG9pbmcgc28gY3JlYXRlcyBhIHJhY2UgY29uZGl0aW9uLiBJbnN0ZWFkLCBwZXJmb3JtIHRoZSBhY3R1YWxcbiAqIGZpbGUgb3BlcmF0aW9uIGRpcmVjdGx5LiBUaGlzIGZ1bmN0aW9uIGlzIG5vdCByZWNvbW1lbmRlZCBmb3IgdGhpcyB1c2UgY2FzZS5cbiAqIFNlZSB0aGUgcmVjb21tZW5kZWQgbWV0aG9kIGJlbG93LlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVGltZS1vZi1jaGVja190b190aW1lLW9mLXVzZVxuICpcbiAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIHRvIHRoZSBmaWxlIG9yIGRpcmVjdG9yeSwgYXMgYSBzdHJpbmcgb3IgVVJMLlxuICogQHBhcmFtIG9wdGlvbnMgQWRkaXRpb25hbCBvcHRpb25zIGZvciB0aGUgY2hlY2suXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHBhdGggZXhpc3RzLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAqXG4gKiBAZXhhbXBsZSBSZWNvbW1lbmRlZCBtZXRob2RcbiAqIGBgYHRzXG4gKiAvLyBOb3RpY2Ugbm8gdXNlIG9mIGV4aXN0c1xuICogdHJ5IHtcbiAqICAgRGVuby5yZW1vdmVTeW5jKFwiLi9mb29cIiwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSkge1xuICogICAgIHRocm93IGVycm9yO1xuICogICB9XG4gKiAgIC8vIERvIG5vdGhpbmcuLi5cbiAqIH1cbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IGBleGlzdHNTeW5jKClgIGlzIG5vdCB1c2VkIGluIHRoZSBhYm92ZSBleGFtcGxlLiBEb2luZyBzbyBhdm9pZHNcbiAqIGEgcG9zc2libGUgcmFjZSBjb25kaXRpb24uIFNlZSB0aGUgYWJvdmUgc2VjdGlvbiBmb3IgZGV0YWlscy5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwiQHN0ZC9mcy9leGlzdHNcIjtcbiAqXG4gKiBleGlzdHNTeW5jKFwiLi9leGlzdHNcIik7IC8vIHRydWVcbiAqIGV4aXN0c1N5bmMoXCIuL2RvZXNfbm90X2V4aXN0XCIpOyAvLyBmYWxzZVxuICogYGBgXG4gKlxuICogQGV4YW1wbGUgQ2hlY2sgaWYgYSBwYXRoIGlzIHJlYWRhYmxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gXCJAc3RkL2ZzL2V4aXN0c1wiO1xuICpcbiAqIGV4aXN0c1N5bmMoXCIuL3JlYWRhYmxlXCIsIHsgaXNSZWFkYWJsZTogdHJ1ZSB9KTsgLy8gdHJ1ZVxuICogZXhpc3RzU3luYyhcIi4vbm90X3JlYWRhYmxlXCIsIHsgaXNSZWFkYWJsZTogdHJ1ZSB9KTsgLy8gZmFsc2VcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIENoZWNrIGlmIGEgcGF0aCBpcyBhIGRpcmVjdG9yeVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwiQHN0ZC9mcy9leGlzdHNcIjtcbiAqXG4gKiBleGlzdHNTeW5jKFwiLi9kaXJlY3RvcnlcIiwgeyBpc0RpcmVjdG9yeTogdHJ1ZSB9KTsgLy8gdHJ1ZVxuICogZXhpc3RzU3luYyhcIi4vZmlsZVwiLCB7IGlzRGlyZWN0b3J5OiB0cnVlIH0pOyAvLyBmYWxzZVxuICogYGBgXG4gKlxuICogQGV4YW1wbGUgQ2hlY2sgaWYgYSBwYXRoIGlzIGEgZmlsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwiQHN0ZC9mcy9leGlzdHNcIjtcbiAqXG4gKiBleGlzdHNTeW5jKFwiLi9maWxlXCIsIHsgaXNGaWxlOiB0cnVlIH0pOyAvLyB0cnVlXG4gKiBleGlzdHNTeW5jKFwiLi9kaXJlY3RvcnlcIiwgeyBpc0ZpbGU6IHRydWUgfSk7IC8vIGZhbHNlXG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBDaGVjayBpZiBhIHBhdGggaXMgYSByZWFkYWJsZSBkaXJlY3RvcnlcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcIkBzdGQvZnMvZXhpc3RzXCI7XG4gKlxuICogZXhpc3RzU3luYyhcIi4vcmVhZGFibGVfZGlyZWN0b3J5XCIsIHsgaXNSZWFkYWJsZTogdHJ1ZSwgaXNEaXJlY3Rvcnk6IHRydWUgfSk7IC8vIHRydWVcbiAqIGV4aXN0c1N5bmMoXCIuL25vdF9yZWFkYWJsZV9kaXJlY3RvcnlcIiwgeyBpc1JlYWRhYmxlOiB0cnVlLCBpc0RpcmVjdG9yeTogdHJ1ZSB9KTsgLy8gZmFsc2VcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIENoZWNrIGlmIGEgcGF0aCBpcyBhIHJlYWRhYmxlIGZpbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcIkBzdGQvZnMvZXhpc3RzXCI7XG4gKlxuICogZXhpc3RzU3luYyhcIi4vcmVhZGFibGVfZmlsZVwiLCB7IGlzUmVhZGFibGU6IHRydWUsIGlzRmlsZTogdHJ1ZSB9KTsgLy8gdHJ1ZVxuICogZXhpc3RzU3luYyhcIi4vbm90X3JlYWRhYmxlX2ZpbGVcIiwgeyBpc1JlYWRhYmxlOiB0cnVlLCBpc0ZpbGU6IHRydWUgfSk7IC8vIGZhbHNlXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4aXN0c1N5bmMoXG4gIHBhdGg6IHN0cmluZyB8IFVSTCxcbiAgb3B0aW9ucz86IEV4aXN0c09wdGlvbnMsXG4pOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzdGF0ID0gRGVuby5zdGF0U3luYyhwYXRoKTtcbiAgICBpZiAoXG4gICAgICBvcHRpb25zICYmXG4gICAgICAob3B0aW9ucy5pc1JlYWRhYmxlIHx8IG9wdGlvbnMuaXNEaXJlY3RvcnkgfHwgb3B0aW9ucy5pc0ZpbGUpXG4gICAgKSB7XG4gICAgICBpZiAob3B0aW9ucy5pc0RpcmVjdG9yeSAmJiBvcHRpb25zLmlzRmlsZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiRXhpc3RzT3B0aW9ucy5vcHRpb25zLmlzRGlyZWN0b3J5IGFuZCBFeGlzdHNPcHRpb25zLm9wdGlvbnMuaXNGaWxlIG11c3Qgbm90IGJlIHRydWUgdG9nZXRoZXIuXCIsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIChvcHRpb25zLmlzRGlyZWN0b3J5ICYmICFzdGF0LmlzRGlyZWN0b3J5KSB8fFxuICAgICAgICAob3B0aW9ucy5pc0ZpbGUgJiYgIXN0YXQuaXNGaWxlKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLmlzUmVhZGFibGUpIHtcbiAgICAgICAgaWYgKHN0YXQubW9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBFeGNsdXNpdmUgb24gTm9uLVBPU0lYIHN5c3RlbXNcbiAgICAgICAgfVxuICAgICAgICBpZiAoRGVuby51aWQoKSA9PT0gc3RhdC51aWQpIHtcbiAgICAgICAgICByZXR1cm4gKHN0YXQubW9kZSAmIDBvNDAwKSA9PT0gMG80MDA7IC8vIFVzZXIgaXMgb3duZXIgYW5kIGNhbiByZWFkP1xuICAgICAgICB9IGVsc2UgaWYgKERlbm8uZ2lkKCkgPT09IHN0YXQuZ2lkKSB7XG4gICAgICAgICAgcmV0dXJuIChzdGF0Lm1vZGUgJiAwbzA0MCkgPT09IDBvMDQwOyAvLyBVc2VyIGdyb3VwIGlzIG93bmVyIGFuZCBjYW4gcmVhZD9cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKHN0YXQubW9kZSAmIDBvMDA0KSA9PT0gMG8wMDQ7IC8vIE90aGVycyBjYW4gcmVhZD9cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuUGVybWlzc2lvbkRlbmllZCkge1xuICAgICAgaWYgKFxuICAgICAgICBEZW5vLnBlcm1pc3Npb25zLnF1ZXJ5U3luYyh7IG5hbWU6IFwicmVhZFwiLCBwYXRoIH0pLnN0YXRlID09PSBcImdyYW50ZWRcIlxuICAgICAgKSB7XG4gICAgICAgIC8vIC0tYWxsb3ctcmVhZCBub3QgbWlzc2luZ1xuICAgICAgICByZXR1cm4gIW9wdGlvbnM/LmlzUmVhZGFibGU7IC8vIFBlcm1pc3Npb25EZW5pZWQgd2FzIHJhaXNlZCBieSBmaWxlIHN5c3RlbSwgc28gdGhlIGl0ZW0gZXhpc3RzLCBidXQgY2FuJ3QgYmUgcmVhZFxuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRSwrREFBK0QsR0F3Qi9EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBK0VDLEdBQ0QsT0FBTyxlQUFlLE9BQ3BCLElBQWtCLEVBQ2xCLE9BQXVCO0VBRXZCLElBQUk7SUFDRixNQUFNLE9BQU8sTUFBTSxLQUFLLElBQUksQ0FBQztJQUM3QixJQUNFLFdBQ0EsQ0FBQyxRQUFRLFVBQVUsSUFBSSxRQUFRLFdBQVcsSUFBSSxRQUFRLE1BQU0sR0FDNUQ7TUFDQSxJQUFJLFFBQVEsV0FBVyxJQUFJLFFBQVEsTUFBTSxFQUFFO1FBQ3pDLE1BQU0sSUFBSSxVQUNSO01BRUo7TUFDQSxJQUNFLEFBQUMsUUFBUSxXQUFXLElBQUksQ0FBQyxLQUFLLFdBQVcsSUFDeEMsUUFBUSxNQUFNLElBQUksQ0FBQyxLQUFLLE1BQU0sRUFDL0I7UUFDQSxPQUFPO01BQ1Q7TUFDQSxJQUFJLFFBQVEsVUFBVSxFQUFFO1FBQ3RCLElBQUksS0FBSyxJQUFJLEtBQUssTUFBTTtVQUN0QixPQUFPLE1BQU0saUNBQWlDO1FBQ2hEO1FBQ0EsSUFBSSxLQUFLLEdBQUcsT0FBTyxLQUFLLEdBQUcsRUFBRTtVQUMzQixPQUFPLENBQUMsS0FBSyxJQUFJLEdBQUcsS0FBSyxNQUFNLE9BQU8sOEJBQThCO1FBQ3RFLE9BQU8sSUFBSSxLQUFLLEdBQUcsT0FBTyxLQUFLLEdBQUcsRUFBRTtVQUNsQyxPQUFPLENBQUMsS0FBSyxJQUFJLEdBQUcsS0FBSyxNQUFNLE9BQU8sb0NBQW9DO1FBQzVFO1FBQ0EsT0FBTyxDQUFDLEtBQUssSUFBSSxHQUFHLEtBQUssTUFBTSxPQUFPLG1CQUFtQjtNQUMzRDtJQUNGO0lBQ0EsT0FBTztFQUNULEVBQUUsT0FBTyxPQUFPO0lBQ2QsSUFBSSxpQkFBaUIsS0FBSyxNQUFNLENBQUMsUUFBUSxFQUFFO01BQ3pDLE9BQU87SUFDVDtJQUNBLElBQUksaUJBQWlCLEtBQUssTUFBTSxDQUFDLGdCQUFnQixFQUFFO01BQ2pELElBQ0UsQ0FBQyxNQUFNLEtBQUssV0FBVyxDQUFDLEtBQUssQ0FBQztRQUFFLE1BQU07UUFBUTtNQUFLLEVBQUUsRUFBRSxLQUFLLEtBQzFELFdBQ0Y7UUFDQSwyQkFBMkI7UUFDM0IsT0FBTyxDQUFDLFNBQVMsWUFBWSxvRkFBb0Y7TUFDbkg7SUFDRjtJQUNBLE1BQU07RUFDUjtBQUNGO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQThFQyxHQUNELE9BQU8sU0FBUyxXQUNkLElBQWtCLEVBQ2xCLE9BQXVCO0VBRXZCLElBQUk7SUFDRixNQUFNLE9BQU8sS0FBSyxRQUFRLENBQUM7SUFDM0IsSUFDRSxXQUNBLENBQUMsUUFBUSxVQUFVLElBQUksUUFBUSxXQUFXLElBQUksUUFBUSxNQUFNLEdBQzVEO01BQ0EsSUFBSSxRQUFRLFdBQVcsSUFBSSxRQUFRLE1BQU0sRUFBRTtRQUN6QyxNQUFNLElBQUksVUFDUjtNQUVKO01BQ0EsSUFDRSxBQUFDLFFBQVEsV0FBVyxJQUFJLENBQUMsS0FBSyxXQUFXLElBQ3hDLFFBQVEsTUFBTSxJQUFJLENBQUMsS0FBSyxNQUFNLEVBQy9CO1FBQ0EsT0FBTztNQUNUO01BQ0EsSUFBSSxRQUFRLFVBQVUsRUFBRTtRQUN0QixJQUFJLEtBQUssSUFBSSxLQUFLLE1BQU07VUFDdEIsT0FBTyxNQUFNLGlDQUFpQztRQUNoRDtRQUNBLElBQUksS0FBSyxHQUFHLE9BQU8sS0FBSyxHQUFHLEVBQUU7VUFDM0IsT0FBTyxDQUFDLEtBQUssSUFBSSxHQUFHLEtBQUssTUFBTSxPQUFPLDhCQUE4QjtRQUN0RSxPQUFPLElBQUksS0FBSyxHQUFHLE9BQU8sS0FBSyxHQUFHLEVBQUU7VUFDbEMsT0FBTyxDQUFDLEtBQUssSUFBSSxHQUFHLEtBQUssTUFBTSxPQUFPLG9DQUFvQztRQUM1RTtRQUNBLE9BQU8sQ0FBQyxLQUFLLElBQUksR0FBRyxLQUFLLE1BQU0sT0FBTyxtQkFBbUI7TUFDM0Q7SUFDRjtJQUNBLE9BQU87RUFDVCxFQUFFLE9BQU8sT0FBTztJQUNkLElBQUksaUJBQWlCLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRTtNQUN6QyxPQUFPO0lBQ1Q7SUFDQSxJQUFJLGlCQUFpQixLQUFLLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtNQUNqRCxJQUNFLEtBQUssV0FBVyxDQUFDLFNBQVMsQ0FBQztRQUFFLE1BQU07UUFBUTtNQUFLLEdBQUcsS0FBSyxLQUFLLFdBQzdEO1FBQ0EsMkJBQTJCO1FBQzNCLE9BQU8sQ0FBQyxTQUFTLFlBQVksb0ZBQW9GO01BQ25IO0lBQ0Y7SUFDQSxNQUFNO0VBQ1I7QUFDRiJ9
// denoCacheMetadata=2750280163611610529,11859023021886718079