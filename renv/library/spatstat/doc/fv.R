### R code from vignette source 'fv.Rnw'

###################################################
### code chunk number 1: fv.Rnw:40-49
###################################################
library(spatstat)
x <- read.dcf(file = system.file("DESCRIPTION", package = "spatstat"),
              fields = c("Version", "Date"))
sversion <- as.character(x[,"Version"])
sdate    <- as.character(x[,"Date"])
options(useFancyQuotes=FALSE)
setmargins <- function(...) {
  options(SweaveHooks=list(fig=function() par(mar=c(...)+0.1)))
}


###################################################
### code chunk number 2: fv.Rnw:51-53
###################################################
options(SweaveHooks=list(fig=function() par(mar=c(5,4,2,4)+0.1)))
options(width=100)


###################################################
### code chunk number 3: fv.Rnw:99-100
###################################################
K <- Kest(finpines)


###################################################
### code chunk number 4: K
###################################################
getOption("SweaveHooks")[["fig"]]()
plot(K)


###################################################
### code chunk number 5: fv.Rnw:130-131
###################################################
  K


###################################################
### code chunk number 6: fv.Rnw:156-157
###################################################
head(as.data.frame(K))


###################################################
### code chunk number 7: fv.Rnw:170-171
###################################################
E <- envelope(finpines, Kest, nsim=39)


###################################################
### code chunk number 8: E
###################################################
getOption("SweaveHooks")[["fig"]]()
plot(E)


###################################################
### code chunk number 9: fv.Rnw:194-195
###################################################
E


###################################################
### code chunk number 10: fv.Rnw:241-242
###################################################
L <- sqrt(K/pi)


###################################################
### code chunk number 11: L
###################################################
getOption("SweaveHooks")[["fig"]]()
plot(L)


###################################################
### code chunk number 12: fv.Rnw:290-291 (eval = FALSE)
###################################################
## plot(Gest(finpines))


###################################################
### code chunk number 13: Gplot
###################################################
getOption("SweaveHooks")[["fig"]]()
aa <- plot(Gest(finpines))


###################################################
### code chunk number 14: fv.Rnw:309-311 (eval = FALSE)
###################################################
## aa <- plot(Gest(finpines))
## aa


###################################################
### code chunk number 15: fv.Rnw:313-314
###################################################
aa


###################################################
### code chunk number 16: fv.Rnw:372-374
###################################################
G <- Gest(finpines)
G


###################################################
### code chunk number 17: Kiso
###################################################
getOption("SweaveHooks")[["fig"]]()
plot(K,  iso ~ r)


###################################################
### code chunk number 18: Kit
###################################################
getOption("SweaveHooks")[["fig"]]()
plot(K, cbind(iso, theo) ~ r)


###################################################
### code chunk number 19: fv.Rnw:483-485
###################################################
fvnames(K, ".y")
fvnames(K, ".")


###################################################
### code chunk number 20: Ksubtheo
###################################################
getOption("SweaveHooks")[["fig"]]()
plot(K, . - theo  ~ r)


###################################################
### code chunk number 21: Ktheo
###################################################
getOption("SweaveHooks")[["fig"]]()
plot(K, . ~ theo)


###################################################
### code chunk number 22: Kcox
###################################################
getOption("SweaveHooks")[["fig"]]()
plot(K, . ~ r^2)


###################################################
### code chunk number 23: Kswed
###################################################
getOption("SweaveHooks")[["fig"]]()
lambda <- intensity(swedishpines)
plot(K, lambda * . ~ r)


###################################################
### code chunk number 24: fv.Rnw:536-539 (eval = FALSE)
###################################################
## K <- Kest(cells)
## K/pi
## sqrt(K/pi)


###################################################
### code chunk number 25: fv.Rnw:551-552 (eval = FALSE)
###################################################
## sqrt(Kest(cells)/pi)


###################################################
### code chunk number 26: fv.Rnw:572-573 (eval = FALSE)
###################################################
## Kpos <- eval.fv(pmax(0, K))


###################################################
### code chunk number 27: fv.Rnw:600-603
###################################################
Kr <- Kest(redwood)
z <- with(Kr, iso - theo)
x <- with(Kr, r)


###################################################
### code chunk number 28: fv.Rnw:622-623
###################################################
Kcen <- with(Kr, . - theo)


###################################################
### code chunk number 29: fv.Rnw:630-631
###################################################
with(Kr, max(abs(iso-theo)))


###################################################
### code chunk number 30: fv.Rnw:642-643
###################################################
df <- as.data.frame(K)


###################################################
### code chunk number 31: fv.Rnw:668-669
###################################################
Ko <- subset(K, r < 0.1, select= -border)


###################################################
### code chunk number 32: fv.Rnw:679-682
###################################################
Ks <- Kest(swedishpines)
kfun <- as.function(Ks)
kfun(9)


###################################################
### code chunk number 33: fv.Rnw:693-695
###################################################
kt <- as.function(Ks, value="trans")
kt(9)


###################################################
### code chunk number 34: fv.Rnw:698-700
###################################################
kf <- as.function(Ks, value=".")
kf(9, "trans")


###################################################
### code chunk number 35: fv.Rnw:741-744 (eval = FALSE)
###################################################
## Kcel <- Kest(cells)
## Kred <- Kest(redwood)
## Kdif <- Kcel - Kred


###################################################
### code chunk number 36: fv.Rnw:764-765 (eval = FALSE)
###################################################
## Kest(cells) - Kest(redwood)


###################################################
### code chunk number 37: fv.Rnw:776-779 (eval = FALSE)
###################################################
## Kcel <- Kest(cells)
## Kred <- Kest(redwood)
## Kmax <- eval.fv(pmax(Kcel, Kred))


###################################################
### code chunk number 38: fv.Rnw:795-797 (eval = FALSE)
###################################################
##   Kmax <- eval.fm(pmax(Kcel, Kred),
##                   envir=list(Kcel=Kest(cells), Kred=Kest(redwood)))


###################################################
### code chunk number 39: fv.Rnw:1014-1018
###################################################
  makefvlabel(NULL, NULL, "K", "pois")
  makefvlabel(NULL, "hat", "K", "bord")
  makefvlabel(NULL, "hat", c("K", "inhom"), "bord")
  makefvlabel("var", "hat", c("K", "inhom"), "bord")


###################################################
### code chunk number 40: fv.Rnw:1071-1073 (eval = FALSE)
###################################################
## compileK(D, r, weights = NULL, denom = 1, ...)
## compilepcf(D, r, weights = NULL, denom = 1, ...)


###################################################
### code chunk number 41: fv.Rnw:1108-1116
###################################################
X <- japanesepines
D <- pairdist(X)
Wt <- edge.Ripley(X, D)
lambda <- intensity(X)
a <- (npoints(X)-1) * lambda
r <- seq(0, 0.25, by=0.01)
K <- compileK(D=D, r=r, weights=Wt, denom=a)
g <- compilepcf(D=D, r=r, weights=Wt, denom= a * 2 * pi * r)


###################################################
### code chunk number 42: fv.Rnw:1131-1132 (eval = FALSE)
###################################################
## compileCDF(D, B, r, ..., han.denom = NULL)


###################################################
### code chunk number 43: fv.Rnw:1148-1156
###################################################
X <- japanesepines
D <- nndist(X)
B <- bdist.points(X)
r <- seq(0, 1, by=0.01)
h <- eroded.areas(Window(X), r)
G <- compileCDF(D=D, B=B, r=r, han.denom=h)
## give it a better name
G <- rebadge.fv(G, new.fname="G", new.ylab=quote(G(r)))


###################################################
### code chunk number 44: fv.Rnw:1207-1211 (eval = FALSE)
###################################################
## rebadge.fv(x, new.ylab, new.fname,
##            tags, new.desc, new.labl,
##            new.yexp=new.ylab, new.dotnames,
##            new.preferred, new.formula, new.tags)


###################################################
### code chunk number 45: fv.Rnw:1267-1268 (eval = FALSE)
###################################################
## tweak.fv.entry(x, current.tag, new.labl=NULL, new.desc=NULL, new.tag=NULL)


###################################################
### code chunk number 46: fv.Rnw:1284-1286 (eval = FALSE)
###################################################
## prefixfv(x, tagprefix="", descprefix="", lablprefix=tagprefix,
##          whichtags=fvnames(x, "*"))


###################################################
### code chunk number 47: fv.Rnw:1299-1300 (eval = FALSE)
###################################################
## rebadge.as.crossfun(x, main, sub=NULL, i, j)


###################################################
### code chunk number 48: fv.Rnw:1306-1307 (eval = FALSE)
###################################################
## rebadge.as.crossfun(x, "L", i="A", j="B")


###################################################
### code chunk number 49: fv.Rnw:1310-1311 (eval = FALSE)
###################################################
## rebadge.as.crossfun(x, "L", "inhom", "A", "B")


###################################################
### code chunk number 50: fv.Rnw:1321-1322 (eval = FALSE)
###################################################
## rebadge.as.dotfun(x, main, sub=NULL, i)


###################################################
### code chunk number 51: fv.Rnw:1358-1360
###################################################
K <- Kest(cells)
formula(K)


###################################################
### code chunk number 52: fv.Rnw:1367-1368
###################################################
fvnames(K, ".")


###################################################
### code chunk number 53: fv.Rnw:1377-1378
###################################################
fvnames(K, ".") <- c("iso", "theo")


###################################################
### code chunk number 54: fv.Rnw:1434-1436
###################################################
class(Kest(cells))
class(Kest(cells, ratio=TRUE))


###################################################
### code chunk number 55: fv.Rnw:1472-1477
###################################################
X1 <- runifpoint(50)
X2 <- runifpoint(50)
K1 <- Kest(X1, ratio=TRUE)
K2 <- Kest(X2, ratio=TRUE)
K <- pool(K1, K2)


###################################################
### code chunk number 56: fv.Rnw:1480-1483
###################################################
Xlist <- runifpoint(50, nsim=6)
Klist <- lapply(Xlist, Kest, ratio=TRUE)
K <- do.call(pool, Klist)


###################################################
### code chunk number 57: fv.Rnw:1499-1500 (eval = FALSE)
###################################################
## ratfv(df, numer, denom, ..., ratio=TRUE)


###################################################
### code chunk number 58: fv.Rnw:1564-1567
###################################################
G <- Gest(finpines)
df <- as.data.frame(G)
head(df)


###################################################
### code chunk number 59: fv.Rnw:1588-1589
###################################################
G


###################################################
### code chunk number 60: fv.Rnw:1677-1678 (eval = FALSE)
###################################################
## E <- envelope(swp, Kest, nsim=39, fix.n=TRUE)


###################################################
### code chunk number 61: fv.Rnw:1686-1687
###################################################
E


###################################################
### code chunk number 62: fv.Rnw:1706-1709 (eval = FALSE)
###################################################
## E1 <- envelope(redwood, Kest, savepatterns=TRUE)
## E2 <- envelope(E1, Gest, global=TRUE, 
##                transform=expression(fisher(.)))


###################################################
### code chunk number 63: fv.Rnw:1716-1719 (eval = FALSE)
###################################################
## A1 <- envelope(redwood, Kest, nsim=39, savefuns=TRUE)
## A2 <- envelope(A1, global=TRUE, nsim=19, 
##                transform=expression(sqrt(./pi)))


###################################################
### code chunk number 64: fv.Rnw:1733-1736 (eval = FALSE)
###################################################
## E1 <- envelope(cells, Kest, nsim=10, savefuns=TRUE)
## E2 <- envelope(cells, Kest, nsim=20, savefuns=TRUE)
## E <- pool(E1, E2)


