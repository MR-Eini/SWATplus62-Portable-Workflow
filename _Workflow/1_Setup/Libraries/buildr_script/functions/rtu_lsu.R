## Build SWAT+ routing unit input files. In the current configuration of 
## SWATbuildR setups one routing unit only contains one HRU. Hence, the 
## routing unit inputs are generated from the hru input tables.
## The function writes the following tables into the intermediate data base
## - rtu.rout_unit_con 
## - rtu.rout_unit_ele 
## - rtu.rout_unit_rtu 
## - rtu.field_fld
##  
#' @param data_path Path of the project data folder
#'
build_rout_input <- function(data_path) {
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  hru_con <- dbReadTable(db, 'hru.hru_con')
  topo_id <- dbReadTable(db, 'hru.topo_id')
  dbDisconnect(db)
  
  rout_unit_con <- hru_con %>%
    mutate(name   = str_replace(name, 'hru', 'rtu')) %>%
    rename(rtu_id = hru_id)
  
  rout_unit_ele <- tibble(
    id      = hru_con$id,
    name    = hru_con$name,
    rtu_id  = rout_unit_con$id,
    obj_typ = 'hru',
    obj_id  = hru_con$id,
    frac    = 1.0,
    dlr_id  = NA
  )
  
  topo_id_rtu <- left_join(rout_unit_con['name'], topo_id , by = 'name')
  
  rout_unit_rtu <- rout_unit_con %>%
    select(id, name) %>%
    mutate(dlr_id      = NA_integer_,
           topo_id     = topo_id_rtu$id,
           field_id    = id,
           description = '')
  
  field_fld <- rout_unit_con %>%
    select(id, name) %>%
    mutate(name = str_replace(name, 'rtu', 'fld'),
           len  = 500,
           wd   = 100,
           ang  = 30)
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  dbWriteTable(db, 'rtu.rout_unit_con', rout_unit_con, overwrite = TRUE)
  dbWriteTable(db, 'rtu.rout_unit_ele', rout_unit_ele, overwrite = TRUE)
  dbWriteTable(db, 'rtu.rout_unit_rtu', rout_unit_rtu, overwrite = TRUE)
  dbWriteTable(db, 'rtu.field_fld', field_fld, overwrite = TRUE)
  dbDisconnect(db)
}

## Build SWAT+ routing unit con_out based on the connect_ids table. This 
## already adds the connection to the single aquifer that will be added 
## to the setup in a next step.
## 
#' @param data_path Path of the project data folder
#'
build_rout_con_out <- function(data_path) {
  hru <- read_sf(paste0(data_path, '/vector/hru.shp'))
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  connect_ids <- dbReadTable(db, 'rtu.connect_ids')
  dbDisconnect(db)
  
  aqu_connect <- tibble(rtu_con_id = hru$id,
                        obj_id = NA,
                        frac = 1)
  
  rout_con <- connect_ids %>%
    rename(rtu_con_id = id_from, frac = flow_frc, obj_id = id_to) %>%
    bind_rows(., aqu_connect) %>% 
    arrange(rtu_con_id) %>% 
    mutate(id = 1:nrow(.)) %>%
    group_by(rtu_con_id) %>%
    mutate(order = 1:n()) %>%
    ungroup() %>%
    mutate(obj_typ = ifelse(obj_id > 0, 'ru', NA),
           obj_typ = ifelse(obj_id < 0 & obj_id >= -9999, 'sdc', obj_typ),
           obj_typ = ifelse(obj_id < -10000, 'res', obj_typ),
           obj_typ = ifelse(is.na(obj_id), 'aqu', obj_typ),
           obj_id  = ifelse(obj_typ == 'sdc', abs(obj_id), obj_id),
           obj_id  = ifelse(obj_typ == 'res', abs(obj_id) - 10000, obj_id),
           obj_id  = ifelse(obj_typ == 'aqu', 1, obj_id),
           hyd_typ = ifelse(obj_typ %in% c('ru', 'sdc', 'res'), 'tot', NA),
           hyd_typ = ifelse(obj_typ == 'aqu', 'rhg', hyd_typ)) %>%
    select(id, order, obj_typ, obj_id, hyd_typ, frac, rtu_con_id)
  
  if(all(c('cha_id', 'flow') %in% colnames(hru))) {
    if ('til' %in% hru$flow) {
      cha_ids <- read_sf(paste0(data_path, '/vector/cha.shp')) %>% 
        st_drop_geometry() %>% 
        select(id, id_sel) %>% 
        group_by(id_sel) %>% 
        summarise(id = id[1], .groups = 'drop') %>% 
        rename(cha_id = id_sel, obj_id = id)
      
      hru_drn <- hru %>% 
        st_drop_geometry() %>% 
        filter(flow == 'til') %>% 
        select(id, cha_id)
      
      rout_con_tile <- hru_drn %>% 
        left_join(., cha_ids, by = 'cha_id') %>% 
        select(-cha_id) %>% 
        rename(rtu_con_id = id) %>% 
        mutate(id = NA, order = NA, obj_typ = 'sdc', hyd_typ = 'til', frac = 1) %>% 
        select(id, order, obj_typ, obj_id, hyd_typ, frac, rtu_con_id)
      
      rout_con_drn <- filter(rout_con, rtu_con_id %in% hru_drn$id &
                               hyd_typ == 'tot')
      
      rout_con_drn <- bind_rows(mutate(rout_con_drn, hyd_typ = 'sur'),
                                mutate(rout_con_drn, hyd_typ = 'lat')) %>% 
        arrange(rtu_con_id, obj_id)
      
      rout_con <- rout_con %>% 
        filter(., ! id %in% rout_con_drn$id) %>% 
        bind_rows(rout_con_drn, rout_con_tile, .) %>% 
        arrange(., rtu_con_id) %>% 
        mutate(., id = 1:nrow(.)) %>%
        group_by(rtu_con_id) %>%
        mutate(., order = 1:n()) %>%
        ungroup()
    }
  }
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  dbWriteTable(db, 'rtu.rout_unit_con_out', rout_con, overwrite = TRUE)
  dbDisconnect(db)
}

## Build SWAT+ landscape unit inut files.
## The function writes the following tables into the intermediate data base
## - lsu.ls_unit_def
## - lsu.ls_unit_ele
## 
#' @param data_path Path of the project data folder
#'
build_ls_unit_input <- function(data_path) {
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  rout_unit_con <- dbReadTable(db, 'rtu.rout_unit_con')
  hru_con <- dbReadTable(db, 'hru.hru_con')
  dbDisconnect(db)
  
  ls_unit_def <- rout_unit_con %>%
    select(id, name, area)
  
  ls_unit_ele <- hru_con %>%
    select(id, name, area) %>%
    mutate(obj_typ = 'hru',
           obj_typ_no = id,
           bsn_frac = area / sum(area),
           sub_frac = 1.0,
           reg_frac = 0.0,
           ls_unit_def_id = id) %>%
    select(-area)
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  dbWriteTable(db, 'lsu.ls_unit_def', ls_unit_def, overwrite = TRUE)
  dbWriteTable(db, 'lsu.ls_unit_ele', ls_unit_ele, overwrite = TRUE)
  dbDisconnect(db)
}