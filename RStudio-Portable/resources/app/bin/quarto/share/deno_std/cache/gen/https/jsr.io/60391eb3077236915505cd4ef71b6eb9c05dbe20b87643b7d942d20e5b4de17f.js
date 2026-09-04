// Originally ported from Go:
// https://github.com/golang/go/blob/go1.12.5/src/encoding/csv/
// Copyright 2011 The Go Authors. All rights reserved. BSD license.
// https://github.com/golang/go/blob/master/LICENSE
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/** Options for {@linkcode parseRecord}. */ export const defaultReadOptions = {
  separator: ",",
  trimLeadingSpace: false
};
export async function parseRecord(line, reader, opt, startLine, lineIndex = startLine) {
  // line starting with comment character is ignored
  if (opt.comment && line[0] === opt.comment) {
    return [];
  }
  if (opt.separator === undefined) throw new TypeError("Separator is required");
  let fullLine = line;
  let quoteError = null;
  const quote = '"';
  const quoteLen = quote.length;
  const separatorLen = opt.separator.length;
  let recordBuffer = "";
  const fieldIndexes = [];
  parseField: for(;;){
    if (opt.trimLeadingSpace) {
      line = line.trimStart();
    }
    if (line.length === 0 || !line.startsWith(quote)) {
      // Non-quoted string field
      const i = line.indexOf(opt.separator);
      let field = line;
      if (i >= 0) {
        field = field.substring(0, i);
      }
      // Check to make sure a quote does not appear in field.
      if (!opt.lazyQuotes) {
        const j = field.indexOf(quote);
        if (j >= 0) {
          const col = runeCount(fullLine.slice(0, fullLine.length - line.slice(j).length));
          quoteError = new ParseError(startLine + 1, lineIndex, col, ERR_BARE_QUOTE);
          break parseField;
        }
      }
      recordBuffer += field;
      fieldIndexes.push(recordBuffer.length);
      if (i >= 0) {
        line = line.substring(i + separatorLen);
        continue parseField;
      }
      break parseField;
    } else {
      // Quoted string field
      line = line.substring(quoteLen);
      for(;;){
        const i = line.indexOf(quote);
        if (i >= 0) {
          // Hit next quote.
          recordBuffer += line.substring(0, i);
          line = line.substring(i + quoteLen);
          if (line.startsWith(quote)) {
            // `""` sequence (append quote).
            recordBuffer += quote;
            line = line.substring(quoteLen);
          } else if (line.startsWith(opt.separator)) {
            // `","` sequence (end of field).
            line = line.substring(separatorLen);
            fieldIndexes.push(recordBuffer.length);
            continue parseField;
          } else if (0 === line.length) {
            // `"\n` sequence (end of line).
            fieldIndexes.push(recordBuffer.length);
            break parseField;
          } else if (opt.lazyQuotes) {
            // `"` sequence (bare quote).
            recordBuffer += quote;
          } else {
            // `"*` sequence (invalid non-escaped quote).
            const col = runeCount(fullLine.slice(0, fullLine.length - line.length - quoteLen));
            quoteError = new ParseError(startLine + 1, lineIndex, col, ERR_QUOTE);
            break parseField;
          }
        } else if (line.length > 0 || !reader.isEOF()) {
          // Hit end of line (copy all data so far).
          recordBuffer += line;
          const r = await reader.readLine();
          lineIndex++;
          line = r ?? ""; // This is a workaround for making this module behave similarly to the encoding/csv/reader.go.
          fullLine = line;
          if (r === null) {
            // Abrupt end of file (EOF or error).
            if (!opt.lazyQuotes) {
              const col = runeCount(fullLine);
              quoteError = new ParseError(startLine + 1, lineIndex, col, ERR_QUOTE);
              break parseField;
            }
            fieldIndexes.push(recordBuffer.length);
            break parseField;
          }
          recordBuffer += "\n"; // preserve line feed (This is because TextProtoReader removes it.)
        } else {
          // Abrupt end of file (EOF on error).
          if (!opt.lazyQuotes) {
            const col = runeCount(fullLine);
            quoteError = new ParseError(startLine + 1, lineIndex, col, ERR_QUOTE);
            break parseField;
          }
          fieldIndexes.push(recordBuffer.length);
          break parseField;
        }
      }
    }
  }
  if (quoteError) {
    throw quoteError;
  }
  const result = [];
  let preIdx = 0;
  for (const i of fieldIndexes){
    result.push(recordBuffer.slice(preIdx, i));
    preIdx = i;
  }
  return result;
}
function runeCount(s) {
  // Array.from considers the surrogate pair.
  return Array.from(s).length;
}
/**
 * A ParseError is returned for parsing errors.
 * Line numbers are 1-indexed and columns are 0-indexed.
 *
 * @example Usage
 * ```ts
 * import { parse, ParseError } from "@std/csv/parse";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * try {
 *   parse(`a "word","b"`);
 * } catch (error) {
 *   if (error instanceof ParseError) {
 *     assertEquals(error.message, `parse error on line 1, column 2: bare " in non-quoted-field`);
 *   }
 * }
 * ```
 */ export class ParseError extends SyntaxError {
  /**
   * Line where the record starts.
   *
   * @example Usage
   * ```ts
   * import { parse, ParseError } from "@std/csv/parse";
   * import { assertEquals } from "@std/assert/assert-equals";
   *
   * try {
   *   parse(`a "word","b"`);
   * } catch (error) {
   *   if (error instanceof ParseError) {
   *     assertEquals(error.startLine, 1);
   *   }
   * }
   * ```
   */ startLine;
  /**
   * Line where the error occurred.
   *
   * @example Usage
   * ```ts
   * import { parse, ParseError } from "@std/csv/parse";
   * import { assertEquals } from "@std/assert/assert-equals";
   *
   * try {
   *   parse(`a "word","b"`);
   * } catch (error) {
   *   if (error instanceof ParseError) {
   *     assertEquals(error.line, 1);
   *   }
   * }
   * ```
   */ line;
  /**
   * Column (rune index) where the error occurred.
   *
   * @example Usage
   * ```ts
   * import { parse, ParseError } from "@std/csv/parse";
   * import { assertEquals } from "@std/assert/assert-equals";
   *
   * try {
   *   parse(`a "word","b"`);
   * } catch (error) {
   *   if (error instanceof ParseError) {
   *     assertEquals(error.column, 2);
   *   }
   * }
   * ```
   */ column;
  /**
   * Constructs a new instance.
   *
   * @example Usage
   * ```ts
   * import { parse, ParseError } from "@std/csv/parse";
   * import { assertEquals } from "@std/assert/assert-equals";
   *
   * try {
   *   parse(`a "word","b"`);
   * } catch (error) {
   *   if (error instanceof ParseError) {
   *     assertEquals(error.message, `parse error on line 1, column 2: bare " in non-quoted-field`);
   *   }
   * }
   * ```
   *
   * @param start Line where the record starts
   * @param line Line where the error occurred
   * @param column Column The index where the error occurred
   * @param message Error message
   */ constructor(start, line, column, message){
    super();
    this.startLine = start;
    this.column = column;
    this.line = line;
    if (message === ERR_FIELD_COUNT) {
      this.message = `record on line ${line}: ${message}`;
    } else if (start !== line) {
      this.message = `record on line ${start}; parse error on line ${line}, column ${column}: ${message}`;
    } else {
      this.message = `parse error on line ${line}, column ${column}: ${message}`;
    }
  }
}
export const ERR_BARE_QUOTE = 'bare " in non-quoted-field';
export const ERR_QUOTE = 'extraneous or missing " in quoted-field';
export const ERR_INVALID_DELIM = "Invalid Delimiter";
export const ERR_FIELD_COUNT = "wrong number of fields";
export function convertRowToObject(row, headers, index) {
  if (row.length !== headers.length) {
    throw new Error(`Error number of fields line: ${index}\nNumber of fields found: ${headers.length}\nExpected number of fields: ${row.length}`);
  }
  const out = {};
  for (const [index, header] of headers.entries()){
    out[header] = row[index];
  }
  return out;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY3N2LzAuMjI0LjMvX2lvLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIE9yaWdpbmFsbHkgcG9ydGVkIGZyb20gR286XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29sYW5nL2dvL2Jsb2IvZ28xLjEyLjUvc3JjL2VuY29kaW5nL2Nzdi9cbi8vIENvcHlyaWdodCAyMDExIFRoZSBHbyBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBCU0QgbGljZW5zZS5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb2xhbmcvZ28vYmxvYi9tYXN0ZXIvTElDRU5TRVxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuLyoqIE9wdGlvbnMgZm9yIHtAbGlua2NvZGUgcGFyc2VSZWNvcmR9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWFkT3B0aW9ucyB7XG4gIC8qKiBDaGFyYWN0ZXIgd2hpY2ggc2VwYXJhdGVzIHZhbHVlcy5cbiAgICpcbiAgICogQGRlZmF1bHQge1wiLFwifVxuICAgKi9cbiAgc2VwYXJhdG9yPzogc3RyaW5nO1xuICAvKiogQ2hhcmFjdGVyIHRvIHN0YXJ0IGEgY29tbWVudC5cbiAgICpcbiAgICogTGluZXMgYmVnaW5uaW5nIHdpdGggdGhlIGNvbW1lbnQgY2hhcmFjdGVyIHdpdGhvdXQgcHJlY2VkaW5nIHdoaXRlc3BhY2VcbiAgICogYXJlIGlnbm9yZWQuIFdpdGggbGVhZGluZyB3aGl0ZXNwYWNlIHRoZSBjb21tZW50IGNoYXJhY3RlciBiZWNvbWVzIHBhcnQgb2ZcbiAgICogdGhlIGZpZWxkLCBldmVuIHlvdSBwcm92aWRlIGB0cmltTGVhZGluZ1NwYWNlOiB0cnVlYC5cbiAgICpcbiAgICogQGRlZmF1bHQge1wiI1wifVxuICAgKi9cbiAgY29tbWVudD86IHN0cmluZztcbiAgLyoqIEZsYWcgdG8gdHJpbSB0aGUgbGVhZGluZyBzcGFjZSBvZiB0aGUgdmFsdWUuXG4gICAqXG4gICAqIFRoaXMgaXMgZG9uZSBldmVuIGlmIHRoZSBmaWVsZCBkZWxpbWl0ZXIsIGBzZXBhcmF0b3JgLCBpcyB3aGl0ZSBzcGFjZS5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgdHJpbUxlYWRpbmdTcGFjZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBBbGxvdyB1bnF1b3RlZCBxdW90ZSBpbiBhIHF1b3RlZCBmaWVsZCBvciBub24tZG91YmxlLXF1b3RlZCBxdW90ZXMgaW5cbiAgICogcXVvdGVkIGZpZWxkLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBsYXp5UXVvdGVzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEVuYWJsaW5nIGNoZWNraW5nIG51bWJlciBvZiBleHBlY3RlZCBmaWVsZHMgZm9yIGVhY2ggcm93LlxuICAgKlxuICAgKiBJZiBwb3NpdGl2ZSwgZWFjaCByZWNvcmQgaXMgcmVxdWlyZWQgdG8gaGF2ZSB0aGUgZ2l2ZW4gbnVtYmVyIG9mIGZpZWxkcy5cbiAgICogSWYgPT09IDAsIGl0IHdpbGwgYmUgc2V0IHRvIHRoZSBudW1iZXIgb2YgZmllbGRzIGluIHRoZSBmaXJzdCByb3csIHNvIHRoYXRcbiAgICogZnV0dXJlIHJvd3MgbXVzdCBoYXZlIHRoZSBzYW1lIGZpZWxkIGNvdW50LlxuICAgKiBJZiBuZWdhdGl2ZSwgbm8gY2hlY2sgaXMgbWFkZSBhbmQgcmVjb3JkcyBtYXkgaGF2ZSBhIHZhcmlhYmxlIG51bWJlciBvZlxuICAgKiBmaWVsZHMuXG4gICAqXG4gICAqIElmIHRoZSB3cm9uZyBudW1iZXIgb2YgZmllbGRzIGlzIGluIGEgcm93LCBhIGBQYXJzZUVycm9yYCBpcyB0aHJvd24uXG4gICAqL1xuICBmaWVsZHNQZXJSZWNvcmQ/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0UmVhZE9wdGlvbnM6IFJlYWRPcHRpb25zID0ge1xuICBzZXBhcmF0b3I6IFwiLFwiLFxuICB0cmltTGVhZGluZ1NwYWNlOiBmYWxzZSxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGluZVJlYWRlciB7XG4gIHJlYWRMaW5lKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD47XG4gIGlzRU9GKCk6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwYXJzZVJlY29yZChcbiAgbGluZTogc3RyaW5nLFxuICByZWFkZXI6IExpbmVSZWFkZXIsXG4gIG9wdDogUmVhZE9wdGlvbnMsXG4gIHN0YXJ0TGluZTogbnVtYmVyLFxuICBsaW5lSW5kZXg6IG51bWJlciA9IHN0YXJ0TGluZSxcbik6IFByb21pc2U8QXJyYXk8c3RyaW5nPiB8IG51bGw+IHtcbiAgLy8gbGluZSBzdGFydGluZyB3aXRoIGNvbW1lbnQgY2hhcmFjdGVyIGlzIGlnbm9yZWRcbiAgaWYgKG9wdC5jb21tZW50ICYmIGxpbmVbMF0gPT09IG9wdC5jb21tZW50KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgaWYgKG9wdC5zZXBhcmF0b3IgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlNlcGFyYXRvciBpcyByZXF1aXJlZFwiKTtcblxuICBsZXQgZnVsbExpbmUgPSBsaW5lO1xuICBsZXQgcXVvdGVFcnJvcjogUGFyc2VFcnJvciB8IG51bGwgPSBudWxsO1xuICBjb25zdCBxdW90ZSA9ICdcIic7XG4gIGNvbnN0IHF1b3RlTGVuID0gcXVvdGUubGVuZ3RoO1xuICBjb25zdCBzZXBhcmF0b3JMZW4gPSBvcHQuc2VwYXJhdG9yLmxlbmd0aDtcbiAgbGV0IHJlY29yZEJ1ZmZlciA9IFwiXCI7XG4gIGNvbnN0IGZpZWxkSW5kZXhlcyA9IFtdIGFzIG51bWJlcltdO1xuICBwYXJzZUZpZWxkOlxuICBmb3IgKDs7KSB7XG4gICAgaWYgKG9wdC50cmltTGVhZGluZ1NwYWNlKSB7XG4gICAgICBsaW5lID0gbGluZS50cmltU3RhcnQoKTtcbiAgICB9XG5cbiAgICBpZiAobGluZS5sZW5ndGggPT09IDAgfHwgIWxpbmUuc3RhcnRzV2l0aChxdW90ZSkpIHtcbiAgICAgIC8vIE5vbi1xdW90ZWQgc3RyaW5nIGZpZWxkXG4gICAgICBjb25zdCBpID0gbGluZS5pbmRleE9mKG9wdC5zZXBhcmF0b3IpO1xuICAgICAgbGV0IGZpZWxkID0gbGluZTtcbiAgICAgIGlmIChpID49IDApIHtcbiAgICAgICAgZmllbGQgPSBmaWVsZC5zdWJzdHJpbmcoMCwgaSk7XG4gICAgICB9XG4gICAgICAvLyBDaGVjayB0byBtYWtlIHN1cmUgYSBxdW90ZSBkb2VzIG5vdCBhcHBlYXIgaW4gZmllbGQuXG4gICAgICBpZiAoIW9wdC5sYXp5UXVvdGVzKSB7XG4gICAgICAgIGNvbnN0IGogPSBmaWVsZC5pbmRleE9mKHF1b3RlKTtcbiAgICAgICAgaWYgKGogPj0gMCkge1xuICAgICAgICAgIGNvbnN0IGNvbCA9IHJ1bmVDb3VudChcbiAgICAgICAgICAgIGZ1bGxMaW5lLnNsaWNlKDAsIGZ1bGxMaW5lLmxlbmd0aCAtIGxpbmUuc2xpY2UoaikubGVuZ3RoKSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHF1b3RlRXJyb3IgPSBuZXcgUGFyc2VFcnJvcihcbiAgICAgICAgICAgIHN0YXJ0TGluZSArIDEsXG4gICAgICAgICAgICBsaW5lSW5kZXgsXG4gICAgICAgICAgICBjb2wsXG4gICAgICAgICAgICBFUlJfQkFSRV9RVU9URSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGJyZWFrIHBhcnNlRmllbGQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlY29yZEJ1ZmZlciArPSBmaWVsZDtcbiAgICAgIGZpZWxkSW5kZXhlcy5wdXNoKHJlY29yZEJ1ZmZlci5sZW5ndGgpO1xuICAgICAgaWYgKGkgPj0gMCkge1xuICAgICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcoaSArIHNlcGFyYXRvckxlbik7XG4gICAgICAgIGNvbnRpbnVlIHBhcnNlRmllbGQ7XG4gICAgICB9XG4gICAgICBicmVhayBwYXJzZUZpZWxkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBRdW90ZWQgc3RyaW5nIGZpZWxkXG4gICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcocXVvdGVMZW4pO1xuICAgICAgZm9yICg7Oykge1xuICAgICAgICBjb25zdCBpID0gbGluZS5pbmRleE9mKHF1b3RlKTtcbiAgICAgICAgaWYgKGkgPj0gMCkge1xuICAgICAgICAgIC8vIEhpdCBuZXh0IHF1b3RlLlxuICAgICAgICAgIHJlY29yZEJ1ZmZlciArPSBsaW5lLnN1YnN0cmluZygwLCBpKTtcbiAgICAgICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcoaSArIHF1b3RlTGVuKTtcbiAgICAgICAgICBpZiAobGluZS5zdGFydHNXaXRoKHF1b3RlKSkge1xuICAgICAgICAgICAgLy8gYFwiXCJgIHNlcXVlbmNlIChhcHBlbmQgcXVvdGUpLlxuICAgICAgICAgICAgcmVjb3JkQnVmZmVyICs9IHF1b3RlO1xuICAgICAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKHF1b3RlTGVuKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChvcHQuc2VwYXJhdG9yKSkge1xuICAgICAgICAgICAgLy8gYFwiLFwiYCBzZXF1ZW5jZSAoZW5kIG9mIGZpZWxkKS5cbiAgICAgICAgICAgIGxpbmUgPSBsaW5lLnN1YnN0cmluZyhzZXBhcmF0b3JMZW4pO1xuICAgICAgICAgICAgZmllbGRJbmRleGVzLnB1c2gocmVjb3JkQnVmZmVyLmxlbmd0aCk7XG4gICAgICAgICAgICBjb250aW51ZSBwYXJzZUZpZWxkO1xuICAgICAgICAgIH0gZWxzZSBpZiAoMCA9PT0gbGluZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIGBcIlxcbmAgc2VxdWVuY2UgKGVuZCBvZiBsaW5lKS5cbiAgICAgICAgICAgIGZpZWxkSW5kZXhlcy5wdXNoKHJlY29yZEJ1ZmZlci5sZW5ndGgpO1xuICAgICAgICAgICAgYnJlYWsgcGFyc2VGaWVsZDtcbiAgICAgICAgICB9IGVsc2UgaWYgKG9wdC5sYXp5UXVvdGVzKSB7XG4gICAgICAgICAgICAvLyBgXCJgIHNlcXVlbmNlIChiYXJlIHF1b3RlKS5cbiAgICAgICAgICAgIHJlY29yZEJ1ZmZlciArPSBxdW90ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gYFwiKmAgc2VxdWVuY2UgKGludmFsaWQgbm9uLWVzY2FwZWQgcXVvdGUpLlxuICAgICAgICAgICAgY29uc3QgY29sID0gcnVuZUNvdW50KFxuICAgICAgICAgICAgICBmdWxsTGluZS5zbGljZSgwLCBmdWxsTGluZS5sZW5ndGggLSBsaW5lLmxlbmd0aCAtIHF1b3RlTGVuKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBxdW90ZUVycm9yID0gbmV3IFBhcnNlRXJyb3IoXG4gICAgICAgICAgICAgIHN0YXJ0TGluZSArIDEsXG4gICAgICAgICAgICAgIGxpbmVJbmRleCxcbiAgICAgICAgICAgICAgY29sLFxuICAgICAgICAgICAgICBFUlJfUVVPVEUsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYnJlYWsgcGFyc2VGaWVsZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobGluZS5sZW5ndGggPiAwIHx8ICFyZWFkZXIuaXNFT0YoKSkge1xuICAgICAgICAgIC8vIEhpdCBlbmQgb2YgbGluZSAoY29weSBhbGwgZGF0YSBzbyBmYXIpLlxuICAgICAgICAgIHJlY29yZEJ1ZmZlciArPSBsaW5lO1xuICAgICAgICAgIGNvbnN0IHIgPSBhd2FpdCByZWFkZXIucmVhZExpbmUoKTtcbiAgICAgICAgICBsaW5lSW5kZXgrKztcbiAgICAgICAgICBsaW5lID0gciA/PyBcIlwiOyAvLyBUaGlzIGlzIGEgd29ya2Fyb3VuZCBmb3IgbWFraW5nIHRoaXMgbW9kdWxlIGJlaGF2ZSBzaW1pbGFybHkgdG8gdGhlIGVuY29kaW5nL2Nzdi9yZWFkZXIuZ28uXG4gICAgICAgICAgZnVsbExpbmUgPSBsaW5lO1xuICAgICAgICAgIGlmIChyID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBBYnJ1cHQgZW5kIG9mIGZpbGUgKEVPRiBvciBlcnJvcikuXG4gICAgICAgICAgICBpZiAoIW9wdC5sYXp5UXVvdGVzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbCA9IHJ1bmVDb3VudChmdWxsTGluZSk7XG4gICAgICAgICAgICAgIHF1b3RlRXJyb3IgPSBuZXcgUGFyc2VFcnJvcihcbiAgICAgICAgICAgICAgICBzdGFydExpbmUgKyAxLFxuICAgICAgICAgICAgICAgIGxpbmVJbmRleCxcbiAgICAgICAgICAgICAgICBjb2wsXG4gICAgICAgICAgICAgICAgRVJSX1FVT1RFLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBicmVhayBwYXJzZUZpZWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmllbGRJbmRleGVzLnB1c2gocmVjb3JkQnVmZmVyLmxlbmd0aCk7XG4gICAgICAgICAgICBicmVhayBwYXJzZUZpZWxkO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWNvcmRCdWZmZXIgKz0gXCJcXG5cIjsgLy8gcHJlc2VydmUgbGluZSBmZWVkIChUaGlzIGlzIGJlY2F1c2UgVGV4dFByb3RvUmVhZGVyIHJlbW92ZXMgaXQuKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEFicnVwdCBlbmQgb2YgZmlsZSAoRU9GIG9uIGVycm9yKS5cbiAgICAgICAgICBpZiAoIW9wdC5sYXp5UXVvdGVzKSB7XG4gICAgICAgICAgICBjb25zdCBjb2wgPSBydW5lQ291bnQoZnVsbExpbmUpO1xuICAgICAgICAgICAgcXVvdGVFcnJvciA9IG5ldyBQYXJzZUVycm9yKFxuICAgICAgICAgICAgICBzdGFydExpbmUgKyAxLFxuICAgICAgICAgICAgICBsaW5lSW5kZXgsXG4gICAgICAgICAgICAgIGNvbCxcbiAgICAgICAgICAgICAgRVJSX1FVT1RFLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJyZWFrIHBhcnNlRmllbGQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpZWxkSW5kZXhlcy5wdXNoKHJlY29yZEJ1ZmZlci5sZW5ndGgpO1xuICAgICAgICAgIGJyZWFrIHBhcnNlRmllbGQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKHF1b3RlRXJyb3IpIHtcbiAgICB0aHJvdyBxdW90ZUVycm9yO1xuICB9XG4gIGNvbnN0IHJlc3VsdCA9IFtdIGFzIHN0cmluZ1tdO1xuICBsZXQgcHJlSWR4ID0gMDtcbiAgZm9yIChjb25zdCBpIG9mIGZpZWxkSW5kZXhlcykge1xuICAgIHJlc3VsdC5wdXNoKHJlY29yZEJ1ZmZlci5zbGljZShwcmVJZHgsIGkpKTtcbiAgICBwcmVJZHggPSBpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHJ1bmVDb3VudChzOiBzdHJpbmcpOiBudW1iZXIge1xuICAvLyBBcnJheS5mcm9tIGNvbnNpZGVycyB0aGUgc3Vycm9nYXRlIHBhaXIuXG4gIHJldHVybiBBcnJheS5mcm9tKHMpLmxlbmd0aDtcbn1cblxuLyoqXG4gKiBBIFBhcnNlRXJyb3IgaXMgcmV0dXJuZWQgZm9yIHBhcnNpbmcgZXJyb3JzLlxuICogTGluZSBudW1iZXJzIGFyZSAxLWluZGV4ZWQgYW5kIGNvbHVtbnMgYXJlIDAtaW5kZXhlZC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlLCBQYXJzZUVycm9yIH0gZnJvbSBcIkBzdGQvY3N2L3BhcnNlXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIHRyeSB7XG4gKiAgIHBhcnNlKGBhIFwid29yZFwiLFwiYlwiYCk7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBQYXJzZUVycm9yKSB7XG4gKiAgICAgYXNzZXJ0RXF1YWxzKGVycm9yLm1lc3NhZ2UsIGBwYXJzZSBlcnJvciBvbiBsaW5lIDEsIGNvbHVtbiAyOiBiYXJlIFwiIGluIG5vbi1xdW90ZWQtZmllbGRgKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXJzZUVycm9yIGV4dGVuZHMgU3ludGF4RXJyb3Ige1xuICAvKipcbiAgICogTGluZSB3aGVyZSB0aGUgcmVjb3JkIHN0YXJ0cy5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgcGFyc2UsIFBhcnNlRXJyb3IgfSBmcm9tIFwiQHN0ZC9jc3YvcGFyc2VcIjtcbiAgICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydC1lcXVhbHNcIjtcbiAgICpcbiAgICogdHJ5IHtcbiAgICogICBwYXJzZShgYSBcIndvcmRcIixcImJcImApO1xuICAgKiB9IGNhdGNoIChlcnJvcikge1xuICAgKiAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFBhcnNlRXJyb3IpIHtcbiAgICogICAgIGFzc2VydEVxdWFscyhlcnJvci5zdGFydExpbmUsIDEpO1xuICAgKiAgIH1cbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIHN0YXJ0TGluZTogbnVtYmVyO1xuICAvKipcbiAgICogTGluZSB3aGVyZSB0aGUgZXJyb3Igb2NjdXJyZWQuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IHBhcnNlLCBQYXJzZUVycm9yIH0gZnJvbSBcIkBzdGQvY3N2L3BhcnNlXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gICAqXG4gICAqIHRyeSB7XG4gICAqICAgcGFyc2UoYGEgXCJ3b3JkXCIsXCJiXCJgKTtcbiAgICogfSBjYXRjaCAoZXJyb3IpIHtcbiAgICogICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBQYXJzZUVycm9yKSB7XG4gICAqICAgICBhc3NlcnRFcXVhbHMoZXJyb3IubGluZSwgMSk7XG4gICAqICAgfVxuICAgKiB9XG4gICAqIGBgYFxuICAgKi9cbiAgbGluZTogbnVtYmVyO1xuICAvKipcbiAgICogQ29sdW1uIChydW5lIGluZGV4KSB3aGVyZSB0aGUgZXJyb3Igb2NjdXJyZWQuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IHBhcnNlLCBQYXJzZUVycm9yIH0gZnJvbSBcIkBzdGQvY3N2L3BhcnNlXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gICAqXG4gICAqIHRyeSB7XG4gICAqICAgcGFyc2UoYGEgXCJ3b3JkXCIsXCJiXCJgKTtcbiAgICogfSBjYXRjaCAoZXJyb3IpIHtcbiAgICogICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBQYXJzZUVycm9yKSB7XG4gICAqICAgICBhc3NlcnRFcXVhbHMoZXJyb3IuY29sdW1uLCAyKTtcbiAgICogICB9XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBjb2x1bW46IG51bWJlciB8IG51bGw7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IHBhcnNlLCBQYXJzZUVycm9yIH0gZnJvbSBcIkBzdGQvY3N2L3BhcnNlXCI7XG4gICAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gICAqXG4gICAqIHRyeSB7XG4gICAqICAgcGFyc2UoYGEgXCJ3b3JkXCIsXCJiXCJgKTtcbiAgICogfSBjYXRjaCAoZXJyb3IpIHtcbiAgICogICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBQYXJzZUVycm9yKSB7XG4gICAqICAgICBhc3NlcnRFcXVhbHMoZXJyb3IubWVzc2FnZSwgYHBhcnNlIGVycm9yIG9uIGxpbmUgMSwgY29sdW1uIDI6IGJhcmUgXCIgaW4gbm9uLXF1b3RlZC1maWVsZGApO1xuICAgKiAgIH1cbiAgICogfVxuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0IExpbmUgd2hlcmUgdGhlIHJlY29yZCBzdGFydHNcbiAgICogQHBhcmFtIGxpbmUgTGluZSB3aGVyZSB0aGUgZXJyb3Igb2NjdXJyZWRcbiAgICogQHBhcmFtIGNvbHVtbiBDb2x1bW4gVGhlIGluZGV4IHdoZXJlIHRoZSBlcnJvciBvY2N1cnJlZFxuICAgKiBAcGFyYW0gbWVzc2FnZSBFcnJvciBtZXNzYWdlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBzdGFydDogbnVtYmVyLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlciB8IG51bGwsXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RhcnRMaW5lID0gc3RhcnQ7XG4gICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XG4gICAgdGhpcy5saW5lID0gbGluZTtcblxuICAgIGlmIChtZXNzYWdlID09PSBFUlJfRklFTERfQ09VTlQpIHtcbiAgICAgIHRoaXMubWVzc2FnZSA9IGByZWNvcmQgb24gbGluZSAke2xpbmV9OiAke21lc3NhZ2V9YDtcbiAgICB9IGVsc2UgaWYgKHN0YXJ0ICE9PSBsaW5lKSB7XG4gICAgICB0aGlzLm1lc3NhZ2UgPVxuICAgICAgICBgcmVjb3JkIG9uIGxpbmUgJHtzdGFydH07IHBhcnNlIGVycm9yIG9uIGxpbmUgJHtsaW5lfSwgY29sdW1uICR7Y29sdW1ufTogJHttZXNzYWdlfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubWVzc2FnZSA9XG4gICAgICAgIGBwYXJzZSBlcnJvciBvbiBsaW5lICR7bGluZX0sIGNvbHVtbiAke2NvbHVtbn06ICR7bWVzc2FnZX1gO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgRVJSX0JBUkVfUVVPVEUgPSAnYmFyZSBcIiBpbiBub24tcXVvdGVkLWZpZWxkJztcbmV4cG9ydCBjb25zdCBFUlJfUVVPVEUgPSAnZXh0cmFuZW91cyBvciBtaXNzaW5nIFwiIGluIHF1b3RlZC1maWVsZCc7XG5leHBvcnQgY29uc3QgRVJSX0lOVkFMSURfREVMSU0gPSBcIkludmFsaWQgRGVsaW1pdGVyXCI7XG5leHBvcnQgY29uc3QgRVJSX0ZJRUxEX0NPVU5UID0gXCJ3cm9uZyBudW1iZXIgb2YgZmllbGRzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0Um93VG9PYmplY3QoXG4gIHJvdzogc3RyaW5nW10sXG4gIGhlYWRlcnM6IHJlYWRvbmx5IHN0cmluZ1tdLFxuICBpbmRleDogbnVtYmVyLFxuKSB7XG4gIGlmIChyb3cubGVuZ3RoICE9PSBoZWFkZXJzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBFcnJvciBudW1iZXIgb2YgZmllbGRzIGxpbmU6ICR7aW5kZXh9XFxuTnVtYmVyIG9mIGZpZWxkcyBmb3VuZDogJHtoZWFkZXJzLmxlbmd0aH1cXG5FeHBlY3RlZCBudW1iZXIgb2YgZmllbGRzOiAke3Jvdy5sZW5ndGh9YCxcbiAgICApO1xuICB9XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcbiAgZm9yIChjb25zdCBbaW5kZXgsIGhlYWRlcl0gb2YgaGVhZGVycy5lbnRyaWVzKCkpIHtcbiAgICBvdXRbaGVhZGVyXSA9IHJvd1tpbmRleF07XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqIE9wdGlvbnMgZm9yIHtAbGlua2NvZGUgcGFyc2V9IGFuZCB7QGxpbmtjb2RlIENzdlBhcnNlU3RyZWFtfS4gKi9cbmV4cG9ydCB0eXBlIFBhcnNlUmVzdWx0PFBhcnNlT3B0aW9ucywgVD4gPVxuICAvLyBJZiBgY29sdW1uc2Agb3B0aW9uIGlzIHNwZWNpZmllZCwgdGhlIHJldHVybiB0eXBlIGlzIFJlY29yZCB0eXBlLlxuICBUIGV4dGVuZHMgUGFyc2VPcHRpb25zICYgeyBjb2x1bW5zOiByZWFkb25seSAoaW5mZXIgQyBleHRlbmRzIHN0cmluZylbXSB9XG4gICAgPyBSZWNvcmRXaXRoQ29sdW1uPEM+W11cbiAgICAvLyBJZiBgc2tpcEZpcnN0Um93YCBvcHRpb24gaXMgc3BlY2lmaWVkLCB0aGUgcmV0dXJuIHR5cGUgaXMgUmVjb3JkIHR5cGUuXG4gICAgOiBUIGV4dGVuZHMgUGFyc2VPcHRpb25zICYgeyBza2lwRmlyc3RSb3c6IHRydWUgfVxuICAgICAgPyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWQ+W11cbiAgICAvLyBJZiBgY29sdW1uc2AgYW5kIGBza2lwRmlyc3RSb3dgIG9wdGlvbiBpcyBfbm90XyBzcGVjaWZpZWQsIHRoZSByZXR1cm4gdHlwZSBpcyBzdHJpbmdbXVtdLlxuICAgIDogVCBleHRlbmRzXG4gICAgICBQYXJzZU9wdGlvbnMgJiB7IGNvbHVtbnM/OiB1bmRlZmluZWQ7IHNraXBGaXJzdFJvdz86IGZhbHNlIHwgdW5kZWZpbmVkIH1cbiAgICAgID8gc3RyaW5nW11bXVxuICAgIC8vIGVsc2UsIHRoZSByZXR1cm4gdHlwZSBpcyBSZWNvcmQgdHlwZSBvciBzdHJpbmdbXVtdLlxuICAgIDogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgdW5kZWZpbmVkPltdIHwgc3RyaW5nW11bXTtcblxuLyoqXG4gKiBSZWNvcmQgdHlwZSB3aXRoIGNvbHVtbiB0eXBlLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBcbiAqIHR5cGUgUmVjb3JkV2l0aENvbHVtbjxcImFhYVwifFwiYmJiXCI+ID0+IFJlY29yZDxcImFhYVwifFwiYmJiXCIsIHN0cmluZz5cbiAqIHR5cGUgUmVjb3JkV2l0aENvbHVtbjxzdHJpbmc+ID0+IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHVuZGVmaW5lZD5cbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBSZWNvcmRXaXRoQ29sdW1uPEMgZXh0ZW5kcyBzdHJpbmc+ID0gc3RyaW5nIGV4dGVuZHMgQ1xuICA/IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHVuZGVmaW5lZD5cbiAgOiBSZWNvcmQ8Qywgc3RyaW5nPjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSw2QkFBNkI7QUFDN0IsK0RBQStEO0FBQy9ELG1FQUFtRTtBQUNuRSxtREFBbUQ7QUFDbkQsMEVBQTBFO0FBRTFFLHlDQUF5QyxHQTRDekMsT0FBTyxNQUFNLHFCQUFrQztFQUM3QyxXQUFXO0VBQ1gsa0JBQWtCO0FBQ3BCLEVBQUU7QUFPRixPQUFPLGVBQWUsWUFDcEIsSUFBWSxFQUNaLE1BQWtCLEVBQ2xCLEdBQWdCLEVBQ2hCLFNBQWlCLEVBQ2pCLFlBQW9CLFNBQVM7RUFFN0Isa0RBQWtEO0VBQ2xELElBQUksSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxJQUFJLE9BQU8sRUFBRTtJQUMxQyxPQUFPLEVBQUU7RUFDWDtFQUVBLElBQUksSUFBSSxTQUFTLEtBQUssV0FBVyxNQUFNLElBQUksVUFBVTtFQUVyRCxJQUFJLFdBQVc7RUFDZixJQUFJLGFBQWdDO0VBQ3BDLE1BQU0sUUFBUTtFQUNkLE1BQU0sV0FBVyxNQUFNLE1BQU07RUFDN0IsTUFBTSxlQUFlLElBQUksU0FBUyxDQUFDLE1BQU07RUFDekMsSUFBSSxlQUFlO0VBQ25CLE1BQU0sZUFBZSxFQUFFO0VBQ3ZCLFlBQ0EsT0FBUztJQUNQLElBQUksSUFBSSxnQkFBZ0IsRUFBRTtNQUN4QixPQUFPLEtBQUssU0FBUztJQUN2QjtJQUVBLElBQUksS0FBSyxNQUFNLEtBQUssS0FBSyxDQUFDLEtBQUssVUFBVSxDQUFDLFFBQVE7TUFDaEQsMEJBQTBCO01BQzFCLE1BQU0sSUFBSSxLQUFLLE9BQU8sQ0FBQyxJQUFJLFNBQVM7TUFDcEMsSUFBSSxRQUFRO01BQ1osSUFBSSxLQUFLLEdBQUc7UUFDVixRQUFRLE1BQU0sU0FBUyxDQUFDLEdBQUc7TUFDN0I7TUFDQSx1REFBdUQ7TUFDdkQsSUFBSSxDQUFDLElBQUksVUFBVSxFQUFFO1FBQ25C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
// denoCacheMetadata=16337252763219855237,5785339016444820141