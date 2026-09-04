// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
const RE_KEY_VALUE = /^\s*(?:export\s+)?(?<key>[a-zA-Z_]+[a-zA-Z0-9_]*?)\s*=[\ \t]*('\n?(?<notInterpolated>(.|\n)*?)\n?'|"\n?(?<interpolated>(.|\n)*?)\n?"|(?<unquoted>[^\n#]*)) *#*.*$/gm;
const RE_EXPAND_VALUE = /(\${(?<inBrackets>.+?)(\:-(?<inBracketsDefault>.+))?}|(?<!\\)\$(?<notInBrackets>\w+)(\:-(?<notInBracketsDefault>.+))?)/g;
function expandCharacters(str) {
  const charactersMap = {
    "\\n": "\n",
    "\\r": "\r",
    "\\t": "\t"
  };
  return str.replace(/\\([nrt])/g, ($1)=>charactersMap[$1] || "");
}
function expand(str, variablesMap) {
  if (RE_EXPAND_VALUE.test(str)) {
    return expand(str.replace(RE_EXPAND_VALUE, function(...params) {
      const { inBrackets, inBracketsDefault, notInBrackets, notInBracketsDefault } = params[params.length - 1];
      const expandValue = inBrackets || notInBrackets;
      const defaultValue = inBracketsDefault || notInBracketsDefault;
      let value = variablesMap[expandValue];
      if (value === undefined) {
        value = Deno.env.get(expandValue);
      }
      return value === undefined ? expand(defaultValue, variablesMap) : value;
    }), variablesMap);
  } else {
    return str;
  }
}
/**
 * Parse `.env` file output in an object.
 *
 * @example Usage
 * ```ts
 * import { parse } from "@std/dotenv/parse";
 * import { assertEquals } from "@std/assert";
 *
 * const env = parse("GREETING=hello world");
 * assertEquals(env, { GREETING: "hello world" });
 * ```
 *
 * @param text The text to parse.
 * @returns The parsed object.
 */ export function parse(text) {
  const env = {};
  let match;
  const keysForExpandCheck = [];
  while((match = RE_KEY_VALUE.exec(text)) !== null){
    const { key, interpolated, notInterpolated, unquoted } = match?.groups;
    if (unquoted) {
      keysForExpandCheck.push(key);
    }
    env[key] = typeof notInterpolated === "string" ? notInterpolated : typeof interpolated === "string" ? expandCharacters(interpolated) : unquoted.trim();
  }
  //https://github.com/motdotla/dotenv-expand/blob/ed5fea5bf517a09fd743ce2c63150e88c8a5f6d1/lib/main.js#L23
  const variablesMap = {
    ...env
  };
  keysForExpandCheck.forEach((key)=>{
    env[key] = expand(env[key], variablesMap);
  });
  return env;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZG90ZW52LzAuMjI0LjIvcGFyc2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxudHlwZSBMaW5lUGFyc2VSZXN1bHQgPSB7XG4gIGtleTogc3RyaW5nO1xuICB1bnF1b3RlZDogc3RyaW5nO1xuICBpbnRlcnBvbGF0ZWQ6IHN0cmluZztcbiAgbm90SW50ZXJwb2xhdGVkOiBzdHJpbmc7XG59O1xuXG50eXBlIENoYXJhY3RlcnNNYXAgPSB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuXG5jb25zdCBSRV9LRVlfVkFMVUUgPVxuICAvXlxccyooPzpleHBvcnRcXHMrKT8oPzxrZXk+W2EtekEtWl9dK1thLXpBLVowLTlfXSo/KVxccyo9W1xcIFxcdF0qKCdcXG4/KD88bm90SW50ZXJwb2xhdGVkPigufFxcbikqPylcXG4/J3xcIlxcbj8oPzxpbnRlcnBvbGF0ZWQ+KC58XFxuKSo/KVxcbj9cInwoPzx1bnF1b3RlZD5bXlxcbiNdKikpICojKi4qJC9nbTtcblxuY29uc3QgUkVfRVhQQU5EX1ZBTFVFID1cbiAgLyhcXCR7KD88aW5CcmFja2V0cz4uKz8pKFxcOi0oPzxpbkJyYWNrZXRzRGVmYXVsdD4uKykpP318KD88IVxcXFwpXFwkKD88bm90SW5CcmFja2V0cz5cXHcrKShcXDotKD88bm90SW5CcmFja2V0c0RlZmF1bHQ+LispKT8pL2c7XG5cbmZ1bmN0aW9uIGV4cGFuZENoYXJhY3RlcnMoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBjaGFyYWN0ZXJzTWFwOiBDaGFyYWN0ZXJzTWFwID0ge1xuICAgIFwiXFxcXG5cIjogXCJcXG5cIixcbiAgICBcIlxcXFxyXCI6IFwiXFxyXCIsXG4gICAgXCJcXFxcdFwiOiBcIlxcdFwiLFxuICB9O1xuXG4gIHJldHVybiBzdHIucmVwbGFjZShcbiAgICAvXFxcXChbbnJ0XSkvZyxcbiAgICAoJDE6IGtleW9mIENoYXJhY3RlcnNNYXApOiBzdHJpbmcgPT4gY2hhcmFjdGVyc01hcFskMV0gfHwgXCJcIixcbiAgKTtcbn1cblxuZnVuY3Rpb24gZXhwYW5kKHN0cjogc3RyaW5nLCB2YXJpYWJsZXNNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0pOiBzdHJpbmcge1xuICBpZiAoUkVfRVhQQU5EX1ZBTFVFLnRlc3Qoc3RyKSkge1xuICAgIHJldHVybiBleHBhbmQoXG4gICAgICBzdHIucmVwbGFjZShSRV9FWFBBTkRfVkFMVUUsIGZ1bmN0aW9uICguLi5wYXJhbXMpIHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIGluQnJhY2tldHMsXG4gICAgICAgICAgaW5CcmFja2V0c0RlZmF1bHQsXG4gICAgICAgICAgbm90SW5CcmFja2V0cyxcbiAgICAgICAgICBub3RJbkJyYWNrZXRzRGVmYXVsdCxcbiAgICAgICAgfSA9IHBhcmFtc1twYXJhbXMubGVuZ3RoIC0gMV07XG4gICAgICAgIGNvbnN0IGV4cGFuZFZhbHVlID0gaW5CcmFja2V0cyB8fCBub3RJbkJyYWNrZXRzO1xuICAgICAgICBjb25zdCBkZWZhdWx0VmFsdWUgPSBpbkJyYWNrZXRzRGVmYXVsdCB8fCBub3RJbkJyYWNrZXRzRGVmYXVsdDtcblxuICAgICAgICBsZXQgdmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHZhcmlhYmxlc01hcFtleHBhbmRWYWx1ZV07XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdmFsdWUgPSBEZW5vLmVudi5nZXQoZXhwYW5kVmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gZXhwYW5kKGRlZmF1bHRWYWx1ZSwgdmFyaWFibGVzTWFwKSA6IHZhbHVlO1xuICAgICAgfSksXG4gICAgICB2YXJpYWJsZXNNYXAsXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cbi8qKlxuICogUGFyc2UgYC5lbnZgIGZpbGUgb3V0cHV0IGluIGFuIG9iamVjdC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlIH0gZnJvbSBcIkBzdGQvZG90ZW52L3BhcnNlXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCBlbnYgPSBwYXJzZShcIkdSRUVUSU5HPWhlbGxvIHdvcmxkXCIpO1xuICogYXNzZXJ0RXF1YWxzKGVudiwgeyBHUkVFVElORzogXCJoZWxsbyB3b3JsZFwiIH0pO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHRleHQgVGhlIHRleHQgdG8gcGFyc2UuXG4gKiBAcmV0dXJucyBUaGUgcGFyc2VkIG9iamVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHRleHQ6IHN0cmluZyk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICBjb25zdCBlbnY6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcblxuICBsZXQgbWF0Y2g7XG4gIGNvbnN0IGtleXNGb3JFeHBhbmRDaGVjayA9IFtdO1xuXG4gIHdoaWxlICgobWF0Y2ggPSBSRV9LRVlfVkFMVUUuZXhlYyh0ZXh0KSkgIT09IG51bGwpIHtcbiAgICBjb25zdCB7IGtleSwgaW50ZXJwb2xhdGVkLCBub3RJbnRlcnBvbGF0ZWQsIHVucXVvdGVkIH0gPSBtYXRjaFxuICAgICAgPy5ncm91cHMgYXMgTGluZVBhcnNlUmVzdWx0O1xuXG4gICAgaWYgKHVucXVvdGVkKSB7XG4gICAgICBrZXlzRm9yRXhwYW5kQ2hlY2sucHVzaChrZXkpO1xuICAgIH1cblxuICAgIGVudltrZXldID0gdHlwZW9mIG5vdEludGVycG9sYXRlZCA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBub3RJbnRlcnBvbGF0ZWRcbiAgICAgIDogdHlwZW9mIGludGVycG9sYXRlZCA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBleHBhbmRDaGFyYWN0ZXJzKGludGVycG9sYXRlZClcbiAgICAgIDogdW5xdW90ZWQudHJpbSgpO1xuICB9XG5cbiAgLy9odHRwczovL2dpdGh1Yi5jb20vbW90ZG90bGEvZG90ZW52LWV4cGFuZC9ibG9iL2VkNWZlYTViZjUxN2EwOWZkNzQzY2UyYzYzMTUwZTg4YzhhNWY2ZDEvbGliL21haW4uanMjTDIzXG4gIGNvbnN0IHZhcmlhYmxlc01hcCA9IHsgLi4uZW52IH07XG4gIGtleXNGb3JFeHBhbmRDaGVjay5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBlbnZba2V5XSA9IGV4cGFuZChlbnZba2V5XSEsIHZhcmlhYmxlc01hcCk7XG4gIH0pO1xuXG4gIHJldHVybiBlbnY7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBVzFFLE1BQU0sZUFDSjtBQUVGLE1BQU0sa0JBQ0o7QUFFRixTQUFTLGlCQUFpQixHQUFXO0VBQ25DLE1BQU0sZ0JBQStCO0lBQ25DLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTztFQUNUO0VBRUEsT0FBTyxJQUFJLE9BQU8sQ0FDaEIsY0FDQSxDQUFDLEtBQW9DLGFBQWEsQ0FBQyxHQUFHLElBQUk7QUFFOUQ7QUFFQSxTQUFTLE9BQU8sR0FBVyxFQUFFLFlBQXVDO0VBQ2xFLElBQUksZ0JBQWdCLElBQUksQ0FBQyxNQUFNO0lBQzdCLE9BQU8sT0FDTCxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsU0FBVSxHQUFHLE1BQU07TUFDOUMsTUFBTSxFQUNKLFVBQVUsRUFDVixpQkFBaUIsRUFDakIsYUFBYSxFQUNiLG9CQUFvQixFQUNyQixHQUFHLE1BQU0sQ0FBQyxPQUFPLE1BQU0sR0FBRyxFQUFFO01BQzdCLE1BQU0sY0FBYyxjQUFjO01BQ2xDLE1BQU0sZUFBZSxxQkFBcUI7TUFFMUMsSUFBSSxRQUE0QixZQUFZLENBQUMsWUFBWTtNQUN6RCxJQUFJLFVBQVUsV0FBVztRQUN2QixRQUFRLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQztNQUN2QjtNQUNBLE9BQU8sVUFBVSxZQUFZLE9BQU8sY0FBYyxnQkFBZ0I7SUFDcEUsSUFDQTtFQUVKLE9BQU87SUFDTCxPQUFPO0VBQ1Q7QUFDRjtBQUVBOzs7Ozs7Ozs7Ozs7OztDQWNDLEdBQ0QsT0FBTyxTQUFTLE1BQU0sSUFBWTtFQUNoQyxNQUFNLE1BQThCLENBQUM7RUFFckMsSUFBSTtFQUNKLE1BQU0scUJBQXFCLEVBQUU7RUFFN0IsTUFBTyxDQUFDLFFBQVEsYUFBYSxJQUFJLENBQUMsS0FBSyxNQUFNLEtBQU07SUFDakQsTUFBTSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxHQUFHLE9BQ3JEO0lBRUosSUFBSSxVQUFVO01BQ1osbUJBQW1CLElBQUksQ0FBQztJQUMxQjtJQUVBLEdBQUcsQ0FBQyxJQUFJLEdBQUcsT0FBTyxvQkFBb0IsV0FDbEMsa0JBQ0EsT0FBTyxpQkFBaUIsV0FDeEIsaUJBQWlCLGdCQUNqQixTQUFTLElBQUk7RUFDbkI7RUFFQSx5R0FBeUc7RUFDekcsTUFBTSxlQUFlO0lBQUUsR0FBRyxHQUFHO0VBQUM7RUFDOUIsbUJBQW1CLE9BQU8sQ0FBQyxDQUFDO0lBQzFCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsT0FBTyxHQUFHLENBQUMsSUFBSSxFQUFHO0VBQy9CO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=1828855805468216264,14822900360870639316