### R code from vignette source 'shapefiles.Rnw'

###################################################
### code chunk number 1: shapefiles.Rnw:7-8
###################################################
options(SweaveHooks = list(fig=function() par(mar=c(1,1,1,1))))


###################################################
### code chunk number 2: shapefiles.Rnw:26-32
###################################################
library(spatstat)
options(useFancyQuotes=FALSE)
sdate <- read.dcf(file = system.file("DESCRIPTION", package = "spatstat"),
         fields = "Date")
sversion <- read.dcf(file = system.file("DESCRIPTION", package = "spatstat"),
         fields = "Version")


###################################################
### code chunk number 3: shapefiles.Rnw:140-141 (eval = FALSE)
###################################################
## library(sf)


###################################################
### code chunk number 4: shapefiles.Rnw:145-146 (eval = FALSE)
###################################################
## x <- st_read(system.file("shape/nc.shp", package="sf"))


###################################################
### code chunk number 5: shapefiles.Rnw:151-152 (eval = FALSE)
###################################################
## st_geometry_type(x, by_geometry = FALSE)


###################################################
### code chunk number 6: shapefiles.Rnw:177-178 (eval = FALSE)
###################################################
## X <- as.ppp(x)


###################################################
### code chunk number 7: shapefiles.Rnw:189-190 (eval = FALSE)
###################################################
## X <- X[W]


###################################################
### code chunk number 8: shapefiles.Rnw:199-202 (eval = FALSE)
###################################################
## df <- st_drop_geometry(x)
## X <- as.ppp(x)
## marks(X) <- df


###################################################
### code chunk number 9: shapefiles.Rnw:206-208 (eval = FALSE)
###################################################
## x_point <- st_cast(x, "POINT")
## X <- as.ppp(x_point)


###################################################
### code chunk number 10: shapefiles.Rnw:212-215 (eval = FALSE)
###################################################
## x_multipoint <- st_cast(x, "MULTIPOINT")
## x_point <- st_cast(x, "POINT")
## X <- as.ppp(x_point)


###################################################
### code chunk number 11: shapefiles.Rnw:270-271 (eval = FALSE)
###################################################
## out <- lapply(geo, function(z) { lapply(z, as.psp) })


###################################################
### code chunk number 12: shapefiles.Rnw:279-283 (eval = FALSE)
###################################################
## dat <- st_drop_geometry(Africa)
## for(i in seq(nrow(dat))){
##   out[[i]] <- lapply(out[[i]], "marks<-", value=dat[i, , drop=FALSE])
## }


###################################################
### code chunk number 13: shapefiles.Rnw:292-293 (eval = FALSE)
###################################################
## curvegroup <- lapply(out, function(z) { do.call("superimpose", z)})


###################################################
### code chunk number 14: shapefiles.Rnw:325-327
###################################################
getOption("SweaveHooks")[["fig"]]()
data(chorley)
plot(as.owin(chorley), lwd=3, main="polygon")


###################################################
### code chunk number 15: shapefiles.Rnw:341-343
###################################################
getOption("SweaveHooks")[["fig"]]()
data(demopat)
plot(as.owin(demopat), col="blue", main="polygonal region")


###################################################
### code chunk number 16: shapefiles.Rnw:379-381 (eval = FALSE)
###################################################
## geo <- st_geometry(x)
## windows <- lapply(geo, as.owin)


###################################################
### code chunk number 17: shapefiles.Rnw:386-387 (eval = FALSE)
###################################################
## te <- tess(tiles=windows)


###################################################
### code chunk number 18: shapefiles.Rnw:429-434 (eval = FALSE)
###################################################
## geo <- st_geometry(x)
## df <- st_drop_geometry(x)
## windows <- lapply(geo, as.owin)
## te <- tess(tiles=windows)
## marks(te) <- df


###################################################
### code chunk number 19: shapefiles.Rnw:441-443 (eval = FALSE)
###################################################
## h <- hyperframe(window=windows)
## h <- cbind.hyperframe(h, df)


