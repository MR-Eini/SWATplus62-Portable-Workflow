// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Provides functions for dealing with and matching ETags, including
 * {@linkcode calculate} to calculate an etag for a given entity,
 * {@linkcode ifMatch} for validating if an ETag matches against a `If-Match`
 * header and {@linkcode ifNoneMatch} for validating an Etag against an
 * `If-None-Match` header.
 *
 * See further information on the `ETag` header on
 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag | MDN}.
 *
 * @module
 */ import { encodeBase64 as base64Encode } from "jsr:/@std/encoding@1.0.0-rc.2/base64";
const encoder = new TextEncoder();
const DEFAULT_ALGORITHM = "SHA-256";
function isFileInfo(value) {
  return Boolean(value && typeof value === "object" && "mtime" in value && "size" in value);
}
async function calcEntity(entity, { algorithm = DEFAULT_ALGORITHM }) {
  // a short circuit for zero length entities
  if (entity.length === 0) {
    return `0-47DEQpj8HBSa+/TImW+5JCeuQeR`;
  }
  if (typeof entity === "string") {
    entity = encoder.encode(entity);
  }
  const hash = base64Encode(await crypto.subtle.digest(algorithm, entity)).substring(0, 27);
  return `${entity.length.toString(16)}-${hash}`;
}
async function calcFileInfo(fileInfo, { algorithm = DEFAULT_ALGORITHM }) {
  if (fileInfo.mtime) {
    const hash = base64Encode(await crypto.subtle.digest(algorithm, encoder.encode(fileInfo.mtime.toJSON()))).substring(0, 27);
    return `${fileInfo.size.toString(16)}-${hash}`;
  }
}
/**
 * Calculate an ETag for an entity. When the entity is a specific set of data
 * it will be fingerprinted as a "strong" tag, otherwise if it is just file
 * information, it will be calculated as a weak tag.
 *
 * @example Usage
 * ```ts
 * import { calculate } from "@std/http/etag";
 * import { assert } from "@std/assert/assert";
 *
 * const body = "hello deno!";
 *
 * const etag = await calculate(body);
 * assert(etag);
 *
 * const res = new Response(body, { headers: { etag } });
 * ```
 *
 * @param entity The entity to get the ETag for.
 * @param options Various additional options.
 * @returns The calculated ETag.
 */ export async function calculate(entity, options = {}) {
  const weak = options.weak ?? isFileInfo(entity);
  const tag = await (isFileInfo(entity) ? calcFileInfo(entity, options) : calcEntity(entity, options));
  return tag ? weak ? `W/"${tag}"` : `"${tag}"` : undefined;
}
/** A helper function that takes the value from the `If-Match` header and a
 * calculated etag for the target. By using strong comparison, return `true` if
 * the values match, otherwise `false`.
 *
 * See MDN's [`If-Match`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match)
 * article for more information on how to use this function.
 *
 * @example Usage
 * ```ts no-eval
 * import {
 *   calculate,
 *   ifMatch,
 * } from "@std/http/etag";
 * import { assert } from "@std/assert/assert"
 *
 * const body = "hello deno!";
 *
 * Deno.serve(async (req) => {
 *   const ifMatchValue = req.headers.get("if-match");
 *   const etag = await calculate(body);
 *   assert(etag);
 *   if (!ifMatchValue || ifMatch(ifMatchValue, etag)) {
 *     return new Response(body, { status: 200, headers: { etag } });
 *   } else {
 *     return new Response(null, { status: 412, statusText: "Precondition Failed"});
 *   }
 * });
 * ```
 *
 * @param value the If-Match header value.
 * @param etag the ETag to check against.
 * @returns whether or not the parameters match.
 */ export function ifMatch(value, etag) {
  // Weak tags cannot be matched and return false.
  if (!value || !etag || etag.startsWith("W/")) {
    return false;
  }
  if (value.trim() === "*") {
    return true;
  }
  const tags = value.split(/\s*,\s*/);
  return tags.includes(etag);
}
/** A helper function that takes the value from the `If-None-Match` header and
 * a calculated etag for the target entity and returns `false` if the etag for
 * the entity matches the supplied value, otherwise `true`.
 *
 * See MDN's [`If-None-Match`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match)
 * article for more information on how to use this function.
 *
 * @example Usage
 * ```ts no-eval
 * import {
 *   calculate,
 *   ifNoneMatch,
 * } from "@std/http/etag";
 * import { assert } from "@std/assert/assert"
 *
 * const body = "hello deno!";
 *
 * Deno.serve(async (req) => {
 *   const ifNoneMatchValue = req.headers.get("if-none-match");
 *   const etag = await calculate(body);
 *   assert(etag);
 *   if (!ifNoneMatch(ifNoneMatchValue, etag)) {
 *     return new Response(null, { status: 304, headers: { etag } });
 *   } else {
 *     return new Response(body, { status: 200, headers: { etag } });
 *   }
 * });
 * ```
 *
 * @param value the If-None-Match header value.
 * @param etag the ETag to check against.
 * @returns whether or not the parameters do not match.
 */ export function ifNoneMatch(value, etag) {
  if (!value || !etag) {
    return true;
  }
  if (value.trim() === "*") {
    return false;
  }
  etag = etag.startsWith("W/") ? etag.slice(2) : etag;
  const tags = value.split(/\s*,\s*/).map((tag)=>tag.startsWith("W/") ? tag.slice(2) : tag);
  return !tags.includes(etag);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaHR0cC8wLjIyNC41L2V0YWcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBQcm92aWRlcyBmdW5jdGlvbnMgZm9yIGRlYWxpbmcgd2l0aCBhbmQgbWF0Y2hpbmcgRVRhZ3MsIGluY2x1ZGluZ1xuICoge0BsaW5rY29kZSBjYWxjdWxhdGV9IHRvIGNhbGN1bGF0ZSBhbiBldGFnIGZvciBhIGdpdmVuIGVudGl0eSxcbiAqIHtAbGlua2NvZGUgaWZNYXRjaH0gZm9yIHZhbGlkYXRpbmcgaWYgYW4gRVRhZyBtYXRjaGVzIGFnYWluc3QgYSBgSWYtTWF0Y2hgXG4gKiBoZWFkZXIgYW5kIHtAbGlua2NvZGUgaWZOb25lTWF0Y2h9IGZvciB2YWxpZGF0aW5nIGFuIEV0YWcgYWdhaW5zdCBhblxuICogYElmLU5vbmUtTWF0Y2hgIGhlYWRlci5cbiAqXG4gKiBTZWUgZnVydGhlciBpbmZvcm1hdGlvbiBvbiB0aGUgYEVUYWdgIGhlYWRlciBvblxuICoge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0hUVFAvSGVhZGVycy9FVGFnIHwgTUROfS5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0IHsgZW5jb2RlQmFzZTY0IGFzIGJhc2U2NEVuY29kZSB9IGZyb20gXCJqc3I6L0BzdGQvZW5jb2RpbmdAMS4wLjAtcmMuMi9iYXNlNjRcIjtcblxuLyoqXG4gKiBKdXN0IHRoZSBwYXJ0IG9mIHtAbGlua2NvZGUgRGVuby5GaWxlSW5mb30gdGhhdCBpcyByZXF1aXJlZCB0byBjYWxjdWxhdGUgYW4gYEVUYWdgLFxuICogc28gcGFydGlhbCBvciB1c2VyIGdlbmVyYXRlZCBmaWxlIGluZm9ybWF0aW9uIGNhbiBiZSBwYXNzZWQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZUluZm8ge1xuICAvKiogVGhlIGxhc3QgbW9kaWZpY2F0aW9uIHRpbWUgb2YgdGhlIGZpbGUuIFRoaXMgY29ycmVzcG9uZHMgdG8gdGhlIGBtdGltZWBcbiAgICogZmllbGQgZnJvbSBgc3RhdGAgb24gTGludXgvTWFjIE9TIGFuZCBgZnRMYXN0V3JpdGVUaW1lYCBvbiBXaW5kb3dzLiBUaGlzXG4gICAqIG1heSBub3QgYmUgYXZhaWxhYmxlIG9uIGFsbCBwbGF0Zm9ybXMuICovXG4gIG10aW1lOiBEYXRlIHwgbnVsbDtcbiAgLyoqIFRoZSBzaXplIG9mIHRoZSBmaWxlLCBpbiBieXRlcy4gKi9cbiAgc2l6ZTogbnVtYmVyO1xufVxuXG4vKiogUmVwcmVzZW50cyBhbiBlbnRpdHkgdGhhdCBjYW4gYmUgdXNlZCBmb3IgZ2VuZXJhdGluZyBhbiBFVGFnLiAqL1xuZXhwb3J0IHR5cGUgRW50aXR5ID0gc3RyaW5nIHwgVWludDhBcnJheSB8IEZpbGVJbmZvO1xuXG5jb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG5cbmNvbnN0IERFRkFVTFRfQUxHT1JJVEhNOiBBbGdvcml0aG1JZGVudGlmaWVyID0gXCJTSEEtMjU2XCI7XG5cbi8qKiBPcHRpb25zIGZvciB7QGxpbmtjb2RlIGNhbGN1bGF0ZX0uICovXG5leHBvcnQgaW50ZXJmYWNlIEVUYWdPcHRpb25zIHtcbiAgLyoqXG4gICAqIEEgZGlnZXN0IGFsZ29yaXRobSB0byB1c2UgdG8gY2FsY3VsYXRlIHRoZSBldGFnLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7XCJTSEEtMjU2XCJ9XG4gICAqL1xuICBhbGdvcml0aG0/OiBBbGdvcml0aG1JZGVudGlmaWVyO1xuXG4gIC8qKiBPdmVycmlkZSB0aGUgZGVmYXVsdCBiZWhhdmlvciBvZiBjYWxjdWxhdGluZyB0aGUgYEVUYWdgLCBlaXRoZXIgZm9yY2luZ1xuICAgKiBhIHRhZyB0byBiZSBsYWJlbGxlZCB3ZWFrIG9yIG5vdC4gKi9cbiAgd2Vhaz86IGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIGlzRmlsZUluZm8odmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBGaWxlSW5mbyB7XG4gIHJldHVybiBCb29sZWFuKFxuICAgIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiBcIm10aW1lXCIgaW4gdmFsdWUgJiYgXCJzaXplXCIgaW4gdmFsdWUsXG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhbGNFbnRpdHkoXG4gIGVudGl0eTogc3RyaW5nIHwgVWludDhBcnJheSxcbiAgeyBhbGdvcml0aG0gPSBERUZBVUxUX0FMR09SSVRITSB9OiBFVGFnT3B0aW9ucyxcbikge1xuICAvLyBhIHNob3J0IGNpcmN1aXQgZm9yIHplcm8gbGVuZ3RoIGVudGl0aWVzXG4gIGlmIChlbnRpdHkubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGAwLTQ3REVRcGo4SEJTYSsvVEltVys1SkNldVFlUmA7XG4gIH1cblxuICBpZiAodHlwZW9mIGVudGl0eSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGVudGl0eSA9IGVuY29kZXIuZW5jb2RlKGVudGl0eSk7XG4gIH1cblxuICBjb25zdCBoYXNoID0gYmFzZTY0RW5jb2RlKGF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KGFsZ29yaXRobSwgZW50aXR5KSlcbiAgICAuc3Vic3RyaW5nKDAsIDI3KTtcblxuICByZXR1cm4gYCR7ZW50aXR5Lmxlbmd0aC50b1N0cmluZygxNil9LSR7aGFzaH1gO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjYWxjRmlsZUluZm8oXG4gIGZpbGVJbmZvOiBGaWxlSW5mbyxcbiAgeyBhbGdvcml0aG0gPSBERUZBVUxUX0FMR09SSVRITSB9OiBFVGFnT3B0aW9ucyxcbikge1xuICBpZiAoZmlsZUluZm8ubXRpbWUpIHtcbiAgICBjb25zdCBoYXNoID0gYmFzZTY0RW5jb2RlKFxuICAgICAgYXdhaXQgY3J5cHRvLnN1YnRsZS5kaWdlc3QoXG4gICAgICAgIGFsZ29yaXRobSxcbiAgICAgICAgZW5jb2Rlci5lbmNvZGUoZmlsZUluZm8ubXRpbWUudG9KU09OKCkpLFxuICAgICAgKSxcbiAgICApLnN1YnN0cmluZygwLCAyNyk7XG4gICAgcmV0dXJuIGAke2ZpbGVJbmZvLnNpemUudG9TdHJpbmcoMTYpfS0ke2hhc2h9YDtcbiAgfVxufVxuXG4vKipcbiAqIENhbGN1bGF0ZSBhbiBFVGFnIGZvciBhbiBlbnRpdHkuIFdoZW4gdGhlIGVudGl0eSBpcyBhIHNwZWNpZmljIHNldCBvZiBkYXRhXG4gKiBpdCB3aWxsIGJlIGZpbmdlcnByaW50ZWQgYXMgYSBcInN0cm9uZ1wiIHRhZywgb3RoZXJ3aXNlIGlmIGl0IGlzIGp1c3QgZmlsZVxuICogaW5mb3JtYXRpb24sIGl0IHdpbGwgYmUgY2FsY3VsYXRlZCBhcyBhIHdlYWsgdGFnLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY2FsY3VsYXRlIH0gZnJvbSBcIkBzdGQvaHR0cC9ldGFnXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3QgYm9keSA9IFwiaGVsbG8gZGVubyFcIjtcbiAqXG4gKiBjb25zdCBldGFnID0gYXdhaXQgY2FsY3VsYXRlKGJvZHkpO1xuICogYXNzZXJ0KGV0YWcpO1xuICpcbiAqIGNvbnN0IHJlcyA9IG5ldyBSZXNwb25zZShib2R5LCB7IGhlYWRlcnM6IHsgZXRhZyB9IH0pO1xuICogYGBgXG4gKlxuICogQHBhcmFtIGVudGl0eSBUaGUgZW50aXR5IHRvIGdldCB0aGUgRVRhZyBmb3IuXG4gKiBAcGFyYW0gb3B0aW9ucyBWYXJpb3VzIGFkZGl0aW9uYWwgb3B0aW9ucy5cbiAqIEByZXR1cm5zIFRoZSBjYWxjdWxhdGVkIEVUYWcuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxjdWxhdGUoXG4gIGVudGl0eTogRW50aXR5LFxuICBvcHRpb25zOiBFVGFnT3B0aW9ucyA9IHt9LFxuKTogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+IHtcbiAgY29uc3Qgd2VhayA9IG9wdGlvbnMud2VhayA/PyBpc0ZpbGVJbmZvKGVudGl0eSk7XG4gIGNvbnN0IHRhZyA9XG4gICAgYXdhaXQgKGlzRmlsZUluZm8oZW50aXR5KVxuICAgICAgPyBjYWxjRmlsZUluZm8oZW50aXR5LCBvcHRpb25zKVxuICAgICAgOiBjYWxjRW50aXR5KGVudGl0eSwgb3B0aW9ucykpO1xuXG4gIHJldHVybiB0YWcgPyB3ZWFrID8gYFcvXCIke3RhZ31cImAgOiBgXCIke3RhZ31cImAgOiB1bmRlZmluZWQ7XG59XG5cbi8qKiBBIGhlbHBlciBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSB2YWx1ZSBmcm9tIHRoZSBgSWYtTWF0Y2hgIGhlYWRlciBhbmQgYVxuICogY2FsY3VsYXRlZCBldGFnIGZvciB0aGUgdGFyZ2V0LiBCeSB1c2luZyBzdHJvbmcgY29tcGFyaXNvbiwgcmV0dXJuIGB0cnVlYCBpZlxuICogdGhlIHZhbHVlcyBtYXRjaCwgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gKlxuICogU2VlIE1ETidzIFtgSWYtTWF0Y2hgXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVFRQL0hlYWRlcnMvSWYtTWF0Y2gpXG4gKiBhcnRpY2xlIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0byB1c2UgdGhpcyBmdW5jdGlvbi5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHtcbiAqICAgY2FsY3VsYXRlLFxuICogICBpZk1hdGNoLFxuICogfSBmcm9tIFwiQHN0ZC9odHRwL2V0YWdcIjtcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnRcIlxuICpcbiAqIGNvbnN0IGJvZHkgPSBcImhlbGxvIGRlbm8hXCI7XG4gKlxuICogRGVuby5zZXJ2ZShhc3luYyAocmVxKSA9PiB7XG4gKiAgIGNvbnN0IGlmTWF0Y2hWYWx1ZSA9IHJlcS5oZWFkZXJzLmdldChcImlmLW1hdGNoXCIpO1xuICogICBjb25zdCBldGFnID0gYXdhaXQgY2FsY3VsYXRlKGJvZHkpO1xuICogICBhc3NlcnQoZXRhZyk7XG4gKiAgIGlmICghaWZNYXRjaFZhbHVlIHx8IGlmTWF0Y2goaWZNYXRjaFZhbHVlLCBldGFnKSkge1xuICogICAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgeyBzdGF0dXM6IDIwMCwgaGVhZGVyczogeyBldGFnIH0gfSk7XG4gKiAgIH0gZWxzZSB7XG4gKiAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7IHN0YXR1czogNDEyLCBzdGF0dXNUZXh0OiBcIlByZWNvbmRpdGlvbiBGYWlsZWRcIn0pO1xuICogICB9XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgSWYtTWF0Y2ggaGVhZGVyIHZhbHVlLlxuICogQHBhcmFtIGV0YWcgdGhlIEVUYWcgdG8gY2hlY2sgYWdhaW5zdC5cbiAqIEByZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBwYXJhbWV0ZXJzIG1hdGNoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaWZNYXRjaChcbiAgdmFsdWU6IHN0cmluZyB8IG51bGwsXG4gIGV0YWc6IHN0cmluZyB8IHVuZGVmaW5lZCxcbik6IGJvb2xlYW4ge1xuICAvLyBXZWFrIHRhZ3MgY2Fubm90IGJlIG1hdGNoZWQgYW5kIHJldHVybiBmYWxzZS5cbiAgaWYgKCF2YWx1ZSB8fCAhZXRhZyB8fCBldGFnLnN0YXJ0c1dpdGgoXCJXL1wiKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsdWUudHJpbSgpID09PSBcIipcIikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGNvbnN0IHRhZ3MgPSB2YWx1ZS5zcGxpdCgvXFxzKixcXHMqLyk7XG4gIHJldHVybiB0YWdzLmluY2x1ZGVzKGV0YWcpO1xufVxuXG4vKiogQSBoZWxwZXIgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgdmFsdWUgZnJvbSB0aGUgYElmLU5vbmUtTWF0Y2hgIGhlYWRlciBhbmRcbiAqIGEgY2FsY3VsYXRlZCBldGFnIGZvciB0aGUgdGFyZ2V0IGVudGl0eSBhbmQgcmV0dXJucyBgZmFsc2VgIGlmIHRoZSBldGFnIGZvclxuICogdGhlIGVudGl0eSBtYXRjaGVzIHRoZSBzdXBwbGllZCB2YWx1ZSwgb3RoZXJ3aXNlIGB0cnVlYC5cbiAqXG4gKiBTZWUgTUROJ3MgW2BJZi1Ob25lLU1hdGNoYF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRUUC9IZWFkZXJzL0lmLU5vbmUtTWF0Y2gpXG4gKiBhcnRpY2xlIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0byB1c2UgdGhpcyBmdW5jdGlvbi5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHtcbiAqICAgY2FsY3VsYXRlLFxuICogICBpZk5vbmVNYXRjaCxcbiAqIH0gZnJvbSBcIkBzdGQvaHR0cC9ldGFnXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0XCJcbiAqXG4gKiBjb25zdCBib2R5ID0gXCJoZWxsbyBkZW5vIVwiO1xuICpcbiAqIERlbm8uc2VydmUoYXN5bmMgKHJlcSkgPT4ge1xuICogICBjb25zdCBpZk5vbmVNYXRjaFZhbHVlID0gcmVxLmhlYWRlcnMuZ2V0KFwiaWYtbm9uZS1tYXRjaFwiKTtcbiAqICAgY29uc3QgZXRhZyA9IGF3YWl0IGNhbGN1bGF0ZShib2R5KTtcbiAqICAgYXNzZXJ0KGV0YWcpO1xuICogICBpZiAoIWlmTm9uZU1hdGNoKGlmTm9uZU1hdGNoVmFsdWUsIGV0YWcpKSB7XG4gKiAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7IHN0YXR1czogMzA0LCBoZWFkZXJzOiB7IGV0YWcgfSB9KTtcbiAqICAgfSBlbHNlIHtcbiAqICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHsgc3RhdHVzOiAyMDAsIGhlYWRlcnM6IHsgZXRhZyB9IH0pO1xuICogICB9XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgSWYtTm9uZS1NYXRjaCBoZWFkZXIgdmFsdWUuXG4gKiBAcGFyYW0gZXRhZyB0aGUgRVRhZyB0byBjaGVjayBhZ2FpbnN0LlxuICogQHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHBhcmFtZXRlcnMgZG8gbm90IG1hdGNoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaWZOb25lTWF0Y2goXG4gIHZhbHVlOiBzdHJpbmcgfCBudWxsLFxuICBldGFnOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4pOiBib29sZWFuIHtcbiAgaWYgKCF2YWx1ZSB8fCAhZXRhZykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmICh2YWx1ZS50cmltKCkgPT09IFwiKlwiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGV0YWcgPSBldGFnLnN0YXJ0c1dpdGgoXCJXL1wiKSA/IGV0YWcuc2xpY2UoMikgOiBldGFnO1xuICBjb25zdCB0YWdzID0gdmFsdWUuc3BsaXQoL1xccyosXFxzKi8pLm1hcCgodGFnKSA9PlxuICAgIHRhZy5zdGFydHNXaXRoKFwiVy9cIikgPyB0YWcuc2xpY2UoMikgOiB0YWdcbiAgKTtcbiAgcmV0dXJuICF0YWdzLmluY2x1ZGVzKGV0YWcpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7O0NBV0MsR0FFRCxTQUFTLGdCQUFnQixZQUFZLFFBQVEsdUNBQXVDO0FBa0JwRixNQUFNLFVBQVUsSUFBSTtBQUVwQixNQUFNLG9CQUF5QztBQWdCL0MsU0FBUyxXQUFXLEtBQWM7RUFDaEMsT0FBTyxRQUNMLFNBQVMsT0FBTyxVQUFVLFlBQVksV0FBVyxTQUFTLFVBQVU7QUFFeEU7QUFFQSxlQUFlLFdBQ2IsTUFBMkIsRUFDM0IsRUFBRSxZQUFZLGlCQUFpQixFQUFlO0VBRTlDLDJDQUEyQztFQUMzQyxJQUFJLE9BQU8sTUFBTSxLQUFLLEdBQUc7SUFDdkIsT0FBTyxDQUFDLDZCQUE2QixDQUFDO0VBQ3hDO0VBRUEsSUFBSSxPQUFPLFdBQVcsVUFBVTtJQUM5QixTQUFTLFFBQVEsTUFBTSxDQUFDO0VBQzFCO0VBRUEsTUFBTSxPQUFPLGFBQWEsTUFBTSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxTQUM3RCxTQUFTLENBQUMsR0FBRztFQUVoQixPQUFPLEdBQUcsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU07QUFDaEQ7QUFFQSxlQUFlLGFBQ2IsUUFBa0IsRUFDbEIsRUFBRSxZQUFZLGlCQUFpQixFQUFlO0VBRTlDLElBQUksU0FBUyxLQUFLLEVBQUU7SUFDbEIsTUFBTSxPQUFPLGFBQ1gsTUFBTSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQ3hCLFdBQ0EsUUFBUSxNQUFNLENBQUMsU0FBUyxLQUFLLENBQUMsTUFBTSxNQUV0QyxTQUFTLENBQUMsR0FBRztJQUNmLE9BQU8sR0FBRyxTQUFTLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTTtFQUNoRDtBQUNGO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCQyxHQUNELE9BQU8sZUFBZSxVQUNwQixNQUFjLEVBQ2QsVUFBdUIsQ0FBQyxDQUFDO0VBRXpCLE1BQU0sT0FBTyxRQUFRLElBQUksSUFBSSxXQUFXO0VBQ3hDLE1BQU0sTUFDSixNQUFNLENBQUMsV0FBVyxVQUNkLGFBQWEsUUFBUSxXQUNyQixXQUFXLFFBQVEsUUFBUTtFQUVqQyxPQUFPLE1BQU0sT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUc7QUFDbEQ7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQ0MsR0FDRCxPQUFPLFNBQVMsUUFDZCxLQUFvQixFQUNwQixJQUF3QjtFQUV4QixnREFBZ0Q7RUFDaEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEtBQUssVUFBVSxDQUFDLE9BQU87SUFDNUMsT0FBTztFQUNUO0VBQ0EsSUFBSSxNQUFNLElBQUksT0FBTyxLQUFLO0lBQ3hCLE9BQU87RUFDVDtFQUNBLE1BQU0sT0FBTyxNQUFNLEtBQUssQ0FBQztFQUN6QixPQUFPLEtBQUssUUFBUSxDQUFDO0FBQ3ZCO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBZ0NDLEdBQ0QsT0FBTyxTQUFTLFlBQ2QsS0FBb0IsRUFDcEIsSUFBd0I7RUFFeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNO0lBQ25CLE9BQU87RUFDVDtFQUNBLElBQUksTUFBTSxJQUFJLE9BQU8sS0FBSztJQUN4QixPQUFPO0VBQ1Q7RUFDQSxPQUFPLEtBQUssVUFBVSxDQUFDLFFBQVEsS0FBSyxLQUFLLENBQUMsS0FBSztFQUMvQyxNQUFNLE9BQU8sTUFBTSxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxNQUN2QyxJQUFJLFVBQVUsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLEtBQUs7RUFFeEMsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDO0FBQ3hCIn0=
// denoCacheMetadata=9838904433440923134,14895031334400400926