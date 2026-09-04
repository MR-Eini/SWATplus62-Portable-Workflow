// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Utility for representing n-tuple. Used in {@linkcode tee}. */ class Queue {
  #source;
  #queue;
  head;
  done;
  constructor(iterable){
    this.#source = iterable[Symbol.asyncIterator]();
    this.#queue = {
      value: undefined,
      next: undefined
    };
    this.head = this.#queue;
    this.done = false;
  }
  async next() {
    const result = await this.#source.next();
    if (!result.done) {
      const nextNode = {
        value: result.value,
        next: undefined
      };
      this.#queue.next = nextNode;
      this.#queue = nextNode;
    } else {
      this.done = true;
    }
  }
}
/**
 * Branches the given async iterable into the `n` branches.
 *
 * @example Usage
 * ```ts
 * import { tee } from "@std/async/tee";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const gen = async function* gen() {
 *   yield 1;
 *   yield 2;
 *   yield 3;
 * };
 *
 * const [branch1, branch2] = tee(gen());
 *
 * const result1 = await Array.fromAsync(branch1);
 * assertEquals(result1, [1, 2, 3]);
 *
 * const result2 = await Array.fromAsync(branch2);
 * assertEquals(result2, [1, 2, 3]);
 * ```
 *
 * @typeParam T The type of the provided async iterable and the returned async iterables.
 * @typeParam N The amount of branches to tee into.
 * @param iterable The iterable to tee.
 * @param n The amount of branches to tee into.
 * @returns The tuple where each element is an async iterable.
 */ export function tee(iterable, n = 2) {
  const queue = new Queue(iterable);
  async function* generator() {
    let buffer = queue.head;
    while(true){
      if (buffer.next) {
        buffer = buffer.next;
        yield buffer.value;
      } else if (queue.done) {
        return;
      } else {
        await queue.next();
      }
    }
  }
  return Array.from({
    length: n
  }).map(()=>generator());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXN5bmMvMC4yMjQuMi90ZWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqIFV0aWxpdHkgZm9yIHJlcHJlc2VudGluZyBuLXR1cGxlLiBVc2VkIGluIHtAbGlua2NvZGUgdGVlfS4gKi9cbmV4cG9ydCB0eXBlIFR1cGxlPFQsIE4gZXh0ZW5kcyBudW1iZXI+ID0gTiBleHRlbmRzIE5cbiAgPyBudW1iZXIgZXh0ZW5kcyBOID8gVFtdIDogVHVwbGVPZjxULCBOLCBbXT5cbiAgOiBuZXZlcjtcblxuLyoqIFV0aWxpdHkgZm9yIHJlcHJlc2VudGluZyBuLXR1cGxlIG9mLiBVc2VkIGluIHtAbGlua2NvZGUgVHVwbGV9LiAqL1xuZXhwb3J0IHR5cGUgVHVwbGVPZjxULCBOIGV4dGVuZHMgbnVtYmVyLCBSIGV4dGVuZHMgdW5rbm93bltdPiA9XG4gIFJbXCJsZW5ndGhcIl0gZXh0ZW5kcyBOID8gUlxuICAgIDogVHVwbGVPZjxULCBOLCBbVCwgLi4uUl0+O1xuXG5pbnRlcmZhY2UgUXVldWVOb2RlPFQ+IHtcbiAgdmFsdWU6IFQ7XG4gIG5leHQ6IFF1ZXVlTm9kZTxUPiB8IHVuZGVmaW5lZDtcbn1cblxuY2xhc3MgUXVldWU8VD4ge1xuICAjc291cmNlOiBBc3luY0l0ZXJhdG9yPFQ+O1xuICAjcXVldWU6IFF1ZXVlTm9kZTxUPjtcbiAgaGVhZDogUXVldWVOb2RlPFQ+O1xuXG4gIGRvbmU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoaXRlcmFibGU6IEFzeW5jSXRlcmFibGU8VD4pIHtcbiAgICB0aGlzLiNzb3VyY2UgPSBpdGVyYWJsZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICB0aGlzLiNxdWV1ZSA9IHtcbiAgICAgIHZhbHVlOiB1bmRlZmluZWQhLFxuICAgICAgbmV4dDogdW5kZWZpbmVkLFxuICAgIH07XG4gICAgdGhpcy5oZWFkID0gdGhpcy4jcXVldWU7XG4gICAgdGhpcy5kb25lID0gZmFsc2U7XG4gIH1cblxuICBhc3luYyBuZXh0KCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuI3NvdXJjZS5uZXh0KCk7XG4gICAgaWYgKCFyZXN1bHQuZG9uZSkge1xuICAgICAgY29uc3QgbmV4dE5vZGU6IFF1ZXVlTm9kZTxUPiA9IHtcbiAgICAgICAgdmFsdWU6IHJlc3VsdC52YWx1ZSxcbiAgICAgICAgbmV4dDogdW5kZWZpbmVkLFxuICAgICAgfTtcbiAgICAgIHRoaXMuI3F1ZXVlLm5leHQgPSBuZXh0Tm9kZTtcbiAgICAgIHRoaXMuI3F1ZXVlID0gbmV4dE5vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQnJhbmNoZXMgdGhlIGdpdmVuIGFzeW5jIGl0ZXJhYmxlIGludG8gdGhlIGBuYCBicmFuY2hlcy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHRlZSB9IGZyb20gXCJAc3RkL2FzeW5jL3RlZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBnZW4gPSBhc3luYyBmdW5jdGlvbiogZ2VuKCkge1xuICogICB5aWVsZCAxO1xuICogICB5aWVsZCAyO1xuICogICB5aWVsZCAzO1xuICogfTtcbiAqXG4gKiBjb25zdCBbYnJhbmNoMSwgYnJhbmNoMl0gPSB0ZWUoZ2VuKCkpO1xuICpcbiAqIGNvbnN0IHJlc3VsdDEgPSBhd2FpdCBBcnJheS5mcm9tQXN5bmMoYnJhbmNoMSk7XG4gKiBhc3NlcnRFcXVhbHMocmVzdWx0MSwgWzEsIDIsIDNdKTtcbiAqXG4gKiBjb25zdCByZXN1bHQyID0gYXdhaXQgQXJyYXkuZnJvbUFzeW5jKGJyYW5jaDIpO1xuICogYXNzZXJ0RXF1YWxzKHJlc3VsdDIsIFsxLCAyLCAzXSk7XG4gKiBgYGBcbiAqXG4gKiBAdHlwZVBhcmFtIFQgVGhlIHR5cGUgb2YgdGhlIHByb3ZpZGVkIGFzeW5jIGl0ZXJhYmxlIGFuZCB0aGUgcmV0dXJuZWQgYXN5bmMgaXRlcmFibGVzLlxuICogQHR5cGVQYXJhbSBOIFRoZSBhbW91bnQgb2YgYnJhbmNoZXMgdG8gdGVlIGludG8uXG4gKiBAcGFyYW0gaXRlcmFibGUgVGhlIGl0ZXJhYmxlIHRvIHRlZS5cbiAqIEBwYXJhbSBuIFRoZSBhbW91bnQgb2YgYnJhbmNoZXMgdG8gdGVlIGludG8uXG4gKiBAcmV0dXJucyBUaGUgdHVwbGUgd2hlcmUgZWFjaCBlbGVtZW50IGlzIGFuIGFzeW5jIGl0ZXJhYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVlPFQsIE4gZXh0ZW5kcyBudW1iZXIgPSAyPihcbiAgaXRlcmFibGU6IEFzeW5jSXRlcmFibGU8VD4sXG4gIG46IE4gPSAyIGFzIE4sXG4pOiBUdXBsZTxBc3luY0l0ZXJhYmxlPFQ+LCBOPiB7XG4gIGNvbnN0IHF1ZXVlID0gbmV3IFF1ZXVlPFQ+KGl0ZXJhYmxlKTtcblxuICBhc3luYyBmdW5jdGlvbiogZ2VuZXJhdG9yKCk6IEFzeW5jR2VuZXJhdG9yPFQ+IHtcbiAgICBsZXQgYnVmZmVyID0gcXVldWUuaGVhZDtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKGJ1ZmZlci5uZXh0KSB7XG4gICAgICAgIGJ1ZmZlciA9IGJ1ZmZlci5uZXh0O1xuICAgICAgICB5aWVsZCBidWZmZXIudmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKHF1ZXVlLmRvbmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgcXVldWUubmV4dCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBBcnJheS5mcm9tKHsgbGVuZ3RoOiBuIH0pLm1hcChcbiAgICAoKSA9PiBnZW5lcmF0b3IoKSxcbiAgKSBhcyBUdXBsZTxcbiAgICBBc3luY0l0ZXJhYmxlPFQ+LFxuICAgIE5cbiAgPjtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLCtEQUErRCxHQWUvRCxNQUFNO0VBQ0osQ0FBQSxNQUFPLENBQW1CO0VBQzFCLENBQUEsS0FBTSxDQUFlO0VBQ3JCLEtBQW1CO0VBRW5CLEtBQWM7RUFFZCxZQUFZLFFBQTBCLENBQUU7SUFDdEMsSUFBSSxDQUFDLENBQUEsTUFBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLGFBQWEsQ0FBQztJQUM3QyxJQUFJLENBQUMsQ0FBQSxLQUFNLEdBQUc7TUFDWixPQUFPO01BQ1AsTUFBTTtJQUNSO0lBQ0EsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQSxLQUFNO0lBQ3ZCLElBQUksQ0FBQyxJQUFJLEdBQUc7RUFDZDtFQUVBLE1BQU0sT0FBTztJQUNYLE1BQU0sU0FBUyxNQUFNLElBQUksQ0FBQyxDQUFBLE1BQU8sQ0FBQyxJQUFJO0lBQ3RDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRTtNQUNoQixNQUFNLFdBQXlCO1FBQzdCLE9BQU8sT0FBTyxLQUFLO1FBQ25CLE1BQU07TUFDUjtNQUNBLElBQUksQ0FBQyxDQUFBLEtBQU0sQ0FBQyxJQUFJLEdBQUc7TUFDbkIsSUFBSSxDQUFDLENBQUEsS0FBTSxHQUFHO0lBQ2hCLE9BQU87TUFDTCxJQUFJLENBQUMsSUFBSSxHQUFHO0lBQ2Q7RUFDRjtBQUNGO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E0QkMsR0FDRCxPQUFPLFNBQVMsSUFDZCxRQUEwQixFQUMxQixJQUFPLENBQU07RUFFYixNQUFNLFFBQVEsSUFBSSxNQUFTO0VBRTNCLGdCQUFnQjtJQUNkLElBQUksU0FBUyxNQUFNLElBQUk7SUFDdkIsTUFBTyxLQUFNO01BQ1gsSUFBSSxPQUFPLElBQUksRUFBRTtRQUNmLFNBQVMsT0FBTyxJQUFJO1FBQ3BCLE1BQU0sT0FBTyxLQUFLO01BQ3BCLE9BQU8sSUFBSSxNQUFNLElBQUksRUFBRTtRQUNyQjtNQUNGLE9BQU87UUFDTCxNQUFNLE1BQU0sSUFBSTtNQUNsQjtJQUNGO0VBQ0Y7RUFFQSxPQUFPLE1BQU0sSUFBSSxDQUFDO0lBQUUsUUFBUTtFQUFFLEdBQUcsR0FBRyxDQUNsQyxJQUFNO0FBS1YifQ==
// denoCacheMetadata=3892955444792372603,6895355940677497783