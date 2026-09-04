foo1 <- function(x){
  for( i in x ){
    #  require returns TRUE invisibly if it was able to load package
    if( ! require( i , character.only = TRUE ) ){
      stop('Missing pinned package ', i, '. Run install_or_repair_packages.bat from the bundle root.')
    }
  }
}

foo2 <- function(x){
  for( i in x ){
    #  require returns TRUE invisibly if it was able to load package
    if( ! require( i , character.only = TRUE ) ){
      stop('Missing pinned package ', i, '. Run install_or_repair_packages.bat from the bundle root.')
    }
  }
}


is.integer0 <- function(x)
{
  is.integer(x) && length(x) == 0L
}

`%!in%` <- Negate(`%in%`)

check_skip_position <- function(){
  crop_mgt.list <- unique(mgt_crop$crop_mgt)
  pos_skip <- grep("skip", subset(mgt_crop, mgt_crop$crop_mgt==crop_mgt.list[1]))
  n_op <- length(subset(mgt_crop, mgt_crop$crop_mgt==crop_mgt.list[1]))

  check_skip <- crop_mgt.list %>%
    as.data.frame(.) %>%
    mutate(skip_exists = '') %>%
    mutate(skip_before_end = '')

  for(i in 1:length(crop_mgt.list)){
    pos_skip <- grep("skip", mgt_crop$operation[which(mgt_crop$crop_mgt==crop_mgt.list[i])])
    n_op <- length(mgt_crop$operation[which(mgt_crop$crop_mgt==crop_mgt.list[i])])
    if(length(pos_skip)>0) {
      check_skip$skip_exists[i] <- 'y'
      if(all(pos_skip < n_op)) check_skip$skip_before_end[i] <- 'y' else check_skip$skip_before_end[i] <- 'n'
    } else check_skip$skip_exists[i] <- 'n'
  }

  write.csv(check_skip, './check_skip.csv', quote=F, row.names = F)

  if(any(check_skip$skip_exists=='n')){
    return(print(paste0("Check failed for crop ", check_skip$.[which(check_skip$skip_exists=='n')],
                        " (add a 'skip' line)")))
  }
  if(any(check_skip$skip_exists=='y' & check_skip$skip_before_end=='n')){
    return(print(paste0("Check failed for crop ", check_skip$.[which(check_skip$skip_before_end=='n')],
                        " ('skip' should not be defined at last line")))
  }
  if(!(any(check_skip$skip_exists=='n' | check_skip$skip_before_end=='n'))){
    return(print("Check successfull"))
  }
}

check_date_conflicts1 <- function(){
  crop_mgt.list <- unique(mgt_crop$crop_mgt)

  ## add day of the year
  skip_all <- which(mgt_crop$operation == 'skip')

  mgt_crop$doy1 <- NA
  mgt_crop$doy1[-skip_all] <- yday(paste('2001', mgt_crop$mon_1, mgt_crop$day_1, sep='-')[-skip_all])

  mgt_crop$doy2 <- NA
  mgt_crop$doy2[-skip_all] <- yday(paste('2001', mgt_crop$mon_2, mgt_crop$day_2, sep='-')[-skip_all])

  mgt_conflict <-crop_mgt.list[1]

  for(k in 1:length(crop_mgt.list)){

    print(paste0('check single schedule for crop ', k))
    mgt_singlecrop <- mgt_crop[which(mgt_crop$crop_mgt==crop_mgt.list[k]),]
    skip_field <- c(1,grep('skip',mgt_singlecrop$operation),dim(mgt_singlecrop)[1]) #get all transitions among years

    if(any(duplicated(skip_field))){
      skip_field <- skip_field[-duplicated(skip_field)]
    }

    for(i in 2:length(skip_field)){
      mgt_sub <- mgt_singlecrop[c((skip_field[i-1]+1):(skip_field[i]-1)),] #schedule for a year
      if(is.unsorted(mgt_sub$doy2, na.rm=T)){ #any conflict in ending operation dates?
        mgt_conflict_ <- crop_mgt.list[k] #save conflicted full year schedule
        mgt_conflict <- c(mgt_conflict,mgt_conflict_)
      }
    }
  }

  mgt_conflict <- mgt_conflict[-1]
  if(any(duplicated(mgt_conflict))==T){
    mgt_conflict <- mgt_conflict[-which(duplicated(mgt_conflict))]
  }
  mgt_conflict <- as.data.frame(mgt_conflict)

  if(dim(mgt_conflict)[1]>0){
    write.csv(mgt_conflict, "mgt_conflict_single_schedule.csv", row.names = F, quote=F)
    return(print(list("Date conflicts were detected in your single schedules :(",
                      "Find the names of problematic schedules in 'mgt_conflict_single_schedule.csv'.",
                      "Please correct the dates before you proceed!",
                      "Ending dates of the intervals must be in chronological order")))
  }else(return(print("No conflicts detected :)")))

}

build_rotation_schedules <- function(){

  skip_all <- which(mgt_crop$operation == 'skip')

  ## add day of the year
  mgt_crop$doy1 <- NA
  mgt_crop$doy1[-skip_all] <- yday(paste('2001', mgt_crop$mon_1, mgt_crop$day_1, sep='-')[-skip_all])

  mgt_crop$doy2 <- NA
  mgt_crop$doy2[-skip_all] <- yday(paste('2001', mgt_crop$mon_2, mgt_crop$day_2, sep='-')[-skip_all])

  ## rename multi-year crop to consider single years, e.g. akgs_2yr_1 and akgs_2yr_2
  if(m_yr_sch_existing == 'y'){

    crop_mgt.list <- unique(mgt_crop$crop_mgt)

    for(l in 1:length(crop_myr)){

      idz <- which(substr(crop_mgt.list,1,nchar(crop_myr[l]))==crop_myr[l])

      for(k in 1:length(idz)){
        mgt_crop_sub <- mgt_crop[which(mgt_crop$crop_mgt== crop_mgt.list[idz[k]]),]
        yr <- unlist(strsplit(mgt_crop_sub$crop_mgt[1],"yr"))[1]
        if(any(grep('[.]',yr)) == F){
          mgt_crop_sub$crop_mgt <- paste0(yr,'.0yr')
          yr <- as.numeric(substr(yr,nchar(yr),nchar(yr)))
        }else{
          yr <- as.numeric(substr(yr,nchar(yr)-2,nchar(yr)))
        }

        if(yr < 1.5) mgt_crop_sub$crop_mgt <- paste0(mgt_crop_sub$crop_mgt,'_1')
        if(yr >= 1.5 & yr < 2.5) {
          pos_skip_ <- grep("skip", mgt_crop_sub$operation)
          idx1 <- c(1:(pos_skip_[2]-1))
          idx2 <- c(pos_skip_[2]:length(mgt_crop_sub$crop_mgt))
          mgt_crop_sub$crop_mgt[idx1] <- paste0(mgt_crop_sub$crop_mgt[idx1],'_1')
          mgt_crop_sub$crop_mgt[idx2] <- paste0(mgt_crop_sub$crop_mgt[idx2],'_2')
        }
        if(yr >= 2.5 & yr < 3.5) {
          pos_skip_ <- grep("skip", mgt_crop_sub$operation)
          idx1 <- c(1:(pos_skip_[2]-1))
          idx2 <- c(pos_skip_[2]:(pos_skip_[3]-1))
          idx3 <- c(pos_skip_[3]:length(mgt_crop_sub$crop_mgt))
          mgt_crop_sub$crop_mgt[idx1] <- paste0(mgt_crop_sub$crop_mgt[idx1],'_1')
          mgt_crop_sub$crop_mgt[idx2] <- paste0(mgt_crop_sub$crop_mgt[idx2],'_2')
          mgt_crop_sub$crop_mgt[idx3] <- paste0(mgt_crop_sub$crop_mgt[idx3],'_3')
        }
        if(yr >= 3.5 & yr < 4.5) {
          pos_skip_ <- grep("skip", mgt_crop_sub$operation)
          idx1 <- c(1:(pos_skip_[2]-1))
          idx2 <- c(pos_skip_[2]:(pos_skip_[3]-1))
          idx3 <- c(pos_skip_[3]:(pos_skip_[4]-1))
          idx4 <- c(pos_skip_[4]:length(mgt_crop_sub$crop_mgt))
          mgt_crop_sub$crop_mgt[idx1] <- paste0(mgt_crop_sub$crop_mgt[idx1],'_1')
          mgt_crop_sub$crop_mgt[idx2] <- paste0(mgt_crop_sub$crop_mgt[idx2],'_2')
          mgt_crop_sub$crop_mgt[idx3] <- paste0(mgt_crop_sub$crop_mgt[idx3],'_3')
          mgt_crop_sub$crop_mgt[idx4] <- paste0(mgt_crop_sub$crop_mgt[idx4],'_4')
        }
        if(yr >= 4.5 & yr < 5.5) {
          pos_skip_ <- grep("skip", mgt_crop_sub$operation)
          idx1 <- c(1:(pos_skip_[2]-1))
          idx2 <- c(pos_skip_[2]:(pos_skip_[3]-1))
          idx3 <- c(pos_skip_[3]:(pos_skip_[4]-1))
          idx4 <- c(pos_skip_[4]:(pos_skip_[5]-1))
          idx5 <- c(pos_skip_[5]:length(mgt_crop_sub$crop_mgt))
          mgt_crop_sub$crop_mgt[idx1] <- paste0(mgt_crop_sub$crop_mgt[idx1],'_1')
          mgt_crop_sub$crop_mgt[idx2] <- paste0(mgt_crop_sub$crop_mgt[idx2],'_2')
          mgt_crop_sub$crop_mgt[idx3] <- paste0(mgt_crop_sub$crop_mgt[idx3],'_3')
          mgt_crop_sub$crop_mgt[idx4] <- paste0(mgt_crop_sub$crop_mgt[idx4],'_4')
          mgt_crop_sub$crop_mgt[idx5] <- paste0(mgt_crop_sub$crop_mgt[idx5],'_5')
        }
        if(yr >= 5.5 & yr < 6.5) {
          pos_skip_ <- grep("skip", mgt_crop_sub$operation)
          idx1 <- c(1:(pos_skip_[2]-1))
          idx2 <- c(pos_skip_[2]:(pos_skip_[3]-1))
          idx3 <- c(pos_skip_[3]:(pos_skip_[4]-1))
          idx4 <- c(pos_skip_[4]:(pos_skip_[5]-1))
          idx5 <- c(pos_skip_[5]:(pos_skip_[6]-1))
          idx6 <- c(pos_skip_[6]:length(mgt_crop_sub$crop_mgt))
          mgt_crop_sub$crop_mgt[idx1] <- paste0(mgt_crop_sub$crop_mgt[idx1],'_1')
          mgt_crop_sub$crop_mgt[idx2] <- paste0(mgt_crop_sub$crop_mgt[idx2],'_2')
          mgt_crop_sub$crop_mgt[idx3] <- paste0(mgt_crop_sub$crop_mgt[idx3],'_3')
          mgt_crop_sub$crop_mgt[idx4] <- paste0(mgt_crop_sub$crop_mgt[idx4],'_4')
          mgt_crop_sub$crop_mgt[idx5] <- paste0(mgt_crop_sub$crop_mgt[idx5],'_5')
          mgt_crop_sub$crop_mgt[idx6] <- paste0(mgt_crop_sub$crop_mgt[idx6],'_6')
        }
        if(yr >= 6.5 & yr < 7.5) {
          pos_skip_ <- grep("skip", mgt_crop_sub$operation)
          idx1 <- c(1:(pos_skip_[2]-1))
          idx2 <- c(pos_skip_[2]:(pos_skip_[3]-1))
          idx3 <- c(pos_skip_[3]:(pos_skip_[4]-1))
          idx4 <- c(pos_skip_[4]:(pos_skip_[5]-1))
          idx5 <- c(pos_skip_[5]:(pos_skip_[6]-1))
          idx6 <- c(pos_skip_[6]:(pos_skip_[7]-1))
          idx7 <- c(pos_skip_[7]:length(mgt_crop_sub$crop_mgt))
          mgt_crop_sub$crop_mgt[idx1] <- paste0(mgt_crop_sub$crop_mgt[idx1],'_1')
          mgt_crop_sub$crop_mgt[idx2] <- paste0(mgt_crop_sub$crop_mgt[idx2],'_2')
          mgt_crop_sub$crop_mgt[idx3] <- paste0(mgt_crop_sub$crop_mgt[idx3],'_3')
          mgt_crop_sub$crop_mgt[idx4] <- paste0(mgt_crop_sub$crop_mgt[idx4],'_4')
          mgt_crop_sub$crop_mgt[idx5] <- paste0(mgt_crop_sub$crop_mgt[idx5],'_5')
          mgt_crop_sub$crop_mgt[idx6] <- paste0(mgt_crop_sub$crop_mgt[idx6],'_6')
          mgt_crop_sub$crop_mgt[idx7] <- paste0(mgt_crop_sub$crop_mgt[idx7],'_7')
        }
        mgt_crop[which(mgt_crop$crop_mgt== crop_mgt.list[idz[k]]),] <- mgt_crop_sub
      }
    }

  }

  crop_mgt.list <- unique(mgt_crop$crop_mgt)
  if('lu' %!in% names(lu) & 'type' %in% names(lu)) names(lu)[which(names(lu)=='type')] <- 'lu'
  lu.list <- unique(lu$lu[which(substr(lu$lu,1,nchar(hru_crops))==hru_crops)])
  col1 <- grep(paste0('y_',start_y),names(lu))
  col2 <- grep(paste0('y_',end_y),names(lu))

  ## check if all years have crop information
  na_rows <- lu[which(lu$lu %in% lu.list),1][!complete.cases(lu[which(lu$lu %in% lu.list),c(col1:col2)]), ]
  if(dim(na_rows)[1]>0){
    print('NAs detected in year columns of cropland HRUs. Please check')
    print(na_rows$lu)
    break
  }

  ## make sure, harvest and kill op is separate
  mgt_crop <- mgt_crop %>%
    mutate(n = ifelse(operation == 'harvest & kill' | operation == 'harvest_kill', 2, 1)) %>%
    uncount(., n, .remove = FALSE, .id = 'n_id') %>%
    mutate(operation = ifelse(n == 2 & n_id == 1, 'harvest_only', operation),
           operation = ifelse(n == 2 & n_id == 2, 'kill_only', operation),
           op_data2  = ifelse(n == 2 & n_id == 2, NA, op_data2)) %>%
    select(-n, -n_id)

  ## remove skip line from halfyear summer crop schedules
  if(additional_h_yr_sch_existing=="y"){
    mgt_crop <- mgt_crop[-which(substr(mgt_crop$crop_mgt,1,4) %in% crop_s &
                                  substr(mgt_crop$crop_mgt,nchar(mgt_crop$crop_mgt)-2,nchar(mgt_crop$crop_mgt)-2)=='5' &
                                  mgt_crop$operation=='skip'),]
  }

  ## define list for schedules
  schedules <- setNames(replicate(length(lu.list),data.frame()),lu.list)

  ## build schedules
  for(m in 1:length(lu.list)){

    print(paste0('build schedule for field ', m))

    rota <- as.data.frame(lu[which(lu$lu==lu.list[m])[1],c(col1:col2)])

    # rename multi-year crop name if necessary
    if(m_yr_sch_existing == 'y'){

      for(l in 1:length(crop_myr)){
        if(crop_myr[l] %in% substr(rota,1,nchar(crop_myr[l]))){
          myr_idx <- HighFreq::roll_count(substr(rota,1,nchar(crop_myr[l]))==crop_myr[l])
          myr_max <- myr_idx
          crop_after <- rep(0,length(rota))
          j <- length(rota)

          if(0 %in% myr_max){
            for(i in 1:(j-1)){
              if(myr_idx[i+1]==0 & myr_idx[i]!=0){
                myr_max[(i-myr_idx[i]+1):i] <- myr_idx[i]
                crop_after[i+1] <- 1
              }
            }
            if(myr_idx[j]!=0) myr_max[(j-myr_idx[j]+1):j] <- myr_idx[j]
          }else {
            myr_max[c(1:j)] <- max_yr
            suppressWarnings(myr_idx[c(1:j)] <- rep(seq(1:max_yr)))
          }
          myr_seq <- grep(crop_myr[l], rota)
          pos_scrop <- which(crop_after==1)

          if(all(substr(rota[pos_scrop],1,4)%in%crop_s & length(pos_scrop)==1)){
            idx_myr <- myr_seq[which(myr_seq<pos_scrop)]
            rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

            if(additional_h_yr_sch_existing == 'y') rota[pos_scrop] <- paste0(rota[pos_scrop],'_0.5yr')
          }
          if(length(pos_scrop)==2){
            if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
            }
            if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
            }
          }
          if(length(pos_scrop)==3){

            if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
            }
            if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
            }
            if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
            }
          }
          if(length(pos_scrop)==4){

            if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
            }
            if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
            }
            if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
            }
            if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
            }
          }
          if(length(pos_scrop)==5){

            if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
            }
            if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
            }
            if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
            }
            if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
            }
            if(substr(rota[pos_scrop[5]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[4] & myr_seq<pos_scrop[5])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][5] <- paste0(rota[pos_scrop][5],'_0.5yr')
            }
          }
          if(length(pos_scrop)==6){

            if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
            }
            if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
            }
            if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
            }
            if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
            }
            if(substr(rota[pos_scrop[5]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[4] & myr_seq<pos_scrop[5])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][5] <- paste0(rota[pos_scrop][5],'_0.5yr')
            }
            if(substr(rota[pos_scrop[6]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[5] & myr_seq<pos_scrop[6])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][6] <- paste0(rota[pos_scrop][6],'_0.5yr')
            }
          }
          if(length(pos_scrop)==7){

            if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
            }
            if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
            }
            if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
            }
            if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
            }
            if(substr(rota[pos_scrop[5]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[4] & myr_seq<pos_scrop[5])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][5] <- paste0(rota[pos_scrop][5],'_0.5yr')
            }
            if(substr(rota[pos_scrop[6]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[5] & myr_seq<pos_scrop[6])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][6] <- paste0(rota[pos_scrop][6],'_0.5yr')
            }
            if(substr(rota[pos_scrop[7]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[6] & myr_seq<pos_scrop[7])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][7] <- paste0(rota[pos_scrop][7],'_0.5yr')
            }
          }
          if(length(pos_scrop)==8){

            if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
            }
            if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
            }
            if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
            }
            if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
            }
            if(substr(rota[pos_scrop[5]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[4] & myr_seq<pos_scrop[5])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][5] <- paste0(rota[pos_scrop][5],'_0.5yr')
            }
            if(substr(rota[pos_scrop[6]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[5] & myr_seq<pos_scrop[6])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][6] <- paste0(rota[pos_scrop][6],'_0.5yr')
            }
            if(substr(rota[pos_scrop[7]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[6] & myr_seq<pos_scrop[7])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][7] <- paste0(rota[pos_scrop][7],'_0.5yr')
            }
            if(substr(rota[pos_scrop[8]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[7] & myr_seq<pos_scrop[8])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][8] <- paste0(rota[pos_scrop][8],'_0.5yr')
            }
          }
          if(length(pos_scrop)==9){

            if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
            }
            if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
            }
            if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
            }
            if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
            }
            if(substr(rota[pos_scrop[5]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[4] & myr_seq<pos_scrop[5])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][5] <- paste0(rota[pos_scrop][5],'_0.5yr')
            }
            if(substr(rota[pos_scrop[6]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[5] & myr_seq<pos_scrop[6])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][6] <- paste0(rota[pos_scrop][6],'_0.5yr')
            }
            if(substr(rota[pos_scrop[7]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[6] & myr_seq<pos_scrop[7])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][7] <- paste0(rota[pos_scrop][7],'_0.5yr')
            }
            if(substr(rota[pos_scrop[8]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[7] & myr_seq<pos_scrop[8])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][8] <- paste0(rota[pos_scrop][8],'_0.5yr')
            }
            if(substr(rota[pos_scrop[9]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[8] & myr_seq<pos_scrop[9])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][9] <- paste0(rota[pos_scrop][9],'_0.5yr')
            }
          }
          if(length(pos_scrop)==10){

            if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
            }
            if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
            }
            if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
            }
            if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
            }
            if(substr(rota[pos_scrop[5]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[4] & myr_seq<pos_scrop[5])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][5] <- paste0(rota[pos_scrop][5],'_0.5yr')
            }
            if(substr(rota[pos_scrop[6]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[5] & myr_seq<pos_scrop[6])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][6] <- paste0(rota[pos_scrop][6],'_0.5yr')
            }
            if(substr(rota[pos_scrop[7]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[6] & myr_seq<pos_scrop[7])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][7] <- paste0(rota[pos_scrop][7],'_0.5yr')
            }
            if(substr(rota[pos_scrop[8]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[7] & myr_seq<pos_scrop[8])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][8] <- paste0(rota[pos_scrop][8],'_0.5yr')
            }
            if(substr(rota[pos_scrop[9]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[8] & myr_seq<pos_scrop[9])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][9] <- paste0(rota[pos_scrop][9],'_0.5yr')
            }
            if(substr(rota[pos_scrop[10]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[9] & myr_seq<pos_scrop[10])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][10] <- paste0(rota[pos_scrop][10],'_0.5yr')
            }
          }
          if(length(pos_scrop)==11){

            if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
            }
            if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
            }
            if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
            }
            if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
            }
            if(substr(rota[pos_scrop[5]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[4] & myr_seq<pos_scrop[5])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][5] <- paste0(rota[pos_scrop][5],'_0.5yr')
            }
            if(substr(rota[pos_scrop[6]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[5] & myr_seq<pos_scrop[6])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][6] <- paste0(rota[pos_scrop][6],'_0.5yr')
            }
            if(substr(rota[pos_scrop[7]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[6] & myr_seq<pos_scrop[7])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][7] <- paste0(rota[pos_scrop][7],'_0.5yr')
            }
            if(substr(rota[pos_scrop[8]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[7] & myr_seq<pos_scrop[8])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][8] <- paste0(rota[pos_scrop][8],'_0.5yr')
            }
            if(substr(rota[pos_scrop[9]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[8] & myr_seq<pos_scrop[9])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][9] <- paste0(rota[pos_scrop][9],'_0.5yr')
            }
            if(substr(rota[pos_scrop[10]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[9] & myr_seq<pos_scrop[10])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][10] <- paste0(rota[pos_scrop][10],'_0.5yr')
            }
            if(substr(rota[pos_scrop[11]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[10] & myr_seq<pos_scrop[11])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][11] <- paste0(rota[pos_scrop][11],'_0.5yr')
            }
          }
          if(length(pos_scrop)==12){

            if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
            }
            if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
            }
            if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
            }
            if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
            }
            if(substr(rota[pos_scrop[5]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[4] & myr_seq<pos_scrop[5])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][5] <- paste0(rota[pos_scrop][5],'_0.5yr')
            }
            if(substr(rota[pos_scrop[6]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[5] & myr_seq<pos_scrop[6])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][6] <- paste0(rota[pos_scrop][6],'_0.5yr')
            }
            if(substr(rota[pos_scrop[7]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[6] & myr_seq<pos_scrop[7])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][7] <- paste0(rota[pos_scrop][7],'_0.5yr')
            }
            if(substr(rota[pos_scrop[8]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[7] & myr_seq<pos_scrop[8])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][8] <- paste0(rota[pos_scrop][8],'_0.5yr')
            }
            if(substr(rota[pos_scrop[9]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[8] & myr_seq<pos_scrop[9])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][9] <- paste0(rota[pos_scrop][9],'_0.5yr')
            }
            if(substr(rota[pos_scrop[10]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[9] & myr_seq<pos_scrop[10])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][10] <- paste0(rota[pos_scrop][10],'_0.5yr')
            }
            if(substr(rota[pos_scrop[11]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[10] & myr_seq<pos_scrop[11])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][11] <- paste0(rota[pos_scrop][11],'_0.5yr')
            }
            if(substr(rota[pos_scrop[12]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[11] & myr_seq<pos_scrop[12])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][12] <- paste0(rota[pos_scrop][12],'_0.5yr')
            }
          }
          if(length(pos_scrop)==13){

            if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
            }
            if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
            }
            if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
            }
            if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
            }
            if(substr(rota[pos_scrop[5]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[4] & myr_seq<pos_scrop[5])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][5] <- paste0(rota[pos_scrop][5],'_0.5yr')
            }
            if(substr(rota[pos_scrop[6]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[5] & myr_seq<pos_scrop[6])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][6] <- paste0(rota[pos_scrop][6],'_0.5yr')
            }
            if(substr(rota[pos_scrop[7]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[6] & myr_seq<pos_scrop[7])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][7] <- paste0(rota[pos_scrop][7],'_0.5yr')
            }
            if(substr(rota[pos_scrop[8]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[7] & myr_seq<pos_scrop[8])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][8] <- paste0(rota[pos_scrop][8],'_0.5yr')
            }
            if(substr(rota[pos_scrop[9]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[8] & myr_seq<pos_scrop[9])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][9] <- paste0(rota[pos_scrop][9],'_0.5yr')
            }
            if(substr(rota[pos_scrop[10]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[9] & myr_seq<pos_scrop[10])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][10] <- paste0(rota[pos_scrop][10],'_0.5yr')
            }
            if(substr(rota[pos_scrop[11]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[10] & myr_seq<pos_scrop[11])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][11] <- paste0(rota[pos_scrop][11],'_0.5yr')
            }
            if(substr(rota[pos_scrop[12]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[11] & myr_seq<pos_scrop[12])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][12] <- paste0(rota[pos_scrop][12],'_0.5yr')
            }
            if(substr(rota[pos_scrop[13]],1,4)%in%crop_s){
              idx_myr <- myr_seq[which(myr_seq>pos_scrop[12] & myr_seq<pos_scrop[13])]
              rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

              if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][13] <- paste0(rota[pos_scrop][13],'_0.5yr')
            }
          }
          if(length(pos_scrop)==14){

              if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
              }
              if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
              }
              if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
              }
              if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
              }
              if(substr(rota[pos_scrop[5]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[4] & myr_seq<pos_scrop[5])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][5] <- paste0(rota[pos_scrop][5],'_0.5yr')
              }
              if(substr(rota[pos_scrop[6]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[5] & myr_seq<pos_scrop[6])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][6] <- paste0(rota[pos_scrop][6],'_0.5yr')
              }
              if(substr(rota[pos_scrop[7]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[6] & myr_seq<pos_scrop[7])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][7] <- paste0(rota[pos_scrop][7],'_0.5yr')
              }
              if(substr(rota[pos_scrop[8]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[7] & myr_seq<pos_scrop[8])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][8] <- paste0(rota[pos_scrop][8],'_0.5yr')
              }
              if(substr(rota[pos_scrop[9]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[8] & myr_seq<pos_scrop[9])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][9] <- paste0(rota[pos_scrop][9],'_0.5yr')
              }
              if(substr(rota[pos_scrop[10]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[9] & myr_seq<pos_scrop[10])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][10] <- paste0(rota[pos_scrop][10],'_0.5yr')
              }
              if(substr(rota[pos_scrop[11]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[10] & myr_seq<pos_scrop[11])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][11] <- paste0(rota[pos_scrop][11],'_0.5yr')
              }
              if(substr(rota[pos_scrop[12]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[11] & myr_seq<pos_scrop[12])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][12] <- paste0(rota[pos_scrop][12],'_0.5yr')
              }
              if(substr(rota[pos_scrop[13]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[12] & myr_seq<pos_scrop[13])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][13] <- paste0(rota[pos_scrop][13],'_0.5yr')
              }
              if(substr(rota[pos_scrop[14]],1,4)%in%crop_s){
                idx_myr <- myr_seq[which(myr_seq>pos_scrop[13] & myr_seq<pos_scrop[14])]
                rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][14] <- paste0(rota[pos_scrop][14],'_0.5yr')
              }
            }
          if(length(pos_scrop)==15){

                if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
                }
                if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
                }
                if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
                }
                if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
                }
                if(substr(rota[pos_scrop[5]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[4] & myr_seq<pos_scrop[5])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][5] <- paste0(rota[pos_scrop][5],'_0.5yr')
                }
                if(substr(rota[pos_scrop[6]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[5] & myr_seq<pos_scrop[6])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][6] <- paste0(rota[pos_scrop][6],'_0.5yr')
                }
                if(substr(rota[pos_scrop[7]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[6] & myr_seq<pos_scrop[7])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][7] <- paste0(rota[pos_scrop][7],'_0.5yr')
                }
                if(substr(rota[pos_scrop[8]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[7] & myr_seq<pos_scrop[8])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][8] <- paste0(rota[pos_scrop][8],'_0.5yr')
                }
                if(substr(rota[pos_scrop[9]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[8] & myr_seq<pos_scrop[9])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][9] <- paste0(rota[pos_scrop][9],'_0.5yr')
                }
                if(substr(rota[pos_scrop[10]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[9] & myr_seq<pos_scrop[10])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][10] <- paste0(rota[pos_scrop][10],'_0.5yr')
                }
                if(substr(rota[pos_scrop[11]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[10] & myr_seq<pos_scrop[11])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][11] <- paste0(rota[pos_scrop][11],'_0.5yr')
                }
                if(substr(rota[pos_scrop[12]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[11] & myr_seq<pos_scrop[12])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][12] <- paste0(rota[pos_scrop][12],'_0.5yr')
                }
                if(substr(rota[pos_scrop[13]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[12] & myr_seq<pos_scrop[13])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][13] <- paste0(rota[pos_scrop][13],'_0.5yr')
                }
                if(substr(rota[pos_scrop[14]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[13] & myr_seq<pos_scrop[14])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][14] <- paste0(rota[pos_scrop][14],'_0.5yr')
                }
                if(substr(rota[pos_scrop[15]],1,4)%in%crop_s){
                  idx_myr <- myr_seq[which(myr_seq>pos_scrop[14] & myr_seq<pos_scrop[15])]
                  rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                  if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][15] <- paste0(rota[pos_scrop][15],'_0.5yr')
                }
              }
          if(length(pos_scrop)==16){

                  if(substr(rota[pos_scrop[1]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq<pos_scrop[1])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][1] <- paste0(rota[pos_scrop][1],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[2]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[1] & myr_seq<pos_scrop[2])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][2] <- paste0(rota[pos_scrop][2],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[3]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[2] & myr_seq<pos_scrop[3])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][3] <- paste0(rota[pos_scrop][3],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[4]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[3] & myr_seq<pos_scrop[4])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][4] <- paste0(rota[pos_scrop][4],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[5]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[4] & myr_seq<pos_scrop[5])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][5] <- paste0(rota[pos_scrop][5],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[6]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[5] & myr_seq<pos_scrop[6])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][6] <- paste0(rota[pos_scrop][6],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[7]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[6] & myr_seq<pos_scrop[7])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][7] <- paste0(rota[pos_scrop][7],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[8]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[7] & myr_seq<pos_scrop[8])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][8] <- paste0(rota[pos_scrop][8],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[9]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[8] & myr_seq<pos_scrop[9])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][9] <- paste0(rota[pos_scrop][9],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[10]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[9] & myr_seq<pos_scrop[10])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][10] <- paste0(rota[pos_scrop][10],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[11]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[10] & myr_seq<pos_scrop[11])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][11] <- paste0(rota[pos_scrop][11],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[12]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[11] & myr_seq<pos_scrop[12])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][12] <- paste0(rota[pos_scrop][12],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[13]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[12] & myr_seq<pos_scrop[13])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][13] <- paste0(rota[pos_scrop][13],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[14]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[13] & myr_seq<pos_scrop[14])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][14] <- paste0(rota[pos_scrop][14],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[15]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[14] & myr_seq<pos_scrop[15])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][15] <- paste0(rota[pos_scrop][15],'_0.5yr')
                  }
                  if(substr(rota[pos_scrop[16]],1,4)%in%crop_s){
                    idx_myr <- myr_seq[which(myr_seq>pos_scrop[15] & myr_seq<pos_scrop[16])]
                    rota[idx_myr] <- paste0(rota[idx_myr],'_',myr_max[idx_myr]-1,'.5yr','_',myr_idx[idx_myr])

                    if(additional_h_yr_sch_existing == 'y') rota[pos_scrop][16] <- paste0(rota[pos_scrop][16],'_0.5yr')
                  }
          }

          if(is.integer0(grep('.5',rota[myr_seq]))){
            rota[myr_seq] <- paste0(rota[myr_seq],'_',myr_max[myr_seq],'.0yr','_',myr_idx[myr_seq])
          }else{
            no_chg <- grep('.5',rota[myr_seq])
            rota[myr_seq][-no_chg] <- paste0(rota[myr_seq][-no_chg],'_',myr_max[myr_seq][-no_chg],'.0yr','_',myr_idx[myr_seq][-no_chg])
          }
        }
      }

    }

    mgt_x <- mgt_crop[which(mgt_crop$crop_mgt==rota[1,1]),]

    for(k in 2:length(rota)){
      mgt_x <- rbind.data.frame(mgt_x, mgt_crop[which(mgt_crop$crop_mgt==rota[1,k]),])
    }

    #`%!in%` = negate(`%in%`)
    if(substr(mgt_x$crop_mgt[1],1,nchar(crop_myr)) %!in% crop_myr){
      pos_skip <- grep("skip", mgt_x$operation)[1]
      mgt_x <- rbind.data.frame(mgt_x[c((pos_skip+1):dim(mgt_x)[1]),],mgt_x[c(1:pos_skip),])
    }

    mgt_x$land_use <- lu$lu[which(lu$lu==lu.list[m])[1]]

    plnt_op <- mgt_x %>%
      filter(operation %in% c('plant', 'harvest_only', 'kill_only')) %>%
      group_by(land_use) %>%
      group_split() %>%
      map(., ~ .x[1:min(nrow(.x), 2), ])

    needs_ini <- map_lgl(plnt_op, ~ .x$operation[1] != 'plant')

    if(needs_ini==T){
      mgt_x <- rbind.data.frame(mgt_x[1,],mgt_x)
      mgt_x[1,c(1:5,9:11)] <- NA
      mgt_x[1,6] <- 'initial_plant'
      plnt_op_df <- as.data.frame(plnt_op)
      mgt_x[1,7] <- plnt_op_df$op_data1[1]
      mgt_x[1,8] <- '1,1000,0,0,1,1000'
    }
    schedules[[m]] <- mgt_x

  }

  return(schedules)
}

check_date_conflicts2 <- function(){
  mgt_conflict <-list(rota_schedules[[1]])
  crop_conflict <- data.frame(matrix(data=NA, nrow=1, ncol=2))
  names(crop_conflict) <- c('V1','V2')
  if('lu' %!in% names(lu) & 'type' %in% names(lu)) names(lu)[which(names(lu)=='type')] <- 'lu'
  lu.list <- unique(lu$lu[which(substr(lu$lu,1,nchar(hru_crops))==hru_crops)])

  for(k in 1:length(lu.list)){

    print(paste0('check schedule for field ', k))
    mgt_field <- rota_schedules[[k]] #get schedule for a field
    skip_field <- c(1,grep('skip',mgt_field$operation)) #get all transitions among years

    if(length(skip_field) > 8) skip_field <- skip_field[1:8] #shorten sequence if appropriate
    for(i in 2:length(skip_field)){
      mgt_sub <- mgt_field[c((skip_field[i-1]+1):(skip_field[i]-1)),] #schedule for a year
      if(is.unsorted(mgt_sub$doy2, na.rm=T)){ #any conflict in ending operation dates?
        mgt_sub$year <- start_y+i-2 #add year
        mgt_conflict_ <- list(mgt_sub) #save conflicted full year schedule
        mgt_conflict <- c(mgt_conflict,mgt_conflict_)
        crop_conflict_ <- as.data.frame(t(unlist(unique(mgt_sub$crop_mgt)))) #save conflicted crop combi
        if(length(crop_conflict_)==1) crop_conflict_$V2 <- crop_conflict_$V1
        if(length(crop_conflict_)==3){
          crop_conflict_ <- rbind.data.frame(crop_conflict_, crop_conflict_)
          crop_conflict_[2,1] <- crop_conflict_[2,2]
          crop_conflict_[2,2] <- crop_conflict_[2,3]
          crop_conflict_ <- crop_conflict_[,-3]
            }
        crop_conflict <- rbind.data.frame(crop_conflict,crop_conflict_)
      }
    }
  }

  mgt_conflict <- mgt_conflict[-1]
  mgt_conflict <- rbindlist(mgt_conflict, fill=T)
  crop_conflict <- crop_conflict[-1,]
  crop_comb <- paste(crop_conflict$V1,crop_conflict$V2,sep='/')
  crop_conflict_unique <- as.data.frame(unique(crop_comb))

  crop_conflict_unique <- colsplit(crop_conflict_unique$`unique(crop_comb)`, '/', names =  c('crop1','crop2'))

  if(dim(crop_conflict_unique)[1]>0){
    write.csv(mgt_conflict, "mgt_conflict.csv", row.names = F, quote=F)
    write.csv(crop_conflict_unique, "crop_comb_conflict.csv", row.names = F, quote=F)
    return(print(list("Date conflicts were detected :( Please check 'crop_comb_conflict.csv' to see for which crops.",
                      "You can study all conflicting schedules in 'mgt_conflict.csv'.",
                      "Please correct severe conflicts manually in your input management schedules .csv file and rerun the whole script.",
                      "If there are only a few days/weeks overlapping, you can solve these conflicts with the next function")))
  }else(return(print("No conflicts detected :)")))
}

solve_date_conflicts <- function(){
  if('lu' %!in% names(lu) & 'type' %in% names(lu)) names(lu)[which(names(lu)=='type')] <- 'lu'
  lu.list <- unique(lu$lu[which(substr(lu$lu,1,nchar(hru_crops))==hru_crops)])
  for(k in 1:length(lu.list)){ #for each field...
    print(paste0('repair schedule for field ', k))
    mgt_field <- rota_schedules[[k]] #get schedule
    skip_field <- c(1,grep('skip',mgt_field$operation)) #get transition among years
    for(i in 2:length(skip_field)){ #for each year...

      mgt_sub <- mgt_field[c((skip_field[i-1]+1):(skip_field[i]-1)),] #get schedule
      # idq <- which(duplicated(paste0(mgt_sub$doy1,mgt_sub$doy1)) & mgt_sub$operation!='kill_only')-1
      # if(is.integer0(idq)==F){
      #   mgt_sub$doy1[idq] <- mgt_sub$doy1[idq]-rev(rank(idq))
      #   mgt_sub$doy2[idq] <- mgt_sub$doy2[idq]-rev(rank(idq))
      # }

      if(is.unsorted(mgt_sub$doy2, na.rm=T)){ #if conflict in ending dates of operation

        idx <- which(diff(mgt_sub$doy2)<0) #detect position of conflict

        if(length(idx)==1){
          idy <- which(mgt_sub$doy2[idx:length(mgt_sub$doy2)]-mgt_sub$doy2[idx] <= 0) + idx -1 #and all conflicting lines behind
          # first round of date shifting
          # converge conflicting dates as long as needed and possible
          # in maximum, until there is a conflict with previous operation date

          if(idx > 1){
            while(mgt_sub$doy2[idx] > mgt_sub$doy2[idy[2]] & (mgt_sub$doy2[idx-1]+1) < mgt_sub$doy2[idx]){
              if(substr(mgt_sub$crop_mgt[idx],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                mgt_sub$doy2[idx] <- mgt_sub$doy2[idx]-1 #change only date for multi-year grass
              }
              else if(substr(mgt_sub$crop_mgt[idx+1],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1 #change only date for multi-year grass
              }
              else{
                mgt_sub$doy2[idx] <- mgt_sub$doy2[idx]-1
                mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1
              }
            }
          }

          # second round of date shifting
          # now shift conflicting dates but also the operation before as long as needed and possible
          # in maximum, until there is a conflict with previous operation date
          if(mgt_sub$doy2[idx] > mgt_sub$doy2[idy[2]] & idx > 2){
            while(mgt_sub$doy2[idx] > mgt_sub$doy2[idy[2]] & (mgt_sub$doy2[idx-2]+1) < mgt_sub$doy2[idx-1]){
              if(substr(mgt_sub$crop_mgt[idx],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                mgt_sub$doy2[c(idx-1,idx)] <- mgt_sub$doy2[c(idx-1,idx)]-1 #change only date for multi-year grass
              }
              else if(substr(mgt_sub$crop_mgt[idx+1],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1 #change only date for multi-year grass
              }
              else{
                mgt_sub$doy2[c(idx-1,idx)] <- mgt_sub$doy2[c(idx-1,idx)]-1
                mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1
              }
            }
          }

          # third round of date shifting
          # now shift conflicting dates but also two operations before last as long as needed and possible
          # in maximum, until there is a conflict with previous operation date
          if(mgt_sub$doy2[idx] > mgt_sub$doy2[idy[2]] & idx > 3){
            while(mgt_sub$doy2[idx] > mgt_sub$doy2[idy[2]] & (mgt_sub$doy2[idx-3]+1) < mgt_sub$doy2[idx-2]){
              if(substr(mgt_sub$crop_mgt[idx],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                mgt_sub$doy2[c(idx-2,idx-1,idx)] <- mgt_sub$doy2[c(idx-2,idx-1,idx)]-1 #change only date for multi-year grass
              }
              else if(substr(mgt_sub$crop_mgt[idx+1],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1 #change only date for multi-year grass
              }
              else{
                mgt_sub$doy2[c(idx-2,idx-1,idx)] <- mgt_sub$doy2[c(idx-2,idx-1,idx)]-1
                mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1
              }
            }
          }

          # date shift at the very beginning of a schedule (not addressed in rounds before)
          if(mgt_sub$doy2[1] > mgt_sub$doy2[idy[2]]){
            while(mgt_sub$doy2[idx] > mgt_sub$doy2[idy[2]]){
              mgt_sub$doy2[c(1:idx)] <- mgt_sub$doy2[c(1:idx)]-1
              mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1
            }
          }

        }else{
          for(f in 1:length(idx)){
            if(f < length(idx)){
              idy <- which(mgt_sub$doy2[idx[f]:idx[f+1]-1]-mgt_sub$doy2[idx[f]] <= 0) + idx[f] -1
              # first round of date shifting
              # converge conflicting dates as long as needed and possible
              # in maximum, until there is a conflict with previous operation date

              if(idx[f] > 1){
                while(mgt_sub$doy2[idx[f]] > mgt_sub$doy2[idy[2]] & (mgt_sub$doy2[idx[f]-1]+1) < mgt_sub$doy2[idx[f]]){
                  if(substr(mgt_sub$crop_mgt[idx[f]],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                    mgt_sub$doy2[idx[f]] <- mgt_sub$doy2[idx[f]]-1 #change only date for multi-year grass
                  }
                  else if(substr(mgt_sub$crop_mgt[idx+1],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                    mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1 #change only date for multi-year grass
                  }
                  else{
                    mgt_sub$doy2[idx[f]] <- mgt_sub$doy2[idx[f]]-1
                    mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1
                  }
                }
              }

              # second round of date shifting
              # now shift conflicting dates but also the operation before as long as needed and possible
              # in maximum, until there is a conflict with previous operation date
              if(mgt_sub$doy2[idx[f]] > mgt_sub$doy2[idy[2]] & idx[f] > 2){
                while(mgt_sub$doy2[idx[f]] > mgt_sub$doy2[idy[2]] & (mgt_sub$doy2[idx[f]-2]+1) < mgt_sub$doy2[idx[f]-1]){
                  if(substr(mgt_sub$crop_mgt[idx[f]],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                    mgt_sub$doy2[c(idx[f]-1,idx[f])] <- mgt_sub$doy2[c(idx[f]-1,idx[f])]-1 #change only date for multi-year grass
                  }
                  else if(substr(mgt_sub$crop_mgt[idx+1],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                    mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1 #change only date for multi-year grass
                  }
                  else{
                    mgt_sub$doy2[c(idx[f]-1,idx[f])] <- mgt_sub$doy2[c(idx[f]-1,idx[f])]-1
                    mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1
                  }
                }
              }

              # third round of date shifting
              # now shift conflicting dates but also two operations before last as long as needed and possible
              # in maximum, until there is a conflict with previous operation date
              if(mgt_sub$doy2[idx[f]] > mgt_sub$doy2[idy[2]] & idx[f] > 3){
                while(mgt_sub$doy2[idx[f]] > mgt_sub$doy2[idy[2]] & (mgt_sub$doy2[idx[f]-3]+1) < mgt_sub$doy2[idx[f]-2]){
                  if(substr(mgt_sub$crop_mgt[idx[f]],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                    mgt_sub$doy2[c(idx[f]-2,idx[f]-1,idx[f])] <- mgt_sub$doy2[c(idx[f]-2,idx[f]-1,idx[f])]-1 #change only date for multi-year grass
                  }
                  else if(substr(mgt_sub$crop_mgt[idx+1],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                    mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1 #change only date for multi-year grass
                  }
                  else{
                    mgt_sub$doy2[c(idx[f]-2,idx[f]-1,idx[f])] <- mgt_sub$doy2[c(idx[f]-2,idx[f]-1,idx[f])]-1
                    mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1
                  }
                }
              }
              # date shift at the very beginning of a schedule (not addressed in rounds before)
              if(f==1 & mgt_sub$doy2[1] > mgt_sub$doy2[idy[2]]){
                while(mgt_sub$doy2[idx[1]] > mgt_sub$doy2[idy[2]]){
                  mgt_sub$doy2[c(1:idx[1])] <- mgt_sub$doy2[c(1:idx[1])]-1
                  mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1
                }
              }
            }else{
              idy <- which(mgt_sub$doy2[idx[f]:length(mgt_sub$doy2)]-mgt_sub$doy2[idx[f]] <= 0) + idx[f] - 1
              # first round of date shifting
              # converge conflicting dates as long as needed and possible
              # in maximum, until there is a conflict with previous operation date

              if(idx[f] > 1){
                while(mgt_sub$doy2[idx[f]] > mgt_sub$doy2[idy[2]] & (mgt_sub$doy2[idx[f]-1]+1) < mgt_sub$doy2[idx[f]]){
                  if(substr(mgt_sub$crop_mgt[idx[f]],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                    mgt_sub$doy2[idx[f]] <- mgt_sub$doy2[idx[f]]-1 #change only date for multi-year grass
                  }
                  else if(substr(mgt_sub$crop_mgt[idx+1],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                    mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1 #change only date for multi-year grass
                  }
                  else{
                    mgt_sub$doy2[idx[f]] <- mgt_sub$doy2[idx[f]]-1
                    mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1
                  }
                }
              }

              # second round of date shifting
              # now shift conflicting dates but also the operation before as long as needed and possible
              # in maximum, until there is a conflict with previous operation date
              if(mgt_sub$doy2[idx[f]] > mgt_sub$doy2[idy[2]] & idx[f] > 2){
                while(mgt_sub$doy2[idx[f]] > mgt_sub$doy2[idy[2]] & (mgt_sub$doy2[idx[f]-2]+1) < mgt_sub$doy2[idx[f]-1]){
                  if(substr(mgt_sub$crop_mgt[idx[f]],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                    mgt_sub$doy2[c(idx[f]-1,idx[f])] <- mgt_sub$doy2[c(idx[f]-1,idx[f])]-1 #change only date for multi-year grass
                  }
                  else if(substr(mgt_sub$crop_mgt[idx+1],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                    mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1 #change only date for multi-year grass
                  }
                  else{
                    mgt_sub$doy2[c(idx[f]-1,idx[f])] <- mgt_sub$doy2[c(idx[f]-1,idx[f])]-1
                    mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1
                  }
                }
              }

              # third round of date shifting
              # now shift conflicting dates but also two operations before last as long as needed and possible
              # in maximum, until there is a conflict with previous operation date
              if(mgt_sub$doy2[idx[f]] > mgt_sub$doy2[idy[2]] & idx[f] > 3){
                while(mgt_sub$doy2[idx[f]] > mgt_sub$doy2[idy[2]] & (mgt_sub$doy2[idx[f]-3]+1) < mgt_sub$doy2[idx[f]-2]){
                  if(substr(mgt_sub$crop_mgt[idx[f]],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                    mgt_sub$doy2[c(idx[f]-2,idx[f]-1,idx[f])] <- mgt_sub$doy2[c(idx[f]-2,idx[f]-1,idx[f])]-1 #change only date for multi-year grass
                  }
                  else if(substr(mgt_sub$crop_mgt[idx+1],1,4) %in% crop_myr){ #if prior crop at conflict is multi-year grass
                    mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1 #change only date for multi-year grass
                  }
                  else{
                    mgt_sub$doy2[c(idx[f]-2,idx[f]-1,idx[f])] <- mgt_sub$doy2[c(idx[f]-2,idx[f]-1,idx[f])]-1
                    mgt_sub$doy2[idy][-1] <- mgt_sub$doy2[idy][-1]+1
                  }
                }
              }
            }
          }
        }

        # correction of starting dates if they are unsorted
        idx2 <- which(diff(mgt_sub$doy1)<0)
        if(is.integer0(idx2)==F){
          if(length(idx2)==1){
            idy2 <- which(mgt_sub$doy1[idx2:length(mgt_sub$doy1)]-mgt_sub$doy1[idx2] <= 0) + idx2 -1
            mgt_sub$doy1[idy2][-1] <- mgt_sub$doy1[idy2][-1] - diff(mgt_sub$doy1)[idx2] + 1
          }else{
            for(s in 1:length(idx2)){
              if(s < length(idx2)){
                idy2 <- which(mgt_sub$doy1[(idx2[s]+1):(idx2[s+1]-1)]-mgt_sub$doy1[idx2[s]] <= 0) + idx2[s]
                mgt_sub$doy1[idy2] <- mgt_sub$doy1[idy2] - diff(mgt_sub$doy1)[idx2[s]] + 1
              }else{
                idy2 <- which(mgt_sub$doy1[idx2[s]:length(mgt_sub$doy1)]-mgt_sub$doy1[idx2[s]] <= 0) + idx2[s] -1
                mgt_sub$doy1[idy2][-1] <- mgt_sub$doy1[idy2][-1] - diff(mgt_sub$doy1)[idx2[s]] + 1
              }
            }
          }
        }

        # correction of ending dates, if ops have different starting dates but equal ending dates
        # make sure the time intervals for each op have a minimum length of five days
        for(j in 1:length(mgt_sub$crop_mgt)){
          if((mgt_sub$doy1[j]+7) > mgt_sub$doy2[j]){
            while((mgt_sub$doy1[j]+7) > mgt_sub$doy2[j]){
              mgt_sub$doy1[j] <- mgt_sub$doy1[j]-1
            }
          }
        }

        # update farmR date columns
        mgt_sub$mon_1 <- month(as.Date(mgt_sub$doy1, origin = "2001-01-01"))
        mgt_sub$day_1 <- day(as.Date(mgt_sub$doy1, origin = "2001-01-01"))
        mgt_sub$mon_2 <- month(as.Date(mgt_sub$doy2, origin = "2001-01-01"))
        mgt_sub$day_2 <- day(as.Date(mgt_sub$doy2, origin = "2001-01-01"))

        # update field schedule with the corrected schedule for the year
        mgt_field[c((skip_field[i-1]+1):(skip_field[i]-1)),] <- mgt_sub
      } #end if unsorted
    } #end loop over years
    rota_schedules[[k]] <- mgt_field #update schedule list with corrected version for the field
  }
  return(rota_schedules)
}

write_farmR_input <- function(){
  rota_schedules <- rbindlist(rota_schedules)
  rota_schedules <- rota_schedules %>%
    mutate(condition_schedule = paste0('(md >= ',sprintf("%02d", mon_1),sprintf("%02d", day_1),
                                       ') * (md <= ',sprintf("%02d", mon_2),sprintf("%02d", day_2),
                                       ') * (1 - w_log(pcp, 0, 7)) * (1 - w_log(api, 5, 20)) * (year == (year(prev_op)'))

  skip_all <- which(rota_schedules$operation == 'skip')
  if(any(rota_schedules[skip_all[length(skip_all)],]!=rota_schedules[dim(rota_schedules)[1],], na.rm=T)=='FALSE') skip_all <- skip_all[-length(skip_all)]
  rota_schedules$condition_schedule[skip_all] <- ''
  rota_schedules$condition_schedule[-c(skip_all,skip_all+1)] <- paste0(rota_schedules$condition_schedule[-c(skip_all,skip_all+1)], '))')
  rota_schedules$condition_schedule[skip_all+1] <- paste0(rota_schedules$condition_schedule[skip_all+1], ' + 1))')
  rota_schedules <- rota_schedules[-skip_all,]
  if(rota_schedules$operation[dim(rota_schedules)[1]]=='skip') rota_schedules <- rota_schedules[-dim(rota_schedules)[1],]

  # make sure first operation in the schedule gets the +1 in the condition
  n_char <- min(nchar(rota_schedules$condition_schedule))

  # summer crops or farmland grass at the beginning
  ids <- which(!duplicated(rota_schedules$land_use) &
                 substr(rota_schedules$crop_mgt,1,4) %in% c(crop_s,crop_myr) &
                 nchar(rota_schedules$condition_schedule) == n_char)

  rota_schedules$condition_schedule[ids] <- paste0(substr(rota_schedules$condition_schedule[ids],1,n_char-2),' + 1))')

  # winter crops at the beginning
  idw <- which(rota_schedules$operation == 'initial_plant') + 1

  rota_schedules$condition_schedule[idw] <- paste0(substr(rota_schedules$condition_schedule[idw],1,n_char-2),' + 1))')

  rota_schedules$condition_schedule[which(rota_schedules$operation=='initial_plant')] <- ''

  rota_schedules$management <- ''
  rota_schedules$weight <- ''
  rota_schedules$filter_attribute <- ''

  rota_schedules2 <- rota_schedules[,c(12,14:16,13,6:9)]
  rota_schedules2[is.na(rota_schedules2)] <- ''

  rota_schedules2$land_use <- paste0(rota_schedules2$land_use,'_lum')

  vect2 <- c(substr(rota_schedules2$condition_schedule[-1],1,27),NA)
  idz <- which(substr(rota_schedules2$condition_schedule,1,27) == vect2)+1
  rota_schedules2$condition_schedule[idz] <- ''

  # add infos for generic lu classes
  mgt_generic <- mgt_generic %>%
    mutate(condition_schedule = if_else(paste(mon_1,day_1,sep="_") == paste(mon_2,day_2,sep="_"),
      paste0('(md == ',sprintf("%02d", mon_1),sprintf("%02d", day_1),')'),
      paste0('(md >= ',sprintf("%02d", mon_1),sprintf("%02d", day_1),
                                  ') * (md <= ',sprintf("%02d", mon_2),sprintf("%02d", day_2),
                                  ') * (1 - w_log(pcp, 0, 7)) * (1 - w_log(api, 5, 20)) * (year == (year(prev_op)')))

  vect3 <- c(mgt_generic$lulc_mgt[-1],NA)
  idq <- which(mgt_generic$lulc_mgt == vect3)
  p_ini <- which(is.na(mgt_generic$mon_1))
  idf <- idq[which(idq %in% p_ini)]+1
  #`%!in%` = negate(`%in%`)
  idg <- idq[which(idq %!in% p_ini)]+1
  mgt_generic$condition_schedule[p_ini] <- ''
  idh <- which(paste(mgt_generic$mon_1,mgt_generic$day_1,sep="_") == paste(mgt_generic$mon_2,mgt_generic$day_2,sep="_") & is.na(mgt_generic$day_2)==F)
  if(is.integer0(idh)==F) idf <- idf[-which(idf %in% idh)]

  mgt_generic$condition_schedule[idg] <- paste0(mgt_generic$condition_schedule[idg], '))')
  mgt_generic$condition_schedule[idf] <- paste0(mgt_generic$condition_schedule[idf], ' + 1))')

  mgt_generic$management <- ''
  mgt_generic$weight <- ''
  mgt_generic$filter_attribute <- ''

  mgt_generic2 <- mgt_generic[,c(1,11:13,10,6:9)]
  mgt_generic2[is.na(mgt_generic2)] <- ''

  names(mgt_generic2)[1] <- 'land_use'
  mgt_generic2$land_use <- paste0(mgt_generic2$land_use,'_lum')

  all_schedules <- rbind.data.frame(rota_schedules2, mgt_generic2)

  write_csv(all_schedules, file = 'farmR_input.csv', quote = "needed", na = '')
  return(print(list("The SWATfarmR input is written to 'farmR_input.csv'.",
                    "If appropriate, add management schedules for generic land covers, such as orchards, pastures and meadows.",
                    "(example schedules for generic land covers in SWATfarmR format are provided in farmR_lulc_generic.csv)",
                    "Use this file as input for the SWATfarmR package.")))
}

