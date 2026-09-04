// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Options for {@linkcode LimitedTransformStream} */ /**
 * A {@linkcode TransformStream} that will only read & enqueue `size` amount of
 * chunks.
 *
 * If `options.error` is set, then instead of terminating the stream,
 * a {@linkcode RangeError} will be thrown when the total number of enqueued
 * chunks is about to exceed the specified size.
 *
 * @typeparam T The type the chunks in the stream.
 *
 * @example `size` is equal to the total number of chunks
 * ```ts
 * import { LimitedTransformStream } from "@std/streams/limited-transform-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from(["1234", "5678"]);
 * const transformed = stream.pipeThrough(
 *   new LimitedTransformStream(2),
 * );
 *
 * // All chunks were read
 * assertEquals(
 *   await Array.fromAsync(transformed),
 *   ["1234", "5678"],
 * );
 * ```
 *
 * @example `size` is less than the total number of chunks
 * ```ts
 * import { LimitedTransformStream } from "@std/streams/limited-transform-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from(["1234", "5678"]);
 * const transformed = stream.pipeThrough(
 *   new LimitedTransformStream(1),
 * );
 *
 * // Only the first chunk was read
 * assertEquals(
 *   await Array.fromAsync(transformed),
 *   ["1234"],
 * );
 * ```
 *
 * @example error: true
 * ```ts
 * import { LimitedTransformStream } from "@std/streams/limited-transform-stream";
 * import { assertRejects } from "@std/assert/assert-rejects";
 *
 * const stream = ReadableStream.from(["1234", "5678"]);
 * const transformed = stream.pipeThrough(
 *   new LimitedTransformStream(1, { error: true }),
 * );
 *
 * await assertRejects(async () => {
 *   await Array.fromAsync(transformed);
 * }, RangeError);
 * ```
 */ export class LimitedTransformStream extends TransformStream {
  #read = 0;
  /**
   * Constructs a new instance.
   *
   * @param size The maximum number of chunks to read.
   * @param options Options for the stream.
   *
   * @example size = 42
   * ```ts no-assert
   * import { LimitedTransformStream } from "@std/streams/limited-transform-stream";
   *
   * const limitedTransformStream = new LimitedTransformStream(42);
   * ```
   *
   * @example size = 42, error = true
   * ```ts no-assert
   * import { LimitedTransformStream } from "@std/streams/limited-transform-stream";
   *
   * const limitedTransformStream = new LimitedTransformStream(42, { error: true });
   * ```
   */ constructor(size, options = {
    error: false
  }){
    super({
      transform: (chunk, controller)=>{
        if (this.#read + 1 > size) {
          if (options.error) {
            throw new RangeError(`Exceeded chunk limit of '${size}'`);
          } else {
            controller.terminate();
          }
        } else {
          this.#read++;
          controller.enqueue(chunk);
        }
      }
    });
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L2xpbWl0ZWRfdHJhbnNmb3JtX3N0cmVhbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBMaW1pdGVkVHJhbnNmb3JtU3RyZWFtfSAqL1xuZXhwb3J0IGludGVyZmFjZSBMaW1pdGVkVHJhbnNmb3JtU3RyZWFtT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBJZiB0cnVlLCBhIHtAbGlua2NvZGUgUmFuZ2VFcnJvcn0gaXMgdGhyb3duIHdoZW4gdGhlIHRvdGFsIG51bWJlciBvZlxuICAgKiBlbnF1ZXVlZCBjaHVua3MgaXMgYWJvdXQgdG8gZXhjZWVkIHRoZSBzcGVjaWZpZWQgbGltaXQuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtmYWxzZX1cbiAgICovXG4gIGVycm9yPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBIHtAbGlua2NvZGUgVHJhbnNmb3JtU3RyZWFtfSB0aGF0IHdpbGwgb25seSByZWFkICYgZW5xdWV1ZSBgc2l6ZWAgYW1vdW50IG9mXG4gKiBjaHVua3MuXG4gKlxuICogSWYgYG9wdGlvbnMuZXJyb3JgIGlzIHNldCwgdGhlbiBpbnN0ZWFkIG9mIHRlcm1pbmF0aW5nIHRoZSBzdHJlYW0sXG4gKiBhIHtAbGlua2NvZGUgUmFuZ2VFcnJvcn0gd2lsbCBiZSB0aHJvd24gd2hlbiB0aGUgdG90YWwgbnVtYmVyIG9mIGVucXVldWVkXG4gKiBjaHVua3MgaXMgYWJvdXQgdG8gZXhjZWVkIHRoZSBzcGVjaWZpZWQgc2l6ZS5cbiAqXG4gKiBAdHlwZXBhcmFtIFQgVGhlIHR5cGUgdGhlIGNodW5rcyBpbiB0aGUgc3RyZWFtLlxuICpcbiAqIEBleGFtcGxlIGBzaXplYCBpcyBlcXVhbCB0byB0aGUgdG90YWwgbnVtYmVyIG9mIGNodW5rc1xuICogYGBgdHNcbiAqIGltcG9ydCB7IExpbWl0ZWRUcmFuc2Zvcm1TdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2xpbWl0ZWQtdHJhbnNmb3JtLXN0cmVhbVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzdHJlYW0gPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcIjEyMzRcIiwgXCI1Njc4XCJdKTtcbiAqIGNvbnN0IHRyYW5zZm9ybWVkID0gc3RyZWFtLnBpcGVUaHJvdWdoKFxuICogICBuZXcgTGltaXRlZFRyYW5zZm9ybVN0cmVhbSgyKSxcbiAqICk7XG4gKlxuICogLy8gQWxsIGNodW5rcyB3ZXJlIHJlYWRcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgYXdhaXQgQXJyYXkuZnJvbUFzeW5jKHRyYW5zZm9ybWVkKSxcbiAqICAgW1wiMTIzNFwiLCBcIjU2NzhcIl0sXG4gKiApO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgYHNpemVgIGlzIGxlc3MgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIGNodW5rc1xuICogYGBgdHNcbiAqIGltcG9ydCB7IExpbWl0ZWRUcmFuc2Zvcm1TdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2xpbWl0ZWQtdHJhbnNmb3JtLXN0cmVhbVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzdHJlYW0gPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcIjEyMzRcIiwgXCI1Njc4XCJdKTtcbiAqIGNvbnN0IHRyYW5zZm9ybWVkID0gc3RyZWFtLnBpcGVUaHJvdWdoKFxuICogICBuZXcgTGltaXRlZFRyYW5zZm9ybVN0cmVhbSgxKSxcbiAqICk7XG4gKlxuICogLy8gT25seSB0aGUgZmlyc3QgY2h1bmsgd2FzIHJlYWRcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgYXdhaXQgQXJyYXkuZnJvbUFzeW5jKHRyYW5zZm9ybWVkKSxcbiAqICAgW1wiMTIzNFwiXSxcbiAqICk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBlcnJvcjogdHJ1ZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IExpbWl0ZWRUcmFuc2Zvcm1TdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2xpbWl0ZWQtdHJhbnNmb3JtLXN0cmVhbVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0UmVqZWN0cyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtcmVqZWN0c1wiO1xuICpcbiAqIGNvbnN0IHN0cmVhbSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1wiMTIzNFwiLCBcIjU2NzhcIl0pO1xuICogY29uc3QgdHJhbnNmb3JtZWQgPSBzdHJlYW0ucGlwZVRocm91Z2goXG4gKiAgIG5ldyBMaW1pdGVkVHJhbnNmb3JtU3RyZWFtKDEsIHsgZXJyb3I6IHRydWUgfSksXG4gKiApO1xuICpcbiAqIGF3YWl0IGFzc2VydFJlamVjdHMoYXN5bmMgKCkgPT4ge1xuICogICBhd2FpdCBBcnJheS5mcm9tQXN5bmModHJhbnNmb3JtZWQpO1xuICogfSwgUmFuZ2VFcnJvcik7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIExpbWl0ZWRUcmFuc2Zvcm1TdHJlYW08VD4gZXh0ZW5kcyBUcmFuc2Zvcm1TdHJlYW08VCwgVD4ge1xuICAjcmVhZCA9IDA7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBzaXplIFRoZSBtYXhpbXVtIG51bWJlciBvZiBjaHVua3MgdG8gcmVhZC5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgdGhlIHN0cmVhbS5cbiAgICpcbiAgICogQGV4YW1wbGUgc2l6ZSA9IDQyXG4gICAqIGBgYHRzIG5vLWFzc2VydFxuICAgKiBpbXBvcnQgeyBMaW1pdGVkVHJhbnNmb3JtU3RyZWFtIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9saW1pdGVkLXRyYW5zZm9ybS1zdHJlYW1cIjtcbiAgICpcbiAgICogY29uc3QgbGltaXRlZFRyYW5zZm9ybVN0cmVhbSA9IG5ldyBMaW1pdGVkVHJhbnNmb3JtU3RyZWFtKDQyKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBleGFtcGxlIHNpemUgPSA0MiwgZXJyb3IgPSB0cnVlXG4gICAqIGBgYHRzIG5vLWFzc2VydFxuICAgKiBpbXBvcnQgeyBMaW1pdGVkVHJhbnNmb3JtU3RyZWFtIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9saW1pdGVkLXRyYW5zZm9ybS1zdHJlYW1cIjtcbiAgICpcbiAgICogY29uc3QgbGltaXRlZFRyYW5zZm9ybVN0cmVhbSA9IG5ldyBMaW1pdGVkVHJhbnNmb3JtU3RyZWFtKDQyLCB7IGVycm9yOiB0cnVlIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHNpemU6IG51bWJlcixcbiAgICBvcHRpb25zOiBMaW1pdGVkVHJhbnNmb3JtU3RyZWFtT3B0aW9ucyA9IHsgZXJyb3I6IGZhbHNlIH0sXG4gICkge1xuICAgIHN1cGVyKHtcbiAgICAgIHRyYW5zZm9ybTogKGNodW5rLCBjb250cm9sbGVyKSA9PiB7XG4gICAgICAgIGlmICgodGhpcy4jcmVhZCArIDEpID4gc2l6ZSkge1xuICAgICAgICAgIGlmIChvcHRpb25zLmVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgRXhjZWVkZWQgY2h1bmsgbGltaXQgb2YgJyR7c2l6ZX0nYCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIudGVybWluYXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuI3JlYWQrKztcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmspO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxtREFBbUQsR0FXbkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EwREMsR0FDRCxPQUFPLE1BQU0sK0JBQWtDO0VBQzdDLENBQUEsSUFBSyxHQUFHLEVBQUU7RUFFVjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CQyxHQUNELFlBQ0UsSUFBWSxFQUNaLFVBQXlDO0lBQUUsT0FBTztFQUFNLENBQUMsQ0FDekQ7SUFDQSxLQUFLLENBQUM7TUFDSixXQUFXLENBQUMsT0FBTztRQUNqQixJQUFJLEFBQUMsSUFBSSxDQUFDLENBQUEsSUFBSyxHQUFHLElBQUssTUFBTTtVQUMzQixJQUFJLFFBQVEsS0FBSyxFQUFFO1lBQ2pCLE1BQU0sSUFBSSxXQUFXLENBQUMseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUM7VUFDMUQsT0FBTztZQUNMLFdBQVcsU0FBUztVQUN0QjtRQUNGLE9BQU87VUFDTCxJQUFJLENBQUMsQ0FBQSxJQUFLO1VBQ1YsV0FBVyxPQUFPLENBQUM7UUFDckI7TUFDRjtJQUNGO0VBQ0Y7QUFDRiJ9
// denoCacheMetadata=9405464820730911607,3425448263360640547