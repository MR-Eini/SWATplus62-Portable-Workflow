# Shared runtime for the updated workflow. Source this before loading SWAT packages.
swat_workflow_root <- function(path = getwd()) {
  path <- normalizePath(path, winslash = '/', mustWork = TRUE)
  repeat {
    if (dir.exists(file.path(path, '_Workflow'))) return(path)
    parent <- dirname(path)
    if (identical(parent, path)) stop('Run inside the SWAT workflow workspace.')
    path <- parent
  }
}
swat62_library <- Sys.getenv('SWAT_PACKAGE_LIBRARY', file.path(swat_workflow_root(), 'renv/library'))
if (dir.exists(swat62_library)) .libPaths(c(normalizePath(swat62_library), .libPaths()))
swat62_versions <- c(SWATreadR = '0.1.0.9013', SWATrunR = '1.1.0.9019',
  SWATtunR = '0.3.15', SWATdoctR = '0.1.29', SWATfarmR = '4.0.5',
  SWATprepR = '1.0.16', SWATmeasR = '0.9.4')
swat62_require <- function(packages = names(swat62_versions)) {
  for (pkg in packages) {
    installed <- if (requireNamespace(pkg, quietly = TRUE)) as.character(packageVersion(pkg)) else NA_character_
    if (is.na(installed) || installed != swat62_versions[[pkg]]) {
      stop('The portable bundle requires ', pkg, ' ', swat62_versions[[pkg]], '; found ', installed, '.')
    }
  }
}
swat62_executable <- function() {
  explicit <- c(Sys.getenv('SWATPLUS_EXE'), Sys.getenv('SWAT_EXE'))
  paths <- c(explicit,
    file.path(swat_workflow_root(), 'bin/swatplus-62-ifo-win_amd64-Rel.exe'))
  paths <- paths[nzchar(paths) & file.exists(paths)]
  if (!length(paths)) stop('Set SWAT_EXE to the tested Intel revision 62 executable.')
  swat_check_binary(paths[1])
  normalizePath(paths[1], winslash = '/')
}
swat_check_binary <- function(path) {
  if (!file.exists(path)) stop('Missing executable: ', path)
  if (file.info(path)$size < 1024) stop('Executable is a placeholder or incomplete file: ', path)
  invisible(path)
}
swat_run_checked <- function(path, exe, log_name = 'swat62-run.log') {
  path <- normalizePath(path, winslash = '/')
  exe <- normalizePath(exe, winslash = '/', mustWork = TRUE)
  swat_check_binary(exe)
  old <- setwd(path)
  on.exit(setwd(old))
  status <- system2(exe, stdout = log_name, stderr = paste0(log_name, '.stderr'))
  lines <- readLines(log_name, warn = FALSE)
  if (status != 0L || !any(grepl('Execution successfully completed', lines, fixed = TRUE))) {
    stop('SWAT+ failed (exit ', status, '). See ', file.path(path, log_name))
  }
  invisible(status)
}
swat62_migrate_inputs <- function(path) {
  # Limited to the non-carbon input family used by this workflow. No defaults
  # for unconfigured new physical processes are invented here.
  swat62_require('SWATreadR')
  cio_path <- file.path(path, 'file.cio')
  cio <- readLines(cio_path)
  idx <- grep('^basin[[:space:]]', trimws(cio))
  if (length(idx) != 1L) stop('Missing or ambiguous basin section.')
  fields <- strsplit(trimws(cio[idx]), '[[:space:]]+')[[1]]
  if (length(fields) == 3L) {
    codes <- readLines(file.path(path, fields[2]))
    if (SWATreadR::swat_control_get(codes, 'carbon') != '0') stop('Carbon-enabled input migration requires a configured carbon file.')
    cio[idx] <- paste(c(fields, 'null'), collapse = ' ')
  }
  prt_path <- file.path(path, 'print.prt')
  prt <- readLines(prt_path)
  prt <- sub('\\bdbout\\b', 'use_obj_labels', prt)
  prt <- sub('\\bsoilout\\b', 'crop_yld', prt)
  prt <- prt[!grepl('^region_cha[[:space:]]', trimws(prt))]
  prt <- SWATreadR::swat_control_set(prt, c(use_obj_labels = 'y'))
  plants_path <- file.path(path, 'plants.plt')
  plants <- SWATreadR::read_swat(plants_path)
  for (field in c('days_mat', 'yrs_mat')) {
    if (!field %in% names(plants) || any(!is.finite(plants[[field]]) | plants[[field]] != trunc(plants[[field]]))) {
      stop('Non-integer or missing plant maturity field: ', field)
    }
  }
  for (file in c(cio_path, prt_path, plants_path)) {
    backup <- paste0(file, '.before-swat62')
    if (!file.exists(backup)) stopifnot(file.copy(file, backup))
  }
  writeLines(cio, cio_path)
  writeLines(prt, prt_path)
  SWATreadR::write_swat(plants, plants_path, overwrite = TRUE)
  invisible(path)
}
swat62_scenario_outputs <- function(path, outflow_reach, calibration = FALSE) {
  prt_path <- file.path(path, 'print.prt')
  prt <- SWATreadR::swat_print_objects(readLines(prt_path), list(
    hru_wb = c('monthly', 'avann'), hru_nb = 'avann', hru_ls = 'avann',
    hru_pw = 'avann', channel_sd = 'avann', reservoir = 'avann'))
  writeLines(prt, prt_path)
  writeLines(c('Selected channel daily output', 'ID OBJ_TYP OBJ_TYP_NO HYD_TYP FILENAME',
    paste(1, 'sdc', outflow_reach, 'tot', 'cha_day.out')), file.path(path, 'object.prt'))
  cio_path <- file.path(path, 'file.cio')
  cio <- SWATreadR::swat_cio_set(readLines(cio_path), 'simulation', 3L, 'object.prt')
  if (calibration) cio <- SWATreadR::swat_cio_set(cio, 'chg', 2L, 'calibration.cal')
  writeLines(cio, cio_path)
}
swat62_run_scenarios <- function(swat_exe = swat62_executable(), base_path,
    scen_output, measure.list, outflow_reach, project_path, measr_name,
    cal_files = character(), n_thread = 4L) {
  swat62_require(c('SWATreadR', 'SWATmeasR'))
  base_path <- normalizePath(base_path, winslash = '/')
  project_path <- normalizePath(project_path, winslash = '/')
  if (!grepl('^([A-Za-z]:|/)', scen_output)) scen_output <- file.path(base_path, scen_output)
  if (dir.exists(scen_output) && length(list.files(scen_output, all.files = TRUE, no.. = TRUE))) {
    stop('Choose a new scenario output directory; existing results are retained: ', scen_output)
  }
  if (any(!grepl('^[A-Za-z0-9_-]+$', measure.list)) || anyDuplicated(measure.list)) stop('Use unique scenario names containing letters, numbers, underscores or hyphens.')
  saved <- readRDS(file.path(project_path, paste0(measr_name, '.measr')))
  locations <- saved$.data$nswrm_definition$nswrm_locations
  unknown <- setdiff(measure.list, c('statusquo', 'all', unique(locations$nswrm)))
  if (length(unknown)) stop('Unknown measures: ', paste(unknown, collapse = ', '))
  if (length(cal_files)) cal_files <- normalizePath(cal_files, winslash = '/', mustWork = TRUE)
  jobs <- expand.grid(measure = measure.list, cal = seq_len(max(1L, length(cal_files))), stringsAsFactors = FALSE)
  for (i in seq_len(nrow(jobs))) {
    path <- file.path(scen_output, '.models', paste0(jobs$measure[i], '_cal', jobs$cal[i]))
    dir.create(path, recursive = TRUE)
    files <- list.files(project_path, full.names = TRUE)
    files <- files[!dir.exists(files) & !grepl('\\.(txt|out|log)$|success\\.fin$', files)]
    auxiliary <- file.path(project_path, 'hru_agr.txt')
    if (file.exists(auxiliary)) files <- c(files, auxiliary)
    stopifnot(all(file.copy(files, path)))
    meas <- SWATmeasR::measr_project$new('swat62_job', path)
    meas$.data$nswrm_definition <- saved$.data$nswrm_definition
    ids <- if (jobs$measure[i] == 'all') locations$id else locations$id[locations$nswrm == jobs$measure[i]]
    if (length(ids)) {
      meas$implement_nswrm(ids)
      meas$write_swat_inputs()
    }
    if (length(cal_files)) stopifnot(file.copy(cal_files[jobs$cal[i]], file.path(path, 'calibration.cal'), overwrite = TRUE))
    swat62_scenario_outputs(path, outflow_reach, length(cal_files) > 0L)
    jobs$path[i] <- normalizePath(path, winslash = '/')
    jobs$output[i] <- if (length(cal_files)) file.path(scen_output, jobs$measure[i], paste0('cal', jobs$cal[i])) else file.path(scen_output, jobs$measure[i])
  }
  swat_exe <- normalizePath(swat_exe, winslash = '/', mustWork = TRUE)
  swat_check_binary(swat_exe)
  worker <- function(i, jobs, exe) {
    swat_run_checked(jobs$path[i], exe)
    dir.create(jobs$output[i], recursive = TRUE)
    files <- list.files(jobs$path[i], pattern = '(_aa\\.txt|_mon\\.txt|_day\\.txt|cha_day\\.out|hru\\.con|hru_agr\\.txt|swat62-run\\.log)$', full.names = TRUE)
    stopifnot(all(file.copy(files, jobs$output[i])))
    data.frame(scenario = jobs$measure[i], calibration = jobs$cal[i], exit_status = 0L, output = jobs$output[i])
  }
  n_thread <- min(as.integer(n_thread), nrow(jobs))
  if (is.na(n_thread) || n_thread < 1L) stop('n_thread must be positive.')
  cl <- parallel::makeCluster(n_thread)
  on.exit(parallel::stopCluster(cl), add = TRUE)
  parallel::clusterExport(cl, c('swat_run_checked', 'swat_check_binary'), envir = environment())
  result <- do.call(rbind, parallel::parLapply(cl, seq_len(nrow(jobs)), worker, jobs, swat_exe))
  readr::write_csv(result, file.path(scen_output, 'runs.csv'))
  invisible(result)
}
