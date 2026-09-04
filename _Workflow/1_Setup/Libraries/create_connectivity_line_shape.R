library(sf)
library(DBI)
library(RSQLite)
library(stringr)

# functions
read_db_tbl <- function(db_path, tbl_name) {
  con <- dbConnect(drv = SQLite(), dbname = db_path)
  db_tables <- dbListTables(con)

  if(!tbl_name %in% db_tables) {
    stop(tbl_name, ' is not available from ', db_path)
  }

  tbl <- dbReadTable(con, tbl_name) %>% as_tibble(.)
  dbDisconnect(con)

  return(tbl)
}

st_centroid_within_poly <- function(poly) {
  poly <- select(poly, id)

  centroid <- st_centroid(poly)

  in_poly <- st_within(centroid, poly) %>%
    map2_lgl(., 1:length(.), ~ .y %in% .x)

  centroid <- centroid[in_poly, ]

  pt_on_surface <- st_point_on_surface(poly[!in_poly,])

  centroid <- bind_rows(centroid, pt_on_surface) %>%
    arrange(id)

  return(centroid)
}

get_line_tbl <- function(rout, from_lyr, to_lyr, obj_sel) {
  rout_filter <- rout %>%
    filter(obj_typ == obj_sel)

  rout_from <- from_lyr[rout_filter$from_id, ] %>%
    .$geometry %>%
    st_coordinates()
  rout_to <- to_lyr[rout_filter$to_id, ] %>%
    .$geometry %>%
    st_coordinates()

  rout_mtx <- cbind(rout_from[,1], rout_to[,1], rout_from[,2], rout_to[,2])
  line_list <- map(1:nrow(rout_from), ~ matrix(rout_mtx[.x,], ncol = 2)) %>%
    map(., ~ st_linestring(.x))

  line_tbl <-  tibble(id = rout_filter$id)
  line_tbl$geom <- st_sfc(line_list)
  line_tbl <- st_as_sf(line_tbl)

  st_crs(line_tbl) <- st_crs(from_lyr)

  return(line_tbl)
}

get_land_connections_as_lines <- function(buildr_data_path, buildr_sqlite_path, write_to_buildr = TRUE) {
  hru <- read_sf(paste0(buildr_data_path, '/vector/hru.shp'))
  hru_centroids <- st_centroid_within_poly(hru)

  rout <- read_db_tbl(buildr_sqlite_path, 'rout_unit_con_out') %>%
    filter(., obj_typ %in% c('ru', 'sdc', 'res')) %>%
    select(id, rtu_con_id, obj_id, obj_typ, hyd_typ, frac) %>%
    rename(from_id = rtu_con_id, to_id = obj_id)

  rout_con_lines <- get_line_tbl(rout, hru_centroids, hru_centroids, 'ru')

  if(file.exists(paste0(buildr_data_path, '/vector/cha_pnt_start.shp'))) {
    cha_pnt <- read_sf(paste0(buildr_data_path, '/vector/cha_pnt_start.shp'))

    rout_con_lines <- bind_rows(rout_con_lines,
                                get_line_tbl(rout, hru_centroids, cha_pnt, 'sdc'))

  }

  if(file.exists(paste0(buildr_data_path, '/vector/res.shp'))) {
    res  <- read_sf(paste0(buildr_data_path, '/vector/res.shp'))
    res_centroids <- st_centroid_within_poly(res)

    rout_con_lines <- bind_rows(rout_con_lines,
                                get_line_tbl(rout, hru_centroids, res_centroids, 'res'))
  }

  rout_con_lines <- rout_con_lines %>%
    arrange(id) %>%
    left_join(., rout, by = "id") %>%
    relocate(., from_id:frac , .after = id)

  if(write_to_buildr) {
    write_sf(rout_con_lines, paste0(buildr_data_path, '/vector/land_connections_as_lines.shp'))
  }

  return(rout_con_lines)
}

# # paths
# buildr_sqlite_path <- 'Y:/Gruppen/optain/3. Case Studies/1 DEU - Schwarzer Schöps/SWAT_setup/schoeps_230207/230207_schoeps.sqlite'
# buildr_data_path <- 'Y:/Gruppen/optain/3. Case Studies/1 DEU - Schwarzer Schöps/SWAT_setup/schoeps_230207/data'

# create line shape of connectivities
land_con_line <- get_land_connections_as_lines(paste0(dir_path, '/data'), db_path)

