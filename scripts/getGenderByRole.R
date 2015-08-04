library(dplyr)

infile <- commandArgs(TRUE)[1]

tech_roles <- c("Dev", "UI Dev", "QA", "DevOps", "Infra Cons", "Net Admin", "Tech Admin", "Info Sec")

subdir <- "data/generated"
generated_dir <- paste(getwd(), subdir, sep="/")
if (!file.exists(generated_dir)){
    dir.create(file.path(generated_dir))
}

consultants_raw <- read.csv(infile)
consultants <- select(consultants_raw, -(Name), -(Home.Office:X), -(Available.From:Planned.Assignment))
consultants <- filter(consultants, Gender != "Unknown")

gender_by_role <- summarise(group_by(consultants, Role),
                            num_men = as.character(sum(Gender == "Male")),
                            num_women = as.character(sum(Gender == "Female")))
gender_by_role <- mutate(gender_by_role, Technical = as.character(Role %in% tech_roles))

setwd(generated_dir)
outfile <- "gender_by_role.csv"
write.table(gender_by_role, file=outfile, row.names=FALSE)

print(outfile)
