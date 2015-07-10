infile <- commandArgs(TRUE)[1]
inputSlice <- read.table(infile, nrows = 1, header =TRUE, sep =',')

input_cols <- tolower(names(inputSlice))
mandatory_cols <- c("gender", "role")

if (all(mandatory_cols %in% input_cols)) {
  write("Valid input", stdout())
} else {
  write("Missing columns", stderr()) 
}