// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
// A module to print ANSI terminal colors. Inspired by chalk, kleur, and colors
// on npm.
/**
 * String formatters and utilities for dealing with ANSI color codes.
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
 * import { stripColor, red } from "@std/fmt/colors";
 *
 * console.log(stripColor(red("Hello, world!")));
 * ```
 *
 * @param string The text to remove ANSI escape codes from
 * @returns The text without ANSI escape codes
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode stripAnsiCode} instead.
 */ export function stripColor(string) {
  return stripAnsiCode(string);
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZm10LzAuMjI1LjYvY29sb3JzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG4vLyBBIG1vZHVsZSB0byBwcmludCBBTlNJIHRlcm1pbmFsIGNvbG9ycy4gSW5zcGlyZWQgYnkgY2hhbGssIGtsZXVyLCBhbmQgY29sb3JzXG4vLyBvbiBucG0uXG5cbi8qKlxuICogU3RyaW5nIGZvcm1hdHRlcnMgYW5kIHV0aWxpdGllcyBmb3IgZGVhbGluZyB3aXRoIEFOU0kgY29sb3IgY29kZXMuXG4gKlxuICogVGhpcyBtb2R1bGUgc3VwcG9ydHMgYE5PX0NPTE9SYCBlbnZpcm9ubWVudGFsIHZhcmlhYmxlIGRpc2FibGluZyBhbnkgY29sb3JpbmdcbiAqIGlmIGBOT19DT0xPUmAgaXMgc2V0LlxuICpcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHtcbiAqICAgYmdCbHVlLFxuICogICBiZ1JnYjI0LFxuICogICBiZ1JnYjgsXG4gKiAgIGJvbGQsXG4gKiAgIGl0YWxpYyxcbiAqICAgcmVkLFxuICogICByZ2IyNCxcbiAqICAgcmdiOCxcbiAqIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnQmx1ZShpdGFsaWMocmVkKGJvbGQoXCJIZWxsbywgV29ybGQhXCIpKSkpKTtcbiAqXG4gKiAvLyBhbHNvIHN1cHBvcnRzIDhiaXQgY29sb3JzXG4gKlxuICogY29uc29sZS5sb2cocmdiOChcIkhlbGxvLCBXb3JsZCFcIiwgNDIpKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhiZ1JnYjgoXCJIZWxsbywgV29ybGQhXCIsIDQyKSk7XG4gKlxuICogLy8gYW5kIDI0Yml0IHJnYlxuICpcbiAqIGNvbnNvbGUubG9nKHJnYjI0KFwiSGVsbG8sIFdvcmxkIVwiLCB7XG4gKiAgIHI6IDQxLFxuICogICBnOiA0MixcbiAqICAgYjogNDMsXG4gKiB9KSk7XG4gKlxuICogY29uc29sZS5sb2coYmdSZ2IyNChcIkhlbGxvLCBXb3JsZCFcIiwge1xuICogICByOiA0MSxcbiAqICAgZzogNDIsXG4gKiAgIGI6IDQzLFxuICogfSkpO1xuICogYGBgXG4gKlxuICogQG1vZHVsZVxuICovXG5cbi8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG5jb25zdCB7IERlbm8gfSA9IGdsb2JhbFRoaXMgYXMgYW55O1xuY29uc3Qgbm9Db2xvciA9IHR5cGVvZiBEZW5vPy5ub0NvbG9yID09PSBcImJvb2xlYW5cIlxuICA/IERlbm8ubm9Db2xvciBhcyBib29sZWFuXG4gIDogZmFsc2U7XG5cbmludGVyZmFjZSBDb2RlIHtcbiAgb3Blbjogc3RyaW5nO1xuICBjbG9zZTogc3RyaW5nO1xuICByZWdleHA6IFJlZ0V4cDtcbn1cblxuLyoqIFJHQiA4LWJpdHMgcGVyIGNoYW5uZWwuIEVhY2ggaW4gcmFuZ2UgYDAtPjI1NWAgb3IgYDB4MDAtPjB4ZmZgICovXG5leHBvcnQgaW50ZXJmYWNlIFJnYiB7XG4gIC8qKiBSZWQgY29tcG9uZW50IHZhbHVlICovXG4gIHI6IG51bWJlcjtcbiAgLyoqIEdyZWVuIGNvbXBvbmVudCB2YWx1ZSAqL1xuICBnOiBudW1iZXI7XG4gIC8qKiBCbHVlIGNvbXBvbmVudCB2YWx1ZSAqL1xuICBiOiBudW1iZXI7XG59XG5cbmxldCBlbmFibGVkID0gIW5vQ29sb3I7XG5cbi8qKlxuICogRW5hYmxlIG9yIGRpc2FibGUgdGV4dCBjb2xvciB3aGVuIHN0eWxpbmcuXG4gKlxuICogYEBzdGQvZm10L2NvbG9yc2AgYXV0b21hdGljYWxseSBkZXRlY3RzIE5PX0NPTE9SIGVudmlyb25tZW50YWwgdmFyaWFibGVcbiAqIGFuZCBkaXNhYmxlcyB0ZXh0IGNvbG9yLiBVc2UgdGhpcyBBUEkgb25seSB3aGVuIHRoZSBhdXRvbWF0aWMgZGV0ZWN0aW9uXG4gKiBkb2Vzbid0IHdvcmsuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgc2V0Q29sb3JFbmFibGVkIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIC8vIERpc2FibGUgdGV4dCBjb2xvclxuICogc2V0Q29sb3JFbmFibGVkKGZhbHNlKTtcbiAqXG4gKiAvLyBFbmFibGUgdGV4dCBjb2xvclxuICogc2V0Q29sb3JFbmFibGVkKHRydWUpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSBib29sZWFuIHZhbHVlIHRvIGVuYWJsZSBvciBkaXNhYmxlIHRleHQgY29sb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldENvbG9yRW5hYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICBpZiAoRGVubz8ubm9Db2xvcikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGVuYWJsZWQgPSB2YWx1ZTtcbn1cblxuLyoqXG4gKiBHZXQgd2hldGhlciB0ZXh0IGNvbG9yIGNoYW5nZSBpcyBlbmFibGVkIG9yIGRpc2FibGVkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGdldENvbG9yRW5hYmxlZCB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhnZXRDb2xvckVuYWJsZWQoKSk7IC8vIHRydWUgaWYgZW5hYmxlZCwgZmFsc2UgaWYgZGlzYWJsZWRcbiAqIGBgYFxuICogQHJldHVybnMgYHRydWVgIGlmIHRleHQgY29sb3IgaXMgZW5hYmxlZCwgYGZhbHNlYCBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbG9yRW5hYmxlZCgpOiBib29sZWFuIHtcbiAgcmV0dXJuIGVuYWJsZWQ7XG59XG5cbi8qKlxuICogQnVpbGRzIGNvbG9yIGNvZGVcbiAqIEBwYXJhbSBvcGVuXG4gKiBAcGFyYW0gY2xvc2VcbiAqL1xuZnVuY3Rpb24gY29kZShvcGVuOiBudW1iZXJbXSwgY2xvc2U6IG51bWJlcik6IENvZGUge1xuICByZXR1cm4ge1xuICAgIG9wZW46IGBcXHgxYlske29wZW4uam9pbihcIjtcIil9bWAsXG4gICAgY2xvc2U6IGBcXHgxYlske2Nsb3NlfW1gLFxuICAgIHJlZ2V4cDogbmV3IFJlZ0V4cChgXFxcXHgxYlxcXFxbJHtjbG9zZX1tYCwgXCJnXCIpLFxuICB9O1xufVxuXG4vKipcbiAqIEFwcGxpZXMgY29sb3IgYW5kIGJhY2tncm91bmQgYmFzZWQgb24gY29sb3IgY29kZSBhbmQgaXRzIGFzc29jaWF0ZWQgdGV4dFxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBhcHBseSBjb2xvciBzZXR0aW5ncyB0b1xuICogQHBhcmFtIGNvZGUgVGhlIGNvbG9yIGNvZGUgdG8gYXBwbHlcbiAqL1xuZnVuY3Rpb24gcnVuKHN0cjogc3RyaW5nLCBjb2RlOiBDb2RlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGVuYWJsZWRcbiAgICA/IGAke2NvZGUub3Blbn0ke3N0ci5yZXBsYWNlKGNvZGUucmVnZXhwLCBjb2RlLm9wZW4pfSR7Y29kZS5jbG9zZX1gXG4gICAgOiBzdHI7XG59XG5cbi8qKlxuICogUmVzZXQgdGhlIHRleHQgbW9kaWZpZWQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgcmVzZXQgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2cocmVzZXQoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gcmVzZXRcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggcmVzZXQgY29sb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzBdLCAwKSk7XG59XG5cbi8qKlxuICogTWFrZSB0aGUgdGV4dCBib2xkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJvbGQgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYm9sZChcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGJvbGRcbiAqIEByZXR1cm5zIFRoZSBib2xkIHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJvbGQoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMV0sIDIyKSk7XG59XG5cbi8qKlxuICogVGhlIHRleHQgZW1pdHMgb25seSBhIHNtYWxsIGFtb3VudCBvZiBsaWdodC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBkaW0gfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coZGltKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIGRpbVxuICogQHJldHVybnMgVGhlIGRpbW1lZCB0ZXh0XG4gKlxuICogV2FybmluZzogTm90IGFsbCB0ZXJtaW5hbCBlbXVsYXRvcnMgc3VwcG9ydCBgZGltYC5cbiAqIEZvciBjb21wYXRpYmlsaXR5IGFjcm9zcyBhbGwgdGVybWluYWxzLCB1c2Uge0BsaW5rY29kZSBncmF5fSBvciB7QGxpbmtjb2RlIGJyaWdodEJsYWNrfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGltKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzJdLCAyMikpO1xufVxuXG4vKipcbiAqIE1ha2UgdGhlIHRleHQgaXRhbGljLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGl0YWxpYyB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhpdGFsaWMoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBpdGFsaWNcbiAqIEByZXR1cm5zIFRoZSBpdGFsaWMgdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXRhbGljKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzNdLCAyMykpO1xufVxuXG4vKipcbiAqIE1ha2UgdGhlIHRleHQgdW5kZXJsaW5lLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHVuZGVybGluZSB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyh1bmRlcmxpbmUoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gdW5kZXJsaW5lXG4gKiBAcmV0dXJucyBUaGUgdW5kZXJsaW5lZCB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmRlcmxpbmUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbNF0sIDI0KSk7XG59XG5cbi8qKlxuICogSW52ZXJ0IGJhY2tncm91bmQgY29sb3IgYW5kIHRleHQgY29sb3IuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgaW52ZXJzZSB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhpbnZlcnNlKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIGludmVydCBpdHMgY29sb3JcbiAqIEByZXR1cm5zIFRoZSBpbnZlcnRlZCB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzddLCAyNykpO1xufVxuXG4vKipcbiAqIE1ha2UgdGhlIHRleHQgaGlkZGVuLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGhpZGRlbiB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhoaWRkZW4oXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gaGlkZVxuICogQHJldHVybnMgVGhlIGhpZGRlbiB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoaWRkZW4oc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbOF0sIDI4KSk7XG59XG5cbi8qKlxuICogUHV0IGhvcml6b250YWwgbGluZSB0aHJvdWdoIHRoZSBjZW50ZXIgb2YgdGhlIHRleHQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgc3RyaWtldGhyb3VnaCB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhzdHJpa2V0aHJvdWdoKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIHN0cmlrZSB0aHJvdWdoXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIGhvcml6b250YWwgbGluZSB0aHJvdWdoIHRoZSBjZW50ZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmlrZXRocm91Z2goc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbOV0sIDI5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYmxhY2suXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmxhY2sgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmxhY2soXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBibGFja1xuICogQHJldHVybnMgVGhlIGJsYWNrIHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJsYWNrKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzMwXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byByZWQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgcmVkIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKHJlZChcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIHJlZFxuICogQHJldHVybnMgVGhlIHJlZCB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWQoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMzFdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGdyZWVuLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGdyZWVuIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGdyZWVuKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgZ3JlZW5cbiAqIEByZXR1cm5zIFRoZSBncmVlbiB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncmVlbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszMl0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8geWVsbG93LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IHllbGxvdyB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyh5ZWxsb3coXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSB5ZWxsb3dcbiAqIEByZXR1cm5zIFRoZSB5ZWxsb3cgdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24geWVsbG93KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzMzXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBibHVlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJsdWUgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmx1ZShcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGJsdWVcbiAqIEByZXR1cm5zIFRoZSBibHVlIHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJsdWUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMzRdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIG1hZ2VudGEuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgbWFnZW50YSB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhtYWdlbnRhKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgbWFnZW50YVxuICogQHJldHVybnMgVGhlIG1hZ2VudGEgdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFnZW50YShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszNV0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gY3lhbi5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBjeWFuIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGN5YW4oXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBjeWFuXG4gKiBAcmV0dXJucyBUaGUgY3lhbiB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjeWFuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzM2XSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byB3aGl0ZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyB3aGl0ZSB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyh3aGl0ZShcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIHdoaXRlXG4gKiBAcmV0dXJucyBUaGUgd2hpdGUgdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gd2hpdGUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMzddLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGdyYXkuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgZ3JheSB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhncmF5KFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgZ3JheVxuICogQHJldHVybnMgVGhlIGdyYXkgdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JheShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBicmlnaHRCbGFjayhzdHIpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGJyaWdodCBibGFjay5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBicmlnaHRCbGFjayB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhicmlnaHRCbGFjayhcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGJyaWdodCBibGFja1xuICogQHJldHVybnMgVGhlIGJyaWdodCBibGFjayB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBicmlnaHRCbGFjayhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5MF0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IHJlZC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBicmlnaHRSZWQgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYnJpZ2h0UmVkKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgYnJpZ2h0IHJlZFxuICogQHJldHVybnMgVGhlIGJyaWdodCByZWQgdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYnJpZ2h0UmVkKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzkxXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgZ3JlZW4uXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYnJpZ2h0R3JlZW4gfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYnJpZ2h0R3JlZW4oXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBicmlnaHQgZ3JlZW5cbiAqIEByZXR1cm5zIFRoZSBicmlnaHQgZ3JlZW4gdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYnJpZ2h0R3JlZW4oc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbOTJdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGJyaWdodCB5ZWxsb3cuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYnJpZ2h0WWVsbG93IH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJyaWdodFllbGxvdyhcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGJyaWdodCB5ZWxsb3dcbiAqIEByZXR1cm5zIFRoZSBicmlnaHQgeWVsbG93IHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJyaWdodFllbGxvdyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5M10sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IGJsdWUuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYnJpZ2h0Qmx1ZSB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhicmlnaHRCbHVlKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgYnJpZ2h0IGJsdWVcbiAqIEByZXR1cm5zIFRoZSBicmlnaHQgYmx1ZSB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBicmlnaHRCbHVlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzk0XSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgbWFnZW50YS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBicmlnaHRNYWdlbnRhIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJyaWdodE1hZ2VudGEoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBicmlnaHQgbWFnZW50YVxuICogQHJldHVybnMgVGhlIGJyaWdodCBtYWdlbnRhIHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJyaWdodE1hZ2VudGEoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbOTVdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGJyaWdodCBjeWFuLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJyaWdodEN5YW4gfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYnJpZ2h0Q3lhbihcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGJyaWdodCBjeWFuXG4gKiBAcmV0dXJucyBUaGUgYnJpZ2h0IGN5YW4gdGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYnJpZ2h0Q3lhbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs5Nl0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gYnJpZ2h0IHdoaXRlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJyaWdodFdoaXRlIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJyaWdodFdoaXRlKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgYnJpZ2h0IHdoaXRlXG4gKiBAcmV0dXJucyBUaGUgYnJpZ2h0IHdoaXRlIHRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJyaWdodFdoaXRlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzk3XSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBibGFjay5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBiZ0JsYWNrIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnQmxhY2soXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBibGFja1xuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBibGFjayBiYWNrZ3JvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0JsYWNrKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzQwXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byByZWQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdSZWQgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdSZWQoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCByZWRcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggcmVkIGJhY2tncm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnUmVkKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzQxXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBncmVlbi5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBiZ0dyZWVuIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnR3JlZW4oXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBncmVlblxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBncmVlbiBiYWNrZ3JvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0dyZWVuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzQyXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byB5ZWxsb3cuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdZZWxsb3cgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdZZWxsb3coXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCB5ZWxsb3dcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggeWVsbG93IGJhY2tncm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnWWVsbG93KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzQzXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBibHVlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJnQmx1ZSB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhiZ0JsdWUoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBibHVlXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIGJsdWUgYmFja2dyb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCbHVlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzQ0XSwgNDkpKTtcbn1cblxuLyoqXG4gKiAgU2V0IGJhY2tncm91bmQgY29sb3IgdG8gbWFnZW50YS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBiZ01hZ2VudGEgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdNYWdlbnRhKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgbWFnZW50YVxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBtYWdlbnRhIGJhY2tncm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnTWFnZW50YShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0NV0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gY3lhbi5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBiZ0N5YW4gfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdDeWFuKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgY3lhblxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBjeWFuIGJhY2tncm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQ3lhbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0Nl0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gd2hpdGUuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdXaGl0ZSB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhiZ1doaXRlKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgd2hpdGVcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggd2hpdGUgYmFja2dyb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdXaGl0ZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0N10sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IGJsYWNrLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJnQnJpZ2h0QmxhY2sgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdCcmlnaHRCbGFjayhcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGJyaWdodCBibGFja1xuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBicmlnaHQgYmxhY2sgYmFja2dyb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCcmlnaHRCbGFjayhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDBdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCByZWQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdCcmlnaHRSZWQgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdCcmlnaHRSZWQoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBicmlnaHQgcmVkXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIGJyaWdodCByZWQgYmFja2dyb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCcmlnaHRSZWQoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMTAxXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBicmlnaHQgZ3JlZW4uXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdCcmlnaHRHcmVlbiB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhiZ0JyaWdodEdyZWVuKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYnJpZ2h0IGdyZWVuXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIGJyaWdodCBncmVlbiBiYWNrZ3JvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0JyaWdodEdyZWVuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwMl0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IHllbGxvdy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBiZ0JyaWdodFllbGxvdyB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhiZ0JyaWdodFllbGxvdyhcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGJyaWdodCB5ZWxsb3dcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggYnJpZ2h0IHllbGxvdyBiYWNrZ3JvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0JyaWdodFllbGxvdyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDNdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCBibHVlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJnQnJpZ2h0Qmx1ZSB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhiZ0JyaWdodEJsdWUoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBicmlnaHQgYmx1ZVxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBicmlnaHQgYmx1ZSBiYWNrZ3JvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0JyaWdodEJsdWUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMTA0XSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBicmlnaHQgbWFnZW50YS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBiZ0JyaWdodE1hZ2VudGEgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdCcmlnaHRNYWdlbnRhKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYnJpZ2h0IG1hZ2VudGFcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggYnJpZ2h0IG1hZ2VudGEgYmFja2dyb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCcmlnaHRNYWdlbnRhKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwNV0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IGN5YW4uXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgYmdCcmlnaHRDeWFuIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnQnJpZ2h0Q3lhbihcIkhlbGxvLCB3b3JsZCFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGJyaWdodCBjeWFuXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIGJyaWdodCBjeWFuIGJhY2tncm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQnJpZ2h0Q3lhbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsxMDZdLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIGJyaWdodCB3aGl0ZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBiZ0JyaWdodFdoaXRlIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGJnQnJpZ2h0V2hpdGUoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBicmlnaHQgd2hpdGVcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggYnJpZ2h0IHdoaXRlIGJhY2tncm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQnJpZ2h0V2hpdGUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMTA3XSwgNDkpKTtcbn1cblxuLyogU3BlY2lhbCBDb2xvciBTZXF1ZW5jZXMgKi9cblxuLyoqXG4gKiBDbGFtIGFuZCB0cnVuY2F0ZSBjb2xvciBjb2Rlc1xuICogQHBhcmFtIG4gVGhlIGlucHV0IG51bWJlclxuICogQHBhcmFtIG1heCBUaGUgbnVtYmVyIHRvIHRydW5jYXRlIHRvXG4gKiBAcGFyYW0gbWluIFRoZSBudW1iZXIgdG8gdHJ1bmNhdGUgZnJvbVxuICovXG5mdW5jdGlvbiBjbGFtcEFuZFRydW5jYXRlKG46IG51bWJlciwgbWF4ID0gMjU1LCBtaW4gPSAwKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgudHJ1bmMoTWF0aC5tYXgoTWF0aC5taW4obiwgbWF4KSwgbWluKSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdXNpbmcgcGFsZXR0ZWQgOGJpdCBjb2xvcnMuXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlIzgtYml0XG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgcmdiOCB9IGZyb20gXCJAc3RkL2ZtdC9jb2xvcnNcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhyZ2I4KFwiSGVsbG8sIHdvcmxkIVwiLCA0MikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCBjb2xvciB0byBhcHBseSBwYWxldHRlZCA4Yml0IGNvbG9ycyB0b1xuICogQHBhcmFtIGNvbG9yIFRoZSBjb2xvciBjb2RlXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIHBhbGV0dGVkIDhiaXQgY29sb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJnYjgoc3RyOiBzdHJpbmcsIGNvbG9yOiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMzgsIDUsIGNsYW1wQW5kVHJ1bmNhdGUoY29sb3IpXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB1c2luZyBwYWxldHRlZCA4Yml0IGNvbG9ycy5cbiAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjOC1iaXRcbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBiZ1JnYjggfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coYmdSZ2I4KFwiSGVsbG8sIHdvcmxkIVwiLCA0MikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgdGV4dCBjb2xvciB0byBhcHBseSBwYWxldHRlZCA4Yml0IGJhY2tncm91bmQgY29sb3JzIHRvXG4gKiBAcGFyYW0gY29sb3IgY29kZVxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aCBwYWxldHRlZCA4Yml0IGJhY2tncm91bmQgY29sb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnUmdiOChzdHI6IHN0cmluZywgY29sb3I6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0OCwgNSwgY2xhbXBBbmRUcnVuY2F0ZShjb2xvcildLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHVzaW5nIDI0Yml0IHJnYi5cbiAqIGBjb2xvcmAgY2FuIGJlIGEgbnVtYmVyIGluIHJhbmdlIGAweDAwMDAwMGAgdG8gYDB4ZmZmZmZmYCBvclxuICogYW4gYFJnYmAuXG4gKlxuICogQGV4YW1wbGUgVG8gcHJvZHVjZSB0aGUgY29sb3IgbWFnZW50YTpcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgcmdiMjQgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogcmdiMjQoXCJmb29cIiwgMHhmZjAwZmYpO1xuICogcmdiMjQoXCJmb29cIiwge3I6IDI1NSwgZzogMCwgYjogMjU1fSk7XG4gKiBgYGBcbiAqIEBwYXJhbSBzdHIgVGhlIHRleHQgY29sb3IgdG8gYXBwbHkgMjRiaXQgcmdiIHRvXG4gKiBAcGFyYW0gY29sb3IgVGhlIGNvbG9yIGNvZGVcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHdpdGggMjRiaXQgcmdiIGNvbG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZ2IyNChzdHI6IHN0cmluZywgY29sb3I6IG51bWJlciB8IFJnYik6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgY29sb3IgPT09IFwibnVtYmVyXCIpIHtcbiAgICByZXR1cm4gcnVuKFxuICAgICAgc3RyLFxuICAgICAgY29kZShcbiAgICAgICAgWzM4LCAyLCAoY29sb3IgPj4gMTYpICYgMHhmZiwgKGNvbG9yID4+IDgpICYgMHhmZiwgY29sb3IgJiAweGZmXSxcbiAgICAgICAgMzksXG4gICAgICApLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJ1bihcbiAgICBzdHIsXG4gICAgY29kZShcbiAgICAgIFtcbiAgICAgICAgMzgsXG4gICAgICAgIDIsXG4gICAgICAgIGNsYW1wQW5kVHJ1bmNhdGUoY29sb3IuciksXG4gICAgICAgIGNsYW1wQW5kVHJ1bmNhdGUoY29sb3IuZyksXG4gICAgICAgIGNsYW1wQW5kVHJ1bmNhdGUoY29sb3IuYiksXG4gICAgICBdLFxuICAgICAgMzksXG4gICAgKSxcbiAgKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB1c2luZyAyNGJpdCByZ2IuXG4gKiBgY29sb3JgIGNhbiBiZSBhIG51bWJlciBpbiByYW5nZSBgMHgwMDAwMDBgIHRvIGAweGZmZmZmZmAgb3JcbiAqIGFuIGBSZ2JgLlxuICpcbiAqIEBleGFtcGxlIFRvIHByb2R1Y2UgdGhlIGNvbG9yIG1hZ2VudGE6XG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7IGJnUmdiMjQgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogYmdSZ2IyNChcImZvb1wiLCAweGZmMDBmZik7XG4gKiBiZ1JnYjI0KFwiZm9vXCIsIHtyOiAyNTUsIGc6IDAsIGI6IDI1NX0pO1xuICogYGBgXG4gKiBAcGFyYW0gc3RyIFRoZSB0ZXh0IGNvbG9yIHRvIGFwcGx5IDI0Yml0IHJnYiB0b1xuICogQHBhcmFtIGNvbG9yIFRoZSBjb2xvciBjb2RlXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRoIDI0Yml0IHJnYiBjb2xvclxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdSZ2IyNChzdHI6IHN0cmluZywgY29sb3I6IG51bWJlciB8IFJnYik6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgY29sb3IgPT09IFwibnVtYmVyXCIpIHtcbiAgICByZXR1cm4gcnVuKFxuICAgICAgc3RyLFxuICAgICAgY29kZShcbiAgICAgICAgWzQ4LCAyLCAoY29sb3IgPj4gMTYpICYgMHhmZiwgKGNvbG9yID4+IDgpICYgMHhmZiwgY29sb3IgJiAweGZmXSxcbiAgICAgICAgNDksXG4gICAgICApLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJ1bihcbiAgICBzdHIsXG4gICAgY29kZShcbiAgICAgIFtcbiAgICAgICAgNDgsXG4gICAgICAgIDIsXG4gICAgICAgIGNsYW1wQW5kVHJ1bmNhdGUoY29sb3IuciksXG4gICAgICAgIGNsYW1wQW5kVHJ1bmNhdGUoY29sb3IuZyksXG4gICAgICAgIGNsYW1wQW5kVHJ1bmNhdGUoY29sb3IuYiksXG4gICAgICBdLFxuICAgICAgNDksXG4gICAgKSxcbiAgKTtcbn1cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2NoYWxrL2Fuc2ktcmVnZXgvYmxvYi8wMmZhODkzZDYxOWQzZGE4NTQxMWFjYzhmZDRlMmVlYTBlOTVhOWQ5L2luZGV4LmpzXG5jb25zdCBBTlNJX1BBVFRFUk4gPSBuZXcgUmVnRXhwKFxuICBbXG4gICAgXCJbXFxcXHUwMDFCXFxcXHUwMDlCXVtbXFxcXF0oKSM7P10qKD86KD86KD86KD86O1stYS16QS1aXFxcXGRcXFxcLyMmLjo9PyVAfl9dKykqfFthLXpBLVpcXFxcZF0rKD86O1stYS16QS1aXFxcXGRcXFxcLyMmLjo9PyVAfl9dKikqKT9cXFxcdTAwMDcpXCIsXG4gICAgXCIoPzooPzpcXFxcZHsxLDR9KD86O1xcXFxkezAsNH0pKik/W1xcXFxkQS1QUi1UWFpjZi1ucS11eT0+PH5dKSlcIixcbiAgXS5qb2luKFwifFwiKSxcbiAgXCJnXCIsXG4pO1xuXG4vKipcbiAqIFJlbW92ZSBBTlNJIGVzY2FwZSBjb2RlcyBmcm9tIHRoZSBzdHJpbmcuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWFzc2VydFxuICogaW1wb3J0IHsgc3RyaXBDb2xvciwgcmVkIH0gZnJvbSBcIkBzdGQvZm10L2NvbG9yc1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKHN0cmlwQ29sb3IocmVkKFwiSGVsbG8sIHdvcmxkIVwiKSkpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHN0cmluZyBUaGUgdGV4dCB0byByZW1vdmUgQU5TSSBlc2NhcGUgY29kZXMgZnJvbVxuICogQHJldHVybnMgVGhlIHRleHQgd2l0aG91dCBBTlNJIGVzY2FwZSBjb2Rlc1xuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2Uge0BsaW5rY29kZSBzdHJpcEFuc2lDb2RlfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBDb2xvcihzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHJpcEFuc2lDb2RlKHN0cmluZyk7XG59XG5cbi8qKlxuICogUmVtb3ZlIEFOU0kgZXNjYXBlIGNvZGVzIGZyb20gdGhlIHN0cmluZy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBzdHJpcEFuc2lDb2RlLCByZWQgfSBmcm9tIFwiQHN0ZC9mbXQvY29sb3JzXCI7XG4gKlxuICogY29uc29sZS5sb2coc3RyaXBBbnNpQ29kZShyZWQoXCJIZWxsbywgd29ybGQhXCIpKSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3RyaW5nIFRoZSB0ZXh0IHRvIHJlbW92ZSBBTlNJIGVzY2FwZSBjb2RlcyBmcm9tXG4gKiBAcmV0dXJucyBUaGUgdGV4dCB3aXRob3V0IEFOU0kgZXNjYXBlIGNvZGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcEFuc2lDb2RlKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKEFOU0lfUEFUVEVSTiwgXCJcIik7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUNyQywrRUFBK0U7QUFDL0UsVUFBVTtBQUVWOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EwQ0MsR0FFRCxtQ0FBbUM7QUFDbkMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHO0FBQ2pCLE1BQU0sVUFBVSxPQUFPLE1BQU0sWUFBWSxZQUNyQyxLQUFLLE9BQU8sR0FDWjtBQWtCSixJQUFJLFVBQVUsQ0FBQztBQUVmOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBQ0QsT0FBTyxTQUFTLGdCQUFnQixLQUFjO0VBQzVDLElBQUksTUFBTSxTQUFTO0lBQ2pCO0VBQ0Y7RUFFQSxVQUFVO0FBQ1o7QUFFQTs7Ozs7Ozs7OztDQVVDLEdBQ0QsT0FBTyxTQUFTO0VBQ2QsT0FBTztBQUNUO0FBRUE7Ozs7Q0FJQyxHQUNELFNBQVMsS0FBSyxJQUFjLEVBQUUsS0FBYTtFQUN6QyxPQUFPO0lBQ0wsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQixPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZCLFFBQVEsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUU7RUFDMUM7QUFDRjtBQUVBOzs7O0NBSUMsR0FDRCxTQUFTLElBQUksR0FBVyxFQUFFLElBQVU7RUFDbEMsT0FBTyxVQUNILEdBQUcsS0FBSyxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsS0FBSyxNQUFNLEVBQUUsS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUUsR0FDakU7QUFDTjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxNQUFNLEdBQVc7RUFDL0IsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUUsRUFBRTtBQUM1QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxLQUFLLEdBQVc7RUFDOUIsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUUsRUFBRTtBQUM1QjtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUNELE9BQU8sU0FBUyxJQUFJLEdBQVc7RUFDN0IsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUUsRUFBRTtBQUM1QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxPQUFPLEdBQVc7RUFDaEMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUUsRUFBRTtBQUM1QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxVQUFVLEdBQVc7RUFDbkMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUUsRUFBRTtBQUM1QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxRQUFRLEdBQVc7RUFDakMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUUsRUFBRTtBQUM1QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxPQUFPLEdBQVc7RUFDaEMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUUsRUFBRTtBQUM1QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxjQUFjLEdBQVc7RUFDdkMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUUsRUFBRTtBQUM1QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxNQUFNLEdBQVc7RUFDL0IsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxJQUFJLEdBQVc7RUFDN0IsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxNQUFNLEdBQVc7RUFDL0IsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxPQUFPLEdBQVc7RUFDaEMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxLQUFLLEdBQVc7RUFDOUIsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxRQUFRLEdBQVc7RUFDakMsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxLQUFLLEdBQVc7RUFDOUIsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxNQUFNLEdBQVc7RUFDL0IsT0FBTyxJQUFJLEtBQUssS0FBSztJQUFDO0dBQUcsRUFBRTtBQUM3QjtBQUVBOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxLQUFLLEdBQVc7RUFDOUIsT0FBTyxZQUFZO0FBQ3JCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLFlBQVksR0FBVztFQUNyQyxPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLFVBQVUsR0FBVztFQUNuQyxPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLFlBQVksR0FBVztFQUNyQyxPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLGFBQWEsR0FBVztFQUN0QyxPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLFdBQVcsR0FBVztFQUNwQyxPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLGNBQWMsR0FBVztFQUN2QyxPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLFdBQVcsR0FBVztFQUNwQyxPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLFlBQVksR0FBVztFQUNyQyxPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLFFBQVEsR0FBVztFQUNqQyxPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLE1BQU0sR0FBVztFQUMvQixPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLFFBQVEsR0FBVztFQUNqQyxPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLFNBQVMsR0FBVztFQUNsQyxPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztDQVlDLEdBQ0QsT0FBTyxTQUFTLE9BQU8sR0FBVztFQUNoQyxPQUFPLElBQUksS0FBSyxLQUFLO0lBQUM7R0FBRyxFQUFFO0FBQzdCO0FBRUE7Ozs7Ozs7Ozs7OztD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
// denoCacheMetadata=2074135571767427335,425157849658146358