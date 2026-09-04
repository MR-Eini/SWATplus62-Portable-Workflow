###############
# Multiple stations functions by MRE
###############
PAD_WIDTH <- 4

# ---- Date + period -----------------------------------------------------------
as_date <- function(x) as.Date(x)

filter_period <- function(df, period) {
  dplyr::filter(df, date >= as_date(period[1]), date <= as_date(period[2]))
}

# ---- Run ID utilities --------------------------------------------------------
norm_run <- function(x, width = PAD_WIDTH) {
  out <- suppressWarnings(as.integer(gsub("\\D", "", as.character(x))))
  paste0("run_", sprintf(paste0("%0", width, "d"), out))
}

run_to_id <- function(run_labels) {
  suppressWarnings(as.integer(gsub("\\D", "", as.character(run_labels))))
}

# ---- Simulation table trimming ----------------------------------------------
limit_runs <- function(df, n) {
  stopifnot("date" %in% names(df))
  rcols <- grep("^run_\\d+$", names(df), value = TRUE)
  if (!length(rcols)) stop("No run_* columns found")
  nums  <- as.integer(sub("^run_0*", "", rcols))
  ord   <- order(nums)
  rcols <- rcols[ord]
  take  <- seq_len(min(n, length(rcols)))
  keep  <- rcols[take]
  out   <- dplyr::select(df, date, dplyr::all_of(keep))
  names(out)[-1] <- norm_run(names(out)[-1], PAD_WIDTH)  # << consistent width
  out
}


# ---- Observations I/O + filling ---------------------------------------------
read_obs <- function(path) {
  x <- readr::read_csv(path, show_col_types = FALSE)
  stopifnot("date" %in% names(x))
  vcol <- setdiff(names(x), "date")[1]; stopifnot(length(vcol) == 1)
  x <- dplyr::select(x, date, obs = dplyr::all_of(vcol))
  x$date <- as_date(x$date)
  x
}

fill_obs <- function(obs, method = c("none","linear","locf")) {
  method <- match.arg(method)
  if (method == "none")   return(obs)
  if (method == "linear") { obs$obs <- zoo::na.approx(obs$obs, x = obs$date, na.rm = FALSE); return(obs) }
  if (method == "locf")   { obs$obs <- zoo::na.locf(obs$obs, na.rm = FALSE); return(obs) }
  obs
}

# ---- Align sim/obs -----------------------------------------------------------
align_sim_obs <- function(sim_tbl, obs_tbl, period, align_mode = c("overlap_seq","intersect"),
                          fill_method = c("none","linear","locf")) {
  align_mode  <- match.arg(align_mode)
  fill_method <- match.arg(fill_method)

  sim_tbl$date <- as_date(sim_tbl$date)
  obs_tbl$date <- as_date(obs_tbl$date)
  sim_tbl <- filter_period(sim_tbl, period)
  obs_tbl <- filter_period(obs_tbl, period)

  if (align_mode == "intersect") {
    common <- intersect(sim_tbl$date, obs_tbl$date)
    seqd   <- tibble::tibble(date = sort(common))
    sim_a  <- dplyr::left_join(seqd, sim_tbl, by = "date")
    obs_a  <- dplyr::left_join(seqd, obs_tbl, by = "date")
  } else {
    start <- max(min(sim_tbl$date, na.rm = TRUE), min(obs_tbl$date, na.rm = TRUE))
    end   <- min(max(sim_tbl$date, na.rm = TRUE), max(obs_tbl$date, na.rm = TRUE))
    stopifnot(is.finite(start), is.finite(end), start <= end)
    seqd  <- tibble::tibble(date = seq.Date(start, end, by = "day"))
    sim_a <- dplyr::left_join(seqd, sim_tbl, by = "date")
    obs_a <- dplyr::left_join(seqd, obs_tbl, by = "date")
  }

  # replaced   # names(obs_a)[names(obs_a) == "obs"] <- "run_001"
  # with this
  names(obs_a)[names(obs_a) == "obs"] <- paste0("run_", sprintf(paste0("%0", PAD_WIDTH, "d"), 1))

  obs_a <- fill_obs(obs_a, method = fill_method)
  ok    <- !is.na(obs_a[[paste0("run_", sprintf(paste0("%0", PAD_WIDTH, "d"), 1))]])

  list(
    sim = dplyr::distinct(sim_a[ok, ], date, .keep_all = TRUE),
    obs = dplyr::distinct(obs_a[ok, ], date, .keep_all = TRUE)
  )
}


# ---- FDC helpers -------------------------------------------------------------
prep_for_fdc <- function(x) {
  dplyr::select(x, date, tidyselect::starts_with("run_")) |>
    dplyr::distinct(date, .keep_all = TRUE)
}

safe_fdc_rsr <- function(fdc_sim, fdc_obs) {
  out <- try(SWATtunR::calc_fdc_rsr(
    fdc_sim = fdc_sim, fdc_obs = fdc_obs,
    quantile_splits = c(5, 20, 70, 95)
  ), silent = TRUE)
  if (inherits(out, "try-error")) NULL else out
}

# ---- Rank-normalize [0,1] ----------------------------------------------------
rn <- function(x, invert = FALSE) {
  n <- sum(!is.na(x)); if (n <= 1) return(rep(NA_real_, length(x)))
  s <- (rank(x, na.last = "keep", ties.method = "average") - 1) / (n - 1)
  if (invert) 1 - s else s
}

# ---- Gauge key chooser -------------------------------------------------------
choose_gauge_key <- function(sel, keys) {
  if (length(keys) == 0) stop("No gauges available")
  if (is.numeric(sel)) {
    if (sel < 1 || sel > length(keys)) stop("Index out of range")
    return(keys[sel])
  }
  s <- tolower(trimws(as.character(sel)))
  if (s %in% as.character(seq_along(keys))) return(keys[as.integer(s)])
  hit <- match(s, tolower(keys))
  if (is.na(hit)) stop("Unknown gauge: ", sel)
  keys[hit]
}
