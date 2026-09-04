# ------------------------------------------------------------
# Rules (apply based on ORIGINAL sequence; no cascading):
# - alfa alfa alfa  -> change ONLY the middle (2nd) to oats
# - fesc_mgt fesc_mgt fesc_mgt  -> change ONLY the middle (2nd) to oats
# - oats oats oats  -> change ONLY the middle (2nd) to csil
#
# Important: For longer runs (e.g., 10x alfa), it treats them as
# consecutive non-overlapping blocks of 3:
#   [alfa alfa alfa][alfa alfa alfa]...  -> change only each block's middle
# This guarantees the 1st and 3rd crops of each 3-block stay unchanged.
#
# NEW: writes a CSV listing row numbers (and optional details) that changed.
# ------------------------------------------------------------

input_path   <- "./input/crops1.csv"
output_path  <- sub("\\.csv$", "_rotation.csv", input_path)
changes_path <- sub("\\.csv$", "_changed_rows.csv", input_path)

df <- read.csv(input_path, stringsAsFactors = FALSE, check.names = FALSE, fileEncoding = "UTF-8-BOM")

# Year columns like y_1995, y_1996, ...
year_cols <- grep("^y_[0-9]{4}$", names(df), value = TRUE)
# Ensure chronological order
year_nums <- as.integer(sub("^y_", "", year_cols))
year_cols <- year_cols[order(year_nums)]

normalize_crop <- function(x) {
  x <- tolower(trimws(as.character(x)))
  x[x == ""] <- NA_character_
  x
}

# Mark the middle element of each NON-overlapping triple within each contiguous run of 'target'
# Example run of length 10: marks positions 2,5,8,... within that run
mark_triples_nonoverlap <- function(v, target) {
  n <- length(v)
  mark <- rep(FALSE, n)
  i <- 1
  while (i <= n) {
    if (!is.na(v[i]) && v[i] == target) {
      start <- i
      while (i <= n && !is.na(v[i]) && v[i] == target) i <- i + 1
      end <- i - 1

      k <- start
      while (k + 2 <= end) {
        mark[k + 1] <- TRUE  # middle of [k, k+1, k+2]
        k <- k + 3
      }
    } else {
      i <- i + 1
    }
  }
  mark
}

# Return both the updated row and a compact "change log" for this row
apply_rules_one_row <- function(v_raw, col_names) {
  v0 <- normalize_crop(v_raw)  # ORIGINAL normalized (used for marking)

  m_alfa <- mark_triples_nonoverlap(v0, "alfa")
  m_fesc_mgt <- mark_triples_nonoverlap(v0, "fesc_mgt")
  m_oats <- mark_triples_nonoverlap(v0, "oats")

  out <- v0
  out[m_alfa] <- "oats"
  out[m_fesc_mgt] <- "oats"
  out[m_oats] <- "csil"

  # Build a per-cell change log (based on ORIGINAL v0 vs out; no cascading)
  changed_idx <- which(!is.na(v0) & v0 != out)
  # Note: if v0 is NA, we don't consider it a "change" (rule never marks NA anyway)

  changes <- NULL
  if (length(changed_idx) > 0) {
    changes <- data.frame(
      col   = col_names[changed_idx],
      year  = as.integer(sub("^y_", "", col_names[changed_idx])),
      from  = v0[changed_idx],
      to    = out[changed_idx],
      stringsAsFactors = FALSE
    )
  }

  # Restore blanks as single space (matches your file style)
  out2 <- out
  out2[is.na(out2)] <- " "

  list(out = out2, changes = changes)
}

rot_mat <- as.matrix(df[, year_cols, drop = FALSE])

# Apply row-by-row so we can collect changed row numbers
changed_rows <- integer(0)
all_changes_list <- vector("list", nrow(rot_mat))

rot_new <- rot_mat
for (r in seq_len(nrow(rot_mat))) {
  res <- apply_rules_one_row(rot_mat[r, ], year_cols)
  rot_new[r, ] <- res$out

  if (!is.null(res$changes) && nrow(res$changes) > 0) {
    changed_rows <- c(changed_rows, r)
    res$changes$row_number <- r
    all_changes_list[[r]] <- res$changes
  }
}

df[, year_cols] <- rot_new

# Write updated rotation file
write.table(df, file = output_path, sep = ",", row.names = FALSE, col.names = TRUE, quote = FALSE)
cat("Wrote:", output_path, "\n")

# Write changed rows file (1 row per changed input row)
# plus an optional detailed file (cell-level) if you want.
changed_rows_df <- data.frame(row_number = sort(unique(changed_rows)))
write.csv(changed_rows_df, changes_path, row.names = FALSE)
cat("Wrote:", changes_path, "\n")

# OPTIONAL: detailed per-cell changes (uncomment if useful)
details_path <- sub("\\.csv$", "_changed_cells.csv", input_path)
details_df <- do.call(rbind, all_changes_list)
if (!is.null(details_df) && nrow(details_df) > 0) {
  details_df <- details_df[, c("row_number", "col", "year", "from", "to")]
  write.csv(details_df, details_path, row.names = FALSE)
  cat("Wrote:", details_path, "\n")
} else {
  cat("No changes detected; no detailed file written.\n")
}
