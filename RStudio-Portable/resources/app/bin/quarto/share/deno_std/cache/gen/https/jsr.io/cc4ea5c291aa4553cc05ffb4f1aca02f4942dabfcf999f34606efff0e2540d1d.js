// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
const { hasOwn } = Object;
const _toString = Object.prototype.toString;
function resolveYamlOmap(data) {
  const objectKeys = [];
  let pairKey = "";
  let pairHasKey = false;
  for (const pair of data){
    pairHasKey = false;
    if (_toString.call(pair) !== "[object Object]") return false;
    for(pairKey in pair){
      if (hasOwn(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }
    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }
  return true;
}
export const omap = new Type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL190eXBlL29tYXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9ydGVkIGZyb20ganMteWFtbCB2My4xMy4xOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVjYS9qcy15YW1sL2NvbW1pdC82NjVhYWRkYTQyMzQ5ZGNhZTg2OWYxMjA0MGQ5YjEwZWYxOGQxMmRhXG4vLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHsgVHlwZSB9IGZyb20gXCIuLi90eXBlLnRzXCI7XG5pbXBvcnQgdHlwZSB7IEFueSB9IGZyb20gXCIuLi9fdXRpbHMudHNcIjtcblxuY29uc3QgeyBoYXNPd24gfSA9IE9iamVjdDtcbmNvbnN0IF90b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sT21hcChkYXRhOiBBbnkpOiBib29sZWFuIHtcbiAgY29uc3Qgb2JqZWN0S2V5czogc3RyaW5nW10gPSBbXTtcbiAgbGV0IHBhaXJLZXkgPSBcIlwiO1xuICBsZXQgcGFpckhhc0tleSA9IGZhbHNlO1xuXG4gIGZvciAoY29uc3QgcGFpciBvZiBkYXRhKSB7XG4gICAgcGFpckhhc0tleSA9IGZhbHNlO1xuXG4gICAgaWYgKF90b1N0cmluZy5jYWxsKHBhaXIpICE9PSBcIltvYmplY3QgT2JqZWN0XVwiKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHBhaXJLZXkgaW4gcGFpcikge1xuICAgICAgaWYgKGhhc093bihwYWlyLCBwYWlyS2V5KSkge1xuICAgICAgICBpZiAoIXBhaXJIYXNLZXkpIHBhaXJIYXNLZXkgPSB0cnVlO1xuICAgICAgICBlbHNlIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXBhaXJIYXNLZXkpIHJldHVybiBmYWxzZTtcblxuICAgIGlmIChvYmplY3RLZXlzLmluZGV4T2YocGFpcktleSkgPT09IC0xKSBvYmplY3RLZXlzLnB1c2gocGFpcktleSk7XG4gICAgZWxzZSByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGNvbnN0IG9tYXAgPSBuZXcgVHlwZShcInRhZzp5YW1sLm9yZywyMDAyOm9tYXBcIiwge1xuICBraW5kOiBcInNlcXVlbmNlXCIsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sT21hcCxcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUUxRSxTQUFTLElBQUksUUFBUSxhQUFhO0FBR2xDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRztBQUNuQixNQUFNLFlBQVksT0FBTyxTQUFTLENBQUMsUUFBUTtBQUUzQyxTQUFTLGdCQUFnQixJQUFTO0VBQ2hDLE1BQU0sYUFBdUIsRUFBRTtFQUMvQixJQUFJLFVBQVU7RUFDZCxJQUFJLGFBQWE7RUFFakIsS0FBSyxNQUFNLFFBQVEsS0FBTTtJQUN2QixhQUFhO0lBRWIsSUFBSSxVQUFVLElBQUksQ0FBQyxVQUFVLG1CQUFtQixPQUFPO0lBRXZELElBQUssV0FBVyxLQUFNO01BQ3BCLElBQUksT0FBTyxNQUFNLFVBQVU7UUFDekIsSUFBSSxDQUFDLFlBQVksYUFBYTthQUN6QixPQUFPO01BQ2Q7SUFDRjtJQUVBLElBQUksQ0FBQyxZQUFZLE9BQU87SUFFeEIsSUFBSSxXQUFXLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxXQUFXLElBQUksQ0FBQztTQUNuRCxPQUFPO0VBQ2Q7RUFFQSxPQUFPO0FBQ1Q7QUFFQSxPQUFPLE1BQU0sT0FBTyxJQUFJLEtBQUssMEJBQTBCO0VBQ3JELE1BQU07RUFDTixTQUFTO0FBQ1gsR0FBRyJ9
// denoCacheMetadata=13304332862304008092,13164163969085775508