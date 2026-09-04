# Mini_setup_CREATE — 3_CropYield/softcal Workflow Manual

Crop-yield and water-yield soft calibration workflow for the Mini_setup_CREATE SWAT+ model.

## Overview

| Item | Description |
|---|---|
| Repository path | `3_CropYield/softcal` |
| Main purpose | Soft calibration of crop development, crop yield, and water-yield ratio before later hard calibration. |
| Primary scripts | `workflow/01_crop_phu.R`, `workflow/02_crop_yield.R`, `workflow/02_wateryield.R` |
| Model folder expected by scripts | `./clean_setup` |
| Observation folder | `./observation` |
| Simulation output folder | `./simulation` |
| Backup folder expected by scripts | `./backup` |

> **Scope**  
> This document describes the repository content and the logic encoded in the scripts. It does not validate that a particular parameter selection is hydrologically or agronomically correct. Those choices must be checked against plots, observed data, and local expert knowledge.

## Contents

1. [Folder purpose](#1-folder-purpose)
2. [Repository structure](#2-repository-structure)
3. [Required inputs and software](#3-required-inputs-and-software)
4. [Recommended execution order](#4-recommended-execution-order)
5. [Detailed script descriptions](#5-detailed-script-descriptions)
6. [Outputs and interpretation](#6-outputs-and-interpretation)
7. [Source completeness note](#7-source-completeness-note)

## 1. Folder purpose

The soft-calibration folder is intended to prepare a SWAT+ setup for later calibration by checking and adjusting process-relevant parameters before a formal hard-calibration workflow.

The scripts focus on three related tasks:

1. Adjusting crop days to maturity, represented through `days_mat` / PHU behavior.
2. Adjusting additional crop-growth parameters to improve simulated yields.
3. Adjusting water-yield-related parameters, especially `esco` and optionally `epco`, to match a target water-yield ratio.

The workflow is deliberately semi-automatic. It runs parameter samples, produces diagnostic plots, and then requires the user to manually select parameter values based on plausibility and comparison with observed crop-yield ranges.

## 2. Repository structure

| Path | Role in the workflow |
|---|---|
| `softcal.Rproj` | RStudio project file for the soft-calibration folder. It sets standard RStudio project behavior and UTF-8 encoding. |
| `workflow/01_crop_phu.R` | First crop soft-calibration script. Samples `days_mat` values, runs SWAT+ for each crop, and supports manual selection of days-to-maturity values. |
| `workflow/02_crop_yield.R` | Second crop soft-calibration script. Uses selected `days_mat` values and samples crop-growth parameters such as `lai_pot`, `harv_idx`, `tmp_base`, and `bm_e`. |
| `workflow/02_wateryield.R` | Water-yield soft-calibration script. Samples `esco` or `esco` + `epco`, compares simulated water-yield ratio to a target value, and optionally writes `hydrology.hyd`. |
| `observation/crop_yields.csv` | Primary observed-yield table used by the scripts. Contains crop-specific minimum, maximum, and mean yield statistics for six crops. |
| `observation/crop_yield_all.csv` | Extended observed-yield table with additional crop classes. It is not used directly by the current scripts. |
| `./clean_setup` | Expected SWAT+ TxtInOut-style model folder. The scripts assume it exists and contains SWAT+ input files and the executable. |
| `./simulation` | Created or used by SWATrunR for time-stamped simulation outputs. |
| `./backup` | Expected location for original `plants.plt` and `hydrology.hyd` backups. |

> **Important**  
> The scripts are templates. They contain project-specific crop names, parameter selections, target water-yield ratio, and core counts.

### Observation tables

The main observation file used by all three scripts is `observation/crop_yields.csv`. Its columns are `plant_name`, `yield_min`, `yield_max`, and `yield_mean`. The values are used by the plotting functions to compare simulated crop yields against acceptable observed ranges.

| Crop | Yield minimum | Yield maximum | Yield mean |
|---|---:|---:|---:|
| `fesc` | 4 | 6 | 5.5 |
| `lupn` | 1.72 | 2.15 | 1.935 |
| `oats` | 2.58 | 3.612 | 2.99925 |
| `pota` | 4.4 | 8.8 | 6.215 |
| `canp` | 1.82 | 3.64 | 2.764125 |
| `wwht` | 3.01 | 4.73 | 3.88075 |

## 3. Required inputs and software

| Requirement | Details |
|---|---|
| R packages | `SWATtunR`, `SWATrunR`, `dplyr`, and `tibble`; `02_wateryield.R` also requires `SWATreadR` for writing `hydrology.hyd`. |
| SWAT+ model folder | `./clean_setup` must contain a runnable SWAT+ setup. The scripts pass this path to `run_swatplus()`. |
| SWAT+ output availability | `mgtout`, `basin_wb_aa`, and `basin_aqu_aa` outputs must be available or requested correctly so SWATrunR can extract variables. |
| Observed crop-yield statistics | `./observation/crop_yields.csv` must contain crop names matching SWAT+ plant names used in output labels. |
| Backup files | `./backup/plants.plt` and `./backup/hydrology.hyd` are used to restore original parameter files when rerunning the workflow. |
| Compute resources | The scripts use `n_cores = 5`, `10`, and `25`. |
| Execution mode | Interactive RStudio execution is preferable because parameter selection depends on plot inspection. |

## 4. Recommended execution order

0. **Prepare the folder**  
   Confirm that `./clean_setup` is runnable and `./observation/crop_yields.csv` is correct.

1. **Run `01_crop_phu.R`**  
   Sample `days_mat` values, run SWAT+ simulations, inspect PHU/yield/biomass plots, and manually select `dmat_sel`.

2. **Keep `dmat_sel` in memory**  
   Do not restart R before running `02_crop_yield.R` unless `dmat_sel` is saved and reloaded. The second crop script explicitly depends on this object.

3. **Run `02_crop_yield.R`**  
   Sample crop-growth parameter changes, inspect dotty yield plots, manually select `crop_par_sel`, run a final check, and overwrite `plants.plt` only when results are acceptable.

4. **Run `02_wateryield.R`**  
   Select alternative A or B, sample `esco` / `epco`, compare simulated water-yield ratio to the target, check effects on crop yields, and either write `hydrology.hyd` or define parameter ranges for later calibration.

5. **Archive final files**  
   After acceptable results, save the final `plants.plt` and `hydrology.hyd`, the selected parameter tables, plots, and simulation metadata for reproducibility.

## 5. Detailed script descriptions

### 5.1 `workflow/01_crop_phu.R` — crop PHU and days-to-maturity soft calibration

This script performs the first stage of crop soft calibration. It adjusts `days_mat` values so that simulated crop development is compatible with crop characteristics and implemented management schedules.

| Part | What the script does | Key variables/functions |
|---|---|---|
| Load packages | Loads `SWATtunR`, `SWATrunR`, `dplyr`, and `tibble`. | `library(SWATtunR)`, `library(SWATrunR)` |
| Define model and observations | Sets the model path to `./clean_setup` and the yield observation path to `./observation/crop_yields.csv`. | `model_path`, `yield_obs_path` |
| Select crops | Uses all `plant_name` entries in `crop_yields.csv`. | `crop_names <- yield_obs$plant_name` |
| Reset `plants.plt` | If `reset` is `TRUE`, copies `./backup/plants.plt` to `./clean_setup/plants.plt`. | `reset`, `file.copy()` |
| Sample `days_mat` | Generates a parameter set for days to maturity for each selected crop. | `sample_days_mat(crop_names)` |
| Run simulations | Runs SWAT+ for the sampled `days_mat` values and extracts yield, biomass, and PHU from `mgtout`. | `run_swatplus()`, `define_output()` |
| Load latest run | Loads the most recent timestamped `sim_dmat` run from `./simulation`. | `load_swat_run()` |
| Plot diagnostics | Plots PHU, yield, and biomass against adjusted `days_mat` values. | `plot_phu_yld_bms()` |
| Manual selection | Defines `dmat_sel` manually for each crop and restructures it as SWATrunR plant parameters. | `prepare_plant_parameter()` |

> **Interpretation**  
> The target is not simply to maximize yield. The first crop-calibration step should make crop maturity plausible. PHU fractions around maturity are commonly interpreted in relation to harvest timing, crop type, and management schedule.

### 5.2 `workflow/02_crop_yield.R` — crop-yield soft calibration

This script performs the second crop soft-calibration stage. It assumes `dmat_sel` already exists from `01_crop_phu.R`. It samples additional crop-growth parameters, compares simulated yields with observed ranges, and finally writes an updated `plants.plt` file.

| Part | What the script does | Key variables/functions |
|---|---|---|
| Dependency on previous step | Requires `dmat_sel` in the active R environment. | `dmat_sel` |
| Parameter bounds | Defines relative or absolute changes for `lai_pot`, `harv_idx`, `tmp_base`, and `bm_e`. | `par_bnd` |
| Sampling | Generates 40 Latin Hypercube samples. | `sample_lhs(par_bnd, n_combinations)` |
| Add PHU settings | Combines crop-growth samples with selected `days_mat` values. | `bind_cols(par_crop, dmat_sel)` |
| Run yield simulations | Runs SWAT+ and extracts yield from `mgtout` for selected crop labels. | `run_swatplus()`, `yld` |
| Plot dotty figures | Loads the latest `sim_yld` run and plots yield responses against sampled parameter changes. | `plot_dotty_yields()` |
| Manual crop parameter selection | Defines `crop_par_sel` with selected changes for each crop. | `crop_par_sel` |
| Final check run | Combines `dmat_sel` and `crop_par_sel`, runs final simulation, and plots PHU/yield/biomass. | `par_final`, `sim_check01` |
| Write `plants.plt` | Copies `plants.plt` from `.model_run/thread_1` into `clean_setup` and deletes `.model_run`. | `file.copy()`, `unlink()` |

### 5.3 `workflow/02_wateryield.R` — water-yield soft calibration

This script calibrates the water-yield ratio using `esco` alone or `esco` and `epco` together. It also checks whether selected water-yield parameters negatively affect crop-yield behavior.

| Part | What the script does | Key variables/functions |
|---|---|---|
| Choose alternative | Default is alternative B, which calibrates `esco` and `epco` together. Alternative A calibrates only `esco`. | `alternative <- 'B'` |
| Define target | Sets the target water-yield ratio to `0.133`. | `wyr_target <- 0.133` |
| Load observations | Loads `crop_yields.csv` so crop-yield plots can be checked after water-yield parameter changes. | `yield_obs`, `crop_names` |
| Optional reset | Restores `hydrology.hyd` from backup if `reset` is `TRUE` and backup exists. | `reset`, `./backup/hydrology.hyd` |
| Generate parameter set | Samples `esco` only or the full `esco` × `epco` grid from `0.05` to `0.95`. | `par_esco_epco` |
| Run water-balance simulations | Extracts basin precipitation, surface runoff, lateral flow, tile flow, and aquifer flow components. | `basin_wb_aa`, `basin_aqu_aa` |
| Plot WYR response | Calculates and plots simulated water-yield ratio relative to the target. | `plot_esco_epco(wbal_sim, wyr_target)` |
| Check selected parameter set | Runs a follow-up simulation using `par_check` and includes crop yield, biomass, and PHU outputs. | `sim_check02` |
| Write `hydrology.hyd` | Uses SWATreadR to set fixed `esco` and `epco` values in `hydrology.hyd`. | `read_swat()`, `write_swat()` |
| Optional hard-calibration ranges | Creates `parameter_boundaries` for later calibration. | `parameter_boundaries` |

> **Cross-check needed**  
> The script checks crop yields after changing `esco` / `epco` because water-uptake parameters can influence plant growth. Do not finalize `hydrology.hyd` based only on the water-yield-ratio plot.

## 6. Outputs and interpretation

| Output | Produced by | Meaning |
|---|---|---|
| `./simulation/<timestamp>_sim_dmat` | `01_crop_phu.R` | Simulation batch for sampled `days_mat` values. Used to inspect PHU, yield, and biomass response. |
| `./simulation/<timestamp>_sim_yld` | `02_crop_yield.R` | Simulation batch for sampled crop-growth parameters. Used for dotty plots of yield response. |
| `./simulation/<timestamp>_sim_check01` | `02_crop_yield.R` | Final crop-parameter check run including yield, biomass, and PHU. |
| `./simulation/<timestamp>_sim_wbal` | `02_wateryield.R` | Simulation batch for `esco` / `epco` combinations. Used to calculate water-yield ratio. |
| `./simulation/<timestamp>_sim_check02` | `02_wateryield.R` | Final water-yield parameter check run including crop and water-balance outputs. |
| `./clean_setup/plants.plt` | `02_crop_yield.R` | Final crop-parameter table after accepted soft calibration. |
| `./clean_setup/hydrology.hyd` | `02_wateryield.R` | Final hydrology parameter table if fixed `esco` / `epco` values are written. |
| Plots displayed in R | All scripts | Main decision support for manual parameter selection. The scripts do not automatically save these plots. |

Interpretation should follow these checks:

- PHU fractions should be plausible for the crop and harvest schedule. Extreme under-maturity or over-maturity indicates mismatch between plant parameters and management timing.
- Simulated crop yields should fall within or near the observed minimum-maximum range unless there is a justified local reason for deviation.
- Biomass should be agronomically plausible and consistent with yield response.
- Water-yield ratio should approach the target value, but selected `esco` / `epco` values must also preserve crop-yield plausibility.
- Parameter changes should remain biologically and hydrologically defensible. Avoid selecting values only because they fit one diagnostic plot.

