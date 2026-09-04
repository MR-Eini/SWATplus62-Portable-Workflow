// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { globToRegExp as posixGlobToRegExp } from "./posix/glob_to_regexp.ts";
import { globToRegExp as windowsGlobToRegExp } from "./windows/glob_to_regexp.ts";
/** Convert a glob string to a regular expression.
 *
 * Tries to match bash glob expansion as closely as possible.
 *
 * Basic glob syntax:
 * - `*` - Matches everything without leaving the path segment.
 * - `?` - Matches any single character.
 * - `{foo,bar}` - Matches `foo` or `bar`.
 * - `[abcd]` - Matches `a`, `b`, `c` or `d`.
 * - `[a-d]` - Matches `a`, `b`, `c` or `d`.
 * - `[!abcd]` - Matches any single character besides `a`, `b`, `c` or `d`.
 * - `[[:<class>:]]` - Matches any character belonging to `<class>`.
 *     - `[[:alnum:]]` - Matches any digit or letter.
 *     - `[[:digit:]abc]` - Matches any digit, `a`, `b` or `c`.
 *     - See https://facelessuser.github.io/wcmatch/glob/#posix-character-classes
 *       for a complete list of supported character classes.
 * - `\` - Escapes the next character for an `os` other than `"windows"`.
 * - \` - Escapes the next character for `os` set to `"windows"`.
 * - `/` - Path separator.
 * - `\` - Additional path separator only for `os` set to `"windows"`.
 *
 * Extended syntax:
 * - Requires `{ extended: true }`.
 * - `?(foo|bar)` - Matches 0 or 1 instance of `{foo,bar}`.
 * - `@(foo|bar)` - Matches 1 instance of `{foo,bar}`. They behave the same.
 * - `*(foo|bar)` - Matches _n_ instances of `{foo,bar}`.
 * - `+(foo|bar)` - Matches _n > 0_ instances of `{foo,bar}`.
 * - `!(foo|bar)` - Matches anything other than `{foo,bar}`.
 * - See https://www.linuxjournal.com/content/bash-extended-globbing.
 *
 * Globstar syntax:
 * - Requires `{ globstar: true }`.
 * - `**` - Matches any number of any path segments.
 *     - Must comprise its entire path segment in the provided glob.
 * - See https://www.linuxjournal.com/content/globstar-new-bash-globbing-option.
 *
 * Note the following properties:
 * - The generated `RegExp` is anchored at both start and end.
 * - Repeating and trailing separators are tolerated. Trailing separators in the
 *   provided glob have no meaning and are discarded.
 * - Absolute globs will only match absolute paths, etc.
 * - Empty globs will match nothing.
 * - Any special glob syntax must be contained to one path segment. For example,
 *   `?(foo|bar/baz)` is invalid. The separator will take precedence and the
 *   first segment ends with an unclosed group.
 * - If a path segment ends with unclosed groups or a dangling escape prefix, a
 *   parse error has occurred. Every character for that segment is taken
 *   literally in this event.
 *
 * Limitations:
 * - A negative group like `!(foo|bar)` will wrongly be converted to a negative
 *   look-ahead followed by a wildcard. This means that `!(foo).js` will wrongly
 *   fail to match `foobar.js`, even though `foobar` is not `foo`. Effectively,
 *   `!(foo|bar)` is treated like `!(@(foo|bar)*)`. This will work correctly if
 *   the group occurs not nested at the end of the segment. */ export function globToRegExp(glob, options = {}) {
  return options.os === "windows" || !options.os && isWindows ? windowsGlobToRegExp(glob, options) : posixGlobToRegExp(glob, options);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL2dsb2JfdG9fcmVnZXhwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB0eXBlIHsgR2xvYk9wdGlvbnMgfSBmcm9tIFwiLi9fY29tbW9uL2dsb2JfdG9fcmVnX2V4cC50c1wiO1xuaW1wb3J0IHsgaXNXaW5kb3dzLCB0eXBlIE9TVHlwZSB9IGZyb20gXCIuL19vcy50c1wiO1xuXG5pbXBvcnQgeyBnbG9iVG9SZWdFeHAgYXMgcG9zaXhHbG9iVG9SZWdFeHAgfSBmcm9tIFwiLi9wb3NpeC9nbG9iX3RvX3JlZ2V4cC50c1wiO1xuaW1wb3J0IHtcbiAgZ2xvYlRvUmVnRXhwIGFzIHdpbmRvd3NHbG9iVG9SZWdFeHAsXG59IGZyb20gXCIuL3dpbmRvd3MvZ2xvYl90b19yZWdleHAudHNcIjtcblxuZXhwb3J0IHR5cGUgeyBHbG9iT3B0aW9ucyB9O1xuXG5leHBvcnQgdHlwZSBHbG9iVG9SZWdFeHBPcHRpb25zID0gR2xvYk9wdGlvbnMgJiB7XG4gIG9zPzogT1NUeXBlO1xufTtcblxuLyoqIENvbnZlcnQgYSBnbG9iIHN0cmluZyB0byBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAqXG4gKiBUcmllcyB0byBtYXRjaCBiYXNoIGdsb2IgZXhwYW5zaW9uIGFzIGNsb3NlbHkgYXMgcG9zc2libGUuXG4gKlxuICogQmFzaWMgZ2xvYiBzeW50YXg6XG4gKiAtIGAqYCAtIE1hdGNoZXMgZXZlcnl0aGluZyB3aXRob3V0IGxlYXZpbmcgdGhlIHBhdGggc2VnbWVudC5cbiAqIC0gYD9gIC0gTWF0Y2hlcyBhbnkgc2luZ2xlIGNoYXJhY3Rlci5cbiAqIC0gYHtmb28sYmFyfWAgLSBNYXRjaGVzIGBmb29gIG9yIGBiYXJgLlxuICogLSBgW2FiY2RdYCAtIE1hdGNoZXMgYGFgLCBgYmAsIGBjYCBvciBgZGAuXG4gKiAtIGBbYS1kXWAgLSBNYXRjaGVzIGBhYCwgYGJgLCBgY2Agb3IgYGRgLlxuICogLSBgWyFhYmNkXWAgLSBNYXRjaGVzIGFueSBzaW5nbGUgY2hhcmFjdGVyIGJlc2lkZXMgYGFgLCBgYmAsIGBjYCBvciBgZGAuXG4gKiAtIGBbWzo8Y2xhc3M+Ol1dYCAtIE1hdGNoZXMgYW55IGNoYXJhY3RlciBiZWxvbmdpbmcgdG8gYDxjbGFzcz5gLlxuICogICAgIC0gYFtbOmFsbnVtOl1dYCAtIE1hdGNoZXMgYW55IGRpZ2l0IG9yIGxldHRlci5cbiAqICAgICAtIGBbWzpkaWdpdDpdYWJjXWAgLSBNYXRjaGVzIGFueSBkaWdpdCwgYGFgLCBgYmAgb3IgYGNgLlxuICogICAgIC0gU2VlIGh0dHBzOi8vZmFjZWxlc3N1c2VyLmdpdGh1Yi5pby93Y21hdGNoL2dsb2IvI3Bvc2l4LWNoYXJhY3Rlci1jbGFzc2VzXG4gKiAgICAgICBmb3IgYSBjb21wbGV0ZSBsaXN0IG9mIHN1cHBvcnRlZCBjaGFyYWN0ZXIgY2xhc3Nlcy5cbiAqIC0gYFxcYCAtIEVzY2FwZXMgdGhlIG5leHQgY2hhcmFjdGVyIGZvciBhbiBgb3NgIG90aGVyIHRoYW4gYFwid2luZG93c1wiYC5cbiAqIC0gXFxgIC0gRXNjYXBlcyB0aGUgbmV4dCBjaGFyYWN0ZXIgZm9yIGBvc2Agc2V0IHRvIGBcIndpbmRvd3NcImAuXG4gKiAtIGAvYCAtIFBhdGggc2VwYXJhdG9yLlxuICogLSBgXFxgIC0gQWRkaXRpb25hbCBwYXRoIHNlcGFyYXRvciBvbmx5IGZvciBgb3NgIHNldCB0byBgXCJ3aW5kb3dzXCJgLlxuICpcbiAqIEV4dGVuZGVkIHN5bnRheDpcbiAqIC0gUmVxdWlyZXMgYHsgZXh0ZW5kZWQ6IHRydWUgfWAuXG4gKiAtIGA/KGZvb3xiYXIpYCAtIE1hdGNoZXMgMCBvciAxIGluc3RhbmNlIG9mIGB7Zm9vLGJhcn1gLlxuICogLSBgQChmb298YmFyKWAgLSBNYXRjaGVzIDEgaW5zdGFuY2Ugb2YgYHtmb28sYmFyfWAuIFRoZXkgYmVoYXZlIHRoZSBzYW1lLlxuICogLSBgKihmb298YmFyKWAgLSBNYXRjaGVzIF9uXyBpbnN0YW5jZXMgb2YgYHtmb28sYmFyfWAuXG4gKiAtIGArKGZvb3xiYXIpYCAtIE1hdGNoZXMgX24gPiAwXyBpbnN0YW5jZXMgb2YgYHtmb28sYmFyfWAuXG4gKiAtIGAhKGZvb3xiYXIpYCAtIE1hdGNoZXMgYW55dGhpbmcgb3RoZXIgdGhhbiBge2ZvbyxiYXJ9YC5cbiAqIC0gU2VlIGh0dHBzOi8vd3d3LmxpbnV4am91cm5hbC5jb20vY29udGVudC9iYXNoLWV4dGVuZGVkLWdsb2JiaW5nLlxuICpcbiAqIEdsb2JzdGFyIHN5bnRheDpcbiAqIC0gUmVxdWlyZXMgYHsgZ2xvYnN0YXI6IHRydWUgfWAuXG4gKiAtIGAqKmAgLSBNYXRjaGVzIGFueSBudW1iZXIgb2YgYW55IHBhdGggc2VnbWVudHMuXG4gKiAgICAgLSBNdXN0IGNvbXByaXNlIGl0cyBlbnRpcmUgcGF0aCBzZWdtZW50IGluIHRoZSBwcm92aWRlZCBnbG9iLlxuICogLSBTZWUgaHR0cHM6Ly93d3cubGludXhqb3VybmFsLmNvbS9jb250ZW50L2dsb2JzdGFyLW5ldy1iYXNoLWdsb2JiaW5nLW9wdGlvbi5cbiAqXG4gKiBOb3RlIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqIC0gVGhlIGdlbmVyYXRlZCBgUmVnRXhwYCBpcyBhbmNob3JlZCBhdCBib3RoIHN0YXJ0IGFuZCBlbmQuXG4gKiAtIFJlcGVhdGluZyBhbmQgdHJhaWxpbmcgc2VwYXJhdG9ycyBhcmUgdG9sZXJhdGVkLiBUcmFpbGluZyBzZXBhcmF0b3JzIGluIHRoZVxuICogICBwcm92aWRlZCBnbG9iIGhhdmUgbm8gbWVhbmluZyBhbmQgYXJlIGRpc2NhcmRlZC5cbiAqIC0gQWJzb2x1dGUgZ2xvYnMgd2lsbCBvbmx5IG1hdGNoIGFic29sdXRlIHBhdGhzLCBldGMuXG4gKiAtIEVtcHR5IGdsb2JzIHdpbGwgbWF0Y2ggbm90aGluZy5cbiAqIC0gQW55IHNwZWNpYWwgZ2xvYiBzeW50YXggbXVzdCBiZSBjb250YWluZWQgdG8gb25lIHBhdGggc2VnbWVudC4gRm9yIGV4YW1wbGUsXG4gKiAgIGA/KGZvb3xiYXIvYmF6KWAgaXMgaW52YWxpZC4gVGhlIHNlcGFyYXRvciB3aWxsIHRha2UgcHJlY2VkZW5jZSBhbmQgdGhlXG4gKiAgIGZpcnN0IHNlZ21lbnQgZW5kcyB3aXRoIGFuIHVuY2xvc2VkIGdyb3VwLlxuICogLSBJZiBhIHBhdGggc2VnbWVudCBlbmRzIHdpdGggdW5jbG9zZWQgZ3JvdXBzIG9yIGEgZGFuZ2xpbmcgZXNjYXBlIHByZWZpeCwgYVxuICogICBwYXJzZSBlcnJvciBoYXMgb2NjdXJyZWQuIEV2ZXJ5IGNoYXJhY3RlciBmb3IgdGhhdCBzZWdtZW50IGlzIHRha2VuXG4gKiAgIGxpdGVyYWxseSBpbiB0aGlzIGV2ZW50LlxuICpcbiAqIExpbWl0YXRpb25zOlxuICogLSBBIG5lZ2F0aXZlIGdyb3VwIGxpa2UgYCEoZm9vfGJhcilgIHdpbGwgd3JvbmdseSBiZSBjb252ZXJ0ZWQgdG8gYSBuZWdhdGl2ZVxuICogICBsb29rLWFoZWFkIGZvbGxvd2VkIGJ5IGEgd2lsZGNhcmQuIFRoaXMgbWVhbnMgdGhhdCBgIShmb28pLmpzYCB3aWxsIHdyb25nbHlcbiAqICAgZmFpbCB0byBtYXRjaCBgZm9vYmFyLmpzYCwgZXZlbiB0aG91Z2ggYGZvb2JhcmAgaXMgbm90IGBmb29gLiBFZmZlY3RpdmVseSxcbiAqICAgYCEoZm9vfGJhcilgIGlzIHRyZWF0ZWQgbGlrZSBgIShAKGZvb3xiYXIpKilgLiBUaGlzIHdpbGwgd29yayBjb3JyZWN0bHkgaWZcbiAqICAgdGhlIGdyb3VwIG9jY3VycyBub3QgbmVzdGVkIGF0IHRoZSBlbmQgb2YgdGhlIHNlZ21lbnQuICovXG5leHBvcnQgZnVuY3Rpb24gZ2xvYlRvUmVnRXhwKFxuICBnbG9iOiBzdHJpbmcsXG4gIG9wdGlvbnM6IEdsb2JUb1JlZ0V4cE9wdGlvbnMgPSB7fSxcbik6IFJlZ0V4cCB7XG4gIHJldHVybiBvcHRpb25zLm9zID09PSBcIndpbmRvd3NcIiB8fCAoIW9wdGlvbnMub3MgJiYgaXNXaW5kb3dzKVxuICAgID8gd2luZG93c0dsb2JUb1JlZ0V4cChnbG9iLCBvcHRpb25zKVxuICAgIDogcG9zaXhHbG9iVG9SZWdFeHAoZ2xvYiwgb3B0aW9ucyk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUdyQyxTQUFTLFNBQVMsUUFBcUIsV0FBVztBQUVsRCxTQUFTLGdCQUFnQixpQkFBaUIsUUFBUSw0QkFBNEI7QUFDOUUsU0FDRSxnQkFBZ0IsbUJBQW1CLFFBQzlCLDhCQUE4QjtBQVFyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzREQXNENEQsR0FDNUQsT0FBTyxTQUFTLGFBQ2QsSUFBWSxFQUNaLFVBQStCLENBQUMsQ0FBQztFQUVqQyxPQUFPLFFBQVEsRUFBRSxLQUFLLGFBQWMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxZQUMvQyxvQkFBb0IsTUFBTSxXQUMxQixrQkFBa0IsTUFBTTtBQUM5QiJ9
// denoCacheMetadata=3705059433019776310,2319280362514629814