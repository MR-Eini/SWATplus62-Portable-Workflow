// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Provides the {@linkcode KeyStack} class which implements the
 * {@linkcode KeyRing} interface for managing rotatable keys.
 *
 * @module
 */ var _computedKey, _computedKey1;
import { timingSafeEqual } from "./timing_safe_equal.ts";
import { encodeBase64Url } from "jsr:/@std/encoding@^0.224.0/base64url";
const encoder = new TextEncoder();
function importKey(key) {
  if (typeof key === "string") {
    key = encoder.encode(key);
  } else if (Array.isArray(key)) {
    key = new Uint8Array(key);
  }
  return crypto.subtle.importKey("raw", key, {
    name: "HMAC",
    hash: {
      name: "SHA-256"
    }
  }, true, [
    "sign",
    "verify"
  ]);
}
function sign(data, key) {
  if (typeof data === "string") {
    data = encoder.encode(data);
  } else if (Array.isArray(data)) {
    data = Uint8Array.from(data);
  }
  return crypto.subtle.sign("HMAC", key, data);
}
/**
 * Compare two strings, Uint8Arrays, ArrayBuffers, or arrays of numbers in a
 * way that avoids timing based attacks on the comparisons on the values.
 *
 * The function will return `true` if the values match, or `false`, if they
 * do not match.
 *
 * This was inspired by https://github.com/suryagh/tsscmp which provides a
 * timing safe string comparison to avoid timing attacks as described in
 * https://codahale.com/a-lesson-in-timing-attacks/.
 */ async function compare(a, b) {
  const key = new Uint8Array(32);
  globalThis.crypto.getRandomValues(key);
  const cryptoKey = await importKey(key);
  const [ah, bh] = await Promise.all([
    sign(a, cryptoKey),
    sign(b, cryptoKey)
  ]);
  return timingSafeEqual(ah, bh);
}
_computedKey = Symbol.for("Deno.customInspect"), _computedKey1 = Symbol.for("nodejs.util.inspect.custom");
/**
 * A cryptographic key chain which allows signing of data to prevent tampering,
 * but also allows for easy key rotation without needing to re-sign the data.
 *
 * Data is signed as SHA256 HMAC.
 *
 * This was inspired by {@link https://github.com/crypto-utils/keygrip/ | keygrip}.
 *
 * @example
 * ```ts
 * import { KeyStack } from "@std/crypto/unstable-keystack";
 *
 * const keyStack = new KeyStack(["hello", "world"]);
 * const digest = await keyStack.sign("some data");
 *
 * const rotatedStack = new KeyStack(["deno", "says", "hello", "world"]);
 * await rotatedStack.verify("some data", digest); // true
 * ```
 */ export class KeyStack {
  #cryptoKeys = new Map();
  #keys;
  async #toCryptoKey(key) {
    if (!this.#cryptoKeys.has(key)) {
      this.#cryptoKeys.set(key, await importKey(key));
    }
    return this.#cryptoKeys.get(key);
  }
  /** Number of keys */ get length() {
    return this.#keys.length;
  }
  /**
   * A class which accepts an array of keys that are used to sign and verify
   * data and allows easy key rotation without invalidation of previously signed
   * data.
   *
   * @param keys An iterable of keys, of which the index 0 will be used to sign
   *             data, but verification can happen against any key.
   */ constructor(keys){
    const values = Array.isArray(keys) ? keys : [
      ...keys
    ];
    if (!values.length) {
      throw new TypeError("keys must contain at least one value");
    }
    this.#keys = values;
  }
  /**
   * Take `data` and return a SHA256 HMAC digest that uses the current 0 index
   * of the `keys` passed to the constructor.  This digest is in the form of a
   * URL safe base64 encoded string.
   */ async sign(data) {
    const key = await this.#toCryptoKey(this.#keys[0]);
    return encodeBase64Url(await sign(data, key));
  }
  /**
   * Given `data` and a `digest`, verify that one of the `keys` provided the
   * constructor was used to generate the `digest`.  Returns `true` if one of
   * the keys was used, otherwise `false`.
   */ async verify(data, digest) {
    return await this.indexOf(data, digest) > -1;
  }
  /**
   * Given `data` and a `digest`, return the current index of the key in the
   * `keys` passed the constructor that was used to generate the digest.  If no
   * key can be found, the method returns `-1`.
   */ async indexOf(data, digest) {
    for(let i = 0; i < this.#keys.length; i++){
      const key = this.#keys[i];
      const cryptoKey = await this.#toCryptoKey(key);
      if (await compare(digest, encodeBase64Url(await sign(data, cryptoKey)))) {
        return i;
      }
    }
    return -1;
  }
  /** Custom output for {@linkcode Deno.inspect}. */ [_computedKey](inspect) {
    const { length } = this;
    return `${this.constructor.name} ${inspect({
      length
    })}`;
  }
  /** Custom output for Node's {@linkcode https://nodejs.org/api/util.html#utilinspectobject-options|util.inspect}. */ [_computedKey1](depth, // deno-lint-ignore no-explicit-any
  options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    const { length } = this;
    return `${options.stylize(this.constructor.name, "special")} ${inspect({
      length
    }, newOptions)}`;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY3J5cHRvLzAuMjI0LjAvdW5zdGFibGVfa2V5c3RhY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBQcm92aWRlcyB0aGUge0BsaW5rY29kZSBLZXlTdGFja30gY2xhc3Mgd2hpY2ggaW1wbGVtZW50cyB0aGVcbiAqIHtAbGlua2NvZGUgS2V5UmluZ30gaW50ZXJmYWNlIGZvciBtYW5hZ2luZyByb3RhdGFibGUga2V5cy5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0IHsgdGltaW5nU2FmZUVxdWFsIH0gZnJvbSBcIi4vdGltaW5nX3NhZmVfZXF1YWwudHNcIjtcbmltcG9ydCB7IGVuY29kZUJhc2U2NFVybCB9IGZyb20gXCJqc3I6L0BzdGQvZW5jb2RpbmdAXjAuMjI0LjAvYmFzZTY0dXJsXCI7XG5cbi8qKiBUeXBlcyBvZiBkYXRhIHRoYXQgY2FuIGJlIHNpZ25lZCBjcnlwdG9ncmFwaGljYWxseS4gKi9cbmV4cG9ydCB0eXBlIERhdGEgPSBzdHJpbmcgfCBudW1iZXJbXSB8IEFycmF5QnVmZmVyIHwgVWludDhBcnJheTtcblxuLyoqIFR5cGVzIG9mIGtleXMgdGhhdCBjYW4gYmUgdXNlZCB0byBzaWduIGRhdGEuICovXG5leHBvcnQgdHlwZSBLZXkgPSBzdHJpbmcgfCBudW1iZXJbXSB8IEFycmF5QnVmZmVyIHwgVWludDhBcnJheTtcblxuY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuXG5mdW5jdGlvbiBpbXBvcnRLZXkoa2V5OiBLZXkpOiBQcm9taXNlPENyeXB0b0tleT4ge1xuICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGtleSA9IGVuY29kZXIuZW5jb2RlKGtleSk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShrZXkpKSB7XG4gICAga2V5ID0gbmV3IFVpbnQ4QXJyYXkoa2V5KTtcbiAgfVxuICByZXR1cm4gY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgXCJyYXdcIixcbiAgICBrZXksXG4gICAge1xuICAgICAgbmFtZTogXCJITUFDXCIsXG4gICAgICBoYXNoOiB7IG5hbWU6IFwiU0hBLTI1NlwiIH0sXG4gICAgfSxcbiAgICB0cnVlLFxuICAgIFtcInNpZ25cIiwgXCJ2ZXJpZnlcIl0sXG4gICk7XG59XG5cbmZ1bmN0aW9uIHNpZ24oZGF0YTogRGF0YSwga2V5OiBDcnlwdG9LZXkpOiBQcm9taXNlPEFycmF5QnVmZmVyPiB7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGRhdGEgPSBlbmNvZGVyLmVuY29kZShkYXRhKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgZGF0YSA9IFVpbnQ4QXJyYXkuZnJvbShkYXRhKTtcbiAgfVxuICByZXR1cm4gY3J5cHRvLnN1YnRsZS5zaWduKFwiSE1BQ1wiLCBrZXksIGRhdGEpO1xufVxuXG4vKipcbiAqIENvbXBhcmUgdHdvIHN0cmluZ3MsIFVpbnQ4QXJyYXlzLCBBcnJheUJ1ZmZlcnMsIG9yIGFycmF5cyBvZiBudW1iZXJzIGluIGFcbiAqIHdheSB0aGF0IGF2b2lkcyB0aW1pbmcgYmFzZWQgYXR0YWNrcyBvbiB0aGUgY29tcGFyaXNvbnMgb24gdGhlIHZhbHVlcy5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gd2lsbCByZXR1cm4gYHRydWVgIGlmIHRoZSB2YWx1ZXMgbWF0Y2gsIG9yIGBmYWxzZWAsIGlmIHRoZXlcbiAqIGRvIG5vdCBtYXRjaC5cbiAqXG4gKiBUaGlzIHdhcyBpbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vc3VyeWFnaC90c3NjbXAgd2hpY2ggcHJvdmlkZXMgYVxuICogdGltaW5nIHNhZmUgc3RyaW5nIGNvbXBhcmlzb24gdG8gYXZvaWQgdGltaW5nIGF0dGFja3MgYXMgZGVzY3JpYmVkIGluXG4gKiBodHRwczovL2NvZGFoYWxlLmNvbS9hLWxlc3Nvbi1pbi10aW1pbmctYXR0YWNrcy8uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNvbXBhcmUoYTogRGF0YSwgYjogRGF0YSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBrZXkgPSBuZXcgVWludDhBcnJheSgzMik7XG4gIGdsb2JhbFRoaXMuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhrZXkpO1xuICBjb25zdCBjcnlwdG9LZXkgPSBhd2FpdCBpbXBvcnRLZXkoa2V5KTtcbiAgY29uc3QgW2FoLCBiaF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgc2lnbihhLCBjcnlwdG9LZXkpLFxuICAgIHNpZ24oYiwgY3J5cHRvS2V5KSxcbiAgXSk7XG4gIHJldHVybiB0aW1pbmdTYWZlRXF1YWwoYWgsIGJoKTtcbn1cblxuLyoqXG4gKiBBIGNyeXB0b2dyYXBoaWMga2V5IGNoYWluIHdoaWNoIGFsbG93cyBzaWduaW5nIG9mIGRhdGEgdG8gcHJldmVudCB0YW1wZXJpbmcsXG4gKiBidXQgYWxzbyBhbGxvd3MgZm9yIGVhc3kga2V5IHJvdGF0aW9uIHdpdGhvdXQgbmVlZGluZyB0byByZS1zaWduIHRoZSBkYXRhLlxuICpcbiAqIERhdGEgaXMgc2lnbmVkIGFzIFNIQTI1NiBITUFDLlxuICpcbiAqIFRoaXMgd2FzIGluc3BpcmVkIGJ5IHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vY3J5cHRvLXV0aWxzL2tleWdyaXAvIHwga2V5Z3JpcH0uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBLZXlTdGFjayB9IGZyb20gXCJAc3RkL2NyeXB0by91bnN0YWJsZS1rZXlzdGFja1wiO1xuICpcbiAqIGNvbnN0IGtleVN0YWNrID0gbmV3IEtleVN0YWNrKFtcImhlbGxvXCIsIFwid29ybGRcIl0pO1xuICogY29uc3QgZGlnZXN0ID0gYXdhaXQga2V5U3RhY2suc2lnbihcInNvbWUgZGF0YVwiKTtcbiAqXG4gKiBjb25zdCByb3RhdGVkU3RhY2sgPSBuZXcgS2V5U3RhY2soW1wiZGVub1wiLCBcInNheXNcIiwgXCJoZWxsb1wiLCBcIndvcmxkXCJdKTtcbiAqIGF3YWl0IHJvdGF0ZWRTdGFjay52ZXJpZnkoXCJzb21lIGRhdGFcIiwgZGlnZXN0KTsgLy8gdHJ1ZVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBLZXlTdGFjayB7XG4gICNjcnlwdG9LZXlzID0gbmV3IE1hcDxLZXksIENyeXB0b0tleT4oKTtcbiAgI2tleXM6IEtleVtdO1xuXG4gIGFzeW5jICN0b0NyeXB0b0tleShrZXk6IEtleSk6IFByb21pc2U8Q3J5cHRvS2V5PiB7XG4gICAgaWYgKCF0aGlzLiNjcnlwdG9LZXlzLmhhcyhrZXkpKSB7XG4gICAgICB0aGlzLiNjcnlwdG9LZXlzLnNldChrZXksIGF3YWl0IGltcG9ydEtleShrZXkpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuI2NyeXB0b0tleXMuZ2V0KGtleSkhO1xuICB9XG5cbiAgLyoqIE51bWJlciBvZiBrZXlzICovXG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy4ja2V5cy5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogQSBjbGFzcyB3aGljaCBhY2NlcHRzIGFuIGFycmF5IG9mIGtleXMgdGhhdCBhcmUgdXNlZCB0byBzaWduIGFuZCB2ZXJpZnlcbiAgICogZGF0YSBhbmQgYWxsb3dzIGVhc3kga2V5IHJvdGF0aW9uIHdpdGhvdXQgaW52YWxpZGF0aW9uIG9mIHByZXZpb3VzbHkgc2lnbmVkXG4gICAqIGRhdGEuXG4gICAqXG4gICAqIEBwYXJhbSBrZXlzIEFuIGl0ZXJhYmxlIG9mIGtleXMsIG9mIHdoaWNoIHRoZSBpbmRleCAwIHdpbGwgYmUgdXNlZCB0byBzaWduXG4gICAqICAgICAgICAgICAgIGRhdGEsIGJ1dCB2ZXJpZmljYXRpb24gY2FuIGhhcHBlbiBhZ2FpbnN0IGFueSBrZXkuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihrZXlzOiBJdGVyYWJsZTxLZXk+KSB7XG4gICAgY29uc3QgdmFsdWVzID0gQXJyYXkuaXNBcnJheShrZXlzKSA/IGtleXMgOiBbLi4ua2V5c107XG4gICAgaWYgKCEodmFsdWVzLmxlbmd0aCkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJrZXlzIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgdmFsdWVcIik7XG4gICAgfVxuICAgIHRoaXMuI2tleXMgPSB2YWx1ZXM7XG4gIH1cblxuICAvKipcbiAgICogVGFrZSBgZGF0YWAgYW5kIHJldHVybiBhIFNIQTI1NiBITUFDIGRpZ2VzdCB0aGF0IHVzZXMgdGhlIGN1cnJlbnQgMCBpbmRleFxuICAgKiBvZiB0aGUgYGtleXNgIHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3IuICBUaGlzIGRpZ2VzdCBpcyBpbiB0aGUgZm9ybSBvZiBhXG4gICAqIFVSTCBzYWZlIGJhc2U2NCBlbmNvZGVkIHN0cmluZy5cbiAgICovXG4gIGFzeW5jIHNpZ24oZGF0YTogRGF0YSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgdGhpcy4jdG9DcnlwdG9LZXkodGhpcy4ja2V5c1swXSEpO1xuICAgIHJldHVybiBlbmNvZGVCYXNlNjRVcmwoYXdhaXQgc2lnbihkYXRhLCBrZXkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBgZGF0YWAgYW5kIGEgYGRpZ2VzdGAsIHZlcmlmeSB0aGF0IG9uZSBvZiB0aGUgYGtleXNgIHByb3ZpZGVkIHRoZVxuICAgKiBjb25zdHJ1Y3RvciB3YXMgdXNlZCB0byBnZW5lcmF0ZSB0aGUgYGRpZ2VzdGAuICBSZXR1cm5zIGB0cnVlYCBpZiBvbmUgb2ZcbiAgICogdGhlIGtleXMgd2FzIHVzZWQsIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgKi9cbiAgYXN5bmMgdmVyaWZ5KGRhdGE6IERhdGEsIGRpZ2VzdDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmluZGV4T2YoZGF0YSwgZGlnZXN0KSkgPiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBgZGF0YWAgYW5kIGEgYGRpZ2VzdGAsIHJldHVybiB0aGUgY3VycmVudCBpbmRleCBvZiB0aGUga2V5IGluIHRoZVxuICAgKiBga2V5c2AgcGFzc2VkIHRoZSBjb25zdHJ1Y3RvciB0aGF0IHdhcyB1c2VkIHRvIGdlbmVyYXRlIHRoZSBkaWdlc3QuICBJZiBub1xuICAgKiBrZXkgY2FuIGJlIGZvdW5kLCB0aGUgbWV0aG9kIHJldHVybnMgYC0xYC5cbiAgICovXG4gIGFzeW5jIGluZGV4T2YoZGF0YTogRGF0YSwgZGlnZXN0OiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy4ja2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qga2V5ID0gdGhpcy4ja2V5c1tpXSBhcyBLZXk7XG4gICAgICBjb25zdCBjcnlwdG9LZXkgPSBhd2FpdCB0aGlzLiN0b0NyeXB0b0tleShrZXkpO1xuICAgICAgaWYgKFxuICAgICAgICBhd2FpdCBjb21wYXJlKGRpZ2VzdCwgZW5jb2RlQmFzZTY0VXJsKGF3YWl0IHNpZ24oZGF0YSwgY3J5cHRvS2V5KSkpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKiBDdXN0b20gb3V0cHV0IGZvciB7QGxpbmtjb2RlIERlbm8uaW5zcGVjdH0uICovXG4gIFtTeW1ib2wuZm9yKFwiRGVuby5jdXN0b21JbnNwZWN0XCIpXShcbiAgICBpbnNwZWN0OiAodmFsdWU6IHVua25vd24pID0+IHN0cmluZyxcbiAgKTogc3RyaW5nIHtcbiAgICBjb25zdCB7IGxlbmd0aCB9ID0gdGhpcztcbiAgICByZXR1cm4gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAke2luc3BlY3QoeyBsZW5ndGggfSl9YDtcbiAgfVxuXG4gIC8qKiBDdXN0b20gb3V0cHV0IGZvciBOb2RlJ3Mge0BsaW5rY29kZSBodHRwczovL25vZGVqcy5vcmcvYXBpL3V0aWwuaHRtbCN1dGlsaW5zcGVjdG9iamVjdC1vcHRpb25zfHV0aWwuaW5zcGVjdH0uICovXG4gIFtTeW1ib2wuZm9yKFwibm9kZWpzLnV0aWwuaW5zcGVjdC5jdXN0b21cIildKFxuICAgIGRlcHRoOiBudW1iZXIsXG4gICAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgICBvcHRpb25zOiBhbnksXG4gICAgaW5zcGVjdDogKHZhbHVlOiB1bmtub3duLCBvcHRpb25zPzogdW5rbm93bikgPT4gc3RyaW5nLFxuICApOiBzdHJpbmcge1xuICAgIGlmIChkZXB0aCA8IDApIHtcbiAgICAgIHJldHVybiBvcHRpb25zLnN0eWxpemUoYFske3RoaXMuY29uc3RydWN0b3IubmFtZX1dYCwgXCJzcGVjaWFsXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IG5ld09wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7XG4gICAgICBkZXB0aDogb3B0aW9ucy5kZXB0aCA9PT0gbnVsbCA/IG51bGwgOiBvcHRpb25zLmRlcHRoIC0gMSxcbiAgICB9KTtcbiAgICBjb25zdCB7IGxlbmd0aCB9ID0gdGhpcztcbiAgICByZXR1cm4gYCR7b3B0aW9ucy5zdHlsaXplKHRoaXMuY29uc3RydWN0b3IubmFtZSwgXCJzcGVjaWFsXCIpfSAke1xuICAgICAgaW5zcGVjdCh7IGxlbmd0aCB9LCBuZXdPcHRpb25zKVxuICAgIH1gO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Q0FLQztBQUVELFNBQVMsZUFBZSxRQUFRLHlCQUF5QjtBQUN6RCxTQUFTLGVBQWUsUUFBUSx3Q0FBd0M7QUFReEUsTUFBTSxVQUFVLElBQUk7QUFFcEIsU0FBUyxVQUFVLEdBQVE7RUFDekIs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
// denoCacheMetadata=12495748798942135631,4271810041528480917