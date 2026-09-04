// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
const encoder = new TextEncoder();
function getTypeName(value) {
  const type = typeof value;
  if (type !== "object") {
    return type;
  } else if (value === null) {
    return "null";
  } else {
    return value?.constructor?.name ?? "object";
  }
}
export function validateBinaryLike(source) {
  if (typeof source === "string") {
    return encoder.encode(source);
  } else if (source instanceof Uint8Array) {
    return source;
  } else if (source instanceof ArrayBuffer) {
    return new Uint8Array(source);
  }
  throw new TypeError(`The input must be a Uint8Array, a string, or an ArrayBuffer. Received a value of the type ${getTypeName(source)}.`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZW5jb2RpbmcvMS4wLjAtcmMuMi9fdmFsaWRhdGVfYmluYXJ5X2xpa2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuXG5mdW5jdGlvbiBnZXRUeXBlTmFtZSh2YWx1ZTogdW5rbm93bik6IHN0cmluZyB7XG4gIGNvbnN0IHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIGlmICh0eXBlICE9PSBcIm9iamVjdFwiKSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH0gZWxzZSBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gXCJudWxsXCI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbHVlPy5jb25zdHJ1Y3Rvcj8ubmFtZSA/PyBcIm9iamVjdFwiO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUJpbmFyeUxpa2Uoc291cmNlOiB1bmtub3duKTogVWludDhBcnJheSB7XG4gIGlmICh0eXBlb2Ygc291cmNlID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIGVuY29kZXIuZW5jb2RlKHNvdXJjZSk7XG4gIH0gZWxzZSBpZiAoc291cmNlIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgIHJldHVybiBzb3VyY2U7XG4gIH0gZWxzZSBpZiAoc291cmNlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoc291cmNlKTtcbiAgfVxuICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgIGBUaGUgaW5wdXQgbXVzdCBiZSBhIFVpbnQ4QXJyYXksIGEgc3RyaW5nLCBvciBhbiBBcnJheUJ1ZmZlci4gUmVjZWl2ZWQgYSB2YWx1ZSBvZiB0aGUgdHlwZSAke1xuICAgICAgZ2V0VHlwZU5hbWUoc291cmNlKVxuICAgIH0uYCxcbiAgKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUUsTUFBTSxVQUFVLElBQUk7QUFFcEIsU0FBUyxZQUFZLEtBQWM7RUFDakMsTUFBTSxPQUFPLE9BQU87RUFDcEIsSUFBSSxTQUFTLFVBQVU7SUFDckIsT0FBTztFQUNULE9BQU8sSUFBSSxVQUFVLE1BQU07SUFDekIsT0FBTztFQUNULE9BQU87SUFDTCxPQUFPLE9BQU8sYUFBYSxRQUFRO0VBQ3JDO0FBQ0Y7QUFFQSxPQUFPLFNBQVMsbUJBQW1CLE1BQWU7RUFDaEQsSUFBSSxPQUFPLFdBQVcsVUFBVTtJQUM5QixPQUFPLFFBQVEsTUFBTSxDQUFDO0VBQ3hCLE9BQU8sSUFBSSxrQkFBa0IsWUFBWTtJQUN2QyxPQUFPO0VBQ1QsT0FBTyxJQUFJLGtCQUFrQixhQUFhO0lBQ3hDLE9BQU8sSUFBSSxXQUFXO0VBQ3hCO0VBQ0EsTUFBTSxJQUFJLFVBQ1IsQ0FBQywwRkFBMEYsRUFDekYsWUFBWSxRQUNiLENBQUMsQ0FBQztBQUVQIn0=
// denoCacheMetadata=10157319510128118722,9151625817579453770