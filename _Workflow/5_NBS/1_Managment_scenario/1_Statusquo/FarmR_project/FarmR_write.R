############# Script to write the SWATfarmR input file
##
## required inputs in folder input_data:
##           (1) Land use map with crop information
##                 ... The map must contain the land use of each hru. In case of cropland, the names must be unique
##                 ... for each field (e.g., 'field_1', 'field_2', etc.)
##                 ... The map must also contain crop infos for the period 1988 to 2020 (or 2021 if crop info available)
##                 ... this requires an extrapolation of the available crop sequences (the sequences
##                 ... derived from remote-sensing based crop classification or local data).
##                 ... The extrapolated crop sequence for 33 years will be also used for running climate scenarios
##                 ... and must not contain any gaps. That means, gaps have to be closed manually!
##                 ... The year columns must be named y_1988, y_1989, etc.
##                 ... The crop infos for each year must match the crop_mgt names in the
##                 ... management operation schedules (provided in a .csv file, see below).
##                 ... An example land use map is provided in folder input_data.
##                 ... Replace it with your land use map (see also section 4.1 of the modelling protocol).
##           (2) Management operation schedules for each crop (or, if available, crop-management type)
##                 ... All schedules must be compiled in one csv file (see example in demo data and
##                 ... study also section 4.2 of the modelling protocol).
##                 ... 'crop_mgt' must start with the 4-character SWAT crop names (any further management specification is optional).
##                 ... Each schedule must contain a 'skip' line to indicate the change of years.
##                 ... The 'skip' line should never be the last line of a schedule.
##                 ... An example table is provided in folder input_data. Replace it with your own table.
##           (3) Management operation schedules for generic land-use classes (usually all non-cropland classes with vegetation cover).
##                 ... here, all schedules must be provided already in the SWATfarmR input format.
##                 ... An example table is provided in folder input_data. Replace it with your own table.
##
#######################################################################################
# Installation -----------------------------------------------------
# Check if dependencies are installed and install otherwise.
#pkg_depend <- c('dplyr', 'lubridate', 'purrr', 'R6', 'readr', 'rlang', 'stringr', 'tibble', 'tidyselect')
#is_installed <- pkg_depend %in% rownames(installed.packages())
#install.packages(pkg_depend[!is_installed])
# Maybe not necessary but update installed package dependencies
#update.packages(oldPkgs = pkg_depend[is_installed])

# Install SWATfarmR from tar file
#install.packages("Your/path/to/SWATfarmR_1.4.2.tar.gz", repos = NULL, type = "source")

# If the package 'remotes' is not installed run first:
#install.packages("remotes")

#remotes::install_github("chrisschuerz/SWATfarmR", force = TRUE)

# Load functions and packages -------------------------------------------------------
library(SWATfarmR)
library(tidyverse)
library(zoo)
source('./functions_write_SWATfarmR_input.R')
foo1(c("sf", "lubridate", "dplyr", "readr", "purrr", "stringr", "data.table", "reshape2"))



# Define input files-----------------------------------------------------------------

lu_R <- read_csv("./input/crops1.csv")

mgt_csv <- './input/mgt_crops.csv' # crop management .csv table

lu_generic_csv <- './input/mgt_generic.csv' # generic land use management .csv table

# Define variables-------------------------------------------------------------------

## Simulation period
start_y <- 2004 #starting year (consider at least 3 years for warm-up!)
end_y <- 2023 #ending year

## Prefix of cropland hrus (all names of hrus with a crop rotation must begin
## with this prefix in column 'lu' of your land use map)
hru_crops <- 'agrl'

## Multi-year farmland grass
## Did you define any multi-year farmland grass schedules? 'y' (yes), 'n' (no)
m_yr_sch_existing <- 'n'

## If yes, define also the following variables. If not, skip next four lines
crop_myr <- 'akgs' # prefix of multi-year schedules in management file
# multiple entries should have the same number of characters, e.g.: crop_myr <- c('akgs', 'bsvg')
max_yr <- 5 # maximum number of years farmland grass can grow before it is killed (should be <8)
## Do your multi-year farmland grass schedules consider the type of the following crop (summer or winter crop)?
## (e.g., a '_1.5yr' schedule with a kill op in spring allows for planting a summer crop immediately afterwards)
## If yes, you must define your summer crops
crop_s <- c('sgbt','corn','barl')
## Do your summer crop schedules usually start with an operation in autumn (e.g. tillage)?
## To combine them with farmland grass, it is necessary that you provide 'half-year-schedules'
## ('half-year-schedules' are additional summer crop schedules without operations in autumn)
## The adapted schedules should be added to the crop management table with suffix '_0.5yr' (e.g. 'csil_0.5yr')
## If additional 'half-year-schedules' are not needed, because your normal summer crop schedules
## do not start in autumn, type 'n'
additional_h_yr_sch_existing <- 'n' # 'y' (yes), 'n' (no)

# Read input data ----------------------------------------------------------------

## Read land-use crop map shapefile and drop geometry
#lu <- st_drop_geometry(read_sf(lu_shp))

## Read land-use csv file
lu <- lu_R

## Read crop management .csv table
## Make sure it includes all crops of your lu map
mgt_crop <- read.csv(mgt_csv, as.is=T)

## Read generic land use management .csv table
## Make sure it includes all non-cropland classes with a vegetation cover
mgt_generic <- read.csv(lu_generic_csv, as.is=T)

# Check for correct positioning of 'skip' line ------------------------------------
check_skip <- check_skip_position()

# Check for date conflicts within single crop schedules -------------------------------
check_date_conflicts1()

# Build schedules for crop sequences ----------------------------------------------
rota_schedules <- build_rotation_schedules()

# Check for date conflicts in combined (rotation) schedule --------------------------
check_date_conflicts2()

# Solve minor date conflicts (where only a few days/weeks are overlapping)---------
rota_schedules <- solve_date_conflicts()

## check again for date conflicts -------------------------------------------------
check_date_conflicts2()

## write the SWAT farmR input table -----------------------------------------------
write_farmR_input()



#---------------------------------------------------
# Define the path to your SWAT project
# pth <- "../../../../1_Setup/Temp/clean_setup"
pth <- './clean_setup'

# Define the path to your management schedule csv
mgt <- 'farmR_input.csv'

#load_farmr(paste(pth, 'statusquo.farm', sep = '/'))

# Create a new farmR project. The new farmR will have the name 'farmR_ilm' in
# your R environment in this case. You can give it an individual name.
#statusquo.farm$reset_files()

new_farmr('statusquo', pth)

# Interpolate NA's in pcp data (if you have any)
statusquo$.data$variables$pcp[-1] <- na.approx(statusquo$.data$variables$pcp[-1])

# You can use by default the variables pcp, tmn, tmx, and tav, for dynamic
# rules in your management schedule. But you can also calculate and use new
# ones. You can also see in the example csv file how I used the variable
# in the dynamic rules. In this case I calculated the antecedent precipi-
# tation as a proxy for soil moisture using an exponential decay function
# (included in the R package). I used the pcp from the SWAT project for
# that which is stored in the farmR project.
api <- variable_decay(statusquo$.data$variables$pcp, -5,0.8)

# To add the variable to the farmR you have to tell it which variables are
# assigned to which HRUs for that I just copied the connections of pcp to
# HRUs and use the same for api
asgn <- select(statusquo$.data$meta$hru_var_connect, hru, pcp)

# You can add a variable to the farmR project with the internal function
# .$add_variable
statusquo$add_variable(api, "api", asgn, overwrite = T)

# Read your management table into your farmR project with .$read_management
statusquo$read_management(mgt, discard_schedule = TRUE)

# Study your management inputs
sched <- statusquo$.data$management$schedule
unique(sched$op_data1)
hru_attributes <- statusquo$.data$meta$hru_attributes


# You can now schedule operations which are based on your variables (pcp, etc.)
# and the rules that you defined in your management table. If no dates are
# defined the entire time series of your variables is used.
#farmR_ilm$schedule_operations(start_year = 2003, end_year = 2014, n_schedule=1) #n_schedule=1, => für jede landuse pro routing unit nur einen schedule in management.sch schreiben und für andere dann übernehmen)
statusquo$schedule_operations(start_year = start_y, end_year = end_y, replace = 'all')


# When the scheduling was successful you can write the schedules into your
# SWAT project txt input files. Again you can do this for any time period.
# E.g. your calibration period and in another run for your validation period.
# When writing the schedules the simulation period of the model is changed
# accordingly, so that your schedules always match the weather time series.
# So do not change your simulation period manually. Then the simulated
# years will not match the calculated schedules.
statusquo$write_operations(start_year = start_y, end_year = end_y)

# Update land use labels (should not be longer than 24 characters)
library(SWATdoctR)
update_landuse_labels(pth)

# Reset files (required for rerunning the farmR)
#statusquo$reset_files()







