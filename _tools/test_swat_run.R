args_all <- commandArgs(trailingOnly = FALSE)
file_arg <- grep("^--file=", args_all, value = TRUE)
args <- commandArgs(trailingOnly = TRUE)
if (length(file_arg) != 1L || length(args) != 1L) {
  stop("Usage: Rscript test_swat_run.R <path-to-SWAT+-text-setup>")
}

script_path <- normalizePath(sub("^--file=", "", file_arg), winslash = "/")
bundle_root <- normalizePath(file.path(dirname(script_path), ".."), winslash = "/")
bundle_library <- file.path(bundle_root, "renv", "library")
model_path <- normalizePath(args[[1]], winslash = "/", mustWork = TRUE)

.libPaths(c(bundle_library, .Library))
Sys.setenv(
  SWAT_BUNDLE_ROOT = bundle_root,
  SWAT_PACKAGE_LIBRARY = bundle_library,
  SWATPLUS_EXE = file.path(bundle_root, "bin", "swatplus-62-ifo-win_amd64-Rel.exe")
)

library(SWATrunR)
result <- run_swatplus(
  project_path = model_path,
  output = list(
    precipitation = define_output(file = "basin_wb_aa", variable = "precip", unit = 1)
  ),
  n_thread = 1,
  add_date = FALSE,
  return_output = TRUE,
  run_path = tempfile("swat62-bundle-run-"),
  keep_folder = FALSE,
  quiet = TRUE,
  time_out = 120
)

stopifnot(length(result) > 0L)
cat("OK: SWATrunR used the bundled SWAT+ revision 62 executable and returned ",
    length(result), " result object(s).\n", sep = "")
