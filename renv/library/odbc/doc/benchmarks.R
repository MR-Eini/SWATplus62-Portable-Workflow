## ----eval = FALSE, include = FALSE--------------------------------------------
# # to run the timings in this readme, set the following env variable:
# Sys.setenv(ODBC_EVAL_BENCHMARKS = "true")

## ----include = FALSE----------------------------------------------------------
eval_timings <- as.logical(Sys.getenv("ODBC_EVAL_BENCHMARKS", "false"))

knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>",
  eval = eval_timings
)

## ----include = FALSE----------------------------------------------------------
# # The CRAN version of RODBC uses iODBC, so to use unixODBC we need to
# # recompile it from source, specifying the odbc manager explicitly:
# #
# # install.packages("RODBC", type = "source", INSTALL_opts="--configure-args='--with-odbc-manager=odbc'")
# #
# # see `vignette("develop")` for more details.

## ----setup--------------------------------------------------------------------
# library(odbc)
# library(RODBC)
# library(RODBCDBI)
# 
# library(DBI)
# 
# library(nycflights13)

## -----------------------------------------------------------------------------
# flights$time_hour <- NULL
# flights <- as.data.frame(flights)

## ----echo = FALSE-------------------------------------------------------------
# options("connectionObserver" = NULL)

## -----------------------------------------------------------------------------
# odbc <- dbConnect(odbc::odbc(), dsn = "MicrosoftSQLServer", uid = "SA", pwd = "BoopBop123!")
# rodbc <- RODBC::odbcConnect(dsn = "MicrosoftSQLServer", uid = "SA", pwd = "BoopBop123!")
# rodbcdbi <- dbConnect(RODBCDBI::ODBC(), dsn = "MicrosoftSQLServer", user = "SA", password = "BoopBop123!")

## ----include = FALSE----------------------------------------------------------
# if ("flights" %in% dbListTables(odbc)) {
#   dbExecute(odbc, "drop table flights")
# }

## -----------------------------------------------------------------------------
# odbc_write <- system.time(dbWriteTable(odbc, "flights", flights))
# 
# odbc_write

## ----include = !eval_timings--------------------------------------------------
# #>   user  system elapsed
# #>  0.883   0.176   8.108

## ----include = FALSE----------------------------------------------------------
# if ("flights" %in% dbListTables(odbc)) {
#   dbExecute(odbc, "drop table flights")
# }

## -----------------------------------------------------------------------------
# rodbcdbi_write <- system.time(dbWriteTable(rodbcdbi, "flights", flights))
# 
# rodbcdbi_write

## ----include = !eval_timings--------------------------------------------------
# #>   user  system elapsed
# #>  8.287  11.107 257.841

## ----include = FALSE----------------------------------------------------------
# if ("flights" %in% dbListTables(odbc)) {
#   dbExecute(odbc, "drop table flights")
# }

## -----------------------------------------------------------------------------
# rodbc_write <- system.time(sqlSave(rodbc, flights, "flights"))
# 
# rodbc_write

## ----include = !eval_timings--------------------------------------------------
# #>   user  system elapsed
# #>  8.266  11.023 235.825

## ----include = FALSE----------------------------------------------------------
# if ("flights" %in% dbListTables(odbc)) {
#   dbExecute(odbc, "drop table flights")
# }

## ----include = FALSE----------------------------------------------------------
# if (!"flights" %in% dbListTables(odbc)) {
#   dbWriteTable(odbc, "flights", flights)
# }

## -----------------------------------------------------------------------------
# odbc_read     <- system.time(result <- dbReadTable(odbc, "flights"))
# rodbcdbi_read <- system.time(result <- dbReadTable(rodbcdbi, "flights"))
# rodbc_read    <- system.time(result <- sqlFetch(rodbc, "flights"))

## -----------------------------------------------------------------------------
# odbc_read

## ----include = !eval_timings--------------------------------------------------
# #>   user  system elapsed
# #>  0.515   0.024   0.557

## -----------------------------------------------------------------------------
# rodbcdbi_read

## ----include = !eval_timings--------------------------------------------------
# #>   user  system elapsed
# #>  1.308   0.035   1.356

## -----------------------------------------------------------------------------
# rodbc_read

## ----include = !eval_timings--------------------------------------------------
# #>   user  system elapsed
# #>  1.291   0.033   1.343

