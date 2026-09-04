## ----setup, include=FALSE-----------------------------------------------------
library(quarto)


## -----------------------------------------------------------------------------
# Simulate some computed values
user_type <- "admin"
is_debug <- TRUE
current_version <- "2.1.0"


## -----------------------------------------------------------------------------
#| echo: fenced
#| label: metadata-block
#| output: asis
quarto::write_yaml_metadata_block(
  user_level = user_type,
  debug_mode = is_debug,
  app_version = "2.1.0",
  generated_at = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z")
)


## -----------------------------------------------------------------------------
#| echo: false
#| output: asis
xfun::fenced_block(
  attrs = ".yaml",
  knitr::knit_child(text = c("```{r metadata-block, echo=FALSE, output='asis'}", "```"), quiet = TRUE)
) |> gsub(pattern = "^\\s+", replacement = "") |> cat(sep = "\n")

