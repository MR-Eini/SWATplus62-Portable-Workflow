# SWATdoctR 0.1.32

* Require SWATreadR 0.1.0.9015, which reads standard and management outputs in
  bounded chunks instead of joining an entire large file into one R string.
* Read other verification tables with explicit whitespace and disabled quotes;
  stop on parser warnings rather than returning partially read data.
* Add `read_swat_verification()` to recover outputs from a saved run without
  executing SWAT+ again or modifying the saved folder.
* Missing optional recall/exco files remain optional; malformed existing files
  now raise an error instead of silently dropping their data.

# SWATdoctR 0.1.27

* Removed redundant code and functions connected to soft-calibration. Soft-calibration is now implemented in the `SWATtunR` package, which is more suitable for this purpose. The code was removed to avoid confusion and to streamline the package.
* Bug fixes in the `report_mgt()` function. The function now correctly reports management schedules.

# SWATdoctR 0.1.26

* Updated the code to support the latest version of the SWAT+ model (most recently tested on SWAT+ v61.0.2.11).

# SWATdoctR 0.1.25

* Site for version 0.1.25 created on 2025-11-18
