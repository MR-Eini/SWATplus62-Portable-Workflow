// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Stringify an object into a valid `.env` file format.
 *
 * @example Usage
 * ```ts
 * import { stringify } from "@std/dotenv/stringify";
 * import { assertEquals } from "@std/assert";
 *
 * const object = { GREETING: "hello world" };
 * assertEquals(stringify(object), "GREETING='hello world'");
 * ```
 *
 * @param object object to be stringified
 * @returns string of object
 */ export function stringify(object) {
  const lines = [];
  for (const [key, value] of Object.entries(object)){
    let quote;
    let escapedValue = value ?? "";
    if (key.startsWith("#")) {
      console.warn(`key starts with a '#' indicates a comment and is ignored: '${key}'`);
      continue;
    } else if (escapedValue.includes("\n")) {
      // escape inner new lines
      escapedValue = escapedValue.replaceAll("\n", "\\n");
      quote = `"`;
    } else if (escapedValue.match(/\W/)) {
      quote = "'";
    }
    if (quote) {
      // escape inner quotes
      escapedValue = escapedValue.replaceAll(quote, `\\${quote}`);
      escapedValue = `${quote}${escapedValue}${quote}`;
    }
    const line = `${key}=${escapedValue}`;
    lines.push(line);
  }
  return lines.join("\n");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZG90ZW52LzAuMjI0LjIvc3RyaW5naWZ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogU3RyaW5naWZ5IGFuIG9iamVjdCBpbnRvIGEgdmFsaWQgYC5lbnZgIGZpbGUgZm9ybWF0LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgc3RyaW5naWZ5IH0gZnJvbSBcIkBzdGQvZG90ZW52L3N0cmluZ2lmeVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3Qgb2JqZWN0ID0geyBHUkVFVElORzogXCJoZWxsbyB3b3JsZFwiIH07XG4gKiBhc3NlcnRFcXVhbHMoc3RyaW5naWZ5KG9iamVjdCksIFwiR1JFRVRJTkc9J2hlbGxvIHdvcmxkJ1wiKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBvYmplY3Qgb2JqZWN0IHRvIGJlIHN0cmluZ2lmaWVkXG4gKiBAcmV0dXJucyBzdHJpbmcgb2Ygb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnkob2JqZWN0OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogc3RyaW5nIHtcbiAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9iamVjdCkpIHtcbiAgICBsZXQgcXVvdGU7XG5cbiAgICBsZXQgZXNjYXBlZFZhbHVlID0gdmFsdWUgPz8gXCJcIjtcbiAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoXCIjXCIpKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGBrZXkgc3RhcnRzIHdpdGggYSAnIycgaW5kaWNhdGVzIGEgY29tbWVudCBhbmQgaXMgaWdub3JlZDogJyR7a2V5fSdgLFxuICAgICAgKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH0gZWxzZSBpZiAoZXNjYXBlZFZhbHVlLmluY2x1ZGVzKFwiXFxuXCIpKSB7XG4gICAgICAvLyBlc2NhcGUgaW5uZXIgbmV3IGxpbmVzXG4gICAgICBlc2NhcGVkVmFsdWUgPSBlc2NhcGVkVmFsdWUucmVwbGFjZUFsbChcIlxcblwiLCBcIlxcXFxuXCIpO1xuICAgICAgcXVvdGUgPSBgXCJgO1xuICAgIH0gZWxzZSBpZiAoZXNjYXBlZFZhbHVlLm1hdGNoKC9cXFcvKSkge1xuICAgICAgcXVvdGUgPSBcIidcIjtcbiAgICB9XG5cbiAgICBpZiAocXVvdGUpIHtcbiAgICAgIC8vIGVzY2FwZSBpbm5lciBxdW90ZXNcbiAgICAgIGVzY2FwZWRWYWx1ZSA9IGVzY2FwZWRWYWx1ZS5yZXBsYWNlQWxsKHF1b3RlLCBgXFxcXCR7cXVvdGV9YCk7XG4gICAgICBlc2NhcGVkVmFsdWUgPSBgJHtxdW90ZX0ke2VzY2FwZWRWYWx1ZX0ke3F1b3RlfWA7XG4gICAgfVxuICAgIGNvbnN0IGxpbmUgPSBgJHtrZXl9PSR7ZXNjYXBlZFZhbHVlfWA7XG4gICAgbGluZXMucHVzaChsaW5lKTtcbiAgfVxuICByZXR1cm4gbGluZXMuam9pbihcIlxcblwiKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7OztDQWNDLEdBQ0QsT0FBTyxTQUFTLFVBQVUsTUFBOEI7RUFDdEQsTUFBTSxRQUFrQixFQUFFO0VBQzFCLEtBQUssTUFBTSxDQUFDLEtBQUssTUFBTSxJQUFJLE9BQU8sT0FBTyxDQUFDLFFBQVM7SUFDakQsSUFBSTtJQUVKLElBQUksZUFBZSxTQUFTO0lBQzVCLElBQUksSUFBSSxVQUFVLENBQUMsTUFBTTtNQUN2QixRQUFRLElBQUksQ0FDVixDQUFDLDJEQUEyRCxFQUFFLElBQUksQ0FBQyxDQUFDO01BRXRFO0lBQ0YsT0FBTyxJQUFJLGFBQWEsUUFBUSxDQUFDLE9BQU87TUFDdEMseUJBQXlCO01BQ3pCLGVBQWUsYUFBYSxVQUFVLENBQUMsTUFBTTtNQUM3QyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ2IsT0FBTyxJQUFJLGFBQWEsS0FBSyxDQUFDLE9BQU87TUFDbkMsUUFBUTtJQUNWO0lBRUEsSUFBSSxPQUFPO01BQ1Qsc0JBQXNCO01BQ3RCLGVBQWUsYUFBYSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxPQUFPO01BQzFELGVBQWUsR0FBRyxRQUFRLGVBQWUsT0FBTztJQUNsRDtJQUNBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLGNBQWM7SUFDckMsTUFBTSxJQUFJLENBQUM7RUFDYjtFQUNBLE9BQU8sTUFBTSxJQUFJLENBQUM7QUFDcEIifQ==
// denoCacheMetadata=8019714776462527436,4471580296116891595