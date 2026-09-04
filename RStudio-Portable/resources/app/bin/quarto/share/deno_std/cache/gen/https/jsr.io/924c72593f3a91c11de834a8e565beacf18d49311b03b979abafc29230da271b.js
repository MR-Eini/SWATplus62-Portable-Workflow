// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { Logger } from "./logger.ts";
import { state } from "./_state.ts";
/** Get a logger instance. If not specified `name`, get the default logger. */ export function getLogger(name) {
  if (!name) {
    const d = state.loggers.get("default");
    if (d === undefined) {
      throw new Error(`"default" logger must be set for getting logger without name`);
    }
    return d;
  }
  const result = state.loggers.get(name);
  if (!result) {
    const logger = new Logger(name, "NOTSET", {
      handlers: []
    });
    state.loggers.set(name, logger);
    return logger;
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbG9nLzAuMjI0LjcvZ2V0X2xvZ2dlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dnZXIudHNcIjtcbmltcG9ydCB7IHN0YXRlIH0gZnJvbSBcIi4vX3N0YXRlLnRzXCI7XG5cbi8qKiBHZXQgYSBsb2dnZXIgaW5zdGFuY2UuIElmIG5vdCBzcGVjaWZpZWQgYG5hbWVgLCBnZXQgdGhlIGRlZmF1bHQgbG9nZ2VyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvZ2dlcihuYW1lPzogc3RyaW5nKTogTG9nZ2VyIHtcbiAgaWYgKCFuYW1lKSB7XG4gICAgY29uc3QgZCA9IHN0YXRlLmxvZ2dlcnMuZ2V0KFwiZGVmYXVsdFwiKTtcbiAgICBpZiAoZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBcImRlZmF1bHRcIiBsb2dnZXIgbXVzdCBiZSBzZXQgZm9yIGdldHRpbmcgbG9nZ2VyIHdpdGhvdXQgbmFtZWAsXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gZDtcbiAgfVxuICBjb25zdCByZXN1bHQgPSBzdGF0ZS5sb2dnZXJzLmdldChuYW1lKTtcbiAgaWYgKCFyZXN1bHQpIHtcbiAgICBjb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKG5hbWUsIFwiTk9UU0VUXCIsIHsgaGFuZGxlcnM6IFtdIH0pO1xuICAgIHN0YXRlLmxvZ2dlcnMuc2V0KG5hbWUsIGxvZ2dlcik7XG4gICAgcmV0dXJuIGxvZ2dlcjtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxNQUFNLFFBQVEsY0FBYztBQUNyQyxTQUFTLEtBQUssUUFBUSxjQUFjO0FBRXBDLDRFQUE0RSxHQUM1RSxPQUFPLFNBQVMsVUFBVSxJQUFhO0VBQ3JDLElBQUksQ0FBQyxNQUFNO0lBQ1QsTUFBTSxJQUFJLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUM1QixJQUFJLE1BQU0sV0FBVztNQUNuQixNQUFNLElBQUksTUFDUixDQUFDLDREQUE0RCxDQUFDO0lBRWxFO0lBQ0EsT0FBTztFQUNUO0VBQ0EsTUFBTSxTQUFTLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztFQUNqQyxJQUFJLENBQUMsUUFBUTtJQUNYLE1BQU0sU0FBUyxJQUFJLE9BQU8sTUFBTSxVQUFVO01BQUUsVUFBVSxFQUFFO0lBQUM7SUFDekQsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU07SUFDeEIsT0FBTztFQUNUO0VBQ0EsT0FBTztBQUNUIn0=
// denoCacheMetadata=12776831190219456751,9048441525791230099