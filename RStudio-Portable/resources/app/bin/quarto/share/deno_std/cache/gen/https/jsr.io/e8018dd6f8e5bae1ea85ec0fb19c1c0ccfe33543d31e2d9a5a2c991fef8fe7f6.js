// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { CHAR_COLON } from "../_common/constants.ts";
import { normalizeString } from "../_common/normalize_string.ts";
import { assertPath } from "../_common/assert_path.ts";
import { isPathSeparator, isWindowsDeviceRoot } from "./_util.ts";
/**
 * Resolves path segments into a `path`
 * @param pathSegments to process to path
 */ export function resolve(...pathSegments) {
  let resolvedDevice = "";
  let resolvedTail = "";
  let resolvedAbsolute = false;
  for(let i = pathSegments.length - 1; i >= -1; i--){
    let path;
    // deno-lint-ignore no-explicit-any
    const { Deno } = globalThis;
    if (i >= 0) {
      path = pathSegments[i];
    } else if (!resolvedDevice) {
      if (typeof Deno?.cwd !== "function") {
        throw new TypeError("Resolved a drive-letter-less path without a CWD.");
      }
      path = Deno.cwd();
    } else {
      if (typeof Deno?.env?.get !== "function" || typeof Deno?.cwd !== "function") {
        throw new TypeError("Resolved a relative path without a CWD.");
      }
      path = Deno.cwd();
      // Verify that a cwd was found and that it actually points
      // to our drive. If not, default to the drive's root.
      if (path === undefined || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
        path = `${resolvedDevice}\\`;
      }
    }
    assertPath(path);
    const len = path.length;
    // Skip empty entries
    if (len === 0) continue;
    let rootEnd = 0;
    let device = "";
    let isAbsolute = false;
    const code = path.charCodeAt(0);
    // Try to match a root
    if (len > 1) {
      if (isPathSeparator(code)) {
        // Possible UNC root
        // If we started with a separator, we know we at least have an
        // absolute path of some kind (UNC or otherwise)
        isAbsolute = true;
        if (isPathSeparator(path.charCodeAt(1))) {
          // Matched double path separator at beginning
          let j = 2;
          let last = j;
          // Match 1 or more non-path separators
          for(; j < len; ++j){
            if (isPathSeparator(path.charCodeAt(j))) break;
          }
          if (j < len && j !== last) {
            const firstPart = path.slice(last, j);
            // Matched!
            last = j;
            // Match 1 or more path separators
            for(; j < len; ++j){
              if (!isPathSeparator(path.charCodeAt(j))) break;
            }
            if (j < len && j !== last) {
              // Matched!
              last = j;
              // Match 1 or more non-path separators
              for(; j < len; ++j){
                if (isPathSeparator(path.charCodeAt(j))) break;
              }
              if (j === len) {
                // We matched a UNC root only
                device = `\\\\${firstPart}\\${path.slice(last)}`;
                rootEnd = j;
              } else if (j !== last) {
                // We matched a UNC root with leftovers
                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                rootEnd = j;
              }
            }
          }
        } else {
          rootEnd = 1;
        }
      } else if (isWindowsDeviceRoot(code)) {
        // Possible device root
        if (path.charCodeAt(1) === CHAR_COLON) {
          device = path.slice(0, 2);
          rootEnd = 2;
          if (len > 2) {
            if (isPathSeparator(path.charCodeAt(2))) {
              // Treat separator following drive name as an absolute path
              // indicator
              isAbsolute = true;
              rootEnd = 3;
            }
          }
        }
      }
    } else if (isPathSeparator(code)) {
      // `path` contains just a path separator
      rootEnd = 1;
      isAbsolute = true;
    }
    if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
      continue;
    }
    if (resolvedDevice.length === 0 && device.length > 0) {
      resolvedDevice = device;
    }
    if (!resolvedAbsolute) {
      resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
      resolvedAbsolute = isAbsolute;
    }
    if (resolvedAbsolute && resolvedDevice.length > 0) break;
  }
  // At this point the path should be resolved to a full absolute path,
  // but handle relative paths to be safe (might happen when Deno.cwd()
  // fails)
  // Normalize the tail path
  resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
  return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3dpbmRvd3MvcmVzb2x2ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBDSEFSX0NPTE9OIH0gZnJvbSBcIi4uL19jb21tb24vY29uc3RhbnRzLnRzXCI7XG5pbXBvcnQgeyBub3JtYWxpemVTdHJpbmcgfSBmcm9tIFwiLi4vX2NvbW1vbi9ub3JtYWxpemVfc3RyaW5nLnRzXCI7XG5pbXBvcnQgeyBhc3NlcnRQYXRoIH0gZnJvbSBcIi4uL19jb21tb24vYXNzZXJ0X3BhdGgudHNcIjtcbmltcG9ydCB7IGlzUGF0aFNlcGFyYXRvciwgaXNXaW5kb3dzRGV2aWNlUm9vdCB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5cbi8qKlxuICogUmVzb2x2ZXMgcGF0aCBzZWdtZW50cyBpbnRvIGEgYHBhdGhgXG4gKiBAcGFyYW0gcGF0aFNlZ21lbnRzIHRvIHByb2Nlc3MgdG8gcGF0aFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZSguLi5wYXRoU2VnbWVudHM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgbGV0IHJlc29sdmVkRGV2aWNlID0gXCJcIjtcbiAgbGV0IHJlc29sdmVkVGFpbCA9IFwiXCI7XG4gIGxldCByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XG5cbiAgZm9yIChsZXQgaSA9IHBhdGhTZWdtZW50cy5sZW5ndGggLSAxOyBpID49IC0xOyBpLS0pIHtcbiAgICBsZXQgcGF0aDogc3RyaW5nO1xuICAgIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICAgY29uc3QgeyBEZW5vIH0gPSBnbG9iYWxUaGlzIGFzIGFueTtcbiAgICBpZiAoaSA+PSAwKSB7XG4gICAgICBwYXRoID0gcGF0aFNlZ21lbnRzW2ldITtcbiAgICB9IGVsc2UgaWYgKCFyZXNvbHZlZERldmljZSkge1xuICAgICAgaWYgKHR5cGVvZiBEZW5vPy5jd2QgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUmVzb2x2ZWQgYSBkcml2ZS1sZXR0ZXItbGVzcyBwYXRoIHdpdGhvdXQgYSBDV0QuXCIpO1xuICAgICAgfVxuICAgICAgcGF0aCA9IERlbm8uY3dkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIERlbm8/LmVudj8uZ2V0ICE9PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIERlbm8/LmN3ZCAhPT0gXCJmdW5jdGlvblwiXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlJlc29sdmVkIGEgcmVsYXRpdmUgcGF0aCB3aXRob3V0IGEgQ1dELlwiKTtcbiAgICAgIH1cbiAgICAgIHBhdGggPSBEZW5vLmN3ZCgpO1xuXG4gICAgICAvLyBWZXJpZnkgdGhhdCBhIGN3ZCB3YXMgZm91bmQgYW5kIHRoYXQgaXQgYWN0dWFsbHkgcG9pbnRzXG4gICAgICAvLyB0byBvdXIgZHJpdmUuIElmIG5vdCwgZGVmYXVsdCB0byB0aGUgZHJpdmUncyByb290LlxuICAgICAgaWYgKFxuICAgICAgICBwYXRoID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgcGF0aC5zbGljZSgwLCAzKS50b0xvd2VyQ2FzZSgpICE9PSBgJHtyZXNvbHZlZERldmljZS50b0xvd2VyQ2FzZSgpfVxcXFxgXG4gICAgICApIHtcbiAgICAgICAgcGF0aCA9IGAke3Jlc29sdmVkRGV2aWNlfVxcXFxgO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFzc2VydFBhdGgocGF0aCk7XG5cbiAgICBjb25zdCBsZW4gPSBwYXRoLmxlbmd0aDtcblxuICAgIC8vIFNraXAgZW1wdHkgZW50cmllc1xuICAgIGlmIChsZW4gPT09IDApIGNvbnRpbnVlO1xuXG4gICAgbGV0IHJvb3RFbmQgPSAwO1xuICAgIGxldCBkZXZpY2UgPSBcIlwiO1xuICAgIGxldCBpc0Fic29sdXRlID0gZmFsc2U7XG4gICAgY29uc3QgY29kZSA9IHBhdGguY2hhckNvZGVBdCgwKTtcblxuICAgIC8vIFRyeSB0byBtYXRjaCBhIHJvb3RcbiAgICBpZiAobGVuID4gMSkge1xuICAgICAgaWYgKGlzUGF0aFNlcGFyYXRvcihjb2RlKSkge1xuICAgICAgICAvLyBQb3NzaWJsZSBVTkMgcm9vdFxuXG4gICAgICAgIC8vIElmIHdlIHN0YXJ0ZWQgd2l0aCBhIHNlcGFyYXRvciwgd2Uga25vdyB3ZSBhdCBsZWFzdCBoYXZlIGFuXG4gICAgICAgIC8vIGFic29sdXRlIHBhdGggb2Ygc29tZSBraW5kIChVTkMgb3Igb3RoZXJ3aXNlKVxuICAgICAgICBpc0Fic29sdXRlID0gdHJ1ZTtcblxuICAgICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdCgxKSkpIHtcbiAgICAgICAgICAvLyBNYXRjaGVkIGRvdWJsZSBwYXRoIHNlcGFyYXRvciBhdCBiZWdpbm5pbmdcbiAgICAgICAgICBsZXQgaiA9IDI7XG4gICAgICAgICAgbGV0IGxhc3QgPSBqO1xuICAgICAgICAgIC8vIE1hdGNoIDEgb3IgbW9yZSBub24tcGF0aCBzZXBhcmF0b3JzXG4gICAgICAgICAgZm9yICg7IGogPCBsZW47ICsraikge1xuICAgICAgICAgICAgaWYgKGlzUGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoaikpKSBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGogPCBsZW4gJiYgaiAhPT0gbGFzdCkge1xuICAgICAgICAgICAgY29uc3QgZmlyc3RQYXJ0ID0gcGF0aC5zbGljZShsYXN0LCBqKTtcbiAgICAgICAgICAgIC8vIE1hdGNoZWQhXG4gICAgICAgICAgICBsYXN0ID0gajtcbiAgICAgICAgICAgIC8vIE1hdGNoIDEgb3IgbW9yZSBwYXRoIHNlcGFyYXRvcnNcbiAgICAgICAgICAgIGZvciAoOyBqIDwgbGVuOyArK2opIHtcbiAgICAgICAgICAgICAgaWYgKCFpc1BhdGhTZXBhcmF0b3IocGF0aC5jaGFyQ29kZUF0KGopKSkgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaiA8IGxlbiAmJiBqICE9PSBsYXN0KSB7XG4gICAgICAgICAgICAgIC8vIE1hdGNoZWQhXG4gICAgICAgICAgICAgIGxhc3QgPSBqO1xuICAgICAgICAgICAgICAvLyBNYXRjaCAxIG9yIG1vcmUgbm9uLXBhdGggc2VwYXJhdG9yc1xuICAgICAgICAgICAgICBmb3IgKDsgaiA8IGxlbjsgKytqKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzUGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoaikpKSBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoaiA9PT0gbGVuKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgbWF0Y2hlZCBhIFVOQyByb290IG9ubHlcbiAgICAgICAgICAgICAgICBkZXZpY2UgPSBgXFxcXFxcXFwke2ZpcnN0UGFydH1cXFxcJHtwYXRoLnNsaWNlKGxhc3QpfWA7XG4gICAgICAgICAgICAgICAgcm9vdEVuZCA9IGo7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoaiAhPT0gbGFzdCkge1xuICAgICAgICAgICAgICAgIC8vIFdlIG1hdGNoZWQgYSBVTkMgcm9vdCB3aXRoIGxlZnRvdmVyc1xuXG4gICAgICAgICAgICAgICAgZGV2aWNlID0gYFxcXFxcXFxcJHtmaXJzdFBhcnR9XFxcXCR7cGF0aC5zbGljZShsYXN0LCBqKX1gO1xuICAgICAgICAgICAgICAgIHJvb3RFbmQgPSBqO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJvb3RFbmQgPSAxO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlzV2luZG93c0RldmljZVJvb3QoY29kZSkpIHtcbiAgICAgICAgLy8gUG9zc2libGUgZGV2aWNlIHJvb3RcblxuICAgICAgICBpZiAocGF0aC5jaGFyQ29kZUF0KDEpID09PSBDSEFSX0NPTE9OKSB7XG4gICAgICAgICAgZGV2aWNlID0gcGF0aC5zbGljZSgwLCAyKTtcbiAgICAgICAgICByb290RW5kID0gMjtcbiAgICAgICAgICBpZiAobGVuID4gMikge1xuICAgICAgICAgICAgaWYgKGlzUGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoMikpKSB7XG4gICAgICAgICAgICAgIC8vIFRyZWF0IHNlcGFyYXRvciBmb2xsb3dpbmcgZHJpdmUgbmFtZSBhcyBhbiBhYnNvbHV0ZSBwYXRoXG4gICAgICAgICAgICAgIC8vIGluZGljYXRvclxuICAgICAgICAgICAgICBpc0Fic29sdXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcm9vdEVuZCA9IDM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1BhdGhTZXBhcmF0b3IoY29kZSkpIHtcbiAgICAgIC8vIGBwYXRoYCBjb250YWlucyBqdXN0IGEgcGF0aCBzZXBhcmF0b3JcbiAgICAgIHJvb3RFbmQgPSAxO1xuICAgICAgaXNBYnNvbHV0ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgZGV2aWNlLmxlbmd0aCA+IDAgJiZcbiAgICAgIHJlc29sdmVkRGV2aWNlLmxlbmd0aCA+IDAgJiZcbiAgICAgIGRldmljZS50b0xvd2VyQ2FzZSgpICE9PSByZXNvbHZlZERldmljZS50b0xvd2VyQ2FzZSgpXG4gICAgKSB7XG4gICAgICAvLyBUaGlzIHBhdGggcG9pbnRzIHRvIGFub3RoZXIgZGV2aWNlIHNvIGl0IGlzIG5vdCBhcHBsaWNhYmxlXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAocmVzb2x2ZWREZXZpY2UubGVuZ3RoID09PSAwICYmIGRldmljZS5sZW5ndGggPiAwKSB7XG4gICAgICByZXNvbHZlZERldmljZSA9IGRldmljZTtcbiAgICB9XG4gICAgaWYgKCFyZXNvbHZlZEFic29sdXRlKSB7XG4gICAgICByZXNvbHZlZFRhaWwgPSBgJHtwYXRoLnNsaWNlKHJvb3RFbmQpfVxcXFwke3Jlc29sdmVkVGFpbH1gO1xuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGlzQWJzb2x1dGU7XG4gICAgfVxuXG4gICAgaWYgKHJlc29sdmVkQWJzb2x1dGUgJiYgcmVzb2x2ZWREZXZpY2UubGVuZ3RoID4gMCkgYnJlYWs7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCxcbiAgLy8gYnV0IGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBEZW5vLmN3ZCgpXG4gIC8vIGZhaWxzKVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgdGFpbCBwYXRoXG4gIHJlc29sdmVkVGFpbCA9IG5vcm1hbGl6ZVN0cmluZyhcbiAgICByZXNvbHZlZFRhaWwsXG4gICAgIXJlc29sdmVkQWJzb2x1dGUsXG4gICAgXCJcXFxcXCIsXG4gICAgaXNQYXRoU2VwYXJhdG9yLFxuICApO1xuXG4gIHJldHVybiByZXNvbHZlZERldmljZSArIChyZXNvbHZlZEFic29sdXRlID8gXCJcXFxcXCIgOiBcIlwiKSArIHJlc29sdmVkVGFpbCB8fCBcIi5cIjtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsVUFBVSxRQUFRLDBCQUEwQjtBQUNyRCxTQUFTLGVBQWUsUUFBUSxpQ0FBaUM7QUFDakUsU0FBUyxVQUFVLFFBQVEsNEJBQTRCO0FBQ3ZELFNBQVMsZUFBZSxFQUFFLG1CQUFtQixRQUFRLGFBQWE7QUFFbEU7OztDQUdDLEdBQ0QsT0FBTyxTQUFTLFFBQVEsR0FBRyxZQUFzQjtFQUMvQyxJQUFJLGlCQUFpQjtFQUNy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
// denoCacheMetadata=12517200020082663521,18434391133475459799