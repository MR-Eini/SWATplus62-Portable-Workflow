// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Error thrown when an assertion fails.
 *
 * @example
 * ```ts
 * import { AssertionError } from "@std/assert/assertion-error";
 *
 * throw new AssertionError("Assertion failed");
 * ```
 */ export class AssertionError extends Error {
  /** Constructs a new instance. */ constructor(message){
    super(message);
    this.name = "AssertionError";
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzAuMjI0LjAvYXNzZXJ0aW9uX2Vycm9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogRXJyb3IgdGhyb3duIHdoZW4gYW4gYXNzZXJ0aW9uIGZhaWxzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgQXNzZXJ0aW9uRXJyb3IgfSBmcm9tIFwiQHN0ZC9hc3NlcnQvYXNzZXJ0aW9uLWVycm9yXCI7XG4gKlxuICogdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKFwiQXNzZXJ0aW9uIGZhaWxlZFwiKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgQXNzZXJ0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIC8qKiBDb25zdHJ1Y3RzIGEgbmV3IGluc3RhbmNlLiAqL1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkFzc2VydGlvbkVycm9yXCI7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Q0FTQyxHQUNELE9BQU8sTUFBTSx1QkFBdUI7RUFDbEMsK0JBQStCLEdBQy9CLFlBQVksT0FBZSxDQUFFO0lBQzNCLEtBQUssQ0FBQztJQUNOLElBQUksQ0FBQyxJQUFJLEdBQUc7RUFDZDtBQUNGIn0=
// denoCacheMetadata=13338039080220006403,126605880669882608