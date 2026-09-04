## Prepare raster layers based on the DEM and the surface channel objects 
## that will be used in the calculation of the land object connectivity.
## The routine writes the prepared raster layer into the raster folder 
## of the project.
##  
#' @param data_path Path of the project data folder
#'
prepare_terrain_land <- function(data_path) {
  dem_path <- paste0(data_path, '/raster/dem.tif')
  dem_fill_brch_path <- paste0(data_path, '/raster/dem_fill_brch.tif')
  dem_watr_burn_path <- paste0(data_path, '/raster/dem_watr_burn.tif')
  
  dem_res <- mean(res(dem))
  
  wbt_fill_single_cell_pits(dem = dem_path,
                            output = dem_fill_brch_path)
  wbt_breach_depressions_least_cost(dem = dem_fill_brch_path,
                                    output = dem_fill_brch_path,
                                    dist = ceiling(20/dem_res),
                                    fill = TRUE)
  
  wbt_fill_depressions_wang_and_liu(dem = dem_fill_brch_path,
                                    output = dem_fill_brch_path)
  
  dem <- rast(dem_fill_brch_path)
  dem_res <- mean(res(dem))
  
  vct_files <- list.files(paste0(data_path, '/vector'))
  
  if('cha.shp' %in% vct_files) {
    cha <- read_sf(paste0(data_path, '/vector/cha.shp')) %>% 
      filter(., type == 'cha')
    
    write_sf(cha, paste0(data_path, '/vector/cha_surf.shp'))
    
    cha_buf <- st_buffer(cha, 0.5*dem_res) %>%
      mutate(., id = - id)
    cha_rst <- rasterize(vect(cha_buf), dem, 'id')
    writeRaster(cha_rst, 
                paste0(data_path, '/raster/cha_id_buffer_rst.tif'),
                overwrite = TRUE)
    
    cha_burn <- !is.na(cha_rst)
    cha_burn <- -20*cha_burn
    dem <- dem + cha_burn
  }
  
  if('res.shp' %in% vct_files) {
    res  <- read_sf(paste0(data_path, '/vector/res.shp'))
    res_rst <- rasterize(vect(res), dem, 'id')
    writeRaster(res_rst, paste0(data_path, '/raster/res_id_rst.tif'), 
                overwrite = TRUE)
    res_burn <- !is.na(res_rst)
    res_burn <- -20*res_burn
    dem <- dem + res_burn
  }
  
  writeRaster(dem, dem_watr_burn_path, overwrite = TRUE)
  wbt_reclass(dem_watr_burn_path, dem_watr_burn_path,
              reclass_vals = "-10;9999999;9999999")
  
  fpnt_path <- paste0(data_path, '/raster/fpnt_dem_watr_burn.tif')
  flac_path <- paste0(data_path, '/raster/flac_dem_watr_burn.tif')
  
  wbt_d8_pointer(dem_watr_burn_path, fpnt_path)
  wbt_d8_flow_accumulation(dem_watr_burn_path, flac_path)
}

## Calculate the land object connectivity. The routine uses the prepared
## flow accumulation and the flow pointer that were derived from the DEM 
## with the surface channels and the reservoirs burnt in and iterates
## over all land object IDs to calculate the net flux fractions between 
## the land objects and the water objects.
##  
#' @param data_path Path of the project data folder
#'
calculate_land_connectivity <- function(data_path) {
  fpnt <- rast(paste0(data_path, '/raster/fpnt_dem_watr_burn.tif'))
  flac <- rast(paste0(data_path, '/raster/flac_dem_watr_burn.tif'))
  
  dem_res <- mean(res(fpnt))
  
  hru <- read_sf(paste(paste0(data_path, '/vector/hru.shp')))
  if (!'cha_id' %in% names(hru)) {
    hru$cha_id <- NA_integer_
    hru$flow <- NA_character_
  }
  id_rst <- rasterize(vect(hru), fpnt, 'id')
  
  vct_files <- list.files(paste0(data_path, '/vector'))
  
  if('cha.shp' %in% vct_files) {
    cha_rst <- rast(paste0(data_path, '/raster/cha_id_buffer_rst.tif'))
    id_rst  <- cover(cha_rst, id_rst)
  }
  
  if('res.shp' %in% vct_files) {
    res_rst <- rast(paste0(data_path, '/raster/res_id_rst.tif'))
    res_rst <- -1e4 - res_rst
    id_rst  <- cover(id_rst, res_rst)
  }
  
  id_iter <- hru$id
  
  id_rst_i_path <- paste0(data_path, '/raster/id_rst_i.tif')
  id_pnt_i_path <- paste0(data_path, '/raster/id_pnt_i.tif')
  
  connect_ids <- list()
  cat('Calculating land object connectivity:\n')
  t0 <- now()
  for (i in id_iter) {
    if(hru$flow[i] %in% c(NA, 'til')) {
      hru_mask_i <- hru %>%
        filter(., id == i) %>%
        select(.) %>%
        st_buffer(., dist = 5*dem_res) %>%
        vect(.)
      
      id_rst_i <- id_rst %>%
        crop(., hru_mask_i, mask = TRUE)
      
      flac_i <- flac %>%
        crop(., hru_mask_i, mask = TRUE)
      
      fpnt_i <- fpnt %>%
        crop(., hru_mask_i, mask = TRUE)
      
      dim_mtx <- dim(id_rst_i)
      
      id_mtx <- values(id_rst_i) %>%
        matrix(., nrow = dim_mtx[2], ncol = dim_mtx[1])
      
      if(i %in% id_mtx) {
        fpnt_mtx <- values(fpnt_i) %>%
          matrix(., nrow = dim_mtx[2], ncol = dim_mtx[1])
        flac_mtx <- values(flac_i) %>%
          matrix(., nrow = dim_mtx[2], ncol = dim_mtx[1])
        writeRaster(id_rst_i, id_rst_i_path, overwrite = TRUE)
        id_pnt_i <- id_rst_i
        values(id_pnt_i)[values(id_pnt_i) == i] <- 2^15 - 1 # Just used the 16bit signed max value here
        
        writeRaster(id_pnt_i, id_pnt_i_path, overwrite = TRUE)
        wbt_d8_pointer(id_pnt_i_path, id_pnt_i_path) %>% 
          capture.output(., file='NULL')
        
        invisible(file.remove('NULL'))
        
        id_pnt_i <- rast(id_pnt_i_path)
        
        id_pnt_mtx <- values(id_pnt_i) %>%
          matrix(., nrow = dim_mtx[2], ncol = dim_mtx[1])
        id_pnt_mtx[id_mtx != i] <- NA
        id_pnt_mtx[id_pnt_mtx == 0] <- NA
        id_pnt_mtx[!is.na(id_pnt_mtx)] <- 1
        
        
        connect_ids[[as.character(i)]] <- find_drain_id(id_mtx, id_pnt_mtx, flac_mtx, fpnt_mtx, i)
        
      } else {
        cat('\nObject with id: ', i, 'too small! Skipped in land connectivity calculation. \n')
        connect_ids[[as.character(i)]] <- tibble(id_from = NULL,
                                                 id_to   = NULL,
                                                 flow_acc = NULL)
      }
    } else if (!is.na(hru$cha_id[i]) & hru$flow[i] == 'tot') {
      connect_ids[[as.character(i)]] <- tibble(id_from = i,
                                               id_to = - hru$cha_id[i],
                                               flow_acc = 1)
    }
    display_progress(i, length(id_iter), t0, 'Land object')
  }
  
  connect_ids <- bind_rows(connect_ids)
  
  finish_progress(length(id_iter), t0, 'Land objects')
  
  cat('\nCleaning up land object connectivities...\n')
  
  i <- 1
  n_entry <- nrow(connect_ids)
  
  while (i <= n_entry) {
    i_match <- which(connect_ids$id_from == connect_ids$id_to[i] &
                       connect_ids$id_to == connect_ids$id_from[i])
    if(length(i_match) == 1) {
      if(connect_ids$flow_acc[i] > connect_ids$flow_acc[i_match]) {
        connect_ids$flow_acc[i] <- connect_ids$flow_acc[i] - connect_ids$flow_acc[i_match]
        connect_ids <- connect_ids[-i_match,]
        if(i_match != i + 1) {
          i <- i + 1
        }
      } else if (connect_ids$flow_acc[i] < connect_ids$flow_acc[i_match]) {
        connect_ids$flow_acc[i_match] <- connect_ids$flow_acc[i_match] - connect_ids$flow_acc[i]
        connect_ids <- connect_ids[-i,]
      } else {
        connect_ids <- connect_ids[-i_match,]
        connect_ids <- connect_ids[-i,]
      }
      n_entry <- nrow(connect_ids)
    } else if (length(i_match) > 1) {
      stop('More than 1 row with a match found!')
    } else {
      i <- i + 1
    }
  }
  
  cat(green('  \U2714 '), 'Done!')
  cat('\n\n')
  cat("Analyzing land objects for 'sink units':\n")
  id_no_conn <- id_iter[!id_iter %in% unique(connect_ids$id_from)]
  n_no_conn  <- length(id_no_conn)
  
  if(n_no_conn > 0) {
    cat(red('  \U2718 '), n_no_conn, print_plural('land object', n_no_conn), 'with no connections identified. \n\n',
        " The identified units are sinks and do not further route receiving water!\n",
        " The connections of these units have to be resolved manually.\n",
        ' You can resolve this issue in the following ways: \n\n',
        " - Edit the land input layer and adjust the boundaries of these units to better \n",
        "   fit the flow accumulation and the flow pointer.\n\n",
        " - Add additional connections manually (routine for that will be implemented soon).\n\n",
        " - Leave units unconnected. Some land objects may be actual sinks in the landscape.\n\n",
        " Use the layer 'land_no_connection.gpkg' that was written to \n",
        ' ', paste0(data_path, '/vector'),'\n',
        " together with the layers 'flac_dem_watr_burn.tif', 'fpnt_dem_watr_burn.tif' \n",
        " and the DEM 'dem_watr_burn.tif' which were saved in\n",
        ' ', paste0(data_path, '/raster'), '\n',
        ' to analyze the sink land objects.')
    
    hru_no_conn <- filter(hru, id %in% id_no_conn)
    write_sf(hru_no_conn, 
             dsn = paste0(data_path, '/vector/land_no_connection.gpkg'),
             layer = 'no_connection')
    
  } else {
    cat(green('  \U2714 '), 'No sink land objects identified.\n')
  }
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  dbWriteTable(db, 'connect_ids', connect_ids, overwrite = TRUE)
  dbDisconnect(db)
}

## Identify the ids and calculate their flow_accumulation sums for the
## objects to which a land object drains its water based on its flow 
## accumulation and its flow pointer.
## 
#' @param id_mtx id matrix created from the neighborhood raster of object i
#' @param bnd_mtx borderline matrix created from the border raster of object i
#' @param acc_mtx flow accumulation matrix for object i
#' @param pnt_mtx flow pointer matrix for object i
#' @param id_i Numeric value that gives the id value of object i
#'
find_drain_id <- function(id_mtx, bnd_mtx, acc_mtx, pnt_mtx, id_i) {
  n_r <- nrow(id_mtx)
  id  <- which(!is.na(bnd_mtx))
  to_ids  <- c()
  flac <- c()
  for(i in id) {
    sub <- ind2sub(i, n_r)
    pnt_dir <- pnt_mtx[sub[1], sub[2]]
    if(!is.na(pnt_dir)) {
      sub_pnt <- select_point_sub(pnt_mtx[sub[1], sub[2]], sub)
      to_ids <- c(to_ids, id_mtx[sub_pnt[1], sub_pnt[2]])
      flac <- c(flac, acc_mtx[sub[1], sub[2]])
    }
  }
  tbl <- tibble(id_to = to_ids, flow_acc = flac) %>%
    filter(id_to != id_i) %>%
    group_by(id_to) %>%
    summarise(flow_acc = sum(flow_acc)) %>%
    ungroup() %>%
    add_column(., id_from = id_i, .before = 1)
  return(tbl)
}

## Identify the coordinates to where current position points based on the 
## current matrix coordinates their pointer direction value.
## 
#' @param pnt_i Numeric value of D8 pointer direction
#' @param sub Vector of length 2, row and col index of matrix
#'
select_point_sub <- function(pnt_i, sub) {
  if (pnt_i == 1)   sub <- c(sub[1] + 1, sub[2] - 1)
  if (pnt_i == 2)   sub <- c(sub[1] + 1, sub[2])
  if (pnt_i == 4)   sub <- c(sub[1] + 1, sub[2] + 1)
  if (pnt_i == 8)   sub <- c(sub[1]    , sub[2] + 1)
  if (pnt_i == 16)  sub <- c(sub[1] - 1, sub[2] + 1)
  if (pnt_i == 32)  sub <- c(sub[1] - 1, sub[2])
  if (pnt_i == 64)  sub <- c(sub[1] - 1, sub[2] - 1)
  if (pnt_i == 128) sub <- c(sub[1]    , sub[2] - 1)
  return(sub)
}

## Conversion of index value to matrix row column coordinates
## 
#' @param ind Numeric value of vector index
#' @param n_r Numeric value, number of rows of the matrix
#'
ind2sub <- function(ind, n_r) {
  r <- ind%%n_r
  if (r == 0 ) r <- n_r
  c <- ceiling(ind/n_r)
  return(c(r,c))
}

## Reduce the number of connections between land objects. 
## Remove connectivities with connectivity fractions lower than frc_thres.
## This is necessary, because keeping all connectivities between objects 
## increases the risk of circuit routing (water is routed in circle without
## ever ending up in channel or reservoir). In tests frc_thres was set 0.1
## and connections with less than 10% of the total amount are removed.
## 
#' @param data_path Path of the project data folder
#' @param frc_thres Fraction threshold to remove connections with a 
#'   relative share of connectivity lower than the threshold value.
#'
reduce_land_connections <- function(data_path, frc_thres) {
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  connect_ids <- dbReadTable(db, 'connect_ids')
  dbDisconnect(db)
  
  connect_ids %>%
    group_by(id_from) %>%
    mutate(flow_frc = flow_acc / max(flow_acc)) %>%
    filter(flow_frc >= frc_thres) %>%
    mutate(flow_frc = flow_acc / sum(flow_acc)) %>%
    arrange(id_from) %>% 
    ungroup(.) %>% 
    select(-flow_acc)
}