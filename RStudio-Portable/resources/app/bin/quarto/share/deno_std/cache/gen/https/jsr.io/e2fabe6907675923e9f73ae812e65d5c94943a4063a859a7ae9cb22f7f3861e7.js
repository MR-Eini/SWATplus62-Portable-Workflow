// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// Documentation and interface for walk were adapted from Go
// https://golang.org/pkg/path/filepath/#Walk
// Copyright 2009 The Go Authors. All rights reserved. BSD license.
import { join } from "jsr:/@std/path@^0.224.0/join";
import { normalize } from "jsr:/@std/path@^0.224.0/normalize";
import { toPathString } from "./_to_path_string.ts";
import { createWalkEntry, createWalkEntrySync } from "./_create_walk_entry.ts";
/** Error thrown in {@linkcode walk} or {@linkcode walkSync} during iteration. */ export class WalkError extends Error {
  /** File path of the root that's being walked. */ root;
  /** Constructs a new instance. */ constructor(cause, root){
    super(`${cause instanceof Error ? cause.message : cause} for path "${root}"`);
    this.cause = cause;
    this.name = this.constructor.name;
    this.root = root;
  }
}
function include(path, exts, match, skip) {
  if (exts && !exts.some((ext)=>path.endsWith(ext))) {
    return false;
  }
  if (match && !match.some((pattern)=>!!path.match(pattern))) {
    return false;
  }
  if (skip && skip.some((pattern)=>!!path.match(pattern))) {
    return false;
  }
  return true;
}
function wrapErrorWithPath(err, root) {
  if (err instanceof WalkError) return err;
  return new WalkError(err, root);
}
/**
 * Recursively walks through a directory and yields information about each file
 * and directory encountered.
 *
 * @param root The root directory to start the walk from, as a string or URL.
 * @param options The options for the walk.
 * @returns An async iterable iterator that yields `WalkEntry` objects.
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
 * import { walk } from "@std/fs/walk";
 *
 * const entries = [];
 * for await (const entry of walk(".")) {
 *   entries.push(entry);
 * }
 *
 * entries[0]!.path; // "folder"
 * entries[0]!.name; // "folder"
 * entries[0]!.isFile; // false
 * entries[0]!.isDirectory; // true
 * entries[0]!.isSymlink; // false
 *
 * entries[1]!.path; // "folder/script.ts"
 * entries[1]!.name; // "script.ts"
 * entries[1]!.isFile; // true
 * entries[1]!.isDirectory; // false
 * entries[1]!.isSymlink; // false
 * ```
 */ export async function* walk(root, { maxDepth = Infinity, includeFiles = true, includeDirs = true, includeSymlinks = true, followSymlinks = false, canonicalize = true, exts = undefined, match = undefined, skip = undefined } = {}) {
  if (maxDepth < 0) {
    return;
  }
  root = toPathString(root);
  if (includeDirs && include(root, exts, match, skip)) {
    yield await createWalkEntry(root);
  }
  if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
    return;
  }
  try {
    for await (const entry of Deno.readDir(root)){
      let path = join(root, entry.name);
      let { isSymlink, isDirectory } = entry;
      if (isSymlink) {
        if (!followSymlinks) {
          if (includeSymlinks && include(path, exts, match, skip)) {
            yield {
              path,
              ...entry
            };
          }
          continue;
        }
        const realPath = await Deno.realPath(path);
        if (canonicalize) {
          path = realPath;
        }
        // Caveat emptor: don't assume |path| is not a symlink. realpath()
        // resolves symlinks but another process can replace the file system
        // entity with a different type of entity before we call lstat().
        ({ isSymlink, isDirectory } = await Deno.lstat(realPath));
      }
      if (isSymlink || isDirectory) {
        yield* walk(path, {
          maxDepth: maxDepth - 1,
          includeFiles,
          includeDirs,
          includeSymlinks,
          followSymlinks,
          exts,
          match,
          skip
        });
      } else if (includeFiles && include(path, exts, match, skip)) {
        yield {
          path,
          ...entry
        };
      }
    }
  } catch (err) {
    throw wrapErrorWithPath(err, normalize(root));
  }
}
/** Same as {@linkcode walk} but uses synchronous ops */ export function* walkSync(root, { maxDepth = Infinity, includeFiles = true, includeDirs = true, includeSymlinks = true, followSymlinks = false, canonicalize = true, exts = undefined, match = undefined, skip = undefined } = {}) {
  root = toPathString(root);
  if (maxDepth < 0) {
    return;
  }
  if (includeDirs && include(root, exts, match, skip)) {
    yield createWalkEntrySync(root);
  }
  if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
    return;
  }
  let entries;
  try {
    entries = Deno.readDirSync(root);
  } catch (err) {
    throw wrapErrorWithPath(err, normalize(root));
  }
  for (const entry of entries){
    let path = join(root, entry.name);
    let { isSymlink, isDirectory } = entry;
    if (isSymlink) {
      if (!followSymlinks) {
        if (includeSymlinks && include(path, exts, match, skip)) {
          yield {
            path,
            ...entry
          };
        }
        continue;
      }
      const realPath = Deno.realPathSync(path);
      if (canonicalize) {
        path = realPath;
      }
      // Caveat emptor: don't assume |path| is not a symlink. realpath()
      // resolves symlinks but another process can replace the file system
      // entity with a different type of entity before we call lstat().
      ({ isSymlink, isDirectory } = Deno.lstatSync(realPath));
    }
    if (isSymlink || isDirectory) {
      yield* walkSync(path, {
        maxDepth: maxDepth - 1,
        includeFiles,
        includeDirs,
        includeSymlinks,
        followSymlinks,
        exts,
        match,
        skip
      });
    } else if (includeFiles && include(path, exts, match, skip)) {
      yield {
        path,
        ...entry
      };
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZnMvMC4yMjQuMC93YWxrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBEb2N1bWVudGF0aW9uIGFuZCBpbnRlcmZhY2UgZm9yIHdhbGsgd2VyZSBhZGFwdGVkIGZyb20gR29cbi8vIGh0dHBzOi8vZ29sYW5nLm9yZy9wa2cvcGF0aC9maWxlcGF0aC8jV2Fsa1xuLy8gQ29weXJpZ2h0IDIwMDkgVGhlIEdvIEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEJTRCBsaWNlbnNlLlxuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJqc3I6L0BzdGQvcGF0aEBeMC4yMjQuMC9qb2luXCI7XG5pbXBvcnQgeyBub3JtYWxpemUgfSBmcm9tIFwianNyOi9Ac3RkL3BhdGhAXjAuMjI0LjAvbm9ybWFsaXplXCI7XG5pbXBvcnQgeyB0b1BhdGhTdHJpbmcgfSBmcm9tIFwiLi9fdG9fcGF0aF9zdHJpbmcudHNcIjtcbmltcG9ydCB7XG4gIGNyZWF0ZVdhbGtFbnRyeSxcbiAgY3JlYXRlV2Fsa0VudHJ5U3luYyxcbiAgdHlwZSBXYWxrRW50cnksXG59IGZyb20gXCIuL19jcmVhdGVfd2Fsa19lbnRyeS50c1wiO1xuXG4vKiogRXJyb3IgdGhyb3duIGluIHtAbGlua2NvZGUgd2Fsa30gb3Ige0BsaW5rY29kZSB3YWxrU3luY30gZHVyaW5nIGl0ZXJhdGlvbi4gKi9cbmV4cG9ydCBjbGFzcyBXYWxrRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIC8qKiBGaWxlIHBhdGggb2YgdGhlIHJvb3QgdGhhdCdzIGJlaW5nIHdhbGtlZC4gKi9cbiAgcm9vdDogc3RyaW5nO1xuXG4gIC8qKiBDb25zdHJ1Y3RzIGEgbmV3IGluc3RhbmNlLiAqL1xuICBjb25zdHJ1Y3RvcihjYXVzZTogdW5rbm93biwgcm9vdDogc3RyaW5nKSB7XG4gICAgc3VwZXIoXG4gICAgICBgJHtjYXVzZSBpbnN0YW5jZW9mIEVycm9yID8gY2F1c2UubWVzc2FnZSA6IGNhdXNlfSBmb3IgcGF0aCBcIiR7cm9vdH1cImAsXG4gICAgKTtcbiAgICB0aGlzLmNhdXNlID0gY2F1c2U7XG4gICAgdGhpcy5uYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIHRoaXMucm9vdCA9IHJvb3Q7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5jbHVkZShcbiAgcGF0aDogc3RyaW5nLFxuICBleHRzPzogc3RyaW5nW10sXG4gIG1hdGNoPzogUmVnRXhwW10sXG4gIHNraXA/OiBSZWdFeHBbXSxcbik6IGJvb2xlYW4ge1xuICBpZiAoZXh0cyAmJiAhZXh0cy5zb21lKChleHQpOiBib29sZWFuID0+IHBhdGguZW5kc1dpdGgoZXh0KSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKG1hdGNoICYmICFtYXRjaC5zb21lKChwYXR0ZXJuKTogYm9vbGVhbiA9PiAhIXBhdGgubWF0Y2gocGF0dGVybikpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChza2lwICYmIHNraXAuc29tZSgocGF0dGVybik6IGJvb2xlYW4gPT4gISFwYXRoLm1hdGNoKHBhdHRlcm4pKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gd3JhcEVycm9yV2l0aFBhdGgoZXJyOiB1bmtub3duLCByb290OiBzdHJpbmcpIHtcbiAgaWYgKGVyciBpbnN0YW5jZW9mIFdhbGtFcnJvcikgcmV0dXJuIGVycjtcbiAgcmV0dXJuIG5ldyBXYWxrRXJyb3IoZXJyLCByb290KTtcbn1cblxuLyoqIE9wdGlvbnMgZm9yIHtAbGlua2NvZGUgd2Fsa30gYW5kIHtAbGlua2NvZGUgd2Fsa1N5bmN9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBXYWxrT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaGUgbWF4aW11bSBkZXB0aCBvZiB0aGUgZmlsZSB0cmVlIHRvIGJlIHdhbGtlZCByZWN1cnNpdmVseS5cbiAgICpcbiAgICogQGRlZmF1bHQge0luZmluaXR5fVxuICAgKi9cbiAgbWF4RGVwdGg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciBmaWxlIGVudHJpZXMgc2hvdWxkIGJlIGluY2x1ZGVkIG9yIG5vdC5cbiAgICpcbiAgICogQGRlZmF1bHQge3RydWV9XG4gICAqL1xuICBpbmNsdWRlRmlsZXM/OiBib29sZWFuO1xuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgZGlyZWN0b3J5IGVudHJpZXMgc2hvdWxkIGJlIGluY2x1ZGVkIG9yIG5vdC5cbiAgICpcbiAgICogQGRlZmF1bHQge3RydWV9XG4gICAqL1xuICBpbmNsdWRlRGlycz86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciBzeW1saW5rIGVudHJpZXMgc2hvdWxkIGJlIGluY2x1ZGVkIG9yIG5vdC5cbiAgICogVGhpcyBvcHRpb24gaXMgbWVhbmluZ2Z1bCBvbmx5IGlmIGBmb2xsb3dTeW1saW5rc2AgaXMgc2V0IHRvIGBmYWxzZWAuXG4gICAqXG4gICAqIEBkZWZhdWx0IHt0cnVlfVxuICAgKi9cbiAgaW5jbHVkZVN5bWxpbmtzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIHN5bWxpbmtzIHNob3VsZCBiZSByZXNvbHZlZCBvciBub3QuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtmYWxzZX1cbiAgICovXG4gIGZvbGxvd1N5bWxpbmtzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBmb2xsb3dlZCBzeW1saW5rJ3MgcGF0aCBzaG91bGQgYmUgY2Fub25pY2FsaXplZC5cbiAgICogVGhpcyBvcHRpb24gd29ya3Mgb25seSBpZiBgZm9sbG93U3ltbGlua3NgIGlzIG5vdCBgZmFsc2VgLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7dHJ1ZX1cbiAgICovXG4gIGNhbm9uaWNhbGl6ZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBMaXN0IG9mIGZpbGUgZXh0ZW5zaW9ucyB1c2VkIHRvIGZpbHRlciBlbnRyaWVzLlxuICAgKiBJZiBzcGVjaWZpZWQsIGVudHJpZXMgd2l0aG91dCB0aGUgZmlsZSBleHRlbnNpb24gc3BlY2lmaWVkIGJ5IHRoaXMgb3B0aW9uXG4gICAqIGFyZSBleGNsdWRlZC5cbiAgICpcbiAgICogQGRlZmF1bHQge3VuZGVmaW5lZH1cbiAgICovXG4gIGV4dHM/OiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIExpc3Qgb2YgcmVndWxhciBleHByZXNzaW9uIHBhdHRlcm5zIHVzZWQgdG8gZmlsdGVyIGVudHJpZXMuXG4gICAqIElmIHNwZWNpZmllZCwgZW50cmllcyB0aGF0IGRvIG5vdCBtYXRjaCB0aGUgcGF0dGVybnMgc3BlY2lmaWVkIGJ5IHRoaXNcbiAgICogb3B0aW9uIGFyZSBleGNsdWRlZC5cbiAgICpcbiAgICogQGRlZmF1bHQge3VuZGVmaW5lZH1cbiAgICovXG4gIG1hdGNoPzogUmVnRXhwW107XG4gIC8qKlxuICAgKiBMaXN0IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbiBwYXR0ZXJucyB1c2VkIHRvIGZpbHRlciBlbnRyaWVzLlxuICAgKiBJZiBzcGVjaWZpZWQsIGVudHJpZXMgbWF0Y2hpbmcgdGhlIHBhdHRlcm5zIHNwZWNpZmllZCBieSB0aGlzIG9wdGlvbiBhcmVcbiAgICogZXhjbHVkZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IHt1bmRlZmluZWR9XG4gICAqL1xuICBza2lwPzogUmVnRXhwW107XG59XG5leHBvcnQgdHlwZSB7IFdhbGtFbnRyeSB9O1xuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IHdhbGtzIHRocm91Z2ggYSBkaXJlY3RvcnkgYW5kIHlpZWxkcyBpbmZvcm1hdGlvbiBhYm91dCBlYWNoIGZpbGVcbiAqIGFuZCBkaXJlY3RvcnkgZW5jb3VudGVyZWQuXG4gKlxuICogQHBhcmFtIHJvb3QgVGhlIHJvb3QgZGlyZWN0b3J5IHRvIHN0YXJ0IHRoZSB3YWxrIGZyb20sIGFzIGEgc3RyaW5nIG9yIFVSTC5cbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBvcHRpb25zIGZvciB0aGUgd2Fsay5cbiAqIEByZXR1cm5zIEFuIGFzeW5jIGl0ZXJhYmxlIGl0ZXJhdG9yIHRoYXQgeWllbGRzIGBXYWxrRW50cnlgIG9iamVjdHMuXG4gKlxuICogQGV4YW1wbGUgQmFzaWMgdXNhZ2VcbiAqXG4gKiBGaWxlIHN0cnVjdHVyZTpcbiAqIGBgYFxuICogZm9sZGVyXG4gKiDilJzilIDilIAgc2NyaXB0LnRzXG4gKiDilJTilIDilIAgZm9vLnRzXG4gKiBgYGBcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgd2FsayB9IGZyb20gXCJAc3RkL2ZzL3dhbGtcIjtcbiAqXG4gKiBjb25zdCBlbnRyaWVzID0gW107XG4gKiBmb3IgYXdhaXQgKGNvbnN0IGVudHJ5IG9mIHdhbGsoXCIuXCIpKSB7XG4gKiAgIGVudHJpZXMucHVzaChlbnRyeSk7XG4gKiB9XG4gKlxuICogZW50cmllc1swXSEucGF0aDsgLy8gXCJmb2xkZXJcIlxuICogZW50cmllc1swXSEubmFtZTsgLy8gXCJmb2xkZXJcIlxuICogZW50cmllc1swXSEuaXNGaWxlOyAvLyBmYWxzZVxuICogZW50cmllc1swXSEuaXNEaXJlY3Rvcnk7IC8vIHRydWVcbiAqIGVudHJpZXNbMF0hLmlzU3ltbGluazsgLy8gZmFsc2VcbiAqXG4gKiBlbnRyaWVzWzFdIS5wYXRoOyAvLyBcImZvbGRlci9zY3JpcHQudHNcIlxuICogZW50cmllc1sxXSEubmFtZTsgLy8gXCJzY3JpcHQudHNcIlxuICogZW50cmllc1sxXSEuaXNGaWxlOyAvLyB0cnVlXG4gKiBlbnRyaWVzWzFdIS5pc0RpcmVjdG9yeTsgLy8gZmFsc2VcbiAqIGVudHJpZXNbMV0hLmlzU3ltbGluazsgLy8gZmFsc2VcbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24qIHdhbGsoXG4gIHJvb3Q6IHN0cmluZyB8IFVSTCxcbiAge1xuICAgIG1heERlcHRoID0gSW5maW5pdHksXG4gICAgaW5jbHVkZUZpbGVzID0gdHJ1ZSxcbiAgICBpbmNsdWRlRGlycyA9IHRydWUsXG4gICAgaW5jbHVkZVN5bWxpbmtzID0gdHJ1ZSxcbiAgICBmb2xsb3dTeW1saW5rcyA9IGZhbHNlLFxuICAgIGNhbm9uaWNhbGl6ZSA9IHRydWUsXG4gICAgZXh0cyA9IHVuZGVmaW5lZCxcbiAgICBtYXRjaCA9IHVuZGVmaW5lZCxcbiAgICBza2lwID0gdW5kZWZpbmVkLFxuICB9OiBXYWxrT3B0aW9ucyA9IHt9LFxuKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFdhbGtFbnRyeT4ge1xuICBpZiAobWF4RGVwdGggPCAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJvb3QgPSB0b1BhdGhTdHJpbmcocm9vdCk7XG4gIGlmIChpbmNsdWRlRGlycyAmJiBpbmNsdWRlKHJvb3QsIGV4dHMsIG1hdGNoLCBza2lwKSkge1xuICAgIHlpZWxkIGF3YWl0IGNyZWF0ZVdhbGtFbnRyeShyb290KTtcbiAgfVxuICBpZiAobWF4RGVwdGggPCAxIHx8ICFpbmNsdWRlKHJvb3QsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBza2lwKSkge1xuICAgIHJldHVybjtcbiAgfVxuICB0cnkge1xuICAgIGZvciBhd2FpdCAoY29uc3QgZW50cnkgb2YgRGVuby5yZWFkRGlyKHJvb3QpKSB7XG4gICAgICBsZXQgcGF0aCA9IGpvaW4ocm9vdCwgZW50cnkubmFtZSk7XG5cbiAgICAgIGxldCB7IGlzU3ltbGluaywgaXNEaXJlY3RvcnkgfSA9IGVudHJ5O1xuXG4gICAgICBpZiAoaXNTeW1saW5rKSB7XG4gICAgICAgIGlmICghZm9sbG93U3ltbGlua3MpIHtcbiAgICAgICAgICBpZiAoaW5jbHVkZVN5bWxpbmtzICYmIGluY2x1ZGUocGF0aCwgZXh0cywgbWF0Y2gsIHNraXApKSB7XG4gICAgICAgICAgICB5aWVsZCB7IHBhdGgsIC4uLmVudHJ5IH07XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlYWxQYXRoID0gYXdhaXQgRGVuby5yZWFsUGF0aChwYXRoKTtcbiAgICAgICAgaWYgKGNhbm9uaWNhbGl6ZSkge1xuICAgICAgICAgIHBhdGggPSByZWFsUGF0aDtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYXZlYXQgZW1wdG9yOiBkb24ndCBhc3N1bWUgfHBhdGh8IGlzIG5vdCBhIHN5bWxpbmsuIHJlYWxwYXRoKClcbiAgICAgICAgLy8gcmVzb2x2ZXMgc3ltbGlua3MgYnV0IGFub3RoZXIgcHJvY2VzcyBjYW4gcmVwbGFjZSB0aGUgZmlsZSBzeXN0ZW1cbiAgICAgICAgLy8gZW50aXR5IHdpdGggYSBkaWZmZXJlbnQgdHlwZSBvZiBlbnRpdHkgYmVmb3JlIHdlIGNhbGwgbHN0YXQoKS5cbiAgICAgICAgKHsgaXNTeW1saW5rLCBpc0RpcmVjdG9yeSB9ID0gYXdhaXQgRGVuby5sc3RhdChyZWFsUGF0aCkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNTeW1saW5rIHx8IGlzRGlyZWN0b3J5KSB7XG4gICAgICAgIHlpZWxkKiB3YWxrKHBhdGgsIHtcbiAgICAgICAgICBtYXhEZXB0aDogbWF4RGVwdGggLSAxLFxuICAgICAgICAgIGluY2x1ZGVGaWxlcyxcbiAgICAgICAgICBpbmNsdWRlRGlycyxcbiAgICAgICAgICBpbmNsdWRlU3ltbGlua3MsXG4gICAgICAgICAgZm9sbG93U3ltbGlua3MsXG4gICAgICAgICAgZXh0cyxcbiAgICAgICAgICBtYXRjaCxcbiAgICAgICAgICBza2lwLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoaW5jbHVkZUZpbGVzICYmIGluY2x1ZGUocGF0aCwgZXh0cywgbWF0Y2gsIHNraXApKSB7XG4gICAgICAgIHlpZWxkIHsgcGF0aCwgLi4uZW50cnkgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IHdyYXBFcnJvcldpdGhQYXRoKGVyciwgbm9ybWFsaXplKHJvb3QpKTtcbiAgfVxufVxuXG4vKiogU2FtZSBhcyB7QGxpbmtjb2RlIHdhbGt9IGJ1dCB1c2VzIHN5bmNocm9ub3VzIG9wcyAqL1xuZXhwb3J0IGZ1bmN0aW9uKiB3YWxrU3luYyhcbiAgcm9vdDogc3RyaW5nIHwgVVJMLFxuICB7XG4gICAgbWF4RGVwdGggPSBJbmZpbml0eSxcbiAgICBpbmNsdWRlRmlsZXMgPSB0cnVlLFxuICAgIGluY2x1ZGVEaXJzID0gdHJ1ZSxcbiAgICBpbmNsdWRlU3ltbGlua3MgPSB0cnVlLFxuICAgIGZvbGxvd1N5bWxpbmtzID0gZmFsc2UsXG4gICAgY2Fub25pY2FsaXplID0gdHJ1ZSxcbiAgICBleHRzID0gdW5kZWZpbmVkLFxuICAgIG1hdGNoID0gdW5kZWZpbmVkLFxuICAgIHNraXAgPSB1bmRlZmluZWQsXG4gIH06IFdhbGtPcHRpb25zID0ge30sXG4pOiBJdGVyYWJsZUl0ZXJhdG9yPFdhbGtFbnRyeT4ge1xuICByb290ID0gdG9QYXRoU3RyaW5nKHJvb3QpO1xuICBpZiAobWF4RGVwdGggPCAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChpbmNsdWRlRGlycyAmJiBpbmNsdWRlKHJvb3QsIGV4dHMsIG1hdGNoLCBza2lwKSkge1xuICAgIHlpZWxkIGNyZWF0ZVdhbGtFbnRyeVN5bmMocm9vdCk7XG4gIH1cbiAgaWYgKG1heERlcHRoIDwgMSB8fCAhaW5jbHVkZShyb290LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgc2tpcCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGVudHJpZXM7XG4gIHRyeSB7XG4gICAgZW50cmllcyA9IERlbm8ucmVhZERpclN5bmMocm9vdCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IHdyYXBFcnJvcldpdGhQYXRoKGVyciwgbm9ybWFsaXplKHJvb3QpKTtcbiAgfVxuICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICBsZXQgcGF0aCA9IGpvaW4ocm9vdCwgZW50cnkubmFtZSk7XG5cbiAgICBsZXQgeyBpc1N5bWxpbmssIGlzRGlyZWN0b3J5IH0gPSBlbnRyeTtcblxuICAgIGlmIChpc1N5bWxpbmspIHtcbiAgICAgIGlmICghZm9sbG93U3ltbGlua3MpIHtcbiAgICAgICAgaWYgKGluY2x1ZGVTeW1saW5rcyAmJiBpbmNsdWRlKHBhdGgsIGV4dHMsIG1hdGNoLCBza2lwKSkge1xuICAgICAgICAgIHlpZWxkIHsgcGF0aCwgLi4uZW50cnkgfTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlYWxQYXRoID0gRGVuby5yZWFsUGF0aFN5bmMocGF0aCk7XG4gICAgICBpZiAoY2Fub25pY2FsaXplKSB7XG4gICAgICAgIHBhdGggPSByZWFsUGF0aDtcbiAgICAgIH1cbiAgICAgIC8vIENhdmVhdCBlbXB0b3I6IGRvbid0IGFzc3VtZSB8cGF0aHwgaXMgbm90IGEgc3ltbGluay4gcmVhbHBhdGgoKVxuICAgICAgLy8gcmVzb2x2ZXMgc3ltbGlua3MgYnV0IGFub3RoZXIgcHJvY2VzcyBjYW4gcmVwbGFjZSB0aGUgZmlsZSBzeXN0ZW1cbiAgICAgIC8vIGVudGl0eSB3aXRoIGEgZGlmZmVyZW50IHR5cGUgb2YgZW50aXR5IGJlZm9yZSB3ZSBjYWxsIGxzdGF0KCkuXG4gICAgICAoeyBpc1N5bWxpbmssIGlzRGlyZWN0b3J5IH0gPSBEZW5vLmxzdGF0U3luYyhyZWFsUGF0aCkpO1xuICAgIH1cblxuICAgIGlmIChpc1N5bWxpbmsgfHwgaXNEaXJlY3RvcnkpIHtcbiAgICAgIHlpZWxkKiB3YWxrU3luYyhwYXRoLCB7XG4gICAgICAgIG1heERlcHRoOiBtYXhEZXB0aCAtIDEsXG4gICAgICAgIGluY2x1ZGVGaWxlcyxcbiAgICAgICAgaW5jbHVkZURpcnMsXG4gICAgICAgIGluY2x1ZGVTeW1saW5rcyxcbiAgICAgICAgZm9sbG93U3ltbGlua3MsXG4gICAgICAgIGV4dHMsXG4gICAgICAgIG1hdGNoLFxuICAgICAgICBza2lwLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChpbmNsdWRlRmlsZXMgJiYgaW5jbHVkZShwYXRoLCBleHRzLCBtYXRjaCwgc2tpcCkpIHtcbiAgICAgIHlpZWxkIHsgcGF0aCwgLi4uZW50cnkgfTtcbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsNERBQTREO0FBQzVELDZDQUE2QztBQUM3QyxtRUFBbUU7QUFDbkUsU0FBUyxJQUFJLFFBQVEsK0JBQStCO0FBQ3BELFNBQVMsU0FBUyxRQUFRLG9DQUFvQztBQUM5RCxTQUFTLFlBQVksUUFBUSx1QkFBdUI7QUFDcEQsU0FDRSxlQUFlLEVBQ2YsbUJBQW1CLFFBRWQsMEJBQTBCO0FBRWpDLCtFQUErRSxHQUMvRSxPQUFPLE1BQU0sa0JBQWtCO0VBQzdCLCtDQUErQyxHQUMvQyxLQUFhO0VBRWIsK0JBQStCLEdBQy9CLFlBQVksS0FBYyxFQUFFLElBQVksQ0FBRTtJQUN4QyxLQUFLLENBQ0gsR0FBRyxpQkFBaUIsUUFBUSxNQUFNLE9BQU8sR0FBRyxNQUFNLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUV4RSxJQUFJLENBQUMsS0FBSyxHQUFHO0lBQ2IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUk7SUFDakMsSUFBSSxDQUFDLElBQUksR0FBRztFQUNkO0FBQ0Y7QUFFQSxTQUFTLFFBQ1AsSUFBWSxFQUNaLElBQWUsRUFDZixLQUFnQixFQUNoQixJQUFlO0VBRWYsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxNQUFpQixLQUFLLFFBQVEsQ0FBQyxPQUFPO0lBQzVELE9BQU87RUFDVDtFQUNBLElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBcUIsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLFdBQVc7SUFDckUsT0FBTztFQUNUO0VBQ0EsSUFBSSxRQUFRLEtBQUssSUFBSSxDQUFDLENBQUMsVUFBcUIsQ0FBQyxDQUFDLEtBQUss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
// denoCacheMetadata=381916451207537199,9662937840577070190