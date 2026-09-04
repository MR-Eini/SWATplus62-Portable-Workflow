# -------------------------------------------------------------------------
# Step 4: Analyze simulation results
# -------------------------------------------------------------------------

# Load required R packages ------------------------------------------------
library(lubridate)
library(SWATtunR)
library(hydroGOF)
library(tidyverse)

# Parameter definition ----------------------------------------------------
# Paths to simulation and observation data
# E.g. load the simulations with the last time stamp, if default
# save_file names in simulation runs is used.
sims <- list.files('./simulation/', pattern = '[0-9]{12}')
sim_path <- paste0('./simulation/', sims[length(sims)])

# E.g. path to discharge observations
flow_path <- './observation/q_cha5_cms.csv'

# E.g. path to in-stream nitrate observations
# ntot_path <- './observation/TN_cha5.csv'
# ptot_path <- './observation/TP_cha5.csv'
# no3n_path <- './observation/no3n_cha5.csv'
# sused_path <- './observation/suspended_sediment_cha5.csv'

# Define time period to analyze (E.g. calibration or validation period)
# Periods for different variables can be different, but calibration and
# validation should not be mixed.
# Discharge
period_q <- c('2007-01-01', '2023-12-31')
# Water quality
# period_wq <- c('2007-01-01', '2023-12-31')

# -------------------------------------------------------------------------
# Load and prepare simulation results -------------------------------------
# -------------------------------------------------------------------------
sim <- load_swat_run(sim_path)

# Extract parameter set (for dotty/identifiability plots)
par_vals <- sim$parameter$values

# Extract relevant output variables
flow_sim <- filter_period(sim$simulation$flo_day, period_q)

# N components (typical SWAT+ reach daily loads in kg/day)
# no3_sim  <- filter_period(sim$simulation$no3_day,  period_wq)
# nh3_sim  <- filter_period(sim$simulation$nh3_day,  period_wq)
# no2_sim  <- filter_period(sim$simulation$no2_day,  period_wq)
# orgn_sim <- filter_period(sim$simulation$orgn_day, period_wq)

# P components (typical SWAT+ reach daily loads in kg/day)
# solp_sim <- filter_period(sim$simulation$solp_day, period_wq)
# sedp_sim <- filter_period(sim$simulation$sedp_day, period_wq)


# # Suspended sediment (typical SWAT+ reach daily load in tons/day)
# sed_sim <- filter_period(sim$simulation$sed_day, period_wq)

# Flow duration curves (optional, discharge only)
flow_fdc_sim <- calc_fdc(flow_sim)

# # Total N (load)
# ntot_sim <- sum_variables(no3_sim, nh3_sim, no2_sim, orgn_sim)
# 
# # Total P (load): solp + sedp (+ orgp if present)
# ptot_sim <- sum_variables(solp_sim, sedp_sim)
# 
# 
# # Convert simulated loads to concentrations for plotting/comparison
# ntot_conc_sim <- load_to_conc(
#   load = ntot_sim, flow = flow_sim,
#   load_unit = "kg day-1", flow_unit = "m3 s-1", out_unit = "mg L-1"
# )
# 
# ptot_conc_sim <- load_to_conc(
#   load = ptot_sim, flow = flow_sim,
#   load_unit = "kg day-1", flow_unit = "m3 s-1", out_unit = "mg L-1"
# )
# 
# sed_conc_sim <- load_to_conc(
#   load = sed_sim, flow = flow_sim,
#   load_unit = "tons day-1", flow_unit = "m3 s-1", out_unit = "mg L-1"
# )


# -------------------------------------------------------------------------
# Load and prepare observations -------------------------------------------
# -------------------------------------------------------------------------

# Flow observations
flow_obs <- read_csv(flow_path, show_col_types = FALSE) %>%
  rename_with(tolower) %>%
  mutate(date = mdy(date)) %>%
  filter_period(period_q)

# # Ntot concentration observations
# ntot_conc_obs <- read_csv(ntot_path, show_col_types = FALSE) %>%
#   rename_with(tolower) %>%
#   mutate(date = mdy(date)) %>%
#   filter_period(period_q)   # or period_wq if you use a separate WQ period
# 
# # Ptot concentration observations
# ptot_conc_obs <- read_csv(ptot_path, show_col_types = FALSE) %>%
#   rename_with(tolower) %>%
#   mutate(date = mdy(date)) %>%
#   filter_period(period_q)
# 
# # Suspended sediment concentration observations
# sused_conc_obs <- read_csv(sused_path, show_col_types = FALSE) %>%
#   rename_with(tolower) %>%
#   mutate(date = mdy(date)) %>%
#   filter_period(period_q)

# E.g. if FDC segments should be evaluated, calculate the
# FDC for the simulated discharges
flow_fdc_obs <- calc_fdc(flow_obs)

# E.g. if calibration should be done with loads and not concentrations
# convert observed concentrations to loads
# Convert observed concentrations to loads for GOF against simulated loads

# ntot_obs <- conc_to_load(
#   conc = ntot_conc_obs, flow = flow_obs,
#   conc_unit = "mg L-1", flow_unit = "m3 s-1", out_unit = "kg day-1"
# )
# 
# ptot_obs <- conc_to_load(
#   conc = ptot_conc_obs, flow = flow_obs,
#   conc_unit = "mg L-1", flow_unit = "m3 s-1", out_unit = "kg day-1"
# )
# 
# sed_obs <- conc_to_load(
#   conc = sed_conc_obs, flow = flow_obs,
#   conc_unit = "mg L-1", flow_unit = "m3 s-1", out_unit = "tons day-1"
# )

# -------------------------------------------------------------------------
# Calculate goodness-of-fit values ----------------------------------------
# -------------------------------------------------------------------------

# Discharge GOF
gof_flow <- calc_gof(
  sim = flow_sim, obs = flow_obs,
  funs = list(nse_q = NSE, kge_q = KGE, pb_q = pbias, mae_q = mae)
)

# FDC RSR segments for discharge (Pfannerstill et al., 2014)
gof_fdc <- calc_fdc_rsr(
  fdc_sim = flow_fdc_sim, fdc_obs = flow_fdc_obs,
  quantile_splits = c(5, 20, 70, 95)
)

# # Total N GOF (loads)
# gof_ntot <- calc_gof(
#   sim = ntot_sim, obs = ntot_conc_obs,
#   funs = list(nse_n = NSE, kge_n = KGE, pb_n = pbias, mae_n = mae)
# )
# 
# # Total P GOF (loads)  <-- added
# gof_ptot <- calc_gof(
#   sim = ptot_sim, obs = ptot_conc_obs,
#   funs = list(nse_p = NSE, kge_p = KGE, pb_p = pbias, mae_p = mae)
# )
# 
# # Suspended sediment GOF (loads)  <-- added
# gof_sed <- calc_gof(
#   sim = sed_sim, obs = sused_conc_obs,
#   funs = list(nse_sed = NSE, kge_sed = KGE, pb_sed = pbias, mae_sed = mae)
# )

# Join all GOF tables (load-based) ----------------------------------------
gof_all <- list(gof_flow) %>% #, gof_fdc, gof_ntot, gof_ptot, gof_sed) %>%
  reduce(left_join, by = "run")

# Select a subset of GOF indices for visual diagnostics -------------------
gof_sel <- gof_all %>%
  select(
    run,
    nse_q, kge_q, pb_q
    #nse_n, kge_n, pb_n,
    #nse_p, kge_p, pb_p,
    #nse_sed, kge_sed, pb_sed
  )

summary(gof_sel)

plot_parameter_identifiability(
  parameters  = par_vals,
  objectives  = gof_sel,
  run_fraction = 0.2
)

# Dotty plot example (choose any GOF metric)
# dotty plot for discharge KGE
SWATtunR::plot_dotty(
  par     = par_vals,
  var     = dplyr::pull(gof_all, kge_q),
  y_label = "KGE (Q)",
  n_col   = 10
)

# # multi-objective dotty: one row per objective
# SWATtunR::plot_dotty(
#   par = par_vals,
#   var = list(
#     dplyr::pull(gof_all, kge_q),     # discharge
#     dplyr::pull(gof_all, kge_n),     # total N (load or conc, depending how you built gof_all)
#     dplyr::pull(gof_all, kge_p),     # total P
#     dplyr::pull(gof_all, kge_sed)    # suspended sediment
#   ),
#   y_label = c(
#     "Discharge KGE (m3/s)",
#     "Total N KGE",
#     "Total P KGE",
#     "Sediment KGE"
#   ),
#   trend = TRUE,
#   n_col = 3
# )


# -------------------------------------------------------------------------
# View simulated vs observed time series ----------------------------------
# -------------------------------------------------------------------------

# Discharge
view_timeseries(
  sim         = flow_sim,
  obs         = flow_obs,
  run_ids     = run_ids,
  plot_bands  = TRUE,
  period      = NULL,
  fn_summarize= "mean",
  x_label     = "Date",
  y_label     = "Discharge (m<sup>3</sup> s<sup>-1</sup>)"
)

# --- Water quality (CONCENTRATIONS: mg/L) ---
# Total N concentration
view_timeseries(
  sim         = ntot_conc_sim,
  obs         = ntot_conc_obs,
  run_ids     = run_ids,
  plot_bands  = TRUE,
  period      = NULL,
  fn_summarize= "mean",
  x_label     = "Date",
  y_label     = "Total N (mg L<sup>-1</sup>)"
)

# # Total P concentration
# view_timeseries(
#   sim         = ptot_conc_sim,
#   obs         = ptot_conc_obs,
#   run_ids     = run_ids,
#   plot_bands  = TRUE,
#   period      = NULL,
#   fn_summarize= "mean",
#   x_label     = "Date",
#   y_label     = "Total P (mg L<sup>-1</sup>)"
# )
# 
# # Suspended sediment concentration
# view_timeseries(
#   sim         = sed_conc_sim,
#   obs         = sused_conc_obs,   # or: sused_conc_obs (use your object name)
#   run_ids     = run_ids,
#   plot_bands  = TRUE,
#   period      = NULL,
#   fn_summarize= "mean",
#   x_label     = "Date",
#   y_label     = "Suspended sediment (mg L<sup>-1</sup>)"
# )

# -------------------------------------------------------------------------
# Selection of parameter sets ---------------------------------------------
# -------------------------------------------------------------------------

# # Example 1) Rank runs using normalized ranks (higher is better after adjustment)
# gof_adj <- gof_sel %>%
#   mutate(
#     # make "better" => smaller for rank_gof (it ranks from smallest to largest)
#     nse_q   = -nse_q,
#     kge_q   = -kge_q,
#     pb_q    = -abs(pb_q),
#     
#     nse_n   = -nse_n,
#     kge_n   = -kge_n,
#     pb_n    = -abs(pb_n),
#     
#     nse_p   = -nse_p,
#     kge_p   = -kge_p,
#     pb_p    = -abs(pb_p),
#     
#     nse_sed = -nse_sed,
#     kge_sed = -kge_sed,
#     pb_sed  = -abs(pb_sed)
#   )
# 
# gof_rank <- rank_gof(gof_adj, type = "norm")
# run_sel  <- gof_rank$run[1:10]
# run_ids  <- run_to_id(run_sel)

# The second approach is to select parameter combinations based on threshold
# values for GOF indices. Here e.g. for NSE and pbias for discharge and N loads.
run_sel <- which(gof_sel$nse_q > 0.4 & gof_sel$kge_q > 0.7 &
                   abs(gof_sel$pb_q) < 10)
run_ids <- run_to_id(run_sel)

# Another typical approach to analyze goodness-of-fit to parameter changes is
# to plot dotty plots. Here is just one example, to get a full picture of
# how to update parameter ranges the assessment of multiple dotty plots may
# be neccesary.
plot_dotty(par = par_vals, gof_flow$kge_q, n_col = 4, trend = TRUE, run_ids = run_ids)
plot_dotty(par = par_vals, gof_flow$nse_q, n_col = 4, trend = TRUE, run_ids = run_ids)
plot_dotty(par = par_vals, gof_flow$pb_q, n_col = 4,trend = TRUE, run_ids = run_ids)

#plot_dotty(par = par_vals, gof_ntot$kge_n, n_col = 4, trend = TRUE)
#plot_dotty(par = par_vals, gof_ntot$pb_n, n_col = 4)

# If the model performance must be improved and e.g. the parameter
# identifiability plot clearly suggests to update parameter ranges for relevant
# parameters it is recommended to go back to step 1, update the parameter
# boundaries, perform simulations for the new parameter combinations and again
# analyze them with this script.

# View simulated time series ----------------------------------------------
# The simulated time series should be plotted to analyze the strengths and
# weaknesses of the model simulations. SWATtunR offers some interactive
# plot view functions.
view_timeseries(flow_sim, flow_obs, run_ids = run_ids)
view_timeseries(flow_sim, flow_obs, run_ids = run_ids,period = 'month')
view_timeseries(flow_sim, flow_obs, run_ids = run_ids,period = 'average monthly')
#view_timeseries(ntot_conc_sim, ntot_conc_obs, run_ids = c(659))


#pcp_file_path <- ""../../1_Setup/Temp/clean_setup/sta_id1.pcp"
#flow_data <- flow_obs
#colnames(flow_data) <- c('date','discharge')
#plot_pcp_vs_flow(pcp_file_path, flow_data)
-----------------------------------------
# One-At-A-Time Sensitivity Analysis
# Example of usage:
# If you want to perform an OAT analysis
# Select the parameter combination around which you want to do the OAT analysis
par_center_id <- run_ids[1]

# Extract the center parameter set and assign again the "full" names to be used
# with SWATrunR
par_center <- sim$parameter$values[par_center_id, ] %>% 
  set_names(sim$parameter$definition$full_name)

# You can define your own parameter boundaries for the selected parameters
# Here a way how you can quickly extract the boundaries from the last simulation
par_bnd <- sim$parameter$values %>% 
  map(., ~ c(min(.x), max(.x))) %>% 
  map(., ~ round(.x, 3)) %>% 
  bind_cols(.) %>% 
  set_names(sim$parameter$definition$full_name)

# Sample the OAT parameter set and run the simulations
par_oat <- sample_oat(par = par_bnd, par_center = par_center)

par_oat <- filter(par_oat, parameter %in% c('center', 'perco.hru | change = absval'))

sim_oat <- run_swatplus(project_path = model_path,
                        output = list(
                          flo_day = define_output(file = 'channel_sd_day',
                                                  variable = 'flo_out',
                                                  unit = cha_ids)),
                        parameter = par_oat[,3:ncol(par_oat)],
                        start_date       = start_date,
                        end_date         = end_date,
                        start_date_print = start_date_print,
                        n_thread = n_cores)
# save_file = 'sim_oat')

# To visualize the OAT runs e.g. for the parameter surlag:
plot_oat(sim = sim_oat, obs = flow_obs, variable = 'flo_day')


# ## Add parameter change definitions to the parameter change data frame
# colnames(par_vals) <- sim$parameter$definition$full_name
# 
# ## Write multiple or a single 'calibration.cal' file
# write_cal_file(par = par_vals,
#                model_path = model_path,
#                write_path = './',
#                i_run = c(1, 2, 5)) ## For single i_run = 1
