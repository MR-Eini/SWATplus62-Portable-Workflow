# Find rows containing "oats_cc" and/or "csil_cc" in crops1_covcrop.csv

input_path <- "./input/crops1_covcrop.csv"   # change if needed
out_any    <- sub("\\.csv$", "_rows.csv", input_path)

df <- read.csv(input_path, stringsAsFactors = FALSE, check.names = FALSE, fileEncoding = "UTF-8-BOM")

# If your file has year columns (y_1995, y_1996, ...), search only those; otherwise search all columns
year_cols <- grep("^y_[0-9]{4}$", names(df), value = TRUE)
search_cols <- if (length(year_cols) > 0) year_cols else names(df)

normalize <- function(x) {
  x <- tolower(trimws(as.character(x)))
  x[x == ""] <- NA_character_
  x
}

mat <- as.matrix(df[, search_cols, drop = FALSE])
mat <- apply(mat, 2, normalize)

has_oats_cc <- apply(mat, 1, function(r) any(r == "oats_cc", na.rm = TRUE))
has_csil_cc <- apply(mat, 1, function(r) any(r == "csil_cc", na.rm = TRUE))

rows_any  <- which(has_oats_cc | has_csil_cc)
rows_both <- which(has_oats_cc & has_csil_cc)

# Write outputs (row numbers are 1-based, matching R's indexing)
write.csv(
  data.frame(row_number = rows_any,
             has_oats_cc = has_oats_cc[rows_any],
             has_csil_cc = has_csil_cc[rows_any]),
  out_any, row.names = FALSE
)

write.csv(
  data.frame(row_number = rows_both,
             has_oats_cc = TRUE,
             has_csil_cc = TRUE)
)

cat("Wrote:\n", out_any, "\n", sep = "")
