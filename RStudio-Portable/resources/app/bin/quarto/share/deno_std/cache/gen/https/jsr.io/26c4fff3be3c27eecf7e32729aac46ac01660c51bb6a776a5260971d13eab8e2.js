// Ported and adapted from js-yaml-js-types v1.0.0:
// https://github.com/nodeca/js-yaml-js-types/tree/ac537e7bbdd3c2cbbd9882ca3919c520c2dc022b
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
export const undefinedType = {
  tag: "tag:yaml.org,2002:js/undefined",
  kind: "scalar",
  resolve () {
    return true;
  },
  construct () {
    return undefined;
  },
  predicate (object) {
    return typeof object === "undefined";
  },
  represent () {
    return "";
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8xLjAuNS9fdHlwZS91bmRlZmluZWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9ydGVkIGFuZCBhZGFwdGVkIGZyb20ganMteWFtbC1qcy10eXBlcyB2MS4wLjA6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwtanMtdHlwZXMvdHJlZS9hYzUzN2U3YmJkZDNjMmNiYmQ5ODgyY2EzOTE5YzUyMGMyZGMwMjJiXG4vLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHR5cGUgeyBUeXBlIH0gZnJvbSBcIi4uL190eXBlLnRzXCI7XG5cbmV4cG9ydCBjb25zdCB1bmRlZmluZWRUeXBlOiBUeXBlPFwic2NhbGFyXCIsIHVuZGVmaW5lZD4gPSB7XG4gIHRhZzogXCJ0YWc6eWFtbC5vcmcsMjAwMjpqcy91bmRlZmluZWRcIixcbiAga2luZDogXCJzY2FsYXJcIixcbiAgcmVzb2x2ZSgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgY29uc3RydWN0KCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0sXG4gIHByZWRpY2F0ZShvYmplY3QpIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gXCJ1bmRlZmluZWRcIjtcbiAgfSxcbiAgcmVwcmVzZW50KCkge1xuICAgIHJldHVybiBcIlwiO1xuICB9LFxufTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtREFBbUQ7QUFDbkQsMkZBQTJGO0FBQzNGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFJMUUsT0FBTyxNQUFNLGdCQUEyQztFQUN0RCxLQUFLO0VBQ0wsTUFBTTtFQUNOO0lBQ0UsT0FBTztFQUNUO0VBQ0E7SUFDRSxPQUFPO0VBQ1Q7RUFDQSxXQUFVLE1BQU07SUFDZCxPQUFPLE9BQU8sV0FBVztFQUMzQjtFQUNBO0lBQ0UsT0FBTztFQUNUO0FBQ0YsRUFBRSJ9
// denoCacheMetadata=4501021419213709404,5386865384210558205