mgt_def_files <- list.files(nswrm_def_path, pattern = '.rds')
time_stamps <- as.numeric(gsub('_', '', substr(mgt_def_files, 1, 13)))
last_mgt <- which.max(time_stamps)
mgt_path  <- paste0(nswrm_def_path, '/', mgt_def_files[last_mgt])

# Start a new measR project -----------------------------------------------
# Define the name of the project
project_name <- 'CS4pond'

pond_path <- paste0(nswrm_def_path, '/', 'settings_pond1.csv')

CS4pond$load_nswrm_definition(pond_path, 'pond', overwrite = T)
CS4pond$load_nswrm_definition(mgt_path,  'management')
loca_path <- paste0(nswrm_def_path, '/', 'measure_location1.csv')


# Load the location definition
CS4pond$load_nswrm_location(loca_path)


source('./calc_Indis.R')
foo1(c('dplyr' , 'readr' , 'tidyverse', 'data.table', 'remotes', 'devtools', 
       'xts', 'dygraphs', 'R.utils', 'foreach', 'doParallel', 'data.table', 
       'ggplot2', 'fmsb', 'patchwork'))
foo2('SWATmeasR')
################## 
# In case you have troubles installing 'maptools' and 'hydroTSM':
# --> both packages can be installed from the CRAN archive
# maptools_url <- "https://cran.r-project.org/src/contrib/Archive/maptools/maptools_1.1-8.tar.gz"
# hydroTSM_url <- "https://cran.r-project.org/src/contrib/Archive/hydroTSM/hydroTSM_0.6-0.tar.gz"
# install.packages(maptools_url, repos=NULL, type="source")
# install.packages(hydroTSM_url, repos=NULL, type="source", dependencies = TRUE)
##################
foo3('hydroGOF')     

### 2 - Define paths and load cal files and existing measR project -------------
measr_name <- 'CS4pond' #define name of your SWATmeasR project!
scen_out <- 'scenario_outputs' #define name of outputs folder
cha_id <- 43 #define outlet channel number

wd <- getwd()
project_path <- paste0(wd,'/txt') #adjust if necessary
cal_files <- dir(paste0(wd,'/cal_files'), full.names = T)
load_measr(paste0(project_path, '/', measr_name,'.measr'))
assign('measr', get(gsub('.measr', '', measr_name)))
#rm(list=gsub('.measr', '', measr_name))

loca <- measr$.data$nswrm_definition$nswrm_locations 
measr.list <- c('status_quo',unique(loca$nswrm),'all') # list of scenarios

################################################################################
#!!!!!!!! continue with step 4 if you already ran your scenarios (step 3) 
#!!!!!!!! and you do not want to simulate again 
################################################################################

### 3 - Implement measures and run SWAT ----------------------------------------

# get cropland hru ids (required for indicators referring to cropland only)
# hru_dat <- read_tbl('hru-data.hru',project_path, n_skip = 2)
# unique(substring(hru_dat$lu_mgt,1,5)) # detect all lu class prefixes referring to cropland
# hru_agr <- hru_dat %>%
#   filter(substring(lu_mgt,1,2) %in% c('fi','fl','fd')) %>% # adjust prefix specification
#   select(hru_id = id)
# # and store them in a file called hru_agr.txt for later indicator calculation
# write.table(hru_agr, paste0(project_path,'/hru_agr.txt'), quote=F, row.names = F)

run_scenarios()


