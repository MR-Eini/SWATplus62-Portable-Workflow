// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Logging library with the support for terminal and file outputs. Also provides
 * interfaces for building custom loggers.
 *
 * ## Loggers
 *
 * Loggers are objects that you interact with. When you use a logger method it
 * constructs a `LogRecord` and passes it down to its handlers for output. To
 * create custom loggers, specify them in `loggers` when calling `log.setup`.
 *
 * ## Custom message format
 *
 * If you want to override default format of message you can define `formatter`
 * option for handler. It can a function that takes `LogRecord`
 * as argument and outputs string.
 *
 * The default log format is `{levelName} {msg}`.
 *
 * ### Logging Structured JSON Lines
 *
 * To output logs in a structured JSON format you can configure most handlers
 * with a formatter that produces a JSON string. Either use the premade
 * `log.formatters.jsonFormatter` or write your own function that takes a
 * {@linkcode LogRecord} and returns a JSON.stringify'd object.
 * If you want the log to go to stdout then use {@linkcode ConsoleHandler} with
 * the configuration `useColors: false` to turn off the ANSI terminal colours.
 *
 * ```ts
 * import * as log from "@std/log";
 *
 * log.setup({
 *   handlers: {
 *     default: new log.ConsoleHandler("DEBUG", {
 *       formatter: log.formatters.jsonFormatter,
 *       useColors: false,
 *     }),
 *   },
 * });
 * ```
 *
 * The first argument passed to a log function is always treated as the
 * message and will be stringified differently. To have arguments JSON.stringify'd
 * you must pass them after the first.
 *
 * ```ts
 * import * as log from "@std/log";
 *
 * log.info("This is the message", { thisWillBe: "JSON.stringify'd"});
 * // {"level":"INFO","datetime":1702501580505,"message":"This is the message","args":{"thisWillBe":"JSON.stringify'd"}}
 *
 * log.info({ thisWontBe: "JSON.stringify'd"}, "This is an argument");
 * // {"level":"INFO","datetime":1702501580505,"message":"{\"thisWontBe\":\"JSON.stringify'd\"}","args":"This is an argument"}
 * ```
 *
 * ## Inline Logging
 *
 * Log functions return the data passed in the `msg` parameter. Data is returned
 * regardless if the logger actually logs it.
 *
 * ## Lazy Log Evaluation
 *
 * Some log statements are expensive to compute. In these cases, you can use
 * lazy log evaluation to prevent the computation taking place if the logger
 * won't log the message.
 *
 * > NOTE: When using lazy log evaluation, `undefined` will be returned if the
 * > resolver function is not called because the logger won't log it. It is an
 * > antipattern use lazy evaluation with inline logging because the return value
 * > depends on the current log level.
 *
 * ## For module authors
 *
 * The authors of public modules can let the users display the internal logs of the
 * module by using a custom logger:
 *
 * ```ts
 * import { getLogger } from "@std/log";
 *
 * function logger() {
 *   return getLogger("my-awesome-module");
 * }
 *
 * export function sum(a: number, b: number) {
 *   logger().debug(`running ${a} + ${b}`);
 *   return a + b;
 * }
 *
 * export function mult(a: number, b: number) {
 *   logger().debug(`running ${a} * ${b}`);
 *   return a * b;
 * }
 * ```
 *
 * The user of the module can then display the internal logs with:
 *
 * ```ts, ignore
 * import * as log from "@std/log";
 * import { sum } from "<the-awesome-module>/mod.ts";
 *
 * log.setup({
 *   handlers: {
 *     console: new log.ConsoleHandler("DEBUG"),
 *   },
 *
 *   loggers: {
 *     "my-awesome-module": {
 *       level: "DEBUG",
 *       handlers: ["console"],
 *     },
 *   },
 * });
 *
 * sum(1, 2); // prints "running 1 + 2" to the console
 * ```
 *
 * Please note that, due to the order of initialization of the loggers, the
 * following won't work:
 *
 * ```ts
 * import { getLogger } from "@std/log";
 *
 * const logger = getLogger("my-awesome-module");
 *
 * export function sum(a: number, b: number) {
 *   logger.debug(`running ${a} + ${b}`); // no message will be logged, because getLogger() was called before log.setup()
 *   return a + b;
 * }
 * ```
 *
 * @example
 * ```ts
 * import * as log from "@std/log";
 *
 * // Simple default logger out of the box. You can customize it
 * // by overriding logger and handler named "default", or providing
 * // additional logger configurations. You can log any data type.
 * log.debug("Hello world");
 * log.info(123456);
 * log.warn(true);
 * log.error({ foo: "bar", fizz: "bazz" });
 * log.critical("500 Internal server error");
 *
 * // custom configuration with 2 loggers (the default and `tasks` loggers).
 * log.setup({
 *   handlers: {
 *     console: new log.ConsoleHandler("DEBUG"),
 *
 *     file: new log.FileHandler("WARN", {
 *       filename: "./log.txt",
 *       // you can change format of output message using any keys in `LogRecord`.
 *       formatter: (record) => `${record.levelName} ${record.msg}`,
 *     }),
 *   },
 *
 *   loggers: {
 *     // configure default logger available via short-hand methods above.
 *     default: {
 *       level: "DEBUG",
 *       handlers: ["console", "file"],
 *     },
 *
 *     tasks: {
 *       level: "ERROR",
 *       handlers: ["console"],
 *     },
 *   },
 * });
 *
 * let logger;
 *
 * // get default logger.
 * logger = log.getLogger();
 * logger.debug("fizz"); // logs to `console`, because `file` handler requires "WARN" level.
 * logger.warn(41256); // logs to both `console` and `file` handlers.
 *
 * // get custom logger
 * logger = log.getLogger("tasks");
 * logger.debug("fizz"); // won't get output because this logger has "ERROR" level.
 * logger.error({ productType: "book", value: "126.11" }); // log to `console`.
 *
 * // if you try to use a logger that hasn't been configured
 * // you're good to go, it gets created automatically with level set to 0
 * // so no message is logged.
 * const unknownLogger = log.getLogger("mystery");
 * unknownLogger.info("foobar"); // no-op
 * ```
 *
 * @example
 * Custom message format example
 * ```ts
 * import * as log from "@std/log";
 *
 * log.setup({
 *   handlers: {
 *     stringFmt: new log.ConsoleHandler("DEBUG", {
 *       formatter: (record) => `[${record.levelName}] ${record.msg}`,
 *     }),
 *
 *     functionFmt: new log.ConsoleHandler("DEBUG", {
 *       formatter: (logRecord) => {
 *         let msg = `${logRecord.level} ${logRecord.msg}`;
 *
 *         logRecord.args.forEach((arg, index) => {
 *           msg += `, arg${index}: ${arg}`;
 *         });
 *
 *         return msg;
 *       },
 *     }),
 *
 *     anotherFmt: new log.ConsoleHandler("DEBUG", {
 *       formatter: (record) => `[${record.loggerName}] - ${record.levelName} ${record.msg}`,
 *     }),
 *   },
 *
 *   loggers: {
 *     default: {
 *       level: "DEBUG",
 *       handlers: ["stringFmt", "functionFmt"],
 *     },
 *     dataLogger: {
 *       level: "INFO",
 *       handlers: ["anotherFmt"],
 *     },
 *   },
 * });
 *
 * // calling:
 * log.debug("Hello, world!", 1, "two", [3, 4, 5]);
 * // results in: [DEBUG] Hello, world!
 * // output from "stringFmt" handler.
 * // 10 Hello, world!, arg0: 1, arg1: two, arg3: [3, 4, 5] // output from "functionFmt" formatter.
 *
 * // calling:
 * log.getLogger("dataLogger").error("oh no!");
 * // results in:
 * // [dataLogger] - ERROR oh no! // output from anotherFmt handler.
 * ```

 *
 * @example
 * JSON to stdout with no color example
 * ```ts
 * import * as log from "@std/log";
 *
 * log.setup({
 *   handlers: {
 *     jsonStdout: new log.ConsoleHandler("DEBUG", {
 *       formatter: log.formatters.jsonFormatter,
 *       useColors: false,
 *     }),
 *   },
 *
 *   loggers: {
 *     default: {
 *       level: "DEBUG",
 *       handlers: ["jsonStdout"],
 *     },
 *   },
 * });
 *
 * // calling:
 * log.info("Hey");
 * // results in:
 * // {"level":"INFO","datetime":1702481922294,"message":"Hey"}
 *
 * // calling:
 * log.info("Hey", { product: "nail" });
 * // results in:
 * // {"level":"INFO","datetime":1702484111115,"message":"Hey","args":{"product":"nail"}}
 *
 * // calling:
 * log.info("Hey", 1, "two", [3, 4, 5]);
 * // results in:
 * // {"level":"INFO","datetime":1702481922294,"message":"Hey","args":[1,"two",[3,4,5]]}
 * ```
 *
 * @example
 * Custom JSON example
 * ```ts
 * import * as log from "@std/log";
 *
 * log.setup({
 *   handlers: {
 *     customJsonFmt: new log.ConsoleHandler("DEBUG", {
 *       formatter: (record) => JSON.stringify({
 *         lvl: record.level,
 *         msg: record.msg,
 *         time: record.datetime.toISOString(),
 *         name: record.loggerName,
 *       }),
 *       useColors: false,
 *     }),
 *   },
 *
 *   loggers: {
 *     default: {
 *       level: "DEBUG",
 *       handlers: ["customJsonFmt"],
 *     },
 *   },
 * });
 *
 * // calling:
 * log.info("complete");
 * // results in:
 * // {"lvl":20,"msg":"complete","time":"2023-12-13T16:38:27.328Z","name":"default"}
 * ```
 *
 * @example
 * Inline Logging
 * ```ts
 * import * as logger from "@std/log";
 *
 * const stringData: string = logger.debug("hello world");
 * const booleanData: boolean = logger.debug(true, 1, "abc");
 * const fn = (): number => {
 *   return 123;
 * };
 * const resolvedFunctionData: number = logger.debug(fn());
 * console.log(stringData); // 'hello world'
 * console.log(booleanData); // true
 * console.log(resolvedFunctionData); // 123
 * ```
 *
 * @example
 * Lazy Log Evaluation
 * ```ts
 * import * as log from "@std/log";
 *
 * log.setup({
 *   handlers: {
 *     console: new log.ConsoleHandler("DEBUG"),
 *   },
 *
 *   loggers: {
 *     tasks: {
 *       level: "ERROR",
 *       handlers: ["console"],
 *     },
 *   },
 * });
 *
 * function someExpensiveFn(num: number, bool: boolean) {
 *   // do some expensive computation
 * }
 *
 * // not logged, as debug < error.
 * const data = log.debug(() => someExpensiveFn(5, true));
 * console.log(data); // undefined
 * ```
 *
 * Handlers are responsible for actual output of log messages. When a handler is
 * called by a logger, it firstly checks that {@linkcode LogRecord}'s level is
 * not lower than level of the handler. If level check passes, handlers formats
 * log record into string and outputs it to target.
 *
 * ## Custom handlers
 *
 * Custom handlers can be implemented by subclassing {@linkcode BaseHandler} or
 * {@linkcode WriterHandler}.
 *
 * {@linkcode BaseHandler} is bare-bones handler that has no output logic at all,
 *
 * {@linkcode WriterHandler} is an abstract class that supports any target with
 * `Writer` interface.
 *
 * During setup async hooks `setup` and `destroy` are called, you can use them
 * to open and close file/HTTP connection or any other action you might need.
 *
 * For examples check source code of {@linkcode FileHandler}`
 * and {@linkcode TestHandler}.
 *
 * @module
 */ export * from "./base_handler.ts";
export * from "./console_handler.ts";
export * from "./file_handler.ts";
export * from "./rotating_file_handler.ts";
export * from "./levels.ts";
export * from "./logger.ts";
export * from "./formatters.ts";
export * from "./critical.ts";
export * from "./debug.ts";
export * from "./error.ts";
export * from "./get_logger.ts";
export * from "./info.ts";
export * from "./setup.ts";
export * from "./warn.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbG9nLzAuMjI0LjcvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbi8qKlxuICogTG9nZ2luZyBsaWJyYXJ5IHdpdGggdGhlIHN1cHBvcnQgZm9yIHRlcm1pbmFsIGFuZCBmaWxlIG91dHB1dHMuIEFsc28gcHJvdmlkZXNcbiAqIGludGVyZmFjZXMgZm9yIGJ1aWxkaW5nIGN1c3RvbSBsb2dnZXJzLlxuICpcbiAqICMjIExvZ2dlcnNcbiAqXG4gKiBMb2dnZXJzIGFyZSBvYmplY3RzIHRoYXQgeW91IGludGVyYWN0IHdpdGguIFdoZW4geW91IHVzZSBhIGxvZ2dlciBtZXRob2QgaXRcbiAqIGNvbnN0cnVjdHMgYSBgTG9nUmVjb3JkYCBhbmQgcGFzc2VzIGl0IGRvd24gdG8gaXRzIGhhbmRsZXJzIGZvciBvdXRwdXQuIFRvXG4gKiBjcmVhdGUgY3VzdG9tIGxvZ2dlcnMsIHNwZWNpZnkgdGhlbSBpbiBgbG9nZ2Vyc2Agd2hlbiBjYWxsaW5nIGBsb2cuc2V0dXBgLlxuICpcbiAqICMjIEN1c3RvbSBtZXNzYWdlIGZvcm1hdFxuICpcbiAqIElmIHlvdSB3YW50IHRvIG92ZXJyaWRlIGRlZmF1bHQgZm9ybWF0IG9mIG1lc3NhZ2UgeW91IGNhbiBkZWZpbmUgYGZvcm1hdHRlcmBcbiAqIG9wdGlvbiBmb3IgaGFuZGxlci4gSXQgY2FuIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBgTG9nUmVjb3JkYFxuICogYXMgYXJndW1lbnQgYW5kIG91dHB1dHMgc3RyaW5nLlxuICpcbiAqIFRoZSBkZWZhdWx0IGxvZyBmb3JtYXQgaXMgYHtsZXZlbE5hbWV9IHttc2d9YC5cbiAqXG4gKiAjIyMgTG9nZ2luZyBTdHJ1Y3R1cmVkIEpTT04gTGluZXNcbiAqXG4gKiBUbyBvdXRwdXQgbG9ncyBpbiBhIHN0cnVjdHVyZWQgSlNPTiBmb3JtYXQgeW91IGNhbiBjb25maWd1cmUgbW9zdCBoYW5kbGVyc1xuICogd2l0aCBhIGZvcm1hdHRlciB0aGF0IHByb2R1Y2VzIGEgSlNPTiBzdHJpbmcuIEVpdGhlciB1c2UgdGhlIHByZW1hZGVcbiAqIGBsb2cuZm9ybWF0dGVycy5qc29uRm9ybWF0dGVyYCBvciB3cml0ZSB5b3VyIG93biBmdW5jdGlvbiB0aGF0IHRha2VzIGFcbiAqIHtAbGlua2NvZGUgTG9nUmVjb3JkfSBhbmQgcmV0dXJucyBhIEpTT04uc3RyaW5naWZ5J2Qgb2JqZWN0LlxuICogSWYgeW91IHdhbnQgdGhlIGxvZyB0byBnbyB0byBzdGRvdXQgdGhlbiB1c2Uge0BsaW5rY29kZSBDb25zb2xlSGFuZGxlcn0gd2l0aFxuICogdGhlIGNvbmZpZ3VyYXRpb24gYHVzZUNvbG9yczogZmFsc2VgIHRvIHR1cm4gb2ZmIHRoZSBBTlNJIHRlcm1pbmFsIGNvbG91cnMuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCAqIGFzIGxvZyBmcm9tIFwiQHN0ZC9sb2dcIjtcbiAqXG4gKiBsb2cuc2V0dXAoe1xuICogICBoYW5kbGVyczoge1xuICogICAgIGRlZmF1bHQ6IG5ldyBsb2cuQ29uc29sZUhhbmRsZXIoXCJERUJVR1wiLCB7XG4gKiAgICAgICBmb3JtYXR0ZXI6IGxvZy5mb3JtYXR0ZXJzLmpzb25Gb3JtYXR0ZXIsXG4gKiAgICAgICB1c2VDb2xvcnM6IGZhbHNlLFxuICogICAgIH0pLFxuICogICB9LFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBUaGUgZmlyc3QgYXJndW1lbnQgcGFzc2VkIHRvIGEgbG9nIGZ1bmN0aW9uIGlzIGFsd2F5cyB0cmVhdGVkIGFzIHRoZVxuICogbWVzc2FnZSBhbmQgd2lsbCBiZSBzdHJpbmdpZmllZCBkaWZmZXJlbnRseS4gVG8gaGF2ZSBhcmd1bWVudHMgSlNPTi5zdHJpbmdpZnknZFxuICogeW91IG11c3QgcGFzcyB0aGVtIGFmdGVyIHRoZSBmaXJzdC5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0ICogYXMgbG9nIGZyb20gXCJAc3RkL2xvZ1wiO1xuICpcbiAqIGxvZy5pbmZvKFwiVGhpcyBpcyB0aGUgbWVzc2FnZVwiLCB7IHRoaXNXaWxsQmU6IFwiSlNPTi5zdHJpbmdpZnknZFwifSk7XG4gKiAvLyB7XCJsZXZlbFwiOlwiSU5GT1wiLFwiZGF0ZXRpbWVcIjoxNzAyNTAxNTgwNTA1LFwibWVzc2FnZVwiOlwiVGhpcyBpcyB0aGUgbWVzc2FnZVwiLFwiYXJnc1wiOntcInRoaXNXaWxsQmVcIjpcIkpTT04uc3RyaW5naWZ5J2RcIn19XG4gKlxuICogbG9nLmluZm8oeyB0aGlzV29udEJlOiBcIkpTT04uc3RyaW5naWZ5J2RcIn0sIFwiVGhpcyBpcyBhbiBhcmd1bWVudFwiKTtcbiAqIC8vIHtcImxldmVsXCI6XCJJTkZPXCIsXCJkYXRldGltZVwiOjE3MDI1MDE1ODA1MDUsXCJtZXNzYWdlXCI6XCJ7XFxcInRoaXNXb250QmVcXFwiOlxcXCJKU09OLnN0cmluZ2lmeSdkXFxcIn1cIixcImFyZ3NcIjpcIlRoaXMgaXMgYW4gYXJndW1lbnRcIn1cbiAqIGBgYFxuICpcbiAqICMjIElubGluZSBMb2dnaW5nXG4gKlxuICogTG9nIGZ1bmN0aW9ucyByZXR1cm4gdGhlIGRhdGEgcGFzc2VkIGluIHRoZSBgbXNnYCBwYXJhbWV0ZXIuIERhdGEgaXMgcmV0dXJuZWRcbiAqIHJlZ2FyZGxlc3MgaWYgdGhlIGxvZ2dlciBhY3R1YWxseSBsb2dzIGl0LlxuICpcbiAqICMjIExhenkgTG9nIEV2YWx1YXRpb25cbiAqXG4gKiBTb21lIGxvZyBzdGF0ZW1lbnRzIGFyZSBleHBlbnNpdmUgdG8gY29tcHV0ZS4gSW4gdGhlc2UgY2FzZXMsIHlvdSBjYW4gdXNlXG4gKiBsYXp5IGxvZyBldmFsdWF0aW9uIHRvIHByZXZlbnQgdGhlIGNvbXB1dGF0aW9uIHRha2luZyBwbGFjZSBpZiB0aGUgbG9nZ2VyXG4gKiB3b24ndCBsb2cgdGhlIG1lc3NhZ2UuXG4gKlxuICogPiBOT1RFOiBXaGVuIHVzaW5nIGxhenkgbG9nIGV2YWx1YXRpb24sIGB1bmRlZmluZWRgIHdpbGwgYmUgcmV0dXJuZWQgaWYgdGhlXG4gKiA+IHJlc29sdmVyIGZ1bmN0aW9uIGlzIG5vdCBjYWxsZWQgYmVjYXVzZSB0aGUgbG9nZ2VyIHdvbid0IGxvZyBpdC4gSXQgaXMgYW5cbiAqID4gYW50aXBhdHRlcm4gdXNlIGxhenkgZXZhbHVhdGlvbiB3aXRoIGlubGluZSBsb2dnaW5nIGJlY2F1c2UgdGhlIHJldHVybiB2YWx1ZVxuICogPiBkZXBlbmRzIG9uIHRoZSBjdXJyZW50IGxvZyBsZXZlbC5cbiAqXG4gKiAjIyBGb3IgbW9kdWxlIGF1dGhvcnNcbiAqXG4gKiBUaGUgYXV0aG9ycyBvZiBwdWJsaWMgbW9kdWxlcyBjYW4gbGV0IHRoZSB1c2VycyBkaXNwbGF5IHRoZSBpbnRlcm5hbCBsb2dzIG9mIHRoZVxuICogbW9kdWxlIGJ5IHVzaW5nIGEgY3VzdG9tIGxvZ2dlcjpcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZ2V0TG9nZ2VyIH0gZnJvbSBcIkBzdGQvbG9nXCI7XG4gKlxuICogZnVuY3Rpb24gbG9nZ2VyKCkge1xuICogICByZXR1cm4gZ2V0TG9nZ2VyKFwibXktYXdlc29tZS1tb2R1bGVcIik7XG4gKiB9XG4gKlxuICogZXhwb3J0IGZ1bmN0aW9uIHN1bShhOiBudW1iZXIsIGI6IG51bWJlcikge1xuICogICBsb2dnZXIoKS5kZWJ1ZyhgcnVubmluZyAke2F9ICsgJHtifWApO1xuICogICByZXR1cm4gYSArIGI7XG4gKiB9XG4gKlxuICogZXhwb3J0IGZ1bmN0aW9uIG11bHQoYTogbnVtYmVyLCBiOiBudW1iZXIpIHtcbiAqICAgbG9nZ2VyKCkuZGVidWcoYHJ1bm5pbmcgJHthfSAqICR7Yn1gKTtcbiAqICAgcmV0dXJuIGEgKiBiO1xuICogfVxuICogYGBgXG4gKlxuICogVGhlIHVzZXIgb2YgdGhlIG1vZHVsZSBjYW4gdGhlbiBkaXNwbGF5IHRoZSBpbnRlcm5hbCBsb2dzIHdpdGg6XG4gKlxuICogYGBgdHMsIGlnbm9yZVxuICogaW1wb3J0ICogYXMgbG9nIGZyb20gXCJAc3RkL2xvZ1wiO1xuICogaW1wb3J0IHsgc3VtIH0gZnJvbSBcIjx0aGUtYXdlc29tZS1tb2R1bGU+L21vZC50c1wiO1xuICpcbiAqIGxvZy5zZXR1cCh7XG4gKiAgIGhhbmRsZXJzOiB7XG4gKiAgICAgY29uc29sZTogbmV3IGxvZy5Db25zb2xlSGFuZGxlcihcIkRFQlVHXCIpLFxuICogICB9LFxuICpcbiAqICAgbG9nZ2Vyczoge1xuICogICAgIFwibXktYXdlc29tZS1tb2R1bGVcIjoge1xuICogICAgICAgbGV2ZWw6IFwiREVCVUdcIixcbiAqICAgICAgIGhhbmRsZXJzOiBbXCJjb25zb2xlXCJdLFxuICogICAgIH0sXG4gKiAgIH0sXG4gKiB9KTtcbiAqXG4gKiBzdW0oMSwgMik7IC8vIHByaW50cyBcInJ1bm5pbmcgMSArIDJcIiB0byB0aGUgY29uc29sZVxuICogYGBgXG4gKlxuICogUGxlYXNlIG5vdGUgdGhhdCwgZHVlIHRvIHRoZSBvcmRlciBvZiBpbml0aWFsaXphdGlvbiBvZiB0aGUgbG9nZ2VycywgdGhlXG4gKiBmb2xsb3dpbmcgd29uJ3Qgd29yazpcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZ2V0TG9nZ2VyIH0gZnJvbSBcIkBzdGQvbG9nXCI7XG4gKlxuICogY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKFwibXktYXdlc29tZS1tb2R1bGVcIik7XG4gKlxuICogZXhwb3J0IGZ1bmN0aW9uIHN1bShhOiBudW1iZXIsIGI6IG51bWJlcikge1xuICogICBsb2dnZXIuZGVidWcoYHJ1bm5pbmcgJHthfSArICR7Yn1gKTsgLy8gbm8gbWVzc2FnZSB3aWxsIGJlIGxvZ2dlZCwgYmVjYXVzZSBnZXRMb2dnZXIoKSB3YXMgY2FsbGVkIGJlZm9yZSBsb2cuc2V0dXAoKVxuICogICByZXR1cm4gYSArIGI7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCAqIGFzIGxvZyBmcm9tIFwiQHN0ZC9sb2dcIjtcbiAqXG4gKiAvLyBTaW1wbGUgZGVmYXVsdCBsb2dnZXIgb3V0IG9mIHRoZSBib3guIFlvdSBjYW4gY3VzdG9taXplIGl0XG4gKiAvLyBieSBvdmVycmlkaW5nIGxvZ2dlciBhbmQgaGFuZGxlciBuYW1lZCBcImRlZmF1bHRcIiwgb3IgcHJvdmlkaW5nXG4gKiAvLyBhZGRpdGlvbmFsIGxvZ2dlciBjb25maWd1cmF0aW9ucy4gWW91IGNhbiBsb2cgYW55IGRhdGEgdHlwZS5cbiAqIGxvZy5kZWJ1ZyhcIkhlbGxvIHdvcmxkXCIpO1xuICogbG9nLmluZm8oMTIzNDU2KTtcbiAqIGxvZy53YXJuKHRydWUpO1xuICogbG9nLmVycm9yKHsgZm9vOiBcImJhclwiLCBmaXp6OiBcImJhenpcIiB9KTtcbiAqIGxvZy5jcml0aWNhbChcIjUwMCBJbnRlcm5hbCBzZXJ2ZXIgZXJyb3JcIik7XG4gKlxuICogLy8gY3VzdG9tIGNvbmZpZ3VyYXRpb24gd2l0aCAyIGxvZ2dlcnMgKHRoZSBkZWZhdWx0IGFuZCBgdGFza3NgIGxvZ2dlcnMpLlxuICogbG9nLnNldHVwKHtcbiAqICAgaGFuZGxlcnM6IHtcbiAqICAgICBjb25zb2xlOiBuZXcgbG9nLkNvbnNvbGVIYW5kbGVyKFwiREVCVUdcIiksXG4gKlxuICogICAgIGZpbGU6IG5ldyBsb2cuRmlsZUhhbmRsZXIoXCJXQVJOXCIsIHtcbiAqICAgICAgIGZpbGVuYW1lOiBcIi4vbG9nLnR4dFwiLFxuICogICAgICAgLy8geW91IGNhbiBjaGFuZ2UgZm9ybWF0IG9mIG91dHB1dCBtZXNzYWdlIHVzaW5nIGFueSBrZXlzIGluIGBMb2dSZWNvcmRgLlxuICogICAgICAgZm9ybWF0dGVyOiAocmVjb3JkKSA9PiBgJHtyZWNvcmQubGV2ZWxOYW1lfSAke3JlY29yZC5tc2d9YCxcbiAqICAgICB9KSxcbiAqICAgfSxcbiAqXG4gKiAgIGxvZ2dlcnM6IHtcbiAqICAgICAvLyBjb25maWd1cmUgZGVmYXVsdCBsb2dnZXIgYXZhaWxhYmxlIHZpYSBzaG9ydC1oYW5kIG1ldGhvZHMgYWJvdmUuXG4gKiAgICAgZGVmYXVsdDoge1xuICogICAgICAgbGV2ZWw6IFwiREVCVUdcIixcbiAqICAgICAgIGhhbmRsZXJzOiBbXCJjb25zb2xlXCIsIFwiZmlsZVwiXSxcbiAqICAgICB9LFxuICpcbiAqICAgICB0YXNrczoge1xuICogICAgICAgbGV2ZWw6IFwiRVJST1JcIixcbiAqICAgICAgIGhhbmRsZXJzOiBbXCJjb25zb2xlXCJdLFxuICogICAgIH0sXG4gKiAgIH0sXG4gKiB9KTtcbiAqXG4gKiBsZXQgbG9nZ2VyO1xuICpcbiAqIC8vIGdldCBkZWZhdWx0IGxvZ2dlci5cbiAqIGxvZ2dlciA9IGxvZy5nZXRMb2dnZXIoKTtcbiAqIGxvZ2dlci5kZWJ1ZyhcImZpenpcIik7IC8vIGxvZ3MgdG8gYGNvbnNvbGVgLCBiZWNhdXNlIGBmaWxlYCBoYW5kbGVyIHJlcXVpcmVzIFwiV0FSTlwiIGxldmVsLlxuICogbG9nZ2VyLndhcm4oNDEyNTYpOyAvLyBsb2dzIHRvIGJvdGggYGNvbnNvbGVgIGFuZCBgZmlsZWAgaGFuZGxlcnMuXG4gKlxuICogLy8gZ2V0IGN1c3RvbSBsb2dnZXJcbiAqIGxvZ2dlciA9IGxvZy5nZXRMb2dnZXIoXCJ0YXNrc1wiKTtcbiAqIGxvZ2dlci5kZWJ1ZyhcImZpenpcIik7IC8vIHdvbid0IGdldCBvdXRwdXQgYmVjYXVzZSB0aGlzIGxvZ2dlciBoYXMgXCJFUlJPUlwiIGxldmVsLlxuICogbG9nZ2VyLmVycm9yKHsgcHJvZHVjdFR5cGU6IFwiYm9va1wiLCB2YWx1ZTogXCIxMjYuMTFcIiB9KTsgLy8gbG9nIHRvIGBjb25zb2xlYC5cbiAqXG4gKiAvLyBpZiB5b3UgdHJ5IHRvIHVzZSBhIGxvZ2dlciB0aGF0IGhhc24ndCBiZWVuIGNvbmZpZ3VyZWRcbiAqIC8vIHlvdSdyZSBnb29kIHRvIGdvLCBpdCBnZXRzIGNyZWF0ZWQgYXV0b21hdGljYWxseSB3aXRoIGxldmVsIHNldCB0byAwXG4gKiAvLyBzbyBubyBtZXNzYWdlIGlzIGxvZ2dlZC5cbiAqIGNvbnN0IHVua25vd25Mb2dnZXIgPSBsb2cuZ2V0TG9nZ2VyKFwibXlzdGVyeVwiKTtcbiAqIHVua25vd25Mb2dnZXIuaW5mbyhcImZvb2JhclwiKTsgLy8gbm8tb3BcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlXG4gKiBDdXN0b20gbWVzc2FnZSBmb3JtYXQgZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCAqIGFzIGxvZyBmcm9tIFwiQHN0ZC9sb2dcIjtcbiAqXG4gKiBsb2cuc2V0dXAoe1xuICogICBoYW5kbGVyczoge1xuICogICAgIHN0cmluZ0ZtdDogbmV3IGxvZy5Db25zb2xlSGFuZGxlcihcIkRFQlVHXCIsIHtcbiAqICAgICAgIGZvcm1hdHRlcjogKHJlY29yZCkgPT4gYFske3JlY29yZC5sZXZlbE5hbWV9XSAke3JlY29yZC5tc2d9YCxcbiAqICAgICB9KSxcbiAqXG4gKiAgICAgZnVuY3Rpb25GbXQ6IG5ldyBsb2cuQ29uc29sZUhhbmRsZXIoXCJERUJVR1wiLCB7XG4gKiAgICAgICBmb3JtYXR0ZXI6IChsb2dSZWNvcmQpID0+IHtcbiAqICAgICAgICAgbGV0IG1zZyA9IGAke2xvZ1JlY29yZC5sZXZlbH0gJHtsb2dSZWNvcmQubXNnfWA7XG4gKlxuICogICAgICAgICBsb2dSZWNvcmQuYXJncy5mb3JFYWNoKChhcmcsIGluZGV4KSA9PiB7XG4gKiAgICAgICAgICAgbXNnICs9IGAsIGFyZyR7aW5kZXh9OiAke2FyZ31gO1xuICogICAgICAgICB9KTtcbiAqXG4gKiAgICAgICAgIHJldHVybiBtc2c7XG4gKiAgICAgICB9LFxuICogICAgIH0pLFxuICpcbiAqICAgICBhbm90aGVyRm10OiBuZXcgbG9nLkNvbnNvbGVIYW5kbGVyKFwiREVCVUdcIiwge1xuICogICAgICAgZm9ybWF0dGVyOiAocmVjb3JkKSA9PiBgWyR7cmVjb3JkLmxvZ2dlck5hbWV9XSAtICR7cmVjb3JkLmxldmVsTmFtZX0gJHtyZWNvcmQubXNnfWAsXG4gKiAgICAgfSksXG4gKiAgIH0sXG4gKlxuICogICBsb2dnZXJzOiB7XG4gKiAgICAgZGVmYXVsdDoge1xuICogICAgICAgbGV2ZWw6IFwiREVCVUdcIixcbiAqICAgICAgIGhhbmRsZXJzOiBbXCJzdHJpbmdGbXRcIiwgXCJmdW5jdGlvbkZtdFwiXSxcbiAqICAgICB9LFxuICogICAgIGRhdGFMb2dnZXI6IHtcbiAqICAgICAgIGxldmVsOiBcIklORk9cIixcbiAqICAgICAgIGhhbmRsZXJzOiBbXCJhbm90aGVyRm10XCJdLFxuICogICAgIH0sXG4gKiAgIH0sXG4gKiB9KTtcbiAqXG4gKiAvLyBjYWxsaW5nOlxuICogbG9nLmRlYnVnKFwiSGVsbG8sIHdvcmxkIVwiLCAxLCBcInR3b1wiLCBbMywgNCwgNV0pO1xuICogLy8gcmVzdWx0cyBpbjogW0RFQlVHXSBIZWxsbywgd29ybGQhXG4gKiAvLyBvdXRwdXQgZnJvbSBcInN0cmluZ0ZtdFwiIGhhbmRsZXIuXG4gKiAvLyAxMCBIZWxsbywgd29ybGQhLCBhcmcwOiAxLCBhcmcxOiB0d28sIGFyZzM6IFszLCA0LCA1XSAvLyBvdXRwdXQgZnJvbSBcImZ1bmN0aW9uRm10XCIgZm9ybWF0dGVyLlxuICpcbiAqIC8vIGNhbGxpbmc6XG4gKiBsb2cuZ2V0TG9nZ2VyKFwiZGF0YUxvZ2dlclwiKS5lcnJvcihcIm9oIG5vIVwiKTtcbiAqIC8vIHJlc3VsdHMgaW46XG4gKiAvLyBbZGF0YUxvZ2dlcl0gLSBFUlJPUiBvaCBubyEgLy8gb3V0cHV0IGZyb20gYW5vdGhlckZtdCBoYW5kbGVyLlxuICogYGBgXG5cbiAqXG4gKiBAZXhhbXBsZVxuICogSlNPTiB0byBzdGRvdXQgd2l0aCBubyBjb2xvciBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0ICogYXMgbG9nIGZyb20gXCJAc3RkL2xvZ1wiO1xuICpcbiAqIGxvZy5zZXR1cCh7XG4gKiAgIGhhbmRsZXJzOiB7XG4gKiAgICAganNvblN0ZG91dDogbmV3IGxvZy5Db25zb2xlSGFuZGxlcihcIkRFQlVHXCIsIHtcbiAqICAgICAgIGZvcm1hdHRlcjogbG9nLmZvcm1hdHRlcnMuanNvbkZvcm1hdHRlcixcbiAqICAgICAgIHVzZUNvbG9yczogZmFsc2UsXG4gKiAgICAgfSksXG4gKiAgIH0sXG4gKlxuICogICBsb2dnZXJzOiB7XG4gKiAgICAgZGVmYXVsdDoge1xuICogICAgICAgbGV2ZWw6IFwiREVCVUdcIixcbiAqICAgICAgIGhhbmRsZXJzOiBbXCJqc29uU3Rkb3V0XCJdLFxuICogICAgIH0sXG4gKiAgIH0sXG4gKiB9KTtcbiAqXG4gKiAvLyBjYWxsaW5nOlxuICogbG9nLmluZm8oXCJIZXlcIik7XG4gKiAvLyByZXN1bHRzIGluOlxuICogLy8ge1wibGV2ZWxcIjpcIklORk9cIixcImRhdGV0aW1lXCI6MTcwMjQ4MTkyMjI5NCxcIm1lc3NhZ2VcIjpcIkhleVwifVxuICpcbiAqIC8vIGNhbGxpbmc6XG4gKiBsb2cuaW5mbyhcIkhleVwiLCB7IHByb2R1Y3Q6IFwibmFpbFwiIH0pO1xuICogLy8gcmVzdWx0cyBpbjpcbiAqIC8vIHtcImxldmVsXCI6XCJJTkZPXCIsXCJkYXRldGltZVwiOjE3MDI0ODQxMTExMTUsXCJtZXNzYWdlXCI6XCJIZXlcIixcImFyZ3NcIjp7XCJwcm9kdWN0XCI6XCJuYWlsXCJ9fVxuICpcbiAqIC8vIGNhbGxpbmc6XG4gKiBsb2cuaW5mbyhcIkhleVwiLCAxLCBcInR3b1wiLCBbMywgNCwgNV0pO1xuICogLy8gcmVzdWx0cyBpbjpcbiAqIC8vIHtcImxldmVsXCI6XCJJTkZPXCIsXCJkYXRldGltZVwiOjE3MDI0ODE5MjIyOTQsXCJtZXNzYWdlXCI6XCJIZXlcIixcImFyZ3NcIjpbMSxcInR3b1wiLFszLDQsNV1dfVxuICogYGBgXG4gKlxuICogQGV4YW1wbGVcbiAqIEN1c3RvbSBKU09OIGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgKiBhcyBsb2cgZnJvbSBcIkBzdGQvbG9nXCI7XG4gKlxuICogbG9nLnNldHVwKHtcbiAqICAgaGFuZGxlcnM6IHtcbiAqICAgICBjdXN0b21Kc29uRm10OiBuZXcgbG9nLkNvbnNvbGVIYW5kbGVyKFwiREVCVUdcIiwge1xuICogICAgICAgZm9ybWF0dGVyOiAocmVjb3JkKSA9PiBKU09OLnN0cmluZ2lmeSh7XG4gKiAgICAgICAgIGx2bDogcmVjb3JkLmxldmVsLFxuICogICAgICAgICBtc2c6IHJlY29yZC5tc2csXG4gKiAgICAgICAgIHRpbWU6IHJlY29yZC5kYXRldGltZS50b0lTT1N0cmluZygpLFxuICogICAgICAgICBuYW1lOiByZWNvcmQubG9nZ2VyTmFtZSxcbiAqICAgICAgIH0pLFxuICogICAgICAgdXNlQ29sb3JzOiBmYWxzZSxcbiAqICAgICB9KSxcbiAqICAgfSxcbiAqXG4gKiAgIGxvZ2dlcnM6IHtcbiAqICAgICBkZWZhdWx0OiB7XG4gKiAgICAgICBsZXZlbDogXCJERUJVR1wiLFxuICogICAgICAgaGFuZGxlcnM6IFtcImN1c3RvbUpzb25GbXRcIl0sXG4gKiAgICAgfSxcbiAqICAgfSxcbiAqIH0pO1xuICpcbiAqIC8vIGNhbGxpbmc6XG4gKiBsb2cuaW5mbyhcImNvbXBsZXRlXCIpO1xuICogLy8gcmVzdWx0cyBpbjpcbiAqIC8vIHtcImx2bFwiOjIwLFwibXNnXCI6XCJjb21wbGV0ZVwiLFwidGltZVwiOlwiMjAyMy0xMi0xM1QxNjozODoyNy4zMjhaXCIsXCJuYW1lXCI6XCJkZWZhdWx0XCJ9XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZVxuICogSW5saW5lIExvZ2dpbmdcbiAqIGBgYHRzXG4gKiBpbXBvcnQgKiBhcyBsb2dnZXIgZnJvbSBcIkBzdGQvbG9nXCI7XG4gKlxuICogY29uc3Qgc3RyaW5nRGF0YTogc3RyaW5nID0gbG9nZ2VyLmRlYnVnKFwiaGVsbG8gd29ybGRcIik7XG4gKiBjb25zdCBib29sZWFuRGF0YTogYm9vbGVhbiA9IGxvZ2dlci5kZWJ1Zyh0cnVlLCAxLCBcImFiY1wiKTtcbiAqIGNvbnN0IGZuID0gKCk6IG51bWJlciA9PiB7XG4gKiAgIHJldHVybiAxMjM7XG4gKiB9O1xuICogY29uc3QgcmVzb2x2ZWRGdW5jdGlvbkRhdGE6IG51bWJlciA9IGxvZ2dlci5kZWJ1ZyhmbigpKTtcbiAqIGNvbnNvbGUubG9nKHN0cmluZ0RhdGEpOyAvLyAnaGVsbG8gd29ybGQnXG4gKiBjb25zb2xlLmxvZyhib29sZWFuRGF0YSk7IC8vIHRydWVcbiAqIGNvbnNvbGUubG9nKHJlc29sdmVkRnVuY3Rpb25EYXRhKTsgLy8gMTIzXG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZVxuICogTGF6eSBMb2cgRXZhbHVhdGlvblxuICogYGBgdHNcbiAqIGltcG9ydCAqIGFzIGxvZyBmcm9tIFwiQHN0ZC9sb2dcIjtcbiAqXG4gKiBsb2cuc2V0dXAoe1xuICogICBoYW5kbGVyczoge1xuICogICAgIGNvbnNvbGU6IG5ldyBsb2cuQ29uc29sZUhhbmRsZXIoXCJERUJVR1wiKSxcbiAqICAgfSxcbiAqXG4gKiAgIGxvZ2dlcnM6IHtcbiAqICAgICB0YXNrczoge1xuICogICAgICAgbGV2ZWw6IFwiRVJST1JcIixcbiAqICAgICAgIGhhbmRsZXJzOiBbXCJjb25zb2xlXCJdLFxuICogICAgIH0sXG4gKiAgIH0sXG4gKiB9KTtcbiAqXG4gKiBmdW5jdGlvbiBzb21lRXhwZW5zaXZlRm4obnVtOiBudW1iZXIsIGJvb2w6IGJvb2xlYW4pIHtcbiAqICAgLy8gZG8gc29tZSBleHBlbnNpdmUgY29tcHV0YXRpb25cbiAqIH1cbiAqXG4gKiAvLyBub3QgbG9nZ2VkLCBhcyBkZWJ1ZyA8IGVycm9yLlxuICogY29uc3QgZGF0YSA9IGxvZy5kZWJ1ZygoKSA9PiBzb21lRXhwZW5zaXZlRm4oNSwgdHJ1ZSkpO1xuICogY29uc29sZS5sb2coZGF0YSk7IC8vIHVuZGVmaW5lZFxuICogYGBgXG4gKlxuICogSGFuZGxlcnMgYXJlIHJlc3BvbnNpYmxlIGZvciBhY3R1YWwgb3V0cHV0IG9mIGxvZyBtZXNzYWdlcy4gV2hlbiBhIGhhbmRsZXIgaXNcbiAqIGNhbGxlZCBieSBhIGxvZ2dlciwgaXQgZmlyc3RseSBjaGVja3MgdGhhdCB7QGxpbmtjb2RlIExvZ1JlY29yZH0ncyBsZXZlbCBpc1xuICogbm90IGxvd2VyIHRoYW4gbGV2ZWwgb2YgdGhlIGhhbmRsZXIuIElmIGxldmVsIGNoZWNrIHBhc3NlcywgaGFuZGxlcnMgZm9ybWF0c1xuICogbG9nIHJlY29yZCBpbnRvIHN0cmluZyBhbmQgb3V0cHV0cyBpdCB0byB0YXJnZXQuXG4gKlxuICogIyMgQ3VzdG9tIGhhbmRsZXJzXG4gKlxuICogQ3VzdG9tIGhhbmRsZXJzIGNhbiBiZSBpbXBsZW1lbnRlZCBieSBzdWJjbGFzc2luZyB7QGxpbmtjb2RlIEJhc2VIYW5kbGVyfSBvclxuICoge0BsaW5rY29kZSBXcml0ZXJIYW5kbGVyfS5cbiAqXG4gKiB7QGxpbmtjb2RlIEJhc2VIYW5kbGVyfSBpcyBiYXJlLWJvbmVzIGhhbmRsZXIgdGhhdCBoYXMgbm8gb3V0cHV0IGxvZ2ljIGF0IGFsbCxcbiAqXG4gKiB7QGxpbmtjb2RlIFdyaXRlckhhbmRsZXJ9IGlzIGFuIGFic3RyYWN0IGNsYXNzIHRoYXQgc3VwcG9ydHMgYW55IHRhcmdldCB3aXRoXG4gKiBgV3JpdGVyYCBpbnRlcmZhY2UuXG4gKlxuICogRHVyaW5nIHNldHVwIGFzeW5jIGhvb2tzIGBzZXR1cGAgYW5kIGBkZXN0cm95YCBhcmUgY2FsbGVkLCB5b3UgY2FuIHVzZSB0aGVtXG4gKiB0byBvcGVuIGFuZCBjbG9zZSBmaWxlL0hUVFAgY29ubmVjdGlvbiBvciBhbnkgb3RoZXIgYWN0aW9uIHlvdSBtaWdodCBuZWVkLlxuICpcbiAqIEZvciBleGFtcGxlcyBjaGVjayBzb3VyY2UgY29kZSBvZiB7QGxpbmtjb2RlIEZpbGVIYW5kbGVyfWBcbiAqIGFuZCB7QGxpbmtjb2RlIFRlc3RIYW5kbGVyfS5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuZXhwb3J0ICogZnJvbSBcIi4vYmFzZV9oYW5kbGVyLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9jb25zb2xlX2hhbmRsZXIudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2ZpbGVfaGFuZGxlci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcm90YXRpbmdfZmlsZV9oYW5kbGVyLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9sZXZlbHMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2xvZ2dlci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZm9ybWF0dGVycy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vY3JpdGljYWwudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2RlYnVnLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9lcnJvci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZ2V0X2xvZ2dlci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaW5mby50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vc2V0dXAudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3dhcm4udHNcIjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc1hDLEdBRUQsY0FBYyxvQkFBb0I7QUFDbEMsY0FBYyx1QkFBdUI7QUFDckMsY0FBYyxvQkFBb0I7QUFDbEMsY0FBYyw2QkFBNkI7QUFDM0MsY0FBYyxjQUFjO0FBQzVCLGNBQWMsY0FBYztBQUM1QixjQUFjLGtCQUFrQjtBQUNoQyxjQUFjLGdCQUFnQjtBQUM5QixjQUFjLGFBQWE7QUFDM0IsY0FBYyxhQUFhO0FBQzNCLGNBQWMsa0JBQWtCO0FBQ2hDLGNBQWMsWUFBWTtBQUMxQixjQUFjLGFBQWE7QUFDM0IsY0FBYyxZQUFZIn0=
// denoCacheMetadata=1519616857639150648,12082104631578018075