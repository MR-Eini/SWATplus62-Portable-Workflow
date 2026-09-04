## Split the land input layer into the hru and the reservoir layers.
## All features with of type 'watr' will be part of the res layer.
## 
#' @param data_path Path of the project data folder
#' 
split_land_layer <- function(data_path) {
  land <- read_sf(paste0(data_path, '/vector/land.shp'))
  land %>% 
    filter(., type == 'watr') %>% 
    select(., id, type) %>% 
    write_shp(., 'res', paste0(data_path, '/vector'))
  land %>% 
    filter(., type != 'watr') %>% 
    init_obj_layer(., 'hru') %>% 
    write_shp(., 'hru', paste0(data_path, '/vector'))
}

## Build the landuse_lum and the hru land use id table.
## 
#' @param data_path Path of the project data folder
#'  
build_landuse <- function(data_path) {
  hru <- read_sf(paste0(data_path, '/vector/hru.shp'))
  
  drn_lum_names <- c()
  
  if(all(c('cha_id', 'flow') %in% colnames(hru))) {
    is_drain <-  hru$flow == 'til' & !is.na(hru$flow)
    has_drain <- any(is_drain)
    if(has_drain & ! 'cha.shp' %in% list.files(paste0(data_path, '/vector'))) {
      stop('Tile drainage was defined for land objects but no channel', 
           ' layer was defined for this project!')
    }
    hru <- mutate(hru, type = ifelse(is_drain, paste0(type, '_drn'), type))
    drn_lum_names <- paste0(unique(hru$type[is_drain]), '_lum')
  }
  
  landuse <- hru %>%
    st_drop_geometry() %>%
    select(id, type) %>%
    set_names(c('id', 'landuse')) %>%
    mutate(lu_mgt_id = factor(landuse) %>% as.numeric())
  
  landuse_id <- select(landuse, id, lu_mgt_id) %>%
    mutate(lu_mgt_id = as.integer(lu_mgt_id))
  
  urban_types <- c('urhd', 'urmd', 'urml', 'urld', 'ucom', 
                   'uidu', 'utrn', 'uins', 'urbn')
  
  landuse_lum <- landuse %>%
    group_by(lu_mgt_id) %>%
    summarise(landuse = landuse[1]) %>%
    mutate(type = ifelse(landuse %in% urban_types, 'urban_urb', NA)) %>%
    rename(id = lu_mgt_id,
           name = landuse) %>%
    mutate(name = paste0(name, '_lum'),
           cal_group = NA_integer_,
           plnt_com_id = ifelse(is.na(type), 1, NA),
           mgt_id       = NA_integer_,
           cn2_id       = NA_integer_,
           cons_prac_id = NA_integer_,
           urban_id     = NA_integer_,
           urb_ro       = NA_integer_,
           ov_mann_id   = NA_integer_,
           tile_id      = NA_integer_,
           sep_id       = NA_integer_,
           vfs_id       = NA_integer_,
           grww_id      = NA_integer_,
           bmp_id       = NA_integer_,
           description  = '') %>%
    select(- type)
  
  if(length(drn_lum_names) > 0) {
    landuse_lum <- mutate(landuse_lum, tile_id = ifelse(name %in% drn_lum_names, 1, tile_id))
  }
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  dbWriteTable(db, 'landuse.ids', landuse_id, overwrite = TRUE)
  dbWriteTable(db, 'landuse.landuse_lum', landuse_lum, overwrite = TRUE)
  dbDisconnect(db)
}

## Build the hru input tables. 
## The function writes 4 tables into tables.sqlite:
## - hru.hru_con
## - hru.hru_data_hru
## - hru.topography_hyd
## - hru.hydrology_hyd
## - hru.topo_id
## 
#' @param data_path Path of the project data folder
#'
build_hru_input <- function(data_path) {
  hru <- read_sf(paste0(data_path, '/vector/hru.shp'))
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  hru_terrain_soil <- dbReadTable(db, 'hru_terrain_soil')
  luse_ids <- dbReadTable(db, 'landuse.ids')
  soil <- list(ids       = dbReadTable(db, 'soil.ids'),
               soils_sol = dbReadTable(db, 'soil.soils_sol'))
  dbDisconnect(db)
  
  # Generate hru.con table
  hru_con <- hru %>%
    select(id, name, gis_id) %>%
    mutate(area = st_area(.) %>% set_units(., ha) %>% as.numeric(.)) %>%
    add_latlon(.) %>% 
    st_drop_geometry(.) %>%
    mutate(elev = hru_terrain_soil$elev,
           wst_id  = NA_integer_, #  added with Editor
           cst_id  = NA_integer_, # default 0 but Editor input is NA
           ovfl = 0L, # default 0
           rule = 0L, # default 0
           hru_id = id) # Is Editor input
  
  # Generate topography.hyd table
  # Many of the inputs still require methods for computation.
  topography_hyd <- tibble(
    id = NA,
    name     = create_names(1:nrow(hru), 'topohru'),
    slp      = hru_terrain_soil$slope,
    slp_len  = 30, # Has to be discussed how to calculate slp_len
    lat_len  = slp_len, # in default setup same as slp_len
    dist_cha = 121, # Also to discuss
    depos    = 0,
    type = 'hru') %>% # 0 in default setup. Discuss with others
    bind_rows(.,mutate(., name = str_replace(name, 'hru', 'rtu'), type = 'sub')) %>%
    mutate(id = 1:nrow(.))
  
  if (all(c('cha_id', 'flow') %in% colnames(hru))) {
    is_drained <- hru$flow == 'til' & !is.na(hru$flow) 
  } else {
    is_drained <- rep(FALSE, nrow(hru))
  }
  
  init_perco_cn3_latq <- initialize_perco_cn3_latq(hru_terrain_soil, soil, is_drained)
  
  # Generate hydrology.hyd input table
  # Also in SWAT+Editor most of the variables default starting values
  # For some good starting values could be calculated!? E.g. lat_ttime, lat_sed
  hydrology_hyd <- tibble(
    id = hru_con$id,
    name         = create_names(id, 'hyd'),
    lat_ttime    = 0, # Default, Maybe calculate from flow length and slope?
    lat_sed      = 0, # Default
    can_max      = 1.0, # Default
    esco         = 0.95, # Default
    epco         = 1.0, # Default
    orgn_enrich  = 0, # Default
    orgp_enrich  = 0, # Default
    cn3_swf      = init_perco_cn3_latq$cn3_swf,
    bio_mix      = 0.2, # Default
    perco        = init_perco_cn3_latq$perco,
    lat_orgn     = 0, # Default
    lat_orgp     = 0, # Default
    harg_pet     = 0, # Default
    latq_co      = init_perco_cn3_latq$latq_co)
  
  topo_id <- topography_hyd %>%
    select(id, name) %>%
    mutate(name = str_remove(name, 'topo'))
  
  topo_id_hru <- left_join(hru_con['name'], topo_id , by = 'name')
  
  hru_data_hru <- tibble(
    id                 = hru_con$id,
    name               = hru_con$name,
    topo_id            = topo_id_hru$id,
    hydro_id           = hydrology_hyd$id,
    soil_plant_init_id = NA_integer_,
    surf_stor_id       = NA_integer_,
    snow_id            = 1L,
    field_id           = NA_integer_,
    description        = '') %>%
    left_join(., soil$ids, by = 'id') %>%
    left_join(., luse_ids, by = 'id') %>%
    select(id, name, topo_id, hydro_id, soil_id, lu_mgt_id, everything())
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  dbWriteTable(db, 'hru.hru_con', hru_con, overwrite = TRUE)
  dbWriteTable(db, 'hru.hru_data_hru', hru_data_hru, overwrite = TRUE)
  dbWriteTable(db, 'hru.topography_hyd', topography_hyd, overwrite = TRUE)
  dbWriteTable(db, 'hru.hydrology_hyd', hydrology_hyd, overwrite = TRUE)
  dbWriteTable(db, 'hru.topo_id', topo_id, overwrite = TRUE)
  dbDisconnect(db)
}

## Initialize the HRU parameters perco, cn3_swf, and latq_co based on the
## leaching potential and the runoff potential of an HRU. The leaching 
## potential and the runoff potential can be identified based on the
## average slope of an HRU and the hydrological soil group (HSG) of an HRU.
## The classification of the leaching and runoff potentials were done 
## according to Thompson et al. (2020).
## 
#' @param hru_terrain_soil Table that links terrain properties with hru ids
#' @param soil List of tables that provides the read soil data 
#'   (\code{soil$data}) and the links between soil ids with hru ids 
#'   (\code{soil$ids})
#' @param is_drained Boolean vector which indicates for each hru if it is 
#'   drained or not.
#'
initialize_perco_cn3_latq <- function(hru_terrain_soil, soil, is_drained) {
  leach_pot_lkp <- tribble(~hsg, ~slp_lwr, ~slp_upr, ~leach_pot,
                           'A',        0,      Inf,     'High',
                           'B',        0,        6,     'High',
                           'B',        6,      Inf,      'Mod',
                           'C',        0,       12,      'Mod',
                           'C',       12,      Inf,      'Low',
                           'D',        0,      Inf,      'Low')
  
  # Slopes in percent
  runoff_pot_lkp <- tribble(~hsg, ~slp_lwr, ~slp_upr, ~leach_pot,
                            'A',        0,        6,      'Low',
                            'A',        6,       12,      'Mod',
                            'A',       12,      Inf,     'High',
                            'B',        0,        4,      'Low',
                            'B',        4,        6,      'Mod',
                            'B',        6,      Inf,     'High',
                            'C',        0,        2,      'Low',
                            'C',        2,        6,      'Mod',
                            'C',        6,      Inf,     'High',
                            'D',        0,        2,      'Low',
                            'D',        2,        4,      'Mod',
                            'D',        4,      Inf,     'High',
  )
  
  hsg <- left_join(soil$ids, soil$soils_sol, by = c('soil_id' = 'id')) %>% 
    select(id, hyd_grp)
  
  init_par <- hru_terrain_soil %>% 
    left_join(., hsg, by = 'id') %>% 
    mutate(leach_pot  = assign_potential(slope, hyd_grp, leach_pot_lkp),
           runoff_pot = assign_potential(slope, hyd_grp, runoff_pot_lkp),
           leach_pot  = ifelse(is_drained, 'Low', leach_pot),
           runoff_pot = ifelse(is_drained, 'Low', runoff_pot),
           perco      = translate_par_value(leach_pot, 
                                            c('Low', 'Mod', 'High'), 
                                            c(0.05,  0.50,   0.90)),
           cn3_swf    = translate_par_value(runoff_pot, 
                                            c('Low', 'Mod', 'High'), 
                                            c(0.95,  0.30,   0.00)),
           latq_co    = translate_par_value(runoff_pot, 
                                            c('Low', 'Mod', 'High'), 
                                            c(0.01,  0.20,   0.90))) %>% 
    select(perco, cn3_swf, latq_co)
  
  return(init_par)
}

## Assign the leaching or the runoff potential to an HRU based on the 
## provided lookup table, the slope and the HSG.
## 
#' @param slp Numeric value, slope in m per m
#' @param hsg Character value, one of 'A', 'B', 'C', or 'D'
#' @param lookup Tibble that gives the translation to the potential based
#'   slope and HSG
#'
assign_potential <- function(slp, hsg, lookup) {
  slp_pct <- 100*slp
  idx <- map_int(1:length(slp), ~ which(hsg[.x]     == lookup$hsg & 
                                          slp_pct[.x] >= lookup$slp_lwr &
                                          slp_pct[.x]  < lookup$slp_upr))
  lookup$leach_pot[idx]
}