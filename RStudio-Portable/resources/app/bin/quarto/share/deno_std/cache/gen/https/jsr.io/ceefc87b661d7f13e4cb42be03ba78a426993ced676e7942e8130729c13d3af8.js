// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Reads from `reader` but limits the amount of data returned to just `limit` bytes.
 * Each call to `read` updates `limit` to reflect the new amount remaining.
 * `read` returns `null` when `limit` <= `0` or
 * when the underlying `reader` returns `null`.
 *
 * @example Usage
 * ```ts
 * import { StringReader } from "@std/io/string-reader";
 * import { LimitedReader } from "@std/io/limited-reader";
 * import { readAll } from "@std/io/read-all";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const r = new StringReader("hello world");
 * const lr = new LimitedReader(r, 5);
 * const res = await readAll(lr);
 *
 * assertEquals(new TextDecoder().decode(res), "hello");
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export class LimitedReader {
  /**
   * The reader to read from
   *
   * @example Usage
   * ```ts
   * import { StringReader } from "@std/io/string-reader";
   * import { LimitedReader } from "@std/io/limited-reader";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const r = new StringReader("hello world");
   * const lr = new LimitedReader(r, 5);
   *
   * assertEquals(lr.reader, r);
   * ```
   */ reader;
  /**
   * The number of bytes to limit the reader to
   *
   * @example Usage
   * ```ts
   * import { StringReader } from "@std/io/string-reader";
   * import { LimitedReader } from "@std/io/limited-reader";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const r = new StringReader("hello world");
   * const lr = new LimitedReader(r, 5);
   *
   * assertEquals(lr.limit, 5);
   * ```
   */ limit;
  /**
   * Construct a new instance.
   *
   * @param reader The reader to read from.
   * @param limit The number of bytes to limit the reader to.
   */ constructor(reader, limit){
    this.reader = reader;
    this.limit = limit;
  }
  /**
   * Reads data from the reader.
   *
   * @example Usage
   * ```ts
   * import { StringReader } from "@std/io/string-reader";
   * import { LimitedReader } from "@std/io/limited-reader";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const r = new StringReader("hello world");
   * const lr = new LimitedReader(r, 5);
   *
   * const data = new Uint8Array(5);
   * const res = await lr.read(data);
   *
   * assertEquals(res, 5);
   * assertEquals(new TextDecoder().decode(data), "hello");
   * ```
   *
   * @param p The buffer to read data into.
   * @returns The number of bytes read.
   */ async read(p) {
    if (this.limit <= 0) {
      return null;
    }
    if (p.length > this.limit) {
      p = p.subarray(0, this.limit);
    }
    const n = await this.reader.read(p);
    if (n === null) {
      return null;
    }
    this.limit -= n;
    return n;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9saW1pdGVkX3JlYWRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgdHlwZSB7IFJlYWRlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5cbi8qKlxuICogUmVhZHMgZnJvbSBgcmVhZGVyYCBidXQgbGltaXRzIHRoZSBhbW91bnQgb2YgZGF0YSByZXR1cm5lZCB0byBqdXN0IGBsaW1pdGAgYnl0ZXMuXG4gKiBFYWNoIGNhbGwgdG8gYHJlYWRgIHVwZGF0ZXMgYGxpbWl0YCB0byByZWZsZWN0IHRoZSBuZXcgYW1vdW50IHJlbWFpbmluZy5cbiAqIGByZWFkYCByZXR1cm5zIGBudWxsYCB3aGVuIGBsaW1pdGAgPD0gYDBgIG9yXG4gKiB3aGVuIHRoZSB1bmRlcmx5aW5nIGByZWFkZXJgIHJldHVybnMgYG51bGxgLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgU3RyaW5nUmVhZGVyIH0gZnJvbSBcIkBzdGQvaW8vc3RyaW5nLXJlYWRlclwiO1xuICogaW1wb3J0IHsgTGltaXRlZFJlYWRlciB9IGZyb20gXCJAc3RkL2lvL2xpbWl0ZWQtcmVhZGVyXCI7XG4gKiBpbXBvcnQgeyByZWFkQWxsIH0gZnJvbSBcIkBzdGQvaW8vcmVhZC1hbGxcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCByID0gbmV3IFN0cmluZ1JlYWRlcihcImhlbGxvIHdvcmxkXCIpO1xuICogY29uc3QgbHIgPSBuZXcgTGltaXRlZFJlYWRlcihyLCA1KTtcbiAqIGNvbnN0IHJlcyA9IGF3YWl0IHJlYWRBbGwobHIpO1xuICpcbiAqIGFzc2VydEVxdWFscyhuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocmVzKSwgXCJoZWxsb1wiKTtcbiAqIGBgYFxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2UgdGhlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvU3RyZWFtc19BUEkgfCBXZWIgU3RyZWFtcyBBUEl9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBMaW1pdGVkUmVhZGVyIGltcGxlbWVudHMgUmVhZGVyIHtcbiAgLyoqXG4gICAqIFRoZSByZWFkZXIgdG8gcmVhZCBmcm9tXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IFN0cmluZ1JlYWRlciB9IGZyb20gXCJAc3RkL2lvL3N0cmluZy1yZWFkZXJcIjtcbiAgICogaW1wb3J0IHsgTGltaXRlZFJlYWRlciB9IGZyb20gXCJAc3RkL2lvL2xpbWl0ZWQtcmVhZGVyXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9lcXVhbHNcIjtcbiAgICpcbiAgICogY29uc3QgciA9IG5ldyBTdHJpbmdSZWFkZXIoXCJoZWxsbyB3b3JsZFwiKTtcbiAgICogY29uc3QgbHIgPSBuZXcgTGltaXRlZFJlYWRlcihyLCA1KTtcbiAgICpcbiAgICogYXNzZXJ0RXF1YWxzKGxyLnJlYWRlciwgcik7XG4gICAqIGBgYFxuICAgKi9cbiAgcmVhZGVyOiBSZWFkZXI7XG4gIC8qKlxuICAgKiBUaGUgbnVtYmVyIG9mIGJ5dGVzIHRvIGxpbWl0IHRoZSByZWFkZXIgdG9cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgU3RyaW5nUmVhZGVyIH0gZnJvbSBcIkBzdGQvaW8vc3RyaW5nLXJlYWRlclwiO1xuICAgKiBpbXBvcnQgeyBMaW1pdGVkUmVhZGVyIH0gZnJvbSBcIkBzdGQvaW8vbGltaXRlZC1yZWFkZXJcIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCByID0gbmV3IFN0cmluZ1JlYWRlcihcImhlbGxvIHdvcmxkXCIpO1xuICAgKiBjb25zdCBsciA9IG5ldyBMaW1pdGVkUmVhZGVyKHIsIDUpO1xuICAgKlxuICAgKiBhc3NlcnRFcXVhbHMobHIubGltaXQsIDUpO1xuICAgKiBgYGBcbiAgICovXG4gIGxpbWl0OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHJlYWRlciBUaGUgcmVhZGVyIHRvIHJlYWQgZnJvbS5cbiAgICogQHBhcmFtIGxpbWl0IFRoZSBudW1iZXIgb2YgYnl0ZXMgdG8gbGltaXQgdGhlIHJlYWRlciB0by5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHJlYWRlcjogUmVhZGVyLCBsaW1pdDogbnVtYmVyKSB7XG4gICAgdGhpcy5yZWFkZXIgPSByZWFkZXI7XG4gICAgdGhpcy5saW1pdCA9IGxpbWl0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIGRhdGEgZnJvbSB0aGUgcmVhZGVyLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBTdHJpbmdSZWFkZXIgfSBmcm9tIFwiQHN0ZC9pby9zdHJpbmctcmVhZGVyXCI7XG4gICAqIGltcG9ydCB7IExpbWl0ZWRSZWFkZXIgfSBmcm9tIFwiQHN0ZC9pby9saW1pdGVkLXJlYWRlclwiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gICAqXG4gICAqIGNvbnN0IHIgPSBuZXcgU3RyaW5nUmVhZGVyKFwiaGVsbG8gd29ybGRcIik7XG4gICAqIGNvbnN0IGxyID0gbmV3IExpbWl0ZWRSZWFkZXIociwgNSk7XG4gICAqXG4gICAqIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheSg1KTtcbiAgICogY29uc3QgcmVzID0gYXdhaXQgbHIucmVhZChkYXRhKTtcbiAgICpcbiAgICogYXNzZXJ0RXF1YWxzKHJlcywgNSk7XG4gICAqIGFzc2VydEVxdWFscyhuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoZGF0YSksIFwiaGVsbG9cIik7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gcCBUaGUgYnVmZmVyIHRvIHJlYWQgZGF0YSBpbnRvLlxuICAgKiBAcmV0dXJucyBUaGUgbnVtYmVyIG9mIGJ5dGVzIHJlYWQuXG4gICAqL1xuICBhc3luYyByZWFkKHA6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPG51bWJlciB8IG51bGw+IHtcbiAgICBpZiAodGhpcy5saW1pdCA8PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAocC5sZW5ndGggPiB0aGlzLmxpbWl0KSB7XG4gICAgICBwID0gcC5zdWJhcnJheSgwLCB0aGlzLmxpbWl0KTtcbiAgICB9XG4gICAgY29uc3QgbiA9IGF3YWl0IHRoaXMucmVhZGVyLnJlYWQocCk7XG4gICAgaWYgKG4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRoaXMubGltaXQgLT0gbjtcbiAgICByZXR1cm4gbjtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFJckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCQyxHQUNELE9BQU8sTUFBTTtFQUNYOzs7Ozs7Ozs7Ozs7OztHQWNDLEdBQ0QsT0FBZTtFQUNmOzs7Ozs7Ozs7Ozs7OztHQWNDLEdBQ0QsTUFBYztFQUVkOzs7OztHQUtDLEdBQ0QsWUFBWSxNQUFjLEVBQUUsS0FBYSxDQUFFO0lBQ3pDLElBQUksQ0FBQyxNQUFNLEdBQUc7SUFDZCxJQUFJLENBQUMsS0FBSyxHQUFHO0VBQ2Y7RUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJDLEdBQ0QsTUFBTSxLQUFLLENBQWEsRUFBMEI7SUFDaEQsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLEdBQUc7TUFDbkIsT0FBTztJQUNUO0lBRUEsSUFBSSxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFO01BQ3pCLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSztJQUM5QjtJQUNBLE1BQU0sSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2pDLElBQUksTUFBTSxNQUFNO01BQ2QsT0FBTztJQUNUO0lBRUEsSUFBSSxDQUFDLEtBQUssSUFBSTtJQUNkLE9BQU87RUFDVDtBQUNGIn0=
// denoCacheMetadata=3046795796399061640,10203435659172957467