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
