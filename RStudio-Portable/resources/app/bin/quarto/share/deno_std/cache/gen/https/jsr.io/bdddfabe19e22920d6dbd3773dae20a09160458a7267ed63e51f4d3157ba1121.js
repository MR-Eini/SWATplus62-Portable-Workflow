// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { PartialReadError } from "jsr:/@std/io@^0.224.3/buf-reader";
/** The type of file archived. */ export var FileTypes = /*#__PURE__*/ function(FileTypes) {
  FileTypes[FileTypes["file"] = 0] = "file";
  FileTypes[FileTypes["link"] = 1] = "link";
  FileTypes[FileTypes["symlink"] = 2] = "symlink";
  FileTypes[FileTypes["character-device"] = 3] = "character-device";
  FileTypes[FileTypes["block-device"] = 4] = "block-device";
  FileTypes[FileTypes["directory"] = 5] = "directory";
  FileTypes[FileTypes["fifo"] = 6] = "fifo";
  FileTypes[FileTypes["contiguous-file"] = 7] = "contiguous-file";
  return FileTypes;
}({});
export const HEADER_LENGTH = 512;
/*
struct posix_header {           // byte offset
  char name[100];               //   0
  char mode[8];                 // 100
  char uid[8];                  // 108
  char gid[8];                  // 116
  char size[12];                // 124
  char mtime[12];               // 136
  char chksum[8];               // 148
  char typeflag;                // 156
  char linkname[100];           // 157
  char magic[6];                // 257
  char version[2];              // 263
  char uname[32];               // 265
  char gname[32];               // 297
  char devmajor[8];             // 329
  char devminor[8];             // 337
  char prefix[155];             // 345
                                // 500
};
*/ export const USTAR_STRUCTURE = [
  {
    field: "fileName",
    length: 100
  },
  {
    field: "fileMode",
    length: 8
  },
  {
    field: "uid",
    length: 8
  },
  {
    field: "gid",
    length: 8
  },
  {
    field: "fileSize",
    length: 12
  },
  {
    field: "mtime",
    length: 12
  },
  {
    field: "checksum",
    length: 8
  },
  {
    field: "type",
    length: 1
  },
  {
    field: "linkName",
    length: 100
  },
  {
    field: "ustar",
    length: 8
  },
  {
    field: "owner",
    length: 32
  },
  {
    field: "group",
    length: 32
  },
  {
    field: "majorNumber",
    length: 8
  },
  {
    field: "minorNumber",
    length: 8
  },
  {
    field: "fileNamePrefix",
    length: 155
  },
  {
    field: "padding",
    length: 12
  }
];
export async function readBlock(reader, p) {
  let bytesRead = 0;
  while(bytesRead < p.length){
    const rr = await reader.read(p.subarray(bytesRead));
    if (rr === null) {
      if (bytesRead === 0) {
        return null;
      } else {
        throw new PartialReadError();
      }
    }
    bytesRead += rr;
  }
  return bytesRead;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXJjaGl2ZS8wLjIyNC4zL19jb21tb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHsgUGFydGlhbFJlYWRFcnJvciB9IGZyb20gXCJqc3I6L0BzdGQvaW9AXjAuMjI0LjMvYnVmLXJlYWRlclwiO1xuaW1wb3J0IHR5cGUgeyBSZWFkZXIgfSBmcm9tIFwianNyOi9Ac3RkL2lvQF4wLjIyNC4zL3R5cGVzXCI7XG5cbi8qKiBCYXNlIGludGVyZmFjZSBmb3Ige0BsaW5rY29kZSBUYXJNZXRhfSAqL1xuZXhwb3J0IGludGVyZmFjZSBUYXJJbmZvIHtcbiAgLyoqXG4gICAqIFRoZSB1bmRlcmx5aW5nIHJhdyBgc3RfbW9kZWAgYml0cyB0aGF0IGNvbnRhaW4gdGhlIHN0YW5kYXJkIFVuaXhcbiAgICogcGVybWlzc2lvbnMgZm9yIHRoaXMgZmlsZS9kaXJlY3RvcnkuXG4gICAqL1xuICBmaWxlTW9kZT86IG51bWJlcjtcbiAgLyoqXG4gICAqIERhdGEgbW9kaWZpY2F0aW9uIHRpbWUgb2YgdGhlIGZpbGUgYXQgdGhlIHRpbWUgaXQgd2FzIGFyY2hpdmVkLiBJdFxuICAgKiByZXByZXNlbnRzIHRoZSBpbnRlZ2VyIG51bWJlciBvZiBzZWNvbmRzIHNpbmNlIEphbnVhcnkgMSwgMTk3MCwgMDA6MDAgVVRDLlxuICAgKi9cbiAgbXRpbWU/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBOdW1lcmljIHVzZXIgSUQgb2YgdGhlIGZpbGUgb3duZXIuIFRoaXMgaXMgaWdub3JlZCBpZiB0aGUgb3BlcmF0aW5nIHN5c3RlbVxuICAgKiBkb2VzIG5vdCBzdXBwb3J0IG51bWVyaWMgdXNlciBJRHMuXG4gICAqL1xuICB1aWQ/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBOdW1lcmljIGdyb3VwIElEIG9mIHRoZSBmaWxlIG93bmVyLiBUaGlzIGlzIGlnbm9yZWQgaWYgdGhlIG9wZXJhdGluZ1xuICAgKiBzeXN0ZW0gZG9lcyBub3Qgc3VwcG9ydCBudW1lcmljIGdyb3VwIElEcy5cbiAgICovXG4gIGdpZD86IG51bWJlcjtcbiAgLyoqIFRoZSBuYW1lIG9mIHRoZSBmaWxlIG93bmVyLiAqL1xuICBvd25lcj86IHN0cmluZztcbiAgLyoqIFRoZSBncm91cCB0aGF0IHRoZSBmaWxlIG93bmVyIGJlbG9uZ3MgdG8uICovXG4gIGdyb3VwPzogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIHR5cGUgb2YgZmlsZSBhcmNoaXZlZC5cbiAgICpcbiAgICogQHNlZSB7QGxpbmtjb2RlIEZpbGVUeXBlc31cbiAgICovXG4gIHR5cGU/OiBzdHJpbmc7XG59XG5cbi8qKiBCYXNlIGludGVyZmFjZSBmb3Ige0BsaW5rY29kZSBUYXJNZXRhV2l0aExpbmtOYW1lfS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGFyTWV0YSBleHRlbmRzIFRhckluZm8ge1xuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIGZpbGUsIHdpdGggZGlyZWN0b3J5IG5hbWVzIChpZiBhbnkpIHByZWNlZGluZyB0aGUgZmlsZVxuICAgKiBuYW1lLCBzZXBhcmF0ZWQgYnkgc2xhc2hlcy5cbiAgICovXG4gIGZpbGVOYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgc2l6ZSBvZiB0aGUgZmlsZSBpbiBieXRlczsgZm9yIGFyY2hpdmUgbWVtYmVycyB0aGF0IGFyZSBzeW1ib2xpYyBvclxuICAgKiBoYXJkIGxpbmtzIHRvIGFub3RoZXIgZmlsZSwgdGhpcyBmaWVsZCBpcyBzcGVjaWZpZWQgYXMgemVyby5cbiAgICovXG4gIGZpbGVTaXplPzogbnVtYmVyO1xufVxuXG4vKiogVGhlIHR5cGUgb2YgZmlsZSBhcmNoaXZlZC4gKi9cbmV4cG9ydCBlbnVtIEZpbGVUeXBlcyB7XG4gIFwiZmlsZVwiID0gMCxcbiAgXCJsaW5rXCIgPSAxLFxuICBcInN5bWxpbmtcIiA9IDIsXG4gIFwiY2hhcmFjdGVyLWRldmljZVwiID0gMyxcbiAgXCJibG9jay1kZXZpY2VcIiA9IDQsXG4gIFwiZGlyZWN0b3J5XCIgPSA1LFxuICBcImZpZm9cIiA9IDYsXG4gIFwiY29udGlndW91cy1maWxlXCIgPSA3LFxufVxuXG5leHBvcnQgY29uc3QgSEVBREVSX0xFTkdUSCA9IDUxMjtcblxuLypcbnN0cnVjdCBwb3NpeF9oZWFkZXIgeyAgICAgICAgICAgLy8gYnl0ZSBvZmZzZXRcbiAgY2hhciBuYW1lWzEwMF07ICAgICAgICAgICAgICAgLy8gICAwXG4gIGNoYXIgbW9kZVs4XTsgICAgICAgICAgICAgICAgIC8vIDEwMFxuICBjaGFyIHVpZFs4XTsgICAgICAgICAgICAgICAgICAvLyAxMDhcbiAgY2hhciBnaWRbOF07ICAgICAgICAgICAgICAgICAgLy8gMTE2XG4gIGNoYXIgc2l6ZVsxMl07ICAgICAgICAgICAgICAgIC8vIDEyNFxuICBjaGFyIG10aW1lWzEyXTsgICAgICAgICAgICAgICAvLyAxMzZcbiAgY2hhciBjaGtzdW1bOF07ICAgICAgICAgICAgICAgLy8gMTQ4XG4gIGNoYXIgdHlwZWZsYWc7ICAgICAgICAgICAgICAgIC8vIDE1NlxuICBjaGFyIGxpbmtuYW1lWzEwMF07ICAgICAgICAgICAvLyAxNTdcbiAgY2hhciBtYWdpY1s2XTsgICAgICAgICAgICAgICAgLy8gMjU3XG4gIGNoYXIgdmVyc2lvblsyXTsgICAgICAgICAgICAgIC8vIDI2M1xuICBjaGFyIHVuYW1lWzMyXTsgICAgICAgICAgICAgICAvLyAyNjVcbiAgY2hhciBnbmFtZVszMl07ICAgICAgICAgICAgICAgLy8gMjk3XG4gIGNoYXIgZGV2bWFqb3JbOF07ICAgICAgICAgICAgIC8vIDMyOVxuICBjaGFyIGRldm1pbm9yWzhdOyAgICAgICAgICAgICAvLyAzMzdcbiAgY2hhciBwcmVmaXhbMTU1XTsgICAgICAgICAgICAgLy8gMzQ1XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDUwMFxufTtcbiovXG5cbmV4cG9ydCBjb25zdCBVU1RBUl9TVFJVQ1RVUkUgPSBbXG4gIHtcbiAgICBmaWVsZDogXCJmaWxlTmFtZVwiLFxuICAgIGxlbmd0aDogMTAwLFxuICB9LFxuICB7XG4gICAgZmllbGQ6IFwiZmlsZU1vZGVcIixcbiAgICBsZW5ndGg6IDgsXG4gIH0sXG4gIHtcbiAgICBmaWVsZDogXCJ1aWRcIixcbiAgICBsZW5ndGg6IDgsXG4gIH0sXG4gIHtcbiAgICBmaWVsZDogXCJnaWRcIixcbiAgICBsZW5ndGg6IDgsXG4gIH0sXG4gIHtcbiAgICBmaWVsZDogXCJmaWxlU2l6ZVwiLFxuICAgIGxlbmd0aDogMTIsXG4gIH0sXG4gIHtcbiAgICBmaWVsZDogXCJtdGltZVwiLFxuICAgIGxlbmd0aDogMTIsXG4gIH0sXG4gIHtcbiAgICBmaWVsZDogXCJjaGVja3N1bVwiLFxuICAgIGxlbmd0aDogOCxcbiAgfSxcbiAge1xuICAgIGZpZWxkOiBcInR5cGVcIixcbiAgICBsZW5ndGg6IDEsXG4gIH0sXG4gIHtcbiAgICBmaWVsZDogXCJsaW5rTmFtZVwiLFxuICAgIGxlbmd0aDogMTAwLFxuICB9LFxuICB7XG4gICAgZmllbGQ6IFwidXN0YXJcIixcbiAgICBsZW5ndGg6IDgsXG4gIH0sXG4gIHtcbiAgICBmaWVsZDogXCJvd25lclwiLFxuICAgIGxlbmd0aDogMzIsXG4gIH0sXG4gIHtcbiAgICBmaWVsZDogXCJncm91cFwiLFxuICAgIGxlbmd0aDogMzIsXG4gIH0sXG4gIHtcbiAgICBmaWVsZDogXCJtYWpvck51bWJlclwiLFxuICAgIGxlbmd0aDogOCxcbiAgfSxcbiAge1xuICAgIGZpZWxkOiBcIm1pbm9yTnVtYmVyXCIsXG4gICAgbGVuZ3RoOiA4LFxuICB9LFxuICB7XG4gICAgZmllbGQ6IFwiZmlsZU5hbWVQcmVmaXhcIixcbiAgICBsZW5ndGg6IDE1NSxcbiAgfSxcbiAge1xuICAgIGZpZWxkOiBcInBhZGRpbmdcIixcbiAgICBsZW5ndGg6IDEyLFxuICB9LFxuXSBhcyBjb25zdDtcblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IHR5cGUgVXN0YXJGaWVsZHMgPSAodHlwZW9mIFVTVEFSX1NUUlVDVFVSRSlbbnVtYmVyXVtcImZpZWxkXCJdO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEJsb2NrKFxuICByZWFkZXI6IFJlYWRlcixcbiAgcDogVWludDhBcnJheSxcbik6IFByb21pc2U8bnVtYmVyIHwgbnVsbD4ge1xuICBsZXQgYnl0ZXNSZWFkID0gMDtcbiAgd2hpbGUgKGJ5dGVzUmVhZCA8IHAubGVuZ3RoKSB7XG4gICAgY29uc3QgcnIgPSBhd2FpdCByZWFkZXIucmVhZChwLnN1YmFycmF5KGJ5dGVzUmVhZCkpO1xuICAgIGlmIChyciA9PT0gbnVsbCkge1xuICAgICAgaWYgKGJ5dGVzUmVhZCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBQYXJ0aWFsUmVhZEVycm9yKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGJ5dGVzUmVhZCArPSBycjtcbiAgfVxuICByZXR1cm4gYnl0ZXNSZWFkO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRSxTQUFTLGdCQUFnQixRQUFRLG1DQUFtQztBQW1EcEUsK0JBQStCLEdBQy9CLE9BQU8sSUFBQSxBQUFLLG1DQUFBOzs7Ozs7Ozs7U0FBQTtNQVNYO0FBRUQsT0FBTyxNQUFNLGdCQUFnQixJQUFJO0FBRWpDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQSxHQUVBLE9BQU8sTUFBTSxrQkFBa0I7RUFDN0I7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0VBQ0E7SUFDRSxPQUFPO0lBQ1AsUUFBUTtFQUNWO0NBQ0QsQ0FBVTtBQU9YLE9BQU8sZUFBZSxVQUNwQixNQUFjLEVBQ2QsQ0FBYTtFQUViLElBQUksWUFBWTtFQUNoQixNQUFPLFlBQVksRUFBRSxNQUFNLENBQUU7SUFDM0IsTUFBTSxLQUFLLE1BQU0sT0FBTyxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUM7SUFDeEMsSUFBSSxPQUFPLE1BQU07TUFDZixJQUFJLGNBQWMsR0FBRztRQUNuQixPQUFPO01BQ1QsT0FBTztRQUNMLE1BQU0sSUFBSTtNQUNaO0lBQ0Y7SUFDQSxhQUFhO0VBQ2Y7RUFDQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=15411612086805686527,11278654482087373494