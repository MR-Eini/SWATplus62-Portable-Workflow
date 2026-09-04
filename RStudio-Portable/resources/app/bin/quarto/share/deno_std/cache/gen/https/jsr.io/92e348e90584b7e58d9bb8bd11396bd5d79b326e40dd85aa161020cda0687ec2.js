// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { bytesToUuid, uuidToBytes } from "./_common.ts";
import { concat } from "jsr:/@std/bytes@^1.0.0-rc.3/concat";
import { crypto } from "jsr:/@std/crypto@^0.224.0/crypto";
import { validate as validateCommon } from "./common.ts";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[3][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * Determines whether a string is a valid
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.3 | UUIDv3}.
 *
 * @param id UUID value.
 *
 * @returns `true` if the string is a valid UUIDv3, otherwise `false`.
 *
 * @example Usage
 * ```ts
 * import { validate } from "@std/uuid/v3";
 * import { assert, assertFalse } from "@std/assert";
 *
 * assert(validate("22fe6191-c161-3d86-a432-a81f343eda08"));
 * assertFalse(validate("this-is-not-a-uuid"));
 * ```
 */ export function validate(id) {
  return UUID_RE.test(id);
}
/**
 * Generates a
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.3 | UUIDv3}.
 *
 * @param namespace The namespace to use, encoded as a UUID.
 * @param data The data to hash to calculate the MD5 digest for the UUID.
 *
 * @returns A UUIDv3 string.
 *
 * @throws {TypeError} If the namespace is not a valid UUID.
 *
 * @example Usage
 * ```ts
 * import { NAMESPACE_URL } from "@std/uuid/constants";
 * import { generate, validate } from "@std/uuid/v3";
 * import { assert } from "@std/assert";
 *
 * const data = new TextEncoder().encode("python.org");
 * const uuid = await generate(NAMESPACE_URL, data);
 *
 * assert(validate(uuid));
 * ```
 */ export async function generate(namespace, data) {
  if (!validateCommon(namespace)) {
    throw new TypeError("Invalid namespace UUID");
  }
  const space = uuidToBytes(namespace);
  const toHash = concat([
    new Uint8Array(space),
    data
  ]);
  const buffer = await crypto.subtle.digest("MD5", toHash);
  const bytes = new Uint8Array(buffer);
  bytes[6] = bytes[6] & 0x0f | 0x30;
  bytes[8] = bytes[8] & 0x3f | 0x80;
  return bytesToUuid(bytes);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvdXVpZC8wLjIyNC4zL3YzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGJ5dGVzVG9VdWlkLCB1dWlkVG9CeXRlcyB9IGZyb20gXCIuL19jb21tb24udHNcIjtcbmltcG9ydCB7IGNvbmNhdCB9IGZyb20gXCJqc3I6L0BzdGQvYnl0ZXNAXjEuMC4wLXJjLjMvY29uY2F0XCI7XG5pbXBvcnQgeyBjcnlwdG8gfSBmcm9tIFwianNyOi9Ac3RkL2NyeXB0b0BeMC4yMjQuMC9jcnlwdG9cIjtcbmltcG9ydCB7IHZhbGlkYXRlIGFzIHZhbGlkYXRlQ29tbW9uIH0gZnJvbSBcIi4vY29tbW9uLnRzXCI7XG5cbmNvbnN0IFVVSURfUkUgPVxuICAvXlswLTlhLWZdezh9LVswLTlhLWZdezR9LVszXVswLTlhLWZdezN9LVs4OWFiXVswLTlhLWZdezN9LVswLTlhLWZdezEyfSQvaTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBzdHJpbmcgaXMgYSB2YWxpZFxuICoge0BsaW5rIGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM5NTYyLmh0bWwjc2VjdGlvbi01LjMgfCBVVUlEdjN9LlxuICpcbiAqIEBwYXJhbSBpZCBVVUlEIHZhbHVlLlxuICpcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgc3RyaW5nIGlzIGEgdmFsaWQgVVVJRHYzLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHZhbGlkYXRlIH0gZnJvbSBcIkBzdGQvdXVpZC92M1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0LCBhc3NlcnRGYWxzZSB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydCh2YWxpZGF0ZShcIjIyZmU2MTkxLWMxNjEtM2Q4Ni1hNDMyLWE4MWYzNDNlZGEwOFwiKSk7XG4gKiBhc3NlcnRGYWxzZSh2YWxpZGF0ZShcInRoaXMtaXMtbm90LWEtdXVpZFwiKSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIFVVSURfUkUudGVzdChpZCk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGFcbiAqIHtAbGluayBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjOTU2Mi5odG1sI3NlY3Rpb24tNS4zIHwgVVVJRHYzfS5cbiAqXG4gKiBAcGFyYW0gbmFtZXNwYWNlIFRoZSBuYW1lc3BhY2UgdG8gdXNlLCBlbmNvZGVkIGFzIGEgVVVJRC5cbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGhhc2ggdG8gY2FsY3VsYXRlIHRoZSBNRDUgZGlnZXN0IGZvciB0aGUgVVVJRC5cbiAqXG4gKiBAcmV0dXJucyBBIFVVSUR2MyBzdHJpbmcuXG4gKlxuICogQHRocm93cyB7VHlwZUVycm9yfSBJZiB0aGUgbmFtZXNwYWNlIGlzIG5vdCBhIHZhbGlkIFVVSUQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBOQU1FU1BBQ0VfVVJMIH0gZnJvbSBcIkBzdGQvdXVpZC9jb25zdGFudHNcIjtcbiAqIGltcG9ydCB7IGdlbmVyYXRlLCB2YWxpZGF0ZSB9IGZyb20gXCJAc3RkL3V1aWQvdjNcIjtcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IGRhdGEgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJweXRob24ub3JnXCIpO1xuICogY29uc3QgdXVpZCA9IGF3YWl0IGdlbmVyYXRlKE5BTUVTUEFDRV9VUkwsIGRhdGEpO1xuICpcbiAqIGFzc2VydCh2YWxpZGF0ZSh1dWlkKSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlKFxuICBuYW1lc3BhY2U6IHN0cmluZyxcbiAgZGF0YTogVWludDhBcnJheSxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghdmFsaWRhdGVDb21tb24obmFtZXNwYWNlKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIG5hbWVzcGFjZSBVVUlEXCIpO1xuICB9XG4gIGNvbnN0IHNwYWNlID0gdXVpZFRvQnl0ZXMobmFtZXNwYWNlKTtcbiAgY29uc3QgdG9IYXNoID0gY29uY2F0KFtuZXcgVWludDhBcnJheShzcGFjZSksIGRhdGFdKTtcbiAgY29uc3QgYnVmZmVyID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kaWdlc3QoXCJNRDVcIiwgdG9IYXNoKTtcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG4gIGJ5dGVzWzZdID0gKGJ5dGVzWzZdISAmIDB4MGYpIHwgMHgzMDtcbiAgYnl0ZXNbOF0gPSAoYnl0ZXNbOF0hICYgMHgzZikgfCAweDgwO1xuXG4gIHJldHVybiBieXRlc1RvVXVpZChieXRlcyk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFdBQVcsRUFBRSxXQUFXLFFBQVEsZUFBZTtBQUN4RCxTQUFTLE1BQU0sUUFBUSxxQ0FBcUM7QUFDNUQsU0FBUyxNQUFNLFFBQVEsbUNBQW1DO0FBQzFELFNBQVMsWUFBWSxjQUFjLFFBQVEsY0FBYztBQUV6RCxNQUFNLFVBQ0o7QUFFRjs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUNELE9BQU8sU0FBUyxTQUFTLEVBQVU7RUFDakMsT0FBTyxRQUFRLElBQUksQ0FBQztBQUN0QjtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0JDLEdBQ0QsT0FBTyxlQUFlLFNBQ3BCLFNBQWlCLEVBQ2pCLElBQWdCO0VBRWhCLElBQUksQ0FBQyxlQUFlLFlBQVk7SUFDOUIsTUFBTSxJQUFJLFVBQVU7RUFDdEI7RUFDQSxNQUFNLFFBQVEsWUFBWTtFQUMxQixNQUFNLFNBQVMsT0FBTztJQUFDLElBQUksV0FBVztJQUFRO0dBQUs7RUFDbkQsTUFBTSxTQUFTLE1BQU0sT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU87RUFDakQsTUFBTSxRQUFRLElBQUksV0FBVztFQUU3QixLQUFLLENBQUMsRUFBRSxHQUFHLEFBQUMsS0FBSyxDQUFDLEVBQUUsR0FBSSxPQUFRO0VBQ2hDLEtBQUssQ0FBQyxFQUFFLEdBQUcsQUFBQyxLQUFLLENBQUMsRUFBRSxHQUFJLE9BQVE7RUFFaEMsT0FBTyxZQUFZO0FBQ3JCIn0=
// denoCacheMetadata=7560750429364709787,13638809927426924178