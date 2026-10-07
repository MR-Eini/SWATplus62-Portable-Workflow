local({
  root <- Sys.getenv("SWAT_BUNDLE_ROOT", unset = "")
  if (!nzchar(root)) {
    root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
    repeat {
      if (dir.exists(file.path(root, "_Workflow")) && dir.exists(file.path(root, "renv/library"))) break
      parent <- dirname(root)
      if (identical(parent, root)) stop("Open a project inside this portable workflow.")
      root <- parent
    }
  }
  root <- normalizePath(root, winslash = "/", mustWork = TRUE)
  library <- file.path(root, "renv/library")
  .libPaths(c(library, .Library))
  Sys.setenv(SWAT_BUNDLE_ROOT = root, SWAT_PACKAGE_LIBRARY = library,
             SWATPLUS_EXE = file.path(root, "bin/swatplus-62-ifo-win_amd64-Rel.exe"),
             SWAT_WRITE_EXE = file.path(root, "bin/write.exe"),
             WHITEBOX_EXE = file.path(root, "bin/WBT/whitebox_tools.exe"))
})
options(repos = c(CRAN = "https://cloud.r-project.org"), renv.config.sandbox.enabled = FALSE)
