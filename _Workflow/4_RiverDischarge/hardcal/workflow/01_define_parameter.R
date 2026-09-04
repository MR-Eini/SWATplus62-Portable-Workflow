# -------------------------------------------------------------------------
# Step 1: Define the parameter set which is used in the SWAT simulations
#
# This is a template and must be adjusted to the individual SWAT project.
#
# The template includes a routine to account for the different initial
# parameter values of perco, cn3_swf, and latq_co in a SWAT+ model setup.
# If you prefer to use only one global value for those parameters remove
# the lines 83 and following from this script and adjust the parameter
# values of those 3 parameters in the parameter_boundaries table.
# -------------------------------------------------------------------------

# Load required R packages ------------------------------------------------
library(SWATtunR)
library(SWATrunR)
library(tibble)

# Parameter definition ----------------------------------------------------
# Number parameter combinations
n_combinations <- 200
run_ids <- seq_len(n_combinations)

# Path to the SWAT+ project folder.
model_path <- "../../1_Setup/Temp/clean_setup"


# Define parameter boundaries ---------------------------------------------
# Suggested list and ranges of SWAT+ parameters for the calibration of
# different output variables.
# Parameters are roughly divided into groups by processes which they affect most.
# Some groups should be considered optional.
parameter_boundaries <- tibble::tibble(
  # snow (optional - use if average snow fall to precipitation ratio is
  # higher than 5%)
  'snomelt_tmp.hru | change = absval' = c(0, 2),
  #'snofall_tmp.hru | change = absval' = c(0, 2),
  # ET (note: it is suggested that a narrow range for esco selected in soft
  # calibration of water balance is used instead of the wide (0,1) range)
  'esco.hru | change = absval' = c(0.05, 0.5),
  #'epco.hru | change = absval' = c(0.05, 1),
  #'awc.sol | change = relchg' = c(-0.25, -0.1),
  #surface runoff
  'cn2.hru | change = relchg' = c(0.05, 0.2),
  #'cn3_swf.hru | change = absval' = c(0.5, 0.8), # Normalized range. Will be updated below
  'surlag.bsn | change = absval' = c(0.3, 0.8),
  # lateral flow (optional - use if lateral flow constitutes at least 5% of
  # total water yield)
  #'lat_len.hru | change = abschg' = c(0, 25),
  'latq_co.hru | change = absval' = c(0.3, 1), # Normalized range. Will be updated below
  'bd.sol | change = relchg' = c(-0.25, -0.1),
  #'k.sol | change = relchg' = c(0.5, 1),
  # percolation/aquifer
  'perco.hru | change = absval' = c(0.65, 0.85), # Normalized range. Will be updated below
  'flo_min.aqu | change = abschg' = c(1, 3),
  #'revap_co.aqu | change = absval' = c(0.02, 0.06),
  #'revap_min.aqu | change = abschg' = c(-3, 0),
  'alpha.aqu | change = absval' = c(0.001, 0.002),
  #'tile_dep.hru | change = relchg' = c(0, 0.3),
  #'tile_lag.hru | change = absval' = c(10, 50),
  #'tile_dtime.hru | change = absval' = c(50, 100),
  #'chn.rte | change = absval' = c(0.02, 0.1),
  #'chs.rte | change = relchg' = c(-0.2, 0.2),
  'sp_yld.aqu | change = absval' = c(0.025, 0.05),
  #'bf_max.aqu | change = absval' = c(1.5, 2),
  # nitrogen parameters from here
  #"n_updis.bsn | change = absval" = c(10, 80),
  #"no3_init.aqu | change = absval" = c(0, 30),
  #"nperco.bsn | change = absval" = c(0, 1),
  #"sdnco.bsn | change = absval" = c(0.8, 1.1),
  #"hlife_n.aqu | change = absval" = c(0, 200),
  #"cmn.bsn | change = absval" = c(0.0001, 0.001),
  #"cov.rte | change = relchg" = c(-0.5, 0.1),
  #"ch_clay.rte | change = absval" = c(10, 90),
  #"bedldcoef.rte | change = absval" = c(0, 0.1),
  #"cherod.rte | change = relchg" = c(-0.3, 0),
  #"phoskd.bsn | change = absval" = c(20, 200),
  #"psp.bsn | change = absval" = c(0, 0.1)
)
# Sample parameter combinations -------------------------------------------
parameter_set <- sample_lhs(parameter_boundaries, n_combinations)

# Apply different ranges to cn3_swf, latq_co, and perco ------------------
# This step is optional and should be removed if you do not want to consider
# different parameter ranges to the different intial values of the three
# parameters cn3_swf, latq_co, and perco.
# By default different initial values are assigned to these three parameters
# during model setup (the initial values are based on the runoff and leaching
# potentials of the respective HRUs). In order not to loose this spatial
# information in the parameters the calibration of those parameters should
# be done with different ranges applied for the different initial values
# of a parameter.
# The following routine accounts for that and generates multiple parameter
# columns from one parameter column which was sampled above. Take care that
# the parameter was sampled in the range 0 to 1 above to be translated into
# the different ranges below. Range can also be smaller if e.g. range was
# narrowed down in the calibration process.

# Separate the HRUs of the SWAT+ model setup into groups based on their initial
# values of e.g. perco, cn3_swf, and latq_co
#perco_groups <- group_hydr_values('perco',   model_path)
#cn3_groups   <- group_hydr_values('cn3_swf', model_path)
#latq_groups  <- group_hydr_values('latq_co', model_path)

# Define parameter boundaries in which the parameter values should vary for
# the different initial values.
# The list can be a named list, the names defined here will be added to the
# parameter names for differentiation. If unnamed the indexes _1, _2, and _3
# will be added to the parameter names instead.
#
# Only provide the same numbers of ranges as numbers of individual parameters
# identified in the lines 105 to 107. Otherwise an error will occur in the
# following routine.
#perco_bound <- list(low = c(0.05, 0.30), mod = c(0.30, 0.60), high = c(0.50, 0.95))
#cn3_bound   <- list(low = c(0.00, 0.30), mod = c(0.15, 0.45), high = c(0.50, 0.95))
#latq_bound  <- list(low = c(0.01, 0.30), mod = c(0.10, 0.40), high = c(0.50, 0.90))

# Add the additional parameter columns to the parameter table and remove the
# column with the respective normalized parameter values.

# parameter_set <- translate_to_boundaries(par_tbl = parameter_set,
#                                          par_name = 'perco.hru | change = absval',
#                                          par_bound = perco_bound,
#                                          par_group = perco_groups)

#parameter_set <- translate_to_boundaries(par_tbl = parameter_set,
#                                         par_name = 'cn3_swf.hru | change = absval',
#                                         par_bound = cn3_bound,
#                                         par_group = cn3_groups)

#parameter_set <- translate_to_boundaries(par_tbl = parameter_set,
#                                         par_name = 'latq_co.hru | change = absval',
#                                         par_bound = latq_bound,
#                                         par_group = latq_groups)


