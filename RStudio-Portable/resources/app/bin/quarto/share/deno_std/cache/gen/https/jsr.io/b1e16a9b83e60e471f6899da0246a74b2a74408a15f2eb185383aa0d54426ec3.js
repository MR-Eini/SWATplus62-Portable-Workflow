// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// Copyright the Browserify authors. MIT License.
// Ported from https://github.com/browserify/path-browserify/
// This module is browser compatible.
export function stripTrailingSeparators(segment, isSep) {
  if (segment.length <= 1) {
    return segment;
  }
  let end = segment.length;
  for(let i = segment.length - 1; i > 0; i--){
    if (isSep(segment.charCodeAt(i))) {
      end = i;
    } else {
      break;
    }
  }
  return segment.slice(0, end);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL19jb21tb24vc3RyaXBfdHJhaWxpbmdfc2VwYXJhdG9ycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IHRoZSBCcm93c2VyaWZ5IGF1dGhvcnMuIE1JVCBMaWNlbnNlLlxuLy8gUG9ydGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2Jyb3dzZXJpZnkvcGF0aC1icm93c2VyaWZ5L1xuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBUcmFpbGluZ1NlcGFyYXRvcnMoXG4gIHNlZ21lbnQ6IHN0cmluZyxcbiAgaXNTZXA6IChjaGFyOiBudW1iZXIpID0+IGJvb2xlYW4sXG4pOiBzdHJpbmcge1xuICBpZiAoc2VnbWVudC5sZW5ndGggPD0gMSkge1xuICAgIHJldHVybiBzZWdtZW50O1xuICB9XG5cbiAgbGV0IGVuZCA9IHNlZ21lbnQubGVuZ3RoO1xuXG4gIGZvciAobGV0IGkgPSBzZWdtZW50Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICBpZiAoaXNTZXAoc2VnbWVudC5jaGFyQ29kZUF0KGkpKSkge1xuICAgICAgZW5kID0gaTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNlZ21lbnQuc2xpY2UoMCwgZW5kKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsaURBQWlEO0FBQ2pELDZEQUE2RDtBQUM3RCxxQ0FBcUM7QUFFckMsT0FBTyxTQUFTLHdCQUNkLE9BQWUsRUFDZixLQUFnQztFQUVoQyxJQUFJLFFBQVEsTUFBTSxJQUFJLEdBQUc7SUFDdkIsT0FBTztFQUNUO0VBRUEsSUFBSSxNQUFNLFFBQVEsTUFBTTtFQUV4QixJQUFLLElBQUksSUFBSSxRQUFRLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxJQUFLO0lBQzNDLElBQUksTUFBTSxRQUFRLFVBQVUsQ0FBQyxLQUFLO01BQ2hDLE1BQU07SUFDUixPQUFPO01BQ0w7SUFDRjtFQUNGO0VBRUEsT0FBTyxRQUFRLEtBQUssQ0FBQyxHQUFHO0FBQzFCIn0=
// denoCacheMetadata=18218614858980422926,17328892427076882912