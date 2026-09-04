// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { existsSync } from "jsr:@std/fs@^1.0.3/exists";
import { FileHandler } from "./file_handler.ts";
import { encoderSymbol, filenameSymbol, fileSymbol, modeSymbol, openOptionsSymbol } from "./_file_handler_symbols.ts";
/**
 * This handler extends the functionality of the {@linkcode FileHandler} by
 * "rotating" the log file when it reaches a certain size. `maxBytes` specifies
 * the maximum size in bytes that the log file can grow to before rolling over
 * to a new one. If the size of the new log message plus the current log file
 * size exceeds `maxBytes` then a roll-over is triggered. When a roll-over
 * occurs, before the log message is written, the log file is renamed and
 * appended with `.1`. If a `.1` version already existed, it would have been
 * renamed `.2` first and so on. The maximum number of log files to keep is
 * specified by `maxBackupCount`. After the renames are complete the log message
 * is written to the original, now blank, file.
 *
 * Example: Given `log.txt`, `log.txt.1`, `log.txt.2` and `log.txt.3`, a
 * `maxBackupCount` of 3 and a new log message which would cause `log.txt` to
 * exceed `maxBytes`, then `log.txt.2` would be renamed to `log.txt.3` (thereby
 * discarding the original contents of `log.txt.3` since 3 is the maximum number
 * of backups to keep), `log.txt.1` would be renamed to `log.txt.2`, `log.txt`
 * would be renamed to `log.txt.1` and finally `log.txt` would be created from
 * scratch where the new log message would be written.
 *
 * This handler uses a buffer for writing log messages to file. Logs can be
 * manually flushed with `fileHandler.flush()`. Log messages with a log level
 * greater than ERROR are immediately flushed. Logs are also flushed on process
 * completion.
 *
 * Additional notes on `mode` as described above:
 *
 * - `'a'` Default mode. As above, this will pick up where the logs left off in
 *   rotation, or create a new log file if it doesn't exist.
 * - `'w'` in addition to starting with a clean `filename`, this mode will also
 *   cause any existing backups (up to `maxBackupCount`) to be deleted on setup
 *   giving a fully clean slate.
 * - `'x'` requires that neither `filename`, nor any backups (up to
 *   `maxBackupCount`), exist before setup.
 *
 * This handler requires both `--allow-read` and `--allow-write` permissions on
 * the log files.
 */ export class RotatingFileHandler extends FileHandler {
  #maxBytes;
  #maxBackupCount;
  #currentFileSize = 0;
  constructor(levelName, options){
    super(levelName, options);
    this.#maxBytes = options.maxBytes;
    this.#maxBackupCount = options.maxBackupCount;
  }
  setup() {
    if (this.#maxBytes < 1) {
      this.destroy();
      throw new Error(`"maxBytes" must be >= 1: received ${this.#maxBytes}`);
    }
    if (this.#maxBackupCount < 1) {
      this.destroy();
      throw new Error(`"maxBackupCount" must be >= 1: received ${this.#maxBackupCount}`);
    }
    super.setup();
    if (this[modeSymbol] === "w") {
      // Remove old backups too as it doesn't make sense to start with a clean
      // log file, but old backups
      for(let i = 1; i <= this.#maxBackupCount; i++){
        try {
          Deno.removeSync(this[filenameSymbol] + "." + i);
        } catch (error) {
          if (!(error instanceof Deno.errors.NotFound)) {
            throw error;
          }
        }
      }
    } else if (this[modeSymbol] === "x") {
      // Throw if any backups also exist
      for(let i = 1; i <= this.#maxBackupCount; i++){
        if (existsSync(this[filenameSymbol] + "." + i)) {
          this.destroy();
          throw new Deno.errors.AlreadyExists("Backup log file " + this[filenameSymbol] + "." + i + " already exists");
        }
      }
    } else {
      this.#currentFileSize = Deno.statSync(this[filenameSymbol]).size;
    }
  }
  log(msg) {
    const msgByteLength = this[encoderSymbol].encode(msg).byteLength + 1;
    if (this.#currentFileSize + msgByteLength > this.#maxBytes) {
      this.rotateLogFiles();
      this.#currentFileSize = 0;
    }
    super.log(msg);
    this.#currentFileSize += msgByteLength;
  }
  rotateLogFiles() {
    this.flush();
    this[fileSymbol].close();
    for(let i = this.#maxBackupCount - 1; i >= 0; i--){
      const source = this[filenameSymbol] + (i === 0 ? "" : "." + i);
      const dest = this[filenameSymbol] + "." + (i + 1);
      if (existsSync(source)) {
        Deno.renameSync(source, dest);
      }
    }
    this[fileSymbol] = Deno.openSync(this[filenameSymbol], this[openOptionsSymbol]);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbG9nLzAuMjI0Ljcvcm90YXRpbmdfZmlsZV9oYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgdHlwZSB7IExldmVsTmFtZSB9IGZyb20gXCIuL2xldmVscy50c1wiO1xuaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gXCJqc3I6QHN0ZC9mc0BeMS4wLjMvZXhpc3RzXCI7XG5pbXBvcnQgeyBGaWxlSGFuZGxlciwgdHlwZSBGaWxlSGFuZGxlck9wdGlvbnMgfSBmcm9tIFwiLi9maWxlX2hhbmRsZXIudHNcIjtcbmltcG9ydCB7XG4gIGVuY29kZXJTeW1ib2wsXG4gIGZpbGVuYW1lU3ltYm9sLFxuICBmaWxlU3ltYm9sLFxuICBtb2RlU3ltYm9sLFxuICBvcGVuT3B0aW9uc1N5bWJvbCxcbn0gZnJvbSBcIi4vX2ZpbGVfaGFuZGxlcl9zeW1ib2xzLnRzXCI7XG5cbmludGVyZmFjZSBSb3RhdGluZ0ZpbGVIYW5kbGVyT3B0aW9ucyBleHRlbmRzIEZpbGVIYW5kbGVyT3B0aW9ucyB7XG4gIG1heEJ5dGVzOiBudW1iZXI7XG4gIG1heEJhY2t1cENvdW50OiBudW1iZXI7XG59XG5cbi8qKlxuICogVGhpcyBoYW5kbGVyIGV4dGVuZHMgdGhlIGZ1bmN0aW9uYWxpdHkgb2YgdGhlIHtAbGlua2NvZGUgRmlsZUhhbmRsZXJ9IGJ5XG4gKiBcInJvdGF0aW5nXCIgdGhlIGxvZyBmaWxlIHdoZW4gaXQgcmVhY2hlcyBhIGNlcnRhaW4gc2l6ZS4gYG1heEJ5dGVzYCBzcGVjaWZpZXNcbiAqIHRoZSBtYXhpbXVtIHNpemUgaW4gYnl0ZXMgdGhhdCB0aGUgbG9nIGZpbGUgY2FuIGdyb3cgdG8gYmVmb3JlIHJvbGxpbmcgb3ZlclxuICogdG8gYSBuZXcgb25lLiBJZiB0aGUgc2l6ZSBvZiB0aGUgbmV3IGxvZyBtZXNzYWdlIHBsdXMgdGhlIGN1cnJlbnQgbG9nIGZpbGVcbiAqIHNpemUgZXhjZWVkcyBgbWF4Qnl0ZXNgIHRoZW4gYSByb2xsLW92ZXIgaXMgdHJpZ2dlcmVkLiBXaGVuIGEgcm9sbC1vdmVyXG4gKiBvY2N1cnMsIGJlZm9yZSB0aGUgbG9nIG1lc3NhZ2UgaXMgd3JpdHRlbiwgdGhlIGxvZyBmaWxlIGlzIHJlbmFtZWQgYW5kXG4gKiBhcHBlbmRlZCB3aXRoIGAuMWAuIElmIGEgYC4xYCB2ZXJzaW9uIGFscmVhZHkgZXhpc3RlZCwgaXQgd291bGQgaGF2ZSBiZWVuXG4gKiByZW5hbWVkIGAuMmAgZmlyc3QgYW5kIHNvIG9uLiBUaGUgbWF4aW11bSBudW1iZXIgb2YgbG9nIGZpbGVzIHRvIGtlZXAgaXNcbiAqIHNwZWNpZmllZCBieSBgbWF4QmFja3VwQ291bnRgLiBBZnRlciB0aGUgcmVuYW1lcyBhcmUgY29tcGxldGUgdGhlIGxvZyBtZXNzYWdlXG4gKiBpcyB3cml0dGVuIHRvIHRoZSBvcmlnaW5hbCwgbm93IGJsYW5rLCBmaWxlLlxuICpcbiAqIEV4YW1wbGU6IEdpdmVuIGBsb2cudHh0YCwgYGxvZy50eHQuMWAsIGBsb2cudHh0LjJgIGFuZCBgbG9nLnR4dC4zYCwgYVxuICogYG1heEJhY2t1cENvdW50YCBvZiAzIGFuZCBhIG5ldyBsb2cgbWVzc2FnZSB3aGljaCB3b3VsZCBjYXVzZSBgbG9nLnR4dGAgdG9cbiAqIGV4Y2VlZCBgbWF4Qnl0ZXNgLCB0aGVuIGBsb2cudHh0LjJgIHdvdWxkIGJlIHJlbmFtZWQgdG8gYGxvZy50eHQuM2AgKHRoZXJlYnlcbiAqIGRpc2NhcmRpbmcgdGhlIG9yaWdpbmFsIGNvbnRlbnRzIG9mIGBsb2cudHh0LjNgIHNpbmNlIDMgaXMgdGhlIG1heGltdW0gbnVtYmVyXG4gKiBvZiBiYWNrdXBzIHRvIGtlZXApLCBgbG9nLnR4dC4xYCB3b3VsZCBiZSByZW5hbWVkIHRvIGBsb2cudHh0LjJgLCBgbG9nLnR4dGBcbiAqIHdvdWxkIGJlIHJlbmFtZWQgdG8gYGxvZy50eHQuMWAgYW5kIGZpbmFsbHkgYGxvZy50eHRgIHdvdWxkIGJlIGNyZWF0ZWQgZnJvbVxuICogc2NyYXRjaCB3aGVyZSB0aGUgbmV3IGxvZyBtZXNzYWdlIHdvdWxkIGJlIHdyaXR0ZW4uXG4gKlxuICogVGhpcyBoYW5kbGVyIHVzZXMgYSBidWZmZXIgZm9yIHdyaXRpbmcgbG9nIG1lc3NhZ2VzIHRvIGZpbGUuIExvZ3MgY2FuIGJlXG4gKiBtYW51YWxseSBmbHVzaGVkIHdpdGggYGZpbGVIYW5kbGVyLmZsdXNoKClgLiBMb2cgbWVzc2FnZXMgd2l0aCBhIGxvZyBsZXZlbFxuICogZ3JlYXRlciB0aGFuIEVSUk9SIGFyZSBpbW1lZGlhdGVseSBmbHVzaGVkLiBMb2dzIGFyZSBhbHNvIGZsdXNoZWQgb24gcHJvY2Vzc1xuICogY29tcGxldGlvbi5cbiAqXG4gKiBBZGRpdGlvbmFsIG5vdGVzIG9uIGBtb2RlYCBhcyBkZXNjcmliZWQgYWJvdmU6XG4gKlxuICogLSBgJ2EnYCBEZWZhdWx0IG1vZGUuIEFzIGFib3ZlLCB0aGlzIHdpbGwgcGljayB1cCB3aGVyZSB0aGUgbG9ncyBsZWZ0IG9mZiBpblxuICogICByb3RhdGlvbiwgb3IgY3JlYXRlIGEgbmV3IGxvZyBmaWxlIGlmIGl0IGRvZXNuJ3QgZXhpc3QuXG4gKiAtIGAndydgIGluIGFkZGl0aW9uIHRvIHN0YXJ0aW5nIHdpdGggYSBjbGVhbiBgZmlsZW5hbWVgLCB0aGlzIG1vZGUgd2lsbCBhbHNvXG4gKiAgIGNhdXNlIGFueSBleGlzdGluZyBiYWNrdXBzICh1cCB0byBgbWF4QmFja3VwQ291bnRgKSB0byBiZSBkZWxldGVkIG9uIHNldHVwXG4gKiAgIGdpdmluZyBhIGZ1bGx5IGNsZWFuIHNsYXRlLlxuICogLSBgJ3gnYCByZXF1aXJlcyB0aGF0IG5laXRoZXIgYGZpbGVuYW1lYCwgbm9yIGFueSBiYWNrdXBzICh1cCB0b1xuICogICBgbWF4QmFja3VwQ291bnRgKSwgZXhpc3QgYmVmb3JlIHNldHVwLlxuICpcbiAqIFRoaXMgaGFuZGxlciByZXF1aXJlcyBib3RoIGAtLWFsbG93LXJlYWRgIGFuZCBgLS1hbGxvdy13cml0ZWAgcGVybWlzc2lvbnMgb25cbiAqIHRoZSBsb2cgZmlsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3RhdGluZ0ZpbGVIYW5kbGVyIGV4dGVuZHMgRmlsZUhhbmRsZXIge1xuICAjbWF4Qnl0ZXM6IG51bWJlcjtcbiAgI21heEJhY2t1cENvdW50OiBudW1iZXI7XG4gICNjdXJyZW50RmlsZVNpemUgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGxldmVsTmFtZTogTGV2ZWxOYW1lLCBvcHRpb25zOiBSb3RhdGluZ0ZpbGVIYW5kbGVyT3B0aW9ucykge1xuICAgIHN1cGVyKGxldmVsTmFtZSwgb3B0aW9ucyk7XG4gICAgdGhpcy4jbWF4Qnl0ZXMgPSBvcHRpb25zLm1heEJ5dGVzO1xuICAgIHRoaXMuI21heEJhY2t1cENvdW50ID0gb3B0aW9ucy5tYXhCYWNrdXBDb3VudDtcbiAgfVxuXG4gIG92ZXJyaWRlIHNldHVwKCkge1xuICAgIGlmICh0aGlzLiNtYXhCeXRlcyA8IDEpIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBcIm1heEJ5dGVzXCIgbXVzdCBiZSA+PSAxOiByZWNlaXZlZCAke3RoaXMuI21heEJ5dGVzfWApO1xuICAgIH1cbiAgICBpZiAodGhpcy4jbWF4QmFja3VwQ291bnQgPCAxKSB7XG4gICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFwibWF4QmFja3VwQ291bnRcIiBtdXN0IGJlID49IDE6IHJlY2VpdmVkICR7dGhpcy4jbWF4QmFja3VwQ291bnR9YCxcbiAgICAgICk7XG4gICAgfVxuICAgIHN1cGVyLnNldHVwKCk7XG5cbiAgICBpZiAodGhpc1ttb2RlU3ltYm9sXSA9PT0gXCJ3XCIpIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgYmFja3VwcyB0b28gYXMgaXQgZG9lc24ndCBtYWtlIHNlbnNlIHRvIHN0YXJ0IHdpdGggYSBjbGVhblxuICAgICAgLy8gbG9nIGZpbGUsIGJ1dCBvbGQgYmFja3Vwc1xuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gdGhpcy4jbWF4QmFja3VwQ291bnQ7IGkrKykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIERlbm8ucmVtb3ZlU3luYyh0aGlzW2ZpbGVuYW1lU3ltYm9sXSArIFwiLlwiICsgaSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkpIHtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpc1ttb2RlU3ltYm9sXSA9PT0gXCJ4XCIpIHtcbiAgICAgIC8vIFRocm93IGlmIGFueSBiYWNrdXBzIGFsc28gZXhpc3RcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHRoaXMuI21heEJhY2t1cENvdW50OyBpKyspIHtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmModGhpc1tmaWxlbmFtZVN5bWJvbF0gKyBcIi5cIiArIGkpKSB7XG4gICAgICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkFscmVhZHlFeGlzdHMoXG4gICAgICAgICAgICBcIkJhY2t1cCBsb2cgZmlsZSBcIiArIHRoaXNbZmlsZW5hbWVTeW1ib2xdICsgXCIuXCIgKyBpICtcbiAgICAgICAgICAgICAgXCIgYWxyZWFkeSBleGlzdHNcIixcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuI2N1cnJlbnRGaWxlU2l6ZSA9IChEZW5vLnN0YXRTeW5jKHRoaXNbZmlsZW5hbWVTeW1ib2xdKSkuc2l6ZTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBsb2cobXNnOiBzdHJpbmcpIHtcbiAgICBjb25zdCBtc2dCeXRlTGVuZ3RoID0gdGhpc1tlbmNvZGVyU3ltYm9sXS5lbmNvZGUobXNnKS5ieXRlTGVuZ3RoICsgMTtcblxuICAgIGlmICh0aGlzLiNjdXJyZW50RmlsZVNpemUgKyBtc2dCeXRlTGVuZ3RoID4gdGhpcy4jbWF4Qnl0ZXMpIHtcbiAgICAgIHRoaXMucm90YXRlTG9nRmlsZXMoKTtcbiAgICAgIHRoaXMuI2N1cnJlbnRGaWxlU2l6ZSA9IDA7XG4gICAgfVxuXG4gICAgc3VwZXIubG9nKG1zZyk7XG5cbiAgICB0aGlzLiNjdXJyZW50RmlsZVNpemUgKz0gbXNnQnl0ZUxlbmd0aDtcbiAgfVxuXG4gIHJvdGF0ZUxvZ0ZpbGVzKCkge1xuICAgIHRoaXMuZmx1c2goKTtcbiAgICB0aGlzW2ZpbGVTeW1ib2xdIS5jbG9zZSgpO1xuXG4gICAgZm9yIChsZXQgaSA9IHRoaXMuI21heEJhY2t1cENvdW50IC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IHNvdXJjZSA9IHRoaXNbZmlsZW5hbWVTeW1ib2xdICsgKGkgPT09IDAgPyBcIlwiIDogXCIuXCIgKyBpKTtcbiAgICAgIGNvbnN0IGRlc3QgPSB0aGlzW2ZpbGVuYW1lU3ltYm9sXSArIFwiLlwiICsgKGkgKyAxKTtcblxuICAgICAgaWYgKGV4aXN0c1N5bmMoc291cmNlKSkge1xuICAgICAgICBEZW5vLnJlbmFtZVN5bmMoc291cmNlLCBkZXN0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzW2ZpbGVTeW1ib2xdID0gRGVuby5vcGVuU3luYyhcbiAgICAgIHRoaXNbZmlsZW5hbWVTeW1ib2xdLFxuICAgICAgdGhpc1tvcGVuT3B0aW9uc1N5bWJvbF0sXG4gICAgKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRSxTQUFTLFVBQVUsUUFBUSw0QkFBNEI7QUFDdkQsU0FBUyxXQUFXLFFBQWlDLG9CQUFvQjtBQUN6RSxTQUNFLGFBQWEsRUFDYixjQUFjLEVBQ2QsVUFBVSxFQUNWLFVBQVUsRUFDVixpQkFBaUIsUUFDWiw2QkFBNkI7QUFPcEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FxQ0MsR0FDRCxPQUFPLE1BQU0sNEJBQTRCO0VBQ3ZDLENBQUEsUUFBUyxDQUFTO0VBQ2xCLENBQUEsY0FBZSxDQUFTO0VBQ3hCLENBQUEsZUFBZ0IsR0FBRyxFQUFFO0VBRXJCLFlBQVksU0FBb0IsRUFBRSxPQUFtQyxDQUFFO0lBQ3JFLEtBQUssQ0FBQyxXQUFXO0lBQ2pCLElBQUksQ0FBQyxDQUFBLFFBQVMsR0FBRyxRQUFRLFFBQVE7SUFDakMsSUFBSSxDQUFDLENBQUEsY0FBZSxHQUFHLFFBQVEsY0FBYztFQUMvQztFQUVTLFFBQVE7SUFDZixJQUFJLElBQUksQ0FBQyxDQUFBLFFBQVMsR0FBRyxHQUFHO01BQ3RCLElBQUksQ0FBQyxPQUFPO01BQ1osTUFBTSxJQUFJLE1BQU0sQ0FBQyxrQ0FBa0MsRUFBRSxJQUFJLENBQUMsQ0FBQSxRQUFTLEVBQUU7SUFDdkU7SUFDQSxJQUFJLElBQUksQ0FBQyxDQUFBLGNBQWUsR0FBRyxHQUFHO01BQzVCLElBQUksQ0FBQyxPQUFPO01BQ1osTUFBTSxJQUFJLE1BQ1IsQ0FBQyx3Q0FBd0MsRUFBRSxJQUFJLENBQUMsQ0FBQSxjQUFlLEVBQUU7SUFFckU7SUFDQSxLQUFLLENBQUM7SUFFTixJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssS0FBSztNQUM1Qix3RUFBd0U7TUFDeEUsNEJBQTRCO01BQzVCLElBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQSxjQUFlLEVBQUUsSUFBSztRQUM5QyxJQUFJO1VBQ0YsS0FBSyxVQUFVLENBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNO1FBQy9DLEVBQUUsT0FBTyxPQUFPO1VBQ2QsSUFBSSxDQUFDLENBQUMsaUJBQWlCLEtBQUssTUFBTSxDQUFDLFFBQVEsR0FBRztZQUM1QyxNQUFNO1VBQ1I7UUFDRjtNQUNGO0lBQ0YsT0FBTyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssS0FBSztNQUNuQyxrQ0FBa0M7TUFDbEMsSUFBSyxJQUFJLElBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFBLGNBQWUsRUFBRSxJQUFLO1FBQzlDLElBQUksV0FBVyxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sSUFBSTtVQUM5QyxJQUFJLENBQUMsT0FBTztVQUNaLE1BQU0sSUFBSSxLQUFLLE1BQU0sQ0FBQyxhQUFhLENBQ2pDLHFCQUFxQixJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sSUFDaEQ7UUFFTjtNQUNGO0lBQ0YsT0FBTztNQUNMLElBQUksQ0FBQyxDQUFBLGVBQWdCLEdBQUcsQUFBQyxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFHLElBQUk7SUFDcEU7RUFDRjtFQUVTLElBQUksR0FBVyxFQUFFO0lBQ3hCLE1BQU0sZ0JBQWdCLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssVUFBVSxHQUFHO0lBRW5FLElBQUksSUFBSSxDQUFDLENBQUEsZUFBZ0IsR0FBRyxnQkFBZ0IsSUFBSSxDQUFDLENBQUEsUUFBUyxFQUFFO01BQzFELElBQUksQ0FBQyxjQUFjO01BQ25CLElBQUksQ0FBQyxDQUFBLGVBQWdCLEdBQUc7SUFDMUI7SUFFQSxLQUFLLENBQUMsSUFBSTtJQUVWLElBQUksQ0FBQyxDQUFBLGVBQWdCLElBQUk7RUFDM0I7RUFFQSxpQkFBaUI7SUFDZixJQUFJLENBQUMsS0FBSztJQUNWLElBQUksQ0FBQyxXQUFXLENBQUUsS0FBSztJQUV2QixJQUFLLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQSxjQUFlLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSztNQUNsRCxNQUFNLFNBQVMsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLE1BQU0sSUFBSSxLQUFLLE1BQU0sQ0FBQztNQUM3RCxNQUFNLE9BQU8sSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO01BRWhELElBQUksV0FBVyxTQUFTO1FBQ3RCLEtBQUssVUFBVSxDQUFDLFFBQVE7TUFDMUI7SUFDRjtJQUVBLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxRQUFRLENBQzlCLElBQUksQ0FBQyxlQUFlLEVBQ3BCLElBQUksQ0FBQyxrQkFBa0I7RUFFM0I7QUFDRiJ9
// denoCacheMetadata=702560603812836514,6021834468119889858