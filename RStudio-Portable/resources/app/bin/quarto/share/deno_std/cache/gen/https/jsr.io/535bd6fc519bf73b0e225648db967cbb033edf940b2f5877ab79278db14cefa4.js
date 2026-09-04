// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { NIL_UUID } from "./constants.ts";
/**
 * Determines whether the UUID is the
 * {@link https://www.rfc-editor.org/rfc/rfc4122#section-4.1.7 | nil UUID}.
 *
 * @param id UUID value.
 *
 * @returns `true` if the UUID is the nil UUID, otherwise `false`.
 *
 * @example Usage
 * ```ts
 * import { isNil } from "@std/uuid";
 * import { assert, assertFalse } from "@std/assert";
 *
 * assert(isNil("00000000-0000-0000-0000-000000000000"));
 * assertFalse(isNil(crypto.randomUUID()));
 * ```
 */ export function isNil(id) {
  return id === NIL_UUID;
}
/**
 * Determines whether a string is a valid UUID.
 *
 * @param uuid UUID value.
 *
 * @returns `true` if the string is a valid UUID, otherwise `false`.
 *
 * @example Usage
 * ```ts
 * import { validate } from "@std/uuid";
 * import { assert, assertFalse } from "@std/assert";
 *
 * assert(validate("6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b"));
 * assertFalse(validate("not a UUID"));
 * ```
 */ export function validate(uuid) {
  return /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i.test(uuid);
}
/**
 * Detect RFC version of a UUID.
 *
 * @param uuid UUID value.
 *
 * @returns The RFC version of the UUID.
 *
 * @example Usage
 * ```ts
 * import { version } from "@std/uuid";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * assertEquals(version("d9428888-122b-11e1-b85c-61cd3cbb3210"), 1);
 * assertEquals(version("6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b"), 4);
 * ```
 */ export function version(uuid) {
  if (!validate(uuid)) {
    throw new TypeError("Invalid UUID");
  }
  return parseInt(uuid[14], 16);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvdXVpZC8wLjIyNC4zL2NvbW1vbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBOSUxfVVVJRCB9IGZyb20gXCIuL2NvbnN0YW50cy50c1wiO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgVVVJRCBpcyB0aGVcbiAqIHtAbGluayBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjNDEyMiNzZWN0aW9uLTQuMS43IHwgbmlsIFVVSUR9LlxuICpcbiAqIEBwYXJhbSBpZCBVVUlEIHZhbHVlLlxuICpcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgVVVJRCBpcyB0aGUgbmlsIFVVSUQsIG90aGVyd2lzZSBgZmFsc2VgLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgaXNOaWwgfSBmcm9tIFwiQHN0ZC91dWlkXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnQsIGFzc2VydEZhbHNlIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0KGlzTmlsKFwiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwXCIpKTtcbiAqIGFzc2VydEZhbHNlKGlzTmlsKGNyeXB0by5yYW5kb21VVUlEKCkpKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOaWwoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gaWQgPT09IE5JTF9VVUlEO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBhIHN0cmluZyBpcyBhIHZhbGlkIFVVSUQuXG4gKlxuICogQHBhcmFtIHV1aWQgVVVJRCB2YWx1ZS5cbiAqXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHN0cmluZyBpcyBhIHZhbGlkIFVVSUQsIG90aGVyd2lzZSBgZmFsc2VgLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgdmFsaWRhdGUgfSBmcm9tIFwiQHN0ZC91dWlkXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnQsIGFzc2VydEZhbHNlIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0KHZhbGlkYXRlKFwiNmVjMGJkN2YtMTFjMC00M2RhLTk3NWUtMmE4YWQ5ZWJhZTBiXCIpKTtcbiAqIGFzc2VydEZhbHNlKHZhbGlkYXRlKFwibm90IGEgVVVJRFwiKSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlKHV1aWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gL14oPzpbMC05YS1mXXs4fS1bMC05YS1mXXs0fS1bMS01XVswLTlhLWZdezN9LVs4OWFiXVswLTlhLWZdezN9LVswLTlhLWZdezEyfXwwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDApJC9pXG4gICAgLnRlc3QoXG4gICAgICB1dWlkLFxuICAgICk7XG59XG5cbi8qKlxuICogRGV0ZWN0IFJGQyB2ZXJzaW9uIG9mIGEgVVVJRC5cbiAqXG4gKiBAcGFyYW0gdXVpZCBVVUlEIHZhbHVlLlxuICpcbiAqIEByZXR1cm5zIFRoZSBSRkMgdmVyc2lvbiBvZiB0aGUgVVVJRC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHZlcnNpb24gfSBmcm9tIFwiQHN0ZC91dWlkXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0LWVxdWFsc1wiO1xuICpcbiAqIGFzc2VydEVxdWFscyh2ZXJzaW9uKFwiZDk0Mjg4ODgtMTIyYi0xMWUxLWI4NWMtNjFjZDNjYmIzMjEwXCIpLCAxKTtcbiAqIGFzc2VydEVxdWFscyh2ZXJzaW9uKFwiNmVjMGJkN2YtMTFjMC00M2RhLTk3NWUtMmE4YWQ5ZWJhZTBiXCIpLCA0KTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyc2lvbih1dWlkOiBzdHJpbmcpOiBudW1iZXIge1xuICBpZiAoIXZhbGlkYXRlKHV1aWQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgVVVJRFwiKTtcbiAgfVxuXG4gIHJldHVybiBwYXJzZUludCh1dWlkWzE0XSEsIDE2KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsUUFBUSxRQUFRLGlCQUFpQjtBQUUxQzs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUNELE9BQU8sU0FBUyxNQUFNLEVBQVU7RUFDOUIsT0FBTyxPQUFPO0FBQ2hCO0FBRUE7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBQ0QsT0FBTyxTQUFTLFNBQVMsSUFBWTtFQUNuQyxPQUFPLHNIQUNKLElBQUksQ0FDSDtBQUVOO0FBRUE7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBQ0QsT0FBTyxTQUFTLFFBQVEsSUFBWTtFQUNsQyxJQUFJLENBQUMsU0FBUyxPQUFPO0lBQ25CLE1BQU0sSUFBSSxVQUFVO0VBQ3RCO0VBRUEsT0FBTyxTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUc7QUFDN0IifQ==
// denoCacheMetadata=6882415862360683927,2456102069333353809