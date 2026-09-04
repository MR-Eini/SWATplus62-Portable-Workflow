// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { createLPS } from "./_common.ts";
/**
 * Transform a stream `string` into a stream where each chunk is divided by a
 * given delimiter.
 *
 * If you are working with a stream of `Uint8Array`, consider using {@linkcode DelimiterStream}.
 *
 * If you want to split by a newline, consider using {@linkcode TextLineStream}.
 *
 * @example Comma-separated values
 * ```ts
 * import { TextDelimiterStream } from "@std/streams/text-delimiter-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from([
 *   "alice,20,",
 *   ",US,",
 * ]);
 *
 * const valueStream = stream.pipeThrough(new TextDelimiterStream(","));
 *
 * assertEquals(
 *   await Array.fromAsync(valueStream),
 *   ["alice", "20", "", "US", ""],
 * );
 * ```
 *
 * @example Semicolon-separated values with suffix disposition
 * ```ts
 * import { TextDelimiterStream } from "@std/streams/text-delimiter-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from([
 *   "const a = 42;;let b =",
 *   " true;",
 * ]);
 *
 * const valueStream = stream.pipeThrough(
 *   new TextDelimiterStream(";", { disposition: "suffix" }),
 * );
 *
 * assertEquals(
 *   await Array.fromAsync(valueStream),
 *   ["const a = 42;", ";", "let b = true;", ""],
 * );
 * ```
 */ export class TextDelimiterStream extends TransformStream {
  #buf = "";
  #delimiter;
  #inspectIndex = 0;
  #matchIndex = 0;
  #delimLPS;
  #disp;
  /**
   * Constructs a new instance.
   *
   * @param delimiter A delimiter to split the stream by.
   * @param options Options for the stream.
   *
   * @example Comma as a delimiter
   * ```ts no-assert
   * import { TextDelimiterStream } from "@std/streams/text-delimiter-stream";
   *
   * const delimiterStream = new TextDelimiterStream(",");
   * ```
   *
   * @example Semicolon as a delimiter, and disposition set to `"suffix"`
   * ```ts no-assert
   * import { TextDelimiterStream } from "@std/streams/text-delimiter-stream";
   *
   * const delimiterStream = new TextDelimiterStream(",", {
   *   disposition: "suffix",
   * });
   * ```
   */ constructor(delimiter, options = {
    disposition: "discard"
  }){
    super({
      transform: (chunk, controller)=>{
        this.#handle(chunk, controller);
      },
      flush: (controller)=>{
        controller.enqueue(this.#buf);
      }
    });
    this.#delimiter = delimiter;
    this.#delimLPS = createLPS(new TextEncoder().encode(delimiter));
    this.#disp = options.disposition ?? "discard";
  }
  #handle(chunk, controller) {
    this.#buf += chunk;
    let localIndex = 0;
    while(this.#inspectIndex < this.#buf.length){
      if (chunk[localIndex] === this.#delimiter[this.#matchIndex]) {
        this.#inspectIndex++;
        localIndex++;
        this.#matchIndex++;
        if (this.#matchIndex === this.#delimiter.length) {
          // Full match
          const start = this.#inspectIndex - this.#delimiter.length;
          const end = this.#disp === "suffix" ? this.#inspectIndex : start;
          const copy = this.#buf.slice(0, end);
          controller.enqueue(copy);
          const shift = this.#disp === "prefix" ? start : this.#inspectIndex;
          this.#buf = this.#buf.slice(shift);
          this.#inspectIndex = this.#disp === "prefix" ? this.#delimiter.length : 0;
          this.#matchIndex = 0;
        }
      } else {
        if (this.#matchIndex === 0) {
          this.#inspectIndex++;
          localIndex++;
        } else {
          this.#matchIndex = this.#delimLPS[this.#matchIndex - 1];
        }
      }
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L3RleHRfZGVsaW1pdGVyX3N0cmVhbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBjcmVhdGVMUFMgfSBmcm9tIFwiLi9fY29tbW9uLnRzXCI7XG5cbmltcG9ydCB0eXBlIHtcbiAgRGVsaW1pdGVyRGlzcG9zaXRpb24sXG4gIERlbGltaXRlclN0cmVhbU9wdGlvbnMsXG59IGZyb20gXCIuL2RlbGltaXRlcl9zdHJlYW0udHNcIjtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gYSBzdHJlYW0gYHN0cmluZ2AgaW50byBhIHN0cmVhbSB3aGVyZSBlYWNoIGNodW5rIGlzIGRpdmlkZWQgYnkgYVxuICogZ2l2ZW4gZGVsaW1pdGVyLlxuICpcbiAqIElmIHlvdSBhcmUgd29ya2luZyB3aXRoIGEgc3RyZWFtIG9mIGBVaW50OEFycmF5YCwgY29uc2lkZXIgdXNpbmcge0BsaW5rY29kZSBEZWxpbWl0ZXJTdHJlYW19LlxuICpcbiAqIElmIHlvdSB3YW50IHRvIHNwbGl0IGJ5IGEgbmV3bGluZSwgY29uc2lkZXIgdXNpbmcge0BsaW5rY29kZSBUZXh0TGluZVN0cmVhbX0uXG4gKlxuICogQGV4YW1wbGUgQ29tbWEtc2VwYXJhdGVkIHZhbHVlc1xuICogYGBgdHNcbiAqIGltcG9ydCB7IFRleHREZWxpbWl0ZXJTdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL3RleHQtZGVsaW1pdGVyLXN0cmVhbVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzdHJlYW0gPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcbiAqICAgXCJhbGljZSwyMCxcIixcbiAqICAgXCIsVVMsXCIsXG4gKiBdKTtcbiAqXG4gKiBjb25zdCB2YWx1ZVN0cmVhbSA9IHN0cmVhbS5waXBlVGhyb3VnaChuZXcgVGV4dERlbGltaXRlclN0cmVhbShcIixcIikpO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgYXdhaXQgQXJyYXkuZnJvbUFzeW5jKHZhbHVlU3RyZWFtKSxcbiAqICAgW1wiYWxpY2VcIiwgXCIyMFwiLCBcIlwiLCBcIlVTXCIsIFwiXCJdLFxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIFNlbWljb2xvbi1zZXBhcmF0ZWQgdmFsdWVzIHdpdGggc3VmZml4IGRpc3Bvc2l0aW9uXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgVGV4dERlbGltaXRlclN0cmVhbSB9IGZyb20gXCJAc3RkL3N0cmVhbXMvdGV4dC1kZWxpbWl0ZXItc3RyZWFtXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGNvbnN0IHN0cmVhbSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1xuICogICBcImNvbnN0IGEgPSA0Mjs7bGV0IGIgPVwiLFxuICogICBcIiB0cnVlO1wiLFxuICogXSk7XG4gKlxuICogY29uc3QgdmFsdWVTdHJlYW0gPSBzdHJlYW0ucGlwZVRocm91Z2goXG4gKiAgIG5ldyBUZXh0RGVsaW1pdGVyU3RyZWFtKFwiO1wiLCB7IGRpc3Bvc2l0aW9uOiBcInN1ZmZpeFwiIH0pLFxuICogKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGF3YWl0IEFycmF5LmZyb21Bc3luYyh2YWx1ZVN0cmVhbSksXG4gKiAgIFtcImNvbnN0IGEgPSA0MjtcIiwgXCI7XCIsIFwibGV0IGIgPSB0cnVlO1wiLCBcIlwiXSxcbiAqICk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFRleHREZWxpbWl0ZXJTdHJlYW0gZXh0ZW5kcyBUcmFuc2Zvcm1TdHJlYW08c3RyaW5nLCBzdHJpbmc+IHtcbiAgI2J1ZiA9IFwiXCI7XG4gICNkZWxpbWl0ZXI6IHN0cmluZztcbiAgI2luc3BlY3RJbmRleCA9IDA7XG4gICNtYXRjaEluZGV4ID0gMDtcbiAgI2RlbGltTFBTOiBVaW50OEFycmF5O1xuICAjZGlzcDogRGVsaW1pdGVyRGlzcG9zaXRpb247XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBkZWxpbWl0ZXIgQSBkZWxpbWl0ZXIgdG8gc3BsaXQgdGhlIHN0cmVhbSBieS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgdGhlIHN0cmVhbS5cbiAgICpcbiAgICogQGV4YW1wbGUgQ29tbWEgYXMgYSBkZWxpbWl0ZXJcbiAgICogYGBgdHMgbm8tYXNzZXJ0XG4gICAqIGltcG9ydCB7IFRleHREZWxpbWl0ZXJTdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL3RleHQtZGVsaW1pdGVyLXN0cmVhbVwiO1xuICAgKlxuICAgKiBjb25zdCBkZWxpbWl0ZXJTdHJlYW0gPSBuZXcgVGV4dERlbGltaXRlclN0cmVhbShcIixcIik7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAZXhhbXBsZSBTZW1pY29sb24gYXMgYSBkZWxpbWl0ZXIsIGFuZCBkaXNwb3NpdGlvbiBzZXQgdG8gYFwic3VmZml4XCJgXG4gICAqIGBgYHRzIG5vLWFzc2VydFxuICAgKiBpbXBvcnQgeyBUZXh0RGVsaW1pdGVyU3RyZWFtIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy90ZXh0LWRlbGltaXRlci1zdHJlYW1cIjtcbiAgICpcbiAgICogY29uc3QgZGVsaW1pdGVyU3RyZWFtID0gbmV3IFRleHREZWxpbWl0ZXJTdHJlYW0oXCIsXCIsIHtcbiAgICogICBkaXNwb3NpdGlvbjogXCJzdWZmaXhcIixcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgZGVsaW1pdGVyOiBzdHJpbmcsXG4gICAgb3B0aW9uczogRGVsaW1pdGVyU3RyZWFtT3B0aW9ucyA9IHsgZGlzcG9zaXRpb246IFwiZGlzY2FyZFwiIH0sXG4gICkge1xuICAgIHN1cGVyKHtcbiAgICAgIHRyYW5zZm9ybTogKGNodW5rLCBjb250cm9sbGVyKSA9PiB7XG4gICAgICAgIHRoaXMuI2hhbmRsZShjaHVuaywgY29udHJvbGxlcik7XG4gICAgICB9LFxuICAgICAgZmx1c2g6IChjb250cm9sbGVyKSA9PiB7XG4gICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZSh0aGlzLiNidWYpO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRoaXMuI2RlbGltaXRlciA9IGRlbGltaXRlcjtcbiAgICB0aGlzLiNkZWxpbUxQUyA9IGNyZWF0ZUxQUyhuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoZGVsaW1pdGVyKSk7XG4gICAgdGhpcy4jZGlzcCA9IG9wdGlvbnMuZGlzcG9zaXRpb24gPz8gXCJkaXNjYXJkXCI7XG4gIH1cblxuICAjaGFuZGxlKFxuICAgIGNodW5rOiBzdHJpbmcsXG4gICAgY29udHJvbGxlcjogVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXI8c3RyaW5nPixcbiAgKSB7XG4gICAgdGhpcy4jYnVmICs9IGNodW5rO1xuICAgIGxldCBsb2NhbEluZGV4ID0gMDtcbiAgICB3aGlsZSAodGhpcy4jaW5zcGVjdEluZGV4IDwgdGhpcy4jYnVmLmxlbmd0aCkge1xuICAgICAgaWYgKGNodW5rW2xvY2FsSW5kZXhdID09PSB0aGlzLiNkZWxpbWl0ZXJbdGhpcy4jbWF0Y2hJbmRleF0pIHtcbiAgICAgICAgdGhpcy4jaW5zcGVjdEluZGV4Kys7XG4gICAgICAgIGxvY2FsSW5kZXgrKztcbiAgICAgICAgdGhpcy4jbWF0Y2hJbmRleCsrO1xuICAgICAgICBpZiAodGhpcy4jbWF0Y2hJbmRleCA9PT0gdGhpcy4jZGVsaW1pdGVyLmxlbmd0aCkge1xuICAgICAgICAgIC8vIEZ1bGwgbWF0Y2hcbiAgICAgICAgICBjb25zdCBzdGFydCA9IHRoaXMuI2luc3BlY3RJbmRleCAtIHRoaXMuI2RlbGltaXRlci5sZW5ndGg7XG4gICAgICAgICAgY29uc3QgZW5kID0gdGhpcy4jZGlzcCA9PT0gXCJzdWZmaXhcIiA/IHRoaXMuI2luc3BlY3RJbmRleCA6IHN0YXJ0O1xuICAgICAgICAgIGNvbnN0IGNvcHkgPSB0aGlzLiNidWYuc2xpY2UoMCwgZW5kKTtcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY29weSk7XG4gICAgICAgICAgY29uc3Qgc2hpZnQgPSB0aGlzLiNkaXNwID09PSBcInByZWZpeFwiID8gc3RhcnQgOiB0aGlzLiNpbnNwZWN0SW5kZXg7XG4gICAgICAgICAgdGhpcy4jYnVmID0gdGhpcy4jYnVmLnNsaWNlKHNoaWZ0KTtcbiAgICAgICAgICB0aGlzLiNpbnNwZWN0SW5kZXggPSB0aGlzLiNkaXNwID09PSBcInByZWZpeFwiXG4gICAgICAgICAgICA/IHRoaXMuI2RlbGltaXRlci5sZW5ndGhcbiAgICAgICAgICAgIDogMDtcbiAgICAgICAgICB0aGlzLiNtYXRjaEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuI21hdGNoSW5kZXggPT09IDApIHtcbiAgICAgICAgICB0aGlzLiNpbnNwZWN0SW5kZXgrKztcbiAgICAgICAgICBsb2NhbEluZGV4Kys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy4jbWF0Y2hJbmRleCA9IHRoaXMuI2RlbGltTFBTW3RoaXMuI21hdGNoSW5kZXggLSAxXSE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsU0FBUyxRQUFRLGVBQWU7QUFPekM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTZDQyxHQUNELE9BQU8sTUFBTSw0QkFBNEI7RUFDdkMsQ0FBQSxH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
// denoCacheMetadata=14618865824367189748,1026986528986977770