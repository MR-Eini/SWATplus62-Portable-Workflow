// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Extensions to the
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API | Web Crypto API}
 * supporting additional encryption APIs, but also delegating to the built-in
 * APIs when possible.
 *
 * Provides additional digest algorithms that are not part of the WebCrypto
 * standard as well as a `subtle.digest` and `subtle.digestSync` methods.
 *
 * The {@linkcode KeyStack} export implements the {@linkcode KeyRing} interface
 * for managing rotatable keys for signing data to prevent tampering, like with
 * HTTP cookies.
 *
 * ## Supported algorithms
 *
 * Here is a list of supported algorithms. If the algorithm name in WebCrypto
 * and Wasm/Rust is the same, this library prefers to use the implementation
 * provided by WebCrypto.
 *
 * WebCrypto:
 * - `SHA-384`
 * - `SHA-256` (length-extendable)
 * - `SHA-512` (length-extendable)
 *
 * Wasm/Rust:
 * - `BLAKE2B`
 * - `BLAKE2B-128`
 * - `BLAKE2B-160`
 * - `BLAKE2B-224`
 * - `BLAKE2B-256`
 * - `BLAKE2B-384`
 * - `BLAKE2S`
 * - `BLAKE3`
 * - `KECCAK-224`
 * - `KECCAK-256`
 * - `KECCAK-384`
 * - `KECCAK-512`
 * - `SHA-384`
 * - `SHA3-224`
 * - `SHA3-256`
 * - `SHA3-384`
 * - `SHA3-512`
 * - `SHAKE128`
 * - `SHAKE256`
 * - `TIGER`
 * - `RIPEMD-160` (length-extendable)
 * - `SHA-224` (length-extendable)
 * - `SHA-256` (length-extendable)
 * - `SHA-512` (length-extendable)
 * - `MD4` (length-extendable and collidable)
 * - `MD5` (length-extendable and collidable)
 * - `SHA-1` (length-extendable and collidable)
 * - `FNV32` (non-cryptographic)
 * - `FNV32A` (non-cryptographic)
 * - `FNV64` (non-cryptographic)
 * - `FNV64A` (non-cryptographic)
 *
 * @example
 * ```ts
 * import { crypto } from "@std/crypto";
 *
 * // This will delegate to the runtime's WebCrypto implementation.
 * console.log(
 *   new Uint8Array(
 *     await crypto.subtle.digest(
 *       "SHA-384",
 *       new TextEncoder().encode("hello world"),
 *     ),
 *   ),
 * );
 *
 * // This will use a bundled Wasm/Rust implementation.
 * console.log(
 *   new Uint8Array(
 *     await crypto.subtle.digest(
 *       "BLAKE3",
 *       new TextEncoder().encode("hello world"),
 *     ),
 *   ),
 * );
 * ```
 *
 * @example Convert hash to a string
 *
 * ```ts
 * import {
 *   crypto,
 * } from "@std/crypto";
 * import { encodeHex } from "@std/encoding/hex"
 * import { encodeBase64 } from "@std/encoding/base64"
 *
 * const hash = await crypto.subtle.digest(
 *   "SHA-384",
 *   new TextEncoder().encode("You hear that Mr. Anderson?"),
 * );
 *
 * // Hex encoding
 * console.log(encodeHex(hash));
 *
 * // Or with base64 encoding
 * console.log(encodeBase64(hash));
 * ```
 *
 * @module
 */ import { DIGEST_ALGORITHM_NAMES, instantiateWasm } from "./_wasm/mod.ts";
export { DIGEST_ALGORITHM_NAMES };
/** Digest algorithms supported by WebCrypto. */ const WEB_CRYPTO_DIGEST_ALGORITHM_NAMES = [
  "SHA-384",
  "SHA-256",
  "SHA-512",
  // insecure (length-extendable and collidable):
  "SHA-1"
];
/**
 * A copy of the global WebCrypto interface, with methods bound so they're
 * safe to re-export.
 */ const webCrypto = ((crypto)=>({
    getRandomValues: crypto.getRandomValues?.bind(crypto),
    randomUUID: crypto.randomUUID?.bind(crypto),
    subtle: {
      decrypt: crypto.subtle?.decrypt?.bind(crypto.subtle),
      deriveBits: crypto.subtle?.deriveBits?.bind(crypto.subtle),
      deriveKey: crypto.subtle?.deriveKey?.bind(crypto.subtle),
      digest: crypto.subtle?.digest?.bind(crypto.subtle),
      encrypt: crypto.subtle?.encrypt?.bind(crypto.subtle),
      exportKey: crypto.subtle?.exportKey?.bind(crypto.subtle),
      generateKey: crypto.subtle?.generateKey?.bind(crypto.subtle),
      importKey: crypto.subtle?.importKey?.bind(crypto.subtle),
      sign: crypto.subtle?.sign?.bind(crypto.subtle),
      unwrapKey: crypto.subtle?.unwrapKey?.bind(crypto.subtle),
      verify: crypto.subtle?.verify?.bind(crypto.subtle),
      wrapKey: crypto.subtle?.wrapKey?.bind(crypto.subtle)
    }
  }))(globalThis.crypto);
function toUint8Array(data) {
  if (data instanceof Uint8Array) {
    return data;
  } else if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  } else if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  return undefined;
}
/**
 * An wrapper for WebCrypto adding support for additional non-standard
 * algorithms, but delegating to the runtime WebCrypto implementation whenever
 * possible.
 */ const stdCrypto = ((x)=>x)({
  ...webCrypto,
  subtle: {
    ...webCrypto.subtle,
    /**
     * Polyfills stream support until the Web Crypto API does so:
     * @see {@link https://github.com/wintercg/proposal-webcrypto-streams}
     */ async digest (algorithm, data) {
      const { name, length } = normalizeAlgorithm(algorithm);
      assertValidDigestLength(length);
      // We delegate to WebCrypto whenever possible,
      if (// if the algorithm is supported by the WebCrypto standard,
      WEB_CRYPTO_DIGEST_ALGORITHM_NAMES.includes(name) && // and the data is a single buffer,
      isBufferSource(data)) {
        return await webCrypto.subtle.digest(algorithm, data);
      } else if (DIGEST_ALGORITHM_NAMES.includes(name)) {
        if (isBufferSource(data)) {
          // Otherwise, we use our bundled Wasm implementation via digestSync
          // if it supports the algorithm.
          return stdCrypto.subtle.digestSync(algorithm, data);
        } else if (isIterable(data)) {
          return stdCrypto.subtle.digestSync(algorithm, data);
        } else if (isAsyncIterable(data)) {
          const wasmCrypto = instantiateWasm();
          const context = new wasmCrypto.DigestContext(name);
          for await (const chunk of data){
            const chunkBytes = toUint8Array(chunk);
            if (!chunkBytes) {
              throw new TypeError("data contained chunk of the wrong type");
            }
            context.update(chunkBytes);
          }
          return context.digestAndDrop(length).buffer;
        } else {
          throw new TypeError("data must be a BufferSource or [Async]Iterable<BufferSource>");
        }
      }
      // (TypeScript type definitions prohibit this case.) If they're trying
      // to call an algorithm we don't recognize, pass it along to WebCrypto
      // in case it's a non-standard algorithm supported by the the runtime
      // they're using.
      return await webCrypto.subtle.digest(algorithm, data);
    },
    digestSync (algorithm, data) {
      const { name, length } = normalizeAlgorithm(algorithm);
      assertValidDigestLength(length);
      const wasmCrypto = instantiateWasm();
      if (isBufferSource(data)) {
        const bytes = toUint8Array(data);
        return wasmCrypto.digest(name, bytes, length).buffer;
      }
      if (isIterable(data)) {
        const context = new wasmCrypto.DigestContext(name);
        for (const chunk of data){
          const chunkBytes = toUint8Array(chunk);
          if (!chunkBytes) {
            throw new TypeError("data contained chunk of the wrong type");
          }
          context.update(chunkBytes);
        }
        return context.digestAndDrop(length).buffer;
      }
      throw new TypeError("data must be a BufferSource or Iterable<BufferSource>");
    }
  }
});
/**
 * Digest algorithm names supported by std/crypto with a Wasm implementation.
 *
 * @deprecated This will be removed in 1.0.0. Use
 * {@linkcode DIGEST_ALGORITHM_NAMES} instead.
 */ export const wasmDigestAlgorithms = DIGEST_ALGORITHM_NAMES;
/*
 * The largest digest length the current Wasm implementation can support. This
 * is the value of `isize::MAX` on 32-bit platforms like Wasm, which is the
 * maximum allowed capacity of a Rust `Vec<u8>`.
 */ const MAX_DIGEST_LENGTH = 0x7FFF_FFFF;
/**
 * Asserts that a number is a valid length for a digest, which must be an
 * integer that fits in a Rust `Vec<u8>`, or be undefined.
 */ function assertValidDigestLength(value) {
  if (value !== undefined && (value < 0 || value > MAX_DIGEST_LENGTH || !Number.isInteger(value))) {
    throw new RangeError(`length must be an integer between 0 and ${MAX_DIGEST_LENGTH}, inclusive`);
  }
}
function normalizeAlgorithm(algorithm) {
  return typeof algorithm === "string" ? {
    name: algorithm.toUpperCase()
  } : {
    ...algorithm,
    name: algorithm.name.toUpperCase()
  };
}
function isBufferSource(obj) {
  return obj instanceof ArrayBuffer || ArrayBuffer.isView(obj);
}
function isIterable(obj) {
  return typeof obj[Symbol.iterator] === "function";
}
function isAsyncIterable(obj) {
  return typeof obj[Symbol.asyncIterator] === "function";
}
export { stdCrypto as crypto };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY3J5cHRvLzAuMjI0LjAvY3J5cHRvLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogRXh0ZW5zaW9ucyB0byB0aGVcbiAqIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViX0NyeXB0b19BUEkgfCBXZWIgQ3J5cHRvIEFQSX1cbiAqIHN1cHBvcnRpbmcgYWRkaXRpb25hbCBlbmNyeXB0aW9uIEFQSXMsIGJ1dCBhbHNvIGRlbGVnYXRpbmcgdG8gdGhlIGJ1aWx0LWluXG4gKiBBUElzIHdoZW4gcG9zc2libGUuXG4gKlxuICogUHJvdmlkZXMgYWRkaXRpb25hbCBkaWdlc3QgYWxnb3JpdGhtcyB0aGF0IGFyZSBub3QgcGFydCBvZiB0aGUgV2ViQ3J5cHRvXG4gKiBzdGFuZGFyZCBhcyB3ZWxsIGFzIGEgYHN1YnRsZS5kaWdlc3RgIGFuZCBgc3VidGxlLmRpZ2VzdFN5bmNgIG1ldGhvZHMuXG4gKlxuICogVGhlIHtAbGlua2NvZGUgS2V5U3RhY2t9IGV4cG9ydCBpbXBsZW1lbnRzIHRoZSB7QGxpbmtjb2RlIEtleVJpbmd9IGludGVyZmFjZVxuICogZm9yIG1hbmFnaW5nIHJvdGF0YWJsZSBrZXlzIGZvciBzaWduaW5nIGRhdGEgdG8gcHJldmVudCB0YW1wZXJpbmcsIGxpa2Ugd2l0aFxuICogSFRUUCBjb29raWVzLlxuICpcbiAqICMjIFN1cHBvcnRlZCBhbGdvcml0aG1zXG4gKlxuICogSGVyZSBpcyBhIGxpc3Qgb2Ygc3VwcG9ydGVkIGFsZ29yaXRobXMuIElmIHRoZSBhbGdvcml0aG0gbmFtZSBpbiBXZWJDcnlwdG9cbiAqIGFuZCBXYXNtL1J1c3QgaXMgdGhlIHNhbWUsIHRoaXMgbGlicmFyeSBwcmVmZXJzIHRvIHVzZSB0aGUgaW1wbGVtZW50YXRpb25cbiAqIHByb3ZpZGVkIGJ5IFdlYkNyeXB0by5cbiAqXG4gKiBXZWJDcnlwdG86XG4gKiAtIGBTSEEtMzg0YFxuICogLSBgU0hBLTI1NmAgKGxlbmd0aC1leHRlbmRhYmxlKVxuICogLSBgU0hBLTUxMmAgKGxlbmd0aC1leHRlbmRhYmxlKVxuICpcbiAqIFdhc20vUnVzdDpcbiAqIC0gYEJMQUtFMkJgXG4gKiAtIGBCTEFLRTJCLTEyOGBcbiAqIC0gYEJMQUtFMkItMTYwYFxuICogLSBgQkxBS0UyQi0yMjRgXG4gKiAtIGBCTEFLRTJCLTI1NmBcbiAqIC0gYEJMQUtFMkItMzg0YFxuICogLSBgQkxBS0UyU2BcbiAqIC0gYEJMQUtFM2BcbiAqIC0gYEtFQ0NBSy0yMjRgXG4gKiAtIGBLRUNDQUstMjU2YFxuICogLSBgS0VDQ0FLLTM4NGBcbiAqIC0gYEtFQ0NBSy01MTJgXG4gKiAtIGBTSEEtMzg0YFxuICogLSBgU0hBMy0yMjRgXG4gKiAtIGBTSEEzLTI1NmBcbiAqIC0gYFNIQTMtMzg0YFxuICogLSBgU0hBMy01MTJgXG4gKiAtIGBTSEFLRTEyOGBcbiAqIC0gYFNIQUtFMjU2YFxuICogLSBgVElHRVJgXG4gKiAtIGBSSVBFTUQtMTYwYCAobGVuZ3RoLWV4dGVuZGFibGUpXG4gKiAtIGBTSEEtMjI0YCAobGVuZ3RoLWV4dGVuZGFibGUpXG4gKiAtIGBTSEEtMjU2YCAobGVuZ3RoLWV4dGVuZGFibGUpXG4gKiAtIGBTSEEtNTEyYCAobGVuZ3RoLWV4dGVuZGFibGUpXG4gKiAtIGBNRDRgIChsZW5ndGgtZXh0ZW5kYWJsZSBhbmQgY29sbGlkYWJsZSlcbiAqIC0gYE1ENWAgKGxlbmd0aC1leHRlbmRhYmxlIGFuZCBjb2xsaWRhYmxlKVxuICogLSBgU0hBLTFgIChsZW5ndGgtZXh0ZW5kYWJsZSBhbmQgY29sbGlkYWJsZSlcbiAqIC0gYEZOVjMyYCAobm9uLWNyeXB0b2dyYXBoaWMpXG4gKiAtIGBGTlYzMkFgIChub24tY3J5cHRvZ3JhcGhpYylcbiAqIC0gYEZOVjY0YCAobm9uLWNyeXB0b2dyYXBoaWMpXG4gKiAtIGBGTlY2NEFgIChub24tY3J5cHRvZ3JhcGhpYylcbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNyeXB0byB9IGZyb20gXCJAc3RkL2NyeXB0b1wiO1xuICpcbiAqIC8vIFRoaXMgd2lsbCBkZWxlZ2F0ZSB0byB0aGUgcnVudGltZSdzIFdlYkNyeXB0byBpbXBsZW1lbnRhdGlvbi5cbiAqIGNvbnNvbGUubG9nKFxuICogICBuZXcgVWludDhBcnJheShcbiAqICAgICBhd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdChcbiAqICAgICAgIFwiU0hBLTM4NFwiLFxuICogICAgICAgbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFwiaGVsbG8gd29ybGRcIiksXG4gKiAgICAgKSxcbiAqICAgKSxcbiAqICk7XG4gKlxuICogLy8gVGhpcyB3aWxsIHVzZSBhIGJ1bmRsZWQgV2FzbS9SdXN0IGltcGxlbWVudGF0aW9uLlxuICogY29uc29sZS5sb2coXG4gKiAgIG5ldyBVaW50OEFycmF5KFxuICogICAgIGF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KFxuICogICAgICAgXCJCTEFLRTNcIixcbiAqICAgICAgIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImhlbGxvIHdvcmxkXCIpLFxuICogICAgICksXG4gKiAgICksXG4gKiApO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgQ29udmVydCBoYXNoIHRvIGEgc3RyaW5nXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7XG4gKiAgIGNyeXB0byxcbiAqIH0gZnJvbSBcIkBzdGQvY3J5cHRvXCI7XG4gKiBpbXBvcnQgeyBlbmNvZGVIZXggfSBmcm9tIFwiQHN0ZC9lbmNvZGluZy9oZXhcIlxuICogaW1wb3J0IHsgZW5jb2RlQmFzZTY0IH0gZnJvbSBcIkBzdGQvZW5jb2RpbmcvYmFzZTY0XCJcbiAqXG4gKiBjb25zdCBoYXNoID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kaWdlc3QoXG4gKiAgIFwiU0hBLTM4NFwiLFxuICogICBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJZb3UgaGVhciB0aGF0IE1yLiBBbmRlcnNvbj9cIiksXG4gKiApO1xuICpcbiAqIC8vIEhleCBlbmNvZGluZ1xuICogY29uc29sZS5sb2coZW5jb2RlSGV4KGhhc2gpKTtcbiAqXG4gKiAvLyBPciB3aXRoIGJhc2U2NCBlbmNvZGluZ1xuICogY29uc29sZS5sb2coZW5jb2RlQmFzZTY0KGhhc2gpKTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHtcbiAgRElHRVNUX0FMR09SSVRITV9OQU1FUyxcbiAgdHlwZSBEaWdlc3RBbGdvcml0aG1OYW1lLFxuICBpbnN0YW50aWF0ZVdhc20sXG59IGZyb20gXCIuL193YXNtL21vZC50c1wiO1xuXG5leHBvcnQgeyBESUdFU1RfQUxHT1JJVEhNX05BTUVTLCB0eXBlIERpZ2VzdEFsZ29yaXRobU5hbWUgfTtcblxuLyoqIERpZ2VzdCBhbGdvcml0aG1zIHN1cHBvcnRlZCBieSBXZWJDcnlwdG8uICovXG5jb25zdCBXRUJfQ1JZUFRPX0RJR0VTVF9BTEdPUklUSE1fTkFNRVMgPSBbXG4gIFwiU0hBLTM4NFwiLFxuICBcIlNIQS0yNTZcIixcbiAgXCJTSEEtNTEyXCIsXG4gIC8vIGluc2VjdXJlIChsZW5ndGgtZXh0ZW5kYWJsZSBhbmQgY29sbGlkYWJsZSk6XG4gIFwiU0hBLTFcIixcbl0gYXMgY29uc3Q7XG5cbi8qKlxuICogQSBjb3B5IG9mIHRoZSBnbG9iYWwgV2ViQ3J5cHRvIGludGVyZmFjZSwgd2l0aCBtZXRob2RzIGJvdW5kIHNvIHRoZXkncmVcbiAqIHNhZmUgdG8gcmUtZXhwb3J0LlxuICovXG5jb25zdCB3ZWJDcnlwdG8gPSAoKGNyeXB0bykgPT4gKHtcbiAgZ2V0UmFuZG9tVmFsdWVzOiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzPy5iaW5kKGNyeXB0byksXG4gIHJhbmRvbVVVSUQ6IGNyeXB0by5yYW5kb21VVUlEPy5iaW5kKGNyeXB0byksXG4gIHN1YnRsZToge1xuICAgIGRlY3J5cHQ6IGNyeXB0by5zdWJ0bGU/LmRlY3J5cHQ/LmJpbmQoY3J5cHRvLnN1YnRsZSksXG4gICAgZGVyaXZlQml0czogY3J5cHRvLnN1YnRsZT8uZGVyaXZlQml0cz8uYmluZChjcnlwdG8uc3VidGxlKSxcbiAgICBkZXJpdmVLZXk6IGNyeXB0by5zdWJ0bGU/LmRlcml2ZUtleT8uYmluZChjcnlwdG8uc3VidGxlKSxcbiAgICBkaWdlc3Q6IGNyeXB0by5zdWJ0bGU/LmRpZ2VzdD8uYmluZChjcnlwdG8uc3VidGxlKSxcbiAgICBlbmNyeXB0OiBjcnlwdG8uc3VidGxlPy5lbmNyeXB0Py5iaW5kKGNyeXB0by5zdWJ0bGUpLFxuICAgIGV4cG9ydEtleTogY3J5cHRvLnN1YnRsZT8uZXhwb3J0S2V5Py5iaW5kKGNyeXB0by5zdWJ0bGUpLFxuICAgIGdlbmVyYXRlS2V5OiBjcnlwdG8uc3VidGxlPy5nZW5lcmF0ZUtleT8uYmluZChjcnlwdG8uc3VidGxlKSxcbiAgICBpbXBvcnRLZXk6IGNyeXB0by5zdWJ0bGU/LmltcG9ydEtleT8uYmluZChjcnlwdG8uc3VidGxlKSxcbiAgICBzaWduOiBjcnlwdG8uc3VidGxlPy5zaWduPy5iaW5kKGNyeXB0by5zdWJ0bGUpLFxuICAgIHVud3JhcEtleTogY3J5cHRvLnN1YnRsZT8udW53cmFwS2V5Py5iaW5kKGNyeXB0by5zdWJ0bGUpLFxuICAgIHZlcmlmeTogY3J5cHRvLnN1YnRsZT8udmVyaWZ5Py5iaW5kKGNyeXB0by5zdWJ0bGUpLFxuICAgIHdyYXBLZXk6IGNyeXB0by5zdWJ0bGU/LndyYXBLZXk/LmJpbmQoY3J5cHRvLnN1YnRsZSksXG4gIH0sXG59KSkoZ2xvYmFsVGhpcy5jcnlwdG8pO1xuXG5mdW5jdGlvbiB0b1VpbnQ4QXJyYXkoZGF0YTogdW5rbm93bik6IFVpbnQ4QXJyYXkgfCB1bmRlZmluZWQge1xuICBpZiAoZGF0YSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICByZXR1cm4gZGF0YTtcbiAgfSBlbHNlIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKTtcbiAgfSBlbHNlIGlmIChkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqIEV4dGVuc2lvbnMgdG8gdGhlIHdlYiBzdGFuZGFyZCBgU3VidGxlQ3J5cHRvYCBpbnRlcmZhY2UuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0ZFN1YnRsZUNyeXB0byBleHRlbmRzIFN1YnRsZUNyeXB0byB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IGBQcm9taXNlYCBvYmplY3QgdGhhdCB3aWxsIGRpZ2VzdCBgZGF0YWAgdXNpbmcgdGhlIHNwZWNpZmllZFxuICAgKiBgQWxnb3JpdGhtSWRlbnRpZmllcmAuXG4gICAqL1xuICBkaWdlc3QoXG4gICAgYWxnb3JpdGhtOiBEaWdlc3RBbGdvcml0aG0sXG4gICAgZGF0YTogQnVmZmVyU291cmNlIHwgQXN5bmNJdGVyYWJsZTxCdWZmZXJTb3VyY2U+IHwgSXRlcmFibGU8QnVmZmVyU291cmNlPixcbiAgKTogUHJvbWlzZTxBcnJheUJ1ZmZlcj47XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBBcnJheUJ1ZmZlciB3aXRoIHRoZSByZXN1bHQgb2YgZGlnZXN0aW5nIGBkYXRhYCB1c2luZyB0aGVcbiAgICogc3BlY2lmaWVkIGBBbGdvcml0aG1JZGVudGlmaWVyYC5cbiAgICovXG4gIGRpZ2VzdFN5bmMoXG4gICAgYWxnb3JpdGhtOiBEaWdlc3RBbGdvcml0aG0sXG4gICAgZGF0YTogQnVmZmVyU291cmNlIHwgSXRlcmFibGU8QnVmZmVyU291cmNlPixcbiAgKTogQXJyYXlCdWZmZXI7XG59XG5cbi8qKiBFeHRlbnNpb25zIHRvIHRoZSBXZWIge0BsaW5rY29kZSBDcnlwdG99IGludGVyZmFjZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RkQ3J5cHRvIGV4dGVuZHMgQ3J5cHRvIHtcbiAgLyoqIEV4dGVuc2lvbiB0byB0aGUge0BsaW5rY29kZSBjcnlwdG8uU3VidGxlQ3J5cHRvfSBpbnRlcmZhY2UuICovXG4gIHJlYWRvbmx5IHN1YnRsZTogU3RkU3VidGxlQ3J5cHRvO1xufVxuXG4vKipcbiAqIEFuIHdyYXBwZXIgZm9yIFdlYkNyeXB0byBhZGRpbmcgc3VwcG9ydCBmb3IgYWRkaXRpb25hbCBub24tc3RhbmRhcmRcbiAqIGFsZ29yaXRobXMsIGJ1dCBkZWxlZ2F0aW5nIHRvIHRoZSBydW50aW1lIFdlYkNyeXB0byBpbXBsZW1lbnRhdGlvbiB3aGVuZXZlclxuICogcG9zc2libGUuXG4gKi9cbmNvbnN0IHN0ZENyeXB0bzogU3RkQ3J5cHRvID0gKCh4KSA9PiB4KSh7XG4gIC4uLndlYkNyeXB0byxcbiAgc3VidGxlOiB7XG4gICAgLi4ud2ViQ3J5cHRvLnN1YnRsZSxcblxuICAgIC8qKlxuICAgICAqIFBvbHlmaWxscyBzdHJlYW0gc3VwcG9ydCB1bnRpbCB0aGUgV2ViIENyeXB0byBBUEkgZG9lcyBzbzpcbiAgICAgKiBAc2VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vd2ludGVyY2cvcHJvcG9zYWwtd2ViY3J5cHRvLXN0cmVhbXN9XG4gICAgICovXG4gICAgYXN5bmMgZGlnZXN0KFxuICAgICAgYWxnb3JpdGhtOiBEaWdlc3RBbGdvcml0aG0sXG4gICAgICBkYXRhOiBCdWZmZXJTb3VyY2UgfCBBc3luY0l0ZXJhYmxlPEJ1ZmZlclNvdXJjZT4gfCBJdGVyYWJsZTxCdWZmZXJTb3VyY2U+LFxuICAgICk6IFByb21pc2U8QXJyYXlCdWZmZXI+IHtcbiAgICAgIGNvbnN0IHsgbmFtZSwgbGVuZ3RoIH0gPSBub3JtYWxpemVBbGdvcml0aG0oYWxnb3JpdGhtKTtcblxuICAgICAgYXNzZXJ0VmFsaWREaWdlc3RMZW5ndGgobGVuZ3RoKTtcblxuICAgICAgLy8gV2UgZGVsZWdhdGUgdG8gV2ViQ3J5cHRvIHdoZW5ldmVyIHBvc3NpYmxlLFxuICAgICAgaWYgKFxuICAgICAgICAvLyBpZiB0aGUgYWxnb3JpdGhtIGlzIHN1cHBvcnRlZCBieSB0aGUgV2ViQ3J5cHRvIHN0YW5kYXJkLFxuICAgICAgICAoV0VCX0NSWVBUT19ESUdFU1RfQUxHT1JJVEhNX05BTUVTIGFzIHJlYWRvbmx5IHN0cmluZ1tdKS5pbmNsdWRlcyhcbiAgICAgICAgICBuYW1lLFxuICAgICAgICApICYmXG4gICAgICAgIC8vIGFuZCB0aGUgZGF0YSBpcyBhIHNpbmdsZSBidWZmZXIsXG4gICAgICAgIGlzQnVmZmVyU291cmNlKGRhdGEpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdlYkNyeXB0by5zdWJ0bGUuZGlnZXN0KGFsZ29yaXRobSwgZGF0YSk7XG4gICAgICB9IGVsc2UgaWYgKERJR0VTVF9BTEdPUklUSE1fTkFNRVMuaW5jbHVkZXMobmFtZSBhcyBEaWdlc3RBbGdvcml0aG1OYW1lKSkge1xuICAgICAgICBpZiAoaXNCdWZmZXJTb3VyY2UoZGF0YSkpIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UsIHdlIHVzZSBvdXIgYnVuZGxlZCBXYXNtIGltcGxlbWVudGF0aW9uIHZpYSBkaWdlc3RTeW5jXG4gICAgICAgICAgLy8gaWYgaXQgc3VwcG9ydHMgdGhlIGFsZ29yaXRobS5cbiAgICAgICAgICByZXR1cm4gc3RkQ3J5cHRvLnN1YnRsZS5kaWdlc3RTeW5jKGFsZ29yaXRobSwgZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNJdGVyYWJsZShkYXRhKSkge1xuICAgICAgICAgIHJldHVybiBzdGRDcnlwdG8uc3VidGxlLmRpZ2VzdFN5bmMoXG4gICAgICAgICAgICBhbGdvcml0aG0sXG4gICAgICAgICAgICBkYXRhIGFzIEl0ZXJhYmxlPEJ1ZmZlclNvdXJjZT4sXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FzeW5jSXRlcmFibGUoZGF0YSkpIHtcbiAgICAgICAgICBjb25zdCB3YXNtQ3J5cHRvID0gaW5zdGFudGlhdGVXYXNtKCk7XG4gICAgICAgICAgY29uc3QgY29udGV4dCA9IG5ldyB3YXNtQ3J5cHRvLkRpZ2VzdENvbnRleHQobmFtZSk7XG4gICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiBkYXRhIGFzIEFzeW5jSXRlcmFibGU8QnVmZmVyU291cmNlPikge1xuICAgICAgICAgICAgY29uc3QgY2h1bmtCeXRlcyA9IHRvVWludDhBcnJheShjaHVuayk7XG4gICAgICAgICAgICBpZiAoIWNodW5rQnl0ZXMpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImRhdGEgY29udGFpbmVkIGNodW5rIG9mIHRoZSB3cm9uZyB0eXBlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGV4dC51cGRhdGUoY2h1bmtCeXRlcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjb250ZXh0LmRpZ2VzdEFuZERyb3AobGVuZ3RoKS5idWZmZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgIFwiZGF0YSBtdXN0IGJlIGEgQnVmZmVyU291cmNlIG9yIFtBc3luY11JdGVyYWJsZTxCdWZmZXJTb3VyY2U+XCIsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gKFR5cGVTY3JpcHQgdHlwZSBkZWZpbml0aW9ucyBwcm9oaWJpdCB0aGlzIGNhc2UuKSBJZiB0aGV5J3JlIHRyeWluZ1xuICAgICAgLy8gdG8gY2FsbCBhbiBhbGdvcml0aG0gd2UgZG9uJ3QgcmVjb2duaXplLCBwYXNzIGl0IGFsb25nIHRvIFdlYkNyeXB0b1xuICAgICAgLy8gaW4gY2FzZSBpdCdzIGEgbm9uLXN0YW5kYXJkIGFsZ29yaXRobSBzdXBwb3J0ZWQgYnkgdGhlIHRoZSBydW50aW1lXG4gICAgICAvLyB0aGV5J3JlIHVzaW5nLlxuICAgICAgcmV0dXJuIGF3YWl0IHdlYkNyeXB0by5zdWJ0bGUuZGlnZXN0KGFsZ29yaXRobSwgZGF0YSBhcyBCdWZmZXJTb3VyY2UpO1xuICAgIH0sXG5cbiAgICBkaWdlc3RTeW5jKFxuICAgICAgYWxnb3JpdGhtOiBEaWdlc3RBbGdvcml0aG0sXG4gICAgICBkYXRhOiBCdWZmZXJTb3VyY2UgfCBJdGVyYWJsZTxCdWZmZXJTb3VyY2U+LFxuICAgICk6IEFycmF5QnVmZmVyIHtcbiAgICAgIGNvbnN0IHsgbmFtZSwgbGVuZ3RoIH0gPSBub3JtYWxpemVBbGdvcml0aG0oYWxnb3JpdGhtKTtcbiAgICAgIGFzc2VydFZhbGlkRGlnZXN0TGVuZ3RoKGxlbmd0aCk7XG5cbiAgICAgIGNvbnN0IHdhc21DcnlwdG8gPSBpbnN0YW50aWF0ZVdhc20oKTtcbiAgICAgIGlmIChpc0J1ZmZlclNvdXJjZShkYXRhKSkge1xuICAgICAgICBjb25zdCBieXRlcyA9IHRvVWludDhBcnJheShkYXRhKSE7XG4gICAgICAgIHJldHVybiB3YXNtQ3J5cHRvLmRpZ2VzdChuYW1lLCBieXRlcywgbGVuZ3RoKS5idWZmZXI7XG4gICAgICB9XG4gICAgICBpZiAoaXNJdGVyYWJsZShkYXRhKSkge1xuICAgICAgICBjb25zdCBjb250ZXh0ID0gbmV3IHdhc21DcnlwdG8uRGlnZXN0Q29udGV4dChuYW1lKTtcbiAgICAgICAgZm9yIChjb25zdCBjaHVuayBvZiBkYXRhKSB7XG4gICAgICAgICAgY29uc3QgY2h1bmtCeXRlcyA9IHRvVWludDhBcnJheShjaHVuayk7XG4gICAgICAgICAgaWYgKCFjaHVua0J5dGVzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiZGF0YSBjb250YWluZWQgY2h1bmsgb2YgdGhlIHdyb25nIHR5cGVcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRleHQudXBkYXRlKGNodW5rQnl0ZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZXh0LmRpZ2VzdEFuZERyb3AobGVuZ3RoKS5idWZmZXI7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBcImRhdGEgbXVzdCBiZSBhIEJ1ZmZlclNvdXJjZSBvciBJdGVyYWJsZTxCdWZmZXJTb3VyY2U+XCIsXG4gICAgICApO1xuICAgIH0sXG4gIH0sXG59KTtcblxuLyoqXG4gKiBBIEZOViAoRm93bGVyL05vbGwvVm8pIGRpZ2VzdCBhbGdvcml0aG0gbmFtZSBzdXBwb3J0ZWQgYnkgc3RkL2NyeXB0by5cbiAqXG4gKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMC5cbiAqL1xuZXhwb3J0IHR5cGUgRk5WQWxnb3JpdGhtcyA9IFwiRk5WMzJcIiB8IFwiRk5WMzJBXCIgfCBcIkZOVjY0XCIgfCBcIkZOVjY0QVwiO1xuXG4vKipcbiAqIERpZ2VzdCBhbGdvcml0aG0gbmFtZXMgc3VwcG9ydGVkIGJ5IHN0ZC9jcnlwdG8gd2l0aCBhIFdhc20gaW1wbGVtZW50YXRpb24uXG4gKlxuICogQGRlcHJlY2F0ZWQgVGhpcyB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAuIFVzZVxuICoge0BsaW5rY29kZSBESUdFU1RfQUxHT1JJVEhNX05BTUVTfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3Qgd2FzbURpZ2VzdEFsZ29yaXRobXMgPSBESUdFU1RfQUxHT1JJVEhNX05BTUVTO1xuXG4vKipcbiAqIEEgZGlnZXN0IGFsZ29yaXRobSBuYW1lIHN1cHBvcnRlZCBieSBzdGQvY3J5cHRvIHdpdGggYSBXYXNtIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLiBVc2VcbiAqIHtAbGlua2NvZGUgRGlnZXN0QWxnb3JpdGhtTmFtZX0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IHR5cGUgV2FzbURpZ2VzdEFsZ29yaXRobSA9IERpZ2VzdEFsZ29yaXRobU5hbWU7XG5cbi8qXG4gKiBUaGUgbGFyZ2VzdCBkaWdlc3QgbGVuZ3RoIHRoZSBjdXJyZW50IFdhc20gaW1wbGVtZW50YXRpb24gY2FuIHN1cHBvcnQuIFRoaXNcbiAqIGlzIHRoZSB2YWx1ZSBvZiBgaXNpemU6Ok1BWGAgb24gMzItYml0IHBsYXRmb3JtcyBsaWtlIFdhc20sIHdoaWNoIGlzIHRoZVxuICogbWF4aW11bSBhbGxvd2VkIGNhcGFjaXR5IG9mIGEgUnVzdCBgVmVjPHU4PmAuXG4gKi9cbmNvbnN0IE1BWF9ESUdFU1RfTEVOR1RIID0gMHg3RkZGX0ZGRkY7XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IGEgbnVtYmVyIGlzIGEgdmFsaWQgbGVuZ3RoIGZvciBhIGRpZ2VzdCwgd2hpY2ggbXVzdCBiZSBhblxuICogaW50ZWdlciB0aGF0IGZpdHMgaW4gYSBSdXN0IGBWZWM8dTg+YCwgb3IgYmUgdW5kZWZpbmVkLlxuICovXG5mdW5jdGlvbiBhc3NlcnRWYWxpZERpZ2VzdExlbmd0aCh2YWx1ZT86IG51bWJlcikge1xuICBpZiAoXG4gICAgdmFsdWUgIT09IHVuZGVmaW5lZCAmJlxuICAgICh2YWx1ZSA8IDAgfHwgdmFsdWUgPiBNQVhfRElHRVNUX0xFTkdUSCB8fFxuICAgICAgIU51bWJlci5pc0ludGVnZXIodmFsdWUpKVxuICApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcbiAgICAgIGBsZW5ndGggbXVzdCBiZSBhbiBpbnRlZ2VyIGJldHdlZW4gMCBhbmQgJHtNQVhfRElHRVNUX0xFTkdUSH0sIGluY2x1c2l2ZWAsXG4gICAgKTtcbiAgfVxufVxuXG4vKiogRXh0ZW5kZWQgZGlnZXN0IGFsZ29yaXRobSBvYmplY3RzLiAqL1xuZXhwb3J0IHR5cGUgRGlnZXN0QWxnb3JpdGhtT2JqZWN0ID0ge1xuICBuYW1lOiBEaWdlc3RBbGdvcml0aG1OYW1lO1xuICBsZW5ndGg/OiBudW1iZXI7XG59O1xuXG4vKipcbiAqIEV4dGVuZGVkIGRpZ2VzdCBhbGdvcml0aG1zIGFjY2VwdGVkIGJ5IHtAbGlua2NvZGUgc3RkQ3J5cHRvLnN1YnRsZS5kaWdlc3R9LlxuICovXG5leHBvcnQgdHlwZSBEaWdlc3RBbGdvcml0aG0gPSBEaWdlc3RBbGdvcml0aG1OYW1lIHwgRGlnZXN0QWxnb3JpdGhtT2JqZWN0O1xuXG5mdW5jdGlvbiBub3JtYWxpemVBbGdvcml0aG0oYWxnb3JpdGhtOiBEaWdlc3RBbGdvcml0aG0pIHtcbiAgcmV0dXJuICgodHlwZW9mIGFsZ29yaXRobSA9PT0gXCJzdHJpbmdcIilcbiAgICA/IHsgbmFtZTogYWxnb3JpdGhtLnRvVXBwZXJDYXNlKCkgfVxuICAgIDoge1xuICAgICAgLi4uYWxnb3JpdGhtLFxuICAgICAgbmFtZTogYWxnb3JpdGhtLm5hbWUudG9VcHBlckNhc2UoKSxcbiAgICB9KSBhcyBEaWdlc3RBbGdvcml0aG1PYmplY3Q7XG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyU291cmNlKG9iajogdW5rbm93bik6IG9iaiBpcyBCdWZmZXJTb3VyY2Uge1xuICByZXR1cm4gb2JqIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgfHwgQXJyYXlCdWZmZXIuaXNWaWV3KG9iaik7XG59XG5cbmZ1bmN0aW9uIGlzSXRlcmFibGU8VD4ob2JqOiB1bmtub3duKTogb2JqIGlzIEl0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIHR5cGVvZiAob2JqIGFzIEl0ZXJhYmxlPFQ+KVtTeW1ib2wuaXRlcmF0b3JdID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbmZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZTxUPihvYmo6IHVua25vd24pOiBvYmogaXMgQXN5bmNJdGVyYWJsZTxUPiB7XG4gIHJldHVybiB0eXBlb2YgKG9iaiBhcyBBc3luY0l0ZXJhYmxlPFQ+KVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuZXhwb3J0IHsgc3RkQ3J5cHRvIGFzIGNyeXB0byB9O1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxx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
// denoCacheMetadata=6237918247708284924,6779183101522188970