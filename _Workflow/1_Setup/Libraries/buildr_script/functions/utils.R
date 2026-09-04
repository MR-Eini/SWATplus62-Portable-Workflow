## Calculate the modal value of a vector 
## 
#' @param v Numeric vector
#' 
mode <- function(v, na.rm = TRUE) {
  if (na.rm) {
    v <- v[!is.na(v)]
  }
  uniqv <- unique(v)
  uniqv[which.max(tabulate(match(v, uniqv)))]
}

## Create object names based on the 'id' column of the attribute table
## 
#' @param id Numeric id vector of the attribute table
#' @param prefix character prefix e.g. 'hru', 'cha', etc.
#' 
create_names <- function(id, prefix) {
  n_id <- length(id)
  n_digit <-  nchar(as.character(n_id))
  paste0(prefix, sprintf(paste0('%0',n_digit, 'd'), id))
}

## Initialize the base structure of the object vector layer attribute 
## tables. 
## 
#' @param layer Vector layer
#' @param name_prefix Character prefix e.g. 'hru', 'cha', etc.
#' 
init_obj_layer <- function(layer, name_prefix) {
  layer %>% 
    mutate(id     = 1:nrow(.),
           .before = 1) %>% 
    mutate(name   = create_names(id, name_prefix),
           gis_id = NA, # No gis ids required
           .after = id)
}

## Write vector layer as shapefile polygon
## 
#' @param layer Vector layer
#' @param name Name of the shapefile layer
#' @param path Path to write shape file to.
#' 
write_shp <- function(layer, name, path) {
  if(nrow(layer) > 0 ) {
    # if(!'id' %in% names(layer)) {
    #   layer <- mutate(layer, id = 1:nrow(layer))
    # }
    write_sf(layer, paste0(path, '/', name, '.shp'))
  }
}

## Add lat lon coordinates in WGS84 to the vector file attribute table.
## 
#' @param layer Vector layer
#' 
add_latlon <- function(layer) {
  # Calculate centroid points for all hrus
  layer_centroid <- st_centroid(layer) %>% suppressWarnings(.)
  
  # Cacluate lat long coordinates in wgs84
  layer_latlon <- layer_centroid %>%
    st_transform(., 4326) %>%
    st_coordinates()
  
  # Add lat lon coordinates to attribute table
  layer %>% 
    mutate(lat  = layer_latlon[,2],
           lon  = layer_latlon[,1])
}

## Extract start and end points of line features. The function returns a 
## list with two table start and end, holding the start and end points
## of the line features as point features.
## 
#' @param layer Vector linestring layer
#' 
get_line_endpoints <- function(layer) {
  strt_point <- layer %>% 
    st_startpoint() %>% 
    st_as_sf() %>% 
    mutate(id  = layer$id, .before = 1)
  
  end_point <- layer %>% 
    st_endpoint() %>% 
    st_as_sf() %>% 
    mutate(id  = layer$id, .before = 1)
  
  return(list(start = strt_point, 
              end   = end_point))
}

## Translate a label to a respective value.
## 
#' @param x Character vector with the labels to translate
#' @param lbl Character vector with the labels corresponding to the 
#'   parameter values.
#' @param val Numeric vector with the parameter values corresponding to 
#'   the labels.
#'
translate_par_value <- function(x, pot, val) {
  val[match(x, pot)]
}

#' Remove rows from table where all elements are NA
#'
#' @param tbl Tibble or data.frame
#'
remove_rows_all_na <- function(tbl) {
  is_all_na <- apply(tbl, 1, all_na)
  tbl[!is_all_na,]
}

#' Identifies if all elements of a vector are NA
#'
#' @param x Vector of any type
#'
all_na <- function(x) {
  all(is.na(x))
}

#' Display the progress if iterative processes
#'
#' @param n Iteration step
#' @param nmax Number of iterations
#' @param t0 Initial time step
#'
#' @importFrom dplyr %>%
#' @importFrom lubridate as.period interval now seconds
#' @keywords internal
#'
display_progress <- function(n, nmax, t0, word){
  t1 <- now()
  time_elaps  <- interval(t0,t1) %>%
    round(.) %>%
    as.period(.)
  time_remain <- (as.numeric(time_elaps, "seconds")*(nmax-n)/n) %>%
    round(.) %>%
    seconds(.) %>%
    as.period(., unit = "days")
  
  cat("\r", word, n, "of", nmax,
      "  Time elapsed:", as.character(time_elaps),
      "  Time remaining:", as.character(time_remain),
      "   ")
}

#' Print message for completed process
#'
#' @param nmax Number of iterations
#' @param t0 initial time step
#'
#' @importFrom dplyr %>%
#' @importFrom lubridate as.period interval now
#' @keywords internal
#'
finish_progress <- function(nmax, t0, word) {
  cat("\r", paste0(rep(" ", 75), collapse = ""))
  interval(t0,now()) %>%
    round(.) %>%
    as.period(.) %>%
    as.character(.) %>%
    cat("\r","Completed",nmax, word, "in", ., "\n")
}

## Print word with plural 's' if n is not 1
## 
#' @param word Text string
#' @param n Integer value
#' 
print_plural <- function(word, n) {
  if (n == 1) {
    return(word)
  } else {
    return(paste0(word, 's'))
  }
}