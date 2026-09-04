### 1 - Load libraries and functions -------------------------------------------

source('../../swat62.R')
swat62_require()
source('./calc_Indis.R')
# foo1(c('dplyr' , 'readr' , 'tidyverse', 'data.table', 'remotes', 'devtools', 
#        'xts', 'dygraphs', 'R.utils', 'foreach', 'doParallel', 'data.table', 
#        'ggplot2', 'fmsb', 'patchwork'))
# foo2('SWATmeasR')
# ################## 
# # In case you have troubles installing 'maptools' and 'hydroTSM':
# # --> both packages can be installed from the CRAN archive
# # maptools_url <- "https://cran.r-project.org/src/contrib/Archive/maptools/maptools_1.1-8.tar.gz"
# # hydroTSM_url <- "https://cran.r-project.org/src/contrib/Archive/hydroTSM/hydroTSM_0.6-0.tar.gz"
# # install.packages(maptools_url, repos=NULL, type="source")
# # install.packages(hydroTSM_url, repos=NULL, type="source", dependencies = TRUE)
# ##################
# foo3('hydroGOF')     

packages <- c(
  "dplyr", "readr", "data.table",
  "xts", "dygraphs", "R.utils", "foreach", "doParallel",
  "ggplot2", "fmsb", "patchwork", "SWATmeasR", "hydroGOF"
)

invisible(lapply(packages, library, character.only = TRUE))

library(doSNOW)

### 2 - Define paths and load cal files and existing measR project -------------
measr_name <- 'demo_nbs' #define name of your SWATmeasR project!
scen_out <- 'scenario_outputs' #define name of outputs folder
cha_id <- 5 # outlet channel in the supplied model (matches 1_Setup/settings.R)

wd <- getwd()
project_path <- paste0(wd,'/txt') #adjust if necessary
cal_files <- dir(paste0(wd,'/cal_files'), full.names = T)
load_measr(paste0(project_path, '/', measr_name,'.measr'))
assign('measr', get(gsub('.measr', '', measr_name)))
#rm(list=gsub('.measr', '', measr_name))

loca <- measr$.data$nswrm_definition$nswrm_locations 
measr.list <- c('statusquo',unique(loca$nswrm),'all') # list of scenarios
measr.list

################################################################################
#### initialise your reservoirs
# => only necessary, if you did not initialise reservoirs before
#    building your measr project
# => this has to be done only once, and after that:
#    you need to rerun the scenario workflow and also 
#    check the model performance (see code at the end)
################################################################################

# ## define initres2 as a pointer for initialisation
# # please note that you also need to adapt two files in your project path:
# # in file 'initial.res', initres2 must be defined, pointing to 'res_default'
# # in file 'om_water.ini', 'res_default' must be defined with the values used for initialisation
# measr$.data$model_setup$original_inputs$reservoir.res$init <- 'initres2'
# measr$.data$model_setup$modified_inputs$reservoir.res$init <- 'initres2'
# 
# measr$save() # just to go sure

################################################################################
#!!!!!!!! continue with step 4 if you already ran your scenarios (step 3) 
#!!!!!!!! and you do not want to simulate again 
################################################################################

### 3 - Implement measures and run SWAT ----------------------------------------

## get cropland hru ids (required for indicators referring to cropland only)
hru_dat <- read_tbl('hru-data.hru',project_path, n_skip = 2)
unique(substring(hru_dat$lu_mgt,1,5)) # detect all lu class prefixes referring to cropland
hru_agr <- hru_dat %>%
  filter(substring(lu_mgt,1,2) %in% c('ag', 'fe', 'fd')) %>% # adjust prefix specification
  select(hru_id = id)
# and store them in a file called hru_agr.txt for later indicator calculation
write.table(hru_agr, paste0(project_path,'/hru_agr.txt'), quote=F, row.names = F)

run_scenarios()

### 4 - Plot results -----------------------------------------------------------

##### ----------------
# collect data
##### ----------------

path <- paste(wd, scen_out, measr.list[c(1:length(measr.list))], sep='/')
channel <- 'cha6' #adjust channel

### In the following functions to calculate indicators are applied
### Please adjust function parameters (e.g. channel name, see also header information of calc_Indis.R)
### In case an ensemble of calibration files is provided (in folder cal_files), set ensemble=T
### The resulting dataframe will provide you the ensemble mean as well as the ensemble minimum (lower) 
### and maximum (upper) of the respective indicator
### If no cal file ensemble can be provided, set ensemble=F 
### (but then make sure you have a calibration.cal with fitted parameters in the txt folder)

### collect average annual output of water quantity and quality at outlet channel (aggregated comparison)
cha_aa_all <- ind_cha_aa(path, channel=channel, ensemble=T) #set ensemble=F if you did not use an ensemble of cal files

###  collect indicators related to the daily dynamics Water, N, P, Sed
# The following function includes indicators based on thresholds for streamflow and 
# and water quality. Please adjust the following thresholds to your case study needs.

# threshold for low flow and high flow
# the number of days below these thresholds will later be calculated
# default values are the 5th and 95th percentiles of your status quo simulation, respectively
# feel free to use other threshold values!!

# thresholds for nitrogen concentration (mg N/l) and phosphorus concentration (mg P/l)
# the number of days beyond these thresholds will later be calculated
# default value are the respective median values of reported threshold values 
# for very small siliceous rivers in lowland across Europe 
# (https://www.sciencedirect.com/science/article/pii/S0048969719338380)
# please check if this is appropriate for your case study (e.g. type of river)
# feel free to use other threshold values!!

# threshold for sediment concentration (mg N/l) 
# the number of days beyond this threshold will later be calculated
# default value is 50 mg/l (missing reference), 
# if you know a reference please let me know (michael.strauch@ufz.de)
# feel free to use another threshold value!!

# for defining Q thresholds, get daily discharge metrics for status quo 
if(length(cal_files)>0) Q_metrics_sq <- get_ens_Q_metrics() else{
  Q_metrics_sq <- ind_cha_dayII(path, channel=channel, ind='all', ensemble=F)[1,c(2:12)]
}

Q_p05_sq <- Q_metrics_sq$Q_p05
Q_p95_sq <- Q_metrics_sq$Q_p95

cha_day_all <- ind_cha_dayII(path, channel=channel, 'all', 
                             ensemble=T,                #set ensemble=F if you did not use an ensemble of cal files
                             threshold_lowQ = Q_p05_sq, #adjust if appropriate
                             threshold_highQ = Q_p95_sq,#adjust if appropriate
                             threshold_N = 2,         #adjust if appropriate
                             threshold_P = 0.17,       #adjust if appropriate
                             threshold_Sed=20)          #adjust if appropriate

###  collect HRU-based indicators related to water quality (average annual losses)
hru_aa_nb_all <- ind_hru_aa_nb(path, a='agr', ensemble=T) #set ensemble=F if you did not use an ensemble of cal files

###  collect HRU-based indicators related to  water quantity (average annual values)
hru_aa_wb_all <- ind_hru_aa_wb(path, a='agr', ensemble=T) #set ensemble=F if you did not use an ensemble of cal files

###  collect HRU-based indicators related to  water quantity (average annual for specified months)
## please specify start and end months of interest for the soil water analysis
sw_periods <- list(c(5:9), 5, 6, 7, 8, 9) #this is an example for printing sw for the period May to September and also for each single month in that period
hru_mon_all <- ind_hru_mon_wb(path, period = sw_periods, a='agr', ensemble=T) #set ensemble=F if you did not use an ensemble of cal files

### collect cropping information for all scenarios - grain units and cultivated hectare average annual
# define 1) path, 2) crop selection, 3) type of output: a) yield, b) ha, 4) specify grain units equivalent for 
#  all of the selected crops (if you just keep the parameter 'grain_units', there is already a parameterisation for 
#   'wwht', 'akgs', 'wbar', 'wira', 'csil', 'wiry', 'sgbt','barl'
# the measure list (measr.list) can be adapted to the measures you want to compare

crop_sel <- c("pota", "barl", "csil", "fesc", "wwht", "oats", "canp", "lupn") #adjust

# If you want to use grain units to normalize the basin wide sum of crop yields by crop-specific
# nutritional values, please specify grain units for relevant crops
# The grain units must be applicable to dry mass!!!
grain_units <- data.frame('bar' = 1.163, 
                          'csil' = 1.071, 
                          'wwht' = 1.209, 
                          'fesc' = 0.718,
                          'pota' = 1,
                          'oats' = 1, 
                          'canp' = 1.3, 
                          'lupn' = 1)

### collect basin-wide area of cropland
crop_aa_ha <- ind_bsn_aa_crp(path, crop_sel, out_type = "ha", grain_units, ensemble=T) #set ensemble=F if you did not use an ensemble of cal files

### collect sum of grain units for whole basin
#run next line only if you want to calculate yield based on grain units
crop_aa_gu <- ind_bsn_aa_crp(path, crop_sel, out_type = "yield", grain_units, ensemble=T) #set ensemble=F if you did not use an ensemble of cal files


### collect cropping information for all scenarios - Crop specific average annual yield and ha
crop_aa_all <- ind_bsn_aa_crp_ha_Y(path, crop_sel, ensemble=T) #set ensemble=F if you did not use an ensemble of cal files

##### ----------------
# plotting & results table
##### ----------------

# get all results in one object
ens_results <- get_all_ens_results()

# calculate percentage changes to status quo and derive statistics 
# (mean, median, min, max) in case a cal file ensemble has been used
ens_stats_all <- calc_ens_stats()

# plot the scenario results as stacked bars
# default here is to plot the median values (perhaps more robust than mean)
if(length(cal_files)>0){
  df <- ens_stats_all %>% 
    filter(stats == 'median', scen_name != 'statusquo') %>% 
    select(-stats)
}else{
  df <- ens_stats_all[-1,]
}

df_plot_long <- melt(setDT(df), id.vars = c("scen_name"), variable.name = "indi")

plot_indicators(df_plot_long, separate=F)

plot_indicators(df_plot_long, separate=T)

# save as pdf
pdf('plot_indicators_all_median.pdf', width=7.5, height = 10)
plot_indicators(df_plot_long, separate=F)
dev.off()

# generate results table
# In case cal file ensemble was used the table shows median, min, and max values
# for % changes to status quo. The status quo itself is shown in absolute values 
# in SWAT model units.

write_results_table()
