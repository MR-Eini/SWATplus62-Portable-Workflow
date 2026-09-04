## -----------------------------------------------------------------------------
#| label: setup
#| include: false
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>"
)


## -----------------------------------------------------------------------------
#| label: basic-usage
#| eval: false
# library(quarto)
# 
# # Extract R code from a Quarto document to an R script
# # It will output my-analysis.R
# qmd_to_r_script("my-analysis.qmd"")


## -----------------------------------------------------------------------------
#| label: create-example-qmd
#| echo: false
# Create a temporary directory for our examples
dir.create(temp_dir <- tempfile(pattern = "quarto-r-scripts-vignette"))
qmd_file <- file.path(temp_dir, "example.qmd")


## # Sample Quarto document content
## ---
## title: "My Analysis"
## author: "Data Scientist"
## format: html
## ---
## 
## # Introduction
## 
## This is a sample analysis.
## 
## ```{r}
## #| label: setup
## #| message: false
## library(ggplot2)
## library(dplyr)
## ```
## 
## ```{r}
## #| label: data-viz
## #| fig-width: 8
## #| fig-height: 6
## mtcars |>
##   ggplot(aes(x = wt, y = mpg)) +
##   geom_point() +
##   geom_smooth()
## ```

## -----------------------------------------------------------------------------
#| label: extract-r-script
library(quarto)

# Extract R code to a script
r_script <- qmd_to_r_script(qmd_file)


## NA

## -----------------------------------------------------------------------------
#| echo: false
mixed_qmd <- file.path(temp_dir, "mixed.qmd")


## ---
## title: "Mixed Language Analysis"
## format: html
## ---
## 
## ```{r}
## #| label: r-analysis
## data <- mtcars
## summary(data)
## ```
## 
## ```{python}
## #| label: python-analysis
## import pandas as pd
## df = pd.DataFrame({"x": [1, 2, 3], "y": [4, 5, 6]})
## print(df.head())
## ```
## 
## ```{ojs}
## //| label: js-viz
## Plot.plot({
##   marks: [Plot.dot(data, {x: "x", y: "y"})]
## })
## ```

## -----------------------------------------------------------------------------
#| label: extract-mixed-r-script
# Extract R code from mixed-language document
mixed_r_script <- qmd_to_r_script(mixed_qmd)


## NA

## -----------------------------------------------------------------------------
#| label: prepare-script
#| echo: false
simple_script <- file.path(temp_dir, "simple.R")


## # Load required libraries
## library(ggplot2)
## library(dplyr)
## 
## # Analyze mtcars data
## mtcars |>
##   group_by(cyl) |>
##   summarise(avg_mpg = mean(mpg), .groups = "drop")
## 
## # Create visualization
## ggplot(mtcars, aes(x = factor(cyl), y = mpg)) +
##   geom_boxplot() +
##   labs(title = "MPG by Number of Cylinders",
##        x = "Cylinders", y = "Miles per Gallon")

## -----------------------------------------------------------------------------
#| label: add-yaml-metadata
# Add YAML metadata for Quarto rendering
add_spin_preamble(simple_script, 
                  title = "Car Analysis",
                  preamble = list(
                    author = "R User",
                    format = list(
                      html = list(
                        code_fold = TRUE,
                        theme = "cosmo"
                      )
                    )
                  ))


## NA

## -----------------------------------------------------------------------------
#| include: false
#| eval: false
# # Clean up temporary files
# unlink(temp_dir, recursive = TRUE)

