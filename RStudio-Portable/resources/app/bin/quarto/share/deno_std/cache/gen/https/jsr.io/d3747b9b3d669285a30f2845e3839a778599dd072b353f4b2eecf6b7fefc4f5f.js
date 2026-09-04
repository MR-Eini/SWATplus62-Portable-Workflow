// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Filters the given array, removing all elements that do not match the given predicate
 * **in place. This means `array` will be modified!**.
 */ export function filterInPlace(array, predicate) {
  let outputIndex = 0;
  for (const cur of array){
    if (!predicate(cur)) {
      continue;
    }
    array[outputIndex] = cur;
    outputIndex += 1;
  }
  array.splice(outputIndex);
  return array;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMS4wLjYvX3V0aWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogRmlsdGVycyB0aGUgZ2l2ZW4gYXJyYXksIHJlbW92aW5nIGFsbCBlbGVtZW50cyB0aGF0IGRvIG5vdCBtYXRjaCB0aGUgZ2l2ZW4gcHJlZGljYXRlXG4gKiAqKmluIHBsYWNlLiBUaGlzIG1lYW5zIGBhcnJheWAgd2lsbCBiZSBtb2RpZmllZCEqKi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckluUGxhY2U8VD4oXG4gIGFycmF5OiBBcnJheTxUPixcbiAgcHJlZGljYXRlOiAoZWw6IFQpID0+IGJvb2xlYW4sXG4pOiBBcnJheTxUPiB7XG4gIGxldCBvdXRwdXRJbmRleCA9IDA7XG5cbiAgZm9yIChjb25zdCBjdXIgb2YgYXJyYXkpIHtcbiAgICBpZiAoIXByZWRpY2F0ZShjdXIpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBhcnJheVtvdXRwdXRJbmRleF0gPSBjdXI7XG4gICAgb3V0cHV0SW5kZXggKz0gMTtcbiAgfVxuXG4gIGFycmF5LnNwbGljZShvdXRwdXRJbmRleCk7XG5cbiAgcmV0dXJuIGFycmF5O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7OztDQUdDLEdBQ0QsT0FBTyxTQUFTLGNBQ2QsS0FBZSxFQUNmLFNBQTZCO0VBRTdCLElBQUksY0FBYztFQUVsQixLQUFLLE1BQU0sT0FBTyxNQUFPO0lBQ3ZCLElBQUksQ0FBQyxVQUFVLE1BQU07TUFDbkI7SUFDRjtJQUVBLEtBQUssQ0FBQyxZQUFZLEdBQUc7SUFDckIsZUFBZTtFQUNqQjtFQUVBLE1BQU0sTUFBTSxDQUFDO0VBRWIsT0FBTztBQUNUIn0=
// denoCacheMetadata=12567490981508724693,14513030580999504370