// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Pure functions for common tasks around collection types like arrays and
 * objects.
 *
 * Heavily inspired by
 * {@link https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/ | Kotlin's Collections}
 * package.
 *
 * ```ts
 * import { intersect, sample, pick } from "@std/collections";
 * import { assertEquals, assertArrayIncludes } from "@std/assert";
 *
 * const lisaInterests = ["Cooking", "Music", "Hiking"];
 * const kimInterests = ["Music", "Tennis", "Cooking"];
 *
 * assertEquals(intersect(lisaInterests, kimInterests), ["Cooking", "Music"]);
 *
 * assertArrayIncludes(lisaInterests, [sample(lisaInterests)]);
 *
 * const cat = { name: "Lulu", age: 3, breed: "Ragdoll" };
 *
 * assertEquals(pick(cat, ["name", "breed"]), { name: "Lulu", breed: "Ragdoll"});
 * ```
 *
 * @module
 */ export * from "./aggregate_groups.ts";
export * from "./associate_by.ts";
export * from "./associate_with.ts";
export * from "./chunk.ts";
export * from "./deep_merge.ts";
export * from "./distinct.ts";
export * from "./distinct_by.ts";
export * from "./drop_last_while.ts";
export * from "./drop_while.ts";
export * from "./filter_entries.ts";
export * from "./filter_keys.ts";
export * from "./filter_values.ts";
export * from "./find_single.ts";
export * from "./first_not_nullish_of.ts";
export * from "./includes_value.ts";
export * from "./intersect.ts";
export * from "./invert_by.ts";
export * from "./invert.ts";
export * from "./join_to_string.ts";
export * from "./map_entries.ts";
export * from "./map_keys.ts";
export * from "./map_not_nullish.ts";
export * from "./map_values.ts";
export * from "./max_by.ts";
export * from "./max_of.ts";
export * from "./max_with.ts";
export * from "./min_by.ts";
export * from "./min_of.ts";
export * from "./min_with.ts";
export * from "./omit.ts";
export * from "./partition.ts";
export * from "./partition_entries.ts";
export * from "./permutations.ts";
export * from "./pick.ts";
export * from "./reduce_groups.ts";
export * from "./running_reduce.ts";
export * from "./sample.ts";
export * from "./sliding_windows.ts";
export * from "./sort_by.ts";
export * from "./sum_of.ts";
export * from "./take_last_while.ts";
export * from "./take_while.ts";
export * from "./union.ts";
export * from "./unzip.ts";
export * from "./without_all.ts";
export * from "./zip.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvY29sbGVjdGlvbnMvMC4yMjQuMi9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBQdXJlIGZ1bmN0aW9ucyBmb3IgY29tbW9uIHRhc2tzIGFyb3VuZCBjb2xsZWN0aW9uIHR5cGVzIGxpa2UgYXJyYXlzIGFuZFxuICogb2JqZWN0cy5cbiAqXG4gKiBIZWF2aWx5IGluc3BpcmVkIGJ5XG4gKiB7QGxpbmsgaHR0cHM6Ly9rb3RsaW5sYW5nLm9yZy9hcGkvbGF0ZXN0L2p2bS9zdGRsaWIva290bGluLmNvbGxlY3Rpb25zLyB8IEtvdGxpbidzIENvbGxlY3Rpb25zfVxuICogcGFja2FnZS5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgaW50ZXJzZWN0LCBzYW1wbGUsIHBpY2sgfSBmcm9tIFwiQHN0ZC9jb2xsZWN0aW9uc1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzLCBhc3NlcnRBcnJheUluY2x1ZGVzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3QgbGlzYUludGVyZXN0cyA9IFtcIkNvb2tpbmdcIiwgXCJNdXNpY1wiLCBcIkhpa2luZ1wiXTtcbiAqIGNvbnN0IGtpbUludGVyZXN0cyA9IFtcIk11c2ljXCIsIFwiVGVubmlzXCIsIFwiQ29va2luZ1wiXTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoaW50ZXJzZWN0KGxpc2FJbnRlcmVzdHMsIGtpbUludGVyZXN0cyksIFtcIkNvb2tpbmdcIiwgXCJNdXNpY1wiXSk7XG4gKlxuICogYXNzZXJ0QXJyYXlJbmNsdWRlcyhsaXNhSW50ZXJlc3RzLCBbc2FtcGxlKGxpc2FJbnRlcmVzdHMpXSk7XG4gKlxuICogY29uc3QgY2F0ID0geyBuYW1lOiBcIkx1bHVcIiwgYWdlOiAzLCBicmVlZDogXCJSYWdkb2xsXCIgfTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMocGljayhjYXQsIFtcIm5hbWVcIiwgXCJicmVlZFwiXSksIHsgbmFtZTogXCJMdWx1XCIsIGJyZWVkOiBcIlJhZ2RvbGxcIn0pO1xuICogYGBgXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmV4cG9ydCAqIGZyb20gXCIuL2FnZ3JlZ2F0ZV9ncm91cHMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2Fzc29jaWF0ZV9ieS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vYXNzb2NpYXRlX3dpdGgudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2NodW5rLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9kZWVwX21lcmdlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9kaXN0aW5jdC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZGlzdGluY3RfYnkudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2Ryb3BfbGFzdF93aGlsZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZHJvcF93aGlsZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZmlsdGVyX2VudHJpZXMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2ZpbHRlcl9rZXlzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9maWx0ZXJfdmFsdWVzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9maW5kX3NpbmdsZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZmlyc3Rfbm90X251bGxpc2hfb2YudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2luY2x1ZGVzX3ZhbHVlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9pbnRlcnNlY3QudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2ludmVydF9ieS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaW52ZXJ0LnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9qb2luX3RvX3N0cmluZy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbWFwX2VudHJpZXMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL21hcF9rZXlzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9tYXBfbm90X251bGxpc2gudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL21hcF92YWx1ZXMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL21heF9ieS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbWF4X29mLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9tYXhfd2l0aC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbWluX2J5LnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9taW5fb2YudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL21pbl93aXRoLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9vbWl0LnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9wYXJ0aXRpb24udHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3BhcnRpdGlvbl9lbnRyaWVzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9wZXJtdXRhdGlvbnMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3BpY2sudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3JlZHVjZV9ncm91cHMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3J1bm5pbmdfcmVkdWNlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9zYW1wbGUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3NsaWRpbmdfd2luZG93cy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vc29ydF9ieS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vc3VtX29mLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi90YWtlX2xhc3Rfd2hpbGUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3Rha2Vfd2hpbGUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3VuaW9uLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi91bnppcC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vd2l0aG91dF9hbGwudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3ppcC50c1wiO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F5QkMsR0FFRCxjQUFjLHdCQUF3QjtBQUN0QyxjQUFjLG9CQUFvQjtBQUNsQyxjQUFjLHNCQUFzQjtBQUNwQyxjQUFjLGFBQWE7QUFDM0IsY0FBYyxrQkFBa0I7QUFDaEMsY0FBYyxnQkFBZ0I7QUFDOUIsY0FBYyxtQkFBbUI7QUFDakMsY0FBYyx1QkFBdUI7QUFDckMsY0FBYyxrQkFBa0I7QUFDaEMsY0FBYyxzQkFBc0I7QUFDcEMsY0FBYyxtQkFBbUI7QUFDakMsY0FBYyxxQkFBcUI7QUFDbkMsY0FBYyxtQkFBbUI7QUFDakMsY0FBYyw0QkFBNEI7QUFDMUMsY0FBYyxzQkFBc0I7QUFDcEMsY0FBYyxpQkFBaUI7QUFDL0IsY0FBYyxpQkFBaUI7QUFDL0IsY0FBYyxjQUFjO0FBQzVCLGNBQWMsc0JBQXNCO0FBQ3BDLGNBQWMsbUJBQW1CO0FBQ2pDLGNBQWMsZ0JBQWdCO0FBQzlCLGNBQWMsdUJBQXVCO0FBQ3JDLGNBQWMsa0JBQWtCO0FBQ2hDLGNBQWMsY0FBYztBQUM1QixjQUFjLGNBQWM7QUFDNUIsY0FBYyxnQkFBZ0I7QUFDOUIsY0FBYyxjQUFjO0FBQzVCLGNBQWMsY0FBYztBQUM1QixjQUFjLGdCQUFnQjtBQUM5QixjQUFjLFlBQVk7QUFDMUIsY0FBYyxpQkFBaUI7QUFDL0IsY0FBYyx5QkFBeUI7QUFDdkMsY0FBYyxvQkFBb0I7QUFDbEMsY0FBYyxZQUFZO0FBQzFCLGNBQWMscUJBQXFCO0FBQ25DLGNBQWMsc0JBQXNCO0FBQ3BDLGNBQWMsY0FBYztBQUM1QixjQUFjLHVCQUF1QjtBQUNyQyxjQUFjLGVBQWU7QUFDN0IsY0FBYyxjQUFjO0FBQzVCLGNBQWMsdUJBQXVCO0FBQ3JDLGNBQWMsa0JBQWtCO0FBQ2hDLGNBQWMsYUFBYTtBQUMzQixjQUFjLGFBQWE7QUFDM0IsY0FBYyxtQkFBbUI7QUFDakMsY0FBYyxXQUFXIn0=
// denoCacheMetadata=9314227524182181166,13004239979604795741