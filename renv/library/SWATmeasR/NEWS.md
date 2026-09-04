# 0.8.2 

## Minor

- Fix issue in input argument names of constr_wetland type measures
- Minor fix in update_landuse.

**SWATmeasR moved from UFZ GitLab to GitHub. All previous versions (tags) can be 
retrieved from the [SWATmeasR](https://git.ufz.de/schuerz/swatmeasr/) repositrory
at git.ufz.de**

# 0.8.0

Add implemented_nswrms table

- with every measure implementation now entries
  for changed objects (only HRUs so far) are
  added to the table .$modified_inputs$implemented_nswrms
- if measures was already implemented and other measure
  is implemented in the same HRU the entry will be
  replaced in this table.

# 0.7.0

- introduce SWATmeasR version as meta info
- implement aquifer recharge in pond connectivity

# 0.5.0

Now a single pond can be generated from multiple HRUs.
- The column hru_id in the pond settings now allows
  multiple HRU ids separated by ,
- area of the pond is the sum of areas of the replaced HRUs

# 0.2.0

- adds wetlands as NSWRMs
- adds the option to user define parameters for ponds and wetlands

# 0.1.0

This is the first working version which is fully compatible with the
NSWRMs in the Schoeps case study.
The following features are implemented:
- preparation of the input file which defines management related
  scenarios based on SWATfarmR objects.
- generating a measr project which is an R6 object with included
  methods. This will be useful when loaded in the optimization.
- loading NSWRM definitions now works for land_use, management,
  and pond type NSWRMs.
- writing the input files into the project
- resetting input files.
