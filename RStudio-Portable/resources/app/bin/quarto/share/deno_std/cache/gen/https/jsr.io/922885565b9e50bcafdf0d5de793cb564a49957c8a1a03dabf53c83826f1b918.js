// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Options for {@linkcode TextLineStream}. */ /**
 * Transform a stream into a stream where each chunk is divided by a newline,
 * be it `\n` or `\r\n`. `\r` can be enabled via the `allowCR` option.
 *
 * If you want to split by a custom delimiter, consider using {@linkcode TextDelimiterStream}.
 *
 * @example JSON Lines
 * ```ts
 * import { TextLineStream } from "@std/streams/text-line-stream";
 * import { toTransformStream } from "@std/streams/to-transform-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from([
 *   '{"name": "Alice", "age": ',
 *   '30}\n{"name": "Bob", "age"',
 *   ": 25}\n",
 * ]);
 *
 * type Person = { name: string; age: number };
 *
 * // Split the stream by newline and parse each line as a JSON object
 * const jsonStream = stream.pipeThrough(new TextLineStream())
 *   .pipeThrough(toTransformStream(async function* (src) {
 *     for await (const chunk of src) {
 *       if (chunk.trim().length === 0) {
 *         continue;
 *       }
 *       yield JSON.parse(chunk) as Person;
 *     }
 *   }));
 *
 * assertEquals(
 *   await Array.fromAsync(jsonStream),
 *   [{ "name": "Alice", "age": 30 }, { "name": "Bob", "age": 25 }],
 * );
 * ```
 *
 * @example Allow splitting by `\r`
 *
 * ```ts
 * import { TextLineStream } from "@std/streams/text-line-stream";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const stream = ReadableStream.from([
 *  "CR\rLF",
 *  "\nCRLF\r\ndone",
 * ]).pipeThrough(new TextLineStream({ allowCR: true }));
 *
 * const lines = await Array.fromAsync(stream);
 *
 * assertEquals(lines, ["CR", "LF", "CRLF", "done"]);
 * ```
 */ export class TextLineStream extends TransformStream {
  #currentLine = "";
  /**
   * Constructs a new instance.
   *
   * @param options Options for the stream.
   *
   * @example No parameters
   * ```ts
   * import { TextLineStream } from "@std/streams/text-line-stream";
   * import { assertEquals } from "@std/assert/assert-equals";
   *
   * const stream = ReadableStream.from([
   *  "Hello,\n",
   *   "world!\n",
   * ]).pipeThrough(new TextLineStream());
   *
   * const lines = await Array.fromAsync(stream);
   *
   * assertEquals(lines, ["Hello,", "world!"]);
   * ```
   *
   * @example Allow splitting by `\r`
   *
   * ```ts
   * import { TextLineStream } from "@std/streams/text-line-stream";
   * import { assertEquals } from "@std/assert/assert-equals";
   *
   * const stream = ReadableStream.from([
   *  "CR\rLF",
   *  "\nCRLF\r\ndone",
   * ]).pipeThrough(new TextLineStream({ allowCR: true }));
   *
   * const lines = await Array.fromAsync(stream);
   *
   * assertEquals(lines, ["CR", "LF", "CRLF", "done"]);
   * ```
   */ constructor(options = {
    allowCR: false
  }){
    super({
      transform: (chars, controller)=>{
        chars = this.#currentLine + chars;
        while(true){
          const lfIndex = chars.indexOf("\n");
          const crIndex = options.allowCR ? chars.indexOf("\r") : -1;
          if (crIndex !== -1 && crIndex !== chars.length - 1 && (lfIndex === -1 || lfIndex - 1 > crIndex)) {
            controller.enqueue(chars.slice(0, crIndex));
            chars = chars.slice(crIndex + 1);
            continue;
          }
          if (lfIndex === -1) break;
          const endIndex = chars[lfIndex - 1] === "\r" ? lfIndex - 1 : lfIndex;
          controller.enqueue(chars.slice(0, endIndex));
          chars = chars.slice(lfIndex + 1);
        }
        this.#currentLine = chars;
      },
      flush: (controller)=>{
        if (this.#currentLine === "") return;
        const currentLine = options.allowCR && this.#currentLine.endsWith("\r") ? this.#currentLine.slice(0, -1) : this.#currentLine;
        controller.enqueue(currentLine);
      }
    });
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc3RyZWFtcy8wLjIyNC41L3RleHRfbGluZV9zdHJlYW0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqIE9wdGlvbnMgZm9yIHtAbGlua2NvZGUgVGV4dExpbmVTdHJlYW19LiAqL1xuZXhwb3J0IGludGVyZmFjZSBUZXh0TGluZVN0cmVhbU9wdGlvbnMge1xuICAvKipcbiAgICogQWxsb3cgc3BsaXR0aW5nIGJ5IGBcXHJgLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBhbGxvd0NSPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gYSBzdHJlYW0gaW50byBhIHN0cmVhbSB3aGVyZSBlYWNoIGNodW5rIGlzIGRpdmlkZWQgYnkgYSBuZXdsaW5lLFxuICogYmUgaXQgYFxcbmAgb3IgYFxcclxcbmAuIGBcXHJgIGNhbiBiZSBlbmFibGVkIHZpYSB0aGUgYGFsbG93Q1JgIG9wdGlvbi5cbiAqXG4gKiBJZiB5b3Ugd2FudCB0byBzcGxpdCBieSBhIGN1c3RvbSBkZWxpbWl0ZXIsIGNvbnNpZGVyIHVzaW5nIHtAbGlua2NvZGUgVGV4dERlbGltaXRlclN0cmVhbX0uXG4gKlxuICogQGV4YW1wbGUgSlNPTiBMaW5lc1xuICogYGBgdHNcbiAqIGltcG9ydCB7IFRleHRMaW5lU3RyZWFtIH0gZnJvbSBcIkBzdGQvc3RyZWFtcy90ZXh0LWxpbmUtc3RyZWFtXCI7XG4gKiBpbXBvcnQgeyB0b1RyYW5zZm9ybVN0cmVhbSB9IGZyb20gXCJAc3RkL3N0cmVhbXMvdG8tdHJhbnNmb3JtLXN0cmVhbVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzdHJlYW0gPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcbiAqICAgJ3tcIm5hbWVcIjogXCJBbGljZVwiLCBcImFnZVwiOiAnLFxuICogICAnMzB9XFxue1wibmFtZVwiOiBcIkJvYlwiLCBcImFnZVwiJyxcbiAqICAgXCI6IDI1fVxcblwiLFxuICogXSk7XG4gKlxuICogdHlwZSBQZXJzb24gPSB7IG5hbWU6IHN0cmluZzsgYWdlOiBudW1iZXIgfTtcbiAqXG4gKiAvLyBTcGxpdCB0aGUgc3RyZWFtIGJ5IG5ld2xpbmUgYW5kIHBhcnNlIGVhY2ggbGluZSBhcyBhIEpTT04gb2JqZWN0XG4gKiBjb25zdCBqc29uU3RyZWFtID0gc3RyZWFtLnBpcGVUaHJvdWdoKG5ldyBUZXh0TGluZVN0cmVhbSgpKVxuICogICAucGlwZVRocm91Z2godG9UcmFuc2Zvcm1TdHJlYW0oYXN5bmMgZnVuY3Rpb24qIChzcmMpIHtcbiAqICAgICBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHNyYykge1xuICogICAgICAgaWYgKGNodW5rLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAqICAgICAgICAgY29udGludWU7XG4gKiAgICAgICB9XG4gKiAgICAgICB5aWVsZCBKU09OLnBhcnNlKGNodW5rKSBhcyBQZXJzb247XG4gKiAgICAgfVxuICogICB9KSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKFxuICogICBhd2FpdCBBcnJheS5mcm9tQXN5bmMoanNvblN0cmVhbSksXG4gKiAgIFt7IFwibmFtZVwiOiBcIkFsaWNlXCIsIFwiYWdlXCI6IDMwIH0sIHsgXCJuYW1lXCI6IFwiQm9iXCIsIFwiYWdlXCI6IDI1IH1dLFxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIEFsbG93IHNwbGl0dGluZyBieSBgXFxyYFxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBUZXh0TGluZVN0cmVhbSB9IGZyb20gXCJAc3RkL3N0cmVhbXMvdGV4dC1saW5lLXN0cmVhbVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAqXG4gKiBjb25zdCBzdHJlYW0gPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcbiAqICBcIkNSXFxyTEZcIixcbiAqICBcIlxcbkNSTEZcXHJcXG5kb25lXCIsXG4gKiBdKS5waXBlVGhyb3VnaChuZXcgVGV4dExpbmVTdHJlYW0oeyBhbGxvd0NSOiB0cnVlIH0pKTtcbiAqXG4gKiBjb25zdCBsaW5lcyA9IGF3YWl0IEFycmF5LmZyb21Bc3luYyhzdHJlYW0pO1xuICpcbiAqIGFzc2VydEVxdWFscyhsaW5lcywgW1wiQ1JcIiwgXCJMRlwiLCBcIkNSTEZcIiwgXCJkb25lXCJdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgVGV4dExpbmVTdHJlYW0gZXh0ZW5kcyBUcmFuc2Zvcm1TdHJlYW08c3RyaW5nLCBzdHJpbmc+IHtcbiAgI2N1cnJlbnRMaW5lID0gXCJcIjtcblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIG5ldyBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgdGhlIHN0cmVhbS5cbiAgICpcbiAgICogQGV4YW1wbGUgTm8gcGFyYW1ldGVyc1xuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBUZXh0TGluZVN0cmVhbSB9IGZyb20gXCJAc3RkL3N0cmVhbXMvdGV4dC1saW5lLXN0cmVhbVwiO1xuICAgKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICAgKlxuICAgKiBjb25zdCBzdHJlYW0gPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcbiAgICogIFwiSGVsbG8sXFxuXCIsXG4gICAqICAgXCJ3b3JsZCFcXG5cIixcbiAgICogXSkucGlwZVRocm91Z2gobmV3IFRleHRMaW5lU3RyZWFtKCkpO1xuICAgKlxuICAgKiBjb25zdCBsaW5lcyA9IGF3YWl0IEFycmF5LmZyb21Bc3luYyhzdHJlYW0pO1xuICAgKlxuICAgKiBhc3NlcnRFcXVhbHMobGluZXMsIFtcIkhlbGxvLFwiLCBcIndvcmxkIVwiXSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAZXhhbXBsZSBBbGxvdyBzcGxpdHRpbmcgYnkgYFxccmBcbiAgICpcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgVGV4dExpbmVTdHJlYW0gfSBmcm9tIFwiQHN0ZC9zdHJlYW1zL3RleHQtbGluZS1zdHJlYW1cIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAgICpcbiAgICogY29uc3Qgc3RyZWFtID0gUmVhZGFibGVTdHJlYW0uZnJvbShbXG4gICAqICBcIkNSXFxyTEZcIixcbiAgICogIFwiXFxuQ1JMRlxcclxcbmRvbmVcIixcbiAgICogXSkucGlwZVRocm91Z2gobmV3IFRleHRMaW5lU3RyZWFtKHsgYWxsb3dDUjogdHJ1ZSB9KSk7XG4gICAqXG4gICAqIGNvbnN0IGxpbmVzID0gYXdhaXQgQXJyYXkuZnJvbUFzeW5jKHN0cmVhbSk7XG4gICAqXG4gICAqIGFzc2VydEVxdWFscyhsaW5lcywgW1wiQ1JcIiwgXCJMRlwiLCBcIkNSTEZcIiwgXCJkb25lXCJdKTtcbiAgICogYGBgXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBUZXh0TGluZVN0cmVhbU9wdGlvbnMgPSB7IGFsbG93Q1I6IGZhbHNlIH0pIHtcbiAgICBzdXBlcih7XG4gICAgICB0cmFuc2Zvcm06IChjaGFycywgY29udHJvbGxlcikgPT4ge1xuICAgICAgICBjaGFycyA9IHRoaXMuI2N1cnJlbnRMaW5lICsgY2hhcnM7XG5cbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBjb25zdCBsZkluZGV4ID0gY2hhcnMuaW5kZXhPZihcIlxcblwiKTtcbiAgICAgICAgICBjb25zdCBjckluZGV4ID0gb3B0aW9ucy5hbGxvd0NSID8gY2hhcnMuaW5kZXhPZihcIlxcclwiKSA6IC0xO1xuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgY3JJbmRleCAhPT0gLTEgJiYgY3JJbmRleCAhPT0gKGNoYXJzLmxlbmd0aCAtIDEpICYmXG4gICAgICAgICAgICAobGZJbmRleCA9PT0gLTEgfHwgKGxmSW5kZXggLSAxKSA+IGNySW5kZXgpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2hhcnMuc2xpY2UoMCwgY3JJbmRleCkpO1xuICAgICAgICAgICAgY2hhcnMgPSBjaGFycy5zbGljZShjckluZGV4ICsgMSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobGZJbmRleCA9PT0gLTEpIGJyZWFrO1xuXG4gICAgICAgICAgY29uc3QgZW5kSW5kZXggPSBjaGFyc1tsZkluZGV4IC0gMV0gPT09IFwiXFxyXCIgPyBsZkluZGV4IC0gMSA6IGxmSW5kZXg7XG4gICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGNoYXJzLnNsaWNlKDAsIGVuZEluZGV4KSk7XG4gICAgICAgICAgY2hhcnMgPSBjaGFycy5zbGljZShsZkluZGV4ICsgMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLiNjdXJyZW50TGluZSA9IGNoYXJzO1xuICAgICAgfSxcbiAgICAgIGZsdXNoOiAoY29udHJvbGxlcikgPT4ge1xuICAgICAgICBpZiAodGhpcy4jY3VycmVudExpbmUgPT09IFwiXCIpIHJldHVybjtcbiAgICAgICAgY29uc3QgY3VycmVudExpbmUgPSBvcHRpb25zLmFsbG93Q1IgJiYgdGhpcy4jY3VycmVudExpbmUuZW5kc1dpdGgoXCJcXHJcIilcbiAgICAgICAgICA/IHRoaXMuI2N1cnJlbnRMaW5lLnNsaWNlKDAsIC0xKVxuICAgICAgICAgIDogdGhpcy4jY3VycmVudExpbmU7XG4gICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjdXJyZW50TGluZSk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyw0Q0FBNEMsR0FVNUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvREMsR0FDRCxPQUFPLE1BQU0sdUJBQXVCO0VBQ2xDLENBQUEsV0FBWSxHQUFHLEdBQUc7RUFFbEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUNDLEdBQ0QsWUFBWSxVQUFpQztJQUFFLFNBQVM7RUFBTSxDQUFDLENBQUU7SUFDL0QsS0FBSyxDQUFDO01BQ0osV0FBVyxDQUFDLE9BQU87UUFDakIsUUFBUSxJQUFJLENBQUMsQ0FBQSxXQUFZLEdBQUc7UUFFNUIsTUFBTyxLQUFNO1VBQ1gsTUFBTSxVQUFVLE1BQU0sT0FBTyxDQUFDO1VBQzlCLE1BQU0sVUFBVSxRQUFRLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxRQUFRLENBQUM7VUFFekQsSUFDRSxZQUFZLENBQUMsS0FBSyxZQUFhLE1BQU0sTUFBTSxHQUFHLEtBQzlDLENBQUMsWUFBWSxDQUFDLEtBQUssQUFBQyxVQUFVLElBQUssT0FBTyxHQUMxQztZQUNBLFdBQVcsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUc7WUFDbEMsUUFBUSxNQUFNLEtBQUssQ0FBQyxVQUFVO1lBQzlCO1VBQ0Y7VUFFQSxJQUFJLFlBQVksQ0FBQyxHQUFHO1VBRXBCLE1BQU0sV0FBVyxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssT0FBTyxVQUFVLElBQUk7VUFDN0QsV0FBVyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRztVQUNsQyxRQUFRLE1BQU0sS0FBSyxDQUFDLFVBQVU7UUFDaEM7UUFFQSxJQUFJLENBQUMsQ0FBQSxXQUFZLEdBQUc7TUFDdEI7TUFDQSxPQUFPLENBQUM7UUFDTixJQUFJLElBQUksQ0FBQyxDQUFBLFdBQVksS0FBSyxJQUFJO1FBQzlCLE1BQU0sY0FBYyxRQUFRLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQSxXQUFZLENBQUMsUUFBUSxDQUFDLFFBQzlELElBQUksQ0FBQyxDQUFBLFdBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQzVCLElBQUksQ0FBQyxDQUFBLFdBQVk7UUFDckIsV0FBVyxPQUFPLENBQUM7TUFDckI7SUFDRjtFQUNGO0FBQ0YifQ==
// denoCacheMetadata=4862258445466344945,798305935287128974