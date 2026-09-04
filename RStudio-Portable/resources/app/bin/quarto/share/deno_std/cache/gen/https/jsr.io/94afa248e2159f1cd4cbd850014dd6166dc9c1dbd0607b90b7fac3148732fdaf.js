// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * {@linkcode parse} function for parsing
 * {@link https://code.visualstudio.com/docs/languages/json#_json-with-comments | JSONC}
 * (JSON with Comments) strings.
 *
 * @module
 */ /**
 * Converts a JSON with Comments (JSONC) string into an object.
 * If a syntax error is found, throw a {@linkcode SyntaxError}.
 *
 * @example Usage
 * ```ts
 * import { parse } from "@std/jsonc";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(parse('{"foo": "bar"}'), { foo: "bar" });
 * assertEquals(parse('{"foo": "bar", }'), { foo: "bar" });
 * assertEquals(parse('{"foo": "bar", } /* comment *\/'), { foo: "bar" });
 * assertEquals(parse('{"foo": "bar" } // comment', { allowTrailingComma: false }), { foo: "bar" });
 * ```
 *
 * @param text A valid JSONC string.
 * @returns The parsed JsonValue from the JSONC string.
 */ export function parse(text, { allowTrailingComma = true } = {}) {
  if (new.target) {
    throw new TypeError("parse is not a constructor");
  }
  return new JSONCParser(text, {
    allowTrailingComma
  }).parse();
}
// First tokenize and then parse the token.
class JSONCParser {
  #whitespace = new Set(" \t\r\n");
  #numberEndToken = new Set([
    ..."[]{}:,/",
    ...this.#whitespace
  ]);
  #text;
  #length;
  #tokenized;
  #options;
  constructor(text, options){
    this.#text = `${text}`;
    this.#length = this.#text.length;
    this.#tokenized = this.#tokenize();
    this.#options = options;
  }
  parse() {
    const token = this.#getNext();
    const res = this.#parseJsonValue(token);
    // make sure all characters have been read
    const { done, value } = this.#tokenized.next();
    if (!done) {
      throw new SyntaxError(buildErrorMessage(value));
    }
    return res;
  }
  /** Read the next token. If the token is read to the end, it throws a SyntaxError. */ #getNext() {
    const { done, value } = this.#tokenized.next();
    if (done) {
      throw new SyntaxError("Unexpected end of JSONC input");
    }
    return value;
  }
  /** Split the JSONC string into token units. Whitespace and comments are skipped. */ *#tokenize() {
    for(let i = 0; i < this.#length; i++){
      // skip whitespace
      if (this.#whitespace.has(this.#text[i])) {
        continue;
      }
      // skip multi line comment (`/*...*/`)
      if (this.#text[i] === "/" && this.#text[i + 1] === "*") {
        i += 2;
        let hasEndOfComment = false;
        for(; i < this.#length; i++){
          if (this.#text[i] === "*" && this.#text[i + 1] === "/") {
            hasEndOfComment = true;
            break;
          }
        }
        if (!hasEndOfComment) {
          throw new SyntaxError("Unexpected end of JSONC input");
        }
        i++;
        continue;
      }
      // skip single line comment (`//...`)
      if (this.#text[i] === "/" && this.#text[i + 1] === "/") {
        i += 2;
        for(; i < this.#length; i++){
          if (this.#text[i] === "\n" || this.#text[i] === "\r") {
            break;
          }
        }
        continue;
      }
      switch(this.#text[i]){
        case "{":
          yield {
            type: "BeginObject",
            position: i
          };
          break;
        case "}":
          yield {
            type: "EndObject",
            position: i
          };
          break;
        case "[":
          yield {
            type: "BeginArray",
            position: i
          };
          break;
        case "]":
          yield {
            type: "EndArray",
            position: i
          };
          break;
        case ":":
          yield {
            type: "NameSeparator",
            position: i
          };
          break;
        case ",":
          yield {
            type: "ValueSeparator",
            position: i
          };
          break;
        case '"':
          {
            const startIndex = i;
            // Need to handle consecutive backslashes correctly
            // '"\\""' => '"'
            // '"\\\\"' => '\\'
            // '"\\\\\\""' => '\\"'
            // '"\\\\\\\\"' => '\\\\'
            let shouldEscapeNext = false;
            i++;
            for(; i < this.#length; i++){
              if (this.#text[i] === '"' && !shouldEscapeNext) {
                break;
              }
              shouldEscapeNext = this.#text[i] === "\\" && !shouldEscapeNext;
            }
            yield {
              type: "String",
              sourceText: this.#text.substring(startIndex, i + 1),
              position: startIndex
            };
            break;
          }
        default:
          {
            const startIndex = i;
            for(; i < this.#length; i++){
              if (this.#numberEndToken.has(this.#text[i])) {
                break;
              }
            }
            i--;
            yield {
              type: "NullOrTrueOrFalseOrNumber",
              sourceText: this.#text.substring(startIndex, i + 1),
              position: startIndex
            };
          }
      }
    }
  }
  #parseJsonValue(value) {
    switch(value.type){
      case "BeginObject":
        return this.#parseObject();
      case "BeginArray":
        return this.#parseArray();
      case "NullOrTrueOrFalseOrNumber":
        return this.#parseNullOrTrueOrFalseOrNumber(value);
      case "String":
        return this.#parseString(value);
      default:
        throw new SyntaxError(buildErrorMessage(value));
    }
  }
  #parseObject() {
    const target = {};
    //   ┌─token1
    // { }
    //      ┌─────────────token1
    //      │   ┌─────────token2
    //      │   │   ┌─────token3
    //      │   │   │   ┌─token4
    //  { "key" : value }
    //      ┌───────────────token1
    //      │   ┌───────────token2
    //      │   │   ┌───────token3
    //      │   │   │   ┌───token4
    //      │   │   │   │ ┌─token1
    //  { "key" : value , }
    //      ┌─────────────────────────────token1
    //      │   ┌─────────────────────────token2
    //      │   │   ┌─────────────────────token3
    //      │   │   │   ┌─────────────────token4
    //      │   │   │   │   ┌─────────────token1
    //      │   │   │   │   │   ┌─────────token2
    //      │   │   │   │   │   │   ┌─────token3
    //      │   │   │   │   │   │   │   ┌─token4
    //  { "key" : value , "key" : value }
    for(let isFirst = true;; isFirst = false){
      const token1 = this.#getNext();
      if ((isFirst || this.#options.allowTrailingComma) && token1.type === "EndObject") {
        return target;
      }
      if (token1.type !== "String") {
        throw new SyntaxError(buildErrorMessage(token1));
      }
      const key = this.#parseString(token1);
      const token2 = this.#getNext();
      if (token2.type !== "NameSeparator") {
        throw new SyntaxError(buildErrorMessage(token2));
      }
      const token3 = this.#getNext();
      Object.defineProperty(target, key, {
        value: this.#parseJsonValue(token3),
        writable: true,
        enumerable: true,
        configurable: true
      });
      const token4 = this.#getNext();
      if (token4.type === "EndObject") {
        return target;
      }
      if (token4.type !== "ValueSeparator") {
        throw new SyntaxError(buildErrorMessage(token4));
      }
    }
  }
  #parseArray() {
    const target = [];
    //   ┌─token1
    // [ ]
    //      ┌─────────────token1
    //      │   ┌─────────token2
    //  [ value ]
    //      ┌───────token1
    //      │   ┌───token2
    //      │   │ ┌─token1
    //  [ value , ]
    //      ┌─────────────token1
    //      │   ┌─────────token2
    //      │   │   ┌─────token1
    //      │   │   │   ┌─token2
    //  [ value , value ]
    for(let isFirst = true;; isFirst = false){
      const token1 = this.#getNext();
      if ((isFirst || this.#options.allowTrailingComma) && token1.type === "EndArray") {
        return target;
      }
      target.push(this.#parseJsonValue(token1));
      const token2 = this.#getNext();
      if (token2.type === "EndArray") {
        return target;
      }
      if (token2.type !== "ValueSeparator") {
        throw new SyntaxError(buildErrorMessage(token2));
      }
    }
  }
  #parseString(value) {
    let parsed;
    try {
      // Use JSON.parse to handle `\u0000` etc. correctly.
      parsed = JSON.parse(value.sourceText);
    } catch  {
      throw new SyntaxError(buildErrorMessage(value));
    }
    if (typeof parsed !== "string") {
      throw new TypeError(`Parsed value is not a string: ${parsed}`);
    }
    return parsed;
  }
  #parseNullOrTrueOrFalseOrNumber(value) {
    if (value.sourceText === "null") {
      return null;
    }
    if (value.sourceText === "true") {
      return true;
    }
    if (value.sourceText === "false") {
      return false;
    }
    let parsed;
    try {
      // Use JSON.parse to handle `+100`, `Infinity` etc. correctly.
      parsed = JSON.parse(value.sourceText);
    } catch  {
      throw new SyntaxError(buildErrorMessage(value));
    }
    if (typeof parsed !== "number") {
      throw new TypeError(`Parsed value is not a number: ${parsed}`);
    }
    return parsed;
  }
}
function buildErrorMessage({ type, sourceText, position }) {
  let token = "";
  switch(type){
    case "BeginObject":
      token = "{";
      break;
    case "EndObject":
      token = "}";
      break;
    case "BeginArray":
      token = "[";
      break;
    case "EndArray":
      token = "]";
      break;
    case "NameSeparator":
      token = ":";
      break;
    case "ValueSeparator":
      token = ",";
      break;
    case "NullOrTrueOrFalseOrNumber":
    case "String":
      // Truncate the string so that it is within 30 lengths.
      token = 30 < sourceText.length ? `${sourceText.slice(0, 30)}...` : sourceText;
      break;
  }
  return `Unexpected token ${token} in JSONC at position ${position}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvanNvbmMvMC4yMjQuMy9wYXJzZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIHtAbGlua2NvZGUgcGFyc2V9IGZ1bmN0aW9uIGZvciBwYXJzaW5nXG4gKiB7QGxpbmsgaHR0cHM6Ly9jb2RlLnZpc3VhbHN0dWRpby5jb20vZG9jcy9sYW5ndWFnZXMvanNvbiNfanNvbi13aXRoLWNvbW1lbnRzIHwgSlNPTkN9XG4gKiAoSlNPTiB3aXRoIENvbW1lbnRzKSBzdHJpbmdzLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHR5cGUgeyBKc29uVmFsdWUgfSBmcm9tIFwianNyOi9Ac3RkL2pzb25AXjEuMC4wLXJjLjEvdHlwZXNcIjtcbmV4cG9ydCB0eXBlIHsgSnNvblZhbHVlIH0gZnJvbSBcImpzcjovQHN0ZC9qc29uQF4xLjAuMC1yYy4xL3R5cGVzXCI7XG5cbi8qKiBPcHRpb25zIGZvciB7QGxpbmtjb2RlIHBhcnNlfS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VPcHRpb25zIHtcbiAgLyoqIEFsbG93IHRyYWlsaW5nIGNvbW1hcyBhdCB0aGUgZW5kIG9mIGFycmF5cyBhbmQgb2JqZWN0cy5cbiAgICpcbiAgICogQGRlZmF1bHQge3RydWV9XG4gICAqL1xuICBhbGxvd1RyYWlsaW5nQ29tbWE/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgSlNPTiB3aXRoIENvbW1lbnRzIChKU09OQykgc3RyaW5nIGludG8gYW4gb2JqZWN0LlxuICogSWYgYSBzeW50YXggZXJyb3IgaXMgZm91bmQsIHRocm93IGEge0BsaW5rY29kZSBTeW50YXhFcnJvcn0uXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJAc3RkL2pzb25jXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMocGFyc2UoJ3tcImZvb1wiOiBcImJhclwifScpLCB7IGZvbzogXCJiYXJcIiB9KTtcbiAqIGFzc2VydEVxdWFscyhwYXJzZSgne1wiZm9vXCI6IFwiYmFyXCIsIH0nKSwgeyBmb286IFwiYmFyXCIgfSk7XG4gKiBhc3NlcnRFcXVhbHMocGFyc2UoJ3tcImZvb1wiOiBcImJhclwiLCB9IC8qIGNvbW1lbnQgKlxcLycpLCB7IGZvbzogXCJiYXJcIiB9KTtcbiAqIGFzc2VydEVxdWFscyhwYXJzZSgne1wiZm9vXCI6IFwiYmFyXCIgfSAvLyBjb21tZW50JywgeyBhbGxvd1RyYWlsaW5nQ29tbWE6IGZhbHNlIH0pLCB7IGZvbzogXCJiYXJcIiB9KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB0ZXh0IEEgdmFsaWQgSlNPTkMgc3RyaW5nLlxuICogQHJldHVybnMgVGhlIHBhcnNlZCBKc29uVmFsdWUgZnJvbSB0aGUgSlNPTkMgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UoXG4gIHRleHQ6IHN0cmluZyxcbiAgeyBhbGxvd1RyYWlsaW5nQ29tbWEgPSB0cnVlIH06IFBhcnNlT3B0aW9ucyA9IHt9LFxuKTogSnNvblZhbHVlIHtcbiAgaWYgKG5ldy50YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwicGFyc2UgaXMgbm90IGEgY29uc3RydWN0b3JcIik7XG4gIH1cbiAgcmV0dXJuIG5ldyBKU09OQ1BhcnNlcih0ZXh0LCB7IGFsbG93VHJhaWxpbmdDb21tYSB9KS5wYXJzZSgpO1xufVxuXG50eXBlIFRva2VuVHlwZSA9XG4gIHwgXCJCZWdpbk9iamVjdFwiXG4gIHwgXCJFbmRPYmplY3RcIlxuICB8IFwiQmVnaW5BcnJheVwiXG4gIHwgXCJFbmRBcnJheVwiXG4gIHwgXCJOYW1lU2VwYXJhdG9yXCJcbiAgfCBcIlZhbHVlU2VwYXJhdG9yXCJcbiAgfCBcIk51bGxPclRydWVPckZhbHNlT3JOdW1iZXJcIlxuICB8IFwiU3RyaW5nXCI7XG5cbnR5cGUgVG9rZW4gPSB7XG4gIHR5cGU6IEV4Y2x1ZGU8XG4gICAgVG9rZW5UeXBlLFxuICAgIFwiU3RyaW5nXCIgfCBcIk51bGxPclRydWVPckZhbHNlT3JOdW1iZXJcIlxuICA+O1xuICBzb3VyY2VUZXh0PzogdW5kZWZpbmVkO1xuICBwb3NpdGlvbjogbnVtYmVyO1xufSB8IHtcbiAgdHlwZTogXCJTdHJpbmdcIjtcbiAgc291cmNlVGV4dDogc3RyaW5nO1xuICBwb3NpdGlvbjogbnVtYmVyO1xufSB8IHtcbiAgdHlwZTogXCJOdWxsT3JUcnVlT3JGYWxzZU9yTnVtYmVyXCI7XG4gIHNvdXJjZVRleHQ6IHN0cmluZztcbiAgcG9zaXRpb246IG51bWJlcjtcbn07XG5cbi8vIEZpcnN0IHRva2VuaXplIGFuZCB0aGVuIHBhcnNlIHRoZSB0b2tlbi5cbmNsYXNzIEpTT05DUGFyc2VyIHtcbiAgcmVhZG9ubHkgI3doaXRlc3BhY2UgPSBuZXcgU2V0KFwiIFxcdFxcclxcblwiKTtcbiAgcmVhZG9ubHkgI251bWJlckVuZFRva2VuID0gbmV3IFNldChbLi4uXCJbXXt9OiwvXCIsIC4uLnRoaXMuI3doaXRlc3BhY2VdKTtcbiAgI3RleHQ6IHN0cmluZztcbiAgI2xlbmd0aDogbnVtYmVyO1xuICAjdG9rZW5pemVkOiBHZW5lcmF0b3I8VG9rZW4sIHZvaWQ+O1xuICAjb3B0aW9uczogUGFyc2VPcHRpb25zO1xuICBjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcsIG9wdGlvbnM6IFBhcnNlT3B0aW9ucykge1xuICAgIHRoaXMuI3RleHQgPSBgJHt0ZXh0fWA7XG4gICAgdGhpcy4jbGVuZ3RoID0gdGhpcy4jdGV4dC5sZW5ndGg7XG4gICAgdGhpcy4jdG9rZW5pemVkID0gdGhpcy4jdG9rZW5pemUoKTtcbiAgICB0aGlzLiNvcHRpb25zID0gb3B0aW9ucztcbiAgfVxuICBwYXJzZSgpOiBKc29uVmFsdWUge1xuICAgIGNvbnN0IHRva2VuID0gdGhpcy4jZ2V0TmV4dCgpO1xuICAgIGNvbnN0IHJlcyA9IHRoaXMuI3BhcnNlSnNvblZhbHVlKHRva2VuKTtcblxuICAgIC8vIG1ha2Ugc3VyZSBhbGwgY2hhcmFjdGVycyBoYXZlIGJlZW4gcmVhZFxuICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IHRoaXMuI3Rva2VuaXplZC5uZXh0KCk7XG4gICAgaWYgKCFkb25lKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYnVpbGRFcnJvck1lc3NhZ2UodmFsdWUpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIC8qKiBSZWFkIHRoZSBuZXh0IHRva2VuLiBJZiB0aGUgdG9rZW4gaXMgcmVhZCB0byB0aGUgZW5kLCBpdCB0aHJvd3MgYSBTeW50YXhFcnJvci4gKi9cbiAgI2dldE5leHQoKTogVG9rZW4ge1xuICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IHRoaXMuI3Rva2VuaXplZC5uZXh0KCk7XG4gICAgaWYgKGRvbmUpIHtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcIlVuZXhwZWN0ZWQgZW5kIG9mIEpTT05DIGlucHV0XCIpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgLyoqIFNwbGl0IHRoZSBKU09OQyBzdHJpbmcgaW50byB0b2tlbiB1bml0cy4gV2hpdGVzcGFjZSBhbmQgY29tbWVudHMgYXJlIHNraXBwZWQuICovXG4gICojdG9rZW5pemUoKTogR2VuZXJhdG9yPFRva2VuLCB2b2lkPiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLiNsZW5ndGg7IGkrKykge1xuICAgICAgLy8gc2tpcCB3aGl0ZXNwYWNlXG4gICAgICBpZiAodGhpcy4jd2hpdGVzcGFjZS5oYXModGhpcy4jdGV4dFtpXSEpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBza2lwIG11bHRpIGxpbmUgY29tbWVudCAoYC8qLi4uKi9gKVxuICAgICAgaWYgKHRoaXMuI3RleHRbaV0gPT09IFwiL1wiICYmIHRoaXMuI3RleHRbaSArIDFdID09PSBcIipcIikge1xuICAgICAgICBpICs9IDI7XG4gICAgICAgIGxldCBoYXNFbmRPZkNvbW1lbnQgPSBmYWxzZTtcbiAgICAgICAgZm9yICg7IGkgPCB0aGlzLiNsZW5ndGg7IGkrKykgeyAvLyByZWFkIHVudGlsIGZpbmQgYCovYFxuICAgICAgICAgIGlmICh0aGlzLiN0ZXh0W2ldID09PSBcIipcIiAmJiB0aGlzLiN0ZXh0W2kgKyAxXSA9PT0gXCIvXCIpIHtcbiAgICAgICAgICAgIGhhc0VuZE9mQ29tbWVudCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYXNFbmRPZkNvbW1lbnQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJVbmV4cGVjdGVkIGVuZCBvZiBKU09OQyBpbnB1dFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpKys7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBza2lwIHNpbmdsZSBsaW5lIGNvbW1lbnQgKGAvLy4uLmApXG4gICAgICBpZiAodGhpcy4jdGV4dFtpXSA9PT0gXCIvXCIgJiYgdGhpcy4jdGV4dFtpICsgMV0gPT09IFwiL1wiKSB7XG4gICAgICAgIGkgKz0gMjtcbiAgICAgICAgZm9yICg7IGkgPCB0aGlzLiNsZW5ndGg7IGkrKykgeyAvLyByZWFkIHVudGlsIGZpbmQgYFxcbmAgb3IgYFxccmBcbiAgICAgICAgICBpZiAodGhpcy4jdGV4dFtpXSA9PT0gXCJcXG5cIiB8fCB0aGlzLiN0ZXh0W2ldID09PSBcIlxcclwiKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAodGhpcy4jdGV4dFtpXSkge1xuICAgICAgICBjYXNlIFwie1wiOlxuICAgICAgICAgIHlpZWxkIHsgdHlwZTogXCJCZWdpbk9iamVjdFwiLCBwb3NpdGlvbjogaSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwifVwiOlxuICAgICAgICAgIHlpZWxkIHsgdHlwZTogXCJFbmRPYmplY3RcIiwgcG9zaXRpb246IGkgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIltcIjpcbiAgICAgICAgICB5aWVsZCB7IHR5cGU6IFwiQmVnaW5BcnJheVwiLCBwb3NpdGlvbjogaSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiXVwiOlxuICAgICAgICAgIHlpZWxkIHsgdHlwZTogXCJFbmRBcnJheVwiLCBwb3NpdGlvbjogaSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiOlwiOlxuICAgICAgICAgIHlpZWxkIHsgdHlwZTogXCJOYW1lU2VwYXJhdG9yXCIsIHBvc2l0aW9uOiBpIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCIsXCI6XG4gICAgICAgICAgeWllbGQgeyB0eXBlOiBcIlZhbHVlU2VwYXJhdG9yXCIsIHBvc2l0aW9uOiBpIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1wiJzogeyAvLyBwYXJzZSBzdHJpbmcgdG9rZW5cbiAgICAgICAgICBjb25zdCBzdGFydEluZGV4ID0gaTtcbiAgICAgICAgICAvLyBOZWVkIHRvIGhhbmRsZSBjb25zZWN1dGl2ZSBiYWNrc2xhc2hlcyBjb3JyZWN0bHlcbiAgICAgICAgICAvLyAnXCJcXFxcXCJcIicgPT4gJ1wiJ1xuICAgICAgICAgIC8vICdcIlxcXFxcXFxcXCInID0+ICdcXFxcJ1xuICAgICAgICAgIC8vICdcIlxcXFxcXFxcXFxcXFwiXCInID0+ICdcXFxcXCInXG4gICAgICAgICAgLy8gJ1wiXFxcXFxcXFxcXFxcXFxcXFwiJyA9PiAnXFxcXFxcXFwnXG4gICAgICAgICAgbGV0IHNob3VsZEVzY2FwZU5leHQgPSBmYWxzZTtcbiAgICAgICAgICBpKys7XG4gICAgICAgICAgZm9yICg7IGkgPCB0aGlzLiNsZW5ndGg7IGkrKykgeyAvLyByZWFkIHVudGlsIGZpbmQgYFwiYFxuICAgICAgICAgICAgaWYgKHRoaXMuI3RleHRbaV0gPT09ICdcIicgJiYgIXNob3VsZEVzY2FwZU5leHQpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzaG91bGRFc2NhcGVOZXh0ID0gdGhpcy4jdGV4dFtpXSA9PT0gXCJcXFxcXCIgJiYgIXNob3VsZEVzY2FwZU5leHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIHlpZWxkIHtcbiAgICAgICAgICAgIHR5cGU6IFwiU3RyaW5nXCIsXG4gICAgICAgICAgICBzb3VyY2VUZXh0OiB0aGlzLiN0ZXh0LnN1YnN0cmluZyhzdGFydEluZGV4LCBpICsgMSksXG4gICAgICAgICAgICBwb3NpdGlvbjogc3RhcnRJbmRleCxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHsgLy8gcGFyc2UgbnVsbCwgdHJ1ZSwgZmFsc2Ugb3IgbnVtYmVyIHRva2VuXG4gICAgICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IGk7XG4gICAgICAgICAgZm9yICg7IGkgPCB0aGlzLiNsZW5ndGg7IGkrKykgeyAvLyByZWFkIHVudGlsIGZpbmQgbnVtYmVyRW5kVG9rZW5cbiAgICAgICAgICAgIGlmICh0aGlzLiNudW1iZXJFbmRUb2tlbi5oYXModGhpcy4jdGV4dFtpXSEpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpLS07XG4gICAgICAgICAgeWllbGQge1xuICAgICAgICAgICAgdHlwZTogXCJOdWxsT3JUcnVlT3JGYWxzZU9yTnVtYmVyXCIsXG4gICAgICAgICAgICBzb3VyY2VUZXh0OiB0aGlzLiN0ZXh0LnN1YnN0cmluZyhzdGFydEluZGV4LCBpICsgMSksXG4gICAgICAgICAgICBwb3NpdGlvbjogc3RhcnRJbmRleCxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgI3BhcnNlSnNvblZhbHVlKHZhbHVlOiBUb2tlbik6IEpzb25WYWx1ZSB7XG4gICAgc3dpdGNoICh2YWx1ZS50eXBlKSB7XG4gICAgICBjYXNlIFwiQmVnaW5PYmplY3RcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuI3BhcnNlT2JqZWN0KCk7XG4gICAgICBjYXNlIFwiQmVnaW5BcnJheVwiOlxuICAgICAgICByZXR1cm4gdGhpcy4jcGFyc2VBcnJheSgpO1xuICAgICAgY2FzZSBcIk51bGxPclRydWVPckZhbHNlT3JOdW1iZXJcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuI3BhcnNlTnVsbE9yVHJ1ZU9yRmFsc2VPck51bWJlcih2YWx1ZSk7XG4gICAgICBjYXNlIFwiU3RyaW5nXCI6XG4gICAgICAgIHJldHVybiB0aGlzLiNwYXJzZVN0cmluZyh2YWx1ZSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYnVpbGRFcnJvck1lc3NhZ2UodmFsdWUpKTtcbiAgICB9XG4gIH1cblxuICAjcGFyc2VPYmplY3QoKTogeyBba2V5OiBzdHJpbmddOiBKc29uVmFsdWUgfCB1bmRlZmluZWQgfSB7XG4gICAgY29uc3QgdGFyZ2V0OiB7IFtrZXk6IHN0cmluZ106IEpzb25WYWx1ZSB8IHVuZGVmaW5lZCB9ID0ge307XG4gICAgLy8gICDilIzilIB0b2tlbjFcbiAgICAvLyB7IH1cbiAgICAvLyAgICAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgHRva2VuMVxuICAgIC8vICAgICAg4pSCICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAdG9rZW4yXG4gICAgLy8gICAgICDilIIgICDilIIgICDilIzilIDilIDilIDilIDilIB0b2tlbjNcbiAgICAvLyAgICAgIOKUgiAgIOKUgiAgIOKUgiAgIOKUjOKUgHRva2VuNFxuICAgIC8vICB7IFwia2V5XCIgOiB2YWx1ZSB9XG4gICAgLy8gICAgICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIB0b2tlbjFcbiAgICAvLyAgICAgIOKUgiAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgHRva2VuMlxuICAgIC8vICAgICAg4pSCICAg4pSCICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSAdG9rZW4zXG4gICAgLy8gICAgICDilIIgICDilIIgICDilIIgICDilIzilIDilIDilIB0b2tlbjRcbiAgICAvLyAgICAgIOKUgiAgIOKUgiAgIOKUgiAgIOKUgiDilIzilIB0b2tlbjFcbiAgICAvLyAgeyBcImtleVwiIDogdmFsdWUgLCB9XG4gICAgLy8gICAgICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIB0b2tlbjFcbiAgICAvLyAgICAgIOKUgiAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgHRva2VuMlxuICAgIC8vICAgICAg4pSCICAg4pSCICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAdG9rZW4zXG4gICAgLy8gICAgICDilIIgICDilIIgICDilIIgICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIB0b2tlbjRcbiAgICAvLyAgICAgIOKUgiAgIOKUgiAgIOKUgiAgIOKUgiAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgHRva2VuMVxuICAgIC8vICAgICAg4pSCICAg4pSCICAg4pSCICAg4pSCICAg4pSCICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAdG9rZW4yXG4gICAgLy8gICAgICDilIIgICDilIIgICDilIIgICDilIIgICDilIIgICDilIIgICDilIzilIDilIDilIDilIDilIB0b2tlbjNcbiAgICAvLyAgICAgIOKUgiAgIOKUgiAgIOKUgiAgIOKUgiAgIOKUgiAgIOKUgiAgIOKUgiAgIOKUjOKUgHRva2VuNFxuICAgIC8vICB7IFwia2V5XCIgOiB2YWx1ZSAsIFwia2V5XCIgOiB2YWx1ZSB9XG4gICAgZm9yIChsZXQgaXNGaXJzdCA9IHRydWU7OyBpc0ZpcnN0ID0gZmFsc2UpIHtcbiAgICAgIGNvbnN0IHRva2VuMSA9IHRoaXMuI2dldE5leHQoKTtcbiAgICAgIGlmIChcbiAgICAgICAgKGlzRmlyc3QgfHwgdGhpcy4jb3B0aW9ucy5hbGxvd1RyYWlsaW5nQ29tbWEpICYmXG4gICAgICAgIHRva2VuMS50eXBlID09PSBcIkVuZE9iamVjdFwiXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbjEudHlwZSAhPT0gXCJTdHJpbmdcIikge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYnVpbGRFcnJvck1lc3NhZ2UodG9rZW4xKSk7XG4gICAgICB9XG4gICAgICBjb25zdCBrZXkgPSB0aGlzLiNwYXJzZVN0cmluZyh0b2tlbjEpO1xuXG4gICAgICBjb25zdCB0b2tlbjIgPSB0aGlzLiNnZXROZXh0KCk7XG4gICAgICBpZiAodG9rZW4yLnR5cGUgIT09IFwiTmFtZVNlcGFyYXRvclwiKSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihidWlsZEVycm9yTWVzc2FnZSh0b2tlbjIpKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdG9rZW4zID0gdGhpcy4jZ2V0TmV4dCgpO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB7XG4gICAgICAgIHZhbHVlOiB0aGlzLiNwYXJzZUpzb25WYWx1ZSh0b2tlbjMpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHRva2VuNCA9IHRoaXMuI2dldE5leHQoKTtcbiAgICAgIGlmICh0b2tlbjQudHlwZSA9PT0gXCJFbmRPYmplY3RcIikge1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgfVxuICAgICAgaWYgKHRva2VuNC50eXBlICE9PSBcIlZhbHVlU2VwYXJhdG9yXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGJ1aWxkRXJyb3JNZXNzYWdlKHRva2VuNCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gICNwYXJzZUFycmF5KCk6IEpzb25WYWx1ZVtdIHtcbiAgICBjb25zdCB0YXJnZXQ6IEpzb25WYWx1ZVtdID0gW107XG4gICAgLy8gICDilIzilIB0b2tlbjFcbiAgICAvLyBbIF1cbiAgICAvLyAgICAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgHRva2VuMVxuICAgIC8vICAgICAg4pSCICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAdG9rZW4yXG4gICAgLy8gIFsgdmFsdWUgXVxuICAgIC8vICAgICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSAdG9rZW4xXG4gICAgLy8gICAgICDilIIgICDilIzilIDilIDilIB0b2tlbjJcbiAgICAvLyAgICAgIOKUgiAgIOKUgiDilIzilIB0b2tlbjFcbiAgICAvLyAgWyB2YWx1ZSAsIF1cbiAgICAvLyAgICAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgHRva2VuMVxuICAgIC8vICAgICAg4pSCICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAdG9rZW4yXG4gICAgLy8gICAgICDilIIgICDilIIgICDilIzilIDilIDilIDilIDilIB0b2tlbjFcbiAgICAvLyAgICAgIOKUgiAgIOKUgiAgIOKUgiAgIOKUjOKUgHRva2VuMlxuICAgIC8vICBbIHZhbHVlICwgdmFsdWUgXVxuICAgIGZvciAobGV0IGlzRmlyc3QgPSB0cnVlOzsgaXNGaXJzdCA9IGZhbHNlKSB7XG4gICAgICBjb25zdCB0b2tlbjEgPSB0aGlzLiNnZXROZXh0KCk7XG4gICAgICBpZiAoXG4gICAgICAgIChpc0ZpcnN0IHx8IHRoaXMuI29wdGlvbnMuYWxsb3dUcmFpbGluZ0NvbW1hKSAmJlxuICAgICAgICB0b2tlbjEudHlwZSA9PT0gXCJFbmRBcnJheVwiXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgIH1cbiAgICAgIHRhcmdldC5wdXNoKHRoaXMuI3BhcnNlSnNvblZhbHVlKHRva2VuMSkpO1xuXG4gICAgICBjb25zdCB0b2tlbjIgPSB0aGlzLiNnZXROZXh0KCk7XG4gICAgICBpZiAodG9rZW4yLnR5cGUgPT09IFwiRW5kQXJyYXlcIikge1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgfVxuICAgICAgaWYgKHRva2VuMi50eXBlICE9PSBcIlZhbHVlU2VwYXJhdG9yXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGJ1aWxkRXJyb3JNZXNzYWdlKHRva2VuMikpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gICNwYXJzZVN0cmluZyh2YWx1ZToge1xuICAgIHR5cGU6IFwiU3RyaW5nXCI7XG4gICAgc291cmNlVGV4dDogc3RyaW5nO1xuICAgIHBvc2l0aW9uOiBudW1iZXI7XG4gIH0pOiBzdHJpbmcge1xuICAgIGxldCBwYXJzZWQ7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFVzZSBKU09OLnBhcnNlIHRvIGhhbmRsZSBgXFx1MDAwMGAgZXRjLiBjb3JyZWN0bHkuXG4gICAgICBwYXJzZWQgPSBKU09OLnBhcnNlKHZhbHVlLnNvdXJjZVRleHQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGJ1aWxkRXJyb3JNZXNzYWdlKHZhbHVlKSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcGFyc2VkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBQYXJzZWQgdmFsdWUgaXMgbm90IGEgc3RyaW5nOiAke3BhcnNlZH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlZDtcbiAgfVxuXG4gICNwYXJzZU51bGxPclRydWVPckZhbHNlT3JOdW1iZXIodmFsdWU6IHtcbiAgICB0eXBlOiBcIk51bGxPclRydWVPckZhbHNlT3JOdW1iZXJcIjtcbiAgICBzb3VyY2VUZXh0OiBzdHJpbmc7XG4gICAgcG9zaXRpb246IG51bWJlcjtcbiAgfSk6IG51bGwgfCBib29sZWFuIHwgbnVtYmVyIHtcbiAgICBpZiAodmFsdWUuc291cmNlVGV4dCA9PT0gXCJudWxsXCIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAodmFsdWUuc291cmNlVGV4dCA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAodmFsdWUuc291cmNlVGV4dCA9PT0gXCJmYWxzZVwiKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGxldCBwYXJzZWQ7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFVzZSBKU09OLnBhcnNlIHRvIGhhbmRsZSBgKzEwMGAsIGBJbmZpbml0eWAgZXRjLiBjb3JyZWN0bHkuXG4gICAgICBwYXJzZWQgPSBKU09OLnBhcnNlKHZhbHVlLnNvdXJjZVRleHQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGJ1aWxkRXJyb3JNZXNzYWdlKHZhbHVlKSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcGFyc2VkICE9PSBcIm51bWJlclwiKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBQYXJzZWQgdmFsdWUgaXMgbm90IGEgbnVtYmVyOiAke3BhcnNlZH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlZDtcbiAgfVxufVxuXG5mdW5jdGlvbiBidWlsZEVycm9yTWVzc2FnZSh7IHR5cGUsIHNvdXJjZVRleHQsIHBvc2l0aW9uIH06IFRva2VuKTogc3RyaW5nIHtcbiAgbGV0IHRva2VuID0gXCJcIjtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBcIkJlZ2luT2JqZWN0XCI6XG4gICAgICB0b2tlbiA9IFwie1wiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIkVuZE9iamVjdFwiOlxuICAgICAgdG9rZW4gPSBcIn1cIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJCZWdpbkFycmF5XCI6XG4gICAgICB0b2tlbiA9IFwiW1wiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIkVuZEFycmF5XCI6XG4gICAgICB0b2tlbiA9IFwiXVwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIk5hbWVTZXBhcmF0b3JcIjpcbiAgICAgIHRva2VuID0gXCI6XCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiVmFsdWVTZXBhcmF0b3JcIjpcbiAgICAgIHRva2VuID0gXCIsXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiTnVsbE9yVHJ1ZU9yRmFsc2VPck51bWJlclwiOlxuICAgIGNhc2UgXCJTdHJpbmdcIjpcbiAgICAgIC8vIFRydW5jYXRlIHRoZSBzdHJpbmcgc28gdGhhdCBpdCBpcyB3aXRoaW4gMzAgbGVuZ3Rocy5cbiAgICAgIHRva2VuID0gMzAgPCBzb3VyY2VUZXh0Lmxlbmd0aFxuICAgICAgICA/IGAke3NvdXJjZVRleHQuc2xpY2UoMCwgMzApfS4uLmBcbiAgICAgICAgOiBzb3VyY2VUZXh0O1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGBVbmV4cGVjdGVkIHRva2VuICR7dG9rZW59IGluIEpTT05DIGF0IHBvc2l0aW9uICR7cG9zaXRp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
// denoCacheMetadata=4121774533509654750,9075056291830629809