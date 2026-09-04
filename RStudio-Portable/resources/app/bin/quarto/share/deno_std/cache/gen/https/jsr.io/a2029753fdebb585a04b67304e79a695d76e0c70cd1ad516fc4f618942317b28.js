// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { isNegativeZero } from "../_utils.ts";
const YAML_FLOAT_PATTERN = new RegExp(// 2.5e4, 2.5 and integers
"^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?" + // .2e4, .2
// special case, seems not from spec
"|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?" + // .inf
"|[-+]?\\.(?:inf|Inf|INF)" + // .nan
"|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat(data) {
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  let value = data.replace(/_/g, "").toLowerCase();
  const sign = value[0] === "-" ? -1 : 1;
  if (value[0] && "+-".includes(value[0])) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  }
  if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value);
}
const SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(// deno-lint-ignore ban-types
object, style) {
  const value = object instanceof Number ? object.valueOf() : object;
  if (isNaN(value)) {
    switch(style){
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === value) {
    switch(style){
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === value) {
    switch(style){
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (isNegativeZero(value)) {
    return "-0.0";
  }
  const res = value.toString(10);
  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requires dot: 5.e-100. Fix it with simple hack
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  if (object instanceof Number) object = object.valueOf();
  return typeof object === "number" && (object % 1 !== 0 || isNegativeZero(object));
}
export const float = {
  tag: "tag:yaml.org,2002:float",
  construct: constructYamlFloat,
  defaultStyle: "lowercase",
  kind: "scalar",
  predicate: isFloat,
  represent: representYamlFloat,
  resolve: resolveYamlFloat
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8xLjAuNS9fdHlwZS9mbG9hdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb3J0ZWQgZnJvbSBqcy15YW1sIHYzLjEzLjE6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwvY29tbWl0LzY2NWFhZGRhNDIzNDlkY2FlODY5ZjEyMDQwZDliMTBlZjE4ZDEyZGFcbi8vIENvcHlyaWdodCAyMDExLTIwMTUgYnkgVml0YWx5IFB1enJpbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgdHlwZSB7IFN0eWxlVmFyaWFudCwgVHlwZSB9IGZyb20gXCIuLi9fdHlwZS50c1wiO1xuaW1wb3J0IHsgaXNOZWdhdGl2ZVplcm8gfSBmcm9tIFwiLi4vX3V0aWxzLnRzXCI7XG5cbmNvbnN0IFlBTUxfRkxPQVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDIuNWU0LCAyLjUgYW5kIGludGVnZXJzXG4gIFwiXig/OlstK10/KD86MHxbMS05XVswLTlfXSopKD86XFxcXC5bMC05X10qKT8oPzpbZUVdWy0rXT9bMC05XSspP1wiICtcbiAgICAvLyAuMmU0LCAuMlxuICAgIC8vIHNwZWNpYWwgY2FzZSwgc2VlbXMgbm90IGZyb20gc3BlY1xuICAgIFwifFxcXFwuWzAtOV9dKyg/OltlRV1bLStdP1swLTldKyk/XCIgK1xuICAgIC8vIC5pbmZcbiAgICBcInxbLStdP1xcXFwuKD86aW5mfEluZnxJTkYpXCIgK1xuICAgIC8vIC5uYW5cbiAgICBcInxcXFxcLig/Om5hbnxOYU58TkFOKSkkXCIsXG4pO1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEZsb2F0KGRhdGE6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoXG4gICAgIVlBTUxfRkxPQVRfUEFUVEVSTi50ZXN0KGRhdGEpIHx8XG4gICAgLy8gUXVpY2sgaGFjayB0byBub3QgYWxsb3cgaW50ZWdlcnMgZW5kIHdpdGggYF9gXG4gICAgLy8gUHJvYmFibHkgc2hvdWxkIHVwZGF0ZSByZWdleHAgJiBjaGVjayBzcGVlZFxuICAgIGRhdGFbZGF0YS5sZW5ndGggLSAxXSA9PT0gXCJfXCJcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxGbG9hdChkYXRhOiBzdHJpbmcpOiBudW1iZXIge1xuICBsZXQgdmFsdWUgPSBkYXRhLnJlcGxhY2UoL18vZywgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgY29uc3Qgc2lnbiA9IHZhbHVlWzBdID09PSBcIi1cIiA/IC0xIDogMTtcblxuICBpZiAodmFsdWVbMF0gJiYgXCIrLVwiLmluY2x1ZGVzKHZhbHVlWzBdKSkge1xuICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoMSk7XG4gIH1cblxuICBpZiAodmFsdWUgPT09IFwiLmluZlwiKSB7XG4gICAgcmV0dXJuIHNpZ24gPT09IDEgPyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgOiBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG4gIH1cbiAgaWYgKHZhbHVlID09PSBcIi5uYW5cIikge1xuICAgIHJldHVybiBOYU47XG4gIH1cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUZsb2F0KHZhbHVlKTtcbn1cblxuY29uc3QgU0NJRU5USUZJQ19XSVRIT1VUX0RPVCA9IC9eWy0rXT9bMC05XStlLztcblxuZnVuY3Rpb24gcmVwcmVzZW50WWFtbEZsb2F0KFxuICAvLyBkZW5vLWxpbnQtaWdub3JlIGJhbi10eXBlc1xuICBvYmplY3Q6IG51bWJlciB8IE51bWJlcixcbiAgc3R5bGU/OiBTdHlsZVZhcmlhbnQsXG4pOiBzdHJpbmcge1xuICBjb25zdCB2YWx1ZSA9IG9iamVjdCBpbnN0YW5jZW9mIE51bWJlciA/IG9iamVjdC52YWx1ZU9mKCkgOiBvYmplY3Q7XG4gIGlmIChpc05hTih2YWx1ZSkpIHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICBjYXNlIFwibG93ZXJjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi5uYW5cIjtcbiAgICAgIGNhc2UgXCJ1cHBlcmNhc2VcIjpcbiAgICAgICAgcmV0dXJuIFwiLk5BTlwiO1xuICAgICAgY2FzZSBcImNhbWVsY2FzZVwiOlxuICAgICAgICByZXR1cm4gXCIuTmFOXCI7XG4gICAgfVxuICB9IGVsc2UgaWYgKE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA9PT0gdmFsdWUpIHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICBjYXNlIFwibG93ZXJjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi5pbmZcIjtcbiAgICAgIGNhc2UgXCJ1cHBlcmNhc2VcIjpcbiAgICAgICAgcmV0dXJuIFwiLklORlwiO1xuICAgICAgY2FzZSBcImNhbWVsY2FzZVwiOlxuICAgICAgICByZXR1cm4gXCIuSW5mXCI7XG4gICAgfVxuICB9IGVsc2UgaWYgKE51bWJlci5ORUdBVElWRV9JTkZJTklUWSA9PT0gdmFsdWUpIHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICBjYXNlIFwibG93ZXJjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi0uaW5mXCI7XG4gICAgICBjYXNlIFwidXBwZXJjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi0uSU5GXCI7XG4gICAgICBjYXNlIFwiY2FtZWxjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi0uSW5mXCI7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzTmVnYXRpdmVaZXJvKHZhbHVlKSkge1xuICAgIHJldHVybiBcIi0wLjBcIjtcbiAgfVxuXG4gIGNvbnN0IHJlcyA9IHZhbHVlLnRvU3RyaW5nKDEwKTtcblxuICAvLyBKUyBzdHJpbmdpZmllciBjYW4gYnVpbGQgc2NpZW50aWZpYyBmb3JtYXQgd2l0aG91dCBkb3RzOiA1ZS0xMDAsXG4gIC8vIHdoaWxlIFlBTUwgcmVxdWlyZXMgZG90OiA1LmUtMTAwLiBGaXggaXQgd2l0aCBzaW1wbGUgaGFja1xuXG4gIHJldHVybiBTQ0lFTlRJRklDX1dJVEhPVVRfRE9ULnRlc3QocmVzKSA/IHJlcy5yZXBsYWNlKFwiZVwiLCBcIi5lXCIpIDogcmVzO1xufVxuXG5mdW5jdGlvbiBpc0Zsb2F0KG9iamVjdDogdW5rbm93bik6IG9iamVjdCBpcyBudW1iZXIge1xuICBpZiAob2JqZWN0IGluc3RhbmNlb2YgTnVtYmVyKSBvYmplY3QgPSBvYmplY3QudmFsdWVPZigpO1xuICByZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gXCJudW1iZXJcIiAmJlxuICAgIChvYmplY3QgJSAxICE9PSAwIHx8IGlzTmVnYXRpdmVaZXJvKG9iamVjdCkpO1xufVxuXG5leHBvcnQgY29uc3QgZmxvYXQ6IFR5cGU8XCJzY2FsYXJcIiwgbnVtYmVyPiA9IHtcbiAgdGFnOiBcInRhZzp5YW1sLm9yZywyMDAyOmZsb2F0XCIsXG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbEZsb2F0LFxuICBkZWZhdWx0U3R5bGU6IFwibG93ZXJjYXNlXCIsXG4gIGtpbmQ6IFwic2NhbGFyXCIsXG4gIHByZWRpY2F0ZTogaXNGbG9hdCxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sRmxvYXQsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sRmxvYXQsXG59O1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUcxRSxTQUFTLGNBQWMsUUFBUSxlQUFlO0FBRTlDLE1BQU0scUJBQXFCLElBQUksT0FDN0IsMEJBQTBCO0FBQzFCLG1FQUNFLFdBQVc7QUFDWCxvQ0FBb0M7QUFDcEMsb0NBQ0EsT0FBTztBQUNQLDZCQUNBLE9BQU87QUFDUDtBQUdKLFNBQVMsaUJBQWlCLElBQVk7RUFDcEMsSUFDRSxDQUFDLG1CQUFtQixJQUFJLENBQUMsU0FDekIsZ0RBQWdEO0VBQ2hELDhDQUE4QztFQUM5QyxJQUFJLENBQUMsS0FBSyxNQUFNLEdBQUcsRUFBRSxLQUFLLEtBQzFCO0lBQ0EsT0FBTztFQUNUO0VBRUEsT0FBTztBQUNUO0FBRUEsU0FBUyxtQkFBbUIsSUFBWTtFQUN0QyxJQUFJLFFBQVEsS0FBSyxPQUFPLENBQUMsTUFBTSxJQUFJLFdBQVc7RUFDOUMsTUFBTSxPQUFPLEtBQUssQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLElBQUk7RUFFckMsSUFBSSxLQUFLLENBQUMsRUFBRSxJQUFJLEtBQUssUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUc7SUFDdkMsUUFBUSxNQUFNLEtBQUssQ0FBQztFQUN0QjtFQUVBLElBQUksVUFBVSxRQUFRO0lBQ3BCLE9BQU8sU0FBUyxJQUFJLE9BQU8saUJBQWlCLEdBQUcsT0FBTyxpQkFBaUI7RUFDekU7RUFDQSxJQUFJLFVBQVUsUUFBUTtJQUNwQixPQUFPO0VBQ1Q7RUFDQSxPQUFPLE9BQU8sV0FBVztBQUMzQjtBQUVBLE1BQU0seUJBQXlCO0FBRS9CLFNBQVMsbUJBQ1AsNkJBQTZCO0FBQzdCLE1BQXVCLEVBQ3ZCLEtBQW9CO0VBRXBCLE1BQU0sUUFBUSxrQkFBa0IsU0FBUyxPQUFPLE9BQU8sS0FBSztFQUM1RCxJQUFJLE1BQU0sUUFBUTtJQUNoQixPQUFRO01BQ04sS0FBSztRQUNILE9BQU87TUFDVCxLQUFLO1FBQ0gsT0FBTztNQUNULEtBQUs7UUFDSCxPQUFPO0lBQ1g7RUFDRixPQUFPLElBQUksT0FBTyxpQkFBaUIsS0FBSyxPQUFPO0lBQzdDLE9BQVE7TUFDTixLQUFLO1FBQ0gsT0FBTztNQUNULEtBQUs7UUFDSCxPQUFPO01BQ1QsS0FBSztRQUNILE9BQU87SUFDWDtFQUNGLE9BQU8sSUFBSSxPQUFPLGlCQUFpQixLQUFLLE9BQU87SUFDN0MsT0FBUTtNQUNOLEtBQUs7UUFDSCxPQUFPO01BQ1QsS0FBSztRQUNILE9BQU87TUFDVCxLQUFLO1FBQ0gsT0FBTztJQUNYO0VBQ0YsT0FBTyxJQUFJLGVBQWUsUUFBUTtJQUNoQyxPQUFPO0VBQ1Q7RUFFQSxNQUFNLE1BQU0sTUFBTSxRQUFRLENBQUM7RUFFM0IsbUVBQW1FO0VBQ25FLDREQUE0RDtFQUU1RCxPQUFPLHVCQUF1QixJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVE7QUFDckU7QUFFQSxTQUFTLFFBQVEsTUFBZTtFQUM5QixJQUFJLGtCQUFrQixRQUFRLFNBQVMsT0FBTyxPQUFPO0VBQ3JELE9BQU8sT0FBTyxXQUFXLFlBQ3ZCLENBQUMsU0FBUyxNQUFNLEtBQUssZUFBZSxPQUFPO0FBQy9DO0FBRUEsT0FBTyxNQUFNLFFBQWdDO0VBQzNDLEtBQUs7RUFDTCxXQUFXO0VBQ1gsY0FBYztFQUNkLE1BQU07RUFDTixXQUFXO0VBQ1gsV0FBVztFQUNYLFNBQVM7QUFDWCxFQUFFIn0=
// denoCacheMetadata=18211657903101764290,1370700408575455985