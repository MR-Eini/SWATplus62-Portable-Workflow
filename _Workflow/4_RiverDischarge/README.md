# Mini_setup_CREATE — `4_RiverDischarge/hardcal`

Hard calibration of river discharge and in-stream water-quality variables using **SWATrunR** and **SWATtunR**.

## 1. Files inspected and workflow scope

| File / folder | Role in workflow |
|---|---|
| `hardcal.Rproj` | RStudio project file for this calibration subproject. Sets UTF-8 encoding and two-space indentation. |
| `workflow/01_define_parameter.R` | Defines SWAT+ calibration parameters, samples 900 LHS combinations, and optionally translates normalized parameter columns into HRU-group-specific ranges. |
| `workflow/02_define_output.R` | Defines SWATrunR outputs to extract from SWAT+ simulations. Current setup extracts daily channel outputs for channel 5. |
| `workflow/03_run_swat.R` | Runs SWAT+ for the sampled parameter sets over 2004-2023 and starts printing outputs from 2007. |
| `workflow/04_analyze_results.R` | Single-station analysis template for discharge, nitrogen, phosphorus, and suspended sediment at channel 5. |
| `workflow/04_Multi_stations_analyze_results.R` | Weighted multi-gauge discharge-only analysis for channels 44, 72, and 76. |
| `workflow/04_Multi_stations_analyze_results_no_w.R` | Unweighted multi-gauge discharge-only analysis; currently less robust than the weighted version. |
| `workflow/04_Multi_stations_analyze_results_final_all.R` | Merged multi-gauge, multi-variable workflow for Q, NO3, PO4-P, and sediment. |
| `workflow/functions.R` | Local helper functions for run-label normalization, simulation/observation alignment, FDC preparation, rank normalization, and gauge selection. |
| `workflow/05_validate.R` | Validation template for rerunning selected parameter sets in a validation period. |
| `observation/*.csv` | Observed water-quality concentration files for channel 5: TN, TP, NO3-N, and suspended sediment. |

## 2. Overall hard-calibration logic

The `hardcal` workflow is designed to run many SWAT+ simulations with different hydrological parameter combinations and then evaluate the runs against observed discharge and/or water-quality data.

The intended sequence is:

1. Define calibration parameter boundaries and generate sampled parameter combinations.
2. Define which SWAT+ output files, variables, and spatial units should be extracted during each simulation.
3. Run SWAT+ repeatedly with SWATrunR using the sampled parameter table.
4. Load the most recent simulation folder from `./simulation`.
5. Align simulated and observed time series over a calibration period.
6. Calculate objective functions such as NSE, KGE, PBIAS, MAE, and FDC-segment RSR.
7. Rank parameter sets, inspect parameter identifiability/dotty plots, and select candidate runs.
8. Write selected parameter sets to `calibration.cal` or use them in validation simulations.

> **Repository status:** The scripts are templates and several parts still require case-study-specific editing. Some scripts are not directly runnable without additional input files or earlier objects loaded in the R session.

## 3. Expected folder structure

```text
4_RiverDischarge/hardcal/
|-- hardcal.Rproj
|-- clean_setup/                  # SWAT+ TxtInOut-style project folder
|-- workflow/
|   |-- 01_define_parameter.R
|   |-- 02_define_output.R
|   |-- 03_run_swat.R
|   |-- 04_analyze_results.R
|   |-- 04_Multi_stations_analyze_results.R
|   |-- 04_Multi_stations_analyze_results_no_w.R
|   |-- 04_Multi_stations_analyze_results_final_all.R
|   |-- 05_validate.R
|   |-- functions.R
|-- observation/
|   |-- TN_cha5.csv
|   |-- TP_cha5.csv
|   |-- no3n_cha5.csv
|   `-- suspended_sediment_cha5.csv
`-- simulation/                   # created by SWATrunR; timestamped simulation folders
```

## 4. Required R packages and external requirements

| Dependency | Purpose |
|---|---|
| `SWATrunR` | Runs SWAT+ with parameter tables, defines output extraction, and loads saved simulation folders. |
| `SWATtunR` | Provides calibration utilities such as sampling, GOF calculation, FDC analysis, ranking, calibration-file writing, and time-series viewers. |
| `hydroGOF` | Provides objective functions used in the scripts: NSE, KGE, `pbias`, and `mae`. |
| `tidyverse` / `dplyr` / `readr` / `tibble` / `lubridate` | Used for data manipulation, CSV reading, date parsing, joins, and plotting. |
| `zoo` | Used for optional observation gap filling: linear interpolation or last-observation-carried-forward. |
| SWAT+ executable and complete `clean_setup` | The SWAT+ model files must be present and runnable under `./clean_setup`. |

## 5. Step 1 — Define calibration parameters

**Script:** `workflow/01_define_parameter.R`

This script defines the candidate parameter space for hard calibration. It starts by loading `SWATtunR` and `tibble`, sets `n_combinations = 900`, and identifies `./clean_setup` as the SWAT+ project path.

| Process group | Parameters | Interpretation |
|---|---|---|
| Snow | `snomelt_tmp.hru`, `snofall_tmp.hru` | Used only if snowfall contributes meaningfully to precipitation. |
| Evapotranspiration / soil water | `esco.hru`, `awc.sol` | Controls soil evaporation compensation and available water capacity. |
| Surface runoff | `cn2.hru`, `cn3_swf.hru`, `surlag.bsn` | Controls curve-number behavior and surface runoff lag. |
| Lateral flow | `lat_len.hru`, `latq_co.hru`, `bd.sol`, `k.sol` | Controls lateral-flow length/coefficient and soil hydraulic properties. |
| Percolation / aquifer | `perco.hru`, `flo_min.aqu`, `revap_co.aqu`, `revap_min.aqu`, `alpha.aqu` | Controls percolation, aquifer recession/revap, and baseflow behavior. |
| Nutrient/sediment parameters | Commented-out examples | Optional nutrient, channel, and phosphorus parameters are present but disabled. |

The script creates a Latin Hypercube sample using:

```r
parameter_set <- sample_lhs(parameter_boundaries, n_combinations)
```

It then reads initial HRU-level values for `perco`, `cn3_swf`, and `latq_co` using `group_hydr_values()`. The intention is to preserve spatial information already encoded in the SWAT+ setup by assigning different calibration ranges to HRU groups with different initial parameter values.

| Parameter | Current treatment | Practical implication |
|---|---|---|
| `perco.hru` | Groups are created and boundaries are defined, but the `translate_to_boundaries()` call is commented out. | `perco` remains controlled by the global `absval` range `c(0, 0.7)` unless the commented block is activated. |
| `cn3_swf.hru` | Translated into low/mod/high group-specific ranges. | The original normalized `cn3_swf` column is replaced by group-specific parameter columns. |
| `latq_co.hru` | Translated into low/mod/high group-specific ranges. | The original normalized `latq_co` column is replaced by group-specific parameter columns. |

## 6. Step 2 — Define SWAT+ outputs

**Script:** `workflow/02_define_output.R`

This script defines the outputs that SWATrunR should read from SWAT+ after every parameterized model run. In the current script, `cha_ids` is set to `5` and `hru_ids` is set to `1:314`. Only channel outputs are active; HRU sediment yield output is present but commented out.

| Output object | SWAT+ output file | Variable | Meaning |
|---|---|---|---|
| `flo_day` | `channel_sd_day` | `flo_out` | Daily discharge at `cha_ids`. |
| `no3_day` | `channel_sd_day` | `no3_out` | Daily nitrate output at `cha_ids`. |
| `orgn_day` | `channel_sd_day` | `orgn_out` | Daily organic nitrogen output at `cha_ids`. |
| `nh3_day` | `channel_sd_day` | `nh3_out` | Daily ammonia output at `cha_ids`. |
| `no2_day` | `channel_sd_day` | `no2_out` | Daily nitrite output at `cha_ids`. |
| `solp_day` | `channel_sd_day` | `solp_out` | Daily soluble phosphorus output at `cha_ids`. |
| `sedp_day` | `channel_sd_day` | `sedp_out` | Daily sediment-attached phosphorus output at `cha_ids`. |
| `sed_day` | `channel_sd_day` | `sed_out` | Daily sediment output at `cha_ids`. |

## 7. Step 3 — Run SWAT+ simulations

**Script:** `workflow/03_run_swat.R`

This script sources the parameter and output definitions, sets the simulation dates, and calls `SWATrunR::run_swatplus()`.

| Setting | Current value | Explanation |
|---|---|---|
| `model_path` | `./clean_setup` | SWAT+ TxtInOut-style project folder. |
| `start_date` | `2004-01-01` | Start of model simulation. |
| `end_date` | `2023-12-31` | End of model simulation. |
| `start_date_print` | `2007-01-01` | First day for printed outputs; implies 2004-2006 are used as warm-up. |
| `n_cores` | `10` | Parallel execution threads. |
| `save_path` | `./simulation` | Folder where timestamped simulation results are written. |
| `save_file_name` | `YYYYMMDDHHMM_sim` | Timestamped simulation folder name. |
| `split_units` | `FALSE` | The script notes `TRUE` may be better for large numbers of output units. |
| `time_out` | `3600` seconds | Per-run timeout; should be increased if runs are slow. |

```r
run_swatplus(
  project_path     = model_path,
  output           = outputs,
  parameter        = parameter_set,
  start_date       = start_date,
  end_date         = end_date,
  start_date_print = start_date_print,
  n_thread         = n_cores,
  save_path        = save_path,
  save_file        = save_file_name,
  return_output    = FALSE,
  split_units      = FALSE,
  time_out         = 3600
)
```

## 8. Observation data in this folder

The inspected observation folder contains four water-quality CSV files for channel 5. Each file has two columns: `date` and `value`. The dates are written in month-day-year style, for example `1-29-2007`.

| File | Variable | Structure | Use |
|---|---|---|---|
| `TN_cha5.csv` | Total nitrogen concentration | `date,value` | Used by the single-station script as `ntot_path`. |
| `TP_cha5.csv` | Total phosphorus concentration | `date,value` | Used by the single-station script as `ptot_path`. |
| `no3n_cha5.csv` | Nitrate-nitrogen concentration | `date,value` | Referenced in comments; not active in `04_analyze_results.R`. |
| `suspended_sediment_cha5.csv` | Suspended sediment concentration | `date,value` | Used by the single-station script as `sused_path`. |

## 9. Local helper functions

**Script:** `workflow/functions.R`

| Function | Purpose |
|---|---|
| `as_date()` | Converts input to `Date`. |
| `filter_period()` | Filters a data frame by date using a two-element date vector. |
| `norm_run()` | Normalizes run labels to `run_0001`-style labels using `PAD_WIDTH = 4`. |
| `run_to_id()` | Extracts integer IDs from run labels. |
| `limit_runs()` | Keeps date plus the first N `run_*` columns in numeric order and normalizes run labels. |
| `read_obs()` | Reads an observation CSV, keeps date and the first non-date column as `obs`. |
| `fill_obs()` | Optionally fills observation gaps using none, linear interpolation, or LOCF. |
| `align_sim_obs()` | Aligns simulation and observation tables using either full overlapping daily sequence or strict date intersection. |
| `prep_for_fdc()` | Prepares date/`run_*` tables for flow-duration-curve calculations. |
| `safe_fdc_rsr()` | Runs `calc_fdc_rsr()` inside `try/catch` and returns `NULL` if it fails. |
| `rn()` | Rank-normalizes a vector to `[0, 1]`, with optional inversion. |
| `choose_gauge_key()` | Accepts a gauge name or index and returns a valid gauge key. |

## 10. Single-station analysis workflow

**Script:** `workflow/04_analyze_results.R`

This is the analysis template for discharge, total nitrogen, total phosphorus, and suspended sediment. It loads the most recent timestamped simulation folder, extracts model outputs, prepares observations, computes GOF metrics, creates diagnostic plots, and writes selected calibration files.

| Block | Behavior |
|---|---|
| Simulation discovery | Lists `./simulation` folders matching `[0-9]{12}` and loads the last one with `load_swat_run()`. |
| Simulation extraction | Extracts `flo_day`, `no3_day`, `nh3_day`, `no2_day`, `orgn_day`, `solp_day`, `sedp_day`, and `sed_day`. |
| Load aggregation | Total N is `no3 + nh3 + no2 + orgn`; total P is `solp + sedp`. |
| Concentration conversion | Converts simulated nutrient/sediment loads to concentrations using `load_to_conc()`. |
| Observation reading | Reads `q_cha5_cms.csv`, `TN_cha5.csv`, `TP_cha5.csv`, and `suspended_sediment_cha5.csv`. |
| GOF calculation | Calculates NSE, KGE, PBIAS, MAE, and discharge FDC RSR. |
| Diagnostics | Creates parameter-identifiability and dotty plots. |
| Selection | Ranks GOF values and selects the first 10 runs. |
| Calibration file export | Uses `write_cal_file()` for selected runs `c(1, 2, 5)` in the shown template. |

## 11. Multi-station discharge analysis — weighted version

**Script:** `workflow/04_Multi_stations_analyze_results.R`

This script evaluates discharge across multiple gauges and combines run performance using user-defined gauge weights.

| Setting | Value | Meaning |
|---|---|---|
| `N_RUNS` | `600` | Keeps the first 600 simulated runs for each gauge. |
| `TOP_K` | `600` | Keeps the top 600 runs after composite scoring. |
| `ALIGN_MODE` | `overlap_seq` | Builds a complete daily sequence over the overlapping simulation/observation period. |
| `FILL_METHOD` | `none` | Does not fill observation gaps. |
| `flow_paths` | `cha44`, `cha72`, `cha76` | Observation files expected: `q_cha44_cms.csv`, `q_cha72_cms.csv`, `q_cha76_cms.csv`. |
| `period_q` | `2004-01-01` to `2013-12-31` | Calibration period used for all gauges. |
| `WEIGHTS` | `cha44 = 0.6`, `cha72 = 0.2`, `cha76 = 0.2` | Weighted composite scoring across gauges. |

The script workflow is:

1. Load the latest simulation folder.
2. Prepare a parameter table in long format.
3. Extract `flo_day_44`, `flo_day_72`, and `flo_day_76` from `sim$simulation`.
4. Read and align observations for each gauge.
5. Compute NSE, KGE, PBIAS, MAE, and optionally FDC RSR for each run and gauge.
6. Rank-normalize metrics within each gauge.
7. Aggregate normalized scores using gauge weights.
8. Export top-run parameter values to `runs_top_parameters_long.csv`.
9. Optionally create dotty plots and inspect top time series interactively.

## 12. Multi-station discharge analysis — unweighted version

**Script:** `workflow/04_Multi_stations_analyze_results_no_w.R`

This script repeats the multi-station discharge analysis but averages normalized scores across gauges instead of applying explicit gauge weights. It duplicates several helper functions inside the script rather than sourcing `workflow/functions.R`.

| Item | Current state | Comment |
|---|---|---|
| `N_RUNS` / `TOP_K` | `150` / `150` | Uses fewer runs than the weighted version. |
| Gauge paths | `cha44`, `cha72`, `cha76` | Same discharge observation paths as the weighted version. |
| Scoring | Mean of normalized NSE, KGE, absolute PBIAS score, and MAE score across gauges. | Unweighted composite score. |
| Exports | Mostly commented out | Designed for inspection more than automated export. |

## 13. Integrated multi-variable analysis

**Script:** `workflow/04_Multi_stations_analyze_results_final_all.R`

This is the most complete analysis script. It processes discharge (Q), nitrate (NO3), soluble reactive phosphorus as PO4-P, and sediment (SED). It is heavily annotated and writes separate ranked CSV files for each variable.

| Variable | Simulation treatment | Observation expectation |
|---|---|---|
| Q | Simulated discharge directly from `flo_day_*` outputs. | Observed units expected: `m3 s-1`. |
| NO3 | Simulated `no3_day_*` load converted to concentration using discharge. | Observed units expected: `mg L-1`. |
| PO4P | Simulated `solp_day_*` load converted to concentration using discharge. | Observed units expected: `mg L-1`. |
| SED | Simulated `sed_day_*` load converted to concentration using discharge. | Observed units expected: `mg L-1`. |

| Output file | Meaning |
|---|---|
| `runs_ranked_all_<VAR>.csv` | All runs with weighted scores and rank for the variable. |
| `runs_ranked_top_<VAR>.csv` | Top-K runs for the variable. |
| `runs_top_per_gage_gof_<VAR>.csv` | Per-gauge NSE, KGE, PBIAS, and MAE for top runs. |
| `runs_top_parameters_long_<VAR>.csv` | Long parameter table for top runs. |

## 14. Validation workflow

**Script:** `workflow/05_validate.R`

This is a validation template rather than a ready-to-run script. It reruns only selected parameter sets and compares simulated discharge against observations over a validation period.

| Item | Current state | Required action |
|---|---|---|
| `period_valid` | `c('yyyy-mm-dd', 'yyyy-mm-dd')` | Placeholder; must be replaced by actual validation start/end dates. |
| `start_date` | `'yyyy-mm-dd'` | Placeholder; should start at least two years before validation output begins. |
| `parameter_set_valid` | `parameter_set[run_ids, ]` | Requires `parameter_set` and `run_ids` from earlier scripts. |
| `outputs` | `outputs` | Requires `workflow/02_define_output.R` or an equivalent object to be loaded. |
| `flow_path` | `./observation/.csv` | Placeholder; must be replaced by a real observation file. |

## 15. Recommended calibration strategy

For a clean and teachable workflow, the following order is recommended:

1. Decide whether the demonstration will be single-station channel or multi-station channels. Do not mix these without updating output definitions and observation files.
2. Update `02_define_output.R` so `cha_ids` matches the intended analysis script.
3. Check that all observation CSV paths used by the chosen analysis script exist.
4. Run `01_define_parameter.R` and inspect `parameter_set` dimensions and column names.
5. Run `03_run_swat.R` with a small `n_combinations` test first, for example 5-10, before launching 900 runs.
6. Load the newest simulation folder and verify that expected objects exist in `sim$simulation`.
7. Run the analysis script only after unit consistency is verified.
8. Select candidate runs, then write `calibration.cal` or pass selected parameter sets to validation.

## Notes for users

- The workflow is a hard-calibration template, not a fully automatic calibration package.
- Several scripts require case-study-specific editing before execution.
- The single-station and multi-station workflows are not interchangeable unless the output definitions and observation files are made consistent.
