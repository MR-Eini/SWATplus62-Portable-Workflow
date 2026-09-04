// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Splits the given array into chunks of the given size and returns them.
 *
 * @template T Type of the elements in the input array.
 *
 * @param array The array to split into chunks.
 * @param size The size of the chunks. This my be a positive integer.
 *
 * @returns An array of chunks of the given size.
 *
 * @example Basic usage
 * ```ts
 * import { chunk } from "@std/collections/chunk";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const words = [
 *   "lorem",
 *   "ipsum",
 *   "dolor",
 *   "sit",
 *   "amet",
 *   "consetetur",
 *   "sadipscing",
 * ];
 * const chunks = chunk(words, 3);
 *
 * assertEquals(
 *   chunks,
 *   [
 *     ["lorem", "ipsum", "dolor"],
 *     ["sit", "amet", "consetetur"],
 *     ["sadipscing"],
 *   ],
 * );
 * ```
 */ export function chunk(array, size) {
  if (size <= 0 || !Number.isInteger(size)) {
    throw new RangeError(`Expected size to be an integer greater than 0 but found ${size}`);
  }
  const result = [];
  let index = 0;
  while(index < array.length){
    result.push(array.slice(index, index + size));
    index += size;
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9jaHVuay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFNwbGl0cyB0aGUgZ2l2ZW4gYXJyYXkgaW50byBjaHVua3Mgb2YgdGhlIGdpdmVuIHNpemUgYW5kIHJldHVybnMgdGhlbS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUeXBlIG9mIHRoZSBlbGVtZW50cyBpbiB0aGUgaW5wdXQgYXJyYXkuXG4gKlxuICogQHBhcmFtIGFycmF5IFRoZSBhcnJheSB0byBzcGxpdCBpbnRvIGNodW5rcy5cbiAqIEBwYXJhbSBzaXplIFRoZSBzaXplIG9mIHRoZSBjaHVua3MuIFRoaXMgbXkgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyLlxuICpcbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGNodW5rcyBvZiB0aGUgZ2l2ZW4gc2l6ZS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNodW5rIH0gZnJvbSBcIkBzdGQvY29sbGVjdGlvbnMvY2h1bmtcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3Qgd29yZHMgPSBbXG4gKiAgIFwibG9yZW1cIixcbiAqICAgXCJpcHN1bVwiLFxuICogICBcImRvbG9yXCIsXG4gKiAgIFwic2l0XCIsXG4gKiAgIFwiYW1ldFwiLFxuICogICBcImNvbnNldGV0dXJcIixcbiAqICAgXCJzYWRpcHNjaW5nXCIsXG4gKiBdO1xuICogY29uc3QgY2h1bmtzID0gY2h1bmsod29yZHMsIDMpO1xuICpcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgY2h1bmtzLFxuICogICBbXG4gKiAgICAgW1wibG9yZW1cIiwgXCJpcHN1bVwiLCBcImRvbG9yXCJdLFxuICogICAgIFtcInNpdFwiLCBcImFtZXRcIiwgXCJjb25zZXRldHVyXCJdLFxuICogICAgIFtcInNhZGlwc2NpbmdcIl0sXG4gKiAgIF0sXG4gKiApO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaHVuazxUPihhcnJheTogcmVhZG9ubHkgVFtdLCBzaXplOiBudW1iZXIpOiBUW11bXSB7XG4gIGlmIChzaXplIDw9IDAgfHwgIU51bWJlci5pc0ludGVnZXIoc2l6ZSkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcbiAgICAgIGBFeHBlY3RlZCBzaXplIHRvIGJlIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIDAgYnV0IGZvdW5kICR7c2l6ZX1gLFxuICAgICk7XG4gIH1cblxuICBjb25zdCByZXN1bHQ6IFRbXVtdID0gW107XG4gIGxldCBpbmRleCA9IDA7XG5cbiAgd2hpbGUgKGluZGV4IDwgYXJyYXkubGVuZ3RoKSB7XG4gICAgcmVzdWx0LnB1c2goYXJyYXkuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2l6ZSkpO1xuICAgIGluZGV4ICs9IHNpemU7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUNDLEdBQ0QsT0FBTyxTQUFTLE1BQVMsS0FBbUIsRUFBRSxJQUFZO0VBQ3hELElBQUksUUFBUSxLQUFLLENBQUMsT0FBTyxTQUFTLENBQUMsT0FBTztJQUN4QyxNQUFNLElBQUksV0FDUixDQUFDLHdEQUF3RCxFQUFFLE1BQU07RUFFckU7RUFFQSxNQUFNLFNBQWdCLEVBQUU7RUFDeEIsSUFBSSxRQUFRO0VBRVosTUFBTyxRQUFRLE1BQU0sTUFBTSxDQUFFO0lBQzNCLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLE9BQU8sUUFBUTtJQUN2QyxTQUFTO0VBQ1g7RUFFQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=9586315009171888058,6826949106343816753