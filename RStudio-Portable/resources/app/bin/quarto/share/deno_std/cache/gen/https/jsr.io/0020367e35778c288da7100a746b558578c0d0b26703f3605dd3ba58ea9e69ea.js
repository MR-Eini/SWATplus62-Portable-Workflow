// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { LogLevels } from "./levels.ts";
import { blue, bold, red, yellow } from "jsr:@std/fmt@^1.0.2/colors";
import { BaseHandler } from "./base_handler.ts";
/**
 * This is the default logger. It will output color coded log messages to the
 * console via `console.log()`.
 */ export class ConsoleHandler extends BaseHandler {
  #useColors;
  constructor(levelName, options = {}){
    super(levelName, options);
    this.#useColors = options.useColors ?? true;
  }
  format(logRecord) {
    let msg = super.format(logRecord);
    if (this.#useColors) {
      msg = this.applyColors(msg, logRecord.level);
    }
    return msg;
  }
  applyColors(msg, level) {
    switch(level){
      case LogLevels.INFO:
        msg = blue(msg);
        break;
      case LogLevels.WARN:
        msg = yellow(msg);
        break;
      case LogLevels.ERROR:
        msg = red(msg);
        break;
      case LogLevels.CRITICAL:
        msg = bold(red(msg));
        break;
      default:
        break;
    }
    return msg;
  }
  log(msg) {
    console.log(msg);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbG9nLzAuMjI0LjcvY29uc29sZV9oYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyB0eXBlIExldmVsTmFtZSwgTG9nTGV2ZWxzIH0gZnJvbSBcIi4vbGV2ZWxzLnRzXCI7XG5pbXBvcnQgdHlwZSB7IExvZ1JlY29yZCB9IGZyb20gXCIuL2xvZ2dlci50c1wiO1xuaW1wb3J0IHsgYmx1ZSwgYm9sZCwgcmVkLCB5ZWxsb3cgfSBmcm9tIFwianNyOkBzdGQvZm10QF4xLjAuMi9jb2xvcnNcIjtcbmltcG9ydCB7IEJhc2VIYW5kbGVyLCB0eXBlIEJhc2VIYW5kbGVyT3B0aW9ucyB9IGZyb20gXCIuL2Jhc2VfaGFuZGxlci50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbnNvbGVIYW5kbGVyT3B0aW9ucyBleHRlbmRzIEJhc2VIYW5kbGVyT3B0aW9ucyB7XG4gIHVzZUNvbG9ycz86IGJvb2xlYW47XG59XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgZGVmYXVsdCBsb2dnZXIuIEl0IHdpbGwgb3V0cHV0IGNvbG9yIGNvZGVkIGxvZyBtZXNzYWdlcyB0byB0aGVcbiAqIGNvbnNvbGUgdmlhIGBjb25zb2xlLmxvZygpYC5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbnNvbGVIYW5kbGVyIGV4dGVuZHMgQmFzZUhhbmRsZXIge1xuICAjdXNlQ29sb3JzPzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihsZXZlbE5hbWU6IExldmVsTmFtZSwgb3B0aW9uczogQ29uc29sZUhhbmRsZXJPcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihsZXZlbE5hbWUsIG9wdGlvbnMpO1xuICAgIHRoaXMuI3VzZUNvbG9ycyA9IG9wdGlvbnMudXNlQ29sb3JzID8/IHRydWU7XG4gIH1cblxuICBvdmVycmlkZSBmb3JtYXQobG9nUmVjb3JkOiBMb2dSZWNvcmQpOiBzdHJpbmcge1xuICAgIGxldCBtc2cgPSBzdXBlci5mb3JtYXQobG9nUmVjb3JkKTtcblxuICAgIGlmICh0aGlzLiN1c2VDb2xvcnMpIHtcbiAgICAgIG1zZyA9IHRoaXMuYXBwbHlDb2xvcnMobXNnLCBsb2dSZWNvcmQubGV2ZWwpO1xuICAgIH1cblxuICAgIHJldHVybiBtc2c7XG4gIH1cblxuICBhcHBseUNvbG9ycyhtc2c6IHN0cmluZywgbGV2ZWw6IG51bWJlcik6IHN0cmluZyB7XG4gICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgY2FzZSBMb2dMZXZlbHMuSU5GTzpcbiAgICAgICAgbXNnID0gYmx1ZShtc2cpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgTG9nTGV2ZWxzLldBUk46XG4gICAgICAgIG1zZyA9IHllbGxvdyhtc2cpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgTG9nTGV2ZWxzLkVSUk9SOlxuICAgICAgICBtc2cgPSByZWQobXNnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIExvZ0xldmVscy5DUklUSUNBTDpcbiAgICAgICAgbXNnID0gYm9sZChyZWQobXNnKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1zZztcbiAgfVxuXG4gIGxvZyhtc2c6IHN0cmluZykge1xuICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBQ3JDLFNBQXlCLFNBQVMsUUFBUSxjQUFjO0FBRXhELFNBQVMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxRQUFRLDZCQUE2QjtBQUNyRSxTQUFTLFdBQVcsUUFBaUMsb0JBQW9CO0FBTXpFOzs7Q0FHQyxHQUNELE9BQU8sTUFBTSx1QkFBdUI7RUFDbEMsQ0FBQSxTQUFVLENBQVc7RUFFckIsWUFBWSxTQUFvQixFQUFFLFVBQWlDLENBQUMsQ0FBQyxDQUFFO0lBQ3JFLEtBQUssQ0FBQyxXQUFXO0lBQ2pCLElBQUksQ0FBQyxDQUFBLFNBQVUsR0FBRyxRQUFRLFNBQVMsSUFBSTtFQUN6QztFQUVTLE9BQU8sU0FBb0IsRUFBVTtJQUM1QyxJQUFJLE1BQU0sS0FBSyxDQUFDLE9BQU87SUFFdkIsSUFBSSxJQUFJLENBQUMsQ0FBQSxTQUFVLEVBQUU7TUFDbkIsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssVUFBVSxLQUFLO0lBQzdDO0lBRUEsT0FBTztFQUNUO0VBRUEsWUFBWSxHQUFXLEVBQUUsS0FBYSxFQUFVO0lBQzlDLE9BQVE7TUFDTixLQUFLLFVBQVUsSUFBSTtRQUNqQixNQUFNLEtBQUs7UUFDWDtNQUNGLEtBQUssVUFBVSxJQUFJO1FBQ2pCLE1BQU0sT0FBTztRQUNiO01BQ0YsS0FBSyxVQUFVLEtBQUs7UUFDbEIsTUFBTSxJQUFJO1FBQ1Y7TUFDRixLQUFLLFVBQVUsUUFBUTtRQUNyQixNQUFNLEtBQUssSUFBSTtRQUNmO01BQ0Y7UUFDRTtJQUNKO0lBRUEsT0FBTztFQUNUO0VBRUEsSUFBSSxHQUFXLEVBQUU7SUFDZixRQUFRLEdBQUcsQ0FBQztFQUNkO0FBQ0YifQ==
// denoCacheMetadata=17496439870120607701,11297132811788210455