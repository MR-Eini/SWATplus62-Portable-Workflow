# Script initialization --------------------------------------------
# PLEASE DO NOT CHANGE THESE SETTINGS
# ------------------------------------------------------------------

# Load R functions -------------------------------------------------
fns <- sapply(list.files('./functions', full.names = T), source)
rm(fns) 

# Initialize paths -------------------------------------------------
## The model setup process generates raster and vector data. The paths
## are automatically generated based on the project path and the project
## name. Changing the paths below is not necessary. Keep them as they are.
## 
## 
## Path to data
data_path  <- paste(project_path, project_name, 'data', sep = '/')

## Create data folders
dir.create(paste0(data_path, '/vector'), recursive = T, showWarnings = FALSE)
dir.create(paste0(data_path, '/raster'), recursive = T, showWarnings = FALSE)

# Install and load required R packages -----------------------------
## Check if the installed R version is greater than the required one
check_r_version('4.2.1')

## Install and load R packages
install_load(crayon_1.5.1, dplyr_1.0.10, forcats_0.5.1, ggplot2_3.3.6,
             lubridate_1.8.0, purrr_1.0.0, readr_2.1.2, readxl_1.4.0,
             stringr_1.4.0, tibble_3.1.8, tidyr_1.2.0, vroom_1.5.7)
install_load(sf_1.0-8, sfheaders_0.4.0, lwgeom_0.2-8, terra_1.7-3, 
             whitebox_2.1.5, units_0.8-0)
install_load(DBI_1.1.3, RSQLite_2.2.15)

## Initialize whitebox tools which are used for several 
## raster data analyses
## Initialize whitebox tools which are used for several raster analyses
wbt_exe <- if (exists('wbt_path', inherits = TRUE) && file.exists(wbt_path) &&
               file.info(wbt_path)$size >= 1024) {
  wbt_path
} else {
  list.files(path = find.package("whitebox"), pattern = "whitebox_tools\\.exe$",
             recursive = TRUE, full.names = TRUE)
}

if (length(wbt_exe) == 0) {
  wbt_exe <- list.files(
    path = "C:/Users/",
    pattern = "whitebox_tools\\.exe$",
    recursive = TRUE, full.names = TRUE
  )
}

if (length(wbt_exe) == 0) {
  cat(paste0(
    "The required 'whitebox_tools.exe' file could not be located in\n",
    toString(.libPaths()), " or C:/Users/ directories.\n",
    "If you have not installed the 'whitebox' package, please stop the script,\n",
    "install it, and only then restart the running workflow.\n",
    "Otherwise, a full computer search will be performed.\n"
  ))
  sysdrivereport <- system("wmic logicaldisk get caption", intern = TRUE)
  drives <- paste0(substr(sysdrivereport[-c(1, length(sysdrivereport))], 1, 1), ":/")
  wbt_exe <- list.files(
    path = drives,
    pattern = "whitebox_tools\\.exe$",
    recursive = TRUE, full.names = TRUE
  )
}

if (length(wbt_exe) == 0) {
  stop("'whitebox_tools.exe' file could not be located. Please install WhiteboxTools / whitebox.")
}

# --- ensure EXACTLY ONE exe path ---
wbt_exe <- unique(normalizePath(wbt_exe, winslash = "/", mustWork = FALSE))
wbt_exe <- wbt_exe[file.exists(wbt_exe)]

if (length(wbt_exe) > 1) {
  pkg_root <- normalizePath(find.package("whitebox"), winslash = "/")
  in_pkg <- startsWith(wbt_exe, pkg_root)
  if (any(in_pkg)) wbt_exe <- wbt_exe[in_pkg]

  # pick newest if still multiple
  wbt_exe <- wbt_exe[order(file.info(wbt_exe)$mtime, decreasing = TRUE)][1]
  message("Multiple whitebox_tools.exe found; using: ", wbt_exe)
}

stopifnot(is.character(wbt_exe), length(wbt_exe) == 1, file.exists(wbt_exe))

whitebox::wbt_init(exe_path = wbt_exe)
