## ----setup, include = FALSE---------------------------------------------------
knitr::opts_chunk$set(echo = TRUE)

## ----installation1, eval=FALSE------------------------------------------------
#  install.packages("hydroTSM")

## ----installation2, eval=FALSE------------------------------------------------
#  if (!require(devtools)) install.packages("devtools")
#  library(devtools)
#  install_github("hzambran/hydroTSM")

## ----LoadingPkg---------------------------------------------------------------
library(hydroTSM)

## ----LoadingData--------------------------------------------------------------
data(SanMartinoPPts)

## ----Window1------------------------------------------------------------------
x <- window(SanMartinoPPts, start="1985-01-01")

## ----Dates--------------------------------------------------------------------
dates <- time(x)

## ----yip----------------------------------------------------------------------
( nyears <- yip(from=start(x), to=end(x), out.type="nmbr" ) )

## ----smry---------------------------------------------------------------------
smry(x)

## ----dwi1---------------------------------------------------------------------
dwi(x)

## ----dwi2---------------------------------------------------------------------
dwi(x, out.unit="mpy")

## ----Custom_daily2monthly-----------------------------------------------------
# Loading the DAILY precipitation data at SanMartino
data(SanMartinoPPts)
y <- SanMartinoPPts
     
# Subsetting 'y' to its first three months (Jan/1921 - Mar/1921)
y <- window(y, end="1921-03-31")
     
## Transforming into NA the 10% of values in 'y'
set.seed(10) # for reproducible results
n           <- length(y)
n.nas       <- round(0.1*n, 0)
na.index    <- sample(1:n, n.nas)
y[na.index] <- NA
     
## Daily to monthly, only for months with less than 10% of missing values
(m2 <- daily2monthly(y, FUN=sum, na.rm=TRUE, na.rm.max=0.1))
     
# Verifying that the second and third month of 'x' had 10% or more of missing values
cmv(y, tscale="month")

## ----hydroplot, fig.width=10, fig.height=8------------------------------------
hydroplot(x, var.type="Precipitation", main="at San Martino", 
          pfreq = "dm", from="1987-01-01")

## ----calendarHeatmap, fig.width=8.6, fig.height=8.7---------------------------
calendarHeatmap(x)

## ----Window3------------------------------------------------------------------
yy <- window(SanMartinoPPts, start="1990-10-01")

## ----hydroplot3---------------------------------------------------------------
hydroplot(yy,  ptype="ts", pfreq="o", var.unit="mm")

## ----daily2annual-------------------------------------------------------------
daily2annual(x, FUN=sum, na.rm=TRUE)

## ----daily2annual2------------------------------------------------------------
mean( daily2annual(x, FUN=sum, na.rm=TRUE) )

## ----annualfunction-----------------------------------------------------------
annualfunction(x, FUN=sum, na.rm=TRUE) / nyears

## ----matrixplot---------------------------------------------------------------
# Daily zoo to monthly zoo
m <- daily2monthly(x, FUN=sum, na.rm=TRUE)
     
# Creating a matrix with monthly values per year in each column
M <- matrix(m, ncol=12, byrow=TRUE)
colnames(M) <- month.abb
rownames(M) <- unique(format(time(m), "%Y"))
     
# Plotting the monthly precipitation values
require(lattice)
print(matrixplot(M, ColorRamp="Precipitation", 
           main="Monthly precipitation at San Martino st., [mm/month]"))

## ----monthlyfunction----------------------------------------------------------
monthlyfunction(m, FUN=median, na.rm=TRUE)

## ----cmonth-------------------------------------------------------------------
cmonth <- format(time(m), "%b")

## ----months-------------------------------------------------------------------
months <- factor(cmonth, levels=unique(cmonth), ordered=TRUE)

## ----boxplotMonthly-----------------------------------------------------------
boxplot( coredata(m) ~ months, col="lightblue", main="Monthly Precipitation", 
         ylab="Precipitation, [mm]", xlab="Month")

## ----seasonalfunction---------------------------------------------------------
seasonalfunction(x, FUN=sum, na.rm=TRUE) / nyears

## ----dm2seasonal--------------------------------------------------------------
( DJF <- dm2seasonal(x, season="DJF", FUN=sum) )
( MAM <- dm2seasonal(m, season="MAM", FUN=sum) )
( JJA <- dm2seasonal(m, season="JJA", FUN=sum) )
( SON <- dm2seasonal(m, season="SON", FUN=sum) )

## ----hydroplot2, fig.width=12, fig.height=10----------------------------------
hydroplot(x, pfreq="seasonal", FUN=sum, stype="default")

## ----LoadingData2-------------------------------------------------------------
data(SanMartinoPPts)

## ----Window4------------------------------------------------------------------
x <- window(SanMartinoPPts, start="1985-10-01")

## ----hydroplot4---------------------------------------------------------------
hydroplot(x,  ptype="ts", pfreq="o", var.unit="mm")

## ----SeasonalityIndex---------------------------------------------------------
si(x)

## ----R10mm--------------------------------------------------------------------
( R10mm <- length( x[x>10] ) )

## ----wet_index----------------------------------------------------------------
wet.index <- which(x >= 1)

## ----PRwn95-------------------------------------------------------------------
( PRwn95 <- quantile(x[wet.index], probs=0.95, na.rm=TRUE) )

## ----very_wet_index-----------------------------------------------------------
(very.wet.index <- which(x >= PRwn95))

## ----R95p---------------------------------------------------------------------
( R95p <- sum(x[very.wet.index]) )

## ----x_5max-------------------------------------------------------------------
x.5max <- rollapply(data=x, width=5, FUN=sum, fill=NA, partial= TRUE, 
                    align="center")

hydroplot(x.5max,  ptype="ts+boxplot", pfreq="o", var.unit="mm")

## ----(x_5max_annual-----------------------------------------------------------
(x.5max.annual <- daily2annual(x.5max, FUN=max, na.rm=TRUE))

## ----climograph1, fig.width = 8, fig.height = 7, , dpi=100, fig.align = "center", dev.args=list(pointsize = 9)----
# Loading daily ts of precipitation, maximum and minimum temperature
data(MaquehueTemuco)

# extracting individual ts of precipitation, maximum and minimum temperature
pcp <- MaquehueTemuco[, 1]
tmx <- MaquehueTemuco[, 2]
tmn <- MaquehueTemuco[, 3]

## ----climograph2, fig.width = 8, fig.height = 7, , dpi=100, fig.align = "center", dev.args=list(pointsize = 9)----
m <- climograph(pcp=pcp, tmx=tmx, tmn=tmn, na.rm=TRUE, 
                main="Maquehue Temuco Ad (Chile)", lat=-38.770, lon=-72.637)

## ----climograph3, fig.width = 8, fig.height = 7, , dpi=100, fig.align = "center", dev.args=list(pointsize = 9)----
m <- climograph(pcp=pcp, tmx=tmx, tmn=tmn, na.rm=TRUE, tmx.labels=FALSE, tmn.labels=FALSE, 
                main="Maquehue Temuco Ad (Chile)", lat=-38.770, lon=-72.637)

## ----climograph4, fig.width = 8, fig.height = 7, , dpi=100, fig.align = "center", dev.args=list(pointsize = 9)----
m <- climograph(pcp=pcp, tmx=tmx, tmn=tmn, na.rm=TRUE, 
                pcp.labels=FALSE, tmean.labels=FALSE, tmx.labels=FALSE, tmn.labels=FALSE, 
                main="Maquehue Temuco Ad (Chile)", lat=-38.770, lon=-72.637)

## ----climograph5, fig.width = 8, fig.height = 7, , dpi=100, fig.align = "center", dev.args=list(pointsize = 9)----
m <- climograph(pcp=pcp, tmx=tmx, tmn=tmn, na.rm=TRUE, 
                start.month=4, temp.labels.dx=c(rep(-0.2,4), rep(0.2,6),rep(-0.2,2)),
                main="Maquehue Temuco Ad (Chile)", lat=-38.770, lon=-72.637)

## ----echo=FALSE---------------------------------------------------------------
sessionInfo()$platform
sessionInfo()$R.version$version.string 
paste("hydroTSM", sessionInfo()$otherPkgs$hydroTSM$Version)

## ----FAQmatrixplot1, fig.width = 8, fig.height = 7, , dpi=100, fig.align = "center", dev.args=list(pointsize = 9)----
library(hydroTSM)
data(SanMartinoPPts)
x <- window(SanMartinoPPts, end=as.Date("1960-12-31"))
m <- daily2monthly(x, FUN=sum, na.rm=TRUE)
M <- matrix(m, ncol=12, byrow=TRUE)
colnames(M) <- month.abb
rownames(M) <- unique(format(time(m), "%Y"))
p <- matrixplot(M, ColorRamp="Precipitation", main="Monthly precipitation,")

print(p, position=c(0, .6, 1, 1), more=TRUE)
print(p, position=c(0, 0, 1, .4))

## ----FAQmatrixplot2, fig.width = 8, fig.height = 7, , dpi=100, fig.align = "center", dev.args=list(pointsize = 9), eval=TRUE----
if (!require(gridExtra)) install.packages("gridExtra")
require(gridExtra) # also loads grid
require(lattice)

grid.arrange(p, p, nrow=2)

