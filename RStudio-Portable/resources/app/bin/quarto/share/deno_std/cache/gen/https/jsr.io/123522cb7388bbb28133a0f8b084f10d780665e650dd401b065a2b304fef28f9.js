// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
var _computedKey;
_computedKey = Symbol.asyncIterator;
/**
 * Multiplexes multiple async iterators into a single stream. It currently
 * makes an assumption that the final result (the value returned and not
 * yielded from the iterator) does not matter; if there is any result, it is
 * discarded.
 *
 * @example Usage
 * ```ts
 * import { MuxAsyncIterator } from "@std/async/mux-async-iterator";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * async function* gen123(): AsyncIterableIterator<number> {
 *   yield 1;
 *   yield 2;
 *   yield 3;
 * }
 *
 * async function* gen456(): AsyncIterableIterator<number> {
 *   yield 4;
 *   yield 5;
 *   yield 6;
 * }
 *
 * const mux = new MuxAsyncIterator<number>();
 * mux.add(gen123());
 * mux.add(gen456());
 *
 * const result = await Array.fromAsync(mux);
 *
 * assertEquals(result, [1, 4, 2, 5, 3, 6]);
 * ```
 *
 * @typeParam T The type of the provided async iterables and generated async iterable.
 */ export class MuxAsyncIterator {
  #iteratorCount = 0;
  #yields = [];
  // deno-lint-ignore no-explicit-any
  #throws = [];
  #signal = Promise.withResolvers();
  /**
   * Add an async iterable to the stream.
   *
   * @param iterable The async iterable to add.
   *
   * @example Usage
   * ```ts
   * import { MuxAsyncIterator } from "@std/async/mux-async-iterator";
   * import { assertEquals } from "@std/assert/assert-equals";
   *
   * async function* gen123(): AsyncIterableIterator<number> {
   *   yield 1;
   *   yield 2;
   *   yield 3;
   * }
   *
   * const mux = new MuxAsyncIterator<number>();
   * mux.add(gen123());
   *
   * const result = await Array.fromAsync(mux.iterate());
   *
   * assertEquals(result, [1, 2, 3]);
   * ```
   */ add(iterable) {
    ++this.#iteratorCount;
    this.#callIteratorNext(iterable[Symbol.asyncIterator]());
  }
  async #callIteratorNext(iterator) {
    try {
      const { value, done } = await iterator.next();
      if (done) {
        --this.#iteratorCount;
      } else {
        this.#yields.push({
          iterator,
          value
        });
      }
    } catch (e) {
      this.#throws.push(e);
    }
    this.#signal.resolve();
  }
  /**
   * Returns an async iterator of the stream.
   * @returns the async iterator for all the added async iterables.
   *
   * @example Usage
   * ```ts
   * import { MuxAsyncIterator } from "@std/async/mux-async-iterator";
   * import { assertEquals } from "@std/assert/assert-equals";
   *
   * async function* gen123(): AsyncIterableIterator<number> {
   *   yield 1;
   *   yield 2;
   *   yield 3;
   * }
   *
   * const mux = new MuxAsyncIterator<number>();
   * mux.add(gen123());
   *
   * const result = await Array.fromAsync(mux.iterate());
   *
   * assertEquals(result, [1, 2, 3]);
   * ```
   */ async *iterate() {
    while(this.#iteratorCount > 0){
      // Sleep until any of the wrapped iterators yields.
      await this.#signal.promise;
      // Note that while we're looping over `yields`, new items may be added.
      for (const { iterator, value } of this.#yields){
        yield value;
        this.#callIteratorNext(iterator);
      }
      if (this.#throws.length) {
        for (const e of this.#throws){
          throw e;
        }
      }
      // Clear the `yields` list and reset the `signal` promise.
      this.#yields.length = 0;
      this.#signal = Promise.withResolvers();
    }
  }
  /**
   * Implements an async iterator for the stream.
   * @returns the async iterator for all the added async iterables.
   *
   * @example Usage
   * ```ts
   * import { MuxAsyncIterator } from "@std/async/mux-async-iterator";
   * import { assertEquals } from "@std/assert/assert-equals";
   *
   * async function* gen123(): AsyncIterableIterator<number> {
   *   yield 1;
   *   yield 2;
   *   yield 3;
   * }
   *
   * const mux = new MuxAsyncIterator<number>();
   * mux.add(gen123());
   *
   * const result = await Array.fromAsync(mux);
   *
   * assertEquals(result, [1, 2, 3]);
   * ```
   */ [_computedKey]() {
    return this.iterate();
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXN5bmMvMC4yMjQuMi9tdXhfYXN5bmNfaXRlcmF0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW50ZXJmYWNlIFRhZ2dlZFlpZWxkZWRWYWx1ZTxUPiB7XG4gIGl0ZXJhdG9yOiBBc3luY0l0ZXJhdG9yPFQ+O1xuICB2YWx1ZTogVDtcbn1cblxuLyoqXG4gKiBNdWx0aXBsZXhlcyBtdWx0aXBsZSBhc3luYyBpdGVyYXRvcnMgaW50byBhIHNpbmdsZSBzdHJlYW0uIEl0IGN1cnJlbnRseVxuICogbWFrZXMgYW4gYXNzdW1wdGlvbiB0aGF0IHRoZSBmaW5hbCByZXN1bHQgKHRoZSB2YWx1ZSByZXR1cm5lZCBhbmQgbm90XG4gKiB5aWVsZGVkIGZyb20gdGhlIGl0ZXJhdG9yKSBkb2VzIG5vdCBtYXR0ZXI7IGlmIHRoZXJlIGlzIGFueSByZXN1bHQsIGl0IGlzXG4gKiBkaXNjYXJkZWQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBNdXhBc3luY0l0ZXJhdG9yIH0gZnJvbSBcIkBzdGQvYXN5bmMvbXV4LWFzeW5jLWl0ZXJhdG9yXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGFzeW5jIGZ1bmN0aW9uKiBnZW4xMjMoKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPG51bWJlcj4ge1xuICogICB5aWVsZCAxO1xuICogICB5aWVsZCAyO1xuICogICB5aWVsZCAzO1xuICogfVxuICpcbiAqIGFzeW5jIGZ1bmN0aW9uKiBnZW40NTYoKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPG51bWJlcj4ge1xuICogICB5aWVsZCA0O1xuICogICB5aWVsZCA1O1xuICogICB5aWVsZCA2O1xuICogfVxuICpcbiAqIGNvbnN0IG11eCA9IG5ldyBNdXhBc3luY0l0ZXJhdG9yPG51bWJlcj4oKTtcbiAqIG11eC5hZGQoZ2VuMTIzKCkpO1xuICogbXV4LmFkZChnZW40NTYoKSk7XG4gKlxuICogY29uc3QgcmVzdWx0ID0gYXdhaXQgQXJyYXkuZnJvbUFzeW5jKG11eCk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKHJlc3VsdCwgWzEsIDQsIDIsIDUsIDMsIDZdKTtcbiAqIGBgYFxuICpcbiAqIEB0eXBlUGFyYW0gVCBUaGUgdHlwZSBvZiB0aGUgcHJvdmlkZWQgYXN5bmMgaXRlcmFibGVzIGFuZCBnZW5lcmF0ZWQgYXN5bmMgaXRlcmFibGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBNdXhBc3luY0l0ZXJhdG9yPFQ+IGltcGxlbWVudHMgQXN5bmNJdGVyYWJsZTxUPiB7XG4gICNpdGVyYXRvckNvdW50ID0gMDtcbiAgI3lpZWxkczogQXJyYXk8VGFnZ2VkWWllbGRlZFZhbHVlPFQ+PiA9IFtdO1xuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICAjdGhyb3dzOiBhbnlbXSA9IFtdO1xuICAjc2lnbmFsID0gUHJvbWlzZS53aXRoUmVzb2x2ZXJzPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBhc3luYyBpdGVyYWJsZSB0byB0aGUgc3RyZWFtLlxuICAgKlxuICAgKiBAcGFyYW0gaXRlcmFibGUgVGhlIGFzeW5jIGl0ZXJhYmxlIHRvIGFkZC5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgTXV4QXN5bmNJdGVyYXRvciB9IGZyb20gXCJAc3RkL2FzeW5jL211eC1hc3luYy1pdGVyYXRvclwiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICAgKlxuICAgKiBhc3luYyBmdW5jdGlvbiogZ2VuMTIzKCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxudW1iZXI+IHtcbiAgICogICB5aWVsZCAxO1xuICAgKiAgIHlpZWxkIDI7XG4gICAqICAgeWllbGQgMztcbiAgICogfVxuICAgKlxuICAgKiBjb25zdCBtdXggPSBuZXcgTXV4QXN5bmNJdGVyYXRvcjxudW1iZXI+KCk7XG4gICAqIG11eC5hZGQoZ2VuMTIzKCkpO1xuICAgKlxuICAgKiBjb25zdCByZXN1bHQgPSBhd2FpdCBBcnJheS5mcm9tQXN5bmMobXV4Lml0ZXJhdGUoKSk7XG4gICAqXG4gICAqIGFzc2VydEVxdWFscyhyZXN1bHQsIFsxLCAyLCAzXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgYWRkKGl0ZXJhYmxlOiBBc3luY0l0ZXJhYmxlPFQ+KSB7XG4gICAgKyt0aGlzLiNpdGVyYXRvckNvdW50O1xuICAgIHRoaXMuI2NhbGxJdGVyYXRvck5leHQoaXRlcmFibGVbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkpO1xuICB9XG5cbiAgYXN5bmMgI2NhbGxJdGVyYXRvck5leHQoXG4gICAgaXRlcmF0b3I6IEFzeW5jSXRlcmF0b3I8VD4sXG4gICkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHZhbHVlLCBkb25lIH0gPSBhd2FpdCBpdGVyYXRvci5uZXh0KCk7XG4gICAgICBpZiAoZG9uZSkge1xuICAgICAgICAtLXRoaXMuI2l0ZXJhdG9yQ291bnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiN5aWVsZHMucHVzaCh7IGl0ZXJhdG9yLCB2YWx1ZSB9KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLiN0aHJvd3MucHVzaChlKTtcbiAgICB9XG4gICAgdGhpcy4jc2lnbmFsLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFzeW5jIGl0ZXJhdG9yIG9mIHRoZSBzdHJlYW0uXG4gICAqIEByZXR1cm5zIHRoZSBhc3luYyBpdGVyYXRvciBmb3IgYWxsIHRoZSBhZGRlZCBhc3luYyBpdGVyYWJsZXMuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IE11eEFzeW5jSXRlcmF0b3IgfSBmcm9tIFwiQHN0ZC9hc3luYy9tdXgtYXN5bmMtaXRlcmF0b3JcIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAgICpcbiAgICogYXN5bmMgZnVuY3Rpb24qIGdlbjEyMygpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8bnVtYmVyPiB7XG4gICAqICAgeWllbGQgMTtcbiAgICogICB5aWVsZCAyO1xuICAgKiAgIHlpZWxkIDM7XG4gICAqIH1cbiAgICpcbiAgICogY29uc3QgbXV4ID0gbmV3IE11eEFzeW5jSXRlcmF0b3I8bnVtYmVyPigpO1xuICAgKiBtdXguYWRkKGdlbjEyMygpKTtcbiAgICpcbiAgICogY29uc3QgcmVzdWx0ID0gYXdhaXQgQXJyYXkuZnJvbUFzeW5jKG11eC5pdGVyYXRlKCkpO1xuICAgKlxuICAgKiBhc3NlcnRFcXVhbHMocmVzdWx0LCBbMSwgMiwgM10pO1xuICAgKiBgYGBcbiAgICovXG4gIGFzeW5jICppdGVyYXRlKCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPiB7XG4gICAgd2hpbGUgKHRoaXMuI2l0ZXJhdG9yQ291bnQgPiAwKSB7XG4gICAgICAvLyBTbGVlcCB1bnRpbCBhbnkgb2YgdGhlIHdyYXBwZWQgaXRlcmF0b3JzIHlpZWxkcy5cbiAgICAgIGF3YWl0IHRoaXMuI3NpZ25hbC5wcm9taXNlO1xuXG4gICAgICAvLyBOb3RlIHRoYXQgd2hpbGUgd2UncmUgbG9vcGluZyBvdmVyIGB5aWVsZHNgLCBuZXcgaXRlbXMgbWF5IGJlIGFkZGVkLlxuICAgICAgZm9yIChjb25zdCB7IGl0ZXJhdG9yLCB2YWx1ZSB9IG9mIHRoaXMuI3lpZWxkcykge1xuICAgICAgICB5aWVsZCB2YWx1ZTtcbiAgICAgICAgdGhpcy4jY2FsbEl0ZXJhdG9yTmV4dChpdGVyYXRvcik7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLiN0aHJvd3MubGVuZ3RoKSB7XG4gICAgICAgIGZvciAoY29uc3QgZSBvZiB0aGlzLiN0aHJvd3MpIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBDbGVhciB0aGUgYHlpZWxkc2AgbGlzdCBhbmQgcmVzZXQgdGhlIGBzaWduYWxgIHByb21pc2UuXG4gICAgICB0aGlzLiN5aWVsZHMubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMuI3NpZ25hbCA9IFByb21pc2Uud2l0aFJlc29sdmVyczx2b2lkPigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRzIGFuIGFzeW5jIGl0ZXJhdG9yIGZvciB0aGUgc3RyZWFtLlxuICAgKiBAcmV0dXJucyB0aGUgYXN5bmMgaXRlcmF0b3IgZm9yIGFsbCB0aGUgYWRkZWQgYXN5bmMgaXRlcmFibGVzLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBNdXhBc3luY0l0ZXJhdG9yIH0gZnJvbSBcIkBzdGQvYXN5bmMvbXV4LWFzeW5jLWl0ZXJhdG9yXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gICAqXG4gICAqIGFzeW5jIGZ1bmN0aW9uKiBnZW4xMjMoKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPG51bWJlcj4ge1xuICAgKiAgIHlpZWxkIDE7XG4gICAqICAgeWllbGQgMjtcbiAgICogICB5aWVsZCAzO1xuICAgKiB9XG4gICAqXG4gICAqIGNvbnN0IG11eCA9IG5ldyBNdXhBc3luY0l0ZXJhdG9yPG51bWJlcj4oKTtcbiAgICogbXV4LmFkZChnZW4xMjMoKSk7XG4gICAqXG4gICAqIGNvbnN0IHJlc3VsdCA9IGF3YWl0IEFycmF5LmZyb21Bc3luYyhtdXgpO1xuICAgKlxuICAgKiBhc3NlcnRFcXVhbHMocmVzdWx0LCBbMSwgMiwgM10pO1xuICAgKiBgYGBcbiAgICovXG4gIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTogQXN5bmNJdGVyYXRvcjxUPiB7XG4gICAgcmV0dXJuIHRoaXMuaXRlcmF0ZSgpO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQzs7ZUFpS2xDLE9BQU8sYUFBYTtBQTFKdkI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWlDQyxHQUNELE9BQU8sTUFBTTtFQUNYLENBQUEsYUFBYyxHQUFHLEVBQUU7RUFDbkIsQ0FBQSxNQUFPLEdBQWlDLEVBQUUsQ0FBQztFQUMzQyxtQ0FBbUM7RUFDbkMsQ0FBQSxNQUFPLEdBQVUsRUFBRSxDQUFDO0VBQ3BCLENBQUEsTUFBTyxHQUFHLFFBQVEsYUFBYSxHQUFTO0VBRXhDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCQyxHQUNELElBQUksUUFBMEIsRUFBRTtJQUM5QixFQUFFLElBQUksQ0FBQyxDQUFBLGFBQWM7SUFDckIsSUFBSSxDQUFDLENBQUEsZ0JBQWlCLENBQUMsUUFBUSxDQUFDLE9BQU8sYUFBYSxDQUFDO0VBQ3ZEO0VBRUEsTUFBTSxDQUFBLGdCQUFpQixDQUNyQixRQUEwQjtJQUUxQixJQUFJO01BQ0YsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLFNBQVMsSUFBSTtNQUMzQyxJQUFJLE1BQU07UUFDUixFQUFFLElBQUksQ0FBQyxDQUFBLGFBQWM7TUFDdkIsT0FBTztRQUNMLElBQUksQ0FBQyxDQUFBLE1BQU8sQ0FBQyxJQUFJLENBQUM7VUFBRTtVQUFVO1FBQU07TUFDdEM7SUFDRixFQUFFLE9BQU8sR0FBRztNQUNWLElBQUksQ0FBQyxDQUFBLE1BQU8sQ0FBQyxJQUFJLENBQUM7SUFDcEI7SUFDQSxJQUFJLENBQUMsQ0FBQSxNQUFPLENBQUMsT0FBTztFQUN0QjtFQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JDLEdBQ0QsT0FBTyxVQUFvQztJQUN6QyxNQUFPLElBQUksQ0FBQyxDQUFBLGFBQWMsR0FBRyxFQUFHO01BQzlCLG1EQUFtRDtNQUNuRCxNQUFNLElBQUksQ0FBQyxDQUFBLE1BQU8sQ0FBQyxPQUFPO01BRTFCLHVFQUF1RTtNQUN2RSxLQUFLLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUEsTUFBTyxDQUFFO1FBQzlDLE1BQU07UUFDTixJQUFJLENBQUMsQ0FBQSxnQkFBaUIsQ0FBQztNQUN6QjtNQUVBLElBQUksSUFBSSxDQUFDLENBQUEsTUFBTyxDQUFDLE1BQU0sRUFBRTtRQUN2QixLQUFLLE1BQU0sS0FBSyxJQUFJLENBQUMsQ0FBQSxNQUFPLENBQUU7VUFDNUIsTUFBTTtRQUNSO01BQ0Y7TUFDQSwwREFBMEQ7TUFDMUQsSUFBSSxDQUFDLENBQUEsTUFBTyxDQUFDLE1BQU0sR0FBRztNQUN0QixJQUFJLENBQUMsQ0FBQSxNQUFPLEdBQUcsUUFBUSxhQUFhO0lBQ3RDO0VBQ0Y7RUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCQyxHQUNELGlCQUEyQztJQUN6QyxPQUFPLElBQUksQ0FBQyxPQUFPO0VBQ3JCO0FBQ0YifQ==
// denoCacheMetadata=12786306591294054765,14537674891154019136