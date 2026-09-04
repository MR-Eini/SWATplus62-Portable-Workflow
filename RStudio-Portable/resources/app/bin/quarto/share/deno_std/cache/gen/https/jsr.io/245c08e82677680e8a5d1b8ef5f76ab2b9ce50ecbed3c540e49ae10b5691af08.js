// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Command line arguments parser based on
 * {@link https://github.com/minimistjs/minimist | minimist}.
 *
 * @example
 * ```ts
 * import { parseArgs } from "@std/cli/parse-args";
 *
 * console.dir(parseArgs(Deno.args));
 * ```
 *
 * @module
 */ /** Combines recursively all intersection types and returns a new single type.
 * @internal
 */ function isNumber(x) {
  if (/^0x[0-9a-f]+$/i.test(String(x))) return true;
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x));
}
function setNested(object, keys, value, collect = false) {
  keys.slice(0, -1).forEach((key)=>{
    object[key] ??= {};
    object = object[key];
  });
  const key = keys.at(-1);
  if (collect) {
    const v = object[key];
    if (Array.isArray(v)) {
      v.push(value);
      return;
    }
    value = v ? [
      v,
      value
    ] : [
      value
    ];
  }
  object[key] = value;
}
function hasNested(object, keys) {
  keys = [
    ...keys
  ];
  const lastKey = keys.pop();
  if (!lastKey) return false;
  for (const key of keys){
    if (!object[key]) return false;
    object = object[key];
  }
  return Object.hasOwn(object, lastKey);
}
function aliasIsBoolean(aliasMap, booleanSet, key) {
  const set = aliasMap.get(key);
  if (set === undefined) return false;
  for (const alias of set)if (booleanSet.has(alias)) return true;
  return false;
}
function isBooleanString(value) {
  return value === "true" || value === "false";
}
function parseBooleanString(value) {
  return value !== "false";
}
const FLAG_REGEXP = /^(?:-(?:(?<doubleDash>-)(?<negated>no-)?)?)(?<key>.+?)(?:=(?<value>.+?))?$/s;
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
 * automatically and the return type of the `parseArgs` method will have an index
 * signature with `any` as value (`{ [x: string]: any }`).
 *
 * If the `string`, `boolean` or `collect` option is set, the return value of
 * the `parseArgs` method will be fully typed and the index signature of the return
 * type will change to `{ [x: string]: unknown }`.
 *
 * Any arguments after `'--'` will not be parsed and will end up in `parsedArgs._`.
 *
 * Numeric-looking arguments will be returned as numbers unless `options.string`
 * or `options.boolean` is set for that argument name.
 *
 * @param args An array of command line arguments.
 *
 * @typeParam TArgs Type of result.
 * @typeParam TDoubleDash Used by `TArgs` for the result.
 * @typeParam TBooleans Used by `TArgs` for the result.
 * @typeParam TStrings Used by `TArgs` for the result.
 * @typeParam TCollectable Used by `TArgs` for the result.
 * @typeParam TNegatable Used by `TArgs` for the result.
 * @typeParam TDefaults Used by `TArgs` for the result.
 * @typeParam TAliases Used by `TArgs` for the result.
 * @typeParam TAliasArgNames Used by `TArgs` for the result.
 * @typeParam TAliasNames Used by `TArgs` for the result.
 *
 * @return The parsed arguments.
 *
 * @example Usage
 * ```ts
 * import { parseArgs } from "@std/cli/parse-args";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * // For proper use, one should use `parseArgs(Deno.args)`
 * assertEquals(parseArgs(["--foo", "--bar=baz", "./quux.txt"]), {
 *   foo: true,
 *   bar: "baz",
 *   _: ["./quux.txt"],
 * });
 * ```
 */ export function parseArgs(args, { "--": doubleDash = false, alias = {}, boolean = false, default: defaults = {}, stopEarly = false, string = [], collect = [], negatable = [], unknown: unknownFn = (i)=>i } = {}) {
  const aliasMap = new Map();
  const booleanSet = new Set();
  const stringSet = new Set();
  const collectSet = new Set();
  const negatableSet = new Set();
  let allBools = false;
  if (alias) {
    for(const key in alias){
      const val = alias[key];
      if (val === undefined) throw new TypeError("Alias value must be defined");
      const aliases = Array.isArray(val) ? val : [
        val
      ];
      aliasMap.set(key, new Set(aliases));
      aliases.forEach((alias)=>aliasMap.set(alias, new Set([
          key,
          ...aliases.filter((it)=>it !== alias)
        ])));
    }
  }
  if (boolean) {
    if (typeof boolean === "boolean") {
      allBools = boolean;
    } else {
      const booleanArgs = Array.isArray(boolean) ? boolean : [
        boolean
      ];
      for (const key of booleanArgs.filter(Boolean)){
        booleanSet.add(key);
        aliasMap.get(key)?.forEach((al)=>{
          booleanSet.add(al);
        });
      }
    }
  }
  if (string) {
    const stringArgs = Array.isArray(string) ? string : [
      string
    ];
    for (const key of stringArgs.filter(Boolean)){
      stringSet.add(key);
      aliasMap.get(key)?.forEach((al)=>stringSet.add(al));
    }
  }
  if (collect) {
    const collectArgs = Array.isArray(collect) ? collect : [
      collect
    ];
    for (const key of collectArgs.filter(Boolean)){
      collectSet.add(key);
      aliasMap.get(key)?.forEach((al)=>collectSet.add(al));
    }
  }
  if (negatable) {
    const negatableArgs = Array.isArray(negatable) ? negatable : [
      negatable
    ];
    for (const key of negatableArgs.filter(Boolean)){
      negatableSet.add(key);
      aliasMap.get(key)?.forEach((alias)=>negatableSet.add(alias));
    }
  }
  const argv = {
    _: []
  };
  function setArgument(key, value, arg, collect) {
    if (!booleanSet.has(key) && !stringSet.has(key) && !aliasMap.has(key) && !(allBools && /^--[^=]+$/.test(arg)) && unknownFn?.(arg, key, value) === false) {
      return;
    }
    if (typeof value === "string" && !stringSet.has(key)) {
      value = isNumber(value) ? Number(value) : value;
    }
    const collectable = collect && collectSet.has(key);
    setNested(argv, key.split("."), value, collectable);
    aliasMap.get(key)?.forEach((key)=>{
      setNested(argv, key.split("."), value, collectable);
    });
  }
  let notFlags = [];
  // all args after "--" are not parsed
  const index = args.indexOf("--");
  if (index !== -1) {
    notFlags = args.slice(index + 1);
    args = args.slice(0, index);
  }
  for(let i = 0; i < args.length; i++){
    const arg = args[i];
    const groups = arg.match(FLAG_REGEXP)?.groups;
    if (groups) {
      const { doubleDash, negated } = groups;
      let key = groups.key;
      let value = groups.value;
      if (doubleDash) {
        if (value) {
          if (booleanSet.has(key)) value = parseBooleanString(value);
          setArgument(key, value, arg, true);
          continue;
        }
        if (negated) {
          if (negatableSet.has(key)) {
            setArgument(key, false, arg, false);
            continue;
          }
          key = `no-${key}`;
        }
        const next = args[i + 1];
        if (!booleanSet.has(key) && !allBools && next && !/^-/.test(next) && (aliasMap.get(key) ? !aliasIsBoolean(aliasMap, booleanSet, key) : true)) {
          value = next;
          i++;
          setArgument(key, value, arg, true);
          continue;
        }
        if (next && isBooleanString(next)) {
          value = parseBooleanString(next);
          i++;
          setArgument(key, value, arg, true);
          continue;
        }
        value = stringSet.has(key) ? "" : true;
        setArgument(key, value, arg, true);
        continue;
      }
      const letters = arg.slice(1, -1).split("");
      let broken = false;
      for (const [j, letter] of letters.entries()){
        const next = arg.slice(j + 2);
        if (next === "-") {
          setArgument(letter, next, arg, true);
          continue;
        }
        if (/[A-Za-z]/.test(letter) && /=/.test(next)) {
          setArgument(letter, next.split(/=(.+)/)[1], arg, true);
          broken = true;
          break;
        }
        if (/[A-Za-z]/.test(letter) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
          setArgument(letter, next, arg, true);
          broken = true;
          break;
        }
        if (letters[j + 1] && letters[j + 1].match(/\W/)) {
          setArgument(letter, arg.slice(j + 2), arg, true);
          broken = true;
          break;
        }
        setArgument(letter, stringSet.has(letter) ? "" : true, arg, true);
      }
      key = arg.slice(-1);
      if (!broken && key !== "-") {
        const nextArg = args[i + 1];
        if (nextArg && !/^(-|--)[^-]/.test(nextArg) && !booleanSet.has(key) && (aliasMap.get(key) ? !aliasIsBoolean(aliasMap, booleanSet, key) : true)) {
          setArgument(key, nextArg, arg, true);
          i++;
        } else if (nextArg && isBooleanString(nextArg)) {
          const value = parseBooleanString(nextArg);
          setArgument(key, value, arg, true);
          i++;
        } else {
          setArgument(key, stringSet.has(key) ? "" : true, arg, true);
        }
      }
      continue;
    }
    if (unknownFn?.(arg) !== false) {
      argv._.push(stringSet.has("_") || !isNumber(arg) ? arg : Number(arg));
    }
    if (stopEarly) {
      argv._.push(...args.slice(i + 1));
      break;
    }
  }
  for (const [key, value] of Object.entries(defaults)){
    const keys = key.split(".");
    if (!hasNested(argv, keys)) {
      setNested(argv, keys, value);
      aliasMap.get(key)?.forEach((key)=>setNested(argv, key.split("."), value));
    }
  }
  for (const key of booleanSet.keys()){
    const keys = key.split(".");
    if (!hasNested(argv, keys)) {
      const value = collectSet.has(key) ? [] : false;
      setNested(argv, keys, value);
    }
  }
  for (const key of stringSet.keys()){
    const keys = key.split(".");
    if (!hasNested(argv, keys) && collectSet.has(key)) {
      setNested(argv, keys, []);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY2xpLzAuMjI0LjcvcGFyc2VfYXJncy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIENvbW1hbmQgbGluZSBhcmd1bWVudHMgcGFyc2VyIGJhc2VkIG9uXG4gKiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL21pbmltaXN0anMvbWluaW1pc3QgfCBtaW5pbWlzdH0uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZUFyZ3MgfSBmcm9tIFwiQHN0ZC9jbGkvcGFyc2UtYXJnc1wiO1xuICpcbiAqIGNvbnNvbGUuZGlyKHBhcnNlQXJncyhEZW5vLmFyZ3MpKTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG4vKiogQ29tYmluZXMgcmVjdXJzaXZlbHkgYWxsIGludGVyc2VjdGlvbiB0eXBlcyBhbmQgcmV0dXJucyBhIG5ldyBzaW5nbGUgdHlwZS5cbiAqIEBpbnRlcm5hbFxuICovXG50eXBlIElkPFRSZWNvcmQ+ID0gVFJlY29yZCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gID8gVFJlY29yZCBleHRlbmRzIGluZmVyIEluZmVycmVkUmVjb3JkXG4gICAgPyB7IFtLZXkgaW4ga2V5b2YgSW5mZXJyZWRSZWNvcmRdOiBJZDxJbmZlcnJlZFJlY29yZFtLZXldPiB9XG4gIDogbmV2ZXJcbiAgOiBUUmVjb3JkO1xuXG4vKiogQ29udmVydHMgYSB1bmlvbiB0eXBlIGBBIHwgQiB8IENgIGludG8gYW4gaW50ZXJzZWN0aW9uIHR5cGUgYEEgJiBCICYgQ2AuXG4gKiBAaW50ZXJuYWxcbiAqL1xudHlwZSBVbmlvblRvSW50ZXJzZWN0aW9uPFRWYWx1ZT4gPVxuICAoVFZhbHVlIGV4dGVuZHMgdW5rbm93biA/IChhcmdzOiBUVmFsdWUpID0+IHVua25vd24gOiBuZXZlcikgZXh0ZW5kc1xuICAgIChhcmdzOiBpbmZlciBSKSA9PiB1bmtub3duID8gUiBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+ID8gUiA6IG5ldmVyXG4gICAgOiBuZXZlcjtcblxuLyoqIEBpbnRlcm5hbCAqL1xudHlwZSBCb29sZWFuVHlwZSA9IGJvb2xlYW4gfCBzdHJpbmcgfCB1bmRlZmluZWQ7XG4vKiogQGludGVybmFsICovXG50eXBlIFN0cmluZ1R5cGUgPSBzdHJpbmcgfCB1bmRlZmluZWQ7XG4vKiogQGludGVybmFsICovXG50eXBlIEFyZ1R5cGUgPSBTdHJpbmdUeXBlIHwgQm9vbGVhblR5cGU7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbnR5cGUgQ29sbGVjdGFibGUgPSBzdHJpbmcgfCB1bmRlZmluZWQ7XG4vKiogQGludGVybmFsICovXG50eXBlIE5lZ2F0YWJsZSA9IHN0cmluZyB8IHVuZGVmaW5lZDtcblxudHlwZSBVc2VUeXBlczxcbiAgVEJvb2xlYW5zIGV4dGVuZHMgQm9vbGVhblR5cGUsXG4gIFRTdHJpbmdzIGV4dGVuZHMgU3RyaW5nVHlwZSxcbiAgVENvbGxlY3RhYmxlIGV4dGVuZHMgQ29sbGVjdGFibGUsXG4+ID0gdW5kZWZpbmVkIGV4dGVuZHMgKFxuICAmIChmYWxzZSBleHRlbmRzIFRCb29sZWFucyA/IHVuZGVmaW5lZCA6IFRCb29sZWFucylcbiAgJiBUQ29sbGVjdGFibGVcbiAgJiBUU3RyaW5nc1xuKSA/IGZhbHNlXG4gIDogdHJ1ZTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgcmVjb3JkIHdpdGggYWxsIGF2YWlsYWJsZSBmbGFncyB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIHR5cGUgYW5kXG4gKiBkZWZhdWx0IHR5cGUuXG4gKiBAaW50ZXJuYWxcbiAqL1xudHlwZSBWYWx1ZXM8XG4gIFRCb29sZWFucyBleHRlbmRzIEJvb2xlYW5UeXBlLFxuICBUU3RyaW5ncyBleHRlbmRzIFN0cmluZ1R5cGUsXG4gIFRDb2xsZWN0YWJsZSBleHRlbmRzIENvbGxlY3RhYmxlLFxuICBUTmVnYXRhYmxlIGV4dGVuZHMgTmVnYXRhYmxlLFxuICBURGVmYXVsdCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkLFxuICBUQWxpYXNlcyBleHRlbmRzIEFsaWFzZXMgfCB1bmRlZmluZWQsXG4+ID0gVXNlVHlwZXM8VEJvb2xlYW5zLCBUU3RyaW5ncywgVENvbGxlY3RhYmxlPiBleHRlbmRzIHRydWUgP1xuICAgICYgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgICAmIEFkZEFsaWFzZXM8XG4gICAgICBTcHJlYWREZWZhdWx0czxcbiAgICAgICAgJiBDb2xsZWN0VmFsdWVzPFRTdHJpbmdzLCBzdHJpbmcsIFRDb2xsZWN0YWJsZSwgVE5lZ2F0YWJsZT5cbiAgICAgICAgJiBSZWN1cnNpdmVSZXF1aXJlZDxDb2xsZWN0VmFsdWVzPFRCb29sZWFucywgYm9vbGVhbiwgVENvbGxlY3RhYmxlPj5cbiAgICAgICAgJiBDb2xsZWN0VW5rbm93blZhbHVlczxcbiAgICAgICAgICBUQm9vbGVhbnMsXG4gICAgICAgICAgVFN0cmluZ3MsXG4gICAgICAgICAgVENvbGxlY3RhYmxlLFxuICAgICAgICAgIFROZWdhdGFibGVcbiAgICAgICAgPixcbiAgICAgICAgRGVkb3RSZWNvcmQ8VERlZmF1bHQ+XG4gICAgICA+LFxuICAgICAgVEFsaWFzZXNcbiAgICA+XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIDogUmVjb3JkPHN0cmluZywgYW55PjtcblxuLyoqIEBpbnRlcm5hbCAqL1xudHlwZSBBbGlhc2VzPFRBcmdOYW1lcyA9IHN0cmluZywgVEFsaWFzTmFtZXMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gUGFydGlhbDxcbiAgUmVjb3JkPEV4dHJhY3Q8VEFyZ05hbWVzLCBzdHJpbmc+LCBUQWxpYXNOYW1lcyB8IFJlYWRvbmx5QXJyYXk8VEFsaWFzTmFtZXM+PlxuPjtcblxudHlwZSBBZGRBbGlhc2VzPFxuICBUQXJncyxcbiAgVEFsaWFzZXMgZXh0ZW5kcyBBbGlhc2VzIHwgdW5kZWZpbmVkLFxuPiA9IHtcbiAgW1RBcmdOYW1lIGluIGtleW9mIFRBcmdzIGFzIEFsaWFzTmFtZXM8VEFyZ05hbWUsIFRBbGlhc2VzPl06IFRBcmdzW1RBcmdOYW1lXTtcbn07XG5cbnR5cGUgQWxpYXNOYW1lczxcbiAgVEFyZ05hbWUsXG4gIFRBbGlhc2VzIGV4dGVuZHMgQWxpYXNlcyB8IHVuZGVmaW5lZCxcbj4gPSBUQXJnTmFtZSBleHRlbmRzIGtleW9mIFRBbGlhc2VzXG4gID8gc3RyaW5nIGV4dGVuZHMgVEFsaWFzZXNbVEFyZ05hbWVdID8gVEFyZ05hbWVcbiAgOiBUQWxpYXNlc1tUQXJnTmFtZV0gZXh0ZW5kcyBzdHJpbmcgPyBUQXJnTmFtZSB8IFRBbGlhc2VzW1RBcmdOYW1lXVxuICA6IFRBbGlhc2VzW1RBcmdOYW1lXSBleHRlbmRzIEFycmF5PHN0cmluZz5cbiAgICA/IFRBcmdOYW1lIHwgVEFsaWFzZXNbVEFyZ05hbWVdW251bWJlcl1cbiAgOiBUQXJnTmFtZVxuICA6IFRBcmdOYW1lO1xuXG4vKipcbiAqIFNwcmVhZHMgYWxsIGRlZmF1bHQgdmFsdWVzIG9mIFJlY29yZCBgVERlZmF1bHRzYCBpbnRvIFJlY29yZCBgVEFyZ3NgXG4gKiBhbmQgbWFrZXMgZGVmYXVsdCB2YWx1ZXMgcmVxdWlyZWQuXG4gKlxuICogKipFeGFtcGxlOioqXG4gKiBgU3ByZWFkVmFsdWVzPHsgZm9vPzogYm9vbGVhbiwgYmFyPzogbnVtYmVyIH0sIHsgZm9vOiBudW1iZXIgfT5gXG4gKlxuICogKipSZXN1bHQ6KiogYHsgZm9vOiBib29sZWFuIHwgbnVtYmVyLCBiYXI/OiBudW1iZXIgfWBcbiAqL1xudHlwZSBTcHJlYWREZWZhdWx0czxUQXJncywgVERlZmF1bHRzPiA9IFREZWZhdWx0cyBleHRlbmRzIHVuZGVmaW5lZCA/IFRBcmdzXG4gIDogVEFyZ3MgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA/XG4gICAgICAmIE9taXQ8VEFyZ3MsIGtleW9mIFREZWZhdWx0cz5cbiAgICAgICYge1xuICAgICAgICBbRGVmYXVsdCBpbiBrZXlvZiBURGVmYXVsdHNdOiBEZWZhdWx0IGV4dGVuZHMga2V5b2YgVEFyZ3NcbiAgICAgICAgICA/IChUQXJnc1tEZWZhdWx0XSAmIFREZWZhdWx0c1tEZWZhdWx0XSB8IFREZWZhdWx0c1tEZWZhdWx0XSkgZXh0ZW5kc1xuICAgICAgICAgICAgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgICAgICAgICAgID8gTm9uTnVsbGFibGU8U3ByZWFkRGVmYXVsdHM8VEFyZ3NbRGVmYXVsdF0sIFREZWZhdWx0c1tEZWZhdWx0XT4+XG4gICAgICAgICAgOiBURGVmYXVsdHNbRGVmYXVsdF0gfCBOb25OdWxsYWJsZTxUQXJnc1tEZWZhdWx0XT5cbiAgICAgICAgICA6IHVua25vd247XG4gICAgICB9XG4gIDogbmV2ZXI7XG5cbi8qKlxuICogRGVmaW5lcyB0aGUgUmVjb3JkIGZvciB0aGUgYGRlZmF1bHRgIG9wdGlvbiB0byBhZGRcbiAqIGF1dG8tc3VnZ2VzdGlvbiBzdXBwb3J0IGZvciBJREUncy5cbiAqIEBpbnRlcm5hbFxuICovXG50eXBlIERlZmF1bHRzPFRCb29sZWFucyBleHRlbmRzIEJvb2xlYW5UeXBlLCBUU3RyaW5ncyBleHRlbmRzIFN0cmluZ1R5cGU+ID0gSWQ8XG4gIFVuaW9uVG9JbnRlcnNlY3Rpb248XG4gICAgJiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICAgIC8vIERlZG90dGVkIGF1dG8gc3VnZ2VzdGlvbnM6IHsgZm9vOiB7IGJhcjogdW5rbm93biB9IH1cbiAgICAmIE1hcFR5cGVzPFRTdHJpbmdzLCB1bmtub3duPlxuICAgICYgTWFwVHlwZXM8VEJvb2xlYW5zLCB1bmtub3duPlxuICAgIC8vIEZsYXQgYXV0byBzdWdnZXN0aW9uczogeyBcImZvby5iYXJcIjogdW5rbm93biB9XG4gICAgJiBNYXBEZWZhdWx0czxUQm9vbGVhbnM+XG4gICAgJiBNYXBEZWZhdWx0czxUU3RyaW5ncz5cbiAgPlxuPjtcblxudHlwZSBNYXBEZWZhdWx0czxUQXJnTmFtZXMgZXh0ZW5kcyBBcmdUeXBlPiA9IFBhcnRpYWw8XG4gIFJlY29yZDxUQXJnTmFtZXMgZXh0ZW5kcyBzdHJpbmcgPyBUQXJnTmFtZXMgOiBzdHJpbmcsIHVua25vd24+XG4+O1xuXG50eXBlIFJlY3Vyc2l2ZVJlcXVpcmVkPFRSZWNvcmQ+ID0gVFJlY29yZCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+ID8ge1xuICAgIFtLZXkgaW4ga2V5b2YgVFJlY29yZF0tPzogUmVjdXJzaXZlUmVxdWlyZWQ8VFJlY29yZFtLZXldPjtcbiAgfVxuICA6IFRSZWNvcmQ7XG5cbi8qKiBTYW1lIGFzIGBNYXBUeXBlc2AgYnV0IGFsc28gc3VwcG9ydHMgY29sbGVjdGFibGUgb3B0aW9ucy4gKi9cbnR5cGUgQ29sbGVjdFZhbHVlczxcbiAgVEFyZ05hbWVzIGV4dGVuZHMgQXJnVHlwZSxcbiAgVFR5cGUsXG4gIFRDb2xsZWN0YWJsZSBleHRlbmRzIENvbGxlY3RhYmxlLFxuICBUTmVnYXRhYmxlIGV4dGVuZHMgTmVnYXRhYmxlID0gdW5kZWZpbmVkLFxuPiA9IFVuaW9uVG9JbnRlcnNlY3Rpb248XG4gIEV4dHJhY3Q8VEFyZ05hbWVzLCBUQ29sbGVjdGFibGU+IGV4dGVuZHMgc3RyaW5nID9cbiAgICAgICYgKEV4Y2x1ZGU8VEFyZ05hbWVzLCBUQ29sbGVjdGFibGU+IGV4dGVuZHMgbmV2ZXIgPyBSZWNvcmQ8bmV2ZXIsIG5ldmVyPlxuICAgICAgICA6IE1hcFR5cGVzPEV4Y2x1ZGU8VEFyZ05hbWVzLCBUQ29sbGVjdGFibGU+LCBUVHlwZSwgVE5lZ2F0YWJsZT4pXG4gICAgICAmIChFeHRyYWN0PFRBcmdOYW1lcywgVENvbGxlY3RhYmxlPiBleHRlbmRzIG5ldmVyID8gUmVjb3JkPG5ldmVyLCBuZXZlcj5cbiAgICAgICAgOiBSZWN1cnNpdmVSZXF1aXJlZDxcbiAgICAgICAgICBNYXBUeXBlczxFeHRyYWN0PFRBcmdOYW1lcywgVENvbGxlY3RhYmxlPiwgQXJyYXk8VFR5cGU+LCBUTmVnYXRhYmxlPlxuICAgICAgICA+KVxuICAgIDogTWFwVHlwZXM8VEFyZ05hbWVzLCBUVHlwZSwgVE5lZ2F0YWJsZT5cbj47XG5cbi8qKiBTYW1lIGFzIGBSZWNvcmRgIGJ1dCBhbHNvIHN1cHBvcnRzIGRvdHRlZCBhbmQgbmVnYXRhYmxlIG9wdGlvbnMuICovXG50eXBlIE1hcFR5cGVzPFxuICBUQXJnTmFtZXMgZXh0ZW5kcyBBcmdUeXBlLFxuICBUVHlwZSxcbiAgVE5lZ2F0YWJsZSBleHRlbmRzIE5lZ2F0YWJsZSA9IHVuZGVmaW5lZCxcbj4gPSB1bmRlZmluZWQgZXh0ZW5kcyBUQXJnTmFtZXMgPyBSZWNvcmQ8bmV2ZXIsIG5ldmVyPlxuICA6IFRBcmdOYW1lcyBleHRlbmRzIGAke2luZmVyIE5hbWV9LiR7aW5mZXIgUmVzdH1gID8ge1xuICAgICAgW0tleSBpbiBOYW1lXT86IE1hcFR5cGVzPFxuICAgICAgICBSZXN0LFxuICAgICAgICBUVHlwZSxcbiAgICAgICAgVE5lZ2F0YWJsZSBleHRlbmRzIGAke05hbWV9LiR7aW5mZXIgTmVnYXRlfWAgPyBOZWdhdGUgOiB1bmRlZmluZWRcbiAgICAgID47XG4gICAgfVxuICA6IFRBcmdOYW1lcyBleHRlbmRzIHN0cmluZyA/IFBhcnRpYWw8XG4gICAgICBSZWNvcmQ8VEFyZ05hbWVzLCBUTmVnYXRhYmxlIGV4dGVuZHMgVEFyZ05hbWVzID8gVFR5cGUgfCBmYWxzZSA6IFRUeXBlPlxuICAgID5cbiAgOiBSZWNvcmQ8bmV2ZXIsIG5ldmVyPjtcblxudHlwZSBDb2xsZWN0VW5rbm93blZhbHVlczxcbiAgVEJvb2xlYW5zIGV4dGVuZHMgQm9vbGVhblR5cGUsXG4gIFRTdHJpbmdzIGV4dGVuZHMgU3RyaW5nVHlwZSxcbiAgVENvbGxlY3RhYmxlIGV4dGVuZHMgQ29sbGVjdGFibGUsXG4gIFROZWdhdGFibGUgZXh0ZW5kcyBOZWdhdGFibGUsXG4+ID0gVW5pb25Ub0ludGVyc2VjdGlvbjxcbiAgVENvbGxlY3RhYmxlIGV4dGVuZHMgVEJvb2xlYW5zICYgVFN0cmluZ3MgPyBSZWNvcmQ8bmV2ZXIsIG5ldmVyPlxuICAgIDogRGVkb3RSZWNvcmQ8XG4gICAgICAvLyBVbmtub3duIGNvbGxlY3RhYmxlICYgbm9uLW5lZ2F0YWJsZSBhcmdzLlxuICAgICAgJiBSZWNvcmQ8XG4gICAgICAgIEV4Y2x1ZGU8XG4gICAgICAgICAgRXh0cmFjdDxFeGNsdWRlPFRDb2xsZWN0YWJsZSwgVE5lZ2F0YWJsZT4sIHN0cmluZz4sXG4gICAgICAgICAgRXh0cmFjdDxUU3RyaW5ncyB8IFRCb29sZWFucywgc3RyaW5nPlxuICAgICAgICA+LFxuICAgICAgICBBcnJheTx1bmtub3duPlxuICAgICAgPlxuICAgICAgLy8gVW5rbm93biBjb2xsZWN0YWJsZSAmIG5lZ2F0YWJsZSBhcmdzLlxuICAgICAgJiBSZWNvcmQ8XG4gICAgICAgIEV4Y2x1ZGU8XG4gICAgICAgICAgRXh0cmFjdDxFeHRyYWN0PFRDb2xsZWN0YWJsZSwgVE5lZ2F0YWJsZT4sIHN0cmluZz4sXG4gICAgICAgICAgRXh0cmFjdDxUU3RyaW5ncyB8IFRCb29sZWFucywgc3RyaW5nPlxuICAgICAgICA+LFxuICAgICAgICBBcnJheTx1bmtub3duPiB8IGZhbHNlXG4gICAgICA+XG4gICAgPlxuPjtcblxuLyoqIENvbnZlcnRzIGB7IFwiZm9vLmJhci5iYXpcIjogdW5rbm93biB9YCBpbnRvIGB7IGZvbzogeyBiYXI6IHsgYmF6OiB1bmtub3duIH0gfSB9YC4gKi9cbnR5cGUgRGVkb3RSZWNvcmQ8VFJlY29yZD4gPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiBleHRlbmRzIFRSZWNvcmQgPyBUUmVjb3JkXG4gIDogVFJlY29yZCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+ID8gVW5pb25Ub0ludGVyc2VjdGlvbjxcbiAgICAgIFZhbHVlT2Y8XG4gICAgICAgIHtcbiAgICAgICAgICBbS2V5IGluIGtleW9mIFRSZWNvcmRdOiBLZXkgZXh0ZW5kcyBzdHJpbmcgPyBEZWRvdDxLZXksIFRSZWNvcmRbS2V5XT5cbiAgICAgICAgICAgIDogbmV2ZXI7XG4gICAgICAgIH1cbiAgICAgID5cbiAgICA+XG4gIDogVFJlY29yZDtcblxudHlwZSBEZWRvdDxUS2V5IGV4dGVuZHMgc3RyaW5nLCBUVmFsdWU+ID0gVEtleSBleHRlbmRzXG4gIGAke2luZmVyIE5hbWV9LiR7aW5mZXIgUmVzdH1gID8geyBbS2V5IGluIE5hbWVdOiBEZWRvdDxSZXN0LCBUVmFsdWU+IH1cbiAgOiB7IFtLZXkgaW4gVEtleV06IFRWYWx1ZSB9O1xuXG50eXBlIFZhbHVlT2Y8VFZhbHVlPiA9IFRWYWx1ZVtrZXlvZiBUVmFsdWVdO1xuXG4vKiogVGhlIHZhbHVlIHJldHVybmVkIGZyb20gYHBhcnNlQXJnc2AuICovXG5leHBvcnQgdHlwZSBBcmdzPFxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICBUQXJncyBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0gUmVjb3JkPHN0cmluZywgYW55PixcbiAgVERvdWJsZURhc2ggZXh0ZW5kcyBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkLFxuPiA9IElkPFxuICAmIFRBcmdzXG4gICYge1xuICAgIC8qKiBDb250YWlucyBhbGwgdGhlIGFyZ3VtZW50cyB0aGF0IGRpZG4ndCBoYXZlIGFuIG9wdGlvbiBhc3NvY2lhdGVkIHdpdGhcbiAgICAgKiB0aGVtLiAqL1xuICAgIF86IEFycmF5PHN0cmluZyB8IG51bWJlcj47XG4gIH1cbiAgJiAoYm9vbGVhbiBleHRlbmRzIFREb3VibGVEYXNoID8gRG91YmxlRGFzaFxuICAgIDogdHJ1ZSBleHRlbmRzIFREb3VibGVEYXNoID8gUmVxdWlyZWQ8RG91YmxlRGFzaD5cbiAgICA6IFJlY29yZDxuZXZlciwgbmV2ZXI+KVxuPjtcblxuLyoqIEBpbnRlcm5hbCAqL1xudHlwZSBEb3VibGVEYXNoID0ge1xuICAvKiogQ29udGFpbnMgYWxsIHRoZSBhcmd1bWVudHMgdGhhdCBhcHBlYXIgYWZ0ZXIgdGhlIGRvdWJsZSBkYXNoOiBcIi0tXCIuICovXG4gIFwiLS1cIj86IEFycmF5PHN0cmluZz47XG59O1xuXG4vKiogVGhlIG9wdGlvbnMgZm9yIHRoZSBgcGFyc2VBcmdzYCBjYWxsLiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJzZU9wdGlvbnM8XG4gIFRCb29sZWFucyBleHRlbmRzIEJvb2xlYW5UeXBlID0gQm9vbGVhblR5cGUsXG4gIFRTdHJpbmdzIGV4dGVuZHMgU3RyaW5nVHlwZSA9IFN0cmluZ1R5cGUsXG4gIFRDb2xsZWN0YWJsZSBleHRlbmRzIENvbGxlY3RhYmxlID0gQ29sbGVjdGFibGUsXG4gIFROZWdhdGFibGUgZXh0ZW5kcyBOZWdhdGFibGUgPSBOZWdhdGFibGUsXG4gIFREZWZhdWx0IGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQgPVxuICAgIHwgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgICB8IHVuZGVmaW5lZCxcbiAgVEFsaWFzZXMgZXh0ZW5kcyBBbGlhc2VzIHwgdW5kZWZpbmVkID0gQWxpYXNlcyB8IHVuZGVmaW5lZCxcbiAgVERvdWJsZURhc2ggZXh0ZW5kcyBib29sZWFuIHwgdW5kZWZpbmVkID0gYm9vbGVhbiB8IHVuZGVmaW5lZCxcbj4ge1xuICAvKipcbiAgICogV2hlbiBgdHJ1ZWAsIHBvcHVsYXRlIHRoZSByZXN1bHQgYF9gIHdpdGggZXZlcnl0aGluZyBiZWZvcmUgdGhlIGAtLWAgYW5kXG4gICAqIHRoZSByZXN1bHQgYFsnLS0nXWAgd2l0aCBldmVyeXRoaW5nIGFmdGVyIHRoZSBgLS1gLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqXG4gICAqICBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiAvLyAkIGRlbm8gcnVuIGV4YW1wbGUudHMgLS0gYSBhcmcxXG4gICAqIGltcG9ydCB7IHBhcnNlQXJncyB9IGZyb20gXCJAc3RkL2NsaS9wYXJzZS1hcmdzXCI7XG4gICAqIGNvbnNvbGUuZGlyKHBhcnNlQXJncyhEZW5vLmFyZ3MsIHsgXCItLVwiOiBmYWxzZSB9KSk7XG4gICAqIC8vIG91dHB1dDogeyBfOiBbIFwiYVwiLCBcImFyZzFcIiBdIH1cbiAgICogY29uc29sZS5kaXIocGFyc2VBcmdzKERlbm8uYXJncywgeyBcIi0tXCI6IHRydWUgfSkpO1xuICAgKiAvLyBvdXRwdXQ6IHsgXzogW10sIC0tOiBbIFwiYVwiLCBcImFyZzFcIiBdIH1cbiAgICogYGBgXG4gICAqL1xuICBcIi0tXCI/OiBURG91YmxlRGFzaDtcblxuICAvKipcbiAgICogQW4gb2JqZWN0IG1hcHBpbmcgc3RyaW5nIG5hbWVzIHRvIHN0cmluZ3Mgb3IgYXJyYXlzIG9mIHN0cmluZyBhcmd1bWVudFxuICAgKiBuYW1lcyB0byB1c2UgYXMgYWxpYXNlcy5cbiAgICovXG4gIGFsaWFzPzogVEFsaWFzZXM7XG5cbiAgLyoqXG4gICAqIEEgYm9vbGVhbiwgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MgdG8gYWx3YXlzIHRyZWF0IGFzIGJvb2xlYW5zLiBJZlxuICAgKiBgdHJ1ZWAgd2lsbCB0cmVhdCBhbGwgZG91YmxlIGh5cGhlbmF0ZWQgYXJndW1lbnRzIHdpdGhvdXQgZXF1YWwgc2lnbnMgYXNcbiAgICogYGJvb2xlYW5gIChlLmcuIGFmZmVjdHMgYC0tZm9vYCwgbm90IGAtZmAgb3IgYC0tZm9vPWJhcmApLlxuICAgKiAgQWxsIGBib29sZWFuYCBhcmd1bWVudHMgd2lsbCBiZSBzZXQgdG8gYGZhbHNlYCBieSBkZWZhdWx0LlxuICAgKi9cbiAgYm9vbGVhbj86IFRCb29sZWFucyB8IFJlYWRvbmx5QXJyYXk8RXh0cmFjdDxUQm9vbGVhbnMsIHN0cmluZz4+O1xuXG4gIC8qKiBBbiBvYmplY3QgbWFwcGluZyBzdHJpbmcgYXJndW1lbnQgbmFtZXMgdG8gZGVmYXVsdCB2YWx1ZXMuICovXG4gIGRlZmF1bHQ/OiBURGVmYXVsdCAmIERlZmF1bHRzPFRCb29sZWFucywgVFN0cmluZ3M+O1xuXG4gIC8qKlxuICAgKiBXaGVuIGB0cnVlYCwgcG9wdWxhdGUgdGhlIHJlc3VsdCBgX2Agd2l0aCBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdFxuICAgKiBub24tb3B0aW9uLlxuICAgKi9cbiAgc3RvcEVhcmx5PzogYm9vbGVhbjtcblxuICAvKiogQSBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncyBhcmd1bWVudCBuYW1lcyB0byBhbHdheXMgdHJlYXQgYXMgc3RyaW5ncy4gKi9cbiAgc3RyaW5nPzogVFN0cmluZ3MgfCBSZWFkb25seUFycmF5PEV4dHJhY3Q8VFN0cmluZ3MsIHN0cmluZz4+O1xuXG4gIC8qKlxuICAgKiBBIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzIGFyZ3VtZW50IG5hbWVzIHRvIGFsd2F5cyB0cmVhdCBhcyBhcnJheXMuXG4gICAqIENvbGxlY3RhYmxlIG9wdGlvbnMgY2FuIGJlIHVzZWQgbXVsdGlwbGUgdGltZXMuIEFsbCB2YWx1ZXMgd2lsbCBiZVxuICAgKiBjb2xsZWN0ZWQgaW50byBvbmUgYXJyYXkuIElmIGEgbm9uLWNvbGxlY3RhYmxlIG9wdGlvbiBpcyB1c2VkIG11bHRpcGxlXG4gICAqIHRpbWVzLCB0aGUgbGFzdCB2YWx1ZSBpcyB1c2VkLlxuICAgKiBBbGwgQ29sbGVjdGFibGUgYXJndW1lbnRzIHdpbGwgYmUgc2V0IHRvIGBbXWAgYnkgZGVmYXVsdC5cbiAgICovXG4gIGNvbGxlY3Q/OiBUQ29sbGVjdGFibGUgfCBSZWFkb25seUFycmF5PEV4dHJhY3Q8VENvbGxlY3RhYmxlLCBzdHJpbmc+PjtcblxuICAvKipcbiAgICogQSBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncyBhcmd1bWVudCBuYW1lcyB3aGljaCBjYW4gYmUgbmVnYXRlZFxuICAgKiBieSBwcmVmaXhpbmcgdGhlbSB3aXRoIGAtLW5vLWAsIGxpa2UgYC0tbm8tY29uZmlnYC5cbiAgICovXG4gIG5lZ2F0YWJsZT86IFROZWdhdGFibGUgfCBSZWFkb25seUFycmF5PEV4dHJhY3Q8VE5lZ2F0YWJsZSwgc3RyaW5nPj47XG5cbiAgLyoqXG4gICAqIEEgZnVuY3Rpb24gd2hpY2ggaXMgaW52b2tlZCB3aXRoIGEgY29tbWFuZCBsaW5lIHBhcmFtZXRlciBub3QgZGVmaW5lZCBpblxuICAgKiB0aGUgYG9wdGlvbnNgIGNvbmZpZ3VyYXRpb24gb2JqZWN0LiBJZiB0aGUgZnVuY3Rpb24gcmV0dXJucyBgZmFsc2VgLCB0aGVcbiAgICogdW5rbm93biBvcHRpb24gaXMgbm90IGFkZGVkIHRvIGBwYXJzZWRBcmdzYC5cbiAgICovXG4gIHVua25vd24/OiAoYXJnOiBzdHJpbmcsIGtleT86IHN0cmluZywgdmFsdWU/OiB1bmtub3duKSA9PiB1bmtub3duO1xufVxuXG5pbnRlcmZhY2UgTmVzdGVkTWFwcGluZyB7XG4gIFtrZXk6IHN0cmluZ106IE5lc3RlZE1hcHBpbmcgfCB1bmtub3duO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcih4OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKC9eMHhbMC05YS1mXSskL2kudGVzdChTdHJpbmcoeCkpKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIC9eWy0rXT8oPzpcXGQrKD86XFwuXFxkKik/fFxcLlxcZCspKGVbLStdP1xcZCspPyQvLnRlc3QoU3RyaW5nKHgpKTtcbn1cblxuZnVuY3Rpb24gc2V0TmVzdGVkKFxuICBvYmplY3Q6IE5lc3RlZE1hcHBpbmcsXG4gIGtleXM6IHN0cmluZ1tdLFxuICB2YWx1ZTogdW5rbm93bixcbiAgY29sbGVjdCA9IGZhbHNlLFxuKSB7XG4gIGtleXMuc2xpY2UoMCwgLTEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIG9iamVjdFtrZXldID8/PSB7fTtcbiAgICBvYmplY3QgPSBvYmplY3Rba2V5XSBhcyBOZXN0ZWRNYXBwaW5nO1xuICB9KTtcblxuICBjb25zdCBrZXkgPSBrZXlzLmF0KC0xKSE7XG5cbiAgaWYgKGNvbGxlY3QpIHtcbiAgICBjb25zdCB2ID0gb2JqZWN0W2tleV07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodikpIHtcbiAgICAgIHYucHVzaCh2YWx1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFsdWUgPSB2ID8gW3YsIHZhbHVlXSA6IFt2YWx1ZV07XG4gIH1cblxuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBoYXNOZXN0ZWQob2JqZWN0OiBOZXN0ZWRNYXBwaW5nLCBrZXlzOiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xuICBrZXlzID0gWy4uLmtleXNdO1xuICBjb25zdCBsYXN0S2V5ID0ga2V5cy5wb3AoKTtcbiAgaWYgKCFsYXN0S2V5KSByZXR1cm4gZmFsc2U7XG4gIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICBpZiAoIW9iamVjdFtrZXldKSByZXR1cm4gZmFsc2U7XG4gICAgb2JqZWN0ID0gb2JqZWN0W2tleV0gYXMgTmVzdGVkTWFwcGluZztcbiAgfVxuICByZXR1cm4gT2JqZWN0Lmhhc093bihvYmplY3QsIGxhc3RLZXkpO1xufVxuXG5mdW5jdGlvbiBhbGlhc0lzQm9vbGVhbihcbiAgYWxpYXNNYXA6IE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PixcbiAgYm9vbGVhblNldDogU2V0PHN0cmluZz4sXG4gIGtleTogc3RyaW5nLFxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHNldCA9IGFsaWFzTWFwLmdldChrZXkpO1xuICBpZiAoc2V0ID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgZm9yIChjb25zdCBhbGlhcyBvZiBzZXQpIGlmIChib29sZWFuU2V0LmhhcyhhbGlhcykpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzQm9vbGVhblN0cmluZyh2YWx1ZTogc3RyaW5nKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gXCJ0cnVlXCIgfHwgdmFsdWUgPT09IFwiZmFsc2VcIjtcbn1cblxuZnVuY3Rpb24gcGFyc2VCb29sZWFuU3RyaW5nKHZhbHVlOiB1bmtub3duKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gXCJmYWxzZVwiO1xufVxuXG5jb25zdCBGTEFHX1JFR0VYUCA9XG4gIC9eKD86LSg/Oig/PGRvdWJsZURhc2g+LSkoPzxuZWdhdGVkPm5vLSk/KT8pKD88a2V5Pi4rPykoPzo9KD88dmFsdWU+Lis/KSk/JC9zO1xuXG4vKipcbiAqIFRha2UgYSBzZXQgb2YgY29tbWFuZCBsaW5lIGFyZ3VtZW50cywgb3B0aW9uYWxseSB3aXRoIGEgc2V0IG9mIG9wdGlvbnMsIGFuZFxuICogcmV0dXJuIGFuIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGZsYWdzIGZvdW5kIGluIHRoZSBwYXNzZWQgYXJndW1lbnRzLlxuICpcbiAqIEJ5IGRlZmF1bHQsIGFueSBhcmd1bWVudHMgc3RhcnRpbmcgd2l0aCBgLWAgb3IgYC0tYCBhcmUgY29uc2lkZXJlZCBib29sZWFuXG4gKiBmbGFncy4gSWYgdGhlIGFyZ3VtZW50IG5hbWUgaXMgZm9sbG93ZWQgYnkgYW4gZXF1YWwgc2lnbiAoYD1gKSBpdCBpc1xuICogY29uc2lkZXJlZCBhIGtleS12YWx1ZSBwYWlyLiBBbnkgYXJndW1lbnRzIHdoaWNoIGNvdWxkIG5vdCBiZSBwYXJzZWQgYXJlXG4gKiBhdmFpbGFibGUgaW4gdGhlIGBfYCBwcm9wZXJ0eSBvZiB0aGUgcmV0dXJuZWQgb2JqZWN0LlxuICpcbiAqIEJ5IGRlZmF1bHQsIHRoZSBmbGFncyBtb2R1bGUgdHJpZXMgdG8gZGV0ZXJtaW5lIHRoZSB0eXBlIG9mIGFsbCBhcmd1bWVudHNcbiAqIGF1dG9tYXRpY2FsbHkgYW5kIHRoZSByZXR1cm4gdHlwZSBvZiB0aGUgYHBhcnNlQXJnc2AgbWV0aG9kIHdpbGwgaGF2ZSBhbiBpbmRleFxuICogc2lnbmF0dXJlIHdpdGggYGFueWAgYXMgdmFsdWUgKGB7IFt4OiBzdHJpbmddOiBhbnkgfWApLlxuICpcbiAqIElmIHRoZSBgc3RyaW5nYCwgYGJvb2xlYW5gIG9yIGBjb2xsZWN0YCBvcHRpb24gaXMgc2V0LCB0aGUgcmV0dXJuIHZhbHVlIG9mXG4gKiB0aGUgYHBhcnNlQXJnc2AgbWV0aG9kIHdpbGwgYmUgZnVsbHkgdHlwZWQgYW5kIHRoZSBpbmRleCBzaWduYXR1cmUgb2YgdGhlIHJldHVyblxuICogdHlwZSB3aWxsIGNoYW5nZSB0byBgeyBbeDogc3RyaW5nXTogdW5rbm93biB9YC5cbiAqXG4gKiBBbnkgYXJndW1lbnRzIGFmdGVyIGAnLS0nYCB3aWxsIG5vdCBiZSBwYXJzZWQgYW5kIHdpbGwgZW5kIHVwIGluIGBwYXJzZWRBcmdzLl9gLlxuICpcbiAqIE51bWVyaWMtbG9va2luZyBhcmd1bWVudHMgd2lsbCBiZSByZXR1cm5lZCBhcyBudW1iZXJzIHVubGVzcyBgb3B0aW9ucy5zdHJpbmdgXG4gKiBvciBgb3B0aW9ucy5ib29sZWFuYCBpcyBzZXQgZm9yIHRoYXQgYXJndW1lbnQgbmFtZS5cbiAqXG4gKiBAcGFyYW0gYXJncyBBbiBhcnJheSBvZiBjb21tYW5kIGxpbmUgYXJndW1lbnRzLlxuICpcbiAqIEB0eXBlUGFyYW0gVEFyZ3MgVHlwZSBvZiByZXN1bHQuXG4gKiBAdHlwZVBhcmFtIFREb3VibGVEYXNoIFVzZWQgYnkgYFRBcmdzYCBmb3IgdGhlIHJlc3VsdC5cbiAqIEB0eXBlUGFyYW0gVEJvb2xlYW5zIFVzZWQgYnkgYFRBcmdzYCBmb3IgdGhlIHJlc3VsdC5cbiAqIEB0eXBlUGFyYW0gVFN0cmluZ3MgVXNlZCBieSBgVEFyZ3NgIGZvciB0aGUgcmVzdWx0LlxuICogQHR5cGVQYXJhbSBUQ29sbGVjdGFibGUgVXNlZCBieSBgVEFyZ3NgIGZvciB0aGUgcmVzdWx0LlxuICogQHR5cGVQYXJhbSBUTmVnYXRhYmxlIFVzZWQgYnkgYFRBcmdzYCBmb3IgdGhlIHJlc3VsdC5cbiAqIEB0eXBlUGFyYW0gVERlZmF1bHRzIFVzZWQgYnkgYFRBcmdzYCBmb3IgdGhlIHJlc3VsdC5cbiAqIEB0eXBlUGFyYW0gVEFsaWFzZXMgVXNlZCBieSBgVEFyZ3NgIGZvciB0aGUgcmVzdWx0LlxuICogQHR5cGVQYXJhbSBUQWxpYXNBcmdOYW1lcyBVc2VkIGJ5IGBUQXJnc2AgZm9yIHRoZSByZXN1bHQuXG4gKiBAdHlwZVBhcmFtIFRBbGlhc05hbWVzIFVzZWQgYnkgYFRBcmdzYCBmb3IgdGhlIHJlc3VsdC5cbiAqXG4gKiBAcmV0dXJuIFRoZSBwYXJzZWQgYXJndW1lbnRzLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcGFyc2VBcmdzIH0gZnJvbSBcIkBzdGQvY2xpL3BhcnNlLWFyZ3NcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogLy8gRm9yIHByb3BlciB1c2UsIG9uZSBzaG91bGQgdXNlIGBwYXJzZUFyZ3MoRGVuby5hcmdzKWBcbiAqIGFzc2VydEVxdWFscyhwYXJzZUFyZ3MoW1wiLS1mb29cIiwgXCItLWJhcj1iYXpcIiwgXCIuL3F1dXgudHh0XCJdKSwge1xuICogICBmb286IHRydWUsXG4gKiAgIGJhcjogXCJiYXpcIixcbiAqICAgXzogW1wiLi9xdXV4LnR4dFwiXSxcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUFyZ3M8XG4gIFRBcmdzIGV4dGVuZHMgVmFsdWVzPFxuICAgIFRCb29sZWFucyxcbiAgICBUU3RyaW5ncyxcbiAgICBUQ29sbGVjdGFibGUsXG4gICAgVE5lZ2F0YWJsZSxcbiAgICBURGVmYXVsdHMsXG4gICAgVEFsaWFzZXNcbiAgPixcbiAgVERvdWJsZURhc2ggZXh0ZW5kcyBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkLFxuICBUQm9vbGVhbnMgZXh0ZW5kcyBCb29sZWFuVHlwZSA9IHVuZGVmaW5lZCxcbiAgVFN0cmluZ3MgZXh0ZW5kcyBTdHJpbmdUeXBlID0gdW5kZWZpbmVkLFxuICBUQ29sbGVjdGFibGUgZXh0ZW5kcyBDb2xsZWN0YWJsZSA9IHVuZGVmaW5lZCxcbiAgVE5lZ2F0YWJsZSBleHRlbmRzIE5lZ2F0YWJsZSA9IHVuZGVmaW5lZCxcbiAgVERlZmF1bHRzIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQsXG4gIFRBbGlhc2VzIGV4dGVuZHMgQWxpYXNlczxUQWxpYXNBcmdOYW1lcywgVEFsaWFzTmFtZXM+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkLFxuICBUQWxpYXNBcmdOYW1lcyBleHRlbmRzIHN0cmluZyA9IHN0cmluZyxcbiAgVEFsaWFzTmFtZXMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmcsXG4+KFxuICBhcmdzOiBzdHJpbmdbXSxcbiAge1xuICAgIFwiLS1cIjogZG91YmxlRGFzaCA9IGZhbHNlLFxuICAgIGFsaWFzID0ge30gYXMgTm9uTnVsbGFibGU8VEFsaWFzZXM+LFxuICAgIGJvb2xlYW4gPSBmYWxzZSxcbiAgICBkZWZhdWx0OiBkZWZhdWx0cyA9IHt9IGFzIFREZWZhdWx0cyAmIERlZmF1bHRzPFRCb29sZWFucywgVFN0cmluZ3M+LFxuICAgIHN0b3BFYXJseSA9IGZhbHNlLFxuICAgIHN0cmluZyA9IFtdLFxuICAgIGNvbGxlY3QgPSBbXSxcbiAgICBuZWdhdGFibGUgPSBbXSxcbiAgICB1bmtub3duOiB1bmtub3duRm4gPSAoaTogc3RyaW5nKTogdW5rbm93biA9PiBpLFxuICB9OiBQYXJzZU9wdGlvbnM8XG4gICAgVEJvb2xlYW5zLFxuICAgIFRTdHJpbmdzLFxuICAgIFRDb2xsZWN0YWJsZSxcbiAgICBUTmVnYXRhYmxlLFxuICAgIFREZWZhdWx0cyxcbiAgICBUQWxpYXNlcyxcbiAgICBURG91YmxlRGFzaFxuICA+ID0ge30sXG4pOiBBcmdzPFRBcmdzLCBURG91YmxlRGFzaD4ge1xuICBjb25zdCBhbGlhc01hcDogTWFwPHN0cmluZywgU2V0PHN0cmluZz4+ID0gbmV3IE1hcCgpO1xuICBjb25zdCBib29sZWFuU2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHN0cmluZ1NldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBjb2xsZWN0U2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IG5lZ2F0YWJsZVNldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIGxldCBhbGxCb29scyA9IGZhbHNlO1xuXG4gIGlmIChhbGlhcykge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGFsaWFzKSB7XG4gICAgICBjb25zdCB2YWwgPSAoYWxpYXMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW2tleV07XG4gICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBbGlhcyB2YWx1ZSBtdXN0IGJlIGRlZmluZWRcIik7XG4gICAgICBjb25zdCBhbGlhc2VzID0gQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsIDogW3ZhbF07XG4gICAgICBhbGlhc01hcC5zZXQoa2V5LCBuZXcgU2V0KGFsaWFzZXMpKTtcbiAgICAgIGFsaWFzZXMuZm9yRWFjaCgoYWxpYXMpID0+XG4gICAgICAgIGFsaWFzTWFwLnNldChcbiAgICAgICAgICBhbGlhcyxcbiAgICAgICAgICBuZXcgU2V0KFtrZXksIC4uLmFsaWFzZXMuZmlsdGVyKChpdCkgPT4gaXQgIT09IGFsaWFzKV0pLFxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGlmIChib29sZWFuKSB7XG4gICAgaWYgKHR5cGVvZiBib29sZWFuID09PSBcImJvb2xlYW5cIikge1xuICAgICAgYWxsQm9vbHMgPSBib29sZWFuO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBib29sZWFuQXJncyA9IEFycmF5LmlzQXJyYXkoYm9vbGVhbikgPyBib29sZWFuIDogW2Jvb2xlYW5dO1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgYm9vbGVhbkFyZ3MuZmlsdGVyKEJvb2xlYW4pKSB7XG4gICAgICAgIGJvb2xlYW5TZXQuYWRkKGtleSk7XG4gICAgICAgIGFsaWFzTWFwLmdldChrZXkpPy5mb3JFYWNoKChhbCkgPT4ge1xuICAgICAgICAgIGJvb2xlYW5TZXQuYWRkKGFsKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKHN0cmluZykge1xuICAgIGNvbnN0IHN0cmluZ0FyZ3MgPSBBcnJheS5pc0FycmF5KHN0cmluZykgPyBzdHJpbmcgOiBbc3RyaW5nXTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBzdHJpbmdBcmdzLmZpbHRlcihCb29sZWFuKSkge1xuICAgICAgc3RyaW5nU2V0LmFkZChrZXkpO1xuICAgICAgYWxpYXNNYXAuZ2V0KGtleSk/LmZvckVhY2goKGFsKSA9PiBzdHJpbmdTZXQuYWRkKGFsKSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGNvbGxlY3QpIHtcbiAgICBjb25zdCBjb2xsZWN0QXJncyA9IEFycmF5LmlzQXJyYXkoY29sbGVjdCkgPyBjb2xsZWN0IDogW2NvbGxlY3RdO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIGNvbGxlY3RBcmdzLmZpbHRlcihCb29sZWFuKSkge1xuICAgICAgY29sbGVjdFNldC5hZGQoa2V5KTtcbiAgICAgIGFsaWFzTWFwLmdldChrZXkpPy5mb3JFYWNoKChhbCkgPT4gY29sbGVjdFNldC5hZGQoYWwpKTtcbiAgICB9XG4gIH1cblxuICBpZiAobmVnYXRhYmxlKSB7XG4gICAgY29uc3QgbmVnYXRhYmxlQXJncyA9IEFycmF5LmlzQXJyYXkobmVnYXRhYmxlKSA/IG5lZ2F0YWJsZSA6IFtuZWdhdGFibGVdO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIG5lZ2F0YWJsZUFyZ3MuZmlsdGVyKEJvb2xlYW4pKSB7XG4gICAgICBuZWdhdGFibGVTZXQuYWRkKGtleSk7XG4gICAgICBhbGlhc01hcC5nZXQoa2V5KT8uZm9yRWFjaCgoYWxpYXMpID0+IG5lZ2F0YWJsZVNldC5hZGQoYWxpYXMpKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBhcmd2OiBBcmdzID0geyBfOiBbXSB9O1xuXG4gIGZ1bmN0aW9uIHNldEFyZ3VtZW50KFxuICAgIGtleTogc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuLFxuICAgIGFyZzogc3RyaW5nLFxuICAgIGNvbGxlY3Q6IGJvb2xlYW4sXG4gICkge1xuICAgIGlmIChcbiAgICAgICFib29sZWFuU2V0LmhhcyhrZXkpICYmXG4gICAgICAhc3RyaW5nU2V0LmhhcyhrZXkpICYmXG4gICAgICAhYWxpYXNNYXAuaGFzKGtleSkgJiZcbiAgICAgICEoYWxsQm9vbHMgJiYgL14tLVtePV0rJC8udGVzdChhcmcpKSAmJlxuICAgICAgdW5rbm93bkZuPy4oYXJnLCBrZXksIHZhbHVlKSA9PT0gZmFsc2VcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiAhc3RyaW5nU2V0LmhhcyhrZXkpKSB7XG4gICAgICB2YWx1ZSA9IGlzTnVtYmVyKHZhbHVlKSA/IE51bWJlcih2YWx1ZSkgOiB2YWx1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBjb2xsZWN0YWJsZSA9IGNvbGxlY3QgJiYgY29sbGVjdFNldC5oYXMoa2V5KTtcbiAgICBzZXROZXN0ZWQoYXJndiwga2V5LnNwbGl0KFwiLlwiKSwgdmFsdWUsIGNvbGxlY3RhYmxlKTtcbiAgICBhbGlhc01hcC5nZXQoa2V5KT8uZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBzZXROZXN0ZWQoYXJndiwga2V5LnNwbGl0KFwiLlwiKSwgdmFsdWUsIGNvbGxlY3RhYmxlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxldCBub3RGbGFnczogc3RyaW5nW10gPSBbXTtcblxuICAvLyBhbGwgYXJncyBhZnRlciBcIi0tXCIgYXJlIG5vdCBwYXJzZWRcbiAgY29uc3QgaW5kZXggPSBhcmdzLmluZGV4T2YoXCItLVwiKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIG5vdEZsYWdzID0gYXJncy5zbGljZShpbmRleCArIDEpO1xuICAgIGFyZ3MgPSBhcmdzLnNsaWNlKDAsIGluZGV4KTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGFyZyA9IGFyZ3NbaV0hO1xuXG4gICAgY29uc3QgZ3JvdXBzID0gYXJnLm1hdGNoKEZMQUdfUkVHRVhQKT8uZ3JvdXBzO1xuXG4gICAgaWYgKGdyb3Vwcykge1xuICAgICAgY29uc3QgeyBkb3VibGVEYXNoLCBuZWdhdGVkIH0gPSBncm91cHM7XG4gICAgICBsZXQga2V5ID0gZ3JvdXBzLmtleSE7XG4gICAgICBsZXQgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCB1bmRlZmluZWQgPSBncm91cHMudmFsdWU7XG5cbiAgICAgIGlmIChkb3VibGVEYXNoKSB7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgIGlmIChib29sZWFuU2V0LmhhcyhrZXkpKSB2YWx1ZSA9IHBhcnNlQm9vbGVhblN0cmluZyh2YWx1ZSk7XG4gICAgICAgICAgc2V0QXJndW1lbnQoa2V5LCB2YWx1ZSwgYXJnLCB0cnVlKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZWdhdGVkKSB7XG4gICAgICAgICAgaWYgKG5lZ2F0YWJsZVNldC5oYXMoa2V5KSkge1xuICAgICAgICAgICAgc2V0QXJndW1lbnQoa2V5LCBmYWxzZSwgYXJnLCBmYWxzZSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAga2V5ID0gYG5vLSR7a2V5fWA7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuZXh0ID0gYXJnc1tpICsgMV07XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICFib29sZWFuU2V0LmhhcyhrZXkpICYmXG4gICAgICAgICAgIWFsbEJvb2xzICYmXG4gICAgICAgICAgbmV4dCAmJlxuICAgICAgICAgICEvXi0vLnRlc3QobmV4dCkgJiZcbiAgICAgICAgICAoYWxpYXNNYXAuZ2V0KGtleSlcbiAgICAgICAgICAgID8gIWFsaWFzSXNCb29sZWFuKGFsaWFzTWFwLCBib29sZWFuU2V0LCBrZXkpXG4gICAgICAgICAgICA6IHRydWUpXG4gICAgICAgICkge1xuICAgICAgICAgIHZhbHVlID0gbmV4dDtcbiAgICAgICAgICBpKys7XG4gICAgICAgICAgc2V0QXJndW1lbnQoa2V5LCB2YWx1ZSwgYXJnLCB0cnVlKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0ICYmIGlzQm9vbGVhblN0cmluZyhuZXh0KSkge1xuICAgICAgICAgIHZhbHVlID0gcGFyc2VCb29sZWFuU3RyaW5nKG5leHQpO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgICBzZXRBcmd1bWVudChrZXksIHZhbHVlLCBhcmcsIHRydWUpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFsdWUgPSBzdHJpbmdTZXQuaGFzKGtleSkgPyBcIlwiIDogdHJ1ZTtcbiAgICAgICAgc2V0QXJndW1lbnQoa2V5LCB2YWx1ZSwgYXJnLCB0cnVlKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBsZXR0ZXJzID0gYXJnLnNsaWNlKDEsIC0xKS5zcGxpdChcIlwiKTtcblxuICAgICAgbGV0IGJyb2tlbiA9IGZhbHNlO1xuICAgICAgZm9yIChjb25zdCBbaiwgbGV0dGVyXSBvZiBsZXR0ZXJzLmVudHJpZXMoKSkge1xuICAgICAgICBjb25zdCBuZXh0ID0gYXJnLnNsaWNlKGogKyAyKTtcblxuICAgICAgICBpZiAobmV4dCA9PT0gXCItXCIpIHtcbiAgICAgICAgICBzZXRBcmd1bWVudChsZXR0ZXIsIG5leHQsIGFyZywgdHJ1ZSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoL1tBLVphLXpdLy50ZXN0KGxldHRlcikgJiYgLz0vLnRlc3QobmV4dCkpIHtcbiAgICAgICAgICBzZXRBcmd1bWVudChsZXR0ZXIsIG5leHQuc3BsaXQoLz0oLispLylbMV0hLCBhcmcsIHRydWUpO1xuICAgICAgICAgIGJyb2tlbiA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgL1tBLVphLXpdLy50ZXN0KGxldHRlcikgJiZcbiAgICAgICAgICAvLT9cXGQrKFxcLlxcZCopPyhlLT9cXGQrKT8kLy50ZXN0KG5leHQpXG4gICAgICAgICkge1xuICAgICAgICAgIHNldEFyZ3VtZW50KGxldHRlciwgbmV4dCwgYXJnLCB0cnVlKTtcbiAgICAgICAgICBicm9rZW4gPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxldHRlcnNbaiArIDFdICYmIGxldHRlcnNbaiArIDFdIS5tYXRjaCgvXFxXLykpIHtcbiAgICAgICAgICBzZXRBcmd1bWVudChsZXR0ZXIsIGFyZy5zbGljZShqICsgMiksIGFyZywgdHJ1ZSk7XG4gICAgICAgICAgYnJva2VuID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzZXRBcmd1bWVudChcbiAgICAgICAgICBsZXR0ZXIsXG4gICAgICAgICAgc3RyaW5nU2V0LmhhcyhsZXR0ZXIpID8gXCJcIiA6IHRydWUsXG4gICAgICAgICAgYXJnLFxuICAgICAgICAgIHRydWUsXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGtleSA9IGFyZy5zbGljZSgtMSk7XG4gICAgICBpZiAoIWJyb2tlbiAmJiBrZXkgIT09IFwiLVwiKSB7XG4gICAgICAgIGNvbnN0IG5leHRBcmcgPSBhcmdzW2kgKyAxXTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIG5leHRBcmcgJiZcbiAgICAgICAgICAhL14oLXwtLSlbXi1dLy50ZXN0KG5leHRBcmcpICYmXG4gICAgICAgICAgIWJvb2xlYW5TZXQuaGFzKGtleSkgJiZcbiAgICAgICAgICAoYWxpYXNNYXAuZ2V0KGtleSlcbiAgICAgICAgICAgID8gIWFsaWFzSXNCb29sZWFuKGFsaWFzTWFwLCBib29sZWFuU2V0LCBrZXkpXG4gICAgICAgICAgICA6IHRydWUpXG4gICAgICAgICkge1xuICAgICAgICAgIHNldEFyZ3VtZW50KGtleSwgbmV4dEFyZywgYXJnLCB0cnVlKTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH0gZWxzZSBpZiAobmV4dEFyZyAmJiBpc0Jvb2xlYW5TdHJpbmcobmV4dEFyZykpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHBhcnNlQm9vbGVhblN0cmluZyhuZXh0QXJnKTtcbiAgICAgICAgICBzZXRBcmd1bWVudChrZXksIHZhbHVlLCBhcmcsIHRydWUpO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRBcmd1bWVudChrZXksIHN0cmluZ1NldC5oYXMoa2V5KSA/IFwiXCIgOiB0cnVlLCBhcmcsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAodW5rbm93bkZuPy4oYXJnKSAhPT0gZmFsc2UpIHtcbiAgICAgIGFyZ3YuXy5wdXNoKFxuICAgICAgICBzdHJpbmdTZXQuaGFzKFwiX1wiKSB8fCAhaXNOdW1iZXIoYXJnKSA/IGFyZyA6IE51bWJlcihhcmcpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoc3RvcEVhcmx5KSB7XG4gICAgICBhcmd2Ll8ucHVzaCguLi5hcmdzLnNsaWNlKGkgKyAxKSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhkZWZhdWx0cykpIHtcbiAgICBjb25zdCBrZXlzID0ga2V5LnNwbGl0KFwiLlwiKTtcbiAgICBpZiAoIWhhc05lc3RlZChhcmd2LCBrZXlzKSkge1xuICAgICAgc2V0TmVzdGVkKGFyZ3YsIGtleXMsIHZhbHVlKTtcbiAgICAgIGFsaWFzTWFwLmdldChrZXkpPy5mb3JFYWNoKChrZXkpID0+XG4gICAgICAgIHNldE5lc3RlZChhcmd2LCBrZXkuc3BsaXQoXCIuXCIpLCB2YWx1ZSlcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBrZXkgb2YgYm9vbGVhblNldC5rZXlzKCkpIHtcbiAgICBjb25zdCBrZXlzID0ga2V5LnNwbGl0KFwiLlwiKTtcbiAgICBpZiAoIWhhc05lc3RlZChhcmd2LCBrZXlzKSkge1xuICAgICAgY29uc3QgdmFsdWUgPSBjb2xsZWN0U2V0LmhhcyhrZXkpID8gW10gOiBmYWxzZTtcbiAgICAgIHNldE5lc3RlZChhcmd2LCBrZXlzLCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBrZXkgb2Ygc3RyaW5nU2V0LmtleXMoKSkge1xuICAgIGNvbnN0IGtleXMgPSBrZXkuc3BsaXQoXCIuXCIpO1xuICAgIGlmICghaGFzTmVzdGVkKGFyZ3YsIGtleXMpICYmIGNvbGxlY3RTZXQuaGFzKGtleSkpIHtcbiAgICAgIHNldE5lc3RlZChhcmd2LCBrZXlzLCBbXSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGRvdWJsZURhc2gpIHtcbiAgICBhcmd2W1wiLS1cIl0gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBub3RGbGFncykge1xuICAgICAgYXJndltcIi0tXCJdLnB1c2goa2V5KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yIChjb25zdCBrZXkgb2Ygbm90RmxhZ3MpIHtcbiAgICAgIGFyZ3YuXy5wdXNoKGtleSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFyZ3YgYXMgQXJnczxUQXJncywgVERvdWJsZURhc2g+O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7OztDQVlDLEdBRUQ7O0NBRUMsR0FzVUQsU0FBUyxTQUFTLENBQVM7RUFDekIsSUFBSSxpQkFBaUIsSUFBSSxDQUFDLE9BQU8sS0FBSyxPQUFPO0VBQzdDLE9BQU8sNkNBQTZDLElBQUksQ0FBQyxPQUFPO0FBQ2xFO0FBRUEsU0FBUyxVQUNQLE1BQXFCLEVBQ3JCLElBQWMsRUFDZCxLQUFjLEVBQ2QsVUFBVSxLQUFLO0VBRWYsS0FBSyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7SUFDekIsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDO0lBQ2pCLFNBQVMsTUFBTSxDQUFDLElBQUk7RUFDdEI7RUFFQSxNQUFNLE1BQU0sS0FBSyxFQUFFLENBQUMsQ0FBQztFQUVyQixJQUFJLFNBQVM7SUFDWCxNQUFNLElBQUksTUFBTSxDQUFDLElBQUk7SUFDckIsSUFBSSxNQUFNLE9BQU8sQ0FBQyxJQUFJO01BQ3BCLEVBQUUsSUFBSSxDQUFDO01BQ1A7SUFDRjtJQUVBLFFBQVEsSUFBSTtNQUFDO01BQUc7S0FBTSxHQUFHO01BQUM7S0FBTTtFQUNsQztFQUVBLE1BQU0sQ0FBQyxJQUFJLEdBQUc7QUFDaEI7QUFFQSxTQUFTLFVBQVUsTUFBcUIsRUFBRSxJQUFjO0VBQ3RELE9BQU87T0FBSTtHQUFLO0VBQ2hCLE1BQU0sVUFBVSxLQUFLLEdBQUc7RUFDeEIsSUFBSSxDQUFDLFNBQVMsT0FBTztFQUNyQixLQUFLLE1BQU0sT0FBTyxLQUFNO0lBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU87SUFDekIsU0FBUyxNQUFNLENBQUMsSUFBSTtFQUN0QjtFQUNBLE9BQU8sT0FBTyxNQUFNLENBQUMsUUFBUTtBQUMvQjtBQUVBLFNBQVMsZUFDUCxRQUFrQyxFQUNsQyxVQUF1QixFQUN2QixHQUFXO0VBRVgsTUFBTSxNQUFNLFNBQVMsR0FBRyxDQUFDO0VBQ3pCLElBQUksUUFBUSxXQUFXLE9BQU87RUFDOUIsS0FBSyxNQUFNLFNBQVMsSUFBSyxJQUFJLFdBQVcsR0FBRyxDQUFDLFFBQVEsT0FBTztFQUMzRCxPQUFPO0FBQ1Q7QUFFQSxTQUFTLGdCQUFnQixLQUFhO0VBQ3BDLE9BQU8sVUFBVSxVQUFVLFVBQVU7QUFDdkM7QUFFQSxTQUFTLG1CQUFtQixLQUFjO0VBQ3hDLE9BQU8sVUFBVTtBQUNuQjtBQUVBLE1BQU0sY0FDSjtBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaURDLEdBQ0QsT0FBTyxTQUFTLFVBbUJkLElBQWMsRUFDZCxFQUNFLE1BQU0sYUFBYSxLQUFLLEVBQ3hCLFFBQVEsQ0FBQyxDQUEwQixFQUNuQyxVQUFVLEtBQUssRUFDZixTQUFTLFdBQVcsQ0FBQyxDQUE4QyxFQUNuRSxZQUFZLEtBQUssRUFDakIsU0FBUyxFQUFFLEVBQ1gsVUFBVSxFQUFFLEVBQ1osWUFBWSxFQUFFLEVBQ2QsU0FBUyxZQUFZLENBQUMsSUFBdUIsQ0FBQyxFQVMvQyxHQUFHLENBQUMsQ0FBQztFQUVOLE1BQU0sV0FBcUMsSUFBSTtFQUMvQyxNQUFNLGFBQWEsSUFBSTtFQUN2QixNQUFNLFlBQVksSUFBSTtFQUN0QixNQUFNLGFBQWEsSUFBSTtFQUN2QixNQUFNLGVBQWUsSUFBSTtFQUV6QixJQUFJLFdBQVc7RUFFZixJQUFJLE9BQU87SUFDVCxJQUFLLE1BQU0sT0FBTyxNQUFPO01BQ3ZCLE1BQU0sTUFBTSxBQUFDLEtBQWlDLENBQUMsSUFBSTtNQUNuRCxJQUFJLFFBQVEsV0FBVyxNQUFNLElBQUksVUFBVTtNQUMzQyxNQUFNLFVBQVUsTUFBTSxPQUFPLENBQUMsT0FBTyxNQUFNO1FBQUM7T0FBSTtNQUNoRCxTQUFTLEdBQUcsQ0FBQyxLQUFLLElBQUksSUFBSTtNQUMxQixRQUFRLE9BQU8sQ0FBQyxDQUFDLFFBQ2YsU0FBUyxHQUFHLENBQ1YsT0FDQSxJQUFJLElBQUk7VUFBQzthQUFRLFFBQVEsTUFBTSxDQUFDLENBQUMsS0FBTyxPQUFPO1NBQU87SUFHNUQ7RUFDRjtFQUVBLElBQUksU0FBUztJQUNYLElBQUksT0FBTyxZQUFZLFdBQVc7TUFDaEMsV0FBVztJQUNiLE9BQU87TUFDTCxNQUFNLGNBQWMsTUFBTSxPQUFPLENBQUMsV0FBVyxVQUFVO1FBQUM7T0FBUTtNQUNoRSxLQUFLLE1BQU0sT0FBTyxZQUFZLE1BQU0sQ0FBQyxTQUFVO1FBQzdDLFdBQVcsR0FBRyxDQUFDO1FBQ2YsU0FBUyxHQUFHLENBQUMsTUFBTSxRQUFRLENBQUM7VUFDMUIsV0FBVyxHQUFHLENBQUM7UUFDakI7TUFDRjtJQUNGO0VBQ0Y7RUFFQSxJQUFJLFFBQVE7SUFDVixNQUFNLGFBQWEsTUFBTSxPQUFPLENBQUMsVUFBVSxTQUFTO01BQUM7S0FBTztJQUM1RCxLQUFLLE1BQU0sT0FBTyxXQUFXLE1BQU0sQ0FBQyxTQUFVO01BQzVDLFVBQVUsR0FBRyxDQUFDO01BQ2QsU0FBUyxHQUFHLENBQUMsTUFBTSxRQUFRLENBQUMsS0FBTyxVQUFVLEdBQUcsQ0FBQztJQUNuRDtFQUNGO0VBRUEsSUFBSSxTQUFTO0lBQ1gsTUFBTSxjQUFjLE1BQU0sT0FBTyxDQUFDLFdBQVcsVUFBVTtNQUFDO0tBQVE7SUFDaEUsS0FBSyxNQUFNLE9BQU8sWUFBWSxNQUFNLENBQUMsU0FBVTtNQUM3QyxXQUFXLEdBQUcsQ0FBQztNQUNmLFNBQVMsR0FBRyxDQUFDLE1BQU0sUUFBUSxDQUFDLEtBQU8sV0FBVyxHQUFHLENBQUM7SUFDcEQ7RUFDRjtFQUVBLElBQUksV0FBVztJQUNiLE1BQU0sZ0JBQWdCLE1BQU0sT0FBTyxDQUFDLGFBQWEsWUFBWTtNQUFDO0tBQVU7SUFDeEUsS0FBSyxNQUFNLE9BQU8sY0FBYyxNQUFNLENBQUMsU0FBVTtNQUMvQyxhQUFhLEdBQUcsQ0FBQztNQUNqQixTQUFTLEdBQUcsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxRQUFVLGFBQWEsR0FBRyxDQUFDO0lBQ3pEO0VBQ0Y7RUFFQSxNQUFNLE9BQWE7SUFBRSxHQUFHLEVBQUU7RUFBQztFQUUzQixTQUFTLFlBQ1AsR0FBVyxFQUNYLEtBQWdDLEVBQ2hDLEdBQVcsRUFDWCxPQUFnQjtJQUVoQixJQUNFLENBQUMsV0FBVyxHQUFHLENBQUMsUUFDaEIsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxRQUNmLENBQUMsU0FBUyxHQUFHLENBQUMsUUFDZCxDQUFDLENBQUMsWUFBWSxZQUFZLElBQUksQ0FBQyxJQUFJLEtBQ25DLFlBQVksS0FBSyxLQUFLLFdBQVcsT0FDakM7TUFDQTtJQUNGO0lBQ0EsSUFBSSxPQUFPLFVBQVUsWUFBWSxDQUFDLFVBQVUsR0FBRyxDQUFDLE1BQU07TUFDcEQsUUFBUSxTQUFTLFNBQVMsT0FBTyxTQUFTO0lBQzVDO0lBRUEsTUFBTSxjQUFjLFdBQVcsV0FBVyxHQUFHLENBQUM7SUFDOUMsVUFBVSxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sT0FBTztJQUN2QyxTQUFTLEdBQUcsQ0FBQyxNQUFNLFFBQVEsQ0FBQztNQUMxQixVQUFVLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxPQUFPO0lBQ3pDO0VBQ0Y7RUFFQSxJQUFJLFdBQXFCLEVBQUU7RUFFM0IscUNBQXFDO0VBQ3JDLE1BQU0sUUFBUSxLQUFLLE9BQU8sQ0FBQztFQUMzQixJQUFJLFVBQVUsQ0FBQyxHQUFHO0lBQ2hCLFdBQVcsS0FBSyxLQUFLLENBQUMsUUFBUTtJQUM5QixPQUFPLEtBQUssS0FBSyxDQUFDLEdBQUc7RUFDdkI7RUFFQSxJQUFLLElBQUksSUFBSSxHQUFHLElBQUksS0FBSyxNQUFNLEVBQUUsSUFBSztJQUNwQyxNQUFNLE1BQU0sSUFBSSxDQUFDLEVBQUU7SUFFbkIsTUFBTSxTQUFTLElBQUksS0FBSyxDQUFDLGNBQWM7SUFFdkMsSUFBSSxRQUFRO01BQ1YsTUFBTSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsR0FBRztNQUNoQyxJQUFJLE1BQU0sT0FBTyxHQUFHO01BQ3BCLElBQUksUUFBK0MsT0FBTyxLQUFLO01BRS9ELElBQUksWUFBWTtRQUNkLElBQUksT0FBTztVQUNULElBQUksV0FBVyxHQUFHLENBQUMsTUFBTSxRQUFRLG1CQUFtQjtVQUNwRCxZQUFZLEtBQUssT0FBTyxLQUFLO1VBQzdCO1FBQ0Y7UUFFQSxJQUFJLFNBQVM7VUFDWCxJQUFJLGFBQWEsR0FBRyxDQUFDLE1BQU07WUFDekIsWUFBWSxLQUFLLE9BQU8sS0FBSztZQUM3QjtVQUNGO1VBQ0EsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLO1FBQ25CO1FBRUEsTUFBTSxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFFeEIsSUFDRSxDQUFDLFdBQVcsR0FBRyxDQUFDLFFBQ2hCLENBQUMsWUFDRCxRQUNBLENBQUMsS0FBSyxJQUFJLENBQUMsU0FDWCxDQUFDLFNBQVMsR0FBRyxDQUFDLE9BQ1YsQ0FBQyxlQUFlLFVBQVUsWUFBWSxPQUN0QyxJQUFJLEdBQ1I7VUFDQSxRQUFRO1VBQ1I7VUFDQSxZQUFZLEtBQUssT0FBTyxLQUFLO1VBQzdCO1FBQ0Y7UUFFQSxJQUFJLFFBQVEsZ0JBQWdCLE9BQU87VUFDakMsUUFBUSxtQkFBbUI7VUFDM0I7VUFDQSxZQUFZLEtBQUssT0FBTyxLQUFLO1VBQzdCO1FBQ0Y7UUFFQSxRQUFRLFVBQVUsR0FBRyxDQUFDLE9BQU8sS0FBSztRQUNsQyxZQUFZLEtBQUssT0FBTyxLQUFLO1FBQzdCO01BQ0Y7TUFDQSxNQUFNLFVBQVUsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO01BRXZDLElBQUksU0FBUztNQUNiLEtBQUssTUFBTSxDQUFDLEdBQUcsT0FBTyxJQUFJLFFBQVEsT0FBTyxHQUFJO1FBQzNDLE1BQU0sT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJO1FBRTNCLElBQUksU0FBUyxLQUFLO1VBQ2hCLFlBQVksUUFBUSxNQUFNLEtBQUs7VUFDL0I7UUFDRjtRQUVBLElBQUksV0FBVyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxPQUFPO1VBQzdDLFlBQVksUUFBUSxLQUFLLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFHLEtBQUs7VUFDbEQsU0FBUztVQUNUO1FBQ0Y7UUFFQSxJQUNFLFdBQVcsSUFBSSxDQUFDLFdBQ2hCLDBCQUEwQixJQUFJLENBQUMsT0FDL0I7VUFDQSxZQUFZLFFBQVEsTUFBTSxLQUFLO1VBQy9CLFNBQVM7VUFDVDtRQUNGO1FBRUEsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxDQUFFLEtBQUssQ0FBQyxPQUFPO1VBQ2pELFlBQVksUUFBUSxJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksS0FBSztVQUMzQyxTQUFTO1VBQ1Q7UUFDRjtRQUNBLFlBQ0UsUUFDQSxVQUFVLEdBQUcsQ0FBQyxVQUFVLEtBQUssTUFDN0IsS0FDQTtNQUVKO01BRUEsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDO01BQ2pCLElBQUksQ0FBQyxVQUFVLFFBQVEsS0FBSztRQUMxQixNQUFNLFVBQVUsSUFBSSxDQUFDLElBQUksRUFBRTtRQUMzQixJQUNFLFdBQ0EsQ0FBQyxjQUFjLElBQUksQ0FBQyxZQUNwQixDQUFDLFdBQVcsR0FBRyxDQUFDLFFBQ2hCLENBQUMsU0FBUyxHQUFHLENBQUMsT0FDVixDQUFDLGVBQWUsVUFBVSxZQUFZLE9BQ3RDLElBQUksR0FDUjtVQUNBLFlBQVksS0FBSyxTQUFTLEtBQUs7VUFDL0I7UUFDRixPQUFPLElBQUksV0FBVyxnQkFBZ0IsVUFBVTtVQUM5QyxNQUFNLFFBQVEsbUJBQW1CO1VBQ2pDLFlBQVksS0FBSyxPQUFPLEtBQUs7VUFDN0I7UUFDRixPQUFPO1VBQ0wsWUFBWSxLQUFLLFVBQVUsR0FBRyxDQUFDLE9BQU8sS0FBSyxNQUFNLEtBQUs7UUFDeEQ7TUFDRjtNQUNBO0lBQ0Y7SUFFQSxJQUFJLFlBQVksU0FBUyxPQUFPO01BQzlCLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FDVCxVQUFVLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxPQUFPLE1BQU0sT0FBTztJQUV4RDtJQUVBLElBQUksV0FBVztNQUNiLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJO01BQzlCO0lBQ0Y7RUFDRjtFQUVBLEtBQUssTUFBTSxDQUFDLEtBQUssTUFBTSxJQUFJLE9BQU8sT0FBTyxDQUFDLFVBQVc7SUFDbkQsTUFBTSxPQUFPLElBQUksS0FBSyxDQUFDO0lBQ3ZCLElBQUksQ0FBQyxVQUFVLE1BQU0sT0FBTztNQUMxQixVQUFVLE1BQU0sTUFBTTtNQUN0QixTQUFTLEdBQUcsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxNQUMxQixVQUFVLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTTtJQUVwQztFQUNGO0VBRUEsS0FBSyxNQUFNLE9BQU8sV0FBVyxJQUFJLEdBQUk7SUFDbkMsTUFBTSxPQUFPLElBQUksS0FBSyxDQUFDO0lBQ3ZCLElBQUksQ0FBQyxVQUFVLE1BQU0sT0FBTztNQUMxQixNQUFNLFFBQVEsV0FBVyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUc7TUFDekMsVUFBVSxNQUFNLE1BQU07SUFDeEI7RUFDRjtFQUVBLEtBQUssTUFBTSxPQUFPLFVBQVUsSUFBSSxHQUFJO0lBQ2xDLE1BQU0sT0FBTyxJQUFJLEtBQUssQ0FBQztJQUN2QixJQUFJLENBQUMsVUFBVSxNQUFNLFNBQVMsV0FBVyxHQUFHLENBQUMsTUFBTTtNQUNqRCxVQUFVLE1BQU0sTUFBTSxFQUFFO0lBQzFCO0VBQ0Y7RUFFQSxJQUFJLFlBQVk7SUFDZCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7SUFDZixLQUFLLE1BQU0sT0FBTyxTQUFVO01BQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQ2xCO0VBQ0YsT0FBTztJQUNMLEtBQUssTUFBTSxPQUFPLFNBQVU7TUFDMUIsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ2Q7RUFDRjtFQUVBLE9BQU87QUFDVCJ9
// denoCacheMetadata=4791058578558839408,16876742658149280044