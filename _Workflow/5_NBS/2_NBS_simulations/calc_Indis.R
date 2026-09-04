#############################################################################################
##
##~~~~~~~~~~~~~~~ Functions calculating performance indicators ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
##
##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
## Indicator     | Description                                                   | Function(parameter)[output]                    | Files (to be defined in print.prt)
##~~~~~~~~~~~~~~~|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
## Q_mean        | mean discharge [m?/s]                                         | ind_cha_aa(path, channel)[1]                   | channel_sd_aa.txt
## Nload         | total N load [kg/yr]                                          | ind_cha_aa(path, channel)[2]                   | channel_sd_aa.txt
## Pload         | total P load [kg/yr]                                          | ind_cha_aa(path, channel)[3]                   | channel_sd_aa.txt
## Sedload       | total sediment load [tons/yr]                                 | ind_cha_aa(path, channel)[4]                   | channel_sd_aa.txt
##---------------|---------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------
## Q_max         | maximum daily discharge [m?/s]                                | ind_cha_day(path, channel, 'Q_max')[1]         | channel_sd_day.txt
## Q_max_aa      | average maximum daily discharge of each year [m?/s]           | ind_cha_day(path, channel, 'Q_max')[2]         | channel_sd_day.txt
## Q_p95         | 95 percentile daily discharge [m?/s]                          | ind_cha_day(path, channel, 'Q_p95')[3]         | channel_sd_day.txt
## Q_p90         | 90 percentile daily discharge [m?/s]                          | ind_cha_day(path, channel, 'Q_p90')[4]         | channel_sd_day.txt
## Q_p50         | 50 percentile daily discharge [m?/s]                          | ind_cha_day(path, channel, 'Q_p50')[5]         | channel_sd_day.txt
## Q_p10         | 10 percentile daily discharge [m?/s]                          | ind_cha_day(path, channel, 'Q_p10')[6]         | channel_sd_day.txt
## Q_p05         | 5 percentile daily discharge [m?/s]                           | ind_cha_day(path, channel, 'Q_p05')[7]         | channel_sd_day.txt
## Q_min         | minimum daily discharge [m?/s]                                | ind_cha_day(path, channel, 'Q_min')[8]         | channel_sd_day.txt
## Q_min_aa      | average minimum daily discharge of each year  [m?/s]          | ind_cha_day(path, channel, 'Q_min')[9]         | channel_sd_day.txt
## Q_maxmin      | Q_max/Q_min ratio []                                          | ind_cha_day(path, channel, 'Q_maxmin')[8]      | channel_sd_day.txt
## Q_maxmin_aa   | Q_max_aa/Q_min_aa ratio []                                    | ind_cha_day(path, channel, 'Q_maxmin')[8]      | channel_sd_day.txt
## Q_low_days    | frequency daily discharge is below low flow threshold []      | ind_cha_day(path, channel, 'Q_low_days', threshold_lowQ)[11]       | channel_sd_day.txt
## Q_high_days   | frequency daily discharge is below high flow threshold []     | ind_cha_day(path, channel, 'Q_high_days', threshold_highQ)[12]     | channel_sd_day.txt
## Nconc_days    | frequency total N concentrations is below threshold []        | ind_cha_day(path, channel, 'Nconc_days', threshold_N)[13]          | channel_sd_day.txt
## Pconc_days    | frequency total P concentrations is below threshold []        | ind_cha_day(path, channel, 'Pconc_days', threshold_P)[14]          | channel_sd_day.txt
## Sedconc_days  | frequency total sediment concentrations is below threshold [] | ind_cha_day(path, channel, 'Sedconc_days', threshold_Sed)[15]      | channel_sd_day.txt
##---------------|---------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------
## N_loss        | average annual Nitrogen loss from land objects [kg N/ha,yr]   | ind_hru_aa_nb(path, area)[1] # area='basin' by default, area='agr' for cropland only (hru_agr.txt must be provided!) | hru_nb_aa.txt, hru_ls_aa.txt, hru_pw_aa.txt
## P_loss        | average annual Phosphorus loss from land objects [kg P/ha,yr] | ind_hru_aa_nb(path, area)[3] # area='basin' by default, area='agr' for cropland only (hru_agr.txt must be provided!) | hru_nb_aa.txt, hru_ls_aa.txt, hru_pw_aa.txt
## Sed_loss      | average annual Sediment loss from land objects [tons/ha,yr]   | ind_hru_aa_nb(path, area)[5] # area='basin' by default, area='agr' for cropland only (hru_agr.txt must be provided!) | hru_nb_aa.txt, hru_ls_aa.txt, hru_pw_aa.txt
## N_loss_ratio  | average annual Nitrogen loss/input ratio []                   | ind_hru_aa_nb(path, area)[2] # area='basin' by default, area='agr' for cropland only (hru_agr.txt must be provided!) | hru_nb_aa.txt, hru_ls_aa.txt, hru_pw_aa.txt
## P_loss_ratio  | average annual Phosphorus loss/input ratio []                 | ind_hru_aa_nb(path, area)[4] # area='basin' by default, area='agr' for cropland only (hru_agr.txt must be provided!) | hru_nb_aa.txt, hru_ls_aa.txt, hru_pw_aa.txt
##---------------|---------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------
## sw            | average annual total soil moisture [mm]                       | ind_hru_aa_wb(path, area)[1] # area='basin' by default, area='agr' for cropland only (hru_agr.txt must be provided!) | hru_wb_aa.txt
## sw300         | average annual soil moisture in top 30 cm [mm]                | ind_hru_aa_wb(path, area)[2] # area='basin' by default, area='agr' for cropland only (hru_agr.txt must be provided!) | hru_wb_aa.txt
## perc          | average annual percolation [mm]                               | ind_hru_aa_wb(path, area)[3] # area='basin' by default, area='agr' for cropland only (hru_agr.txt must be provided!) | hru_wb_aa.txt
##---------------|---------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------
## sw            | average soil moisture in period of interest [mm]              | ind_hru_mon_wb(path, sw, period, area) # e.g. period=c(5:9), area='basin' by default, area='agr' for cropland only (hru_agr.txt must be provided!) | hru_wb_mon.txt
## sw300         | average soil moisture (top 30cm) in period of interest [mm]   | ind_hru_mon_wb(path, sw300, period, area) # e.g. period=c(5:9), area='basin' by default, area='agr' for cropland only (hru_agr.txt must be provided!) | hru_wb_mon.txt
##---------------|---------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------
## grain_units   | average annual sum of grain units in whole 'basin' []         | ind_bsn_aa_crp(path, grain_units, 'grain_units', crops_sel)        | 'basin'_crop_yld_aa.txt
## cropland      | average annual area of cropland in whole 'basin' [ha]         | ind_bsn_aa_crp(path, grain_units, 'cropland', crops_sel)           | 'basin'_crop_yld_aa.txt
## crop_yld      | average annual crop-specific yields [tons drymass/ha]         | ind_bsn_aa_crp_ha_Y(path, crops_sel)                                     | basin_crop_yld_aa.txt
## crop_ha       | average annual crop-specific area in whole basin [ha]         | ind_bsn_aa_crp_ha_Y(path, crops_sel)                                     | basin_crop_yld_aa.txt

foo1 <- function(x){
  for( i in x ){
    if( ! require( i , character.only = TRUE ) ){
      stop('Missing pinned package ', i, '. Run install_or_repair_packages.bat from the bundle root.')
    }
  }
}

foo2 <- function(x){
  #  require returns TRUE invisibly if it was able to load package
  if( ! require( x , character.only = TRUE ) ){
    stop('Missing pinned package ', x, '. Run install_or_repair_packages.bat from the bundle root.')
  }
}

foo3 <- function(x){
  #  require returns TRUE invisibly if it was able to load package
  if( ! require( x , character.only = TRUE ) ){
    stop('Missing pinned package ', x, '. Run install_or_repair_packages.bat from the bundle root.')
  }
}

is.integer0 <- function(x){
  is.integer(x) && length(x) == 0L
}

`%nin%` = Negate(`%in%`)

channel_name <- function(channel) if (is.numeric(channel)) paste0("cha", channel) else as.character(channel)

set2wd <- function(x) setwd(x)

# Read table function
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

read_con_file <- function(file_path) {
  obj_names <- c("id", "name", "gis_id", "area", "lat", "lon", "elev",
                 "obj_id", "wst", "cst", "ovfl", "rule", "out_tot")
  con_names <- c("obj_typ", "obj_id", "hyd_typ", "frac")
  
  if(file.exists(file_path)) {
    con_mtx <- fread(file_path, skip = 2, sep = NULL, sep2 = NULL, header = F) %>%
      unlist(.) %>%
      unname(.) %>%
      str_trim(.) %>%
      str_split(., '[:space:]+', simplify = T)
    
    n_con <- (dim(con_mtx)[2]-length(obj_names)) / length(con_names)
    if(n_con > 0) {
      rep_ids <- 1:n_con
    } else {
      rep_ids <- NULL
    }
    
    con_names <- paste(rep(con_names, n_con),
                       rep(rep_ids, each = length(con_names)),
                       sep = '_')
    
    col_types <- unlist(strsplit(c('iciddddiciiii', rep('cicd', n_con)), '')) %>%
      recode(., c = 'character', d = 'numeric', i = 'integer')
    
    con_tbl <- as_tibble(con_mtx, validate = NULL,
                         .name_repair = ~ c(obj_names, con_names)) %>%
      map2_df(., col_types, ~ as(.x, .y))
    
    # id_int <- c(1,3,8,13, 15 + (rep_ids - 1)*4)
    # con_tbl[ , id_int] <- map_df(con_tbl[ , id_int], as.integer)
    #
    # id_dbl <- c(4:7, 17 + (rep_ids - 1)*4)
    # con_tbl[ , id_dbl] <- map_df(con_tbl[ , id_dbl], as.numeric)
  } else {
    con_tbl <- tibble(!!!rep(NA, length(obj_names)),
                      .rows = 0, .name_repair = ~ obj_names)
    
    col_types <- unlist(strsplit('iciddddiciiii', '')) %>%
      recode(., c = 'character', d = 'numeric', i = 'integer')
    
    con_tbl <- map2_df(con_tbl, col_types, ~ as(.x, .y))
  }
  
  return(con_tbl)
}

# Indicators based on annual average channel output
ind_cha_aa <- function(path, channel, ensemble=F){
  
  if(ensemble==F){
    df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), 
                         Q_mean=NA, 
                         Nload=NA, 
                         Pload=NA, 
                         Sedload=NA)
    for (i in 1:length(path)) {
      # Read file
      channel_sd_aa <- read_tbl('channel_sd_aa.txt', path[i], 3)
      
      # Specify the columns you want to keep
      columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                           "flo_out", "sed_out", "orgn_out", "sedp_out", "no3_out", 
                           "solp_out", "nh3_out", "no2_out")
      
      # Create a new data frame with only the selected columns
      df_selected <- channel_sd_aa[, columns_to_keep]
      
      df_selected <- df_selected %>%
        mutate(total_N = no3_out + orgn_out + nh3_out + no2_out) %>% 
        mutate(total_P = solp_out + sedp_out)
      
      Q_mean <- round(df_selected$flo_out[which(df_selected$name== channel_name(channel))],3)
      Nload <- round(df_selected$total_N[which(df_selected$name== channel_name(channel))],3)
      Pload <- round(df_selected$total_P[which(df_selected$name== channel_name(channel))],3)
      Sedload <- round(df_selected$sed_out[which(df_selected$name== channel_name(channel))],3)
      
      df_out[i,2:5] <- c(Q_mean, Nload, Pload, Sedload)
    }
    
    write.csv(df_out, paste(wd, scen_out, '1_cha_aa.csv', sep='/'),row.names = F, quote = F)

  }
  
  if(ensemble==T){
    df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1),
                         Q_mean=NA, 
                         Nload=NA, 
                         Pload=NA, 
                         Sedload=NA,
                         Q_mean_lower=NA, 
                         Nload_lower=NA, 
                         Pload_lower=NA, 
                         Sedload_lower=NA,
                         Q_mean_upper=NA, 
                         Nload_upper=NA, 
                         Pload_upper=NA, 
                         Sedload_upper=NA)
    for (i in 1:length(path)) {
      # Read file
      path_ext <- dir(path[i], pattern='cal', full.names = T)
      df_out2 <- data.frame(Q_mean=NA, 
                            Nload=NA, 
                            Pload=NA, 
                            Sedload=NA)
      for (k in 1:length(path_ext)){
        channel_sd_aa <- read_tbl('channel_sd_aa.txt', path_ext[k], 3)
        
        # Specify the columns you want to keep
        columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                             "flo_out", "sed_out", "orgn_out", "sedp_out", "no3_out", 
                             "solp_out", "nh3_out", "no2_out")
        
        # Create a new data frame with only the selected columns
        df_selected <- channel_sd_aa[, columns_to_keep]
        
        df_selected <- df_selected %>%
          mutate(total_N = no3_out + orgn_out + nh3_out + no2_out) %>% 
          mutate(total_P = solp_out + sedp_out)
        
        Q_mean <- round(df_selected$flo_out[which(df_selected$name== channel_name(channel))],3)
        Nload <- round(df_selected$total_N[which(df_selected$name== channel_name(channel))],3)
        Pload <- round(df_selected$total_P[which(df_selected$name== channel_name(channel))],3)
        Sedload <- round(df_selected$sed_out[which(df_selected$name== channel_name(channel))],3)
        
        df_out2[k,1:4] <- c(Q_mean, Nload, Pload, Sedload)
      }
      
      write.csv(df_out2, paste0(path[i],'/1_cha_aa.csv'),row.names = F, quote = F)
      
      df_out[i,2:5] <- colMeans(df_out2)  
      df_out[i,6:9] <- lapply(df_out2, FUN='min')
      df_out[i,10:13] <- lapply(df_out2, FUN='max')
    }
    
  }
  
  return(df_out)
}

# Indicators based on daily channel output
# Option I: channel_sd_day (all channels will be printed, => try to avoid)
ind_cha_dayI <- function(path,
                         channel,
                         ind='all', 
                         threshold_lowQ=0.0344,
                         threshold_highQ=2.7911,
                         threshold_N=2.3, 
                         threshold_P=0.082, 
                         threshold_Sed=50,
                         ensemble=F){

  if(ensemble==F){
    df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), 
                         Q_max=NA,
                         Q_max_aa = NA,
                         Q_p95=NA, 
                         Q_p90=NA,
                         Q_p50=NA, 
                         Q_p10=NA, 
                         Q_p05=NA, 
                         Q_min=NA,
                         Q_min_aa = NA,
                         Q_maxmin=NA,
                         Q_maxmin_aa = NA,
                         Q_low_days=NA,
                         Q_high_days=NA,
                         Nconc_days=NA, 
                         Pconc_days=NA,
                         Sedconc_days=NA)
    
    for (i in 1:length(path)) {
      # Read file
      channel_sd_day <- read_tbl('channel_sd_day.txt', path[i], 3)
      
      if('Q_maxmin' %in% ind | 'Q_max' %in% ind  | 'Q_min' %in% ind | 'all' %in% ind){
        # Specify the columns you want to keep
        columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                             "flo_out")
        
        # Create a new data frame with only the selected columns
        df_selected <- channel_sd_day[, columns_to_keep]
        
        # Handle zero flow (defining 0.00000001 cm?/s)
        df_selected$flo_out[which(df_selected$flo_out==0)] <- 1e-40
        
        # Group data by channel (replace "name" with the actual column name for channel)
        max_min_ratio <- df_selected %>%
          group_by(name) %>% 
          summarise(
            max_discharge = max(flo_out, na.rm = TRUE),
            min_discharge = min(flo_out, na.rm = TRUE),
            extreme_streamflow_ratio = max_discharge / min_discharge
          )        
        
        max_min_ratio_aa <- df_selected %>%
          group_by(name,yr) %>% 
          summarise(
            max_discharge_yr = max(flo, na.rm = TRUE),
            min_discharge_yr = min(flo, na.rm = TRUE),
          ) %>% 
          group_by(name) %>% 
          summarise(
            max_discharge_aa = mean(max_discharge_yr, na.rm = TRUE),
            min_discharge_aa = mean(min_discharge_yr, na.rm = TRUE),
            extreme_streamflow_ratio_aa = max_discharge_aa / min_discharge_aa
          )
        
        df_out[i,2] <- round(max_min_ratio$max_discharge[which(max_min_ratio$name== channel_name(channel))],3)
        df_out[i,3] <- round(max_min_ratio_aa$max_discharge_aa[which(max_min_ratio_aa$name== channel_name(channel))],3)
        df_out[i,9] <- round(max_min_ratio$min_discharge[which(max_min_ratio$name== channel_name(channel))],3)
        df_out[i,10] <- round(max_min_ratio_aa$min_discharge_aa[which(max_min_ratio_aa$name== channel_name(channel))],3)
        df_out[i,11] <- round(max_min_ratio$extreme_streamflow_ratio[which(max_min_ratio$name== channel_name(channel))],3)
        df_out[i,12] <- round(max_min_ratio_aa$extreme_streamflow_ratio_aa[which(max_min_ratio_aa$name== channel_name(channel))],3)
      }
      if('Q_p50' %in% ind | 'all' %in% ind){
        # Specify the columns you want to keep
        columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                             "flo_out")
        
        # Create a new data frame with only the selected columns
        df_selected <- channel_sd_day[, columns_to_keep]
        
        # Handle zero flow (defining 0.00000001 cm?/s)
        df_selected$flo_out[which(df_selected$flo_out==0)] <- 1e-40
        
        # Group data by channel (replace "name" with the actual column name for channel)
        p50 <- df_selected %>%
          group_by(name) %>% 
          summarise(
            p50_discharge = quantile(flo_out, probs = 0.50, na.rm = TRUE)
          )
        
        df_out[i,6] <- round(as.numeric(p50$p50_discharge[which(p50$name== channel_name(channel))]),3)
      }
      if('Q_p95p05' %in% ind | 'Q_p95' %in% ind | 'Q_p05' %in% ind | 'all' %in% ind){
        # Specify the columns you want to keep
        columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                             "flo_out")
        
        # Create a new data frame with only the selected columns
        df_selected <- channel_sd_day[, columns_to_keep]
        
        # Handle zero flow (defining 0.00000001 cm?/s)
        df_selected$flo_out[which(df_selected$flo_out==0)] <- 1e-40
        # Group data by channel (replace "name" with the actual column name for channel)
        Q_p95p05 <- df_selected %>%
          group_by(name) %>%
          summarise(
            p05_discharge = quantile(flo_out, probs = 0.05, na.rm = TRUE),
            p95_discharge = quantile(flo_out, probs = 0.95, na.rm = TRUE)
          )
        df_out[i,4] <- round(as.numeric(Q_p95p05$p95_discharge[which(Q_p95p05$name== channel_name(channel))]),3)
        df_out[i,8] <- round(as.numeric(Q_p95p05$p05_discharge[which(Q_p95p05$name== channel_name(channel))]),3)
      }
      if('Q_p90p10' %in% ind | 'Q_p90' %in% ind | 'Q_p10' %in% ind | 'all' %in% ind){
        # Specify the columns you want to keep
        columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                             "flo_out")
        
        # Create a new data frame with only the selected columns
        df_selected <- channel_sd_day[, columns_to_keep]
        
        # Handle zero flow (defining 0.00000001 cm?/s)
        df_selected$flo_out[which(df_selected$flo_out==0)] <- 1e-40
        # Group data by channel (replace "name" with the actual column name for channel)
        Q_p90p10 <- df_selected %>%
          group_by(name) %>%
          summarise(
            p10_discharge = quantile(flo_out, probs = 0.10, na.rm = TRUE),
            p90_discharge = quantile(flo_out, probs = 0.90, na.rm = TRUE),
          )
        df_out[i,5] <- round(as.numeric(Q_p90p10$p90_discharge[which(Q_p90p10$name== channel_name(channel))]),3)
        df_out[i,5] <- round(as.numeric(Q_p90p10$p10_discharge[which(Q_p90p10$name== channel_name(channel))]),3)
      }
      if('Q_low_days' %in% ind | 'Q_high_days' %in% ind | 'Nconc_days' %in% ind | 'Pconc_days' %in% ind | 'Sedconc_days' %in% ind | 'all' %in% ind){
        # Specify the columns you want to keep
        columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                             "flo_out", "sed_out", "orgn_out", "sedp_out", "no3_out", 
                             "solp_out", "nh3_out", "no2_out")
        
        # Create a new data frame with only the selected columns
        df_selected <- channel_sd_day[, columns_to_keep]
        
        # Calculate the sum of no3, orgn, nh3, and no2
        df_selected <- df_selected %>%
          mutate(total_N = no3_out + orgn_out + nh3_out + no2_out) %>% 
          mutate(N_conc_mgl = ifelse(flo_out == 0, 0, (total_N * 1000) / (flo_out * 86400))) %>% 
          mutate(total_P = solp_out + sedp_out) %>% 
          mutate(P_conc_mgl = ifelse(flo_out == 0, 0, (total_P * 1000) / (flo_out * 86400))) %>% 
          mutate(sed_conc_mgl = ifelse(flo_out == 0, 0, (sed_out * 1e6) / (flo_out * 86400)))
        
        # Calculate the frequency of exceeding the thresholds for each "unit" (channel)
        frequency_summary_mean <- df_selected %>%
          group_by(name) %>%
          summarize(
            freq_below_threshold_lowQ = mean(flo_out <= threshold_lowQ, na.rm = TRUE),
            freq_beyond_threshold_highQ = mean(flo_out > threshold_highQ, na.rm = TRUE),
            freq_beyond_threshold_N = mean(N_conc_mgl > threshold_N, na.rm = TRUE),
            freq_beyond_threshold_P = mean(P_conc_mgl > threshold_P, na.rm = TRUE),
            freq_beyond_threshold_Sed = mean(sed_conc_mgl > threshold_Sed, na.rm = TRUE)
          )
        df_out[i,15] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_N[which(frequency_summary_mean$name== channel_name(channel))]),3)
        df_out[i,16] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_P[which(frequency_summary_mean$name== channel_name(channel))]),3)
        df_out[i,17] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_Sed[which(frequency_summary_mean$name== channel_name(channel))]),3)
        df_out[i,13] <- round(as.numeric(frequency_summary_mean$freq_below_threshold_lowQ[which(frequency_summary_mean$name== channel_name(channel))]),3)
        df_out[i,14] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_highQ[which(frequency_summary_mean$name== channel_name(channel))]),3)
      }
    }
    
    write.csv(df_out, paste(wd, scen_out, '2_cha_day.csv', sep='/'),row.names = F, quote = F)
    
}
  
  if(ensemble==T){
    df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), 
                         Q_max=NA,
                         Q_max_aa=NA,
                         Q_p95=NA, 
                         Q_p90=NA,
                         Q_p50=NA, 
                         Q_p10=NA, 
                         Q_p05=NA, 
                         Q_min=NA,
                         Q_min_aa=NA,
                         Q_maxmin=NA,
                         Q_maxmin_aa=NA,
                         Q_low_days=NA,
                         Q_high_days=NA,
                         Nconc_days=NA, 
                         Pconc_days=NA,
                         Sedconc_days=NA,
                         Q_max_lower=NA,
                         Q_max_aa_lower=NA,
                         Q_p95_lower=NA,
                         Q_p90_lower=NA,
                         Q_p50_lower=NA,
                         Q_p10_lower=NA,
                         Q_p05_lower=NA,
                         Q_min_lower=NA,
                         Q_min_aa_lower=NA,
                         Q_maxmin_lower=NA,
                         Q_maxmin_aa_lower=NA,
                         Q_low_days_lower=NA,
                         Q_high_days_lower=NA,
                         Nconc_days_lower=NA,
                         Pconc_days_lower=NA,
                         Sedconc_days_lower=NA,
                         Q_max_upper=NA,
                         Q_max_aa_upper=NA,
                         Q_p95_upper=NA,
                         Q_p90_upper=NA,
                         Q_p50_upper=NA,
                         Q_p10_upper=NA,
                         Q_p05_upper=NA,
                         Q_min_upper=NA,
                         Q_min_aa_upper=NA,
                         Q_maxmin_upper=NA,
                         Q_maxmin_aa_upper=NA,
                         Q_low_days_upper=NA,
                         Q_high_days_upper=NA,
                         Nconc_days_upper=NA,
                         Pconc_days_upper=NA,
                         Sedconc_days_upper=NA)
    
    for (i in 1:length(path)) {
      # Read file
      path_ext <- dir(path[i], full.names = T, pattern = 'cal')
      df_out2 <- data.frame(Q_max=NA,
                            Q_max_aa=NA,
                            Q_p95=NA,
                            Q_p90=NA,
                            Q_p50=NA,
                            Q_p10=NA,
                            Q_p05=NA,
                            Q_min=NA,
                            Q_min_aa=NA,
                            Q_maxmin=NA,
                            Q_maxmin_aa=NA,
                            Q_low_days=NA,
                            Q_high_days=NA,
                            Nconc_days=NA,
                            Pconc_days=NA,
                            Sedconc_days=NA)
      for (k in 1:length(path_ext)){
        channel_sd_day <- read.table('channel_sd_day.txt', path_ext[k], 3)
        
        if('Q_maxmin' %in% ind | 'Q_max' %in% ind  | 'Q_min' %in% ind | 'all' %in% ind){
          
          # convert m?/day to m?/s
          channel_sd_day$flo <- channel_sd_day$flo/86400
          
          # Handle zero flow (defining 0.00000001 cm?/s)
          channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
          
          # Group data by channel (replace "name" with the actual column name for channel)
          max_min_ratio <- channel_sd_day %>%
            group_by(name) %>% 
            summarise(
              max_discharge = max(flo, na.rm = TRUE),
              min_discharge = min(flo, na.rm = TRUE),
              extreme_streamflow_ratio = max_discharge / min_discharge
            )
          max_min_ratio_aa <- channel_sd_day %>%
            group_by(name,yr) %>% 
            summarise(
              max_discharge_yr = max(flo, na.rm = TRUE),
              min_discharge_yr = min(flo, na.rm = TRUE),
            ) %>% 
            group_by(name) %>% 
            summarise(
              max_discharge_aa = mean(max_discharge_yr, na.rm = TRUE),
              min_discharge_aa = mean(min_discharge_yr, na.rm = TRUE),
              extreme_streamflow_ratio_aa = max_discharge_aa / min_discharge_aa
            )
          
          df_out2[k,1] <- round(max_min_ratio$max_discharge[which(max_min_ratio$name== channel_name(channel))],3)
          df_out2[k,2] <- round(max_min_ratio_aa$max_discharge_aa[which(max_min_ratio_aa$name== channel_name(channel))],3)
          df_out2[k,8] <- round(max_min_ratio$min_discharge[which(max_min_ratio$name== channel_name(channel))],3)
          df_out2[k,9] <- round(max_min_ratio_aa$min_discharge_aa[which(max_min_ratio_aa$name== channel_name(channel))],3)
          df_out2[k,10] <- round(max_min_ratio$extreme_streamflow_ratio[which(max_min_ratio$name== channel_name(channel))],3)
          df_out2[k,11] <- round(max_min_ratio_aa$extreme_streamflow_ratio_aa[which(max_min_ratio_aa$name== channel_name(channel))],3)
        }
        if('Q_p50' %in% ind | 'all' %in% ind){
          
          # convert m?/day to m?/s
          if('all' %in% ind == F) channel_sd_day$flo <- channel_sd_day$flo/86400
          
          # Handle zero flow (defining 0.00000001 cm?/s)
          channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
          
          # Group data by channel (replace "name" with the actual column name for channel)
          p50 <- channel_sd_day %>%
            group_by(name) %>% 
            summarise(
              p50_discharge = quantile(flo, probs = 0.50, na.rm = TRUE)
            )
          
          df_out2[k,5] <- round(as.numeric(p50$p50_discharge[which(p50$name== channel_name(channel))]),3)
        }
        if('Q_p95p05' %in% ind | 'Q_p95' %in% ind | 'Q_p05' %in% ind | 'all' %in% ind){
          
          # convert m?/day to m?/s
          if('all' %in% ind == F) channel_sd_day$flo <- channel_sd_day$flo/86400
          
          # Handle zero flow (defining 0.00000001 cm?/s)
          channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
          
          # Group data by channel (replace "name" with the actual column name for channel)
          Q_p95p05 <- channel_sd_day %>%
            group_by(name) %>%
            summarise(
              p05_discharge = quantile(flo, probs = 0.05, na.rm = TRUE),
              p95_discharge = quantile(flo, probs = 0.95, na.rm = TRUE),
            )
          df_out2[k,3] <- round(as.numeric(Q_p95p05$p95_discharge[which(Q_p95p05$name== channel_name(channel))]),3)
          df_out2[k,7] <- round(as.numeric(Q_p95p05$p05_discharge[which(Q_p95p05$name== channel_name(channel))]),3)
        }
        if('Q_p90p10' %in% ind | 'Q_p90' %in% ind | 'Q_p10' %in% ind | 'all' %in% ind){
          
          # convert m?/day to m?/s
          if('all' %in% ind == F) channel_sd_day$flo <- channel_sd_day$flo/86400
          
          # Handle zero flow (defining 0.00000001 cm?/s)
          channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
          
          # Group data by channel (replace "name" with the actual column name for channel)
          Q_p90p10 <- channel_sd_day %>%
            group_by(name) %>%
            summarise(
              p10_discharge = quantile(flo, probs = 0.10, na.rm = TRUE),
              p90_discharge = quantile(flo, probs = 0.90, na.rm = TRUE),
            )
          df_out2[k,4] <- round(as.numeric(Q_p90p10$p90_discharge[which(Q_p90p10$name== channel_name(channel))]),3)
          df_out2[k,6] <- round(as.numeric(Q_p90p10$p10_discharge[which(Q_p90p10$name== channel_name(channel))]),3)
        }
        if('Q_low_days' %in% ind | 'Q_high_days' %in% ind | 'Nconc_days' %in% ind | 'Pconc_days' %in% ind | 'Sedconc_days' %in% ind | 'all' %in% ind){
          
          # convert m?/day to m?/s
          if('all' %in% ind == F) channel_sd_day$flo <- channel_sd_day$flo/86400
          
          # Handle zero flow (defining 0.00000001 cm?/s)
          channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
          
          # Calculate the sum of no3, orgn, nh3, and no2
          channel_sd_day <- channel_sd_day %>%
            mutate(total_N = no3 + orgn + nh3 + no2) %>% 
            mutate(N_conc_mgl = ifelse(flo == 0, 0, (total_N * 1000) / (flo * 86400))) %>% 
            mutate(total_P = solp + sedp) %>% 
            mutate(P_conc_mgl = ifelse(flo == 0, 0, (total_P * 1000) / (flo * 86400))) %>% 
            mutate(sed_conc_mgl = ifelse(flo == 0, 0, (sed * 1e6) / (flo * 86400)))
          
          # Calculate the frequency of exceeding the thresholds for each "unit" (channel)
          frequency_summary_mean <- channel_sd_day %>%
            group_by(name) %>%
            summarize(
              freq_below_threshold_lowQ = mean(flo <= threshold_lowQ[k], na.rm = TRUE),
              freq_beyond_threshold_highQ = mean(flo > threshold_highQ[k], na.rm = TRUE),
              freq_beyond_threshold_N = mean(N_conc_mgl > threshold_N, na.rm = TRUE),
              freq_beyond_threshold_P = mean(P_conc_mgl > threshold_P, na.rm = TRUE),
              freq_beyond_threshold_Sed = mean(sed_conc_mgl > threshold_Sed, na.rm = TRUE)
            )
          df_out2[k,14] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_N[which(frequency_summary_mean$name== channel_name(channel))]),3)
          df_out2[k,15] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_P[which(frequency_summary_mean$name== channel_name(channel))]),3)
          df_out2[k,16] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_Sed[which(frequency_summary_mean$name== channel_name(channel))]),3)
          df_out2[k,12] <- round(as.numeric(frequency_summary_mean$freq_below_threshold_lowQ[which(frequency_summary_mean$name== channel_name(channel))]),3)
          df_out2[k,13] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_highQ[which(frequency_summary_mean$name== channel_name(channel))]),3)
        }
      }
      
      write.csv(df_out2, paste0(path[i],'/2_cha_day.csv'),row.names = F, quote = F)
      
      df_out[i,2:17] <- colMeans(df_out2)  
      df_out[i,18:33] <- lapply(df_out2, FUN='min')
      df_out[i,34:49] <- lapply(df_out2, FUN='max')
    }
  }

return(df_out)
}

# Indicators based on daily channel output
# Option b: only specific channels in cha_day.out (to be defined in object.prt file,
# see example file, you have to specify this file in file.cio)
# !!! And don't forget to deactivate daily channel_sd printing in print.prt !!!
ind_cha_dayII <- function(path, 
                          channel, 
                          ind='all', 
                          threshold_lowQ=0.0344,
                          threshold_highQ=2.7911,
                          threshold_N=2.3, 
                          threshold_P=0.082, 
                          threshold_Sed=50,
                          hd=T,
                          ensemble=F){

  if(ensemble==F){
    df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), 
                         Q_max=NA,
                         Q_max_aa = NA,
                         Q_p95=NA, 
                         Q_p90=NA,
                         Q_p50=NA, 
                         Q_p10=NA, 
                         Q_p05=NA, 
                         Q_min=NA,
                         Q_min_aa = NA,
                         Q_maxmin=NA,
                         Q_maxmin_aa = NA,
                         Q_low_days=NA,
                         Q_high_days=NA,
                         Nconc_days=NA, 
                         Pconc_days=NA,
                         Sedconc_days=NA)
    
    for (i in 1:length(path)) {
      # Read file
      channel_sd_day <- read.table(paste0(path[i],'/cha_day.out'), h=T)
      names(channel_sd_day)[c(5,6)] <- c('type','name')
      
      if('Q_maxmin' %in% ind | 'Q_max' %in% ind  | 'Q_min' %in% ind | 'all' %in% ind){
        
        # convert m?/day to m?/s
        channel_sd_day$flo <- channel_sd_day$flo/86400
        
        # Handle zero flow (defining 0.00000001 cm?/s)
        channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
        
        # Group data by channel (replace "name" with the actual column name for channel)
        max_min_ratio <- channel_sd_day %>%
          group_by(name) %>% 
          summarise(
            max_discharge = max(flo, na.rm = TRUE),
            min_discharge = min(flo, na.rm = TRUE),
            extreme_streamflow_ratio = max_discharge / min_discharge
          )
        
        max_min_ratio_aa <- channel_sd_day %>%
          group_by(name,yr) %>% 
          summarise(
            max_discharge_yr = max(flo, na.rm = TRUE),
            min_discharge_yr = min(flo, na.rm = TRUE),
          ) %>% 
          group_by(name) %>% 
          summarise(
            max_discharge_aa = mean(max_discharge_yr, na.rm = TRUE),
            min_discharge_aa = mean(min_discharge_yr, na.rm = TRUE),
            extreme_streamflow_ratio_aa = max_discharge_aa / min_discharge_aa
          )
        
        df_out[i,2] <- round(max_min_ratio$max_discharge[which(max_min_ratio$name== channel_name(channel))],3)
        df_out[i,3] <- round(max_min_ratio_aa$max_discharge_aa[which(max_min_ratio_aa$name== channel_name(channel))],3)
        df_out[i,9] <- round(max_min_ratio$min_discharge[which(max_min_ratio$name== channel_name(channel))],3)
        df_out[i,10] <- round(max_min_ratio_aa$min_discharge_aa[which(max_min_ratio_aa$name== channel_name(channel))],3)
        df_out[i,11] <- round(max_min_ratio$extreme_streamflow_ratio[which(max_min_ratio$name== channel_name(channel))],3)
        df_out[i,12] <- round(max_min_ratio_aa$extreme_streamflow_ratio_aa[which(max_min_ratio_aa$name== channel_name(channel))],3)
      }
      if('Q_p50' %in% ind | 'all' %in% ind){
        
        # convert m?/day to m?/s
        if('all' %in% ind == F) channel_sd_day$flo <- channel_sd_day$flo/86400
        
        # Handle zero flow (defining 0.00000001 cm?/s)
        channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
        
        # Group data by channel (replace "name" with the actual column name for channel)
        p50 <- channel_sd_day %>%
          group_by(name) %>% 
          summarise(
            p50_discharge = quantile(flo, probs = 0.50, na.rm = TRUE)
          )
        
        df_out[i,6] <- round(as.numeric(p50$p50_discharge[which(p50$name== channel_name(channel))]),3)
      }
      if('Q_p95p05' %in% ind | 'Q_p95' %in% ind | 'Q_p05' %in% ind | 'all' %in% ind){
        
        # convert m?/day to m?/s
        if('all' %in% ind == F) channel_sd_day$flo <- channel_sd_day$flo/86400
        
        # Handle zero flow (defining 0.00000001 cm?/s)
        channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
        
        # Group data by channel (replace "name" with the actual column name for channel)
        Q_p95p05 <- channel_sd_day %>%
          group_by(name) %>%
          summarise(
            p05_discharge = quantile(flo, probs = 0.05, na.rm = TRUE),
            p95_discharge = quantile(flo, probs = 0.95, na.rm = TRUE),
          )
        df_out[i,4] <- round(as.numeric(Q_p95p05$p95_discharge[which(Q_p95p05$name== channel_name(channel))]),3)
        df_out[i,8] <- round(as.numeric(Q_p95p05$p05_discharge[which(Q_p95p05$name== channel_name(channel))]),3)
      }
      if('Q_p90p10' %in% ind | 'Q_p90' %in% ind | 'Q_p10' %in% ind | 'all' %in% ind){
        
        # convert m?/day to m?/s
        if('all' %in% ind == F) channel_sd_day$flo <- channel_sd_day$flo/86400
        
        # Handle zero flow (defining 0.00000001 cm?/s)
        channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
        
        # Group data by channel (replace "name" with the actual column name for channel)
        Q_p90p10 <- channel_sd_day %>%
          group_by(name) %>%
          summarise(
            p10_discharge = quantile(flo, probs = 0.10, na.rm = TRUE),
            p90_discharge = quantile(flo, probs = 0.90, na.rm = TRUE),
          )
        df_out[i,5] <- round(as.numeric(Q_p90p10$p90_discharge[which(Q_p90p10$name== channel_name(channel))]),3)
        df_out[i,7] <- round(as.numeric(Q_p90p10$p10_discharge[which(Q_p90p10$name== channel_name(channel))]),3)
      }
      if('Q_low_days' %in% ind | 'Q_high_days' %in% ind | 'Nconc_days' %in% ind | 'Pconc_days' %in% ind | 'Sedconc_days' %in% ind | 'all' %in% ind){
        
        # convert m?/day to m?/s
        if('all' %in% ind == F) channel_sd_day$flo <- channel_sd_day$flo/86400
        
        # Handle zero flow (defining 0.00000001 cm?/s)
        channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
        
        # Calculate the sum of no3, orgn, nh3, and no2
        channel_sd_day <- channel_sd_day %>%
          mutate(total_N = no3 + orgn + nh3 + no2) %>% 
          mutate(N_conc_mgl = ifelse(flo == 0, 0, (total_N * 1000) / (flo * 86400))) %>% 
          mutate(total_P = solp + sedp) %>% 
          mutate(P_conc_mgl = ifelse(flo == 0, 0, (total_P * 1000) / (flo * 86400))) %>% 
          mutate(sed_conc_mgl = ifelse(flo == 0, 0, (sed * 1e6) / (flo * 86400)))
        
        # Calculate the frequency of exceeding the thresholds for each "unit" (channel)
        frequency_summary_mean <- channel_sd_day %>%
          group_by(name) %>%
          summarize(
            freq_below_threshold_lowQ = mean(flo <= threshold_lowQ, na.rm = TRUE),
            freq_beyond_threshold_highQ = mean(flo > threshold_highQ, na.rm = TRUE),
            freq_beyond_threshold_N = mean(N_conc_mgl > threshold_N, na.rm = TRUE),
            freq_beyond_threshold_P = mean(P_conc_mgl > threshold_P, na.rm = TRUE),
            freq_beyond_threshold_Sed = mean(sed_conc_mgl > threshold_Sed, na.rm = TRUE)
          )
        df_out[i,15] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_N[which(frequency_summary_mean$name== channel_name(channel))]),3)
        df_out[i,16] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_P[which(frequency_summary_mean$name== channel_name(channel))]),3)
        df_out[i,17] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_Sed[which(frequency_summary_mean$name== channel_name(channel))]),3)
        df_out[i,13] <- round(as.numeric(frequency_summary_mean$freq_below_threshold_lowQ[which(frequency_summary_mean$name== channel_name(channel))]),3)
        df_out[i,14] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_highQ[which(frequency_summary_mean$name== channel_name(channel))]),3)
      }
    }
    
    write.csv(df_out, paste(wd, scen_out, '2_cha_day.csv', sep='/'),row.names = F, quote = F)
    
  }
  
  if(ensemble==T){
    df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), 
                         Q_max=NA,
                         Q_max_aa=NA,
                         Q_p95=NA, 
                         Q_p90=NA,
                         Q_p50=NA, 
                         Q_p10=NA, 
                         Q_p05=NA, 
                         Q_min=NA,
                         Q_min_aa=NA,
                         Q_maxmin=NA,
                         Q_maxmin_aa=NA,
                         Q_low_days=NA,
                         Q_high_days=NA,
                         Nconc_days=NA, 
                         Pconc_days=NA,
                         Sedconc_days=NA,
                         Q_max_lower=NA,
                         Q_max_aa_lower=NA,
                         Q_p95_lower=NA,
                         Q_p90_lower=NA,
                         Q_p50_lower=NA,
                         Q_p10_lower=NA,
                         Q_p05_lower=NA,
                         Q_min_lower=NA,
                         Q_min_aa_lower=NA,
                         Q_maxmin_lower=NA,
                         Q_maxmin_aa_lower=NA,
                         Q_low_days_lower=NA,
                         Q_high_days_lower=NA,
                         Nconc_days_lower=NA,
                         Pconc_days_lower=NA,
                         Sedconc_days_lower=NA,
                         Q_max_upper=NA,
                         Q_max_aa_upper=NA,
                         Q_p95_upper=NA,
                         Q_p90_upper=NA,
                         Q_p50_upper=NA,
                         Q_p10_upper=NA,
                         Q_p05_upper=NA,
                         Q_min_upper=NA,
                         Q_min_aa_upper=NA,
                         Q_maxmin_upper=NA,
                         Q_maxmin_aa_upper=NA,
                         Q_low_days_upper=NA,
                         Q_high_days_upper=NA,
                         Nconc_days_upper=NA,
                         Pconc_days_upper=NA,
                         Sedconc_days_upper=NA)
    
    for (i in 1:length(path)) {
      # Read file
      path_ext <- dir(path[i], full.names = T, pattern = 'cal')
      df_out2 <- data.frame(Q_max=NA,
                            Q_max_aa=NA,
                            Q_p95=NA,
                            Q_p90=NA,
                            Q_p50=NA,
                            Q_p10=NA,
                            Q_p05=NA,
                            Q_min=NA,
                            Q_min_aa=NA,
                            Q_maxmin=NA,
                            Q_maxmin_aa=NA,
                            Q_low_days=NA,
                            Q_high_days=NA,
                            Nconc_days=NA,
                            Pconc_days=NA,
                            Sedconc_days=NA)
      for (k in 1:length(path_ext)){
        channel_sd_day <- read.table(paste0(path_ext[k],'/cha_day.out'), h=T)
        names(channel_sd_day)[c(5,6)] <- c('type','name')
        
        if('Q_maxmin' %in% ind | 'Q_max' %in% ind  | 'Q_min' %in% ind | 'all' %in% ind){
          
          # convert m?/day to m?/s
          channel_sd_day$flo <- channel_sd_day$flo/86400
          
          # Handle zero flow (defining 0.00000001 cm?/s)
          channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
          
          # Group data by channel (replace "name" with the actual column name for channel)
          max_min_ratio <- channel_sd_day %>%
            group_by(name) %>% 
            summarise(
              max_discharge = max(flo, na.rm = TRUE),
              min_discharge = min(flo, na.rm = TRUE),
              extreme_streamflow_ratio = max_discharge / min_discharge
            )
          
          max_min_ratio_aa <- channel_sd_day %>%
            group_by(name,yr) %>% 
            summarise(
              max_discharge_yr = max(flo, na.rm = TRUE),
              min_discharge_yr = min(flo, na.rm = TRUE),
            ) %>% 
            group_by(name) %>% 
            summarise(
              max_discharge_aa = mean(max_discharge_yr, na.rm = TRUE),
              min_discharge_aa = mean(min_discharge_yr, na.rm = TRUE),
              extreme_streamflow_ratio_aa = max_discharge_aa / min_discharge_aa
            )
          
          df_out2[k,1] <- round(max_min_ratio$max_discharge[which(max_min_ratio$name== channel_name(channel))],3)
          df_out2[k,2] <- round(max_min_ratio_aa$max_discharge_aa[which(max_min_ratio_aa$name== channel_name(channel))],3)
          df_out2[k,8] <- round(max_min_ratio$min_discharge[which(max_min_ratio$name== channel_name(channel))],3)
          df_out2[k,9] <- round(max_min_ratio_aa$min_discharge_aa[which(max_min_ratio_aa$name== channel_name(channel))],3)
          df_out2[k,10] <- round(max_min_ratio$extreme_streamflow_ratio[which(max_min_ratio$name== channel_name(channel))],3)
          df_out2[k,11] <- round(max_min_ratio_aa$extreme_streamflow_ratio_aa[which(max_min_ratio_aa$name== channel_name(channel))],3)
        }
        if('Q_p50' %in% ind | 'all' %in% ind){
          
          # convert m?/day to m?/s
          if(!'all' %in% ind) channel_sd_day$flo <- channel_sd_day$flo/86400
          
          # Handle zero flow (defining 0.00000001 cm?/s)
          channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
          
          # Group data by channel (replace "name" with the actual column name for channel)
          p50 <- channel_sd_day %>%
            group_by(name) %>% 
            summarise(
              p50_discharge = quantile(flo, probs = 0.50, na.rm = TRUE)
            )
          
          df_out2[k,5] <- round(as.numeric(p50$p50_discharge[which(p50$name== channel_name(channel))]),3)
        }
        if('Q_p95p05' %in% ind | 'Q_p95' %in% ind | 'Q_p05' %in% ind | 'all' %in% ind){
          
          # convert m?/day to m?/s
          if(!'all' %in% ind) channel_sd_day$flo <- channel_sd_day$flo/86400
          
          # Handle zero flow (defining 0.00000001 cm?/s)
          channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
          
          # Group data by channel (replace "name" with the actual column name for channel)
          Q_p95p05 <- channel_sd_day %>%
            group_by(name) %>%
            summarise(
              p05_discharge = quantile(flo, probs = 0.05, na.rm = TRUE),
              p95_discharge = quantile(flo, probs = 0.95, na.rm = TRUE),
            )
          df_out2[k,3] <- round(as.numeric(Q_p95p05$p95_discharge[which(Q_p95p05$name== channel_name(channel))]),3)
          df_out2[k,7] <- round(as.numeric(Q_p95p05$p05_discharge[which(Q_p95p05$name== channel_name(channel))]),3)
        }
        if('Q_p90p10' %in% ind | 'Q_p90' %in% ind | 'Q_p10' %in% ind | 'all' %in% ind){
          
          # convert m?/day to m?/s
          if('all' %in% ind == F) channel_sd_day$flo <- channel_sd_day$flo/86400
          
          # Handle zero flow (defining 0.00000001 cm?/s)
          channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
          
          # Group data by channel (replace "name" with the actual column name for channel)
          Q_p90p10 <- channel_sd_day %>%
            group_by(name) %>%
            summarise(
              p10_discharge = quantile(flo, probs = 0.10, na.rm = TRUE),
              p90_discharge = quantile(flo, probs = 0.90, na.rm = TRUE),
            )
          df_out2[k,4] <- round(as.numeric(Q_p90p10$p90_discharge[which(Q_p90p10$name== channel_name(channel))]),3)
          df_out2[k,6] <- round(as.numeric(Q_p90p10$p10_discharge[which(Q_p90p10$name== channel_name(channel))]),3)
        }
        if('Q_low_days' %in% ind | 'Q_high_days' %in% ind | 'Nconc_days' %in% ind | 'Pconc_days' %in% ind | 'Sedconc_days' %in% ind | 'all' %in% ind){
          
          # convert m?/day to m?/s
          if(!'all' %in% ind) channel_sd_day$flo <- channel_sd_day$flo/86400
          
          # Handle zero flow (defining 0.00000001 cm?/s)
          channel_sd_day$flo[which(channel_sd_day$flo==0)] <- 1e-40
          
          # Calculate the sum of no3, orgn, nh3, and no2
          channel_sd_day <- channel_sd_day %>%
            mutate(total_N = no3 + orgn + nh3 + no2) %>% 
            mutate(N_conc_mgl = ifelse(flo == 0, 0, (total_N * 1000) / (flo * 86400))) %>% 
            mutate(total_P = solp + sedp) %>% 
            mutate(P_conc_mgl = ifelse(flo == 0, 0, (total_P * 1000) / (flo * 86400))) %>% 
            mutate(sed_conc_mgl = ifelse(flo == 0, 0, (sed * 1e6) / (flo * 86400)))
          
          # Calculate the frequency of exceeding the thresholds for each "unit" (channel)
            frequency_summary_mean <- channel_sd_day %>%
            group_by(name) %>%
            summarize(
              freq_below_threshold_lowQ = mean(flo <= threshold_lowQ[k], na.rm = TRUE),
              freq_beyond_threshold_highQ = mean(flo > threshold_highQ[k], na.rm = TRUE),
              freq_beyond_threshold_N = mean(N_conc_mgl > threshold_N, na.rm = TRUE),
              freq_beyond_threshold_P = mean(P_conc_mgl > threshold_P, na.rm = TRUE),
              freq_beyond_threshold_Sed = mean(sed_conc_mgl > threshold_Sed, na.rm = TRUE)
            )
          df_out2[k,14] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_N[which(frequency_summary_mean$name== channel_name(channel))]),3)
          df_out2[k,15] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_P[which(frequency_summary_mean$name== channel_name(channel))]),3)
          df_out2[k,16] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_Sed[which(frequency_summary_mean$name== channel_name(channel))]),3)
          df_out2[k,12] <- round(as.numeric(frequency_summary_mean$freq_below_threshold_lowQ[which(frequency_summary_mean$name== channel_name(channel))]),3)
          df_out2[k,13] <- round(as.numeric(frequency_summary_mean$freq_beyond_threshold_highQ[which(frequency_summary_mean$name== channel_name(channel))]),3)
        }
        
      }
      
      write.csv(df_out2, paste0(path[i],'/2_cha_day.csv'),row.names = F, quote = F)
      
      df_out[i,2:17] <- colMeans(df_out2)  
      df_out[i,18:33] <- lapply(df_out2, FUN='min')
      df_out[i,34:49] <- lapply(df_out2, FUN='max')
    }
  }
  return(df_out)
}

# function returning discharge metrics of status quo for all cal files
get_ens_Q_metrics <- function(){
  ind_cha_dayII(path, channel, ind='all', ensemble=T)
  path_csv <- dir(path[1], full.names = T, pattern = 'cha_day.csv')
  df <- read.csv(path_csv)[,c(1:11)]
  
  return(df)
}

# water balance related indicators based on annual average hru output
ind_hru_aa_wb <- function(path, a = 'basin', ensemble = F){
  
  if(ensemble==F){
    df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), 
                         sw=NA, 
                         sw300=NA,
                         perc=NA)
    
    for (i in 1:length(path)) {
      # Read file
      hru_wb <- read_tbl('hru_wb_aa.txt', path[i], 3)
      hru_area <- read_tbl ('hru.con', path[i], 2)
      
      # Specify the columns you want to keep
      # Keep all hru_ls columns
      
      columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                           "sw_ave", "sw_300", "perc")
      
      # Create a new data frame with only the selected columns
      if(a == 'basin'){
        df_selected_hru_wb <- hru_wb[, columns_to_keep]
        idx <- c(1:dim(hru_wb)[1])
      }else{
        # Read in vector for agricultural area
        hru_agr <- read.table(paste0(path[i],'/hru_agr.txt'), h=T)
        idx <- hru_agr$hru_id
        df_selected_hru_wb <- hru_wb[idx, columns_to_keep]
      }
      
      # Add the HRU area to each HRU
      hru_wb <- hru_wb[idx,] %>% left_join(hru_area[idx,] %>% select(id, area), by = c("unit" = "id"))
      
      # Calculate the weighted values
      df_selected_hru_wb  <- df_selected_hru_wb  %>%
        mutate(weighted_sw = sw_ave * hru_wb$area,
               weighted_sw300 = sw_300 * hru_wb$area,
               weighted_perc = perc * hru_wb$area)
      
      # Calculate the total weighted sum
      total_weighted_sw <- sum(df_selected_hru_wb$weighted_sw, na.rm = TRUE)
      total_weighted_sw300 <- sum(df_selected_hru_wb$weighted_sw300, na.rm = TRUE)
      total_weighted_perc <- sum(df_selected_hru_wb$weighted_perc, na.rm = TRUE)
      
      # Calculate the total area across all HRUs
      total_area <- sum(hru_wb$area, na.rm = TRUE)
      
      # Calculate the area-weighted averages
      df_out[i,2] <- round(total_weighted_sw / total_area,3)
      df_out[i,3] <- round(total_weighted_sw300 / total_area,3)
      df_out[i,4] <- round(total_weighted_perc / total_area,3)
    }
    
    write.csv(df_out, paste(wd, scen_out, '4_hru_aa_wb.csv', sep='/'),row.names = F, quote = F)
    
  }   
  
  if(ensemble==T){
    df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), 
                         sw=NA,
                         sw300=NA,
                         perc=NA,
                         sw_lower=NA,
                         sw300_lower=NA,
                         perc_lower=NA,
                         sw_upper=NA,
                         sw300_upper=NA,
                         perc_upper=NA)
    
    for (i in 1:length(path)) {
      path_ext <- dir(path[i], full.names = T, pattern = 'cal')
      df_out2 <- data.frame(sw=NA,
                            sw300=NA,
                            perc=NA)
      for (k in 1:length(path_ext)){
        # Read file
        hru_wb <- read_tbl('hru_wb_aa.txt', path_ext[k], 3)
        hru_area <- read_tbl ('hru.con', path_ext[k], 2)
        
        # Specify the columns you want to keep
        # Keep all hru_ls columns
        
        columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                             "sw_ave", "sw_300", "perc")
        
        # Create a new data frame with only the selected columns
        if(a == 'basin'){
          df_selected_hru_wb <- hru_wb[, columns_to_keep]
          idx <- c(1:dim(hru_wb)[1])
        }else{
          # Read in vector for agricultural area
          hru_agr <- read.table(paste0(path_ext[k],'/hru_agr.txt'), h=T)
          idx <- hru_agr$hru_id
          df_selected_hru_wb <- hru_wb[idx, columns_to_keep]
        }
        
        # Add the HRU area to each HRU
        hru_wb <- hru_wb[idx,] %>% left_join(hru_area[idx,] %>% select(id, area), by = c("unit" = "id"))
        
        # Calculate the weighted values
        df_selected_hru_wb  <- df_selected_hru_wb  %>%
          mutate(weighted_sw = sw_ave * hru_wb$area,
                 weighted_sw300 = sw_300 * hru_wb$area,
                 weighted_perc = perc * hru_wb$area)
        
        # Calculate the total weighted sum
        total_weighted_sw <- sum(df_selected_hru_wb$weighted_sw, na.rm = TRUE)
        total_weighted_sw300 <- sum(df_selected_hru_wb$weighted_sw300, na.rm = TRUE)
        total_weighted_perc <- sum(df_selected_hru_wb$weighted_perc, na.rm = TRUE)
        
        # Calculate the total area across all HRUs
        total_area <- sum(hru_wb$area, na.rm = TRUE)
        
        # Calculate the area-weighted averages
        df_out2[k,1] <- round(total_weighted_sw / total_area,3)
        df_out2[k,2] <- round(total_weighted_sw300 / total_area,3)
        df_out2[k,3] <- round(total_weighted_perc / total_area,3)
      }
      
      write.csv(df_out2, paste0(path[i],'/4_hru_aa_wb.csv'),row.names = F, quote = F)
      
      df_out[i,2:4] <- colMeans(df_out2)  
      df_out[i,5:7] <- lapply(df_out2, FUN='min')
      df_out[i,8:10] <- lapply(df_out2, FUN='max')
    }
  }
  
  return(df_out)
}

# nutrient and sediment related indicators based on annual average hru output
ind_hru_aa_nb <- function(path, a = 'basin', ensemble = F){
  
  if(ensemble==F){
    df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), 
                         N_loss=NA, 
                         P_loss=NA,
                         Sed_loss=NA,
                         N_loss_ratio=NA, 
                         P_loss_ratio=NA)
    
    for (i in 1:length(path)) {
      # Read file
      hru_ls <- read_tbl('hru_ls_aa.txt', path[i], 3)
      hru_nb <- read_tbl('hru_nb_aa.txt', path[i], 3)
      hru_pw <- read_tbl('hru_pw_aa.txt', path[i], 3)
      hru_area <- read_tbl ('hru.con', path[i], 2)
      
      # Specify the columns you want to keep
      # Keep all hru_ls columns
      
      columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                           "fertn", "fixn", "no3atmo", "nh4atmo", "fertp", "denit")
      
      
      # Create a new data frame with only the selected columns
      if(a == 'basin'){
        df_selected_hru_nb <- hru_nb[, columns_to_keep]
        idx <- c(1:dim(hru_nb)[1])
      }else{
        # Read in vector for agricultural area
        hru_agr <- read.table(paste0(path[i],'/hru_agr.txt'), h=T)
        idx <- hru_agr$hru_id
        df_selected_hru_nb <- hru_nb[idx, columns_to_keep]
      }
      
      # Calculate the sum of N inputs
      df_selected_hru_nb <- df_selected_hru_nb %>%
        mutate(N_inputs = fertn + fixn + no3atmo + nh4atmo)
      
      # Calculate N losses 
      # Add N_losses as a new column to df_selected_hru_nb
      
      hru_ls <- hru_ls[idx,] %>%
        mutate(N_losses = sedorgn + surqno3 + lat3no3 + tileno3 + hru_pw$percn[idx])
      
      # The P input is only fertp from hru_nb
      # Calculate the sum of P losses
      hru_ls <- hru_ls %>%
        mutate(P_losses = sedorgp + surqsolp + sedminp + tilelabp + lchlabp)
      
      # Add the HRU area to each HRU
      hru_ls <- hru_ls %>% left_join(hru_area[idx,] %>% select(id, area), by = c("unit" = "id"))
      
      # Calculate the weighted values for N and P inputs
      df_selected_hru_nb  <- df_selected_hru_nb  %>%
        mutate(weighted_N_inputs = N_inputs * hru_ls$area,
               weighted_P_inputs = fertp * hru_ls$area)
      # Calculate the weighted values for N, P and sediment losses
      hru_ls <- hru_ls %>%
        mutate(weighted_N_losses = N_losses * area,
               weighted_P_losses = P_losses * area,
               weighted_Sed_losses = sedyld * area)
      
      # Calculate the total weighted sum for N and P
      total_weighted_N_inputs <- sum(df_selected_hru_nb$weighted_N_inputs, na.rm = TRUE)
      total_weighted_N_losses <- sum(hru_ls$weighted_N_losses, na.rm = TRUE)
      total_weighted_P_inputs <- sum(df_selected_hru_nb$weighted_P_inputs, na.rm = TRUE)
      total_weighted_P_losses <- sum(hru_ls$weighted_P_losses, na.rm = TRUE)
      total_weighted_Sed_losses <- sum(hru_ls$weighted_Sed_losses, na.rm = TRUE)
      
      # Calculate the total area across all HRUs
      total_area <- sum(hru_ls$area, na.rm = TRUE)
      
      # Calculate the area-weighted averages for N and P
      area_weighted_average_N_inputs <- total_weighted_N_inputs / total_area
      area_weighted_average_P_inputs <- total_weighted_P_inputs / total_area
      area_weighted_average_N_losses <- total_weighted_N_losses / total_area
      area_weighted_average_P_losses <- total_weighted_P_losses / total_area
      area_weighted_average_Sed_losses <- total_weighted_Sed_losses / total_area
      
      df_out[i,2] <- round(area_weighted_average_N_losses,3)
      df_out[i,3] <- round(area_weighted_average_P_losses,3)
      df_out[i,4] <- round(area_weighted_average_Sed_losses,3)
      df_out[i,5] <- round(area_weighted_average_N_losses/area_weighted_average_N_inputs,3)
      df_out[i,6] <- round(area_weighted_average_P_losses/area_weighted_average_P_inputs,3)
      
    }
    
    write.csv(df_out, paste(wd, scen_out, '3_hru_aa_nb.csv', sep='/'),row.names = F, quote = F)
    
  }
  
  if(ensemble==T){
    df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), 
                         N_loss=NA, 
                         P_loss=NA,
                         Sed_loss=NA,
                         N_loss_ratio=NA, 
                         P_loss_ratio=NA,
                         N_loss_lower=NA, 
                         P_loss_lower=NA,
                         Sed_loss_lower=NA,
                         N_loss_ratio_lower=NA, 
                         P_loss_ratio_lower=NA,
                         N_loss_upper=NA, 
                         P_loss_upper=NA,
                         Sed_loss_upper=NA,
                         N_loss_ratio_upper=NA, 
                         P_loss_ratio_upper=NA)
    
    for (i in 1:length(path)) {
      path_ext <- dir(path[i], full.names = T, pattern = 'cal')
      df_out2 <- data.frame(N_loss=NA, 
                            P_loss=NA,
                            Sed_loss=NA,
                            N_loss_ratio=NA, 
                            P_loss_ratio=NA)
      for (k in 1:length(path_ext)){
        # Read file
        hru_ls <- read_tbl('hru_ls_aa.txt', path_ext[k], 3)
        hru_nb <- read_tbl('hru_nb_aa.txt', path_ext[k], 3)
        hru_pw <- read_tbl('hru_pw_aa.txt', path_ext[k], 3)
        hru_area <- read_tbl ('hru.con', path_ext[k], 2)
        
        # Specify the columns you want to keep
        # Keep all hru_ls columns
        
        columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                             "fertn", "fixn", "no3atmo", "nh4atmo", "fertp", "denit")
        
        
        # Create a new data frame with only the selected columns
        if(a == 'basin'){
          df_selected_hru_nb <- hru_nb[, columns_to_keep]
          idx <- c(1:dim(hru_nb)[1])
        }else{
          # Read in vector for agricultural area
          hru_agr <- read.table(paste0(path_ext[k],'/hru_agr.txt'), h=T)
          idx <- hru_agr$hru_id
          df_selected_hru_nb <- hru_nb[idx, columns_to_keep]
        }
        
        # Calculate the sum of N inputs
        df_selected_hru_nb <- df_selected_hru_nb %>%
          mutate(N_inputs = fertn + fixn + no3atmo + nh4atmo)
        
        # Calculate N losses 
        # Add N_losses as a new column to df_selected_hru_nb
        
        hru_ls <- hru_ls[idx,] %>%
          mutate(N_losses = sedorgn + surqno3 + lat3no3 + tileno3 + hru_pw$percn[idx])
        
        # The P input is only fertp from hru_nb
        # Calculate the sum of P losses
        hru_ls <- hru_ls %>%
          mutate(P_losses = sedorgp + surqsolp + sedminp + tilelabp + lchlabp)
        
        # Add the HRU area to each HRU
        hru_ls <- hru_ls %>% left_join(hru_area[idx,] %>% select(id, area), by = c("unit" = "id"))
        
        # Calculate the weighted values for N and P inputs
        df_selected_hru_nb  <- df_selected_hru_nb  %>%
          mutate(weighted_N_inputs = N_inputs * hru_ls$area,
                 weighted_P_inputs = fertp * hru_ls$area)
        # Calculate the weighted values for N, P and sediment losses
        hru_ls <- hru_ls %>%
          mutate(weighted_N_losses = N_losses * area,
                 weighted_P_losses = P_losses * area,
                 weighted_Sed_losses = sedyld * area)
        
        # Calculate the total weighted sum for N and P
        total_weighted_N_inputs <- sum(df_selected_hru_nb$weighted_N_inputs, na.rm = TRUE)
        total_weighted_N_losses <- sum(hru_ls$weighted_N_losses, na.rm = TRUE)
        total_weighted_P_inputs <- sum(df_selected_hru_nb$weighted_P_inputs, na.rm = TRUE)
        total_weighted_P_losses <- sum(hru_ls$weighted_P_losses, na.rm = TRUE)
        total_weighted_Sed_losses <- sum(hru_ls$weighted_Sed_losses, na.rm = TRUE)
        
        # Calculate the total area across all HRUs
        total_area <- sum(hru_ls$area, na.rm = TRUE)
        
        # Calculate the area-weighted averages for N and P
        area_weighted_average_N_inputs <- total_weighted_N_inputs / total_area
        area_weighted_average_P_inputs <- total_weighted_P_inputs / total_area
        area_weighted_average_N_losses <- total_weighted_N_losses / total_area
        area_weighted_average_P_losses <- total_weighted_P_losses / total_area
        area_weighted_average_Sed_losses <- total_weighted_Sed_losses / total_area
        
        df_out2[k,1] <- round(area_weighted_average_N_losses,3)
        df_out2[k,2] <- round(area_weighted_average_P_losses,3)
        df_out2[k,3] <- round(area_weighted_average_Sed_losses,3)
        df_out2[k,4] <- round(area_weighted_average_N_losses/area_weighted_average_N_inputs,3)
        df_out2[k,5] <- round(area_weighted_average_P_losses/area_weighted_average_P_inputs,3)
      }
      
      write.csv(df_out2, paste0(path[i],'/3_hru_aa_nb.csv'),row.names = F, quote = F)
      
      df_out[i,2:6] <- colMeans(df_out2)  
      df_out[i,7:11] <- lapply(df_out2, FUN='min')
      df_out[i,12:16] <- lapply(df_out2, FUN='max')   
    }
  }
  
  return(df_out)
}

# water balance related indicators based on monthly hru outputs
ind_hru_mon_wb <- function(path, ind = 'sw', period = c(5:9), a = 'basin', ensemble = F){
  
  if(ensemble==F){
    
    if(ind == 'sw'){
      sw_colnames <- paste0('sw_', map_chr(period, ~paste(.x, collapse = "_")))
      df_out <- data.frame(matrix(data=NA, nrow=length(measr.list), ncol=length(sw_colnames)+1))
      names(df_out) <- c('scen_name', sw_colnames)
      df_out$scen_name <- sapply(strsplit(path, split ="/"),tail,1)
      
      for (i in 1:length(path)) {
        # Read file
        hru_wb <- read_tbl('hru_wb_mon.txt', path[i], 3)
        hru_area <- read_tbl ('hru.con', path[i], 2)
        
        # Specify the columns you want to keep for hru_nb
        # Keep all hru_ls columns
        
        columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                             "sw_ave")
        
        for(k in 1:length(period)){
          # Create a new data frame with only the selected rows and columns
          if(a == 'basin'){
            df_selected_hru_wb <- hru_wb[which(hru_wb$mon %in% period[[k]]), columns_to_keep]
            idx <- c(1:dim(hru_area)[1])
          }else{
            # Read in vector for agricultural area
            hru_agr <- read.table(paste0(path[i],'/hru_agr.txt'), h=T)
            idx <- hru_agr$hru_id
            df_selected_hru_wb <- hru_wb[which(hru_wb$unit %in% idx & hru_wb$mon %in% period[[k]]), columns_to_keep]
          }
          
          # Calculate the area weighted values
          df_selected_hru_wb  <- df_selected_hru_wb  %>%
            left_join(hru_area %>% select(id, area), by = c("unit" = "id")) %>% 
            mutate(weighted_sw = sw_ave * area)
          
          # Number of months and years
          n_mon <- length(period[[k]])
          n_years <- length(unique(df_selected_hru_wb$yr))
          
          # Calculate the total weighted sum
          total_weighted_sw <- sum(df_selected_hru_wb$weighted_sw, na.rm = TRUE)/n_mon/n_years
          
          # Calculate the total area across all HRUs
          total_area <- sum(hru_area$area[idx], na.rm = TRUE)
          
          # Calculate the area-weighted averages for N and P
          df_out[i,k+1] <- round(total_weighted_sw / total_area,3)
        }
      }
    }
    
    if(ind == 'sw300'){
      sw_colnames <- paste0('sw300_', map_chr(period, ~paste(.x, collapse = "_")))
      df_out <- data.frame(matrix(data=NA, nrow=length(measr.list), ncol=length(sw_colnames)+1))
      names(df_out) <- c('scen_name', sw_colnames)
      df_out$scen_name <- sapply(strsplit(path, split ="/"),tail,1)
      
      for (i in 1:length(path)) {
        # Read file
        hru_wb <- read_tbl('hru_wb_mon.txt', path[i], 3)
        hru_area <- read_tbl ('hru.con', path[i], 2)
        
        # Specify the columns you want to keep for hru_nb
        # Keep all hru_ls columns
        
        columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                             "sw_300")
        
        for(k in 1:length(period)){
          # Create a new data frame with only the selected rows and columns
          if(a == 'basin'){
            df_selected_hru_wb <- hru_wb[which(hru_wb$mon %in% period[[k]]), columns_to_keep]
            idx <- c(1:dim(hru_area)[1])
          }else{
            # Read in vector for agricultural area
            hru_agr <- read.table(paste0(path[i],'/hru_agr.txt'), h=T)
            idx <- hru_agr$hru_id
            df_selected_hru_wb <- hru_wb[which(hru_wb$unit %in% idx & hru_wb$mon %in% period[[k]]), columns_to_keep]
          }
          
          # Calculate the area weighted values
          df_selected_hru_wb  <- df_selected_hru_wb  %>%
            left_join(hru_area %>% select(id, area), by = c("unit" = "id")) %>% 
            mutate(weighted_sw = sw_300 * area)
          
          # Number of months and years
          n_mon <- length(period[[k]])
          n_years <- length(unique(df_selected_hru_wb$yr))
          
          # Calculate the total weighted sum
          total_weighted_sw <- sum(df_selected_hru_wb$weighted_sw, na.rm = TRUE)/n_mon/n_years
          
          # Calculate the total area across all HRUs
          total_area <- sum(hru_area$area[idx], na.rm = TRUE)
          
          # Calculate the area-weighted averages for N and P
          df_out[i,k+1] <- round(total_weighted_sw / total_area,3)
        }
      }
    }
    
    write.csv(df_out, paste(wd, scen_out, '/5_hru_mon_wb.csv', sep='/'),row.names = F, quote = F)
      
  }
  
  if(ensemble==T){
    
    if(ind == 'sw'){
      sw_colnames <- paste0('sw_', map_chr(period, ~paste(.x, collapse = "_")))
      df_out <- data.frame(matrix(data=NA, nrow=length(measr.list), ncol=length(sw_colnames)*3+1))
      names(df_out) <- c('scen_name', sw_colnames, paste0(sw_colnames, '_lower'), paste0(sw_colnames, '_upper'))
      df_out$scen_name <- sapply(strsplit(path, split ="/"),tail,1)
      
      for (i in 1:length(path)) {
        path_ext <- dir(path[i], full.names = T, pattern = 'cal')
        df_out2 <- data.frame(matrix(data=NA, nrow=length(path_ext), ncol=length(sw_colnames)))
        names(df_out2) <- c(sw_colnames)
        for (j in 1:length(path_ext)){
          # Read file
          hru_wb <- read_tbl('hru_wb_mon.txt', path_ext[j], 3)
          hru_area <- read_tbl ('hru.con', path_ext[j], 2)
          
          # Specify the columns you want to keep for hru_nb
          # Keep all hru_ls columns
          
          columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                               "sw_ave")
          
          for(k in 1:length(period)){
            # Create a new data frame with only the selected rows and columns
            if(a == 'basin'){
              df_selected_hru_wb <- hru_wb[which(hru_wb$mon %in% period[[k]]), columns_to_keep]
              idx <- c(1:dim(hru_area)[1])
            }else{
              # Read in vector for agricultural area
              hru_agr <- read.table(paste0(path_ext[j],'/hru_agr.txt'), h=T)
              idx <- hru_agr$hru_id
              df_selected_hru_wb <- hru_wb[which(hru_wb$unit %in% idx & hru_wb$mon %in% period[[k]]), columns_to_keep]
            }
            
            # Calculate the area weighted values
            df_selected_hru_wb  <- df_selected_hru_wb  %>%
              left_join(hru_area %>% select(id, area), by = c("unit" = "id")) %>% 
              mutate(weighted_sw = sw_ave * area)
            
            # Number of months and years
            n_mon <- length(period[[k]])
            n_years <- length(unique(df_selected_hru_wb$yr))
            
            # Calculate the total weighted sum
            total_weighted_sw <- sum(df_selected_hru_wb$weighted_sw, na.rm = TRUE)/n_mon/n_years
            
            # Calculate the total area across all HRUs
            total_area <- sum(hru_area$area[idx], na.rm = TRUE)
            
            # Calculate the area-weighted averages for N and P
            df_out2[j,k] <- round(total_weighted_sw / total_area,3)
          }
        }
        
        write.csv(df_out2, paste0(path[i],'/5_hru_mon_wb.csv'),row.names = F, quote = F)
        
        df_out[i,2:(length(df_out2)+1)] <- colMeans(df_out2)  
        df_out[i,(length(df_out2)+2):(2*length(df_out2)+1)] <- lapply(df_out2, FUN='min')
        df_out[i,(2*length(df_out2)+2):(3*length(df_out2)+1)] <- lapply(df_out2, FUN='max')
      } 
    }
    
    if(ind == 'sw300'){
      sw_colnames <- paste0('sw300_', map_chr(period, ~paste(.x, collapse = "_")))
      df_out <- data.frame(matrix(data=NA, nrow=length(measr.list), ncol=length(sw_colnames)*3+1))
      names(df_out) <- c('scen_name', sw_colnames, paste0(sw_colnames, '_lower'), paste0(sw_colnames, '_upper'))
      df_out$scen_name <- sapply(strsplit(path, split ="/"),tail,1)
      
      for (i in 1:length(path)) {
        path_ext <- dir(path[i], full.names = T, pattern = 'cal')
        df_out2 <- data.frame(matrix(data=NA, nrow=length(path_ext), ncol=length(sw_colnames)))
        names(df_out2) <- c(sw_colnames)
        for (j in 1:length(path_ext)){
          # Read file
          hru_wb <- read_tbl('hru_wb_mon.txt', path_ext[j], 3)
          hru_area <- read_tbl ('hru.con', path_ext[j], 2)
          
          # Specify the columns you want to keep for hru_nb
          # Keep all hru_ls columns
          
          columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "gis_id", "name", 
                               "sw_300")
          
          for(k in 1:length(period)){
            # Create a new data frame with only the selected rows and columns
            if(a == 'basin'){
              df_selected_hru_wb <- hru_wb[which(hru_wb$mon %in% period[[k]]), columns_to_keep]
              idx <- c(1:dim(hru_area)[1])
            }else{
              # Read in vector for agricultural area
              hru_agr <- read.table(paste0(path_ext[j],'/hru_agr.txt'), h=T)
              idx <- hru_agr$hru_id
              df_selected_hru_wb <- hru_wb[which(hru_wb$unit %in% idx & hru_wb$mon %in% period[[k]]), columns_to_keep]
            }
            
            # Calculate the area weighted values
            df_selected_hru_wb  <- df_selected_hru_wb  %>%
              left_join(hru_area %>% select(id, area), by = c("unit" = "id")) %>% 
              mutate(weighted_sw = sw_300 * area)
            
            # Number of months and years
            n_mon <- length(period[[k]])
            n_years <- length(unique(df_selected_hru_wb$yr))
            
            # Calculate the total weighted sum
            total_weighted_sw <- sum(df_selected_hru_wb$weighted_sw, na.rm = TRUE)/n_mon/n_years
            
            # Calculate the total area across all HRUs
            total_area <- sum(hru_area$area[idx], na.rm = TRUE)
            
            # Calculate the area-weighted averages for N and P
            df_out2[j,k] <- round(total_weighted_sw / total_area,3)
          }
        }
        
        write.csv(df_out2, paste0(path[i],'/5_hru_mon_wb.csv'),row.names = F, quote = F)
        
        df_out[i,2:(length(df_out2)+1)] <- colMeans(df_out2)  
        df_out[i,(length(df_out2)+2):(2*length(df_out2)+1)] <- lapply(df_out2, FUN='min')
        df_out[i,(2*length(df_out2)+2):(3*length(df_out2)+1)] <- lapply(df_out2, FUN='max')
      } 
    }
  }
  
  return(df_out)
}

# get daily hru outputs
print_hruX_day <- function(path, hru_unit = 1, measure_name, ensemble = F){
  
  measure_type <- unique(nth_element(unlist(str_split(measure_name, '_')), 1, 2))
  
  path <- c(path[1], unique (grep(paste(measure_type,collapse="|"), 
                       path, value=TRUE)))

  measure_list <- c('statusquo', measure_type)
  
  # Specify the columns you want to keep for an hru-specific analysis
  columns_to_keep <- c("jday", "mon", "day", "yr",  "unit", "precip", "snofall", "snomlt", "surq_gen", "latq", 
                       "wateryld", "perc", "et", "ecanopy", "eplant", "esoil", "surq_cont", "cn", "sw_ave", 
                       "sw_300", "pet", "qtile", "surq_runon", "latq_runon", "surq_cha", "surq_res", "surq_ls", 
                       "latq_cha", "latq_res", "latq_ls", "sedyld", "sedorgn", "sedorgp", "surqno3", "lat3no3",
                       "surqsolp", "sedminp", "tileno3", "lchlabp", "tilelabp", "lab_min_p", "act_sta_p", 
                       "fertn", "fertp", "fixn", "denit", "act_nit_n", "act_sta_n", "org_lab_p", "rsd_nitorg_n",
                       "rsd_laborg_p", "no3atmo", "nh4atmo", "nuptake", "puptake", "gwsoiln", "gwsoilp",
                       "lai", "bioms", "yield", "residue", "sol_tmp", "strsw", "strsa", "strstmp", "strsn", 
                       "strsp", "strss", "nplt", "percn", "pplnt", "tmx", "tmn", "tmpav", "solarad", "wndspd", 
                       "rhum", "phubas0")
  
  if(ensemble==F){
      
      for (i in 1:length(path)) {
        # Read file
        hru_wb <- read_tbl('hru_wb_day.txt', path[i], 3)
        hru_ls <- read_tbl('hru_ls_day.txt', path[i], 3)
        hru_nb <- read_tbl('hru_nb_day.txt', path[i], 3)
        hru_pw <- read_tbl('hru_pw_day.txt', path[i], 3)
        
        df_temp <- data.frame(scenario = measure_name)
        df_temp <- cbind.data.frame(df_temp, hru_wb[which(hru_wb$unit %in% hru_unit), which(names(hru_wb) %in% columns_to_keep)])
        df_temp <- cbind.data.frame(df_temp, hru_ls[which(hru_ls$unit %in% hru_unit), which(names(hru_ls) %in% columns_to_keep[-c(1:5)])])
        df_temp <- cbind.data.frame(df_temp, hru_nb[which(hru_nb$unit %in% hru_unit), which(names(hru_nb) %in% columns_to_keep[-c(1:5)])])
        df_temp <- cbind.data.frame(df_temp, hru_pw[which(hru_pw$unit %in% hru_unit), which(names(hru_pw) %in% columns_to_keep[-c(1:5)])])
        ifelse(i==1, df <- df_temp, df <- rbind.data.frame(df, df_temp)) 
        print(paste0('daily hru output extracted for scenario ', measr.list[i]))
      }
    write.csv(df, paste0(wd, '/', scen_out, '/daily_output_hru_', hru_unit, '.csv'), row.names = F, quote = F)
  }
  
  if(ensemble==T){
    
    for (i in 1:length(path)) {
      path_ext <- dir(path[i], full.names = T, pattern = 'cal')
      cal_files_short <- dir(path[i], full.names = F, pattern = 'cal')
      
      for (j in 1:length(path_ext)){
        # Read file
        hru_wb <- read_tbl('hru_wb_day.txt', path_ext[j], 3)
        hru_ls <- read_tbl('hru_ls_day.txt', path_ext[j], 3)
        hru_nb <- read_tbl('hru_nb_day.txt', path_ext[j], 3)
        hru_pw <- read_tbl('hru_pw_day.txt', path_ext[j], 3)
        
        df_temp <- data.frame(scenario = measure_list[i], cal = cal_files_short[j])
        df_temp <- cbind.data.frame(df_temp, hru_wb[which(hru_wb$unit %in% hru_unit), which(names(hru_wb) %in% columns_to_keep)])
        df_temp <- cbind.data.frame(df_temp, hru_ls[which(hru_ls$unit %in% hru_unit), which(names(hru_ls) %in% columns_to_keep[-c(1:5)])])
        df_temp <- cbind.data.frame(df_temp, hru_nb[which(hru_nb$unit %in% hru_unit), which(names(hru_nb) %in% columns_to_keep[-c(1:5)])])
        df_temp <- cbind.data.frame(df_temp, hru_pw[which(hru_pw$unit %in% hru_unit), which(names(hru_pw) %in% columns_to_keep[-c(1:5)])])
        
        ifelse(j==1, df_temp2 <- df_temp, df_temp2 <- rbind.data.frame(df_temp2, df_temp)) 
        print(paste0('daily hru output extracted from ', path_ext[j]))
      }
      ifelse(i==1, df <- df_temp2, df <- rbind.data.frame(df, df_temp2)) 
    }
    
    saveRDS(df, paste0(wd, '/', scen_out, '/daily_hru_output_', measure_name, '.rds'))
    print(paste0('daily hru output printed to ', wd, scen_out))
  }
  return(df)
}

# get daily cha outputs
print_chaX_day <- function(path, cha_unit = 1, measure_name, ensemble = F){
  
  measure_type <- unique(nth_element(unlist(str_split(measure_name, '_')), 1, 2))
  
  path <- c(path[1], unique (grep(paste(measure_type,collapse="|"), 
                                  path, value=TRUE)))
  
  measure_list <- c('statusquo', measure_type)

  # Specify the columns you want to keep for an hru-specific analysis
  columns_to_keep <- c("jday", "mon", "day", "yr", "unit", "name", "area", "precip", "evap", "seep", 
                       "flo_stor", "sed_stor", "orgn_stor", "sedp_stor" , "no3_stor", "solp_stor", "nh3_stor", "no2_stor", 
                       "flo_in", "sed_in", "orgn_in", "sedp_in", "no3_in", "solp_in", "nh3_in", "no2_in", 
                       "flo_out", "sed_out", "orgn_out", "sedp_out", "no3_out","solp_out", "nh3_out","no2_out")
  
  if(ensemble==F){
    
    for (i in 1:length(path)) {
      # Read file
      cha_sd <- read_swat(paste0(path[i], '/channel_sd_day.txt'))
      
      df_temp <- data.frame(scenario = measure_name)
      df_temp <- cbind.data.frame(df_temp, cha_sd[which(cha_sd$unit %in% cha_unit), which(names(cha_sd) %in% columns_to_keep)])
      ifelse(i==1, df <- df_temp, df <- rbind.data.frame(df, df_temp)) 
      print(paste0('daily cha output extracted for scenario ', measr.list[i]))
    }
    write.csv(df, paste0(wd, '/', scen_out, '/daily_output_cha_', hru_unit, '.csv'), row.names = F, quote = F)
  }
  
  if(ensemble==T){
    
    for (i in 1:length(path)) {
      path_ext <- dir(path[i], full.names = T, pattern = 'cal')
      cal_files_short <- dir(path[i], full.names = F, pattern = 'cal')
      
      for (j in 1:length(path_ext)){
        # Read file
        cha_sd <- read_swat(paste0(path_ext[j], '/channel_sd_day.txt'))
        
        df_temp <- data.frame(scenario = measure_list[i], cal = cal_files_short[j])
        df_temp <- cbind.data.frame(df_temp, cha_sd[which(cha_sd$unit %in% cha_unit), which(names(cha_sd) %in% columns_to_keep)])
        
        ifelse(j==1, df_temp2 <- df_temp, df_temp2 <- rbind.data.frame(df_temp2, df_temp)) 
        print(paste0('daily cha output extracted from ', path_ext[j]))
      }
      ifelse(i==1, df <- df_temp2, df <- rbind.data.frame(df, df_temp2)) 
    }
    
    saveRDS(df, paste0(wd, '/', scen_out, '/daily_cha_output_', measure_name, '.rds'))
    print(paste0('daily cha output printed to ', wd, scen_out))
  }
  return(df)
}

get_connected_objects <- function(measr_name){
  
  # read rout_unit.con file
  con_tbl <- read_con_file(paste(project_path, 'rout_unit.con', sep='/'))
  
  # loop over measures
  for(i in 1:length(measr_name)){
    measure <- measr_name[i]
    
    # get hrus for selected measure
    hru_measr <- unlist(unique(loca$obj_id[which(loca$name %in% measure)]))
    
    # loop over hrus (if multiple per measure)
    for(j in 1:length(hru_measr)){
      
      hru_from <- NA
      hru_to <- NA
      cha_to <- NA
      frac_hru_from <- NA
      frac_hru_to <- NA
      frac_cha_to <- NA
      type_cha_to <- NA
      
      # get routing tbl for hrus representing a measure
      tbl_to <- con_tbl %>% filter(id %in% hru_measr[j])
      
      # get hru with highest fraction of connectivity
      hru_to <- as.integer(tbl_to[which(tbl_to[,grep('ru', tbl_to)] == 'ru'),grep('ru', tbl_to)+1][1,])
      if(is.integer0(hru_to)){
        hru_to <- NA
      }else{
      frac_hru_to <- tbl_to[which(tbl_to[,grep('ru', tbl_to)] == 'ru'),grep('ru', tbl_to)+3][1,]
      hru_to <- hru_to[which.max(frac_hru_to)]
      frac_hru_to <- as.numeric(frac_hru_to[which.max(frac_hru_to)])
      }
      
      # get channel with highest fraction of connectivity
      cha_to <- as.integer(tbl_to[which(tbl_to[,grep('sdc', tbl_to)] == 'sdc'),grep('sdc', tbl_to)+1][1,])
      if(is.integer0(cha_to)){
        cha_to <- NA
      }else{
        frac_cha_to <- tbl_to[which(tbl_to[,grep('sdc', tbl_to)] == 'sdc'),grep('sdc', tbl_to)+3][1,]
        type_cha_to <- tbl_to[which(tbl_to[,grep('sdc', tbl_to)] == 'sdc'),grep('sdc', tbl_to)+2][1,]
        cha_to <- cha_to[which.max(frac_cha_to)]
        type_cha_to <- as.character(type_cha_to[which.max(frac_cha_to)])
        frac_cha_to <- as.numeric(frac_cha_to[which.max(frac_cha_to)])
      }
      
      # get the hru that routes into the measure hru (if multiple, the one with highest connectivity)
      obj_from <- con_tbl %>%
        select(starts_with('obj_typ_'))
      
      id_from <- con_tbl %>%
        select(starts_with('obj_id_'))
      
      frac_from <- con_tbl %>%
        select(starts_with('frac_'))
      
      arr <- as.data.frame(which(Vectorize(function(x)  x == hru_measr[j])(id_from), arr.ind=TRUE))
      
      if(is.integer0(arr$row)) hru_from <- NA
      
      # get hru id
      if(length(arr$row)>1){
        hru_from <- arr[which(sapply(1:length(arr$col), function(X){obj_from[arr$row,][X,arr$col[X]]})=='ru'),1]
        if(is.integer0(hru_from)){
          hru_from <- NA
        }else{
          if(length(hru_from) == 1){
            idx <- which(arr$row == hru_from)[1]
            frac_hru_from <- as.numeric(frac_from[arr$row[idx], arr$col[idx]])
          }
        }
      } 

      if(length(arr$row)==1){
        obj_from <- obj_from[arr$row, arr$col]
        if(obj_from == 'ru'){
          hru_from <- as.integer(con_tbl[arr$row, arr$col])
          frac_hru_from <- as.numeric(frac_from[arr$row, arr$col])
        }else{
          hru_from <- NA
        }
      }

      # if multiple, select the one with highest connectivity
      if(length(hru_from)>1){
        # get routing tbl
        tbl_from <- con_tbl %>% filter(id %in% hru_from)
        id_from2 <- tbl_from[which(tbl_from[,grep('ru', tbl_from)] == 'ru'),grep('ru', tbl_from)+1]
        frac_from2 <- tbl_from[which(tbl_from[,grep('ru', tbl_from)] == 'ru'),grep('ru', tbl_from)+3]
        arr2 <- as.data.frame(which(Vectorize(function(x)  x == hru_measr[j])(id_from2), arr.ind=TRUE))
        frac_from2 <- sapply(1:length(arr2$col), function(X){frac_from2[arr2$row,][X,arr2$col[X]]})
        hru_from <- hru_from[which.max(frac_from2)]
        frac_hru_from <- frac_from2[which.max(frac_from2)]
      }
      
      
      # define dataframe for outputs
      con_obj_temp <- data.frame('measure' = NA, 'hru' = NA, 'hru_from' = NA, 'hru_to' = NA, 'cha_to' = NA, 
                                 'frac_hru_from' = NA, 'frac_hru_to' = NA, 'frac_cha_to' = NA, 'type_cha_to' = NA)
      
      con_obj_temp$measure <- measure
      con_obj_temp$hru <- hru_measr[j]
      con_obj_temp$hru_from <- hru_from
      con_obj_temp$hru_to <- hru_to
      con_obj_temp$cha_to <- cha_to
      con_obj_temp$frac_hru_from <- frac_hru_from
      con_obj_temp$frac_hru_to <- frac_hru_to
      con_obj_temp$frac_cha_to <- frac_cha_to
      con_obj_temp$type_cha_to <- type_cha_to
      
      ifelse(i==1, con_obj <- con_obj_temp, con_obj <- rbind.data.frame(con_obj, con_obj_temp))
      
    }
    
  }
  
  return(con_obj)

}

# crop yield related indicators (grain units) based on annual average hru output
ind_bsn_aa_crp <- function(path, crop_sel, out_type, grain_units, ensemble = F){
  
  if (ensemble == F){
    if (out_type == "yield") {
      df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), grain_units_aa=NA)
    } else {
      df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), crops_ha_aa=NA)
    }
    for (i in 1:length(path)) {
      # read output file
      crop_aa <- read_tbl('basin_crop_yld_aa.txt', path[i], 2)
      # Index for reading
      if (out_type == "yield") { 
        crop_sel <- names(grain_units)[match(crop_sel, names(grain_units))]
        idx <- pmatch(crop_sel, crop_aa$plant_name, duplicates.ok = T)
        # Convert yield to grain units and sum it up
        crop_yld_gu <- round(sum(crop_aa$`yld(t)`[idx] * grain_units, na.rm = T),3)
        # collect grain unit values in df_out
        df_out[i,2] <- crop_yld_gu
      } else {
        idx <- pmatch(crop_sel, crop_aa$plant_name, duplicates.ok = T)
        # sum up hectare values and collect in df_out
        df_out[i,2] <- round(sum(crop_aa$`harv_area(ha)`[idx], na.rm = T),2)
      }
    }
    
    if (out_type == "yield") write.csv(df_out, paste(wd, scen_out, '/6_bsn_aa_gu.csv', sep='/'),row.names = F, quote = F) else{
      write.csv(df_out, paste(wd, scen_out, '/6_bsn_aa_ha.csv', sep='/'),row.names = F, quote = F)
    } 

  }
  
  if (ensemble == T){
    if (out_type == "yield") {
      df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), 
                           grain_units_aa=NA, grain_units_aa_lower=NA, grain_units_aa_upper=NA)
    } else {
      df_out <- data.frame(scen_name=sapply(strsplit(path, split ="/"),tail,1), 
                           crops_ha_aa=NA, crops_ha_aa_lower=NA, crops_ha_aa_upper=NA)
    }
    
    for (i in 1:length(path)) {
      path_ext <- dir(path[i], full.names = T, pattern = 'cal')
      if (out_type == "yield") df_out2 <- data.frame(grain_units_aa=NA) else{
        df_out2 <- data.frame(crops_ha_aa=NA)
      }
      
      for (k in 1:length(path_ext)){
        # read output file
        crop_aa <- read_tbl('basin_crop_yld_aa.txt', path_ext[k], 2)
        if (out_type == "yield"){
        # Index for reading
          crop_sel <- names(grain_units)[match(crop_sel, names(grain_units))]
          idx <- pmatch(crop_sel, crop_aa$plant_name, duplicates.ok = T)
          # Convert yield to grain units and sum it up
          crop_yld_gu <- round(sum(crop_aa$`yld(t)`[idx] * grain_units, na.rm = T),3)
          # collect grain unit values in df_out
          df_out2[k,1] <- crop_yld_gu
        } else {
          idx <- pmatch(crop_sel, crop_aa$plant_name, duplicates.ok = T)
          # sum up hectare values and collect in df_out
          df_out2[k,1] <- round(sum(crop_aa$`harv_area(ha)`[idx], na.rm = T),2)
        }
      }
      
      if (out_type == "yield") write.csv(df_out2, paste0(path[i],'/6_bsn_aa_gu.csv'),row.names = F, quote = F) else{
        write.csv(df_out2, paste0(path[i],'/6_bsn_aa_ha.csv'),row.names = F, quote = F)
      }
      
      
      df_out[i,2] <- colMeans(df_out2)  
      df_out[i,3] <- lapply(df_out2, FUN='min')
      df_out[i,4] <- lapply(df_out2, FUN='max')   
    }
  }
  
  return(df_out)
}

# crop yield related indicators (area and yield) based on annual average hru output
ind_bsn_aa_crp_ha_Y <- function(path, crop_sel, ensemble=F){
  
  if (ensemble == F){
    # Read files & prepare data
    df_out <- data.frame(matrix(ncol = length(crop_sel)*2+1, nrow = length(path)))
    colnames(df_out) <- c("scen_name", paste(crop_sel, "_ha", sep=""), paste(crop_sel, "_yld_t_ha", sep=""))
    df_out$scen_name <- sapply(strsplit(path, split ="/"),tail,1)
    for (i in 1:length(path)) {
      # read output file
      crop_aa <- read_tbl('basin_crop_yld_aa.txt', path[i], 2)
      # Index for reading
      idx <- pmatch(crop_sel, crop_aa$plant_name, duplicates.ok = T)
      # collect ha and yield values in df_out
      df_out[i,2:ncol(df_out)] <- round(c(crop_aa$`harv_area(ha)`[idx], crop_aa$`yld(t/ha)`[idx]), 2)
    }
    
    write.csv(df_out, paste(wd, scen_out, '/7_bsn_aa_crpyld.csv', sep='/'),row.names = F, quote = F)
    
  }
  
  if (ensemble == T){
    # Read files & prepare data
    df_out <- data.frame(matrix(ncol = length(crop_sel)*4+1, nrow = length(path)))
    colnames(df_out) <- c("scen_name", 
                          paste(crop_sel, "_ha", sep=""), 
                          paste(crop_sel, "_yld_t_ha", sep=""),
                          paste(crop_sel, "_yld_t_ha_lower", sep=""),
                          paste(crop_sel, "_yld_t_ha_upper", sep=""))
    df_out$scen_name <- sapply(strsplit(path, split ="/"),tail,1)
    for (i in 1:length(path)) {
      path_ext <- dir(path[i], full.names = T, pattern = 'cal')
      df_out2 <- data.frame(matrix(ncol = length(crop_sel)*2, nrow = length(path_ext)))
      for (k in 1:length(path_ext)){
        # read output file
        crop_aa <- read_tbl('basin_crop_yld_aa.txt', path_ext[k], 2)
        # Index for reading
        idx <- pmatch(crop_sel, crop_aa$plant_name, duplicates.ok = T)
        # collect ha and yield values in df_out
        df_out2[k,1:ncol(df_out2)] <- round(c(crop_aa$`harv_area(ha)`[idx], crop_aa$`yld(t/ha)`[idx]), 2)
      }
      
      names(df_out2) <- c(paste0(crop_sel, "_ha"),paste0(crop_sel, "_yld_t_ha"))
      write.csv(df_out2, paste0(path[i],'/7_bsn_aa_crpyld.csv'),row.names = F, quote = F)
      
      df_out[i,2:(length(df_out2)+1)] <- colMeans(df_out2)  
      df_out[i,(length(df_out2)+2):(1.5*length(df_out2)+1)] <- lapply(df_out2[(0.5*length(df_out2)+1):length(df_out2)], FUN='min')
      df_out[i,(1.5*length(df_out2)+2):(2*length(df_out2)+1)] <- lapply(df_out2[(0.5*length(df_out2)+1):length(df_out2)], FUN='max')
    }
  }
 
  return(df_out)
}

# get all calculated indicators for your scenario simulations
get_all_ens_results <- function(){
  if(length(cal_files) > 0){
    ens_results <- setNames(replicate(length(measr.list),data.frame()),measr.list)
    for (i in 1:length(path)) {
      csv_files <- dir(paste(wd,scen_out,sep='/'), pattern = 'csv')
      idx <- which(grepl("^[[:digit:]]+", csv_files))
      if(is.integer0(idx)) path_csv <- dir(path[i], full.names = T, pattern = 'csv') else{
        path_csv <- dir(paste(wd,scen_out,sep='/'), full.names = T, pattern = 'csv')[idx]
        }
      df <- read.csv(path_csv[1])
      for(k in 2:length(path_csv)) df <- cbind.data.frame(df, read.csv(path_csv[k]))
      ens_results[[i]] <- df
    }
  }else{
    csv_files <- dir(paste(wd,scen_out,sep='/'), pattern = 'csv')
    idx <- which(grepl("^[[:digit:]]+", csv_files))
    if(is.integer0(idx)) path_csv <- dir(paste(wd,scen_out,sep='/'), full.names = T, pattern = 'csv') else{
      path_csv <- dir(paste(wd,scen_out,sep='/'), full.names = T, pattern = 'csv')[idx]
    }
    ens_results <- read.csv(path_csv[1])
    for(k in 2:length(path_csv)) ens_results <- cbind.data.frame(ens_results, read.csv(path_csv[k])[,-1, drop = FALSE])
  }
  return(ens_results)
}

# calculate mean, median, min and max for cal file ensemble results (% change to status quo)
calc_ens_stats <- function(){
  if(length(cal_files) > 0){
    # calculate statistics of percentage changes for each cal file scenario result
    ens_stats <- setNames(replicate(length(measr.list),data.frame()),measr.list)
    
    for(i in 1:length(measr.list)){
      df <- data.frame(matrix(ncol=length(names(ens_results[[1]])),
                              nrow=4,
                              dimnames=list(c('mean','median','min','max'),names(ens_results[[1]]))))
      if(i==1){
        df[1,] <- lapply(ens_results[[1]], FUN='mean')
        df[2,] <- lapply(ens_results[[1]], FUN='median')
        df[3,] <- lapply(ens_results[[1]], FUN='min')
        df[4,] <- lapply(ens_results[[1]], FUN='max')
      } else{
        relchg <- (ens_results[[i]] - ens_results[[1]]) / ens_results[[1]] * 100
        df[1,] <- lapply(relchg, FUN='mean')
        df[2,] <- lapply(relchg, FUN='median')
        df[3,] <- lapply(relchg, FUN='min')
        df[4,] <- lapply(relchg, FUN='max')
      }
      
      df <- df %>% 
        mutate('stats'=row.names(.), .before = Q_mean) %>% 
        mutate('scen_name'=measr.list[i], .before = stats)
      
      ens_stats[[i]] <- df
    }
    
    ens_stats_all <- rbindlist(ens_stats)
  }else{
    ens_stats_all <- ens_results
    for(i in 2:length(measr.list)){
      ens_stats_all[i,-1] <- (ens_results[i,-1] - ens_results[1,-1]) / ens_results[1,-1] * 100
    }
  }
  return(ens_stats_all)
}

# Function to round smartly
round_signif <- function(x) {
  ifelse(abs(x) >= 100, round(x, 0), signif(x, 2))
}

# plot indicators (all or single categories)
plot_indicators <- function(df_plot_long, separate_plots = F) {
  df_names <- names(ens_stats_all)
  q_names  <- c(df_names[str_detect(df_names, 'Q_')],"perc", "sw", "sw300")
  sw_names <- df_names[str_detect(df_names, 'sw_[:digit:]')]
  sw300_names <- df_names[str_detect(df_names, 'sw300_[:digit:]')]
  n_names  <- df_names[str_detect(df_names, '^N')]
  p_names  <- df_names[str_detect(df_names, '^P')]
  s_names  <- df_names[str_detect(df_names, '^Sed')]
  u_names  <- c("grain_units_aa", "crops_ha_aa")[c("grain_units_aa", "crops_ha_aa") %in% df_names]
  c_names  <- df_names[str_detect(df_names, '_ha$')]
  
  df_plot_order <- c(q_names, sw_names, sw300_names, n_names, p_names, s_names, u_names, c_names)
  # adapt the factors accordingly
  df_plot_long$indi <- factor(df_plot_long$indi, levels = rev(df_plot_order))
  
  df_plot_long <- df_plot_long %>% 
    mutate(indi_group = ifelse(indi %in% c(q_names, sw_names, sw300_names), 'Hydrology', NA),
           indi_group = ifelse(indi %in% c(n_names, p_names, s_names), 'Nutrients and Sediments', indi_group),
           indi_group = ifelse(indi %in% c(u_names, c_names), 'Crop yields', indi_group))
  
  indi_groups <- c('Hydrology', 'Nutrients and Sediments', 'Crop yields')
  
  gg_list <- list()
  for(i in 1:3) {
    tbl_i <- filter(df_plot_long, indi_group == indi_groups[i])
    if(separate_plots) {
      gg_list[[i]] <- plot_indicator_i(tbl_i, add_legend = T, 
                                       add_title_x = T, add_title_y = T, 
                                       plot_title = indi_groups[i])
      
    } else {
      gg_list[[i]] <- plot_indicator_i(tbl_i, add_legend = i == 1, 
                                       add_title_x = i == 3, add_title_y = i == 2, 
                                       plot_title = indi_groups[i])
    }
  }
  
  if (separate_plots) {
    gg <- gg_list
  } else {
    hgt_frac <- c(length(c(q_names, sw_names, sw300_names)) / length(df_names), 
                  length(c(n_names, p_names, s_names)) / length(df_names),
                  length(c(u_names, c_names)) / length(df_names))
    
    gg <- gg_list[[1]] / gg_list[[2]] / gg_list[[3]] + plot_layout(heights = hgt_frac)
  }
  
  return(gg)
}

# plot indicators (individual selection)
plot_indicator_i <- function(tbl, add_legend = T, add_title_x = T, 
                             add_title_y = T, plot_title) {
  ylima <- tbl %>% 
    filter(scen_name != 'all') %>% 
    group_by(indi) %>% 
    summarize(
      'value_neg' = sum(ifelse(value<0,value,0),na.rm=T),
      'value_pos' = sum(ifelse(value>0,value,0),na.rm=T)
      )
  
  ylimb <- tbl %>% 
    filter(scen_name == 'all')

  gg <- ggplot() +
    geom_bar(data = subset(tbl, tbl$scen_name!="all"), 
             aes(x = indi, y = value, fill = scen_name), 
             stat = "identity", 
             position = "stack", color = 'grey30') + 
    labs(x="Indicators", y="Relative effects compared to status quo [%]", 
         fill = 'Scenarios', color = NULL, title = plot_title) + 
    ylim(c(-max(abs(c(ylima$value_neg,ylima$value_pos,ylimb$value))),
           max(abs(c(ylima$value_neg,ylima$value_pos,ylimb$value))))) +
    scale_fill_brewer(palette = "Accent") + 
    coord_flip() + 
    geom_point(data = subset(tbl, tbl$scen_name=="all"),
               aes(x = indi, y = value, group = 1, color = 'all_scen'),
               size = 3,
               shape= 4,
               stroke = 1) +
    geom_hline(yintercept = 0, col = "black") + 
    scale_color_manual(labels = c('all scenarios'), 
                       values = c('black')) +
    theme_bw() + 
    theme(panel.grid.major = element_blank(), 
          panel.grid.minor = element_blank(),
          plot.title = element_text(size = 9, face = 'bold'),
          legend.title = element_text(size = 9),
          axis.title = element_text(size = 9)
    ) 
  
  if(!add_legend) {
    gg <- gg +
      theme(legend.position = 'none')
  }
  if(!add_title_x) {
    gg <- gg + 
      theme(axis.title.x = element_blank())
  }
  if(!add_title_y) {
    gg <- gg + 
      theme(axis.title.y = element_blank())
  }
  
  return(gg)
}

# Load in observations
get_obs <- function(obs_path, obs_type, sim_period) {
  
  start_date <- ISOdate(sim_period[1], 1, 1)
  end_date <- ISOdate(sim_period[2], 12, 31)
  
  if(obs_type == 'q'){
    gauge_file_paths <- dir(obs_path, pattern = obs_type, full.names = T)
    gauge_file_names <- dir(obs_path, pattern = obs_type, full.names = F)
    
    pos1 <- unlist(gregexpr('cha', gauge_file_names))+3
    cha <- substring(gauge_file_names, pos1, pos1+3)
    
    obs <- setNames(replicate(length(cha),data.frame()),cha)
    
    for(i in 1:length(obs)){
      obs[[i]] <- read.csv(gauge_file_paths[i]) %>%
        mutate(date = as.Date(date)) %>% 
        filter(date >= as.Date(start_date),
               date <= as.Date(end_date))
    }
  }else{
    gauge_file_paths <- dir(obs_path, pattern = obs_type, full.names = T)
    gauge_file_names <- dir(obs_path, pattern = obs_type, full.names = F)
    flow_gauge_file_paths <- dir(obs_path, pattern = 'q', full.names = T)
    flow_gauge_file_names <- dir(obs_path, pattern = 'q', full.names = F)
    
    pos1 <- unlist(gregexpr('cha', gauge_file_names))+3
    pos1_flow <- unlist(gregexpr('cha', flow_gauge_file_names))+3
    cha <- substring(gauge_file_names, pos1, pos1+3)
    cha_flow <- substring(flow_gauge_file_names, pos1_flow, pos1_flow+3)
    
    idx <- which(cha %in% cha_flow)
    idx_flow <- which(cha_flow %in% cha)
    cha <- cha[idx]
    
    gauge_file_paths <- gauge_file_paths[idx]
    flow_gauge_file_paths <- flow_gauge_file_paths[idx_flow]
    
    obs <- obs_flow <- setNames(replicate(length(cha),data.frame()),cha)
    
    for(i in 1:length(obs)){
      obs_flow[[i]] <- read.csv(flow_gauge_file_paths[i]) %>%
        filter(date >= as.Date(start_date),
               date <= as.Date(end_date))
      obs[[i]] <- read.csv(gauge_file_paths[i]) %>%
        filter(date %in% obs_flow[[i]]$date)
      obs_flow[[i]] <- obs_flow[[i]] %>% 
        filter(date %in% obs[[i]]$date)
      if(obs_type == 'tss'){
        obs[[i]] <- obs[[i]] %>% 
          mutate(date = as.Date(date),
                 value = value/1e6 * obs_flow[[i]]$value * 86400)
      }else{
        obs[[i]] <- obs[[i]] %>% 
          mutate(date = as.Date(date),
                 value = value/1e3 * obs_flow[[i]]$value * 86400)
      }
    }
  }
  return(obs)
}

# Calculate model performance metrics
calc_performance <- function(sim, obs){
  
  idx <- which(sim$date %in% obs$date)
  
  # Calculate flow duration curves (FDC) for observed data and the simulations.
  fdc_obs <- calc_fdc(obs$value)
  fdc_sim <- calc_fdc(select(sim[idx,], - date))
  
  # Calculate the ratio of RSME and standard deviation for different segments
  # of the FDC (same as in the publications of the Kiel working group).
  rsr_fdc <- calc_fdc_rsr(fdc_sim, fdc_obs, c(5, 20, 70, 95))
  
  # I was testing if not FDC but different flow segments (keeping the time 
  # component) would be a better criterion.
  p <- c(5, 20, 70, 95)
  p_lbl <- c('p_0_5', 'p_5_20', 'p_20_70', 'p_70_95', 'p_95_100')
  fdc_thrs <- c(max(fdc_obs$value),
                approx(fdc_obs$p, fdc_obs$value, p)$y,
                -0.1)
  # Separate the hydrograph into high medium and low flows.
  obs_sep <- map2(fdc_thrs[1:(length(fdc_thrs) - 1)],
                  fdc_thrs[2:length(fdc_thrs)],
                  ~ mutate(obs, value = ifelse(value <= .x & value > .y, value, NA))) %>% 
    map2(., p_lbl, ~ set_names(.x, c('date', .y))) %>% 
    reduce(., left_join, by = 'date')
  
  # Calculate further criteria, e.g. NSE, KGE, pbias, whatever...
  nse <- map_dbl(select(sim[idx,], - date), ~NSE(.x, obs$value))
  rsr_vh <- map_dbl(select(sim[idx,], - date), ~rsr(.x, obs_sep$p_0_5))
  rsr_h <- map_dbl(select(sim[idx,], - date), ~rsr(.x, obs_sep$p_5_20))
  rsr_m <- map_dbl(select(sim[idx,], - date), ~rsr(.x, obs_sep$p_20_70))
  rsr_l <- map_dbl(select(sim[idx,], - date), ~rsr(.x, obs_sep$p_70_95))
  rsr_vl <- map_dbl(select(sim[idx,], - date), ~rsr(.x, obs_sep$p_95_100))
  kge <- map_dbl(select(sim[idx,], - date), ~KGE(.x, obs$value))
  pb  <- map_dbl(select(sim[idx,], - date), ~pbias(.x, obs$value))
  rd <- map_dbl(select(sim[idx,], - date), ~rd(.x, obs$value))
  mae <- map_dbl(select(sim[idx,], - date), ~mae(.x, obs$value))
  r2 <- map_dbl(select(sim[idx,], - date), ~cor(.x, obs$value)^2)
  
  # Put all of your selected criteria together in one objectives table.
  obj_tbl <- bind_cols(run = names(nse),
                       nse = nse,
                       rsr_vh = -rsr_vh,
                       rsr_h = -rsr_h,
                       rsr_m = -rsr_m,
                       rsr_l = -rsr_l,
                       rsr_vl = -rsr_vl,
                       kge = kge, 
                       pbias = pb,
                       rsr_0_5 = - rsr_fdc$p_0_5, 
                       rsr_5_20 = - rsr_fdc$p_5_20, 
                       rsr_20_70 = - rsr_fdc$p_20_70,
                       rsr_70_95 = - rsr_fdc$p_70_95,
                       rsr_95_100 = -rsr_fdc$p_95_100,
                       rd = rd,
                       mae = mae,
                       r2 = r2) 
  return(obj_tbl)
}

calc_fdc <- function(x) {
  if(is.vector(x)) {
    x <- tibble(value = x)
  }
  
  n <- nrow(x)
  
  x %>%
    apply(., 2, sort, decreasing = TRUE) %>%
    as_tibble(.) %>%
    mutate(p = 100 * 1:n / (n + 1), .before = 1)
}

calc_fdc_rsr <- function(fdc_sim, fdc_obs, quantile_splits, out_tbl = 'long') {
  if(all(quantile_splits <= 1)) {
    quantile_splits <- 100 * quantile_splits
  }
  quantile_splits <- sort(unique(c(0, 100, quantile_splits)))
  p_cuts <- cut(fdc_obs$p, quantile_splits)
  
  obs <- split(select(fdc_obs, -p), p_cuts)
  sim <- split(select(fdc_sim, -p), p_cuts)
  
  rsr_list <- map2(sim, obs, ~ rsr_df(.x, .y[[1]]))
  
  if(out_tbl == 'long') {
    n_col <- length(quantile_splits) - 1
    col_names <- paste0('p_', quantile_splits[1:n_col],
                        '_',  quantile_splits[2:(n_col + 1)])
    rsr <- bind_cols(rsr_list) %>%
      set_names(col_names) %>%
      mutate(., run = names(fdc_sim)[2:ncol(fdc_sim)], .before = 1)
  } else {
    rsr <- rsr_list %>%
      bind_rows(.) %>%
      mutate(p = unique(p_cuts), .before = 1)
  }
  return(rsr)
}

rsr_df <- function(df_sim, v_obs) {
  map_dbl(df_sim, ~ rsr(.x, v_obs))
}

plot_selected_sim <- function(sim, obs = NULL, run_ids = NULL, run_sel = NULL, plot_bands = TRUE, 
                              x_label = 'Date', y_label = "Discharge (m<sup>3</sup> s<sup>-1</sup>)") {
  
  if(is.null(run_ids) & is.null(run_sel)) {
    stop("At least one of 'run_ids' or 'run_sel' must be provided.")
  }
  if(!is.Date(sim[[1]])){
    stop("The first column of 'sim' must by of type 'Date'.")
  }
  
  dy_tbl <- select(sim, date)
  
  if(!is.null(obs)) {
    if(!is.Date(obs[[1]])){
      stop("The first column of 'obs' must by of type 'Date'.")
    }
    names(obs) <- c('date', 'obs')
    dy_tbl <- left_join(dy_tbl, obs, by = 'date')
  } 
  
  nchar_run <- nchar(names(sim)[2]) - 4
  
  if(!is.null(run_sel)) {
    run_sel <- paste0('run_', sprintf(paste0('%0', nchar_run, 'd'), run_sel))
    dy_tbl <- add_column(dy_tbl, sim_sel = sim[, run_sel])
  }
  
  if(!is.null(run_ids)) {
    run_ids <- paste0('run_', sprintf(paste0('%0', nchar_run, 'd'), run_ids))
    sim_ids <- sim[, run_ids]
    if(plot_bands) {
      sim_upr <- apply(sim_ids, 1, max)
      sim_lwr <- apply(sim_ids, 1, min)
      dy_tbl <- add_column(dy_tbl, upr   = sim_upr, lwr   = sim_lwr,
                           upr_l = sim_upr, lwr_l = sim_lwr)
    } else {
      dy_tbl <- bind_cols(dy_tbl, sim_ids)
    }
  }
  
  
  dy_xts <- xts(dy_tbl, order.by = dy_tbl$date)
  
  dy_plt <- dy_xts %>% 
    dygraph(., xlab = x_label, ylab = y_label) %>% 
    dyRangeSelector(height = 30)
  
  if(!is.null(obs)) {
    dy_plt <- dy_plt %>% 
      dySeries('obs', color = 'black', drawPoints = TRUE, 
               pointSize = 2, strokeWidth = 0.75)
  }
  
  if(plot_bands) {
    if(!is.null(run_ids) & !is.null(run_sel)) {
      dy_plt <- dy_plt %>% 
        dySeries(c("lwr", "sim_sel", "upr"), label = "sim_sel", 
                 color =  "#A50F15", strokeWidth = 1.2, 
                 drawPoints = TRUE, pointSize = 2) %>% 
        dySeries("lwr_l", label = "lower", color =  "#CB181D", 
                 strokePattern = 'dashed') %>% 
        dySeries("upr_l", label = "upper", color =  "#CB181D", 
                 strokePattern = 'dashed')
    } else if (is.null(run_ids)) {
      dy_plt <- dy_plt %>% 
        dySeries("sim_sel", label = "sim_sel", 
                 color =  "#A50F15", strokeWidth = 1.2, 
                 drawPoints = TRUE, pointSize = 2) 
    } else {
      dy_plt <- dy_plt %>% 
        dySeries(c("lwr", "upr_l", "upr"), label = "upper", 
                 color =  "#CB181D", strokePattern = 'dashed') %>% 
        dySeries("lwr_l", label = "lower", color =  "#CB181D", 
                 strokePattern = 'dashed')
    }
  } else {
    col_pal <- c("#377EB8", "#4DAF4A", "#984EA3", "#FF7F00", "#FFFF33", 
                 "#A65628", "#F781BF", "#999999", "#1B9E77", "#D9D9D9")
    if(!is.null(run_ids)) {
      for(i in 1:length(run_ids)) {
        dy_plt <- dy_plt %>% 
          dySeries(run_ids[i], label = run_ids[i], 
                   color =  col_pal[i], strokeWidth = 1)
      }
      dy_plt <- dy_plt %>% 
        dyHighlight(highlightSeriesBackgroundAlpha = 0.6,
                    hideOnMouseOut = TRUE)
    }
    if (!is.null(run_sel)) {
      dy_plt <- dy_plt %>% 
        dySeries("sim_sel", label = "sim_sel", 
                 color =  "#A50F15", strokeWidth = 1.2, 
                 drawPoints = TRUE, pointSize = 2) 
    } else {
      dy_plt <- dy_plt %>% 
        dySeries(c("lwr", "upr_l", "upr"), label = "upper", 
                 color =  "#CB181D", strokePattern = 'dashed') %>% 
        dySeries("lwr_l", label = "lower", color =  "#CB181D", 
                 strokePattern = 'dashed')
    }
  }
  
  return(dy_plt)
}

run_scenarios <- function(swat_exe = 'SWATp_jan_sept.exe', 
                         base_path = wd, 
                         scen_output = scen_out,
                         measure.list = measr.list,
                         outflow_reach=cha_id){
  ## Input for the print file
  print_prt <- read_lines(paste0(base_path,'/txt/print.prt'), lazy = FALSE)
  print_prt <- gsub(" y ", " n ", print_prt)
  
  print_prt[33] <- "hru_wb                       n             y             n             y  "
  print_prt[34] <- "hru_nb                       n             n             n             y  "
  print_prt[35] <- "hru_ls                       n             n             n             y  "
  print_prt[36] <- "hru_pw                       n             n             n             y  "
  print_prt[42] <- "channel_sd                   n             n             n             y  "
  print_prt[44] <- "reservoir                    n             n             n             y  "
  
  write_lines(print_prt, paste0(base_path,'/txt/print.prt'))
  
  ## Write object.prt
  obj_prt_path <- paste0(base_path,'/txt/object.prt')
  unlink(obj_prt_path )
  write.table(paste0("object.prt", ": written by the OPTAIN measure scenario workflow ", Sys.time()), 
              obj_prt_path, append = FALSE, sep = "\t", 
              dec = ".", row.names = FALSE, col.names = FALSE, quote = FALSE)
  write.table(paste(sprintf(c(rep('%12s', 4), '%20s'), 
                            c("ID", "OBJ_TYP", "OBJ_TYP_NO", "HYD_TYP", "FILENAME")), 
                    collapse = ' '), obj_prt_path , append = TRUE, 
              sep = "\t", dec = ".", row.names = FALSE, col.names = FALSE, quote = FALSE)
  write.table(paste(sprintf(c(rep('%12s', 4), '%20s'), 
                            c("1", "sdc", as.character(outflow_reach), "tot", "cha_day.out")), 
                    collapse = ' '), obj_prt_path , append = TRUE, 
              sep = "\t", dec = ".", row.names = FALSE, col.names = FALSE, quote = FALSE)
  
  file_cio <- readLines(paste0(base_path, '/txt/file.cio'))
  file_cio[2] <- "simulation        time.sim          print.prt         object.prt        object.cnt        null              " 
  file_cio[22] <- "chg               cal_parms.cal     calibration.cal   null              null              null              null              null              null              null"
  writeLines(file_cio, paste0(base_path, '/txt/file.cio'))
  
  check_files <- list.files(scen_output)
  if (file.exists(scen_output) & length(check_files)>0) {
    time <- Sys.time() %>% 
      gsub(" ", "_", ., fixed = TRUE) %>% 
      gsub(":", "-", ., fixed = TRUE) %>%
      substring(., 1, 19)
    file.rename(scen_output, paste0(scen_output,'_backup_',time)) #do a backup if output folder exists
    unlink(scen_output,recursive = TRUE)
  }
  
  suppressWarnings(dir.create(scen_output, recursive = TRUE)) 
  
  if(length(cal_files)>0){
    
    for(j in seq_len(length(cal_files))) {
      txt_calx <- paste0('txt_cal',j)
      txt_calx_path <- paste(wd,txt_calx,sep='/')
      if (file.exists(txt_calx_path)) {
        unlink(txt_calx_path, recursive=TRUE)
        print(paste0('Deleting existing ', txt_calx, ' folder'))
      }
      copyDirectory(project_path, txt_calx_path)
      print(paste0('Creating ', txt_calx, ' folder'))
      
      file.copy(cal_files[j], paste0(txt_calx_path,'/calibration.cal'), overwrite = T)
    }
    
    print('Calibration files copied to txt_cal folders')
    
    txt_cal <- dir(pattern='txt_cal')
    cl <- makeCluster(length(txt_cal)) 
    registerDoParallel(cl)
    
    for(measure in measure.list){
      
      for(k in 1:length(txt_cal)){
        
        load_measr(paste0(base_path, '/', txt_cal[k],'/', measr_name, '.measr'))
        # assign the measR project to a default variable with the name 'measr'
        assign('measr', get(gsub('.measr', '', measr_name)))
        measr$reset()
        
        if(measure %nin% c('statusquo', 'all')){
          idx <- loca$id[which(loca$nswrm == measure)]
          measr$implement_nswrm(nswrm_id = idx)
          measr$write_swat_inputs()
        }
        
        if(measure=='all'){
          idx <- loca$id
          measr$implement_nswrm(nswrm_id = idx)
          measr$write_swat_inputs()
          measr$reset()
        }
        print(paste0('Implemented scenario ', measure,' in ', txt_cal[k]))
      }
    
      print(paste0('Running scenario ', measure,' in all txt_cal folders'))
      
      foreach (txt = txt_cal, .verbose = F) %dopar% {
        
        # run SWAT for all cal files in parallel
        setwd(paste(base_path, txt, sep='/'))
        system(swat_exe)
        
        #file handling
        cal <- unlist(strsplit(txt,'_'))[2]
        n_dir <- paste(scen_output, measure, cal, sep='/')
        dir.create(paste(base_path, n_dir, sep='/'), recursive = TRUE)
        
        files.out.aa <- dir(getwd(), pattern = 'aa')
        files.out.mon <- dir(getwd(), pattern = 'mon')
        files.out.day <- dir(getwd(), pattern = 'day')
        files.help <- c('hru.con', 'hru_agr.txt') 
        
        file.copy(c(files.out.aa,files.out.mon,files.out.day,files.help), paste(base_path, n_dir, sep='/'), overwrite = T)
      }
    }
    
    stopCluster(cl)
    
  }else{
   
    for(measure in measure.list){
      txt_scenx <- paste0('txt_scen_', measure)
      txt_scenx_path <- paste(wd,txt_scenx,sep='/')
      if (file.exists(txt_scenx_path)) {
        unlink(txt_scenx_path, recursive=TRUE)
        print(paste0('Deleting existing ', measure, ' scenario txt folder'))
      }
      copyDirectory(project_path, txt_scenx_path)
      print(paste0('Creating ', measure, ' scenario txt folder'))
      
      print(paste0('Implementing scenario ', measure,' in folder ', txt_scenx))
      
      load_measr(paste0(txt_scenx,'/', measr_name, '.measr'))
      # assign the measR project to a default variable with the name 'measr'
      assign('measr', get(gsub('.measr', '', measr_name)))
      measr$reset()
      
      if(measure %nin% c('statusquo', 'all')){
        idx <- loca$id[which(loca$nswrm == measure)]
        measr$implement_nswrm(nswrm_id = idx)
        measr$write_swat_inputs()
      }
      
      if(measure=='all'){
        idx <- loca$id
        measr$implement_nswrm(nswrm_id = idx)
        measr$write_swat_inputs()
      }
    }
      
      print('Running measure scenarios in parallel')
      
      txt_scen <- dir(pattern='txt_scen')
      cl <- makeCluster(length(measure.list)) 
      registerDoParallel(cl)
      
      foreach (txt = txt_scen, .verbose = F) %dopar% {
      # run SWAT in txt folder
      setwd(paste(base_path, txt, sep='/'))
      system(swat_exe) 
      
      #file handling
      scen <- unlist(strsplit(txt,'_'))[3]
      n_dir <- paste(scen_output, scen, sep='/')
      dir.create(paste(base_path, n_dir, sep='/'), recursive = TRUE)
      
      files.out.aa <- dir(getwd(), pattern = 'aa')
      files.out.mon <- dir(getwd(), pattern = 'mon')
      files.out.day <- dir(getwd(), pattern = 'day')
      files.help <- c('hru.con', 'hru_agr.txt')
      
      file.copy(c(files.out.aa,files.out.mon,files.out.day,files.help), paste(base_path, n_dir, sep='/'), overwrite = T)
      }
    stopCluster(cl)
  }
}

run_scenarios2 <- function(swat_exe = 'SWATp_jan_sept.exe', 
                           base_path = wd, 
                           scen_output = scen_out,
                           measure.list = measr.list,
                           outflow_reach=cha_id){
  ## Input for the print file
  print_prt <- read_lines(paste0(base_path,'/txt/print.prt'), lazy = FALSE)
  print_prt <- gsub(" y ", " n ", print_prt)
  
  print_prt[33] <- "hru_wb                       n             y             n             y  "
  print_prt[34] <- "hru_nb                       n             n             n             y  "
  print_prt[35] <- "hru_ls                       n             n             n             y  "
  print_prt[36] <- "hru_pw                       n             n             n             y  "
  print_prt[42] <- "channel_sd                   n             n             n             y  "
  print_prt[44] <- "reservoir                    n             n             n             y  "
  
  write_lines(print_prt, paste0(base_path,'/txt/print.prt'))
  
  ## Write object.prt
  obj_prt_path <- paste0(base_path,'/txt/object.prt')
  unlink(obj_prt_path )
  write.table(paste0("object.prt", ": written by the OPTAIN measure scenario workflow ", Sys.time()), 
              obj_prt_path, append = FALSE, sep = "\t", 
              dec = ".", row.names = FALSE, col.names = FALSE, quote = FALSE)
  write.table(paste(sprintf(c(rep('%12s', 4), '%20s'), 
                            c("ID", "OBJ_TYP", "OBJ_TYP_NO", "HYD_TYP", "FILENAME")), 
                    collapse = ' '), obj_prt_path , append = TRUE, 
              sep = "\t", dec = ".", row.names = FALSE, col.names = FALSE, quote = FALSE)
  write.table(paste(sprintf(c(rep('%12s', 4), '%20s'), 
                            c("1", "sdc", as.character(outflow_reach), "tot", "cha_day.out")), 
                    collapse = ' '), obj_prt_path , append = TRUE, 
              sep = "\t", dec = ".", row.names = FALSE, col.names = FALSE, quote = FALSE)
  
  file_cio <- readLines(paste0(base_path, '/txt/file.cio'))
  file_cio[2] <- "simulation        time.sim          print.prt         object.prt        object.cnt        null              " 
  file_cio[22] <- "chg               cal_parms.cal     calibration.cal   null              null              null              null              null              null              null"
  writeLines(file_cio, paste0(base_path, '/txt/file.cio'))
  
  check_files <- list.files(scen_output)
  if (file.exists(scen_output) & length(check_files)>0) {
    time <- Sys.time() %>% 
      gsub(" ", "_", ., fixed = TRUE) %>% 
      gsub(":", "-", ., fixed = TRUE) %>%
      substring(., 1, 19)
    file.rename(scen_output, paste0(scen_output,'_backup_',time)) #do a backup if output folder exists
    unlink(scen_output,recursive = TRUE)
  }
  
  suppressWarnings(dir.create(scen_output, recursive = TRUE)) 
  
  for(measure in measure.list){
    txt_scenx <- paste0('txt_scen_', measure)
    txt_scenx_path <- paste(wd,txt_scenx,sep='/')
    if (file.exists(txt_scenx_path)) {
      unlink(txt_scenx_path, recursive=TRUE)
      print(paste0('Deleting existing ', measure, ' scenario txt folder'))
    }
    copyDirectory(project_path, txt_scenx_path)
    print(paste0('Creating ', measure, ' scenario txt folder'))
    
    print(paste0('Implementing scenario ', measure,' in folder ', txt_scenx))
    
    load_measr(paste0(txt_scenx,'/', measr_name, '.measr'))
    # assign the measR project to a default variable with the name 'measr'
    assign('measr', get(gsub('.measr', '', measr_name)))
    measr$reset()
    
    if(measure %nin% c('statusquo', 'all')){
      idx <- loca$id[which(loca$nswrm == measure)]
      measr$implement_nswrm(nswrm_id = idx)
      measr$write_swat_inputs()
    }
    
    if(measure=='all'){
      idx <- loca$id
      measr$implement_nswrm(nswrm_id = idx)
      measr$write_swat_inputs()
    }
  }
  
  txt_scen <- dir(pattern='txt_scen')
  txt_scen_path <- dir(pattern='txt_scen', full.names = T)
  
  if(length(cal_files)>0){
    
    cal_files_short <- dir(paste0(wd,'/cal_files'))
    cal_files_number <-  unlist(strsplit(cal_files_short,'.cal'))
    cal_files_number <-  unlist(strsplit(cal_files_number,'calibration_'))
    cal_files_number <- as.numeric(cal_files_number[seq(2,length(cal_files_number),2)])
    
    for(j in cal_files_number) {
      file.copy(cal_files[j], paste0(txt_scen_path,'/calibration.cal'), overwrite = T)
      print(paste0('Calibration file ', j,' copied to scenario txt folders'))
      
      cl <- makeCluster(length(measure.list)) 
      registerDoParallel(cl)
      
      print(paste0('Running measure scenarios for cal file ', j, ' in parallel'))
      
      foreach (txt = txt_scen, .verbose = F) %dopar% {
        # run SWAT in txt folder
        setwd(paste(base_path, txt, sep='/'))
        system(swat_exe) 
        
        #file handling
        scen <- unlist(strsplit(txt,'_'))[3]
        n_dir <- paste0(scen_output, '/', scen, '/cal', j)
        dir.create(paste(base_path, n_dir, sep='/'), recursive = TRUE)
        
        files.out.aa <- dir(getwd(), pattern = 'aa')
        files.out.mon <- dir(getwd(), pattern = 'mon')
        files.out.day <- dir(getwd(), pattern = 'day')
        files.help <- c('hru.con', 'hru_agr.txt')
        
        file.copy(c(files.out.aa,files.out.mon,files.out.day,files.help), paste(base_path, n_dir, sep='/'), overwrite = T)
      }
      stopCluster(cl)
    }
    measr$reset()
  }else{
    print('Running measure scenarios in parallel')
    
    txt_scen <- dir(pattern='txt_scen')
    cl <- makeCluster(length(measure.list)) 
    registerDoParallel(cl)
    
    foreach (txt = txt_scen, .verbose = F) %dopar% {
      # run SWAT in txt folder
      setwd(paste(base_path, txt, sep='/'))
      system(swat_exe) 
      
      #file handling
      scen <- unlist(strsplit(txt,'_'))[3]
      n_dir <- paste(scen_output, scen, sep='/')
      dir.create(paste(base_path, n_dir, sep='/'), recursive = TRUE)
      
      files.out.aa <- dir(getwd(), pattern = 'aa')
      files.out.mon <- dir(getwd(), pattern = 'mon')
      files.out.day <- dir(getwd(), pattern = 'day')
      files.help <- c('hru.con', 'hru_agr.txt')
      
      file.copy(c(files.out.aa,files.out.mon,files.out.day,files.help), paste(base_path, n_dir, sep='/'), overwrite = T)
    }
    stopCluster(cl)
  }
  
}

# generate results table
# In case cal file ensemble was used the table shows median, min, and max values
# for % changes to status quo. The status quo itself is shown in absolute values 
# in SWAT model units.
write_results_table <- function(outfile = 'ind_scenario_results.csv'){
  if(length(cal_files) > 0){
    ens_stats_median <- ens_stats_all %>% 
      filter(stats == 'median') %>% 
      select(-stats) %>% 
      mutate(., across(-('scen_name'), ~ round_signif(.x))) %>%
      mutate(., across(-('scen_name'), ~ sprintf('%s', .x)))
    
    ens_stats_min <- ens_stats_all %>% 
      filter(stats == 'min') %>% 
      select(-stats) %>% 
      mutate(., across(-('scen_name'), ~ round_signif(.x))) %>%
      mutate(., across(-('scen_name'), ~ sprintf('%s', .x)))
    
    ens_stats_min[ens_stats_min == ens_stats_median] <- ''
    
    ens_stats_max <- ens_stats_all %>% 
      filter(stats == 'max') %>% 
      select(-stats) %>% 
      mutate(., across(-('scen_name'), ~ round_signif(.x))) %>%
      mutate(., across(-('scen_name'), ~ sprintf('%s', .x)))
    
    ens_stats_max[ens_stats_max == ens_stats_median] <- ''
    
    df_char <- data.frame(Map(paste, setNames(ens_stats_median, names(ens_stats_median)), ens_stats_min, 
                              MoreArgs = list(sep = " (")))
    df_char <- data.frame(Map(paste, setNames(df_char, names(ens_stats_median)), ens_stats_max, 
                              MoreArgs = list(sep = ", ")))
    df_char <- data.frame(Map(paste, setNames(df_char, names(ens_stats_median)), ')', sep=''))
  }else{
    ens_stats_all <- calc_ens_stats()
    
    df_char <- ens_stats_all %>% 
      mutate(., across(-('scen_name'), ~ round_signif(.x))) %>%
      mutate(., across(-('scen_name'), ~ sprintf('%s', .x)))
  }
  df_tbl <- transpose(df_char, keep.names="scen_name", make.names="scen_name")[-1,]
  names(df_tbl) <- c('Indicator', measr.list)
  
  write.csv2(df_tbl, paste(wd,scen_out,outfile, sep='/'), row.names=F, quote=F)
  print(paste('results table written to', outfile, 'in folder', scen_out))
}

nth_element <- function(vector, starting_position, n) { 
  vector[seq(starting_position, length(vector), n)] 
}

get_ens_daily <- function(df_daily, 
                          variable_name='surq_gen',
                          convert='none',
                          type='orig',
                          start_date='2010-06-01',
                          end_date='2010-06-30'){
  
  con_obj[is.na(con_obj)] <- 0
  
  if(convert=='none'){
    df <- df_daily %>% 
      mutate(date = as.Date(paste(day, mon, yr, sep='-'), "%d-%m-%Y"),
             obj = ifelse(unit == con_obj$hru, 'hru',
                          ifelse(unit == con_obj$hru_from, 'hru_from',
                                 ifelse(unit == con_obj$hru_to, 'hru_to', 'cha_to'))),
             var_x = df_daily[[variable_name]]) %>%
      select(., c(date, scenario, obj, cal, var_x)) %>% 
      filter(., date >= start_date, date <= end_date)
  }
  if(convert=='ls'){
    df <- df_daily %>% 
      mutate(date = as.Date(paste(day, mon, yr, sep='-'), "%d-%m-%Y"),
             obj = ifelse(unit == con_obj$hru, 'hru',
                          ifelse(unit == con_obj$hru_from, 'hru_from',
                                 ifelse(unit == con_obj$hru_to, 'hru_to', 'cha_to'))),
             var_x = df_daily[[variable_name]] * area / 8.64) %>% # convert mm/day to l/s
      select(., c(date, scenario, obj, cal, var_x)) %>% 
      filter(., date >= start_date, date <= end_date)
  }
  
  if(convert=='kgday'){
    df <- df_daily %>% 
      mutate(date = as.Date(paste(day, mon, yr, sep='-'), "%d-%m-%Y"),
             obj = ifelse(unit == con_obj$hru, 'hru',
                          ifelse(unit == con_obj$hru_from, 'hru_from',
                                 ifelse(unit == con_obj$hru_to, 'hru_to', 'cha_to'))),
             var_x = df_daily[[variable_name]] * area * 1000) %>% # convert ton/ha,day to ton/day
      select(., c(date, scenario, obj, cal, var_x)) %>% 
      filter(., date >= start_date, date <= end_date)
  }
  
  if(convert=='tday'){
    df <- df_daily %>% 
      mutate(date = as.Date(paste(day, mon, yr, sep='-'), "%d-%m-%Y"),
             obj = ifelse(unit == con_obj$hru, 'hru',
                          ifelse(unit == con_obj$hru_from, 'hru_from',
                                 ifelse(unit == con_obj$hru_to, 'hru_to', 'cha_to'))),
             var_x = df_daily[[variable_name]] * area) %>% # convert ton/ha,day to ton/day
      select(., c(date, scenario, obj, cal, var_x)) %>% 
      filter(., date >= start_date, date <= end_date)
  }
  
  if(convert=='ls2'){
    df <- df_daily %>% 
      mutate(date = as.Date(paste(day, mon, yr, sep='-'), "%d-%m-%Y"),
             obj = ifelse(unit == con_obj$hru, 'hru',
                          ifelse(unit == con_obj$hru_from, 'hru_from',
                                 ifelse(unit == con_obj$hru_to, 'hru_to', 'cha_to'))),
             var_x = df_daily[[variable_name]] * 1000) %>% # convert cm³/s to l/s
      select(., c(date, scenario, obj, cal, var_x)) %>% 
      filter(., date >= start_date, date <= end_date)
  }
  
  df_sq <- df %>% 
    filter(scenario == 'statusquo')
  
  df_sq_ens <- df_sq %>% 
    group_by(date, obj) %>% 
    summarise(
      mean = mean(var_x),
      min = min(var_x),
      max = max(var_x)
    ) %>% 
    mutate(scenario = 'statusquo',
           variable = variable_name)
  
  df_measr <- df %>% 
    filter(scenario == measure_type)
  
  df_measr_ens <- df_measr %>% 
    group_by(date, obj) %>% 
    summarise(
      mean = mean(var_x),
      min = min(var_x),
      max = max(var_x)
    ) %>% 
    mutate(scenario = measure_type,
           variable = variable_name)
  
  df_diff <- df_measr %>% 
    mutate(var_x_diff = var_x - df_sq$var_x)
  
  df_diff_ens <- df_diff %>% 
    group_by(date, obj) %>% 
    summarise(
      mean = mean(var_x_diff),
      min = min(var_x_diff),
      max = max(var_x_diff)
    ) %>% 
    mutate(scenario = measure_type,
           variable = variable_name)
  
  if(type == 'orig') df_ens <- rbind(df_sq_ens, df_measr_ens)
  if(type == 'diff') df_ens <- rbind(df_sq_ens, df_diff_ens)
  
  df_ens <- df_ens %>% 
    mutate(scenario = factor(scenario, c('statusquo', measure_type)),
           obj = factor(obj, c('hru_from', 'hru', 'hru_to', 'cha_to')))
  
  return(df_ens)
}

get_ens_daily2 <- function(df_daily, 
                          variable_name='surq_gen',
                          convert='none',
                          type='orig',
                          start_date='2010-06-01',
                          end_date='2010-06-30'){
  
  con_obj[is.na(con_obj)] <- 0
  
  if(convert=='none'){
    df <- df_daily %>% 
      mutate(obj = ifelse(unit == con_obj$hru, 'hru',
                          ifelse(unit == con_obj$hru_from, 'hru_from',
                                 ifelse(unit == con_obj$hru_to, 'hru_to', 'cha_to'))),
             var_x = df_daily[[variable_name]]) %>%
      select(., c(date, scenario, obj, cal, var_x)) %>% 
      filter(., date >= start_date, date <= end_date)
  }
  if(convert=='ls'){
    df <- df_daily %>% 
      mutate(obj = ifelse(unit == con_obj$hru, 'hru',
                          ifelse(unit == con_obj$hru_from, 'hru_from',
                                 ifelse(unit == con_obj$hru_to, 'hru_to', 'cha_to'))),
             var_x = df_daily[[variable_name]] * area / 8.64) %>% # convert mm/day to l/s
      select(., c(date, scenario, obj, cal, var_x)) %>% 
      filter(., date >= start_date, date <= end_date)
  }
  
  if(convert=='kgday'){
    df <- df_daily %>% 
      mutate(obj = ifelse(unit == con_obj$hru, 'hru',
                          ifelse(unit == con_obj$hru_from, 'hru_from',
                                 ifelse(unit == con_obj$hru_to, 'hru_to', 'cha_to'))),
             var_x = df_daily[[variable_name]] * area * 1000) %>% # convert ton/ha,day to ton/day
      select(., c(date, scenario, obj, cal, var_x)) %>% 
      filter(., date >= start_date, date <= end_date)
  }
  
  if(convert=='tday'){
    df <- df_daily %>% 
      mutate(obj = ifelse(unit == con_obj$hru, 'hru',
                          ifelse(unit == con_obj$hru_from, 'hru_from',
                                 ifelse(unit == con_obj$hru_to, 'hru_to', 'cha_to'))),
             var_x = df_daily[[variable_name]] * area) %>% # convert ton/ha,day to ton/day
      select(., c(date, scenario, obj, cal, var_x)) %>% 
      filter(., date >= start_date, date <= end_date)
  }
  
  if(convert=='ls2'){
    df <- df_daily %>% 
      mutate(obj = ifelse(unit == con_obj$hru, 'hru',
                          ifelse(unit == con_obj$hru_from, 'hru_from',
                                 ifelse(unit == con_obj$hru_to, 'hru_to', 'cha_to'))),
             var_x = df_daily[[variable_name]] * 1000) %>% # convert cm³/s to l/s
      select(., c(date, scenario, obj, cal, var_x)) %>% 
      filter(., date >= start_date, date <= end_date)
  }
  
  df_sq <- df %>% 
    filter(scenario == 'statusquo')
  
  df_sq_ens <- df_sq %>% 
    group_by(date, obj) %>% 
    summarise(
      mean = mean(var_x),
      min = min(var_x),
      max = max(var_x)
    ) %>% 
    mutate(scenario = 'statusquo',
           variable = variable_name)
  
  df_measr <- df %>% 
    filter(scenario == measure_type)
  
  df_measr_ens <- df_measr %>% 
    group_by(date, obj) %>% 
    summarise(
      mean = mean(var_x),
      min = min(var_x),
      max = max(var_x)
    ) %>% 
    mutate(scenario = measure_type,
           variable = variable_name)
  
  df_diff <- df_measr %>% 
    mutate(var_x_diff = var_x - df_sq$var_x)
  
  df_diff_ens <- df_diff %>% 
    group_by(date, obj) %>% 
    summarise(
      mean = mean(var_x_diff),
      min = min(var_x_diff),
      max = max(var_x_diff)
    ) %>% 
    mutate(scenario = measure_type,
           variable = variable_name)
  
  if(type == 'orig') df_ens <- rbind(df_sq_ens, df_measr_ens)
  if(type == 'diff') df_ens <- rbind(df_sq_ens, df_diff_ens)
  
  df_ens <- df_ens %>% 
    mutate(scenario = factor(scenario, c('statusquo', measure_type)),
           obj = factor(obj, c('hru_from', 'hru', 'hru_to', 'cha_to')))
  
  return(df_ens)
}


# Revision 62 implementation; keeps the legacy functions above for comparison.
run_scenarios_legacy <- run_scenarios
run_scenarios2_legacy <- run_scenarios2
run_scenarios <- function(swat_exe = swat62_executable(), base_path = wd,
                          scen_output = scen_out, measure.list = measr.list,
                          outflow_reach = cha_id) {
  swat62_run_scenarios(swat_exe, base_path, scen_output, measure.list,
                       outflow_reach, project_path, measr_name, cal_files)
}
run_scenarios2 <- run_scenarios
