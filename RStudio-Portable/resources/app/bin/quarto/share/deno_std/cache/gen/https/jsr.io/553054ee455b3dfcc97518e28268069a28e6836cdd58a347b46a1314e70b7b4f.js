// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { Buffer } from "./buffer.ts";
/**
 * Reader utility for strings.
 *
 * @example Usage
 * ```ts
 * import { StringReader } from "@std/io/string-reader";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const data = new Uint8Array(6);
 * const r = new StringReader("abcdef");
 * const res0 = await r.read(data);
 * const res1 = await r.read(new Uint8Array(6));
 *
 * assertEquals(res0, 6);
 * assertEquals(res1, null);
 * assertEquals(new TextDecoder().decode(data), "abcdef");
 * ```
 *
 * @deprecated This will be removed in 1.0.0. Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */ export class StringReader extends Buffer {
  /**
   * Construct a new instance.
   *
   * @param s The string to read.
   */ constructor(s){
    super(new TextEncoder().encode(s).buffer);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9zdHJpbmdfcmVhZGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCIuL2J1ZmZlci50c1wiO1xuXG4vKipcbiAqIFJlYWRlciB1dGlsaXR5IGZvciBzdHJpbmdzLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgU3RyaW5nUmVhZGVyIH0gZnJvbSBcIkBzdGQvaW8vc3RyaW5nLXJlYWRlclwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2VxdWFsc1wiO1xuICpcbiAqIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheSg2KTtcbiAqIGNvbnN0IHIgPSBuZXcgU3RyaW5nUmVhZGVyKFwiYWJjZGVmXCIpO1xuICogY29uc3QgcmVzMCA9IGF3YWl0IHIucmVhZChkYXRhKTtcbiAqIGNvbnN0IHJlczEgPSBhd2FpdCByLnJlYWQobmV3IFVpbnQ4QXJyYXkoNikpO1xuICpcbiAqIGFzc2VydEVxdWFscyhyZXMwLCA2KTtcbiAqIGFzc2VydEVxdWFscyhyZXMxLCBudWxsKTtcbiAqIGFzc2VydEVxdWFscyhuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoZGF0YSksIFwiYWJjZGVmXCIpO1xuICogYGBgXG4gKlxuICogQGRlcHJlY2F0ZWQgVGhpcyB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAuIFVzZSB0aGUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9TdHJlYW1zX0FQSSB8IFdlYiBTdHJlYW1zIEFQSX0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0cmluZ1JlYWRlciBleHRlbmRzIEJ1ZmZlciB7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBzIFRoZSBzdHJpbmcgdG8gcmVhZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHM6IHN0cmluZykge1xuICAgIHN1cGVyKG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzKS5idWZmZXIpO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLE1BQU0sUUFBUSxjQUFjO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBQ0QsT0FBTyxNQUFNLHFCQUFxQjtFQUNoQzs7OztHQUlDLEdBQ0QsWUFBWSxDQUFTLENBQUU7SUFDckIsS0FBSyxDQUFDLElBQUksY0FBYyxNQUFNLENBQUMsR0FBRyxNQUFNO0VBQzFDO0FBQ0YifQ==
// denoCacheMetadata=15176648841725269478,423632565053687414