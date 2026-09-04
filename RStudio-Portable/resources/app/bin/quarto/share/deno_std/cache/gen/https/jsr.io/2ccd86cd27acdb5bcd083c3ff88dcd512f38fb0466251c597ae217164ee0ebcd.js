// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { join } from "jsr:/@std/path@^0.224.0/join";
import { toPathString } from "./_to_path_string.ts";
/**
 * Asynchronously ensures that a directory is empty deletes the directory
 * contents it is not empty. If the directory does not exist, it is created.
 * The directory itself is not deleted.
 *
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @param dir The path of the directory to empty, as a string or URL.
 * @returns A void promise that resolves once the directory is empty.
 *
 * @example
 * ```ts
 * import { emptyDir } from "@std/fs/empty-dir";
 *
 * await emptyDir("./foo");
 * ```
 */ export async function emptyDir(dir) {
  try {
    const items = await Array.fromAsync(Deno.readDir(dir));
    await Promise.all(items.map((item)=>{
      if (item && item.name) {
        const filepath = join(toPathString(dir), item.name);
        return Deno.remove(filepath, {
          recursive: true
        });
      }
    }));
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
    // if not exist. then create it
    await Deno.mkdir(dir, {
      recursive: true
    });
  }
}
/**
 * Synchronously ensures that a directory is empty deletes the directory
 * contents it is not empty. If the directory does not exist, it is created.
 * The directory itself is not deleted.
 *
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @param dir The path of the directory to empty, as a string or URL.
 * @returns A void value that returns once the directory is empty.
 *
 * @example
 * ```ts
 * import { emptyDirSync } from "@std/fs/empty-dir";
 *
 * emptyDirSync("./foo");
 * ```
 */ export function emptyDirSync(dir) {
  try {
    const items = [
      ...Deno.readDirSync(dir)
    ];
    // If the directory exists, remove all entries inside it.
    while(items.length){
      const item = items.shift();
      if (item && item.name) {
        const filepath = join(toPathString(dir), item.name);
        Deno.removeSync(filepath, {
          recursive: true
        });
      }
    }
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
    // if not exist. then create it
    Deno.mkdirSync(dir, {
      recursive: true
    });
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC9lbXB0eV9kaXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB7IGpvaW4gfSBmcm9tIFwianNyOi9Ac3RkL3BhdGhAXjAuMjI0LjAvam9pblwiO1xuaW1wb3J0IHsgdG9QYXRoU3RyaW5nIH0gZnJvbSBcIi4vX3RvX3BhdGhfc3RyaW5nLnRzXCI7XG5cbi8qKlxuICogQXN5bmNocm9ub3VzbHkgZW5zdXJlcyB0aGF0IGEgZGlyZWN0b3J5IGlzIGVtcHR5IGRlbGV0ZXMgdGhlIGRpcmVjdG9yeVxuICogY29udGVudHMgaXQgaXMgbm90IGVtcHR5LiBJZiB0aGUgZGlyZWN0b3J5IGRvZXMgbm90IGV4aXN0LCBpdCBpcyBjcmVhdGVkLlxuICogVGhlIGRpcmVjdG9yeSBpdHNlbGYgaXMgbm90IGRlbGV0ZWQuXG4gKlxuICogUmVxdWlyZXMgdGhlIGAtLWFsbG93LXJlYWRgIGFuZCBgLS1hbGxvdy13cml0ZWAgZmxhZy5cbiAqXG4gKiBAcGFyYW0gZGlyIFRoZSBwYXRoIG9mIHRoZSBkaXJlY3RvcnkgdG8gZW1wdHksIGFzIGEgc3RyaW5nIG9yIFVSTC5cbiAqIEByZXR1cm5zIEEgdm9pZCBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgb25jZSB0aGUgZGlyZWN0b3J5IGlzIGVtcHR5LlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW1wdHlEaXIgfSBmcm9tIFwiQHN0ZC9mcy9lbXB0eS1kaXJcIjtcbiAqXG4gKiBhd2FpdCBlbXB0eURpcihcIi4vZm9vXCIpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbXB0eURpcihkaXI6IHN0cmluZyB8IFVSTCkge1xuICB0cnkge1xuICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgQXJyYXkuZnJvbUFzeW5jKERlbm8ucmVhZERpcihkaXIpKTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKGl0ZW1zLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgaWYgKGl0ZW0gJiYgaXRlbS5uYW1lKSB7XG4gICAgICAgIGNvbnN0IGZpbGVwYXRoID0gam9pbih0b1BhdGhTdHJpbmcoZGlyKSwgaXRlbS5uYW1lKTtcbiAgICAgICAgcmV0dXJuIERlbm8ucmVtb3ZlKGZpbGVwYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICghKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSkge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cblxuICAgIC8vIGlmIG5vdCBleGlzdC4gdGhlbiBjcmVhdGUgaXRcbiAgICBhd2FpdCBEZW5vLm1rZGlyKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91c2x5IGVuc3VyZXMgdGhhdCBhIGRpcmVjdG9yeSBpcyBlbXB0eSBkZWxldGVzIHRoZSBkaXJlY3RvcnlcbiAqIGNvbnRlbnRzIGl0IGlzIG5vdCBlbXB0eS4gSWYgdGhlIGRpcmVjdG9yeSBkb2VzIG5vdCBleGlzdCwgaXQgaXMgY3JlYXRlZC5cbiAqIFRoZSBkaXJlY3RvcnkgaXRzZWxmIGlzIG5vdCBkZWxldGVkLlxuICpcbiAqIFJlcXVpcmVzIHRoZSBgLS1hbGxvdy1yZWFkYCBhbmQgYC0tYWxsb3ctd3JpdGVgIGZsYWcuXG4gKlxuICogQHBhcmFtIGRpciBUaGUgcGF0aCBvZiB0aGUgZGlyZWN0b3J5IHRvIGVtcHR5LCBhcyBhIHN0cmluZyBvciBVUkwuXG4gKiBAcmV0dXJucyBBIHZvaWQgdmFsdWUgdGhhdCByZXR1cm5zIG9uY2UgdGhlIGRpcmVjdG9yeSBpcyBlbXB0eS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVtcHR5RGlyU3luYyB9IGZyb20gXCJAc3RkL2ZzL2VtcHR5LWRpclwiO1xuICpcbiAqIGVtcHR5RGlyU3luYyhcIi4vZm9vXCIpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbXB0eURpclN5bmMoZGlyOiBzdHJpbmcgfCBVUkwpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBpdGVtcyA9IFsuLi5EZW5vLnJlYWREaXJTeW5jKGRpcildO1xuXG4gICAgLy8gSWYgdGhlIGRpcmVjdG9yeSBleGlzdHMsIHJlbW92ZSBhbGwgZW50cmllcyBpbnNpZGUgaXQuXG4gICAgd2hpbGUgKGl0ZW1zLmxlbmd0aCkge1xuICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zLnNoaWZ0KCk7XG4gICAgICBpZiAoaXRlbSAmJiBpdGVtLm5hbWUpIHtcbiAgICAgICAgY29uc3QgZmlsZXBhdGggPSBqb2luKHRvUGF0aFN0cmluZyhkaXIpLCBpdGVtLm5hbWUpO1xuICAgICAgICBEZW5vLnJlbW92ZVN5bmMoZmlsZXBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpKSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIC8vIGlmIG5vdCBleGlzdC4gdGhlbiBjcmVhdGUgaXRcbiAgICBEZW5vLm1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLFNBQVMsSUFBSSxRQUFRLCtCQUErQjtBQUNwRCxTQUFTLFlBQVksUUFBUSx1QkFBdUI7QUFFcEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQkMsR0FDRCxPQUFPLGVBQWUsU0FBUyxHQUFpQjtFQUM5QyxJQUFJO0lBQ0YsTUFBTSxRQUFRLE1BQU0sTUFBTSxTQUFTLENBQUMsS0FBSyxPQUFPLENBQUM7SUFFakQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO01BQzNCLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtRQUNyQixNQUFNLFdBQVcsS0FBSyxhQUFhLE1BQU0sS0FBSyxJQUFJO1FBQ2xELE9BQU8sS0FBSyxNQUFNLENBQUMsVUFBVTtVQUFFLFdBQVc7UUFBSztNQUNqRDtJQUNGO0VBQ0YsRUFBRSxPQUFPLEtBQUs7SUFDWixJQUFJLENBQUMsQ0FBQyxlQUFlLEtBQUssTUFBTSxDQUFDLFFBQVEsR0FBRztNQUMxQyxNQUFNO0lBQ1I7SUFFQSwrQkFBK0I7SUFDL0IsTUFBTSxLQUFLLEtBQUssQ0FBQyxLQUFLO01BQUUsV0FBVztJQUFLO0VBQzFDO0FBQ0Y7QUFFQTs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUNELE9BQU8sU0FBUyxhQUFhLEdBQWlCO0VBQzVDLElBQUk7SUFDRixNQUFNLFFBQVE7U0FBSSxLQUFLLFdBQVcsQ0FBQztLQUFLO0lBRXhDLHlEQUF5RDtJQUN6RCxNQUFPLE1BQU0sTUFBTSxDQUFFO01BQ25CLE1BQU0sT0FBTyxNQUFNLEtBQUs7TUFDeEIsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1FBQ3JCLE1BQU0sV0FBVyxLQUFLLGFBQWEsTUFBTSxLQUFLLElBQUk7UUFDbEQsS0FBSyxVQUFVLENBQUMsVUFBVTtVQUFFLFdBQVc7UUFBSztNQUM5QztJQUNGO0VBQ0YsRUFBRSxPQUFPLEtBQUs7SUFDWixJQUFJLENBQUMsQ0FBQyxlQUFlLEtBQUssTUFBTSxDQUFDLFFBQVEsR0FBRztNQUMxQyxNQUFNO0lBQ1I7SUFDQSwrQkFBK0I7SUFDL0IsS0FBSyxTQUFTLENBQUMsS0FBSztNQUFFLFdBQVc7SUFBSztFQUN4QztBQUNGIn0=
// denoCacheMetadata=552838834673968358,911565833151446776