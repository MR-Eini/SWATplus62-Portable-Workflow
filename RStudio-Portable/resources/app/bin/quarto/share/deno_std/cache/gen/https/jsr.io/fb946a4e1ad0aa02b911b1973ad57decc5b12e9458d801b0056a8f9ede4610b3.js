// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { DEFAULT_CONFIG, DEFAULT_LEVEL } from "./_config.ts";
import { Logger } from "./logger.ts";
import { state } from "./_state.ts";
/** Setup logger config. */ export function setup(config) {
  state.config = {
    handlers: {
      ...DEFAULT_CONFIG.handlers,
      ...config.handlers
    },
    loggers: {
      ...DEFAULT_CONFIG.loggers,
      ...config.loggers
    }
  };
  // tear down existing handlers
  state.handlers.forEach((handler)=>{
    handler.destroy();
  });
  state.handlers.clear();
  // setup handlers
  const handlers = state.config.handlers ?? {};
  for (const [handlerName, handler] of Object.entries(handlers)){
    handler.setup();
    state.handlers.set(handlerName, handler);
  }
  // remove existing loggers
  state.loggers.clear();
  // setup loggers
  const loggers = state.config.loggers ?? {};
  for (const [loggerName, loggerConfig] of Object.entries(loggers)){
    const handlerNames = loggerConfig.handlers ?? [];
    const handlers = [];
    handlerNames.forEach((handlerName)=>{
      const handler = state.handlers.get(handlerName);
      if (handler) {
        handlers.push(handler);
      }
    });
    const levelName = loggerConfig.level ?? DEFAULT_LEVEL;
    const logger = new Logger(loggerName, levelName, {
      handlers: handlers
    });
    state.loggers.set(loggerName, logger);
  }
}
setup(DEFAULT_CONFIG);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbG9nLzAuMjI0Ljcvc2V0dXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHR5cGUgeyBCYXNlSGFuZGxlciB9IGZyb20gXCIuL2Jhc2VfaGFuZGxlci50c1wiO1xuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcsIERFRkFVTFRfTEVWRUwgfSBmcm9tIFwiLi9fY29uZmlnLnRzXCI7XG5pbXBvcnQgeyB0eXBlIExvZ0NvbmZpZywgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZ2VyLnRzXCI7XG5pbXBvcnQgeyBzdGF0ZSB9IGZyb20gXCIuL19zdGF0ZS50c1wiO1xuXG4vKiogU2V0dXAgbG9nZ2VyIGNvbmZpZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cChjb25maWc6IExvZ0NvbmZpZykge1xuICBzdGF0ZS5jb25maWcgPSB7XG4gICAgaGFuZGxlcnM6IHsgLi4uREVGQVVMVF9DT05GSUcuaGFuZGxlcnMsIC4uLmNvbmZpZy5oYW5kbGVycyB9LFxuICAgIGxvZ2dlcnM6IHsgLi4uREVGQVVMVF9DT05GSUcubG9nZ2VycywgLi4uY29uZmlnLmxvZ2dlcnMgfSxcbiAgfTtcblxuICAvLyB0ZWFyIGRvd24gZXhpc3RpbmcgaGFuZGxlcnNcbiAgc3RhdGUuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgIGhhbmRsZXIuZGVzdHJveSgpO1xuICB9KTtcbiAgc3RhdGUuaGFuZGxlcnMuY2xlYXIoKTtcblxuICAvLyBzZXR1cCBoYW5kbGVyc1xuICBjb25zdCBoYW5kbGVycyA9IHN0YXRlLmNvbmZpZy5oYW5kbGVycyA/PyB7fTtcblxuICBmb3IgKGNvbnN0IFtoYW5kbGVyTmFtZSwgaGFuZGxlcl0gb2YgT2JqZWN0LmVudHJpZXMoaGFuZGxlcnMpKSB7XG4gICAgaGFuZGxlci5zZXR1cCgpO1xuICAgIHN0YXRlLmhhbmRsZXJzLnNldChoYW5kbGVyTmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICAvLyByZW1vdmUgZXhpc3RpbmcgbG9nZ2Vyc1xuICBzdGF0ZS5sb2dnZXJzLmNsZWFyKCk7XG5cbiAgLy8gc2V0dXAgbG9nZ2Vyc1xuICBjb25zdCBsb2dnZXJzID0gc3RhdGUuY29uZmlnLmxvZ2dlcnMgPz8ge307XG4gIGZvciAoY29uc3QgW2xvZ2dlck5hbWUsIGxvZ2dlckNvbmZpZ10gb2YgT2JqZWN0LmVudHJpZXMobG9nZ2VycykpIHtcbiAgICBjb25zdCBoYW5kbGVyTmFtZXMgPSBsb2dnZXJDb25maWcuaGFuZGxlcnMgPz8gW107XG4gICAgY29uc3QgaGFuZGxlcnM6IEJhc2VIYW5kbGVyW10gPSBbXTtcblxuICAgIGhhbmRsZXJOYW1lcy5mb3JFYWNoKChoYW5kbGVyTmFtZSkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IHN0YXRlLmhhbmRsZXJzLmdldChoYW5kbGVyTmFtZSk7XG4gICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgbGV2ZWxOYW1lID0gbG9nZ2VyQ29uZmlnLmxldmVsID8/IERFRkFVTFRfTEVWRUw7XG4gICAgY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlcihsb2dnZXJOYW1lLCBsZXZlbE5hbWUsIHsgaGFuZGxlcnM6IGhhbmRsZXJzIH0pO1xuICAgIHN0YXRlLmxvZ2dlcnMuc2V0KGxvZ2dlck5hbWUsIGxvZ2dlcik7XG4gIH1cbn1cblxuc2V0dXAoREVGQVVMVF9DT05GSUcpO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFHckMsU0FBUyxjQUFjLEVBQUUsYUFBYSxRQUFRLGVBQWU7QUFDN0QsU0FBeUIsTUFBTSxRQUFRLGNBQWM7QUFDckQsU0FBUyxLQUFLLFFBQVEsY0FBYztBQUVwQyx5QkFBeUIsR0FDekIsT0FBTyxTQUFTLE1BQU0sTUFBaUI7RUFDckMsTUFBTSxNQUFNLEdBQUc7SUFDYixVQUFVO01BQUUsR0FBRyxlQUFlLFFBQVE7TUFBRSxHQUFHLE9BQU8sUUFBUTtJQUFDO0lBQzNELFNBQVM7TUFBRSxHQUFHLGVBQWUsT0FBTztNQUFFLEdBQUcsT0FBTyxPQUFPO0lBQUM7RUFDMUQ7RUFFQSw4QkFBOEI7RUFDOUIsTUFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEIsUUFBUSxPQUFPO0VBQ2pCO0VBQ0EsTUFBTSxRQUFRLENBQUMsS0FBSztFQUVwQixpQkFBaUI7RUFDakIsTUFBTSxXQUFXLE1BQU0sTUFBTSxDQUFDLFFBQVEsSUFBSSxDQUFDO0VBRTNDLEtBQUssTUFBTSxDQUFDLGFBQWEsUUFBUSxJQUFJLE9BQU8sT0FBTyxDQUFDLFVBQVc7SUFDN0QsUUFBUSxLQUFLO0lBQ2IsTUFBTSxRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWE7RUFDbEM7RUFFQSwwQkFBMEI7RUFDMUIsTUFBTSxPQUFPLENBQUMsS0FBSztFQUVuQixnQkFBZ0I7RUFDaEIsTUFBTSxVQUFVLE1BQU0sTUFBTSxDQUFDLE9BQU8sSUFBSSxDQUFDO0VBQ3pDLEtBQUssTUFBTSxDQUFDLFlBQVksYUFBYSxJQUFJLE9BQU8sT0FBTyxDQUFDLFNBQVU7SUFDaEUsTUFBTSxlQUFlLGFBQWEsUUFBUSxJQUFJLEVBQUU7SUFDaEQsTUFBTSxXQUEwQixFQUFFO0lBRWxDLGFBQWEsT0FBTyxDQUFDLENBQUM7TUFDcEIsTUFBTSxVQUFVLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQztNQUNuQyxJQUFJLFNBQVM7UUFDWCxTQUFTLElBQUksQ0FBQztNQUNoQjtJQUNGO0lBRUEsTUFBTSxZQUFZLGFBQWEsS0FBSyxJQUFJO0lBQ3hDLE1BQU0sU0FBUyxJQUFJLE9BQU8sWUFBWSxXQUFXO01BQUUsVUFBVTtJQUFTO0lBQ3RFLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZO0VBQ2hDO0FBQ0Y7QUFFQSxNQUFNIn0=
// denoCacheMetadata=8202581349173892981,3777806527384824503