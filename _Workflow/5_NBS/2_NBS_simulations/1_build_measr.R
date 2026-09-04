# Load and install SWATmeasR ----------------------------------------------
#remotes::install_github("chrisschuerz/SWATfarmR")
#remotes::install_git('https://git.ufz.de/schuerz/SWATmeasR', ref='fix_prepare_management')

source('../../swat62.R')
swat62_require(c('SWATmeasR', 'SWATfarmR'))
library(SWATmeasR)

# Project and NSWRM paths -------------------------------------------------
# Project path of the SWAT+ project for which the measR project should be set up
# project_path <- "../../1_Setup/Temp/clean_setup"
project_path <- './txt'

# Path where all NSWRM definition input files are organized
nswrm_def_path <- './nswrm_definition/'

# Prepare management inputs  ----------------------------------------------
# The defninition of managment releated NSWRMs requires to prepare a
# R data object which provides all scenarios in a list structure.
# To prepare the data all SWATfarmR projects which provide the management
# for management related NSWRMs must be available in the SWAT+ project folder.
# Be careful with other SWATfarmR projects which are not the status quo case
# or one of the scenarios. If these are included and do not fit the status quo
# this can trigger an error. But you can also specifically define the scenario
# farmR projects (as done below).

# The name of the status quo farmR project must be defined.
stat_quo_farmR <- 'statusquo'

# You can also specifically define the scenario farmR projects. If not all
# farmR projects in the project folder will be considered.
# The scenario farmR projects in the SWAT+ project folder must have the same
# name as the scenario is then called in the NSWRMs. Be careful to rename
# the .farm AND the .mgts objects in the project folder.
scenario_farmR <- c('covcrop', 'rotation')

# The management preparation routine adjusts the dates of operations in the
# scenarios which are the same as in the status quo but were assigned different
# dates due to the random sampling in SWATfarmR. But only operations which are
# newly introduced in the scenarios should have different dates.
#
# If operations in the status quo and the scenarios should be treated as the
# same (so they are the same operation type), but they have different op_data1
# you can define synonyms, so that e.g. tillage operations with different
# tillage types are still treated as the same operation and the dates will be
# corrected in the scenario.
# syns <- tibble::tibble(status_quo = c('cultiv25', 'cultiv20'),
#                        scenario   = c('fldcul12', 'fldcul12'))

# If start and end year are not already adjusted in the project folder you can
# do that now for the status quo and all scenarios to ensure that all
# managements cover the same time period.
start_year <- NULL # Optional, set value if needed
end_year <- NULL # Optional, set value if needed

# The following function might give an error if you have more than one land use
# class without management schedules
# solution 1: define mgt operations for those classes and run farmr again
# solution 2: re-install the farmr using remotes::install_github("chrisschuerz/SWATfarmR/tree/dev_ms") and run farmr again
prepare_management_scenario_inputs(project_path = project_path,
                                   status_quo   = stat_quo_farmR,
                                   scenarios    = scenario_farmR,
                                   #synonyms = syns,
                                   start_year = start_year,
                                   end_year = end_year,
# By default the function would write into the project folder. I set it here
# to write the prepared management object into the folder where all
# NSWRM definitions are stored.
                                   write_path = nswrm_def_path,
# write_csv_mgts additionally writes all management tables with corrected dates
# and the status quo into write path. These csv files can be useful to check
# the updated management tables in comparison to the status quo e.g. in Notepad++
                                   write_csv_mgts = TRUE)

# The prepared management files are always saved with a time stamp in the file
# name. This routine identifies the most recent one which is then used as
# input in the NSWRM definition.
# Define the file name manually if another file should be used.
mgt_def_files <- list.files(nswrm_def_path, pattern = '.rds')
time_stamps <- as.numeric(gsub('_', '', substr(mgt_def_files, 1, 13)))
last_mgt <- which.max(time_stamps)
mgt_path  <- paste0(nswrm_def_path, '/', mgt_def_files[last_mgt])

# Start a new measR project -----------------------------------------------
# Define the name of the project
project_name <- 'demo_nbs'
# Start a new project
# The project loads all relevant SWAT+ input files and generates a .measr file
# in the project folder where all steps are saved for later reloading.
new_measr(project_name = project_name, project_path = project_path)

# Define all NSWRMs in the project ----------------------------------------
# All NSWRMs which should be implemented in the SWAT+ project must be defined
# At the moment only land_use and management related measures and ponds were
# implemented.

# Paths to the definition csv files for land_use related measures and ponds
luse_path <- paste0(nswrm_def_path, '/', 'settings_land_use.csv')
pond_path <- paste0(nswrm_def_path, '/', 'settings_pond.csv')
#wetl_path <- paste0(nswrm_def_path, '/', 'settings_wetland.csv')

# Load the measure definitions
#demo_nbs$reload_swat_inputs()
demo_nbs$load_nswrm_definition(luse_path, 'land_use', overwrite = T)
demo_nbs$load_nswrm_definition(pond_path, 'pond', overwrite = T)
#demo_nbs$load_nswrm_definition(wetl_path, 'wetland', overwrite = T)
demo_nbs$load_nswrm_definition(mgt_path,  'management')

# Load the measure locations ----------------------------------------------
# The locations of NSWRMs can only be loaded if all measures which are defined
# in the locations file were already defined in the previous step.
# A measure location is always defined by the nswrm and object IDs which
# are affected by a change. See the csv file to learn how it must be organized.

# Path to the location file
loca_path <- paste0(nswrm_def_path, '/', 'measure_location.csv')

# Load the location definition
demo_nbs$load_nswrm_location(loca_path)

demo_nbs$.data$model_setup$original_inputs$file.cio$simulation[4] <- "object.prt"
demo_nbs$save()


# CONGRATS!!! Now you are ready to run measure scenarios 


# Loading an existing project ---------------------------------------------
#load_measr(paste0(project_path, '/', project_name, '.measr'))

# Resetting the project ---------------------------------------------------
# This way you can reset the project to the status quo. With write_files = TRUE
# not only the files in R are reset but also the input files in the project folder
#demo_nbs$reset(write_files = TRUE)





