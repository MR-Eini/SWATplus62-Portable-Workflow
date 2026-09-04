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

# Load functions and packages -------------------------------------------------------
source('./functions_write_SWATfarmR_input.R')

foo1(c("sf", "lubridate", "dplyr", "readr", "purrr", "stringr", "data.table", "reshape2"))


# Read input data ----------------------------------------------------------------

## Read land-use crop map shapefile and drop geometry
# lu <- st_drop_geometry(read_sf(lu_shp))

## Read land-use crop csv 
lu <- read_csv(lu_csv)

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
