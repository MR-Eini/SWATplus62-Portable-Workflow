# 1. Activate the shared portable library
source("../../renv/activate.R")

# 2. Automated student path validation check
local({
  paths <- .libPaths()
  expected_lib <- normalizePath(paste0(getwd(), "/../../renv/library"), winslash = "/", mustWork = FALSE)
  
  cat("\n========================================================\n")
  cat("          PORTABLE WORKSPACE PATH VERIFICATION          \n")
  cat("========================================================\n")
  cat("Active Library Path: ", paths[1], "\n")
  
  # Check if the active library points to the shared master library folder
  if (tolower(normalizePath(paths[1], winslash = "/")) == tolower(expected_lib)) {
    cat("STATUS: [ SUCCESS ] Library is perfectly isolated to the bundle!\n")
  } else {
    cat("STATUS: [ WARNING ] Path mismatch detected! Check your launcher.\n")
  }
  cat("========================================================\n\n")
})
