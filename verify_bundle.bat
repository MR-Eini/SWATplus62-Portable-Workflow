@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0_tools\verify_bundle.ps1"
if errorlevel 1 (
  echo.
  echo [ERROR] Bundle verification failed.
  pause
  exit /b 1
)
echo.
pause

