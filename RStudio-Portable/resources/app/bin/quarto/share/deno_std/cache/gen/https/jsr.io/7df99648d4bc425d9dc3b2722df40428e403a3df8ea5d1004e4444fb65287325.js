// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
function digits(value, count = 2) {
  return String(value).padStart(count, "0");
}
const QUOTED_LITERAL_REGEXP = /^(')(?<value>\\.|[^\']*)\1/;
const LITERAL_REGEXP = /^(?<value>.+?\s*)/;
const SYMBOL_REGEXP = /^(?<symbol>([a-zA-Z])\2*)/;
// according to unicode symbols (http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table)
function formatToParts(format) {
  const tokens = [];
  let index = 0;
  while(index < format.length){
    const substring = format.slice(index);
    const symbol = SYMBOL_REGEXP.exec(substring)?.groups?.symbol;
    switch(symbol){
      case "yyyy":
        tokens.push({
          type: "year",
          value: "numeric"
        });
        index += symbol.length;
        continue;
      case "yy":
        tokens.push({
          type: "year",
          value: "2-digit"
        });
        index += symbol.length;
        continue;
      case "MM":
        tokens.push({
          type: "month",
          value: "2-digit"
        });
        index += symbol.length;
        continue;
      case "M":
        tokens.push({
          type: "month",
          value: "numeric"
        });
        index += symbol.length;
        continue;
      case "dd":
        tokens.push({
          type: "day",
          value: "2-digit"
        });
        index += symbol.length;
        continue;
      case "d":
        tokens.push({
          type: "day",
          value: "numeric"
        });
        index += symbol.length;
        continue;
      case "HH":
        tokens.push({
          type: "hour",
          value: "2-digit"
        });
        index += symbol.length;
        continue;
      case "H":
        tokens.push({
          type: "hour",
          value: "numeric"
        });
        index += symbol.length;
        continue;
      case "hh":
        tokens.push({
          type: "hour",
          value: "2-digit",
          hour12: true
        });
        index += symbol.length;
        continue;
      case "h":
        tokens.push({
          type: "hour",
          value: "numeric",
          hour12: true
        });
        index += symbol.length;
        continue;
      case "mm":
        tokens.push({
          type: "minute",
          value: "2-digit"
        });
        index += symbol.length;
        continue;
      case "m":
        tokens.push({
          type: "minute",
          value: "numeric"
        });
        index += symbol.length;
        continue;
      case "ss":
        tokens.push({
          type: "second",
          value: "2-digit"
        });
        index += symbol.length;
        continue;
      case "s":
        tokens.push({
          type: "second",
          value: "numeric"
        });
        index += symbol.length;
        continue;
      case "SSS":
        tokens.push({
          type: "fractionalSecond",
          value: 3
        });
        index += symbol.length;
        continue;
      case "SS":
        tokens.push({
          type: "fractionalSecond",
          value: 2
        });
        index += symbol.length;
        continue;
      case "S":
        tokens.push({
          type: "fractionalSecond",
          value: 1
        });
        index += symbol.length;
        continue;
      case "a":
        tokens.push({
          type: "dayPeriod",
          value: 1
        });
        index += symbol.length;
        continue;
    }
    const quotedLiteralMatch = QUOTED_LITERAL_REGEXP.exec(substring);
    if (quotedLiteralMatch) {
      const value = quotedLiteralMatch.groups.value;
      tokens.push({
        type: "literal",
        value
      });
      index += quotedLiteralMatch[0].length;
      continue;
    }
    const literalGroups = LITERAL_REGEXP.exec(substring).groups;
    const value = literalGroups.value;
    tokens.push({
      type: "literal",
      value
    });
    index += value.length;
  }
  return tokens;
}
export class DateTimeFormatter {
  #format;
  constructor(formatString){
    this.#format = formatToParts(formatString);
  }
  format(date, options = {}) {
    let string = "";
    const utc = options.timeZone === "UTC";
    for (const token of this.#format){
      const type = token.type;
      switch(type){
        case "year":
          {
            const value = utc ? date.getUTCFullYear() : date.getFullYear();
            switch(token.value){
              case "numeric":
                {
                  string += value;
                  break;
                }
              case "2-digit":
                {
                  string += digits(value, 2).slice(-2);
                  break;
                }
              default:
                throw Error(`FormatterError: value "${token.value}" is not supported`);
            }
            break;
          }
        case "month":
          {
            const value = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
            switch(token.value){
              case "numeric":
                {
                  string += value;
                  break;
                }
              case "2-digit":
                {
                  string += digits(value, 2);
                  break;
                }
              default:
                throw Error(`FormatterError: value "${token.value}" is not supported`);
            }
            break;
          }
        case "day":
          {
            const value = utc ? date.getUTCDate() : date.getDate();
            switch(token.value){
              case "numeric":
                {
                  string += value;
                  break;
                }
              case "2-digit":
                {
                  string += digits(value, 2);
                  break;
                }
              default:
                throw Error(`FormatterError: value "${token.value}" is not supported`);
            }
            break;
          }
        case "hour":
          {
            let value = utc ? date.getUTCHours() : date.getHours();
            if (token.hour12) {
              if (value === 0) value = 12;
              else if (value > 12) value -= 12;
            }
            switch(token.value){
              case "numeric":
                {
                  string += value;
                  break;
                }
              case "2-digit":
                {
                  string += digits(value, 2);
                  break;
                }
              default:
                throw Error(`FormatterError: value "${token.value}" is not supported`);
            }
            break;
          }
        case "minute":
          {
            const value = utc ? date.getUTCMinutes() : date.getMinutes();
            switch(token.value){
              case "numeric":
                {
                  string += value;
                  break;
                }
              case "2-digit":
                {
                  string += digits(value, 2);
                  break;
                }
              default:
                throw Error(`FormatterError: value "${token.value}" is not supported`);
            }
            break;
          }
        case "second":
          {
            const value = utc ? date.getUTCSeconds() : date.getSeconds();
            switch(token.value){
              case "numeric":
                {
                  string += value;
                  break;
                }
              case "2-digit":
                {
                  string += digits(value, 2);
                  break;
                }
              default:
                throw Error(`FormatterError: value "${token.value}" is not supported`);
            }
            break;
          }
        case "fractionalSecond":
          {
            const value = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
            string += digits(value, Number(token.value));
            break;
          }
        // FIXME(bartlomieju)
        case "timeZoneName":
          {
            break;
          }
        case "dayPeriod":
          {
            string += date.getHours() >= 12 ? "PM" : "AM";
            break;
          }
        case "literal":
          {
            string += token.value;
            break;
          }
        default:
          throw Error(`FormatterError: { ${token.type} ${token.value} }`);
      }
    }
    return string;
  }
  parseToParts(string) {
    const parts = [];
    for (const token of this.#format){
      const type = token.type;
      let value = "";
      switch(token.type){
        case "year":
          {
            switch(token.value){
              case "numeric":
                {
                  value = /^\d{1,4}/.exec(string)?.[0];
                  break;
                }
              case "2-digit":
                {
                  value = /^\d{1,2}/.exec(string)?.[0];
                  break;
                }
              default:
                throw Error(`ParserError: value "${token.value}" is not supported`);
            }
            break;
          }
        case "month":
          {
            switch(token.value){
              case "numeric":
                {
                  value = /^\d{1,2}/.exec(string)?.[0];
                  break;
                }
              case "2-digit":
                {
                  value = /^\d{2}/.exec(string)?.[0];
                  break;
                }
              case "narrow":
                {
                  value = /^[a-zA-Z]+/.exec(string)?.[0];
                  break;
                }
              case "short":
                {
                  value = /^[a-zA-Z]+/.exec(string)?.[0];
                  break;
                }
              case "long":
                {
                  value = /^[a-zA-Z]+/.exec(string)?.[0];
                  break;
                }
              default:
                throw Error(`ParserError: value "${token.value}" is not supported`);
            }
            break;
          }
        case "day":
          {
            switch(token.value){
              case "numeric":
                {
                  value = /^\d{1,2}/.exec(string)?.[0];
                  break;
                }
              case "2-digit":
                {
                  value = /^\d{2}/.exec(string)?.[0];
                  break;
                }
              default:
                throw Error(`ParserError: value "${token.value}" is not supported`);
            }
            break;
          }
        case "hour":
          {
            switch(token.value){
              case "numeric":
                {
                  value = /^\d{1,2}/.exec(string)?.[0];
                  if (token.hour12 && parseInt(value) > 12) {
                    console.error(`Trying to parse hour greater than 12. Use 'H' instead of 'h'.`);
                  }
                  break;
                }
              case "2-digit":
                {
                  value = /^\d{2}/.exec(string)?.[0];
                  if (token.hour12 && parseInt(value) > 12) {
                    console.error(`Trying to parse hour greater than 12. Use 'HH' instead of 'hh'.`);
                  }
                  break;
                }
              default:
                throw Error(`ParserError: value "${token.value}" is not supported`);
            }
            break;
          }
        case "minute":
          {
            switch(token.value){
              case "numeric":
                {
                  value = /^\d{1,2}/.exec(string)?.[0];
                  break;
                }
              case "2-digit":
                {
                  value = /^\d{2}/.exec(string)?.[0];
                  break;
                }
              default:
                throw Error(`ParserError: value "${token.value}" is not supported`);
            }
            break;
          }
        case "second":
          {
            switch(token.value){
              case "numeric":
                {
                  value = /^\d{1,2}/.exec(string)?.[0];
                  break;
                }
              case "2-digit":
                {
                  value = /^\d{2}/.exec(string)?.[0];
                  break;
                }
              default:
                throw Error(`ParserError: value "${token.value}" is not supported`);
            }
            break;
          }
        case "fractionalSecond":
          {
            value = new RegExp(`^\\d{${token.value}}`).exec(string)?.[0];
            break;
          }
        case "timeZoneName":
          {
            value = token.value;
            break;
          }
        case "dayPeriod":
          {
            value = /^(A|P)M/.exec(string)?.[0];
            break;
          }
        case "literal":
          {
            if (!string.startsWith(token.value)) {
              throw Error(`Literal "${token.value}" not found "${string.slice(0, 25)}"`);
            }
            value = token.value;
            break;
          }
        default:
          throw Error(`${token.type} ${token.value}`);
      }
      if (!value) {
        throw Error(`value not valid for token { ${type} ${value} } ${string.slice(0, 25)}`);
      }
      parts.push({
        type,
        value
      });
      string = string.slice(value.length);
    }
    if (string.length) {
      throw Error(`datetime string was not fully parsed! ${string.slice(0, 25)}`);
    }
    return parts;
  }
  /** sort & filter dateTimeFormatPart */ sortDateTimeFormatPart(parts) {
    let result = [];
    const typeArray = [
      "year",
      "month",
      "day",
      "hour",
      "minute",
      "second",
      "fractionalSecond"
    ];
    for (const type of typeArray){
      const current = parts.findIndex((el)=>el.type === type);
      if (current !== -1) {
        result = result.concat(parts.splice(current, 1));
      }
    }
    result = result.concat(parts);
    return result;
  }
  partsToDate(parts) {
    const date = new Date();
    const utc = parts.find((part)=>part.type === "timeZoneName" && part.value === "UTC");
    const dayPart = parts.find((part)=>part.type === "day");
    utc ? date.setUTCHours(0, 0, 0, 0) : date.setHours(0, 0, 0, 0);
    for (const part of parts){
      switch(part.type){
        case "year":
          {
            const value = Number(part.value.padStart(4, "20"));
            utc ? date.setUTCFullYear(value) : date.setFullYear(value);
            break;
          }
        case "month":
          {
            const value = Number(part.value) - 1;
            if (dayPart) {
              utc ? date.setUTCMonth(value, Number(dayPart.value)) : date.setMonth(value, Number(dayPart.value));
            } else {
              utc ? date.setUTCMonth(value) : date.setMonth(value);
            }
            break;
          }
        case "day":
          {
            const value = Number(part.value);
            utc ? date.setUTCDate(value) : date.setDate(value);
            break;
          }
        case "hour":
          {
            let value = Number(part.value);
            const dayPeriod = parts.find((part)=>part.type === "dayPeriod");
            if (dayPeriod?.value === "PM") value += 12;
            utc ? date.setUTCHours(value) : date.setHours(value);
            break;
          }
        case "minute":
          {
            const value = Number(part.value);
            utc ? date.setUTCMinutes(value) : date.setMinutes(value);
            break;
          }
        case "second":
          {
            const value = Number(part.value);
            utc ? date.setUTCSeconds(value) : date.setSeconds(value);
            break;
          }
        case "fractionalSecond":
          {
            const value = Number(part.value);
            utc ? date.setUTCMilliseconds(value) : date.setMilliseconds(value);
            break;
          }
      }
    }
    return date;
  }
  parse(string) {
    const parts = this.parseToParts(string);
    const sortParts = this.sortDateTimeFormatPart(parts);
    return this.partsToDate(sortParts);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZGF0ZXRpbWUvMC4yMjQuNS9fZGF0ZV90aW1lX2Zvcm1hdHRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5mdW5jdGlvbiBkaWdpdHModmFsdWU6IHN0cmluZyB8IG51bWJlciwgY291bnQgPSAyKTogc3RyaW5nIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucGFkU3RhcnQoY291bnQsIFwiMFwiKTtcbn1cblxuLy8gYXMgZGVjbGFyZWQgYXMgaW4gbmFtZXNwYWNlIEludGxcbnR5cGUgRGF0ZVRpbWVGb3JtYXRQYXJ0VHlwZXMgPVxuICB8IFwiZGF5XCJcbiAgfCBcImRheVBlcmlvZFwiXG4gIC8vIHwgXCJlcmFcIlxuICB8IFwiaG91clwiXG4gIHwgXCJsaXRlcmFsXCJcbiAgfCBcIm1pbnV0ZVwiXG4gIHwgXCJtb250aFwiXG4gIHwgXCJzZWNvbmRcIlxuICB8IFwidGltZVpvbmVOYW1lXCJcbiAgLy8gfCBcIndlZWtkYXlcIlxuICB8IFwieWVhclwiXG4gIHwgXCJmcmFjdGlvbmFsU2Vjb25kXCI7XG5cbmludGVyZmFjZSBEYXRlVGltZUZvcm1hdFBhcnQge1xuICB0eXBlOiBEYXRlVGltZUZvcm1hdFBhcnRUeXBlcztcbiAgdmFsdWU6IHN0cmluZztcbn1cblxudHlwZSBUaW1lWm9uZSA9IFwiVVRDXCI7XG5cbmludGVyZmFjZSBPcHRpb25zIHtcbiAgdGltZVpvbmU/OiBUaW1lWm9uZTtcbn1cblxudHlwZSBGb3JtYXRQYXJ0ID0ge1xuICB0eXBlOiBEYXRlVGltZUZvcm1hdFBhcnRUeXBlcztcbiAgdmFsdWU6IHN0cmluZyB8IG51bWJlcjtcbiAgaG91cjEyPzogYm9vbGVhbjtcbn07XG50eXBlIEZvcm1hdCA9IEZvcm1hdFBhcnRbXTtcblxuY29uc3QgUVVPVEVEX0xJVEVSQUxfUkVHRVhQID0gL14oJykoPzx2YWx1ZT5cXFxcLnxbXlxcJ10qKVxcMS87XG5jb25zdCBMSVRFUkFMX1JFR0VYUCA9IC9eKD88dmFsdWU+Lis/XFxzKikvO1xuY29uc3QgU1lNQk9MX1JFR0VYUCA9IC9eKD88c3ltYm9sPihbYS16QS1aXSlcXDIqKS87XG5cbi8vIGFjY29yZGluZyB0byB1bmljb2RlIHN5bWJvbHMgKGh0dHA6Ly93d3cudW5pY29kZS5vcmcvcmVwb3J0cy90cjM1L3RyMzUtZGF0ZXMuaHRtbCNEYXRlX0ZpZWxkX1N5bWJvbF9UYWJsZSlcbmZ1bmN0aW9uIGZvcm1hdFRvUGFydHMoZm9ybWF0OiBzdHJpbmcpIHtcbiAgY29uc3QgdG9rZW5zOiBGb3JtYXQgPSBbXTtcbiAgbGV0IGluZGV4ID0gMDtcbiAgd2hpbGUgKGluZGV4IDwgZm9ybWF0Lmxlbmd0aCkge1xuICAgIGNvbnN0IHN1YnN0cmluZyA9IGZvcm1hdC5zbGljZShpbmRleCk7XG4gICAgY29uc3Qgc3ltYm9sID0gU1lNQk9MX1JFR0VYUC5leGVjKHN1YnN0cmluZyk/Lmdyb3Vwcz8uc3ltYm9sO1xuICAgIHN3aXRjaCAoc3ltYm9sKSB7XG4gICAgICBjYXNlIFwieXl5eVwiOlxuICAgICAgICB0b2tlbnMucHVzaCh7IHR5cGU6IFwieWVhclwiLCB2YWx1ZTogXCJudW1lcmljXCIgfSk7XG4gICAgICAgIGluZGV4ICs9IHN5bWJvbC5sZW5ndGg7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgY2FzZSBcInl5XCI6XG4gICAgICAgIHRva2Vucy5wdXNoKHsgdHlwZTogXCJ5ZWFyXCIsIHZhbHVlOiBcIjItZGlnaXRcIiB9KTtcbiAgICAgICAgaW5kZXggKz0gc3ltYm9sLmxlbmd0aDtcbiAgICAgICAgY29udGludWU7XG4gICAgICBjYXNlIFwiTU1cIjpcbiAgICAgICAgdG9rZW5zLnB1c2goeyB0eXBlOiBcIm1vbnRoXCIsIHZhbHVlOiBcIjItZGlnaXRcIiB9KTtcbiAgICAgICAgaW5kZXggKz0gc3ltYm9sLmxlbmd0aDtcbiAgICAgICAgY29udGludWU7XG4gICAgICBjYXNlIFwiTVwiOlxuICAgICAgICB0b2tlbnMucHVzaCh7IHR5cGU6IFwibW9udGhcIiwgdmFsdWU6IFwibnVtZXJpY1wiIH0pO1xuICAgICAgICBpbmRleCArPSBzeW1ib2wubGVuZ3RoO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIGNhc2UgXCJkZFwiOlxuICAgICAgICB0b2tlbnMucHVzaCh7IHR5cGU6IFwiZGF5XCIsIHZhbHVlOiBcIjItZGlnaXRcIiB9KTtcbiAgICAgICAgaW5kZXggKz0gc3ltYm9sLmxlbmd0aDtcbiAgICAgICAgY29udGludWU7XG4gICAgICBjYXNlIFwiZFwiOlxuICAgICAgICB0b2tlbnMucHVzaCh7IHR5cGU6IFwiZGF5XCIsIHZhbHVlOiBcIm51bWVyaWNcIiB9KTtcbiAgICAgICAgaW5kZXggKz0gc3ltYm9sLmxlbmd0aDtcbiAgICAgICAgY29udGludWU7XG4gICAgICBjYXNlIFwiSEhcIjpcbiAgICAgICAgdG9rZW5zLnB1c2goeyB0eXBlOiBcImhvdXJcIiwgdmFsdWU6IFwiMi1kaWdpdFwiIH0pO1xuICAgICAgICBpbmRleCArPSBzeW1ib2wubGVuZ3RoO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIGNhc2UgXCJIXCI6XG4gICAgICAgIHRva2Vucy5wdXNoKHsgdHlwZTogXCJob3VyXCIsIHZhbHVlOiBcIm51bWVyaWNcIiB9KTtcbiAgICAgICAgaW5kZXggKz0gc3ltYm9sLmxlbmd0aDtcbiAgICAgICAgY29udGludWU7XG4gICAgICBjYXNlIFwiaGhcIjpcbiAgICAgICAgdG9rZW5zLnB1c2goeyB0eXBlOiBcImhvdXJcIiwgdmFsdWU6IFwiMi1kaWdpdFwiLCBob3VyMTI6IHRydWUgfSk7XG4gICAgICAgIGluZGV4ICs9IHN5bWJvbC5sZW5ndGg7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgY2FzZSBcImhcIjpcbiAgICAgICAgdG9rZW5zLnB1c2goeyB0eXBlOiBcImhvdXJcIiwgdmFsdWU6IFwibnVtZXJpY1wiLCBob3VyMTI6IHRydWUgfSk7XG4gICAgICAgIGluZGV4ICs9IHN5bWJvbC5sZW5ndGg7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgY2FzZSBcIm1tXCI6XG4gICAgICAgIHRva2Vucy5wdXNoKHsgdHlwZTogXCJtaW51dGVcIiwgdmFsdWU6IFwiMi1kaWdpdFwiIH0pO1xuICAgICAgICBpbmRleCArPSBzeW1ib2wubGVuZ3RoO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIGNhc2UgXCJtXCI6XG4gICAgICAgIHRva2Vucy5wdXNoKHsgdHlwZTogXCJtaW51dGVcIiwgdmFsdWU6IFwibnVtZXJpY1wiIH0pO1xuICAgICAgICBpbmRleCArPSBzeW1ib2wubGVuZ3RoO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIGNhc2UgXCJzc1wiOlxuICAgICAgICB0b2tlbnMucHVzaCh7IHR5cGU6IFwic2Vjb25kXCIsIHZhbHVlOiBcIjItZGlnaXRcIiB9KTtcbiAgICAgICAgaW5kZXggKz0gc3ltYm9sLmxlbmd0aDtcbiAgICAgICAgY29udGludWU7XG4gICAgICBjYXNlIFwic1wiOlxuICAgICAgICB0b2tlbnMucHVzaCh7IHR5cGU6IFwic2Vjb25kXCIsIHZhbHVlOiBcIm51bWVyaWNcIiB9KTtcbiAgICAgICAgaW5kZXggKz0gc3ltYm9sLmxlbmd0aDtcbiAgICAgICAgY29udGludWU7XG4gICAgICBjYXNlIFwiU1NTXCI6XG4gICAgICAgIHRva2Vucy5wdXNoKHsgdHlwZTogXCJmcmFjdGlvbmFsU2Vjb25kXCIsIHZhbHVlOiAzIH0pO1xuICAgICAgICBpbmRleCArPSBzeW1ib2wubGVuZ3RoO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIGNhc2UgXCJTU1wiOlxuICAgICAgICB0b2tlbnMucHVzaCh7IHR5cGU6IFwiZnJhY3Rpb25hbFNlY29uZFwiLCB2YWx1ZTogMiB9KTtcbiAgICAgICAgaW5kZXggKz0gc3ltYm9sLmxlbmd0aDtcbiAgICAgICAgY29udGludWU7XG4gICAgICBjYXNlIFwiU1wiOlxuICAgICAgICB0b2tlbnMucHVzaCh7IHR5cGU6IFwiZnJhY3Rpb25hbFNlY29uZFwiLCB2YWx1ZTogMSB9KTtcbiAgICAgICAgaW5kZXggKz0gc3ltYm9sLmxlbmd0aDtcbiAgICAgICAgY29udGludWU7XG4gICAgICBjYXNlIFwiYVwiOlxuICAgICAgICB0b2tlbnMucHVzaCh7IHR5cGU6IFwiZGF5UGVyaW9kXCIsIHZhbHVlOiAxIH0pO1xuICAgICAgICBpbmRleCArPSBzeW1ib2wubGVuZ3RoO1xuICAgICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBxdW90ZWRMaXRlcmFsTWF0Y2ggPSBRVU9URURfTElURVJBTF9SRUdFWFAuZXhlYyhzdWJzdHJpbmcpO1xuICAgIGlmIChxdW90ZWRMaXRlcmFsTWF0Y2gpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gcXVvdGVkTGl0ZXJhbE1hdGNoLmdyb3VwcyEudmFsdWUgYXMgc3RyaW5nO1xuICAgICAgdG9rZW5zLnB1c2goeyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWUgfSk7XG4gICAgICBpbmRleCArPSBxdW90ZWRMaXRlcmFsTWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgbGl0ZXJhbEdyb3VwcyA9IExJVEVSQUxfUkVHRVhQLmV4ZWMoc3Vic3RyaW5nKSEuZ3JvdXBzITtcbiAgICBjb25zdCB2YWx1ZSA9IGxpdGVyYWxHcm91cHMudmFsdWUgYXMgc3RyaW5nO1xuICAgIHRva2Vucy5wdXNoKHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlIH0pO1xuICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgfVxuXG4gIHJldHVybiB0b2tlbnM7XG59XG5cbmV4cG9ydCBjbGFzcyBEYXRlVGltZUZvcm1hdHRlciB7XG4gICNmb3JtYXQ6IEZvcm1hdDtcblxuICBjb25zdHJ1Y3Rvcihmb3JtYXRTdHJpbmc6IHN0cmluZykge1xuICAgIHRoaXMuI2Zvcm1hdCA9IGZvcm1hdFRvUGFydHMoZm9ybWF0U3RyaW5nKTtcbiAgfVxuXG4gIGZvcm1hdChkYXRlOiBEYXRlLCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBzdHJpbmcge1xuICAgIGxldCBzdHJpbmcgPSBcIlwiO1xuXG4gICAgY29uc3QgdXRjID0gb3B0aW9ucy50aW1lWm9uZSA9PT0gXCJVVENcIjtcblxuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdGhpcy4jZm9ybWF0KSB7XG4gICAgICBjb25zdCB0eXBlID0gdG9rZW4udHlwZTtcblxuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgXCJ5ZWFyXCI6IHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHV0YyA/IGRhdGUuZ2V0VVRDRnVsbFllYXIoKSA6IGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICBzd2l0Y2ggKHRva2VuLnZhbHVlKSB7XG4gICAgICAgICAgICBjYXNlIFwibnVtZXJpY1wiOiB7XG4gICAgICAgICAgICAgIHN0cmluZyArPSB2YWx1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiMi1kaWdpdFwiOiB7XG4gICAgICAgICAgICAgIHN0cmluZyArPSBkaWdpdHModmFsdWUsIDIpLnNsaWNlKC0yKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgICAgICBgRm9ybWF0dGVyRXJyb3I6IHZhbHVlIFwiJHt0b2tlbi52YWx1ZX1cIiBpcyBub3Qgc3VwcG9ydGVkYCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcIm1vbnRoXCI6IHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9ICh1dGMgPyBkYXRlLmdldFVUQ01vbnRoKCkgOiBkYXRlLmdldE1vbnRoKCkpICsgMTtcbiAgICAgICAgICBzd2l0Y2ggKHRva2VuLnZhbHVlKSB7XG4gICAgICAgICAgICBjYXNlIFwibnVtZXJpY1wiOiB7XG4gICAgICAgICAgICAgIHN0cmluZyArPSB2YWx1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiMi1kaWdpdFwiOiB7XG4gICAgICAgICAgICAgIHN0cmluZyArPSBkaWdpdHModmFsdWUsIDIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgICAgIGBGb3JtYXR0ZXJFcnJvcjogdmFsdWUgXCIke3Rva2VuLnZhbHVlfVwiIGlzIG5vdCBzdXBwb3J0ZWRgLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiZGF5XCI6IHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHV0YyA/IGRhdGUuZ2V0VVRDRGF0ZSgpIDogZGF0ZS5nZXREYXRlKCk7XG4gICAgICAgICAgc3dpdGNoICh0b2tlbi52YWx1ZSkge1xuICAgICAgICAgICAgY2FzZSBcIm51bWVyaWNcIjoge1xuICAgICAgICAgICAgICBzdHJpbmcgKz0gdmFsdWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcIjItZGlnaXRcIjoge1xuICAgICAgICAgICAgICBzdHJpbmcgKz0gZGlnaXRzKHZhbHVlLCAyKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgICAgICBgRm9ybWF0dGVyRXJyb3I6IHZhbHVlIFwiJHt0b2tlbi52YWx1ZX1cIiBpcyBub3Qgc3VwcG9ydGVkYCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcImhvdXJcIjoge1xuICAgICAgICAgIGxldCB2YWx1ZSA9IHV0YyA/IGRhdGUuZ2V0VVRDSG91cnMoKSA6IGRhdGUuZ2V0SG91cnMoKTtcbiAgICAgICAgICBpZiAodG9rZW4uaG91cjEyKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IDApIHZhbHVlID0gMTI7XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSA+IDEyKSB2YWx1ZSAtPSAxMjtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3dpdGNoICh0b2tlbi52YWx1ZSkge1xuICAgICAgICAgICAgY2FzZSBcIm51bWVyaWNcIjoge1xuICAgICAgICAgICAgICBzdHJpbmcgKz0gdmFsdWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcIjItZGlnaXRcIjoge1xuICAgICAgICAgICAgICBzdHJpbmcgKz0gZGlnaXRzKHZhbHVlLCAyKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgICAgICBgRm9ybWF0dGVyRXJyb3I6IHZhbHVlIFwiJHt0b2tlbi52YWx1ZX1cIiBpcyBub3Qgc3VwcG9ydGVkYCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcIm1pbnV0ZVwiOiB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSB1dGMgPyBkYXRlLmdldFVUQ01pbnV0ZXMoKSA6IGRhdGUuZ2V0TWludXRlcygpO1xuICAgICAgICAgIHN3aXRjaCAodG9rZW4udmFsdWUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJudW1lcmljXCI6IHtcbiAgICAgICAgICAgICAgc3RyaW5nICs9IHZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCIyLWRpZ2l0XCI6IHtcbiAgICAgICAgICAgICAgc3RyaW5nICs9IGRpZ2l0cyh2YWx1ZSwgMik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZvcm1hdHRlckVycm9yOiB2YWx1ZSBcIiR7dG9rZW4udmFsdWV9XCIgaXMgbm90IHN1cHBvcnRlZGAsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJzZWNvbmRcIjoge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gdXRjID8gZGF0ZS5nZXRVVENTZWNvbmRzKCkgOiBkYXRlLmdldFNlY29uZHMoKTtcbiAgICAgICAgICBzd2l0Y2ggKHRva2VuLnZhbHVlKSB7XG4gICAgICAgICAgICBjYXNlIFwibnVtZXJpY1wiOiB7XG4gICAgICAgICAgICAgIHN0cmluZyArPSB2YWx1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiMi1kaWdpdFwiOiB7XG4gICAgICAgICAgICAgIHN0cmluZyArPSBkaWdpdHModmFsdWUsIDIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgICAgIGBGb3JtYXR0ZXJFcnJvcjogdmFsdWUgXCIke3Rva2VuLnZhbHVlfVwiIGlzIG5vdCBzdXBwb3J0ZWRgLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiZnJhY3Rpb25hbFNlY29uZFwiOiB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSB1dGNcbiAgICAgICAgICAgID8gZGF0ZS5nZXRVVENNaWxsaXNlY29uZHMoKVxuICAgICAgICAgICAgOiBkYXRlLmdldE1pbGxpc2Vjb25kcygpO1xuICAgICAgICAgIHN0cmluZyArPSBkaWdpdHModmFsdWUsIE51bWJlcih0b2tlbi52YWx1ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZJWE1FKGJhcnRsb21pZWp1KVxuICAgICAgICBjYXNlIFwidGltZVpvbmVOYW1lXCI6IHtcbiAgICAgICAgICAvLyBzdHJpbmcgKz0gdXRjID8gXCJaXCIgOiB0b2tlbi52YWx1ZVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJkYXlQZXJpb2RcIjoge1xuICAgICAgICAgIHN0cmluZyArPSBkYXRlLmdldEhvdXJzKCkgPj0gMTIgPyBcIlBNXCIgOiBcIkFNXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcImxpdGVyYWxcIjoge1xuICAgICAgICAgIHN0cmluZyArPSB0b2tlbi52YWx1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgRXJyb3IoYEZvcm1hdHRlckVycm9yOiB7ICR7dG9rZW4udHlwZX0gJHt0b2tlbi52YWx1ZX0gfWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cblxuICBwYXJzZVRvUGFydHMoc3RyaW5nOiBzdHJpbmcpOiBEYXRlVGltZUZvcm1hdFBhcnRbXSB7XG4gICAgY29uc3QgcGFydHM6IERhdGVUaW1lRm9ybWF0UGFydFtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRoaXMuI2Zvcm1hdCkge1xuICAgICAgY29uc3QgdHlwZSA9IHRva2VuLnR5cGU7XG5cbiAgICAgIGxldCB2YWx1ZSA9IFwiXCI7XG4gICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSBcInllYXJcIjoge1xuICAgICAgICAgIHN3aXRjaCAodG9rZW4udmFsdWUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJudW1lcmljXCI6IHtcbiAgICAgICAgICAgICAgdmFsdWUgPSAvXlxcZHsxLDR9Ly5leGVjKHN0cmluZyk/LlswXSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcIjItZGlnaXRcIjoge1xuICAgICAgICAgICAgICB2YWx1ZSA9IC9eXFxkezEsMn0vLmV4ZWMoc3RyaW5nKT8uWzBdIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgICAgICBgUGFyc2VyRXJyb3I6IHZhbHVlIFwiJHt0b2tlbi52YWx1ZX1cIiBpcyBub3Qgc3VwcG9ydGVkYCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcIm1vbnRoXCI6IHtcbiAgICAgICAgICBzd2l0Y2ggKHRva2VuLnZhbHVlKSB7XG4gICAgICAgICAgICBjYXNlIFwibnVtZXJpY1wiOiB7XG4gICAgICAgICAgICAgIHZhbHVlID0gL15cXGR7MSwyfS8uZXhlYyhzdHJpbmcpPy5bMF0gYXMgc3RyaW5nO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCIyLWRpZ2l0XCI6IHtcbiAgICAgICAgICAgICAgdmFsdWUgPSAvXlxcZHsyfS8uZXhlYyhzdHJpbmcpPy5bMF0gYXMgc3RyaW5nO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJuYXJyb3dcIjoge1xuICAgICAgICAgICAgICB2YWx1ZSA9IC9eW2EtekEtWl0rLy5leGVjKHN0cmluZyk/LlswXSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcInNob3J0XCI6IHtcbiAgICAgICAgICAgICAgdmFsdWUgPSAvXlthLXpBLVpdKy8uZXhlYyhzdHJpbmcpPy5bMF0gYXMgc3RyaW5nO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJsb25nXCI6IHtcbiAgICAgICAgICAgICAgdmFsdWUgPSAvXlthLXpBLVpdKy8uZXhlYyhzdHJpbmcpPy5bMF0gYXMgc3RyaW5nO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgICAgIGBQYXJzZXJFcnJvcjogdmFsdWUgXCIke3Rva2VuLnZhbHVlfVwiIGlzIG5vdCBzdXBwb3J0ZWRgLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiZGF5XCI6IHtcbiAgICAgICAgICBzd2l0Y2ggKHRva2VuLnZhbHVlKSB7XG4gICAgICAgICAgICBjYXNlIFwibnVtZXJpY1wiOiB7XG4gICAgICAgICAgICAgIHZhbHVlID0gL15cXGR7MSwyfS8uZXhlYyhzdHJpbmcpPy5bMF0gYXMgc3RyaW5nO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCIyLWRpZ2l0XCI6IHtcbiAgICAgICAgICAgICAgdmFsdWUgPSAvXlxcZHsyfS8uZXhlYyhzdHJpbmcpPy5bMF0gYXMgc3RyaW5nO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgICAgIGBQYXJzZXJFcnJvcjogdmFsdWUgXCIke3Rva2VuLnZhbHVlfVwiIGlzIG5vdCBzdXBwb3J0ZWRgLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiaG91clwiOiB7XG4gICAgICAgICAgc3dpdGNoICh0b2tlbi52YWx1ZSkge1xuICAgICAgICAgICAgY2FzZSBcIm51bWVyaWNcIjoge1xuICAgICAgICAgICAgICB2YWx1ZSA9IC9eXFxkezEsMn0vLmV4ZWMoc3RyaW5nKT8uWzBdIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgaWYgKHRva2VuLmhvdXIxMiAmJiBwYXJzZUludCh2YWx1ZSkgPiAxMikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgICBgVHJ5aW5nIHRvIHBhcnNlIGhvdXIgZ3JlYXRlciB0aGFuIDEyLiBVc2UgJ0gnIGluc3RlYWQgb2YgJ2gnLmAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCIyLWRpZ2l0XCI6IHtcbiAgICAgICAgICAgICAgdmFsdWUgPSAvXlxcZHsyfS8uZXhlYyhzdHJpbmcpPy5bMF0gYXMgc3RyaW5nO1xuICAgICAgICAgICAgICBpZiAodG9rZW4uaG91cjEyICYmIHBhcnNlSW50KHZhbHVlKSA+IDEyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgICAgIGBUcnlpbmcgdG8gcGFyc2UgaG91ciBncmVhdGVyIHRoYW4gMTIuIFVzZSAnSEgnIGluc3RlYWQgb2YgJ2hoJy5gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgICAgICBgUGFyc2VyRXJyb3I6IHZhbHVlIFwiJHt0b2tlbi52YWx1ZX1cIiBpcyBub3Qgc3VwcG9ydGVkYCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcIm1pbnV0ZVwiOiB7XG4gICAgICAgICAgc3dpdGNoICh0b2tlbi52YWx1ZSkge1xuICAgICAgICAgICAgY2FzZSBcIm51bWVyaWNcIjoge1xuICAgICAgICAgICAgICB2YWx1ZSA9IC9eXFxkezEsMn0vLmV4ZWMoc3RyaW5nKT8uWzBdIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiMi1kaWdpdFwiOiB7XG4gICAgICAgICAgICAgIHZhbHVlID0gL15cXGR7Mn0vLmV4ZWMoc3RyaW5nKT8uWzBdIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgICAgICBgUGFyc2VyRXJyb3I6IHZhbHVlIFwiJHt0b2tlbi52YWx1ZX1cIiBpcyBub3Qgc3VwcG9ydGVkYCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcInNlY29uZFwiOiB7XG4gICAgICAgICAgc3dpdGNoICh0b2tlbi52YWx1ZSkge1xuICAgICAgICAgICAgY2FzZSBcIm51bWVyaWNcIjoge1xuICAgICAgICAgICAgICB2YWx1ZSA9IC9eXFxkezEsMn0vLmV4ZWMoc3RyaW5nKT8uWzBdIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiMi1kaWdpdFwiOiB7XG4gICAgICAgICAgICAgIHZhbHVlID0gL15cXGR7Mn0vLmV4ZWMoc3RyaW5nKT8uWzBdIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgICAgICBgUGFyc2VyRXJyb3I6IHZhbHVlIFwiJHt0b2tlbi52YWx1ZX1cIiBpcyBub3Qgc3VwcG9ydGVkYCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcImZyYWN0aW9uYWxTZWNvbmRcIjoge1xuICAgICAgICAgIHZhbHVlID0gbmV3IFJlZ0V4cChgXlxcXFxkeyR7dG9rZW4udmFsdWV9fWApLmV4ZWMoc3RyaW5nKVxuICAgICAgICAgICAgPy5bMF0gYXMgc3RyaW5nO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJ0aW1lWm9uZU5hbWVcIjoge1xuICAgICAgICAgIHZhbHVlID0gdG9rZW4udmFsdWUgYXMgc3RyaW5nO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJkYXlQZXJpb2RcIjoge1xuICAgICAgICAgIHZhbHVlID0gL14oQXxQKU0vLmV4ZWMoc3RyaW5nKT8uWzBdIGFzIHN0cmluZztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwibGl0ZXJhbFwiOiB7XG4gICAgICAgICAgaWYgKCFzdHJpbmcuc3RhcnRzV2l0aCh0b2tlbi52YWx1ZSBhcyBzdHJpbmcpKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgICAgYExpdGVyYWwgXCIke3Rva2VuLnZhbHVlfVwiIG5vdCBmb3VuZCBcIiR7c3RyaW5nLnNsaWNlKDAsIDI1KX1cImAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IHRva2VuLnZhbHVlIGFzIHN0cmluZztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgRXJyb3IoYCR7dG9rZW4udHlwZX0gJHt0b2tlbi52YWx1ZX1gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICBgdmFsdWUgbm90IHZhbGlkIGZvciB0b2tlbiB7ICR7dHlwZX0gJHt2YWx1ZX0gfSAke1xuICAgICAgICAgICAgc3RyaW5nLnNsaWNlKFxuICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAyNSxcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHBhcnRzLnB1c2goeyB0eXBlLCB2YWx1ZSB9KTtcblxuICAgICAgc3RyaW5nID0gc3RyaW5nLnNsaWNlKHZhbHVlLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYgKHN0cmluZy5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBgZGF0ZXRpbWUgc3RyaW5nIHdhcyBub3QgZnVsbHkgcGFyc2VkISAke3N0cmluZy5zbGljZSgwLCAyNSl9YCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnRzO1xuICB9XG5cbiAgLyoqIHNvcnQgJiBmaWx0ZXIgZGF0ZVRpbWVGb3JtYXRQYXJ0ICovXG4gIHNvcnREYXRlVGltZUZvcm1hdFBhcnQocGFydHM6IERhdGVUaW1lRm9ybWF0UGFydFtdKTogRGF0ZVRpbWVGb3JtYXRQYXJ0W10ge1xuICAgIGxldCByZXN1bHQ6IERhdGVUaW1lRm9ybWF0UGFydFtdID0gW107XG4gICAgY29uc3QgdHlwZUFycmF5ID0gW1xuICAgICAgXCJ5ZWFyXCIsXG4gICAgICBcIm1vbnRoXCIsXG4gICAgICBcImRheVwiLFxuICAgICAgXCJob3VyXCIsXG4gICAgICBcIm1pbnV0ZVwiLFxuICAgICAgXCJzZWNvbmRcIixcbiAgICAgIFwiZnJhY3Rpb25hbFNlY29uZFwiLFxuICAgIF07XG4gICAgZm9yIChjb25zdCB0eXBlIG9mIHR5cGVBcnJheSkge1xuICAgICAgY29uc3QgY3VycmVudCA9IHBhcnRzLmZpbmRJbmRleCgoZWwpID0+IGVsLnR5cGUgPT09IHR5cGUpO1xuICAgICAgaWYgKGN1cnJlbnQgIT09IC0xKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQocGFydHMuc3BsaWNlKGN1cnJlbnQsIDEpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChwYXJ0cyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHBhcnRzVG9EYXRlKHBhcnRzOiBEYXRlVGltZUZvcm1hdFBhcnRbXSk6IERhdGUge1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIGNvbnN0IHV0YyA9IHBhcnRzLmZpbmQoXG4gICAgICAocGFydCkgPT4gcGFydC50eXBlID09PSBcInRpbWVab25lTmFtZVwiICYmIHBhcnQudmFsdWUgPT09IFwiVVRDXCIsXG4gICAgKTtcblxuICAgIGNvbnN0IGRheVBhcnQgPSBwYXJ0cy5maW5kKChwYXJ0KSA9PiBwYXJ0LnR5cGUgPT09IFwiZGF5XCIpO1xuXG4gICAgdXRjID8gZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKSA6IGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gICAgZm9yIChjb25zdCBwYXJ0IG9mIHBhcnRzKSB7XG4gICAgICBzd2l0Y2ggKHBhcnQudHlwZSkge1xuICAgICAgICBjYXNlIFwieWVhclwiOiB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBOdW1iZXIocGFydC52YWx1ZS5wYWRTdGFydCg0LCBcIjIwXCIpKTtcbiAgICAgICAgICB1dGMgPyBkYXRlLnNldFVUQ0Z1bGxZZWFyKHZhbHVlKSA6IGRhdGUuc2V0RnVsbFllYXIodmFsdWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJtb250aFwiOiB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBOdW1iZXIocGFydC52YWx1ZSkgLSAxO1xuICAgICAgICAgIGlmIChkYXlQYXJ0KSB7XG4gICAgICAgICAgICB1dGNcbiAgICAgICAgICAgICAgPyBkYXRlLnNldFVUQ01vbnRoKHZhbHVlLCBOdW1iZXIoZGF5UGFydC52YWx1ZSkpXG4gICAgICAgICAgICAgIDogZGF0ZS5zZXRNb250aCh2YWx1ZSwgTnVtYmVyKGRheVBhcnQudmFsdWUpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXRjID8gZGF0ZS5zZXRVVENNb250aCh2YWx1ZSkgOiBkYXRlLnNldE1vbnRoKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcImRheVwiOiB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBOdW1iZXIocGFydC52YWx1ZSk7XG4gICAgICAgICAgdXRjID8gZGF0ZS5zZXRVVENEYXRlKHZhbHVlKSA6IGRhdGUuc2V0RGF0ZSh2YWx1ZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcImhvdXJcIjoge1xuICAgICAgICAgIGxldCB2YWx1ZSA9IE51bWJlcihwYXJ0LnZhbHVlKTtcbiAgICAgICAgICBjb25zdCBkYXlQZXJpb2QgPSBwYXJ0cy5maW5kKFxuICAgICAgICAgICAgKHBhcnQ6IERhdGVUaW1lRm9ybWF0UGFydCkgPT4gcGFydC50eXBlID09PSBcImRheVBlcmlvZFwiLFxuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKGRheVBlcmlvZD8udmFsdWUgPT09IFwiUE1cIikgdmFsdWUgKz0gMTI7XG4gICAgICAgICAgdXRjID8gZGF0ZS5zZXRVVENIb3Vycyh2YWx1ZSkgOiBkYXRlLnNldEhvdXJzKHZhbHVlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwibWludXRlXCI6IHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IE51bWJlcihwYXJ0LnZhbHVlKTtcbiAgICAgICAgICB1dGMgPyBkYXRlLnNldFVUQ01pbnV0ZXModmFsdWUpIDogZGF0ZS5zZXRNaW51dGVzKHZhbHVlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwic2Vjb25kXCI6IHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IE51bWJlcihwYXJ0LnZhbHVlKTtcbiAgICAgICAgICB1dGMgPyBkYXRlLnNldFVUQ1NlY29uZHModmFsdWUpIDogZGF0ZS5zZXRTZWNvbmRzKHZhbHVlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiZnJhY3Rpb25hbFNlY29uZFwiOiB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBOdW1iZXIocGFydC52YWx1ZSk7XG4gICAgICAgICAgdXRjID8gZGF0ZS5zZXRVVENNaWxsaXNlY29uZHModmFsdWUpIDogZGF0ZS5zZXRNaWxsaXNlY29uZHModmFsdWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRlO1xuICB9XG5cbiAgcGFyc2Uoc3RyaW5nOiBzdHJpbmcpOiBEYXRlIHtcbiAgICBjb25zdCBwYXJ0cyA9IHRoaXMucGFyc2VUb1BhcnRzKHN0cmluZyk7XG4gICAgY29uc3Qgc29ydFBhcnRzID0gdGhpcy5zb3J0RGF0ZVRpbWVGb3JtYXRQYXJ0KHBhcnRzKTtcbiAgICByZXR1cm4gdGhpcy5wYXJ0c1RvRGF0ZShzb3J0UGFydHMpO1xuICB9XG59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
// denoCacheMetadata=3193787342427382131,12999861985211232988