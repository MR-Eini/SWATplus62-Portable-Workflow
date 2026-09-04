# NEWS for **spacesXYZ** package

### Version 1.6-0  [2025-06-06]

* for `standardXYZ()` replaced NAs by values computed from xy's
* for `standardxy()` replaced NAs by values computed from XYZ's


### Version 1.5-1  [2025-02-09]

* added new functions `CIECAM02fromXYZ()` and `DeltaE_CAM02()`, for color appearance modeling
* in function `planckLocus()`, changed the name of one argument


### Version 1.4-0  [2025-01-17]

* moved logging to package `logger`, which an Import


### Version 1.3-0  [2024-01-23]

* removed `exportClasses()` from `NAMESPACE`


### Version 1.2-1  [2022-04-01]

* fixed bug in `DeltaE()` for `metric=1994`; thanks to Ben Jann
* fixed some missing links in `CCT.Rd`


### Version 1.1-0  [2020-03-02]

* added new vignette _Chromatic Adaptation_
* added whitepoint `DCI`
* added `README.md` file
* added Bianco-Schettini cone response matrix
* in function `CAT()` allow argument `method` to be a 3x3 cone response matrix
* changed spelling of `D60.ACES` to simply `ACES`

### Version 1.0-3  [2018-12-04]

* added Planckian locus with higher precision
* fixed some errors in isotherms vignette

### Version 1.0-2  [2018-11-26]

* added 4 functions for working with CCT, and a vignette for them
* add function `daylightLocus()`
* added function `uvfromxy()`
* added function `standardxy()`
* in `uvfromXYZ()`, changed name of argument `version` to `space`
* in `DeltaE()` added CIE metrics for 1994 and 2000

### Version 1.0-1  [2018-07-06]

* initial version on CRAN
