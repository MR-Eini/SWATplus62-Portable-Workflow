// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Write all the content of the array buffer (`arr`) to the writer (`w`).
 *
 * @example Writing to stdout
 * ```ts no-assert
 * import { writeAll } from "@std/io/write-all";
 *
 * const contentBytes = new TextEncoder().encode("Hello World");
 * await writeAll(Deno.stdout, contentBytes);
 * ```
 *
 * @example Writing to file
 * ```ts no-eval no-assert
 * import { writeAll } from "@std/io/write-all";
 *
 * const contentBytes = new TextEncoder().encode("Hello World");
 * using file = await Deno.open('test.file', { write: true });
 * await writeAll(file, contentBytes);
 * ```
 *
 * @param writer The writer to write to
 * @param data The data to write
 */ export async function writeAll(writer, data) {
  let nwritten = 0;
  while(nwritten < data.length){
    nwritten += await writer.write(data.subarray(nwritten));
  }
}
/**
 * Synchronously write all the content of the array buffer (`arr`) to the
 * writer (`w`).
 *
 * @example "riting to stdout
 * ```ts no-assert
 * import { writeAllSync } from "@std/io/write-all";
 *
 * const contentBytes = new TextEncoder().encode("Hello World");
 * writeAllSync(Deno.stdout, contentBytes);
 * ```
 *
 * @example Writing to file
 * ```ts no-eval no-assert
 * import { writeAllSync } from "@std/io/write-all";
 *
 * const contentBytes = new TextEncoder().encode("Hello World");
 * using file = Deno.openSync("test.file", { write: true });
 * writeAllSync(file, contentBytes);
 * ```
 *
 * @param writer The writer to write to
 * @param data The data to write
 */ export function writeAllSync(writer, data) {
  let nwritten = 0;
  while(nwritten < data.length){
    nwritten += writer.writeSync(data.subarray(nwritten));
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC93cml0ZV9hbGwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHR5cGUgeyBXcml0ZXIsIFdyaXRlclN5bmMgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuXG4vKipcbiAqIFdyaXRlIGFsbCB0aGUgY29udGVudCBvZiB0aGUgYXJyYXkgYnVmZmVyIChgYXJyYCkgdG8gdGhlIHdyaXRlciAoYHdgKS5cbiAqXG4gKiBAZXhhbXBsZSBXcml0aW5nIHRvIHN0ZG91dFxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyB3cml0ZUFsbCB9IGZyb20gXCJAc3RkL2lvL3dyaXRlLWFsbFwiO1xuICpcbiAqIGNvbnN0IGNvbnRlbnRCeXRlcyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcIkhlbGxvIFdvcmxkXCIpO1xuICogYXdhaXQgd3JpdGVBbGwoRGVuby5zdGRvdXQsIGNvbnRlbnRCeXRlcyk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBXcml0aW5nIHRvIGZpbGVcbiAqIGBgYHRzIG5vLWV2YWwgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyB3cml0ZUFsbCB9IGZyb20gXCJAc3RkL2lvL3dyaXRlLWFsbFwiO1xuICpcbiAqIGNvbnN0IGNvbnRlbnRCeXRlcyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcIkhlbGxvIFdvcmxkXCIpO1xuICogdXNpbmcgZmlsZSA9IGF3YWl0IERlbm8ub3BlbigndGVzdC5maWxlJywgeyB3cml0ZTogdHJ1ZSB9KTtcbiAqIGF3YWl0IHdyaXRlQWxsKGZpbGUsIGNvbnRlbnRCeXRlcyk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gd3JpdGVyIFRoZSB3cml0ZXIgdG8gd3JpdGUgdG9cbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIHdyaXRlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZUFsbCh3cml0ZXI6IFdyaXRlciwgZGF0YTogVWludDhBcnJheSkge1xuICBsZXQgbndyaXR0ZW4gPSAwO1xuICB3aGlsZSAobndyaXR0ZW4gPCBkYXRhLmxlbmd0aCkge1xuICAgIG53cml0dGVuICs9IGF3YWl0IHdyaXRlci53cml0ZShkYXRhLnN1YmFycmF5KG53cml0dGVuKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91c2x5IHdyaXRlIGFsbCB0aGUgY29udGVudCBvZiB0aGUgYXJyYXkgYnVmZmVyIChgYXJyYCkgdG8gdGhlXG4gKiB3cml0ZXIgKGB3YCkuXG4gKlxuICogQGV4YW1wbGUgXCJyaXRpbmcgdG8gc3Rkb3V0XG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHdyaXRlQWxsU3luYyB9IGZyb20gXCJAc3RkL2lvL3dyaXRlLWFsbFwiO1xuICpcbiAqIGNvbnN0IGNvbnRlbnRCeXRlcyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcIkhlbGxvIFdvcmxkXCIpO1xuICogd3JpdGVBbGxTeW5jKERlbm8uc3Rkb3V0LCBjb250ZW50Qnl0ZXMpO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgV3JpdGluZyB0byBmaWxlXG4gKiBgYGB0cyBuby1ldmFsIG5vLWFzc2VydFxuICogaW1wb3J0IHsgd3JpdGVBbGxTeW5jIH0gZnJvbSBcIkBzdGQvaW8vd3JpdGUtYWxsXCI7XG4gKlxuICogY29uc3QgY29udGVudEJ5dGVzID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFwiSGVsbG8gV29ybGRcIik7XG4gKiB1c2luZyBmaWxlID0gRGVuby5vcGVuU3luYyhcInRlc3QuZmlsZVwiLCB7IHdyaXRlOiB0cnVlIH0pO1xuICogd3JpdGVBbGxTeW5jKGZpbGUsIGNvbnRlbnRCeXRlcyk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gd3JpdGVyIFRoZSB3cml0ZXIgdG8gd3JpdGUgdG9cbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIHdyaXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZUFsbFN5bmMod3JpdGVyOiBXcml0ZXJTeW5jLCBkYXRhOiBVaW50OEFycmF5KSB7XG4gIGxldCBud3JpdHRlbiA9IDA7XG4gIHdoaWxlIChud3JpdHRlbiA8IGRhdGEubGVuZ3RoKSB7XG4gICAgbndyaXR0ZW4gKz0gd3JpdGVyLndyaXRlU3luYyhkYXRhLnN1YmFycmF5KG53cml0dGVuKSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBSXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0JDLEdBQ0QsT0FBTyxlQUFlLFNBQVMsTUFBYyxFQUFFLElBQWdCO0VBQzdELElBQUksV0FBVztFQUNmLE1BQU8sV0FBVyxLQUFLLE1BQU0sQ0FBRTtJQUM3QixZQUFZLE1BQU0sT0FBTyxLQUFLLENBQUMsS0FBSyxRQUFRLENBQUM7RUFDL0M7QUFDRjtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVCQyxHQUNELE9BQU8sU0FBUyxhQUFhLE1BQWtCLEVBQUUsSUFBZ0I7RUFDL0QsSUFBSSxXQUFXO0VBQ2YsTUFBTyxXQUFXLEtBQUssTUFBTSxDQUFFO0lBQzdCLFlBQVksT0FBTyxTQUFTLENBQUMsS0FBSyxRQUFRLENBQUM7RUFDN0M7QUFDRiJ9
// denoCacheMetadata=12182616493679648608,13054611014422200312