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
data(Cauquenes7336001)

## ----Window1------------------------------------------------------------------
x <- window(Cauquenes7336001, start="1981-01-01", end="2010-12-31")

## ----Dates--------------------------------------------------------------------
dates <- time(x)

## ----yip----------------------------------------------------------------------
( nyears <- yip(from=start(x), to=end(x), out.type="nmbr" ) )

## ----SelectingPyQ-------------------------------------------------------------
P <- x[, 1]
Q <- x[, 5]

## ----smry---------------------------------------------------------------------
smry(Q)

## ----dwi1---------------------------------------------------------------------
dwi(Q)

## ----dwi2---------------------------------------------------------------------
dwi(Q, out.unit="mpy")

## ----cmv1, R.options=list(max.print=20)---------------------------------------
( pmd <- cmv(Q, tscale="monthly") )

## ----cmv2---------------------------------------------------------------------
index <- which(pmd >= 0.1)
time(pmd[index])

## ----Custom_daily2monthly, R.options=list(max.print=20)-----------------------
## Daily to monthly, only for months with less than 10% of missing values
(m2 <- daily2monthly(Q, FUN=mean, na.rm=TRUE, na.rm.max=0.1))

## ----hydroplot, fig.width=10, fig.height=8------------------------------------
hydroplot(Q, var.type="Flow", main="at Cauquenes en el Arrayan", 
          pfreq = "dm", from="2000-01-01")

## ----plot_pq1, fig.width=10, fig.height=8-------------------------------------
plot_pq(p=P, q=Q)

## ----plot_pq2, fig.width=10, fig.height=8-------------------------------------
plot_pq(p=P, q=Q, from="2000-04-01", to="2000-12-31")

## ----plot_pq3, fig.width=10, fig.height=8-------------------------------------
plot_pq(p=P, q=Q, ptype="monthly")

## ----plot_pq4, fig.width=10, fig.height=8-------------------------------------
plot_pq(p=P, q=Q, ptype="monthly", start.month=4)

## ----calendarHeatmap, fig.width=8.6, fig.height=8.7---------------------------
q <- window(Q, start="2005-01-01", end="2010-12-31")
calendarHeatmap(q)

## ----FDC2---------------------------------------------------------------------
fdc2 <- fdc(Q)

## ----FDC3---------------------------------------------------------------------
fdc3 <- fdc(Q, log="x")

## ----FDC1---------------------------------------------------------------------
fdc1 <- fdc(Q, log="")

## ----baseflow1, eval=FALSE----------------------------------------------------
#  baseflow(Q)

## ----baseflow2, eval=TRUE, R.options=list(max.print=20)-----------------------
baseflow(Q, na.fill="spline") 

## ----baseflow3, eval=TRUE, fig.width=11, fig.height=6, R.options=list(max.print=20)----
baseflow(Q, na.fill="spline", plot=TRUE)

## ----baseflow4, eval=TRUE, R.options=list(max.print=20)-----------------------
baseflow(Q, na.fill="spline", from="2000-04-01", to="2000-12-31")

## ----baseflow5, eval=TRUE, fig.width=11, fig.height=6, R.options=list(max.print=20)----
baseflow(Q, na.fill="spline", from="2000-04-01", to="2000-12-31", 
         out.type="all", plot=TRUE)

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

