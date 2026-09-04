// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
export const nil = {
  tag: "tag:yaml.org,2002:null",
  kind: "scalar",
  defaultStyle: "lowercase",
  predicate: (object)=>object === null,
  construct: ()=>null,
  resolve: (data)=>{
    return data === "~" || data === "null" || data === "Null" || data === "NULL";
  },
  represent: {
    lowercase: ()=>"null",
    uppercase: ()=>"NULL",
    camelcase: ()=>"Null"
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8xLjAuNS9fdHlwZS9uaWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9ydGVkIGZyb20ganMteWFtbCB2My4xMy4xOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVjYS9qcy15YW1sL2NvbW1pdC82NjVhYWRkYTQyMzQ5ZGNhZTg2OWYxMjA0MGQ5YjEwZWYxOGQxMmRhXG4vLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHR5cGUgeyBUeXBlIH0gZnJvbSBcIi4uL190eXBlLnRzXCI7XG5cbmV4cG9ydCBjb25zdCBuaWw6IFR5cGU8XCJzY2FsYXJcIiwgbnVsbD4gPSB7XG4gIHRhZzogXCJ0YWc6eWFtbC5vcmcsMjAwMjpudWxsXCIsXG4gIGtpbmQ6IFwic2NhbGFyXCIsXG4gIGRlZmF1bHRTdHlsZTogXCJsb3dlcmNhc2VcIixcbiAgcHJlZGljYXRlOiAob2JqZWN0OiB1bmtub3duKTogb2JqZWN0IGlzIG51bGwgPT4gb2JqZWN0ID09PSBudWxsLFxuICBjb25zdHJ1Y3Q6ICgpID0+IG51bGwsXG4gIHJlc29sdmU6IChkYXRhOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgZGF0YSA9PT0gXCJ+XCIgfHxcbiAgICAgIGRhdGEgPT09IFwibnVsbFwiIHx8XG4gICAgICBkYXRhID09PSBcIk51bGxcIiB8fFxuICAgICAgZGF0YSA9PT0gXCJOVUxMXCJcbiAgICApO1xuICB9LFxuICByZXByZXNlbnQ6IHtcbiAgICBsb3dlcmNhc2U6ICgpOiBzdHJpbmcgPT4gXCJudWxsXCIsXG4gICAgdXBwZXJjYXNlOiAoKTogc3RyaW5nID0+IFwiTlVMTFwiLFxuICAgIGNhbWVsY2FzZTogKCk6IHN0cmluZyA9PiBcIk51bGxcIixcbiAgfSxcbn07XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBSTFFLE9BQU8sTUFBTSxNQUE0QjtFQUN2QyxLQUFLO0VBQ0wsTUFBTTtFQUNOLGNBQWM7RUFDZCxXQUFXLENBQUMsU0FBb0MsV0FBVztFQUMzRCxXQUFXLElBQU07RUFDakIsU0FBUyxDQUFDO0lBQ1IsT0FDRSxTQUFTLE9BQ1QsU0FBUyxVQUNULFNBQVMsVUFDVCxTQUFTO0VBRWI7RUFDQSxXQUFXO0lBQ1QsV0FBVyxJQUFjO0lBQ3pCLFdBQVcsSUFBYztJQUN6QixXQUFXLElBQWM7RUFDM0I7QUFDRixFQUFFIn0=
// denoCacheMetadata=11820395435698802214,13395824755106551493