## Analyze the calculated connections between land objects or water
## objects for infinite loop routing by walking through the connections
## starting from each spatial object and analyzing if any connection 
## returns to the initial connection.
## In the case of identified loop routing the routine writes the affected
## spatial objects into a geopackage for further analysis.
## 
#' @param connect_ids Table with the from-to object connectivities and the 
#'   respective net flow accumulations.
#' @param data_path Path of the project data folder
#' @param type String indicating if 'Land' or 'Water' objects are analyzed.
#' @param n_iter Number of iterations = length of the connections 
#'   which are analyzed.
#'
check_infinite_loops <- function(connect_ids, data_path, type ,n_iter = 50) {
  rout_ids <- select(connect_ids, id_from, id_to)
  
  if(file.exists(paste0(data_path, '/vector/', tolower(type), '_infinite_loops.gpkg'))) {
    suppressMessages(file.remove(paste0(data_path, '/vector/', tolower(type), '_infinite_loops.gpkg')))
  }
  
  rout_links <- list()
  cat('Analyzing', tolower(type) ,'objects for infinite loop routing:\n')
  t0 <- now()
  i <- 1
  ids <- unique(rout_ids$id_from)
  for (id in ids) {
    i_iter <- 1
    tbl <- filter(rout_ids, id_from == id)
    all_terminate <- FALSE
    
    while (!all_terminate & i_iter < 50) {
      tbl_to <- filter(rout_ids, id_from %in% tbl$id_to)
      tbl_to <- set_names(tbl_to, c(paste0('id_', i_iter), 'id_to'))
      tbl <- set_names(tbl, c('id' , paste0('id_', 1:i_iter)))
      tbl <- full_join(tbl, tbl_to, by = paste0('id_', i_iter)) %>%
        mutate(id_to = ifelse(id_to == id, -Inf, id_to))
      
      is_other_loop <- tbl %>% 
        pmap(., c) %>% 
        map_lgl(., ~ match_pair(.x))
      
      tbl <- mutate(tbl, id_to = ifelse(is_other_loop, Inf, id_to))
      
      i_iter <- i_iter + 1
      all_terminate <- all(tbl$id_to %in% c(NA, -Inf, Inf))
    }
    
    tbl <- set_names(tbl, c('id' ,paste0('id_', 1:i_iter))) %>%
      mutate(is_loop = rowSums(., na.rm = TRUE) == -Inf) #%>%
    # filter(., is_loop)
    tbl[tbl == -Inf] <- id
    
    rout_links[[paste0('id_', id)]] <- tbl
    
    display_progress(i, length(ids), t0, paste(type, 'object'))
    i <- i+1
  }
  
  finish_progress(length(ids), t0, paste(type, 'objects'))
  cat('\n')
  
  rout_links <- rout_links %>%
    bind_rows(.) %>%
    select(starts_with('id'), is_loop) %>%
    arrange(id)
  
  loop_ids <- rout_links %>% 
    # filter(is_circuit) %>% 
    filter(is_loop) %>%
    .$id %>% 
    unique(.)
  n_loop_ids <- length(loop_ids)
  
  if (n_loop_ids > 0) {
    cat(red('  \U2718 '), n_loop_ids, print_plural(paste(type, 'object'), n_loop_ids), 
        'identified where water is routed in loops.\n\n',
        ' You can resolve this issue in the following ways: \n\n')
    
    if(type == 'Land') {
      cat(
        " - Use the layer 'land_infinite_loops.gpkg' that was written to \n",
        '  ', data_path, '/vector','\n',
        '   to identify land polygons that cause the issue and split them',
        'to break the loops.\n',
        '   This would require to restart the entire model setup procedure!\n\n',
        " - Increase the value of 'frc_thres'.\n",
        '   This reduces the number of connections of each land unit (maybe undesired!)\n',
        '   and can remove the connections that route the water in loops.\n\n',
        ' - Continue with the model setup (only recommended for small number of identified units!).\n',
        "   The function 'resolve_loop_issues()' will then eliminate a certain number of connections."
      )
      hru <- read_sf(paste0(data_path, '/vector/hru.shp'))
      write_sf(filter(hru, id %in% loop_ids), 
               dsn = paste0(data_path, '/vector/land_infinite_loops.gpkg'),
               layer = 'land_infinite_loops')
      
    } else if (type == 'Water') {
      cat(
        " - Use the layer 'water_infinite_loops.gpkg' that was written to \n",
        '  ', data_path, '/vector','\n',
        '   to identify water objects that cause the issue.\n\n',
        " - Check the flow direction of channels to see if a wrong flow direction is the result of a loop.\n\n",
        ' - Check if reservoirs touch, or are accidentally split and cause loop routing.'
      )
      
      loop_ids <- rout_links %>% 
        filter(., is_loop) %>% 
        select(-is_loop) %>% 
        unlist() %>% 
        unique() %>% 
        .[!is.na(.)]
      
      
      if(any(loop_ids > 0)) {
        cha_ids <- loop_ids[loop_ids > 0]
        cha <- read_sf(paste0(data_path, '/vector/cha.shp'))
        
        write_sf(filter(cha, id %in% cha_ids), 
                 dsn = paste0(data_path, '/vector/water_infinite_loops.gpkg'),
                 layer = 'channel_infinite_loops')
      }
      
      if(any(loop_ids < 0)) {
        res_ids <- - loop_ids[loop_ids < 0]
        res <- read_sf(paste0(data_path, '/vector/res.shp'))
        
        write_sf(filter(res, id %in% res_ids), 
                 dsn = paste0(data_path, '/vector/water_infinite_loops.gpkg'),
                 layer = 'reservoir_infinite_loops')
      }
    }
  } else {
    cat(green('  \U2714 '), 'No infinite loops identified.\n')
  }
  
  if (type == 'Land') {
    db_path <- paste0(data_path, '/tables.sqlite')
    db <- dbConnect(SQLite(), db_path)
    dbWriteTable(db, 'connect_ids_reduced', connect_ids, overwrite = TRUE)
    dbWriteTable(db, 'rout_links', rout_links, overwrite = TRUE)
    dbDisconnect(db)
  } else {
    cha_order <- rout_links %>% 
      select(-is_loop) %>% 
      map2_df(., 1:ncol(.), ~ tibble(id = unique(.x), order = .y)) %>% 
      filter(., id > 0 & !is.na(id)) %>% 
      group_by(id) %>% 
      summarise(order = max(order)) %>% 
      mutate(order = order / max(order))
    
    db_path <- paste0(data_path, '/tables.sqlite')
    db <- dbConnect(SQLite(), db_path)
    dbWriteTable(db, 'cha.order', cha_order, overwrite = TRUE)
    dbDisconnect(db)
  }
}

## Identify if the pattern of a connection was already found before in this 
## connection chain. This is used to remove connection duplicates and reduce
## the number of analyzed connections.
## 
#' @param vct Numeric vector of object ids in a connection chain.
#' 
match_pair <- function(vct) {
  pair <- vct[(length(vct) - 1):length(vct)]
  if(any(pair %in% c(NA, - Inf, Inf))) {
    is_match <- FALSE
  } else {
    pairs_match <- map2(vct[1:(length(vct) - 2)], 
                        vct[2:(length(vct) - 1)], c) %>% 
      map(., ~ .x == pair) %>% 
      map_lgl(., all)
    if(any(pairs_match)) {
      is_match <- TRUE
    } else {
      is_match <- FALSE
    }
  }
  return(is_match)
}

## Function to try to resolve infinite loops that occur in the routing
## between land objects. 
## The routine filters all connections between land objects that occur
## in the identified infinite loops, ranks them based on lowest connection
## fraction, number of occurrences in all infinite loops and area of the 
## object that routes (to prefer smaller objects for removing connections).
## Connections are removed iteratively until no infinite loop remains.
## If a routing fraction is < 1 (object also routes to other objects) a
## connection can be removed.
## If a fraction is 1 (the object has only this connection) removing this 
## connection is skipped. 
## If the routine cannot resolve all infinite loops without removing 
## connections with a fraction = 1 then an error is triggered and the
## issues have to be resolved manually in the land input layer.
## 
## The routine returns the cleaned connections of the land objects. 
## 
#' @param data_path Path of the project data folder
#'
resolve_loop_issues <- function(data_path) {
  hru <- read_sf(paste0(data_path, '/vector/hru.shp')) %>% 
    mutate(area = st_area(.) %>% set_units(., ha) %>% as.numeric(.))
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  connect_ids <- dbReadTable(db, 'connect_ids_reduced')
  rout_links  <- dbReadTable(db, 'rout_links')
  dbDisconnect(db)
  
  rout_links_loop <- filter(rout_links,is_loop != 0) 
  connect_ids <- connect_ids %>% 
    mutate(from_to = paste0(id_from, ',', id_to))
  connect_resolve <- list(removed = tibble(id_from  = integer(),
                                           id_to    = integer(),
                                           flow_frc = numeric(),
                                           from_to  = character()))
  connect_resolve$skipped <- connect_resolve$removed
  
  if (nrow(rout_links_loop) > 0) {
    cat('Trying to resolve the identified infinite loops by removing connections...\n')
    
    while (nrow(rout_links_loop) > 0) {
      rout_link_seq <- rout_links_loop %>% 
        select(-is_loop) %>% 
        apply(., 1, paste, collapse = ',')
      
      links <- rout_links_loop %>% 
        mutate(is_loop = NA) %>% 
        as.matrix() %>% 
        t() %>% 
        as.vector()
      
      id_from_to <- map2(c(NA, links), c(links, NA), 
                         ~c(id_from = .x, id_to = .y)) %>% 
        bind_rows() %>% 
        filter(!is.na(id_from) & !is.na(id_to)) %>% 
        distinct() %>% 
        mutate(from_to = paste0(id_from, ',', id_to),
               n = count_pattern(from_to, rout_link_seq)) %>% 
        left_join(., connect_ids, by = c("id_from", "id_to", 'from_to')) %>% 
        left_join(., select(hru, id, area), by = c("id_from" = "id")) %>% 
        mutate(w_frc  = 1 - flow_frc,
               w_n    = n / (5*max(n)), # limit weight for n between 0, 0.2
               w_area = 0.2*(1 - (area/max(area)))) %>% # limit weight for area between 0, 0.2
        arrange(desc(w_frc + w_n + w_area))
      
      from_to_rmv <- paste(id_from_to$id_from[1], id_from_to$id_to[1], sep = ',')
      
      is_in_seq <- str_detect(rout_link_seq, from_to_rmv)
      
      if (id_from_to$flow_frc[1] < 1) {
        rmv_status <- green('  \U2714 ')
        frc_info   <- paste0('(fraction = ', round(id_from_to$flow_frc[1], 3),')')
        connect_resolve$removed <- bind_rows(connect_resolve$removed,
                                             filter(connect_ids, from_to == from_to_rmv))
        connect_ids <- filter(connect_ids, from_to != from_to_rmv)
        connect_ids <- connect_ids %>% 
          group_by(id_from) %>%
          mutate(flow_frc = flow_frc / sum(flow_frc)) %>%
          arrange(id_from) %>% 
          ungroup(.)
      } else {
        rmv_status <- red('  \U2718 ')
        frc_info   <- paste0('(skipped because fraction = ', 
                             round(id_from_to$flow_frc[1], 3),')')
        connect_resolve$skipped <- bind_rows(connect_resolve$skipped,
                                             filter(connect_ids, from_to == from_to_rmv))
        # Current workaround will be removed later
        connect_ids <- filter(connect_ids, from_to != from_to_rmv)
        connect_ids <- connect_ids %>% 
          group_by(id_from) %>%
          mutate(flow_frc = flow_frc / sum(flow_frc)) %>%
          arrange(id_from) %>% 
          ungroup(.)
      }
      
      cat(rmv_status, 'Removing connection ID', 
          sprintf('%5d', id_from_to$id_from[1]), 'to ID', 
          sprintf('%5d', id_from_to$id_to[1]), frc_info ,'\n')
      
      rout_link_seq <- rout_link_seq[!is_in_seq]
      rout_links_loop <- rout_links_loop[!is_in_seq, ]
    }
    
    cat('\n')
    
    n_rmv <- nrow(connect_resolve$removed)
    n_skp <- nrow(connect_resolve$skipped)
    
    if(n_rmv > 0) {
      cat(n_rmv, print_plural('connection', n_rmv), 'removed. \n',
          "The land units for which connections were removed were written into the layer \n",
          "'removed_connection' in the file 'resolve_loops.gpkg' saved in \n",
          paste0(data_path, '/vector'))
      
      ids_removed <- unique(c(connect_resolve$removed$id_from,
                              connect_resolve$removed$id_to))
      hru_removed <- filter(hru, id %in% ids_removed)
      write_sf(hru_removed, 
               dsn = paste0(data_path, '/vector/resolve_loops.gpkg'),
               layer = 'removed_connection')
      
    }
    
    if(nrow(connect_resolve$skipped) > 0) {
      cat('\n\n')
      cat(n_skp, print_plural('connection', n_skp), 
          'cannot be removed as it would create land units without connections. \n',
          "The land units that caused the issue were written into the layer \n",
          "'skipped_connection' in the file 'resolve_loops.gpkg' saved in \n",
          paste0(data_path, '/vector'), '\n',
          'These issues have to be resolved manually in the land input layer!')
      ids_skipped <- unique(c(connect_resolve$skipped$id_from,
                              connect_resolve$skipped$id_to))
      hru_skipped <- filter(hru, id %in% ids_skipped)
      write_sf(hru_skipped, 
               dsn = paste0(data_path, '/vector/resolve_loops.gpkg'),
               layer = 'skipped_connection')
      cat('\n')
      # stop('Cannot resolve all infinite loop issues!')
    }
  }
  
  connect_ids <- select(connect_ids, - from_to)
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  dbWriteTable(db, 'rtu.connect_ids', connect_ids, overwrite = TRUE)
  dbDisconnect(db)
}

## Count in how many of the 'sequences' the 'pattern' can be found.
## 
#' @param pattern Text string with pattern of 'from_id,to_id'.
#' @param sequences Text string with id sequences in the connectivity
#'
count_pattern <- function(pattern, sequences) {
  map(pattern, ~str_detect(sequences, .x)) %>% 
    map_int(.,sum)
}