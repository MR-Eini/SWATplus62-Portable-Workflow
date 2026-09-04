// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
export const map = {
  tag: "tag:yaml.org,2002:map",
  resolve () {
    return true;
  },
  construct (data) {
    return data !== null ? data : {};
  },
  kind: "mapping"
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8xLjAuNS9fdHlwZS9tYXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9ydGVkIGZyb20ganMteWFtbCB2My4xMy4xOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVjYS9qcy15YW1sL2NvbW1pdC82NjVhYWRkYTQyMzQ5ZGNhZTg2OWYxMjA0MGQ5YjEwZWYxOGQxMmRhXG4vLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHR5cGUgeyBUeXBlIH0gZnJvbSBcIi4uL190eXBlLnRzXCI7XG5cbmV4cG9ydCBjb25zdCBtYXA6IFR5cGU8XCJtYXBwaW5nXCIsIHVua25vd24+ID0ge1xuICB0YWc6IFwidGFnOnlhbWwub3JnLDIwMDI6bWFwXCIsXG4gIHJlc29sdmUoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGNvbnN0cnVjdChkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEgIT09IG51bGwgPyBkYXRhIDoge307XG4gIH0sXG4gIGtpbmQ6IFwibWFwcGluZ1wiLFxufTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0Isb0ZBQW9GO0FBQ3BGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFJMUUsT0FBTyxNQUFNLE1BQWdDO0VBQzNDLEtBQUs7RUFDTDtJQUNFLE9BQU87RUFDVDtFQUNBLFdBQVUsSUFBSTtJQUNaLE9BQU8sU0FBUyxPQUFPLE9BQU8sQ0FBQztFQUNqQztFQUNBLE1BQU07QUFDUixFQUFFIn0=
// denoCacheMetadata=10669112817071038168,6826838085207992715