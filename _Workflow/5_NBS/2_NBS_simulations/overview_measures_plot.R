# -------------------------------------------------------------------------
# Script for NSWRM overview plots -----------------------------------------
# Version 0.1
# Date: 2024-03-22
# Developer: Michael Strauch michael.strauch@ufz.de
#            Christoph Schürz christoph.schuerz@ufz.de
# -------------------------------------------------------------------------

# Function definition -----------------------------------------------------
## Load a package from the pinned bundle library.
load_install <- function(pkg_name) {
  if(!pkg_name %in% rownames(installed.packages())) {
    stop('Missing pinned package ', pkg_name, '. Run install_or_repair_packages.bat from the bundle root.')
  }
  library(pkg_name, character.only = TRUE)
}

# Shows all point shapes, adapted from the ggpubr package
show_point_shapes <- function () {
  d <- data.frame(p = c(0:25))
  p <- ggplot(data = d, aes(x = p%%6, y = p%/%6, shape = p, label = p)) + 
    scale_shape_identity() + 
    geom_point(size = 5, fill = "red1") + 
    geom_text(aes(y = p%/%6 + 0.25), 
              size = 3) + 
    scale_y_reverse() + 
    theme_void()
  return(p)
}

# Creates a polygon layer for a defined measure
get_layer <- function(measure, dissolve=T){
  if(dissolve){
    measure_name <- loca$name[which(loca$nswrm == measure)]
    hru_id <- loca$obj_id[which(loca$nswrm == measure)]
    layer_m <- hru[unlist(hru_id),]
    layer_m$measure_name <- rep(measure_name, times = lengths(hru_id), 
                                length.out = NA, each = 1)
    layer_dsv <- sf_dissolve(layer_m, y='measure_name')
  }else{
    measure_name <- loca$name[which(loca$nswrm == measure)]
    hru_id <- loca$obj_id[which(loca$nswrm == measure)]
    layer_m <- hru[unlist(hru_id),]
  }
  
}

# Load R packages ---------------------------------------------------------
load_install('tmap')
load_install('terra')
load_install('sf')
load_install('tidyverse')
teal_pal <- grDevices::hcl.colors(7, palette = 'Teal')
library(SWATmeasR)

# Settings ----------------------------------------------------------------
## Define path to your buildR project folder
buildr_path <- './vector'

## Define the directory of your SWATmeasR project
measr_path <- './txt'

## Define name of your measR project
measr_name <- 'demo_nbs'

## Define path where maps should be saved
output_path <- './scenario_outputs'

## Load measR project and get measure location ----------------------------
load_measr(paste0(measr_path, '/', measr_name,'.measr'))
assign('measr', get(gsub('.measr', '', measr_name)))

loca <- measr$.data$nswrm_definition$nswrm_locations

# Load and prepare vector layers from the buildR project ------------------
## Basin boundary
basin   <- read_sf(paste0(buildr_path, '/basin.shp'))
## Reservoir layer
res     <- read_sf(paste0(buildr_path, '/res.shp')) %>% 
  mutate(type = 'reservoir')
## Channel layer
channel <- read_sf(paste0(buildr_path, '/cha.shp')) %>% 
  mutate(type = 'channel')
## HRU layer
hru <- read_sf(paste0(buildr_path, '/hru.shp'))

## Prepare the scenario layers for plotting -------------------------------------
unique(loca$nswrm) # watch your measure names

## define layers for each measure by subsetting the hru layer
# adjust for all your measures

covcrop <- get_layer('covcrop')
rotation <- get_layer('rotation')
afforestation <- get_layer('afforestation')
pond <- get_layer('pond')

## create point layer (centroid) for structural measures

#rotation_p <- st_point_on_surface(rotation)
pond_p <- st_point_on_surface(pond)
# buffer_p <- get_layer('afforestation')

# Plotting maps -----------------------------------------------------------
## Plot options for tmap
## It is recommended to keep most of the options as they were defined. 
## It may be necessary to change the legend positions or the aspect ratio (asp)
## if the legends overlap with the maps:
## - The legend position is defined by two arguments. The first is either 
##   'left' or 'right', the second is 'top' or 'bottom'. 
##   Capital letters move the legend even further to the plot margin.
## - The default of asp is set to 1 to have square plot panels. Values > 1 
##   generate wider plot panels and can give the legend more space but generates
##   a smaller map.
tmap_options(title.size = 1, # Size of a), b), c), d) (relative value)
             legend.text.size = 0.5, # Size of labels in legend (relative value)
             legend.title.size = 0.6, # Size of legend title (relative value)
             legend.title.fontface = 'bold', # Legend titles are bold
             legend.position = c('RIGHT', 'bottom'), # Legend position, here right and bottom (All caps e.g. push it to the VERY right margin)
             frame = F, # Plot panels are plotted without frames
             asp = 1, # Aspect ratio of plot panels, now plotted squared. Change if place for legend is too narrow. value > 1 = plot wider
             #max.categories = Inf
             ) # Ignore this

## Define the intervals of the scale bar, depending on the catchment size.
scale_bar_intervals <- c(0, 2.5, 5) #km

## Plot for the locations of nswrm
pond_map <- tm_shape(basin) + #adjust name of map
  tm_borders() +
  
  tm_shape(channel) +
  tm_lines(col = teal_pal[7], legend.col.show = F) +
  
  tm_shape(res) +
  tm_polygons(col = teal_pal[4], border.col = teal_pal[7]) +
  
  tm_shape(pond) +
  tm_polygons(col = '#b2df8a', border.col = '#4e6c39') +
  
  tm_shape(pond_p) +
  tm_symbols(shape = 1, col = '#c31619', size = 0.5,
             just = c('center', 'center'), 
             legend.col.show = F, 
             legend.shape.show = F) +
 
  tm_layout(title = paste0('Pond\n (n = ',       #adjust name of measure
                           dim(pond)[1], ')'))    #adjust name of layer


buffer_map <- tm_shape(basin) + #adjust name of map
  tm_borders() +
  
  tm_shape(channel) +
  tm_lines(col = teal_pal[7], legend.col.show = F) +
  
  tm_shape(res) +
  tm_polygons(col = teal_pal[4], border.col = teal_pal[7]) +
  
  tm_shape(buffer) +
  tm_polygons(col = '#b2df8a', border.col = '#4e6c39') +
  
  tm_shape(buffer_p) +
  tm_symbols(shape = 1, col = '#c31619', size = 0.5,
             just = c('center', 'center'), 
             legend.col.show = F, 
             legend.shape.show = F) +
  
  tm_layout(title = paste0('Buffer\n (n = ',       #adjust name of measure
                           dim(buffer)[1], ')'))    #adjust name of layer



# Plot of the management scenario layer
covcrop_map <- tm_shape(basin) + #adjust name of map
  tm_borders() +
  
  tm_shape(channel) +
  tm_lines(col = teal_pal[7], legend.col.show = F) +
  
  tm_shape(res) +
  tm_polygons(col = teal_pal[4], border.col = teal_pal[7]) +
  
  tm_shape(covcrop) +
  tm_polygons(col = 'burlywood2', border.col = 'burlywood4', 
              lwd = 0.02) +

  tm_layout(title = 'Cover crop') + #adjust name of measure
  tm_compass(size = 1.5, position = 'RIGHT') +
  tm_scale_bar(breaks = scale_bar_intervals, text.size = 0.5, 
               position = 'RIGHT')


rotation_map <- tm_shape(basin) + #adjust name of map
  tm_borders() +
  
  tm_shape(channel) +
  tm_lines(col = teal_pal[7], legend.col.show = F) +
  
  tm_shape(res) +
  tm_polygons(col = teal_pal[4], border.col = teal_pal[7]) +
  
  tm_shape(rotation) +
  tm_polygons(col = 'burlywood2', border.col = 'burlywood4', 
              lwd = 0.02) +
  
  tm_layout(title = 'Rotation') + #adjust name of measure
  tm_compass(size = 1.5, position = 'RIGHT') +
  tm_scale_bar(breaks = scale_bar_intervals, text.size = 0.5, 
               position = 'RIGHT')



# Combine all plot panels to the overview map
overview_map <- tmap_arrange(buffer_map, #adjust name of maps
                             rotation_map, 
                             pond_map, 
                             covcrop_map,
                             ncol = 2)



# Save the plot
tmap_save(overview_map, 
          paste0(output_path, '/measure_overview_map.png'),
          width = 7,
          height = 10) # adjust height based on number of measures (use 7 if n<5)
