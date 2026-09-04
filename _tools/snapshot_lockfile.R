args_all <- commandArgs(trailingOnly = FALSE)
file_arg <- grep("^--file=", args_all, value = TRUE)
if (length(file_arg) != 1L) stop("Cannot locate snapshot_lockfile.R")

script_path <- normalizePath(sub("^--file=", "", file_arg), winslash = "/")
bundle_root <- normalizePath(file.path(dirname(script_path), ".."), winslash = "/")
bundle_library <- normalizePath(file.path(bundle_root, "renv", "library"), winslash = "/")
.libPaths(c(bundle_library, .Library))

renv::snapshot(
  project = bundle_root,
  library = bundle_library,
  lockfile = file.path(bundle_root, "renv.lock"),
  type = "all",
  prompt = FALSE,
  force = TRUE
)
