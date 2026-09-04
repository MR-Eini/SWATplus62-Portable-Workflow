## Check the water object connectivity. The routine identifies any issues
## with the connectivity between channel and reservoir objects. 
## The function prompts check messages in the command line. If issues
## were identified respective channel and reservoir layers are written 
## into the vector data path in 'water_connectivity_issues.gpkg'
## 
#' @param cha Vector layer of the channels
#' @param data_path Character string, path to the project data folder
#' @param id_cha_out Integer value, if set the respective channel unit
#'   is considered as the end unit of the water object network
#' @param id_res_out Integer value, if set the respective reservoir unit
#'   is considered as the end unit of the water object network
#'
check_cha_res_connectivity <- function(data_path, id_cha_out, id_res_out) {
  if(c(id_cha_out, id_res_out) == 0) {
    stop('Either a channel or a reservoir must be defined as the ',
         'catchment outlet!')
  }
  
  cat('Preparing channel and reservoir features...\n')
  water_obj <- prepare_water_objects(paste0(data_path, '/vector'))
  cha <- water_obj$cha
  res <- water_obj$res
  cha_exist <- !is.null(cha)
  res_exist <- !is.null(res)
  
  if(!cha_exist & !res_exist) {
    stop('No water objects (channels or reservoirs provided in the model',
         'setup! At least one of those must be provided.')
  }
  
  if(length(id_cha_out) > 0 & !cha_exist) {
    stop('Channel with the ID ', id_res_out, ' was defined as catchment',
         ' outlet, but model setup does not have any channels!')
  }
  if(length(id_res_out) > 0 & !res_exist) {
    stop('Reservoir with the ID ', id_res_out, ' was defined as catchment',
         ' outlet, but model setup does not have any reservoirs!')
  }
  
  cha_out_exist <- id_cha_out %in% cha$id_sel 
  res_out_exist <- id_res_out %in% res$id_sel
  
  if(any(!c(cha_out_exist, res_out_exist))) {
    stop('Defined outlet ID (id_cha_out or id_res_out) not found in ',
         'the channel and reservoir object layers!')
  }
  
  i_cha_out <- which(cha$id_sel == id_cha_out)
  i_res_out <- which(res$id_sel == id_res_out)
  
  cat(green('  \U2714 '), 'OK!\n')
  
  if (cha_exist) {
    pnt_buf_dist  <- 1e-1
    
    cat('Analyzing connectivity of water object network...\n')
    
    cha_pnt <- get_line_endpoints(cha)
    write_shp(cha_pnt$start, 'cha_pnt_start', paste0(data_path, '/vector/'))
    write_shp(cha_pnt$end, 'cha_pnt_end', paste0(data_path, '/vector/'))
    cha_pnt <- map(cha_pnt, ~ st_buffer(.x, pnt_buf_dist))
    
    cha_not_con_cha <- st_intersects(cha_pnt$end, cha_pnt$start) %>% 
      map_lgl(., ~ length(.x) == 0)
    
    if(res_exist) {
      res_buf_dist  <- 1e-3
      res_buf <- st_buffer(res, res_buf_dist)
      
      cha_not_con_res <- st_intersects(cha_pnt$end, res_buf) %>% 
        map_lgl(., ~ length(.x) == 0)
      res_has_influx  <- st_intersects(res, cha_pnt$end) %>% 
        map_lgl(., ~ length(.x) > 0)
      
      res_no_outflux <- st_intersects(res, cha_pnt$start) %>% 
        map_lgl(., ~ length(.x) == 0)
      
      res_influx_no_outflux <- res_has_influx & res_no_outflux
      res_influx_no_outflux[i_res_out] <- FALSE
      
      is_res_disco <- which(res_influx_no_outflux)
      n_res_disco <- length(is_res_disco)
      has_res_disco <- n_res_disco > 0
      
      cha_not_conn <- cha_not_con_cha & cha_not_con_res
    } else {
      cha_not_conn <- cha_not_con_cha
      has_res_disco <- FALSE
    }
    
    cha_not_conn[i_cha_out] <- FALSE
    
    is_cha_disco <- which(cha_not_conn)
    n_cha_disco <- length(is_cha_disco)
    has_cha_disco <- n_cha_disco > 0
    
    if(has_cha_disco) {
      cat(red('  \U2718 '), n_cha_disco, print_plural('channel segment', n_cha_disco), 
          'identified not connected to other channels or reservoirs.\n')
      write_sf(cha[is_cha_disco, ], 
               dsn = paste0(data_path, '/vector/', 'water_connectivity_issues.gpkg'),
               layer = 'disconnected_channels')
    } else {
      cat(green('  \U2714 '), 'No disconnected channels identified.\n')
    }
    
    if(has_res_disco) {
      cat(red('  \U2718 '), n_res_disco, print_plural('reservoir', n_res_disco), 
          'identified to be not connected to other channels or reservoirs.\n\n')
      write_sf(res[is_res_disco, ], 
               dsn = paste0(data_path, '/vector/', 'water_connectivity_issues.gpkg'),
               layer = 'disconnected_reservoirs')
    } else {
      cat(green('  \U2714 '), 'No disconnected reservoirs identified.\n\n')
    }
    # Return error message that lists all identified polygons if any found
    has_issue <- c(has_cha_disco, has_res_disco)
    if(any(has_issue)) {
      stop('\n\nConnectivity issues for the water objects identified!\n\n',
           'Writing the layer ', 'water_connectivity_issues.gpkg',
           " into '", data_path, '/vector', "'\n\n",
           'Load the .gpkg layer in a GIS to analyze the features that cause issues. \n',
           'Fix the issues in the ', 'land and channel layers before ',
           'proceeding with the model setup.'
      )
    } else {
      cat('\n', green(' \U2714 '), 'Water object connectivity check successful! \n\n')
      write_shp(cha, 'cha', paste0(data_path, '/vector/'))
      if(res_exist) {
        write_shp(res, 'res', paste0(data_path, '/vector/'))
      }
    }
  } else {
    cat('No connectivity checks required. There are no channel objects!\n')
    write_shp(res, 'res', paste0(data_path, '/vector/'))
  }
}

## Prepare channel and reservoir objects for the generation of the water
## object network. The reservoir and the channel layer attribute tables 
## are restructured to have an id from 1 to nrow(.) and keeping the 
## initial object ids as 'id_sel', also object names and empty gis_id are
## added.
## 
#' @param data_path Character string, path to the project data folder
#'
prepare_water_objects <- function(vct_path) {
  vct_files <- list.files(vct_path)
  
  if('res.shp' %in% vct_files) {
    res  <- read_sf(paste(vct_path, 'res.shp', sep = '/'))
    if (! 'id_sel' %in% names(res)) {
      res <- res %>%
        rename(id_sel = id) %>%
        select(-type) %>%
        mutate(id = 1:nrow(.),
               name = create_names(id, 'res'),
               gis_id = NA,
               .before = 1)
      # write_sf(res, paste(vct_path, 'res.shp', sep = '/'))
    }
  } else {
    res <- NULL
  }
  
  if('channel.shp' %in% vct_files) {
    cha  <- read_sf(paste(vct_path, 'channel.shp', sep = '/'))
    if (! 'id_sel' %in% names(cha)) {
      cha <- cha %>%
        rename(id_sel = id)
      
      if(!is.null(res)) {
        cha <- cha %>% 
          st_split(., res) %>%
          st_collection_extract(., "LINESTRING")
        is_cha_in_res <- st_within(cha, st_buffer(res, dist = 1), 
                                   sparse = F) %>%
          apply(., 1, any)
        cha <- cha[!is_cha_in_res,]
      }
      
      cha <- cha %>%
        mutate(id = 1:nrow(.),
               name = create_names(id, 'cha'),
               gis_id = NA, #1:nrow(.),
               .before = 1)
      # write_sf(cha, paste(vct_path, 'cha.shp', sep = '/'))
    }
  } else {
    cha <- NULL
  }
  return(list(cha = cha,
              res = res))
} 

## Calculate the water object connectivity. The routine identifies the 
## connections between channel and reservoir objects. It propagates from
## the catchment outlet object backwards to link all objects of the 
## network. The modeler has to provide either the id of the final channel
## or the final reservoir object (initial ids of the input layers channel
## or land). 
## The routine returns a list with the 'chandeg_con_out' and the
## 'reservoir_con_out' tables
## 
#' @param vct_path Character string, path to the project vector files
#' @param id_cha_out Integer value, if set the respective channel unit
#'   is considered as the end unit of the water object network
#' @param id_res_out Integer value, if set the respective reservoir unit
#'   is considered as the end unit of the water object network
#'
build_water_object_connectivity <- function(data_path) {
  vct_files <- list.files(paste0(data_path, '/vector'))
  cha_exist <- 'cha.shp' %in% vct_files
  res_exist <- 'res.shp' %in% vct_files
  res_buf_dist  <- 1e-3
  pnt_buf_dist  <- 1e-1
  
  if(cha_exist) {
    cha  <- read_sf(paste0(data_path, '/vector/cha.shp'))
    
    cha_pnt <- get_line_endpoints(cha) %>% 
      map(., ~ st_buffer(.x, pnt_buf_dist))
    
    cha_con_cha <- st_intersects(cha_pnt$end, cha_pnt$start) %>% 
      map2_df(., cha$id, ~ tibble(chandeg_con_id = .y, 
                                  obj_typ = 'sdc',
                                  obj_id = .x))
    
    if(res_exist) {
      res  <- read_sf(paste0(data_path, '/vector/res.shp'))
      res_buf <- st_buffer(res, res_buf_dist)
      
      cha_con_res <- st_intersects(cha_pnt$end, res_buf) %>% 
        map2_df(., cha$id, ~ tibble(chandeg_con_id = .y, 
                                    obj_typ = 'res',
                                    obj_id = .x))
      
      res_con_cha <- st_intersects(res_buf, cha_pnt$start) %>% 
        map2_df(., res$id, ~ tibble(reservoir_con_id = .y, 
                                    obj_typ = 'sdc',
                                    obj_id = .x))
      res_con_res <- st_intersects(res_buf, res_buf, remove_self = TRUE) %>% 
        map2_df(., res$id, ~ tibble(reservoir_con_id = .y, 
                                    obj_typ = 'res',
                                    obj_id = .x))
      
      chandeg_con_out <- bind_rows(cha_con_cha, cha_con_res) %>% 
        generate_con_out(.)
      reservoir_con_out <- bind_rows(res_con_cha, res_con_res) %>% 
        generate_con_out(.)
      
      db_path <- paste0(data_path, '/tables.sqlite')
      db <- dbConnect(SQLite(), db_path)
      dbWriteTable(db, 'cha.chandeg_con_out', chandeg_con_out, overwrite = TRUE)
      dbWriteTable(db, 'res.reservoir_con_out', reservoir_con_out, overwrite = TRUE)
      dbDisconnect(db)
      
    } else {
      chandeg_con_out <- generate_con_out(cha_con_cha)
      
      db_path <- paste0(data_path, '/tables.sqlite')
      db <- dbConnect(SQLite(), db_path)
      dbWriteTable(db, 'cha.chandeg_con_out', chandeg_con_out, overwrite = TRUE)
      dbDisconnect(db)
    }
  }
}

## Prepare id_from and id_to links for the water objects to be used in 
## the infinite loops check for water objects.
## 
#' @param data_path List of tables with cha and res con_out tables
#'
prepare_water_links <- function(data_path) {
  cha_res_con <- list()
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  db_tbls <- dbListTables(db)
  if('cha.chandeg_con_out' %in% db_tbls) { 
    cha_res_con$chandeg_con_out <- dbReadTable(db, 'cha.chandeg_con_out')
  }
  if('res.reservoir_con_out' %in% db_tbls) { 
    cha_res_con$reservoir_con_out <- dbReadTable(db,'res.reservoir_con_out')
  }
  dbDisconnect(db)
  
  has_obj_con <- map_lgl(cha_res_con, ~ !is.null(.x))
  
  obj_typ<- c('sdc', 'res')[has_obj_con]
  
  cha_res_con[has_obj_con] %>% 
    map2(., obj_typ, ~ mutate(.x, obj_from = .y, .before = 1)) %>% 
    map(., ~ select(.x, obj_from, ends_with('con_id'), obj_typ, obj_id)) %>%
    map_df(., ~set_names(.x, c('obj_from', 'id_from', 'obj_to', 'id_to'))) %>% 
    mutate(id_from = ifelse(obj_from == 'res', -id_from, id_from),
           id_to = ifelse(obj_to == 'res', -id_to, id_to)) %>% 
    select(id_from, id_to)
}

## Generate con_out tables from the connectivity link tables.
## The connectivity link tables are translated into the SWAT input table 
## format of *_con_out tables.
## 
#' @param con_tbl Connectivity link table
#'
generate_con_out <- function(con_tbl) {
  con_tbl %>%
    group_by(.[1]) %>% 
    mutate(hyd_typ = 'tot',
           order   = 1:n(),
           frac    = 1/max(order)) %>%
    ungroup() %>%
    arrange(.[1], .[5]) %>%
    mutate(id = 1:nrow(.)) %>%
    select(id, order, obj_typ, obj_id, hyd_typ, frac, everything())
}