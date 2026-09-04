// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { bytesToUuid, uuidToBytes } from "./_common.ts";
import { concat } from "jsr:/@std/bytes@^1.0.0-rc.3/concat";
import { validate as validateCommon } from "./common.ts";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * Determines whether a string is a valid
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.5 | UUIDv5}.
 *
 * @param id UUID value.
 *
 * @returns `true` if the string is a valid UUIDv5, otherwise `false`.
 *
 * @example Usage
 * ```ts
 * import { validate } from "@std/uuid/v5";
 * import { assert, assertFalse } from "@std/assert";
 *
 * assert(validate("7af94e2b-4dd9-50f0-9c9a-8a48519bdef0"));
 * assertFalse(validate(crypto.randomUUID()));
 * ```
 */ export function validate(id) {
  return UUID_RE.test(id);
}
/**
 * Generates a
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.5 | UUIDv5}.
 *
 * @param namespace The namespace to use, encoded as a UUID.
 * @param data The data to hash to calculate the SHA-1 digest for the UUID.
 *
 * @returns A UUIDv5 string.
 *
 * @throws {TypeError} If the namespace is not a valid UUID.
 *
 * @example Usage
 * ```ts
 * import { NAMESPACE_URL } from "@std/uuid/constants";
 * import { generate, validate } from "@std/uuid/v5";
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
  const buffer = await crypto.subtle.digest("sha-1", toHash);
  const bytes = new Uint8Array(buffer);
  bytes[6] = bytes[6] & 0x0f | 0x50;
  bytes[8] = bytes[8] & 0x3f | 0x80;
  return bytesToUuid(bytes);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvdXVpZC8wLjIyNC4zL3Y1LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGJ5dGVzVG9VdWlkLCB1dWlkVG9CeXRlcyB9IGZyb20gXCIuL19jb21tb24udHNcIjtcbmltcG9ydCB7IGNvbmNhdCB9IGZyb20gXCJqc3I6L0BzdGQvYnl0ZXNAXjEuMC4wLXJjLjMvY29uY2F0XCI7XG5pbXBvcnQgeyB2YWxpZGF0ZSBhcyB2YWxpZGF0ZUNvbW1vbiB9IGZyb20gXCIuL2NvbW1vbi50c1wiO1xuXG5jb25zdCBVVUlEX1JFID1cbiAgL15bMC05YS1mXXs4fS1bMC05YS1mXXs0fS1bNV1bMC05YS1mXXszfS1bODlhYl1bMC05YS1mXXszfS1bMC05YS1mXXsxMn0kL2k7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgc3RyaW5nIGlzIGEgdmFsaWRcbiAqIHtAbGluayBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjOTU2Mi5odG1sI3NlY3Rpb24tNS41IHwgVVVJRHY1fS5cbiAqXG4gKiBAcGFyYW0gaWQgVVVJRCB2YWx1ZS5cbiAqXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHN0cmluZyBpcyBhIHZhbGlkIFVVSUR2NSwgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB2YWxpZGF0ZSB9IGZyb20gXCJAc3RkL3V1aWQvdjVcIjtcbiAqIGltcG9ydCB7IGFzc2VydCwgYXNzZXJ0RmFsc2UgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnQodmFsaWRhdGUoXCI3YWY5NGUyYi00ZGQ5LTUwZjAtOWM5YS04YTQ4NTE5YmRlZjBcIikpO1xuICogYXNzZXJ0RmFsc2UodmFsaWRhdGUoY3J5cHRvLnJhbmRvbVVVSUQoKSkpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZShpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBVVUlEX1JFLnRlc3QoaWQpO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzk1NjIuaHRtbCNzZWN0aW9uLTUuNSB8IFVVSUR2NX0uXG4gKlxuICogQHBhcmFtIG5hbWVzcGFjZSBUaGUgbmFtZXNwYWNlIHRvIHVzZSwgZW5jb2RlZCBhcyBhIFVVSUQuXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBoYXNoIHRvIGNhbGN1bGF0ZSB0aGUgU0hBLTEgZGlnZXN0IGZvciB0aGUgVVVJRC5cbiAqXG4gKiBAcmV0dXJucyBBIFVVSUR2NSBzdHJpbmcuXG4gKlxuICogQHRocm93cyB7VHlwZUVycm9yfSBJZiB0aGUgbmFtZXNwYWNlIGlzIG5vdCBhIHZhbGlkIFVVSUQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBOQU1FU1BBQ0VfVVJMIH0gZnJvbSBcIkBzdGQvdXVpZC9jb25zdGFudHNcIjtcbiAqIGltcG9ydCB7IGdlbmVyYXRlLCB2YWxpZGF0ZSB9IGZyb20gXCJAc3RkL3V1aWQvdjVcIjtcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IGRhdGEgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJweXRob24ub3JnXCIpO1xuICogY29uc3QgdXVpZCA9IGF3YWl0IGdlbmVyYXRlKE5BTUVTUEFDRV9VUkwsIGRhdGEpO1xuICpcbiAqIGFzc2VydCh2YWxpZGF0ZSh1dWlkKSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlKFxuICBuYW1lc3BhY2U6IHN0cmluZyxcbiAgZGF0YTogVWludDhBcnJheSxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghdmFsaWRhdGVDb21tb24obmFtZXNwYWNlKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIG5hbWVzcGFjZSBVVUlEXCIpO1xuICB9XG5cbiAgY29uc3Qgc3BhY2UgPSB1dWlkVG9CeXRlcyhuYW1lc3BhY2UpO1xuICBjb25zdCB0b0hhc2ggPSBjb25jYXQoW25ldyBVaW50OEFycmF5KHNwYWNlKSwgZGF0YV0pO1xuICBjb25zdCBidWZmZXIgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdChcInNoYS0xXCIsIHRvSGFzaCk7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuICBieXRlc1s2XSA9IChieXRlc1s2XSEgJiAweDBmKSB8IDB4NTA7XG4gIGJ5dGVzWzhdID0gKGJ5dGVzWzhdISAmIDB4M2YpIHwgMHg4MDtcblxuICByZXR1cm4gYnl0ZXNUb1V1aWQoYnl0ZXMpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxXQUFXLEVBQUUsV0FBVyxRQUFRLGVBQWU7QUFDeEQsU0FBUyxNQUFNLFFBQVEscUNBQXFDO0FBQzVELFNBQVMsWUFBWSxjQUFjLFFBQVEsY0FBYztBQUV6RCxNQUFNLFVBQ0o7QUFFRjs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUNELE9BQU8sU0FBUyxTQUFTLEVBQVU7RUFDakMsT0FBTyxRQUFRLElBQUksQ0FBQztBQUN0QjtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0JDLEdBQ0QsT0FBTyxlQUFlLFNBQ3BCLFNBQWlCLEVBQ2pCLElBQWdCO0VBRWhCLElBQUksQ0FBQyxlQUFlLFlBQVk7SUFDOUIsTUFBTSxJQUFJLFVBQVU7RUFDdEI7RUFFQSxNQUFNLFFBQVEsWUFBWTtFQUMxQixNQUFNLFNBQVMsT0FBTztJQUFDLElBQUksV0FBVztJQUFRO0dBQUs7RUFDbkQsTUFBTSxTQUFTLE1BQU0sT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVM7RUFDbkQsTUFBTSxRQUFRLElBQUksV0FBVztFQUU3QixLQUFLLENBQUMsRUFBRSxHQUFHLEFBQUMsS0FBSyxDQUFDLEVBQUUsR0FBSSxPQUFRO0VBQ2hDLEtBQUssQ0FBQyxFQUFFLEdBQUcsQUFBQyxLQUFLLENBQUMsRUFBRSxHQUFJLE9BQVE7RUFFaEMsT0FBTyxZQUFZO0FBQ3JCIn0=
// denoCacheMetadata=12059510206922301464,15400652858328406221