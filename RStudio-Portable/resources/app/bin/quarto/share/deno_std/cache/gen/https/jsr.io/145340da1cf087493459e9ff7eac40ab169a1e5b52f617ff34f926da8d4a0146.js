// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
const _toString = Object.prototype.toString;
function resolveYamlPairs(data) {
  const result = Array.from({
    length: data.length
  });
  for (const [index, pair] of data.entries()){
    if (_toString.call(pair) !== "[object Object]") return false;
    const keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [
      keys[0],
      pair[keys[0]]
    ];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null) return [];
  const result = Array.from({
    length: data.length
  });
  for(let index = 0; index < data.length; index += 1){
    const pair = data[index];
    const keys = Object.keys(pair);
    result[index] = [
      keys[0],
      pair[keys[0]]
    ];
  }
  return result;
}
export const pairs = new Type("tag:yaml.org,2002:pairs", {
  construct: constructYamlPairs,
  kind: "sequence",
  resolve: resolveYamlPairs
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL190eXBlL3BhaXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IFR5cGUgfSBmcm9tIFwiLi4vdHlwZS50c1wiO1xuaW1wb3J0IHR5cGUgeyBBbnkgfSBmcm9tIFwiLi4vX3V0aWxzLnRzXCI7XG5cbmNvbnN0IF90b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sUGFpcnMoZGF0YTogQW55W11bXSk6IGJvb2xlYW4ge1xuICBjb25zdCByZXN1bHQgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiBkYXRhLmxlbmd0aCB9KTtcblxuICBmb3IgKGNvbnN0IFtpbmRleCwgcGFpcl0gb2YgZGF0YS5lbnRyaWVzKCkpIHtcbiAgICBpZiAoX3RvU3RyaW5nLmNhbGwocGFpcikgIT09IFwiW29iamVjdCBPYmplY3RdXCIpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhwYWlyKTtcblxuICAgIGlmIChrZXlzLmxlbmd0aCAhPT0gMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmVzdWx0W2luZGV4XSA9IFtrZXlzWzBdLCBwYWlyW2tleXNbMF0gYXMgQW55XV07XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0WWFtbFBhaXJzKGRhdGE6IHN0cmluZyk6IEFueVtdIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBbXTtcblxuICBjb25zdCByZXN1bHQgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiBkYXRhLmxlbmd0aCB9KTtcblxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZGF0YS5sZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBwYWlyID0gZGF0YVtpbmRleF0hO1xuXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHBhaXIpO1xuXG4gICAgcmVzdWx0W2luZGV4XSA9IFtrZXlzWzBdLCBwYWlyW2tleXNbMF0gYXMgQW55XV07XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgY29uc3QgcGFpcnMgPSBuZXcgVHlwZShcInRhZzp5YW1sLm9yZywyMDAyOnBhaXJzXCIsIHtcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sUGFpcnMsXG4gIGtpbmQ6IFwic2VxdWVuY2VcIixcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxQYWlycyxcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUUxRSxTQUFTLElBQUksUUFBUSxhQUFhO0FBR2xDLE1BQU0sWUFBWSxPQUFPLFNBQVMsQ0FBQyxRQUFRO0FBRTNDLFNBQVMsaUJBQWlCLElBQWE7RUFDckMsTUFBTSxTQUFTLE1BQU0sSUFBSSxDQUFDO0lBQUUsUUFBUSxLQUFLLE1BQU07RUFBQztFQUVoRCxLQUFLLE1BQU0sQ0FBQyxPQUFPLEtBQUssSUFBSSxLQUFLLE9BQU8sR0FBSTtJQUMxQyxJQUFJLFVBQVUsSUFBSSxDQUFDLFVBQVUsbUJBQW1CLE9BQU87SUFFdkQsTUFBTSxPQUFPLE9BQU8sSUFBSSxDQUFDO0lBRXpCLElBQUksS0FBSyxNQUFNLEtBQUssR0FBRyxPQUFPO0lBRTlCLE1BQU0sQ0FBQyxNQUFNLEdBQUc7TUFBQyxJQUFJLENBQUMsRUFBRTtNQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFRO0tBQUM7RUFDakQ7RUFFQSxPQUFPO0FBQ1Q7QUFFQSxTQUFTLG1CQUFtQixJQUFZO0VBQ3RDLElBQUksU0FBUyxNQUFNLE9BQU8sRUFBRTtFQUU1QixNQUFNLFNBQVMsTUFBTSxJQUFJLENBQUM7SUFBRSxRQUFRLEtBQUssTUFBTTtFQUFDO0VBRWhELElBQUssSUFBSSxRQUFRLEdBQUcsUUFBUSxLQUFLLE1BQU0sRUFBRSxTQUFTLEVBQUc7SUFDbkQsTUFBTSxPQUFPLElBQUksQ0FBQyxNQUFNO0lBRXhCLE1BQU0sT0FBTyxPQUFPLElBQUksQ0FBQztJQUV6QixNQUFNLENBQUMsTUFBTSxHQUFHO01BQUMsSUFBSSxDQUFDLEVBQUU7TUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBUTtLQUFDO0VBQ2pEO0VBRUEsT0FBTztBQUNUO0FBRUEsT0FBTyxNQUFNLFFBQVEsSUFBSSxLQUFLLDJCQUEyQjtFQUN2RCxXQUFXO0VBQ1gsTUFBTTtFQUNOLFNBQVM7QUFDWCxHQUFHIn0=
// denoCacheMetadata=16747756329368145224,6287713689856155433