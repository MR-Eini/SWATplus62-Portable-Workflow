// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Array index or record key corresponding to a value for a data object. */ const QUOTE = '"';
const LF = "\n";
const CRLF = "\r\n";
const BYTE_ORDER_MARK = "\ufeff";
function getEscapedString(value, sep) {
  if (value === undefined || value === null) return "";
  let str = "";
  if (typeof value === "object") str = JSON.stringify(value);
  else str = String(value);
  // Is regex.test more performant here? If so, how to dynamically create?
  // https://stackoverflow.com/questions/3561493/
  if (str.includes(sep) || str.includes(LF) || str.includes(QUOTE)) {
    return `${QUOTE}${str.replaceAll(QUOTE, `${QUOTE}${QUOTE}`)}${QUOTE}`;
  }
  return str;
}
function normalizeColumn(column) {
  let header;
  let prop;
  if (typeof column === "object") {
    if (Array.isArray(column)) {
      header = String(column[column.length - 1]);
      prop = column;
    } else {
      prop = Array.isArray(column.prop) ? column.prop : [
        column.prop
      ];
      header = typeof column.header === "string" ? column.header : String(prop[prop.length - 1]);
    }
  } else {
    header = String(column);
    prop = [
      column
    ];
  }
  return {
    header,
    prop
  };
}
/**
 * Error thrown in {@linkcode stringify}.
 *
 * @example Usage
 * ```ts no-assert
 * import { stringify, StringifyError } from "@std/csv/stringify";
 *
 * try {
 *   stringify([{ a: 1 }, { a: 2 }], { separator: "\r\n" });
 * } catch (error) {
 *   if (error instanceof StringifyError) {
 *     console.error(error.message);
 *   }
 * }
 * ```
 */ export class StringifyError extends Error {
  /**
   * Construct a new instance.
   *
   * @example Usage
   * ```ts no-eval
   * import { StringifyError } from "@std/csv/stringify";
   *
   * throw new StringifyError("An error occurred");
   * ```
   *
   * @param message The error message.
   */ constructor(message){
    super(message);
    this.name = "StringifyError";
  }
}
/**
 * Returns an array of values from an object using the property accessors
 * (and optional transform function) in each column
 */ function getValuesFromItem(item, normalizedColumns) {
  const values = [];
  if (normalizedColumns.length) {
    for (const column of normalizedColumns){
      let value = item;
      for (const prop of column.prop){
        if (typeof value !== "object" || value === null) continue;
        if (Array.isArray(value)) {
          if (typeof prop === "number") value = value[prop];
          else {
            throw new StringifyError('Property accessor is not of type "number"');
          }
        } else value = value[prop];
      }
      values.push(value);
    }
  } else {
    if (Array.isArray(item)) {
      values.push(...item);
    } else if (typeof item === "object") {
      throw new StringifyError("No property accessor function was provided for object");
    } else {
      values.push(item);
    }
  }
  return values;
}
/**
 * Converts an array of objects into a CSV string.
 *
 * @example Usage
 * ```ts
 * import {
 *   Column,
 *   stringify,
 * } from "@std/csv/stringify";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * type Character = {
 *   age: number;
 *   name: {
 *     first: string;
 *     last: string;
 *   };
 * };
 *
 * const data: Character[] = [
 *   {
 *     age: 70,
 *     name: {
 *       first: "Rick",
 *       last: "Sanchez",
 *     },
 *   },
 *   {
 *     age: 14,
 *     name: {
 *       first: "Morty",
 *       last: "Smith",
 *     },
 *   },
 * ];
 *
 * let columns: Column[] = [
 *   ["name", "first"],
 *   "age",
 * ];
 *
 * assertEquals(stringify(data, { columns }), `first,age\r\nRick,70\r\nMorty,14\r\n`);
 * ```
 *
 * @param data The source data to stringify. It's an array of items which are
 * plain objects or arrays.
 * @returns A CSV string.
 */ export function stringify(data, { headers = true, separator: sep = ",", columns = [], bom = false } = {}) {
  if (sep.includes(QUOTE) || sep.includes(CRLF)) {
    const message = [
      "Separator cannot include the following strings:",
      '  - U+0022: Quotation mark (")',
      "  - U+000D U+000A: Carriage Return + Line Feed (\\r\\n)"
    ].join("\n");
    throw new StringifyError(message);
  }
  const normalizedColumns = columns.map(normalizeColumn);
  let output = "";
  if (bom) {
    output += BYTE_ORDER_MARK;
  }
  if (headers && normalizedColumns.length > 0) {
    output += normalizedColumns.map((column)=>getEscapedString(column.header, sep)).join(sep);
    output += CRLF;
  }
  for (const item of data){
    const values = getValuesFromItem(item, normalizedColumns);
    output += values.map((value)=>getEscapedString(value, sep)).join(sep);
    output += CRLF;
  }
  return output;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY3N2LzAuMjI0LjMvc3RyaW5naWZ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKiBBcnJheSBpbmRleCBvciByZWNvcmQga2V5IGNvcnJlc3BvbmRpbmcgdG8gYSB2YWx1ZSBmb3IgYSBkYXRhIG9iamVjdC4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5QWNjZXNzb3IgPSBudW1iZXIgfCBzdHJpbmc7XG5cbi8qKlxuICogQ29sdW1uIGluZm9ybWF0aW9uLlxuICpcbiAqIEBwYXJhbSBoZWFkZXIgRXhwbGljaXQgY29sdW1uIGhlYWRlciBuYW1lLiBJZiBvbWl0dGVkLFxuICogdGhlIChmaW5hbCkgcHJvcGVydHkgYWNjZXNzb3IgaXMgdXNlZCBmb3IgdGhpcyB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gcHJvcCBQcm9wZXJ0eSBhY2Nlc3NvcihzKSB1c2VkIHRvIGFjY2VzcyB0aGUgdmFsdWUgb24gdGhlIG9iamVjdFxuICovXG5leHBvcnQgdHlwZSBDb2x1bW5EZXRhaWxzID0ge1xuICBoZWFkZXI/OiBzdHJpbmc7XG4gIHByb3A6IFByb3BlcnR5QWNjZXNzb3IgfCBQcm9wZXJ0eUFjY2Vzc29yW107XG59O1xuXG4vKipcbiAqIFRoZSBtb3N0IGVzc2VudGlhbCBhc3BlY3Qgb2YgYSBjb2x1bW4gaXMgYWNjZXNzaW5nIHRoZSBwcm9wZXJ0eSBob2xkaW5nIHRoZVxuICogZGF0YSBmb3IgdGhhdCBjb2x1bW4gb24gZWFjaCBvYmplY3QgaW4gdGhlIGRhdGEgYXJyYXkuIElmIHRoYXQgbWVtYmVyIGlzIGF0XG4gKiB0aGUgdG9wIGxldmVsLCBgQ29sdW1uYCBjYW4gc2ltcGx5IGJlIGEgcHJvcGVydHkgYWNjZXNzb3IsIHdoaWNoIGlzIGVpdGhlciBhXG4gKiBgc3RyaW5nYCAoaWYgaXQncyBhIHBsYWluIG9iamVjdCkgb3IgYSBgbnVtYmVyYCAoaWYgaXQncyBhbiBhcnJheSkuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IGNvbHVtbnMgPSBbXG4gKiAgIFwibmFtZVwiLFxuICogXTtcbiAqIGBgYFxuICpcbiAqIEVhY2ggcHJvcGVydHkgYWNjZXNzb3Igd2lsbCBiZSB1c2VkIGFzIHRoZSBoZWFkZXIgZm9yIHRoZSBjb2x1bW46XG4gKlxuICogfCBuYW1lIHxcbiAqIHwgOi0tOiB8XG4gKiB8IERlbm8gfFxuICpcbiAqIC0gSWYgdGhlIHJlcXVpcmVkIGRhdGEgaXMgbm90IGF0IHRoZSB0b3AgbGV2ZWwgKGl0J3MgbmVzdGVkIGluIG90aGVyXG4gKiAgIG9iamVjdHMvYXJyYXlzKSwgdGhlbiBhIHNpbXBsZSBwcm9wZXJ0eSBhY2Nlc3NvciB3b24ndCB3b3JrLCBzbyBhbiBhcnJheSBvZlxuICogICB0aGVtIHdpbGwgYmUgcmVxdWlyZWQuXG4gKlxuICogICBgYGB0c1xuICogICBjb25zdCBjb2x1bW5zID0gW1xuICogICAgIFtcInJlcG9cIiwgXCJuYW1lXCJdLFxuICogICAgIFtcInJlcG9cIiwgXCJvcmdcIl0sXG4gKiAgIF07XG4gKiAgIGBgYFxuICpcbiAqICAgV2hlbiB1c2luZyBhcnJheXMgb2YgcHJvcGVydHkgYWNjZXNzb3JzLCB0aGUgaGVhZGVyIG5hbWVzIGluaGVyaXQgdGhlIHZhbHVlXG4gKiAgIG9mIHRoZSBsYXN0IGFjY2Vzc29yIGluIGVhY2ggYXJyYXk6XG4gKlxuICogICB8IG5hbWUgfCAgIG9yZyAgICB8XG4gKiAgIHwgOi0tOiB8IDotLS0tLS06IHxcbiAqICAgfCBkZW5vIHwgZGVub2xhbmQgfFxuICpcbiAqICAtIElmIGEgZGlmZmVyZW50IGNvbHVtbiBoZWFkZXIgaXMgZGVzaXJlZCwgdGhlbiBhIGBDb2x1bW5EZXRhaWxzYCBvYmplY3QgdHlwZVxuICogICAgIGNhbiBiZSB1c2VkIGZvciBlYWNoIGNvbHVtbjpcbiAqXG4gKiAgIC0gKipgaGVhZGVyPzogc3RyaW5nYCoqIGlzIHRoZSBvcHRpb25hbCB2YWx1ZSB0byB1c2UgZm9yIHRoZSBjb2x1bW4gaGVhZGVyXG4gKiAgICAgbmFtZVxuICpcbiAqICAgLSAqKmBwcm9wOiBQcm9wZXJ0eUFjY2Vzc29yIHwgUHJvcGVydHlBY2Nlc3NvcltdYCoqIGlzIHRoZSBwcm9wZXJ0eSBhY2Nlc3NvclxuICogICAgIChgc3RyaW5nYCBvciBgbnVtYmVyYCkgb3IgYXJyYXkgb2YgcHJvcGVydHkgYWNjZXNzb3JzIHVzZWQgdG8gYWNjZXNzIHRoZVxuICogICAgIGRhdGEgb24gZWFjaCBvYmplY3RcbiAqXG4gKiAgIGBgYHRzXG4gKiAgIGNvbnN0IGNvbHVtbnMgPSBbXG4gKiAgICAgXCJuYW1lXCIsXG4gKiAgICAge1xuICogICAgICAgcHJvcDogW1wicnVuc09uXCIsIDBdLFxuICogICAgICAgaGVhZGVyOiBcImxhbmd1YWdlIDFcIixcbiAqICAgICB9LFxuICogICAgIHtcbiAqICAgICAgIHByb3A6IFtcInJ1bnNPblwiLCAxXSxcbiAqICAgICAgIGhlYWRlcjogXCJsYW5ndWFnZSAyXCIsXG4gKiAgICAgfSxcbiAqICAgXTtcbiAqICAgYGBgXG4gKlxuICogICB8IG5hbWUgfCBsYW5ndWFnZSAxIHwgbGFuZ3VhZ2UgMiB8XG4gKiAgIHwgOi0tOiB8IDotLS0tLS0tLTogfCA6LS0tLS0tLS06IHxcbiAqICAgfCBEZW5vIHwgICAgUnVzdCAgICB8IFR5cGVTY3JpcHQgfFxuICovXG5leHBvcnQgdHlwZSBDb2x1bW4gPSBDb2x1bW5EZXRhaWxzIHwgUHJvcGVydHlBY2Nlc3NvciB8IFByb3BlcnR5QWNjZXNzb3JbXTtcblxuLyoqIEFuIG9iamVjdCAocGxhaW4gb3IgYXJyYXkpICovXG5leHBvcnQgdHlwZSBEYXRhSXRlbSA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5rbm93bltdO1xuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBzdHJpbmdpZnl9LiAqL1xuZXhwb3J0IHR5cGUgU3RyaW5naWZ5T3B0aW9ucyA9IHtcbiAgLyoqIFdoZXRoZXIgdG8gaW5jbHVkZSB0aGUgcm93IG9mIGhlYWRlcnMgb3Igbm90LlxuICAgKlxuICAgKiBAZGVmYXVsdCB7dHJ1ZX1cbiAgICovXG4gIGhlYWRlcnM/OiBib29sZWFuO1xuICAvKipcbiAgICogRGVsaW1pdGVyIHVzZWQgdG8gc2VwYXJhdGUgdmFsdWVzLiBFeGFtcGxlczpcbiAgICogIC0gYFwiLFwiYCBfY29tbWFfXG4gICAqICAtIGBcIlxcdFwiYCBfdGFiX1xuICAgKiAgLSBgXCJ8XCJgIF9waXBlX1xuICAgKiAgLSBldGMuXG4gICAqXG4gICAqICBAZGVmYXVsdCB7XCIsXCJ9XG4gICAqL1xuICBzZXBhcmF0b3I/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBhIGxpc3Qgb2YgaW5zdHJ1Y3Rpb25zIGZvciBob3cgdG8gdGFyZ2V0IGFuZCB0cmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGVhY2hcbiAgICogY29sdW1uIG9mIG91dHB1dC4gVGhpcyBpcyBhbHNvIHdoZXJlIHlvdSBjYW4gcHJvdmlkZSBhbiBleHBsaWNpdCBoZWFkZXJcbiAgICogbmFtZSBmb3IgdGhlIGNvbHVtbi5cbiAgICovXG4gIGNvbHVtbnM/OiBDb2x1bW5bXTtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gYWRkIGFcbiAgICoge0BsaW5rIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0J5dGVfb3JkZXJfbWFyayB8IGJ5dGUtb3JkZXIgbWFya30gdG8gdGhlXG4gICAqIGJlZ2lubmluZyBvZiB0aGUgZmlsZSBjb250ZW50LiBSZXF1aXJlZCBieSBzb2Z0d2FyZSBzdWNoIGFzIE1TIEV4Y2VsIHRvXG4gICAqIHByb3Blcmx5IGRpc3BsYXkgVW5pY29kZSB0ZXh0LlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBib20/OiBib29sZWFuO1xufTtcblxuY29uc3QgUVVPVEUgPSAnXCInO1xuY29uc3QgTEYgPSBcIlxcblwiO1xuY29uc3QgQ1JMRiA9IFwiXFxyXFxuXCI7XG5jb25zdCBCWVRFX09SREVSX01BUksgPSBcIlxcdWZlZmZcIjtcblxuZnVuY3Rpb24gZ2V0RXNjYXBlZFN0cmluZyh2YWx1ZTogdW5rbm93biwgc2VwOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gIGxldCBzdHIgPSBcIlwiO1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHN0ciA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgZWxzZSBzdHIgPSBTdHJpbmcodmFsdWUpO1xuXG4gIC8vIElzIHJlZ2V4LnRlc3QgbW9yZSBwZXJmb3JtYW50IGhlcmU/IElmIHNvLCBob3cgdG8gZHluYW1pY2FsbHkgY3JlYXRlP1xuICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zNTYxNDkzL1xuICBpZiAoc3RyLmluY2x1ZGVzKHNlcCkgfHwgc3RyLmluY2x1ZGVzKExGKSB8fCBzdHIuaW5jbHVkZXMoUVVPVEUpKSB7XG4gICAgcmV0dXJuIGAke1FVT1RFfSR7c3RyLnJlcGxhY2VBbGwoUVVPVEUsIGAke1FVT1RFfSR7UVVPVEV9YCl9JHtRVU9URX1gO1xuICB9XG5cbiAgcmV0dXJuIHN0cjtcbn1cblxudHlwZSBOb3JtYWxpemVkQ29sdW1uID0gT21pdDxDb2x1bW5EZXRhaWxzLCBcImhlYWRlclwiIHwgXCJwcm9wXCI+ICYge1xuICBoZWFkZXI6IHN0cmluZztcbiAgcHJvcDogUHJvcGVydHlBY2Nlc3NvcltdO1xufTtcblxuZnVuY3Rpb24gbm9ybWFsaXplQ29sdW1uKGNvbHVtbjogQ29sdW1uKTogTm9ybWFsaXplZENvbHVtbiB7XG4gIGxldCBoZWFkZXI6IE5vcm1hbGl6ZWRDb2x1bW5bXCJoZWFkZXJcIl07XG4gIGxldCBwcm9wOiBOb3JtYWxpemVkQ29sdW1uW1wicHJvcFwiXTtcblxuICBpZiAodHlwZW9mIGNvbHVtbiA9PT0gXCJvYmplY3RcIikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGNvbHVtbikpIHtcbiAgICAgIGhlYWRlciA9IFN0cmluZyhjb2x1bW5bY29sdW1uLmxlbmd0aCAtIDFdKTtcbiAgICAgIHByb3AgPSBjb2x1bW47XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb3AgPSBBcnJheS5pc0FycmF5KGNvbHVtbi5wcm9wKSA/IGNvbHVtbi5wcm9wIDogW2NvbHVtbi5wcm9wXTtcbiAgICAgIGhlYWRlciA9IHR5cGVvZiBjb2x1bW4uaGVhZGVyID09PSBcInN0cmluZ1wiXG4gICAgICAgID8gY29sdW1uLmhlYWRlclxuICAgICAgICA6IFN0cmluZyhwcm9wW3Byb3AubGVuZ3RoIC0gMV0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBoZWFkZXIgPSBTdHJpbmcoY29sdW1uKTtcbiAgICBwcm9wID0gW2NvbHVtbl07XG4gIH1cblxuICByZXR1cm4geyBoZWFkZXIsIHByb3AgfTtcbn1cblxuLyoqXG4gKiBFcnJvciB0aHJvd24gaW4ge0BsaW5rY29kZSBzdHJpbmdpZnl9LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHN0cmluZ2lmeSwgU3RyaW5naWZ5RXJyb3IgfSBmcm9tIFwiQHN0ZC9jc3Yvc3RyaW5naWZ5XCI7XG4gKlxuICogdHJ5IHtcbiAqICAgc3RyaW5naWZ5KFt7IGE6IDEgfSwgeyBhOiAyIH1dLCB7IHNlcGFyYXRvcjogXCJcXHJcXG5cIiB9KTtcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFN0cmluZ2lmeUVycm9yKSB7XG4gKiAgICAgY29uc29sZS5lcnJvcihlcnJvci5tZXNzYWdlKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBTdHJpbmdpZnlFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnN0YW5jZS5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHMgbm8tZXZhbFxuICAgKiBpbXBvcnQgeyBTdHJpbmdpZnlFcnJvciB9IGZyb20gXCJAc3RkL2Nzdi9zdHJpbmdpZnlcIjtcbiAgICpcbiAgICogdGhyb3cgbmV3IFN0cmluZ2lmeUVycm9yKFwiQW4gZXJyb3Igb2NjdXJyZWRcIik7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlN0cmluZ2lmeUVycm9yXCI7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIHZhbHVlcyBmcm9tIGFuIG9iamVjdCB1c2luZyB0aGUgcHJvcGVydHkgYWNjZXNzb3JzXG4gKiAoYW5kIG9wdGlvbmFsIHRyYW5zZm9ybSBmdW5jdGlvbikgaW4gZWFjaCBjb2x1bW5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFsdWVzRnJvbUl0ZW0oXG4gIGl0ZW06IERhdGFJdGVtLFxuICBub3JtYWxpemVkQ29sdW1uczogTm9ybWFsaXplZENvbHVtbltdLFxuKTogdW5rbm93bltdIHtcbiAgY29uc3QgdmFsdWVzOiB1bmtub3duW10gPSBbXTtcblxuICBpZiAobm9ybWFsaXplZENvbHVtbnMubGVuZ3RoKSB7XG4gICAgZm9yIChjb25zdCBjb2x1bW4gb2Ygbm9ybWFsaXplZENvbHVtbnMpIHtcbiAgICAgIGxldCB2YWx1ZTogdW5rbm93biA9IGl0ZW07XG5cbiAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBjb2x1bW4ucHJvcCkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiIHx8IHZhbHVlID09PSBudWxsKSBjb250aW51ZTtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBwcm9wID09PSBcIm51bWJlclwiKSB2YWx1ZSA9IHZhbHVlW3Byb3BdO1xuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFN0cmluZ2lmeUVycm9yKFxuICAgICAgICAgICAgICAnUHJvcGVydHkgYWNjZXNzb3IgaXMgbm90IG9mIHR5cGUgXCJudW1iZXJcIicsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSAvLyBJIHRoaW5rIHRoaXMgYXNzZXJ0aW9uIGlzIHNhZmUuIENvbmZpcm0/XG4gICAgICAgIGVsc2UgdmFsdWUgPSAodmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW3Byb3BdO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZW0pKSB7XG4gICAgICB2YWx1ZXMucHVzaCguLi5pdGVtKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpdGVtID09PSBcIm9iamVjdFwiKSB7XG4gICAgICB0aHJvdyBuZXcgU3RyaW5naWZ5RXJyb3IoXG4gICAgICAgIFwiTm8gcHJvcGVydHkgYWNjZXNzb3IgZnVuY3Rpb24gd2FzIHByb3ZpZGVkIGZvciBvYmplY3RcIixcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlcy5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB2YWx1ZXM7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gYXJyYXkgb2Ygb2JqZWN0cyBpbnRvIGEgQ1NWIHN0cmluZy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7XG4gKiAgIENvbHVtbixcbiAqICAgc3RyaW5naWZ5LFxuICogfSBmcm9tIFwiQHN0ZC9jc3Yvc3RyaW5naWZ5XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIHR5cGUgQ2hhcmFjdGVyID0ge1xuICogICBhZ2U6IG51bWJlcjtcbiAqICAgbmFtZToge1xuICogICAgIGZpcnN0OiBzdHJpbmc7XG4gKiAgICAgbGFzdDogc3RyaW5nO1xuICogICB9O1xuICogfTtcbiAqXG4gKiBjb25zdCBkYXRhOiBDaGFyYWN0ZXJbXSA9IFtcbiAqICAge1xuICogICAgIGFnZTogNzAsXG4gKiAgICAgbmFtZToge1xuICogICAgICAgZmlyc3Q6IFwiUmlja1wiLFxuICogICAgICAgbGFzdDogXCJTYW5jaGV6XCIsXG4gKiAgICAgfSxcbiAqICAgfSxcbiAqICAge1xuICogICAgIGFnZTogMTQsXG4gKiAgICAgbmFtZToge1xuICogICAgICAgZmlyc3Q6IFwiTW9ydHlcIixcbiAqICAgICAgIGxhc3Q6IFwiU21pdGhcIixcbiAqICAgICB9LFxuICogICB9LFxuICogXTtcbiAqXG4gKiBsZXQgY29sdW1uczogQ29sdW1uW10gPSBbXG4gKiAgIFtcIm5hbWVcIiwgXCJmaXJzdFwiXSxcbiAqICAgXCJhZ2VcIixcbiAqIF07XG4gKlxuICogYXNzZXJ0RXF1YWxzKHN0cmluZ2lmeShkYXRhLCB7IGNvbHVtbnMgfSksIGBmaXJzdCxhZ2VcXHJcXG5SaWNrLDcwXFxyXFxuTW9ydHksMTRcXHJcXG5gKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBkYXRhIFRoZSBzb3VyY2UgZGF0YSB0byBzdHJpbmdpZnkuIEl0J3MgYW4gYXJyYXkgb2YgaXRlbXMgd2hpY2ggYXJlXG4gKiBwbGFpbiBvYmplY3RzIG9yIGFycmF5cy5cbiAqIEByZXR1cm5zIEEgQ1NWIHN0cmluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeShcbiAgZGF0YTogRGF0YUl0ZW1bXSxcbiAgeyBoZWFkZXJzID0gdHJ1ZSwgc2VwYXJhdG9yOiBzZXAgPSBcIixcIiwgY29sdW1ucyA9IFtdLCBib20gPSBmYWxzZSB9OlxuICAgIFN0cmluZ2lmeU9wdGlvbnMgPSB7fSxcbik6IHN0cmluZyB7XG4gIGlmIChzZXAuaW5jbHVkZXMoUVVPVEUpIHx8IHNlcC5pbmNsdWRlcyhDUkxGKSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBbXG4gICAgICBcIlNlcGFyYXRvciBjYW5ub3QgaW5jbHVkZSB0aGUgZm9sbG93aW5nIHN0cmluZ3M6XCIsXG4gICAgICAnICAtIFUrMDAyMjogUXVvdGF0aW9uIG1hcmsgKFwiKScsXG4gICAgICBcIiAgLSBVKzAwMEQgVSswMDBBOiBDYXJyaWFnZSBSZXR1cm4gKyBMaW5lIEZlZWQgKFxcXFxyXFxcXG4pXCIsXG4gICAgXS5qb2luKFwiXFxuXCIpO1xuICAgIHRocm93IG5ldyBTdHJpbmdpZnlFcnJvcihtZXNzYWdlKTtcbiAgfVxuXG4gIGNvbnN0IG5vcm1hbGl6ZWRDb2x1bW5zID0gY29sdW1ucy5tYXAobm9ybWFsaXplQ29sdW1uKTtcbiAgbGV0IG91dHB1dCA9IFwiXCI7XG5cbiAgaWYgKGJvbSkge1xuICAgIG91dHB1dCArPSBCWVRFX09SREVSX01BUks7XG4gIH1cblxuICBpZiAoaGVhZGVycyAmJiBub3JtYWxpemVkQ29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgb3V0cHV0ICs9IG5vcm1hbGl6ZWRDb2x1bW5zXG4gICAgICAubWFwKChjb2x1bW4pID0+IGdldEVzY2FwZWRTdHJpbmcoY29sdW1uLmhlYWRlciwgc2VwKSlcbiAgICAgIC5qb2luKHNlcCk7XG4gICAgb3V0cHV0ICs9IENSTEY7XG4gIH1cblxuICBmb3IgKGNvbnN0IGl0ZW0gb2YgZGF0YSkge1xuICAgIGNvbnN0IHZhbHVlcyA9IGdldFZhbHVlc0Zyb21JdGVtKGl0ZW0sIG5vcm1hbGl6ZWRDb2x1bW5zKTtcbiAgICBvdXRwdXQgKz0gdmFsdWVzXG4gICAgICAubWFwKCh2YWx1ZSkgPT4gZ2V0RXNjYXBlZFN0cmluZyh2YWx1ZSwgc2VwKSlcbiAgICAgIC5qb2luKHNlcCk7XG4gICAgb3V0cHV0ICs9IENSTEY7XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufVxu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
// denoCacheMetadata=637215594173734383,4547048616718020244