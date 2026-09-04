// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * {@linkcode sprintf} and {@linkcode printf} for printing formatted strings to
 * stdout.
 *
 * This implementation is inspired by POSIX and Golang but does not port
 * implementation code.
 *
 * sprintf converts and formats a variable number of arguments as is specified
 * by a `format string`. In it's basic form, a format string may just be a
 * literal. In case arguments are meant to be formatted, a `directive` is
 * contained in the format string, preceded by a '%' character:
 *
 *     %<verb>
 *
 * E.g. the verb `s` indicates the directive should be replaced by the string
 * representation of the argument in the corresponding position of the argument
 * list. E.g.:
 *
 *     Hello %s!
 *
 * applied to the arguments "World" yields "Hello World!".
 *
 * The meaning of the format string is modelled after [POSIX][1] format strings
 * as well as well as [Golang format strings][2]. Both contain elements specific
 * to the respective programming language that don't apply to JavaScript, so
 * they can not be fully supported. Furthermore we implement some functionality
 * that is specific to JS.
 *
 * ## Verbs
 *
 * The following verbs are supported:
 *
 * | Verb  | Meaning                                                        |
 * | ----- | -------------------------------------------------------------- |
 * | `%`   | print a literal percent                                        |
 * | `t`   | evaluate arg as boolean, print `true` or `false`               |
 * | `b`   | eval as number, print binary                                   |
 * | `c`   | eval as number, print character corresponding to the codePoint |
 * | `o`   | eval as number, print octal                                    |
 * | `x X` | print as hex (ff FF), treat string as list of bytes            |
 * | `e E` | print number in scientific/exponent format 1.123123e+01        |
 * | `f F` | print number as float with decimal point and no exponent       |
 * | `g G` | use %e %E or %f %F depending on size of argument               |
 * | `s`   | interpolate string                                             |
 * | `T`   | type of arg, as returned by `typeof`                           |
 * | `v`   | value of argument in 'default' format (see below)              |
 * | `j`   | argument as formatted by `JSON.stringify`                      |
 * | `i`   | argument as formatted by `Deno.inspect`                        |
 * | `I`   | argument as formatted by `Deno.inspect` in compact format      |
 *
 * ## Width and Precision
 *
 * Verbs may be modified by providing them with width and precision, either or
 * both may be omitted:
 *
 *     %9f    width 9, default precision
 *     %.9f   default width, precision 9
 *     %8.9f  width 8, precision 9
 *     %8.f   width 9, precision 0
 *
 * In general, 'width' describes the minimum length of the output, while
 * 'precision' limits the output.
 *
 * | verb      | precision                                                       |
 * | --------- | --------------------------------------------------------------- |
 * | `t`       | n/a                                                             |
 * | `b c o`   | n/a                                                             |
 * | `x X`     | n/a for number, strings are truncated to p bytes(!)             |
 * | `e E f F` | number of places after decimal, default 6                       |
 * | `g G`     | set maximum number of digits                                    |
 * | `s`       | truncate input                                                  |
 * | `T`       | truncate                                                        |
 * | `v`       | truncate, or depth if used with # see "'default' format", below |
 * | `j`       | n/a                                                             |
 *
 * Numerical values for width and precision can be substituted for the `*` char,
 * in which case the values are obtained from the next args, e.g.:
 *
 *     sprintf("%*.*f", 9, 8, 456.0)
 *
 * is equivalent to:
 *
 *     sprintf("%9.8f", 456.0)
 *
 * ## Flags
 *
 * The effects of the verb may be further influenced by using flags to modify
 * the directive:
 *
 * | Flag  | Verb      | Meaning                                                                    |
 * | ----- | --------- | -------------------------------------------------------------------------- |
 * | `+`   | numeric   | always print sign                                                          |
 * | `-`   | all       | pad to the right (left justify)                                            |
 * | `#`   |           | alternate format                                                           |
 * | `#`   | `b o x X` | prefix with `0b 0 0x`                                                      |
 * | `#`   | `g G`     | don't remove trailing zeros                                                |
 * | `#`   | `v`       | use output of `inspect` instead of `toString`                              |
 * | `' '` |           | space character                                                            |
 * | `' '` | `x X`     | leave spaces between bytes when printing string                            |
 * | `' '` | `d`       | insert space for missing `+` sign character                                |
 * | `0`   | all       | pad with zero, `-` takes precedence, sign is appended in front of padding  |
 * | `<`   | all       | format elements of the passed array according to the directive (extension) |
 *
 * ## 'default' format
 *
 * The default format used by `%v` is the result of calling `toString()` on the
 * relevant argument. If the `#` flags is used, the result of calling `inspect()`
 * is interpolated. In this case, the precision, if set is passed to `inspect()`
 * as the 'depth' config parameter.
 *
 * ## Positional arguments
 *
 * Arguments do not need to be consumed in the order they are provided and may
 * be consumed more than once. E.g.:
 *
 *     sprintf("%[2]s %[1]s", "World", "Hello")
 *
 * returns "Hello World". The presence of a positional indicator resets the arg
 * counter allowing args to be reused:
 *
 *     sprintf("dec[%d]=%d hex[%[1]d]=%x oct[%[1]d]=%#o %s", 1, 255, "Third")
 *
 * returns `dec[1]=255 hex[1]=0xff oct[1]=0377 Third`
 *
 * Width and precision my also use positionals:
 *
 *     "%[2]*.[1]*d", 1, 2
 *
 * This follows the golang conventions and not POSIX.
 *
 * ## Errors
 *
 * The following errors are handled:
 *
 * Incorrect verb:
 *
 *     S("%h", "") %!(BAD VERB 'h')
 *
 * Too few arguments:
 *
 *     S("%d") %!(MISSING 'd')"
 *
 * [1]: https://pubs.opengroup.org/onlinepubs/009695399/functions/fprintf.html
 * [2]: https://golang.org/pkg/fmt/
 *
 * @module
 */ const State = {
  PASSTHROUGH: 0,
  PERCENT: 1,
  POSITIONAL: 2,
  PRECISION: 3,
  WIDTH: 4
};
const WorP = {
  WIDTH: 0,
  PRECISION: 1
};
const F = {
  sign: 1,
  mantissa: 2,
  fractional: 3,
  esign: 4,
  exponent: 5
};
class Flags {
  plus;
  dash;
  sharp;
  space;
  zero;
  lessthan;
  width = -1;
  precision = -1;
}
const min = Math.min;
const UNICODE_REPLACEMENT_CHARACTER = "\ufffd";
const DEFAULT_PRECISION = 6;
const FLOAT_REGEXP = /(-?)(\d)\.?(\d*)e([+-])(\d+)/;
class Printf {
  format;
  args;
  i;
  state = State.PASSTHROUGH;
  verb = "";
  buf = "";
  argNum = 0;
  flags = new Flags();
  haveSeen;
  // barf, store precision and width errors for later processing ...
  tmpError;
  constructor(format, ...args){
    this.format = format;
    this.args = args;
    this.haveSeen = Array.from({
      length: args.length
    });
    this.i = 0;
  }
  doPrintf() {
    for(; this.i < this.format.length; ++this.i){
      const c = this.format[this.i];
      switch(this.state){
        case State.PASSTHROUGH:
          if (c === "%") {
            this.state = State.PERCENT;
          } else {
            this.buf += c;
          }
          break;
        case State.PERCENT:
          if (c === "%") {
            this.buf += c;
            this.state = State.PASSTHROUGH;
          } else {
            this.handleFormat();
          }
          break;
        default:
          throw Error("Should be unreachable, certainly a bug in the lib.");
      }
    }
    // check for unhandled args
    let extras = false;
    let err = "%!(EXTRA";
    for(let i = 0; i !== this.haveSeen.length; ++i){
      if (!this.haveSeen[i]) {
        extras = true;
        err += ` '${Deno.inspect(this.args[i])}'`;
      }
    }
    err += ")";
    if (extras) {
      this.buf += err;
    }
    return this.buf;
  }
  // %[<positional>]<flag>...<verb>
  handleFormat() {
    this.flags = new Flags();
    const flags = this.flags;
    for(; this.i < this.format.length; ++this.i){
      const c = this.format[this.i];
      switch(this.state){
        case State.PERCENT:
          switch(c){
            case "[":
              this.handlePositional();
              this.state = State.POSITIONAL;
              break;
            case "+":
              flags.plus = true;
              break;
            case "<":
              flags.lessthan = true;
              break;
            case "-":
              flags.dash = true;
              flags.zero = false; // only left pad zeros, dash takes precedence
              break;
            case "#":
              flags.sharp = true;
              break;
            case " ":
              flags.space = true;
              break;
            case "0":
              // only left pad zeros, dash takes precedence
              flags.zero = !flags.dash;
              break;
            default:
              if ("1" <= c && c <= "9" || c === "." || c === "*") {
                if (c === ".") {
                  this.flags.precision = 0;
                  this.state = State.PRECISION;
                  this.i++;
                } else {
                  this.state = State.WIDTH;
                }
                this.handleWidthAndPrecision(flags);
              } else {
                this.handleVerb();
                return; // always end in verb
              }
          } // switch c
          break;
        case State.POSITIONAL:
          // TODO(bartlomieju): either a verb or * only verb for now
          if (c === "*") {
            const worp = this.flags.precision === -1 ? WorP.WIDTH : WorP.PRECISION;
            this.handleWidthOrPrecisionRef(worp);
            this.state = State.PERCENT;
            break;
          } else {
            this.handleVerb();
            return; // always end in verb
          }
        default:
          throw new Error(`Should not be here ${this.state}, library bug!`);
      } // switch state
    }
  }
  /**
   * Handle width or precision
   * @param wOrP
   */ handleWidthOrPrecisionRef(wOrP) {
    if (this.argNum >= this.args.length) {
      // handle Positional should have already taken care of it...
      return;
    }
    const arg = this.args[this.argNum];
    this.haveSeen[this.argNum] = true;
    if (typeof arg === "number") {
      switch(wOrP){
        case WorP.WIDTH:
          this.flags.width = arg;
          break;
        default:
          this.flags.precision = arg;
      }
    } else {
      const tmp = wOrP === WorP.WIDTH ? "WIDTH" : "PREC";
      this.tmpError = `%!(BAD ${tmp} '${this.args[this.argNum]}')`;
    }
    this.argNum++;
  }
  /**
   * Handle width and precision
   * @param flags
   */ handleWidthAndPrecision(flags) {
    const fmt = this.format;
    for(; this.i !== this.format.length; ++this.i){
      const c = fmt[this.i];
      switch(this.state){
        case State.WIDTH:
          switch(c){
            case ".":
              // initialize precision, %9.f -> precision=0
              this.flags.precision = 0;
              this.state = State.PRECISION;
              break;
            case "*":
              this.handleWidthOrPrecisionRef(WorP.WIDTH);
              break;
            default:
              {
                const val = parseInt(c);
                // most likely parseInt does something stupid that makes
                // it unusable for this scenario ...
                // if we encounter a non (number|*|.) we're done with prec & wid
                if (isNaN(val)) {
                  this.i--;
                  this.state = State.PERCENT;
                  return;
                }
                flags.width = flags.width === -1 ? 0 : flags.width;
                flags.width *= 10;
                flags.width += val;
              }
          } // switch c
          break;
        case State.PRECISION:
          {
            if (c === "*") {
              this.handleWidthOrPrecisionRef(WorP.PRECISION);
              break;
            }
            const val = parseInt(c);
            if (isNaN(val)) {
              // one too far, rewind
              this.i--;
              this.state = State.PERCENT;
              return;
            }
            flags.precision *= 10;
            flags.precision += val;
            break;
          }
        default:
          throw new Error("can't be here. bug.");
      } // switch state
    }
  }
  /** Handle positional */ handlePositional() {
    if (this.format[this.i] !== "[") {
      // sanity only
      throw new Error("Can't happen? Bug.");
    }
    let positional = 0;
    const format = this.format;
    this.i++;
    let err = false;
    for(; this.i !== this.format.length; ++this.i){
      if (format[this.i] === "]") {
        break;
      }
      positional *= 10;
      const val = parseInt(format[this.i], 10);
      if (isNaN(val)) {
        //throw new Error(
        //  `invalid character in positional: ${format}[${format[this.i]}]`
        //);
        this.tmpError = "%!(BAD INDEX)";
        err = true;
      }
      positional += val;
    }
    if (positional - 1 >= this.args.length) {
      this.tmpError = "%!(BAD INDEX)";
      err = true;
    }
    this.argNum = err ? this.argNum : positional - 1;
  }
  /** Handle less than */ handleLessThan() {
    // deno-lint-ignore no-explicit-any
    const arg = this.args[this.argNum];
    if ((arg || {}).constructor.name !== "Array") {
      throw new Error(`arg ${arg} is not an array. Todo better error handling`);
    }
    let str = "[ ";
    for(let i = 0; i !== arg.length; ++i){
      if (i !== 0) str += ", ";
      str += this._handleVerb(arg[i]);
    }
    return str + " ]";
  }
  /** Handle verb */ handleVerb() {
    const verb = this.format[this.i];
    this.verb = verb || this.verb;
    if (this.tmpError) {
      this.buf += this.tmpError;
      this.tmpError = undefined;
      if (this.argNum < this.haveSeen.length) {
        this.haveSeen[this.argNum] = true; // keep track of used args
      }
    } else if (this.args.length <= this.argNum) {
      this.buf += `%!(MISSING '${verb}')`;
    } else {
      const arg = this.args[this.argNum]; // check out of range
      this.haveSeen[this.argNum] = true; // keep track of used args
      if (this.flags.lessthan) {
        this.buf += this.handleLessThan();
      } else {
        this.buf += this._handleVerb(arg);
      }
    }
    this.argNum++; // if there is a further positional, it will reset.
    this.state = State.PASSTHROUGH;
  }
  // deno-lint-ignore no-explicit-any
  _handleVerb(arg) {
    switch(this.verb){
      case "t":
        return this.pad(arg.toString());
      case "b":
        return this.fmtNumber(arg, 2);
      case "c":
        return this.fmtNumberCodePoint(arg);
      case "d":
        return this.fmtNumber(arg, 10);
      case "o":
        return this.fmtNumber(arg, 8);
      case "x":
        return this.fmtHex(arg);
      case "X":
        return this.fmtHex(arg, true);
      case "e":
        return this.fmtFloatE(arg);
      case "E":
        return this.fmtFloatE(arg, true);
      case "f":
      case "F":
        return this.fmtFloatF(arg);
      case "g":
        return this.fmtFloatG(arg);
      case "G":
        return this.fmtFloatG(arg, true);
      case "s":
        return this.fmtString(arg);
      case "T":
        return this.fmtString(typeof arg);
      case "v":
        return this.fmtV(arg);
      case "j":
        return this.fmtJ(arg);
      case "i":
        return this.fmtI(arg, false);
      case "I":
        return this.fmtI(arg, true);
      default:
        return `%!(BAD VERB '${this.verb}')`;
    }
  }
  /**
   * Pad a string
   * @param s text to pad
   */ pad(s) {
    const padding = this.flags.zero ? "0" : " ";
    if (this.flags.dash) {
      return s.padEnd(this.flags.width, padding);
    }
    return s.padStart(this.flags.width, padding);
  }
  /**
   * Pad a number
   * @param nStr
   * @param neg
   */ padNum(nStr, neg) {
    let sign;
    if (neg) {
      sign = "-";
    } else if (this.flags.plus || this.flags.space) {
      sign = this.flags.plus ? "+" : " ";
    } else {
      sign = "";
    }
    const zero = this.flags.zero;
    if (!zero) {
      // sign comes in front of padding when padding w/ zero,
      // in from of value if padding with spaces.
      nStr = sign + nStr;
    }
    const pad = zero ? "0" : " ";
    const len = zero ? this.flags.width - sign.length : this.flags.width;
    if (this.flags.dash) {
      nStr = nStr.padEnd(len, pad);
    } else {
      nStr = nStr.padStart(len, pad);
    }
    if (zero) {
      // see above
      nStr = sign + nStr;
    }
    return nStr;
  }
  /**
   * Format a number
   * @param n
   * @param radix
   * @param upcase
   */ fmtNumber(n, radix, upcase = false) {
    let num = Math.abs(n).toString(radix);
    const prec = this.flags.precision;
    if (prec !== -1) {
      this.flags.zero = false;
      num = n === 0 && prec === 0 ? "" : num;
      while(num.length < prec){
        num = "0" + num;
      }
    }
    let prefix = "";
    if (this.flags.sharp) {
      switch(radix){
        case 2:
          prefix += "0b";
          break;
        case 8:
          // don't annotate octal 0 with 0...
          prefix += num.startsWith("0") ? "" : "0";
          break;
        case 16:
          prefix += "0x";
          break;
        default:
          throw new Error("cannot handle base: " + radix);
      }
    }
    // don't add prefix in front of value truncated by precision=0, val=0
    num = num.length === 0 ? num : prefix + num;
    if (upcase) {
      num = num.toUpperCase();
    }
    return this.padNum(num, n < 0);
  }
  /**
   * Format number with code points
   * @param n
   */ fmtNumberCodePoint(n) {
    let s = "";
    try {
      s = String.fromCodePoint(n);
    } catch  {
      s = UNICODE_REPLACEMENT_CHARACTER;
    }
    return this.pad(s);
  }
  /**
   * Format special float
   * @param n
   */ fmtFloatSpecial(n) {
    // formatting of NaN and Inf are pants-on-head
    // stupid and more or less arbitrary.
    if (isNaN(n)) {
      this.flags.zero = false;
      return this.padNum("NaN", false);
    }
    if (n === Number.POSITIVE_INFINITY) {
      this.flags.zero = false;
      this.flags.plus = true;
      return this.padNum("Inf", false);
    }
    if (n === Number.NEGATIVE_INFINITY) {
      this.flags.zero = false;
      return this.padNum("Inf", true);
    }
    return "";
  }
  /**
   * Round fraction to precision
   * @param fractional
   * @param precision
   * @returns tuple of fractional and round
   */ roundFractionToPrecision(fractional, precision) {
    let round = false;
    if (fractional.length > precision) {
      fractional = "1" + fractional; // prepend a 1 in case of leading 0
      let tmp = parseInt(fractional.slice(0, precision + 2)) / 10;
      tmp = Math.round(tmp);
      fractional = Math.floor(tmp).toString();
      round = fractional[0] === "2";
      fractional = fractional.slice(1); // remove extra 1
    } else {
      while(fractional.length < precision){
        fractional += "0";
      }
    }
    return [
      fractional,
      round
    ];
  }
  /**
   * Format float E
   * @param n
   * @param upcase
   */ fmtFloatE(n, upcase = false) {
    const special = this.fmtFloatSpecial(n);
    if (special !== "") {
      return special;
    }
    const m = n.toExponential().match(FLOAT_REGEXP);
    if (!m) {
      throw Error("can't happen, bug");
    }
    const precision = this.flags.precision !== -1 ? this.flags.precision : DEFAULT_PRECISION;
    const [fractional, rounding] = this.roundFractionToPrecision(m[F.fractional] || "", precision);
    let e = m[F.exponent];
    let esign = m[F.esign];
    // scientific notation output with exponent padded to minlen 2
    let mantissa = parseInt(m[F.mantissa]);
    if (rounding) {
      mantissa += 1;
      if (10 <= mantissa) {
        mantissa = 1;
        const r = parseInt(esign + e) + 1;
        e = r.toString();
        esign = r < 0 ? "-" : "+";
      }
    }
    e = e.length === 1 ? "0" + e : e;
    const val = `${mantissa}.${fractional}${upcase ? "E" : "e"}${esign}${e}`;
    return this.padNum(val, n < 0);
  }
  /**
   * Format float F
   * @param n
   */ fmtFloatF(n) {
    const special = this.fmtFloatSpecial(n);
    if (special !== "") {
      return special;
    }
    // stupid helper that turns a number into a (potentially)
    // VERY long string.
    function expandNumber(n) {
      if (Number.isSafeInteger(n)) {
        return n.toString() + ".";
      }
      const t = n.toExponential().split("e");
      let m = t[0].replace(".", "");
      const e = parseInt(t[1]);
      if (e < 0) {
        let nStr = "0.";
        for(let i = 0; i !== Math.abs(e) - 1; ++i){
          nStr += "0";
        }
        return nStr += m;
      } else {
        const splIdx = e + 1;
        while(m.length < splIdx){
          m += "0";
        }
        return m.slice(0, splIdx) + "." + m.slice(splIdx);
      }
    }
    // avoiding sign makes padding easier
    const val = expandNumber(Math.abs(n));
    let [dig, fractional] = val.split(".");
    const precision = this.flags.precision !== -1 ? this.flags.precision : DEFAULT_PRECISION;
    let round = false;
    [fractional, round] = this.roundFractionToPrecision(fractional, precision);
    if (round) {
      dig = (parseInt(dig) + 1).toString();
    }
    return this.padNum(`${dig}.${fractional}`, n < 0);
  }
  /**
   * Format float G
   * @param n
   * @param upcase
   */ fmtFloatG(n, upcase = false) {
    const special = this.fmtFloatSpecial(n);
    if (special !== "") {
      return special;
    }
    // The double argument representing a floating-point number shall be
    // converted in the style f or e (or in the style F or E in
    // the case of a G conversion specifier), depending on the
    // value converted and the precision. Let P equal the
    // precision if non-zero, 6 if the precision is omitted, or 1
    // if the precision is zero. Then, if a conversion with style E would
    // have an exponent of X:
    //     - If P > X>=-4, the conversion shall be with style f (or F )
    //     and precision P -( X+1).
    //     - Otherwise, the conversion shall be with style e (or E )
    //     and precision P -1.
    // Finally, unless the '#' flag is used, any trailing zeros shall be
    // removed from the fractional portion of the result and the
    // decimal-point character shall be removed if there is no
    // fractional portion remaining.
    // A double argument representing an infinity or NaN shall be
    // converted in the style of an f or F conversion specifier.
    // https://pubs.opengroup.org/onlinepubs/9699919799/functions/fprintf.html
    let P = this.flags.precision !== -1 ? this.flags.precision : DEFAULT_PRECISION;
    P = P === 0 ? 1 : P;
    const m = n.toExponential().match(FLOAT_REGEXP);
    if (!m) {
      throw Error("can't happen");
    }
    const X = parseInt(m[F.exponent]) * (m[F.esign] === "-" ? -1 : 1);
    let nStr = "";
    if (P > X && X >= -4) {
      this.flags.precision = P - (X + 1);
      nStr = this.fmtFloatF(n);
      if (!this.flags.sharp) {
        nStr = nStr.replace(/\.?0*$/, "");
      }
    } else {
      this.flags.precision = P - 1;
      nStr = this.fmtFloatE(n);
      if (!this.flags.sharp) {
        nStr = nStr.replace(/\.?0*e/, upcase ? "E" : "e");
      }
    }
    return nStr;
  }
  /**
   * Format string
   * @param s
   */ fmtString(s) {
    if (this.flags.precision !== -1) {
      s = s.slice(0, this.flags.precision);
    }
    return this.pad(s);
  }
  /**
   * Format hex
   * @param val
   * @param upper
   */ fmtHex(val, upper = false) {
    // allow others types ?
    switch(typeof val){
      case "number":
        return this.fmtNumber(val, 16, upper);
      case "string":
        {
          const sharp = this.flags.sharp && val.length !== 0;
          let hex = sharp ? "0x" : "";
          const prec = this.flags.precision;
          const end = prec !== -1 ? min(prec, val.length) : val.length;
          for(let i = 0; i !== end; ++i){
            if (i !== 0 && this.flags.space) {
              hex += sharp ? " 0x" : " ";
            }
            // TODO(bartlomieju): for now only taking into account the
            // lower half of the codePoint, ie. as if a string
            // is a list of 8bit values instead of UCS2 runes
            const c = (val.charCodeAt(i) & 0xff).toString(16);
            hex += c.length === 1 ? `0${c}` : c;
          }
          if (upper) {
            hex = hex.toUpperCase();
          }
          return this.pad(hex);
        }
      default:
        throw new Error("currently only number and string are implemented for hex");
    }
  }
  /**
   * Format value
   * @param val
   */ fmtV(val) {
    if (this.flags.sharp) {
      const options = this.flags.precision !== -1 ? {
        depth: this.flags.precision
      } : {};
      return this.pad(Deno.inspect(val, options));
    } else {
      const p = this.flags.precision;
      return p === -1 ? val.toString() : val.toString().slice(0, p);
    }
  }
  /**
   * Format JSON
   * @param val
   */ fmtJ(val) {
    return JSON.stringify(val);
  }
  /**
   * Format inspect
   * @param val
   * @param compact Whether or not the output should be compact.
   */ fmtI(val, compact) {
    return Deno.inspect(val, {
      colors: !Deno?.noColor,
      compact,
      depth: Infinity,
      iterableLimit: Infinity
    });
  }
}
/**
 * Converts and format a variable number of `args` as is specified by `format`.
 * `sprintf` returns the formatted string.
 *
 * @param format
 * @param args
 */ export function sprintf(format, ...args) {
  const printf = new Printf(format, ...args);
  return printf.doPrintf();
}
/**
 * Converts and format a variable number of `args` as is specified by `format`.
 * `printf` writes the formatted string to standard output.
 * @param format
 * @param args
 */ export function printf(format, ...args) {
  const s = sprintf(format, ...args);
  Deno.stdout.writeSync(new TextEncoder().encode(s));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIyNC4wL2ZtdC9wcmludGYudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuLyoqXG4gKiB7QGxpbmtjb2RlIHNwcmludGZ9IGFuZCB7QGxpbmtjb2RlIHByaW50Zn0gZm9yIHByaW50aW5nIGZvcm1hdHRlZCBzdHJpbmdzIHRvXG4gKiBzdGRvdXQuXG4gKlxuICogVGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBpbnNwaXJlZCBieSBQT1NJWCBhbmQgR29sYW5nIGJ1dCBkb2VzIG5vdCBwb3J0XG4gKiBpbXBsZW1lbnRhdGlvbiBjb2RlLlxuICpcbiAqIHNwcmludGYgY29udmVydHMgYW5kIGZvcm1hdHMgYSB2YXJpYWJsZSBudW1iZXIgb2YgYXJndW1lbnRzIGFzIGlzIHNwZWNpZmllZFxuICogYnkgYSBgZm9ybWF0IHN0cmluZ2AuIEluIGl0J3MgYmFzaWMgZm9ybSwgYSBmb3JtYXQgc3RyaW5nIG1heSBqdXN0IGJlIGFcbiAqIGxpdGVyYWwuIEluIGNhc2UgYXJndW1lbnRzIGFyZSBtZWFudCB0byBiZSBmb3JtYXR0ZWQsIGEgYGRpcmVjdGl2ZWAgaXNcbiAqIGNvbnRhaW5lZCBpbiB0aGUgZm9ybWF0IHN0cmluZywgcHJlY2VkZWQgYnkgYSAnJScgY2hhcmFjdGVyOlxuICpcbiAqICAgICAlPHZlcmI+XG4gKlxuICogRS5nLiB0aGUgdmVyYiBgc2AgaW5kaWNhdGVzIHRoZSBkaXJlY3RpdmUgc2hvdWxkIGJlIHJlcGxhY2VkIGJ5IHRoZSBzdHJpbmdcbiAqIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhcmd1bWVudCBpbiB0aGUgY29ycmVzcG9uZGluZyBwb3NpdGlvbiBvZiB0aGUgYXJndW1lbnRcbiAqIGxpc3QuIEUuZy46XG4gKlxuICogICAgIEhlbGxvICVzIVxuICpcbiAqIGFwcGxpZWQgdG8gdGhlIGFyZ3VtZW50cyBcIldvcmxkXCIgeWllbGRzIFwiSGVsbG8gV29ybGQhXCIuXG4gKlxuICogVGhlIG1lYW5pbmcgb2YgdGhlIGZvcm1hdCBzdHJpbmcgaXMgbW9kZWxsZWQgYWZ0ZXIgW1BPU0lYXVsxXSBmb3JtYXQgc3RyaW5nc1xuICogYXMgd2VsbCBhcyB3ZWxsIGFzIFtHb2xhbmcgZm9ybWF0IHN0cmluZ3NdWzJdLiBCb3RoIGNvbnRhaW4gZWxlbWVudHMgc3BlY2lmaWNcbiAqIHRvIHRoZSByZXNwZWN0aXZlIHByb2dyYW1taW5nIGxhbmd1YWdlIHRoYXQgZG9uJ3QgYXBwbHkgdG8gSmF2YVNjcmlwdCwgc29cbiAqIHRoZXkgY2FuIG5vdCBiZSBmdWxseSBzdXBwb3J0ZWQuIEZ1cnRoZXJtb3JlIHdlIGltcGxlbWVudCBzb21lIGZ1bmN0aW9uYWxpdHlcbiAqIHRoYXQgaXMgc3BlY2lmaWMgdG8gSlMuXG4gKlxuICogIyMgVmVyYnNcbiAqXG4gKiBUaGUgZm9sbG93aW5nIHZlcmJzIGFyZSBzdXBwb3J0ZWQ6XG4gKlxuICogfCBWZXJiICB8IE1lYW5pbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgLS0tLS0gfCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSB8XG4gKiB8IGAlYCAgIHwgcHJpbnQgYSBsaXRlcmFsIHBlcmNlbnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgdGAgICB8IGV2YWx1YXRlIGFyZyBhcyBib29sZWFuLCBwcmludCBgdHJ1ZWAgb3IgYGZhbHNlYCAgICAgICAgICAgICAgIHxcbiAqIHwgYGJgICAgfCBldmFsIGFzIG51bWJlciwgcHJpbnQgYmluYXJ5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGBjYCAgIHwgZXZhbCBhcyBudW1iZXIsIHByaW50IGNoYXJhY3RlciBjb3JyZXNwb25kaW5nIHRvIHRoZSBjb2RlUG9pbnQgfFxuICogfCBgb2AgICB8IGV2YWwgYXMgbnVtYmVyLCBwcmludCBvY3RhbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYHggWGAgfCBwcmludCBhcyBoZXggKGZmIEZGKSwgdHJlYXQgc3RyaW5nIGFzIGxpc3Qgb2YgYnl0ZXMgICAgICAgICAgICB8XG4gKiB8IGBlIEVgIHwgcHJpbnQgbnVtYmVyIGluIHNjaWVudGlmaWMvZXhwb25lbnQgZm9ybWF0IDEuMTIzMTIzZSswMSAgICAgICAgfFxuICogfCBgZiBGYCB8IHByaW50IG51bWJlciBhcyBmbG9hdCB3aXRoIGRlY2ltYWwgcG9pbnQgYW5kIG5vIGV4cG9uZW50ICAgICAgIHxcbiAqIHwgYGcgR2AgfCB1c2UgJWUgJUUgb3IgJWYgJUYgZGVwZW5kaW5nIG9uIHNpemUgb2YgYXJndW1lbnQgICAgICAgICAgICAgICB8XG4gKiB8IGBzYCAgIHwgaW50ZXJwb2xhdGUgc3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgVGAgICB8IHR5cGUgb2YgYXJnLCBhcyByZXR1cm5lZCBieSBgdHlwZW9mYCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYHZgICAgfCB2YWx1ZSBvZiBhcmd1bWVudCBpbiAnZGVmYXVsdCcgZm9ybWF0IChzZWUgYmVsb3cpICAgICAgICAgICAgICB8XG4gKiB8IGBqYCAgIHwgYXJndW1lbnQgYXMgZm9ybWF0dGVkIGJ5IGBKU09OLnN0cmluZ2lmeWAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgaWAgICB8IGFyZ3VtZW50IGFzIGZvcm1hdHRlZCBieSBgRGVuby5pbnNwZWN0YCAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYElgICAgfCBhcmd1bWVudCBhcyBmb3JtYXR0ZWQgYnkgYERlbm8uaW5zcGVjdGAgaW4gY29tcGFjdCBmb3JtYXQgICAgICB8XG4gKlxuICogIyMgV2lkdGggYW5kIFByZWNpc2lvblxuICpcbiAqIFZlcmJzIG1heSBiZSBtb2RpZmllZCBieSBwcm92aWRpbmcgdGhlbSB3aXRoIHdpZHRoIGFuZCBwcmVjaXNpb24sIGVpdGhlciBvclxuICogYm90aCBtYXkgYmUgb21pdHRlZDpcbiAqXG4gKiAgICAgJTlmICAgIHdpZHRoIDksIGRlZmF1bHQgcHJlY2lzaW9uXG4gKiAgICAgJS45ZiAgIGRlZmF1bHQgd2lkdGgsIHByZWNpc2lvbiA5XG4gKiAgICAgJTguOWYgIHdpZHRoIDgsIHByZWNpc2lvbiA5XG4gKiAgICAgJTguZiAgIHdpZHRoIDksIHByZWNpc2lvbiAwXG4gKlxuICogSW4gZ2VuZXJhbCwgJ3dpZHRoJyBkZXNjcmliZXMgdGhlIG1pbmltdW0gbGVuZ3RoIG9mIHRoZSBvdXRwdXQsIHdoaWxlXG4gKiAncHJlY2lzaW9uJyBsaW1pdHMgdGhlIG91dHB1dC5cbiAqXG4gKiB8IHZlcmIgICAgICB8IHByZWNpc2lvbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IC0tLS0tLS0tLSB8IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSB8XG4gKiB8IGB0YCAgICAgICB8IG4vYSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGBiIGMgb2AgICB8IG4vYSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGB4IFhgICAgICB8IG4vYSBmb3IgbnVtYmVyLCBzdHJpbmdzIGFyZSB0cnVuY2F0ZWQgdG8gcCBieXRlcyghKSAgICAgICAgICAgICB8XG4gKiB8IGBlIEUgZiBGYCB8IG51bWJlciBvZiBwbGFjZXMgYWZ0ZXIgZGVjaW1hbCwgZGVmYXVsdCA2ICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGBnIEdgICAgICB8IHNldCBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGBzYCAgICAgICB8IHRydW5jYXRlIGlucHV0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGBUYCAgICAgICB8IHRydW5jYXRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGB2YCAgICAgICB8IHRydW5jYXRlLCBvciBkZXB0aCBpZiB1c2VkIHdpdGggIyBzZWUgXCInZGVmYXVsdCcgZm9ybWF0XCIsIGJlbG93IHxcbiAqIHwgYGpgICAgICAgIHwgbi9hICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqXG4gKiBOdW1lcmljYWwgdmFsdWVzIGZvciB3aWR0aCBhbmQgcHJlY2lzaW9uIGNhbiBiZSBzdWJzdGl0dXRlZCBmb3IgdGhlIGAqYCBjaGFyLFxuICogaW4gd2hpY2ggY2FzZSB0aGUgdmFsdWVzIGFyZSBvYnRhaW5lZCBmcm9tIHRoZSBuZXh0IGFyZ3MsIGUuZy46XG4gKlxuICogICAgIHNwcmludGYoXCIlKi4qZlwiLCA5LCA4LCA0NTYuMClcbiAqXG4gKiBpcyBlcXVpdmFsZW50IHRvOlxuICpcbiAqICAgICBzcHJpbnRmKFwiJTkuOGZcIiwgNDU2LjApXG4gKlxuICogIyMgRmxhZ3NcbiAqXG4gKiBUaGUgZWZmZWN0cyBvZiB0aGUgdmVyYiBtYXkgYmUgZnVydGhlciBpbmZsdWVuY2VkIGJ5IHVzaW5nIGZsYWdzIHRvIG1vZGlmeVxuICogdGhlIGRpcmVjdGl2ZTpcbiAqXG4gKiB8IEZsYWcgIHwgVmVyYiAgICAgIHwgTWVhbmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCAtLS0tLSB8IC0tLS0tLS0tLSB8IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHxcbiAqIHwgYCtgICAgfCBudW1lcmljICAgfCBhbHdheXMgcHJpbnQgc2lnbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAtYCAgIHwgYWxsICAgICAgIHwgcGFkIHRvIHRoZSByaWdodCAobGVmdCBqdXN0aWZ5KSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgI2AgICB8ICAgICAgICAgICB8IGFsdGVybmF0ZSBmb3JtYXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCNgICAgfCBgYiBvIHggWGAgfCBwcmVmaXggd2l0aCBgMGIgMCAweGAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAjYCAgIHwgYGcgR2AgICAgIHwgZG9uJ3QgcmVtb3ZlIHRyYWlsaW5nIHplcm9zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgI2AgICB8IGB2YCAgICAgICB8IHVzZSBvdXRwdXQgb2YgYGluc3BlY3RgIGluc3RlYWQgb2YgYHRvU3RyaW5nYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCcgJ2AgfCAgICAgICAgICAgfCBzcGFjZSBjaGFyYWN0ZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAnICdgIHwgYHggWGAgICAgIHwgbGVhdmUgc3BhY2VzIGJldHdlZW4gYnl0ZXMgd2hlbiBwcmludGluZyBzdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJyAnYCB8IGBkYCAgICAgICB8IGluc2VydCBzcGFjZSBmb3IgbWlzc2luZyBgK2Agc2lnbiBjaGFyYWN0ZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYDBgICAgfCBhbGwgICAgICAgfCBwYWQgd2l0aCB6ZXJvLCBgLWAgdGFrZXMgcHJlY2VkZW5jZSwgc2lnbiBpcyBhcHBlbmRlZCBpbiBmcm9udCBvZiBwYWRkaW5nICB8XG4gKiB8IGA8YCAgIHwgYWxsICAgICAgIHwgZm9ybWF0IGVsZW1lbnRzIG9mIHRoZSBwYXNzZWQgYXJyYXkgYWNjb3JkaW5nIHRvIHRoZSBkaXJlY3RpdmUgKGV4dGVuc2lvbikgfFxuICpcbiAqICMjICdkZWZhdWx0JyBmb3JtYXRcbiAqXG4gKiBUaGUgZGVmYXVsdCBmb3JtYXQgdXNlZCBieSBgJXZgIGlzIHRoZSByZXN1bHQgb2YgY2FsbGluZyBgdG9TdHJpbmcoKWAgb24gdGhlXG4gKiByZWxldmFudCBhcmd1bWVudC4gSWYgdGhlIGAjYCBmbGFncyBpcyB1c2VkLCB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgYGluc3BlY3QoKWBcbiAqIGlzIGludGVycG9sYXRlZC4gSW4gdGhpcyBjYXNlLCB0aGUgcHJlY2lzaW9uLCBpZiBzZXQgaXMgcGFzc2VkIHRvIGBpbnNwZWN0KClgXG4gKiBhcyB0aGUgJ2RlcHRoJyBjb25maWcgcGFyYW1ldGVyLlxuICpcbiAqICMjIFBvc2l0aW9uYWwgYXJndW1lbnRzXG4gKlxuICogQXJndW1lbnRzIGRvIG5vdCBuZWVkIHRvIGJlIGNvbnN1bWVkIGluIHRoZSBvcmRlciB0aGV5IGFyZSBwcm92aWRlZCBhbmQgbWF5XG4gKiBiZSBjb25zdW1lZCBtb3JlIHRoYW4gb25jZS4gRS5nLjpcbiAqXG4gKiAgICAgc3ByaW50ZihcIiVbMl1zICVbMV1zXCIsIFwiV29ybGRcIiwgXCJIZWxsb1wiKVxuICpcbiAqIHJldHVybnMgXCJIZWxsbyBXb3JsZFwiLiBUaGUgcHJlc2VuY2Ugb2YgYSBwb3NpdGlvbmFsIGluZGljYXRvciByZXNldHMgdGhlIGFyZ1xuICogY291bnRlciBhbGxvd2luZyBhcmdzIHRvIGJlIHJldXNlZDpcbiAqXG4gKiAgICAgc3ByaW50ZihcImRlY1slZF09JWQgaGV4WyVbMV1kXT0leCBvY3RbJVsxXWRdPSUjbyAlc1wiLCAxLCAyNTUsIFwiVGhpcmRcIilcbiAqXG4gKiByZXR1cm5zIGBkZWNbMV09MjU1IGhleFsxXT0weGZmIG9jdFsxXT0wMzc3IFRoaXJkYFxuICpcbiAqIFdpZHRoIGFuZCBwcmVjaXNpb24gbXkgYWxzbyB1c2UgcG9zaXRpb25hbHM6XG4gKlxuICogICAgIFwiJVsyXSouWzFdKmRcIiwgMSwgMlxuICpcbiAqIFRoaXMgZm9sbG93cyB0aGUgZ29sYW5nIGNvbnZlbnRpb25zIGFuZCBub3QgUE9TSVguXG4gKlxuICogIyMgRXJyb3JzXG4gKlxuICogVGhlIGZvbGxvd2luZyBlcnJvcnMgYXJlIGhhbmRsZWQ6XG4gKlxuICogSW5jb3JyZWN0IHZlcmI6XG4gKlxuICogICAgIFMoXCIlaFwiLCBcIlwiKSAlIShCQUQgVkVSQiAnaCcpXG4gKlxuICogVG9vIGZldyBhcmd1bWVudHM6XG4gKlxuICogICAgIFMoXCIlZFwiKSAlIShNSVNTSU5HICdkJylcIlxuICpcbiAqIFsxXTogaHR0cHM6Ly9wdWJzLm9wZW5ncm91cC5vcmcvb25saW5lcHVicy8wMDk2OTUzOTkvZnVuY3Rpb25zL2ZwcmludGYuaHRtbFxuICogWzJdOiBodHRwczovL2dvbGFuZy5vcmcvcGtnL2ZtdC9cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuY29uc3QgU3RhdGUgPSB7XG4gIFBBU1NUSFJPVUdIOiAwLFxuICBQRVJDRU5UOiAxLFxuICBQT1NJVElPTkFMOiAyLFxuICBQUkVDSVNJT046IDMsXG4gIFdJRFRIOiA0LFxufSBhcyBjb25zdDtcblxudHlwZSBTdGF0ZSA9IHR5cGVvZiBTdGF0ZVtrZXlvZiB0eXBlb2YgU3RhdGVdO1xuXG5jb25zdCBXb3JQID0ge1xuICBXSURUSDogMCxcbiAgUFJFQ0lTSU9OOiAxLFxufSBhcyBjb25zdDtcblxudHlwZSBXb3JQID0gdHlwZW9mIFdvclBba2V5b2YgdHlwZW9mIFdvclBdO1xuXG5jb25zdCBGID0ge1xuICBzaWduOiAxLFxuICBtYW50aXNzYTogMixcbiAgZnJhY3Rpb25hbDogMyxcbiAgZXNpZ246IDQsXG4gIGV4cG9uZW50OiA1LFxufSBhcyBjb25zdDtcblxuY2xhc3MgRmxhZ3Mge1xuICBwbHVzPzogYm9vbGVhbjtcbiAgZGFzaD86IGJvb2xlYW47XG4gIHNoYXJwPzogYm9vbGVhbjtcbiAgc3BhY2U/OiBib29sZWFuO1xuICB6ZXJvPzogYm9vbGVhbjtcbiAgbGVzc3RoYW4/OiBib29sZWFuO1xuICB3aWR0aCA9IC0xO1xuICBwcmVjaXNpb24gPSAtMTtcbn1cblxuY29uc3QgbWluID0gTWF0aC5taW47XG5jb25zdCBVTklDT0RFX1JFUExBQ0VNRU5UX0NIQVJBQ1RFUiA9IFwiXFx1ZmZmZFwiO1xuY29uc3QgREVGQVVMVF9QUkVDSVNJT04gPSA2O1xuY29uc3QgRkxPQVRfUkVHRVhQID0gLygtPykoXFxkKVxcLj8oXFxkKillKFsrLV0pKFxcZCspLztcblxuY2xhc3MgUHJpbnRmIHtcbiAgZm9ybWF0OiBzdHJpbmc7XG4gIGFyZ3M6IHVua25vd25bXTtcbiAgaTogbnVtYmVyO1xuXG4gIHN0YXRlOiBTdGF0ZSA9IFN0YXRlLlBBU1NUSFJPVUdIO1xuICB2ZXJiID0gXCJcIjtcbiAgYnVmID0gXCJcIjtcbiAgYXJnTnVtID0gMDtcbiAgZmxhZ3M6IEZsYWdzID0gbmV3IEZsYWdzKCk7XG5cbiAgaGF2ZVNlZW46IGJvb2xlYW5bXTtcblxuICAvLyBiYXJmLCBzdG9yZSBwcmVjaXNpb24gYW5kIHdpZHRoIGVycm9ycyBmb3IgbGF0ZXIgcHJvY2Vzc2luZyAuLi5cbiAgdG1wRXJyb3I/OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoZm9ybWF0OiBzdHJpbmcsIC4uLmFyZ3M6IHVua25vd25bXSkge1xuICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0O1xuICAgIHRoaXMuYXJncyA9IGFyZ3M7XG4gICAgdGhpcy5oYXZlU2VlbiA9IEFycmF5LmZyb20oeyBsZW5ndGg6IGFyZ3MubGVuZ3RoIH0pO1xuICAgIHRoaXMuaSA9IDA7XG4gIH1cblxuICBkb1ByaW50ZigpOiBzdHJpbmcge1xuICAgIGZvciAoOyB0aGlzLmkgPCB0aGlzLmZvcm1hdC5sZW5ndGg7ICsrdGhpcy5pKSB7XG4gICAgICBjb25zdCBjID0gdGhpcy5mb3JtYXRbdGhpcy5pXTtcbiAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xuICAgICAgICBjYXNlIFN0YXRlLlBBU1NUSFJPVUdIOlxuICAgICAgICAgIGlmIChjID09PSBcIiVcIikge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFN0YXRlLlBFUkNFTlQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYnVmICs9IGM7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN0YXRlLlBFUkNFTlQ6XG4gICAgICAgICAgaWYgKGMgPT09IFwiJVwiKSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZiArPSBjO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFN0YXRlLlBBU1NUSFJPVUdIO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUZvcm1hdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBFcnJvcihcIlNob3VsZCBiZSB1bnJlYWNoYWJsZSwgY2VydGFpbmx5IGEgYnVnIGluIHRoZSBsaWIuXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBjaGVjayBmb3IgdW5oYW5kbGVkIGFyZ3NcbiAgICBsZXQgZXh0cmFzID0gZmFsc2U7XG4gICAgbGV0IGVyciA9IFwiJSEoRVhUUkFcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSAhPT0gdGhpcy5oYXZlU2Vlbi5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKCF0aGlzLmhhdmVTZWVuW2ldKSB7XG4gICAgICAgIGV4dHJhcyA9IHRydWU7XG4gICAgICAgIGVyciArPSBgICcke0Rlbm8uaW5zcGVjdCh0aGlzLmFyZ3NbaV0pfSdgO1xuICAgICAgfVxuICAgIH1cbiAgICBlcnIgKz0gXCIpXCI7XG4gICAgaWYgKGV4dHJhcykge1xuICAgICAgdGhpcy5idWYgKz0gZXJyO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5idWY7XG4gIH1cblxuICAvLyAlWzxwb3NpdGlvbmFsPl08ZmxhZz4uLi48dmVyYj5cbiAgaGFuZGxlRm9ybWF0KCkge1xuICAgIHRoaXMuZmxhZ3MgPSBuZXcgRmxhZ3MoKTtcbiAgICBjb25zdCBmbGFncyA9IHRoaXMuZmxhZ3M7XG4gICAgZm9yICg7IHRoaXMuaSA8IHRoaXMuZm9ybWF0Lmxlbmd0aDsgKyt0aGlzLmkpIHtcbiAgICAgIGNvbnN0IGMgPSB0aGlzLmZvcm1hdFt0aGlzLmldITtcbiAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xuICAgICAgICBjYXNlIFN0YXRlLlBFUkNFTlQ6XG4gICAgICAgICAgc3dpdGNoIChjKSB7XG4gICAgICAgICAgICBjYXNlIFwiW1wiOlxuICAgICAgICAgICAgICB0aGlzLmhhbmRsZVBvc2l0aW9uYWwoKTtcbiAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFN0YXRlLlBPU0lUSU9OQUw7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIitcIjpcbiAgICAgICAgICAgICAgZmxhZ3MucGx1cyA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIjxcIjpcbiAgICAgICAgICAgICAgZmxhZ3MubGVzc3RoYW4gPSB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCItXCI6XG4gICAgICAgICAgICAgIGZsYWdzLmRhc2ggPSB0cnVlO1xuICAgICAgICAgICAgICBmbGFncy56ZXJvID0gZmFsc2U7IC8vIG9ubHkgbGVmdCBwYWQgemVyb3MsIGRhc2ggdGFrZXMgcHJlY2VkZW5jZVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCIjXCI6XG4gICAgICAgICAgICAgIGZsYWdzLnNoYXJwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiIFwiOlxuICAgICAgICAgICAgICBmbGFncy5zcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIjBcIjpcbiAgICAgICAgICAgICAgLy8gb25seSBsZWZ0IHBhZCB6ZXJvcywgZGFzaCB0YWtlcyBwcmVjZWRlbmNlXG4gICAgICAgICAgICAgIGZsYWdzLnplcm8gPSAhZmxhZ3MuZGFzaDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICBpZiAoKFwiMVwiIDw9IGMgJiYgYyA8PSBcIjlcIikgfHwgYyA9PT0gXCIuXCIgfHwgYyA9PT0gXCIqXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoYyA9PT0gXCIuXCIpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuZmxhZ3MucHJlY2lzaW9uID0gMDtcbiAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTdGF0ZS5QUkVDSVNJT047XG4gICAgICAgICAgICAgICAgICB0aGlzLmkrKztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFN0YXRlLldJRFRIO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVdpZHRoQW5kUHJlY2lzaW9uKGZsYWdzKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVZlcmIoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIGFsd2F5cyBlbmQgaW4gdmVyYlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSAvLyBzd2l0Y2ggY1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN0YXRlLlBPU0lUSU9OQUw6XG4gICAgICAgICAgLy8gVE9ETyhiYXJ0bG9taWVqdSk6IGVpdGhlciBhIHZlcmIgb3IgKiBvbmx5IHZlcmIgZm9yIG5vd1xuICAgICAgICAgIGlmIChjID09PSBcIipcIikge1xuICAgICAgICAgICAgY29uc3Qgd29ycCA9IHRoaXMuZmxhZ3MucHJlY2lzaW9uID09PSAtMVxuICAgICAgICAgICAgICA/IFdvclAuV0lEVEhcbiAgICAgICAgICAgICAgOiBXb3JQLlBSRUNJU0lPTjtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlV2lkdGhPclByZWNpc2lvblJlZih3b3JwKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTdGF0ZS5QRVJDRU5UO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlVmVyYigpO1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBhbHdheXMgZW5kIGluIHZlcmJcbiAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTaG91bGQgbm90IGJlIGhlcmUgJHt0aGlzLnN0YXRlfSwgbGlicmFyeSBidWchYCk7XG4gICAgICB9IC8vIHN3aXRjaCBzdGF0ZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgd2lkdGggb3IgcHJlY2lzaW9uXG4gICAqIEBwYXJhbSB3T3JQXG4gICAqL1xuICBoYW5kbGVXaWR0aE9yUHJlY2lzaW9uUmVmKHdPclA6IFdvclApIHtcbiAgICBpZiAodGhpcy5hcmdOdW0gPj0gdGhpcy5hcmdzLmxlbmd0aCkge1xuICAgICAgLy8gaGFuZGxlIFBvc2l0aW9uYWwgc2hvdWxkIGhhdmUgYWxyZWFkeSB0YWtlbiBjYXJlIG9mIGl0Li4uXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGFyZyA9IHRoaXMuYXJnc1t0aGlzLmFyZ051bV07XG4gICAgdGhpcy5oYXZlU2Vlblt0aGlzLmFyZ051bV0gPSB0cnVlO1xuICAgIGlmICh0eXBlb2YgYXJnID09PSBcIm51bWJlclwiKSB7XG4gICAgICBzd2l0Y2ggKHdPclApIHtcbiAgICAgICAgY2FzZSBXb3JQLldJRFRIOlxuICAgICAgICAgIHRoaXMuZmxhZ3Mud2lkdGggPSBhcmc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5mbGFncy5wcmVjaXNpb24gPSBhcmc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHRtcCA9IHdPclAgPT09IFdvclAuV0lEVEggPyBcIldJRFRIXCIgOiBcIlBSRUNcIjtcbiAgICAgIHRoaXMudG1wRXJyb3IgPSBgJSEoQkFEICR7dG1wfSAnJHt0aGlzLmFyZ3NbdGhpcy5hcmdOdW1dfScpYDtcbiAgICB9XG4gICAgdGhpcy5hcmdOdW0rKztcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgd2lkdGggYW5kIHByZWNpc2lvblxuICAgKiBAcGFyYW0gZmxhZ3NcbiAgICovXG4gIGhhbmRsZVdpZHRoQW5kUHJlY2lzaW9uKGZsYWdzOiBGbGFncykge1xuICAgIGNvbnN0IGZtdCA9IHRoaXMuZm9ybWF0O1xuICAgIGZvciAoOyB0aGlzLmkgIT09IHRoaXMuZm9ybWF0Lmxlbmd0aDsgKyt0aGlzLmkpIHtcbiAgICAgIGNvbnN0IGMgPSBmbXRbdGhpcy5pXSE7XG4gICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgY2FzZSBTdGF0ZS5XSURUSDpcbiAgICAgICAgICBzd2l0Y2ggKGMpIHtcbiAgICAgICAgICAgIGNhc2UgXCIuXCI6XG4gICAgICAgICAgICAgIC8vIGluaXRpYWxpemUgcHJlY2lzaW9uLCAlOS5mIC0+IHByZWNpc2lvbj0wXG4gICAgICAgICAgICAgIHRoaXMuZmxhZ3MucHJlY2lzaW9uID0gMDtcbiAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFN0YXRlLlBSRUNJU0lPTjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiKlwiOlxuICAgICAgICAgICAgICB0aGlzLmhhbmRsZVdpZHRoT3JQcmVjaXNpb25SZWYoV29yUC5XSURUSCk7XG4gICAgICAgICAgICAgIC8vIGZvcmNlIC4gb3IgZmxhZyBhdCB0aGlzIHBvaW50XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICBjb25zdCB2YWwgPSBwYXJzZUludChjKTtcbiAgICAgICAgICAgICAgLy8gbW9zdCBsaWtlbHkgcGFyc2VJbnQgZG9lcyBzb21ldGhpbmcgc3R1cGlkIHRoYXQgbWFrZXNcbiAgICAgICAgICAgICAgLy8gaXQgdW51c2FibGUgZm9yIHRoaXMgc2NlbmFyaW8gLi4uXG4gICAgICAgICAgICAgIC8vIGlmIHdlIGVuY291bnRlciBhIG5vbiAobnVtYmVyfCp8Likgd2UncmUgZG9uZSB3aXRoIHByZWMgJiB3aWRcbiAgICAgICAgICAgICAgaWYgKGlzTmFOKHZhbCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmktLTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU3RhdGUuUEVSQ0VOVDtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZmxhZ3Mud2lkdGggPSBmbGFncy53aWR0aCA9PT0gLTEgPyAwIDogZmxhZ3Mud2lkdGg7XG4gICAgICAgICAgICAgIGZsYWdzLndpZHRoICo9IDEwO1xuICAgICAgICAgICAgICBmbGFncy53aWR0aCArPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSAvLyBzd2l0Y2ggY1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN0YXRlLlBSRUNJU0lPTjoge1xuICAgICAgICAgIGlmIChjID09PSBcIipcIikge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVXaWR0aE9yUHJlY2lzaW9uUmVmKFdvclAuUFJFQ0lTSU9OKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB2YWwgPSBwYXJzZUludChjKTtcbiAgICAgICAgICBpZiAoaXNOYU4odmFsKSkge1xuICAgICAgICAgICAgLy8gb25lIHRvbyBmYXIsIHJld2luZFxuICAgICAgICAgICAgdGhpcy5pLS07XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gU3RhdGUuUEVSQ0VOVDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgZmxhZ3MucHJlY2lzaW9uICo9IDEwO1xuICAgICAgICAgIGZsYWdzLnByZWNpc2lvbiArPSB2YWw7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW4ndCBiZSBoZXJlLiBidWcuXCIpO1xuICAgICAgfSAvLyBzd2l0Y2ggc3RhdGVcbiAgICB9XG4gIH1cblxuICAvKiogSGFuZGxlIHBvc2l0aW9uYWwgKi9cbiAgaGFuZGxlUG9zaXRpb25hbCgpIHtcbiAgICBpZiAodGhpcy5mb3JtYXRbdGhpcy5pXSAhPT0gXCJbXCIpIHtcbiAgICAgIC8vIHNhbml0eSBvbmx5XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBoYXBwZW4/IEJ1Zy5cIik7XG4gICAgfVxuICAgIGxldCBwb3NpdGlvbmFsID0gMDtcbiAgICBjb25zdCBmb3JtYXQgPSB0aGlzLmZvcm1hdDtcbiAgICB0aGlzLmkrKztcbiAgICBsZXQgZXJyID0gZmFsc2U7XG4gICAgZm9yICg7IHRoaXMuaSAhPT0gdGhpcy5mb3JtYXQubGVuZ3RoOyArK3RoaXMuaSkge1xuICAgICAgaWYgKGZvcm1hdFt0aGlzLmldID09PSBcIl1cIikge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHBvc2l0aW9uYWwgKj0gMTA7XG4gICAgICBjb25zdCB2YWwgPSBwYXJzZUludChmb3JtYXRbdGhpcy5pXSEsIDEwKTtcbiAgICAgIGlmIChpc05hTih2YWwpKSB7XG4gICAgICAgIC8vdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAvLyAgYGludmFsaWQgY2hhcmFjdGVyIGluIHBvc2l0aW9uYWw6ICR7Zm9ybWF0fVske2Zvcm1hdFt0aGlzLmldfV1gXG4gICAgICAgIC8vKTtcbiAgICAgICAgdGhpcy50bXBFcnJvciA9IFwiJSEoQkFEIElOREVYKVwiO1xuICAgICAgICBlcnIgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcG9zaXRpb25hbCArPSB2YWw7XG4gICAgfVxuICAgIGlmIChwb3NpdGlvbmFsIC0gMSA+PSB0aGlzLmFyZ3MubGVuZ3RoKSB7XG4gICAgICB0aGlzLnRtcEVycm9yID0gXCIlIShCQUQgSU5ERVgpXCI7XG4gICAgICBlcnIgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLmFyZ051bSA9IGVyciA/IHRoaXMuYXJnTnVtIDogcG9zaXRpb25hbCAtIDE7XG4gIH1cblxuICAvKiogSGFuZGxlIGxlc3MgdGhhbiAqL1xuICBoYW5kbGVMZXNzVGhhbigpOiBzdHJpbmcge1xuICAgIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICAgY29uc3QgYXJnID0gdGhpcy5hcmdzW3RoaXMuYXJnTnVtXSBhcyBhbnk7XG4gICAgaWYgKChhcmcgfHwge30pLmNvbnN0cnVjdG9yLm5hbWUgIT09IFwiQXJyYXlcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBhcmcgJHthcmd9IGlzIG5vdCBhbiBhcnJheS4gVG9kbyBiZXR0ZXIgZXJyb3IgaGFuZGxpbmdgKTtcbiAgICB9XG4gICAgbGV0IHN0ciA9IFwiWyBcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSAhPT0gYXJnLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoaSAhPT0gMCkgc3RyICs9IFwiLCBcIjtcbiAgICAgIHN0ciArPSB0aGlzLl9oYW5kbGVWZXJiKGFyZ1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBzdHIgKyBcIiBdXCI7XG4gIH1cblxuICAvKiogSGFuZGxlIHZlcmIgKi9cbiAgaGFuZGxlVmVyYigpIHtcbiAgICBjb25zdCB2ZXJiID0gdGhpcy5mb3JtYXRbdGhpcy5pXTtcbiAgICB0aGlzLnZlcmIgPSB2ZXJiIHx8IHRoaXMudmVyYjtcbiAgICBpZiAodGhpcy50bXBFcnJvcikge1xuICAgICAgdGhpcy5idWYgKz0gdGhpcy50bXBFcnJvcjtcbiAgICAgIHRoaXMudG1wRXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAodGhpcy5hcmdOdW0gPCB0aGlzLmhhdmVTZWVuLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmhhdmVTZWVuW3RoaXMuYXJnTnVtXSA9IHRydWU7IC8vIGtlZXAgdHJhY2sgb2YgdXNlZCBhcmdzXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmFyZ3MubGVuZ3RoIDw9IHRoaXMuYXJnTnVtKSB7XG4gICAgICB0aGlzLmJ1ZiArPSBgJSEoTUlTU0lORyAnJHt2ZXJifScpYDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYXJnID0gdGhpcy5hcmdzW3RoaXMuYXJnTnVtXTsgLy8gY2hlY2sgb3V0IG9mIHJhbmdlXG4gICAgICB0aGlzLmhhdmVTZWVuW3RoaXMuYXJnTnVtXSA9IHRydWU7IC8vIGtlZXAgdHJhY2sgb2YgdXNlZCBhcmdzXG4gICAgICBpZiAodGhpcy5mbGFncy5sZXNzdGhhbikge1xuICAgICAgICB0aGlzLmJ1ZiArPSB0aGlzLmhhbmRsZUxlc3NUaGFuKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmJ1ZiArPSB0aGlzLl9oYW5kbGVWZXJiKGFyZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuYXJnTnVtKys7IC8vIGlmIHRoZXJlIGlzIGEgZnVydGhlciBwb3NpdGlvbmFsLCBpdCB3aWxsIHJlc2V0LlxuICAgIHRoaXMuc3RhdGUgPSBTdGF0ZS5QQVNTVEhST1VHSDtcbiAgfVxuXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIF9oYW5kbGVWZXJiKGFyZzogYW55KTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKHRoaXMudmVyYikge1xuICAgICAgY2FzZSBcInRcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMucGFkKGFyZy50b1N0cmluZygpKTtcbiAgICAgIGNhc2UgXCJiXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZtdE51bWJlcihhcmcgYXMgbnVtYmVyLCAyKTtcbiAgICAgIGNhc2UgXCJjXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZtdE51bWJlckNvZGVQb2ludChhcmcgYXMgbnVtYmVyKTtcbiAgICAgIGNhc2UgXCJkXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZtdE51bWJlcihhcmcgYXMgbnVtYmVyLCAxMCk7XG4gICAgICBjYXNlIFwib1wiOlxuICAgICAgICByZXR1cm4gdGhpcy5mbXROdW1iZXIoYXJnIGFzIG51bWJlciwgOCk7XG4gICAgICBjYXNlIFwieFwiOlxuICAgICAgICByZXR1cm4gdGhpcy5mbXRIZXgoYXJnKTtcbiAgICAgIGNhc2UgXCJYXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZtdEhleChhcmcsIHRydWUpO1xuICAgICAgY2FzZSBcImVcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuZm10RmxvYXRFKGFyZyBhcyBudW1iZXIpO1xuICAgICAgY2FzZSBcIkVcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuZm10RmxvYXRFKGFyZyBhcyBudW1iZXIsIHRydWUpO1xuICAgICAgY2FzZSBcImZcIjpcbiAgICAgIGNhc2UgXCJGXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZtdEZsb2F0RihhcmcgYXMgbnVtYmVyKTtcbiAgICAgIGNhc2UgXCJnXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZtdEZsb2F0RyhhcmcgYXMgbnVtYmVyKTtcbiAgICAgIGNhc2UgXCJHXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZtdEZsb2F0RyhhcmcgYXMgbnVtYmVyLCB0cnVlKTtcbiAgICAgIGNhc2UgXCJzXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZtdFN0cmluZyhhcmcgYXMgc3RyaW5nKTtcbiAgICAgIGNhc2UgXCJUXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZtdFN0cmluZyh0eXBlb2YgYXJnKTtcbiAgICAgIGNhc2UgXCJ2XCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZtdFYoYXJnKTtcbiAgICAgIGNhc2UgXCJqXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZtdEooYXJnKTtcbiAgICAgIGNhc2UgXCJpXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZtdEkoYXJnLCBmYWxzZSk7XG4gICAgICBjYXNlIFwiSVwiOlxuICAgICAgICByZXR1cm4gdGhpcy5mbXRJKGFyZywgdHJ1ZSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gYCUhKEJBRCBWRVJCICcke3RoaXMudmVyYn0nKWA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBhZCBhIHN0cmluZ1xuICAgKiBAcGFyYW0gcyB0ZXh0IHRvIHBhZFxuICAgKi9cbiAgcGFkKHM6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgcGFkZGluZyA9IHRoaXMuZmxhZ3MuemVybyA/IFwiMFwiIDogXCIgXCI7XG5cbiAgICBpZiAodGhpcy5mbGFncy5kYXNoKSB7XG4gICAgICByZXR1cm4gcy5wYWRFbmQodGhpcy5mbGFncy53aWR0aCwgcGFkZGluZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHMucGFkU3RhcnQodGhpcy5mbGFncy53aWR0aCwgcGFkZGluZyk7XG4gIH1cblxuICAvKipcbiAgICogUGFkIGEgbnVtYmVyXG4gICAqIEBwYXJhbSBuU3RyXG4gICAqIEBwYXJhbSBuZWdcbiAgICovXG4gIHBhZE51bShuU3RyOiBzdHJpbmcsIG5lZzogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgbGV0IHNpZ246IHN0cmluZztcbiAgICBpZiAobmVnKSB7XG4gICAgICBzaWduID0gXCItXCI7XG4gICAgfSBlbHNlIGlmICh0aGlzLmZsYWdzLnBsdXMgfHwgdGhpcy5mbGFncy5zcGFjZSkge1xuICAgICAgc2lnbiA9IHRoaXMuZmxhZ3MucGx1cyA/IFwiK1wiIDogXCIgXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNpZ24gPSBcIlwiO1xuICAgIH1cbiAgICBjb25zdCB6ZXJvID0gdGhpcy5mbGFncy56ZXJvO1xuICAgIGlmICghemVybykge1xuICAgICAgLy8gc2lnbiBjb21lcyBpbiBmcm9udCBvZiBwYWRkaW5nIHdoZW4gcGFkZGluZyB3LyB6ZXJvLFxuICAgICAgLy8gaW4gZnJvbSBvZiB2YWx1ZSBpZiBwYWRkaW5nIHdpdGggc3BhY2VzLlxuICAgICAgblN0ciA9IHNpZ24gKyBuU3RyO1xuICAgIH1cblxuICAgIGNvbnN0IHBhZCA9IHplcm8gPyBcIjBcIiA6IFwiIFwiO1xuICAgIGNvbnN0IGxlbiA9IHplcm8gPyB0aGlzLmZsYWdzLndpZHRoIC0gc2lnbi5sZW5ndGggOiB0aGlzLmZsYWdzLndpZHRoO1xuXG4gICAgaWYgKHRoaXMuZmxhZ3MuZGFzaCkge1xuICAgICAgblN0ciA9IG5TdHIucGFkRW5kKGxlbiwgcGFkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgblN0ciA9IG5TdHIucGFkU3RhcnQobGVuLCBwYWQpO1xuICAgIH1cblxuICAgIGlmICh6ZXJvKSB7XG4gICAgICAvLyBzZWUgYWJvdmVcbiAgICAgIG5TdHIgPSBzaWduICsgblN0cjtcbiAgICB9XG4gICAgcmV0dXJuIG5TdHI7XG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0IGEgbnVtYmVyXG4gICAqIEBwYXJhbSBuXG4gICAqIEBwYXJhbSByYWRpeFxuICAgKiBAcGFyYW0gdXBjYXNlXG4gICAqL1xuICBmbXROdW1iZXIobjogbnVtYmVyLCByYWRpeDogbnVtYmVyLCB1cGNhc2UgPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgbGV0IG51bSA9IE1hdGguYWJzKG4pLnRvU3RyaW5nKHJhZGl4KTtcbiAgICBjb25zdCBwcmVjID0gdGhpcy5mbGFncy5wcmVjaXNpb247XG4gICAgaWYgKHByZWMgIT09IC0xKSB7XG4gICAgICB0aGlzLmZsYWdzLnplcm8gPSBmYWxzZTtcbiAgICAgIG51bSA9IG4gPT09IDAgJiYgcHJlYyA9PT0gMCA/IFwiXCIgOiBudW07XG4gICAgICB3aGlsZSAobnVtLmxlbmd0aCA8IHByZWMpIHtcbiAgICAgICAgbnVtID0gXCIwXCIgKyBudW07XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBwcmVmaXggPSBcIlwiO1xuICAgIGlmICh0aGlzLmZsYWdzLnNoYXJwKSB7XG4gICAgICBzd2l0Y2ggKHJhZGl4KSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBwcmVmaXggKz0gXCIwYlwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgLy8gZG9uJ3QgYW5ub3RhdGUgb2N0YWwgMCB3aXRoIDAuLi5cbiAgICAgICAgICBwcmVmaXggKz0gbnVtLnN0YXJ0c1dpdGgoXCIwXCIpID8gXCJcIiA6IFwiMFwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgIHByZWZpeCArPSBcIjB4XCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2Fubm90IGhhbmRsZSBiYXNlOiBcIiArIHJhZGl4KTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gZG9uJ3QgYWRkIHByZWZpeCBpbiBmcm9udCBvZiB2YWx1ZSB0cnVuY2F0ZWQgYnkgcHJlY2lzaW9uPTAsIHZhbD0wXG4gICAgbnVtID0gbnVtLmxlbmd0aCA9PT0gMCA/IG51bSA6IHByZWZpeCArIG51bTtcbiAgICBpZiAodXBjYXNlKSB7XG4gICAgICBudW0gPSBudW0udG9VcHBlckNhc2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFkTnVtKG51bSwgbiA8IDApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcm1hdCBudW1iZXIgd2l0aCBjb2RlIHBvaW50c1xuICAgKiBAcGFyYW0gblxuICAgKi9cbiAgZm10TnVtYmVyQ29kZVBvaW50KG46IG51bWJlcik6IHN0cmluZyB7XG4gICAgbGV0IHMgPSBcIlwiO1xuICAgIHRyeSB7XG4gICAgICBzID0gU3RyaW5nLmZyb21Db2RlUG9pbnQobik7XG4gICAgfSBjYXRjaCB7XG4gICAgICBzID0gVU5JQ09ERV9SRVBMQUNFTUVOVF9DSEFSQUNURVI7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBhZChzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtYXQgc3BlY2lhbCBmbG9hdFxuICAgKiBAcGFyYW0gblxuICAgKi9cbiAgZm10RmxvYXRTcGVjaWFsKG46IG51bWJlcik6IHN0cmluZyB7XG4gICAgLy8gZm9ybWF0dGluZyBvZiBOYU4gYW5kIEluZiBhcmUgcGFudHMtb24taGVhZFxuICAgIC8vIHN0dXBpZCBhbmQgbW9yZSBvciBsZXNzIGFyYml0cmFyeS5cblxuICAgIGlmIChpc05hTihuKSkge1xuICAgICAgdGhpcy5mbGFncy56ZXJvID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcy5wYWROdW0oXCJOYU5cIiwgZmFsc2UpO1xuICAgIH1cbiAgICBpZiAobiA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSB7XG4gICAgICB0aGlzLmZsYWdzLnplcm8gPSBmYWxzZTtcbiAgICAgIHRoaXMuZmxhZ3MucGx1cyA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy5wYWROdW0oXCJJbmZcIiwgZmFsc2UpO1xuICAgIH1cbiAgICBpZiAobiA9PT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKSB7XG4gICAgICB0aGlzLmZsYWdzLnplcm8gPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzLnBhZE51bShcIkluZlwiLCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIFwiXCI7XG4gIH1cblxuICAvKipcbiAgICogUm91bmQgZnJhY3Rpb24gdG8gcHJlY2lzaW9uXG4gICAqIEBwYXJhbSBmcmFjdGlvbmFsXG4gICAqIEBwYXJhbSBwcmVjaXNpb25cbiAgICogQHJldHVybnMgdHVwbGUgb2YgZnJhY3Rpb25hbCBhbmQgcm91bmRcbiAgICovXG4gIHJvdW5kRnJhY3Rpb25Ub1ByZWNpc2lvbihcbiAgICBmcmFjdGlvbmFsOiBzdHJpbmcsXG4gICAgcHJlY2lzaW9uOiBudW1iZXIsXG4gICk6IFtzdHJpbmcsIGJvb2xlYW5dIHtcbiAgICBsZXQgcm91bmQgPSBmYWxzZTtcbiAgICBpZiAoZnJhY3Rpb25hbC5sZW5ndGggPiBwcmVjaXNpb24pIHtcbiAgICAgIGZyYWN0aW9uYWwgPSBcIjFcIiArIGZyYWN0aW9uYWw7IC8vIHByZXBlbmQgYSAxIGluIGNhc2Ugb2YgbGVhZGluZyAwXG4gICAgICBsZXQgdG1wID0gcGFyc2VJbnQoZnJhY3Rpb25hbC5zbGljZSgwLCBwcmVjaXNpb24gKyAyKSkgLyAxMDtcbiAgICAgIHRtcCA9IE1hdGgucm91bmQodG1wKTtcbiAgICAgIGZyYWN0aW9uYWwgPSBNYXRoLmZsb29yKHRtcCkudG9TdHJpbmcoKTtcbiAgICAgIHJvdW5kID0gZnJhY3Rpb25hbFswXSA9PT0gXCIyXCI7XG4gICAgICBmcmFjdGlvbmFsID0gZnJhY3Rpb25hbC5zbGljZSgxKTsgLy8gcmVtb3ZlIGV4dHJhIDFcbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKGZyYWN0aW9uYWwubGVuZ3RoIDwgcHJlY2lzaW9uKSB7XG4gICAgICAgIGZyYWN0aW9uYWwgKz0gXCIwXCI7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBbZnJhY3Rpb25hbCwgcm91bmRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcm1hdCBmbG9hdCBFXG4gICAqIEBwYXJhbSBuXG4gICAqIEBwYXJhbSB1cGNhc2VcbiAgICovXG4gIGZtdEZsb2F0RShuOiBudW1iZXIsIHVwY2FzZSA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICBjb25zdCBzcGVjaWFsID0gdGhpcy5mbXRGbG9hdFNwZWNpYWwobik7XG4gICAgaWYgKHNwZWNpYWwgIT09IFwiXCIpIHtcbiAgICAgIHJldHVybiBzcGVjaWFsO1xuICAgIH1cblxuICAgIGNvbnN0IG0gPSBuLnRvRXhwb25lbnRpYWwoKS5tYXRjaChGTE9BVF9SRUdFWFApO1xuICAgIGlmICghbSkge1xuICAgICAgdGhyb3cgRXJyb3IoXCJjYW4ndCBoYXBwZW4sIGJ1Z1wiKTtcbiAgICB9XG4gICAgY29uc3QgcHJlY2lzaW9uID0gdGhpcy5mbGFncy5wcmVjaXNpb24gIT09IC0xXG4gICAgICA/IHRoaXMuZmxhZ3MucHJlY2lzaW9uXG4gICAgICA6IERFRkFVTFRfUFJFQ0lTSU9OO1xuICAgIGNvbnN0IFtmcmFjdGlvbmFsLCByb3VuZGluZ10gPSB0aGlzLnJvdW5kRnJhY3Rpb25Ub1ByZWNpc2lvbihcbiAgICAgIG1bRi5mcmFjdGlvbmFsXSB8fCBcIlwiLFxuICAgICAgcHJlY2lzaW9uLFxuICAgICk7XG5cbiAgICBsZXQgZSA9IG1bRi5leHBvbmVudF0hO1xuICAgIGxldCBlc2lnbiA9IG1bRi5lc2lnbl0hO1xuICAgIC8vIHNjaWVudGlmaWMgbm90YXRpb24gb3V0cHV0IHdpdGggZXhwb25lbnQgcGFkZGVkIHRvIG1pbmxlbiAyXG4gICAgbGV0IG1hbnRpc3NhID0gcGFyc2VJbnQobVtGLm1hbnRpc3NhXSEpO1xuICAgIGlmIChyb3VuZGluZykge1xuICAgICAgbWFudGlzc2EgKz0gMTtcbiAgICAgIGlmICgxMCA8PSBtYW50aXNzYSkge1xuICAgICAgICBtYW50aXNzYSA9IDE7XG4gICAgICAgIGNvbnN0IHIgPSBwYXJzZUludChlc2lnbiArIGUpICsgMTtcbiAgICAgICAgZSA9IHIudG9TdHJpbmcoKTtcbiAgICAgICAgZXNpZ24gPSByIDwgMCA/IFwiLVwiIDogXCIrXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGUgPSBlLmxlbmd0aCA9PT0gMSA/IFwiMFwiICsgZSA6IGU7XG4gICAgY29uc3QgdmFsID0gYCR7bWFudGlzc2F9LiR7ZnJhY3Rpb25hbH0ke3VwY2FzZSA/IFwiRVwiIDogXCJlXCJ9JHtlc2lnbn0ke2V9YDtcbiAgICByZXR1cm4gdGhpcy5wYWROdW0odmFsLCBuIDwgMCk7XG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0IGZsb2F0IEZcbiAgICogQHBhcmFtIG5cbiAgICovXG4gIGZtdEZsb2F0RihuOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNwZWNpYWwgPSB0aGlzLmZtdEZsb2F0U3BlY2lhbChuKTtcbiAgICBpZiAoc3BlY2lhbCAhPT0gXCJcIikge1xuICAgICAgcmV0dXJuIHNwZWNpYWw7XG4gICAgfVxuXG4gICAgLy8gc3R1cGlkIGhlbHBlciB0aGF0IHR1cm5zIGEgbnVtYmVyIGludG8gYSAocG90ZW50aWFsbHkpXG4gICAgLy8gVkVSWSBsb25nIHN0cmluZy5cbiAgICBmdW5jdGlvbiBleHBhbmROdW1iZXIobjogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgIGlmIChOdW1iZXIuaXNTYWZlSW50ZWdlcihuKSkge1xuICAgICAgICByZXR1cm4gbi50b1N0cmluZygpICsgXCIuXCI7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHQgPSBuLnRvRXhwb25lbnRpYWwoKS5zcGxpdChcImVcIik7XG4gICAgICBsZXQgbSA9IHRbMF0hLnJlcGxhY2UoXCIuXCIsIFwiXCIpO1xuICAgICAgY29uc3QgZSA9IHBhcnNlSW50KHRbMV0hKTtcbiAgICAgIGlmIChlIDwgMCkge1xuICAgICAgICBsZXQgblN0ciA9IFwiMC5cIjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgIT09IE1hdGguYWJzKGUpIC0gMTsgKytpKSB7XG4gICAgICAgICAgblN0ciArPSBcIjBcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG5TdHIgKz0gbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzcGxJZHggPSBlICsgMTtcbiAgICAgICAgd2hpbGUgKG0ubGVuZ3RoIDwgc3BsSWR4KSB7XG4gICAgICAgICAgbSArPSBcIjBcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbS5zbGljZSgwLCBzcGxJZHgpICsgXCIuXCIgKyBtLnNsaWNlKHNwbElkeCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIGF2b2lkaW5nIHNpZ24gbWFrZXMgcGFkZGluZyBlYXNpZXJcbiAgICBjb25zdCB2YWwgPSBleHBhbmROdW1iZXIoTWF0aC5hYnMobikpIGFzIHN0cmluZztcbiAgICBsZXQgW2RpZywgZnJhY3Rpb25hbF0gPSB2YWwuc3BsaXQoXCIuXCIpIGFzIFtzdHJpbmcsIHN0cmluZ107XG5cbiAgICBjb25zdCBwcmVjaXNpb24gPSB0aGlzLmZsYWdzLnByZWNpc2lvbiAhPT0gLTFcbiAgICAgID8gdGhpcy5mbGFncy5wcmVjaXNpb25cbiAgICAgIDogREVGQVVMVF9QUkVDSVNJT047XG4gICAgbGV0IHJvdW5kID0gZmFsc2U7XG4gICAgW2ZyYWN0aW9uYWwsIHJvdW5kXSA9IHRoaXMucm91bmRGcmFjdGlvblRvUHJlY2lzaW9uKGZyYWN0aW9uYWwsIHByZWNpc2lvbik7XG4gICAgaWYgKHJvdW5kKSB7XG4gICAgICBkaWcgPSAocGFyc2VJbnQoZGlnKSArIDEpLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBhZE51bShgJHtkaWd9LiR7ZnJhY3Rpb25hbH1gLCBuIDwgMCk7XG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0IGZsb2F0IEdcbiAgICogQHBhcmFtIG5cbiAgICogQHBhcmFtIHVwY2FzZVxuICAgKi9cbiAgZm10RmxvYXRHKG46IG51bWJlciwgdXBjYXNlID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNwZWNpYWwgPSB0aGlzLmZtdEZsb2F0U3BlY2lhbChuKTtcbiAgICBpZiAoc3BlY2lhbCAhPT0gXCJcIikge1xuICAgICAgcmV0dXJuIHNwZWNpYWw7XG4gICAgfVxuXG4gICAgLy8gVGhlIGRvdWJsZSBhcmd1bWVudCByZXByZXNlbnRpbmcgYSBmbG9hdGluZy1wb2ludCBudW1iZXIgc2hhbGwgYmVcbiAgICAvLyBjb252ZXJ0ZWQgaW4gdGhlIHN0eWxlIGYgb3IgZSAob3IgaW4gdGhlIHN0eWxlIEYgb3IgRSBpblxuICAgIC8vIHRoZSBjYXNlIG9mIGEgRyBjb252ZXJzaW9uIHNwZWNpZmllciksIGRlcGVuZGluZyBvbiB0aGVcbiAgICAvLyB2YWx1ZSBjb252ZXJ0ZWQgYW5kIHRoZSBwcmVjaXNpb24uIExldCBQIGVxdWFsIHRoZVxuICAgIC8vIHByZWNpc2lvbiBpZiBub24temVybywgNiBpZiB0aGUgcHJlY2lzaW9uIGlzIG9taXR0ZWQsIG9yIDFcbiAgICAvLyBpZiB0aGUgcHJlY2lzaW9uIGlzIHplcm8uIFRoZW4sIGlmIGEgY29udmVyc2lvbiB3aXRoIHN0eWxlIEUgd291bGRcbiAgICAvLyBoYXZlIGFuIGV4cG9uZW50IG9mIFg6XG5cbiAgICAvLyAgICAgLSBJZiBQID4gWD49LTQsIHRoZSBjb252ZXJzaW9uIHNoYWxsIGJlIHdpdGggc3R5bGUgZiAob3IgRiApXG4gICAgLy8gICAgIGFuZCBwcmVjaXNpb24gUCAtKCBYKzEpLlxuXG4gICAgLy8gICAgIC0gT3RoZXJ3aXNlLCB0aGUgY29udmVyc2lvbiBzaGFsbCBiZSB3aXRoIHN0eWxlIGUgKG9yIEUgKVxuICAgIC8vICAgICBhbmQgcHJlY2lzaW9uIFAgLTEuXG5cbiAgICAvLyBGaW5hbGx5LCB1bmxlc3MgdGhlICcjJyBmbGFnIGlzIHVzZWQsIGFueSB0cmFpbGluZyB6ZXJvcyBzaGFsbCBiZVxuICAgIC8vIHJlbW92ZWQgZnJvbSB0aGUgZnJhY3Rpb25hbCBwb3J0aW9uIG9mIHRoZSByZXN1bHQgYW5kIHRoZVxuICAgIC8vIGRlY2ltYWwtcG9pbnQgY2hhcmFjdGVyIHNoYWxsIGJlIHJlbW92ZWQgaWYgdGhlcmUgaXMgbm9cbiAgICAvLyBmcmFjdGlvbmFsIHBvcnRpb24gcmVtYWluaW5nLlxuXG4gICAgLy8gQSBkb3VibGUgYXJndW1lbnQgcmVwcmVzZW50aW5nIGFuIGluZmluaXR5IG9yIE5hTiBzaGFsbCBiZVxuICAgIC8vIGNvbnZlcnRlZCBpbiB0aGUgc3R5bGUgb2YgYW4gZiBvciBGIGNvbnZlcnNpb24gc3BlY2lmaWVyLlxuICAgIC8vIGh0dHBzOi8vcHVicy5vcGVuZ3JvdXAub3JnL29ubGluZXB1YnMvOTY5OTkxOTc5OS9mdW5jdGlvbnMvZnByaW50Zi5odG1sXG5cbiAgICBsZXQgUCA9IHRoaXMuZmxhZ3MucHJlY2lzaW9uICE9PSAtMVxuICAgICAgPyB0aGlzLmZsYWdzLnByZWNpc2lvblxuICAgICAgOiBERUZBVUxUX1BSRUNJU0lPTjtcbiAgICBQID0gUCA9PT0gMCA/IDEgOiBQO1xuXG4gICAgY29uc3QgbSA9IG4udG9FeHBvbmVudGlhbCgpLm1hdGNoKEZMT0FUX1JFR0VYUCk7XG4gICAgaWYgKCFtKSB7XG4gICAgICB0aHJvdyBFcnJvcihcImNhbid0IGhhcHBlblwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBYID0gcGFyc2VJbnQobVtGLmV4cG9uZW50XSEpICogKG1bRi5lc2lnbl0gPT09IFwiLVwiID8gLTEgOiAxKTtcbiAgICBsZXQgblN0ciA9IFwiXCI7XG4gICAgaWYgKFAgPiBYICYmIFggPj0gLTQpIHtcbiAgICAgIHRoaXMuZmxhZ3MucHJlY2lzaW9uID0gUCAtIChYICsgMSk7XG4gICAgICBuU3RyID0gdGhpcy5mbXRGbG9hdEYobik7XG4gICAgICBpZiAoIXRoaXMuZmxhZ3Muc2hhcnApIHtcbiAgICAgICAgblN0ciA9IG5TdHIucmVwbGFjZSgvXFwuPzAqJC8sIFwiXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZsYWdzLnByZWNpc2lvbiA9IFAgLSAxO1xuICAgICAgblN0ciA9IHRoaXMuZm10RmxvYXRFKG4pO1xuICAgICAgaWYgKCF0aGlzLmZsYWdzLnNoYXJwKSB7XG4gICAgICAgIG5TdHIgPSBuU3RyLnJlcGxhY2UoL1xcLj8wKmUvLCB1cGNhc2UgPyBcIkVcIiA6IFwiZVwiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5TdHI7XG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0IHN0cmluZ1xuICAgKiBAcGFyYW0gc1xuICAgKi9cbiAgZm10U3RyaW5nKHM6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuZmxhZ3MucHJlY2lzaW9uICE9PSAtMSkge1xuICAgICAgcyA9IHMuc2xpY2UoMCwgdGhpcy5mbGFncy5wcmVjaXNpb24pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wYWQocyk7XG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0IGhleFxuICAgKiBAcGFyYW0gdmFsXG4gICAqIEBwYXJhbSB1cHBlclxuICAgKi9cbiAgZm10SGV4KHZhbDogc3RyaW5nIHwgbnVtYmVyLCB1cHBlciA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICAvLyBhbGxvdyBvdGhlcnMgdHlwZXMgP1xuICAgIHN3aXRjaCAodHlwZW9mIHZhbCkge1xuICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICByZXR1cm4gdGhpcy5mbXROdW1iZXIodmFsIGFzIG51bWJlciwgMTYsIHVwcGVyKTtcbiAgICAgIGNhc2UgXCJzdHJpbmdcIjoge1xuICAgICAgICBjb25zdCBzaGFycCA9IHRoaXMuZmxhZ3Muc2hhcnAgJiYgdmFsLmxlbmd0aCAhPT0gMDtcbiAgICAgICAgbGV0IGhleCA9IHNoYXJwID8gXCIweFwiIDogXCJcIjtcbiAgICAgICAgY29uc3QgcHJlYyA9IHRoaXMuZmxhZ3MucHJlY2lzaW9uO1xuICAgICAgICBjb25zdCBlbmQgPSBwcmVjICE9PSAtMSA/IG1pbihwcmVjLCB2YWwubGVuZ3RoKSA6IHZhbC5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpICE9PSBlbmQ7ICsraSkge1xuICAgICAgICAgIGlmIChpICE9PSAwICYmIHRoaXMuZmxhZ3Muc3BhY2UpIHtcbiAgICAgICAgICAgIGhleCArPSBzaGFycCA/IFwiIDB4XCIgOiBcIiBcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVE9ETyhiYXJ0bG9taWVqdSk6IGZvciBub3cgb25seSB0YWtpbmcgaW50byBhY2NvdW50IHRoZVxuICAgICAgICAgIC8vIGxvd2VyIGhhbGYgb2YgdGhlIGNvZGVQb2ludCwgaWUuIGFzIGlmIGEgc3RyaW5nXG4gICAgICAgICAgLy8gaXMgYSBsaXN0IG9mIDhiaXQgdmFsdWVzIGluc3RlYWQgb2YgVUNTMiBydW5lc1xuICAgICAgICAgIGNvbnN0IGMgPSAodmFsLmNoYXJDb2RlQXQoaSkgJiAweGZmKS50b1N0cmluZygxNik7XG4gICAgICAgICAgaGV4ICs9IGMubGVuZ3RoID09PSAxID8gYDAke2N9YCA6IGM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwcGVyKSB7XG4gICAgICAgICAgaGV4ID0gaGV4LnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucGFkKGhleCk7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgXCJjdXJyZW50bHkgb25seSBudW1iZXIgYW5kIHN0cmluZyBhcmUgaW1wbGVtZW50ZWQgZm9yIGhleFwiLFxuICAgICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtYXQgdmFsdWVcbiAgICogQHBhcmFtIHZhbFxuICAgKi9cbiAgZm10Vih2YWw6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5mbGFncy5zaGFycCkge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuZmxhZ3MucHJlY2lzaW9uICE9PSAtMVxuICAgICAgICA/IHsgZGVwdGg6IHRoaXMuZmxhZ3MucHJlY2lzaW9uIH1cbiAgICAgICAgOiB7fTtcbiAgICAgIHJldHVybiB0aGlzLnBhZChEZW5vLmluc3BlY3QodmFsLCBvcHRpb25zKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHAgPSB0aGlzLmZsYWdzLnByZWNpc2lvbjtcbiAgICAgIHJldHVybiBwID09PSAtMSA/IHZhbC50b1N0cmluZygpIDogdmFsLnRvU3RyaW5nKCkuc2xpY2UoMCwgcCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZvcm1hdCBKU09OXG4gICAqIEBwYXJhbSB2YWxcbiAgICovXG4gIGZtdEoodmFsOiB1bmtub3duKTogc3RyaW5nIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtYXQgaW5zcGVjdFxuICAgKiBAcGFyYW0gdmFsXG4gICAqIEBwYXJhbSBjb21wYWN0IFdoZXRoZXIgb3Igbm90IHRoZSBvdXRwdXQgc2hvdWxkIGJlIGNvbXBhY3QuXG4gICAqL1xuICBmbXRJKHZhbDogdW5rbm93biwgY29tcGFjdDogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgcmV0dXJuIERlbm8uaW5zcGVjdCh2YWwsIHtcbiAgICAgIGNvbG9yczogIURlbm8/Lm5vQ29sb3IsXG4gICAgICBjb21wYWN0LFxuICAgICAgZGVwdGg6IEluZmluaXR5LFxuICAgICAgaXRlcmFibGVMaW1pdDogSW5maW5pdHksXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbmQgZm9ybWF0IGEgdmFyaWFibGUgbnVtYmVyIG9mIGBhcmdzYCBhcyBpcyBzcGVjaWZpZWQgYnkgYGZvcm1hdGAuXG4gKiBgc3ByaW50ZmAgcmV0dXJucyB0aGUgZm9ybWF0dGVkIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gZm9ybWF0XG4gKiBAcGFyYW0gYXJnc1xuICovXG5leHBvcnQgZnVuY3Rpb24gc3ByaW50Zihmb3JtYXQ6IHN0cmluZywgLi4uYXJnczogdW5rbm93bltdKTogc3RyaW5nIHtcbiAgY29uc3QgcHJpbnRmID0gbmV3IFByaW50Zihmb3JtYXQsIC4uLmFyZ3MpO1xuICByZXR1cm4gcHJpbnRmLmRvUHJpbnRmKCk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW5kIGZvcm1hdCBhIHZhcmlhYmxlIG51bWJlciBvZiBgYXJnc2AgYXMgaXMgc3BlY2lmaWVkIGJ5IGBmb3JtYXRgLlxuICogYHByaW50ZmAgd3JpdGVzIHRoZSBmb3JtYXR0ZWQgc3RyaW5nIHRvIHN0YW5kYXJkIG91dHB1dC5cbiAqIEBwYXJhbSBmb3JtYXRcbiAqIEBwYXJhbSBhcmdzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmludGYoZm9ybWF0OiBzdHJpbmcsIC4uLmFyZ3M6IHVua25vd25bXSkge1xuICBjb25zdCBzID0gc3ByaW50Zihmb3JtYXQsIC4uLmFyZ3MpO1xuICBEZW5vLnN0ZG91dC53cml0ZVN5bmMobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHMpKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0pDLEdBRUQsTUFBTSxRQUFRO0VBQ1osYUFBYTtFQUNiLFNBQVM7RUFDVCxZQUFZO0VBQ1osV0FBVztFQUNYLE9BQU87QUFDVDtBQUlBLE1BQU0sT0FBTztFQUNYLE9BQU87RUFDUCxXQUFXO0FBQ2I7QUFJQSxNQUFNLElBQUk7RUFDUixNQUFNO0VBQ04sVUFBVTtFQUNWLFlBQVk7RUFDWixPQUFPO0VBQ1AsVUFBVTtBQUNaO0FBRUEsTUFBTTtFQUNKLEtBQWU7RUFDZixLQUFlO0VBQ2YsTUFBZ0I7RUFDaEIsTUFBZ0I7RUFDaEIsS0FBZTtFQUNmLFNBQW1CO0VBQ25CLFFBQVEsQ0FBQyxFQUFFO0VBQ1gsWUFBWSxDQUFDLEVBQUU7QUFDakI7QUFFQSxNQUFNLE1BQU0sS0FBSyxHQUFHO0FBQ3BCLE1BQU0sZ0NBQWdDO0FBQ3RDLE1BQU0sb0JBQW9C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
// denoCacheMetadata=14891867620484097770,14002890446506599197