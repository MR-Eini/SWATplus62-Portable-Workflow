local({
  root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
  repeat {
    if (dir.exists(file.path(root, "_Workflow")) && dir.exists(file.path(root, "renv/library"))) break
    parent <- dirname(root)
    if (identical(parent, root)) stop("Cannot locate the portable workflow root.")
    root <- parent
  }
  source(file.path(root, ".Rprofile"), local = FALSE)
})
