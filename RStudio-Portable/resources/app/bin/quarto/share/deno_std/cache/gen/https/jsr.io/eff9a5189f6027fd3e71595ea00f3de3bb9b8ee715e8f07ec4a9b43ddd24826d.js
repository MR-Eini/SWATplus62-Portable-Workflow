// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Reader utility for combining multiple readers.
 *
 * @example Usage
 * ```ts
 * import { MultiReader } from "@std/io/multi-reader";
 * import { StringReader } from "@std/io/string-reader";
 * import { readAll } from "@std/io/read-all";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const r1 = new StringReader("hello");
 * const r2 = new StringReader("world");
 * const mr = new MultiReader([r1, r2]);
 *
 * const res = await readAll(mr);
 *
 * assertEquals(new TextDecoder().decode(res), "helloworld");
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export class MultiReader {
  #readers;
  #currentIndex = 0;
  /**
   * Construct a new instance.
   *
   * @param readers The readers to combine.
   */ constructor(readers){
    this.#readers = [
      ...readers
    ];
  }
  /**
   * Reads data from the readers.
   *
   * @example Usage
   * ```ts
   * import { MultiReader } from "@std/io/multi-reader";
   * import { StringReader } from "@std/io/string-reader";
   * import { readAll } from "@std/io/read-all";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const r1 = new StringReader("hello");
   * const r2 = new StringReader("world");
   * const mr = new MultiReader([r1, r2]);
   *
   * const data = new Uint8Array(5);
   * const res = await mr.read(data);
   *
   * assertEquals(res, 5);
   * assertEquals(new TextDecoder().decode(data), "hello");
   *
   * const res2 = await mr.read(data);
   * assertEquals(res2, 0);
   *
   * const res3 = await mr.read(data);
   * assertEquals(res3, 5);
   * assertEquals(new TextDecoder().decode(data), "world");
   * ```
   *
   * @param p The buffer to read data into.
   * @returns The number of bytes read.
   */ async read(p) {
    const r = this.#readers[this.#currentIndex];
    if (!r) return null;
    const result = await r.read(p);
    if (result === null) {
      this.#currentIndex++;
      return 0;
    }
    return result;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9tdWx0aV9yZWFkZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHR5cGUgeyBSZWFkZXIgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuXG4vKipcbiAqIFJlYWRlciB1dGlsaXR5IGZvciBjb21iaW5pbmcgbXVsdGlwbGUgcmVhZGVycy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IE11bHRpUmVhZGVyIH0gZnJvbSBcIkBzdGQvaW8vbXVsdGktcmVhZGVyXCI7XG4gKiBpbXBvcnQgeyBTdHJpbmdSZWFkZXIgfSBmcm9tIFwiQHN0ZC9pby9zdHJpbmctcmVhZGVyXCI7XG4gKiBpbXBvcnQgeyByZWFkQWxsIH0gZnJvbSBcIkBzdGQvaW8vcmVhZC1hbGxcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCByMSA9IG5ldyBTdHJpbmdSZWFkZXIoXCJoZWxsb1wiKTtcbiAqIGNvbnN0IHIyID0gbmV3IFN0cmluZ1JlYWRlcihcIndvcmxkXCIpO1xuICogY29uc3QgbXIgPSBuZXcgTXVsdGlSZWFkZXIoW3IxLCByMl0pO1xuICpcbiAqIGNvbnN0IHJlcyA9IGF3YWl0IHJlYWRBbGwobXIpO1xuICpcbiAqIGFzc2VydEVxdWFscyhuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocmVzKSwgXCJoZWxsb3dvcmxkXCIpO1xuICogYGBgXG4gKlxuICogQGRlcHJlY2F0ZWQgVGhpcyB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAuIFVzZSB0aGUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9TdHJlYW1zX0FQSSB8IFdlYiBTdHJlYW1zIEFQSX0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE11bHRpUmVhZGVyIGltcGxlbWVudHMgUmVhZGVyIHtcbiAgcmVhZG9ubHkgI3JlYWRlcnM6IFJlYWRlcltdO1xuICAjY3VycmVudEluZGV4ID0gMDtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGluc3RhbmNlLlxuICAgKlxuICAgKiBAcGFyYW0gcmVhZGVycyBUaGUgcmVhZGVycyB0byBjb21iaW5lLlxuICAgKi9cbiAgY29uc3RydWN0b3IocmVhZGVyczogUmVhZGVyW10pIHtcbiAgICB0aGlzLiNyZWFkZXJzID0gWy4uLnJlYWRlcnNdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIGRhdGEgZnJvbSB0aGUgcmVhZGVycy5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgTXVsdGlSZWFkZXIgfSBmcm9tIFwiQHN0ZC9pby9tdWx0aS1yZWFkZXJcIjtcbiAgICogaW1wb3J0IHsgU3RyaW5nUmVhZGVyIH0gZnJvbSBcIkBzdGQvaW8vc3RyaW5nLXJlYWRlclwiO1xuICAgKiBpbXBvcnQgeyByZWFkQWxsIH0gZnJvbSBcIkBzdGQvaW8vcmVhZC1hbGxcIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCByMSA9IG5ldyBTdHJpbmdSZWFkZXIoXCJoZWxsb1wiKTtcbiAgICogY29uc3QgcjIgPSBuZXcgU3RyaW5nUmVhZGVyKFwid29ybGRcIik7XG4gICAqIGNvbnN0IG1yID0gbmV3IE11bHRpUmVhZGVyKFtyMSwgcjJdKTtcbiAgICpcbiAgICogY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KDUpO1xuICAgKiBjb25zdCByZXMgPSBhd2FpdCBtci5yZWFkKGRhdGEpO1xuICAgKlxuICAgKiBhc3NlcnRFcXVhbHMocmVzLCA1KTtcbiAgICogYXNzZXJ0RXF1YWxzKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShkYXRhKSwgXCJoZWxsb1wiKTtcbiAgICpcbiAgICogY29uc3QgcmVzMiA9IGF3YWl0IG1yLnJlYWQoZGF0YSk7XG4gICAqIGFzc2VydEVxdWFscyhyZXMyLCAwKTtcbiAgICpcbiAgICogY29uc3QgcmVzMyA9IGF3YWl0IG1yLnJlYWQoZGF0YSk7XG4gICAqIGFzc2VydEVxdWFscyhyZXMzLCA1KTtcbiAgICogYXNzZXJ0RXF1YWxzKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShkYXRhKSwgXCJ3b3JsZFwiKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBwIFRoZSBidWZmZXIgdG8gcmVhZCBkYXRhIGludG8uXG4gICAqIEByZXR1cm5zIFRoZSBudW1iZXIgb2YgYnl0ZXMgcmVhZC5cbiAgICovXG4gIGFzeW5jIHJlYWQocDogVWludDhBcnJheSk6IFByb21pc2U8bnVtYmVyIHwgbnVsbD4ge1xuICAgIGNvbnN0IHIgPSB0aGlzLiNyZWFkZXJzW3RoaXMuI2N1cnJlbnRJbmRleF07XG4gICAgaWYgKCFyKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByLnJlYWQocCk7XG4gICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy4jY3VycmVudEluZGV4Kys7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFJckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0JDLEdBQ0QsT0FBTyxNQUFNO0VBQ0YsQ0FBQSxPQUFRLENBQVc7RUFDNUIsQ0FBQSxZQUFhLEdBQUcsRUFBRTtFQUVsQjs7OztHQUlDLEdBQ0QsWUFBWSxPQUFpQixDQUFFO0lBQzdCLElBQUksQ0FBQyxDQUFBLE9BQVEsR0FBRztTQUFJO0tBQVE7RUFDOUI7RUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEJDLEdBQ0QsTUFBTSxLQUFLLENBQWEsRUFBMEI7SUFDaEQsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFBLE9BQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQSxZQUFhLENBQUM7SUFDM0MsSUFBSSxDQUFDLEdBQUcsT0FBTztJQUNmLE1BQU0sU0FBUyxNQUFNLEVBQUUsSUFBSSxDQUFDO0lBQzVCLElBQUksV0FBVyxNQUFNO01BQ25CLElBQUksQ0FBQyxDQUFBLFlBQWE7TUFDbEIsT0FBTztJQUNUO0lBQ0EsT0FBTztFQUNUO0FBQ0YifQ==
// denoCacheMetadata=15599389728393401121,1773083230549335808