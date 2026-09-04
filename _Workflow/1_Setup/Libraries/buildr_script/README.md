## SWATbuildR script version

### Change log

#### v 0.15.1 (2022-10-27)

##### Fix

- Fix issue #26 'Channel layer' `'object 'cha_not_con_res' not found'` 

#### v 0.15.0 (2022-10-26)

##### Update

- Implement function `check_layer_attributes()` for land and channel layers to check if the correct attributes are provided and to check if `id`s are unique.
- Modify `check_land_connectivity_loops()` to also work with water object connectivities. More general function is now `check_infinite_loops()`.
- Added function `prepare_water_links()` to prepare `id_from` and `id_to` for water objects to be used in `check_infinite_loops()`
