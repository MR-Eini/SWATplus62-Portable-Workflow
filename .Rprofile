bundle_root <- Sys.getenv("SWAT_BUNDLE_ROOT", unset = "")

if (nzchar(bundle_root)) {
  bundle_library <- file.path(bundle_root, "renv", "library")
  if (dir.exists(bundle_library)) {
    .libPaths(c(normalizePath(bundle_library), .Library))
  }
}

options(
  repos = c(CRAN = "https://cloud.r-project.org"),
  renv.config.sandbox.enabled = FALSE
)

