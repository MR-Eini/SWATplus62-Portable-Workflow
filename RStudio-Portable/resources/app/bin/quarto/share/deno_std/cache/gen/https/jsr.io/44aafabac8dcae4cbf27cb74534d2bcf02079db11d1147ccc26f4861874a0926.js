// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/*!
 * Adapted directly from negotiator at https://github.com/jshttp/negotiator/
 * which is licensed as follows:
 *
 * (The MIT License)
 *
 * Copyright (c) 2012-2014 Federico Romero
 * Copyright (c) 2012-2014 Isaac Z. Schlueter
 * Copyright (c) 2014-2015 Douglas Christopher Wilson
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */ import { compareSpecs, isQuality } from "./common.ts";
const simpleEncodingRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;
function parseEncoding(str, i) {
  const match = simpleEncodingRegExp.exec(str);
  if (!match) {
    return undefined;
  }
  const encoding = match[1];
  let q = 1;
  if (match[2]) {
    const params = match[2].split(";");
    for (const param of params){
      const p = param.trim().split("=");
      if (p[0] === "q" && p[1]) {
        q = parseFloat(p[1]);
        break;
      }
    }
  }
  return {
    encoding,
    q,
    i
  };
}
function specify(encoding, spec, i = -1) {
  if (!spec.encoding) {
    return;
  }
  let s = 0;
  if (spec.encoding.toLocaleLowerCase() === encoding.toLocaleLowerCase()) {
    s = 1;
  } else if (spec.encoding !== "*") {
    return;
  }
  return {
    i,
    o: spec.i,
    q: spec.q,
    s
  };
}
function parseAcceptEncoding(accept) {
  const accepts = accept.split(",");
  const parsedAccepts = [];
  let hasIdentity = false;
  let minQuality = 1;
  for (const [i, accept] of accepts.entries()){
    const encoding = parseEncoding(accept.trim(), i);
    if (encoding) {
      parsedAccepts.push(encoding);
      hasIdentity = hasIdentity || !!specify("identity", encoding);
      minQuality = Math.min(minQuality, encoding.q || 1);
    }
  }
  if (!hasIdentity) {
    parsedAccepts.push({
      encoding: "identity",
      q: minQuality,
      i: accepts.length - 1
    });
  }
  return parsedAccepts;
}
function getEncodingPriority(encoding, accepted, index) {
  let priority = {
    o: -1,
    q: 0,
    s: 0,
    i: 0
  };
  for (const s of accepted){
    const spec = specify(encoding, s, index);
    if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
      priority = spec;
    }
  }
  return priority;
}
/** Given an `Accept-Encoding` string, parse out the encoding returning a
 * negotiated encoding based on the `provided` encodings otherwise just a
 * prioritized array of encodings. */ export function preferredEncodings(accept, provided) {
  const accepts = parseAcceptEncoding(accept);
  if (!provided) {
    return accepts.filter(isQuality).sort(compareSpecs).map((spec)=>spec.encoding);
  }
  const priorities = provided.map((type, index)=>getEncodingPriority(type, accepts, index));
  return priorities.filter(isQuality).sort(compareSpecs).map((priority)=>provided[priorities.indexOf(priority)]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaHR0cC8wLjIyNC41L19uZWdvdGlhdGlvbi9lbmNvZGluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLyohXG4gKiBBZGFwdGVkIGRpcmVjdGx5IGZyb20gbmVnb3RpYXRvciBhdCBodHRwczovL2dpdGh1Yi5jb20vanNodHRwL25lZ290aWF0b3IvXG4gKiB3aGljaCBpcyBsaWNlbnNlZCBhcyBmb2xsb3dzOlxuICpcbiAqIChUaGUgTUlUIExpY2Vuc2UpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyLTIwMTQgRmVkZXJpY28gUm9tZXJvXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTItMjAxNCBJc2FhYyBaLiBTY2hsdWV0ZXJcbiAqIENvcHlyaWdodCAoYykgMjAxNC0yMDE1IERvdWdsYXMgQ2hyaXN0b3BoZXIgV2lsc29uXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXG4gKiBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbiAqICdTb2Z0d2FyZScpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbiAqIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbiAqIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xuICogcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG4gKiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbiAqIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuICogRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4gKiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuXG4gKiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWVxuICogQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCxcbiAqIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFXG4gKiBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG5pbXBvcnQgeyBjb21wYXJlU3BlY3MsIGlzUXVhbGl0eSwgdHlwZSBTcGVjaWZpY2l0eSB9IGZyb20gXCIuL2NvbW1vbi50c1wiO1xuXG5pbnRlcmZhY2UgRW5jb2RpbmdTcGVjaWZpY2l0eSBleHRlbmRzIFNwZWNpZmljaXR5IHtcbiAgZW5jb2Rpbmc/OiBzdHJpbmc7XG59XG5cbmNvbnN0IHNpbXBsZUVuY29kaW5nUmVnRXhwID0gL15cXHMqKFteXFxzO10rKVxccyooPzo7KC4qKSk/JC87XG5cbmZ1bmN0aW9uIHBhcnNlRW5jb2RpbmcoXG4gIHN0cjogc3RyaW5nLFxuICBpOiBudW1iZXIsXG4pOiBFbmNvZGluZ1NwZWNpZmljaXR5IHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgbWF0Y2ggPSBzaW1wbGVFbmNvZGluZ1JlZ0V4cC5leGVjKHN0cik7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgY29uc3QgZW5jb2RpbmcgPSBtYXRjaFsxXTtcbiAgbGV0IHEgPSAxO1xuICBpZiAobWF0Y2hbMl0pIHtcbiAgICBjb25zdCBwYXJhbXMgPSBtYXRjaFsyXS5zcGxpdChcIjtcIik7XG4gICAgZm9yIChjb25zdCBwYXJhbSBvZiBwYXJhbXMpIHtcbiAgICAgIGNvbnN0IHAgPSBwYXJhbS50cmltKCkuc3BsaXQoXCI9XCIpO1xuICAgICAgaWYgKHBbMF0gPT09IFwicVwiICYmIHBbMV0pIHtcbiAgICAgICAgcSA9IHBhcnNlRmxvYXQocFsxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IGVuY29kaW5nLCBxLCBpIH07XG59XG5cbmZ1bmN0aW9uIHNwZWNpZnkoXG4gIGVuY29kaW5nOiBzdHJpbmcsXG4gIHNwZWM6IEVuY29kaW5nU3BlY2lmaWNpdHksXG4gIGkgPSAtMSxcbik6IFNwZWNpZmljaXR5IHwgdW5kZWZpbmVkIHtcbiAgaWYgKCFzcGVjLmVuY29kaW5nKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCBzID0gMDtcbiAgaWYgKHNwZWMuZW5jb2RpbmcudG9Mb2NhbGVMb3dlckNhc2UoKSA9PT0gZW5jb2RpbmcudG9Mb2NhbGVMb3dlckNhc2UoKSkge1xuICAgIHMgPSAxO1xuICB9IGVsc2UgaWYgKHNwZWMuZW5jb2RpbmcgIT09IFwiKlwiKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpLFxuICAgIG86IHNwZWMuaSxcbiAgICBxOiBzcGVjLnEsXG4gICAgcyxcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2VBY2NlcHRFbmNvZGluZyhhY2NlcHQ6IHN0cmluZyk6IEVuY29kaW5nU3BlY2lmaWNpdHlbXSB7XG4gIGNvbnN0IGFjY2VwdHMgPSBhY2NlcHQuc3BsaXQoXCIsXCIpO1xuICBjb25zdCBwYXJzZWRBY2NlcHRzOiBFbmNvZGluZ1NwZWNpZmljaXR5W10gPSBbXTtcbiAgbGV0IGhhc0lkZW50aXR5ID0gZmFsc2U7XG4gIGxldCBtaW5RdWFsaXR5ID0gMTtcblxuICBmb3IgKGNvbnN0IFtpLCBhY2NlcHRdIG9mIGFjY2VwdHMuZW50cmllcygpKSB7XG4gICAgY29uc3QgZW5jb2RpbmcgPSBwYXJzZUVuY29kaW5nKGFjY2VwdC50cmltKCksIGkpO1xuXG4gICAgaWYgKGVuY29kaW5nKSB7XG4gICAgICBwYXJzZWRBY2NlcHRzLnB1c2goZW5jb2RpbmcpO1xuICAgICAgaGFzSWRlbnRpdHkgPSBoYXNJZGVudGl0eSB8fCAhIXNwZWNpZnkoXCJpZGVudGl0eVwiLCBlbmNvZGluZyk7XG4gICAgICBtaW5RdWFsaXR5ID0gTWF0aC5taW4obWluUXVhbGl0eSwgZW5jb2RpbmcucSB8fCAxKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhhc0lkZW50aXR5KSB7XG4gICAgcGFyc2VkQWNjZXB0cy5wdXNoKHtcbiAgICAgIGVuY29kaW5nOiBcImlkZW50aXR5XCIsXG4gICAgICBxOiBtaW5RdWFsaXR5LFxuICAgICAgaTogYWNjZXB0cy5sZW5ndGggLSAxLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHBhcnNlZEFjY2VwdHM7XG59XG5cbmZ1bmN0aW9uIGdldEVuY29kaW5nUHJpb3JpdHkoXG4gIGVuY29kaW5nOiBzdHJpbmcsXG4gIGFjY2VwdGVkOiBTcGVjaWZpY2l0eVtdLFxuICBpbmRleDogbnVtYmVyLFxuKTogU3BlY2lmaWNpdHkge1xuICBsZXQgcHJpb3JpdHk6IFNwZWNpZmljaXR5ID0geyBvOiAtMSwgcTogMCwgczogMCwgaTogMCB9O1xuXG4gIGZvciAoY29uc3QgcyBvZiBhY2NlcHRlZCkge1xuICAgIGNvbnN0IHNwZWMgPSBzcGVjaWZ5KGVuY29kaW5nLCBzLCBpbmRleCk7XG5cbiAgICBpZiAoXG4gICAgICBzcGVjICYmXG4gICAgICAocHJpb3JpdHkucyEgLSBzcGVjLnMhIHx8IHByaW9yaXR5LnEgLSBzcGVjLnEgfHxcbiAgICAgICAgICBwcmlvcml0eS5vISAtIHNwZWMubyEpIDxcbiAgICAgICAgMFxuICAgICkge1xuICAgICAgcHJpb3JpdHkgPSBzcGVjO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwcmlvcml0eTtcbn1cblxuLyoqIEdpdmVuIGFuIGBBY2NlcHQtRW5jb2RpbmdgIHN0cmluZywgcGFyc2Ugb3V0IHRoZSBlbmNvZGluZyByZXR1cm5pbmcgYVxuICogbmVnb3RpYXRlZCBlbmNvZGluZyBiYXNlZCBvbiB0aGUgYHByb3ZpZGVkYCBlbmNvZGluZ3Mgb3RoZXJ3aXNlIGp1c3QgYVxuICogcHJpb3JpdGl6ZWQgYXJyYXkgb2YgZW5jb2RpbmdzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZWZlcnJlZEVuY29kaW5ncyhcbiAgYWNjZXB0OiBzdHJpbmcsXG4gIHByb3ZpZGVkPzogc3RyaW5nW10sXG4pOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGFjY2VwdHMgPSBwYXJzZUFjY2VwdEVuY29kaW5nKGFjY2VwdCk7XG5cbiAgaWYgKCFwcm92aWRlZCkge1xuICAgIHJldHVybiBhY2NlcHRzXG4gICAgICAuZmlsdGVyKGlzUXVhbGl0eSlcbiAgICAgIC5zb3J0KGNvbXBhcmVTcGVjcylcbiAgICAgIC5tYXAoKHNwZWMpID0+IHNwZWMuZW5jb2RpbmchKTtcbiAgfVxuXG4gIGNvbnN0IHByaW9yaXRpZXMgPSBwcm92aWRlZC5tYXAoKHR5cGUsIGluZGV4KSA9PlxuICAgIGdldEVuY29kaW5nUHJpb3JpdHkodHlwZSwgYWNjZXB0cywgaW5kZXgpXG4gICk7XG5cbiAgcmV0dXJuIHByaW9yaXRpZXNcbiAgICAuZmlsdGVyKGlzUXVhbGl0eSlcbiAgICAuc29ydChjb21wYXJlU3BlY3MpXG4gICAgLm1hcCgocHJpb3JpdHkpID0+IHByb3ZpZGVkW3ByaW9yaXRpZXMuaW5kZXhPZihwcmlvcml0eSldISk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNEJDLEdBRUQsU0FBUyxZQUFZLEVBQUUsU0FBUyxRQUEwQixjQUFjO0FBTXhFLE1BQU0sdUJBQXVCO0FBRTdCLFNBQVMsY0FDUCxHQUFXLEVBQ1gsQ0FBUztFQUVULE1BQU0sUUFBUSxxQkFBcUIsSUFBSSxDQUFDO0VBQ3hDLElBQUksQ0FBQyxPQUFPO0lBQ1YsT0FBTztFQUNUO0VBRUEsTUFBTSxXQUFXLEtBQUssQ0FBQyxFQUFFO0VBQ3pCLElBQUksSUFBSTtFQUNSLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtJQUNaLE1BQU0sU0FBUyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztJQUM5QixLQUFLLE1BQU0sU0FBUyxPQUFRO01BQzFCLE1BQU0sSUFBSSxNQUFNLElBQUksR0FBRyxLQUFLLENBQUM7TUFDN0IsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUN4QixJQUFJLFdBQVcsQ0FBQyxDQUFDLEVBQUU7UUFDbkI7TUFDRjtJQUNGO0VBQ0Y7RUFFQSxPQUFPO0lBQUU7SUFBVTtJQUFHO0VBQUU7QUFDMUI7QUFFQSxTQUFTLFFBQ1AsUUFBZ0IsRUFDaEIsSUFBeUIsRUFDekIsSUFBSSxDQUFDLENBQUM7RUFFTixJQUFJLENBQUMsS0FBSyxRQUFRLEVBQUU7SUFDbEI7RUFDRjtFQUNBLElBQUksSUFBSTtFQUNSLElBQUksS0FBSyxRQUFRLENBQUMsaUJBQWlCLE9BQU8sU0FBUyxpQkFBaUIsSUFBSTtJQUN0RSxJQUFJO0VBQ04sT0FBTyxJQUFJLEtBQUssUUFBUSxLQUFLLEtBQUs7SUFDaEM7RUFDRjtFQUVBLE9BQU87SUFDTDtJQUNBLEdBQUcsS0FBSyxDQUFDO0lBQ1QsR0FBRyxLQUFLLENBQUM7SUFDVDtFQUNGO0FBQ0Y7QUFFQSxTQUFTLG9CQUFvQixNQUFjO0VBQ3pDLE1BQU0sVUFBVSxPQUFPLEtBQUssQ0FBQztFQUM3QixNQUFNLGdCQUF1QyxFQUFFO0VBQy9DLElBQUksY0FBYztFQUNsQixJQUFJLGFBQWE7RUFFakIsS0FBSyxNQUFNLENBQUMsR0FBRyxPQUFPLElBQUksUUFBUSxPQUFPLEdBQUk7SUFDM0MsTUFBTSxXQUFXLGNBQWMsT0FBTyxJQUFJLElBQUk7SUFFOUMsSUFBSSxVQUFVO01BQ1osY0FBYyxJQUFJLENBQUM7TUFDbkIsY0FBYyxlQUFlLENBQUMsQ0FBQyxRQUFRLFlBQVk7TUFDbkQsYUFBYSxLQUFLLEdBQUcsQ0FBQyxZQUFZLFNBQVMsQ0FBQyxJQUFJO0lBQ2xEO0VBQ0Y7RUFFQSxJQUFJLENBQUMsYUFBYTtJQUNoQixjQUFjLElBQUksQ0FBQztNQUNqQixVQUFVO01BQ1YsR0FBRztNQUNILEdBQUcsUUFBUSxNQUFNLEdBQUc7SUFDdEI7RUFDRjtFQUVBLE9BQU87QUFDVDtBQUVBLFNBQVMsb0JBQ1AsUUFBZ0IsRUFDaEIsUUFBdUIsRUFDdkIsS0FBYTtFQUViLElBQUksV0FBd0I7SUFBRSxHQUFHLENBQUM7SUFBRyxHQUFHO0lBQUcsR0FBRztJQUFHLEdBQUc7RUFBRTtFQUV0RCxLQUFLLE1BQU0sS0FBSyxTQUFVO0lBQ3hCLE1BQU0sT0FBTyxRQUFRLFVBQVUsR0FBRztJQUVsQyxJQUNFLFFBQ0EsQ0FBQyxTQUFTLENBQUMsR0FBSSxLQUFLLENBQUMsSUFBSyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUMsSUFDekMsU0FBUyxDQUFDLEdBQUksS0FBSyxDQUFDLEFBQUMsSUFDdkIsR0FDRjtNQUNBLFdBQVc7SUFDYjtFQUNGO0VBRUEsT0FBTztBQUNUO0FBRUE7O21DQUVtQyxHQUNuQyxPQUFPLFNBQVMsbUJBQ2QsTUFBYyxFQUNkLFFBQW1CO0VBRW5CLE1BQU0sVUFBVSxvQkFBb0I7RUFFcEMsSUFBSSxDQUFDLFVBQVU7SUFDYixPQUFPLFFBQ0osTUFBTSxDQUFDLFdBQ1AsSUFBSSxDQUFDLGNBQ0wsR0FBRyxDQUFDLENBQUMsT0FBUyxLQUFLLFFBQVE7RUFDaEM7RUFFQSxNQUFNLGFBQWEsU0FBUyxHQUFHLENBQUMsQ0FBQyxNQUFNLFFBQ3JDLG9CQUFvQixNQUFNLFNBQVM7RUFHckMsT0FBTyxXQUNKLE1BQU0sQ0FBQyxXQUNQLElBQUksQ0FBQyxjQUNMLEdBQUcsQ0FBQyxDQUFDLFdBQWEsUUFBUSxDQUFDLFdBQVcsT0FBTyxDQUFDLFVBQVU7QUFDN0QifQ==
// denoCacheMetadata=6266085476853258518,8750151441402670617