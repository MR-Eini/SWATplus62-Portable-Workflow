// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * A transform stream that only transforms from the zero-indexed `start` and
 * `end` bytes (both inclusive).
 *
 * @example Basic usage
 * ```ts
 * import { ByteSliceStream } from "@std/streams/byte-slice-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from([
 *   new Uint8Array([0, 1]),
 *   new Uint8Array([2, 3, 4]),
 * ]);
 * const slicedStream = stream.pipeThrough(new ByteSliceStream(1, 3));
 *
 * assertEquals(
 *   await Array.fromAsync(slicedStream),
 *  [new Uint8Array([1]), new Uint8Array([2, 3])]
 * );
 * ```
 *
 * @example Get a range of bytes from a fetch response body
 * ```ts
 * import { ByteSliceStream } from "@std/streams/byte-slice-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const response = await fetch("https://example.com");
 * const rangedStream = response.body!
 *   .pipeThrough(new ByteSliceStream(3, 8));
 * const collected = await Array.fromAsync(rangedStream);
 * assertEquals(collected[0]?.length, 6);
 * ```
 */ export class ByteSliceStream extends TransformStream {
  #offsetStart = 0;
  #offsetEnd = 0;
  /**
   * Constructs a new instance.
   *
   * @param start The zero-indexed byte index to start reading from.
   * @param end The zero-indexed byte index to stop reading at. Inclusive.
   *
   * @example No parameters
   * ```ts no-assert
   * import { ByteSliceStream } from "@std/streams/byte-slice-stream";
   *
   * const byteSliceStream = new ByteSliceStream();
   * ```
   *
   * @example start = 4, end = 11
   * ```ts no-assert
   * import { ByteSliceStream } from "@std/streams/byte-slice-stream";
   *
   * const byteSliceStream = new ByteSliceStream(4, 11);
   * ```
   */ constructor(start = 0, end = Infinity){
    super({
      start: ()=>{
        if (start < 0) {
          throw new RangeError("`start` must be greater than 0");
        }
        end += 1;
      },
      transform: (chunk, controller)=>{
        this.#offsetStart = this.#offsetEnd;
        this.#offsetEnd += chunk.byteLength;
        if (this.#offsetEnd > start) {
          if (this.#offsetStart < start) {
            chunk = chunk.slice(start - this.#offsetStart);
          }
          if (this.#offsetEnd >= end) {
            chunk = chunk.slice(0, chunk.byteLength - this.#offsetEnd + end);
            controller.enqueue(chunk);
            controller.terminate();
          } else {
            controller.enqueue(chunk);
          }
        }
      }
    });
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L2J5dGVfc2xpY2Vfc3RyZWFtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogQSB0cmFuc2Zvcm0gc3RyZWFtIHRoYXQgb25seSB0cmFuc2Zvcm1zIGZyb20gdGhlIHplcm8taW5kZXhlZCBgc3RhcnRgIGFuZFxuICogYGVuZGAgYnl0ZXMgKGJvdGggaW5jbHVzaXZlKS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IEJ5dGVTbGljZVN0cmVhbSB9IGZyb20gXCJAc3RkL3N0cmVhbXMvYnl0ZS1zbGljZS1zdHJlYW1cIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgc3RyZWFtID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXG4gKiAgIG5ldyBVaW50OEFycmF5KFswLCAxXSksXG4gKiAgIG5ldyBVaW50OEFycmF5KFsyLCAzLCA0XSksXG4gKiBdKTtcbiAqIGNvbnN0IHNsaWNlZFN0cmVhbSA9IHN0cmVhbS5waXBlVGhyb3VnaChuZXcgQnl0ZVNsaWNlU3RyZWFtKDEsIDMpKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGF3YWl0IEFycmF5LmZyb21Bc3luYyhzbGljZWRTdHJlYW0pLFxuICogIFtuZXcgVWludDhBcnJheShbMV0pLCBuZXcgVWludDhBcnJheShbMiwgM10pXVxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIEdldCBhIHJhbmdlIG9mIGJ5dGVzIGZyb20gYSBmZXRjaCByZXNwb25zZSBib2R5XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgQnl0ZVNsaWNlU3RyZWFtIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9ieXRlLXNsaWNlLXN0cmVhbVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiaHR0cHM6Ly9leGFtcGxlLmNvbVwiKTtcbiAqIGNvbnN0IHJhbmdlZFN0cmVhbSA9IHJlc3BvbnNlLmJvZHkhXG4gKiAgIC5waXBlVGhyb3VnaChuZXcgQnl0ZVNsaWNlU3RyZWFtKDMsIDgpKTtcbiAqIGNvbnN0IGNvbGxlY3RlZCA9IGF3YWl0IEFycmF5LmZyb21Bc3luYyhyYW5nZWRTdHJlYW0pO1xuICogYXNzZXJ0RXF1YWxzKGNvbGxlY3RlZFswXT8ubGVuZ3RoLCA2KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgQnl0ZVNsaWNlU3RyZWFtIGV4dGVuZHMgVHJhbnNmb3JtU3RyZWFtPFVpbnQ4QXJyYXksIFVpbnQ4QXJyYXk+IHtcbiAgI29mZnNldFN0YXJ0ID0gMDtcbiAgI29mZnNldEVuZCA9IDA7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydCBUaGUgemVyby1pbmRleGVkIGJ5dGUgaW5kZXggdG8gc3RhcnQgcmVhZGluZyBmcm9tLlxuICAgKiBAcGFyYW0gZW5kIFRoZSB6ZXJvLWluZGV4ZWQgYnl0ZSBpbmRleCB0byBzdG9wIHJlYWRpbmcgYXQuIEluY2x1c2l2ZS5cbiAgICpcbiAgICogQGV4YW1wbGUgTm8gcGFyYW1ldGVyc1xuICAgKiBgYGB0cyBuby1hc3NlcnRcbiAgICogaW1wb3J0IHsgQnl0ZVNsaWNlU3RyZWFtIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9ieXRlLXNsaWNlLXN0cmVhbVwiO1xuICAgKlxuICAgKiBjb25zdCBieXRlU2xpY2VTdHJlYW0gPSBuZXcgQnl0ZVNsaWNlU3RyZWFtKCk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAZXhhbXBsZSBzdGFydCA9IDQsIGVuZCA9IDExXG4gICAqIGBgYHRzIG5vLWFzc2VydFxuICAgKiBpbXBvcnQgeyBCeXRlU2xpY2VTdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2J5dGUtc2xpY2Utc3RyZWFtXCI7XG4gICAqXG4gICAqIGNvbnN0IGJ5dGVTbGljZVN0cmVhbSA9IG5ldyBCeXRlU2xpY2VTdHJlYW0oNCwgMTEpO1xuICAgKiBgYGBcbiAgICovXG4gIGNvbnN0cnVjdG9yKHN0YXJ0ID0gMCwgZW5kOiBudW1iZXIgPSBJbmZpbml0eSkge1xuICAgIHN1cGVyKHtcbiAgICAgIHN0YXJ0OiAoKSA9PiB7XG4gICAgICAgIGlmIChzdGFydCA8IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcImBzdGFydGAgbXVzdCBiZSBncmVhdGVyIHRoYW4gMFwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbmQgKz0gMTtcbiAgICAgIH0sXG4gICAgICB0cmFuc2Zvcm06IChjaHVuaywgY29udHJvbGxlcikgPT4ge1xuICAgICAgICB0aGlzLiNvZmZzZXRTdGFydCA9IHRoaXMuI29mZnNldEVuZDtcbiAgICAgICAgdGhpcy4jb2Zmc2V0RW5kICs9IGNodW5rLmJ5dGVMZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLiNvZmZzZXRFbmQgPiBzdGFydCkge1xuICAgICAgICAgIGlmICh0aGlzLiNvZmZzZXRTdGFydCA8IHN0YXJ0KSB7XG4gICAgICAgICAgICBjaHVuayA9IGNodW5rLnNsaWNlKHN0YXJ0IC0gdGhpcy4jb2Zmc2V0U3RhcnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy4jb2Zmc2V0RW5kID49IGVuZCkge1xuICAgICAgICAgICAgY2h1bmsgPSBjaHVuay5zbGljZSgwLCBjaHVuay5ieXRlTGVuZ3RoIC0gdGhpcy4jb2Zmc2V0RW5kICsgZW5kKTtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjaHVuayk7XG4gICAgICAgICAgICBjb250cm9sbGVyLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmspO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBZ0NDLEdBQ0QsT0FBTyxNQUFNLHdCQUF3QjtFQUNuQyxDQUFBLFdBQVksR0FBRyxFQUFFO0VBQ2pCLENBQUEsU0FBVSxHQUFHLEVBQUU7RUFFZjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CQyxHQUNELFlBQVksUUFBUSxDQUFDLEVBQUUsTUFBYyxRQUFRLENBQUU7SUFDN0MsS0FBSyxDQUFDO01BQ0osT0FBTztRQUNMLElBQUksUUFBUSxHQUFHO1VBQ2IsTUFBTSxJQUFJLFdBQVc7UUFDdkI7UUFDQSxPQUFPO01BQ1Q7TUFDQSxXQUFXLENBQUMsT0FBTztRQUNqQixJQUFJLENBQUMsQ0FBQSxXQUFZLEdBQUcsSUFBSSxDQUFDLENBQUEsU0FBVTtRQUNuQyxJQUFJLENBQUMsQ0FBQSxTQUFVLElBQUksTUFBTSxVQUFVO1FBQ25DLElBQUksSUFBSSxDQUFDLENBQUEsU0FBVSxHQUFHLE9BQU87VUFDM0IsSUFBSSxJQUFJLENBQUMsQ0FBQSxXQUFZLEdBQUcsT0FBTztZQUM3QixRQUFRLE1BQU0sS0FBSyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUEsV0FBWTtVQUMvQztVQUNBLElBQUksSUFBSSxDQUFDLENBQUEsU0FBVSxJQUFJLEtBQUs7WUFDMUIsUUFBUSxNQUFNLEtBQUssQ0FBQyxHQUFHLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFBLFNBQVUsR0FBRztZQUM1RCxXQUFXLE9BQU8sQ0FBQztZQUNuQixXQUFXLFNBQVM7VUFDdEIsT0FBTztZQUNMLFdBQVcsT0FBTyxDQUFDO1VBQ3JCO1FBQ0Y7TUFDRjtJQUNGO0VBQ0Y7QUFDRiJ9
// denoCacheMetadata=10034534712255057371,7353339232246582052