# ========================= FULL SCRIPT (no weights) =========================
# Load required R packages ---------------------------------------------------
library(SWATrunR)
library(SWATtunR)
library(hydroGOF)
library(tidyverse)
library(zoo)

# ---- knobs and paths -------------------------------------------------------
N_RUNS <- 150          # number of simulation runs to use
TOP_K  <- 150          # runs to show

ALIGN_MODE  <- "overlap_seq"    # "intersect" or "overlap_seq"
FILL_METHOD <- "none"           # "none","linear","locf" for obs gaps

flow_paths <- c(
  cha44 = "./observation/q_cha44_cms.csv",
  cha72 = "./observation/q_cha72_cms.csv",
  cha76 = "./observation/q_cha76_cms.csv"
)
period_q <- c("2004-01-01","2013-12-31")

# ---- helpers ---------------------------------------------------------------
limit_runs <- function(df, n = N_RUNS){
  rcols <- grep("^run_\\d+$", names(df), value = TRUE)
  pad   <- max(nchar(sub("^.*_", "", rcols)))
  want  <- paste0("run_", sprintf(paste0("%0", pad, "d"), seq_len(min(n, length(rcols)))))
  # order by numeric id to be safe
  id    <- as.integer(sub("^run_0*", "", rcols))
  rcols <- rcols[order(id)]
  rcols <- intersect(rcols, want)
  dplyr::select(df, date, dplyr::all_of(rcols))
}

read_obs <- function(path){
  x <- readr::read_csv(path, show_col_types = FALSE)
  stopifnot("date" %in% names(x))
  vcol <- setdiff(names(x), "date")[1]; stopifnot(!is.null(vcol))
  x <- dplyr::select(x, date, obs = dplyr::all_of(vcol))
  x$date <- as.Date(x$date)
  x
}

fill_obs <- function(obs, method = FILL_METHOD){
  if (method == "none")   return(obs)
  if (method == "linear") { obs$obs <- zoo::na.approx(obs$obs, x = obs$date, na.rm = FALSE); return(obs) }
  if (method == "locf")   { obs$obs <- zoo::na.locf(obs$obs, na.rm = FALSE); return(obs) }
  obs
}

align_sim_obs <- function(sim_tbl, obs_tbl, period){
  sim_tbl$date <- as.Date(sim_tbl$date)
  obs_tbl$date <- as.Date(obs_tbl$date)
  sim_tbl <- filter_period(sim_tbl, period)
  obs_tbl <- filter_period(obs_tbl, period)
  
  if (ALIGN_MODE == "intersect") {
    common <- intersect(sim_tbl$date, obs_tbl$date)
    sim_a  <- dplyr::arrange(dplyr::filter(sim_tbl, date %in% common), date)
    obs_a  <- dplyr::arrange(dplyr::filter(obs_tbl, date %in% common), date)
  } else {
    start <- max(min(sim_tbl$date, na.rm=TRUE), min(obs_tbl$date, na.rm=TRUE))
    end   <- min(max(sim_tbl$date, na.rm=TRUE), max(obs_tbl$date, na.rm=TRUE))
    stopifnot(is.finite(start), is.finite(end), start <= end)
    seqd  <- tibble::tibble(date = seq.Date(start, end, by = "day"))
    sim_a <- dplyr::left_join(seqd, sim_tbl, by = "date")
    obs_a <- dplyr::left_join(seqd, obs_tbl, by = "date")
  }
  
  names(obs_a)[names(obs_a) == "obs"] <- "run_01"
  obs_a <- fill_obs(obs_a, FILL_METHOD)
  ok <- !is.na(obs_a$run_01)
  
  list(
    sim = dplyr::distinct(sim_a[ok, ], date, .keep_all = TRUE),
    obs = dplyr::distinct(obs_a[ok, ], date, .keep_all = TRUE)
  )
}

prep_for_fdc <- function(x){
  dplyr::select(x, date, tidyselect::starts_with("run_")) |>
    dplyr::distinct(date, .keep_all = TRUE)
}

safe_fdc_rsr <- function(fdc_sim, fdc_obs){
  out <- try(calc_fdc_rsr(fdc_sim = fdc_sim, fdc_obs = fdc_obs,
                          quantile_splits = c(5,20,70,95)), silent = TRUE)
  if (inherits(out, "try-error")) NULL else out
}

rn <- function(x, invert = FALSE){
  n <- sum(!is.na(x)); if (n <= 1) return(rep(NA_real_, length(x)))
  s <- (rank(x, na.last = "keep", ties.method = "average") - 1)/(n - 1)
  if (invert) 1 - s else s
}

norm_run <- function(x) sprintf("run_%03d", as.integer(gsub("\\D", "", x)))

n_runs_in <- function(df) sum(grepl("^run_\\d+$", names(df)))

# ---- load simulation, keep only needed tibbles ---------------------------
sims <- list.files("./simulation/", pattern = "[0-9]{12}")
# Optional: choose the directory with the most runs across gauges
sim_path <- file.path("./simulation", sims[ which.max(runs_per_dir) ])
sim <- load_swat_run(sim_path)

par_vals <- sim$parameter$values
par_vals <- par_vals %>% dplyr::mutate(run = sprintf("run_%02d", dplyr::row_number()))

# long format: run / parameter / value
par_long <- par_vals %>%
  tidyr::pivot_longer(
    cols = -run,
    names_to  = "parameter",
    values_to = "value"
  ) %>%
  dplyr::mutate(run = norm_run(run))

sims_by_gauge <- list(
  cha44 = limit_runs(sim$simulation$flo_day_44, N_RUNS),
  cha72 = limit_runs(sim$simulation$flo_day_72, N_RUNS),
  cha76 = limit_runs(sim$simulation$flo_day_76, N_RUNS)
)

# sanity: stop if fewer than requested runs exist
avail_runs <- sapply(sims_by_gauge, n_runs_in)
if (any(avail_runs < N_RUNS)) {
  stop("Not enough runs in loaded simulation: ",
       paste(names(avail_runs), avail_runs, sep="=", collapse=", "),
       " ; requested N_RUNS=", N_RUNS)
}

# ---- loop with misaligned, gappy observations handled -------------------
gauge_results <- lapply(names(flow_paths), function(gid){
  sim_f <- sims_by_gauge[[gid]]
  obs_f <- read_obs(flow_paths[[gid]])
  
  al <- align_sim_obs(sim_f, obs_f, period_q)
  flow_sim <- al$sim
  flow_obs <- al$obs
  
  flow_fdc_sim <- calc_fdc(prep_for_fdc(flow_sim))
  flow_fdc_obs <- calc_fdc(dplyr::select(flow_obs, date, run_01))
  
  gof_flow <- calc_gof(
    sim = flow_sim, obs = flow_obs,
    funs = list(nse_q = NSE, kge_q = KGE, pb_q = pbias, mae_q = mae)
  ) %>% dplyr::mutate(gage = gid, .before = 1)
  
  gof_fdc <- safe_fdc_rsr(flow_fdc_sim, flow_fdc_obs)
  if (!is.null(gof_fdc)) gof_fdc <- dplyr::mutate(gof_fdc, gage = gid, .before = 1)
  
  list(gage = gid, flow_sim = flow_sim, flow_obs = flow_obs,
       gof_flow = gof_flow, gof_fdc = gof_fdc)
})

gof_flow_all <- dplyr::bind_rows(lapply(gauge_results, \(x) x$gof_flow)) %>%
  dplyr::mutate(run = norm_run(run))

gof_fdc_all  <- dplyr::bind_rows(Filter(Negate(is.null),
                                        lapply(gauge_results, \(x) x$gof_fdc)))
if (nrow(gof_fdc_all)) {
  gof_fdc_all <- gof_fdc_all %>% dplyr::mutate(run = norm_run(run))
}

# ---- score per gage (higher is better) ----------------------------------
# NSE, KGE higher better; pbias and mae lower better
gof_scored <- gof_flow_all %>%
  dplyr::group_by(gage) %>%
  dplyr::mutate(
    nse_s = rn(nse_q),
    kge_s = rn(kge_q),
    pb_s  = rn(-abs(pb_q)),
    mae_s = rn(-mae_q)
  ) %>%
  dplyr::ungroup()

# ---- aggregate per run (unweighted across gauges) -----------------------
agg <- gof_scored %>%
  dplyr::group_by(run) %>%
  dplyr::summarise(
    nse_w = mean(nse_s, na.rm = TRUE),
    kge_w = mean(kge_s, na.rm = TRUE),
    pb_w  = mean(pb_s,  na.rm = TRUE),
    mae_w = mean(mae_s, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  dplyr::mutate(
    score = (nse_w + kge_w + pb_w + mae_w) / 4
  ) %>%
  dplyr::arrange(dplyr::desc(score)) %>%
  dplyr::mutate(rank = dplyr::row_number())

# ---- select TOP_K --------------------------------------------------------
TOP_K <- min(TOP_K, nrow(agg))
best_runs <- agg$run[seq_len(TOP_K)]

agg_top <- dplyr::filter(agg, run %in% best_runs)

# ---- per-gage table for TOP_K (diagnostics) -----------------------------
per_gage_top <- gof_scored %>%
  dplyr::filter(run %in% best_runs) %>%
  dplyr::select(gage, run, nse_q, kge_q, pb_q, mae_q)

# ---- prepare parameter table --------------------------------------------
par_top <- dplyr::filter(par_long, run %in% best_runs)

# ---- simple QC plots (optional) -----------------------------------------
if (interactive()) {
  # Composite score bar
  ggplot2::ggplot(agg_top, ggplot2::aes(x = reorder(run, score), y = score)) +
    ggplot2::geom_col() +
    ggplot2::coord_flip() +
    ggplot2::labs(x = "run", y = "composite score")
  
  # KGE by gage for TOP_K
  gof_scored_top <- dplyr::filter(gof_scored, run %in% best_runs)
  ggplot2::ggplot(gof_scored_top, ggplot2::aes(run, kge_q)) +
    ggplot2::geom_point() +
    ggplot2::facet_wrap(~ gage, ncol = 1, scales = "free_y") +
    ggplot2::coord_flip() +
    ggplot2::labs(x = "run", y = "KGE")
}


####### dotty ####
# 0) Make runs column and pivot to long
par_long2 <- par_long %>%
  dplyr::mutate(run = sprintf("run_%03d", dplyr::row_number())) %>%
  tidyr::pivot_longer(
    cols = -run,
    names_to = "parameter",
    values_to = "value"
  )

# --- Dotty plot: all parameters vs KGE (unweighted mean across gauges) ----
kge_mean <- gof_flow_all %>%
  dplyr::group_by(run) %>%
  dplyr::summarise(KGE = mean(kge_q, na.rm = TRUE), .groups = "drop")

dotty_df <- par_long2 %>%
  dplyr::inner_join(kge_mean, by = "run") %>%
  dplyr::filter(is.finite(value), is.finite(KGE))

ggplot2::ggplot(dotty_df, ggplot2::aes(x = value, y = KGE)) +
  ggplot2::geom_point(alpha = 0.6, size = 1.2) +
  ggplot2::facet_wrap(ggplot2::vars(parameter), scales = "free_x") +
  ggplot2::labs(x = "Parameter value", y = "KGE (mean across gauges)") +
  ggplot2::theme_bw()

# --- Optional: per-gage dotty (colour by gauge) --------------------------
dotty_df_g <- par_long2 %>%
  dplyr::inner_join(dplyr::select(gof_flow_all, run, gage, KGE = kge_q), by = "run") %>%
  dplyr::filter(is.finite(value), is.finite(KGE))

ggplot2::ggplot(dotty_df_g, ggplot2::aes(x = value, y = KGE, colour = gage)) +
  ggplot2::geom_point(alpha = 0.6, size = 1.2) +
  ggplot2::facet_wrap(~ parameter, scales = "free_x") +
  ggplot2::labs(x = "Parameter value", y = "KGE", colour = "Gauge") +
  ggplot2::theme_bw()

# ---- exports -------------------------------------------------------------
# readr::write_csv(agg,            "runs_ranked_all.csv")
# readr::write_csv(agg_top,        "runs_ranked_top.csv")
# readr::write_csv(per_gage_top,   "runs_top_per_gage_gof.csv")
# readr::write_csv(par_top,        "runs_top_parameters_long.csv")

# ---- convenience objects for downstream use -----------------------------
RUNS_SELECTED <- best_runs
GOF_ALL       <- gof_scored
GOF_TOP       <- dplyr::filter(gof_scored, run %in% best_runs)
PARAMS_TOP    <- par_top
# ========================================================================
