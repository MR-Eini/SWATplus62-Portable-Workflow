// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Name string is a fully-qualified domain name.
 *
 * @example Usage
 * ```ts
 * import { NAMESPACE_DNS } from "@std/uuid/constants";
 * import { generate } from "@std/uuid/v5";
 *
 * await generate(NAMESPACE_DNS, new TextEncoder().encode("deno.land"));
 * ```
 */ export const NAMESPACE_DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
/**
 * Name string is a URL.
 *
 * @example Usage
 * ```ts
 * import { NAMESPACE_URL } from "@std/uuid/constants";
 * import { generate } from "@std/uuid/v3";
 *
 * await generate(NAMESPACE_URL, new TextEncoder().encode("https://deno.land"));
 * ```
 */ export const NAMESPACE_URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
/**
 * Name string is an ISO OID.
 *
 * @example Usage
 * ```ts
 * import { NAMESPACE_OID } from "@std/uuid/constants";
 * import { generate } from "@std/uuid/v5";
 *
 * await generate(NAMESPACE_OID, new TextEncoder().encode("1.3.6.1.2.1.1.1"));
 * ```
 */ export const NAMESPACE_OID = "6ba7b812-9dad-11d1-80b4-00c04fd430c8";
/**
 * Name string is an X.500 DN (in DER or a text output format).
 *
 * @example Usage
 * ```ts
 * import { NAMESPACE_X500 } from "@std/uuid/constants";
 * import { generate } from "@std/uuid/v3";
 *
 * await generate(NAMESPACE_X500, new TextEncoder().encode("CN=John Doe, OU=People, O=Example.com"));
 * ```
 */ export const NAMESPACE_X500 = "6ba7b814-9dad-11d1-80b4-00c04fd430c8";
/**
 * The nil UUID is special form of UUID that is specified to have all 128 bits
 * set to zero.
 */ export const NIL_UUID = "00000000-0000-0000-0000-000000000000";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvdXVpZC8wLjIyNC4zL2NvbnN0YW50cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIE5hbWUgc3RyaW5nIGlzIGEgZnVsbHktcXVhbGlmaWVkIGRvbWFpbiBuYW1lLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgTkFNRVNQQUNFX0ROUyB9IGZyb20gXCJAc3RkL3V1aWQvY29uc3RhbnRzXCI7XG4gKiBpbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJAc3RkL3V1aWQvdjVcIjtcbiAqXG4gKiBhd2FpdCBnZW5lcmF0ZShOQU1FU1BBQ0VfRE5TLCBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJkZW5vLmxhbmRcIikpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBOQU1FU1BBQ0VfRE5TID0gXCI2YmE3YjgxMC05ZGFkLTExZDEtODBiNC0wMGMwNGZkNDMwYzhcIjtcbi8qKlxuICogTmFtZSBzdHJpbmcgaXMgYSBVUkwuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBOQU1FU1BBQ0VfVVJMIH0gZnJvbSBcIkBzdGQvdXVpZC9jb25zdGFudHNcIjtcbiAqIGltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcIkBzdGQvdXVpZC92M1wiO1xuICpcbiAqIGF3YWl0IGdlbmVyYXRlKE5BTUVTUEFDRV9VUkwsIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImh0dHBzOi8vZGVuby5sYW5kXCIpKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgTkFNRVNQQUNFX1VSTCA9IFwiNmJhN2I4MTEtOWRhZC0xMWQxLTgwYjQtMDBjMDRmZDQzMGM4XCI7XG4vKipcbiAqIE5hbWUgc3RyaW5nIGlzIGFuIElTTyBPSUQuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBOQU1FU1BBQ0VfT0lEIH0gZnJvbSBcIkBzdGQvdXVpZC9jb25zdGFudHNcIjtcbiAqIGltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcIkBzdGQvdXVpZC92NVwiO1xuICpcbiAqIGF3YWl0IGdlbmVyYXRlKE5BTUVTUEFDRV9PSUQsIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcIjEuMy42LjEuMi4xLjEuMVwiKSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IE5BTUVTUEFDRV9PSUQgPSBcIjZiYTdiODEyLTlkYWQtMTFkMS04MGI0LTAwYzA0ZmQ0MzBjOFwiO1xuLyoqXG4gKiBOYW1lIHN0cmluZyBpcyBhbiBYLjUwMCBETiAoaW4gREVSIG9yIGEgdGV4dCBvdXRwdXQgZm9ybWF0KS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IE5BTUVTUEFDRV9YNTAwIH0gZnJvbSBcIkBzdGQvdXVpZC9jb25zdGFudHNcIjtcbiAqIGltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcIkBzdGQvdXVpZC92M1wiO1xuICpcbiAqIGF3YWl0IGdlbmVyYXRlKE5BTUVTUEFDRV9YNTAwLCBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJDTj1Kb2huIERvZSwgT1U9UGVvcGxlLCBPPUV4YW1wbGUuY29tXCIpKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgTkFNRVNQQUNFX1g1MDAgPSBcIjZiYTdiODE0LTlkYWQtMTFkMS04MGI0LTAwYzA0ZmQ0MzBjOFwiO1xuLyoqXG4gKiBUaGUgbmlsIFVVSUQgaXMgc3BlY2lhbCBmb3JtIG9mIFVVSUQgdGhhdCBpcyBzcGVjaWZpZWQgdG8gaGF2ZSBhbGwgMTI4IGJpdHNcbiAqIHNldCB0byB6ZXJvLlxuICovXG5leHBvcnQgY29uc3QgTklMX1VVSUQgPSBcIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMFwiO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Q0FVQyxHQUNELE9BQU8sTUFBTSxnQkFBZ0IsdUNBQXVDO0FBQ3BFOzs7Ozs7Ozs7O0NBVUMsR0FDRCxPQUFPLE1BQU0sZ0JBQWdCLHVDQUF1QztBQUNwRTs7Ozs7Ozs7OztDQVVDLEdBQ0QsT0FBTyxNQUFNLGdCQUFnQix1Q0FBdUM7QUFDcEU7Ozs7Ozs7Ozs7Q0FVQyxHQUNELE9BQU8sTUFBTSxpQkFBaUIsdUNBQXVDO0FBQ3JFOzs7Q0FHQyxHQUNELE9BQU8sTUFBTSxXQUFXLHVDQUF1QyJ9
// denoCacheMetadata=293474882635608491,8596017945138797901