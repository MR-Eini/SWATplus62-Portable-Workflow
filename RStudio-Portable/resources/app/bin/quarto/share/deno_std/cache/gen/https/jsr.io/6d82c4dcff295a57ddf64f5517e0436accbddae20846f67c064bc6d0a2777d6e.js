// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
const decoder = new TextDecoder();
/**
 * Writer utility for buffering string chunks.
 *
 * @example Usage
 * ```ts
 * import {
 *   copyN,
 *   StringReader,
 *   StringWriter,
 * } from "@std/io";
 * import { copy } from "@std/io/copy";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const w = new StringWriter("base");
 * const r = new StringReader("0123456789");
 * await copyN(r, w, 4); // copy 4 bytes
 *
 * assertEquals(w.toString(), "base0123");
 *
 * await copy(r, w); // copy all
 * assertEquals(w.toString(), "base0123456789");
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export class StringWriter {
  #chunks = [];
  #byteLength = 0;
  #cache;
  #base;
  /**
   * Construct a new instance.
   *
   * @param base The base string to write to the buffer.
   */ constructor(base = ""){
    const c = new TextEncoder().encode(base);
    this.#chunks.push(c);
    this.#byteLength += c.byteLength;
    this.#base = base;
  }
  /**
   * Writes the bytes to the buffer asynchronously.
   *
   * @example Usage
   * ```ts
   * import { StringWriter } from "@std/io/string-writer";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const w = new StringWriter("base");
   * await w.write(new TextEncoder().encode("0123"));
   * assertEquals(w.toString(), "base0123");
   * ```
   *
   * @param p The bytes to write to the buffer.
   * @returns The number of bytes written to the buffer in total.
   */ write(p) {
    return Promise.resolve(this.writeSync(p));
  }
  /**
   * Writes the bytes to the buffer synchronously.
   *
   * @example Usage
   * ```ts
   * import { StringWriter } from "@std/io/string-writer";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const w = new StringWriter("base");
   * w.writeSync(new TextEncoder().encode("0123"));
   * assertEquals(w.toString(), "base0123");
   * ```
   *
   * @param p The bytes to write to the buffer.
   * @returns The number of bytes written to the buffer in total.
   */ writeSync(p) {
    this.#chunks.push(new Uint8Array(p));
    this.#byteLength += p.byteLength;
    this.#cache = undefined;
    return p.byteLength;
  }
  /**
   * Returns the string written to the buffer.
   *
   * @example Usage
   * ```ts
   * import { StringWriter } from "@std/io/string-writer";
   * import { assertEquals } from "@std/assert/equals";
   *
   * const w = new StringWriter("base");
   * await w.write(new TextEncoder().encode("0123"));
   * assertEquals(w.toString(), "base0123");
   * ```
   *
   * @returns the string written to the buffer.
   */ toString() {
    if (this.#cache) {
      return this.#cache;
    }
    const buf = new Uint8Array(this.#byteLength);
    let offs = 0;
    for (const chunk of this.#chunks){
      buf.set(chunk, offs);
      offs += chunk.byteLength;
    }
    this.#cache = decoder.decode(buf);
    return this.#cache;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9zdHJpbmdfd3JpdGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB0eXBlIHsgV3JpdGVyLCBXcml0ZXJTeW5jIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcblxuY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuXG4vKipcbiAqIFdyaXRlciB1dGlsaXR5IGZvciBidWZmZXJpbmcgc3RyaW5nIGNodW5rcy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7XG4gKiAgIGNvcHlOLFxuICogICBTdHJpbmdSZWFkZXIsXG4gKiAgIFN0cmluZ1dyaXRlcixcbiAqIH0gZnJvbSBcIkBzdGQvaW9cIjtcbiAqIGltcG9ydCB7IGNvcHkgfSBmcm9tIFwiQHN0ZC9pby9jb3B5XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvZXF1YWxzXCI7XG4gKlxuICogY29uc3QgdyA9IG5ldyBTdHJpbmdXcml0ZXIoXCJiYXNlXCIpO1xuICogY29uc3QgciA9IG5ldyBTdHJpbmdSZWFkZXIoXCIwMTIzNDU2Nzg5XCIpO1xuICogYXdhaXQgY29weU4ociwgdywgNCk7IC8vIGNvcHkgNCBieXRlc1xuICpcbiAqIGFzc2VydEVxdWFscyh3LnRvU3RyaW5nKCksIFwiYmFzZTAxMjNcIik7XG4gKlxuICogYXdhaXQgY29weShyLCB3KTsgLy8gY29weSBhbGxcbiAqIGFzc2VydEVxdWFscyh3LnRvU3RyaW5nKCksIFwiYmFzZTAxMjM0NTY3ODlcIik7XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0cmVhbXNfQVBJIHwgV2ViIFN0cmVhbXMgQVBJfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgY2xhc3MgU3RyaW5nV3JpdGVyIGltcGxlbWVudHMgV3JpdGVyLCBXcml0ZXJTeW5jIHtcbiAgI2NodW5rczogVWludDhBcnJheVtdID0gW107XG4gICNieXRlTGVuZ3RoID0gMDtcbiAgI2NhY2hlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICNiYXNlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIGJhc2UgVGhlIGJhc2Ugc3RyaW5nIHRvIHdyaXRlIHRvIHRoZSBidWZmZXIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihiYXNlID0gXCJcIikge1xuICAgIGNvbnN0IGMgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoYmFzZSk7XG4gICAgdGhpcy4jY2h1bmtzLnB1c2goYyk7XG4gICAgdGhpcy4jYnl0ZUxlbmd0aCArPSBjLmJ5dGVMZW5ndGg7XG4gICAgdGhpcy4jYmFzZSA9IGJhc2U7XG4gIH1cblxuICAvKipcbiAgICogV3JpdGVzIHRoZSBieXRlcyB0byB0aGUgYnVmZmVyIGFzeW5jaHJvbm91c2x5LlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBTdHJpbmdXcml0ZXIgfSBmcm9tIFwiQHN0ZC9pby9zdHJpbmctd3JpdGVyXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9lcXVhbHNcIjtcbiAgICpcbiAgICogY29uc3QgdyA9IG5ldyBTdHJpbmdXcml0ZXIoXCJiYXNlXCIpO1xuICAgKiBhd2FpdCB3LndyaXRlKG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcIjAxMjNcIikpO1xuICAgKiBhc3NlcnRFcXVhbHMody50b1N0cmluZygpLCBcImJhc2UwMTIzXCIpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHAgVGhlIGJ5dGVzIHRvIHdyaXRlIHRvIHRoZSBidWZmZXIuXG4gICAqIEByZXR1cm5zIFRoZSBudW1iZXIgb2YgYnl0ZXMgd3JpdHRlbiB0byB0aGUgYnVmZmVyIGluIHRvdGFsLlxuICAgKi9cbiAgd3JpdGUocDogVWludDhBcnJheSk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLndyaXRlU3luYyhwKSk7XG4gIH1cblxuICAvKipcbiAgICogV3JpdGVzIHRoZSBieXRlcyB0byB0aGUgYnVmZmVyIHN5bmNocm9ub3VzbHkuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IFN0cmluZ1dyaXRlciB9IGZyb20gXCJAc3RkL2lvL3N0cmluZy13cml0ZXJcIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCB3ID0gbmV3IFN0cmluZ1dyaXRlcihcImJhc2VcIik7XG4gICAqIHcud3JpdGVTeW5jKG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcIjAxMjNcIikpO1xuICAgKiBhc3NlcnRFcXVhbHMody50b1N0cmluZygpLCBcImJhc2UwMTIzXCIpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHAgVGhlIGJ5dGVzIHRvIHdyaXRlIHRvIHRoZSBidWZmZXIuXG4gICAqIEByZXR1cm5zIFRoZSBudW1iZXIgb2YgYnl0ZXMgd3JpdHRlbiB0byB0aGUgYnVmZmVyIGluIHRvdGFsLlxuICAgKi9cbiAgd3JpdGVTeW5jKHA6IFVpbnQ4QXJyYXkpOiBudW1iZXIge1xuICAgIHRoaXMuI2NodW5rcy5wdXNoKG5ldyBVaW50OEFycmF5KHApKTtcbiAgICB0aGlzLiNieXRlTGVuZ3RoICs9IHAuYnl0ZUxlbmd0aDtcbiAgICB0aGlzLiNjYWNoZSA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcC5ieXRlTGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0cmluZyB3cml0dGVuIHRvIHRoZSBidWZmZXIuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IFN0cmluZ1dyaXRlciB9IGZyb20gXCJAc3RkL2lvL3N0cmluZy13cml0ZXJcIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCB3ID0gbmV3IFN0cmluZ1dyaXRlcihcImJhc2VcIik7XG4gICAqIGF3YWl0IHcud3JpdGUobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFwiMDEyM1wiKSk7XG4gICAqIGFzc2VydEVxdWFscyh3LnRvU3RyaW5nKCksIFwiYmFzZTAxMjNcIik7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgc3RyaW5nIHdyaXR0ZW4gdG8gdGhlIGJ1ZmZlci5cbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuI2NhY2hlKSB7XG4gICAgICByZXR1cm4gdGhpcy4jY2FjaGU7XG4gICAgfVxuICAgIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMuI2J5dGVMZW5ndGgpO1xuICAgIGxldCBvZmZzID0gMDtcbiAgICBmb3IgKGNvbnN0IGNodW5rIG9mIHRoaXMuI2NodW5rcykge1xuICAgICAgYnVmLnNldChjaHVuaywgb2Zmcyk7XG4gICAgICBvZmZzICs9IGNodW5rLmJ5dGVMZW5ndGg7XG4gICAgfVxuICAgIHRoaXMuI2NhY2hlID0gZGVjb2Rlci5kZWNvZGUoYnVmKTtcbiAgICByZXR1cm4gdGhpcy4jY2FjaGU7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBSXJDLE1BQU0sVUFBVSxJQUFJO0FBRXBCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3QkMsR0FDRCxPQUFPLE1BQU07RUFDWCxDQUFBLE1BQU8sR0FBaUIsRUFBRSxDQUFDO0VBQzNCLENBQUEsVUFBVyxHQUFHLEVBQUU7RUFDaEIsQ0FBQSxLQUFNLENBQXFCO0VBQzNCLENBQUEsSUFBSyxDQUFTO0VBRWQ7Ozs7R0FJQyxHQUNELFlBQVksT0FBTyxFQUFFLENBQUU7SUFDckIsTUFBTSxJQUFJLElBQUksY0FBYyxNQUFNLENBQUM7SUFDbkMsSUFBSSxDQUFDLENBQUEsTUFBTyxDQUFDLElBQUksQ0FBQztJQUNsQixJQUFJLENBQUMsQ0FBQSxVQUFXLElBQUksRUFBRSxVQUFVO0lBQ2hDLElBQUksQ0FBQyxDQUFBLElBQUssR0FBRztFQUNmO0VBRUE7Ozs7Ozs7Ozs7Ozs7OztHQWVDLEdBQ0QsTUFBTSxDQUFhLEVBQW1CO0lBQ3BDLE9BQU8sUUFBUSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztFQUN4QztFQUVBOzs7Ozs7Ozs7Ozs7Ozs7R0FlQyxHQUNELFVBQVUsQ0FBYSxFQUFVO0lBQy9CLElBQUksQ0FBQyxDQUFBLE1BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxXQUFXO0lBQ2pDLElBQUksQ0FBQyxDQUFBLFVBQVcsSUFBSSxFQUFFLFVBQVU7SUFDaEMsSUFBSSxDQUFDLENBQUEsS0FBTSxHQUFHO0lBQ2QsT0FBTyxFQUFFLFVBQVU7RUFDckI7RUFFQTs7Ozs7Ozs7Ozs7Ozs7R0FjQyxHQUNELFdBQW1CO0lBQ2pCLElBQUksSUFBSSxDQUFDLENBQUEsS0FBTSxFQUFFO01BQ2YsT0FBTyxJQUFJLENBQUMsQ0FBQSxLQUFNO0lBQ3BCO0lBQ0EsTUFBTSxNQUFNLElBQUksV0FBVyxJQUFJLENBQUMsQ0FBQSxVQUFXO0lBQzNDLElBQUksT0FBTztJQUNYLEtBQUssTUFBTSxTQUFTLElBQUksQ0FBQyxDQUFBLE1BQU8sQ0FBRTtNQUNoQyxJQUFJLEdBQUcsQ0FBQyxPQUFPO01BQ2YsUUFBUSxNQUFNLFVBQVU7SUFDMUI7SUFDQSxJQUFJLENBQUMsQ0FBQSxLQUFNLEdBQUcsUUFBUSxNQUFNLENBQUM7SUFDN0IsT0FBTyxJQUFJLENBQUMsQ0FBQSxLQUFNO0VBQ3BCO0FBQ0YifQ==
// denoCacheMetadata=15388481546378335521,11353684645642484292