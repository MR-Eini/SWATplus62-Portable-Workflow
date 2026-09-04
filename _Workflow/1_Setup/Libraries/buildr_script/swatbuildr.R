# Script version of SWATbuildR -------------------------------------
# Version 1.5.18
# Date: 2024-03-12
# Developer: Christoph Schürz christoph.schuerz@ufz.de
# 
# This is a script version of the SWATbuildR workflow that is under
# development. The functional workflow works already as it will be 
# implemented in a final R package version.
# Land, channel, reservoir, and point source objects are already 
# implemented. Further object types and functional features will be 
# implemented over time.
# ------------------------------------------------------------------
#If necessary, install Whitebox Tools with this command (remove the # before use).
#whitebox::install_whitebox()
# # ------------------------------------------------------------------
# setwd('Libraries/buildr_script')
# setwd('G:/CS6/full_workflow_cs6')

# Load paths and parameter settings --------------------------------
# source('../../settings.R')

# Initialize script, load functions and packages, set paths --------
source('./init.R')

# Read and prepare input data --------------------------------------
## Basin boundary
bound <- read_sf(bound_path) %>% select()
set_proj_crs(bound, data_path)
check_polygon_topology(layer = bound, data_path =  data_path, label = 'basin', 
                       n_feat = 1, checks = c(F,T,T,T,F,F,F,F))

## Land layer
land <- read_sf(land_path) %>% 
  check_layer_attributes(., type_to_lower = FALSE) %>%
  check_project_crs(layer = ., data_path =  data_path, proj_layer = project_layer, 
                    label = 'land', type = 'vector')
## Check function saves layer into data/vector after all checks were successful
check_polygon_topology(layer = land, data_path =  data_path, label = 'land', 
                       area_fct =  0.05, cvrg_frc = 99.9,
                       checks = c(T,F,T,T,T,T,T,T))

## Split the land layer in to HRU (land) and reservoir (water) objects
split_land_layer(data_path)

## Channel layer
if(!is.null(channel_path)) {
  channel <- read_sf(channel_path) %>% 
    check_layer_attributes(., type_to_lower = TRUE) %>% 
    check_project_crs(layer = ., data_path =  data_path, proj_layer = project_layer, 
                      label = 'channel', type = 'vector')
  ## Check function saves layer into data/vector after all checks were successful
  check_line_topology(layer = channel, data_path = data_path, 
                      label = 'channel', length_fct = 0.05, can_cross = TRUE)
}
check_cha_res_connectivity(data_path, id_cha_out, id_res_out)

## Check if any defined channel ids for drainage from land objects do not exist
check_land_drain_ids(data_path)

## Load and check DEM raster
dem <- rast(dem_path) %>% 
  check_project_crs(layer = ., data_path =  data_path, proj_layer = project_layer, 
                    label = 'dem', type = 'raster')
check_raster_coverage(rst = dem, vct_layer = 'land', data_path = data_path, 
                      label = 'dem', cov_frc = 0.95)
#Save dem layer in data/raster
save_dem_slope_raster(dem, data_path)

## Load and check the soil raster layer
soil <- rast(soil_layer_path) %>% 
  check_project_crs(layer = ., data_path =  data_path, proj_layer = project_layer, 
                    label = 'soil', type = 'raster')
check_raster_coverage(rst = soil, vct_layer = 'hru', data_path = data_path, 
                      label = 'soil', cov_frc = 0.75)
## Project the soil layer to the grid and crs of the DEM
save_soil_raster(soil, data_path, soil_lookup_path)

## Prepare table with aggregated elevation, slope, soil for HRU units.
aggregate_hru_dem_soil(data_path)

## Read and prepare the soil input tables and a soil/hru id table and write 
## them into data_path/tables.sqlite
build_soil_data(soil_lookup_path, soil_data_path, data_path)

# Calculate land unit connectivity ---------------------------------
## Prepare raster layers based on the DEM and the surface channel objects 
## that will be used in the calculation of the land object connectivity.
prepare_terrain_land(data_path)

## Calculate the land object connectivity. The connection of each land 
## object to neighboring land and water objects is calculated based on 
## the flow accumulation and the D8 flow pointer along the object edge
calculate_land_connectivity(data_path)

## Eliminate land object connections with small flow fractions. 
## For each land object the flow fractions are compared to connection with
## the largest flow fraction of that land object. Connections are removed 
## if their fraction is smaller than 'frc_thres' relative to the largest one.

## The remaining land object connections are analyzed for infinite loop
## routing. For each land unit the connections are propagated and checked
## if the end up again in the same unit.
reduce_land_connections(data_path, frc_thres) %>% 
  check_infinite_loops(., data_path, 'Land')

## If infinite loops were identified this routine tries to resolve the 
## issues by selectively removing connections between land units in order
## to get rid of all infinite loops.
resolve_loop_issues(data_path)

# Calculate channel/reservoir connectivity -------------------------
## Calculate the water object connectivity. The function returns the cha 
## and res con_out tables in SWAT+ database format and writes them into
## data_path/tables.sqlite
build_water_object_connectivity(data_path)

## Check the water objects for infinite loops. From the cha_res_con_out
## tables id_from/id_to links are generated and checked for infinite 
## loop routing. 
prepare_water_links(data_path) %>% 
  check_infinite_loops(., data_path, 'Water', Inf)

## Calculate terrain properties such as elevation, slope, catchment area,
## channel width/depth for channel and reservoir objects and write them into
## data_path/tables.sqlite
prepare_terrain_water(data_path)

# Generate land object SWAT+ input tables --------------------------
## Build the landuse.lum and a landuse/hru id table and write them into 
## data_path/tables.sqlite
build_landuse(data_path)

## Build the HRU SWAT+ input files and write them into data_path/tables.sqlite
build_hru_input(data_path)

## Add wetlands to the HRUs and build the wetland input files and write them 
## into data_path/tables.sqlite
add_wetlands(data_path, wetland_landuse)

# Generate water object SWAT+ input tables -------------------------
## Build the SWAT+ cha input files and write them into data_path/tables.sqlite
build_cha_input(data_path)

## Build the SWAT+ res input files and write them into data_path/tables.sqlite
build_res_input(data_path)

## Build SWAT+ routing unit con_out based on 'land_connect_fraction'.
build_rout_con_out(data_path)

## Build the SWAT+ rout_unit input files and write them into 
## data_path/tables.sqlite
build_rout_input(data_path)

## Build the SWAT+ LSU input files and write them into data_path/tables.sqlite
build_ls_unit_input(data_path)

# Build aquifer input ----------------------------------------------
## Build the SWAT+ aquifer input files for a single aquifer for the 
## entire catchment. The connectivity to the channels with geomorphic
## flow must be added after writing the txt input files. 
## This is not implemented in the script yet.
build_single_aquifer_files(data_path)

# Add point source inputs ------------------------------------------
## Add point source inputs. The point source locations are provided
## with a point vector layer in the path 'point_path'. Point source
## records can automatically be added from files in the same folder
## as the point source location layer. To be identified as point 
## source data the files must be named as <name>_<interval>.csv, 
## where <name> must be the name of a point int the vector layer
## and <interval> must be one of 'const', 'yr', 'mon', or 'day'
## depending on the time intervals in the input data.
if(!is.null(point_path)) {
  add_point_sources(point_path, data_path, max_point_dist)
}

# Create SWAT+ sqlite database -------------------------------------
## Write the SWAT+Editor project database. The database will be located 
## the 'project_path'. After writing the database it can be opened and
## edited with the SWAT+Editor.
create_swatplus_database(project_path, project_name)

# -------------------------------------------------------------------------
# Switch to SWAT+Editor for further model parametrization
# and continue with the step below after writing 
# the SWAT+ projects' text input files
# -------------------------------------------------------------------------

# Link aquifers and channels with geomorphic flow -------------------------
# A SWATbuildR model setup only has one single aquifer (in its current 
# version). This aquifer is linked with all channels through a channel-
# aquifer-link file (aqu_cha.lin) in order to maintain recharge from the
# aquifer into the channels using the geomorphic flow option of SWAT+
# The required input file cannot be written with the SWAT+Editor.
# Therefore it has to be generated in a step after writing the 
# model text input files with the SWAT+Editor.
# link_aquifer_channels(txt_path)
