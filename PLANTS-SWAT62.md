+# SWAT+ revision 62 plant-table migration

## Why `agrc` appeared

The supplied `plants.plt` has 53 fields per row. SWAT+ 62.0.0 reads three
additional lignin fields: `avg_lig_frac`, `ab_lig_frac`, and
`bg_lig_frac`. With a short row, the Fortran list-directed reader continues
into the next physical line. The executable therefore loads the odd-numbered
plant rows and consumes the first three values of each even-numbered row as
data for the preceding plant.

The affected setup placed `csil`, `fesc_mgt`, `lupn`, `oats`, `rnge`, `rye`,
and `trit` on even-numbered rows. SWAT+ recorded each as “not found in
plants.plt database” in `diagnostics.out`. Its unresolved plant index retained
the default value 1, which is `agrc`, so the SWATdoctR plots showed `agrc`
although `management.sch` contained the intended crop names.

## Migration applied

The workflow now calls
`SWATreadR::swat_migrate_plants_rev62()` after every setup migration. It:

- preserves all 268 supplied plant rows and their calibrated values;
- renames `wnd_dead` and `wnd_flat` to the revision 62 residue fields
  `rsd_pctcov` and `rsd_covfac`;
- appends `avg_lig_frac = 0.85`, `ab_lig_frac = 0.15`, and
  `bg_lig_frac = 0.12` to every row;
- leaves already-migrated 56-column files unchanged.

Those three defaults match the values assigned internally by SWAT+ 62 when the
carbon model is disabled. This workflow still rejects carbon-enabled migration,
because carbon-enabled projects require project-specific inputs and review.

## Downloaded SQLite comparison

The downloaded `swatplus_datasets.sqlite` contains 266 rows in
`plants_plt`, compared with 268 rows in the supplied calibrated text file.
It confirms the residue-column rename, but its table does not contain the three
lignin fields read by the revision 62 executable.

Replacing the supplied table wholesale would also remove 17 plant definitions,
including workflow crops such as `buck`, `fesc_mgt`, `lmix`, and `lupn`.
The migration therefore keeps the supplied plant table and updates its text
schema instead of replacing it with the SQLite table.

## Verification

A 2004–2023 run with the Intel revision 62 executable completed after the
migration. No “not found in plants.plt” diagnostics remained, and
`mgt_out.txt` reported the intended crops, including `fesc_mgt`, `lmix`,
`oats`, `lupn`, `rye`, and `trit`.

SWATdoctR now stops before plotting if future runs contain unresolved plant
diagnostics, so this error cannot silently produce another report.

## Official source references

- [SWAT+ 62.0.0 plant data structure](https://github.com/swat-model/swatplus/blob/62.0.0/src/plant_data_module.f90)
- [SWAT+ 62.0.0 plant-table reader](https://github.com/swat-model/swatplus/blob/62.0.0/src/plant_parm_read.f90)
- [SWAT+ 62.0.0 reference plant table](https://github.com/swat-model/swatplus/blob/62.0.0/refdata/Ames_sub1/plants.plt)
