// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
// A module to print ANSI terminal colors. Inspired by chalk, kleur, and colors
// on npm.
/**
 * String formatters and utilities for dealing with ANSI color codes.
 *
 * > [!IMPORTANT]
 * > If printing directly to the console, it's recommended to style console
 * > output using CSS (guide
 * > {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/console#styling_console_output | here}).
 *
 * This module supports `NO_COLOR` environmental variable disabling any coloring
 * if `NO_COLOR` is set.
 *
 * ```ts no-assert
 * import {
 *   bgBlue,
 *   bgRgb24,
 *   bgRgb8,
 *   bold,
 *   italic,
 *   red,
 *   rgb24,
 *   rgb8,
 * } from "@std/fmt/colors";
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
 * Enable or disable text color when styling.
 *
 * `@std/fmt/colors` automatically detects NO_COLOR environmental variable
 * and disables text color. Use this API only when the automatic detection
 * doesn't work.
 *
 * @example Usage
 * ```ts no-assert
 * import { setColorEnabled } from "@std/fmt/colors";
 *
 * // Disable text color
 * setColorEnabled(false);
 *
 * // Enable text color
 * setColorEnabled(true);
 * ```
 *
 * @param value The boolean value to enable or disable text color
 */ export function setColorEnabled(value) {
  if (Deno?.noColor) {
    return;
  }
  enabled = value;
}
/**
 * Get whether text color change is enabled or disabled.
 *
 * @example Usage
 * ```ts no-assert
 * import { getColorEnabled } from "@std/fmt/colors";
 *
 * console.log(getColorEnabled()); // true if enabled, false if disabled
 * ```
 * @returns `true` if text color is enabled, `false` otherwise
 */ export function getColorEnabled() {
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
 * @param str The text to apply color settings to
 * @param code The color code to apply
 */ function run(str, code) {
  return enabled ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}` : str;
}
/**
 * Reset the text modified.
 *
 * @example Usage
 * ```ts no-assert
 * import { reset } from "@std/fmt/colors";
 *
 * console.log(reset("Hello, world!"));
 * ```
 *
 * @param str The text to reset
 * @returns The text with reset color
 */ export function reset(str) {
  return run(str, code([
    0
  ], 0));
}
/**
 * Make the text bold.
 *
 * @example Usage
 * ```ts no-assert
 * import { bold } from "@std/fmt/colors";
 *
 * console.log(bold("Hello, world!"));
 * ```
 *
 * @param str The text to make bold
 * @returns The bold text
 */ export function bold(str) {
  return run(str, code([
    1
  ], 22));
}
/**
 * The text emits only a small amount of light.
 *
 * @example Usage
 * ```ts no-assert
 * import { dim } from "@std/fmt/colors";
 *
 * console.log(dim("Hello, world!"));
 * ```
 *
 * @param str The text to dim
 * @returns The dimmed text
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
 *
 * @example Usage
 * ```ts no-assert
 * import { italic } from "@std/fmt/colors";
 *
 * console.log(italic("Hello, world!"));
 * ```
 *
 * @param str The text to make italic
 * @returns The italic text
 */ export function italic(str) {
  return run(str, code([
    3
  ], 23));
}
/**
 * Make the text underline.
 *
 * @example Usage
 * ```ts no-assert
 * import { underline } from "@std/fmt/colors";
 *
 * console.log(underline("Hello, world!"));
 * ```
 *
 * @param str The text to underline
 * @returns The underlined text
 */ export function underline(str) {
  return run(str, code([
    4
  ], 24));
}
/**
 * Invert background color and text color.
 *
 * @example Usage
 * ```ts no-assert
 * import { inverse } from "@std/fmt/colors";
 *
 * console.log(inverse("Hello, world!"));
 * ```
 *
 * @param str The text to invert its color
 * @returns The inverted text
 */ export function inverse(str) {
  return run(str, code([
    7
  ], 27));
}
/**
 * Make the text hidden.
 *
 * @example Usage
 * ```ts no-assert
 * import { hidden } from "@std/fmt/colors";
 *
 * console.log(hidden("Hello, world!"));
 * ```
 *
 * @param str The text to hide
 * @returns The hidden text
 */ export function hidden(str) {
  return run(str, code([
    8
  ], 28));
}
/**
 * Put horizontal line through the center of the text.
 *
 * @example Usage
 * ```ts no-assert
 * import { strikethrough } from "@std/fmt/colors";
 *
 * console.log(strikethrough("Hello, world!"));
 * ```
 *
 * @param str The text to strike through
 * @returns The text with horizontal line through the center
 */ export function strikethrough(str) {
  return run(str, code([
    9
  ], 29));
}
/**
 * Set text color to black.
 *
 * @example Usage
 * ```ts no-assert
 * import { black } from "@std/fmt/colors";
 *
 * console.log(black("Hello, world!"));
 * ```
 *
 * @param str The text to make black
 * @returns The black text
 */ export function black(str) {
  return run(str, code([
    30
  ], 39));
}
/**
 * Set text color to red.
 *
 * @example Usage
 * ```ts no-assert
 * import { red } from "@std/fmt/colors";
 *
 * console.log(red("Hello, world!"));
 * ```
 *
 * @param str The text to make red
 * @returns The red text
 */ export function red(str) {
  return run(str, code([
    31
  ], 39));
}
/**
 * Set text color to green.
 *
 * @example Usage
 * ```ts no-assert
 * import { green } from "@std/fmt/colors";
 *
 * console.log(green("Hello, world!"));
 * ```
 *
 * @param str The text to make green
 * @returns The green text
 */ export function green(str) {
  return run(str, code([
    32
  ], 39));
}
/**
 * Set text color to yellow.
 *
 * @example Usage
 * ```ts no-assert
 * import { yellow } from "@std/fmt/colors";
 *
 * console.log(yellow("Hello, world!"));
 * ```
 *
 * @param str The text to make yellow
 * @returns The yellow text
 */ export function yellow(str) {
  return run(str, code([
    33
  ], 39));
}
/**
 * Set text color to blue.
 *
 * @example Usage
 * ```ts no-assert
 * import { blue } from "@std/fmt/colors";
 *
 * console.log(blue("Hello, world!"));
 * ```
 *
 * @param str The text to make blue
 * @returns The blue text
 */ export function blue(str) {
  return run(str, code([
    34
  ], 39));
}
/**
 * Set text color to magenta.
 *
 * @example Usage
 * ```ts no-assert
 * import { magenta } from "@std/fmt/colors";
 *
 * console.log(magenta("Hello, world!"));
 * ```
 *
 * @param str The text to make magenta
 * @returns The magenta text
 */ export function magenta(str) {
  return run(str, code([
    35
  ], 39));
}
/**
 * Set text color to cyan.
 *
 * @example Usage
 * ```ts no-assert
 * import { cyan } from "@std/fmt/colors";
 *
 * console.log(cyan("Hello, world!"));
 * ```
 *
 * @param str The text to make cyan
 * @returns The cyan text
 */ export function cyan(str) {
  return run(str, code([
    36
  ], 39));
}
/**
 * Set text color to white.
 *
 * @example Usage
 * ```ts no-assert
 * import { white } from "@std/fmt/colors";
 *
 * console.log(white("Hello, world!"));
 * ```
 *
 * @param str The text to make white
 * @returns The white text
 */ export function white(str) {
  return run(str, code([
    37
  ], 39));
}
/**
 * Set text color to gray.
 *
 * @example Usage
 * ```ts no-assert
 * import { gray } from "@std/fmt/colors";
 *
 * console.log(gray("Hello, world!"));
 * ```
 *
 * @param str The text to make gray
 * @returns The gray text
 */ export function gray(str) {
  return brightBlack(str);
}
/**
 * Set text color to bright black.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightBlack } from "@std/fmt/colors";
 *
 * console.log(brightBlack("Hello, world!"));
 * ```
 *
 * @param str The text to make bright black
 * @returns The bright black text
 */ export function brightBlack(str) {
  return run(str, code([
    90
  ], 39));
}
/**
 * Set text color to bright red.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightRed } from "@std/fmt/colors";
 *
 * console.log(brightRed("Hello, world!"));
 * ```
 *
 * @param str The text to make bright red
 * @returns The bright red text
 */ export function brightRed(str) {
  return run(str, code([
    91
  ], 39));
}
/**
 * Set text color to bright green.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightGreen } from "@std/fmt/colors";
 *
 * console.log(brightGreen("Hello, world!"));
 * ```
 *
 * @param str The text to make bright green
 * @returns The bright green text
 */ export function brightGreen(str) {
  return run(str, code([
    92
  ], 39));
}
/**
 * Set text color to bright yellow.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightYellow } from "@std/fmt/colors";
 *
 * console.log(brightYellow("Hello, world!"));
 * ```
 *
 * @param str The text to make bright yellow
 * @returns The bright yellow text
 */ export function brightYellow(str) {
  return run(str, code([
    93
  ], 39));
}
/**
 * Set text color to bright blue.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightBlue } from "@std/fmt/colors";
 *
 * console.log(brightBlue("Hello, world!"));
 * ```
 *
 * @param str The text to make bright blue
 * @returns The bright blue text
 */ export function brightBlue(str) {
  return run(str, code([
    94
  ], 39));
}
/**
 * Set text color to bright magenta.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightMagenta } from "@std/fmt/colors";
 *
 * console.log(brightMagenta("Hello, world!"));
 * ```
 *
 * @param str The text to make bright magenta
 * @returns The bright magenta text
 */ export function brightMagenta(str) {
  return run(str, code([
    95
  ], 39));
}
/**
 * Set text color to bright cyan.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightCyan } from "@std/fmt/colors";
 *
 * console.log(brightCyan("Hello, world!"));
 * ```
 *
 * @param str The text to make bright cyan
 * @returns The bright cyan text
 */ export function brightCyan(str) {
  return run(str, code([
    96
  ], 39));
}
/**
 * Set text color to bright white.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightWhite } from "@std/fmt/colors";
 *
 * console.log(brightWhite("Hello, world!"));
 * ```
 *
 * @param str The text to make bright white
 * @returns The bright white text
 */ export function brightWhite(str) {
  return run(str, code([
    97
  ], 39));
}
/**
 * Set background color to black.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBlack } from "@std/fmt/colors";
 *
 * console.log(bgBlack("Hello, world!"));
 * ```
 *
 * @param str The text to make its background black
 * @returns The text with black background
 */ export function bgBlack(str) {
  return run(str, code([
    40
  ], 49));
}
/**
 * Set background color to red.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgRed } from "@std/fmt/colors";
 *
 * console.log(bgRed("Hello, world!"));
 * ```
 *
 * @param str The text to make its background red
 * @returns The text with red background
 */ export function bgRed(str) {
  return run(str, code([
    41
  ], 49));
}
/**
 * Set background color to green.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgGreen } from "@std/fmt/colors";
 *
 * console.log(bgGreen("Hello, world!"));
 * ```
 *
 * @param str The text to make its background green
 * @returns The text with green background
 */ export function bgGreen(str) {
  return run(str, code([
    42
  ], 49));
}
/**
 * Set background color to yellow.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgYellow } from "@std/fmt/colors";
 *
 * console.log(bgYellow("Hello, world!"));
 * ```
 *
 * @param str The text to make its background yellow
 * @returns The text with yellow background
 */ export function bgYellow(str) {
  return run(str, code([
    43
  ], 49));
}
/**
 * Set background color to blue.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBlue } from "@std/fmt/colors";
 *
 * console.log(bgBlue("Hello, world!"));
 * ```
 *
 * @param str The text to make its background blue
 * @returns The text with blue background
 */ export function bgBlue(str) {
  return run(str, code([
    44
  ], 49));
}
/**
 *  Set background color to magenta.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgMagenta } from "@std/fmt/colors";
 *
 * console.log(bgMagenta("Hello, world!"));
 * ```
 *
 * @param str The text to make its background magenta
 * @returns The text with magenta background
 */ export function bgMagenta(str) {
  return run(str, code([
    45
  ], 49));
}
/**
 * Set background color to cyan.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgCyan } from "@std/fmt/colors";
 *
 * console.log(bgCyan("Hello, world!"));
 * ```
 *
 * @param str The text to make its background cyan
 * @returns The text with cyan background
 */ export function bgCyan(str) {
  return run(str, code([
    46
  ], 49));
}
/**
 * Set background color to white.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgWhite } from "@std/fmt/colors";
 *
 * console.log(bgWhite("Hello, world!"));
 * ```
 *
 * @param str The text to make its background white
 * @returns The text with white background
 */ export function bgWhite(str) {
  return run(str, code([
    47
  ], 49));
}
/**
 * Set background color to bright black.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightBlack } from "@std/fmt/colors";
 *
 * console.log(bgBrightBlack("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright black
 * @returns The text with bright black background
 */ export function bgBrightBlack(str) {
  return run(str, code([
    100
  ], 49));
}
/**
 * Set background color to bright red.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightRed } from "@std/fmt/colors";
 *
 * console.log(bgBrightRed("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright red
 * @returns The text with bright red background
 */ export function bgBrightRed(str) {
  return run(str, code([
    101
  ], 49));
}
/**
 * Set background color to bright green.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightGreen } from "@std/fmt/colors";
 *
 * console.log(bgBrightGreen("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright green
 * @returns The text with bright green background
 */ export function bgBrightGreen(str) {
  return run(str, code([
    102
  ], 49));
}
/**
 * Set background color to bright yellow.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightYellow } from "@std/fmt/colors";
 *
 * console.log(bgBrightYellow("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright yellow
 * @returns The text with bright yellow background
 */ export function bgBrightYellow(str) {
  return run(str, code([
    103
  ], 49));
}
/**
 * Set background color to bright blue.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightBlue } from "@std/fmt/colors";
 *
 * console.log(bgBrightBlue("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright blue
 * @returns The text with bright blue background
 */ export function bgBrightBlue(str) {
  return run(str, code([
    104
  ], 49));
}
/**
 * Set background color to bright magenta.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightMagenta } from "@std/fmt/colors";
 *
 * console.log(bgBrightMagenta("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright magenta
 * @returns The text with bright magenta background
 */ export function bgBrightMagenta(str) {
  return run(str, code([
    105
  ], 49));
}
/**
 * Set background color to bright cyan.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightCyan } from "@std/fmt/colors";
 *
 * console.log(bgBrightCyan("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright cyan
 * @returns The text with bright cyan background
 */ export function bgBrightCyan(str) {
  return run(str, code([
    106
  ], 49));
}
/**
 * Set background color to bright white.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightWhite } from "@std/fmt/colors";
 *
 * console.log(bgBrightWhite("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright white
 * @returns The text with bright white background
 */ export function bgBrightWhite(str) {
  return run(str, code([
    107
  ], 49));
}
/* Special Color Sequences */ /**
 * Clam and truncate color codes
 * @param n The input number
 * @param max The number to truncate to
 * @param min The number to truncate from
 */ function clampAndTruncate(n, max = 255, min = 0) {
  return Math.trunc(Math.max(Math.min(n, max), min));
}
/**
 * Set text color using paletted 8bit colors.
 * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
 *
 * @example Usage
 * ```ts no-assert
 * import { rgb8 } from "@std/fmt/colors";
 *
 * console.log(rgb8("Hello, world!", 42));
 * ```
 *
 * @param str The text color to apply paletted 8bit colors to
 * @param color The color code
 * @returns The text with paletted 8bit color
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
 *
 * @example Usage
 * ```ts no-assert
 * import { bgRgb8 } from "@std/fmt/colors";
 *
 * console.log(bgRgb8("Hello, world!", 42));
 * ```
 *
 * @param str The text color to apply paletted 8bit background colors to
 * @param color code
 * @returns The text with paletted 8bit background color
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
 * @example To produce the color magenta:
 * ```ts no-assert
 * import { rgb24 } from "@std/fmt/colors";
 *
 * rgb24("foo", 0xff00ff);
 * rgb24("foo", {r: 255, g: 0, b: 255});
 * ```
 * @param str The text color to apply 24bit rgb to
 * @param color The color code
 * @returns The text with 24bit rgb color
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
 * @example To produce the color magenta:
 * ```ts no-assert
 * import { bgRgb24 } from "@std/fmt/colors";
 *
 * bgRgb24("foo", 0xff00ff);
 * bgRgb24("foo", {r: 255, g: 0, b: 255});
 * ```
 * @param str The text color to apply 24bit rgb to
 * @param color The color code
 * @returns The text with 24bit rgb color
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
 *
 * @example Usage
 * ```ts no-assert
 * import { stripAnsiCode, red } from "@std/fmt/colors";
 *
 * console.log(stripAnsiCode(red("Hello, world!")));
 * ```
 *
 * @param string The text to remove ANSI escape codes from
 * @returns The text without ANSI escape codes
 */ export function stripAnsiCode(string) {
  return string.replace(ANSI_PATTERN, "");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZm10LzEuMC4yL2NvbG9ycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuLy8gQSBtb2R1bGUgdG8gcHJpbnQgQU5TSSB0ZXJtaW5hbCBjb2xvcnMuIEluc3BpcmVkIGJ5IGNoYWxrLCBrbGV1ciwgYW5kIGNvbG9yc1xuLy8gb24gbnBtLlxuXG4vKipcbiAqIFN0cmluZyBmb3JtYXR0ZXJzIGFuZCB1dGlsaXRpZXMgZm9yIGRlYWxpbmcgd2l0aCBBTlNJIGNvbG9yIGNvZGVzLlxuICpcbiAqID4gWyFJTVBPUlRBTlRdXG4gKiA+IElmIHByaW50aW5nIGRpcmVjdGx5IHRvIHRoZSBjb25zb2xlLCBpdCdzIHJlY29tbWVuZGVkIHRvIHN0eWxlIGNvbnNvbGVcbiAqID4gb3V0cHV0IHVzaW5nIENTUyAoZ3VpZGVcbiAqID4ge0BsaW5rY29kZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvY29uc29sZSNzdHlsaW5nX2NvbnNvbGVfb3V0cHV0IHwgaGVyZX0pLlxuICpcbiAqIFRoaXMgbW9kdWxlIHN1cHBvcnRzIGBOT19DT0xPUmAgZW52aXJvbm1lbnRhbCB2YXJpYWJsZSBkaXNhYmxpbmcgYW55IGNvbG9yaW5nXG4gKiBpZiBgTk9fQ09MT1JgIGlzIHNldC5cbiAqXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7XG4gKiAgIGJnQmx1ZSxcbiAqICAgYmdSZ2IyNCxcbiAqICAgYmdSZ2I4LFxuICogICBib2xkLFxuICogICBpdGFsaWMsXG4gKiAgIHJlZCxcbiAqICAgcmdiMjQsXG4gKiAgIHJnYjgsXG4gKiB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhiZ0JsdWUoaXRhbGljKHJlZChib2xkKFwiSGVsbG8sIFdvcmxkIVwiKSkpKSk7XG4gKlxuICogLy8gYWxzbyBzdXBwb3J0cyA4Yml0IGNvbG9yc1xuICpcbiAqIGNvbnNvbGUubG9nKHJnYjgoXCJIZWxsbywgV29ybGQhXCIsIDQyKSk7XG4gKlxuICogY29uc29sZS5sb2coYmdSZ2I4KFwiSGVsbG8sIFdvcmxkIVwiLCA0MikpO1xuICpcbiAqIC8vIGFuZCAyNGJpdCByZ2JcbiAqXG4gKiBjb25zb2xlLmxvZyhyZ2IyNChcIkhlbGxvLCBXb3JsZCFcIiwge1xuICogICByOiA0MSxcbiAqICAgZzogNDIsXG4gKiAgIGI6IDQzLFxuICogfSkpO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnUmdiMjQoXCJIZWxsbywgV29ybGQhXCIsIHtcbiAqICAgcjogNDEsXG4gKiAgIGc6IDQyLFxuICogICBiOiA0MyxcbiAqIH0pKTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuY29uc3QgeyBEZW5vIH0gPSBnbG9iYWxUaGlzIGFzIGFueTtcbmNvbnN0IG5vQ29sb3IgPSB0eXBlb2YgRGVubz8ubm9Db2xvciA9PT0gXCJib29sZWFuXCJcbiAgPyBEZW5vLm5vQ29sb3IgYXMgYm9vbGVhblxuICA6IGZhbHNlO1xuXG5pbnRlcmZhY2UgQ29kZSB7XG4gIG9wZW46IHN0cmluZztcbiAgY2xvc2U6IHN0cmluZztcbiAgcmVnZXhwOiBSZWdFeHA7XG59XG5cbi8qKiBSR0IgOC1iaXRzIHBlciBjaGFubmVsLiBFYWNoIGluIHJhbmdlIGAwLT4yNTVgIG9yIGAweDAwLT4weGZmYCAqL1xuZXhwb3J0IGludGVyZmFjZSBSZ2Ige1xuICAvKiogUmVkIGNvbXBvbmVudCB2YWx1ZSAqL1xuICByOiBudW1iZXI7XG4gIC8qKiBHcmVlbiBjb21wb25lbnQgdmFsdWUgKi9cbiAgZzogbnVtYmVyO1xuICAvKiogQmx1ZSBjb21wb25lbnQgdmFsdWUgKi9cbiAgYjogbnVtYmVyO1xufVxuXG5sZXQgZW5hYmxlZCA9ICFub0NvbG9yO1xuXG4vKipcbiAqIEVuYWJsZSBvciBkaXNhYmxlIHRleHQgY29sb3Igd2hlbiBzdHlsaW5nLlxuICpcbiAqIGBAc3RkL2ZtdC9jb2xvcnNgIGF1dG9tYXRpY2FsbHkgZGV0ZWN0cyBOT19DT0xPUiBlbnZpcm9ubWVudGFsIHZhcmlhYmxlXG4gKiBhbmQgZGlzYWJsZXMgdGV4dCBjb2xvci4gVXNlIHRoaXMgQVBJIG9ubHkgd2hlbiB0aGUgYXV0b21hdGljIGRldGVjdGlvblxuICogZG9lc24ndCB3b3JrLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHNldENvbG9yRW5hYmxlZCB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiAvLyBEaXNhYmxlIHRleHQgY29sb3JcbiAqIHNldENvbG9yRW5hYmxlZChmYWxzZSk7XG4gKlxuICogLy8gRW5hYmxlIHRleHQgY29sb3JcbiAqIHNldENvbG9yRW5hYmxlZCh0cnVlKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgYm9vbGVhbiB2YWx1ZSB0byBlbmFibGUgb3IgZGlzYWJsZSB0ZXh0IGNvbG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb2xvckVuYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgaWYgKERlbm8/Lm5vQ29sb3IpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBlbmFibGVkID0gdmFsdWU7XG59XG5cbi8qKlxuICogR2V0IHdoZXRoZXIgdGV4dCBjb2xvciBjaGFuZ2UgaXMgZW5hYmxlZCBvciBkaXNhYmxlZC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBnZXRDb2xvckVuYWJsZWQgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coZ2V0Q29sb3JFbmFibGVkKCkpOyAvLyB0cnVlIGlmIGVuYWJsZWQsIGZhbHNlIGlmIGRpc2FibGVkXG4gKiBgYGBcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0ZXh0IGNvbG9yIGlzIGVuYWJsZWQsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb2xvckVuYWJsZWQoKTogYm9vbGVhbiB7XG4gIHJldHVybiBlbmFibGVkO1xufVxuXG4vKipcbiAqIEJ1aWxkcyBjb2xvciBjb2RlXG4gKiBAcGFyYW0gb3BlblxuICogQHBhcmFtIGNsb3NlXG4gKi9cbmZ1bmN0aW9uIGNvZGUob3BlbjogbnVtYmVyW10sIGNsb3NlOiBudW1iZXIpOiBDb2RlIHtcbiAgcmV0dXJuIHtcbiAgICBvcGVuOiBgXFx4MWJbJHtvcGVuLmpvaW4oXCI7XCIpfW1gLFxuICAgIGNsb3NlOiBgXFx4MWJbJHtjbG9zZX1tYCxcbiAgICByZWdleHA6IG5ldyBSZWdFeHAoYFxcXFx4MWJcXFxcWyR7Y2xvc2V9bWAsIFwiZ1wiKSxcbiAgfTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGNvbG9yIGFuZCBiYWNrZ3JvdW5kIGJhc2VkIG9uIGNvbG9yIGNvZGUgYW5kIGl0cyBhc3NvY2lhdGVkIHRleHRcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gYXBwbHkgY29sb3Igc2V0dGluZ3MgdG9cbiAqIEBwYXJhbSBjb2RlIFRoZSBjb2xvciBjb2RlIHRvIGFwcGx5XG4gKi9cbmZ1bmN0aW9uIHJ1bihzdHI6IHN0cmluZywgY29kZTogQ29kZSk6IHN0cmluZyB7XG4gIHJldHVybiBlbmFibGVkXG4gICAgPyBgJHtjb2RlLm9wZW59JHtzdHIucmVwbGFjZShjb2RlLnJlZ2V4cCwgY29kZS5vcGVuKX0ke2NvZGUuY2xvc2V9YFxuICAgIDogc3RyO1xufVxuXG4vKipcbiAqIFJlc2V0IHRoZSB0ZXh0IG1vZGlmaWVkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHJlc2V0IH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKHJlc2V0KFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIHJlc2V0XG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIHJlc2V0IGNvbG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFswXSwgMCkpO1xufVxuXG4vKipcbiAqIE1ha2UgdGhlIHRleHQgYm9sZC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBib2xkIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJvbGQoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBib2xkXG4gKiBAcmV0dXJucyBUaGUgYm9sZCB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBib2xkKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzFdLCAyMikpO1xufVxuXG4vKipcbiAqIFRoZSB0ZXh0IGVtaXRzIG9ubHkgYSBzbWFsbCBhbW91bnQgb2YgbGlnaHQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgZGltIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGRpbShcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBkaW1cbiAqIEByZXR1cm5zIFRoZSBkaW1tZWQgdGV4dFxuICpcbiAqIFdhcm5pbmc6IE5vdCBhbGwgdGVybWluYWwgZW11bGF0b3JzIHN1cHBvcnQgYGRpbWAuXG4gKiBGb3IgY29tcGF0aWJpbGl0eSBhY3Jvc3MgYWxsIHRlcm1pbmFscywgdXNlIHtAbGlua2NvZGUgZ3JheX0gb3Ige0BsaW5rY29kZSBicmlnaHRCbGFja30gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpbShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsyXSwgMjIpKTtcbn1cblxuLyoqXG4gKiBNYWtlIHRoZSB0ZXh0IGl0YWxpYy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBpdGFsaWMgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coaXRhbGljKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRhbGljXG4gKiBAcmV0dXJucyBUaGUgaXRhbGljIHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGl0YWxpYyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszXSwgMjMpKTtcbn1cblxuLyoqXG4gKiBNYWtlIHRoZSB0ZXh0IHVuZGVybGluZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyB1bmRlcmxpbmUgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2codW5kZXJsaW5lKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIHVuZGVybGluZVxuICogQHJldHVybnMgVGhlIHVuZGVybGluZWQgdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5kZXJsaW5lKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzRdLCAyNCkpO1xufVxuXG4vKipcbiAqIEludmVydCBiYWNrZ3JvdW5kIGNvbG9yIGFuZCB0ZXh0IGNvbG9yLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGludmVyc2UgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coaW52ZXJzZShcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBpbnZlcnQgaXRzIGNvbG9yXG4gKiBAcmV0dXJucyBUaGUgaW52ZXJ0ZWQgdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs3XSwgMjcpKTtcbn1cblxuLyoqXG4gKiBNYWtlIHRoZSB0ZXh0IGhpZGRlbi5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBoaWRkZW4gfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coaGlkZGVuKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIGhpZGVcbiAqIEByZXR1cm5zIFRoZSBoaWRkZW4gdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGlkZGVuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzhdLCAyOCkpO1xufVxuXG4vKipcbiAqIFB1dCBob3Jpem9udGFsIGxpbmUgdGhyb3VnaCB0aGUgY2VudGVyIG9mIHRoZSB0ZXh0LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHN0cmlrZXRocm91Z2ggfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coc3RyaWtldGhyb3VnaChcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBzdHJpa2UgdGhyb3VnaFxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBob3Jpem9udGFsIGxpbmUgdGhyb3VnaCB0aGUgY2VudGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpa2V0aHJvdWdoKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzldLCAyOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGJsYWNrLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJsYWNrIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJsYWNrKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgYmxhY2tcbiAqIEByZXR1cm5zIFRoZSBibGFjayB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBibGFjayhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszMF0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gcmVkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHJlZCB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhyZWQoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSByZWRcbiAqIEByZXR1cm5zIFRoZSByZWQgdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVkKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzMxXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBncmVlbi5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBncmVlbiB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhncmVlbihcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGdyZWVuXG4gKiBAcmV0dXJucyBUaGUgZ3JlZW4gdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JlZW4oc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMzJdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIHllbGxvdy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyB5ZWxsb3cgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coeWVsbG93KFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgeWVsbG93XG4gKiBAcmV0dXJucyBUaGUgeWVsbG93IHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHllbGxvdyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszM10sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYmx1ZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBibHVlIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJsdWUoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBibHVlXG4gKiBAcmV0dXJucyBUaGUgYmx1ZSB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBibHVlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzM0XSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBtYWdlbnRhLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IG1hZ2VudGEgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2cobWFnZW50YShcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIG1hZ2VudGFcbiAqIEByZXR1cm5zIFRoZSBtYWdlbnRhIHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hZ2VudGEoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMzVdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGN5YW4uXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgY3lhbiB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhjeWFuKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgY3lhblxuICogQHJldHVybnMgVGhlIGN5YW4gdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3lhbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszNl0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gd2hpdGUuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgd2hpdGUgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2cod2hpdGUoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSB3aGl0ZVxuICogQHJldHVybnMgVGhlIHdoaXRlIHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdoaXRlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzM3XSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBncmF5LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGdyYXkgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coZ3JheShcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGdyYXlcbiAqIEByZXR1cm5zIFRoZSBncmF5IHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyYXkoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYnJpZ2h0QmxhY2soc3RyKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgYmxhY2suXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYnJpZ2h0QmxhY2sgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYnJpZ2h0QmxhY2soXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBicmlnaHQgYmxhY2tcbiAqIEByZXR1cm5zIFRoZSBicmlnaHQgYmxhY2sgdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYnJpZ2h0QmxhY2soc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbOTBdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGJyaWdodCByZWQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYnJpZ2h0UmVkIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJyaWdodFJlZChcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGJyaWdodCByZWRcbiAqIEByZXR1cm5zIFRoZSBicmlnaHQgcmVkIHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJyaWdodFJlZChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5MV0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IGdyZWVuLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJyaWdodEdyZWVuIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJyaWdodEdyZWVuKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgYnJpZ2h0IGdyZWVuXG4gKiBAcmV0dXJucyBUaGUgYnJpZ2h0IGdyZWVuIHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJyaWdodEdyZWVuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzkyXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgeWVsbG93LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJyaWdodFllbGxvdyB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhicmlnaHRZZWxsb3coXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBicmlnaHQgeWVsbG93XG4gKiBAcmV0dXJucyBUaGUgYnJpZ2h0IHllbGxvdyB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBicmlnaHRZZWxsb3coc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbOTNdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGJyaWdodCBibHVlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJyaWdodEJsdWUgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYnJpZ2h0Qmx1ZShcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGJyaWdodCBibHVlXG4gKiBAcmV0dXJucyBUaGUgYnJpZ2h0IGJsdWUgdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYnJpZ2h0Qmx1ZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5NF0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IG1hZ2VudGEuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYnJpZ2h0TWFnZW50YSB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhicmlnaHRNYWdlbnRhKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgYnJpZ2h0IG1hZ2VudGFcbiAqIEByZXR1cm5zIFRoZSBicmlnaHQgbWFnZW50YSB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBicmlnaHRNYWdlbnRhKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzk1XSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgY3lhbi5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBicmlnaHRDeWFuIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJyaWdodEN5YW4oXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBicmlnaHQgY3lhblxuICogQHJldHVybnMgVGhlIGJyaWdodCBjeWFuIHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJyaWdodEN5YW4oc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbOTZdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGJyaWdodCB3aGl0ZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBicmlnaHRXaGl0ZSB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhicmlnaHRXaGl0ZShcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGJyaWdodCB3aGl0ZVxuICogQHJldHVybnMgVGhlIGJyaWdodCB3aGl0ZSB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBicmlnaHRXaGl0ZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5N10sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYmxhY2suXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdCbGFjayB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhiZ0JsYWNrKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYmxhY2tcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggYmxhY2sgYmFja2dyb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCbGFjayhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0MF0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gcmVkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJnUmVkIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnUmVkKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgcmVkXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIHJlZCBiYWNrZ3JvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ1JlZChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0MV0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gZ3JlZW4uXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdHcmVlbiB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhiZ0dyZWVuKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgZ3JlZW5cbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggZ3JlZW4gYmFja2dyb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdHcmVlbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0Ml0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8geWVsbG93LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJnWWVsbG93IH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnWWVsbG93KFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgeWVsbG93XG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIHllbGxvdyBiYWNrZ3JvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ1llbGxvdyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0M10sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYmx1ZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBiZ0JsdWUgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdCbHVlKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYmx1ZVxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBibHVlIGJhY2tncm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQmx1ZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0NF0sIDQ5KSk7XG59XG5cbi8qKlxuICogIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIG1hZ2VudGEuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdNYWdlbnRhIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnTWFnZW50YShcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIG1hZ2VudGFcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggbWFnZW50YSBiYWNrZ3JvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ01hZ2VudGEoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbNDVdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGN5YW4uXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdDeWFuIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnQ3lhbihcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGN5YW5cbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggY3lhbiBiYWNrZ3JvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0N5YW4oc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbNDZdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIHdoaXRlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJnV2hpdGUgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdXaGl0ZShcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIHdoaXRlXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIHdoaXRlIGJhY2tncm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnV2hpdGUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbNDddLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCBibGFjay5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBiZ0JyaWdodEJsYWNrIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnQnJpZ2h0QmxhY2soXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBicmlnaHQgYmxhY2tcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggYnJpZ2h0IGJsYWNrIGJhY2tncm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQnJpZ2h0QmxhY2soc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMTAwXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBicmlnaHQgcmVkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJnQnJpZ2h0UmVkIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnQnJpZ2h0UmVkKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYnJpZ2h0IHJlZFxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBicmlnaHQgcmVkIGJhY2tncm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQnJpZ2h0UmVkKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwMV0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IGdyZWVuLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJnQnJpZ2h0R3JlZW4gfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdCcmlnaHRHcmVlbihcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGJyaWdodCBncmVlblxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBicmlnaHQgZ3JlZW4gYmFja2dyb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCcmlnaHRHcmVlbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDJdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCB5ZWxsb3cuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdCcmlnaHRZZWxsb3cgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdCcmlnaHRZZWxsb3coXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBicmlnaHQgeWVsbG93XG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIGJyaWdodCB5ZWxsb3cgYmFja2dyb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCcmlnaHRZZWxsb3coc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMTAzXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBicmlnaHQgYmx1ZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBiZ0JyaWdodEJsdWUgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdCcmlnaHRCbHVlKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYnJpZ2h0IGJsdWVcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggYnJpZ2h0IGJsdWUgYmFja2dyb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCcmlnaHRCbHVlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwNF0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IG1hZ2VudGEuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdCcmlnaHRNYWdlbnRhIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnQnJpZ2h0TWFnZW50YShcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGJyaWdodCBtYWdlbnRhXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIGJyaWdodCBtYWdlbnRhIGJhY2tncm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQnJpZ2h0TWFnZW50YShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDVdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCBjeWFuLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJnQnJpZ2h0Q3lhbiB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhiZ0JyaWdodEN5YW4oXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBicmlnaHQgY3lhblxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBicmlnaHQgY3lhbiBiYWNrZ3JvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0JyaWdodEN5YW4oc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMTA2XSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBicmlnaHQgd2hpdGUuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdCcmlnaHRXaGl0ZSB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhiZ0JyaWdodFdoaXRlKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYnJpZ2h0IHdoaXRlXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIGJyaWdodCB3aGl0ZSBiYWNrZ3JvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0JyaWdodFdoaXRlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwN10sIDQ5KSk7XG59XG5cbi8qIFNwZWNpYWwgQ29sb3IgU2VxdWVuY2VzICovXG5cbi8qKlxuICogQ2xhbSBhbmQgdHJ1bmNhdGUgY29sb3IgY29kZXNcbiAqIEBwYXJhbSBuIFRoZSBpbnB1dCBudW1iZXJcbiAqIEBwYXJhbSBtYXggVGhlIG51bWJlciB0byB0cnVuY2F0ZSB0b1xuICogQHBhcmFtIG1pbiBUaGUgbnVtYmVyIHRvIHRydW5jYXRlIGZyb21cbiAqL1xuZnVuY3Rpb24gY2xhbXBBbmRUcnVuY2F0ZShuOiBudW1iZXIsIG1heCA9IDI1NSwgbWluID0gMCk6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLnRydW5jKE1hdGgubWF4KE1hdGgubWluKG4sIG1heCksIG1pbikpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHVzaW5nIHBhbGV0dGVkIDhiaXQgY29sb3JzLlxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSM4LWJpdFxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHJnYjggfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2cocmdiOChcIkhlbGxvLCB3b3JsZCFcIiwgNDIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgY29sb3IgdG8gYXBwbHkgcGFsZXR0ZWQgOGJpdCBjb2xvcnMgdG9cbiAqIEBwYXJhbSBjb2xvciBUaGUgY29sb3IgY29kZVxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBwYWxldHRlZCA4Yml0IGNvbG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZ2I4KHN0cjogc3RyaW5nLCBjb2xvcjogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzM4LCA1LCBjbGFtcEFuZFRydW5jYXRlKGNvbG9yKV0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdXNpbmcgcGFsZXR0ZWQgOGJpdCBjb2xvcnMuXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlIzgtYml0XG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdSZ2I4IH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnUmdiOChcIkhlbGxvLCB3b3JsZCFcIiwgNDIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgY29sb3IgdG8gYXBwbHkgcGFsZXR0ZWQgOGJpdCBiYWNrZ3JvdW5kIGNvbG9ycyB0b1xuICogQHBhcmFtIGNvbG9yIGNvZGVcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggcGFsZXR0ZWQgOGJpdCBiYWNrZ3JvdW5kIGNvbG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ1JnYjgoc3RyOiBzdHJpbmcsIGNvbG9yOiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbNDgsIDUsIGNsYW1wQW5kVHJ1bmNhdGUoY29sb3IpXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB1c2luZyAyNGJpdCByZ2IuXG4gKiBgY29sb3JgIGNhbiBiZSBhIG51bWJlciBpbiByYW5nZSBgMHgwMDAwMDBgIHRvIGAweGZmZmZmZmAgb3JcbiAqIGFuIGBSZ2JgLlxuICpcbiAqIEBleGFtcGxlIFRvIHByb2R1Y2UgdGhlIGNvbG9yIG1hZ2VudGE6XG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHJnYjI0IH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIHJnYjI0KFwiZm9vXCIsIDB4ZmYwMGZmKTtcbiAqIHJnYjI0KFwiZm9vXCIsIHtyOiAyNTUsIGc6IDAsIGI6IDI1NX0pO1xuICogYGBgXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IGNvbG9yIHRvIGFwcGx5IDI0Yml0IHJnYiB0b1xuICogQHBhcmFtIGNvbG9yIFRoZSBjb2xvciBjb2RlXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIDI0Yml0IHJnYiBjb2xvclxuICovXG5leHBvcnQgZnVuY3Rpb24gcmdiMjQoc3RyOiBzdHJpbmcsIGNvbG9yOiBudW1iZXIgfCBSZ2IpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgcmV0dXJuIHJ1bihcbiAgICAgIHN0cixcbiAgICAgIGNvZGUoXG4gICAgICAgIFszOCwgMiwgKGNvbG9yID4+IDE2KSAmIDB4ZmYsIChjb2xvciA+PiA4KSAmIDB4ZmYsIGNvbG9yICYgMHhmZl0sXG4gICAgICAgIDM5LFxuICAgICAgKSxcbiAgICApO1xuICB9XG4gIHJldHVybiBydW4oXG4gICAgc3RyLFxuICAgIGNvZGUoXG4gICAgICBbXG4gICAgICAgIDM4LFxuICAgICAgICAyLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLnIpLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLmcpLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLmIpLFxuICAgICAgXSxcbiAgICAgIDM5LFxuICAgICksXG4gICk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdXNpbmcgMjRiaXQgcmdiLlxuICogYGNvbG9yYCBjYW4gYmUgYSBudW1iZXIgaW4gcmFuZ2UgYDB4MDAwMDAwYCB0byBgMHhmZmZmZmZgIG9yXG4gKiBhbiBgUmdiYC5cbiAqXG4gKiBAZXhhbXBsZSBUbyBwcm9kdWNlIHRoZSBjb2xvciBtYWdlbnRhOlxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBiZ1JnYjI0IH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGJnUmdiMjQoXCJmb29cIiwgMHhmZjAwZmYpO1xuICogYmdSZ2IyNChcImZvb1wiLCB7cjogMjU1LCBnOiAwLCBiOiAyNTV9KTtcbiAqIGBgYFxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCBjb2xvciB0byBhcHBseSAyNGJpdCByZ2IgdG9cbiAqIEBwYXJhbSBjb2xvciBUaGUgY29sb3IgY29kZVxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCAyNGJpdCByZ2IgY29sb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnUmdiMjQoc3RyOiBzdHJpbmcsIGNvbG9yOiBudW1iZXIgfCBSZ2IpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgcmV0dXJuIHJ1bihcbiAgICAgIHN0cixcbiAgICAgIGNvZGUoXG4gICAgICAgIFs0OCwgMiwgKGNvbG9yID4+IDE2KSAmIDB4ZmYsIChjb2xvciA+PiA4KSAmIDB4ZmYsIGNvbG9yICYgMHhmZl0sXG4gICAgICAgIDQ5LFxuICAgICAgKSxcbiAgICApO1xuICB9XG4gIHJldHVybiBydW4oXG4gICAgc3RyLFxuICAgIGNvZGUoXG4gICAgICBbXG4gICAgICAgIDQ4LFxuICAgICAgICAyLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLnIpLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLmcpLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLmIpLFxuICAgICAgXSxcbiAgICAgIDQ5LFxuICAgICksXG4gICk7XG59XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGFsay9hbnNpLXJlZ2V4L2Jsb2IvMDJmYTg5M2Q2MTlkM2RhODU0MTFhY2M4ZmQ0ZTJlZWEwZTk1YTlkOS9pbmRleC5qc1xuY29uc3QgQU5TSV9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgW1xuICAgIFwiW1xcXFx1MDAxQlxcXFx1MDA5Ql1bW1xcXFxdKCkjOz9dKig/Oig/Oig/Oig/OjtbLWEtekEtWlxcXFxkXFxcXC8jJi46PT8lQH5fXSspKnxbYS16QS1aXFxcXGRdKyg/OjtbLWEtekEtWlxcXFxkXFxcXC8jJi46PT8lQH5fXSopKik/XFxcXHUwMDA3KVwiLFxuICAgIFwiKD86KD86XFxcXGR7MSw0fSg/OjtcXFxcZHswLDR9KSopP1tcXFxcZEEtUFItVFhaY2YtbnEtdXk9Pjx+XSkpXCIsXG4gIF0uam9pbihcInxcIiksXG4gIFwiZ1wiLFxuKTtcblxuLyoqXG4gKiBSZW1vdmUgQU5TSSBlc2NhcGUgY29kZXMgZnJvbSB0aGUgc3RyaW5nLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHN0cmlwQW5zaUNvZGUsIHJlZCB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhzdHJpcEFuc2lDb2RlKHJlZChcIkhlbGxvLCB3b3JsZCFcIikpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHJpbmcgVGhlIHRleHQgdG8gcmVtb3ZlIEFOU0kgZXNjYXBlIGNvZGVzIGZyb21cbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGhvdXQgQU5TSSBlc2NhcGUgY29kZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwQW5zaUNvZGUoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoQU5TSV9QQVRURVJOLCBcIlwiKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBQ3JDLCtFQUErRTtBQUMvRSxVQUFVO0FBRVY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBK0NDLEdBRUQsbUNBQW1DO0FBQ25DLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRztBQUNqQixNQUFNLFVBQVUsT0FBTyxNQUFNLFlBQVksWUFDckMsS0FBSyxPQUFPLEdBQ1o7QUFrQkosSUFBSSxVQUFVLENBQUM7QUFFZjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CQyxHQUNELE9BQU8sU0FBUyxnQkFBZ0IsS0FBYztFQUM1QyxJQUFJLE1BQU0sU0FBUztJQUNqQjtFQUNGO0VBRUEsVUFBVTtBQUNaO0FBRUE7Ozs7Ozs7Ozs7Q0FVQyxHQUNELE9BQU8sU0FBUztFQUNkLE9BQU87QUFDVDtBQUVBOzs7O0NBSUMsR0FDRCxTQUFTLEtBQUssSUFBYyxFQUFFLEtBQWE7RUFDekMsT0FBTztJQUNMLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0IsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN2QixRQUFRLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFO0VBQzFDO0FBQ0Y7QUFFQTs7OztDQUlDLEdBQ0QsU0FBUyxJQUFJLEdBQVcsRUFBRSxJQUFVO0VBQ2xDLE9BQU8sVUFDSCxHQUFHLEtBQUssSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLEtBQUssTUFBTSxFQUFFLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFLEdBQ2pFO0FBQ047QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsTUFBTSxHQUFXO0VBQy9CLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFFLEVBQUU7QUFDNUI7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsS0FBSyxHQUFXO0VBQzlCLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFFLEVBQUU7QUFDNUI7QUFFQTs7Ozs7Ozs7Ozs7Ozs7O0NBZUMsR0FDRCxPQUFPLFNBQVMsSUFBSSxHQUFXO0VBQzdCLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFFLEVBQUU7QUFDNUI7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsT0FBTyxHQUFXO0VBQ2hDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFFLEVBQUU7QUFDNUI7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsVUFBVSxHQUFXO0VBQ25DLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFFLEVBQUU7QUFDNUI7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsUUFBUSxHQUFXO0VBQ2pDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFFLEVBQUU7QUFDNUI7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsT0FBTyxHQUFXO0VBQ2hDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFFLEVBQUU7QUFDNUI7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsY0FBYyxHQUFXO0VBQ3ZDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFFLEVBQUU7QUFDNUI7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsTUFBTSxHQUFXO0VBQy9CLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsSUFBSSxHQUFXO0VBQzdCLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsTUFBTSxHQUFXO0VBQy9CLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsT0FBTyxHQUFXO0VBQ2hDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsS0FBSyxHQUFXO0VBQzlCLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsUUFBUSxHQUFXO0VBQ2pDLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsS0FBSyxHQUFXO0VBQzlCLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsTUFBTSxHQUFXO0VBQy9CLE9BQU8sSUFBSSxLQUFLLEtBQUs7SUFBQztHQUFHLEVBQUU7QUFDN0I7QUFFQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsS0FBSyxHQUFXO0VBQzlCLE9BQU8sWUFBWTtBQUNyQjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxZQUFZLEdBQVc7RUFDckMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxVQUFVLEdBQVc7RUFDbkMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxZQUFZLEdBQVc7RUFDckMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxhQUFhLEdBQVc7RUFDdEMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxXQUFXLEdBQVc7RUFDcEMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxjQUFjLEdBQVc7RUFDdkMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxXQUFXLEdBQVc7RUFDcEMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxZQUFZLEdBQVc7RUFDckMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxRQUFRLEdBQVc7RUFDakMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxNQUFNLEdBQVc7RUFDL0IsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxRQUFRLEdBQVc7RUFDakMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxTQUFTLEdBQVc7RUFDbEMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxPQUFPLEdBQVc7RUFDaEMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxVQUFVLEdBQVc7RUFDbkMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxPQUFPLEdBQVc7RUFDaEMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxRQUFRLEdBQVc7RUFDakMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7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
// denoCacheMetadata=6513222849101374289,3514608895427071583