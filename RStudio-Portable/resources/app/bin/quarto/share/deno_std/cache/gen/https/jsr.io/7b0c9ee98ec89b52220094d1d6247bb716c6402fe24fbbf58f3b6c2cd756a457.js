// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * Determines whether a string is a valid
 * {@link https://www.rfc-editor.org/rfc/rfc9562.html#section-5.4 | UUIDv4}.
 *
 * @param id UUID value.
 *
 * @returns `true` if the UUID is valid UUIDv4, otherwise `false`.
 *
 * @example Usage
 * ```ts
 * import { validate } from "@std/uuid/v4";
 * import { assert, assertFalse } from "@std/assert";
 *
 * assert(validate(crypto.randomUUID()));
 * assertFalse(validate("this-is-not-a-uuid"));
 * ```
 */ export function validate(id) {
  return UUID_RE.test(id);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvdXVpZC8wLjIyNC4zL3Y0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmNvbnN0IFVVSURfUkUgPVxuICAvXlswLTlhLWZdezh9LVswLTlhLWZdezR9LTRbMC05YS1mXXszfS1bODlhYl1bMC05YS1mXXszfS1bMC05YS1mXXsxMn0kL2k7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgc3RyaW5nIGlzIGEgdmFsaWRcbiAqIHtAbGluayBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjOTU2Mi5odG1sI3NlY3Rpb24tNS40IHwgVVVJRHY0fS5cbiAqXG4gKiBAcGFyYW0gaWQgVVVJRCB2YWx1ZS5cbiAqXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIFVVSUQgaXMgdmFsaWQgVVVJRHY0LCBvdGhlcndpc2UgYGZhbHNlYC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHZhbGlkYXRlIH0gZnJvbSBcIkBzdGQvdXVpZC92NFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0LCBhc3NlcnRGYWxzZSB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydCh2YWxpZGF0ZShjcnlwdG8ucmFuZG9tVVVJRCgpKSk7XG4gKiBhc3NlcnRGYWxzZSh2YWxpZGF0ZShcInRoaXMtaXMtbm90LWEtdXVpZFwiKSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlKFxuICBpZDogc3RyaW5nLFxuKTogaWQgaXMgUmV0dXJuVHlwZTx0eXBlb2YgY3J5cHRvLnJhbmRvbVVVSUQ+IHtcbiAgcmV0dXJuIFVVSURfUkUudGVzdChpZCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxNQUFNLFVBQ0o7QUFFRjs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUNELE9BQU8sU0FBUyxTQUNkLEVBQVU7RUFFVixPQUFPLFFBQVEsSUFBSSxDQUFDO0FBQ3RCIn0=
// denoCacheMetadata=4709929873521558299,12717706129239231666