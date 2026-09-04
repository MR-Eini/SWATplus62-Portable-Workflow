## Save dem and slope raster layers in the project data/raster folder 
## 
#' @param dem_path Path of the dem raster layer
#' @param data_path Path of the project data folder
#' 
save_dem_slope_raster <- function(dem, data_path) {
  # writeRaster(dem, paste0(data_path, '/raster/dem.tif'), 
  #             overwrite = TRUE)
  # load watershed
  basin <- vect(paste0(data_path, '/vector/basin.shp'))
  
  # crop DEM to watershed
  dem_basin <- crop(dem, basin, mask = TRUE)
  
  # Define NA flag value for raster layer
  NA_value <- -1.79769e308
  
  # Save solution to specifically reclass all NA values to the NA flag value
  dem_basin <- classify(dem_basin, cbind(NA, NA_value))
  
  #Assign NA flag value as NA in raster
  NAflag(dem_basin) <- NA_value
  
  # save file DEM layer
  writeRaster(dem_basin,
              paste0(data_path, '/raster/dem.tif'),
              overwrite = TRUE, 
              datatype = "FLT4S",
              NAflag = NA_value)
  
  # Calculate the slope from the cropped DEM layer and convert to percent
  slp_rad <- terrain(dem_basin, v="slope", neighbors=8, unit="radians")
  slp_pct <- 100*tan(slp_rad)
  
  # Save slope layer
  writeRaster(slp_pct,
              paste0(data_path, '/raster/slope.tif'),
              overwrite = TRUE, 
              datatype = "FLT4S",
              NAflag = NA_value)
  # wbt_clip_raster_to_polygon(input = paste0(data_path, '/raster/dem.tif'),
  #                            polygons = paste0(data_path, '/vector/basin.shp'),
  #                            output = paste0(data_path, '/raster/dem.tif'))
  # wbt_reclass(input = paste0(data_path, '/raster/dem.tif'),
  #             output = paste0(data_path, '/raster/dem.tif'),
  #             reclass_vals = "0;9999999;9999999") %>% 
  # capture.output(., file='NULL')
  # wbt_slope(dem = paste0(data_path, '/raster/dem.tif'),
  #           output = paste0(data_path, '/raster/slope.tif'),
  #           units = 'percent')
  # file.remove('NULL')
}

## Save dem and slope raster layers in the project data/raster folder 
## 
#' @param soil Soil raster layer
#' @param data_path Path of the project data folder
#' 
save_soil_raster <- function(soil, data_path, soil_lookup_path) {
  dem <- rast(paste0(data_path, '/raster/dem.tif'))
  soil <- project(soil, dem, method = 'near')
  
  soil_lkp <- read_csv(soil_lookup_path, lazy = FALSE, show_col_types = FALSE) %>%
    set_names(c('soil_id', 'name')) %>% 
    mutate(name = factor(name, levels = unique(name))) %>% 
    group_by(name) %>%
    mutate(group_id = cur_group_id()) %>% 
    ungroup()
    
  # load watershed
  basin <- vect(paste0(data_path, '/vector/basin.shp'))
  
  # crop DEM to watershed
  soil_basin <- crop(soil, basin, mask = TRUE)
  
  # Define NA flag value for raster layer
  NA_value <- -1.79769e308
  
  rcl_tbl <- soil_lkp %>% 
    select(soil_id, group_id) %>% 
    bind_rows(., bind_cols(soil_id = NA, group_id = NA_value))

  # Save solution to specifically reclass all NA values to the NA flag value
  soil_basin <- classify(soil_basin, rcl_tbl)
  
  #Assign NA flag value as NA in raster
  NAflag(soil_basin) <- NA_value
  
  writeRaster(soil_basin, 
              paste0(data_path, '/raster/soil.tif'), 
              overwrite = TRUE, 
              datatype = "FLT4S",
              NAflag = NA_value)
  # wbt_reclass(input = paste0(data_path, '/raster/soil.tif'),
  #             output = paste0(data_path, '/raster/soil.tif'),
  #             reclass_vals = "0;9999999;9999999") %>% 
  #   capture.output(., file='NULL')
  # file.remove('NULL')
}

## Aggregate the raster properties of the DEM and the soil layer for the 
## units in the hru layer
## 
#' @param data_path Path of the project data folder
#' 
aggregate_hru_dem_soil <- function(data_path) {
  
  ## Read raster layer
  dem <- rast(paste0(data_path, '/raster/dem.tif'))
  slp  <- rast(paste0(data_path, '/raster/slope.tif'))
  soil <- rast(paste0(data_path, '/raster/soil.tif'))
  
  ## Conversion from percent to m/m (Unit used in SWAT+)
  slp <- slp / 100
  slp[slp > 999] <- NA # Remove non plausible large slope values
  
  ## Read HRU vector layer
  hru  <- read_sf(paste0(data_path, '/vector/hru.shp'))
  
  elev  <- zonal(dem, vect(hru), fun = mean, na.rm = TRUE)
  slope <- zonal(slp,    vect(hru), fun = mean, na.rm = TRUE)
  soil  <- extract(soil, vect(hru), fun = mode, na.rm = TRUE)
  
  hru_tbl <- tibble(id    = hru$id,
                    elev  = elev[[1]],
                    slope = slope[[1]],
                    soil  = soil[[2]]) %>% 
    mutate(slope = ifelse(is.na(slope), 0.005, slope))
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  dbWriteTable(db, 'hru_terrain_soil', hru_tbl, overwrite = TRUE)
  dbDisconnect(db)
}

## Read and prepare the soil data. 
## The function writes 4 tables into tables.sqlite:
## - soil.lookup          provides the soil lookup table
## - soil.soils_sol       provides the soils_sol table
## - soil.soils_sol_layer provides the soils_sol layer information
## - .$ids                provides the ID links between HRU ids and soil ids
## 
#' @param soil_lookup_path Path of the soil lookup csv file
#' @param soil_data_path Path of the soil data csv file
#' @param data_path Path of the project data folder
#' 
build_soil_data <- function(soil_lookup_path, soil_data_path, data_path) {
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  hru_terrain_soil <- dbReadTable(db, 'hru_terrain_soil', hru_tbl)
  dbDisconnect(db)
  
  # Soil input tables
  ## Soil lookup table
  soil_lkp <- read_csv(soil_lookup_path, lazy = FALSE, show_col_types = FALSE) %>%
    set_names(c('soil_id', 'name')) %>%
    mutate(name = factor(name, levels = unique(name))) %>% 
    group_by(name) %>%
    mutate(soil_id = cur_group_id()) %>% 
    ungroup() %>% 
    distinct() %>% 
    filter(soil_id %in% hru_terrain_soil$soil) 
  
  id_lkp_miss <- !hru_terrain_soil$soil %in% soil_lkp$soil_id
  
  if(any(id_lkp_miss)) {
    id_msg <- paste(unique(hru_terrain_soil$soil[id_lkp_miss]), collapse = ', ')
    stop('\nThe following soil IDs were given in the soil raster but were',
         ' not found in soil lookup table:\n', id_msg,
         '\nPlease update the soil lookup table before you continue!'
    )
  }
  
  ## Soil data
  soil_dat <- read_csv(soil_data_path, lazy = FALSE, show_col_types = FALSE)
  
  soil_name_dupl <- table(soil_dat[4]) > 1
  if (any(soil_name_dupl)) {
    stop('\n  The following soils in the soil data table are duplicated:\n  ',
         paste(names(soil_name_dupl)[soil_name_dupl], collapse = ', '),
         '\n\n  Please remove dupicated entries before you continue.')
  }
  
  soil_dat <- soil_dat[c(4, 8:ncol(soil_dat))] %>%
    set_names(c('name', 'hyd_grp', 'dp_tot', 'anion_excl', 'perc_crk', 'texture',
                names(.)[7:ncol(.)])) %>%
    mutate(texture = ifelse(is.na(texture), '', texture)) %>% 
    left_join(., soil_lkp, by = 'name') %>%
    filter(!is.na(soil_id)) %>% 
    relocate(soil_id, .before = name) %>% 
    arrange(soil_id) %>% 
    mutate(id = 1:nrow(.), .before = 1)
  
  id_soil_dat_miss <- !hru_terrain_soil$soil %in% soil_dat$soil_id
  
  if(any(id_soil_dat_miss)) {
    id_msg <- paste(unique(hru_terrain_soil$soil[id_soil_dat_miss]), collapse = ', ')
    stop('\nThe following soils are present in the soil raster but were',
         ' not found in soil data:\n', id_msg,
         '\nPlease update the soil data table before you continue!'
    )
  }
  
  soils_sol <- soil_dat %>%
    select(id, soil_id, name, hyd_grp, dp_tot, anion_excl, perc_crk, texture) %>%
    mutate(description = '')
  
  if(any(is.na(soils_sol$hyd_grp))) {
    id_miss <- paste(soils_sol$soil_id[which(is.na(soils_sol$hyd_grp))], collapse = ', ')
    stop('\nFor the following soils no hydrological soil group is defined: \n',
         id_msg,
         '\nPlease update the soil data table before you continue!'
    )
  }
  
  if(any(is.na(soils_sol$dp_tot))) {
    id_miss <- paste(soils_sol$soil_id[which(is.na(soils_sol$hyd_grp))], collapse = ', ')
    stop('\nFor the following soils no total depth is defined: \n',
         id_msg,
         '\nPlease update the soil data table before you continue!'
    )
  }
  
  soils_sol_layer <- map(1:10, ~ select(soil_dat, id, soil_id, ends_with(as.character(.x)))) %>%
    map(., ~ set_names(.x, c('id', 'soil_id', 'dp', 'bd', 'awc', 'soil_k', 'carbon',
                             'clay', 'silt', 'sand', 'rock', 'alb', 'usle_k', 'ec',
                             'caco3', 'ph'))) %>%
    map(., ~ filter(.x, dp > 0)) %>%
    map2(., 1:10, ~ mutate(.x, layer_num = .y, .after = soil_id)) %>%
    bind_rows() %>%
    arrange(., id, layer_num) %>%
    mutate(soil_id = id,
           id = 1:nrow(.))
  
  
  soils_layer_miss <- soils_sol_layer %>% 
    filter(., if_any(everything(.), ~ is.na(.)))
  
  if(nrow(soils_layer_miss) > 0) {
    soils_layer_miss <- left_join(soils_layer_miss, 
                                  select(soils_sol, id, name), 
                                  by = c('soil_id' = 'id')) 
    
    soils_layer_name <- names(soils_layer_miss)
    
    soils_layer_miss_msg  <- select(soils_layer_miss, name, layer_num) %>% 
      mutate(., variable_values_NA = NA_character_)
    
    for (i in 1:nrow(soils_layer_miss)) {
      var_miss <- paste(soils_layer_name[which(is.na(soils_layer_miss[i,]))], collapse = ', ')
      soils_layer_miss_msg$variable_values_NA[i] <- var_miss
    }
    
    message('\nThe soils in the following table are missing data for the indicated variables:\n')
    print(soils_layer_miss_msg)
    stop('\nPlease update the soil data table before you continue!')
  }
  
  soil_id <- soils_sol %>%
    select(id, soil_id) %>%
    left_join(hru_terrain_soil, ., by = c('soil' = 'soil_id'), suffix = c('_hru', '_sol')) %>%
    select(id_hru, id_sol) %>%
    set_names(c('id', 'soil_id'))
  
  soils_sol <- select(soils_sol, - soil_id)
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  dbWriteTable(db, 'soil.lookup', soil_lkp, overwrite = TRUE)
  dbWriteTable(db, 'soil.soils_sol', soils_sol, overwrite = TRUE)
  dbWriteTable(db, 'soil.soils_sol_layer', soils_sol_layer, overwrite = TRUE)
  dbWriteTable(db, 'soil.ids', soil_id, overwrite = TRUE)
  dbDisconnect(db)
}
