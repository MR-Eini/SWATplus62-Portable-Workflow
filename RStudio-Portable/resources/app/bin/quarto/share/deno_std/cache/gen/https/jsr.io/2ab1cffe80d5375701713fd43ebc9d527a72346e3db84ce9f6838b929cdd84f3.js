// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { LogLevels } from "./levels.ts";
import { BaseHandler } from "./base_handler.ts";
import { writeAllSync } from "jsr:@std/io@^0.224.7/write-all";
import { bufSymbol, encoderSymbol, filenameSymbol, fileSymbol, modeSymbol, openOptionsSymbol, pointerSymbol } from "./_file_handler_symbols.ts";
/**
 * This handler will output to a file using an optional mode (default is `a`,
 * e.g. append). The file will grow indefinitely. It uses a buffer for writing
 * to file. Logs can be manually flushed with `fileHandler.flush()`. Log
 * messages with a log level greater than error are immediately flushed. Logs
 * are also flushed on process completion.
 *
 * Behavior of the log modes is as follows:
 *
 * - `'a'` - Default mode. Appends new log messages to the end of an existing log
 *   file, or create a new log file if none exists.
 * - `'w'` - Upon creation of the handler, any existing log file will be removed
 *   and a new one created.
 * - `'x'` - This will create a new log file and throw an error if one already
 *   exists.
 *
 * This handler requires `--allow-write` permission on the log file.
 */ export class FileHandler extends BaseHandler {
  [fileSymbol];
  [bufSymbol];
  [pointerSymbol] = 0;
  [filenameSymbol];
  [modeSymbol];
  [openOptionsSymbol];
  [encoderSymbol] = new TextEncoder();
  #unloadCallback = (()=>{
    this.destroy();
  }).bind(this);
  constructor(levelName, options){
    super(levelName, options);
    this[filenameSymbol] = options.filename;
    // default to append mode, write only
    this[modeSymbol] = options.mode ?? "a";
    this[openOptionsSymbol] = {
      createNew: this[modeSymbol] === "x",
      create: this[modeSymbol] !== "x",
      append: this[modeSymbol] === "a",
      truncate: this[modeSymbol] !== "a",
      write: true
    };
    this[bufSymbol] = new Uint8Array(options.bufferSize ?? 4096);
  }
  setup() {
    this[fileSymbol] = Deno.openSync(this[filenameSymbol], this[openOptionsSymbol]);
    this.#resetBuffer();
    addEventListener("unload", this.#unloadCallback);
  }
  handle(logRecord) {
    super.handle(logRecord);
    // Immediately flush if log level is higher than ERROR
    if (logRecord.level > LogLevels.ERROR) {
      this.flush();
    }
  }
  log(msg) {
    const bytes = this[encoderSymbol].encode(msg + "\n");
    if (bytes.byteLength > this[bufSymbol].byteLength - this[pointerSymbol]) {
      this.flush();
    }
    if (bytes.byteLength > this[bufSymbol].byteLength) {
      writeAllSync(this[fileSymbol], bytes);
    } else {
      this[bufSymbol].set(bytes, this[pointerSymbol]);
      this[pointerSymbol] += bytes.byteLength;
    }
  }
  flush() {
    if (this[pointerSymbol] > 0 && this[fileSymbol]) {
      let written = 0;
      while(written < this[pointerSymbol]){
        written += this[fileSymbol].writeSync(this[bufSymbol].subarray(written, this[pointerSymbol]));
      }
      this.#resetBuffer();
    }
  }
  #resetBuffer() {
    this[pointerSymbol] = 0;
  }
  destroy() {
    this.flush();
    this[fileSymbol]?.close();
    this[fileSymbol] = undefined;
    removeEventListener("unload", this.#unloadCallback);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbG9nLzAuMjI0LjcvZmlsZV9oYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgeyB0eXBlIExldmVsTmFtZSwgTG9nTGV2ZWxzIH0gZnJvbSBcIi4vbGV2ZWxzLnRzXCI7XG5pbXBvcnQgdHlwZSB7IExvZ1JlY29yZCB9IGZyb20gXCIuL2xvZ2dlci50c1wiO1xuaW1wb3J0IHsgQmFzZUhhbmRsZXIsIHR5cGUgQmFzZUhhbmRsZXJPcHRpb25zIH0gZnJvbSBcIi4vYmFzZV9oYW5kbGVyLnRzXCI7XG5pbXBvcnQgeyB3cml0ZUFsbFN5bmMgfSBmcm9tIFwianNyOkBzdGQvaW9AXjAuMjI0Ljcvd3JpdGUtYWxsXCI7XG5pbXBvcnQge1xuICBidWZTeW1ib2wsXG4gIGVuY29kZXJTeW1ib2wsXG4gIGZpbGVuYW1lU3ltYm9sLFxuICBmaWxlU3ltYm9sLFxuICBtb2RlU3ltYm9sLFxuICBvcGVuT3B0aW9uc1N5bWJvbCxcbiAgcG9pbnRlclN5bWJvbCxcbn0gZnJvbSBcIi4vX2ZpbGVfaGFuZGxlcl9zeW1ib2xzLnRzXCI7XG5cbmV4cG9ydCB0eXBlIExvZ01vZGUgPSBcImFcIiB8IFwid1wiIHwgXCJ4XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZUhhbmRsZXJPcHRpb25zIGV4dGVuZHMgQmFzZUhhbmRsZXJPcHRpb25zIHtcbiAgZmlsZW5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIEBkZWZhdWx0IHtcImFcIn1cbiAgICovXG4gIG1vZGU/OiBMb2dNb2RlO1xuICAvKipcbiAgICogQnVmZmVyIHNpemUgZm9yIHdyaXRpbmcgbG9nIG1lc3NhZ2VzIHRvIGZpbGUsIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7NDA5Nn1cbiAgICovXG4gIGJ1ZmZlclNpemU/OiBudW1iZXI7XG59XG5cbi8qKlxuICogVGhpcyBoYW5kbGVyIHdpbGwgb3V0cHV0IHRvIGEgZmlsZSB1c2luZyBhbiBvcHRpb25hbCBtb2RlIChkZWZhdWx0IGlzIGBhYCxcbiAqIGUuZy4gYXBwZW5kKS4gVGhlIGZpbGUgd2lsbCBncm93IGluZGVmaW5pdGVseS4gSXQgdXNlcyBhIGJ1ZmZlciBmb3Igd3JpdGluZ1xuICogdG8gZmlsZS4gTG9ncyBjYW4gYmUgbWFudWFsbHkgZmx1c2hlZCB3aXRoIGBmaWxlSGFuZGxlci5mbHVzaCgpYC4gTG9nXG4gKiBtZXNzYWdlcyB3aXRoIGEgbG9nIGxldmVsIGdyZWF0ZXIgdGhhbiBlcnJvciBhcmUgaW1tZWRpYXRlbHkgZmx1c2hlZC4gTG9nc1xuICogYXJlIGFsc28gZmx1c2hlZCBvbiBwcm9jZXNzIGNvbXBsZXRpb24uXG4gKlxuICogQmVoYXZpb3Igb2YgdGhlIGxvZyBtb2RlcyBpcyBhcyBmb2xsb3dzOlxuICpcbiAqIC0gYCdhJ2AgLSBEZWZhdWx0IG1vZGUuIEFwcGVuZHMgbmV3IGxvZyBtZXNzYWdlcyB0byB0aGUgZW5kIG9mIGFuIGV4aXN0aW5nIGxvZ1xuICogICBmaWxlLCBvciBjcmVhdGUgYSBuZXcgbG9nIGZpbGUgaWYgbm9uZSBleGlzdHMuXG4gKiAtIGAndydgIC0gVXBvbiBjcmVhdGlvbiBvZiB0aGUgaGFuZGxlciwgYW55IGV4aXN0aW5nIGxvZyBmaWxlIHdpbGwgYmUgcmVtb3ZlZFxuICogICBhbmQgYSBuZXcgb25lIGNyZWF0ZWQuXG4gKiAtIGAneCdgIC0gVGhpcyB3aWxsIGNyZWF0ZSBhIG5ldyBsb2cgZmlsZSBhbmQgdGhyb3cgYW4gZXJyb3IgaWYgb25lIGFscmVhZHlcbiAqICAgZXhpc3RzLlxuICpcbiAqIFRoaXMgaGFuZGxlciByZXF1aXJlcyBgLS1hbGxvdy13cml0ZWAgcGVybWlzc2lvbiBvbiB0aGUgbG9nIGZpbGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBGaWxlSGFuZGxlciBleHRlbmRzIEJhc2VIYW5kbGVyIHtcbiAgW2ZpbGVTeW1ib2xdOiBEZW5vLkZzRmlsZSB8IHVuZGVmaW5lZDtcbiAgW2J1ZlN5bWJvbF06IFVpbnQ4QXJyYXk7XG4gIFtwb2ludGVyU3ltYm9sXSA9IDA7XG4gIFtmaWxlbmFtZVN5bWJvbF06IHN0cmluZztcbiAgW21vZGVTeW1ib2xdOiBMb2dNb2RlO1xuICBbb3Blbk9wdGlvbnNTeW1ib2xdOiBEZW5vLk9wZW5PcHRpb25zO1xuICBbZW5jb2RlclN5bWJvbF06IFRleHRFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICN1bmxvYWRDYWxsYmFjayA9ICgoKSA9PiB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH0pLmJpbmQodGhpcyk7XG5cbiAgY29uc3RydWN0b3IobGV2ZWxOYW1lOiBMZXZlbE5hbWUsIG9wdGlvbnM6IEZpbGVIYW5kbGVyT3B0aW9ucykge1xuICAgIHN1cGVyKGxldmVsTmFtZSwgb3B0aW9ucyk7XG4gICAgdGhpc1tmaWxlbmFtZVN5bWJvbF0gPSBvcHRpb25zLmZpbGVuYW1lO1xuICAgIC8vIGRlZmF1bHQgdG8gYXBwZW5kIG1vZGUsIHdyaXRlIG9ubHlcbiAgICB0aGlzW21vZGVTeW1ib2xdID0gb3B0aW9ucy5tb2RlID8/IFwiYVwiO1xuICAgIHRoaXNbb3Blbk9wdGlvbnNTeW1ib2xdID0ge1xuICAgICAgY3JlYXRlTmV3OiB0aGlzW21vZGVTeW1ib2xdID09PSBcInhcIixcbiAgICAgIGNyZWF0ZTogdGhpc1ttb2RlU3ltYm9sXSAhPT0gXCJ4XCIsXG4gICAgICBhcHBlbmQ6IHRoaXNbbW9kZVN5bWJvbF0gPT09IFwiYVwiLFxuICAgICAgdHJ1bmNhdGU6IHRoaXNbbW9kZVN5bWJvbF0gIT09IFwiYVwiLFxuICAgICAgd3JpdGU6IHRydWUsXG4gICAgfTtcbiAgICB0aGlzW2J1ZlN5bWJvbF0gPSBuZXcgVWludDhBcnJheShvcHRpb25zLmJ1ZmZlclNpemUgPz8gNDA5Nik7XG4gIH1cblxuICBvdmVycmlkZSBzZXR1cCgpIHtcbiAgICB0aGlzW2ZpbGVTeW1ib2xdID0gRGVuby5vcGVuU3luYyhcbiAgICAgIHRoaXNbZmlsZW5hbWVTeW1ib2xdLFxuICAgICAgdGhpc1tvcGVuT3B0aW9uc1N5bWJvbF0sXG4gICAgKTtcbiAgICB0aGlzLiNyZXNldEJ1ZmZlcigpO1xuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcihcInVubG9hZFwiLCB0aGlzLiN1bmxvYWRDYWxsYmFjayk7XG4gIH1cblxuICBvdmVycmlkZSBoYW5kbGUobG9nUmVjb3JkOiBMb2dSZWNvcmQpIHtcbiAgICBzdXBlci5oYW5kbGUobG9nUmVjb3JkKTtcblxuICAgIC8vIEltbWVkaWF0ZWx5IGZsdXNoIGlmIGxvZyBsZXZlbCBpcyBoaWdoZXIgdGhhbiBFUlJPUlxuICAgIGlmIChsb2dSZWNvcmQubGV2ZWwgPiBMb2dMZXZlbHMuRVJST1IpIHtcbiAgICAgIHRoaXMuZmx1c2goKTtcbiAgICB9XG4gIH1cblxuICBsb2cobXNnOiBzdHJpbmcpIHtcbiAgICBjb25zdCBieXRlcyA9IHRoaXNbZW5jb2RlclN5bWJvbF0uZW5jb2RlKG1zZyArIFwiXFxuXCIpO1xuICAgIGlmIChieXRlcy5ieXRlTGVuZ3RoID4gdGhpc1tidWZTeW1ib2xdLmJ5dGVMZW5ndGggLSB0aGlzW3BvaW50ZXJTeW1ib2xdKSB7XG4gICAgICB0aGlzLmZsdXNoKCk7XG4gICAgfVxuICAgIGlmIChieXRlcy5ieXRlTGVuZ3RoID4gdGhpc1tidWZTeW1ib2xdLmJ5dGVMZW5ndGgpIHtcbiAgICAgIHdyaXRlQWxsU3luYyh0aGlzW2ZpbGVTeW1ib2xdISwgYnl0ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2J1ZlN5bWJvbF0uc2V0KGJ5dGVzLCB0aGlzW3BvaW50ZXJTeW1ib2xdKTtcbiAgICAgIHRoaXNbcG9pbnRlclN5bWJvbF0gKz0gYnl0ZXMuYnl0ZUxlbmd0aDtcbiAgICB9XG4gIH1cblxuICBmbHVzaCgpIHtcbiAgICBpZiAodGhpc1twb2ludGVyU3ltYm9sXSA+IDAgJiYgdGhpc1tmaWxlU3ltYm9sXSkge1xuICAgICAgbGV0IHdyaXR0ZW4gPSAwO1xuICAgICAgd2hpbGUgKHdyaXR0ZW4gPCB0aGlzW3BvaW50ZXJTeW1ib2xdKSB7XG4gICAgICAgIHdyaXR0ZW4gKz0gdGhpc1tmaWxlU3ltYm9sXS53cml0ZVN5bmMoXG4gICAgICAgICAgdGhpc1tidWZTeW1ib2xdLnN1YmFycmF5KHdyaXR0ZW4sIHRoaXNbcG9pbnRlclN5bWJvbF0pLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy4jcmVzZXRCdWZmZXIoKTtcbiAgICB9XG4gIH1cblxuICAjcmVzZXRCdWZmZXIoKSB7XG4gICAgdGhpc1twb2ludGVyU3ltYm9sXSA9IDA7XG4gIH1cblxuICBvdmVycmlkZSBkZXN0cm95KCkge1xuICAgIHRoaXMuZmx1c2goKTtcbiAgICB0aGlzW2ZpbGVTeW1ib2xdPy5jbG9zZSgpO1xuICAgIHRoaXNbZmlsZVN5bWJvbF0gPSB1bmRlZmluZWQ7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihcInVubG9hZFwiLCB0aGlzLiN1bmxvYWRDYWxsYmFjayk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsU0FBeUIsU0FBUyxRQUFRLGNBQWM7QUFFeEQsU0FBUyxXQUFXLFFBQWlDLG9CQUFvQjtBQUN6RSxTQUFTLFlBQVksUUFBUSxpQ0FBaUM7QUFDOUQsU0FDRSxTQUFTLEVBQ1QsYUFBYSxFQUNiLGNBQWMsRUFDZCxVQUFVLEVBQ1YsVUFBVSxFQUNWLGlCQUFpQixFQUNqQixhQUFhLFFBQ1IsNkJBQTZCO0FBa0JwQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FpQkMsR0FDRCxPQUFPLE1BQU0sb0JBQW9CO0VBQy9CLENBQUMsV0FBVyxDQUEwQjtFQUN0QyxDQUFDLFVBQVUsQ0FBYTtFQUN4QixDQUFDLGNBQWMsR0FBRyxFQUFFO0VBQ3BCLENBQUMsZUFBZSxDQUFTO0VBQ3pCLENBQUMsV0FBVyxDQUFVO0VBQ3RCLENBQUMsa0JBQWtCLENBQW1CO0VBQ3RDLENBQUMsY0FBYyxHQUFnQixJQUFJLGNBQWM7RUFDakQsQ0FBQSxjQUFlLEdBQUcsQ0FBQztJQUNqQixJQUFJLENBQUMsT0FBTztFQUNkLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFO0VBRWQsWUFBWSxTQUFvQixFQUFFLE9BQTJCLENBQUU7SUFDN0QsS0FBSyxDQUFDLFdBQVc7SUFDakIsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLFFBQVE7SUFDdkMscUNBQXFDO0lBQ3JDLElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxJQUFJLElBQUk7SUFDbkMsSUFBSSxDQUFDLGtCQUFrQixHQUFHO01BQ3hCLFdBQVcsSUFBSSxDQUFDLFdBQVcsS0FBSztNQUNoQyxRQUFRLElBQUksQ0FBQyxXQUFXLEtBQUs7TUFDN0IsUUFBUSxJQUFJLENBQUMsV0FBVyxLQUFLO01BQzdCLFVBQVUsSUFBSSxDQUFDLFdBQVcsS0FBSztNQUMvQixPQUFPO0lBQ1Q7SUFDQSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksV0FBVyxRQUFRLFVBQVUsSUFBSTtFQUN6RDtFQUVTLFFBQVE7SUFDZixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssUUFBUSxDQUM5QixJQUFJLENBQUMsZUFBZSxFQUNwQixJQUFJLENBQUMsa0JBQWtCO0lBRXpCLElBQUksQ0FBQyxDQUFBLFdBQVk7SUFFakIsaUJBQWlCLFVBQVUsSUFBSSxDQUFDLENBQUEsY0FBZTtFQUNqRDtFQUVTLE9BQU8sU0FBb0IsRUFBRTtJQUNwQyxLQUFLLENBQUMsT0FBTztJQUViLHNEQUFzRDtJQUN0RCxJQUFJLFVBQVUsS0FBSyxHQUFHLFVBQVUsS0FBSyxFQUFFO01BQ3JDLElBQUksQ0FBQyxLQUFLO0lBQ1o7RUFDRjtFQUVBLElBQUksR0FBVyxFQUFFO0lBQ2YsTUFBTSxRQUFRLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU07SUFDL0MsSUFBSSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFO01BQ3ZFLElBQUksQ0FBQyxLQUFLO0lBQ1o7SUFDQSxJQUFJLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFO01BQ2pELGFBQWEsSUFBSSxDQUFDLFdBQVcsRUFBRztJQUNsQyxPQUFPO01BQ0wsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsY0FBYztNQUM5QyxJQUFJLENBQUMsY0FBYyxJQUFJLE1BQU0sVUFBVTtJQUN6QztFQUNGO0VBRUEsUUFBUTtJQUNOLElBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUU7TUFDL0MsSUFBSSxVQUFVO01BQ2QsTUFBTyxVQUFVLElBQUksQ0FBQyxjQUFjLENBQUU7UUFDcEMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxJQUFJLENBQUMsY0FBYztNQUV6RDtNQUNBLElBQUksQ0FBQyxDQUFBLFdBQVk7SUFDbkI7RUFDRjtFQUVBLENBQUEsV0FBWTtJQUNWLElBQUksQ0FBQyxjQUFjLEdBQUc7RUFDeEI7RUFFUyxVQUFVO0lBQ2pCLElBQUksQ0FBQyxLQUFLO0lBQ1YsSUFBSSxDQUFDLFdBQVcsRUFBRTtJQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHO0lBQ25CLG9CQUFvQixVQUFVLElBQUksQ0FBQyxDQUFBLGNBQWU7RUFDcEQ7QUFDRiJ9
// denoCacheMetadata=5251607529686314732,8620742459099158612