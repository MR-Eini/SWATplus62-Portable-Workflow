# Portable SWAT+ revision 62 workflow

This repository is the complete Windows workflow bundle for preparing, checking, running, calibrating, validating, and evaluating SWAT+ models with the updated SWAT R packages. It preserves the original module structure and the familiar `st*_run.bat` launchers.

The bundle is isolated from packages installed elsewhere on the computer. Every launcher uses the included R 4.5.1 runtime and the included `renv/library`; it refuses to open a module if one of the seven SWAT packages has the wrong version or resolves outside that library.

## Start here

This repository uses Git LFS for Windows executables and DLL files. Clone it with Git LFS enabled:

```bat
git lfs install
git clone https://github.com/MR-Eini/SWATplus62-Portable-Workflow.git
cd SWATplus62-Portable-Workflow
verify_bundle.bat
```

After verification succeeds, double-click the launcher for the module you want:

| Launcher | Project |
|---|---|
| `st1_run.bat` | Setup and input preparation |
| `st2_run.bat` | SWATdoctR verification report |
| `st3_run.bat` | Crop-yield soft calibration |
| `st4_run.bat` | River-discharge hard calibration, validation, and verification |
| `st51_run.bat` | Status-quo farm management |
| `st52_run.bat` | Cover-crop farm management |
| `st53_run.bat` | Crop-rotation farm management |
| `st54_run.bat` | NBS scenario simulations and indicators |

Run `install_or_repair_packages.bat` if the package verification fails. It reinstalls the exact archives in `packages/` without updating dependencies or using the user library.

## Pinned environment

| Component | Pinned version |
|---|---|
| R | 4.5.1 |
| RStudio | 2026.05.0+218 |
| SWAT+ | revision 62 Intel Windows build |
| SWATreadR | 0.1.0.9013 |
| SWATrunR | 1.1.0.9019 |
| SWATtunR | 0.3.15 |
| SWATdoctR | 0.1.29 |
| SWATfarmR | 4.0.5 |
| SWATprepR | 1.0.16 |
| SWATmeasR | 0.9.4 |

`config/package-manifest.csv` records each source repository, commit, archive, and SHA-256 checksum. `config/library-manifest.csv` records every installed dependency in the private library. `config/binary-manifest.csv` records the executable sizes and checksums.

The detailed test evidence is in [`VALIDATION.md`](VALIDATION.md). Maintainers can repeat the SWATrunR integration test with:

```bat
R-Portable\bin\x64\Rscript.exe --vanilla _tools\test_swat_run.R C:\path\to\swatplus\text\setup
```

## Atmospheric deposition input

No catchment-specific `atmo_dep.csv` is embedded. Atmospheric deposition defaults to online `emep` mode and uses the verified official EMEP 2025 Reporting source for 1990-2024. To disable deposition, set `SWAT_ATMO_DEP_MODE=none`. To use a prepared CSV, set `SWAT_ATMO_DEP_MODE=file` and provide `SWAT_ATMO_DEP_FILE`. `SWAT_ATMO_DEP_NETCDF` can override the online source for another reporting cycle.

The setup routes all three modes through `configure_atmo_dep()`. The function returns immediately for `none`; for `file` and `emep`, it obtains catchment data and calls `add_atmo_dep()` exactly once. `verify_bundle.bat` tests this control flow without downloading external data.

## Compatibility evidence and limit

The Intel SWAT+ revision 62 executable completed the supplied model and produced outputs. The updated workflow also produced SWATdoctR, calibration, validation, verification, farm-management, preparation, measurement, NBS-scenario, and indicator artifacts during compatibility testing.

The separate GNU revision 62 build stopped during weather initialization for this supplied model with a floating-point exception. This bundle therefore pins the verified Intel build. Successful execution establishes software compatibility; it does not by itself establish scientific calibration quality for another catchment.

## Folder layout

```text
SWATplus62-Portable-Workflow/
|-- R-Portable/             R 4.5.1 runtime
|-- RStudio-Portable/       RStudio 2026.05.0+218
|-- renv/library/           private, preinstalled R library
|-- packages/               exact SWAT package source archives
|-- bin/                    SWAT+ rev. 62, writer, WhiteboxTools
|-- _Workflow/              all workflow modules and input data
|-- config/                 package, library, and binary manifests
|-- _tools/                 shared verification and launch logic
`-- st*_run.bat             one launcher for each original module
```

Run this folder from a local Windows 10/11 64-bit drive. Keep the internal folder names unchanged.

The R packages, R, RStudio, SWAT+, WhiteboxTools, workflow data, and referenced datasets retain their respective licenses and terms.
