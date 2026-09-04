// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Parses and loads environment variables from a `.env` file into the current
 * process, or stringify data into a `.env` file format.
 *
 * ```ts no-eval
 * // Automatically load environment variables from a `.env` file
 * import "@std/dotenv/load";
 * ```
 *
 * ```ts
 * import { parse, stringify } from "@std/dotenv";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(parse("GREETING=hello world"), { GREETING: "hello world" });
 * assertEquals(stringify({ GREETING: "hello world" }), "GREETING='hello world'");
 * ```
 *
 * @module
 */ import { parse } from "./parse.ts";
export * from "./stringify.ts";
export * from "./parse.ts";
/**
 * Works identically to {@linkcode load}, but synchronously.
 *
 * @example Usage
 * ```ts no-eval
 * import { loadSync } from "@std/dotenv";
 *
 * const conf = loadSync();
 * ```
 *
 * @param options Options for loading the environment variables.
 * @returns The parsed environment variables.
 */ export function loadSync(options = {}) {
  const { envPath = ".env", examplePath = ".env.example", defaultsPath = ".env.defaults", export: _export = false, allowEmptyValues = false } = options;
  const conf = envPath ? parseFileSync(envPath) : {};
  if (defaultsPath) {
    const confDefaults = parseFileSync(defaultsPath);
    for (const [key, value] of Object.entries(confDefaults)){
      if (!(key in conf)) {
        conf[key] = value;
      }
    }
  }
  if (examplePath) {
    const confExample = parseFileSync(examplePath);
    assertSafe(conf, confExample, allowEmptyValues);
  }
  if (_export) {
    for (const [key, value] of Object.entries(conf)){
      if (Deno.env.get(key) !== undefined) continue;
      Deno.env.set(key, value);
    }
  }
  return conf;
}
/**
 * Load environment variables from a `.env` file.  Loaded variables are accessible
 * in a configuration object returned by the `load()` function, as well as optionally
 * exporting them to the process environment using the `export` option.
 *
 * Inspired by the node modules {@linkcode https://github.com/motdotla/dotenv | dotenv}
 * and {@linkcode https://github.com/motdotla/dotenv-expand | dotenv-expand}.
 *
 * ## Basic usage
 * ```sh
 * # .env
 * GREETING=hello world
 * ```
 *
 * Then import the environment variables using the `load` function.
 *
 * @example Basic usage
 * ```ts no-eval
 * // app.ts
 * import { load } from "@std/dotenv";
 *
 * console.log(await load({ export: true })); // { GREETING: "hello world" }
 * console.log(Deno.env.get("GREETING")); // hello world
 * ```
 *
 * Run this with `deno run --allow-read --allow-env app.ts`.
 *
 * .env files support blank lines, comments, multi-line values and more.
 * See Parsing Rules below for more detail.
 *
 * ## Auto loading
 * Import the `load.ts` module to auto-import from the `.env` file and into
 * the process environment.
 *
 * @example Auto-loading
 * ```ts no-eval
 * // app.ts
 * import "@std/dotenv/load";
 *
 * console.log(Deno.env.get("GREETING")); // hello world
 * ```
 *
 * Run this with `deno run --allow-read --allow-env app.ts`.
 *
 * ## Files
 * Dotenv supports a number of different files, all of which are optional.
 * File names and paths are configurable.
 *
 * |File|Purpose|
 * |----|-------|
 * |.env|primary file for storing key-value environment entries
 * |.env.example|this file does not set any values, but specifies env variables which must be present in the configuration object or process environment after loading dotenv
 * |.env.defaults|specify default values for env variables to be used when there is no entry in the `.env` file
 *
 * ### Example file
 *
 * The purpose of the example file is to provide a list of environment
 * variables which must be set or already present in the process environment
 * or an exception will be thrown.  These
 * variables may be set externally or loaded via the `.env` or
 * `.env.defaults` files.  A description may also be provided to help
 * understand the purpose of the env variable. The values in this file
 * are for documentation only and are not set in the environment. Example:
 *
 * ```sh
 * # .env.example
 *
 * # With optional description (this is not set in the environment)
 * DATA_KEY=API key for the api.data.com service.
 *
 * # Without description
 * DATA_URL=
 * ```
 *
 * When the above file is present, after dotenv is loaded, if either
 * DATA_KEY or DATA_URL is not present in the environment an exception
 * is thrown.
 *
 * ### Defaults
 *
 * This file is used to provide a list of default environment variables
 * which will be used if there is no overriding variable in the `.env`
 * file.
 *
 * ```sh
 * # .env.defaults
 * KEY_1=DEFAULT_VALUE
 * KEY_2=ANOTHER_DEFAULT_VALUE
 * ```
 * ```sh
 * # .env
 * KEY_1=ABCD
 * ```
 * The environment variables set after dotenv loads are:
 * ```sh
 * KEY_1=ABCD
 * KEY_2=ANOTHER_DEFAULT_VALUE
 * ```
 *
 * ## Configuration
 *
 * Loading environment files comes with a number of options passed into
 * the `load()` function, all of which are optional.
 *
 * |Option|Default|Description
 * |------|-------|-----------
 * |envPath|./.env|Path and filename of the `.env` file.  Use null to prevent the .env file from being loaded.
 * |defaultsPath|./.env.defaults|Path and filename of the `.env.defaults` file. Use null to prevent the .env.defaults file from being loaded.
 * |examplePath|./.env.example|Path and filename of the `.env.example` file. Use null to prevent the .env.example file from being loaded.
 * |export|false|When true, this will export all environment variables in the `.env` and `.env.default` files to the process environment (e.g. for use by `Deno.env.get()`) but only if they are not already set.  If a variable is already in the process, the `.env` value is ignored.
 * |allowEmptyValues|false|Allows empty values for specified env variables (throws otherwise)
 *
 * ### Example configuration
 *
 * @example Using with options
 * ```ts no-eval
 * import { load } from "@std/dotenv";
 *
 * const conf = await load({
 *   envPath: "./.env_prod", // Uses .env_prod instead of .env
 *   examplePath: "./.env_required", // Uses .env_required instead of .env.example
 *   export: true, // Exports all variables to the environment
 *   allowEmptyValues: true, // Allows empty values for specified env variables
 * });
 * ```
 *
 * ## Permissions
 *
 * At a minimum, loading the `.env` related files requires the `--allow-read` permission.  Additionally, if
 * you access the process environment, either through exporting your configuration or expanding variables
 * in your `.env` file, you will need the `--allow-env` permission.  E.g.
 *
 * ```sh
 * deno run --allow-read=.env,.env.defaults,.env.example --allow-env=ENV1,ENV2 app.ts
 * ```
 *
 * ## Parsing Rules
 *
 * The parsing engine currently supports the following rules:
 *
 * - Variables that already exist in the environment are not overridden with
 *   `export: true`
 * - `BASIC=basic` becomes `{ BASIC: "basic" }`
 * - empty lines are skipped
 * - lines beginning with `#` are treated as comments
 * - empty values become empty strings (`EMPTY=` becomes `{ EMPTY: "" }`)
 * - single and double quoted values are escaped (`SINGLE_QUOTE='quoted'` becomes
 *   `{ SINGLE_QUOTE: "quoted" }`)
 * - new lines are expanded in double quoted values (`MULTILINE="new\nline"`
 *   becomes
 *
 * ```
 * { MULTILINE: "new\nline" }
 * ```
 *
 * - inner quotes are maintained (think JSON) (`JSON={"foo": "bar"}` becomes
 *   `{ JSON: "{\"foo\": \"bar\"}" }`)
 * - whitespace is removed from both ends of unquoted values (see more on
 *   {@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim | trim})
 *   (`FOO= some value` becomes `{ FOO: "some value" }`)
 * - whitespace is preserved on both ends of quoted values (`FOO=" some value "`
 *   becomes `{ FOO: " some value " }`)
 * - dollar sign with an environment key in or without curly braces in unquoted
 *   values will expand the environment key (`KEY=$KEY` or `KEY=${KEY}` becomes
 *   `{ KEY: "<KEY_VALUE_FROM_ENV>" }`)
 * - escaped dollar sign with an environment key in unquoted values will escape the
 *   environment key rather than expand (`KEY=\$KEY` becomes `{ KEY: "\\$KEY" }`)
 * - colon and a minus sign with a default value(which can also be another expand
 *   value) in expanding construction in unquoted values will first attempt to
 *   expand the environment key. If it’s not found, then it will return the default
 *   value (`KEY=${KEY:-default}` If KEY exists it becomes
 *   `{ KEY: "<KEY_VALUE_FROM_ENV>" }` If not, then it becomes
 *   `{ KEY: "default" }`. Also there is possible to do this case
 *   `KEY=${NO_SUCH_KEY:-${EXISTING_KEY:-default}}` which becomes
 *   `{ KEY: "<EXISTING_KEY_VALUE_FROM_ENV>" }`)
 *
 * @param options The options
 * @returns The parsed environment variables
 */ export async function load(options = {}) {
  const { envPath = ".env", examplePath = ".env.example", defaultsPath = ".env.defaults", export: _export = false, allowEmptyValues = false } = options;
  const conf = envPath ? await parseFile(envPath) : {};
  if (defaultsPath) {
    const confDefaults = await parseFile(defaultsPath);
    for (const [key, value] of Object.entries(confDefaults)){
      if (!(key in conf)) {
        conf[key] = value;
      }
    }
  }
  if (examplePath) {
    const confExample = await parseFile(examplePath);
    assertSafe(conf, confExample, allowEmptyValues);
  }
  if (_export) {
    for (const [key, value] of Object.entries(conf)){
      if (Deno.env.get(key) !== undefined) continue;
      Deno.env.set(key, value);
    }
  }
  return conf;
}
function parseFileSync(filepath) {
  try {
    return parse(Deno.readTextFileSync(filepath));
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return {};
    throw e;
  }
}
async function parseFile(filepath) {
  try {
    return parse(await Deno.readTextFile(filepath));
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return {};
    throw e;
  }
}
function assertSafe(conf, confExample, allowEmptyValues) {
  const missingEnvVars = [];
  for(const key in confExample){
    if (key in conf) {
      if (!allowEmptyValues && conf[key] === "") {
        missingEnvVars.push(key);
      }
    } else if (Deno.env.get(key) !== undefined) {
      if (!allowEmptyValues && Deno.env.get(key) === "") {
        missingEnvVars.push(key);
      }
    } else {
      missingEnvVars.push(key);
    }
  }
  if (missingEnvVars.length > 0) {
    const errorMessages = [
      `The following variables were defined in the example file but are not present in the environment:\n  ${missingEnvVars.join(", ")}`,
      `Make sure to add them to your env file.`,
      !allowEmptyValues && `If you expect any of these variables to be empty, you can set the allowEmptyValues option to true.`
    ];
    throw new MissingEnvVarsError(errorMessages.filter(Boolean).join("\n\n"), missingEnvVars);
  }
}
/**
 * Error thrown in {@linkcode load} and {@linkcode loadSync} when required
 * environment variables are missing.
 *
 * @example Usage
 * ```ts no-eval
 * import { MissingEnvVarsError, load } from "@std/dotenv";
 *
 * try {
 *   await load();
 * } catch (e) {
 *   if (e instanceof MissingEnvVarsError) {
 *     console.error(e.message);
 *   }
 * }
 * ```
 */ export class MissingEnvVarsError extends Error {
  /**
   * The keys of the missing environment variables.
   *
   * @example Usage
   * ```ts no-eval
   * import { MissingEnvVarsError, load } from "@std/dotenv";
   *
   * try {
   *   await load();
   * } catch (e) {
   *   if (e instanceof MissingEnvVarsError) {
   *     console.error(e.missing);
   *   }
   * }
   * ```
   */ missing;
  /**
   * Constructs a new instance.
   *
   * @example Usage
   * ```ts no-eval
   * import { MissingEnvVarsError, load } from "@std/dotenv";
   *
   * try {
   *   await load();
   * } catch (e) {
   *   if (e instanceof MissingEnvVarsError) {
   *     console.error(e.message);
   *   }
   * }
   * ```
   *
   * @param message The error message
   * @param missing The keys of the missing environment variables
   */ constructor(message, missing){
    super(message);
    this.name = "MissingEnvVarsError";
    this.missing = missing;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZG90ZW52LzAuMjI0LjIvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbi8qKlxuICogUGFyc2VzIGFuZCBsb2FkcyBlbnZpcm9ubWVudCB2YXJpYWJsZXMgZnJvbSBhIGAuZW52YCBmaWxlIGludG8gdGhlIGN1cnJlbnRcbiAqIHByb2Nlc3MsIG9yIHN0cmluZ2lmeSBkYXRhIGludG8gYSBgLmVudmAgZmlsZSBmb3JtYXQuXG4gKlxuICogYGBgdHMgbm8tZXZhbFxuICogLy8gQXV0b21hdGljYWxseSBsb2FkIGVudmlyb25tZW50IHZhcmlhYmxlcyBmcm9tIGEgYC5lbnZgIGZpbGVcbiAqIGltcG9ydCBcIkBzdGQvZG90ZW52L2xvYWRcIjtcbiAqIGBgYFxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZSwgc3RyaW5naWZ5IH0gZnJvbSBcIkBzdGQvZG90ZW52XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMocGFyc2UoXCJHUkVFVElORz1oZWxsbyB3b3JsZFwiKSwgeyBHUkVFVElORzogXCJoZWxsbyB3b3JsZFwiIH0pO1xuICogYXNzZXJ0RXF1YWxzKHN0cmluZ2lmeSh7IEdSRUVUSU5HOiBcImhlbGxvIHdvcmxkXCIgfSksIFwiR1JFRVRJTkc9J2hlbGxvIHdvcmxkJ1wiKTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gXCIuL3BhcnNlLnRzXCI7XG5cbmV4cG9ydCAqIGZyb20gXCIuL3N0cmluZ2lmeS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcGFyc2UudHNcIjtcblxuLyoqIE9wdGlvbnMgZm9yIHtAbGlua2NvZGUgbG9hZH0gYW5kIHtAbGlua2NvZGUgbG9hZFN5bmN9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2FkT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBPcHRpb25hbCBwYXRoIHRvIGAuZW52YCBmaWxlLiBUbyBwcmV2ZW50IHRoZSBkZWZhdWx0IHZhbHVlIGZyb20gYmVpbmdcbiAgICogdXNlZCwgc2V0IHRvIGBudWxsYC5cbiAgICpcbiAgICogQGRlZmF1bHQge1wiLi8uZW52XCJ9XG4gICAqL1xuICBlbnZQYXRoPzogc3RyaW5nIHwgbnVsbDtcblxuICAvKipcbiAgICogU2V0IHRvIGB0cnVlYCB0byBleHBvcnQgYWxsIGAuZW52YCB2YXJpYWJsZXMgdG8gdGhlIGN1cnJlbnQgcHJvY2Vzc2VzXG4gICAqIGVudmlyb25tZW50LiBWYXJpYWJsZXMgYXJlIHRoZW4gYWNjZXNzaWJsZSB2aWEgYERlbm8uZW52LmdldCg8a2V5PilgLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBleHBvcnQ/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBPcHRpb25hbCBwYXRoIHRvIGAuZW52LmV4YW1wbGVgIGZpbGUgd2hpY2ggaXMgdXNlZCBmb3IgdmFsaWRhdGlvbi5cbiAgICogVG8gcHJldmVudCB0aGUgZGVmYXVsdCB2YWx1ZSBmcm9tIGJlaW5nIHVzZWQsIHNldCB0byBgbnVsbGAuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtcIi4vLmVudi5leGFtcGxlXCJ9XG4gICAqL1xuICBleGFtcGxlUGF0aD86IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgcmVxdWlyZWQgZW52IHZhcmlhYmxlcyB0byBiZSBlbXB0eS4gT3RoZXJ3aXNlLCBpdFxuICAgKiB3aWxsIHRocm93IGFuIGVycm9yIGlmIGFueSB2YXJpYWJsZSBpcyBlbXB0eS5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgYWxsb3dFbXB0eVZhbHVlcz86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIE9wdGlvbmFsIHBhdGggdG8gYC5lbnYuZGVmYXVsdHNgIGZpbGUgd2hpY2ggaXMgdXNlZCB0byBkZWZpbmUgZGVmYXVsdFxuICAgKiAoZmFsbGJhY2spIHZhbHVlcy4gVG8gcHJldmVudCB0aGUgZGVmYXVsdCB2YWx1ZSBmcm9tIGJlaW5nIHVzZWQsXG4gICAqIHNldCB0byBgbnVsbGAuXG4gICAqXG4gICAqIGBgYHNoXG4gICAqICMgLmVudi5kZWZhdWx0c1xuICAgKiAjIFdpbGwgbm90IGJlIHNldCBpZiBHUkVFVElORyBpcyBzZXQgaW4gYmFzZSAuZW52IGZpbGVcbiAgICogR1JFRVRJTkc9XCJhIHNlY3JldCB0byBldmVyeWJvZHlcIlxuICAgKiBgYGBcbiAgICpcbiAgICogQGRlZmF1bHQge1wiLi8uZW52LmRlZmF1bHRzXCJ9XG4gICAqL1xuICBkZWZhdWx0c1BhdGg/OiBzdHJpbmcgfCBudWxsO1xufVxuXG4vKipcbiAqIFdvcmtzIGlkZW50aWNhbGx5IHRvIHtAbGlua2NvZGUgbG9hZH0sIGJ1dCBzeW5jaHJvbm91c2x5LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQgeyBsb2FkU3luYyB9IGZyb20gXCJAc3RkL2RvdGVudlwiO1xuICpcbiAqIGNvbnN0IGNvbmYgPSBsb2FkU3luYygpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgbG9hZGluZyB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzLlxuICogQHJldHVybnMgVGhlIHBhcnNlZCBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkU3luYyhcbiAgb3B0aW9uczogTG9hZE9wdGlvbnMgPSB7fSxcbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICBjb25zdCB7XG4gICAgZW52UGF0aCA9IFwiLmVudlwiLFxuICAgIGV4YW1wbGVQYXRoID0gXCIuZW52LmV4YW1wbGVcIixcbiAgICBkZWZhdWx0c1BhdGggPSBcIi5lbnYuZGVmYXVsdHNcIixcbiAgICBleHBvcnQ6IF9leHBvcnQgPSBmYWxzZSxcbiAgICBhbGxvd0VtcHR5VmFsdWVzID0gZmFsc2UsXG4gIH0gPSBvcHRpb25zO1xuICBjb25zdCBjb25mID0gZW52UGF0aCA/IHBhcnNlRmlsZVN5bmMoZW52UGF0aCkgOiB7fTtcblxuICBpZiAoZGVmYXVsdHNQYXRoKSB7XG4gICAgY29uc3QgY29uZkRlZmF1bHRzID0gcGFyc2VGaWxlU3luYyhkZWZhdWx0c1BhdGgpO1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGNvbmZEZWZhdWx0cykpIHtcbiAgICAgIGlmICghKGtleSBpbiBjb25mKSkge1xuICAgICAgICBjb25mW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoZXhhbXBsZVBhdGgpIHtcbiAgICBjb25zdCBjb25mRXhhbXBsZSA9IHBhcnNlRmlsZVN5bmMoZXhhbXBsZVBhdGgpO1xuICAgIGFzc2VydFNhZmUoY29uZiwgY29uZkV4YW1wbGUsIGFsbG93RW1wdHlWYWx1ZXMpO1xuICB9XG5cbiAgaWYgKF9leHBvcnQpIHtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjb25mKSkge1xuICAgICAgaWYgKERlbm8uZW52LmdldChrZXkpICE9PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xuICAgICAgRGVuby5lbnYuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb25mO1xufVxuXG4vKipcbiAqIExvYWQgZW52aXJvbm1lbnQgdmFyaWFibGVzIGZyb20gYSBgLmVudmAgZmlsZS4gIExvYWRlZCB2YXJpYWJsZXMgYXJlIGFjY2Vzc2libGVcbiAqIGluIGEgY29uZmlndXJhdGlvbiBvYmplY3QgcmV0dXJuZWQgYnkgdGhlIGBsb2FkKClgIGZ1bmN0aW9uLCBhcyB3ZWxsIGFzIG9wdGlvbmFsbHlcbiAqIGV4cG9ydGluZyB0aGVtIHRvIHRoZSBwcm9jZXNzIGVudmlyb25tZW50IHVzaW5nIHRoZSBgZXhwb3J0YCBvcHRpb24uXG4gKlxuICogSW5zcGlyZWQgYnkgdGhlIG5vZGUgbW9kdWxlcyB7QGxpbmtjb2RlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3Rkb3RsYS9kb3RlbnYgfCBkb3RlbnZ9XG4gKiBhbmQge0BsaW5rY29kZSBodHRwczovL2dpdGh1Yi5jb20vbW90ZG90bGEvZG90ZW52LWV4cGFuZCB8IGRvdGVudi1leHBhbmR9LlxuICpcbiAqICMjIEJhc2ljIHVzYWdlXG4gKiBgYGBzaFxuICogIyAuZW52XG4gKiBHUkVFVElORz1oZWxsbyB3b3JsZFxuICogYGBgXG4gKlxuICogVGhlbiBpbXBvcnQgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcyB1c2luZyB0aGUgYGxvYWRgIGZ1bmN0aW9uLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0cyBuby1ldmFsXG4gKiAvLyBhcHAudHNcbiAqIGltcG9ydCB7IGxvYWQgfSBmcm9tIFwiQHN0ZC9kb3RlbnZcIjtcbiAqXG4gKiBjb25zb2xlLmxvZyhhd2FpdCBsb2FkKHsgZXhwb3J0OiB0cnVlIH0pKTsgLy8geyBHUkVFVElORzogXCJoZWxsbyB3b3JsZFwiIH1cbiAqIGNvbnNvbGUubG9nKERlbm8uZW52LmdldChcIkdSRUVUSU5HXCIpKTsgLy8gaGVsbG8gd29ybGRcbiAqIGBgYFxuICpcbiAqIFJ1biB0aGlzIHdpdGggYGRlbm8gcnVuIC0tYWxsb3ctcmVhZCAtLWFsbG93LWVudiBhcHAudHNgLlxuICpcbiAqIC5lbnYgZmlsZXMgc3VwcG9ydCBibGFuayBsaW5lcywgY29tbWVudHMsIG11bHRpLWxpbmUgdmFsdWVzIGFuZCBtb3JlLlxuICogU2VlIFBhcnNpbmcgUnVsZXMgYmVsb3cgZm9yIG1vcmUgZGV0YWlsLlxuICpcbiAqICMjIEF1dG8gbG9hZGluZ1xuICogSW1wb3J0IHRoZSBgbG9hZC50c2AgbW9kdWxlIHRvIGF1dG8taW1wb3J0IGZyb20gdGhlIGAuZW52YCBmaWxlIGFuZCBpbnRvXG4gKiB0aGUgcHJvY2VzcyBlbnZpcm9ubWVudC5cbiAqXG4gKiBAZXhhbXBsZSBBdXRvLWxvYWRpbmdcbiAqIGBgYHRzIG5vLWV2YWxcbiAqIC8vIGFwcC50c1xuICogaW1wb3J0IFwiQHN0ZC9kb3RlbnYvbG9hZFwiO1xuICpcbiAqIGNvbnNvbGUubG9nKERlbm8uZW52LmdldChcIkdSRUVUSU5HXCIpKTsgLy8gaGVsbG8gd29ybGRcbiAqIGBgYFxuICpcbiAqIFJ1biB0aGlzIHdpdGggYGRlbm8gcnVuIC0tYWxsb3ctcmVhZCAtLWFsbG93LWVudiBhcHAudHNgLlxuICpcbiAqICMjIEZpbGVzXG4gKiBEb3RlbnYgc3VwcG9ydHMgYSBudW1iZXIgb2YgZGlmZmVyZW50IGZpbGVzLCBhbGwgb2Ygd2hpY2ggYXJlIG9wdGlvbmFsLlxuICogRmlsZSBuYW1lcyBhbmQgcGF0aHMgYXJlIGNvbmZpZ3VyYWJsZS5cbiAqXG4gKiB8RmlsZXxQdXJwb3NlfFxuICogfC0tLS18LS0tLS0tLXxcbiAqIHwuZW52fHByaW1hcnkgZmlsZSBmb3Igc3RvcmluZyBrZXktdmFsdWUgZW52aXJvbm1lbnQgZW50cmllc1xuICogfC5lbnYuZXhhbXBsZXx0aGlzIGZpbGUgZG9lcyBub3Qgc2V0IGFueSB2YWx1ZXMsIGJ1dCBzcGVjaWZpZXMgZW52IHZhcmlhYmxlcyB3aGljaCBtdXN0IGJlIHByZXNlbnQgaW4gdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IG9yIHByb2Nlc3MgZW52aXJvbm1lbnQgYWZ0ZXIgbG9hZGluZyBkb3RlbnZcbiAqIHwuZW52LmRlZmF1bHRzfHNwZWNpZnkgZGVmYXVsdCB2YWx1ZXMgZm9yIGVudiB2YXJpYWJsZXMgdG8gYmUgdXNlZCB3aGVuIHRoZXJlIGlzIG5vIGVudHJ5IGluIHRoZSBgLmVudmAgZmlsZVxuICpcbiAqICMjIyBFeGFtcGxlIGZpbGVcbiAqXG4gKiBUaGUgcHVycG9zZSBvZiB0aGUgZXhhbXBsZSBmaWxlIGlzIHRvIHByb3ZpZGUgYSBsaXN0IG9mIGVudmlyb25tZW50XG4gKiB2YXJpYWJsZXMgd2hpY2ggbXVzdCBiZSBzZXQgb3IgYWxyZWFkeSBwcmVzZW50IGluIHRoZSBwcm9jZXNzIGVudmlyb25tZW50XG4gKiBvciBhbiBleGNlcHRpb24gd2lsbCBiZSB0aHJvd24uICBUaGVzZVxuICogdmFyaWFibGVzIG1heSBiZSBzZXQgZXh0ZXJuYWxseSBvciBsb2FkZWQgdmlhIHRoZSBgLmVudmAgb3JcbiAqIGAuZW52LmRlZmF1bHRzYCBmaWxlcy4gIEEgZGVzY3JpcHRpb24gbWF5IGFsc28gYmUgcHJvdmlkZWQgdG8gaGVscFxuICogdW5kZXJzdGFuZCB0aGUgcHVycG9zZSBvZiB0aGUgZW52IHZhcmlhYmxlLiBUaGUgdmFsdWVzIGluIHRoaXMgZmlsZVxuICogYXJlIGZvciBkb2N1bWVudGF0aW9uIG9ubHkgYW5kIGFyZSBub3Qgc2V0IGluIHRoZSBlbnZpcm9ubWVudC4gRXhhbXBsZTpcbiAqXG4gKiBgYGBzaFxuICogIyAuZW52LmV4YW1wbGVcbiAqXG4gKiAjIFdpdGggb3B0aW9uYWwgZGVzY3JpcHRpb24gKHRoaXMgaXMgbm90IHNldCBpbiB0aGUgZW52aXJvbm1lbnQpXG4gKiBEQVRBX0tFWT1BUEkga2V5IGZvciB0aGUgYXBpLmRhdGEuY29tIHNlcnZpY2UuXG4gKlxuICogIyBXaXRob3V0IGRlc2NyaXB0aW9uXG4gKiBEQVRBX1VSTD1cbiAqIGBgYFxuICpcbiAqIFdoZW4gdGhlIGFib3ZlIGZpbGUgaXMgcHJlc2VudCwgYWZ0ZXIgZG90ZW52IGlzIGxvYWRlZCwgaWYgZWl0aGVyXG4gKiBEQVRBX0tFWSBvciBEQVRBX1VSTCBpcyBub3QgcHJlc2VudCBpbiB0aGUgZW52aXJvbm1lbnQgYW4gZXhjZXB0aW9uXG4gKiBpcyB0aHJvd24uXG4gKlxuICogIyMjIERlZmF1bHRzXG4gKlxuICogVGhpcyBmaWxlIGlzIHVzZWQgdG8gcHJvdmlkZSBhIGxpc3Qgb2YgZGVmYXVsdCBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAqIHdoaWNoIHdpbGwgYmUgdXNlZCBpZiB0aGVyZSBpcyBubyBvdmVycmlkaW5nIHZhcmlhYmxlIGluIHRoZSBgLmVudmBcbiAqIGZpbGUuXG4gKlxuICogYGBgc2hcbiAqICMgLmVudi5kZWZhdWx0c1xuICogS0VZXzE9REVGQVVMVF9WQUxVRVxuICogS0VZXzI9QU5PVEhFUl9ERUZBVUxUX1ZBTFVFXG4gKiBgYGBcbiAqIGBgYHNoXG4gKiAjIC5lbnZcbiAqIEtFWV8xPUFCQ0RcbiAqIGBgYFxuICogVGhlIGVudmlyb25tZW50IHZhcmlhYmxlcyBzZXQgYWZ0ZXIgZG90ZW52IGxvYWRzIGFyZTpcbiAqIGBgYHNoXG4gKiBLRVlfMT1BQkNEXG4gKiBLRVlfMj1BTk9USEVSX0RFRkFVTFRfVkFMVUVcbiAqIGBgYFxuICpcbiAqICMjIENvbmZpZ3VyYXRpb25cbiAqXG4gKiBMb2FkaW5nIGVudmlyb25tZW50IGZpbGVzIGNvbWVzIHdpdGggYSBudW1iZXIgb2Ygb3B0aW9ucyBwYXNzZWQgaW50b1xuICogdGhlIGBsb2FkKClgIGZ1bmN0aW9uLCBhbGwgb2Ygd2hpY2ggYXJlIG9wdGlvbmFsLlxuICpcbiAqIHxPcHRpb258RGVmYXVsdHxEZXNjcmlwdGlvblxuICogfC0tLS0tLXwtLS0tLS0tfC0tLS0tLS0tLS0tXG4gKiB8ZW52UGF0aHwuLy5lbnZ8UGF0aCBhbmQgZmlsZW5hbWUgb2YgdGhlIGAuZW52YCBmaWxlLiAgVXNlIG51bGwgdG8gcHJldmVudCB0aGUgLmVudiBmaWxlIGZyb20gYmVpbmcgbG9hZGVkLlxuICogfGRlZmF1bHRzUGF0aHwuLy5lbnYuZGVmYXVsdHN8UGF0aCBhbmQgZmlsZW5hbWUgb2YgdGhlIGAuZW52LmRlZmF1bHRzYCBmaWxlLiBVc2UgbnVsbCB0byBwcmV2ZW50IHRoZSAuZW52LmRlZmF1bHRzIGZpbGUgZnJvbSBiZWluZyBsb2FkZWQuXG4gKiB8ZXhhbXBsZVBhdGh8Li8uZW52LmV4YW1wbGV8UGF0aCBhbmQgZmlsZW5hbWUgb2YgdGhlIGAuZW52LmV4YW1wbGVgIGZpbGUuIFVzZSBudWxsIHRvIHByZXZlbnQgdGhlIC5lbnYuZXhhbXBsZSBmaWxlIGZyb20gYmVpbmcgbG9hZGVkLlxuICogfGV4cG9ydHxmYWxzZXxXaGVuIHRydWUsIHRoaXMgd2lsbCBleHBvcnQgYWxsIGVudmlyb25tZW50IHZhcmlhYmxlcyBpbiB0aGUgYC5lbnZgIGFuZCBgLmVudi5kZWZhdWx0YCBmaWxlcyB0byB0aGUgcHJvY2VzcyBlbnZpcm9ubWVudCAoZS5nLiBmb3IgdXNlIGJ5IGBEZW5vLmVudi5nZXQoKWApIGJ1dCBvbmx5IGlmIHRoZXkgYXJlIG5vdCBhbHJlYWR5IHNldC4gIElmIGEgdmFyaWFibGUgaXMgYWxyZWFkeSBpbiB0aGUgcHJvY2VzcywgdGhlIGAuZW52YCB2YWx1ZSBpcyBpZ25vcmVkLlxuICogfGFsbG93RW1wdHlWYWx1ZXN8ZmFsc2V8QWxsb3dzIGVtcHR5IHZhbHVlcyBmb3Igc3BlY2lmaWVkIGVudiB2YXJpYWJsZXMgKHRocm93cyBvdGhlcndpc2UpXG4gKlxuICogIyMjIEV4YW1wbGUgY29uZmlndXJhdGlvblxuICpcbiAqIEBleGFtcGxlIFVzaW5nIHdpdGggb3B0aW9uc1xuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgbG9hZCB9IGZyb20gXCJAc3RkL2RvdGVudlwiO1xuICpcbiAqIGNvbnN0IGNvbmYgPSBhd2FpdCBsb2FkKHtcbiAqICAgZW52UGF0aDogXCIuLy5lbnZfcHJvZFwiLCAvLyBVc2VzIC5lbnZfcHJvZCBpbnN0ZWFkIG9mIC5lbnZcbiAqICAgZXhhbXBsZVBhdGg6IFwiLi8uZW52X3JlcXVpcmVkXCIsIC8vIFVzZXMgLmVudl9yZXF1aXJlZCBpbnN0ZWFkIG9mIC5lbnYuZXhhbXBsZVxuICogICBleHBvcnQ6IHRydWUsIC8vIEV4cG9ydHMgYWxsIHZhcmlhYmxlcyB0byB0aGUgZW52aXJvbm1lbnRcbiAqICAgYWxsb3dFbXB0eVZhbHVlczogdHJ1ZSwgLy8gQWxsb3dzIGVtcHR5IHZhbHVlcyBmb3Igc3BlY2lmaWVkIGVudiB2YXJpYWJsZXNcbiAqIH0pO1xuICogYGBgXG4gKlxuICogIyMgUGVybWlzc2lvbnNcbiAqXG4gKiBBdCBhIG1pbmltdW0sIGxvYWRpbmcgdGhlIGAuZW52YCByZWxhdGVkIGZpbGVzIHJlcXVpcmVzIHRoZSBgLS1hbGxvdy1yZWFkYCBwZXJtaXNzaW9uLiAgQWRkaXRpb25hbGx5LCBpZlxuICogeW91IGFjY2VzcyB0aGUgcHJvY2VzcyBlbnZpcm9ubWVudCwgZWl0aGVyIHRocm91Z2ggZXhwb3J0aW5nIHlvdXIgY29uZmlndXJhdGlvbiBvciBleHBhbmRpbmcgdmFyaWFibGVzXG4gKiBpbiB5b3VyIGAuZW52YCBmaWxlLCB5b3Ugd2lsbCBuZWVkIHRoZSBgLS1hbGxvdy1lbnZgIHBlcm1pc3Npb24uICBFLmcuXG4gKlxuICogYGBgc2hcbiAqIGRlbm8gcnVuIC0tYWxsb3ctcmVhZD0uZW52LC5lbnYuZGVmYXVsdHMsLmVudi5leGFtcGxlIC0tYWxsb3ctZW52PUVOVjEsRU5WMiBhcHAudHNcbiAqIGBgYFxuICpcbiAqICMjIFBhcnNpbmcgUnVsZXNcbiAqXG4gKiBUaGUgcGFyc2luZyBlbmdpbmUgY3VycmVudGx5IHN1cHBvcnRzIHRoZSBmb2xsb3dpbmcgcnVsZXM6XG4gKlxuICogLSBWYXJpYWJsZXMgdGhhdCBhbHJlYWR5IGV4aXN0IGluIHRoZSBlbnZpcm9ubWVudCBhcmUgbm90IG92ZXJyaWRkZW4gd2l0aFxuICogICBgZXhwb3J0OiB0cnVlYFxuICogLSBgQkFTSUM9YmFzaWNgIGJlY29tZXMgYHsgQkFTSUM6IFwiYmFzaWNcIiB9YFxuICogLSBlbXB0eSBsaW5lcyBhcmUgc2tpcHBlZFxuICogLSBsaW5lcyBiZWdpbm5pbmcgd2l0aCBgI2AgYXJlIHRyZWF0ZWQgYXMgY29tbWVudHNcbiAqIC0gZW1wdHkgdmFsdWVzIGJlY29tZSBlbXB0eSBzdHJpbmdzIChgRU1QVFk9YCBiZWNvbWVzIGB7IEVNUFRZOiBcIlwiIH1gKVxuICogLSBzaW5nbGUgYW5kIGRvdWJsZSBxdW90ZWQgdmFsdWVzIGFyZSBlc2NhcGVkIChgU0lOR0xFX1FVT1RFPSdxdW90ZWQnYCBiZWNvbWVzXG4gKiAgIGB7IFNJTkdMRV9RVU9URTogXCJxdW90ZWRcIiB9YClcbiAqIC0gbmV3IGxpbmVzIGFyZSBleHBhbmRlZCBpbiBkb3VibGUgcXVvdGVkIHZhbHVlcyAoYE1VTFRJTElORT1cIm5ld1xcbmxpbmVcImBcbiAqICAgYmVjb21lc1xuICpcbiAqIGBgYFxuICogeyBNVUxUSUxJTkU6IFwibmV3XFxubGluZVwiIH1cbiAqIGBgYFxuICpcbiAqIC0gaW5uZXIgcXVvdGVzIGFyZSBtYWludGFpbmVkICh0aGluayBKU09OKSAoYEpTT049e1wiZm9vXCI6IFwiYmFyXCJ9YCBiZWNvbWVzXG4gKiAgIGB7IEpTT046IFwie1xcXCJmb29cXFwiOiBcXFwiYmFyXFxcIn1cIiB9YClcbiAqIC0gd2hpdGVzcGFjZSBpcyByZW1vdmVkIGZyb20gYm90aCBlbmRzIG9mIHVucXVvdGVkIHZhbHVlcyAoc2VlIG1vcmUgb25cbiAqICAge0BsaW5rY29kZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TdHJpbmcvVHJpbSB8IHRyaW19KVxuICogICAoYEZPTz0gc29tZSB2YWx1ZWAgYmVjb21lcyBgeyBGT086IFwic29tZSB2YWx1ZVwiIH1gKVxuICogLSB3aGl0ZXNwYWNlIGlzIHByZXNlcnZlZCBvbiBib3RoIGVuZHMgb2YgcXVvdGVkIHZhbHVlcyAoYEZPTz1cIiBzb21lIHZhbHVlIFwiYFxuICogICBiZWNvbWVzIGB7IEZPTzogXCIgc29tZSB2YWx1ZSBcIiB9YClcbiAqIC0gZG9sbGFyIHNpZ24gd2l0aCBhbiBlbnZpcm9ubWVudCBrZXkgaW4gb3Igd2l0aG91dCBjdXJseSBicmFjZXMgaW4gdW5xdW90ZWRcbiAqICAgdmFsdWVzIHdpbGwgZXhwYW5kIHRoZSBlbnZpcm9ubWVudCBrZXkgKGBLRVk9JEtFWWAgb3IgYEtFWT0ke0tFWX1gIGJlY29tZXNcbiAqICAgYHsgS0VZOiBcIjxLRVlfVkFMVUVfRlJPTV9FTlY+XCIgfWApXG4gKiAtIGVzY2FwZWQgZG9sbGFyIHNpZ24gd2l0aCBhbiBlbnZpcm9ubWVudCBrZXkgaW4gdW5xdW90ZWQgdmFsdWVzIHdpbGwgZXNjYXBlIHRoZVxuICogICBlbnZpcm9ubWVudCBrZXkgcmF0aGVyIHRoYW4gZXhwYW5kIChgS0VZPVxcJEtFWWAgYmVjb21lcyBgeyBLRVk6IFwiXFxcXCRLRVlcIiB9YClcbiAqIC0gY29sb24gYW5kIGEgbWludXMgc2lnbiB3aXRoIGEgZGVmYXVsdCB2YWx1ZSh3aGljaCBjYW4gYWxzbyBiZSBhbm90aGVyIGV4cGFuZFxuICogICB2YWx1ZSkgaW4gZXhwYW5kaW5nIGNvbnN0cnVjdGlvbiBpbiB1bnF1b3RlZCB2YWx1ZXMgd2lsbCBmaXJzdCBhdHRlbXB0IHRvXG4gKiAgIGV4cGFuZCB0aGUgZW52aXJvbm1lbnQga2V5LiBJZiBpdOKAmXMgbm90IGZvdW5kLCB0aGVuIGl0IHdpbGwgcmV0dXJuIHRoZSBkZWZhdWx0XG4gKiAgIHZhbHVlIChgS0VZPSR7S0VZOi1kZWZhdWx0fWAgSWYgS0VZIGV4aXN0cyBpdCBiZWNvbWVzXG4gKiAgIGB7IEtFWTogXCI8S0VZX1ZBTFVFX0ZST01fRU5WPlwiIH1gIElmIG5vdCwgdGhlbiBpdCBiZWNvbWVzXG4gKiAgIGB7IEtFWTogXCJkZWZhdWx0XCIgfWAuIEFsc28gdGhlcmUgaXMgcG9zc2libGUgdG8gZG8gdGhpcyBjYXNlXG4gKiAgIGBLRVk9JHtOT19TVUNIX0tFWTotJHtFWElTVElOR19LRVk6LWRlZmF1bHR9fWAgd2hpY2ggYmVjb21lc1xuICogICBgeyBLRVk6IFwiPEVYSVNUSU5HX0tFWV9WQUxVRV9GUk9NX0VOVj5cIiB9YClcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgb3B0aW9uc1xuICogQHJldHVybnMgVGhlIHBhcnNlZCBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWQoXG4gIG9wdGlvbnM6IExvYWRPcHRpb25zID0ge30sXG4pOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHN0cmluZz4+IHtcbiAgY29uc3Qge1xuICAgIGVudlBhdGggPSBcIi5lbnZcIixcbiAgICBleGFtcGxlUGF0aCA9IFwiLmVudi5leGFtcGxlXCIsXG4gICAgZGVmYXVsdHNQYXRoID0gXCIuZW52LmRlZmF1bHRzXCIsXG4gICAgZXhwb3J0OiBfZXhwb3J0ID0gZmFsc2UsXG4gICAgYWxsb3dFbXB0eVZhbHVlcyA9IGZhbHNlLFxuICB9ID0gb3B0aW9ucztcbiAgY29uc3QgY29uZiA9IGVudlBhdGggPyBhd2FpdCBwYXJzZUZpbGUoZW52UGF0aCkgOiB7fTtcblxuICBpZiAoZGVmYXVsdHNQYXRoKSB7XG4gICAgY29uc3QgY29uZkRlZmF1bHRzID0gYXdhaXQgcGFyc2VGaWxlKGRlZmF1bHRzUGF0aCk7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29uZkRlZmF1bHRzKSkge1xuICAgICAgaWYgKCEoa2V5IGluIGNvbmYpKSB7XG4gICAgICAgIGNvbmZba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChleGFtcGxlUGF0aCkge1xuICAgIGNvbnN0IGNvbmZFeGFtcGxlID0gYXdhaXQgcGFyc2VGaWxlKGV4YW1wbGVQYXRoKTtcbiAgICBhc3NlcnRTYWZlKGNvbmYsIGNvbmZFeGFtcGxlLCBhbGxvd0VtcHR5VmFsdWVzKTtcbiAgfVxuXG4gIGlmIChfZXhwb3J0KSB7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29uZikpIHtcbiAgICAgIGlmIChEZW5vLmVudi5nZXQoa2V5KSAhPT0gdW5kZWZpbmVkKSBjb250aW51ZTtcbiAgICAgIERlbm8uZW52LnNldChrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29uZjtcbn1cblxuZnVuY3Rpb24gcGFyc2VGaWxlU3luYyhcbiAgZmlsZXBhdGg6IHN0cmluZyxcbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICB0cnkge1xuICAgIHJldHVybiBwYXJzZShEZW5vLnJlYWRUZXh0RmlsZVN5bmMoZmlsZXBhdGgpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpIHJldHVybiB7fTtcbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHBhcnNlRmlsZShcbiAgZmlsZXBhdGg6IHN0cmluZyxcbik6IFByb21pc2U8UmVjb3JkPHN0cmluZywgc3RyaW5nPj4ge1xuICB0cnkge1xuICAgIHJldHVybiBwYXJzZShhd2FpdCBEZW5vLnJlYWRUZXh0RmlsZShmaWxlcGF0aCkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkgcmV0dXJuIHt9O1xuICAgIHRocm93IGU7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0U2FmZShcbiAgY29uZjogUmVjb3JkPHN0cmluZywgc3RyaW5nPixcbiAgY29uZkV4YW1wbGU6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG4gIGFsbG93RW1wdHlWYWx1ZXM6IGJvb2xlYW4sXG4pIHtcbiAgY29uc3QgbWlzc2luZ0VudlZhcnM6IHN0cmluZ1tdID0gW107XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gY29uZkV4YW1wbGUpIHtcbiAgICBpZiAoa2V5IGluIGNvbmYpIHtcbiAgICAgIGlmICghYWxsb3dFbXB0eVZhbHVlcyAmJiBjb25mW2tleV0gPT09IFwiXCIpIHtcbiAgICAgICAgbWlzc2luZ0VudlZhcnMucHVzaChrZXkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoRGVuby5lbnYuZ2V0KGtleSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCFhbGxvd0VtcHR5VmFsdWVzICYmIERlbm8uZW52LmdldChrZXkpID09PSBcIlwiKSB7XG4gICAgICAgIG1pc3NpbmdFbnZWYXJzLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWlzc2luZ0VudlZhcnMucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChtaXNzaW5nRW52VmFycy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlcyA9IFtcbiAgICAgIGBUaGUgZm9sbG93aW5nIHZhcmlhYmxlcyB3ZXJlIGRlZmluZWQgaW4gdGhlIGV4YW1wbGUgZmlsZSBidXQgYXJlIG5vdCBwcmVzZW50IGluIHRoZSBlbnZpcm9ubWVudDpcXG4gICR7XG4gICAgICAgIG1pc3NpbmdFbnZWYXJzLmpvaW4oXG4gICAgICAgICAgXCIsIFwiLFxuICAgICAgICApXG4gICAgICB9YCxcbiAgICAgIGBNYWtlIHN1cmUgdG8gYWRkIHRoZW0gdG8geW91ciBlbnYgZmlsZS5gLFxuICAgICAgIWFsbG93RW1wdHlWYWx1ZXMgJiZcbiAgICAgIGBJZiB5b3UgZXhwZWN0IGFueSBvZiB0aGVzZSB2YXJpYWJsZXMgdG8gYmUgZW1wdHksIHlvdSBjYW4gc2V0IHRoZSBhbGxvd0VtcHR5VmFsdWVzIG9wdGlvbiB0byB0cnVlLmAsXG4gICAgXTtcblxuICAgIHRocm93IG5ldyBNaXNzaW5nRW52VmFyc0Vycm9yKFxuICAgICAgZXJyb3JNZXNzYWdlcy5maWx0ZXIoQm9vbGVhbikuam9pbihcIlxcblxcblwiKSxcbiAgICAgIG1pc3NpbmdFbnZWYXJzLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBFcnJvciB0aHJvd24gaW4ge0BsaW5rY29kZSBsb2FkfSBhbmQge0BsaW5rY29kZSBsb2FkU3luY30gd2hlbiByZXF1aXJlZFxuICogZW52aXJvbm1lbnQgdmFyaWFibGVzIGFyZSBtaXNzaW5nLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQgeyBNaXNzaW5nRW52VmFyc0Vycm9yLCBsb2FkIH0gZnJvbSBcIkBzdGQvZG90ZW52XCI7XG4gKlxuICogdHJ5IHtcbiAqICAgYXdhaXQgbG9hZCgpO1xuICogfSBjYXRjaCAoZSkge1xuICogICBpZiAoZSBpbnN0YW5jZW9mIE1pc3NpbmdFbnZWYXJzRXJyb3IpIHtcbiAqICAgICBjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgTWlzc2luZ0VudlZhcnNFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgLyoqXG4gICAqIFRoZSBrZXlzIG9mIHRoZSBtaXNzaW5nIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHMgbm8tZXZhbFxuICAgKiBpbXBvcnQgeyBNaXNzaW5nRW52VmFyc0Vycm9yLCBsb2FkIH0gZnJvbSBcIkBzdGQvZG90ZW52XCI7XG4gICAqXG4gICAqIHRyeSB7XG4gICAqICAgYXdhaXQgbG9hZCgpO1xuICAgKiB9IGNhdGNoIChlKSB7XG4gICAqICAgaWYgKGUgaW5zdGFuY2VvZiBNaXNzaW5nRW52VmFyc0Vycm9yKSB7XG4gICAqICAgICBjb25zb2xlLmVycm9yKGUubWlzc2luZyk7XG4gICAqICAgfVxuICAgKiB9XG4gICAqIGBgYFxuICAgKi9cbiAgbWlzc2luZzogc3RyaW5nW107XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgbmV3IGluc3RhbmNlLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0cyBuby1ldmFsXG4gICAqIGltcG9ydCB7IE1pc3NpbmdFbnZWYXJzRXJyb3IsIGxvYWQgfSBmcm9tIFwiQHN0ZC9kb3RlbnZcIjtcbiAgICpcbiAgICogdHJ5IHtcbiAgICogICBhd2FpdCBsb2FkKCk7XG4gICAqIH0gY2F0Y2ggKGUpIHtcbiAgICogICBpZiAoZSBpbnN0YW5jZW9mIE1pc3NpbmdFbnZWYXJzRXJyb3IpIHtcbiAgICogICAgIGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcbiAgICogICB9XG4gICAqIH1cbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlXG4gICAqIEBwYXJhbSBtaXNzaW5nIFRoZSBrZXlzIG9mIHRoZSBtaXNzaW5nIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgKi9cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBtaXNzaW5nOiBzdHJpbmdbXSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiTWlzc2luZ0VudlZhcnNFcnJvclwiO1xuICAgIHRoaXMubWlzc2luZyA9IG1pc3Npbmc7XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIG5ldy50YXJnZXQucHJvdG90eXBlKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLEdBRUQsU0FBUyxLQUFLLFFBQVEsYUFBYTtBQUVuQyxjQUFjLGlCQUFpQjtBQUMvQixjQUFjLGFBQWE7QUFvRDNCOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxTQUNkLFVBQXVCLENBQUMsQ0FBQztFQUV6QixNQUFNLEVBQ0osVUFBVSxNQUFNLEVBQ2hCLGNBQWMsY0FBYyxFQUM1QixlQUFlLGVBQWUsRUFDOUIsUUFBUSxVQUFVLEtBQUssRUFDdkIsbUJBQW1CLEtBQUssRUFDekIsR0FBRztFQUNKLE1BQU0sT0FBTyxVQUFVLGNBQWMsV0FBVyxDQUFDO0VBRWpELElBQUksY0FBYztJQUNoQixNQUFNLGVBQWUsY0FBYztJQUNuQyxLQUFLLE1BQU0sQ0FBQyxLQUFLLE1BQU0sSUFBSSxPQUFPLE9BQU8sQ0FBQyxjQUFlO01BQ3ZELElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxHQUFHO1FBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUc7TUFDZDtJQUNGO0VBQ0Y7RUFFQSxJQUFJLGFBQWE7SUFDZixNQUFNLGNBQWMsY0FBYztJQUNsQyxXQUFXLE1BQU0sYUFBYTtFQUNoQztFQUVBLElB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
// denoCacheMetadata=7215374643889049384,11476389866476606113