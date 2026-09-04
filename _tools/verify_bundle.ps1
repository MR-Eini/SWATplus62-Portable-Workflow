param([switch]$SkipHashes)

$ErrorActionPreference = 'Stop'
$bundleRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$rscript = Join-Path $bundleRoot 'R-Portable\bin\x64\Rscript.exe'
$rstudio = Join-Path $bundleRoot 'RStudio-Portable\rstudio.exe'

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
}

Assert-True (Test-Path -LiteralPath $rscript) "Missing portable Rscript: $rscript"
Assert-True (Test-Path -LiteralPath $rstudio) "Missing portable RStudio: $rstudio"
Assert-True ((Get-Item -LiteralPath $rscript).Length -gt 10000) 'Portable Rscript is a Git LFS pointer or is damaged.'
Assert-True ((Get-Item -LiteralPath $rstudio).Length -gt 1000000) 'Portable RStudio is a Git LFS pointer or is damaged.'
Assert-True ((Get-Item -LiteralPath $rstudio).VersionInfo.ProductVersion -eq '2026.05.0+218') 'Expected RStudio 2026.05.0+218.'

if (-not $SkipHashes) {
    foreach ($row in (Import-Csv (Join-Path $bundleRoot 'config\package-manifest.csv'))) {
        $path = Join-Path $bundleRoot ('packages\' + $row.Archive)
        Assert-True (Test-Path -LiteralPath $path) "Missing archive: $($row.Archive)"
        $hash = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash
        Assert-True ($hash -eq $row.SHA256) "Archive hash mismatch: $($row.Archive)"
    }
    foreach ($row in (Import-Csv (Join-Path $bundleRoot 'config\binary-manifest.csv'))) {
        $path = Join-Path $bundleRoot $row.RelativePath
        Assert-True (Test-Path -LiteralPath $path) "Missing binary: $($row.RelativePath)"
        Assert-True ((Get-Item -LiteralPath $path).Length -eq [int64]$row.Bytes) "Binary size mismatch: $($row.RelativePath)"
        $hash = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash
        Assert-True ($hash -eq $row.SHA256) "Binary hash mismatch: $($row.RelativePath)"
    }
}

$env:SWAT_BUNDLE_ROOT = $bundleRoot
$env:R_HOME = Join-Path $bundleRoot 'R-Portable'
$env:R_ARCH = 'x64'
$env:R_LIBS_USER = Join-Path $bundleRoot 'renv\library'
$env:R_LIBS_SITE = ''
$env:R_PROFILE_USER = Join-Path $bundleRoot '.Rprofile'
$env:R_ENVIRON_USER = Join-Path $bundleRoot '_tools\bundle.Renviron'
$env:SWAT_PACKAGE_LIBRARY = $env:R_LIBS_USER
$env:SWATPLUS_EXE = Join-Path $bundleRoot 'bin\swatplus-62-ifo-win_amd64-Rel.exe'
$env:LC_ALL = 'C'

& $rscript --vanilla (Join-Path $PSScriptRoot 'verify_environment.R')
if ($LASTEXITCODE -ne 0) { throw 'R environment verification failed.' }
& $rscript --vanilla (Join-Path $PSScriptRoot 'audit_workflow_dependencies.R')
if ($LASTEXITCODE -ne 0) { throw 'Workflow dependency audit failed.' }

$pointerCount = 0
Get-ChildItem -LiteralPath $bundleRoot -File -Recurse -Include *.exe,*.dll | ForEach-Object {
    if ($_.Length -lt 200) {
        $first = Get-Content -LiteralPath $_.FullName -TotalCount 1 -ErrorAction SilentlyContinue
        if ($first -like 'version https://git-lfs*') { $pointerCount++ }
    }
}
Assert-True ($pointerCount -eq 0) "Found $pointerCount unresolved Git LFS executable/DLL pointer(s). Run 'git lfs pull'."

Write-Host '[SUCCESS] The portable SWAT+ revision 62 bundle is complete and internally consistent.' -ForegroundColor Green
