##------------------------------------------------------------------------------
## General settings 
##------------------------------------------------------------------------------

## SWAT+ model file name to be used in workflow (should be in 'Libraries' folder)
swat_exe <- "swatplus-62-ifo-win_amd64-Rel.exe"

## Folder names

## Folder for saving results
res_path <- "Temp"
## Data folder
data_path <- "Data"
## Scripts folder
lib_path <- "Libraries"

##Starting year for model setup
st_year <-  2004
##End year for the model setup
end_year <- 2023

## Paths to input data

## Path to weather data
## Description of functions and how data example was prepared is on this webpage
## https://biopsichas.github.io/SWATprepR/articles/weather.html
# weather_path <- paste0(data_path, '/for_prepr/weather_data_mini_model.xlsx')

weather_path <- paste0(data_path, '/for_prepr/met_int.rds')


## Path to point data
## Description of functions and how data example was prepared is on this webpage
## https://biopsichas.github.io/SWATprepR/articles/psources.html

pnt_path <- paste0(data_path, '/for_prepr/pnt_data.xlsx')

## Atmospheric deposition configuration. Choose one mode explicitly:
##   "none" - do not add atmospheric deposition;
##   "file" - read a catchment-specific CSV from atmo_dep_file;
##   "emep" - extract the catchment from one NetCDF source per year.
## A NetCDF template must contain {year} and may contain {timestep}.
atmo_dep_mode <- Sys.getenv('SWAT_ATMO_DEP_MODE', unset = 'none')
atmo_dep_file <- Sys.getenv('SWAT_ATMO_DEP_FILE', unset = '')
atmo_dep_netcdf_source <- Sys.getenv('SWAT_ATMO_DEP_NETCDF', unset = '')
atmo_dep_download_timestep <- 'year'
atmo_dep_model_timestep <- 'annual'

## Other settings

## For scripts to get to work directory of setup_workflow.R
out_path <- "../../"

## Soluble phosphorus to be written in nutrients.sol (current version of 
## workflow changes singe value for all catchment)
lab_p <- "40.4000"

##------------------------------------------------------------------------------
## SWATbuilder settings 
##------------------------------------------------------------------------------

buildr_data <- paste0(data_path, "/for_buildr/")

# Set input/output paths -------------------------------------------
#
# Project path (where output files are saved) ----------------------
project_path <- paste0(out_path, res_path, '/buildr_project')
project_name <- 'Mini_CREATE'

# Path of the TxtInOut folder (project folder where the SWAT+ text
# files are written with the SWAT+Editor)
txt_path <- paste0(project_path, "/", project_name, "/txt")

# Input data -------------------------------------------------------
## DEM raster layer path
dem_path <- paste0(out_path, buildr_data, 'DEM1.tif')

##Soil raster layer and soil tables paths
soil_layer_path  <- paste0(out_path, buildr_data, 'soil1.tif')
soil_lookup_path <- paste0(out_path, buildr_data, 'Soil_SWAT_cod.csv')
soil_data_path   <- paste0(out_path, buildr_data, 'usersoil_lrew.csv')

## Land input vector layer path
# land_path <- paste0(out_path, buildr_data, 'land.shp')
land_path <- paste0(out_path, buildr_data, 'land1.shp')

## Channel input vector layer path 
channel_path <- paste0(out_path, buildr_data, 'river1.shp')


## Catchment boundary vector layer path, all layers will be masked by the
## basin boundary
basin_path <- bound_path <- paste0(out_path, buildr_data, 'basin1.shp')

## Path to point source location layer
point_path <- NULL
# point_path <- paste0(out_path, buildr_data, 'WWTP.shp')

# Settings ---------------------------------------------------------
## Project layers
## The input layers might be in different coordinate reference systems (CRS). 
## It is recommended to project all layers to the same CRS and check them
## before using them as model inputs. The model setup process checks if 
## the layer CRSs differ from the one of the basin boundary. By setting 
## 'proj_layer <- TRUE' the layer is projected if the CRS is different.
## If FALSE different CRS trigger an error.
project_layer <- TRUE

## Set the outlet point of the catchment
## Either define a channel OR a reservoir as the final outlet
## If channel then assign id_cha_out with the respective id from the 
## channel layer:
id_cha_out <- 5

## If reservoir then assign the respective id from the land layer to
##  id_res_out, otherwise leave as set
id_res_out <- NULL

## Threshold to eliminate land object connectivities with flow fractions
## lower than 'frc_thres'. This is necessary to i) simplify the connectivity
## network, and ii) to reduce the risk of circuit routing between land 
## objects. Circuit routing will be checked. If an error due to circuit 
## routing is triggered, then 'frc_thres' must be increased to remove 
## connectivities that may cause this issue.
frc_thres <- 0.4

## Define wetland land uses. Default the wetland land uses from the SWAT+ 
## plants.plt data base are defined as wetland land uses. Wetland land uses
## should only be changed by the user if individual wetland land uses were 
## defined in the plant data base.
wetland_landuse <- c('wehb', 'wetf', 'wetl', 'wetn')

## Maximum distance of a point source to a channel or a reservoir to be included
## as a point source object (recall) in the model setup
max_point_dist <- 500 #meters


##------------------------------------------------------------------------------
## SWATfarmR'er input script settings 
##------------------------------------------------------------------------------

farmr_i_data <- paste0(data_path, "/for_farmr_input/")

# Define input files------------------------------------------------------------

# land-use crop map shapefile
##### IMPORTANT: if the agrl has drainage: agrl142 should be agrl142_drn in type
# lu_shp <- paste0(out_path, farmr_i_data, 'crops1.shp') 

lu_csv <- paste0(out_path, farmr_i_data, 'crops1.csv') 

# crop management .csv table
mgt_csv <- paste0(out_path, farmr_i_data, 'mgt_crops.csv') 
# generic land use management .csv table
lu_generic_csv <- paste0(out_path, farmr_i_data, 'mgt_generic.csv')


## Simulation period
start_y <- st_year #starting year (consider at least 3 years for warm-up!)
end_y <- end_year #ending year

## Prefix of cropland hrus (all names of hrus with a crop rotation must begin
## with this prefix in column 'lu' of your land use map)
hru_crops <- 'agrl'

## Multi-year farmland grass
## Did you define any multi-year farmland grass schedules? 'y' (yes), 'n' (no)
m_yr_sch_existing <- 'n'

## If yes, define also the following variables. If not, skip next four lines
crop_myr <- 'fesc' # prefix of multi-year schedules in management file
## multiple entries should have the same number of characters, 
## e.g.: crop_myr <- c('akgs', 'bsvg')
max_yr <- 4 # maximum number of years farmland grass can grow before it is 
## killed (should be <8)
## Do your multi-year farmland grass schedules consider the type of the 
## following crop (summer or winter crop)? (e.g., a '_1.5yr' schedule with a 
## kill op in spring allows for planting a summer crop immediately afterwards)
## If yes, you must define your summer crops
crop_s <- c('corn','csil','soyb')
## Do your summer crop schedules usually start with an operation in autumn 
## (e.g. tillage)? To combine them with farmland grass, it is necessary that you 
## provide 'half-year-schedules' ('half-year-schedules' are additional summer 
## crop schedules without operations in autumn) The adapted schedules should be 
## added to the crop management table with suffix '_0.5yr' (e.g. 'csil_0.5yr')
## If additional 'half-year-schedules' are not needed, because your normal 
## summer crop schedules do not start in autumn, type 'n'
additional_h_yr_sch_existing <- 'n' # 'y' (yes), 'n' (no)
