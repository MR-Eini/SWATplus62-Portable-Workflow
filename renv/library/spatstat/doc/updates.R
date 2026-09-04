### R code from vignette source 'updates.Rnw'

###################################################
### code chunk number 1: updates.Rnw:20-27
###################################################
library(spatstat)
x <- read.dcf(file = system.file("DESCRIPTION", package = "spatstat"),
              fields = c("Version", "Date"))
sversion <- as.character(x[,"Version"])
sdate    <- as.character(x[,"Date"])
sdevel   <- length(unlist(package_version(x[,"Version"]))) > 3 
options(useFancyQuotes=FALSE)


###################################################
### code chunk number 2: updates.Rnw:37-141
###################################################
readSizeTable <- function(fname) {
  if(is.null(fname) || !file.exists(fname)) return(NULL)
  a <- read.table(fname, header=TRUE)
  a$date <- as.Date(a$date)
  return(a)
}
getSizeTable <- function(packagename="spatstat", tablename="packagesizes.txt") {
  fname <- system.file("info", tablename, package=packagename)
  out <- readSizeTable(fname)
  if(is.null(out)) {
    fname <- system.file("doc", tablename, package=packagename)
    out <- readSizeTable(fname)
  }
  return(out)
}
RemoveDevel <- function(sizetable) {
  ## remove entries with fractional version numbers
  if(is.null(sizetable)) return(NULL)
  ver <- sizetable$version
  isdevel <- sapply(ver, function(x) { length(unlist(package_version(x))) > 3 })
  st <- if(all(isdevel)) NULL else sizetable[!isdevel, , drop=FALSE]
  return(st)
}
counts <- c("nhelpfiles", "nobjects", "ndatasets", "Rlines", "srclines")
mergeSizeTables <- function(a, b, breakupdate, allow.devel=sdevel) {
  #' a is the running total for spatstat; b is a sub-package.
  #' breakupdate is the date when the code in b was removed from spatstat
  #' so that the size of 'b' must be added to 'a' for all dates >= breakupdate
  if(!allow.devel) b <- RemoveDevel(b)
  if(is.null(b)) return(a)
  adates <- a$date
  bdates <- b$date
  alldates <- sort(unique(c(adates,bdates)))
  if(missing(breakupdate)) breakupdate <- min(bdates)
  #' functions to determine, for any given date,
  #' the relevant (latest) row of the table
  aok <- rev(!duplicated(rev(adates)))
  arowfun <- approxfun(adates[aok], seq_along(adates)[aok], 
                       method="constant", f=0, rule=2, yleft=0)
  bok <- rev(!duplicated(rev(bdates)))
  browfun <- approxfun(bdates[bok], seq_along(bdates)[bok], 
                       method="constant", f=0, rule=2, yleft=0)
  result <- NULL
  for(k in seq_along(alldates)) {
    thedate <- alldates[k]
    i <- arowfun(thedate)
    j <- browfun(thedate)
    #' i > 0 because spatstat's founding date is earlier than any sub-package
    nextrow <- a[i, ]
    if(j > 0 && thedate >= breakupdate) {
      #' add contribution from 'b'
      nextrow[, counts] <- nextrow[, counts] + b[j, counts]
    }
    result <- rbind(result, nextrow)
  }
  return(result)
}
## Get histories of all sub-packages
## Package formerly known as 'spatstat'
z <- getSizeTable() 
## installed sub-packages - access via the installed sub-packages
zutils   <- getSizeTable("spatstat.utils")
zdata    <- getSizeTable("spatstat.data")
zunivar  <- getSizeTable("spatstat.univar")
zsparse  <- getSizeTable("spatstat.sparse")
zgeom    <- getSizeTable("spatstat.geom")
zrandom  <- getSizeTable("spatstat.random")
zexplore <- getSizeTable("spatstat.explore")
zmodel   <- getSizeTable("spatstat.model")
zlinnet  <- getSizeTable("spatstat.linnet")
## other sub-packages - access via stored copies of package size files
##       defunct package spatstat.core 
zcore    <- getSizeTable("spatstat", "spatstatcoresize.txt")
##       extension packages 
zlocal   <- getSizeTable("spatstat", "spatstatlocalsize.txt")
zgui     <- getSizeTable("spatstat", "spatstatguisize.txt")
zKnet    <- getSizeTable("spatstat", "spatstatKnetsize.txt")
## Merge histories starting at the 'split dates'
z <- mergeSizeTables(z, zutils,  "2017-03-22")
z <- mergeSizeTables(z, zdata,   "2017-09-23")
z <- mergeSizeTables(z, zsparse, "2020-11-04")
BigSplitDay <- "2020-12-14"
z <- mergeSizeTables(z, zgeom,   BigSplitDay)
z <- mergeSizeTables(z, zcore,   BigSplitDay)
z <- mergeSizeTables(z, zlinnet, BigSplitDay)
z <- mergeSizeTables(z, zrandom, "2022-02-12")
CoreSplitDay <- "2020-05-25"   # size of 'core' drops to 0 on this date
z <- mergeSizeTables(z, zexplore, CoreSplitDay)
z <- mergeSizeTables(z, zmodel,   CoreSplitDay)
z <- mergeSizeTables(z, zunivar,  "2024-04-21")
## extension packages: these never overlapped spatstat
z <- mergeSizeTables(z, zlocal)
z <- mergeSizeTables(z, zgui)
z <- mergeSizeTables(z, zKnet)
## Now summarise
currentcount <- z[nrow(z), counts]
bookcount    <- z[z$version == "1.42-0", counts]
changes <- currentcount - bookcount
newobj <- changes[["nobjects"]]
newdat <- changes[["ndatasets"]] + 2  # redwood3, shelling2
newcode  <- changes[["Rlines"]] + changes[["srclines"]]
bookcode <- bookcount[["Rlines"]] + bookcount[["srclines"]]
currentcode <- currentcount[["Rlines"]] + currentcount[["srclines"]]
growth <- signif((100 * newcode)/bookcode, digits=2)


###################################################
### code chunk number 3: updates.Rnw:153-159
###################################################
options(SweaveHooks=list(fig=function() par(mar=0.2+c(2,4,2,0))))
Plot <- function(fmla, ..., dat=z, ylim=NULL) {
  yvals <- eval(as.expression(fmla[[2]]), envir=dat)
  if(is.null(ylim)) ylim <- c(0, max(yvals))
  plot(fmla, ..., data=dat, type="n", xlab="", ylim=ylim, las=1)
}


###################################################
### code chunk number 4: updates.Rnw:165-179
###################################################
getOption("SweaveHooks")[["fig"]]()
Plot((Rlines + srclines)/1000 ~ date, ylab="Lines of code (x 1000)", 
     main="Spatstat growth")
with(z, {
  polygon(c(date, rev(date)),
          c(srclines, rep(0, length(srclines)))/1000,
          angle=45, density=5, col="pink")
  polygon(c(date, rev(date)),
          c(srclines+Rlines, rev(srclines))/1000,
          angle=135, density=5, col="lightblue")
})
text(as.Date("2019-01-01"), 90, "R code", col="blue")
text(as.Date("2021-01-01"), 15, "C code", col="red")
lines((Rlines + srclines)/1000 ~ date, data=z, lwd=3)
lines(srclines/1000 ~ date, data=z, col="red")


###################################################
### code chunk number 5: updates.Rnw:196-220
###################################################
## Tabulate latest version numbers of packages
vtable <- data.frame(package="spatstat", version=sversion, date=as.Date(sdate))
AppendVersion <- function(pkg, sizetable, v, allow.devel=sdevel) {
  if(!allow.devel) sizetable <- RemoveDevel(sizetable)
  if(is.null(sizetable)) return(v)
  lastrow <- sizetable[nrow(sizetable), , drop=FALSE]
  if(is.null(lastrow)) return(v)
  rbind(v, data.frame(package=pkg, version=lastrow[,"version"], date=as.Date(lastrow[,"date"])))
}
vtable <- AppendVersion("spatstat.utils", zutils, vtable)
vtable <- AppendVersion("spatstat.data", zdata, vtable)
vtable <- AppendVersion("spatstat.sparse", zsparse, vtable)
vtable <- AppendVersion("spatstat.univar", zunivar, vtable)
vtable <- AppendVersion("spatstat.geom", zgeom, vtable)
vtable <- AppendVersion("spatstat.random", zrandom, vtable)
vtable <- AppendVersion("spatstat.explore", zexplore, vtable)
vtable <- AppendVersion("spatstat.model", zmodel, vtable)
vtable <- AppendVersion("spatstat.linnet", zlinnet, vtable)
## move spatstat to the bottom
vtable <- rbind(vtable[-1, ], vtable[1, ])
## add extras
vtable <- AppendVersion("spatstat.local", zlocal, vtable)
vtable <- AppendVersion("spatstat.Knet", zKnet, vtable)
vtable <- AppendVersion("spatstat.gui", zgui, vtable)


###################################################
### code chunk number 6: updates.Rnw:226-227
###################################################
print(vtable[,c(3,1,2)], row.names=FALSE)


