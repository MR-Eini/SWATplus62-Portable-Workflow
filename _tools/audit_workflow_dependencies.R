args_all <- commandArgs(trailingOnly = FALSE)
file_arg <- grep("^--file=", args_all, value = TRUE)
if (length(file_arg) != 1L) stop("Cannot locate audit_workflow_dependencies.R")

script_path <- normalizePath(sub("^--file=", "", file_arg), winslash = "/")
bundle_root <- normalizePath(file.path(dirname(script_path), ".."), winslash = "/")
bundle_library <- file.path(bundle_root, "renv", "library")
.libPaths(c(bundle_library, .Library))

dependencies <- renv::dependencies(file.path(bundle_root, "_Workflow"), progress = FALSE)
required <- sort(unique(stats::na.omit(dependencies$Package)))
available <- unique(installed.packages(lib.loc = .libPaths())[, "Package"])
missing <- setdiff(required, available)

if (length(missing)) {
  stop("Workflow dependencies missing from the portable environment: ", paste(missing, collapse = ", "))
}
loadable <- vapply(required, requireNamespace, logical(1), quietly = TRUE)
if (any(!loadable)) {
  stop("Workflow dependencies that cannot be loaded: ", paste(required[!loadable], collapse = ", "))
}

r_files <- list.files(file.path(bundle_root, "_Workflow"), pattern = "\\.[Rr]$", recursive = TRUE, full.names = TRUE)
forbidden <- c(
  "install.packages", "update.packages", "install_github", "install_git",
  "install_gitlab", "install_whitebox", "p_load"
)
runtime_installers <- character()
for (path in r_files) {
  expressions <- parse(path, keep.source = FALSE)
  calls <- unique(all.names(expressions, functions = TRUE))
  if (length(intersect(calls, forbidden))) runtime_installers <- c(runtime_installers, path)
}
if (length(runtime_installers)) {
  stop("Run-time package installer found in: ", paste(runtime_installers, collapse = ", "))
}

cat("OK: all ", length(required), " statically detected workflow dependencies are installed; ",
    length(r_files), " R scripts parse without a run-time package installer.\n", sep = "")
