// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { DEFAULT_BUFFER_SIZE } from "./_constants.ts";
import { writeAll } from "./write_all.ts";
/**
 * Copies from `src` to `dst` until either EOF (`null`) is read from `src` or
 * an error occurs. It resolves to the number of bytes copied or rejects with
 * the first error encountered while copying.
 *
 * @example Usage
 * ```ts no-eval
 * import { copy } from "@std/io/copy";
 *
 * const source = await Deno.open("my_file.txt");
 * const bytesCopied1 = await copy(source, Deno.stdout);
 * const destination = await Deno.create("my_file_2.txt");
 * const bytesCopied2 = await copy(source, destination);
 * ```
 *
 * @param src The source to copy from
 * @param dst The destination to copy to
 * @param options Can be used to tune size of the buffer. Default size is 32kB
 * @returns Number of bytes copied
 */ export async function copy(src, dst, options) {
  let n = 0;
  const b = new Uint8Array(options?.bufSize ?? DEFAULT_BUFFER_SIZE);
  while(true){
    const result = await src.read(b);
    if (result === null) break;
    await writeAll(dst, b.subarray(0, result));
    n += result;
  }
  return n;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW8vMC4yMjQuOC9jb3B5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IERFRkFVTFRfQlVGRkVSX1NJWkUgfSBmcm9tIFwiLi9fY29uc3RhbnRzLnRzXCI7XG5pbXBvcnQgeyB3cml0ZUFsbCB9IGZyb20gXCIuL3dyaXRlX2FsbC50c1wiO1xuaW1wb3J0IHR5cGUgeyBSZWFkZXIsIFdyaXRlciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5cbi8qKlxuICogQ29waWVzIGZyb20gYHNyY2AgdG8gYGRzdGAgdW50aWwgZWl0aGVyIEVPRiAoYG51bGxgKSBpcyByZWFkIGZyb20gYHNyY2Agb3JcbiAqIGFuIGVycm9yIG9jY3Vycy4gSXQgcmVzb2x2ZXMgdG8gdGhlIG51bWJlciBvZiBieXRlcyBjb3BpZWQgb3IgcmVqZWN0cyB3aXRoXG4gKiB0aGUgZmlyc3QgZXJyb3IgZW5jb3VudGVyZWQgd2hpbGUgY29weWluZy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgY29weSB9IGZyb20gXCJAc3RkL2lvL2NvcHlcIjtcbiAqXG4gKiBjb25zdCBzb3VyY2UgPSBhd2FpdCBEZW5vLm9wZW4oXCJteV9maWxlLnR4dFwiKTtcbiAqIGNvbnN0IGJ5dGVzQ29waWVkMSA9IGF3YWl0IGNvcHkoc291cmNlLCBEZW5vLnN0ZG91dCk7XG4gKiBjb25zdCBkZXN0aW5hdGlvbiA9IGF3YWl0IERlbm8uY3JlYXRlKFwibXlfZmlsZV8yLnR4dFwiKTtcbiAqIGNvbnN0IGJ5dGVzQ29waWVkMiA9IGF3YWl0IGNvcHkoc291cmNlLCBkZXN0aW5hdGlvbik7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3JjIFRoZSBzb3VyY2UgdG8gY29weSBmcm9tXG4gKiBAcGFyYW0gZHN0IFRoZSBkZXN0aW5hdGlvbiB0byBjb3B5IHRvXG4gKiBAcGFyYW0gb3B0aW9ucyBDYW4gYmUgdXNlZCB0byB0dW5lIHNpemUgb2YgdGhlIGJ1ZmZlci4gRGVmYXVsdCBzaXplIGlzIDMya0JcbiAqIEByZXR1cm5zIE51bWJlciBvZiBieXRlcyBjb3BpZWRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvcHkoXG4gIHNyYzogUmVhZGVyLFxuICBkc3Q6IFdyaXRlcixcbiAgb3B0aW9ucz86IHtcbiAgICBidWZTaXplPzogbnVtYmVyO1xuICB9LFxuKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgbGV0IG4gPSAwO1xuICBjb25zdCBiID0gbmV3IFVpbnQ4QXJyYXkob3B0aW9ucz8uYnVmU2l6ZSA/PyBERUZBVUxUX0JVRkZFUl9TSVpFKTtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzcmMucmVhZChiKTtcbiAgICBpZiAocmVzdWx0ID09PSBudWxsKSBicmVhaztcbiAgICBhd2FpdCB3cml0ZUFsbChkc3QsIGIuc3ViYXJyYXkoMCwgcmVzdWx0KSk7XG4gICAgbiArPSByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIG47XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLG1CQUFtQixRQUFRLGtCQUFrQjtBQUN0RCxTQUFTLFFBQVEsUUFBUSxpQkFBaUI7QUFHMUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQkMsR0FDRCxPQUFPLGVBQWUsS0FDcEIsR0FBVyxFQUNYLEdBQVcsRUFDWCxPQUVDO0VBRUQsSUFBSSxJQUFJO0VBQ1IsTUFBTSxJQUFJLElBQUksV0FBVyxTQUFTLFdBQVc7RUFDN0MsTUFBTyxLQUFNO0lBQ1gsTUFBTSxTQUFTLE1BQU0sSUFBSSxJQUFJLENBQUM7SUFDOUIsSUFBSSxXQUFXLE1BQU07SUFDckIsTUFBTSxTQUFTLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRztJQUNsQyxLQUFLO0VBQ1A7RUFDQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=13069467564968613238,4083739806216280475