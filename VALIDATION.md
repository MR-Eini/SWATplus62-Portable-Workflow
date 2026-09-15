# Validation record

Validation date: 2026-09-05
Bundle version: 1.0.6-swat62
Platform: Windows 64-bit

## Environment verification

`verify_bundle.bat` verified:

- portable R 4.5.1;
- RStudio 2026.05.0+218;
- 274 packages recorded in the private library manifest;
- all seven SWAT package versions and loadable namespaces;
- all seven package source-test directories, with 102 focused expectations;
- all eight RStudio project paths;
- all statically detected workflow dependencies and the absence of run-time package installers;
- atmospheric-deposition routing for disabled, catchment CSV, and EMEP NetCDF modes;
- online EMEP as the default when no atmospheric-deposition environment variables are set;
- SHA-256 checksums for the seven package archives and three primary executables;
- PE executable headers and the absence of unresolved executable/DLL Git LFS pointers.
- the revision 62 `plants.plt` schema and all 268 supplied custom/calibrated plant rows.
- staging exactly one tested Intel revision 62 executable in a generated `clean_setup`.
- repository-relative active workflow paths and ignore rules for generated verification, calibration, and scenario outputs.

Result:

```text
OK: R 4.5.1; 274 pinned library packages; 7 SWAT packages; 8 workflow projects; staged executable; revision 62 plant schema; SWAT+ revision 62.
[SUCCESS] The portable SWAT+ revision 62 bundle is complete and internally consistent.
```

The deposition regression test also reports:

```text
OK: atmospheric deposition none, file, and emep modes are routed correctly.
```

A separate integration check used the supplied catchment's historical deposition
CSV as a temporary external fixture. The workflow called the real SWATprepR
`add_atmo_dep()` function, wrote `atmodep.cli` in a copied model, and the pinned
Intel revision 62 executable completed that model successfully. The temporary
fixture is not included in this reusable repository.

An online EMEP integration check opened all 20 official 2025 Reporting OPeNDAP
files for 2004-2023 and extracted finite catchment values. The workflow wrote
`atmodep.cli`, and the Intel revision 62 executable completed the resulting
model. This verifies both current filename forms (`_rep2025.nc` through 2022
and the unsuffixed 2023 file).

## SWAT+ executable run

The bundled `bin/swatplus-62-ifo-win_amd64-Rel.exe` was run against a copied revision 62 reference setup. The simulation covered 2004 through 2023 and exited with code 0.

Result:

```text
SWAT+ Revision 62
Intel (2021.6.0.20220226), 2026-06-15 21:12:38, Windows
Execution successfully completed
```

The run wrote the requested SWAT+ result files, including `simulation.out`, `hydin_yr.txt`, `hydout_yr.txt`, and `hru_wb_yr.txt`.

The original 53-column `plants.plt` produced unresolved-plant diagnostics for
`csil`, `fesc_mgt`, `lupn`, `oats`, `rnge`, `rye`, and `trit`, which caused the
engine to report `agrc`. After adding the three revision 62 lignin fields, the
same 2004–2023 model completed with no unresolved plant diagnostics and
`mgt_out.txt` retained the intended crop names. SWATdoctR now rejects any run
that contains this diagnostic instead of generating a misleading PDF.
SWATdoctR 0.1.31 also removes its temporary run on success or error and removes
the `.run_verify` parent when it is empty. Its focused cleanup test retains the
parent only when another run is present.

A fresh 2004 management-output verification ran the installed package against
the active `1_Setup/Temp/clean_setup`, returned 1,105 management rows, and left
no `.run_verify` directory. That clean setup contains exactly one executable,
whose checksum matches the bundled Intel revision 62 binary.

## SWATrunR integration run

The same reference setup was run through the bundled SWATrunR 1.1.0.9019 package with `_tools/test_swat_run.R`. SWATrunR resolved the executable through `SWATPLUS_EXE`, completed the simulation, parsed `basin_wb_aa`, and returned two result objects.

```text
OK: SWATrunR used the bundled SWAT+ revision 62 executable and returned 2 result object(s).
```

## Scope

This record verifies executable, package, and workflow compatibility for the supplied setup. Scientific calibration, validation thresholds, parameter transferability, and input-data suitability must be evaluated for each catchment.
