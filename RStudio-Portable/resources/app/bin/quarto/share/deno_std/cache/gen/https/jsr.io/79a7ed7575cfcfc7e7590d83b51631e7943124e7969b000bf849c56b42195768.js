// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { stringify } from "./stringify.ts";
/**
 * Convert each chunk to a CSV record.
 *
 * @example Usage
 * ```ts no-assert
 * import { CsvStringifyStream } from "@std/csv/csv-stringify-stream";
 *
 * const path = await Deno.makeTempFile();
 *
 * const file = await Deno.open(path, { create: true, write: true });
 * const readable = ReadableStream.from([
 *   { id: 1, name: "one" },
 *   { id: 2, name: "two" },
 *   { id: 3, name: "three" },
 * ]);
 *
 * await readable
 *   .pipeThrough(new CsvStringifyStream({ columns: ["id", "name"] }))
 *   .pipeThrough(new TextEncoderStream())
 *   .pipeTo(file.writable);
 * ```
 *
 * @typeParam TOptions The type of options for the stream.
 */ export class CsvStringifyStream extends TransformStream {
  /**
   * Construct a new instance.
   *
   * @example Usage
   * ```ts no-assert
   * import { CsvStringifyStream } from "@std/csv/csv-stringify-stream";
   *
   * const path = await Deno.makeTempFile();
   *
   * const file = await Deno.open(path, { create: true, write: true });
   * const readable = ReadableStream.from([
   *   { id: 1, name: "one" },
   *   { id: 2, name: "two" },
   *   { id: 3, name: "three" },
   * ]);
   *
   * await readable
   *   .pipeThrough(new CsvStringifyStream({ columns: ["id", "name"] }))
   *   .pipeThrough(new TextEncoderStream())
   *   .pipeTo(file.writable);
   * ```
   *
   * @param options Options for the stream.
   */ constructor(options){
    const { separator, columns = [] } = options ?? {};
    super({
      start (controller) {
        if (columns && columns.length > 0) {
          try {
            controller.enqueue(stringify([
              columns
            ], {
              separator,
              headers: false
            }));
          } catch (error) {
            controller.error(error);
          }
        }
      },
      transform (chunk, controller) {
        try {
          controller.enqueue(stringify([
            chunk
          ], {
            separator,
            headers: false,
            columns
          }));
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY3N2LzAuMjI0LjMvY3N2X3N0cmluZ2lmeV9zdHJlYW0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB7IHN0cmluZ2lmeSB9IGZyb20gXCIuL3N0cmluZ2lmeS50c1wiO1xuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBDc3ZTdHJpbmdpZnlTdHJlYW19LiAqL1xuZXhwb3J0IGludGVyZmFjZSBDc3ZTdHJpbmdpZnlTdHJlYW1PcHRpb25zIHtcbiAgLyoqXG4gICAqIERlbGltaXRlciB1c2VkIHRvIHNlcGFyYXRlIHZhbHVlcy5cbiAgICpcbiAgICogQGRlZmF1bHQge1wiLFwifVxuICAgKi9cbiAgcmVhZG9ubHkgc2VwYXJhdG9yPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBIGxpc3Qgb2YgY29sdW1ucyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgb3V0cHV0LlxuICAgKlxuICAgKiBJZiB5b3Ugd2FudCB0byBzdHJlYW0gb2JqZWN0cywgdGhpcyBvcHRpb24gaXMgcmVxdWlyZWQuXG4gICAqL1xuICByZWFkb25seSBjb2x1bW5zPzogQXJyYXk8c3RyaW5nPjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGVhY2ggY2h1bmsgdG8gYSBDU1YgcmVjb3JkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IENzdlN0cmluZ2lmeVN0cmVhbSB9IGZyb20gXCJAc3RkL2Nzdi9jc3Ytc3RyaW5naWZ5LXN0cmVhbVwiO1xuICpcbiAqIGNvbnN0IHBhdGggPSBhd2FpdCBEZW5vLm1ha2VUZW1wRmlsZSgpO1xuICpcbiAqIGNvbnN0IGZpbGUgPSBhd2FpdCBEZW5vLm9wZW4ocGF0aCwgeyBjcmVhdGU6IHRydWUsIHdyaXRlOiB0cnVlIH0pO1xuICogY29uc3QgcmVhZGFibGUgPSBSZWFkYWJsZVN0cmVhbS5mcm9tKFtcbiAqICAgeyBpZDogMSwgbmFtZTogXCJvbmVcIiB9LFxuICogICB7IGlkOiAyLCBuYW1lOiBcInR3b1wiIH0sXG4gKiAgIHsgaWQ6IDMsIG5hbWU6IFwidGhyZWVcIiB9LFxuICogXSk7XG4gKlxuICogYXdhaXQgcmVhZGFibGVcbiAqICAgLnBpcGVUaHJvdWdoKG5ldyBDc3ZTdHJpbmdpZnlTdHJlYW0oeyBjb2x1bW5zOiBbXCJpZFwiLCBcIm5hbWVcIl0gfSkpXG4gKiAgIC5waXBlVGhyb3VnaChuZXcgVGV4dEVuY29kZXJTdHJlYW0oKSlcbiAqICAgLnBpcGVUbyhmaWxlLndyaXRhYmxlKTtcbiAqIGBgYFxuICpcbiAqIEB0eXBlUGFyYW0gVE9wdGlvbnMgVGhlIHR5cGUgb2Ygb3B0aW9ucyBmb3IgdGhlIHN0cmVhbS5cbiAqL1xuZXhwb3J0IGNsYXNzIENzdlN0cmluZ2lmeVN0cmVhbTxUT3B0aW9ucyBleHRlbmRzIENzdlN0cmluZ2lmeVN0cmVhbU9wdGlvbnM+XG4gIGV4dGVuZHMgVHJhbnNmb3JtU3RyZWFtPFxuICAgIFRPcHRpb25zW1wiY29sdW1uc1wiXSBleHRlbmRzIEFycmF5PHN0cmluZz4gPyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICAgICAgOiBBcnJheTx1bmtub3duPixcbiAgICBzdHJpbmdcbiAgPiB7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzIG5vLWFzc2VydFxuICAgKiBpbXBvcnQgeyBDc3ZTdHJpbmdpZnlTdHJlYW0gfSBmcm9tIFwiQHN0ZC9jc3YvY3N2LXN0cmluZ2lmeS1zdHJlYW1cIjtcbiAgICpcbiAgICogY29uc3QgcGF0aCA9IGF3YWl0IERlbm8ubWFrZVRlbXBGaWxlKCk7XG4gICAqXG4gICAqIGNvbnN0IGZpbGUgPSBhd2FpdCBEZW5vLm9wZW4ocGF0aCwgeyBjcmVhdGU6IHRydWUsIHdyaXRlOiB0cnVlIH0pO1xuICAgKiBjb25zdCByZWFkYWJsZSA9IFJlYWRhYmxlU3RyZWFtLmZyb20oW1xuICAgKiAgIHsgaWQ6IDEsIG5hbWU6IFwib25lXCIgfSxcbiAgICogICB7IGlkOiAyLCBuYW1lOiBcInR3b1wiIH0sXG4gICAqICAgeyBpZDogMywgbmFtZTogXCJ0aHJlZVwiIH0sXG4gICAqIF0pO1xuICAgKlxuICAgKiBhd2FpdCByZWFkYWJsZVxuICAgKiAgIC5waXBlVGhyb3VnaChuZXcgQ3N2U3RyaW5naWZ5U3RyZWFtKHsgY29sdW1uczogW1wiaWRcIiwgXCJuYW1lXCJdIH0pKVxuICAgKiAgIC5waXBlVGhyb3VnaChuZXcgVGV4dEVuY29kZXJTdHJlYW0oKSlcbiAgICogICAucGlwZVRvKGZpbGUud3JpdGFibGUpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgdGhlIHN0cmVhbS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBUT3B0aW9ucykge1xuICAgIGNvbnN0IHtcbiAgICAgIHNlcGFyYXRvcixcbiAgICAgIGNvbHVtbnMgPSBbXSxcbiAgICB9ID0gb3B0aW9ucyA/PyB7fTtcblxuICAgIHN1cGVyKFxuICAgICAge1xuICAgICAgICBzdGFydChjb250cm9sbGVyKSB7XG4gICAgICAgICAgaWYgKGNvbHVtbnMgJiYgY29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KFtjb2x1bW5zXSwgeyBzZXBhcmF0b3IsIGhlYWRlcnM6IGZhbHNlIH0pLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgY29udHJvbGxlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0cmFuc2Zvcm0oY2h1bmssIGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKFxuICAgICAgICAgICAgICBzdHJpbmdpZnkoW2NodW5rXSwgeyBzZXBhcmF0b3IsIGhlYWRlcnM6IGZhbHNlLCBjb2x1bW5zIH0pLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29udHJvbGxlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICApO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUNyQyxTQUFTLFNBQVMsUUFBUSxpQkFBaUI7QUFtQjNDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVCQyxHQUNELE9BQU8sTUFBTSwyQkFDSDtFQUtSOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCQyxHQUNELFlBQVksT0FBa0IsQ0FBRTtJQUM5QixNQUFNLEVBQ0osU0FBUyxFQUNULFVBQVUsRUFBRSxFQUNiLEdBQUcsV0FBVyxDQUFDO0lBRWhCLEtBQUssQ0FDSDtNQUNFLE9BQU0sVUFBVTtRQUNkLElBQUksV0FBVyxRQUFRLE1BQU0sR0FBRyxHQUFHO1VBQ2pDLElBQUk7WUFDRixXQUFXLE9BQU8sQ0FDaEIsVUFBVTtjQUFDO2FBQVEsRUFBRTtjQUFFO2NBQVcsU0FBUztZQUFNO1VBRXJELEVBQUUsT0FBTyxPQUFPO1lBQ2QsV0FBVyxLQUFLLENBQUM7VUFDbkI7UUFDRjtNQUNGO01BQ0EsV0FBVSxLQUFLLEVBQUUsVUFBVTtRQUN6QixJQUFJO1VBQ0YsV0FBVyxPQUFPLENBQ2hCLFVBQVU7WUFBQztXQUFNLEVBQUU7WUFBRTtZQUFXLFNBQVM7WUFBTztVQUFRO1FBRTVELEVBQUUsT0FBTyxPQUFPO1VBQ2QsV0FBVyxLQUFLLENBQUM7UUFDbkI7TUFDRjtJQUNGO0VBRUo7QUFDRiJ9
// denoCacheMetadata=2814012752715177366,8216999128950801530