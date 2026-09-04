// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import db from "./vendor/db.ts";
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
      if (current !== "application/octet-stream" && current !== "application/mp4" && (from > to || // @ts-ignore work around https://github.com/denoland/dnt/issues/148
      from === to && current.startsWith("application/"))) {
        continue;
      }
    }
    types.set(ext, type);
  }
}
export { db, extensions };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbWVkaWEtdHlwZXMvMS4wLjMvX2RiLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgZGIgZnJvbSBcIi4vdmVuZG9yL2RiLnRzXCI7XG5pbXBvcnQgdHlwZSB7IERCRW50cnkgfSBmcm9tIFwiLi9fdXRpbC50c1wiO1xuXG5leHBvcnQgdHlwZSBLZXlPZkRiID0ga2V5b2YgdHlwZW9mIGRiO1xuXG4vKiogQSBtYXAgb2YgdGhlIG1lZGlhIHR5cGUgZm9yIGEgZ2l2ZW4gZXh0ZW5zaW9uICovXG5leHBvcnQgY29uc3QgdHlwZXMgPSBuZXcgTWFwPHN0cmluZywgS2V5T2ZEYj4oKTtcblxuLyoqIEEgbWFwIG9mIGV4dGVuc2lvbnMgZm9yIGEgZ2l2ZW4gbWVkaWEgdHlwZS4gKi9cbmNvbnN0IGV4dGVuc2lvbnM6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPiA9IG5ldyBNYXAoKTtcblxuLyoqIEludGVybmFsIGZ1bmN0aW9uIHRvIHBvcHVsYXRlIHRoZSBtYXBzIGJhc2VkIG9uIHRoZSBNaW1lIERCLiAqL1xuY29uc3QgcHJlZmVyZW5jZSA9IFtcIm5naW54XCIsIFwiYXBhY2hlXCIsIHVuZGVmaW5lZCwgXCJpYW5hXCJdO1xuXG5mb3IgKGNvbnN0IHR5cGUgb2YgT2JqZWN0LmtleXMoZGIpIGFzIEtleU9mRGJbXSkge1xuICBjb25zdCBtaW1lID0gZGJbdHlwZV0gYXMgREJFbnRyeTtcbiAgY29uc3QgZXh0cyA9IG1pbWUuZXh0ZW5zaW9ucztcblxuICBpZiAoIWV4dHMgfHwgIWV4dHMubGVuZ3RoKSB7XG4gICAgY29udGludWU7XG4gIH1cblxuICAvLyBAdHMtaWdub3JlIFdvcmsgYXJvdW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9kZW5vbGFuZC9kbnQvaXNzdWVzLzE0OFxuICBleHRlbnNpb25zLnNldCh0eXBlLCBleHRzKTtcblxuICBmb3IgKGNvbnN0IGV4dCBvZiBleHRzKSB7XG4gICAgY29uc3QgY3VycmVudCA9IHR5cGVzLmdldChleHQpO1xuICAgIGlmIChjdXJyZW50KSB7XG4gICAgICBjb25zdCBmcm9tID0gcHJlZmVyZW5jZS5pbmRleE9mKChkYltjdXJyZW50XSBhcyBEQkVudHJ5KS5zb3VyY2UpO1xuICAgICAgY29uc3QgdG8gPSBwcmVmZXJlbmNlLmluZGV4T2YobWltZS5zb3VyY2UpO1xuXG4gICAgICBpZiAoXG4gICAgICAgIGN1cnJlbnQgIT09IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIgJiZcbiAgICAgICAgY3VycmVudCAhPT0gXCJhcHBsaWNhdGlvbi9tcDRcIiAmJlxuICAgICAgICAoZnJvbSA+IHRvIHx8XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZSB3b3JrIGFyb3VuZCBodHRwczovL2dpdGh1Yi5jb20vZGVub2xhbmQvZG50L2lzc3Vlcy8xNDhcbiAgICAgICAgICAoZnJvbSA9PT0gdG8gJiYgY3VycmVudC5zdGFydHNXaXRoKFwiYXBwbGljYXRpb24vXCIpKSlcbiAgICAgICkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0eXBlcy5zZXQoZXh0LCB0eXBlKTtcbiAgfVxufVxuXG5leHBvcnQgeyBkYiwgZXh0ZW5zaW9ucyB9O1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxPQUFPLFFBQVEsaUJBQWlCO0FBS2hDLGtEQUFrRCxHQUNsRCxPQUFPLE1BQU0sUUFBUSxJQUFJLE1BQXVCO0FBRWhELGdEQUFnRCxHQUNoRCxNQUFNLGFBQW9DLElBQUk7QUFFOUMsaUVBQWlFLEdBQ2pFLE1BQU0sYUFBYTtFQUFDO0VBQVM7RUFBVTtFQUFXO0NBQU87QUFFekQsS0FBSyxNQUFNLFFBQVEsT0FBTyxJQUFJLENBQUMsSUFBa0I7RUFDL0MsTUFBTSxPQUFPLEVBQUUsQ0FBQyxLQUFLO0VBQ3JCLE1BQU0sT0FBTyxLQUFLLFVBQVU7RUFFNUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLE1BQU0sRUFBRTtJQUN6QjtFQUNGO0VBRUEsb0VBQW9FO0VBQ3BFLFdBQVcsR0FBRyxDQUFDLE1BQU07RUFFckIsS0FBSyxNQUFNLE9BQU8sS0FBTTtJQUN0QixNQUFNLFVBQVUsTUFBTSxHQUFHLENBQUM7SUFDMUIsSUFBSSxTQUFTO01BQ1gsTUFBTSxPQUFPLFdBQVcsT0FBTyxDQUFDLEFBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBYSxNQUFNO01BQy9ELE1BQU0sS0FBSyxXQUFXLE9BQU8sQ0FBQyxLQUFLLE1BQU07TUFFekMsSUFDRSxZQUFZLDhCQUNaLFlBQVkscUJBQ1osQ0FBQyxPQUFPLE1BQ04sb0VBQW9FO01BQ25FLFNBQVMsTUFBTSxRQUFRLFVBQVUsQ0FBQyxlQUFnQixHQUNyRDtRQUNBO01BQ0Y7SUFDRjtJQUVBLE1BQU0sR0FBRyxDQUFDLEtBQUs7RUFDakI7QUFDRjtBQUVBLFNBQVMsRUFBRSxFQUFFLFVBQVUsR0FBRyJ9
// denoCacheMetadata=17593220718693179541,6506100964850654893