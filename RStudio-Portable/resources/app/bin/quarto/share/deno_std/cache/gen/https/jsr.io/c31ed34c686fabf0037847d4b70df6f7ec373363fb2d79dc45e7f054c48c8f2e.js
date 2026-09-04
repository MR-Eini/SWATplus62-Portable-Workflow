#!/usr/bin/env -S deno run --allow-net --allow-read
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This program serves files in the current directory over HTTP.
// TODO(bartlomieju): Add tests like these:
// https://github.com/indexzero/http-server/blob/master/test/http-server-test.js
/**
 * Contains functions {@linkcode serveDir} and {@linkcode serveFile} for building a static file server.
 *
 * This module can also be used as a cli. If you want to run directly:
 *
 * ```shell
 * > # start server
 * > deno run --allow-net --allow-read @std/http/file-server
 * > # show help
 * > deno run --allow-net --allow-read @std/http/file-server --help
 * ```
 *
 * If you want to install and run:
 *
 * ```shell
 * > # install
 * > deno install --allow-net --allow-read @std/http/file-server
 * > # start server
 * > file_server
 * > # show help
 * > file_server --help
 * ```
 *
 * @module
 */ import { join as posixJoin } from "jsr:/@std/path@1.0.0-rc.2/posix/join";
import { normalize as posixNormalize } from "jsr:/@std/path@1.0.0-rc.2/posix/normalize";
import { extname } from "jsr:/@std/path@1.0.0-rc.2/extname";
import { join } from "jsr:/@std/path@1.0.0-rc.2/join";
import { relative } from "jsr:/@std/path@1.0.0-rc.2/relative";
import { resolve } from "jsr:/@std/path@1.0.0-rc.2/resolve";
import { SEPARATOR_PATTERN } from "jsr:/@std/path@1.0.0-rc.2/constants";
import { contentType } from "jsr:/@std/media-types@^1.0.0-rc.1/content-type";
import { calculate, ifNoneMatch } from "./etag.ts";
import { isRedirectStatus, STATUS_CODE, STATUS_TEXT } from "./status.ts";
import { ByteSliceStream } from "jsr:/@std/streams@^0.224.5/byte-slice-stream";
import { parseArgs } from "jsr:/@std/cli@^0.224.7/parse-args";
import { red } from "jsr:/@std/fmt@^0.225.4/colors";
import denoConfig from "./deno.json" with {
  type: "json"
};
import { format as formatBytes } from "jsr:/@std/fmt@^0.225.4/bytes";
import { getNetworkAddress } from "jsr:/@std/net@^0.224.3/get-network-address";
const ENV_PERM_STATUS = Deno.permissions.querySync?.({
  name: "env",
  variable: "DENO_DEPLOYMENT_ID"
}).state ?? "granted"; // for deno deploy
const DENO_DEPLOYMENT_ID = ENV_PERM_STATUS === "granted" ? Deno.env.get("DENO_DEPLOYMENT_ID") : undefined;
const HASHED_DENO_DEPLOYMENT_ID = DENO_DEPLOYMENT_ID ? calculate(DENO_DEPLOYMENT_ID, {
  weak: true
}) : undefined;
function modeToString(isDir, maybeMode) {
  const modeMap = [
    "---",
    "--x",
    "-w-",
    "-wx",
    "r--",
    "r-x",
    "rw-",
    "rwx"
  ];
  if (maybeMode === null) {
    return "(unknown mode)";
  }
  const mode = maybeMode.toString(8);
  if (mode.length < 3) {
    return "(unknown mode)";
  }
  let output = "";
  mode.split("").reverse().slice(0, 3).forEach((v)=>{
    output = `${modeMap[+v]} ${output}`;
  });
  output = `${isDir ? "d" : "-"} ${output}`;
  return output;
}
function createStandardResponse(status, init) {
  const statusText = STATUS_TEXT[status];
  return new Response(statusText, {
    status,
    statusText,
    ...init
  });
}
/**
 * parse range header.
 *
 * ```ts ignore
 * parseRangeHeader("bytes=0-100",   500); // => { start: 0, end: 100 }
 * parseRangeHeader("bytes=0-",      500); // => { start: 0, end: 499 }
 * parseRangeHeader("bytes=-100",    500); // => { start: 400, end: 499 }
 * parseRangeHeader("bytes=invalid", 500); // => null
 * ```
 *
 * Note: Currently, no support for multiple Ranges (e.g. `bytes=0-10, 20-30`)
 */ function parseRangeHeader(rangeValue, fileSize) {
  const rangeRegex = /bytes=(?<start>\d+)?-(?<end>\d+)?$/u;
  const parsed = rangeValue.match(rangeRegex);
  if (!parsed || !parsed.groups) {
    // failed to parse range header
    return null;
  }
  const { start, end } = parsed.groups;
  if (start !== undefined) {
    if (end !== undefined) {
      return {
        start: +start,
        end: +end
      };
    } else {
      return {
        start: +start,
        end: fileSize - 1
      };
    }
  } else {
    if (end !== undefined) {
      // example: `bytes=-100` means the last 100 bytes.
      return {
        start: fileSize - +end,
        end: fileSize - 1
      };
    } else {
      // failed to parse range header
      return null;
    }
  }
}
/**
 * Returns an HTTP Response with the requested file as the body.
 *
 * @example Usage
 * ```ts no-eval
 * import { serveFile } from "@std/http/file-server";
 *
 * Deno.serve((req) => {
 *   return serveFile(req, "README.md");
 * });
 * ```
 *
 * @param req The server request context used to cleanup the file handle.
 * @param filePath Path of the file to serve.
 * @returns A response for the request.
 */ export async function serveFile(req, filePath, { etagAlgorithm: algorithm, fileInfo } = {}) {
  try {
    fileInfo ??= await Deno.stat(filePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await req.body?.cancel();
      return createStandardResponse(STATUS_CODE.NotFound);
    } else {
      throw error;
    }
  }
  if (fileInfo.isDirectory) {
    await req.body?.cancel();
    return createStandardResponse(STATUS_CODE.NotFound);
  }
  const headers = createBaseHeaders();
  // Set date header if access timestamp is available
  if (fileInfo.atime) {
    headers.set("date", fileInfo.atime.toUTCString());
  }
  const etag = fileInfo.mtime ? await calculate(fileInfo, {
    algorithm
  }) : await HASHED_DENO_DEPLOYMENT_ID;
  // Set last modified header if last modification timestamp is available
  if (fileInfo.mtime) {
    headers.set("last-modified", fileInfo.mtime.toUTCString());
  }
  if (etag) {
    headers.set("etag", etag);
  }
  if (etag || fileInfo.mtime) {
    // If a `if-none-match` header is present and the value matches the tag or
    // if a `if-modified-since` header is present and the value is bigger than
    // the access timestamp value, then return 304
    const ifNoneMatchValue = req.headers.get("if-none-match");
    const ifModifiedSinceValue = req.headers.get("if-modified-since");
    if (!ifNoneMatch(ifNoneMatchValue, etag) || ifNoneMatchValue === null && fileInfo.mtime && ifModifiedSinceValue && fileInfo.mtime.getTime() < new Date(ifModifiedSinceValue).getTime() + 1000) {
      const status = STATUS_CODE.NotModified;
      return new Response(null, {
        status,
        statusText: STATUS_TEXT[status],
        headers
      });
    }
  }
  // Set mime-type using the file extension in filePath
  const contentTypeValue = contentType(extname(filePath));
  if (contentTypeValue) {
    headers.set("content-type", contentTypeValue);
  }
  const fileSize = fileInfo.size;
  const rangeValue = req.headers.get("range");
  // handle range request
  // Note: Some clients add a Range header to all requests to limit the size of the response.
  // If the file is empty, ignore the range header and respond with a 200 rather than a 416.
  // https://github.com/golang/go/blob/0d347544cbca0f42b160424f6bc2458ebcc7b3fc/src/net/http/fs.go#L273-L276
  if (rangeValue && 0 < fileSize) {
    const parsed = parseRangeHeader(rangeValue, fileSize);
    // Returns 200 OK if parsing the range header fails
    if (!parsed) {
      // Set content length
      headers.set("content-length", `${fileSize}`);
      const file = await Deno.open(filePath);
      const status = STATUS_CODE.OK;
      return new Response(file.readable, {
        status,
        statusText: STATUS_TEXT[status],
        headers
      });
    }
    // Return 416 Range Not Satisfiable if invalid range header value
    if (parsed.end < 0 || parsed.end < parsed.start || fileSize <= parsed.start) {
      // Set the "Content-range" header
      headers.set("content-range", `bytes */${fileSize}`);
      return createStandardResponse(STATUS_CODE.RangeNotSatisfiable, {
        headers
      });
    }
    // clamps the range header value
    const start = Math.max(0, parsed.start);
    const end = Math.min(parsed.end, fileSize - 1);
    // Set the "Content-range" header
    headers.set("content-range", `bytes ${start}-${end}/${fileSize}`);
    // Set content length
    const contentLength = end - start + 1;
    headers.set("content-length", `${contentLength}`);
    // Return 206 Partial Content
    const file = await Deno.open(filePath);
    await file.seek(start, Deno.SeekMode.Start);
    const sliced = file.readable.pipeThrough(new ByteSliceStream(0, contentLength - 1));
    const status = STATUS_CODE.PartialContent;
    return new Response(sliced, {
      status,
      statusText: STATUS_TEXT[status],
      headers
    });
  }
  // Set content length
  headers.set("content-length", `${fileSize}`);
  const file = await Deno.open(filePath);
  const status = STATUS_CODE.OK;
  return new Response(file.readable, {
    status,
    statusText: STATUS_TEXT[status],
    headers
  });
}
async function serveDirIndex(dirPath, options) {
  const { showDotfiles } = options;
  const urlRoot = options.urlRoot ? "/" + options.urlRoot : "";
  const dirUrl = `/${relative(options.target, dirPath).replaceAll(new RegExp(SEPARATOR_PATTERN, "g"), "/")}`;
  const listEntryPromise = [];
  // if ".." makes sense
  if (dirUrl !== "/") {
    const prevPath = join(dirPath, "..");
    const entryInfo = Deno.stat(prevPath).then((fileInfo)=>({
        mode: modeToString(true, fileInfo.mode),
        size: "",
        name: "../",
        url: `${urlRoot}${posixJoin(dirUrl, "..")}`
      }));
    listEntryPromise.push(entryInfo);
  }
  // Read fileInfo in parallel
  for await (const entry of Deno.readDir(dirPath)){
    if (!showDotfiles && entry.name[0] === ".") {
      continue;
    }
    const filePath = join(dirPath, entry.name);
    const fileUrl = encodeURIComponent(posixJoin(dirUrl, entry.name)).replaceAll("%2F", "/");
    listEntryPromise.push((async ()=>{
      try {
        const fileInfo = await Deno.stat(filePath);
        return {
          mode: modeToString(entry.isDirectory, fileInfo.mode),
          size: entry.isFile ? formatBytes(fileInfo.size ?? 0) : "",
          name: `${entry.name}${entry.isDirectory ? "/" : ""}`,
          url: `${urlRoot}${fileUrl}${entry.isDirectory ? "/" : ""}`
        };
      } catch (error) {
        // Note: Deno.stat for windows system files may be rejected with os error 32.
        if (!options.quiet) logError(error);
        return {
          mode: "(unknown mode)",
          size: "",
          name: `${entry.name}${entry.isDirectory ? "/" : ""}`,
          url: `${urlRoot}${fileUrl}${entry.isDirectory ? "/" : ""}`
        };
      }
    })());
  }
  const listEntry = await Promise.all(listEntryPromise);
  listEntry.sort((a, b)=>a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
  const formattedDirUrl = `${dirUrl.replace(/\/$/, "")}/`;
  const page = dirViewerTemplate(formattedDirUrl, listEntry);
  const headers = createBaseHeaders();
  headers.set("content-type", "text/html; charset=UTF-8");
  const status = STATUS_CODE.OK;
  return new Response(page, {
    status,
    statusText: STATUS_TEXT[status],
    headers
  });
}
function serveFallback(maybeError) {
  if (maybeError instanceof URIError) {
    return createStandardResponse(STATUS_CODE.BadRequest);
  }
  if (maybeError instanceof Deno.errors.NotFound) {
    return createStandardResponse(STATUS_CODE.NotFound);
  }
  return createStandardResponse(STATUS_CODE.InternalServerError);
}
function serverLog(req, status) {
  const d = new Date().toISOString();
  const dateFmt = `[${d.slice(0, 10)} ${d.slice(11, 19)}]`;
  const url = new URL(req.url);
  const s = `${dateFmt} [${req.method}] ${url.pathname}${url.search} ${status}`;
  // using console.debug instead of console.log so chrome inspect users can hide request logs
  console.debug(s);
}
function createBaseHeaders() {
  return new Headers({
    server: "deno",
    // Set "accept-ranges" so that the client knows it can make range requests on future requests
    "accept-ranges": "bytes"
  });
}
function dirViewerTemplate(dirname, entries) {
  const paths = dirname.split("/");
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Deno File Server</title>
        <style>
          :root {
            --background-color: #fafafa;
            --color: rgba(0, 0, 0, 0.87);
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --background-color: #292929;
              --color: #fff;
            }
            thead {
              color: #7f7f7f;
            }
          }
          @media (min-width: 960px) {
            main {
              max-width: 960px;
            }
            body {
              padding-left: 32px;
              padding-right: 32px;
            }
          }
          @media (min-width: 600px) {
            main {
              padding-left: 24px;
              padding-right: 24px;
            }
          }
          body {
            background: var(--background-color);
            color: var(--color);
            font-family: "Roboto", "Helvetica", "Arial", sans-serif;
            font-weight: 400;
            line-height: 1.43;
            font-size: 0.875rem;
          }
          a {
            color: #2196f3;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          thead {
            text-align: left;
          }
          thead th {
            padding-bottom: 12px;
          }
          table td {
            padding: 6px 36px 6px 0px;
          }
          .size {
            text-align: right;
            padding: 6px 12px 6px 24px;
          }
          .mode {
            font-family: monospace, monospace;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>Index of
          <a href="/">home</a>${paths.map((path, index, array)=>{
    if (path === "") return "";
    const link = array.slice(0, index + 1).join("/");
    return `<a href="${link}">${path}</a>`;
  }).join("/")}
          </h1>
          <table>
            <thead>
              <tr>
                <th>Mode</th>
                <th>Size</th>
                <th>Name</th>
              </tr>
            </thead>
            ${entries.map((entry)=>`
                  <tr>
                    <td class="mode">
                      ${entry.mode}
                    </td>
                    <td class="size">
                      ${entry.size}
                    </td>
                    <td>
                      <a href="${entry.url}">${entry.name}</a>
                    </td>
                  </tr>
                `).join("")}
          </table>
        </main>
      </body>
    </html>
  `;
}
/**
 * Serves the files under the given directory root (opts.fsRoot).
 *
 * @example Usage
 * ```ts no-eval
 * import { serveDir } from "@std/http/file-server";
 *
 * Deno.serve((req) => {
 *   const pathname = new URL(req.url).pathname;
 *   if (pathname.startsWith("/static")) {
 *     return serveDir(req, {
 *       fsRoot: "path/to/static/files/dir",
 *     });
 *   }
 *   // Do dynamic responses
 *   return new Response();
 * });
 * ```
 *
 * @example Optionally you can pass `urlRoot` option. If it's specified that part is stripped from the beginning of the requested pathname.
 *
 * ```ts no-eval
 * import { serveDir } from "@std/http/file-server";
 *
 * // ...
 * serveDir(new Request("http://localhost/static/path/to/file"), {
 *   fsRoot: "public",
 *   urlRoot: "static",
 * });
 * ```
 *
 * The above example serves `./public/path/to/file` for the request to `/static/path/to/file`.
 *
 * @param req The request to handle
 * @param opts Additional options.
 * @returns A response for the request.
 */ export async function serveDir(req, opts = {}) {
  let response;
  try {
    response = await createServeDirResponse(req, opts);
  } catch (error) {
    if (!opts.quiet) logError(error);
    response = serveFallback(error);
  }
  // Do not update the header if the response is a 301 redirect.
  const isRedirectResponse = isRedirectStatus(response.status);
  if (opts.enableCors && !isRedirectResponse) {
    response.headers.append("access-control-allow-origin", "*");
    response.headers.append("access-control-allow-headers", "Origin, X-Requested-With, Content-Type, Accept, Range");
  }
  if (!opts.quiet) serverLog(req, response.status);
  if (opts.headers && !isRedirectResponse) {
    for (const header of opts.headers){
      const headerSplit = header.split(":");
      const name = headerSplit[0];
      const value = headerSplit.slice(1).join(":");
      response.headers.append(name, value);
    }
  }
  return response;
}
async function createServeDirResponse(req, opts) {
  const target = opts.fsRoot || ".";
  const urlRoot = opts.urlRoot;
  const showIndex = opts.showIndex ?? true;
  const showDotfiles = opts.showDotfiles || false;
  const { etagAlgorithm, showDirListing, quiet } = opts;
  const url = new URL(req.url);
  const decodedUrl = decodeURIComponent(url.pathname);
  let normalizedPath = posixNormalize(decodedUrl);
  if (urlRoot && !normalizedPath.startsWith("/" + urlRoot)) {
    return createStandardResponse(STATUS_CODE.NotFound);
  }
  // Redirect paths like `/foo////bar` and `/foo/bar/////` to normalized paths.
  if (normalizedPath !== decodedUrl) {
    url.pathname = normalizedPath;
    return Response.redirect(url, 301);
  }
  if (urlRoot) {
    normalizedPath = normalizedPath.replace(urlRoot, "");
  }
  // Remove trailing slashes to avoid ENOENT errors
  // when accessing a path to a file with a trailing slash.
  if (normalizedPath.endsWith("/")) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  const fsPath = join(target, normalizedPath);
  const fileInfo = await Deno.stat(fsPath);
  // For files, remove the trailing slash from the path.
  if (fileInfo.isFile && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return Response.redirect(url, 301);
  }
  // For directories, the path must have a trailing slash.
  if (fileInfo.isDirectory && !url.pathname.endsWith("/")) {
    // On directory listing pages,
    // if the current URL's pathname doesn't end with a slash, any
    // relative URLs in the index file will resolve against the parent
    // directory, rather than the current directory. To prevent that, we
    // return a 301 redirect to the URL with a slash.
    url.pathname += "/";
    return Response.redirect(url, 301);
  }
  // if target is file, serve file.
  if (!fileInfo.isDirectory) {
    return serveFile(req, fsPath, {
      etagAlgorithm,
      fileInfo
    });
  }
  // if target is directory, serve index or dir listing.
  if (showIndex) {
    const indexPath = join(fsPath, "index.html");
    let indexFileInfo;
    try {
      indexFileInfo = await Deno.lstat(indexPath);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    // skip Not Found error
    }
    if (indexFileInfo?.isFile) {
      return serveFile(req, indexPath, {
        etagAlgorithm,
        fileInfo: indexFileInfo
      });
    }
  }
  if (showDirListing) {
    return serveDirIndex(fsPath, {
      urlRoot,
      showDotfiles,
      target,
      quiet
    });
  }
  return createStandardResponse(STATUS_CODE.NotFound);
}
function logError(error) {
  console.error(red(error instanceof Error ? error.message : `${error}`));
}
function main() {
  const serverArgs = parseArgs(Deno.args, {
    string: [
      "port",
      "host",
      "cert",
      "key",
      "header"
    ],
    boolean: [
      "help",
      "dir-listing",
      "dotfiles",
      "cors",
      "verbose",
      "version"
    ],
    negatable: [
      "dir-listing",
      "dotfiles",
      "cors"
    ],
    collect: [
      "header"
    ],
    default: {
      "dir-listing": true,
      dotfiles: true,
      cors: true,
      verbose: false,
      version: false,
      host: "0.0.0.0",
      port: "4507",
      cert: "",
      key: ""
    },
    alias: {
      p: "port",
      c: "cert",
      k: "key",
      h: "help",
      v: "verbose",
      V: "version",
      H: "header"
    }
  });
  const port = Number(serverArgs.port);
  const headers = serverArgs.header || [];
  const host = serverArgs.host;
  const certFile = serverArgs.cert;
  const keyFile = serverArgs.key;
  if (serverArgs.help) {
    printUsage();
    Deno.exit();
  }
  if (serverArgs.version) {
    console.log(`Deno File Server ${denoConfig.version}`);
    Deno.exit();
  }
  if (keyFile || certFile) {
    if (keyFile === "" || certFile === "") {
      console.log("--key and --cert are required for TLS");
      printUsage();
      Deno.exit(1);
    }
  }
  const wild = serverArgs._;
  const target = resolve(wild[0] ?? "");
  const handler = (req)=>{
    return serveDir(req, {
      fsRoot: target,
      showDirListing: serverArgs["dir-listing"],
      showDotfiles: serverArgs.dotfiles,
      enableCors: serverArgs.cors,
      quiet: !serverArgs.verbose,
      headers
    });
  };
  const useTls = !!(keyFile && certFile);
  function onListen({ port, hostname }) {
    const networkAddress = getNetworkAddress();
    const protocol = useTls ? "https" : "http";
    let message = `Listening on:\n- Local: ${protocol}://${hostname}:${port}`;
    if (networkAddress && !DENO_DEPLOYMENT_ID) {
      message += `\n- Network: ${protocol}://${networkAddress}:${port}`;
    }
    console.log(message);
  }
  if (useTls) {
    Deno.serve({
      port,
      hostname: host,
      onListen,
      cert: Deno.readTextFileSync(certFile),
      key: Deno.readTextFileSync(keyFile)
    }, handler);
  } else {
    Deno.serve({
      port,
      hostname: host,
      onListen
    }, handler);
  }
}
function printUsage() {
  console.log(`Deno File Server ${denoConfig.version}
  Serves a local directory in HTTP.

INSTALL:
  deno install --allow-net --allow-read jsr:@std/http@${denoConfig.version}/file_server

USAGE:
  file_server [path] [options]

OPTIONS:
  -h, --help            Prints help information
  -p, --port <PORT>     Set port
  --cors                Enable CORS via the "Access-Control-Allow-Origin" header
  --host     <HOST>     Hostname (default is 0.0.0.0)
  -c, --cert <FILE>     TLS certificate file (enables TLS)
  -k, --key  <FILE>     TLS key file (enables TLS)
  -H, --header <HEADER> Sets a header on every request.
                        (e.g. --header "Cache-Control: no-cache")
                        This option can be specified multiple times.
  --no-dir-listing      Disable directory listing
  --no-dotfiles         Do not show dotfiles
  --no-cors             Disable cross-origin resource sharing
  -v, --verbose         Print request level logs
  -V, --version         Print version information

  All TLS options are required when one is provided.`);
}
if (import.meta.main) {
  main();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaHR0cC8wLjIyNC41L2ZpbGVfc2VydmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IC1TIGRlbm8gcnVuIC0tYWxsb3ctbmV0IC0tYWxsb3ctcmVhZFxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuLy8gVGhpcyBwcm9ncmFtIHNlcnZlcyBmaWxlcyBpbiB0aGUgY3VycmVudCBkaXJlY3Rvcnkgb3ZlciBIVFRQLlxuLy8gVE9ETyhiYXJ0bG9taWVqdSk6IEFkZCB0ZXN0cyBsaWtlIHRoZXNlOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2luZGV4emVyby9odHRwLXNlcnZlci9ibG9iL21hc3Rlci90ZXN0L2h0dHAtc2VydmVyLXRlc3QuanNcblxuLyoqXG4gKiBDb250YWlucyBmdW5jdGlvbnMge0BsaW5rY29kZSBzZXJ2ZURpcn0gYW5kIHtAbGlua2NvZGUgc2VydmVGaWxlfSBmb3IgYnVpbGRpbmcgYSBzdGF0aWMgZmlsZSBzZXJ2ZXIuXG4gKlxuICogVGhpcyBtb2R1bGUgY2FuIGFsc28gYmUgdXNlZCBhcyBhIGNsaS4gSWYgeW91IHdhbnQgdG8gcnVuIGRpcmVjdGx5OlxuICpcbiAqIGBgYHNoZWxsXG4gKiA+ICMgc3RhcnQgc2VydmVyXG4gKiA+IGRlbm8gcnVuIC0tYWxsb3ctbmV0IC0tYWxsb3ctcmVhZCBAc3RkL2h0dHAvZmlsZS1zZXJ2ZXJcbiAqID4gIyBzaG93IGhlbHBcbiAqID4gZGVubyBydW4gLS1hbGxvdy1uZXQgLS1hbGxvdy1yZWFkIEBzdGQvaHR0cC9maWxlLXNlcnZlciAtLWhlbHBcbiAqIGBgYFxuICpcbiAqIElmIHlvdSB3YW50IHRvIGluc3RhbGwgYW5kIHJ1bjpcbiAqXG4gKiBgYGBzaGVsbFxuICogPiAjIGluc3RhbGxcbiAqID4gZGVubyBpbnN0YWxsIC0tYWxsb3ctbmV0IC0tYWxsb3ctcmVhZCBAc3RkL2h0dHAvZmlsZS1zZXJ2ZXJcbiAqID4gIyBzdGFydCBzZXJ2ZXJcbiAqID4gZmlsZV9zZXJ2ZXJcbiAqID4gIyBzaG93IGhlbHBcbiAqID4gZmlsZV9zZXJ2ZXIgLS1oZWxwXG4gKiBgYGBcbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0IHsgam9pbiBhcyBwb3NpeEpvaW4gfSBmcm9tIFwianNyOi9Ac3RkL3BhdGhAMS4wLjAtcmMuMi9wb3NpeC9qb2luXCI7XG5pbXBvcnQgeyBub3JtYWxpemUgYXMgcG9zaXhOb3JtYWxpemUgfSBmcm9tIFwianNyOi9Ac3RkL3BhdGhAMS4wLjAtcmMuMi9wb3NpeC9ub3JtYWxpemVcIjtcbmltcG9ydCB7IGV4dG5hbWUgfSBmcm9tIFwianNyOi9Ac3RkL3BhdGhAMS4wLjAtcmMuMi9leHRuYW1lXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcImpzcjovQHN0ZC9wYXRoQDEuMC4wLXJjLjIvam9pblwiO1xuaW1wb3J0IHsgcmVsYXRpdmUgfSBmcm9tIFwianNyOi9Ac3RkL3BhdGhAMS4wLjAtcmMuMi9yZWxhdGl2ZVwiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJqc3I6L0BzdGQvcGF0aEAxLjAuMC1yYy4yL3Jlc29sdmVcIjtcbmltcG9ydCB7IFNFUEFSQVRPUl9QQVRURVJOIH0gZnJvbSBcImpzcjovQHN0ZC9wYXRoQDEuMC4wLXJjLjIvY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBjb250ZW50VHlwZSB9IGZyb20gXCJqc3I6L0BzdGQvbWVkaWEtdHlwZXNAXjEuMC4wLXJjLjEvY29udGVudC10eXBlXCI7XG5pbXBvcnQgeyBjYWxjdWxhdGUsIGlmTm9uZU1hdGNoIH0gZnJvbSBcIi4vZXRhZy50c1wiO1xuaW1wb3J0IHtcbiAgaXNSZWRpcmVjdFN0YXR1cyxcbiAgU1RBVFVTX0NPREUsXG4gIFNUQVRVU19URVhULFxuICB0eXBlIFN0YXR1c0NvZGUsXG59IGZyb20gXCIuL3N0YXR1cy50c1wiO1xuaW1wb3J0IHsgQnl0ZVNsaWNlU3RyZWFtIH0gZnJvbSBcImpzcjovQHN0ZC9zdHJlYW1zQF4wLjIyNC41L2J5dGUtc2xpY2Utc3RyZWFtXCI7XG5pbXBvcnQgeyBwYXJzZUFyZ3MgfSBmcm9tIFwianNyOi9Ac3RkL2NsaUBeMC4yMjQuNy9wYXJzZS1hcmdzXCI7XG5pbXBvcnQgeyByZWQgfSBmcm9tIFwianNyOi9Ac3RkL2ZtdEBeMC4yMjUuNC9jb2xvcnNcIjtcbmltcG9ydCBkZW5vQ29uZmlnIGZyb20gXCIuL2Rlbm8uanNvblwiIHdpdGggeyB0eXBlOiBcImpzb25cIiB9O1xuaW1wb3J0IHsgZm9ybWF0IGFzIGZvcm1hdEJ5dGVzIH0gZnJvbSBcImpzcjovQHN0ZC9mbXRAXjAuMjI1LjQvYnl0ZXNcIjtcbmltcG9ydCB7IGdldE5ldHdvcmtBZGRyZXNzIH0gZnJvbSBcImpzcjovQHN0ZC9uZXRAXjAuMjI0LjMvZ2V0LW5ldHdvcmstYWRkcmVzc1wiO1xuXG5pbnRlcmZhY2UgRW50cnlJbmZvIHtcbiAgbW9kZTogc3RyaW5nO1xuICBzaXplOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbmNvbnN0IEVOVl9QRVJNX1NUQVRVUyA9XG4gIERlbm8ucGVybWlzc2lvbnMucXVlcnlTeW5jPy4oeyBuYW1lOiBcImVudlwiLCB2YXJpYWJsZTogXCJERU5PX0RFUExPWU1FTlRfSURcIiB9KVxuICAgIC5zdGF0ZSA/PyBcImdyYW50ZWRcIjsgLy8gZm9yIGRlbm8gZGVwbG95XG5jb25zdCBERU5PX0RFUExPWU1FTlRfSUQgPSBFTlZfUEVSTV9TVEFUVVMgPT09IFwiZ3JhbnRlZFwiXG4gID8gRGVuby5lbnYuZ2V0KFwiREVOT19ERVBMT1lNRU5UX0lEXCIpXG4gIDogdW5kZWZpbmVkO1xuY29uc3QgSEFTSEVEX0RFTk9fREVQTE9ZTUVOVF9JRCA9IERFTk9fREVQTE9ZTUVOVF9JRFxuICA/IGNhbGN1bGF0ZShERU5PX0RFUExPWU1FTlRfSUQsIHsgd2VhazogdHJ1ZSB9KVxuICA6IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gbW9kZVRvU3RyaW5nKGlzRGlyOiBib29sZWFuLCBtYXliZU1vZGU6IG51bWJlciB8IG51bGwpOiBzdHJpbmcge1xuICBjb25zdCBtb2RlTWFwID0gW1wiLS0tXCIsIFwiLS14XCIsIFwiLXctXCIsIFwiLXd4XCIsIFwici0tXCIsIFwici14XCIsIFwicnctXCIsIFwicnd4XCJdO1xuXG4gIGlmIChtYXliZU1vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gXCIodW5rbm93biBtb2RlKVwiO1xuICB9XG4gIGNvbnN0IG1vZGUgPSBtYXliZU1vZGUudG9TdHJpbmcoOCk7XG4gIGlmIChtb2RlLmxlbmd0aCA8IDMpIHtcbiAgICByZXR1cm4gXCIodW5rbm93biBtb2RlKVwiO1xuICB9XG4gIGxldCBvdXRwdXQgPSBcIlwiO1xuICBtb2RlXG4gICAgLnNwbGl0KFwiXCIpXG4gICAgLnJldmVyc2UoKVxuICAgIC5zbGljZSgwLCAzKVxuICAgIC5mb3JFYWNoKCh2KSA9PiB7XG4gICAgICBvdXRwdXQgPSBgJHttb2RlTWFwWyt2XX0gJHtvdXRwdXR9YDtcbiAgICB9KTtcbiAgb3V0cHV0ID0gYCR7aXNEaXIgPyBcImRcIiA6IFwiLVwifSAke291dHB1dH1gO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTdGFuZGFyZFJlc3BvbnNlKHN0YXR1czogU3RhdHVzQ29kZSwgaW5pdD86IFJlc3BvbnNlSW5pdCkge1xuICBjb25zdCBzdGF0dXNUZXh0ID0gU1RBVFVTX1RFWFRbc3RhdHVzXTtcbiAgcmV0dXJuIG5ldyBSZXNwb25zZShzdGF0dXNUZXh0LCB7IHN0YXR1cywgc3RhdHVzVGV4dCwgLi4uaW5pdCB9KTtcbn1cblxuLyoqXG4gKiBwYXJzZSByYW5nZSBoZWFkZXIuXG4gKlxuICogYGBgdHMgaWdub3JlXG4gKiBwYXJzZVJhbmdlSGVhZGVyKFwiYnl0ZXM9MC0xMDBcIiwgICA1MDApOyAvLyA9PiB7IHN0YXJ0OiAwLCBlbmQ6IDEwMCB9XG4gKiBwYXJzZVJhbmdlSGVhZGVyKFwiYnl0ZXM9MC1cIiwgICAgICA1MDApOyAvLyA9PiB7IHN0YXJ0OiAwLCBlbmQ6IDQ5OSB9XG4gKiBwYXJzZVJhbmdlSGVhZGVyKFwiYnl0ZXM9LTEwMFwiLCAgICA1MDApOyAvLyA9PiB7IHN0YXJ0OiA0MDAsIGVuZDogNDk5IH1cbiAqIHBhcnNlUmFuZ2VIZWFkZXIoXCJieXRlcz1pbnZhbGlkXCIsIDUwMCk7IC8vID0+IG51bGxcbiAqIGBgYFxuICpcbiAqIE5vdGU6IEN1cnJlbnRseSwgbm8gc3VwcG9ydCBmb3IgbXVsdGlwbGUgUmFuZ2VzIChlLmcuIGBieXRlcz0wLTEwLCAyMC0zMGApXG4gKi9cbmZ1bmN0aW9uIHBhcnNlUmFuZ2VIZWFkZXIocmFuZ2VWYWx1ZTogc3RyaW5nLCBmaWxlU2l6ZTogbnVtYmVyKSB7XG4gIGNvbnN0IHJhbmdlUmVnZXggPSAvYnl0ZXM9KD88c3RhcnQ+XFxkKyk/LSg/PGVuZD5cXGQrKT8kL3U7XG4gIGNvbnN0IHBhcnNlZCA9IHJhbmdlVmFsdWUubWF0Y2gocmFuZ2VSZWdleCk7XG5cbiAgaWYgKCFwYXJzZWQgfHwgIXBhcnNlZC5ncm91cHMpIHtcbiAgICAvLyBmYWlsZWQgdG8gcGFyc2UgcmFuZ2UgaGVhZGVyXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IHBhcnNlZC5ncm91cHM7XG4gIGlmIChzdGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKGVuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4geyBzdGFydDogK3N0YXJ0LCBlbmQ6ICtlbmQgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgc3RhcnQ6ICtzdGFydCwgZW5kOiBmaWxlU2l6ZSAtIDEgfTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGVuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBleGFtcGxlOiBgYnl0ZXM9LTEwMGAgbWVhbnMgdGhlIGxhc3QgMTAwIGJ5dGVzLlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IGZpbGVTaXplIC0gK2VuZCwgZW5kOiBmaWxlU2l6ZSAtIDEgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZmFpbGVkIHRvIHBhcnNlIHJhbmdlIGhlYWRlclxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG59XG5cbi8qKiBJbnRlcmZhY2UgZm9yIHNlcnZlRmlsZSBvcHRpb25zLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZUZpbGVPcHRpb25zIHtcbiAgLyoqIFRoZSBhbGdvcml0aG0gdG8gdXNlIGZvciBnZW5lcmF0aW5nIHRoZSBFVGFnLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7XCJTSEEtMjU2XCJ9XG4gICAqL1xuICBldGFnQWxnb3JpdGhtPzogQWxnb3JpdGhtSWRlbnRpZmllcjtcbiAgLyoqIEFuIG9wdGlvbmFsIEZpbGVJbmZvIG9iamVjdCByZXR1cm5lZCBieSBEZW5vLnN0YXQuIEl0IGlzIHVzZWQgZm9yIG9wdGltaXphdGlvbiBwdXJwb3Nlcy4gKi9cbiAgZmlsZUluZm8/OiBEZW5vLkZpbGVJbmZvO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gSFRUUCBSZXNwb25zZSB3aXRoIHRoZSByZXF1ZXN0ZWQgZmlsZSBhcyB0aGUgYm9keS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgc2VydmVGaWxlIH0gZnJvbSBcIkBzdGQvaHR0cC9maWxlLXNlcnZlclwiO1xuICpcbiAqIERlbm8uc2VydmUoKHJlcSkgPT4ge1xuICogICByZXR1cm4gc2VydmVGaWxlKHJlcSwgXCJSRUFETUUubWRcIik7XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSByZXEgVGhlIHNlcnZlciByZXF1ZXN0IGNvbnRleHQgdXNlZCB0byBjbGVhbnVwIHRoZSBmaWxlIGhhbmRsZS5cbiAqIEBwYXJhbSBmaWxlUGF0aCBQYXRoIG9mIHRoZSBmaWxlIHRvIHNlcnZlLlxuICogQHJldHVybnMgQSByZXNwb25zZSBmb3IgdGhlIHJlcXVlc3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXJ2ZUZpbGUoXG4gIHJlcTogUmVxdWVzdCxcbiAgZmlsZVBhdGg6IHN0cmluZyxcbiAgeyBldGFnQWxnb3JpdGhtOiBhbGdvcml0aG0sIGZpbGVJbmZvIH06IFNlcnZlRmlsZU9wdGlvbnMgPSB7fSxcbik6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgdHJ5IHtcbiAgICBmaWxlSW5mbyA/Pz0gYXdhaXQgRGVuby5zdGF0KGZpbGVQYXRoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkge1xuICAgICAgYXdhaXQgcmVxLmJvZHk/LmNhbmNlbCgpO1xuICAgICAgcmV0dXJuIGNyZWF0ZVN0YW5kYXJkUmVzcG9uc2UoU1RBVFVTX0NPREUuTm90Rm91bmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICBpZiAoZmlsZUluZm8uaXNEaXJlY3RvcnkpIHtcbiAgICBhd2FpdCByZXEuYm9keT8uY2FuY2VsKCk7XG4gICAgcmV0dXJuIGNyZWF0ZVN0YW5kYXJkUmVzcG9uc2UoU1RBVFVTX0NPREUuTm90Rm91bmQpO1xuICB9XG5cbiAgY29uc3QgaGVhZGVycyA9IGNyZWF0ZUJhc2VIZWFkZXJzKCk7XG5cbiAgLy8gU2V0IGRhdGUgaGVhZGVyIGlmIGFjY2VzcyB0aW1lc3RhbXAgaXMgYXZhaWxhYmxlXG4gIGlmIChmaWxlSW5mby5hdGltZSkge1xuICAgIGhlYWRlcnMuc2V0KFwiZGF0ZVwiLCBmaWxlSW5mby5hdGltZS50b1VUQ1N0cmluZygpKTtcbiAgfVxuXG4gIGNvbnN0IGV0YWcgPSBmaWxlSW5mby5tdGltZVxuICAgID8gYXdhaXQgY2FsY3VsYXRlKGZpbGVJbmZvLCB7IGFsZ29yaXRobSB9KVxuICAgIDogYXdhaXQgSEFTSEVEX0RFTk9fREVQTE9ZTUVOVF9JRDtcblxuICAvLyBTZXQgbGFzdCBtb2RpZmllZCBoZWFkZXIgaWYgbGFzdCBtb2RpZmljYXRpb24gdGltZXN0YW1wIGlzIGF2YWlsYWJsZVxuICBpZiAoZmlsZUluZm8ubXRpbWUpIHtcbiAgICBoZWFkZXJzLnNldChcImxhc3QtbW9kaWZpZWRcIiwgZmlsZUluZm8ubXRpbWUudG9VVENTdHJpbmcoKSk7XG4gIH1cbiAgaWYgKGV0YWcpIHtcbiAgICBoZWFkZXJzLnNldChcImV0YWdcIiwgZXRhZyk7XG4gIH1cblxuICBpZiAoZXRhZyB8fCBmaWxlSW5mby5tdGltZSkge1xuICAgIC8vIElmIGEgYGlmLW5vbmUtbWF0Y2hgIGhlYWRlciBpcyBwcmVzZW50IGFuZCB0aGUgdmFsdWUgbWF0Y2hlcyB0aGUgdGFnIG9yXG4gICAgLy8gaWYgYSBgaWYtbW9kaWZpZWQtc2luY2VgIGhlYWRlciBpcyBwcmVzZW50IGFuZCB0aGUgdmFsdWUgaXMgYmlnZ2VyIHRoYW5cbiAgICAvLyB0aGUgYWNjZXNzIHRpbWVzdGFtcCB2YWx1ZSwgdGhlbiByZXR1cm4gMzA0XG4gICAgY29uc3QgaWZOb25lTWF0Y2hWYWx1ZSA9IHJlcS5oZWFkZXJzLmdldChcImlmLW5vbmUtbWF0Y2hcIik7XG4gICAgY29uc3QgaWZNb2RpZmllZFNpbmNlVmFsdWUgPSByZXEuaGVhZGVycy5nZXQoXCJpZi1tb2RpZmllZC1zaW5jZVwiKTtcbiAgICBpZiAoXG4gICAgICAoIWlmTm9uZU1hdGNoKGlmTm9uZU1hdGNoVmFsdWUsIGV0YWcpKSB8fFxuICAgICAgKGlmTm9uZU1hdGNoVmFsdWUgPT09IG51bGwgJiZcbiAgICAgICAgZmlsZUluZm8ubXRpbWUgJiZcbiAgICAgICAgaWZNb2RpZmllZFNpbmNlVmFsdWUgJiZcbiAgICAgICAgZmlsZUluZm8ubXRpbWUuZ2V0VGltZSgpIDxcbiAgICAgICAgICBuZXcgRGF0ZShpZk1vZGlmaWVkU2luY2VWYWx1ZSkuZ2V0VGltZSgpICsgMTAwMClcbiAgICApIHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IFNUQVRVU19DT0RFLk5vdE1vZGlmaWVkO1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7XG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogU1RBVFVTX1RFWFRbc3RhdHVzXSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNldCBtaW1lLXR5cGUgdXNpbmcgdGhlIGZpbGUgZXh0ZW5zaW9uIGluIGZpbGVQYXRoXG4gIGNvbnN0IGNvbnRlbnRUeXBlVmFsdWUgPSBjb250ZW50VHlwZShleHRuYW1lKGZpbGVQYXRoKSk7XG4gIGlmIChjb250ZW50VHlwZVZhbHVlKSB7XG4gICAgaGVhZGVycy5zZXQoXCJjb250ZW50LXR5cGVcIiwgY29udGVudFR5cGVWYWx1ZSk7XG4gIH1cblxuICBjb25zdCBmaWxlU2l6ZSA9IGZpbGVJbmZvLnNpemU7XG5cbiAgY29uc3QgcmFuZ2VWYWx1ZSA9IHJlcS5oZWFkZXJzLmdldChcInJhbmdlXCIpO1xuXG4gIC8vIGhhbmRsZSByYW5nZSByZXF1ZXN0XG4gIC8vIE5vdGU6IFNvbWUgY2xpZW50cyBhZGQgYSBSYW5nZSBoZWFkZXIgdG8gYWxsIHJlcXVlc3RzIHRvIGxpbWl0IHRoZSBzaXplIG9mIHRoZSByZXNwb25zZS5cbiAgLy8gSWYgdGhlIGZpbGUgaXMgZW1wdHksIGlnbm9yZSB0aGUgcmFuZ2UgaGVhZGVyIGFuZCByZXNwb25kIHdpdGggYSAyMDAgcmF0aGVyIHRoYW4gYSA0MTYuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb2xhbmcvZ28vYmxvYi8wZDM0NzU0NGNiY2EwZjQyYjE2MDQyNGY2YmMyNDU4ZWJjYzdiM2ZjL3NyYy9uZXQvaHR0cC9mcy5nbyNMMjczLUwyNzZcbiAgaWYgKHJhbmdlVmFsdWUgJiYgMCA8IGZpbGVTaXplKSB7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VSYW5nZUhlYWRlcihyYW5nZVZhbHVlLCBmaWxlU2l6ZSk7XG5cbiAgICAvLyBSZXR1cm5zIDIwMCBPSyBpZiBwYXJzaW5nIHRoZSByYW5nZSBoZWFkZXIgZmFpbHNcbiAgICBpZiAoIXBhcnNlZCkge1xuICAgICAgLy8gU2V0IGNvbnRlbnQgbGVuZ3RoXG4gICAgICBoZWFkZXJzLnNldChcImNvbnRlbnQtbGVuZ3RoXCIsIGAke2ZpbGVTaXplfWApO1xuXG4gICAgICBjb25zdCBmaWxlID0gYXdhaXQgRGVuby5vcGVuKGZpbGVQYXRoKTtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IFNUQVRVU19DT0RFLk9LO1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShmaWxlLnJlYWRhYmxlLCB7XG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogU1RBVFVTX1RFWFRbc3RhdHVzXSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFJldHVybiA0MTYgUmFuZ2UgTm90IFNhdGlzZmlhYmxlIGlmIGludmFsaWQgcmFuZ2UgaGVhZGVyIHZhbHVlXG4gICAgaWYgKFxuICAgICAgcGFyc2VkLmVuZCA8IDAgfHxcbiAgICAgIHBhcnNlZC5lbmQgPCBwYXJzZWQuc3RhcnQgfHxcbiAgICAgIGZpbGVTaXplIDw9IHBhcnNlZC5zdGFydFxuICAgICkge1xuICAgICAgLy8gU2V0IHRoZSBcIkNvbnRlbnQtcmFuZ2VcIiBoZWFkZXJcbiAgICAgIGhlYWRlcnMuc2V0KFwiY29udGVudC1yYW5nZVwiLCBgYnl0ZXMgKi8ke2ZpbGVTaXplfWApO1xuXG4gICAgICByZXR1cm4gY3JlYXRlU3RhbmRhcmRSZXNwb25zZShcbiAgICAgICAgU1RBVFVTX0NPREUuUmFuZ2VOb3RTYXRpc2ZpYWJsZSxcbiAgICAgICAgeyBoZWFkZXJzIH0sXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIGNsYW1wcyB0aGUgcmFuZ2UgaGVhZGVyIHZhbHVlXG4gICAgY29uc3Qgc3RhcnQgPSBNYXRoLm1heCgwLCBwYXJzZWQuc3RhcnQpO1xuICAgIGNvbnN0IGVuZCA9IE1hdGgubWluKHBhcnNlZC5lbmQsIGZpbGVTaXplIC0gMSk7XG5cbiAgICAvLyBTZXQgdGhlIFwiQ29udGVudC1yYW5nZVwiIGhlYWRlclxuICAgIGhlYWRlcnMuc2V0KFwiY29udGVudC1yYW5nZVwiLCBgYnl0ZXMgJHtzdGFydH0tJHtlbmR9LyR7ZmlsZVNpemV9YCk7XG5cbiAgICAvLyBTZXQgY29udGVudCBsZW5ndGhcbiAgICBjb25zdCBjb250ZW50TGVuZ3RoID0gZW5kIC0gc3RhcnQgKyAxO1xuICAgIGhlYWRlcnMuc2V0KFwiY29udGVudC1sZW5ndGhcIiwgYCR7Y29udGVudExlbmd0aH1gKTtcblxuICAgIC8vIFJldHVybiAyMDYgUGFydGlhbCBDb250ZW50XG4gICAgY29uc3QgZmlsZSA9IGF3YWl0IERlbm8ub3BlbihmaWxlUGF0aCk7XG4gICAgYXdhaXQgZmlsZS5zZWVrKHN0YXJ0LCBEZW5vLlNlZWtNb2RlLlN0YXJ0KTtcbiAgICBjb25zdCBzbGljZWQgPSBmaWxlLnJlYWRhYmxlXG4gICAgICAucGlwZVRocm91Z2gobmV3IEJ5dGVTbGljZVN0cmVhbSgwLCBjb250ZW50TGVuZ3RoIC0gMSkpO1xuICAgIGNvbnN0IHN0YXR1cyA9IFNUQVRVU19DT0RFLlBhcnRpYWxDb250ZW50O1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2Uoc2xpY2VkLCB7XG4gICAgICBzdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiBTVEFUVVNfVEVYVFtzdGF0dXNdLFxuICAgICAgaGVhZGVycyxcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFNldCBjb250ZW50IGxlbmd0aFxuICBoZWFkZXJzLnNldChcImNvbnRlbnQtbGVuZ3RoXCIsIGAke2ZpbGVTaXplfWApO1xuXG4gIGNvbnN0IGZpbGUgPSBhd2FpdCBEZW5vLm9wZW4oZmlsZVBhdGgpO1xuICBjb25zdCBzdGF0dXMgPSBTVEFUVVNfQ09ERS5PSztcbiAgcmV0dXJuIG5ldyBSZXNwb25zZShmaWxlLnJlYWRhYmxlLCB7XG4gICAgc3RhdHVzLFxuICAgIHN0YXR1c1RleHQ6IFNUQVRVU19URVhUW3N0YXR1c10sXG4gICAgaGVhZGVycyxcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNlcnZlRGlySW5kZXgoXG4gIGRpclBhdGg6IHN0cmluZyxcbiAgb3B0aW9uczoge1xuICAgIHNob3dEb3RmaWxlczogYm9vbGVhbjtcbiAgICB0YXJnZXQ6IHN0cmluZztcbiAgICB1cmxSb290OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgcXVpZXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gIH0sXG4pOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGNvbnN0IHsgc2hvd0RvdGZpbGVzIH0gPSBvcHRpb25zO1xuICBjb25zdCB1cmxSb290ID0gb3B0aW9ucy51cmxSb290ID8gXCIvXCIgKyBvcHRpb25zLnVybFJvb3QgOiBcIlwiO1xuICBjb25zdCBkaXJVcmwgPSBgLyR7XG4gICAgcmVsYXRpdmUob3B0aW9ucy50YXJnZXQsIGRpclBhdGgpLnJlcGxhY2VBbGwoXG4gICAgICBuZXcgUmVnRXhwKFNFUEFSQVRPUl9QQVRURVJOLCBcImdcIiksXG4gICAgICBcIi9cIixcbiAgICApXG4gIH1gO1xuICBjb25zdCBsaXN0RW50cnlQcm9taXNlOiBQcm9taXNlPEVudHJ5SW5mbz5bXSA9IFtdO1xuXG4gIC8vIGlmIFwiLi5cIiBtYWtlcyBzZW5zZVxuICBpZiAoZGlyVXJsICE9PSBcIi9cIikge1xuICAgIGNvbnN0IHByZXZQYXRoID0gam9pbihkaXJQYXRoLCBcIi4uXCIpO1xuICAgIGNvbnN0IGVudHJ5SW5mbyA9IERlbm8uc3RhdChwcmV2UGF0aCkudGhlbigoZmlsZUluZm8pOiBFbnRyeUluZm8gPT4gKHtcbiAgICAgIG1vZGU6IG1vZGVUb1N0cmluZyh0cnVlLCBmaWxlSW5mby5tb2RlKSxcbiAgICAgIHNpemU6IFwiXCIsXG4gICAgICBuYW1lOiBcIi4uL1wiLFxuICAgICAgdXJsOiBgJHt1cmxSb290fSR7cG9zaXhKb2luKGRpclVybCwgXCIuLlwiKX1gLFxuICAgIH0pKTtcbiAgICBsaXN0RW50cnlQcm9taXNlLnB1c2goZW50cnlJbmZvKTtcbiAgfVxuXG4gIC8vIFJlYWQgZmlsZUluZm8gaW4gcGFyYWxsZWxcbiAgZm9yIGF3YWl0IChjb25zdCBlbnRyeSBvZiBEZW5vLnJlYWREaXIoZGlyUGF0aCkpIHtcbiAgICBpZiAoIXNob3dEb3RmaWxlcyAmJiBlbnRyeS5uYW1lWzBdID09PSBcIi5cIikge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihkaXJQYXRoLCBlbnRyeS5uYW1lKTtcbiAgICBjb25zdCBmaWxlVXJsID0gZW5jb2RlVVJJQ29tcG9uZW50KHBvc2l4Sm9pbihkaXJVcmwsIGVudHJ5Lm5hbWUpKVxuICAgICAgLnJlcGxhY2VBbGwoXCIlMkZcIiwgXCIvXCIpO1xuXG4gICAgbGlzdEVudHJ5UHJvbWlzZS5wdXNoKChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlSW5mbyA9IGF3YWl0IERlbm8uc3RhdChmaWxlUGF0aCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbW9kZTogbW9kZVRvU3RyaW5nKGVudHJ5LmlzRGlyZWN0b3J5LCBmaWxlSW5mby5tb2RlKSxcbiAgICAgICAgICBzaXplOiBlbnRyeS5pc0ZpbGUgPyBmb3JtYXRCeXRlcyhmaWxlSW5mby5zaXplID8/IDApIDogXCJcIixcbiAgICAgICAgICBuYW1lOiBgJHtlbnRyeS5uYW1lfSR7ZW50cnkuaXNEaXJlY3RvcnkgPyBcIi9cIiA6IFwiXCJ9YCxcbiAgICAgICAgICB1cmw6IGAke3VybFJvb3R9JHtmaWxlVXJsfSR7ZW50cnkuaXNEaXJlY3RvcnkgPyBcIi9cIiA6IFwiXCJ9YCxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIE5vdGU6IERlbm8uc3RhdCBmb3Igd2luZG93cyBzeXN0ZW0gZmlsZXMgbWF5IGJlIHJlamVjdGVkIHdpdGggb3MgZXJyb3IgMzIuXG4gICAgICAgIGlmICghb3B0aW9ucy5xdWlldCkgbG9nRXJyb3IoZXJyb3IpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1vZGU6IFwiKHVua25vd24gbW9kZSlcIixcbiAgICAgICAgICBzaXplOiBcIlwiLFxuICAgICAgICAgIG5hbWU6IGAke2VudHJ5Lm5hbWV9JHtlbnRyeS5pc0RpcmVjdG9yeSA/IFwiL1wiIDogXCJcIn1gLFxuICAgICAgICAgIHVybDogYCR7dXJsUm9vdH0ke2ZpbGVVcmx9JHtlbnRyeS5pc0RpcmVjdG9yeSA/IFwiL1wiIDogXCJcIn1gLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pKCkpO1xuICB9XG5cbiAgY29uc3QgbGlzdEVudHJ5ID0gYXdhaXQgUHJvbWlzZS5hbGwobGlzdEVudHJ5UHJvbWlzZSk7XG4gIGxpc3RFbnRyeS5zb3J0KChhLCBiKSA9PlxuICAgIGEubmFtZS50b0xvd2VyQ2FzZSgpID4gYi5uYW1lLnRvTG93ZXJDYXNlKCkgPyAxIDogLTFcbiAgKTtcbiAgY29uc3QgZm9ybWF0dGVkRGlyVXJsID0gYCR7ZGlyVXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vYDtcbiAgY29uc3QgcGFnZSA9IGRpclZpZXdlclRlbXBsYXRlKGZvcm1hdHRlZERpclVybCwgbGlzdEVudHJ5KTtcblxuICBjb25zdCBoZWFkZXJzID0gY3JlYXRlQmFzZUhlYWRlcnMoKTtcbiAgaGVhZGVycy5zZXQoXCJjb250ZW50LXR5cGVcIiwgXCJ0ZXh0L2h0bWw7IGNoYXJzZXQ9VVRGLThcIik7XG5cbiAgY29uc3Qgc3RhdHVzID0gU1RBVFVTX0NPREUuT0s7XG4gIHJldHVybiBuZXcgUmVzcG9uc2UocGFnZSwge1xuICAgIHN0YXR1cyxcbiAgICBzdGF0dXNUZXh0OiBTVEFUVVNfVEVYVFtzdGF0dXNdLFxuICAgIGhlYWRlcnMsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXJ2ZUZhbGxiYWNrKG1heWJlRXJyb3I6IHVua25vd24pOiBSZXNwb25zZSB7XG4gIGlmIChtYXliZUVycm9yIGluc3RhbmNlb2YgVVJJRXJyb3IpIHtcbiAgICByZXR1cm4gY3JlYXRlU3RhbmRhcmRSZXNwb25zZShTVEFUVVNfQ09ERS5CYWRSZXF1ZXN0KTtcbiAgfVxuXG4gIGlmIChtYXliZUVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpIHtcbiAgICByZXR1cm4gY3JlYXRlU3RhbmRhcmRSZXNwb25zZShTVEFUVVNfQ09ERS5Ob3RGb3VuZCk7XG4gIH1cblxuICByZXR1cm4gY3JlYXRlU3RhbmRhcmRSZXNwb25zZShTVEFUVVNfQ09ERS5JbnRlcm5hbFNlcnZlckVycm9yKTtcbn1cblxuZnVuY3Rpb24gc2VydmVyTG9nKHJlcTogUmVxdWVzdCwgc3RhdHVzOiBudW1iZXIpIHtcbiAgY29uc3QgZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgZGF0ZUZtdCA9IGBbJHtkLnNsaWNlKDAsIDEwKX0gJHtkLnNsaWNlKDExLCAxOSl9XWA7XG4gIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxLnVybCk7XG4gIGNvbnN0IHMgPSBgJHtkYXRlRm10fSBbJHtyZXEubWV0aG9kfV0gJHt1cmwucGF0aG5hbWV9JHt1cmwuc2VhcmNofSAke3N0YXR1c31gO1xuICAvLyB1c2luZyBjb25zb2xlLmRlYnVnIGluc3RlYWQgb2YgY29uc29sZS5sb2cgc28gY2hyb21lIGluc3BlY3QgdXNlcnMgY2FuIGhpZGUgcmVxdWVzdCBsb2dzXG4gIGNvbnNvbGUuZGVidWcocyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJhc2VIZWFkZXJzKCk6IEhlYWRlcnMge1xuICByZXR1cm4gbmV3IEhlYWRlcnMoe1xuICAgIHNlcnZlcjogXCJkZW5vXCIsXG4gICAgLy8gU2V0IFwiYWNjZXB0LXJhbmdlc1wiIHNvIHRoYXQgdGhlIGNsaWVudCBrbm93cyBpdCBjYW4gbWFrZSByYW5nZSByZXF1ZXN0cyBvbiBmdXR1cmUgcmVxdWVzdHNcbiAgICBcImFjY2VwdC1yYW5nZXNcIjogXCJieXRlc1wiLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gZGlyVmlld2VyVGVtcGxhdGUoZGlybmFtZTogc3RyaW5nLCBlbnRyaWVzOiBFbnRyeUluZm9bXSk6IHN0cmluZyB7XG4gIGNvbnN0IHBhdGhzID0gZGlybmFtZS5zcGxpdChcIi9cIik7XG5cbiAgcmV0dXJuIGBcbiAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgIDxoZWFkPlxuICAgICAgICA8bWV0YSBjaGFyc2V0PVwiVVRGLThcIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidmlld3BvcnRcIiBjb250ZW50PVwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMFwiIC8+XG4gICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJYLVVBLUNvbXBhdGlibGVcIiBjb250ZW50PVwiaWU9ZWRnZVwiIC8+XG4gICAgICAgIDx0aXRsZT5EZW5vIEZpbGUgU2VydmVyPC90aXRsZT5cbiAgICAgICAgPHN0eWxlPlxuICAgICAgICAgIDpyb290IHtcbiAgICAgICAgICAgIC0tYmFja2dyb3VuZC1jb2xvcjogI2ZhZmFmYTtcbiAgICAgICAgICAgIC0tY29sb3I6IHJnYmEoMCwgMCwgMCwgMC44Nyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIEBtZWRpYSAocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspIHtcbiAgICAgICAgICAgIDpyb290IHtcbiAgICAgICAgICAgICAgLS1iYWNrZ3JvdW5kLWNvbG9yOiAjMjkyOTI5O1xuICAgICAgICAgICAgICAtLWNvbG9yOiAjZmZmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhlYWQge1xuICAgICAgICAgICAgICBjb2xvcjogIzdmN2Y3ZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgQG1lZGlhIChtaW4td2lkdGg6IDk2MHB4KSB7XG4gICAgICAgICAgICBtYWluIHtcbiAgICAgICAgICAgICAgbWF4LXdpZHRoOiA5NjBweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICBwYWRkaW5nLWxlZnQ6IDMycHg7XG4gICAgICAgICAgICAgIHBhZGRpbmctcmlnaHQ6IDMycHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIEBtZWRpYSAobWluLXdpZHRoOiA2MDBweCkge1xuICAgICAgICAgICAgbWFpbiB7XG4gICAgICAgICAgICAgIHBhZGRpbmctbGVmdDogMjRweDtcbiAgICAgICAgICAgICAgcGFkZGluZy1yaWdodDogMjRweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYm9keSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS1jb2xvcik7XG4gICAgICAgICAgICBmb250LWZhbWlseTogXCJSb2JvdG9cIiwgXCJIZWx2ZXRpY2FcIiwgXCJBcmlhbFwiLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxLjQzO1xuICAgICAgICAgICAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYSB7XG4gICAgICAgICAgICBjb2xvcjogIzIxOTZmMztcbiAgICAgICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYTpob3ZlciB7XG4gICAgICAgICAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhlYWQge1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogbGVmdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhlYWQgdGgge1xuICAgICAgICAgICAgcGFkZGluZy1ib3R0b206IDEycHg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRhYmxlIHRkIHtcbiAgICAgICAgICAgIHBhZGRpbmc6IDZweCAzNnB4IDZweCAwcHg7XG4gICAgICAgICAgfVxuICAgICAgICAgIC5zaXplIHtcbiAgICAgICAgICAgIHRleHQtYWxpZ246IHJpZ2h0O1xuICAgICAgICAgICAgcGFkZGluZzogNnB4IDEycHggNnB4IDI0cHg7XG4gICAgICAgICAgfVxuICAgICAgICAgIC5tb2RlIHtcbiAgICAgICAgICAgIGZvbnQtZmFtaWx5OiBtb25vc3BhY2UsIG1vbm9zcGFjZTtcbiAgICAgICAgICB9XG4gICAgICAgIDwvc3R5bGU+XG4gICAgICA8L2hlYWQ+XG4gICAgICA8Ym9keT5cbiAgICAgICAgPG1haW4+XG4gICAgICAgICAgPGgxPkluZGV4IG9mXG4gICAgICAgICAgPGEgaHJlZj1cIi9cIj5ob21lPC9hPiR7XG4gICAgcGF0aHNcbiAgICAgIC5tYXAoKHBhdGgsIGluZGV4LCBhcnJheSkgPT4ge1xuICAgICAgICBpZiAocGF0aCA9PT0gXCJcIikgcmV0dXJuIFwiXCI7XG4gICAgICAgIGNvbnN0IGxpbmsgPSBhcnJheS5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oXCIvXCIpO1xuICAgICAgICByZXR1cm4gYDxhIGhyZWY9XCIke2xpbmt9XCI+JHtwYXRofTwvYT5gO1xuICAgICAgfSlcbiAgICAgIC5qb2luKFwiL1wiKVxuICB9XG4gICAgICAgICAgPC9oMT5cbiAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGg+TW9kZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPlNpemU8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAke1xuICAgIGVudHJpZXNcbiAgICAgIC5tYXAoXG4gICAgICAgIChlbnRyeSkgPT4gYFxuICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJtb2RlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgJHtlbnRyeS5tb2RlfVxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJzaXplXCI+XG4gICAgICAgICAgICAgICAgICAgICAgJHtlbnRyeS5zaXplfVxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7ZW50cnkudXJsfVwiPiR7ZW50cnkubmFtZX08L2E+XG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIGAsXG4gICAgICApXG4gICAgICAuam9pbihcIlwiKVxuICB9XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9tYWluPlxuICAgICAgPC9ib2R5PlxuICAgIDwvaHRtbD5cbiAgYDtcbn1cblxuLyoqIEludGVyZmFjZSBmb3Igc2VydmVEaXIgb3B0aW9ucy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VydmVEaXJPcHRpb25zIHtcbiAgLyoqIFNlcnZlcyB0aGUgZmlsZXMgdW5kZXIgdGhlIGdpdmVuIGRpcmVjdG9yeSByb290LiBEZWZhdWx0cyB0byB5b3VyIGN1cnJlbnQgZGlyZWN0b3J5LlxuICAgKlxuICAgKiBAZGVmYXVsdCB7XCIuXCJ9XG4gICAqL1xuICBmc1Jvb3Q/OiBzdHJpbmc7XG4gIC8qKiBTcGVjaWZpZWQgdGhhdCBwYXJ0IGlzIHN0cmlwcGVkIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgcmVxdWVzdGVkIHBhdGhuYW1lLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7dW5kZWZpbmVkfVxuICAgKi9cbiAgdXJsUm9vdD86IHN0cmluZztcbiAgLyoqIEVuYWJsZSBkaXJlY3RvcnkgbGlzdGluZy5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgc2hvd0Rpckxpc3Rpbmc/OiBib29sZWFuO1xuICAvKiogU2VydmVzIGRvdGZpbGVzLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBzaG93RG90ZmlsZXM/OiBib29sZWFuO1xuICAvKiogU2VydmVzIGluZGV4Lmh0bWwgYXMgdGhlIGluZGV4IGZpbGUgb2YgdGhlIGRpcmVjdG9yeS5cbiAgICpcbiAgICogQGRlZmF1bHQge3RydWV9XG4gICAqL1xuICBzaG93SW5kZXg/OiBib29sZWFuO1xuICAvKiogRW5hYmxlIENPUlMgdmlhIHRoZSBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIGhlYWRlci5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgZW5hYmxlQ29ycz86IGJvb2xlYW47XG4gIC8qKiBEbyBub3QgcHJpbnQgcmVxdWVzdCBsZXZlbCBsb2dzLiBEZWZhdWx0cyB0byBmYWxzZS5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgcXVpZXQ/OiBib29sZWFuO1xuICAvKiogVGhlIGFsZ29yaXRobSB0byB1c2UgZm9yIGdlbmVyYXRpbmcgdGhlIEVUYWcuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtcIlNIQS0yNTZcIn1cbiAgICovXG4gIGV0YWdBbGdvcml0aG0/OiBBbGdvcml0aG1JZGVudGlmaWVyO1xuICAvKiogSGVhZGVycyB0byBhZGQgdG8gZWFjaCByZXNwb25zZVxuICAgKlxuICAgKiBAZGVmYXVsdCB7W119XG4gICAqL1xuICBoZWFkZXJzPzogc3RyaW5nW107XG59XG5cbi8qKlxuICogU2VydmVzIHRoZSBmaWxlcyB1bmRlciB0aGUgZ2l2ZW4gZGlyZWN0b3J5IHJvb3QgKG9wdHMuZnNSb290KS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgc2VydmVEaXIgfSBmcm9tIFwiQHN0ZC9odHRwL2ZpbGUtc2VydmVyXCI7XG4gKlxuICogRGVuby5zZXJ2ZSgocmVxKSA9PiB7XG4gKiAgIGNvbnN0IHBhdGhuYW1lID0gbmV3IFVSTChyZXEudXJsKS5wYXRobmFtZTtcbiAqICAgaWYgKHBhdGhuYW1lLnN0YXJ0c1dpdGgoXCIvc3RhdGljXCIpKSB7XG4gKiAgICAgcmV0dXJuIHNlcnZlRGlyKHJlcSwge1xuICogICAgICAgZnNSb290OiBcInBhdGgvdG8vc3RhdGljL2ZpbGVzL2RpclwiLFxuICogICAgIH0pO1xuICogICB9XG4gKiAgIC8vIERvIGR5bmFtaWMgcmVzcG9uc2VzXG4gKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoKTtcbiAqIH0pO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgT3B0aW9uYWxseSB5b3UgY2FuIHBhc3MgYHVybFJvb3RgIG9wdGlvbi4gSWYgaXQncyBzcGVjaWZpZWQgdGhhdCBwYXJ0IGlzIHN0cmlwcGVkIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgcmVxdWVzdGVkIHBhdGhuYW1lLlxuICpcbiAqIGBgYHRzIG5vLWV2YWxcbiAqIGltcG9ydCB7IHNlcnZlRGlyIH0gZnJvbSBcIkBzdGQvaHR0cC9maWxlLXNlcnZlclwiO1xuICpcbiAqIC8vIC4uLlxuICogc2VydmVEaXIobmV3IFJlcXVlc3QoXCJodHRwOi8vbG9jYWxob3N0L3N0YXRpYy9wYXRoL3RvL2ZpbGVcIiksIHtcbiAqICAgZnNSb290OiBcInB1YmxpY1wiLFxuICogICB1cmxSb290OiBcInN0YXRpY1wiLFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBUaGUgYWJvdmUgZXhhbXBsZSBzZXJ2ZXMgYC4vcHVibGljL3BhdGgvdG8vZmlsZWAgZm9yIHRoZSByZXF1ZXN0IHRvIGAvc3RhdGljL3BhdGgvdG8vZmlsZWAuXG4gKlxuICogQHBhcmFtIHJlcSBUaGUgcmVxdWVzdCB0byBoYW5kbGVcbiAqIEBwYXJhbSBvcHRzIEFkZGl0aW9uYWwgb3B0aW9ucy5cbiAqIEByZXR1cm5zIEEgcmVzcG9uc2UgZm9yIHRoZSByZXF1ZXN0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VydmVEaXIoXG4gIHJlcTogUmVxdWVzdCxcbiAgb3B0czogU2VydmVEaXJPcHRpb25zID0ge30sXG4pOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGxldCByZXNwb25zZTogUmVzcG9uc2U7XG4gIHRyeSB7XG4gICAgcmVzcG9uc2UgPSBhd2FpdCBjcmVhdGVTZXJ2ZURpclJlc3BvbnNlKHJlcSwgb3B0cyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKCFvcHRzLnF1aWV0KSBsb2dFcnJvcihlcnJvcik7XG4gICAgcmVzcG9uc2UgPSBzZXJ2ZUZhbGxiYWNrKGVycm9yKTtcbiAgfVxuXG4gIC8vIERvIG5vdCB1cGRhdGUgdGhlIGhlYWRlciBpZiB0aGUgcmVzcG9uc2UgaXMgYSAzMDEgcmVkaXJlY3QuXG4gIGNvbnN0IGlzUmVkaXJlY3RSZXNwb25zZSA9IGlzUmVkaXJlY3RTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKTtcblxuICBpZiAob3B0cy5lbmFibGVDb3JzICYmICFpc1JlZGlyZWN0UmVzcG9uc2UpIHtcbiAgICByZXNwb25zZS5oZWFkZXJzLmFwcGVuZChcImFjY2Vzcy1jb250cm9sLWFsbG93LW9yaWdpblwiLCBcIipcIik7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5hcHBlbmQoXG4gICAgICBcImFjY2Vzcy1jb250cm9sLWFsbG93LWhlYWRlcnNcIixcbiAgICAgIFwiT3JpZ2luLCBYLVJlcXVlc3RlZC1XaXRoLCBDb250ZW50LVR5cGUsIEFjY2VwdCwgUmFuZ2VcIixcbiAgICApO1xuICB9XG5cbiAgaWYgKCFvcHRzLnF1aWV0KSBzZXJ2ZXJMb2cocmVxLCByZXNwb25zZS5zdGF0dXMpO1xuXG4gIGlmIChvcHRzLmhlYWRlcnMgJiYgIWlzUmVkaXJlY3RSZXNwb25zZSkge1xuICAgIGZvciAoY29uc3QgaGVhZGVyIG9mIG9wdHMuaGVhZGVycykge1xuICAgICAgY29uc3QgaGVhZGVyU3BsaXQgPSBoZWFkZXIuc3BsaXQoXCI6XCIpO1xuICAgICAgY29uc3QgbmFtZSA9IGhlYWRlclNwbGl0WzBdITtcbiAgICAgIGNvbnN0IHZhbHVlID0gaGVhZGVyU3BsaXQuc2xpY2UoMSkuam9pbihcIjpcIik7XG4gICAgICByZXNwb25zZS5oZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVTZXJ2ZURpclJlc3BvbnNlKFxuICByZXE6IFJlcXVlc3QsXG4gIG9wdHM6IFNlcnZlRGlyT3B0aW9ucyxcbikge1xuICBjb25zdCB0YXJnZXQgPSBvcHRzLmZzUm9vdCB8fCBcIi5cIjtcbiAgY29uc3QgdXJsUm9vdCA9IG9wdHMudXJsUm9vdDtcbiAgY29uc3Qgc2hvd0luZGV4ID0gb3B0cy5zaG93SW5kZXggPz8gdHJ1ZTtcbiAgY29uc3Qgc2hvd0RvdGZpbGVzID0gb3B0cy5zaG93RG90ZmlsZXMgfHwgZmFsc2U7XG4gIGNvbnN0IHsgZXRhZ0FsZ29yaXRobSwgc2hvd0Rpckxpc3RpbmcsIHF1aWV0IH0gPSBvcHRzO1xuXG4gIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxLnVybCk7XG4gIGNvbnN0IGRlY29kZWRVcmwgPSBkZWNvZGVVUklDb21wb25lbnQodXJsLnBhdGhuYW1lKTtcbiAgbGV0IG5vcm1hbGl6ZWRQYXRoID0gcG9zaXhOb3JtYWxpemUoZGVjb2RlZFVybCk7XG5cbiAgaWYgKHVybFJvb3QgJiYgIW5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgoXCIvXCIgKyB1cmxSb290KSkge1xuICAgIHJldHVybiBjcmVhdGVTdGFuZGFyZFJlc3BvbnNlKFNUQVRVU19DT0RFLk5vdEZvdW5kKTtcbiAgfVxuXG4gIC8vIFJlZGlyZWN0IHBhdGhzIGxpa2UgYC9mb28vLy8vYmFyYCBhbmQgYC9mb28vYmFyLy8vLy9gIHRvIG5vcm1hbGl6ZWQgcGF0aHMuXG4gIGlmIChub3JtYWxpemVkUGF0aCAhPT0gZGVjb2RlZFVybCkge1xuICAgIHVybC5wYXRobmFtZSA9IG5vcm1hbGl6ZWRQYXRoO1xuICAgIHJldHVybiBSZXNwb25zZS5yZWRpcmVjdCh1cmwsIDMwMSk7XG4gIH1cblxuICBpZiAodXJsUm9vdCkge1xuICAgIG5vcm1hbGl6ZWRQYXRoID0gbm9ybWFsaXplZFBhdGgucmVwbGFjZSh1cmxSb290LCBcIlwiKTtcbiAgfVxuXG4gIC8vIFJlbW92ZSB0cmFpbGluZyBzbGFzaGVzIHRvIGF2b2lkIEVOT0VOVCBlcnJvcnNcbiAgLy8gd2hlbiBhY2Nlc3NpbmcgYSBwYXRoIHRvIGEgZmlsZSB3aXRoIGEgdHJhaWxpbmcgc2xhc2guXG4gIGlmIChub3JtYWxpemVkUGF0aC5lbmRzV2l0aChcIi9cIikpIHtcbiAgICBub3JtYWxpemVkUGF0aCA9IG5vcm1hbGl6ZWRQYXRoLnNsaWNlKDAsIC0xKTtcbiAgfVxuXG4gIGNvbnN0IGZzUGF0aCA9IGpvaW4odGFyZ2V0LCBub3JtYWxpemVkUGF0aCk7XG4gIGNvbnN0IGZpbGVJbmZvID0gYXdhaXQgRGVuby5zdGF0KGZzUGF0aCk7XG5cbiAgLy8gRm9yIGZpbGVzLCByZW1vdmUgdGhlIHRyYWlsaW5nIHNsYXNoIGZyb20gdGhlIHBhdGguXG4gIGlmIChmaWxlSW5mby5pc0ZpbGUgJiYgdXJsLnBhdGhuYW1lLmVuZHNXaXRoKFwiL1wiKSkge1xuICAgIHVybC5wYXRobmFtZSA9IHVybC5wYXRobmFtZS5zbGljZSgwLCAtMSk7XG4gICAgcmV0dXJuIFJlc3BvbnNlLnJlZGlyZWN0KHVybCwgMzAxKTtcbiAgfVxuICAvLyBGb3IgZGlyZWN0b3JpZXMsIHRoZSBwYXRoIG11c3QgaGF2ZSBhIHRyYWlsaW5nIHNsYXNoLlxuICBpZiAoZmlsZUluZm8uaXNEaXJlY3RvcnkgJiYgIXVybC5wYXRobmFtZS5lbmRzV2l0aChcIi9cIikpIHtcbiAgICAvLyBPbiBkaXJlY3RvcnkgbGlzdGluZyBwYWdlcyxcbiAgICAvLyBpZiB0aGUgY3VycmVudCBVUkwncyBwYXRobmFtZSBkb2Vzbid0IGVuZCB3aXRoIGEgc2xhc2gsIGFueVxuICAgIC8vIHJlbGF0aXZlIFVSTHMgaW4gdGhlIGluZGV4IGZpbGUgd2lsbCByZXNvbHZlIGFnYWluc3QgdGhlIHBhcmVudFxuICAgIC8vIGRpcmVjdG9yeSwgcmF0aGVyIHRoYW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5LiBUbyBwcmV2ZW50IHRoYXQsIHdlXG4gICAgLy8gcmV0dXJuIGEgMzAxIHJlZGlyZWN0IHRvIHRoZSBVUkwgd2l0aCBhIHNsYXNoLlxuICAgIHVybC5wYXRobmFtZSArPSBcIi9cIjtcbiAgICByZXR1cm4gUmVzcG9uc2UucmVkaXJlY3QodXJsLCAzMDEpO1xuICB9XG5cbiAgLy8gaWYgdGFyZ2V0IGlzIGZpbGUsIHNlcnZlIGZpbGUuXG4gIGlmICghZmlsZUluZm8uaXNEaXJlY3RvcnkpIHtcbiAgICByZXR1cm4gc2VydmVGaWxlKHJlcSwgZnNQYXRoLCB7XG4gICAgICBldGFnQWxnb3JpdGhtLFxuICAgICAgZmlsZUluZm8sXG4gICAgfSk7XG4gIH1cblxuICAvLyBpZiB0YXJnZXQgaXMgZGlyZWN0b3J5LCBzZXJ2ZSBpbmRleCBvciBkaXIgbGlzdGluZy5cbiAgaWYgKHNob3dJbmRleCkgeyAvLyBzZXJ2ZSBpbmRleC5odG1sXG4gICAgY29uc3QgaW5kZXhQYXRoID0gam9pbihmc1BhdGgsIFwiaW5kZXguaHRtbFwiKTtcblxuICAgIGxldCBpbmRleEZpbGVJbmZvOiBEZW5vLkZpbGVJbmZvIHwgdW5kZWZpbmVkO1xuICAgIHRyeSB7XG4gICAgICBpbmRleEZpbGVJbmZvID0gYXdhaXQgRGVuby5sc3RhdChpbmRleFBhdGgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSkge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICAgIC8vIHNraXAgTm90IEZvdW5kIGVycm9yXG4gICAgfVxuXG4gICAgaWYgKGluZGV4RmlsZUluZm8/LmlzRmlsZSkge1xuICAgICAgcmV0dXJuIHNlcnZlRmlsZShyZXEsIGluZGV4UGF0aCwge1xuICAgICAgICBldGFnQWxnb3JpdGhtLFxuICAgICAgICBmaWxlSW5mbzogaW5kZXhGaWxlSW5mbyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzaG93RGlyTGlzdGluZykgeyAvLyBzZXJ2ZSBkaXJlY3RvcnkgbGlzdFxuICAgIHJldHVybiBzZXJ2ZURpckluZGV4KGZzUGF0aCwgeyB1cmxSb290LCBzaG93RG90ZmlsZXMsIHRhcmdldCwgcXVpZXQgfSk7XG4gIH1cblxuICByZXR1cm4gY3JlYXRlU3RhbmRhcmRSZXNwb25zZShTVEFUVVNfQ09ERS5Ob3RGb3VuZCk7XG59XG5cbmZ1bmN0aW9uIGxvZ0Vycm9yKGVycm9yOiB1bmtub3duKSB7XG4gIGNvbnNvbGUuZXJyb3IocmVkKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogYCR7ZXJyb3J9YCkpO1xufVxuXG5mdW5jdGlvbiBtYWluKCkge1xuICBjb25zdCBzZXJ2ZXJBcmdzID0gcGFyc2VBcmdzKERlbm8uYXJncywge1xuICAgIHN0cmluZzogW1wicG9ydFwiLCBcImhvc3RcIiwgXCJjZXJ0XCIsIFwia2V5XCIsIFwiaGVhZGVyXCJdLFxuICAgIGJvb2xlYW46IFtcImhlbHBcIiwgXCJkaXItbGlzdGluZ1wiLCBcImRvdGZpbGVzXCIsIFwiY29yc1wiLCBcInZlcmJvc2VcIiwgXCJ2ZXJzaW9uXCJdLFxuICAgIG5lZ2F0YWJsZTogW1wiZGlyLWxpc3RpbmdcIiwgXCJkb3RmaWxlc1wiLCBcImNvcnNcIl0sXG4gICAgY29sbGVjdDogW1wiaGVhZGVyXCJdLFxuICAgIGRlZmF1bHQ6IHtcbiAgICAgIFwiZGlyLWxpc3RpbmdcIjogdHJ1ZSxcbiAgICAgIGRvdGZpbGVzOiB0cnVlLFxuICAgICAgY29yczogdHJ1ZSxcbiAgICAgIHZlcmJvc2U6IGZhbHNlLFxuICAgICAgdmVyc2lvbjogZmFsc2UsXG4gICAgICBob3N0OiBcIjAuMC4wLjBcIixcbiAgICAgIHBvcnQ6IFwiNDUwN1wiLFxuICAgICAgY2VydDogXCJcIixcbiAgICAgIGtleTogXCJcIixcbiAgICB9LFxuICAgIGFsaWFzOiB7XG4gICAgICBwOiBcInBvcnRcIixcbiAgICAgIGM6IFwiY2VydFwiLFxuICAgICAgazogXCJrZXlcIixcbiAgICAgIGg6IFwiaGVscFwiLFxuICAgICAgdjogXCJ2ZXJib3NlXCIsXG4gICAgICBWOiBcInZlcnNpb25cIixcbiAgICAgIEg6IFwiaGVhZGVyXCIsXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IHBvcnQgPSBOdW1iZXIoc2VydmVyQXJncy5wb3J0KTtcbiAgY29uc3QgaGVhZGVycyA9IHNlcnZlckFyZ3MuaGVhZGVyIHx8IFtdO1xuICBjb25zdCBob3N0ID0gc2VydmVyQXJncy5ob3N0O1xuICBjb25zdCBjZXJ0RmlsZSA9IHNlcnZlckFyZ3MuY2VydDtcbiAgY29uc3Qga2V5RmlsZSA9IHNlcnZlckFyZ3Mua2V5O1xuXG4gIGlmIChzZXJ2ZXJBcmdzLmhlbHApIHtcbiAgICBwcmludFVzYWdlKCk7XG4gICAgRGVuby5leGl0KCk7XG4gIH1cblxuICBpZiAoc2VydmVyQXJncy52ZXJzaW9uKSB7XG4gICAgY29uc29sZS5sb2coYERlbm8gRmlsZSBTZXJ2ZXIgJHtkZW5vQ29uZmlnLnZlcnNpb259YCk7XG4gICAgRGVuby5leGl0KCk7XG4gIH1cblxuICBpZiAoa2V5RmlsZSB8fCBjZXJ0RmlsZSkge1xuICAgIGlmIChrZXlGaWxlID09PSBcIlwiIHx8IGNlcnRGaWxlID09PSBcIlwiKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIi0ta2V5IGFuZCAtLWNlcnQgYXJlIHJlcXVpcmVkIGZvciBUTFNcIik7XG4gICAgICBwcmludFVzYWdlKCk7XG4gICAgICBEZW5vLmV4aXQoMSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgd2lsZCA9IHNlcnZlckFyZ3MuXyBhcyBzdHJpbmdbXTtcbiAgY29uc3QgdGFyZ2V0ID0gcmVzb2x2ZSh3aWxkWzBdID8/IFwiXCIpO1xuXG4gIGNvbnN0IGhhbmRsZXIgPSAocmVxOiBSZXF1ZXN0KTogUHJvbWlzZTxSZXNwb25zZT4gPT4ge1xuICAgIHJldHVybiBzZXJ2ZURpcihyZXEsIHtcbiAgICAgIGZzUm9vdDogdGFyZ2V0LFxuICAgICAgc2hvd0Rpckxpc3Rpbmc6IHNlcnZlckFyZ3NbXCJkaXItbGlzdGluZ1wiXSxcbiAgICAgIHNob3dEb3RmaWxlczogc2VydmVyQXJncy5kb3RmaWxlcyxcbiAgICAgIGVuYWJsZUNvcnM6IHNlcnZlckFyZ3MuY29ycyxcbiAgICAgIHF1aWV0OiAhc2VydmVyQXJncy52ZXJib3NlLFxuICAgICAgaGVhZGVycyxcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCB1c2VUbHMgPSAhIShrZXlGaWxlICYmIGNlcnRGaWxlKTtcblxuICBmdW5jdGlvbiBvbkxpc3Rlbih7IHBvcnQsIGhvc3RuYW1lIH06IHsgcG9ydDogbnVtYmVyOyBob3N0bmFtZTogc3RyaW5nIH0pIHtcbiAgICBjb25zdCBuZXR3b3JrQWRkcmVzcyA9IGdldE5ldHdvcmtBZGRyZXNzKCk7XG4gICAgY29uc3QgcHJvdG9jb2wgPSB1c2VUbHMgPyBcImh0dHBzXCIgOiBcImh0dHBcIjtcbiAgICBsZXQgbWVzc2FnZSA9IGBMaXN0ZW5pbmcgb246XFxuLSBMb2NhbDogJHtwcm90b2NvbH06Ly8ke2hvc3RuYW1lfToke3BvcnR9YDtcbiAgICBpZiAobmV0d29ya0FkZHJlc3MgJiYgIURFTk9fREVQTE9ZTUVOVF9JRCkge1xuICAgICAgbWVzc2FnZSArPSBgXFxuLSBOZXR3b3JrOiAke3Byb3RvY29sfTovLyR7bmV0d29ya0FkZHJlc3N9OiR7cG9ydH1gO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICh1c2VUbHMpIHtcbiAgICBEZW5vLnNlcnZlKHtcbiAgICAgIHBvcnQsXG4gICAgICBob3N0bmFtZTogaG9zdCxcbiAgICAgIG9uTGlzdGVuLFxuICAgICAgY2VydDogRGVuby5yZWFkVGV4dEZpbGVTeW5jKGNlcnRGaWxlKSxcbiAgICAgIGtleTogRGVuby5yZWFkVGV4dEZpbGVTeW5jKGtleUZpbGUpLFxuICAgIH0sIGhhbmRsZXIpO1xuICB9IGVsc2Uge1xuICAgIERlbm8uc2VydmUoe1xuICAgICAgcG9ydCxcbiAgICAgIGhvc3RuYW1lOiBob3N0LFxuICAgICAgb25MaXN0ZW4sXG4gICAgfSwgaGFuZGxlcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJpbnRVc2FnZSgpIHtcbiAgY29uc29sZS5sb2coYERlbm8gRmlsZSBTZXJ2ZXIgJHtkZW5vQ29uZmlnLnZlcnNpb259XG4gIFNlcnZlcyBhIGxvY2FsIGRpcmVjdG9yeSBpbiBIVFRQLlxuXG5JTlNUQUxMOlxuICBkZW5vIGluc3RhbGwgLS1hbGxvdy1uZXQgLS1hbGxvdy1yZWFkIGpzcjpAc3RkL2h0dHBAJHtkZW5vQ29uZmlnLnZlcnNpb259L2ZpbGVfc2VydmVyXG5cblVTQUdFOlxuICBmaWxlX3NlcnZlciBbcGF0aF0gW29wdGlvbnNdXG5cbk9QVElPTlM6XG4gIC1oLCAtLWhlbHAgICAgICAgICAgICBQcmludHMgaGVscCBpbmZvcm1hdGlvblxuICAtcCwgLS1wb3J0IDxQT1JUPiAgICAgU2V0IHBvcnRcbiAgLS1jb3JzICAgICAgICAgICAgICAgIEVuYWJsZSBDT1JTIHZpYSB0aGUgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiBoZWFkZXJcbiAgLS1ob3N0ICAgICA8SE9TVD4gICAgIEhvc3RuYW1lIChkZWZhdWx0IGlzIDAuMC4wLjApXG4gIC1jLCAtLWNlcnQgPEZJTEU+ICAgICBUTFMgY2VydGlmaWNhdGUgZmlsZSAoZW5hYmxlcyBUTFMpXG4gIC1rLCAtLWtleSAgPEZJTEU+ICAgICBUTFMga2V5IGZpbGUgKGVuYWJsZXMgVExTKVxuICAtSCwgLS1oZWFkZXIgPEhFQURFUj4gU2V0cyBhIGhlYWRlciBvbiBldmVyeSByZXF1ZXN0LlxuICAgICAgICAgICAgICAgICAgICAgICAgKGUuZy4gLS1oZWFkZXIgXCJDYWNoZS1Db250cm9sOiBuby1jYWNoZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgVGhpcyBvcHRpb24gY2FuIGJlIHNwZWNpZmllZCBtdWx0aXBsZSB0aW1lcy5cbiAgLS1uby1kaXItbGlzdGluZyAgICAgIERpc2FibGUgZGlyZWN0b3J5IGxpc3RpbmdcbiAgLS1uby1kb3RmaWxlcyAgICAgICAgIERvIG5vdCBzaG93IGRvdGZpbGVzXG4gIC0tbm8tY29ycyAgICAgICAgICAgICBEaXNhYmxlIGNyb3NzLW9yaWdpbiByZXNvdXJjZSBzaGFyaW5nXG4gIC12LCAtLXZlcmJvc2UgICAgICAgICBQcmludCByZXF1ZXN0IGxldmVsIGxvZ3NcbiAgLVYsIC0tdmVyc2lvbiAgICAgICAgIFByaW50IHZlcnNpb24gaW5mb3JtYXRpb25cblxuICBBbGwgVExTIG9wdGlvbnMgYXJlIHJlcXVpcmVkIHdoZW4gb25lIGlzIHByb3ZpZGVkLmApO1xufVxuXG5pZiAoaW1wb3J0Lm1ldGEubWFpbikge1xuICBtYWluKCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLDBFQUEwRTtBQUUxRSxnRUFBZ0U7QUFDaEUsMkNBQTJDO0FBQzNDLGdGQUFnRjtBQUVoRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0JDLEdBRUQsU0FBUyxRQUFRLFNBQVMsUUFBUSx1Q0FBdUM7QUFDekUsU0FBUyxhQUFhLGNBQWMsUUFBUSw0Q0FBNEM7QUFDeEYsU0FBUyxPQUFPLFFBQVEsb0NBQW9DO0FBQzVELFNBQVMsSUFBSSxRQUFRLGlDQUFpQztBQUN0RCxTQUFTLFFBQVEsUUFBUSxxQ0FBcUM7QUFDOUQsU0FBUyxPQUFPLFFBQVEsb0NBQW9DO0FBQzVELFNBQVMsaUJBQWlCLFFBQVEsc0NBQXNDO0FBQ3hFLFNBQVMsV0FBVyxRQUFRLGlEQUFpRDtBQUM3RSxTQUFTLFNBQVMsRUFBRSxXQUFXLFFBQVEsWUFBWTtBQUNuRCxTQUNFLGdCQUFnQixFQUNoQixXQUFXLEVBQ1gsV0FBVyxRQUVOLGNBQWM7QUFDckIsU0FBUyxlQUFlLFFBQVEsK0NBQStDO0FB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
// denoCacheMetadata=6084426566783106625,1264587506791455808