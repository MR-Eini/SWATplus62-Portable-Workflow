## Check if the reference system of the project and a layer differ
## 
#' @param layer GIS layer for which the reference system is compared to the project
#'   CRS
#' @param data_path Path of the project data folder
#' @param proj_layer Boolean input to define if the layer should be projected.
#' @param label Layer name which is  printed in case of an error message
#' @param type String that defines layer type 'raster' for terra raster layers
#'   and 'shp' for sf vector layers 
#'   
check_project_crs <- function(layer, data_path, proj_layer, label, type) {
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  proj_wkt <- dbReadTable(db, 'project.wkt', proj_wkt) %>% 
    unlist(.)
  dbDisconnect(db)
  # Read crs of layer. Different routines for raster and vector
  if(type == 'raster') {
    layer_wkt <- crs(layer)
  } else {
    layer_wkt <- st_crs(layer)$wkt
  }
  
  # Return error message if layer crs and project crs differ
  if(layer_wkt != proj_wkt) {
    if (proj_layer) {
      if(type == 'raster') {
        layer <- project(layer, proj_wkt)
      } else {
        layer <- st_transform(layer, proj_wkt)
      }
    } else {
      stop('The reference system of the ', label, 'layer is different to the ',
           'reference system of the basin boundary. Please use the same ',
           'reference system for all input layers.')
    }
    
  }
  return(layer)
}

## Write the project CRS into the tables data base
## 
#' @param bound Basin boundary vector layer
#' @param data_path Path of the project data folder
#' 
set_proj_crs <- function(bound, data_path) {
  proj_wkt <- tibble(wkt = st_crs(bound)$wkt)
  
  db_path <- paste0(data_path, '/tables.sqlite')
  db <- dbConnect(SQLite(), db_path)
  dbWriteTable(db, 'project.wkt', proj_wkt, overwrite = TRUE)
  dbDisconnect(db)
}

## Check if the layer attributes at least contain the names 'id' and 'type'.
## Further check if 'ids' are unique and convert to lower case 'type' if 
## wanted.
## 
#' @param layer Vector polygon layer as sf object.
#' @param type_to_lower Boolean input to define if the type labels should be 
#' converted to all lower case labels.
#' 
check_layer_attributes <- function(layer, type_to_lower) {
  missing_colnames <- !c('id', 'type') %in% colnames(layer)
  miss_text <- paste(c("'id'", "'type'")[missing_colnames], collapse = ' and ')
  if(any(missing_colnames)) {
    stop("The input layer must at least have an 'id' and a 'type' column. \n",
         miss_text, ' missing in the layer attributes')
  }
  
  # Include if clause to be compatible with old version of land layer columns
  if ('drainage' %in% colnames(layer)) {
    layer <- layer %>% 
      rename(cha_id = drainage) %>% 
      mutate(cha_id = ifelse(cha_id <= 0 | is.na(cha_id), NA, cha_id)) %>% 
      mutate(flow = ifelse(!is.na(cha_id), 'til', NA), .after = cha_id) 
  }
  
  layer <- select(layer, any_of(c('id', 'type', 'cha_id', 'flow')))
  
  id_count <- table(layer$id)
  id_non_unique <- id_count > 1
  if(any(id_non_unique)) {
    stop("The following 'id's of the layer are not unique: \n",
         paste(names(id_count)[id_non_unique], collapse = ', '),
         '\n\n Update the ids of this layer that each features has a unique id.')
  }
  
  if (type_to_lower) {
    layer$type <- tolower(layer$type)
  }
  
  return(layer)
}

## Check different polygon properties before writing it into the project
## data folder.
## The function intersects the input polygon layer with the basin 
## boundary layer.
## With the intersected layer toplogical checks are performed to check 
## for MULTIPOLYGON features, small polygons, covered, and overlapping
## features.
## The function returns the intersected layer if all checks ran 
## without any identified issues.
## Otherwise vector layers are written to the 'vct_path' containing the
## features that caused issues in the respective checks.
## If at least one check identifies an issue, an error is triggered.
## 
#' @param layer Vector polygon layer
#' @param data_path Path of the project data folder
#' @param label Layer name to print in error message
#' @param n_feat Integer value which defines the exact number of features
#'   the layer must have
#' @param area_fct Numeric value to define what amount of the Q25 of area
#'   should be used to calculate threshold for small polygons
#' @param cvrg_fct Numeric value to define the coverage fraction of the 
#'   layer with respect to the basin boundary area
#' @param checks Boolean vector of length 8 to turn on and off specific 
#'   checks
#' 
check_polygon_topology <- function(layer, data_path, label, n_feat = NULL,
                                   area_fct = 0, cvrg_frc = 99.9, 
                                   checks = rep(TRUE, 8)) {
  
  if('fid' %in% names(layer)) {
    layer <- select(layer, -fid)
  }
  
  if(file.exists(paste0(data_path, '/vector/', label, '_topological_issues.gpkg'))) {
    suppressMessages(file.remove(paste0(data_path, '/vector/', label, '_topological_issues.gpkg')))
  }
  if(file.exists(paste0(data_path, '/vector/', label, '_removed.gpkg'))) {
    suppressMessages(file.remove(paste0(data_path, '/vector/', label, '_removed.gpkg')))
  }
  
  cat('Running topological checks and modifications for the', label, 'layer:\n\n')
  
  if(checks[1]) {
    # Intersect shape layer with basin boundary layer
    cat('Intersection of', label, 'layer with basin boundary layer...\n')
    bound <- read_sf(paste0(data_path, '/vector/basin.shp')) %>% 
      select()
    layer_bnd <- st_intersection(layer, bound) %>% suppressWarnings(.)
    n_rmv <- nrow(layer) - nrow(layer_bnd)
    if (n_rmv == 0) {
      cat(green('  \U2714 '), 'Intersection completed.\n')
    } else if (n_rmv > 0) {
      layer_rmv <- layer[!layer$id %in% layer_bnd$id, ]
      layer <- layer[layer$id %in% layer_bnd$id, ]
      write_sf(layer_rmv, paste0(data_path, '/vector/', label, '_removed.gpkg'))
      cat(green('  \U2714 '), 'Intersection completed.', n_rmv, 
          print_plural('feature', n_rmv), 'removed from the', label,
          'layer (located outside of the basin boundary).\n')
    } else {
      stop('Number of features larger after intersect than before. Non intended behavior!')
    }
    int_word <- 'intersected'
  } else {
    layer_bnd <- layer
    int_word <- 'checked'
  }
  
  if(checks[2]) {
    cat('Analyzing', label, 'layer for specific number of features...\n')
    n_layer <- nrow(layer_bnd)
    has_wrongn <- n_feat != n_layer
    
    if(has_wrongn) {
      cat(red('  \U2718 '), 'Exactly', n_feat, print_plural('feature', n_feat), 
          'requested for', label, 'layer, but', n_layer, 
          print_plural('feature', n_layer), 'features provided.\n')
    } else {
      cat(green('  \U2714 '), 'Number of features correct.\n')
    }
  } else {
    has_wrongn <- FALSE
  }
  
  if(checks[3]) {
    # Compare layer with itself but converted to single polygons to
    # identify if there are differences
    cat('Analyzing', label, 'layer for MULTIPOLYGON features...\n')
    is_multi <- layer_bnd %>%
      st_equals(., st_cast(., 'POLYGON', warn = F), sparse = T) %>%
      suppressWarnings(.) %>% 
      map_lgl(., ~ length(.x) == 0)
    n_multi <- sum(is_multi)
    has_multi <- n_multi > 0
    
    if(has_multi) {
      cat(red('  \U2718 '), n_multi, 'MULTIPOLYGON', print_plural('feature', n_multi), 
          'identified', 'after intersection with basin boundary.\n')
      
      write_sf(bound, 
               dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
               layer = 'basin_boundary')
      write_sf(layer[is_multi, ], 
               dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
               layer = 'multipolygon_after_intersect')
    } else {
      cat(green('  \U2714 '), 'No MULTIPOLYGON features identified.\n')
    }
  } else {
    has_multi <- FALSE
  }
  
  if (checks[4]) {
    # Analyze layer after intersection with basin boundary if any features
    # are invalid polygons
    cat('Analyzing', label, 'layer for invalid features...\n')
    is_invalid <- !st_is_valid(layer)
    n_invalid <- sum(is_invalid)
    has_invalid <- n_invalid > 0
    
    if(has_invalid) {
      cat(red('  \U2718 '), n_invalid, 'invalid', print_plural('feature', n_invalid), 
          'identified', 'after intersection with basin boundary.\n')
      
      write_sf(bound, 
               dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
               layer = 'basin_boundary', overwrite = TRUE)
      write_sf(layer[is_invalid, ], 
               dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
               layer = 'invalid_features')
    } else {
      cat(green('  \U2714 '), 'No invalid features identified.\n')
    }
  } else {
    has_invalid <- FALSE
  }
  
  if (checks[5]) {
    # Calculate the area of all polygons in square meters
    cat('Analyzing', label, 'layer for very small feature areas...\n')
    area_m2 <- layer_bnd %>%
      st_area() %>% 
      set_units(., 'm2') %>% 
      as.numeric()
    
    # Identify all polygons where the area is smaller than 0.5% of Q25
    area_thrs <- round(area_fct * round(quantile(area_m2, 0.25)))
    is_small <- area_m2 < area_thrs
    n_small <- sum(is_small)
    has_small <- n_small > 0
    
    if(has_small) {
      cat(red('  \U2718 '), n_small, print_plural('feature', n_small), 
          'identified with an area <', area_thrs, 'm\U00B2 (is', area_fct, 
          '* Q25 of all areas)', 'after intersection with basin boundary.\n')
      
      write_sf(bound, 
               dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
               layer = 'basin_boundary', overwrite = TRUE)
      
      layer_small <- layer %>% 
        mutate(area_m2 = area_m2) %>% 
        filter(is_small)
      write_sf(layer_small, 
               dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
               layer = 'small_area_features')
    } else {
      cat(green('  \U2714 '), 'No small features identified.\n')
    }
  } else {
    has_small <- FALSE
  }
  
  if (checks[6]) {
    cat('Analyzing', label, 'layer for features covered by other features...\n')
    layer_covr <- st_covers(layer, layer, remove_self = TRUE)
    n_covr <- length(unlist(layer_covr))
    has_covr <- n_covr > 0
    
    if(has_covr) {
      is_covr <- which(map_lgl(layer_covr, ~ length(.x) > 0)) %>% 
        c(., unlist(layer_covr)) %>% 
        unique()
      
      cat(red('  \U2718 '), n_covr, print_plural('feature', n_covr), 
          'covered by other', print_plural('feature', n_covr), 'identified.\n')
      write_sf(layer[is_covr, ], 
               dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
               layer = 'covered_features')
    } else {
      cat(green('  \U2714 '), 'No covered features identified.\n')
    }
  }else {
    has_covr <- FALSE
  }
  
  if (checks[7]) {
    cat('Analyzing', label, 'layer for overlapping features...\n')
    layer_bf <- st_buffer(layer, - set_units(0.25, m))
    # layer_ovrl <- st_intersects(layer_bf, layer_bf, remove_self = TRUE)
    layer_ovrl <- st_overlaps(layer_bf, layer_bf)
    n_ovrl <- length(unlist(layer_ovrl))
    has_ovrl <- n_ovrl > 0
    
    if(has_ovrl) {
      is_ovrl <- which(map_lgl(layer_ovrl, ~ length(.x) > 0)) %>% 
        c(., unlist(layer_ovrl)) %>% 
        unique()
      
      cat(red('  \U2718 '), n_ovrl, print_plural('overlap', n_ovrl), 
          'between features identified.\n')
      write_sf(layer[is_ovrl, ], 
               dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
               layer = 'overlapping_features')
    } else {
      cat(green('  \U2714 '), 'No overlapping features identified.\n')
      
    }
  } else {
    has_ovrl <- FALSE
  }
  
  if (checks[8]) {
    cat('Analyzing', label, 'layer coverage with basin boundary...\n')
    layer_area <- layer_bnd %>% 
      st_area() %>% 
      set_units(., 'm2') %>% 
      as.numeric() %>% 
      sum()
    bound_area <- bound %>% 
      st_area() %>% 
      set_units(., 'm2') %>% 
      as.numeric() %>% 
      sum()
    layer_area_frc <- 100 * layer_area / bound_area
    has_low_cvrg <- layer_area_frc < cvrg_frc
    
    if(has_low_cvrg) {
      cat(red('  \U2718 '), 'The ', label, ' layer only covers ', 
          sprintf('%.2f', cvrg_frc), 
          '% of the basin area.\n')
    } else {
      cat(green('  \U2714 '), 'Layer coverage OK.\n')
      
    }
  } else {
    has_low_cvrg <- FALSE
  }
  
  cat('\n')
  
  # Return error message that lists all identified polygons if any found
  has_issue <- c(has_wrongn, has_multi, has_invalid, has_small, has_covr, 
                 has_ovrl, has_low_cvrg)
  if(any(has_issue)) {
    if(any(has_issue[2:6])) {
      msg_write_gpkg <- c('Writing the layer ', label, 
                          '_topological_issues.gpkg',
                          " into '", data_path, '/vector', "'\n\n",
                          'Load the .gpkg layer in a GIS to analyze ',
                          'the features that cause issues. \n')
    } else {
      msg_write_gpkg <- ''
    }
    
    stop('\n\nTopological issues for the ', label, ' layer identified!\n\n',
         msg_write_gpkg,
         'Fix the issues in the ', label, ' layer before ',
         'proceeding with the model setup.'
    )
  } else {
    cat('\n', green(' \U2714 '), 
        'All checks successful! Saving', int_word,
        label, 'layer.\n\n')
    layer_bnd %>% 
      write_shp(., label, paste0(data_path, '/vector'))
  }
}


## Check different line feature properties before writing it into the project
## data folder.
## The function intersects the input line layer with the basin boundary layer.
## With the intersected layer toplogical checks are performed to check 
## for MULTILINE features, invalid features, short features and crossing
## features.
## The function returns the intersected layer if all checks run 
## without any identified issues.
## Otherwise vector layers are written to the project data/vector folder 
## containing the features that caused issues in the respective checks.
## If at least one check identifies an issue, an error is triggered.
## 
#' @param layer Line feature layer
#' @param data_path Path of the project data folder
#' @param label Layer name to print in error message
#' @param length_fct Numeric value to define what amount of the Q25 of length
#'   should be used to calculate threshold for short line features.
#' @param can_cross Boolean value to allow or restrict crossing features (this
#'   may be relevant to ignore channel underpasses and not trigger an error in 
#'   such a case)
#' 
check_line_topology <- function(layer, data_path, label, length_fct, can_cross = FALSE) {
  bound <- read_sf(paste0(data_path, '/vector/basin.shp')) %>% 
    select()
  
  if(file.exists(paste0(data_path, '/vector/', label, '_topological_issues.gpkg'))) {
    suppressMessages(file.remove(paste0(data_path, '/vector/', label, '_topological_issues.gpkg')))
  }
  if(file.exists(paste0(data_path, '/vector/', label, '_removed.gpkg'))) {
    suppressMessages(file.remove(paste0(data_path, '/vector/', label, '_removed.gpkg')))
  }
  
  cat('Running topological checks and modifications for the', label, 'layer:\n\n')
  
  # Intersect shape layer with basin boundary layer
  cat('Intersection of', label, 'layer with basin boundary layer...\n')
  layer_bnd <- st_intersection(layer, bound) %>% suppressWarnings(.)
  n_rmv <- nrow(layer) - nrow(layer_bnd)
  if (n_rmv == 0) {
    cat(green('  \U2714 '), 'Intersection completed.\n')
  } else if (n_rmv > 0) {
    layer_rmv <- layer[!layer$id %in% layer_bnd$id, ]
    layer <- layer[layer$id %in% layer_bnd$id, ]
    write_sf(layer_rmv, paste0(data_path, '/vector/', label, '_removed.gpkg'))
    cat(green('  \U2714 '), 'Intersection completed.', n_rmv, 
        print_plural('feature', n_rmv), 'removed from the', label,
        'layer (located outside of the basin boundary).\n')
  } else {
    stop('Number of features larger after intersect than before. Non intended behavior!')
  }
  
  # Compare layer with itself but converted to single linestrings to
  # identify if there are differences
  cat('Analyzing', label, 'layer for MULTILINE features...\n')
  is_multi <- layer_bnd %>%
    st_equals(., st_cast(., 'LINESTRING', warn = F), sparse = T) %>%
    suppressWarnings(.) %>% 
    map_lgl(., ~ length(.x) == 0)
  n_multi <- sum(is_multi)
  has_multi <- n_multi > 0
  
  if(has_multi) {
    cat(red('  \U2718 '), n_multi, 'MULTILINE', print_plural('feature', n_multi), 
        'identified', 'after intersection with basin boundary.\n')
    
    write_sf(bound, 
             dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
             layer = 'basin_boundary')
    write_sf(layer[is_multi, ], 
             dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
             layer = 'multiline_after_intersect')
  } else {
    cat(green('  \U2714 '), 'No MULTILINE features identified.\n')
  }
  
  # Analyze layer after intersection with basin boundary if any features
  # are invalid polygons
  cat('Analyzing', label, 'layer for invalid features...\n')
  is_invalid <- !st_is_valid(layer_bnd)
  n_invalid <- sum(is_invalid)
  has_invalid <- n_invalid > 0
  
  if(has_invalid) {
    cat(red('  \U2718 '), n_invalid, 'invalid', print_plural('feature', n_invalid), 
        'identified', 'after intersection with basin boundary.\n')
    
    write_sf(bound, 
             dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
             layer = 'basin_boundary', overwrite = TRUE)
    write_sf(layer[is_invalid, ], 
             dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
             layer = 'invalid_features')
  } else {
    cat(green('  \U2714 '), 'No invalid features identified.\n')
  }
  
  # Calculate the area of all polygons in square meters
  cat('Analyzing', label, 'layer for very short feature lengths...\n')
  length_m <- layer_bnd %>%
    st_length() %>% 
    set_units(., 'm') %>% 
    as.numeric()
  
  # Identify all polygons where the area is smaller than 0.5% of Q25
  length_thrs <- round(length_fct * quantile(length_m, 0.25), 1)
  is_small <- length_m < length_thrs
  n_small <- sum(is_small)
  has_small <- n_small > 0
  
  if(has_small) {
    cat(red('  \U2718 '), n_small, print_plural('feature', n_small), 
        'identified with a length <', length_thrs, 'm (is', length_fct, 
        '* Q25 of all lengths)', 'after intersection with basin boundary.\n')
    
    write_sf(bound, 
             dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
             layer = 'basin_boundary', overwrite = TRUE)
    write_sf(layer[is_small, ], 
             dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
             layer = 'short_line_features')
  } else {
    cat(green('  \U2714 '), 'No small features identified.\n')
  }
  
  if(!can_cross) {
    cat('Analyzing', label, 'layer for crossing features...\n')
    layer_cross <- st_crosses(layer_bnd, layer_bnd, remove_self = TRUE)
    n_cross <- length(unlist(layer_cross))
    has_cross <- n_cross > 0
    
    if(has_cross) {
      is_cross <- which(map_lgl(layer_cross, ~ length(.x) > 0)) %>% 
        c(., unlist(layer_cross)) %>% 
        unique()
      
      cat(red('  \U2718 '), n_cross, print_plural('crossing', n_cross), 'between features identified.\n')
      write_sf(layer[is_cross, ], 
               dsn = paste0(data_path, '/vector/', label, '_topological_issues.gpkg'),
               layer = 'crossing_features')
    } else {
      cat(green('  \U2714 '), 'No crossing features identified.\n')
    }
  } else {
    has_cross <- FALSE
  }
  
  # Return error message that lists all identified polygons if any found
  has_issue <- c(has_multi, has_invalid, has_small, has_cross)
  if(any(has_issue)) {
    stop('\n\nTopological issues for the ', label, ' layer identified!\n\n',
         'Writing the layer ', label, '_topological_issues.gpkg',
         " into '", data_path, '/vector', "'\n\n",
         'Load the .gpkg layer in a GIS to analyze the features that cause issues. \n',
         'Fix the issues in the ', label, ' layer before ',
         'proceeding with the model setup.'
    )
  } else {
    cat('\n', green(' \U2714 '), 
        'All checks successful! Saving intersected', 
        label, 'layer.\n\n')
    layer_bnd %>% 
      # init_obj_layer(., label) %>% 
      write_shp(., label, paste0(data_path, '/vector'))
  }
}

## Check the area coverage of a polygon vector layer compared to the area
## of the basin boundary. The function triggers an error if the area fraction
## of 'shp' to 'bound' is lower than the value defined with 'coverage'.
## 
#' @param layer Polygon vector layer
#' @param bound Basin boundary layer
#' @param label Layer name to print in error message
#' @param coverage Numeric coverage threshold value in percent.
#' 
check_vector_coverage <- function(layer, bound, label, coverage) {
  layer_area <- layer %>% st_area() %>% set_units(., 'm2') %>% as.numeric() %>% sum()
  bound_area <- bound %>% st_area() %>% set_units(., 'm2') %>% as.numeric() %>% sum()
  area_frc <- 100 * layer_area / bound_area
  if(area_frc < coverage) {
    stop('\nThe ', label, ' layer only covers ', sprintf('%.2f', area_frc), 
         '% of the area defined by the basin boundary.\n',
         'Please add the missing areas in the ', label, ' layer before proceeding!'
    )
  }
}

## Check the coverage of a raster layer input for the land layer polygons
## The functions returns an error if the coverage of a polygon is < 80%
## 
#' @param rst Raster layer
#' @param vct_layer Name of the vector layer to analyze coverage for.
#' @param data_path Path of the project data folder
#' @param label Layer name to print in error message
#' @param cov_frc Threshold value of area fraction of coverage for each polygon 
#'   feature to be covered by the raster layer.
#' 
check_raster_coverage <- function(rst, vct_layer, data_path, label, cov_frc) {
  # Create raster with ones where rst had values
  rst_cvrg <- classify(rst, matrix(c(-Inf, Inf, 1, NA, NA, 0), ncol = 3, byrow = T), others = 0)
  
  # Read the vector layer for which coverage should be analyzed
  layer <- read_sf(paste0(data_path,'/vector/', vct_layer, '.shp'))
  # Generate raster from land vector layer
  
  # Calculate the fractions of coverage between shp ids and the raster
  # layer. Identify coverages of below 'cov_frc'
  unit_low_cover <- zonal(rst_cvrg, vect(layer)) %>% 
    .[[1]]  < cov_frc
  
  # Return error message that lists all identified land ids where a
  # coverage of lower than 80% was identified (if any found)
  if(any(unit_low_cover)) {
    id_msg <- paste(layer$id[unit_low_cover], collapse = ', ')
    stop('\nThe units with the following ids do have a coverage by the ',
         label, ' layer of less than ', cov_frc*100, '%:\n', id_msg,
         '\nPlease update the ', label, ' layer for better coverage before you continue!'
    )
  }
}

## In the case of drainage (e.g. tile or total flow) from a land object to a 
## channel object, it is necessary to check if the defined channel ids exist.
## This routine performs checks for the defined drainage ids in the land layer.
## 
#' @param data_path Path of the project data folder
#' 
## In the case of drainage (e.g. tile or total flow) from a land object to a 
## channel object, it is necessary to check if the defined channel ids exist.
## This routine performs checks for the defined drainage ids in the land layer.
## 
#' @param data_path Path of the project data folder
#' 
check_land_drain_ids <- function(data_path) {
  land <- read_sf(paste0(data_path, '/vector/land.shp'))
  
  if ('cha_id' %in% names(land)) {
    if (any(!is.na(land$cha_id))) {
      cha_file <- paste0(data_path, '/vector/cha.shp')
      if (file.exists(cha_file)) {
        cha <- read_sf(cha_file)
        cha_ids <- cha$id_sel
        
        has_miss_cha_id <- !land$cha_id %in% cha_ids & !is.na(land$cha_id)
        cha_id_miss <- unique(land$cha_id[has_miss_cha_id])
        
        if(any(has_miss_cha_id)) {
          stop('\nThe land objects with the following ids defined drainage to \n',
               'channel ids which are not defined in the channel layer:\n  ',
               paste(land$id[has_miss_cha_id], collapse = ', '), '\n\n',
               'The following channel ids were not defined in the channel layer:\n  ',
               paste(cha_id_miss, collapse = ', '))
        }
        
      } else {
        stop('\n  Drainage from land objects to channels were defined in the land layer,\n',
             '  but no channel layer was found!')
      }
    }
  }
}
