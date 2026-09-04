// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { normalize } from "./normalize.ts";
import { SEPARATOR_PATTERN } from "./constants.ts";
/** Like normalize(), but doesn't collapse "**\/.." when `globstar` is true. */ export function normalizeGlob(glob, { globstar = false } = {}) {
  if (glob.match(/\0/g)) {
    throw new Error(`Glob contains invalid characters: "${glob}"`);
  }
  if (!globstar) {
    return normalize(glob);
  }
  const s = SEPARATOR_PATTERN.source;
  const badParentPattern = new RegExp(`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`, "g");
  return normalize(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8wLjIyNC4wL3dpbmRvd3Mvbm9ybWFsaXplX2dsb2IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHR5cGUgeyBHbG9iT3B0aW9ucyB9IGZyb20gXCIuLi9fY29tbW9uL2dsb2JfdG9fcmVnX2V4cC50c1wiO1xuaW1wb3J0IHsgbm9ybWFsaXplIH0gZnJvbSBcIi4vbm9ybWFsaXplLnRzXCI7XG5pbXBvcnQgeyBTRVBBUkFUT1JfUEFUVEVSTiB9IGZyb20gXCIuL2NvbnN0YW50cy50c1wiO1xuXG5leHBvcnQgdHlwZSB7IEdsb2JPcHRpb25zIH07XG5cbi8qKiBMaWtlIG5vcm1hbGl6ZSgpLCBidXQgZG9lc24ndCBjb2xsYXBzZSBcIioqXFwvLi5cIiB3aGVuIGBnbG9ic3RhcmAgaXMgdHJ1ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVHbG9iKFxuICBnbG9iOiBzdHJpbmcsXG4gIHsgZ2xvYnN0YXIgPSBmYWxzZSB9OiBHbG9iT3B0aW9ucyA9IHt9LFxuKTogc3RyaW5nIHtcbiAgaWYgKGdsb2IubWF0Y2goL1xcMC9nKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgR2xvYiBjb250YWlucyBpbnZhbGlkIGNoYXJhY3RlcnM6IFwiJHtnbG9ifVwiYCk7XG4gIH1cbiAgaWYgKCFnbG9ic3Rhcikge1xuICAgIHJldHVybiBub3JtYWxpemUoZ2xvYik7XG4gIH1cbiAgY29uc3QgcyA9IFNFUEFSQVRPUl9QQVRURVJOLnNvdXJjZTtcbiAgY29uc3QgYmFkUGFyZW50UGF0dGVybiA9IG5ldyBSZWdFeHAoXG4gICAgYCg/PD0oJHtzfXxeKVxcXFwqXFxcXCoke3N9KVxcXFwuXFxcXC4oPz0ke3N9fCQpYCxcbiAgICBcImdcIixcbiAgKTtcbiAgcmV0dXJuIG5vcm1hbGl6ZShnbG9iLnJlcGxhY2UoYmFkUGFyZW50UGF0dGVybiwgXCJcXDBcIikpLnJlcGxhY2UoL1xcMC9nLCBcIi4uXCIpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFHckMsU0FBUyxTQUFTLFFBQVEsaUJBQWlCO0FBQzNDLFNBQVMsaUJBQWlCLFFBQVEsaUJBQWlCO0FBSW5ELDZFQUE2RSxHQUM3RSxPQUFPLFNBQVMsY0FDZCxJQUFZLEVBQ1osRUFBRSxXQUFXLEtBQUssRUFBZSxHQUFHLENBQUMsQ0FBQztFQUV0QyxJQUFJLEtBQUssS0FBSyxDQUFDLFFBQVE7SUFDckIsTUFBTSxJQUFJLE1BQU0sQ0FBQyxtQ0FBbUMsRUFBRSxLQUFLLENBQUMsQ0FBQztFQUMvRDtFQUNBLElBQUksQ0FBQyxVQUFVO0lBQ2IsT0FBTyxVQUFVO0VBQ25CO0VBQ0EsTUFBTSxJQUFJLGtCQUFrQixNQUFNO0VBQ2xDLE1BQU0sbUJBQW1CLElBQUksT0FDM0IsQ0FBQyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFDekM7RUFFRixPQUFPLFVBQVUsS0FBSyxPQUFPLENBQUMsa0JBQWtCLE9BQU8sT0FBTyxDQUFDLE9BQU87QUFDeEUifQ==
// denoCacheMetadata=7744280443030031126,15967572035439573321