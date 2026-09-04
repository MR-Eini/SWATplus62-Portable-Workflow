// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { delay } from "jsr:/@std/async@^1.0.0-rc.1/delay";
/** Thrown by Server after it has been closed. */ const ERROR_SERVER_CLOSED = "Server closed";
/** Default port for serving HTTP. */ const HTTP_PORT = 80;
/** Default port for serving HTTPS. */ const HTTPS_PORT = 443;
/** Initial backoff delay of 5ms following a temporary accept failure. */ const INITIAL_ACCEPT_BACKOFF_DELAY = 5;
/** Max backoff delay of 1s following a temporary accept failure. */ const MAX_ACCEPT_BACKOFF_DELAY = 1000;
/**
 * Used to construct an HTTP server.
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode Deno.serve} instead.
 *
 * @example Usage
 * ```ts no-eval
 * import { Server } from "@std/http/server";
 *
 * const port = 4505;
 * const handler = (request: Request) => {
 *   const body = `Your user-agent is:\n\n${request.headers.get(
 *    "user-agent",
 *   ) ?? "Unknown"}`;
 *
 *   return new Response(body, { status: 200 });
 * };
 *
 * const server = new Server({ port, handler });
 * ```
 */ export class Server {
  #port;
  #host;
  #handler;
  #closed = false;
  #listeners = new Set();
  #acceptBackoffDelayAbortController = new AbortController();
  #httpConnections = new Set();
  #onError;
  /**
   * Constructs a new HTTP Server instance.
   *
   * @example Usage
   * ```ts no-eval
   * import { Server } from "@std/http/server";
   *
   * const port = 4505;
   * const handler = (request: Request) => {
   *   const body = `Your user-agent is:\n\n${request.headers.get(
   *    "user-agent",
   *   ) ?? "Unknown"}`;
   *
   *   return new Response(body, { status: 200 });
   * };
   *
   * const server = new Server({ port, handler });
   * ```
   *
   * @param serverInit Options for running an HTTP server.
   */ constructor(serverInit){
    this.#port = serverInit.port;
    this.#host = serverInit.hostname;
    this.#handler = serverInit.handler;
    this.#onError = serverInit.onError ?? function(error) {
      console.error(error);
      return new Response("Internal Server Error", {
        status: 500
      });
    };
  }
  /**
   * Accept incoming connections on the given listener, and handle requests on
   * these connections with the given handler.
   *
   * HTTP/2 support is only enabled if the provided Deno.Listener returns TLS
   * connections and was configured with "h2" in the ALPN protocols.
   *
   * Throws a server closed error if called after the server has been closed.
   *
   * Will always close the created listener.
   *
   * @example Usage
   * ```ts no-eval
   * import { Server } from "@std/http/server";
   *
   * const handler = (request: Request) => {
   *   const body = `Your user-agent is:\n\n${request.headers.get(
   *    "user-agent",
   *   ) ?? "Unknown"}`;
   *
   *   return new Response(body, { status: 200 });
   * };
   *
   * const server = new Server({ handler });
   * const listener = Deno.listen({ port: 4505 });
   *
   * console.log("server listening on http://localhost:4505");
   *
   * await server.serve(listener);
   * ```
   *
   * @param listener The listener to accept connections from.
   */ async serve(listener) {
    if (this.#closed) {
      throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
    }
    this.#trackListener(listener);
    try {
      return await this.#accept(listener);
    } finally{
      this.#untrackListener(listener);
      try {
        listener.close();
      } catch  {
      // Listener has already been closed.
      }
    }
  }
  /**
   * Create a listener on the server, accept incoming connections, and handle
   * requests on these connections with the given handler.
   *
   * If the server was constructed without a specified port, 80 is used.
   *
   * If the server was constructed with the hostname omitted from the options, the
   * non-routable meta-address `0.0.0.0` is used.
   *
   * Throws a server closed error if the server has been closed.
   *
   * @example Usage
   * ```ts no-eval
   * import { Server } from "@std/http/server";
   *
   * const port = 4505;
   * const handler = (request: Request) => {
   *   const body = `Your user-agent is:\n\n${request.headers.get(
   *    "user-agent",
   *   ) ?? "Unknown"}`;
   *
   *   return new Response(body, { status: 200 });
   * };
   *
   * const server = new Server({ port, handler });
   *
   * console.log("server listening on http://localhost:4505");
   *
   * await server.listenAndServe();
   * ```
   */ async listenAndServe() {
    if (this.#closed) {
      throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
    }
    const listener = Deno.listen({
      port: this.#port ?? HTTP_PORT,
      hostname: this.#host ?? "0.0.0.0",
      transport: "tcp"
    });
    return await this.serve(listener);
  }
  /**
   * Create a listener on the server, accept incoming connections, upgrade them
   * to TLS, and handle requests on these connections with the given handler.
   *
   * If the server was constructed without a specified port, 443 is used.
   *
   * If the server was constructed with the hostname omitted from the options, the
   * non-routable meta-address `0.0.0.0` is used.
   *
   * Throws a server closed error if the server has been closed.
   *
   * @example Usage
   * ```ts no-eval
   * import { Server } from "@std/http/server";
   *
   * const port = 4505;
   * const handler = (request: Request) => {
   *   const body = `Your user-agent is:\n\n${request.headers.get(
   *    "user-agent",
   *   ) ?? "Unknown"}`;
   *
   *   return new Response(body, { status: 200 });
   * };
   *
   * const server = new Server({ port, handler });
   *
   * const certFile = "/path/to/certFile.crt";
   * const keyFile = "/path/to/keyFile.key";
   *
   * console.log("server listening on https://localhost:4505");
   *
   * await server.listenAndServeTls(certFile, keyFile);
   * ```
   *
   * @param certFile The path to the file containing the TLS certificate.
   * @param keyFile The path to the file containing the TLS private key.
   */ async listenAndServeTls(certFile, keyFile) {
    if (this.#closed) {
      throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
    }
    const listener = Deno.listenTls({
      port: this.#port ?? HTTPS_PORT,
      hostname: this.#host ?? "0.0.0.0",
      cert: Deno.readTextFileSync(certFile),
      key: Deno.readTextFileSync(keyFile),
      transport: "tcp"
    });
    return await this.serve(listener);
  }
  /**
   * Immediately close the server listeners and associated HTTP connections.
   *
   * Throws a server closed error if called after the server has been closed.
   *
   * @example Usage
   * ```ts no-eval
   * import { Server } from "@std/http/server";
   *
   * const handler = (request: Request) => {
   *   const body = `Your user-agent is:\n\n${request.headers.get(
   *    "user-agent",
   *   ) ?? "Unknown"}`;
   *
   *   return new Response(body, { status: 200 });
   * };
   *
   * const server = new Server({ handler });
   * const listener = Deno.listen({ port: 4505 });
   *
   * console.log("server listening on http://localhost:4505");
   *
   * const serve = server.serve(listener);
   * setTimeout(() => {
   *   server.close();
   * }, 1000);
   * await serve;
   * ```
   */ close() {
    if (this.#closed) {
      throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
    }
    this.#closed = true;
    for (const listener of this.#listeners){
      try {
        listener.close();
      } catch  {
      // Listener has already been closed.
      }
    }
    this.#listeners.clear();
    this.#acceptBackoffDelayAbortController.abort();
    for (const httpConn of this.#httpConnections){
      this.#closeHttpConn(httpConn);
    }
    this.#httpConnections.clear();
  }
  /**
   * Get whether the server is closed.
   *
   * @example Usage
   * ```ts no-eval
   * import { Server } from "@std/http/server";
   *
   * const handler = (request: Request) => {
   *   const body = `Your user-agent is:\n\n${request.headers.get(
   *    "user-agent",
   *   ) ?? "Unknown"}`;
   *
   *   return new Response(body, { status: 200 });
   * };
   *
   * const server = new Server({ handler });
   * const listener = Deno.listen({ port: 4505 });
   *
   * console.log("server listening on http://localhost:4505");
   *
   * const serve = server.serve(listener);
   * setTimeout(() => {
   *   server.close();
   * }, 1000);
   * await serve;
   * console.log(server.closed); // returns true
   * ```
   *
   * @returns Whether its closed or not.
   */ get closed() {
    return this.#closed;
  }
  /**
   * Get the list of network addresses the server is listening on.
   *
   * @example Usage
   * ```tsm no-eval
   * import { Server } from "@std/http/server";
   *
   * const handler = (request: Request) => {
   *   const body = `Your user-agent is:\n\n${request.headers.get(
   *    "user-agent",
   *   ) ?? "Unknown"}`;
   *
   *   return new Response(body, { status: 200 });
   * };
   *
   * const server = new Server({ handler });
   * const listener = Deno.listen({ port: 4505 });
   *
   * console.log("server listening on http://localhost:4505");
   *
   * const serve = server.serve(listener);
   * setTimeout(() => {
   *   console.log(server.addrs);
   * }, 1000);
   * await serve;
   * ```
   *
   * @returns List of addresses.
   */ get addrs() {
    return Array.from(this.#listeners).map((listener)=>listener.addr);
  }
  /**
   * Responds to an HTTP request.
   *
   * @param requestEvent The HTTP request to respond to.
   * @param connInfo Information about the underlying connection.
   */ async #respond(requestEvent, connInfo) {
    let response;
    try {
      // Handle the request event, generating a response.
      response = await this.#handler(requestEvent.request, connInfo);
      if (response.bodyUsed && response.body !== null) {
        throw new TypeError("Response body already consumed.");
      }
    } catch (error) {
      // Invoke onError handler when request handler throws.
      response = await this.#onError(error);
    }
    try {
      // Send the response.
      await requestEvent.respondWith(response);
    } catch  {
    // `respondWith()` can throw for various reasons, including downstream and
    // upstream connection errors, as well as errors thrown during streaming
    // of the response content.  In order to avoid false negatives, we ignore
    // the error here and let `serveHttp` close the connection on the
    // following iteration if it is in fact a downstream connection error.
    }
  }
  /**
   * Serves all HTTP requests on a single connection.
   *
   * @param httpConn The HTTP connection to yield requests from.
   * @param connInfo Information about the underlying connection.
   */ async #serveHttp(httpConn, connInfo) {
    while(!this.#closed){
      let requestEvent;
      try {
        // Yield the new HTTP request on the connection.
        requestEvent = await httpConn.nextRequest();
      } catch  {
        break;
      }
      if (requestEvent === null) {
        break;
      }
      // Respond to the request. Note we do not await this async method to
      // allow the connection to handle multiple requests in the case of h2.
      this.#respond(requestEvent, connInfo);
    }
    this.#closeHttpConn(httpConn);
  }
  /**
   * Accepts all connections on a single network listener.
   *
   * @param listener The listener to accept connections from.
   */ async #accept(listener) {
    let acceptBackoffDelay;
    while(!this.#closed){
      let conn;
      try {
        // Wait for a new connection.
        conn = await listener.accept();
      } catch (error) {
        if (// The listener is closed.
        error instanceof Deno.errors.BadResource || // TLS handshake errors.
        error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof || error instanceof Deno.errors.ConnectionReset || error instanceof Deno.errors.NotConnected) {
          // Backoff after transient errors to allow time for the system to
          // recover, and avoid blocking up the event loop with a continuously
          // running loop.
          if (!acceptBackoffDelay) {
            acceptBackoffDelay = INITIAL_ACCEPT_BACKOFF_DELAY;
          } else {
            acceptBackoffDelay *= 2;
          }
          if (acceptBackoffDelay >= MAX_ACCEPT_BACKOFF_DELAY) {
            acceptBackoffDelay = MAX_ACCEPT_BACKOFF_DELAY;
          }
          try {
            await delay(acceptBackoffDelay, {
              signal: this.#acceptBackoffDelayAbortController.signal
            });
          } catch (err) {
            // The backoff delay timer is aborted when closing the server.
            if (!(err instanceof DOMException && err.name === "AbortError")) {
              throw err;
            }
          }
          continue;
        }
        throw error;
      }
      acceptBackoffDelay = undefined;
      // "Upgrade" the network connection into an HTTP connection.
      let httpConn;
      try {
        // deno-lint-ignore no-deprecated-deno-api
        httpConn = Deno.serveHttp(conn);
      } catch  {
        continue;
      }
      // Closing the underlying listener will not close HTTP connections, so we
      // track for closure upon server close.
      this.#trackHttpConnection(httpConn);
      const connInfo = {
        localAddr: conn.localAddr,
        remoteAddr: conn.remoteAddr
      };
      // Serve the requests that arrive on the just-accepted connection. Note
      // we do not await this async method to allow the server to accept new
      // connections.
      this.#serveHttp(httpConn, connInfo);
    }
  }
  /**
   * Untracks and closes an HTTP connection.
   *
   * @param httpConn The HTTP connection to close.
   */ #closeHttpConn(httpConn) {
    this.#untrackHttpConnection(httpConn);
    try {
      httpConn.close();
    } catch  {
    // Connection has already been closed.
    }
  }
  /**
   * Adds the listener to the internal tracking list.
   *
   * @param listener Listener to track.
   */ #trackListener(listener) {
    this.#listeners.add(listener);
  }
  /**
   * Removes the listener from the internal tracking list.
   *
   * @param listener Listener to untrack.
   */ #untrackListener(listener) {
    this.#listeners.delete(listener);
  }
  /**
   * Adds the HTTP connection to the internal tracking list.
   *
   * @param httpConn HTTP connection to track.
   */ #trackHttpConnection(httpConn) {
    this.#httpConnections.add(httpConn);
  }
  /**
   * Removes the HTTP connection from the internal tracking list.
   *
   * @param httpConn HTTP connection to untrack.
   */ #untrackHttpConnection(httpConn) {
    this.#httpConnections.delete(httpConn);
  }
}
/**
 * Constructs a server, accepts incoming connections on the given listener, and
 * handles requests on these connections with the given handler.
 *
 * @example Usage
 * ```ts no-eval
 * import { serveListener } from "@std/http/server";
 *
 * const listener = Deno.listen({ port: 4505 });
 *
 * console.log("server listening on http://localhost:4505");
 *
 * await serveListener(listener, (request) => {
 *   const body = `Your user-agent is:\n\n${request.headers.get(
 *     "user-agent",
 *   ) ?? "Unknown"}`;
 *
 *   return new Response(body, { status: 200 });
 * });
 * ```
 *
 * @param listener The listener to accept connections from.
 * @param handler The handler for individual HTTP requests.
 * @param options Optional serve options.
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode Deno.serve} instead.
 */ export async function serveListener(listener, handler, options) {
  const server = new Server({
    handler,
    onError: options?.onError
  });
  options?.signal?.addEventListener("abort", ()=>server.close(), {
    once: true
  });
  return await server.serve(listener);
}
function hostnameForDisplay(hostname) {
  // If the hostname is "0.0.0.0", we display "localhost" in console
  // because browsers in Windows don't resolve "0.0.0.0".
  // See the discussion in https://github.com/denoland/deno_std/issues/1165
  return hostname === "0.0.0.0" ? "localhost" : hostname;
}
/**
 * Serves HTTP requests with the given handler.
 *
 * You can specify an object with a port and hostname option, which is the
 * address to listen on. The default is port 8000 on hostname "0.0.0.0".
 *
 * @example The below example serves with the port 8000.
 * ```ts no-eval
 * import { serve } from "@std/http/server";
 * serve((_req) => new Response("Hello, world"));
 * ```
 *
 * @example You can change the listening address by the `hostname` and `port` options.
 * The below example serves with the port 3000.
 *
 * ```ts no-eval
 * import { serve } from "@std/http/server";
 * serve((_req) => new Response("Hello, world"), { port: 3000 });
 * ```
 *
 * @example `serve` function prints the message `Listening on http://<hostname>:<port>/`
 * on start-up by default. If you like to change this message, you can specify
 * `onListen` option to override it.
 *
 * ```ts no-eval
 * import { serve } from "@std/http/server";
 * serve((_req) => new Response("Hello, world"), {
 *   onListen({ port, hostname }) {
 *     console.log(`Server started at http://${hostname}:${port}`);
 *     // ... more info specific to your server ..
 *   },
 * });
 * ```
 *
 * @example You can also specify `undefined` or `null` to stop the logging behavior.
 *
 * ```ts no-eval
 * import { serve } from "@std/http/server";
 * serve((_req) => new Response("Hello, world"), { onListen: undefined });
 * ```
 *
 * @param handler The handler for individual HTTP requests.
 * @param options The options. See `ServeInit` documentation for details.
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode Deno.serve} instead.
 */ export async function serve(handler, options = {}) {
  let port = options.port ?? 8000;
  if (typeof port !== "number") {
    port = Number(port);
  }
  const hostname = options.hostname ?? "0.0.0.0";
  const server = new Server({
    port,
    hostname,
    handler,
    onError: options.onError
  });
  options?.signal?.addEventListener("abort", ()=>server.close(), {
    once: true
  });
  const listener = Deno.listen({
    port,
    hostname,
    transport: "tcp"
  });
  const s = server.serve(listener);
  port = server.addrs[0].port;
  if ("onListen" in options) {
    options.onListen?.({
      port,
      hostname
    });
  } else {
    console.log(`Listening on http://${hostnameForDisplay(hostname)}:${port}/`);
  }
  return await s;
}
/**
 * Serves HTTPS requests with the given handler.
 *
 * You must specify `key` or `keyFile` and `cert` or `certFile` options.
 *
 * You can specify an object with a port and hostname option, which is the
 * address to listen on. The default is port 8443 on hostname "0.0.0.0".
 *
 * @example The below example serves with the default port 8443.
 *
 * ```ts no-eval
 * import { serveTls } from "@std/http/server";
 *
 * const cert = "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----\n";
 * const key = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n";
 * serveTls((_req) => new Response("Hello, world"), { cert, key });
 *
 * // Or
 *
 * const certFile = "/path/to/certFile.crt";
 * const keyFile = "/path/to/keyFile.key";
 * serveTls((_req) => new Response("Hello, world"), { certFile, keyFile });
 * ```
 *
 * @example `serveTls` function prints the message `Listening on https://<hostname>:<port>/`
 * on start-up by default. If you like to change this message, you can specify
 * `onListen` option to override it.
 *
 * ```ts no-eval
 * import { serveTls } from "@std/http/server";
 * const certFile = "/path/to/certFile.crt";
 * const keyFile = "/path/to/keyFile.key";
 * serveTls((_req) => new Response("Hello, world"), {
 *   certFile,
 *   keyFile,
 *   onListen({ port, hostname }) {
 *     console.log(`Server started at https://${hostname}:${port}`);
 *     // ... more info specific to your server ..
 *   },
 * });
 * ```
 *
 * @example You can also specify `undefined` or `null` to stop the logging behavior.
 *
 * ```ts no-eval
 * import { serveTls } from "@std/http/server";
 * const certFile = "/path/to/certFile.crt";
 * const keyFile = "/path/to/keyFile.key";
 * serveTls((_req) => new Response("Hello, world"), {
 *   certFile,
 *   keyFile,
 *   onListen: undefined,
 * });
 * ```
 *
 * @param handler The handler for individual HTTPS requests.
 * @param options The options. See `ServeTlsInit` documentation for details.
 * @returns
 *
 * @deprecated This will be removed in 1.0.0. Use {@linkcode Deno.serve} instead.
 */ export async function serveTls(handler, options) {
  if (!options.key && !options.keyFile) {
    throw new Error("TLS config is given, but 'key' is missing.");
  }
  if (!options.cert && !options.certFile) {
    throw new Error("TLS config is given, but 'cert' is missing.");
  }
  let port = options.port ?? 8443;
  if (typeof port !== "number") {
    port = Number(port);
  }
  const hostname = options.hostname ?? "0.0.0.0";
  const server = new Server({
    port,
    hostname,
    handler,
    onError: options.onError
  });
  options?.signal?.addEventListener("abort", ()=>server.close(), {
    once: true
  });
  // deno-lint-ignore no-sync-fn-in-async-fn
  const key = options.key || Deno.readTextFileSync(options.keyFile);
  // deno-lint-ignore no-sync-fn-in-async-fn
  const cert = options.cert || Deno.readTextFileSync(options.certFile);
  const listener = Deno.listenTls({
    port,
    hostname,
    cert,
    key,
    transport: "tcp"
  });
  const s = server.serve(listener);
  port = server.addrs[0].port;
  if ("onListen" in options) {
    options.onListen?.({
      port,
      hostname
    });
  } else {
    console.log(`Listening on https://${hostnameForDisplay(hostname)}:${port}/`);
  }
  return await s;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaHR0cC8wLjIyNC41L3NlcnZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuaW1wb3J0IHsgZGVsYXkgfSBmcm9tIFwianNyOi9Ac3RkL2FzeW5jQF4xLjAuMC1yYy4xL2RlbGF5XCI7XG5cbi8qKiBUaHJvd24gYnkgU2VydmVyIGFmdGVyIGl0IGhhcyBiZWVuIGNsb3NlZC4gKi9cbmNvbnN0IEVSUk9SX1NFUlZFUl9DTE9TRUQgPSBcIlNlcnZlciBjbG9zZWRcIjtcblxuLyoqIERlZmF1bHQgcG9ydCBmb3Igc2VydmluZyBIVFRQLiAqL1xuY29uc3QgSFRUUF9QT1JUID0gODA7XG5cbi8qKiBEZWZhdWx0IHBvcnQgZm9yIHNlcnZpbmcgSFRUUFMuICovXG5jb25zdCBIVFRQU19QT1JUID0gNDQzO1xuXG4vKiogSW5pdGlhbCBiYWNrb2ZmIGRlbGF5IG9mIDVtcyBmb2xsb3dpbmcgYSB0ZW1wb3JhcnkgYWNjZXB0IGZhaWx1cmUuICovXG5jb25zdCBJTklUSUFMX0FDQ0VQVF9CQUNLT0ZGX0RFTEFZID0gNTtcblxuLyoqIE1heCBiYWNrb2ZmIGRlbGF5IG9mIDFzIGZvbGxvd2luZyBhIHRlbXBvcmFyeSBhY2NlcHQgZmFpbHVyZS4gKi9cbmNvbnN0IE1BWF9BQ0NFUFRfQkFDS09GRl9ERUxBWSA9IDEwMDA7XG5cbi8qKlxuICogSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbm5lY3Rpb24gYSByZXF1ZXN0IGFycml2ZWQgb24uXG4gKlxuICogQGRlcHJlY2F0ZWQgVGhpcyB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAuIFVzZSB7QGxpbmtjb2RlIERlbm8uU2VydmVIYW5kbGVySW5mb30gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb25uSW5mbyB7XG4gIC8qKiBUaGUgbG9jYWwgYWRkcmVzcyBvZiB0aGUgY29ubmVjdGlvbi4gKi9cbiAgcmVhZG9ubHkgbG9jYWxBZGRyOiBEZW5vLkFkZHI7XG4gIC8qKiBUaGUgcmVtb3RlIGFkZHJlc3Mgb2YgdGhlIGNvbm5lY3Rpb24uICovXG4gIHJlYWRvbmx5IHJlbW90ZUFkZHI6IERlbm8uQWRkcjtcbn1cblxuLyoqXG4gKiBBIGhhbmRsZXIgZm9yIEhUVFAgcmVxdWVzdHMuIENvbnN1bWVzIGEgcmVxdWVzdCBhbmQgY29ubmVjdGlvbiBpbmZvcm1hdGlvblxuICogYW5kIHJldHVybnMgYSByZXNwb25zZS5cbiAqXG4gKiBJZiBhIGhhbmRsZXIgdGhyb3dzLCB0aGUgc2VydmVyIGNhbGxpbmcgdGhlIGhhbmRsZXIgd2lsbCBhc3N1bWUgdGhlIGltcGFjdFxuICogb2YgdGhlIGVycm9yIGlzIGlzb2xhdGVkIHRvIHRoZSBpbmRpdmlkdWFsIHJlcXVlc3QuIEl0IHdpbGwgY2F0Y2ggdGhlIGVycm9yXG4gKiBhbmQgY2xvc2UgdGhlIHVuZGVybHlpbmcgY29ubmVjdGlvbi5cbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHtAbGlua2NvZGUgRGVuby5TZXJ2ZUhhbmRsZXJ9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCB0eXBlIEhhbmRsZXIgPSAoXG4gIHJlcXVlc3Q6IFJlcXVlc3QsXG4gIGNvbm5JbmZvOiBDb25uSW5mbyxcbikgPT4gUmVzcG9uc2UgfCBQcm9taXNlPFJlc3BvbnNlPjtcblxuLyoqXG4gKiBPcHRpb25zIGZvciBydW5uaW5nIGFuIEhUVFAgc2VydmVyLlxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2Uge0BsaW5rY29kZSBEZW5vLlNlcnZlSW5pdH0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZXJJbml0IGV4dGVuZHMgUGFydGlhbDxEZW5vLkxpc3Rlbk9wdGlvbnM+IHtcbiAgLyoqIFRoZSBoYW5kbGVyIHRvIGludm9rZSBmb3IgaW5kaXZpZHVhbCBIVFRQIHJlcXVlc3RzLiAqL1xuICBoYW5kbGVyOiBIYW5kbGVyO1xuXG4gIC8qKlxuICAgKiBUaGUgaGFuZGxlciB0byBpbnZva2Ugd2hlbiByb3V0ZSBoYW5kbGVycyB0aHJvdyBhbiBlcnJvci5cbiAgICpcbiAgICogVGhlIGRlZmF1bHQgZXJyb3IgaGFuZGxlciBsb2dzIGFuZCByZXR1cm5zIHRoZSBlcnJvciBpbiBKU09OIGZvcm1hdC5cbiAgICovXG4gIG9uRXJyb3I/OiAoZXJyb3I6IHVua25vd24pID0+IFJlc3BvbnNlIHwgUHJvbWlzZTxSZXNwb25zZT47XG59XG5cbi8qKlxuICogVXNlZCB0byBjb25zdHJ1Y3QgYW4gSFRUUCBzZXJ2ZXIuXG4gKlxuICogQGRlcHJlY2F0ZWQgVGhpcyB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAuIFVzZSB7QGxpbmtjb2RlIERlbm8uc2VydmV9IGluc3RlYWQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWV2YWxcbiAqIGltcG9ydCB7IFNlcnZlciB9IGZyb20gXCJAc3RkL2h0dHAvc2VydmVyXCI7XG4gKlxuICogY29uc3QgcG9ydCA9IDQ1MDU7XG4gKiBjb25zdCBoYW5kbGVyID0gKHJlcXVlc3Q6IFJlcXVlc3QpID0+IHtcbiAqICAgY29uc3QgYm9keSA9IGBZb3VyIHVzZXItYWdlbnQgaXM6XFxuXFxuJHtyZXF1ZXN0LmhlYWRlcnMuZ2V0KFxuICogICAgXCJ1c2VyLWFnZW50XCIsXG4gKiAgICkgPz8gXCJVbmtub3duXCJ9YDtcbiAqXG4gKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAqIH07XG4gKlxuICogY29uc3Qgc2VydmVyID0gbmV3IFNlcnZlcih7IHBvcnQsIGhhbmRsZXIgfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFNlcnZlciB7XG4gICNwb3J0PzogbnVtYmVyO1xuICAjaG9zdD86IHN0cmluZztcbiAgI2hhbmRsZXI6IEhhbmRsZXI7XG4gICNjbG9zZWQgPSBmYWxzZTtcbiAgI2xpc3RlbmVyczogU2V0PERlbm8uTGlzdGVuZXI+ID0gbmV3IFNldCgpO1xuICAjYWNjZXB0QmFja29mZkRlbGF5QWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAjaHR0cENvbm5lY3Rpb25zOiBTZXQ8RGVuby5IdHRwQ29ubj4gPSBuZXcgU2V0KCk7XG4gICNvbkVycm9yOiAoZXJyb3I6IHVua25vd24pID0+IFJlc3BvbnNlIHwgUHJvbWlzZTxSZXNwb25zZT47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcgSFRUUCBTZXJ2ZXIgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzIG5vLWV2YWxcbiAgICogaW1wb3J0IHsgU2VydmVyIH0gZnJvbSBcIkBzdGQvaHR0cC9zZXJ2ZXJcIjtcbiAgICpcbiAgICogY29uc3QgcG9ydCA9IDQ1MDU7XG4gICAqIGNvbnN0IGhhbmRsZXIgPSAocmVxdWVzdDogUmVxdWVzdCkgPT4ge1xuICAgKiAgIGNvbnN0IGJvZHkgPSBgWW91ciB1c2VyLWFnZW50IGlzOlxcblxcbiR7cmVxdWVzdC5oZWFkZXJzLmdldChcbiAgICogICAgXCJ1c2VyLWFnZW50XCIsXG4gICAqICAgKSA/PyBcIlVua25vd25cIn1gO1xuICAgKlxuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAgICogfTtcbiAgICpcbiAgICogY29uc3Qgc2VydmVyID0gbmV3IFNlcnZlcih7IHBvcnQsIGhhbmRsZXIgfSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gc2VydmVySW5pdCBPcHRpb25zIGZvciBydW5uaW5nIGFuIEhUVFAgc2VydmVyLlxuICAgKi9cbiAgY29uc3RydWN0b3Ioc2VydmVySW5pdDogU2VydmVySW5pdCkge1xuICAgIHRoaXMuI3BvcnQgPSBzZXJ2ZXJJbml0LnBvcnQ7XG4gICAgdGhpcy4jaG9zdCA9IHNlcnZlckluaXQuaG9zdG5hbWU7XG4gICAgdGhpcy4jaGFuZGxlciA9IHNlcnZlckluaXQuaGFuZGxlcjtcbiAgICB0aGlzLiNvbkVycm9yID0gc2VydmVySW5pdC5vbkVycm9yID8/XG4gICAgICBmdW5jdGlvbiAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXCJJbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcIiwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQWNjZXB0IGluY29taW5nIGNvbm5lY3Rpb25zIG9uIHRoZSBnaXZlbiBsaXN0ZW5lciwgYW5kIGhhbmRsZSByZXF1ZXN0cyBvblxuICAgKiB0aGVzZSBjb25uZWN0aW9ucyB3aXRoIHRoZSBnaXZlbiBoYW5kbGVyLlxuICAgKlxuICAgKiBIVFRQLzIgc3VwcG9ydCBpcyBvbmx5IGVuYWJsZWQgaWYgdGhlIHByb3ZpZGVkIERlbm8uTGlzdGVuZXIgcmV0dXJucyBUTFNcbiAgICogY29ubmVjdGlvbnMgYW5kIHdhcyBjb25maWd1cmVkIHdpdGggXCJoMlwiIGluIHRoZSBBTFBOIHByb3RvY29scy5cbiAgICpcbiAgICogVGhyb3dzIGEgc2VydmVyIGNsb3NlZCBlcnJvciBpZiBjYWxsZWQgYWZ0ZXIgdGhlIHNlcnZlciBoYXMgYmVlbiBjbG9zZWQuXG4gICAqXG4gICAqIFdpbGwgYWx3YXlzIGNsb3NlIHRoZSBjcmVhdGVkIGxpc3RlbmVyLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0cyBuby1ldmFsXG4gICAqIGltcG9ydCB7IFNlcnZlciB9IGZyb20gXCJAc3RkL2h0dHAvc2VydmVyXCI7XG4gICAqXG4gICAqIGNvbnN0IGhhbmRsZXIgPSAocmVxdWVzdDogUmVxdWVzdCkgPT4ge1xuICAgKiAgIGNvbnN0IGJvZHkgPSBgWW91ciB1c2VyLWFnZW50IGlzOlxcblxcbiR7cmVxdWVzdC5oZWFkZXJzLmdldChcbiAgICogICAgXCJ1c2VyLWFnZW50XCIsXG4gICAqICAgKSA/PyBcIlVua25vd25cIn1gO1xuICAgKlxuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAgICogfTtcbiAgICpcbiAgICogY29uc3Qgc2VydmVyID0gbmV3IFNlcnZlcih7IGhhbmRsZXIgfSk7XG4gICAqIGNvbnN0IGxpc3RlbmVyID0gRGVuby5saXN0ZW4oeyBwb3J0OiA0NTA1IH0pO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhcInNlcnZlciBsaXN0ZW5pbmcgb24gaHR0cDovL2xvY2FsaG9zdDo0NTA1XCIpO1xuICAgKlxuICAgKiBhd2FpdCBzZXJ2ZXIuc2VydmUobGlzdGVuZXIpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lciB0byBhY2NlcHQgY29ubmVjdGlvbnMgZnJvbS5cbiAgICovXG4gIGFzeW5jIHNlcnZlKGxpc3RlbmVyOiBEZW5vLkxpc3RlbmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuI2Nsb3NlZCkge1xuICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkh0dHAoRVJST1JfU0VSVkVSX0NMT1NFRCk7XG4gICAgfVxuXG4gICAgdGhpcy4jdHJhY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuI2FjY2VwdChsaXN0ZW5lcik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuI3VudHJhY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxpc3RlbmVyLmNsb3NlKCk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gTGlzdGVuZXIgaGFzIGFscmVhZHkgYmVlbiBjbG9zZWQuXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxpc3RlbmVyIG9uIHRoZSBzZXJ2ZXIsIGFjY2VwdCBpbmNvbWluZyBjb25uZWN0aW9ucywgYW5kIGhhbmRsZVxuICAgKiByZXF1ZXN0cyBvbiB0aGVzZSBjb25uZWN0aW9ucyB3aXRoIHRoZSBnaXZlbiBoYW5kbGVyLlxuICAgKlxuICAgKiBJZiB0aGUgc2VydmVyIHdhcyBjb25zdHJ1Y3RlZCB3aXRob3V0IGEgc3BlY2lmaWVkIHBvcnQsIDgwIGlzIHVzZWQuXG4gICAqXG4gICAqIElmIHRoZSBzZXJ2ZXIgd2FzIGNvbnN0cnVjdGVkIHdpdGggdGhlIGhvc3RuYW1lIG9taXR0ZWQgZnJvbSB0aGUgb3B0aW9ucywgdGhlXG4gICAqIG5vbi1yb3V0YWJsZSBtZXRhLWFkZHJlc3MgYDAuMC4wLjBgIGlzIHVzZWQuXG4gICAqXG4gICAqIFRocm93cyBhIHNlcnZlciBjbG9zZWQgZXJyb3IgaWYgdGhlIHNlcnZlciBoYXMgYmVlbiBjbG9zZWQuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzIG5vLWV2YWxcbiAgICogaW1wb3J0IHsgU2VydmVyIH0gZnJvbSBcIkBzdGQvaHR0cC9zZXJ2ZXJcIjtcbiAgICpcbiAgICogY29uc3QgcG9ydCA9IDQ1MDU7XG4gICAqIGNvbnN0IGhhbmRsZXIgPSAocmVxdWVzdDogUmVxdWVzdCkgPT4ge1xuICAgKiAgIGNvbnN0IGJvZHkgPSBgWW91ciB1c2VyLWFnZW50IGlzOlxcblxcbiR7cmVxdWVzdC5oZWFkZXJzLmdldChcbiAgICogICAgXCJ1c2VyLWFnZW50XCIsXG4gICAqICAgKSA/PyBcIlVua25vd25cIn1gO1xuICAgKlxuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAgICogfTtcbiAgICpcbiAgICogY29uc3Qgc2VydmVyID0gbmV3IFNlcnZlcih7IHBvcnQsIGhhbmRsZXIgfSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKFwic2VydmVyIGxpc3RlbmluZyBvbiBodHRwOi8vbG9jYWxob3N0OjQ1MDVcIik7XG4gICAqXG4gICAqIGF3YWl0IHNlcnZlci5saXN0ZW5BbmRTZXJ2ZSgpO1xuICAgKiBgYGBcbiAgICovXG4gIGFzeW5jIGxpc3RlbkFuZFNlcnZlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLiNjbG9zZWQpIHtcbiAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5IdHRwKEVSUk9SX1NFUlZFUl9DTE9TRUQpO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbmVyID0gRGVuby5saXN0ZW4oe1xuICAgICAgcG9ydDogdGhpcy4jcG9ydCA/PyBIVFRQX1BPUlQsXG4gICAgICBob3N0bmFtZTogdGhpcy4jaG9zdCA/PyBcIjAuMC4wLjBcIixcbiAgICAgIHRyYW5zcG9ydDogXCJ0Y3BcIixcbiAgICB9KTtcblxuICAgIHJldHVybiBhd2FpdCB0aGlzLnNlcnZlKGxpc3RlbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBsaXN0ZW5lciBvbiB0aGUgc2VydmVyLCBhY2NlcHQgaW5jb21pbmcgY29ubmVjdGlvbnMsIHVwZ3JhZGUgdGhlbVxuICAgKiB0byBUTFMsIGFuZCBoYW5kbGUgcmVxdWVzdHMgb24gdGhlc2UgY29ubmVjdGlvbnMgd2l0aCB0aGUgZ2l2ZW4gaGFuZGxlci5cbiAgICpcbiAgICogSWYgdGhlIHNlcnZlciB3YXMgY29uc3RydWN0ZWQgd2l0aG91dCBhIHNwZWNpZmllZCBwb3J0LCA0NDMgaXMgdXNlZC5cbiAgICpcbiAgICogSWYgdGhlIHNlcnZlciB3YXMgY29uc3RydWN0ZWQgd2l0aCB0aGUgaG9zdG5hbWUgb21pdHRlZCBmcm9tIHRoZSBvcHRpb25zLCB0aGVcbiAgICogbm9uLXJvdXRhYmxlIG1ldGEtYWRkcmVzcyBgMC4wLjAuMGAgaXMgdXNlZC5cbiAgICpcbiAgICogVGhyb3dzIGEgc2VydmVyIGNsb3NlZCBlcnJvciBpZiB0aGUgc2VydmVyIGhhcyBiZWVuIGNsb3NlZC5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHMgbm8tZXZhbFxuICAgKiBpbXBvcnQgeyBTZXJ2ZXIgfSBmcm9tIFwiQHN0ZC9odHRwL3NlcnZlclwiO1xuICAgKlxuICAgKiBjb25zdCBwb3J0ID0gNDUwNTtcbiAgICogY29uc3QgaGFuZGxlciA9IChyZXF1ZXN0OiBSZXF1ZXN0KSA9PiB7XG4gICAqICAgY29uc3QgYm9keSA9IGBZb3VyIHVzZXItYWdlbnQgaXM6XFxuXFxuJHtyZXF1ZXN0LmhlYWRlcnMuZ2V0KFxuICAgKiAgICBcInVzZXItYWdlbnRcIixcbiAgICogICApID8/IFwiVW5rbm93blwifWA7XG4gICAqXG4gICAqICAgcmV0dXJuIG5ldyBSZXNwb25zZShib2R5LCB7IHN0YXR1czogMjAwIH0pO1xuICAgKiB9O1xuICAgKlxuICAgKiBjb25zdCBzZXJ2ZXIgPSBuZXcgU2VydmVyKHsgcG9ydCwgaGFuZGxlciB9KTtcbiAgICpcbiAgICogY29uc3QgY2VydEZpbGUgPSBcIi9wYXRoL3RvL2NlcnRGaWxlLmNydFwiO1xuICAgKiBjb25zdCBrZXlGaWxlID0gXCIvcGF0aC90by9rZXlGaWxlLmtleVwiO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhcInNlcnZlciBsaXN0ZW5pbmcgb24gaHR0cHM6Ly9sb2NhbGhvc3Q6NDUwNVwiKTtcbiAgICpcbiAgICogYXdhaXQgc2VydmVyLmxpc3RlbkFuZFNlcnZlVGxzKGNlcnRGaWxlLCBrZXlGaWxlKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBjZXJ0RmlsZSBUaGUgcGF0aCB0byB0aGUgZmlsZSBjb250YWluaW5nIHRoZSBUTFMgY2VydGlmaWNhdGUuXG4gICAqIEBwYXJhbSBrZXlGaWxlIFRoZSBwYXRoIHRvIHRoZSBmaWxlIGNvbnRhaW5pbmcgdGhlIFRMUyBwcml2YXRlIGtleS5cbiAgICovXG4gIGFzeW5jIGxpc3RlbkFuZFNlcnZlVGxzKGNlcnRGaWxlOiBzdHJpbmcsIGtleUZpbGU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLiNjbG9zZWQpIHtcbiAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5IdHRwKEVSUk9SX1NFUlZFUl9DTE9TRUQpO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbmVyID0gRGVuby5saXN0ZW5UbHMoe1xuICAgICAgcG9ydDogdGhpcy4jcG9ydCA/PyBIVFRQU19QT1JULFxuICAgICAgaG9zdG5hbWU6IHRoaXMuI2hvc3QgPz8gXCIwLjAuMC4wXCIsXG4gICAgICBjZXJ0OiBEZW5vLnJlYWRUZXh0RmlsZVN5bmMoY2VydEZpbGUpLFxuICAgICAga2V5OiBEZW5vLnJlYWRUZXh0RmlsZVN5bmMoa2V5RmlsZSksXG4gICAgICB0cmFuc3BvcnQ6IFwidGNwXCIsXG4gICAgICAvLyBBTFBOIHByb3RvY29sIHN1cHBvcnQgbm90IHlldCBzdGFibGUuXG4gICAgICAvLyBhbHBuUHJvdG9jb2xzOiBbXCJoMlwiLCBcImh0dHAvMS4xXCJdLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc2VydmUobGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEltbWVkaWF0ZWx5IGNsb3NlIHRoZSBzZXJ2ZXIgbGlzdGVuZXJzIGFuZCBhc3NvY2lhdGVkIEhUVFAgY29ubmVjdGlvbnMuXG4gICAqXG4gICAqIFRocm93cyBhIHNlcnZlciBjbG9zZWQgZXJyb3IgaWYgY2FsbGVkIGFmdGVyIHRoZSBzZXJ2ZXIgaGFzIGJlZW4gY2xvc2VkLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0cyBuby1ldmFsXG4gICAqIGltcG9ydCB7IFNlcnZlciB9IGZyb20gXCJAc3RkL2h0dHAvc2VydmVyXCI7XG4gICAqXG4gICAqIGNvbnN0IGhhbmRsZXIgPSAocmVxdWVzdDogUmVxdWVzdCkgPT4ge1xuICAgKiAgIGNvbnN0IGJvZHkgPSBgWW91ciB1c2VyLWFnZW50IGlzOlxcblxcbiR7cmVxdWVzdC5oZWFkZXJzLmdldChcbiAgICogICAgXCJ1c2VyLWFnZW50XCIsXG4gICAqICAgKSA/PyBcIlVua25vd25cIn1gO1xuICAgKlxuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAgICogfTtcbiAgICpcbiAgICogY29uc3Qgc2VydmVyID0gbmV3IFNlcnZlcih7IGhhbmRsZXIgfSk7XG4gICAqIGNvbnN0IGxpc3RlbmVyID0gRGVuby5saXN0ZW4oeyBwb3J0OiA0NTA1IH0pO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhcInNlcnZlciBsaXN0ZW5pbmcgb24gaHR0cDovL2xvY2FsaG9zdDo0NTA1XCIpO1xuICAgKlxuICAgKiBjb25zdCBzZXJ2ZSA9IHNlcnZlci5zZXJ2ZShsaXN0ZW5lcik7XG4gICAqIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgKiAgIHNlcnZlci5jbG9zZSgpO1xuICAgKiB9LCAxMDAwKTtcbiAgICogYXdhaXQgc2VydmU7XG4gICAqIGBgYFxuICAgKi9cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMuI2Nsb3NlZCkge1xuICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkh0dHAoRVJST1JfU0VSVkVSX0NMT1NFRCk7XG4gICAgfVxuXG4gICAgdGhpcy4jY2xvc2VkID0gdHJ1ZTtcblxuICAgIGZvciAoY29uc3QgbGlzdGVuZXIgb2YgdGhpcy4jbGlzdGVuZXJzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBsaXN0ZW5lci5jbG9zZSgpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIExpc3RlbmVyIGhhcyBhbHJlYWR5IGJlZW4gY2xvc2VkLlxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuI2xpc3RlbmVycy5jbGVhcigpO1xuXG4gICAgdGhpcy4jYWNjZXB0QmFja29mZkRlbGF5QWJvcnRDb250cm9sbGVyLmFib3J0KCk7XG5cbiAgICBmb3IgKGNvbnN0IGh0dHBDb25uIG9mIHRoaXMuI2h0dHBDb25uZWN0aW9ucykge1xuICAgICAgdGhpcy4jY2xvc2VIdHRwQ29ubihodHRwQ29ubik7XG4gICAgfVxuXG4gICAgdGhpcy4jaHR0cENvbm5lY3Rpb25zLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgdGhlIHNlcnZlciBpcyBjbG9zZWQuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzIG5vLWV2YWxcbiAgICogaW1wb3J0IHsgU2VydmVyIH0gZnJvbSBcIkBzdGQvaHR0cC9zZXJ2ZXJcIjtcbiAgICpcbiAgICogY29uc3QgaGFuZGxlciA9IChyZXF1ZXN0OiBSZXF1ZXN0KSA9PiB7XG4gICAqICAgY29uc3QgYm9keSA9IGBZb3VyIHVzZXItYWdlbnQgaXM6XFxuXFxuJHtyZXF1ZXN0LmhlYWRlcnMuZ2V0KFxuICAgKiAgICBcInVzZXItYWdlbnRcIixcbiAgICogICApID8/IFwiVW5rbm93blwifWA7XG4gICAqXG4gICAqICAgcmV0dXJuIG5ldyBSZXNwb25zZShib2R5LCB7IHN0YXR1czogMjAwIH0pO1xuICAgKiB9O1xuICAgKlxuICAgKiBjb25zdCBzZXJ2ZXIgPSBuZXcgU2VydmVyKHsgaGFuZGxlciB9KTtcbiAgICogY29uc3QgbGlzdGVuZXIgPSBEZW5vLmxpc3Rlbih7IHBvcnQ6IDQ1MDUgfSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKFwic2VydmVyIGxpc3RlbmluZyBvbiBodHRwOi8vbG9jYWxob3N0OjQ1MDVcIik7XG4gICAqXG4gICAqIGNvbnN0IHNlcnZlID0gc2VydmVyLnNlcnZlKGxpc3RlbmVyKTtcbiAgICogc2V0VGltZW91dCgoKSA9PiB7XG4gICAqICAgc2VydmVyLmNsb3NlKCk7XG4gICAqIH0sIDEwMDApO1xuICAgKiBhd2FpdCBzZXJ2ZTtcbiAgICogY29uc29sZS5sb2coc2VydmVyLmNsb3NlZCk7IC8vIHJldHVybnMgdHJ1ZVxuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgV2hldGhlciBpdHMgY2xvc2VkIG9yIG5vdC5cbiAgICovXG4gIGdldCBjbG9zZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuI2Nsb3NlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGxpc3Qgb2YgbmV0d29yayBhZGRyZXNzZXMgdGhlIHNlcnZlciBpcyBsaXN0ZW5pbmcgb24uXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzbSBuby1ldmFsXG4gICAqIGltcG9ydCB7IFNlcnZlciB9IGZyb20gXCJAc3RkL2h0dHAvc2VydmVyXCI7XG4gICAqXG4gICAqIGNvbnN0IGhhbmRsZXIgPSAocmVxdWVzdDogUmVxdWVzdCkgPT4ge1xuICAgKiAgIGNvbnN0IGJvZHkgPSBgWW91ciB1c2VyLWFnZW50IGlzOlxcblxcbiR7cmVxdWVzdC5oZWFkZXJzLmdldChcbiAgICogICAgXCJ1c2VyLWFnZW50XCIsXG4gICAqICAgKSA/PyBcIlVua25vd25cIn1gO1xuICAgKlxuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAgICogfTtcbiAgICpcbiAgICogY29uc3Qgc2VydmVyID0gbmV3IFNlcnZlcih7IGhhbmRsZXIgfSk7XG4gICAqIGNvbnN0IGxpc3RlbmVyID0gRGVuby5saXN0ZW4oeyBwb3J0OiA0NTA1IH0pO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhcInNlcnZlciBsaXN0ZW5pbmcgb24gaHR0cDovL2xvY2FsaG9zdDo0NTA1XCIpO1xuICAgKlxuICAgKiBjb25zdCBzZXJ2ZSA9IHNlcnZlci5zZXJ2ZShsaXN0ZW5lcik7XG4gICAqIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgKiAgIGNvbnNvbGUubG9nKHNlcnZlci5hZGRycyk7XG4gICAqIH0sIDEwMDApO1xuICAgKiBhd2FpdCBzZXJ2ZTtcbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIExpc3Qgb2YgYWRkcmVzc2VzLlxuICAgKi9cbiAgZ2V0IGFkZHJzKCk6IERlbm8uQWRkcltdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLiNsaXN0ZW5lcnMpLm1hcCgobGlzdGVuZXIpID0+IGxpc3RlbmVyLmFkZHIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc3BvbmRzIHRvIGFuIEhUVFAgcmVxdWVzdC5cbiAgICpcbiAgICogQHBhcmFtIHJlcXVlc3RFdmVudCBUaGUgSFRUUCByZXF1ZXN0IHRvIHJlc3BvbmQgdG8uXG4gICAqIEBwYXJhbSBjb25uSW5mbyBJbmZvcm1hdGlvbiBhYm91dCB0aGUgdW5kZXJseWluZyBjb25uZWN0aW9uLlxuICAgKi9cbiAgYXN5bmMgI3Jlc3BvbmQoXG4gICAgcmVxdWVzdEV2ZW50OiBEZW5vLlJlcXVlc3RFdmVudCxcbiAgICBjb25uSW5mbzogQ29ubkluZm8sXG4gICkge1xuICAgIGxldCByZXNwb25zZTogUmVzcG9uc2U7XG4gICAgdHJ5IHtcbiAgICAgIC8vIEhhbmRsZSB0aGUgcmVxdWVzdCBldmVudCwgZ2VuZXJhdGluZyBhIHJlc3BvbnNlLlxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLiNoYW5kbGVyKHJlcXVlc3RFdmVudC5yZXF1ZXN0LCBjb25uSW5mbyk7XG5cbiAgICAgIGlmIChyZXNwb25zZS5ib2R5VXNlZCAmJiByZXNwb25zZS5ib2R5ICE9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJSZXNwb25zZSBib2R5IGFscmVhZHkgY29uc3VtZWQuXCIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAvLyBJbnZva2Ugb25FcnJvciBoYW5kbGVyIHdoZW4gcmVxdWVzdCBoYW5kbGVyIHRocm93cy5cbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgdGhpcy4jb25FcnJvcihlcnJvcik7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFNlbmQgdGhlIHJlc3BvbnNlLlxuICAgICAgYXdhaXQgcmVxdWVzdEV2ZW50LnJlc3BvbmRXaXRoKHJlc3BvbnNlKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGByZXNwb25kV2l0aCgpYCBjYW4gdGhyb3cgZm9yIHZhcmlvdXMgcmVhc29ucywgaW5jbHVkaW5nIGRvd25zdHJlYW0gYW5kXG4gICAgICAvLyB1cHN0cmVhbSBjb25uZWN0aW9uIGVycm9ycywgYXMgd2VsbCBhcyBlcnJvcnMgdGhyb3duIGR1cmluZyBzdHJlYW1pbmdcbiAgICAgIC8vIG9mIHRoZSByZXNwb25zZSBjb250ZW50LiAgSW4gb3JkZXIgdG8gYXZvaWQgZmFsc2UgbmVnYXRpdmVzLCB3ZSBpZ25vcmVcbiAgICAgIC8vIHRoZSBlcnJvciBoZXJlIGFuZCBsZXQgYHNlcnZlSHR0cGAgY2xvc2UgdGhlIGNvbm5lY3Rpb24gb24gdGhlXG4gICAgICAvLyBmb2xsb3dpbmcgaXRlcmF0aW9uIGlmIGl0IGlzIGluIGZhY3QgYSBkb3duc3RyZWFtIGNvbm5lY3Rpb24gZXJyb3IuXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlcnZlcyBhbGwgSFRUUCByZXF1ZXN0cyBvbiBhIHNpbmdsZSBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gaHR0cENvbm4gVGhlIEhUVFAgY29ubmVjdGlvbiB0byB5aWVsZCByZXF1ZXN0cyBmcm9tLlxuICAgKiBAcGFyYW0gY29ubkluZm8gSW5mb3JtYXRpb24gYWJvdXQgdGhlIHVuZGVybHlpbmcgY29ubmVjdGlvbi5cbiAgICovXG4gIGFzeW5jICNzZXJ2ZUh0dHAoaHR0cENvbm46IERlbm8uSHR0cENvbm4sIGNvbm5JbmZvOiBDb25uSW5mbykge1xuICAgIHdoaWxlICghdGhpcy4jY2xvc2VkKSB7XG4gICAgICBsZXQgcmVxdWVzdEV2ZW50OiBEZW5vLlJlcXVlc3RFdmVudCB8IG51bGw7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFlpZWxkIHRoZSBuZXcgSFRUUCByZXF1ZXN0IG9uIHRoZSBjb25uZWN0aW9uLlxuICAgICAgICByZXF1ZXN0RXZlbnQgPSBhd2FpdCBodHRwQ29ubi5uZXh0UmVxdWVzdCgpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIENvbm5lY3Rpb24gaGFzIGJlZW4gY2xvc2VkLlxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcXVlc3RFdmVudCA9PT0gbnVsbCkge1xuICAgICAgICAvLyBDb25uZWN0aW9uIGhhcyBiZWVuIGNsb3NlZC5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlc3BvbmQgdG8gdGhlIHJlcXVlc3QuIE5vdGUgd2UgZG8gbm90IGF3YWl0IHRoaXMgYXN5bmMgbWV0aG9kIHRvXG4gICAgICAvLyBhbGxvdyB0aGUgY29ubmVjdGlvbiB0byBoYW5kbGUgbXVsdGlwbGUgcmVxdWVzdHMgaW4gdGhlIGNhc2Ugb2YgaDIuXG4gICAgICB0aGlzLiNyZXNwb25kKHJlcXVlc3RFdmVudCwgY29ubkluZm8pO1xuICAgIH1cblxuICAgIHRoaXMuI2Nsb3NlSHR0cENvbm4oaHR0cENvbm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjY2VwdHMgYWxsIGNvbm5lY3Rpb25zIG9uIGEgc2luZ2xlIG5ldHdvcmsgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgdG8gYWNjZXB0IGNvbm5lY3Rpb25zIGZyb20uXG4gICAqL1xuICBhc3luYyAjYWNjZXB0KGxpc3RlbmVyOiBEZW5vLkxpc3RlbmVyKSB7XG4gICAgbGV0IGFjY2VwdEJhY2tvZmZEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgd2hpbGUgKCF0aGlzLiNjbG9zZWQpIHtcbiAgICAgIGxldCBjb25uOiBEZW5vLkNvbm47XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFdhaXQgZm9yIGEgbmV3IGNvbm5lY3Rpb24uXG4gICAgICAgIGNvbm4gPSBhd2FpdCBsaXN0ZW5lci5hY2NlcHQoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAvLyBUaGUgbGlzdGVuZXIgaXMgY2xvc2VkLlxuICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuQmFkUmVzb3VyY2UgfHxcbiAgICAgICAgICAvLyBUTFMgaGFuZHNoYWtlIGVycm9ycy5cbiAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkludmFsaWREYXRhIHx8XG4gICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5VbmV4cGVjdGVkRW9mIHx8XG4gICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Db25uZWN0aW9uUmVzZXQgfHxcbiAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdENvbm5lY3RlZFxuICAgICAgICApIHtcbiAgICAgICAgICAvLyBCYWNrb2ZmIGFmdGVyIHRyYW5zaWVudCBlcnJvcnMgdG8gYWxsb3cgdGltZSBmb3IgdGhlIHN5c3RlbSB0b1xuICAgICAgICAgIC8vIHJlY292ZXIsIGFuZCBhdm9pZCBibG9ja2luZyB1cCB0aGUgZXZlbnQgbG9vcCB3aXRoIGEgY29udGludW91c2x5XG4gICAgICAgICAgLy8gcnVubmluZyBsb29wLlxuICAgICAgICAgIGlmICghYWNjZXB0QmFja29mZkRlbGF5KSB7XG4gICAgICAgICAgICBhY2NlcHRCYWNrb2ZmRGVsYXkgPSBJTklUSUFMX0FDQ0VQVF9CQUNLT0ZGX0RFTEFZO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY2NlcHRCYWNrb2ZmRGVsYXkgKj0gMjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoYWNjZXB0QmFja29mZkRlbGF5ID49IE1BWF9BQ0NFUFRfQkFDS09GRl9ERUxBWSkge1xuICAgICAgICAgICAgYWNjZXB0QmFja29mZkRlbGF5ID0gTUFYX0FDQ0VQVF9CQUNLT0ZGX0RFTEFZO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBkZWxheShhY2NlcHRCYWNrb2ZmRGVsYXksIHtcbiAgICAgICAgICAgICAgc2lnbmFsOiB0aGlzLiNhY2NlcHRCYWNrb2ZmRGVsYXlBYm9ydENvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICAgICAgICAvLyBUaGUgYmFja29mZiBkZWxheSB0aW1lciBpcyBhYm9ydGVkIHdoZW4gY2xvc2luZyB0aGUgc2VydmVyLlxuICAgICAgICAgICAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRE9NRXhjZXB0aW9uICYmIGVyci5uYW1lID09PSBcIkFib3J0RXJyb3JcIikpIHtcbiAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG5cbiAgICAgIGFjY2VwdEJhY2tvZmZEZWxheSA9IHVuZGVmaW5lZDtcblxuICAgICAgLy8gXCJVcGdyYWRlXCIgdGhlIG5ldHdvcmsgY29ubmVjdGlvbiBpbnRvIGFuIEhUVFAgY29ubmVjdGlvbi5cbiAgICAgIGxldCBodHRwQ29ubjogRGVuby5IdHRwQ29ubjtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gZGVuby1saW50LWlnbm9yZSBuby1kZXByZWNhdGVkLWRlbm8tYXBpXG4gICAgICAgIGh0dHBDb25uID0gRGVuby5zZXJ2ZUh0dHAoY29ubik7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gQ29ubmVjdGlvbiBoYXMgYmVlbiBjbG9zZWQuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBDbG9zaW5nIHRoZSB1bmRlcmx5aW5nIGxpc3RlbmVyIHdpbGwgbm90IGNsb3NlIEhUVFAgY29ubmVjdGlvbnMsIHNvIHdlXG4gICAgICAvLyB0cmFjayBmb3IgY2xvc3VyZSB1cG9uIHNlcnZlciBjbG9zZS5cbiAgICAgIHRoaXMuI3RyYWNrSHR0cENvbm5lY3Rpb24oaHR0cENvbm4pO1xuXG4gICAgICBjb25zdCBjb25uSW5mbzogQ29ubkluZm8gPSB7XG4gICAgICAgIGxvY2FsQWRkcjogY29ubi5sb2NhbEFkZHIsXG4gICAgICAgIHJlbW90ZUFkZHI6IGNvbm4ucmVtb3RlQWRkcixcbiAgICAgIH07XG5cbiAgICAgIC8vIFNlcnZlIHRoZSByZXF1ZXN0cyB0aGF0IGFycml2ZSBvbiB0aGUganVzdC1hY2NlcHRlZCBjb25uZWN0aW9uLiBOb3RlXG4gICAgICAvLyB3ZSBkbyBub3QgYXdhaXQgdGhpcyBhc3luYyBtZXRob2QgdG8gYWxsb3cgdGhlIHNlcnZlciB0byBhY2NlcHQgbmV3XG4gICAgICAvLyBjb25uZWN0aW9ucy5cbiAgICAgIHRoaXMuI3NlcnZlSHR0cChodHRwQ29ubiwgY29ubkluZm8pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVbnRyYWNrcyBhbmQgY2xvc2VzIGFuIEhUVFAgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIGh0dHBDb25uIFRoZSBIVFRQIGNvbm5lY3Rpb24gdG8gY2xvc2UuXG4gICAqL1xuICAjY2xvc2VIdHRwQ29ubihodHRwQ29ubjogRGVuby5IdHRwQ29ubikge1xuICAgIHRoaXMuI3VudHJhY2tIdHRwQ29ubmVjdGlvbihodHRwQ29ubik7XG5cbiAgICB0cnkge1xuICAgICAgaHR0cENvbm4uY2xvc2UoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIENvbm5lY3Rpb24gaGFzIGFscmVhZHkgYmVlbiBjbG9zZWQuXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIGxpc3RlbmVyIHRvIHRoZSBpbnRlcm5hbCB0cmFja2luZyBsaXN0LlxuICAgKlxuICAgKiBAcGFyYW0gbGlzdGVuZXIgTGlzdGVuZXIgdG8gdHJhY2suXG4gICAqL1xuICAjdHJhY2tMaXN0ZW5lcihsaXN0ZW5lcjogRGVuby5MaXN0ZW5lcikge1xuICAgIHRoaXMuI2xpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGxpc3RlbmVyIGZyb20gdGhlIGludGVybmFsIHRyYWNraW5nIGxpc3QuXG4gICAqXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBMaXN0ZW5lciB0byB1bnRyYWNrLlxuICAgKi9cbiAgI3VudHJhY2tMaXN0ZW5lcihsaXN0ZW5lcjogRGVuby5MaXN0ZW5lcikge1xuICAgIHRoaXMuI2xpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIEhUVFAgY29ubmVjdGlvbiB0byB0aGUgaW50ZXJuYWwgdHJhY2tpbmcgbGlzdC5cbiAgICpcbiAgICogQHBhcmFtIGh0dHBDb25uIEhUVFAgY29ubmVjdGlvbiB0byB0cmFjay5cbiAgICovXG4gICN0cmFja0h0dHBDb25uZWN0aW9uKGh0dHBDb25uOiBEZW5vLkh0dHBDb25uKSB7XG4gICAgdGhpcy4jaHR0cENvbm5lY3Rpb25zLmFkZChodHRwQ29ubik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgSFRUUCBjb25uZWN0aW9uIGZyb20gdGhlIGludGVybmFsIHRyYWNraW5nIGxpc3QuXG4gICAqXG4gICAqIEBwYXJhbSBodHRwQ29ubiBIVFRQIGNvbm5lY3Rpb24gdG8gdW50cmFjay5cbiAgICovXG4gICN1bnRyYWNrSHR0cENvbm5lY3Rpb24oaHR0cENvbm46IERlbm8uSHR0cENvbm4pIHtcbiAgICB0aGlzLiNodHRwQ29ubmVjdGlvbnMuZGVsZXRlKGh0dHBDb25uKTtcbiAgfVxufVxuXG4vKipcbiAqIEFkZGl0aW9uYWwgc2VydmUgb3B0aW9ucy5cbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHtAbGlua2NvZGUgRGVuby5TZXJ2ZUluaXR9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VydmVJbml0IGV4dGVuZHMgUGFydGlhbDxEZW5vLkxpc3Rlbk9wdGlvbnM+IHtcbiAgLyoqIEFuIEFib3J0U2lnbmFsIHRvIGNsb3NlIHRoZSBzZXJ2ZXIgYW5kIGFsbCBjb25uZWN0aW9ucy4gKi9cbiAgc2lnbmFsPzogQWJvcnRTaWduYWw7XG5cbiAgLyoqIFRoZSBoYW5kbGVyIHRvIGludm9rZSB3aGVuIHJvdXRlIGhhbmRsZXJzIHRocm93IGFuIGVycm9yLiAqL1xuICBvbkVycm9yPzogKGVycm9yOiB1bmtub3duKSA9PiBSZXNwb25zZSB8IFByb21pc2U8UmVzcG9uc2U+O1xuXG4gIC8qKiBUaGUgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gdGhlIHNlcnZlciBzdGFydGVkIGxpc3RlbmluZyAqL1xuICBvbkxpc3Rlbj86IChwYXJhbXM6IHsgaG9zdG5hbWU6IHN0cmluZzsgcG9ydDogbnVtYmVyIH0pID0+IHZvaWQ7XG59XG5cbi8qKlxuICogQWRkaXRpb25hbCBzZXJ2ZSBsaXN0ZW5lciBvcHRpb25zLlxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2Uge0BsaW5rY29kZSBEZW5vLlNlcnZlT3B0aW9uc30gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZUxpc3RlbmVyT3B0aW9ucyB7XG4gIC8qKiBBbiBBYm9ydFNpZ25hbCB0byBjbG9zZSB0aGUgc2VydmVyIGFuZCBhbGwgY29ubmVjdGlvbnMuICovXG4gIHNpZ25hbD86IEFib3J0U2lnbmFsO1xuXG4gIC8qKiBUaGUgaGFuZGxlciB0byBpbnZva2Ugd2hlbiByb3V0ZSBoYW5kbGVycyB0aHJvdyBhbiBlcnJvci4gKi9cbiAgb25FcnJvcj86IChlcnJvcjogdW5rbm93bikgPT4gUmVzcG9uc2UgfCBQcm9taXNlPFJlc3BvbnNlPjtcblxuICAvKiogVGhlIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuIHRoZSBzZXJ2ZXIgc3RhcnRlZCBsaXN0ZW5pbmcgKi9cbiAgb25MaXN0ZW4/OiAocGFyYW1zOiB7IGhvc3RuYW1lOiBzdHJpbmc7IHBvcnQ6IG51bWJlciB9KSA9PiB2b2lkO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBzZXJ2ZXIsIGFjY2VwdHMgaW5jb21pbmcgY29ubmVjdGlvbnMgb24gdGhlIGdpdmVuIGxpc3RlbmVyLCBhbmRcbiAqIGhhbmRsZXMgcmVxdWVzdHMgb24gdGhlc2UgY29ubmVjdGlvbnMgd2l0aCB0aGUgZ2l2ZW4gaGFuZGxlci5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgc2VydmVMaXN0ZW5lciB9IGZyb20gXCJAc3RkL2h0dHAvc2VydmVyXCI7XG4gKlxuICogY29uc3QgbGlzdGVuZXIgPSBEZW5vLmxpc3Rlbih7IHBvcnQ6IDQ1MDUgfSk7XG4gKlxuICogY29uc29sZS5sb2coXCJzZXJ2ZXIgbGlzdGVuaW5nIG9uIGh0dHA6Ly9sb2NhbGhvc3Q6NDUwNVwiKTtcbiAqXG4gKiBhd2FpdCBzZXJ2ZUxpc3RlbmVyKGxpc3RlbmVyLCAocmVxdWVzdCkgPT4ge1xuICogICBjb25zdCBib2R5ID0gYFlvdXIgdXNlci1hZ2VudCBpczpcXG5cXG4ke3JlcXVlc3QuaGVhZGVycy5nZXQoXG4gKiAgICAgXCJ1c2VyLWFnZW50XCIsXG4gKiAgICkgPz8gXCJVbmtub3duXCJ9YDtcbiAqXG4gKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAqIH0pO1xuICogYGBgXG4gKlxuICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lciB0byBhY2NlcHQgY29ubmVjdGlvbnMgZnJvbS5cbiAqIEBwYXJhbSBoYW5kbGVyIFRoZSBoYW5kbGVyIGZvciBpbmRpdmlkdWFsIEhUVFAgcmVxdWVzdHMuXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25hbCBzZXJ2ZSBvcHRpb25zLlxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2Uge0BsaW5rY29kZSBEZW5vLnNlcnZlfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VydmVMaXN0ZW5lcihcbiAgbGlzdGVuZXI6IERlbm8uTGlzdGVuZXIsXG4gIGhhbmRsZXI6IEhhbmRsZXIsXG4gIG9wdGlvbnM/OiBTZXJ2ZUxpc3RlbmVyT3B0aW9ucyxcbik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBzZXJ2ZXIgPSBuZXcgU2VydmVyKHsgaGFuZGxlciwgb25FcnJvcjogb3B0aW9ucz8ub25FcnJvciB9KTtcblxuICBvcHRpb25zPy5zaWduYWw/LmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCAoKSA9PiBzZXJ2ZXIuY2xvc2UoKSwge1xuICAgIG9uY2U6IHRydWUsXG4gIH0pO1xuXG4gIHJldHVybiBhd2FpdCBzZXJ2ZXIuc2VydmUobGlzdGVuZXIpO1xufVxuXG5mdW5jdGlvbiBob3N0bmFtZUZvckRpc3BsYXkoaG9zdG5hbWU6IHN0cmluZykge1xuICAvLyBJZiB0aGUgaG9zdG5hbWUgaXMgXCIwLjAuMC4wXCIsIHdlIGRpc3BsYXkgXCJsb2NhbGhvc3RcIiBpbiBjb25zb2xlXG4gIC8vIGJlY2F1c2UgYnJvd3NlcnMgaW4gV2luZG93cyBkb24ndCByZXNvbHZlIFwiMC4wLjAuMFwiLlxuICAvLyBTZWUgdGhlIGRpc2N1c3Npb24gaW4gaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2Rlbm9fc3RkL2lzc3Vlcy8xMTY1XG4gIHJldHVybiBob3N0bmFtZSA9PT0gXCIwLjAuMC4wXCIgPyBcImxvY2FsaG9zdFwiIDogaG9zdG5hbWU7XG59XG5cbi8qKlxuICogU2VydmVzIEhUVFAgcmVxdWVzdHMgd2l0aCB0aGUgZ2l2ZW4gaGFuZGxlci5cbiAqXG4gKiBZb3UgY2FuIHNwZWNpZnkgYW4gb2JqZWN0IHdpdGggYSBwb3J0IGFuZCBob3N0bmFtZSBvcHRpb24sIHdoaWNoIGlzIHRoZVxuICogYWRkcmVzcyB0byBsaXN0ZW4gb24uIFRoZSBkZWZhdWx0IGlzIHBvcnQgODAwMCBvbiBob3N0bmFtZSBcIjAuMC4wLjBcIi5cbiAqXG4gKiBAZXhhbXBsZSBUaGUgYmVsb3cgZXhhbXBsZSBzZXJ2ZXMgd2l0aCB0aGUgcG9ydCA4MDAwLlxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgc2VydmUgfSBmcm9tIFwiQHN0ZC9odHRwL3NlcnZlclwiO1xuICogc2VydmUoKF9yZXEpID0+IG5ldyBSZXNwb25zZShcIkhlbGxvLCB3b3JsZFwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBZb3UgY2FuIGNoYW5nZSB0aGUgbGlzdGVuaW5nIGFkZHJlc3MgYnkgdGhlIGBob3N0bmFtZWAgYW5kIGBwb3J0YCBvcHRpb25zLlxuICogVGhlIGJlbG93IGV4YW1wbGUgc2VydmVzIHdpdGggdGhlIHBvcnQgMzAwMC5cbiAqXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQgeyBzZXJ2ZSB9IGZyb20gXCJAc3RkL2h0dHAvc2VydmVyXCI7XG4gKiBzZXJ2ZSgoX3JlcSkgPT4gbmV3IFJlc3BvbnNlKFwiSGVsbG8sIHdvcmxkXCIpLCB7IHBvcnQ6IDMwMDAgfSk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBgc2VydmVgIGZ1bmN0aW9uIHByaW50cyB0aGUgbWVzc2FnZSBgTGlzdGVuaW5nIG9uIGh0dHA6Ly88aG9zdG5hbWU+Ojxwb3J0Pi9gXG4gKiBvbiBzdGFydC11cCBieSBkZWZhdWx0LiBJZiB5b3UgbGlrZSB0byBjaGFuZ2UgdGhpcyBtZXNzYWdlLCB5b3UgY2FuIHNwZWNpZnlcbiAqIGBvbkxpc3RlbmAgb3B0aW9uIHRvIG92ZXJyaWRlIGl0LlxuICpcbiAqIGBgYHRzIG5vLWV2YWxcbiAqIGltcG9ydCB7IHNlcnZlIH0gZnJvbSBcIkBzdGQvaHR0cC9zZXJ2ZXJcIjtcbiAqIHNlcnZlKChfcmVxKSA9PiBuZXcgUmVzcG9uc2UoXCJIZWxsbywgd29ybGRcIiksIHtcbiAqICAgb25MaXN0ZW4oeyBwb3J0LCBob3N0bmFtZSB9KSB7XG4gKiAgICAgY29uc29sZS5sb2coYFNlcnZlciBzdGFydGVkIGF0IGh0dHA6Ly8ke2hvc3RuYW1lfToke3BvcnR9YCk7XG4gKiAgICAgLy8gLi4uIG1vcmUgaW5mbyBzcGVjaWZpYyB0byB5b3VyIHNlcnZlciAuLlxuICogICB9LFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBZb3UgY2FuIGFsc28gc3BlY2lmeSBgdW5kZWZpbmVkYCBvciBgbnVsbGAgdG8gc3RvcCB0aGUgbG9nZ2luZyBiZWhhdmlvci5cbiAqXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQgeyBzZXJ2ZSB9IGZyb20gXCJAc3RkL2h0dHAvc2VydmVyXCI7XG4gKiBzZXJ2ZSgoX3JlcSkgPT4gbmV3IFJlc3BvbnNlKFwiSGVsbG8sIHdvcmxkXCIpLCB7IG9uTGlzdGVuOiB1bmRlZmluZWQgfSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gaGFuZGxlciBUaGUgaGFuZGxlciBmb3IgaW5kaXZpZHVhbCBIVFRQIHJlcXVlc3RzLlxuICogQHBhcmFtIG9wdGlvbnMgVGhlIG9wdGlvbnMuIFNlZSBgU2VydmVJbml0YCBkb2N1bWVudGF0aW9uIGZvciBkZXRhaWxzLlxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2Uge0BsaW5rY29kZSBEZW5vLnNlcnZlfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VydmUoXG4gIGhhbmRsZXI6IEhhbmRsZXIsXG4gIG9wdGlvbnM6IFNlcnZlSW5pdCA9IHt9LFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCBwb3J0ID0gb3B0aW9ucy5wb3J0ID8/IDgwMDA7XG4gIGlmICh0eXBlb2YgcG9ydCAhPT0gXCJudW1iZXJcIikge1xuICAgIHBvcnQgPSBOdW1iZXIocG9ydCk7XG4gIH1cblxuICBjb25zdCBob3N0bmFtZSA9IG9wdGlvbnMuaG9zdG5hbWUgPz8gXCIwLjAuMC4wXCI7XG4gIGNvbnN0IHNlcnZlciA9IG5ldyBTZXJ2ZXIoe1xuICAgIHBvcnQsXG4gICAgaG9zdG5hbWUsXG4gICAgaGFuZGxlcixcbiAgICBvbkVycm9yOiBvcHRpb25zLm9uRXJyb3IsXG4gIH0pO1xuXG4gIG9wdGlvbnM/LnNpZ25hbD8uYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsICgpID0+IHNlcnZlci5jbG9zZSgpLCB7XG4gICAgb25jZTogdHJ1ZSxcbiAgfSk7XG5cbiAgY29uc3QgbGlzdGVuZXIgPSBEZW5vLmxpc3Rlbih7XG4gICAgcG9ydCxcbiAgICBob3N0bmFtZSxcbiAgICB0cmFuc3BvcnQ6IFwidGNwXCIsXG4gIH0pO1xuXG4gIGNvbnN0IHMgPSBzZXJ2ZXIuc2VydmUobGlzdGVuZXIpO1xuXG4gIHBvcnQgPSAoc2VydmVyLmFkZHJzWzBdIGFzIERlbm8uTmV0QWRkcikucG9ydDtcblxuICBpZiAoXCJvbkxpc3RlblwiIGluIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zLm9uTGlzdGVuPy4oeyBwb3J0LCBob3N0bmFtZSB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhgTGlzdGVuaW5nIG9uIGh0dHA6Ly8ke2hvc3RuYW1lRm9yRGlzcGxheShob3N0bmFtZSl9OiR7cG9ydH0vYCk7XG4gIH1cblxuICByZXR1cm4gYXdhaXQgcztcbn1cblxuLyoqXG4gKiBJbml0aWFsaXphdGlvbiBwYXJhbWV0ZXJzIGZvciB7QGxpbmtjb2RlIHNlcnZlVGxzfS5cbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC4gVXNlIHtAbGlua2NvZGUgRGVuby5TZXJ2ZVRsc09wdGlvbnN9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VydmVUbHNJbml0IGV4dGVuZHMgU2VydmVJbml0IHtcbiAgLyoqIFNlcnZlciBwcml2YXRlIGtleSBpbiBQRU0gZm9ybWF0ICovXG4gIGtleT86IHN0cmluZztcblxuICAvKiogQ2VydCBjaGFpbiBpbiBQRU0gZm9ybWF0ICovXG4gIGNlcnQ/OiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBwYXRoIHRvIHRoZSBmaWxlIGNvbnRhaW5pbmcgdGhlIFRMUyBwcml2YXRlIGtleS4gKi9cbiAga2V5RmlsZT86IHN0cmluZztcblxuICAvKiogVGhlIHBhdGggdG8gdGhlIGZpbGUgY29udGFpbmluZyB0aGUgVExTIGNlcnRpZmljYXRlICovXG4gIGNlcnRGaWxlPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFNlcnZlcyBIVFRQUyByZXF1ZXN0cyB3aXRoIHRoZSBnaXZlbiBoYW5kbGVyLlxuICpcbiAqIFlvdSBtdXN0IHNwZWNpZnkgYGtleWAgb3IgYGtleUZpbGVgIGFuZCBgY2VydGAgb3IgYGNlcnRGaWxlYCBvcHRpb25zLlxuICpcbiAqIFlvdSBjYW4gc3BlY2lmeSBhbiBvYmplY3Qgd2l0aCBhIHBvcnQgYW5kIGhvc3RuYW1lIG9wdGlvbiwgd2hpY2ggaXMgdGhlXG4gKiBhZGRyZXNzIHRvIGxpc3RlbiBvbi4gVGhlIGRlZmF1bHQgaXMgcG9ydCA4NDQzIG9uIGhvc3RuYW1lIFwiMC4wLjAuMFwiLlxuICpcbiAqIEBleGFtcGxlIFRoZSBiZWxvdyBleGFtcGxlIHNlcnZlcyB3aXRoIHRoZSBkZWZhdWx0IHBvcnQgODQ0My5cbiAqXG4gKiBgYGB0cyBuby1ldmFsXG4gKiBpbXBvcnQgeyBzZXJ2ZVRscyB9IGZyb20gXCJAc3RkL2h0dHAvc2VydmVyXCI7XG4gKlxuICogY29uc3QgY2VydCA9IFwiLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tXFxuLi4uXFxuLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLVxcblwiO1xuICogY29uc3Qga2V5ID0gXCItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cXG4uLi5cXG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXFxuXCI7XG4gKiBzZXJ2ZVRscygoX3JlcSkgPT4gbmV3IFJlc3BvbnNlKFwiSGVsbG8sIHdvcmxkXCIpLCB7IGNlcnQsIGtleSB9KTtcbiAqXG4gKiAvLyBPclxuICpcbiAqIGNvbnN0IGNlcnRGaWxlID0gXCIvcGF0aC90by9jZXJ0RmlsZS5jcnRcIjtcbiAqIGNvbnN0IGtleUZpbGUgPSBcIi9wYXRoL3RvL2tleUZpbGUua2V5XCI7XG4gKiBzZXJ2ZVRscygoX3JlcSkgPT4gbmV3IFJlc3BvbnNlKFwiSGVsbG8sIHdvcmxkXCIpLCB7IGNlcnRGaWxlLCBrZXlGaWxlIH0pO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgYHNlcnZlVGxzYCBmdW5jdGlvbiBwcmludHMgdGhlIG1lc3NhZ2UgYExpc3RlbmluZyBvbiBodHRwczovLzxob3N0bmFtZT46PHBvcnQ+L2BcbiAqIG9uIHN0YXJ0LXVwIGJ5IGRlZmF1bHQuIElmIHlvdSBsaWtlIHRvIGNoYW5nZSB0aGlzIG1lc3NhZ2UsIHlvdSBjYW4gc3BlY2lmeVxuICogYG9uTGlzdGVuYCBvcHRpb24gdG8gb3ZlcnJpZGUgaXQuXG4gKlxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgc2VydmVUbHMgfSBmcm9tIFwiQHN0ZC9odHRwL3NlcnZlclwiO1xuICogY29uc3QgY2VydEZpbGUgPSBcIi9wYXRoL3RvL2NlcnRGaWxlLmNydFwiO1xuICogY29uc3Qga2V5RmlsZSA9IFwiL3BhdGgvdG8va2V5RmlsZS5rZXlcIjtcbiAqIHNlcnZlVGxzKChfcmVxKSA9PiBuZXcgUmVzcG9uc2UoXCJIZWxsbywgd29ybGRcIiksIHtcbiAqICAgY2VydEZpbGUsXG4gKiAgIGtleUZpbGUsXG4gKiAgIG9uTGlzdGVuKHsgcG9ydCwgaG9zdG5hbWUgfSkge1xuICogICAgIGNvbnNvbGUubG9nKGBTZXJ2ZXIgc3RhcnRlZCBhdCBodHRwczovLyR7aG9zdG5hbWV9OiR7cG9ydH1gKTtcbiAqICAgICAvLyAuLi4gbW9yZSBpbmZvIHNwZWNpZmljIHRvIHlvdXIgc2VydmVyIC4uXG4gKiAgIH0sXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIFlvdSBjYW4gYWxzbyBzcGVjaWZ5IGB1bmRlZmluZWRgIG9yIGBudWxsYCB0byBzdG9wIHRoZSBsb2dnaW5nIGJlaGF2aW9yLlxuICpcbiAqIGBgYHRzIG5vLWV2YWxcbiAqIGltcG9ydCB7IHNlcnZlVGxzIH0gZnJvbSBcIkBzdGQvaHR0cC9zZXJ2ZXJcIjtcbiAqIGNvbnN0IGNlcnRGaWxlID0gXCIvcGF0aC90by9jZXJ0RmlsZS5jcnRcIjtcbiAqIGNvbnN0IGtleUZpbGUgPSBcIi9wYXRoL3RvL2tleUZpbGUua2V5XCI7XG4gKiBzZXJ2ZVRscygoX3JlcSkgPT4gbmV3IFJlc3BvbnNlKFwiSGVsbG8sIHdvcmxkXCIpLCB7XG4gKiAgIGNlcnRGaWxlLFxuICogICBrZXlGaWxlLFxuICogICBvbkxpc3RlbjogdW5kZWZpbmVkLFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gaGFuZGxlciBUaGUgaGFuZGxlciBmb3IgaW5kaXZpZHVhbCBIVFRQUyByZXF1ZXN0cy5cbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBvcHRpb25zLiBTZWUgYFNlcnZlVGxzSW5pdGAgZG9jdW1lbnRhdGlvbiBmb3IgZGV0YWlscy5cbiAqIEByZXR1cm5zXG4gKlxuICogQGRlcHJlY2F0ZWQgVGhpcyB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAuIFVzZSB7QGxpbmtjb2RlIERlbm8uc2VydmV9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXJ2ZVRscyhcbiAgaGFuZGxlcjogSGFuZGxlcixcbiAgb3B0aW9uczogU2VydmVUbHNJbml0LFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmICghb3B0aW9ucy5rZXkgJiYgIW9wdGlvbnMua2V5RmlsZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlRMUyBjb25maWcgaXMgZ2l2ZW4sIGJ1dCAna2V5JyBpcyBtaXNzaW5nLlwiKTtcbiAgfVxuXG4gIGlmICghb3B0aW9ucy5jZXJ0ICYmICFvcHRpb25zLmNlcnRGaWxlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVExTIGNvbmZpZyBpcyBnaXZlbiwgYnV0ICdjZXJ0JyBpcyBtaXNzaW5nLlwiKTtcbiAgfVxuXG4gIGxldCBwb3J0ID0gb3B0aW9ucy5wb3J0ID8/IDg0NDM7XG4gIGlmICh0eXBlb2YgcG9ydCAhPT0gXCJudW1iZXJcIikge1xuICAgIHBvcnQgPSBOdW1iZXIocG9ydCk7XG4gIH1cblxuICBjb25zdCBob3N0bmFtZSA9IG9wdGlvbnMuaG9zdG5hbWUgPz8gXCIwLjAuMC4wXCI7XG4gIGNvbnN0IHNlcnZlciA9IG5ldyBTZXJ2ZXIoe1xuICAgIHBvcnQsXG4gICAgaG9zdG5hbWUsXG4gICAgaGFuZGxlcixcbiAgICBvbkVycm9yOiBvcHRpb25zLm9uRXJyb3IsXG4gIH0pO1xuXG4gIG9wdGlvbnM/LnNpZ25hbD8uYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsICgpID0+IHNlcnZlci5jbG9zZSgpLCB7XG4gICAgb25jZTogdHJ1ZSxcbiAgfSk7XG5cbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1zeW5jLWZuLWluLWFzeW5jLWZuXG4gIGNvbnN0IGtleSA9IG9wdGlvbnMua2V5IHx8IERlbm8ucmVhZFRleHRGaWxlU3luYyhvcHRpb25zLmtleUZpbGUhKTtcbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1zeW5jLWZuLWluLWFzeW5jLWZuXG4gIGNvbnN0IGNlcnQgPSBvcHRpb25zLmNlcnQgfHwgRGVuby5yZWFkVGV4dEZpbGVTeW5jKG9wdGlvbnMuY2VydEZpbGUhKTtcblxuICBjb25zdCBsaXN0ZW5lciA9IERlbm8ubGlzdGVuVGxzKHtcbiAgICBwb3J0LFxuICAgIGhvc3RuYW1lLFxuICAgIGNlcnQsXG4gICAga2V5LFxuICAgIHRyYW5zcG9ydDogXCJ0Y3BcIixcbiAgICAvLyBBTFBOIHByb3RvY29sIHN1cHBvcnQgbm90IHlldCBzdGFibGUuXG4gICAgLy8gYWxwblByb3RvY29sczogW1wiaDJcIiwgXCJodHRwLzEuMVwiXSxcbiAgfSk7XG5cbiAgY29uc3QgcyA9IHNlcnZlci5zZXJ2ZShsaXN0ZW5lcik7XG5cbiAgcG9ydCA9IChzZXJ2ZXIuYWRkcnNbMF0gYXMgRGVuby5OZXRBZGRyKS5wb3J0O1xuXG4gIGlmIChcIm9uTGlzdGVuXCIgaW4gb3B0aW9ucykge1xuICAgIG9wdGlvbnMub25MaXN0ZW4/Lih7IHBvcnQsIGhvc3RuYW1lIH0pO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgYExpc3RlbmluZyBvbiBodHRwczovLyR7aG9zdG5hbWVGb3JEaXNwbGF5KGhvc3RuYW1lKX06JHtwb3J0fS9gLFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gYXdhaXQgcztcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsU0FBUyxLQUFLLFFBQVEsb0NBQW9DO0FBRTFELCtDQUErQyxHQUMvQyxNQUFNLHNCQUFzQjtBQUU1QixtQ0FBbUMsR0FDbkMsTUFBTSxZQUFZO0FBRWxCLG9DQUFvQyxHQUNwQyxNQUFNLGFBQWE7QUFFbkIsdUVBQXVFLEdBQ3ZFLE1BQU0sK0JBQStCO0FBRXJDLGtFQUFrRSxHQUNsRSxNQUFNLDJCQUEyQjtBQThDakM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0JDLEdBQ0QsT0FBTyxNQUFNO0VBQ1gsQ0FBQSxJQUFLLENBQVU7RUFDZixDQUFBLElBQUssQ0FBVTtFQUNmLENBQUEsT0FBUSxDQUFVO0VBQ2xCLENBQUEsTUFBTyxHQUFHLE1BQU07RUFDaEIsQ0FBQSxTQUFVLEdBQXVCLElBQUksTUFBTTtFQUMzQyxDQUFBLGlDQUFrQyxHQUFHLElBQUksa0JBQWtCO0VBQzNELENBQUEsZUFBZ0IsR0FBdUIsSUFBSSxNQUFNO0VBQ2pELENBQUEsT0FBUSxDQUFtRDtFQUUzRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkMsR0FDRCxZQUFZLFVBQXNCLENBQUU7SUFDbEMsSUFBSSxDQUFDLENBQUEsSUFBSyxHQUFHLFdBQVcsSUFBSTtJQUM1QixJQUFJLENBQUMsQ0FBQSxJQUFLLEdBQUcsV0FBVyxRQUFRO0lBQ2hDLElBQUksQ0FBQyxDQUFBLE9BQVEsR0FBRyxXQUFXLE9BQU87SUFDbEMsSUFBSSxDQUFDLENBQUEsT0FBUSxHQUFHLFdBQVcsT0FBTyxJQUNoQyxTQUFVLEtBQWM7TUFDdEIsUUFBUSxLQUFLLENBQUM7TUFDZCxPQUFPLElBQUksU0FBUyx5QkFBeUI7UUFBRSxRQUFRO01BQUk7SUFDN0Q7RUFDSjtFQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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
// denoCacheMetadata=13919265497060019101,4545257864911124763