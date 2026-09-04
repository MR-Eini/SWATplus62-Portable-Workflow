// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Generators and validators for
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html | RFC 9562} UUIDs for
 * versions v1, v3, v4 and v5.
 *
 * Use the built-in
 * {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID | crypto.randomUUID()}
 * function instead of this package, if you only need to generate v4 UUIDs.
 *
 * Based on {@linkcode https://www.npmjs.com/package/uuid | npm:uuid}.
 *
 * ```ts
 * import { v5, NAMESPACE_DNS, NIL_UUID } from "@std/uuid";
 * import { assert, assertFalse } from "@std/assert";
 *
 * const data = new TextEncoder().encode("deno.land");
 * const uuid = await v5.generate(NAMESPACE_DNS, data);
 *
 * assert(v5.validate(uuid));
 * assertFalse(v5.validate(NIL_UUID));
 * ```
 *
 * @module
 */ export * from "./common.ts";
export * from "./constants.ts";
import { generate as generateV1, validate as validateV1 } from "./v1.ts";
import { generate as generateV3, validate as validateV3 } from "./v3.ts";
import { validate as validateV4 } from "./v4.ts";
import { generate as generateV5, validate as validateV5 } from "./v5.ts";
/**
 * Generator and validator for
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.1 | UUIDv1}.
 *
 * @example Usage
 * ```ts
 * import { v1 } from "@std/uuid";
 * import { assert } from "@std/assert/assert";
 *
 * const uuid = v1.generate();
 * assert(v1.validate(uuid as string));
 * ```
 */ export const v1 = {
  generate: generateV1,
  validate: validateV1
};
/**
 * Generator and validator for
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.3 | UUIDv3}.
 *
 * @example Usage
 * ```ts
 * import { v3, NAMESPACE_DNS } from "@std/uuid";
 * import { assert } from "@std/assert/assert";
 *
 * const data = new TextEncoder().encode("deno.land");
 * const uuid = await v3.generate(NAMESPACE_DNS, data);
 * assert(v3.validate(uuid));
 * ```
 */ export const v3 = {
  generate: generateV3,
  validate: validateV3
};
/**
 * Validator for
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.4 | UUIDv4}.
 *
 * @example Usage
 * ```ts
 * import { v4 } from "@std/uuid";
 * import { assert } from "@std/assert/assert";
 *
 * const uuid = crypto.randomUUID();
 * assert(v4.validate(uuid));
 * ```
 */ export const v4 = {
  validate: validateV4
};
/**
 * Generator and validator for
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.5 | UUIDv5}.
 *
 * @example Usage
 * ```ts
 * import { v5, NAMESPACE_DNS } from "@std/uuid";
 * import { assert } from "@std/assert/assert";
 *
 * const data = new TextEncoder().encode("deno.land");
 * const uuid = await v5.generate(NAMESPACE_DNS, data);
 * assert(v5.validate(uuid));
 * ```
 */ export const v5 = {
  generate: generateV5,
  validate: validateV5
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvdXVpZC8wLjIyNC4zL21vZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIEdlbmVyYXRvcnMgYW5kIHZhbGlkYXRvcnMgZm9yXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzk1NjIuaHRtbCB8IFJGQyA5NTYyfSBVVUlEcyBmb3JcbiAqIHZlcnNpb25zIHYxLCB2MywgdjQgYW5kIHY1LlxuICpcbiAqIFVzZSB0aGUgYnVpbHQtaW5cbiAqIHtAbGlua2NvZGUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NyeXB0by9yYW5kb21VVUlEIHwgY3J5cHRvLnJhbmRvbVVVSUQoKX1cbiAqIGZ1bmN0aW9uIGluc3RlYWQgb2YgdGhpcyBwYWNrYWdlLCBpZiB5b3Ugb25seSBuZWVkIHRvIGdlbmVyYXRlIHY0IFVVSURzLlxuICpcbiAqIEJhc2VkIG9uIHtAbGlua2NvZGUgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvdXVpZCB8IG5wbTp1dWlkfS5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgdjUsIE5BTUVTUEFDRV9ETlMsIE5JTF9VVUlEIH0gZnJvbSBcIkBzdGQvdXVpZFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0LCBhc3NlcnRGYWxzZSB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IGRhdGEgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJkZW5vLmxhbmRcIik7XG4gKiBjb25zdCB1dWlkID0gYXdhaXQgdjUuZ2VuZXJhdGUoTkFNRVNQQUNFX0ROUywgZGF0YSk7XG4gKlxuICogYXNzZXJ0KHY1LnZhbGlkYXRlKHV1aWQpKTtcbiAqIGFzc2VydEZhbHNlKHY1LnZhbGlkYXRlKE5JTF9VVUlEKSk7XG4gKiBgYGBcbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuZXhwb3J0ICogZnJvbSBcIi4vY29tbW9uLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9jb25zdGFudHMudHNcIjtcblxuaW1wb3J0IHsgZ2VuZXJhdGUgYXMgZ2VuZXJhdGVWMSwgdmFsaWRhdGUgYXMgdmFsaWRhdGVWMSB9IGZyb20gXCIuL3YxLnRzXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSBhcyBnZW5lcmF0ZVYzLCB2YWxpZGF0ZSBhcyB2YWxpZGF0ZVYzIH0gZnJvbSBcIi4vdjMudHNcIjtcbmltcG9ydCB7IHZhbGlkYXRlIGFzIHZhbGlkYXRlVjQgfSBmcm9tIFwiLi92NC50c1wiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgYXMgZ2VuZXJhdGVWNSwgdmFsaWRhdGUgYXMgdmFsaWRhdGVWNSB9IGZyb20gXCIuL3Y1LnRzXCI7XG5cbi8qKlxuICogR2VuZXJhdG9yIGFuZCB2YWxpZGF0b3IgZm9yXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzk1NjIuaHRtbCNzZWN0aW9uLTUuMSB8IFVVSUR2MX0uXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB2MSB9IGZyb20gXCJAc3RkL3V1aWRcIjtcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCB1dWlkID0gdjEuZ2VuZXJhdGUoKTtcbiAqIGFzc2VydCh2MS52YWxpZGF0ZSh1dWlkIGFzIHN0cmluZykpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCB2MSA9IHtcbiAgZ2VuZXJhdGU6IGdlbmVyYXRlVjEsXG4gIHZhbGlkYXRlOiB2YWxpZGF0ZVYxLFxufTtcblxuLyoqXG4gKiBHZW5lcmF0b3IgYW5kIHZhbGlkYXRvciBmb3JcbiAqIHtAbGluayBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjOTU2Mi5odG1sI3NlY3Rpb24tNS4zIHwgVVVJRHYzfS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHYzLCBOQU1FU1BBQ0VfRE5TIH0gZnJvbSBcIkBzdGQvdXVpZFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IGRhdGEgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJkZW5vLmxhbmRcIik7XG4gKiBjb25zdCB1dWlkID0gYXdhaXQgdjMuZ2VuZXJhdGUoTkFNRVNQQUNFX0ROUywgZGF0YSk7XG4gKiBhc3NlcnQodjMudmFsaWRhdGUodXVpZCkpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCB2MyA9IHtcbiAgZ2VuZXJhdGU6IGdlbmVyYXRlVjMsXG4gIHZhbGlkYXRlOiB2YWxpZGF0ZVYzLFxufTtcblxuLyoqXG4gKiBWYWxpZGF0b3IgZm9yXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzk1NjIuaHRtbCNzZWN0aW9uLTUuNCB8IFVVSUR2NH0uXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB2NCB9IGZyb20gXCJAc3RkL3V1aWRcIjtcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCB1dWlkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAqIGFzc2VydCh2NC52YWxpZGF0ZSh1dWlkKSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IHY0ID0ge1xuICB2YWxpZGF0ZTogdmFsaWRhdGVWNCxcbn07XG5cbi8qKlxuICogR2VuZXJhdG9yIGFuZCB2YWxpZGF0b3IgZm9yXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzk1NjIuaHRtbCNzZWN0aW9uLTUuNSB8IFVVSUR2NX0uXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB2NSwgTkFNRVNQQUNFX0ROUyB9IGZyb20gXCJAc3RkL3V1aWRcIjtcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCBkYXRhID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFwiZGVuby5sYW5kXCIpO1xuICogY29uc3QgdXVpZCA9IGF3YWl0IHY1LmdlbmVyYXRlKE5BTUVTUEFDRV9ETlMsIGRhdGEpO1xuICogYXNzZXJ0KHY1LnZhbGlkYXRlKHV1aWQpKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgdjUgPSB7XG4gIGdlbmVyYXRlOiBnZW5lcmF0ZVY1LFxuICB2YWxpZGF0ZTogdmFsaWRhdGVWNSxcbn07XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F1QkMsR0FFRCxjQUFjLGNBQWM7QUFDNUIsY0FBYyxpQkFBaUI7QUFFL0IsU0FBUyxZQUFZLFVBQVUsRUFBRSxZQUFZLFVBQVUsUUFBUSxVQUFVO0FBQ3pFLFNBQVMsWUFBWSxVQUFVLEVBQUUsWUFBWSxVQUFVLFFBQVEsVUFBVTtBQUN6RSxTQUFTLFlBQVksVUFBVSxRQUFRLFVBQVU7QUFDakQsU0FBUyxZQUFZLFVBQVUsRUFBRSxZQUFZLFVBQVUsUUFBUSxVQUFVO0FBRXpFOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sTUFBTSxLQUFLO0VBQ2hCLFVBQVU7RUFDVixVQUFVO0FBQ1osRUFBRTtBQUVGOzs7Ozs7Ozs7Ozs7O0NBYUMsR0FDRCxPQUFPLE1BQU0sS0FBSztFQUNoQixVQUFVO0VBQ1YsVUFBVTtBQUNaLEVBQUU7QUFFRjs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLE1BQU0sS0FBSztFQUNoQixVQUFVO0FBQ1osRUFBRTtBQUVGOzs7Ozs7Ozs7Ozs7O0NBYUMsR0FDRCxPQUFPLE1BQU0sS0FBSztFQUNoQixVQUFVO0VBQ1YsVUFBVTtBQUNaLEVBQUUifQ==
// denoCacheMetadata=7063845242936161462,10871097267765262974