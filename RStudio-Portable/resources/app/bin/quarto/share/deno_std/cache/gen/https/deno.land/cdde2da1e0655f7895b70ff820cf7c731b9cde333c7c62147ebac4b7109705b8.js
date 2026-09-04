// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
// A module to print ANSI terminal colors. Inspired by chalk, kleur, and colors
// on npm.
/**
 * String formatters and utilities for dealing with ANSI color codes.
 *
 * This module is browser compatible.
 *
 * This module supports `NO_COLOR` environmental variable disabling any coloring
 * if `NO_COLOR` is set.
 *
 * @example
 * ```ts
 * import {
 *   bgBlue,
 *   bgRgb24,
 *   bgRgb8,
 *   bold,
 *   italic,
 *   red,
 *   rgb24,
 *   rgb8,
 * } from "https://deno.land/std@$STD_VERSION/fmt/colors.ts";
 *
 * console.log(bgBlue(italic(red(bold("Hello, World!")))));
 *
 * // also supports 8bit colors
 *
 * console.log(rgb8("Hello, World!", 42));
 *
 * console.log(bgRgb8("Hello, World!", 42));
 *
 * // and 24bit rgb
 *
 * console.log(rgb24("Hello, World!", {
 *   r: 41,
 *   g: 42,
 *   b: 43,
 * }));
 *
 * console.log(bgRgb24("Hello, World!", {
 *   r: 41,
 *   g: 42,
 *   b: 43,
 * }));
 * ```
 *
 * @module
 */ // deno-lint-ignore no-explicit-any
const { Deno } = globalThis;
const noColor = typeof Deno?.noColor === "boolean" ? Deno.noColor : false;
let enabled = !noColor;
/**
 * Set changing text color to enabled or disabled
 * @param value
 */ export function setColorEnabled(value) {
  if (Deno?.noColor) {
    return;
  }
  enabled = value;
}
/** Get whether text color change is enabled or disabled. */ export function getColorEnabled() {
  return enabled;
}
/**
 * Builds color code
 * @param open
 * @param close
 */ function code(open, close) {
  return {
    open: `\x1b[${open.join(";")}m`,
    close: `\x1b[${close}m`,
    regexp: new RegExp(`\\x1b\\[${close}m`, "g")
  };
}
/**
 * Applies color and background based on color code and its associated text
 * @param str text to apply color settings to
 * @param code color code to apply
 */ function run(str, code) {
  return enabled ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}` : str;
}
/**
 * Reset the text modified.
 * @param str text to reset
 */ export function reset(str) {
  return run(str, code([
    0
  ], 0));
}
/**
 * Make the text bold.
 * @param str text to make bold
 */ export function bold(str) {
  return run(str, code([
    1
  ], 22));
}
/**
 * The text emits only a small amount of light.
 * @param str text to dim
 *
 * Warning: Not all terminal emulators support `dim`.
 * For compatibility across all terminals, use {@linkcode gray} or {@linkcode brightBlack} instead.
 */ export function dim(str) {
  return run(str, code([
    2
  ], 22));
}
/**
 * Make the text italic.
 * @param str text to make italic
 */ export function italic(str) {
  return run(str, code([
    3
  ], 23));
}
/**
 * Make the text underline.
 * @param str text to underline
 */ export function underline(str) {
  return run(str, code([
    4
  ], 24));
}
/**
 * Invert background color and text color.
 * @param str text to invert its color
 */ export function inverse(str) {
  return run(str, code([
    7
  ], 27));
}
/**
 * Make the text hidden.
 * @param str text to hide
 */ export function hidden(str) {
  return run(str, code([
    8
  ], 28));
}
/**
 * Put horizontal line through the center of the text.
 * @param str text to strike through
 */ export function strikethrough(str) {
  return run(str, code([
    9
  ], 29));
}
/**
 * Set text color to black.
 * @param str text to make black
 */ export function black(str) {
  return run(str, code([
    30
  ], 39));
}
/**
 * Set text color to red.
 * @param str text to make red
 */ export function red(str) {
  return run(str, code([
    31
  ], 39));
}
/**
 * Set text color to green.
 * @param str text to make green
 */ export function green(str) {
  return run(str, code([
    32
  ], 39));
}
/**
 * Set text color to yellow.
 * @param str text to make yellow
 */ export function yellow(str) {
  return run(str, code([
    33
  ], 39));
}
/**
 * Set text color to blue.
 * @param str text to make blue
 */ export function blue(str) {
  return run(str, code([
    34
  ], 39));
}
/**
 * Set text color to magenta.
 * @param str text to make magenta
 */ export function magenta(str) {
  return run(str, code([
    35
  ], 39));
}
/**
 * Set text color to cyan.
 * @param str text to make cyan
 */ export function cyan(str) {
  return run(str, code([
    36
  ], 39));
}
/**
 * Set text color to white.
 * @param str text to make white
 */ export function white(str) {
  return run(str, code([
    37
  ], 39));
}
/**
 * Set text color to gray.
 * @param str text to make gray
 */ export function gray(str) {
  return brightBlack(str);
}
/**
 * Set text color to bright black.
 * @param str text to make bright-black
 */ export function brightBlack(str) {
  return run(str, code([
    90
  ], 39));
}
/**
 * Set text color to bright red.
 * @param str text to make bright-red
 */ export function brightRed(str) {
  return run(str, code([
    91
  ], 39));
}
/**
 * Set text color to bright green.
 * @param str text to make bright-green
 */ export function brightGreen(str) {
  return run(str, code([
    92
  ], 39));
}
/**
 * Set text color to bright yellow.
 * @param str text to make bright-yellow
 */ export function brightYellow(str) {
  return run(str, code([
    93
  ], 39));
}
/**
 * Set text color to bright blue.
 * @param str text to make bright-blue
 */ export function brightBlue(str) {
  return run(str, code([
    94
  ], 39));
}
/**
 * Set text color to bright magenta.
 * @param str text to make bright-magenta
 */ export function brightMagenta(str) {
  return run(str, code([
    95
  ], 39));
}
/**
 * Set text color to bright cyan.
 * @param str text to make bright-cyan
 */ export function brightCyan(str) {
  return run(str, code([
    96
  ], 39));
}
/**
 * Set text color to bright white.
 * @param str text to make bright-white
 */ export function brightWhite(str) {
  return run(str, code([
    97
  ], 39));
}
/**
 * Set background color to black.
 * @param str text to make its background black
 */ export function bgBlack(str) {
  return run(str, code([
    40
  ], 49));
}
/**
 * Set background color to red.
 * @param str text to make its background red
 */ export function bgRed(str) {
  return run(str, code([
    41
  ], 49));
}
/**
 * Set background color to green.
 * @param str text to make its background green
 */ export function bgGreen(str) {
  return run(str, code([
    42
  ], 49));
}
/**
 * Set background color to yellow.
 * @param str text to make its background yellow
 */ export function bgYellow(str) {
  return run(str, code([
    43
  ], 49));
}
/**
 * Set background color to blue.
 * @param str text to make its background blue
 */ export function bgBlue(str) {
  return run(str, code([
    44
  ], 49));
}
/**
 *  Set background color to magenta.
 * @param str text to make its background magenta
 */ export function bgMagenta(str) {
  return run(str, code([
    45
  ], 49));
}
/**
 * Set background color to cyan.
 * @param str text to make its background cyan
 */ export function bgCyan(str) {
  return run(str, code([
    46
  ], 49));
}
/**
 * Set background color to white.
 * @param str text to make its background white
 */ export function bgWhite(str) {
  return run(str, code([
    47
  ], 49));
}
/**
 * Set background color to bright black.
 * @param str text to make its background bright-black
 */ export function bgBrightBlack(str) {
  return run(str, code([
    100
  ], 49));
}
/**
 * Set background color to bright red.
 * @param str text to make its background bright-red
 */ export function bgBrightRed(str) {
  return run(str, code([
    101
  ], 49));
}
/**
 * Set background color to bright green.
 * @param str text to make its background bright-green
 */ export function bgBrightGreen(str) {
  return run(str, code([
    102
  ], 49));
}
/**
 * Set background color to bright yellow.
 * @param str text to make its background bright-yellow
 */ export function bgBrightYellow(str) {
  return run(str, code([
    103
  ], 49));
}
/**
 * Set background color to bright blue.
 * @param str text to make its background bright-blue
 */ export function bgBrightBlue(str) {
  return run(str, code([
    104
  ], 49));
}
/**
 * Set background color to bright magenta.
 * @param str text to make its background bright-magenta
 */ export function bgBrightMagenta(str) {
  return run(str, code([
    105
  ], 49));
}
/**
 * Set background color to bright cyan.
 * @param str text to make its background bright-cyan
 */ export function bgBrightCyan(str) {
  return run(str, code([
    106
  ], 49));
}
/**
 * Set background color to bright white.
 * @param str text to make its background bright-white
 */ export function bgBrightWhite(str) {
  return run(str, code([
    107
  ], 49));
}
/* Special Color Sequences */ /**
 * Clam and truncate color codes
 * @param n
 * @param max number to truncate to
 * @param min number to truncate from
 */ function clampAndTruncate(n, max = 255, min = 0) {
  return Math.trunc(Math.max(Math.min(n, max), min));
}
/**
 * Set text color using paletted 8bit colors.
 * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
 * @param str text color to apply paletted 8bit colors to
 * @param color code
 */ export function rgb8(str, color) {
  return run(str, code([
    38,
    5,
    clampAndTruncate(color)
  ], 39));
}
/**
 * Set background color using paletted 8bit colors.
 * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
 * @param str text color to apply paletted 8bit background colors to
 * @param color code
 */ export function bgRgb8(str, color) {
  return run(str, code([
    48,
    5,
    clampAndTruncate(color)
  ], 49));
}
/**
 * Set text color using 24bit rgb.
 * `color` can be a number in range `0x000000` to `0xffffff` or
 * an `Rgb`.
 *
 * To produce the color magenta:
 *
 * ```ts
 * import { rgb24 } from "https://deno.land/std@$STD_VERSION/fmt/colors.ts";
 *
 * rgb24("foo", 0xff00ff);
 * rgb24("foo", {r: 255, g: 0, b: 255});
 * ```
 * @param str text color to apply 24bit rgb to
 * @param color code
 */ export function rgb24(str, color) {
  if (typeof color === "number") {
    return run(str, code([
      38,
      2,
      color >> 16 & 0xff,
      color >> 8 & 0xff,
      color & 0xff
    ], 39));
  }
  return run(str, code([
    38,
    2,
    clampAndTruncate(color.r),
    clampAndTruncate(color.g),
    clampAndTruncate(color.b)
  ], 39));
}
/**
 * Set background color using 24bit rgb.
 * `color` can be a number in range `0x000000` to `0xffffff` or
 * an `Rgb`.
 *
 * To produce the color magenta:
 *
 * ```ts
 * import { bgRgb24 } from "https://deno.land/std@$STD_VERSION/fmt/colors.ts";
 *
 * bgRgb24("foo", 0xff00ff);
 * bgRgb24("foo", {r: 255, g: 0, b: 255});
 * ```
 * @param str text color to apply 24bit rgb to
 * @param color code
 */ export function bgRgb24(str, color) {
  if (typeof color === "number") {
    return run(str, code([
      48,
      2,
      color >> 16 & 0xff,
      color >> 8 & 0xff,
      color & 0xff
    ], 49));
  }
  return run(str, code([
    48,
    2,
    clampAndTruncate(color.r),
    clampAndTruncate(color.g),
    clampAndTruncate(color.b)
  ], 49));
}
// https://github.com/chalk/ansi-regex/blob/02fa893d619d3da85411acc8fd4e2eea0e95a9d9/index.js
const ANSI_PATTERN = new RegExp([
  "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
  "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))"
].join("|"), "g");
/**
 * Remove ANSI escape codes from the string.
 * @param string to remove ANSI escape codes from
 *
 *  @deprecated This will be removed in 1.0.0. Use {@linkcode stripAnsiCode} instead.
 */ export function stripColor(string) {
  return stripAnsiCode(string);
}
/**
 * Remove ANSI escape codes from the string.
 *
 * @param string to remove ANSI escape codes from
 */ export function stripAnsiCode(string) {
  return string.replace(ANSI_PATTERN, "");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIyNC4wL2ZtdC9jb2xvcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbi8vIEEgbW9kdWxlIHRvIHByaW50IEFOU0kgdGVybWluYWwgY29sb3JzLiBJbnNwaXJlZCBieSBjaGFsaywga2xldXIsIGFuZCBjb2xvcnNcbi8vIG9uIG5wbS5cblxuLyoqXG4gKiBTdHJpbmcgZm9ybWF0dGVycyBhbmQgdXRpbGl0aWVzIGZvciBkZWFsaW5nIHdpdGggQU5TSSBjb2xvciBjb2Rlcy5cbiAqXG4gKiBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG4gKlxuICogVGhpcyBtb2R1bGUgc3VwcG9ydHMgYE5PX0NPTE9SYCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlIGRpc2FibGluZyBhbnkgY29sb3JpbmdcbiAqIGlmIGBOT19DT0xPUmAgaXMgc2V0LlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHtcbiAqICAgYmdCbHVlLFxuICogICBiZ1JnYjI0LFxuICogICBiZ1JnYjgsXG4gKiAgIGJvbGQsXG4gKiAgIGl0YWxpYyxcbiAqICAgcmVkLFxuICogICByZ2IyNCxcbiAqICAgcmdiOCxcbiAqIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZm10L2NvbG9ycy50c1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnQmx1ZShpdGFsaWMocmVkKGJvbGQoXCJIZWxsbywgV29ybGQhXCIpKSkpKTtcbiAqXG4gKiAvLyBhbHNvIHN1cHBvcnRzIDhiaXQgY29sb3JzXG4gKlxuICogY29uc29sZS5sb2cocmdiOChcIkhlbGxvLCBXb3JsZCFcIiwgNDIpKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhiZ1JnYjgoXCJIZWxsbywgV29ybGQhXCIsIDQyKSk7XG4gKlxuICogLy8gYW5kIDI0Yml0IHJnYlxuICpcbiAqIGNvbnNvbGUubG9nKHJnYjI0KFwiSGVsbG8sIFdvcmxkIVwiLCB7XG4gKiAgIHI6IDQxLFxuICogICBnOiA0MixcbiAqICAgYjogNDMsXG4gKiB9KSk7XG4gKlxuICogY29uc29sZS5sb2coYmdSZ2IyNChcIkhlbGxvLCBXb3JsZCFcIiwge1xuICogICByOiA0MSxcbiAqICAgZzogNDIsXG4gKiAgIGI6IDQzLFxuICogfSkpO1xuICogYGBgXG4gKlxuICogQG1vZHVsZVxuICovXG5cbi8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG5jb25zdCB7IERlbm8gfSA9IGdsb2JhbFRoaXMgYXMgYW55O1xuY29uc3Qgbm9Db2xvciA9IHR5cGVvZiBEZW5vPy5ub0NvbG9yID09PSBcImJvb2xlYW5cIlxuICA/IERlbm8ubm9Db2xvciBhcyBib29sZWFuXG4gIDogZmFsc2U7XG5cbmludGVyZmFjZSBDb2RlIHtcbiAgb3Blbjogc3RyaW5nO1xuICBjbG9zZTogc3RyaW5nO1xuICByZWdleHA6IFJlZ0V4cDtcbn1cblxuLyoqIFJHQiA4LWJpdHMgcGVyIGNoYW5uZWwuIEVhY2ggaW4gcmFuZ2UgYDAtPjI1NWAgb3IgYDB4MDAtPjB4ZmZgICovXG5leHBvcnQgaW50ZXJmYWNlIFJnYiB7XG4gIC8qKiBSZWQgY29tcG9uZW50IHZhbHVlICovXG4gIHI6IG51bWJlcjtcbiAgLyoqIEdyZWVuIGNvbXBvbmVudCB2YWx1ZSAqL1xuICBnOiBudW1iZXI7XG4gIC8qKiBCbHVlIGNvbXBvbmVudCB2YWx1ZSAqL1xuICBiOiBudW1iZXI7XG59XG5cbmxldCBlbmFibGVkID0gIW5vQ29sb3I7XG5cbi8qKlxuICogU2V0IGNoYW5naW5nIHRleHQgY29sb3IgdG8gZW5hYmxlZCBvciBkaXNhYmxlZFxuICogQHBhcmFtIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb2xvckVuYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgaWYgKERlbm8/Lm5vQ29sb3IpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBlbmFibGVkID0gdmFsdWU7XG59XG5cbi8qKiBHZXQgd2hldGhlciB0ZXh0IGNvbG9yIGNoYW5nZSBpcyBlbmFibGVkIG9yIGRpc2FibGVkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbG9yRW5hYmxlZCgpOiBib29sZWFuIHtcbiAgcmV0dXJuIGVuYWJsZWQ7XG59XG5cbi8qKlxuICogQnVpbGRzIGNvbG9yIGNvZGVcbiAqIEBwYXJhbSBvcGVuXG4gKiBAcGFyYW0gY2xvc2VcbiAqL1xuZnVuY3Rpb24gY29kZShvcGVuOiBudW1iZXJbXSwgY2xvc2U6IG51bWJlcik6IENvZGUge1xuICByZXR1cm4ge1xuICAgIG9wZW46IGBcXHgxYlske29wZW4uam9pbihcIjtcIil9bWAsXG4gICAgY2xvc2U6IGBcXHgxYlske2Nsb3NlfW1gLFxuICAgIHJlZ2V4cDogbmV3IFJlZ0V4cChgXFxcXHgxYlxcXFxbJHtjbG9zZX1tYCwgXCJnXCIpLFxuICB9O1xufVxuXG4vKipcbiAqIEFwcGxpZXMgY29sb3IgYW5kIGJhY2tncm91bmQgYmFzZWQgb24gY29sb3IgY29kZSBhbmQgaXRzIGFzc29jaWF0ZWQgdGV4dFxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIGFwcGx5IGNvbG9yIHNldHRpbmdzIHRvXG4gKiBAcGFyYW0gY29kZSBjb2xvciBjb2RlIHRvIGFwcGx5XG4gKi9cbmZ1bmN0aW9uIHJ1bihzdHI6IHN0cmluZywgY29kZTogQ29kZSk6IHN0cmluZyB7XG4gIHJldHVybiBlbmFibGVkXG4gICAgPyBgJHtjb2RlLm9wZW59JHtzdHIucmVwbGFjZShjb2RlLnJlZ2V4cCwgY29kZS5vcGVuKX0ke2NvZGUuY2xvc2V9YFxuICAgIDogc3RyO1xufVxuXG4vKipcbiAqIFJlc2V0IHRoZSB0ZXh0IG1vZGlmaWVkLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIHJlc2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFswXSwgMCkpO1xufVxuXG4vKipcbiAqIE1ha2UgdGhlIHRleHQgYm9sZC5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGJvbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJvbGQoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMV0sIDIyKSk7XG59XG5cbi8qKlxuICogVGhlIHRleHQgZW1pdHMgb25seSBhIHNtYWxsIGFtb3VudCBvZiBsaWdodC5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBkaW1cbiAqXG4gKiBXYXJuaW5nOiBOb3QgYWxsIHRlcm1pbmFsIGVtdWxhdG9ycyBzdXBwb3J0IGBkaW1gLlxuICogRm9yIGNvbXBhdGliaWxpdHkgYWNyb3NzIGFsbCB0ZXJtaW5hbHMsIHVzZSB7QGxpbmtjb2RlIGdyYXl9IG9yIHtAbGlua2NvZGUgYnJpZ2h0QmxhY2t9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaW0oc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMl0sIDIyKSk7XG59XG5cbi8qKlxuICogTWFrZSB0aGUgdGV4dCBpdGFsaWMuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdGFsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGl0YWxpYyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszXSwgMjMpKTtcbn1cblxuLyoqXG4gKiBNYWtlIHRoZSB0ZXh0IHVuZGVybGluZS5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byB1bmRlcmxpbmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuZGVybGluZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0XSwgMjQpKTtcbn1cblxuLyoqXG4gKiBJbnZlcnQgYmFja2dyb3VuZCBjb2xvciBhbmQgdGV4dCBjb2xvci5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBpbnZlcnQgaXRzIGNvbG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzddLCAyNykpO1xufVxuXG4vKipcbiAqIE1ha2UgdGhlIHRleHQgaGlkZGVuLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIGhpZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhpZGRlbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs4XSwgMjgpKTtcbn1cblxuLyoqXG4gKiBQdXQgaG9yaXpvbnRhbCBsaW5lIHRocm91Z2ggdGhlIGNlbnRlciBvZiB0aGUgdGV4dC5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBzdHJpa2UgdGhyb3VnaFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaWtldGhyb3VnaChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5XSwgMjkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBibGFjay5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGJsYWNrXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBibGFjayhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszMF0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gcmVkLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgcmVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWQoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMzFdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGdyZWVuLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgZ3JlZW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyZWVuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzMyXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byB5ZWxsb3cuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSB5ZWxsb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHllbGxvdyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszM10sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYmx1ZS5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGJsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJsdWUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMzRdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIG1hZ2VudGEuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBtYWdlbnRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWdlbnRhKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzM1XSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBjeWFuLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgY3lhblxuICovXG5leHBvcnQgZnVuY3Rpb24gY3lhbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszNl0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gd2hpdGUuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSB3aGl0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2hpdGUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMzddLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGdyYXkuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBncmF5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncmF5KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGJyaWdodEJsYWNrKHN0cik7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IGJsYWNrLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgYnJpZ2h0LWJsYWNrXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBicmlnaHRCbGFjayhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5MF0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IHJlZC5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGJyaWdodC1yZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJyaWdodFJlZChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5MV0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IGdyZWVuLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgYnJpZ2h0LWdyZWVuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBicmlnaHRHcmVlbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5Ml0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IHllbGxvdy5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGJyaWdodC15ZWxsb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJyaWdodFllbGxvdyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5M10sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IGJsdWUuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBicmlnaHQtYmx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnJpZ2h0Qmx1ZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5NF0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IG1hZ2VudGEuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBicmlnaHQtbWFnZW50YVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnJpZ2h0TWFnZW50YShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5NV0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IGN5YW4uXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBicmlnaHQtY3lhblxuICovXG5leHBvcnQgZnVuY3Rpb24gYnJpZ2h0Q3lhbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5Nl0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IHdoaXRlLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgYnJpZ2h0LXdoaXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBicmlnaHRXaGl0ZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5N10sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYmxhY2suXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBibGFja1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCbGFjayhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0MF0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gcmVkLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgcmVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ1JlZChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0MV0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gZ3JlZW4uXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBncmVlblxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdHcmVlbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0Ml0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8geWVsbG93LlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgeWVsbG93XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ1llbGxvdyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0M10sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYmx1ZS5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGJsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQmx1ZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0NF0sIDQ5KSk7XG59XG5cbi8qKlxuICogIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIG1hZ2VudGEuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBtYWdlbnRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ01hZ2VudGEoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbNDVdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGN5YW4uXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBjeWFuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0N5YW4oc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbNDZdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIHdoaXRlLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgd2hpdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnV2hpdGUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbNDddLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCBibGFjay5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGJyaWdodC1ibGFja1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCcmlnaHRCbGFjayhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDBdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCByZWQuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBicmlnaHQtcmVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0JyaWdodFJlZChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDFdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCBncmVlbi5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGJyaWdodC1ncmVlblxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCcmlnaHRHcmVlbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDJdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCB5ZWxsb3cuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBicmlnaHQteWVsbG93XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0JyaWdodFllbGxvdyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDNdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCBibHVlLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYnJpZ2h0LWJsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQnJpZ2h0Qmx1ZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDRdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCBtYWdlbnRhLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYnJpZ2h0LW1hZ2VudGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQnJpZ2h0TWFnZW50YShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDVdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCBjeWFuLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYnJpZ2h0LWN5YW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQnJpZ2h0Q3lhbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDZdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCB3aGl0ZS5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGJyaWdodC13aGl0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCcmlnaHRXaGl0ZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDddLCA0OSkpO1xufVxuXG4vKiBTcGVjaWFsIENvbG9yIFNlcXVlbmNlcyAqL1xuXG4vKipcbiAqIENsYW0gYW5kIHRydW5jYXRlIGNvbG9yIGNvZGVzXG4gKiBAcGFyYW0gblxuICogQHBhcmFtIG1heCBudW1iZXIgdG8gdHJ1bmNhdGUgdG9cbiAqIEBwYXJhbSBtaW4gbnVtYmVyIHRvIHRydW5jYXRlIGZyb21cbiAqL1xuZnVuY3Rpb24gY2xhbXBBbmRUcnVuY2F0ZShuOiBudW1iZXIsIG1heCA9IDI1NSwgbWluID0gMCk6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLnRydW5jKE1hdGgubWF4KE1hdGgubWluKG4sIG1heCksIG1pbikpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHVzaW5nIHBhbGV0dGVkIDhiaXQgY29sb3JzLlxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSM4LWJpdFxuICogQHBhcmFtIHN0ciB0ZXh0IGNvbG9yIHRvIGFwcGx5IHBhbGV0dGVkIDhiaXQgY29sb3JzIHRvXG4gKiBAcGFyYW0gY29sb3IgY29kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmdiOChzdHI6IHN0cmluZywgY29sb3I6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszOCwgNSwgY2xhbXBBbmRUcnVuY2F0ZShjb2xvcildLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHVzaW5nIHBhbGV0dGVkIDhiaXQgY29sb3JzLlxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSM4LWJpdFxuICogQHBhcmFtIHN0ciB0ZXh0IGNvbG9yIHRvIGFwcGx5IHBhbGV0dGVkIDhiaXQgYmFja2dyb3VuZCBjb2xvcnMgdG9cbiAqIEBwYXJhbSBjb2xvciBjb2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ1JnYjgoc3RyOiBzdHJpbmcsIGNvbG9yOiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbNDgsIDUsIGNsYW1wQW5kVHJ1bmNhdGUoY29sb3IpXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB1c2luZyAyNGJpdCByZ2IuXG4gKiBgY29sb3JgIGNhbiBiZSBhIG51bWJlciBpbiByYW5nZSBgMHgwMDAwMDBgIHRvIGAweGZmZmZmZmAgb3JcbiAqIGFuIGBSZ2JgLlxuICpcbiAqIFRvIHByb2R1Y2UgdGhlIGNvbG9yIG1hZ2VudGE6XG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHJnYjI0IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZm10L2NvbG9ycy50c1wiO1xuICpcbiAqIHJnYjI0KFwiZm9vXCIsIDB4ZmYwMGZmKTtcbiAqIHJnYjI0KFwiZm9vXCIsIHtyOiAyNTUsIGc6IDAsIGI6IDI1NX0pO1xuICogYGBgXG4gKiBAcGFyYW0gc3RyIHRleHQgY29sb3IgdG8gYXBwbHkgMjRiaXQgcmdiIHRvXG4gKiBAcGFyYW0gY29sb3IgY29kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmdiMjQoc3RyOiBzdHJpbmcsIGNvbG9yOiBudW1iZXIgfCBSZ2IpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgcmV0dXJuIHJ1bihcbiAgICAgIHN0cixcbiAgICAgIGNvZGUoXG4gICAgICAgIFszOCwgMiwgKGNvbG9yID4+IDE2KSAmIDB4ZmYsIChjb2xvciA+PiA4KSAmIDB4ZmYsIGNvbG9yICYgMHhmZl0sXG4gICAgICAgIDM5LFxuICAgICAgKSxcbiAgICApO1xuICB9XG4gIHJldHVybiBydW4oXG4gICAgc3RyLFxuICAgIGNvZGUoXG4gICAgICBbXG4gICAgICAgIDM4LFxuICAgICAgICAyLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLnIpLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLmcpLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLmIpLFxuICAgICAgXSxcbiAgICAgIDM5LFxuICAgICksXG4gICk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdXNpbmcgMjRiaXQgcmdiLlxuICogYGNvbG9yYCBjYW4gYmUgYSBudW1iZXIgaW4gcmFuZ2UgYDB4MDAwMDAwYCB0byBgMHhmZmZmZmZgIG9yXG4gKiBhbiBgUmdiYC5cbiAqXG4gKiBUbyBwcm9kdWNlIHRoZSBjb2xvciBtYWdlbnRhOlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBiZ1JnYjI0IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZm10L2NvbG9ycy50c1wiO1xuICpcbiAqIGJnUmdiMjQoXCJmb29cIiwgMHhmZjAwZmYpO1xuICogYmdSZ2IyNChcImZvb1wiLCB7cjogMjU1LCBnOiAwLCBiOiAyNTV9KTtcbiAqIGBgYFxuICogQHBhcmFtIHN0ciB0ZXh0IGNvbG9yIHRvIGFwcGx5IDI0Yml0IHJnYiB0b1xuICogQHBhcmFtIGNvbG9yIGNvZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnUmdiMjQoc3RyOiBzdHJpbmcsIGNvbG9yOiBudW1iZXIgfCBSZ2IpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgcmV0dXJuIHJ1bihcbiAgICAgIHN0cixcbiAgICAgIGNvZGUoXG4gICAgICAgIFs0OCwgMiwgKGNvbG9yID4+IDE2KSAmIDB4ZmYsIChjb2xvciA+PiA4KSAmIDB4ZmYsIGNvbG9yICYgMHhmZl0sXG4gICAgICAgIDQ5LFxuICAgICAgKSxcbiAgICApO1xuICB9XG4gIHJldHVybiBydW4oXG4gICAgc3RyLFxuICAgIGNvZGUoXG4gICAgICBbXG4gICAgICAgIDQ4LFxuICAgICAgICAyLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLnIpLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLmcpLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLmIpLFxuICAgICAgXSxcbiAgICAgIDQ5LFxuICAgICksXG4gICk7XG59XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGFsay9hbnNpLXJlZ2V4L2Jsb2IvMDJmYTg5M2Q2MTlkM2RhODU0MTFhY2M4ZmQ0ZTJlZWEwZTk1YTlkOS9pbmRleC5qc1xuY29uc3QgQU5TSV9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgW1xuICAgIFwiW1xcXFx1MDAxQlxcXFx1MDA5Ql1bW1xcXFxdKCkjOz9dKig/Oig/Oig/Oig/OjtbLWEtekEtWlxcXFxkXFxcXC8jJi46PT8lQH5fXSspKnxbYS16QS1aXFxcXGRdKyg/OjtbLWEtekEtWlxcXFxkXFxcXC8jJi46PT8lQH5fXSopKik/XFxcXHUwMDA3KVwiLFxuICAgIFwiKD86KD86XFxcXGR7MSw0fSg/OjtcXFxcZHswLDR9KSopP1tcXFxcZEEtUFItVFhaY2YtbnEtdXk9Pjx+XSkpXCIsXG4gIF0uam9pbihcInxcIiksXG4gIFwiZ1wiLFxuKTtcblxuLyoqXG4gKiBSZW1vdmUgQU5TSSBlc2NhcGUgY29kZXMgZnJvbSB0aGUgc3RyaW5nLlxuICogQHBhcmFtIHN0cmluZyB0byByZW1vdmUgQU5TSSBlc2NhcGUgY29kZXMgZnJvbVxuICpcbiAqICBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHtAbGlua2NvZGUgc3RyaXBBbnNpQ29kZX0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwQ29sb3Ioc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gc3RyaXBBbnNpQ29kZShzdHJpbmcpO1xufVxuXG4vKipcbiAqIFJlbW92ZSBBTlNJIGVzY2FwZSBjb2RlcyBmcm9tIHRoZSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHN0cmluZyB0byByZW1vdmUgQU5TSSBlc2NhcGUgY29kZXMgZnJvbVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBBbnNpQ29kZShzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShBTlNJX1BBVFRFUk4sIFwiXCIpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsK0VBQStFO0FBQy9FLFVBQVU7QUFFVjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNkNDLEdBRUQsbUNBQW1DO0FBQ25DLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRztBQUNqQixNQUFNLFVBQVUsT0FBTyxNQUFNLFlBQVksWUFDckMsS0FBSyxPQUFPLEdBQ1o7QUFrQkosSUFBSSxVQUFVLENBQUM7QUFFZjs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsZ0JBQWdCLEtBQWM7RUFDNUMsSUFBSSxNQUFNLFNBQVM7SUFDakI7RUFDRjtFQUVBLFVBQVU7QUFDWjtBQUVBLDBEQUEwRCxHQUMxRCxPQUFPLFNBQVM7RUFDZCxPQUFPO0FBQ1Q7QUFFQTs7OztDQUlDLEdBQ0QsU0FBUyxLQUFLLElBQWMsRUFBRSxLQUFhO0VBQ3pDLE9BQU87SUFDTCxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9CLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdkIsUUFBUSxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRTtFQUMxQztBQUNGO0FBRUE7Ozs7Q0FJQyxHQUNELFNBQVMsSUFBSSxHQUFXLEVBQUUsSUFBVTtFQUNsQyxPQUFPLFVBQ0gsR0FBRyxLQUFLLElBQUksR0FBRyxJ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LEVBQUU7QUFDN0I7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsV0FBVyxHQUFXO0VBQ3BDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsY0FBYyxHQUFXO0VBQ3ZDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsV0FBVyxHQUFXO0VBQ3BDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsWUFBWSxHQUFXO0VBQ3JDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsUUFBUSxHQUFXO0VBQ2pDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsTUFBTSxHQUFXO0VBQy9CLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsUUFBUSxHQUFXO0VBQ2pDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsU0FBUyxHQUFXO0VBQ2xDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsT0FBTyxHQUFXO0VBQ2hDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsVUFBVSxHQUFXO0VBQ25DLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsT0FBTyxHQUFXO0VBQ2hDLE9BQU8s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
// denoCacheMetadata=4639587259403011686,11307349152240048954