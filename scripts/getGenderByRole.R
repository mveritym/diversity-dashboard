library(dplyr)

tech_roles <- c("Dev", "UI Dev", "QA", "DevOps", "Infra Cons", "Net Admin", "Tech Admin", "Info Sec")

consultants_raw <- read.csv("inputs/consultant_info.csv")
consultants <- select(consultants_raw, -(Name), -(Home.Office:X), -(Available.From:Planned.Assignment))
consultants <- filter(consultants, Gender != "Unknown")

gender_by_role <- summarise(group_by(consultants, Role), num_men = sum(Gender == "Male"), num_women = sum(Gender == "Female"))
gender_by_role <- mutate(gender_by_role, Technical = Role %in% tech_roles)

write.csv(gender_by_role, file="static/data/gender_by_role.csv", row.names=FALSE)

print("DONE WITH R SCRIPT!")
