// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assert } from "jsr:/@std/assert@^0.224.0/assert";
/**
 * When checking the values of cryptographic hashes are equal, default
 * comparisons can be susceptible to timing based attacks, where attacker is
 * able to find out information about the host system by repeatedly checking
 * response times to equality comparisons of values.
 *
 * It is likely some form of timing safe equality will make its way to the
 * WebCrypto standard (see:
 * {@link https://github.com/w3c/webcrypto/issues/270 | w3c/webcrypto#270}), but until
 * that time, `timingSafeEqual()` is provided:
 *
 * ```ts
 * import { timingSafeEqual } from "@std/crypto/timing-safe-equal";
 * import { assert } from "@std/assert/assert";
 *
 * const a = await crypto.subtle.digest(
 *   "SHA-384",
 *   new TextEncoder().encode("hello world"),
 * );
 * const b = await crypto.subtle.digest(
 *   "SHA-384",
 *   new TextEncoder().encode("hello world"),
 * );
 *
 * assert(timingSafeEqual(a, b));
 * ```
 */ export function timingSafeEqual(a, b) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  if (!(a instanceof DataView)) {
    a = ArrayBuffer.isView(a) ? new DataView(a.buffer, a.byteOffset, a.byteLength) : new DataView(a);
  }
  if (!(b instanceof DataView)) {
    b = ArrayBuffer.isView(b) ? new DataView(b.buffer, b.byteOffset, b.byteLength) : new DataView(b);
  }
  assert(a instanceof DataView);
  assert(b instanceof DataView);
  const length = a.byteLength;
  let out = 0;
  let i = -1;
  while(++i < length){
    out |= a.getUint8(i) ^ b.getUint8(i);
  }
  return out === 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY3J5cHRvLzAuMjI0LjAvdGltaW5nX3NhZmVfZXF1YWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcImpzcjovQHN0ZC9hc3NlcnRAXjAuMjI0LjAvYXNzZXJ0XCI7XG5cbi8qKlxuICogV2hlbiBjaGVja2luZyB0aGUgdmFsdWVzIG9mIGNyeXB0b2dyYXBoaWMgaGFzaGVzIGFyZSBlcXVhbCwgZGVmYXVsdFxuICogY29tcGFyaXNvbnMgY2FuIGJlIHN1c2NlcHRpYmxlIHRvIHRpbWluZyBiYXNlZCBhdHRhY2tzLCB3aGVyZSBhdHRhY2tlciBpc1xuICogYWJsZSB0byBmaW5kIG91dCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgaG9zdCBzeXN0ZW0gYnkgcmVwZWF0ZWRseSBjaGVja2luZ1xuICogcmVzcG9uc2UgdGltZXMgdG8gZXF1YWxpdHkgY29tcGFyaXNvbnMgb2YgdmFsdWVzLlxuICpcbiAqIEl0IGlzIGxpa2VseSBzb21lIGZvcm0gb2YgdGltaW5nIHNhZmUgZXF1YWxpdHkgd2lsbCBtYWtlIGl0cyB3YXkgdG8gdGhlXG4gKiBXZWJDcnlwdG8gc3RhbmRhcmQgKHNlZTpcbiAqIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vdzNjL3dlYmNyeXB0by9pc3N1ZXMvMjcwIHwgdzNjL3dlYmNyeXB0byMyNzB9KSwgYnV0IHVudGlsXG4gKiB0aGF0IHRpbWUsIGB0aW1pbmdTYWZlRXF1YWwoKWAgaXMgcHJvdmlkZWQ6XG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHRpbWluZ1NhZmVFcXVhbCB9IGZyb20gXCJAc3RkL2NyeXB0by90aW1pbmctc2FmZS1lcXVhbFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIkBzdGQvYXNzZXJ0L2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IGEgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdChcbiAqICAgXCJTSEEtMzg0XCIsXG4gKiAgIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImhlbGxvIHdvcmxkXCIpLFxuICogKTtcbiAqIGNvbnN0IGIgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdChcbiAqICAgXCJTSEEtMzg0XCIsXG4gKiAgIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImhlbGxvIHdvcmxkXCIpLFxuICogKTtcbiAqXG4gKiBhc3NlcnQodGltaW5nU2FmZUVxdWFsKGEsIGIpKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdGltaW5nU2FmZUVxdWFsKFxuICBhOiBBcnJheUJ1ZmZlclZpZXcgfCBBcnJheUJ1ZmZlckxpa2UgfCBEYXRhVmlldyxcbiAgYjogQXJyYXlCdWZmZXJWaWV3IHwgQXJyYXlCdWZmZXJMaWtlIHwgRGF0YVZpZXcsXG4pOiBib29sZWFuIHtcbiAgaWYgKGEuYnl0ZUxlbmd0aCAhPT0gYi5ieXRlTGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICghKGEgaW5zdGFuY2VvZiBEYXRhVmlldykpIHtcbiAgICBhID0gQXJyYXlCdWZmZXIuaXNWaWV3KGEpXG4gICAgICA/IG5ldyBEYXRhVmlldyhhLmJ1ZmZlciwgYS5ieXRlT2Zmc2V0LCBhLmJ5dGVMZW5ndGgpXG4gICAgICA6IG5ldyBEYXRhVmlldyhhKTtcbiAgfVxuICBpZiAoIShiIGluc3RhbmNlb2YgRGF0YVZpZXcpKSB7XG4gICAgYiA9IEFycmF5QnVmZmVyLmlzVmlldyhiKVxuICAgICAgPyBuZXcgRGF0YVZpZXcoYi5idWZmZXIsIGIuYnl0ZU9mZnNldCwgYi5ieXRlTGVuZ3RoKVxuICAgICAgOiBuZXcgRGF0YVZpZXcoYik7XG4gIH1cbiAgYXNzZXJ0KGEgaW5zdGFuY2VvZiBEYXRhVmlldyk7XG4gIGFzc2VydChiIGluc3RhbmNlb2YgRGF0YVZpZXcpO1xuICBjb25zdCBsZW5ndGggPSBhLmJ5dGVMZW5ndGg7XG4gIGxldCBvdXQgPSAwO1xuICBsZXQgaSA9IC0xO1xuICB3aGlsZSAoKytpIDwgbGVuZ3RoKSB7XG4gICAgb3V0IHw9IGEuZ2V0VWludDgoaSkgXiBiLmdldFVpbnQ4KGkpO1xuICB9XG4gIHJldHVybiBvdXQgPT09IDA7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLE1BQU0sUUFBUSxtQ0FBbUM7QUFFMUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMEJDLEdBQ0QsT0FBTyxTQUFTLGdCQUNkLENBQStDLEVBQy9DLENBQStDO0VBRS9DLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxVQUFVLEVBQUU7SUFDakMsT0FBTztFQUNUO0VBQ0EsSUFBSSxDQUFDLENBQUMsYUFBYSxRQUFRLEdBQUc7SUFDNUIsSUFBSSxZQUFZLE1BQU0sQ0FBQyxLQUNuQixJQUFJLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxVQUFVLElBQ2pELElBQUksU0FBUztFQUNuQjtFQUNBLElBQUksQ0FBQyxDQUFDLGFBQWEsUUFBUSxHQUFHO0lBQzVCLElBQUksWUFBWSxNQUFNLENBQUMsS0FDbkIsSUFBSSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsVUFBVSxJQUNqRCxJQUFJLFNBQVM7RUFDbkI7RUFDQSxPQUFPLGFBQWE7RUFDcEIsT0FBTyxhQUFhO0VBQ3BCLE1BQU0sU0FBUyxFQUFFLFVBQVU7RUFDM0IsSUFBSSxNQUFNO0VBQ1YsSUFBSSxJQUFJLENBQUM7RUFDVCxNQUFPLEVBQUUsSUFBSSxPQUFRO0lBQ25CLE9BQU8sRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQztFQUNwQztFQUNBLE9BQU8sUUFBUTtBQUNqQiJ9
// denoCacheMetadata=171646498753923809,12114406915840803131