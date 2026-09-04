// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { YAMLError } from "../_error.ts";
import * as common from "../_utils.ts";
import { DumperState } from "./dumper_state.ts";
const _toString = Object.prototype.toString;
const { hasOwn } = Object;
const CHAR_TAB = 0x09; /* Tab */ 
const CHAR_LINE_FEED = 0x0a; /* LF */ 
const CHAR_SPACE = 0x20; /* Space */ 
const CHAR_EXCLAMATION = 0x21; /* ! */ 
const CHAR_DOUBLE_QUOTE = 0x22; /* " */ 
const CHAR_SHARP = 0x23; /* # */ 
const CHAR_PERCENT = 0x25; /* % */ 
const CHAR_AMPERSAND = 0x26; /* & */ 
const CHAR_SINGLE_QUOTE = 0x27; /* ' */ 
const CHAR_ASTERISK = 0x2a; /* * */ 
const CHAR_COMMA = 0x2c; /* , */ 
const CHAR_MINUS = 0x2d; /* - */ 
const CHAR_COLON = 0x3a; /* : */ 
const CHAR_GREATER_THAN = 0x3e; /* > */ 
const CHAR_QUESTION = 0x3f; /* ? */ 
const CHAR_COMMERCIAL_AT = 0x40; /* @ */ 
const CHAR_LEFT_SQUARE_BRACKET = 0x5b; /* [ */ 
const CHAR_RIGHT_SQUARE_BRACKET = 0x5d; /* ] */ 
const CHAR_GRAVE_ACCENT = 0x60; /* ` */ 
const CHAR_LEFT_CURLY_BRACKET = 0x7b; /* { */ 
const CHAR_VERTICAL_LINE = 0x7c; /* | */ 
const CHAR_RIGHT_CURLY_BRACKET = 0x7d; /* } */ 
const ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0x00] = "\\0";
ESCAPE_SEQUENCES[0x07] = "\\a";
ESCAPE_SEQUENCES[0x08] = "\\b";
ESCAPE_SEQUENCES[0x09] = "\\t";
ESCAPE_SEQUENCES[0x0a] = "\\n";
ESCAPE_SEQUENCES[0x0b] = "\\v";
ESCAPE_SEQUENCES[0x0c] = "\\f";
ESCAPE_SEQUENCES[0x0d] = "\\r";
ESCAPE_SEQUENCES[0x1b] = "\\e";
ESCAPE_SEQUENCES[0x22] = '\\"';
ESCAPE_SEQUENCES[0x5c] = "\\\\";
ESCAPE_SEQUENCES[0x85] = "\\N";
ESCAPE_SEQUENCES[0xa0] = "\\_";
ESCAPE_SEQUENCES[0x2028] = "\\L";
ESCAPE_SEQUENCES[0x2029] = "\\P";
const DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
function encodeHex(character) {
  const string = character.toString(16).toUpperCase();
  let handle;
  let length;
  if (character <= 0xff) {
    handle = "x";
    length = 2;
  } else if (character <= 0xffff) {
    handle = "u";
    length = 4;
  } else if (character <= 0xffffffff) {
    handle = "U";
    length = 8;
  } else {
    throw new YAMLError("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return `\\${handle}${common.repeat("0", length - string.length)}${string}`;
}
// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
  const ind = common.repeat(" ", spaces);
  const length = string.length;
  let position = 0;
  let next = -1;
  let result = "";
  let line;
  while(position < length){
    next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return `\n${common.repeat(" ", state.indent * level)}`;
}
function testImplicitResolving(state, str) {
  return state.implicitTypes.some((type)=>type.resolve(str));
}
// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
  return 0x00020 <= c && c <= 0x00007e || 0x000a1 <= c && c <= 0x00d7ff && c !== 0x2028 && c !== 0x2029 || 0x0e000 <= c && c <= 0x00fffd && c !== 0xfeff || 0x10000 <= c && c <= 0x10ffff;
}
// Simplified test for values allowed after the first character in plain style.
function isPlainSafe(c) {
  // Uses a subset of nb-char - c-flow-indicator - ":" - "#"
  // where nb-char ::= c-printable - b-char - c-byte-order-mark.
  return isPrintable(c) && c !== 0xfeff && // - c-flow-indicator
  c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && // - ":" - "#"
  c !== CHAR_COLON && c !== CHAR_SHARP;
}
// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  return isPrintable(c) && c !== 0xfeff && !isWhitespace(c) && // - s-white
  // - (c-indicator ::=
  // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
  c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && // | “#” | “&” | “*” | “!” | “|” | “>” | “'” | “"”
  c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && // | “%” | “@” | “`”)
  c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
  const leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
const STYLE_PLAIN = 1;
const STYLE_SINGLE = 2;
const STYLE_LITERAL = 3;
const STYLE_FOLDED = 4;
const STYLE_DOUBLE = 5;
// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//  STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//  STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//  STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth !== -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
  const shouldTrackWidth = lineWidth !== -1;
  let hasLineBreak = false;
  let hasFoldableLine = false; // only checked if shouldTrackWidth
  let previousLineBreak = -1; // count the first line correctly
  let plain = isPlainSafeFirst(string.charCodeAt(0)) && !isWhitespace(string.charCodeAt(string.length - 1));
  let char;
  let i;
  if (singleLineOnly) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for(i = 0; i < string.length; i++){
      char = string.charCodeAt(i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char);
    }
  } else {
    // Case: block styles permitted.
    for(i = 0; i < string.length; i++){
      char = string.charCodeAt(i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char);
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    return plain && !testAmbiguousType(string) ? STYLE_PLAIN : STYLE_SINGLE;
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
}
// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  const breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
  let match;
  // start is an inclusive index. end, curr, and next are exclusive.
  let start = 0;
  let end;
  let curr = 0;
  let next = 0;
  let result = "";
  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  // tslint:disable-next-line:no-conditional-assignment
  while(match = breakRe.exec(line)){
    next = match.index;
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = curr > start ? curr : next; // derive end <= length-2
      result += `\n${line.slice(start, end)}`;
      // skip the space that was output as \n
      start = end + 1; // derive start <= length-1
    }
    curr = next;
  }
  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += "\n";
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += `${line.slice(start, curr)}\n${line.slice(curr + 1)}`;
  } else {
    result += line.slice(start);
  }
  return result.slice(1); // drop extra \n joiner
}
// (See the note for writeScalar.)
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  const lineRe = /(\n+)([^\n]*)/g;
  // first line (possibly an empty line)
  let result = (()=>{
    let nextLF = string.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  })();
  // If we haven't reached the first content line yet, don't add an extra \n.
  let prevMoreIndented = string[0] === "\n" || string[0] === " ";
  let moreIndented;
  // rest of the lines
  let match;
  // tslint:disable-next-line:no-conditional-assignment
  while(match = lineRe.exec(string)){
    const prefix = match[1];
    const line = match[2] || "";
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
// Escapes a double-quoted string.
function escapeString(string) {
  let result = "";
  let char;
  let nextChar;
  let escapeSeq;
  for(let i = 0; i < string.length; i++){
    char = string.charCodeAt(i);
    // Check for surrogate pairs (reference Unicode 3.0 section "3.7 Surrogates").
    if (char >= 0xd800 && char <= 0xdbff /* high surrogate */ ) {
      nextChar = string.charCodeAt(i + 1);
      if (nextChar >= 0xdc00 && nextChar <= 0xdfff /* low surrogate */ ) {
        // Combine the surrogate pair and store it escaped.
        result += encodeHex((char - 0xd800) * 0x400 + nextChar - 0xdc00 + 0x10000);
        // Advance index one extra since we already used that char here.
        i++;
        continue;
      }
    }
    escapeSeq = ESCAPE_SEQUENCES[char];
    result += !escapeSeq && isPrintable(char) ? string[i] : escapeSeq || encodeHex(char);
  }
  return result;
}
// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
  const indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  // note the special case: the string '\n' counts as a "trailing" empty line.
  const clip = string[string.length - 1] === "\n";
  const keep = clip && (string[string.length - 2] === "\n" || string === "\n");
  const chomp = keep ? "+" : clip ? "" : "-";
  return `${indentIndicator}${chomp}\n`;
}
// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey) {
  state.dump = (()=>{
    if (string.length === 0) {
      return "''";
    }
    if (!state.noCompatMode && DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
      return `'${string}'`;
    }
    const indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower
    //  bound.
    // This behaves better than a constant minimum width which disallows
    // narrower options, or an indent threshold which causes the width
    // to suddenly increase.
    const lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    // Without knowing if keys are implicit/explicit,
    // assume implicit for safety.
    const singleLineOnly = iskey || // No block styles in flow mode.
    state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(str) {
      return testImplicitResolving(state, str);
    }
    switch(chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)){
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return `'${string.replace(/'/g, "''")}'`;
      case STYLE_LITERAL:
        return `|${blockHeader(string, state.indent)}${dropEndingNewline(indentString(string, indent))}`;
      case STYLE_FOLDED:
        return `>${blockHeader(string, state.indent)}${dropEndingNewline(indentString(foldString(string, lineWidth), indent))}`;
      case STYLE_DOUBLE:
        return `"${escapeString(string)}"`;
      default:
        throw new YAMLError("impossible error: invalid scalar style");
    }
  })();
}
function writeFlowSequence(state, level, object) {
  let _result = "";
  const _tag = state.tag;
  for(let index = 0; index < object.length; index += 1){
    // Write only valid elements.
    if (writeNode(state, level, object[index], false, false)) {
      if (index !== 0) _result += `,${!state.condenseFlow ? " " : ""}`;
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = `[${_result}]`;
}
function writeBlockSequence(state, level, object, compact = false) {
  let _result = "";
  const _tag = state.tag;
  for(let index = 0; index < object.length; index += 1){
    // Write only valid elements.
    if (writeNode(state, level + 1, object[index], true, true)) {
      if (!compact || index !== 0) {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]"; // Empty sequence if no valid values.
}
function writeFlowMapping(state, level, object) {
  let _result = "";
  const _tag = state.tag;
  const objectKeyList = Object.keys(object);
  for (const [index, objectKey] of objectKeyList.entries()){
    let pairBuffer = state.condenseFlow ? '"' : "";
    if (index !== 0) pairBuffer += ", ";
    const objectValue = object[objectKey];
    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }
    if (state.dump.length > 1024) pairBuffer += "? ";
    pairBuffer += `${state.dump}${state.condenseFlow ? '"' : ""}:${state.condenseFlow ? "" : " "}`;
    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }
    pairBuffer += state.dump;
    // Both key and value are valid.
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = `{${_result}}`;
}
function writeBlockMapping(state, level, object, compact = false) {
  const _tag = state.tag;
  const objectKeyList = Object.keys(object);
  let _result = "";
  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new YAMLError("sortKeys must be a boolean or a function");
  }
  for (const [index, objectKey] of objectKeyList.entries()){
    let pairBuffer = "";
    if (!compact || index !== 0) {
      pairBuffer += generateNextLine(state, level);
    }
    const objectValue = object[objectKey];
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }
    const explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    // Both key and value are valid.
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}"; // Empty mapping if no valid pairs.
}
function detectType(state, object, explicit = false) {
  const typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (const type of typeList){
    let _result;
    if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === "object" && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
      state.tag = explicit ? type.tag : "?";
      if (type.represent) {
        const style = state.styleMap[type.tag] || type.defaultStyle;
        if (_toString.call(type.represent) === "[object Function]") {
          _result = type.represent(object, style);
        } else if (hasOwn(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new YAMLError(`!<${type.tag}> tag resolver accepts not "${style}" style`);
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey = false) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  const type = _toString.call(state.dump);
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  const objectOrArray = type === "[object Object]" || type === "[object Array]";
  let duplicateIndex = -1;
  let duplicate = false;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = `*ref_${duplicateIndex}`;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = `&ref_${duplicateIndex}${state.dump}`;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = `&ref_${duplicateIndex} ${state.dump}`;
        }
      }
    } else if (type === "[object Array]") {
      const arrayLevel = state.noArrayIndent && level > 0 ? level - 1 : level;
      if (block && state.dump.length !== 0) {
        writeBlockSequence(state, arrayLevel, state.dump, compact);
        if (duplicate) {
          state.dump = `&ref_${duplicateIndex}${state.dump}`;
        }
      } else {
        writeFlowSequence(state, arrayLevel, state.dump);
        if (duplicate) {
          state.dump = `&ref_${duplicateIndex} ${state.dump}`;
        }
      }
    } else if (type === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey);
      }
    } else {
      if (state.skipInvalid) return false;
      throw new YAMLError(`unacceptable kind of an object to dump ${type}`);
    }
    if (state.tag !== null && state.tag !== "?") {
      state.dump = `!<${state.tag}> ${state.dump}`;
    }
  }
  return true;
}
function inspectNode(object, objects, duplicatesIndexes) {
  if (object !== null && typeof object === "object") {
    const index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for(let idx = 0; idx < object.length; idx += 1){
          inspectNode(object[idx], objects, duplicatesIndexes);
        }
      } else {
        for (const objectKey of Object.keys(object)){
          inspectNode(object[objectKey], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function getDuplicateReferences(object, state) {
  const objects = [];
  const duplicatesIndexes = [];
  inspectNode(object, objects, duplicatesIndexes);
  for (const idx of duplicatesIndexes){
    state.duplicates.push(objects[idx]);
  }
  state.usedDuplicates = Array.from({
    length: duplicatesIndexes.length
  });
}
export function dump(input, options) {
  options = options || {};
  const state = new DumperState(options);
  if (!state.noRefs) getDuplicateReferences(input, state);
  if (writeNode(state, 0, input, true, true)) return `${state.dump}\n`;
  return "";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL19kdW1wZXIvZHVtcGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IFlBTUxFcnJvciB9IGZyb20gXCIuLi9fZXJyb3IudHNcIjtcbmltcG9ydCB0eXBlIHsgUmVwcmVzZW50Rm4gfSBmcm9tIFwiLi4vdHlwZS50c1wiO1xuaW1wb3J0ICogYXMgY29tbW9uIGZyb20gXCIuLi9fdXRpbHMudHNcIjtcbmltcG9ydCB7IER1bXBlclN0YXRlLCB0eXBlIER1bXBlclN0YXRlT3B0aW9ucyB9IGZyb20gXCIuL2R1bXBlcl9zdGF0ZS50c1wiO1xuXG50eXBlIEFueSA9IGNvbW1vbi5Bbnk7XG50eXBlIEFycmF5T2JqZWN0PFQgPSBBbnk+ID0gY29tbW9uLkFycmF5T2JqZWN0PFQ+O1xuXG5jb25zdCBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuY29uc3QgeyBoYXNPd24gfSA9IE9iamVjdDtcblxuY29uc3QgQ0hBUl9UQUIgPSAweDA5OyAvKiBUYWIgKi9cbmNvbnN0IENIQVJfTElORV9GRUVEID0gMHgwYTsgLyogTEYgKi9cbmNvbnN0IENIQVJfU1BBQ0UgPSAweDIwOyAvKiBTcGFjZSAqL1xuY29uc3QgQ0hBUl9FWENMQU1BVElPTiA9IDB4MjE7IC8qICEgKi9cbmNvbnN0IENIQVJfRE9VQkxFX1FVT1RFID0gMHgyMjsgLyogXCIgKi9cbmNvbnN0IENIQVJfU0hBUlAgPSAweDIzOyAvKiAjICovXG5jb25zdCBDSEFSX1BFUkNFTlQgPSAweDI1OyAvKiAlICovXG5jb25zdCBDSEFSX0FNUEVSU0FORCA9IDB4MjY7IC8qICYgKi9cbmNvbnN0IENIQVJfU0lOR0xFX1FVT1RFID0gMHgyNzsgLyogJyAqL1xuY29uc3QgQ0hBUl9BU1RFUklTSyA9IDB4MmE7IC8qICogKi9cbmNvbnN0IENIQVJfQ09NTUEgPSAweDJjOyAvKiAsICovXG5jb25zdCBDSEFSX01JTlVTID0gMHgyZDsgLyogLSAqL1xuY29uc3QgQ0hBUl9DT0xPTiA9IDB4M2E7IC8qIDogKi9cbmNvbnN0IENIQVJfR1JFQVRFUl9USEFOID0gMHgzZTsgLyogPiAqL1xuY29uc3QgQ0hBUl9RVUVTVElPTiA9IDB4M2Y7IC8qID8gKi9cbmNvbnN0IENIQVJfQ09NTUVSQ0lBTF9BVCA9IDB4NDA7IC8qIEAgKi9cbmNvbnN0IENIQVJfTEVGVF9TUVVBUkVfQlJBQ0tFVCA9IDB4NWI7IC8qIFsgKi9cbmNvbnN0IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQgPSAweDVkOyAvKiBdICovXG5jb25zdCBDSEFSX0dSQVZFX0FDQ0VOVCA9IDB4NjA7IC8qIGAgKi9cbmNvbnN0IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUID0gMHg3YjsgLyogeyAqL1xuY29uc3QgQ0hBUl9WRVJUSUNBTF9MSU5FID0gMHg3YzsgLyogfCAqL1xuY29uc3QgQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUID0gMHg3ZDsgLyogfSAqL1xuXG5jb25zdCBFU0NBUEVfU0VRVUVOQ0VTOiB7IFtjaGFyOiBudW1iZXJdOiBzdHJpbmcgfSA9IHt9O1xuXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDBdID0gXCJcXFxcMFwiO1xuRVNDQVBFX1NFUVVFTkNFU1sweDA3XSA9IFwiXFxcXGFcIjtcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwOF0gPSBcIlxcXFxiXCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDldID0gXCJcXFxcdFwiO1xuRVNDQVBFX1NFUVVFTkNFU1sweDBhXSA9IFwiXFxcXG5cIjtcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwYl0gPSBcIlxcXFx2XCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MGNdID0gXCJcXFxcZlwiO1xuRVNDQVBFX1NFUVVFTkNFU1sweDBkXSA9IFwiXFxcXHJcIjtcbkVTQ0FQRV9TRVFVRU5DRVNbMHgxYl0gPSBcIlxcXFxlXCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MjJdID0gJ1xcXFxcIic7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4NWNdID0gXCJcXFxcXFxcXFwiO1xuRVNDQVBFX1NFUVVFTkNFU1sweDg1XSA9IFwiXFxcXE5cIjtcbkVTQ0FQRV9TRVFVRU5DRVNbMHhhMF0gPSBcIlxcXFxfXCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MjAyOF0gPSBcIlxcXFxMXCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MjAyOV0gPSBcIlxcXFxQXCI7XG5cbmNvbnN0IERFUFJFQ0FURURfQk9PTEVBTlNfU1lOVEFYID0gW1xuICBcInlcIixcbiAgXCJZXCIsXG4gIFwieWVzXCIsXG4gIFwiWWVzXCIsXG4gIFwiWUVTXCIsXG4gIFwib25cIixcbiAgXCJPblwiLFxuICBcIk9OXCIsXG4gIFwiblwiLFxuICBcIk5cIixcbiAgXCJub1wiLFxuICBcIk5vXCIsXG4gIFwiTk9cIixcbiAgXCJvZmZcIixcbiAgXCJPZmZcIixcbiAgXCJPRkZcIixcbl07XG5cbmZ1bmN0aW9uIGVuY29kZUhleChjaGFyYWN0ZXI6IG51bWJlcik6IHN0cmluZyB7XG4gIGNvbnN0IHN0cmluZyA9IGNoYXJhY3Rlci50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcblxuICBsZXQgaGFuZGxlOiBzdHJpbmc7XG4gIGxldCBsZW5ndGg6IG51bWJlcjtcbiAgaWYgKGNoYXJhY3RlciA8PSAweGZmKSB7XG4gICAgaGFuZGxlID0gXCJ4XCI7XG4gICAgbGVuZ3RoID0gMjtcbiAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPD0gMHhmZmZmKSB7XG4gICAgaGFuZGxlID0gXCJ1XCI7XG4gICAgbGVuZ3RoID0gNDtcbiAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPD0gMHhmZmZmZmZmZikge1xuICAgIGhhbmRsZSA9IFwiVVwiO1xuICAgIGxlbmd0aCA9IDg7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFlBTUxFcnJvcihcbiAgICAgIFwiY29kZSBwb2ludCB3aXRoaW4gYSBzdHJpbmcgbWF5IG5vdCBiZSBncmVhdGVyIHRoYW4gMHhGRkZGRkZGRlwiLFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gYFxcXFwke2hhbmRsZX0ke2NvbW1vbi5yZXBlYXQoXCIwXCIsIGxlbmd0aCAtIHN0cmluZy5sZW5ndGgpfSR7c3RyaW5nfWA7XG59XG5cbi8vIEluZGVudHMgZXZlcnkgbGluZSBpbiBhIHN0cmluZy4gRW1wdHkgbGluZXMgKFxcbiBvbmx5KSBhcmUgbm90IGluZGVudGVkLlxuZnVuY3Rpb24gaW5kZW50U3RyaW5nKHN0cmluZzogc3RyaW5nLCBzcGFjZXM6IG51bWJlcik6IHN0cmluZyB7XG4gIGNvbnN0IGluZCA9IGNvbW1vbi5yZXBlYXQoXCIgXCIsIHNwYWNlcyk7XG4gIGNvbnN0IGxlbmd0aCA9IHN0cmluZy5sZW5ndGg7XG4gIGxldCBwb3NpdGlvbiA9IDA7XG4gIGxldCBuZXh0ID0gLTE7XG4gIGxldCByZXN1bHQgPSBcIlwiO1xuICBsZXQgbGluZTogc3RyaW5nO1xuXG4gIHdoaWxlIChwb3NpdGlvbiA8IGxlbmd0aCkge1xuICAgIG5leHQgPSBzdHJpbmcuaW5kZXhPZihcIlxcblwiLCBwb3NpdGlvbik7XG4gICAgaWYgKG5leHQgPT09IC0xKSB7XG4gICAgICBsaW5lID0gc3RyaW5nLnNsaWNlKHBvc2l0aW9uKTtcbiAgICAgIHBvc2l0aW9uID0gbGVuZ3RoO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaW5lID0gc3RyaW5nLnNsaWNlKHBvc2l0aW9uLCBuZXh0ICsgMSk7XG4gICAgICBwb3NpdGlvbiA9IG5leHQgKyAxO1xuICAgIH1cblxuICAgIGlmIChsaW5lLmxlbmd0aCAmJiBsaW5lICE9PSBcIlxcblwiKSByZXN1bHQgKz0gaW5kO1xuXG4gICAgcmVzdWx0ICs9IGxpbmU7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlOiBEdW1wZXJTdGF0ZSwgbGV2ZWw6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBgXFxuJHtjb21tb24ucmVwZWF0KFwiIFwiLCBzdGF0ZS5pbmRlbnQgKiBsZXZlbCl9YDtcbn1cblxuZnVuY3Rpb24gdGVzdEltcGxpY2l0UmVzb2x2aW5nKHN0YXRlOiBEdW1wZXJTdGF0ZSwgc3RyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHN0YXRlLmltcGxpY2l0VHlwZXMuc29tZSgodHlwZSkgPT4gdHlwZS5yZXNvbHZlKHN0cikpO1xufVxuXG4vLyBbMzNdIHMtd2hpdGUgOjo9IHMtc3BhY2UgfCBzLXRhYlxuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKGM6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gYyA9PT0gQ0hBUl9TUEFDRSB8fCBjID09PSBDSEFSX1RBQjtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBjaGFyYWN0ZXIgY2FuIGJlIHByaW50ZWQgd2l0aG91dCBlc2NhcGluZy5cbi8vIEZyb20gWUFNTCAxLjI6IFwiYW55IGFsbG93ZWQgY2hhcmFjdGVycyBrbm93biB0byBiZSBub24tcHJpbnRhYmxlXG4vLyBzaG91bGQgYWxzbyBiZSBlc2NhcGVkLiBbSG93ZXZlcixdIFRoaXMgaXNu4oCZdCBtYW5kYXRvcnlcIlxuLy8gRGVyaXZlZCBmcm9tIG5iLWNoYXIgLSBcXHQgLSAjeDg1IC0gI3hBMCAtICN4MjAyOCAtICN4MjAyOS5cbmZ1bmN0aW9uIGlzUHJpbnRhYmxlKGM6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgICgweDAwMDIwIDw9IGMgJiYgYyA8PSAweDAwMDA3ZSkgfHxcbiAgICAoMHgwMDBhMSA8PSBjICYmIGMgPD0gMHgwMGQ3ZmYgJiYgYyAhPT0gMHgyMDI4ICYmIGMgIT09IDB4MjAyOSkgfHxcbiAgICAoMHgwZTAwMCA8PSBjICYmIGMgPD0gMHgwMGZmZmQgJiYgYyAhPT0gMHhmZWZmKSAvKiBCT00gKi8gfHxcbiAgICAoMHgxMDAwMCA8PSBjICYmIGMgPD0gMHgxMGZmZmYpXG4gICk7XG59XG5cbi8vIFNpbXBsaWZpZWQgdGVzdCBmb3IgdmFsdWVzIGFsbG93ZWQgYWZ0ZXIgdGhlIGZpcnN0IGNoYXJhY3RlciBpbiBwbGFpbiBzdHlsZS5cbmZ1bmN0aW9uIGlzUGxhaW5TYWZlKGM6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyBVc2VzIGEgc3Vic2V0IG9mIG5iLWNoYXIgLSBjLWZsb3ctaW5kaWNhdG9yIC0gXCI6XCIgLSBcIiNcIlxuICAvLyB3aGVyZSBuYi1jaGFyIDo6PSBjLXByaW50YWJsZSAtIGItY2hhciAtIGMtYnl0ZS1vcmRlci1tYXJrLlxuICByZXR1cm4gKFxuICAgIGlzUHJpbnRhYmxlKGMpICYmXG4gICAgYyAhPT0gMHhmZWZmICYmXG4gICAgLy8gLSBjLWZsb3ctaW5kaWNhdG9yXG4gICAgYyAhPT0gQ0hBUl9DT01NQSAmJlxuICAgIGMgIT09IENIQVJfTEVGVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgIGMgIT09IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQgJiZcbiAgICBjICE9PSBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0tFVCAmJlxuICAgIGMgIT09IENIQVJfUklHSFRfQ1VSTFlfQlJBQ0tFVCAmJlxuICAgIC8vIC0gXCI6XCIgLSBcIiNcIlxuICAgIGMgIT09IENIQVJfQ09MT04gJiZcbiAgICBjICE9PSBDSEFSX1NIQVJQXG4gICk7XG59XG5cbi8vIFNpbXBsaWZpZWQgdGVzdCBmb3IgdmFsdWVzIGFsbG93ZWQgYXMgdGhlIGZpcnN0IGNoYXJhY3RlciBpbiBwbGFpbiBzdHlsZS5cbmZ1bmN0aW9uIGlzUGxhaW5TYWZlRmlyc3QoYzogbnVtYmVyKTogYm9vbGVhbiB7XG4gIC8vIFVzZXMgYSBzdWJzZXQgb2YgbnMtY2hhciAtIGMtaW5kaWNhdG9yXG4gIC8vIHdoZXJlIG5zLWNoYXIgPSBuYi1jaGFyIC0gcy13aGl0ZS5cbiAgcmV0dXJuIChcbiAgICBpc1ByaW50YWJsZShjKSAmJlxuICAgIGMgIT09IDB4ZmVmZiAmJlxuICAgICFpc1doaXRlc3BhY2UoYykgJiYgLy8gLSBzLXdoaXRlXG4gICAgLy8gLSAoYy1pbmRpY2F0b3IgOjo9XG4gICAgLy8g4oCcLeKAnSB8IOKAnD/igJ0gfCDigJw64oCdIHwg4oCcLOKAnSB8IOKAnFvigJ0gfCDigJxd4oCdIHwg4oCce+KAnSB8IOKAnH3igJ1cbiAgICBjICE9PSBDSEFSX01JTlVTICYmXG4gICAgYyAhPT0gQ0hBUl9RVUVTVElPTiAmJlxuICAgIGMgIT09IENIQVJfQ09MT04gJiZcbiAgICBjICE9PSBDSEFSX0NPTU1BICYmXG4gICAgYyAhPT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9SSUdIVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgIGMgIT09IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgLy8gfCDigJwj4oCdIHwg4oCcJuKAnSB8IOKAnCrigJ0gfCDigJwh4oCdIHwg4oCcfOKAnSB8IOKAnD7igJ0gfCDigJwn4oCdIHwg4oCcXCLigJ1cbiAgICBjICE9PSBDSEFSX1NIQVJQICYmXG4gICAgYyAhPT0gQ0hBUl9BTVBFUlNBTkQgJiZcbiAgICBjICE9PSBDSEFSX0FTVEVSSVNLICYmXG4gICAgYyAhPT0gQ0hBUl9FWENMQU1BVElPTiAmJlxuICAgIGMgIT09IENIQVJfVkVSVElDQUxfTElORSAmJlxuICAgIGMgIT09IENIQVJfR1JFQVRFUl9USEFOICYmXG4gICAgYyAhPT0gQ0hBUl9TSU5HTEVfUVVPVEUgJiZcbiAgICBjICE9PSBDSEFSX0RPVUJMRV9RVU9URSAmJlxuICAgIC8vIHwg4oCcJeKAnSB8IOKAnEDigJ0gfCDigJxg4oCdKVxuICAgIGMgIT09IENIQVJfUEVSQ0VOVCAmJlxuICAgIGMgIT09IENIQVJfQ09NTUVSQ0lBTF9BVCAmJlxuICAgIGMgIT09IENIQVJfR1JBVkVfQUNDRU5UXG4gICk7XG59XG5cbi8vIERldGVybWluZXMgd2hldGhlciBibG9jayBpbmRlbnRhdGlvbiBpbmRpY2F0b3IgaXMgcmVxdWlyZWQuXG5mdW5jdGlvbiBuZWVkSW5kZW50SW5kaWNhdG9yKHN0cmluZzogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGxlYWRpbmdTcGFjZVJlID0gL15cXG4qIC87XG4gIHJldHVybiBsZWFkaW5nU3BhY2VSZS50ZXN0KHN0cmluZyk7XG59XG5cbmNvbnN0IFNUWUxFX1BMQUlOID0gMTtcbmNvbnN0IFNUWUxFX1NJTkdMRSA9IDI7XG5jb25zdCBTVFlMRV9MSVRFUkFMID0gMztcbmNvbnN0IFNUWUxFX0ZPTERFRCA9IDQ7XG5jb25zdCBTVFlMRV9ET1VCTEUgPSA1O1xuXG4vLyBEZXRlcm1pbmVzIHdoaWNoIHNjYWxhciBzdHlsZXMgYXJlIHBvc3NpYmxlIGFuZCByZXR1cm5zIHRoZSBwcmVmZXJyZWQgc3R5bGUuXG4vLyBsaW5lV2lkdGggPSAtMSA9PiBubyBsaW1pdC5cbi8vIFByZS1jb25kaXRpb25zOiBzdHIubGVuZ3RoID4gMC5cbi8vIFBvc3QtY29uZGl0aW9uczpcbi8vICBTVFlMRV9QTEFJTiBvciBTVFlMRV9TSU5HTEUgPT4gbm8gXFxuIGFyZSBpbiB0aGUgc3RyaW5nLlxuLy8gIFNUWUxFX0xJVEVSQUwgPT4gbm8gbGluZXMgYXJlIHN1aXRhYmxlIGZvciBmb2xkaW5nIChvciBsaW5lV2lkdGggaXMgLTEpLlxuLy8gIFNUWUxFX0ZPTERFRCA9PiBhIGxpbmUgPiBsaW5lV2lkdGggYW5kIGNhbiBiZSBmb2xkZWQgKGFuZCBsaW5lV2lkdGggIT09IC0xKS5cbmZ1bmN0aW9uIGNob29zZVNjYWxhclN0eWxlKFxuICBzdHJpbmc6IHN0cmluZyxcbiAgc2luZ2xlTGluZU9ubHk6IGJvb2xlYW4sXG4gIGluZGVudFBlckxldmVsOiBudW1iZXIsXG4gIGxpbmVXaWR0aDogbnVtYmVyLFxuICB0ZXN0QW1iaWd1b3VzVHlwZTogKC4uLmFyZ3M6IEFueVtdKSA9PiBBbnksXG4pOiBudW1iZXIge1xuICBjb25zdCBzaG91bGRUcmFja1dpZHRoID0gbGluZVdpZHRoICE9PSAtMTtcbiAgbGV0IGhhc0xpbmVCcmVhayA9IGZhbHNlO1xuICBsZXQgaGFzRm9sZGFibGVMaW5lID0gZmFsc2U7IC8vIG9ubHkgY2hlY2tlZCBpZiBzaG91bGRUcmFja1dpZHRoXG4gIGxldCBwcmV2aW91c0xpbmVCcmVhayA9IC0xOyAvLyBjb3VudCB0aGUgZmlyc3QgbGluZSBjb3JyZWN0bHlcbiAgbGV0IHBsYWluID0gaXNQbGFpblNhZmVGaXJzdChzdHJpbmcuY2hhckNvZGVBdCgwKSkgJiZcbiAgICAhaXNXaGl0ZXNwYWNlKHN0cmluZy5jaGFyQ29kZUF0KHN0cmluZy5sZW5ndGggLSAxKSk7XG5cbiAgbGV0IGNoYXI6IG51bWJlcjtcbiAgbGV0IGk6IG51bWJlcjtcbiAgaWYgKHNpbmdsZUxpbmVPbmx5KSB7XG4gICAgLy8gQ2FzZTogbm8gYmxvY2sgc3R5bGVzLlxuICAgIC8vIENoZWNrIGZvciBkaXNhbGxvd2VkIGNoYXJhY3RlcnMgdG8gcnVsZSBvdXQgcGxhaW4gYW5kIHNpbmdsZS5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGFyID0gc3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoIWlzUHJpbnRhYmxlKGNoYXIpKSB7XG4gICAgICAgIHJldHVybiBTVFlMRV9ET1VCTEU7XG4gICAgICB9XG4gICAgICBwbGFpbiA9IHBsYWluICYmIGlzUGxhaW5TYWZlKGNoYXIpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBDYXNlOiBibG9jayBzdHlsZXMgcGVybWl0dGVkLlxuICAgIGZvciAoaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoYXIgPSBzdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjaGFyID09PSBDSEFSX0xJTkVfRkVFRCkge1xuICAgICAgICBoYXNMaW5lQnJlYWsgPSB0cnVlO1xuICAgICAgICAvLyBDaGVjayBpZiBhbnkgbGluZSBjYW4gYmUgZm9sZGVkLlxuICAgICAgICBpZiAoc2hvdWxkVHJhY2tXaWR0aCkge1xuICAgICAgICAgIGhhc0ZvbGRhYmxlTGluZSA9IGhhc0ZvbGRhYmxlTGluZSB8fFxuICAgICAgICAgICAgLy8gRm9sZGFibGUgbGluZSA9IHRvbyBsb25nLCBhbmQgbm90IG1vcmUtaW5kZW50ZWQuXG4gICAgICAgICAgICAoaSAtIHByZXZpb3VzTGluZUJyZWFrIC0gMSA+IGxpbmVXaWR0aCAmJlxuICAgICAgICAgICAgICBzdHJpbmdbcHJldmlvdXNMaW5lQnJlYWsgKyAxXSAhPT0gXCIgXCIpO1xuICAgICAgICAgIHByZXZpb3VzTGluZUJyZWFrID0gaTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghaXNQcmludGFibGUoY2hhcikpIHtcbiAgICAgICAgcmV0dXJuIFNUWUxFX0RPVUJMRTtcbiAgICAgIH1cbiAgICAgIHBsYWluID0gcGxhaW4gJiYgaXNQbGFpblNhZmUoY2hhcik7XG4gICAgfVxuICAgIC8vIGluIGNhc2UgdGhlIGVuZCBpcyBtaXNzaW5nIGEgXFxuXG4gICAgaGFzRm9sZGFibGVMaW5lID0gaGFzRm9sZGFibGVMaW5lIHx8XG4gICAgICAoc2hvdWxkVHJhY2tXaWR0aCAmJlxuICAgICAgICBpIC0gcHJldmlvdXNMaW5lQnJlYWsgLSAxID4gbGluZVdpZHRoICYmXG4gICAgICAgIHN0cmluZ1twcmV2aW91c0xpbmVCcmVhayArIDFdICE9PSBcIiBcIik7XG4gIH1cbiAgLy8gQWx0aG91Z2ggZXZlcnkgc3R5bGUgY2FuIHJlcHJlc2VudCBcXG4gd2l0aG91dCBlc2NhcGluZywgcHJlZmVyIGJsb2NrIHN0eWxlc1xuICAvLyBmb3IgbXVsdGlsaW5lLCBzaW5jZSB0aGV5J3JlIG1vcmUgcmVhZGFibGUgYW5kIHRoZXkgZG9uJ3QgYWRkIGVtcHR5IGxpbmVzLlxuICAvLyBBbHNvIHByZWZlciBmb2xkaW5nIGEgc3VwZXItbG9uZyBsaW5lLlxuICBpZiAoIWhhc0xpbmVCcmVhayAmJiAhaGFzRm9sZGFibGVMaW5lKSB7XG4gICAgLy8gU3RyaW5ncyBpbnRlcnByZXRhYmxlIGFzIGFub3RoZXIgdHlwZSBoYXZlIHRvIGJlIHF1b3RlZDtcbiAgICAvLyBlLmcuIHRoZSBzdHJpbmcgJ3RydWUnIHZzLiB0aGUgYm9vbGVhbiB0cnVlLlxuICAgIHJldHVybiBwbGFpbiAmJiAhdGVzdEFtYmlndW91c1R5cGUoc3RyaW5nKSA/IFNUWUxFX1BMQUlOIDogU1RZTEVfU0lOR0xFO1xuICB9XG4gIC8vIEVkZ2UgY2FzZTogYmxvY2sgaW5kZW50YXRpb24gaW5kaWNhdG9yIGNhbiBvbmx5IGhhdmUgb25lIGRpZ2l0LlxuICBpZiAoaW5kZW50UGVyTGV2ZWwgPiA5ICYmIG5lZWRJbmRlbnRJbmRpY2F0b3Ioc3RyaW5nKSkge1xuICAgIHJldHVybiBTVFlMRV9ET1VCTEU7XG4gIH1cbiAgLy8gQXQgdGhpcyBwb2ludCB3ZSBrbm93IGJsb2NrIHN0eWxlcyBhcmUgdmFsaWQuXG4gIC8vIFByZWZlciBsaXRlcmFsIHN0eWxlIHVubGVzcyB3ZSB3YW50IHRvIGZvbGQuXG4gIHJldHVybiBoYXNGb2xkYWJsZUxpbmUgPyBTVFlMRV9GT0xERUQgOiBTVFlMRV9MSVRFUkFMO1xufVxuXG4vLyBHcmVlZHkgbGluZSBicmVha2luZy5cbi8vIFBpY2tzIHRoZSBsb25nZXN0IGxpbmUgdW5kZXIgdGhlIGxpbWl0IGVhY2ggdGltZSxcbi8vIG90aGVyd2lzZSBzZXR0bGVzIGZvciB0aGUgc2hvcnRlc3QgbGluZSBvdmVyIHRoZSBsaW1pdC5cbi8vIE5CLiBNb3JlLWluZGVudGVkIGxpbmVzICpjYW5ub3QqIGJlIGZvbGRlZCwgYXMgdGhhdCB3b3VsZCBhZGQgYW4gZXh0cmEgXFxuLlxuZnVuY3Rpb24gZm9sZExpbmUobGluZTogc3RyaW5nLCB3aWR0aDogbnVtYmVyKTogc3RyaW5nIHtcbiAgaWYgKGxpbmUgPT09IFwiXCIgfHwgbGluZVswXSA9PT0gXCIgXCIpIHJldHVybiBsaW5lO1xuXG4gIC8vIFNpbmNlIGEgbW9yZS1pbmRlbnRlZCBsaW5lIGFkZHMgYSBcXG4sIGJyZWFrcyBjYW4ndCBiZSBmb2xsb3dlZCBieSBhIHNwYWNlLlxuICBjb25zdCBicmVha1JlID0gLyBbXiBdL2c7IC8vIG5vdGU6IHRoZSBtYXRjaCBpbmRleCB3aWxsIGFsd2F5cyBiZSA8PSBsZW5ndGgtMi5cbiAgbGV0IG1hdGNoO1xuICAvLyBzdGFydCBpcyBhbiBpbmNsdXNpdmUgaW5kZXguIGVuZCwgY3VyciwgYW5kIG5leHQgYXJlIGV4Y2x1c2l2ZS5cbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IGVuZDtcbiAgbGV0IGN1cnIgPSAwO1xuICBsZXQgbmV4dCA9IDA7XG4gIGxldCByZXN1bHQgPSBcIlwiO1xuXG4gIC8vIEludmFyaWFudHM6IDAgPD0gc3RhcnQgPD0gbGVuZ3RoLTEuXG4gIC8vICAgMCA8PSBjdXJyIDw9IG5leHQgPD0gbWF4KDAsIGxlbmd0aC0yKS4gY3VyciAtIHN0YXJ0IDw9IHdpZHRoLlxuICAvLyBJbnNpZGUgdGhlIGxvb3A6XG4gIC8vICAgQSBtYXRjaCBpbXBsaWVzIGxlbmd0aCA+PSAyLCBzbyBjdXJyIGFuZCBuZXh0IGFyZSA8PSBsZW5ndGgtMi5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcbiAgd2hpbGUgKChtYXRjaCA9IGJyZWFrUmUuZXhlYyhsaW5lKSkpIHtcbiAgICBuZXh0ID0gbWF0Y2guaW5kZXg7XG4gICAgLy8gbWFpbnRhaW4gaW52YXJpYW50OiBjdXJyIC0gc3RhcnQgPD0gd2lkdGhcbiAgICBpZiAobmV4dCAtIHN0YXJ0ID4gd2lkdGgpIHtcbiAgICAgIGVuZCA9IGN1cnIgPiBzdGFydCA/IGN1cnIgOiBuZXh0OyAvLyBkZXJpdmUgZW5kIDw9IGxlbmd0aC0yXG4gICAgICByZXN1bHQgKz0gYFxcbiR7bGluZS5zbGljZShzdGFydCwgZW5kKX1gO1xuICAgICAgLy8gc2tpcCB0aGUgc3BhY2UgdGhhdCB3YXMgb3V0cHV0IGFzIFxcblxuICAgICAgc3RhcnQgPSBlbmQgKyAxOyAvLyBkZXJpdmUgc3RhcnQgPD0gbGVuZ3RoLTFcbiAgICB9XG4gICAgY3VyciA9IG5leHQ7XG4gIH1cblxuICAvLyBCeSB0aGUgaW52YXJpYW50cywgc3RhcnQgPD0gbGVuZ3RoLTEsIHNvIHRoZXJlIGlzIHNvbWV0aGluZyBsZWZ0IG92ZXIuXG4gIC8vIEl0IGlzIGVpdGhlciB0aGUgd2hvbGUgc3RyaW5nIG9yIGEgcGFydCBzdGFydGluZyBmcm9tIG5vbi13aGl0ZXNwYWNlLlxuICByZXN1bHQgKz0gXCJcXG5cIjtcbiAgLy8gSW5zZXJ0IGEgYnJlYWsgaWYgdGhlIHJlbWFpbmRlciBpcyB0b28gbG9uZyBhbmQgdGhlcmUgaXMgYSBicmVhayBhdmFpbGFibGUuXG4gIGlmIChsaW5lLmxlbmd0aCAtIHN0YXJ0ID4gd2lkdGggJiYgY3VyciA+IHN0YXJ0KSB7XG4gICAgcmVzdWx0ICs9IGAke2xpbmUuc2xpY2Uoc3RhcnQsIGN1cnIpfVxcbiR7bGluZS5zbGljZShjdXJyICsgMSl9YDtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgKz0gbGluZS5zbGljZShzdGFydCk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0LnNsaWNlKDEpOyAvLyBkcm9wIGV4dHJhIFxcbiBqb2luZXJcbn1cblxuLy8gKFNlZSB0aGUgbm90ZSBmb3Igd3JpdGVTY2FsYXIuKVxuZnVuY3Rpb24gZHJvcEVuZGluZ05ld2xpbmUoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gc3RyaW5nW3N0cmluZy5sZW5ndGggLSAxXSA9PT0gXCJcXG5cIiA/IHN0cmluZy5zbGljZSgwLCAtMSkgOiBzdHJpbmc7XG59XG5cbi8vIE5vdGU6IGEgbG9uZyBsaW5lIHdpdGhvdXQgYSBzdWl0YWJsZSBicmVhayBwb2ludCB3aWxsIGV4Y2VlZCB0aGUgd2lkdGggbGltaXQuXG4vLyBQcmUtY29uZGl0aW9uczogZXZlcnkgY2hhciBpbiBzdHIgaXNQcmludGFibGUsIHN0ci5sZW5ndGggPiAwLCB3aWR0aCA+IDAuXG5mdW5jdGlvbiBmb2xkU3RyaW5nKHN0cmluZzogc3RyaW5nLCB3aWR0aDogbnVtYmVyKTogc3RyaW5nIHtcbiAgLy8gSW4gZm9sZGVkIHN0eWxlLCAkayQgY29uc2VjdXRpdmUgbmV3bGluZXMgb3V0cHV0IGFzICRrKzEkIG5ld2xpbmVz4oCUXG4gIC8vIHVubGVzcyB0aGV5J3JlIGJlZm9yZSBvciBhZnRlciBhIG1vcmUtaW5kZW50ZWQgbGluZSwgb3IgYXQgdGhlIHZlcnlcbiAgLy8gYmVnaW5uaW5nIG9yIGVuZCwgaW4gd2hpY2ggY2FzZSAkayQgbWFwcyB0byAkayQuXG4gIC8vIFRoZXJlZm9yZSwgcGFyc2UgZWFjaCBjaHVuayBhcyBuZXdsaW5lKHMpIGZvbGxvd2VkIGJ5IGEgY29udGVudCBsaW5lLlxuICBjb25zdCBsaW5lUmUgPSAvKFxcbispKFteXFxuXSopL2c7XG5cbiAgLy8gZmlyc3QgbGluZSAocG9zc2libHkgYW4gZW1wdHkgbGluZSlcbiAgbGV0IHJlc3VsdCA9ICgoKTogc3RyaW5nID0+IHtcbiAgICBsZXQgbmV4dExGID0gc3RyaW5nLmluZGV4T2YoXCJcXG5cIik7XG4gICAgbmV4dExGID0gbmV4dExGICE9PSAtMSA/IG5leHRMRiA6IHN0cmluZy5sZW5ndGg7XG4gICAgbGluZVJlLmxhc3RJbmRleCA9IG5leHRMRjtcbiAgICByZXR1cm4gZm9sZExpbmUoc3RyaW5nLnNsaWNlKDAsIG5leHRMRiksIHdpZHRoKTtcbiAgfSkoKTtcbiAgLy8gSWYgd2UgaGF2ZW4ndCByZWFjaGVkIHRoZSBmaXJzdCBjb250ZW50IGxpbmUgeWV0LCBkb24ndCBhZGQgYW4gZXh0cmEgXFxuLlxuICBsZXQgcHJldk1vcmVJbmRlbnRlZCA9IHN0cmluZ1swXSA9PT0gXCJcXG5cIiB8fCBzdHJpbmdbMF0gPT09IFwiIFwiO1xuICBsZXQgbW9yZUluZGVudGVkO1xuXG4gIC8vIHJlc3Qgb2YgdGhlIGxpbmVzXG4gIGxldCBtYXRjaDtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcbiAgd2hpbGUgKChtYXRjaCA9IGxpbmVSZS5leGVjKHN0cmluZykpKSB7XG4gICAgY29uc3QgcHJlZml4ID0gbWF0Y2hbMV07XG4gICAgY29uc3QgbGluZSA9IG1hdGNoWzJdIHx8IFwiXCI7XG4gICAgbW9yZUluZGVudGVkID0gbGluZVswXSA9PT0gXCIgXCI7XG4gICAgcmVzdWx0ICs9IHByZWZpeCArXG4gICAgICAoIXByZXZNb3JlSW5kZW50ZWQgJiYgIW1vcmVJbmRlbnRlZCAmJiBsaW5lICE9PSBcIlwiID8gXCJcXG5cIiA6IFwiXCIpICtcbiAgICAgIGZvbGRMaW5lKGxpbmUsIHdpZHRoKTtcbiAgICBwcmV2TW9yZUluZGVudGVkID0gbW9yZUluZGVudGVkO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gRXNjYXBlcyBhIGRvdWJsZS1xdW90ZWQgc3RyaW5nLlxuZnVuY3Rpb24gZXNjYXBlU3RyaW5nKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IHJlc3VsdCA9IFwiXCI7XG4gIGxldCBjaGFyO1xuICBsZXQgbmV4dENoYXI7XG4gIGxldCBlc2NhcGVTZXE7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICBjaGFyID0gc3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgLy8gQ2hlY2sgZm9yIHN1cnJvZ2F0ZSBwYWlycyAocmVmZXJlbmNlIFVuaWNvZGUgMy4wIHNlY3Rpb24gXCIzLjcgU3Vycm9nYXRlc1wiKS5cbiAgICBpZiAoY2hhciA+PSAweGQ4MDAgJiYgY2hhciA8PSAweGRiZmYgLyogaGlnaCBzdXJyb2dhdGUgKi8pIHtcbiAgICAgIG5leHRDaGFyID0gc3RyaW5nLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgaWYgKG5leHRDaGFyID49IDB4ZGMwMCAmJiBuZXh0Q2hhciA8PSAweGRmZmYgLyogbG93IHN1cnJvZ2F0ZSAqLykge1xuICAgICAgICAvLyBDb21iaW5lIHRoZSBzdXJyb2dhdGUgcGFpciBhbmQgc3RvcmUgaXQgZXNjYXBlZC5cbiAgICAgICAgcmVzdWx0ICs9IGVuY29kZUhleChcbiAgICAgICAgICAoY2hhciAtIDB4ZDgwMCkgKiAweDQwMCArIG5leHRDaGFyIC0gMHhkYzAwICsgMHgxMDAwMCxcbiAgICAgICAgKTtcbiAgICAgICAgLy8gQWR2YW5jZSBpbmRleCBvbmUgZXh0cmEgc2luY2Ugd2UgYWxyZWFkeSB1c2VkIHRoYXQgY2hhciBoZXJlLlxuICAgICAgICBpKys7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBlc2NhcGVTZXEgPSBFU0NBUEVfU0VRVUVOQ0VTW2NoYXJdO1xuICAgIHJlc3VsdCArPSAhZXNjYXBlU2VxICYmIGlzUHJpbnRhYmxlKGNoYXIpXG4gICAgICA/IHN0cmluZ1tpXVxuICAgICAgOiBlc2NhcGVTZXEgfHwgZW5jb2RlSGV4KGNoYXIpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gUHJlLWNvbmRpdGlvbnM6IHN0cmluZyBpcyB2YWxpZCBmb3IgYSBibG9jayBzY2FsYXIsIDEgPD0gaW5kZW50UGVyTGV2ZWwgPD0gOS5cbmZ1bmN0aW9uIGJsb2NrSGVhZGVyKHN0cmluZzogc3RyaW5nLCBpbmRlbnRQZXJMZXZlbDogbnVtYmVyKTogc3RyaW5nIHtcbiAgY29uc3QgaW5kZW50SW5kaWNhdG9yID0gbmVlZEluZGVudEluZGljYXRvcihzdHJpbmcpXG4gICAgPyBTdHJpbmcoaW5kZW50UGVyTGV2ZWwpXG4gICAgOiBcIlwiO1xuXG4gIC8vIG5vdGUgdGhlIHNwZWNpYWwgY2FzZTogdGhlIHN0cmluZyAnXFxuJyBjb3VudHMgYXMgYSBcInRyYWlsaW5nXCIgZW1wdHkgbGluZS5cbiAgY29uc3QgY2xpcCA9IHN0cmluZ1tzdHJpbmcubGVuZ3RoIC0gMV0gPT09IFwiXFxuXCI7XG4gIGNvbnN0IGtlZXAgPSBjbGlwICYmIChzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDJdID09PSBcIlxcblwiIHx8IHN0cmluZyA9PT0gXCJcXG5cIik7XG4gIGNvbnN0IGNob21wID0ga2VlcCA/IFwiK1wiIDogY2xpcCA/IFwiXCIgOiBcIi1cIjtcblxuICByZXR1cm4gYCR7aW5kZW50SW5kaWNhdG9yfSR7Y2hvbXB9XFxuYDtcbn1cblxuLy8gTm90ZTogbGluZSBicmVha2luZy9mb2xkaW5nIGlzIGltcGxlbWVudGVkIGZvciBvbmx5IHRoZSBmb2xkZWQgc3R5bGUuXG4vLyBOQi4gV2UgZHJvcCB0aGUgbGFzdCB0cmFpbGluZyBuZXdsaW5lIChpZiBhbnkpIG9mIGEgcmV0dXJuZWQgYmxvY2sgc2NhbGFyXG4vLyAgc2luY2UgdGhlIGR1bXBlciBhZGRzIGl0cyBvd24gbmV3bGluZS4gVGhpcyBhbHdheXMgd29ya3M6XG4vLyAgICDigKIgTm8gZW5kaW5nIG5ld2xpbmUgPT4gdW5hZmZlY3RlZDsgYWxyZWFkeSB1c2luZyBzdHJpcCBcIi1cIiBjaG9tcGluZy5cbi8vICAgIOKAoiBFbmRpbmcgbmV3bGluZSAgICA9PiByZW1vdmVkIHRoZW4gcmVzdG9yZWQuXG4vLyAgSW1wb3J0YW50bHksIHRoaXMga2VlcHMgdGhlIFwiK1wiIGNob21wIGluZGljYXRvciBmcm9tIGdhaW5pbmcgYW4gZXh0cmEgbGluZS5cbmZ1bmN0aW9uIHdyaXRlU2NhbGFyKFxuICBzdGF0ZTogRHVtcGVyU3RhdGUsXG4gIHN0cmluZzogc3RyaW5nLFxuICBsZXZlbDogbnVtYmVyLFxuICBpc2tleTogYm9vbGVhbixcbikge1xuICBzdGF0ZS5kdW1wID0gKCgpOiBzdHJpbmcgPT4ge1xuICAgIGlmIChzdHJpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gXCInJ1wiO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICAhc3RhdGUubm9Db21wYXRNb2RlICYmXG4gICAgICBERVBSRUNBVEVEX0JPT0xFQU5TX1NZTlRBWC5pbmRleE9mKHN0cmluZykgIT09IC0xXG4gICAgKSB7XG4gICAgICByZXR1cm4gYCcke3N0cmluZ30nYDtcbiAgICB9XG5cbiAgICBjb25zdCBpbmRlbnQgPSBzdGF0ZS5pbmRlbnQgKiBNYXRoLm1heCgxLCBsZXZlbCk7IC8vIG5vIDAtaW5kZW50IHNjYWxhcnNcbiAgICAvLyBBcyBpbmRlbnRhdGlvbiBnZXRzIGRlZXBlciwgbGV0IHRoZSB3aWR0aCBkZWNyZWFzZSBtb25vdG9uaWNhbGx5XG4gICAgLy8gdG8gdGhlIGxvd2VyIGJvdW5kIG1pbihzdGF0ZS5saW5lV2lkdGgsIDQwKS5cbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBpbXBsaWVzXG4gICAgLy8gIHN0YXRlLmxpbmVXaWR0aCDiiaQgNDAgKyBzdGF0ZS5pbmRlbnQ6IHdpZHRoIGlzIGZpeGVkIGF0IHRoZSBsb3dlciBib3VuZC5cbiAgICAvLyAgc3RhdGUubGluZVdpZHRoID4gNDAgKyBzdGF0ZS5pbmRlbnQ6IHdpZHRoIGRlY3JlYXNlcyB1bnRpbCB0aGUgbG93ZXJcbiAgICAvLyAgYm91bmQuXG4gICAgLy8gVGhpcyBiZWhhdmVzIGJldHRlciB0aGFuIGEgY29uc3RhbnQgbWluaW11bSB3aWR0aCB3aGljaCBkaXNhbGxvd3NcbiAgICAvLyBuYXJyb3dlciBvcHRpb25zLCBvciBhbiBpbmRlbnQgdGhyZXNob2xkIHdoaWNoIGNhdXNlcyB0aGUgd2lkdGhcbiAgICAvLyB0byBzdWRkZW5seSBpbmNyZWFzZS5cbiAgICBjb25zdCBsaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggPT09IC0xXG4gICAgICA/IC0xXG4gICAgICA6IE1hdGgubWF4KE1hdGgubWluKHN0YXRlLmxpbmVXaWR0aCwgNDApLCBzdGF0ZS5saW5lV2lkdGggLSBpbmRlbnQpO1xuXG4gICAgLy8gV2l0aG91dCBrbm93aW5nIGlmIGtleXMgYXJlIGltcGxpY2l0L2V4cGxpY2l0LFxuICAgIC8vIGFzc3VtZSBpbXBsaWNpdCBmb3Igc2FmZXR5LlxuICAgIGNvbnN0IHNpbmdsZUxpbmVPbmx5ID0gaXNrZXkgfHxcbiAgICAgIC8vIE5vIGJsb2NrIHN0eWxlcyBpbiBmbG93IG1vZGUuXG4gICAgICAoc3RhdGUuZmxvd0xldmVsID4gLTEgJiYgbGV2ZWwgPj0gc3RhdGUuZmxvd0xldmVsKTtcbiAgICBmdW5jdGlvbiB0ZXN0QW1iaWd1aXR5KHN0cjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGVzdEltcGxpY2l0UmVzb2x2aW5nKHN0YXRlLCBzdHIpO1xuICAgIH1cblxuICAgIHN3aXRjaCAoXG4gICAgICBjaG9vc2VTY2FsYXJTdHlsZShcbiAgICAgICAgc3RyaW5nLFxuICAgICAgICBzaW5nbGVMaW5lT25seSxcbiAgICAgICAgc3RhdGUuaW5kZW50LFxuICAgICAgICBsaW5lV2lkdGgsXG4gICAgICAgIHRlc3RBbWJpZ3VpdHksXG4gICAgICApXG4gICAgKSB7XG4gICAgICBjYXNlIFNUWUxFX1BMQUlOOlxuICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgY2FzZSBTVFlMRV9TSU5HTEU6XG4gICAgICAgIHJldHVybiBgJyR7c3RyaW5nLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYDtcbiAgICAgIGNhc2UgU1RZTEVfTElURVJBTDpcbiAgICAgICAgcmV0dXJuIGB8JHtibG9ja0hlYWRlcihzdHJpbmcsIHN0YXRlLmluZGVudCl9JHtcbiAgICAgICAgICBkcm9wRW5kaW5nTmV3bGluZShcbiAgICAgICAgICAgIGluZGVudFN0cmluZyhzdHJpbmcsIGluZGVudCksXG4gICAgICAgICAgKVxuICAgICAgICB9YDtcbiAgICAgIGNhc2UgU1RZTEVfRk9MREVEOlxuICAgICAgICByZXR1cm4gYD4ke2Jsb2NrSGVhZGVyKHN0cmluZywgc3RhdGUuaW5kZW50KX0ke1xuICAgICAgICAgIGRyb3BFbmRpbmdOZXdsaW5lKFxuICAgICAgICAgICAgaW5kZW50U3RyaW5nKGZvbGRTdHJpbmcoc3RyaW5nLCBsaW5lV2lkdGgpLCBpbmRlbnQpLFxuICAgICAgICAgIClcbiAgICAgICAgfWA7XG4gICAgICBjYXNlIFNUWUxFX0RPVUJMRTpcbiAgICAgICAgcmV0dXJuIGBcIiR7ZXNjYXBlU3RyaW5nKHN0cmluZyl9XCJgO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IFlBTUxFcnJvcihcImltcG9zc2libGUgZXJyb3I6IGludmFsaWQgc2NhbGFyIHN0eWxlXCIpO1xuICAgIH1cbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG93U2VxdWVuY2UoXG4gIHN0YXRlOiBEdW1wZXJTdGF0ZSxcbiAgbGV2ZWw6IG51bWJlcixcbiAgb2JqZWN0OiBBbnksXG4pIHtcbiAgbGV0IF9yZXN1bHQgPSBcIlwiO1xuICBjb25zdCBfdGFnID0gc3RhdGUudGFnO1xuXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBvYmplY3QubGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgLy8gV3JpdGUgb25seSB2YWxpZCBlbGVtZW50cy5cbiAgICBpZiAod3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgb2JqZWN0W2luZGV4XSwgZmFsc2UsIGZhbHNlKSkge1xuICAgICAgaWYgKGluZGV4ICE9PSAwKSBfcmVzdWx0ICs9IGAsJHshc3RhdGUuY29uZGVuc2VGbG93ID8gXCIgXCIgOiBcIlwifWA7XG4gICAgICBfcmVzdWx0ICs9IHN0YXRlLmR1bXA7XG4gICAgfVxuICB9XG5cbiAgc3RhdGUudGFnID0gX3RhZztcbiAgc3RhdGUuZHVtcCA9IGBbJHtfcmVzdWx0fV1gO1xufVxuXG5mdW5jdGlvbiB3cml0ZUJsb2NrU2VxdWVuY2UoXG4gIHN0YXRlOiBEdW1wZXJTdGF0ZSxcbiAgbGV2ZWw6IG51bWJlcixcbiAgb2JqZWN0OiBBbnksXG4gIGNvbXBhY3QgPSBmYWxzZSxcbikge1xuICBsZXQgX3Jlc3VsdCA9IFwiXCI7XG4gIGNvbnN0IF90YWcgPSBzdGF0ZS50YWc7XG5cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9iamVjdC5sZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAvLyBXcml0ZSBvbmx5IHZhbGlkIGVsZW1lbnRzLlxuICAgIGlmICh3cml0ZU5vZGUoc3RhdGUsIGxldmVsICsgMSwgb2JqZWN0W2luZGV4XSwgdHJ1ZSwgdHJ1ZSkpIHtcbiAgICAgIGlmICghY29tcGFjdCB8fCBpbmRleCAhPT0gMCkge1xuICAgICAgICBfcmVzdWx0ICs9IGdlbmVyYXRlTmV4dExpbmUoc3RhdGUsIGxldmVsKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlLmR1bXAgJiYgQ0hBUl9MSU5FX0ZFRUQgPT09IHN0YXRlLmR1bXAuY2hhckNvZGVBdCgwKSkge1xuICAgICAgICBfcmVzdWx0ICs9IFwiLVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3Jlc3VsdCArPSBcIi0gXCI7XG4gICAgICB9XG5cbiAgICAgIF9yZXN1bHQgKz0gc3RhdGUuZHVtcDtcbiAgICB9XG4gIH1cblxuICBzdGF0ZS50YWcgPSBfdGFnO1xuICBzdGF0ZS5kdW1wID0gX3Jlc3VsdCB8fCBcIltdXCI7IC8vIEVtcHR5IHNlcXVlbmNlIGlmIG5vIHZhbGlkIHZhbHVlcy5cbn1cblxuZnVuY3Rpb24gd3JpdGVGbG93TWFwcGluZyhcbiAgc3RhdGU6IER1bXBlclN0YXRlLFxuICBsZXZlbDogbnVtYmVyLFxuICBvYmplY3Q6IEFueSxcbikge1xuICBsZXQgX3Jlc3VsdCA9IFwiXCI7XG4gIGNvbnN0IF90YWcgPSBzdGF0ZS50YWc7XG4gIGNvbnN0IG9iamVjdEtleUxpc3QgPSBPYmplY3Qua2V5cyhvYmplY3QpO1xuXG4gIGZvciAoY29uc3QgW2luZGV4LCBvYmplY3RLZXldIG9mIG9iamVjdEtleUxpc3QuZW50cmllcygpKSB7XG4gICAgbGV0IHBhaXJCdWZmZXIgPSBzdGF0ZS5jb25kZW5zZUZsb3cgPyAnXCInIDogXCJcIjtcblxuICAgIGlmIChpbmRleCAhPT0gMCkgcGFpckJ1ZmZlciArPSBcIiwgXCI7XG5cbiAgICBjb25zdCBvYmplY3RWYWx1ZSA9IG9iamVjdFtvYmplY3RLZXldO1xuXG4gICAgaWYgKCF3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCBvYmplY3RLZXksIGZhbHNlLCBmYWxzZSkpIHtcbiAgICAgIGNvbnRpbnVlOyAvLyBTa2lwIHRoaXMgcGFpciBiZWNhdXNlIG9mIGludmFsaWQga2V5O1xuICAgIH1cblxuICAgIGlmIChzdGF0ZS5kdW1wLmxlbmd0aCA+IDEwMjQpIHBhaXJCdWZmZXIgKz0gXCI/IFwiO1xuXG4gICAgcGFpckJ1ZmZlciArPSBgJHtzdGF0ZS5kdW1wfSR7c3RhdGUuY29uZGVuc2VGbG93ID8gJ1wiJyA6IFwiXCJ9OiR7XG4gICAgICBzdGF0ZS5jb25kZW5zZUZsb3cgPyBcIlwiIDogXCIgXCJcbiAgICB9YDtcblxuICAgIGlmICghd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgb2JqZWN0VmFsdWUsIGZhbHNlLCBmYWxzZSkpIHtcbiAgICAgIGNvbnRpbnVlOyAvLyBTa2lwIHRoaXMgcGFpciBiZWNhdXNlIG9mIGludmFsaWQgdmFsdWUuXG4gICAgfVxuXG4gICAgcGFpckJ1ZmZlciArPSBzdGF0ZS5kdW1wO1xuXG4gICAgLy8gQm90aCBrZXkgYW5kIHZhbHVlIGFyZSB2YWxpZC5cbiAgICBfcmVzdWx0ICs9IHBhaXJCdWZmZXI7XG4gIH1cblxuICBzdGF0ZS50YWcgPSBfdGFnO1xuICBzdGF0ZS5kdW1wID0gYHske19yZXN1bHR9fWA7XG59XG5cbmZ1bmN0aW9uIHdyaXRlQmxvY2tNYXBwaW5nKFxuICBzdGF0ZTogRHVtcGVyU3RhdGUsXG4gIGxldmVsOiBudW1iZXIsXG4gIG9iamVjdDogQW55LFxuICBjb21wYWN0ID0gZmFsc2UsXG4pIHtcbiAgY29uc3QgX3RhZyA9IHN0YXRlLnRhZztcbiAgY29uc3Qgb2JqZWN0S2V5TGlzdCA9IE9iamVjdC5rZXlzKG9iamVjdCk7XG4gIGxldCBfcmVzdWx0ID0gXCJcIjtcblxuICAvLyBBbGxvdyBzb3J0aW5nIGtleXMgc28gdGhhdCB0aGUgb3V0cHV0IGZpbGUgaXMgZGV0ZXJtaW5pc3RpY1xuICBpZiAoc3RhdGUuc29ydEtleXMgPT09IHRydWUpIHtcbiAgICAvLyBEZWZhdWx0IHNvcnRpbmdcbiAgICBvYmplY3RLZXlMaXN0LnNvcnQoKTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygc3RhdGUuc29ydEtleXMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIC8vIEN1c3RvbSBzb3J0IGZ1bmN0aW9uXG4gICAgb2JqZWN0S2V5TGlzdC5zb3J0KHN0YXRlLnNvcnRLZXlzKTtcbiAgfSBlbHNlIGlmIChzdGF0ZS5zb3J0S2V5cykge1xuICAgIC8vIFNvbWV0aGluZyBpcyB3cm9uZ1xuICAgIHRocm93IG5ldyBZQU1MRXJyb3IoXCJzb3J0S2V5cyBtdXN0IGJlIGEgYm9vbGVhbiBvciBhIGZ1bmN0aW9uXCIpO1xuICB9XG5cbiAgZm9yIChjb25zdCBbaW5kZXgsIG9iamVjdEtleV0gb2Ygb2JqZWN0S2V5TGlzdC5lbnRyaWVzKCkpIHtcbiAgICBsZXQgcGFpckJ1ZmZlciA9IFwiXCI7XG5cbiAgICBpZiAoIWNvbXBhY3QgfHwgaW5kZXggIT09IDApIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gZ2VuZXJhdGVOZXh0TGluZShzdGF0ZSwgbGV2ZWwpO1xuICAgIH1cblxuICAgIGNvbnN0IG9iamVjdFZhbHVlID0gb2JqZWN0W29iamVjdEtleV07XG5cbiAgICBpZiAoIXdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCBvYmplY3RLZXksIHRydWUsIHRydWUsIHRydWUpKSB7XG4gICAgICBjb250aW51ZTsgLy8gU2tpcCB0aGlzIHBhaXIgYmVjYXVzZSBvZiBpbnZhbGlkIGtleS5cbiAgICB9XG5cbiAgICBjb25zdCBleHBsaWNpdFBhaXIgPSAoc3RhdGUudGFnICE9PSBudWxsICYmIHN0YXRlLnRhZyAhPT0gXCI/XCIpIHx8XG4gICAgICAoc3RhdGUuZHVtcCAmJiBzdGF0ZS5kdW1wLmxlbmd0aCA+IDEwMjQpO1xuXG4gICAgaWYgKGV4cGxpY2l0UGFpcikge1xuICAgICAgaWYgKHN0YXRlLmR1bXAgJiYgQ0hBUl9MSU5FX0ZFRUQgPT09IHN0YXRlLmR1bXAuY2hhckNvZGVBdCgwKSkge1xuICAgICAgICBwYWlyQnVmZmVyICs9IFwiP1wiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFpckJ1ZmZlciArPSBcIj8gXCI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGFpckJ1ZmZlciArPSBzdGF0ZS5kdW1wO1xuXG4gICAgaWYgKGV4cGxpY2l0UGFpcikge1xuICAgICAgcGFpckJ1ZmZlciArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbCk7XG4gICAgfVxuXG4gICAgaWYgKCF3cml0ZU5vZGUoc3RhdGUsIGxldmVsICsgMSwgb2JqZWN0VmFsdWUsIHRydWUsIGV4cGxpY2l0UGFpcikpIHtcbiAgICAgIGNvbnRpbnVlOyAvLyBTa2lwIHRoaXMgcGFpciBiZWNhdXNlIG9mIGludmFsaWQgdmFsdWUuXG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLmR1bXAgJiYgQ0hBUl9MSU5FX0ZFRUQgPT09IHN0YXRlLmR1bXAuY2hhckNvZGVBdCgwKSkge1xuICAgICAgcGFpckJ1ZmZlciArPSBcIjpcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFpckJ1ZmZlciArPSBcIjogXCI7XG4gICAgfVxuXG4gICAgcGFpckJ1ZmZlciArPSBzdGF0ZS5kdW1wO1xuXG4gICAgLy8gQm90aCBrZXkgYW5kIHZhbHVlIGFyZSB2YWxpZC5cbiAgICBfcmVzdWx0ICs9IHBhaXJCdWZmZXI7XG4gIH1cblxuICBzdGF0ZS50YWcgPSBfdGFnO1xuICBzdGF0ZS5kdW1wID0gX3Jlc3VsdCB8fCBcInt9XCI7IC8vIEVtcHR5IG1hcHBpbmcgaWYgbm8gdmFsaWQgcGFpcnMuXG59XG5cbmZ1bmN0aW9uIGRldGVjdFR5cGUoXG4gIHN0YXRlOiBEdW1wZXJTdGF0ZSxcbiAgb2JqZWN0OiBBbnksXG4gIGV4cGxpY2l0ID0gZmFsc2UsXG4pOiBib29sZWFuIHtcbiAgY29uc3QgdHlwZUxpc3QgPSBleHBsaWNpdCA/IHN0YXRlLmV4cGxpY2l0VHlwZXMgOiBzdGF0ZS5pbXBsaWNpdFR5cGVzO1xuXG4gIGZvciAoY29uc3QgdHlwZSBvZiB0eXBlTGlzdCkge1xuICAgIGxldCBfcmVzdWx0OiBzdHJpbmc7XG5cbiAgICBpZiAoXG4gICAgICAodHlwZS5pbnN0YW5jZU9mIHx8IHR5cGUucHJlZGljYXRlKSAmJlxuICAgICAgKCF0eXBlLmluc3RhbmNlT2YgfHxcbiAgICAgICAgKHR5cGVvZiBvYmplY3QgPT09IFwib2JqZWN0XCIgJiYgb2JqZWN0IGluc3RhbmNlb2YgdHlwZS5pbnN0YW5jZU9mKSkgJiZcbiAgICAgICghdHlwZS5wcmVkaWNhdGUgfHwgdHlwZS5wcmVkaWNhdGUob2JqZWN0KSlcbiAgICApIHtcbiAgICAgIHN0YXRlLnRhZyA9IGV4cGxpY2l0ID8gdHlwZS50YWcgOiBcIj9cIjtcblxuICAgICAgaWYgKHR5cGUucmVwcmVzZW50KSB7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gc3RhdGUuc3R5bGVNYXBbdHlwZS50YWddISB8fCB0eXBlLmRlZmF1bHRTdHlsZTtcblxuICAgICAgICBpZiAoX3RvU3RyaW5nLmNhbGwodHlwZS5yZXByZXNlbnQpID09PSBcIltvYmplY3QgRnVuY3Rpb25dXCIpIHtcbiAgICAgICAgICBfcmVzdWx0ID0gKHR5cGUucmVwcmVzZW50IGFzIFJlcHJlc2VudEZuKShvYmplY3QsIHN0eWxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNPd24odHlwZS5yZXByZXNlbnQsIHN0eWxlKSkge1xuICAgICAgICAgIF9yZXN1bHQgPSAodHlwZS5yZXByZXNlbnQgYXMgQXJyYXlPYmplY3Q8UmVwcmVzZW50Rm4+KVtzdHlsZV0hKFxuICAgICAgICAgICAgb2JqZWN0LFxuICAgICAgICAgICAgc3R5bGUsXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgWUFNTEVycm9yKFxuICAgICAgICAgICAgYCE8JHt0eXBlLnRhZ30+IHRhZyByZXNvbHZlciBhY2NlcHRzIG5vdCBcIiR7c3R5bGV9XCIgc3R5bGVgLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5kdW1wID0gX3Jlc3VsdDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vLyBTZXJpYWxpemVzIGBvYmplY3RgIGFuZCB3cml0ZXMgaXQgdG8gZ2xvYmFsIGByZXN1bHRgLlxuLy8gUmV0dXJucyB0cnVlIG9uIHN1Y2Nlc3MsIG9yIGZhbHNlIG9uIGludmFsaWQgb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIHdyaXRlTm9kZShcbiAgc3RhdGU6IER1bXBlclN0YXRlLFxuICBsZXZlbDogbnVtYmVyLFxuICBvYmplY3Q6IEFueSxcbiAgYmxvY2s6IGJvb2xlYW4sXG4gIGNvbXBhY3Q6IGJvb2xlYW4sXG4gIGlza2V5ID0gZmFsc2UsXG4pOiBib29sZWFuIHtcbiAgc3RhdGUudGFnID0gbnVsbDtcbiAgc3RhdGUuZHVtcCA9IG9iamVjdDtcblxuICBpZiAoIWRldGVjdFR5cGUoc3RhdGUsIG9iamVjdCwgZmFsc2UpKSB7XG4gICAgZGV0ZWN0VHlwZShzdGF0ZSwgb2JqZWN0LCB0cnVlKTtcbiAgfVxuXG4gIGNvbnN0IHR5cGUgPSBfdG9TdHJpbmcuY2FsbChzdGF0ZS5kdW1wKTtcblxuICBpZiAoYmxvY2spIHtcbiAgICBibG9jayA9IHN0YXRlLmZsb3dMZXZlbCA8IDAgfHwgc3RhdGUuZmxvd0xldmVsID4gbGV2ZWw7XG4gIH1cblxuICBjb25zdCBvYmplY3RPckFycmF5ID0gdHlwZSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIiB8fCB0eXBlID09PSBcIltvYmplY3QgQXJyYXldXCI7XG5cbiAgbGV0IGR1cGxpY2F0ZUluZGV4ID0gLTE7XG4gIGxldCBkdXBsaWNhdGUgPSBmYWxzZTtcbiAgaWYgKG9iamVjdE9yQXJyYXkpIHtcbiAgICBkdXBsaWNhdGVJbmRleCA9IHN0YXRlLmR1cGxpY2F0ZXMuaW5kZXhPZihvYmplY3QpO1xuICAgIGR1cGxpY2F0ZSA9IGR1cGxpY2F0ZUluZGV4ICE9PSAtMTtcbiAgfVxuXG4gIGlmIChcbiAgICAoc3RhdGUudGFnICE9PSBudWxsICYmIHN0YXRlLnRhZyAhPT0gXCI/XCIpIHx8XG4gICAgZHVwbGljYXRlIHx8XG4gICAgKHN0YXRlLmluZGVudCAhPT0gMiAmJiBsZXZlbCA+IDApXG4gICkge1xuICAgIGNvbXBhY3QgPSBmYWxzZTtcbiAgfVxuXG4gIGlmIChkdXBsaWNhdGUgJiYgc3RhdGUudXNlZER1cGxpY2F0ZXNbZHVwbGljYXRlSW5kZXhdKSB7XG4gICAgc3RhdGUuZHVtcCA9IGAqcmVmXyR7ZHVwbGljYXRlSW5kZXh9YDtcbiAgfSBlbHNlIHtcbiAgICBpZiAob2JqZWN0T3JBcnJheSAmJiBkdXBsaWNhdGUgJiYgIXN0YXRlLnVzZWREdXBsaWNhdGVzW2R1cGxpY2F0ZUluZGV4XSkge1xuICAgICAgc3RhdGUudXNlZER1cGxpY2F0ZXNbZHVwbGljYXRlSW5kZXhdID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09IFwiW29iamVjdCBPYmplY3RdXCIpIHtcbiAgICAgIGlmIChibG9jayAmJiBPYmplY3Qua2V5cyhzdGF0ZS5kdW1wKS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgd3JpdGVCbG9ja01hcHBpbmcoc3RhdGUsIGxldmVsLCBzdGF0ZS5kdW1wLCBjb21wYWN0KTtcbiAgICAgICAgaWYgKGR1cGxpY2F0ZSkge1xuICAgICAgICAgIHN0YXRlLmR1bXAgPSBgJnJlZl8ke2R1cGxpY2F0ZUluZGV4fSR7c3RhdGUuZHVtcH1gO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3cml0ZUZsb3dNYXBwaW5nKHN0YXRlLCBsZXZlbCwgc3RhdGUuZHVtcCk7XG4gICAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgICBzdGF0ZS5kdW1wID0gYCZyZWZfJHtkdXBsaWNhdGVJbmRleH0gJHtzdGF0ZS5kdW1wfWA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgICAgY29uc3QgYXJyYXlMZXZlbCA9IHN0YXRlLm5vQXJyYXlJbmRlbnQgJiYgbGV2ZWwgPiAwID8gbGV2ZWwgLSAxIDogbGV2ZWw7XG4gICAgICBpZiAoYmxvY2sgJiYgc3RhdGUuZHVtcC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgd3JpdGVCbG9ja1NlcXVlbmNlKHN0YXRlLCBhcnJheUxldmVsLCBzdGF0ZS5kdW1wLCBjb21wYWN0KTtcbiAgICAgICAgaWYgKGR1cGxpY2F0ZSkge1xuICAgICAgICAgIHN0YXRlLmR1bXAgPSBgJnJlZl8ke2R1cGxpY2F0ZUluZGV4fSR7c3RhdGUuZHVtcH1gO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3cml0ZUZsb3dTZXF1ZW5jZShzdGF0ZSwgYXJyYXlMZXZlbCwgc3RhdGUuZHVtcCk7XG4gICAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgICBzdGF0ZS5kdW1wID0gYCZyZWZfJHtkdXBsaWNhdGVJbmRleH0gJHtzdGF0ZS5kdW1wfWA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiW29iamVjdCBTdHJpbmddXCIpIHtcbiAgICAgIGlmIChzdGF0ZS50YWcgIT09IFwiP1wiKSB7XG4gICAgICAgIHdyaXRlU2NhbGFyKHN0YXRlLCBzdGF0ZS5kdW1wLCBsZXZlbCwgaXNrZXkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc3RhdGUuc2tpcEludmFsaWQpIHJldHVybiBmYWxzZTtcbiAgICAgIHRocm93IG5ldyBZQU1MRXJyb3IoYHVuYWNjZXB0YWJsZSBraW5kIG9mIGFuIG9iamVjdCB0byBkdW1wICR7dHlwZX1gKTtcbiAgICB9XG5cbiAgICBpZiAoc3RhdGUudGFnICE9PSBudWxsICYmIHN0YXRlLnRhZyAhPT0gXCI/XCIpIHtcbiAgICAgIHN0YXRlLmR1bXAgPSBgITwke3N0YXRlLnRhZ30+ICR7c3RhdGUuZHVtcH1gO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBpbnNwZWN0Tm9kZShcbiAgb2JqZWN0OiBBbnksXG4gIG9iamVjdHM6IEFueVtdLFxuICBkdXBsaWNhdGVzSW5kZXhlczogbnVtYmVyW10sXG4pIHtcbiAgaWYgKG9iamVjdCAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSBcIm9iamVjdFwiKSB7XG4gICAgY29uc3QgaW5kZXggPSBvYmplY3RzLmluZGV4T2Yob2JqZWN0KTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBpZiAoZHVwbGljYXRlc0luZGV4ZXMuaW5kZXhPZihpbmRleCkgPT09IC0xKSB7XG4gICAgICAgIGR1cGxpY2F0ZXNJbmRleGVzLnB1c2goaW5kZXgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvYmplY3RzLnB1c2gob2JqZWN0KTtcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBvYmplY3QubGVuZ3RoOyBpZHggKz0gMSkge1xuICAgICAgICAgIGluc3BlY3ROb2RlKG9iamVjdFtpZHhdLCBvYmplY3RzLCBkdXBsaWNhdGVzSW5kZXhlcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqZWN0S2V5IG9mIE9iamVjdC5rZXlzKG9iamVjdCkpIHtcbiAgICAgICAgICBpbnNwZWN0Tm9kZShvYmplY3Rbb2JqZWN0S2V5XSwgb2JqZWN0cywgZHVwbGljYXRlc0luZGV4ZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldER1cGxpY2F0ZVJlZmVyZW5jZXMoXG4gIG9iamVjdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gIHN0YXRlOiBEdW1wZXJTdGF0ZSxcbikge1xuICBjb25zdCBvYmplY3RzOiBBbnlbXSA9IFtdO1xuICBjb25zdCBkdXBsaWNhdGVzSW5kZXhlczogbnVtYmVyW10gPSBbXTtcblxuICBpbnNwZWN0Tm9kZShvYmplY3QsIG9iamVjdHMsIGR1cGxpY2F0ZXNJbmRleGVzKTtcblxuICBmb3IgKGNvbnN0IGlkeCBvZiBkdXBsaWNhdGVzSW5kZXhlcykge1xuICAgIHN0YXRlLmR1cGxpY2F0ZXMucHVzaChvYmplY3RzW2lkeF0pO1xuICB9XG4gIHN0YXRlLnVzZWREdXBsaWNhdGVzID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogZHVwbGljYXRlc0luZGV4ZXMubGVuZ3RoIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHVtcChpbnB1dDogQW55LCBvcHRpb25zPzogRHVtcGVyU3RhdGVPcHRpb25zKTogc3RyaW5nIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgY29uc3Qgc3RhdGUgPSBuZXcgRHVtcGVyU3RhdGUob3B0aW9ucyk7XG5cbiAgaWYgKCFzdGF0ZS5ub1JlZnMpIGdldER1cGxpY2F0ZVJlZmVyZW5jZXMoaW5wdXQsIHN0YXRlKTtcblxuICBpZiAod3JpdGVOb2RlKHN0YXRlLCAwLCBpbnB1dCwgdHJ1ZSwgdHJ1ZSkpIHJldHVybiBgJHtzdGF0ZS5kdW1wfVxcbmA7XG5cbiAgcmV0dXJuIFwiXCI7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBRTFFLFNBQVMsU0FBUyxRQUFRLGVBQWU7QUFFekMsWUFBWSxZQUFZLGVBQWU7QUFDdkMsU0FBUyxXQUFXLFFBQWlDLG9CQUFvQjtBQUt6RSxNQUFNLFlBQVksT0FBTyxTQUFTLENBQUMsUUFBUTtBQUMzQyxNQUFNLEVBQUUsTUFBTSxFQUFF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
// denoCacheMetadata=3086016979710330984,3040225960445577402