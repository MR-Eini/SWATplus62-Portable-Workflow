args_all <- commandArgs(trailingOnly = FALSE)
file_arg <- grep("^--file=", args_all, value = TRUE)
if (length(file_arg) != 1L) stop("Cannot locate install_bundle_packages.R")

script_path <- normalizePath(sub("^--file=", "", file_arg), winslash = "/")
bundle_root <- normalizePath(file.path(dirname(script_path), ".."), winslash = "/")
bundle_library <- file.path(bundle_root, "renv", "library")
manifest_path <- file.path(bundle_root, "config", "package-manifest.csv")

if (as.character(getRversion()) != "4.5.1") {
  stop("The bundled installer must run with portable R 4.5.1; found ", getRversion())
}
if (!dir.exists(bundle_library)) stop("Missing private library: ", bundle_library)

.libPaths(c(bundle_library, .Library))
manifest <- read.csv(manifest_path, stringsAsFactors = FALSE, check.names = FALSE)

for (i in seq_len(nrow(manifest))) {
  archive <- file.path(bundle_root, "packages", manifest$Archive[[i]])
  if (!file.exists(archive)) stop("Missing package archive: ", archive)

  message(sprintf(
    "[%d/%d] Installing %s %s",
    i, nrow(manifest), manifest$Package[[i]], manifest$Version[[i]]
  ))
  install.packages(
    archive,
    repos = NULL,
    type = "source",
    lib = bundle_library,
    dependencies = FALSE,
    INSTALL_opts = "--no-multiarch"
  )
}

problems <- character()
for (i in seq_len(nrow(manifest))) {
  package <- manifest$Package[[i]]
  expected <- manifest$Version[[i]]
  installed <- tryCatch(
    as.character(packageVersion(package, lib.loc = bundle_library)),
    error = function(e) NA_character_
  )
  if (is.na(installed) || installed != expected) {
    problems <- c(problems, sprintf("%s: expected %s, found %s", package, expected, installed))
  }
}
if (length(problems)) stop(paste(problems, collapse = "\n"))

inventory <- as.data.frame(installed.packages(lib.loc = bundle_library), stringsAsFactors = FALSE)
inventory <- inventory[order(inventory$Package), c("Package", "Version", "Built", "LibPath")]
inventory$LibPath <- "renv/library"
write.csv(inventory, file.path(bundle_root, "config", "library-manifest.csv"), row.names = FALSE)

message("Installed and verified all bundled SWAT packages in: ", bundle_library)

