# Write to database functions --------------------------------------
## Write the SWAT+Editor project database. The database will be located in
## the 'project_path' with the name '<project_name>.sqlite. 
## After writing the database it can be opened and edited with the SWAT+Editor.
##  
#' @param project_path Path of the project folder
#' @param project_name User defined name of the project
#' 
create_swatplus_database <- function(project_path, project_name){
  tbls_path <- paste0(project_path, '/', project_name, '/data/tables.sqlite')
  proj_path <- paste0(project_path, '/', project_name, '/', project_name, '.sqlite')
  
  # Check if project data base already exists
  if (file.exists(proj_path)) {
    stop("\n  A SWAT+ project data base with the name '", paste0(project_name, ".sqlite'\n"),
         "  already exists in '",  paste0(project_path, '/', project_name), "'.\n\n",
         "  Please rename or delete the existing file '", paste0(project_name, ".sqlite'\n"), 
         "  before you continue with writing the SWAT+ data base.")
  }
  
  
  # Read generated tables from tables.sqlite
  db <- dbConnect(SQLite(), tbls_path)
  
  cha <- read_db_tbls(db, 'cha.cha|cha.hyd', 'cha.')
  res <- read_db_tbls(db, 'res.res|res.hyd', 'res.')
  hru <- read_db_tbls(db, 'hru.hru|_hyd$', 'hru.')
  sol <- read_db_tbls(db, 'soil.soils', 'soil.')
  lum <- read_db_tbls(db, 'landuse.land', 'landuse.')
  rtu <- read_db_tbls(db, 'rtu.rout|rtu.field', 'rtu.')
  lsu <- read_db_tbls(db, 'lsu.', 'lsu.')
  aqu <- read_db_tbls(db, 'aqu.', 'aqu.')
  wet <- read_db_tbls(db, 'wet.', 'wet.')
  rcl <- read_db_tbls(db, 'recall.', 'recall.')
  
  dbDisconnect(db)
  
  # write template SWAT+Editor data base to project path
  file.copy("swatplus_init.sqlite",proj_path)
  # file.copy(system.file("extdata/swatplus_init.sqlite", package = "SWATbuildR"),
  #           db_path)
  db <- dbConnect(SQLite(), proj_path)
  
  # Write channels
  if(length(cha) == 4) {
    walk2(cha, names(cha), ~ dbWriteTable(db, .y, .x, append = TRUE))
  }
  
  # Write reservoirs
  if(length(res) == 4) {
    walk2(res, names(res), ~ dbWriteTable(db, .y, .x, append = TRUE))
  }
  
  # Write HRUs
  walk2(hru, names(hru), ~ dbWriteTable(db, .y, .x, append = TRUE))
  
  # Write HRU properties
  walk2(lum, names(lum), ~ dbWriteTable(db, .y, .x, append = TRUE))
  walk2(sol, names(sol), ~ dbWriteTable(db, .y, .x, append = TRUE))
  
  # Write RTUs
  walk2(rtu, names(rtu), ~ dbWriteTable(db, .y, .x, append = TRUE))
  walk2(lsu, names(lsu), ~ dbWriteTable(db, .y, .x, append = TRUE))
  
  # Write RTUs
  walk2(aqu, names(aqu), ~ dbWriteTable(db, .y, .x, append = TRUE))
  
  # Write recall
  if(length(wet) == 2) {
    walk2(wet, names(wet), ~ dbWriteTable(db, .y, .x, append = TRUE))
  }
  
  # Write recall
  if(length(rcl) == 4) {
    walk2(rcl, names(rcl), ~ dbWriteTable(db, .y, .x, append = TRUE))
  }
  
  rs <- dbSendQuery(db, paste0("UPDATE object_cnt SET name = REPLACE(name, 'swatplus_init', '",
                               project_name, "');"))
  dbClearResult(rs)
  rs <- dbSendQuery(db, paste0("UPDATE project_config SET project_name = REPLACE(project_name, 'swatplus_init', '",
                               project_name, "');"))
  dbClearResult(rs)
  
  dbDisconnect(db)
}

## Read tables from projects tables.sqlite data base for certain file groups
## and save them into a named list
##  
#' @param db Data base object
#' @param name_str Text strings which have to part of the table names to 
#'   include a table in reading
#' @param name_rmv String which should be removed from list element names
#' 
read_db_tbls <- function(db, name_str, name_rmv) {
  tbls <- dbListTables(db)
  file_tbls <- tbls[str_detect(tbls, name_str)]
  file_names <- str_remove(file_tbls, name_rmv)
  map(file_tbls, ~ dbReadTable(db,.x)) %>% 
    set_names(., file_names)
}