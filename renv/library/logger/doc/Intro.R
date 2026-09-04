## ----setup, include = FALSE---------------------------------------------------
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>"
)

library(logger)
log_appender(appender_stdout)

## -----------------------------------------------------------------------------
library(logger)
log_info("Loading data")
data(mtcars)
log_info("The dataset includes {nrow(mtcars)} rows")
if (max(mtcars$hp) < 1000) {
  log_warn("Oh, no! There are no cars with more than 1K horsepower in the dataset :/")
  log_debug("The most powerful car is {rownames(mtcars)[which.max(mtcars$hp)]} with {max(mtcars$hp)} hp")
}

## -----------------------------------------------------------------------------
log_threshold()

## -----------------------------------------------------------------------------
log_threshold(TRACE)

## -----------------------------------------------------------------------------
log_info("Loading data")
data(mtcars)
log_info("The dataset includes {nrow(mtcars)} rows")
if (max(mtcars$hp) < 1000) {
  log_warn("Oh, no! There are no cars with more than 1K horsepower in the dataset :/")
  log_debug("The most powerful car is {rownames(mtcars)[which.max(mtcars$hp)]} with {max(mtcars$hp)} hp")
}

## -----------------------------------------------------------------------------
f <- sqrt
g <- mean
x <- 1:31
log_eval(y <- f(g(x)), level = INFO)
str(y)

## ----knitr-pander-setup, include = FALSE--------------------------------------
ppo1 <- pander::panderOptions("knitr.auto.asis")
ppo2 <- pander::panderOptions("table.style")
pander::panderOptions("knitr.auto.asis", FALSE)
pander::panderOptions("table.style", "simple")

## -----------------------------------------------------------------------------
log_formatter(formatter_pander)
log_info(head(iris))

## ----knitr-pander-revert, include = FALSE-------------------------------------
pander::panderOptions("knitr.auto.asis", ppo1)
pander::panderOptions("table.style", ppo2)

## ----cleanup, include = FALSE-------------------------------------------------
logger:::namespaces_reset()

