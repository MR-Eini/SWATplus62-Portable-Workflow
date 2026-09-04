# -------------------------------------------------------------------------
# Step 3: Performing SWAT simulation runs
# -------------------------------------------------------------------------

# Start date of simulation period
start_date <- '2004-01-01'
# End date of simulation period
end_date <- '2015-12-31'
# Start date for printing simulation outputs
start_date_print <- '2007-01-01'

# Number of cores used for parallel simulation runs
n_cores <- 20

# Name of the folder where simulation results will be saved incrementally.
# To continue writing to existing saved runs, replace by the name of the
# existing save_file.
save_file_name <- paste0(format(Sys.time(), '%Y%m%d%H%M'), '_sim')

# Path where the simulation results are saved.
# Default the simulations are saved in the calibration project
# in the sub-folder /simulation
save_path <- './simulation'

# Perform simulation runs
run_swatplus(project_path     = model_path,
             output           = outputs,
             parameter        = parameter_set,
             start_date       = start_date,
             end_date         = end_date,
             start_date_print = start_date_print,
             n_thread         = n_cores,
             save_path        = save_path,
             save_file        = save_file_name,
             return_output    = FALSE,
             split_units      = FALSE, # better set TRUE for large number of units
             time_out         = 3600 # seconds, change if run-time differs
             )
