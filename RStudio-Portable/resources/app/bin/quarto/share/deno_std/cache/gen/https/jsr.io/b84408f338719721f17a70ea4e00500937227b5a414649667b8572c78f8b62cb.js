// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { copy } from "jsr:/@std/bytes@^1.0.0-rc.3/copy";
const MAX_SIZE = 2 ** 32 - 2;
const DEFAULT_CHUNK_SIZE = 16_640;
/**
 * A variable-sized buffer of bytes with `readable` and `writable` getters that
 * allows you to work with {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API}.
 *
 * Buffer is almost always used with some I/O like files and sockets. It allows
 * one to buffer up a download from a socket. Buffer grows and shrinks as
 * necessary.
 *
 * Buffer is NOT the same thing as Node's Buffer. Node's Buffer was created in
 * 2009 before JavaScript had the concept of ArrayBuffers. It's simply a
 * non-standard ArrayBuffer.
 *
 * ArrayBuffer is a fixed memory allocation. Buffer is implemented on top of
 * ArrayBuffer.
 *
 * Based on {@link https://golang.org/pkg/bytes/#Buffer | Go Buffer}.
 *
 * @example Buffer input bytes and convert it to a string
 * ```ts
 * import { Buffer } from "@std/streams/buffer";
 * import { toText } from "@std/streams/to-text";
 * import { assert } from "@std/assert/assert";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * // Create a new buffer
 * const buf = new Buffer();
 * assertEquals(buf.capacity, 0);
 * assertEquals(buf.length, 0);
 *
 * // Dummy input stream
 * const inputStream = ReadableStream.from([
 *   "hello, ",
 *   "world",
 *   "!",
 * ]);
 *
 * // Pipe the input stream to the buffer
 * await inputStream.pipeThrough(new TextEncoderStream()).pipeTo(buf.writable);
 * assert(buf.capacity > 0);
 * assert(buf.length > 0);
 *
 * // Convert the buffered bytes to a string
 * const result = await toText(buf.readable);
 * assertEquals(result, "hello, world!");
 * assert(buf.empty());
 * ```
 */ export class Buffer {
  #buf;
  #off = 0;
  #readable = new ReadableStream({
    type: "bytes",
    pull: (controller)=>{
      const view = new Uint8Array(controller.byobRequest.view.buffer);
      if (this.empty()) {
        // Buffer is empty, reset to recover space.
        this.reset();
        controller.close();
        controller.byobRequest.respond(0);
        return;
      }
      const nread = copy(this.#buf.subarray(this.#off), view);
      this.#off += nread;
      controller.byobRequest.respond(nread);
    },
    autoAllocateChunkSize: DEFAULT_CHUNK_SIZE
  });
  /**
   * Getter returning the instance's {@linkcode ReadableStream}.
   *
   * @returns A `ReadableStream` of the buffer.
   *
   * @example Read the content out of the buffer to stdout
   * ```ts no-assert
   * import { Buffer } from "@std/streams/buffer";
   *
   * const buf = new Buffer();
   * await buf.readable.pipeTo(Deno.stdout.writable);
   * ```
   */ get readable() {
    return this.#readable;
  }
  #writable = new WritableStream({
    write: (chunk)=>{
      const m = this.#grow(chunk.byteLength);
      copy(chunk, this.#buf, m);
    }
  });
  /**
   * Getter returning the instance's {@linkcode WritableStream}.
   *
   * @returns A `WritableStream` of the buffer.
   *
   * @example Write the data from stdin to the buffer
   * ```ts no-assert
   * import { Buffer } from "@std/streams/buffer";
   *
   * const buf = new Buffer();
   * await Deno.stdin.readable.pipeTo(buf.writable);
   * ```
   */ get writable() {
    return this.#writable;
  }
  /**
   * Constructs a new instance.
   *
   * @param ab An optional buffer to use as the initial buffer.
   *
   * @example No initial buffer provided
   * ```ts no-assert
   * import { Buffer } from "@std/streams/buffer";
   *
   * const buf = new Buffer();
   * ```
   *
   * @example With a pre-allocated buffer
   * ```ts no-assert
   * import { Buffer } from "@std/streams/buffer";
   *
   * const arrayBuffer = new ArrayBuffer(8);
   * const buf = new Buffer(arrayBuffer);
   * ```
   *
   * @example From Uint8Array
   * ```ts no-assert
   * import { Buffer } from "@std/streams/buffer";
   *
   * const array = new Uint8Array([0, 1, 2]);
   * const buf = new Buffer(array.buffer);
   * ```
   */ constructor(ab){
    this.#buf = ab === undefined ? new Uint8Array(0) : new Uint8Array(ab);
  }
  /**
   * Returns a slice holding the unread portion of the buffer.
   *
   * The slice is valid for use only until the next buffer modification (that
   * is, only until the next call to a method that mutates or consumes the
   * buffer, like reading data out via `readable`, `reset()`, or `truncate()`).
   *
   * If `options.copy` is false the slice aliases the buffer content at least
   * until the next buffer modification, so immediate changes to the slice will
   * affect the result of future reads. If `options` is not provided,
   * `options.copy` defaults to `true`.
   *
   * @param options Options for the bytes method.
   * @returns A copy or a slice of the buffer.
   *
   * @example Copy the buffer
   * ```ts
   * import { assertEquals } from "@std/assert/assert-equals";
   * import { assertNotEquals } from "@std/assert/assert-not-equals";
   * import { Buffer } from "@std/streams/buffer";
   *
   * const array = new Uint8Array([0, 1, 2]);
   * const buf = new Buffer(array.buffer);
   * const copied = buf.bytes();
   * assertEquals(copied.length, array.length);
   *
   * // Modify an element in the original array
   * array[1] = 99;
   * assertEquals(copied[0], array[0]);
   * // The copied buffer is not affected by the modification
   * assertNotEquals(copied[1], array[1]);
   * assertEquals(copied[2], array[2]);
   * ```
   *
   * @example Get a slice to the buffer
   * ```ts
   * import { assertEquals } from "@std/assert/assert-equals";
   * import { Buffer } from "@std/streams/buffer";
   *
   * const array = new Uint8Array([0, 1, 2]);
   * const buf = new Buffer(array.buffer);
   * const slice = buf.bytes({ copy: false });
   * assertEquals(slice.length, array.length);
   *
   * // Modify an element in the original array
   * array[1] = 99;
   * assertEquals(slice[0], array[0]);
   * // The slice _is_ affected by the modification
   * assertEquals(slice[1], array[1]);
   * assertEquals(slice[2], array[2]);
   * ```
   */ bytes(options = {
    copy: true
  }) {
    if (options.copy === false) return this.#buf.subarray(this.#off);
    return this.#buf.slice(this.#off);
  }
  /**
   * Returns whether the unread portion of the buffer is empty.
   *
   * @returns Whether the buffer is empty.
   *
   * @example Empty buffer
   * ```ts
   * import { assert } from "@std/assert/assert";
   * import { Buffer } from "@std/streams/buffer";
   *
   * const buf = new Buffer();
   * assert(buf.empty());
   * ```
   *
   * @example Non-empty buffer
   * ```ts
   * import { assert } from "@std/assert/assert";
   * import { Buffer } from "@std/streams/buffer";
   *
   * const array = new Uint8Array([42]);
   * const buf = new Buffer(array.buffer);
   * assert(!buf.empty());
   * ```
   *
   * @example Non-empty, but the content was already read
   * ```ts
   * import { assert } from "@std/assert/assert";
   * import { Buffer } from "@std/streams/buffer";
   *
   * const array = new Uint8Array([42]);
   * const buf = new Buffer(array.buffer);
   * assert(!buf.empty());
   * // Read the content out of the buffer
   * await buf.readable.pipeTo(Deno.stdout.writable);
   * // The buffer is now empty
   * assert(buf.empty());
   * ```
   */ empty() {
    return this.#buf.byteLength <= this.#off;
  }
  /**
   * A read only number of bytes of the unread portion of the buffer.
   *
   * @returns The number of bytes in the unread portion of the buffer.
   *
   * @example Basic usage
   * ```ts
   * import { assertEquals } from "@std/assert/assert-equals";
   * import { Buffer } from "@std/streams/buffer";
   *
   * const array = new Uint8Array([0, 1, 2]);
   * const buf = new Buffer(array.buffer);
   * assertEquals(buf.length, 3);
   * ```
   *
   * @example Length becomes 0 after the content is read
   * ```ts
   * import { assertEquals } from "@std/assert/assert-equals";
   * import { Buffer } from "@std/streams/buffer";
   *
   * const array = new Uint8Array([42]);
   * const buf = new Buffer(array.buffer);
   * assertEquals(buf.length, 1);
   * // Read the content out of the buffer
   * await buf.readable.pipeTo(Deno.stdout.writable);
   * // The length is now 0
   * assertEquals(buf.length, 0);
   * ```
   */ get length() {
    return this.#buf.byteLength - this.#off;
  }
  /**
   * The read only capacity of the buffer's underlying byte slice, that is,
   * the total space allocated for the buffer's data.
   *
   * @returns The number of allocated bytes for the buffer.
   *
   * @example Basic usage
   * ```ts
   * import { assertEquals } from "@std/assert/assert-equals";
   * import { Buffer } from "@std/streams/buffer";
   *
   * const arrayBuffer = new ArrayBuffer(256);
   * const buf = new Buffer(arrayBuffer);
   * assertEquals(buf.capacity, 256);
   * ```
   */ get capacity() {
    return this.#buf.buffer.byteLength;
  }
  /**
   * Discards all but the first `n` unread bytes from the buffer but
   * continues to use the same allocated storage. It throws if `n` is
   * negative or greater than the length of the buffer.
   *
   * @param n The number of bytes to keep.
   *
   * @example Basic usage
   * ```ts
   * import { assertEquals } from "@std/assert/assert-equals";
   * import { Buffer } from "@std/streams/buffer";
   *
   * const array = new Uint8Array([0, 1, 2]);
   * const buf = new Buffer(array.buffer);
   * assertEquals(buf.bytes(), array);
   *
   * // Discard all but the first 2 bytes
   * buf.truncate(2);
   * assertEquals(buf.bytes(), array.slice(0, 2));
   * ```
   */ truncate(n) {
    if (n === 0) {
      this.reset();
      return;
    }
    if (n < 0 || n > this.length) {
      throw Error("bytes.Buffer: truncation out of range");
    }
    this.#reslice(this.#off + n);
  }
  /**
   * Resets to an empty buffer.
   *
   * @example Basic usage
   * ```ts
   * import { assert } from "@std/assert/assert";
   * import { Buffer } from "@std/streams/buffer";
   *
   * const array = new Uint8Array([0, 1, 2]);
   * const buf = new Buffer(array.buffer);
   * assert(!buf.empty());
   *
   * // Reset
   * buf.reset();
   * assert(buf.empty());
   * ```
   */ reset() {
    this.#reslice(0);
    this.#off = 0;
  }
  #tryGrowByReslice(n) {
    const l = this.#buf.byteLength;
    if (n <= this.capacity - l) {
      this.#reslice(l + n);
      return l;
    }
    return -1;
  }
  #reslice(len) {
    if (len > this.#buf.buffer.byteLength) {
      throw new RangeError("Length is greater than buffer capacity");
    }
    this.#buf = new Uint8Array(this.#buf.buffer, 0, len);
  }
  #grow(n) {
    const m = this.length;
    // If buffer is empty, reset to recover space.
    if (m === 0 && this.#off !== 0) {
      this.reset();
    }
    // Fast: Try to grow by means of a reslice.
    const i = this.#tryGrowByReslice(n);
    if (i >= 0) {
      return i;
    }
    const c = this.capacity;
    if (n <= Math.floor(c / 2) - m) {
      // We can slide things down instead of allocating a new
      // ArrayBuffer. We only need m+n <= c to slide, but
      // we instead let capacity get twice as large so we
      // don't spend all our time copying.
      copy(this.#buf.subarray(this.#off), this.#buf);
    } else if (c + n > MAX_SIZE) {
      throw new Error("The buffer cannot be grown beyond the maximum size.");
    } else {
      // Not enough space anywhere, we need to allocate.
      const buf = new Uint8Array(Math.min(2 * c + n, MAX_SIZE));
      copy(this.#buf.subarray(this.#off), buf);
      this.#buf = buf;
    }
    // Restore this.#off and len(this.#buf).
    this.#off = 0;
    this.#reslice(Math.min(m + n, MAX_SIZE));
    return m;
  }
  /**
   * Grows the buffer's capacity, if necessary, to guarantee space for
   * another `n` bytes. After `.grow(n)`, at least `n` bytes can be written to
   * the buffer without another allocation. If `n` is negative, `.grow()` will
   * throw. If the buffer can't grow it will throw an error.
   *
   * @param n The number of bytes to grow the buffer by.
   *
   * Based on Go Lang's
   * {@link https://golang.org/pkg/bytes/#Buffer.Grow | Buffer.Grow}.
   *
   * @example Basic usage
   * ```ts
   * import { assert } from "@std/assert/assert";
   * import { assertEquals } from "@std/assert/assert-equals";
   * import { Buffer } from "@std/streams/buffer";
   *
   * const buf = new Buffer();
   * assertEquals(buf.capacity, 0);
   *
   * buf.grow(200);
   * assert(buf.capacity >= 200);
   * ```
   */ grow(n) {
    if (n < 0) {
      throw Error("Buffer.grow: negative count");
    }
    const m = this.#grow(n);
    this.#reslice(m);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L2J1ZmZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBjb3B5IH0gZnJvbSBcImpzcjovQHN0ZC9ieXRlc0BeMS4wLjAtcmMuMy9jb3B5XCI7XG5cbmNvbnN0IE1BWF9TSVpFID0gMiAqKiAzMiAtIDI7XG5jb25zdCBERUZBVUxUX0NIVU5LX1NJWkUgPSAxNl82NDA7XG5cbi8qKiBPcHRpb25zIGZvciB7QGxpbmtjb2RlIEJ1ZmZlci5ieXRlc30uICovXG5leHBvcnQgaW50ZXJmYWNlIEJ1ZmZlckJ5dGVzT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBJZiB0cnVlLCB7QGxpbmtjb2RlIEJ1ZmZlci5ieXRlc30gd2lsbCByZXR1cm4gYSBjb3B5IG9mIHRoZSBidWZmZXJlZCBkYXRhLlxuICAgKlxuICAgKiBJZiBmYWxzZSwgaXQgd2lsbCByZXR1cm4gYSBzbGljZSB0byB0aGUgYnVmZmVyJ3MgZGF0YS5cbiAgICpcbiAgICogQGRlZmF1bHQge3RydWV9XG4gICAqL1xuICBjb3B5PzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBIHZhcmlhYmxlLXNpemVkIGJ1ZmZlciBvZiBieXRlcyB3aXRoIGByZWFkYWJsZWAgYW5kIGB3cml0YWJsZWAgZ2V0dGVycyB0aGF0XG4gKiBhbGxvd3MgeW91IHRvIHdvcmsgd2l0aCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0cmVhbXNfQVBJIHwgV2ViIFN0cmVhbXMgQVBJfS5cbiAqXG4gKiBCdWZmZXIgaXMgYWxtb3N0IGFsd2F5cyB1c2VkIHdpdGggc29tZSBJL08gbGlrZSBmaWxlcyBhbmQgc29ja2V0cy4gSXQgYWxsb3dzXG4gKiBvbmUgdG8gYnVmZmVyIHVwIGEgZG93bmxvYWQgZnJvbSBhIHNvY2tldC4gQnVmZmVyIGdyb3dzIGFuZCBzaHJpbmtzIGFzXG4gKiBuZWNlc3NhcnkuXG4gKlxuICogQnVmZmVyIGlzIE5PVCB0aGUgc2FtZSB0aGluZyBhcyBOb2RlJ3MgQnVmZmVyLiBOb2RlJ3MgQnVmZmVyIHdhcyBjcmVhdGVkIGluXG4gKiAyMDA5IGJlZm9yZSBKYXZhU2NyaXB0IGhhZCB0aGUgY29uY2VwdCBvZiBBcnJheUJ1ZmZlcnMuIEl0J3Mgc2ltcGx5IGFcbiAqIG5vbi1zdGFuZGFyZCBBcnJheUJ1ZmZlci5cbiAqXG4gKiBBcnJheUJ1ZmZlciBpcyBhIGZpeGVkIG1lbW9yeSBhbGxvY2F0aW9uLiBCdWZmZXIgaXMgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gKiBBcnJheUJ1ZmZlci5cbiAqXG4gKiBCYXNlZCBvbiB7QGxpbmsgaHR0cHM6Ly9nb2xhbmcub3JnL3BrZy9ieXRlcy8jQnVmZmVyIHwgR28gQnVmZmVyfS5cbiAqXG4gKiBAZXhhbXBsZSBCdWZmZXIgaW5wdXQgYnl0ZXMgYW5kIGNvbnZlcnQgaXQgdG8gYSBzdHJpbmdcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2J1ZmZlclwiO1xuICogaW1wb3J0IHsgdG9UZXh0IH0gZnJvbSBcIkBzdGQvc3RyZWFtcy90by10ZXh0XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIC8vIENyZWF0ZSBhIG5ldyBidWZmZXJcbiAqIGNvbnN0IGJ1ZiA9IG5ldyBCdWZmZXIoKTtcbiAqIGFzc2VydEVxdWFscyhidWYuY2FwYWNpdHksIDApO1xuICogYXNzZXJ0RXF1YWxzKGJ1Zi5sZW5ndGgsIDApO1xuICpcbiAqIC8vIER1bW15IGlucHV0IHN0cmVhbVxuICogY29uc3QgaW5wdXRTdHJlYW0gPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcbiAqICAgXCJoZWxsbywgXCIsXG4gKiAgIFwid29ybGRcIixcbiAqICAgXCIhXCIsXG4gKiBdKTtcbiAqXG4gKiAvLyBQaXBlIHRoZSBpbnB1dCBzdHJlYW0gdG8gdGhlIGJ1ZmZlclxuICogYXdhaXQgaW5wdXRTdHJlYW0ucGlwZVRocm91Z2gobmV3IFRleHRFbmNvZGVyU3RyZWFtKCkpLnBpcGVUbyhidWYud3JpdGFibGUpO1xuICogYXNzZXJ0KGJ1Zi5jYXBhY2l0eSA+IDApO1xuICogYXNzZXJ0KGJ1Zi5sZW5ndGggPiAwKTtcbiAqXG4gKiAvLyBDb252ZXJ0IHRoZSBidWZmZXJlZCBieXRlcyB0byBhIHN0cmluZ1xuICogY29uc3QgcmVzdWx0ID0gYXdhaXQgdG9UZXh0KGJ1Zi5yZWFkYWJsZSk7XG4gKiBhc3NlcnRFcXVhbHMocmVzdWx0LCBcImhlbGxvLCB3b3JsZCFcIik7XG4gKiBhc3NlcnQoYnVmLmVtcHR5KCkpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBCdWZmZXIge1xuICAjYnVmOiBVaW50OEFycmF5OyAvLyBjb250ZW50cyBhcmUgdGhlIGJ5dGVzIGJ1ZltvZmYgOiBsZW4oYnVmKV1cbiAgI29mZiA9IDA7IC8vIHJlYWQgYXQgYnVmW29mZl0sIHdyaXRlIGF0IGJ1ZltidWYuYnl0ZUxlbmd0aF1cbiAgI3JlYWRhYmxlOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PiA9IG5ldyBSZWFkYWJsZVN0cmVhbSh7XG4gICAgdHlwZTogXCJieXRlc1wiLFxuICAgIHB1bGw6IChjb250cm9sbGVyKSA9PiB7XG4gICAgICBjb25zdCB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoY29udHJvbGxlci5ieW9iUmVxdWVzdCEudmlldyEuYnVmZmVyKTtcbiAgICAgIGlmICh0aGlzLmVtcHR5KCkpIHtcbiAgICAgICAgLy8gQnVmZmVyIGlzIGVtcHR5LCByZXNldCB0byByZWNvdmVyIHNwYWNlLlxuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgIGNvbnRyb2xsZXIuY2xvc2UoKTtcbiAgICAgICAgY29udHJvbGxlci5ieW9iUmVxdWVzdCEucmVzcG9uZCgwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgbnJlYWQgPSBjb3B5KHRoaXMuI2J1Zi5zdWJhcnJheSh0aGlzLiNvZmYpLCB2aWV3KTtcbiAgICAgIHRoaXMuI29mZiArPSBucmVhZDtcbiAgICAgIGNvbnRyb2xsZXIuYnlvYlJlcXVlc3QhLnJlc3BvbmQobnJlYWQpO1xuICAgIH0sXG4gICAgYXV0b0FsbG9jYXRlQ2h1bmtTaXplOiBERUZBVUxUX0NIVU5LX1NJWkUsXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBHZXR0ZXIgcmV0dXJuaW5nIHRoZSBpbnN0YW5jZSdzIHtAbGlua2NvZGUgUmVhZGFibGVTdHJlYW19LlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGBSZWFkYWJsZVN0cmVhbWAgb2YgdGhlIGJ1ZmZlci5cbiAgICpcbiAgICogQGV4YW1wbGUgUmVhZCB0aGUgY29udGVudCBvdXQgb2YgdGhlIGJ1ZmZlciB0byBzdGRvdXRcbiAgICogYGBgdHMgbm8tYXNzZXJ0XG4gICAqIGltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJAc3RkL3N0cmVhbXMvYnVmZmVyXCI7XG4gICAqXG4gICAqIGNvbnN0IGJ1ZiA9IG5ldyBCdWZmZXIoKTtcbiAgICogYXdhaXQgYnVmLnJlYWRhYmxlLnBpcGVUbyhEZW5vLnN0ZG91dC53cml0YWJsZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0IHJlYWRhYmxlKCk6IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+IHtcbiAgICByZXR1cm4gdGhpcy4jcmVhZGFibGU7XG4gIH1cblxuICAjd3JpdGFibGUgPSBuZXcgV3JpdGFibGVTdHJlYW08VWludDhBcnJheT4oe1xuICAgIHdyaXRlOiAoY2h1bmspID0+IHtcbiAgICAgIGNvbnN0IG0gPSB0aGlzLiNncm93KGNodW5rLmJ5dGVMZW5ndGgpO1xuICAgICAgY29weShjaHVuaywgdGhpcy4jYnVmLCBtKTtcbiAgICB9LFxuICB9KTtcblxuICAvKipcbiAgICogR2V0dGVyIHJldHVybmluZyB0aGUgaW5zdGFuY2UncyB7QGxpbmtjb2RlIFdyaXRhYmxlU3RyZWFtfS5cbiAgICpcbiAgICogQHJldHVybnMgQSBgV3JpdGFibGVTdHJlYW1gIG9mIHRoZSBidWZmZXIuXG4gICAqXG4gICAqIEBleGFtcGxlIFdyaXRlIHRoZSBkYXRhIGZyb20gc3RkaW4gdG8gdGhlIGJ1ZmZlclxuICAgKiBgYGB0cyBuby1hc3NlcnRcbiAgICogaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9idWZmZXJcIjtcbiAgICpcbiAgICogY29uc3QgYnVmID0gbmV3IEJ1ZmZlcigpO1xuICAgKiBhd2FpdCBEZW5vLnN0ZGluLnJlYWRhYmxlLnBpcGVUbyhidWYud3JpdGFibGUpO1xuICAgKiBgYGBcbiAgICovXG4gIGdldCB3cml0YWJsZSgpOiBXcml0YWJsZVN0cmVhbTxVaW50OEFycmF5PiB7XG4gICAgcmV0dXJuIHRoaXMuI3dyaXRhYmxlO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBhYiBBbiBvcHRpb25hbCBidWZmZXIgdG8gdXNlIGFzIHRoZSBpbml0aWFsIGJ1ZmZlci5cbiAgICpcbiAgICogQGV4YW1wbGUgTm8gaW5pdGlhbCBidWZmZXIgcHJvdmlkZWRcbiAgICogYGBgdHMgbm8tYXNzZXJ0XG4gICAqIGltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJAc3RkL3N0cmVhbXMvYnVmZmVyXCI7XG4gICAqXG4gICAqIGNvbnN0IGJ1ZiA9IG5ldyBCdWZmZXIoKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBleGFtcGxlIFdpdGggYSBwcmUtYWxsb2NhdGVkIGJ1ZmZlclxuICAgKiBgYGB0cyBuby1hc3NlcnRcbiAgICogaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9idWZmZXJcIjtcbiAgICpcbiAgICogY29uc3QgYXJyYXlCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoOCk7XG4gICAqIGNvbnN0IGJ1ZiA9IG5ldyBCdWZmZXIoYXJyYXlCdWZmZXIpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQGV4YW1wbGUgRnJvbSBVaW50OEFycmF5XG4gICAqIGBgYHRzIG5vLWFzc2VydFxuICAgKiBpbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2J1ZmZlclwiO1xuICAgKlxuICAgKiBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyXSk7XG4gICAqIGNvbnN0IGJ1ZiA9IG5ldyBCdWZmZXIoYXJyYXkuYnVmZmVyKTtcbiAgICogYGBgXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhYj86IEFycmF5QnVmZmVyTGlrZSB8IEFycmF5TGlrZTxudW1iZXI+KSB7XG4gICAgdGhpcy4jYnVmID0gYWIgPT09IHVuZGVmaW5lZCA/IG5ldyBVaW50OEFycmF5KDApIDogbmV3IFVpbnQ4QXJyYXkoYWIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzbGljZSBob2xkaW5nIHRoZSB1bnJlYWQgcG9ydGlvbiBvZiB0aGUgYnVmZmVyLlxuICAgKlxuICAgKiBUaGUgc2xpY2UgaXMgdmFsaWQgZm9yIHVzZSBvbmx5IHVudGlsIHRoZSBuZXh0IGJ1ZmZlciBtb2RpZmljYXRpb24gKHRoYXRcbiAgICogaXMsIG9ubHkgdW50aWwgdGhlIG5leHQgY2FsbCB0byBhIG1ldGhvZCB0aGF0IG11dGF0ZXMgb3IgY29uc3VtZXMgdGhlXG4gICAqIGJ1ZmZlciwgbGlrZSByZWFkaW5nIGRhdGEgb3V0IHZpYSBgcmVhZGFibGVgLCBgcmVzZXQoKWAsIG9yIGB0cnVuY2F0ZSgpYCkuXG4gICAqXG4gICAqIElmIGBvcHRpb25zLmNvcHlgIGlzIGZhbHNlIHRoZSBzbGljZSBhbGlhc2VzIHRoZSBidWZmZXIgY29udGVudCBhdCBsZWFzdFxuICAgKiB1bnRpbCB0aGUgbmV4dCBidWZmZXIgbW9kaWZpY2F0aW9uLCBzbyBpbW1lZGlhdGUgY2hhbmdlcyB0byB0aGUgc2xpY2Ugd2lsbFxuICAgKiBhZmZlY3QgdGhlIHJlc3VsdCBvZiBmdXR1cmUgcmVhZHMuIElmIGBvcHRpb25zYCBpcyBub3QgcHJvdmlkZWQsXG4gICAqIGBvcHRpb25zLmNvcHlgIGRlZmF1bHRzIHRvIGB0cnVlYC5cbiAgICpcbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgdGhlIGJ5dGVzIG1ldGhvZC5cbiAgICogQHJldHVybnMgQSBjb3B5IG9yIGEgc2xpY2Ugb2YgdGhlIGJ1ZmZlci5cbiAgICpcbiAgICogQGV4YW1wbGUgQ29weSB0aGUgYnVmZmVyXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydE5vdEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtbm90LWVxdWFsc1wiO1xuICAgKiBpbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2J1ZmZlclwiO1xuICAgKlxuICAgKiBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyXSk7XG4gICAqIGNvbnN0IGJ1ZiA9IG5ldyBCdWZmZXIoYXJyYXkuYnVmZmVyKTtcbiAgICogY29uc3QgY29waWVkID0gYnVmLmJ5dGVzKCk7XG4gICAqIGFzc2VydEVxdWFscyhjb3BpZWQubGVuZ3RoLCBhcnJheS5sZW5ndGgpO1xuICAgKlxuICAgKiAvLyBNb2RpZnkgYW4gZWxlbWVudCBpbiB0aGUgb3JpZ2luYWwgYXJyYXlcbiAgICogYXJyYXlbMV0gPSA5OTtcbiAgICogYXNzZXJ0RXF1YWxzKGNvcGllZFswXSwgYXJyYXlbMF0pO1xuICAgKiAvLyBUaGUgY29waWVkIGJ1ZmZlciBpcyBub3QgYWZmZWN0ZWQgYnkgdGhlIG1vZGlmaWNhdGlvblxuICAgKiBhc3NlcnROb3RFcXVhbHMoY29waWVkWzFdLCBhcnJheVsxXSk7XG4gICAqIGFzc2VydEVxdWFscyhjb3BpZWRbMl0sIGFycmF5WzJdKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBleGFtcGxlIEdldCBhIHNsaWNlIHRvIHRoZSBidWZmZXJcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAgICogaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9idWZmZXJcIjtcbiAgICpcbiAgICogY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMl0pO1xuICAgKiBjb25zdCBidWYgPSBuZXcgQnVmZmVyKGFycmF5LmJ1ZmZlcik7XG4gICAqIGNvbnN0IHNsaWNlID0gYnVmLmJ5dGVzKHsgY29weTogZmFsc2UgfSk7XG4gICAqIGFzc2VydEVxdWFscyhzbGljZS5sZW5ndGgsIGFycmF5Lmxlbmd0aCk7XG4gICAqXG4gICAqIC8vIE1vZGlmeSBhbiBlbGVtZW50IGluIHRoZSBvcmlnaW5hbCBhcnJheVxuICAgKiBhcnJheVsxXSA9IDk5O1xuICAgKiBhc3NlcnRFcXVhbHMoc2xpY2VbMF0sIGFycmF5WzBdKTtcbiAgICogLy8gVGhlIHNsaWNlIF9pc18gYWZmZWN0ZWQgYnkgdGhlIG1vZGlmaWNhdGlvblxuICAgKiBhc3NlcnRFcXVhbHMoc2xpY2VbMV0sIGFycmF5WzFdKTtcbiAgICogYXNzZXJ0RXF1YWxzKHNsaWNlWzJdLCBhcnJheVsyXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgYnl0ZXMob3B0aW9uczogQnVmZmVyQnl0ZXNPcHRpb25zID0geyBjb3B5OiB0cnVlIH0pOiBVaW50OEFycmF5IHtcbiAgICBpZiAob3B0aW9ucy5jb3B5ID09PSBmYWxzZSkgcmV0dXJuIHRoaXMuI2J1Zi5zdWJhcnJheSh0aGlzLiNvZmYpO1xuICAgIHJldHVybiB0aGlzLiNidWYuc2xpY2UodGhpcy4jb2ZmKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHVucmVhZCBwb3J0aW9uIG9mIHRoZSBidWZmZXIgaXMgZW1wdHkuXG4gICAqXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGJ1ZmZlciBpcyBlbXB0eS5cbiAgICpcbiAgICogQGV4YW1wbGUgRW1wdHkgYnVmZmVyXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnRcIjtcbiAgICogaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9idWZmZXJcIjtcbiAgICpcbiAgICogY29uc3QgYnVmID0gbmV3IEJ1ZmZlcigpO1xuICAgKiBhc3NlcnQoYnVmLmVtcHR5KCkpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQGV4YW1wbGUgTm9uLWVtcHR5IGJ1ZmZlclxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0XCI7XG4gICAqIGltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJAc3RkL3N0cmVhbXMvYnVmZmVyXCI7XG4gICAqXG4gICAqIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoWzQyXSk7XG4gICAqIGNvbnN0IGJ1ZiA9IG5ldyBCdWZmZXIoYXJyYXkuYnVmZmVyKTtcbiAgICogYXNzZXJ0KCFidWYuZW1wdHkoKSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAZXhhbXBsZSBOb24tZW1wdHksIGJ1dCB0aGUgY29udGVudCB3YXMgYWxyZWFkeSByZWFkXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnRcIjtcbiAgICogaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9idWZmZXJcIjtcbiAgICpcbiAgICogY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheShbNDJdKTtcbiAgICogY29uc3QgYnVmID0gbmV3IEJ1ZmZlcihhcnJheS5idWZmZXIpO1xuICAgKiBhc3NlcnQoIWJ1Zi5lbXB0eSgpKTtcbiAgICogLy8gUmVhZCB0aGUgY29udGVudCBvdXQgb2YgdGhlIGJ1ZmZlclxuICAgKiBhd2FpdCBidWYucmVhZGFibGUucGlwZVRvKERlbm8uc3Rkb3V0LndyaXRhYmxlKTtcbiAgICogLy8gVGhlIGJ1ZmZlciBpcyBub3cgZW1wdHlcbiAgICogYXNzZXJ0KGJ1Zi5lbXB0eSgpKTtcbiAgICogYGBgXG4gICAqL1xuICBlbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy4jYnVmLmJ5dGVMZW5ndGggPD0gdGhpcy4jb2ZmO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcmVhZCBvbmx5IG51bWJlciBvZiBieXRlcyBvZiB0aGUgdW5yZWFkIHBvcnRpb24gb2YgdGhlIGJ1ZmZlci5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG51bWJlciBvZiBieXRlcyBpbiB0aGUgdW5yZWFkIHBvcnRpb24gb2YgdGhlIGJ1ZmZlci5cbiAgICpcbiAgICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAgICogaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9idWZmZXJcIjtcbiAgICpcbiAgICogY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMl0pO1xuICAgKiBjb25zdCBidWYgPSBuZXcgQnVmZmVyKGFycmF5LmJ1ZmZlcik7XG4gICAqIGFzc2VydEVxdWFscyhidWYubGVuZ3RoLCAzKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBleGFtcGxlIExlbmd0aCBiZWNvbWVzIDAgYWZ0ZXIgdGhlIGNvbnRlbnQgaXMgcmVhZFxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICAgKiBpbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2J1ZmZlclwiO1xuICAgKlxuICAgKiBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KFs0Ml0pO1xuICAgKiBjb25zdCBidWYgPSBuZXcgQnVmZmVyKGFycmF5LmJ1ZmZlcik7XG4gICAqIGFzc2VydEVxdWFscyhidWYubGVuZ3RoLCAxKTtcbiAgICogLy8gUmVhZCB0aGUgY29udGVudCBvdXQgb2YgdGhlIGJ1ZmZlclxuICAgKiBhd2FpdCBidWYucmVhZGFibGUucGlwZVRvKERlbm8uc3Rkb3V0LndyaXRhYmxlKTtcbiAgICogLy8gVGhlIGxlbmd0aCBpcyBub3cgMFxuICAgKiBhc3NlcnRFcXVhbHMoYnVmLmxlbmd0aCwgMCk7XG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLiNidWYuYnl0ZUxlbmd0aCAtIHRoaXMuI29mZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcmVhZCBvbmx5IGNhcGFjaXR5IG9mIHRoZSBidWZmZXIncyB1bmRlcmx5aW5nIGJ5dGUgc2xpY2UsIHRoYXQgaXMsXG4gICAqIHRoZSB0b3RhbCBzcGFjZSBhbGxvY2F0ZWQgZm9yIHRoZSBidWZmZXIncyBkYXRhLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbnVtYmVyIG9mIGFsbG9jYXRlZCBieXRlcyBmb3IgdGhlIGJ1ZmZlci5cbiAgICpcbiAgICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAgICogaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9idWZmZXJcIjtcbiAgICpcbiAgICogY29uc3QgYXJyYXlCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoMjU2KTtcbiAgICogY29uc3QgYnVmID0gbmV3IEJ1ZmZlcihhcnJheUJ1ZmZlcik7XG4gICAqIGFzc2VydEVxdWFscyhidWYuY2FwYWNpdHksIDI1Nik7XG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0IGNhcGFjaXR5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuI2J1Zi5idWZmZXIuYnl0ZUxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjYXJkcyBhbGwgYnV0IHRoZSBmaXJzdCBgbmAgdW5yZWFkIGJ5dGVzIGZyb20gdGhlIGJ1ZmZlciBidXRcbiAgICogY29udGludWVzIHRvIHVzZSB0aGUgc2FtZSBhbGxvY2F0ZWQgc3RvcmFnZS4gSXQgdGhyb3dzIGlmIGBuYCBpc1xuICAgKiBuZWdhdGl2ZSBvciBncmVhdGVyIHRoYW4gdGhlIGxlbmd0aCBvZiB0aGUgYnVmZmVyLlxuICAgKlxuICAgKiBAcGFyYW0gbiBUaGUgbnVtYmVyIG9mIGJ5dGVzIHRvIGtlZXAuXG4gICAqXG4gICAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gICAqIGltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJAc3RkL3N0cmVhbXMvYnVmZmVyXCI7XG4gICAqXG4gICAqIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDJdKTtcbiAgICogY29uc3QgYnVmID0gbmV3IEJ1ZmZlcihhcnJheS5idWZmZXIpO1xuICAgKiBhc3NlcnRFcXVhbHMoYnVmLmJ5dGVzKCksIGFycmF5KTtcbiAgICpcbiAgICogLy8gRGlzY2FyZCBhbGwgYnV0IHRoZSBmaXJzdCAyIGJ5dGVzXG4gICAqIGJ1Zi50cnVuY2F0ZSgyKTtcbiAgICogYXNzZXJ0RXF1YWxzKGJ1Zi5ieXRlcygpLCBhcnJheS5zbGljZSgwLCAyKSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdHJ1bmNhdGUobjogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKG4gPT09IDApIHtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKG4gPCAwIHx8IG4gPiB0aGlzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoXCJieXRlcy5CdWZmZXI6IHRydW5jYXRpb24gb3V0IG9mIHJhbmdlXCIpO1xuICAgIH1cbiAgICB0aGlzLiNyZXNsaWNlKHRoaXMuI29mZiArIG4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0byBhbiBlbXB0eSBidWZmZXIuXG4gICAqXG4gICAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnRcIjtcbiAgICogaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9idWZmZXJcIjtcbiAgICpcbiAgICogY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMl0pO1xuICAgKiBjb25zdCBidWYgPSBuZXcgQnVmZmVyKGFycmF5LmJ1ZmZlcik7XG4gICAqIGFzc2VydCghYnVmLmVtcHR5KCkpO1xuICAgKlxuICAgKiAvLyBSZXNldFxuICAgKiBidWYucmVzZXQoKTtcbiAgICogYXNzZXJ0KGJ1Zi5lbXB0eSgpKTtcbiAgICogYGBgXG4gICAqL1xuICByZXNldCgpIHtcbiAgICB0aGlzLiNyZXNsaWNlKDApO1xuICAgIHRoaXMuI29mZiA9IDA7XG4gIH1cblxuICAjdHJ5R3Jvd0J5UmVzbGljZShuOiBudW1iZXIpIHtcbiAgICBjb25zdCBsID0gdGhpcy4jYnVmLmJ5dGVMZW5ndGg7XG4gICAgaWYgKG4gPD0gdGhpcy5jYXBhY2l0eSAtIGwpIHtcbiAgICAgIHRoaXMuI3Jlc2xpY2UobCArIG4pO1xuICAgICAgcmV0dXJuIGw7XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gICNyZXNsaWNlKGxlbjogbnVtYmVyKSB7XG4gICAgaWYgKGxlbiA+IHRoaXMuI2J1Zi5idWZmZXIuYnl0ZUxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJMZW5ndGggaXMgZ3JlYXRlciB0aGFuIGJ1ZmZlciBjYXBhY2l0eVwiKTtcbiAgICB9XG4gICAgdGhpcy4jYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy4jYnVmLmJ1ZmZlciwgMCwgbGVuKTtcbiAgfVxuXG4gICNncm93KG46IG51bWJlcikge1xuICAgIGNvbnN0IG0gPSB0aGlzLmxlbmd0aDtcbiAgICAvLyBJZiBidWZmZXIgaXMgZW1wdHksIHJlc2V0IHRvIHJlY292ZXIgc3BhY2UuXG4gICAgaWYgKG0gPT09IDAgJiYgdGhpcy4jb2ZmICE9PSAwKSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfVxuICAgIC8vIEZhc3Q6IFRyeSB0byBncm93IGJ5IG1lYW5zIG9mIGEgcmVzbGljZS5cbiAgICBjb25zdCBpID0gdGhpcy4jdHJ5R3Jvd0J5UmVzbGljZShuKTtcbiAgICBpZiAoaSA+PSAwKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gICAgY29uc3QgYyA9IHRoaXMuY2FwYWNpdHk7XG4gICAgaWYgKG4gPD0gTWF0aC5mbG9vcihjIC8gMikgLSBtKSB7XG4gICAgICAvLyBXZSBjYW4gc2xpZGUgdGhpbmdzIGRvd24gaW5zdGVhZCBvZiBhbGxvY2F0aW5nIGEgbmV3XG4gICAgICAvLyBBcnJheUJ1ZmZlci4gV2Ugb25seSBuZWVkIG0rbiA8PSBjIHRvIHNsaWRlLCBidXRcbiAgICAgIC8vIHdlIGluc3RlYWQgbGV0IGNhcGFjaXR5IGdldCB0d2ljZSBhcyBsYXJnZSBzbyB3ZVxuICAgICAgLy8gZG9uJ3Qgc3BlbmQgYWxsIG91ciB0aW1lIGNvcHlpbmcuXG4gICAgICBjb3B5KHRoaXMuI2J1Zi5zdWJhcnJheSh0aGlzLiNvZmYpLCB0aGlzLiNidWYpO1xuICAgIH0gZWxzZSBpZiAoYyArIG4gPiBNQVhfU0laRSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGJ1ZmZlciBjYW5ub3QgYmUgZ3Jvd24gYmV5b25kIHRoZSBtYXhpbXVtIHNpemUuXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOb3QgZW5vdWdoIHNwYWNlIGFueXdoZXJlLCB3ZSBuZWVkIHRvIGFsbG9jYXRlLlxuICAgICAgY29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkoTWF0aC5taW4oMiAqIGMgKyBuLCBNQVhfU0laRSkpO1xuICAgICAgY29weSh0aGlzLiNidWYuc3ViYXJyYXkodGhpcy4jb2ZmKSwgYnVmKTtcbiAgICAgIHRoaXMuI2J1ZiA9IGJ1ZjtcbiAgICB9XG4gICAgLy8gUmVzdG9yZSB0aGlzLiNvZmYgYW5kIGxlbih0aGlzLiNidWYpLlxuICAgIHRoaXMuI29mZiA9IDA7XG4gICAgdGhpcy4jcmVzbGljZShNYXRoLm1pbihtICsgbiwgTUFYX1NJWkUpKTtcbiAgICByZXR1cm4gbTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHcm93cyB0aGUgYnVmZmVyJ3MgY2FwYWNpdHksIGlmIG5lY2Vzc2FyeSwgdG8gZ3VhcmFudGVlIHNwYWNlIGZvclxuICAgKiBhbm90aGVyIGBuYCBieXRlcy4gQWZ0ZXIgYC5ncm93KG4pYCwgYXQgbGVhc3QgYG5gIGJ5dGVzIGNhbiBiZSB3cml0dGVuIHRvXG4gICAqIHRoZSBidWZmZXIgd2l0aG91dCBhbm90aGVyIGFsbG9jYXRpb24uIElmIGBuYCBpcyBuZWdhdGl2ZSwgYC5ncm93KClgIHdpbGxcbiAgICogdGhyb3cuIElmIHRoZSBidWZmZXIgY2FuJ3QgZ3JvdyBpdCB3aWxsIHRocm93IGFuIGVycm9yLlxuICAgKlxuICAgKiBAcGFyYW0gbiBUaGUgbnVtYmVyIG9mIGJ5dGVzIHRvIGdyb3cgdGhlIGJ1ZmZlciBieS5cbiAgICpcbiAgICogQmFzZWQgb24gR28gTGFuZydzXG4gICAqIHtAbGluayBodHRwczovL2dvbGFuZy5vcmcvcGtnL2J5dGVzLyNCdWZmZXIuR3JvdyB8IEJ1ZmZlci5Hcm93fS5cbiAgICpcbiAgICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydFwiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICAgKiBpbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2J1ZmZlclwiO1xuICAgKlxuICAgKiBjb25zdCBidWYgPSBuZXcgQnVmZmVyKCk7XG4gICAqIGFzc2VydEVxdWFscyhidWYuY2FwYWNpdHksIDApO1xuICAgKlxuICAgKiBidWYuZ3JvdygyMDApO1xuICAgKiBhc3NlcnQoYnVmLmNhcGFjaXR5ID49IDIwMCk7XG4gICAqIGBgYFxuICAgKi9cbiAgZ3JvdyhuOiBudW1iZXIpIHtcbiAgICBpZiAobiA8IDApIHtcbiAgICAgIHRocm93IEVycm9yKFwiQnVmZmVyLmdyb3c6IG5lZ2F0aXZlIGNvdW50XCIpO1xuICAgIH1cbiAgICBjb25zdCBtID0gdGhpcy4jZ3JvdyhuKTtcbiAgICB0aGlzLiNyZXNsaWNlKG0pO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLElBQUksUUFBUSxtQ0FBbUM7QUFFeEQsTUFBTSxXQUFXLEtBQUssS0FBSztBQUMzQixNQUFNLHFCQUFxQjtBQWMzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQThDQyxHQUNELE9BQU8sTUFBTTtFQUNYLENBQUEsR0FBSSxDQUFhO0VBQ2pCLENBQUEsR0FBSSxHQUFHLEVBQUU7RUFDVCxDQUFBLFFBQVMsR0FBK0IsSUFBSSxlQUFlO0lBQ3pELE1BQU07SUFDTixNQUFNLENBQUM7TUFDTCxNQUFNLE9BQU8sSUFBSSxXQUFXLFdBQVcsV0FBVyxDQUFFLElBQUksQ0FBRSxNQUFNO01BQ2hFLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSTtRQUNoQiwyQ0FBMkM7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
// denoCacheMetadata=16178241782332091987,15219834441268927989