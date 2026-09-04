// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { YAMLError } from "./_error.ts";
function compileList(schema, name, result) {
  const exclude = [];
  for (const includedSchema of schema.include){
    result = compileList(includedSchema, name, result);
  }
  for (const currentType of schema[name]){
    for (const [previousIndex, previousType] of result.entries()){
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
        exclude.push(previousIndex);
      }
    }
    result.push(currentType);
  }
  return result.filter((_type, index)=>!exclude.includes(index));
}
function compileMap(...typesList) {
  const result = {
    fallback: {},
    mapping: {},
    scalar: {},
    sequence: {}
  };
  for (const types of typesList){
    for (const type of types){
      if (type.kind !== null) {
        result[type.kind][type.tag] = result["fallback"][type.tag] = type;
      }
    }
  }
  return result;
}
export class Schema {
  static SCHEMA_DEFAULT;
  implicit;
  explicit;
  include;
  compiledImplicit;
  compiledExplicit;
  compiledTypeMap;
  constructor(definition){
    this.explicit = definition.explicit || [];
    this.implicit = definition.implicit || [];
    this.include = definition.include || [];
    for (const type of this.implicit){
      if (type.loadKind && type.loadKind !== "scalar") {
        throw new YAMLError("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      }
    }
    this.compiledImplicit = compileList(this, "implicit", []);
    this.compiledExplicit = compileList(this, "explicit", []);
    this.compiledTypeMap = compileMap(this.compiledImplicit, this.compiledExplicit);
  }
  /* Returns a new extended schema from current schema */ extend(definition) {
    return new Schema({
      implicit: [
        ...new Set([
          ...this.implicit,
          ...definition?.implicit ?? []
        ])
      ],
      explicit: [
        ...new Set([
          ...this.explicit,
          ...definition?.explicit ?? []
        ])
      ],
      include: [
        ...new Set([
          ...this.include,
          ...definition?.include ?? []
        ])
      ]
    });
  }
  static create() {}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL3NjaGVtYS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb3J0ZWQgZnJvbSBqcy15YW1sIHYzLjEzLjE6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwvY29tbWl0LzY2NWFhZGRhNDIzNDlkY2FlODY5ZjEyMDQwZDliMTBlZjE4ZDEyZGFcbi8vIENvcHlyaWdodCAyMDExLTIwMTUgYnkgVml0YWx5IFB1enJpbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBZQU1MRXJyb3IgfSBmcm9tIFwiLi9fZXJyb3IudHNcIjtcbmltcG9ydCB0eXBlIHsgS2luZFR5cGUsIFR5cGUgfSBmcm9tIFwiLi90eXBlLnRzXCI7XG5pbXBvcnQgdHlwZSB7IEFueSwgQXJyYXlPYmplY3QgfSBmcm9tIFwiLi9fdXRpbHMudHNcIjtcblxuZnVuY3Rpb24gY29tcGlsZUxpc3QoXG4gIHNjaGVtYTogU2NoZW1hLFxuICBuYW1lOiBcImltcGxpY2l0XCIgfCBcImV4cGxpY2l0XCIsXG4gIHJlc3VsdDogVHlwZVtdLFxuKTogVHlwZVtdIHtcbiAgY29uc3QgZXhjbHVkZTogbnVtYmVyW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IGluY2x1ZGVkU2NoZW1hIG9mIHNjaGVtYS5pbmNsdWRlKSB7XG4gICAgcmVzdWx0ID0gY29tcGlsZUxpc3QoaW5jbHVkZWRTY2hlbWEsIG5hbWUsIHJlc3VsdCk7XG4gIH1cblxuICBmb3IgKGNvbnN0IGN1cnJlbnRUeXBlIG9mIHNjaGVtYVtuYW1lXSkge1xuICAgIGZvciAoY29uc3QgW3ByZXZpb3VzSW5kZXgsIHByZXZpb3VzVHlwZV0gb2YgcmVzdWx0LmVudHJpZXMoKSkge1xuICAgICAgaWYgKFxuICAgICAgICBwcmV2aW91c1R5cGUudGFnID09PSBjdXJyZW50VHlwZS50YWcgJiZcbiAgICAgICAgcHJldmlvdXNUeXBlLmtpbmQgPT09IGN1cnJlbnRUeXBlLmtpbmRcbiAgICAgICkge1xuICAgICAgICBleGNsdWRlLnB1c2gocHJldmlvdXNJbmRleCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVzdWx0LnB1c2goY3VycmVudFR5cGUpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdC5maWx0ZXIoKF90eXBlLCBpbmRleCk6IHVua25vd24gPT4gIWV4Y2x1ZGUuaW5jbHVkZXMoaW5kZXgpKTtcbn1cblxuZXhwb3J0IHR5cGUgVHlwZU1hcCA9IHsgW2sgaW4gS2luZFR5cGUgfCBcImZhbGxiYWNrXCJdOiBBcnJheU9iamVjdDxUeXBlPiB9O1xuZnVuY3Rpb24gY29tcGlsZU1hcCguLi50eXBlc0xpc3Q6IFR5cGVbXVtdKTogVHlwZU1hcCB7XG4gIGNvbnN0IHJlc3VsdDogVHlwZU1hcCA9IHtcbiAgICBmYWxsYmFjazoge30sXG4gICAgbWFwcGluZzoge30sXG4gICAgc2NhbGFyOiB7fSxcbiAgICBzZXF1ZW5jZToge30sXG4gIH07XG5cbiAgZm9yIChjb25zdCB0eXBlcyBvZiB0eXBlc0xpc3QpIHtcbiAgICBmb3IgKGNvbnN0IHR5cGUgb2YgdHlwZXMpIHtcbiAgICAgIGlmICh0eXBlLmtpbmQgIT09IG51bGwpIHtcbiAgICAgICAgcmVzdWx0W3R5cGUua2luZF1bdHlwZS50YWddID0gcmVzdWx0W1wiZmFsbGJhY2tcIl1bdHlwZS50YWddID0gdHlwZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGNsYXNzIFNjaGVtYSBpbXBsZW1lbnRzIFNjaGVtYURlZmluaXRpb24ge1xuICBzdGF0aWMgU0NIRU1BX0RFRkFVTFQ/OiBTY2hlbWE7XG5cbiAgaW1wbGljaXQ6IFR5cGVbXTtcbiAgZXhwbGljaXQ6IFR5cGVbXTtcbiAgaW5jbHVkZTogU2NoZW1hW107XG5cbiAgY29tcGlsZWRJbXBsaWNpdDogVHlwZVtdO1xuICBjb21waWxlZEV4cGxpY2l0OiBUeXBlW107XG4gIGNvbXBpbGVkVHlwZU1hcDogVHlwZU1hcDtcblxuICBjb25zdHJ1Y3RvcihkZWZpbml0aW9uOiBTY2hlbWFEZWZpbml0aW9uKSB7XG4gICAgdGhpcy5leHBsaWNpdCA9IGRlZmluaXRpb24uZXhwbGljaXQgfHwgW107XG4gICAgdGhpcy5pbXBsaWNpdCA9IGRlZmluaXRpb24uaW1wbGljaXQgfHwgW107XG4gICAgdGhpcy5pbmNsdWRlID0gZGVmaW5pdGlvbi5pbmNsdWRlIHx8IFtdO1xuXG4gICAgZm9yIChjb25zdCB0eXBlIG9mIHRoaXMuaW1wbGljaXQpIHtcbiAgICAgIGlmICh0eXBlLmxvYWRLaW5kICYmIHR5cGUubG9hZEtpbmQgIT09IFwic2NhbGFyXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFlBTUxFcnJvcihcbiAgICAgICAgICBcIlRoZXJlIGlzIGEgbm9uLXNjYWxhciB0eXBlIGluIHRoZSBpbXBsaWNpdCBsaXN0IG9mIGEgc2NoZW1hLiBJbXBsaWNpdCByZXNvbHZpbmcgb2Ygc3VjaCB0eXBlcyBpcyBub3Qgc3VwcG9ydGVkLlwiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY29tcGlsZWRJbXBsaWNpdCA9IGNvbXBpbGVMaXN0KHRoaXMsIFwiaW1wbGljaXRcIiwgW10pO1xuICAgIHRoaXMuY29tcGlsZWRFeHBsaWNpdCA9IGNvbXBpbGVMaXN0KHRoaXMsIFwiZXhwbGljaXRcIiwgW10pO1xuICAgIHRoaXMuY29tcGlsZWRUeXBlTWFwID0gY29tcGlsZU1hcChcbiAgICAgIHRoaXMuY29tcGlsZWRJbXBsaWNpdCxcbiAgICAgIHRoaXMuY29tcGlsZWRFeHBsaWNpdCxcbiAgICApO1xuICB9XG5cbiAgLyogUmV0dXJucyBhIG5ldyBleHRlbmRlZCBzY2hlbWEgZnJvbSBjdXJyZW50IHNjaGVtYSAqL1xuICBleHRlbmQoZGVmaW5pdGlvbjogU2NoZW1hRGVmaW5pdGlvbik6IFNjaGVtYSB7XG4gICAgcmV0dXJuIG5ldyBTY2hlbWEoe1xuICAgICAgaW1wbGljaXQ6IFtcbiAgICAgICAgLi4ubmV3IFNldChbLi4udGhpcy5pbXBsaWNpdCwgLi4uKGRlZmluaXRpb24/LmltcGxpY2l0ID8/IFtdKV0pLFxuICAgICAgXSxcbiAgICAgIGV4cGxpY2l0OiBbXG4gICAgICAgIC4uLm5ldyBTZXQoWy4uLnRoaXMuZXhwbGljaXQsIC4uLihkZWZpbml0aW9uPy5leHBsaWNpdCA/PyBbXSldKSxcbiAgICAgIF0sXG4gICAgICBpbmNsdWRlOiBbLi4ubmV3IFNldChbLi4udGhpcy5pbmNsdWRlLCAuLi4oZGVmaW5pdGlvbj8uaW5jbHVkZSA/PyBbXSldKV0sXG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlKCkge31cbn1cblxuZXhwb3J0IGludGVyZmFjZSBTY2hlbWFEZWZpbml0aW9uIHtcbiAgaW1wbGljaXQ/OiBBbnlbXTtcbiAgZXhwbGljaXQ/OiBUeXBlW107XG4gIGluY2x1ZGU/OiBTY2hlbWFbXTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0Isb0ZBQW9GO0FBQ3BGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsU0FBUyxRQUFRLGNBQWM7QUFJeEMsU0FBUyxZQUNQLE1BQWMsRUFDZCxJQUE2QixFQUM3QixNQUFjO0VBRWQsTUFBTSxVQUFvQixFQUFFO0VBRTVCLEtBQUssTUFBTSxrQkFBa0IsT0FBTyxPQUFPLENBQUU7SUFDM0MsU0FBUyxZQUFZLGdCQUFnQixNQUFNO0VBQzdDO0VBRUEsS0FBSyxNQUFNLGVBQWUsTUFBTSxDQUFDLEtBQUssQ0FBRTtJQUN0QyxLQUFLLE1BQU0sQ0FBQyxlQUFlLGFBQWEsSUFBSSxPQUFPLE9BQU8sR0FBSTtNQUM1RCxJQUNFLGFBQWEsR0FBRyxLQUFLLFlBQVksR0FBRyxJQUNwQyxhQUFhLElBQUksS0FBSyxZQUFZLElBQUksRUFDdEM7UUFDQSxRQUFRLElBQUksQ0FBQztNQUNmO0lBQ0Y7SUFFQSxPQUFPLElBQUksQ0FBQztFQUNkO0VBRUEsT0FBTyxPQUFPLE1BQU0sQ0FBQyxDQUFDLE9BQU8sUUFBbUIsQ0FBQyxRQUFRLFFBQVEsQ0FBQztBQUNwRTtBQUdBLFNBQVMsV0FBVyxHQUFHLFNBQW1CO0VBQ3hDLE1BQU0sU0FBa0I7SUFDdEIsVUFBVSxDQUFDO0lBQ1gsU0FBUyxDQUFDO0lBQ1YsUUFBUSxDQUFDO0lBQ1QsVUFBVSxDQUFDO0VBQ2I7RUFFQSxLQUFLLE1BQU0sU0FBUyxVQUFXO0lBQzdCLEtBQUssTUFBTSxRQUFRLE1BQU87TUFDeEIsSUFBSSxLQUFLLElBQUksS0FBSyxNQUFNO1FBQ3RCLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHO01BQy9EO0lBQ0Y7RUFDRjtFQUNBLE9BQU87QUFDVDtBQUVBLE9BQU8sTUFBTTtFQUNYLE9BQU8sZUFBd0I7RUFFL0IsU0FBaUI7RUFDakIsU0FBaUI7RUFDakIsUUFBa0I7RUFFbEIsaUJBQXlCO0VBQ3pCLGlCQUF5QjtFQUN6QixnQkFBeUI7RUFFekIsWUFBWSxVQUE0QixDQUFFO0lBQ3hDLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxRQUFRLElBQUksRUFBRTtJQUN6QyxJQUFJLENBQUMsUUFBUSxHQUFHLFdBQVcsUUFBUSxJQUFJLEVBQUU7SUFDekMsSUFBSSxDQUFDLE9BQU8sR0FBRyxXQUFXLE9BQU8sSUFBSSxFQUFFO0lBRXZDLEtBQUssTUFBTSxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUU7TUFDaEMsSUFBSSxLQUFLLFFBQVEsSUFBSSxLQUFLLFFBQVEsS0FBSyxVQUFVO1FBQy9DLE1BQU0sSUFBSSxVQUNSO01BRUo7SUFDRjtJQUVBLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxZQUFZLElBQUksRUFBRSxZQUFZLEVBQUU7SUFDeEQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFlBQVksSUFBSSxFQUFFLFlBQVksRUFBRTtJQUN4RCxJQUFJLENBQUMsZUFBZSxHQUFHLFdBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsRUFDckIsSUFBSSxDQUFDLGdCQUFnQjtFQUV6QjtFQUVBLHFEQUFxRCxHQUNyRCxPQUFPLFVBQTRCLEVBQVU7SUFDM0MsT0FBTyxJQUFJLE9BQU87TUFDaEIsVUFBVTtXQUNMLElBQUksSUFBSTthQUFJLElBQUksQ0FBQyxRQUFRO2FBQU0sWUFBWSxZQUFZLEVBQUU7U0FBRTtPQUMvRDtNQUNELFVBQVU7V0FDTCxJQUFJLElBQUk7YUFBSSxJQUFJLENBQUMsUUFBUTthQUFNLFlBQVksWUFBWSxFQUFFO1NBQUU7T0FDL0Q7TUFDRCxTQUFTO1dBQUksSUFBSSxJQUFJO2FBQUksSUFBSSxDQUFDLE9BQU87YUFBTSxZQUFZLFdBQVcsRUFBRTtTQUFFO09BQUU7SUFDMUU7RUFDRjtFQUVBLE9BQU8sU0FBUyxDQUFDO0FBQ25CIn0=
// denoCacheMetadata=6568093360247431973,9176823271342546425