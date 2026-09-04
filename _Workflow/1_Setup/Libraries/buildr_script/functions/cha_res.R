## Calculate terrain properties such as elevation, slope, catchment area,
## channel width/depth for channel and reservoir objects
## Retruns a list with the tibbles 'cha' and 'res' that provide the 
## respective terrain properties for the two spatial object types.
## 
#' @param data_path Path of the project data folder
#'
prepare_terrain_water <- function(data_path) {
  dem  <- rast(paste0(data_path, '/raster/dem_fill_brch.tif'))
  
  dem_res <- mean(res(dem))
  
  vct_files <- list.files(paste0(data_path, '/vector'))
  
  if('res.shp' %in% vct_files) {
    res  <- read_sf(paste0(data_path, '/vector/res.shp')) %>% 
      mutate(area = st_area(.) %>% as.numeric(.) / 1e4)
    res_elev <- zonal(dem, vect(res), 'mean') 
    
    res_terrain <- res %>% 
      st_drop_geometry(.) %>% 
      select(id, area) %>%  
      mutate(elev = res_elev[[1]], .before = area)
    
    db_path <- paste0(data_path, '/tables.sqlite')
    db <- dbConnect(SQLite(), db_path)
    dbWriteTable(db, 'res.terrain', res_terrain, overwrite = TRUE)
    dbDisconnect(db)
  }
  
  if('cha.shp' %in% vct_files) {
    cha  <- read_sf(paste0(data_path, '/vector/cha.shp')) 
    cha_poly <- st_buffer(cha, 0.1*dem_res)
    cha_rst <- rasterize(vect(cha), dem, 'id')
    
    elev_max   <- zonal(dem,  vect(cha_poly), 'max')
    elev_min   <- zonal(dem,  vect(cha_poly), 'min')
    contr_area <- calculate_contributing_area(data_path, cha_rst, dem_res)
    
    contr_area_miss <- tibble(id = cha$id[!cha$id %in% contr_area$id],
                              ca = 0.1)
    
    contr_area <- bind_rows(contr_area,contr_area_miss) %>% 
      arrange(id)
    
    awdr <- calc_wd(contr_area$ca) %>% 
      add_column(id = contr_area$id)
    
    cha_terrain <- cha %>% 
      select(id, type) %>% 
      left_join(., awdr, by = 'id') %>%
      mutate(elev_max = elev_max[[1]],
             elev_min = elev_min[[1]],
             elev = (elev_max + elev_min) /2,
             length = st_length(.) %>% as.numeric(.),
             slope  = ((elev_max - elev_min) / length),
             length = length / 1e3) %>% # conversion to km
      st_drop_geometry()
    
    db_path <- paste0(data_path, '/tables.sqlite')
    db <- dbConnect(SQLite(), db_path)
    dbWriteTable(db, 'cha.terrain', cha_terrain, overwrite = TRUE)
    dbDisconnect(db)
  }
}

## Build SWAT+ channel input files.
## The function writes the following tables into the intermediate data base
## - cha.chandeg_con
## - cha.hyd_sed_lte_cha 
## - cha.channel_lte_cha
## 
#' @param data_path Path of the project data folder
#'
build_cha_input <- function(data_path) {
  
  vct_files <- list.files(paste0(data_path, '/vector'))
  
  if('cha.shp' %in% vct_files) {
    cha  <- read_sf(paste0(data_path, '/vector/cha.shp'))
    
    db_path <- paste0(data_path, '/tables.sqlite')
    db <- dbConnect(SQLite(), db_path)
    cha_terrain <- dbReadTable(db, 'cha.terrain')
    dbDisconnect(db)
    
    chandeg_con <- cha %>%
      select( - id_sel, -type) %>%
      mutate(area = cha_terrain$contr_area) %>% 
      add_latlon(.) %>% 
      st_drop_geometry() %>%
      mutate(elev = cha_terrain$elev,
             wst_id = NA_integer_,
             cst_id = NA_integer_,
             ovfl   = 0L,
             rule   = 0L,
             lcha_id = id)
    
    hyd_sed_lte_cha <- tibble(
      id        = cha$id,
      name      = create_names(id, 'hydcha'),
      order     = '',
      wd        = cha_terrain$width,
      dp        = cha_terrain$depth,
      slp       = cha_terrain$slope,
      len       = cha_terrain$length,
      mann      = 0.05,
      k         = 1.0,
      erod_fact = 0.01,
      cov_fact  = 0.005,
      wd_rto    = cha_terrain$wdr,
      eq_slp    = 0.001,
      d50       = 12.0,
      clay      = 50.0,
      carbon    = 0.04,
      dry_bd    = 1.0,
      side_slp  = 0.5,
      bed_load  = 0.5,
      fps       = 1.0,
      fpn       = 1.0,
      n_conc    = 1.0,
      p_conc    = 1.0,
      p_bio     = 1.0,
      description = '')
    
    channel_lte_cha <- tibble(
      id          = cha$id,
      name        = cha$name,
      init_id     = 1L,
      hyd_id      = hyd_sed_lte_cha$id,
      sed_id      = NA_integer_,
      nut_id      = 1L,
      description = ''
    )
    
    db_path <- paste0(data_path, '/tables.sqlite')
    db <- dbConnect(SQLite(), db_path)
    dbWriteTable(db, 'cha.chandeg_con', chandeg_con, overwrite = TRUE)
    dbWriteTable(db, 'cha.hyd_sed_lte_cha', hyd_sed_lte_cha, overwrite = TRUE)
    dbWriteTable(db, 'cha.channel_lte_cha', channel_lte_cha, overwrite = TRUE)
    dbDisconnect(db)
    
  }
}

## Build SWAT+ reservoir input files.
## The function writes the following tables into the intermediate data base:
## - res.reservoir_con
## - res.hydrology_res
## - res.reservoir_res
## 
#' @param data_path Path to the project data folder
#' 
build_res_input <- function(data_path) {
  
  vct_files <- list.files(paste0(data_path, '/vector'))
  
  if('res.shp' %in% vct_files) {
    res  <- read_sf(paste0(data_path, '/vector/res.shp'))
    
    db_path <- paste0(data_path, '/tables.sqlite')
    db <- dbConnect(SQLite(), db_path)
    res_terrain <- dbReadTable(db, 'res.terrain')
    dbDisconnect(db)
    
    reservoir_con<- res %>%
      select(-id_sel) %>%
      mutate(area = res_terrain$area) %>% 
      add_latlon(.) %>% 
      st_drop_geometry() %>%
      mutate(elev = res_terrain$elev,
             wst_id = NA_integer_,
             cst_id = NA_integer_,
             ovfl   = 0L,
             rule   = 0L,
             res_id = id)
    
    hydrology_res <- tibble(
      id      = reservoir_con$id,
      name    = reservoir_con$name,
      yr_op   = 1L,
      mon_op  = 1L,
      area_ps = reservoir_con$area,
      vol_ps  = area_ps * 10,
      area_es = area_ps * 1.15,
      vol_es  = area_es* 10,
      k       = 0.0,
      evap_co = 0.6,
      shp_co1 = 0.0,
      shp_co2 = 0.0)
    
    reservoir_res <- tibble(
      id          = reservoir_con$id,
      name        = reservoir_con$name,
      init_id     = 1L,
      hyd_id      = hydrology_res$id,
      rel_id      = 39L, # default release type?
      sed_id      = 1L,
      nut_id      = 1L,
      description = '')
    
    db_path <- paste0(data_path, '/tables.sqlite')
    db <- dbConnect(SQLite(), db_path)
    dbWriteTable(db, 'res.reservoir_con', reservoir_con, overwrite = TRUE)
    dbWriteTable(db, 'res.hydrology_res', hydrology_res, overwrite = TRUE)
    dbWriteTable(db, 'res.reservoir_res', reservoir_res, overwrite = TRUE)
    dbDisconnect(db)
  }
}