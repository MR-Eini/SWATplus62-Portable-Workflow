@echo off
setlocal EnableExtensions

if "%~3"=="" goto :usage

for %%I in ("%~dp0..") do set "BUNDLE_ROOT=%%~fI"
set "STAGE_NAME=%~1"
set "TARGET_DIR=%BUNDLE_ROOT%\%~2"
set "PROJECT_FILE=%TARGET_DIR%\%~3"
set "PORTABLE_R=%BUNDLE_ROOT%\R-Portable\bin\x64\R.exe"
set "PORTABLE_RSCRIPT=%BUNDLE_ROOT%\R-Portable\bin\x64\Rscript.exe"
set "PORTABLE_RSTUDIO=%BUNDLE_ROOT%\RStudio-Portable\rstudio.exe"
set "BUNDLE_LIBRARY=%BUNDLE_ROOT%\renv\library"

if not exist "%PORTABLE_RSCRIPT%" goto :missing_runtime
if not exist "%PORTABLE_RSTUDIO%" goto :missing_runtime
if not exist "%PROJECT_FILE%" goto :missing_project

set "R_HOME=%BUNDLE_ROOT%\R-Portable"
set "R_ARCH=x64"
set "PATH=%R_HOME%\bin\x64;%PATH%"
set "RSTUDIO_WHICH_R=%PORTABLE_R%"
set "R_LIBS_USER=%BUNDLE_LIBRARY%"
set "R_LIBS_SITE="
set "R_PROFILE_USER=%BUNDLE_ROOT%\.Rprofile"
set "R_ENVIRON_USER=%BUNDLE_ROOT%\_tools\bundle.Renviron"
set "RENV_PATHS_LIBRARY=%BUNDLE_LIBRARY%"
set "RENV_CONFIG_SANDBOX_ENABLED=false"
set "SWAT_BUNDLE_ROOT=%BUNDLE_ROOT%"
set "SWAT_PACKAGE_LIBRARY=%BUNDLE_LIBRARY%"
set "SWATPLUS_EXE=%BUNDLE_ROOT%\bin\swatplus-62-ifo-win_amd64-Rel.exe"
set "SWATPLUS_REVISION=62"
set "SWAT_WRITE_EXE=%BUNDLE_ROOT%\bin\write.exe"
set "WHITEBOX_EXE=%BUNDLE_ROOT%\bin\WBT\whitebox_tools.exe"
set "PROJ_LIB=%BUNDLE_LIBRARY%\sf\proj"
set "GDAL_DATA=%BUNDLE_LIBRARY%\sf\gdal"
set "LC_ALL=C"

echo Verifying isolated environment for %STAGE_NAME%...
"%PORTABLE_RSCRIPT%" --vanilla "%BUNDLE_ROOT%\_tools\verify_environment.R"
if errorlevel 1 goto :verify_failed
if /I "%SWAT_BUNDLE_VERIFY_ONLY%"=="1" exit /b 0

if exist "%TARGET_DIR%\.Rhistory" del /f /q "%TARGET_DIR%\.Rhistory"
if exist "%TARGET_DIR%\.RData" del /f /q "%TARGET_DIR%\.RData"
if exist "%TARGET_DIR%\.Rproj.user" rmdir /s /q "%TARGET_DIR%\.Rproj.user"

echo Launching %STAGE_NAME% with portable R 4.5.1 and the pinned bundle library...
start "" /D "%TARGET_DIR%" "%PORTABLE_RSTUDIO%" "%PROJECT_FILE%"
exit /b 0

:missing_runtime
echo [ERROR] The portable R or RStudio runtime is missing.
echo If this folder was cloned from GitHub, run: git lfs pull
goto :fail

:missing_project
echo [ERROR] Project not found: "%PROJECT_FILE%"
goto :fail

:verify_failed
echo [ERROR] Bundle verification failed. Run install_or_repair_packages.bat.
goto :fail

:usage
echo [ERROR] launch_stage.bat requires a stage name, folder, and project file.

:fail
pause
exit /b 1
