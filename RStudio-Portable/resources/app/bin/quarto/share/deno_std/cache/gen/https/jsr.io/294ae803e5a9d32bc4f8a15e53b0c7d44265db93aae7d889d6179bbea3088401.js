// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { YAMLError } from "../_error.ts";
import { Mark } from "../_mark.ts";
import * as common from "../_utils.ts";
import { LoaderState } from "./loader_state.ts";
const { hasOwn } = Object;
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
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function isEOL(c) {
  return c === 0x0a || /* LF */ c === 0x0d /* CR */ ;
}
function isWhiteSpace(c) {
  return c === 0x09 || /* Tab */ c === 0x20 /* Space */ ;
}
function isWsOrEol(c) {
  return c === 0x09 /* Tab */  || c === 0x20 /* Space */  || c === 0x0a /* LF */  || c === 0x0d /* CR */ ;
}
function isFlowIndicator(c) {
  return c === 0x2c /* , */  || c === 0x5b /* [ */  || c === 0x5d /* ] */  || c === 0x7b /* { */  || c === 0x7d /* } */ ;
}
function fromHexCode(c) {
  if (0x30 <= /* 0 */ c && c <= 0x39 /* 9 */ ) {
    return c - 0x30;
  }
  const lc = c | 0x20;
  if (0x61 <= /* a */ lc && lc <= 0x66 /* f */ ) {
    return lc - 0x61 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 0x78 /* x */ ) {
    return 2;
  }
  if (c === 0x75 /* u */ ) {
    return 4;
  }
  if (c === 0x55 /* U */ ) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (0x30 <= /* 0 */ c && c <= 0x39 /* 9 */ ) {
    return c - 0x30;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 0x30 /* 0 */  ? "\x00" : c === 0x61 /* a */  ? "\x07" : c === 0x62 /* b */  ? "\x08" : c === 0x74 /* t */  ? "\x09" : c === 0x09 /* Tab */  ? "\x09" : c === 0x6e /* n */  ? "\x0A" : c === 0x76 /* v */  ? "\x0B" : c === 0x66 /* f */  ? "\x0C" : c === 0x72 /* r */  ? "\x0D" : c === 0x65 /* e */  ? "\x1B" : c === 0x20 /* Space */  ? " " : c === 0x22 /* " */  ? "\x22" : c === 0x2f /* / */  ? "/" : c === 0x5c /* \ */  ? "\x5C" : c === 0x4e /* N */  ? "\x85" : c === 0x5f /* _ */  ? "\xA0" : c === 0x4c /* L */  ? "\u2028" : c === 0x50 /* P */  ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 0xffff) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode((c - 0x010000 >> 10) + 0xd800, (c - 0x010000 & 0x03ff) + 0xdc00);
}
const simpleEscapeCheck = Array.from({
  length: 256
}); // integer, for fast access
const simpleEscapeMap = Array.from({
  length: 256
});
for(let i = 0; i < 256; i++){
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
function generateError(state, message) {
  return new YAMLError(message, new Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart));
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
const directiveHandlers = {
  YAML (state, _name, ...args) {
    if (state.version !== null) {
      return throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      return throwError(state, "YAML directive accepts exactly one argument");
    }
    const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      return throwError(state, "ill-formed argument of the YAML directive");
    }
    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10);
    if (major !== 1) {
      return throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      return throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG (state, _name, ...args) {
    if (args.length !== 2) {
      return throwError(state, "TAG directive accepts exactly two arguments");
    }
    const handle = args[0];
    const prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      return throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (state.tagMap && hasOwn(state.tagMap, handle)) {
      return throwError(state, `there is a previously declared suffix for "${handle}" tag handle`);
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      return throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    if (typeof state.tagMap === "undefined") {
      state.tagMap = Object.create(null);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  let result;
  if (start < end) {
    result = state.input.slice(start, end);
    if (checkJson) {
      for(let position = 0; position < result.length; position++){
        const character = result.charCodeAt(position);
        if (!(character === 0x09 || 0x20 <= character && character <= 0x10ffff)) {
          return throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(result)) {
      return throwError(state, "the stream contains non-printable characters");
    }
    state.result += result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  if (!common.isObject(source)) {
    return throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  for(const key in Object.keys(source)){
    if (!hasOwn(destination, key)) {
      Object.defineProperty(destination, key, {
        value: source[key],
        writable: true,
        enumerable: true,
        configurable: true
      });
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
  // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for(let index = 0; index < keyNode.length; index++){
      if (Array.isArray(keyNode[index])) {
        return throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (result === null) {
    result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for(let index = 0; index < valueNode.length; index++){
        mergeMappings(state, result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !hasOwn(overridableKeys, keyNode) && hasOwn(result, keyNode)) {
      state.line = startLine || state.line;
      state.position = startPos || state.position;
      return throwError(state, "duplicated mapping key");
    }
    Object.defineProperty(result, keyNode, {
      value: valueNode,
      writable: true,
      enumerable: true,
      configurable: true
    });
    delete overridableKeys[keyNode];
  }
  return result;
}
function readLineBreak(state) {
  const ch = state.input.charCodeAt(state.position);
  if (ch === 0x0a /* LF */ ) {
    state.position++;
  } else if (ch === 0x0d /* CR */ ) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 0x0a /* LF */ ) {
      state.position++;
    }
  } else {
    return throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  let lineBreaks = 0;
  let ch = state.input.charCodeAt(state.position);
  while(ch !== 0){
    while(isWhiteSpace(ch)){
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 0x23 /* # */ ) {
      do {
        ch = state.input.charCodeAt(++state.position);
      }while (ch !== 0x0a && /* LF */ ch !== 0x0d && /* CR */ ch !== 0)
    }
    if (isEOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while(ch === 0x20 /* Space */ ){
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  let _position = state.position;
  let ch = state.input.charCodeAt(_position);
  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2d || /* - */ ch === 0x2e) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || isWsOrEol(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  const kind = state.kind;
  const result = state.result;
  let ch = state.input.charCodeAt(state.position);
  if (isWsOrEol(ch) || isFlowIndicator(ch) || ch === 0x23 /* # */  || ch === 0x26 /* & */  || ch === 0x2a /* * */  || ch === 0x21 /* ! */  || ch === 0x7c /* | */  || ch === 0x3e /* > */  || ch === 0x27 /* ' */  || ch === 0x22 /* " */  || ch === 0x25 /* % */  || ch === 0x40 /* @ */  || ch === 0x60 /* ` */ ) {
    return false;
  }
  let following;
  if (ch === 0x3f || /* ? */ ch === 0x2d /* - */ ) {
    following = state.input.charCodeAt(state.position + 1);
    if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  let captureEnd = state.position;
  let captureStart = state.position;
  let hasPendingContent = false;
  let line = 0;
  while(ch !== 0){
    if (ch === 0x3a /* : */ ) {
      following = state.input.charCodeAt(state.position + 1);
      if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
        break;
      }
    } else if (ch === 0x23 /* # */ ) {
      const preceding = state.input.charCodeAt(state.position - 1);
      if (isWsOrEol(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && isFlowIndicator(ch)) {
      break;
    } else if (isEOL(ch)) {
      line = state.line;
      const lineStart = state.lineStart;
      const lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = line;
        state.lineStart = lineStart;
        state.lineIndent = lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!isWhiteSpace(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = kind;
  state.result = result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  let ch;
  let captureStart;
  let captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 0x27 /* ' */ ) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while((ch = state.input.charCodeAt(state.position)) !== 0){
    if (ch === 0x27 /* ' */ ) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 0x27 /* ' */ ) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (isEOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      return throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  return throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  let ch = state.input.charCodeAt(state.position);
  if (ch !== 0x22 /* " */ ) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  let captureEnd = state.position;
  let captureStart = state.position;
  let tmp;
  while((ch = state.input.charCodeAt(state.position)) !== 0){
    if (ch === 0x22 /* " */ ) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    }
    if (ch === 0x5c /* \ */ ) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (isEOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      // TODO(bartlomieju): rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        let hexLength = tmp;
        let hexResult = 0;
        for(; hexLength > 0; hexLength--){
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            return throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        return throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (isEOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      return throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  return throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  let ch = state.input.charCodeAt(state.position);
  let terminator;
  let isMapping = true;
  let result = {};
  if (ch === 0x5b /* [ */ ) {
    terminator = 0x5d; /* ] */ 
    isMapping = false;
    result = [];
  } else if (ch === 0x7b /* { */ ) {
    terminator = 0x7d; /* } */ 
  } else {
    return false;
  }
  if (state.anchor !== null && typeof state.anchor !== "undefined" && typeof state.anchorMap !== "undefined") {
    state.anchorMap[state.anchor] = result;
  }
  ch = state.input.charCodeAt(++state.position);
  const tag = state.tag;
  const anchor = state.anchor;
  let readNext = true;
  let valueNode = null;
  let keyNode = null;
  let keyTag = null;
  let isExplicitPair = false;
  let isPair = false;
  let following = 0;
  let line = 0;
  const overridableKeys = Object.create(null);
  while(ch !== 0){
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = tag;
      state.anchor = anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = result;
      return true;
    }
    if (!readNext) {
      return throwError(state, "missed comma between flow collection entries");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 0x3f /* ? */ ) {
      following = state.input.charCodeAt(state.position + 1);
      if (isWsOrEol(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    line = state.line;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag || null;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === line) && ch === 0x3a /* : */ ) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode);
    } else if (isPair) {
      result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
    } else {
      result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 0x2c /* , */ ) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  return throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  let chomping = CHOMPING_CLIP;
  let didReadContent = false;
  let detectedIndent = false;
  let textIndent = nodeIndent;
  let emptyLines = 0;
  let atMoreIndented = false;
  let ch = state.input.charCodeAt(state.position);
  let folding = false;
  if (ch === 0x7c /* | */ ) {
    folding = false;
  } else if (ch === 0x3e /* > */ ) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  let tmp = 0;
  while(ch !== 0){
    ch = state.input.charCodeAt(++state.position);
    if (ch === 0x2b || /* + */ ch === 0x2d /* - */ ) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 0x2b /* + */  ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        return throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        return throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        return throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (isWhiteSpace(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    }while (isWhiteSpace(ch))
    if (ch === 0x23 /* # */ ) {
      do {
        ch = state.input.charCodeAt(++state.position);
      }while (!isEOL(ch) && ch !== 0)
    }
  }
  while(ch !== 0){
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while((!detectedIndent || state.lineIndent < textIndent) && ch === 0x20 /* Space */ ){
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (isEOL(ch)) {
      emptyLines++;
      continue;
    }
    // End of the scalar.
    if (state.lineIndent < textIndent) {
      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          // i.e. only if the scalar is not empty.
          state.result += "\n";
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
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat("\n", emptyLines + 1);
      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) {
          // i.e. only if we have already read some scalar content.
          state.result += " ";
        }
      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat("\n", emptyLines);
      }
    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    const captureStart = state.position;
    while(!isEOL(ch) && ch !== 0){
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  let line;
  let following;
  let detected = false;
  let ch;
  const tag = state.tag;
  const anchor = state.anchor;
  const result = [];
  if (state.anchor !== null && typeof state.anchor !== "undefined" && typeof state.anchorMap !== "undefined") {
    state.anchorMap[state.anchor] = result;
  }
  ch = state.input.charCodeAt(state.position);
  while(ch !== 0){
    if (ch !== 0x2d /* - */ ) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!isWsOrEol(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === line || state.lineIndent > nodeIndent) && ch !== 0) {
      return throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = tag;
    state.anchor = anchor;
    state.kind = "sequence";
    state.result = result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  const tag = state.tag;
  const anchor = state.anchor;
  const result = {};
  const overridableKeys = Object.create(null);
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
  if (state.anchor !== null && typeof state.anchor !== "undefined" && typeof state.anchorMap !== "undefined") {
    state.anchorMap[state.anchor] = result;
  }
  ch = state.input.charCodeAt(state.position);
  while(ch !== 0){
    following = state.input.charCodeAt(state.position + 1);
    line = state.line; // Save the current line.
    pos = state.position;
    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3f || /* ? */ ch === 0x3a) && /* : */ isWsOrEol(following)) {
      if (ch === 0x3f /* ? */ ) {
        if (atExplicitKey) {
          storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
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
        return throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
      if (state.line === line) {
        ch = state.input.charCodeAt(state.position);
        while(isWhiteSpace(ch)){
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 0x3a /* : */ ) {
          ch = state.input.charCodeAt(++state.position);
          if (!isWsOrEol(ch)) {
            return throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          return throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = tag;
          state.anchor = anchor;
          return true; // Keep the result of `composeNode`.
        }
      } else if (detected) {
        return throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = tag;
        state.anchor = anchor;
        return true; // Keep the result of `composeNode`.
      }
    } else {
      break; // Reading is done. Go to the epilogue.
    }
    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === line || state.lineIndent > nodeIndent) {
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode, line, pos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if (state.lineIndent > nodeIndent && ch !== 0) {
      return throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  //
  // Epilogue.
  //
  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
  }
  // Expose the resulting mapping.
  if (detected) {
    state.tag = tag;
    state.anchor = anchor;
    state.kind = "mapping";
    state.result = result;
  }
  return detected;
}
function readTagProperty(state) {
  let position;
  let isVerbatim = false;
  let isNamed = false;
  let tagHandle = "";
  let tagName;
  let ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 0x21 /* ! */ ) return false;
  if (state.tag !== null) {
    return throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 0x3c /* < */ ) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 0x21 /* ! */ ) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    }while (ch !== 0 && ch !== 0x3e /* > */ )
    if (state.position < state.length) {
      tagName = state.input.slice(position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      return throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while(ch !== 0 && !isWsOrEol(ch)){
      if (ch === 0x21 /* ! */ ) {
        if (!isNamed) {
          tagHandle = state.input.slice(position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            return throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          position = state.position + 1;
        } else {
          return throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      return throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    return throwError(state, `tag name cannot contain such characters: ${tagName}`);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (typeof state.tagMap !== "undefined" && hasOwn(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = `!${tagName}`;
  } else if (tagHandle === "!!") {
    state.tag = `tag:yaml.org,2002:${tagName}`;
  } else {
    return throwError(state, `undeclared tag handle "${tagHandle}"`);
  }
  return true;
}
function readAnchorProperty(state) {
  let ch = state.input.charCodeAt(state.position);
  if (ch !== 0x26 /* & */ ) return false;
  if (state.anchor !== null) {
    return throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  const position = state.position;
  while(ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)){
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === position) {
    return throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(position, state.position);
  return true;
}
function readAlias(state) {
  let ch = state.input.charCodeAt(state.position);
  if (ch !== 0x2a /* * */ ) return false;
  ch = state.input.charCodeAt(++state.position);
  const _position = state.position;
  while(ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)){
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    return throwError(state, "name of an alias node must contain at least one character");
  }
  const alias = state.input.slice(_position, state.position);
  if (typeof state.anchorMap !== "undefined" && !hasOwn(state.anchorMap, alias)) {
    return throwError(state, `unidentified alias "${alias}"`);
  }
  if (typeof state.anchorMap !== "undefined") {
    state.result = state.anchorMap[alias];
  }
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  let allowBlockScalars;
  let allowBlockCollections;
  let indentStatus = 1; // 1: this>parent, 0: this=parent, -1: this<parent
  let atNewLine = false;
  let hasContent = false;
  let type;
  let flowIndent;
  let blockIndent;
  if (state.listener && state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  const allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while(readTagProperty(state) || readAnchorProperty(state)){
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
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
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            return throwError(state, "alias node should not have Any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag !== null && state.tag !== "!") {
    if (state.tag === "?") {
      for(let typeIndex = 0; typeIndex < state.implicitTypes.length; typeIndex++){
        type = state.implicitTypes[typeIndex];
        // Implicit resolving is not allowed for non-scalar types, and '?'
        // non-specific tag is only assigned to plain scalars. So, it isn't
        // needed to check for 'kind' conformity.
        if (type.resolve(state.result)) {
          // `state.result` updated in resolver if matched
          state.result = type.construct(state.result);
          state.tag = type.tag;
          if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
            state.anchorMap[state.anchor] = state.result;
          }
          break;
        }
      }
    } else if (hasOwn(state.typeMap[state.kind || "fallback"], state.tag)) {
      type = state.typeMap[state.kind || "fallback"][state.tag];
      if (state.result !== null && type.kind !== state.kind) {
        return throwError(state, `unacceptable node kind for !<${state.tag}> tag; it should be "${type.kind}", not "${state.kind}"`);
      }
      if (!type.resolve(state.result)) {
        // `state.result` updated in resolver if matched
        return throwError(state, `cannot resolve a node with !<${state.tag}> explicit tag`);
      } else {
        state.result = type.construct(state.result);
        if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else {
      return throwError(state, `unknown tag !<${state.tag}>`);
    }
  }
  if (state.listener && state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  const documentStart = state.position;
  let position;
  let directiveName;
  let directiveArgs;
  let hasDirectives = false;
  let ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);
  while((ch = state.input.charCodeAt(state.position)) !== 0){
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 0x25 /* % */ ) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    position = state.position;
    while(ch !== 0 && !isWsOrEol(ch)){
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      return throwError(state, "directive name must not be less than one character in length");
    }
    while(ch !== 0){
      while(isWhiteSpace(ch)){
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 0x23 /* # */ ) {
        do {
          ch = state.input.charCodeAt(++state.position);
        }while (ch !== 0 && !isEOL(ch))
        break;
      }
      if (isEOL(ch)) break;
      position = state.position;
      while(ch !== 0 && !isWsOrEol(ch)){
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(position, state.position));
    }
    if (ch !== 0) readLineBreak(state);
    if (hasOwn(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, ...directiveArgs);
    } else {
      throwWarning(state, `unknown document directive "${directiveName}"`);
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 0x2d /* - */  && state.input.charCodeAt(state.position + 1) === 0x2d /* - */  && state.input.charCodeAt(state.position + 2) === 0x2d /* - */ ) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    return throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 0x2e /* . */ ) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    return throwError(state, "end of the stream or a document separator is expected");
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0a /* LF */  && input.charCodeAt(input.length - 1) !== 0x0d /* CR */ ) {
      input += "\n";
    }
    // Strip BOM
    if (input.charCodeAt(0) === 0xfeff) {
      input = input.slice(1);
    }
  }
  const state = new LoaderState(input, options);
  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += "\0";
  while(state.input.charCodeAt(state.position) === 0x20 /* Space */ ){
    state.lineIndent += 1;
    state.position += 1;
  }
  while(state.position < state.length - 1){
    readDocument(state);
  }
  return state.documents;
}
function isCbFunction(fn) {
  return typeof fn === "function";
}
export function loadAll(input, iteratorOrOption, options) {
  if (!isCbFunction(iteratorOrOption)) {
    return loadDocuments(input, iteratorOrOption);
  }
  const documents = loadDocuments(input, options);
  const iterator = iteratorOrOption;
  for(let index = 0; index < documents.length; index++){
    iterator(documents[index]);
  }
  return void 0;
}
export function load(input, options) {
  const documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return null;
  }
  if (documents.length === 1) {
    return documents[0];
  }
  throw new YAMLError("expected a single document in the stream, but found more");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL19sb2FkZXIvbG9hZGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IFlBTUxFcnJvciB9IGZyb20gXCIuLi9fZXJyb3IudHNcIjtcbmltcG9ydCB7IE1hcmsgfSBmcm9tIFwiLi4vX21hcmsudHNcIjtcbmltcG9ydCB0eXBlIHsgVHlwZSB9IGZyb20gXCIuLi90eXBlLnRzXCI7XG5pbXBvcnQgKiBhcyBjb21tb24gZnJvbSBcIi4uL191dGlscy50c1wiO1xuaW1wb3J0IHtcbiAgTG9hZGVyU3RhdGUsXG4gIHR5cGUgTG9hZGVyU3RhdGVPcHRpb25zLFxuICB0eXBlIFJlc3VsdFR5cGUsXG59IGZyb20gXCIuL2xvYWRlcl9zdGF0ZS50c1wiO1xuXG50eXBlIEFueSA9IGNvbW1vbi5Bbnk7XG50eXBlIEFycmF5T2JqZWN0PFQgPSBBbnk+ID0gY29tbW9uLkFycmF5T2JqZWN0PFQ+O1xuXG5jb25zdCB7IGhhc093biB9ID0gT2JqZWN0O1xuXG5jb25zdCBDT05URVhUX0ZMT1dfSU4gPSAxO1xuY29uc3QgQ09OVEVYVF9GTE9XX09VVCA9IDI7XG5jb25zdCBDT05URVhUX0JMT0NLX0lOID0gMztcbmNvbnN0IENPTlRFWFRfQkxPQ0tfT1VUID0gNDtcblxuY29uc3QgQ0hPTVBJTkdfQ0xJUCA9IDE7XG5jb25zdCBDSE9NUElOR19TVFJJUCA9IDI7XG5jb25zdCBDSE9NUElOR19LRUVQID0gMztcblxuY29uc3QgUEFUVEVSTl9OT05fUFJJTlRBQkxFID1cbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1jb250cm9sLXJlZ2V4XG4gIC9bXFx4MDAtXFx4MDhcXHgwQlxceDBDXFx4MEUtXFx4MUZcXHg3Ri1cXHg4NFxceDg2LVxceDlGXFx1RkZGRVxcdUZGRkZdfFtcXHVEODAwLVxcdURCRkZdKD8hW1xcdURDMDAtXFx1REZGRl0pfCg/OlteXFx1RDgwMC1cXHVEQkZGXXxeKVtcXHVEQzAwLVxcdURGRkZdLztcbmNvbnN0IFBBVFRFUk5fTk9OX0FTQ0lJX0xJTkVfQlJFQUtTID0gL1tcXHg4NVxcdTIwMjhcXHUyMDI5XS87XG5jb25zdCBQQVRURVJOX0ZMT1dfSU5ESUNBVE9SUyA9IC9bLFxcW1xcXVxce1xcfV0vO1xuY29uc3QgUEFUVEVSTl9UQUdfSEFORExFID0gL14oPzohfCEhfCFbYS16XFwtXSshKSQvaTtcbmNvbnN0IFBBVFRFUk5fVEFHX1VSSSA9XG4gIC9eKD86IXxbXixcXFtcXF1cXHtcXH1dKSg/OiVbMC05YS1mXXsyfXxbMC05YS16XFwtIztcXC9cXD86QCY9XFwrXFwkLF9cXC4hflxcKidcXChcXClcXFtcXF1dKSokL2k7XG5cbmZ1bmN0aW9uIF9jbGFzcyhvYmo6IHVua25vd24pOiBzdHJpbmcge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaik7XG59XG5cbmZ1bmN0aW9uIGlzRU9MKGM6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gYyA9PT0gMHgwYSB8fCAvKiBMRiAqLyBjID09PSAweDBkIC8qIENSICovO1xufVxuXG5mdW5jdGlvbiBpc1doaXRlU3BhY2UoYzogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjID09PSAweDA5IHx8IC8qIFRhYiAqLyBjID09PSAweDIwIC8qIFNwYWNlICovO1xufVxuXG5mdW5jdGlvbiBpc1dzT3JFb2woYzogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgYyA9PT0gMHgwOSAvKiBUYWIgKi8gfHxcbiAgICBjID09PSAweDIwIC8qIFNwYWNlICovIHx8XG4gICAgYyA9PT0gMHgwYSAvKiBMRiAqLyB8fFxuICAgIGMgPT09IDB4MGQgLyogQ1IgKi9cbiAgKTtcbn1cblxuZnVuY3Rpb24gaXNGbG93SW5kaWNhdG9yKGM6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIGMgPT09IDB4MmMgLyogLCAqLyB8fFxuICAgIGMgPT09IDB4NWIgLyogWyAqLyB8fFxuICAgIGMgPT09IDB4NWQgLyogXSAqLyB8fFxuICAgIGMgPT09IDB4N2IgLyogeyAqLyB8fFxuICAgIGMgPT09IDB4N2QgLyogfSAqL1xuICApO1xufVxuXG5mdW5jdGlvbiBmcm9tSGV4Q29kZShjOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAoMHgzMCA8PSAvKiAwICovIGMgJiYgYyA8PSAweDM5IC8qIDkgKi8pIHtcbiAgICByZXR1cm4gYyAtIDB4MzA7XG4gIH1cblxuICBjb25zdCBsYyA9IGMgfCAweDIwO1xuXG4gIGlmICgweDYxIDw9IC8qIGEgKi8gbGMgJiYgbGMgPD0gMHg2NiAvKiBmICovKSB7XG4gICAgcmV0dXJuIGxjIC0gMHg2MSArIDEwO1xuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVkSGV4TGVuKGM6IG51bWJlcik6IG51bWJlciB7XG4gIGlmIChjID09PSAweDc4IC8qIHggKi8pIHtcbiAgICByZXR1cm4gMjtcbiAgfVxuICBpZiAoYyA9PT0gMHg3NSAvKiB1ICovKSB7XG4gICAgcmV0dXJuIDQ7XG4gIH1cbiAgaWYgKGMgPT09IDB4NTUgLyogVSAqLykge1xuICAgIHJldHVybiA4O1xuICB9XG4gIHJldHVybiAwO1xufVxuXG5mdW5jdGlvbiBmcm9tRGVjaW1hbENvZGUoYzogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKDB4MzAgPD0gLyogMCAqLyBjICYmIGMgPD0gMHgzOSAvKiA5ICovKSB7XG4gICAgcmV0dXJuIGMgLSAweDMwO1xuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBzaW1wbGVFc2NhcGVTZXF1ZW5jZShjOiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gYyA9PT0gMHgzMCAvKiAwICovXG4gICAgPyBcIlxceDAwXCJcbiAgICA6IGMgPT09IDB4NjEgLyogYSAqL1xuICAgID8gXCJcXHgwN1wiXG4gICAgOiBjID09PSAweDYyIC8qIGIgKi9cbiAgICA/IFwiXFx4MDhcIlxuICAgIDogYyA9PT0gMHg3NCAvKiB0ICovXG4gICAgPyBcIlxceDA5XCJcbiAgICA6IGMgPT09IDB4MDkgLyogVGFiICovXG4gICAgPyBcIlxceDA5XCJcbiAgICA6IGMgPT09IDB4NmUgLyogbiAqL1xuICAgID8gXCJcXHgwQVwiXG4gICAgOiBjID09PSAweDc2IC8qIHYgKi9cbiAgICA/IFwiXFx4MEJcIlxuICAgIDogYyA9PT0gMHg2NiAvKiBmICovXG4gICAgPyBcIlxceDBDXCJcbiAgICA6IGMgPT09IDB4NzIgLyogciAqL1xuICAgID8gXCJcXHgwRFwiXG4gICAgOiBjID09PSAweDY1IC8qIGUgKi9cbiAgICA/IFwiXFx4MUJcIlxuICAgIDogYyA9PT0gMHgyMCAvKiBTcGFjZSAqL1xuICAgID8gXCIgXCJcbiAgICA6IGMgPT09IDB4MjIgLyogXCIgKi9cbiAgICA/IFwiXFx4MjJcIlxuICAgIDogYyA9PT0gMHgyZiAvKiAvICovXG4gICAgPyBcIi9cIlxuICAgIDogYyA9PT0gMHg1YyAvKiBcXCAqL1xuICAgID8gXCJcXHg1Q1wiXG4gICAgOiBjID09PSAweDRlIC8qIE4gKi9cbiAgICA/IFwiXFx4ODVcIlxuICAgIDogYyA9PT0gMHg1ZiAvKiBfICovXG4gICAgPyBcIlxceEEwXCJcbiAgICA6IGMgPT09IDB4NGMgLyogTCAqL1xuICAgID8gXCJcXHUyMDI4XCJcbiAgICA6IGMgPT09IDB4NTAgLyogUCAqL1xuICAgID8gXCJcXHUyMDI5XCJcbiAgICA6IFwiXCI7XG59XG5cbmZ1bmN0aW9uIGNoYXJGcm9tQ29kZXBvaW50KGM6IG51bWJlcik6IHN0cmluZyB7XG4gIGlmIChjIDw9IDB4ZmZmZikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpO1xuICB9XG4gIC8vIEVuY29kZSBVVEYtMTYgc3Vycm9nYXRlIHBhaXJcbiAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVVRGLTE2I0NvZGVfcG9pbnRzX1UuMkIwMTAwMDBfdG9fVS4yQjEwRkZGRlxuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShcbiAgICAoKGMgLSAweDAxMDAwMCkgPj4gMTApICsgMHhkODAwLFxuICAgICgoYyAtIDB4MDEwMDAwKSAmIDB4MDNmZikgKyAweGRjMDAsXG4gICk7XG59XG5cbmNvbnN0IHNpbXBsZUVzY2FwZUNoZWNrID0gQXJyYXkuZnJvbTxudW1iZXI+KHsgbGVuZ3RoOiAyNTYgfSk7IC8vIGludGVnZXIsIGZvciBmYXN0IGFjY2Vzc1xuY29uc3Qgc2ltcGxlRXNjYXBlTWFwID0gQXJyYXkuZnJvbTxzdHJpbmc+KHsgbGVuZ3RoOiAyNTYgfSk7XG5mb3IgKGxldCBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gIHNpbXBsZUVzY2FwZUNoZWNrW2ldID0gc2ltcGxlRXNjYXBlU2VxdWVuY2UoaSkgPyAxIDogMDtcbiAgc2ltcGxlRXNjYXBlTWFwW2ldID0gc2ltcGxlRXNjYXBlU2VxdWVuY2UoaSk7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlRXJyb3Ioc3RhdGU6IExvYWRlclN0YXRlLCBtZXNzYWdlOiBzdHJpbmcpOiBZQU1MRXJyb3Ige1xuICByZXR1cm4gbmV3IFlBTUxFcnJvcihcbiAgICBtZXNzYWdlLFxuICAgIG5ldyBNYXJrKFxuICAgICAgc3RhdGUuZmlsZW5hbWUgYXMgc3RyaW5nLFxuICAgICAgc3RhdGUuaW5wdXQsXG4gICAgICBzdGF0ZS5wb3NpdGlvbixcbiAgICAgIHN0YXRlLmxpbmUsXG4gICAgICBzdGF0ZS5wb3NpdGlvbiAtIHN0YXRlLmxpbmVTdGFydCxcbiAgICApLFxuICApO1xufVxuXG5mdW5jdGlvbiB0aHJvd0Vycm9yKHN0YXRlOiBMb2FkZXJTdGF0ZSwgbWVzc2FnZTogc3RyaW5nKTogbmV2ZXIge1xuICB0aHJvdyBnZW5lcmF0ZUVycm9yKHN0YXRlLCBtZXNzYWdlKTtcbn1cblxuZnVuY3Rpb24gdGhyb3dXYXJuaW5nKHN0YXRlOiBMb2FkZXJTdGF0ZSwgbWVzc2FnZTogc3RyaW5nKSB7XG4gIGlmIChzdGF0ZS5vbldhcm5pbmcpIHtcbiAgICBzdGF0ZS5vbldhcm5pbmcuY2FsbChudWxsLCBnZW5lcmF0ZUVycm9yKHN0YXRlLCBtZXNzYWdlKSk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIERpcmVjdGl2ZUhhbmRsZXJzIHtcbiAgW2RpcmVjdGl2ZTogc3RyaW5nXTogKFxuICAgIHN0YXRlOiBMb2FkZXJTdGF0ZSxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgLi4uYXJnczogc3RyaW5nW11cbiAgKSA9PiB2b2lkO1xufVxuXG5jb25zdCBkaXJlY3RpdmVIYW5kbGVyczogRGlyZWN0aXZlSGFuZGxlcnMgPSB7XG4gIFlBTUwoc3RhdGUsIF9uYW1lLCAuLi5hcmdzOiBzdHJpbmdbXSkge1xuICAgIGlmIChzdGF0ZS52ZXJzaW9uICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihzdGF0ZSwgXCJkdXBsaWNhdGlvbiBvZiAlWUFNTCBkaXJlY3RpdmVcIik7XG4gICAgfVxuXG4gICAgaWYgKGFyZ3MubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihzdGF0ZSwgXCJZQU1MIGRpcmVjdGl2ZSBhY2NlcHRzIGV4YWN0bHkgb25lIGFyZ3VtZW50XCIpO1xuICAgIH1cblxuICAgIGNvbnN0IG1hdGNoID0gL14oWzAtOV0rKVxcLihbMC05XSspJC8uZXhlYyhhcmdzWzBdISk7XG4gICAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihzdGF0ZSwgXCJpbGwtZm9ybWVkIGFyZ3VtZW50IG9mIHRoZSBZQU1MIGRpcmVjdGl2ZVwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBtYWpvciA9IHBhcnNlSW50KG1hdGNoWzFdISwgMTApO1xuICAgIGNvbnN0IG1pbm9yID0gcGFyc2VJbnQobWF0Y2hbMl0hLCAxMCk7XG4gICAgaWYgKG1ham9yICE9PSAxKSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihzdGF0ZSwgXCJ1bmFjY2VwdGFibGUgWUFNTCB2ZXJzaW9uIG9mIHRoZSBkb2N1bWVudFwiKTtcbiAgICB9XG5cbiAgICBzdGF0ZS52ZXJzaW9uID0gYXJnc1swXTtcbiAgICBzdGF0ZS5jaGVja0xpbmVCcmVha3MgPSBtaW5vciA8IDI7XG4gICAgaWYgKG1pbm9yICE9PSAxICYmIG1pbm9yICE9PSAyKSB7XG4gICAgICByZXR1cm4gdGhyb3dXYXJuaW5nKHN0YXRlLCBcInVuc3VwcG9ydGVkIFlBTUwgdmVyc2lvbiBvZiB0aGUgZG9jdW1lbnRcIik7XG4gICAgfVxuICB9LFxuXG4gIFRBRyhzdGF0ZSwgX25hbWUsIC4uLmFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoICE9PSAyKSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihzdGF0ZSwgXCJUQUcgZGlyZWN0aXZlIGFjY2VwdHMgZXhhY3RseSB0d28gYXJndW1lbnRzXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZSA9IGFyZ3NbMF0hO1xuICAgIGNvbnN0IHByZWZpeCA9IGFyZ3NbMV0hO1xuXG4gICAgaWYgKCFQQVRURVJOX1RBR19IQU5ETEUudGVzdChoYW5kbGUpKSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihcbiAgICAgICAgc3RhdGUsXG4gICAgICAgIFwiaWxsLWZvcm1lZCB0YWcgaGFuZGxlIChmaXJzdCBhcmd1bWVudCkgb2YgdGhlIFRBRyBkaXJlY3RpdmVcIixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLnRhZ01hcCAmJiBoYXNPd24oc3RhdGUudGFnTWFwLCBoYW5kbGUpKSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihcbiAgICAgICAgc3RhdGUsXG4gICAgICAgIGB0aGVyZSBpcyBhIHByZXZpb3VzbHkgZGVjbGFyZWQgc3VmZml4IGZvciBcIiR7aGFuZGxlfVwiIHRhZyBoYW5kbGVgLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoIVBBVFRFUk5fVEFHX1VSSS50ZXN0KHByZWZpeCkpIHtcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKFxuICAgICAgICBzdGF0ZSxcbiAgICAgICAgXCJpbGwtZm9ybWVkIHRhZyBwcmVmaXggKHNlY29uZCBhcmd1bWVudCkgb2YgdGhlIFRBRyBkaXJlY3RpdmVcIixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzdGF0ZS50YWdNYXAgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHN0YXRlLnRhZ01hcCA9IE9iamVjdC5jcmVhdGUobnVsbCkgYXMgY29tbW9uLkFycmF5T2JqZWN0O1xuICAgIH1cbiAgICBzdGF0ZS50YWdNYXBbaGFuZGxlXSA9IHByZWZpeDtcbiAgfSxcbn07XG5cbmZ1bmN0aW9uIGNhcHR1cmVTZWdtZW50KFxuICBzdGF0ZTogTG9hZGVyU3RhdGUsXG4gIHN0YXJ0OiBudW1iZXIsXG4gIGVuZDogbnVtYmVyLFxuICBjaGVja0pzb246IGJvb2xlYW4sXG4pIHtcbiAgbGV0IHJlc3VsdDogc3RyaW5nO1xuICBpZiAoc3RhcnQgPCBlbmQpIHtcbiAgICByZXN1bHQgPSBzdGF0ZS5pbnB1dC5zbGljZShzdGFydCwgZW5kKTtcblxuICAgIGlmIChjaGVja0pzb24pIHtcbiAgICAgIGZvciAoXG4gICAgICAgIGxldCBwb3NpdGlvbiA9IDA7XG4gICAgICAgIHBvc2l0aW9uIDwgcmVzdWx0Lmxlbmd0aDtcbiAgICAgICAgcG9zaXRpb24rK1xuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGNoYXJhY3RlciA9IHJlc3VsdC5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICEoY2hhcmFjdGVyID09PSAweDA5IHx8ICgweDIwIDw9IGNoYXJhY3RlciAmJiBjaGFyYWN0ZXIgPD0gMHgxMGZmZmYpKVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihzdGF0ZSwgXCJleHBlY3RlZCB2YWxpZCBKU09OIGNoYXJhY3RlclwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoUEFUVEVSTl9OT05fUFJJTlRBQkxFLnRlc3QocmVzdWx0KSkge1xuICAgICAgcmV0dXJuIHRocm93RXJyb3Ioc3RhdGUsIFwidGhlIHN0cmVhbSBjb250YWlucyBub24tcHJpbnRhYmxlIGNoYXJhY3RlcnNcIik7XG4gICAgfVxuXG4gICAgc3RhdGUucmVzdWx0ICs9IHJlc3VsdDtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZU1hcHBpbmdzKFxuICBzdGF0ZTogTG9hZGVyU3RhdGUsXG4gIGRlc3RpbmF0aW9uOiBBcnJheU9iamVjdCxcbiAgc291cmNlOiBBcnJheU9iamVjdCxcbiAgb3ZlcnJpZGFibGVLZXlzOiBBcnJheU9iamVjdDxib29sZWFuPixcbikge1xuICBpZiAoIWNvbW1vbi5pc09iamVjdChzb3VyY2UpKSB7XG4gICAgcmV0dXJuIHRocm93RXJyb3IoXG4gICAgICBzdGF0ZSxcbiAgICAgIFwiY2Fubm90IG1lcmdlIG1hcHBpbmdzOyB0aGUgcHJvdmlkZWQgc291cmNlIG9iamVjdCBpcyB1bmFjY2VwdGFibGVcIixcbiAgICApO1xuICB9XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gT2JqZWN0LmtleXMoc291cmNlKSkge1xuICAgIGlmICghaGFzT3duKGRlc3RpbmF0aW9uLCBrZXkpKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdGluYXRpb24sIGtleSwge1xuICAgICAgICB2YWx1ZTogc291cmNlW2tleV0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9KTtcbiAgICAgIG92ZXJyaWRhYmxlS2V5c1trZXldID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RvcmVNYXBwaW5nUGFpcihcbiAgc3RhdGU6IExvYWRlclN0YXRlLFxuICByZXN1bHQ6IEFycmF5T2JqZWN0IHwgbnVsbCxcbiAgb3ZlcnJpZGFibGVLZXlzOiBBcnJheU9iamVjdDxib29sZWFuPixcbiAga2V5VGFnOiBzdHJpbmcgfCBudWxsLFxuICBrZXlOb2RlOiBBbnksXG4gIHZhbHVlTm9kZTogdW5rbm93bixcbiAgc3RhcnRMaW5lPzogbnVtYmVyLFxuICBzdGFydFBvcz86IG51bWJlcixcbik6IEFycmF5T2JqZWN0IHtcbiAgLy8gVGhlIG91dHB1dCBpcyBhIHBsYWluIG9iamVjdCBoZXJlLCBzbyBrZXlzIGNhbiBvbmx5IGJlIHN0cmluZ3MuXG4gIC8vIFdlIG5lZWQgdG8gY29udmVydCBrZXlOb2RlIHRvIGEgc3RyaW5nLCBidXQgZG9pbmcgc28gY2FuIGhhbmcgdGhlIHByb2Nlc3NcbiAgLy8gKGRlZXBseSBuZXN0ZWQgYXJyYXlzIHRoYXQgZXhwbG9kZSBleHBvbmVudGlhbGx5IHVzaW5nIGFsaWFzZXMpLlxuICBpZiAoQXJyYXkuaXNBcnJheShrZXlOb2RlKSkge1xuICAgIGtleU5vZGUgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChrZXlOb2RlKTtcblxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBrZXlOb2RlLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoa2V5Tm9kZVtpbmRleF0pKSB7XG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKHN0YXRlLCBcIm5lc3RlZCBhcnJheXMgYXJlIG5vdCBzdXBwb3J0ZWQgaW5zaWRlIGtleXNcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIGtleU5vZGUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgX2NsYXNzKGtleU5vZGVbaW5kZXhdKSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIlxuICAgICAgKSB7XG4gICAgICAgIGtleU5vZGVbaW5kZXhdID0gXCJbb2JqZWN0IE9iamVjdF1cIjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBdm9pZCBjb2RlIGV4ZWN1dGlvbiBpbiBsb2FkKCkgdmlhIHRvU3RyaW5nIHByb3BlcnR5XG4gIC8vIChzdGlsbCB1c2UgaXRzIG93biB0b1N0cmluZyBmb3IgYXJyYXlzLCB0aW1lc3RhbXBzLFxuICAvLyBhbmQgd2hhdGV2ZXIgdXNlciBzY2hlbWEgZXh0ZW5zaW9ucyBoYXBwZW4gdG8gaGF2ZSBAQHRvU3RyaW5nVGFnKVxuICBpZiAodHlwZW9mIGtleU5vZGUgPT09IFwib2JqZWN0XCIgJiYgX2NsYXNzKGtleU5vZGUpID09PSBcIltvYmplY3QgT2JqZWN0XVwiKSB7XG4gICAga2V5Tm9kZSA9IFwiW29iamVjdCBPYmplY3RdXCI7XG4gIH1cblxuICBrZXlOb2RlID0gU3RyaW5nKGtleU5vZGUpO1xuXG4gIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICByZXN1bHQgPSB7fTtcbiAgfVxuXG4gIGlmIChrZXlUYWcgPT09IFwidGFnOnlhbWwub3JnLDIwMDI6bWVyZ2VcIikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlTm9kZSkpIHtcbiAgICAgIGZvciAoXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIGluZGV4IDwgdmFsdWVOb2RlLmxlbmd0aDtcbiAgICAgICAgaW5kZXgrK1xuICAgICAgKSB7XG4gICAgICAgIG1lcmdlTWFwcGluZ3Moc3RhdGUsIHJlc3VsdCwgdmFsdWVOb2RlW2luZGV4XSwgb3ZlcnJpZGFibGVLZXlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWVyZ2VNYXBwaW5ncyhzdGF0ZSwgcmVzdWx0LCB2YWx1ZU5vZGUgYXMgQXJyYXlPYmplY3QsIG92ZXJyaWRhYmxlS2V5cyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChcbiAgICAgICFzdGF0ZS5qc29uICYmXG4gICAgICAhaGFzT3duKG92ZXJyaWRhYmxlS2V5cywga2V5Tm9kZSkgJiZcbiAgICAgIGhhc093bihyZXN1bHQsIGtleU5vZGUpXG4gICAgKSB7XG4gICAgICBzdGF0ZS5saW5lID0gc3RhcnRMaW5lIHx8IHN0YXRlLmxpbmU7XG4gICAgICBzdGF0ZS5wb3NpdGlvbiA9IHN0YXJ0UG9zIHx8IHN0YXRlLnBvc2l0aW9uO1xuICAgICAgcmV0dXJuIHRocm93RXJyb3Ioc3RhdGUsIFwiZHVwbGljYXRlZCBtYXBwaW5nIGtleVwiKTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlc3VsdCwga2V5Tm9kZSwge1xuICAgICAgdmFsdWU6IHZhbHVlTm9kZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB9KTtcbiAgICBkZWxldGUgb3ZlcnJpZGFibGVLZXlzW2tleU5vZGVdO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gcmVhZExpbmVCcmVhayhzdGF0ZTogTG9hZGVyU3RhdGUpIHtcbiAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICBpZiAoY2ggPT09IDB4MGEgLyogTEYgKi8pIHtcbiAgICBzdGF0ZS5wb3NpdGlvbisrO1xuICB9IGVsc2UgaWYgKGNoID09PSAweDBkIC8qIENSICovKSB7XG4gICAgc3RhdGUucG9zaXRpb24rKztcbiAgICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MGEgLyogTEYgKi8pIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aHJvd0Vycm9yKHN0YXRlLCBcImEgbGluZSBicmVhayBpcyBleHBlY3RlZFwiKTtcbiAgfVxuXG4gIHN0YXRlLmxpbmUgKz0gMTtcbiAgc3RhdGUubGluZVN0YXJ0ID0gc3RhdGUucG9zaXRpb247XG59XG5cbmZ1bmN0aW9uIHNraXBTZXBhcmF0aW9uU3BhY2UoXG4gIHN0YXRlOiBMb2FkZXJTdGF0ZSxcbiAgYWxsb3dDb21tZW50czogYm9vbGVhbixcbiAgY2hlY2tJbmRlbnQ6IG51bWJlcixcbik6IG51bWJlciB7XG4gIGxldCBsaW5lQnJlYWtzID0gMDtcbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG5cbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgd2hpbGUgKGlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAoYWxsb3dDb21tZW50cyAmJiBjaCA9PT0gMHgyMyAvKiAjICovKSB7XG4gICAgICBkbyB7XG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICAgIH0gd2hpbGUgKGNoICE9PSAweDBhICYmIC8qIExGICovIGNoICE9PSAweDBkICYmIC8qIENSICovIGNoICE9PSAwKTtcbiAgICB9XG5cbiAgICBpZiAoaXNFT0woY2gpKSB7XG4gICAgICByZWFkTGluZUJyZWFrKHN0YXRlKTtcblxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcbiAgICAgIGxpbmVCcmVha3MrKztcbiAgICAgIHN0YXRlLmxpbmVJbmRlbnQgPSAwO1xuXG4gICAgICB3aGlsZSAoY2ggPT09IDB4MjAgLyogU3BhY2UgKi8pIHtcbiAgICAgICAgc3RhdGUubGluZUluZGVudCsrO1xuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChcbiAgICBjaGVja0luZGVudCAhPT0gLTEgJiZcbiAgICBsaW5lQnJlYWtzICE9PSAwICYmXG4gICAgc3RhdGUubGluZUluZGVudCA8IGNoZWNrSW5kZW50XG4gICkge1xuICAgIHRocm93V2FybmluZyhzdGF0ZSwgXCJkZWZpY2llbnQgaW5kZW50YXRpb25cIik7XG4gIH1cblxuICByZXR1cm4gbGluZUJyZWFrcztcbn1cblxuZnVuY3Rpb24gdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlOiBMb2FkZXJTdGF0ZSk6IGJvb2xlYW4ge1xuICBsZXQgX3Bvc2l0aW9uID0gc3RhdGUucG9zaXRpb247XG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoX3Bvc2l0aW9uKTtcblxuICAvLyBDb25kaXRpb24gc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCBpcyB0ZXN0ZWRcbiAgLy8gaW4gcGFyZW50IG9uIGVhY2ggY2FsbCwgZm9yIGVmZmljaWVuY3kuIE5vIG5lZWRzIHRvIHRlc3QgaGVyZSBhZ2Fpbi5cbiAgaWYgKFxuICAgIChjaCA9PT0gMHgyZCB8fCAvKiAtICovIGNoID09PSAweDJlKSAvKiAuICovICYmXG4gICAgY2ggPT09IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoX3Bvc2l0aW9uICsgMSkgJiZcbiAgICBjaCA9PT0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChfcG9zaXRpb24gKyAyKVxuICApIHtcbiAgICBfcG9zaXRpb24gKz0gMztcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChfcG9zaXRpb24pO1xuXG4gICAgaWYgKGNoID09PSAwIHx8IGlzV3NPckVvbChjaCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gd3JpdGVGb2xkZWRMaW5lcyhzdGF0ZTogTG9hZGVyU3RhdGUsIGNvdW50OiBudW1iZXIpIHtcbiAgaWYgKGNvdW50ID09PSAxKSB7XG4gICAgc3RhdGUucmVzdWx0ICs9IFwiIFwiO1xuICB9IGVsc2UgaWYgKGNvdW50ID4gMSkge1xuICAgIHN0YXRlLnJlc3VsdCArPSBjb21tb24ucmVwZWF0KFwiXFxuXCIsIGNvdW50IC0gMSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVhZFBsYWluU2NhbGFyKFxuICBzdGF0ZTogTG9hZGVyU3RhdGUsXG4gIG5vZGVJbmRlbnQ6IG51bWJlcixcbiAgd2l0aGluRmxvd0NvbGxlY3Rpb246IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgY29uc3Qga2luZCA9IHN0YXRlLmtpbmQ7XG4gIGNvbnN0IHJlc3VsdCA9IHN0YXRlLnJlc3VsdDtcbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG5cbiAgaWYgKFxuICAgIGlzV3NPckVvbChjaCkgfHxcbiAgICBpc0Zsb3dJbmRpY2F0b3IoY2gpIHx8XG4gICAgY2ggPT09IDB4MjMgLyogIyAqLyB8fFxuICAgIGNoID09PSAweDI2IC8qICYgKi8gfHxcbiAgICBjaCA9PT0gMHgyYSAvKiAqICovIHx8XG4gICAgY2ggPT09IDB4MjEgLyogISAqLyB8fFxuICAgIGNoID09PSAweDdjIC8qIHwgKi8gfHxcbiAgICBjaCA9PT0gMHgzZSAvKiA+ICovIHx8XG4gICAgY2ggPT09IDB4MjcgLyogJyAqLyB8fFxuICAgIGNoID09PSAweDIyIC8qIFwiICovIHx8XG4gICAgY2ggPT09IDB4MjUgLyogJSAqLyB8fFxuICAgIGNoID09PSAweDQwIC8qIEAgKi8gfHxcbiAgICBjaCA9PT0gMHg2MCAvKiBgICovXG4gICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGxldCBmb2xsb3dpbmc6IG51bWJlcjtcbiAgaWYgKGNoID09PSAweDNmIHx8IC8qID8gKi8gY2ggPT09IDB4MmQgLyogLSAqLykge1xuICAgIGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKTtcblxuICAgIGlmIChcbiAgICAgIGlzV3NPckVvbChmb2xsb3dpbmcpIHx8XG4gICAgICAod2l0aGluRmxvd0NvbGxlY3Rpb24gJiYgaXNGbG93SW5kaWNhdG9yKGZvbGxvd2luZykpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgc3RhdGUua2luZCA9IFwic2NhbGFyXCI7XG4gIHN0YXRlLnJlc3VsdCA9IFwiXCI7XG4gIGxldCBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb247XG4gIGxldCBjYXB0dXJlU3RhcnQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgbGV0IGhhc1BlbmRpbmdDb250ZW50ID0gZmFsc2U7XG4gIGxldCBsaW5lID0gMDtcbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgaWYgKGNoID09PSAweDNhIC8qIDogKi8pIHtcbiAgICAgIGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKTtcblxuICAgICAgaWYgKFxuICAgICAgICBpc1dzT3JFb2woZm9sbG93aW5nKSB8fFxuICAgICAgICAod2l0aGluRmxvd0NvbGxlY3Rpb24gJiYgaXNGbG93SW5kaWNhdG9yKGZvbGxvd2luZykpXG4gICAgICApIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgyMyAvKiAjICovKSB7XG4gICAgICBjb25zdCBwcmVjZWRpbmcgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uIC0gMSk7XG5cbiAgICAgIGlmIChpc1dzT3JFb2wocHJlY2VkaW5nKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFxuICAgICAgKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkgfHxcbiAgICAgICh3aXRoaW5GbG93Q29sbGVjdGlvbiAmJiBpc0Zsb3dJbmRpY2F0b3IoY2gpKVxuICAgICkge1xuICAgICAgYnJlYWs7XG4gICAgfSBlbHNlIGlmIChpc0VPTChjaCkpIHtcbiAgICAgIGxpbmUgPSBzdGF0ZS5saW5lO1xuICAgICAgY29uc3QgbGluZVN0YXJ0ID0gc3RhdGUubGluZVN0YXJ0O1xuICAgICAgY29uc3QgbGluZUluZGVudCA9IHN0YXRlLmxpbmVJbmRlbnQ7XG4gICAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCBmYWxzZSwgLTEpO1xuXG4gICAgICBpZiAoc3RhdGUubGluZUluZGVudCA+PSBub2RlSW5kZW50KSB7XG4gICAgICAgIGhhc1BlbmRpbmdDb250ZW50ID0gdHJ1ZTtcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS5wb3NpdGlvbiA9IGNhcHR1cmVFbmQ7XG4gICAgICAgIHN0YXRlLmxpbmUgPSBsaW5lO1xuICAgICAgICBzdGF0ZS5saW5lU3RhcnQgPSBsaW5lU3RhcnQ7XG4gICAgICAgIHN0YXRlLmxpbmVJbmRlbnQgPSBsaW5lSW5kZW50O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaGFzUGVuZGluZ0NvbnRlbnQpIHtcbiAgICAgIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQsIGZhbHNlKTtcbiAgICAgIHdyaXRlRm9sZGVkTGluZXMoc3RhdGUsIHN0YXRlLmxpbmUgLSBsaW5lKTtcbiAgICAgIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgICAgIGhhc1BlbmRpbmdDb250ZW50ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFpc1doaXRlU3BhY2UoY2gpKSB7XG4gICAgICBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb24gKyAxO1xuICAgIH1cblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgfVxuXG4gIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQsIGZhbHNlKTtcblxuICBpZiAoc3RhdGUucmVzdWx0KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBzdGF0ZS5raW5kID0ga2luZDtcbiAgc3RhdGUucmVzdWx0ID0gcmVzdWx0O1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHJlYWRTaW5nbGVRdW90ZWRTY2FsYXIoXG4gIHN0YXRlOiBMb2FkZXJTdGF0ZSxcbiAgbm9kZUluZGVudDogbnVtYmVyLFxuKTogYm9vbGVhbiB7XG4gIGxldCBjaDtcbiAgbGV0IGNhcHR1cmVTdGFydDtcbiAgbGV0IGNhcHR1cmVFbmQ7XG5cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICBpZiAoY2ggIT09IDB4MjcgLyogJyAqLykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0YXRlLmtpbmQgPSBcInNjYWxhclwiO1xuICBzdGF0ZS5yZXN1bHQgPSBcIlwiO1xuICBzdGF0ZS5wb3NpdGlvbisrO1xuICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb247XG5cbiAgd2hpbGUgKChjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSAhPT0gMCkge1xuICAgIGlmIChjaCA9PT0gMHgyNyAvKiAnICovKSB7XG4gICAgICBjYXB0dXJlU2VnbWVudChzdGF0ZSwgY2FwdHVyZVN0YXJ0LCBzdGF0ZS5wb3NpdGlvbiwgdHJ1ZSk7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG5cbiAgICAgIGlmIChjaCA9PT0gMHgyNyAvKiAnICovKSB7XG4gICAgICAgIGNhcHR1cmVTdGFydCA9IHN0YXRlLnBvc2l0aW9uO1xuICAgICAgICBzdGF0ZS5wb3NpdGlvbisrO1xuICAgICAgICBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzRU9MKGNoKSkge1xuICAgICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgdHJ1ZSk7XG4gICAgICB3cml0ZUZvbGRlZExpbmVzKHN0YXRlLCBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCBmYWxzZSwgbm9kZUluZGVudCkpO1xuICAgICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmXG4gICAgICB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpXG4gICAgKSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihcbiAgICAgICAgc3RhdGUsXG4gICAgICAgIFwidW5leHBlY3RlZCBlbmQgb2YgdGhlIGRvY3VtZW50IHdpdGhpbiBhIHNpbmdsZSBxdW90ZWQgc2NhbGFyXCIsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbisrO1xuICAgICAgY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aHJvd0Vycm9yKFxuICAgIHN0YXRlLFxuICAgIFwidW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSBzaW5nbGUgcXVvdGVkIHNjYWxhclwiLFxuICApO1xufVxuXG5mdW5jdGlvbiByZWFkRG91YmxlUXVvdGVkU2NhbGFyKFxuICBzdGF0ZTogTG9hZGVyU3RhdGUsXG4gIG5vZGVJbmRlbnQ6IG51bWJlcixcbik6IGJvb2xlYW4ge1xuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICBpZiAoY2ggIT09IDB4MjIgLyogXCIgKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdGF0ZS5raW5kID0gXCJzY2FsYXJcIjtcbiAgc3RhdGUucmVzdWx0ID0gXCJcIjtcbiAgc3RhdGUucG9zaXRpb24rKztcbiAgbGV0IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgbGV0IGNhcHR1cmVTdGFydCA9IHN0YXRlLnBvc2l0aW9uO1xuICBsZXQgdG1wOiBudW1iZXI7XG4gIHdoaWxlICgoY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkgIT09IDApIHtcbiAgICBpZiAoY2ggPT09IDB4MjIgLyogXCIgKi8pIHtcbiAgICAgIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIHN0YXRlLnBvc2l0aW9uLCB0cnVlKTtcbiAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNoID09PSAweDVjIC8qIFxcICovKSB7XG4gICAgICBjYXB0dXJlU2VnbWVudChzdGF0ZSwgY2FwdHVyZVN0YXJ0LCBzdGF0ZS5wb3NpdGlvbiwgdHJ1ZSk7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG5cbiAgICAgIGlmIChpc0VPTChjaCkpIHtcbiAgICAgICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgZmFsc2UsIG5vZGVJbmRlbnQpO1xuXG4gICAgICAgIC8vIFRPRE8oYmFydGxvbWllanUpOiByZXdvcmsgdG8gaW5saW5lIGZuIHdpdGggbm8gdHlwZSBjYXN0P1xuICAgICAgfSBlbHNlIGlmIChjaCA8IDI1NiAmJiBzaW1wbGVFc2NhcGVDaGVja1tjaF0pIHtcbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IHNpbXBsZUVzY2FwZU1hcFtjaF07XG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgICB9IGVsc2UgaWYgKCh0bXAgPSBlc2NhcGVkSGV4TGVuKGNoKSkgPiAwKSB7XG4gICAgICAgIGxldCBoZXhMZW5ndGggPSB0bXA7XG4gICAgICAgIGxldCBoZXhSZXN1bHQgPSAwO1xuXG4gICAgICAgIGZvciAoOyBoZXhMZW5ndGggPiAwOyBoZXhMZW5ndGgtLSkge1xuICAgICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcblxuICAgICAgICAgIGlmICgodG1wID0gZnJvbUhleENvZGUoY2gpKSA+PSAwKSB7XG4gICAgICAgICAgICBoZXhSZXN1bHQgPSAoaGV4UmVzdWx0IDw8IDQpICsgdG1wO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihzdGF0ZSwgXCJleHBlY3RlZCBoZXhhZGVjaW1hbCBjaGFyYWN0ZXJcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IGNoYXJGcm9tQ29kZXBvaW50KGhleFJlc3VsdCk7XG5cbiAgICAgICAgc3RhdGUucG9zaXRpb24rKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKHN0YXRlLCBcInVua25vd24gZXNjYXBlIHNlcXVlbmNlXCIpO1xuICAgICAgfVxuXG4gICAgICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb247XG4gICAgfSBlbHNlIGlmIChpc0VPTChjaCkpIHtcbiAgICAgIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQsIHRydWUpO1xuICAgICAgd3JpdGVGb2xkZWRMaW5lcyhzdGF0ZSwgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgZmFsc2UsIG5vZGVJbmRlbnQpKTtcbiAgICAgIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJlxuICAgICAgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKVxuICAgICkge1xuICAgICAgcmV0dXJuIHRocm93RXJyb3IoXG4gICAgICAgIHN0YXRlLFxuICAgICAgICBcInVuZXhwZWN0ZWQgZW5kIG9mIHRoZSBkb2N1bWVudCB3aXRoaW4gYSBkb3VibGUgcXVvdGVkIHNjYWxhclwiLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucG9zaXRpb24rKztcbiAgICAgIGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhyb3dFcnJvcihcbiAgICBzdGF0ZSxcbiAgICBcInVuZXhwZWN0ZWQgZW5kIG9mIHRoZSBzdHJlYW0gd2l0aGluIGEgZG91YmxlIHF1b3RlZCBzY2FsYXJcIixcbiAgKTtcbn1cblxuZnVuY3Rpb24gcmVhZEZsb3dDb2xsZWN0aW9uKHN0YXRlOiBMb2FkZXJTdGF0ZSwgbm9kZUluZGVudDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuICBsZXQgdGVybWluYXRvcjogbnVtYmVyO1xuICBsZXQgaXNNYXBwaW5nID0gdHJ1ZTtcbiAgbGV0IHJlc3VsdDogUmVzdWx0VHlwZSA9IHt9O1xuICBpZiAoY2ggPT09IDB4NWIgLyogWyAqLykge1xuICAgIHRlcm1pbmF0b3IgPSAweDVkOyAvKiBdICovXG4gICAgaXNNYXBwaW5nID0gZmFsc2U7XG4gICAgcmVzdWx0ID0gW107XG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4N2IgLyogeyAqLykge1xuICAgIHRlcm1pbmF0b3IgPSAweDdkOyAvKiB9ICovXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKFxuICAgIHN0YXRlLmFuY2hvciAhPT0gbnVsbCAmJlxuICAgIHR5cGVvZiBzdGF0ZS5hbmNob3IgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICB0eXBlb2Ygc3RhdGUuYW5jaG9yTWFwICE9PSBcInVuZGVmaW5lZFwiXG4gICkge1xuICAgIHN0YXRlLmFuY2hvck1hcFtzdGF0ZS5hbmNob3JdID0gcmVzdWx0O1xuICB9XG5cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuXG4gIGNvbnN0IHRhZyA9IHN0YXRlLnRhZztcbiAgY29uc3QgYW5jaG9yID0gc3RhdGUuYW5jaG9yO1xuICBsZXQgcmVhZE5leHQgPSB0cnVlO1xuICBsZXQgdmFsdWVOb2RlID0gbnVsbDtcbiAgbGV0IGtleU5vZGUgPSBudWxsO1xuICBsZXQga2V5VGFnOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgbGV0IGlzRXhwbGljaXRQYWlyID0gZmFsc2U7XG4gIGxldCBpc1BhaXIgPSBmYWxzZTtcbiAgbGV0IGZvbGxvd2luZyA9IDA7XG4gIGxldCBsaW5lID0gMDtcbiAgY29uc3Qgb3ZlcnJpZGFibGVLZXlzOiBBcnJheU9iamVjdDxib29sZWFuPiA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIG5vZGVJbmRlbnQpO1xuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICAgIGlmIChjaCA9PT0gdGVybWluYXRvcikge1xuICAgICAgc3RhdGUucG9zaXRpb24rKztcbiAgICAgIHN0YXRlLnRhZyA9IHRhZztcbiAgICAgIHN0YXRlLmFuY2hvciA9IGFuY2hvcjtcbiAgICAgIHN0YXRlLmtpbmQgPSBpc01hcHBpbmcgPyBcIm1hcHBpbmdcIiA6IFwic2VxdWVuY2VcIjtcbiAgICAgIHN0YXRlLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoIXJlYWROZXh0KSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihzdGF0ZSwgXCJtaXNzZWQgY29tbWEgYmV0d2VlbiBmbG93IGNvbGxlY3Rpb24gZW50cmllc1wiKTtcbiAgICB9XG5cbiAgICBrZXlUYWcgPSBrZXlOb2RlID0gdmFsdWVOb2RlID0gbnVsbDtcbiAgICBpc1BhaXIgPSBpc0V4cGxpY2l0UGFpciA9IGZhbHNlO1xuXG4gICAgaWYgKGNoID09PSAweDNmIC8qID8gKi8pIHtcbiAgICAgIGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKTtcblxuICAgICAgaWYgKGlzV3NPckVvbChmb2xsb3dpbmcpKSB7XG4gICAgICAgIGlzUGFpciA9IGlzRXhwbGljaXRQYWlyID0gdHJ1ZTtcbiAgICAgICAgc3RhdGUucG9zaXRpb24rKztcbiAgICAgICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGluZSA9IHN0YXRlLmxpbmU7XG4gICAgY29tcG9zZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfRkxPV19JTiwgZmFsc2UsIHRydWUpO1xuICAgIGtleVRhZyA9IHN0YXRlLnRhZyB8fCBudWxsO1xuICAgIGtleU5vZGUgPSBzdGF0ZS5yZXN1bHQ7XG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudCk7XG5cbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuXG4gICAgaWYgKChpc0V4cGxpY2l0UGFpciB8fCBzdGF0ZS5saW5lID09PSBsaW5lKSAmJiBjaCA9PT0gMHgzYSAvKiA6ICovKSB7XG4gICAgICBpc1BhaXIgPSB0cnVlO1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudCk7XG4gICAgICBjb21wb3NlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9GTE9XX0lOLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICB2YWx1ZU5vZGUgPSBzdGF0ZS5yZXN1bHQ7XG4gICAgfVxuXG4gICAgaWYgKGlzTWFwcGluZykge1xuICAgICAgc3RvcmVNYXBwaW5nUGFpcihcbiAgICAgICAgc3RhdGUsXG4gICAgICAgIHJlc3VsdCxcbiAgICAgICAgb3ZlcnJpZGFibGVLZXlzLFxuICAgICAgICBrZXlUYWcsXG4gICAgICAgIGtleU5vZGUsXG4gICAgICAgIHZhbHVlTm9kZSxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChpc1BhaXIpIHtcbiAgICAgIChyZXN1bHQgYXMgQXJyYXlPYmplY3RbXSkucHVzaChcbiAgICAgICAgc3RvcmVNYXBwaW5nUGFpcihcbiAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIG92ZXJyaWRhYmxlS2V5cyxcbiAgICAgICAgICBrZXlUYWcsXG4gICAgICAgICAga2V5Tm9kZSxcbiAgICAgICAgICB2YWx1ZU5vZGUsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAocmVzdWx0IGFzIFJlc3VsdFR5cGVbXSkucHVzaChrZXlOb2RlIGFzIFJlc3VsdFR5cGUpO1xuICAgIH1cblxuICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIG5vZGVJbmRlbnQpO1xuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICAgIGlmIChjaCA9PT0gMHgyYyAvKiAsICovKSB7XG4gICAgICByZWFkTmV4dCA9IHRydWU7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlYWROZXh0ID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRocm93RXJyb3IoXG4gICAgc3RhdGUsXG4gICAgXCJ1bmV4cGVjdGVkIGVuZCBvZiB0aGUgc3RyZWFtIHdpdGhpbiBhIGZsb3cgY29sbGVjdGlvblwiLFxuICApO1xufVxuXG5mdW5jdGlvbiByZWFkQmxvY2tTY2FsYXIoc3RhdGU6IExvYWRlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIpOiBib29sZWFuIHtcbiAgbGV0IGNob21waW5nID0gQ0hPTVBJTkdfQ0xJUDtcbiAgbGV0IGRpZFJlYWRDb250ZW50ID0gZmFsc2U7XG4gIGxldCBkZXRlY3RlZEluZGVudCA9IGZhbHNlO1xuICBsZXQgdGV4dEluZGVudCA9IG5vZGVJbmRlbnQ7XG4gIGxldCBlbXB0eUxpbmVzID0gMDtcbiAgbGV0IGF0TW9yZUluZGVudGVkID0gZmFsc2U7XG5cbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG5cbiAgbGV0IGZvbGRpbmcgPSBmYWxzZTtcbiAgaWYgKGNoID09PSAweDdjIC8qIHwgKi8pIHtcbiAgICBmb2xkaW5nID0gZmFsc2U7XG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4M2UgLyogPiAqLykge1xuICAgIGZvbGRpbmcgPSB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0YXRlLmtpbmQgPSBcInNjYWxhclwiO1xuICBzdGF0ZS5yZXN1bHQgPSBcIlwiO1xuXG4gIGxldCB0bXAgPSAwO1xuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG5cbiAgICBpZiAoY2ggPT09IDB4MmIgfHwgLyogKyAqLyBjaCA9PT0gMHgyZCAvKiAtICovKSB7XG4gICAgICBpZiAoQ0hPTVBJTkdfQ0xJUCA9PT0gY2hvbXBpbmcpIHtcbiAgICAgICAgY2hvbXBpbmcgPSBjaCA9PT0gMHgyYiAvKiArICovID8gQ0hPTVBJTkdfS0VFUCA6IENIT01QSU5HX1NUUklQO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3Ioc3RhdGUsIFwicmVwZWF0IG9mIGEgY2hvbXBpbmcgbW9kZSBpZGVudGlmaWVyXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoKHRtcCA9IGZyb21EZWNpbWFsQ29kZShjaCkpID49IDApIHtcbiAgICAgIGlmICh0bXAgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoXG4gICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgXCJiYWQgZXhwbGljaXQgaW5kZW50YXRpb24gd2lkdGggb2YgYSBibG9jayBzY2FsYXI7IGl0IGNhbm5vdCBiZSBsZXNzIHRoYW4gb25lXCIsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKCFkZXRlY3RlZEluZGVudCkge1xuICAgICAgICB0ZXh0SW5kZW50ID0gbm9kZUluZGVudCArIHRtcCAtIDE7XG4gICAgICAgIGRldGVjdGVkSW5kZW50ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKHN0YXRlLCBcInJlcGVhdCBvZiBhbiBpbmRlbnRhdGlvbiB3aWR0aCBpZGVudGlmaWVyXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgIGRvIHtcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICB9IHdoaWxlIChpc1doaXRlU3BhY2UoY2gpKTtcblxuICAgIGlmIChjaCA9PT0gMHgyMyAvKiAjICovKSB7XG4gICAgICBkbyB7XG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICAgIH0gd2hpbGUgKCFpc0VPTChjaCkgJiYgY2ggIT09IDApO1xuICAgIH1cbiAgfVxuXG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIHJlYWRMaW5lQnJlYWsoc3RhdGUpO1xuICAgIHN0YXRlLmxpbmVJbmRlbnQgPSAwO1xuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICAgIHdoaWxlIChcbiAgICAgICghZGV0ZWN0ZWRJbmRlbnQgfHwgc3RhdGUubGluZUluZGVudCA8IHRleHRJbmRlbnQpICYmXG4gICAgICBjaCA9PT0gMHgyMCAvKiBTcGFjZSAqL1xuICAgICkge1xuICAgICAgc3RhdGUubGluZUluZGVudCsrO1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgIH1cblxuICAgIGlmICghZGV0ZWN0ZWRJbmRlbnQgJiYgc3RhdGUubGluZUluZGVudCA+IHRleHRJbmRlbnQpIHtcbiAgICAgIHRleHRJbmRlbnQgPSBzdGF0ZS5saW5lSW5kZW50O1xuICAgIH1cblxuICAgIGlmIChpc0VPTChjaCkpIHtcbiAgICAgIGVtcHR5TGluZXMrKztcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIEVuZCBvZiB0aGUgc2NhbGFyLlxuICAgIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgdGV4dEluZGVudCkge1xuICAgICAgLy8gUGVyZm9ybSB0aGUgY2hvbXBpbmcuXG4gICAgICBpZiAoY2hvbXBpbmcgPT09IENIT01QSU5HX0tFRVApIHtcbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoXG4gICAgICAgICAgXCJcXG5cIixcbiAgICAgICAgICBkaWRSZWFkQ29udGVudCA/IDEgKyBlbXB0eUxpbmVzIDogZW1wdHlMaW5lcyxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAoY2hvbXBpbmcgPT09IENIT01QSU5HX0NMSVApIHtcbiAgICAgICAgaWYgKGRpZFJlYWRDb250ZW50KSB7XG4gICAgICAgICAgLy8gaS5lLiBvbmx5IGlmIHRoZSBzY2FsYXIgaXMgbm90IGVtcHR5LlxuICAgICAgICAgIHN0YXRlLnJlc3VsdCArPSBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEJyZWFrIHRoaXMgYHdoaWxlYCBjeWNsZSBhbmQgZ28gdG8gdGhlIGZ1bmN0aW9uJ3MgZXBpbG9ndWUuXG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBGb2xkZWQgc3R5bGU6IHVzZSBmYW5jeSBydWxlcyB0byBoYW5kbGUgbGluZSBicmVha3MuXG4gICAgaWYgKGZvbGRpbmcpIHtcbiAgICAgIC8vIExpbmVzIHN0YXJ0aW5nIHdpdGggd2hpdGUgc3BhY2UgY2hhcmFjdGVycyAobW9yZS1pbmRlbnRlZCBsaW5lcykgYXJlIG5vdCBmb2xkZWQuXG4gICAgICBpZiAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgICBhdE1vcmVJbmRlbnRlZCA9IHRydWU7XG4gICAgICAgIC8vIGV4Y2VwdCBmb3IgdGhlIGZpcnN0IGNvbnRlbnQgbGluZSAoY2YuIEV4YW1wbGUgOC4xKVxuICAgICAgICBzdGF0ZS5yZXN1bHQgKz0gY29tbW9uLnJlcGVhdChcbiAgICAgICAgICBcIlxcblwiLFxuICAgICAgICAgIGRpZFJlYWRDb250ZW50ID8gMSArIGVtcHR5TGluZXMgOiBlbXB0eUxpbmVzLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIEVuZCBvZiBtb3JlLWluZGVudGVkIGJsb2NrLlxuICAgICAgfSBlbHNlIGlmIChhdE1vcmVJbmRlbnRlZCkge1xuICAgICAgICBhdE1vcmVJbmRlbnRlZCA9IGZhbHNlO1xuICAgICAgICBzdGF0ZS5yZXN1bHQgKz0gY29tbW9uLnJlcGVhdChcIlxcblwiLCBlbXB0eUxpbmVzICsgMSk7XG5cbiAgICAgICAgLy8gSnVzdCBvbmUgbGluZSBicmVhayAtIHBlcmNlaXZlIGFzIHRoZSBzYW1lIGxpbmUuXG4gICAgICB9IGVsc2UgaWYgKGVtcHR5TGluZXMgPT09IDApIHtcbiAgICAgICAgaWYgKGRpZFJlYWRDb250ZW50KSB7XG4gICAgICAgICAgLy8gaS5lLiBvbmx5IGlmIHdlIGhhdmUgYWxyZWFkeSByZWFkIHNvbWUgc2NhbGFyIGNvbnRlbnQuXG4gICAgICAgICAgc3RhdGUucmVzdWx0ICs9IFwiIFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V2ZXJhbCBsaW5lIGJyZWFrcyAtIHBlcmNlaXZlIGFzIGRpZmZlcmVudCBsaW5lcy5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlLnJlc3VsdCArPSBjb21tb24ucmVwZWF0KFwiXFxuXCIsIGVtcHR5TGluZXMpO1xuICAgICAgfVxuXG4gICAgICAvLyBMaXRlcmFsIHN0eWxlOiBqdXN0IGFkZCBleGFjdCBudW1iZXIgb2YgbGluZSBicmVha3MgYmV0d2VlbiBjb250ZW50IGxpbmVzLlxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBLZWVwIGFsbCBsaW5lIGJyZWFrcyBleGNlcHQgdGhlIGhlYWRlciBsaW5lIGJyZWFrLlxuICAgICAgc3RhdGUucmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoXG4gICAgICAgIFwiXFxuXCIsXG4gICAgICAgIGRpZFJlYWRDb250ZW50ID8gMSArIGVtcHR5TGluZXMgOiBlbXB0eUxpbmVzLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBkaWRSZWFkQ29udGVudCA9IHRydWU7XG4gICAgZGV0ZWN0ZWRJbmRlbnQgPSB0cnVlO1xuICAgIGVtcHR5TGluZXMgPSAwO1xuICAgIGNvbnN0IGNhcHR1cmVTdGFydCA9IHN0YXRlLnBvc2l0aW9uO1xuXG4gICAgd2hpbGUgKCFpc0VPTChjaCkgJiYgY2ggIT09IDApIHtcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBjYXB0dXJlU2VnbWVudChzdGF0ZSwgY2FwdHVyZVN0YXJ0LCBzdGF0ZS5wb3NpdGlvbiwgZmFsc2UpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHJlYWRCbG9ja1NlcXVlbmNlKHN0YXRlOiBMb2FkZXJTdGF0ZSwgbm9kZUluZGVudDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIGxldCBsaW5lOiBudW1iZXI7XG4gIGxldCBmb2xsb3dpbmc6IG51bWJlcjtcbiAgbGV0IGRldGVjdGVkID0gZmFsc2U7XG4gIGxldCBjaDogbnVtYmVyO1xuICBjb25zdCB0YWcgPSBzdGF0ZS50YWc7XG4gIGNvbnN0IGFuY2hvciA9IHN0YXRlLmFuY2hvcjtcbiAgY29uc3QgcmVzdWx0OiB1bmtub3duW10gPSBbXTtcblxuICBpZiAoXG4gICAgc3RhdGUuYW5jaG9yICE9PSBudWxsICYmXG4gICAgdHlwZW9mIHN0YXRlLmFuY2hvciAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgIHR5cGVvZiBzdGF0ZS5hbmNob3JNYXAgIT09IFwidW5kZWZpbmVkXCJcbiAgKSB7XG4gICAgc3RhdGUuYW5jaG9yTWFwW3N0YXRlLmFuY2hvcl0gPSByZXN1bHQ7XG4gIH1cblxuICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuXG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIGlmIChjaCAhPT0gMHgyZCAvKiAtICovKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBmb2xsb3dpbmcgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSk7XG5cbiAgICBpZiAoIWlzV3NPckVvbChmb2xsb3dpbmcpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBkZXRlY3RlZCA9IHRydWU7XG4gICAgc3RhdGUucG9zaXRpb24rKztcblxuICAgIGlmIChza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSkpIHtcbiAgICAgIGlmIChzdGF0ZS5saW5lSW5kZW50IDw9IG5vZGVJbmRlbnQpIHtcbiAgICAgICAgcmVzdWx0LnB1c2gobnVsbCk7XG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxpbmUgPSBzdGF0ZS5saW5lO1xuICAgIGNvbXBvc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0JMT0NLX0lOLCBmYWxzZSwgdHJ1ZSk7XG4gICAgcmVzdWx0LnB1c2goc3RhdGUucmVzdWx0KTtcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSk7XG5cbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuXG4gICAgaWYgKChzdGF0ZS5saW5lID09PSBsaW5lIHx8IHN0YXRlLmxpbmVJbmRlbnQgPiBub2RlSW5kZW50KSAmJiBjaCAhPT0gMCkge1xuICAgICAgcmV0dXJuIHRocm93RXJyb3Ioc3RhdGUsIFwiYmFkIGluZGVudGF0aW9uIG9mIGEgc2VxdWVuY2UgZW50cnlcIik7XG4gICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgbm9kZUluZGVudCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKGRldGVjdGVkKSB7XG4gICAgc3RhdGUudGFnID0gdGFnO1xuICAgIHN0YXRlLmFuY2hvciA9IGFuY2hvcjtcbiAgICBzdGF0ZS5raW5kID0gXCJzZXF1ZW5jZVwiO1xuICAgIHN0YXRlLnJlc3VsdCA9IHJlc3VsdDtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHJlYWRCbG9ja01hcHBpbmcoXG4gIHN0YXRlOiBMb2FkZXJTdGF0ZSxcbiAgbm9kZUluZGVudDogbnVtYmVyLFxuICBmbG93SW5kZW50OiBudW1iZXIsXG4pOiBib29sZWFuIHtcbiAgY29uc3QgdGFnID0gc3RhdGUudGFnO1xuICBjb25zdCBhbmNob3IgPSBzdGF0ZS5hbmNob3I7XG4gIGNvbnN0IHJlc3VsdCA9IHt9O1xuICBjb25zdCBvdmVycmlkYWJsZUtleXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBsZXQgZm9sbG93aW5nOiBudW1iZXI7XG4gIGxldCBhbGxvd0NvbXBhY3QgPSBmYWxzZTtcbiAgbGV0IGxpbmU6IG51bWJlcjtcbiAgbGV0IHBvczogbnVtYmVyO1xuICBsZXQga2V5VGFnID0gbnVsbDtcbiAgbGV0IGtleU5vZGUgPSBudWxsO1xuICBsZXQgdmFsdWVOb2RlID0gbnVsbDtcbiAgbGV0IGF0RXhwbGljaXRLZXkgPSBmYWxzZTtcbiAgbGV0IGRldGVjdGVkID0gZmFsc2U7XG4gIGxldCBjaDogbnVtYmVyO1xuXG4gIGlmIChcbiAgICBzdGF0ZS5hbmNob3IgIT09IG51bGwgJiZcbiAgICB0eXBlb2Ygc3RhdGUuYW5jaG9yICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgdHlwZW9mIHN0YXRlLmFuY2hvck1hcCAhPT0gXCJ1bmRlZmluZWRcIlxuICApIHtcbiAgICBzdGF0ZS5hbmNob3JNYXBbc3RhdGUuYW5jaG9yXSA9IHJlc3VsdDtcbiAgfVxuXG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG5cbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpO1xuICAgIGxpbmUgPSBzdGF0ZS5saW5lOyAvLyBTYXZlIHRoZSBjdXJyZW50IGxpbmUuXG4gICAgcG9zID0gc3RhdGUucG9zaXRpb247XG5cbiAgICAvL1xuICAgIC8vIEV4cGxpY2l0IG5vdGF0aW9uIGNhc2UuIFRoZXJlIGFyZSB0d28gc2VwYXJhdGUgYmxvY2tzOlxuICAgIC8vIGZpcnN0IGZvciB0aGUga2V5IChkZW5vdGVkIGJ5IFwiP1wiKSBhbmQgc2Vjb25kIGZvciB0aGUgdmFsdWUgKGRlbm90ZWQgYnkgXCI6XCIpXG4gICAgLy9cbiAgICBpZiAoKGNoID09PSAweDNmIHx8IC8qID8gKi8gY2ggPT09IDB4M2EpICYmIC8qIDogKi8gaXNXc09yRW9sKGZvbGxvd2luZykpIHtcbiAgICAgIGlmIChjaCA9PT0gMHgzZiAvKiA/ICovKSB7XG4gICAgICAgIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgICAgICAgc3RvcmVNYXBwaW5nUGFpcihcbiAgICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgICAgb3ZlcnJpZGFibGVLZXlzLFxuICAgICAgICAgICAga2V5VGFnIGFzIHN0cmluZyxcbiAgICAgICAgICAgIGtleU5vZGUsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICk7XG4gICAgICAgICAga2V5VGFnID0ga2V5Tm9kZSA9IHZhbHVlTm9kZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBkZXRlY3RlZCA9IHRydWU7XG4gICAgICAgIGF0RXhwbGljaXRLZXkgPSB0cnVlO1xuICAgICAgICBhbGxvd0NvbXBhY3QgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgICAgIC8vIGkuZS4gMHgzQS8qIDogKi8gPT09IGNoYXJhY3RlciBhZnRlciB0aGUgZXhwbGljaXQga2V5LlxuICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2U7XG4gICAgICAgIGFsbG93Q29tcGFjdCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihcbiAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICBcImluY29tcGxldGUgZXhwbGljaXQgbWFwcGluZyBwYWlyOyBhIGtleSBub2RlIGlzIG1pc3NlZDsgb3IgZm9sbG93ZWQgYnkgYSBub24tdGFidWxhdGVkIGVtcHR5IGxpbmVcIixcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGUucG9zaXRpb24gKz0gMTtcbiAgICAgIGNoID0gZm9sbG93aW5nO1xuXG4gICAgICAvL1xuICAgICAgLy8gSW1wbGljaXQgbm90YXRpb24gY2FzZS4gRmxvdy1zdHlsZSBub2RlIGFzIHRoZSBrZXkgZmlyc3QsIHRoZW4gXCI6XCIsIGFuZCB0aGUgdmFsdWUuXG4gICAgICAvL1xuICAgIH0gZWxzZSBpZiAoY29tcG9zZU5vZGUoc3RhdGUsIGZsb3dJbmRlbnQsIENPTlRFWFRfRkxPV19PVVQsIGZhbHNlLCB0cnVlKSkge1xuICAgICAgaWYgKHN0YXRlLmxpbmUgPT09IGxpbmUpIHtcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICAgICAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaCA9PT0gMHgzYSAvKiA6ICovKSB7XG4gICAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuXG4gICAgICAgICAgaWYgKCFpc1dzT3JFb2woY2gpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihcbiAgICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICAgIFwiYSB3aGl0ZXNwYWNlIGNoYXJhY3RlciBpcyBleHBlY3RlZCBhZnRlciB0aGUga2V5LXZhbHVlIHNlcGFyYXRvciB3aXRoaW4gYSBibG9jayBtYXBwaW5nXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgICAgICAgICBzdG9yZU1hcHBpbmdQYWlyKFxuICAgICAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgICAgICBvdmVycmlkYWJsZUtleXMsXG4gICAgICAgICAgICAgIGtleVRhZyBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgIGtleU5vZGUsXG4gICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAga2V5VGFnID0ga2V5Tm9kZSA9IHZhbHVlTm9kZSA9IG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGV0ZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgIGF0RXhwbGljaXRLZXkgPSBmYWxzZTtcbiAgICAgICAgICBhbGxvd0NvbXBhY3QgPSBmYWxzZTtcbiAgICAgICAgICBrZXlUYWcgPSBzdGF0ZS50YWc7XG4gICAgICAgICAga2V5Tm9kZSA9IHN0YXRlLnJlc3VsdDtcbiAgICAgICAgfSBlbHNlIGlmIChkZXRlY3RlZCkge1xuICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKFxuICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICBcImNhbiBub3QgcmVhZCBhbiBpbXBsaWNpdCBtYXBwaW5nIHBhaXI7IGEgY29sb24gaXMgbWlzc2VkXCIsXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGF0ZS50YWcgPSB0YWc7XG4gICAgICAgICAgc3RhdGUuYW5jaG9yID0gYW5jaG9yO1xuICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBLZWVwIHRoZSByZXN1bHQgb2YgYGNvbXBvc2VOb2RlYC5cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkZXRlY3RlZCkge1xuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihcbiAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICBcImNhbiBub3QgcmVhZCBhIGJsb2NrIG1hcHBpbmcgZW50cnk7IGEgbXVsdGlsaW5lIGtleSBtYXkgbm90IGJlIGFuIGltcGxpY2l0IGtleVwiLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUudGFnID0gdGFnO1xuICAgICAgICBzdGF0ZS5hbmNob3IgPSBhbmNob3I7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBLZWVwIHRoZSByZXN1bHQgb2YgYGNvbXBvc2VOb2RlYC5cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7IC8vIFJlYWRpbmcgaXMgZG9uZS4gR28gdG8gdGhlIGVwaWxvZ3VlLlxuICAgIH1cblxuICAgIC8vXG4gICAgLy8gQ29tbW9uIHJlYWRpbmcgY29kZSBmb3IgYm90aCBleHBsaWNpdCBhbmQgaW1wbGljaXQgbm90YXRpb25zLlxuICAgIC8vXG4gICAgaWYgKHN0YXRlLmxpbmUgPT09IGxpbmUgfHwgc3RhdGUubGluZUluZGVudCA+IG5vZGVJbmRlbnQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgY29tcG9zZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfQkxPQ0tfT1VULCB0cnVlLCBhbGxvd0NvbXBhY3QpXG4gICAgICApIHtcbiAgICAgICAgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgICBrZXlOb2RlID0gc3RhdGUucmVzdWx0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlTm9kZSA9IHN0YXRlLnJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgc3RvcmVNYXBwaW5nUGFpcihcbiAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgb3ZlcnJpZGFibGVLZXlzLFxuICAgICAgICAgIGtleVRhZyBhcyBzdHJpbmcsXG4gICAgICAgICAga2V5Tm9kZSxcbiAgICAgICAgICB2YWx1ZU5vZGUsXG4gICAgICAgICAgbGluZSxcbiAgICAgICAgICBwb3MsXG4gICAgICAgICk7XG4gICAgICAgIGtleVRhZyA9IGtleU5vZGUgPSB2YWx1ZU5vZGUgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSk7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuICAgIH1cblxuICAgIGlmIChzdGF0ZS5saW5lSW5kZW50ID4gbm9kZUluZGVudCAmJiBjaCAhPT0gMCkge1xuICAgICAgcmV0dXJuIHRocm93RXJyb3Ioc3RhdGUsIFwiYmFkIGluZGVudGF0aW9uIG9mIGEgbWFwcGluZyBlbnRyeVwiKTtcbiAgICB9IGVsc2UgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50KSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBFcGlsb2d1ZS5cbiAgLy9cblxuICAvLyBTcGVjaWFsIGNhc2U6IGxhc3QgbWFwcGluZydzIG5vZGUgY29udGFpbnMgb25seSB0aGUga2V5IGluIGV4cGxpY2l0IG5vdGF0aW9uLlxuICBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgIHN0b3JlTWFwcGluZ1BhaXIoXG4gICAgICBzdGF0ZSxcbiAgICAgIHJlc3VsdCxcbiAgICAgIG92ZXJyaWRhYmxlS2V5cyxcbiAgICAgIGtleVRhZyBhcyBzdHJpbmcsXG4gICAgICBrZXlOb2RlLFxuICAgICAgbnVsbCxcbiAgICApO1xuICB9XG5cbiAgLy8gRXhwb3NlIHRoZSByZXN1bHRpbmcgbWFwcGluZy5cbiAgaWYgKGRldGVjdGVkKSB7XG4gICAgc3RhdGUudGFnID0gdGFnO1xuICAgIHN0YXRlLmFuY2hvciA9IGFuY2hvcjtcbiAgICBzdGF0ZS5raW5kID0gXCJtYXBwaW5nXCI7XG4gICAgc3RhdGUucmVzdWx0ID0gcmVzdWx0O1xuICB9XG5cbiAgcmV0dXJuIGRldGVjdGVkO1xufVxuXG5mdW5jdGlvbiByZWFkVGFnUHJvcGVydHkoc3RhdGU6IExvYWRlclN0YXRlKTogYm9vbGVhbiB7XG4gIGxldCBwb3NpdGlvbjogbnVtYmVyO1xuICBsZXQgaXNWZXJiYXRpbSA9IGZhbHNlO1xuICBsZXQgaXNOYW1lZCA9IGZhbHNlO1xuICBsZXQgdGFnSGFuZGxlID0gXCJcIjtcbiAgbGV0IHRhZ05hbWU6IHN0cmluZztcbiAgbGV0IGNoOiBudW1iZXI7XG5cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICBpZiAoY2ggIT09IDB4MjEgLyogISAqLykgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChzdGF0ZS50YWcgIT09IG51bGwpIHtcbiAgICByZXR1cm4gdGhyb3dFcnJvcihzdGF0ZSwgXCJkdXBsaWNhdGlvbiBvZiBhIHRhZyBwcm9wZXJ0eVwiKTtcbiAgfVxuXG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcblxuICBpZiAoY2ggPT09IDB4M2MgLyogPCAqLykge1xuICAgIGlzVmVyYmF0aW0gPSB0cnVlO1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgfSBlbHNlIGlmIChjaCA9PT0gMHgyMSAvKiAhICovKSB7XG4gICAgaXNOYW1lZCA9IHRydWU7XG4gICAgdGFnSGFuZGxlID0gXCIhIVwiO1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgfSBlbHNlIHtcbiAgICB0YWdIYW5kbGUgPSBcIiFcIjtcbiAgfVxuXG4gIHBvc2l0aW9uID0gc3RhdGUucG9zaXRpb247XG5cbiAgaWYgKGlzVmVyYmF0aW0pIHtcbiAgICBkbyB7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgfSB3aGlsZSAoY2ggIT09IDAgJiYgY2ggIT09IDB4M2UgLyogPiAqLyk7XG5cbiAgICBpZiAoc3RhdGUucG9zaXRpb24gPCBzdGF0ZS5sZW5ndGgpIHtcbiAgICAgIHRhZ05hbWUgPSBzdGF0ZS5pbnB1dC5zbGljZShwb3NpdGlvbiwgc3RhdGUucG9zaXRpb24pO1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihcbiAgICAgICAgc3RhdGUsXG4gICAgICAgIFwidW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSB2ZXJiYXRpbSB0YWdcIixcbiAgICAgICk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNXc09yRW9sKGNoKSkge1xuICAgICAgaWYgKGNoID09PSAweDIxIC8qICEgKi8pIHtcbiAgICAgICAgaWYgKCFpc05hbWVkKSB7XG4gICAgICAgICAgdGFnSGFuZGxlID0gc3RhdGUuaW5wdXQuc2xpY2UocG9zaXRpb24gLSAxLCBzdGF0ZS5wb3NpdGlvbiArIDEpO1xuXG4gICAgICAgICAgaWYgKCFQQVRURVJOX1RBR19IQU5ETEUudGVzdCh0YWdIYW5kbGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihcbiAgICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICAgIFwibmFtZWQgdGFnIGhhbmRsZSBjYW5ub3QgY29udGFpbiBzdWNoIGNoYXJhY3RlcnNcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaXNOYW1lZCA9IHRydWU7XG4gICAgICAgICAgcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvbiArIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoXG4gICAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICAgIFwidGFnIHN1ZmZpeCBjYW5ub3QgY29udGFpbiBleGNsYW1hdGlvbiBtYXJrc1wiLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgIH1cblxuICAgIHRhZ05hbWUgPSBzdGF0ZS5pbnB1dC5zbGljZShwb3NpdGlvbiwgc3RhdGUucG9zaXRpb24pO1xuXG4gICAgaWYgKFBBVFRFUk5fRkxPV19JTkRJQ0FUT1JTLnRlc3QodGFnTmFtZSkpIHtcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKFxuICAgICAgICBzdGF0ZSxcbiAgICAgICAgXCJ0YWcgc3VmZml4IGNhbm5vdCBjb250YWluIGZsb3cgaW5kaWNhdG9yIGNoYXJhY3RlcnNcIixcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRhZ05hbWUgJiYgIVBBVFRFUk5fVEFHX1VSSS50ZXN0KHRhZ05hbWUpKSB7XG4gICAgcmV0dXJuIHRocm93RXJyb3IoXG4gICAgICBzdGF0ZSxcbiAgICAgIGB0YWcgbmFtZSBjYW5ub3QgY29udGFpbiBzdWNoIGNoYXJhY3RlcnM6ICR7dGFnTmFtZX1gLFxuICAgICk7XG4gIH1cblxuICBpZiAoaXNWZXJiYXRpbSkge1xuICAgIHN0YXRlLnRhZyA9IHRhZ05hbWU7XG4gIH0gZWxzZSBpZiAoXG4gICAgdHlwZW9mIHN0YXRlLnRhZ01hcCAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgIGhhc093bihzdGF0ZS50YWdNYXAsIHRhZ0hhbmRsZSlcbiAgKSB7XG4gICAgc3RhdGUudGFnID0gc3RhdGUudGFnTWFwW3RhZ0hhbmRsZV0gKyB0YWdOYW1lO1xuICB9IGVsc2UgaWYgKHRhZ0hhbmRsZSA9PT0gXCIhXCIpIHtcbiAgICBzdGF0ZS50YWcgPSBgISR7dGFnTmFtZX1gO1xuICB9IGVsc2UgaWYgKHRhZ0hhbmRsZSA9PT0gXCIhIVwiKSB7XG4gICAgc3RhdGUudGFnID0gYHRhZzp5YW1sLm9yZywyMDAyOiR7dGFnTmFtZX1gO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aHJvd0Vycm9yKHN0YXRlLCBgdW5kZWNsYXJlZCB0YWcgaGFuZGxlIFwiJHt0YWdIYW5kbGV9XCJgKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiByZWFkQW5jaG9yUHJvcGVydHkoc3RhdGU6IExvYWRlclN0YXRlKTogYm9vbGVhbiB7XG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuICBpZiAoY2ggIT09IDB4MjYgLyogJiAqLykgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChzdGF0ZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICByZXR1cm4gdGhyb3dFcnJvcihzdGF0ZSwgXCJkdXBsaWNhdGlvbiBvZiBhbiBhbmNob3IgcHJvcGVydHlcIik7XG4gIH1cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuXG4gIGNvbnN0IHBvc2l0aW9uID0gc3RhdGUucG9zaXRpb247XG4gIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNXc09yRW9sKGNoKSAmJiAhaXNGbG93SW5kaWNhdG9yKGNoKSkge1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgfVxuXG4gIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gcG9zaXRpb24pIHtcbiAgICByZXR1cm4gdGhyb3dFcnJvcihcbiAgICAgIHN0YXRlLFxuICAgICAgXCJuYW1lIG9mIGFuIGFuY2hvciBub2RlIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgY2hhcmFjdGVyXCIsXG4gICAgKTtcbiAgfVxuXG4gIHN0YXRlLmFuY2hvciA9IHN0YXRlLmlucHV0LnNsaWNlKHBvc2l0aW9uLCBzdGF0ZS5wb3NpdGlvbik7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiByZWFkQWxpYXMoc3RhdGU6IExvYWRlclN0YXRlKTogYm9vbGVhbiB7XG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuXG4gIGlmIChjaCAhPT0gMHgyYSAvKiAqICovKSByZXR1cm4gZmFsc2U7XG5cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICBjb25zdCBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvbjtcblxuICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzV3NPckVvbChjaCkgJiYgIWlzRmxvd0luZGljYXRvcihjaCkpIHtcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gIH1cblxuICBpZiAoc3RhdGUucG9zaXRpb24gPT09IF9wb3NpdGlvbikge1xuICAgIHJldHVybiB0aHJvd0Vycm9yKFxuICAgICAgc3RhdGUsXG4gICAgICBcIm5hbWUgb2YgYW4gYWxpYXMgbm9kZSBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIGNoYXJhY3RlclwiLFxuICAgICk7XG4gIH1cblxuICBjb25zdCBhbGlhcyA9IHN0YXRlLmlucHV0LnNsaWNlKF9wb3NpdGlvbiwgc3RhdGUucG9zaXRpb24pO1xuICBpZiAoXG4gICAgdHlwZW9mIHN0YXRlLmFuY2hvck1hcCAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICFoYXNPd24oc3RhdGUuYW5jaG9yTWFwLCBhbGlhcylcbiAgKSB7XG4gICAgcmV0dXJuIHRocm93RXJyb3Ioc3RhdGUsIGB1bmlkZW50aWZpZWQgYWxpYXMgXCIke2FsaWFzfVwiYCk7XG4gIH1cblxuICBpZiAodHlwZW9mIHN0YXRlLmFuY2hvck1hcCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHN0YXRlLnJlc3VsdCA9IHN0YXRlLmFuY2hvck1hcFthbGlhc107XG4gIH1cbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gY29tcG9zZU5vZGUoXG4gIHN0YXRlOiBMb2FkZXJTdGF0ZSxcbiAgcGFyZW50SW5kZW50OiBudW1iZXIsXG4gIG5vZGVDb250ZXh0OiBudW1iZXIsXG4gIGFsbG93VG9TZWVrOiBib29sZWFuLFxuICBhbGxvd0NvbXBhY3Q6IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgbGV0IGFsbG93QmxvY2tTY2FsYXJzOiBib29sZWFuO1xuICBsZXQgYWxsb3dCbG9ja0NvbGxlY3Rpb25zOiBib29sZWFuO1xuICBsZXQgaW5kZW50U3RhdHVzID0gMTsgLy8gMTogdGhpcz5wYXJlbnQsIDA6IHRoaXM9cGFyZW50LCAtMTogdGhpczxwYXJlbnRcbiAgbGV0IGF0TmV3TGluZSA9IGZhbHNlO1xuICBsZXQgaGFzQ29udGVudCA9IGZhbHNlO1xuICBsZXQgdHlwZTogVHlwZTtcbiAgbGV0IGZsb3dJbmRlbnQ6IG51bWJlcjtcbiAgbGV0IGJsb2NrSW5kZW50OiBudW1iZXI7XG5cbiAgaWYgKHN0YXRlLmxpc3RlbmVyICYmIHN0YXRlLmxpc3RlbmVyICE9PSBudWxsKSB7XG4gICAgc3RhdGUubGlzdGVuZXIoXCJvcGVuXCIsIHN0YXRlKTtcbiAgfVxuXG4gIHN0YXRlLnRhZyA9IG51bGw7XG4gIHN0YXRlLmFuY2hvciA9IG51bGw7XG4gIHN0YXRlLmtpbmQgPSBudWxsO1xuICBzdGF0ZS5yZXN1bHQgPSBudWxsO1xuXG4gIGNvbnN0IGFsbG93QmxvY2tTdHlsZXMgPSAoYWxsb3dCbG9ja1NjYWxhcnMgPVxuICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9XG4gICAgICBDT05URVhUX0JMT0NLX09VVCA9PT0gbm9kZUNvbnRleHQgfHwgQ09OVEVYVF9CTE9DS19JTiA9PT0gbm9kZUNvbnRleHQpO1xuXG4gIGlmIChhbGxvd1RvU2Vlaykge1xuICAgIGlmIChza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSkpIHtcbiAgICAgIGF0TmV3TGluZSA9IHRydWU7XG5cbiAgICAgIGlmIChzdGF0ZS5saW5lSW5kZW50ID4gcGFyZW50SW5kZW50KSB7XG4gICAgICAgIGluZGVudFN0YXR1cyA9IDE7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPT09IHBhcmVudEluZGVudCkge1xuICAgICAgICBpbmRlbnRTdGF0dXMgPSAwO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgcGFyZW50SW5kZW50KSB7XG4gICAgICAgIGluZGVudFN0YXR1cyA9IC0xO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChpbmRlbnRTdGF0dXMgPT09IDEpIHtcbiAgICB3aGlsZSAocmVhZFRhZ1Byb3BlcnR5KHN0YXRlKSB8fCByZWFkQW5jaG9yUHJvcGVydHkoc3RhdGUpKSB7XG4gICAgICBpZiAoc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpKSB7XG4gICAgICAgIGF0TmV3TGluZSA9IHRydWU7XG4gICAgICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGFsbG93QmxvY2tTdHlsZXM7XG5cbiAgICAgICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPiBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgICBpbmRlbnRTdGF0dXMgPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPT09IHBhcmVudEluZGVudCkge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA8IHBhcmVudEluZGVudCkge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IC0xO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbGxvd0Jsb2NrQ29sbGVjdGlvbnMgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoYWxsb3dCbG9ja0NvbGxlY3Rpb25zKSB7XG4gICAgYWxsb3dCbG9ja0NvbGxlY3Rpb25zID0gYXROZXdMaW5lIHx8IGFsbG93Q29tcGFjdDtcbiAgfVxuXG4gIGlmIChpbmRlbnRTdGF0dXMgPT09IDEgfHwgQ09OVEVYVF9CTE9DS19PVVQgPT09IG5vZGVDb250ZXh0KSB7XG4gICAgY29uc3QgY29uZCA9IENPTlRFWFRfRkxPV19JTiA9PT0gbm9kZUNvbnRleHQgfHxcbiAgICAgIENPTlRFWFRfRkxPV19PVVQgPT09IG5vZGVDb250ZXh0O1xuICAgIGZsb3dJbmRlbnQgPSBjb25kID8gcGFyZW50SW5kZW50IDogcGFyZW50SW5kZW50ICsgMTtcblxuICAgIGJsb2NrSW5kZW50ID0gc3RhdGUucG9zaXRpb24gLSBzdGF0ZS5saW5lU3RhcnQ7XG5cbiAgICBpZiAoaW5kZW50U3RhdHVzID09PSAxKSB7XG4gICAgICBpZiAoXG4gICAgICAgIChhbGxvd0Jsb2NrQ29sbGVjdGlvbnMgJiZcbiAgICAgICAgICAocmVhZEJsb2NrU2VxdWVuY2Uoc3RhdGUsIGJsb2NrSW5kZW50KSB8fFxuICAgICAgICAgICAgcmVhZEJsb2NrTWFwcGluZyhzdGF0ZSwgYmxvY2tJbmRlbnQsIGZsb3dJbmRlbnQpKSkgfHxcbiAgICAgICAgcmVhZEZsb3dDb2xsZWN0aW9uKHN0YXRlLCBmbG93SW5kZW50KVxuICAgICAgKSB7XG4gICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIChhbGxvd0Jsb2NrU2NhbGFycyAmJiByZWFkQmxvY2tTY2FsYXIoc3RhdGUsIGZsb3dJbmRlbnQpKSB8fFxuICAgICAgICAgIHJlYWRTaW5nbGVRdW90ZWRTY2FsYXIoc3RhdGUsIGZsb3dJbmRlbnQpIHx8XG4gICAgICAgICAgcmVhZERvdWJsZVF1b3RlZFNjYWxhcihzdGF0ZSwgZmxvd0luZGVudClcbiAgICAgICAgKSB7XG4gICAgICAgICAgaGFzQ29udGVudCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAocmVhZEFsaWFzKHN0YXRlKSkge1xuICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlO1xuXG4gICAgICAgICAgaWYgKHN0YXRlLnRhZyAhPT0gbnVsbCB8fCBzdGF0ZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKFxuICAgICAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICAgICAgXCJhbGlhcyBub2RlIHNob3VsZCBub3QgaGF2ZSBBbnkgcHJvcGVydGllc1wiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgcmVhZFBsYWluU2NhbGFyKHN0YXRlLCBmbG93SW5kZW50LCBDT05URVhUX0ZMT1dfSU4gPT09IG5vZGVDb250ZXh0KVxuICAgICAgICApIHtcbiAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZTtcblxuICAgICAgICAgIGlmIChzdGF0ZS50YWcgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHN0YXRlLnRhZyA9IFwiP1wiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0ZS5hbmNob3IgIT09IG51bGwgJiYgdHlwZW9mIHN0YXRlLmFuY2hvck1hcCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIHN0YXRlLmFuY2hvck1hcFtzdGF0ZS5hbmNob3JdID0gc3RhdGUucmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpbmRlbnRTdGF0dXMgPT09IDApIHtcbiAgICAgIC8vIFNwZWNpYWwgY2FzZTogYmxvY2sgc2VxdWVuY2VzIGFyZSBhbGxvd2VkIHRvIGhhdmUgc2FtZSBpbmRlbnRhdGlvbiBsZXZlbCBhcyB0aGUgcGFyZW50LlxuICAgICAgLy8gaHR0cDovL3d3dy55YW1sLm9yZy9zcGVjLzEuMi9zcGVjLmh0bWwjaWQyNzk5Nzg0XG4gICAgICBoYXNDb250ZW50ID0gYWxsb3dCbG9ja0NvbGxlY3Rpb25zICYmXG4gICAgICAgIHJlYWRCbG9ja1NlcXVlbmNlKHN0YXRlLCBibG9ja0luZGVudCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHN0YXRlLnRhZyAhPT0gbnVsbCAmJiBzdGF0ZS50YWcgIT09IFwiIVwiKSB7XG4gICAgaWYgKHN0YXRlLnRhZyA9PT0gXCI/XCIpIHtcbiAgICAgIGZvciAoXG4gICAgICAgIGxldCB0eXBlSW5kZXggPSAwO1xuICAgICAgICB0eXBlSW5kZXggPCBzdGF0ZS5pbXBsaWNpdFR5cGVzLmxlbmd0aDtcbiAgICAgICAgdHlwZUluZGV4KytcbiAgICAgICkge1xuICAgICAgICB0eXBlID0gc3RhdGUuaW1wbGljaXRUeXBlc1t0eXBlSW5kZXhdITtcblxuICAgICAgICAvLyBJbXBsaWNpdCByZXNvbHZpbmcgaXMgbm90IGFsbG93ZWQgZm9yIG5vbi1zY2FsYXIgdHlwZXMsIGFuZCAnPydcbiAgICAgICAgLy8gbm9uLXNwZWNpZmljIHRhZyBpcyBvbmx5IGFzc2lnbmVkIHRvIHBsYWluIHNjYWxhcnMuIFNvLCBpdCBpc24ndFxuICAgICAgICAvLyBuZWVkZWQgdG8gY2hlY2sgZm9yICdraW5kJyBjb25mb3JtaXR5LlxuXG4gICAgICAgIGlmICh0eXBlLnJlc29sdmUoc3RhdGUucmVzdWx0KSkge1xuICAgICAgICAgIC8vIGBzdGF0ZS5yZXN1bHRgIHVwZGF0ZWQgaW4gcmVzb2x2ZXIgaWYgbWF0Y2hlZFxuICAgICAgICAgIHN0YXRlLnJlc3VsdCA9IHR5cGUuY29uc3RydWN0KHN0YXRlLnJlc3VsdCk7XG4gICAgICAgICAgc3RhdGUudGFnID0gdHlwZS50YWc7XG4gICAgICAgICAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCAmJiB0eXBlb2Ygc3RhdGUuYW5jaG9yTWFwICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBzdGF0ZS5hbmNob3JNYXBbc3RhdGUuYW5jaG9yXSA9IHN0YXRlLnJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFxuICAgICAgaGFzT3duKHN0YXRlLnR5cGVNYXBbc3RhdGUua2luZCB8fCBcImZhbGxiYWNrXCJdLCBzdGF0ZS50YWcpXG4gICAgKSB7XG4gICAgICB0eXBlID0gc3RhdGUudHlwZU1hcFtzdGF0ZS5raW5kIHx8IFwiZmFsbGJhY2tcIl1bc3RhdGUudGFnXSE7XG5cbiAgICAgIGlmIChzdGF0ZS5yZXN1bHQgIT09IG51bGwgJiYgdHlwZS5raW5kICE9PSBzdGF0ZS5raW5kKSB7XG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKFxuICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgIGB1bmFjY2VwdGFibGUgbm9kZSBraW5kIGZvciAhPCR7c3RhdGUudGFnfT4gdGFnOyBpdCBzaG91bGQgYmUgXCIke3R5cGUua2luZH1cIiwgbm90IFwiJHtzdGF0ZS5raW5kfVwiYCxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0eXBlLnJlc29sdmUoc3RhdGUucmVzdWx0KSkge1xuICAgICAgICAvLyBgc3RhdGUucmVzdWx0YCB1cGRhdGVkIGluIHJlc29sdmVyIGlmIG1hdGNoZWRcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoXG4gICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgYGNhbm5vdCByZXNvbHZlIGEgbm9kZSB3aXRoICE8JHtzdGF0ZS50YWd9PiBleHBsaWNpdCB0YWdgLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUucmVzdWx0ID0gdHlwZS5jb25zdHJ1Y3Qoc3RhdGUucmVzdWx0KTtcbiAgICAgICAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCAmJiB0eXBlb2Ygc3RhdGUuYW5jaG9yTWFwICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgc3RhdGUuYW5jaG9yTWFwW3N0YXRlLmFuY2hvcl0gPSBzdGF0ZS5yZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRocm93RXJyb3Ioc3RhdGUsIGB1bmtub3duIHRhZyAhPCR7c3RhdGUudGFnfT5gKTtcbiAgICB9XG4gIH1cblxuICBpZiAoc3RhdGUubGlzdGVuZXIgJiYgc3RhdGUubGlzdGVuZXIgIT09IG51bGwpIHtcbiAgICBzdGF0ZS5saXN0ZW5lcihcImNsb3NlXCIsIHN0YXRlKTtcbiAgfVxuICByZXR1cm4gc3RhdGUudGFnICE9PSBudWxsIHx8IHN0YXRlLmFuY2hvciAhPT0gbnVsbCB8fCBoYXNDb250ZW50O1xufVxuXG5mdW5jdGlvbiByZWFkRG9jdW1lbnQoc3RhdGU6IExvYWRlclN0YXRlKSB7XG4gIGNvbnN0IGRvY3VtZW50U3RhcnQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgbGV0IHBvc2l0aW9uOiBudW1iZXI7XG4gIGxldCBkaXJlY3RpdmVOYW1lOiBzdHJpbmc7XG4gIGxldCBkaXJlY3RpdmVBcmdzOiBzdHJpbmdbXTtcbiAgbGV0IGhhc0RpcmVjdGl2ZXMgPSBmYWxzZTtcbiAgbGV0IGNoOiBudW1iZXI7XG5cbiAgc3RhdGUudmVyc2lvbiA9IG51bGw7XG4gIHN0YXRlLmNoZWNrTGluZUJyZWFrcyA9IHN0YXRlLmxlZ2FjeTtcbiAgc3RhdGUudGFnTWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgc3RhdGUuYW5jaG9yTWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICB3aGlsZSAoKGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpICE9PSAwKSB7XG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpO1xuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICAgIGlmIChzdGF0ZS5saW5lSW5kZW50ID4gMCB8fCBjaCAhPT0gMHgyNSAvKiAlICovKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBoYXNEaXJlY3RpdmVzID0gdHJ1ZTtcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvbjtcblxuICAgIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNXc09yRW9sKGNoKSkge1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgIH1cblxuICAgIGRpcmVjdGl2ZU5hbWUgPSBzdGF0ZS5pbnB1dC5zbGljZShwb3NpdGlvbiwgc3RhdGUucG9zaXRpb24pO1xuICAgIGRpcmVjdGl2ZUFyZ3MgPSBbXTtcblxuICAgIGlmIChkaXJlY3RpdmVOYW1lLmxlbmd0aCA8IDEpIHtcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKFxuICAgICAgICBzdGF0ZSxcbiAgICAgICAgXCJkaXJlY3RpdmUgbmFtZSBtdXN0IG5vdCBiZSBsZXNzIHRoYW4gb25lIGNoYXJhY3RlciBpbiBsZW5ndGhcIixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgICB9XG5cbiAgICAgIGlmIChjaCA9PT0gMHgyMyAvKiAjICovKSB7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgICAgIH0gd2hpbGUgKGNoICE9PSAwICYmICFpc0VPTChjaCkpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKGlzRU9MKGNoKSkgYnJlYWs7XG5cbiAgICAgIHBvc2l0aW9uID0gc3RhdGUucG9zaXRpb247XG5cbiAgICAgIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNXc09yRW9sKGNoKSkge1xuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgICB9XG5cbiAgICAgIGRpcmVjdGl2ZUFyZ3MucHVzaChzdGF0ZS5pbnB1dC5zbGljZShwb3NpdGlvbiwgc3RhdGUucG9zaXRpb24pKTtcbiAgICB9XG5cbiAgICBpZiAoY2ggIT09IDApIHJlYWRMaW5lQnJlYWsoc3RhdGUpO1xuXG4gICAgaWYgKGhhc093bihkaXJlY3RpdmVIYW5kbGVycywgZGlyZWN0aXZlTmFtZSkpIHtcbiAgICAgIGRpcmVjdGl2ZUhhbmRsZXJzW2RpcmVjdGl2ZU5hbWVdIShzdGF0ZSwgZGlyZWN0aXZlTmFtZSwgLi4uZGlyZWN0aXZlQXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93V2FybmluZyhzdGF0ZSwgYHVua25vd24gZG9jdW1lbnQgZGlyZWN0aXZlIFwiJHtkaXJlY3RpdmVOYW1lfVwiYCk7XG4gICAgfVxuICB9XG5cbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpO1xuXG4gIGlmIChcbiAgICBzdGF0ZS5saW5lSW5kZW50ID09PSAwICYmXG4gICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MmQgLyogLSAqLyAmJlxuICAgIHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKSA9PT0gMHgyZCAvKiAtICovICYmXG4gICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDIpID09PSAweDJkIC8qIC0gKi9cbiAgKSB7XG4gICAgc3RhdGUucG9zaXRpb24gKz0gMztcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSk7XG4gIH0gZWxzZSBpZiAoaGFzRGlyZWN0aXZlcykge1xuICAgIHJldHVybiB0aHJvd0Vycm9yKHN0YXRlLCBcImRpcmVjdGl2ZXMgZW5kIG1hcmsgaXMgZXhwZWN0ZWRcIik7XG4gIH1cblxuICBjb21wb3NlTm9kZShzdGF0ZSwgc3RhdGUubGluZUluZGVudCAtIDEsIENPTlRFWFRfQkxPQ0tfT1VULCBmYWxzZSwgdHJ1ZSk7XG4gIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKTtcblxuICBpZiAoXG4gICAgc3RhdGUuY2hlY2tMaW5lQnJlYWtzICYmXG4gICAgUEFUVEVSTl9OT05fQVNDSUlfTElORV9CUkVBS1MudGVzdChcbiAgICAgIHN0YXRlLmlucHV0LnNsaWNlKGRvY3VtZW50U3RhcnQsIHN0YXRlLnBvc2l0aW9uKSxcbiAgICApXG4gICkge1xuICAgIHRocm93V2FybmluZyhzdGF0ZSwgXCJub24tQVNDSUkgbGluZSBicmVha3MgYXJlIGludGVycHJldGVkIGFzIGNvbnRlbnRcIik7XG4gIH1cblxuICBzdGF0ZS5kb2N1bWVudHMucHVzaChzdGF0ZS5yZXN1bHQpO1xuXG4gIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MmUgLyogLiAqLykge1xuICAgICAgc3RhdGUucG9zaXRpb24gKz0gMztcbiAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHN0YXRlLnBvc2l0aW9uIDwgc3RhdGUubGVuZ3RoIC0gMSkge1xuICAgIHJldHVybiB0aHJvd0Vycm9yKFxuICAgICAgc3RhdGUsXG4gICAgICBcImVuZCBvZiB0aGUgc3RyZWFtIG9yIGEgZG9jdW1lbnQgc2VwYXJhdG9yIGlzIGV4cGVjdGVkXCIsXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsb2FkRG9jdW1lbnRzKGlucHV0OiBzdHJpbmcsIG9wdGlvbnM/OiBMb2FkZXJTdGF0ZU9wdGlvbnMpOiB1bmtub3duW10ge1xuICBpbnB1dCA9IFN0cmluZyhpbnB1dCk7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIGlmIChpbnB1dC5sZW5ndGggIT09IDApIHtcbiAgICAvLyBBZGQgdGFpbGluZyBgXFxuYCBpZiBub3QgZXhpc3RzXG4gICAgaWYgKFxuICAgICAgaW5wdXQuY2hhckNvZGVBdChpbnB1dC5sZW5ndGggLSAxKSAhPT0gMHgwYSAvKiBMRiAqLyAmJlxuICAgICAgaW5wdXQuY2hhckNvZGVBdChpbnB1dC5sZW5ndGggLSAxKSAhPT0gMHgwZCAvKiBDUiAqL1xuICAgICkge1xuICAgICAgaW5wdXQgKz0gXCJcXG5cIjtcbiAgICB9XG5cbiAgICAvLyBTdHJpcCBCT01cbiAgICBpZiAoaW5wdXQuY2hhckNvZGVBdCgwKSA9PT0gMHhmZWZmKSB7XG4gICAgICBpbnB1dCA9IGlucHV0LnNsaWNlKDEpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN0YXRlID0gbmV3IExvYWRlclN0YXRlKGlucHV0LCBvcHRpb25zKTtcblxuICAvLyBVc2UgMCBhcyBzdHJpbmcgdGVybWluYXRvci4gVGhhdCBzaWduaWZpY2FudGx5IHNpbXBsaWZpZXMgYm91bmRzIGNoZWNrLlxuICBzdGF0ZS5pbnB1dCArPSBcIlxcMFwiO1xuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyMCAvKiBTcGFjZSAqLykge1xuICAgIHN0YXRlLmxpbmVJbmRlbnQgKz0gMTtcbiAgICBzdGF0ZS5wb3NpdGlvbiArPSAxO1xuICB9XG5cbiAgd2hpbGUgKHN0YXRlLnBvc2l0aW9uIDwgc3RhdGUubGVuZ3RoIC0gMSkge1xuICAgIHJlYWREb2N1bWVudChzdGF0ZSk7XG4gIH1cblxuICByZXR1cm4gc3RhdGUuZG9jdW1lbnRzO1xufVxuXG5leHBvcnQgdHlwZSBDYkZ1bmN0aW9uID0gKGRvYzogdW5rbm93bikgPT4gdm9pZDtcbmZ1bmN0aW9uIGlzQ2JGdW5jdGlvbihmbjogdW5rbm93bik6IGZuIGlzIENiRnVuY3Rpb24ge1xuICByZXR1cm4gdHlwZW9mIGZuID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkQWxsPFQgZXh0ZW5kcyBDYkZ1bmN0aW9uIHwgTG9hZGVyU3RhdGVPcHRpb25zPihcbiAgaW5wdXQ6IHN0cmluZyxcbiAgaXRlcmF0b3JPck9wdGlvbj86IFQsXG4gIG9wdGlvbnM/OiBMb2FkZXJTdGF0ZU9wdGlvbnMsXG4pOiBUIGV4dGVuZHMgQ2JGdW5jdGlvbiA/IHZvaWQgOiB1bmtub3duW10ge1xuICBpZiAoIWlzQ2JGdW5jdGlvbihpdGVyYXRvck9yT3B0aW9uKSkge1xuICAgIHJldHVybiBsb2FkRG9jdW1lbnRzKGlucHV0LCBpdGVyYXRvck9yT3B0aW9uIGFzIExvYWRlclN0YXRlT3B0aW9ucykgYXMgQW55O1xuICB9XG5cbiAgY29uc3QgZG9jdW1lbnRzID0gbG9hZERvY3VtZW50cyhpbnB1dCwgb3B0aW9ucyk7XG4gIGNvbnN0IGl0ZXJhdG9yID0gaXRlcmF0b3JPck9wdGlvbjtcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGRvY3VtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBpdGVyYXRvcihkb2N1bWVudHNbaW5kZXhdKTtcbiAgfVxuXG4gIHJldHVybiB2b2lkIDAgYXMgQW55O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZChpbnB1dDogc3RyaW5nLCBvcHRpb25zPzogTG9hZGVyU3RhdGVPcHRpb25zKTogdW5rbm93biB7XG4gIGNvbnN0IGRvY3VtZW50cyA9IGxvYWREb2N1bWVudHMoaW5wdXQsIG9wdGlvbnMpO1xuXG4gIGlmIChkb2N1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKGRvY3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gZG9jdW1lbnRzWzBdO1xuICB9XG4gIHRocm93IG5ldyBZQU1MRXJyb3IoXG4gICAgXCJleHBlY3RlZCBhIHNpbmdsZSBkb2N1bWVudCBpbiB0aGUgc3RyZWFtLCBidXQgZm91bmQgbW9yZVwiLFxuICApO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUUxRSxTQUFTLFNBQVMsUUFBUSxlQUFlO0FBQ3pDLFNBQVMsSUFBSSxRQUFRLGNBQWM7QUFFbkMsWUFBWSxZQUFZLGVBQWU7QUFDdkMsU0FDRSxXQUFXLFFBR04sb0JBQW9CO0FBSzNCLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRztBQUVuQixNQUFNLGtCQUFrQjtBQUN4QixNQUFNLG1CQUFtQjtBQUN6QixNQUFNLG1CQUFtQjtBQUN6QixNQUFNLG9CQUFvQjtBQUUxQixNQUFNLGdCQUFnQjtBQUN0QixNQUFNLGlCQUFpQjtBQUN2QixNQUFNLGdCQUFnQjtBQUV0QixNQUFNLHdCQUNKLG9DQUFvQztBQUNwQztBQUNGLE1BQU0sZ0NBQWdDO0FBQ3RDLE1BQU0sMEJBQTBCO0FBQ2hDLE1BQU0scUJBQXFCO0FBQzNCLE1BQU0sa0JBQ0o7QUFFRixTQUFTLE9BQU8sR0FBWTtFQUMxQixPQUFPLE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJ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
// denoCacheMetadata=15151873878425680460,3830919648177228707