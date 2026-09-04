// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
const NEWLINE_REGEXP = /\r\n|\r|\n/;
const encoder = new TextEncoder();
function assertHasNoNewline(value, varName) {
  if (value.match(NEWLINE_REGEXP) !== null) {
    throw new RangeError(`${varName} cannot contain a newline`);
  }
}
/**
 * Converts a server-sent message object into a string for the client.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format}
 */ function stringify(message) {
  const lines = [];
  if (message.comment) {
    assertHasNoNewline(message.comment, "`message.comment`");
    lines.push(`:${message.comment}`);
  }
  if (message.event) {
    assertHasNoNewline(message.event, "`message.event`");
    lines.push(`event:${message.event}`);
  }
  if (message.data) {
    message.data.split(NEWLINE_REGEXP).forEach((line)=>lines.push(`data:${line}`));
  }
  if (message.id) {
    assertHasNoNewline(message.id.toString(), "`message.id`");
    lines.push(`id:${message.id}`);
  }
  if (message.retry) lines.push(`retry:${message.retry}`);
  return encoder.encode(lines.join("\n") + "\n\n");
}
/**
 * Transforms server-sent message objects into strings for the client.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events}
 *
 * @example Usage
 * ```ts no-assert
 * import {
 *   type ServerSentEventMessage,
 *   ServerSentEventStream,
 * } from "@std/http/server-sent-event-stream";
 *
 * const stream = ReadableStream.from<ServerSentEventMessage>([
 *   { data: "hello there" }
 * ]).pipeThrough(new ServerSentEventStream());
 * new Response(stream, {
 *   headers: {
 *     "content-type": "text/event-stream",
 *     "cache-control": "no-cache",
 *   },
 * });
 * ```
 */ export class ServerSentEventStream extends TransformStream {
  constructor(){
    super({
      transform: (message, controller)=>{
        controller.enqueue(stringify(message));
      }
    });
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaHR0cC8wLjIyNC41L3NlcnZlcl9zZW50X2V2ZW50X3N0cmVhbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5jb25zdCBORVdMSU5FX1JFR0VYUCA9IC9cXHJcXG58XFxyfFxcbi87XG5jb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIG1lc3NhZ2UgaW4gdGhlIFNlcnZlci1TZW50IEV2ZW50IChTU0UpIHByb3RvY29sLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9TZXJ2ZXItc2VudF9ldmVudHMvVXNpbmdfc2VydmVyLXNlbnRfZXZlbnRzI2ZpZWxkc31cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZXJTZW50RXZlbnRNZXNzYWdlIHtcbiAgLyoqIElnbm9yZWQgYnkgdGhlIGNsaWVudC4gKi9cbiAgY29tbWVudD86IHN0cmluZztcbiAgLyoqIEEgc3RyaW5nIGlkZW50aWZ5aW5nIHRoZSB0eXBlIG9mIGV2ZW50IGRlc2NyaWJlZC4gKi9cbiAgZXZlbnQ/OiBzdHJpbmc7XG4gIC8qKiBUaGUgZGF0YSBmaWVsZCBmb3IgdGhlIG1lc3NhZ2UuIFNwbGl0IGJ5IG5ldyBsaW5lcy4gKi9cbiAgZGF0YT86IHN0cmluZztcbiAgLyoqIFRoZSBldmVudCBJRCB0byBzZXQgdGhlIHtAbGlua2NvZGUgRXZlbnRTb3VyY2V9IG9iamVjdCdzIGxhc3QgZXZlbnQgSUQgdmFsdWUuICovXG4gIGlkPzogc3RyaW5nIHwgbnVtYmVyO1xuICAvKiogVGhlIHJlY29ubmVjdGlvbiB0aW1lLiAqL1xuICByZXRyeT86IG51bWJlcjtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0SGFzTm9OZXdsaW5lKHZhbHVlOiBzdHJpbmcsIHZhck5hbWU6IHN0cmluZykge1xuICBpZiAodmFsdWUubWF0Y2goTkVXTElORV9SRUdFWFApICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYCR7dmFyTmFtZX0gY2Fubm90IGNvbnRhaW4gYSBuZXdsaW5lYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIHNlcnZlci1zZW50IG1lc3NhZ2Ugb2JqZWN0IGludG8gYSBzdHJpbmcgZm9yIHRoZSBjbGllbnQuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1NlcnZlci1zZW50X2V2ZW50cy9Vc2luZ19zZXJ2ZXItc2VudF9ldmVudHMjZXZlbnRfc3RyZWFtX2Zvcm1hdH1cbiAqL1xuZnVuY3Rpb24gc3RyaW5naWZ5KG1lc3NhZ2U6IFNlcnZlclNlbnRFdmVudE1lc3NhZ2UpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgbGluZXMgPSBbXTtcbiAgaWYgKG1lc3NhZ2UuY29tbWVudCkge1xuICAgIGFzc2VydEhhc05vTmV3bGluZShtZXNzYWdlLmNvbW1lbnQsIFwiYG1lc3NhZ2UuY29tbWVudGBcIik7XG4gICAgbGluZXMucHVzaChgOiR7bWVzc2FnZS5jb21tZW50fWApO1xuICB9XG4gIGlmIChtZXNzYWdlLmV2ZW50KSB7XG4gICAgYXNzZXJ0SGFzTm9OZXdsaW5lKG1lc3NhZ2UuZXZlbnQsIFwiYG1lc3NhZ2UuZXZlbnRgXCIpO1xuICAgIGxpbmVzLnB1c2goYGV2ZW50OiR7bWVzc2FnZS5ldmVudH1gKTtcbiAgfVxuICBpZiAobWVzc2FnZS5kYXRhKSB7XG4gICAgbWVzc2FnZS5kYXRhLnNwbGl0KE5FV0xJTkVfUkVHRVhQKS5mb3JFYWNoKChsaW5lKSA9PlxuICAgICAgbGluZXMucHVzaChgZGF0YToke2xpbmV9YClcbiAgICApO1xuICB9XG4gIGlmIChtZXNzYWdlLmlkKSB7XG4gICAgYXNzZXJ0SGFzTm9OZXdsaW5lKG1lc3NhZ2UuaWQudG9TdHJpbmcoKSwgXCJgbWVzc2FnZS5pZGBcIik7XG4gICAgbGluZXMucHVzaChgaWQ6JHttZXNzYWdlLmlkfWApO1xuICB9XG4gIGlmIChtZXNzYWdlLnJldHJ5KSBsaW5lcy5wdXNoKGByZXRyeToke21lc3NhZ2UucmV0cnl9YCk7XG4gIHJldHVybiBlbmNvZGVyLmVuY29kZShsaW5lcy5qb2luKFwiXFxuXCIpICsgXCJcXG5cXG5cIik7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyBzZXJ2ZXItc2VudCBtZXNzYWdlIG9iamVjdHMgaW50byBzdHJpbmdzIGZvciB0aGUgY2xpZW50LlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9TZXJ2ZXItc2VudF9ldmVudHMvVXNpbmdfc2VydmVyLXNlbnRfZXZlbnRzfVxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBuby1hc3NlcnRcbiAqIGltcG9ydCB7XG4gKiAgIHR5cGUgU2VydmVyU2VudEV2ZW50TWVzc2FnZSxcbiAqICAgU2VydmVyU2VudEV2ZW50U3RyZWFtLFxuICogfSBmcm9tIFwiQHN0ZC9odHRwL3NlcnZlci1zZW50LWV2ZW50LXN0cmVhbVwiO1xuICpcbiAqIGNvbnN0IHN0cmVhbSA9IFJlYWRhYmxlU3RyZWFtLmZyb208U2VydmVyU2VudEV2ZW50TWVzc2FnZT4oW1xuICogICB7IGRhdGE6IFwiaGVsbG8gdGhlcmVcIiB9XG4gKiBdKS5waXBlVGhyb3VnaChuZXcgU2VydmVyU2VudEV2ZW50U3RyZWFtKCkpO1xuICogbmV3IFJlc3BvbnNlKHN0cmVhbSwge1xuICogICBoZWFkZXJzOiB7XG4gKiAgICAgXCJjb250ZW50LXR5cGVcIjogXCJ0ZXh0L2V2ZW50LXN0cmVhbVwiLFxuICogICAgIFwiY2FjaGUtY29udHJvbFwiOiBcIm5vLWNhY2hlXCIsXG4gKiAgIH0sXG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgU2VydmVyU2VudEV2ZW50U3RyZWFtXG4gIGV4dGVuZHMgVHJhbnNmb3JtU3RyZWFtPFNlcnZlclNlbnRFdmVudE1lc3NhZ2UsIFVpbnQ4QXJyYXk+IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoe1xuICAgICAgdHJhbnNmb3JtOiAobWVzc2FnZSwgY29udHJvbGxlcikgPT4ge1xuICAgICAgICBjb250cm9sbGVyLmVucXVldWUoc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLE1BQU0saUJBQWlCO0FBQ3ZCLE1BQU0sVUFBVSxJQUFJO0FBb0JwQixTQUFTLG1CQUFtQixLQUFhLEVBQUUsT0FBZTtFQUN4RCxJQUFJLE1BQU0sS0FBSyxDQUFDLG9CQUFvQixNQUFNO0lBQ3hDLE1BQU0sSUFBSSxXQUFXLEdBQUcsUUFBUSx5QkFBeUIsQ0FBQztFQUM1RDtBQUNGO0FBRUE7Ozs7Q0FJQyxHQUNELFNBQVMsVUFBVSxPQUErQjtFQUNoRCxNQUFNLFFBQVEsRUFBRTtFQUNoQixJQUFJLFFBQVEsT0FBTyxFQUFFO0lBQ25CLG1CQUFtQixRQUFRLE9BQU8sRUFBRTtJQUNwQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLE9BQU8sRUFBRTtFQUNsQztFQUNBLElBQUksUUFBUSxLQUFLLEVBQUU7SUFDakIsbUJBQW1CLFFBQVEsS0FBSyxFQUFFO0lBQ2xDLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsS0FBSyxFQUFFO0VBQ3JDO0VBQ0EsSUFBSSxRQUFRLElBQUksRUFBRTtJQUNoQixRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLE9BQU8sQ0FBQyxDQUFDLE9BQzFDLE1BQU0sSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU07RUFFN0I7RUFDQSxJQUFJLFFBQVEsRUFBRSxFQUFFO0lBQ2QsbUJBQW1CLFFBQVEsRUFBRSxDQUFDLFFBQVEsSUFBSTtJQUMxQyxNQUFNLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRTtFQUMvQjtFQUNBLElBQUksUUFBUSxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxLQUFLLEVBQUU7RUFDdEQsT0FBTyxRQUFRLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRO0FBQzNDO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FzQkMsR0FDRCxPQUFPLE1BQU0sOEJBQ0g7RUFDUixhQUFjO0lBQ1osS0FBSyxDQUFDO01BQ0osV0FBVyxDQUFDLFNBQVM7UUFDbkIsV0FBVyxPQUFPLENBQUMsVUFBVTtNQUMvQjtJQUNGO0VBQ0Y7QUFDRiJ9
// denoCacheMetadata=1058665710405031388,16019565161652456257