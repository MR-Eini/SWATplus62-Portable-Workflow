// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Converts the byte array to a UUID string
 * @param bytes Used to convert Byte to Hex
 */ export function bytesToUuid(bytes) {
  const bits = [
    ...bytes
  ].map((bit)=>{
    const s = bit.toString(16);
    return bit < 0x10 ? "0" + s : s;
  });
  return [
    ...bits.slice(0, 4),
    "-",
    ...bits.slice(4, 6),
    "-",
    ...bits.slice(6, 8),
    "-",
    ...bits.slice(8, 10),
    "-",
    ...bits.slice(10, 16)
  ].join("");
}
/**
 * Converts a string to a byte array by converting the hex value to a number.
 * @param uuid Value that gets converted.
 */ export function uuidToBytes(uuid) {
  const bytes = [];
  uuid.replace(/[a-fA-F0-9]{2}/g, (hex)=>{
    bytes.push(parseInt(hex, 16));
    return "";
  });
  return bytes;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvdXVpZC8wLjIyNC4zL19jb21tb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgYnl0ZSBhcnJheSB0byBhIFVVSUQgc3RyaW5nXG4gKiBAcGFyYW0gYnl0ZXMgVXNlZCB0byBjb252ZXJ0IEJ5dGUgdG8gSGV4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvVXVpZChieXRlczogbnVtYmVyW10gfCBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgY29uc3QgYml0cyA9IFsuLi5ieXRlc10ubWFwKChiaXQpID0+IHtcbiAgICBjb25zdCBzID0gYml0LnRvU3RyaW5nKDE2KTtcbiAgICByZXR1cm4gYml0IDwgMHgxMCA/IFwiMFwiICsgcyA6IHM7XG4gIH0pO1xuICByZXR1cm4gW1xuICAgIC4uLmJpdHMuc2xpY2UoMCwgNCksXG4gICAgXCItXCIsXG4gICAgLi4uYml0cy5zbGljZSg0LCA2KSxcbiAgICBcIi1cIixcbiAgICAuLi5iaXRzLnNsaWNlKDYsIDgpLFxuICAgIFwiLVwiLFxuICAgIC4uLmJpdHMuc2xpY2UoOCwgMTApLFxuICAgIFwiLVwiLFxuICAgIC4uLmJpdHMuc2xpY2UoMTAsIDE2KSxcbiAgXS5qb2luKFwiXCIpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgc3RyaW5nIHRvIGEgYnl0ZSBhcnJheSBieSBjb252ZXJ0aW5nIHRoZSBoZXggdmFsdWUgdG8gYSBudW1iZXIuXG4gKiBAcGFyYW0gdXVpZCBWYWx1ZSB0aGF0IGdldHMgY29udmVydGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXVpZFRvQnl0ZXModXVpZDogc3RyaW5nKTogbnVtYmVyW10ge1xuICBjb25zdCBieXRlczogbnVtYmVyW10gPSBbXTtcblxuICB1dWlkLnJlcGxhY2UoL1thLWZBLUYwLTldezJ9L2csIChoZXg6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgYnl0ZXMucHVzaChwYXJzZUludChoZXgsIDE2KSk7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH0pO1xuXG4gIHJldHVybiBieXRlcztcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Q0FHQyxHQUNELE9BQU8sU0FBUyxZQUFZLEtBQTRCO0VBQ3RELE1BQU0sT0FBTztPQUFJO0dBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQixNQUFNLElBQUksSUFBSSxRQUFRLENBQUM7SUFDdkIsT0FBTyxNQUFNLE9BQU8sTUFBTSxJQUFJO0VBQ2hDO0VBQ0EsT0FBTztPQUNGLEtBQUssS0FBSyxDQUFDLEdBQUc7SUFDakI7T0FDRyxLQUFLLEtBQUssQ0FBQyxHQUFHO0lBQ2pCO09BQ0csS0FBSyxLQUFLLENBQUMsR0FBRztJQUNqQjtPQUNHLEtBQUssS0FBSyxDQUFDLEdBQUc7SUFDakI7T0FDRyxLQUFLLEtBQUssQ0FBQyxJQUFJO0dBQ25CLENBQUMsSUFBSSxDQUFDO0FBQ1Q7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLFNBQVMsWUFBWSxJQUFZO0VBQ3RDLE1BQU0sUUFBa0IsRUFBRTtFQUUxQixLQUFLLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQztJQUMvQixNQUFNLElBQUksQ0FBQyxTQUFTLEtBQUs7SUFDekIsT0FBTztFQUNUO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=11644412371547174006,14331066846359016875