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
# read_json_str(str)
# read_json_str(str, opts = list())
# read_json_str(str, opts = opts_read_json())

## ----eval=FALSE---------------------------------------------------------------
# read_json_str(str, opts = list(str_specials = 'string'))
# read_json_str(str, opts = opts_read_json(str_specials = 'string'))
# read_json_str(str, str_specials = 'string')

## -----------------------------------------------------------------------------
json <- '[1,2,3.1,"apple", null]'
read_json_str(json)

## -----------------------------------------------------------------------------
yyjsonr::read_json_str(json, promote_num_to_string = TRUE)

## -----------------------------------------------------------------------------
str <- '[{"a":1, "b":2}, {"a":3, "b":4}]'
read_json_str(str)

## -----------------------------------------------------------------------------
str <- '[{"a":1, "b":[1,2]}, {"a":3, "b":2}]'
read_json_str(str)

## -----------------------------------------------------------------------------
str <- '[{"a":1, "b":[1,2]}, {"a":2}]'
read_json_str(str)
read_json_str(str, df_missing_list_elem = NA)

## -----------------------------------------------------------------------------
str <- '{"a":[1,2],"b":["apple", "banana"]}'
read_json_str(str)
read_json_str(str, obj_of_arrs_to_df = FALSE)

## -----------------------------------------------------------------------------
str_unequal <- '{"a":[1,2],"b":["apple", "banana", "carrot"]}'
read_json_str(str_unequal)

## -----------------------------------------------------------------------------
str <- '[{"a":1, "b":2}, {"a":3, "b":4}]'
read_json_str(str)
read_json_str(str, arr_of_objs_to_df = FALSE)

## -----------------------------------------------------------------------------
str <- '[{"a":1, "b":2}, {"a":3, "b":4, "c":99}]'
read_json_str(str)

## -----------------------------------------------------------------------------
str <- '["hello", "NA", null]'
read_json_str(str) # default: str_specials = 'string'
read_json_str(str, str_specials = 'special')

## -----------------------------------------------------------------------------
str <- '[1.23, "NA", "NaN", "Inf", "-Inf", null]'
read_json_str(str) # default: num_specials = 'special'
read_json_str(str, num_specials = 'string')

## ----echo=FALSE---------------------------------------------------------------
suppressPackageStartupMessages(
  library(bit64)
)

## -----------------------------------------------------------------------------
str <- '[1, 274877906944]'

# default: int64 = 'string'
# Since result is a mix of types, a list is returned
read_json_str(str) 

# Read large integer as double
robj <- read_json_str(str, int64 = 'double')
class(robj)
robj

# Read large integer as 'bit64::integer64' type
library(bit64)
read_json_str(str, int64 = 'bit64')

## -----------------------------------------------------------------------------
read_json_str('67')   |> str()
read_json_str('[67]') |> str()

read_json_str('67'  , length1_array_asis = TRUE) |> str()
read_json_str('[67]', length1_array_asis = TRUE) |> str() # Has 'AsIs' class

## -----------------------------------------------------------------------------
str <- '{"a":67, "b":[67], "c":[1,2]}'

# Length-1 vectors output as JSON arrays
read_json_str(str) |>
  write_json_str(auto_unbox = FALSE) |>
  cat()

# Length-1 vectors output as JSON scalars
read_json_str(str) |>
  write_json_str(auto_unbox = TRUE) |>
  cat()

# Length-1 vectors output as JSON arrays
read_json_str(str, length1_array_asis = TRUE) |>
  write_json_str(auto_unbox = FALSE) |>
  cat()

# !!!!
# Those values marked with 'AsIs' class when reading are output
# as length-1 JSON arrays
read_json_str(str, length1_array_asis = TRUE) |>
  write_json_str(auto_unbox = TRUE) |>
  cat()

## -----------------------------------------------------------------------------
# A reference list of all the possible YYJSON options
yyjsonr::yyjson_read_flag

read_json_str(
  "[1, 2, 3, ] // A JSON comment not allowed by the standard",
  opts = opts_read_json(yyjson_read_flag = c(
    yyjson_read_flag$YYJSON_READ_ALLOW_TRAILING_COMMAS,
    yyjson_read_flag$YYJSON_READ_ALLOW_COMMENTS
  ))
)

