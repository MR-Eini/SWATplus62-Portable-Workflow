// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { isSubdir } from "./_is_subdir.ts";
import { isSamePath } from "./_is_same_path.ts";
const EXISTS_ERROR = new Deno.errors.AlreadyExists("dest already exists.");
/**
 * Error thrown in {@linkcode move} or {@linkcode moveSync} when the
 * destination is a subdirectory of the source.
 */ export class SubdirectoryMoveError extends Error {
  /** Constructs a new instance. */ constructor(src, dest){
    super(`Cannot move '${src}' to a subdirectory of itself, '${dest}'.`);
    this.name = this.constructor.name;
  }
}
/**
 * Asynchronously moves a file or directory.
 *
 * @param src The source file or directory as a string or URL.
 * @param dest The destination file or directory as a string or URL.
 * @param options Options for the move operation.
 * @returns A void promise that resolves once the operation completes.
 *
 * @example Basic usage
 * ```ts
 * import { move } from "@std/fs/move";
 *
 * await move("./foo", "./bar");
 * ```
 *
 * This will move the file or directory at `./foo` to `./bar` without
 * overwriting.
 *
 * @example Overwriting
 * ```ts
 * import { move } from "@std/fs/move";
 *
 * await move("./foo", "./bar", { overwrite: true });
 * ```
 *
 * This will move the file or directory at `./foo` to `./bar`, overwriting
 * `./bar` if it already exists.
 */ export async function move(src, dest, { overwrite = false } = {}) {
  const srcStat = await Deno.stat(src);
  if (srcStat.isDirectory && (isSubdir(src, dest) || isSamePath(src, dest))) {
    throw new SubdirectoryMoveError(src, dest);
  }
  if (overwrite) {
    if (isSamePath(src, dest)) return;
    try {
      await Deno.remove(dest, {
        recursive: true
      });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  } else {
    try {
      await Deno.lstat(dest);
      return Promise.reject(EXISTS_ERROR);
    } catch  {
    // Do nothing...
    }
  }
  await Deno.rename(src, dest);
}
/**
 * Synchronously moves a file or directory.
 *
 * @param src The source file or directory as a string or URL.
 * @param dest The destination file or directory as a string or URL.
 * @param options Options for the move operation.
 * @returns A void value that returns once the operation completes.
 *
 * @example Basic usage
 * ```ts
 * import { moveSync } from "@std/fs/move";
 *
 * moveSync("./foo", "./bar");
 * ```
 *
 * This will move the file or directory at `./foo` to `./bar` without
 * overwriting.
 *
 * @example Overwriting
 * ```ts
 * import { moveSync } from "@std/fs/move";
 *
 * moveSync("./foo", "./bar", { overwrite: true });
 * ```
 *
 * This will move the file or directory at `./foo` to `./bar`, overwriting
 * `./bar` if it already exists.
 */ export function moveSync(src, dest, { overwrite = false } = {}) {
  const srcStat = Deno.statSync(src);
  if (srcStat.isDirectory && (isSubdir(src, dest) || isSamePath(src, dest))) {
    throw new SubdirectoryMoveError(src, dest);
  }
  if (overwrite) {
    if (isSamePath(src, dest)) return;
    try {
      Deno.removeSync(dest, {
        recursive: true
      });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  } else {
    try {
      Deno.lstatSync(dest);
      throw EXISTS_ERROR;
    } catch (error) {
      if (error === EXISTS_ERROR) {
        throw error;
      }
    }
  }
  Deno.renameSync(src, dest);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC9tb3ZlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgeyBpc1N1YmRpciB9IGZyb20gXCIuL19pc19zdWJkaXIudHNcIjtcbmltcG9ydCB7IGlzU2FtZVBhdGggfSBmcm9tIFwiLi9faXNfc2FtZV9wYXRoLnRzXCI7XG5cbmNvbnN0IEVYSVNUU19FUlJPUiA9IG5ldyBEZW5vLmVycm9ycy5BbHJlYWR5RXhpc3RzKFwiZGVzdCBhbHJlYWR5IGV4aXN0cy5cIik7XG5cbi8qKlxuICogRXJyb3IgdGhyb3duIGluIHtAbGlua2NvZGUgbW92ZX0gb3Ige0BsaW5rY29kZSBtb3ZlU3luY30gd2hlbiB0aGVcbiAqIGRlc3RpbmF0aW9uIGlzIGEgc3ViZGlyZWN0b3J5IG9mIHRoZSBzb3VyY2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdWJkaXJlY3RvcnlNb3ZlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIC8qKiBDb25zdHJ1Y3RzIGEgbmV3IGluc3RhbmNlLiAqL1xuICBjb25zdHJ1Y3RvcihzcmM6IHN0cmluZyB8IFVSTCwgZGVzdDogc3RyaW5nIHwgVVJMKSB7XG4gICAgc3VwZXIoXG4gICAgICBgQ2Fubm90IG1vdmUgJyR7c3JjfScgdG8gYSBzdWJkaXJlY3Rvcnkgb2YgaXRzZWxmLCAnJHtkZXN0fScuYCxcbiAgICApO1xuICAgIHRoaXMubmFtZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZTtcbiAgfVxufVxuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBtb3ZlfSBhbmQge0BsaW5rY29kZSBtb3ZlU3luY30uICovXG5leHBvcnQgaW50ZXJmYWNlIE1vdmVPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGRlc3RpbmF0aW9uIGZpbGUgc2hvdWxkIGJlIG92ZXJ3cml0dGVuIGlmIGl0IGFscmVhZHkgZXhpc3RzLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBvdmVyd3JpdGU/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIEFzeW5jaHJvbm91c2x5IG1vdmVzIGEgZmlsZSBvciBkaXJlY3RvcnkuXG4gKlxuICogQHBhcmFtIHNyYyBUaGUgc291cmNlIGZpbGUgb3IgZGlyZWN0b3J5IGFzIGEgc3RyaW5nIG9yIFVSTC5cbiAqIEBwYXJhbSBkZXN0IFRoZSBkZXN0aW5hdGlvbiBmaWxlIG9yIGRpcmVjdG9yeSBhcyBhIHN0cmluZyBvciBVUkwuXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciB0aGUgbW92ZSBvcGVyYXRpb24uXG4gKiBAcmV0dXJucyBBIHZvaWQgcHJvbWlzZSB0aGF0IHJlc29sdmVzIG9uY2UgdGhlIG9wZXJhdGlvbiBjb21wbGV0ZXMuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBtb3ZlIH0gZnJvbSBcIkBzdGQvZnMvbW92ZVwiO1xuICpcbiAqIGF3YWl0IG1vdmUoXCIuL2Zvb1wiLCBcIi4vYmFyXCIpO1xuICogYGBgXG4gKlxuICogVGhpcyB3aWxsIG1vdmUgdGhlIGZpbGUgb3IgZGlyZWN0b3J5IGF0IGAuL2Zvb2AgdG8gYC4vYmFyYCB3aXRob3V0XG4gKiBvdmVyd3JpdGluZy5cbiAqXG4gKiBAZXhhbXBsZSBPdmVyd3JpdGluZ1xuICogYGBgdHNcbiAqIGltcG9ydCB7IG1vdmUgfSBmcm9tIFwiQHN0ZC9mcy9tb3ZlXCI7XG4gKlxuICogYXdhaXQgbW92ZShcIi4vZm9vXCIsIFwiLi9iYXJcIiwgeyBvdmVyd3JpdGU6IHRydWUgfSk7XG4gKiBgYGBcbiAqXG4gKiBUaGlzIHdpbGwgbW92ZSB0aGUgZmlsZSBvciBkaXJlY3RvcnkgYXQgYC4vZm9vYCB0byBgLi9iYXJgLCBvdmVyd3JpdGluZ1xuICogYC4vYmFyYCBpZiBpdCBhbHJlYWR5IGV4aXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1vdmUoXG4gIHNyYzogc3RyaW5nIHwgVVJMLFxuICBkZXN0OiBzdHJpbmcgfCBVUkwsXG4gIHsgb3ZlcndyaXRlID0gZmFsc2UgfTogTW92ZU9wdGlvbnMgPSB7fSxcbik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBzcmNTdGF0ID0gYXdhaXQgRGVuby5zdGF0KHNyYyk7XG5cbiAgaWYgKFxuICAgIHNyY1N0YXQuaXNEaXJlY3RvcnkgJiZcbiAgICAoaXNTdWJkaXIoc3JjLCBkZXN0KSB8fCBpc1NhbWVQYXRoKHNyYywgZGVzdCkpXG4gICkge1xuICAgIHRocm93IG5ldyBTdWJkaXJlY3RvcnlNb3ZlRXJyb3Ioc3JjLCBkZXN0KTtcbiAgfVxuXG4gIGlmIChvdmVyd3JpdGUpIHtcbiAgICBpZiAoaXNTYW1lUGF0aChzcmMsIGRlc3QpKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IERlbm8ucmVtb3ZlKGRlc3QsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSkge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IERlbm8ubHN0YXQoZGVzdCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoRVhJU1RTX0VSUk9SKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIERvIG5vdGhpbmcuLi5cbiAgICB9XG4gIH1cblxuICBhd2FpdCBEZW5vLnJlbmFtZShzcmMsIGRlc3QpO1xufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzbHkgbW92ZXMgYSBmaWxlIG9yIGRpcmVjdG9yeS5cbiAqXG4gKiBAcGFyYW0gc3JjIFRoZSBzb3VyY2UgZmlsZSBvciBkaXJlY3RvcnkgYXMgYSBzdHJpbmcgb3IgVVJMLlxuICogQHBhcmFtIGRlc3QgVGhlIGRlc3RpbmF0aW9uIGZpbGUgb3IgZGlyZWN0b3J5IGFzIGEgc3RyaW5nIG9yIFVSTC5cbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIHRoZSBtb3ZlIG9wZXJhdGlvbi5cbiAqIEByZXR1cm5zIEEgdm9pZCB2YWx1ZSB0aGF0IHJldHVybnMgb25jZSB0aGUgb3BlcmF0aW9uIGNvbXBsZXRlcy5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IG1vdmVTeW5jIH0gZnJvbSBcIkBzdGQvZnMvbW92ZVwiO1xuICpcbiAqIG1vdmVTeW5jKFwiLi9mb29cIiwgXCIuL2JhclwiKTtcbiAqIGBgYFxuICpcbiAqIFRoaXMgd2lsbCBtb3ZlIHRoZSBmaWxlIG9yIGRpcmVjdG9yeSBhdCBgLi9mb29gIHRvIGAuL2JhcmAgd2l0aG91dFxuICogb3ZlcndyaXRpbmcuXG4gKlxuICogQGV4YW1wbGUgT3ZlcndyaXRpbmdcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBtb3ZlU3luYyB9IGZyb20gXCJAc3RkL2ZzL21vdmVcIjtcbiAqXG4gKiBtb3ZlU3luYyhcIi4vZm9vXCIsIFwiLi9iYXJcIiwgeyBvdmVyd3JpdGU6IHRydWUgfSk7XG4gKiBgYGBcbiAqXG4gKiBUaGlzIHdpbGwgbW92ZSB0aGUgZmlsZSBvciBkaXJlY3RvcnkgYXQgYC4vZm9vYCB0byBgLi9iYXJgLCBvdmVyd3JpdGluZ1xuICogYC4vYmFyYCBpZiBpdCBhbHJlYWR5IGV4aXN0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1vdmVTeW5jKFxuICBzcmM6IHN0cmluZyB8IFVSTCxcbiAgZGVzdDogc3RyaW5nIHwgVVJMLFxuICB7IG92ZXJ3cml0ZSA9IGZhbHNlIH06IE1vdmVPcHRpb25zID0ge30sXG4pOiB2b2lkIHtcbiAgY29uc3Qgc3JjU3RhdCA9IERlbm8uc3RhdFN5bmMoc3JjKTtcblxuICBpZiAoXG4gICAgc3JjU3RhdC5pc0RpcmVjdG9yeSAmJlxuICAgIChpc1N1YmRpcihzcmMsIGRlc3QpIHx8IGlzU2FtZVBhdGgoc3JjLCBkZXN0KSlcbiAgKSB7XG4gICAgdGhyb3cgbmV3IFN1YmRpcmVjdG9yeU1vdmVFcnJvcihzcmMsIGRlc3QpO1xuICB9XG5cbiAgaWYgKG92ZXJ3cml0ZSkge1xuICAgIGlmIChpc1NhbWVQYXRoKHNyYywgZGVzdCkpIHJldHVybjtcbiAgICB0cnkge1xuICAgICAgRGVuby5yZW1vdmVTeW5jKGRlc3QsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSkge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIERlbm8ubHN0YXRTeW5jKGRlc3QpO1xuICAgICAgdGhyb3cgRVhJU1RTX0VSUk9SO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IgPT09IEVYSVNUU19FUlJPUikge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBEZW5vLnJlbmFtZVN5bmMoc3JjLCBkZXN0KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsU0FBUyxRQUFRLFFBQVEsa0JBQWtCO0FBQzNDLFNBQVMsVUFBVSxRQUFRLHFCQUFxQjtBQUVoRCxNQUFNLGVBQWUsSUFBSSxLQUFLLE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFFbkQ7OztDQUdDLEdBQ0QsT0FBTyxNQUFNLDhCQUE4QjtFQUN6QywrQkFBK0IsR0FDL0IsWUFBWSxHQUFpQixFQUFFLElBQWtCLENBQUU7SUFDakQsS0FBSyxDQUNILENBQUMsYUFBYSxFQUFFLElBQUksZ0NBQWdDLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFFaEUsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUk7RUFDbkM7QUFDRjtBQVlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EyQkMsR0FDRCxPQUFPLGVBQWUsS0FDcEIsR0FBaUIsRUFDakIsSUFBa0IsRUFDbEIsRUFBRSxZQUFZLEtBQUssRUFBZSxHQUFHLENBQUMsQ0FBQztFQUV2QyxNQUFNLFVBQVUsTUFBTSxLQUFLLElBQUksQ0FBQztFQUVoQyxJQUNFLFFBQVEsV0FBVyxJQUNuQixDQUFDLFNBQVMsS0FBSyxTQUFTLFdBQVcsS0FBSyxLQUFLLEdBQzdDO0lBQ0EsTUFBTSxJQUFJLHNCQUFzQixLQUFLO0VBQ3ZDO0VBRUEsSUFBSSxXQUFXO0lBQ2IsSUFBSSxXQUFXLEtBQUssT0FBTztJQUMzQixJQUFJO01BQ0YsTUFBTSxLQUFLLE1BQU0sQ0FBQyxNQUFNO1FBQUUsV0FBVztNQUFLO0lBQzVDLEVBQUUsT0FBTyxPQUFPO01BQ2QsSUFBSSxDQUFDLENBQUMsaUJBQWlCLEtBQUssTUFBTSxDQUFDLFFBQVEsR0FBRztRQUM1QyxNQUFNO01BQ1I7SUFDRjtFQUNGLE9BQU87SUFDTCxJQUFJO01BQ0YsTUFBTSxLQUFLLEtBQUssQ0FBQztNQUNqQixPQUFPLFFBQVEsTUFBTSxDQUFDO0lBQ3hCLEVBQUUsT0FBTTtJQUNOLGdCQUFnQjtJQUNsQjtFQUNGO0VBRUEsTUFBTSxLQUFLLE1BQU0sQ0FBQyxLQUFLO0FBQ3pCO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTJCQyxHQUNELE9BQU8sU0FBUyxTQUNkLEdBQWlCLEVBQ2pCLElBQWtCLEVBQ2xCLEVBQUUsWUFBWSxLQUFLLEVBQWUsR0FBRyxDQUFDLENBQUM7RUFFdkMsTUFBTSxVQUFVLEtBQUssUUFBUSxDQUFDO0VBRTlCLElBQ0UsUUFBUSxXQUFXLElBQ25CLENBQUMsU0FBUyxLQUFLLFNBQVMsV0FBVyxLQUFLLEtBQUssR0FDN0M7SUFDQSxNQUFNLElBQUksc0JBQXNCLEtBQUs7RUFDdkM7RUFFQSxJQUFJLFdBQVc7SUFDYixJQUFJLFdBQVcsS0FBSyxPQUFPO0lBQzNCLElBQUk7TUFDRixLQUFLLFVBQVUsQ0FBQyxNQUFNO1FBQUUsV0FBVztNQUFLO0lBQzFDLEVBQUUsT0FBTyxPQUFPO01BQ2QsSUFBSSxDQUFDLENBQUMsaUJBQWlCLEtBQUssTUFBTSxDQUFDLFFBQVEsR0FBRztRQUM1QyxNQUFNO01BQ1I7SUFDRjtFQUNGLE9BQU87SUFDTCxJQUFJO01BQ0YsS0FBSyxTQUFTLENBQUM7TUFDZixNQUFNO0lBQ1IsRUFBRSxPQUFPLE9BQU87TUFDZCxJQUFJLFVBQVUsY0FBYztRQUMxQixNQUFNO01BQ1I7SUFDRjtFQUNGO0VBRUEsS0FBSyxVQUFVLENBQUMsS0FBSztBQUN2QiJ9
// denoCacheMetadata=17255903039533126655,8950357833558811965