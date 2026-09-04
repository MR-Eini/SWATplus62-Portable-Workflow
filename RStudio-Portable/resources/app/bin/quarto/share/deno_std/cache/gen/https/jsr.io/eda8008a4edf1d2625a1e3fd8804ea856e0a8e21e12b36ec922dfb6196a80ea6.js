// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import db from "./vendor/mime-db.v1.52.0.ts";
/** A map of the media type for a given extension */ export const types = new Map();
/** A map of extensions for a given media type. */ const extensions = new Map();
/** Internal function to populate the maps based on the Mime DB. */ const preference = [
  "nginx",
  "apache",
  undefined,
  "iana"
];
for (const type of Object.keys(db)){
  const mime = db[type];
  const exts = mime.extensions;
  if (!exts || !exts.length) {
    continue;
  }
  // @ts-ignore Work around https://github.com/denoland/dnt/issues/148
  extensions.set(type, exts);
  for (const ext of exts){
    const current = types.get(ext);
    if (current) {
      const from = preference.indexOf(db[current].source);
      const to = preference.indexOf(mime.source);
      if (current !== "application/octet-stream" && (from > to || // @ts-ignore work around https://github.com/denoland/dnt/issues/148
      from === to && current.startsWith("application/"))) {
        continue;
      }
    }
    types.set(ext, type);
  }
}
export { db, extensions };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMC4yMjQuMS9fZGIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCBkYiBmcm9tIFwiLi92ZW5kb3IvbWltZS1kYi52MS41Mi4wLnRzXCI7XG5pbXBvcnQgdHlwZSB7IERCRW50cnkgfSBmcm9tIFwiLi9fdXRpbC50c1wiO1xuXG5leHBvcnQgdHlwZSBLZXlPZkRiID0ga2V5b2YgdHlwZW9mIGRiO1xuXG4vKiogQSBtYXAgb2YgdGhlIG1lZGlhIHR5cGUgZm9yIGEgZ2l2ZW4gZXh0ZW5zaW9uICovXG5leHBvcnQgY29uc3QgdHlwZXMgPSBuZXcgTWFwPHN0cmluZywgS2V5T2ZEYj4oKTtcblxuLyoqIEEgbWFwIG9mIGV4dGVuc2lvbnMgZm9yIGEgZ2l2ZW4gbWVkaWEgdHlwZS4gKi9cbmNvbnN0IGV4dGVuc2lvbnM6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPiA9IG5ldyBNYXAoKTtcblxuLyoqIEludGVybmFsIGZ1bmN0aW9uIHRvIHBvcHVsYXRlIHRoZSBtYXBzIGJhc2VkIG9uIHRoZSBNaW1lIERCLiAqL1xuY29uc3QgcHJlZmVyZW5jZSA9IFtcIm5naW54XCIsIFwiYXBhY2hlXCIsIHVuZGVmaW5lZCwgXCJpYW5hXCJdO1xuXG5mb3IgKGNvbnN0IHR5cGUgb2YgT2JqZWN0LmtleXMoZGIpIGFzIEtleU9mRGJbXSkge1xuICBjb25zdCBtaW1lID0gZGJbdHlwZV0gYXMgREJFbnRyeTtcbiAgY29uc3QgZXh0cyA9IG1pbWUuZXh0ZW5zaW9ucztcblxuICBpZiAoIWV4dHMgfHwgIWV4dHMubGVuZ3RoKSB7XG4gICAgY29udGludWU7XG4gIH1cblxuICAvLyBAdHMtaWdub3JlIFdvcmsgYXJvdW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9kZW5vbGFuZC9kbnQvaXNzdWVzLzE0OFxuICBleHRlbnNpb25zLnNldCh0eXBlLCBleHRzKTtcblxuICBmb3IgKGNvbnN0IGV4dCBvZiBleHRzKSB7XG4gICAgY29uc3QgY3VycmVudCA9IHR5cGVzLmdldChleHQpO1xuICAgIGlmIChjdXJyZW50KSB7XG4gICAgICBjb25zdCBmcm9tID0gcHJlZmVyZW5jZS5pbmRleE9mKChkYltjdXJyZW50XSBhcyBEQkVudHJ5KS5zb3VyY2UpO1xuICAgICAgY29uc3QgdG8gPSBwcmVmZXJlbmNlLmluZGV4T2YobWltZS5zb3VyY2UpO1xuXG4gICAgICBpZiAoXG4gICAgICAgIGN1cnJlbnQgIT09IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIgJiZcbiAgICAgICAgKGZyb20gPiB0byB8fFxuICAgICAgICAgIC8vIEB0cy1pZ25vcmUgd29yayBhcm91bmQgaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2RudC9pc3N1ZXMvMTQ4XG4gICAgICAgICAgKGZyb20gPT09IHRvICYmIGN1cnJlbnQuc3RhcnRzV2l0aChcImFwcGxpY2F0aW9uL1wiKSkpXG4gICAgICApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHlwZXMuc2V0KGV4dCwgdHlwZSk7XG4gIH1cbn1cblxuZXhwb3J0IHsgZGIsIGV4dGVuc2lvbnMgfTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsT0FBTyxRQUFRLDhCQUE4QjtBQUs3QyxrREFBa0QsR0FDbEQsT0FBTyxNQUFNLFFBQVEsSUFBSSxNQUF1QjtBQUVoRCxnREFBZ0QsR0FDaEQsTUFBTSxhQUFvQyxJQUFJO0FBRTlDLGlFQUFpRSxHQUNqRSxNQUFNLGFBQWE7RUFBQztFQUFTO0VBQVU7RUFBVztDQUFPO0FBRXpELEtBQUssTUFBTSxRQUFRLE9BQU8sSUFBSSxDQUFDLElBQWtCO0VBQy9DLE1BQU0sT0FBTyxFQUFFLENBQUMsS0FBSztFQUNyQixNQUFNLE9BQU8sS0FBSyxVQUFVO0VBRTVCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxNQUFNLEVBQUU7SUFDekI7RUFDRjtFQUVBLG9FQUFvRTtFQUNwRSxXQUFXLEdBQUcsQ0FBQyxNQUFNO0VBRXJCLEtBQUssTUFBTSxPQUFPLEtBQU07SUFDdEIsTUFBTSxVQUFVLE1BQU0sR0FBRyxDQUFDO0lBQzFCLElBQUksU0FBUztNQUNYLE1BQU0sT0FBTyxXQUFXLE9BQU8sQ0FBQyxBQUFDLEVBQUUsQ0FBQyxRQUFRLENBQWEsTUFBTTtNQUMvRCxNQUFNLEtBQUssV0FBVyxPQUFPLENBQUMsS0FBSyxNQUFNO01BRXpDLElBQ0UsWUFBWSw4QkFDWixDQUFDLE9BQU8sTUFDTixvRUFBb0U7TUFDbkUsU0FBUyxNQUFNLFFBQVEsVUFBVSxDQUFDLGVBQWdCLEdBQ3JEO1FBQ0E7TUFDRjtJQUNGO0lBRUEsTUFBTSxHQUFHLENBQUMsS0FBSztFQUNqQjtBQUNGO0FBRUEsU0FBUyxFQUFFLEVBQUUsVUFBVSxHQUFHIn0=
// denoCacheMetadata=13798542451098583986,3054868341700620908