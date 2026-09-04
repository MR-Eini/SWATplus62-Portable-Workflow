// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { deepMerge } from "jsr:@std/collections@^1.0.5/deep-merge";
export class Scanner {
  #whitespace = /[ \t]/;
  #position = 0;
  #source;
  constructor(source){
    this.#source = source;
  }
  /**
   * Get current character
   * @param index - relative index from current position
   */ char(index = 0) {
    return this.#source[this.#position + index] ?? "";
  }
  /**
   * Get sliced string
   * @param start - start position relative from current position
   * @param end - end position relative from current position
   */ slice(start, end) {
    return this.#source.slice(this.#position + start, this.#position + end);
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
      const position = this.#position;
      throw new SyntaxError(`Cannot parse the TOML: It contains invalid whitespace at position '${position}': \`${escaped}\``);
    }
  }
  /**
   * Position reached EOF or not
   */ eof() {
    return this.position() >= this.#source.length;
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
export function unflat(keys, values = {}, cObj) {
  const out = {};
  if (keys.length === 0) {
    return cObj;
  }
  if (!cObj) cObj = values;
  const key = keys[keys.length - 1];
  if (typeof key === "string") out[key] = cObj;
  return unflat(keys.slice(0, -1), values, out);
}
export function deepAssignWithTable(target, table) {
  if (table.key.length === 0 || table.key[0] == null) {
    throw new Error("Cannot parse the TOML: key length is not a positive number");
  }
  const value = target[table.key[0]];
  if (typeof value === "undefined") {
    Object.assign(target, unflat(table.key, table.type === "Table" ? table.value : [
      table.value
    ]));
  } else if (Array.isArray(value)) {
    if (table.type === "TableArray" && table.key.length === 1) {
      value.push(table.value);
    } else {
      const last = value[value.length - 1];
      deepAssignWithTable(last, {
        type: table.type,
        key: table.key.slice(1),
        value: table.value
      });
    }
  } else if (typeof value === "object" && value !== null) {
    deepAssignWithTable(value, {
      type: table.type,
      key: table.key.slice(1),
      value: table.value
    });
  } else {
    throw new Error("Unexpected assign");
  }
}
// ---------------------------------
// Parser combinators and generators
// ---------------------------------
function or(parsers) {
  return (scanner)=>{
    for (const parse of parsers){
      const result = parse(scanner);
      if (result.ok) return result;
    }
    return failure();
  };
}
function join(parser, separator) {
  const Separator = character(separator);
  return (scanner)=>{
    const first = parser(scanner);
    if (!first.ok) return failure();
    const out = [
      first.body
    ];
    while(!scanner.eof()){
      if (!Separator(scanner).ok) break;
      const result = parser(scanner);
      if (!result.ok) {
        throw new SyntaxError(`Invalid token after "${separator}"`);
      }
      out.push(result.body);
    }
    return success(out);
  };
}
function kv(keyParser, separator, valueParser) {
  const Separator = character(separator);
  return (scanner)=>{
    const key = keyParser(scanner);
    if (!key.ok) return failure();
    const sep = Separator(scanner);
    if (!sep.ok) {
      throw new SyntaxError(`key/value pair doesn't have "${separator}"`);
    }
    const value = valueParser(scanner);
    if (!value.ok) {
      throw new SyntaxError(`Value of key/value pair is invalid data format`);
    }
    return success(unflat(key.body, value.body));
  };
}
function merge(parser) {
  return (scanner)=>{
    const result = parser(scanner);
    if (!result.ok) return failure();
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
  return (scanner)=>{
    const body = [];
    while(!scanner.eof()){
      const result = parser(scanner);
      if (!result.ok) break;
      body.push(result.body);
      scanner.nextUntilChar();
    }
    if (body.length === 0) return failure();
    return success(body);
  };
}
function surround(left, parser, right) {
  const Left = character(left);
  const Right = character(right);
  return (scanner)=>{
    if (!Left(scanner).ok) {
      return failure();
    }
    const result = parser(scanner);
    if (!result.ok) {
      throw new SyntaxError(`Invalid token after "${left}"`);
    }
    if (!Right(scanner).ok) {
      throw new SyntaxError(`Not closed by "${right}" after started with "${left}"`);
    }
    return success(result.body);
  };
}
function character(str) {
  return (scanner)=>{
    scanner.nextUntilChar({
      inline: true
    });
    if (scanner.slice(0, str.length) !== str) return failure();
    scanner.next(str.length);
    scanner.nextUntilChar({
      inline: true
    });
    return success(undefined);
  };
}
// -----------------------
// Parser components
// -----------------------
const BARE_KEY_REGEXP = /[A-Za-z0-9_-]/;
const FLOAT_REGEXP = /[0-9_\.e+\-]/i;
const END_OF_VALUE_REGEXP = /[ \t\r\n#,}\]]/;
export function bareKey(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  if (!scanner.char() || !BARE_KEY_REGEXP.test(scanner.char())) {
    return failure();
  }
  const acc = [];
  while(scanner.char() && BARE_KEY_REGEXP.test(scanner.char())){
    acc.push(scanner.char());
    scanner.next();
  }
  const key = acc.join("");
  return success(key);
}
function escapeSequence(scanner) {
  if (scanner.char() !== "\\") return failure();
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
      throw new SyntaxError(`Invalid escape sequence: \\${scanner.char()}`);
  }
}
export function basicString(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  if (scanner.char() !== '"') return failure();
  scanner.next();
  const acc = [];
  while(scanner.char() !== '"' && !scanner.eof()){
    if (scanner.char() === "\n") {
      throw new SyntaxError("Single-line string cannot contain EOL");
    }
    const escapedChar = escapeSequence(scanner);
    if (escapedChar.ok) {
      acc.push(escapedChar.body);
    } else {
      acc.push(scanner.char());
      scanner.next();
    }
  }
  if (scanner.eof()) {
    throw new SyntaxError(`Single-line string is not closed:\n${acc.join("")}`);
  }
  scanner.next(); // skip last '""
  return success(acc.join(""));
}
export function literalString(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  if (scanner.char() !== "'") return failure();
  scanner.next();
  const acc = [];
  while(scanner.char() !== "'" && !scanner.eof()){
    if (scanner.char() === "\n") {
      throw new SyntaxError("Single-line string cannot contain EOL");
    }
    acc.push(scanner.char());
    scanner.next();
  }
  if (scanner.eof()) {
    throw new SyntaxError(`Single-line string is not closed:\n${acc.join("")}`);
  }
  scanner.next(); // skip last "'"
  return success(acc.join(""));
}
export function multilineBasicString(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  if (scanner.slice(0, 3) !== '"""') return failure();
  scanner.next(3);
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
    const escapedChar = escapeSequence(scanner);
    if (escapedChar.ok) {
      acc.push(escapedChar.body);
    } else {
      acc.push(scanner.char());
      scanner.next();
    }
  }
  if (scanner.eof()) {
    throw new SyntaxError(`Multi-line string is not closed:\n${acc.join("")}`);
  }
  // if ends with 4 `"`, push the fist `"` to string
  if (scanner.char(3) === '"') {
    acc.push('"');
    scanner.next();
  }
  scanner.next(3); // skip last '""""
  return success(acc.join(""));
}
export function multilineLiteralString(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  if (scanner.slice(0, 3) !== "'''") return failure();
  scanner.next(3);
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
    throw new SyntaxError(`Multi-line string is not closed:\n${acc.join("")}`);
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
export function symbols(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  const found = symbolPairs.find(([str])=>scanner.slice(0, str.length) === str);
  if (!found) return failure();
  const [str, value] = found;
  scanner.next(str.length);
  return success(value);
}
export const dottedKey = join(or([
  bareKey,
  basicString,
  literalString
]), ".");
export function integer(scanner) {
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
    if (acc.length === 1) return failure();
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
export function float(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  // lookahead validation is needed for integer value is similar to float
  let position = 0;
  while(scanner.char(position) && !END_OF_VALUE_REGEXP.test(scanner.char(position))){
    if (!FLOAT_REGEXP.test(scanner.char(position))) return failure();
    position++;
  }
  const acc = [];
  if (/[+-]/.test(scanner.char())) {
    acc.push(scanner.char());
    scanner.next();
  }
  while(FLOAT_REGEXP.test(scanner.char()) && !scanner.eof()){
    acc.push(scanner.char());
    scanner.next();
  }
  if (acc.length === 0) return failure();
  const float = parseFloat(acc.filter((char)=>char !== "_").join(""));
  if (isNaN(float)) return failure();
  return success(float);
}
export function dateTime(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  let dateStr = scanner.slice(0, 10);
  // example: 1979-05-27
  if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return failure();
  scanner.next(10);
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
    throw new SyntaxError(`Invalid date string "${dateStr}"`);
  }
  return success(date);
}
export function localTime(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  let timeStr = scanner.slice(0, 8);
  if (!/^(\d{2}):(\d{2}):(\d{2})/.test(timeStr)) return failure();
  scanner.next(8);
  const acc = [];
  if (scanner.char() !== ".") return success(timeStr);
  acc.push(scanner.char());
  scanner.next();
  while(/[0-9]/.test(scanner.char()) && !scanner.eof()){
    acc.push(scanner.char());
    scanner.next();
  }
  timeStr += acc.join("");
  return success(timeStr);
}
export function arrayValue(scanner) {
  scanner.nextUntilChar({
    inline: true
  });
  if (scanner.char() !== "[") return failure();
  scanner.next();
  const array = [];
  while(!scanner.eof()){
    scanner.nextUntilChar();
    const result = value(scanner);
    if (!result.ok) break;
    array.push(result.body);
    scanner.nextUntilChar({
      inline: true
    });
    // may have a next item, but trailing comma is allowed at array
    if (scanner.char() !== ",") break;
    scanner.next();
  }
  scanner.nextUntilChar();
  if (scanner.char() !== "]") throw new SyntaxError("Array is not closed");
  scanner.next();
  return success(array);
}
export function inlineTable(scanner) {
  scanner.nextUntilChar();
  if (scanner.char(1) === "}") {
    scanner.next(2);
    return success({});
  }
  const pairs = surround("{", join(pair, ","), "}")(scanner);
  if (!pairs.ok) return failure();
  let table = {};
  for (const pair of pairs.body){
    table = deepMerge(table, pair);
  }
  return success(table);
}
export const value = or([
  multilineBasicString,
  multilineLiteralString,
  basicString,
  literalString,
  symbols,
  dateTime,
  localTime,
  float,
  integer,
  arrayValue,
  inlineTable
]);
export const pair = kv(dottedKey, "=", value);
export function block(scanner) {
  scanner.nextUntilChar();
  const result = merge(repeat(pair))(scanner);
  if (result.ok) return success({
    type: "Block",
    value: result.body
  });
  return failure();
}
export const tableHeader = surround("[", dottedKey, "]");
export function table(scanner) {
  scanner.nextUntilChar();
  const header = tableHeader(scanner);
  if (!header.ok) return failure();
  scanner.nextUntilChar();
  const b = block(scanner);
  return success({
    type: "Table",
    key: header.body,
    value: b.ok ? b.body.value : {}
  });
}
export const tableArrayHeader = surround("[[", dottedKey, "]]");
export function tableArray(scanner) {
  scanner.nextUntilChar();
  const header = tableArrayHeader(scanner);
  if (!header.ok) return failure();
  scanner.nextUntilChar();
  const b = block(scanner);
  return success({
    type: "TableArray",
    key: header.body,
    value: b.ok ? b.body.value : {}
  });
}
export function toml(scanner) {
  const blocks = repeat(or([
    block,
    tableArray,
    table
  ]))(scanner);
  if (!blocks.ok) return failure();
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
          deepAssignWithTable(body, block);
          break;
        }
      case "TableArray":
        {
          deepAssignWithTable(body, block);
          break;
        }
    }
  }
  return success(body);
}
export function parserFactory(parser) {
  return (tomlString)=>{
    const scanner = new Scanner(tomlString);
    let parsed = null;
    let err = null;
    try {
      parsed = parser(scanner);
    } catch (e) {
      err = e instanceof Error ? e : new Error("Invalid error type caught");
    }
    if (err || !parsed || !parsed.ok || !scanner.eof()) {
      const position = scanner.position();
      const subStr = tomlString.slice(0, position);
      const lines = subStr.split("\n");
      const row = lines.length;
      const column = (()=>{
        let count = subStr.length;
        for (const line of lines){
          if (count <= line.length) break;
          count -= line.length + 1;
        }
        return count;
      })();
      const message = `Parse error on line ${row}, column ${column}: ${err ? err.message : `Unexpected character: "${scanner.char()}"`}`;
      throw new SyntaxError(message);
    }
    return parsed.body;
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvdG9tbC8xLjAuMS9fcGFyc2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGRlZXBNZXJnZSB9IGZyb20gXCJqc3I6QHN0ZC9jb2xsZWN0aW9uc0BeMS4wLjUvZGVlcC1tZXJnZVwiO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEludGVyZmFjZXMgYW5kIGJhc2UgY2xhc3Nlc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmludGVyZmFjZSBTdWNjZXNzPFQ+IHtcbiAgb2s6IHRydWU7XG4gIGJvZHk6IFQ7XG59XG5pbnRlcmZhY2UgRmFpbHVyZSB7XG4gIG9rOiBmYWxzZTtcbn1cbnR5cGUgUGFyc2VSZXN1bHQ8VD4gPSBTdWNjZXNzPFQ+IHwgRmFpbHVyZTtcblxudHlwZSBQYXJzZXJDb21wb25lbnQ8VCA9IHVua25vd24+ID0gKHNjYW5uZXI6IFNjYW5uZXIpID0+IFBhcnNlUmVzdWx0PFQ+O1xuXG50eXBlIEJsb2NrUGFyc2VSZXN1bHRCb2R5ID0ge1xuICB0eXBlOiBcIkJsb2NrXCI7XG4gIHZhbHVlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn0gfCB7XG4gIHR5cGU6IFwiVGFibGVcIjtcbiAga2V5OiBzdHJpbmdbXTtcbiAgdmFsdWU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufSB8IHtcbiAgdHlwZTogXCJUYWJsZUFycmF5XCI7XG4gIGtleTogc3RyaW5nW107XG4gIHZhbHVlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn07XG5cbmV4cG9ydCBjbGFzcyBTY2FubmVyIHtcbiAgI3doaXRlc3BhY2UgPSAvWyBcXHRdLztcbiAgI3Bvc2l0aW9uID0gMDtcbiAgI3NvdXJjZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogc3RyaW5nKSB7XG4gICAgdGhpcy4jc291cmNlID0gc291cmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IGNoYXJhY3RlclxuICAgKiBAcGFyYW0gaW5kZXggLSByZWxhdGl2ZSBpbmRleCBmcm9tIGN1cnJlbnQgcG9zaXRpb25cbiAgICovXG4gIGNoYXIoaW5kZXggPSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuI3NvdXJjZVt0aGlzLiNwb3NpdGlvbiArIGluZGV4XSA/PyBcIlwiO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBzbGljZWQgc3RyaW5nXG4gICAqIEBwYXJhbSBzdGFydCAtIHN0YXJ0IHBvc2l0aW9uIHJlbGF0aXZlIGZyb20gY3VycmVudCBwb3NpdGlvblxuICAgKiBAcGFyYW0gZW5kIC0gZW5kIHBvc2l0aW9uIHJlbGF0aXZlIGZyb20gY3VycmVudCBwb3NpdGlvblxuICAgKi9cbiAgc2xpY2Uoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLiNzb3VyY2Uuc2xpY2UodGhpcy4jcG9zaXRpb24gKyBzdGFydCwgdGhpcy4jcG9zaXRpb24gKyBlbmQpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgcG9zaXRpb24gdG8gbmV4dFxuICAgKi9cbiAgbmV4dChjb3VudD86IG51bWJlcikge1xuICAgIGlmICh0eXBlb2YgY291bnQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICB0aGlzLiNwb3NpdGlvbisrO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiNwb3NpdGlvbisrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHBvc2l0aW9uIHVudGlsIGN1cnJlbnQgY2hhciBpcyBub3QgYSB3aGl0ZXNwYWNlLCBFT0wsIG9yIGNvbW1lbnQuXG4gICAqIEBwYXJhbSBvcHRpb25zLmlubGluZSAtIHNraXAgb25seSB3aGl0ZXNwYWNlc1xuICAgKi9cbiAgbmV4dFVudGlsQ2hhcihcbiAgICBvcHRpb25zOiB7IGlubGluZT86IGJvb2xlYW47IGNvbW1lbnQ/OiBib29sZWFuIH0gPSB7IGNvbW1lbnQ6IHRydWUgfSxcbiAgKSB7XG4gICAgaWYgKG9wdGlvbnMuaW5saW5lKSB7XG4gICAgICB3aGlsZSAodGhpcy4jd2hpdGVzcGFjZS50ZXN0KHRoaXMuY2hhcigpKSAmJiAhdGhpcy5lb2YoKSkge1xuICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKCF0aGlzLmVvZigpKSB7XG4gICAgICAgIGNvbnN0IGNoYXIgPSB0aGlzLmNoYXIoKTtcbiAgICAgICAgaWYgKHRoaXMuI3doaXRlc3BhY2UudGVzdChjaGFyKSB8fCB0aGlzLmlzQ3VycmVudENoYXJFT0woKSkge1xuICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuY29tbWVudCAmJiB0aGlzLmNoYXIoKSA9PT0gXCIjXCIpIHtcbiAgICAgICAgICAvLyBlbnRlcmluZyBjb21tZW50XG4gICAgICAgICAgd2hpbGUgKCF0aGlzLmlzQ3VycmVudENoYXJFT0woKSAmJiAhdGhpcy5lb2YoKSkge1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEludmFsaWQgaWYgY3VycmVudCBjaGFyIGlzIG90aGVyIGtpbmRzIG9mIHdoaXRlc3BhY2VcbiAgICBpZiAoIXRoaXMuaXNDdXJyZW50Q2hhckVPTCgpICYmIC9cXHMvLnRlc3QodGhpcy5jaGFyKCkpKSB7XG4gICAgICBjb25zdCBlc2NhcGVkID0gXCJcXFxcdVwiICsgdGhpcy5jaGFyKCkuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNik7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuI3Bvc2l0aW9uO1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICBgQ2Fubm90IHBhcnNlIHRoZSBUT01MOiBJdCBjb250YWlucyBpbnZhbGlkIHdoaXRlc3BhY2UgYXQgcG9zaXRpb24gJyR7cG9zaXRpb259JzogXFxgJHtlc2NhcGVkfVxcYGAsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQb3NpdGlvbiByZWFjaGVkIEVPRiBvciBub3RcbiAgICovXG4gIGVvZigpIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbigpID49IHRoaXMuI3NvdXJjZS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgcG9zaXRpb25cbiAgICovXG4gIHBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiNwb3NpdGlvbjtcbiAgfVxuXG4gIGlzQ3VycmVudENoYXJFT0woKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hhcigpID09PSBcIlxcblwiIHx8IHRoaXMuc2xpY2UoMCwgMikgPT09IFwiXFxyXFxuXCI7XG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFV0aWxpdGllc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gc3VjY2VzczxUPihib2R5OiBUKTogU3VjY2VzczxUPiB7XG4gIHJldHVybiB7IG9rOiB0cnVlLCBib2R5IH07XG59XG5mdW5jdGlvbiBmYWlsdXJlKCk6IEZhaWx1cmUge1xuICByZXR1cm4geyBvazogZmFsc2UgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuZmxhdChcbiAga2V5czogc3RyaW5nW10sXG4gIHZhbHVlczogdW5rbm93biA9IHt9LFxuICBjT2JqPzogdW5rbm93bixcbik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY09iaiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgfVxuICBpZiAoIWNPYmopIGNPYmogPSB2YWx1ZXM7XG4gIGNvbnN0IGtleTogc3RyaW5nIHwgdW5kZWZpbmVkID0ga2V5c1trZXlzLmxlbmd0aCAtIDFdO1xuICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIikgb3V0W2tleV0gPSBjT2JqO1xuICByZXR1cm4gdW5mbGF0KGtleXMuc2xpY2UoMCwgLTEpLCB2YWx1ZXMsIG91dCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGVlcEFzc2lnbldpdGhUYWJsZSh0YXJnZXQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCB0YWJsZToge1xuICB0eXBlOiBcIlRhYmxlXCIgfCBcIlRhYmxlQXJyYXlcIjtcbiAga2V5OiBzdHJpbmdbXTtcbiAgdmFsdWU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufSkge1xuICBpZiAodGFibGUua2V5Lmxlbmd0aCA9PT0gMCB8fCB0YWJsZS5rZXlbMF0gPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiQ2Fubm90IHBhcnNlIHRoZSBUT01MOiBrZXkgbGVuZ3RoIGlzIG5vdCBhIHBvc2l0aXZlIG51bWJlclwiLFxuICAgICk7XG4gIH1cbiAgY29uc3QgdmFsdWUgPSB0YXJnZXRbdGFibGUua2V5WzBdXTtcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgT2JqZWN0LmFzc2lnbihcbiAgICAgIHRhcmdldCxcbiAgICAgIHVuZmxhdChcbiAgICAgICAgdGFibGUua2V5LFxuICAgICAgICB0YWJsZS50eXBlID09PSBcIlRhYmxlXCIgPyB0YWJsZS52YWx1ZSA6IFt0YWJsZS52YWx1ZV0sXG4gICAgICApLFxuICAgICk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBpZiAodGFibGUudHlwZSA9PT0gXCJUYWJsZUFycmF5XCIgJiYgdGFibGUua2V5Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgdmFsdWUucHVzaCh0YWJsZS52YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxhc3QgPSB2YWx1ZVt2YWx1ZS5sZW5ndGggLSAxXTtcbiAgICAgIGRlZXBBc3NpZ25XaXRoVGFibGUobGFzdCwge1xuICAgICAgICB0eXBlOiB0YWJsZS50eXBlLFxuICAgICAgICBrZXk6IHRhYmxlLmtleS5zbGljZSgxKSxcbiAgICAgICAgdmFsdWU6IHRhYmxlLnZhbHVlLFxuICAgICAgfSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgIGRlZXBBc3NpZ25XaXRoVGFibGUodmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHtcbiAgICAgIHR5cGU6IHRhYmxlLnR5cGUsXG4gICAgICBrZXk6IHRhYmxlLmtleS5zbGljZSgxKSxcbiAgICAgIHZhbHVlOiB0YWJsZS52YWx1ZSxcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGFzc2lnblwiKTtcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFBhcnNlciBjb21iaW5hdG9ycyBhbmQgZ2VuZXJhdG9yc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIG9yPFQ+KHBhcnNlcnM6IFBhcnNlckNvbXBvbmVudDxUPltdKTogUGFyc2VyQ29tcG9uZW50PFQ+IHtcbiAgcmV0dXJuIChzY2FubmVyOiBTY2FubmVyKTogUGFyc2VSZXN1bHQ8VD4gPT4ge1xuICAgIGZvciAoY29uc3QgcGFyc2Ugb2YgcGFyc2Vycykge1xuICAgICAgY29uc3QgcmVzdWx0ID0gcGFyc2Uoc2Nhbm5lcik7XG4gICAgICBpZiAocmVzdWx0Lm9rKSByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gZmFpbHVyZSgpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBqb2luPFQ+KFxuICBwYXJzZXI6IFBhcnNlckNvbXBvbmVudDxUPixcbiAgc2VwYXJhdG9yOiBzdHJpbmcsXG4pOiBQYXJzZXJDb21wb25lbnQ8VFtdPiB7XG4gIGNvbnN0IFNlcGFyYXRvciA9IGNoYXJhY3RlcihzZXBhcmF0b3IpO1xuICByZXR1cm4gKHNjYW5uZXI6IFNjYW5uZXIpOiBQYXJzZVJlc3VsdDxUW10+ID0+IHtcbiAgICBjb25zdCBmaXJzdCA9IHBhcnNlcihzY2FubmVyKTtcbiAgICBpZiAoIWZpcnN0Lm9rKSByZXR1cm4gZmFpbHVyZSgpO1xuICAgIGNvbnN0IG91dDogVFtdID0gW2ZpcnN0LmJvZHldO1xuICAgIHdoaWxlICghc2Nhbm5lci5lb2YoKSkge1xuICAgICAgaWYgKCFTZXBhcmF0b3Ioc2Nhbm5lcikub2spIGJyZWFrO1xuICAgICAgY29uc3QgcmVzdWx0ID0gcGFyc2VyKHNjYW5uZXIpO1xuICAgICAgaWYgKCFyZXN1bHQub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBJbnZhbGlkIHRva2VuIGFmdGVyIFwiJHtzZXBhcmF0b3J9XCJgKTtcbiAgICAgIH1cbiAgICAgIG91dC5wdXNoKHJlc3VsdC5ib2R5KTtcbiAgICB9XG4gICAgcmV0dXJuIHN1Y2Nlc3Mob3V0KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24ga3Y8VD4oXG4gIGtleVBhcnNlcjogUGFyc2VyQ29tcG9uZW50PHN0cmluZ1tdPixcbiAgc2VwYXJhdG9yOiBzdHJpbmcsXG4gIHZhbHVlUGFyc2VyOiBQYXJzZXJDb21wb25lbnQ8VD4sXG4pOiBQYXJzZXJDb21wb25lbnQ8eyBba2V5OiBzdHJpbmddOiB1bmtub3duIH0+IHtcbiAgY29uc3QgU2VwYXJhdG9yID0gY2hhcmFjdGVyKHNlcGFyYXRvcik7XG4gIHJldHVybiAoc2Nhbm5lcjogU2Nhbm5lcik6IFBhcnNlUmVzdWx0PHsgW2tleTogc3RyaW5nXTogdW5rbm93biB9PiA9PiB7XG4gICAgY29uc3Qga2V5ID0ga2V5UGFyc2VyKHNjYW5uZXIpO1xuICAgIGlmICgha2V5Lm9rKSByZXR1cm4gZmFpbHVyZSgpO1xuICAgIGNvbnN0IHNlcCA9IFNlcGFyYXRvcihzY2FubmVyKTtcbiAgICBpZiAoIXNlcC5vaykge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBrZXkvdmFsdWUgcGFpciBkb2Vzbid0IGhhdmUgXCIke3NlcGFyYXRvcn1cImApO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHZhbHVlUGFyc2VyKHNjYW5uZXIpO1xuICAgIGlmICghdmFsdWUub2spIHtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgYFZhbHVlIG9mIGtleS92YWx1ZSBwYWlyIGlzIGludmFsaWQgZGF0YSBmb3JtYXRgLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1Y2Nlc3ModW5mbGF0KGtleS5ib2R5LCB2YWx1ZS5ib2R5KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG1lcmdlKFxuICBwYXJzZXI6IFBhcnNlckNvbXBvbmVudDx1bmtub3duW10+LFxuKTogUGFyc2VyQ29tcG9uZW50PFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG4gIHJldHVybiAoc2Nhbm5lcjogU2Nhbm5lcik6IFBhcnNlUmVzdWx0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PiA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gcGFyc2VyKHNjYW5uZXIpO1xuICAgIGlmICghcmVzdWx0Lm9rKSByZXR1cm4gZmFpbHVyZSgpO1xuICAgIGxldCBib2R5ID0ge307XG4gICAgZm9yIChjb25zdCByZWNvcmQgb2YgcmVzdWx0LmJvZHkpIHtcbiAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gXCJvYmplY3RcIiAmJiBib2R5ICE9PSBudWxsKSB7XG4gICAgICAgIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICAgICAgIGJvZHkgPSBkZWVwTWVyZ2UoYm9keSwgcmVjb3JkIGFzIFJlY29yZDxhbnksIGFueT4pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3VjY2Vzcyhib2R5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVwZWF0PFQ+KFxuICBwYXJzZXI6IFBhcnNlckNvbXBvbmVudDxUPixcbik6IFBhcnNlckNvbXBvbmVudDxUW10+IHtcbiAgcmV0dXJuIChzY2FubmVyOiBTY2FubmVyKSA9PiB7XG4gICAgY29uc3QgYm9keTogVFtdID0gW107XG4gICAgd2hpbGUgKCFzY2FubmVyLmVvZigpKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBwYXJzZXIoc2Nhbm5lcik7XG4gICAgICBpZiAoIXJlc3VsdC5vaykgYnJlYWs7XG4gICAgICBib2R5LnB1c2gocmVzdWx0LmJvZHkpO1xuICAgICAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKCk7XG4gICAgfVxuICAgIGlmIChib2R5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhaWx1cmUoKTtcbiAgICByZXR1cm4gc3VjY2Vzcyhib2R5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3Vycm91bmQ8VD4oXG4gIGxlZnQ6IHN0cmluZyxcbiAgcGFyc2VyOiBQYXJzZXJDb21wb25lbnQ8VD4sXG4gIHJpZ2h0OiBzdHJpbmcsXG4pOiBQYXJzZXJDb21wb25lbnQ8VD4ge1xuICBjb25zdCBMZWZ0ID0gY2hhcmFjdGVyKGxlZnQpO1xuICBjb25zdCBSaWdodCA9IGNoYXJhY3RlcihyaWdodCk7XG4gIHJldHVybiAoc2Nhbm5lcjogU2Nhbm5lcikgPT4ge1xuICAgIGlmICghTGVmdChzY2FubmVyKS5vaykge1xuICAgICAgcmV0dXJuIGZhaWx1cmUoKTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0gcGFyc2VyKHNjYW5uZXIpO1xuICAgIGlmICghcmVzdWx0Lm9rKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEludmFsaWQgdG9rZW4gYWZ0ZXIgXCIke2xlZnR9XCJgKTtcbiAgICB9XG4gICAgaWYgKCFSaWdodChzY2FubmVyKS5vaykge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICBgTm90IGNsb3NlZCBieSBcIiR7cmlnaHR9XCIgYWZ0ZXIgc3RhcnRlZCB3aXRoIFwiJHtsZWZ0fVwiYCxcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBzdWNjZXNzKHJlc3VsdC5ib2R5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2hhcmFjdGVyKHN0cjogc3RyaW5nKSB7XG4gIHJldHVybiAoc2Nhbm5lcjogU2Nhbm5lcik6IFBhcnNlUmVzdWx0PHZvaWQ+ID0+IHtcbiAgICBzY2FubmVyLm5leHRVbnRpbENoYXIoeyBpbmxpbmU6IHRydWUgfSk7XG4gICAgaWYgKHNjYW5uZXIuc2xpY2UoMCwgc3RyLmxlbmd0aCkgIT09IHN0cikgcmV0dXJuIGZhaWx1cmUoKTtcbiAgICBzY2FubmVyLm5leHQoc3RyLmxlbmd0aCk7XG4gICAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKHsgaW5saW5lOiB0cnVlIH0pO1xuICAgIHJldHVybiBzdWNjZXNzKHVuZGVmaW5lZCk7XG4gIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQYXJzZXIgY29tcG9uZW50c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgQkFSRV9LRVlfUkVHRVhQID0gL1tBLVphLXowLTlfLV0vO1xuY29uc3QgRkxPQVRfUkVHRVhQID0gL1swLTlfXFwuZStcXC1dL2k7XG5jb25zdCBFTkRfT0ZfVkFMVUVfUkVHRVhQID0gL1sgXFx0XFxyXFxuIyx9XFxdXS87XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXJlS2V5KHNjYW5uZXI6IFNjYW5uZXIpOiBQYXJzZVJlc3VsdDxzdHJpbmc+IHtcbiAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKHsgaW5saW5lOiB0cnVlIH0pO1xuICBpZiAoIXNjYW5uZXIuY2hhcigpIHx8ICFCQVJFX0tFWV9SRUdFWFAudGVzdChzY2FubmVyLmNoYXIoKSkpIHtcbiAgICByZXR1cm4gZmFpbHVyZSgpO1xuICB9XG4gIGNvbnN0IGFjYzogc3RyaW5nW10gPSBbXTtcbiAgd2hpbGUgKHNjYW5uZXIuY2hhcigpICYmIEJBUkVfS0VZX1JFR0VYUC50ZXN0KHNjYW5uZXIuY2hhcigpKSkge1xuICAgIGFjYy5wdXNoKHNjYW5uZXIuY2hhcigpKTtcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgfVxuICBjb25zdCBrZXkgPSBhY2Muam9pbihcIlwiKTtcbiAgcmV0dXJuIHN1Y2Nlc3Moa2V5KTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlU2VxdWVuY2Uoc2Nhbm5lcjogU2Nhbm5lcik6IFBhcnNlUmVzdWx0PHN0cmluZz4ge1xuICBpZiAoc2Nhbm5lci5jaGFyKCkgIT09IFwiXFxcXFwiKSByZXR1cm4gZmFpbHVyZSgpO1xuICBzY2FubmVyLm5leHQoKTtcbiAgLy8gU2VlIGh0dHBzOi8vdG9tbC5pby9lbi92MS4wLjAtcmMuMyNzdHJpbmdcbiAgc3dpdGNoIChzY2FubmVyLmNoYXIoKSkge1xuICAgIGNhc2UgXCJiXCI6XG4gICAgICBzY2FubmVyLm5leHQoKTtcbiAgICAgIHJldHVybiBzdWNjZXNzKFwiXFxiXCIpO1xuICAgIGNhc2UgXCJ0XCI6XG4gICAgICBzY2FubmVyLm5leHQoKTtcbiAgICAgIHJldHVybiBzdWNjZXNzKFwiXFx0XCIpO1xuICAgIGNhc2UgXCJuXCI6XG4gICAgICBzY2FubmVyLm5leHQoKTtcbiAgICAgIHJldHVybiBzdWNjZXNzKFwiXFxuXCIpO1xuICAgIGNhc2UgXCJmXCI6XG4gICAgICBzY2FubmVyLm5leHQoKTtcbiAgICAgIHJldHVybiBzdWNjZXNzKFwiXFxmXCIpO1xuICAgIGNhc2UgXCJyXCI6XG4gICAgICBzY2FubmVyLm5leHQoKTtcbiAgICAgIHJldHVybiBzdWNjZXNzKFwiXFxyXCIpO1xuICAgIGNhc2UgXCJ1XCI6XG4gICAgY2FzZSBcIlVcIjoge1xuICAgICAgLy8gVW5pY29kZSBjaGFyYWN0ZXJcbiAgICAgIGNvbnN0IGNvZGVQb2ludExlbiA9IHNjYW5uZXIuY2hhcigpID09PSBcInVcIiA/IDQgOiA2O1xuICAgICAgY29uc3QgY29kZVBvaW50ID0gcGFyc2VJbnQoXG4gICAgICAgIFwiMHhcIiArIHNjYW5uZXIuc2xpY2UoMSwgMSArIGNvZGVQb2ludExlbiksXG4gICAgICAgIDE2LFxuICAgICAgKTtcbiAgICAgIGNvbnN0IHN0ciA9IFN0cmluZy5mcm9tQ29kZVBvaW50KGNvZGVQb2ludCk7XG4gICAgICBzY2FubmVyLm5leHQoY29kZVBvaW50TGVuICsgMSk7XG4gICAgICByZXR1cm4gc3VjY2VzcyhzdHIpO1xuICAgIH1cbiAgICBjYXNlICdcIic6XG4gICAgICBzY2FubmVyLm5leHQoKTtcbiAgICAgIHJldHVybiBzdWNjZXNzKCdcIicpO1xuICAgIGNhc2UgXCJcXFxcXCI6XG4gICAgICBzY2FubmVyLm5leHQoKTtcbiAgICAgIHJldHVybiBzdWNjZXNzKFwiXFxcXFwiKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICBgSW52YWxpZCBlc2NhcGUgc2VxdWVuY2U6IFxcXFwke3NjYW5uZXIuY2hhcigpfWAsXG4gICAgICApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNpY1N0cmluZyhzY2FubmVyOiBTY2FubmVyKTogUGFyc2VSZXN1bHQ8c3RyaW5nPiB7XG4gIHNjYW5uZXIubmV4dFVudGlsQ2hhcih7IGlubGluZTogdHJ1ZSB9KTtcbiAgaWYgKHNjYW5uZXIuY2hhcigpICE9PSAnXCInKSByZXR1cm4gZmFpbHVyZSgpO1xuICBzY2FubmVyLm5leHQoKTtcbiAgY29uc3QgYWNjID0gW107XG4gIHdoaWxlIChzY2FubmVyLmNoYXIoKSAhPT0gJ1wiJyAmJiAhc2Nhbm5lci5lb2YoKSkge1xuICAgIGlmIChzY2FubmVyLmNoYXIoKSA9PT0gXCJcXG5cIikge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiU2luZ2xlLWxpbmUgc3RyaW5nIGNhbm5vdCBjb250YWluIEVPTFwiKTtcbiAgICB9XG4gICAgY29uc3QgZXNjYXBlZENoYXIgPSBlc2NhcGVTZXF1ZW5jZShzY2FubmVyKTtcbiAgICBpZiAoZXNjYXBlZENoYXIub2spIHtcbiAgICAgIGFjYy5wdXNoKGVzY2FwZWRDaGFyLmJvZHkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhY2MucHVzaChzY2FubmVyLmNoYXIoKSk7XG4gICAgICBzY2FubmVyLm5leHQoKTtcbiAgICB9XG4gIH1cbiAgaWYgKHNjYW5uZXIuZW9mKCkpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgU2luZ2xlLWxpbmUgc3RyaW5nIGlzIG5vdCBjbG9zZWQ6XFxuJHthY2Muam9pbihcIlwiKX1gLFxuICAgICk7XG4gIH1cbiAgc2Nhbm5lci5uZXh0KCk7IC8vIHNraXAgbGFzdCAnXCJcIlxuICByZXR1cm4gc3VjY2VzcyhhY2Muam9pbihcIlwiKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaXRlcmFsU3RyaW5nKHNjYW5uZXI6IFNjYW5uZXIpOiBQYXJzZVJlc3VsdDxzdHJpbmc+IHtcbiAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKHsgaW5saW5lOiB0cnVlIH0pO1xuICBpZiAoc2Nhbm5lci5jaGFyKCkgIT09IFwiJ1wiKSByZXR1cm4gZmFpbHVyZSgpO1xuICBzY2FubmVyLm5leHQoKTtcbiAgY29uc3QgYWNjOiBzdHJpbmdbXSA9IFtdO1xuICB3aGlsZSAoc2Nhbm5lci5jaGFyKCkgIT09IFwiJ1wiICYmICFzY2FubmVyLmVvZigpKSB7XG4gICAgaWYgKHNjYW5uZXIuY2hhcigpID09PSBcIlxcblwiKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJTaW5nbGUtbGluZSBzdHJpbmcgY2Fubm90IGNvbnRhaW4gRU9MXCIpO1xuICAgIH1cbiAgICBhY2MucHVzaChzY2FubmVyLmNoYXIoKSk7XG4gICAgc2Nhbm5lci5uZXh0KCk7XG4gIH1cbiAgaWYgKHNjYW5uZXIuZW9mKCkpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgU2luZ2xlLWxpbmUgc3RyaW5nIGlzIG5vdCBjbG9zZWQ6XFxuJHthY2Muam9pbihcIlwiKX1gLFxuICAgICk7XG4gIH1cbiAgc2Nhbm5lci5uZXh0KCk7IC8vIHNraXAgbGFzdCBcIidcIlxuICByZXR1cm4gc3VjY2VzcyhhY2Muam9pbihcIlwiKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aWxpbmVCYXNpY1N0cmluZyhcbiAgc2Nhbm5lcjogU2Nhbm5lcixcbik6IFBhcnNlUmVzdWx0PHN0cmluZz4ge1xuICBzY2FubmVyLm5leHRVbnRpbENoYXIoeyBpbmxpbmU6IHRydWUgfSk7XG4gIGlmIChzY2FubmVyLnNsaWNlKDAsIDMpICE9PSAnXCJcIlwiJykgcmV0dXJuIGZhaWx1cmUoKTtcbiAgc2Nhbm5lci5uZXh0KDMpO1xuICBpZiAoc2Nhbm5lci5jaGFyKCkgPT09IFwiXFxuXCIpIHtcbiAgICAvLyBUaGUgZmlyc3QgbmV3bGluZSAoTEYpIGlzIHRyaW1tZWRcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgfSBlbHNlIGlmIChzY2FubmVyLnNsaWNlKDAsIDIpID09PSBcIlxcclxcblwiKSB7XG4gICAgLy8gVGhlIGZpcnN0IG5ld2xpbmUgKENSTEYpIGlzIHRyaW1tZWRcbiAgICBzY2FubmVyLm5leHQoMik7XG4gIH1cbiAgY29uc3QgYWNjOiBzdHJpbmdbXSA9IFtdO1xuICB3aGlsZSAoc2Nhbm5lci5zbGljZSgwLCAzKSAhPT0gJ1wiXCJcIicgJiYgIXNjYW5uZXIuZW9mKCkpIHtcbiAgICAvLyBsaW5lIGVuZGluZyBiYWNrc2xhc2hcbiAgICBpZiAoc2Nhbm5lci5zbGljZSgwLCAyKSA9PT0gXCJcXFxcXFxuXCIpIHtcbiAgICAgIHNjYW5uZXIubmV4dCgpO1xuICAgICAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKHsgY29tbWVudDogZmFsc2UgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9IGVsc2UgaWYgKHNjYW5uZXIuc2xpY2UoMCwgMykgPT09IFwiXFxcXFxcclxcblwiKSB7XG4gICAgICBzY2FubmVyLm5leHQoKTtcbiAgICAgIHNjYW5uZXIubmV4dFVudGlsQ2hhcih7IGNvbW1lbnQ6IGZhbHNlIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IGVzY2FwZWRDaGFyID0gZXNjYXBlU2VxdWVuY2Uoc2Nhbm5lcik7XG4gICAgaWYgKGVzY2FwZWRDaGFyLm9rKSB7XG4gICAgICBhY2MucHVzaChlc2NhcGVkQ2hhci5ib2R5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWNjLnB1c2goc2Nhbm5lci5jaGFyKCkpO1xuICAgICAgc2Nhbm5lci5uZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHNjYW5uZXIuZW9mKCkpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgTXVsdGktbGluZSBzdHJpbmcgaXMgbm90IGNsb3NlZDpcXG4ke2FjYy5qb2luKFwiXCIpfWAsXG4gICAgKTtcbiAgfVxuICAvLyBpZiBlbmRzIHdpdGggNCBgXCJgLCBwdXNoIHRoZSBmaXN0IGBcImAgdG8gc3RyaW5nXG4gIGlmIChzY2FubmVyLmNoYXIoMykgPT09ICdcIicpIHtcbiAgICBhY2MucHVzaCgnXCInKTtcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgfVxuICBzY2FubmVyLm5leHQoMyk7IC8vIHNraXAgbGFzdCAnXCJcIlwiXCJcbiAgcmV0dXJuIHN1Y2Nlc3MoYWNjLmpvaW4oXCJcIikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlsaW5lTGl0ZXJhbFN0cmluZyhcbiAgc2Nhbm5lcjogU2Nhbm5lcixcbik6IFBhcnNlUmVzdWx0PHN0cmluZz4ge1xuICBzY2FubmVyLm5leHRVbnRpbENoYXIoeyBpbmxpbmU6IHRydWUgfSk7XG4gIGlmIChzY2FubmVyLnNsaWNlKDAsIDMpICE9PSBcIicnJ1wiKSByZXR1cm4gZmFpbHVyZSgpO1xuICBzY2FubmVyLm5leHQoMyk7XG4gIGlmIChzY2FubmVyLmNoYXIoKSA9PT0gXCJcXG5cIikge1xuICAgIC8vIFRoZSBmaXJzdCBuZXdsaW5lIChMRikgaXMgdHJpbW1lZFxuICAgIHNjYW5uZXIubmV4dCgpO1xuICB9IGVsc2UgaWYgKHNjYW5uZXIuc2xpY2UoMCwgMikgPT09IFwiXFxyXFxuXCIpIHtcbiAgICAvLyBUaGUgZmlyc3QgbmV3bGluZSAoQ1JMRikgaXMgdHJpbW1lZFxuICAgIHNjYW5uZXIubmV4dCgyKTtcbiAgfVxuICBjb25zdCBhY2M6IHN0cmluZ1tdID0gW107XG4gIHdoaWxlIChzY2FubmVyLnNsaWNlKDAsIDMpICE9PSBcIicnJ1wiICYmICFzY2FubmVyLmVvZigpKSB7XG4gICAgYWNjLnB1c2goc2Nhbm5lci5jaGFyKCkpO1xuICAgIHNjYW5uZXIubmV4dCgpO1xuICB9XG4gIGlmIChzY2FubmVyLmVvZigpKSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYE11bHRpLWxpbmUgc3RyaW5nIGlzIG5vdCBjbG9zZWQ6XFxuJHthY2Muam9pbihcIlwiKX1gLFxuICAgICk7XG4gIH1cbiAgLy8gaWYgZW5kcyB3aXRoIDQgYCdgLCBwdXNoIHRoZSBmaXN0IGAnYCB0byBzdHJpbmdcbiAgaWYgKHNjYW5uZXIuY2hhcigzKSA9PT0gXCInXCIpIHtcbiAgICBhY2MucHVzaChcIidcIik7XG4gICAgc2Nhbm5lci5uZXh0KCk7XG4gIH1cbiAgc2Nhbm5lci5uZXh0KDMpOyAvLyBza2lwIGxhc3QgXCInJydcIlxuICByZXR1cm4gc3VjY2VzcyhhY2Muam9pbihcIlwiKSk7XG59XG5cbmNvbnN0IHN5bWJvbFBhaXJzOiBbc3RyaW5nLCB1bmtub3duXVtdID0gW1xuICBbXCJ0cnVlXCIsIHRydWVdLFxuICBbXCJmYWxzZVwiLCBmYWxzZV0sXG4gIFtcImluZlwiLCBJbmZpbml0eV0sXG4gIFtcIitpbmZcIiwgSW5maW5pdHldLFxuICBbXCItaW5mXCIsIC1JbmZpbml0eV0sXG4gIFtcIm5hblwiLCBOYU5dLFxuICBbXCIrbmFuXCIsIE5hTl0sXG4gIFtcIi1uYW5cIiwgTmFOXSxcbl07XG5leHBvcnQgZnVuY3Rpb24gc3ltYm9scyhzY2FubmVyOiBTY2FubmVyKTogUGFyc2VSZXN1bHQ8dW5rbm93bj4ge1xuICBzY2FubmVyLm5leHRVbnRpbENoYXIoeyBpbmxpbmU6IHRydWUgfSk7XG4gIGNvbnN0IGZvdW5kID0gc3ltYm9sUGFpcnMuZmluZCgoW3N0cl0pID0+XG4gICAgc2Nhbm5lci5zbGljZSgwLCBzdHIubGVuZ3RoKSA9PT0gc3RyXG4gICk7XG4gIGlmICghZm91bmQpIHJldHVybiBmYWlsdXJlKCk7XG4gIGNvbnN0IFtzdHIsIHZhbHVlXSA9IGZvdW5kO1xuICBzY2FubmVyLm5leHQoc3RyLmxlbmd0aCk7XG4gIHJldHVybiBzdWNjZXNzKHZhbHVlKTtcbn1cblxuZXhwb3J0IGNvbnN0IGRvdHRlZEtleSA9IGpvaW4ob3IoW2JhcmVLZXksIGJhc2ljU3RyaW5nLCBsaXRlcmFsU3RyaW5nXSksIFwiLlwiKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGludGVnZXIoc2Nhbm5lcjogU2Nhbm5lcik6IFBhcnNlUmVzdWx0PG51bWJlciB8IHN0cmluZz4ge1xuICBzY2FubmVyLm5leHRVbnRpbENoYXIoeyBpbmxpbmU6IHRydWUgfSk7XG5cbiAgLy8gSWYgYmluYXJ5IC8gb2N0YWwgLyBoZXhcbiAgY29uc3QgZmlyc3QyID0gc2Nhbm5lci5zbGljZSgwLCAyKTtcbiAgaWYgKGZpcnN0Mi5sZW5ndGggPT09IDIgJiYgLzAoPzp4fG98YikvaS50ZXN0KGZpcnN0MikpIHtcbiAgICBzY2FubmVyLm5leHQoMik7XG4gICAgY29uc3QgYWNjID0gW2ZpcnN0Ml07XG4gICAgd2hpbGUgKC9bMC05YS1mX10vaS50ZXN0KHNjYW5uZXIuY2hhcigpKSAmJiAhc2Nhbm5lci5lb2YoKSkge1xuICAgICAgYWNjLnB1c2goc2Nhbm5lci5jaGFyKCkpO1xuICAgICAgc2Nhbm5lci5uZXh0KCk7XG4gICAgfVxuICAgIGlmIChhY2MubGVuZ3RoID09PSAxKSByZXR1cm4gZmFpbHVyZSgpO1xuICAgIHJldHVybiBzdWNjZXNzKGFjYy5qb2luKFwiXCIpKTtcbiAgfVxuXG4gIGNvbnN0IGFjYyA9IFtdO1xuICBpZiAoL1srLV0vLnRlc3Qoc2Nhbm5lci5jaGFyKCkpKSB7XG4gICAgYWNjLnB1c2goc2Nhbm5lci5jaGFyKCkpO1xuICAgIHNjYW5uZXIubmV4dCgpO1xuICB9XG4gIHdoaWxlICgvWzAtOV9dLy50ZXN0KHNjYW5uZXIuY2hhcigpKSAmJiAhc2Nhbm5lci5lb2YoKSkge1xuICAgIGFjYy5wdXNoKHNjYW5uZXIuY2hhcigpKTtcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgfVxuXG4gIGlmIChhY2MubGVuZ3RoID09PSAwIHx8IChhY2MubGVuZ3RoID09PSAxICYmIC9bKy1dLy50ZXN0KGFjY1swXSEpKSkge1xuICAgIHJldHVybiBmYWlsdXJlKCk7XG4gIH1cblxuICBjb25zdCBpbnQgPSBwYXJzZUludChhY2MuZmlsdGVyKChjaGFyKSA9PiBjaGFyICE9PSBcIl9cIikuam9pbihcIlwiKSk7XG4gIHJldHVybiBzdWNjZXNzKGludCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbG9hdChzY2FubmVyOiBTY2FubmVyKTogUGFyc2VSZXN1bHQ8bnVtYmVyPiB7XG4gIHNjYW5uZXIubmV4dFVudGlsQ2hhcih7IGlubGluZTogdHJ1ZSB9KTtcblxuICAvLyBsb29rYWhlYWQgdmFsaWRhdGlvbiBpcyBuZWVkZWQgZm9yIGludGVnZXIgdmFsdWUgaXMgc2ltaWxhciB0byBmbG9hdFxuICBsZXQgcG9zaXRpb24gPSAwO1xuICB3aGlsZSAoXG4gICAgc2Nhbm5lci5jaGFyKHBvc2l0aW9uKSAmJlxuICAgICFFTkRfT0ZfVkFMVUVfUkVHRVhQLnRlc3Qoc2Nhbm5lci5jaGFyKHBvc2l0aW9uKSlcbiAgKSB7XG4gICAgaWYgKCFGTE9BVF9SRUdFWFAudGVzdChzY2FubmVyLmNoYXIocG9zaXRpb24pKSkgcmV0dXJuIGZhaWx1cmUoKTtcbiAgICBwb3NpdGlvbisrO1xuICB9XG5cbiAgY29uc3QgYWNjID0gW107XG4gIGlmICgvWystXS8udGVzdChzY2FubmVyLmNoYXIoKSkpIHtcbiAgICBhY2MucHVzaChzY2FubmVyLmNoYXIoKSk7XG4gICAgc2Nhbm5lci5uZXh0KCk7XG4gIH1cbiAgd2hpbGUgKEZMT0FUX1JFR0VYUC50ZXN0KHNjYW5uZXIuY2hhcigpKSAmJiAhc2Nhbm5lci5lb2YoKSkge1xuICAgIGFjYy5wdXNoKHNjYW5uZXIuY2hhcigpKTtcbiAgICBzY2FubmVyLm5leHQoKTtcbiAgfVxuXG4gIGlmIChhY2MubGVuZ3RoID09PSAwKSByZXR1cm4gZmFpbHVyZSgpO1xuICBjb25zdCBmbG9hdCA9IHBhcnNlRmxvYXQoYWNjLmZpbHRlcigoY2hhcikgPT4gY2hhciAhPT0gXCJfXCIpLmpvaW4oXCJcIikpO1xuICBpZiAoaXNOYU4oZmxvYXQpKSByZXR1cm4gZmFpbHVyZSgpO1xuXG4gIHJldHVybiBzdWNjZXNzKGZsb2F0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRhdGVUaW1lKHNjYW5uZXI6IFNjYW5uZXIpOiBQYXJzZVJlc3VsdDxEYXRlPiB7XG4gIHNjYW5uZXIubmV4dFVudGlsQ2hhcih7IGlubGluZTogdHJ1ZSB9KTtcblxuICBsZXQgZGF0ZVN0ciA9IHNjYW5uZXIuc2xpY2UoMCwgMTApO1xuICAvLyBleGFtcGxlOiAxOTc5LTA1LTI3XG4gIGlmICghL15cXGR7NH0tXFxkezJ9LVxcZHsyfS8udGVzdChkYXRlU3RyKSkgcmV0dXJuIGZhaWx1cmUoKTtcbiAgc2Nhbm5lci5uZXh0KDEwKTtcblxuICBjb25zdCBhY2MgPSBbXTtcbiAgLy8gZXhhbXBsZTogMTk3OS0wNS0yN1QwMDozMjowMFpcbiAgd2hpbGUgKC9bIDAtOVRaLjotXS8udGVzdChzY2FubmVyLmNoYXIoKSkgJiYgIXNjYW5uZXIuZW9mKCkpIHtcbiAgICBhY2MucHVzaChzY2FubmVyLmNoYXIoKSk7XG4gICAgc2Nhbm5lci5uZXh0KCk7XG4gIH1cbiAgZGF0ZVN0ciArPSBhY2Muam9pbihcIlwiKTtcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKGRhdGVTdHIudHJpbSgpKTtcbiAgLy8gaW52YWxpZCBkYXRlXG4gIGlmIChpc05hTihkYXRlLmdldFRpbWUoKSkpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEludmFsaWQgZGF0ZSBzdHJpbmcgXCIke2RhdGVTdHJ9XCJgKTtcbiAgfVxuXG4gIHJldHVybiBzdWNjZXNzKGRhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9jYWxUaW1lKHNjYW5uZXI6IFNjYW5uZXIpOiBQYXJzZVJlc3VsdDxzdHJpbmc+IHtcbiAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKHsgaW5saW5lOiB0cnVlIH0pO1xuXG4gIGxldCB0aW1lU3RyID0gc2Nhbm5lci5zbGljZSgwLCA4KTtcbiAgaWYgKCEvXihcXGR7Mn0pOihcXGR7Mn0pOihcXGR7Mn0pLy50ZXN0KHRpbWVTdHIpKSByZXR1cm4gZmFpbHVyZSgpO1xuICBzY2FubmVyLm5leHQoOCk7XG5cbiAgY29uc3QgYWNjID0gW107XG4gIGlmIChzY2FubmVyLmNoYXIoKSAhPT0gXCIuXCIpIHJldHVybiBzdWNjZXNzKHRpbWVTdHIpO1xuICBhY2MucHVzaChzY2FubmVyLmNoYXIoKSk7XG4gIHNjYW5uZXIubmV4dCgpO1xuXG4gIHdoaWxlICgvWzAtOV0vLnRlc3Qoc2Nhbm5lci5jaGFyKCkpICYmICFzY2FubmVyLmVvZigpKSB7XG4gICAgYWNjLnB1c2goc2Nhbm5lci5jaGFyKCkpO1xuICAgIHNjYW5uZXIubmV4dCgpO1xuICB9XG4gIHRpbWVTdHIgKz0gYWNjLmpvaW4oXCJcIik7XG4gIHJldHVybiBzdWNjZXNzKHRpbWVTdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlWYWx1ZShzY2FubmVyOiBTY2FubmVyKTogUGFyc2VSZXN1bHQ8dW5rbm93bltdPiB7XG4gIHNjYW5uZXIubmV4dFVudGlsQ2hhcih7IGlubGluZTogdHJ1ZSB9KTtcblxuICBpZiAoc2Nhbm5lci5jaGFyKCkgIT09IFwiW1wiKSByZXR1cm4gZmFpbHVyZSgpO1xuICBzY2FubmVyLm5leHQoKTtcblxuICBjb25zdCBhcnJheTogdW5rbm93bltdID0gW107XG4gIHdoaWxlICghc2Nhbm5lci5lb2YoKSkge1xuICAgIHNjYW5uZXIubmV4dFVudGlsQ2hhcigpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHZhbHVlKHNjYW5uZXIpO1xuICAgIGlmICghcmVzdWx0Lm9rKSBicmVhaztcbiAgICBhcnJheS5wdXNoKHJlc3VsdC5ib2R5KTtcbiAgICBzY2FubmVyLm5leHRVbnRpbENoYXIoeyBpbmxpbmU6IHRydWUgfSk7XG4gICAgLy8gbWF5IGhhdmUgYSBuZXh0IGl0ZW0sIGJ1dCB0cmFpbGluZyBjb21tYSBpcyBhbGxvd2VkIGF0IGFycmF5XG4gICAgaWYgKHNjYW5uZXIuY2hhcigpICE9PSBcIixcIikgYnJlYWs7XG4gICAgc2Nhbm5lci5uZXh0KCk7XG4gIH1cbiAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKCk7XG5cbiAgaWYgKHNjYW5uZXIuY2hhcigpICE9PSBcIl1cIikgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiQXJyYXkgaXMgbm90IGNsb3NlZFwiKTtcbiAgc2Nhbm5lci5uZXh0KCk7XG5cbiAgcmV0dXJuIHN1Y2Nlc3MoYXJyYXkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5saW5lVGFibGUoXG4gIHNjYW5uZXI6IFNjYW5uZXIsXG4pOiBQYXJzZVJlc3VsdDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICBzY2FubmVyLm5leHRVbnRpbENoYXIoKTtcbiAgaWYgKHNjYW5uZXIuY2hhcigxKSA9PT0gXCJ9XCIpIHtcbiAgICBzY2FubmVyLm5leHQoMik7XG4gICAgcmV0dXJuIHN1Y2Nlc3Moe30pO1xuICB9XG4gIGNvbnN0IHBhaXJzID0gc3Vycm91bmQoXG4gICAgXCJ7XCIsXG4gICAgam9pbihwYWlyLCBcIixcIiksXG4gICAgXCJ9XCIsXG4gICkoc2Nhbm5lcik7XG4gIGlmICghcGFpcnMub2spIHJldHVybiBmYWlsdXJlKCk7XG4gIGxldCB0YWJsZSA9IHt9O1xuICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMuYm9keSkge1xuICAgIHRhYmxlID0gZGVlcE1lcmdlKHRhYmxlLCBwYWlyKTtcbiAgfVxuICByZXR1cm4gc3VjY2Vzcyh0YWJsZSk7XG59XG5cbmV4cG9ydCBjb25zdCB2YWx1ZSA9IG9yKFtcbiAgbXVsdGlsaW5lQmFzaWNTdHJpbmcsXG4gIG11bHRpbGluZUxpdGVyYWxTdHJpbmcsXG4gIGJhc2ljU3RyaW5nLFxuICBsaXRlcmFsU3RyaW5nLFxuICBzeW1ib2xzLFxuICBkYXRlVGltZSxcbiAgbG9jYWxUaW1lLFxuICBmbG9hdCxcbiAgaW50ZWdlcixcbiAgYXJyYXlWYWx1ZSxcbiAgaW5saW5lVGFibGUsXG5dKTtcblxuZXhwb3J0IGNvbnN0IHBhaXIgPSBrdihkb3R0ZWRLZXksIFwiPVwiLCB2YWx1ZSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBibG9jayhcbiAgc2Nhbm5lcjogU2Nhbm5lcixcbik6IFBhcnNlUmVzdWx0PEJsb2NrUGFyc2VSZXN1bHRCb2R5PiB7XG4gIHNjYW5uZXIubmV4dFVudGlsQ2hhcigpO1xuICBjb25zdCByZXN1bHQgPSBtZXJnZShyZXBlYXQocGFpcikpKHNjYW5uZXIpO1xuICBpZiAocmVzdWx0Lm9rKSByZXR1cm4gc3VjY2Vzcyh7IHR5cGU6IFwiQmxvY2tcIiwgdmFsdWU6IHJlc3VsdC5ib2R5IH0pO1xuICByZXR1cm4gZmFpbHVyZSgpO1xufVxuXG5leHBvcnQgY29uc3QgdGFibGVIZWFkZXIgPSBzdXJyb3VuZChcIltcIiwgZG90dGVkS2V5LCBcIl1cIik7XG5cbmV4cG9ydCBmdW5jdGlvbiB0YWJsZShzY2FubmVyOiBTY2FubmVyKTogUGFyc2VSZXN1bHQ8QmxvY2tQYXJzZVJlc3VsdEJvZHk+IHtcbiAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKCk7XG4gIGNvbnN0IGhlYWRlciA9IHRhYmxlSGVhZGVyKHNjYW5uZXIpO1xuICBpZiAoIWhlYWRlci5vaykgcmV0dXJuIGZhaWx1cmUoKTtcbiAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKCk7XG4gIGNvbnN0IGIgPSBibG9jayhzY2FubmVyKTtcbiAgcmV0dXJuIHN1Y2Nlc3Moe1xuICAgIHR5cGU6IFwiVGFibGVcIixcbiAgICBrZXk6IGhlYWRlci5ib2R5LFxuICAgIHZhbHVlOiBiLm9rID8gYi5ib2R5LnZhbHVlIDoge30sXG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgdGFibGVBcnJheUhlYWRlciA9IHN1cnJvdW5kKFwiW1tcIiwgZG90dGVkS2V5LCBcIl1dXCIpO1xuXG5leHBvcnQgZnVuY3Rpb24gdGFibGVBcnJheShcbiAgc2Nhbm5lcjogU2Nhbm5lcixcbik6IFBhcnNlUmVzdWx0PEJsb2NrUGFyc2VSZXN1bHRCb2R5PiB7XG4gIHNjYW5uZXIubmV4dFVudGlsQ2hhcigpO1xuICBjb25zdCBoZWFkZXIgPSB0YWJsZUFycmF5SGVhZGVyKHNjYW5uZXIpO1xuICBpZiAoIWhlYWRlci5vaykgcmV0dXJuIGZhaWx1cmUoKTtcbiAgc2Nhbm5lci5uZXh0VW50aWxDaGFyKCk7XG4gIGNvbnN0IGIgPSBibG9jayhzY2FubmVyKTtcbiAgcmV0dXJuIHN1Y2Nlc3Moe1xuICAgIHR5cGU6IFwiVGFibGVBcnJheVwiLFxuICAgIGtleTogaGVhZGVyLmJvZHksXG4gICAgdmFsdWU6IGIub2sgPyBiLmJvZHkudmFsdWUgOiB7fSxcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b21sKFxuICBzY2FubmVyOiBTY2FubmVyLFxuKTogUGFyc2VSZXN1bHQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcbiAgY29uc3QgYmxvY2tzID0gcmVwZWF0KG9yKFtibG9jaywgdGFibGVBcnJheSwgdGFibGVdKSkoc2Nhbm5lcik7XG4gIGlmICghYmxvY2tzLm9rKSByZXR1cm4gZmFpbHVyZSgpO1xuICBsZXQgYm9keSA9IHt9O1xuICBmb3IgKGNvbnN0IGJsb2NrIG9mIGJsb2Nrcy5ib2R5KSB7XG4gICAgc3dpdGNoIChibG9jay50eXBlKSB7XG4gICAgICBjYXNlIFwiQmxvY2tcIjoge1xuICAgICAgICBib2R5ID0gZGVlcE1lcmdlKGJvZHksIGJsb2NrLnZhbHVlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIFwiVGFibGVcIjoge1xuICAgICAgICBkZWVwQXNzaWduV2l0aFRhYmxlKGJvZHksIGJsb2NrKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIFwiVGFibGVBcnJheVwiOiB7XG4gICAgICAgIGRlZXBBc3NpZ25XaXRoVGFibGUoYm9keSwgYmxvY2spO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN1Y2Nlc3MoYm9keSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXJGYWN0b3J5PFQ+KHBhcnNlcjogUGFyc2VyQ29tcG9uZW50PFQ+KSB7XG4gIHJldHVybiAodG9tbFN0cmluZzogc3RyaW5nKTogVCA9PiB7XG4gICAgY29uc3Qgc2Nhbm5lciA9IG5ldyBTY2FubmVyKHRvbWxTdHJpbmcpO1xuXG4gICAgbGV0IHBhcnNlZDogUGFyc2VSZXN1bHQ8VD4gfCBudWxsID0gbnVsbDtcbiAgICBsZXQgZXJyOiBFcnJvciB8IG51bGwgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBwYXJzZWQgPSBwYXJzZXIoc2Nhbm5lcik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZXJyID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZSA6IG5ldyBFcnJvcihcIkludmFsaWQgZXJyb3IgdHlwZSBjYXVnaHRcIik7XG4gICAgfVxuXG4gICAgaWYgKGVyciB8fCAhcGFyc2VkIHx8ICFwYXJzZWQub2sgfHwgIXNjYW5uZXIuZW9mKCkpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gc2Nhbm5lci5wb3NpdGlvbigpO1xuICAgICAgY29uc3Qgc3ViU3RyID0gdG9tbFN0cmluZy5zbGljZSgwLCBwb3NpdGlvbik7XG4gICAgICBjb25zdCBsaW5lcyA9IHN1YlN0ci5zcGxpdChcIlxcblwiKTtcbiAgICAgIGNvbnN0IHJvdyA9IGxpbmVzLmxlbmd0aDtcbiAgICAgIGNvbnN0IGNvbHVtbiA9ICgoKSA9PiB7XG4gICAgICAgIGxldCBjb3VudCA9IHN1YlN0ci5sZW5ndGg7XG4gICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICAgIGlmIChjb3VudCA8PSBsaW5lLmxlbmd0aCkgYnJlYWs7XG4gICAgICAgICAgY291bnQgLT0gbGluZS5sZW5ndGggKyAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICAgIH0pKCk7XG4gICAgICBjb25zdCBtZXNzYWdlID0gYFBhcnNlIGVycm9yIG9uIGxpbmUgJHtyb3d9LCBjb2x1bW4gJHtjb2x1bW59OiAke1xuICAgICAgICBlcnIgPyBlcnIubWVzc2FnZSA6IGBVbmV4cGVjdGVkIGNoYXJhY3RlcjogXCIke3NjYW5uZXIuY2hhcigpfVwiYFxuICAgICAgfWA7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IobWVzc2FnZSk7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZWQuYm9keTtcbiAgfTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsU0FBUyxRQUFRLHlDQUF5QztBQThCbkUsT0FBTyxNQUFNO0VBQ1gsQ0FBQSxVQUFXLEdBQUcsUUFBUTtFQUN0QixDQUFBLFFBQVMsR0FBRyxFQUFFO0VBQ2QsQ0FBQSxNQUFPLENBQVM7RUFFaEIsWUFBWSxNQUFjLENBQUU7SUFDMUIsSUFBSSxDQUFDLENBQUEsTUFBTyxHQUFHO0VBQ2pCO0VBRUE7OztHQUdDLEdBQ0QsS0FBSyxRQUFRLENBQUMsRUFBRTtJQUNkLE9BQU8sSUFBSSxDQUFDLENBQUEsTUFBTyxDQUFDLElBQUksQ0FBQyxDQUFBLFFBQVMsR0FBRyxNQUFNLElBQUk7RUFDakQ7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
// denoCacheMetadata=15943640338487090154,4459804610434554890