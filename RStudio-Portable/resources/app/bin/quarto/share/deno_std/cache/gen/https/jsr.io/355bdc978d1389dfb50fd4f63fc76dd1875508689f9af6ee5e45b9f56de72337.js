// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { copy } from "jsr:@std/bytes@^1.0.2/copy";
const DEFAULT_BUF_SIZE = 4096;
const MIN_BUF_SIZE = 16;
const MAX_CONSECUTIVE_EMPTY_READS = 100;
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
/**
 * Thrown when a write operation is attempted on a full buffer.
 *
 * @example Usage
 * ```ts
 * import { BufWriter, BufferFullError, Writer } from "@std/io";
 * import { assert, assertEquals } from "@std/assert";
 *
 * const writer: Writer = {
 *   write(p: Uint8Array): Promise<number> {
 *     throw new BufferFullError(p);
 *   }
 * };
 * const bufWriter = new BufWriter(writer);
 * try {
 *   await bufWriter.write(new Uint8Array([1, 2, 3]));
 * } catch (err) {
 *   assert(err instanceof BufferFullError);
 *   assertEquals(err.partial, new Uint8Array([3]));
 * }
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export class BufferFullError extends Error {
  /**
   * The partially read bytes
   *
   * @example Usage
   * ```ts
   * import { BufferFullError } from "@std/io";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const err = new BufferFullError(new Uint8Array(2));
   * assertEquals(err.partial, new Uint8Array(2));
   * ```
   */ partial;
  /**
   * Construct a new instance.
   *
   * @param partial The bytes partially read
   */ constructor(partial){
    super("Buffer full");
    this.name = this.constructor.name;
    this.partial = partial;
  }
}
/**
 * Thrown when a read from a stream fails to read the
 * requested number of bytes.
 *
 * @example Usage
 * ```ts
 * import { PartialReadError } from "@std/io";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const err = new PartialReadError(new Uint8Array(2));
 * assertEquals(err.name, "PartialReadError");
 *
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export class PartialReadError extends Error {
  /**
   * The partially read bytes
   *
   * @example Usage
   * ```ts
   * import { PartialReadError } from "@std/io";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const err = new PartialReadError(new Uint8Array(2));
   * assertEquals(err.partial, new Uint8Array(2));
   * ```
   */ partial;
  /**
   * Construct a {@linkcode PartialReadError}.
   *
   * @param partial The bytes partially read
   */ constructor(partial){
    super("Encountered UnexpectedEof, data only partially read");
    this.name = this.constructor.name;
    this.partial = partial;
  }
}
/**
 * Implements buffering for a {@linkcode Reader} object.
 *
 * @example Usage
 * ```ts
 * import { BufReader, Buffer } from "@std/io";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const encoder = new TextEncoder();
 * const decoder = new TextDecoder();
 *
 * const reader = new BufReader(new Buffer(encoder.encode("hello world")));
 * const buf = new Uint8Array(11);
 * await reader.read(buf);
 * assertEquals(decoder.decode(buf), "hello world");
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export class BufReader {
  #buf;
  #rd;
  #r = 0;
  #w = 0;
  #eof = false;
  /**
   * Returns a new {@linkcode BufReader} if `r` is not already one.
   *
   * @example Usage
   * ```ts
   * import { BufReader, Buffer } from "@std/io";
   * import { assert } from "@std/assert/assert";
   *
   * const reader = new Buffer(new TextEncoder().encode("hello world"));
   * const bufReader = BufReader.create(reader);
   * assert(bufReader instanceof BufReader);
   * ```
   *
   * @param r The reader to read from.
   * @param size The size of the buffer.
   * @returns A new {@linkcode BufReader} if `r` is not already one.
   */ static create(r, size = DEFAULT_BUF_SIZE) {
    return r instanceof BufReader ? r : new BufReader(r, size);
  }
  /**
   * Constructs a new {@linkcode BufReader} for the given reader and buffer size.
   *
   * @param rd The reader to read from.
   * @param size The size of the buffer.
   */ constructor(rd, size = DEFAULT_BUF_SIZE){
    if (size < MIN_BUF_SIZE) {
      size = MIN_BUF_SIZE;
    }
    this.#reset(new Uint8Array(size), rd);
  }
  /**
   * Returns the size of the underlying buffer in bytes.
   *
   * @example Usage
   * ```ts
   * import { BufReader, Buffer } from "@std/io";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const reader = new Buffer(new TextEncoder().encode("hello world"));
   * const bufReader = new BufReader(reader);
   *
   * assertEquals(bufReader.size(), 4096);
   * ```
   *
   * @returns The size of the underlying buffer in bytes.
   */ size() {
    return this.#buf.byteLength;
  }
  /**
   * Returns the number of bytes that can be read from the current buffer.
   *
   * @example Usage
   * ```ts
   * import { BufReader, Buffer } from "@std/io";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const reader = new Buffer(new TextEncoder().encode("hello world"));
   * const bufReader = new BufReader(reader);
   * await bufReader.read(new Uint8Array(5));
   * assertEquals(bufReader.buffered(), 6);
   * ```
   *
   * @returns Number of bytes that can be read from the buffer
   */ buffered() {
    return this.#w - this.#r;
  }
  // Reads a new chunk into the buffer.
  #fill = async ()=>{
    // Slide existing data to beginning.
    if (this.#r > 0) {
      this.#buf.copyWithin(0, this.#r, this.#w);
      this.#w -= this.#r;
      this.#r = 0;
    }
    if (this.#w >= this.#buf.byteLength) {
      throw new Error("Buffer full while filling");
    }
    // Read new data: try a limited number of times.
    for(let i = MAX_CONSECUTIVE_EMPTY_READS; i > 0; i--){
      const rr = await this.#rd.read(this.#buf.subarray(this.#w));
      if (rr === null) {
        this.#eof = true;
        return;
      }
      this.#w += rr;
      if (rr > 0) {
        return;
      }
    }
    throw new Error(`No progress after ${MAX_CONSECUTIVE_EMPTY_READS} read() calls`);
  };
  /**
   * Discards any buffered data, resets all state, and switches
   * the buffered reader to read from `r`.
   *
   * @example Usage
   * ```ts
   * import { BufReader, Buffer } from "@std/io";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const reader = new Buffer(new TextEncoder().encode("hello world"));
   * const bufReader = new BufReader(reader);
   * await bufReader.read(new Uint8Array(5));
   * bufReader.reset(reader);
   * assertEquals(bufReader.buffered(), 6);
   * ```
   *
   * @param r The reader to read from.
   */ reset(r) {
    this.#reset(this.#buf, r);
  }
  #reset = (buf, rd)=>{
    this.#buf = buf;
    this.#rd = rd;
    this.#eof = false;
  // this.lastByte = -1;
  // this.lastCharSize = -1;
  };
  /**
   * Reads data into `p`.
   *
   * The bytes are taken from at most one `read()` on the underlying `Reader`,
   * hence n may be less than `len(p)`.
   * To read exactly `len(p)` bytes, use `io.ReadFull(b, p)`.
   *
   * @example Usage
   * ```ts
   * import { BufReader, Buffer } from "@std/io";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const reader = new Buffer(new TextEncoder().encode("hello world"));
   * const bufReader = new BufReader(reader);
   * const buf = new Uint8Array(5);
   * await bufReader.read(buf);
   * assertEquals(new TextDecoder().decode(buf), "hello");
   * ```
   *
   * @param p The buffer to read data into.
   * @returns The number of bytes read into `p`.
   */ async read(p) {
    let rr = p.byteLength;
    if (p.byteLength === 0) return rr;
    if (this.#r === this.#w) {
      if (p.byteLength >= this.#buf.byteLength) {
        // Large read, empty buffer.
        // Read directly into p to avoid copy.
        const rr = await this.#rd.read(p);
        // if (rr.nread > 0) {
        //   this.lastByte = p[rr.nread - 1];
        //   this.lastCharSize = -1;
        // }
        return rr;
      }
      // One read.
      // Do not use this.fill, which will loop.
      this.#r = 0;
      this.#w = 0;
      rr = await this.#rd.read(this.#buf);
      if (rr === 0 || rr === null) return rr;
      this.#w += rr;
    }
    // copy as much as we can
    const copied = copy(this.#buf.subarray(this.#r, this.#w), p, 0);
    this.#r += copied;
    // this.lastByte = this.buf[this.r - 1];
    // this.lastCharSize = -1;
    return copied;
  }
  /**
   * Reads exactly `p.length` bytes into `p`.
   *
   * If successful, `p` is returned.
   *
   * If the end of the underlying stream has been reached, and there are no more
   * bytes available in the buffer, `readFull()` returns `null` instead.
   *
   * An error is thrown if some bytes could be read, but not enough to fill `p`
   * entirely before the underlying stream reported an error or EOF. Any error
   * thrown will have a `partial` property that indicates the slice of the
   * buffer that has been successfully filled with data.
   *
   * Ported from https://golang.org/pkg/io/#ReadFull
   *
   * @example Usage
   * ```ts
   * import { BufReader, Buffer } from "@std/io";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const reader = new Buffer(new TextEncoder().encode("hello world"));
   * const bufReader = new BufReader(reader);
   * const buf = new Uint8Array(5);
   * await bufReader.readFull(buf);
   * assertEquals(new TextDecoder().decode(buf), "hello");
   * ```
   *
   * @param p The buffer to read data into.
   * @returns The buffer `p` if the read is successful, `null` if the end of the
   * underlying stream has been reached, and there are no more bytes available in the buffer.
   */ async readFull(p) {
    let bytesRead = 0;
    while(bytesRead < p.length){
      const rr = await this.read(p.subarray(bytesRead));
      if (rr === null) {
        if (bytesRead === 0) {
          return null;
        } else {
          throw new PartialReadError(p.subarray(0, bytesRead));
        }
      }
      bytesRead += rr;
    }
    return p;
  }
  /**
   * Returns the next byte ([0, 255]) or `null`.
   *
   * @example Usage
   * ```ts
   * import { BufReader, Buffer } from "@std/io";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const reader = new Buffer(new TextEncoder().encode("hello world"));
   * const bufReader = new BufReader(reader);
   * const byte = await bufReader.readByte();
   * assertEquals(byte, 104);
   * ```
   *
   * @returns The next byte ([0, 255]) or `null`.
   */ async readByte() {
    while(this.#r === this.#w){
      if (this.#eof) return null;
      await this.#fill(); // buffer is empty.
    }
    const c = this.#buf[this.#r];
    this.#r++;
    // this.lastByte = c;
    return c;
  }
  /**
   * Reads until the first occurrence of delim in the input,
   * returning a string containing the data up to and including the delimiter.
   * If ReadString encounters an error before finding a delimiter,
   * it returns the data read before the error and the error itself
   * (often `null`).
   * ReadString returns err !== null if and only if the returned data does not end
   * in delim.
   *
   * @example Usage
   * ```ts
   * import { BufReader, Buffer } from "@std/io";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const reader = new Buffer(new TextEncoder().encode("hello world"));
   * const bufReader = new BufReader(reader);
   * const str = await bufReader.readString(" ");
   * assertEquals(str, "hello ");
   *
   * const str2 = await bufReader.readString(" ");
   * assertEquals(str2, "world");
   * ```
   *
   * @param delim The delimiter to read until.
   * @returns The string containing the data up to and including the delimiter.
   */ async readString(delim) {
    if (delim.length !== 1) {
      throw new Error("Delimiter should be a single character");
    }
    const buffer = await this.readSlice(delim.charCodeAt(0));
    if (buffer === null) return null;
    return new TextDecoder().decode(buffer);
  }
  /**
   * A low-level line-reading primitive. Most callers should use
   * `readString('\n')` instead.
   *
   * `readLine()` tries to return a single line, not including the end-of-line
   * bytes. If the line was too long for the buffer then `more` is set and the
   * beginning of the line is returned. The rest of the line will be returned
   * from future calls. `more` will be false when returning the last fragment
   * of the line. The returned buffer is only valid until the next call to
   * `readLine()`.
   *
   * The text returned from this method does not include the line end ("\r\n" or
   * "\n").
   *
   * When the end of the underlying stream is reached, the final bytes in the
   * stream are returned. No indication or error is given if the input ends
   * without a final line end. When there are no more trailing bytes to read,
   * `readLine()` returns `null`.
   *
   * @example Usage
   * ```ts
   * import { BufReader, Buffer } from "@std/io";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const reader = new Buffer(new TextEncoder().encode("hello\nworld"));
   * const bufReader = new BufReader(reader);
   * const line1 = await bufReader.readLine();
   * assertEquals(new TextDecoder().decode(line1!.line), "hello");
   * const line2 = await bufReader.readLine();
   * assertEquals(new TextDecoder().decode(line2!.line), "world");
   * ```
   *
   * @returns The line read.
   */ async readLine() {
    let line = null;
    try {
      line = await this.readSlice(LF);
    } catch (err) {
      // Don't throw if `readSlice()` failed with `BufferFullError`, instead we
      // just return whatever is available and set the `more` flag.
      if (!(err instanceof BufferFullError)) {
        throw err;
      }
      let partial = err.partial;
      // Handle the case where "\r\n" straddles the buffer.
      if (!this.#eof && partial && partial.byteLength > 0 && partial[partial.byteLength - 1] === CR) {
        // Put the '\r' back on buf and drop it from line.
        // Let the next call to ReadLine check for "\r\n".
        if (this.#r <= 0) {
          throw new Error("Tried to rewind past start of buffer");
        }
        this.#r--;
        partial = partial.subarray(0, partial.byteLength - 1);
      }
      if (partial) {
        return {
          line: partial,
          more: !this.#eof
        };
      }
    }
    if (line === null) {
      return null;
    }
    if (line.byteLength === 0) {
      return {
        line,
        more: false
      };
    }
    if (line[line.byteLength - 1] === LF) {
      let drop = 1;
      if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
        drop = 2;
      }
      line = line.subarray(0, line.byteLength - drop);
    }
    return {
      line,
      more: false
    };
  }
  /**
   * Reads until the first occurrence of `delim` in the input,
   * returning a slice pointing at the bytes in the buffer. The bytes stop
   * being valid at the next read.
   *
   * If `readSlice()` encounters an error before finding a delimiter, or the
   * buffer fills without finding a delimiter, it throws an error with a
   * `partial` property that contains the entire buffer.
   *
   * If `readSlice()` encounters the end of the underlying stream and there are
   * any bytes left in the buffer, the rest of the buffer is returned. In other
   * words, EOF is always treated as a delimiter. Once the buffer is empty,
   * it returns `null`.
   *
   * Because the data returned from `readSlice()` will be overwritten by the
   * next I/O operation, most clients should use `readString()` instead.
   *
   * @example Usage
   * ```ts
   * import { BufReader, Buffer } from "@std/io";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const reader = new Buffer(new TextEncoder().encode("hello world"));
   * const bufReader = new BufReader(reader);
   * const slice = await bufReader.readSlice(0x20);
   * assertEquals(new TextDecoder().decode(slice!), "hello ");
   * ```
   *
   * @param delim The delimiter to read until.
   * @returns A slice pointing at the bytes in the buffer.
   */ async readSlice(delim) {
    let s = 0; // search start index
    let slice;
    while(true){
      // Search buffer.
      let i = this.#buf.subarray(this.#r + s, this.#w).indexOf(delim);
      if (i >= 0) {
        i += s;
        slice = this.#buf.subarray(this.#r, this.#r + i + 1);
        this.#r += i + 1;
        break;
      }
      // EOF?
      if (this.#eof) {
        if (this.#r === this.#w) {
          return null;
        }
        slice = this.#buf.subarray(this.#r, this.#w);
        this.#r = this.#w;
        break;
      }
      // Buffer full?
      if (this.buffered() >= this.#buf.byteLength) {
        this.#r = this.#w;
        // #4521 The internal buffer should not be reused across reads because it causes corruption of data.
        const oldbuf = this.#buf;
        const newbuf = this.#buf.slice(0);
        this.#buf = newbuf;
        throw new BufferFullError(oldbuf);
      }
      s = this.#w - this.#r; // do not rescan area we scanned before
      // Buffer is not full.
      await this.#fill();
    }
    // Handle last byte, if any.
    // const i = slice.byteLength - 1;
    // if (i >= 0) {
    //   this.lastByte = slice[i];
    //   this.lastCharSize = -1
    // }
    return slice;
  }
  /**
   * Returns the next `n` bytes without advancing the reader. The
   * bytes stop being valid at the next read call.
   *
   * When the end of the underlying stream is reached, but there are unread
   * bytes left in the buffer, those bytes are returned. If there are no bytes
   * left in the buffer, it returns `null`.
   *
   * If an error is encountered before `n` bytes are available, `peek()` throws
   * an error with the `partial` property set to a slice of the buffer that
   * contains the bytes that were available before the error occurred.
   *
   * @example Usage
   * ```ts
   * import { BufReader, Buffer } from "@std/io";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const reader = new Buffer(new TextEncoder().encode("hello world"));
   * const bufReader = new BufReader(reader);
   * const peeked = await bufReader.peek(5);
   * assertEquals(new TextDecoder().decode(peeked!), "hello");
   * ```
   *
   * @param n The number of bytes to peek.
   * @returns The next `n` bytes without advancing the reader.
   */ async peek(n) {
    if (n < 0) {
      throw new Error("Peek count cannot be negative");
    }
    let avail = this.#w - this.#r;
    while(avail < n && avail < this.#buf.byteLength && !this.#eof){
      await this.#fill();
      avail = this.#w - this.#r;
    }
    if (avail === 0 && this.#eof) {
      return null;
    } else if (avail < n && this.#eof) {
      return this.#buf.subarray(this.#r, this.#r + avail);
    } else if (avail < n) {
      throw new BufferFullError(this.#buf.subarray(this.#r, this.#w));
    }
    return this.#buf.subarray(this.#r, this.#r + n);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9idWZfcmVhZGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGNvcHkgfSBmcm9tIFwianNyOkBzdGQvYnl0ZXNAXjEuMC4yL2NvcHlcIjtcbmltcG9ydCB0eXBlIHsgUmVhZGVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcblxuY29uc3QgREVGQVVMVF9CVUZfU0laRSA9IDQwOTY7XG5jb25zdCBNSU5fQlVGX1NJWkUgPSAxNjtcbmNvbnN0IE1BWF9DT05TRUNVVElWRV9FTVBUWV9SRUFEUyA9IDEwMDtcbmNvbnN0IENSID0gXCJcXHJcIi5jaGFyQ29kZUF0KDApO1xuY29uc3QgTEYgPSBcIlxcblwiLmNoYXJDb2RlQXQoMCk7XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSB3cml0ZSBvcGVyYXRpb24gaXMgYXR0ZW1wdGVkIG9uIGEgZnVsbCBidWZmZXIuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBCdWZXcml0ZXIsIEJ1ZmZlckZ1bGxFcnJvciwgV3JpdGVyIH0gZnJvbSBcIkBzdGQvaW9cIjtcbiAqIGltcG9ydCB7IGFzc2VydCwgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3Qgd3JpdGVyOiBXcml0ZXIgPSB7XG4gKiAgIHdyaXRlKHA6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPG51bWJlcj4ge1xuICogICAgIHRocm93IG5ldyBCdWZmZXJGdWxsRXJyb3IocCk7XG4gKiAgIH1cbiAqIH07XG4gKiBjb25zdCBidWZXcml0ZXIgPSBuZXcgQnVmV3JpdGVyKHdyaXRlcik7XG4gKiB0cnkge1xuICogICBhd2FpdCBidWZXcml0ZXIud3JpdGUobmV3IFVpbnQ4QXJyYXkoWzEsIDIsIDNdKSk7XG4gKiB9IGNhdGNoIChlcnIpIHtcbiAqICAgYXNzZXJ0KGVyciBpbnN0YW5jZW9mIEJ1ZmZlckZ1bGxFcnJvcik7XG4gKiAgIGFzc2VydEVxdWFscyhlcnIucGFydGlhbCwgbmV3IFVpbnQ4QXJyYXkoWzNdKSk7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0cmVhbXNfQVBJIHwgV2ViIFN0cmVhbXMgQVBJfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgY2xhc3MgQnVmZmVyRnVsbEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAvKipcbiAgICogVGhlIHBhcnRpYWxseSByZWFkIGJ5dGVzXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IEJ1ZmZlckZ1bGxFcnJvciB9IGZyb20gXCJAc3RkL2lvXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9lcXVhbHNcIjtcbiAgICpcbiAgICogY29uc3QgZXJyID0gbmV3IEJ1ZmZlckZ1bGxFcnJvcihuZXcgVWludDhBcnJheSgyKSk7XG4gICAqIGFzc2VydEVxdWFscyhlcnIucGFydGlhbCwgbmV3IFVpbnQ4QXJyYXkoMikpO1xuICAgKiBgYGBcbiAgICovXG4gIHBhcnRpYWw6IFVpbnQ4QXJyYXk7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHBhcnRpYWwgVGhlIGJ5dGVzIHBhcnRpYWxseSByZWFkXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXJ0aWFsOiBVaW50OEFycmF5KSB7XG4gICAgc3VwZXIoXCJCdWZmZXIgZnVsbFwiKTtcbiAgICB0aGlzLm5hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgdGhpcy5wYXJ0aWFsID0gcGFydGlhbDtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgcmVhZCBmcm9tIGEgc3RyZWFtIGZhaWxzIHRvIHJlYWQgdGhlXG4gKiByZXF1ZXN0ZWQgbnVtYmVyIG9mIGJ5dGVzLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgUGFydGlhbFJlYWRFcnJvciB9IGZyb20gXCJAc3RkL2lvXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gKlxuICogY29uc3QgZXJyID0gbmV3IFBhcnRpYWxSZWFkRXJyb3IobmV3IFVpbnQ4QXJyYXkoMikpO1xuICogYXNzZXJ0RXF1YWxzKGVyci5uYW1lLCBcIlBhcnRpYWxSZWFkRXJyb3JcIik7XG4gKlxuICogYGBgXG4gKlxuICogQGRlcHJlY2F0ZWQgVGhpcyB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAuIFVzZSB0aGUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9TdHJlYW1zX0FQSSB8IFdlYiBTdHJlYW1zIEFQSX0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFBhcnRpYWxSZWFkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIC8qKlxuICAgKiBUaGUgcGFydGlhbGx5IHJlYWQgYnl0ZXNcbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgUGFydGlhbFJlYWRFcnJvciB9IGZyb20gXCJAc3RkL2lvXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9lcXVhbHNcIjtcbiAgICpcbiAgICogY29uc3QgZXJyID0gbmV3IFBhcnRpYWxSZWFkRXJyb3IobmV3IFVpbnQ4QXJyYXkoMikpO1xuICAgKiBhc3NlcnRFcXVhbHMoZXJyLnBhcnRpYWwsIG5ldyBVaW50OEFycmF5KDIpKTtcbiAgICogYGBgXG4gICAqL1xuICBwYXJ0aWFsOiBVaW50OEFycmF5O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSB7QGxpbmtjb2RlIFBhcnRpYWxSZWFkRXJyb3J9LlxuICAgKlxuICAgKiBAcGFyYW0gcGFydGlhbCBUaGUgYnl0ZXMgcGFydGlhbGx5IHJlYWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhcnRpYWw6IFVpbnQ4QXJyYXkpIHtcbiAgICBzdXBlcihcIkVuY291bnRlcmVkIFVuZXhwZWN0ZWRFb2YsIGRhdGEgb25seSBwYXJ0aWFsbHkgcmVhZFwiKTtcbiAgICB0aGlzLm5hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgdGhpcy5wYXJ0aWFsID0gcGFydGlhbDtcbiAgfVxufVxuXG4vKipcbiAqIFJlc3VsdCB0eXBlIHJldHVybmVkIGJ5IG9mIHtAbGlua2NvZGUgQnVmUmVhZGVyLnJlYWRMaW5lfS5cbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0cmVhbXNfQVBJIHwgV2ViIFN0cmVhbXMgQVBJfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlYWRMaW5lUmVzdWx0IHtcbiAgLyoqIFRoZSBsaW5lIHJlYWQgKi9cbiAgbGluZTogVWludDhBcnJheTtcbiAgLyoqIGB0cnVlICBpZiB0aGUgZW5kIG9mIHRoZSBsaW5lIGhhcyBub3QgYmVlbiByZWFjaGVkLCBgZmFsc2VgIG90aGVyd2lzZS4gKi9cbiAgbW9yZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRzIGJ1ZmZlcmluZyBmb3IgYSB7QGxpbmtjb2RlIFJlYWRlcn0gb2JqZWN0LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgQnVmUmVhZGVyLCBCdWZmZXIgfSBmcm9tIFwiQHN0ZC9pb1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICpcbiAqIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAqIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAqXG4gKiBjb25zdCByZWFkZXIgPSBuZXcgQnVmUmVhZGVyKG5ldyBCdWZmZXIoZW5jb2Rlci5lbmNvZGUoXCJoZWxsbyB3b3JsZFwiKSkpO1xuICogY29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkoMTEpO1xuICogYXdhaXQgcmVhZGVyLnJlYWQoYnVmKTtcbiAqIGFzc2VydEVxdWFscyhkZWNvZGVyLmRlY29kZShidWYpLCBcImhlbGxvIHdvcmxkXCIpO1xuICogYGBgXG4gKlxuICogQGRlcHJlY2F0ZWQgVGhpcyB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAuIFVzZSB0aGUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9TdHJlYW1zX0FQSSB8IFdlYiBTdHJlYW1zIEFQSX0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEJ1ZlJlYWRlciBpbXBsZW1lbnRzIFJlYWRlciB7XG4gICNidWYhOiBVaW50OEFycmF5O1xuICAjcmQhOiBSZWFkZXI7IC8vIFJlYWRlciBwcm92aWRlZCBieSBjYWxsZXIuXG4gICNyID0gMDsgLy8gYnVmIHJlYWQgcG9zaXRpb24uXG4gICN3ID0gMDsgLy8gYnVmIHdyaXRlIHBvc2l0aW9uLlxuICAjZW9mID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcge0BsaW5rY29kZSBCdWZSZWFkZXJ9IGlmIGByYCBpcyBub3QgYWxyZWFkeSBvbmUuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IEJ1ZlJlYWRlciwgQnVmZmVyIH0gZnJvbSBcIkBzdGQvaW9cIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydFwiO1xuICAgKlxuICAgKiBjb25zdCByZWFkZXIgPSBuZXcgQnVmZmVyKG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImhlbGxvIHdvcmxkXCIpKTtcbiAgICogY29uc3QgYnVmUmVhZGVyID0gQnVmUmVhZGVyLmNyZWF0ZShyZWFkZXIpO1xuICAgKiBhc3NlcnQoYnVmUmVhZGVyIGluc3RhbmNlb2YgQnVmUmVhZGVyKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSByIFRoZSByZWFkZXIgdG8gcmVhZCBmcm9tLlxuICAgKiBAcGFyYW0gc2l6ZSBUaGUgc2l6ZSBvZiB0aGUgYnVmZmVyLlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmtjb2RlIEJ1ZlJlYWRlcn0gaWYgYHJgIGlzIG5vdCBhbHJlYWR5IG9uZS5cbiAgICovXG4gIHN0YXRpYyBjcmVhdGUocjogUmVhZGVyLCBzaXplOiBudW1iZXIgPSBERUZBVUxUX0JVRl9TSVpFKTogQnVmUmVhZGVyIHtcbiAgICByZXR1cm4gciBpbnN0YW5jZW9mIEJ1ZlJlYWRlciA/IHIgOiBuZXcgQnVmUmVhZGVyKHIsIHNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcge0BsaW5rY29kZSBCdWZSZWFkZXJ9IGZvciB0aGUgZ2l2ZW4gcmVhZGVyIGFuZCBidWZmZXIgc2l6ZS5cbiAgICpcbiAgICogQHBhcmFtIHJkIFRoZSByZWFkZXIgdG8gcmVhZCBmcm9tLlxuICAgKiBAcGFyYW0gc2l6ZSBUaGUgc2l6ZSBvZiB0aGUgYnVmZmVyLlxuICAgKi9cbiAgY29uc3RydWN0b3IocmQ6IFJlYWRlciwgc2l6ZTogbnVtYmVyID0gREVGQVVMVF9CVUZfU0laRSkge1xuICAgIGlmIChzaXplIDwgTUlOX0JVRl9TSVpFKSB7XG4gICAgICBzaXplID0gTUlOX0JVRl9TSVpFO1xuICAgIH1cbiAgICB0aGlzLiNyZXNldChuZXcgVWludDhBcnJheShzaXplKSwgcmQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNpemUgb2YgdGhlIHVuZGVybHlpbmcgYnVmZmVyIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBCdWZSZWFkZXIsIEJ1ZmZlciB9IGZyb20gXCJAc3RkL2lvXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9lcXVhbHNcIjtcbiAgICpcbiAgICogY29uc3QgcmVhZGVyID0gbmV3IEJ1ZmZlcihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJoZWxsbyB3b3JsZFwiKSk7XG4gICAqIGNvbnN0IGJ1ZlJlYWRlciA9IG5ldyBCdWZSZWFkZXIocmVhZGVyKTtcbiAgICpcbiAgICogYXNzZXJ0RXF1YWxzKGJ1ZlJlYWRlci5zaXplKCksIDQwOTYpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgVGhlIHNpemUgb2YgdGhlIHVuZGVybHlpbmcgYnVmZmVyIGluIGJ5dGVzLlxuICAgKi9cbiAgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLiNidWYuYnl0ZUxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgYnl0ZXMgdGhhdCBjYW4gYmUgcmVhZCBmcm9tIHRoZSBjdXJyZW50IGJ1ZmZlci5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgQnVmUmVhZGVyLCBCdWZmZXIgfSBmcm9tIFwiQHN0ZC9pb1wiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gICAqXG4gICAqIGNvbnN0IHJlYWRlciA9IG5ldyBCdWZmZXIobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFwiaGVsbG8gd29ybGRcIikpO1xuICAgKiBjb25zdCBidWZSZWFkZXIgPSBuZXcgQnVmUmVhZGVyKHJlYWRlcik7XG4gICAqIGF3YWl0IGJ1ZlJlYWRlci5yZWFkKG5ldyBVaW50OEFycmF5KDUpKTtcbiAgICogYXNzZXJ0RXF1YWxzKGJ1ZlJlYWRlci5idWZmZXJlZCgpLCA2KTtcbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIE51bWJlciBvZiBieXRlcyB0aGF0IGNhbiBiZSByZWFkIGZyb20gdGhlIGJ1ZmZlclxuICAgKi9cbiAgYnVmZmVyZWQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy4jdyAtIHRoaXMuI3I7XG4gIH1cblxuICAvLyBSZWFkcyBhIG5ldyBjaHVuayBpbnRvIHRoZSBidWZmZXIuXG4gICNmaWxsID0gYXN5bmMgKCkgPT4ge1xuICAgIC8vIFNsaWRlIGV4aXN0aW5nIGRhdGEgdG8gYmVnaW5uaW5nLlxuICAgIGlmICh0aGlzLiNyID4gMCkge1xuICAgICAgdGhpcy4jYnVmLmNvcHlXaXRoaW4oMCwgdGhpcy4jciwgdGhpcy4jdyk7XG4gICAgICB0aGlzLiN3IC09IHRoaXMuI3I7XG4gICAgICB0aGlzLiNyID0gMDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy4jdyA+PSB0aGlzLiNidWYuYnl0ZUxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQnVmZmVyIGZ1bGwgd2hpbGUgZmlsbGluZ1wiKTtcbiAgICB9XG5cbiAgICAvLyBSZWFkIG5ldyBkYXRhOiB0cnkgYSBsaW1pdGVkIG51bWJlciBvZiB0aW1lcy5cbiAgICBmb3IgKGxldCBpID0gTUFYX0NPTlNFQ1VUSVZFX0VNUFRZX1JFQURTOyBpID4gMDsgaS0tKSB7XG4gICAgICBjb25zdCByciA9IGF3YWl0IHRoaXMuI3JkLnJlYWQodGhpcy4jYnVmLnN1YmFycmF5KHRoaXMuI3cpKTtcbiAgICAgIGlmIChyciA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLiNlb2YgPSB0cnVlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLiN3ICs9IHJyO1xuICAgICAgaWYgKHJyID4gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYE5vIHByb2dyZXNzIGFmdGVyICR7TUFYX0NPTlNFQ1VUSVZFX0VNUFRZX1JFQURTfSByZWFkKCkgY2FsbHNgLFxuICAgICk7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2NhcmRzIGFueSBidWZmZXJlZCBkYXRhLCByZXNldHMgYWxsIHN0YXRlLCBhbmQgc3dpdGNoZXNcbiAgICogdGhlIGJ1ZmZlcmVkIHJlYWRlciB0byByZWFkIGZyb20gYHJgLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBCdWZSZWFkZXIsIEJ1ZmZlciB9IGZyb20gXCJAc3RkL2lvXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9lcXVhbHNcIjtcbiAgICpcbiAgICogY29uc3QgcmVhZGVyID0gbmV3IEJ1ZmZlcihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJoZWxsbyB3b3JsZFwiKSk7XG4gICAqIGNvbnN0IGJ1ZlJlYWRlciA9IG5ldyBCdWZSZWFkZXIocmVhZGVyKTtcbiAgICogYXdhaXQgYnVmUmVhZGVyLnJlYWQobmV3IFVpbnQ4QXJyYXkoNSkpO1xuICAgKiBidWZSZWFkZXIucmVzZXQocmVhZGVyKTtcbiAgICogYXNzZXJ0RXF1YWxzKGJ1ZlJlYWRlci5idWZmZXJlZCgpLCA2KTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSByIFRoZSByZWFkZXIgdG8gcmVhZCBmcm9tLlxuICAgKi9cbiAgcmVzZXQocjogUmVhZGVyKSB7XG4gICAgdGhpcy4jcmVzZXQodGhpcy4jYnVmLCByKTtcbiAgfVxuXG4gICNyZXNldCA9IChidWY6IFVpbnQ4QXJyYXksIHJkOiBSZWFkZXIpID0+IHtcbiAgICB0aGlzLiNidWYgPSBidWY7XG4gICAgdGhpcy4jcmQgPSByZDtcbiAgICB0aGlzLiNlb2YgPSBmYWxzZTtcbiAgICAvLyB0aGlzLmxhc3RCeXRlID0gLTE7XG4gICAgLy8gdGhpcy5sYXN0Q2hhclNpemUgPSAtMTtcbiAgfTtcblxuICAvKipcbiAgICogUmVhZHMgZGF0YSBpbnRvIGBwYC5cbiAgICpcbiAgICogVGhlIGJ5dGVzIGFyZSB0YWtlbiBmcm9tIGF0IG1vc3Qgb25lIGByZWFkKClgIG9uIHRoZSB1bmRlcmx5aW5nIGBSZWFkZXJgLFxuICAgKiBoZW5jZSBuIG1heSBiZSBsZXNzIHRoYW4gYGxlbihwKWAuXG4gICAqIFRvIHJlYWQgZXhhY3RseSBgbGVuKHApYCBieXRlcywgdXNlIGBpby5SZWFkRnVsbChiLCBwKWAuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IEJ1ZlJlYWRlciwgQnVmZmVyIH0gZnJvbSBcIkBzdGQvaW9cIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCByZWFkZXIgPSBuZXcgQnVmZmVyKG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImhlbGxvIHdvcmxkXCIpKTtcbiAgICogY29uc3QgYnVmUmVhZGVyID0gbmV3IEJ1ZlJlYWRlcihyZWFkZXIpO1xuICAgKiBjb25zdCBidWYgPSBuZXcgVWludDhBcnJheSg1KTtcbiAgICogYXdhaXQgYnVmUmVhZGVyLnJlYWQoYnVmKTtcbiAgICogYXNzZXJ0RXF1YWxzKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShidWYpLCBcImhlbGxvXCIpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHAgVGhlIGJ1ZmZlciB0byByZWFkIGRhdGEgaW50by5cbiAgICogQHJldHVybnMgVGhlIG51bWJlciBvZiBieXRlcyByZWFkIGludG8gYHBgLlxuICAgKi9cbiAgYXN5bmMgcmVhZChwOiBVaW50OEFycmF5KTogUHJvbWlzZTxudW1iZXIgfCBudWxsPiB7XG4gICAgbGV0IHJyOiBudW1iZXIgfCBudWxsID0gcC5ieXRlTGVuZ3RoO1xuICAgIGlmIChwLmJ5dGVMZW5ndGggPT09IDApIHJldHVybiBycjtcblxuICAgIGlmICh0aGlzLiNyID09PSB0aGlzLiN3KSB7XG4gICAgICBpZiAocC5ieXRlTGVuZ3RoID49IHRoaXMuI2J1Zi5ieXRlTGVuZ3RoKSB7XG4gICAgICAgIC8vIExhcmdlIHJlYWQsIGVtcHR5IGJ1ZmZlci5cbiAgICAgICAgLy8gUmVhZCBkaXJlY3RseSBpbnRvIHAgdG8gYXZvaWQgY29weS5cbiAgICAgICAgY29uc3QgcnIgPSBhd2FpdCB0aGlzLiNyZC5yZWFkKHApO1xuICAgICAgICAvLyBpZiAocnIubnJlYWQgPiAwKSB7XG4gICAgICAgIC8vICAgdGhpcy5sYXN0Qnl0ZSA9IHBbcnIubnJlYWQgLSAxXTtcbiAgICAgICAgLy8gICB0aGlzLmxhc3RDaGFyU2l6ZSA9IC0xO1xuICAgICAgICAvLyB9XG4gICAgICAgIHJldHVybiBycjtcbiAgICAgIH1cblxuICAgICAgLy8gT25lIHJlYWQuXG4gICAgICAvLyBEbyBub3QgdXNlIHRoaXMuZmlsbCwgd2hpY2ggd2lsbCBsb29wLlxuICAgICAgdGhpcy4jciA9IDA7XG4gICAgICB0aGlzLiN3ID0gMDtcbiAgICAgIHJyID0gYXdhaXQgdGhpcy4jcmQucmVhZCh0aGlzLiNidWYpO1xuICAgICAgaWYgKHJyID09PSAwIHx8IHJyID09PSBudWxsKSByZXR1cm4gcnI7XG4gICAgICB0aGlzLiN3ICs9IHJyO1xuICAgIH1cblxuICAgIC8vIGNvcHkgYXMgbXVjaCBhcyB3ZSBjYW5cbiAgICBjb25zdCBjb3BpZWQgPSBjb3B5KHRoaXMuI2J1Zi5zdWJhcnJheSh0aGlzLiNyLCB0aGlzLiN3KSwgcCwgMCk7XG4gICAgdGhpcy4jciArPSBjb3BpZWQ7XG4gICAgLy8gdGhpcy5sYXN0Qnl0ZSA9IHRoaXMuYnVmW3RoaXMuciAtIDFdO1xuICAgIC8vIHRoaXMubGFzdENoYXJTaXplID0gLTE7XG4gICAgcmV0dXJuIGNvcGllZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyBleGFjdGx5IGBwLmxlbmd0aGAgYnl0ZXMgaW50byBgcGAuXG4gICAqXG4gICAqIElmIHN1Y2Nlc3NmdWwsIGBwYCBpcyByZXR1cm5lZC5cbiAgICpcbiAgICogSWYgdGhlIGVuZCBvZiB0aGUgdW5kZXJseWluZyBzdHJlYW0gaGFzIGJlZW4gcmVhY2hlZCwgYW5kIHRoZXJlIGFyZSBubyBtb3JlXG4gICAqIGJ5dGVzIGF2YWlsYWJsZSBpbiB0aGUgYnVmZmVyLCBgcmVhZEZ1bGwoKWAgcmV0dXJucyBgbnVsbGAgaW5zdGVhZC5cbiAgICpcbiAgICogQW4gZXJyb3IgaXMgdGhyb3duIGlmIHNvbWUgYnl0ZXMgY291bGQgYmUgcmVhZCwgYnV0IG5vdCBlbm91Z2ggdG8gZmlsbCBgcGBcbiAgICogZW50aXJlbHkgYmVmb3JlIHRoZSB1bmRlcmx5aW5nIHN0cmVhbSByZXBvcnRlZCBhbiBlcnJvciBvciBFT0YuIEFueSBlcnJvclxuICAgKiB0aHJvd24gd2lsbCBoYXZlIGEgYHBhcnRpYWxgIHByb3BlcnR5IHRoYXQgaW5kaWNhdGVzIHRoZSBzbGljZSBvZiB0aGVcbiAgICogYnVmZmVyIHRoYXQgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGZpbGxlZCB3aXRoIGRhdGEuXG4gICAqXG4gICAqIFBvcnRlZCBmcm9tIGh0dHBzOi8vZ29sYW5nLm9yZy9wa2cvaW8vI1JlYWRGdWxsXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IEJ1ZlJlYWRlciwgQnVmZmVyIH0gZnJvbSBcIkBzdGQvaW9cIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCByZWFkZXIgPSBuZXcgQnVmZmVyKG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImhlbGxvIHdvcmxkXCIpKTtcbiAgICogY29uc3QgYnVmUmVhZGVyID0gbmV3IEJ1ZlJlYWRlcihyZWFkZXIpO1xuICAgKiBjb25zdCBidWYgPSBuZXcgVWludDhBcnJheSg1KTtcbiAgICogYXdhaXQgYnVmUmVhZGVyLnJlYWRGdWxsKGJ1Zik7XG4gICAqIGFzc2VydEVxdWFscyhuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYnVmKSwgXCJoZWxsb1wiKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBwIFRoZSBidWZmZXIgdG8gcmVhZCBkYXRhIGludG8uXG4gICAqIEByZXR1cm5zIFRoZSBidWZmZXIgYHBgIGlmIHRoZSByZWFkIGlzIHN1Y2Nlc3NmdWwsIGBudWxsYCBpZiB0aGUgZW5kIG9mIHRoZVxuICAgKiB1bmRlcmx5aW5nIHN0cmVhbSBoYXMgYmVlbiByZWFjaGVkLCBhbmQgdGhlcmUgYXJlIG5vIG1vcmUgYnl0ZXMgYXZhaWxhYmxlIGluIHRoZSBidWZmZXIuXG4gICAqL1xuICBhc3luYyByZWFkRnVsbChwOiBVaW50OEFycmF5KTogUHJvbWlzZTxVaW50OEFycmF5IHwgbnVsbD4ge1xuICAgIGxldCBieXRlc1JlYWQgPSAwO1xuICAgIHdoaWxlIChieXRlc1JlYWQgPCBwLmxlbmd0aCkge1xuICAgICAgY29uc3QgcnIgPSBhd2FpdCB0aGlzLnJlYWQocC5zdWJhcnJheShieXRlc1JlYWQpKTtcbiAgICAgIGlmIChyciA9PT0gbnVsbCkge1xuICAgICAgICBpZiAoYnl0ZXNSZWFkID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFBhcnRpYWxSZWFkRXJyb3IocC5zdWJhcnJheSgwLCBieXRlc1JlYWQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnl0ZXNSZWFkICs9IHJyO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuZXh0IGJ5dGUgKFswLCAyNTVdKSBvciBgbnVsbGAuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IEJ1ZlJlYWRlciwgQnVmZmVyIH0gZnJvbSBcIkBzdGQvaW9cIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCByZWFkZXIgPSBuZXcgQnVmZmVyKG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImhlbGxvIHdvcmxkXCIpKTtcbiAgICogY29uc3QgYnVmUmVhZGVyID0gbmV3IEJ1ZlJlYWRlcihyZWFkZXIpO1xuICAgKiBjb25zdCBieXRlID0gYXdhaXQgYnVmUmVhZGVyLnJlYWRCeXRlKCk7XG4gICAqIGFzc2VydEVxdWFscyhieXRlLCAxMDQpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5leHQgYnl0ZSAoWzAsIDI1NV0pIG9yIGBudWxsYC5cbiAgICovXG4gIGFzeW5jIHJlYWRCeXRlKCk6IFByb21pc2U8bnVtYmVyIHwgbnVsbD4ge1xuICAgIHdoaWxlICh0aGlzLiNyID09PSB0aGlzLiN3KSB7XG4gICAgICBpZiAodGhpcy4jZW9mKSByZXR1cm4gbnVsbDtcbiAgICAgIGF3YWl0IHRoaXMuI2ZpbGwoKTsgLy8gYnVmZmVyIGlzIGVtcHR5LlxuICAgIH1cbiAgICBjb25zdCBjID0gdGhpcy4jYnVmW3RoaXMuI3JdITtcbiAgICB0aGlzLiNyKys7XG4gICAgLy8gdGhpcy5sYXN0Qnl0ZSA9IGM7XG4gICAgcmV0dXJuIGM7XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdW50aWwgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgZGVsaW0gaW4gdGhlIGlucHV0LFxuICAgKiByZXR1cm5pbmcgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgZGF0YSB1cCB0byBhbmQgaW5jbHVkaW5nIHRoZSBkZWxpbWl0ZXIuXG4gICAqIElmIFJlYWRTdHJpbmcgZW5jb3VudGVycyBhbiBlcnJvciBiZWZvcmUgZmluZGluZyBhIGRlbGltaXRlcixcbiAgICogaXQgcmV0dXJucyB0aGUgZGF0YSByZWFkIGJlZm9yZSB0aGUgZXJyb3IgYW5kIHRoZSBlcnJvciBpdHNlbGZcbiAgICogKG9mdGVuIGBudWxsYCkuXG4gICAqIFJlYWRTdHJpbmcgcmV0dXJucyBlcnIgIT09IG51bGwgaWYgYW5kIG9ubHkgaWYgdGhlIHJldHVybmVkIGRhdGEgZG9lcyBub3QgZW5kXG4gICAqIGluIGRlbGltLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBCdWZSZWFkZXIsIEJ1ZmZlciB9IGZyb20gXCJAc3RkL2lvXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9lcXVhbHNcIjtcbiAgICpcbiAgICogY29uc3QgcmVhZGVyID0gbmV3IEJ1ZmZlcihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJoZWxsbyB3b3JsZFwiKSk7XG4gICAqIGNvbnN0IGJ1ZlJlYWRlciA9IG5ldyBCdWZSZWFkZXIocmVhZGVyKTtcbiAgICogY29uc3Qgc3RyID0gYXdhaXQgYnVmUmVhZGVyLnJlYWRTdHJpbmcoXCIgXCIpO1xuICAgKiBhc3NlcnRFcXVhbHMoc3RyLCBcImhlbGxvIFwiKTtcbiAgICpcbiAgICogY29uc3Qgc3RyMiA9IGF3YWl0IGJ1ZlJlYWRlci5yZWFkU3RyaW5nKFwiIFwiKTtcbiAgICogYXNzZXJ0RXF1YWxzKHN0cjIsIFwid29ybGRcIik7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gZGVsaW0gVGhlIGRlbGltaXRlciB0byByZWFkIHVudGlsLlxuICAgKiBAcmV0dXJucyBUaGUgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGRhdGEgdXAgdG8gYW5kIGluY2x1ZGluZyB0aGUgZGVsaW1pdGVyLlxuICAgKi9cbiAgYXN5bmMgcmVhZFN0cmluZyhkZWxpbTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgaWYgKGRlbGltLmxlbmd0aCAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRGVsaW1pdGVyIHNob3VsZCBiZSBhIHNpbmdsZSBjaGFyYWN0ZXJcIik7XG4gICAgfVxuICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IHRoaXMucmVhZFNsaWNlKGRlbGltLmNoYXJDb2RlQXQoMCkpO1xuICAgIGlmIChidWZmZXIgPT09IG51bGwpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYnVmZmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGxvdy1sZXZlbCBsaW5lLXJlYWRpbmcgcHJpbWl0aXZlLiBNb3N0IGNhbGxlcnMgc2hvdWxkIHVzZVxuICAgKiBgcmVhZFN0cmluZygnXFxuJylgIGluc3RlYWQuXG4gICAqXG4gICAqIGByZWFkTGluZSgpYCB0cmllcyB0byByZXR1cm4gYSBzaW5nbGUgbGluZSwgbm90IGluY2x1ZGluZyB0aGUgZW5kLW9mLWxpbmVcbiAgICogYnl0ZXMuIElmIHRoZSBsaW5lIHdhcyB0b28gbG9uZyBmb3IgdGhlIGJ1ZmZlciB0aGVuIGBtb3JlYCBpcyBzZXQgYW5kIHRoZVxuICAgKiBiZWdpbm5pbmcgb2YgdGhlIGxpbmUgaXMgcmV0dXJuZWQuIFRoZSByZXN0IG9mIHRoZSBsaW5lIHdpbGwgYmUgcmV0dXJuZWRcbiAgICogZnJvbSBmdXR1cmUgY2FsbHMuIGBtb3JlYCB3aWxsIGJlIGZhbHNlIHdoZW4gcmV0dXJuaW5nIHRoZSBsYXN0IGZyYWdtZW50XG4gICAqIG9mIHRoZSBsaW5lLiBUaGUgcmV0dXJuZWQgYnVmZmVyIGlzIG9ubHkgdmFsaWQgdW50aWwgdGhlIG5leHQgY2FsbCB0b1xuICAgKiBgcmVhZExpbmUoKWAuXG4gICAqXG4gICAqIFRoZSB0ZXh0IHJldHVybmVkIGZyb20gdGhpcyBtZXRob2QgZG9lcyBub3QgaW5jbHVkZSB0aGUgbGluZSBlbmQgKFwiXFxyXFxuXCIgb3JcbiAgICogXCJcXG5cIikuXG4gICAqXG4gICAqIFdoZW4gdGhlIGVuZCBvZiB0aGUgdW5kZXJseWluZyBzdHJlYW0gaXMgcmVhY2hlZCwgdGhlIGZpbmFsIGJ5dGVzIGluIHRoZVxuICAgKiBzdHJlYW0gYXJlIHJldHVybmVkLiBObyBpbmRpY2F0aW9uIG9yIGVycm9yIGlzIGdpdmVuIGlmIHRoZSBpbnB1dCBlbmRzXG4gICAqIHdpdGhvdXQgYSBmaW5hbCBsaW5lIGVuZC4gV2hlbiB0aGVyZSBhcmUgbm8gbW9yZSB0cmFpbGluZyBieXRlcyB0byByZWFkLFxuICAgKiBgcmVhZExpbmUoKWAgcmV0dXJucyBgbnVsbGAuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IEJ1ZlJlYWRlciwgQnVmZmVyIH0gZnJvbSBcIkBzdGQvaW9cIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCByZWFkZXIgPSBuZXcgQnVmZmVyKG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImhlbGxvXFxud29ybGRcIikpO1xuICAgKiBjb25zdCBidWZSZWFkZXIgPSBuZXcgQnVmUmVhZGVyKHJlYWRlcik7XG4gICAqIGNvbnN0IGxpbmUxID0gYXdhaXQgYnVmUmVhZGVyLnJlYWRMaW5lKCk7XG4gICAqIGFzc2VydEVxdWFscyhuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUobGluZTEhLmxpbmUpLCBcImhlbGxvXCIpO1xuICAgKiBjb25zdCBsaW5lMiA9IGF3YWl0IGJ1ZlJlYWRlci5yZWFkTGluZSgpO1xuICAgKiBhc3NlcnRFcXVhbHMobmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGxpbmUyIS5saW5lKSwgXCJ3b3JsZFwiKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsaW5lIHJlYWQuXG4gICAqL1xuICBhc3luYyByZWFkTGluZSgpOiBQcm9taXNlPFJlYWRMaW5lUmVzdWx0IHwgbnVsbD4ge1xuICAgIGxldCBsaW5lOiBVaW50OEFycmF5IHwgbnVsbCA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgbGluZSA9IGF3YWl0IHRoaXMucmVhZFNsaWNlKExGKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIERvbid0IHRocm93IGlmIGByZWFkU2xpY2UoKWAgZmFpbGVkIHdpdGggYEJ1ZmZlckZ1bGxFcnJvcmAsIGluc3RlYWQgd2VcbiAgICAgIC8vIGp1c3QgcmV0dXJuIHdoYXRldmVyIGlzIGF2YWlsYWJsZSBhbmQgc2V0IHRoZSBgbW9yZWAgZmxhZy5cbiAgICAgIGlmICghKGVyciBpbnN0YW5jZW9mIEJ1ZmZlckZ1bGxFcnJvcikpIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuXG4gICAgICBsZXQgcGFydGlhbCA9IGVyci5wYXJ0aWFsO1xuXG4gICAgICAvLyBIYW5kbGUgdGhlIGNhc2Ugd2hlcmUgXCJcXHJcXG5cIiBzdHJhZGRsZXMgdGhlIGJ1ZmZlci5cbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuI2VvZiAmJiBwYXJ0aWFsICYmXG4gICAgICAgIHBhcnRpYWwuYnl0ZUxlbmd0aCA+IDAgJiZcbiAgICAgICAgcGFydGlhbFtwYXJ0aWFsLmJ5dGVMZW5ndGggLSAxXSA9PT0gQ1JcbiAgICAgICkge1xuICAgICAgICAvLyBQdXQgdGhlICdcXHInIGJhY2sgb24gYnVmIGFuZCBkcm9wIGl0IGZyb20gbGluZS5cbiAgICAgICAgLy8gTGV0IHRoZSBuZXh0IGNhbGwgdG8gUmVhZExpbmUgY2hlY2sgZm9yIFwiXFxyXFxuXCIuXG4gICAgICAgIGlmICh0aGlzLiNyIDw9IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUcmllZCB0byByZXdpbmQgcGFzdCBzdGFydCBvZiBidWZmZXJcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4jci0tO1xuICAgICAgICBwYXJ0aWFsID0gcGFydGlhbC5zdWJhcnJheSgwLCBwYXJ0aWFsLmJ5dGVMZW5ndGggLSAxKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcnRpYWwpIHtcbiAgICAgICAgcmV0dXJuIHsgbGluZTogcGFydGlhbCwgbW9yZTogIXRoaXMuI2VvZiB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChsaW5lID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAobGluZS5ieXRlTGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4geyBsaW5lLCBtb3JlOiBmYWxzZSB9O1xuICAgIH1cblxuICAgIGlmIChsaW5lW2xpbmUuYnl0ZUxlbmd0aCAtIDFdID09PSBMRikge1xuICAgICAgbGV0IGRyb3AgPSAxO1xuICAgICAgaWYgKGxpbmUuYnl0ZUxlbmd0aCA+IDEgJiYgbGluZVtsaW5lLmJ5dGVMZW5ndGggLSAyXSA9PT0gQ1IpIHtcbiAgICAgICAgZHJvcCA9IDI7XG4gICAgICB9XG4gICAgICBsaW5lID0gbGluZS5zdWJhcnJheSgwLCBsaW5lLmJ5dGVMZW5ndGggLSBkcm9wKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgbGluZSwgbW9yZTogZmFsc2UgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyB1bnRpbCB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBgZGVsaW1gIGluIHRoZSBpbnB1dCxcbiAgICogcmV0dXJuaW5nIGEgc2xpY2UgcG9pbnRpbmcgYXQgdGhlIGJ5dGVzIGluIHRoZSBidWZmZXIuIFRoZSBieXRlcyBzdG9wXG4gICAqIGJlaW5nIHZhbGlkIGF0IHRoZSBuZXh0IHJlYWQuXG4gICAqXG4gICAqIElmIGByZWFkU2xpY2UoKWAgZW5jb3VudGVycyBhbiBlcnJvciBiZWZvcmUgZmluZGluZyBhIGRlbGltaXRlciwgb3IgdGhlXG4gICAqIGJ1ZmZlciBmaWxscyB3aXRob3V0IGZpbmRpbmcgYSBkZWxpbWl0ZXIsIGl0IHRocm93cyBhbiBlcnJvciB3aXRoIGFcbiAgICogYHBhcnRpYWxgIHByb3BlcnR5IHRoYXQgY29udGFpbnMgdGhlIGVudGlyZSBidWZmZXIuXG4gICAqXG4gICAqIElmIGByZWFkU2xpY2UoKWAgZW5jb3VudGVycyB0aGUgZW5kIG9mIHRoZSB1bmRlcmx5aW5nIHN0cmVhbSBhbmQgdGhlcmUgYXJlXG4gICAqIGFueSBieXRlcyBsZWZ0IGluIHRoZSBidWZmZXIsIHRoZSByZXN0IG9mIHRoZSBidWZmZXIgaXMgcmV0dXJuZWQuIEluIG90aGVyXG4gICAqIHdvcmRzLCBFT0YgaXMgYWx3YXlzIHRyZWF0ZWQgYXMgYSBkZWxpbWl0ZXIuIE9uY2UgdGhlIGJ1ZmZlciBpcyBlbXB0eSxcbiAgICogaXQgcmV0dXJucyBgbnVsbGAuXG4gICAqXG4gICAqIEJlY2F1c2UgdGhlIGRhdGEgcmV0dXJuZWQgZnJvbSBgcmVhZFNsaWNlKClgIHdpbGwgYmUgb3ZlcndyaXR0ZW4gYnkgdGhlXG4gICAqIG5leHQgSS9PIG9wZXJhdGlvbiwgbW9zdCBjbGllbnRzIHNob3VsZCB1c2UgYHJlYWRTdHJpbmcoKWAgaW5zdGVhZC5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgQnVmUmVhZGVyLCBCdWZmZXIgfSBmcm9tIFwiQHN0ZC9pb1wiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gICAqXG4gICAqIGNvbnN0IHJlYWRlciA9IG5ldyBCdWZmZXIobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFwiaGVsbG8gd29ybGRcIikpO1xuICAgKiBjb25zdCBidWZSZWFkZXIgPSBuZXcgQnVmUmVhZGVyKHJlYWRlcik7XG4gICAqIGNvbnN0IHNsaWNlID0gYXdhaXQgYnVmUmVhZGVyLnJlYWRTbGljZSgweDIwKTtcbiAgICogYXNzZXJ0RXF1YWxzKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShzbGljZSEpLCBcImhlbGxvIFwiKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBkZWxpbSBUaGUgZGVsaW1pdGVyIHRvIHJlYWQgdW50aWwuXG4gICAqIEByZXR1cm5zIEEgc2xpY2UgcG9pbnRpbmcgYXQgdGhlIGJ5dGVzIGluIHRoZSBidWZmZXIuXG4gICAqL1xuICBhc3luYyByZWFkU2xpY2UoZGVsaW06IG51bWJlcik6IFByb21pc2U8VWludDhBcnJheSB8IG51bGw+IHtcbiAgICBsZXQgcyA9IDA7IC8vIHNlYXJjaCBzdGFydCBpbmRleFxuICAgIGxldCBzbGljZTogVWludDhBcnJheSB8IHVuZGVmaW5lZDtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAvLyBTZWFyY2ggYnVmZmVyLlxuICAgICAgbGV0IGkgPSB0aGlzLiNidWYuc3ViYXJyYXkodGhpcy4jciArIHMsIHRoaXMuI3cpLmluZGV4T2YoZGVsaW0pO1xuICAgICAgaWYgKGkgPj0gMCkge1xuICAgICAgICBpICs9IHM7XG4gICAgICAgIHNsaWNlID0gdGhpcy4jYnVmLnN1YmFycmF5KHRoaXMuI3IsIHRoaXMuI3IgKyBpICsgMSk7XG4gICAgICAgIHRoaXMuI3IgKz0gaSArIDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBFT0Y/XG4gICAgICBpZiAodGhpcy4jZW9mKSB7XG4gICAgICAgIGlmICh0aGlzLiNyID09PSB0aGlzLiN3KSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgc2xpY2UgPSB0aGlzLiNidWYuc3ViYXJyYXkodGhpcy4jciwgdGhpcy4jdyk7XG4gICAgICAgIHRoaXMuI3IgPSB0aGlzLiN3O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gQnVmZmVyIGZ1bGw/XG4gICAgICBpZiAodGhpcy5idWZmZXJlZCgpID49IHRoaXMuI2J1Zi5ieXRlTGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuI3IgPSB0aGlzLiN3O1xuICAgICAgICAvLyAjNDUyMSBUaGUgaW50ZXJuYWwgYnVmZmVyIHNob3VsZCBub3QgYmUgcmV1c2VkIGFjcm9zcyByZWFkcyBiZWNhdXNlIGl0IGNhdXNlcyBjb3JydXB0aW9uIG9mIGRhdGEuXG4gICAgICAgIGNvbnN0IG9sZGJ1ZiA9IHRoaXMuI2J1ZjtcbiAgICAgICAgY29uc3QgbmV3YnVmID0gdGhpcy4jYnVmLnNsaWNlKDApO1xuICAgICAgICB0aGlzLiNidWYgPSBuZXdidWY7XG4gICAgICAgIHRocm93IG5ldyBCdWZmZXJGdWxsRXJyb3Iob2xkYnVmKTtcbiAgICAgIH1cblxuICAgICAgcyA9IHRoaXMuI3cgLSB0aGlzLiNyOyAvLyBkbyBub3QgcmVzY2FuIGFyZWEgd2Ugc2Nhbm5lZCBiZWZvcmVcblxuICAgICAgLy8gQnVmZmVyIGlzIG5vdCBmdWxsLlxuICAgICAgYXdhaXQgdGhpcy4jZmlsbCgpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBsYXN0IGJ5dGUsIGlmIGFueS5cbiAgICAvLyBjb25zdCBpID0gc2xpY2UuYnl0ZUxlbmd0aCAtIDE7XG4gICAgLy8gaWYgKGkgPj0gMCkge1xuICAgIC8vICAgdGhpcy5sYXN0Qnl0ZSA9IHNsaWNlW2ldO1xuICAgIC8vICAgdGhpcy5sYXN0Q2hhclNpemUgPSAtMVxuICAgIC8vIH1cblxuICAgIHJldHVybiBzbGljZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuZXh0IGBuYCBieXRlcyB3aXRob3V0IGFkdmFuY2luZyB0aGUgcmVhZGVyLiBUaGVcbiAgICogYnl0ZXMgc3RvcCBiZWluZyB2YWxpZCBhdCB0aGUgbmV4dCByZWFkIGNhbGwuXG4gICAqXG4gICAqIFdoZW4gdGhlIGVuZCBvZiB0aGUgdW5kZXJseWluZyBzdHJlYW0gaXMgcmVhY2hlZCwgYnV0IHRoZXJlIGFyZSB1bnJlYWRcbiAgICogYnl0ZXMgbGVmdCBpbiB0aGUgYnVmZmVyLCB0aG9zZSBieXRlcyBhcmUgcmV0dXJuZWQuIElmIHRoZXJlIGFyZSBubyBieXRlc1xuICAgKiBsZWZ0IGluIHRoZSBidWZmZXIsIGl0IHJldHVybnMgYG51bGxgLlxuICAgKlxuICAgKiBJZiBhbiBlcnJvciBpcyBlbmNvdW50ZXJlZCBiZWZvcmUgYG5gIGJ5dGVzIGFyZSBhdmFpbGFibGUsIGBwZWVrKClgIHRocm93c1xuICAgKiBhbiBlcnJvciB3aXRoIHRoZSBgcGFydGlhbGAgcHJvcGVydHkgc2V0IHRvIGEgc2xpY2Ugb2YgdGhlIGJ1ZmZlciB0aGF0XG4gICAqIGNvbnRhaW5zIHRoZSBieXRlcyB0aGF0IHdlcmUgYXZhaWxhYmxlIGJlZm9yZSB0aGUgZXJyb3Igb2NjdXJyZWQuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IEJ1ZlJlYWRlciwgQnVmZmVyIH0gZnJvbSBcIkBzdGQvaW9cIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCByZWFkZXIgPSBuZXcgQnVmZmVyKG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImhlbGxvIHdvcmxkXCIpKTtcbiAgICogY29uc3QgYnVmUmVhZGVyID0gbmV3IEJ1ZlJlYWRlcihyZWFkZXIpO1xuICAgKiBjb25zdCBwZWVrZWQgPSBhd2FpdCBidWZSZWFkZXIucGVlayg1KTtcbiAgICogYXNzZXJ0RXF1YWxzKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwZWVrZWQhKSwgXCJoZWxsb1wiKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBuIFRoZSBudW1iZXIgb2YgYnl0ZXMgdG8gcGVlay5cbiAgICogQHJldHVybnMgVGhlIG5leHQgYG5gIGJ5dGVzIHdpdGhvdXQgYWR2YW5jaW5nIHRoZSByZWFkZXIuXG4gICAqL1xuICBhc3luYyBwZWVrKG46IG51bWJlcik6IFByb21pc2U8VWludDhBcnJheSB8IG51bGw+IHtcbiAgICBpZiAobiA8IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlBlZWsgY291bnQgY2Fubm90IGJlIG5lZ2F0aXZlXCIpO1xuICAgIH1cblxuICAgIGxldCBhdmFpbCA9IHRoaXMuI3cgLSB0aGlzLiNyO1xuICAgIHdoaWxlIChhdmFpbCA8IG4gJiYgYXZhaWwgPCB0aGlzLiNidWYuYnl0ZUxlbmd0aCAmJiAhdGhpcy4jZW9mKSB7XG4gICAgICBhd2FpdCB0aGlzLiNmaWxsKCk7XG4gICAgICBhdmFpbCA9IHRoaXMuI3cgLSB0aGlzLiNyO1xuICAgIH1cblxuICAgIGlmIChhdmFpbCA9PT0gMCAmJiB0aGlzLiNlb2YpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoYXZhaWwgPCBuICYmIHRoaXMuI2VvZikge1xuICAgICAgcmV0dXJuIHRoaXMuI2J1Zi5zdWJhcnJheSh0aGlzLiNyLCB0aGlzLiNyICsgYXZhaWwpO1xuICAgIH0gZWxzZSBpZiAoYXZhaWwgPCBuKSB7XG4gICAgICB0aHJvdyBuZXcgQnVmZmVyRnVsbEVycm9yKHRoaXMuI2J1Zi5zdWJhcnJheSh0aGlzLiNyLCB0aGlzLiN3KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuI2J1Zi5zdWJhcnJheSh0aGlzLiNyLCB0aGlzLiNyICsgbik7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsSUFBSSxRQUFRLDZCQUE2QjtBQUdsRCxNQUFNLG1CQUFtQjtBQUN6QixNQUFNLGVBQWU7QUFDckIsTUFBTSw4QkFBOEI7QUFDcEMsTUFBTSxLQUFLLEtBQUssVUFBVSxDQUFDO0FBQzNCLE1BQU0sS0FBSyxLQUFLLFVBQVUsQ0FBQztBQUUzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F1QkMsR0FDRCxPQUFPLE1BQU0sd0JBQXdCO0VBQ25DOzs7Ozs7Ozs7OztHQVdDLEdBQ0QsUUFBb0I7RUFFcEI7Ozs7R0FJQyxHQUNELFlBQVksT0FBbUIsQ0FBRTtJQUMvQixLQUFLLENBQUM7SUFDTixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSTtJQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHO0VBQ2pCO0FBQ0Y7QUFFQTs7Ozs7Ozs7Ozs7Ozs7O0NBZUMsR0FDRCxPQUFPLE1BQU0seUJBQXlCO0VBQ3BDOzs7Ozs7Ozs7OztHQVdDLEdBQ0QsUUFBb0I7RUFFcEI7Ozs7R0FJQyxHQUNELFlBQVksT0FBbUIsQ0FBRTtJQUMvQixLQUFLLENBQUM7SUFDTixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSTtJQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHO0VBQ2pCO0FBQ0Y7QUFjQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLEdBQ0QsT0FBTyxNQUFNO0VBQ1gsQ0FBQSxHQUFJLENBQWM7RUFDbEIsQ0FBQSxFQUFHLENBQVU7RUFDYixDQUFBLENBQUUsR0FBRyxFQUFFO0VBQ1AsQ0FBQSxDQUFFLEdBQUcsRUFBRTtFQUNQLENBQUEsR0FBSSxHQUFHLE1BQU07RUFFYjs7Ozs7Ozs7Ozs7Ozs7OztHQWdCQyxHQUNELE9BQU8sT0FBTyxDQUFTLEVBQUUsT0FBZSxnQkFBZ0IsRUFBYTtJQUNuRSxPQUFPLGFBQWEsWUFBWSxJQUFJLElBQUksVUFBVSxHQUFHO0VBQ3ZEO0VBRUE7Ozs7O0dBS0MsR0FDRCxZQUFZLEVBQVUsRUFBRSxPQUFlLGdCQUFnQixDQUFFO0lBQ3ZELElBQUksT0FBTyxjQUFjO01BQ3ZCLE9BQU87SUFDVDtJQUNBLElBQUksQ0FBQyxDQUFBLEtBQU0sQ0FBQyxJQUFJLFdBQVcsT0FBTztFQUNwQztFQUVBOzs7Ozs7Ozs7Ozs7Ozs7R0FlQyxHQUNELE9BQWU7SUFDYixPQUFPLElBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxVQUFVO0VBQzdCO0VBRUE7Ozs7Ozs7Ozs7Ozs7OztHQWVDLEdBQ0QsV0FBbUI7SUFDakIsT0FBTyxJQUFJLENBQUMsQ0FBQSxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUEsQ0FBRTtFQUMxQjtFQUVBLHFDQUFxQztFQUNyQyxDQUFBLElBQUssR0FBRztJQUNOLG9DQUFvQztJQUNwQyxJQUFJLElBQUksQ0FBQyxDQUFBLENBQUUsR0FBRyxHQUFHO01BQ2YsSUFBSSxDQUFDLENBQUEsR0FBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBLENBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQSxDQUFFO01BQ3hDLElBQUksQ0FBQyxDQUFBLENBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQSxDQUFFO01BQ2xCLElBQUksQ0FBQyxDQUFBLENBQUUsR0FBRztJQUNaO0lBRUEsSUFBSSxJQUFJLENBQUMsQ0FBQSxDQUFFLElBQUksSUFBSSxDQUFDLENBQUEsR0FBSSxDQUFDLFVBQVUsRUFBRTtNQUNuQyxNQUFNLElBQUksTUFBTTtJQUNsQjtJQUVBLGdEQUFnRDtJQUNoRCxJQUFLLElBQUksSUFBSSw2QkFBNkIsSUFBSSxHQUFHLElBQUs7TUFDcEQsTUFBTSxLQUFLLE1BQU0sSUFBSSxDQUFDLENBQUEsRUFBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQSxHQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUU7TUFDekQsSUFBSSxPQUFPLE1BQU07UUFDZixJQUFJLENBQUMsQ0FBQSxHQUFJLEdBQUc7UUFDWjtNQUNGO01BQ0EsSUFBSSxDQUFDLENBQUEsQ0FBRSxJQUFJO01BQ1gsSUFBSSxLQUFLLEdBQUc7UUFDVjtNQUNGO0lBQ0Y7SUFFQSxNQUFNLElBQUksTUFDUixDQUFDLGtCQUFrQixFQUFFLDRCQUE0QixhQUFhLENBQUM7RUFFbkUsRUFBRTtFQUVGOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCQyxHQUNELE1BQU0sQ0FBUyxFQUFFO0lBQ2YsSUFBSSxDQUFDLENBQUEsS0FBTSxDQUFDLElBQUksQ0FBQyxDQUFBLEdBQUksRUFBRTtFQUN6QjtFQUVBLENBQUEsS0FBTSxHQUFHLENBQUMsS0FBaUI7SUFDekIsSUFBSSxDQUFDLENBQUEsR0FBSSxHQUFHO0lBQ1osSUFBSSxDQUFDLENBQUEsRUFBRyxHQUFHO0lBQ1gsSUFBSSxDQUFDLENBQUEsR0FBSSxHQUFHO0VBQ1osc0JBQXNCO0VBQ3RCLDBCQUEwQjtFQUM1QixFQUFFO0VBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCQyxHQUNELE1BQU0sS0FBSyxDQUFhLEVBQTBCO0lBQ2hELElBQUksS0FBb0IsRUFBRSxVQUFVO0lBQ3BDLElBQUksRUFBRSxVQUFVLEtBQUssR0FBRyxPQUFPO0lBRS9CLElBQUksSUFBSSxDQUFDLENBQUEsQ0FBRSxLQUFLLElBQUksQ0FBQyxDQUFBLENBQUUsRUFBRTtNQUN2QixJQUFJLEVBQUUsVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxVQUFVLEVBQUU7UUFDeEMsNEJBQTRCO1FBQzVCLHNDQUFzQztRQUN0QyxNQUFNLEtBQUssTUFBTSxJQUFJLENBQUMsQ0FBQSxFQUFHLENBQUMsSUFBSSxDQUFDO1FBQy9CLHNCQUFzQjtRQUN0QixxQ0FBcUM7UUFDckMsNEJBQTRCO1FBQzVCLElBQUk7UUFDSixPQUFPO01BQ1Q7TUFFQSxZQUFZO01BQ1oseUNBQXlDO01BQ3pDLElBQUksQ0FBQyxDQUFBLENBQUUsR0FBRztNQUNWLElBQUksQ0FBQyxDQUFBLENBQUUsR0FBRztNQUNWLEtBQUssTUFBTSxJQUFJLENBQUMsQ0FBQSxFQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBLEdBQUk7TUFDbEMsSUFBSSxPQUFPLEtBQUssT0FBTyxNQUFNLE9BQU87TUFDcEMsSUFBSSxDQUFDLENBQUEsQ0FBRSxJQUFJO0lBQ2I7SUFFQSx5QkFBeUI7SUFDekIsTUFBTSxTQUFTLEtBQUssSUFBSSxDQUFDLENBQUEsR0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFFLEVBQUUsSUFBSSxDQUFDLENBQUEsQ0FBRSxHQUFHLEdBQUc7SUFDN0QsSUFBSSxDQUFDLENBQUEsQ0FBRSxJQUFJO0lBQ1gsd0NBQXdDO0lBQ3hDLDBCQUEwQjtJQUMxQixPQUFPO0VBQ1Q7RUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEJDLEdBQ0QsTUFBTSxTQUFTLENBQWEsRUFBOEI7SUFDeEQsSUFBSSxZQUFZO0lBQ2hCLE1BQU8sWUFBWSxFQUFFLE1BQU0sQ0FBRTtNQUMzQixNQUFNLEtBQUssTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDO01BQ3RDLElBQUksT0FBTyxNQUFNO1FBQ2YsSUFBSSxjQUFjLEdBQUc7VUFDbkIsT0FBTztRQUNULE9BQU87VUFDTCxNQUFNLElBQUksaUJBQWlCLEVBQUUsUUFBUSxDQUFDLEdBQUc7UUFDM0M7TUFDRjtNQUNBLGFBQWE7SUFDZjtJQUNBLE9BQU87RUFDVDtFQUVBOzs7Ozs7Ozs7Ozs7Ozs7R0FlQyxHQUNELE1BQU0sV0FBbUM7SUFDdkMsTUFBTyxJQUFJLENBQUMsQ0FBQSxDQUFFLEtBQUssSUFBSSxDQUFDLENBQUEsQ0FBRSxDQUFFO01BQzFCLElBQUksSUFBSSxDQUFDLENBQUEsR0FBSSxFQUFFLE9BQU87TUFDdEIsTUFBTSxJQUFJLENBQUMsQ0FBQSxJQUFLLElBQUksbUJBQW1CO0lBQ3pDO0lBQ0EsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFFLENBQUM7SUFDNUIsSUFBSSxDQUFDLENBQUEsQ0FBRTtJQUNQLHFCQUFxQjtJQUNyQixPQUFPO0VBQ1Q7RUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCQyxHQUNELE1BQU0sV0FBVyxLQUFhLEVBQTBCO0lBQ3RELElBQUksTUFBTSxNQUFNLEtBQUssR0FBRztNQUN0QixNQUFNLElBQUksTUFBTTtJQUNsQjtJQUNBLE1BQU0sU0FBUyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxVQUFVLENBQUM7SUFDckQsSUFBSSxXQUFXLE1BQU0sT0FBTztJQUM1QixPQUFPLElBQUksY0FBYyxNQUFNLENBQUM7RUFDbEM7RUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUNDLEdBQ0QsTUFBTSxXQUEyQztJQUMvQyxJQUFJLE9BQTBCO0lBRTlCLElBQUk7TUFDRixPQUFPLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUM5QixFQUFFLE9BQU8sS0FBSztNQUNaLHlFQUF5RTtNQUN6RSw2REFBNkQ7TUFDN0QsSUFBSSxDQUFDLENBQUMsZUFBZSxlQUFlLEdBQUc7UUFDckMsTUFBTTtNQUNSO01BRUEsSUFBSSxVQUFVLElBQUksT0FBTztNQUV6QixxREFBcUQ7TUFDckQsSUFDRSxDQUFDLElBQUksQ0FBQyxDQUFBLEdBQUksSUFBSSxXQUNkLFFBQVEsVUFBVSxHQUFHLEtBQ3JCLE9BQU8sQ0FBQyxRQUFRLFVBQVUsR0FBRyxFQUFFLEtBQUssSUFDcEM7UUFDQSxrREFBa0Q7UUFDbEQsa0RBQWtEO1FBQ2xELElBQUksSUFBSSxDQUFDLENBQUEsQ0FBRSxJQUFJLEdBQUc7VUFDaEIsTUFBTSxJQUFJLE1BQU07UUFDbEI7UUFDQSxJQUFJLENBQUMsQ0FBQSxDQUFFO1FBQ1AsVUFBVSxRQUFRLFFBQVEsQ0FBQyxHQUFHLFFBQVEsVUFBVSxHQUFHO01BQ3JEO01BRUEsSUFBSSxTQUFTO1FBQ1gsT0FBTztVQUFFLE1BQU07VUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUEsR0FBSTtRQUFDO01BQzNDO0lBQ0Y7SUFFQSxJQUFJLFNBQVMsTUFBTTtNQUNqQixPQUFPO0lBQ1Q7SUFFQSxJQUFJLEtBQUssVUFBVSxLQUFLLEdBQUc7TUFDekIsT0FBTztRQUFFO1FBQU0sTUFBTTtNQUFNO0lBQzdCO0lBRUEsSUFBSSxJQUFJLENBQUMsS0FBSyxVQUFVLEdBQUcsRUFBRSxLQUFLLElBQUk7TUFDcEMsSUFBSSxPQUFPO01BQ1gsSUFBSSxLQUFLLFVBQVUsR0FBRyxLQUFLLElBQUksQ0FBQyxLQUFLLFVBQVUsR0FBRyxFQUFFLEtBQUssSUFBSTtRQUMzRCxPQUFPO01BQ1Q7TUFDQSxPQUFPLEtBQUssUUFBUSxDQUFDLEdBQUcsS0FBSyxVQUFVLEdBQUc7SUFDNUM7SUFDQSxPQUFPO01BQUU7TUFBTSxNQUFNO0lBQU07RUFDN0I7RUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEJDLEdBQ0QsTUFBTSxVQUFVLEtBQWEsRUFBOEI7SUFDekQsSUFBSSxJQUFJLEdBQUcscUJBQXFCO0lBQ2hDLElBQUk7SUFFSixNQUFPLEtBQU07TUFDWCxpQkFBaUI7TUFDakIsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUEsQ0FBRSxFQUFFLE9BQU8sQ0FBQztNQUN6RCxJQUFJLEtBQUssR0FBRztRQUNWLEtBQUs7UUFDTCxRQUFRLElBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBRSxFQUFFLElBQUksQ0FBQyxDQUFBLENBQUUsR0FBRyxJQUFJO1FBQ2xELElBQUksQ0FBQyxDQUFBLENBQUUsSUFBSSxJQUFJO1FBQ2Y7TUFDRjtNQUVBLE9BQU87TUFDUCxJQUFJLElBQUksQ0FBQyxDQUFBLEdBQUksRUFBRTtRQUNiLElBQUksSUFBSSxDQUFDLENBQUEsQ0FBRSxLQUFLLElBQUksQ0FBQyxDQUFBLENBQUUsRUFBRTtVQUN2QixPQUFPO1FBQ1Q7UUFDQSxRQUFRLElBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBRSxFQUFFLElBQUksQ0FBQyxDQUFBLENBQUU7UUFDM0MsSUFBSSxDQUFDLENBQUEsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFBLENBQUU7UUFDakI7TUFDRjtNQUVBLGVBQWU7TUFDZixJQUFJLElBQUksQ0FBQyxRQUFRLE1BQU0sSUFBSSxDQUFDLENBQUEsR0FBSSxDQUFDLFVBQVUsRUFBRTtRQUMzQyxJQUFJLENBQUMsQ0FBQSxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUEsQ0FBRTtRQUNqQixvR0FBb0c7UUFDcEcsTUFBTSxTQUFTLElBQUksQ0FBQyxDQUFBLEdBQUk7UUFDeEIsTUFBTSxTQUFTLElBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxLQUFLLENBQUM7UUFDL0IsSUFBSSxDQUFDLENBQUEsR0FBSSxHQUFHO1FBQ1osTUFBTSxJQUFJLGdCQUFnQjtNQUM1QjtNQUVBLElBQUksSUFBSSxDQUFDLENBQUEsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFBLENBQUUsRUFBRSx1Q0FBdUM7TUFFOUQsc0JBQXNCO01BQ3RCLE1BQU0sSUFBSSxDQUFDLENBQUEsSUFBSztJQUNsQjtJQUVBLDRCQUE0QjtJQUM1QixrQ0FBa0M7SUFDbEMsZ0JBQWdCO0lBQ2hCLDhCQUE4QjtJQUM5QiwyQkFBMkI7SUFDM0IsSUFBSTtJQUVKLE9BQU87RUFDVDtFQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeUJDLEdBQ0QsTUFBTSxLQUFLLENBQVMsRUFBOEI7SUFDaEQsSUFBSSxJQUFJLEdBQUc7TUFDVCxNQUFNLElBQUksTUFBTTtJQUNsQjtJQUVBLElBQUksUUFBUSxJQUFJLENBQUMsQ0FBQSxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUEsQ0FBRTtJQUM3QixNQUFPLFFBQVEsS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQSxHQUFJLENBQUU7TUFDOUQsTUFBTSxJQUFJLENBQUMsQ0FBQSxJQUFLO01BQ2hCLFFBQVEsSUFBSSxDQUFDLENBQUEsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFBLENBQUU7SUFDM0I7SUFFQSxJQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsQ0FBQSxHQUFJLEVBQUU7TUFDNUIsT0FBTztJQUNULE9BQU8sSUFBSSxRQUFRLEtBQUssSUFBSSxDQUFDLENBQUEsR0FBSSxFQUFFO01BQ2pDLE9BQU8sSUFBSSxDQUFDLENBQUEsR0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFFLEVBQUUsSUFBSSxDQUFDLENBQUEsQ0FBRSxHQUFHO0lBQy9DLE9BQU8sSUFBSSxRQUFRLEdBQUc7TUFDcEIsTUFBTSxJQUFJLGdCQUFnQixJQUFJLENBQUMsQ0FBQSxHQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQSxDQUFFO0lBQy9EO0lBRUEsT0FBTyxJQUFJLENBQUMsQ0FBQSxHQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQSxDQUFFLEdBQUc7RUFDL0M7QUFDRiJ9
// denoCacheMetadata=17805454941658961335,5434328200018219618