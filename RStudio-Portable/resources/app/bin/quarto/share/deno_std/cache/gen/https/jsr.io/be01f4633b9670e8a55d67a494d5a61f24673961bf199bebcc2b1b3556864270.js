// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { AMPERSAND, ASTERISK, BACKSLASH, CARRIAGE_RETURN, COLON, COMMA, COMMERCIAL_AT, DOT, DOUBLE_QUOTE, EXCLAMATION, GRAVE_ACCENT, GREATER_THAN, isEOL, isFlowIndicator, isWhiteSpace, isWhiteSpaceOrEOL, LEFT_CURLY_BRACKET, LEFT_SQUARE_BRACKET, LINE_FEED, MINUS, PERCENT, PLUS, QUESTION, RIGHT_CURLY_BRACKET, RIGHT_SQUARE_BRACKET, SHARP, SINGLE_QUOTE, SMALLER_THAN, SPACE, VERTICAL_LINE } from "./_chars.ts";
import { DEFAULT_SCHEMA } from "./_schema.ts";
import { isObject, isPlainObject } from "./_utils.ts";
const CONTEXT_FLOW_IN = 1;
const CONTEXT_FLOW_OUT = 2;
const CONTEXT_BLOCK_IN = 3;
const CONTEXT_BLOCK_OUT = 4;
const CHOMPING_CLIP = 1;
const CHOMPING_STRIP = 2;
const CHOMPING_KEEP = 3;
const PATTERN_NON_PRINTABLE = // deno-lint-ignore no-control-regex
/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
const PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
const PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
const PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
const PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
const ESCAPED_HEX_LENGTHS = new Map([
  [
    0x78,
    2
  ],
  [
    0x75,
    4
  ],
  [
    0x55,
    8
  ]
]);
const SIMPLE_ESCAPE_SEQUENCES = new Map([
  [
    0x30,
    "\x00"
  ],
  [
    0x61,
    "\x07"
  ],
  [
    0x62,
    "\x08"
  ],
  [
    0x74,
    "\x09"
  ],
  [
    0x09,
    "\x09"
  ],
  [
    0x6e,
    "\x0A"
  ],
  [
    0x76,
    "\x0B"
  ],
  [
    0x66,
    "\x0C"
  ],
  [
    0x72,
    "\x0D"
  ],
  [
    0x65,
    "\x1B"
  ],
  [
    0x20,
    " "
  ],
  [
    0x22,
    '"'
  ],
  [
    0x2f,
    "/"
  ],
  [
    0x5c,
    "\\"
  ],
  [
    0x4e,
    "\x85"
  ],
  [
    0x5f,
    "\xA0"
  ],
  [
    0x4c,
    "\u2028"
  ],
  [
    0x50,
    "\u2029"
  ]
]);
/**
 * Converts a hexadecimal character code to its decimal value.
 */ function hexCharCodeToNumber(charCode) {
  // Check if the character code is in the range for '0' to '9'
  if (0x30 <= charCode && charCode <= 0x39) return charCode - 0x30; // Convert '0'-'9' to 0-9
  // Normalize the character code to lowercase if it's a letter
  const lc = charCode | 0x20;
  // Check if the character code is in the range for 'a' to 'f'
  if (0x61 <= lc && lc <= 0x66) return lc - 0x61 + 10; // Convert 'a'-'f' to 10-15
  return -1;
}
/**
 * Converts a decimal character code to its decimal value.
 */ function decimalCharCodeToNumber(charCode) {
  // Check if the character code is in the range for '0' to '9'
  if (0x30 <= charCode && charCode <= 0x39) return charCode - 0x30; // Convert '0'-'9' to 0-9
  return -1;
}
/**
 * Converts a Unicode code point to a string.
 */ function codepointToChar(codepoint) {
  // Check if the code point is within the Basic Multilingual Plane (BMP)
  if (codepoint <= 0xffff) return String.fromCharCode(codepoint); // Convert BMP code point to character
  // Encode UTF-16 surrogate pair for code points beyond BMP
  // Reference: https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode((codepoint - 0x010000 >> 10) + 0xd800, (codepoint - 0x010000 & 0x03ff) + 0xdc00);
}
const INDENT = 4;
const MAX_LENGTH = 75;
const DELIMITERS = "\x00\r\n\x85\u2028\u2029";
function getSnippet(buffer, position) {
  if (!buffer) return null;
  let start = position;
  let end = position;
  let head = "";
  let tail = "";
  while(start > 0 && !DELIMITERS.includes(buffer.charAt(start - 1))){
    start--;
    if (position - start > MAX_LENGTH / 2 - 1) {
      head = " ... ";
      start += 5;
      break;
    }
  }
  while(end < buffer.length && !DELIMITERS.includes(buffer.charAt(end))){
    end++;
    if (end - position > MAX_LENGTH / 2 - 1) {
      tail = " ... ";
      end -= 5;
      break;
    }
  }
  const snippet = buffer.slice(start, end);
  const indent = " ".repeat(INDENT);
  const caretIndent = " ".repeat(INDENT + position - start + head.length);
  return `${indent + head + snippet + tail}\n${caretIndent}^`;
}
function markToString(buffer, position, line, column) {
  let where = `at line ${line + 1}, column ${column + 1}`;
  const snippet = getSnippet(buffer, position);
  if (snippet) where += `:\n${snippet}`;
  return where;
}
export class LoaderState {
  input;
  length;
  lineIndent = 0;
  lineStart = 0;
  position = 0;
  line = 0;
  onWarning;
  allowDuplicateKeys;
  implicitTypes;
  typeMap;
  version;
  checkLineBreaks = false;
  tagMap = new Map();
  anchorMap = new Map();
  tag;
  anchor;
  kind;
  result = "";
  constructor(input, { schema = DEFAULT_SCHEMA, onWarning, allowDuplicateKeys = false }){
    this.input = input;
    this.onWarning = onWarning;
    this.allowDuplicateKeys = allowDuplicateKeys;
    this.implicitTypes = schema.implicitTypes;
    this.typeMap = schema.typeMap;
    this.length = input.length;
    this.version = null;
    this.readIndent();
  }
  readIndent() {
    let char = this.peek();
    while(char === SPACE){
      this.lineIndent += 1;
      char = this.next();
    }
  }
  peek(offset = 0) {
    return this.input.charCodeAt(this.position + offset);
  }
  next() {
    this.position += 1;
    return this.peek();
  }
  #createError(message) {
    const mark = markToString(this.input, this.position, this.line, this.position - this.lineStart);
    return new SyntaxError(`${message} ${mark}`);
  }
  throwError(message) {
    throw this.#createError(message);
  }
  dispatchWarning(message) {
    const error = this.#createError(message);
    this.onWarning?.(error);
  }
  yamlDirectiveHandler(...args) {
    if (this.version !== null) {
      return this.throwError("Cannot handle YAML directive: duplication of %YAML directive");
    }
    if (args.length !== 1) {
      return this.throwError("Cannot handle YAML directive: YAML directive accepts exactly one argument");
    }
    const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      return this.throwError("Cannot handle YAML directive: ill-formed argument");
    }
    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10);
    if (major !== 1) {
      return this.throwError("Cannot handle YAML directive: unacceptable YAML version");
    }
    this.version = args[0] ?? null;
    this.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      return this.dispatchWarning("Cannot handle YAML directive: unsupported YAML version");
    }
  }
  tagDirectiveHandler(...args) {
    if (args.length !== 2) {
      return this.throwError(`Cannot handle tag directive: directive accepts exactly two arguments, received ${args.length}`);
    }
    const handle = args[0];
    const prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      return this.throwError(`Cannot handle tag directive: ill-formed handle (first argument) in "${handle}"`);
    }
    if (this.tagMap.has(handle)) {
      return this.throwError(`Cannot handle tag directive: previously declared suffix for "${handle}" tag handle`);
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      return this.throwError("Cannot handle tag directive: ill-formed tag prefix (second argument) of the TAG directive");
    }
    this.tagMap.set(handle, prefix);
  }
  captureSegment(start, end, checkJson) {
    let result;
    if (start < end) {
      result = this.input.slice(start, end);
      if (checkJson) {
        for(let position = 0; position < result.length; position++){
          const character = result.charCodeAt(position);
          if (!(character === 0x09 || 0x20 <= character && character <= 0x10ffff)) {
            return this.throwError(`Expected valid JSON character: received "${character}"`);
          }
        }
      } else if (PATTERN_NON_PRINTABLE.test(result)) {
        return this.throwError("Stream contains non-printable characters");
      }
      this.result += result;
    }
  }
  readBlockSequence(nodeIndent) {
    let line;
    let following;
    let detected = false;
    let ch;
    const tag = this.tag;
    const anchor = this.anchor;
    const result = [];
    if (this.anchor !== null && typeof this.anchor !== "undefined") {
      this.anchorMap.set(this.anchor, result);
    }
    ch = this.peek();
    while(ch !== 0){
      if (ch !== MINUS) {
        break;
      }
      following = this.peek(1);
      if (!isWhiteSpaceOrEOL(following)) {
        break;
      }
      detected = true;
      this.position++;
      if (this.skipSeparationSpace(true, -1)) {
        if (this.lineIndent <= nodeIndent) {
          result.push(null);
          ch = this.peek();
          continue;
        }
      }
      line = this.line;
      this.composeNode(nodeIndent, CONTEXT_BLOCK_IN, false, true);
      result.push(this.result);
      this.skipSeparationSpace(true, -1);
      ch = this.peek();
      if ((this.line === line || this.lineIndent > nodeIndent) && ch !== 0) {
        return this.throwError("Cannot read block sequence: bad indentation of a sequence entry");
      } else if (this.lineIndent < nodeIndent) {
        break;
      }
    }
    if (detected) {
      this.tag = tag;
      this.anchor = anchor;
      this.kind = "sequence";
      this.result = result;
      return true;
    }
    return false;
  }
  mergeMappings(destination, source, overridableKeys) {
    if (!isObject(source)) {
      return this.throwError("Cannot merge mappings: the provided source object is unacceptable");
    }
    for (const [key, value] of Object.entries(source)){
      if (Object.hasOwn(destination, key)) continue;
      Object.defineProperty(destination, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true
      });
      overridableKeys.add(key);
    }
  }
  storeMappingPair(result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
    // The output is a plain object here, so keys can only be strings.
    // We need to convert keyNode to a string, but doing so can hang the process
    // (deeply nested arrays that explode exponentially using aliases).
    if (Array.isArray(keyNode)) {
      keyNode = Array.prototype.slice.call(keyNode);
      for(let index = 0; index < keyNode.length; index++){
        if (Array.isArray(keyNode[index])) {
          return this.throwError("Cannot store mapping pair: nested arrays are not supported inside keys");
        }
        if (typeof keyNode === "object" && isPlainObject(keyNode[index])) {
          keyNode[index] = "[object Object]";
        }
      }
    }
    // Avoid code execution in load() via toString property
    // (still use its own toString for arrays, timestamps,
    // and whatever user schema extensions happen to have @@toStringTag)
    if (typeof keyNode === "object" && isPlainObject(keyNode)) {
      keyNode = "[object Object]";
    }
    keyNode = String(keyNode);
    if (keyTag === "tag:yaml.org,2002:merge") {
      if (Array.isArray(valueNode)) {
        for(let index = 0; index < valueNode.length; index++){
          this.mergeMappings(result, valueNode[index], overridableKeys);
        }
      } else {
        this.mergeMappings(result, valueNode, overridableKeys);
      }
    } else {
      if (!this.allowDuplicateKeys && !overridableKeys.has(keyNode) && Object.hasOwn(result, keyNode)) {
        this.line = startLine || this.line;
        this.position = startPos || this.position;
        return this.throwError("Cannot store mapping pair: duplicated key");
      }
      Object.defineProperty(result, keyNode, {
        value: valueNode,
        writable: true,
        enumerable: true,
        configurable: true
      });
      overridableKeys.delete(keyNode);
    }
    return result;
  }
  readLineBreak() {
    const ch = this.peek();
    if (ch === LINE_FEED) {
      this.position++;
    } else if (ch === CARRIAGE_RETURN) {
      this.position++;
      if (this.peek() === LINE_FEED) {
        this.position++;
      }
    } else {
      return this.throwError("Cannot read line: line break not found");
    }
    this.line += 1;
    this.lineStart = this.position;
  }
  skipSeparationSpace(allowComments, checkIndent) {
    let lineBreaks = 0;
    let ch = this.peek();
    while(ch !== 0){
      while(isWhiteSpace(ch)){
        ch = this.next();
      }
      if (allowComments && ch === SHARP) {
        do {
          ch = this.next();
        }while (ch !== LINE_FEED && ch !== CARRIAGE_RETURN && ch !== 0)
      }
      if (isEOL(ch)) {
        this.readLineBreak();
        ch = this.peek();
        lineBreaks++;
        this.lineIndent = 0;
        this.readIndent();
        ch = this.peek();
      } else {
        break;
      }
    }
    if (checkIndent !== -1 && lineBreaks !== 0 && this.lineIndent < checkIndent) {
      this.dispatchWarning("deficient indentation");
    }
    return lineBreaks;
  }
  testDocumentSeparator() {
    let ch = this.peek();
    // Condition this.position === this.lineStart is tested
    // in parent on each call, for efficiency. No needs to test here again.
    if ((ch === MINUS || ch === DOT) && ch === this.peek(1) && ch === this.peek(2)) {
      ch = this.peek(3);
      if (ch === 0 || isWhiteSpaceOrEOL(ch)) {
        return true;
      }
    }
    return false;
  }
  writeFoldedLines(count) {
    if (count === 1) {
      this.result += " ";
    } else if (count > 1) {
      this.result += "\n".repeat(count - 1);
    }
  }
  readPlainScalar(nodeIndent, withinFlowCollection) {
    const kind = this.kind;
    const result = this.result;
    let ch = this.peek();
    if (isWhiteSpaceOrEOL(ch) || isFlowIndicator(ch) || ch === SHARP || ch === AMPERSAND || ch === ASTERISK || ch === EXCLAMATION || ch === VERTICAL_LINE || ch === GREATER_THAN || ch === SINGLE_QUOTE || ch === DOUBLE_QUOTE || ch === PERCENT || ch === COMMERCIAL_AT || ch === GRAVE_ACCENT) {
      return false;
    }
    let following;
    if (ch === QUESTION || ch === MINUS) {
      following = this.peek(1);
      if (isWhiteSpaceOrEOL(following) || withinFlowCollection && isFlowIndicator(following)) {
        return false;
      }
    }
    this.kind = "scalar";
    this.result = "";
    let captureEnd = this.position;
    let captureStart = this.position;
    let hasPendingContent = false;
    let line = 0;
    while(ch !== 0){
      if (ch === COLON) {
        following = this.peek(1);
        if (isWhiteSpaceOrEOL(following) || withinFlowCollection && isFlowIndicator(following)) {
          break;
        }
      } else if (ch === SHARP) {
        const preceding = this.peek(-1);
        if (isWhiteSpaceOrEOL(preceding)) {
          break;
        }
      } else if (this.position === this.lineStart && this.testDocumentSeparator() || withinFlowCollection && isFlowIndicator(ch)) {
        break;
      } else if (isEOL(ch)) {
        line = this.line;
        const lineStart = this.lineStart;
        const lineIndent = this.lineIndent;
        this.skipSeparationSpace(false, -1);
        if (this.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = this.peek();
          continue;
        } else {
          this.position = captureEnd;
          this.line = line;
          this.lineStart = lineStart;
          this.lineIndent = lineIndent;
          break;
        }
      }
      if (hasPendingContent) {
        this.captureSegment(captureStart, captureEnd, false);
        this.writeFoldedLines(this.line - line);
        captureStart = captureEnd = this.position;
        hasPendingContent = false;
      }
      if (!isWhiteSpace(ch)) {
        captureEnd = this.position + 1;
      }
      ch = this.next();
    }
    this.captureSegment(captureStart, captureEnd, false);
    if (this.result) {
      return true;
    }
    this.kind = kind;
    this.result = result;
    return false;
  }
  readSingleQuotedScalar(nodeIndent) {
    let ch;
    let captureStart;
    let captureEnd;
    ch = this.peek();
    if (ch !== SINGLE_QUOTE) {
      return false;
    }
    this.kind = "scalar";
    this.result = "";
    this.position++;
    captureStart = captureEnd = this.position;
    while((ch = this.peek()) !== 0){
      if (ch === SINGLE_QUOTE) {
        this.captureSegment(captureStart, this.position, true);
        ch = this.next();
        if (ch === SINGLE_QUOTE) {
          captureStart = this.position;
          this.position++;
          captureEnd = this.position;
        } else {
          return true;
        }
      } else if (isEOL(ch)) {
        this.captureSegment(captureStart, captureEnd, true);
        this.writeFoldedLines(this.skipSeparationSpace(false, nodeIndent));
        captureStart = captureEnd = this.position;
      } else if (this.position === this.lineStart && this.testDocumentSeparator()) {
        return this.throwError("Unexpected end of the document within a single quoted scalar");
      } else {
        this.position++;
        captureEnd = this.position;
      }
    }
    return this.throwError("Unexpected end of the stream within a single quoted scalar");
  }
  readDoubleQuotedScalar(nodeIndent) {
    let ch = this.peek();
    if (ch !== DOUBLE_QUOTE) {
      return false;
    }
    this.kind = "scalar";
    this.result = "";
    this.position++;
    let captureEnd = this.position;
    let captureStart = this.position;
    let tmp;
    while((ch = this.peek()) !== 0){
      if (ch === DOUBLE_QUOTE) {
        this.captureSegment(captureStart, this.position, true);
        this.position++;
        return true;
      }
      if (ch === BACKSLASH) {
        this.captureSegment(captureStart, this.position, true);
        ch = this.next();
        if (isEOL(ch)) {
          this.skipSeparationSpace(false, nodeIndent);
        } else if (ch < 256 && SIMPLE_ESCAPE_SEQUENCES.has(ch)) {
          this.result += SIMPLE_ESCAPE_SEQUENCES.get(ch);
          this.position++;
        } else if ((tmp = ESCAPED_HEX_LENGTHS.get(ch) ?? 0) > 0) {
          let hexLength = tmp;
          let hexResult = 0;
          for(; hexLength > 0; hexLength--){
            ch = this.next();
            if ((tmp = hexCharCodeToNumber(ch)) >= 0) {
              hexResult = (hexResult << 4) + tmp;
            } else {
              return this.throwError("Cannot read double quoted scalar: expected hexadecimal character");
            }
          }
          this.result += codepointToChar(hexResult);
          this.position++;
        } else {
          return this.throwError("Cannot read double quoted scalar: unknown escape sequence");
        }
        captureStart = captureEnd = this.position;
      } else if (isEOL(ch)) {
        this.captureSegment(captureStart, captureEnd, true);
        this.writeFoldedLines(this.skipSeparationSpace(false, nodeIndent));
        captureStart = captureEnd = this.position;
      } else if (this.position === this.lineStart && this.testDocumentSeparator()) {
        return this.throwError("Unexpected end of the document within a double quoted scalar");
      } else {
        this.position++;
        captureEnd = this.position;
      }
    }
    return this.throwError("Unexpected end of the stream within a double quoted scalar");
  }
  readFlowCollection(nodeIndent) {
    let ch = this.peek();
    let terminator;
    let isMapping = true;
    let result = {};
    if (ch === LEFT_SQUARE_BRACKET) {
      terminator = RIGHT_SQUARE_BRACKET;
      isMapping = false;
      result = [];
    } else if (ch === LEFT_CURLY_BRACKET) {
      terminator = RIGHT_CURLY_BRACKET;
    } else {
      return false;
    }
    if (this.anchor !== null && typeof this.anchor !== "undefined") {
      this.anchorMap.set(this.anchor, result);
    }
    ch = this.next();
    const tag = this.tag;
    const anchor = this.anchor;
    let readNext = true;
    let valueNode = null;
    let keyNode = null;
    let keyTag = null;
    let isExplicitPair = false;
    let isPair = false;
    let following = 0;
    let line = 0;
    const overridableKeys = new Set();
    while(ch !== 0){
      this.skipSeparationSpace(true, nodeIndent);
      ch = this.peek();
      if (ch === terminator) {
        this.position++;
        this.tag = tag;
        this.anchor = anchor;
        this.kind = isMapping ? "mapping" : "sequence";
        this.result = result;
        return true;
      }
      if (!readNext) {
        return this.throwError("Cannot read flow collection: missing comma between flow collection entries");
      }
      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;
      if (ch === QUESTION) {
        following = this.peek(1);
        if (isWhiteSpaceOrEOL(following)) {
          isPair = isExplicitPair = true;
          this.position++;
          this.skipSeparationSpace(true, nodeIndent);
        }
      }
      line = this.line;
      this.composeNode(nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = this.tag || null;
      keyNode = this.result;
      this.skipSeparationSpace(true, nodeIndent);
      ch = this.peek();
      if ((isExplicitPair || this.line === line) && ch === COLON) {
        isPair = true;
        ch = this.next();
        this.skipSeparationSpace(true, nodeIndent);
        this.composeNode(nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = this.result;
      }
      if (isMapping) {
        this.storeMappingPair(result, overridableKeys, keyTag, keyNode, valueNode);
      } else if (isPair) {
        result.push(this.storeMappingPair({}, overridableKeys, keyTag, keyNode, valueNode));
      } else {
        result.push(keyNode);
      }
      this.skipSeparationSpace(true, nodeIndent);
      ch = this.peek();
      if (ch === COMMA) {
        readNext = true;
        ch = this.next();
      } else {
        readNext = false;
      }
    }
    return this.throwError("Cannot read flow collection: unexpected end of the stream within a flow collection");
  }
  // Handles block scaler styles: e.g. '|', '>', '|-' and '>-'.
  // https://yaml.org/spec/1.2.2/#81-block-scalar-styles
  readBlockScalar(nodeIndent) {
    let chomping = CHOMPING_CLIP;
    let didReadContent = false;
    let detectedIndent = false;
    let textIndent = nodeIndent;
    let emptyLines = 0;
    let atMoreIndented = false;
    let ch = this.peek();
    let folding = false;
    if (ch === VERTICAL_LINE) {
      folding = false;
    } else if (ch === GREATER_THAN) {
      folding = true;
    } else {
      return false;
    }
    this.kind = "scalar";
    this.result = "";
    let tmp = 0;
    while(ch !== 0){
      ch = this.next();
      if (ch === PLUS || ch === MINUS) {
        if (CHOMPING_CLIP === chomping) {
          chomping = ch === PLUS ? CHOMPING_KEEP : CHOMPING_STRIP;
        } else {
          return this.throwError("Cannot read block: chomping mode identifier repeated");
        }
      } else if ((tmp = decimalCharCodeToNumber(ch)) >= 0) {
        if (tmp === 0) {
          return this.throwError("Cannot read block: indentation width must be greater than 0");
        } else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else {
          return this.throwError("Cannot read block: indentation width identifier repeated");
        }
      } else {
        break;
      }
    }
    if (isWhiteSpace(ch)) {
      do {
        ch = this.next();
      }while (isWhiteSpace(ch))
      if (ch === SHARP) {
        do {
          ch = this.next();
        }while (!isEOL(ch) && ch !== 0)
      }
    }
    while(ch !== 0){
      this.readLineBreak();
      this.lineIndent = 0;
      ch = this.peek();
      while((!detectedIndent || this.lineIndent < textIndent) && ch === SPACE){
        this.lineIndent++;
        ch = this.next();
      }
      if (!detectedIndent && this.lineIndent > textIndent) {
        textIndent = this.lineIndent;
      }
      if (isEOL(ch)) {
        emptyLines++;
        continue;
      }
      // End of the scalar.
      if (this.lineIndent < textIndent) {
        // Perform the chomping.
        if (chomping === CHOMPING_KEEP) {
          this.result += "\n".repeat(didReadContent ? 1 + emptyLines : emptyLines);
        } else if (chomping === CHOMPING_CLIP) {
          if (didReadContent) {
            // i.e. only if the scalar is not empty.
            this.result += "\n";
          }
        }
        break;
      }
      // Folded style: use fancy rules to handle line breaks.
      if (folding) {
        // Lines starting with white space characters (more-indented lines) are not folded.
        if (isWhiteSpace(ch)) {
          atMoreIndented = true;
          // except for the first content line (cf. Example 8.1)
          this.result += "\n".repeat(didReadContent ? 1 + emptyLines : emptyLines);
        // End of more-indented block.
        } else if (atMoreIndented) {
          atMoreIndented = false;
          this.result += "\n".repeat(emptyLines + 1);
        // Just one line break - perceive as the same line.
        } else if (emptyLines === 0) {
          if (didReadContent) {
            // i.e. only if we have already read some scalar content.
            this.result += " ";
          }
        // Several line breaks - perceive as different lines.
        } else {
          this.result += "\n".repeat(emptyLines);
        }
      // Literal style: just add exact number of line breaks between content lines.
      } else {
        // Keep all line breaks except the header line break.
        this.result += "\n".repeat(didReadContent ? 1 + emptyLines : emptyLines);
      }
      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      const captureStart = this.position;
      while(!isEOL(ch) && ch !== 0){
        ch = this.next();
      }
      this.captureSegment(captureStart, this.position, false);
    }
    return true;
  }
  readBlockMapping(nodeIndent, flowIndent) {
    const tag = this.tag;
    const anchor = this.anchor;
    const result = {};
    const overridableKeys = new Set();
    let following;
    let allowCompact = false;
    let line;
    let pos;
    let keyTag = null;
    let keyNode = null;
    let valueNode = null;
    let atExplicitKey = false;
    let detected = false;
    let ch;
    if (this.anchor !== null && typeof this.anchor !== "undefined") {
      this.anchorMap.set(this.anchor, result);
    }
    ch = this.peek();
    while(ch !== 0){
      following = this.peek(1);
      line = this.line; // Save the current line.
      pos = this.position;
      //
      // Explicit notation case. There are two separate blocks:
      // first for the key (denoted by "?") and second for the value (denoted by ":")
      //
      if ((ch === QUESTION || ch === COLON) && isWhiteSpaceOrEOL(following)) {
        if (ch === QUESTION) {
          if (atExplicitKey) {
            this.storeMappingPair(result, overridableKeys, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = true;
          allowCompact = true;
        } else if (atExplicitKey) {
          // i.e. 0x3A/* : */ === character after the explicit key.
          atExplicitKey = false;
          allowCompact = true;
        } else {
          return this.throwError("Cannot read block as explicit mapping pair is incomplete: a key node is missed or followed by a non-tabulated empty line");
        }
        this.position += 1;
        ch = following;
      //
      // Implicit notation case. Flow-style node as the key first, then ":", and the value.
      //
      } else if (this.composeNode(flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        if (this.line === line) {
          ch = this.peek();
          while(isWhiteSpace(ch)){
            ch = this.next();
          }
          if (ch === COLON) {
            ch = this.next();
            if (!isWhiteSpaceOrEOL(ch)) {
              return this.throwError("Cannot read block: a whitespace character is expected after the key-value separator within a block mapping");
            }
            if (atExplicitKey) {
              this.storeMappingPair(result, overridableKeys, keyTag, keyNode, null);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = this.tag;
            keyNode = this.result;
          } else if (detected) {
            return this.throwError("Cannot read an implicit mapping pair: missing colon");
          } else {
            this.tag = tag;
            this.anchor = anchor;
            return true; // Keep the result of `composeNode`.
          }
        } else if (detected) {
          return this.throwError("Cannot read a block mapping entry: a multiline key may not be an implicit key");
        } else {
          this.tag = tag;
          this.anchor = anchor;
          return true; // Keep the result of `composeNode`.
        }
      } else {
        break; // Reading is done. Go to the epilogue.
      }
      //
      // Common reading code for both explicit and implicit notations.
      //
      if (this.line === line || this.lineIndent > nodeIndent) {
        if (this.composeNode(nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
          if (atExplicitKey) {
            keyNode = this.result;
          } else {
            valueNode = this.result;
          }
        }
        if (!atExplicitKey) {
          this.storeMappingPair(result, overridableKeys, keyTag, keyNode, valueNode, line, pos);
          keyTag = keyNode = valueNode = null;
        }
        this.skipSeparationSpace(true, -1);
        ch = this.peek();
      }
      if (this.lineIndent > nodeIndent && ch !== 0) {
        return this.throwError("Cannot read block: bad indentation of a mapping entry");
      } else if (this.lineIndent < nodeIndent) {
        break;
      }
    }
    //
    // Epilogue.
    //
    // Special case: last mapping's node contains only the key in explicit notation.
    if (atExplicitKey) {
      this.storeMappingPair(result, overridableKeys, keyTag, keyNode, null);
    }
    // Expose the resulting mapping.
    if (detected) {
      this.tag = tag;
      this.anchor = anchor;
      this.kind = "mapping";
      this.result = result;
    }
    return detected;
  }
  readTagProperty() {
    let position;
    let isVerbatim = false;
    let isNamed = false;
    let tagHandle = "";
    let tagName;
    let ch;
    ch = this.peek();
    if (ch !== EXCLAMATION) return false;
    if (this.tag !== null) {
      return this.throwError("Cannot read tag property: duplication of a tag property");
    }
    ch = this.next();
    if (ch === SMALLER_THAN) {
      isVerbatim = true;
      ch = this.next();
    } else if (ch === EXCLAMATION) {
      isNamed = true;
      tagHandle = "!!";
      ch = this.next();
    } else {
      tagHandle = "!";
    }
    position = this.position;
    if (isVerbatim) {
      do {
        ch = this.next();
      }while (ch !== 0 && ch !== GREATER_THAN)
      if (this.position < this.length) {
        tagName = this.input.slice(position, this.position);
        ch = this.next();
      } else {
        return this.throwError("Cannot read tag property: unexpected end of stream");
      }
    } else {
      while(ch !== 0 && !isWhiteSpaceOrEOL(ch)){
        if (ch === EXCLAMATION) {
          if (!isNamed) {
            tagHandle = this.input.slice(position - 1, this.position + 1);
            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
              return this.throwError("Cannot read tag property: named tag handle contains invalid characters");
            }
            isNamed = true;
            position = this.position + 1;
          } else {
            return this.throwError("Cannot read tag property: tag suffix cannot contain an exclamation mark");
          }
        }
        ch = this.next();
      }
      tagName = this.input.slice(position, this.position);
      if (PATTERN_FLOW_INDICATORS.test(tagName)) {
        return this.throwError("Cannot read tag property: tag suffix cannot contain flow indicator characters");
      }
    }
    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
      return this.throwError(`Cannot read tag property: invalid characters in tag name "${tagName}"`);
    }
    if (isVerbatim) {
      this.tag = tagName;
    } else if (this.tagMap.has(tagHandle)) {
      this.tag = this.tagMap.get(tagHandle) + tagName;
    } else if (tagHandle === "!") {
      this.tag = `!${tagName}`;
    } else if (tagHandle === "!!") {
      this.tag = `tag:yaml.org,2002:${tagName}`;
    } else {
      return this.throwError(`Cannot read tag property: undeclared tag handle "${tagHandle}"`);
    }
    return true;
  }
  readAnchorProperty() {
    let ch = this.peek();
    if (ch !== AMPERSAND) return false;
    if (this.anchor !== null) {
      return this.throwError("Cannot read anchor property: duplicate anchor property");
    }
    ch = this.next();
    const position = this.position;
    while(ch !== 0 && !isWhiteSpaceOrEOL(ch) && !isFlowIndicator(ch)){
      ch = this.next();
    }
    if (this.position === position) {
      return this.throwError("Cannot read anchor property: name of an anchor node must contain at least one character");
    }
    this.anchor = this.input.slice(position, this.position);
    return true;
  }
  readAlias() {
    if (this.peek() !== ASTERISK) return false;
    let ch = this.next();
    const position = this.position;
    while(ch !== 0 && !isWhiteSpaceOrEOL(ch) && !isFlowIndicator(ch)){
      ch = this.next();
    }
    if (this.position === position) {
      return this.throwError("Cannot read alias: alias name must contain at least one character");
    }
    const alias = this.input.slice(position, this.position);
    if (!this.anchorMap.has(alias)) {
      return this.throwError(`Cannot read alias: unidentified alias "${alias}"`);
    }
    this.result = this.anchorMap.get(alias);
    this.skipSeparationSpace(true, -1);
    return true;
  }
  composeNode(parentIndent, nodeContext, allowToSeek, allowCompact) {
    let allowBlockScalars;
    let allowBlockCollections;
    let indentStatus = 1; // 1: this>parent, 0: this=parent, -1: this<parent
    let atNewLine = false;
    let hasContent = false;
    let type;
    let flowIndent;
    let blockIndent;
    this.tag = null;
    this.anchor = null;
    this.kind = null;
    this.result = null;
    const allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
    if (allowToSeek) {
      if (this.skipSeparationSpace(true, -1)) {
        atNewLine = true;
        if (this.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (this.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (this.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      }
    }
    if (indentStatus === 1) {
      while(this.readTagProperty() || this.readAnchorProperty()){
        if (this.skipSeparationSpace(true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;
          if (this.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (this.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (this.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        } else {
          allowBlockCollections = false;
        }
      }
    }
    if (allowBlockCollections) {
      allowBlockCollections = atNewLine || allowCompact;
    }
    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      const cond = CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext;
      flowIndent = cond ? parentIndent : parentIndent + 1;
      blockIndent = this.position - this.lineStart;
      if (indentStatus === 1) {
        if (allowBlockCollections && (this.readBlockSequence(blockIndent) || this.readBlockMapping(blockIndent, flowIndent)) || this.readFlowCollection(flowIndent)) {
          hasContent = true;
        } else {
          if (allowBlockScalars && this.readBlockScalar(flowIndent) || this.readSingleQuotedScalar(flowIndent) || this.readDoubleQuotedScalar(flowIndent)) {
            hasContent = true;
          } else if (this.readAlias()) {
            hasContent = true;
            if (this.tag !== null || this.anchor !== null) {
              return this.throwError("Cannot compose node: alias node should not have any properties");
            }
          } else if (this.readPlainScalar(flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;
            if (this.tag === null) {
              this.tag = "?";
            }
          }
          if (this.anchor !== null) {
            this.anchorMap.set(this.anchor, this.result);
          }
        }
      } else if (indentStatus === 0) {
        // Special case: block sequences are allowed to have same indentation level as the parent.
        // http://www.yaml.org/spec/1.2/spec.html#id2799784
        hasContent = allowBlockCollections && this.readBlockSequence(blockIndent);
      }
    }
    if (this.tag !== null && this.tag !== "!") {
      if (this.tag === "?") {
        for(let typeIndex = 0; typeIndex < this.implicitTypes.length; typeIndex++){
          type = this.implicitTypes[typeIndex];
          // Implicit resolving is not allowed for non-scalar types, and '?'
          // non-specific tag is only assigned to plain scalars. So, it isn't
          // needed to check for 'kind' conformity.
          if (type.resolve(this.result)) {
            // `state.result` updated in resolver if matched
            this.result = type.construct(this.result);
            this.tag = type.tag;
            if (this.anchor !== null) {
              this.anchorMap.set(this.anchor, this.result);
            }
            break;
          }
        }
      } else if (this.typeMap[this.kind ?? "fallback"].has(this.tag)) {
        const map = this.typeMap[this.kind ?? "fallback"];
        type = map.get(this.tag);
        if (this.result !== null && type.kind !== this.kind) {
          return this.throwError(`Unacceptable node kind for !<${this.tag}> tag: it should be "${type.kind}", not "${this.kind}"`);
        }
        if (!type.resolve(this.result)) {
          // `state.result` updated in resolver if matched
          return this.throwError(`Cannot resolve a node with !<${this.tag}> explicit tag`);
        } else {
          this.result = type.construct(this.result);
          if (this.anchor !== null) {
            this.anchorMap.set(this.anchor, this.result);
          }
        }
      } else {
        return this.throwError(`Cannot resolve unknown tag !<${this.tag}>`);
      }
    }
    return this.tag !== null || this.anchor !== null || hasContent;
  }
  readDocument() {
    const documentStart = this.position;
    let position;
    let directiveName;
    let directiveArgs;
    let hasDirectives = false;
    let ch;
    this.version = null;
    this.checkLineBreaks = false;
    this.tagMap = new Map();
    this.anchorMap = new Map();
    while((ch = this.peek()) !== 0){
      this.skipSeparationSpace(true, -1);
      ch = this.peek();
      if (this.lineIndent > 0 || ch !== PERCENT) {
        break;
      }
      hasDirectives = true;
      ch = this.next();
      position = this.position;
      while(ch !== 0 && !isWhiteSpaceOrEOL(ch)){
        ch = this.next();
      }
      directiveName = this.input.slice(position, this.position);
      directiveArgs = [];
      if (directiveName.length < 1) {
        return this.throwError("Cannot read document: directive name length must be greater than zero");
      }
      while(ch !== 0){
        while(isWhiteSpace(ch)){
          ch = this.next();
        }
        if (ch === SHARP) {
          do {
            ch = this.next();
          }while (ch !== 0 && !isEOL(ch))
          break;
        }
        if (isEOL(ch)) break;
        position = this.position;
        while(ch !== 0 && !isWhiteSpaceOrEOL(ch)){
          ch = this.next();
        }
        directiveArgs.push(this.input.slice(position, this.position));
      }
      if (ch !== 0) this.readLineBreak();
      switch(directiveName){
        case "YAML":
          this.yamlDirectiveHandler(...directiveArgs);
          break;
        case "TAG":
          this.tagDirectiveHandler(...directiveArgs);
          break;
        default:
          this.dispatchWarning(`unknown document directive "${directiveName}"`);
          break;
      }
    }
    this.skipSeparationSpace(true, -1);
    if (this.lineIndent === 0 && this.peek() === MINUS && this.peek(1) === MINUS && this.peek(2) === MINUS) {
      this.position += 3;
      this.skipSeparationSpace(true, -1);
    } else if (hasDirectives) {
      return this.throwError("Cannot read document: directives end mark is expected");
    }
    this.composeNode(this.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    this.skipSeparationSpace(true, -1);
    if (this.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(this.input.slice(documentStart, this.position))) {
      this.dispatchWarning("non-ASCII line breaks are interpreted as content");
    }
    if (this.position === this.lineStart && this.testDocumentSeparator()) {
      if (this.peek() === DOT) {
        this.position += 3;
        this.skipSeparationSpace(true, -1);
      }
    } else if (this.position < this.length - 1) {
      return this.throwError("Cannot read document: end of the stream or a document separator is expected");
    }
    return this.result;
  }
  *readDocuments() {
    while(this.position < this.length - 1){
      yield this.readDocument();
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8xLjAuNS9fbG9hZGVyX3N0YXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7XG4gIEFNUEVSU0FORCxcbiAgQVNURVJJU0ssXG4gIEJBQ0tTTEFTSCxcbiAgQ0FSUklBR0VfUkVUVVJOLFxuICBDT0xPTixcbiAgQ09NTUEsXG4gIENPTU1FUkNJQUxfQVQsXG4gIERPVCxcbiAgRE9VQkxFX1FVT1RFLFxuICBFWENMQU1BVElPTixcbiAgR1JBVkVfQUNDRU5ULFxuICBHUkVBVEVSX1RIQU4sXG4gIGlzRU9MLFxuICBpc0Zsb3dJbmRpY2F0b3IsXG4gIGlzV2hpdGVTcGFjZSxcbiAgaXNXaGl0ZVNwYWNlT3JFT0wsXG4gIExFRlRfQ1VSTFlfQlJBQ0tFVCxcbiAgTEVGVF9TUVVBUkVfQlJBQ0tFVCxcbiAgTElORV9GRUVELFxuICBNSU5VUyxcbiAgUEVSQ0VOVCxcbiAgUExVUyxcbiAgUVVFU1RJT04sXG4gIFJJR0hUX0NVUkxZX0JSQUNLRVQsXG4gIFJJR0hUX1NRVUFSRV9CUkFDS0VULFxuICBTSEFSUCxcbiAgU0lOR0xFX1FVT1RFLFxuICBTTUFMTEVSX1RIQU4sXG4gIFNQQUNFLFxuICBWRVJUSUNBTF9MSU5FLFxufSBmcm9tIFwiLi9fY2hhcnMudHNcIjtcblxuaW1wb3J0IHsgREVGQVVMVF9TQ0hFTUEsIHR5cGUgU2NoZW1hLCB0eXBlIFR5cGVNYXAgfSBmcm9tIFwiLi9fc2NoZW1hLnRzXCI7XG5pbXBvcnQgdHlwZSB7IEtpbmRUeXBlLCBUeXBlIH0gZnJvbSBcIi4vX3R5cGUudHNcIjtcbmltcG9ydCB7IGlzT2JqZWN0LCBpc1BsYWluT2JqZWN0IH0gZnJvbSBcIi4vX3V0aWxzLnRzXCI7XG5cbmNvbnN0IENPTlRFWFRfRkxPV19JTiA9IDE7XG5jb25zdCBDT05URVhUX0ZMT1dfT1VUID0gMjtcbmNvbnN0IENPTlRFWFRfQkxPQ0tfSU4gPSAzO1xuY29uc3QgQ09OVEVYVF9CTE9DS19PVVQgPSA0O1xuXG5jb25zdCBDSE9NUElOR19DTElQID0gMTtcbmNvbnN0IENIT01QSU5HX1NUUklQID0gMjtcbmNvbnN0IENIT01QSU5HX0tFRVAgPSAzO1xuXG5jb25zdCBQQVRURVJOX05PTl9QUklOVEFCTEUgPVxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWNvbnRyb2wtcmVnZXhcbiAgL1tcXHgwMC1cXHgwOFxceDBCXFx4MENcXHgwRS1cXHgxRlxceDdGLVxceDg0XFx4ODYtXFx4OUZcXHVGRkZFXFx1RkZGRl18W1xcdUQ4MDAtXFx1REJGRl0oPyFbXFx1REMwMC1cXHVERkZGXSl8KD86W15cXHVEODAwLVxcdURCRkZdfF4pW1xcdURDMDAtXFx1REZGRl0vO1xuY29uc3QgUEFUVEVSTl9OT05fQVNDSUlfTElORV9CUkVBS1MgPSAvW1xceDg1XFx1MjAyOFxcdTIwMjldLztcbmNvbnN0IFBBVFRFUk5fRkxPV19JTkRJQ0FUT1JTID0gL1ssXFxbXFxdXFx7XFx9XS87XG5jb25zdCBQQVRURVJOX1RBR19IQU5ETEUgPSAvXig/OiF8ISF8IVthLXpcXC1dKyEpJC9pO1xuY29uc3QgUEFUVEVSTl9UQUdfVVJJID1cbiAgL14oPzohfFteLFxcW1xcXVxce1xcfV0pKD86JVswLTlhLWZdezJ9fFswLTlhLXpcXC0jO1xcL1xcPzpAJj1cXCtcXCQsX1xcLiF+XFwqJ1xcKFxcKVxcW1xcXV0pKiQvaTtcblxuZXhwb3J0IGludGVyZmFjZSBMb2FkZXJTdGF0ZU9wdGlvbnMge1xuICAvKiogc3BlY2lmaWVzIGEgc2NoZW1hIHRvIHVzZS4gKi9cbiAgc2NoZW1hPzogU2NoZW1hO1xuICAvKiogY29tcGF0aWJpbGl0eSB3aXRoIEpTT04ucGFyc2UgYmVoYXZpb3VyLiAqL1xuICBhbGxvd0R1cGxpY2F0ZUtleXM/OiBib29sZWFuO1xuICAvKiogZnVuY3Rpb24gdG8gY2FsbCBvbiB3YXJuaW5nIG1lc3NhZ2VzLiAqL1xuICBvbldhcm5pbmc/KGVycm9yOiBFcnJvcik6IHZvaWQ7XG59XG5cbmNvbnN0IEVTQ0FQRURfSEVYX0xFTkdUSFMgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPihbXG4gIFsweDc4LCAyXSwgLy8geFxuICBbMHg3NSwgNF0sIC8vIHVcbiAgWzB4NTUsIDhdLCAvLyBVXG5dKTtcblxuY29uc3QgU0lNUExFX0VTQ0FQRV9TRVFVRU5DRVMgPSBuZXcgTWFwPG51bWJlciwgc3RyaW5nPihbXG4gIFsweDMwLCBcIlxceDAwXCJdLCAvLyAwXG4gIFsweDYxLCBcIlxceDA3XCJdLCAvLyBhXG4gIFsweDYyLCBcIlxceDA4XCJdLCAvLyBiXG4gIFsweDc0LCBcIlxceDA5XCJdLCAvLyB0XG4gIFsweDA5LCBcIlxceDA5XCJdLCAvLyBUYWJcbiAgWzB4NmUsIFwiXFx4MEFcIl0sIC8vIG5cbiAgWzB4NzYsIFwiXFx4MEJcIl0sIC8vIHZcbiAgWzB4NjYsIFwiXFx4MENcIl0sIC8vIGZcbiAgWzB4NzIsIFwiXFx4MERcIl0sIC8vIHJcbiAgWzB4NjUsIFwiXFx4MUJcIl0sIC8vIGVcbiAgWzB4MjAsIFwiIFwiXSwgLy8gU3BhY2VcbiAgWzB4MjIsICdcIiddLCAvLyBcIlxuICBbMHgyZiwgXCIvXCJdLCAvLyAvXG4gIFsweDVjLCBcIlxcXFxcIl0sIC8vIFxcXG4gIFsweDRlLCBcIlxceDg1XCJdLCAvLyBOXG4gIFsweDVmLCBcIlxceEEwXCJdLCAvLyBfXG4gIFsweDRjLCBcIlxcdTIwMjhcIl0sIC8vIExcbiAgWzB4NTAsIFwiXFx1MjAyOVwiXSwgLy8gUFxuXSk7XG5cbi8qKlxuICogQ29udmVydHMgYSBoZXhhZGVjaW1hbCBjaGFyYWN0ZXIgY29kZSB0byBpdHMgZGVjaW1hbCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gaGV4Q2hhckNvZGVUb051bWJlcihjaGFyQ29kZTogbnVtYmVyKSB7XG4gIC8vIENoZWNrIGlmIHRoZSBjaGFyYWN0ZXIgY29kZSBpcyBpbiB0aGUgcmFuZ2UgZm9yICcwJyB0byAnOSdcbiAgaWYgKDB4MzAgPD0gY2hhckNvZGUgJiYgY2hhckNvZGUgPD0gMHgzOSkgcmV0dXJuIGNoYXJDb2RlIC0gMHgzMDsgLy8gQ29udmVydCAnMCctJzknIHRvIDAtOVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgY2hhcmFjdGVyIGNvZGUgdG8gbG93ZXJjYXNlIGlmIGl0J3MgYSBsZXR0ZXJcbiAgY29uc3QgbGMgPSBjaGFyQ29kZSB8IDB4MjA7XG5cbiAgLy8gQ2hlY2sgaWYgdGhlIGNoYXJhY3RlciBjb2RlIGlzIGluIHRoZSByYW5nZSBmb3IgJ2EnIHRvICdmJ1xuICBpZiAoMHg2MSA8PSBsYyAmJiBsYyA8PSAweDY2KSByZXR1cm4gbGMgLSAweDYxICsgMTA7IC8vIENvbnZlcnQgJ2EnLSdmJyB0byAxMC0xNVxuXG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGRlY2ltYWwgY2hhcmFjdGVyIGNvZGUgdG8gaXRzIGRlY2ltYWwgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGRlY2ltYWxDaGFyQ29kZVRvTnVtYmVyKGNoYXJDb2RlOiBudW1iZXIpOiBudW1iZXIge1xuICAvLyBDaGVjayBpZiB0aGUgY2hhcmFjdGVyIGNvZGUgaXMgaW4gdGhlIHJhbmdlIGZvciAnMCcgdG8gJzknXG4gIGlmICgweDMwIDw9IGNoYXJDb2RlICYmIGNoYXJDb2RlIDw9IDB4MzkpIHJldHVybiBjaGFyQ29kZSAtIDB4MzA7IC8vIENvbnZlcnQgJzAnLSc5JyB0byAwLTlcbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgVW5pY29kZSBjb2RlIHBvaW50IHRvIGEgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBjb2RlcG9pbnRUb0NoYXIoY29kZXBvaW50OiBudW1iZXIpOiBzdHJpbmcge1xuICAvLyBDaGVjayBpZiB0aGUgY29kZSBwb2ludCBpcyB3aXRoaW4gdGhlIEJhc2ljIE11bHRpbGluZ3VhbCBQbGFuZSAoQk1QKVxuICBpZiAoY29kZXBvaW50IDw9IDB4ZmZmZikgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZXBvaW50KTsgLy8gQ29udmVydCBCTVAgY29kZSBwb2ludCB0byBjaGFyYWN0ZXJcblxuICAvLyBFbmNvZGUgVVRGLTE2IHN1cnJvZ2F0ZSBwYWlyIGZvciBjb2RlIHBvaW50cyBiZXlvbmQgQk1QXG4gIC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVVRGLTE2I0NvZGVfcG9pbnRzX1UuMkIwMTAwMDBfdG9fVS4yQjEwRkZGRlxuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShcbiAgICAoKGNvZGVwb2ludCAtIDB4MDEwMDAwKSA+PiAxMCkgKyAweGQ4MDAsIC8vIEhpZ2ggc3Vycm9nYXRlXG4gICAgKChjb2RlcG9pbnQgLSAweDAxMDAwMCkgJiAweDAzZmYpICsgMHhkYzAwLCAvLyBMb3cgc3Vycm9nYXRlXG4gICk7XG59XG5cbmNvbnN0IElOREVOVCA9IDQ7XG5jb25zdCBNQVhfTEVOR1RIID0gNzU7XG5jb25zdCBERUxJTUlURVJTID0gXCJcXHgwMFxcclxcblxceDg1XFx1MjAyOFxcdTIwMjlcIjtcblxuZnVuY3Rpb24gZ2V0U25pcHBldChidWZmZXI6IHN0cmluZywgcG9zaXRpb246IG51bWJlcik6IHN0cmluZyB8IG51bGwge1xuICBpZiAoIWJ1ZmZlcikgcmV0dXJuIG51bGw7XG4gIGxldCBzdGFydCA9IHBvc2l0aW9uO1xuICBsZXQgZW5kID0gcG9zaXRpb247XG4gIGxldCBoZWFkID0gXCJcIjtcbiAgbGV0IHRhaWwgPSBcIlwiO1xuXG4gIHdoaWxlIChzdGFydCA+IDAgJiYgIURFTElNSVRFUlMuaW5jbHVkZXMoYnVmZmVyLmNoYXJBdChzdGFydCAtIDEpKSkge1xuICAgIHN0YXJ0LS07XG4gICAgaWYgKHBvc2l0aW9uIC0gc3RhcnQgPiBNQVhfTEVOR1RIIC8gMiAtIDEpIHtcbiAgICAgIGhlYWQgPSBcIiAuLi4gXCI7XG4gICAgICBzdGFydCArPSA1O1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgd2hpbGUgKGVuZCA8IGJ1ZmZlci5sZW5ndGggJiYgIURFTElNSVRFUlMuaW5jbHVkZXMoYnVmZmVyLmNoYXJBdChlbmQpKSkge1xuICAgIGVuZCsrO1xuICAgIGlmIChlbmQgLSBwb3NpdGlvbiA+IE1BWF9MRU5HVEggLyAyIC0gMSkge1xuICAgICAgdGFpbCA9IFwiIC4uLiBcIjtcbiAgICAgIGVuZCAtPSA1O1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc25pcHBldCA9IGJ1ZmZlci5zbGljZShzdGFydCwgZW5kKTtcbiAgY29uc3QgaW5kZW50ID0gXCIgXCIucmVwZWF0KElOREVOVCk7XG4gIGNvbnN0IGNhcmV0SW5kZW50ID0gXCIgXCIucmVwZWF0KElOREVOVCArIHBvc2l0aW9uIC0gc3RhcnQgKyBoZWFkLmxlbmd0aCk7XG4gIHJldHVybiBgJHtpbmRlbnQgKyBoZWFkICsgc25pcHBldCArIHRhaWx9XFxuJHtjYXJldEluZGVudH1eYDtcbn1cblxuZnVuY3Rpb24gbWFya1RvU3RyaW5nKFxuICBidWZmZXI6IHN0cmluZyxcbiAgcG9zaXRpb246IG51bWJlcixcbiAgbGluZTogbnVtYmVyLFxuICBjb2x1bW46IG51bWJlcixcbik6IHN0cmluZyB7XG4gIGxldCB3aGVyZSA9IGBhdCBsaW5lICR7bGluZSArIDF9LCBjb2x1bW4gJHtjb2x1bW4gKyAxfWA7XG4gIGNvbnN0IHNuaXBwZXQgPSBnZXRTbmlwcGV0KGJ1ZmZlciwgcG9zaXRpb24pO1xuICBpZiAoc25pcHBldCkgd2hlcmUgKz0gYDpcXG4ke3NuaXBwZXR9YDtcbiAgcmV0dXJuIHdoZXJlO1xufVxuXG5leHBvcnQgY2xhc3MgTG9hZGVyU3RhdGUge1xuICBpbnB1dDogc3RyaW5nO1xuICBsZW5ndGg6IG51bWJlcjtcbiAgbGluZUluZGVudCA9IDA7XG4gIGxpbmVTdGFydCA9IDA7XG4gIHBvc2l0aW9uID0gMDtcbiAgbGluZSA9IDA7XG4gIG9uV2FybmluZzogKChlcnJvcjogRXJyb3IpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICBhbGxvd0R1cGxpY2F0ZUtleXM6IGJvb2xlYW47XG4gIGltcGxpY2l0VHlwZXM6IFR5cGU8XCJzY2FsYXJcIj5bXTtcbiAgdHlwZU1hcDogVHlwZU1hcDtcblxuICB2ZXJzaW9uOiBzdHJpbmcgfCBudWxsO1xuICBjaGVja0xpbmVCcmVha3MgPSBmYWxzZTtcbiAgdGFnTWFwID0gbmV3IE1hcCgpO1xuICBhbmNob3JNYXAgPSBuZXcgTWFwKCk7XG4gIHRhZzogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgYW5jaG9yOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuICBraW5kOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuICByZXN1bHQ6IHVua25vd25bXSB8IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgc3RyaW5nIHwgbnVsbCA9IFwiXCI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgaW5wdXQ6IHN0cmluZyxcbiAgICB7XG4gICAgICBzY2hlbWEgPSBERUZBVUxUX1NDSEVNQSxcbiAgICAgIG9uV2FybmluZyxcbiAgICAgIGFsbG93RHVwbGljYXRlS2V5cyA9IGZhbHNlLFxuICAgIH06IExvYWRlclN0YXRlT3B0aW9ucyxcbiAgKSB7XG4gICAgdGhpcy5pbnB1dCA9IGlucHV0O1xuICAgIHRoaXMub25XYXJuaW5nID0gb25XYXJuaW5nO1xuICAgIHRoaXMuYWxsb3dEdXBsaWNhdGVLZXlzID0gYWxsb3dEdXBsaWNhdGVLZXlzO1xuICAgIHRoaXMuaW1wbGljaXRUeXBlcyA9IHNjaGVtYS5pbXBsaWNpdFR5cGVzO1xuICAgIHRoaXMudHlwZU1hcCA9IHNjaGVtYS50eXBlTWFwO1xuICAgIHRoaXMubGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuICAgIHRoaXMudmVyc2lvbiA9IG51bGw7XG5cbiAgICB0aGlzLnJlYWRJbmRlbnQoKTtcbiAgfVxuXG4gIHJlYWRJbmRlbnQoKSB7XG4gICAgbGV0IGNoYXIgPSB0aGlzLnBlZWsoKTtcbiAgICB3aGlsZSAoY2hhciA9PT0gU1BBQ0UpIHtcbiAgICAgIHRoaXMubGluZUluZGVudCArPSAxO1xuICAgICAgY2hhciA9IHRoaXMubmV4dCgpO1xuICAgIH1cbiAgfVxuXG4gIHBlZWsob2Zmc2V0ID0gMCkge1xuICAgIHJldHVybiB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3NpdGlvbiArIG9mZnNldCk7XG4gIH1cbiAgbmV4dCgpIHtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDE7XG4gICAgcmV0dXJuIHRoaXMucGVlaygpO1xuICB9XG5cbiAgI2NyZWF0ZUVycm9yKG1lc3NhZ2U6IHN0cmluZyk6IFN5bnRheEVycm9yIHtcbiAgICBjb25zdCBtYXJrID0gbWFya1RvU3RyaW5nKFxuICAgICAgdGhpcy5pbnB1dCxcbiAgICAgIHRoaXMucG9zaXRpb24sXG4gICAgICB0aGlzLmxpbmUsXG4gICAgICB0aGlzLnBvc2l0aW9uIC0gdGhpcy5saW5lU3RhcnQsXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFN5bnRheEVycm9yKGAke21lc3NhZ2V9ICR7bWFya31gKTtcbiAgfVxuXG4gIHRocm93RXJyb3IobWVzc2FnZTogc3RyaW5nKTogbmV2ZXIge1xuICAgIHRocm93IHRoaXMuI2NyZWF0ZUVycm9yKG1lc3NhZ2UpO1xuICB9XG5cbiAgZGlzcGF0Y2hXYXJuaW5nKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIGNvbnN0IGVycm9yID0gdGhpcy4jY3JlYXRlRXJyb3IobWVzc2FnZSk7XG4gICAgdGhpcy5vbldhcm5pbmc/LihlcnJvcik7XG4gIH1cblxuICB5YW1sRGlyZWN0aXZlSGFuZGxlciguLi5hcmdzOiBzdHJpbmdbXSkge1xuICAgIGlmICh0aGlzLnZlcnNpb24gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgIFwiQ2Fubm90IGhhbmRsZSBZQU1MIGRpcmVjdGl2ZTogZHVwbGljYXRpb24gb2YgJVlBTUwgZGlyZWN0aXZlXCIsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChhcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgXCJDYW5ub3QgaGFuZGxlIFlBTUwgZGlyZWN0aXZlOiBZQU1MIGRpcmVjdGl2ZSBhY2NlcHRzIGV4YWN0bHkgb25lIGFyZ3VtZW50XCIsXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IG1hdGNoID0gL14oWzAtOV0rKVxcLihbMC05XSspJC8uZXhlYyhhcmdzWzBdISk7XG4gICAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy50aHJvd0Vycm9yKFxuICAgICAgICBcIkNhbm5vdCBoYW5kbGUgWUFNTCBkaXJlY3RpdmU6IGlsbC1mb3JtZWQgYXJndW1lbnRcIixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgbWFqb3IgPSBwYXJzZUludChtYXRjaFsxXSEsIDEwKTtcbiAgICBjb25zdCBtaW5vciA9IHBhcnNlSW50KG1hdGNoWzJdISwgMTApO1xuICAgIGlmIChtYWpvciAhPT0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgXCJDYW5ub3QgaGFuZGxlIFlBTUwgZGlyZWN0aXZlOiB1bmFjY2VwdGFibGUgWUFNTCB2ZXJzaW9uXCIsXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMudmVyc2lvbiA9IGFyZ3NbMF0gPz8gbnVsbDtcbiAgICB0aGlzLmNoZWNrTGluZUJyZWFrcyA9IG1pbm9yIDwgMjtcbiAgICBpZiAobWlub3IgIT09IDEgJiYgbWlub3IgIT09IDIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoV2FybmluZyhcbiAgICAgICAgXCJDYW5ub3QgaGFuZGxlIFlBTUwgZGlyZWN0aXZlOiB1bnN1cHBvcnRlZCBZQU1MIHZlcnNpb25cIixcbiAgICAgICk7XG4gICAgfVxuICB9XG4gIHRhZ0RpcmVjdGl2ZUhhbmRsZXIoLi4uYXJnczogc3RyaW5nW10pIHtcbiAgICBpZiAoYXJncy5sZW5ndGggIT09IDIpIHtcbiAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgIGBDYW5ub3QgaGFuZGxlIHRhZyBkaXJlY3RpdmU6IGRpcmVjdGl2ZSBhY2NlcHRzIGV4YWN0bHkgdHdvIGFyZ3VtZW50cywgcmVjZWl2ZWQgJHthcmdzLmxlbmd0aH1gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBoYW5kbGUgPSBhcmdzWzBdITtcbiAgICBjb25zdCBwcmVmaXggPSBhcmdzWzFdITtcblxuICAgIGlmICghUEFUVEVSTl9UQUdfSEFORExFLnRlc3QoaGFuZGxlKSkge1xuICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgYENhbm5vdCBoYW5kbGUgdGFnIGRpcmVjdGl2ZTogaWxsLWZvcm1lZCBoYW5kbGUgKGZpcnN0IGFyZ3VtZW50KSBpbiBcIiR7aGFuZGxlfVwiYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudGFnTWFwLmhhcyhoYW5kbGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy50aHJvd0Vycm9yKFxuICAgICAgICBgQ2Fubm90IGhhbmRsZSB0YWcgZGlyZWN0aXZlOiBwcmV2aW91c2x5IGRlY2xhcmVkIHN1ZmZpeCBmb3IgXCIke2hhbmRsZX1cIiB0YWcgaGFuZGxlYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKCFQQVRURVJOX1RBR19VUkkudGVzdChwcmVmaXgpKSB7XG4gICAgICByZXR1cm4gdGhpcy50aHJvd0Vycm9yKFxuICAgICAgICBcIkNhbm5vdCBoYW5kbGUgdGFnIGRpcmVjdGl2ZTogaWxsLWZvcm1lZCB0YWcgcHJlZml4IChzZWNvbmQgYXJndW1lbnQpIG9mIHRoZSBUQUcgZGlyZWN0aXZlXCIsXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMudGFnTWFwLnNldChoYW5kbGUsIHByZWZpeCk7XG4gIH1cbiAgY2FwdHVyZVNlZ21lbnQoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIsIGNoZWNrSnNvbjogYm9vbGVhbikge1xuICAgIGxldCByZXN1bHQ6IHN0cmluZztcbiAgICBpZiAoc3RhcnQgPCBlbmQpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuaW5wdXQuc2xpY2Uoc3RhcnQsIGVuZCk7XG5cbiAgICAgIGlmIChjaGVja0pzb24pIHtcbiAgICAgICAgZm9yIChcbiAgICAgICAgICBsZXQgcG9zaXRpb24gPSAwO1xuICAgICAgICAgIHBvc2l0aW9uIDwgcmVzdWx0Lmxlbmd0aDtcbiAgICAgICAgICBwb3NpdGlvbisrXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IGNoYXJhY3RlciA9IHJlc3VsdC5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAhKGNoYXJhY3RlciA9PT0gMHgwOSB8fFxuICAgICAgICAgICAgICAoMHgyMCA8PSBjaGFyYWN0ZXIgJiYgY2hhcmFjdGVyIDw9IDB4MTBmZmZmKSlcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgICAgICAgIGBFeHBlY3RlZCB2YWxpZCBKU09OIGNoYXJhY3RlcjogcmVjZWl2ZWQgXCIke2NoYXJhY3Rlcn1cImAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChQQVRURVJOX05PTl9QUklOVEFCTEUudGVzdChyZXN1bHQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXCJTdHJlYW0gY29udGFpbnMgbm9uLXByaW50YWJsZSBjaGFyYWN0ZXJzXCIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlc3VsdCArPSByZXN1bHQ7XG4gICAgfVxuICB9XG4gIHJlYWRCbG9ja1NlcXVlbmNlKG5vZGVJbmRlbnQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGxldCBsaW5lOiBudW1iZXI7XG4gICAgbGV0IGZvbGxvd2luZzogbnVtYmVyO1xuICAgIGxldCBkZXRlY3RlZCA9IGZhbHNlO1xuICAgIGxldCBjaDogbnVtYmVyO1xuICAgIGNvbnN0IHRhZyA9IHRoaXMudGFnO1xuICAgIGNvbnN0IGFuY2hvciA9IHRoaXMuYW5jaG9yO1xuICAgIGNvbnN0IHJlc3VsdDogdW5rbm93bltdID0gW107XG5cbiAgICBpZiAodGhpcy5hbmNob3IgIT09IG51bGwgJiYgdHlwZW9mIHRoaXMuYW5jaG9yICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmFuY2hvck1hcC5zZXQodGhpcy5hbmNob3IsIHJlc3VsdCk7XG4gICAgfVxuXG4gICAgY2ggPSB0aGlzLnBlZWsoKTtcblxuICAgIHdoaWxlIChjaCAhPT0gMCkge1xuICAgICAgaWYgKGNoICE9PSBNSU5VUykge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgZm9sbG93aW5nID0gdGhpcy5wZWVrKDEpO1xuXG4gICAgICBpZiAoIWlzV2hpdGVTcGFjZU9yRU9MKGZvbGxvd2luZykpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGRldGVjdGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMucG9zaXRpb24rKztcblxuICAgICAgaWYgKHRoaXMuc2tpcFNlcGFyYXRpb25TcGFjZSh0cnVlLCAtMSkpIHtcbiAgICAgICAgaWYgKHRoaXMubGluZUluZGVudCA8PSBub2RlSW5kZW50KSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2gobnVsbCk7XG4gICAgICAgICAgY2ggPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsaW5lID0gdGhpcy5saW5lO1xuICAgICAgdGhpcy5jb21wb3NlTm9kZShub2RlSW5kZW50LCBDT05URVhUX0JMT0NLX0lOLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICByZXN1bHQucHVzaCh0aGlzLnJlc3VsdCk7XG4gICAgICB0aGlzLnNraXBTZXBhcmF0aW9uU3BhY2UodHJ1ZSwgLTEpO1xuXG4gICAgICBjaCA9IHRoaXMucGVlaygpO1xuXG4gICAgICBpZiAoKHRoaXMubGluZSA9PT0gbGluZSB8fCB0aGlzLmxpbmVJbmRlbnQgPiBub2RlSW5kZW50KSAmJiBjaCAhPT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aHJvd0Vycm9yKFxuICAgICAgICAgIFwiQ2Fubm90IHJlYWQgYmxvY2sgc2VxdWVuY2U6IGJhZCBpbmRlbnRhdGlvbiBvZiBhIHNlcXVlbmNlIGVudHJ5XCIsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubGluZUluZGVudCA8IG5vZGVJbmRlbnQpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRldGVjdGVkKSB7XG4gICAgICB0aGlzLnRhZyA9IHRhZztcbiAgICAgIHRoaXMuYW5jaG9yID0gYW5jaG9yO1xuICAgICAgdGhpcy5raW5kID0gXCJzZXF1ZW5jZVwiO1xuICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIG1lcmdlTWFwcGluZ3MoXG4gICAgZGVzdGluYXRpb246IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuICAgIHNvdXJjZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gICAgb3ZlcnJpZGFibGVLZXlzOiBTZXQ8c3RyaW5nPixcbiAgKSB7XG4gICAgaWYgKCFpc09iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdGhpcy50aHJvd0Vycm9yKFxuICAgICAgICBcIkNhbm5vdCBtZXJnZSBtYXBwaW5nczogdGhlIHByb3ZpZGVkIHNvdXJjZSBvYmplY3QgaXMgdW5hY2NlcHRhYmxlXCIsXG4gICAgICApO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHNvdXJjZSkpIHtcbiAgICAgIGlmIChPYmplY3QuaGFzT3duKGRlc3RpbmF0aW9uLCBrZXkpKSBjb250aW51ZTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkZXN0aW5hdGlvbiwga2V5LCB7XG4gICAgICAgIHZhbHVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSk7XG4gICAgICBvdmVycmlkYWJsZUtleXMuYWRkKGtleSk7XG4gICAgfVxuICB9XG4gIHN0b3JlTWFwcGluZ1BhaXIoXG4gICAgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgICBvdmVycmlkYWJsZUtleXM6IFNldDxzdHJpbmc+LFxuICAgIGtleVRhZzogc3RyaW5nIHwgbnVsbCxcbiAgICBrZXlOb2RlOiBSZWNvcmQ8UHJvcGVydHlLZXksIHVua25vd24+IHwgdW5rbm93bltdIHwgc3RyaW5nIHwgbnVsbCxcbiAgICB2YWx1ZU5vZGU6IHVua25vd24sXG4gICAgc3RhcnRMaW5lPzogbnVtYmVyLFxuICAgIHN0YXJ0UG9zPzogbnVtYmVyLFxuICApOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgLy8gVGhlIG91dHB1dCBpcyBhIHBsYWluIG9iamVjdCBoZXJlLCBzbyBrZXlzIGNhbiBvbmx5IGJlIHN0cmluZ3MuXG4gICAgLy8gV2UgbmVlZCB0byBjb252ZXJ0IGtleU5vZGUgdG8gYSBzdHJpbmcsIGJ1dCBkb2luZyBzbyBjYW4gaGFuZyB0aGUgcHJvY2Vzc1xuICAgIC8vIChkZWVwbHkgbmVzdGVkIGFycmF5cyB0aGF0IGV4cGxvZGUgZXhwb25lbnRpYWxseSB1c2luZyBhbGlhc2VzKS5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShrZXlOb2RlKSkge1xuICAgICAga2V5Tm9kZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGtleU5vZGUpO1xuXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwga2V5Tm9kZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoa2V5Tm9kZVtpbmRleF0pKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgICAgIFwiQ2Fubm90IHN0b3JlIG1hcHBpbmcgcGFpcjogbmVzdGVkIGFycmF5cyBhcmUgbm90IHN1cHBvcnRlZCBpbnNpZGUga2V5c1wiLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGtleU5vZGUgPT09IFwib2JqZWN0XCIgJiYgaXNQbGFpbk9iamVjdChrZXlOb2RlW2luZGV4XSkpIHtcbiAgICAgICAgICBrZXlOb2RlW2luZGV4XSA9IFwiW29iamVjdCBPYmplY3RdXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBdm9pZCBjb2RlIGV4ZWN1dGlvbiBpbiBsb2FkKCkgdmlhIHRvU3RyaW5nIHByb3BlcnR5XG4gICAgLy8gKHN0aWxsIHVzZSBpdHMgb3duIHRvU3RyaW5nIGZvciBhcnJheXMsIHRpbWVzdGFtcHMsXG4gICAgLy8gYW5kIHdoYXRldmVyIHVzZXIgc2NoZW1hIGV4dGVuc2lvbnMgaGFwcGVuIHRvIGhhdmUgQEB0b1N0cmluZ1RhZylcbiAgICBpZiAodHlwZW9mIGtleU5vZGUgPT09IFwib2JqZWN0XCIgJiYgaXNQbGFpbk9iamVjdChrZXlOb2RlKSkge1xuICAgICAga2V5Tm9kZSA9IFwiW29iamVjdCBPYmplY3RdXCI7XG4gICAgfVxuXG4gICAga2V5Tm9kZSA9IFN0cmluZyhrZXlOb2RlKTtcblxuICAgIGlmIChrZXlUYWcgPT09IFwidGFnOnlhbWwub3JnLDIwMDI6bWVyZ2VcIikge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWVOb2RlKSkge1xuICAgICAgICBmb3IgKFxuICAgICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgICAgaW5kZXggPCB2YWx1ZU5vZGUubGVuZ3RoO1xuICAgICAgICAgIGluZGV4KytcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5tZXJnZU1hcHBpbmdzKHJlc3VsdCwgdmFsdWVOb2RlW2luZGV4XSwgb3ZlcnJpZGFibGVLZXlzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tZXJnZU1hcHBpbmdzKFxuICAgICAgICAgIHJlc3VsdCxcbiAgICAgICAgICB2YWx1ZU5vZGUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gICAgICAgICAgb3ZlcnJpZGFibGVLZXlzLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLmFsbG93RHVwbGljYXRlS2V5cyAmJlxuICAgICAgICAhb3ZlcnJpZGFibGVLZXlzLmhhcyhrZXlOb2RlKSAmJlxuICAgICAgICBPYmplY3QuaGFzT3duKHJlc3VsdCwga2V5Tm9kZSlcbiAgICAgICkge1xuICAgICAgICB0aGlzLmxpbmUgPSBzdGFydExpbmUgfHwgdGhpcy5saW5lO1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gc3RhcnRQb3MgfHwgdGhpcy5wb3NpdGlvbjtcbiAgICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcIkNhbm5vdCBzdG9yZSBtYXBwaW5nIHBhaXI6IGR1cGxpY2F0ZWQga2V5XCIpO1xuICAgICAgfVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlc3VsdCwga2V5Tm9kZSwge1xuICAgICAgICB2YWx1ZTogdmFsdWVOb2RlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSk7XG4gICAgICBvdmVycmlkYWJsZUtleXMuZGVsZXRlKGtleU5vZGUpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgcmVhZExpbmVCcmVhaygpIHtcbiAgICBjb25zdCBjaCA9IHRoaXMucGVlaygpO1xuXG4gICAgaWYgKGNoID09PSBMSU5FX0ZFRUQpIHtcbiAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICB9IGVsc2UgaWYgKGNoID09PSBDQVJSSUFHRV9SRVRVUk4pIHtcbiAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICAgIGlmICh0aGlzLnBlZWsoKSA9PT0gTElORV9GRUVEKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcIkNhbm5vdCByZWFkIGxpbmU6IGxpbmUgYnJlYWsgbm90IGZvdW5kXCIpO1xuICAgIH1cblxuICAgIHRoaXMubGluZSArPSAxO1xuICAgIHRoaXMubGluZVN0YXJ0ID0gdGhpcy5wb3NpdGlvbjtcbiAgfVxuICBza2lwU2VwYXJhdGlvblNwYWNlKGFsbG93Q29tbWVudHM6IGJvb2xlYW4sIGNoZWNrSW5kZW50OiBudW1iZXIpOiBudW1iZXIge1xuICAgIGxldCBsaW5lQnJlYWtzID0gMDtcbiAgICBsZXQgY2ggPSB0aGlzLnBlZWsoKTtcblxuICAgIHdoaWxlIChjaCAhPT0gMCkge1xuICAgICAgd2hpbGUgKGlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgICAgY2ggPSB0aGlzLm5leHQoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFsbG93Q29tbWVudHMgJiYgY2ggPT09IFNIQVJQKSB7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICBjaCA9IHRoaXMubmV4dCgpO1xuICAgICAgICB9IHdoaWxlIChjaCAhPT0gTElORV9GRUVEICYmIGNoICE9PSBDQVJSSUFHRV9SRVRVUk4gJiYgY2ggIT09IDApO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFT0woY2gpKSB7XG4gICAgICAgIHRoaXMucmVhZExpbmVCcmVhaygpO1xuXG4gICAgICAgIGNoID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIGxpbmVCcmVha3MrKztcbiAgICAgICAgdGhpcy5saW5lSW5kZW50ID0gMDtcblxuICAgICAgICB0aGlzLnJlYWRJbmRlbnQoKTtcbiAgICAgICAgY2ggPSB0aGlzLnBlZWsoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChcbiAgICAgIGNoZWNrSW5kZW50ICE9PSAtMSAmJlxuICAgICAgbGluZUJyZWFrcyAhPT0gMCAmJlxuICAgICAgdGhpcy5saW5lSW5kZW50IDwgY2hlY2tJbmRlbnRcbiAgICApIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hXYXJuaW5nKFwiZGVmaWNpZW50IGluZGVudGF0aW9uXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBsaW5lQnJlYWtzO1xuICB9XG4gIHRlc3REb2N1bWVudFNlcGFyYXRvcigpOiBib29sZWFuIHtcbiAgICBsZXQgY2ggPSB0aGlzLnBlZWsoKTtcblxuICAgIC8vIENvbmRpdGlvbiB0aGlzLnBvc2l0aW9uID09PSB0aGlzLmxpbmVTdGFydCBpcyB0ZXN0ZWRcbiAgICAvLyBpbiBwYXJlbnQgb24gZWFjaCBjYWxsLCBmb3IgZWZmaWNpZW5jeS4gTm8gbmVlZHMgdG8gdGVzdCBoZXJlIGFnYWluLlxuICAgIGlmIChcbiAgICAgIChjaCA9PT0gTUlOVVMgfHwgY2ggPT09IERPVCkgJiZcbiAgICAgIGNoID09PSB0aGlzLnBlZWsoMSkgJiZcbiAgICAgIGNoID09PSB0aGlzLnBlZWsoMilcbiAgICApIHtcbiAgICAgIGNoID0gdGhpcy5wZWVrKDMpO1xuXG4gICAgICBpZiAoY2ggPT09IDAgfHwgaXNXaGl0ZVNwYWNlT3JFT0woY2gpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB3cml0ZUZvbGRlZExpbmVzKGNvdW50OiBudW1iZXIpIHtcbiAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgIHRoaXMucmVzdWx0ICs9IFwiIFwiO1xuICAgIH0gZWxzZSBpZiAoY291bnQgPiAxKSB7XG4gICAgICB0aGlzLnJlc3VsdCArPSBcIlxcblwiLnJlcGVhdChjb3VudCAtIDEpO1xuICAgIH1cbiAgfVxuICByZWFkUGxhaW5TY2FsYXIobm9kZUluZGVudDogbnVtYmVyLCB3aXRoaW5GbG93Q29sbGVjdGlvbjogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGtpbmQgPSB0aGlzLmtpbmQ7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5yZXN1bHQ7XG4gICAgbGV0IGNoID0gdGhpcy5wZWVrKCk7XG5cbiAgICBpZiAoXG4gICAgICBpc1doaXRlU3BhY2VPckVPTChjaCkgfHxcbiAgICAgIGlzRmxvd0luZGljYXRvcihjaCkgfHxcbiAgICAgIGNoID09PSBTSEFSUCB8fFxuICAgICAgY2ggPT09IEFNUEVSU0FORCB8fFxuICAgICAgY2ggPT09IEFTVEVSSVNLIHx8XG4gICAgICBjaCA9PT0gRVhDTEFNQVRJT04gfHxcbiAgICAgIGNoID09PSBWRVJUSUNBTF9MSU5FIHx8XG4gICAgICBjaCA9PT0gR1JFQVRFUl9USEFOIHx8XG4gICAgICBjaCA9PT0gU0lOR0xFX1FVT1RFIHx8XG4gICAgICBjaCA9PT0gRE9VQkxFX1FVT1RFIHx8XG4gICAgICBjaCA9PT0gUEVSQ0VOVCB8fFxuICAgICAgY2ggPT09IENPTU1FUkNJQUxfQVQgfHxcbiAgICAgIGNoID09PSBHUkFWRV9BQ0NFTlRcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgZm9sbG93aW5nOiBudW1iZXI7XG4gICAgaWYgKGNoID09PSBRVUVTVElPTiB8fCBjaCA9PT0gTUlOVVMpIHtcbiAgICAgIGZvbGxvd2luZyA9IHRoaXMucGVlaygxKTtcblxuICAgICAgaWYgKFxuICAgICAgICBpc1doaXRlU3BhY2VPckVPTChmb2xsb3dpbmcpIHx8XG4gICAgICAgICh3aXRoaW5GbG93Q29sbGVjdGlvbiAmJiBpc0Zsb3dJbmRpY2F0b3IoZm9sbG93aW5nKSlcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5raW5kID0gXCJzY2FsYXJcIjtcbiAgICB0aGlzLnJlc3VsdCA9IFwiXCI7XG4gICAgbGV0IGNhcHR1cmVFbmQgPSB0aGlzLnBvc2l0aW9uO1xuICAgIGxldCBjYXB0dXJlU3RhcnQgPSB0aGlzLnBvc2l0aW9uO1xuICAgIGxldCBoYXNQZW5kaW5nQ29udGVudCA9IGZhbHNlO1xuICAgIGxldCBsaW5lID0gMDtcbiAgICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICAgIGlmIChjaCA9PT0gQ09MT04pIHtcbiAgICAgICAgZm9sbG93aW5nID0gdGhpcy5wZWVrKDEpO1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBpc1doaXRlU3BhY2VPckVPTChmb2xsb3dpbmcpIHx8XG4gICAgICAgICAgKHdpdGhpbkZsb3dDb2xsZWN0aW9uICYmIGlzRmxvd0luZGljYXRvcihmb2xsb3dpbmcpKVxuICAgICAgICApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChjaCA9PT0gU0hBUlApIHtcbiAgICAgICAgY29uc3QgcHJlY2VkaW5nID0gdGhpcy5wZWVrKC0xKTtcblxuICAgICAgICBpZiAoaXNXaGl0ZVNwYWNlT3JFT0wocHJlY2VkaW5nKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAodGhpcy5wb3NpdGlvbiA9PT0gdGhpcy5saW5lU3RhcnQgJiYgdGhpcy50ZXN0RG9jdW1lbnRTZXBhcmF0b3IoKSkgfHxcbiAgICAgICAgKHdpdGhpbkZsb3dDb2xsZWN0aW9uICYmIGlzRmxvd0luZGljYXRvcihjaCkpXG4gICAgICApIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKGlzRU9MKGNoKSkge1xuICAgICAgICBsaW5lID0gdGhpcy5saW5lO1xuICAgICAgICBjb25zdCBsaW5lU3RhcnQgPSB0aGlzLmxpbmVTdGFydDtcbiAgICAgICAgY29uc3QgbGluZUluZGVudCA9IHRoaXMubGluZUluZGVudDtcbiAgICAgICAgdGhpcy5za2lwU2VwYXJhdGlvblNwYWNlKGZhbHNlLCAtMSk7XG5cbiAgICAgICAgaWYgKHRoaXMubGluZUluZGVudCA+PSBub2RlSW5kZW50KSB7XG4gICAgICAgICAgaGFzUGVuZGluZ0NvbnRlbnQgPSB0cnVlO1xuICAgICAgICAgIGNoID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNhcHR1cmVFbmQ7XG4gICAgICAgICAgdGhpcy5saW5lID0gbGluZTtcbiAgICAgICAgICB0aGlzLmxpbmVTdGFydCA9IGxpbmVTdGFydDtcbiAgICAgICAgICB0aGlzLmxpbmVJbmRlbnQgPSBsaW5lSW5kZW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChoYXNQZW5kaW5nQ29udGVudCkge1xuICAgICAgICB0aGlzLmNhcHR1cmVTZWdtZW50KGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgZmFsc2UpO1xuICAgICAgICB0aGlzLndyaXRlRm9sZGVkTGluZXModGhpcy5saW5lIC0gbGluZSk7XG4gICAgICAgIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSB0aGlzLnBvc2l0aW9uO1xuICAgICAgICBoYXNQZW5kaW5nQ29udGVudCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgICAgY2FwdHVyZUVuZCA9IHRoaXMucG9zaXRpb24gKyAxO1xuICAgICAgfVxuXG4gICAgICBjaCA9IHRoaXMubmV4dCgpO1xuICAgIH1cblxuICAgIHRoaXMuY2FwdHVyZVNlZ21lbnQoY2FwdHVyZVN0YXJ0LCBjYXB0dXJlRW5kLCBmYWxzZSk7XG5cbiAgICBpZiAodGhpcy5yZXN1bHQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMua2luZCA9IGtpbmQ7XG4gICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJlYWRTaW5nbGVRdW90ZWRTY2FsYXIobm9kZUluZGVudDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgbGV0IGNoO1xuICAgIGxldCBjYXB0dXJlU3RhcnQ7XG4gICAgbGV0IGNhcHR1cmVFbmQ7XG5cbiAgICBjaCA9IHRoaXMucGVlaygpO1xuXG4gICAgaWYgKGNoICE9PSBTSU5HTEVfUVVPVEUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmtpbmQgPSBcInNjYWxhclwiO1xuICAgIHRoaXMucmVzdWx0ID0gXCJcIjtcbiAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHRoaXMucG9zaXRpb247XG5cbiAgICB3aGlsZSAoKGNoID0gdGhpcy5wZWVrKCkpICE9PSAwKSB7XG4gICAgICBpZiAoY2ggPT09IFNJTkdMRV9RVU9URSkge1xuICAgICAgICB0aGlzLmNhcHR1cmVTZWdtZW50KGNhcHR1cmVTdGFydCwgdGhpcy5wb3NpdGlvbiwgdHJ1ZSk7XG4gICAgICAgIGNoID0gdGhpcy5uZXh0KCk7XG5cbiAgICAgICAgaWYgKGNoID09PSBTSU5HTEVfUVVPVEUpIHtcbiAgICAgICAgICBjYXB0dXJlU3RhcnQgPSB0aGlzLnBvc2l0aW9uO1xuICAgICAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICAgICAgICBjYXB0dXJlRW5kID0gdGhpcy5wb3NpdGlvbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc0VPTChjaCkpIHtcbiAgICAgICAgdGhpcy5jYXB0dXJlU2VnbWVudChjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQsIHRydWUpO1xuICAgICAgICB0aGlzLndyaXRlRm9sZGVkTGluZXModGhpcy5za2lwU2VwYXJhdGlvblNwYWNlKGZhbHNlLCBub2RlSW5kZW50KSk7XG4gICAgICAgIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSB0aGlzLnBvc2l0aW9uO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9PT0gdGhpcy5saW5lU3RhcnQgJiZcbiAgICAgICAgdGhpcy50ZXN0RG9jdW1lbnRTZXBhcmF0b3IoKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgICAgXCJVbmV4cGVjdGVkIGVuZCBvZiB0aGUgZG9jdW1lbnQgd2l0aGluIGEgc2luZ2xlIHF1b3RlZCBzY2FsYXJcIixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICAgICAgY2FwdHVyZUVuZCA9IHRoaXMucG9zaXRpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgIFwiVW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSBzaW5nbGUgcXVvdGVkIHNjYWxhclwiLFxuICAgICk7XG4gIH1cbiAgcmVhZERvdWJsZVF1b3RlZFNjYWxhcihub2RlSW5kZW50OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBsZXQgY2ggPSB0aGlzLnBlZWsoKTtcblxuICAgIGlmIChjaCAhPT0gRE9VQkxFX1FVT1RFKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5raW5kID0gXCJzY2FsYXJcIjtcbiAgICB0aGlzLnJlc3VsdCA9IFwiXCI7XG4gICAgdGhpcy5wb3NpdGlvbisrO1xuICAgIGxldCBjYXB0dXJlRW5kID0gdGhpcy5wb3NpdGlvbjtcbiAgICBsZXQgY2FwdHVyZVN0YXJ0ID0gdGhpcy5wb3NpdGlvbjtcbiAgICBsZXQgdG1wOiBudW1iZXI7XG4gICAgd2hpbGUgKChjaCA9IHRoaXMucGVlaygpKSAhPT0gMCkge1xuICAgICAgaWYgKGNoID09PSBET1VCTEVfUVVPVEUpIHtcbiAgICAgICAgdGhpcy5jYXB0dXJlU2VnbWVudChjYXB0dXJlU3RhcnQsIHRoaXMucG9zaXRpb24sIHRydWUpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKGNoID09PSBCQUNLU0xBU0gpIHtcbiAgICAgICAgdGhpcy5jYXB0dXJlU2VnbWVudChjYXB0dXJlU3RhcnQsIHRoaXMucG9zaXRpb24sIHRydWUpO1xuICAgICAgICBjaCA9IHRoaXMubmV4dCgpO1xuXG4gICAgICAgIGlmIChpc0VPTChjaCkpIHtcbiAgICAgICAgICB0aGlzLnNraXBTZXBhcmF0aW9uU3BhY2UoZmFsc2UsIG5vZGVJbmRlbnQpO1xuICAgICAgICB9IGVsc2UgaWYgKGNoIDwgMjU2ICYmIFNJTVBMRV9FU0NBUEVfU0VRVUVOQ0VTLmhhcyhjaCkpIHtcbiAgICAgICAgICB0aGlzLnJlc3VsdCArPSBTSU1QTEVfRVNDQVBFX1NFUVVFTkNFUy5nZXQoY2gpO1xuICAgICAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICAgICAgfSBlbHNlIGlmICgodG1wID0gRVNDQVBFRF9IRVhfTEVOR1RIUy5nZXQoY2gpID8/IDApID4gMCkge1xuICAgICAgICAgIGxldCBoZXhMZW5ndGggPSB0bXA7XG4gICAgICAgICAgbGV0IGhleFJlc3VsdCA9IDA7XG5cbiAgICAgICAgICBmb3IgKDsgaGV4TGVuZ3RoID4gMDsgaGV4TGVuZ3RoLS0pIHtcbiAgICAgICAgICAgIGNoID0gdGhpcy5uZXh0KCk7XG5cbiAgICAgICAgICAgIGlmICgodG1wID0gaGV4Q2hhckNvZGVUb051bWJlcihjaCkpID49IDApIHtcbiAgICAgICAgICAgICAgaGV4UmVzdWx0ID0gKGhleFJlc3VsdCA8PCA0KSArIHRtcDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgICAgICAgICAgXCJDYW5ub3QgcmVhZCBkb3VibGUgcXVvdGVkIHNjYWxhcjogZXhwZWN0ZWQgaGV4YWRlY2ltYWwgY2hhcmFjdGVyXCIsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5yZXN1bHQgKz0gY29kZXBvaW50VG9DaGFyKGhleFJlc3VsdCk7XG5cbiAgICAgICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgICAgIFwiQ2Fubm90IHJlYWQgZG91YmxlIHF1b3RlZCBzY2FsYXI6IHVua25vd24gZXNjYXBlIHNlcXVlbmNlXCIsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSB0aGlzLnBvc2l0aW9uO1xuICAgICAgfSBlbHNlIGlmIChpc0VPTChjaCkpIHtcbiAgICAgICAgdGhpcy5jYXB0dXJlU2VnbWVudChjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQsIHRydWUpO1xuICAgICAgICB0aGlzLndyaXRlRm9sZGVkTGluZXModGhpcy5za2lwU2VwYXJhdGlvblNwYWNlKGZhbHNlLCBub2RlSW5kZW50KSk7XG4gICAgICAgIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSB0aGlzLnBvc2l0aW9uO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9PT0gdGhpcy5saW5lU3RhcnQgJiZcbiAgICAgICAgdGhpcy50ZXN0RG9jdW1lbnRTZXBhcmF0b3IoKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgICAgXCJVbmV4cGVjdGVkIGVuZCBvZiB0aGUgZG9jdW1lbnQgd2l0aGluIGEgZG91YmxlIHF1b3RlZCBzY2FsYXJcIixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICAgICAgY2FwdHVyZUVuZCA9IHRoaXMucG9zaXRpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgIFwiVW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSBkb3VibGUgcXVvdGVkIHNjYWxhclwiLFxuICAgICk7XG4gIH1cbiAgcmVhZEZsb3dDb2xsZWN0aW9uKG5vZGVJbmRlbnQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGxldCBjaCA9IHRoaXMucGVlaygpO1xuICAgIGxldCB0ZXJtaW5hdG9yOiBudW1iZXI7XG4gICAgbGV0IGlzTWFwcGluZyA9IHRydWU7XG4gICAgbGV0IHJlc3VsdCA9IHt9O1xuICAgIGlmIChjaCA9PT0gTEVGVF9TUVVBUkVfQlJBQ0tFVCkge1xuICAgICAgdGVybWluYXRvciA9IFJJR0hUX1NRVUFSRV9CUkFDS0VUO1xuICAgICAgaXNNYXBwaW5nID0gZmFsc2U7XG4gICAgICByZXN1bHQgPSBbXTtcbiAgICB9IGVsc2UgaWYgKGNoID09PSBMRUZUX0NVUkxZX0JSQUNLRVQpIHtcbiAgICAgIHRlcm1pbmF0b3IgPSBSSUdIVF9DVVJMWV9CUkFDS0VUO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYW5jaG9yICE9PSBudWxsICYmIHR5cGVvZiB0aGlzLmFuY2hvciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5hbmNob3JNYXAuc2V0KHRoaXMuYW5jaG9yLCByZXN1bHQpO1xuICAgIH1cblxuICAgIGNoID0gdGhpcy5uZXh0KCk7XG5cbiAgICBjb25zdCB0YWcgPSB0aGlzLnRhZztcbiAgICBjb25zdCBhbmNob3IgPSB0aGlzLmFuY2hvcjtcbiAgICBsZXQgcmVhZE5leHQgPSB0cnVlO1xuICAgIGxldCB2YWx1ZU5vZGUgPSBudWxsO1xuICAgIGxldCBrZXlOb2RlID0gbnVsbDtcbiAgICBsZXQga2V5VGFnOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICBsZXQgaXNFeHBsaWNpdFBhaXIgPSBmYWxzZTtcbiAgICBsZXQgaXNQYWlyID0gZmFsc2U7XG4gICAgbGV0IGZvbGxvd2luZyA9IDA7XG4gICAgbGV0IGxpbmUgPSAwO1xuICAgIGNvbnN0IG92ZXJyaWRhYmxlS2V5cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIHdoaWxlIChjaCAhPT0gMCkge1xuICAgICAgdGhpcy5za2lwU2VwYXJhdGlvblNwYWNlKHRydWUsIG5vZGVJbmRlbnQpO1xuXG4gICAgICBjaCA9IHRoaXMucGVlaygpO1xuXG4gICAgICBpZiAoY2ggPT09IHRlcm1pbmF0b3IpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbisrO1xuICAgICAgICB0aGlzLnRhZyA9IHRhZztcbiAgICAgICAgdGhpcy5hbmNob3IgPSBhbmNob3I7XG4gICAgICAgIHRoaXMua2luZCA9IGlzTWFwcGluZyA/IFwibWFwcGluZ1wiIDogXCJzZXF1ZW5jZVwiO1xuICAgICAgICB0aGlzLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoIXJlYWROZXh0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgICAgXCJDYW5ub3QgcmVhZCBmbG93IGNvbGxlY3Rpb246IG1pc3NpbmcgY29tbWEgYmV0d2VlbiBmbG93IGNvbGxlY3Rpb24gZW50cmllc1wiLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBrZXlUYWcgPSBrZXlOb2RlID0gdmFsdWVOb2RlID0gbnVsbDtcbiAgICAgIGlzUGFpciA9IGlzRXhwbGljaXRQYWlyID0gZmFsc2U7XG5cbiAgICAgIGlmIChjaCA9PT0gUVVFU1RJT04pIHtcbiAgICAgICAgZm9sbG93aW5nID0gdGhpcy5wZWVrKDEpO1xuXG4gICAgICAgIGlmIChpc1doaXRlU3BhY2VPckVPTChmb2xsb3dpbmcpKSB7XG4gICAgICAgICAgaXNQYWlyID0gaXNFeHBsaWNpdFBhaXIgPSB0cnVlO1xuICAgICAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICAgICAgICB0aGlzLnNraXBTZXBhcmF0aW9uU3BhY2UodHJ1ZSwgbm9kZUluZGVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGluZSA9IHRoaXMubGluZTtcbiAgICAgIHRoaXMuY29tcG9zZU5vZGUobm9kZUluZGVudCwgQ09OVEVYVF9GTE9XX0lOLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICBrZXlUYWcgPSB0aGlzLnRhZyB8fCBudWxsO1xuICAgICAga2V5Tm9kZSA9IHRoaXMucmVzdWx0O1xuICAgICAgdGhpcy5za2lwU2VwYXJhdGlvblNwYWNlKHRydWUsIG5vZGVJbmRlbnQpO1xuXG4gICAgICBjaCA9IHRoaXMucGVlaygpO1xuXG4gICAgICBpZiAoKGlzRXhwbGljaXRQYWlyIHx8IHRoaXMubGluZSA9PT0gbGluZSkgJiYgY2ggPT09IENPTE9OKSB7XG4gICAgICAgIGlzUGFpciA9IHRydWU7XG4gICAgICAgIGNoID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIHRoaXMuc2tpcFNlcGFyYXRpb25TcGFjZSh0cnVlLCBub2RlSW5kZW50KTtcbiAgICAgICAgdGhpcy5jb21wb3NlTm9kZShub2RlSW5kZW50LCBDT05URVhUX0ZMT1dfSU4sIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgdmFsdWVOb2RlID0gdGhpcy5yZXN1bHQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc01hcHBpbmcpIHtcbiAgICAgICAgdGhpcy5zdG9yZU1hcHBpbmdQYWlyKFxuICAgICAgICAgIHJlc3VsdCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgICAgICAgICBvdmVycmlkYWJsZUtleXMsXG4gICAgICAgICAga2V5VGFnLFxuICAgICAgICAgIGtleU5vZGUsXG4gICAgICAgICAgdmFsdWVOb2RlLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChpc1BhaXIpIHtcbiAgICAgICAgKHJlc3VsdCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPltdKS5wdXNoKFxuICAgICAgICAgIHRoaXMuc3RvcmVNYXBwaW5nUGFpcihcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgb3ZlcnJpZGFibGVLZXlzLFxuICAgICAgICAgICAga2V5VGFnLFxuICAgICAgICAgICAga2V5Tm9kZSxcbiAgICAgICAgICAgIHZhbHVlTm9kZSxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgKHJlc3VsdCBhcyB1bmtub3duW10pLnB1c2goa2V5Tm9kZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2tpcFNlcGFyYXRpb25TcGFjZSh0cnVlLCBub2RlSW5kZW50KTtcblxuICAgICAgY2ggPSB0aGlzLnBlZWsoKTtcblxuICAgICAgaWYgKGNoID09PSBDT01NQSkge1xuICAgICAgICByZWFkTmV4dCA9IHRydWU7XG4gICAgICAgIGNoID0gdGhpcy5uZXh0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWFkTmV4dCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICBcIkNhbm5vdCByZWFkIGZsb3cgY29sbGVjdGlvbjogdW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb25cIixcbiAgICApO1xuICB9XG4gIC8vIEhhbmRsZXMgYmxvY2sgc2NhbGVyIHN0eWxlczogZS5nLiAnfCcsICc+JywgJ3wtJyBhbmQgJz4tJy5cbiAgLy8gaHR0cHM6Ly95YW1sLm9yZy9zcGVjLzEuMi4yLyM4MS1ibG9jay1zY2FsYXItc3R5bGVzXG4gIHJlYWRCbG9ja1NjYWxhcihub2RlSW5kZW50OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBsZXQgY2hvbXBpbmcgPSBDSE9NUElOR19DTElQO1xuICAgIGxldCBkaWRSZWFkQ29udGVudCA9IGZhbHNlO1xuICAgIGxldCBkZXRlY3RlZEluZGVudCA9IGZhbHNlO1xuICAgIGxldCB0ZXh0SW5kZW50ID0gbm9kZUluZGVudDtcbiAgICBsZXQgZW1wdHlMaW5lcyA9IDA7XG4gICAgbGV0IGF0TW9yZUluZGVudGVkID0gZmFsc2U7XG5cbiAgICBsZXQgY2ggPSB0aGlzLnBlZWsoKTtcblxuICAgIGxldCBmb2xkaW5nID0gZmFsc2U7XG4gICAgaWYgKGNoID09PSBWRVJUSUNBTF9MSU5FKSB7XG4gICAgICBmb2xkaW5nID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChjaCA9PT0gR1JFQVRFUl9USEFOKSB7XG4gICAgICBmb2xkaW5nID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMua2luZCA9IFwic2NhbGFyXCI7XG4gICAgdGhpcy5yZXN1bHQgPSBcIlwiO1xuXG4gICAgbGV0IHRtcCA9IDA7XG4gICAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgICBjaCA9IHRoaXMubmV4dCgpO1xuXG4gICAgICBpZiAoY2ggPT09IFBMVVMgfHwgY2ggPT09IE1JTlVTKSB7XG4gICAgICAgIGlmIChDSE9NUElOR19DTElQID09PSBjaG9tcGluZykge1xuICAgICAgICAgIGNob21waW5nID0gY2ggPT09IFBMVVMgPyBDSE9NUElOR19LRUVQIDogQ0hPTVBJTkdfU1RSSVA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgICAgIFwiQ2Fubm90IHJlYWQgYmxvY2s6IGNob21waW5nIG1vZGUgaWRlbnRpZmllciByZXBlYXRlZFwiLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoKHRtcCA9IGRlY2ltYWxDaGFyQ29kZVRvTnVtYmVyKGNoKSkgPj0gMCkge1xuICAgICAgICBpZiAodG1wID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgICAgIFwiQ2Fubm90IHJlYWQgYmxvY2s6IGluZGVudGF0aW9uIHdpZHRoIG11c3QgYmUgZ3JlYXRlciB0aGFuIDBcIixcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKCFkZXRlY3RlZEluZGVudCkge1xuICAgICAgICAgIHRleHRJbmRlbnQgPSBub2RlSW5kZW50ICsgdG1wIC0gMTtcbiAgICAgICAgICBkZXRlY3RlZEluZGVudCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgICAgIFwiQ2Fubm90IHJlYWQgYmxvY2s6IGluZGVudGF0aW9uIHdpZHRoIGlkZW50aWZpZXIgcmVwZWF0ZWRcIixcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgZG8ge1xuICAgICAgICBjaCA9IHRoaXMubmV4dCgpO1xuICAgICAgfSB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSk7XG5cbiAgICAgIGlmIChjaCA9PT0gU0hBUlApIHtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIGNoID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIH0gd2hpbGUgKCFpc0VPTChjaCkgJiYgY2ggIT09IDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHdoaWxlIChjaCAhPT0gMCkge1xuICAgICAgdGhpcy5yZWFkTGluZUJyZWFrKCk7XG4gICAgICB0aGlzLmxpbmVJbmRlbnQgPSAwO1xuXG4gICAgICBjaCA9IHRoaXMucGVlaygpO1xuXG4gICAgICB3aGlsZSAoXG4gICAgICAgICghZGV0ZWN0ZWRJbmRlbnQgfHwgdGhpcy5saW5lSW5kZW50IDwgdGV4dEluZGVudCkgJiZcbiAgICAgICAgY2ggPT09IFNQQUNFXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5saW5lSW5kZW50Kys7XG4gICAgICAgIGNoID0gdGhpcy5uZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghZGV0ZWN0ZWRJbmRlbnQgJiYgdGhpcy5saW5lSW5kZW50ID4gdGV4dEluZGVudCkge1xuICAgICAgICB0ZXh0SW5kZW50ID0gdGhpcy5saW5lSW5kZW50O1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFT0woY2gpKSB7XG4gICAgICAgIGVtcHR5TGluZXMrKztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEVuZCBvZiB0aGUgc2NhbGFyLlxuICAgICAgaWYgKHRoaXMubGluZUluZGVudCA8IHRleHRJbmRlbnQpIHtcbiAgICAgICAgLy8gUGVyZm9ybSB0aGUgY2hvbXBpbmcuXG4gICAgICAgIGlmIChjaG9tcGluZyA9PT0gQ0hPTVBJTkdfS0VFUCkge1xuICAgICAgICAgIHRoaXMucmVzdWx0ICs9IFwiXFxuXCIucmVwZWF0KFxuICAgICAgICAgICAgZGlkUmVhZENvbnRlbnQgPyAxICsgZW1wdHlMaW5lcyA6IGVtcHR5TGluZXMsXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChjaG9tcGluZyA9PT0gQ0hPTVBJTkdfQ0xJUCkge1xuICAgICAgICAgIGlmIChkaWRSZWFkQ29udGVudCkge1xuICAgICAgICAgICAgLy8gaS5lLiBvbmx5IGlmIHRoZSBzY2FsYXIgaXMgbm90IGVtcHR5LlxuICAgICAgICAgICAgdGhpcy5yZXN1bHQgKz0gXCJcXG5cIjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCcmVhayB0aGlzIGB3aGlsZWAgY3ljbGUgYW5kIGdvIHRvIHRoZSBmdW5jdGlvbidzIGVwaWxvZ3VlLlxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gRm9sZGVkIHN0eWxlOiB1c2UgZmFuY3kgcnVsZXMgdG8gaGFuZGxlIGxpbmUgYnJlYWtzLlxuICAgICAgaWYgKGZvbGRpbmcpIHtcbiAgICAgICAgLy8gTGluZXMgc3RhcnRpbmcgd2l0aCB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzIChtb3JlLWluZGVudGVkIGxpbmVzKSBhcmUgbm90IGZvbGRlZC5cbiAgICAgICAgaWYgKGlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgICAgICBhdE1vcmVJbmRlbnRlZCA9IHRydWU7XG4gICAgICAgICAgLy8gZXhjZXB0IGZvciB0aGUgZmlyc3QgY29udGVudCBsaW5lIChjZi4gRXhhbXBsZSA4LjEpXG4gICAgICAgICAgdGhpcy5yZXN1bHQgKz0gXCJcXG5cIi5yZXBlYXQoXG4gICAgICAgICAgICBkaWRSZWFkQ29udGVudCA/IDEgKyBlbXB0eUxpbmVzIDogZW1wdHlMaW5lcyxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gRW5kIG9mIG1vcmUtaW5kZW50ZWQgYmxvY2suXG4gICAgICAgIH0gZWxzZSBpZiAoYXRNb3JlSW5kZW50ZWQpIHtcbiAgICAgICAgICBhdE1vcmVJbmRlbnRlZCA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMucmVzdWx0ICs9IFwiXFxuXCIucmVwZWF0KGVtcHR5TGluZXMgKyAxKTtcblxuICAgICAgICAgIC8vIEp1c3Qgb25lIGxpbmUgYnJlYWsgLSBwZXJjZWl2ZSBhcyB0aGUgc2FtZSBsaW5lLlxuICAgICAgICB9IGVsc2UgaWYgKGVtcHR5TGluZXMgPT09IDApIHtcbiAgICAgICAgICBpZiAoZGlkUmVhZENvbnRlbnQpIHtcbiAgICAgICAgICAgIC8vIGkuZS4gb25seSBpZiB3ZSBoYXZlIGFscmVhZHkgcmVhZCBzb21lIHNjYWxhciBjb250ZW50LlxuICAgICAgICAgICAgdGhpcy5yZXN1bHQgKz0gXCIgXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gU2V2ZXJhbCBsaW5lIGJyZWFrcyAtIHBlcmNlaXZlIGFzIGRpZmZlcmVudCBsaW5lcy5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlc3VsdCArPSBcIlxcblwiLnJlcGVhdChlbXB0eUxpbmVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExpdGVyYWwgc3R5bGU6IGp1c3QgYWRkIGV4YWN0IG51bWJlciBvZiBsaW5lIGJyZWFrcyBiZXR3ZWVuIGNvbnRlbnQgbGluZXMuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBLZWVwIGFsbCBsaW5lIGJyZWFrcyBleGNlcHQgdGhlIGhlYWRlciBsaW5lIGJyZWFrLlxuICAgICAgICB0aGlzLnJlc3VsdCArPSBcIlxcblwiLnJlcGVhdChcbiAgICAgICAgICBkaWRSZWFkQ29udGVudCA/IDEgKyBlbXB0eUxpbmVzIDogZW1wdHlMaW5lcyxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgZGlkUmVhZENvbnRlbnQgPSB0cnVlO1xuICAgICAgZGV0ZWN0ZWRJbmRlbnQgPSB0cnVlO1xuICAgICAgZW1wdHlMaW5lcyA9IDA7XG4gICAgICBjb25zdCBjYXB0dXJlU3RhcnQgPSB0aGlzLnBvc2l0aW9uO1xuXG4gICAgICB3aGlsZSAoIWlzRU9MKGNoKSAmJiBjaCAhPT0gMCkge1xuICAgICAgICBjaCA9IHRoaXMubmV4dCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNhcHR1cmVTZWdtZW50KGNhcHR1cmVTdGFydCwgdGhpcy5wb3NpdGlvbiwgZmFsc2UpO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJlYWRCbG9ja01hcHBpbmcobm9kZUluZGVudDogbnVtYmVyLCBmbG93SW5kZW50OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBjb25zdCB0YWcgPSB0aGlzLnRhZztcbiAgICBjb25zdCBhbmNob3IgPSB0aGlzLmFuY2hvcjtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBjb25zdCBvdmVycmlkYWJsZUtleXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBsZXQgZm9sbG93aW5nOiBudW1iZXI7XG4gICAgbGV0IGFsbG93Q29tcGFjdCA9IGZhbHNlO1xuICAgIGxldCBsaW5lOiBudW1iZXI7XG4gICAgbGV0IHBvczogbnVtYmVyO1xuICAgIGxldCBrZXlUYWcgPSBudWxsO1xuICAgIGxldCBrZXlOb2RlID0gbnVsbDtcbiAgICBsZXQgdmFsdWVOb2RlID0gbnVsbDtcbiAgICBsZXQgYXRFeHBsaWNpdEtleSA9IGZhbHNlO1xuICAgIGxldCBkZXRlY3RlZCA9IGZhbHNlO1xuICAgIGxldCBjaDogbnVtYmVyO1xuXG4gICAgaWYgKHRoaXMuYW5jaG9yICE9PSBudWxsICYmIHR5cGVvZiB0aGlzLmFuY2hvciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5hbmNob3JNYXAuc2V0KHRoaXMuYW5jaG9yLCByZXN1bHQpO1xuICAgIH1cblxuICAgIGNoID0gdGhpcy5wZWVrKCk7XG5cbiAgICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICAgIGZvbGxvd2luZyA9IHRoaXMucGVlaygxKTtcbiAgICAgIGxpbmUgPSB0aGlzLmxpbmU7IC8vIFNhdmUgdGhlIGN1cnJlbnQgbGluZS5cbiAgICAgIHBvcyA9IHRoaXMucG9zaXRpb247XG5cbiAgICAgIC8vXG4gICAgICAvLyBFeHBsaWNpdCBub3RhdGlvbiBjYXNlLiBUaGVyZSBhcmUgdHdvIHNlcGFyYXRlIGJsb2NrczpcbiAgICAgIC8vIGZpcnN0IGZvciB0aGUga2V5IChkZW5vdGVkIGJ5IFwiP1wiKSBhbmQgc2Vjb25kIGZvciB0aGUgdmFsdWUgKGRlbm90ZWQgYnkgXCI6XCIpXG4gICAgICAvL1xuICAgICAgaWYgKChjaCA9PT0gUVVFU1RJT04gfHwgY2ggPT09IENPTE9OKSAmJiBpc1doaXRlU3BhY2VPckVPTChmb2xsb3dpbmcpKSB7XG4gICAgICAgIGlmIChjaCA9PT0gUVVFU1RJT04pIHtcbiAgICAgICAgICBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgICAgICAgICAgdGhpcy5zdG9yZU1hcHBpbmdQYWlyKFxuICAgICAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgICAgIG92ZXJyaWRhYmxlS2V5cyxcbiAgICAgICAgICAgICAga2V5VGFnIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAga2V5Tm9kZSxcbiAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBrZXlUYWcgPSBrZXlOb2RlID0gdmFsdWVOb2RlID0gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkZXRlY3RlZCA9IHRydWU7XG4gICAgICAgICAgYXRFeHBsaWNpdEtleSA9IHRydWU7XG4gICAgICAgICAgYWxsb3dDb21wYWN0ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgICAgICAgLy8gaS5lLiAweDNBLyogOiAqLyA9PT0gY2hhcmFjdGVyIGFmdGVyIHRoZSBleHBsaWNpdCBrZXkuXG4gICAgICAgICAgYXRFeHBsaWNpdEtleSA9IGZhbHNlO1xuICAgICAgICAgIGFsbG93Q29tcGFjdCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgICAgIFwiQ2Fubm90IHJlYWQgYmxvY2sgYXMgZXhwbGljaXQgbWFwcGluZyBwYWlyIGlzIGluY29tcGxldGU6IGEga2V5IG5vZGUgaXMgbWlzc2VkIG9yIGZvbGxvd2VkIGJ5IGEgbm9uLXRhYnVsYXRlZCBlbXB0eSBsaW5lXCIsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gMTtcbiAgICAgICAgY2ggPSBmb2xsb3dpbmc7XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gSW1wbGljaXQgbm90YXRpb24gY2FzZS4gRmxvdy1zdHlsZSBub2RlIGFzIHRoZSBrZXkgZmlyc3QsIHRoZW4gXCI6XCIsIGFuZCB0aGUgdmFsdWUuXG4gICAgICAgIC8vXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuY29tcG9zZU5vZGUoZmxvd0luZGVudCwgQ09OVEVYVF9GTE9XX09VVCwgZmFsc2UsIHRydWUpKSB7XG4gICAgICAgIGlmICh0aGlzLmxpbmUgPT09IGxpbmUpIHtcbiAgICAgICAgICBjaCA9IHRoaXMucGVlaygpO1xuXG4gICAgICAgICAgd2hpbGUgKGlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgICAgICAgIGNoID0gdGhpcy5uZXh0KCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNoID09PSBDT0xPTikge1xuICAgICAgICAgICAgY2ggPSB0aGlzLm5leHQoKTtcblxuICAgICAgICAgICAgaWYgKCFpc1doaXRlU3BhY2VPckVPTChjaCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgICAgICAgICBcIkNhbm5vdCByZWFkIGJsb2NrOiBhIHdoaXRlc3BhY2UgY2hhcmFjdGVyIGlzIGV4cGVjdGVkIGFmdGVyIHRoZSBrZXktdmFsdWUgc2VwYXJhdG9yIHdpdGhpbiBhIGJsb2NrIG1hcHBpbmdcIixcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgICAgICAgdGhpcy5zdG9yZU1hcHBpbmdQYWlyKFxuICAgICAgICAgICAgICAgIHJlc3VsdCxcbiAgICAgICAgICAgICAgICBvdmVycmlkYWJsZUtleXMsXG4gICAgICAgICAgICAgICAga2V5VGFnIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBrZXlOb2RlLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIGtleVRhZyA9IGtleU5vZGUgPSB2YWx1ZU5vZGUgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkZXRlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICBhbGxvd0NvbXBhY3QgPSBmYWxzZTtcbiAgICAgICAgICAgIGtleVRhZyA9IHRoaXMudGFnO1xuICAgICAgICAgICAga2V5Tm9kZSA9IHRoaXMucmVzdWx0O1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGV0ZWN0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgICAgICAgIFwiQ2Fubm90IHJlYWQgYW4gaW1wbGljaXQgbWFwcGluZyBwYWlyOiBtaXNzaW5nIGNvbG9uXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRhZyA9IHRhZztcbiAgICAgICAgICAgIHRoaXMuYW5jaG9yID0gYW5jaG9yO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIEtlZXAgdGhlIHJlc3VsdCBvZiBgY29tcG9zZU5vZGVgLlxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkZXRlY3RlZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgICAgICBcIkNhbm5vdCByZWFkIGEgYmxvY2sgbWFwcGluZyBlbnRyeTogYSBtdWx0aWxpbmUga2V5IG1heSBub3QgYmUgYW4gaW1wbGljaXQga2V5XCIsXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnRhZyA9IHRhZztcbiAgICAgICAgICB0aGlzLmFuY2hvciA9IGFuY2hvcjtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gS2VlcCB0aGUgcmVzdWx0IG9mIGBjb21wb3NlTm9kZWAuXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrOyAvLyBSZWFkaW5nIGlzIGRvbmUuIEdvIHRvIHRoZSBlcGlsb2d1ZS5cbiAgICAgIH1cblxuICAgICAgLy9cbiAgICAgIC8vIENvbW1vbiByZWFkaW5nIGNvZGUgZm9yIGJvdGggZXhwbGljaXQgYW5kIGltcGxpY2l0IG5vdGF0aW9ucy5cbiAgICAgIC8vXG4gICAgICBpZiAodGhpcy5saW5lID09PSBsaW5lIHx8IHRoaXMubGluZUluZGVudCA+IG5vZGVJbmRlbnQpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHRoaXMuY29tcG9zZU5vZGUobm9kZUluZGVudCwgQ09OVEVYVF9CTE9DS19PVVQsIHRydWUsIGFsbG93Q29tcGFjdClcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgICAgIGtleU5vZGUgPSB0aGlzLnJlc3VsdDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWVOb2RlID0gdGhpcy5yZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFhdEV4cGxpY2l0S2V5KSB7XG4gICAgICAgICAgdGhpcy5zdG9yZU1hcHBpbmdQYWlyKFxuICAgICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgICAgb3ZlcnJpZGFibGVLZXlzLFxuICAgICAgICAgICAga2V5VGFnIGFzIHN0cmluZyxcbiAgICAgICAgICAgIGtleU5vZGUsXG4gICAgICAgICAgICB2YWx1ZU5vZGUsXG4gICAgICAgICAgICBsaW5lLFxuICAgICAgICAgICAgcG9zLFxuICAgICAgICAgICk7XG4gICAgICAgICAga2V5VGFnID0ga2V5Tm9kZSA9IHZhbHVlTm9kZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNraXBTZXBhcmF0aW9uU3BhY2UodHJ1ZSwgLTEpO1xuICAgICAgICBjaCA9IHRoaXMucGVlaygpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5saW5lSW5kZW50ID4gbm9kZUluZGVudCAmJiBjaCAhPT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aHJvd0Vycm9yKFxuICAgICAgICAgIFwiQ2Fubm90IHJlYWQgYmxvY2s6IGJhZCBpbmRlbnRhdGlvbiBvZiBhIG1hcHBpbmcgZW50cnlcIixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5saW5lSW5kZW50IDwgbm9kZUluZGVudCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIEVwaWxvZ3VlLlxuICAgIC8vXG5cbiAgICAvLyBTcGVjaWFsIGNhc2U6IGxhc3QgbWFwcGluZydzIG5vZGUgY29udGFpbnMgb25seSB0aGUga2V5IGluIGV4cGxpY2l0IG5vdGF0aW9uLlxuICAgIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgICB0aGlzLnN0b3JlTWFwcGluZ1BhaXIoXG4gICAgICAgIHJlc3VsdCxcbiAgICAgICAgb3ZlcnJpZGFibGVLZXlzLFxuICAgICAgICBrZXlUYWcgYXMgc3RyaW5nLFxuICAgICAgICBrZXlOb2RlLFxuICAgICAgICBudWxsLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBFeHBvc2UgdGhlIHJlc3VsdGluZyBtYXBwaW5nLlxuICAgIGlmIChkZXRlY3RlZCkge1xuICAgICAgdGhpcy50YWcgPSB0YWc7XG4gICAgICB0aGlzLmFuY2hvciA9IGFuY2hvcjtcbiAgICAgIHRoaXMua2luZCA9IFwibWFwcGluZ1wiO1xuICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRldGVjdGVkO1xuICB9XG4gIHJlYWRUYWdQcm9wZXJ0eSgpOiBib29sZWFuIHtcbiAgICBsZXQgcG9zaXRpb246IG51bWJlcjtcbiAgICBsZXQgaXNWZXJiYXRpbSA9IGZhbHNlO1xuICAgIGxldCBpc05hbWVkID0gZmFsc2U7XG4gICAgbGV0IHRhZ0hhbmRsZSA9IFwiXCI7XG4gICAgbGV0IHRhZ05hbWU6IHN0cmluZztcbiAgICBsZXQgY2g6IG51bWJlcjtcblxuICAgIGNoID0gdGhpcy5wZWVrKCk7XG5cbiAgICBpZiAoY2ggIT09IEVYQ0xBTUFUSU9OKSByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAodGhpcy50YWcgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgIFwiQ2Fubm90IHJlYWQgdGFnIHByb3BlcnR5OiBkdXBsaWNhdGlvbiBvZiBhIHRhZyBwcm9wZXJ0eVwiLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjaCA9IHRoaXMubmV4dCgpO1xuXG4gICAgaWYgKGNoID09PSBTTUFMTEVSX1RIQU4pIHtcbiAgICAgIGlzVmVyYmF0aW0gPSB0cnVlO1xuICAgICAgY2ggPSB0aGlzLm5leHQoKTtcbiAgICB9IGVsc2UgaWYgKGNoID09PSBFWENMQU1BVElPTikge1xuICAgICAgaXNOYW1lZCA9IHRydWU7XG4gICAgICB0YWdIYW5kbGUgPSBcIiEhXCI7XG4gICAgICBjaCA9IHRoaXMubmV4dCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YWdIYW5kbGUgPSBcIiFcIjtcbiAgICB9XG5cbiAgICBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XG5cbiAgICBpZiAoaXNWZXJiYXRpbSkge1xuICAgICAgZG8ge1xuICAgICAgICBjaCA9IHRoaXMubmV4dCgpO1xuICAgICAgfSB3aGlsZSAoY2ggIT09IDAgJiYgY2ggIT09IEdSRUFURVJfVEhBTik7XG5cbiAgICAgIGlmICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5sZW5ndGgpIHtcbiAgICAgICAgdGFnTmFtZSA9IHRoaXMuaW5wdXQuc2xpY2UocG9zaXRpb24sIHRoaXMucG9zaXRpb24pO1xuICAgICAgICBjaCA9IHRoaXMubmV4dCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgICBcIkNhbm5vdCByZWFkIHRhZyBwcm9wZXJ0eTogdW5leHBlY3RlZCBlbmQgb2Ygc3RyZWFtXCIsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNXaGl0ZVNwYWNlT3JFT0woY2gpKSB7XG4gICAgICAgIGlmIChjaCA9PT0gRVhDTEFNQVRJT04pIHtcbiAgICAgICAgICBpZiAoIWlzTmFtZWQpIHtcbiAgICAgICAgICAgIHRhZ0hhbmRsZSA9IHRoaXMuaW5wdXQuc2xpY2UocG9zaXRpb24gLSAxLCB0aGlzLnBvc2l0aW9uICsgMSk7XG5cbiAgICAgICAgICAgIGlmICghUEFUVEVSTl9UQUdfSEFORExFLnRlc3QodGFnSGFuZGxlKSkge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy50aHJvd0Vycm9yKFxuICAgICAgICAgICAgICAgIFwiQ2Fubm90IHJlYWQgdGFnIHByb3BlcnR5OiBuYW1lZCB0YWcgaGFuZGxlIGNvbnRhaW5zIGludmFsaWQgY2hhcmFjdGVyc1wiLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpc05hbWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbiArIDE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgICAgICAgIFwiQ2Fubm90IHJlYWQgdGFnIHByb3BlcnR5OiB0YWcgc3VmZml4IGNhbm5vdCBjb250YWluIGFuIGV4Y2xhbWF0aW9uIG1hcmtcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2ggPSB0aGlzLm5leHQoKTtcbiAgICAgIH1cblxuICAgICAgdGFnTmFtZSA9IHRoaXMuaW5wdXQuc2xpY2UocG9zaXRpb24sIHRoaXMucG9zaXRpb24pO1xuXG4gICAgICBpZiAoUEFUVEVSTl9GTE9XX0lORElDQVRPUlMudGVzdCh0YWdOYW1lKSkge1xuICAgICAgICByZXR1cm4gdGhpcy50aHJvd0Vycm9yKFxuICAgICAgICAgIFwiQ2Fubm90IHJlYWQgdGFnIHByb3BlcnR5OiB0YWcgc3VmZml4IGNhbm5vdCBjb250YWluIGZsb3cgaW5kaWNhdG9yIGNoYXJhY3RlcnNcIixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGFnTmFtZSAmJiAhUEFUVEVSTl9UQUdfVVJJLnRlc3QodGFnTmFtZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgIGBDYW5ub3QgcmVhZCB0YWcgcHJvcGVydHk6IGludmFsaWQgY2hhcmFjdGVycyBpbiB0YWcgbmFtZSBcIiR7dGFnTmFtZX1cImAsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChpc1ZlcmJhdGltKSB7XG4gICAgICB0aGlzLnRhZyA9IHRhZ05hbWU7XG4gICAgfSBlbHNlIGlmICh0aGlzLnRhZ01hcC5oYXModGFnSGFuZGxlKSkge1xuICAgICAgdGhpcy50YWcgPSB0aGlzLnRhZ01hcC5nZXQodGFnSGFuZGxlKSArIHRhZ05hbWU7XG4gICAgfSBlbHNlIGlmICh0YWdIYW5kbGUgPT09IFwiIVwiKSB7XG4gICAgICB0aGlzLnRhZyA9IGAhJHt0YWdOYW1lfWA7XG4gICAgfSBlbHNlIGlmICh0YWdIYW5kbGUgPT09IFwiISFcIikge1xuICAgICAgdGhpcy50YWcgPSBgdGFnOnlhbWwub3JnLDIwMDI6JHt0YWdOYW1lfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgIGBDYW5ub3QgcmVhZCB0YWcgcHJvcGVydHk6IHVuZGVjbGFyZWQgdGFnIGhhbmRsZSBcIiR7dGFnSGFuZGxlfVwiYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmVhZEFuY2hvclByb3BlcnR5KCk6IGJvb2xlYW4ge1xuICAgIGxldCBjaCA9IHRoaXMucGVlaygpO1xuICAgIGlmIChjaCAhPT0gQU1QRVJTQU5EKSByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgIFwiQ2Fubm90IHJlYWQgYW5jaG9yIHByb3BlcnR5OiBkdXBsaWNhdGUgYW5jaG9yIHByb3BlcnR5XCIsXG4gICAgICApO1xuICAgIH1cbiAgICBjaCA9IHRoaXMubmV4dCgpO1xuXG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xuICAgIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNXaGl0ZVNwYWNlT3JFT0woY2gpICYmICFpc0Zsb3dJbmRpY2F0b3IoY2gpKSB7XG4gICAgICBjaCA9IHRoaXMubmV4dCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnBvc2l0aW9uID09PSBwb3NpdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgXCJDYW5ub3QgcmVhZCBhbmNob3IgcHJvcGVydHk6IG5hbWUgb2YgYW4gYW5jaG9yIG5vZGUgbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBjaGFyYWN0ZXJcIixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5hbmNob3IgPSB0aGlzLmlucHV0LnNsaWNlKHBvc2l0aW9uLCB0aGlzLnBvc2l0aW9uKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZWFkQWxpYXMoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMucGVlaygpICE9PSBBU1RFUklTSykgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IGNoID0gdGhpcy5uZXh0KCk7XG5cbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XG5cbiAgICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzV2hpdGVTcGFjZU9yRU9MKGNoKSAmJiAhaXNGbG93SW5kaWNhdG9yKGNoKSkge1xuICAgICAgY2ggPSB0aGlzLm5leHQoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wb3NpdGlvbiA9PT0gcG9zaXRpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgIFwiQ2Fubm90IHJlYWQgYWxpYXM6IGFsaWFzIG5hbWUgbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBjaGFyYWN0ZXJcIixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgYWxpYXMgPSB0aGlzLmlucHV0LnNsaWNlKHBvc2l0aW9uLCB0aGlzLnBvc2l0aW9uKTtcbiAgICBpZiAoIXRoaXMuYW5jaG9yTWFwLmhhcyhhbGlhcykpIHtcbiAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgIGBDYW5ub3QgcmVhZCBhbGlhczogdW5pZGVudGlmaWVkIGFsaWFzIFwiJHthbGlhc31cImAsXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMucmVzdWx0ID0gdGhpcy5hbmNob3JNYXAuZ2V0KGFsaWFzKTtcbiAgICB0aGlzLnNraXBTZXBhcmF0aW9uU3BhY2UodHJ1ZSwgLTEpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY29tcG9zZU5vZGUoXG4gICAgcGFyZW50SW5kZW50OiBudW1iZXIsXG4gICAgbm9kZUNvbnRleHQ6IG51bWJlcixcbiAgICBhbGxvd1RvU2VlazogYm9vbGVhbixcbiAgICBhbGxvd0NvbXBhY3Q6IGJvb2xlYW4sXG4gICk6IGJvb2xlYW4ge1xuICAgIGxldCBhbGxvd0Jsb2NrU2NhbGFyczogYm9vbGVhbjtcbiAgICBsZXQgYWxsb3dCbG9ja0NvbGxlY3Rpb25zOiBib29sZWFuO1xuICAgIGxldCBpbmRlbnRTdGF0dXMgPSAxOyAvLyAxOiB0aGlzPnBhcmVudCwgMDogdGhpcz1wYXJlbnQsIC0xOiB0aGlzPHBhcmVudFxuICAgIGxldCBhdE5ld0xpbmUgPSBmYWxzZTtcbiAgICBsZXQgaGFzQ29udGVudCA9IGZhbHNlO1xuICAgIGxldCB0eXBlOiBUeXBlPEtpbmRUeXBlPjtcbiAgICBsZXQgZmxvd0luZGVudDogbnVtYmVyO1xuICAgIGxldCBibG9ja0luZGVudDogbnVtYmVyO1xuXG4gICAgdGhpcy50YWcgPSBudWxsO1xuICAgIHRoaXMuYW5jaG9yID0gbnVsbDtcbiAgICB0aGlzLmtpbmQgPSBudWxsO1xuICAgIHRoaXMucmVzdWx0ID0gbnVsbDtcblxuICAgIGNvbnN0IGFsbG93QmxvY2tTdHlsZXMgPSAoYWxsb3dCbG9ja1NjYWxhcnMgPVxuICAgICAgYWxsb3dCbG9ja0NvbGxlY3Rpb25zID1cbiAgICAgICAgQ09OVEVYVF9CTE9DS19PVVQgPT09IG5vZGVDb250ZXh0IHx8IENPTlRFWFRfQkxPQ0tfSU4gPT09IG5vZGVDb250ZXh0KTtcblxuICAgIGlmIChhbGxvd1RvU2Vlaykge1xuICAgICAgaWYgKHRoaXMuc2tpcFNlcGFyYXRpb25TcGFjZSh0cnVlLCAtMSkpIHtcbiAgICAgICAgYXROZXdMaW5lID0gdHJ1ZTtcblxuICAgICAgICBpZiAodGhpcy5saW5lSW5kZW50ID4gcGFyZW50SW5kZW50KSB7XG4gICAgICAgICAgaW5kZW50U3RhdHVzID0gMTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmxpbmVJbmRlbnQgPT09IHBhcmVudEluZGVudCkge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5saW5lSW5kZW50IDwgcGFyZW50SW5kZW50KSB7XG4gICAgICAgICAgaW5kZW50U3RhdHVzID0gLTE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW5kZW50U3RhdHVzID09PSAxKSB7XG4gICAgICB3aGlsZSAodGhpcy5yZWFkVGFnUHJvcGVydHkoKSB8fCB0aGlzLnJlYWRBbmNob3JQcm9wZXJ0eSgpKSB7XG4gICAgICAgIGlmICh0aGlzLnNraXBTZXBhcmF0aW9uU3BhY2UodHJ1ZSwgLTEpKSB7XG4gICAgICAgICAgYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgICBhbGxvd0Jsb2NrQ29sbGVjdGlvbnMgPSBhbGxvd0Jsb2NrU3R5bGVzO1xuXG4gICAgICAgICAgaWYgKHRoaXMubGluZUluZGVudCA+IHBhcmVudEluZGVudCkge1xuICAgICAgICAgICAgaW5kZW50U3RhdHVzID0gMTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMubGluZUluZGVudCA9PT0gcGFyZW50SW5kZW50KSB7XG4gICAgICAgICAgICBpbmRlbnRTdGF0dXMgPSAwO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5saW5lSW5kZW50IDwgcGFyZW50SW5kZW50KSB7XG4gICAgICAgICAgICBpbmRlbnRTdGF0dXMgPSAtMTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWxsb3dCbG9ja0NvbGxlY3Rpb25zID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYWxsb3dCbG9ja0NvbGxlY3Rpb25zKSB7XG4gICAgICBhbGxvd0Jsb2NrQ29sbGVjdGlvbnMgPSBhdE5ld0xpbmUgfHwgYWxsb3dDb21wYWN0O1xuICAgIH1cblxuICAgIGlmIChpbmRlbnRTdGF0dXMgPT09IDEgfHwgQ09OVEVYVF9CTE9DS19PVVQgPT09IG5vZGVDb250ZXh0KSB7XG4gICAgICBjb25zdCBjb25kID0gQ09OVEVYVF9GTE9XX0lOID09PSBub2RlQ29udGV4dCB8fFxuICAgICAgICBDT05URVhUX0ZMT1dfT1VUID09PSBub2RlQ29udGV4dDtcbiAgICAgIGZsb3dJbmRlbnQgPSBjb25kID8gcGFyZW50SW5kZW50IDogcGFyZW50SW5kZW50ICsgMTtcblxuICAgICAgYmxvY2tJbmRlbnQgPSB0aGlzLnBvc2l0aW9uIC0gdGhpcy5saW5lU3RhcnQ7XG5cbiAgICAgIGlmIChpbmRlbnRTdGF0dXMgPT09IDEpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIChhbGxvd0Jsb2NrQ29sbGVjdGlvbnMgJiZcbiAgICAgICAgICAgICh0aGlzLnJlYWRCbG9ja1NlcXVlbmNlKGJsb2NrSW5kZW50KSB8fFxuICAgICAgICAgICAgICB0aGlzLnJlYWRCbG9ja01hcHBpbmcoYmxvY2tJbmRlbnQsIGZsb3dJbmRlbnQpKSkgfHxcbiAgICAgICAgICB0aGlzLnJlYWRGbG93Q29sbGVjdGlvbihmbG93SW5kZW50KVxuICAgICAgICApIHtcbiAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAoYWxsb3dCbG9ja1NjYWxhcnMgJiYgdGhpcy5yZWFkQmxvY2tTY2FsYXIoZmxvd0luZGVudCkpIHx8XG4gICAgICAgICAgICB0aGlzLnJlYWRTaW5nbGVRdW90ZWRTY2FsYXIoZmxvd0luZGVudCkgfHxcbiAgICAgICAgICAgIHRoaXMucmVhZERvdWJsZVF1b3RlZFNjYWxhcihmbG93SW5kZW50KVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgaGFzQ29udGVudCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlYWRBbGlhcygpKSB7XG4gICAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudGFnICE9PSBudWxsIHx8IHRoaXMuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgICAgICAgICAgXCJDYW5ub3QgY29tcG9zZSBub2RlOiBhbGlhcyBub2RlIHNob3VsZCBub3QgaGF2ZSBhbnkgcHJvcGVydGllc1wiLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICB0aGlzLnJlYWRQbGFpblNjYWxhcihmbG93SW5kZW50LCBDT05URVhUX0ZMT1dfSU4gPT09IG5vZGVDb250ZXh0KVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgaGFzQ29udGVudCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnRhZyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICB0aGlzLnRhZyA9IFwiP1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5hbmNob3JNYXAuc2V0KHRoaXMuYW5jaG9yLCB0aGlzLnJlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGluZGVudFN0YXR1cyA9PT0gMCkge1xuICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IGJsb2NrIHNlcXVlbmNlcyBhcmUgYWxsb3dlZCB0byBoYXZlIHNhbWUgaW5kZW50YXRpb24gbGV2ZWwgYXMgdGhlIHBhcmVudC5cbiAgICAgICAgLy8gaHR0cDovL3d3dy55YW1sLm9yZy9zcGVjLzEuMi9zcGVjLmh0bWwjaWQyNzk5Nzg0XG4gICAgICAgIGhhc0NvbnRlbnQgPSBhbGxvd0Jsb2NrQ29sbGVjdGlvbnMgJiZcbiAgICAgICAgICB0aGlzLnJlYWRCbG9ja1NlcXVlbmNlKGJsb2NrSW5kZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy50YWcgIT09IG51bGwgJiYgdGhpcy50YWcgIT09IFwiIVwiKSB7XG4gICAgICBpZiAodGhpcy50YWcgPT09IFwiP1wiKSB7XG4gICAgICAgIGZvciAoXG4gICAgICAgICAgbGV0IHR5cGVJbmRleCA9IDA7XG4gICAgICAgICAgdHlwZUluZGV4IDwgdGhpcy5pbXBsaWNpdFR5cGVzLmxlbmd0aDtcbiAgICAgICAgICB0eXBlSW5kZXgrK1xuICAgICAgICApIHtcbiAgICAgICAgICB0eXBlID0gdGhpcy5pbXBsaWNpdFR5cGVzW3R5cGVJbmRleF0hO1xuXG4gICAgICAgICAgLy8gSW1wbGljaXQgcmVzb2x2aW5nIGlzIG5vdCBhbGxvd2VkIGZvciBub24tc2NhbGFyIHR5cGVzLCBhbmQgJz8nXG4gICAgICAgICAgLy8gbm9uLXNwZWNpZmljIHRhZyBpcyBvbmx5IGFzc2lnbmVkIHRvIHBsYWluIHNjYWxhcnMuIFNvLCBpdCBpc24ndFxuICAgICAgICAgIC8vIG5lZWRlZCB0byBjaGVjayBmb3IgJ2tpbmQnIGNvbmZvcm1pdHkuXG5cbiAgICAgICAgICBpZiAodHlwZS5yZXNvbHZlKHRoaXMucmVzdWx0KSkge1xuICAgICAgICAgICAgLy8gYHN0YXRlLnJlc3VsdGAgdXBkYXRlZCBpbiByZXNvbHZlciBpZiBtYXRjaGVkXG4gICAgICAgICAgICB0aGlzLnJlc3VsdCA9IHR5cGUuY29uc3RydWN0KHRoaXMucmVzdWx0KTtcbiAgICAgICAgICAgIHRoaXMudGFnID0gdHlwZS50YWc7XG4gICAgICAgICAgICBpZiAodGhpcy5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhpcy5hbmNob3JNYXAuc2V0KHRoaXMuYW5jaG9yLCB0aGlzLnJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy50eXBlTWFwW3RoaXMua2luZCA/PyBcImZhbGxiYWNrXCJdLmhhcyh0aGlzLnRhZykpIHtcbiAgICAgICAgY29uc3QgbWFwID0gdGhpcy50eXBlTWFwW3RoaXMua2luZCA/PyBcImZhbGxiYWNrXCJdO1xuICAgICAgICB0eXBlID0gbWFwLmdldCh0aGlzLnRhZykhO1xuXG4gICAgICAgIGlmICh0aGlzLnJlc3VsdCAhPT0gbnVsbCAmJiB0eXBlLmtpbmQgIT09IHRoaXMua2luZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgICAgICBgVW5hY2NlcHRhYmxlIG5vZGUga2luZCBmb3IgITwke3RoaXMudGFnfT4gdGFnOiBpdCBzaG91bGQgYmUgXCIke3R5cGUua2luZH1cIiwgbm90IFwiJHt0aGlzLmtpbmR9XCJgLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXR5cGUucmVzb2x2ZSh0aGlzLnJlc3VsdCkpIHtcbiAgICAgICAgICAvLyBgc3RhdGUucmVzdWx0YCB1cGRhdGVkIGluIHJlc29sdmVyIGlmIG1hdGNoZWRcbiAgICAgICAgICByZXR1cm4gdGhpcy50aHJvd0Vycm9yKFxuICAgICAgICAgICAgYENhbm5vdCByZXNvbHZlIGEgbm9kZSB3aXRoICE8JHt0aGlzLnRhZ30+IGV4cGxpY2l0IHRhZ2AsXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlc3VsdCA9IHR5cGUuY29uc3RydWN0KHRoaXMucmVzdWx0KTtcbiAgICAgICAgICBpZiAodGhpcy5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuYW5jaG9yTWFwLnNldCh0aGlzLmFuY2hvciwgdGhpcy5yZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihgQ2Fubm90IHJlc29sdmUgdW5rbm93biB0YWcgITwke3RoaXMudGFnfT5gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50YWcgIT09IG51bGwgfHwgdGhpcy5hbmNob3IgIT09IG51bGwgfHwgaGFzQ29udGVudDtcbiAgfVxuXG4gIHJlYWREb2N1bWVudCgpIHtcbiAgICBjb25zdCBkb2N1bWVudFN0YXJ0ID0gdGhpcy5wb3NpdGlvbjtcbiAgICBsZXQgcG9zaXRpb246IG51bWJlcjtcbiAgICBsZXQgZGlyZWN0aXZlTmFtZTogc3RyaW5nO1xuICAgIGxldCBkaXJlY3RpdmVBcmdzOiBzdHJpbmdbXTtcbiAgICBsZXQgaGFzRGlyZWN0aXZlcyA9IGZhbHNlO1xuICAgIGxldCBjaDogbnVtYmVyO1xuXG4gICAgdGhpcy52ZXJzaW9uID0gbnVsbDtcbiAgICB0aGlzLmNoZWNrTGluZUJyZWFrcyA9IGZhbHNlO1xuICAgIHRoaXMudGFnTWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuYW5jaG9yTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgd2hpbGUgKChjaCA9IHRoaXMucGVlaygpKSAhPT0gMCkge1xuICAgICAgdGhpcy5za2lwU2VwYXJhdGlvblNwYWNlKHRydWUsIC0xKTtcblxuICAgICAgY2ggPSB0aGlzLnBlZWsoKTtcblxuICAgICAgaWYgKHRoaXMubGluZUluZGVudCA+IDAgfHwgY2ggIT09IFBFUkNFTlQpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlO1xuICAgICAgY2ggPSB0aGlzLm5leHQoKTtcbiAgICAgIHBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbjtcblxuICAgICAgd2hpbGUgKGNoICE9PSAwICYmICFpc1doaXRlU3BhY2VPckVPTChjaCkpIHtcbiAgICAgICAgY2ggPSB0aGlzLm5leHQoKTtcbiAgICAgIH1cblxuICAgICAgZGlyZWN0aXZlTmFtZSA9IHRoaXMuaW5wdXQuc2xpY2UocG9zaXRpb24sIHRoaXMucG9zaXRpb24pO1xuICAgICAgZGlyZWN0aXZlQXJncyA9IFtdO1xuXG4gICAgICBpZiAoZGlyZWN0aXZlTmFtZS5sZW5ndGggPCAxKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgICAgXCJDYW5ub3QgcmVhZCBkb2N1bWVudDogZGlyZWN0aXZlIG5hbWUgbGVuZ3RoIG11c3QgYmUgZ3JlYXRlciB0aGFuIHplcm9cIixcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgICAgIHdoaWxlIChpc1doaXRlU3BhY2UoY2gpKSB7XG4gICAgICAgICAgY2ggPSB0aGlzLm5leHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaCA9PT0gU0hBUlApIHtcbiAgICAgICAgICBkbyB7XG4gICAgICAgICAgICBjaCA9IHRoaXMubmV4dCgpO1xuICAgICAgICAgIH0gd2hpbGUgKGNoICE9PSAwICYmICFpc0VPTChjaCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzRU9MKGNoKSkgYnJlYWs7XG5cbiAgICAgICAgcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xuXG4gICAgICAgIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNXaGl0ZVNwYWNlT3JFT0woY2gpKSB7XG4gICAgICAgICAgY2ggPSB0aGlzLm5leHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpcmVjdGl2ZUFyZ3MucHVzaCh0aGlzLmlucHV0LnNsaWNlKHBvc2l0aW9uLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjaCAhPT0gMCkgdGhpcy5yZWFkTGluZUJyZWFrKCk7XG5cbiAgICAgIHN3aXRjaCAoZGlyZWN0aXZlTmFtZSkge1xuICAgICAgICBjYXNlIFwiWUFNTFwiOlxuICAgICAgICAgIHRoaXMueWFtbERpcmVjdGl2ZUhhbmRsZXIoLi4uZGlyZWN0aXZlQXJncyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJUQUdcIjpcbiAgICAgICAgICB0aGlzLnRhZ0RpcmVjdGl2ZUhhbmRsZXIoLi4uZGlyZWN0aXZlQXJncyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaFdhcm5pbmcoXG4gICAgICAgICAgICBgdW5rbm93biBkb2N1bWVudCBkaXJlY3RpdmUgXCIke2RpcmVjdGl2ZU5hbWV9XCJgLFxuICAgICAgICAgICk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5za2lwU2VwYXJhdGlvblNwYWNlKHRydWUsIC0xKTtcblxuICAgIGlmIChcbiAgICAgIHRoaXMubGluZUluZGVudCA9PT0gMCAmJlxuICAgICAgdGhpcy5wZWVrKCkgPT09IE1JTlVTICYmXG4gICAgICB0aGlzLnBlZWsoMSkgPT09IE1JTlVTICYmXG4gICAgICB0aGlzLnBlZWsoMikgPT09IE1JTlVTXG4gICAgKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDM7XG4gICAgICB0aGlzLnNraXBTZXBhcmF0aW9uU3BhY2UodHJ1ZSwgLTEpO1xuICAgIH0gZWxzZSBpZiAoaGFzRGlyZWN0aXZlcykge1xuICAgICAgcmV0dXJuIHRoaXMudGhyb3dFcnJvcihcbiAgICAgICAgXCJDYW5ub3QgcmVhZCBkb2N1bWVudDogZGlyZWN0aXZlcyBlbmQgbWFyayBpcyBleHBlY3RlZFwiLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbXBvc2VOb2RlKHRoaXMubGluZUluZGVudCAtIDEsIENPTlRFWFRfQkxPQ0tfT1VULCBmYWxzZSwgdHJ1ZSk7XG4gICAgdGhpcy5za2lwU2VwYXJhdGlvblNwYWNlKHRydWUsIC0xKTtcblxuICAgIGlmIChcbiAgICAgIHRoaXMuY2hlY2tMaW5lQnJlYWtzICYmXG4gICAgICBQQVRURVJOX05PTl9BU0NJSV9MSU5FX0JSRUFLUy50ZXN0KFxuICAgICAgICB0aGlzLmlucHV0LnNsaWNlKGRvY3VtZW50U3RhcnQsIHRoaXMucG9zaXRpb24pLFxuICAgICAgKVxuICAgICkge1xuICAgICAgdGhpcy5kaXNwYXRjaFdhcm5pbmcoXCJub24tQVNDSUkgbGluZSBicmVha3MgYXJlIGludGVycHJldGVkIGFzIGNvbnRlbnRcIik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucG9zaXRpb24gPT09IHRoaXMubGluZVN0YXJ0ICYmIHRoaXMudGVzdERvY3VtZW50U2VwYXJhdG9yKCkpIHtcbiAgICAgIGlmICh0aGlzLnBlZWsoKSA9PT0gRE9UKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gMztcbiAgICAgICAgdGhpcy5za2lwU2VwYXJhdGlvblNwYWNlKHRydWUsIC0xKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMucG9zaXRpb24gPCB0aGlzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiB0aGlzLnRocm93RXJyb3IoXG4gICAgICAgIFwiQ2Fubm90IHJlYWQgZG9jdW1lbnQ6IGVuZCBvZiB0aGUgc3RyZWFtIG9yIGEgZG9jdW1lbnQgc2VwYXJhdG9yIGlzIGV4cGVjdGVkXCIsXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnJlc3VsdDtcbiAgfVxuXG4gICpyZWFkRG9jdW1lbnRzKCkge1xuICAgIHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5sZW5ndGggLSAxKSB7XG4gICAgICB5aWVsZCB0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
// denoCacheMetadata=13732391303201122566,1423749996103394503