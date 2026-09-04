// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { isNegativeZero } from "../_utils.ts";
function isCharCodeInRange(c, lower, upper) {
  return lower <= c && c <= upper;
}
function isHexCode(c) {
  return isCharCodeInRange(c, 0x30, 0x39) || // 0-9
  isCharCodeInRange(c, 0x41, 0x46) || // A-F
  isCharCodeInRange(c, 0x61, 0x66) // a-f
  ;
}
function isOctCode(c) {
  return isCharCodeInRange(c, 0x30, 0x37); // 0-7
}
function isDecCode(c) {
  return isCharCodeInRange(c, 0x30, 0x39); // 0-9
}
function resolveYamlInteger(data) {
  const max = data.length;
  let index = 0;
  let hasDigits = false;
  if (!max) return false;
  let ch = data[index];
  // sign
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index];
    // base 2, base 8, base 16
    if (ch === "b") {
      // base 2
      index++;
      for(; index < max; index++){
        ch = data[index];
        if (ch === "_") continue;
        if (ch !== "0" && ch !== "1") return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      // base 16
      index++;
      for(; index < max; index++){
        ch = data[index];
        if (ch === "_") continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    // base 8
    for(; index < max; index++){
      ch = data[index];
      if (ch === "_") continue;
      if (!isOctCode(data.charCodeAt(index))) return false;
      hasDigits = true;
    }
    return hasDigits && ch !== "_";
  }
  // base 10 (except 0) or base 60
  // value should not start with `_`;
  if (ch === "_") return false;
  for(; index < max; index++){
    ch = data[index];
    if (ch === "_") continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  // Should have digits and should not end with `_`
  if (!hasDigits || ch === "_") return false;
  // base60 almost not used, no needs to optimize
  return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
}
function constructYamlInteger(data) {
  let value = data;
  if (value.includes("_")) {
    value = value.replace(/_/g, "");
  }
  let sign = 1;
  let ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0") return 0;
  if (ch === "0") {
    if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x") return sign * parseInt(value, 16);
    return sign * parseInt(value, 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  if (object instanceof Number) object = object.valueOf();
  return typeof object === "number" && object % 1 === 0 && !isNegativeZero(object);
}
export const int = {
  tag: "tag:yaml.org,2002:int",
  construct: constructYamlInteger,
  defaultStyle: "decimal",
  kind: "scalar",
  predicate: isInteger,
  represent: {
    // deno-lint-ignore ban-types
    binary (object) {
      const value = object instanceof Number ? object.valueOf() : object;
      return value >= 0 ? `0b${value.toString(2)}` : `-0b${value.toString(2).slice(1)}`;
    },
    // deno-lint-ignore ban-types
    octal (object) {
      const value = object instanceof Number ? object.valueOf() : object;
      return value >= 0 ? `0${value.toString(8)}` : `-0${value.toString(8).slice(1)}`;
    },
    // deno-lint-ignore ban-types
    decimal (object) {
      const value = object instanceof Number ? object.valueOf() : object;
      return value.toString(10);
    },
    // deno-lint-ignore ban-types
    hexadecimal (object) {
      const value = object instanceof Number ? object.valueOf() : object;
      return value >= 0 ? `0x${value.toString(16).toUpperCase()}` : `-0x${value.toString(16).toUpperCase().slice(1)}`;
    }
  },
  resolve: resolveYamlInteger
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8xLjAuNS9fdHlwZS9pbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9ydGVkIGZyb20ganMteWFtbCB2My4xMy4xOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVjYS9qcy15YW1sL2NvbW1pdC82NjVhYWRkYTQyMzQ5ZGNhZTg2OWYxMjA0MGQ5YjEwZWYxOGQxMmRhXG4vLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHR5cGUgeyBUeXBlIH0gZnJvbSBcIi4uL190eXBlLnRzXCI7XG5pbXBvcnQgeyBpc05lZ2F0aXZlWmVybyB9IGZyb20gXCIuLi9fdXRpbHMudHNcIjtcblxuZnVuY3Rpb24gaXNDaGFyQ29kZUluUmFuZ2UoYzogbnVtYmVyLCBsb3dlcjogbnVtYmVyLCB1cHBlcjogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBsb3dlciA8PSBjICYmIGMgPD0gdXBwZXI7XG59XG5cbmZ1bmN0aW9uIGlzSGV4Q29kZShjOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBpc0NoYXJDb2RlSW5SYW5nZShjLCAweDMwLCAweDM5KSB8fCAvLyAwLTlcbiAgICBpc0NoYXJDb2RlSW5SYW5nZShjLCAweDQxLCAweDQ2KSB8fCAvLyBBLUZcbiAgICBpc0NoYXJDb2RlSW5SYW5nZShjLCAweDYxLCAweDY2KSAvLyBhLWZcbiAgKTtcbn1cblxuZnVuY3Rpb24gaXNPY3RDb2RlKGM6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNDaGFyQ29kZUluUmFuZ2UoYywgMHgzMCwgMHgzNyk7IC8vIDAtN1xufVxuXG5mdW5jdGlvbiBpc0RlY0NvZGUoYzogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0NoYXJDb2RlSW5SYW5nZShjLCAweDMwLCAweDM5KTsgLy8gMC05XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sSW50ZWdlcihkYXRhOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgbWF4ID0gZGF0YS5sZW5ndGg7XG4gIGxldCBpbmRleCA9IDA7XG4gIGxldCBoYXNEaWdpdHMgPSBmYWxzZTtcblxuICBpZiAoIW1heCkgcmV0dXJuIGZhbHNlO1xuXG4gIGxldCBjaCA9IGRhdGFbaW5kZXhdO1xuXG4gIC8vIHNpZ25cbiAgaWYgKGNoID09PSBcIi1cIiB8fCBjaCA9PT0gXCIrXCIpIHtcbiAgICBjaCA9IGRhdGFbKytpbmRleF07XG4gIH1cblxuICBpZiAoY2ggPT09IFwiMFwiKSB7XG4gICAgLy8gMFxuICAgIGlmIChpbmRleCArIDEgPT09IG1heCkgcmV0dXJuIHRydWU7XG4gICAgY2ggPSBkYXRhWysraW5kZXhdO1xuXG4gICAgLy8gYmFzZSAyLCBiYXNlIDgsIGJhc2UgMTZcblxuICAgIGlmIChjaCA9PT0gXCJiXCIpIHtcbiAgICAgIC8vIGJhc2UgMlxuICAgICAgaW5kZXgrKztcblxuICAgICAgZm9yICg7IGluZGV4IDwgbWF4OyBpbmRleCsrKSB7XG4gICAgICAgIGNoID0gZGF0YVtpbmRleF07XG4gICAgICAgIGlmIChjaCA9PT0gXCJfXCIpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoY2ggIT09IFwiMFwiICYmIGNoICE9PSBcIjFcIikgcmV0dXJuIGZhbHNlO1xuICAgICAgICBoYXNEaWdpdHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhhc0RpZ2l0cyAmJiBjaCAhPT0gXCJfXCI7XG4gICAgfVxuXG4gICAgaWYgKGNoID09PSBcInhcIikge1xuICAgICAgLy8gYmFzZSAxNlxuICAgICAgaW5kZXgrKztcblxuICAgICAgZm9yICg7IGluZGV4IDwgbWF4OyBpbmRleCsrKSB7XG4gICAgICAgIGNoID0gZGF0YVtpbmRleF07XG4gICAgICAgIGlmIChjaCA9PT0gXCJfXCIpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIWlzSGV4Q29kZShkYXRhLmNoYXJDb2RlQXQoaW5kZXgpKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBoYXNEaWdpdHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhhc0RpZ2l0cyAmJiBjaCAhPT0gXCJfXCI7XG4gICAgfVxuXG4gICAgLy8gYmFzZSA4XG4gICAgZm9yICg7IGluZGV4IDwgbWF4OyBpbmRleCsrKSB7XG4gICAgICBjaCA9IGRhdGFbaW5kZXhdO1xuICAgICAgaWYgKGNoID09PSBcIl9cIikgY29udGludWU7XG4gICAgICBpZiAoIWlzT2N0Q29kZShkYXRhLmNoYXJDb2RlQXQoaW5kZXgpKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaGFzRGlnaXRzID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGhhc0RpZ2l0cyAmJiBjaCAhPT0gXCJfXCI7XG4gIH1cblxuICAvLyBiYXNlIDEwIChleGNlcHQgMCkgb3IgYmFzZSA2MFxuXG4gIC8vIHZhbHVlIHNob3VsZCBub3Qgc3RhcnQgd2l0aCBgX2A7XG4gIGlmIChjaCA9PT0gXCJfXCIpIHJldHVybiBmYWxzZTtcblxuICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICBjaCA9IGRhdGFbaW5kZXhdO1xuICAgIGlmIChjaCA9PT0gXCJfXCIpIGNvbnRpbnVlO1xuICAgIGlmICghaXNEZWNDb2RlKGRhdGEuY2hhckNvZGVBdChpbmRleCkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGhhc0RpZ2l0cyA9IHRydWU7XG4gIH1cblxuICAvLyBTaG91bGQgaGF2ZSBkaWdpdHMgYW5kIHNob3VsZCBub3QgZW5kIHdpdGggYF9gXG4gIGlmICghaGFzRGlnaXRzIHx8IGNoID09PSBcIl9cIikgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIGJhc2U2MCBhbG1vc3Qgbm90IHVzZWQsIG5vIG5lZWRzIHRvIG9wdGltaXplXG4gIHJldHVybiAvXig6WzAtNV0/WzAtOV0pKyQvLnRlc3QoZGF0YS5zbGljZShpbmRleCkpO1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sSW50ZWdlcihkYXRhOiBzdHJpbmcpOiBudW1iZXIge1xuICBsZXQgdmFsdWUgPSBkYXRhO1xuXG4gIGlmICh2YWx1ZS5pbmNsdWRlcyhcIl9cIikpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL18vZywgXCJcIik7XG4gIH1cblxuICBsZXQgc2lnbiA9IDE7XG4gIGxldCBjaCA9IHZhbHVlWzBdO1xuICBpZiAoY2ggPT09IFwiLVwiIHx8IGNoID09PSBcIitcIikge1xuICAgIGlmIChjaCA9PT0gXCItXCIpIHNpZ24gPSAtMTtcbiAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpO1xuICAgIGNoID0gdmFsdWVbMF07XG4gIH1cblxuICBpZiAodmFsdWUgPT09IFwiMFwiKSByZXR1cm4gMDtcblxuICBpZiAoY2ggPT09IFwiMFwiKSB7XG4gICAgaWYgKHZhbHVlWzFdID09PSBcImJcIikgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgMik7XG4gICAgaWYgKHZhbHVlWzFdID09PSBcInhcIikgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgMTYpO1xuICAgIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUsIDgpO1xuICB9XG5cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgMTApO1xufVxuXG5mdW5jdGlvbiBpc0ludGVnZXIob2JqZWN0OiB1bmtub3duKTogb2JqZWN0IGlzIG51bWJlciB7XG4gIGlmIChvYmplY3QgaW5zdGFuY2VvZiBOdW1iZXIpIG9iamVjdCA9IG9iamVjdC52YWx1ZU9mKCk7XG4gIHJldHVybiB0eXBlb2Ygb2JqZWN0ID09PSBcIm51bWJlclwiICYmIG9iamVjdCAlIDEgPT09IDAgJiZcbiAgICAhaXNOZWdhdGl2ZVplcm8ob2JqZWN0KTtcbn1cblxuZXhwb3J0IGNvbnN0IGludDogVHlwZTxcInNjYWxhclwiLCBudW1iZXI+ID0ge1xuICB0YWc6IFwidGFnOnlhbWwub3JnLDIwMDI6aW50XCIsXG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbEludGVnZXIsXG4gIGRlZmF1bHRTdHlsZTogXCJkZWNpbWFsXCIsXG4gIGtpbmQ6IFwic2NhbGFyXCIsXG4gIHByZWRpY2F0ZTogaXNJbnRlZ2VyLFxuICByZXByZXNlbnQ6IHtcbiAgICAvLyBkZW5vLWxpbnQtaWdub3JlIGJhbi10eXBlc1xuICAgIGJpbmFyeShvYmplY3Q6IG51bWJlciB8IE51bWJlcik6IHN0cmluZyB7XG4gICAgICBjb25zdCB2YWx1ZSA9IG9iamVjdCBpbnN0YW5jZW9mIE51bWJlciA/IG9iamVjdC52YWx1ZU9mKCkgOiBvYmplY3Q7XG4gICAgICByZXR1cm4gdmFsdWUgPj0gMFxuICAgICAgICA/IGAwYiR7dmFsdWUudG9TdHJpbmcoMil9YFxuICAgICAgICA6IGAtMGIke3ZhbHVlLnRvU3RyaW5nKDIpLnNsaWNlKDEpfWA7XG4gICAgfSxcbiAgICAvLyBkZW5vLWxpbnQtaWdub3JlIGJhbi10eXBlc1xuICAgIG9jdGFsKG9iamVjdDogbnVtYmVyIHwgTnVtYmVyKTogc3RyaW5nIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gb2JqZWN0IGluc3RhbmNlb2YgTnVtYmVyID8gb2JqZWN0LnZhbHVlT2YoKSA6IG9iamVjdDtcbiAgICAgIHJldHVybiB2YWx1ZSA+PSAwXG4gICAgICAgID8gYDAke3ZhbHVlLnRvU3RyaW5nKDgpfWBcbiAgICAgICAgOiBgLTAke3ZhbHVlLnRvU3RyaW5nKDgpLnNsaWNlKDEpfWA7XG4gICAgfSxcbiAgICAvLyBkZW5vLWxpbnQtaWdub3JlIGJhbi10eXBlc1xuICAgIGRlY2ltYWwob2JqZWN0OiBudW1iZXIgfCBOdW1iZXIpOiBzdHJpbmcge1xuICAgICAgY29uc3QgdmFsdWUgPSBvYmplY3QgaW5zdGFuY2VvZiBOdW1iZXIgPyBvYmplY3QudmFsdWVPZigpIDogb2JqZWN0O1xuICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKDEwKTtcbiAgICB9LFxuICAgIC8vIGRlbm8tbGludC1pZ25vcmUgYmFuLXR5cGVzXG4gICAgaGV4YWRlY2ltYWwob2JqZWN0OiBudW1iZXIgfCBOdW1iZXIpOiBzdHJpbmcge1xuICAgICAgY29uc3QgdmFsdWUgPSBvYmplY3QgaW5zdGFuY2VvZiBOdW1iZXIgPyBvYmplY3QudmFsdWVPZigpIDogb2JqZWN0O1xuICAgICAgcmV0dXJuIHZhbHVlID49IDBcbiAgICAgICAgPyBgMHgke3ZhbHVlLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpfWBcbiAgICAgICAgOiBgLTB4JHt2YWx1ZS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKS5zbGljZSgxKX1gO1xuICAgIH0sXG4gIH0sXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sSW50ZWdlcixcbn07XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBRzFFLFNBQVMsY0FBYyxRQUFRLGVBQWU7QUFFOUMsU0FBUyxrQkFBa0IsQ0FBUyxFQUFFLEtBQWEsRUFBRSxLQUFhO0VBQ2hFLE9BQU8sU0FBUyxLQUFLLEtBQUs7QUFDNUI7QUFFQSxTQUFTLFVBQVUsQ0FBUztFQUMxQixPQUNFLGtCQUFrQixHQUFHLE1BQU0sU0FBUyxNQUFNO0VBQzFDLGtCQUFrQixHQUFHLE1BQU0sU0FBUyxNQUFNO0VBQzFDLGtCQUFrQixHQUFHLE1BQU0sTUFBTSxNQUFNOztBQUUzQztBQUVBLFNBQVMsVUFBVSxDQUFTO0VBQzFCLE9BQU8sa0JBQWtCLEdBQUcsTUFBTSxPQUFPLE1BQU07QUFDakQ7QUFFQSxTQUFTLFVBQVUsQ0FBUztFQUMxQixPQUFPLGtCQUFrQixHQUFHLE1BQU0sT0FBTyxNQUFNO0FBQ2pEO0FBRUEsU0FBUyxtQkFBbUIsSUFBWTtFQUN0QyxNQUFNLE1BQU0sS0FBSyxNQUFNO0VBQ3ZCLElBQUksUUFB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
// denoCacheMetadata=4877946606763139685,3916788316468417984