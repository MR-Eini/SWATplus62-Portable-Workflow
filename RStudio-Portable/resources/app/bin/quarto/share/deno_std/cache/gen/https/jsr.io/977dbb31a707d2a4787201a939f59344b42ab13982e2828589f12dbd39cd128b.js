// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { COMPARATOR_REGEXP, OPERATOR_XRANGE_REGEXP, parseBuild, parseNumber, parsePrerelease, XRANGE } from "./_shared.ts";
import { ALL, ANY, NONE } from "./constants.ts";
function parseComparator(comparator) {
  const match = comparator.match(COMPARATOR_REGEXP);
  const groups = match?.groups;
  if (!groups) return NONE;
  const { operator, prerelease, buildmetadata } = groups;
  const semver = groups.major ? {
    major: parseNumber(groups.major, "Invalid major version"),
    minor: parseNumber(groups.minor, "Invalid minor version"),
    patch: parseNumber(groups.patch, "Invalid patch version"),
    prerelease: prerelease ? parsePrerelease(prerelease) : [],
    build: buildmetadata ? parseBuild(buildmetadata) : []
  } : ANY;
  return {
    operator: operator || undefined,
    ...semver
  };
}
function isWildcard(id) {
  return !id || id.toLowerCase() === "x" || id === "*";
}
function handleLeftHyphenRangeGroups(leftGroup) {
  if (isWildcard(leftGroup.major)) return;
  if (isWildcard(leftGroup.minor)) {
    return {
      operator: ">=",
      major: +leftGroup.major,
      minor: 0,
      patch: 0,
      prerelease: [],
      build: []
    };
  }
  if (isWildcard(leftGroup.patch)) {
    return {
      operator: ">=",
      major: +leftGroup.major,
      minor: +leftGroup.minor,
      patch: 0,
      prerelease: [],
      build: []
    };
  }
  return {
    operator: ">=",
    major: +leftGroup.major,
    minor: +leftGroup.minor,
    patch: +leftGroup.patch,
    prerelease: leftGroup.prerelease ? parsePrerelease(leftGroup.prerelease) : [],
    build: []
  };
}
function handleRightHyphenRangeGroups(rightGroups) {
  if (isWildcard(rightGroups.major)) {
    return;
  }
  if (isWildcard(rightGroups.minor)) {
    return {
      operator: "<",
      major: +rightGroups.major + 1,
      minor: 0,
      patch: 0,
      prerelease: [],
      build: []
    };
  }
  if (isWildcard(rightGroups.patch)) {
    return {
      operator: "<",
      major: +rightGroups.major,
      minor: +rightGroups.minor + 1,
      patch: 0,
      prerelease: [],
      build: []
    };
  }
  if (rightGroups.prerelease) {
    return {
      operator: "<=",
      major: +rightGroups.major,
      minor: +rightGroups.minor,
      patch: +rightGroups.patch,
      prerelease: parsePrerelease(rightGroups.prerelease),
      build: []
    };
  }
  return {
    operator: "<=",
    major: +rightGroups.major,
    minor: +rightGroups.minor,
    patch: +rightGroups.patch,
    prerelease: rightGroups.prerelease ? parsePrerelease(rightGroups.prerelease) : [],
    build: []
  };
}
function parseHyphenRange(range) {
  const leftMatch = range.match(new RegExp(`^${XRANGE}`));
  const leftGroup = leftMatch?.groups;
  if (!leftGroup) return;
  const leftLength = leftMatch[0].length;
  const hyphenMatch = range.slice(leftLength).match(/^\s+-\s+/);
  if (!hyphenMatch) return;
  const hyphenLength = hyphenMatch[0].length;
  const rightMatch = range.slice(leftLength + hyphenLength).match(new RegExp(`^${XRANGE}\\s*$`));
  const rightGroups = rightMatch?.groups;
  if (!rightGroups) return;
  const from = handleLeftHyphenRangeGroups(leftGroup);
  const to = handleRightHyphenRangeGroups(rightGroups);
  return [
    from,
    to
  ].filter(Boolean);
}
function handleCaretOperator(groups) {
  const majorIsWildcard = isWildcard(groups.major);
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (majorIsWildcard) return [
    ALL
  ];
  if (minorIsWildcard) {
    return [
      {
        operator: ">=",
        major,
        minor: 0,
        patch: 0
      },
      {
        operator: "<",
        major: major + 1,
        minor: 0,
        patch: 0
      }
    ];
  }
  if (patchIsWildcard) {
    if (major === 0) {
      return [
        {
          operator: ">=",
          major,
          minor,
          patch: 0
        },
        {
          operator: "<",
          major,
          minor: minor + 1,
          patch: 0
        }
      ];
    }
    return [
      {
        operator: ">=",
        major,
        minor,
        patch: 0
      },
      {
        operator: "<",
        major: major + 1,
        minor: 0,
        patch: 0
      }
    ];
  }
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  if (major === 0) {
    if (minor === 0) {
      return [
        {
          operator: ">=",
          major,
          minor,
          patch,
          prerelease
        },
        {
          operator: "<",
          major,
          minor,
          patch: patch + 1
        }
      ];
    }
    return [
      {
        operator: ">=",
        major,
        minor,
        patch,
        prerelease
      },
      {
        operator: "<",
        major,
        minor: minor + 1,
        patch: 0
      }
    ];
  }
  return [
    {
      operator: ">=",
      major,
      minor,
      patch,
      prerelease
    },
    {
      operator: "<",
      major: major + 1,
      minor: 0,
      patch: 0
    }
  ];
}
function handleTildeOperator(groups) {
  const majorIsWildcard = isWildcard(groups.major);
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (majorIsWildcard) return [
    ALL
  ];
  if (minorIsWildcard) {
    return [
      {
        operator: ">=",
        major,
        minor: 0,
        patch: 0
      },
      {
        operator: "<",
        major: major + 1,
        minor: 0,
        patch: 0
      }
    ];
  }
  if (patchIsWildcard) {
    return [
      {
        operator: ">=",
        major,
        minor,
        patch: 0
      },
      {
        operator: "<",
        major,
        minor: minor + 1,
        patch: 0
      }
    ];
  }
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  return [
    {
      operator: ">=",
      major,
      minor,
      patch,
      prerelease
    },
    {
      operator: "<",
      major,
      minor: minor + 1,
      patch: 0
    }
  ];
}
function handleLessThanOperator(groups) {
  const majorIsWildcard = isWildcard(groups.major);
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (majorIsWildcard) return [
    {
      operator: "<",
      major: 0,
      minor: 0,
      patch: 0
    }
  ];
  if (minorIsWildcard) {
    if (patchIsWildcard) return [
      {
        operator: "<",
        major,
        minor: 0,
        patch: 0
      }
    ];
    return [
      {
        operator: "<",
        major,
        minor,
        patch: 0
      }
    ];
  }
  if (patchIsWildcard) return [
    {
      operator: "<",
      major,
      minor,
      patch: 0
    }
  ];
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  const build = parseBuild(groups.build ?? "");
  return [
    {
      operator: "<",
      major,
      minor,
      patch,
      prerelease,
      build
    }
  ];
}
function handleLessThanOrEqualOperator(groups) {
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (minorIsWildcard) {
    if (patchIsWildcard) {
      return [
        {
          operator: "<",
          major: major + 1,
          minor: 0,
          patch: 0
        }
      ];
    }
    return [
      {
        operator: "<",
        major,
        minor: minor + 1,
        patch: 0
      }
    ];
  }
  if (patchIsWildcard) {
    return [
      {
        operator: "<",
        major,
        minor: minor + 1,
        patch: 0
      }
    ];
  }
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  const build = parseBuild(groups.build ?? "");
  return [
    {
      operator: "<=",
      major,
      minor,
      patch,
      prerelease,
      build
    }
  ];
}
function handleGreaterThanOperator(groups) {
  const majorIsWildcard = isWildcard(groups.major);
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (majorIsWildcard) return [
    {
      operator: "<",
      major: 0,
      minor: 0,
      patch: 0
    }
  ];
  if (minorIsWildcard) {
    return [
      {
        operator: ">=",
        major: major + 1,
        minor: 0,
        patch: 0
      }
    ];
  }
  if (patchIsWildcard) {
    return [
      {
        operator: ">=",
        major,
        minor: minor + 1,
        patch: 0
      }
    ];
  }
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  const build = parseBuild(groups.build ?? "");
  return [
    {
      operator: ">",
      major,
      minor,
      patch,
      prerelease,
      build
    }
  ];
}
function handleGreaterOrEqualOperator(groups) {
  const majorIsWildcard = isWildcard(groups.major);
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (majorIsWildcard) return [
    ALL
  ];
  if (minorIsWildcard) {
    if (patchIsWildcard) return [
      {
        operator: ">=",
        major,
        minor: 0,
        patch: 0
      }
    ];
    return [
      {
        operator: ">=",
        major,
        minor,
        patch: 0
      }
    ];
  }
  if (patchIsWildcard) return [
    {
      operator: ">=",
      major,
      minor,
      patch: 0
    }
  ];
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  const build = parseBuild(groups.build ?? "");
  return [
    {
      operator: ">=",
      major,
      minor,
      patch,
      prerelease,
      build
    }
  ];
}
function handleEqualOperator(groups) {
  const majorIsWildcard = isWildcard(groups.major);
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (majorIsWildcard) return [
    ALL
  ];
  if (minorIsWildcard) {
    return [
      {
        operator: ">=",
        major,
        minor: 0,
        patch: 0
      },
      {
        operator: "<",
        major: major + 1,
        minor: 0,
        patch: 0
      }
    ];
  }
  if (patchIsWildcard) {
    return [
      {
        operator: ">=",
        major,
        minor,
        patch: 0
      },
      {
        operator: "<",
        major,
        minor: minor + 1,
        patch: 0
      }
    ];
  }
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  const build = parseBuild(groups.build ?? "");
  return [
    {
      operator: undefined,
      major,
      minor,
      patch,
      prerelease,
      build
    }
  ];
}
function parseOperatorRange(string) {
  const groups = string.match(OPERATOR_XRANGE_REGEXP)?.groups;
  if (!groups) return parseComparator(string);
  switch(groups.operator){
    case "^":
      return handleCaretOperator(groups);
    case "~":
    case "~>":
      return handleTildeOperator(groups);
    case "<":
      return handleLessThanOperator(groups);
    case "<=":
      return handleLessThanOrEqualOperator(groups);
    case ">":
      return handleGreaterThanOperator(groups);
    case ">=":
      return handleGreaterOrEqualOperator(groups);
    case "=":
    case "":
      return handleEqualOperator(groups);
    default:
      throw new Error(`'${groups.operator}' is not a valid operator.`);
  }
}
function parseOperatorRanges(string) {
  return string.split(/\s+/).flatMap(parseOperatorRange);
}
/**
 * Parses a range string into a Range object or throws a TypeError.
 *
 * @example Usage
 * ```ts
 * import { parseRange } from "@std/semver/parse-range";
 * import { assertEquals } from "@std/assert/assert-equals";
 *
 * const range = parseRange(">=1.0.0 <2.0.0 || >=3.0.0");
 * assertEquals(range, [
 *   [
 *     { operator: ">=", major: 1, minor: 0, patch: 0, prerelease: [], build: [] },
 *     { operator: "<", major: 2, minor: 0, patch: 0, prerelease: [], build: [] },
 *   ],
 *   [
 *     { operator: ">=", major: 3, minor: 0, patch: 0, prerelease: [], build: [] },
 *   ]
 * ]);
 * ```
 *
 * @param range The range set string
 * @returns A valid semantic range
 */ export function parseRange(range) {
  return range// remove spaces between operators and versions
  .replaceAll(/(?<=<|>|=) +/g, "").split(/\s*\|\|\s*/).map((string)=>parseHyphenRange(string) || parseOperatorRanges(string));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvc2VtdmVyLzAuMjI0LjMvcGFyc2VfcmFuZ2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHtcbiAgQ09NUEFSQVRPUl9SRUdFWFAsXG4gIE9QRVJBVE9SX1hSQU5HRV9SRUdFWFAsXG4gIHBhcnNlQnVpbGQsXG4gIHBhcnNlTnVtYmVyLFxuICBwYXJzZVByZXJlbGVhc2UsXG4gIFhSQU5HRSxcbn0gZnJvbSBcIi4vX3NoYXJlZC50c1wiO1xuaW1wb3J0IHsgQUxMLCBBTlksIE5PTkUgfSBmcm9tIFwiLi9jb25zdGFudHMudHNcIjtcbmltcG9ydCB0eXBlIHsgQ29tcGFyYXRvciwgT3BlcmF0b3IsIFJhbmdlIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcblxudHlwZSBDb21wYXJhdG9yUmVnRXhwR3JvdXAgPSB7XG4gIG9wZXJhdG9yOiBPcGVyYXRvcjtcbiAgbWFqb3I6IHN0cmluZztcbiAgbWlub3I6IHN0cmluZztcbiAgcGF0Y2g6IHN0cmluZztcbiAgcHJlcmVsZWFzZTogc3RyaW5nO1xuICBidWlsZG1ldGFkYXRhOiBzdHJpbmc7XG59O1xuXG5mdW5jdGlvbiBwYXJzZUNvbXBhcmF0b3IoY29tcGFyYXRvcjogc3RyaW5nKTogQ29tcGFyYXRvciB7XG4gIGNvbnN0IG1hdGNoID0gY29tcGFyYXRvci5tYXRjaChDT01QQVJBVE9SX1JFR0VYUCk7XG4gIGNvbnN0IGdyb3VwcyA9IG1hdGNoPy5ncm91cHM7XG5cbiAgaWYgKCFncm91cHMpIHJldHVybiBOT05FO1xuXG4gIGNvbnN0IHsgb3BlcmF0b3IsIHByZXJlbGVhc2UsIGJ1aWxkbWV0YWRhdGEgfSA9XG4gICAgZ3JvdXBzIGFzIENvbXBhcmF0b3JSZWdFeHBHcm91cDtcblxuICBjb25zdCBzZW12ZXIgPSBncm91cHMubWFqb3JcbiAgICA/IHtcbiAgICAgIG1ham9yOiBwYXJzZU51bWJlcihncm91cHMubWFqb3IsIFwiSW52YWxpZCBtYWpvciB2ZXJzaW9uXCIpLFxuICAgICAgbWlub3I6IHBhcnNlTnVtYmVyKFxuICAgICAgICBncm91cHMubWlub3IhLFxuICAgICAgICBcIkludmFsaWQgbWlub3IgdmVyc2lvblwiLFxuICAgICAgKSxcbiAgICAgIHBhdGNoOiBwYXJzZU51bWJlcihcbiAgICAgICAgZ3JvdXBzLnBhdGNoISxcbiAgICAgICAgXCJJbnZhbGlkIHBhdGNoIHZlcnNpb25cIixcbiAgICAgICksXG4gICAgICBwcmVyZWxlYXNlOiBwcmVyZWxlYXNlID8gcGFyc2VQcmVyZWxlYXNlKHByZXJlbGVhc2UpIDogW10sXG4gICAgICBidWlsZDogYnVpbGRtZXRhZGF0YSA/IHBhcnNlQnVpbGQoYnVpbGRtZXRhZGF0YSkgOiBbXSxcbiAgICB9XG4gICAgOiBBTlk7XG5cbiAgcmV0dXJuIHsgb3BlcmF0b3I6IG9wZXJhdG9yIHx8IHVuZGVmaW5lZCwgLi4uc2VtdmVyIH07XG59XG5cbmZ1bmN0aW9uIGlzV2lsZGNhcmQoaWQ/OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuICFpZCB8fCBpZC50b0xvd2VyQ2FzZSgpID09PSBcInhcIiB8fCBpZCA9PT0gXCIqXCI7XG59XG5cbnR5cGUgUmFuZ2VSZWdFeHBHcm91cHMgPSB7XG4gIG9wZXJhdG9yOiBzdHJpbmc7XG4gIG1ham9yOiBzdHJpbmc7XG4gIG1pbm9yOiBzdHJpbmc7XG4gIHBhdGNoOiBzdHJpbmc7XG4gIHByZXJlbGVhc2U/OiBzdHJpbmc7XG4gIGJ1aWxkPzogc3RyaW5nO1xufTtcblxuZnVuY3Rpb24gaGFuZGxlTGVmdEh5cGhlblJhbmdlR3JvdXBzKFxuICBsZWZ0R3JvdXA6IFJhbmdlUmVnRXhwR3JvdXBzLFxuKTogQ29tcGFyYXRvciB8IHVuZGVmaW5lZCB7XG4gIGlmIChpc1dpbGRjYXJkKGxlZnRHcm91cC5tYWpvcikpIHJldHVybjtcbiAgaWYgKGlzV2lsZGNhcmQobGVmdEdyb3VwLm1pbm9yKSkge1xuICAgIHJldHVybiB7XG4gICAgICBvcGVyYXRvcjogXCI+PVwiLFxuICAgICAgbWFqb3I6ICtsZWZ0R3JvdXAubWFqb3IsXG4gICAgICBtaW5vcjogMCxcbiAgICAgIHBhdGNoOiAwLFxuICAgICAgcHJlcmVsZWFzZTogW10sXG4gICAgICBidWlsZDogW10sXG4gICAgfTtcbiAgfVxuICBpZiAoaXNXaWxkY2FyZChsZWZ0R3JvdXAucGF0Y2gpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9wZXJhdG9yOiBcIj49XCIsXG4gICAgICBtYWpvcjogK2xlZnRHcm91cC5tYWpvcixcbiAgICAgIG1pbm9yOiArbGVmdEdyb3VwLm1pbm9yLFxuICAgICAgcGF0Y2g6IDAsXG4gICAgICBwcmVyZWxlYXNlOiBbXSxcbiAgICAgIGJ1aWxkOiBbXSxcbiAgICB9O1xuICB9XG4gIHJldHVybiB7XG4gICAgb3BlcmF0b3I6IFwiPj1cIixcbiAgICBtYWpvcjogK2xlZnRHcm91cC5tYWpvcixcbiAgICBtaW5vcjogK2xlZnRHcm91cC5taW5vcixcbiAgICBwYXRjaDogK2xlZnRHcm91cC5wYXRjaCxcbiAgICBwcmVyZWxlYXNlOiBsZWZ0R3JvdXAucHJlcmVsZWFzZVxuICAgICAgPyBwYXJzZVByZXJlbGVhc2UobGVmdEdyb3VwLnByZXJlbGVhc2UpXG4gICAgICA6IFtdLFxuICAgIGJ1aWxkOiBbXSxcbiAgfTtcbn1cbmZ1bmN0aW9uIGhhbmRsZVJpZ2h0SHlwaGVuUmFuZ2VHcm91cHMoXG4gIHJpZ2h0R3JvdXBzOiBSYW5nZVJlZ0V4cEdyb3Vwcyxcbik6IENvbXBhcmF0b3IgfCB1bmRlZmluZWQge1xuICBpZiAoaXNXaWxkY2FyZChyaWdodEdyb3Vwcy5tYWpvcikpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGlzV2lsZGNhcmQocmlnaHRHcm91cHMubWlub3IpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9wZXJhdG9yOiBcIjxcIixcbiAgICAgIG1ham9yOiArcmlnaHRHcm91cHMubWFqb3IhICsgMSxcbiAgICAgIG1pbm9yOiAwLFxuICAgICAgcGF0Y2g6IDAsXG4gICAgICBwcmVyZWxlYXNlOiBbXSxcbiAgICAgIGJ1aWxkOiBbXSxcbiAgICB9O1xuICB9XG4gIGlmIChpc1dpbGRjYXJkKHJpZ2h0R3JvdXBzLnBhdGNoKSkge1xuICAgIHJldHVybiB7XG4gICAgICBvcGVyYXRvcjogXCI8XCIsXG4gICAgICBtYWpvcjogK3JpZ2h0R3JvdXBzLm1ham9yLFxuICAgICAgbWlub3I6ICtyaWdodEdyb3Vwcy5taW5vciEgKyAxLFxuICAgICAgcGF0Y2g6IDAsXG4gICAgICBwcmVyZWxlYXNlOiBbXSxcbiAgICAgIGJ1aWxkOiBbXSxcbiAgICB9O1xuICB9XG4gIGlmIChyaWdodEdyb3Vwcy5wcmVyZWxlYXNlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9wZXJhdG9yOiBcIjw9XCIsXG4gICAgICBtYWpvcjogK3JpZ2h0R3JvdXBzLm1ham9yLFxuICAgICAgbWlub3I6ICtyaWdodEdyb3Vwcy5taW5vcixcbiAgICAgIHBhdGNoOiArcmlnaHRHcm91cHMucGF0Y2gsXG4gICAgICBwcmVyZWxlYXNlOiBwYXJzZVByZXJlbGVhc2UocmlnaHRHcm91cHMucHJlcmVsZWFzZSksXG4gICAgICBidWlsZDogW10sXG4gICAgfTtcbiAgfVxuICByZXR1cm4ge1xuICAgIG9wZXJhdG9yOiBcIjw9XCIsXG4gICAgbWFqb3I6ICtyaWdodEdyb3Vwcy5tYWpvcixcbiAgICBtaW5vcjogK3JpZ2h0R3JvdXBzLm1pbm9yLFxuICAgIHBhdGNoOiArcmlnaHRHcm91cHMucGF0Y2gsXG4gICAgcHJlcmVsZWFzZTogcmlnaHRHcm91cHMucHJlcmVsZWFzZVxuICAgICAgPyBwYXJzZVByZXJlbGVhc2UocmlnaHRHcm91cHMucHJlcmVsZWFzZSlcbiAgICAgIDogW10sXG4gICAgYnVpbGQ6IFtdLFxuICB9O1xufVxuZnVuY3Rpb24gcGFyc2VIeXBoZW5SYW5nZShyYW5nZTogc3RyaW5nKTogQ29tcGFyYXRvcltdIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgbGVmdE1hdGNoID0gcmFuZ2UubWF0Y2gobmV3IFJlZ0V4cChgXiR7WFJBTkdFfWApKTtcbiAgY29uc3QgbGVmdEdyb3VwID0gbGVmdE1hdGNoPy5ncm91cHM7XG4gIGlmICghbGVmdEdyb3VwKSByZXR1cm47XG4gIGNvbnN0IGxlZnRMZW5ndGggPSBsZWZ0TWF0Y2hbMF0ubGVuZ3RoO1xuXG4gIGNvbnN0IGh5cGhlbk1hdGNoID0gcmFuZ2Uuc2xpY2UobGVmdExlbmd0aCkubWF0Y2goL15cXHMrLVxccysvKTtcbiAgaWYgKCFoeXBoZW5NYXRjaCkgcmV0dXJuO1xuICBjb25zdCBoeXBoZW5MZW5ndGggPSBoeXBoZW5NYXRjaFswXS5sZW5ndGg7XG5cbiAgY29uc3QgcmlnaHRNYXRjaCA9IHJhbmdlLnNsaWNlKGxlZnRMZW5ndGggKyBoeXBoZW5MZW5ndGgpLm1hdGNoKFxuICAgIG5ldyBSZWdFeHAoYF4ke1hSQU5HRX1cXFxccyokYCksXG4gICk7XG4gIGNvbnN0IHJpZ2h0R3JvdXBzID0gcmlnaHRNYXRjaD8uZ3JvdXBzO1xuICBpZiAoIXJpZ2h0R3JvdXBzKSByZXR1cm47XG5cbiAgY29uc3QgZnJvbSA9IGhhbmRsZUxlZnRIeXBoZW5SYW5nZUdyb3VwcyhsZWZ0R3JvdXAgYXMgUmFuZ2VSZWdFeHBHcm91cHMpO1xuICBjb25zdCB0byA9IGhhbmRsZVJpZ2h0SHlwaGVuUmFuZ2VHcm91cHMocmlnaHRHcm91cHMgYXMgUmFuZ2VSZWdFeHBHcm91cHMpO1xuICByZXR1cm4gW2Zyb20sIHRvXS5maWx0ZXIoQm9vbGVhbikgYXMgQ29tcGFyYXRvcltdO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVDYXJldE9wZXJhdG9yKGdyb3VwczogUmFuZ2VSZWdFeHBHcm91cHMpOiBDb21wYXJhdG9yW10ge1xuICBjb25zdCBtYWpvcklzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5tYWpvcik7XG4gIGNvbnN0IG1pbm9ySXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLm1pbm9yKTtcbiAgY29uc3QgcGF0Y2hJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMucGF0Y2gpO1xuXG4gIGNvbnN0IG1ham9yID0gK2dyb3Vwcy5tYWpvcjtcbiAgY29uc3QgbWlub3IgPSArZ3JvdXBzLm1pbm9yO1xuICBjb25zdCBwYXRjaCA9ICtncm91cHMucGF0Y2g7XG5cbiAgaWYgKG1ham9ySXNXaWxkY2FyZCkgcmV0dXJuIFtBTExdO1xuICBpZiAobWlub3JJc1dpbGRjYXJkKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgb3BlcmF0b3I6IFwiPj1cIiwgbWFqb3IsIG1pbm9yOiAwLCBwYXRjaDogMCB9LFxuICAgICAgeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yOiBtYWpvciArIDEsIG1pbm9yOiAwLCBwYXRjaDogMCB9LFxuICAgIF07XG4gIH1cbiAgaWYgKHBhdGNoSXNXaWxkY2FyZCkge1xuICAgIGlmIChtYWpvciA9PT0gMCkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgeyBvcGVyYXRvcjogXCI+PVwiLCBtYWpvciwgbWlub3IsIHBhdGNoOiAwIH0sXG4gICAgICAgIHsgb3BlcmF0b3I6IFwiPFwiLCBtYWpvciwgbWlub3I6IG1pbm9yICsgMSwgcGF0Y2g6IDAgfSxcbiAgICAgIF07XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICB7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vciwgcGF0Y2g6IDAgfSxcbiAgICAgIHsgb3BlcmF0b3I6IFwiPFwiLCBtYWpvcjogbWFqb3IgKyAxLCBtaW5vcjogMCwgcGF0Y2g6IDAgfSxcbiAgICBdO1xuICB9XG5cbiAgY29uc3QgcHJlcmVsZWFzZSA9IHBhcnNlUHJlcmVsZWFzZShncm91cHMucHJlcmVsZWFzZSA/PyBcIlwiKTtcbiAgaWYgKG1ham9yID09PSAwKSB7XG4gICAgaWYgKG1pbm9yID09PSAwKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vciwgcGF0Y2gsIHByZXJlbGVhc2UgfSxcbiAgICAgICAgeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yLCBtaW5vciwgcGF0Y2g6IHBhdGNoICsgMSB9LFxuICAgICAgXTtcbiAgICB9XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgb3BlcmF0b3I6IFwiPj1cIiwgbWFqb3IsIG1pbm9yLCBwYXRjaCwgcHJlcmVsZWFzZSB9LFxuICAgICAgeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yLCBtaW5vcjogbWlub3IgKyAxLCBwYXRjaDogMCB9LFxuICAgIF07XG4gIH1cbiAgcmV0dXJuIFtcbiAgICB7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vciwgcGF0Y2gsIHByZXJlbGVhc2UgfSxcbiAgICB7IG9wZXJhdG9yOiBcIjxcIiwgbWFqb3I6IG1ham9yICsgMSwgbWlub3I6IDAsIHBhdGNoOiAwIH0sXG4gIF07XG59XG5mdW5jdGlvbiBoYW5kbGVUaWxkZU9wZXJhdG9yKGdyb3VwczogUmFuZ2VSZWdFeHBHcm91cHMpOiBDb21wYXJhdG9yW10ge1xuICBjb25zdCBtYWpvcklzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5tYWpvcik7XG4gIGNvbnN0IG1pbm9ySXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLm1pbm9yKTtcbiAgY29uc3QgcGF0Y2hJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMucGF0Y2gpO1xuXG4gIGNvbnN0IG1ham9yID0gK2dyb3Vwcy5tYWpvcjtcbiAgY29uc3QgbWlub3IgPSArZ3JvdXBzLm1pbm9yO1xuICBjb25zdCBwYXRjaCA9ICtncm91cHMucGF0Y2g7XG5cbiAgaWYgKG1ham9ySXNXaWxkY2FyZCkgcmV0dXJuIFtBTExdO1xuICBpZiAobWlub3JJc1dpbGRjYXJkKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgb3BlcmF0b3I6IFwiPj1cIiwgbWFqb3IsIG1pbm9yOiAwLCBwYXRjaDogMCB9LFxuICAgICAgeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yOiBtYWpvciArIDEsIG1pbm9yOiAwLCBwYXRjaDogMCB9LFxuICAgIF07XG4gIH1cbiAgaWYgKHBhdGNoSXNXaWxkY2FyZCkge1xuICAgIHJldHVybiBbXG4gICAgICB7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vciwgcGF0Y2g6IDAgfSxcbiAgICAgIHsgb3BlcmF0b3I6IFwiPFwiLCBtYWpvciwgbWlub3I6IG1pbm9yICsgMSwgcGF0Y2g6IDAgfSxcbiAgICBdO1xuICB9XG4gIGNvbnN0IHByZXJlbGVhc2UgPSBwYXJzZVByZXJlbGVhc2UoZ3JvdXBzLnByZXJlbGVhc2UgPz8gXCJcIik7XG4gIHJldHVybiBbXG4gICAgeyBvcGVyYXRvcjogXCI+PVwiLCBtYWpvciwgbWlub3IsIHBhdGNoLCBwcmVyZWxlYXNlIH0sXG4gICAgeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yLCBtaW5vcjogbWlub3IgKyAxLCBwYXRjaDogMCB9LFxuICBdO1xufVxuZnVuY3Rpb24gaGFuZGxlTGVzc1RoYW5PcGVyYXRvcihncm91cHM6IFJhbmdlUmVnRXhwR3JvdXBzKTogQ29tcGFyYXRvcltdIHtcbiAgY29uc3QgbWFqb3JJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMubWFqb3IpO1xuICBjb25zdCBtaW5vcklzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5taW5vcik7XG4gIGNvbnN0IHBhdGNoSXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLnBhdGNoKTtcblxuICBjb25zdCBtYWpvciA9ICtncm91cHMubWFqb3I7XG4gIGNvbnN0IG1pbm9yID0gK2dyb3Vwcy5taW5vcjtcbiAgY29uc3QgcGF0Y2ggPSArZ3JvdXBzLnBhdGNoO1xuXG4gIGlmIChtYWpvcklzV2lsZGNhcmQpIHJldHVybiBbeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yOiAwLCBtaW5vcjogMCwgcGF0Y2g6IDAgfV07XG4gIGlmIChtaW5vcklzV2lsZGNhcmQpIHtcbiAgICBpZiAocGF0Y2hJc1dpbGRjYXJkKSByZXR1cm4gW3sgb3BlcmF0b3I6IFwiPFwiLCBtYWpvciwgbWlub3I6IDAsIHBhdGNoOiAwIH1dO1xuICAgIHJldHVybiBbeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yLCBtaW5vciwgcGF0Y2g6IDAgfV07XG4gIH1cbiAgaWYgKHBhdGNoSXNXaWxkY2FyZCkgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIjxcIiwgbWFqb3IsIG1pbm9yLCBwYXRjaDogMCB9XTtcbiAgY29uc3QgcHJlcmVsZWFzZSA9IHBhcnNlUHJlcmVsZWFzZShncm91cHMucHJlcmVsZWFzZSA/PyBcIlwiKTtcbiAgY29uc3QgYnVpbGQgPSBwYXJzZUJ1aWxkKGdyb3Vwcy5idWlsZCA/PyBcIlwiKTtcbiAgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIjxcIiwgbWFqb3IsIG1pbm9yLCBwYXRjaCwgcHJlcmVsZWFzZSwgYnVpbGQgfV07XG59XG5mdW5jdGlvbiBoYW5kbGVMZXNzVGhhbk9yRXF1YWxPcGVyYXRvcihcbiAgZ3JvdXBzOiBSYW5nZVJlZ0V4cEdyb3Vwcyxcbik6IENvbXBhcmF0b3JbXSB7XG4gIGNvbnN0IG1pbm9ySXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLm1pbm9yKTtcbiAgY29uc3QgcGF0Y2hJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMucGF0Y2gpO1xuXG4gIGNvbnN0IG1ham9yID0gK2dyb3Vwcy5tYWpvcjtcbiAgY29uc3QgbWlub3IgPSArZ3JvdXBzLm1pbm9yO1xuICBjb25zdCBwYXRjaCA9ICtncm91cHMucGF0Y2g7XG5cbiAgaWYgKG1pbm9ySXNXaWxkY2FyZCkge1xuICAgIGlmIChwYXRjaElzV2lsZGNhcmQpIHtcbiAgICAgIHJldHVybiBbeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yOiBtYWpvciArIDEsIG1pbm9yOiAwLCBwYXRjaDogMCB9XTtcbiAgICB9XG4gICAgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIjxcIiwgbWFqb3IsIG1pbm9yOiBtaW5vciArIDEsIHBhdGNoOiAwIH1dO1xuICB9XG4gIGlmIChwYXRjaElzV2lsZGNhcmQpIHtcbiAgICByZXR1cm4gW3sgb3BlcmF0b3I6IFwiPFwiLCBtYWpvciwgbWlub3I6IG1pbm9yICsgMSwgcGF0Y2g6IDAgfV07XG4gIH1cbiAgY29uc3QgcHJlcmVsZWFzZSA9IHBhcnNlUHJlcmVsZWFzZShncm91cHMucHJlcmVsZWFzZSA/PyBcIlwiKTtcbiAgY29uc3QgYnVpbGQgPSBwYXJzZUJ1aWxkKGdyb3Vwcy5idWlsZCA/PyBcIlwiKTtcbiAgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIjw9XCIsIG1ham9yLCBtaW5vciwgcGF0Y2gsIHByZXJlbGVhc2UsIGJ1aWxkIH1dO1xufVxuZnVuY3Rpb24gaGFuZGxlR3JlYXRlclRoYW5PcGVyYXRvcihncm91cHM6IFJhbmdlUmVnRXhwR3JvdXBzKTogQ29tcGFyYXRvcltdIHtcbiAgY29uc3QgbWFqb3JJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMubWFqb3IpO1xuICBjb25zdCBtaW5vcklzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5taW5vcik7XG4gIGNvbnN0IHBhdGNoSXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLnBhdGNoKTtcblxuICBjb25zdCBtYWpvciA9ICtncm91cHMubWFqb3I7XG4gIGNvbnN0IG1pbm9yID0gK2dyb3Vwcy5taW5vcjtcbiAgY29uc3QgcGF0Y2ggPSArZ3JvdXBzLnBhdGNoO1xuXG4gIGlmIChtYWpvcklzV2lsZGNhcmQpIHJldHVybiBbeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yOiAwLCBtaW5vcjogMCwgcGF0Y2g6IDAgfV07XG5cbiAgaWYgKG1pbm9ySXNXaWxkY2FyZCkge1xuICAgIHJldHVybiBbeyBvcGVyYXRvcjogXCI+PVwiLCBtYWpvcjogbWFqb3IgKyAxLCBtaW5vcjogMCwgcGF0Y2g6IDAgfV07XG4gIH1cbiAgaWYgKHBhdGNoSXNXaWxkY2FyZCkge1xuICAgIHJldHVybiBbeyBvcGVyYXRvcjogXCI+PVwiLCBtYWpvciwgbWlub3I6IG1pbm9yICsgMSwgcGF0Y2g6IDAgfV07XG4gIH1cbiAgY29uc3QgcHJlcmVsZWFzZSA9IHBhcnNlUHJlcmVsZWFzZShncm91cHMucHJlcmVsZWFzZSA/PyBcIlwiKTtcbiAgY29uc3QgYnVpbGQgPSBwYXJzZUJ1aWxkKGdyb3Vwcy5idWlsZCA/PyBcIlwiKTtcbiAgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIj5cIiwgbWFqb3IsIG1pbm9yLCBwYXRjaCwgcHJlcmVsZWFzZSwgYnVpbGQgfV07XG59XG5mdW5jdGlvbiBoYW5kbGVHcmVhdGVyT3JFcXVhbE9wZXJhdG9yKGdyb3VwczogUmFuZ2VSZWdFeHBHcm91cHMpOiBDb21wYXJhdG9yW10ge1xuICBjb25zdCBtYWpvcklzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5tYWpvcik7XG4gIGNvbnN0IG1pbm9ySXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLm1pbm9yKTtcbiAgY29uc3QgcGF0Y2hJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMucGF0Y2gpO1xuXG4gIGNvbnN0IG1ham9yID0gK2dyb3Vwcy5tYWpvcjtcbiAgY29uc3QgbWlub3IgPSArZ3JvdXBzLm1pbm9yO1xuICBjb25zdCBwYXRjaCA9ICtncm91cHMucGF0Y2g7XG5cbiAgaWYgKG1ham9ySXNXaWxkY2FyZCkgcmV0dXJuIFtBTExdO1xuICBpZiAobWlub3JJc1dpbGRjYXJkKSB7XG4gICAgaWYgKHBhdGNoSXNXaWxkY2FyZCkgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vcjogMCwgcGF0Y2g6IDAgfV07XG4gICAgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vciwgcGF0Y2g6IDAgfV07XG4gIH1cbiAgaWYgKHBhdGNoSXNXaWxkY2FyZCkgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vciwgcGF0Y2g6IDAgfV07XG4gIGNvbnN0IHByZXJlbGVhc2UgPSBwYXJzZVByZXJlbGVhc2UoZ3JvdXBzLnByZXJlbGVhc2UgPz8gXCJcIik7XG4gIGNvbnN0IGJ1aWxkID0gcGFyc2VCdWlsZChncm91cHMuYnVpbGQgPz8gXCJcIik7XG4gIHJldHVybiBbeyBvcGVyYXRvcjogXCI+PVwiLCBtYWpvciwgbWlub3IsIHBhdGNoLCBwcmVyZWxlYXNlLCBidWlsZCB9XTtcbn1cbmZ1bmN0aW9uIGhhbmRsZUVxdWFsT3BlcmF0b3IoZ3JvdXBzOiBSYW5nZVJlZ0V4cEdyb3Vwcyk6IENvbXBhcmF0b3JbXSB7XG4gIGNvbnN0IG1ham9ySXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLm1ham9yKTtcbiAgY29uc3QgbWlub3JJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMubWlub3IpO1xuICBjb25zdCBwYXRjaElzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5wYXRjaCk7XG5cbiAgY29uc3QgbWFqb3IgPSArZ3JvdXBzLm1ham9yO1xuICBjb25zdCBtaW5vciA9ICtncm91cHMubWlub3I7XG4gIGNvbnN0IHBhdGNoID0gK2dyb3Vwcy5wYXRjaDtcblxuICBpZiAobWFqb3JJc1dpbGRjYXJkKSByZXR1cm4gW0FMTF07XG4gIGlmIChtaW5vcklzV2lsZGNhcmQpIHtcbiAgICByZXR1cm4gW1xuICAgICAgeyBvcGVyYXRvcjogXCI+PVwiLCBtYWpvciwgbWlub3I6IDAsIHBhdGNoOiAwIH0sXG4gICAgICB7IG9wZXJhdG9yOiBcIjxcIiwgbWFqb3I6IG1ham9yICsgMSwgbWlub3I6IDAsIHBhdGNoOiAwIH0sXG4gICAgXTtcbiAgfVxuICBpZiAocGF0Y2hJc1dpbGRjYXJkKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgb3BlcmF0b3I6IFwiPj1cIiwgbWFqb3IsIG1pbm9yLCBwYXRjaDogMCB9LFxuICAgICAgeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yLCBtaW5vcjogbWlub3IgKyAxLCBwYXRjaDogMCB9LFxuICAgIF07XG4gIH1cbiAgY29uc3QgcHJlcmVsZWFzZSA9IHBhcnNlUHJlcmVsZWFzZShncm91cHMucHJlcmVsZWFzZSA/PyBcIlwiKTtcbiAgY29uc3QgYnVpbGQgPSBwYXJzZUJ1aWxkKGdyb3Vwcy5idWlsZCA/PyBcIlwiKTtcbiAgcmV0dXJuIFt7IG9wZXJhdG9yOiB1bmRlZmluZWQsIG1ham9yLCBtaW5vciwgcGF0Y2gsIHByZXJlbGVhc2UsIGJ1aWxkIH1dO1xufVxuXG5mdW5jdGlvbiBwYXJzZU9wZXJhdG9yUmFuZ2Uoc3RyaW5nOiBzdHJpbmcpOiBDb21wYXJhdG9yIHwgQ29tcGFyYXRvcltdIHtcbiAgY29uc3QgZ3JvdXBzID0gc3RyaW5nLm1hdGNoKE9QRVJBVE9SX1hSQU5HRV9SRUdFWFApXG4gICAgPy5ncm91cHMgYXMgUmFuZ2VSZWdFeHBHcm91cHM7XG4gIGlmICghZ3JvdXBzKSByZXR1cm4gcGFyc2VDb21wYXJhdG9yKHN0cmluZyk7XG5cbiAgc3dpdGNoIChncm91cHMub3BlcmF0b3IpIHtcbiAgICBjYXNlIFwiXlwiOlxuICAgICAgcmV0dXJuIGhhbmRsZUNhcmV0T3BlcmF0b3IoZ3JvdXBzKTtcbiAgICBjYXNlIFwiflwiOlxuICAgIGNhc2UgXCJ+PlwiOlxuICAgICAgcmV0dXJuIGhhbmRsZVRpbGRlT3BlcmF0b3IoZ3JvdXBzKTtcbiAgICBjYXNlIFwiPFwiOlxuICAgICAgcmV0dXJuIGhhbmRsZUxlc3NUaGFuT3BlcmF0b3IoZ3JvdXBzKTtcbiAgICBjYXNlIFwiPD1cIjpcbiAgICAgIHJldHVybiBoYW5kbGVMZXNzVGhhbk9yRXF1YWxPcGVyYXRvcihncm91cHMpO1xuICAgIGNhc2UgXCI+XCI6XG4gICAgICByZXR1cm4gaGFuZGxlR3JlYXRlclRoYW5PcGVyYXRvcihncm91cHMpO1xuICAgIGNhc2UgXCI+PVwiOlxuICAgICAgcmV0dXJuIGhhbmRsZUdyZWF0ZXJPckVxdWFsT3BlcmF0b3IoZ3JvdXBzKTtcbiAgICBjYXNlIFwiPVwiOlxuICAgIGNhc2UgXCJcIjpcbiAgICAgIHJldHVybiBoYW5kbGVFcXVhbE9wZXJhdG9yKGdyb3Vwcyk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7Z3JvdXBzLm9wZXJhdG9yfScgaXMgbm90IGEgdmFsaWQgb3BlcmF0b3IuYCk7XG4gIH1cbn1cbmZ1bmN0aW9uIHBhcnNlT3BlcmF0b3JSYW5nZXMoc3RyaW5nOiBzdHJpbmcpOiBDb21wYXJhdG9yW10ge1xuICByZXR1cm4gc3RyaW5nLnNwbGl0KC9cXHMrLykuZmxhdE1hcChwYXJzZU9wZXJhdG9yUmFuZ2UpO1xufVxuXG4vKipcbiAqIFBhcnNlcyBhIHJhbmdlIHN0cmluZyBpbnRvIGEgUmFuZ2Ugb2JqZWN0IG9yIHRocm93cyBhIFR5cGVFcnJvci5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlUmFuZ2UgfSBmcm9tIFwiQHN0ZC9zZW12ZXIvcGFyc2UtcmFuZ2VcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydC9hc3NlcnQtZXF1YWxzXCI7XG4gKlxuICogY29uc3QgcmFuZ2UgPSBwYXJzZVJhbmdlKFwiPj0xLjAuMCA8Mi4wLjAgfHwgPj0zLjAuMFwiKTtcbiAqIGFzc2VydEVxdWFscyhyYW5nZSwgW1xuICogICBbXG4gKiAgICAgeyBvcGVyYXRvcjogXCI+PVwiLCBtYWpvcjogMSwgbWlub3I6IDAsIHBhdGNoOiAwLCBwcmVyZWxlYXNlOiBbXSwgYnVpbGQ6IFtdIH0sXG4gKiAgICAgeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yOiAyLCBtaW5vcjogMCwgcGF0Y2g6IDAsIHByZXJlbGVhc2U6IFtdLCBidWlsZDogW10gfSxcbiAqICAgXSxcbiAqICAgW1xuICogICAgIHsgb3BlcmF0b3I6IFwiPj1cIiwgbWFqb3I6IDMsIG1pbm9yOiAwLCBwYXRjaDogMCwgcHJlcmVsZWFzZTogW10sIGJ1aWxkOiBbXSB9LFxuICogICBdXG4gKiBdKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSByYW5nZSBUaGUgcmFuZ2Ugc2V0IHN0cmluZ1xuICogQHJldHVybnMgQSB2YWxpZCBzZW1hbnRpYyByYW5nZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VSYW5nZShyYW5nZTogc3RyaW5nKTogUmFuZ2Uge1xuICByZXR1cm4gcmFuZ2VcbiAgICAvLyByZW1vdmUgc3BhY2VzIGJldHdlZW4gb3BlcmF0b3JzIGFuZCB2ZXJzaW9uc1xuICAgIC5yZXBsYWNlQWxsKC8oPzw9PHw+fD0pICsvZywgXCJcIilcbiAgICAuc3BsaXQoL1xccypcXHxcXHxcXHMqLylcbiAgICAubWFwKChzdHJpbmcpID0+IHBhcnNlSHlwaGVuUmFuZ2Uoc3RyaW5nKSB8fCBwYXJzZU9wZXJhdG9yUmFuZ2VzKHN0cmluZykpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FDRSxpQkFBaUIsRUFDakIsc0JBQXNCLEVBQ3RCLFVBQVUsRUFDVixXQUFXLEVBQ1gsZUFBZSxFQUNmLE1BQU0sUUFDRCxlQUFlO0FBQ3RCLFNBQVMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLFFBQVEsaUJBQWlCO0FBWWhELFNBQVMsZ0JBQWdCLFVBQWtCO0VBQ3pDLE1BQU0sUUFBUSxXQUFXLEtBQUssQ0FBQztFQUMvQixNQUFNLFNBQVMsT0FBTztFQUV0QixJQUFJLENBQUMsUUFBUSxPQUFPO0VBRXBCLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxHQUMzQztFQUVGLE1BQU0sU0FBUyxPQUFPLEtBQUssR0FDdkI7SUFDQSxPQUFPLFlBQVksT0FBTyxLQUFLLEVBQUU7SUFDakMsT0FBTyxZQUNMLE9BQU8sS0FBSyxFQUNaO0lBRUYsT0FBTyxZQUNMLE9BQU8sS0FBSyxFQUNaO0lBRUYsWUFBWSxhQUFhLGdCQUFnQixjQUFjLEVBQUU7SUFDekQsT0FBTyxnQkFBZ0IsV0FBVyxpQkFBaUIsRUFBRTtFQUN2RCxJQUNFO0VBRUosT0FBTztJQUFFLFVB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
// denoCacheMetadata=3776196071156831683,12414356927663264340