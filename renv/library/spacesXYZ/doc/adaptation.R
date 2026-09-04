## ----setup, include=FALSE-------------------------------------------------------------------------
knitr::opts_chunk$set(echo = TRUE)
options( width=100 )

## ----echo=TRUE, message=FALSE---------------------------------------------------------------------
library( spacesXYZ )

## ----echo=TRUE, message=FALSE---------------------------------------------------------------------
Ma = CAT( source='A', target='D65', method='bradford' )$Ma ;  Ma

## ----echo=TRUE, message=FALSE---------------------------------------------------------------------
rowSums( Ma )

## ----echo=TRUE, message=FALSE---------------------------------------------------------------------
theCAT	= CAT( source='A', target='D65', method='bradford' )
A  =  standardXYZ('A')
A %*% t(theCAT$M) - standardXYZ('D65')

## ----echo=TRUE, message=TRUE----------------------------------------------------------------------
identical(  adaptXYZ( theCAT, A ), A %*% t(theCAT$M) )

## ----echo=TRUE, message=TRUE----------------------------------------------------------------------
rowSums( CAT( source='A', target='D65', method='MCAT02' )$Ma )

## ----echo=TRUE, message=TRUE----------------------------------------------------------------------
rowSums( CAT( source='A', target='D65', method='vonKries' )$Ma )

## ----echo=TRUE, message=TRUE----------------------------------------------------------------------
whiteA = standardXYZ("A")[1, ]  ;  whiteB = standardXYZ("B")[1, ]
theCAT = CAT( whiteA, whiteB, method='MCAT02' )
T   = theCAT$M ; Ma = theCAT$Ma
res = eigen( t(T) )
X   = t(res$vectors)  ;  X = diag( 1 / rowSums(X) ) %*% X  # X is 'first cut' at the unknown Ma

## ----echo=TRUE, message=TRUE----------------------------------------------------------------------
Ma ; X

## ----echo=TRUE, message=TRUE----------------------------------------------------------------------
as.numeric(Ma %*% whiteB / Ma %*% whiteA) ; res$values

## ----echo=TRUE, message=TRUE----------------------------------------------------------------------
perm = order( Ma %*% whiteB / Ma %*% whiteA,  decreasing=TRUE )  ; perm

## ----echo=TRUE, message=TRUE----------------------------------------------------------------------
perm = order(perm) ; perm   
res$values[perm]
X = X[perm, ]  ;  X  ;  max( abs(X - Ma) )

## ----echo=FALSE, results='asis'-------------------------------------------------------------------
sessionInfo()

