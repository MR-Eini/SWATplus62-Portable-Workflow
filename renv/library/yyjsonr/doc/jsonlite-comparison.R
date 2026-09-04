## ----include = FALSE----------------------------------------------------------
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>"
)

## ----setup--------------------------------------------------------------------
library(yyjsonr)

## -----------------------------------------------------------------------------
# A simple 3D array 
mat <- array(1:12, dim = c(2,3,2))
mat

## -----------------------------------------------------------------------------
# jsonlite's serialization of matrices is internally consistent and re-parses
# to the initial matrix.
str <- jsonlite::toJSON(mat, pretty = TRUE)
cat(str)
jsonlite::fromJSON(str)

## -----------------------------------------------------------------------------
# yyjsonr's serialization of matrices is internally consistent and re-parses
# to the initial matrix.
# But note that it is *different* to what jsonlite does.
str <- yyjsonr::write_json_str(mat, pretty = TRUE)
cat(str)
yyjsonr::read_json_str(str)

