# Read an existing verification run without executing SWAT+ again.
source("../swat62.R")
swat62_require(c("SWATreadR", "SWATdoctR"))
library(SWATdoctR)

# Replace this placeholder with the actual retained run directory.
# New runs use a child directory under .run_verify; keep_folder = TRUE retains it.
run_folder <- "path/to/retained/verification-run"
if (!dir.exists(run_folder)) stop("Set run_folder to your retained verification run.")
Run_1 <- read_swat_verification(run_folder, outputs = c("wb", "mgt", "plt"))
