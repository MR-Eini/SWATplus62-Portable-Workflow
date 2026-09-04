## ----echo = FALSE-------------------------------------------------------------
library(DBI)
knitr::opts_chunk$set(
  error = (Sys.getenv("IN_PKGDOWN") != "true"),
  collapse = TRUE,
  comment = "#>",
  eval = RPostgres::postgresHasDefault()
)
con <- NULL
rp <- NULL
rs <- NULL

## -----------------------------------------------------------------------------
# library(DBI)
# 
# con <- dbConnect(RPostgres::Postgres())
# 
# dbExecute(con, "DROP TABLE IF EXISTS sqroot_vignette_example;")
# dbExecute(con, "
#     CREATE TABLE sqroot_vignette_example (
#         in_val INTEGER PRIMARY KEY,
#         out_val DOUBLE PRECISION NULL
#     )
# ")

## ----echo = FALSE-------------------------------------------------------------
# if (!is.null(rs)) {
#   dbClearResult(rs) ; rs <- NULL
# }
# if (!is.null(con)) {
#   dbDisconnect(con) ; con <- NULL
# }
# if (!is.null(rp)) {
#   rp$wait() ; rp <- NULL
# }

## -----------------------------------------------------------------------------
# con <- dbConnect(RPostgres::Postgres())
# dbExecute(con, "LISTEN grapevine")

## -----------------------------------------------------------------------------
# rp <- callr::r_bg(function() {
#   library(DBI)
#   Sys.sleep(0.3)
#   db_notify <- dbConnect(RPostgres::Postgres())
#   dbExecute(db_notify, "NOTIFY grapevine, 'psst'")
#   dbDisconnect(db_notify)
# })

## -----------------------------------------------------------------------------
# # Sleep until we get the message
# n <- NULL
# while (is.null(n)) {
#   n <- RPostgres::postgresWaitForNotify(con)
# }
# n$payload

## -----------------------------------------------------------------------------
# rs <- dbSendQuery(con, "
#     SELECT in_val
#       FROM sqroot_vignette_example
#      WHERE in_val = $1
#        FOR UPDATE
#       SKIP LOCKED
# ", params = list(99))

## ----echo = FALSE-------------------------------------------------------------
# if (!is.null(rs)) {
#   dbClearResult(rs) ; rs <- NULL
# }
# if (!is.null(con)) {
#   dbDisconnect(con) ; con <- NULL
# }
# if (!is.null(rp)) {
#   rp$wait() ; rp <- NULL
# }

## -----------------------------------------------------------------------------
# worker <- function() {
#   library(DBI)
#   db_worker <- dbConnect(RPostgres::Postgres())
#   on.exit(dbDisconnect(db_worker))
#   dbExecute(db_worker, "LISTEN sqroot")
#   dbExecute(db_worker, "LISTEN sqroot_shutdown")
# 
#   while (TRUE) {
#     # Wait for new work to do
#     n <- RPostgres::postgresWaitForNotify(db_worker, 60)
#     if (is.null(n)) {
#       # If nothing to do, send notifications of any not up-to-date work
#       dbExecute(db_worker, "
#                 SELECT pg_notify('sqroot', in_val::TEXT)
#                   FROM sqroot_vignette_example
#                  WHERE out_val IS NULL
#             ")
#       next
#     }
# 
#     # If we've been told to shutdown, stop right away
#     if (n$channel == 'sqroot_shutdown') {
#       writeLines("Shutting down.")
#       break
#     }
# 
#     in_val <- strtoi(n$payload)
#     tryCatch(
#       {
#         dbWithTransaction(db_worker, {
#           # Try and fetch the item we got notified about
#           rs <- dbSendQuery(db_worker, "
#                     SELECT in_val
#                       FROM sqroot_vignette_example
#                      WHERE out_val IS NULL -- if another worker already finished, don't reprocess
#                        AND in_val = $1
#                        FOR UPDATE SKIP LOCKED -- Don't let another worker work on this at the same time
#                 ", params = list(in_val))
#           in_val <- dbFetch(rs)[1, 1]
#           dbClearResult(rs)
# 
#           if (!is.na(in_val)) {
#             # Actually do the sqrt
#             writeLines(paste("Sqroot-ing", in_val, "... "))
#             Sys.sleep(in_val * 0.1)
#             out_val <- sqrt(in_val)
# 
#             # Update the datbase with the result
#             dbExecute(db_worker, "
#                       UPDATE sqroot_vignette_example
#                          SET out_val = $1
#                        WHERE in_val = $2
#                   ", params = list(out_val, in_val))
#           } else {
#             writeLines(paste("Not sqroot-ing as another worker got there first"))
#           }
#         })
#       },
#       error = function(e) {
#         # Something went wrong. Report error and carry on
#         writeLines(paste("Failed to sqroot:", e$message))
#       })
#   }
# }

## -----------------------------------------------------------------------------
# stdout_1 <- tempfile()
# stdout_2 <- tempfile()
# rp <- callr::r_bg(worker, stdout = stdout_1, stderr = stdout_1)
# rp <- callr::r_bg(worker, stdout = stdout_2, stderr = stdout_2)
# Sys.sleep(1)  # Give workers a chance to set themselves up

## -----------------------------------------------------------------------------
# con <- dbConnect(RPostgres::Postgres())
# 
# add_sqroot <- function(in_val) {
#   dbExecute(con, "
#         INSERT INTO sqroot_vignette_example (in_val) VALUES ($1)
#     ", params = list(in_val))
#   dbExecute(con, "
#         SELECT pg_notify('sqroot', $1)
#     ", params = list(in_val))
# }
# 
# add_sqroot(7)
# add_sqroot(8)
# add_sqroot(9)

## -----------------------------------------------------------------------------
# Sys.sleep(3)
# rs <- dbSendQuery(con, "SELECT * FROM sqroot_vignette_example ORDER BY in_val")
# dbFetch(rs)
# dbClearResult(rs) ; rs <- NULL

## -----------------------------------------------------------------------------
# dbExecute(con, "NOTIFY sqroot_shutdown, ''")

## -----------------------------------------------------------------------------
# # We can't control which worker will process the first entry,
# # so we sort the results so the vignette output stays the same.
# outputs <- sort(c(
#   paste(readLines(con = stdout_1), collapse = "\n"),
#   paste(readLines(con = stdout_2), collapse = "\n")))
# 
# writeLines(outputs[[1]])
# writeLines(outputs[[2]])

## ----echo = FALSE, error = FALSE----------------------------------------------
# dbExecute(con, "DROP TABLE IF EXISTS sqroot_vignette_example;")
# dbDisconnect(con)
# 
# rp$wait()

