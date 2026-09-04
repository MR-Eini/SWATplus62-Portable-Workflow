## ----pkgchecks, echo = FALSE--------------------------------------------------
## check if other logger packages are available and exit if not
for (pkg in c("futile.logger", "logging", "log4r")) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    warning(paste(pkg, "package not available, so cannot build this vignette"))
    knitr::knit_exit()
  }
}

