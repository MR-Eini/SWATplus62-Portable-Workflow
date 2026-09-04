#' Function to update single data line files
#'
#' @param txt_file data.frame of lines 
#' @param f_path character full path of files to be overwritten
#' 
update_file <- function(txt_file, f_path){
  write.table(paste0(basename(f_write), ": written on ", Sys.time()), f_path, append = FALSE,
              sep = "\t", dec = ".", row.names = FALSE, col.names = FALSE, quote = FALSE)
  write.table(txt_file[1,1], f_path, append = TRUE, sep = "\t", dec = ".", 
              row.names = FALSE, col.names = FALSE, quote = FALSE)
  write.table(txt_file[2,1], f_path, append = TRUE, sep = "\t", dec = ".", 
              row.names = FALSE, col.names = FALSE, quote = FALSE)
  print(paste0(basename(f_write), " file updated in ", dirname(f_write), " directory."))
}

#' Function to copy exe between destinations and run it
#'
#' @param path_from character path of directory from which file should be taken
#' @param path_to character path to which file should be put
#' @param file_name character names of file to copy and run

exe_copy_run <- function(path_from, path_to, file_name) {
  source <- normalizePath(file.path(path_from, file_name), mustWork = TRUE)
  swat_check_binary(source)
  destination <- normalizePath(path_to, mustWork = TRUE)
  stopifnot(file.copy(source, destination, overwrite = TRUE))
  old <- setwd(destination)
  on.exit(setwd(old))
  status <- system2(file.path(destination, file_name))
  if (status != 0L) stop(file_name, ' failed with exit status ', status)
  invisible(status)
}

# Helper: load from the pinned bundle library
install_and_load_cran <- function(pkg) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    stop('Missing pinned package ', pkg, '. Run install_or_repair_packages.bat from the bundle root.')
  }
  library(pkg, character.only = TRUE)
}

# Kept for compatibility with older scripts; packages are never installed at run time.
install_and_load_github <- function(pkg, repo) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    stop('Missing pinned package ', pkg, ' (', repo, '). Run install_or_repair_packages.bat from the bundle root.')
  }
  library(pkg, character.only = TRUE)
}

#' Configure catchment-specific atmospheric deposition
#'
#' Reads a prepared CSV or extracts EMEP NetCDF data, then writes the selected
#' deposition series to the SWAT+ project. The disabled mode returns before any
#' data are read or written.
configure_atmo_dep <- function(mode, project_path, basin_path,
                               start_year, end_year,
                               atmo_file = "", netcdf_source = NULL,
                               download_timestep = "year",
                               model_timestep = "annual",
                               read_csv_fn = readr::read_csv,
                               get_atmo_dep_fn = SWATprepR::get_atmo_dep,
                               add_atmo_dep_fn = SWATprepR::add_atmo_dep) {
  if (!is.character(mode) || length(mode) != 1L || is.na(mode)) {
    stop("atmo_dep_mode must be one of 'none', 'file', or 'emep'.")
  }
  mode <- tolower(trimws(mode))

  if (identical(mode, "none")) {
    message("Atmospheric deposition is not configured; leaving it disabled.")
    return(invisible(NULL))
  }

  if (identical(mode, "file")) {
    if (!is.character(atmo_file) || length(atmo_file) != 1L ||
        is.na(atmo_file) || !nzchar(atmo_file) || !file.exists(atmo_file)) {
      stop("Set atmo_dep_file or SWAT_ATMO_DEP_FILE to a catchment-specific CSV.")
    }
    atmo_data <- read_csv_fn(atmo_file, show_col_types = FALSE)
  } else if (identical(mode, "emep")) {
    source_missing <- is.null(netcdf_source) ||
      (is.character(netcdf_source) &&
       (length(netcdf_source) == 0L || anyNA(netcdf_source) ||
        any(!nzchar(netcdf_source))))
    if (source_missing) {
      stop("Set atmo_dep_netcdf_source or SWAT_ATMO_DEP_NETCDF to a current ",
           "EMEP NetCDF template or source list.")
    }
    atmo_data <- get_atmo_dep_fn(
      basin_path,
      t_ext = download_timestep,
      start_year = start_year,
      end_year = end_year,
      netcdf_source = netcdf_source
    )
  } else {
    stop("atmo_dep_mode must be one of 'none', 'file', or 'emep'.")
  }

  add_atmo_dep_fn(atmo_data, project_path, t_ext = model_timestep)
  invisible(atmo_data)
}
