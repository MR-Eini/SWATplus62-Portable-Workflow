// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { globToRegExp } from "jsr:/@std/path@^0.224.0/glob-to-regexp";
import { joinGlobs } from "jsr:/@std/path@^0.224.0/join-globs";
import { isGlob } from "jsr:/@std/path@^0.224.0/is-glob";
import { isAbsolute } from "jsr:/@std/path@^0.224.0/is-absolute";
import { resolve } from "jsr:/@std/path@^0.224.0/resolve";
import { SEPARATOR_PATTERN } from "jsr:/@std/path@^0.224.0/constants";
import { walk, walkSync } from "./walk.ts";
import { assert } from "jsr:/@std/assert@^0.224.0/assert";
import { toPathString } from "./_to_path_string.ts";
import { createWalkEntry, createWalkEntrySync } from "./_create_walk_entry.ts";
const isWindows = Deno.build.os === "windows";
function split(path) {
  const s = SEPARATOR_PATTERN.source;
  const segments = path.replace(new RegExp(`^${s}|${s}$`, "g"), "").split(SEPARATOR_PATTERN);
  const isAbsolute_ = isAbsolute(path);
  return {
    segments,
    isAbsolute: isAbsolute_,
    hasTrailingSep: !!path.match(new RegExp(`${s}$`)),
    winRoot: isWindows && isAbsolute_ ? segments.shift() : undefined
  };
}
function throwUnlessNotFound(error) {
  if (!(error instanceof Deno.errors.NotFound)) {
    throw error;
  }
}
function comparePath(a, b) {
  if (a.path < b.path) return -1;
  if (a.path > b.path) return 1;
  return 0;
}
/**
 * Returns an async iterator that yields each file path matching the given glob
 * pattern. The file paths are relative to the provided `root` directory.
 * If `root` is not provided, the current working directory is used.
 * The `root` directory is not included in the yielded file paths.
 *
 * Requires the `--allow-read` flag.
 *
 * @param glob The glob pattern to expand.
 * @param options Additional options for the expansion.
 * @returns An async iterator that yields each walk entry matching the glob
 * pattern.
 *
 * @example Basic usage
 *
 * File structure:
 * ```
 * folder
 * ├── script.ts
 * └── foo.ts
 * ```
 *
 * ```ts
 * // script.ts
 * import { expandGlob } from "@std/fs/expand-glob";
 *
 * const entries = [];
 * for await (const entry of expandGlob("*.ts")) {
 *   entries.push(entry);
 * }
 *
 * entries[0]!.path; // "/Users/user/folder/script.ts"
 * entries[0]!.name; // "script.ts"
 * entries[0]!.isFile; // false
 * entries[0]!.isDirectory; // true
 * entries[0]!.isSymlink; // false
 *
 * entries[1]!.path; // "/Users/user/folder/foo.ts"
 * entries[1]!.name; // "foo.ts"
 * entries[1]!.isFile; // true
 * entries[1]!.isDirectory; // false
 * entries[1]!.isSymlink; // false
 * ```
 */ export async function* expandGlob(glob, { root, exclude = [], includeDirs = true, extended = true, globstar = true, caseInsensitive, followSymlinks, canonicalize } = {}) {
  const { segments, isAbsolute: isGlobAbsolute, hasTrailingSep, winRoot } = split(toPathString(glob));
  root ??= isGlobAbsolute ? winRoot ?? "/" : Deno.cwd();
  const globOptions = {
    extended,
    globstar,
    caseInsensitive
  };
  const absRoot = isGlobAbsolute ? root : resolve(root); // root is always string here
  const resolveFromRoot = (path)=>resolve(absRoot, path);
  const excludePatterns = exclude.map(resolveFromRoot).map((s)=>globToRegExp(s, globOptions));
  const shouldInclude = (path)=>!excludePatterns.some((p)=>!!path.match(p));
  let fixedRoot = isGlobAbsolute ? winRoot !== undefined ? winRoot : "/" : absRoot;
  while(segments.length > 0 && !isGlob(segments[0])){
    const seg = segments.shift();
    assert(seg !== undefined);
    fixedRoot = joinGlobs([
      fixedRoot,
      seg
    ], globOptions);
  }
  let fixedRootInfo;
  try {
    fixedRootInfo = await createWalkEntry(fixedRoot);
  } catch (error) {
    return throwUnlessNotFound(error);
  }
  async function* advanceMatch(walkInfo, globSegment) {
    if (!walkInfo.isDirectory) {
      return;
    } else if (globSegment === "..") {
      const parentPath = joinGlobs([
        walkInfo.path,
        ".."
      ], globOptions);
      try {
        if (shouldInclude(parentPath)) {
          return yield await createWalkEntry(parentPath);
        }
      } catch (error) {
        throwUnlessNotFound(error);
      }
      return;
    } else if (globSegment === "**") {
      return yield* walk(walkInfo.path, {
        skip: excludePatterns,
        maxDepth: globstar ? Infinity : 1,
        followSymlinks,
        canonicalize
      });
    }
    const globPattern = globToRegExp(globSegment, globOptions);
    for await (const walkEntry of walk(walkInfo.path, {
      maxDepth: 1,
      skip: excludePatterns,
      followSymlinks
    })){
      if (walkEntry.path !== walkInfo.path && walkEntry.name.match(globPattern)) {
        yield walkEntry;
      }
    }
  }
  let currentMatches = [
    fixedRootInfo
  ];
  for (const segment of segments){
    // Advancing the list of current matches may introduce duplicates, so we
    // pass everything through this Map.
    const nextMatchMap = new Map();
    await Promise.all(currentMatches.map(async (currentMatch)=>{
      for await (const nextMatch of advanceMatch(currentMatch, segment)){
        nextMatchMap.set(nextMatch.path, nextMatch);
      }
    }));
    currentMatches = [
      ...nextMatchMap.values()
    ].sort(comparePath);
  }
  if (hasTrailingSep) {
    currentMatches = currentMatches.filter((entry)=>entry.isDirectory);
  }
  if (!includeDirs) {
    currentMatches = currentMatches.filter((entry)=>!entry.isDirectory);
  }
  yield* currentMatches;
}
/**
 * Returns an iterator that yields each file path matching the given glob
 * pattern. The file paths are relative to the provided `root` directory.
 * If `root` is not provided, the current working directory is used.
 * The `root` directory is not included in the yielded file paths.
 *
 * Requires the `--allow-read` flag.
 *
 * @param glob The glob pattern to expand.
 * @param options Additional options for the expansion.
 * @returns An iterator that yields each walk entry matching the glob pattern.
 *
 * @example Basic usage
 *
 * File structure:
 * ```
 * folder
 * ├── script.ts
 * └── foo.ts
 * ```
 *
 * ```ts
 * // script.ts
 * import { expandGlobSync } from "@std/fs/expand-glob";
 *
 * const entries = [];
 * for (const entry of expandGlobSync("*.ts")) {
 *   entries.push(entry);
 * }
 *
 * entries[0]!.path; // "/Users/user/folder/script.ts"
 * entries[0]!.name; // "script.ts"
 * entries[0]!.isFile; // false
 * entries[0]!.isDirectory; // true
 * entries[0]!.isSymlink; // false
 *
 * entries[1]!.path; // "/Users/user/folder/foo.ts"
 * entries[1]!.name; // "foo.ts"
 * entries[1]!.isFile; // true
 * entries[1]!.isDirectory; // false
 * entries[1]!.isSymlink; // false
 * ```
 */ export function* expandGlobSync(glob, { root, exclude = [], includeDirs = true, extended = true, globstar = true, caseInsensitive, followSymlinks, canonicalize } = {}) {
  const { segments, isAbsolute: isGlobAbsolute, hasTrailingSep, winRoot } = split(toPathString(glob));
  root ??= isGlobAbsolute ? winRoot ?? "/" : Deno.cwd();
  const globOptions = {
    extended,
    globstar,
    caseInsensitive
  };
  const absRoot = isGlobAbsolute ? root : resolve(root); // root is always string here
  const resolveFromRoot = (path)=>resolve(absRoot, path);
  const excludePatterns = exclude.map(resolveFromRoot).map((s)=>globToRegExp(s, globOptions));
  const shouldInclude = (path)=>!excludePatterns.some((p)=>!!path.match(p));
  let fixedRoot = isGlobAbsolute ? winRoot !== undefined ? winRoot : "/" : absRoot;
  while(segments.length > 0 && !isGlob(segments[0])){
    const seg = segments.shift();
    assert(seg !== undefined);
    fixedRoot = joinGlobs([
      fixedRoot,
      seg
    ], globOptions);
  }
  let fixedRootInfo;
  try {
    fixedRootInfo = createWalkEntrySync(fixedRoot);
  } catch (error) {
    return throwUnlessNotFound(error);
  }
  function* advanceMatch(walkInfo, globSegment) {
    if (!walkInfo.isDirectory) {
      return;
    } else if (globSegment === "..") {
      const parentPath = joinGlobs([
        walkInfo.path,
        ".."
      ], globOptions);
      try {
        if (shouldInclude(parentPath)) {
          return yield createWalkEntrySync(parentPath);
        }
      } catch (error) {
        throwUnlessNotFound(error);
      }
      return;
    } else if (globSegment === "**") {
      return yield* walkSync(walkInfo.path, {
        skip: excludePatterns,
        maxDepth: globstar ? Infinity : 1,
        followSymlinks,
        canonicalize
      });
    }
    const globPattern = globToRegExp(globSegment, globOptions);
    for (const walkEntry of walkSync(walkInfo.path, {
      maxDepth: 1,
      skip: excludePatterns,
      followSymlinks
    })){
      if (walkEntry.path !== walkInfo.path && walkEntry.name.match(globPattern)) {
        yield walkEntry;
      }
    }
  }
  let currentMatches = [
    fixedRootInfo
  ];
  for (const segment of segments){
    // Advancing the list of current matches may introduce duplicates, so we
    // pass everything through this Map.
    const nextMatchMap = new Map();
    for (const currentMatch of currentMatches){
      for (const nextMatch of advanceMatch(currentMatch, segment)){
        nextMatchMap.set(nextMatch.path, nextMatch);
      }
    }
    currentMatches = [
      ...nextMatchMap.values()
    ].sort(comparePath);
  }
  if (hasTrailingSep) {
    currentMatches = currentMatches.filter((entry)=>entry.isDirectory);
  }
  if (!includeDirs) {
    currentMatches = currentMatches.filter((entry)=>!entry.isDirectory);
  }
  yield* currentMatches;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC9leHBhbmRfZ2xvYi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuaW1wb3J0IHsgdHlwZSBHbG9iT3B0aW9ucywgZ2xvYlRvUmVnRXhwIH0gZnJvbSBcImpzcjovQHN0ZC9wYXRoQF4wLjIyNC4wL2dsb2ItdG8tcmVnZXhwXCI7XG5pbXBvcnQgeyBqb2luR2xvYnMgfSBmcm9tIFwianNyOi9Ac3RkL3BhdGhAXjAuMjI0LjAvam9pbi1nbG9ic1wiO1xuaW1wb3J0IHsgaXNHbG9iIH0gZnJvbSBcImpzcjovQHN0ZC9wYXRoQF4wLjIyNC4wL2lzLWdsb2JcIjtcbmltcG9ydCB7IGlzQWJzb2x1dGUgfSBmcm9tIFwianNyOi9Ac3RkL3BhdGhAXjAuMjI0LjAvaXMtYWJzb2x1dGVcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwianNyOi9Ac3RkL3BhdGhAXjAuMjI0LjAvcmVzb2x2ZVwiO1xuaW1wb3J0IHsgU0VQQVJBVE9SX1BBVFRFUk4gfSBmcm9tIFwianNyOi9Ac3RkL3BhdGhAXjAuMjI0LjAvY29uc3RhbnRzXCI7XG5pbXBvcnQgeyB3YWxrLCB3YWxrU3luYyB9IGZyb20gXCIuL3dhbGsudHNcIjtcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJqc3I6L0BzdGQvYXNzZXJ0QF4wLjIyNC4wL2Fzc2VydFwiO1xuaW1wb3J0IHsgdG9QYXRoU3RyaW5nIH0gZnJvbSBcIi4vX3RvX3BhdGhfc3RyaW5nLnRzXCI7XG5pbXBvcnQge1xuICBjcmVhdGVXYWxrRW50cnksXG4gIGNyZWF0ZVdhbGtFbnRyeVN5bmMsXG4gIHR5cGUgV2Fsa0VudHJ5LFxufSBmcm9tIFwiLi9fY3JlYXRlX3dhbGtfZW50cnkudHNcIjtcblxuZXhwb3J0IHR5cGUgeyBHbG9iT3B0aW9ucywgV2Fsa0VudHJ5IH07XG5cbmNvbnN0IGlzV2luZG93cyA9IERlbm8uYnVpbGQub3MgPT09IFwid2luZG93c1wiO1xuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBleHBhbmRHbG9ifSBhbmQge0BsaW5rY29kZSBleHBhbmRHbG9iU3luY30uICovXG5leHBvcnQgaW50ZXJmYWNlIEV4cGFuZEdsb2JPcHRpb25zIGV4dGVuZHMgT21pdDxHbG9iT3B0aW9ucywgXCJvc1wiPiB7XG4gIC8qKiBGaWxlIHBhdGggd2hlcmUgdG8gZXhwYW5kIGZyb20uICovXG4gIHJvb3Q/OiBzdHJpbmc7XG4gIC8qKiBMaXN0IG9mIGdsb2IgcGF0dGVybnMgdG8gYmUgZXhjbHVkZWQgZnJvbSB0aGUgZXhwYW5zaW9uLiAqL1xuICBleGNsdWRlPzogc3RyaW5nW107XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGluY2x1ZGUgZGlyZWN0b3JpZXMgaW4gZW50cmllcy5cbiAgICpcbiAgICogQGRlZmF1bHQge3RydWV9XG4gICAqL1xuICBpbmNsdWRlRGlycz86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGZvbGxvdyBzeW1ib2xpYyBsaW5rcy5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgZm9sbG93U3ltbGlua3M/OiBib29sZWFuO1xuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGZvbGxvd2VkIHN5bWxpbmsncyBwYXRoIHNob3VsZCBiZSBjYW5vbmljYWxpemVkLlxuICAgKiBUaGlzIG9wdGlvbiB3b3JrcyBvbmx5IGlmIGBmb2xsb3dTeW1saW5rc2AgaXMgbm90IGBmYWxzZWAuXG4gICAqXG4gICAqIEBkZWZhdWx0IHt0cnVlfVxuICAgKi9cbiAgY2Fub25pY2FsaXplPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIFNwbGl0UGF0aCB7XG4gIHNlZ21lbnRzOiBzdHJpbmdbXTtcbiAgaXNBYnNvbHV0ZTogYm9vbGVhbjtcbiAgaGFzVHJhaWxpbmdTZXA6IGJvb2xlYW47XG4gIC8vIERlZmluZWQgZm9yIGFueSBhYnNvbHV0ZSBXaW5kb3dzIHBhdGguXG4gIHdpblJvb3Q/OiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIHNwbGl0KHBhdGg6IHN0cmluZyk6IFNwbGl0UGF0aCB7XG4gIGNvbnN0IHMgPSBTRVBBUkFUT1JfUEFUVEVSTi5zb3VyY2U7XG4gIGNvbnN0IHNlZ21lbnRzID0gcGF0aFxuICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4ke3N9fCR7c30kYCwgXCJnXCIpLCBcIlwiKVxuICAgIC5zcGxpdChTRVBBUkFUT1JfUEFUVEVSTik7XG4gIGNvbnN0IGlzQWJzb2x1dGVfID0gaXNBYnNvbHV0ZShwYXRoKTtcbiAgcmV0dXJuIHtcbiAgICBzZWdtZW50cyxcbiAgICBpc0Fic29sdXRlOiBpc0Fic29sdXRlXyxcbiAgICBoYXNUcmFpbGluZ1NlcDogISFwYXRoLm1hdGNoKG5ldyBSZWdFeHAoYCR7c30kYCkpLFxuICAgIHdpblJvb3Q6IGlzV2luZG93cyAmJiBpc0Fic29sdXRlXyA/IHNlZ21lbnRzLnNoaWZ0KCkgOiB1bmRlZmluZWQsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHRocm93VW5sZXNzTm90Rm91bmQoZXJyb3I6IHVua25vd24pIHtcbiAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkpIHtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb21wYXJlUGF0aChhOiBXYWxrRW50cnksIGI6IFdhbGtFbnRyeSk6IG51bWJlciB7XG4gIGlmIChhLnBhdGggPCBiLnBhdGgpIHJldHVybiAtMTtcbiAgaWYgKGEucGF0aCA+IGIucGF0aCkgcmV0dXJuIDE7XG4gIHJldHVybiAwO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gYXN5bmMgaXRlcmF0b3IgdGhhdCB5aWVsZHMgZWFjaCBmaWxlIHBhdGggbWF0Y2hpbmcgdGhlIGdpdmVuIGdsb2JcbiAqIHBhdHRlcm4uIFRoZSBmaWxlIHBhdGhzIGFyZSByZWxhdGl2ZSB0byB0aGUgcHJvdmlkZWQgYHJvb3RgIGRpcmVjdG9yeS5cbiAqIElmIGByb290YCBpcyBub3QgcHJvdmlkZWQsIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IGlzIHVzZWQuXG4gKiBUaGUgYHJvb3RgIGRpcmVjdG9yeSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIHlpZWxkZWQgZmlsZSBwYXRocy5cbiAqXG4gKiBSZXF1aXJlcyB0aGUgYC0tYWxsb3ctcmVhZGAgZmxhZy5cbiAqXG4gKiBAcGFyYW0gZ2xvYiBUaGUgZ2xvYiBwYXR0ZXJuIHRvIGV4cGFuZC5cbiAqIEBwYXJhbSBvcHRpb25zIEFkZGl0aW9uYWwgb3B0aW9ucyBmb3IgdGhlIGV4cGFuc2lvbi5cbiAqIEByZXR1cm5zIEFuIGFzeW5jIGl0ZXJhdG9yIHRoYXQgeWllbGRzIGVhY2ggd2FsayBlbnRyeSBtYXRjaGluZyB0aGUgZ2xvYlxuICogcGF0dGVybi5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICpcbiAqIEZpbGUgc3RydWN0dXJlOlxuICogYGBgXG4gKiBmb2xkZXJcbiAqIOKUnOKUgOKUgCBzY3JpcHQudHNcbiAqIOKUlOKUgOKUgCBmb28udHNcbiAqIGBgYFxuICpcbiAqIGBgYHRzXG4gKiAvLyBzY3JpcHQudHNcbiAqIGltcG9ydCB7IGV4cGFuZEdsb2IgfSBmcm9tIFwiQHN0ZC9mcy9leHBhbmQtZ2xvYlwiO1xuICpcbiAqIGNvbnN0IGVudHJpZXMgPSBbXTtcbiAqIGZvciBhd2FpdCAoY29uc3QgZW50cnkgb2YgZXhwYW5kR2xvYihcIioudHNcIikpIHtcbiAqICAgZW50cmllcy5wdXNoKGVudHJ5KTtcbiAqIH1cbiAqXG4gKiBlbnRyaWVzWzBdIS5wYXRoOyAvLyBcIi9Vc2Vycy91c2VyL2ZvbGRlci9zY3JpcHQudHNcIlxuICogZW50cmllc1swXSEubmFtZTsgLy8gXCJzY3JpcHQudHNcIlxuICogZW50cmllc1swXSEuaXNGaWxlOyAvLyBmYWxzZVxuICogZW50cmllc1swXSEuaXNEaXJlY3Rvcnk7IC8vIHRydWVcbiAqIGVudHJpZXNbMF0hLmlzU3ltbGluazsgLy8gZmFsc2VcbiAqXG4gKiBlbnRyaWVzWzFdIS5wYXRoOyAvLyBcIi9Vc2Vycy91c2VyL2ZvbGRlci9mb28udHNcIlxuICogZW50cmllc1sxXSEubmFtZTsgLy8gXCJmb28udHNcIlxuICogZW50cmllc1sxXSEuaXNGaWxlOyAvLyB0cnVlXG4gKiBlbnRyaWVzWzFdIS5pc0RpcmVjdG9yeTsgLy8gZmFsc2VcbiAqIGVudHJpZXNbMV0hLmlzU3ltbGluazsgLy8gZmFsc2VcbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24qIGV4cGFuZEdsb2IoXG4gIGdsb2I6IHN0cmluZyB8IFVSTCxcbiAge1xuICAgIHJvb3QsXG4gICAgZXhjbHVkZSA9IFtdLFxuICAgIGluY2x1ZGVEaXJzID0gdHJ1ZSxcbiAgICBleHRlbmRlZCA9IHRydWUsXG4gICAgZ2xvYnN0YXIgPSB0cnVlLFxuICAgIGNhc2VJbnNlbnNpdGl2ZSxcbiAgICBmb2xsb3dTeW1saW5rcyxcbiAgICBjYW5vbmljYWxpemUsXG4gIH06IEV4cGFuZEdsb2JPcHRpb25zID0ge30sXG4pOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8V2Fsa0VudHJ5PiB7XG4gIGNvbnN0IHtcbiAgICBzZWdtZW50cyxcbiAgICBpc0Fic29sdXRlOiBpc0dsb2JBYnNvbHV0ZSxcbiAgICBoYXNUcmFpbGluZ1NlcCxcbiAgICB3aW5Sb290LFxuICB9ID0gc3BsaXQodG9QYXRoU3RyaW5nKGdsb2IpKTtcbiAgcm9vdCA/Pz0gaXNHbG9iQWJzb2x1dGUgPyB3aW5Sb290ID8/IFwiL1wiIDogRGVuby5jd2QoKTtcblxuICBjb25zdCBnbG9iT3B0aW9uczogR2xvYk9wdGlvbnMgPSB7IGV4dGVuZGVkLCBnbG9ic3RhciwgY2FzZUluc2Vuc2l0aXZlIH07XG4gIGNvbnN0IGFic1Jvb3QgPSBpc0dsb2JBYnNvbHV0ZSA/IHJvb3QgOiByZXNvbHZlKHJvb3QhKTsgLy8gcm9vdCBpcyBhbHdheXMgc3RyaW5nIGhlcmVcbiAgY29uc3QgcmVzb2x2ZUZyb21Sb290ID0gKHBhdGg6IHN0cmluZyk6IHN0cmluZyA9PiByZXNvbHZlKGFic1Jvb3QsIHBhdGgpO1xuICBjb25zdCBleGNsdWRlUGF0dGVybnMgPSBleGNsdWRlXG4gICAgLm1hcChyZXNvbHZlRnJvbVJvb3QpXG4gICAgLm1hcCgoczogc3RyaW5nKTogUmVnRXhwID0+IGdsb2JUb1JlZ0V4cChzLCBnbG9iT3B0aW9ucykpO1xuICBjb25zdCBzaG91bGRJbmNsdWRlID0gKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4gPT5cbiAgICAhZXhjbHVkZVBhdHRlcm5zLnNvbWUoKHA6IFJlZ0V4cCk6IGJvb2xlYW4gPT4gISFwYXRoLm1hdGNoKHApKTtcblxuICBsZXQgZml4ZWRSb290ID0gaXNHbG9iQWJzb2x1dGVcbiAgICA/IHdpblJvb3QgIT09IHVuZGVmaW5lZCA/IHdpblJvb3QgOiBcIi9cIlxuICAgIDogYWJzUm9vdDtcbiAgd2hpbGUgKHNlZ21lbnRzLmxlbmd0aCA+IDAgJiYgIWlzR2xvYihzZWdtZW50c1swXSEpKSB7XG4gICAgY29uc3Qgc2VnID0gc2VnbWVudHMuc2hpZnQoKTtcbiAgICBhc3NlcnQoc2VnICE9PSB1bmRlZmluZWQpO1xuICAgIGZpeGVkUm9vdCA9IGpvaW5HbG9icyhbZml4ZWRSb290LCBzZWddLCBnbG9iT3B0aW9ucyk7XG4gIH1cblxuICBsZXQgZml4ZWRSb290SW5mbzogV2Fsa0VudHJ5O1xuICB0cnkge1xuICAgIGZpeGVkUm9vdEluZm8gPSBhd2FpdCBjcmVhdGVXYWxrRW50cnkoZml4ZWRSb290KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gdGhyb3dVbmxlc3NOb3RGb3VuZChlcnJvcik7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiogYWR2YW5jZU1hdGNoKFxuICAgIHdhbGtJbmZvOiBXYWxrRW50cnksXG4gICAgZ2xvYlNlZ21lbnQ6IHN0cmluZyxcbiAgKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFdhbGtFbnRyeT4ge1xuICAgIGlmICghd2Fsa0luZm8uaXNEaXJlY3RvcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGdsb2JTZWdtZW50ID09PSBcIi4uXCIpIHtcbiAgICAgIGNvbnN0IHBhcmVudFBhdGggPSBqb2luR2xvYnMoW3dhbGtJbmZvLnBhdGgsIFwiLi5cIl0sIGdsb2JPcHRpb25zKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChzaG91bGRJbmNsdWRlKHBhcmVudFBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIHlpZWxkIGF3YWl0IGNyZWF0ZVdhbGtFbnRyeShwYXJlbnRQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgdGhyb3dVbmxlc3NOb3RGb3VuZChlcnJvcik7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChnbG9iU2VnbWVudCA9PT0gXCIqKlwiKSB7XG4gICAgICByZXR1cm4geWllbGQqIHdhbGsod2Fsa0luZm8ucGF0aCwge1xuICAgICAgICBza2lwOiBleGNsdWRlUGF0dGVybnMsXG4gICAgICAgIG1heERlcHRoOiBnbG9ic3RhciA/IEluZmluaXR5IDogMSxcbiAgICAgICAgZm9sbG93U3ltbGlua3MsXG4gICAgICAgIGNhbm9uaWNhbGl6ZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCBnbG9iUGF0dGVybiA9IGdsb2JUb1JlZ0V4cChnbG9iU2VnbWVudCwgZ2xvYk9wdGlvbnMpO1xuICAgIGZvciBhd2FpdCAoXG4gICAgICBjb25zdCB3YWxrRW50cnkgb2Ygd2Fsayh3YWxrSW5mby5wYXRoLCB7XG4gICAgICAgIG1heERlcHRoOiAxLFxuICAgICAgICBza2lwOiBleGNsdWRlUGF0dGVybnMsXG4gICAgICAgIGZvbGxvd1N5bWxpbmtzLFxuICAgICAgfSlcbiAgICApIHtcbiAgICAgIGlmIChcbiAgICAgICAgd2Fsa0VudHJ5LnBhdGggIT09IHdhbGtJbmZvLnBhdGggJiZcbiAgICAgICAgd2Fsa0VudHJ5Lm5hbWUubWF0Y2goZ2xvYlBhdHRlcm4pXG4gICAgICApIHtcbiAgICAgICAgeWllbGQgd2Fsa0VudHJ5O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxldCBjdXJyZW50TWF0Y2hlczogV2Fsa0VudHJ5W10gPSBbZml4ZWRSb290SW5mb107XG4gIGZvciAoY29uc3Qgc2VnbWVudCBvZiBzZWdtZW50cykge1xuICAgIC8vIEFkdmFuY2luZyB0aGUgbGlzdCBvZiBjdXJyZW50IG1hdGNoZXMgbWF5IGludHJvZHVjZSBkdXBsaWNhdGVzLCBzbyB3ZVxuICAgIC8vIHBhc3MgZXZlcnl0aGluZyB0aHJvdWdoIHRoaXMgTWFwLlxuICAgIGNvbnN0IG5leHRNYXRjaE1hcDogTWFwPHN0cmluZywgV2Fsa0VudHJ5PiA9IG5ldyBNYXAoKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIGN1cnJlbnRNYXRjaGVzLm1hcChhc3luYyAoY3VycmVudE1hdGNoKSA9PiB7XG4gICAgICAgIGZvciBhd2FpdCAoY29uc3QgbmV4dE1hdGNoIG9mIGFkdmFuY2VNYXRjaChjdXJyZW50TWF0Y2gsIHNlZ21lbnQpKSB7XG4gICAgICAgICAgbmV4dE1hdGNoTWFwLnNldChuZXh0TWF0Y2gucGF0aCwgbmV4dE1hdGNoKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcbiAgICBjdXJyZW50TWF0Y2hlcyA9IFsuLi5uZXh0TWF0Y2hNYXAudmFsdWVzKCldLnNvcnQoY29tcGFyZVBhdGgpO1xuICB9XG5cbiAgaWYgKGhhc1RyYWlsaW5nU2VwKSB7XG4gICAgY3VycmVudE1hdGNoZXMgPSBjdXJyZW50TWF0Y2hlcy5maWx0ZXIoXG4gICAgICAoZW50cnk6IFdhbGtFbnRyeSk6IGJvb2xlYW4gPT4gZW50cnkuaXNEaXJlY3RvcnksXG4gICAgKTtcbiAgfVxuICBpZiAoIWluY2x1ZGVEaXJzKSB7XG4gICAgY3VycmVudE1hdGNoZXMgPSBjdXJyZW50TWF0Y2hlcy5maWx0ZXIoXG4gICAgICAoZW50cnk6IFdhbGtFbnRyeSk6IGJvb2xlYW4gPT4gIWVudHJ5LmlzRGlyZWN0b3J5LFxuICAgICk7XG4gIH1cbiAgeWllbGQqIGN1cnJlbnRNYXRjaGVzO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gaXRlcmF0b3IgdGhhdCB5aWVsZHMgZWFjaCBmaWxlIHBhdGggbWF0Y2hpbmcgdGhlIGdpdmVuIGdsb2JcbiAqIHBhdHRlcm4uIFRoZSBmaWxlIHBhdGhzIGFyZSByZWxhdGl2ZSB0byB0aGUgcHJvdmlkZWQgYHJvb3RgIGRpcmVjdG9yeS5cbiAqIElmIGByb290YCBpcyBub3QgcHJvdmlkZWQsIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IGlzIHVzZWQuXG4gKiBUaGUgYHJvb3RgIGRpcmVjdG9yeSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIHlpZWxkZWQgZmlsZSBwYXRocy5cbiAqXG4gKiBSZXF1aXJlcyB0aGUgYC0tYWxsb3ctcmVhZGAgZmxhZy5cbiAqXG4gKiBAcGFyYW0gZ2xvYiBUaGUgZ2xvYiBwYXR0ZXJuIHRvIGV4cGFuZC5cbiAqIEBwYXJhbSBvcHRpb25zIEFkZGl0aW9uYWwgb3B0aW9ucyBmb3IgdGhlIGV4cGFuc2lvbi5cbiAqIEByZXR1cm5zIEFuIGl0ZXJhdG9yIHRoYXQgeWllbGRzIGVhY2ggd2FsayBlbnRyeSBtYXRjaGluZyB0aGUgZ2xvYiBwYXR0ZXJuLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKlxuICogRmlsZSBzdHJ1Y3R1cmU6XG4gKiBgYGBcbiAqIGZvbGRlclxuICog4pSc4pSA4pSAIHNjcmlwdC50c1xuICog4pSU4pSA4pSAIGZvby50c1xuICogYGBgXG4gKlxuICogYGBgdHNcbiAqIC8vIHNjcmlwdC50c1xuICogaW1wb3J0IHsgZXhwYW5kR2xvYlN5bmMgfSBmcm9tIFwiQHN0ZC9mcy9leHBhbmQtZ2xvYlwiO1xuICpcbiAqIGNvbnN0IGVudHJpZXMgPSBbXTtcbiAqIGZvciAoY29uc3QgZW50cnkgb2YgZXhwYW5kR2xvYlN5bmMoXCIqLnRzXCIpKSB7XG4gKiAgIGVudHJpZXMucHVzaChlbnRyeSk7XG4gKiB9XG4gKlxuICogZW50cmllc1swXSEucGF0aDsgLy8gXCIvVXNlcnMvdXNlci9mb2xkZXIvc2NyaXB0LnRzXCJcbiAqIGVudHJpZXNbMF0hLm5hbWU7IC8vIFwic2NyaXB0LnRzXCJcbiAqIGVudHJpZXNbMF0hLmlzRmlsZTsgLy8gZmFsc2VcbiAqIGVudHJpZXNbMF0hLmlzRGlyZWN0b3J5OyAvLyB0cnVlXG4gKiBlbnRyaWVzWzBdIS5pc1N5bWxpbms7IC8vIGZhbHNlXG4gKlxuICogZW50cmllc1sxXSEucGF0aDsgLy8gXCIvVXNlcnMvdXNlci9mb2xkZXIvZm9vLnRzXCJcbiAqIGVudHJpZXNbMV0hLm5hbWU7IC8vIFwiZm9vLnRzXCJcbiAqIGVudHJpZXNbMV0hLmlzRmlsZTsgLy8gdHJ1ZVxuICogZW50cmllc1sxXSEuaXNEaXJlY3Rvcnk7IC8vIGZhbHNlXG4gKiBlbnRyaWVzWzFdIS5pc1N5bWxpbms7IC8vIGZhbHNlXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uKiBleHBhbmRHbG9iU3luYyhcbiAgZ2xvYjogc3RyaW5nIHwgVVJMLFxuICB7XG4gICAgcm9vdCxcbiAgICBleGNsdWRlID0gW10sXG4gICAgaW5jbHVkZURpcnMgPSB0cnVlLFxuICAgIGV4dGVuZGVkID0gdHJ1ZSxcbiAgICBnbG9ic3RhciA9IHRydWUsXG4gICAgY2FzZUluc2Vuc2l0aXZlLFxuICAgIGZvbGxvd1N5bWxpbmtzLFxuICAgIGNhbm9uaWNhbGl6ZSxcbiAgfTogRXhwYW5kR2xvYk9wdGlvbnMgPSB7fSxcbik6IEl0ZXJhYmxlSXRlcmF0b3I8V2Fsa0VudHJ5PiB7XG4gIGNvbnN0IHtcbiAgICBzZWdtZW50cyxcbiAgICBpc0Fic29sdXRlOiBpc0dsb2JBYnNvbHV0ZSxcbiAgICBoYXNUcmFpbGluZ1NlcCxcbiAgICB3aW5Sb290LFxuICB9ID0gc3BsaXQodG9QYXRoU3RyaW5nKGdsb2IpKTtcbiAgcm9vdCA/Pz0gaXNHbG9iQWJzb2x1dGUgPyB3aW5Sb290ID8/IFwiL1wiIDogRGVuby5jd2QoKTtcblxuICBjb25zdCBnbG9iT3B0aW9uczogR2xvYk9wdGlvbnMgPSB7IGV4dGVuZGVkLCBnbG9ic3RhciwgY2FzZUluc2Vuc2l0aXZlIH07XG4gIGNvbnN0IGFic1Jvb3QgPSBpc0dsb2JBYnNvbHV0ZSA/IHJvb3QgOiByZXNvbHZlKHJvb3QhKTsgLy8gcm9vdCBpcyBhbHdheXMgc3RyaW5nIGhlcmVcbiAgY29uc3QgcmVzb2x2ZUZyb21Sb290ID0gKHBhdGg6IHN0cmluZyk6IHN0cmluZyA9PiByZXNvbHZlKGFic1Jvb3QsIHBhdGgpO1xuICBjb25zdCBleGNsdWRlUGF0dGVybnMgPSBleGNsdWRlXG4gICAgLm1hcChyZXNvbHZlRnJvbVJvb3QpXG4gICAgLm1hcCgoczogc3RyaW5nKTogUmVnRXhwID0+IGdsb2JUb1JlZ0V4cChzLCBnbG9iT3B0aW9ucykpO1xuICBjb25zdCBzaG91bGRJbmNsdWRlID0gKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4gPT5cbiAgICAhZXhjbHVkZVBhdHRlcm5zLnNvbWUoKHA6IFJlZ0V4cCk6IGJvb2xlYW4gPT4gISFwYXRoLm1hdGNoKHApKTtcblxuICBsZXQgZml4ZWRSb290ID0gaXNHbG9iQWJzb2x1dGVcbiAgICA/IHdpblJvb3QgIT09IHVuZGVmaW5lZCA/IHdpblJvb3QgOiBcIi9cIlxuICAgIDogYWJzUm9vdDtcbiAgd2hpbGUgKHNlZ21lbnRzLmxlbmd0aCA+IDAgJiYgIWlzR2xvYihzZWdtZW50c1swXSEpKSB7XG4gICAgY29uc3Qgc2VnID0gc2VnbWVudHMuc2hpZnQoKTtcbiAgICBhc3NlcnQoc2VnICE9PSB1bmRlZmluZWQpO1xuICAgIGZpeGVkUm9vdCA9IGpvaW5HbG9icyhbZml4ZWRSb290LCBzZWddLCBnbG9iT3B0aW9ucyk7XG4gIH1cblxuICBsZXQgZml4ZWRSb290SW5mbzogV2Fsa0VudHJ5O1xuICB0cnkge1xuICAgIGZpeGVkUm9vdEluZm8gPSBjcmVhdGVXYWxrRW50cnlTeW5jKGZpeGVkUm9vdCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIHRocm93VW5sZXNzTm90Rm91bmQoZXJyb3IpO1xuICB9XG5cbiAgZnVuY3Rpb24qIGFkdmFuY2VNYXRjaChcbiAgICB3YWxrSW5mbzogV2Fsa0VudHJ5LFxuICAgIGdsb2JTZWdtZW50OiBzdHJpbmcsXG4gICk6IEl0ZXJhYmxlSXRlcmF0b3I8V2Fsa0VudHJ5PiB7XG4gICAgaWYgKCF3YWxrSW5mby5pc0RpcmVjdG9yeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoZ2xvYlNlZ21lbnQgPT09IFwiLi5cIikge1xuICAgICAgY29uc3QgcGFyZW50UGF0aCA9IGpvaW5HbG9icyhbd2Fsa0luZm8ucGF0aCwgXCIuLlwiXSwgZ2xvYk9wdGlvbnMpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHNob3VsZEluY2x1ZGUocGFyZW50UGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4geWllbGQgY3JlYXRlV2Fsa0VudHJ5U3luYyhwYXJlbnRQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgdGhyb3dVbmxlc3NOb3RGb3VuZChlcnJvcik7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChnbG9iU2VnbWVudCA9PT0gXCIqKlwiKSB7XG4gICAgICByZXR1cm4geWllbGQqIHdhbGtTeW5jKHdhbGtJbmZvLnBhdGgsIHtcbiAgICAgICAgc2tpcDogZXhjbHVkZVBhdHRlcm5zLFxuICAgICAgICBtYXhEZXB0aDogZ2xvYnN0YXIgPyBJbmZpbml0eSA6IDEsXG4gICAgICAgIGZvbGxvd1N5bWxpbmtzLFxuICAgICAgICBjYW5vbmljYWxpemUsXG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3QgZ2xvYlBhdHRlcm4gPSBnbG9iVG9SZWdFeHAoZ2xvYlNlZ21lbnQsIGdsb2JPcHRpb25zKTtcbiAgICBmb3IgKFxuICAgICAgY29uc3Qgd2Fsa0VudHJ5IG9mIHdhbGtTeW5jKHdhbGtJbmZvLnBhdGgsIHtcbiAgICAgICAgbWF4RGVwdGg6IDEsXG4gICAgICAgIHNraXA6IGV4Y2x1ZGVQYXR0ZXJucyxcbiAgICAgICAgZm9sbG93U3ltbGlua3MsXG4gICAgICB9KVxuICAgICkge1xuICAgICAgaWYgKFxuICAgICAgICB3YWxrRW50cnkucGF0aCAhPT0gd2Fsa0luZm8ucGF0aCAmJlxuICAgICAgICB3YWxrRW50cnkubmFtZS5tYXRjaChnbG9iUGF0dGVybilcbiAgICAgICkge1xuICAgICAgICB5aWVsZCB3YWxrRW50cnk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbGV0IGN1cnJlbnRNYXRjaGVzOiBXYWxrRW50cnlbXSA9IFtmaXhlZFJvb3RJbmZvXTtcbiAgZm9yIChjb25zdCBzZWdtZW50IG9mIHNlZ21lbnRzKSB7XG4gICAgLy8gQWR2YW5jaW5nIHRoZSBsaXN0IG9mIGN1cnJlbnQgbWF0Y2hlcyBtYXkgaW50cm9kdWNlIGR1cGxpY2F0ZXMsIHNvIHdlXG4gICAgLy8gcGFzcyBldmVyeXRoaW5nIHRocm91Z2ggdGhpcyBNYXAuXG4gICAgY29uc3QgbmV4dE1hdGNoTWFwOiBNYXA8c3RyaW5nLCBXYWxrRW50cnk+ID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgY3VycmVudE1hdGNoIG9mIGN1cnJlbnRNYXRjaGVzKSB7XG4gICAgICBmb3IgKGNvbnN0IG5leHRNYXRjaCBvZiBhZHZhbmNlTWF0Y2goY3VycmVudE1hdGNoLCBzZWdtZW50KSkge1xuICAgICAgICBuZXh0TWF0Y2hNYXAuc2V0KG5leHRNYXRjaC5wYXRoLCBuZXh0TWF0Y2gpO1xuICAgICAgfVxuICAgIH1cbiAgICBjdXJyZW50TWF0Y2hlcyA9IFsuLi5uZXh0TWF0Y2hNYXAudmFsdWVzKCldLnNvcnQoY29tcGFyZVBhdGgpO1xuICB9XG5cbiAgaWYgKGhhc1RyYWlsaW5nU2VwKSB7XG4gICAgY3VycmVudE1hdGNoZXMgPSBjdXJyZW50TWF0Y2hlcy5maWx0ZXIoXG4gICAgICAoZW50cnk6IFdhbGtFbnRyeSk6IGJvb2xlYW4gPT4gZW50cnkuaXNEaXJlY3RvcnksXG4gICAgKTtcbiAgfVxuICBpZiAoIWluY2x1ZGVEaXJzKSB7XG4gICAgY3VycmVudE1hdGNoZXMgPSBjdXJyZW50TWF0Y2hlcy5maWx0ZXIoXG4gICAgICAoZW50cnk6IFdhbGtFbnRyeSk6IGJvb2xlYW4gPT4gIWVudHJ5LmlzRGlyZWN0b3J5LFxuICAgICk7XG4gIH1cbiAgeWllbGQqIGN1cnJlbnRNYXRjaGVzO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxTQUEyQixZQUFZLFFBQVEseUNBQXlDO0FBQ3hGLFNBQVMsU0FBUyxRQUFRLHFDQUFxQztBQUMvRCxTQUFTLE1BQU0sUUFBUSxrQ0FBa0M7QUFDekQsU0FBUyxVQUFVLFFBQVEsc0NBQXNDO0FBQ2pFLFNBQVMsT0FBTyxRQUFRLGtDQUFrQztBQUMxRCxTQUFTLGlCQUFpQixRQUFRLG9DQUFvQztBQUN0RSxTQUFTLElBQUksRUFBRSxRQUFRLFFBQVEsWUFBWTtBQUMzQyxTQUFTLE1BQU0sUUFBUSxtQ0FBbUM7QUFDMUQsU0FBUyxZQUFZLFFBQVEsdUJBQXVCO0FBQ3BELFNBQ0UsZUFBZSxFQUNmLG1CQUFtQixRQUVkLDBCQUEwQjtBQUlqQyxNQUFNLFlBQVksS0FBSyxLQUFLLENBQUMsRUFBRSxLQUFLO0FBcUNwQyxTQUFTLE1BQU0sSUFBWTtFQUN6QixNQUFNLElBQUksa0JBQWtCLE1BQU07RUFDbEMsTUFBTSxXQUFXLEtBQ2QsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sSUFDeEMsS0FBSyxDQUFDO0VBQ1QsTUFBTSxjQUFjLFdBQVc7RUFDL0IsT0FBTztJQUNMO0lBQ0EsWUFBWTtJQUNaLGdCQUFnQixDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFD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
// denoCacheMetadata=10579598493307514726,4532638771647714464