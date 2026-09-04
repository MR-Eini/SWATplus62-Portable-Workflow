## Workflow for Setup Preparation ----------------------------------------------
## 
## Version 1.0.0
## Date: 2026-02-26
## Developers: Svajunas Plunge    svajunas_plunge@sggw.edu.pl
##             Christoph Schürz   christoph.schuerz@ufz.de
##             Micheal Strauch    michael.strauch@ufz.de
##             Mohammad Reza Eini mohammad_eini@sggw.edu.pl
##
## 
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## Please read before starting!!! The preparation of input data is not part of 
## this workflow and needs to be done externally. However, if you have already 
## prepared and tested the data using the scripts provided by the developer 
## team, you can proceed with this setup generation workflow. Its primary 
## objective is to regenerate the complete setup in (hopefully) a single run. 
## This could be crucial if you've updated the input data, discovered errors in
## the setup, and more. The workflow enables you to progress from pre-processed 
## data to a pre-calibrated model setup. Additionally, you can utilize other 
## workflows provided by the development team for soft and hard calibration/
## validation of the model, running scenarios, etc.

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 1) Initializing the workflow -----
## loading (or installing and loading) packages, functions and setting.
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 
## Loading settings and functions
source('settings.R')
source('functions.R')
source('../swat62.R')

## Load the package set pinned by the portable bundle launchers.
swat62_require()
invisible(lapply(c(names(swat62_versions),'DBI','RSQLite','dplyr','purrr','readr','sf','stringr','tibble','tidyr','whitebox','rstudioapi'),
                 library, character.only = TRUE))

## 2. Construct the path to the bin folder
# We go UP from '1_Setup' to 'Mini_setup_CREATE', then UP to 'Workshop_bundle', then DOWN into 'bin'
wbt_path <- file.path("..", "..", "bin", "WBT", "whitebox_tools.exe")

# Normalizing the path fixes slashes (forward vs backslash) for Windows
wbt_path <- normalizePath(wbt_path, mustWork = FALSE)

## 3. Initialize and Verify
message("Searching for Whitebox at: ", wbt_path)

if (file.exists(wbt_path) && file.info(wbt_path)$size >= 1024) {
  whitebox::wbt_init(exe_path = wbt_path)
  message("WhiteboxTools successfully initialized from portable bin.")
} else {
  stop("ERROR: Could not find WhiteboxTools at the expected location: ", wbt_path, 
       "\n Please ensure the 'WBT' folder is inside 'Workshop_bundle/bin/'.")
}
# ## If the directory exists, delete the results directory. (Please be careful!!!)
# if (file.exists(res_path)) unlink(res_path, recursive = TRUE)
# ## Creating results directory
# dir.create(res_path, recursive = TRUE)

if (file.exists(res_path)) {
  confirm <- rstudioapi::showQuestion(
    title   = "Confirm deletion",
    message = paste("Directory exists:\n", res_path, "\n\nDelete it?"),
    ok      = "Yes",
    cancel  = "No"
  )
  
  if (isTRUE(confirm)) {
    unlink(res_path, recursive = TRUE)
  } else {
    stop("Deletion cancelled by user.")
  }
}

dir.create(res_path, recursive = TRUE)

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 2) Running SWATbuildR'er -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 
## The SWATbuildR'er is a tool that generates a SWAT model setup based is provided
## in https://github.com/chrisschuerz/SWATbuildR. Workflow takes the functions
## from the Libraries/buildr_script folder.
##
## Please make sure SWATbuildR'er settings are provided in settings file
## and the data is prepared according to the instructions provided in the
## SWATbuildR'er documentation Docs/modeling-protocol.pdf Chapter 2.
##
## If you get topological errors in this step, please check Section 2.3 of the 
## modeling protocol and make sure that your data is prepared according to the 
## instructions provided there.

source(paste0(lib_path, '/buildr_script/swatbuildr.R'), chdir=TRUE)

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 3) Backing up prepared database -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

## Identifying path to the database
db_path <- list.files(path = res_path, pattern = paste0(project_name, ".sqlite"), 
                      recursive = TRUE, full.names = TRUE)
if(length(db_path)>1){
 stop(paste0("You have more than one database named ", 
             paste0(project_name, ".sqlite in you working directory. 
                    Please remove/rename or set path to db manually!!")))
} else if (length(db_path) == 0) {
  stop("No database found!")
} else {
  # Define destination path inside res_path
  dest_db_path <- file.path(res_path, paste0(project_name, ".sqlite"))
  # Copy database to res_path
  file.copy(db_path, dest_db_path, overwrite = TRUE)
  # Create zip in res_path
  zip(file.path(res_path, "db_backup.zip"), dest_db_path)
  # Delete the copied .sqlite file from res_path
  file.remove(dest_db_path)
}

## If you would like to select one database manualy you can use the following 
## lines to select it manually.
# db_path <- rstudioapi::selectFile(
#   caption = "Select the database file",
#   filter = "SQLite files (*.sqlite);;All files (*.*)",
#   existing = TRUE, 
#   path = res_path
# )

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 4) Adding weather data to model setup -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

## Description of functions and how data example was prepared is on this webpage
## https://biopsichas.github.io/SWATprepR/articles/weather.html

# template_path
# Character, the path to the *.xlsx file containing the data template.
# epsg_code (optional) Integer, EPSG code for station coordinates. 
# Default epsg_code = 4326, which stands for WGS 84 coordinate system.

# *.xlsx file should be prepared according to the template provided SWATprepR package. 
# met <- load_template(weather_path, 2180)

# If you have already prepared weather data, you can load it directly
met <- readRDS(weather_path)

## If you have gaps and missing data in your weather data, you can use the 
## interpolation function (very slow at this state) provided by SWATprepR package. 
## https://biopsichas.github.io/SWATprepR/articles/weather.html#interpolating

# The interpolation function interpolates weather data for a SWAT model and 
# saves results into nested list format. The function uses Inverse Distance 
# Weighting (IDW)  interpolation method to fill gaps in weather data. This 
# function uses  sp, gstat and raster packages for spatial operations. Please 
# make sure that these packages are installed before using this function.
# https://biopsichas.github.io/SWATprepR/reference/interpolate.html


## Calculating weather generator statistics
wgn <- prepare_wgn(met)

## Adding weather and atmospheric deposition data into setup
add_weather(db_path, met, wgn)

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 5) Adding small modification to model setup .sqlite database -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

## This is needed for write.exe to work (writing a dot in project_config table)
db <- dbConnect(RSQLite::SQLite(), db_path)
project_config <- dbReadTable(db, 'project_config')
project_config$input_files_dir <- "."
dbExecute(db, "UPDATE project_config SET input_files_dir = '.'")
dbDisconnect(db)

## After this step, the model setup .sqlite database is fully prepared. If you 
## wish to investigate, review, or update parameters, you can use tools such as 
## SWATPlusEditor, DB Browser for SQLite, or any other open-source tools. 
## Additionally, R packages like RSQLite could be applied for these purposes."

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 6) Writing model setup text files into folder with write.exe -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

## Directory of setup .sqlite database 
dir_path <- file.path(dirname(db_path))

## Copy write.exe into TxtInOut directory and run it
## (In case you get error in this step the workaround can be opening database 
## with SWATPluseditor and writing SWAT input files with it.)
exe_copy_run(file.path("..", "..", "bin"), dir_path, "write.exe")

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 7) Checking land connectivity -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

# Preparing land_connections_as_lines.shp layer to visualize connectivity
## (needed, if file rout_unit.con should be updated manually)

source(paste0(lib_path, '/create_connectivity_line_shape.R'))
print(paste0("land_connections_as_lines.shp is prepared in ", dir_path, 
             '/data/vector folder' ))

## Guidelines for investigation and manual updating of 'rout_unit.con is 
## provided in Docs/connectivity_chech_showcase.pdf

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 8) Add atmospheric deposition data to model setup ----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

## Information about how to prepare atmospheric deposition data is on this webpage:
## https://biopsichas.github.io/SWATprepR/articles/deposition.html

## Atmospheric deposition must be catchment-specific. No fixed values are
## bundled with this reusable workflow. configure_atmo_dep() reads and writes
## data only for the selected mode, so disabled deposition never uses stale data.
atmo_dep_data <- configure_atmo_dep(
  mode = atmo_dep_mode,
  project_path = dir_path,
  basin_path = file.path(dir_path, 'data/vector/basin.shp'),
  start_year = st_year,
  end_year = end_year,
  atmo_file = atmo_dep_file,
  netcdf_source = atmo_dep_netcdf_source,
  download_timestep = atmo_dep_download_timestep,
  model_timestep = atmo_dep_model_timestep
)

# ##You can plot downloaded results with this code
# ggplot(pivot_longer(atmo_dep_data, !DATE, names_to = "par", values_to = "values"), aes(x = DATE, y = values))+
#   geom_line()+ 
#   facet_wrap(~par, scales = "free_y")+ 
#   theme_bw()

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 9) Linking aquifers and channels with geomorphic flow -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

# A SWATbuildR model setup only has one single aquifer (in its current 
# version). This aquifer is linked with all channels through a channel-
# aquifer-link file (aqu_cha.lin) in order to maintain recharge from the
# aquifer into the channels using the geomorphic flow option of SWAT+

link_aquifer_channels(dir_path)

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 10) Adding point sources data ----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

# Description of how data should be prepared (template) is on this webpage
# https://biopsichas.github.io/SWATprepR/articles/psources.html

if(!is.null(pnt_path)){
  ## Load data from template
  pnt_data <- load_template(pnt_path)
  ## Add to the model
  prepare_ps(pnt_data, dir_path, constant = TRUE)
} else {
  ## If no point sources data is provided, the script will not run
  print("No point sources data provided. Skipping this step.")
}

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 11) Running SWATfamR'er input preparation script -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

## Overwriting plants.plt with adjusted manually (if needed).
file.copy(paste0(lib_path, "/files_to_overwrite_at_the_end/plants.plt"), dir_path, 
          overwrite = TRUE)

## Setting directory and running Micha's SWAtfarmR'er input preparation script
in_dir <- paste0(lib_path, "/farmR_input")
source(paste0(in_dir, "/write_SWATfarmR_input.R"), chdir=TRUE)

## Coping results into results folder
files <- list.files(in_dir, pattern = "\\.csv$")
out_dir <- paste0(res_path, "/farmR_input")
if (dir.exists(out_dir)) unlink(out_dir, recursive = TRUE)
dir.create(out_dir)
file.copy(paste0(in_dir, "/", files), paste0(res_path, "/farmR_input"))

## Cleaning calculation directory
file.remove(paste0(in_dir, "/", files))
mgt <- paste0(out_dir, "/farmR_input.csv")

## Additional editing of the farmR_input.csv file, which might be necessary for 
## providing management schedules in drained areas. This is needed, if you have 
## drained areas in your model and you want to provide management schedules for 
## them. If you don't have drained areas or you don't want to provide management 
## schedules for them or you already included 'drn_' suffix in crops.shp file, 
## you can skip this it.

# ## Reading the file
# mgt <- paste0(out_dir, "/farmR_input.csv")
# mgt_file <- read.csv(mgt)
# 
# ## Updating farmR_input.csv for providing management schedules in drained areas
# mgt_file <- bind_rows(mgt_file, mgt_file %>%
#                         mutate(land_use = gsub("_lum", "_drn_lum", land_use)))
# write_csv(mgt_file, file = mgt, quote = "needed", na = '')

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 12) Updating landuse.lum file -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

## Please refer to Doc/modelling_protocol.pdf Section 3.1.7 for guidelines on 
## how to update landuse.lum file. You should correct read_and_modify_landuse_lum.R
## script according to your needs and then run it. The script is provided in
## Libraries folder. The script is designed to update landuse.lum file. If you
## have already updated landuse.lum file manually, you can skip this step. 
##
## Backing up landuse.lum file
if(!file.exists(paste0(dir_path, "/", "landuse.lum.bak"))) {
  file.copy(from = paste0(dir_path, "/", "landuse.lum"),
            to = paste0(dir_path, "/", "landuse.lum", ".bak"), overwrite = TRUE)
}

## Updating it
source(paste0(lib_path, '/read_and_modify_landuse_lum.R'))

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 13) Updating nutrients.sol and conneting to soil_plant.ini file -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

## Soil P data mapping and adding to model files scripts are provided by WP3. 
## Please utilize WPs&Task>WP3>Scrips and tools> App8_Map_soilP_content.R and 
## App9_Add_soilP_content_to_HRU.r
## Following lines provide way to update single value in nutrients.sol file

## Updating single value of labile phosphorus in nutrients.sol 
f_write <- paste0(dir_path, "/", "nutrients.sol")
nutrients.sol <- read.delim(f_write)
nutrients.sol[2,1] <- gsub("5.00000", lab_p, nutrients.sol[2,1])
update_file(nutrients.sol, f_write)

##Including connecting nutrients.sol into hru-data.hru
if(!file.exists(paste0(dir_path, '/hru-data.hru.bkp0'))) {
  copy_file_version(dir_path, 'hru-data.hru', file_version = 0)
}

hru_data <- SWATreadR::read_swat(file.path(dir_path, 'hru-data.hru'))
if (!'soil_plant_init' %in% names(hru_data)) stop('hru-data.hru has no soil_plant_init field.')
hru_data$soil_plant_init <- 'soilplant1'
SWATreadR::write_swat(hru_data, file.path(dir_path, 'hru-data.hru'), overwrite = TRUE)

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 14) Updating time.sim -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

## Update dates by header name, retaining any fields added by newer revisions.
f_write <- file.path(dir_path, 'time.sim')
time_sim <- readLines(f_write)
time_sim <- SWATreadR::swat_control_set(
  time_sim, c(yrc_start = st_year, yrc_end = end_year))
writeLines(time_sim, f_write)

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 15) Running SWAT+ model setup -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

##Copy swat.exe into txtinout directory and run it
swat62_migrate_inputs(dir_path)
swat_run_checked(dir_path, swat62_executable())

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 16) Running SWATfamR'er to prepare management files -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

## Please read https://chrisschuerz.github.io/SWATfarmR/ to understand how to 
## apply this tool. Below are a minimal set of lines to access management files.
## However, these might not be suitable in your case. Review before using

## Generating .farm project
if(startsWith(as.character(packageVersion("SWATfarmR")), "4.")){
  frm <- SWATfarmR::farmr_project$new(project_name = 'frm', project_path = dir_path, 
                                      project_type = 'environment') 
  .GlobalEnv$frm <- frm
} else {
  stop("SWATfarmR version should be > 4.0.0. Please update it.")
}
## Adding dependence to precipitation 
api <- variable_decay(frm$.data$variables$pcp, -5,0.8)
asgn <- select(frm$.data$meta$hru_var_connect, hru, pcp)
frm$add_variable(api, "api", asgn)

## Reading schedules, scheduling operations and writing management files
frm$read_management(mgt, discard_schedule = TRUE)

## Reading schedules, scheduling operations and writing management files
frm$schedule_operations(start_year = start_y, end_year = end_y, replace = 'all')

#Must match with calibration and validation period + warm up period.
frm$write_operations(start_year = start_y, end_year = end_y)

## If you need, different mgt files for calibration
# starting from different years; but managment file should renamed
# frm$write_operations(start_year = 2000, end_year = 2021)

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 17) Dealing with unconnected reservoirs -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

# Overwriting with a set of manually adjusted files (if needed). Except plants.plt
# which was overwritten in the step 11
# Directory could be empty, if you don't have any files to be used.
to_copy <- list.files(file.path(lib_path, "files_to_overwrite_at_the_end"), full.names = TRUE)
to_copy <- to_copy[!grepl("plants.plt", basename(to_copy))]
# Execute overwrite if files exist
if (length(to_copy) > 0) file.copy(to_copy, dir_path, overwrite = TRUE)

## Dealing with unconnected reservoirs
if(!file.exists(paste0(dir_path, '/reservoir.con.bkp0'))) copy_file_version(dir_path, 'reservoir.con', file_version = 0)
if(!file.exists(paste0(dir_path, '/reservoir.res.bkp0'))) copy_file_version(dir_path, 'reservoir.res', file_version = 0)
if(!file.exists(paste0(dir_path, '/hydrology.res.bkp0'))) copy_file_version(dir_path, 'hydrology.res', file_version = 0)

## Restore the original tables, then update named fields rather than fixed columns.
for (file in c('reservoir.con', 'reservoir.res', 'hydrology.res')) {
  stopifnot(file.copy(file.path(dir_path, paste0(file, '.bkp0')),
                      file.path(dir_path, file), overwrite = TRUE))
}
reservoir_con <- SWATreadR::read_swat(file.path(dir_path, 'reservoir.con'))
reservoir_res <- SWATreadR::read_swat(file.path(dir_path, 'reservoir.res'))
hydrology_res <- SWATreadR::read_swat(file.path(dir_path, 'hydrology.res'))
required_con <- c('out_tot', 'obj_typ_1', 'obj_id_1', 'hyd_typ_1', 'frac_1')
if (!all(required_con %in% names(reservoir_con))) {
  stop('reservoir.con does not contain the expected connection fields.')
}
res_idx <- match(reservoir_con$obj_id, reservoir_res$id)
hyd_idx <- match(reservoir_res$hyd[res_idx], hydrology_res$name)
if (anyNA(res_idx) || anyNA(hyd_idx)) stop('Reservoir tables cannot be matched by id and hydrology name.')
unconnected <- reservoir_con$out_tot == 0L |
  (reservoir_con$obj_typ_1 == 'aqu' & reservoir_con$obj_id_1 == 1L &
     reservoir_con$hyd_typ_1 == 'rhg')
reservoir_con$out_tot[unconnected] <- 1L
reservoir_con$obj_typ_1[unconnected] <- 'aqu'
reservoir_con$obj_id_1[unconnected] <- 1L
reservoir_con$hyd_typ_1[unconnected] <- 'rhg'
reservoir_con$frac_1[unconnected] <- 1
reservoir_res$rel[res_idx[unconnected]] <- 'null'
reservoir_res$sed[res_idx[unconnected]] <- 'sedres1'
reservoir_res$nut[res_idx[unconnected]] <- 'nutres1'
hydrology_res$k[hyd_idx] <- ifelse(unconnected, 0.1, 0)
hydrology_res$evap_co[hyd_idx] <- 0.8
hydrology_res$shp_co1[hyd_idx] <- 0
hydrology_res$shp_co2[hyd_idx] <- 0
SWATreadR::write_swat(reservoir_con, file.path(dir_path, 'reservoir.con'), overwrite = TRUE)
SWATreadR::write_swat(reservoir_res, file.path(dir_path, 'reservoir.res'), overwrite = TRUE)
SWATreadR::write_swat(hydrology_res, file.path(dir_path, 'hydrology.res'), overwrite = TRUE)

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 18) Updating any other files (if needed) -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

# ##For instance hydrology.hyd
# if(!file.exists(paste0(dir_path, '/hydrology.hyd.bkp0'))) {
#   copy_file_version(dir_path, 'hydrology.hyd', file_version = 0)
# }
# 
# hydrology_hyd <- SWATtunR::read_tbl(paste0(dir_path, "/hydrology.hyd.bkp0"))
# hydrology_hyd$harg_pet <- 1.1
# hydrology_hyd <- mutate_if(hydrology_hyd, is.double, ~sprintf("%0.5f",.))
# SWATreadR:::write_tbl(hydrology_hyd, paste0(dir_path, '/hydrology.hyd'), 
# fmt = c('%-14s', rep('%12s', 14)))

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 19) Running final SWAT model pre-calibrated setup ----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

## Copy swat.exe into txtinout directory and run it
swat62_migrate_inputs(dir_path)
swat_run_checked(dir_path, swat62_executable())

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 20) Extracting SWAT input files and overwriting with a set of files -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

## Preparing directory
clean_path <- paste0(res_path, "/", "clean_setup")
## If the directory exists, delete the results directory. (Please be careful!!!)
if (file.exists(clean_path)) unlink(clean_path, recursive = TRUE)
## Creating results directory
dir.create(clean_path, recursive = TRUE)

## Coping only input files
file.copy(setdiff(list.files(path = dir_path, full.names = TRUE), 
                  list.files(path = dir_path, 
                             pattern = ".*.txt|.*.zip|.*success.fin|.*co2.out|.*write.exe|.*simulation.out|.*.bak|.*.mgts|.*.farm|.*area_calc.out|.*checker.out|.*sqlite|.*diagnostics.out|.*erosion.out|.*files_out.out|.*.swf", full.names = TRUE)), 
          clean_path)

cat("Congradulations!!! You have pre-calibrated model!!! \n
Please continue to soft-calibration workflow (softcal_workflow.R)")
print(paste0("Your setup is located in the ", getwd(), "/", clean_path))

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 21) Adding calibration.cal to SWAT model (preparing calibrated setup) -----
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
stop("Remove this if you have calibration.cal file")

cal_file_nb <- 1
cal_file <- paste0(lib_path, "/calibration_cal/calibration", as.character(cal_file_nb), ".cal")
file.copy(from = cal_file, 
          to = paste0(clean_path, "/calibration.cal"), overwrite = TRUE)

## Updating file.cio file
file_cio_path <- file.path(clean_path, 'file.cio')
file_cio <- SWATreadR::swat_cio_set(readLines(file_cio_path), 'chg', 2L,
                                    'calibration.cal')
writeLines(file_cio, file_cio_path)
