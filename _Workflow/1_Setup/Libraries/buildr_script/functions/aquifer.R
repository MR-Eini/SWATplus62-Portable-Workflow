## Build the SWAT+ aquifer input files for a single aquifer for the 
## entire catchment.
## The function writes the following tables into the intermediate data base:
## - aqu.aquifer_con
## - aqu.aquifer_aqu
## 
#' @param data_path Path of the project data folder
#' 
build_single_aquifer_files <- function(data_path) {
  
  aqu <- read_sf(paste0(data_path, '/vector/hru.shp')) %>% 
    summarise(., id = id[1]) %>% 
    sf_remove_holes()
  
  cmt_area <- st_area(aqu) %>% 
    set_units(., 'ha') %>% 
    as.numeric() %>% 
    sum()
  
  dem <- rast(paste0(data_path, '/raster/dem.tif'))
  
  aqu_elev <- zonal(dem, vect(aqu), 'mean')[[1]]
  
  aquifer_con <- aqu %>% 
    mutate(name   = 'aqu1',
           gis_id = NA_integer_,
           area   = cmt_area) %>% 
    add_latlon(.) %>% 
    st_drop_geometry(.) %>%
    mutate(
      elev   = aqu_elev,
      wst_id = NA_integer_,
      cst_id = NA_integer_,
      ovfl   = 0L,
      rule   = 0L,
      aqu_id = 1L)
  
  aquifer_aqu <- tibble(id         = 1,
                        name       = 'aqu1',
                        init_id    = 1,
                        gw_flo     = 0.05,
                        dep_bot    = 10,
                        dep_wt     = 10,
                        no3_n      = 0,
                        sol_p      = 0,
                        carbon     = 0,
                        flo_dist   = 0,
                        bf_max     = 1,
                        alpha_bf   = 0.048,
                        revap      = 0.02,
                        rchg_dp    = 0.05,
                        spec_yld   = 0.003,
                        hl_no3n    = 0,
                        flo_min    = 5,
                        revap_min  = 3)
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  dbWriteTable(db, 'aqu.aquifer_con', aquifer_con, overwrite = TRUE)
  dbWriteTable(db, 'aqu.aquifer_aqu', aquifer_aqu, overwrite = TRUE)
  dbDisconnect(db)
}

## Link the aquifer and the channels to simulate recharge from the aquifers 
## to the channels with geomorphic flow.
## 
## This function is used to update the SWAT+ text input files which were 
## written with the SWAT+Editor to activate the geomorphic flow option 
## to simulate recharge from the aquifer into the channels. The function
## adds the SWAT+ input file aqu_cha.lin which links aquifer ids and channel
## ids and updates the file.cio to point to this link file.
## 
#' @param txt_path Path of the projects TxtInOut folder
#' 
link_aquifer_channels <- function(txt_path) {
  # Read the channel ids from chandeg.con
  chandeg_id <- read_lines(paste0(txt_path, '/chandeg.con'), skip = 2, lazy = FALSE) %>% 
    str_trim(.) %>% 
    str_split(., '[:space:]+') %>% 
    map_chr(., ~.x[1]) %>% 
    as.numeric(.) %>% 
    sort(.)
  
  # Translate the channel ids into element ids for the aqu_cha.lin file
  elem_ids <- build_cha_id_list(chandeg_id)
  
  # Build and write the aqu_cha.lin file
  aqu_cha_lin <- c('aquifer-channel linkage: geomorphic baseflow',
                   'aqu_id    aqu_name    elem_tot    elements',
                   paste(c('     1        aqu1', 
                     sprintf('%8d', length(elem_ids)), '   ', 
                     paste(elem_ids, collapse = '  ')), collapse = '    '))
  
  write_lines(aqu_cha_lin, paste0(txt_path, '/aqu_cha.lin'))
  
  # Read the file.cio and set the aquifer channel link in the link line
  # and rewrite the project file.cio
  file_cio <- read_lines(paste0(txt_path, '/file.cio'), lazy = FALSE)
  
  link <- file_cio[16] %>% 
    str_trim(.) %>% 
    str_split(., '[:space:]+', simplify = TRUE)
  
  link[3] <- 'aqu_cha.lin'
  
  file_cio[16] <- paste(sprintf('%-16s', link), collapse = '  ')
  
  write_lines(file_cio, paste0(txt_path, '/file.cio'))
}

## Build the sequence of elements (channel ids) which is required in the 
## aqu_cha.lin file to connect the aquifer and the channels.
## 
#' @param cha_id Numeric vector with channel ids
#' 
build_cha_id_list <- function(cha_id) {
  id_int <- diff(cha_id)
  break_pos <- which(id_int > 1)
  seq_start <- unique(c(1, break_pos + 1))
  seq_end   <- unique(c(break_pos, length(cha_id)))
  
  map2(seq_start, seq_end, ~ cha_id[.x:.y]) %>% 
    map(., ~ translate_to_range(.x)) %>% 
    unlist(.)
}

## Translate a vector into a vector with the min and max value of that vector.
## The max value has a - sign then. This is required to define the id sequences
## in the aqu_cha.lin file.
## 
#' @param x Numeric vector
#' 
translate_to_range <- function(x) {
  if (length(x) == 1) {
    rng <- x
  } else {
    rng <- c(min(x), - max(x))
  }
  return(rng)
}