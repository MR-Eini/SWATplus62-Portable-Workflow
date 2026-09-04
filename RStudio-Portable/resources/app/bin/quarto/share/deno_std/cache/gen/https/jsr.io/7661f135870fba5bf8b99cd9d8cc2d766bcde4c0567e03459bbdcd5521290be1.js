// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
/**
 * The character used to separate entries in the PATH environment variable.
 * On Windows, this is `;`. On all other platforms, this is `:`.
 */ export const DELIMITER = isWindows ? ";" : ":";
/**
 * The character used to separate components of a file path.
 * On Windows, this is `\`. On all other platforms, this is `/`.
 */ export const SEPARATOR = isWindows ? "\\" : "/";
/**
 * A regular expression that matches one or more path separators.
 */ export const SEPARATOR_PATTERN = isWindows ? /[\\/]+/ : /\/+/;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjAuMC1yYy4yL2NvbnN0YW50cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHsgaXNXaW5kb3dzIH0gZnJvbSBcIi4vX29zLnRzXCI7XG5cbi8qKlxuICogVGhlIGNoYXJhY3RlciB1c2VkIHRvIHNlcGFyYXRlIGVudHJpZXMgaW4gdGhlIFBBVEggZW52aXJvbm1lbnQgdmFyaWFibGUuXG4gKiBPbiBXaW5kb3dzLCB0aGlzIGlzIGA7YC4gT24gYWxsIG90aGVyIHBsYXRmb3JtcywgdGhpcyBpcyBgOmAuXG4gKi9cbmV4cG9ydCBjb25zdCBERUxJTUlURVIgPSBpc1dpbmRvd3MgPyBcIjtcIiBhcyBjb25zdCA6IFwiOlwiIGFzIGNvbnN0O1xuLyoqXG4gKiBUaGUgY2hhcmFjdGVyIHVzZWQgdG8gc2VwYXJhdGUgY29tcG9uZW50cyBvZiBhIGZpbGUgcGF0aC5cbiAqIE9uIFdpbmRvd3MsIHRoaXMgaXMgYFxcYC4gT24gYWxsIG90aGVyIHBsYXRmb3JtcywgdGhpcyBpcyBgL2AuXG4gKi9cbmV4cG9ydCBjb25zdCBTRVBBUkFUT1IgPSBpc1dpbmRvd3MgPyBcIlxcXFxcIiBhcyBjb25zdCA6IFwiL1wiIGFzIGNvbnN0O1xuLyoqXG4gKiBBIHJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgb25lIG9yIG1vcmUgcGF0aCBzZXBhcmF0b3JzLlxuICovXG5leHBvcnQgY29uc3QgU0VQQVJBVE9SX1BBVFRFUk4gPSBpc1dpbmRvd3MgPyAvW1xcXFwvXSsvIDogL1xcLysvO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsU0FBUyxTQUFTLFFBQVEsV0FBVztBQUVyQzs7O0NBR0MsR0FDRCxPQUFPLE1BQU0sWUFBWSxZQUFZLE1BQWUsSUFBYTtBQUNqRTs7O0NBR0MsR0FDRCxPQUFPLE1BQU0sWUFBWSxZQUFZLE9BQWdCLElBQWE7QUFDbEU7O0NBRUMsR0FDRCxPQUFPLE1BQU0sb0JBQW9CLFlBQVksV0FBVyxNQUFNIn0=
// denoCacheMetadata=11695291746205404128,5952334969462182782