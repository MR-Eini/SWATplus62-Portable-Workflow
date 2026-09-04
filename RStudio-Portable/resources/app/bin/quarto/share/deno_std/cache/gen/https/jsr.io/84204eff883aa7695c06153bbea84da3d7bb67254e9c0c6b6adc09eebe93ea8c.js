// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { dirname } from "jsr:/@std/path@^0.224.0/dirname";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { getFileInfoType } from "./_get_file_info_type.ts";
import { toPathString } from "./_to_path_string.ts";
/**
 * Asynchronously ensures that the file exists. If the file that is requested to
 * be created is in directories that do not exist, these directories are created.
 * If the file already exists, it is not modified.
 *
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @param filePath The path of the file to ensure, as a string or URL.
 * @returns A void promise that resolves once the file exists.
 *
 * @example
 * ```ts
 * import { ensureFile } from "@std/fs/ensure-file";
 *
 * await ensureFile("./folder/targetFile.dat");
 * ```
 */ export async function ensureFile(filePath) {
  try {
    // if file exists
    const stat = await Deno.lstat(filePath);
    if (!stat.isFile) {
      throw new Error(`Ensure path exists, expected 'file', got '${getFileInfoType(stat)}'`);
    }
  } catch (err) {
    // if file not exists
    if (err instanceof Deno.errors.NotFound) {
      // ensure dir exists
      await ensureDir(dirname(toPathString(filePath)));
      // create file
      await Deno.writeFile(filePath, new Uint8Array());
      return;
    }
    throw err;
  }
}
/**
 * Synchronously ensures that the file exists. If the file that is requested to
 * be created is in directories that do not exist, these directories are created.
 * If the file already exists, it is not modified.
 *
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @param filePath The path of the file to ensure, as a string or URL.
 * @returns A void value that returns once the file exists.
 *
 * @example
 * ```ts
 * import { ensureFileSync } from "@std/fs/ensure-file";
 *
 * ensureFileSync("./folder/targetFile.dat");
 * ```
 */ export function ensureFileSync(filePath) {
  try {
    // if file exists
    const stat = Deno.lstatSync(filePath);
    if (!stat.isFile) {
      throw new Error(`Ensure path exists, expected 'file', got '${getFileInfoType(stat)}'`);
    }
  } catch (err) {
    // if file not exists
    if (err instanceof Deno.errors.NotFound) {
      // ensure dir exists
      ensureDirSync(dirname(toPathString(filePath)));
      // create file
      Deno.writeFileSync(filePath, new Uint8Array());
      return;
    }
    throw err;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC9lbnN1cmVfZmlsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gXCJqc3I6L0BzdGQvcGF0aEBeMC4yMjQuMC9kaXJuYW1lXCI7XG5pbXBvcnQgeyBlbnN1cmVEaXIsIGVuc3VyZURpclN5bmMgfSBmcm9tIFwiLi9lbnN1cmVfZGlyLnRzXCI7XG5pbXBvcnQgeyBnZXRGaWxlSW5mb1R5cGUgfSBmcm9tIFwiLi9fZ2V0X2ZpbGVfaW5mb190eXBlLnRzXCI7XG5pbXBvcnQgeyB0b1BhdGhTdHJpbmcgfSBmcm9tIFwiLi9fdG9fcGF0aF9zdHJpbmcudHNcIjtcblxuLyoqXG4gKiBBc3luY2hyb25vdXNseSBlbnN1cmVzIHRoYXQgdGhlIGZpbGUgZXhpc3RzLiBJZiB0aGUgZmlsZSB0aGF0IGlzIHJlcXVlc3RlZCB0b1xuICogYmUgY3JlYXRlZCBpcyBpbiBkaXJlY3RvcmllcyB0aGF0IGRvIG5vdCBleGlzdCwgdGhlc2UgZGlyZWN0b3JpZXMgYXJlIGNyZWF0ZWQuXG4gKiBJZiB0aGUgZmlsZSBhbHJlYWR5IGV4aXN0cywgaXQgaXMgbm90IG1vZGlmaWVkLlxuICpcbiAqIFJlcXVpcmVzIHRoZSBgLS1hbGxvdy1yZWFkYCBhbmQgYC0tYWxsb3ctd3JpdGVgIGZsYWcuXG4gKlxuICogQHBhcmFtIGZpbGVQYXRoIFRoZSBwYXRoIG9mIHRoZSBmaWxlIHRvIGVuc3VyZSwgYXMgYSBzdHJpbmcgb3IgVVJMLlxuICogQHJldHVybnMgQSB2b2lkIHByb21pc2UgdGhhdCByZXNvbHZlcyBvbmNlIHRoZSBmaWxlIGV4aXN0cy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVuc3VyZUZpbGUgfSBmcm9tIFwiQHN0ZC9mcy9lbnN1cmUtZmlsZVwiO1xuICpcbiAqIGF3YWl0IGVuc3VyZUZpbGUoXCIuL2ZvbGRlci90YXJnZXRGaWxlLmRhdFwiKTtcbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5zdXJlRmlsZShmaWxlUGF0aDogc3RyaW5nIHwgVVJMKTogUHJvbWlzZTx2b2lkPiB7XG4gIHRyeSB7XG4gICAgLy8gaWYgZmlsZSBleGlzdHNcbiAgICBjb25zdCBzdGF0ID0gYXdhaXQgRGVuby5sc3RhdChmaWxlUGF0aCk7XG4gICAgaWYgKCFzdGF0LmlzRmlsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgRW5zdXJlIHBhdGggZXhpc3RzLCBleHBlY3RlZCAnZmlsZScsIGdvdCAnJHtnZXRGaWxlSW5mb1R5cGUoc3RhdCl9J2AsXG4gICAgICApO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gaWYgZmlsZSBub3QgZXhpc3RzXG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSB7XG4gICAgICAvLyBlbnN1cmUgZGlyIGV4aXN0c1xuICAgICAgYXdhaXQgZW5zdXJlRGlyKGRpcm5hbWUodG9QYXRoU3RyaW5nKGZpbGVQYXRoKSkpO1xuICAgICAgLy8gY3JlYXRlIGZpbGVcbiAgICAgIGF3YWl0IERlbm8ud3JpdGVGaWxlKGZpbGVQYXRoLCBuZXcgVWludDhBcnJheSgpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aHJvdyBlcnI7XG4gIH1cbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91c2x5IGVuc3VyZXMgdGhhdCB0aGUgZmlsZSBleGlzdHMuIElmIHRoZSBmaWxlIHRoYXQgaXMgcmVxdWVzdGVkIHRvXG4gKiBiZSBjcmVhdGVkIGlzIGluIGRpcmVjdG9yaWVzIHRoYXQgZG8gbm90IGV4aXN0LCB0aGVzZSBkaXJlY3RvcmllcyBhcmUgY3JlYXRlZC5cbiAqIElmIHRoZSBmaWxlIGFscmVhZHkgZXhpc3RzLCBpdCBpcyBub3QgbW9kaWZpZWQuXG4gKlxuICogUmVxdWlyZXMgdGhlIGAtLWFsbG93LXJlYWRgIGFuZCBgLS1hbGxvdy13cml0ZWAgZmxhZy5cbiAqXG4gKiBAcGFyYW0gZmlsZVBhdGggVGhlIHBhdGggb2YgdGhlIGZpbGUgdG8gZW5zdXJlLCBhcyBhIHN0cmluZyBvciBVUkwuXG4gKiBAcmV0dXJucyBBIHZvaWQgdmFsdWUgdGhhdCByZXR1cm5zIG9uY2UgdGhlIGZpbGUgZXhpc3RzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5zdXJlRmlsZVN5bmMgfSBmcm9tIFwiQHN0ZC9mcy9lbnN1cmUtZmlsZVwiO1xuICpcbiAqIGVuc3VyZUZpbGVTeW5jKFwiLi9mb2xkZXIvdGFyZ2V0RmlsZS5kYXRcIik7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUZpbGVTeW5jKGZpbGVQYXRoOiBzdHJpbmcgfCBVUkwpOiB2b2lkIHtcbiAgdHJ5IHtcbiAgICAvLyBpZiBmaWxlIGV4aXN0c1xuICAgIGNvbnN0IHN0YXQgPSBEZW5vLmxzdGF0U3luYyhmaWxlUGF0aCk7XG4gICAgaWYgKCFzdGF0LmlzRmlsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgRW5zdXJlIHBhdGggZXhpc3RzLCBleHBlY3RlZCAnZmlsZScsIGdvdCAnJHtnZXRGaWxlSW5mb1R5cGUoc3RhdCl9J2AsXG4gICAgICApO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gaWYgZmlsZSBub3QgZXhpc3RzXG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSB7XG4gICAgICAvLyBlbnN1cmUgZGlyIGV4aXN0c1xuICAgICAgZW5zdXJlRGlyU3luYyhkaXJuYW1lKHRvUGF0aFN0cmluZyhmaWxlUGF0aCkpKTtcbiAgICAgIC8vIGNyZWF0ZSBmaWxlXG4gICAgICBEZW5vLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIG5ldyBVaW50OEFycmF5KCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBlcnI7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsU0FBUyxPQUFPLFFBQVEsa0NBQWtDO0FBQzFELFNBQVMsU0FBUyxFQUFFLGFBQWEsUUFBUSxrQkFBa0I7QUFDM0QsU0FBUyxlQUFlLFFBQVEsMkJBQTJCO0FBQzNELFNBQVMsWUFBWSxRQUFRLHVCQUF1QjtBQUVwRDs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUNELE9BQU8sZUFBZSxXQUFXLFFBQXNCO0VBQ3JELElBQUk7SUFDRixpQkFBaUI7SUFDakIsTUFBTSxPQUFPLE1BQU0sS0FBSyxLQUFLLENBQUM7SUFDOUIsSUFBSSxDQUFDLEtBQUssTUFBTSxFQUFFO01BQ2hCLE1BQU0sSUFBSSxNQUNSLENBQUMsMENBQTBDLEVBQUUsZ0JBQWdCLE1BQU0sQ0FBQyxDQUFDO0lBRXpFO0VBQ0YsRUFBRSxPQUFPLEtBQUs7SUFDWixxQkFBcUI7SUFDckIsSUFBSSxlQUFlLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRTtNQUN2QyxvQkFBb0I7TUFDcEIsTUFBTSxVQUFVLFFBQVEsYUFBYTtNQUNyQyxjQUFjO01BQ2QsTUFBTSxLQUFLLFNBQVMsQ0FBQyxVQUFVLElBQUk7TUFDbkM7SUFDRjtJQUVBLE1BQU07RUFDUjtBQUNGO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQkMsR0FDRCxPQUFPLFNBQVMsZUFBZSxRQUFzQjtFQUNuRCxJQUFJO0lBQ0YsaUJBQWlCO0lBQ2pCLE1BQU0sT0FBTyxLQUFLLFNBQVMsQ0FBQztJQUM1QixJQUFJLENBQUMsS0FBSyxNQUFNLEVBQUU7TUFDaEIsTUFBTSxJQUFJLE1BQ1IsQ0FBQywwQ0FBMEMsRUFBRSxnQkFBZ0IsTUFBTSxDQUFDLENBQUM7SUFFekU7RUFDRixFQUFFLE9BQU8sS0FBSztJQUNaLHFCQUFxQjtJQUNyQixJQUFJLGVBQWUsS0FBSyxNQUFNLENBQUMsUUFBUSxFQUFFO01BQ3ZDLG9CQUFvQjtNQUNwQixjQUFjLFFBQVEsYUFBYTtNQUNuQyxjQUFjO01BQ2QsS0FBSyxhQUFhLENBQUMsVUFBVSxJQUFJO01BQ2pDO0lBQ0Y7SUFDQSxNQUFNO0VBQ1I7QUFDRiJ9
// denoCacheMetadata=14271997451997515513,4144498815437512300