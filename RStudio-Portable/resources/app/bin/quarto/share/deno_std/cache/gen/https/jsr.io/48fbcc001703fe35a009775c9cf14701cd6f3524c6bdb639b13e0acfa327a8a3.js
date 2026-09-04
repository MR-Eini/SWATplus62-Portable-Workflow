// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { copy } from "jsr:@std/bytes@^1.0.2/copy";
const DEFAULT_BUF_SIZE = 4096;
/**
 * AbstractBufBase is a base class which other classes can embed to
 * implement the {@inkcode Reader} and {@linkcode Writer} interfaces.
 * It provides basic implementations of those interfaces based on a buffer
 * array.
 *
 * @example Usage
 * ```ts no-assert
 * import { AbstractBufBase } from "@std/io/buf-writer";
 * import { Reader } from "@std/io/types";
 *
 * class MyBufReader extends AbstractBufBase {
 *   constructor(buf: Uint8Array) {
 *     super(buf);
 *   }
 * }
 * ```
 *
 * @internal
 */ export class AbstractBufBase {
  /**
   * The buffer
   *
   * @example Usage
   * ```ts
   * import { AbstractBufBase } from "@std/io/buf-writer";
   * import { assertEquals } from "@std/assert/equals";
   *
   * class MyBuffer extends AbstractBufBase {}
   *
   * const buf = new Uint8Array(1024);
   * const mb = new MyBuffer(buf);
   *
   * assertEquals(mb.buf, buf);
   * ```
   */ buf;
  /**
   * The used buffer bytes
   *
   * @example Usage
   * ```ts
   * import { AbstractBufBase } from "@std/io/buf-writer";
   * import { assertEquals } from "@std/assert/equals";
   *
   * class MyBuffer extends AbstractBufBase {}
   *
   * const buf = new Uint8Array(1024);
   * const mb = new MyBuffer(buf);
   *
   * assertEquals(mb.usedBufferBytes, 0);
   * ```
   */ usedBufferBytes = 0;
  /**
   * The error
   *
   * @example Usage
   * ```ts
   * import { AbstractBufBase } from "@std/io/buf-writer";
   * import { assertEquals } from "@std/assert/equals";
   *
   * class MyBuffer extends AbstractBufBase {}
   *
   * const buf = new Uint8Array(1024);
   * const mb = new MyBuffer(buf);
   *
   * assertEquals(mb.err, null);
   * ```
   */ err = null;
  /**
   * Construct a {@linkcode AbstractBufBase} instance
   *
   * @param buf The buffer to use.
   */ constructor(buf){
    this.buf = buf;
  }
  /**
   * Size returns the size of the underlying buffer in bytes.
   *
   * @example Usage
   * ```ts
   * import { AbstractBufBase } from "@std/io/buf-writer";
   * import { assertEquals } from "@std/assert/equals";
   *
   * class MyBuffer extends AbstractBufBase {}
   *
   * const buf = new Uint8Array(1024);
   * const mb = new MyBuffer(buf);
   *
   * assertEquals(mb.size(), 1024);
   * ```
   *
   * @return the size of the buffer in bytes.
   */ size() {
    return this.buf.byteLength;
  }
  /**
   * Returns how many bytes are unused in the buffer.
   *
   * @example Usage
   * ```ts
   * import { AbstractBufBase } from "@std/io/buf-writer";
   * import { assertEquals } from "@std/assert/equals";
   *
   * class MyBuffer extends AbstractBufBase {}
   *
   * const buf = new Uint8Array(1024);
   * const mb = new MyBuffer(buf);
   *
   * assertEquals(mb.available(), 1024);
   * ```
   *
   * @return the number of bytes that are unused in the buffer.
   */ available() {
    return this.buf.byteLength - this.usedBufferBytes;
  }
  /**
   * buffered returns the number of bytes that have been written into the
   * current buffer.
   *
   * @example Usage
   * ```ts
   * import { AbstractBufBase } from "@std/io/buf-writer";
   * import { assertEquals } from "@std/assert/equals";
   *
   * class MyBuffer extends AbstractBufBase {}
   *
   * const buf = new Uint8Array(1024);
   * const mb = new MyBuffer(buf);
   *
   * assertEquals(mb.buffered(), 0);
   * ```
   *
   * @return the number of bytes that have been written into the current buffer.
   */ buffered() {
    return this.usedBufferBytes;
  }
}
/**
 * `BufWriter` implements buffering for an {@linkcode Writer} object.
 * If an error occurs writing to a Writer, no more data will be
 * accepted and all subsequent writes, and flush(), will return the error.
 * After all data has been written, the client should call the
 * flush() method to guarantee all data has been forwarded to
 * the underlying deno.Writer.
 *
 * @example Usage
 * ```ts
 * import { BufWriter } from "@std/io/buf-writer";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const writer = {
 *   write(p: Uint8Array): Promise<number> {
 *     return Promise.resolve(p.length);
 *   }
 * };
 *
 * const bufWriter = new BufWriter(writer);
 * const data = new Uint8Array(1024);
 *
 * await bufWriter.write(data);
 * await bufWriter.flush();
 *
 * assertEquals(bufWriter.buffered(), 0);
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export class BufWriter extends AbstractBufBase {
  #writer;
  /**
   * return new BufWriter unless writer is BufWriter
   *
   * @example Usage
   * ```ts
   * import { BufWriter } from "@std/io/buf-writer";
   * import { Writer } from "@std/io/types";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const writer: Writer = {
   *   write(p: Uint8Array): Promise<number> {
   *     return Promise.resolve(p.length);
   *   }
   * };
   *
   * const bufWriter = BufWriter.create(writer);
   * const data = new Uint8Array(1024);
   *
   * await bufWriter.write(data);
   *
   * assertEquals(bufWriter.buffered(), 1024);
   * ```
   *
   * @param writer The writer to wrap.
   * @param size The size of the buffer.
   *
   * @return a new {@linkcode BufWriter} instance.
   */ static create(writer, size = DEFAULT_BUF_SIZE) {
    return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
  }
  /**
   * Construct a new {@linkcode BufWriter}
   *
   * @param writer The writer to wrap.
   * @param size The size of the buffer.
   */ constructor(writer, size = DEFAULT_BUF_SIZE){
    super(new Uint8Array(size <= 0 ? DEFAULT_BUF_SIZE : size));
    this.#writer = writer;
  }
  /**
   * Discards any unflushed buffered data, clears any error, and
   * resets buffer to write its output to w.
   *
   * @example Usage
   * ```ts
   * import { BufWriter } from "@std/io/buf-writer";
   * import { Writer } from "@std/io/types";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const writer: Writer = {
   *   write(p: Uint8Array): Promise<number> {
   *     return Promise.resolve(p.length);
   *   }
   * };
   *
   * const bufWriter = new BufWriter(writer);
   * const data = new Uint8Array(1024);
   *
   * await bufWriter.write(data);
   *
   * assertEquals(bufWriter.buffered(), 1024);
   *
   * bufWriter.reset(writer);
   *
   * assertEquals(bufWriter.buffered(), 0);
   * ```
   *
   * @param w The writer to write to.
   */ reset(w) {
    this.err = null;
    this.usedBufferBytes = 0;
    this.#writer = w;
  }
  /**
   * Flush writes any buffered data to the underlying io.Writer.
   *
   * @example Usage
   * ```ts
   * import { BufWriter } from "@std/io/buf-writer";
   * import { Writer } from "@std/io/types";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const writer: Writer = {
   *   write(p: Uint8Array): Promise<number> {
   *     return Promise.resolve(p.length);
   *   }
   * };
   *
   * const bufWriter = new BufWriter(writer);
   * const data = new Uint8Array(1024);
   *
   * await bufWriter.write(data);
   * await bufWriter.flush();
   *
   * assertEquals(bufWriter.buffered(), 0);
   * ```
   */ async flush() {
    if (this.err !== null) throw this.err;
    if (this.usedBufferBytes === 0) return;
    try {
      const p = this.buf.subarray(0, this.usedBufferBytes);
      let nwritten = 0;
      while(nwritten < p.length){
        nwritten += await this.#writer.write(p.subarray(nwritten));
      }
    } catch (e) {
      if (e instanceof Error) {
        this.err = e;
      }
      throw e;
    }
    this.buf = new Uint8Array(this.buf.length);
    this.usedBufferBytes = 0;
  }
  /**
   * Writes the contents of `data` into the buffer. If the contents won't fully
   * fit into the buffer, those bytes that are copied into the buffer will be flushed
   * to the writer and the remaining bytes are then copied into the now empty buffer.
   *
   * @example Usage
   * ```ts
   * import { BufWriter } from "@std/io/buf-writer";
   * import { Writer } from "@std/io/types";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const writer: Writer = {
   *   write(p: Uint8Array): Promise<number> {
   *     return Promise.resolve(p.length);
   *   }
   * };
   *
   * const bufWriter = new BufWriter(writer);
   * const data = new Uint8Array(1024);
   *
   * await bufWriter.write(data);
   *
   * assertEquals(bufWriter.buffered(), 1024);
   * ```
   *
   * @param data The data to write to the buffer.
   * @return the number of bytes written to the buffer.
   */ async write(data) {
    if (this.err !== null) throw this.err;
    if (data.length === 0) return 0;
    let totalBytesWritten = 0;
    let numBytesWritten = 0;
    while(data.byteLength > this.available()){
      if (this.buffered() === 0) {
        // Large write, empty buffer.
        // Write directly from data to avoid copy.
        try {
          numBytesWritten = await this.#writer.write(data);
        } catch (e) {
          if (e instanceof Error) {
            this.err = e;
          }
          throw e;
        }
      } else {
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        await this.flush();
      }
      totalBytesWritten += numBytesWritten;
      data = data.subarray(numBytesWritten);
    }
    numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
    this.usedBufferBytes += numBytesWritten;
    totalBytesWritten += numBytesWritten;
    return totalBytesWritten;
  }
}
/**
 * BufWriterSync implements buffering for a deno.WriterSync object.
 * If an error occurs writing to a WriterSync, no more data will be
 * accepted and all subsequent writes, and flush(), will return the error.
 * After all data has been written, the client should call the
 * flush() method to guarantee all data has been forwarded to
 * the underlying deno.WriterSync.
 *
 * @example Usage
 * ```ts
 * import { BufWriterSync } from "@std/io/buf-writer";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const writer = {
 *   writeSync(p: Uint8Array): number {
 *     return p.length;
 *   }
 * };
 *
 * const bufWriter = new BufWriterSync(writer);
 * const data = new Uint8Array(1024);
 *
 * bufWriter.writeSync(data);
 * bufWriter.flush();
 *
 * assertEquals(bufWriter.buffered(), 0);
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export class BufWriterSync extends AbstractBufBase {
  #writer;
  /**
   * return new BufWriterSync unless writer is BufWriterSync
   *
   * @example Usage
   * ```ts
   * import { BufWriterSync } from "@std/io/buf-writer";
   * import { WriterSync } from "@std/io/types";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const writer: WriterSync = {
   *   writeSync(p: Uint8Array): number {
   *     return p.length;
   *   }
   * };
   *
   * const bufWriter = BufWriterSync.create(writer);
   * const data = new Uint8Array(1024);
   * bufWriter.writeSync(data);
   * bufWriter.flush();
   *
   * assertEquals(bufWriter.buffered(), 0);
   * ```
   *
   * @param writer The writer to wrap.
   * @param size The size of the buffer.
   * @returns a new {@linkcode BufWriterSync} instance.
   */ static create(writer, size = DEFAULT_BUF_SIZE) {
    return writer instanceof BufWriterSync ? writer : new BufWriterSync(writer, size);
  }
  /**
   * Construct a new {@linkcode BufWriterSync}
   *
   * @param writer The writer to wrap.
   * @param size The size of the buffer.
   */ constructor(writer, size = DEFAULT_BUF_SIZE){
    super(new Uint8Array(size <= 0 ? DEFAULT_BUF_SIZE : size));
    this.#writer = writer;
  }
  /**
   * Discards any unflushed buffered data, clears any error, and
   * resets buffer to write its output to w.
   *
   * @example Usage
   * ```ts
   * import { BufWriterSync } from "@std/io/buf-writer";
   * import { WriterSync } from "@std/io/types";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const writer: WriterSync = {
   *   writeSync(p: Uint8Array): number {
   *     return p.length;
   *   }
   * };
   *
   * const bufWriter = new BufWriterSync(writer);
   * const data = new Uint8Array(1024);
   *
   * bufWriter.writeSync(data);
   * bufWriter.flush();
   *
   * assertEquals(bufWriter.buffered(), 0);
   * ```
   *
   * @param w The writer to write to.
   */ reset(w) {
    this.err = null;
    this.usedBufferBytes = 0;
    this.#writer = w;
  }
  /**
   * Flush writes any buffered data to the underlying io.WriterSync.
   *
   * @example Usage
   * ```ts
   * import { BufWriterSync } from "@std/io/buf-writer";
   * import { WriterSync } from "@std/io/types";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const writer: WriterSync = {
   *   writeSync(p: Uint8Array): number {
   *     return p.length;
   *   }
   * };
   *
   * const bufWriter = new BufWriterSync(writer);
   * const data = new Uint8Array(1024);
   *
   * bufWriter.writeSync(data);
   * bufWriter.flush();
   *
   * assertEquals(bufWriter.buffered(), 0);
   * ```
   */ flush() {
    if (this.err !== null) throw this.err;
    if (this.usedBufferBytes === 0) return;
    try {
      const p = this.buf.subarray(0, this.usedBufferBytes);
      let nwritten = 0;
      while(nwritten < p.length){
        nwritten += this.#writer.writeSync(p.subarray(nwritten));
      }
    } catch (e) {
      if (e instanceof Error) {
        this.err = e;
      }
      throw e;
    }
    this.buf = new Uint8Array(this.buf.length);
    this.usedBufferBytes = 0;
  }
  /** Writes the contents of `data` into the buffer.  If the contents won't fully
   * fit into the buffer, those bytes that can are copied into the buffer, the
   * buffer is the flushed to the writer and the remaining bytes are copied into
   * the now empty buffer.
   *
   * @example Usage
   * ```ts
   * import { BufWriterSync } from "@std/io/buf-writer";
   * import { WriterSync } from "@std/io/types";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const writer: WriterSync = {
   *   writeSync(p: Uint8Array): number {
   *     return p.length;
   *   }
   * };
   *
   * const bufWriter = new BufWriterSync(writer);
   * const data = new Uint8Array(1024);
   *
   * bufWriter.writeSync(data);
   * bufWriter.flush();
   *
   * assertEquals(bufWriter.buffered(), 0);
   * ```
   *
   * @param data The data to write to the buffer.
   * @return the number of bytes written to the buffer.
   */ writeSync(data) {
    if (this.err !== null) throw this.err;
    if (data.length === 0) return 0;
    let totalBytesWritten = 0;
    let numBytesWritten = 0;
    while(data.byteLength > this.available()){
      if (this.buffered() === 0) {
        // Large write, empty buffer.
        // Write directly from data to avoid copy.
        try {
          numBytesWritten = this.#writer.writeSync(data);
        } catch (e) {
          if (e instanceof Error) {
            this.err = e;
          }
          throw e;
        }
      } else {
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        this.flush();
      }
      totalBytesWritten += numBytesWritten;
      data = data.subarray(numBytesWritten);
    }
    numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
    this.usedBufferBytes += numBytesWritten;
    totalBytesWritten += numBytesWritten;
    return totalBytesWritten;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9idWZfd3JpdGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGNvcHkgfSBmcm9tIFwianNyOkBzdGQvYnl0ZXNAXjEuMC4yL2NvcHlcIjtcbmltcG9ydCB0eXBlIHsgV3JpdGVyLCBXcml0ZXJTeW5jIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcblxuY29uc3QgREVGQVVMVF9CVUZfU0laRSA9IDQwOTY7XG5cbi8qKlxuICogQWJzdHJhY3RCdWZCYXNlIGlzIGEgYmFzZSBjbGFzcyB3aGljaCBvdGhlciBjbGFzc2VzIGNhbiBlbWJlZCB0b1xuICogaW1wbGVtZW50IHRoZSB7QGlua2NvZGUgUmVhZGVyfSBhbmQge0BsaW5rY29kZSBXcml0ZXJ9IGludGVyZmFjZXMuXG4gKiBJdCBwcm92aWRlcyBiYXNpYyBpbXBsZW1lbnRhdGlvbnMgb2YgdGhvc2UgaW50ZXJmYWNlcyBiYXNlZCBvbiBhIGJ1ZmZlclxuICogYXJyYXkuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgQWJzdHJhY3RCdWZCYXNlIH0gZnJvbSBcIkBzdGQvaW8vYnVmLXdyaXRlclwiO1xuICogaW1wb3J0IHsgUmVhZGVyIH0gZnJvbSBcIkBzdGQvaW8vdHlwZXNcIjtcbiAqXG4gKiBjbGFzcyBNeUJ1ZlJlYWRlciBleHRlbmRzIEFic3RyYWN0QnVmQmFzZSB7XG4gKiAgIGNvbnN0cnVjdG9yKGJ1ZjogVWludDhBcnJheSkge1xuICogICAgIHN1cGVyKGJ1Zik7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RCdWZCYXNlIHtcbiAgLyoqXG4gICAqIFRoZSBidWZmZXJcbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgQWJzdHJhY3RCdWZCYXNlIH0gZnJvbSBcIkBzdGQvaW8vYnVmLXdyaXRlclwiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gICAqXG4gICAqIGNsYXNzIE15QnVmZmVyIGV4dGVuZHMgQWJzdHJhY3RCdWZCYXNlIHt9XG4gICAqXG4gICAqIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KDEwMjQpO1xuICAgKiBjb25zdCBtYiA9IG5ldyBNeUJ1ZmZlcihidWYpO1xuICAgKlxuICAgKiBhc3NlcnRFcXVhbHMobWIuYnVmLCBidWYpO1xuICAgKiBgYGBcbiAgICovXG4gIGJ1ZjogVWludDhBcnJheTtcbiAgLyoqXG4gICAqIFRoZSB1c2VkIGJ1ZmZlciBieXRlc1xuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBBYnN0cmFjdEJ1ZkJhc2UgfSBmcm9tIFwiQHN0ZC9pby9idWYtd3JpdGVyXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9lcXVhbHNcIjtcbiAgICpcbiAgICogY2xhc3MgTXlCdWZmZXIgZXh0ZW5kcyBBYnN0cmFjdEJ1ZkJhc2Uge31cbiAgICpcbiAgICogY29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkoMTAyNCk7XG4gICAqIGNvbnN0IG1iID0gbmV3IE15QnVmZmVyKGJ1Zik7XG4gICAqXG4gICAqIGFzc2VydEVxdWFscyhtYi51c2VkQnVmZmVyQnl0ZXMsIDApO1xuICAgKiBgYGBcbiAgICovXG4gIHVzZWRCdWZmZXJCeXRlcyA9IDA7XG4gIC8qKlxuICAgKiBUaGUgZXJyb3JcbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgQWJzdHJhY3RCdWZCYXNlIH0gZnJvbSBcIkBzdGQvaW8vYnVmLXdyaXRlclwiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gICAqXG4gICAqIGNsYXNzIE15QnVmZmVyIGV4dGVuZHMgQWJzdHJhY3RCdWZCYXNlIHt9XG4gICAqXG4gICAqIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KDEwMjQpO1xuICAgKiBjb25zdCBtYiA9IG5ldyBNeUJ1ZmZlcihidWYpO1xuICAgKlxuICAgKiBhc3NlcnRFcXVhbHMobWIuZXJyLCBudWxsKTtcbiAgICogYGBgXG4gICAqL1xuICBlcnI6IEVycm9yIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIHtAbGlua2NvZGUgQWJzdHJhY3RCdWZCYXNlfSBpbnN0YW5jZVxuICAgKlxuICAgKiBAcGFyYW0gYnVmIFRoZSBidWZmZXIgdG8gdXNlLlxuICAgKi9cbiAgY29uc3RydWN0b3IoYnVmOiBVaW50OEFycmF5KSB7XG4gICAgdGhpcy5idWYgPSBidWY7XG4gIH1cblxuICAvKipcbiAgICogU2l6ZSByZXR1cm5zIHRoZSBzaXplIG9mIHRoZSB1bmRlcmx5aW5nIGJ1ZmZlciBpbiBieXRlcy5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgQWJzdHJhY3RCdWZCYXNlIH0gZnJvbSBcIkBzdGQvaW8vYnVmLXdyaXRlclwiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gICAqXG4gICAqIGNsYXNzIE15QnVmZmVyIGV4dGVuZHMgQWJzdHJhY3RCdWZCYXNlIHt9XG4gICAqXG4gICAqIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KDEwMjQpO1xuICAgKiBjb25zdCBtYiA9IG5ldyBNeUJ1ZmZlcihidWYpO1xuICAgKlxuICAgKiBhc3NlcnRFcXVhbHMobWIuc2l6ZSgpLCAxMDI0KTtcbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm4gdGhlIHNpemUgb2YgdGhlIGJ1ZmZlciBpbiBieXRlcy5cbiAgICovXG4gIHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5idWYuYnl0ZUxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGhvdyBtYW55IGJ5dGVzIGFyZSB1bnVzZWQgaW4gdGhlIGJ1ZmZlci5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgQWJzdHJhY3RCdWZCYXNlIH0gZnJvbSBcIkBzdGQvaW8vYnVmLXdyaXRlclwiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gICAqXG4gICAqIGNsYXNzIE15QnVmZmVyIGV4dGVuZHMgQWJzdHJhY3RCdWZCYXNlIHt9XG4gICAqXG4gICAqIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KDEwMjQpO1xuICAgKiBjb25zdCBtYiA9IG5ldyBNeUJ1ZmZlcihidWYpO1xuICAgKlxuICAgKiBhc3NlcnRFcXVhbHMobWIuYXZhaWxhYmxlKCksIDEwMjQpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybiB0aGUgbnVtYmVyIG9mIGJ5dGVzIHRoYXQgYXJlIHVudXNlZCBpbiB0aGUgYnVmZmVyLlxuICAgKi9cbiAgYXZhaWxhYmxlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYnVmLmJ5dGVMZW5ndGggLSB0aGlzLnVzZWRCdWZmZXJCeXRlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBidWZmZXJlZCByZXR1cm5zIHRoZSBudW1iZXIgb2YgYnl0ZXMgdGhhdCBoYXZlIGJlZW4gd3JpdHRlbiBpbnRvIHRoZVxuICAgKiBjdXJyZW50IGJ1ZmZlci5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgQWJzdHJhY3RCdWZCYXNlIH0gZnJvbSBcIkBzdGQvaW8vYnVmLXdyaXRlclwiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gICAqXG4gICAqIGNsYXNzIE15QnVmZmVyIGV4dGVuZHMgQWJzdHJhY3RCdWZCYXNlIHt9XG4gICAqXG4gICAqIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KDEwMjQpO1xuICAgKiBjb25zdCBtYiA9IG5ldyBNeUJ1ZmZlcihidWYpO1xuICAgKlxuICAgKiBhc3NlcnRFcXVhbHMobWIuYnVmZmVyZWQoKSwgMCk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJuIHRoZSBudW1iZXIgb2YgYnl0ZXMgdGhhdCBoYXZlIGJlZW4gd3JpdHRlbiBpbnRvIHRoZSBjdXJyZW50IGJ1ZmZlci5cbiAgICovXG4gIGJ1ZmZlcmVkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudXNlZEJ1ZmZlckJ5dGVzO1xuICB9XG59XG5cbi8qKlxuICogYEJ1ZldyaXRlcmAgaW1wbGVtZW50cyBidWZmZXJpbmcgZm9yIGFuIHtAbGlua2NvZGUgV3JpdGVyfSBvYmplY3QuXG4gKiBJZiBhbiBlcnJvciBvY2N1cnMgd3JpdGluZyB0byBhIFdyaXRlciwgbm8gbW9yZSBkYXRhIHdpbGwgYmVcbiAqIGFjY2VwdGVkIGFuZCBhbGwgc3Vic2VxdWVudCB3cml0ZXMsIGFuZCBmbHVzaCgpLCB3aWxsIHJldHVybiB0aGUgZXJyb3IuXG4gKiBBZnRlciBhbGwgZGF0YSBoYXMgYmVlbiB3cml0dGVuLCB0aGUgY2xpZW50IHNob3VsZCBjYWxsIHRoZVxuICogZmx1c2goKSBtZXRob2QgdG8gZ3VhcmFudGVlIGFsbCBkYXRhIGhhcyBiZWVuIGZvcndhcmRlZCB0b1xuICogdGhlIHVuZGVybHlpbmcgZGVuby5Xcml0ZXIuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBCdWZXcml0ZXIgfSBmcm9tIFwiQHN0ZC9pby9idWYtd3JpdGVyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgd3JpdGVyID0ge1xuICogICB3cml0ZShwOiBVaW50OEFycmF5KTogUHJvbWlzZTxudW1iZXI+IHtcbiAqICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHAubGVuZ3RoKTtcbiAqICAgfVxuICogfTtcbiAqXG4gKiBjb25zdCBidWZXcml0ZXIgPSBuZXcgQnVmV3JpdGVyKHdyaXRlcik7XG4gKiBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoMTAyNCk7XG4gKlxuICogYXdhaXQgYnVmV3JpdGVyLndyaXRlKGRhdGEpO1xuICogYXdhaXQgYnVmV3JpdGVyLmZsdXNoKCk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGJ1ZldyaXRlci5idWZmZXJlZCgpLCAwKTtcbiAqIGBgYFxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2UgdGhlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvU3RyZWFtc19BUEkgfCBXZWIgU3RyZWFtcyBBUEl9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBCdWZXcml0ZXIgZXh0ZW5kcyBBYnN0cmFjdEJ1ZkJhc2UgaW1wbGVtZW50cyBXcml0ZXIge1xuICAjd3JpdGVyOiBXcml0ZXI7XG5cbiAgLyoqXG4gICAqIHJldHVybiBuZXcgQnVmV3JpdGVyIHVubGVzcyB3cml0ZXIgaXMgQnVmV3JpdGVyXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IEJ1ZldyaXRlciB9IGZyb20gXCJAc3RkL2lvL2J1Zi13cml0ZXJcIjtcbiAgICogaW1wb3J0IHsgV3JpdGVyIH0gZnJvbSBcIkBzdGQvaW8vdHlwZXNcIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCB3cml0ZXI6IFdyaXRlciA9IHtcbiAgICogICB3cml0ZShwOiBVaW50OEFycmF5KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICogICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocC5sZW5ndGgpO1xuICAgKiAgIH1cbiAgICogfTtcbiAgICpcbiAgICogY29uc3QgYnVmV3JpdGVyID0gQnVmV3JpdGVyLmNyZWF0ZSh3cml0ZXIpO1xuICAgKiBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoMTAyNCk7XG4gICAqXG4gICAqIGF3YWl0IGJ1ZldyaXRlci53cml0ZShkYXRhKTtcbiAgICpcbiAgICogYXNzZXJ0RXF1YWxzKGJ1ZldyaXRlci5idWZmZXJlZCgpLCAxMDI0KTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSB3cml0ZXIgVGhlIHdyaXRlciB0byB3cmFwLlxuICAgKiBAcGFyYW0gc2l6ZSBUaGUgc2l6ZSBvZiB0aGUgYnVmZmVyLlxuICAgKlxuICAgKiBAcmV0dXJuIGEgbmV3IHtAbGlua2NvZGUgQnVmV3JpdGVyfSBpbnN0YW5jZS5cbiAgICovXG4gIHN0YXRpYyBjcmVhdGUod3JpdGVyOiBXcml0ZXIsIHNpemU6IG51bWJlciA9IERFRkFVTFRfQlVGX1NJWkUpOiBCdWZXcml0ZXIge1xuICAgIHJldHVybiB3cml0ZXIgaW5zdGFuY2VvZiBCdWZXcml0ZXIgPyB3cml0ZXIgOiBuZXcgQnVmV3JpdGVyKHdyaXRlciwgc2l6ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHtAbGlua2NvZGUgQnVmV3JpdGVyfVxuICAgKlxuICAgKiBAcGFyYW0gd3JpdGVyIFRoZSB3cml0ZXIgdG8gd3JhcC5cbiAgICogQHBhcmFtIHNpemUgVGhlIHNpemUgb2YgdGhlIGJ1ZmZlci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHdyaXRlcjogV3JpdGVyLCBzaXplOiBudW1iZXIgPSBERUZBVUxUX0JVRl9TSVpFKSB7XG4gICAgc3VwZXIobmV3IFVpbnQ4QXJyYXkoc2l6ZSA8PSAwID8gREVGQVVMVF9CVUZfU0laRSA6IHNpemUpKTtcbiAgICB0aGlzLiN3cml0ZXIgPSB3cml0ZXI7XG4gIH1cblxuICAvKipcbiAgICogRGlzY2FyZHMgYW55IHVuZmx1c2hlZCBidWZmZXJlZCBkYXRhLCBjbGVhcnMgYW55IGVycm9yLCBhbmRcbiAgICogcmVzZXRzIGJ1ZmZlciB0byB3cml0ZSBpdHMgb3V0cHV0IHRvIHcuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IEJ1ZldyaXRlciB9IGZyb20gXCJAc3RkL2lvL2J1Zi13cml0ZXJcIjtcbiAgICogaW1wb3J0IHsgV3JpdGVyIH0gZnJvbSBcIkBzdGQvaW8vdHlwZXNcIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCB3cml0ZXI6IFdyaXRlciA9IHtcbiAgICogICB3cml0ZShwOiBVaW50OEFycmF5KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICogICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocC5sZW5ndGgpO1xuICAgKiAgIH1cbiAgICogfTtcbiAgICpcbiAgICogY29uc3QgYnVmV3JpdGVyID0gbmV3IEJ1ZldyaXRlcih3cml0ZXIpO1xuICAgKiBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoMTAyNCk7XG4gICAqXG4gICAqIGF3YWl0IGJ1ZldyaXRlci53cml0ZShkYXRhKTtcbiAgICpcbiAgICogYXNzZXJ0RXF1YWxzKGJ1ZldyaXRlci5idWZmZXJlZCgpLCAxMDI0KTtcbiAgICpcbiAgICogYnVmV3JpdGVyLnJlc2V0KHdyaXRlcik7XG4gICAqXG4gICAqIGFzc2VydEVxdWFscyhidWZXcml0ZXIuYnVmZmVyZWQoKSwgMCk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gdyBUaGUgd3JpdGVyIHRvIHdyaXRlIHRvLlxuICAgKi9cbiAgcmVzZXQodzogV3JpdGVyKSB7XG4gICAgdGhpcy5lcnIgPSBudWxsO1xuICAgIHRoaXMudXNlZEJ1ZmZlckJ5dGVzID0gMDtcbiAgICB0aGlzLiN3cml0ZXIgPSB3O1xuICB9XG5cbiAgLyoqXG4gICAqIEZsdXNoIHdyaXRlcyBhbnkgYnVmZmVyZWQgZGF0YSB0byB0aGUgdW5kZXJseWluZyBpby5Xcml0ZXIuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IEJ1ZldyaXRlciB9IGZyb20gXCJAc3RkL2lvL2J1Zi13cml0ZXJcIjtcbiAgICogaW1wb3J0IHsgV3JpdGVyIH0gZnJvbSBcIkBzdGQvaW8vdHlwZXNcIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCB3cml0ZXI6IFdyaXRlciA9IHtcbiAgICogICB3cml0ZShwOiBVaW50OEFycmF5KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICogICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocC5sZW5ndGgpO1xuICAgKiAgIH1cbiAgICogfTtcbiAgICpcbiAgICogY29uc3QgYnVmV3JpdGVyID0gbmV3IEJ1ZldyaXRlcih3cml0ZXIpO1xuICAgKiBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoMTAyNCk7XG4gICAqXG4gICAqIGF3YWl0IGJ1ZldyaXRlci53cml0ZShkYXRhKTtcbiAgICogYXdhaXQgYnVmV3JpdGVyLmZsdXNoKCk7XG4gICAqXG4gICAqIGFzc2VydEVxdWFscyhidWZXcml0ZXIuYnVmZmVyZWQoKSwgMCk7XG4gICAqIGBgYFxuICAgKi9cbiAgYXN5bmMgZmx1c2goKSB7XG4gICAgaWYgKHRoaXMuZXJyICE9PSBudWxsKSB0aHJvdyB0aGlzLmVycjtcbiAgICBpZiAodGhpcy51c2VkQnVmZmVyQnl0ZXMgPT09IDApIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBwID0gdGhpcy5idWYuc3ViYXJyYXkoMCwgdGhpcy51c2VkQnVmZmVyQnl0ZXMpO1xuICAgICAgbGV0IG53cml0dGVuID0gMDtcbiAgICAgIHdoaWxlIChud3JpdHRlbiA8IHAubGVuZ3RoKSB7XG4gICAgICAgIG53cml0dGVuICs9IGF3YWl0IHRoaXMuI3dyaXRlci53cml0ZShwLnN1YmFycmF5KG53cml0dGVuKSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aGlzLmVyciA9IGU7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHRoaXMuYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5idWYubGVuZ3RoKTtcbiAgICB0aGlzLnVzZWRCdWZmZXJCeXRlcyA9IDA7XG4gIH1cblxuICAvKipcbiAgICogV3JpdGVzIHRoZSBjb250ZW50cyBvZiBgZGF0YWAgaW50byB0aGUgYnVmZmVyLiBJZiB0aGUgY29udGVudHMgd29uJ3QgZnVsbHlcbiAgICogZml0IGludG8gdGhlIGJ1ZmZlciwgdGhvc2UgYnl0ZXMgdGhhdCBhcmUgY29waWVkIGludG8gdGhlIGJ1ZmZlciB3aWxsIGJlIGZsdXNoZWRcbiAgICogdG8gdGhlIHdyaXRlciBhbmQgdGhlIHJlbWFpbmluZyBieXRlcyBhcmUgdGhlbiBjb3BpZWQgaW50byB0aGUgbm93IGVtcHR5IGJ1ZmZlci5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgQnVmV3JpdGVyIH0gZnJvbSBcIkBzdGQvaW8vYnVmLXdyaXRlclwiO1xuICAgKiBpbXBvcnQgeyBXcml0ZXIgfSBmcm9tIFwiQHN0ZC9pby90eXBlc1wiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gICAqXG4gICAqIGNvbnN0IHdyaXRlcjogV3JpdGVyID0ge1xuICAgKiAgIHdyaXRlKHA6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgKiAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwLmxlbmd0aCk7XG4gICAqICAgfVxuICAgKiB9O1xuICAgKlxuICAgKiBjb25zdCBidWZXcml0ZXIgPSBuZXcgQnVmV3JpdGVyKHdyaXRlcik7XG4gICAqIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheSgxMDI0KTtcbiAgICpcbiAgICogYXdhaXQgYnVmV3JpdGVyLndyaXRlKGRhdGEpO1xuICAgKlxuICAgKiBhc3NlcnRFcXVhbHMoYnVmV3JpdGVyLmJ1ZmZlcmVkKCksIDEwMjQpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gd3JpdGUgdG8gdGhlIGJ1ZmZlci5cbiAgICogQHJldHVybiB0aGUgbnVtYmVyIG9mIGJ5dGVzIHdyaXR0ZW4gdG8gdGhlIGJ1ZmZlci5cbiAgICovXG4gIGFzeW5jIHdyaXRlKGRhdGE6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmICh0aGlzLmVyciAhPT0gbnVsbCkgdGhyb3cgdGhpcy5lcnI7XG4gICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSByZXR1cm4gMDtcblxuICAgIGxldCB0b3RhbEJ5dGVzV3JpdHRlbiA9IDA7XG4gICAgbGV0IG51bUJ5dGVzV3JpdHRlbiA9IDA7XG4gICAgd2hpbGUgKGRhdGEuYnl0ZUxlbmd0aCA+IHRoaXMuYXZhaWxhYmxlKCkpIHtcbiAgICAgIGlmICh0aGlzLmJ1ZmZlcmVkKCkgPT09IDApIHtcbiAgICAgICAgLy8gTGFyZ2Ugd3JpdGUsIGVtcHR5IGJ1ZmZlci5cbiAgICAgICAgLy8gV3JpdGUgZGlyZWN0bHkgZnJvbSBkYXRhIHRvIGF2b2lkIGNvcHkuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbnVtQnl0ZXNXcml0dGVuID0gYXdhaXQgdGhpcy4jd3JpdGVyLndyaXRlKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgdGhpcy5lcnIgPSBlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBudW1CeXRlc1dyaXR0ZW4gPSBjb3B5KGRhdGEsIHRoaXMuYnVmLCB0aGlzLnVzZWRCdWZmZXJCeXRlcyk7XG4gICAgICAgIHRoaXMudXNlZEJ1ZmZlckJ5dGVzICs9IG51bUJ5dGVzV3JpdHRlbjtcbiAgICAgICAgYXdhaXQgdGhpcy5mbHVzaCgpO1xuICAgICAgfVxuICAgICAgdG90YWxCeXRlc1dyaXR0ZW4gKz0gbnVtQnl0ZXNXcml0dGVuO1xuICAgICAgZGF0YSA9IGRhdGEuc3ViYXJyYXkobnVtQnl0ZXNXcml0dGVuKTtcbiAgICB9XG5cbiAgICBudW1CeXRlc1dyaXR0ZW4gPSBjb3B5KGRhdGEsIHRoaXMuYnVmLCB0aGlzLnVzZWRCdWZmZXJCeXRlcyk7XG4gICAgdGhpcy51c2VkQnVmZmVyQnl0ZXMgKz0gbnVtQnl0ZXNXcml0dGVuO1xuICAgIHRvdGFsQnl0ZXNXcml0dGVuICs9IG51bUJ5dGVzV3JpdHRlbjtcbiAgICByZXR1cm4gdG90YWxCeXRlc1dyaXR0ZW47XG4gIH1cbn1cblxuLyoqXG4gKiBCdWZXcml0ZXJTeW5jIGltcGxlbWVudHMgYnVmZmVyaW5nIGZvciBhIGRlbm8uV3JpdGVyU3luYyBvYmplY3QuXG4gKiBJZiBhbiBlcnJvciBvY2N1cnMgd3JpdGluZyB0byBhIFdyaXRlclN5bmMsIG5vIG1vcmUgZGF0YSB3aWxsIGJlXG4gKiBhY2NlcHRlZCBhbmQgYWxsIHN1YnNlcXVlbnQgd3JpdGVzLCBhbmQgZmx1c2goKSwgd2lsbCByZXR1cm4gdGhlIGVycm9yLlxuICogQWZ0ZXIgYWxsIGRhdGEgaGFzIGJlZW4gd3JpdHRlbiwgdGhlIGNsaWVudCBzaG91bGQgY2FsbCB0aGVcbiAqIGZsdXNoKCkgbWV0aG9kIHRvIGd1YXJhbnRlZSBhbGwgZGF0YSBoYXMgYmVlbiBmb3J3YXJkZWQgdG9cbiAqIHRoZSB1bmRlcmx5aW5nIGRlbm8uV3JpdGVyU3luYy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IEJ1ZldyaXRlclN5bmMgfSBmcm9tIFwiQHN0ZC9pby9idWYtd3JpdGVyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgd3JpdGVyID0ge1xuICogICB3cml0ZVN5bmMocDogVWludDhBcnJheSk6IG51bWJlciB7XG4gKiAgICAgcmV0dXJuIHAubGVuZ3RoO1xuICogICB9XG4gKiB9O1xuICpcbiAqIGNvbnN0IGJ1ZldyaXRlciA9IG5ldyBCdWZXcml0ZXJTeW5jKHdyaXRlcik7XG4gKiBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoMTAyNCk7XG4gKlxuICogYnVmV3JpdGVyLndyaXRlU3luYyhkYXRhKTtcbiAqIGJ1ZldyaXRlci5mbHVzaCgpO1xuICpcbiAqIGFzc2VydEVxdWFscyhidWZXcml0ZXIuYnVmZmVyZWQoKSwgMCk7XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0cmVhbXNfQVBJIHwgV2ViIFN0cmVhbXMgQVBJfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgY2xhc3MgQnVmV3JpdGVyU3luYyBleHRlbmRzIEFic3RyYWN0QnVmQmFzZSBpbXBsZW1lbnRzIFdyaXRlclN5bmMge1xuICAjd3JpdGVyOiBXcml0ZXJTeW5jO1xuXG4gIC8qKlxuICAgKiByZXR1cm4gbmV3IEJ1ZldyaXRlclN5bmMgdW5sZXNzIHdyaXRlciBpcyBCdWZXcml0ZXJTeW5jXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IEJ1ZldyaXRlclN5bmMgfSBmcm9tIFwiQHN0ZC9pby9idWYtd3JpdGVyXCI7XG4gICAqIGltcG9ydCB7IFdyaXRlclN5bmMgfSBmcm9tIFwiQHN0ZC9pby90eXBlc1wiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gICAqXG4gICAqIGNvbnN0IHdyaXRlcjogV3JpdGVyU3luYyA9IHtcbiAgICogICB3cml0ZVN5bmMocDogVWludDhBcnJheSk6IG51bWJlciB7XG4gICAqICAgICByZXR1cm4gcC5sZW5ndGg7XG4gICAqICAgfVxuICAgKiB9O1xuICAgKlxuICAgKiBjb25zdCBidWZXcml0ZXIgPSBCdWZXcml0ZXJTeW5jLmNyZWF0ZSh3cml0ZXIpO1xuICAgKiBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoMTAyNCk7XG4gICAqIGJ1ZldyaXRlci53cml0ZVN5bmMoZGF0YSk7XG4gICAqIGJ1ZldyaXRlci5mbHVzaCgpO1xuICAgKlxuICAgKiBhc3NlcnRFcXVhbHMoYnVmV3JpdGVyLmJ1ZmZlcmVkKCksIDApO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHdyaXRlciBUaGUgd3JpdGVyIHRvIHdyYXAuXG4gICAqIEBwYXJhbSBzaXplIFRoZSBzaXplIG9mIHRoZSBidWZmZXIuXG4gICAqIEByZXR1cm5zIGEgbmV3IHtAbGlua2NvZGUgQnVmV3JpdGVyU3luY30gaW5zdGFuY2UuXG4gICAqL1xuICBzdGF0aWMgY3JlYXRlKFxuICAgIHdyaXRlcjogV3JpdGVyU3luYyxcbiAgICBzaXplOiBudW1iZXIgPSBERUZBVUxUX0JVRl9TSVpFLFxuICApOiBCdWZXcml0ZXJTeW5jIHtcbiAgICByZXR1cm4gd3JpdGVyIGluc3RhbmNlb2YgQnVmV3JpdGVyU3luY1xuICAgICAgPyB3cml0ZXJcbiAgICAgIDogbmV3IEJ1ZldyaXRlclN5bmMod3JpdGVyLCBzaXplKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcge0BsaW5rY29kZSBCdWZXcml0ZXJTeW5jfVxuICAgKlxuICAgKiBAcGFyYW0gd3JpdGVyIFRoZSB3cml0ZXIgdG8gd3JhcC5cbiAgICogQHBhcmFtIHNpemUgVGhlIHNpemUgb2YgdGhlIGJ1ZmZlci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHdyaXRlcjogV3JpdGVyU3luYywgc2l6ZTogbnVtYmVyID0gREVGQVVMVF9CVUZfU0laRSkge1xuICAgIHN1cGVyKG5ldyBVaW50OEFycmF5KHNpemUgPD0gMCA/IERFRkFVTFRfQlVGX1NJWkUgOiBzaXplKSk7XG4gICAgdGhpcy4jd3JpdGVyID0gd3JpdGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc2NhcmRzIGFueSB1bmZsdXNoZWQgYnVmZmVyZWQgZGF0YSwgY2xlYXJzIGFueSBlcnJvciwgYW5kXG4gICAqIHJlc2V0cyBidWZmZXIgdG8gd3JpdGUgaXRzIG91dHB1dCB0byB3LlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBCdWZXcml0ZXJTeW5jIH0gZnJvbSBcIkBzdGQvaW8vYnVmLXdyaXRlclwiO1xuICAgKiBpbXBvcnQgeyBXcml0ZXJTeW5jIH0gZnJvbSBcIkBzdGQvaW8vdHlwZXNcIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCB3cml0ZXI6IFdyaXRlclN5bmMgPSB7XG4gICAqICAgd3JpdGVTeW5jKHA6IFVpbnQ4QXJyYXkpOiBudW1iZXIge1xuICAgKiAgICAgcmV0dXJuIHAubGVuZ3RoO1xuICAgKiAgIH1cbiAgICogfTtcbiAgICpcbiAgICogY29uc3QgYnVmV3JpdGVyID0gbmV3IEJ1ZldyaXRlclN5bmMod3JpdGVyKTtcbiAgICogY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KDEwMjQpO1xuICAgKlxuICAgKiBidWZXcml0ZXIud3JpdGVTeW5jKGRhdGEpO1xuICAgKiBidWZXcml0ZXIuZmx1c2goKTtcbiAgICpcbiAgICogYXNzZXJ0RXF1YWxzKGJ1ZldyaXRlci5idWZmZXJlZCgpLCAwKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSB3IFRoZSB3cml0ZXIgdG8gd3JpdGUgdG8uXG4gICAqL1xuICByZXNldCh3OiBXcml0ZXJTeW5jKSB7XG4gICAgdGhpcy5lcnIgPSBudWxsO1xuICAgIHRoaXMudXNlZEJ1ZmZlckJ5dGVzID0gMDtcbiAgICB0aGlzLiN3cml0ZXIgPSB3O1xuICB9XG5cbiAgLyoqXG4gICAqIEZsdXNoIHdyaXRlcyBhbnkgYnVmZmVyZWQgZGF0YSB0byB0aGUgdW5kZXJseWluZyBpby5Xcml0ZXJTeW5jLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBCdWZXcml0ZXJTeW5jIH0gZnJvbSBcIkBzdGQvaW8vYnVmLXdyaXRlclwiO1xuICAgKiBpbXBvcnQgeyBXcml0ZXJTeW5jIH0gZnJvbSBcIkBzdGQvaW8vdHlwZXNcIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCB3cml0ZXI6IFdyaXRlclN5bmMgPSB7XG4gICAqICAgd3JpdGVTeW5jKHA6IFVpbnQ4QXJyYXkpOiBudW1iZXIge1xuICAgKiAgICAgcmV0dXJuIHAubGVuZ3RoO1xuICAgKiAgIH1cbiAgICogfTtcbiAgICpcbiAgICogY29uc3QgYnVmV3JpdGVyID0gbmV3IEJ1ZldyaXRlclN5bmMod3JpdGVyKTtcbiAgICogY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KDEwMjQpO1xuICAgKlxuICAgKiBidWZXcml0ZXIud3JpdGVTeW5jKGRhdGEpO1xuICAgKiBidWZXcml0ZXIuZmx1c2goKTtcbiAgICpcbiAgICogYXNzZXJ0RXF1YWxzKGJ1ZldyaXRlci5idWZmZXJlZCgpLCAwKTtcbiAgICogYGBgXG4gICAqL1xuICBmbHVzaCgpIHtcbiAgICBpZiAodGhpcy5lcnIgIT09IG51bGwpIHRocm93IHRoaXMuZXJyO1xuICAgIGlmICh0aGlzLnVzZWRCdWZmZXJCeXRlcyA9PT0gMCkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHAgPSB0aGlzLmJ1Zi5zdWJhcnJheSgwLCB0aGlzLnVzZWRCdWZmZXJCeXRlcyk7XG4gICAgICBsZXQgbndyaXR0ZW4gPSAwO1xuICAgICAgd2hpbGUgKG53cml0dGVuIDwgcC5sZW5ndGgpIHtcbiAgICAgICAgbndyaXR0ZW4gKz0gdGhpcy4jd3JpdGVyLndyaXRlU3luYyhwLnN1YmFycmF5KG53cml0dGVuKSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aGlzLmVyciA9IGU7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHRoaXMuYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5idWYubGVuZ3RoKTtcbiAgICB0aGlzLnVzZWRCdWZmZXJCeXRlcyA9IDA7XG4gIH1cblxuICAvKiogV3JpdGVzIHRoZSBjb250ZW50cyBvZiBgZGF0YWAgaW50byB0aGUgYnVmZmVyLiAgSWYgdGhlIGNvbnRlbnRzIHdvbid0IGZ1bGx5XG4gICAqIGZpdCBpbnRvIHRoZSBidWZmZXIsIHRob3NlIGJ5dGVzIHRoYXQgY2FuIGFyZSBjb3BpZWQgaW50byB0aGUgYnVmZmVyLCB0aGVcbiAgICogYnVmZmVyIGlzIHRoZSBmbHVzaGVkIHRvIHRoZSB3cml0ZXIgYW5kIHRoZSByZW1haW5pbmcgYnl0ZXMgYXJlIGNvcGllZCBpbnRvXG4gICAqIHRoZSBub3cgZW1wdHkgYnVmZmVyLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBCdWZXcml0ZXJTeW5jIH0gZnJvbSBcIkBzdGQvaW8vYnVmLXdyaXRlclwiO1xuICAgKiBpbXBvcnQgeyBXcml0ZXJTeW5jIH0gZnJvbSBcIkBzdGQvaW8vdHlwZXNcIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCB3cml0ZXI6IFdyaXRlclN5bmMgPSB7XG4gICAqICAgd3JpdGVTeW5jKHA6IFVpbnQ4QXJyYXkpOiBudW1iZXIge1xuICAgKiAgICAgcmV0dXJuIHAubGVuZ3RoO1xuICAgKiAgIH1cbiAgICogfTtcbiAgICpcbiAgICogY29uc3QgYnVmV3JpdGVyID0gbmV3IEJ1ZldyaXRlclN5bmMod3JpdGVyKTtcbiAgICogY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KDEwMjQpO1xuICAgKlxuICAgKiBidWZXcml0ZXIud3JpdGVTeW5jKGRhdGEpO1xuICAgKiBidWZXcml0ZXIuZmx1c2goKTtcbiAgICpcbiAgICogYXNzZXJ0RXF1YWxzKGJ1ZldyaXRlci5idWZmZXJlZCgpLCAwKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIHdyaXRlIHRvIHRoZSBidWZmZXIuXG4gICAqIEByZXR1cm4gdGhlIG51bWJlciBvZiBieXRlcyB3cml0dGVuIHRvIHRoZSBidWZmZXIuXG4gICAqL1xuICB3cml0ZVN5bmMoZGF0YTogVWludDhBcnJheSk6IG51bWJlciB7XG4gICAgaWYgKHRoaXMuZXJyICE9PSBudWxsKSB0aHJvdyB0aGlzLmVycjtcbiAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHJldHVybiAwO1xuXG4gICAgbGV0IHRvdGFsQnl0ZXNXcml0dGVuID0gMDtcbiAgICBsZXQgbnVtQnl0ZXNXcml0dGVuID0gMDtcbiAgICB3aGlsZSAoZGF0YS5ieXRlTGVuZ3RoID4gdGhpcy5hdmFpbGFibGUoKSkge1xuICAgICAgaWYgKHRoaXMuYnVmZmVyZWQoKSA9PT0gMCkge1xuICAgICAgICAvLyBMYXJnZSB3cml0ZSwgZW1wdHkgYnVmZmVyLlxuICAgICAgICAvLyBXcml0ZSBkaXJlY3RseSBmcm9tIGRhdGEgdG8gYXZvaWQgY29weS5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBudW1CeXRlc1dyaXR0ZW4gPSB0aGlzLiN3cml0ZXIud3JpdGVTeW5jKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgdGhpcy5lcnIgPSBlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBudW1CeXRlc1dyaXR0ZW4gPSBjb3B5KGRhdGEsIHRoaXMuYnVmLCB0aGlzLnVzZWRCdWZmZXJCeXRlcyk7XG4gICAgICAgIHRoaXMudXNlZEJ1ZmZlckJ5dGVzICs9IG51bUJ5dGVzV3JpdHRlbjtcbiAgICAgICAgdGhpcy5mbHVzaCgpO1xuICAgICAgfVxuICAgICAgdG90YWxCeXRlc1dyaXR0ZW4gKz0gbnVtQnl0ZXNXcml0dGVuO1xuICAgICAgZGF0YSA9IGRhdGEuc3ViYXJyYXkobnVtQnl0ZXNXcml0dGVuKTtcbiAgICB9XG5cbiAgICBudW1CeXRlc1dyaXR0ZW4gPSBjb3B5KGRhdGEsIHRoaXMuYnVmLCB0aGlzLnVzZWRCdWZmZXJCeXRlcyk7XG4gICAgdGhpcy51c2VkQnVmZmVyQnl0ZXMgKz0gbnVtQnl0ZXNXcml0dGVuO1xuICAgIHRvdGFsQnl0ZXNXcml0dGVuICs9IG51bUJ5dGVzV3JpdHRlbjtcbiAgICByZXR1cm4gdG90YWxCeXRlc1dyaXR0ZW47XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsSUFBSSxRQUFRLDZCQUE2QjtBQUdsRCxNQUFNLG1CQUFtQjtBQUV6Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CQyxHQUNELE9BQU8sTUFBZTtFQUNwQjs7Ozs7Ozs7Ozs7Ozs7O0dBZUMsR0FDRCxJQUFnQjtFQUNoQjs7Ozs7Ozs7Ozs7Ozs7O0dBZUMs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
// denoCacheMetadata=4061222262615162053,1122175174337917392