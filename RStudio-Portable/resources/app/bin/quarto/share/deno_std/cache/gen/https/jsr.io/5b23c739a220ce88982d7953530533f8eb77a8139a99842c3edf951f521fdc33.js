// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Options for {@linkcode globToRegExp}. */ const regExpEscapeChars = [
  "!",
  "$",
  "(",
  ")",
  "*",
  "+",
  ".",
  "=",
  "?",
  "[",
  "\\",
  "^",
  "{",
  "|"
];
const rangeEscapeChars = [
  "-",
  "\\",
  "]"
];
export function _globToRegExp(c, glob, { extended = true, globstar: globstarOption = true, // os = osType,
caseInsensitive = false } = {}) {
  if (glob === "") {
    return /(?!)/;
  }
  // Remove trailing separators.
  let newLength = glob.length;
  for(; newLength > 1 && c.seps.includes(glob[newLength - 1]); newLength--);
  glob = glob.slice(0, newLength);
  let regExpString = "";
  // Terminates correctly. Trust that `j` is incremented every iteration.
  for(let j = 0; j < glob.length;){
    let segment = "";
    const groupStack = [];
    let inRange = false;
    let inEscape = false;
    let endsWithSep = false;
    let i = j;
    // Terminates with `i` at the non-inclusive end of the current segment.
    for(; i < glob.length && !c.seps.includes(glob[i]); i++){
      if (inEscape) {
        inEscape = false;
        const escapeChars = inRange ? rangeEscapeChars : regExpEscapeChars;
        segment += escapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
        continue;
      }
      if (glob[i] === c.escapePrefix) {
        inEscape = true;
        continue;
      }
      if (glob[i] === "[") {
        if (!inRange) {
          inRange = true;
          segment += "[";
          if (glob[i + 1] === "!") {
            i++;
            segment += "^";
          } else if (glob[i + 1] === "^") {
            i++;
            segment += "\\^";
          }
          continue;
        } else if (glob[i + 1] === ":") {
          let k = i + 1;
          let value = "";
          while(glob[k + 1] !== undefined && glob[k + 1] !== ":"){
            value += glob[k + 1];
            k++;
          }
          if (glob[k + 1] === ":" && glob[k + 2] === "]") {
            i = k + 2;
            if (value === "alnum") segment += "\\dA-Za-z";
            else if (value === "alpha") segment += "A-Za-z";
            else if (value === "ascii") segment += "\x00-\x7F";
            else if (value === "blank") segment += "\t ";
            else if (value === "cntrl") segment += "\x00-\x1F\x7F";
            else if (value === "digit") segment += "\\d";
            else if (value === "graph") segment += "\x21-\x7E";
            else if (value === "lower") segment += "a-z";
            else if (value === "print") segment += "\x20-\x7E";
            else if (value === "punct") {
              segment += "!\"#$%&'()*+,\\-./:;<=>?@[\\\\\\]^_‘{|}~";
            } else if (value === "space") segment += "\\s\v";
            else if (value === "upper") segment += "A-Z";
            else if (value === "word") segment += "\\w";
            else if (value === "xdigit") segment += "\\dA-Fa-f";
            continue;
          }
        }
      }
      if (glob[i] === "]" && inRange) {
        inRange = false;
        segment += "]";
        continue;
      }
      if (inRange) {
        if (glob[i] === "\\") {
          segment += `\\\\`;
        } else {
          segment += glob[i];
        }
        continue;
      }
      if (glob[i] === ")" && groupStack.length > 0 && groupStack[groupStack.length - 1] !== "BRACE") {
        segment += ")";
        const type = groupStack.pop();
        if (type === "!") {
          segment += c.wildcard;
        } else if (type !== "@") {
          segment += type;
        }
        continue;
      }
      if (glob[i] === "|" && groupStack.length > 0 && groupStack[groupStack.length - 1] !== "BRACE") {
        segment += "|";
        continue;
      }
      if (glob[i] === "+" && extended && glob[i + 1] === "(") {
        i++;
        groupStack.push("+");
        segment += "(?:";
        continue;
      }
      if (glob[i] === "@" && extended && glob[i + 1] === "(") {
        i++;
        groupStack.push("@");
        segment += "(?:";
        continue;
      }
      if (glob[i] === "?") {
        if (extended && glob[i + 1] === "(") {
          i++;
          groupStack.push("?");
          segment += "(?:";
        } else {
          segment += ".";
        }
        continue;
      }
      if (glob[i] === "!" && extended && glob[i + 1] === "(") {
        i++;
        groupStack.push("!");
        segment += "(?!";
        continue;
      }
      if (glob[i] === "{") {
        groupStack.push("BRACE");
        segment += "(?:";
        continue;
      }
      if (glob[i] === "}" && groupStack[groupStack.length - 1] === "BRACE") {
        groupStack.pop();
        segment += ")";
        continue;
      }
      if (glob[i] === "," && groupStack[groupStack.length - 1] === "BRACE") {
        segment += "|";
        continue;
      }
      if (glob[i] === "*") {
        if (extended && glob[i + 1] === "(") {
          i++;
          groupStack.push("*");
          segment += "(?:";
        } else {
          const prevChar = glob[i - 1];
          let numStars = 1;
          while(glob[i + 1] === "*"){
            i++;
            numStars++;
          }
          const nextChar = glob[i + 1];
          if (globstarOption && numStars === 2 && [
            ...c.seps,
            undefined
          ].includes(prevChar) && [
            ...c.seps,
            undefined
          ].includes(nextChar)) {
            segment += c.globstar;
            endsWithSep = true;
          } else {
            segment += c.wildcard;
          }
        }
        continue;
      }
      segment += regExpEscapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
    }
    // Check for unclosed groups or a dangling backslash.
    if (groupStack.length > 0 || inRange || inEscape) {
      // Parse failure. Take all characters from this segment literally.
      segment = "";
      for (const c of glob.slice(j, i)){
        segment += regExpEscapeChars.includes(c) ? `\\${c}` : c;
        endsWithSep = false;
      }
    }
    regExpString += segment;
    if (!endsWithSep) {
      regExpString += i < glob.length ? c.sep : c.sepMaybe;
      endsWithSep = true;
    }
    // Terminates with `i` at the start of the next segment.
    while(c.seps.includes(glob[i]))i++;
    // Check that the next value of `j` is indeed higher than the current value.
    if (!(i > j)) {
      throw new Error("Assertion failure: i > j (potential infinite loop)");
    }
    j = i;
  }
  regExpString = `^${regExpString}$`;
  return new RegExp(regExpString, caseInsensitive ? "i" : "");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL19jb21tb24vZ2xvYl90b19yZWdfZXhwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKiBPcHRpb25zIGZvciB7QGxpbmtjb2RlIGdsb2JUb1JlZ0V4cH0uICovXG5leHBvcnQgaW50ZXJmYWNlIEdsb2JPcHRpb25zIHtcbiAgLyoqIEV4dGVuZGVkIGdsb2Igc3ludGF4LlxuICAgKiBTZWUgaHR0cHM6Ly93d3cubGludXhqb3VybmFsLmNvbS9jb250ZW50L2Jhc2gtZXh0ZW5kZWQtZ2xvYmJpbmcuXG4gICAqXG4gICAqIEBkZWZhdWx0IHt0cnVlfVxuICAgKi9cbiAgZXh0ZW5kZWQ/OiBib29sZWFuO1xuICAvKiogR2xvYnN0YXIgc3ludGF4LlxuICAgKiBTZWUgaHR0cHM6Ly93d3cubGludXhqb3VybmFsLmNvbS9jb250ZW50L2dsb2JzdGFyLW5ldy1iYXNoLWdsb2JiaW5nLW9wdGlvbi5cbiAgICogSWYgZmFsc2UsIGAqKmAgaXMgdHJlYXRlZCBsaWtlIGAqYC5cbiAgICpcbiAgICogQGRlZmF1bHQge3RydWV9XG4gICAqL1xuICBnbG9ic3Rhcj86IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIGdsb2JzdGFyIHNob3VsZCBiZSBjYXNlLWluc2Vuc2l0aXZlLiAqL1xuICBjYXNlSW5zZW5zaXRpdmU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgdHlwZSBHbG9iVG9SZWdFeHBPcHRpb25zID0gR2xvYk9wdGlvbnM7XG5cbmNvbnN0IHJlZ0V4cEVzY2FwZUNoYXJzID0gW1xuICBcIiFcIixcbiAgXCIkXCIsXG4gIFwiKFwiLFxuICBcIilcIixcbiAgXCIqXCIsXG4gIFwiK1wiLFxuICBcIi5cIixcbiAgXCI9XCIsXG4gIFwiP1wiLFxuICBcIltcIixcbiAgXCJcXFxcXCIsXG4gIFwiXlwiLFxuICBcIntcIixcbiAgXCJ8XCIsXG5dO1xuY29uc3QgcmFuZ2VFc2NhcGVDaGFycyA9IFtcIi1cIiwgXCJcXFxcXCIsIFwiXVwiXTtcblxuZXhwb3J0IGludGVyZmFjZSBHbG9iQ29uc3RhbnRzIHtcbiAgc2VwOiBzdHJpbmc7XG4gIHNlcE1heWJlOiBzdHJpbmc7XG4gIHNlcHM6IHN0cmluZ1tdO1xuICBnbG9ic3Rhcjogc3RyaW5nO1xuICB3aWxkY2FyZDogc3RyaW5nO1xuICBlc2NhcGVQcmVmaXg6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9nbG9iVG9SZWdFeHAoXG4gIGM6IEdsb2JDb25zdGFudHMsXG4gIGdsb2I6IHN0cmluZyxcbiAge1xuICAgIGV4dGVuZGVkID0gdHJ1ZSxcbiAgICBnbG9ic3RhcjogZ2xvYnN0YXJPcHRpb24gPSB0cnVlLFxuICAgIC8vIG9zID0gb3NUeXBlLFxuICAgIGNhc2VJbnNlbnNpdGl2ZSA9IGZhbHNlLFxuICB9OiBHbG9iVG9SZWdFeHBPcHRpb25zID0ge30sXG4pOiBSZWdFeHAge1xuICBpZiAoZ2xvYiA9PT0gXCJcIikge1xuICAgIHJldHVybiAvKD8hKS87XG4gIH1cblxuICAvLyBSZW1vdmUgdHJhaWxpbmcgc2VwYXJhdG9ycy5cbiAgbGV0IG5ld0xlbmd0aCA9IGdsb2IubGVuZ3RoO1xuICBmb3IgKDsgbmV3TGVuZ3RoID4gMSAmJiBjLnNlcHMuaW5jbHVkZXMoZ2xvYltuZXdMZW5ndGggLSAxXSEpOyBuZXdMZW5ndGgtLSk7XG4gIGdsb2IgPSBnbG9iLnNsaWNlKDAsIG5ld0xlbmd0aCk7XG5cbiAgbGV0IHJlZ0V4cFN0cmluZyA9IFwiXCI7XG5cbiAgLy8gVGVybWluYXRlcyBjb3JyZWN0bHkuIFRydXN0IHRoYXQgYGpgIGlzIGluY3JlbWVudGVkIGV2ZXJ5IGl0ZXJhdGlvbi5cbiAgZm9yIChsZXQgaiA9IDA7IGogPCBnbG9iLmxlbmd0aDspIHtcbiAgICBsZXQgc2VnbWVudCA9IFwiXCI7XG4gICAgY29uc3QgZ3JvdXBTdGFjazogc3RyaW5nW10gPSBbXTtcbiAgICBsZXQgaW5SYW5nZSA9IGZhbHNlO1xuICAgIGxldCBpbkVzY2FwZSA9IGZhbHNlO1xuICAgIGxldCBlbmRzV2l0aFNlcCA9IGZhbHNlO1xuICAgIGxldCBpID0gajtcblxuICAgIC8vIFRlcm1pbmF0ZXMgd2l0aCBgaWAgYXQgdGhlIG5vbi1pbmNsdXNpdmUgZW5kIG9mIHRoZSBjdXJyZW50IHNlZ21lbnQuXG4gICAgZm9yICg7IGkgPCBnbG9iLmxlbmd0aCAmJiAhYy5zZXBzLmluY2x1ZGVzKGdsb2JbaV0hKTsgaSsrKSB7XG4gICAgICBpZiAoaW5Fc2NhcGUpIHtcbiAgICAgICAgaW5Fc2NhcGUgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgZXNjYXBlQ2hhcnMgPSBpblJhbmdlID8gcmFuZ2VFc2NhcGVDaGFycyA6IHJlZ0V4cEVzY2FwZUNoYXJzO1xuICAgICAgICBzZWdtZW50ICs9IGVzY2FwZUNoYXJzLmluY2x1ZGVzKGdsb2JbaV0hKSA/IGBcXFxcJHtnbG9iW2ldfWAgOiBnbG9iW2ldO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGdsb2JbaV0gPT09IGMuZXNjYXBlUHJlZml4KSB7XG4gICAgICAgIGluRXNjYXBlID0gdHJ1ZTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChnbG9iW2ldID09PSBcIltcIikge1xuICAgICAgICBpZiAoIWluUmFuZ2UpIHtcbiAgICAgICAgICBpblJhbmdlID0gdHJ1ZTtcbiAgICAgICAgICBzZWdtZW50ICs9IFwiW1wiO1xuICAgICAgICAgIGlmIChnbG9iW2kgKyAxXSA9PT0gXCIhXCIpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHNlZ21lbnQgKz0gXCJeXCI7XG4gICAgICAgICAgfSBlbHNlIGlmIChnbG9iW2kgKyAxXSA9PT0gXCJeXCIpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHNlZ21lbnQgKz0gXCJcXFxcXlwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChnbG9iW2kgKyAxXSA9PT0gXCI6XCIpIHtcbiAgICAgICAgICBsZXQgayA9IGkgKyAxO1xuICAgICAgICAgIGxldCB2YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgd2hpbGUgKGdsb2JbayArIDFdICE9PSB1bmRlZmluZWQgJiYgZ2xvYltrICsgMV0gIT09IFwiOlwiKSB7XG4gICAgICAgICAgICB2YWx1ZSArPSBnbG9iW2sgKyAxXTtcbiAgICAgICAgICAgIGsrKztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGdsb2JbayArIDFdID09PSBcIjpcIiAmJiBnbG9iW2sgKyAyXSA9PT0gXCJdXCIpIHtcbiAgICAgICAgICAgIGkgPSBrICsgMjtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gXCJhbG51bVwiKSBzZWdtZW50ICs9IFwiXFxcXGRBLVphLXpcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID09PSBcImFscGhhXCIpIHNlZ21lbnQgKz0gXCJBLVphLXpcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID09PSBcImFzY2lpXCIpIHNlZ21lbnQgKz0gXCJcXHgwMC1cXHg3RlwiO1xuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgPT09IFwiYmxhbmtcIikgc2VnbWVudCArPSBcIlxcdCBcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID09PSBcImNudHJsXCIpIHNlZ21lbnQgKz0gXCJcXHgwMC1cXHgxRlxceDdGXCI7XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSA9PT0gXCJkaWdpdFwiKSBzZWdtZW50ICs9IFwiXFxcXGRcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID09PSBcImdyYXBoXCIpIHNlZ21lbnQgKz0gXCJcXHgyMS1cXHg3RVwiO1xuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgPT09IFwibG93ZXJcIikgc2VnbWVudCArPSBcImEtelwiO1xuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgPT09IFwicHJpbnRcIikgc2VnbWVudCArPSBcIlxceDIwLVxceDdFXCI7XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSA9PT0gXCJwdW5jdFwiKSB7XG4gICAgICAgICAgICAgIHNlZ21lbnQgKz0gXCIhXFxcIiMkJSYnKCkqKyxcXFxcLS4vOjs8PT4/QFtcXFxcXFxcXFxcXFxdXl/igJh7fH1+XCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBcInNwYWNlXCIpIHNlZ21lbnQgKz0gXCJcXFxcc1xcdlwiO1xuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgPT09IFwidXBwZXJcIikgc2VnbWVudCArPSBcIkEtWlwiO1xuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgPT09IFwid29yZFwiKSBzZWdtZW50ICs9IFwiXFxcXHdcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID09PSBcInhkaWdpdFwiKSBzZWdtZW50ICs9IFwiXFxcXGRBLUZhLWZcIjtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZ2xvYltpXSA9PT0gXCJdXCIgJiYgaW5SYW5nZSkge1xuICAgICAgICBpblJhbmdlID0gZmFsc2U7XG4gICAgICAgIHNlZ21lbnQgKz0gXCJdXCI7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaW5SYW5nZSkge1xuICAgICAgICBpZiAoZ2xvYltpXSA9PT0gXCJcXFxcXCIpIHtcbiAgICAgICAgICBzZWdtZW50ICs9IGBcXFxcXFxcXGA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VnbWVudCArPSBnbG9iW2ldO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIGdsb2JbaV0gPT09IFwiKVwiICYmIGdyb3VwU3RhY2subGVuZ3RoID4gMCAmJlxuICAgICAgICBncm91cFN0YWNrW2dyb3VwU3RhY2subGVuZ3RoIC0gMV0gIT09IFwiQlJBQ0VcIlxuICAgICAgKSB7XG4gICAgICAgIHNlZ21lbnQgKz0gXCIpXCI7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBncm91cFN0YWNrLnBvcCgpITtcbiAgICAgICAgaWYgKHR5cGUgPT09IFwiIVwiKSB7XG4gICAgICAgICAgc2VnbWVudCArPSBjLndpbGRjYXJkO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgIT09IFwiQFwiKSB7XG4gICAgICAgICAgc2VnbWVudCArPSB0eXBlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIGdsb2JbaV0gPT09IFwifFwiICYmIGdyb3VwU3RhY2subGVuZ3RoID4gMCAmJlxuICAgICAgICBncm91cFN0YWNrW2dyb3VwU3RhY2subGVuZ3RoIC0gMV0gIT09IFwiQlJBQ0VcIlxuICAgICAgKSB7XG4gICAgICAgIHNlZ21lbnQgKz0gXCJ8XCI7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2xvYltpXSA9PT0gXCIrXCIgJiYgZXh0ZW5kZWQgJiYgZ2xvYltpICsgMV0gPT09IFwiKFwiKSB7XG4gICAgICAgIGkrKztcbiAgICAgICAgZ3JvdXBTdGFjay5wdXNoKFwiK1wiKTtcbiAgICAgICAgc2VnbWVudCArPSBcIig/OlwiO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGdsb2JbaV0gPT09IFwiQFwiICYmIGV4dGVuZGVkICYmIGdsb2JbaSArIDFdID09PSBcIihcIikge1xuICAgICAgICBpKys7XG4gICAgICAgIGdyb3VwU3RhY2sucHVzaChcIkBcIik7XG4gICAgICAgIHNlZ21lbnQgKz0gXCIoPzpcIjtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChnbG9iW2ldID09PSBcIj9cIikge1xuICAgICAgICBpZiAoZXh0ZW5kZWQgJiYgZ2xvYltpICsgMV0gPT09IFwiKFwiKSB7XG4gICAgICAgICAgaSsrO1xuICAgICAgICAgIGdyb3VwU3RhY2sucHVzaChcIj9cIik7XG4gICAgICAgICAgc2VnbWVudCArPSBcIig/OlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlZ21lbnQgKz0gXCIuXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChnbG9iW2ldID09PSBcIiFcIiAmJiBleHRlbmRlZCAmJiBnbG9iW2kgKyAxXSA9PT0gXCIoXCIpIHtcbiAgICAgICAgaSsrO1xuICAgICAgICBncm91cFN0YWNrLnB1c2goXCIhXCIpO1xuICAgICAgICBzZWdtZW50ICs9IFwiKD8hXCI7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2xvYltpXSA9PT0gXCJ7XCIpIHtcbiAgICAgICAgZ3JvdXBTdGFjay5wdXNoKFwiQlJBQ0VcIik7XG4gICAgICAgIHNlZ21lbnQgKz0gXCIoPzpcIjtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChnbG9iW2ldID09PSBcIn1cIiAmJiBncm91cFN0YWNrW2dyb3VwU3RhY2subGVuZ3RoIC0gMV0gPT09IFwiQlJBQ0VcIikge1xuICAgICAgICBncm91cFN0YWNrLnBvcCgpO1xuICAgICAgICBzZWdtZW50ICs9IFwiKVwiO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGdsb2JbaV0gPT09IFwiLFwiICYmIGdyb3VwU3RhY2tbZ3JvdXBTdGFjay5sZW5ndGggLSAxXSA9PT0gXCJCUkFDRVwiKSB7XG4gICAgICAgIHNlZ21lbnQgKz0gXCJ8XCI7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2xvYltpXSA9PT0gXCIqXCIpIHtcbiAgICAgICAgaWYgKGV4dGVuZGVkICYmIGdsb2JbaSArIDFdID09PSBcIihcIikge1xuICAgICAgICAgIGkrKztcbiAgICAgICAgICBncm91cFN0YWNrLnB1c2goXCIqXCIpO1xuICAgICAgICAgIHNlZ21lbnQgKz0gXCIoPzpcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBwcmV2Q2hhciA9IGdsb2JbaSAtIDFdO1xuICAgICAgICAgIGxldCBudW1TdGFycyA9IDE7XG4gICAgICAgICAgd2hpbGUgKGdsb2JbaSArIDFdID09PSBcIipcIikge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgbnVtU3RhcnMrKztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbmV4dENoYXIgPSBnbG9iW2kgKyAxXTtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBnbG9ic3Rhck9wdGlvbiAmJiBudW1TdGFycyA9PT0gMiAmJlxuICAgICAgICAgICAgWy4uLmMuc2VwcywgdW5kZWZpbmVkXS5pbmNsdWRlcyhwcmV2Q2hhcikgJiZcbiAgICAgICAgICAgIFsuLi5jLnNlcHMsIHVuZGVmaW5lZF0uaW5jbHVkZXMobmV4dENoYXIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBzZWdtZW50ICs9IGMuZ2xvYnN0YXI7XG4gICAgICAgICAgICBlbmRzV2l0aFNlcCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlZ21lbnQgKz0gYy53aWxkY2FyZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHNlZ21lbnQgKz0gcmVnRXhwRXNjYXBlQ2hhcnMuaW5jbHVkZXMoZ2xvYltpXSEpXG4gICAgICAgID8gYFxcXFwke2dsb2JbaV19YFxuICAgICAgICA6IGdsb2JbaV07XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHVuY2xvc2VkIGdyb3VwcyBvciBhIGRhbmdsaW5nIGJhY2tzbGFzaC5cbiAgICBpZiAoZ3JvdXBTdGFjay5sZW5ndGggPiAwIHx8IGluUmFuZ2UgfHwgaW5Fc2NhcGUpIHtcbiAgICAgIC8vIFBhcnNlIGZhaWx1cmUuIFRha2UgYWxsIGNoYXJhY3RlcnMgZnJvbSB0aGlzIHNlZ21lbnQgbGl0ZXJhbGx5LlxuICAgICAgc2VnbWVudCA9IFwiXCI7XG4gICAgICBmb3IgKGNvbnN0IGMgb2YgZ2xvYi5zbGljZShqLCBpKSkge1xuICAgICAgICBzZWdtZW50ICs9IHJlZ0V4cEVzY2FwZUNoYXJzLmluY2x1ZGVzKGMpID8gYFxcXFwke2N9YCA6IGM7XG4gICAgICAgIGVuZHNXaXRoU2VwID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVnRXhwU3RyaW5nICs9IHNlZ21lbnQ7XG4gICAgaWYgKCFlbmRzV2l0aFNlcCkge1xuICAgICAgcmVnRXhwU3RyaW5nICs9IGkgPCBnbG9iLmxlbmd0aCA/IGMuc2VwIDogYy5zZXBNYXliZTtcbiAgICAgIGVuZHNXaXRoU2VwID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBUZXJtaW5hdGVzIHdpdGggYGlgIGF0IHRoZSBzdGFydCBvZiB0aGUgbmV4dCBzZWdtZW50LlxuICAgIHdoaWxlIChjLnNlcHMuaW5jbHVkZXMoZ2xvYltpXSEpKSBpKys7XG5cbiAgICAvLyBDaGVjayB0aGF0IHRoZSBuZXh0IHZhbHVlIG9mIGBqYCBpcyBpbmRlZWQgaGlnaGVyIHRoYW4gdGhlIGN1cnJlbnQgdmFsdWUuXG4gICAgaWYgKCEoaSA+IGopKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NlcnRpb24gZmFpbHVyZTogaSA+IGogKHBvdGVudGlhbCBpbmZpbml0ZSBsb29wKVwiKTtcbiAgICB9XG4gICAgaiA9IGk7XG4gIH1cblxuICByZWdFeHBTdHJpbmcgPSBgXiR7cmVnRXhwU3RyaW5nfSRgO1xuICByZXR1cm4gbmV3IFJlZ0V4cChyZWdFeHBTdHJpbmcsIGNhc2VJbnNlbnNpdGl2ZSA/IFwiaVwiIDogXCJcIik7XG59XG4iXSwi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
// denoCacheMetadata=6579725175517442232,12319413556588505018