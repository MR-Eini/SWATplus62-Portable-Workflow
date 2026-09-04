// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { convertRowToObject, defaultReadOptions, parseRecord } from "./_io.ts";
import { TextDelimiterStream } from "jsr:/@std/streams@^0.224.4/text-delimiter-stream";
class StreamLineReader {
  #reader;
  #done = false;
  constructor(reader){
    this.#reader = reader;
  }
  async readLine() {
    const { value, done } = await this.#reader.read();
    if (done) {
      this.#done = true;
      return null;
    } else {
      // NOTE: Remove trailing CR for compatibility with golang's `encoding/csv`
      return stripLastCR(value);
    }
  }
  isEOF() {
    return this.#done;
  }
  cancel() {
    this.#reader.cancel();
  }
}
function stripLastCR(s) {
  return s.endsWith("\r") ? s.slice(0, -1) : s;
}
/**
 * Read data from a CSV-encoded stream or file. Provides an auto/custom mapper
 * for columns.
 *
 * A `CsvParseStream` expects input conforming to
 * {@link https://www.rfc-editor.org/rfc/rfc4180.html | RFC 4180}.
 *
 * @example Usage
 * ```ts no-assert
 * import { CsvParseStream } from "@std/csv/csv-parse-stream";
 *
 * const source = ReadableStream.from([
 *   "name,age",
 *   "Alice,34",
 *   "Bob,24",
 *   "Charlie,45",
 * ]);
 * const parts = source.pipeThrough(new CsvParseStream());
 * ```
 *
 * @typeParam T The type of options for the stream.
 */ export class CsvParseStream {
  #readable;
  #options;
  #lineReader;
  #lines;
  #lineIndex = 0;
  #isFirstRow = true;
  #headers = [];
  /** Construct a new instance.
   *
   * @example Usage
   * ```ts no-assert
   * import { CsvParseStream } from "@std/csv/csv-parse-stream";
   *
   * const source = ReadableStream.from([
   *   "name,age",
   *   "Alice,34",
   *   "Bob,24",
   *   "Charlie,45",
   * ]);
   * const parts = source.pipeThrough(new CsvParseStream());
   * ```
   *
   * @param options Options for the stream.
   */ constructor(options){
    this.#options = {
      ...defaultReadOptions,
      ...options
    };
    this.#lines = new TextDelimiterStream("\n");
    this.#lineReader = new StreamLineReader(this.#lines.readable.getReader());
    this.#readable = new ReadableStream({
      pull: (controller)=>this.#pull(controller),
      cancel: ()=>this.#lineReader.cancel()
    });
  }
  async #pull(controller) {
    const line = await this.#lineReader.readLine();
    if (line === "") {
      // Found an empty line
      this.#lineIndex++;
      return this.#pull(controller);
    }
    if (line === null) {
      // Reached to EOF
      controller.close();
      this.#lineReader.cancel();
      return;
    }
    const record = await parseRecord(line, this.#lineReader, this.#options, this.#lineIndex);
    if (record === null) {
      controller.close();
      this.#lineReader.cancel();
      return;
    }
    if (this.#isFirstRow) {
      this.#isFirstRow = false;
      if (this.#options.skipFirstRow || this.#options.columns) {
        this.#headers = [];
        if (this.#options.skipFirstRow) {
          const head = record;
          this.#headers = head;
        }
        if (this.#options.columns) {
          this.#headers = this.#options.columns;
        }
      }
      if (this.#options.skipFirstRow) {
        return this.#pull(controller);
      }
    }
    this.#lineIndex++;
    if (record.length > 0) {
      if (this.#options.skipFirstRow || this.#options.columns) {
        controller.enqueue(convertRowToObject(record, this.#headers, this.#lineIndex));
      } else {
        controller.enqueue(record);
      }
    } else {
      return this.#pull(controller);
    }
  }
  /**
   * The instance's {@linkcode ReadableStream}.
   *
   * @example Usage
   * ```ts no-assert
   * import { CsvParseStream } from "@std/csv/csv-parse-stream";
   *
   * const source = ReadableStream.from([
   *   "name,age",
   *   "Alice,34",
   *   "Bob,24",
   *   "Charlie,45",
   * ]);
   * const parseStream = new CsvParseStream();
   * const parts = source.pipeTo(parseStream.writable);
   * for await (const part of parseStream.readable) {
   *   console.log(part);
   * }
   * ```
   *
   * @returns The instance's {@linkcode ReadableStream}.
   */ get readable() {
    return this.#readable;
  }
  /**
   * The instance's {@linkcode WritableStream}.
   *
   * @example Usage
   * ```ts no-assert
   * import { CsvParseStream } from "@std/csv/csv-parse-stream";
   *
   * const source = ReadableStream.from([
   *   "name,age",
   *   "Alice,34",
   *   "Bob,24",
   *   "Charlie,45",
   * ]);
   * const parseStream = new CsvParseStream();
   * const parts = source.pipeTo(parseStream.writable);
   * for await (const part of parseStream.readable) {
   *   console.log(part);
   * }
   * ```
   *
   * @returns The instance's {@linkcode WritableStream}.
   */ get writable() {
    return this.#lines.writable;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY3N2LzAuMjI0LjMvY3N2X3BhcnNlX3N0cmVhbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQge1xuICBjb252ZXJ0Um93VG9PYmplY3QsXG4gIGRlZmF1bHRSZWFkT3B0aW9ucyxcbiAgdHlwZSBMaW5lUmVhZGVyLFxuICBwYXJzZVJlY29yZCxcbiAgdHlwZSBQYXJzZVJlc3VsdCxcbiAgdHlwZSBSZWFkT3B0aW9ucyxcbn0gZnJvbSBcIi4vX2lvLnRzXCI7XG5pbXBvcnQgeyBUZXh0RGVsaW1pdGVyU3RyZWFtIH0gZnJvbSBcImpzcjovQHN0ZC9zdHJlYW1zQF4wLjIyNC40L3RleHQtZGVsaW1pdGVyLXN0cmVhbVwiO1xuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBDc3ZQYXJzZVN0cmVhbX0uICovXG5leHBvcnQgaW50ZXJmYWNlIENzdlBhcnNlU3RyZWFtT3B0aW9ucyBleHRlbmRzIFJlYWRPcHRpb25zIHtcbiAgLyoqXG4gICAqIElmIHlvdSBwcm92aWRlIGBza2lwRmlyc3RSb3c6IHRydWVgIGFuZCBgY29sdW1uc2AsIHRoZSBmaXJzdCBsaW5lIHdpbGwgYmVcbiAgICogc2tpcHBlZC5cbiAgICogSWYgeW91IHByb3ZpZGUgYHNraXBGaXJzdFJvdzogdHJ1ZWAgYnV0IG5vdCBgY29sdW1uc2AsIHRoZSBmaXJzdCBsaW5lIHdpbGxcbiAgICogYmUgc2tpcHBlZCBhbmQgdXNlZCBhcyBoZWFkZXIgZGVmaW5pdGlvbnMuXG4gICAqL1xuICBza2lwRmlyc3RSb3c/OiBib29sZWFuO1xuICAvKiogTGlzdCBvZiBuYW1lcyB1c2VkIGZvciBoZWFkZXIgZGVmaW5pdGlvbi4gKi9cbiAgY29sdW1ucz86IHJlYWRvbmx5IHN0cmluZ1tdO1xufVxuXG5jbGFzcyBTdHJlYW1MaW5lUmVhZGVyIGltcGxlbWVudHMgTGluZVJlYWRlciB7XG4gICNyZWFkZXI6IFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlcjxzdHJpbmc+O1xuICAjZG9uZSA9IGZhbHNlO1xuICBjb25zdHJ1Y3RvcihyZWFkZXI6IFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlcjxzdHJpbmc+KSB7XG4gICAgdGhpcy4jcmVhZGVyID0gcmVhZGVyO1xuICB9XG5cbiAgYXN5bmMgcmVhZExpbmUoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgY29uc3QgeyB2YWx1ZSwgZG9uZSB9ID0gYXdhaXQgdGhpcy4jcmVhZGVyLnJlYWQoKTtcbiAgICBpZiAoZG9uZSkge1xuICAgICAgdGhpcy4jZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTk9URTogUmVtb3ZlIHRyYWlsaW5nIENSIGZvciBjb21wYXRpYmlsaXR5IHdpdGggZ29sYW5nJ3MgYGVuY29kaW5nL2NzdmBcbiAgICAgIHJldHVybiBzdHJpcExhc3RDUih2YWx1ZSEpO1xuICAgIH1cbiAgfVxuXG4gIGlzRU9GKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLiNkb25lO1xuICB9XG5cbiAgY2FuY2VsKCkge1xuICAgIHRoaXMuI3JlYWRlci5jYW5jZWwoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdHJpcExhc3RDUihzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcy5lbmRzV2l0aChcIlxcclwiKSA/IHMuc2xpY2UoMCwgLTEpIDogcztcbn1cblxuLyoqIFJvdyByZXR1cm4gdHlwZS4gKi9cbmV4cG9ydCB0eXBlIFJvd1R5cGU8VD4gPSBUIGV4dGVuZHMgdW5kZWZpbmVkID8gc3RyaW5nW11cbiAgOiBQYXJzZVJlc3VsdDxDc3ZQYXJzZVN0cmVhbU9wdGlvbnMsIFQ+W251bWJlcl07XG5cbi8qKlxuICogUmVhZCBkYXRhIGZyb20gYSBDU1YtZW5jb2RlZCBzdHJlYW0gb3IgZmlsZS4gUHJvdmlkZXMgYW4gYXV0by9jdXN0b20gbWFwcGVyXG4gKiBmb3IgY29sdW1ucy5cbiAqXG4gKiBBIGBDc3ZQYXJzZVN0cmVhbWAgZXhwZWN0cyBpbnB1dCBjb25mb3JtaW5nIHRvXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzQxODAuaHRtbCB8IFJGQyA0MTgwfS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBDc3ZQYXJzZVN0cmVhbSB9IGZyb20gXCJAc3RkL2Nzdi9jc3YtcGFyc2Utc3RyZWFtXCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXG4gKiAgIFwibmFtZSxhZ2VcIixcbiAqICAgXCJBbGljZSwzNFwiLFxuICogICBcIkJvYiwyNFwiLFxuICogICBcIkNoYXJsaWUsNDVcIixcbiAqIF0pO1xuICogY29uc3QgcGFydHMgPSBzb3VyY2UucGlwZVRocm91Z2gobmV3IENzdlBhcnNlU3RyZWFtKCkpO1xuICogYGBgXG4gKlxuICogQHR5cGVQYXJhbSBUIFRoZSB0eXBlIG9mIG9wdGlvbnMgZm9yIHRoZSBzdHJlYW0uXG4gKi9cbmV4cG9ydCBjbGFzcyBDc3ZQYXJzZVN0cmVhbTxcbiAgY29uc3QgVCBleHRlbmRzIENzdlBhcnNlU3RyZWFtT3B0aW9ucyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbj4gaW1wbGVtZW50cyBUcmFuc2Zvcm1TdHJlYW08c3RyaW5nLCBSb3dUeXBlPFQ+PiB7XG4gIHJlYWRvbmx5ICNyZWFkYWJsZTogUmVhZGFibGVTdHJlYW08XG4gICAgc3RyaW5nW10gfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmtub3duPlxuICA+O1xuICByZWFkb25seSAjb3B0aW9uczogQ3N2UGFyc2VTdHJlYW1PcHRpb25zO1xuICByZWFkb25seSAjbGluZVJlYWRlcjogU3RyZWFtTGluZVJlYWRlcjtcbiAgcmVhZG9ubHkgI2xpbmVzOiBUZXh0RGVsaW1pdGVyU3RyZWFtO1xuICAjbGluZUluZGV4ID0gMDtcbiAgI2lzRmlyc3RSb3cgPSB0cnVlO1xuXG4gICNoZWFkZXJzOiByZWFkb25seSBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKiBDb25zdHJ1Y3QgYSBuZXcgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzIG5vLWFzc2VydFxuICAgKiBpbXBvcnQgeyBDc3ZQYXJzZVN0cmVhbSB9IGZyb20gXCJAc3RkL2Nzdi9jc3YtcGFyc2Utc3RyZWFtXCI7XG4gICAqXG4gICAqIGNvbnN0IHNvdXJjZSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1xuICAgKiAgIFwibmFtZSxhZ2VcIixcbiAgICogICBcIkFsaWNlLDM0XCIsXG4gICAqICAgXCJCb2IsMjRcIixcbiAgICogICBcIkNoYXJsaWUsNDVcIixcbiAgICogXSk7XG4gICAqIGNvbnN0IHBhcnRzID0gc291cmNlLnBpcGVUaHJvdWdoKG5ldyBDc3ZQYXJzZVN0cmVhbSgpKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIHRoZSBzdHJlYW0uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogVCkge1xuICAgIHRoaXMuI29wdGlvbnMgPSB7XG4gICAgICAuLi5kZWZhdWx0UmVhZE9wdGlvbnMsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH07XG5cbiAgICB0aGlzLiNsaW5lcyA9IG5ldyBUZXh0RGVsaW1pdGVyU3RyZWFtKFwiXFxuXCIpO1xuICAgIHRoaXMuI2xpbmVSZWFkZXIgPSBuZXcgU3RyZWFtTGluZVJlYWRlcih0aGlzLiNsaW5lcy5yZWFkYWJsZS5nZXRSZWFkZXIoKSk7XG4gICAgdGhpcy4jcmVhZGFibGUgPSBuZXcgUmVhZGFibGVTdHJlYW0oe1xuICAgICAgcHVsbDogKGNvbnRyb2xsZXIpID0+IHRoaXMuI3B1bGwoY29udHJvbGxlciksXG4gICAgICBjYW5jZWw6ICgpID0+IHRoaXMuI2xpbmVSZWFkZXIuY2FuY2VsKCksXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyAjcHVsbChcbiAgICBjb250cm9sbGVyOiBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyPFxuICAgICAgc3RyaW5nW10gfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmtub3duPlxuICAgID4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGxpbmUgPSBhd2FpdCB0aGlzLiNsaW5lUmVhZGVyLnJlYWRMaW5lKCk7XG4gICAgaWYgKGxpbmUgPT09IFwiXCIpIHtcbiAgICAgIC8vIEZvdW5kIGFuIGVtcHR5IGxpbmVcbiAgICAgIHRoaXMuI2xpbmVJbmRleCsrO1xuICAgICAgcmV0dXJuIHRoaXMuI3B1bGwoY29udHJvbGxlcik7XG4gICAgfVxuICAgIGlmIChsaW5lID09PSBudWxsKSB7XG4gICAgICAvLyBSZWFjaGVkIHRvIEVPRlxuICAgICAgY29udHJvbGxlci5jbG9zZSgpO1xuICAgICAgdGhpcy4jbGluZVJlYWRlci5jYW5jZWwoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmQgPSBhd2FpdCBwYXJzZVJlY29yZChcbiAgICAgIGxpbmUsXG4gICAgICB0aGlzLiNsaW5lUmVhZGVyLFxuICAgICAgdGhpcy4jb3B0aW9ucyxcbiAgICAgIHRoaXMuI2xpbmVJbmRleCxcbiAgICApO1xuICAgIGlmIChyZWNvcmQgPT09IG51bGwpIHtcbiAgICAgIGNvbnRyb2xsZXIuY2xvc2UoKTtcbiAgICAgIHRoaXMuI2xpbmVSZWFkZXIuY2FuY2VsKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuI2lzRmlyc3RSb3cpIHtcbiAgICAgIHRoaXMuI2lzRmlyc3RSb3cgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLiNvcHRpb25zLnNraXBGaXJzdFJvdyB8fCB0aGlzLiNvcHRpb25zLmNvbHVtbnMpIHtcbiAgICAgICAgdGhpcy4jaGVhZGVycyA9IFtdO1xuXG4gICAgICAgIGlmICh0aGlzLiNvcHRpb25zLnNraXBGaXJzdFJvdykge1xuICAgICAgICAgIGNvbnN0IGhlYWQgPSByZWNvcmQ7XG4gICAgICAgICAgdGhpcy4jaGVhZGVycyA9IGhlYWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy4jb3B0aW9ucy5jb2x1bW5zKSB7XG4gICAgICAgICAgdGhpcy4jaGVhZGVycyA9IHRoaXMuI29wdGlvbnMuY29sdW1ucztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy4jb3B0aW9ucy5za2lwRmlyc3RSb3cpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuI3B1bGwoY29udHJvbGxlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy4jbGluZUluZGV4Kys7XG4gICAgaWYgKHJlY29yZC5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAodGhpcy4jb3B0aW9ucy5za2lwRmlyc3RSb3cgfHwgdGhpcy4jb3B0aW9ucy5jb2x1bW5zKSB7XG4gICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjb252ZXJ0Um93VG9PYmplY3QoXG4gICAgICAgICAgcmVjb3JkLFxuICAgICAgICAgIHRoaXMuI2hlYWRlcnMsXG4gICAgICAgICAgdGhpcy4jbGluZUluZGV4LFxuICAgICAgICApKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShyZWNvcmQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy4jcHVsbChjb250cm9sbGVyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIGluc3RhbmNlJ3Mge0BsaW5rY29kZSBSZWFkYWJsZVN0cmVhbX0uXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzIG5vLWFzc2VydFxuICAgKiBpbXBvcnQgeyBDc3ZQYXJzZVN0cmVhbSB9IGZyb20gXCJAc3RkL2Nzdi9jc3YtcGFyc2Utc3RyZWFtXCI7XG4gICAqXG4gICAqIGNvbnN0IHNvdXJjZSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1xuICAgKiAgIFwibmFtZSxhZ2VcIixcbiAgICogICBcIkFsaWNlLDM0XCIsXG4gICAqICAgXCJCb2IsMjRcIixcbiAgICogICBcIkNoYXJsaWUsNDVcIixcbiAgICogXSk7XG4gICAqIGNvbnN0IHBhcnNlU3RyZWFtID0gbmV3IENzdlBhcnNlU3RyZWFtKCk7XG4gICAqIGNvbnN0IHBhcnRzID0gc291cmNlLnBpcGVUbyhwYXJzZVN0cmVhbS53cml0YWJsZSk7XG4gICAqIGZvciBhd2FpdCAoY29uc3QgcGFydCBvZiBwYXJzZVN0cmVhbS5yZWFkYWJsZSkge1xuICAgKiAgIGNvbnNvbGUubG9nKHBhcnQpO1xuICAgKiB9XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgaW5zdGFuY2UncyB7QGxpbmtjb2RlIFJlYWRhYmxlU3RyZWFtfS5cbiAgICovXG4gIGdldCByZWFkYWJsZSgpOiBSZWFkYWJsZVN0cmVhbTxSb3dUeXBlPFQ+PiB7XG4gICAgcmV0dXJuIHRoaXMuI3JlYWRhYmxlIGFzIFJlYWRhYmxlU3RyZWFtPFJvd1R5cGU8VD4+O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0YW5jZSdzIHtAbGlua2NvZGUgV3JpdGFibGVTdHJlYW19LlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0cyBuby1hc3NlcnRcbiAgICogaW1wb3J0IHsgQ3N2UGFyc2VTdHJlYW0gfSBmcm9tIFwiQHN0ZC9jc3YvY3N2LXBhcnNlLXN0cmVhbVwiO1xuICAgKlxuICAgKiBjb25zdCBzb3VyY2UgPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcbiAgICogICBcIm5hbWUsYWdlXCIsXG4gICAqICAgXCJBbGljZSwzNFwiLFxuICAgKiAgIFwiQm9iLDI0XCIsXG4gICAqICAgXCJDaGFybGllLDQ1XCIsXG4gICAqIF0pO1xuICAgKiBjb25zdCBwYXJzZVN0cmVhbSA9IG5ldyBDc3ZQYXJzZVN0cmVhbSgpO1xuICAgKiBjb25zdCBwYXJ0cyA9IHNvdXJjZS5waXBlVG8ocGFyc2VTdHJlYW0ud3JpdGFibGUpO1xuICAgKiBmb3IgYXdhaXQgKGNvbnN0IHBhcnQgb2YgcGFyc2VTdHJlYW0ucmVhZGFibGUpIHtcbiAgICogICBjb25zb2xlLmxvZyhwYXJ0KTtcbiAgICogfVxuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgVGhlIGluc3RhbmNlJ3Mge0BsaW5rY29kZSBXcml0YWJsZVN0cmVhbX0uXG4gICAqL1xuICBnZXQgd3JpdGFibGUoKTogV3JpdGFibGVTdHJlYW08c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuI2xpbmVzLndyaXRhYmxlO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUNFLGtCQUFrQixFQUNsQixrQkFBa0IsRUFFbEIsV0FBVyxRQUdOLFdBQVc7QUFDbEIsU0FBUyxtQkFBbUIsUUFBUSxtREFBbUQ7QUFldkYsTUFBTTtFQUNKLENBQUEsTUFBTyxDQUFzQztFQUM3QyxDQUFBLElBQUssR0FBRyxNQUFNO0VBQ2QsWUFBWSxNQUEyQyxDQUFFO0lBQ3ZELElBQUksQ0FBQyxDQUFBLE1BQU8sR0FBRztFQUNqQjtFQUVBLE1BQU0sV0FBbUM7SUFDdkMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxDQUFBLE1BQU8sQ0FBQyxJQUFJO0lBQy9DLElBQUksTUFBTTtNQUNSLElBQUksQ0FBQyxDQUFBLElBQUssR0FBRztNQUNiLE9BQU87SUFDVCxPQUFPO01BQ0wsMEVBQTBFO01BQzFFLE9BQU8sWUFBWTtJQUNyQjtFQUNGO0VBRUEsUUFBaUI7SUFDZixPQUFPLElBQUksQ0FBQyxDQUFBLElBQUs7RUFDbkI7RUFFQSxTQUFTO0lBQ1AsSUFBSSxDQUFDLENBQUEsTUFBTyxDQUFDLE1BQU07RUFDckI7QUFDRjtBQUVBLFNB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
// denoCacheMetadata=11962972926188522725,10930982696137482555