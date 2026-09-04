## Calculate channel width, depth and width to depth ratio based on the 
## contributing area of a channel.
## 
#' @param contr_area Contributing area of a channel as a numeric value.
#'
calc_wd <- function(contr_area) {
  # USA equations from https://doi.org/10.1111/jawr.12282
  tibble(contr_area = contr_area*1e-4, # conversion to ha
         width = 2.70* (contr_area*1e-2)^0.352,
         depth = 0.30* (contr_area*1e-2)^0.213,
         wdr   = width/depth)
}

## Calculate the contributing area of channels. This function is a more
## robust replacement for a simple flow accumulation calculation.
## This function calculates iso-basins with a size of 500m. The flow 
## accumulation for the iso-basins is calculated.
## For each channel quantiles of flow accumultation values are calculated.
## First and second order derivatives are calculated for the differences
## between quantiles. If the change in accumulation between quantiles is 
## similar (low sd) it is assumed that flow accumulation steadily increases
## for a channel. Then the largest value of flow accumulation is used that
## is cut by the channel. If the difference between quantiles is low then 
## the median quantile value is used. If the quantile values provide a 
## rather indifferent picture the flow accumulation is selected which meets
## a plausible value considering the flow order of that channel (Large order
## higher accumulation value, low order tendency to lower accumulation value)
## 
#' @param data_path Path to the project data folder
#' @param cha_rst Channel id raster layer
#' @param dem_res Spatial resolution of the DEM. Single numeric value of (x,y) 
#'   cell size in meters.
#'
calculate_contributing_area <- function(data_path, cha_rst, dem_res) {
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  cha_order <- dbReadTable(db, 'cha.order')
  dbDisconnect(db)
  
  cat('Calculating iso-basins from catchment DEM...\n')
  wbt_isobasins(paste0(data_path, '/raster/dem_fill_brch.tif'),
                paste0(data_path, '/raster/iso_cmt_500.tif'),
                size = round(500 / dem_res^2), connections = T) %>%
    capture.output(., file='NULL')
  cat(green('  \U2714 '), 'Done\n')
  
  iso_cmt_tbl <- read_csv(paste0(data_path, '/raster/iso_cmt_500.csv'),
                          na = 'N/A', show_col_types = FALSE) %>% 
    filter(!is.na(DOWNSTREAM)) %>% 
    select(UPSTREAM, DOWNSTREAM, ACCUM) %>% 
    set_names(c('up', 'down', 'accum'))
  
  cmt_acc <- tibble(id = integer(),
                    cell_total = integer())
  
  n_wb <- Inf
  
  cat('Calculating iso-basin flow accumulation...\n')
  while(nrow(iso_cmt_tbl) < n_wb) {
    n_wb <- nrow(iso_cmt_tbl)
    
    cmt_up <- filter(iso_cmt_tbl, !up %in% down) %>% 
      set_names(c('id', 'up', 'cell_total'))
    
    cmt_add <- cmt_up %>% 
      group_by(up) %>% 
      summarise(cell_total = sum(cell_total)) %>% 
      ungroup()
    
    iso_cmt_tbl <- iso_cmt_tbl %>% 
      filter(!up %in% cmt_up$id) %>% 
      left_join(., cmt_add, by = "up") %>% 
      mutate(cell_total = ifelse(is.na(cell_total), 0, cell_total),
             accum = accum + cell_total) %>% 
      select(-cell_total)
    
    cmt_acc <- bind_rows(cmt_acc, select(cmt_up, -up))
  }
  cat(green('  \U2714 '), 'Done\n')
  
  # iso_cmt_rst <- rast(paste0(data_path, '/raster/iso_cmt_500.tif'))
  
  cat('Generating flow accumulation raster...\n')
  write_lines(apply(cmt_acc[,2:1], 1, paste, collapse = ','), 
              paste0(data_path, '/raster/acc_reclass.txt'))
  
  wbt_reclass_from_file(paste0(data_path, '/raster/iso_cmt_500.tif'),
                        paste0(data_path, '/raster/acc_reclass.txt'),
                        paste0(data_path, '/raster/iso_cmt_acc.tif')) %>% 
    capture.output(., file='NULL')
  
  # iso_cmt_acc <- classify(iso_cmt_rst, as.matrix(cmt_acc), others = NA)
  # writeRaster(iso_cmt_acc, paste0(data_path, '/raster/iso_cmt_acc.tif'), overwrite = TRUE)
  cat(green('  \U2714 '), 'Done\n')
  
  cat('Calculating channel contributing areas...\n')
  
  iso_cmt_acc <- rast(paste0(data_path, '/raster/iso_cmt_acc.tif'))
  iso_acc_cha <- mask(iso_cmt_acc, cha_rst)
  
  cha_order <- mutate(cha_order, order = minmax(iso_acc_cha)[2]*order)
  
  ca_stat <- map(seq(0.4, 1, 0.1), ~ zonal(iso_acc_cha, cha_rst, fun = quantile, probs = .x, na.rm = T)) %>% 
    map_df(., ~ set_names(.x, c('id', 'acc'))) %>% 
    group_by(id) %>% 
    group_split() %>% 
    map(., ~ mutate(.x, med = median(acc))) %>% 
    map(., ~ mutate(.x, s = c(NA, diff(acc)))) %>% 
    map(., ~ mutate(.x, mns = mean(s, na.rm = T))) %>% 
    map(., ~ mutate(.x, s2 = c(NA, diff(s)))) %>% 
    map(., ~ mutate(.x, v = sd(s, na.rm = T) / med)) %>% 
    map_df(., ~ mutate(.x, v2 = sd(s2, na.rm = T) / mns)) %>% 
    left_join(., cha_order, by = "id") %>% 
    group_by(id) %>% 
    mutate(order = abs(acc - order)) %>% 
    mutate(order = which.min(order)) %>%
    mutate(ca = ifelse(v2 < 1, max(acc), NA)) %>% 
    mutate(ca = ifelse(v < 1 & v2 > 1, med, ca)) %>% 
    mutate(ca = ifelse(v > 1 & v2 > 1, acc[order], ca)) %>% 
    mutate(ca = ifelse(is.na(ca), 0.1, ca))
  cat(green('  \U2714 '), 'Done\n')
  
  file.remove(paste0(data_path, '/raster/iso_cmt_500.tif'),
              paste0(data_path, '/raster/iso_cmt_acc.tif'),
              paste0(data_path, '/raster/acc_reclass.txt'),
              paste0(data_path, '/raster/iso_cmt_500.csv')) %>% 
    capture.output(., file='NULL')
  invisible(file.remove('NULL'))
  
  ca_stat %>% 
    select(id, ca) %>% 
    group_by(id) %>% 
    summarise(ca = ca[1])
}