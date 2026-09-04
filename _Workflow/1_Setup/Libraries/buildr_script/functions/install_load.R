## Checks the version of an R package if the version of the installed package
#' is greater than the required version of that package.
#'
#' @param rqst_vers Package name and version number in the format <name>_<version>
#' @param inst_vers Installed version number of package
#'   of a package
#' 
check_versnr <- function(rqst_vers, inst_vers) {
  n_elem <- max(length(rqst_vers), length(inst_vers))
  
  ndig_inst <- nchar(inst_vers[1:n_elem])
  ndig_pkg <- nchar(rqst_vers[1:n_elem])
  ndig <- c()
  for (i in 1:n_elem) {
    ndig <- c(ndig, max(ndig_inst[i], ndig_pkg[i], na.rm = T))
  }
  ndig <- cumsum(ndig[n_elem:1])[n_elem:1]
  ndig <- c(ndig[2:n_elem], 0)
  
  inst <- as.numeric(inst_vers[1:n_elem])
  inst <- ifelse(is.na(inst), 0, inst)
  pkg <- as.numeric(rqst_vers[1:n_elem])
  pkg <- ifelse(is.na(pkg), 0, pkg)
  
  inst_val <- sum(inst * 10^ndig)
  pkg_val  <- sum(pkg * 10^ndig)
  
  inst_val >= pkg_val
}

## Checks if the installed R version number is greater than the required one.
#'
#' @param r_version Required R version number as text string
#' 
check_r_version <- function(r_version) {
  session <- sessionInfo()
  r_installed <- paste(session$R.version$major, session$R.version$minor, sep = '.')
  r_installed <- strsplit(r_installed, '\\.|\\-')[[1]]
  r_requiered <- strsplit(r_version, '\\.|\\-')[[1]]
  r_is_uptd <- check_versnr(r_requiered, r_installed)
  
  if(!r_is_uptd) {
    stop('Installed R version is lower than ', r_version, '\n',
         '       Please update R before you continue!')
  }
}

#
# Install load function
# This function installs (if not available) R packages and loads them
# 
## Install and load R packages.
## If packages are not found in the library or the package version number is
## lower than the required one, a package is installed. After installation 
## the package is loaded.
#'
#' @param ... Multiple input arguments, Add all R packages that should be
#'   installed and loaded.
#' @param source Source from where the package should be installed. 
#'   Must be one of 'cran', 'github', or 'gitlab'.
#' @param git_user (optional). GitHub or GitLab user from which the package 
#'   is available.
#' @param host (optional). Alternative host.
#' @param token (optional).Authentication token if required to access a repository.
#' 
install_load <- function(..., source = 'cran', 
                         git_user = NULL, host = NULL, token = NULL) {
  pkgs <-  as.character(match.call(expand.dots = FALSE)[[2]])
  pkgs <- strsplit(pkgs, '\\_')
  pkg_name <- c()
  pkg_vers <- c()
  for (i in 1:length(pkgs)) {
    pkg_name <- c(pkg_name, pkgs[[i]][1])
    pkg_vers <- c(pkg_vers, ifelse(is.na(pkgs[[i]][2]), '0', pkgs[[i]][2]))
  }
  name_order <- order(pkg_name)
  pkg_name <- pkg_name[name_order]
  pkg_vers <- pkg_vers[name_order]
  pkg_vers <- strsplit(pkg_vers, '\\.|\\-')
  names(pkg_vers) <- pkg_name
  
  inst_pkg <- installed.packages()
  inst_name <- rownames(inst_pkg)
  inst_name <- inst_name[inst_name %in% pkg_name]
  inst_vers <- strsplit(inst_pkg[inst_name,'Version'], '\\.|\\-') 
  
  is_inst <- pkg_name %in% inst_pkg
  is_uptd <- c()
  for (i in pkg_name) {
    pkg_vers_i  <- pkg_vers[[i]]
    inst_vers_i <- inst_vers[[i]]
    is_uptd <- c(is_uptd, check_versnr(pkg_vers_i, inst_vers_i))
  }
  
  pkg_inst_upd <- pkg_name[!is_inst | !is_uptd]
  
  if (length(pkg_inst_upd)) {
    stop('The portable library is missing required package versions: ',
         paste(pkg_inst_upd, collapse = ', '),
         '. Run install_or_repair_packages.bat from the bundle root.')
  }
  for (pkg_i in pkg_name) library(pkg_i, character.only = TRUE)
}
