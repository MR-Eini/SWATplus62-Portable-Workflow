// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assertPath } from "./assert_path.ts";
export function stripSuffix(name, suffix) {
  if (suffix.length >= name.length) {
    return name;
  }
  const lenDiff = name.length - suffix.length;
  for(let i = suffix.length - 1; i >= 0; --i){
    if (name.charCodeAt(lenDiff + i) !== suffix.charCodeAt(i)) {
      return name;
    }
  }
  return name.slice(0, -suffix.length);
}
export function lastPathSegment(path, isSep, start = 0) {
  let matchedNonSeparator = false;
  let end = path.length;
  for(let i = path.length - 1; i >= start; --i){
    if (isSep(path.charCodeAt(i))) {
      if (matchedNonSeparator) {
        start = i + 1;
        break;
      }
    } else if (!matchedNonSeparator) {
      matchedNonSeparator = true;
      end = i + 1;
    }
  }
  return path.slice(start, end);
}
export function assertArgs(path, suffix) {
  assertPath(path);
  if (path.length === 0) return path;
  if (typeof suffix !== "string") {
    throw new TypeError(`Suffix must be a string. Received ${JSON.stringify(suffix)}`);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL19jb21tb24vYmFzZW5hbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgYXNzZXJ0UGF0aCB9IGZyb20gXCIuL2Fzc2VydF9wYXRoLnRzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcFN1ZmZpeChuYW1lOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKHN1ZmZpeC5sZW5ndGggPj0gbmFtZS5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmFtZTtcbiAgfVxuXG4gIGNvbnN0IGxlbkRpZmYgPSBuYW1lLmxlbmd0aCAtIHN1ZmZpeC5sZW5ndGg7XG5cbiAgZm9yIChsZXQgaSA9IHN1ZmZpeC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgIGlmIChuYW1lLmNoYXJDb2RlQXQobGVuRGlmZiArIGkpICE9PSBzdWZmaXguY2hhckNvZGVBdChpKSkge1xuICAgICAgcmV0dXJuIG5hbWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUuc2xpY2UoMCwgLXN1ZmZpeC5sZW5ndGgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGFzdFBhdGhTZWdtZW50KFxuICBwYXRoOiBzdHJpbmcsXG4gIGlzU2VwOiAoY2hhcjogbnVtYmVyKSA9PiBib29sZWFuLFxuICBzdGFydCA9IDAsXG4pOiBzdHJpbmcge1xuICBsZXQgbWF0Y2hlZE5vblNlcGFyYXRvciA9IGZhbHNlO1xuICBsZXQgZW5kID0gcGF0aC5sZW5ndGg7XG5cbiAgZm9yIChsZXQgaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSBzdGFydDsgLS1pKSB7XG4gICAgaWYgKGlzU2VwKHBhdGguY2hhckNvZGVBdChpKSkpIHtcbiAgICAgIGlmIChtYXRjaGVkTm9uU2VwYXJhdG9yKSB7XG4gICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIW1hdGNoZWROb25TZXBhcmF0b3IpIHtcbiAgICAgIG1hdGNoZWROb25TZXBhcmF0b3IgPSB0cnVlO1xuICAgICAgZW5kID0gaSArIDE7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsIGVuZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRBcmdzKHBhdGg6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpIHtcbiAgYXNzZXJ0UGF0aChwYXRoKTtcbiAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gcGF0aDtcbiAgaWYgKHR5cGVvZiBzdWZmaXggIT09IFwic3RyaW5nXCIpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgYFN1ZmZpeCBtdXN0IGJlIGEgc3RyaW5nLiBSZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KHN1ZmZpeCl9YCxcbiAgICApO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFVBQVUsUUFBUSxtQkFBbUI7QUFFOUMsT0FBTyxTQUFTLFlBQVksSUFBWSxFQUFFLE1BQWM7RUFDdEQsSUFBSSxPQUFPLE1BQU0sSUFBSSxLQUFLLE1BQU0sRUFBRTtJQUNoQyxPQUFPO0VBQ1Q7RUFFQSxNQUFNLFVBQVUsS0FBSyxNQUFNLEdBQUcsT0FBTyxNQUFNO0VBRTNDLElBQUssSUFBSSxJQUFJLE9BQU8sTUFBTSxHQUFHLEdBQUcsS0FBSyxHQUFHLEVBQUUsRUFBRztJQUMzQyxJQUFJLEtBQUssVUFBVSxDQUFDLFVBQVUsT0FBTyxPQUFPLFVBQVUsQ0FBQyxJQUFJO01BQ3pELE9BQU87SUFDVDtFQUNGO0VBRUEsT0FBTyxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxNQUFNO0FBQ3JDO0FBRUEsT0FBTyxTQUFTLGdCQUNkLElBQVksRUFDWixLQUFnQyxFQUNoQyxRQUFRLENBQUM7RUFFVCxJQUFJLHNCQUFzQjtFQUMxQixJQUFJLE1BQU0sS0FBSyxNQUFNO0VBRXJCLElBQUssSUFBSSxJQUFJLEtBQUssTUFBTSxHQUFHLEdBQUcsS0FBSyxPQUFPLEVBQUUsRUFBRztJQUM3QyxJQUFJLE1BQU0sS0FBSyxVQUFVLENBQUMsS0FBSztNQUM3QixJQUFJLHFCQUFxQjtRQUN2QixRQUFRLElBQUk7UUFDWjtNQUNGO0lBQ0YsT0FBTyxJQUFJLENBQUMscUJBQXFCO01BQy9CLHNCQUFzQjtNQUN0QixNQUFNLElBQUk7SUFDWjtFQUNGO0VBRUEsT0FBTyxLQUFLLEtBQUssQ0FBQyxPQUFPO0FBQzNCO0FBRUEsT0FBTyxTQUFTLFdBQVcsSUFBWSxFQUFFLE1BQWM7RUFDckQsV0FBVztFQUNYLElBQUksS0FBSyxNQUFNLEtBQUssR0FBRyxPQUFPO0VBQzlCLElBQUksT0FBTyxXQUFXLFVBQVU7SUFDOUIsTUFBTSxJQUFJLFVBQ1IsQ0FBQyxrQ0FBa0MsRUFBRSxLQUFLLFNBQVMsQ0FBQyxTQUFTO0VBRWpFO0FBQ0YifQ==
// denoCacheMetadata=4559038904193728546,12621697750965394366