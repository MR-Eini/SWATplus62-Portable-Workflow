// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { Buffer } from "jsr:/@std/io@^0.224.1/buffer";
import { writeAll } from "jsr:/@std/io@^0.224.1/write-all";
/**
 * Create a {@linkcode https://jsr.io/@std/io/doc/types/~/Reader | Reader} from an iterable of {@linkcode Uint8Array}s.
 *
 * @param iterable An iterable or async iterable of `Uint8Array`s to convert into a `Reader`.
 * @returns A `Reader` that reads from the iterable.
 *
 * @example Write `Deno.build` information to the blackhole 3 times every second
 * ```ts no-eval no-assert
 * import { readerFromIterable } from "@std/streams/reader-from-iterable";
 * import { copy } from "@std/io/copy";
 * import { delay } from "@std/async/delay";
 * import { devNull } from "node:os";
 *
 * const reader = readerFromIterable((async function* () {
 *   for (let i = 0; i < 3; i++) {
 *     await delay(1000);
 *     const message = `data: ${JSON.stringify(Deno.build)}\n\n`;
 *     yield new TextEncoder().encode(message);
 *   }
 * })());
 *
 * using blackhole = await Deno.open(devNull, { write: true });
 * await copy(reader, blackhole);
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode ReadableStream.from} instead.
 */ export function readerFromIterable(iterable) {
  const iterator = iterable[Symbol.asyncIterator]?.() ?? iterable[Symbol.iterator]?.();
  const buffer = new Buffer();
  return {
    async read (p) {
      if (buffer.length === 0) {
        const result = await iterator.next();
        if (result.done) {
          return null;
        } else {
          if (result.value.byteLength <= p.byteLength) {
            p.set(result.value);
            return result.value.byteLength;
          }
          p.set(result.value.subarray(0, p.byteLength));
          await writeAll(buffer, result.value.subarray(p.byteLength));
          return p.byteLength;
        }
      } else {
        const n = await buffer.read(p);
        if (n === null) {
          return this.read(p);
        }
        return n;
      }
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L3JlYWRlcl9mcm9tX2l0ZXJhYmxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJqc3I6L0BzdGQvaW9AXjAuMjI0LjEvYnVmZmVyXCI7XG5pbXBvcnQgeyB3cml0ZUFsbCB9IGZyb20gXCJqc3I6L0BzdGQvaW9AXjAuMjI0LjEvd3JpdGUtYWxsXCI7XG5pbXBvcnQgdHlwZSB7IFJlYWRlciB9IGZyb20gXCJqc3I6L0BzdGQvaW9AXjAuMjI0LjEvdHlwZXNcIjtcblxuLyoqXG4gKiBDcmVhdGUgYSB7QGxpbmtjb2RlIGh0dHBzOi8vanNyLmlvL0BzdGQvaW8vZG9jL3R5cGVzL34vUmVhZGVyIHwgUmVhZGVyfSBmcm9tIGFuIGl0ZXJhYmxlIG9mIHtAbGlua2NvZGUgVWludDhBcnJheX1zLlxuICpcbiAqIEBwYXJhbSBpdGVyYWJsZSBBbiBpdGVyYWJsZSBvciBhc3luYyBpdGVyYWJsZSBvZiBgVWludDhBcnJheWBzIHRvIGNvbnZlcnQgaW50byBhIGBSZWFkZXJgLlxuICogQHJldHVybnMgQSBgUmVhZGVyYCB0aGF0IHJlYWRzIGZyb20gdGhlIGl0ZXJhYmxlLlxuICpcbiAqIEBleGFtcGxlIFdyaXRlIGBEZW5vLmJ1aWxkYCBpbmZvcm1hdGlvbiB0byB0aGUgYmxhY2tob2xlIDMgdGltZXMgZXZlcnkgc2Vjb25kXG4gKiBgYGB0cyBuby1ldmFsIG5vLWFzc2VydFxuICogaW1wb3J0IHsgcmVhZGVyRnJvbUl0ZXJhYmxlIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy9yZWFkZXItZnJvbS1pdGVyYWJsZVwiO1xuICogaW1wb3J0IHsgY29weSB9IGZyb20gXCJAc3RkL2lvL2NvcHlcIjtcbiAqIGltcG9ydCB7IGRlbGF5IH0gZnJvbSBcIkBzdGQvYXN5bmMvZGVsYXlcIjtcbiAqIGltcG9ydCB7IGRldk51bGwgfSBmcm9tIFwibm9kZTpvc1wiO1xuICpcbiAqIGNvbnN0IHJlYWRlciA9IHJlYWRlckZyb21JdGVyYWJsZSgoYXN5bmMgZnVuY3Rpb24qICgpIHtcbiAqICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAqICAgICBhd2FpdCBkZWxheSgxMDAwKTtcbiAqICAgICBjb25zdCBtZXNzYWdlID0gYGRhdGE6ICR7SlNPTi5zdHJpbmdpZnkoRGVuby5idWlsZCl9XFxuXFxuYDtcbiAqICAgICB5aWVsZCBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobWVzc2FnZSk7XG4gKiAgIH1cbiAqIH0pKCkpO1xuICpcbiAqIHVzaW5nIGJsYWNraG9sZSA9IGF3YWl0IERlbm8ub3BlbihkZXZOdWxsLCB7IHdyaXRlOiB0cnVlIH0pO1xuICogYXdhaXQgY29weShyZWFkZXIsIGJsYWNraG9sZSk7XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHtAbGlua2NvZGUgUmVhZGFibGVTdHJlYW0uZnJvbX0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlYWRlckZyb21JdGVyYWJsZShcbiAgaXRlcmFibGU6IEl0ZXJhYmxlPFVpbnQ4QXJyYXk+IHwgQXN5bmNJdGVyYWJsZTxVaW50OEFycmF5Pixcbik6IFJlYWRlciB7XG4gIGNvbnN0IGl0ZXJhdG9yOiBJdGVyYXRvcjxVaW50OEFycmF5PiB8IEFzeW5jSXRlcmF0b3I8VWludDhBcnJheT4gPVxuICAgIChpdGVyYWJsZSBhcyBBc3luY0l0ZXJhYmxlPFVpbnQ4QXJyYXk+KVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0/LigpID8/XG4gICAgICAoaXRlcmFibGUgYXMgSXRlcmFibGU8VWludDhBcnJheT4pW1N5bWJvbC5pdGVyYXRvcl0/LigpO1xuICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKCk7XG4gIHJldHVybiB7XG4gICAgYXN5bmMgcmVhZChwOiBVaW50OEFycmF5KTogUHJvbWlzZTxudW1iZXIgfCBudWxsPiB7XG4gICAgICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChyZXN1bHQudmFsdWUuYnl0ZUxlbmd0aCA8PSBwLmJ5dGVMZW5ndGgpIHtcbiAgICAgICAgICAgIHAuc2V0KHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnZhbHVlLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHAuc2V0KHJlc3VsdC52YWx1ZS5zdWJhcnJheSgwLCBwLmJ5dGVMZW5ndGgpKTtcbiAgICAgICAgICBhd2FpdCB3cml0ZUFsbChidWZmZXIsIHJlc3VsdC52YWx1ZS5zdWJhcnJheShwLmJ5dGVMZW5ndGgpKTtcbiAgICAgICAgICByZXR1cm4gcC5ieXRlTGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBuID0gYXdhaXQgYnVmZmVyLnJlYWQocCk7XG4gICAgICAgIGlmIChuID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucmVhZChwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxNQUFNLFFBQVEsK0JBQStCO0FBQ3RELFNBQVMsUUFBUSxRQUFRLGtDQUFrQztBQUczRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EwQkMsR0FDRCxPQUFPLFNBQVMsbUJBQ2QsUUFBMEQ7RUFFMUQsTUFBTSxXQUNKLEFBQUMsUUFBc0MsQ0FBQyxPQUFPLGFBQWEsQ0FBQyxRQUMzRCxBQUFDLFFBQWlDLENBQUMsT0FBTyxRQUFRLENBQUM7RUFDdkQsTUFBTSxTQUFTLElBQUk7RUFDbkIsT0FBTztJQUNMLE1BQU0sTUFBSyxDQUFhO01BQ3RCLElBQUksT0FBTyxNQUFNLEtBQUssR0FBRztRQUN2QixNQUFNLFNBQVMsTUFBTSxTQUFTLElBQUk7UUFDbEMsSUFBSSxPQUFPLElBQUksRUFBRTtVQUNmLE9BQU87UUFDVCxPQUFPO1VBQ0wsSUFBSSxPQUFPLEtBQUssQ0FBQyxVQUFVLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDM0MsRUFBRSxHQUFHLENBQUMsT0FBTyxLQUFLO1lBQ2xCLE9BQU8sT0FBTyxLQUFLLENBQUMsVUFBVTtVQUNoQztVQUNBLEVBQUUsR0FBRyxDQUFDLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsVUFBVTtVQUMzQyxNQUFNLFNBQVMsUUFBUSxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxVQUFVO1VBQ3pELE9BQU8sRUFBRSxVQUFVO1FBQ3JCO01BQ0YsT0FBTztRQUNMLE1BQU0sSUFBSSxNQUFNLE9BQU8sSUFBSSxDQUFDO1FBQzVCLElBQUksTUFBTSxNQUFNO1VBQ2QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ25CO1FBQ0EsT0FBTztNQUNUO0lBQ0Y7RUFDRjtBQUNGIn0=
// denoCacheMetadata=6573106717928567100,1623881772645974391