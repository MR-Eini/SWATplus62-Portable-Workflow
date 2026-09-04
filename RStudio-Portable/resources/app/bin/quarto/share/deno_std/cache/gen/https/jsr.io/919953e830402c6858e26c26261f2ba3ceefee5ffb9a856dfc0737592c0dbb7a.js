// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { concat } from "jsr:/@std/bytes@^1.0.0-rc.3/concat";
import { createLPS } from "./_common.ts";
/**
 * Divide a stream into chunks delimited by a given byte sequence.
 *
 * If you are working with a stream of `string`, consider using {@linkcode TextDelimiterStream}.
 *
 * @example
 * Divide a CSV stream by commas, discarding the commas:
 * ```ts
 * import { DelimiterStream } from "@std/streams/delimiter-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const inputStream = ReadableStream.from(["foo,bar", ",baz"]);
 *
 * const transformed = inputStream.pipeThrough(new TextEncoderStream())
 *   .pipeThrough(new DelimiterStream(new TextEncoder().encode(",")))
 *   .pipeThrough(new TextDecoderStream());
 *
 * assertEquals(await Array.fromAsync(transformed), ["foo", "bar", "baz"]);
 * ```
 *
 * @example
 * Divide a stream after semi-colons, keeping the semicolons in the output:
 * ```ts
 * import { DelimiterStream } from "@std/streams/delimiter-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const inputStream = ReadableStream.from(["foo;", "bar;baz", ";"]);
 *
 * const transformed = inputStream.pipeThrough(new TextEncoderStream())
 *   .pipeThrough(
 *     new DelimiterStream(new TextEncoder().encode(";"), {
 *       disposition: "suffix",
 *     }),
 *   ).pipeThrough(new TextDecoderStream());
 *
 * assertEquals(await Array.fromAsync(transformed), ["foo;", "bar;", "baz;"]);
 * ```
 */ export class DelimiterStream extends TransformStream {
  #bufs = [];
  #delimiter;
  #matchIndex = 0;
  #delimLPS;
  #disp;
  /**
   * Constructs a new instance.
   *
   * @param delimiter A delimiter to split the stream by.
   * @param options Options for the delimiter stream.
   *
   * @example comma as a delimiter
   * ```ts no-assert
   * import { DelimiterStream } from "@std/streams/delimiter-stream";
   *
   * const delimiterStream = new DelimiterStream(new TextEncoder().encode(","));
   * ```
   *
   * @example semicolon as a delimiter, and disposition set to `"suffix"`
   * ```ts no-assert
   * import { DelimiterStream } from "@std/streams/delimiter-stream";
   *
   * const delimiterStream = new DelimiterStream(new TextEncoder().encode(";"), {
   *   disposition: "suffix",
   * });
   * ```
   */ constructor(delimiter, options = {
    disposition: "discard"
  }){
    super({
      transform: (chunk, controller)=>delimiter.length === 1 ? this.#handleChar(chunk, controller) : this.#handle(chunk, controller),
      flush: (controller)=>this.#flush(controller)
    });
    this.#delimiter = delimiter;
    this.#delimLPS = delimiter.length > 1 ? createLPS(delimiter) : null;
    this.#disp = options.disposition ?? "discard";
  }
  #handle(chunk, controller) {
    const bufs = this.#bufs;
    const length = chunk.byteLength;
    const disposition = this.#disp;
    const delimiter = this.#delimiter;
    const delimLen = delimiter.length;
    const lps = this.#delimLPS;
    let chunkStart = 0;
    let matchIndex = this.#matchIndex;
    let inspectIndex = 0;
    while(inspectIndex < length){
      if (chunk[inspectIndex] === delimiter[matchIndex]) {
        // Next byte matched our next delimiter byte
        inspectIndex++;
        matchIndex++;
        if (matchIndex === delimLen) {
          // Full match
          matchIndex = 0;
          const delimiterStartIndex = inspectIndex - delimLen;
          const delimitedChunkEnd = disposition === "suffix" ? inspectIndex : delimiterStartIndex;
          if (delimitedChunkEnd <= 0 && bufs.length === 0) {
            // Our chunk started with a delimiter and no previous chunks exist:
            // Enqueue an empty chunk.
            controller.enqueue(new Uint8Array());
            chunkStart = disposition === "prefix" ? 0 : inspectIndex;
          } else if (delimitedChunkEnd > 0 && bufs.length === 0) {
            // No previous chunks, slice from current chunk.
            controller.enqueue(chunk.subarray(chunkStart, delimitedChunkEnd));
            // Our chunk may have more than one delimiter; we must remember where
            // the next delimited chunk begins.
            chunkStart = disposition === "prefix" ? delimiterStartIndex : inspectIndex;
          } else if (delimitedChunkEnd === 0 && bufs.length > 0) {
            // Our chunk started with a delimiter, previous chunks are passed as
            // they are (with concatenation).
            if (bufs.length === 1) {
              // Concat not needed when a single buffer is passed.
              controller.enqueue(bufs[0]);
            } else {
              controller.enqueue(concat(bufs));
            }
            // Drop all previous chunks.
            bufs.length = 0;
            if (disposition !== "prefix") {
              // suffix or discard: The next chunk starts where our inspection finished.
              // We should only ever end up here with a discard disposition as
              // for a suffix disposition this branch would mean that the previous
              // chunk ended with a full match but was not enqueued.
              chunkStart = inspectIndex;
            } else {
              chunkStart = 0;
            }
          } else if (delimitedChunkEnd < 0 && bufs.length > 0) {
            // Our chunk started by finishing a partial delimiter match.
            const lastIndex = bufs.length - 1;
            const last = bufs[lastIndex];
            const lastSliceIndex = last.byteLength + delimitedChunkEnd;
            const lastSliced = last.subarray(0, lastSliceIndex);
            if (lastIndex === 0) {
              controller.enqueue(lastSliced);
            } else {
              bufs[lastIndex] = lastSliced;
              controller.enqueue(concat(bufs));
            }
            bufs.length = 0;
            if (disposition === "prefix") {
              // Must keep last bytes of last chunk.
              bufs.push(last.subarray(lastSliceIndex));
              chunkStart = 0;
            } else {
              chunkStart = inspectIndex;
            }
          } else if (delimitedChunkEnd > 0 && bufs.length > 0) {
            // Previous chunks and current chunk together form a delimited chunk.
            const chunkSliced = chunk.subarray(chunkStart, delimitedChunkEnd);
            const result = concat([
              ...bufs,
              chunkSliced
            ]);
            bufs.length = 0;
            controller.enqueue(result);
            chunkStart = disposition === "prefix" ? delimitedChunkEnd : inspectIndex;
          } else {
            throw new Error("unreachable");
          }
        }
      } else if (matchIndex === 0) {
        // No match ongoing, keep going through the buffer.
        inspectIndex++;
      } else {
        // Ongoing match: Degrade to the previous possible match.
        // eg. If we're looking for 'AAB' and had matched 'AA' previously
        // but now got a new 'A', then we'll drop down to having matched
        // just 'A'. The while loop will turn around again and we'll rematch
        // to 'AA' and proceed onwards to try and match on 'B' again.
        matchIndex = lps[matchIndex - 1];
      }
    }
    // Save match index.
    this.#matchIndex = matchIndex;
    if (chunkStart === 0) {
      bufs.push(chunk);
    } else if (chunkStart < length) {
      // If we matched partially somewhere in the middle of our chunk
      // then the remnants should be pushed into buffers.
      bufs.push(chunk.subarray(chunkStart));
    }
  }
  /**
   * Optimized handler for a char delimited stream:
   *
   * For char delimited streams we do not need to keep track of
   * the match index, removing the need for a fair bit of work.
   */ #handleChar(chunk, controller) {
    const bufs = this.#bufs;
    const length = chunk.byteLength;
    const disposition = this.#disp;
    const delimiter = this.#delimiter[0];
    let chunkStart = 0;
    let inspectIndex = 0;
    while(inspectIndex < length){
      if (chunk[inspectIndex] === delimiter) {
        // Next byte matched our next delimiter
        inspectIndex++;
        /**
         * Always non-negative
         */ const delimitedChunkEnd = disposition === "suffix" ? inspectIndex : inspectIndex - 1;
        if (delimitedChunkEnd === 0 && bufs.length === 0) {
          // Our chunk started with a delimiter and no previous chunks exist:
          // Enqueue an empty chunk.
          controller.enqueue(new Uint8Array());
          chunkStart = disposition === "prefix" ? 0 : 1;
        } else if (delimitedChunkEnd > 0 && bufs.length === 0) {
          // No previous chunks, slice from current chunk.
          controller.enqueue(chunk.subarray(chunkStart, delimitedChunkEnd));
          // Our chunk may have more than one delimiter; we must remember where
          // the next delimited chunk begins.
          chunkStart = disposition === "prefix" ? inspectIndex - 1 : inspectIndex;
        } else if (delimitedChunkEnd === 0 && bufs.length > 0) {
          // Our chunk started with a delimiter, previous chunks are passed as
          // they are (with concatenation).
          if (bufs.length === 1) {
            // Concat not needed when a single buffer is passed.
            controller.enqueue(bufs[0]);
          } else {
            controller.enqueue(concat(bufs));
          }
          // Drop all previous chunks.
          bufs.length = 0;
          if (disposition !== "prefix") {
            // suffix or discard: The next chunk starts where our inspection finished.
            // We should only ever end up here with a discard disposition as
            // for a suffix disposition this branch would mean that the previous
            // chunk ended with a full match but was not enqueued.
            chunkStart = inspectIndex;
          }
        } else if (delimitedChunkEnd > 0 && bufs.length > 0) {
          // Previous chunks and current chunk together form a delimited chunk.
          const chunkSliced = chunk.subarray(chunkStart, delimitedChunkEnd);
          const result = concat([
            ...bufs,
            chunkSliced
          ]);
          bufs.length = 0;
          chunkStart = disposition === "prefix" ? delimitedChunkEnd : inspectIndex;
          controller.enqueue(result);
        } else {
          throw new Error("unreachable");
        }
      } else {
        inspectIndex++;
      }
    }
    if (chunkStart === 0) {
      bufs.push(chunk);
    } else if (chunkStart < length) {
      // If we matched partially somewhere in the middle of our chunk
      // then the remnants should be pushed into buffers.
      bufs.push(chunk.subarray(chunkStart));
    }
  }
  #flush(controller) {
    const bufs = this.#bufs;
    const length = bufs.length;
    if (length === 0) {
      controller.enqueue(new Uint8Array());
    } else if (length === 1) {
      controller.enqueue(bufs[0]);
    } else {
      controller.enqueue(concat(bufs));
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L2RlbGltaXRlcl9zdHJlYW0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgY29uY2F0IH0gZnJvbSBcImpzcjovQHN0ZC9ieXRlc0BeMS4wLjAtcmMuMy9jb25jYXRcIjtcbmltcG9ydCB7IGNyZWF0ZUxQUyB9IGZyb20gXCIuL19jb21tb24udHNcIjtcblxuLyoqIERpc3Bvc2l0aW9uIG9mIHRoZSBkZWxpbWl0ZXIgZm9yIHtAbGlua2NvZGUgRGVsaW1pdGVyU3RyZWFtT3B0aW9uc30uICovXG5leHBvcnQgdHlwZSBEZWxpbWl0ZXJEaXNwb3NpdGlvbiA9XG4gIC8qKiBJbmNsdWRlIGRlbGltaXRlciBpbiB0aGUgZm91bmQgY2h1bmsuICovXG4gIHwgXCJzdWZmaXhcIlxuICAvKiogSW5jbHVkZSBkZWxpbWl0ZXIgaW4gdGhlIHN1YnNlcXVlbnQgY2h1bmsuICovXG4gIHwgXCJwcmVmaXhcIlxuICAvKiogRGlzY2FyZCB0aGUgZGVsaW1pdGVyLiAqL1xuICB8IFwiZGlzY2FyZFwiIC8vIGRlbGltaXRlciBkaXNjYXJkZWRcbjtcblxuLyoqIE9wdGlvbnMgZm9yIHtAbGlua2NvZGUgRGVsaW1pdGVyU3RyZWFtfS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVsaW1pdGVyU3RyZWFtT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBEaXNwb3NpdGlvbiBvZiB0aGUgZGVsaW1pdGVyLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7XCJkaXNjYXJkXCJ9XG4gICAqL1xuICBkaXNwb3NpdGlvbj86IERlbGltaXRlckRpc3Bvc2l0aW9uO1xufVxuXG4vKipcbiAqIERpdmlkZSBhIHN0cmVhbSBpbnRvIGNodW5rcyBkZWxpbWl0ZWQgYnkgYSBnaXZlbiBieXRlIHNlcXVlbmNlLlxuICpcbiAqIElmIHlvdSBhcmUgd29ya2luZyB3aXRoIGEgc3RyZWFtIG9mIGBzdHJpbmdgLCBjb25zaWRlciB1c2luZyB7QGxpbmtjb2RlIFRleHREZWxpbWl0ZXJTdHJlYW19LlxuICpcbiAqIEBleGFtcGxlXG4gKiBEaXZpZGUgYSBDU1Ygc3RyZWFtIGJ5IGNvbW1hcywgZGlzY2FyZGluZyB0aGUgY29tbWFzOlxuICogYGBgdHNcbiAqIGltcG9ydCB7IERlbGltaXRlclN0cmVhbSB9IGZyb20gXCJAc3RkL3N0cmVhbXMvZGVsaW1pdGVyLXN0cmVhbVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBpbnB1dFN0cmVhbSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1wiZm9vLGJhclwiLCBcIixiYXpcIl0pO1xuICpcbiAqIGNvbnN0IHRyYW5zZm9ybWVkID0gaW5wdXRTdHJlYW0ucGlwZVRocm91Z2gobmV3IFRleHRFbmNvZGVyU3RyZWFtKCkpXG4gKiAgIC5waXBlVGhyb3VnaChuZXcgRGVsaW1pdGVyU3RyZWFtKG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcIixcIikpKVxuICogICAucGlwZVRocm91Z2gobmV3IFRleHREZWNvZGVyU3RyZWFtKCkpO1xuICpcbiAqIGFzc2VydEVxdWFscyhhd2FpdCBBcnJheS5mcm9tQXN5bmModHJhbnNmb3JtZWQpLCBbXCJmb29cIiwgXCJiYXJcIiwgXCJiYXpcIl0pO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGVcbiAqIERpdmlkZSBhIHN0cmVhbSBhZnRlciBzZW1pLWNvbG9ucywga2VlcGluZyB0aGUgc2VtaWNvbG9ucyBpbiB0aGUgb3V0cHV0OlxuICogYGBgdHNcbiAqIGltcG9ydCB7IERlbGltaXRlclN0cmVhbSB9IGZyb20gXCJAc3RkL3N0cmVhbXMvZGVsaW1pdGVyLXN0cmVhbVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBpbnB1dFN0cmVhbSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1wiZm9vO1wiLCBcImJhcjtiYXpcIiwgXCI7XCJdKTtcbiAqXG4gKiBjb25zdCB0cmFuc2Zvcm1lZCA9IGlucHV0U3RyZWFtLnBpcGVUaHJvdWdoKG5ldyBUZXh0RW5jb2RlclN0cmVhbSgpKVxuICogICAucGlwZVRocm91Z2goXG4gKiAgICAgbmV3IERlbGltaXRlclN0cmVhbShuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCI7XCIpLCB7XG4gKiAgICAgICBkaXNwb3NpdGlvbjogXCJzdWZmaXhcIixcbiAqICAgICB9KSxcbiAqICAgKS5waXBlVGhyb3VnaChuZXcgVGV4dERlY29kZXJTdHJlYW0oKSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGF3YWl0IEFycmF5LmZyb21Bc3luYyh0cmFuc2Zvcm1lZCksIFtcImZvbztcIiwgXCJiYXI7XCIsIFwiYmF6O1wiXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIERlbGltaXRlclN0cmVhbSBleHRlbmRzIFRyYW5zZm9ybVN0cmVhbTxVaW50OEFycmF5LCBVaW50OEFycmF5PiB7XG4gICNidWZzOiBVaW50OEFycmF5W10gPSBbXTtcbiAgI2RlbGltaXRlcjogVWludDhBcnJheTtcbiAgI21hdGNoSW5kZXggPSAwO1xuICAjZGVsaW1MUFM6IFVpbnQ4QXJyYXkgfCBudWxsO1xuICAjZGlzcDogRGVsaW1pdGVyRGlzcG9zaXRpb247XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBkZWxpbWl0ZXIgQSBkZWxpbWl0ZXIgdG8gc3BsaXQgdGhlIHN0cmVhbSBieS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgdGhlIGRlbGltaXRlciBzdHJlYW0uXG4gICAqXG4gICAqIEBleGFtcGxlIGNvbW1hIGFzIGEgZGVsaW1pdGVyXG4gICAqIGBgYHRzIG5vLWFzc2VydFxuICAgKiBpbXBvcnQgeyBEZWxpbWl0ZXJTdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL2RlbGltaXRlci1zdHJlYW1cIjtcbiAgICpcbiAgICogY29uc3QgZGVsaW1pdGVyU3RyZWFtID0gbmV3IERlbGltaXRlclN0cmVhbShuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCIsXCIpKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBleGFtcGxlIHNlbWljb2xvbiBhcyBhIGRlbGltaXRlciwgYW5kIGRpc3Bvc2l0aW9uIHNldCB0byBgXCJzdWZmaXhcImBcbiAgICogYGBgdHMgbm8tYXNzZXJ0XG4gICAqIGltcG9ydCB7IERlbGltaXRlclN0cmVhbSB9IGZyb20gXCJAc3RkL3N0cmVhbXMvZGVsaW1pdGVyLXN0cmVhbVwiO1xuICAgKlxuICAgKiBjb25zdCBkZWxpbWl0ZXJTdHJlYW0gPSBuZXcgRGVsaW1pdGVyU3RyZWFtKG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcIjtcIiksIHtcbiAgICogICBkaXNwb3NpdGlvbjogXCJzdWZmaXhcIixcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgZGVsaW1pdGVyOiBVaW50OEFycmF5LFxuICAgIG9wdGlvbnM6IERlbGltaXRlclN0cmVhbU9wdGlvbnMgPSB7IGRpc3Bvc2l0aW9uOiBcImRpc2NhcmRcIiB9LFxuICApIHtcbiAgICBzdXBlcih7XG4gICAgICB0cmFuc2Zvcm06IChjaHVuaywgY29udHJvbGxlcikgPT5cbiAgICAgICAgZGVsaW1pdGVyLmxlbmd0aCA9PT0gMVxuICAgICAgICAgID8gdGhpcy4jaGFuZGxlQ2hhcihjaHVuaywgY29udHJvbGxlcilcbiAgICAgICAgICA6IHRoaXMuI2hhbmRsZShjaHVuaywgY29udHJvbGxlciksXG4gICAgICBmbHVzaDogKGNvbnRyb2xsZXIpID0+IHRoaXMuI2ZsdXNoKGNvbnRyb2xsZXIpLFxuICAgIH0pO1xuXG4gICAgdGhpcy4jZGVsaW1pdGVyID0gZGVsaW1pdGVyO1xuICAgIHRoaXMuI2RlbGltTFBTID0gZGVsaW1pdGVyLmxlbmd0aCA+IDEgPyBjcmVhdGVMUFMoZGVsaW1pdGVyKSA6IG51bGw7XG4gICAgdGhpcy4jZGlzcCA9IG9wdGlvbnMuZGlzcG9zaXRpb24gPz8gXCJkaXNjYXJkXCI7XG4gIH1cblxuICAjaGFuZGxlKFxuICAgIGNodW5rOiBVaW50OEFycmF5LFxuICAgIGNvbnRyb2xsZXI6IFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyPFVpbnQ4QXJyYXk+LFxuICApIHtcbiAgICBjb25zdCBidWZzID0gdGhpcy4jYnVmcztcbiAgICBjb25zdCBsZW5ndGggPSBjaHVuay5ieXRlTGVuZ3RoO1xuICAgIGNvbnN0IGRpc3Bvc2l0aW9uID0gdGhpcy4jZGlzcDtcbiAgICBjb25zdCBkZWxpbWl0ZXIgPSB0aGlzLiNkZWxpbWl0ZXI7XG4gICAgY29uc3QgZGVsaW1MZW4gPSBkZWxpbWl0ZXIubGVuZ3RoO1xuICAgIGNvbnN0IGxwcyA9IHRoaXMuI2RlbGltTFBTIGFzIFVpbnQ4QXJyYXk7XG4gICAgbGV0IGNodW5rU3RhcnQgPSAwO1xuICAgIGxldCBtYXRjaEluZGV4ID0gdGhpcy4jbWF0Y2hJbmRleDtcbiAgICBsZXQgaW5zcGVjdEluZGV4ID0gMDtcbiAgICB3aGlsZSAoaW5zcGVjdEluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBpZiAoY2h1bmtbaW5zcGVjdEluZGV4XSA9PT0gZGVsaW1pdGVyW21hdGNoSW5kZXhdKSB7XG4gICAgICAgIC8vIE5leHQgYnl0ZSBtYXRjaGVkIG91ciBuZXh0IGRlbGltaXRlciBieXRlXG4gICAgICAgIGluc3BlY3RJbmRleCsrO1xuICAgICAgICBtYXRjaEluZGV4Kys7XG4gICAgICAgIGlmIChtYXRjaEluZGV4ID09PSBkZWxpbUxlbikge1xuICAgICAgICAgIC8vIEZ1bGwgbWF0Y2hcbiAgICAgICAgICBtYXRjaEluZGV4ID0gMDtcbiAgICAgICAgICBjb25zdCBkZWxpbWl0ZXJTdGFydEluZGV4ID0gaW5zcGVjdEluZGV4IC0gZGVsaW1MZW47XG4gICAgICAgICAgY29uc3QgZGVsaW1pdGVkQ2h1bmtFbmQgPSBkaXNwb3NpdGlvbiA9PT0gXCJzdWZmaXhcIlxuICAgICAgICAgICAgPyBpbnNwZWN0SW5kZXhcbiAgICAgICAgICAgIDogZGVsaW1pdGVyU3RhcnRJbmRleDtcbiAgICAgICAgICBpZiAoZGVsaW1pdGVkQ2h1bmtFbmQgPD0gMCAmJiBidWZzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gT3VyIGNodW5rIHN0YXJ0ZWQgd2l0aCBhIGRlbGltaXRlciBhbmQgbm8gcHJldmlvdXMgY2h1bmtzIGV4aXN0OlxuICAgICAgICAgICAgLy8gRW5xdWV1ZSBhbiBlbXB0eSBjaHVuay5cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShuZXcgVWludDhBcnJheSgpKTtcbiAgICAgICAgICAgIGNodW5rU3RhcnQgPSBkaXNwb3NpdGlvbiA9PT0gXCJwcmVmaXhcIiA/IDAgOiBpbnNwZWN0SW5kZXg7XG4gICAgICAgICAgfSBlbHNlIGlmIChkZWxpbWl0ZWRDaHVua0VuZCA+IDAgJiYgYnVmcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIC8vIE5vIHByZXZpb3VzIGNodW5rcywgc2xpY2UgZnJvbSBjdXJyZW50IGNodW5rLlxuICAgICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGNodW5rLnN1YmFycmF5KGNodW5rU3RhcnQsIGRlbGltaXRlZENodW5rRW5kKSk7XG4gICAgICAgICAgICAvLyBPdXIgY2h1bmsgbWF5IGhhdmUgbW9yZSB0aGFuIG9uZSBkZWxpbWl0ZXI7IHdlIG11c3QgcmVtZW1iZXIgd2hlcmVcbiAgICAgICAgICAgIC8vIHRoZSBuZXh0IGRlbGltaXRlZCBjaHVuayBiZWdpbnMuXG4gICAgICAgICAgICBjaHVua1N0YXJ0ID0gZGlzcG9zaXRpb24gPT09IFwicHJlZml4XCJcbiAgICAgICAgICAgICAgPyBkZWxpbWl0ZXJTdGFydEluZGV4XG4gICAgICAgICAgICAgIDogaW5zcGVjdEluZGV4O1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGVsaW1pdGVkQ2h1bmtFbmQgPT09IDAgJiYgYnVmcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBPdXIgY2h1bmsgc3RhcnRlZCB3aXRoIGEgZGVsaW1pdGVyLCBwcmV2aW91cyBjaHVua3MgYXJlIHBhc3NlZCBhc1xuICAgICAgICAgICAgLy8gdGhleSBhcmUgKHdpdGggY29uY2F0ZW5hdGlvbikuXG4gICAgICAgICAgICBpZiAoYnVmcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgLy8gQ29uY2F0IG5vdCBuZWVkZWQgd2hlbiBhIHNpbmdsZSBidWZmZXIgaXMgcGFzc2VkLlxuICAgICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoYnVmc1swXSEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGNvbmNhdChidWZzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEcm9wIGFsbCBwcmV2aW91cyBjaHVua3MuXG4gICAgICAgICAgICBidWZzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBpZiAoZGlzcG9zaXRpb24gIT09IFwicHJlZml4XCIpIHtcbiAgICAgICAgICAgICAgLy8gc3VmZml4IG9yIGRpc2NhcmQ6IFRoZSBuZXh0IGNodW5rIHN0YXJ0cyB3aGVyZSBvdXIgaW5zcGVjdGlvbiBmaW5pc2hlZC5cbiAgICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIG9ubHkgZXZlciBlbmQgdXAgaGVyZSB3aXRoIGEgZGlzY2FyZCBkaXNwb3NpdGlvbiBhc1xuICAgICAgICAgICAgICAvLyBmb3IgYSBzdWZmaXggZGlzcG9zaXRpb24gdGhpcyBicmFuY2ggd291bGQgbWVhbiB0aGF0IHRoZSBwcmV2aW91c1xuICAgICAgICAgICAgICAvLyBjaHVuayBlbmRlZCB3aXRoIGEgZnVsbCBtYXRjaCBidXQgd2FzIG5vdCBlbnF1ZXVlZC5cbiAgICAgICAgICAgICAgY2h1bmtTdGFydCA9IGluc3BlY3RJbmRleDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNodW5rU3RhcnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoZGVsaW1pdGVkQ2h1bmtFbmQgPCAwICYmIGJ1ZnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gT3VyIGNodW5rIHN0YXJ0ZWQgYnkgZmluaXNoaW5nIGEgcGFydGlhbCBkZWxpbWl0ZXIgbWF0Y2guXG4gICAgICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBidWZzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBjb25zdCBsYXN0ID0gYnVmc1tsYXN0SW5kZXhdITtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RTbGljZUluZGV4ID0gbGFzdC5ieXRlTGVuZ3RoICsgZGVsaW1pdGVkQ2h1bmtFbmQ7XG4gICAgICAgICAgICBjb25zdCBsYXN0U2xpY2VkID0gbGFzdC5zdWJhcnJheSgwLCBsYXN0U2xpY2VJbmRleCk7XG4gICAgICAgICAgICBpZiAobGFzdEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShsYXN0U2xpY2VkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGJ1ZnNbbGFzdEluZGV4XSA9IGxhc3RTbGljZWQ7XG4gICAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjb25jYXQoYnVmcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnVmcy5sZW5ndGggPSAwO1xuICAgICAgICAgICAgaWYgKGRpc3Bvc2l0aW9uID09PSBcInByZWZpeFwiKSB7XG4gICAgICAgICAgICAgIC8vIE11c3Qga2VlcCBsYXN0IGJ5dGVzIG9mIGxhc3QgY2h1bmsuXG4gICAgICAgICAgICAgIGJ1ZnMucHVzaChsYXN0LnN1YmFycmF5KGxhc3RTbGljZUluZGV4KSk7XG4gICAgICAgICAgICAgIGNodW5rU3RhcnQgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2h1bmtTdGFydCA9IGluc3BlY3RJbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGRlbGltaXRlZENodW5rRW5kID4gMCAmJiBidWZzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIFByZXZpb3VzIGNodW5rcyBhbmQgY3VycmVudCBjaHVuayB0b2dldGhlciBmb3JtIGEgZGVsaW1pdGVkIGNodW5rLlxuICAgICAgICAgICAgY29uc3QgY2h1bmtTbGljZWQgPSBjaHVuay5zdWJhcnJheShjaHVua1N0YXJ0LCBkZWxpbWl0ZWRDaHVua0VuZCk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjb25jYXQoWy4uLmJ1ZnMsIGNodW5rU2xpY2VkXSk7XG4gICAgICAgICAgICBidWZzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUocmVzdWx0KTtcbiAgICAgICAgICAgIGNodW5rU3RhcnQgPSBkaXNwb3NpdGlvbiA9PT0gXCJwcmVmaXhcIlxuICAgICAgICAgICAgICA/IGRlbGltaXRlZENodW5rRW5kXG4gICAgICAgICAgICAgIDogaW5zcGVjdEluZGV4O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bnJlYWNoYWJsZVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobWF0Y2hJbmRleCA9PT0gMCkge1xuICAgICAgICAvLyBObyBtYXRjaCBvbmdvaW5nLCBrZWVwIGdvaW5nIHRocm91Z2ggdGhlIGJ1ZmZlci5cbiAgICAgICAgaW5zcGVjdEluZGV4Kys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBPbmdvaW5nIG1hdGNoOiBEZWdyYWRlIHRvIHRoZSBwcmV2aW91cyBwb3NzaWJsZSBtYXRjaC5cbiAgICAgICAgLy8gZWcuIElmIHdlJ3JlIGxvb2tpbmcgZm9yICdBQUInIGFuZCBoYWQgbWF0Y2hlZCAnQUEnIHByZXZpb3VzbHlcbiAgICAgICAgLy8gYnV0IG5vdyBnb3QgYSBuZXcgJ0EnLCB0aGVuIHdlJ2xsIGRyb3AgZG93biB0byBoYXZpbmcgbWF0Y2hlZFxuICAgICAgICAvLyBqdXN0ICdBJy4gVGhlIHdoaWxlIGxvb3Agd2lsbCB0dXJuIGFyb3VuZCBhZ2FpbiBhbmQgd2UnbGwgcmVtYXRjaFxuICAgICAgICAvLyB0byAnQUEnIGFuZCBwcm9jZWVkIG9ud2FyZHMgdG8gdHJ5IGFuZCBtYXRjaCBvbiAnQicgYWdhaW4uXG4gICAgICAgIG1hdGNoSW5kZXggPSBscHNbbWF0Y2hJbmRleCAtIDFdITtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gU2F2ZSBtYXRjaCBpbmRleC5cbiAgICB0aGlzLiNtYXRjaEluZGV4ID0gbWF0Y2hJbmRleDtcbiAgICBpZiAoY2h1bmtTdGFydCA9PT0gMCkge1xuICAgICAgYnVmcy5wdXNoKGNodW5rKTtcbiAgICB9IGVsc2UgaWYgKGNodW5rU3RhcnQgPCBsZW5ndGgpIHtcbiAgICAgIC8vIElmIHdlIG1hdGNoZWQgcGFydGlhbGx5IHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlIG9mIG91ciBjaHVua1xuICAgICAgLy8gdGhlbiB0aGUgcmVtbmFudHMgc2hvdWxkIGJlIHB1c2hlZCBpbnRvIGJ1ZmZlcnMuXG4gICAgICBidWZzLnB1c2goY2h1bmsuc3ViYXJyYXkoY2h1bmtTdGFydCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcHRpbWl6ZWQgaGFuZGxlciBmb3IgYSBjaGFyIGRlbGltaXRlZCBzdHJlYW06XG4gICAqXG4gICAqIEZvciBjaGFyIGRlbGltaXRlZCBzdHJlYW1zIHdlIGRvIG5vdCBuZWVkIHRvIGtlZXAgdHJhY2sgb2ZcbiAgICogdGhlIG1hdGNoIGluZGV4LCByZW1vdmluZyB0aGUgbmVlZCBmb3IgYSBmYWlyIGJpdCBvZiB3b3JrLlxuICAgKi9cbiAgI2hhbmRsZUNoYXIoXG4gICAgY2h1bms6IFVpbnQ4QXJyYXksXG4gICAgY29udHJvbGxlcjogVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXI8VWludDhBcnJheT4sXG4gICkge1xuICAgIGNvbnN0IGJ1ZnMgPSB0aGlzLiNidWZzO1xuICAgIGNvbnN0IGxlbmd0aCA9IGNodW5rLmJ5dGVMZW5ndGg7XG4gICAgY29uc3QgZGlzcG9zaXRpb24gPSB0aGlzLiNkaXNwO1xuICAgIGNvbnN0IGRlbGltaXRlciA9IHRoaXMuI2RlbGltaXRlclswXTtcbiAgICBsZXQgY2h1bmtTdGFydCA9IDA7XG4gICAgbGV0IGluc3BlY3RJbmRleCA9IDA7XG4gICAgd2hpbGUgKGluc3BlY3RJbmRleCA8IGxlbmd0aCkge1xuICAgICAgaWYgKGNodW5rW2luc3BlY3RJbmRleF0gPT09IGRlbGltaXRlcikge1xuICAgICAgICAvLyBOZXh0IGJ5dGUgbWF0Y2hlZCBvdXIgbmV4dCBkZWxpbWl0ZXJcbiAgICAgICAgaW5zcGVjdEluZGV4Kys7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBbHdheXMgbm9uLW5lZ2F0aXZlXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBkZWxpbWl0ZWRDaHVua0VuZCA9IGRpc3Bvc2l0aW9uID09PSBcInN1ZmZpeFwiXG4gICAgICAgICAgPyBpbnNwZWN0SW5kZXhcbiAgICAgICAgICA6IGluc3BlY3RJbmRleCAtIDE7XG4gICAgICAgIGlmIChkZWxpbWl0ZWRDaHVua0VuZCA9PT0gMCAmJiBidWZzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIC8vIE91ciBjaHVuayBzdGFydGVkIHdpdGggYSBkZWxpbWl0ZXIgYW5kIG5vIHByZXZpb3VzIGNodW5rcyBleGlzdDpcbiAgICAgICAgICAvLyBFbnF1ZXVlIGFuIGVtcHR5IGNodW5rLlxuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShuZXcgVWludDhBcnJheSgpKTtcbiAgICAgICAgICBjaHVua1N0YXJ0ID0gZGlzcG9zaXRpb24gPT09IFwicHJlZml4XCIgPyAwIDogMTtcbiAgICAgICAgfSBlbHNlIGlmIChkZWxpbWl0ZWRDaHVua0VuZCA+IDAgJiYgYnVmcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAvLyBObyBwcmV2aW91cyBjaHVua3MsIHNsaWNlIGZyb20gY3VycmVudCBjaHVuay5cbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmsuc3ViYXJyYXkoY2h1bmtTdGFydCwgZGVsaW1pdGVkQ2h1bmtFbmQpKTtcbiAgICAgICAgICAvLyBPdXIgY2h1bmsgbWF5IGhhdmUgbW9yZSB0aGFuIG9uZSBkZWxpbWl0ZXI7IHdlIG11c3QgcmVtZW1iZXIgd2hlcmVcbiAgICAgICAgICAvLyB0aGUgbmV4dCBkZWxpbWl0ZWQgY2h1bmsgYmVnaW5zLlxuICAgICAgICAgIGNodW5rU3RhcnQgPSBkaXNwb3NpdGlvbiA9PT0gXCJwcmVmaXhcIlxuICAgICAgICAgICAgPyBpbnNwZWN0SW5kZXggLSAxXG4gICAgICAgICAgICA6IGluc3BlY3RJbmRleDtcbiAgICAgICAgfSBlbHNlIGlmIChkZWxpbWl0ZWRDaHVua0VuZCA9PT0gMCAmJiBidWZzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvLyBPdXIgY2h1bmsgc3RhcnRlZCB3aXRoIGEgZGVsaW1pdGVyLCBwcmV2aW91cyBjaHVua3MgYXJlIHBhc3NlZCBhc1xuICAgICAgICAgIC8vIHRoZXkgYXJlICh3aXRoIGNvbmNhdGVuYXRpb24pLlxuICAgICAgICAgIGlmIChidWZzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgLy8gQ29uY2F0IG5vdCBuZWVkZWQgd2hlbiBhIHNpbmdsZSBidWZmZXIgaXMgcGFzc2VkLlxuICAgICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGJ1ZnNbMF0hKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGNvbmNhdChidWZzKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIERyb3AgYWxsIHByZXZpb3VzIGNodW5rcy5cbiAgICAgICAgICBidWZzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgaWYgKGRpc3Bvc2l0aW9uICE9PSBcInByZWZpeFwiKSB7XG4gICAgICAgICAgICAvLyBzdWZmaXggb3IgZGlzY2FyZDogVGhlIG5leHQgY2h1bmsgc3RhcnRzIHdoZXJlIG91ciBpbnNwZWN0aW9uIGZpbmlzaGVkLlxuICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIG9ubHkgZXZlciBlbmQgdXAgaGVyZSB3aXRoIGEgZGlzY2FyZCBkaXNwb3NpdGlvbiBhc1xuICAgICAgICAgICAgLy8gZm9yIGEgc3VmZml4IGRpc3Bvc2l0aW9uIHRoaXMgYnJhbmNoIHdvdWxkIG1lYW4gdGhhdCB0aGUgcHJldmlvdXNcbiAgICAgICAgICAgIC8vIGNodW5rIGVuZGVkIHdpdGggYSBmdWxsIG1hdGNoIGJ1dCB3YXMgbm90IGVucXVldWVkLlxuICAgICAgICAgICAgY2h1bmtTdGFydCA9IGluc3BlY3RJbmRleDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZGVsaW1pdGVkQ2h1bmtFbmQgPiAwICYmIGJ1ZnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIFByZXZpb3VzIGNodW5rcyBhbmQgY3VycmVudCBjaHVuayB0b2dldGhlciBmb3JtIGEgZGVsaW1pdGVkIGNodW5rLlxuICAgICAgICAgIGNvbnN0IGNodW5rU2xpY2VkID0gY2h1bmsuc3ViYXJyYXkoY2h1bmtTdGFydCwgZGVsaW1pdGVkQ2h1bmtFbmQpO1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbmNhdChbLi4uYnVmcywgY2h1bmtTbGljZWRdKTtcbiAgICAgICAgICBidWZzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgY2h1bmtTdGFydCA9IGRpc3Bvc2l0aW9uID09PSBcInByZWZpeFwiXG4gICAgICAgICAgICA/IGRlbGltaXRlZENodW5rRW5kXG4gICAgICAgICAgICA6IGluc3BlY3RJbmRleDtcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bnJlYWNoYWJsZVwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5zcGVjdEluZGV4Kys7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjaHVua1N0YXJ0ID09PSAwKSB7XG4gICAgICBidWZzLnB1c2goY2h1bmspO1xuICAgIH0gZWxzZSBpZiAoY2h1bmtTdGFydCA8IGxlbmd0aCkge1xuICAgICAgLy8gSWYgd2UgbWF0Y2hlZCBwYXJ0aWFsbHkgc29tZXdoZXJlIGluIHRoZSBtaWRkbGUgb2Ygb3VyIGNodW5rXG4gICAgICAvLyB0aGVuIHRoZSByZW1uYW50cyBzaG91bGQgYmUgcHVzaGVkIGludG8gYnVmZmVycy5cbiAgICAgIGJ1ZnMucHVzaChjaHVuay5zdWJhcnJheShjaHVua1N0YXJ0KSk7XG4gICAgfVxuICB9XG5cbiAgI2ZsdXNoKGNvbnRyb2xsZXI6IFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyPFVpbnQ4QXJyYXk+KSB7XG4gICAgY29uc3QgYnVmcyA9IHRoaXMuI2J1ZnM7XG4gICAgY29uc3QgbGVuZ3RoID0gYnVmcy5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgY29udHJvbGxlci5lbnF1ZXVlKG5ldyBVaW50OEFycmF5KCkpO1xuICAgIH0gZWxzZSBpZiAobGVuZ3RoID09PSAxKSB7XG4gICAgICBjb250cm9sbGVyLmVucXVldWUoYnVmc1swXSEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250cm9sbGVyLmVucXVldWUoY29uY2F0KGJ1ZnMpKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsTUFBTSxRQUFRLHFDQUFx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
// denoCacheMetadata=17147411427868310930,17045526278792347747