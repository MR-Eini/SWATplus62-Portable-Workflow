// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { decodeHex, encodeHex } from "jsr:/@std/encoding@1.0.0-rc.2/hex";
const encoder = new TextEncoder();
function splitByLast(value, separator) {
  const index = value.lastIndexOf(separator);
  return index === -1 ? [
    value,
    ""
  ] : [
    value.slice(0, index),
    value.slice(index + 1)
  ];
}
/**
 * Returns a promise with the signed cookie value from the given cryptographic
 * key.
 *
 * @example Usage
 * ```ts no-eval no-assert
 * import { signCookie } from "@std/http/unstable-signed-cookie";
 * import { setCookie } from "@std/http/cookie";
 *
 * const key = await crypto.subtle.generateKey(
 *   { name: "HMAC", hash: "SHA-256" },
 *   true,
 *   ["sign", "verify"],
 * );
 * const value = await signCookie("my-cookie-value", key);
 *
 * const headers = new Headers();
 * setCookie(headers, {
 *   name: "my-cookie-name",
 *   value,
 * });
 *
 * const cookieHeader = headers.get("set-cookie");
 * ```
 *
 * @param value The cookie value to sign.
 * @param key The cryptographic key to sign the cookie with.
 * @returns The signed cookie.
 */ export async function signCookie(value, key) {
  const data = encoder.encode(value);
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const signatureHex = encodeHex(signature);
  return `${value}.${signatureHex}`;
}
/**
 * Returns a promise of a boolean indicating whether the signed cookie is valid.
 *
 * @example Usage
 * ```ts no-eval no-assert
 * import { verifyCookie } from "@std/http/unstable-signed-cookie";
 * import { getCookies } from "@std/http/cookie";
 *
 * const key = await crypto.subtle.generateKey(
 *   { name: "HMAC", hash: "SHA-256" },
 *   true,
 *   ["sign", "verify"],
 * );
 *
 * const headers = new Headers({
 *   Cookie: "location=tokyo.37f7481039762eef5cd46669f93c0a3214dfecba7d0cdc0b0dc40036063fb22e",
 * });
 * const signedCookie = getCookies(headers)["location"];
 * if (signedCookie === undefined) throw new Error("Cookie not found");
 * await verifyCookie(signedCookie, key);
 * ```
 *
 * @param signedCookie The signed cookie to verify.
 * @param key The cryptographic key to verify the cookie with.
 * @returns Whether or not the cookie is valid.
 */ export async function verifyCookie(signedCookie, key) {
  const [value, signatureHex] = splitByLast(signedCookie, ".");
  if (!value || !signatureHex) return false;
  const data = encoder.encode(value);
  const signature = decodeHex(signatureHex);
  return await crypto.subtle.verify("HMAC", key, signature, data);
}
/**
 * Parses a signed cookie to get its value.
 *
 * Important: always verify the cookie using {@linkcode verifyCookie} first.
 *
 * @example Usage
 * ```ts no-eval no-assert
 * import { verifyCookie, parseSignedCookie } from "@std/http/unstable-signed-cookie";
 * import { getCookies } from "@std/http/cookie";
 *
 * const key = await crypto.subtle.generateKey(
 *   { name: "HMAC", hash: "SHA-256" },
 *   true,
 *   ["sign", "verify"],
 * );
 *
 * const headers = new Headers({
 *   Cookie: "location=tokyo.37f7481039762eef5cd46669f93c0a3214dfecba7d0cdc0b0dc40036063fb22e",
 * });
 * const signedCookie = getCookies(headers)["location"];
 * if (signedCookie === undefined) throw new Error("Cookie not found");
 * await verifyCookie(signedCookie, key);
 * const cookie = parseSignedCookie(signedCookie);
 * ```
 *
 * @param signedCookie The signed cookie to parse the value from.
 * @returns The parsed cookie.
 */ export function parseSignedCookie(signedCookie) {
  return splitByLast(signedCookie, ".")[0];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaHR0cC8wLjIyNC41L3Vuc3RhYmxlX3NpZ25lZF9jb29raWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB7IGRlY29kZUhleCwgZW5jb2RlSGV4IH0gZnJvbSBcImpzcjovQHN0ZC9lbmNvZGluZ0AxLjAuMC1yYy4yL2hleFwiO1xuXG5jb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG5cbmZ1bmN0aW9uIHNwbGl0QnlMYXN0KHZhbHVlOiBzdHJpbmcsIHNlcGFyYXRvcjogc3RyaW5nKTogW3N0cmluZywgc3RyaW5nXSB7XG4gIGNvbnN0IGluZGV4ID0gdmFsdWUubGFzdEluZGV4T2Yoc2VwYXJhdG9yKTtcbiAgcmV0dXJuIGluZGV4ID09PSAtMVxuICAgID8gW3ZhbHVlLCBcIlwiXVxuICAgIDogW3ZhbHVlLnNsaWNlKDAsIGluZGV4KSwgdmFsdWUuc2xpY2UoaW5kZXggKyAxKV07XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2Ugd2l0aCB0aGUgc2lnbmVkIGNvb2tpZSB2YWx1ZSBmcm9tIHRoZSBnaXZlbiBjcnlwdG9ncmFwaGljXG4gKiBrZXkuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIG5vLWV2YWwgbm8tYXNzZXJ0XG4gKiBpbXBvcnQgeyBzaWduQ29va2llIH0gZnJvbSBcIkBzdGQvaHR0cC91bnN0YWJsZS1zaWduZWQtY29va2llXCI7XG4gKiBpbXBvcnQgeyBzZXRDb29raWUgfSBmcm9tIFwiQHN0ZC9odHRwL2Nvb2tpZVwiO1xuICpcbiAqIGNvbnN0IGtleSA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZ2VuZXJhdGVLZXkoXG4gKiAgIHsgbmFtZTogXCJITUFDXCIsIGhhc2g6IFwiU0hBLTI1NlwiIH0sXG4gKiAgIHRydWUsXG4gKiAgIFtcInNpZ25cIiwgXCJ2ZXJpZnlcIl0sXG4gKiApO1xuICogY29uc3QgdmFsdWUgPSBhd2FpdCBzaWduQ29va2llKFwibXktY29va2llLXZhbHVlXCIsIGtleSk7XG4gKlxuICogY29uc3QgaGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG4gKiBzZXRDb29raWUoaGVhZGVycywge1xuICogICBuYW1lOiBcIm15LWNvb2tpZS1uYW1lXCIsXG4gKiAgIHZhbHVlLFxuICogfSk7XG4gKlxuICogY29uc3QgY29va2llSGVhZGVyID0gaGVhZGVycy5nZXQoXCJzZXQtY29va2llXCIpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSBjb29raWUgdmFsdWUgdG8gc2lnbi5cbiAqIEBwYXJhbSBrZXkgVGhlIGNyeXB0b2dyYXBoaWMga2V5IHRvIHNpZ24gdGhlIGNvb2tpZSB3aXRoLlxuICogQHJldHVybnMgVGhlIHNpZ25lZCBjb29raWUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaWduQ29va2llKFxuICB2YWx1ZTogc3RyaW5nLFxuICBrZXk6IENyeXB0b0tleSxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IGRhdGEgPSBlbmNvZGVyLmVuY29kZSh2YWx1ZSk7XG4gIGNvbnN0IHNpZ25hdHVyZSA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuc2lnbihcIkhNQUNcIiwga2V5LCBkYXRhKTtcbiAgY29uc3Qgc2lnbmF0dXJlSGV4ID0gZW5jb2RlSGV4KHNpZ25hdHVyZSk7XG4gIHJldHVybiBgJHt2YWx1ZX0uJHtzaWduYXR1cmVIZXh9YDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSBvZiBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBzaWduZWQgY29va2llIGlzIHZhbGlkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1ldmFsIG5vLWFzc2VydFxuICogaW1wb3J0IHsgdmVyaWZ5Q29va2llIH0gZnJvbSBcIkBzdGQvaHR0cC91bnN0YWJsZS1zaWduZWQtY29va2llXCI7XG4gKiBpbXBvcnQgeyBnZXRDb29raWVzIH0gZnJvbSBcIkBzdGQvaHR0cC9jb29raWVcIjtcbiAqXG4gKiBjb25zdCBrZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxuICogICB7IG5hbWU6IFwiSE1BQ1wiLCBoYXNoOiBcIlNIQS0yNTZcIiB9LFxuICogICB0cnVlLFxuICogICBbXCJzaWduXCIsIFwidmVyaWZ5XCJdLFxuICogKTtcbiAqXG4gKiBjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoe1xuICogICBDb29raWU6IFwibG9jYXRpb249dG9reW8uMzdmNzQ4MTAzOTc2MmVlZjVjZDQ2NjY5ZjkzYzBhMzIxNGRmZWNiYTdkMGNkYzBiMGRjNDAwMzYwNjNmYjIyZVwiLFxuICogfSk7XG4gKiBjb25zdCBzaWduZWRDb29raWUgPSBnZXRDb29raWVzKGhlYWRlcnMpW1wibG9jYXRpb25cIl07XG4gKiBpZiAoc2lnbmVkQ29va2llID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNvb2tpZSBub3QgZm91bmRcIik7XG4gKiBhd2FpdCB2ZXJpZnlDb29raWUoc2lnbmVkQ29va2llLCBrZXkpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHNpZ25lZENvb2tpZSBUaGUgc2lnbmVkIGNvb2tpZSB0byB2ZXJpZnkuXG4gKiBAcGFyYW0ga2V5IFRoZSBjcnlwdG9ncmFwaGljIGtleSB0byB2ZXJpZnkgdGhlIGNvb2tpZSB3aXRoLlxuICogQHJldHVybnMgV2hldGhlciBvciBub3QgdGhlIGNvb2tpZSBpcyB2YWxpZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeUNvb2tpZShcbiAgc2lnbmVkQ29va2llOiBzdHJpbmcsXG4gIGtleTogQ3J5cHRvS2V5LFxuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IFt2YWx1ZSwgc2lnbmF0dXJlSGV4XSA9IHNwbGl0QnlMYXN0KHNpZ25lZENvb2tpZSwgXCIuXCIpO1xuICBpZiAoIXZhbHVlIHx8ICFzaWduYXR1cmVIZXgpIHJldHVybiBmYWxzZTtcblxuICBjb25zdCBkYXRhID0gZW5jb2Rlci5lbmNvZGUodmFsdWUpO1xuICBjb25zdCBzaWduYXR1cmUgPSBkZWNvZGVIZXgoc2lnbmF0dXJlSGV4KTtcblxuICByZXR1cm4gYXdhaXQgY3J5cHRvLnN1YnRsZS52ZXJpZnkoXCJITUFDXCIsIGtleSwgc2lnbmF0dXJlLCBkYXRhKTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgYSBzaWduZWQgY29va2llIHRvIGdldCBpdHMgdmFsdWUuXG4gKlxuICogSW1wb3J0YW50OiBhbHdheXMgdmVyaWZ5IHRoZSBjb29raWUgdXNpbmcge0BsaW5rY29kZSB2ZXJpZnlDb29raWV9IGZpcnN0LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1ldmFsIG5vLWFzc2VydFxuICogaW1wb3J0IHsgdmVyaWZ5Q29va2llLCBwYXJzZVNpZ25lZENvb2tpZSB9IGZyb20gXCJAc3RkL2h0dHAvdW5zdGFibGUtc2lnbmVkLWNvb2tpZVwiO1xuICogaW1wb3J0IHsgZ2V0Q29va2llcyB9IGZyb20gXCJAc3RkL2h0dHAvY29va2llXCI7XG4gKlxuICogY29uc3Qga2V5ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5nZW5lcmF0ZUtleShcbiAqICAgeyBuYW1lOiBcIkhNQUNcIiwgaGFzaDogXCJTSEEtMjU2XCIgfSxcbiAqICAgdHJ1ZSxcbiAqICAgW1wic2lnblwiLCBcInZlcmlmeVwiXSxcbiAqICk7XG4gKlxuICogY29uc3QgaGVhZGVycyA9IG5ldyBIZWFkZXJzKHtcbiAqICAgQ29va2llOiBcImxvY2F0aW9uPXRva3lvLjM3Zjc0ODEwMzk3NjJlZWY1Y2Q0NjY2OWY5M2MwYTMyMTRkZmVjYmE3ZDBjZGMwYjBkYzQwMDM2MDYzZmIyMmVcIixcbiAqIH0pO1xuICogY29uc3Qgc2lnbmVkQ29va2llID0gZ2V0Q29va2llcyhoZWFkZXJzKVtcImxvY2F0aW9uXCJdO1xuICogaWYgKHNpZ25lZENvb2tpZSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDb29raWUgbm90IGZvdW5kXCIpO1xuICogYXdhaXQgdmVyaWZ5Q29va2llKHNpZ25lZENvb2tpZSwga2V5KTtcbiAqIGNvbnN0IGNvb2tpZSA9IHBhcnNlU2lnbmVkQ29va2llKHNpZ25lZENvb2tpZSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc2lnbmVkQ29va2llIFRoZSBzaWduZWQgY29va2llIHRvIHBhcnNlIHRoZSB2YWx1ZSBmcm9tLlxuICogQHJldHVybnMgVGhlIHBhcnNlZCBjb29raWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNpZ25lZENvb2tpZShzaWduZWRDb29raWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzcGxpdEJ5TGFzdChzaWduZWRDb29raWUsIFwiLlwiKVswXTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBQ3JDLFNBQVMsU0FBUyxFQUFFLFNBQVMsUUFBUSxvQ0FBb0M7QUFFekUsTUFBTSxVQUFVLElBQUk7QUFFcEIsU0FBUyxZQUFZLEtBQWEsRUFBRSxTQUFpQjtFQUNuRCxNQUFNLFFBQVEsTUFBTSxXQUFXLENBQUM7RUFDaEMsT0FBTyxVQUFVLENBQUMsSUFDZDtJQUFDO0lBQU87R0FBRyxHQUNYO0lBQUMsTUFBTSxLQUFLLENBQUMsR0FBRztJQUFRLE1BQU0sS0FBSyxDQUFDLFFBQVE7R0FBRztBQUNyRDtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNEJDLEdBQ0QsT0FBTyxlQUFlLFdBQ3BCLEtBQWEsRUFDYixHQUFjO0VBRWQsTUFBTSxPQUFPLFFBQVEsTUFBTSxDQUFDO0VBQzVCLE1BQU0sWUFBWSxNQUFNLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUs7RUFDeEQsTUFBTSxlQUFlLFVBQVU7RUFDL0IsT0FBTyxHQUFHLE1BQU0sQ0FBQyxFQUFFLGNBQWM7QUFDbkM7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXlCQyxHQUNELE9BQU8sZUFBZSxhQUNwQixZQUFvQixFQUNwQixHQUFjO0VBRWQsTUFBTSxDQUFDLE9BQU8sYUFBYSxHQUFHLFlBQVksY0FBYztFQUN4RCxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsT0FBTztFQUVwQyxNQUFNLE9BQU8sUUFBUSxNQUFNLENBQUM7RUFDNUIsTUFBTSxZQUFZLFVBQVU7RUFFNUIsT0FBTyxNQUFNLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssV0FBVztBQUM1RDtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EyQkMsR0FDRCxPQUFPLFNBQVMsa0JBQWtCLFlBQW9CO0VBQ3BELE9BQU8sWUFBWSxjQUFjLElBQUksQ0FBQyxFQUFFO0FBQzFDIn0=
// denoCacheMetadata=8692540461072233084,6785951480785158194