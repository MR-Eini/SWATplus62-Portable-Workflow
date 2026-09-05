args_full <- commandArgs(trailingOnly = FALSE)
script_arg <- grep("^--file=", args_full, value = TRUE)
script_dir <- dirname(normalizePath(sub("^--file=", "", script_arg[[1L]])))
workflow_root <- normalizePath(file.path(script_dir, ".."))
source(file.path(workflow_root, "_Workflow", "1_Setup", "functions.R"))

Sys.unsetenv(c("SWAT_ATMO_DEP_MODE", "SWAT_ATMO_DEP_FILE", "SWAT_ATMO_DEP_NETCDF"))
settings <- new.env(parent = baseenv())
sys.source(file.path(workflow_root, "_Workflow", "1_Setup", "settings.R"),
           envir = settings)
stopifnot(identical(settings$atmo_dep_mode, "emep"),
          identical(settings$atmo_dep_file, ""),
          identical(settings$atmo_dep_netcdf_source, ""))

fail_if_called <- function(...) stop("This function must not be called.")
result <- configure_atmo_dep(
  mode = "none", project_path = "unused", basin_path = "unused",
  start_year = 2000, end_year = 2001,
  read_csv_fn = fail_if_called,
  get_atmo_dep_fn = fail_if_called,
  add_atmo_dep_fn = fail_if_called
)
stopifnot(is.null(result))

fixture <- tempfile(fileext = ".csv")
writeLines("DATE,wet_nh4\n2000-01-01,1.2", fixture)
calls <- new.env(parent = emptyenv())
mock_read <- function(file, show_col_types = FALSE) {
  calls$read_file <- file
  data.frame(DATE = as.Date("2000-01-01"), wet_nh4 = 1.2)
}
mock_add <- function(data, project_path, t_ext) {
  calls$added <- data
  calls$project_path <- project_path
  calls$model_timestep <- t_ext
}
file_result <- configure_atmo_dep(
  mode = "file", project_path = "project", basin_path = "unused",
  start_year = 2000, end_year = 2001, atmo_file = fixture,
  read_csv_fn = mock_read,
  get_atmo_dep_fn = fail_if_called,
  add_atmo_dep_fn = mock_add
)
stopifnot(identical(calls$read_file, fixture),
          identical(calls$project_path, "project"),
          identical(calls$model_timestep, "annual"),
          identical(file_result, calls$added))

mock_get <- function(basin_path, t_ext, start_year, end_year, netcdf_source) {
  calls$basin_path <- basin_path
  calls$download_timestep <- t_ext
  calls$years <- c(start_year, end_year)
  calls$netcdf_source <- netcdf_source
  data.frame(DATE = as.Date("2000-01-01"), wet_nh4 = 2.4)
}
emep_result <- configure_atmo_dep(
  mode = "emep", project_path = "project", basin_path = "basin.shp",
  start_year = 2000, end_year = 2001,
  netcdf_source = "https://example.test/emep_{year}.nc",
  read_csv_fn = fail_if_called,
  get_atmo_dep_fn = mock_get,
  add_atmo_dep_fn = mock_add
)
stopifnot(identical(calls$basin_path, "basin.shp"),
          identical(calls$download_timestep, "year"),
          identical(calls$years, c(2000, 2001)),
          identical(calls$netcdf_source, "https://example.test/emep_{year}.nc"),
          identical(emep_result, calls$added))

expect_error <- function(expr, pattern) {
  message <- tryCatch({ force(expr); NA_character_ }, error = conditionMessage)
  stopifnot(!is.na(message), grepl(pattern, message, fixed = TRUE))
}
expect_error(
  configure_atmo_dep("file", "project", "basin", 2000, 2001,
                     atmo_file = "", read_csv_fn = fail_if_called,
                     get_atmo_dep_fn = fail_if_called,
                     add_atmo_dep_fn = fail_if_called),
  "catchment-specific CSV"
)
default_source <- function(year, timestep) paste(timestep, year, sep = "-")
configure_atmo_dep(
  "emep", "project", "basin", 2000, 2001,
  netcdf_source = "", read_csv_fn = fail_if_called,
  get_atmo_dep_fn = mock_get, add_atmo_dep_fn = mock_add,
  default_emep_source_fn = default_source
)
stopifnot(identical(calls$netcdf_source(2004, "year"), "year-2004"))

stopifnot(
  identical(
    SWATprepR::emep_2025_netcdf_source(2004, "year"),
    paste0("https://thredds.met.no/thredds/dodsC/data/EMEP/2025_Reporting/",
           "EMEP01_rv5.6_year.2004met_2004emis_rep2025.nc")
  ),
  identical(
    SWATprepR::emep_2025_netcdf_source(2023, "year"),
    paste0("https://thredds.met.no/thredds/dodsC/data/EMEP/2025_Reporting/",
           "EMEP01_rv5.6_year.2023met_2023emis.nc")
  )
)
expect_error(
  configure_atmo_dep("invalid", "project", "basin", 2000, 2001,
                     read_csv_fn = fail_if_called,
                     get_atmo_dep_fn = fail_if_called,
                     add_atmo_dep_fn = fail_if_called),
  "must be one of"
)

cat("OK: atmospheric deposition none, file, and emep modes are routed correctly.\n")
