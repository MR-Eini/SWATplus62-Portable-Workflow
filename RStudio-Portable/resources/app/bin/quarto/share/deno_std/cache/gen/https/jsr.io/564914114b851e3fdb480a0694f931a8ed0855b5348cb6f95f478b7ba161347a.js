// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { deepMerge } from "jsr:/@std/collections@^1.0.0-rc.1/deep-merge";
export class TOMLParseError extends Error {
}
export class Scanner {
  source;
  #whitespace;
  #position;
  constructor(source){
    this.source = source;
    this.#whitespace = /[ \t]/;
    this.#position = 0;
  }
  /**
   * Get current character
   * @param index - relative index from current position
   */ char(index = 0) {
    return this.source[this.#position + index] ?? "";
  }
  /**
   * Get sliced string
   * @param start - start position relative from current position
   * @param end - end position relative from current position
   */ slice(start, end) {
    return this.source.slice(this.#position + start, this.#position + end);
  }
  /**
   * Move position to next
   */ next(count) {
    if (typeof count === "number") {
      for(let i = 0; i < count; i++){
        this.#position++;
      }
    } else {
      this.#position++;
    }
  }
  /**
   * Move position until current char is not a whitespace, EOL, or comment.
   * @param options.inline - skip only whitespaces
   */ nextUntilChar(options = {
    comment: true
  }) {
    if (options.inline) {
      while(this.#whitespace.test(this.char()) && !this.eof()){
        this.next();
      }
    } else {
      while(!this.eof()){
        const char = this.char();
        if (this.#whitespace.test(char) || this.isCurrentCharEOL()) {
          this.next();
        } else if (options.comment && this.char() === "#") {
          // entering comment
          while(!this.isCurrentCharEOL() && !this.eof()){
            this.next();
          }
        } else {
          break;
        }
      }
    }
    // Invalid if current char is other kinds of whitespace
    if (!this.isCurrentCharEOL() && /\s/.test(this.char())) {
      const escaped = "\\u" + this.char().charCodeAt(0).toString(16);
      throw new TOMLParseError(`Contains invalid whitespaces: \`${escaped}\``);
    }
  }
  /**
   * Position reached EOF or not
   */ eof() {
    return this.position() >= this.source.length;
  }
  /**
   * Get current position
   */ position() {
    return this.#position;
  }
  isCurrentCharEOL() {
    return this.char() === "\n" || this.slice(0, 2) === "\r\n";
  }
}
// -----------------------
// Utilities
// -----------------------
function success(body) {
  return {
    ok: true,
    body
  };
}
function failure() {
  return {
    ok: false
  };
}
export const Utils = {
  unflat (keys, values = {}, cObj) {
    const out = {};
    if (keys.length === 0) {
      return cObj;
    } else {
      if (!cObj) {
        cObj = values;
      }
      const key = keys[keys.length - 1];
      if (typeof key === "string") {
        out[key] = cObj;
      }
      return this.unflat(keys.slice(0, -1), values, out);
    }
  },
  deepAssignWithTable (target, table) {
    if (table.key.length === 0 || table.key[0] == null) {
      throw new Error("Unexpected key length");
    }
    const value = target[table.key[0]];
    if (typeof value === "undefined") {
      Object.assign(target, this.unflat(table.key, table.type === "Table" ? table.value : [
        table.value
      ]));
    } else if (Array.isArray(value)) {
      if (table.type === "TableArray" && table.key.length === 1) {
        value.push(table.value);
      } else {
        const last = value[value.length - 1];
        Utils.deepAssignWithTable(last, {
          type: table.type,
          key: table.key.slice(1),
          value: table.value
        });
      }
    } else if (typeof value === "object" && value !== null) {
      Utils.deepAssignWithTable(value, {
        type: table.type,
        key: table.key.slice(1),
        value: table.value
      });
    } else {
      throw new Error("Unexpected assign");
    }
  }
};
// ---------------------------------
// Parser combinators and generators
// ---------------------------------
function or(parsers) {
  return function Or(scanner) {
    for (const parse of parsers){
      const result = parse(scanner);
      if (result.ok) {
        return result;
      }
    }
    return failure();
  };
}
function join(parser, separator) {
  const Separator = character(separator);
  return function Join(scanner) {
    const first = parser(scanner);
    if (!first.ok) {
      return failure();
    }
    const out = [
      first.body
    ];
    while(!scanner.eof()){
      if (!Separator(scanner).ok) {
        break;
      }
      const result = parser(scanner);
      if (result.ok) {
        out.push(result.body);
      } else {
        throw new TOMLParseError(`Invalid token after "${separator}"`);
      }
    }
    return success(out);
  };
}
function kv(keyParser, separator, valueParser) {
  const Separator = character(separator);
  return function Kv(scanner) {
    const key = keyParser(scanner);
    if (!key.ok) {
      return failure();
    }
    const sep = Separator(scanner);
    if (!sep.ok) {
      throw new TOMLParseError(`key/value pair doesn't have "${separator}"`);
    }
    const value = valueParser(scanner);
    if (!value.ok) {
      throw new TOMLParseError(`Value of key/value pair is invalid data format`);
    }
    return success(Utils.unflat(key.body, value.body));
  };
}
function merge(parser) {
  return function Merge(scanner) {
    const result = parser(scanner);
    if (!result.ok) {
      return failure();
    }
    let body = {};
    for (const record of result.body){
      if (typeof body === "object" && body !== null) {
        // deno-lint-ignore no-explicit-any
        body = deepMerge(body, record);
      }
    }
    return success(body);
  };
}
function repeat(parser) {
  return function Repeat(scanner) {
    const body = [];
    while(!scanner.eof()){
      const result = parser(scanner);
      if (result.ok) {
        body.push(result.body);
      } else {
        break;
      }
      scanner.nextUntilChar();
    }
    if (body.length === 0) {
      return failure();
    }
    return success(body);
  };
}
function surround(left, parser, right) {
  const Left = character(left);
  const Right = character(right);
  return function Surround(scanner) {
    if (!Left(scanner).ok) {
      return failure();
    }
    const result = parser(scanner);
    if (!result.ok) {
      throw new TOMLParseError(`Invalid token after "${left}"`);
    }
    if (!Right(scanner).ok) {
      throw new TOMLParseError(`Not closed by "${right}" after started with "${left}"`);
    }
    return success(result.body);
  };
}
function character(str) {
  return function character(scanner) {
    scanner.nextUntilChar({
      inline: true
    });
    if (scanner.slice(0, str.length) === str) {
      scanner.next(str.length);
    } else {
      return failure();
    }
    scanner.nextUntilChar({
      inline: true
    });
    return success(undefined);
  };
}
// -----------------------
// Parser components
// -----------------------
const Patterns = {
  BARE_KEY: /[A-Za-z0-9_-]/,
  FLOAT: /[0-9_\.e+\-]/i,
  END_OF_VALUE: /[ \t\r\n#,}\]]/
};
export function BareKey(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  if (!scanner.char() || !Patterns.BARE_KEY.test(scanner.char())) {
    return failure();
  }
  const acc = [];
  while(scanner.char() && Patterns.BARE_KEY.test(scanner.char())){
    acc.push(scanner.char());
    scanner.next();
  }
  const key = acc.join("");
  return success(key);
}
function EscapeSequence(scanner) {
  if (scanner.char() === "\\") {
    scanner.next();
    // See https://toml.io/en/v1.0.0-rc.3#string
    switch(scanner.char()){
      case "b":
        scanner.next();
        return success("\b");
      case "t":
        scanner.next();
        return success("\t");
      case "n":
        scanner.next();
        return success("\n");
      case "f":
        scanner.next();
        return success("\f");
      case "r":
        scanner.next();
        return success("\r");
      case "u":
      case "U":
        {
          // Unicode character
          const codePointLen = scanner.char() === "u" ? 4 : 6;
          const codePoint = parseInt("0x" + scanner.slice(1, 1 + codePointLen), 16);
          const str = String.fromCodePoint(codePoint);
          scanner.next(codePointLen + 1);
          return success(str);
        }
      case '"':
        scanner.next();
        return success('"');
      case "\\":
        scanner.next();
        return success("\\");
      default:
        throw new TOMLParseError(`Invalid escape sequence: \\${scanner.char()}`);
    }
  } else {
    return failure();
  }
}
export function BasicString(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  if (scanner.char() === '"') {
    scanner.next();
  } else {
    return failure();
  }
  const acc = [];
  while(scanner.char() !== '"' && !scanner.eof()){
    if (scanner.char() === "\n") {
      throw new TOMLParseError("Single-line string cannot contain EOL");
    }
    const escapedChar = EscapeSequence(scanner);
    if (escapedChar.ok) {
      acc.push(escapedChar.body);
    } else {
      acc.push(scanner.char());
      scanner.next();
    }
  }
  if (scanner.eof()) {
    throw new TOMLParseError(`Single-line string is not closed:\n${acc.join("")}`);
  }
  scanner.next(); // skip last '""
  return success(acc.join(""));
}
export function LiteralString(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  if (scanner.char() === "'") {
    scanner.next();
  } else {
    return failure();
  }
  const acc = [];
  while(scanner.char() !== "'" && !scanner.eof()){
    if (scanner.char() === "\n") {
      throw new TOMLParseError("Single-line string cannot contain EOL");
    }
    acc.push(scanner.char());
    scanner.next();
  }
  if (scanner.eof()) {
    throw new TOMLParseError(`Single-line string is not closed:\n${acc.join("")}`);
  }
  scanner.next(); // skip last "'"
  return success(acc.join(""));
}
export function MultilineBasicString(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  if (scanner.slice(0, 3) === '"""') {
    scanner.next(3);
  } else {
    return failure();
  }
  if (scanner.char() === "\n") {
    // The first newline (LF) is trimmed
    scanner.next();
  } else if (scanner.slice(0, 2) === "\r\n") {
    // The first newline (CRLF) is trimmed
    scanner.next(2);
  }
  const acc = [];
  while(scanner.slice(0, 3) !== '"""' && !scanner.eof()){
    // line ending backslash
    if (scanner.slice(0, 2) === "\\\n") {
      scanner.next();
      scanner.nextUntilChar({
        comment: false
      });
      continue;
    } else if (scanner.slice(0, 3) === "\\\r\n") {
      scanner.next();
      scanner.nextUntilChar({
        comment: false
      });
      continue;
    }
    const escapedChar = EscapeSequence(scanner);
    if (escapedChar.ok) {
      acc.push(escapedChar.body);
    } else {
      acc.push(scanner.char());
      scanner.next();
    }
  }
  if (scanner.eof()) {
    throw new TOMLParseError(`Multi-line string is not closed:\n${acc.join("")}`);
  }
  // if ends with 4 `"`, push the fist `"` to string
  if (scanner.char(3) === '"') {
    acc.push('"');
    scanner.next();
  }
  scanner.next(3); // skip last '""""
  return success(acc.join(""));
}
export function MultilineLiteralString(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  if (scanner.slice(0, 3) === "'''") {
    scanner.next(3);
  } else {
    return failure();
  }
  if (scanner.char() === "\n") {
    // The first newline (LF) is trimmed
    scanner.next();
  } else if (scanner.slice(0, 2) === "\r\n") {
    // The first newline (CRLF) is trimmed
    scanner.next(2);
  }
  const acc = [];
  while(scanner.slice(0, 3) !== "'''" && !scanner.eof()){
    acc.push(scanner.char());
    scanner.next();
  }
  if (scanner.eof()) {
    throw new TOMLParseError(`Multi-line string is not closed:\n${acc.join("")}`);
  }
  // if ends with 4 `'`, push the fist `'` to string
  if (scanner.char(3) === "'") {
    acc.push("'");
    scanner.next();
  }
  scanner.next(3); // skip last "'''"
  return success(acc.join(""));
}
const symbolPairs = [
  [
    "true",
    true
  ],
  [
    "false",
    false
  ],
  [
    "inf",
    Infinity
  ],
  [
    "+inf",
    Infinity
  ],
  [
    "-inf",
    -Infinity
  ],
  [
    "nan",
    NaN
  ],
  [
    "+nan",
    NaN
  ],
  [
    "-nan",
    NaN
  ]
];
export function Symbols(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  const found = symbolPairs.find(([str])=>scanner.slice(0, str.length) === str);
  if (!found) {
    return failure();
  }
  const [str, value] = found;
  scanner.next(str.length);
  return success(value);
}
export const DottedKey = join(or([
  BareKey,
  BasicString,
  LiteralString
]), ".");
export function Integer(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  // If binary / octal / hex
  const first2 = scanner.slice(0, 2);
  if (first2.length === 2 && /0(?:x|o|b)/i.test(first2)) {
    scanner.next(2);
    const acc = [
      first2
    ];
    while(/[0-9a-f_]/i.test(scanner.char()) && !scanner.eof()){
      acc.push(scanner.char());
      scanner.next();
    }
    if (acc.length === 1) {
      return failure();
    }
    return success(acc.join(""));
  }
  const acc = [];
  if (/[+-]/.test(scanner.char())) {
    acc.push(scanner.char());
    scanner.next();
  }
  while(/[0-9_]/.test(scanner.char()) && !scanner.eof()){
    acc.push(scanner.char());
    scanner.next();
  }
  if (acc.length === 0 || acc.length === 1 && /[+-]/.test(acc[0])) {
    return failure();
  }
  const int = parseInt(acc.filter((char)=>char !== "_").join(""));
  return success(int);
}
export function Float(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  // lookahead validation is needed for integer value is similar to float
  let position = 0;
  while(scanner.char(position) && !Patterns.END_OF_VALUE.test(scanner.char(position))){
    if (!Patterns.FLOAT.test(scanner.char(position))) {
      return failure();
    }
    position++;
  }
  const acc = [];
  if (/[+-]/.test(scanner.char())) {
    acc.push(scanner.char());
    scanner.next();
  }
  while(Patterns.FLOAT.test(scanner.char()) && !scanner.eof()){
    acc.push(scanner.char());
    scanner.next();
  }
  if (acc.length === 0) {
    return failure();
  }
  const float = parseFloat(acc.filter((char)=>char !== "_").join(""));
  if (isNaN(float)) {
    return failure();
  }
  return success(float);
}
export function DateTime(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  let dateStr = scanner.slice(0, 10);
  // example: 1979-05-27
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    scanner.next(10);
  } else {
    return failure();
  }
  const acc = [];
  // example: 1979-05-27T00:32:00Z
  while(/[ 0-9TZ.:-]/.test(scanner.char()) && !scanner.eof()){
    acc.push(scanner.char());
    scanner.next();
  }
  dateStr += acc.join("");
  const date = new Date(dateStr.trim());
  // invalid date
  if (isNaN(date.getTime())) {
    throw new TOMLParseError(`Invalid date string "${dateStr}"`);
  }
  return success(date);
}
export function LocalTime(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  let timeStr = scanner.slice(0, 8);
  if (/^(\d{2}):(\d{2}):(\d{2})/.test(timeStr)) {
    scanner.next(8);
  } else {
    return failure();
  }
  const acc = [];
  if (scanner.char() === ".") {
    acc.push(scanner.char());
    scanner.next();
  } else {
    return success(timeStr);
  }
  while(/[0-9]/.test(scanner.char()) && !scanner.eof()){
    acc.push(scanner.char());
    scanner.next();
  }
  timeStr += acc.join("");
  return success(timeStr);
}
export function ArrayValue(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  if (scanner.char() === "[") {
    scanner.next();
  } else {
    return failure();
  }
  const array = [];
  while(!scanner.eof()){
    scanner.nextUntilChar();
    const result = Value(scanner);
    if (result.ok) {
      array.push(result.body);
    } else {
      break;
    }
    scanner.nextUntilChar({
      inline: true
    });
    // may have a next item, but trailing comma is allowed at array
    if (scanner.char() === ",") {
      scanner.next();
    } else {
      break;
    }
  }
  scanner.nextUntilChar();
  if (scanner.char() === "]") {
    scanner.next();
  } else {
    throw new TOMLParseError("Array is not closed");
  }
  return success(array);
}
export function InlineTable(scanner) {
  scanner.nextUntilChar();
  if (scanner.char(1) === "}") {
    scanner.next(2);
    return success({});
  }
  const pairs = surround("{", join(Pair, ","), "}")(scanner);
  if (!pairs.ok) {
    return failure();
  }
  let table = {};
  for (const pair of pairs.body){
    table = deepMerge(table, pair);
  }
  return success(table);
}
export const Value = or([
  MultilineBasicString,
  MultilineLiteralString,
  BasicString,
  LiteralString,
  Symbols,
  DateTime,
  LocalTime,
  Float,
  Integer,
  ArrayValue,
  InlineTable
]);
export const Pair = kv(DottedKey, "=", Value);
export function Block(scanner) {
  scanner.nextUntilChar();
  const result = merge(repeat(Pair))(scanner);
  if (result.ok) {
    return success({
      type: "Block",
      value: result.body
    });
  } else {
    return failure();
  }
}
export const TableHeader = surround("[", DottedKey, "]");
export function Table(scanner) {
  scanner.nextUntilChar();
  const header = TableHeader(scanner);
  if (!header.ok) {
    return failure();
  }
  scanner.nextUntilChar();
  const block = Block(scanner);
  return success({
    type: "Table",
    key: header.body,
    value: block.ok ? block.body.value : {}
  });
}
export const TableArrayHeader = surround("[[", DottedKey, "]]");
export function TableArray(scanner) {
  scanner.nextUntilChar();
  const header = TableArrayHeader(scanner);
  if (!header.ok) {
    return failure();
  }
  scanner.nextUntilChar();
  const block = Block(scanner);
  return success({
    type: "TableArray",
    key: header.body,
    value: block.ok ? block.body.value : {}
  });
}
export function Toml(scanner) {
  const blocks = repeat(or([
    Block,
    TableArray,
    Table
  ]))(scanner);
  if (!blocks.ok) {
    return failure();
  }
  let body = {};
  for (const block of blocks.body){
    switch(block.type){
      case "Block":
        {
          body = deepMerge(body, block.value);
          break;
        }
      case "Table":
        {
          Utils.deepAssignWithTable(body, block);
          break;
        }
      case "TableArray":
        {
          Utils.deepAssignWithTable(body, block);
          break;
        }
    }
  }
  return success(body);
}
export function ParserFactory(parser) {
  return function parse(tomlString) {
    const scanner = new Scanner(tomlString);
    let parsed = null;
    let err = null;
    try {
      parsed = parser(scanner);
    } catch (e) {
      err = e instanceof Error ? e : new Error("[non-error thrown]");
    }
    if (err || !parsed || !parsed.ok || !scanner.eof()) {
      const position = scanner.position();
      const subStr = tomlString.slice(0, position);
      const lines = subStr.split("\n");
      const row = lines.length;
      const column = (()=>{
        let count = subStr.length;
        for (const line of lines){
          if (count > line.length) {
            count -= line.length + 1;
          } else {
            break;
          }
        }
        return count;
      })();
      const message = `Parse error on line ${row}, column ${column}: ${err ? err.message : `Unexpected character: "${scanner.char()}"`}`;
      throw new TOMLParseError(message);
    }
    return parsed.body;
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvdG9tbC8wLjIyNC4xL19wYXJzZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgZGVlcE1lcmdlIH0gZnJvbSBcImpzcjovQHN0ZC9jb2xsZWN0aW9uc0BeMS4wLjAtcmMuMS9kZWVwLW1lcmdlXCI7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSW50ZXJmYWNlcyBhbmQgYmFzZSBjbGFzc2VzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuaW50ZXJmYWNlIFN1Y2Nlc3M8VD4ge1xuICBvazogdHJ1ZTtcbiAgYm9keTogVDtcbn1cbmludGVyZmFjZSBGYWlsdXJlIHtcbiAgb2s6IGZhbHNlO1xufVxudHlwZSBQYXJzZVJlc3VsdDxUPiA9IFN1Y2Nlc3M8VD4gfCBGYWlsdXJlO1xuXG50eXBlIFBhcnNlckNvbXBvbmVudDxUID0gdW5rbm93bj4gPSAoc2Nhbm5lcjogU2Nhbm5lcikgPT4gUGFyc2VSZXN1bHQ8VD47XG5cbnR5cGUgQmxvY2tQYXJzZVJlc3VsdEJvZHkgPSB7XG4gIHR5cGU6IFwiQmxvY2tcIjtcbiAgdmFsdWU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufSB8IHtcbiAgdHlwZTogXCJUYWJsZVwiO1xuICBrZXk6IHN0cmluZ1tdO1xuICB2YWx1ZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59IHwge1xuICB0eXBlOiBcIlRhYmxlQXJyYXlcIjtcbiAga2V5OiBzdHJpbmdbXTtcbiAgdmFsdWU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufTtcblxuZXhwb3J0IGNsYXNzIFRPTUxQYXJzZUVycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuZXhwb3J0IGNsYXNzIFNjYW5uZXIge1xuICAjd2hpdGVzcGFjZSA9IC9bIFxcdF0vO1xuICAjcG9zaXRpb24gPSAwO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNvdXJjZTogc3RyaW5nKSB7fVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCBjaGFyYWN0ZXJcbiAgICogQHBhcmFtIGluZGV4IC0gcmVsYXRpdmUgaW5kZXggZnJvbSBjdXJyZW50IHBvc2l0aW9uXG4gICAqL1xuICBjaGFyKGluZGV4ID0gMCkge1xuICAgIHJldHVybiB0aGlzLnNvdXJjZVt0aGlzLiNwb3NpdGlvbiArIGluZGV4XSA/PyBcIlwiO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBzbGljZWQgc3RyaW5nXG4gICAqIEBwYXJhbSBzdGFydCAtIHN0YXJ0IHBvc2l0aW9uIHJlbGF0aXZlIGZyb20gY3VycmVudCBwb3NpdGlvblxuICAgKiBAcGFyYW0gZW5kIC0gZW5kIHBvc2l0aW9uIHJlbGF0aXZlIGZyb20gY3VycmVudCBwb3NpdGlvblxuICAgKi9cbiAgc2xpY2Uoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnNvdXJjZS5zbGljZSh0aGlzLiNwb3NpdGlvbiArIHN0YXJ0LCB0aGlzLiNwb3NpdGlvbiArIGVuZCk7XG4gIH1cblxuICAvKipcbiAgICogTW92ZSBwb3NpdGlvbiB0byBuZXh0XG4gICAqL1xuICBuZXh0KGNvdW50PzogbnVtYmVyKSB7XG4gICAgaWYgKHR5cGVvZiBjb3VudCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgIHRoaXMuI3Bvc2l0aW9uKys7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuI3Bvc2l0aW9uKys7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgcG9zaXRpb24gdW50aWwgY3VycmVudCBjaGFyIGlzIG5vdCBhIHdoaXRlc3BhY2UsIEVPTCwgb3IgY29tbWVudC5cbiAgICogQHBhcmFtIG9wdGlvbnMuaW5saW5lIC0gc2tpcCBvbmx5IHdoaXRlc3BhY2VzXG4gICAqL1xuICBuZXh0VW50aWxDaGFyKFxuICAgIG9wdGlvbnM6IHsgaW5saW5lPzogYm9vbGVhbjsgY29tbWVudD86IGJvb2xlYW4gfSA9IHsgY29tbWVudDogdHJ1ZSB9LFxuICApIHtcbiAgICBpZiAob3B0aW9ucy5pbmxpbmUpIHtcbiAgICAgIHdoaWxlICh0aGlzLiN3aGl0ZXNwYWNlLnRlc3QodGhpcy5jaGFyKCkpICYmICF0aGlzLmVvZigpKSB7XG4gICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAoIXRoaXMuZW9mKCkpIHtcbiAgICAgICAgY29uc3QgY2hhciA9IHRoaXMuY2hhcigpO1xuICAgICAgICBpZiAodGhpcy4jd2hpdGVzcGFjZS50ZXN0KGNoYXIpIHx8IHRoaXMuaXNDdXJyZW50Q2hhckVPTCgpKSB7XG4gICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5jb21tZW50ICYmIHRoaXMuY2hhcigpID09PSBcIiNcIikge1xuICAgICAgICAgIC8vIGVudGVyaW5nIGNvbW1lbnRcbiAgICAgICAgICB3aGlsZSAoIXRoaXMuaXNDdXJyZW50Q2hhckVPTCgpICYmICF0aGlzLmVvZigpKSB7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gSW52YWxpZCBpZiBjdXJyZW50IGNoYXIgaXMgb3RoZXIga2luZHMgb2Ygd2hpdGVzcGFjZVxuICAgIGlmICghdGhpcy5pc0N1cnJlbnRDaGFyRU9MKCkgJiYgL1xccy8udGVzdCh0aGlzLmNoYXIoKSkpIHtcbiAgICAgIGNvbnN0IGVzY2FwZWQgPSBcIlxcXFx1XCIgKyB0aGlzLmNoYXIoKS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KTtcbiAgICAgIHRocm93IG5ldyBUT01MUGFyc2VFcnJvcihgQ29udGFpbnMgaW52YWxpZCB3aGl0ZXNwYWNlczogXFxgJHtlc2NhcGVkfVxcYGApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQb3NpdGlvbiByZWFjaGVkIEVPRiBvciBub3RcbiAgICovXG4gIGVvZigpIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbigpID49IHRoaXMuc291cmNlLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCBwb3NpdGlvblxuICAgKi9cbiAgcG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuI3Bvc2l0aW9uO1xuICB9XG5cbiAgaXNDdXJyZW50Q2hhckVPTCgpIHtcbiAgICByZXR1cm4gdGhpcy5jaGFyKCkgPT09IFwiXFxuXCIgfHwgdGhpcy5zbGljZSgwLCAyKSA9PT0gXCJcXHJcXG5cIjtcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVXRpbGl0aWVzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBzdWNjZXNzPFQ+KGJvZHk6IFQpOiBTdWNjZXNzPFQ+IHtcbiAgcmV0dXJuIHtcbiAgICBvazogdHJ1ZSxcbiAgICBib2R5LFxuICB9O1xufVxuZnVuY3Rpb24gZmFpbHVyZSgpOiBGYWlsdXJlIHtcbiAgcmV0dXJuIHtcbiAgICBvazogZmFsc2UsXG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBVdGlscyA9IHtcbiAgdW5mbGF0KFxuICAgIGtleXM6IHN0cmluZ1tdLFxuICAgIHZhbHVlczogdW5rbm93biA9IHt9LFxuICAgIGNPYmo/OiB1bmtub3duLFxuICApOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGNPYmogYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghY09iaikge1xuICAgICAgICBjT2JqID0gdmFsdWVzO1xuICAgICAgfVxuICAgICAgY29uc3Qga2V5OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBrZXlzW2tleXMubGVuZ3RoIC0gMV07XG4gICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBvdXRba2V5XSA9IGNPYmo7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy51bmZsYXQoa2V5cy5zbGljZSgwLCAtMSksIHZhbHVlcywgb3V0KTtcbiAgICB9XG4gIH0sXG4gIGRlZXBBc3NpZ25XaXRoVGFibGUodGFyZ2V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgdGFibGU6IHtcbiAgICB0eXBlOiBcIlRhYmxlXCIgfCBcIlRhYmxlQXJyYXlcIjtcbiAgICBrZXk6IHN0cmluZ1tdO1xuICAgIHZhbHVlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgfSkge1xuICAgIGlmICh0YWJsZS5rZXkubGVuZ3RoID09PSAwIHx8IHRhYmxlLmtleVswXSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGtleSBsZW5ndGhcIik7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlID0gdGFyZ2V0W3RhYmxlLmtleVswXV07XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICB0YXJnZXQsXG4gICAgICAgIHRoaXMudW5mbGF0KFxuICAgICAgICAgIHRhYmxlLmtleSxcbiAgICAgICAgICB0YWJsZS50eXBlID09PSBcIlRhYmxlXCIgPyB0YWJsZS52YWx1ZSA6IFt0YWJsZS52YWx1ZV0sXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIGlmICh0YWJsZS50eXBlID09PSBcIlRhYmxlQXJyYXlcIiAmJiB0YWJsZS5rZXkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHZhbHVlLnB1c2godGFibGUudmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGFzdCA9IHZhbHVlW3ZhbHVlLmxlbmd0aCAtIDFdO1xuICAgICAgICBVdGlscy5kZWVwQXNzaWduV2l0aFRhYmxlKGxhc3QsIHtcbiAgICAgICAgICB0eXBlOiB0YWJsZS50eXBlLFxuICAgICAgICAgIGtleTogdGFibGUua2V5LnNsaWNlKDEpLFxuICAgICAgICAgIHZhbHVlOiB0YWJsZS52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgIFV0aWxzLmRlZXBBc3NpZ25XaXRoVGFibGUodmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHtcbiAgICAgICAgdHlwZTogdGFibGUudHlwZSxcbiAgICAgICAga2V5OiB0YWJsZS5rZXkuc2xpY2UoMSksXG4gICAgICAgIHZhbHVlOiB0YWJsZS52YWx1ZSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGFzc2lnblwiKTtcbiAgICB9XG4gIH0sXG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFBhcnNlciBjb21iaW5hdG9ycyBhbmQgZ2VuZXJhdG9yc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIG9yPFQ+KHBhcnNlcnM6IFBhcnNlckNvbXBvbmVudDxUPltdKTogUGFyc2VyQ29tcG9uZW50PFQ+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uIE9yKHNjYW5uZXI6IFNjYW5uZXIpOiBQYXJzZVJlc3VsdDxUPiB7XG4gICAgZm9yIChjb25zdCBwYXJzZSBvZiBwYXJzZXJzKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBwYXJzZShzY2FubmVyKTtcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhaWx1cmUoKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gam9pbjxUPihcbiAgcGFyc2VyOiBQYXJzZXJDb21wb25lbnQ8VD4sXG4gIHNlcGFyYXRvcjogc3RyaW5nLFxuKTogUGFyc2VyQ29tcG9uZW50PFRbXT4ge1xuICBjb25zdCBTZXBhcmF0b3IgPSBjaGFyYWN0ZXIoc2VwYXJhdG9yKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIEpvaW4oc2Nhbm5lcjogU2Nhbm5lcik6IFBhcnNlUmVzdWx0PFRbXT4ge1xuICAgIGNvbnN0IGZpcnN0ID0gcGFyc2VyKHNjYW5uZXIpO1xuICAgIGlmICghZmlyc3Qub2spIHtcbiAgICAgIHJldHVybiBmYWlsdXJlKCk7XG4gICAgfVxuICAgIGNvbnN0IG91dDogVFtdID0gW2ZpcnN0LmJvZHldO1xuICAgIHdoaWxlICghc2Nhbm5lci5lb2YoKSkge1xuICAgICAgaWYgKCFTZXBhcmF0b3Ioc2Nhbm5lcikub2spIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjb25zdCByZXN1bHQgPSBwYXJzZXIoc2Nhbm5lcik7XG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIG91dC5wdXNoKHJlc3VsdC5ib2R5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUT01MUGFyc2VFcnJvcihgSW52YWxpZCB0b2tlbiBhZnRlciBcIiR7c2VwYXJhdG9yfVwiYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdWNjZXNzKG91dCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGt2PFQ+KFxuICBrZXlQYXJzZXI6IFBhcnNlckNvbXBvbmVudDxzdHJpbmdbXT4sXG4gIHNlcGFyYXRvcjogc3RyaW5nLFxuICB2YWx1ZVBhcnNlcjogUGFyc2VyQ29tcG9uZW50PFQ+LFxuKTogUGFyc2VyQ29tcG9uZW50PHsgW2tleTogc3RyaW5nXTogdW5rbm93biB9PiB7XG4gIGNvbnN0IFNlcGFyYXRvciA9IGNoYXJhY3RlcihzZXBhcmF0b3IpO1xuICByZXR1cm4gZnVuY3Rpb24gS3YoXG4gICAgc2Nhbm5lcjogU2Nhbm5lcixcbiAgKTogUGFyc2VSZXN1bHQ8eyBba2V5OiBzdHJpbmddOiB1bmtub3duIH0+IHtcbiAgICBjb25zdCBrZXkgPSBrZXlQYXJzZXIoc2Nhbm5lcik7XG4gICAgaWYgKCFrZXkub2spIHtcbiAgICAgIHJldHVybiBmYWlsdXJlKCk7XG4gICAgfVxuICAgIGNvbnN0IHNlcCA9IFNlcGFyYXRvcihzY2FubmVyKTtcbiAgICBpZiAoIXNlcC5vaykge1xuICAgICAgdGhyb3cgbmV3IFRPTUxQYXJzZUVycm9yKGBrZXkvdmFsdWUgcGFpciBkb2Vzbid0IGhhdmUgXCIke3NlcGFyYXRvcn1cImApO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHZhbHVlUGFyc2VyKHNjYW5uZXIpO1xuICAgIGlmICghdmFsdWUub2spIHtcbiAgICAgIHRocm93IG5ldyBUT01MUGFyc2VFcnJvcihcbiAgICAgICAgYFZhbHVlIG9mIGtleS92YWx1ZSBwYWlyIGlzIGludmFsaWQgZGF0YSBmb3JtYXRgLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1Y2Nlc3MoVXRpbHMudW5mbGF0KGtleS5ib2R5LCB2YWx1ZS5ib2R5KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG1lcmdlKFxuICBwYXJzZXI6IFBhcnNlckNvbXBvbmVudDx1bmtub3duW10+LFxuKTogUGFyc2VyQ29tcG9uZW50PFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG4gIHJldHVybiBmdW5jdGlvbiBNZXJnZShcbiAgICBzY2FubmVyOiBTY2FubmVyLFxuICApOiBQYXJzZVJlc3VsdDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlcihzY2FubmVyKTtcbiAgICBpZiAoIXJlc3VsdC5vaykge1xuICAgICAgcmV0dXJuIGZhaWx1cmUoKTtcbiAgICB9XG4gICAgbGV0IGJvZHkgPSB7fTtcbiAgICBmb3IgKGNvbnN0IHJlY29yZCBvZiByZXN1bHQuYm9keSkge1xuICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSBcIm9iamVjdFwiICYmIGJvZHkgIT09IG51bGwpIHtcbiAgICAgICAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgICAgICAgYm9keSA9IGRlZXBNZXJnZShib2R5LCByZWNvcmQgYXMgUmVjb3JkPGFueSwgYW55Pik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdWNjZXNzKGJvZHkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiByZXBlYXQ8VD4oXG4gIHBhcnNlcjogUGFyc2VyQ29tcG9uZW50PFQ+LFxuKTogUGFyc2VyQ29tcG9uZW50PFRbXT4ge1xuICByZXR1cm4gZnVuY3Rpb24gUmVwZWF0KFxuICAgIHNjYW5uZXI6IFNjYW5uZXIsXG4gICkge1xuICAgIGNvbnN0IGJvZHk6IFRbXSA9IFtdO1xuICAgIHdoaWxlICghc2Nhbm5lci5lb2YoKSkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gcGFyc2VyKHNjYW5uZXIpO1xuICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICBib2R5LnB1c2gocmVzdWx0LmJvZHkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBzY2FubmVyLm5leHRVbnRpbENoYXIoKTtcbiAgICB9XG4gICAgaWYgKGJvZHkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFpbHVyZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc3VjY2Vzcyhib2R5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3Vycm91bmQ8VD4oXG4gIGxlZnQ6IHN0cmluZyxcbiAgcGFyc2VyOiBQYXJzZXJDb21wb25lbnQ8VD4sXG4gIHJpZ2h0OiBzdHJpbmcsXG4pOiBQYXJzZXJDb21wb25lbnQ8VD4ge1xuICBjb25zdCBMZWZ0ID0gY2hhcmFjdGVyKGxlZnQpO1xuICBjb25zdCBSaWdodCA9IGNoYXJhY3RlcihyaWdodCk7XG4gIHJldHVybiBmdW5jdGlvbiBTdXJyb3VuZChzY2FubmVyOiBTY2FubmVyKSB7XG4gICAgaWYgKCFMZWZ0KHNjYW5uZXIpLm9rKSB7XG4gICAgICByZXR1cm4gZmFpbHVyZSgpO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBwYXJzZXIoc2Nhbm5lcik7XG4gICAgaWYgKCFyZXN1bHQub2spIHtcbiAgICAgIHRocm93IG5ldyBUT01MUGFyc2VFcnJvcihgSW52YWxpZCB0b2tlbiBhZnRlciBcIiR7bGVmdH1cImApO1xuICAgIH1cbiAgICBpZiAoIVJpZ2h0KHNjYW5uZXIpLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgVE9NTFBhcnNlRXJyb3IoXG4gICAgICAgIGBOb3QgY2xvc2VkIGJ5IFwiJHtyaWdodH1cIiBhZnRlciBzdGFydGVkIHdpdGggXCIke2xlZnR9XCJgLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1Y2Nlc3MocmVzdWx0LmJvZHkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjaGFyYWN0ZXIoc3RyOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGNoYXJhY3RlcihzY2FubmVyOiBTY2FubmVyKTogUGFyc2VSZXN1bHQ8dm9pZD4ge1xuICAgIHNjYW5uZXIubmV4dFVudGlsQ2hhcih7IGlubGluZTogdHJ1ZSB9KTtcbiAgICBpZiAoc2Nhbm5lci5zbGljZSgwLCBzdHIubGVuZ3RoKSA9PT0gc3RyKSB7XG4gICAgICBzY2FubmVyLm5leHQoc3RyLmxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWlsdXJlKCk7XG4gICAgfVxuICAgIHNjYW5uZXIubmV4dFVudGlsQ2hhcih7IGlubGluZTogdHJ1ZSB9KTtcbiAgICByZXR1cm4gc3VjY2Vzcyh1bmRlZmluZWQpO1xuICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUGFyc2VyIGNvbXBvbmVudHNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IFBhdHRlcm5zID0ge1xuICBCQVJFX0tFWTogL1tBLVphLXowLTlfLV0vLFxuICBGTE9BVDogL1swLTlfXFwuZStcXC1dL2ksXG4gIEVORF9PRl9WQUxVRTogL1sgXFx0XFxyXFxuIyx9XFxdXS8sXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gQmFyZUtleShzY2FubmVyOiBTY2FubmVyKTogUGFyc2VSZXN1bHQ8c3RyaW5nPiB7XG4gIHNjYW5uZXIubmV4dFVudGlsQ2hhcih7IGlubGluZTogdHJ1ZSB9KTtcbiAgaWYgKCFzY2FubmVyLmNoYXIoKSB8fCAhUGF0dGVybnMuQkFSRV9LRVkudGVzdChzY2FubmVyLmNoYXIoKSkpIHtcbiAgICByZXR1cm4gZmFpbHVyZSgpO1xuICB9XG4gIGNvbnN0IGFjYzogc3RyaW5nW10gPSBbXTtcbiAgd2hpbGUgKHNjYW5uZXIuY2hhcigpICYmIFBhdHRlcm5zLkJBUkVfS0VZLnRlc3Qoc2Nhbm5lci5jaGFyKCkpKSB7XG4gICAgYWNjLnB1c2goc2Nhbm5lci5jaGFyKCkpO1xuICAgIHNjYW5uZXIubmV4dCgpO1xuICB9XG4gIGNvbnN0IGtleSA9IGFjYy5qb2luKFwiXCIpO1xuICByZXR1cm4gc3VjY2VzcyhrZXkpO1xufVxuXG5mdW5jdGlvbiBFc2NhcGVTZXF1ZW5jZShzY2FubmVyOiBTY2FubmVyKTogUGFyc2VSZXN1bHQ8c3RyaW5nPiB7XG4gIGlmIChzY2FubmVyLmNoYXIoKSA9PT0gXCJcXFxcXCIpIHtcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgICAvLyBTZWUgaHR0cHM6Ly90b21sLmlvL2VuL3YxLjAuMC1yYy4zI3N0cmluZ1xuICAgIHN3aXRjaCAoc2Nhbm5lci5jaGFyKCkpIHtcbiAgICAgIGNhc2UgXCJiXCI6XG4gICAgICAgIHNjYW5uZXIubmV4dCgpO1xuICAgICAgICByZXR1cm4gc3VjY2VzcyhcIlxcYlwiKTtcbiAgICAgIGNhc2UgXCJ0XCI6XG4gICAgICAgIHNjYW5uZXIubmV4dCgpO1xuICAgICAgICByZXR1cm4gc3VjY2VzcyhcIlxcdFwiKTtcbiAgICAgIGNhc2UgXCJuXCI6XG4gICAgICAgIHNjYW5uZXIubmV4dCgpO1xuICAgICAgICByZXR1cm4gc3VjY2VzcyhcIlxcblwiKTtcbiAgICAgIGNhc2UgXCJmXCI6XG4gICAgICAgIHNjYW5uZXIubmV4dCgpO1xuICAgICAgICByZXR1cm4gc3VjY2VzcyhcIlxcZlwiKTtcbiAgICAgIGNhc2UgXCJyXCI6XG4gICAgICAgIHNjYW5uZXIubmV4dCgpO1xuICAgICAgICByZXR1cm4gc3VjY2VzcyhcIlxcclwiKTtcbiAgICAgIGNhc2UgXCJ1XCI6XG4gICAgICBjYXNlIFwiVVwiOiB7XG4gICAgICAgIC8vIFVuaWNvZGUgY2hhcmFjdGVyXG4gICAgICAgIGNvbnN0IGNvZGVQb2ludExlbiA9IHNjYW5uZXIuY2hhcigpID09PSBcInVcIiA/IDQgOiA2O1xuICAgICAgICBjb25zdCBjb2RlUG9pbnQgPSBwYXJzZUludChcbiAgICAgICAgICBcIjB4XCIgKyBzY2FubmVyLnNsaWNlKDEsIDEgKyBjb2RlUG9pbnRMZW4pLFxuICAgICAgICAgIDE2LFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBzdHIgPSBTdHJpbmcuZnJvbUNvZGVQb2ludChjb2RlUG9pbnQpO1xuICAgICAgICBzY2FubmVyLm5leHQoY29kZVBvaW50TGVuICsgMSk7XG4gICAgICAgIHJldHVybiBzdWNjZXNzKHN0cik7XG4gICAgICB9XG4gICAgICBjYXNlICdcIic6XG4gICAgICAgIHNjYW5uZXIubmV4dCgpO1xuICAgICAgICByZXR1cm4gc3VjY2VzcygnXCInKTtcbiAgICAgIGNhc2UgXCJcXFxcXCI6XG4gICAgICAgIHNjYW5uZXIubmV4dCgpO1xuICAgICAgICByZXR1cm4gc3VjY2VzcyhcIlxcXFxcIik7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgVE9NTFBhcnNlRXJyb3IoXG4gICAgICAgICAgYEludmFsaWQgZXNjYXBlIHNlcXVlbmNlOiBcXFxcJHtzY2FubmVyLmNoYXIoKX1gLFxuICAgICAgICApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFpbHVyZSgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCYXNpY1N0cmluZyhzY2FubmVyOiBTY2FubmVyKTogUGFyc2VSZXN1bHQ8c3RyaW5nPiB7XG4gIHNjYW5uZXIubmV4dFVudGlsQ2hhcih7IGlubGluZTogdHJ1ZSB9KTtcbiAgaWYgKHNjYW5uZXIuY2hhcigpID09PSAnXCInKSB7XG4gICAgc2Nhbm5lci5uZXh0KCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhaWx1cmUoKTtcbiAgfVxuICBjb25zdCBhY2MgPSBbXTtcbiAgd2hpbGUgKHNjYW5uZXIuY2hhcigpICE9PSAnXCInICYmICFzY2FubmVyLmVvZigpKSB7XG4gICAgaWYgKHNjYW5uZXIuY2hhcigpID09PSBcIlxcblwiKSB7XG4gICAgICB0aHJvdyBuZXcgVE9NTFBhcnNlRXJyb3IoXCJTaW5nbGUtbGluZSBzdHJpbmcgY2Fubm90IGNvbnRhaW4gRU9MXCIpO1xuICAgIH1cbiAgICBjb25zdCBlc2NhcGVkQ2hhciA9IEVzY2FwZVNlcXVlbmNlKHNjYW5uZXIpO1xuICAgIGlmIChlc2NhcGVkQ2hhci5vaykge1xuICAgICAgYWNjLnB1c2goZXNjYXBlZENoYXIuYm9keSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFjYy5wdXNoKHNjYW5uZXIuY2hhcigpKTtcbiAgICAgIHNjYW5uZXIubmV4dCgpO1xuICAgIH1cbiAgfVxuICBpZiAoc2Nhbm5lci5lb2YoKSkge1xuICAgIHRocm93IG5ldyBUT01MUGFyc2VFcnJvcihcbiAgICAgIGBTaW5nbGUtbGluZSBzdHJpbmcgaXMgbm90IGNsb3NlZDpcXG4ke2FjYy5qb2luKFwiXCIpfWAsXG4gICAgKTtcbiAgfVxuICBzY2FubmVyLm5leHQoKTsgLy8gc2tpcCBsYXN0ICdcIlwiXG4gIHJldHVybiBzdWNjZXNzKGFjYy5qb2luKFwiXCIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIExpdGVyYWxTdHJpbmcoc2Nhbm5lcjogU2Nhbm5lcik6IFBhcnNlUmVzdWx0PHN0cmluZz4ge1xuICBzY2FubmVyLm5leHRVbnRpbENoYXIoeyBpbmxpbmU6IHRydWUgfSk7XG4gIGlmIChzY2FubmVyLmNoYXIoKSA9PT0gXCInXCIpIHtcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFpbHVyZSgpO1xuICB9XG4gIGNvbnN0IGFjYzogc3RyaW5nW10gPSBbXTtcbiAgd2hpbGUgKHNjYW5uZXIuY2hhcigpICE9PSBcIidcIiAmJiAhc2Nhbm5lci5lb2YoKSkge1xuICAgIGlmIChzY2FubmVyLmNoYXIoKSA9PT0gXCJcXG5cIikge1xuICAgICAgdGhyb3cgbmV3IFRPTUxQYXJzZUVycm9yKFwiU2luZ2xlLWxpbmUgc3RyaW5nIGNhbm5vdCBjb250YWluIEVPTFwiKTtcbiAgICB9XG4gICAgYWNjLnB1c2goc2Nhbm5lci5jaGFyKCkpO1xuICAgIHNjYW5uZXIubmV4dCgpO1xuICB9XG4gIGlmIChzY2FubmVyLmVvZigpKSB7XG4gICAgdGhyb3cgbmV3IFRPTUxQYXJzZUVycm9yKFxuICAgICAgYFNpbmdsZS1saW5lIHN0cmluZyBpcyBub3QgY2xvc2VkOlxcbiR7YWNjLmpvaW4oXCJcIil9YCxcbiAgICApO1xuICB9XG4gIHNjYW5uZXIubmV4dCgpOyAvLyBza2lwIGxhc3QgXCInXCJcbiAgcmV0dXJuIHN1Y2Nlc3MoYWNjLmpvaW4oXCJcIikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTXVsdGlsaW5lQmFzaWNTdHJpbmcoXG4gIHNjYW5uZXI6IFNjYW5uZXIsXG4pOiBQYXJzZVJlc3VsdDxzdHJpbmc+IHtcbiAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKHsgaW5saW5lOiB0cnVlIH0pO1xuICBpZiAoc2Nhbm5lci5zbGljZSgwLCAzKSA9PT0gJ1wiXCJcIicpIHtcbiAgICBzY2FubmVyLm5leHQoMyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhaWx1cmUoKTtcbiAgfVxuICBpZiAoc2Nhbm5lci5jaGFyKCkgPT09IFwiXFxuXCIpIHtcbiAgICAvLyBUaGUgZmlyc3QgbmV3bGluZSAoTEYpIGlzIHRyaW1tZWRcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgfSBlbHNlIGlmIChzY2FubmVyLnNsaWNlKDAsIDIpID09PSBcIlxcclxcblwiKSB7XG4gICAgLy8gVGhlIGZpcnN0IG5ld2xpbmUgKENSTEYpIGlzIHRyaW1tZWRcbiAgICBzY2FubmVyLm5leHQoMik7XG4gIH1cbiAgY29uc3QgYWNjOiBzdHJpbmdbXSA9IFtdO1xuICB3aGlsZSAoc2Nhbm5lci5zbGljZSgwLCAzKSAhPT0gJ1wiXCJcIicgJiYgIXNjYW5uZXIuZW9mKCkpIHtcbiAgICAvLyBsaW5lIGVuZGluZyBiYWNrc2xhc2hcbiAgICBpZiAoc2Nhbm5lci5zbGljZSgwLCAyKSA9PT0gXCJcXFxcXFxuXCIpIHtcbiAgICAgIHNjYW5uZXIubmV4dCgpO1xuICAgICAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKHsgY29tbWVudDogZmFsc2UgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9IGVsc2UgaWYgKHNjYW5uZXIuc2xpY2UoMCwgMykgPT09IFwiXFxcXFxcclxcblwiKSB7XG4gICAgICBzY2FubmVyLm5leHQoKTtcbiAgICAgIHNjYW5uZXIubmV4dFVudGlsQ2hhcih7IGNvbW1lbnQ6IGZhbHNlIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IGVzY2FwZWRDaGFyID0gRXNjYXBlU2VxdWVuY2Uoc2Nhbm5lcik7XG4gICAgaWYgKGVzY2FwZWRDaGFyLm9rKSB7XG4gICAgICBhY2MucHVzaChlc2NhcGVkQ2hhci5ib2R5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWNjLnB1c2goc2Nhbm5lci5jaGFyKCkpO1xuICAgICAgc2Nhbm5lci5uZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHNjYW5uZXIuZW9mKCkpIHtcbiAgICB0aHJvdyBuZXcgVE9NTFBhcnNlRXJyb3IoXG4gICAgICBgTXVsdGktbGluZSBzdHJpbmcgaXMgbm90IGNsb3NlZDpcXG4ke2FjYy5qb2luKFwiXCIpfWAsXG4gICAgKTtcbiAgfVxuICAvLyBpZiBlbmRzIHdpdGggNCBgXCJgLCBwdXNoIHRoZSBmaXN0IGBcImAgdG8gc3RyaW5nXG4gIGlmIChzY2FubmVyLmNoYXIoMykgPT09ICdcIicpIHtcbiAgICBhY2MucHVzaCgnXCInKTtcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgfVxuICBzY2FubmVyLm5leHQoMyk7IC8vIHNraXAgbGFzdCAnXCJcIlwiXCJcbiAgcmV0dXJuIHN1Y2Nlc3MoYWNjLmpvaW4oXCJcIikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTXVsdGlsaW5lTGl0ZXJhbFN0cmluZyhcbiAgc2Nhbm5lcjogU2Nhbm5lcixcbik6IFBhcnNlUmVzdWx0PHN0cmluZz4ge1xuICBzY2FubmVyLm5leHRVbnRpbENoYXIoeyBpbmxpbmU6IHRydWUgfSk7XG4gIGlmIChzY2FubmVyLnNsaWNlKDAsIDMpID09PSBcIicnJ1wiKSB7XG4gICAgc2Nhbm5lci5uZXh0KDMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWlsdXJlKCk7XG4gIH1cbiAgaWYgKHNjYW5uZXIuY2hhcigpID09PSBcIlxcblwiKSB7XG4gICAgLy8gVGhlIGZpcnN0IG5ld2xpbmUgKExGKSBpcyB0cmltbWVkXG4gICAgc2Nhbm5lci5uZXh0KCk7XG4gIH0gZWxzZSBpZiAoc2Nhbm5lci5zbGljZSgwLCAyKSA9PT0gXCJcXHJcXG5cIikge1xuICAgIC8vIFRoZSBmaXJzdCBuZXdsaW5lIChDUkxGKSBpcyB0cmltbWVkXG4gICAgc2Nhbm5lci5uZXh0KDIpO1xuICB9XG4gIGNvbnN0IGFjYzogc3RyaW5nW10gPSBbXTtcbiAgd2hpbGUgKHNjYW5uZXIuc2xpY2UoMCwgMykgIT09IFwiJycnXCIgJiYgIXNjYW5uZXIuZW9mKCkpIHtcbiAgICBhY2MucHVzaChzY2FubmVyLmNoYXIoKSk7XG4gICAgc2Nhbm5lci5uZXh0KCk7XG4gIH1cbiAgaWYgKHNjYW5uZXIuZW9mKCkpIHtcbiAgICB0aHJvdyBuZXcgVE9NTFBhcnNlRXJyb3IoXG4gICAgICBgTXVsdGktbGluZSBzdHJpbmcgaXMgbm90IGNsb3NlZDpcXG4ke2FjYy5qb2luKFwiXCIpfWAsXG4gICAgKTtcbiAgfVxuICAvLyBpZiBlbmRzIHdpdGggNCBgJ2AsIHB1c2ggdGhlIGZpc3QgYCdgIHRvIHN0cmluZ1xuICBpZiAoc2Nhbm5lci5jaGFyKDMpID09PSBcIidcIikge1xuICAgIGFjYy5wdXNoKFwiJ1wiKTtcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgfVxuICBzY2FubmVyLm5leHQoMyk7IC8vIHNraXAgbGFzdCBcIicnJ1wiXG4gIHJldHVybiBzdWNjZXNzKGFjYy5qb2luKFwiXCIpKTtcbn1cblxuY29uc3Qgc3ltYm9sUGFpcnM6IFtzdHJpbmcsIHVua25vd25dW10gPSBbXG4gIFtcInRydWVcIiwgdHJ1ZV0sXG4gIFtcImZhbHNlXCIsIGZhbHNlXSxcbiAgW1wiaW5mXCIsIEluZmluaXR5XSxcbiAgW1wiK2luZlwiLCBJbmZpbml0eV0sXG4gIFtcIi1pbmZcIiwgLUluZmluaXR5XSxcbiAgW1wibmFuXCIsIE5hTl0sXG4gIFtcIituYW5cIiwgTmFOXSxcbiAgW1wiLW5hblwiLCBOYU5dLFxuXTtcbmV4cG9ydCBmdW5jdGlvbiBTeW1ib2xzKHNjYW5uZXI6IFNjYW5uZXIpOiBQYXJzZVJlc3VsdDx1bmtub3duPiB7XG4gIHNjYW5uZXIubmV4dFVudGlsQ2hhcih7IGlubGluZTogdHJ1ZSB9KTtcbiAgY29uc3QgZm91bmQgPSBzeW1ib2xQYWlycy5maW5kKChbc3RyXSkgPT5cbiAgICBzY2FubmVyLnNsaWNlKDAsIHN0ci5sZW5ndGgpID09PSBzdHJcbiAgKTtcbiAgaWYgKCFmb3VuZCkge1xuICAgIHJldHVybiBmYWlsdXJlKCk7XG4gIH1cbiAgY29uc3QgW3N0ciwgdmFsdWVdID0gZm91bmQ7XG4gIHNjYW5uZXIubmV4dChzdHIubGVuZ3RoKTtcbiAgcmV0dXJuIHN1Y2Nlc3ModmFsdWUpO1xufVxuXG5leHBvcnQgY29uc3QgRG90dGVkS2V5ID0gam9pbihcbiAgb3IoW0JhcmVLZXksIEJhc2ljU3RyaW5nLCBMaXRlcmFsU3RyaW5nXSksXG4gIFwiLlwiLFxuKTtcblxuZXhwb3J0IGZ1bmN0aW9uIEludGVnZXIoc2Nhbm5lcjogU2Nhbm5lcik6IFBhcnNlUmVzdWx0PG51bWJlciB8IHN0cmluZz4ge1xuICBzY2FubmVyLm5leHRVbnRpbENoYXIoeyBpbmxpbmU6IHRydWUgfSk7XG5cbiAgLy8gSWYgYmluYXJ5IC8gb2N0YWwgLyBoZXhcbiAgY29uc3QgZmlyc3QyID0gc2Nhbm5lci5zbGljZSgwLCAyKTtcbiAgaWYgKGZpcnN0Mi5sZW5ndGggPT09IDIgJiYgLzAoPzp4fG98YikvaS50ZXN0KGZpcnN0MikpIHtcbiAgICBzY2FubmVyLm5leHQoMik7XG4gICAgY29uc3QgYWNjID0gW2ZpcnN0Ml07XG4gICAgd2hpbGUgKC9bMC05YS1mX10vaS50ZXN0KHNjYW5uZXIuY2hhcigpKSAmJiAhc2Nhbm5lci5lb2YoKSkge1xuICAgICAgYWNjLnB1c2goc2Nhbm5lci5jaGFyKCkpO1xuICAgICAgc2Nhbm5lci5uZXh0KCk7XG4gICAgfVxuICAgIGlmIChhY2MubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gZmFpbHVyZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc3VjY2VzcyhhY2Muam9pbihcIlwiKSk7XG4gIH1cblxuICBjb25zdCBhY2MgPSBbXTtcbiAgaWYgKC9bKy1dLy50ZXN0KHNjYW5uZXIuY2hhcigpKSkge1xuICAgIGFjYy5wdXNoKHNjYW5uZXIuY2hhcigpKTtcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgfVxuICB3aGlsZSAoL1swLTlfXS8udGVzdChzY2FubmVyLmNoYXIoKSkgJiYgIXNjYW5uZXIuZW9mKCkpIHtcbiAgICBhY2MucHVzaChzY2FubmVyLmNoYXIoKSk7XG4gICAgc2Nhbm5lci5uZXh0KCk7XG4gIH1cblxuICBpZiAoYWNjLmxlbmd0aCA9PT0gMCB8fCAoYWNjLmxlbmd0aCA9PT0gMSAmJiAvWystXS8udGVzdChhY2NbMF0hKSkpIHtcbiAgICByZXR1cm4gZmFpbHVyZSgpO1xuICB9XG5cbiAgY29uc3QgaW50ID0gcGFyc2VJbnQoYWNjLmZpbHRlcigoY2hhcikgPT4gY2hhciAhPT0gXCJfXCIpLmpvaW4oXCJcIikpO1xuICByZXR1cm4gc3VjY2VzcyhpbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRmxvYXQoc2Nhbm5lcjogU2Nhbm5lcik6IFBhcnNlUmVzdWx0PG51bWJlcj4ge1xuICBzY2FubmVyLm5leHRVbnRpbENoYXIoeyBpbmxpbmU6IHRydWUgfSk7XG5cbiAgLy8gbG9va2FoZWFkIHZhbGlkYXRpb24gaXMgbmVlZGVkIGZvciBpbnRlZ2VyIHZhbHVlIGlzIHNpbWlsYXIgdG8gZmxvYXRcbiAgbGV0IHBvc2l0aW9uID0gMDtcbiAgd2hpbGUgKFxuICAgIHNjYW5uZXIuY2hhcihwb3NpdGlvbikgJiZcbiAgICAhUGF0dGVybnMuRU5EX09GX1ZBTFVFLnRlc3Qoc2Nhbm5lci5jaGFyKHBvc2l0aW9uKSlcbiAgKSB7XG4gICAgaWYgKCFQYXR0ZXJucy5GTE9BVC50ZXN0KHNjYW5uZXIuY2hhcihwb3NpdGlvbikpKSB7XG4gICAgICByZXR1cm4gZmFpbHVyZSgpO1xuICAgIH1cbiAgICBwb3NpdGlvbisrO1xuICB9XG5cbiAgY29uc3QgYWNjID0gW107XG4gIGlmICgvWystXS8udGVzdChzY2FubmVyLmNoYXIoKSkpIHtcbiAgICBhY2MucHVzaChzY2FubmVyLmNoYXIoKSk7XG4gICAgc2Nhbm5lci5uZXh0KCk7XG4gIH1cbiAgd2hpbGUgKFBhdHRlcm5zLkZMT0FULnRlc3Qoc2Nhbm5lci5jaGFyKCkpICYmICFzY2FubmVyLmVvZigpKSB7XG4gICAgYWNjLnB1c2goc2Nhbm5lci5jaGFyKCkpO1xuICAgIHNjYW5uZXIubmV4dCgpO1xuICB9XG5cbiAgaWYgKGFjYy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZmFpbHVyZSgpO1xuICB9XG4gIGNvbnN0IGZsb2F0ID0gcGFyc2VGbG9hdChhY2MuZmlsdGVyKChjaGFyKSA9PiBjaGFyICE9PSBcIl9cIikuam9pbihcIlwiKSk7XG4gIGlmIChpc05hTihmbG9hdCkpIHtcbiAgICByZXR1cm4gZmFpbHVyZSgpO1xuICB9XG5cbiAgcmV0dXJuIHN1Y2Nlc3MoZmxvYXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGF0ZVRpbWUoc2Nhbm5lcjogU2Nhbm5lcik6IFBhcnNlUmVzdWx0PERhdGU+IHtcbiAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKHsgaW5saW5lOiB0cnVlIH0pO1xuXG4gIGxldCBkYXRlU3RyID0gc2Nhbm5lci5zbGljZSgwLCAxMCk7XG4gIC8vIGV4YW1wbGU6IDE5NzktMDUtMjdcbiAgaWYgKC9eXFxkezR9LVxcZHsyfS1cXGR7Mn0vLnRlc3QoZGF0ZVN0cikpIHtcbiAgICBzY2FubmVyLm5leHQoMTApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWlsdXJlKCk7XG4gIH1cblxuICBjb25zdCBhY2MgPSBbXTtcbiAgLy8gZXhhbXBsZTogMTk3OS0wNS0yN1QwMDozMjowMFpcbiAgd2hpbGUgKC9bIDAtOVRaLjotXS8udGVzdChzY2FubmVyLmNoYXIoKSkgJiYgIXNjYW5uZXIuZW9mKCkpIHtcbiAgICBhY2MucHVzaChzY2FubmVyLmNoYXIoKSk7XG4gICAgc2Nhbm5lci5uZXh0KCk7XG4gIH1cbiAgZGF0ZVN0ciArPSBhY2Muam9pbihcIlwiKTtcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKGRhdGVTdHIudHJpbSgpKTtcbiAgLy8gaW52YWxpZCBkYXRlXG4gIGlmIChpc05hTihkYXRlLmdldFRpbWUoKSkpIHtcbiAgICB0aHJvdyBuZXcgVE9NTFBhcnNlRXJyb3IoYEludmFsaWQgZGF0ZSBzdHJpbmcgXCIke2RhdGVTdHJ9XCJgKTtcbiAgfVxuXG4gIHJldHVybiBzdWNjZXNzKGRhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTG9jYWxUaW1lKHNjYW5uZXI6IFNjYW5uZXIpOiBQYXJzZVJlc3VsdDxzdHJpbmc+IHtcbiAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKHsgaW5saW5lOiB0cnVlIH0pO1xuXG4gIGxldCB0aW1lU3RyID0gc2Nhbm5lci5zbGljZSgwLCA4KTtcbiAgaWYgKC9eKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSkvLnRlc3QodGltZVN0cikpIHtcbiAgICBzY2FubmVyLm5leHQoOCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhaWx1cmUoKTtcbiAgfVxuXG4gIGNvbnN0IGFjYyA9IFtdO1xuICBpZiAoc2Nhbm5lci5jaGFyKCkgPT09IFwiLlwiKSB7XG4gICAgYWNjLnB1c2goc2Nhbm5lci5jaGFyKCkpO1xuICAgIHNjYW5uZXIubmV4dCgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdWNjZXNzKHRpbWVTdHIpO1xuICB9XG5cbiAgd2hpbGUgKC9bMC05XS8udGVzdChzY2FubmVyLmNoYXIoKSkgJiYgIXNjYW5uZXIuZW9mKCkpIHtcbiAgICBhY2MucHVzaChzY2FubmVyLmNoYXIoKSk7XG4gICAgc2Nhbm5lci5uZXh0KCk7XG4gIH1cbiAgdGltZVN0ciArPSBhY2Muam9pbihcIlwiKTtcbiAgcmV0dXJuIHN1Y2Nlc3ModGltZVN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBcnJheVZhbHVlKHNjYW5uZXI6IFNjYW5uZXIpOiBQYXJzZVJlc3VsdDx1bmtub3duW10+IHtcbiAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKHsgaW5saW5lOiB0cnVlIH0pO1xuXG4gIGlmIChzY2FubmVyLmNoYXIoKSA9PT0gXCJbXCIpIHtcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFpbHVyZSgpO1xuICB9XG5cbiAgY29uc3QgYXJyYXk6IHVua25vd25bXSA9IFtdO1xuICB3aGlsZSAoIXNjYW5uZXIuZW9mKCkpIHtcbiAgICBzY2FubmVyLm5leHRVbnRpbENoYXIoKTtcbiAgICBjb25zdCByZXN1bHQgPSBWYWx1ZShzY2FubmVyKTtcbiAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICBhcnJheS5wdXNoKHJlc3VsdC5ib2R5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHNjYW5uZXIubmV4dFVudGlsQ2hhcih7IGlubGluZTogdHJ1ZSB9KTtcbiAgICAvLyBtYXkgaGF2ZSBhIG5leHQgaXRlbSwgYnV0IHRyYWlsaW5nIGNvbW1hIGlzIGFsbG93ZWQgYXQgYXJyYXlcbiAgICBpZiAoc2Nhbm5lci5jaGFyKCkgPT09IFwiLFwiKSB7XG4gICAgICBzY2FubmVyLm5leHQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHNjYW5uZXIubmV4dFVudGlsQ2hhcigpO1xuXG4gIGlmIChzY2FubmVyLmNoYXIoKSA9PT0gXCJdXCIpIHtcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVE9NTFBhcnNlRXJyb3IoXCJBcnJheSBpcyBub3QgY2xvc2VkXCIpO1xuICB9XG5cbiAgcmV0dXJuIHN1Y2Nlc3MoYXJyYXkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gSW5saW5lVGFibGUoXG4gIHNjYW5uZXI6IFNjYW5uZXIsXG4pOiBQYXJzZVJlc3VsdDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICBzY2FubmVyLm5leHRVbnRpbENoYXIoKTtcbiAgaWYgKHNjYW5uZXIuY2hhcigxKSA9PT0gXCJ9XCIpIHtcbiAgICBzY2FubmVyLm5leHQoMik7XG4gICAgcmV0dXJuIHN1Y2Nlc3Moe30pO1xuICB9XG4gIGNvbnN0IHBhaXJzID0gc3Vycm91bmQoXG4gICAgXCJ7XCIsXG4gICAgam9pbihQYWlyLCBcIixcIiksXG4gICAgXCJ9XCIsXG4gICkoc2Nhbm5lcik7XG4gIGlmICghcGFpcnMub2spIHtcbiAgICByZXR1cm4gZmFpbHVyZSgpO1xuICB9XG4gIGxldCB0YWJsZSA9IHt9O1xuICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMuYm9keSkge1xuICAgIHRhYmxlID0gZGVlcE1lcmdlKHRhYmxlLCBwYWlyKTtcbiAgfVxuICByZXR1cm4gc3VjY2Vzcyh0YWJsZSk7XG59XG5cbmV4cG9ydCBjb25zdCBWYWx1ZSA9IG9yKFtcbiAgTXVsdGlsaW5lQmFzaWNTdHJpbmcsXG4gIE11bHRpbGluZUxpdGVyYWxTdHJpbmcsXG4gIEJhc2ljU3RyaW5nLFxuICBMaXRlcmFsU3RyaW5nLFxuICBTeW1ib2xzLFxuICBEYXRlVGltZSxcbiAgTG9jYWxUaW1lLFxuICBGbG9hdCxcbiAgSW50ZWdlcixcbiAgQXJyYXlWYWx1ZSxcbiAgSW5saW5lVGFibGUsXG5dKTtcblxuZXhwb3J0IGNvbnN0IFBhaXIgPSBrdihEb3R0ZWRLZXksIFwiPVwiLCBWYWx1ZSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBCbG9jayhcbiAgc2Nhbm5lcjogU2Nhbm5lcixcbik6IFBhcnNlUmVzdWx0PEJsb2NrUGFyc2VSZXN1bHRCb2R5PiB7XG4gIHNjYW5uZXIubmV4dFVudGlsQ2hhcigpO1xuICBjb25zdCByZXN1bHQgPSBtZXJnZShyZXBlYXQoUGFpcikpKHNjYW5uZXIpO1xuICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgcmV0dXJuIHN1Y2Nlc3Moe1xuICAgICAgdHlwZTogXCJCbG9ja1wiLFxuICAgICAgdmFsdWU6IHJlc3VsdC5ib2R5LFxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWlsdXJlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFRhYmxlSGVhZGVyID0gc3Vycm91bmQoXCJbXCIsIERvdHRlZEtleSwgXCJdXCIpO1xuXG5leHBvcnQgZnVuY3Rpb24gVGFibGUoXG4gIHNjYW5uZXI6IFNjYW5uZXIsXG4pOiBQYXJzZVJlc3VsdDxCbG9ja1BhcnNlUmVzdWx0Qm9keT4ge1xuICBzY2FubmVyLm5leHRVbnRpbENoYXIoKTtcbiAgY29uc3QgaGVhZGVyID0gVGFibGVIZWFkZXIoc2Nhbm5lcik7XG4gIGlmICghaGVhZGVyLm9rKSB7XG4gICAgcmV0dXJuIGZhaWx1cmUoKTtcbiAgfVxuICBzY2FubmVyLm5leHRVbnRpbENoYXIoKTtcbiAgY29uc3QgYmxvY2sgPSBCbG9jayhzY2FubmVyKTtcbiAgcmV0dXJuIHN1Y2Nlc3Moe1xuICAgIHR5cGU6IFwiVGFibGVcIixcbiAgICBrZXk6IGhlYWRlci5ib2R5LFxuICAgIHZhbHVlOiBibG9jay5vayA/IGJsb2NrLmJvZHkudmFsdWUgOiB7fSxcbiAgfSk7XG59XG5cbmV4cG9ydCBjb25zdCBUYWJsZUFycmF5SGVhZGVyID0gc3Vycm91bmQoXG4gIFwiW1tcIixcbiAgRG90dGVkS2V5LFxuICBcIl1dXCIsXG4pO1xuXG5leHBvcnQgZnVuY3Rpb24gVGFibGVBcnJheShcbiAgc2Nhbm5lcjogU2Nhbm5lcixcbik6IFBhcnNlUmVzdWx0PEJsb2NrUGFyc2VSZXN1bHRCb2R5PiB7XG4gIHNjYW5uZXIubmV4dFVudGlsQ2hhcigpO1xuICBjb25zdCBoZWFkZXIgPSBUYWJsZUFycmF5SGVhZGVyKHNjYW5uZXIpO1xuICBpZiAoIWhlYWRlci5vaykge1xuICAgIHJldHVybiBmYWlsdXJlKCk7XG4gIH1cbiAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKCk7XG4gIGNvbnN0IGJsb2NrID0gQmxvY2soc2Nhbm5lcik7XG4gIHJldHVybiBzdWNjZXNzKHtcbiAgICB0eXBlOiBcIlRhYmxlQXJyYXlcIixcbiAgICBrZXk6IGhlYWRlci5ib2R5LFxuICAgIHZhbHVlOiBibG9jay5vayA/IGJsb2NrLmJvZHkudmFsdWUgOiB7fSxcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUb21sKFxuICBzY2FubmVyOiBTY2FubmVyLFxuKTogUGFyc2VSZXN1bHQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcbiAgY29uc3QgYmxvY2tzID0gcmVwZWF0KG9yKFtCbG9jaywgVGFibGVBcnJheSwgVGFibGVdKSkoc2Nhbm5lcik7XG4gIGlmICghYmxvY2tzLm9rKSB7XG4gICAgcmV0dXJuIGZhaWx1cmUoKTtcbiAgfVxuICBsZXQgYm9keSA9IHt9O1xuICBmb3IgKGNvbnN0IGJsb2NrIG9mIGJsb2Nrcy5ib2R5KSB7XG4gICAgc3dpdGNoIChibG9jay50eXBlKSB7XG4gICAgICBjYXNlIFwiQmxvY2tcIjoge1xuICAgICAgICBib2R5ID0gZGVlcE1lcmdlKGJvZHksIGJsb2NrLnZhbHVlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIFwiVGFibGVcIjoge1xuICAgICAgICBVdGlscy5kZWVwQXNzaWduV2l0aFRhYmxlKGJvZHksIGJsb2NrKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIFwiVGFibGVBcnJheVwiOiB7XG4gICAgICAgIFV0aWxzLmRlZXBBc3NpZ25XaXRoVGFibGUoYm9keSwgYmxvY2spO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN1Y2Nlc3MoYm9keSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQYXJzZXJGYWN0b3J5PFQ+KHBhcnNlcjogUGFyc2VyQ29tcG9uZW50PFQ+KSB7XG4gIHJldHVybiBmdW5jdGlvbiBwYXJzZSh0b21sU3RyaW5nOiBzdHJpbmcpOiBUIHtcbiAgICBjb25zdCBzY2FubmVyID0gbmV3IFNjYW5uZXIodG9tbFN0cmluZyk7XG5cbiAgICBsZXQgcGFyc2VkOiBQYXJzZVJlc3VsdDxUPiB8IG51bGwgPSBudWxsO1xuICAgIGxldCBlcnI6IEVycm9yIHwgbnVsbCA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIHBhcnNlZCA9IHBhcnNlcihzY2FubmVyKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlcnIgPSBlIGluc3RhbmNlb2YgRXJyb3IgPyBlIDogbmV3IEVycm9yKFwiW25vbi1lcnJvciB0aHJvd25dXCIpO1xuICAgIH1cblxuICAgIGlmIChlcnIgfHwgIXBhcnNlZCB8fCAhcGFyc2VkLm9rIHx8ICFzY2FubmVyLmVvZigpKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IHNjYW5uZXIucG9zaXRpb24oKTtcbiAgICAgIGNvbnN0IHN1YlN0ciA9IHRvbWxTdHJpbmcuc2xpY2UoMCwgcG9zaXRpb24pO1xuICAgICAgY29uc3QgbGluZXMgPSBzdWJTdHIuc3BsaXQoXCJcXG5cIik7XG4gICAgICBjb25zdCByb3cgPSBsaW5lcy5sZW5ndGg7XG4gICAgICBjb25zdCBjb2x1bW4gPSAoKCkgPT4ge1xuICAgICAgICBsZXQgY291bnQgPSBzdWJTdHIubGVuZ3RoO1xuICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICBpZiAoY291bnQgPiBsaW5lLmxlbmd0aCkge1xuICAgICAgICAgICAgY291bnQgLT0gbGluZS5sZW5ndGggKyAxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgICAgfSkoKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgUGFyc2UgZXJyb3Igb24gbGluZSAke3Jvd30sIGNvbHVtbiAke2NvbHVtbn06ICR7XG4gICAgICAgIGVyciA/IGVyci5tZXNzYWdlIDogYFVuZXhwZWN0ZWQgY2hhcmFjdGVyOiBcIiR7c2Nhbm5lci5jaGFyKCl9XCJgXG4gICAgICB9YDtcbiAgICAgIHRocm93IG5ldyBUT01MUGFyc2VFcnJvcihtZXNzYWdlKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlZC5ib2R5O1xuICB9O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxTQUFTLFFBQVEsK0NBQStDO0FBOEJ6RSxPQUFPLE1BQU0sdUJBQXVCO0FBQU87QUFFM0MsT0FBTyxNQUFNOztFQUNYLENBQUEsVUFBVyxDQUFXO0VB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
// denoCacheMetadata=15200608732689453855,17035425673172780062