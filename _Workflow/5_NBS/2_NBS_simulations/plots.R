#| Credits
#| Christoph Schürz (christoph.schuerz@ufz.de)
#| Michael Strauch (michael.strauch@ufz.de)

# packages ------------------------------------------------------------------
library(sf)
library(units)
library(dplyr)
library(data.table)
library(mapview)
library(RColorBrewer)
library(stringr)
library(tidyverse)

get_jenks_breaks <- function(x, n) {
  classInt::classIntervals(x[is.finite(x)], n = n, style = 'jenks')$brks
}

# functions --------------------------------------------------------------------
read_tbl <- function(file, run_path, n_skip) {
  file_path <- paste0(run_path, '/', file)
  
  col_names <- read_lines(file = file_path, skip = 1, n_max = 1, lazy = FALSE) %>%
    str_trim(.) %>%
    str_split(., '[:space:]+') %>%
    unlist()
  
  name_duplicate <- table(col_names) %>%
    .[. > 1]
  if(length(name_duplicate) > 0) {
    for (i in 1:length(name_duplicate)) {
      col_names[col_names == names(name_duplicate[i])] <-
        paste0(names(name_duplicate[i]), 1:name_duplicate[i])
    }
  }
  
  fread(file_path, skip = n_skip, header = FALSE) %>%
    set_names(., col_names) %>%
    tibble(.)
}
plot_interactive_map <- function(layer, variable, type = 'seq', max_scale=NA, trans = FALSE) {
  rng <- range(layer[[variable]], na.rm = TRUE)
  
  if (type == 'div' & xor(rng[1] < 0, rng[2] > 0)) {
    type <- 'seq'
  }
  
  calc_breaks <- function(rng, type, trans, n) {
    if (trans) {
      x <- abs(rng[1] - rng[2]) * exp(seq(-1, 3, length.out = n))/exp(3)
      
      if (type == 'div' & min(rng, na.rm = TRUE) < 0) {
        sort(max(rng, na.rm = TRUE) - x)
      } else {
        min(rng, na.rm = TRUE) + x
      }
    } else {
      seq(rng[1], rng[2], length.out = n)
    }
  }
  
  if(type == 'div') {
    pal <- c(brewer.pal(9, "Reds")[9:1], 'white', brewer.pal(9, "Blues"))
    breaks <- c(calc_breaks(c(min(rng), 0), type, trans, 9),
                calc_breaks(c(0, max(rng)), type, trans, 9))
  } else if(type == 'cst') {
    breaks <- round(c(min(rng),custom_breaks[-1],max(rng)),0)
    n <- length(breaks)
    pal <- hcl.colors(n, palette = "viridis", rev = TRUE)
  }else if(type == 'seq') {
    pal <- mapviewGetOption("vector.palette")
    breaks <- sort(unique(c(calc_breaks(rng, type, trans, 8), rng)))
  } else if(type == 'jenks') {
    #pal <- mapviewGetOption("vector.palette")
    #pal <- c(brewer.pal(9, "Reds")[9:1],'white')
    pal <- c('white',brewer.pal(9, "Reds")[1:9])
    if(is.na(max_scale)==F){
      values_mod <- layer[[variable]]
      values_mod[values_mod>max_scale] <- max_scale
      breaks <- get_jenks_breaks(round(values_mod,0), 9)
    }else{
      breaks <- get_jenks_breaks(round(layer[[variable]],0), 9)
    }
    
    breaks <- breaks[!duplicated(breaks)]
  }else if(type == 'jenks2') {
    #pal <- mapviewGetOption("vector.palette")
    pal <- c(brewer.pal(9, "Reds")[9:1],'white')
    #pal <- c('white',brewer.pal(9, "Reds")[1:9])
    breaks <- get_jenks_breaks(round(layer[[variable]],0), 9)
    breaks <- breaks[!duplicated(breaks)]
  }
  
  mapview(layer, zcol = variable, col.regions = pal, at = breaks,
          map.type = c('CartoDB.Positron', 'Esri.WorldImagery', 'OpenTopoMap'))
}

outputs_path <- './scenario_outputs'

# paths to scenario results  ---------------------------------------------------
sq_path <- paste0(outputs_path,'/statusquo/cal1')
afforestation_path <- paste0(outputs_path,'/afforestation/cal1')
rota_path <- paste0(outputs_path,'/rotation/cal1')
cc_path <- paste0(outputs_path,'/covcrop/cal1')
pond_path <- paste0(outputs_path,'/pond/cal1')
all_path <- paste0(outputs_path,'/all/cal1')

# path to buildR vector data
vect_path <- './vector'

# get buildR GIS data ----------------------------------------------------------
hru <- read_sf(paste0(vect_path,'/hru.shp'))
hru$area <- st_area(hru)
cha <- read_sf(paste0(vect_path,'/cha.shp'))
res <- read_sf(paste0(vect_path,'/res.shp'))

# get SWAT+ results for status quo ---------------------------------------------
wb_aa_sq <- read_tbl('hru_wb_aa.txt', sq_path, 3)
ls_aa_sq <- read_tbl('hru_ls_aa.txt', sq_path, 3)
pw_aa_sq <- read_tbl('hru_pw_aa.txt', sq_path, 3)
cha_aa_sd_sq <- read_tbl('channel_sd_aa.txt', sq_path, 3)

# join results with GIS data ---------------------------------------------------
hru_wb_sq <- left_join(hru, wb_aa_sq, 'name')
hru_ls_sq <- left_join(hru, ls_aa_sq, 'name')
hru_pw_sq <- left_join(hru, pw_aa_sq, 'name')
cha_sq <- left_join(cha, cha_aa_sd_sq, 'name')

# Unit conversions etc. --------------------------------------------------------

# for hru fluxes provided in mm it might be appropriate to convert to l/s per hru
# to get rid of extremely high values for small hrus located along flow concentration pathways
hru_wb_sq$surq_gen_lshru <- hru_wb_sq$surq_gen * drop_units(hru_wb_sq$area) / (365.25 * 24 * 3600)
hru_wb_sq$surq_ls_lshru <- hru_wb_sq$surq_ls * drop_units(hru_wb_sq$area) / (365.25 * 24 * 3600)
hru_wb_sq$surq_cha_lshru <- hru_wb_sq$surq_cha * drop_units(hru_wb_sq$area) / (365.25 * 24 * 3600)
hru_wb_sq$surq_runon_lshru <- hru_wb_sq$surq_runon * drop_units(hru_wb_sq$area) / (365.25 * 24 * 3600)
hru_wb_sq$surq_runon_cmahru <- hru_wb_sq$surq_runon * drop_units(hru_wb_sq$area) / 1000 #m³/s per hru
hru_wb_sq$latq_lshru <- hru_wb_sq$latq * drop_units(hru_wb_sq$area) / (365.25 * 24 * 3600)
hru_wb_sq$perc_lshru <- hru_wb_sq$perc * drop_units(hru_wb_sq$area) / (365.25 * 24 * 3600)
hru_wb_sq$latq_ls_lshru <- hru_wb_sq$latq_ls * drop_units(hru_wb_sq$area) / (365.25 * 24 * 3600)

# for hru fluxes provided in tons/ha or kg/ha it might be appropriate to convert to tons or kg per hru
# to get rid of extremely high values for small hrus located along flow concentration pathways
hru_ls_sq$sedyld_tonshru <- hru_ls_sq$sedyld * drop_units(hru_ls_sq$area) / 10000
hru_ls_sq$surqno3_kghru <- hru_ls_sq$surqno3 * drop_units(hru_ls_sq$area) / 10000
hru_ls_sq$latno3_kghru <- hru_ls_sq$lat3no3 * drop_units(hru_ls_sq$area) / 10000
hru_ls_sq$sedorgp_kghru <- hru_ls_sq$sedorgp * drop_units(hru_ls_sq$area) / 10000
hru_ls_sq$surqsolp_kghru <- hru_ls_sq$surqsolp * drop_units(hru_ls_sq$area) / 10000
hru_ls_sq$sedminp_kghru <- hru_ls_sq$sedminp * drop_units(hru_ls_sq$area) / 10000
hru_pw_sq$percn_kghru <- hru_pw_sq$percn * drop_units(hru_pw_sq$area) / 10000
hru_pw_sq$pplnt_kghru <- hru_pw_sq$pplnt * drop_units(hru_pw_sq$area) / 10000
hru_pw_sq$nplnt_kghru <- hru_pw_sq$nplt * drop_units(hru_pw_sq$area) / 10000

# total amounts of N and P lost from hrus
hru_ls_sq$ntot <- hru_ls_sq$surqno3_kghru + hru_ls_sq$latno3_kghru + hru_pw_sq$percn_kghru
hru_ls_sq$ptot <- hru_ls_sq$sedminp_kghru + hru_ls_sq$surqsolp_kghru
hru_ls_sq$ntotha <- hru_ls_sq$surqno3 + hru_ls_sq$lat3no3 + hru_pw_sq$percn
hru_ls_sq$ptotha <- hru_ls_sq$sedminp + hru_ls_sq$surqsolp

# total N and P in channel network
cha_sq$n_out <- cha_sq$orgn_out+cha_sq$no2_out+cha_sq$no3_out+cha_sq$nh3_out
cha_sq$p_out <- cha_sq$solp_out+cha_sq$sedp_out

# concentrations in mg/l
cha_sq$no3_out_conc <- cha_sq$no3_out*1000/(cha_sq$flo_out*3600*24*365)
cha_sq$p_out_conc <- (cha_sq$solp_out+cha_sq$sedp_out)*1000/(cha_sq$flo_out*3600*24*365)
cha_sq$sed_out_conc <- cha_sq$sed_out*1000/(cha_sq$flo_out*3600*24*365)

# plot statusquo results -------------------------------------------------------
plot_interactive_map(hru_wb_sq, 'sw_ave', type = 'jenks', trans = FALSE) 
plot_interactive_map(hru_wb_sq, 'et', type = 'jenks', trans = FALSE) 
plot_interactive_map(hru_wb_sq, 'cn', type = 'jenks', trans = FALSE) 
plot_interactive_map(hru_wb_sq, 'surq_gen', type = 'jenks', trans = TRUE) #extremely high values the smaller the area (compared to previous exe), better show total m³ per hru
plot_interactive_map(hru_wb_sq, 'surq_gen_lshru', type = 'jenks', trans = TRUE) #l/s per hru, seems to be too high for some hrus
plot_interactive_map(hru_wb_sq, 'surq_runon_lshru', type = 'jenks', trans = TRUE) #l/s per hru, seems to be too high for some hrus
plot_interactive_map(hru_wb_sq, 'surq_cha', type = 'jenks', trans = TRUE)
plot_interactive_map(hru_wb_sq, 'surq_cha_lshru', type = 'jenks', trans = TRUE) #ok, but too high for some hrus
plot_interactive_map(hru_wb_sq, 'latq_ls', type = 'jenks', trans = TRUE)
plot_interactive_map(hru_wb_sq, 'latq_ls_lshru', type = 'jenks', trans = TRUE) #ok
plot_interactive_map(hru_ls_sq, 'sedyld', type = 'jenks', trans = TRUE) + cha #ok
plot_interactive_map(hru_ls_sq, 'sedyld_tonshru', type = 'jenks', trans = TRUE) #ok, for some hrus too high (for those with super high surq)
plot_interactive_map(hru_ls_sq, 'sedminp', type = 'jenks', trans = TRUE)
plot_interactive_map(hru_ls_sq, 'sedorgp', type = 'jenks', trans = TRUE)
plot_interactive_map(hru_ls_sq, 'surqsolp', type = 'jenks', trans = TRUE)
plot_interactive_map(hru_ls_sq, 'surqno3', type = 'jenks', trans = FALSE)
plot_interactive_map(hru_ls_sq, 'surqno3_kghru', type = 'jenks', trans = FALSE)
plot_interactive_map(hru_ls_sq, 'lat3no3', type = 'jenks', trans = FALSE)
plot_interactive_map(hru_ls_sq, 'latno3_kghru', type = 'jenks', trans = FALSE)
plot_interactive_map(hru_pw_sq, 'yield', type = 'jenks', trans = TRUE)
plot_interactive_map(cha_sq, 'flo_out', type = 'seq', trans = TRUE) # ok
plot_interactive_map(cha_sq, 'sed_out', type = 'seq', trans = TRUE) # outlet (cha67) extremely high
plot_interactive_map(cha_sq, 'solp_out', type = 'seq', trans = TRUE) #ok
plot_interactive_map(cha_sq, 'sedp_out', type = 'seq', trans = TRUE) #ok
plot_interactive_map(cha_sq, 'p_out', type = 'seq', trans = TRUE) #ok
plot_interactive_map(cha_sq, 'no3_out', type = 'seq', trans = TRUE) #ok
plot_interactive_map(cha_sq, 'n_out', type = 'seq', trans = TRUE) #ok
plot_interactive_map(cha_sq, 'no3_out_conc', type = 'seq', trans = TRUE) #ok
plot_interactive_map(cha_sq, 'p_out_conc', type = 'seq', trans = TRUE) #ok
plot_interactive_map(cha_sq, 'sed_out_conc', type = 'seq', trans = TRUE) # too high, exploding at outlet (cha27)

# ### plot differences with measures
# ### here only example grassed waterways

# paths to scenario results  ---------------------------------------------------
sq_path <- paste0(outputs_path,'/statusquo/cal1')
afforestation_path <- paste0(outputs_path,'/afforestation/cal1')
rota_path <- paste0(outputs_path,'/rotation/cal1')
cc_path <- paste0(outputs_path,'/covcrop/cal1')
pond_path <- paste0(outputs_path,'/pond/cal1')
all_path <- paste0(outputs_path,'/all/cal1')


# get SWAT+ results for Scenario ---------------------------------------------
# Modify the scenario eg. afforestation, all
wb_aa_gw <- read_tbl('hru_wb_aa.txt', all_path, 3)
ls_aa_gw <- read_tbl('hru_ls_aa.txt', all_path, 3)
pw_aa_gw <- read_tbl('hru_pw_aa.txt', all_path, 3)
cha_aa_sd_gw <- read_tbl('channel_sd_aa.txt', all_path, 3)

# join results with GIS data ---------------------------------------------------
hru_wb_gw <- left_join(hru, wb_aa_gw, 'name')
hru_ls_gw <- left_join(hru, ls_aa_gw, 'name')
hru_pw_gw <- left_join(hru, pw_aa_gw, 'name')
cha_gw <- left_join(cha, cha_aa_sd_gw, 'name')

# Unit conversions etc. --------------------------------------------------------

# for hru fluxes provided in mm it might be appropriate to convert to l/s per hru
# to get rid of extremely high values for small hrus located along flow concentration pathways
hru_wb_gw$surq_gen_lshru <- hru_wb_gw$surq_gen * drop_units(hru_wb_gw$area) / (365.25 * 24 * 3600)
hru_wb_gw$surq_ls_lshru <- hru_wb_gw$surq_ls * drop_units(hru_wb_gw$area) / (365.25 * 24 * 3600)
hru_wb_gw$surq_cha_lshru <- hru_wb_gw$surq_cha * drop_units(hru_wb_gw$area) / (365.25 * 24 * 3600)
hru_wb_gw$surq_runon_lshru <- hru_wb_gw$surq_runon * drop_units(hru_wb_gw$area) / (365.25 * 24 * 3600)
hru_wb_gw$surq_runon_cmahru <- hru_wb_gw$surq_runon * drop_units(hru_wb_gw$area) / 1000 #m³/s per hru
hru_wb_gw$latq_lshru <- hru_wb_gw$latq * drop_units(hru_wb_gw$area) / (365.25 * 24 * 3600)
hru_wb_gw$perc_lshru <- hru_wb_gw$perc * drop_units(hru_wb_gw$area) / (365.25 * 24 * 3600)
hru_wb_gw$latq_ls_lshru <- hru_wb_gw$latq_ls * drop_units(hru_wb_gw$area) / (365.25 * 24 * 3600)

# for hru fluxes provided in tons/ha or kg/ha it might be appropriate to convert to tons or kg per hru
# to get rid of extremely high values for small hrus located along flow concentration pathways
hru_ls_gw$sedyld_tonshru <- hru_ls_gw$sedyld * drop_units(hru_ls_gw$area) / 10000
hru_ls_gw$surqno3_kghru <- hru_ls_gw$surqno3 * drop_units(hru_ls_gw$area) / 10000
hru_ls_gw$latno3_kghru <- hru_ls_gw$lat3no3 * drop_units(hru_ls_gw$area) / 10000
hru_ls_gw$sedorgp_kghru <- hru_ls_gw$sedorgp * drop_units(hru_ls_gw$area) / 10000
hru_ls_gw$surqsolp_kghru <- hru_ls_gw$surqsolp * drop_units(hru_ls_gw$area) / 10000
hru_ls_gw$sedminp_kghru <- hru_ls_gw$sedminp * drop_units(hru_ls_gw$area) / 10000
hru_pw_gw$percn_kghru <- hru_pw_gw$percn * drop_units(hru_pw_gw$area) / 10000
hru_pw_gw$pplnt_kghru <- hru_pw_gw$pplnt * drop_units(hru_pw_gw$area) / 10000
hru_pw_gw$nplnt_kghru <- hru_pw_gw$nplt * drop_units(hru_pw_gw$area) / 10000

# total amounts of N and P lost from hrus
hru_ls_gw$ntot <- hru_ls_gw$surqno3_kghru + hru_ls_gw$latno3_kghru + hru_pw_gw$percn_kghru
hru_ls_gw$ptot <- hru_ls_gw$sedminp_kghru + hru_ls_gw$surqsolp_kghru
hru_ls_gw$ntotha <- hru_ls_gw$surqno3 + hru_ls_gw$lat3no3 + hru_pw_gw$percn
hru_ls_gw$ptotha <- hru_ls_gw$sedminp + hru_ls_gw$surqsolp

# total N and P in channel network
cha_gw$n_out <- cha_gw$orgn_out+cha_gw$no2_out+cha_gw$no3_out+cha_gw$nh3_out
cha_gw$p_out <- cha_gw$solp_out+cha_gw$sedp_out

# concentrations in mg/l
cha_gw$no3_out_conc <- cha_gw$no3_out*1000/(cha_gw$flo_out*3600*24*365)
cha_gw$p_out_conc <- (cha_gw$solp_out+cha_gw$sedp_out)*1000/(cha_gw$flo_out*3600*24*365)
cha_gw$sed_out_conc <- cha_gw$sed_out*1000/(cha_gw$flo_out*3600*24*365)

# differences
# ...diff = measure - statusquo
# ...rel = (measure - statusquo)/statusquo*100

hru_wb_gw$surq_gen_lshru_diff <- hru_wb_gw$surq_gen_lshru - hru_wb_sq$surq_gen_lshru
hru_wb_gw$surq_gen_diff <- hru_wb_gw$surq_gen - hru_wb_sq$surq_gen
hru_wb_gw$surq_runon_lshru_diff <- hru_wb_gw$surq_runon_lshru - hru_wb_sq$surq_runon_lshru
hru_wb_gw$srunls_diffrel <- (hru_wb_gw$surq_runon_lshru - hru_wb_sq$surq_runon_lshru)/hru_wb_sq$surq_runon_lshru*100
hru_wb_gw$sqls_diffrel <- (hru_wb_gw$surq_gen_lshru - hru_wb_sq$surq_gen_lshru)/hru_wb_sq$surq_gen_lshru*100
hru_wb_gw$lqls_diffrel <- (hru_wb_gw$latq_ls_lshru - hru_wb_sq$latq_ls_lshru)/hru_wb_sq$latq_ls_lshru*100
hru_wb_gw$cn_diff <- hru_wb_gw$cn - hru_wb_sq$cn
hru_wb_gw$sw_ave_diff <- hru_wb_gw$sw_ave - hru_wb_sq$sw_ave
hru_ls_gw$sedyld_diff <- hru_ls_gw$sedyld_tonshru-hru_ls_sq$sedyld_tonshru
hru_ls_gw$sedyld_diffrel <- (hru_ls_gw$sedyld_tonshru-hru_ls_sq$sedyld_tonshru)/hru_ls_sq$sedyld_tonshru*100
hru_ls_gw$sedorgp_diff <- hru_ls_gw$sedorgp_kghru-hru_ls_sq$sedorgp_kghru
hru_ls_gw$sedminp_diff <- hru_ls_gw$sedminp_kghru-hru_ls_sq$sedminp_kghru
hru_ls_gw$surqsolp_diff <- hru_ls_gw$surqsolp_kghru-hru_ls_sq$surqsolp_kghru
hru_ls_gw$p_diff <- hru_ls_gw$surqsolp_diff+hru_ls_gw$sedminp_diff+hru_ls_gw$sedorgp_diff
hru_ls_gw$p_diffrel <- (hru_ls_gw$sedorgp_kghru+hru_ls_gw$surqsolp_kghru+hru_ls_gw$sedminp_kghru-hru_ls_sq$sedorgp_kghru-hru_ls_sq$surqsolp_kghru-hru_ls_sq$sedminp_kghru)/(hru_ls_sq$sedorgp_kghru+hru_ls_sq$surqsolp_kghru+hru_ls_sq$sedminp_kghru)*100
hru_ls_gw$n_diffrel <- (hru_ls_gw$latno3_kghru+hru_ls_gw$surqno3_kghru-hru_ls_sq$latno3_kghru-hru_ls_sq$surqno3_kghru)/(hru_ls_sq$latno3_kghru+hru_ls_sq$surqno3_kghru)*100
hru_ls_gw$p_diffha <- hru_ls_gw$ptotha-hru_ls_sq$ptotha
hru_ls_gw$n_diffha <- hru_ls_gw$ntotha-hru_ls_sq$ntotha
cha_gw$sedp_out_diff <- cha_gw$sedp_out-cha_sq$sedp_out
cha_gw$solp_out_diff <- cha_gw$solp_out-cha_sq$solp_out
cha_gw$p_out_diff <- cha_gw$sedp_out_diff+cha_gw$solp_out_diff
cha_gw$p_out_diffrel <- cha_gw$p_out_diff/cha_sq$p_out*100
cha_gw$n_out_diff <- cha_gw$n_out-cha_sq$n_out
cha_gw$n_out_diffrel <- cha_gw$n_out_diff/cha_sq$n_out*100
cha_gw$sed_out_diff <- cha_gw$sed_out-cha_sq$sed_out
cha_gw$sed_out_diffrel <- cha_gw$sed_out_diff/cha_sq$sed_out*100
cha_gw$flo_out_diff <- cha_gw$flo_out-cha_sq$flo_out
cha_gw$flo_out_diffrel <- cha_gw$flo_out_diff/cha_sq$flo_out*100

# plot differences (nswrm effects)

#plot_interactive_map(hru_wb_gw, 'sqls_diffrel', type = 'jenks2', trans = TRUE)
plot_interactive_map(hru_wb_gw, 'cn_diff', type = 'jenks2', trans = TRUE)
plot_interactive_map(hru_ls_gw, 'sedyld_diff', type = 'div', trans = TRUE)
plot_interactive_map(hru_ls_gw, 'sedyld_diffrel', type = 'div', trans = TRUE)
plot_interactive_map(cha_gw, 'p_out_diff', type = 'div', trans = TRUE)
plot_interactive_map(cha_gw, 'p_out_diffrel', type = 'div', trans = TRUE)
plot_interactive_map(cha_gw, 'n_out_diff', type = 'div', trans = TRUE)
plot_interactive_map(cha_gw, 'n_out_diffrel', type = 'div', trans = TRUE)
plot_interactive_map(cha_gw, 'sed_out_diff', type = 'div', trans = TRUE)
plot_interactive_map(cha_gw, 'sed_out_diffrel', type = 'div', trans = TRUE)
plot_interactive_map(cha_gw, 'flo_out_diff', type = 'div', trans = TRUE)
plot_interactive_map(cha_gw, 'flo_out_diffrel', type = 'div', trans = TRUE)
