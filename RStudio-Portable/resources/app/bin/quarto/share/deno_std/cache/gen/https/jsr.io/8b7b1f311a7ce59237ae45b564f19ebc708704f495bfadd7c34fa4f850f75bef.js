// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { getFileInfoType } from "./_get_file_info_type.ts";
/**
 * Asynchronously ensures that the directory exists. If the directory structure
 * does not exist, it is created. Like `mkdir -p`.
 *
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @param dir The path of the directory to ensure, as a string or URL.
 * @returns A promise that resolves once the directory exists.
 *
 * @example
 * ```ts
 * import { ensureDir } from "@std/fs/ensure-dir";
 *
 * await ensureDir("./bar");
 * ```
 */ export async function ensureDir(dir) {
  try {
    const fileInfo = await Deno.stat(dir);
    if (!fileInfo.isDirectory) {
      throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
    }
    return;
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }
  // The dir doesn't exist. Create it.
  // This can be racy. So we catch AlreadyExists and check stat again.
  try {
    await Deno.mkdir(dir, {
      recursive: true
    });
  } catch (err) {
    if (!(err instanceof Deno.errors.AlreadyExists)) {
      throw err;
    }
    const fileInfo = await Deno.stat(dir);
    if (!fileInfo.isDirectory) {
      throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
    }
  }
}
/**
 * Synchronously ensures that the directory exists. If the directory structure
 * does not exist, it is created. Like `mkdir -p`.
 *
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @param dir The path of the directory to ensure, as a string or URL.
 * @returns A void value that returns once the directory exists.
 *
 * @example
 * ```ts
 * import { ensureDir } from "@std/fs/ensure-dir";
 *
 * await ensureDir("./bar");
 * ```
 */ export function ensureDirSync(dir) {
  try {
    const fileInfo = Deno.statSync(dir);
    if (!fileInfo.isDirectory) {
      throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
    }
    return;
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }
  // The dir doesn't exist. Create it.
  // This can be racy. So we catch AlreadyExists and check stat again.
  try {
    Deno.mkdirSync(dir, {
      recursive: true
    });
  } catch (err) {
    if (!(err instanceof Deno.errors.AlreadyExists)) {
      throw err;
    }
    const fileInfo = Deno.statSync(dir);
    if (!fileInfo.isDirectory) {
      throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC9lbnN1cmVfZGlyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgeyBnZXRGaWxlSW5mb1R5cGUgfSBmcm9tIFwiLi9fZ2V0X2ZpbGVfaW5mb190eXBlLnRzXCI7XG5cbi8qKlxuICogQXN5bmNocm9ub3VzbHkgZW5zdXJlcyB0aGF0IHRoZSBkaXJlY3RvcnkgZXhpc3RzLiBJZiB0aGUgZGlyZWN0b3J5IHN0cnVjdHVyZVxuICogZG9lcyBub3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQuIExpa2UgYG1rZGlyIC1wYC5cbiAqXG4gKiBSZXF1aXJlcyB0aGUgYC0tYWxsb3ctcmVhZGAgYW5kIGAtLWFsbG93LXdyaXRlYCBmbGFnLlxuICpcbiAqIEBwYXJhbSBkaXIgVGhlIHBhdGggb2YgdGhlIGRpcmVjdG9yeSB0byBlbnN1cmUsIGFzIGEgc3RyaW5nIG9yIFVSTC5cbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIG9uY2UgdGhlIGRpcmVjdG9yeSBleGlzdHMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlbnN1cmVEaXIgfSBmcm9tIFwiQHN0ZC9mcy9lbnN1cmUtZGlyXCI7XG4gKlxuICogYXdhaXQgZW5zdXJlRGlyKFwiLi9iYXJcIik7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuc3VyZURpcihkaXI6IHN0cmluZyB8IFVSTCkge1xuICB0cnkge1xuICAgIGNvbnN0IGZpbGVJbmZvID0gYXdhaXQgRGVuby5zdGF0KGRpcik7XG4gICAgaWYgKCFmaWxlSW5mby5pc0RpcmVjdG9yeSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgRW5zdXJlIHBhdGggZXhpc3RzLCBleHBlY3RlZCAnZGlyJywgZ290ICcke1xuICAgICAgICAgIGdldEZpbGVJbmZvVHlwZShmaWxlSW5mbylcbiAgICAgICAgfSdgLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkpIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgZGlyIGRvZXNuJ3QgZXhpc3QuIENyZWF0ZSBpdC5cbiAgLy8gVGhpcyBjYW4gYmUgcmFjeS4gU28gd2UgY2F0Y2ggQWxyZWFkeUV4aXN0cyBhbmQgY2hlY2sgc3RhdCBhZ2Fpbi5cbiAgdHJ5IHtcbiAgICBhd2FpdCBEZW5vLm1rZGlyKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICghKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkFscmVhZHlFeGlzdHMpKSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZUluZm8gPSBhd2FpdCBEZW5vLnN0YXQoZGlyKTtcbiAgICBpZiAoIWZpbGVJbmZvLmlzRGlyZWN0b3J5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBFbnN1cmUgcGF0aCBleGlzdHMsIGV4cGVjdGVkICdkaXInLCBnb3QgJyR7XG4gICAgICAgICAgZ2V0RmlsZUluZm9UeXBlKGZpbGVJbmZvKVxuICAgICAgICB9J2AsXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzbHkgZW5zdXJlcyB0aGF0IHRoZSBkaXJlY3RvcnkgZXhpc3RzLiBJZiB0aGUgZGlyZWN0b3J5IHN0cnVjdHVyZVxuICogZG9lcyBub3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQuIExpa2UgYG1rZGlyIC1wYC5cbiAqXG4gKiBSZXF1aXJlcyB0aGUgYC0tYWxsb3ctcmVhZGAgYW5kIGAtLWFsbG93LXdyaXRlYCBmbGFnLlxuICpcbiAqIEBwYXJhbSBkaXIgVGhlIHBhdGggb2YgdGhlIGRpcmVjdG9yeSB0byBlbnN1cmUsIGFzIGEgc3RyaW5nIG9yIFVSTC5cbiAqIEByZXR1cm5zIEEgdm9pZCB2YWx1ZSB0aGF0IHJldHVybnMgb25jZSB0aGUgZGlyZWN0b3J5IGV4aXN0cy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVuc3VyZURpciB9IGZyb20gXCJAc3RkL2ZzL2Vuc3VyZS1kaXJcIjtcbiAqXG4gKiBhd2FpdCBlbnN1cmVEaXIoXCIuL2JhclwiKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlRGlyU3luYyhkaXI6IHN0cmluZyB8IFVSTCkge1xuICB0cnkge1xuICAgIGNvbnN0IGZpbGVJbmZvID0gRGVuby5zdGF0U3luYyhkaXIpO1xuICAgIGlmICghZmlsZUluZm8uaXNEaXJlY3RvcnkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEVuc3VyZSBwYXRoIGV4aXN0cywgZXhwZWN0ZWQgJ2RpcicsIGdvdCAnJHtcbiAgICAgICAgICBnZXRGaWxlSW5mb1R5cGUoZmlsZUluZm8pXG4gICAgICAgIH0nYCxcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpKSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIGRpciBkb2Vzbid0IGV4aXN0LiBDcmVhdGUgaXQuXG4gIC8vIFRoaXMgY2FuIGJlIHJhY3kuIFNvIHdlIGNhdGNoIEFscmVhZHlFeGlzdHMgYW5kIGNoZWNrIHN0YXQgYWdhaW4uXG4gIHRyeSB7XG4gICAgRGVuby5ta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuQWxyZWFkeUV4aXN0cykpIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlSW5mbyA9IERlbm8uc3RhdFN5bmMoZGlyKTtcbiAgICBpZiAoIWZpbGVJbmZvLmlzRGlyZWN0b3J5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBFbnN1cmUgcGF0aCBleGlzdHMsIGV4cGVjdGVkICdkaXInLCBnb3QgJyR7XG4gICAgICAgICAgZ2V0RmlsZUluZm9UeXBlKGZpbGVJbmZvKVxuICAgICAgICB9J2AsXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxTQUFTLGVBQWUsUUFBUSwyQkFBMkI7QUFFM0Q7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBQ0QsT0FBTyxlQUFlLFVBQVUsR0FBaUI7RUFDL0MsSUFBSTtJQUNGLE1BQU0sV0FBVyxNQUFNLEtBQUssSUFBSSxDQUFDO0lBQ2pDLElBQUksQ0FBQyxTQUFTLFdBQVcsRUFBRTtNQUN6QixNQUFNLElBQUksTUFDUixDQUFDLHlDQUF5QyxFQUN4QyxnQkFBZ0IsVUFDakIsQ0FBQyxDQUFDO0lBRVA7SUFDQTtFQUNGLEVBQUUsT0FBTyxLQUFLO0lBQ1osSUFBSSxDQUFDLENBQUMsZUFBZSxLQUFLLE1BQU0sQ0FBQyxRQUFRLEdBQUc7TUFDMUMsTUFBTTtJQUNSO0VBQ0Y7RUFFQSxvQ0FBb0M7RUFDcEMsb0VBQW9FO0VBQ3BFLElBQUk7SUFDRixNQUFNLEtBQUssS0FBSyxDQUFDLEtBQUs7TUFBRSxXQUFXO0lBQUs7RUFDMUMsRUFBRSxPQUFPLEtBQUs7SUFDWixJQUFJLENBQUMsQ0FBQyxlQUFlLEtBQUssTUFBTSxDQUFDLGFBQWEsR0FBRztNQUMvQyxNQUFNO0lBQ1I7SUFFQSxNQUFNLFdBQVcsTUFBTSxLQUFLLElBQUksQ0FBQztJQUNqQyxJQUFJLENBQUMsU0FBUyxXQUFXLEVBQUU7TUFDekIsTUFBTSxJQUFJLE1BQ1IsQ0FBQyx5Q0FBeUMsRUFDeEMsZ0JBQWdCLFVBQ2pCLENBQUMsQ0FBQztJQUVQO0VBQ0Y7QUFDRjtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUNELE9BQU8sU0FBUyxjQUFjLEdBQWlCO0VBQzdDLElBQUk7SUFDRixNQUFNLFdBQVcsS0FBSyxRQUFRLENBQUM7SUFDL0IsSUFBSSxDQUFDLFNBQVMsV0FBVyxFQUFFO01BQ3pCLE1BQU0sSUFBSSxNQUNSLENBQUMseUNBQXlDLEVBQ3hDLGdCQUFnQixVQUNqQixDQUFDLENBQUM7SUFFUDtJQUNBO0VBQ0YsRUFBRSxPQUFPLEtBQUs7SUFDWixJQUFJLENBQUMsQ0FBQyxlQUFlLEtBQUssTUFBTSxDQUFDLFFBQVEsR0FBRztNQUMxQyxNQUFNO0lBQ1I7RUFDRjtFQUVBLG9DQUFvQztFQUNwQyxvRUFBb0U7RUFDcEUsSUFBSTtJQUNGLEtBQUssU0FBUyxDQUFDLEtBQUs7TUFBRSxXQUFXO0lBQUs7RUFDeEMsRUFBRSxPQUFPLEtBQUs7SUFDWixJQUFJLENBQUMsQ0FBQyxlQUFlLEtBQUssTUFBTSxDQUFDLGFBQWEsR0FBRztNQUMvQyxNQUFNO0lBQ1I7SUFFQSxNQUFNLFdBQVcsS0FBSyxRQUFRLENBQUM7SUFDL0IsSUFBSSxDQUFDLFNBQVMsV0FBVyxFQUFFO01BQ3pCLE1BQU0sSUFBSSxNQUNSLENBQUMseUNBQXlDLEVBQ3hDLGdCQUFnQixVQUNqQixDQUFDLENBQUM7SUFFUDtFQUNGO0FBQ0YifQ==
// denoCacheMetadata=8904273435589107002,16873450163000842732