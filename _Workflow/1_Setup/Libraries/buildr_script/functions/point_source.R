## Add point sources (recall) to the SWAT+ model setup. The point source
## locations are derived from a point shape file input layer. Optionally
## point source records are added if csv files with the same name as the 
## name of a point source exist in the same folder with the point source
## location layer
## 
#' @param point_path Path of the point source point shape layer
#' @param data_path Path of the project data folder
#' @param max_point_dist Maximum distance to snap a point source to the
#'   closest channel or reservoir object. Numeric value in meters.
#'
add_point_sources <- function(point_path, data_path, max_point_dist) {
  if (!is.null(point_path)) {
    pnt <- read_sf(point_path) %>% 
      mutate(id = 1:nrow(.)) %>% 
      select(id, name)
    
    # Checks of point source layer attributes
    stopifnot('name' %in% names(pnt))
    pnt_names <- table(pnt$name)
    if(max(pnt_names) > 1) {
      stop("The attribute 'name' must be unique for each point source location.")
    }
    
    # calculate elevation of point sources, column in recall_con
    dem <- rast(paste0(data_path, '/raster/dem.tif'))
    elev <- extract(dem, vect(pnt))
    
    vct_files <- list.files(paste0(data_path, '/vector'))
    
    if('res.shp' %in% vct_files) {
      res  <- read_sf(paste0(data_path, '/vector/res.shp'))
      pnt_res_dist <- st_transform(pnt, st_crs(res)) %>% 
        get_min_dist(., res, 'res')
    } else {
      pnt_res_dist <- NULL
    }
    
    if('cha.shp' %in% vct_files) {
      cha  <- read_sf(paste0(data_path, '/vector/cha.shp'))
      pnt_cha_dist <- st_transform(pnt, st_crs(cha)) %>% 
        get_min_dist(., cha, 'sdc')
    } else {
      pnt_cha_dist <- NULL
    }
    
    pnt_dist <- bind_rows(pnt_res_dist, pnt_cha_dist) %>% 
      group_by(id) %>% 
      filter(dist == min(dist)) %>% 
      filter(dist <= max_point_dist) %>% 
      ungroup() %>% 
      arrange(id)
    
    recall_con <- pnt[pnt_dist$id,] %>% 
      mutate(gis_id = NA_integer_,
             area   = 0) %>% 
      add_latlon(.) %>% 
      st_drop_geometry(.) %>% 
      mutate(elev = elev[pnt_dist$id,2],
             wst_id = NA_integer_,
             cst_id = NA_integer_,
             ovfl   = 0L,
             rule   = 0L,
             rec_id = id) %>% 
      mutate(id = 1:nrow(.))
    
    recall_con_out <- tibble(id    = recall_con$id,
                             order = 1,
                             obj_typ = pnt_dist$obj_typ,
                             obj_id  = pnt_dist$obj_id,
                             hyd_typ = 'tot',
                             frac    = 1,
                             recall_con_id = recall_con$rec_id)
    
    rec_dat <- prepare_recall_data(point_path, recall_con)
    
    db_path <- paste0(data_path, '/tables.sqlite')
    db <- dbConnect(SQLite(), db_path)
    dbWriteTable(db, 'recall.recall_con', recall_con, overwrite = TRUE)
    dbWriteTable(db, 'recall.recall_con_out', recall_con_out, overwrite = TRUE)
    dbWriteTable(db, 'recall.recall_dat', rec_dat$recall_dat, overwrite = TRUE)
    dbWriteTable(db, 'recall.recall_rec', rec_dat$recall_rec, overwrite = TRUE)
    dbDisconnect(db)
  }
}

## Find the minimum distance of a point to another vector object. The function
## returns a tibble with the point id and the object id and distance to the 
## nearest feature of a second vector input layer.
## 
#' @param pnt Point source vector layer as sf object
#' @param obj Object input layer as sf object for which the closest feature to
#'   a point is identified.
#' @param typ Character label that defines the type of object.
#'
get_min_dist <- function(pnt, obj, typ) {
  dist_mtx <- st_distance(pnt, obj)
  tibble(id      = pnt$id,
         pos     = apply(dist_mtx, 1, which.min),
         obj_id  = obj$id[pos],
         obj_typ = typ,
         dist    = apply(dist_mtx, 1, min))
}

## Prepare the time series input data from the point source data folder and
## generate the recall data and the recall record type tables. The tables are 
## returned as list with elements recall_dat and recall_rec
## 
#' @param point_path Path of the point source point shape layer
#' @param recall_con Generated recall_con tibble
#'
prepare_recall_data <- function(point_path, recall_con) {
  rec_col_names <- c('jday', 'mo', 'day_mo', 'yr', 'ob_typ', 'ob_name', 'flo', 
                     'sed', 'orgn', 'sedp', 'no3', 'solp', 'chla', 'nh3', 'no2', 
                     'cbod', 'dox', 'sand', 'silt', 'clay', 'sag', 'lag', 'gravel',
                     'tmp')
  
  point_dir <- dirname(point_path)
  
  point_files      <- list.files(point_dir, 
                                 pattern = '_(day|mon|yr|const).csv$')
  point_data_files <- list.files(point_dir, 
                                 pattern = 'point_data_(day|mon|yr|const).csv')
    
  point_names <- str_remove(point_files, '_(day|mon|yr|const).csv$')
  
  is_point_name  <- point_names %in% recall_con$name
  point_files    <- point_files[is_point_name]
  point_names    <- point_names[is_point_name]
  point_int      <- point_files %>% 
    str_remove(., '.csv$') %>% 
    str_extract(., 'day$|mon$|yr$|const$')
  point_data_int <- point_data_files %>% 
    str_remove(., '.csv$') %>% 
    str_extract(., 'day$|mon$|yr$|const$')
  
  point_data <- map(point_data_files, ~ read_csv(paste(point_dir, .x, sep = '/'), 
                                  lazy = FALSE, show_col_types = FALSE)) %>% 
    map(., ~ group_by(.x, ob_name)) %>% 
    map(., ~ group_split(.x)) 
  
  n_data_elem <- map_int(point_data, ~ length(.x))
  point_data_int <- rep(point_data_int, n_data_elem)
  
  point_data <- list_flatten(point_data)
  
  point_data_names <- map_chr(point_data, ~ .x$ob_name[1])
  is_point_data    <- point_data_names %in% recall_con$name
  
  point_data_names <- point_data_names[is_point_data]
  point_data       <- point_data[is_point_data]
  point_data_int   <- point_data_int[is_point_data]
  
  point_data <- map(point_data, ~ select(.x, - ob_name))
  
  point_int   <- c(point_data_int, point_int)
  point_names <- c(point_data_names, point_names)
  name_count <- table(point_names)
  
  if(any(name_count > 1)) {
    stop('Duplicate point source data found for the point sources:\n',
         paste(names(name_count[name_count > 1]), collapse = ', '))
  }
  
  point_no_data <- recall_con$name[!recall_con$name %in% point_names]
  
  rec_id <- recall_con %>% 
    select(., rec_id, name) %>% 
    set_names(., c('recall_rec_id', 'ob_name'))
  
  point_data <- c(point_data, 
                  map(point_files, ~ read_csv(paste(point_dir, .x, sep = '/'), 
                                    lazy = FALSE, show_col_types = FALSE)))
  
  recall_dat <- point_data %>% 
    map(., ~ set_names(.x, tolower(colnames(.x)))) %>% 
    map(., ~ remove_rows_all_na(.x)) %>% 
    map(., ~ date_to_ymd(.x)) %>% 
    map2(., point_int, ~ update_ymd_cols(.x, .y)) %>% 
    map2(., point_names, ~ check_ymd_cols(.x, .y)) %>% 
    map2(., point_names, ~ check_unique_time(.x, .y)) %>% 
    map2(., point_names, ~mutate(.x, ob_name = .y)) %>% 
    check_var_names(., rec_col_names) %>% 
    map(., ~ add_missing_cols(.x, rec_col_names)) %>% 
    bind_rows(.) %>% 
    add_default_rec(., point_no_data, rec_col_names) %>% 
    left_join(., rec_id, by = 'ob_name') %>% 
    arrange(., recall_rec_id, yr, mo, day_mo) %>% 
    mutate(., id = 1:nrow(.)) %>% 
    relocate(., id, recall_rec_id, .before = 1) 
    
  recall_rec <- recall_dat %>% 
    select(., recall_rec_id, ob_typ, ob_name) %>% 
    distinct_all(.) %>% 
    mutate(., rec_typ = translate_par_value(ob_typ,
                                            c('pt_day', 'pt_mon', 'pt_yr', 'pt_const'),
                                            1:4)) %>% 
    select(., - ob_typ) %>% 
    set_names(c('id', 'name', 'rec_typ'))
  
  return(list(recall_dat = recall_dat,
              recall_rec = recall_rec))
}

## Add the columns which are part of the recall data table but were not provided
## as input to the user provided point source data.
## 
#' @param tbl Tibble of user input point source data.
#' @param rec_col_names Character vector with recall data column names
#'
add_missing_cols <- function(tbl, rec_col_names) {
  col_miss <- rec_col_names[!rec_col_names %in% names(tbl)]
  tbl[col_miss] <- 0
  tbl <- tbl[rec_col_names]
  return(tbl)
}

## Add a default data line for each point source for which no user input data 
## was provided in the data folder. The default data is a constant input with
## all zeros for all variables.
## 
#' @param tbl Tibble of user input point source data.
#' @param ob_names Name vector of point sources for which a default point source
#'   data entry should be generated.
#' @param rec_col_names Character vector with recall data column names
#'
add_default_rec <- function(tbl, ob_names, rec_col_names) {
  if(length(ob_names) > 0) {
    date_tbl <- tibble(jday = 1, mo = 1, day_mo = 1, yr = 1)
    name_tbl <- tibble(ob_typ = 'pt_const', ob_name = NA_character_)
    var_vct  <- set_names(rep(0, 18), rec_col_names[7:length(rec_col_names)])
    var_tbl  <- as_tibble_row(var_vct)
    def_rec <- bind_cols(date_tbl, name_tbl, var_tbl)
    
    tbl_add <- map_df(ob_names, ~ mutate(def_rec, ob_name = .x))
    
    tbl <- bind_rows(tbl, tbl_add)
  }
  
  return(tbl)
}

## Check the variable names in the user provided point source data tables. 
## The function triggers an error message showing for all input tables the 
## column names which are incorrect point source variable names.
## 
#' @param pnt_list List of tibbles of user input point source data.
#' @param rec_col_names Character vector with recall data column names
#'
check_var_names <- function(pnt_list, rec_col_names) {
  pnt_names <- map_chr(pnt_list, ~ .x$ob_name[1])
  var_names <- pnt_list %>% 
    map(., ~ names(.x)[!names(.x) %in% rec_col_names])
  if (length(unlist(var_names)) > 0) {
    pnt_names <- pnt_names[map_lgl(var_names, ~ length(.x) > 0)]
    msg <- map2_chr(pnt_names, var_names, ~ paste0('  ', .x, ':\n  ', 
                                                   paste0(.y, collapse = ', '), '\n\n'))
    stop('The following point source input tables contain columns with ', 
         'incorrect column names:\n',
         msg)
  }
  
  return(pnt_list)
}

## Conversion from date column to julian day, day, month, year format.
## 
#' @param tbl Tibble of user input point source data.
#'
date_to_ymd <- function(tbl) {
  if ('date' %in% colnames(tbl)) {
    tbl <- tbl %>% 
      mutate(jday   = yday(date),
             mo     = month(date),
             day_mo = day(date), 
             yr     = year(date),
             .before = date) %>% 
      select(-date)
  }
  return(tbl)
}

## Update the date columns of a point source data table with respect to the 
## provided time interval.
## 
#' @param tbl Tibble of user input point source data.
#' @param int Time interval, character value which must be one of 'const', 
#'   'yr', 'mo', or 'day'
#'
update_ymd_cols <- function(tbl, int) {
  if('day' %in% colnames(tbl)) {
    tbl <- rename(tbl, day_mo = day)
  }
  if (int == 'const') {
    tbl$yr <- 1
  }
  if(int %in% c('yr', 'const')) {
    tbl$mo <- 1
  }
  if(int %in% c(c('mon', 'yr', 'const'))) {
    tbl$day_mo <- 1
    tbl$jday   <- 1
  }
  tbl <- mutate(tbl, ob_typ = paste0('pt_', int))
  return(tbl)
}

## Check if all required date columns are provided in a point source input table. 
## 
#' @param tbl Tibble of user input point source data.
#' @param tbl_name Name of the analyzed point source
#' 
check_ymd_cols <- function(tbl, tbl_name) {
  col_miss <- c('day_mo', 'mo', 'yr')[!c('day_mo', 'mo', 'yr') %in% colnames(tbl)]
  if (length(col_miss) > 0) {
    stop('The following columns are missing in the input table for the point source ', 
         tbl_name, ':\n', paste(col_miss, collapse = ', '))
  }
  if(!'jday' %in% colnames(tbl)) {
    tbl <- mutate(tbl, jday = yday(ymd(paste(yr, 
                                             sprintf('%02d', mo), 
                                             sprintf('%02d', day_mo)))))
  }
  return(tbl)
}

## Check if all provided time steps are unique and no duplicate time steps are
## provided in the user input point source table 
## 
#' @param tbl Tibble of user input point source data.
#' @param tbl_name Name of the analyzed point source
#' 
check_unique_time <- function(tbl, tbl_name) {
  time_lbl <- paste(tbl$yr, tbl$mo, tbl$day_mo, tbl$jday, sep = '-')
  time_count <- table(time_lbl)
  
  if(any(time_count > 1)) {
    stop('Duplicate time steps identified in input table for point source ', 
         tbl_name)
  }
  
  return(tbl)
}