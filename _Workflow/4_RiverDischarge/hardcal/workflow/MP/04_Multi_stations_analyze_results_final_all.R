###############
# Multiple station assessments (Q, NO3, PO4-P, SED)
# Author: Mamad Eini, Oct 2025
# Requires helper functions in ./workflow/functions.R
# ========================= ANNOTATED GUIDE ================================
# This guide documents every major block in the merged workflow so a future
# reader understands the inputs, transformations, metrics, and outputs.
# It keeps the code clean while providing deep, pragmatic context.
#
# Libraries
# - SWATrunR: loads SWAT+ runs (parameters, daily outputs by gauge).
# - SWATtunR: hydrologic utilities: GOF, FDCs, ranking, viewers.
# - hydroGOF: NSE, KGE, PBIAS, MAE implementations.
# - zoo: simple gap-fill helpers if needed (we keep FILL_METHOD = "none").
# - tidyverse: wrangling, joins, reshaping, plotting.
# - functions.R: local helpers used across your projects.
#
# Knobs
# N_RUNS: only first N runs per gauge are read to limit memory.
# TOP_K: number of top-scoring runs to export per variable.
# ALIGN_MODE: "overlap_seq" aligns by overlapping period in sequence;
# "intersect" uses strict intersection of available dates.
# FILL_METHOD: set to "none" for transparency. Alternatives: "linear" or
# "locf" (last observation carried forward) if needed.
# period_q: analysis window to impose on sim and obs, regardless of the
# complete record length; adjust per study.
# GAUGE_TO_VIEW: default gauge for optional interactive viewer.
# WEIGHTS: weights for cross-gauge metrics aggregation. Must sum to 1.
#
# Observations
# * Replace the placeholder CSV paths with your actual files. The script is
# robust to missing gauges for a variable; it will only process intersecting
# gauges that have both sim and obs.
# * Units: provide obs in same target units used below for each variable:
# - Q: m3 s-1
# - NO3: mg L-1
# - PO4P: mg L-1
# - SED: mg L-1 (converted from SWAT sediment load via discharge)
#
# Simulation discovery
# The most recent timestamped run folder in ./simulation is chosen. Ensure
# your naming pattern matches the regex "[0-9]{12}" (YYYYMMDDHHMM or similar).
#
# Parameter table
# par_vals and par_long create a tidy parameter set per run. These feed
# identifiability plots and enable joins with GOF metrics by run id.
#
# Simulation slicing per gauge
# The code constructs named lists per variable, each entry a tibble with
# date + run columns. limit_runs() trims to N_RUNS for consistency.
#
# get_var_io(VAR)
# Returns a map of {gage -> list(sim, obs, units)} for the requested variable.
# - Q: direct discharge from sim + observed Q in m3 s-1.
# - NO3: converts simulated load (kg day-1) to concentration (mg L-1)
# using flow; reads observed concentration in mg L-1.
# - PO4P: same conversion, using SOLP load.
# - SED: converts SED load (tons day-1) to mg L-1.
# Conversion logic is handled by load_to_conc() in functions.R. Check that
# units in comments above match your SWAT outputs. Adjust if your models are
# daily means vs sums.
#
# compute_var_scores(VAR)
# 1) For every gauge with sim+obs:
# - align_sim_obs(): trims and aligns to period_q and ALIGN_MODE.
# - calc_fdc(): flow duration curves for sim and obs.
# - calc_gof(): NSE, KGE, PBIAS, MAE computed per run.
# - safe_fdc_rsr(): optional FDC-based metric, guarded for NA cases.
# 2) Merge all gauges for the variable into gof_all and gof_fdc_all.
# 3) Per-gauge score normalization with rn(): larger is better. For bias and
# MAE we flip signs to maintain a higher-is-better convention.
# 4) Weighted aggregation across gauges via WEIGHTS -> one composite score per run.
# 5) Rank runs by composite score; keep the full table and a TOP_K subset.
#
# Exports
# - runs_ranked_all_<VAR>.csv : all runs with weighted scores and rank.
# - runs_ranked_top_<VAR>.csv : TOP_K subset.
# - runs_top_per_gage_gof_<VAR>.csv : per-gauge GOF for TOP_K runs.
# - runs_top_parameters_long_<VAR>.csv : long parameter table for TOP_K runs.
# These CSVs let you explore winners, run diagnostics, or replot outside R.

# --- libs ---------------------------------------------------------------------
library(SWATrunR)
library(SWATtunR)
library(hydroGOF)
library(zoo)
library(tidyverse)
source("./workflow/functions.R")  # norm_run, limit_runs, align_sim_obs, rn, prep_for_fdc, safe_fdc_rsr,
# choose_gauge_key, run_to_id, load_to_conc

# --- knobs --------------------------------------------------------------------
N_RUNS      <- n_combinations
TOP_K       <- n_combinations/10
ALIGN_MODE  <- "overlap_seq"  # or "intersect"
FILL_METHOD <- "none"         # or "linear","locf"
period_q    <- c("2007-01-01", "2013-12-31")
GAUGE_TO_VIEW <- "cha44"      # default gauge for viewer

# Weights for cross-gauge aggregation (used when >1 gauge exists for a variable)
WEIGHTS <- c(cha44 = 0.6, cha72 = 0.2, cha76 = 0.2); WEIGHTS <- WEIGHTS / sum(WEIGHTS)

# --- observation paths ---------------------------------------------------------
# Provide those you actually have. Leave others missing or comment them out.
flow_paths <- c(
  cha44 = "./observation/q_cha44_cms.csv",
  cha72 = "./observation/q_cha72_cms.csv",
  cha76 = "./observation/q_cha76_cms.csv"
)

N_paths <- c(
  cha44 = "./observation/no3n_cha44.csv"
  # cha72 = "./observation/no3n_cha72.csv",
  # cha76 = "./observation/no3n_cha76.csv"
)

P_paths <- c(
  cha44 = "./observation/po4p_cha44.csv"
  # cha72 = "./observation/po4p_cha72.csv",
  # cha76 = "./observation/po4p_cha76.csv"
)

S_paths <- c(
  cha44 = "./observation/suspended_sediment_cha44.csv"
  # cha72 = "./observation/suspended_sediment_cha72.csv",
  # cha76 = "./observation/suspended_sediment_cha76.csv"
)

# Which variables to process
VARS <- c("Q","NO3","PO4P","SED")

# ========================= load latest simulation =============================
sim_dirs <- list.files("./simulation/", pattern = "[0-9]{12}")
stopifnot(length(sim_dirs) > 0)
sim_path <- file.path("./simulation", sim_dirs[length(sim_dirs)])
sim <- SWATrunR::load_swat_run(sim_path)

# Parameters table
par_vals <- sim$parameter$values |> mutate(run = sprintf("run_%04d", row_number()))
par_long <- par_vals |> pivot_longer(cols = -run, names_to = "parameter", values_to = "value")

# Slice simulation outputs and limit to N_RUNS, by gauge -----------------------
sims_by_gauge      <- list(cha44 = limit_runs(sim$simulation$flo_day_44, N_RUNS),
                           cha72 = limit_runs(sim$simulation$flo_day_72, N_RUNS),
                           cha76 = limit_runs(sim$simulation$flo_day_76, N_RUNS))

sims_by_gauge_NO3  <- list(cha44 = limit_runs(sim$simulation$no3_day_44, N_RUNS),
                           cha72 = limit_runs(sim$simulation$no3_day_72, N_RUNS),
                           cha76 = limit_runs(sim$simulation$no3_day_76, N_RUNS))

sims_by_gauge_SOLP <- list(cha44 = limit_runs(sim$simulation$solp_day_44, N_RUNS),
                           cha72 = limit_runs(sim$simulation$solp_day_72, N_RUNS),
                           cha76 = limit_runs(sim$simulation$solp_day_76, N_RUNS))

sims_by_gauge_SEDP <- list(cha44 = limit_runs(sim$simulation$sedp_day_44, N_RUNS),
                           cha72 = limit_runs(sim$simulation$sedp_day_72, N_RUNS),
                           cha76 = limit_runs(sim$simulation$sedp_day_76, N_RUNS))

sims_by_gauge_SED  <- list(cha44 = limit_runs(sim$simulation$sed_day_44, N_RUNS),
                           cha72 = limit_runs(sim$simulation$sed_day_72, N_RUNS),
                           cha76 = limit_runs(sim$simulation$sed_day_76, N_RUNS))

# --- helpers ------------------------------------------------------------------
# Return a named list of available gauges and their sim/obs for a variable key
get_var_io <- function(VAR){
  VAR <- toupper(VAR)
  out <- list()
  if (VAR == "Q") {
    paths <- flow_paths
    for(g in intersect(names(sims_by_gauge), names(paths))){
      out[[g]] <- list(sim = sims_by_gauge[[g]], obs = read_obs(paths[[g]]), units = "m3 s-1")
    }
  } else if (VAR == "NO3") {
    paths <- N_paths
    for(g in intersect(names(sims_by_gauge_NO3), names(paths))){
      # convert kg day-1 to mg L-1 using discharge
      conc <- load_to_conc(load = sims_by_gauge_NO3[[g]], flow = sims_by_gauge[[g]],
                           load_unit = 'kg day-1', flow_unit = 'm3 s-1', out_unit = 'mg L-1')
      out[[g]] <- list(sim = conc, obs = read_obs(paths[[g]]), units = "mg L-1")
    }
  } else if (VAR == "PO4P") {
    paths <- P_paths
    for(g in intersect(names(sims_by_gauge_SOLP), names(paths))){
      conc <- load_to_conc(load = sims_by_gauge_SOLP[[g]], flow = sims_by_gauge[[g]],
                           load_unit = 'kg day-1', flow_unit = 'm3 s-1', out_unit = 'mg L-1')
      out[[g]] <- list(sim = conc, obs = read_obs(paths[[g]]), units = "mg L-1")
    }
  } else if (VAR == "SED") {
    paths <- S_paths
    for(g in intersect(names(sims_by_gauge_SED), names(paths))){
      # convert tons day-1 to mg L-1
      conc <- load_to_conc(load = sims_by_gauge_SED[[g]], flow = sims_by_gauge[[g]],
                           load_unit = 'tons day-1', flow_unit = 'm3 s-1', out_unit = 'mg L-1')
      out[[g]] <- list(sim = conc, obs = read_obs(paths[[g]]), units = "mg L-1")
    }
  } else stop("Unknown VAR")
  out
}

# Compute GOF tables, FDC, and aggregate ranks for a variable ------------------
compute_var_scores <- function(VAR){
  io <- get_var_io(VAR)
  stopifnot(length(io) > 0)
  
  # per-gauge alignment + GOF
  gres <- lapply(names(io), function(gid){
    al <- align_sim_obs(io[[gid]]$sim, io[[gid]]$obs, period = period_q,
                        align_mode = ALIGN_MODE, fill_method = FILL_METHOD)
    simA <- al$sim; obsA <- al$obs
    fdc_sim <- SWATtunR::calc_fdc(prep_for_fdc(simA))
    fdc_obs <- SWATtunR::calc_fdc(select(obsA, date, run_001))
    
    gof_tbl <- SWATtunR::calc_gof(
      sim = simA, obs = obsA,
      funs = list(nse_q = hydroGOF::NSE,
                  kge_q = hydroGOF::KGE,
                  pb_q  = hydroGOF::pbias,
                  mae_q = hydroGOF::mae)
    ) |> mutate(gage = gid, .before = 1)
    
    gof_fdc <- safe_fdc_rsr(fdc_sim, fdc_obs)
    if (!is.null(gof_fdc)) gof_fdc <- mutate(gof_fdc, gage = gid, .before = 1)
    
    list(gage = gid, sim = simA, obs = obsA, gof = gof_tbl, gof_fdc = gof_fdc)
  })
  names(gres) <- names(io)
  
  # merge + score
  gof_all <- bind_rows(lapply(gres, \(x) x$gof)) |> mutate(run = norm_run(run))
  gof_fdc_all <- bind_rows(Filter(Negate(is.null), lapply(gres, \(x) x$gof_fdc)))
  if (nrow(gof_fdc_all)) gof_fdc_all <- mutate(gof_fdc_all, run = norm_run(run))
  
  gof_scored <- gof_all |> group_by(gage) |> mutate(
    nse_s = rn(nse_q),
    kge_s = rn(kge_q),
    pb_s  = rn(-abs(pb_q)),
    mae_s = rn(-mae_q)
  ) |> ungroup()
  
  w_tbl <- tibble::enframe(WEIGHTS, name = "gage", value = "w")
  agg <- gof_scored |> left_join(w_tbl, by = "gage") |> group_by(run) |> summarise(
    nse_w = stats::weighted.mean(nse_s, w, na.rm = TRUE),
    kge_w = stats::weighted.mean(kge_s, w, na.rm = TRUE),
    pb_w  = stats::weighted.mean(pb_s,  w, na.rm = TRUE),
    mae_w = stats::weighted.mean(mae_s, w, na.rm = TRUE), .groups = "drop") |>
    mutate(score = (nse_w + kge_w + pb_w + mae_w)/4) |>
    arrange(desc(score)) |>
    mutate(rank = row_number())
  
  list(VAR = VAR, results = gres, gof_all = gof_all, gof_fdc_all = gof_fdc_all,
       gof_scored = gof_scored, agg = agg)
}

# ========================= run for each variable ==============================
RESULTS <- lapply(VARS, compute_var_scores)
names(RESULTS) <- VARS

# ========================= exports ============================================
# Per variable: ranked table and parameter subset for TOP_K
# Writes CSV files with parameters and best simulations 
for(VAR in VARS){
  agg   <- RESULTS[[VAR]]$agg
  gof_s <- RESULTS[[VAR]]$gof_scored
  if (!nrow(agg)) next
  top_k <- min(TOP_K, nrow(agg))
  best_runs <- agg$run[seq_len(top_k)]
  par_top   <- filter(par_long, run %in% best_runs)
  
  readr::write_csv(agg,     paste0("runs_ranked_all_", VAR, ".csv"))
  readr::write_csv(filter(agg, run %in% best_runs), paste0("runs_ranked_top_", VAR, ".csv"))
  readr::write_csv(filter(gof_s, run %in% best_runs) |> select(gage, run, nse_q, kge_q, pb_q, mae_q),
                   paste0("runs_top_per_gage_gof_", VAR, ".csv"))
  readr::write_csv(par_top, paste0("runs_top_parameters_long_", VAR, ".csv"))
}

# ========================= viewers (optional) =================================
# Example: view top runs for a selected gauge and variable
if (interactive()){
  VAR <- "Q"  # change to "Q", NO3","PO4P","SED" as needed
  key <- choose_gauge_key(GAUGE_TO_VIEW, keys = names(get_var_io(VAR)))
  gres <- RESULTS[[VAR]]$results
  sim_g <- gres[[key]]$sim; obs_g <- gres[[key]]$obs
  
  # rank runs by normalization within this gauge
  gof_sel <- RESULTS[[VAR]]$gof_all |> filter(tolower(gage)==tolower(key)) |> select(run, nse_q, kge_q, pb_q, mae_q)
  gof_adj <- mutate(gof_sel, nse_q=-nse_q, kge_q=-kge_q, pb_q=-abs(pb_q), mae_q=-mae_q)
  gof_rank <- SWATtunR::rank_gof(gof_adj, type = "norm")
  run_ids_rank <- run_to_id(gof_rank$run[seq_len(min(10, nrow(gof_rank)))])
  SWATtunR::view_timeseries(sim_g, obs_g, run_ids = run_ids_rank)
}

if (interactive()){
  VAR <- "NO3"  # change to "Q", NO3","PO4P","SED" as needed
  key <- choose_gauge_key(GAUGE_TO_VIEW, keys = names(get_var_io(VAR)))
  gres <- RESULTS[[VAR]]$results
  sim_g <- gres[[key]]$sim; obs_g <- gres[[key]]$obs
  
  # rank runs by normalization within this gauge
  gof_sel <- RESULTS[[VAR]]$gof_all |> filter(tolower(gage)==tolower(key)) |> select(run, nse_q, kge_q, pb_q, mae_q)
  gof_adj <- mutate(gof_sel, nse_q=-nse_q, kge_q=-kge_q, pb_q=-abs(pb_q), mae_q=-mae_q)
  gof_rank <- SWATtunR::rank_gof(gof_adj, type = "norm")
  run_ids_rank <- run_to_id(gof_rank$run[seq_len(min(10, nrow(gof_rank)))])
  SWATtunR::view_timeseries(sim_g, obs_g, run_ids = run_ids_rank, y_label = "NO3-N conc. [mg/]")
}

if (interactive()){
  VAR <- "PO4P"  # change to "Q", NO3","PO4P","SED" as needed
  key <- choose_gauge_key(GAUGE_TO_VIEW, keys = names(get_var_io(VAR)))
  gres <- RESULTS[[VAR]]$results
  sim_g <- gres[[key]]$sim; obs_g <- gres[[key]]$obs
  
  # rank runs by normalization within this gauge
  gof_sel <- RESULTS[[VAR]]$gof_all |> filter(tolower(gage)==tolower(key)) |> select(run, nse_q, kge_q, pb_q, mae_q)
  gof_adj <- mutate(gof_sel, nse_q=-nse_q, kge_q=-kge_q, pb_q=-abs(pb_q), mae_q=-mae_q)
  gof_rank <- SWATtunR::rank_gof(gof_adj, type = "norm")
  run_ids_rank <- run_to_id(gof_rank$run[seq_len(min(10, nrow(gof_rank)))])
  SWATtunR::view_timeseries(sim_g, obs_g, run_ids = run_ids_rank, y_label = "PO4-P conc. [mg/]")
}

if (interactive()){
  VAR <- "SED"  # change to "Q", NO3","PO4P","SED" as needed
  key <- choose_gauge_key(GAUGE_TO_VIEW, keys = names(get_var_io(VAR)))
  gres <- RESULTS[[VAR]]$results
  sim_g <- gres[[key]]$sim; obs_g <- gres[[key]]$obs
  
  # rank runs by normalization within this gauge
  gof_sel <- RESULTS[[VAR]]$gof_all |> filter(tolower(gage)==tolower(key)) |> select(run, nse_q, kge_q, pb_q, mae_q)
  gof_adj <- mutate(gof_sel, nse_q=-nse_q, kge_q=-kge_q, pb_q=-abs(pb_q), mae_q=-mae_q)
  gof_rank <- SWATtunR::rank_gof(gof_adj, type = "norm")
  run_ids_rank <- run_to_id(gof_rank$run[seq_len(min(10, nrow(gof_rank)))])
  SWATtunR::view_timeseries(sim_g, obs_g, run_ids = run_ids_rank, y_label = "Sed conc. [mg/]")
}




# ========================= dotty plots (optional) =============================
# ========================= dotty plots (optional) =============================
if (interactive()){
  # Weighted KGE across gauges for a chosen VAR
  VAR <- "NO3"  # change to "Q", NO3","PO4P","SED" as needed
  w_tbl <- tibble::enframe(WEIGHTS, name = "gage", value = "w")
  kge_weighted <- RESULTS[[VAR]]$gof_all |> left_join(w_tbl, by = "gage") |>
    group_by(run) |> summarise(KGE = stats::weighted.mean(kge_q, w, na.rm = TRUE), .groups="drop")
  dotty_df <- par_long |> inner_join(kge_weighted, by = "run") |> filter(is.finite(value), is.finite(KGE))
  
  ggplot2::ggplot(dotty_df, ggplot2::aes(x=value, y=KGE)) +
    ggplot2::geom_point(alpha=0.6, size=1.2) +
    ggplot2::geom_smooth(method="lm", formula=y~x, se=FALSE, linewidth=0.8) +
    ggplot2::facet_wrap(~ parameter, scales = "free_x") +
    ggplot2::labs(x="Parameter value", y="KGE (NO3-N)") +
    ggplot2::theme_bw()
}

if (interactive()){
  # Weighted KGE across gauges for a chosen VAR
  VAR <- "PO4P"  # change to "Q", NO3","PO4P","SED" as needed
  w_tbl <- tibble::enframe(WEIGHTS, name = "gage", value = "w")
  kge_weighted <- RESULTS[[VAR]]$gof_all |> left_join(w_tbl, by = "gage") |>
    group_by(run) |> summarise(KGE = stats::weighted.mean(kge_q, w, na.rm = TRUE), .groups="drop")
  dotty_df <- par_long |> inner_join(kge_weighted, by = "run") |> filter(is.finite(value), is.finite(KGE))
  
  ggplot2::ggplot(dotty_df, ggplot2::aes(x=value, y=KGE)) +
    ggplot2::geom_point(alpha=0.6, size=1.2) +
    ggplot2::geom_smooth(method="lm", formula=y~x, se=FALSE, linewidth=0.8) +
    ggplot2::facet_wrap(~ parameter, scales = "free_x") +
    ggplot2::labs(x="Parameter value", y="KGE (PO4-P)") +
    ggplot2::theme_bw()
}

if (interactive()){
  # Weighted KGE across gauges for a chosen VAR
  VAR <- "SED"  # change to "Q", NO3","PO4P","SED" as needed
  w_tbl <- tibble::enframe(WEIGHTS, name = "gage", value = "w")
  kge_weighted <- RESULTS[[VAR]]$gof_all |> left_join(w_tbl, by = "gage") |>
    group_by(run) |> summarise(KGE = stats::weighted.mean(kge_q, w, na.rm = TRUE), .groups="drop")
  dotty_df <- par_long |> inner_join(kge_weighted, by = "run") |> filter(is.finite(value), is.finite(KGE))
  
  ggplot2::ggplot(dotty_df, ggplot2::aes(x=value, y=KGE)) +
    ggplot2::geom_point(alpha=0.6, size=1.2) +
    ggplot2::geom_smooth(method="lm", formula=y~x, se=FALSE, linewidth=0.8) +
    ggplot2::facet_wrap(~ parameter, scales = "free_x") +
    ggplot2::labs(x="Parameter value", y="KGE (sed)") +
    ggplot2::theme_bw()
}


# ========================= dotty plots by gauge (optional) ====================
if (interactive()){
  VAR <- "Q" # or "NO3","PO4P","SED", "Q"
  # KGE per gauge
  kge_by_g <- RESULTS[[VAR]]$gof_all |>
    dplyr::select(gage, run, KGE = kge_q) |>
    dplyr::filter(is.finite(KGE))
  dotty_df_g <- par_long |>
    dplyr::inner_join(kge_by_g, by = "run") |>
    dplyr::filter(is.finite(value))
  ggplot2::ggplot(dotty_df_g, ggplot2::aes(x = value, y = KGE, colour = gage)) +
    ggplot2::geom_point(alpha = 0.55, size = 1.2) +
    ggplot2::geom_smooth(method = "lm", formula = y ~ x, se = FALSE, linewidth = 1.2) +
    ggplot2::facet_wrap(~ parameter, scales = "free_x") +
    ggplot2::labs(x = "Parameter value", y = "KGE", colour = "Gauge") +
    ggplot2::theme_bw()
}
