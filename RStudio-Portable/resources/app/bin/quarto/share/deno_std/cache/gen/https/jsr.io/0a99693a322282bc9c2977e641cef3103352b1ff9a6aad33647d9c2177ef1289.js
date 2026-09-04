// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Command line arguments parser based on
 * {@link https://github.com/minimistjs/minimist | minimist}.
 *
 * This module is browser compatible.
 *
 * @example
 * ```ts
 * import { parse } from "@std/flags";
 *
 * console.dir(parse(Deno.args));
 * ```
 *
 * @deprecated Use
 * {@linkcode https://jsr.io/@std/cli/doc/parse-args/~/parseArgs | parseArgs}
 * instead. This module will be removed once the Standard Library migrates to
 * {@link https://jsr.io/ | JSR}.
 *
 * @module
 */ import { assertExists } from "jsr:/@std/assert@^0.224.0/assert-exists";
const { hasOwn } = Object;
function get(obj, key) {
  if (hasOwn(obj, key)) {
    return obj[key];
  }
}
function getForce(obj, key) {
  const v = get(obj, key);
  assertExists(v);
  return v;
}
function isNumber(x) {
  if (typeof x === "number") return true;
  if (/^0x[0-9a-f]+$/i.test(String(x))) return true;
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x));
}
function hasKey(obj, keys) {
  let o = obj;
  keys.slice(0, -1).forEach((key)=>{
    o = get(o, key) ?? {};
  });
  const key = keys.at(-1);
  return key !== undefined && hasOwn(o, key);
}
/**
 * Take a set of command line arguments, optionally with a set of options, and
 * return an object representing the flags found in the passed arguments.
 *
 * By default, any arguments starting with `-` or `--` are considered boolean
 * flags. If the argument name is followed by an equal sign (`=`) it is
 * considered a key-value pair. Any arguments which could not be parsed are
 * available in the `_` property of the returned object.
 *
 * By default, the flags module tries to determine the type of all arguments
 * automatically and the return type of the `parse` method will have an index
 * signature with `any` as value (`{ [x: string]: any }`).
 *
 * If the `string`, `boolean` or `collect` option is set, the return value of
 * the `parse` method will be fully typed and the index signature of the return
 * type will change to `{ [x: string]: unknown }`.
 *
 * Any arguments after `'--'` will not be parsed and will end up in `parsedArgs._`.
 *
 * Numeric-looking arguments will be returned as numbers unless `options.string`
 * or `options.boolean` is set for that argument name.
 *
 * @example
 * ```ts
 * import { parse } from "@std/flags";
 * const parsedArgs = parse(Deno.args);
 * ```
 *
 * @example
 * ```ts
 * import { parse } from "@std/flags";
 * const parsedArgs = parse(["--foo", "--bar=baz", "./quux.txt"]);
 * // parsedArgs: { foo: true, bar: "baz", _: ["./quux.txt"] }
 * ```
 *
 * @deprecated Use
 * {@linkcode https://jsr.io/@std/cli/doc/parse-args/~/parseArgs | parseArgs}
 * instead. This module will be removed once the Standard Library migrates to
 * {@link https://jsr.io/ | JSR}.
 */ export function parse(args, { "--": doubleDash = false, alias = {}, boolean = false, default: defaults = {}, stopEarly = false, string = [], collect = [], negatable = [], unknown = (i)=>i } = {}) {
  const aliases = {};
  const flags = {
    bools: {},
    strings: {},
    unknownFn: unknown,
    allBools: false,
    collect: {},
    negatable: {}
  };
  if (alias !== undefined) {
    for(const key in alias){
      const val = getForce(alias, key);
      if (typeof val === "string") {
        aliases[key] = [
          val
        ];
      } else {
        aliases[key] = val;
      }
      const aliasesForKey = getForce(aliases, key);
      for (const alias of aliasesForKey){
        aliases[alias] = [
          key
        ].concat(aliasesForKey.filter((y)=>alias !== y));
      }
    }
  }
  if (boolean !== undefined) {
    if (typeof boolean === "boolean") {
      flags.allBools = !!boolean;
    } else {
      const booleanArgs = typeof boolean === "string" ? [
        boolean
      ] : boolean;
      for (const key of booleanArgs.filter(Boolean)){
        flags.bools[key] = true;
        const alias = get(aliases, key);
        if (alias) {
          for (const al of alias){
            flags.bools[al] = true;
          }
        }
      }
    }
  }
  if (string !== undefined) {
    const stringArgs = typeof string === "string" ? [
      string
    ] : string;
    for (const key of stringArgs.filter(Boolean)){
      flags.strings[key] = true;
      const alias = get(aliases, key);
      if (alias) {
        for (const al of alias){
          flags.strings[al] = true;
        }
      }
    }
  }
  if (collect !== undefined) {
    const collectArgs = typeof collect === "string" ? [
      collect
    ] : collect;
    for (const key of collectArgs.filter(Boolean)){
      flags.collect[key] = true;
      const alias = get(aliases, key);
      if (alias) {
        for (const al of alias){
          flags.collect[al] = true;
        }
      }
    }
  }
  if (negatable !== undefined) {
    const negatableArgs = typeof negatable === "string" ? [
      negatable
    ] : negatable;
    for (const key of negatableArgs.filter(Boolean)){
      flags.negatable[key] = true;
      const alias = get(aliases, key);
      if (alias) {
        for (const al of alias){
          flags.negatable[al] = true;
        }
      }
    }
  }
  const argv = {
    _: []
  };
  function argDefined(key, arg) {
    return flags.allBools && /^--[^=]+$/.test(arg) || get(flags.bools, key) || !!get(flags.strings, key) || !!get(aliases, key);
  }
  function setKey(obj, name, value, collect = true) {
    let o = obj;
    const keys = name.split(".");
    keys.slice(0, -1).forEach(function(key) {
      if (get(o, key) === undefined) {
        o[key] = {};
      }
      o = get(o, key);
    });
    const key = keys.at(-1);
    const collectable = collect && !!get(flags.collect, name);
    if (!collectable) {
      o[key] = value;
    } else if (get(o, key) === undefined) {
      o[key] = [
        value
      ];
    } else if (Array.isArray(get(o, key))) {
      o[key].push(value);
    } else {
      o[key] = [
        get(o, key),
        value
      ];
    }
  }
  function setArg(key, val, arg = undefined, collect) {
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg, key, val) === false) return;
    }
    const value = !get(flags.strings, key) && isNumber(val) ? Number(val) : val;
    setKey(argv, key, value, collect);
    const alias = get(aliases, key);
    if (alias) {
      for (const x of alias){
        setKey(argv, x, value, collect);
      }
    }
  }
  function aliasIsBoolean(key) {
    return getForce(aliases, key).some((x)=>typeof get(flags.bools, x) === "boolean");
  }
  let notFlags = [];
  // all args after "--" are not parsed
  if (args.includes("--")) {
    notFlags = args.slice(args.indexOf("--") + 1);
    args = args.slice(0, args.indexOf("--"));
  }
  for(let i = 0; i < args.length; i++){
    const arg = args[i];
    assertExists(arg);
    if (/^--.+=/.test(arg)) {
      const m = arg.match(/^--([^=]+)=(.*)$/s);
      assertExists(m);
      const [, key, value] = m;
      assertExists(key);
      if (flags.bools[key]) {
        const booleanValue = value !== "false";
        setArg(key, booleanValue, arg);
      } else {
        setArg(key, value, arg);
      }
    } else if (/^--no-.+/.test(arg) && get(flags.negatable, arg.replace(/^--no-/, ""))) {
      const m = arg.match(/^--no-(.+)/);
      assertExists(m);
      assertExists(m[1]);
      setArg(m[1], false, arg, false);
    } else if (/^--.+/.test(arg)) {
      const m = arg.match(/^--(.+)/);
      assertExists(m);
      assertExists(m[1]);
      const [, key] = m;
      const next = args[i + 1];
      if (next !== undefined && !/^-/.test(next) && !get(flags.bools, key) && !flags.allBools && (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
        setArg(key, next, arg);
        i++;
      } else if (next !== undefined && (next === "true" || next === "false")) {
        setArg(key, next === "true", arg);
        i++;
      } else {
        setArg(key, get(flags.strings, key) ? "" : true, arg);
      }
    } else if (/^-[^-]+/.test(arg)) {
      const letters = arg.slice(1, -1).split("");
      let broken = false;
      for (const [j, letter] of letters.entries()){
        const next = arg.slice(j + 2);
        if (next === "-") {
          setArg(letter, next, arg);
          continue;
        }
        if (/[A-Za-z]/.test(letter) && next.includes("=")) {
          setArg(letter, next.split(/=(.+)/)[1], arg);
          broken = true;
          break;
        }
        if (/[A-Za-z]/.test(letter) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
          setArg(letter, next, arg);
          broken = true;
          break;
        }
        if (letters[j + 1]?.match(/\W/)) {
          setArg(letter, arg.slice(j + 2), arg);
          broken = true;
          break;
        } else {
          setArg(letter, get(flags.strings, letter) ? "" : true, arg);
        }
      }
      const key = arg.at(-1);
      if (!broken && key !== "-") {
        const nextArg = args[i + 1];
        if (nextArg && !/^(-|--)[^-]/.test(nextArg) && !get(flags.bools, key) && (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
          setArg(key, nextArg, arg);
          i++;
        } else if (nextArg && (nextArg === "true" || nextArg === "false")) {
          setArg(key, nextArg === "true", arg);
          i++;
        } else {
          setArg(key, get(flags.strings, key) ? "" : true, arg);
        }
      }
    } else {
      if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
        argv._.push(flags.strings["_"] ?? !isNumber(arg) ? arg : Number(arg));
      }
      if (stopEarly) {
        argv._.push(...args.slice(i + 1));
        break;
      }
    }
  }
  for (const [key, value] of Object.entries(defaults)){
    if (!hasKey(argv, key.split("."))) {
      setKey(argv, key, value, false);
      const alias = aliases[key];
      if (alias !== undefined) {
        for (const x of alias){
          setKey(argv, x, value, false);
        }
      }
    }
  }
  for (const key of Object.keys(flags.bools)){
    if (!hasKey(argv, key.split("."))) {
      const value = get(flags.collect, key) ? [] : false;
      setKey(argv, key, value, false);
    }
  }
  for (const key of Object.keys(flags.strings)){
    if (!hasKey(argv, key.split(".")) && get(flags.collect, key)) {
      setKey(argv, key, [], false);
    }
  }
  if (doubleDash) {
    argv["--"] = [];
    for (const key of notFlags){
      argv["--"].push(key);
    }
  } else {
    for (const key of notFlags){
      argv._.push(key);
    }
  }
  return argv;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZmxhZ3MvMC4yMjQuMC9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBDb21tYW5kIGxpbmUgYXJndW1lbnRzIHBhcnNlciBiYXNlZCBvblxuICoge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9taW5pbWlzdGpzL21pbmltaXN0IHwgbWluaW1pc3R9LlxuICpcbiAqIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlIH0gZnJvbSBcIkBzdGQvZmxhZ3NcIjtcbiAqXG4gKiBjb25zb2xlLmRpcihwYXJzZShEZW5vLmFyZ3MpKTtcbiAqIGBgYFxuICpcbiAqIEBkZXByZWNhdGVkIFVzZVxuICoge0BsaW5rY29kZSBodHRwczovL2pzci5pby9Ac3RkL2NsaS9kb2MvcGFyc2UtYXJncy9+L3BhcnNlQXJncyB8IHBhcnNlQXJnc31cbiAqIGluc3RlYWQuIFRoaXMgbW9kdWxlIHdpbGwgYmUgcmVtb3ZlZCBvbmNlIHRoZSBTdGFuZGFyZCBMaWJyYXJ5IG1pZ3JhdGVzIHRvXG4gKiB7QGxpbmsgaHR0cHM6Ly9qc3IuaW8vIHwgSlNSfS5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cbmltcG9ydCB7IGFzc2VydEV4aXN0cyB9IGZyb20gXCJqc3I6L0BzdGQvYXNzZXJ0QF4wLjIyNC4wL2Fzc2VydC1leGlzdHNcIjtcblxuLyoqIENvbWJpbmVzIHJlY3Vyc2l2ZWx5IGFsbCBpbnRlcnNlY3Rpb24gdHlwZXMgYW5kIHJldHVybnMgYSBuZXcgc2luZ2xlIHR5cGUuICovXG50eXBlIElkPFRSZWNvcmQ+ID0gVFJlY29yZCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gID8gVFJlY29yZCBleHRlbmRzIGluZmVyIEluZmVycmVkUmVjb3JkXG4gICAgPyB7IFtLZXkgaW4ga2V5b2YgSW5mZXJyZWRSZWNvcmRdOiBJZDxJbmZlcnJlZFJlY29yZFtLZXldPiB9XG4gIDogbmV2ZXJcbiAgOiBUUmVjb3JkO1xuXG4vKiogQ29udmVydHMgYSB1bmlvbiB0eXBlIGBBIHwgQiB8IENgIGludG8gYW4gaW50ZXJzZWN0aW9uIHR5cGUgYEEgJiBCICYgQ2AuICovXG50eXBlIFVuaW9uVG9JbnRlcnNlY3Rpb248VFZhbHVlPiA9XG4gIChUVmFsdWUgZXh0ZW5kcyB1bmtub3duID8gKGFyZ3M6IFRWYWx1ZSkgPT4gdW5rbm93biA6IG5ldmVyKSBleHRlbmRzXG4gICAgKGFyZ3M6IGluZmVyIFIpID0+IHVua25vd24gPyBSIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPyBSIDogbmV2ZXJcbiAgICA6IG5ldmVyO1xuXG50eXBlIEJvb2xlYW5UeXBlID0gYm9vbGVhbiB8IHN0cmluZyB8IHVuZGVmaW5lZDtcbnR5cGUgU3RyaW5nVHlwZSA9IHN0cmluZyB8IHVuZGVmaW5lZDtcbnR5cGUgQXJnVHlwZSA9IFN0cmluZ1R5cGUgfCBCb29sZWFuVHlwZTtcblxudHlwZSBDb2xsZWN0YWJsZSA9IHN0cmluZyB8IHVuZGVmaW5lZDtcbnR5cGUgTmVnYXRhYmxlID0gc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG50eXBlIFVzZVR5cGVzPFxuICBUQm9vbGVhbnMgZXh0ZW5kcyBCb29sZWFuVHlwZSxcbiAgVFN0cmluZ3MgZXh0ZW5kcyBTdHJpbmdUeXBlLFxuICBUQ29sbGVjdGFibGUgZXh0ZW5kcyBDb2xsZWN0YWJsZSxcbj4gPSB1bmRlZmluZWQgZXh0ZW5kcyAoXG4gICYgKGZhbHNlIGV4dGVuZHMgVEJvb2xlYW5zID8gdW5kZWZpbmVkIDogVEJvb2xlYW5zKVxuICAmIFRDb2xsZWN0YWJsZVxuICAmIFRTdHJpbmdzXG4pID8gZmFsc2VcbiAgOiB0cnVlO1xuXG4vKipcbiAqIENyZWF0ZXMgYSByZWNvcmQgd2l0aCBhbGwgYXZhaWxhYmxlIGZsYWdzIHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgdHlwZSBhbmRcbiAqIGRlZmF1bHQgdHlwZS5cbiAqL1xudHlwZSBWYWx1ZXM8XG4gIFRCb29sZWFucyBleHRlbmRzIEJvb2xlYW5UeXBlLFxuICBUU3RyaW5ncyBleHRlbmRzIFN0cmluZ1R5cGUsXG4gIFRDb2xsZWN0YWJsZSBleHRlbmRzIENvbGxlY3RhYmxlLFxuICBUTmVnYXRhYmxlIGV4dGVuZHMgTmVnYXRhYmxlLFxuICBURGVmYXVsdCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkLFxuICBUQWxpYXNlcyBleHRlbmRzIEFsaWFzZXMgfCB1bmRlZmluZWQsXG4+ID0gVXNlVHlwZXM8VEJvb2xlYW5zLCBUU3RyaW5ncywgVENvbGxlY3RhYmxlPiBleHRlbmRzIHRydWUgP1xuICAgICYgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgICAmIEFkZEFsaWFzZXM8XG4gICAgICBTcHJlYWREZWZhdWx0czxcbiAgICAgICAgJiBDb2xsZWN0VmFsdWVzPFRTdHJpbmdzLCBzdHJpbmcsIFRDb2xsZWN0YWJsZSwgVE5lZ2F0YWJsZT5cbiAgICAgICAgJiBSZWN1cnNpdmVSZXF1aXJlZDxDb2xsZWN0VmFsdWVzPFRCb29sZWFucywgYm9vbGVhbiwgVENvbGxlY3RhYmxlPj5cbiAgICAgICAgJiBDb2xsZWN0VW5rbm93blZhbHVlczxcbiAgICAgICAgICBUQm9vbGVhbnMsXG4gICAgICAgICAgVFN0cmluZ3MsXG4gICAgICAgICAgVENvbGxlY3RhYmxlLFxuICAgICAgICAgIFROZWdhdGFibGVcbiAgICAgICAgPixcbiAgICAgICAgRGVkb3RSZWNvcmQ8VERlZmF1bHQ+XG4gICAgICA+LFxuICAgICAgVEFsaWFzZXNcbiAgICA+XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIDogUmVjb3JkPHN0cmluZywgYW55PjtcblxudHlwZSBBbGlhc2VzPFRBcmdOYW1lcyA9IHN0cmluZywgVEFsaWFzTmFtZXMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gUGFydGlhbDxcbiAgUmVjb3JkPEV4dHJhY3Q8VEFyZ05hbWVzLCBzdHJpbmc+LCBUQWxpYXNOYW1lcyB8IFJlYWRvbmx5QXJyYXk8VEFsaWFzTmFtZXM+PlxuPjtcblxudHlwZSBBZGRBbGlhc2VzPFxuICBUQXJncyxcbiAgVEFsaWFzZXMgZXh0ZW5kcyBBbGlhc2VzIHwgdW5kZWZpbmVkLFxuPiA9IHtcbiAgW1RBcmdOYW1lIGluIGtleW9mIFRBcmdzIGFzIEFsaWFzTmFtZXM8VEFyZ05hbWUsIFRBbGlhc2VzPl06IFRBcmdzW1RBcmdOYW1lXTtcbn07XG5cbnR5cGUgQWxpYXNOYW1lczxcbiAgVEFyZ05hbWUsXG4gIFRBbGlhc2VzIGV4dGVuZHMgQWxpYXNlcyB8IHVuZGVmaW5lZCxcbj4gPSBUQXJnTmFtZSBleHRlbmRzIGtleW9mIFRBbGlhc2VzXG4gID8gc3RyaW5nIGV4dGVuZHMgVEFsaWFzZXNbVEFyZ05hbWVdID8gVEFyZ05hbWVcbiAgOiBUQWxpYXNlc1tUQXJnTmFtZV0gZXh0ZW5kcyBzdHJpbmcgPyBUQXJnTmFtZSB8IFRBbGlhc2VzW1RBcmdOYW1lXVxuICA6IFRBbGlhc2VzW1RBcmdOYW1lXSBleHRlbmRzIEFycmF5PHN0cmluZz5cbiAgICA/IFRBcmdOYW1lIHwgVEFsaWFzZXNbVEFyZ05hbWVdW251bWJlcl1cbiAgOiBUQXJnTmFtZVxuICA6IFRBcmdOYW1lO1xuXG4vKipcbiAqIFNwcmVhZHMgYWxsIGRlZmF1bHQgdmFsdWVzIG9mIFJlY29yZCBgVERlZmF1bHRzYCBpbnRvIFJlY29yZCBgVEFyZ3NgXG4gKiBhbmQgbWFrZXMgZGVmYXVsdCB2YWx1ZXMgcmVxdWlyZWQuXG4gKlxuICogKipFeGFtcGxlOioqXG4gKiBgU3ByZWFkVmFsdWVzPHsgZm9vPzogYm9vbGVhbiwgYmFyPzogbnVtYmVyIH0sIHsgZm9vOiBudW1iZXIgfT5gXG4gKlxuICogKipSZXN1bHQ6KiogYHsgZm9vOiBib29sZWFuIHwgbnVtYmVyLCBiYXI/OiBudW1iZXIgfWBcbiAqL1xudHlwZSBTcHJlYWREZWZhdWx0czxUQXJncywgVERlZmF1bHRzPiA9IFREZWZhdWx0cyBleHRlbmRzIHVuZGVmaW5lZCA/IFRBcmdzXG4gIDogVEFyZ3MgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA/XG4gICAgICAmIE9taXQ8VEFyZ3MsIGtleW9mIFREZWZhdWx0cz5cbiAgICAgICYge1xuICAgICAgICBbRGVmYXVsdCBpbiBrZXlvZiBURGVmYXVsdHNdOiBEZWZhdWx0IGV4dGVuZHMga2V5b2YgVEFyZ3NcbiAgICAgICAgICA/IChUQXJnc1tEZWZhdWx0XSAmIFREZWZhdWx0c1tEZWZhdWx0XSB8IFREZWZhdWx0c1tEZWZhdWx0XSkgZXh0ZW5kc1xuICAgICAgICAgICAgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgICAgICAgICAgID8gTm9uTnVsbGFibGU8U3ByZWFkRGVmYXVsdHM8VEFyZ3NbRGVmYXVsdF0sIFREZWZhdWx0c1tEZWZhdWx0XT4+XG4gICAgICAgICAgOiBURGVmYXVsdHNbRGVmYXVsdF0gfCBOb25OdWxsYWJsZTxUQXJnc1tEZWZhdWx0XT5cbiAgICAgICAgICA6IHVua25vd247XG4gICAgICB9XG4gIDogbmV2ZXI7XG5cbi8qKlxuICogRGVmaW5lcyB0aGUgUmVjb3JkIGZvciB0aGUgYGRlZmF1bHRgIG9wdGlvbiB0byBhZGRcbiAqIGF1dG8tc3VnZ2VzdGlvbiBzdXBwb3J0IGZvciBJREUncy5cbiAqL1xudHlwZSBEZWZhdWx0czxUQm9vbGVhbnMgZXh0ZW5kcyBCb29sZWFuVHlwZSwgVFN0cmluZ3MgZXh0ZW5kcyBTdHJpbmdUeXBlPiA9IElkPFxuICBVbmlvblRvSW50ZXJzZWN0aW9uPFxuICAgICYgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgICAvLyBEZWRvdHRlZCBhdXRvIHN1Z2dlc3Rpb25zOiB7IGZvbzogeyBiYXI6IHVua25vd24gfSB9XG4gICAgJiBNYXBUeXBlczxUU3RyaW5ncywgdW5rbm93bj5cbiAgICAmIE1hcFR5cGVzPFRCb29sZWFucywgdW5rbm93bj5cbiAgICAvLyBGbGF0IGF1dG8gc3VnZ2VzdGlvbnM6IHsgXCJmb28uYmFyXCI6IHVua25vd24gfVxuICAgICYgTWFwRGVmYXVsdHM8VEJvb2xlYW5zPlxuICAgICYgTWFwRGVmYXVsdHM8VFN0cmluZ3M+XG4gID5cbj47XG5cbnR5cGUgTWFwRGVmYXVsdHM8VEFyZ05hbWVzIGV4dGVuZHMgQXJnVHlwZT4gPSBQYXJ0aWFsPFxuICBSZWNvcmQ8VEFyZ05hbWVzIGV4dGVuZHMgc3RyaW5nID8gVEFyZ05hbWVzIDogc3RyaW5nLCB1bmtub3duPlxuPjtcblxudHlwZSBSZWN1cnNpdmVSZXF1aXJlZDxUUmVjb3JkPiA9IFRSZWNvcmQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA/IHtcbiAgICBbS2V5IGluIGtleW9mIFRSZWNvcmRdLT86IFJlY3Vyc2l2ZVJlcXVpcmVkPFRSZWNvcmRbS2V5XT47XG4gIH1cbiAgOiBUUmVjb3JkO1xuXG4vKiogU2FtZSBhcyBgTWFwVHlwZXNgIGJ1dCBhbHNvIHN1cHBvcnRzIGNvbGxlY3RhYmxlIG9wdGlvbnMuICovXG50eXBlIENvbGxlY3RWYWx1ZXM8XG4gIFRBcmdOYW1lcyBleHRlbmRzIEFyZ1R5cGUsXG4gIFRUeXBlLFxuICBUQ29sbGVjdGFibGUgZXh0ZW5kcyBDb2xsZWN0YWJsZSxcbiAgVE5lZ2F0YWJsZSBleHRlbmRzIE5lZ2F0YWJsZSA9IHVuZGVmaW5lZCxcbj4gPSBVbmlvblRvSW50ZXJzZWN0aW9uPFxuICBFeHRyYWN0PFRBcmdOYW1lcywgVENvbGxlY3RhYmxlPiBleHRlbmRzIHN0cmluZyA/XG4gICAgICAmIChFeGNsdWRlPFRBcmdOYW1lcywgVENvbGxlY3RhYmxlPiBleHRlbmRzIG5ldmVyID8gUmVjb3JkPG5ldmVyLCBuZXZlcj5cbiAgICAgICAgOiBNYXBUeXBlczxFeGNsdWRlPFRBcmdOYW1lcywgVENvbGxlY3RhYmxlPiwgVFR5cGUsIFROZWdhdGFibGU+KVxuICAgICAgJiAoRXh0cmFjdDxUQXJnTmFtZXMsIFRDb2xsZWN0YWJsZT4gZXh0ZW5kcyBuZXZlciA/IFJlY29yZDxuZXZlciwgbmV2ZXI+XG4gICAgICAgIDogUmVjdXJzaXZlUmVxdWlyZWQ8XG4gICAgICAgICAgTWFwVHlwZXM8RXh0cmFjdDxUQXJnTmFtZXMsIFRDb2xsZWN0YWJsZT4sIEFycmF5PFRUeXBlPiwgVE5lZ2F0YWJsZT5cbiAgICAgICAgPilcbiAgICA6IE1hcFR5cGVzPFRBcmdOYW1lcywgVFR5cGUsIFROZWdhdGFibGU+XG4+O1xuXG4vKiogU2FtZSBhcyBgUmVjb3JkYCBidXQgYWxzbyBzdXBwb3J0cyBkb3R0ZWQgYW5kIG5lZ2F0YWJsZSBvcHRpb25zLiAqL1xudHlwZSBNYXBUeXBlczxcbiAgVEFyZ05hbWVzIGV4dGVuZHMgQXJnVHlwZSxcbiAgVFR5cGUsXG4gIFROZWdhdGFibGUgZXh0ZW5kcyBOZWdhdGFibGUgPSB1bmRlZmluZWQsXG4+ID0gdW5kZWZpbmVkIGV4dGVuZHMgVEFyZ05hbWVzID8gUmVjb3JkPG5ldmVyLCBuZXZlcj5cbiAgOiBUQXJnTmFtZXMgZXh0ZW5kcyBgJHtpbmZlciBOYW1lfS4ke2luZmVyIFJlc3R9YCA/IHtcbiAgICAgIFtLZXkgaW4gTmFtZV0/OiBNYXBUeXBlczxcbiAgICAgICAgUmVzdCxcbiAgICAgICAgVFR5cGUsXG4gICAgICAgIFROZWdhdGFibGUgZXh0ZW5kcyBgJHtOYW1lfS4ke2luZmVyIE5lZ2F0ZX1gID8gTmVnYXRlIDogdW5kZWZpbmVkXG4gICAgICA+O1xuICAgIH1cbiAgOiBUQXJnTmFtZXMgZXh0ZW5kcyBzdHJpbmcgPyBQYXJ0aWFsPFxuICAgICAgUmVjb3JkPFRBcmdOYW1lcywgVE5lZ2F0YWJsZSBleHRlbmRzIFRBcmdOYW1lcyA/IFRUeXBlIHwgZmFsc2UgOiBUVHlwZT5cbiAgICA+XG4gIDogUmVjb3JkPG5ldmVyLCBuZXZlcj47XG5cbnR5cGUgQ29sbGVjdFVua25vd25WYWx1ZXM8XG4gIFRCb29sZWFucyBleHRlbmRzIEJvb2xlYW5UeXBlLFxuICBUU3RyaW5ncyBleHRlbmRzIFN0cmluZ1R5cGUsXG4gIFRDb2xsZWN0YWJsZSBleHRlbmRzIENvbGxlY3RhYmxlLFxuICBUTmVnYXRhYmxlIGV4dGVuZHMgTmVnYXRhYmxlLFxuPiA9IFVuaW9uVG9JbnRlcnNlY3Rpb248XG4gIFRDb2xsZWN0YWJsZSBleHRlbmRzIFRCb29sZWFucyAmIFRTdHJpbmdzID8gUmVjb3JkPG5ldmVyLCBuZXZlcj5cbiAgICA6IERlZG90UmVjb3JkPFxuICAgICAgLy8gVW5rbm93biBjb2xsZWN0YWJsZSAmIG5vbi1uZWdhdGFibGUgYXJncy5cbiAgICAgICYgUmVjb3JkPFxuICAgICAgICBFeGNsdWRlPFxuICAgICAgICAgIEV4dHJhY3Q8RXhjbHVkZTxUQ29sbGVjdGFibGUsIFROZWdhdGFibGU+LCBzdHJpbmc+LFxuICAgICAgICAgIEV4dHJhY3Q8VFN0cmluZ3MgfCBUQm9vbGVhbnMsIHN0cmluZz5cbiAgICAgICAgPixcbiAgICAgICAgQXJyYXk8dW5rbm93bj5cbiAgICAgID5cbiAgICAgIC8vIFVua25vd24gY29sbGVjdGFibGUgJiBuZWdhdGFibGUgYXJncy5cbiAgICAgICYgUmVjb3JkPFxuICAgICAgICBFeGNsdWRlPFxuICAgICAgICAgIEV4dHJhY3Q8RXh0cmFjdDxUQ29sbGVjdGFibGUsIFROZWdhdGFibGU+LCBzdHJpbmc+LFxuICAgICAgICAgIEV4dHJhY3Q8VFN0cmluZ3MgfCBUQm9vbGVhbnMsIHN0cmluZz5cbiAgICAgICAgPixcbiAgICAgICAgQXJyYXk8dW5rbm93bj4gfCBmYWxzZVxuICAgICAgPlxuICAgID5cbj47XG5cbi8qKiBDb252ZXJ0cyBgeyBcImZvby5iYXIuYmF6XCI6IHVua25vd24gfWAgaW50byBgeyBmb286IHsgYmFyOiB7IGJhejogdW5rbm93biB9IH0gfWAuICovXG50eXBlIERlZG90UmVjb3JkPFRSZWNvcmQ+ID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj4gZXh0ZW5kcyBUUmVjb3JkID8gVFJlY29yZFxuICA6IFRSZWNvcmQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA/IFVuaW9uVG9JbnRlcnNlY3Rpb248XG4gICAgICBWYWx1ZU9mPFxuICAgICAgICB7XG4gICAgICAgICAgW0tleSBpbiBrZXlvZiBUUmVjb3JkXTogS2V5IGV4dGVuZHMgc3RyaW5nID8gRGVkb3Q8S2V5LCBUUmVjb3JkW0tleV0+XG4gICAgICAgICAgICA6IG5ldmVyO1xuICAgICAgICB9XG4gICAgICA+XG4gICAgPlxuICA6IFRSZWNvcmQ7XG5cbnR5cGUgRGVkb3Q8VEtleSBleHRlbmRzIHN0cmluZywgVFZhbHVlPiA9IFRLZXkgZXh0ZW5kc1xuICBgJHtpbmZlciBOYW1lfS4ke2luZmVyIFJlc3R9YCA/IHsgW0tleSBpbiBOYW1lXTogRGVkb3Q8UmVzdCwgVFZhbHVlPiB9XG4gIDogeyBbS2V5IGluIFRLZXldOiBUVmFsdWUgfTtcblxudHlwZSBWYWx1ZU9mPFRWYWx1ZT4gPSBUVmFsdWVba2V5b2YgVFZhbHVlXTtcblxuLyoqXG4gKiBUaGUgdmFsdWUgcmV0dXJuZWQgZnJvbSBgcGFyc2VgLlxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBJbXBvcnQgZnJvbVxuICoge0BsaW5rIGh0dHBzOi8vZGVuby5sYW5kL3N0ZC9jbGkvcGFyc2VfYXJncy50c30gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IHR5cGUgQXJnczxcbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgVEFyZ3MgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IFJlY29yZDxzdHJpbmcsIGFueT4sXG4gIFREb3VibGVEYXNoIGV4dGVuZHMgYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbj4gPSBJZDxcbiAgJiBUQXJnc1xuICAmIHtcbiAgICAvKiogQ29udGFpbnMgYWxsIHRoZSBhcmd1bWVudHMgdGhhdCBkaWRuJ3QgaGF2ZSBhbiBvcHRpb24gYXNzb2NpYXRlZCB3aXRoXG4gICAgICogdGhlbS4gKi9cbiAgICBfOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+O1xuICB9XG4gICYgKGJvb2xlYW4gZXh0ZW5kcyBURG91YmxlRGFzaCA/IERvdWJsZURhc2hcbiAgICA6IHRydWUgZXh0ZW5kcyBURG91YmxlRGFzaCA/IFJlcXVpcmVkPERvdWJsZURhc2g+XG4gICAgOiBSZWNvcmQ8bmV2ZXIsIG5ldmVyPilcbj47XG5cbnR5cGUgRG91YmxlRGFzaCA9IHtcbiAgLyoqIENvbnRhaW5zIGFsbCB0aGUgYXJndW1lbnRzIHRoYXQgYXBwZWFyIGFmdGVyIHRoZSBkb3VibGUgZGFzaDogXCItLVwiLiAqL1xuICBcIi0tXCI/OiBBcnJheTxzdHJpbmc+O1xufTtcblxuLyoqXG4gKiBUaGUgb3B0aW9ucyBmb3IgdGhlIGBwYXJzZWAgY2FsbC5cbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gSW1wb3J0IGZyb21cbiAqIHtAbGluayBodHRwczovL2Rlbm8ubGFuZC9zdGQvY2xpL3BhcnNlX2FyZ3MudHN9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VPcHRpb25zPFxuICBUQm9vbGVhbnMgZXh0ZW5kcyBCb29sZWFuVHlwZSA9IEJvb2xlYW5UeXBlLFxuICBUU3RyaW5ncyBleHRlbmRzIFN0cmluZ1R5cGUgPSBTdHJpbmdUeXBlLFxuICBUQ29sbGVjdGFibGUgZXh0ZW5kcyBDb2xsZWN0YWJsZSA9IENvbGxlY3RhYmxlLFxuICBUTmVnYXRhYmxlIGV4dGVuZHMgTmVnYXRhYmxlID0gTmVnYXRhYmxlLFxuICBURGVmYXVsdCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkID1cbiAgICB8IFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gICAgfCB1bmRlZmluZWQsXG4gIFRBbGlhc2VzIGV4dGVuZHMgQWxpYXNlcyB8IHVuZGVmaW5lZCA9IEFsaWFzZXMgfCB1bmRlZmluZWQsXG4gIFREb3VibGVEYXNoIGV4dGVuZHMgYm9vbGVhbiB8IHVuZGVmaW5lZCA9IGJvb2xlYW4gfCB1bmRlZmluZWQsXG4+IHtcbiAgLyoqXG4gICAqIFdoZW4gYHRydWVgLCBwb3B1bGF0ZSB0aGUgcmVzdWx0IGBfYCB3aXRoIGV2ZXJ5dGhpbmcgYmVmb3JlIHRoZSBgLS1gIGFuZFxuICAgKiB0aGUgcmVzdWx0IGBbJy0tJ11gIHdpdGggZXZlcnl0aGluZyBhZnRlciB0aGUgYC0tYC5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKlxuICAgKiAgQGV4YW1wbGVcbiAgICogYGBgdHNcbiAgICogLy8gJCBkZW5vIHJ1biBleGFtcGxlLnRzIC0tIGEgYXJnMVxuICAgKiBpbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJAc3RkL2ZsYWdzXCI7XG4gICAqIGNvbnNvbGUuZGlyKHBhcnNlKERlbm8uYXJncywgeyBcIi0tXCI6IGZhbHNlIH0pKTtcbiAgICogLy8gb3V0cHV0OiB7IF86IFsgXCJhXCIsIFwiYXJnMVwiIF0gfVxuICAgKiBjb25zb2xlLmRpcihwYXJzZShEZW5vLmFyZ3MsIHsgXCItLVwiOiB0cnVlIH0pKTtcbiAgICogLy8gb3V0cHV0OiB7IF86IFtdLCAtLTogWyBcImFcIiwgXCJhcmcxXCIgXSB9XG4gICAqIGBgYFxuICAgKi9cbiAgXCItLVwiPzogVERvdWJsZURhc2g7XG5cbiAgLyoqXG4gICAqIEFuIG9iamVjdCBtYXBwaW5nIHN0cmluZyBuYW1lcyB0byBzdHJpbmdzIG9yIGFycmF5cyBvZiBzdHJpbmcgYXJndW1lbnRcbiAgICogbmFtZXMgdG8gdXNlIGFzIGFsaWFzZXMuXG4gICAqL1xuICBhbGlhcz86IFRBbGlhc2VzO1xuXG4gIC8qKlxuICAgKiBBIGJvb2xlYW4sIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzIHRvIGFsd2F5cyB0cmVhdCBhcyBib29sZWFucy4gSWZcbiAgICogYHRydWVgIHdpbGwgdHJlYXQgYWxsIGRvdWJsZSBoeXBoZW5hdGVkIGFyZ3VtZW50cyB3aXRob3V0IGVxdWFsIHNpZ25zIGFzXG4gICAqIGBib29sZWFuYCAoZS5nLiBhZmZlY3RzIGAtLWZvb2AsIG5vdCBgLWZgIG9yIGAtLWZvbz1iYXJgKS5cbiAgICogIEFsbCBgYm9vbGVhbmAgYXJndW1lbnRzIHdpbGwgYmUgc2V0IHRvIGBmYWxzZWAgYnkgZGVmYXVsdC5cbiAgICovXG4gIGJvb2xlYW4/OiBUQm9vbGVhbnMgfCBSZWFkb25seUFycmF5PEV4dHJhY3Q8VEJvb2xlYW5zLCBzdHJpbmc+PjtcblxuICAvKiogQW4gb2JqZWN0IG1hcHBpbmcgc3RyaW5nIGFyZ3VtZW50IG5hbWVzIHRvIGRlZmF1bHQgdmFsdWVzLiAqL1xuICBkZWZhdWx0PzogVERlZmF1bHQgJiBEZWZhdWx0czxUQm9vbGVhbnMsIFRTdHJpbmdzPjtcblxuICAvKipcbiAgICogV2hlbiBgdHJ1ZWAsIHBvcHVsYXRlIHRoZSByZXN1bHQgYF9gIHdpdGggZXZlcnl0aGluZyBhZnRlciB0aGUgZmlyc3RcbiAgICogbm9uLW9wdGlvbi5cbiAgICovXG4gIHN0b3BFYXJseT86IGJvb2xlYW47XG5cbiAgLyoqIEEgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MgYXJndW1lbnQgbmFtZXMgdG8gYWx3YXlzIHRyZWF0IGFzIHN0cmluZ3MuICovXG4gIHN0cmluZz86IFRTdHJpbmdzIHwgUmVhZG9ubHlBcnJheTxFeHRyYWN0PFRTdHJpbmdzLCBzdHJpbmc+PjtcblxuICAvKipcbiAgICogQSBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncyBhcmd1bWVudCBuYW1lcyB0byBhbHdheXMgdHJlYXQgYXMgYXJyYXlzLlxuICAgKiBDb2xsZWN0YWJsZSBvcHRpb25zIGNhbiBiZSB1c2VkIG11bHRpcGxlIHRpbWVzLiBBbGwgdmFsdWVzIHdpbGwgYmVcbiAgICogY29sbGVjdGVkIGludG8gb25lIGFycmF5LiBJZiBhIG5vbi1jb2xsZWN0YWJsZSBvcHRpb24gaXMgdXNlZCBtdWx0aXBsZVxuICAgKiB0aW1lcywgdGhlIGxhc3QgdmFsdWUgaXMgdXNlZC5cbiAgICogQWxsIENvbGxlY3RhYmxlIGFyZ3VtZW50cyB3aWxsIGJlIHNldCB0byBgW11gIGJ5IGRlZmF1bHQuXG4gICAqL1xuICBjb2xsZWN0PzogVENvbGxlY3RhYmxlIHwgUmVhZG9ubHlBcnJheTxFeHRyYWN0PFRDb2xsZWN0YWJsZSwgc3RyaW5nPj47XG5cbiAgLyoqXG4gICAqIEEgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MgYXJndW1lbnQgbmFtZXMgd2hpY2ggY2FuIGJlIG5lZ2F0ZWRcbiAgICogYnkgcHJlZml4aW5nIHRoZW0gd2l0aCBgLS1uby1gLCBsaWtlIGAtLW5vLWNvbmZpZ2AuXG4gICAqL1xuICBuZWdhdGFibGU/OiBUTmVnYXRhYmxlIHwgUmVhZG9ubHlBcnJheTxFeHRyYWN0PFROZWdhdGFibGUsIHN0cmluZz4+O1xuXG4gIC8qKlxuICAgKiBBIGZ1bmN0aW9uIHdoaWNoIGlzIGludm9rZWQgd2l0aCBhIGNvbW1hbmQgbGluZSBwYXJhbWV0ZXIgbm90IGRlZmluZWQgaW5cbiAgICogdGhlIGBvcHRpb25zYCBjb25maWd1cmF0aW9uIG9iamVjdC4gSWYgdGhlIGZ1bmN0aW9uIHJldHVybnMgYGZhbHNlYCwgdGhlXG4gICAqIHVua25vd24gb3B0aW9uIGlzIG5vdCBhZGRlZCB0byBgcGFyc2VkQXJnc2AuXG4gICAqL1xuICB1bmtub3duPzogKGFyZzogc3RyaW5nLCBrZXk/OiBzdHJpbmcsIHZhbHVlPzogdW5rbm93bikgPT4gdW5rbm93bjtcbn1cblxuaW50ZXJmYWNlIEZsYWdzIHtcbiAgYm9vbHM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+O1xuICBzdHJpbmdzOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPjtcbiAgY29sbGVjdDogUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG4gIG5lZ2F0YWJsZTogUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG4gIHVua25vd25GbjogKGFyZzogc3RyaW5nLCBrZXk/OiBzdHJpbmcsIHZhbHVlPzogdW5rbm93bikgPT4gdW5rbm93bjtcbiAgYWxsQm9vbHM6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBOZXN0ZWRNYXBwaW5nIHtcbiAgW2tleTogc3RyaW5nXTogTmVzdGVkTWFwcGluZyB8IHVua25vd247XG59XG5cbmNvbnN0IHsgaGFzT3duIH0gPSBPYmplY3Q7XG5cbmZ1bmN0aW9uIGdldDxUVmFsdWU+KFxuICBvYmo6IFJlY29yZDxzdHJpbmcsIFRWYWx1ZT4sXG4gIGtleTogc3RyaW5nLFxuKTogVFZhbHVlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGhhc093bihvYmosIGtleSkpIHtcbiAgICByZXR1cm4gb2JqW2tleV07XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0Rm9yY2U8VFZhbHVlPihvYmo6IFJlY29yZDxzdHJpbmcsIFRWYWx1ZT4sIGtleTogc3RyaW5nKTogVFZhbHVlIHtcbiAgY29uc3QgdiA9IGdldChvYmosIGtleSk7XG4gIGFzc2VydEV4aXN0cyh2KTtcbiAgcmV0dXJuIHY7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKHg6IHVua25vd24pOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiB4ID09PSBcIm51bWJlclwiKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKC9eMHhbMC05YS1mXSskL2kudGVzdChTdHJpbmcoeCkpKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIC9eWy0rXT8oPzpcXGQrKD86XFwuXFxkKik/fFxcLlxcZCspKGVbLStdP1xcZCspPyQvLnRlc3QoU3RyaW5nKHgpKTtcbn1cblxuZnVuY3Rpb24gaGFzS2V5KG9iajogTmVzdGVkTWFwcGluZywga2V5czogc3RyaW5nW10pOiBib29sZWFuIHtcbiAgbGV0IG8gPSBvYmo7XG4gIGtleXMuc2xpY2UoMCwgLTEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIG8gPSAoZ2V0KG8sIGtleSkgPz8ge30pIGFzIE5lc3RlZE1hcHBpbmc7XG4gIH0pO1xuXG4gIGNvbnN0IGtleSA9IGtleXMuYXQoLTEpO1xuICByZXR1cm4ga2V5ICE9PSB1bmRlZmluZWQgJiYgaGFzT3duKG8sIGtleSk7XG59XG5cbi8qKlxuICogVGFrZSBhIHNldCBvZiBjb21tYW5kIGxpbmUgYXJndW1lbnRzLCBvcHRpb25hbGx5IHdpdGggYSBzZXQgb2Ygb3B0aW9ucywgYW5kXG4gKiByZXR1cm4gYW4gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgZmxhZ3MgZm91bmQgaW4gdGhlIHBhc3NlZCBhcmd1bWVudHMuXG4gKlxuICogQnkgZGVmYXVsdCwgYW55IGFyZ3VtZW50cyBzdGFydGluZyB3aXRoIGAtYCBvciBgLS1gIGFyZSBjb25zaWRlcmVkIGJvb2xlYW5cbiAqIGZsYWdzLiBJZiB0aGUgYXJndW1lbnQgbmFtZSBpcyBmb2xsb3dlZCBieSBhbiBlcXVhbCBzaWduIChgPWApIGl0IGlzXG4gKiBjb25zaWRlcmVkIGEga2V5LXZhbHVlIHBhaXIuIEFueSBhcmd1bWVudHMgd2hpY2ggY291bGQgbm90IGJlIHBhcnNlZCBhcmVcbiAqIGF2YWlsYWJsZSBpbiB0aGUgYF9gIHByb3BlcnR5IG9mIHRoZSByZXR1cm5lZCBvYmplY3QuXG4gKlxuICogQnkgZGVmYXVsdCwgdGhlIGZsYWdzIG1vZHVsZSB0cmllcyB0byBkZXRlcm1pbmUgdGhlIHR5cGUgb2YgYWxsIGFyZ3VtZW50c1xuICogYXV0b21hdGljYWxseSBhbmQgdGhlIHJldHVybiB0eXBlIG9mIHRoZSBgcGFyc2VgIG1ldGhvZCB3aWxsIGhhdmUgYW4gaW5kZXhcbiAqIHNpZ25hdHVyZSB3aXRoIGBhbnlgIGFzIHZhbHVlIChgeyBbeDogc3RyaW5nXTogYW55IH1gKS5cbiAqXG4gKiBJZiB0aGUgYHN0cmluZ2AsIGBib29sZWFuYCBvciBgY29sbGVjdGAgb3B0aW9uIGlzIHNldCwgdGhlIHJldHVybiB2YWx1ZSBvZlxuICogdGhlIGBwYXJzZWAgbWV0aG9kIHdpbGwgYmUgZnVsbHkgdHlwZWQgYW5kIHRoZSBpbmRleCBzaWduYXR1cmUgb2YgdGhlIHJldHVyblxuICogdHlwZSB3aWxsIGNoYW5nZSB0byBgeyBbeDogc3RyaW5nXTogdW5rbm93biB9YC5cbiAqXG4gKiBBbnkgYXJndW1lbnRzIGFmdGVyIGAnLS0nYCB3aWxsIG5vdCBiZSBwYXJzZWQgYW5kIHdpbGwgZW5kIHVwIGluIGBwYXJzZWRBcmdzLl9gLlxuICpcbiAqIE51bWVyaWMtbG9va2luZyBhcmd1bWVudHMgd2lsbCBiZSByZXR1cm5lZCBhcyBudW1iZXJzIHVubGVzcyBgb3B0aW9ucy5zdHJpbmdgXG4gKiBvciBgb3B0aW9ucy5ib29sZWFuYCBpcyBzZXQgZm9yIHRoYXQgYXJndW1lbnQgbmFtZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlIH0gZnJvbSBcIkBzdGQvZmxhZ3NcIjtcbiAqIGNvbnN0IHBhcnNlZEFyZ3MgPSBwYXJzZShEZW5vLmFyZ3MpO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJAc3RkL2ZsYWdzXCI7XG4gKiBjb25zdCBwYXJzZWRBcmdzID0gcGFyc2UoW1wiLS1mb29cIiwgXCItLWJhcj1iYXpcIiwgXCIuL3F1dXgudHh0XCJdKTtcbiAqIC8vIHBhcnNlZEFyZ3M6IHsgZm9vOiB0cnVlLCBiYXI6IFwiYmF6XCIsIF86IFtcIi4vcXV1eC50eHRcIl0gfVxuICogYGBgXG4gKlxuICogQGRlcHJlY2F0ZWQgVXNlXG4gKiB7QGxpbmtjb2RlIGh0dHBzOi8vanNyLmlvL0BzdGQvY2xpL2RvYy9wYXJzZS1hcmdzL34vcGFyc2VBcmdzIHwgcGFyc2VBcmdzfVxuICogaW5zdGVhZC4gVGhpcyBtb2R1bGUgd2lsbCBiZSByZW1vdmVkIG9uY2UgdGhlIFN0YW5kYXJkIExpYnJhcnkgbWlncmF0ZXMgdG9cbiAqIHtAbGluayBodHRwczovL2pzci5pby8gfCBKU1J9LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2U8XG4gIFRBcmdzIGV4dGVuZHMgVmFsdWVzPFxuICAgIFRCb29sZWFucyxcbiAgICBUU3RyaW5ncyxcbiAgICBUQ29sbGVjdGFibGUsXG4gICAgVE5lZ2F0YWJsZSxcbiAgICBURGVmYXVsdHMsXG4gICAgVEFsaWFzZXNcbiAgPixcbiAgVERvdWJsZURhc2ggZXh0ZW5kcyBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkLFxuICBUQm9vbGVhbnMgZXh0ZW5kcyBCb29sZWFuVHlwZSA9IHVuZGVmaW5lZCxcbiAgVFN0cmluZ3MgZXh0ZW5kcyBTdHJpbmdUeXBlID0gdW5kZWZpbmVkLFxuICBUQ29sbGVjdGFibGUgZXh0ZW5kcyBDb2xsZWN0YWJsZSA9IHVuZGVmaW5lZCxcbiAgVE5lZ2F0YWJsZSBleHRlbmRzIE5lZ2F0YWJsZSA9IHVuZGVmaW5lZCxcbiAgVERlZmF1bHRzIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQsXG4gIFRBbGlhc2VzIGV4dGVuZHMgQWxpYXNlczxUQWxpYXNBcmdOYW1lcywgVEFsaWFzTmFtZXM+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkLFxuICBUQWxpYXNBcmdOYW1lcyBleHRlbmRzIHN0cmluZyA9IHN0cmluZyxcbiAgVEFsaWFzTmFtZXMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmcsXG4+KFxuICBhcmdzOiBzdHJpbmdbXSxcbiAge1xuICAgIFwiLS1cIjogZG91YmxlRGFzaCA9IGZhbHNlLFxuICAgIGFsaWFzID0ge30gYXMgTm9uTnVsbGFibGU8VEFsaWFzZXM+LFxuICAgIGJvb2xlYW4gPSBmYWxzZSxcbiAgICBkZWZhdWx0OiBkZWZhdWx0cyA9IHt9IGFzIFREZWZhdWx0cyAmIERlZmF1bHRzPFRCb29sZWFucywgVFN0cmluZ3M+LFxuICAgIHN0b3BFYXJseSA9IGZhbHNlLFxuICAgIHN0cmluZyA9IFtdLFxuICAgIGNvbGxlY3QgPSBbXSxcbiAgICBuZWdhdGFibGUgPSBbXSxcbiAgICB1bmtub3duID0gKGk6IHN0cmluZyk6IHVua25vd24gPT4gaSxcbiAgfTogUGFyc2VPcHRpb25zPFxuICAgIFRCb29sZWFucyxcbiAgICBUU3RyaW5ncyxcbiAgICBUQ29sbGVjdGFibGUsXG4gICAgVE5lZ2F0YWJsZSxcbiAgICBURGVmYXVsdHMsXG4gICAgVEFsaWFzZXMsXG4gICAgVERvdWJsZURhc2hcbiAgPiA9IHt9LFxuKTogQXJnczxUQXJncywgVERvdWJsZURhc2g+IHtcbiAgY29uc3QgYWxpYXNlczogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge307XG4gIGNvbnN0IGZsYWdzOiBGbGFncyA9IHtcbiAgICBib29sczoge30sXG4gICAgc3RyaW5nczoge30sXG4gICAgdW5rbm93bkZuOiB1bmtub3duLFxuICAgIGFsbEJvb2xzOiBmYWxzZSxcbiAgICBjb2xsZWN0OiB7fSxcbiAgICBuZWdhdGFibGU6IHt9LFxuICB9O1xuXG4gIGlmIChhbGlhcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYWxpYXMpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGdldEZvcmNlKGFsaWFzLCBrZXkpO1xuICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgYWxpYXNlc1trZXldID0gW3ZhbF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbGlhc2VzW2tleV0gPSB2YWwgYXMgQXJyYXk8c3RyaW5nPjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFsaWFzZXNGb3JLZXkgPSBnZXRGb3JjZShhbGlhc2VzLCBrZXkpO1xuICAgICAgZm9yIChjb25zdCBhbGlhcyBvZiBhbGlhc2VzRm9yS2V5KSB7XG4gICAgICAgIGFsaWFzZXNbYWxpYXNdID0gW2tleV0uY29uY2F0KGFsaWFzZXNGb3JLZXkuZmlsdGVyKCh5KSA9PiBhbGlhcyAhPT0geSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChib29sZWFuICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAodHlwZW9mIGJvb2xlYW4gPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICBmbGFncy5hbGxCb29scyA9ICEhYm9vbGVhbjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYm9vbGVhbkFyZ3M6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiA9IHR5cGVvZiBib29sZWFuID09PSBcInN0cmluZ1wiXG4gICAgICAgID8gW2Jvb2xlYW5dXG4gICAgICAgIDogYm9vbGVhbjtcblxuICAgICAgZm9yIChjb25zdCBrZXkgb2YgYm9vbGVhbkFyZ3MuZmlsdGVyKEJvb2xlYW4pKSB7XG4gICAgICAgIGZsYWdzLmJvb2xzW2tleV0gPSB0cnVlO1xuICAgICAgICBjb25zdCBhbGlhcyA9IGdldChhbGlhc2VzLCBrZXkpO1xuICAgICAgICBpZiAoYWxpYXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGFsIG9mIGFsaWFzKSB7XG4gICAgICAgICAgICBmbGFncy5ib29sc1thbF0gPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChzdHJpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHN0cmluZ0FyZ3M6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiA9IHR5cGVvZiBzdHJpbmcgPT09IFwic3RyaW5nXCJcbiAgICAgID8gW3N0cmluZ11cbiAgICAgIDogc3RyaW5nO1xuXG4gICAgZm9yIChjb25zdCBrZXkgb2Ygc3RyaW5nQXJncy5maWx0ZXIoQm9vbGVhbikpIHtcbiAgICAgIGZsYWdzLnN0cmluZ3Nba2V5XSA9IHRydWU7XG4gICAgICBjb25zdCBhbGlhcyA9IGdldChhbGlhc2VzLCBrZXkpO1xuICAgICAgaWYgKGFsaWFzKSB7XG4gICAgICAgIGZvciAoY29uc3QgYWwgb2YgYWxpYXMpIHtcbiAgICAgICAgICBmbGFncy5zdHJpbmdzW2FsXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoY29sbGVjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgY29sbGVjdEFyZ3M6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiA9IHR5cGVvZiBjb2xsZWN0ID09PSBcInN0cmluZ1wiXG4gICAgICA/IFtjb2xsZWN0XVxuICAgICAgOiBjb2xsZWN0O1xuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgY29sbGVjdEFyZ3MuZmlsdGVyKEJvb2xlYW4pKSB7XG4gICAgICBmbGFncy5jb2xsZWN0W2tleV0gPSB0cnVlO1xuICAgICAgY29uc3QgYWxpYXMgPSBnZXQoYWxpYXNlcywga2V5KTtcbiAgICAgIGlmIChhbGlhcykge1xuICAgICAgICBmb3IgKGNvbnN0IGFsIG9mIGFsaWFzKSB7XG4gICAgICAgICAgZmxhZ3MuY29sbGVjdFthbF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKG5lZ2F0YWJsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgbmVnYXRhYmxlQXJnczogUmVhZG9ubHlBcnJheTxzdHJpbmc+ID0gdHlwZW9mIG5lZ2F0YWJsZSA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBbbmVnYXRhYmxlXVxuICAgICAgOiBuZWdhdGFibGU7XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBuZWdhdGFibGVBcmdzLmZpbHRlcihCb29sZWFuKSkge1xuICAgICAgZmxhZ3MubmVnYXRhYmxlW2tleV0gPSB0cnVlO1xuICAgICAgY29uc3QgYWxpYXMgPSBnZXQoYWxpYXNlcywga2V5KTtcbiAgICAgIGlmIChhbGlhcykge1xuICAgICAgICBmb3IgKGNvbnN0IGFsIG9mIGFsaWFzKSB7XG4gICAgICAgICAgZmxhZ3MubmVnYXRhYmxlW2FsXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBhcmd2OiBBcmdzID0geyBfOiBbXSB9O1xuXG4gIGZ1bmN0aW9uIGFyZ0RlZmluZWQoa2V5OiBzdHJpbmcsIGFyZzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIChmbGFncy5hbGxCb29scyAmJiAvXi0tW149XSskLy50ZXN0KGFyZykpIHx8XG4gICAgICBnZXQoZmxhZ3MuYm9vbHMsIGtleSkgfHxcbiAgICAgICEhZ2V0KGZsYWdzLnN0cmluZ3MsIGtleSkgfHxcbiAgICAgICEhZ2V0KGFsaWFzZXMsIGtleSlcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0S2V5KFxuICAgIG9iajogTmVzdGVkTWFwcGluZyxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdmFsdWU6IHVua25vd24sXG4gICAgY29sbGVjdCA9IHRydWUsXG4gICkge1xuICAgIGxldCBvID0gb2JqO1xuICAgIGNvbnN0IGtleXMgPSBuYW1lLnNwbGl0KFwiLlwiKTtcbiAgICBrZXlzLnNsaWNlKDAsIC0xKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmIChnZXQobywga2V5KSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG9ba2V5XSA9IHt9O1xuICAgICAgfVxuICAgICAgbyA9IGdldChvLCBrZXkpIGFzIE5lc3RlZE1hcHBpbmc7XG4gICAgfSk7XG5cbiAgICBjb25zdCBrZXkgPSBrZXlzLmF0KC0xKSE7XG4gICAgY29uc3QgY29sbGVjdGFibGUgPSBjb2xsZWN0ICYmICEhZ2V0KGZsYWdzLmNvbGxlY3QsIG5hbWUpO1xuXG4gICAgaWYgKCFjb2xsZWN0YWJsZSkge1xuICAgICAgb1trZXldID0gdmFsdWU7XG4gICAgfSBlbHNlIGlmIChnZXQobywga2V5KSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvW2tleV0gPSBbdmFsdWVdO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShnZXQobywga2V5KSkpIHtcbiAgICAgIChvW2tleV0gYXMgdW5rbm93bltdKS5wdXNoKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb1trZXldID0gW2dldChvLCBrZXkpLCB2YWx1ZV07XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2V0QXJnKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHZhbDogdW5rbm93bixcbiAgICBhcmc6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbiAgICBjb2xsZWN0PzogYm9vbGVhbixcbiAgKSB7XG4gICAgaWYgKGFyZyAmJiBmbGFncy51bmtub3duRm4gJiYgIWFyZ0RlZmluZWQoa2V5LCBhcmcpKSB7XG4gICAgICBpZiAoZmxhZ3MudW5rbm93bkZuKGFyZywga2V5LCB2YWwpID09PSBmYWxzZSkgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlID0gIWdldChmbGFncy5zdHJpbmdzLCBrZXkpICYmIGlzTnVtYmVyKHZhbCkgPyBOdW1iZXIodmFsKSA6IHZhbDtcbiAgICBzZXRLZXkoYXJndiwga2V5LCB2YWx1ZSwgY29sbGVjdCk7XG5cbiAgICBjb25zdCBhbGlhcyA9IGdldChhbGlhc2VzLCBrZXkpO1xuICAgIGlmIChhbGlhcykge1xuICAgICAgZm9yIChjb25zdCB4IG9mIGFsaWFzKSB7XG4gICAgICAgIHNldEtleShhcmd2LCB4LCB2YWx1ZSwgY29sbGVjdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYWxpYXNJc0Jvb2xlYW4oa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZ2V0Rm9yY2UoYWxpYXNlcywga2V5KS5zb21lKFxuICAgICAgKHgpID0+IHR5cGVvZiBnZXQoZmxhZ3MuYm9vbHMsIHgpID09PSBcImJvb2xlYW5cIixcbiAgICApO1xuICB9XG5cbiAgbGV0IG5vdEZsYWdzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIGFsbCBhcmdzIGFmdGVyIFwiLS1cIiBhcmUgbm90IHBhcnNlZFxuICBpZiAoYXJncy5pbmNsdWRlcyhcIi0tXCIpKSB7XG4gICAgbm90RmxhZ3MgPSBhcmdzLnNsaWNlKGFyZ3MuaW5kZXhPZihcIi0tXCIpICsgMSk7XG4gICAgYXJncyA9IGFyZ3Muc2xpY2UoMCwgYXJncy5pbmRleE9mKFwiLS1cIikpO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYXJnID0gYXJnc1tpXTtcbiAgICBhc3NlcnRFeGlzdHMoYXJnKTtcblxuICAgIGlmICgvXi0tLis9Ly50ZXN0KGFyZykpIHtcbiAgICAgIGNvbnN0IG0gPSBhcmcubWF0Y2goL14tLShbXj1dKyk9KC4qKSQvcyk7XG4gICAgICBhc3NlcnRFeGlzdHMobSk7XG4gICAgICBjb25zdCBbLCBrZXksIHZhbHVlXSA9IG07XG4gICAgICBhc3NlcnRFeGlzdHMoa2V5KTtcblxuICAgICAgaWYgKGZsYWdzLmJvb2xzW2tleV0pIHtcbiAgICAgICAgY29uc3QgYm9vbGVhblZhbHVlID0gdmFsdWUgIT09IFwiZmFsc2VcIjtcbiAgICAgICAgc2V0QXJnKGtleSwgYm9vbGVhblZhbHVlLCBhcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0QXJnKGtleSwgdmFsdWUsIGFyZyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIC9eLS1uby0uKy8udGVzdChhcmcpICYmIGdldChmbGFncy5uZWdhdGFibGUsIGFyZy5yZXBsYWNlKC9eLS1uby0vLCBcIlwiKSlcbiAgICApIHtcbiAgICAgIGNvbnN0IG0gPSBhcmcubWF0Y2goL14tLW5vLSguKykvKTtcbiAgICAgIGFzc2VydEV4aXN0cyhtKTtcbiAgICAgIGFzc2VydEV4aXN0cyhtWzFdKTtcbiAgICAgIHNldEFyZyhtWzFdLCBmYWxzZSwgYXJnLCBmYWxzZSk7XG4gICAgfSBlbHNlIGlmICgvXi0tLisvLnRlc3QoYXJnKSkge1xuICAgICAgY29uc3QgbSA9IGFyZy5tYXRjaCgvXi0tKC4rKS8pO1xuICAgICAgYXNzZXJ0RXhpc3RzKG0pO1xuICAgICAgYXNzZXJ0RXhpc3RzKG1bMV0pO1xuICAgICAgY29uc3QgWywga2V5XSA9IG07XG4gICAgICBjb25zdCBuZXh0ID0gYXJnc1tpICsgMV07XG4gICAgICBpZiAoXG4gICAgICAgIG5leHQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAhL14tLy50ZXN0KG5leHQpICYmXG4gICAgICAgICFnZXQoZmxhZ3MuYm9vbHMsIGtleSkgJiZcbiAgICAgICAgIWZsYWdzLmFsbEJvb2xzICYmXG4gICAgICAgIChnZXQoYWxpYXNlcywga2V5KSA/ICFhbGlhc0lzQm9vbGVhbihrZXkpIDogdHJ1ZSlcbiAgICAgICkge1xuICAgICAgICBzZXRBcmcoa2V5LCBuZXh0LCBhcmcpO1xuICAgICAgICBpKys7XG4gICAgICB9IGVsc2UgaWYgKG5leHQgIT09IHVuZGVmaW5lZCAmJiAobmV4dCA9PT0gXCJ0cnVlXCIgfHwgbmV4dCA9PT0gXCJmYWxzZVwiKSkge1xuICAgICAgICBzZXRBcmcoa2V5LCBuZXh0ID09PSBcInRydWVcIiwgYXJnKTtcbiAgICAgICAgaSsrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0QXJnKGtleSwgZ2V0KGZsYWdzLnN0cmluZ3MsIGtleSkgPyBcIlwiIDogdHJ1ZSwgYXJnKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKC9eLVteLV0rLy50ZXN0KGFyZykpIHtcbiAgICAgIGNvbnN0IGxldHRlcnMgPSBhcmcuc2xpY2UoMSwgLTEpLnNwbGl0KFwiXCIpO1xuXG4gICAgICBsZXQgYnJva2VuID0gZmFsc2U7XG4gICAgICBmb3IgKGNvbnN0IFtqLCBsZXR0ZXJdIG9mIGxldHRlcnMuZW50cmllcygpKSB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBhcmcuc2xpY2UoaiArIDIpO1xuXG4gICAgICAgIGlmIChuZXh0ID09PSBcIi1cIikge1xuICAgICAgICAgIHNldEFyZyhsZXR0ZXIsIG5leHQsIGFyZyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoL1tBLVphLXpdLy50ZXN0KGxldHRlcikgJiYgbmV4dC5pbmNsdWRlcyhcIj1cIikpIHtcbiAgICAgICAgICBzZXRBcmcobGV0dGVyLCBuZXh0LnNwbGl0KC89KC4rKS8pWzFdLCBhcmcpO1xuICAgICAgICAgIGJyb2tlbiA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgL1tBLVphLXpdLy50ZXN0KGxldHRlcikgJiZcbiAgICAgICAgICAvLT9cXGQrKFxcLlxcZCopPyhlLT9cXGQrKT8kLy50ZXN0KG5leHQpXG4gICAgICAgICkge1xuICAgICAgICAgIHNldEFyZyhsZXR0ZXIsIG5leHQsIGFyZyk7XG4gICAgICAgICAgYnJva2VuID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsZXR0ZXJzW2ogKyAxXT8ubWF0Y2goL1xcVy8pKSB7XG4gICAgICAgICAgc2V0QXJnKGxldHRlciwgYXJnLnNsaWNlKGogKyAyKSwgYXJnKTtcbiAgICAgICAgICBicm9rZW4gPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldEFyZyhsZXR0ZXIsIGdldChmbGFncy5zdHJpbmdzLCBsZXR0ZXIpID8gXCJcIiA6IHRydWUsIGFyZyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3Qga2V5ID0gYXJnLmF0KC0xKSE7XG4gICAgICBpZiAoIWJyb2tlbiAmJiBrZXkgIT09IFwiLVwiKSB7XG4gICAgICAgIGNvbnN0IG5leHRBcmcgPSBhcmdzW2kgKyAxXTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIG5leHRBcmcgJiZcbiAgICAgICAgICAhL14oLXwtLSlbXi1dLy50ZXN0KG5leHRBcmcpICYmXG4gICAgICAgICAgIWdldChmbGFncy5ib29scywga2V5KSAmJlxuICAgICAgICAgIChnZXQoYWxpYXNlcywga2V5KSA/ICFhbGlhc0lzQm9vbGVhbihrZXkpIDogdHJ1ZSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgc2V0QXJnKGtleSwgbmV4dEFyZywgYXJnKTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH0gZWxzZSBpZiAobmV4dEFyZyAmJiAobmV4dEFyZyA9PT0gXCJ0cnVlXCIgfHwgbmV4dEFyZyA9PT0gXCJmYWxzZVwiKSkge1xuICAgICAgICAgIHNldEFyZyhrZXksIG5leHRBcmcgPT09IFwidHJ1ZVwiLCBhcmcpO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRBcmcoa2V5LCBnZXQoZmxhZ3Muc3RyaW5ncywga2V5KSA/IFwiXCIgOiB0cnVlLCBhcmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghZmxhZ3MudW5rbm93bkZuIHx8IGZsYWdzLnVua25vd25GbihhcmcpICE9PSBmYWxzZSkge1xuICAgICAgICBhcmd2Ll8ucHVzaChmbGFncy5zdHJpbmdzW1wiX1wiXSA/PyAhaXNOdW1iZXIoYXJnKSA/IGFyZyA6IE51bWJlcihhcmcpKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdG9wRWFybHkpIHtcbiAgICAgICAgYXJndi5fLnB1c2goLi4uYXJncy5zbGljZShpICsgMSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhkZWZhdWx0cykpIHtcbiAgICBpZiAoIWhhc0tleShhcmd2LCBrZXkuc3BsaXQoXCIuXCIpKSkge1xuICAgICAgc2V0S2V5KGFyZ3YsIGtleSwgdmFsdWUsIGZhbHNlKTtcblxuICAgICAgY29uc3QgYWxpYXMgPSBhbGlhc2VzW2tleV07XG4gICAgICBpZiAoYWxpYXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBmb3IgKGNvbnN0IHggb2YgYWxpYXMpIHtcbiAgICAgICAgICBzZXRLZXkoYXJndiwgeCwgdmFsdWUsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGZsYWdzLmJvb2xzKSkge1xuICAgIGlmICghaGFzS2V5KGFyZ3YsIGtleS5zcGxpdChcIi5cIikpKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGdldChmbGFncy5jb2xsZWN0LCBrZXkpID8gW10gOiBmYWxzZTtcbiAgICAgIHNldEtleShcbiAgICAgICAgYXJndixcbiAgICAgICAga2V5LFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgZmFsc2UsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGZsYWdzLnN0cmluZ3MpKSB7XG4gICAgaWYgKCFoYXNLZXkoYXJndiwga2V5LnNwbGl0KFwiLlwiKSkgJiYgZ2V0KGZsYWdzLmNvbGxlY3QsIGtleSkpIHtcbiAgICAgIHNldEtleShcbiAgICAgICAgYXJndixcbiAgICAgICAga2V5LFxuICAgICAgICBbXSxcbiAgICAgICAgZmFsc2UsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGlmIChkb3VibGVEYXNoKSB7XG4gICAgYXJndltcIi0tXCJdID0gW107XG4gICAgZm9yIChjb25zdCBrZXkgb2Ygbm90RmxhZ3MpIHtcbiAgICAgIGFyZ3ZbXCItLVwiXS5wdXNoKGtleSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAoY29uc3Qga2V5IG9mIG5vdEZsYWdzKSB7XG4gICAgICBhcmd2Ll8ucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhcmd2IGFzIEFyZ3M8VEFyZ3MsIFREb3VibGVEYXNoPjtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBQ0QsU0FBUyxZQUFZLFFBQVEsMENBQTBDO0FBZ1Z2RSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUc7QUFFbkIsU0FBUyxJQUNQLEdBQTJCLEVBQzNCLEdBQVc7RUFFWCxJQUFJLE9BQU8sS0FBSyxNQUFNO0lBQ3BCLE9BQU8sR0FBRyxDQUFDLElBQUk7RUFDakI7QUFDRjtBQUVBLFNBQVMsU0FBaUIsR0FBMkIsRUFBRSxHQUFXO0VBQ2hFLE1BQU0sSUFB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
// denoCacheMetadata=18069698377781681709,3078830127644169158