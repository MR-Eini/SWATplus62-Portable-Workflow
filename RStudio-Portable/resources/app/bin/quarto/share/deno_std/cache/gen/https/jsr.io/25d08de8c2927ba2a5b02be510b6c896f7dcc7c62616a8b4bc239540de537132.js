// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Test whether the given string is a glob */ export function isGlob(str) {
  const chars = {
    "{": "}",
    "(": ")",
    "[": "]"
  };
  const regex = /\\(.)|(^!|\*|\?|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
  if (str === "") {
    return false;
  }
  let match;
  while(match = regex.exec(str)){
    if (match[2]) return true;
    let idx = match.index + match[0].length;
    // if an open bracket/brace/paren is escaped,
    // set the index to the next closing character
    const open = match[1];
    const close = open ? chars[open] : null;
    if (open && close) {
      const n = str.indexOf(close, idx);
      if (n !== -1) {
        idx = n + 1;
      }
    }
    str = str.slice(idx);
  }
  return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL2lzX2dsb2IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqIFRlc3Qgd2hldGhlciB0aGUgZ2l2ZW4gc3RyaW5nIGlzIGEgZ2xvYiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzR2xvYihzdHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBjaGFyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHsgXCJ7XCI6IFwifVwiLCBcIihcIjogXCIpXCIsIFwiW1wiOiBcIl1cIiB9O1xuICBjb25zdCByZWdleCA9XG4gICAgL1xcXFwoLil8KF4hfFxcKnxcXD98W1xcXS4rKV1cXD98XFxbW15cXFxcXFxdXStcXF18XFx7W15cXFxcfV0rXFx9fFxcKFxcP1s6IT1dW15cXFxcKV0rXFwpfFxcKFtefF0rXFx8W15cXFxcKV0rXFwpKS87XG5cbiAgaWYgKHN0ciA9PT0gXCJcIikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGxldCBtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcblxuICB3aGlsZSAoKG1hdGNoID0gcmVnZXguZXhlYyhzdHIpKSkge1xuICAgIGlmIChtYXRjaFsyXSkgcmV0dXJuIHRydWU7XG4gICAgbGV0IGlkeCA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuXG4gICAgLy8gaWYgYW4gb3BlbiBicmFja2V0L2JyYWNlL3BhcmVuIGlzIGVzY2FwZWQsXG4gICAgLy8gc2V0IHRoZSBpbmRleCB0byB0aGUgbmV4dCBjbG9zaW5nIGNoYXJhY3RlclxuICAgIGNvbnN0IG9wZW4gPSBtYXRjaFsxXTtcbiAgICBjb25zdCBjbG9zZSA9IG9wZW4gPyBjaGFyc1tvcGVuXSA6IG51bGw7XG4gICAgaWYgKG9wZW4gJiYgY2xvc2UpIHtcbiAgICAgIGNvbnN0IG4gPSBzdHIuaW5kZXhPZihjbG9zZSwgaWR4KTtcbiAgICAgIGlmIChuICE9PSAtMSkge1xuICAgICAgICBpZHggPSBuICsgMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdHIgPSBzdHIuc2xpY2UoaWR4KTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLDRDQUE0QyxHQUM1QyxPQUFPLFNBQVMsT0FBTyxHQUFXO0VBQ2hDLE1BQU0sUUFBZ0M7SUFBRSxLQUFLO0lBQUssS0FBSztJQUFLLEtBQUs7RUFBSTtFQUNyRSxNQUFNLFFBQ0o7RUFFRixJQUFJLFFBQVEsSUFBSTtJQUNkLE9BQU87RUFDVDtFQUVBLElBQUk7RUFFSixNQUFRLFFBQVEsTUFBTSxJQUFJLENBQUMsS0FBTztJQUNoQyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUUsT0FBTztJQUNyQixJQUFJLE1BQU0sTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNO0lBRXZDLDZDQUE2QztJQUM3Qyw4Q0FBOEM7SUFDOUMsTUFBTSxPQUFPLEtBQUssQ0FBQyxFQUFFO0lBQ3JCLE1BQU0sUUFBUSxPQUFPLEtBQUssQ0FBQyxLQUFLLEdBQUc7SUFDbkMsSUFBSSxRQUFRLE9BQU87TUFDakIsTUFBTSxJQUFJLElBQUksT0FBTyxDQUFDLE9BQU87TUFDN0IsSUFBSSxNQUFNLENBQUMsR0FBRztRQUNaLE1BQU0sSUFBSTtNQUNaO0lBQ0Y7SUFFQSxNQUFNLElBQUksS0FBSyxDQUFDO0VBQ2xCO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=8291940015278131542,9230251043773753294