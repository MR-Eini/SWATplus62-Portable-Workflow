@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "BUNDLE_ROOT=%~dp0"
set "R_HOME=%~dp0R-Portable"
set "R_ARCH=x64"
set "R_LIBS_USER=%~dp0renv\library"
set "R_LIBS_SITE="
set "R_PROFILE_USER=%~dp0.Rprofile"
set "R_ENVIRON_USER=%~dp0_tools\bundle.Renviron"
set "SWAT_BUNDLE_ROOT=%~dp0"
set "LC_ALL=C"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0_tools\verify_bundle.ps1" -SkipHashes
if errorlevel 1 echo Existing environment needs repair; continuing with the pinned archives.

powershell -NoProfile -Command "$m=Import-Csv -LiteralPath '%~dp0config\package-manifest.csv'; foreach($r in $m){$p=Join-Path '%~dp0packages' $r.Archive; if(-not(Test-Path -LiteralPath $p)){throw ('Missing '+$r.Archive)}; if((Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash -ne $r.SHA256){throw ('Hash mismatch: '+$r.Archive)}}"
if errorlevel 1 goto :fail

"%~dp0R-Portable\bin\x64\Rscript.exe" --vanilla "%~dp0_tools\install_bundle_packages.R"
if errorlevel 1 goto :fail

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0_tools\verify_bundle.ps1"
if errorlevel 1 goto :fail

echo.
echo [SUCCESS] The private package library was repaired and verified.
pause
exit /b 0

:fail
echo.
echo [ERROR] Package repair failed. Close RStudio and try again.
pause
exit /b 1
