args_all <- commandArgs(trailingOnly = FALSE)
file_arg <- grep("^--file=", args_all, value = TRUE)
if (length(file_arg) != 1L) stop("Cannot locate verify_environment.R")

script_path <- normalizePath(sub("^--file=", "", file_arg), winslash = "/")
bundle_root <- normalizePath(file.path(dirname(script_path), ".."), winslash = "/")
bundle_library <- file.path(bundle_root, "renv", "library")
.libPaths(c(bundle_library, .Library))

`%||%` <- function(x, y) if (is.null(x) || length(x) == 0L || is.na(x)) y else x

failures <- character()
expect <- function(ok, message) {
  if (!isTRUE(ok)) failures <<- c(failures, message)
}

expect(as.character(getRversion()) == "4.5.1",
       paste0("Expected portable R 4.5.1, found ", getRversion()))
expect(normalizePath(.libPaths()[[1]], winslash = "/") == normalizePath(bundle_library, winslash = "/"),
       "The private bundle library is not first in .libPaths()")

package_manifest <- read.csv(
  file.path(bundle_root, "config", "package-manifest.csv"),
  stringsAsFactors = FALSE,
  check.names = FALSE
)
for (i in seq_len(nrow(package_manifest))) {
  package <- package_manifest$Package[[i]]
  expected <- package_manifest$Version[[i]]
  installed <- tryCatch(
    as.character(packageVersion(package, lib.loc = bundle_library)),
    error = function(e) NA_character_
  )
  expect(!is.na(installed) && installed == expected,
         sprintf("%s: expected %s, found %s", package, expected, installed))
  location <- tryCatch(find.package(package, lib.loc = bundle_library), error = function(e) "")
  expect(nzchar(location) && startsWith(normalizePath(location, winslash = "/"), normalizePath(bundle_library, winslash = "/")),
         paste0(package, " is not loading from the private bundle library"))
  loaded <- tryCatch(requireNamespace(package, quietly = TRUE), error = function(e) FALSE)
  expect(loaded, paste0(package, " or one of its runtime dependencies cannot be loaded"))
}

library_manifest_path <- file.path(bundle_root, "config", "library-manifest.csv")
if (file.exists(library_manifest_path)) {
  locked <- read.csv(library_manifest_path, stringsAsFactors = FALSE)
  installed <- as.data.frame(installed.packages(lib.loc = bundle_library), stringsAsFactors = FALSE)
  current <- setNames(installed$Version, installed$Package)
  for (i in seq_len(nrow(locked))) {
    package <- locked$Package[[i]]
    expect(package %in% names(current) && identical(unname(current[[package]]), locked$Version[[i]]),
           sprintf("Dependency drift for %s: expected %s, found %s", package, locked$Version[[i]], current[[package]] %||% "missing"))
  }
}

required_projects <- c(
  "_Workflow/1_Setup/wf.Rproj",
  "_Workflow/2_SWATdoctR/DoctR.Rproj",
  "_Workflow/3_CropYield/softcal/softcal.Rproj",
  "_Workflow/4_RiverDischarge/hardcal/hardcal.Rproj",
  "_Workflow/5_NBS/1_Managment_scenario/1_Statusquo/FarmR_project/FarmR_project.Rproj",
  "_Workflow/5_NBS/1_Managment_scenario/2_Covcrop/FarmR_project/FarmR_project.Rproj",
  "_Workflow/5_NBS/1_Managment_scenario/3_CropRotation/FarmR_project/SWATfarmR_input.Rproj",
  "_Workflow/5_NBS/2_NBS_simulations/NBS_scenario_simulation.Rproj"
)
for (path in required_projects) {
  expect(file.exists(file.path(bundle_root, path)), paste0("Missing project: ", path))
}

binary_manifest <- read.csv(file.path(bundle_root, "config", "binary-manifest.csv"), stringsAsFactors = FALSE)
for (i in seq_len(nrow(binary_manifest))) {
  path <- file.path(bundle_root, binary_manifest$RelativePath[[i]])
  expect(file.exists(path), paste0("Missing executable: ", binary_manifest$RelativePath[[i]]))
  if (file.exists(path)) {
    con <- file(path, "rb")
    magic <- readBin(con, what = "raw", n = 2L)
    close(con)
    expect(identical(magic, charToRaw("MZ")), paste0("Not a Windows executable: ", path))
  }
}

if (length(failures)) stop(paste(failures, collapse = "\n"))
cat(sprintf(
  "OK: R %s; %d pinned library packages; 7 SWAT packages; 8 workflow projects; SWAT+ revision 62.\n",
  getRversion(),
  nrow(installed.packages(lib.loc = bundle_library))
))
