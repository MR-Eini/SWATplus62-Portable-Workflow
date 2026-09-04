library(SWATdoctR)
library(grid)
library(gridExtra)

# The setting that controls the plant stress can be manipulated with the input 
# argument nostress, i.e., nostress = 0 activates all stress factors for plant 
# growth in the simulation, nostress = 1 deactivates all stress factors, and 
# nostress = 2 deactivates only nutrient stresses. 
# Deactivating plant stresses can be useful for the first three verification 
# steps. If the first check of the climate variables and management were passed,
# the verification of plant growth without plant stresses can be immediately
# performed with the same simulation outputs without having to repeat the simulation runs.
# https://doi.org/10.1016/j.envsoft.2023.105878

setup_path <- "../1_Setup/Temp/clean_setup"

# nostress = 0 activates all stress factors for plant growth
Run_1 <- run_swat_verification(
  setup_path,
  outputs = c("wb", "mgt", "plt"),
  start_date = 20040101,
  end_date = 20231231,
  years_skip = 3,
  nostress = 0,
  keep_folder = FALSE
)


# nostress = 1 deactivates all stress factors
Run_2 <- run_swat_verification(
  setup_path,
  outputs = c("wb", "mgt", "plt"),
  start_date = 20040101,
  end_date = 20231231,
  years_skip = 3,
  nostress = 1,
  keep_folder = FALSE
)

# nostress = 2 deactivates only nutrient stresses
Run_3 <- run_swat_verification(
  setup_path,
  outputs = c("wb", "mgt", "plt"),
  start_date = 20040101,
  end_date = 20231231,
  years_skip = 3,
  nostress = 2,
  keep_folder = FALSE
)

sim_list <- list (all_str = Run_1, no_str = Run_2, nutrient_str = Run_3)

pdf("plots.pdf", width = 15, height = 25)  # General dimensions for the PDF

# Create a viewport for each plot with a different size and layout
# Climate Annual Plot
grid.newpage()
pushViewport(viewport(width = 0.8, height = 1))  # Adjust width and height as desired for this plot
print(plot_climate_annual(Run_1), newpage = FALSE)
popViewport()

# Monthly Snow Plot
grid.newpage()
pushViewport(viewport(width = 0.8, height = 0.3))
print(plot_monthly_snow(Run_1), newpage = FALSE)
popViewport()

# Water Balance Plot
grid.newpage()
pushViewport(viewport(width = 0.9, height = 10))
print(plot_waterbalance(Run_1, simplified = TRUE), newpage = FALSE)
popViewport()


# Water Balance Plot
grid.newpage()
pushViewport(viewport(width = 0.9, height = 10))
print(plot_waterbalance(Run_1), newpage = FALSE)
popViewport()

# Yield at Harvkill Plot
grid.newpage()
pushViewport(viewport(width = 0.7, height = 0.3))
print(plot_variable_at_harvkill(Run_1, variable = 'yield'), newpage = FALSE)
popViewport()

# PHU at Harvkill Plot
grid.newpage()
pushViewport(viewport(width = 0.7, height = 0.3))
print(plot_variable_at_harvkill(Run_1, variable = 'phu'), newpage = FALSE)
popViewport()

# Yield for sim_list at Harvkill Plot
grid.newpage()
pushViewport(viewport(width = 0.7, height = 0.3))
print(plot_variable_at_harvkill(sim_list, variable = 'yield'), newpage = FALSE)
popViewport()

# PHU for sim_list at Harvkill Plot
grid.newpage()
pushViewport(viewport(width = 0.7, height = 0.3))
print(plot_variable_at_harvkill(sim_list, variable = 'phu'), newpage = FALSE)
popViewport()

# Stress at Harvkill Plot
grid.newpage()
pushViewport(viewport(width = 0.8, height = 0.3))
print(plot_variable_at_harvkill(Run_1, variable = 'stress'), newpage = FALSE)
popViewport()

## PointSource Plot
# grid.newpage()
# pushViewport(viewport(width = 0.8, height = 0.3))
# print(plot_ps(Run_1), newpage = FALSE)
# popViewport()

# HRU PW Day Plot
grid.newpage()
pushViewport(viewport(width = 0.9, height = 0.5))
print(plot_hru_pw_day(Run_1,
                      ## select different crops using hur id
                      hru_id = c(103, 117, 160, 205, 274),
                      var = c('lai', 'bioms'),
                      years = 2010:2023,
                      add_crop = TRUE), newpage = FALSE)
popViewport()

# Close PDF file
dev.off()





