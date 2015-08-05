library(dplyr)

args <- commandArgs(trailingOnly = TRUE)
infile <- args[1]
outfile <- args[2]

tech_roles <- c("Dev", "UI Dev", "QA", "DevOps", "Infra Cons", "Net Admin", "Tech Admin", "Info Sec")

consultants_raw <- read.csv(infile)
consultants <- select(consultants_raw, -(Name), -(Home.Office:X), -(Available.From:Planned.Assignment))
consultants <- filter(consultants, Gender != "Unknown")

gender_by_role <- summarise(group_by(consultants, Role),
                            num_men = as.character(sum(Gender == "Male")),
                            num_women = as.character(sum(Gender == "Female")))
gender_by_role <- mutate(gender_by_role, Technical = as.character(Role %in% tech_roles))

write.table(gender_by_role, file=outfile, row.names=FALSE)
