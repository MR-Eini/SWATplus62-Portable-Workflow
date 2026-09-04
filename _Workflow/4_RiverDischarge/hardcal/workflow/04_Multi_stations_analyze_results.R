###############
# Multiple station assessments workflow by Mamad Oct 2025
# Purpose:
# 1) Load latest SWAT+ simulation
# 2) Align simulated flows with observed flows for multiple gauges
# 3) Compute GOF metrics per run and per gauge
# 4) Aggregate to a weighted composite score across gauges
# 5) Select TOP_K runs and prepare diagnostics/plots
###############

# --- libs ---------------------------------------------------------------------
library(SWATrunR)   # load_swat_run(), SWAT outputs access
library(SWATtunR)   # calc_gof(), calc_fdc(), rank_gof(), view_timeseries()
library(hydroGOF)   # NSE, KGE, pbias, mae
library(zoo)        # na.approx(), na.locf()
library(tidyverse)  # dplyr, tidyr, ggplot2, readr, etc.
source("./workflow/functions.R")  # helper functions (norm_run, limit_runs, align_sim_obs, ...)

# --- knobs (edit as needed) ---------------------------------------------------
N_RUNS      <- 600           # keep first N simulated runs per gauge (by numeric run id)
TOP_K       <- 600           # retain top-K runs after composite scoring
ALIGN_MODE  <- "overlap_seq" # "intersect" uses common dates only; "overlap_seq" builds a full daily seq over overlap
FILL_METHOD <- "none"        # how to fill obs gaps before GOF: "none", "linear" (interp), "locf" (carry forward)

# --- observed flow file paths per gauge ---------------------------------------
flow_paths <- c(
  cha44 = "./observation/q_cha44_cms.csv",
  cha72 = "./observation/q_cha72_cms.csv",
  cha76 = "./observation/q_cha76_cms.csv"
)

# --- analysis window for alignment --------------------------------------------
period_q <- c("2004-01-01", "2013-12-31")

# --- gauge weights for run scoring --------------------------------------------
WEIGHTS <- c(cha44 = 0.6, cha72 = 0.2, cha76 = 0.2); WEIGHTS <- WEIGHTS / sum(WEIGHTS)

# --- viewer selection ----------------------------------------------------------
GAUGE_TO_VIEW <- "cha44"     # one of names(flow_paths) or index 1..length(flow_paths)

# --- optional GOF thresholds (not wired by default) ----------------------------
THRESHOLDS <- list(nse_min = 0.50, pb_absmax = 10.0, mae_max = Inf)

# ========================= MAIN WORKFLOW ======================================

# 1) Load latest simulation directory (expects YYYYMMDDHHMM pattern) -----------
sim_dirs <- list.files("./simulation/", pattern = "[0-9]{12}")
stopifnot(length(sim_dirs) > 0)
sim_path <- file.path("./simulation", sim_dirs[length(sim_dirs)])
sim <- SWATrunR::load_swat_run(sim_path)

# 2) Build parameter table (long), attach normalized run labels ----------------
par_vals <- sim$parameter$values |>
  dplyr::mutate(run = sprintf("run_%03d", dplyr::row_number()))   # run_001..run_N
par_long <- par_vals |>
  tidyr::pivot_longer(cols = -run, names_to = "parameter", values_to = "value")

# 3) Slice simulated flows per gauge and limit to N_RUNS -----------------------
#    limit_runs() also normalizes column names to run_XXX ordered numerically
#    For other parameters like NO3,... should be modified
#    View(sim) or sim[["simulation"]]

sims_by_gauge <- list(
  cha44 = limit_runs(sim$simulation$flo_day_44, N_RUNS),
  cha72 = limit_runs(sim$simulation$flo_day_72, N_RUNS),
  cha76 = limit_runs(sim$simulation$flo_day_76, N_RUNS)
)

# 4) Align sim and obs per gauge; compute GOF + FDC ----------------------------
#    align_sim_obs(): returns list(sim=..., obs=...) with obs column named run_001
gauge_results <- lapply(names(flow_paths), function(gid){
  sim_f <- sims_by_gauge[[gid]]
  obs_f <- read_obs(flow_paths[[gid]])
  
  al <- align_sim_obs(sim_f, obs_f, period = period_q,
                      align_mode = ALIGN_MODE, fill_method = FILL_METHOD)
  
  flow_sim <- al$sim
  flow_obs <- al$obs
  
  # Flow duration curves for RSR metrics
  fdc_sim <- SWATtunR::calc_fdc(prep_for_fdc(flow_sim))
  fdc_obs <- SWATtunR::calc_fdc(dplyr::select(flow_obs, date, run_001))
  
  # Core discharge GOFs per run
  gof_flow <- SWATtunR::calc_gof(
    sim = flow_sim, obs = flow_obs,
    funs = list(nse_q = hydroGOF::NSE,
                kge_q = hydroGOF::KGE,
                pb_q  = hydroGOF::pbias,
                mae_q = hydroGOF::mae)
  ) |>
    dplyr::mutate(gage = gid, .before = 1)
  
  # FDC RSR (robust try-catch)
  gof_fdc <- safe_fdc_rsr(fdc_sim, fdc_obs)
  if (!is.null(gof_fdc)) gof_fdc <- dplyr::mutate(gof_fdc, gage = gid, .before = 1)
  
  list(gage = gid, flow_sim = flow_sim, flow_obs = flow_obs,
       gof_flow = gof_flow, gof_fdc = gof_fdc)
})
names(gauge_results) <- names(flow_paths)

# 5) Merge GOF across gauges; normalize run labels -----------------------------
gof_flow_all <- dplyr::bind_rows(lapply(gauge_results, \(x) x$gof_flow)) |>
  dplyr::mutate(run = norm_run(run))     # ensure run_XXX
gof_fdc_all <- dplyr::bind_rows(Filter(Negate(is.null),
                                       lapply(gauge_results, \(x) x$gof_fdc)))
if (nrow(gof_fdc_all)) gof_fdc_all <- dplyr::mutate(gof_fdc_all, run = norm_run(run))

# 6) Rank-normalize GOFs within each gauge; higher is better -------------------
#    rn(): [0,1] ranks; invert sign for metrics to minimize
gof_scored <- gof_flow_all |>
  dplyr::group_by(gage) |>
  dplyr::mutate(
    nse_s = rn(nse_q),
    kge_s = rn(kge_q),
    pb_s  = rn(-abs(pb_q)),  # lower |pbias| is better
    mae_s = rn(-mae_q)       # lower MAE is better
  ) |>
  dplyr::ungroup()

# 7) Aggregate across gauges using WEIGHTS; compute composite score ------------
w_tbl <- tibble::enframe(WEIGHTS, name = "gage", value = "w")

agg <- gof_scored |>
  dplyr::left_join(w_tbl, by = "gage") |>
  dplyr::group_by(run) |>
  dplyr::summarise(
    nse_w = stats::weighted.mean(nse_s, w, na.rm = TRUE),
    kge_w = stats::weighted.mean(kge_s, w, na.rm = TRUE),
    pb_w  = stats::weighted.mean(pb_s,  w, na.rm = TRUE),
    mae_w = stats::weighted.mean(mae_s, w, na.rm = TRUE),
    .groups = "drop"
  ) |>
  dplyr::mutate(
    score = (nse_w + kge_w + pb_w + mae_w) / 4  # simple average of weighted sub-scores
  ) |>
  dplyr::arrange(dplyr::desc(score)) |>
  dplyr::mutate(rank = dplyr::row_number())

# 8) Select TOP_K runs; keep per-gauge table and parameter subset --------------
TOP_K      <- min(TOP_K, nrow(agg))
best_runs  <- agg$run[seq_len(TOP_K)]
agg_top    <- dplyr::filter(agg, run %in% best_runs)

per_gage_top <- gof_scored |>
  dplyr::filter(run %in% best_runs) |>
  dplyr::select(gage, run, nse_q, kge_q, pb_q, mae_q)

par_top <- dplyr::filter(par_long, run %in% best_runs)

# 9) Parameter–KGE dotty inputs (weighted KGE across gauges) -------------------
kge_weighted <- gof_flow_all %>%
  dplyr::left_join(w_tbl, by = "gage") %>%
  dplyr::group_by(run) %>%
  dplyr::summarise(KGE = stats::weighted.mean(kge_q, w, na.rm = TRUE), .groups = "drop")

dotty_df <- par_long %>%
  dplyr::inner_join(kge_weighted, by = "run") %>%
  dplyr::filter(is.finite(value), is.finite(KGE))

# 10) Optional dotty plots (guard with interactive()) --------------------------
if (interactive()) {
  ggplot2::ggplot(dotty_df, ggplot2::aes(x = value, y = KGE)) +
    ggplot2::geom_point(alpha = 0.6, size = 1.2) +
    ggplot2::geom_smooth(method = "lm", formula = y ~ x, se = FALSE, linewidth = 0.6) +
    ggplot2::facet_wrap(~ parameter, scales = "free_x") +
    ggplot2::labs(x = "Parameter value", y = "KGE (weighted)") +
    ggplot2::theme_bw()
}

# Per-gage dotty (colour by gauge)
dotty_df_g <- par_long %>%
  dplyr::inner_join(dplyr::select(gof_flow_all, run, gage, KGE = kge_q), by = "run")

if (interactive()) {
  ggplot2::ggplot(dotty_df_g, ggplot2::aes(x = value, y = KGE, colour = gage)) +
    ggplot2::geom_point(alpha = 0.55, size = 1) +
    ggplot2::geom_smooth(method = "lm", formula = y ~ x, se = FALSE,
                         linewidth = 2, alpha = 1) +
    ggplot2::facet_wrap(~ parameter, scales = "free_x") +
    ggplot2::scale_colour_brewer(palette = "Accent") +
    ggplot2::labs(x = "Parameter value", y = "KGE", colour = "Gauge") +
    ggplot2::theme_bw()
}


# 11) Timeseries viewer for selected gauge; rank-based pick of runs ------------
key <- choose_gauge_key(GAUGE_TO_VIEW, keys = names(flow_paths))
flow_sim_g <- gauge_results[[key]][["flow_sim"]]
flow_obs_g <- gauge_results[[key]][["flow_obs"]]

# GOFs for chosen gauge only
gof_sel <- gof_flow_all %>%
  dplyr::filter(tolower(gage) == tolower(key)) %>%
  dplyr::select(run, nse_q, kge_q, pb_q, mae_q)
stopifnot(nrow(gof_sel) > 0)

# Flip signs where needed for ranking-by-normalization
gof_adj <- gof_sel %>%
  dplyr::mutate(
    nse_q = -nse_q,
    kge_q = -kge_q,
    pb_q  = -abs(pb_q),
    mae_q = -mae_q
  )

# Top-N runs for visual inspection at this gauge
gof_rank <- SWATtunR::rank_gof(gof_adj, type = "norm")
topN <- min(10, nrow(gof_rank))
run_sel_rank <- gof_rank$run[seq_len(topN)]
run_ids_rank <- run_to_id(run_sel_rank)  # convert run_016 -> 16 to index columns

# Interactive viewer (pan/zoom, overlay sim vs obs)
SWATtunR::view_timeseries(flow_sim_g, flow_obs_g, run_ids = run_ids_rank)

# 12) Optional static plot for first selected run -------------------------------
if (length(run_ids_rank) >= 1 && interactive()) {
  rcol <- sprintf("run_%03d", run_ids_rank[1])
  df_plot <- flow_sim_g %>%
    dplyr::select(date, sim = dplyr::all_of(rcol)) %>%
    dplyr::left_join(dplyr::rename(flow_obs_g, obs = run_001), by = "date")
  
  ggplot2::ggplot(df_plot, ggplot2::aes(date)) +
    ggplot2::geom_line(ggplot2::aes(y = obs)) +
    ggplot2::geom_line(ggplot2::aes(y = sim), linewidth = 0.4) +
    ggplot2::labs(y = "Flow (m3/s)", x = NULL,
                  title = paste("Gauge", key, "-", rcol, "(top ranked)")) +
    ggplot2::theme_bw()
}

# 13) Exports (uncomment as needed) --------------------------------------------
# readr::write_csv(agg,          "runs_ranked_all.csv")        # all runs with composite scores
# readr::write_csv(agg_top,      "runs_ranked_top.csv")        # TOP_K only
# readr::write_csv(per_gage_top, "runs_top_per_gage_gof.csv")  # metrics per gauge for TOP_K
readr::write_csv(par_top,      "runs_top_parameters_long.csv") # parameter values for TOP_K

# 14) Convenience objects for downstream scripts -------------------------------
RUNS_SELECTED <- best_runs
GOF_ALL       <- gof_scored
GOF_TOP       <- dplyr::filter(gof_scored, run %in% best_runs)
PARAMS_TOP    <- par_top
