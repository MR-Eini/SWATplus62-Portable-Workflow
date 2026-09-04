## ----setup, include = FALSE---------------------------------------------------
knitr::opts_chunk$set(echo = TRUE)

## ----installation1, eval=FALSE------------------------------------------------
#  install.packages("hydroGOF")

## ----installation2, eval=FALSE------------------------------------------------
#  if (!require(devtools)) install.packages("devtools")
#  library(devtools)
#  install_github("hzambran/hydroGOF")

## ----LoadingPkg---------------------------------------------------------------
library(hydroGOF)

## ----Example1-----------------------------------------------------------------
obs <- 1:10
sim <- 1:10
NSE(sim, obs)

obs <- 1:10
sim <- 2:11
NSE(sim, obs)

## ----Example2-Loading---------------------------------------------------------
data(EgaEnEstellaQts)
obs <- EgaEnEstellaQts

## ----Example2-1---------------------------------------------------------------
sim <- obs 

## ----Example2-2---------------------------------------------------------------
NSE(sim=sim, obs=obs)

## ----Example3-1, fig.width=8, fig.height=5------------------------------------
sim[1:1826] <- obs[1:1826] + rnorm(1826, mean=10)
ggof(sim, obs)

NSE(sim=sim, obs=obs)

## ----Example3-2, fig.width=8, fig.height=5------------------------------------
mNSE(sim=sim, obs=obs)               # modified NSE
rNSE(sim=sim, obs=obs)               # relative NSE

KGE(sim=sim, obs=obs)                # Kling-Gupta efficiency (KGE), 2009
KGE(sim=sim, obs=obs, method="2012") # Kling-Gupta efficiency (KGE), 2012
KGElf(sim=sim, obs=obs)              # KGE for low flows
KGEnp(sim=sim, obs=obs)              # Non-parametric KGE
sKGE(sim=sim, obs=obs)               # Split KGE

d(sim=sim, obs=obs)                  # Index of agreement (d)
rd(sim=sim, obs=obs)                 # Relative d
md(sim=sim, obs=obs)                 # Modified d
dr(sim=sim, obs=obs)                 # Refined d

VE(sim=sim, obs=obs)                 # Volumetric efficiency
cp(sim=sim, obs=obs)                 # Coefficient of persistence

pbias(sim=sim, obs=obs)              # Percent bias (PBIAS)
pbiasfdc(sim=sim, obs=obs)           # PBIAS in the slope of the midsegment of the FDC

rmse(sim=sim, obs=obs)               # Root mean square error (RMSE)
ubRMSE(sim=sim, obs=obs)             # Unbiased RMSE

rPearson(sim=sim, obs=obs)           # Pearson correlation coefficient
rSpearman(sim=sim, obs=obs)          # Spearman rank correlation coefficient
R2(sim=sim, obs=obs)                 # Coefficient of determination (R2)
br2(sim=sim, obs=obs)                # R2 multiplied by the slope of the regression line

## ----Example4-1---------------------------------------------------------------
NSE(sim=sim, obs=obs, fun=log)

## ----Example4-2---------------------------------------------------------------
lsim <- log(sim)
lobs <- log(obs)
NSE(sim=lsim, obs=lobs)

## ----Example4-3, fig.width=8, fig.height=5------------------------------------
mNSE(sim=sim, obs=obs, fun=log)               # modified NSE
rNSE(sim=sim, obs=obs, fun=log)               # relative NSE

KGE(sim=sim, obs=obs, fun=log)                # Kling-Gupta efficiency (KGE), 2009
KGE(sim=sim, obs=obs, method="2012", fun=log) # Kling-Gupta efficiency (KGE), 2012
KGElf(sim=sim, obs=obs)                       # KGE for low flows (it does not allow 'fun' argument)
KGEnp(sim=sim, obs=obs, fun=log)              # Non-parametric KGE
sKGE(sim=sim, obs=obs, fun=log)               # Split KGE

d(sim=sim, obs=obs, fun=log)                  # Index of agreement (d)
rd(sim=sim, obs=obs, fun=log)                 # Relative d
md(sim=sim, obs=obs, fun=log)                 # Modified d
dr(sim=sim, obs=obs, fun=log)                 # Refined d

VE(sim=sim, obs=obs, fun=log)                 # Volumetric efficiency
cp(sim=sim, obs=obs, fun=log)                 # Coefficient of persistence

pbias(sim=sim, obs=obs, fun=log)              # Percent bias (PBIAS)
pbiasfdc(sim=sim, obs=obs, fun=log)           # PBIAS in the slope of the midsegment of the FDC

rmse(sim=sim, obs=obs, fun=log)               # Root mean square error (RMSE)
ubRMSE(sim=sim, obs=obs, fun=log)             # Unbiased RMSE

rPearson(sim=sim, obs=obs, fun=log)           # Pearson correlation coefficient (r)
rSpearman(sim=sim, obs=obs, fun=log)          # Spearman rank correlation coefficient (rho)
R2(sim=sim, obs=obs, fun=log)                 # Coefficient of determination (R2)
br2(sim=sim, obs=obs, fun=log)                # R2 multiplied by the slope of the regression line

## ----Example5-1---------------------------------------------------------------
NSE(sim=sim, obs=obs, fun=log, epsilon.type="Pushpalatha2012")

## ----Example5-2---------------------------------------------------------------
eps  <- mean(obs, na.rm=TRUE)/100
lsim <- log(sim+eps)
lobs <- log(obs+eps)
NSE(sim=lsim, obs=lobs)

## ----Example5-3---------------------------------------------------------------
gof(sim=sim, obs=obs, fun=log, epsilon.type="Pushpalatha2012", do.spearman=TRUE, do.pbfdc=TRUE)

## ----Example6-1---------------------------------------------------------------
eps <- 0.01
NSE(sim=sim, obs=obs, fun=log, epsilon.type="otherValue", epsilon.value=eps)

## ----Example6-2---------------------------------------------------------------
lsim <- log(sim+eps)
lobs <- log(obs+eps)
NSE(sim=lsim, obs=lobs)

## ----Example6-3---------------------------------------------------------------
gof(sim=sim, obs=obs, fun=log, epsilon.type="otherValue", epsilon.value=eps, do.spearman=TRUE, do.pbfdc=TRUE)

## ----Example7-1---------------------------------------------------------------
fact <- 1/50
NSE(sim=sim, obs=obs, fun=log, epsilon.type="otherFactor", epsilon.value=fact)

## ----Example7-2---------------------------------------------------------------
fact <- 1/50
eps  <- fact*mean(obs, na.rm=TRUE)
lsim <- log(sim+eps)
lobs <- log(obs+eps)
NSE(sim=lsim, obs=lobs)

## ----Example7-3---------------------------------------------------------------
gof(sim=sim, obs=obs, fun=log, epsilon.type="otherFactor", epsilon.value=fact, do.spearman=TRUE, do.pbfdc=TRUE)

## ----Example8-1---------------------------------------------------------------
fun1 <- function(x) {sqrt(x+1)}
NSE(sim=sim, obs=obs, fun=fun1)

## ----Example8-2---------------------------------------------------------------
sim1 <- sqrt(sim+1)
obs1 <- sqrt(obs+1)
NSE(sim=sim1, obs=obs1)

## ----Example8-3---------------------------------------------------------------
gof(sim=sim, obs=obs, fun=fun1, do.spearman=TRUE, do.pbfdc=TRUE)

## -----------------------------------------------------------------------------
require(zoo)
data(EgaEnEstellaQts)
obs <- EgaEnEstellaQts

## -----------------------------------------------------------------------------
sim <- obs 

## -----------------------------------------------------------------------------
gof(sim=sim, obs=obs)

## -----------------------------------------------------------------------------
sim[1:1826] <- obs[1:1826] + rnorm(1826, mean=10)

## ----fig=TRUE, pdf=TRUE, eps=FALSE, fig.width=10, fig.height=7----------------
ggof(sim=sim, obs=obs, ftype="dm", FUN=mean)

## ----fig=TRUE, pdf=TRUE, eps=FALSE, fig.width=10, fig.height=7----------------
ggof(sim=sim, obs=obs, ftype="dm", FUN=mean, cal.ini="1963-01-01")

## -----------------------------------------------------------------------------
sim <- window(sim, start="1963-01-01")
obs <- window(obs, start="1963-01-01")

gof(sim, obs)

## ----ubands1, fig.width=8, fig.height=5---------------------------------------
lband <- obs - 5
uband <- obs + 5
plotbands(obs, lband, uband)

## ----ubands2, fig.width=8, fig.height=5---------------------------------------
plotbands(obs, lband, uband)

## ----ubands3------------------------------------------------------------------
sim <- obs + rnorm(length(obs), mean=3)

## ----ubands4, fig.width=8, fig.height=5---------------------------------------
plotbands(obs, lband, uband, sim)

## -----------------------------------------------------------------------------
r <- sim-obs

## -----------------------------------------------------------------------------
library(hydroTSM)
smry(r) 

## ----fig=TRUE, pdf=TRUE, fig.width=10, fig.height=12--------------------------
# daily, monthly and annual plots, boxplots and histograms
hydroplot(r, FUN=mean)

## ----fig=TRUE, eval=TRUE, pdf=TRUE, eps=FALSE, fig.width=8, fig.height=8------
# daily, monthly and annual plots, boxplots and histograms
hydroplot(r, FUN=mean, pfreq="seasonal")

## ----echo=FALSE---------------------------------------------------------------
sessionInfo()$platform
sessionInfo()$R.version$version.string 
paste("hydroGOF", sessionInfo()$otherPkgs$hydroGOF$Version)

