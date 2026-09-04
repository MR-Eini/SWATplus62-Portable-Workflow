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
/**
 * Produces a random number between the inclusive `lower` and `upper` bounds.
 */ export function randomInteger(lower, upper) {
  return lower + Math.floor(Math.random() * (upper - lower + 1));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9fdXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBGaWx0ZXJzIHRoZSBnaXZlbiBhcnJheSwgcmVtb3ZpbmcgYWxsIGVsZW1lbnRzIHRoYXQgZG8gbm90IG1hdGNoIHRoZSBnaXZlbiBwcmVkaWNhdGVcbiAqICoqaW4gcGxhY2UuIFRoaXMgbWVhbnMgYGFycmF5YCB3aWxsIGJlIG1vZGlmaWVkISoqLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVySW5QbGFjZTxUPihcbiAgYXJyYXk6IEFycmF5PFQ+LFxuICBwcmVkaWNhdGU6IChlbDogVCkgPT4gYm9vbGVhbixcbik6IEFycmF5PFQ+IHtcbiAgbGV0IG91dHB1dEluZGV4ID0gMDtcblxuICBmb3IgKGNvbnN0IGN1ciBvZiBhcnJheSkge1xuICAgIGlmICghcHJlZGljYXRlKGN1cikpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGFycmF5W291dHB1dEluZGV4XSA9IGN1cjtcbiAgICBvdXRwdXRJbmRleCArPSAxO1xuICB9XG5cbiAgYXJyYXkuc3BsaWNlKG91dHB1dEluZGV4KTtcblxuICByZXR1cm4gYXJyYXk7XG59XG5cbi8qKlxuICogUHJvZHVjZXMgYSByYW5kb20gbnVtYmVyIGJldHdlZW4gdGhlIGluY2x1c2l2ZSBgbG93ZXJgIGFuZCBgdXBwZXJgIGJvdW5kcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbUludGVnZXIobG93ZXI6IG51bWJlciwgdXBwZXI6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBsb3dlciArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh1cHBlciAtIGxvd2VyICsgMSkpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7OztDQUdDLEdBQ0QsT0FBTyxTQUFTLGNBQ2QsS0FBZSxFQUNmLFNBQTZCO0VBRTdCLElBQUksY0FBYztFQUVsQixLQUFLLE1BQU0sT0FBTyxNQUFPO0lBQ3ZCLElBQUksQ0FBQyxVQUFVLE1BQU07TUFDbkI7SUFDRjtJQUVBLEtBQUssQ0FBQyxZQUFZLEdBQUc7SUFDckIsZUFBZTtFQUNqQjtFQUVBLE1BQU0sTUFBTSxDQUFDO0VBRWIsT0FBTztBQUNUO0FBRUE7O0NBRUMsR0FDRCxPQUFPLFNBQVMsY0FBYyxLQUFhLEVBQUUsS0FBYTtFQUN4RCxPQUFPLFFBQVEsS0FBSyxLQUFLLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQyxRQUFRLFFBQVEsQ0FBQztBQUM5RCJ9
// denoCacheMetadata=242346469302539510,15921080779781004408