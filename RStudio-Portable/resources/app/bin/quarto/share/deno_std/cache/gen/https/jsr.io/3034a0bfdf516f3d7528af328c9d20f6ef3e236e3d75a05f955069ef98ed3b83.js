// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { copy as copyBytes } from "jsr:@std/bytes@^1.0.2/copy";
const DEFAULT_BUFFER_SIZE = 32 * 1024;
/**
 * Read a range of bytes from a file or other resource that is readable and
 * seekable.  The range start and end are inclusive of the bytes within that
 * range.
 *
 * @example Usage
 * ```ts no-eval
 * import { assertEquals } from "@std/assert";
 * import { readRange } from "@std/io/read-range";
 *
 * // Read the first 10 bytes of a file
 * const file = await Deno.open("example.txt", { read: true });
 * const bytes = await readRange(file, { start: 0, end: 9 });
 * assertEquals(bytes.length, 10);
 * ```
 *
 * @param r The reader to read from
 * @param range The range of bytes to read
 * @returns The bytes read
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export async function readRange(r, range) {
  // byte ranges are inclusive, so we have to add one to the end
  let length = range.end - range.start + 1;
  if (length <= 0) {
    throw new RangeError("Byte range start cannot be larger than end");
  }
  await r.seek(range.start, Deno.SeekMode.Start);
  const result = new Uint8Array(length);
  let off = 0;
  while(length){
    const p = new Uint8Array(Math.min(length, DEFAULT_BUFFER_SIZE));
    const nread = await r.read(p);
    if (nread === null) {
      throw new Error("Unexpected EOF reach while reading a range");
    }
    if (nread === 0) {
      throw new Error("Unexpected read of 0 bytes while reading a range");
    }
    copyBytes(p, result, off);
    off += nread;
    length -= nread;
    if (length < 0) {
      throw new Error("Unexpected length remaining after reading range");
    }
  }
  return result;
}
/**
 * Read a range of bytes synchronously from a file or other resource that is
 * readable and seekable.  The range start and end are inclusive of the bytes
 * within that range.
 *
 * @example Usage
 * ```ts no-eval
 * import { assertEquals } from "@std/assert";
 * import { readRangeSync } from "@std/io/read-range";
 *
 * // Read the first 10 bytes of a file
 * const file = Deno.openSync("example.txt", { read: true });
 * const bytes = readRangeSync(file, { start: 0, end: 9 });
 * assertEquals(bytes.length, 10);
 * ```
 *
 * @param r The reader to read from
 * @param range The range of bytes to read
 * @returns The bytes read
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export function readRangeSync(r, range) {
  // byte ranges are inclusive, so we have to add one to the end
  let length = range.end - range.start + 1;
  if (length <= 0) {
    throw new RangeError("Byte range start cannot be larger than end");
  }
  r.seekSync(range.start, Deno.SeekMode.Start);
  const result = new Uint8Array(length);
  let off = 0;
  while(length){
    const p = new Uint8Array(Math.min(length, DEFAULT_BUFFER_SIZE));
    const nread = r.readSync(p);
    if (nread === null) {
      throw new Error("Unexpected EOF reach while reading a range");
    }
    if (nread === 0) {
      throw new Error("Unexpected read of 0 bytes while reading a range");
    }
    copyBytes(p, result, off);
    off += nread;
    length -= nread;
    if (length < 0) {
      throw new Error("Unexpected length remaining after reading range");
    }
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9yZWFkX3JhbmdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IGNvcHkgYXMgY29weUJ5dGVzIH0gZnJvbSBcImpzcjpAc3RkL2J5dGVzQF4xLjAuMi9jb3B5XCI7XG5pbXBvcnQgdHlwZSB7IFJlYWRlciwgUmVhZGVyU3luYywgU2Vla2VyLCBTZWVrZXJTeW5jIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcblxuY29uc3QgREVGQVVMVF9CVUZGRVJfU0laRSA9IDMyICogMTAyNDtcblxuLyoqXG4gKiBUaGUgcmFuZ2Ugb2YgYnl0ZXMgdG8gcmVhZCBmcm9tIGEgZmlsZSBvciBvdGhlciByZXNvdXJjZSB0aGF0IGlzIHJlYWRhYmxlLlxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2UgdGhlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvU3RyZWFtc19BUEkgfCBXZWIgU3RyZWFtcyBBUEl9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnl0ZVJhbmdlIHtcbiAgLyoqIFRoZSAwIGJhc2VkIGluZGV4IG9mIHRoZSBzdGFydCBieXRlIGZvciBhIHJhbmdlLiAqL1xuICBzdGFydDogbnVtYmVyO1xuXG4gIC8qKiBUaGUgMCBiYXNlZCBpbmRleCBvZiB0aGUgZW5kIGJ5dGUgZm9yIGEgcmFuZ2UsIHdoaWNoIGlzIGluY2x1c2l2ZS4gKi9cbiAgZW5kOiBudW1iZXI7XG59XG5cbi8qKlxuICogUmVhZCBhIHJhbmdlIG9mIGJ5dGVzIGZyb20gYSBmaWxlIG9yIG90aGVyIHJlc291cmNlIHRoYXQgaXMgcmVhZGFibGUgYW5kXG4gKiBzZWVrYWJsZS4gIFRoZSByYW5nZSBzdGFydCBhbmQgZW5kIGFyZSBpbmNsdXNpdmUgb2YgdGhlIGJ5dGVzIHdpdGhpbiB0aGF0XG4gKiByYW5nZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKiBpbXBvcnQgeyByZWFkUmFuZ2UgfSBmcm9tIFwiQHN0ZC9pby9yZWFkLXJhbmdlXCI7XG4gKlxuICogLy8gUmVhZCB0aGUgZmlyc3QgMTAgYnl0ZXMgb2YgYSBmaWxlXG4gKiBjb25zdCBmaWxlID0gYXdhaXQgRGVuby5vcGVuKFwiZXhhbXBsZS50eHRcIiwgeyByZWFkOiB0cnVlIH0pO1xuICogY29uc3QgYnl0ZXMgPSBhd2FpdCByZWFkUmFuZ2UoZmlsZSwgeyBzdGFydDogMCwgZW5kOiA5IH0pO1xuICogYXNzZXJ0RXF1YWxzKGJ5dGVzLmxlbmd0aCwgMTApO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHIgVGhlIHJlYWRlciB0byByZWFkIGZyb21cbiAqIEBwYXJhbSByYW5nZSBUaGUgcmFuZ2Ugb2YgYnl0ZXMgdG8gcmVhZFxuICogQHJldHVybnMgVGhlIGJ5dGVzIHJlYWRcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0cmVhbXNfQVBJIHwgV2ViIFN0cmVhbXMgQVBJfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZFJhbmdlKFxuICByOiBSZWFkZXIgJiBTZWVrZXIsXG4gIHJhbmdlOiBCeXRlUmFuZ2UsXG4pOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcbiAgLy8gYnl0ZSByYW5nZXMgYXJlIGluY2x1c2l2ZSwgc28gd2UgaGF2ZSB0byBhZGQgb25lIHRvIHRoZSBlbmRcbiAgbGV0IGxlbmd0aCA9IHJhbmdlLmVuZCAtIHJhbmdlLnN0YXJ0ICsgMTtcbiAgaWYgKGxlbmd0aCA8PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJCeXRlIHJhbmdlIHN0YXJ0IGNhbm5vdCBiZSBsYXJnZXIgdGhhbiBlbmRcIik7XG4gIH1cbiAgYXdhaXQgci5zZWVrKHJhbmdlLnN0YXJ0LCBEZW5vLlNlZWtNb2RlLlN0YXJ0KTtcbiAgY29uc3QgcmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKTtcbiAgbGV0IG9mZiA9IDA7XG4gIHdoaWxlIChsZW5ndGgpIHtcbiAgICBjb25zdCBwID0gbmV3IFVpbnQ4QXJyYXkoTWF0aC5taW4obGVuZ3RoLCBERUZBVUxUX0JVRkZFUl9TSVpFKSk7XG4gICAgY29uc3QgbnJlYWQgPSBhd2FpdCByLnJlYWQocCk7XG4gICAgaWYgKG5yZWFkID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIEVPRiByZWFjaCB3aGlsZSByZWFkaW5nIGEgcmFuZ2VcIik7XG4gICAgfVxuICAgIGlmIChucmVhZCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCByZWFkIG9mIDAgYnl0ZXMgd2hpbGUgcmVhZGluZyBhIHJhbmdlXCIpO1xuICAgIH1cbiAgICBjb3B5Qnl0ZXMocCwgcmVzdWx0LCBvZmYpO1xuICAgIG9mZiArPSBucmVhZDtcbiAgICBsZW5ndGggLT0gbnJlYWQ7XG4gICAgaWYgKGxlbmd0aCA8IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIHJlbWFpbmluZyBhZnRlciByZWFkaW5nIHJhbmdlXCIpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFJlYWQgYSByYW5nZSBvZiBieXRlcyBzeW5jaHJvbm91c2x5IGZyb20gYSBmaWxlIG9yIG90aGVyIHJlc291cmNlIHRoYXQgaXNcbiAqIHJlYWRhYmxlIGFuZCBzZWVrYWJsZS4gIFRoZSByYW5nZSBzdGFydCBhbmQgZW5kIGFyZSBpbmNsdXNpdmUgb2YgdGhlIGJ5dGVzXG4gKiB3aXRoaW4gdGhhdCByYW5nZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKiBpbXBvcnQgeyByZWFkUmFuZ2VTeW5jIH0gZnJvbSBcIkBzdGQvaW8vcmVhZC1yYW5nZVwiO1xuICpcbiAqIC8vIFJlYWQgdGhlIGZpcnN0IDEwIGJ5dGVzIG9mIGEgZmlsZVxuICogY29uc3QgZmlsZSA9IERlbm8ub3BlblN5bmMoXCJleGFtcGxlLnR4dFwiLCB7IHJlYWQ6IHRydWUgfSk7XG4gKiBjb25zdCBieXRlcyA9IHJlYWRSYW5nZVN5bmMoZmlsZSwgeyBzdGFydDogMCwgZW5kOiA5IH0pO1xuICogYXNzZXJ0RXF1YWxzKGJ5dGVzLmxlbmd0aCwgMTApO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHIgVGhlIHJlYWRlciB0byByZWFkIGZyb21cbiAqIEBwYXJhbSByYW5nZSBUaGUgcmFuZ2Ugb2YgYnl0ZXMgdG8gcmVhZFxuICogQHJldHVybnMgVGhlIGJ5dGVzIHJlYWRcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0cmVhbXNfQVBJIHwgV2ViIFN0cmVhbXMgQVBJfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZFJhbmdlU3luYyhcbiAgcjogUmVhZGVyU3luYyAmIFNlZWtlclN5bmMsXG4gIHJhbmdlOiBCeXRlUmFuZ2UsXG4pOiBVaW50OEFycmF5IHtcbiAgLy8gYnl0ZSByYW5nZXMgYXJlIGluY2x1c2l2ZSwgc28gd2UgaGF2ZSB0byBhZGQgb25lIHRvIHRoZSBlbmRcbiAgbGV0IGxlbmd0aCA9IHJhbmdlLmVuZCAtIHJhbmdlLnN0YXJ0ICsgMTtcbiAgaWYgKGxlbmd0aCA8PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJCeXRlIHJhbmdlIHN0YXJ0IGNhbm5vdCBiZSBsYXJnZXIgdGhhbiBlbmRcIik7XG4gIH1cbiAgci5zZWVrU3luYyhyYW5nZS5zdGFydCwgRGVuby5TZWVrTW9kZS5TdGFydCk7XG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KGxlbmd0aCk7XG4gIGxldCBvZmYgPSAwO1xuICB3aGlsZSAobGVuZ3RoKSB7XG4gICAgY29uc3QgcCA9IG5ldyBVaW50OEFycmF5KE1hdGgubWluKGxlbmd0aCwgREVGQVVMVF9CVUZGRVJfU0laRSkpO1xuICAgIGNvbnN0IG5yZWFkID0gci5yZWFkU3luYyhwKTtcbiAgICBpZiAobnJlYWQgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgRU9GIHJlYWNoIHdoaWxlIHJlYWRpbmcgYSByYW5nZVwiKTtcbiAgICB9XG4gICAgaWYgKG5yZWFkID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHJlYWQgb2YgMCBieXRlcyB3aGlsZSByZWFkaW5nIGEgcmFuZ2VcIik7XG4gICAgfVxuICAgIGNvcHlCeXRlcyhwLCByZXN1bHQsIG9mZik7XG4gICAgb2ZmICs9IG5yZWFkO1xuICAgIGxlbmd0aCAtPSBucmVhZDtcbiAgICBpZiAobGVuZ3RoIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggcmVtYWluaW5nIGFmdGVyIHJlYWRpbmcgcmFuZ2VcIik7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLFNBQVMsUUFBUSxTQUFTLFFBQVEsNkJBQTZCO0FBRy9ELE1BQU0sc0JBQXNCLEtBQUs7QUFlakM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCQyxHQUNELE9BQU8sZUFBZSxVQUNwQixDQUFrQixFQUNsQixLQUFnQjtFQUVoQiw4REFBOEQ7RUFDOUQsSUFBSSxTQUFTLE1BQU0sR0FBRyxHQUFHLE1BQU0sS0FBSyxHQUFHO0VBQ3ZDLElBQUksVUFBVSxHQUFHO0lBQ2YsTUFBTSxJQUFJLFdBQVc7RUFDdkI7RUFDQSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sS0FBSyxFQUFFLEtBQUssUUFBUSxDQUFDLEtBQUs7RUFDN0MsTUFBTSxTQUFTLElBQUksV0FBVztFQUM5QixJQUFJLE1BQU07RUFDVixNQUFPLE9BQVE7SUFDYixNQUFNLElBQUksSUFBSSxXQUFXLEtBQUssR0FBRyxDQUFDLFFBQVE7SUFDMUMsTUFBTSxRQUFRLE1BQU0sRUFBRSxJQUFJLENBQUM7SUFDM0IsSUFBSSxVQUFVLE1BQU07TUFDbEIsTUFBTSxJQUFJLE1BQU07SUFDbEI7SUFDQSxJQUFJLFVBQVUsR0FBRztNQUNmLE1BQU0sSUFBSSxNQUFNO0lBQ2xCO0lBQ0EsVUFBVSxHQUFHLFFBQVE7SUFDckIsT0FBTztJQUNQLFVBQVU7SUFDVixJQUFJLFNBQVMsR0FBRztNQUNkLE1BQU0sSUFBSSxNQUFNO0lBQ2xCO0VBQ0Y7RUFDQSxPQUFPO0FBQ1Q7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBcUJDLEdBQ0QsT0FBTyxTQUFTLGNBQ2QsQ0FBMEIsRUFDMUIsS0FBZ0I7RUFFaEIsOERBQThEO0VBQzlELElBQUksU0FBUyxNQUFNLEdBQUcsR0FBRyxNQUFNLEtBQUssR0FBRztFQUN2QyxJQUFJLFVBQVUsR0FBRztJQUNmLE1BQU0sSUFBSSxXQUFXO0VBQ3ZCO0VBQ0EsRUFBRSxRQUFRLENBQUMsTUFBTSxLQUFLLEVBQUUsS0FBSyxRQUFRLENBQUMsS0FBSztFQUMzQyxNQUFNLFNBQVMsSUFBSSxXQUFXO0VBQzlCLElBQUksTUFBTTtFQUNWLE1BQU8sT0FBUTtJQUNiLE1BQU0sSUFBSSxJQUFJLFdBQVcsS0FBSyxHQUFHLENBQUMsUUFBUTtJQUMxQyxNQUFNLFFBQVEsRUFBRSxRQUFRLENBQUM7SUFDekIsSUFBSSxVQUFVLE1BQU07TUFDbEIsTUFBTSxJQUFJLE1BQU07SUFDbEI7SUFDQSxJQUFJLFVBQVUsR0FBRztNQUNmLE1BQU0sSUFBSSxNQUFNO0lBQ2xCO0lBQ0EsVUFBVSxHQUFHLFFBQVE7SUFDckIsT0FBTztJQUNQLFVBQVU7SUFDVixJQUFJLFNBQVMsR0FBRztNQUNkLE1BQU0sSUFBSSxNQUFNO0lBQ2xCO0VBQ0Y7RUFDQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=12709039028528851064,5063260236014399219