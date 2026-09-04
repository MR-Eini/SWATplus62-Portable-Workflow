// Ported and adapted from js-yaml-js-types v1.0.0:
// https://github.com/nodeca/js-yaml-js-types/tree/ac537e7bbdd3c2cbbd9882ca3919c520c2dc022b
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
export const undefinedType = new Type("tag:yaml.org,2002:js/undefined", {
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQveWFtbC8wLjIyNC4zL190eXBlL3VuZGVmaW5lZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb3J0ZWQgYW5kIGFkYXB0ZWQgZnJvbSBqcy15YW1sLWpzLXR5cGVzIHYxLjAuMDpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC1qcy10eXBlcy90cmVlL2FjNTM3ZTdiYmRkM2MyY2JiZDk4ODJjYTM5MTljNTIwYzJkYzAyMmJcbi8vIENvcHlyaWdodCAyMDExLTIwMTUgYnkgVml0YWx5IFB1enJpbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBUeXBlIH0gZnJvbSBcIi4uL3R5cGUudHNcIjtcblxuZXhwb3J0IGNvbnN0IHVuZGVmaW5lZFR5cGUgPSBuZXcgVHlwZShcInRhZzp5YW1sLm9yZywyMDAyOmpzL3VuZGVmaW5lZFwiLCB7XG4gIGtpbmQ6IFwic2NhbGFyXCIsXG4gIHJlc29sdmUoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGNvbnN0cnVjdCgpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9LFxuICBwcmVkaWNhdGUob2JqZWN0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09IFwidW5kZWZpbmVkXCI7XG4gIH0sXG4gIHJlcHJlc2VudCgpIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfSxcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLG1EQUFtRDtBQUNuRCwyRkFBMkY7QUFDM0YsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUUxRSxTQUFTLElBQUksUUFBUSxhQUFhO0FBRWxDLE9BQU8sTUFBTSxnQkFBZ0IsSUFBSSxLQUFLLGtDQUFrQztFQUN0RSxNQUFNO0VBQ047SUFDRSxPQUFPO0VBQ1Q7RUFDQTtJQUNFLE9BQU87RUFDVDtFQUNBLFdBQVUsTUFBTTtJQUNkLE9BQU8sT0FBTyxXQUFXO0VBQzNCO0VBQ0E7SUFDRSxPQUFPO0VBQ1Q7QUFDRixHQUFHIn0=
// denoCacheMetadata=9646012782984046599,16391685444864482865