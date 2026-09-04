// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Helpers for working with the filesystem.
 *
 * ```ts
 * import { ensureFile, copy, ensureDir, move } from "@std/fs";
 *
 * await ensureFile("example.txt");
 * await copy("example.txt", "example_copy.txt");
 * await ensureDir("subdir");
 * await move("example_copy.txt", "subdir/example_copy.txt");
 * ```
 *
 * @module
 */ export * from "./empty_dir.ts";
export * from "./ensure_dir.ts";
export * from "./ensure_file.ts";
export * from "./ensure_link.ts";
export * from "./ensure_symlink.ts";
export * from "./exists.ts";
export * from "./expand_glob.ts";
export * from "./move.ts";
export * from "./copy.ts";
export * from "./walk.ts";
export * from "./eol.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuLyoqXG4gKiBIZWxwZXJzIGZvciB3b3JraW5nIHdpdGggdGhlIGZpbGVzeXN0ZW0uXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVuc3VyZUZpbGUsIGNvcHksIGVuc3VyZURpciwgbW92ZSB9IGZyb20gXCJAc3RkL2ZzXCI7XG4gKlxuICogYXdhaXQgZW5zdXJlRmlsZShcImV4YW1wbGUudHh0XCIpO1xuICogYXdhaXQgY29weShcImV4YW1wbGUudHh0XCIsIFwiZXhhbXBsZV9jb3B5LnR4dFwiKTtcbiAqIGF3YWl0IGVuc3VyZURpcihcInN1YmRpclwiKTtcbiAqIGF3YWl0IG1vdmUoXCJleGFtcGxlX2NvcHkudHh0XCIsIFwic3ViZGlyL2V4YW1wbGVfY29weS50eHRcIik7XG4gKiBgYGBcbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuZXhwb3J0ICogZnJvbSBcIi4vZW1wdHlfZGlyLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9lbnN1cmVfZGlyLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9lbnN1cmVfZmlsZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZW5zdXJlX2xpbmsudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2Vuc3VyZV9zeW1saW5rLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9leGlzdHMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2V4cGFuZF9nbG9iLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9tb3ZlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9jb3B5LnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi93YWxrLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9lb2wudHNcIjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUU7Ozs7Ozs7Ozs7Ozs7Q0FhQyxHQUVELGNBQWMsaUJBQWlCO0FBQy9CLGNBQWMsa0JBQWtCO0FBQ2hDLGNBQWMsbUJBQW1CO0FBQ2pDLGNBQWMsbUJBQW1CO0FBQ2pDLGNBQWMsc0JBQXNCO0FBQ3BDLGNBQWMsY0FBYztBQUM1QixjQUFjLG1CQUFtQjtBQUNqQyxjQUFjLFlBQVk7QUFDMUIsY0FBYyxZQUFZO0FBQzFCLGNBQWMsWUFBWTtBQUMxQixjQUFjLFdBQVcifQ==
// denoCacheMetadata=2408740787045631451,334725620206258619