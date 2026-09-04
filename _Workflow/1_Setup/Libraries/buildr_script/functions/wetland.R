## Build the wetland input tables and add surface water storage to HRUs. 
## The function writes the following tables into tables.sqlite:
## - wet.wetland_wet
## - wet.hydrology_wet
## 
## The function additionally rewrites hru.hru_data_hru and adds surf_stor_ids
## in case wetland land uses are used in the land layer.
## 
#' @param data_path Path of the project data folder
#' @param wetland_landuse Character vector that defines the wetland land uses
#'   for which surface water storage is initialized.
#'
add_wetlands <- function(data_path, wetland_landuse) {
  hru <- read_sf(paste0(data_path, '/vector/hru.shp'))
  
  hru <- hru %>% 
    st_drop_geometry(.) %>% 
    mutate(., is_wetland = ifelse(type %in% wetland_landuse, TRUE, FALSE)) %>% 
    filter(., is_wetland)
  
  if(nrow(hru) > 0) {
    db_path <- paste0(data_path, '/tables.sqlite')
    db <- dbConnect(SQLite(), db_path)
    hru_data_hru <- dbReadTable(db, 'hru.hru_data_hru')
    dbDisconnect(db)
    
    hru <- hru %>% 
      mutate(., surf_stor_id = 1:nrow(.)) %>% 
      select(., id, surf_stor_id)
      
    hru_data_hru <- hru_data_hru %>% 
      select(., - surf_stor_id) %>% 
      left_join(., hru, by = 'id') %>% 
      relocate(., surf_stor_id, .before = snow_id)
    
    wetland_wet <- hru_data_hru %>% 
      as_tibble(.) %>% 
      filter(., !is.na(surf_stor_id)) %>% 
      select(., surf_stor_id, name) %>% 
      rename(., id = surf_stor_id) %>% 
      mutate(., name = str_replace(name, 'hru', 'wet')) %>% 
      mutate(init_id = 2,
             hyd_id = id, 
             rel_id = 40,
             sed_id = 2,
             nut_id = 2,
             description = '')
    
    hydrology_wet <- tibble(id          = wetland_wet$id,
                            name        = paste0('hyd', wetland_wet$name),
                            hru_ps      = 0.1,
                            dp_ps       = 20,
                            hru_es      = 0.25,
                            dp_es       = 100,
                            k           = 0.01,
                            evap        = 0.7, 
                            vol_area_co = 1,
                            vol_dp_a    = 1,
                            vol_dp_b    = 1,
                            hru_frac    = 0.5)
    
    db_path <- paste0(data_path, '/tables.sqlite')
    db <- dbConnect(SQLite(), db_path)
    dbWriteTable(db, 'wet.wetland_wet',   wetland_wet,   overwrite = TRUE)
    dbWriteTable(db, 'wet.hydrology_wet', hydrology_wet, overwrite = TRUE)
    dbWriteTable(db, 'hru.hru_data_hru',  hru_data_hru,  overwrite = TRUE)
    dbDisconnect(db)
  }
}
