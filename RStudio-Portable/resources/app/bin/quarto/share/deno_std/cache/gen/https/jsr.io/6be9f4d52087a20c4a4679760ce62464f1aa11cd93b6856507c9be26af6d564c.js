// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { parseBuild } from "./_shared.ts";
function bumpPrereleaseNumber(prerelease = []) {
  const values = [
    ...prerelease
  ];
  let index = values.length;
  while(index >= 0){
    const value = values[index];
    if (typeof value === "number") {
      values[index] = value + 1;
      break;
    }
    index -= 1;
  }
  // if no number was bumped
  if (index === -1) values.push(0);
  return values;
}
function bumpPrerelease(prerelease = [], identifier) {
  let values = bumpPrereleaseNumber(prerelease);
  if (!identifier) return values;
  // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
  // 1.2.0-beta.foobar or 1.2.0-beta bumps to 1.2.0-beta.0
  if (values[0] !== identifier || isNaN(values[1])) {
    values = [
      identifier,
      0
    ];
  }
  return values;
}
/**
 * Returns the new version resulting from an increment by release type.
 *
 * `premajor`, `preminor` and `prepatch` will bump the version up to the next version,
 * based on the type, and will also add prerelease metadata.
 *
 * If called from a non-prerelease version, the `prerelease` will work the same as
 * `prepatch`. The patch version is incremented and then is made into a prerelease. If
 * the input version is already a prerelease it will simply increment the prerelease
 * metadata.
 *
 * If a prerelease identifier is specified without a number then a number will be added.
 * For example `pre` will result in `pre.0`. If the existing version already has a
 * prerelease with a number and its the same prerelease identifier then the number
 * will be incremented. If the identifier differs from the new identifier then the new
 * identifier is applied and the number is reset to `0`.
 *
 * If the input version has build metadata it will be preserved on the resulting version
 * unless a new build parameter is specified. Specifying `""` will unset existing build
 * metadata.
 *
 * @example Usage
 * ```ts
 * import { increment, parse } from "@std/semver";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const version = parse("1.2.3");
 * assertEquals(increment(version, "major"), parse("2.0.0"));
 * assertEquals(increment(version, "minor"), parse("1.3.0"));
 * assertEquals(increment(version, "patch"), parse("1.2.4"));
 * assertEquals(increment(version, "prerelease"), parse("1.2.4-0"));
 *
 * const prerelease = parse("1.2.3-beta.0");
 * assertEquals(increment(prerelease, "prerelease"), parse("1.2.3-beta.1"));
 * ```
 *
 * @param version The version to increment
 * @param release The type of increment to perform
 * @param prerelease The pre-release metadata of the new version
 * @param buildmetadata The build metadata of the new version
 * @returns The new version
 */ export function increment(version, release, prerelease, buildmetadata) {
  const build = buildmetadata !== undefined ? parseBuild(buildmetadata) : version.build;
  switch(release){
    case "premajor":
      return {
        major: version.major + 1,
        minor: 0,
        patch: 0,
        prerelease: bumpPrerelease(version.prerelease, prerelease),
        build
      };
    case "preminor":
      return {
        major: version.major,
        minor: version.minor + 1,
        patch: 0,
        prerelease: bumpPrerelease(version.prerelease, prerelease),
        build
      };
    case "prepatch":
      return {
        major: version.major,
        minor: version.minor,
        patch: version.patch + 1,
        prerelease: bumpPrerelease(version.prerelease, prerelease),
        build
      };
    case "prerelease":
      {
        // If the input is a non-prerelease version, this acts the same as prepatch.
        const isPrerelease = (version.prerelease ?? []).length === 0;
        const patch = isPrerelease ? version.patch + 1 : version.patch;
        return {
          major: version.major,
          minor: version.minor,
          patch,
          prerelease: bumpPrerelease(version.prerelease, prerelease),
          build
        };
      }
    case "major":
      {
        // If this is a pre-major version, bump up to the same major version. Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        const isPrerelease = (version.prerelease ?? []).length === 0;
        const major = isPrerelease || version.minor !== 0 || version.patch !== 0 ? version.major + 1 : version.major;
        return {
          major,
          minor: 0,
          patch: 0,
          prerelease: [],
          build
        };
      }
    case "minor":
      {
        // If this is a pre-minor version, bump up to the same minor version. Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        const isPrerelease = (version.prerelease ?? []).length === 0;
        const minor = isPrerelease || version.patch !== 0 ? version.minor + 1 : version.minor;
        return {
          major: version.major,
          minor,
          patch: 0,
          prerelease: [],
          build
        };
      }
    case "patch":
      {
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        const isPrerelease = (version.prerelease ?? []).length === 0;
        const patch = isPrerelease ? version.patch + 1 : version.patch;
        return {
          major: version.major,
          minor: version.minor,
          patch,
          prerelease: [],
          build
        };
      }
    case "pre":
      {
        // 1.0.0 "pre" would become 1.0.0-0
        // 1.0.0-0 would become 1.0.0-1
        // 1.0.0-beta.0 would be come 1.0.0-beta.1
        // switching the pre identifier resets the number to 0
        return {
          major: version.major,
          minor: version.minor,
          patch: version.patch,
          prerelease: bumpPrerelease(version.prerelease, prerelease),
          build
        };
      }
    default:
      throw new Error(`invalid increment argument: ${release}`);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvaW5jcmVtZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBwYXJzZUJ1aWxkIH0gZnJvbSBcIi4vX3NoYXJlZC50c1wiO1xuaW1wb3J0IHR5cGUgeyBSZWxlYXNlVHlwZSwgU2VtVmVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcblxuZnVuY3Rpb24gYnVtcFByZXJlbGVhc2VOdW1iZXIocHJlcmVsZWFzZTogUmVhZG9ubHlBcnJheTxzdHJpbmcgfCBudW1iZXI+ID0gW10pIHtcbiAgY29uc3QgdmFsdWVzID0gWy4uLnByZXJlbGVhc2VdO1xuXG4gIGxldCBpbmRleCA9IHZhbHVlcy5sZW5ndGg7XG4gIHdoaWxlIChpbmRleCA+PSAwKSB7XG4gICAgY29uc3QgdmFsdWUgPSB2YWx1ZXNbaW5kZXhdO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIHZhbHVlc1tpbmRleF0gPSB2YWx1ZSArIDE7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaW5kZXggLT0gMTtcbiAgfVxuICAvLyBpZiBubyBudW1iZXIgd2FzIGJ1bXBlZFxuICBpZiAoaW5kZXggPT09IC0xKSB2YWx1ZXMucHVzaCgwKTtcblxuICByZXR1cm4gdmFsdWVzO1xufVxuXG5mdW5jdGlvbiBidW1wUHJlcmVsZWFzZShcbiAgcHJlcmVsZWFzZTogUmVhZG9ubHlBcnJheTxzdHJpbmcgfCBudW1iZXI+ID0gW10sXG4gIGlkZW50aWZpZXI6IHN0cmluZyB8IHVuZGVmaW5lZCxcbikge1xuICBsZXQgdmFsdWVzID0gYnVtcFByZXJlbGVhc2VOdW1iZXIocHJlcmVsZWFzZSk7XG4gIGlmICghaWRlbnRpZmllcikgcmV0dXJuIHZhbHVlcztcbiAgLy8gMS4yLjAtYmV0YS4xIGJ1bXBzIHRvIDEuMi4wLWJldGEuMixcbiAgLy8gMS4yLjAtYmV0YS5mb29iYXIgb3IgMS4yLjAtYmV0YSBidW1wcyB0byAxLjIuMC1iZXRhLjBcbiAgaWYgKHZhbHVlc1swXSAhPT0gaWRlbnRpZmllciB8fCBpc05hTih2YWx1ZXNbMV0gYXMgbnVtYmVyKSkge1xuICAgIHZhbHVlcyA9IFtpZGVudGlmaWVyLCAwXTtcbiAgfVxuICByZXR1cm4gdmFsdWVzO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG5ldyB2ZXJzaW9uIHJlc3VsdGluZyBmcm9tIGFuIGluY3JlbWVudCBieSByZWxlYXNlIHR5cGUuXG4gKlxuICogYHByZW1ham9yYCwgYHByZW1pbm9yYCBhbmQgYHByZXBhdGNoYCB3aWxsIGJ1bXAgdGhlIHZlcnNpb24gdXAgdG8gdGhlIG5leHQgdmVyc2lvbixcbiAqIGJhc2VkIG9uIHRoZSB0eXBlLCBhbmQgd2lsbCBhbHNvIGFkZCBwcmVyZWxlYXNlIG1ldGFkYXRhLlxuICpcbiAqIElmIGNhbGxlZCBmcm9tIGEgbm9uLXByZXJlbGVhc2UgdmVyc2lvbiwgdGhlIGBwcmVyZWxlYXNlYCB3aWxsIHdvcmsgdGhlIHNhbWUgYXNcbiAqIGBwcmVwYXRjaGAuIFRoZSBwYXRjaCB2ZXJzaW9uIGlzIGluY3JlbWVudGVkIGFuZCB0aGVuIGlzIG1hZGUgaW50byBhIHByZXJlbGVhc2UuIElmXG4gKiB0aGUgaW5wdXQgdmVyc2lvbiBpcyBhbHJlYWR5IGEgcHJlcmVsZWFzZSBpdCB3aWxsIHNpbXBseSBpbmNyZW1lbnQgdGhlIHByZXJlbGVhc2VcbiAqIG1ldGFkYXRhLlxuICpcbiAqIElmIGEgcHJlcmVsZWFzZSBpZGVudGlmaWVyIGlzIHNwZWNpZmllZCB3aXRob3V0IGEgbnVtYmVyIHRoZW4gYSBudW1iZXIgd2lsbCBiZSBhZGRlZC5cbiAqIEZvciBleGFtcGxlIGBwcmVgIHdpbGwgcmVzdWx0IGluIGBwcmUuMGAuIElmIHRoZSBleGlzdGluZyB2ZXJzaW9uIGFscmVhZHkgaGFzIGFcbiAqIHByZXJlbGVhc2Ugd2l0aCBhIG51bWJlciBhbmQgaXRzIHRoZSBzYW1lIHByZXJlbGVhc2UgaWRlbnRpZmllciB0aGVuIHRoZSBudW1iZXJcbiAqIHdpbGwgYmUgaW5jcmVtZW50ZWQuIElmIHRoZSBpZGVudGlmaWVyIGRpZmZlcnMgZnJvbSB0aGUgbmV3IGlkZW50aWZpZXIgdGhlbiB0aGUgbmV3XG4gKiBpZGVudGlmaWVyIGlzIGFwcGxpZWQgYW5kIHRoZSBudW1iZXIgaXMgcmVzZXQgdG8gYDBgLlxuICpcbiAqIElmIHRoZSBpbnB1dCB2ZXJzaW9uIGhhcyBidWlsZCBtZXRhZGF0YSBpdCB3aWxsIGJlIHByZXNlcnZlZCBvbiB0aGUgcmVzdWx0aW5nIHZlcnNpb25cbiAqIHVubGVzcyBhIG5ldyBidWlsZCBwYXJhbWV0ZXIgaXMgc3BlY2lmaWVkLiBTcGVjaWZ5aW5nIGBcIlwiYCB3aWxsIHVuc2V0IGV4aXN0aW5nIGJ1aWxkXG4gKiBtZXRhZGF0YS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGluY3JlbWVudCwgcGFyc2UgfSBmcm9tIFwiQHN0ZC9zZW12ZXJcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgdmVyc2lvbiA9IHBhcnNlKFwiMS4yLjNcIik7XG4gKiBhc3NlcnRFcXVhbHMoaW5jcmVtZW50KHZlcnNpb24sIFwibWFqb3JcIiksIHBhcnNlKFwiMi4wLjBcIikpO1xuICogYXNzZXJ0RXF1YWxzKGluY3JlbWVudCh2ZXJzaW9uLCBcIm1pbm9yXCIpLCBwYXJzZShcIjEuMy4wXCIpKTtcbiAqIGFzc2VydEVxdWFscyhpbmNyZW1lbnQodmVyc2lvbiwgXCJwYXRjaFwiKSwgcGFyc2UoXCIxLjIuNFwiKSk7XG4gKiBhc3NlcnRFcXVhbHMoaW5jcmVtZW50KHZlcnNpb24sIFwicHJlcmVsZWFzZVwiKSwgcGFyc2UoXCIxLjIuNC0wXCIpKTtcbiAqXG4gKiBjb25zdCBwcmVyZWxlYXNlID0gcGFyc2UoXCIxLjIuMy1iZXRhLjBcIik7XG4gKiBhc3NlcnRFcXVhbHMoaW5jcmVtZW50KHByZXJlbGVhc2UsIFwicHJlcmVsZWFzZVwiKSwgcGFyc2UoXCIxLjIuMy1iZXRhLjFcIikpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHZlcnNpb24gVGhlIHZlcnNpb24gdG8gaW5jcmVtZW50XG4gKiBAcGFyYW0gcmVsZWFzZSBUaGUgdHlwZSBvZiBpbmNyZW1lbnQgdG8gcGVyZm9ybVxuICogQHBhcmFtIHByZXJlbGVhc2UgVGhlIHByZS1yZWxlYXNlIG1ldGFkYXRhIG9mIHRoZSBuZXcgdmVyc2lvblxuICogQHBhcmFtIGJ1aWxkbWV0YWRhdGEgVGhlIGJ1aWxkIG1ldGFkYXRhIG9mIHRoZSBuZXcgdmVyc2lvblxuICogQHJldHVybnMgVGhlIG5ldyB2ZXJzaW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmNyZW1lbnQoXG4gIHZlcnNpb246IFNlbVZlcixcbiAgcmVsZWFzZTogUmVsZWFzZVR5cGUsXG4gIHByZXJlbGVhc2U/OiBzdHJpbmcsXG4gIGJ1aWxkbWV0YWRhdGE/OiBzdHJpbmcsXG4pOiBTZW1WZXIge1xuICBjb25zdCBidWlsZCA9IGJ1aWxkbWV0YWRhdGEgIT09IHVuZGVmaW5lZFxuICAgID8gcGFyc2VCdWlsZChidWlsZG1ldGFkYXRhKVxuICAgIDogdmVyc2lvbi5idWlsZDtcblxuICBzd2l0Y2ggKHJlbGVhc2UpIHtcbiAgICBjYXNlIFwicHJlbWFqb3JcIjpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1ham9yOiB2ZXJzaW9uLm1ham9yICsgMSxcbiAgICAgICAgbWlub3I6IDAsXG4gICAgICAgIHBhdGNoOiAwLFxuICAgICAgICBwcmVyZWxlYXNlOiBidW1wUHJlcmVsZWFzZSh2ZXJzaW9uLnByZXJlbGVhc2UsIHByZXJlbGVhc2UpLFxuICAgICAgICBidWlsZCxcbiAgICAgIH07XG4gICAgY2FzZSBcInByZW1pbm9yXCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYWpvcjogdmVyc2lvbi5tYWpvcixcbiAgICAgICAgbWlub3I6IHZlcnNpb24ubWlub3IgKyAxLFxuICAgICAgICBwYXRjaDogMCxcbiAgICAgICAgcHJlcmVsZWFzZTogYnVtcFByZXJlbGVhc2UodmVyc2lvbi5wcmVyZWxlYXNlLCBwcmVyZWxlYXNlKSxcbiAgICAgICAgYnVpbGQsXG4gICAgICB9O1xuICAgIGNhc2UgXCJwcmVwYXRjaFwiOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWFqb3I6IHZlcnNpb24ubWFqb3IsXG4gICAgICAgIG1pbm9yOiB2ZXJzaW9uLm1pbm9yLFxuICAgICAgICBwYXRjaDogdmVyc2lvbi5wYXRjaCArIDEsXG4gICAgICAgIHByZXJlbGVhc2U6IGJ1bXBQcmVyZWxlYXNlKHZlcnNpb24ucHJlcmVsZWFzZSwgcHJlcmVsZWFzZSksXG4gICAgICAgIGJ1aWxkLFxuICAgICAgfTtcbiAgICBjYXNlIFwicHJlcmVsZWFzZVwiOiB7XG4gICAgICAvLyBJZiB0aGUgaW5wdXQgaXMgYSBub24tcHJlcmVsZWFzZSB2ZXJzaW9uLCB0aGlzIGFjdHMgdGhlIHNhbWUgYXMgcHJlcGF0Y2guXG4gICAgICBjb25zdCBpc1ByZXJlbGVhc2UgPSAodmVyc2lvbi5wcmVyZWxlYXNlID8/IFtdKS5sZW5ndGggPT09IDA7XG4gICAgICBjb25zdCBwYXRjaCA9IGlzUHJlcmVsZWFzZSA/IHZlcnNpb24ucGF0Y2ggKyAxIDogdmVyc2lvbi5wYXRjaDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1ham9yOiB2ZXJzaW9uLm1ham9yLFxuICAgICAgICBtaW5vcjogdmVyc2lvbi5taW5vcixcbiAgICAgICAgcGF0Y2gsXG4gICAgICAgIHByZXJlbGVhc2U6IGJ1bXBQcmVyZWxlYXNlKHZlcnNpb24ucHJlcmVsZWFzZSwgcHJlcmVsZWFzZSksXG4gICAgICAgIGJ1aWxkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBcIm1ham9yXCI6IHtcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWFqb3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtYWpvciB2ZXJzaW9uLiBPdGhlcndpc2UgaW5jcmVtZW50IG1ham9yLlxuICAgICAgLy8gMS4wLjAtNSBidW1wcyB0byAxLjAuMFxuICAgICAgLy8gMS4xLjAgYnVtcHMgdG8gMi4wLjBcbiAgICAgIGNvbnN0IGlzUHJlcmVsZWFzZSA9ICh2ZXJzaW9uLnByZXJlbGVhc2UgPz8gW10pLmxlbmd0aCA9PT0gMDtcbiAgICAgIGNvbnN0IG1ham9yID0gaXNQcmVyZWxlYXNlIHx8IHZlcnNpb24ubWlub3IgIT09IDAgfHwgdmVyc2lvbi5wYXRjaCAhPT0gMFxuICAgICAgICA/IHZlcnNpb24ubWFqb3IgKyAxXG4gICAgICAgIDogdmVyc2lvbi5tYWpvcjtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1ham9yLFxuICAgICAgICBtaW5vcjogMCxcbiAgICAgICAgcGF0Y2g6IDAsXG4gICAgICAgIHByZXJlbGVhc2U6IFtdLFxuICAgICAgICBidWlsZCxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgXCJtaW5vclwiOiB7XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1pbm9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWlub3IgdmVyc2lvbi4gT3RoZXJ3aXNlIGluY3JlbWVudCBtaW5vci5cbiAgICAgIC8vIDEuMi4wLTUgYnVtcHMgdG8gMS4yLjBcbiAgICAgIC8vIDEuMi4xIGJ1bXBzIHRvIDEuMy4wXG4gICAgICBjb25zdCBpc1ByZXJlbGVhc2UgPSAodmVyc2lvbi5wcmVyZWxlYXNlID8/IFtdKS5sZW5ndGggPT09IDA7XG4gICAgICBjb25zdCBtaW5vciA9IGlzUHJlcmVsZWFzZSB8fCB2ZXJzaW9uLnBhdGNoICE9PSAwXG4gICAgICAgID8gdmVyc2lvbi5taW5vciArIDFcbiAgICAgICAgOiB2ZXJzaW9uLm1pbm9yO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWFqb3I6IHZlcnNpb24ubWFqb3IsXG4gICAgICAgIG1pbm9yLFxuICAgICAgICBwYXRjaDogMCxcbiAgICAgICAgcHJlcmVsZWFzZTogW10sXG4gICAgICAgIGJ1aWxkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBcInBhdGNoXCI6IHtcbiAgICAgIC8vIElmIHRoaXMgaXMgbm90IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiwgaXQgd2lsbCBpbmNyZW1lbnQgdGhlIHBhdGNoLlxuICAgICAgLy8gSWYgaXQgaXMgYSBwcmUtcmVsZWFzZSBpdCB3aWxsIGJ1bXAgdXAgdG8gdGhlIHNhbWUgcGF0Y2ggdmVyc2lvbi5cbiAgICAgIC8vIDEuMi4wLTUgcGF0Y2hlcyB0byAxLjIuMFxuICAgICAgLy8gMS4yLjAgcGF0Y2hlcyB0byAxLjIuMVxuICAgICAgY29uc3QgaXNQcmVyZWxlYXNlID0gKHZlcnNpb24ucHJlcmVsZWFzZSA/PyBbXSkubGVuZ3RoID09PSAwO1xuICAgICAgY29uc3QgcGF0Y2ggPSBpc1ByZXJlbGVhc2UgPyB2ZXJzaW9uLnBhdGNoICsgMSA6IHZlcnNpb24ucGF0Y2g7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYWpvcjogdmVyc2lvbi5tYWpvcixcbiAgICAgICAgbWlub3I6IHZlcnNpb24ubWlub3IsXG4gICAgICAgIHBhdGNoLFxuICAgICAgICBwcmVyZWxlYXNlOiBbXSxcbiAgICAgICAgYnVpbGQsXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIFwicHJlXCI6IHtcbiAgICAgIC8vIDEuMC4wIFwicHJlXCIgd291bGQgYmVjb21lIDEuMC4wLTBcbiAgICAgIC8vIDEuMC4wLTAgd291bGQgYmVjb21lIDEuMC4wLTFcbiAgICAgIC8vIDEuMC4wLWJldGEuMCB3b3VsZCBiZSBjb21lIDEuMC4wLWJldGEuMVxuICAgICAgLy8gc3dpdGNoaW5nIHRoZSBwcmUgaWRlbnRpZmllciByZXNldHMgdGhlIG51bWJlciB0byAwXG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYWpvcjogdmVyc2lvbi5tYWpvcixcbiAgICAgICAgbWlub3I6IHZlcnNpb24ubWlub3IsXG4gICAgICAgIHBhdGNoOiB2ZXJzaW9uLnBhdGNoLFxuICAgICAgICBwcmVyZWxlYXNlOiBidW1wUHJlcmVsZWFzZSh2ZXJzaW9uLnByZXJlbGVhc2UsIHByZXJlbGVhc2UpLFxuICAgICAgICBidWlsZCxcbiAgICAgIH07XG4gICAgfVxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgaW5jcmVtZW50IGFyZ3VtZW50OiAke3JlbGVhc2V9YCk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBQ3JDLFNBQVMsVUFBVSxRQUFRLGVBQWU7QUFHMUMsU0FBUyxxQkFBcUIsYUFBNkMsRUFBRTtFQUMzRSxNQUFNLFNBQVM7T0FBSTtHQUFXO0VBRTlCLElBQUksUUFBUSxPQUFPLE1BQU07RUFDekIsTUFBTyxTQUFTLEVBQUc7SUFDakIsTUFBTSxRQUFRLE1BQU0sQ0FBQyxNQUFNO0lBQzNCLElBQUksT0FBTyxVQUFVLFVBQVU7TUFDN0IsTUFBTSxDQUFDLE1BQU0sR0FBRyxRQUFRO01BQ3hCO0lBQ0Y7SUFDQSxTQUFTO0VBQ1g7RUFDQSwwQkFBMEI7RUFDMUIsSUFBSSxVQUFVLENBQUMsR0FBRyxPQUFPLElBQUksQ0FBQztFQUU5QixPQUFPO0FBQ1Q7QUFFQSxTQUFTLGVBQ1AsYUFBNkMsRUFBRSxFQUMvQyxVQUE4QjtFQUU5QixJQUFJLFNBQVMscUJBQXFCO0VBQ2xDLElBQUksQ0FBQyxZQUFZLE9BQU87RUFDeEIsc0NBQXNDO0VBQ3RDLHdEQUF3RDtFQUN4RCxJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssY0FBYyxNQUFNLE1BQU0sQ0FBQyxFQUFFLEdBQWE7SUFDMUQsU0FBUztNQUFDO01BQVk7S0FBRTtFQUMxQjtFQUNBLE9BQU87QUFDVDtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXlDQyxHQUNELE9BQU8sU0FBUyxVQUNkLE9BQWUsRUFDZixPQUFvQixFQUNwQixVQUFtQixFQUNuQixhQUFzQjtFQUV0QixNQUFNLFFBQVEsa0JBQWtCLFlBQzVCLFdBQVcsaUJBQ1gsUUFBUSxLQUFLO0VBRWpCLE9BQVE7SUFDTixLQUFLO01BQ0gsT0FBTztRQUNMLE9BQU8sUUFBUSxLQUFLLEdBQUc7UUFDdkIsT0FBTztRQUNQLE9BQU87UUFDUCxZQUFZLGVBQWUsUUFBUSxVQUFVLEVBQUU7UUFDL0M7TUFDRjtJQUNGLEtBQUs7TUFDSCxPQUFPO1FBQ0wsT0FBTyxRQUFRLEtBQUs7UUFDcEIsT0FBTyxRQUFRLEtBQUssR0FBRztRQUN2QixPQUFPO1FBQ1AsWUFBWSxlQUFlLFFBQVEsVUFBVSxFQUFFO1FBQy9DO01BQ0Y7SUFDRixLQUFLO01BQ0gsT0FBTztRQUNMLE9BQU8sUUFBUSxLQUFLO1FBQ3BCLE9BQU8sUUFBUSxLQUFLO1FBQ3BCLE9BQU8sUUFBUSxLQUFLLEdBQUc7UUFDdkIsWUFBWSxlQUFlLFFBQVEsVUFBVSxFQUFFO1FBQy9DO01BQ0Y7SUFDRixLQUFLO01BQWM7UUFDakIsNEVBQTRFO1FBQzVFLE1BQU0sZUFBZSxDQUFDLFFBQVEsVUFBVSxJQUFJLEVBQUUsRUFBRSxNQUFNLEtBQUs7UUFDM0QsTUFBTSxRQUFRLGVBQWUsUUFBUSxLQUFLLEdBQUcsSUFBSSxRQUFRLEtBQUs7UUFDOUQsT0FBTztVQUNMLE9BQU8sUUFBUSxLQUFLO1VBQ3BCLE9BQU8sUUFBUSxLQUFLO1VBQ3BCO1VBQ0EsWUFBWSxlQUFlLFFBQVEsVUFBVSxFQUFFO1VBQy9DO1FBQ0Y7TUFDRjtJQUNBLEtBQUs7TUFBUztRQUNaLGdHQUFnRztRQUNoRyx5QkFBeUI7UUFDekIsdUJBQXVCO1FBQ3ZCLE1BQU0sZUFBZSxDQUFDLFFBQVEsVUFBVSxJQUFJLEVBQUUsRUFBRSxNQUFNLEtBQUs7UUFDM0QsTUFBTSxRQUFRLGdCQUFnQixRQUFRLEtBQUssS0FBSyxLQUFLLFFBQVEsS0FBSyxLQUFLLElBQ25FLFFBQVEsS0FBSyxHQUFHLElBQ2hCLFFBQVEsS0FBSztRQUNqQixPQUFPO1VBQ0w7VUFDQSxPQUFPO1VBQ1AsT0FBTztVQUNQLFlBQVksRUFBRTtVQUNkO1FBQ0Y7TUFDRjtJQUNBLEtBQUs7TUFBUztRQUNaLGdHQUFnRztRQUNoRyx5QkFBeUI7UUFDekIsdUJBQXVCO1FBQ3ZCLE1BQU0sZUFBZSxDQUFDLFFBQVEsVUFBVSxJQUFJLEVBQUUsRUFBRSxNQUFNLEtBQUs7UUFDM0QsTUFBTSxRQUFRLGdCQUFnQixRQUFRLEtBQUssS0FBSyxJQUM1QyxRQUFRLEtBQUssR0FBRyxJQUNoQixRQUFRLEtBQUs7UUFDakIsT0FBTztVQUNMLE9BQU8sUUFBUSxLQUFLO1VBQ3BCO1VBQ0EsT0FBTztVQUNQLFlBQVksRUFBRTtVQUNkO1FBQ0Y7TUFDRjtJQUNBLEtBQUs7TUFBUztRQUNaLHFFQUFxRTtRQUNyRSxvRUFBb0U7UUFDcEUsMkJBQTJCO1FBQzNCLHlCQUF5QjtRQUN6QixNQUFNLGVBQWUsQ0FBQyxRQUFRLFVBQVUsSUFBSSxFQUFFLEVBQUUsTUFBTSxLQUFLO1FBQzNELE1BQU0sUUFBUSxlQUFlLFFBQVEsS0FBSyxHQUFHLElBQUksUUFBUSxLQUFLO1FBQzlELE9BQU87VUFDTCxPQUFPLFFBQVEsS0FBSztVQUNwQixPQUFPLFFBQVEsS0FBSztVQUNwQjtVQUNBLFlBQVksRUFBRTtVQUNkO1FBQ0Y7TUFDRjtJQUNBLEtBQUs7TUFBTztRQUNWLG1DQUFtQztRQUNuQywrQkFBK0I7UUFDL0IsMENBQTBDO1FBQzFDLHNEQUFzRDtRQUN0RCxPQUFPO1VBQ0wsT0FBTyxRQUFRLEtBQUs7VUFDcEIsT0FBTyxRQUFRLEtBQUs7VUFDcEIsT0FBTyxRQUFRLEtBQUs7VUFDcEIsWUFBWSxlQUFlLFFBQVEsVUFBVSxFQUFFO1VBQy9DO1FBQ0Y7TUFDRjtJQUNBO01BQ0UsTUFBTSxJQUFJLE1BQU0sQ0FBQyw0QkFBNEIsRUFBRSxTQUFTO0VBQzVEO0FBQ0YifQ==
// denoCacheMetadata=10314389965405763764,6443231637487190541