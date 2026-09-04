# R packages -------------------------------------------------------
library(tidyverse)
# library(data.table)
library(vroom)

# Project path -----------------------------------------------------
proj_path <- "../../../../1_Setup/Temp/clean_setup"

# ------------------------------------------------------------------

# Functions --------------------------------------------------------
read_tbl <- function(tbl_name, proj_path, row_data_start, row_col_names) {
  tbl_path <- paste(proj_path, tbl_name, sep = '/')
  col_names <- vroom_lines(tbl_path, skip = row_col_names - 1, n_max = 1) %>%
    str_trim(.) %>%
    str_split(., '[:space:]+') %>%
    unlist()

  tbl <- vroom_lines(tbl_path, skip = row_data_start - 1) %>%
    str_trim(.) %>%
    str_split(., '\t[:space:]+|[:space:]+')

  is_num <- tbl[[1]] %>% as.numeric() %>% suppressWarnings() %>% map_lgl(., ~!is.na(.x)) %>%  which()

  tbl <- tbl %>%
    map(., ~ set_names(.x, col_names)) %>%
    map_df(., bind_rows) %>%
    mutate(across(all_of(is_num), ~ as.numeric(.x)))

  return(tbl)
}

# Read landuse.lum --------------------------------------------------
lum <- read_tbl('landuse.lum.bak', proj_path, 3, 2)
lum_head <- vroom_lines(paste(proj_path, 'landuse.lum.bak', sep = '/'), n_max = 1) %>%
  paste0(., ', edited manually on ', Sys.time())

# Define pointers in landuse.lum ------------------------------------

## cn2
lum$cn2[which(substr(lum$name,1,1)=='f')] <- 'rc_strow_g'
lum$cn2[which(substr(lum$name,1,2)=='fr')] <- 'wood_f'
lum$cn2[which(substr(lum$name,1,2)=='fe')] <- 'pasth'
lum$cn2[which(substr(lum$name,1,4)=='alfa')] <- 'pasth'
lum$cn2[which(substr(lum$name,1,4)=='agrl')] <- 'brush_f'
lum$cn2[which(substr(lum$name,1,4)=='urhd')] <- 'urban'
lum$cn2[which(substr(lum$name,1,4)=='urld')] <- 'farm'
lum$cn2[which(substr(lum$name,1,4)=='wetl')] <- 'pasth'
lum$cn2[which(substr(lum$name,1,4)=='orcd')] <- 'woodgr_f'
lum %>% filter(cn2 == "null") %>% select(name) %>% unique()

## cons_prac
lum$cons_prac[which(substr(lum$name,1,1)=='f')] <- 'up_down_slope'
lum$cons_prac[which(substr(lum$name,1,2)=='fr')] <- 'up_down_slope'
lum$cons_prac[which(substr(lum$name,1,2)=='fe')] <- 'up_down_slope'
lum$cons_prac[which(substr(lum$name,1,4)=='alfa')] <- 'up_down_slope'
lum$cons_prac[which(substr(lum$name,1,4)=='agrl')] <- 'up_down_slope'
lum$cons_prac[which(substr(lum$name,1,4)=='urhd')] <- 'up_down_slope'
lum$cons_prac[which(substr(lum$name,1,4)=='urld')] <- 'up_down_slope'
lum$cons_prac[which(substr(lum$name,1,4)=='wetl')] <- 'up_down_slope'
lum$cons_prac[which(substr(lum$name,1,4)=='orcd')] <- 'up_down_slope'
lum %>% filter(cons_prac == "null") %>% select(name) %>% unique()

## ov_mann
lum$ov_mann[which(substr(lum$name,1,1)=='f')] <- 'convtill_nores'
lum$ov_mann[which(substr(lum$name,1,2)=='fr')] <- 'forest_med'
lum$ov_mann[which(substr(lum$name,1,2)=='fe')] <- 'densegrass'
lum$ov_mann[which(substr(lum$name,1,4)=='alfa')] <- 'densegrass'
lum$ov_mann[which(substr(lum$name,1,4)=='agrl')] <- 'densegrass'
lum$ov_mann[which(substr(lum$name,1,4)=='urhd')] <- 'urban_asphalt'
lum$ov_mann[which(substr(lum$name,1,4)=='urld')] <- 'shortgrass'
lum$ov_mann[which(substr(lum$name,1,4)=='wetl')] <- 'densegrass'
lum$ov_mann[which(substr(lum$name,1,4)=='orcd')] <- 'forest_light'
lum %>% filter(ov_mann == "null") %>% select(name) %>% unique()

## urban
lum$urban[which(substr(lum$name,1,4)=='urld')] <- 'urld'
lum$urban[which(substr(lum$name,1,4)=='urhd')] <- 'utrn'

# Write new landuse.lum ---------------------------------------------
fmt_nam <- c('%-28s', '%-9s', rep('%17s', 12))
fmt_val <- c('%-33s', '%-4s', rep('%17s', 12))

lum_names <- colnames(lum) %>%
  map2_chr(., fmt_nam, ~sprintf(.y, .x)) %>%
  paste(., collapse = ' ')

lum_lines <- lum %>%
  map2_df(., fmt_val, ~sprintf(.y, .x)) %>%
  apply(., 1, paste, collapse = ' ')

lum_lines <- c(lum_head, lum_names, lum_lines)
write_lines(lum_lines, paste(proj_path, 'landuse.lum', sep = '/'))


