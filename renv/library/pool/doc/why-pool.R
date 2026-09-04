## ----include = FALSE----------------------------------------------------------
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>"
)

library(shiny)
onStop <- function(...) {
  shiny::onStop(...)
  invisible()
}

## -----------------------------------------------------------------------------
library(shiny)
library(DBI)

# In a multi-file app, you could create conn at the top of your
# server.R file or in global.R
conn <- DBI::dbConnect(RSQLite::SQLite(), dbname = pool::demoDb())
onStop(function() {
  DBI::dbDisconnect(conn)
})

ui <- fluidPage(
  textInput("cyl", "Enter your number of cylinders:", "4"),
  tableOutput("tbl"),
  numericInput("nrows", "How many cars to show?", 10),
  plotOutput("popPlot")
)

server <- function(input, output, session) {
  output$tbl <- renderTable({
    sql <- "SELECT * FROM mtcars WHERE cyl = ?cyl;"
    query <- sqlInterpolate(conn, sql, cyl = input$cyl)
    dbGetQuery(conn, query)
  })
  output$popPlot <- renderPlot({
    sql <- "SELECT * FROM mtcars LIMIT ?n;"
    query <- sqlInterpolate(conn, sql, n = input$nrows)
    df <- dbGetQuery(conn, query)
    barplot(setNames(df$mpg, df$model))
  })
}

if (interactive())
  shinyApp(ui, server)

## -----------------------------------------------------------------------------
library(shiny)
library(DBI)

connect <- function() {
  DBI::dbConnect(RSQLite::SQLite(), dbname = pool::demoDb())
}

ui <- fluidPage(
  textInput("cyl", "Enter your number of cylinders:", "4"),
  tableOutput("tbl"),
  numericInput("nrows", "How many cars to show?", 10),
  plotOutput("popPlot")
)

server <- function(input, output, session) {
  output$tbl <- renderTable({
    conn <- connect()
    on.exit(DBI::dbDisconnect(conn))

    sql <- "SELECT * FROM mtcars WHERE cyl = ?cyl;"
    query <- sqlInterpolate(conn, sql, cyl = input$cyl)
    dbGetQuery(conn, query)
  })

  output$popPlot <- renderPlot({
    conn <- connect()
    on.exit(DBI::dbDisconnect(conn))

    sql <- "SELECT * FROM mtcars LIMIT ?n;"
    query <- sqlInterpolate(conn, sql, n = input$nrows)
    df <- dbGetQuery(conn, query)
    barplot(setNames(df$mpg, df$model))
  })
}

if (interactive())
  shinyApp(ui, server)

## -----------------------------------------------------------------------------
library(shiny)
library(DBI)

pool <- pool::dbPool(RSQLite::SQLite(), dbname = pool::demoDb())
onStop(function() {
  pool::poolClose(pool)
})

ui <- fluidPage(
  textInput("cyl", "Enter your number of cylinders:", "4"),
  tableOutput("tbl"),
  numericInput("nrows", "How many cars to show?", 10),
  plotOutput("popPlot")
)

server <- function(input, output, session) {
  cars <- tbl(pool, "mtcars")

  output$tbl <- renderTable({
    cars %>% filter(cyl == !!input$cyl) %>% collect()
  })
  output$popPlot <- renderPlot({
    df <- cars %>% head(input$nrows) %>% collect()
    pop <- df %>% pull("mpg", name = "model")
    barplot(pop)
  })
}

if (interactive())
  shinyApp(ui, server)

