# SWATreadR 0.1.0.9015

* Stream standard SWAT+ and management outputs in bounded chunks; remove the
  whole-file string construction that exceeds R's 2^31-1-byte string limit.
* Preserve record order, adjacent revision 62 HRU labels, and annual calibration
  metadata. Reject malformed rows and inconsistent schemas across chunks.
* Add `chunk_rows` to `read_swat_output()` and `read_swat_mgt()` (default 10000).
  The final returned tibble still requires enough memory for the complete table.
* Files larger than 256 MiB use two passes and preallocate the result by column,
  avoiding a second full-table copy while binding chunks.
* Correct an internal tibble import and documentation argument, and resolve
  package-check metadata and tidy-evaluation declarations.
