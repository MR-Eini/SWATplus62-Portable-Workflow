## ----include = FALSE----------------------------------------------------------
knitr::opts_chunk$set(
  collapse = FALSE,
  comment = "#>"
)

## ----setup--------------------------------------------------------------------
suppressPackageStartupMessages({
  library(yyjsonr)
})

## ----eval=FALSE---------------------------------------------------------------
# write_json_str(iris)
# write_json_str(iris, opts = list())
# write_json_str(iris, opts = opts_write_json())

## ----eval=FALSE---------------------------------------------------------------
# write_json_str(iris, opts = list(str_specials = 'string'))
# write_json_str(iris, opts = opts_write_json(str_specials = 'string'))
# write_json_str(iris, str_specials = 'string')

## -----------------------------------------------------------------------------
robj <- c(1, 1.23, 3.141592654)
write_json_str(robj)
write_json_str(robj, digits = 2)
write_json_str(robj, digits = 0)

## -----------------------------------------------------------------------------
robj <- head(iris, 2)
write_json_str(robj) |> cat()
write_json_str(robj, pretty = TRUE) |> cat()

## -----------------------------------------------------------------------------
robj <- list(1, c(1, 2), NA)
write_json_str(robj) |> cat()
write_json_str(robj, auto_unbox = TRUE) |> cat()

## -----------------------------------------------------------------------------
robj <- head(iris, 3)
write_json_str(robj, pretty = TRUE) |> cat()
write_json_str(robj, pretty = TRUE, dataframe = "cols") |> cat()

## ----echo=FALSE---------------------------------------------------------------
set.seed(1)

## -----------------------------------------------------------------------------
robj <- sample(iris$Species, 10)
write_json_str(robj) |> cat()
write_json_str(robj, factor = 'integer') |> cat()

## -----------------------------------------------------------------------------
robj <- list(a = 1, b = 2, 67)
write_json_str(robj, pretty = TRUE) |> cat()
write_json_str(robj, pretty = TRUE, name_repair = 'minimal') |> cat()

## -----------------------------------------------------------------------------
robj <- c(1.23, NA_real_, NaN, Inf, -Inf)
write_json_str(robj) |> cat()
write_json_str(robj, num_specials = 'string') |> cat()

## -----------------------------------------------------------------------------
robj <- c("hello", NA_character_)
write_json_str(robj) |> cat()
write_json_str(robj, str_specials = 'string') |> cat()

## -----------------------------------------------------------------------------
# A reference list of all the possible YYJSON options
yyjsonr::yyjson_write_flag

write_json_str(
  c('hello / there', '#RStats'),
  opts = opts_write_json(yyjson_write_flag = c(
    yyjson_write_flag$YYJSON_WRITE_ESCAPE_SLASHES
  ))
) |> cat()

