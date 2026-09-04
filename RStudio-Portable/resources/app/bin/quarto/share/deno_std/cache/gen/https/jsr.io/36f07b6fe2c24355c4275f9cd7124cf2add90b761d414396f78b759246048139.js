// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Options for {@linkcode LimitedBytesTransformStream}. */ /**
 * A {@linkcode TransformStream} that will only read & enqueue chunks until the
 * total amount of enqueued data exceeds `size`. The last chunk that would
 * exceed the limit will NOT be enqueued, in which case a {@linkcode RangeError}
 * is thrown when `options.error` is set to true, otherwise the stream is just
 * terminated.
 *
 * @example `size` is equal to the total byte length of the chunks
 * ```ts
 * import { LimitedBytesTransformStream } from "@std/streams/limited-bytes-transform-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from(["1234", "5678"]);
 * const transformed = stream.pipeThrough(new TextEncoderStream()).pipeThrough(
 *   new LimitedBytesTransformStream(8),
 * ).pipeThrough(new TextDecoderStream());
 *
 * assertEquals(
 *   await Array.fromAsync(transformed),
 *   ["1234", "5678"],
 * );
 * ```
 *
 * @example `size` is less than the total byte length of the chunks, and at the
 * boundary of the chunks
 * ```ts
 * import { LimitedBytesTransformStream } from "@std/streams/limited-bytes-transform-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from(["1234", "5678"]);
 * const transformed = stream.pipeThrough(new TextEncoderStream()).pipeThrough(
 *   // `4` is the boundary of the chunks
 *   new LimitedBytesTransformStream(4),
 * ).pipeThrough(new TextDecoderStream());
 *
 * assertEquals(
 *   await Array.fromAsync(transformed),
 *   // The first chunk was read, but the second chunk was not
 *   ["1234"],
 * );
 * ```
 *
 * @example `size` is less than the total byte length of the chunks, and not at
 * the boundary of the chunks
 * ```ts
 * import { LimitedBytesTransformStream } from "@std/streams/limited-bytes-transform-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from(["1234", "5678"]);
 * const transformed = stream.pipeThrough(new TextEncoderStream()).pipeThrough(
 *   // `5` is not the boundary of the chunks
 *   new LimitedBytesTransformStream(5),
 * ).pipeThrough(new TextDecoderStream());
 *
 * assertEquals(
 *   await Array.fromAsync(transformed),
 *   // The second chunk was not read because it would exceed the specified size
 *   ["1234"],
 * );
 * ```
 *
 * @example error: true
 * ```ts
 * import { LimitedBytesTransformStream } from "@std/streams/limited-bytes-transform-stream";
 * import { assertRejects } from "@std/assert/assert-rejects";
 *
 * const stream = ReadableStream.from(["1234", "5678"]);
 * const transformed = stream.pipeThrough(new TextEncoderStream()).pipeThrough(
 *   new LimitedBytesTransformStream(5, { error: true }),
 * ).pipeThrough(new TextDecoderStream());
 *
 * await assertRejects(async () => {
 *   await Array.fromAsync(transformed);
 * }, RangeError);
 * ```
 */ export class LimitedBytesTransformStream extends TransformStream {
  #read = 0;
  /**
   * Constructs a new instance.
   *
   * @param size A size limit in bytes.
   * @param options Options for the stream.
   *
   * @example size = 42
   * ```ts no-assert
   * import { LimitedBytesTransformStream } from "@std/streams/limited-bytes-transform-stream";
   *
   * const limitedBytesTransformStream = new LimitedBytesTransformStream(42);
   * ```
   *
   * @example size = 42, error = true
   * ```ts no-assert
   * import { LimitedBytesTransformStream } from "@std/streams/limited-bytes-transform-stream";
   *
   * const limitedBytesTransformStream = new LimitedBytesTransformStream(42, { error: true });
   * ```
   */ constructor(size, options = {
    error: false
  }){
    super({
      transform: (chunk, controller)=>{
        if (this.#read + chunk.byteLength > size) {
          if (options.error) {
            throw new RangeError(`Exceeded byte size limit of '${size}'`);
          } else {
            controller.terminate();
          }
        } else {
          this.#read += chunk.byteLength;
          controller.enqueue(chunk);
        }
      }
    });
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L2xpbWl0ZWRfYnl0ZXNfdHJhbnNmb3JtX3N0cmVhbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBMaW1pdGVkQnl0ZXNUcmFuc2Zvcm1TdHJlYW19LiAqL1xuZXhwb3J0IGludGVyZmFjZSBMaW1pdGVkQnl0ZXNUcmFuc2Zvcm1TdHJlYW1PcHRpb25zIHtcbiAgLyoqXG4gICAqIElmIHRydWUsIGEge0BsaW5rY29kZSBSYW5nZUVycm9yfSBpcyB0aHJvd24gd2hlbiBxdWV1ZWluZyB0aGUgY3VycmVudCBjaHVua1xuICAgKiB3b3VsZCBleGNlZWQgdGhlIHNwZWNpZmllZCBzaXplIGxpbWl0LlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBlcnJvcj86IGJvb2xlYW47XG59XG5cbi8qKlxuICogQSB7QGxpbmtjb2RlIFRyYW5zZm9ybVN0cmVhbX0gdGhhdCB3aWxsIG9ubHkgcmVhZCAmIGVucXVldWUgY2h1bmtzIHVudGlsIHRoZVxuICogdG90YWwgYW1vdW50IG9mIGVucXVldWVkIGRhdGEgZXhjZWVkcyBgc2l6ZWAuIFRoZSBsYXN0IGNodW5rIHRoYXQgd291bGRcbiAqIGV4Y2VlZCB0aGUgbGltaXQgd2lsbCBOT1QgYmUgZW5xdWV1ZWQsIGluIHdoaWNoIGNhc2UgYSB7QGxpbmtjb2RlIFJhbmdlRXJyb3J9XG4gKiBpcyB0aHJvd24gd2hlbiBgb3B0aW9ucy5lcnJvcmAgaXMgc2V0IHRvIHRydWUsIG90aGVyd2lzZSB0aGUgc3RyZWFtIGlzIGp1c3RcbiAqIHRlcm1pbmF0ZWQuXG4gKlxuICogQGV4YW1wbGUgYHNpemVgIGlzIGVxdWFsIHRvIHRoZSB0b3RhbCBieXRlIGxlbmd0aCBvZiB0aGUgY2h1bmtzXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgTGltaXRlZEJ5dGVzVHJhbnNmb3JtU3RyZWFtIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9saW1pdGVkLWJ5dGVzLXRyYW5zZm9ybS1zdHJlYW1cIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgc3RyZWFtID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXCIxMjM0XCIsIFwiNTY3OFwiXSk7XG4gKiBjb25zdCB0cmFuc2Zvcm1lZCA9IHN0cmVhbS5waXBlVGhyb3VnaChuZXcgVGV4dEVuY29kZXJTdHJlYW0oKSkucGlwZVRocm91Z2goXG4gKiAgIG5ldyBMaW1pdGVkQnl0ZXNUcmFuc2Zvcm1TdHJlYW0oOCksXG4gKiApLnBpcGVUaHJvdWdoKG5ldyBUZXh0RGVjb2RlclN0cmVhbSgpKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGF3YWl0IEFycmF5LmZyb21Bc3luYyh0cmFuc2Zvcm1lZCksXG4gKiAgIFtcIjEyMzRcIiwgXCI1Njc4XCJdLFxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIGBzaXplYCBpcyBsZXNzIHRoYW4gdGhlIHRvdGFsIGJ5dGUgbGVuZ3RoIG9mIHRoZSBjaHVua3MsIGFuZCBhdCB0aGVcbiAqIGJvdW5kYXJ5IG9mIHRoZSBjaHVua3NcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBMaW1pdGVkQnl0ZXNUcmFuc2Zvcm1TdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2xpbWl0ZWQtYnl0ZXMtdHJhbnNmb3JtLXN0cmVhbVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzdHJlYW0gPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcIjEyMzRcIiwgXCI1Njc4XCJdKTtcbiAqIGNvbnN0IHRyYW5zZm9ybWVkID0gc3RyZWFtLnBpcGVUaHJvdWdoKG5ldyBUZXh0RW5jb2RlclN0cmVhbSgpKS5waXBlVGhyb3VnaChcbiAqICAgLy8gYDRgIGlzIHRoZSBib3VuZGFyeSBvZiB0aGUgY2h1bmtzXG4gKiAgIG5ldyBMaW1pdGVkQnl0ZXNUcmFuc2Zvcm1TdHJlYW0oNCksXG4gKiApLnBpcGVUaHJvdWdoKG5ldyBUZXh0RGVjb2RlclN0cmVhbSgpKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGF3YWl0IEFycmF5LmZyb21Bc3luYyh0cmFuc2Zvcm1lZCksXG4gKiAgIC8vIFRoZSBmaXJzdCBjaHVuayB3YXMgcmVhZCwgYnV0IHRoZSBzZWNvbmQgY2h1bmsgd2FzIG5vdFxuICogICBbXCIxMjM0XCJdLFxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIGBzaXplYCBpcyBsZXNzIHRoYW4gdGhlIHRvdGFsIGJ5dGUgbGVuZ3RoIG9mIHRoZSBjaHVua3MsIGFuZCBub3QgYXRcbiAqIHRoZSBib3VuZGFyeSBvZiB0aGUgY2h1bmtzXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgTGltaXRlZEJ5dGVzVHJhbnNmb3JtU3RyZWFtIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9saW1pdGVkLWJ5dGVzLXRyYW5zZm9ybS1zdHJlYW1cIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgc3RyZWFtID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXCIxMjM0XCIsIFwiNTY3OFwiXSk7XG4gKiBjb25zdCB0cmFuc2Zvcm1lZCA9IHN0cmVhbS5waXBlVGhyb3VnaChuZXcgVGV4dEVuY29kZXJTdHJlYW0oKSkucGlwZVRocm91Z2goXG4gKiAgIC8vIGA1YCBpcyBub3QgdGhlIGJvdW5kYXJ5IG9mIHRoZSBjaHVua3NcbiAqICAgbmV3IExpbWl0ZWRCeXRlc1RyYW5zZm9ybVN0cmVhbSg1KSxcbiAqICkucGlwZVRocm91Z2gobmV3IFRleHREZWNvZGVyU3RyZWFtKCkpO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgYXdhaXQgQXJyYXkuZnJvbUFzeW5jKHRyYW5zZm9ybWVkKSxcbiAqICAgLy8gVGhlIHNlY29uZCBjaHVuayB3YXMgbm90IHJlYWQgYmVjYXVzZSBpdCB3b3VsZCBleGNlZWQgdGhlIHNwZWNpZmllZCBzaXplXG4gKiAgIFtcIjEyMzRcIl0sXG4gKiApO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgZXJyb3I6IHRydWVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBMaW1pdGVkQnl0ZXNUcmFuc2Zvcm1TdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2xpbWl0ZWQtYnl0ZXMtdHJhbnNmb3JtLXN0cmVhbVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0UmVqZWN0cyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtcmVqZWN0c1wiO1xuICpcbiAqIGNvbnN0IHN0cmVhbSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1wiMTIzNFwiLCBcIjU2NzhcIl0pO1xuICogY29uc3QgdHJhbnNmb3JtZWQgPSBzdHJlYW0ucGlwZVRocm91Z2gobmV3IFRleHRFbmNvZGVyU3RyZWFtKCkpLnBpcGVUaHJvdWdoKFxuICogICBuZXcgTGltaXRlZEJ5dGVzVHJhbnNmb3JtU3RyZWFtKDUsIHsgZXJyb3I6IHRydWUgfSksXG4gKiApLnBpcGVUaHJvdWdoKG5ldyBUZXh0RGVjb2RlclN0cmVhbSgpKTtcbiAqXG4gKiBhd2FpdCBhc3NlcnRSZWplY3RzKGFzeW5jICgpID0+IHtcbiAqICAgYXdhaXQgQXJyYXkuZnJvbUFzeW5jKHRyYW5zZm9ybWVkKTtcbiAqIH0sIFJhbmdlRXJyb3IpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBMaW1pdGVkQnl0ZXNUcmFuc2Zvcm1TdHJlYW1cbiAgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJlYW08VWludDhBcnJheSwgVWludDhBcnJheT4ge1xuICAjcmVhZCA9IDA7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBzaXplIEEgc2l6ZSBsaW1pdCBpbiBieXRlcy5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgdGhlIHN0cmVhbS5cbiAgICpcbiAgICogQGV4YW1wbGUgc2l6ZSA9IDQyXG4gICAqIGBgYHRzIG5vLWFzc2VydFxuICAgKiBpbXBvcnQgeyBMaW1pdGVkQnl0ZXNUcmFuc2Zvcm1TdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2xpbWl0ZWQtYnl0ZXMtdHJhbnNmb3JtLXN0cmVhbVwiO1xuICAgKlxuICAgKiBjb25zdCBsaW1pdGVkQnl0ZXNUcmFuc2Zvcm1TdHJlYW0gPSBuZXcgTGltaXRlZEJ5dGVzVHJhbnNmb3JtU3RyZWFtKDQyKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBleGFtcGxlIHNpemUgPSA0MiwgZXJyb3IgPSB0cnVlXG4gICAqIGBgYHRzIG5vLWFzc2VydFxuICAgKiBpbXBvcnQgeyBMaW1pdGVkQnl0ZXNUcmFuc2Zvcm1TdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2xpbWl0ZWQtYnl0ZXMtdHJhbnNmb3JtLXN0cmVhbVwiO1xuICAgKlxuICAgKiBjb25zdCBsaW1pdGVkQnl0ZXNUcmFuc2Zvcm1TdHJlYW0gPSBuZXcgTGltaXRlZEJ5dGVzVHJhbnNmb3JtU3RyZWFtKDQyLCB7IGVycm9yOiB0cnVlIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHNpemU6IG51bWJlcixcbiAgICBvcHRpb25zOiBMaW1pdGVkQnl0ZXNUcmFuc2Zvcm1TdHJlYW1PcHRpb25zID0geyBlcnJvcjogZmFsc2UgfSxcbiAgKSB7XG4gICAgc3VwZXIoe1xuICAgICAgdHJhbnNmb3JtOiAoY2h1bmssIGNvbnRyb2xsZXIpID0+IHtcbiAgICAgICAgaWYgKCh0aGlzLiNyZWFkICsgY2h1bmsuYnl0ZUxlbmd0aCkgPiBzaXplKSB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMuZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBFeGNlZWRlZCBieXRlIHNpemUgbGltaXQgb2YgJyR7c2l6ZX0nYCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIudGVybWluYXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuI3JlYWQgKz0gY2h1bmsuYnl0ZUxlbmd0aDtcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmspO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyx5REFBeUQsR0FXekQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTJFQyxHQUNELE9BQU8sTUFBTSxvQ0FDSDtFQUNSLENBQUEsSUFBSyxHQUFHLEVBQUU7RUFFVjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CQyxHQUNELFlBQ0UsSUFBWSxFQUNaLFVBQThDO0lBQUUsT0FBTztFQUFNLENBQUMsQ0FDOUQ7SUFDQSxLQUFLLENBQUM7TUFDSixXQUFXLENBQUMsT0FBTztRQUNqQixJQUFJLEFBQUMsSUFBSSxDQUFDLENBQUEsSUFBSyxHQUFHLE1BQU0sVUFBVSxHQUFJLE1BQU07VUFDMUMsSUFBSSxRQUFRLEtBQUssRUFBRTtZQUNqQixNQUFNLElBQUksV0FBVyxDQUFDLDZCQUE2QixFQUFFLEtBQUssQ0FBQyxDQUFDO1VBQzlELE9BQU87WUFDTCxXQUFXLFNBQVM7VUFDdEI7UUFDRixPQUFPO1VBQ0wsSUFBSSxDQUFDLENBQUEsSUFBSyxJQUFJLE1BQU0sVUFBVTtVQUM5QixXQUFXLE9BQU8sQ0FBQztRQUNyQjtNQUNGO0lBQ0Y7RUFDRjtBQUNGIn0=
// denoCacheMetadata=3976663761215090801,8240469277075630422