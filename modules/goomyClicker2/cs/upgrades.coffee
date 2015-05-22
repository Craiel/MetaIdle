# GCM = generator click multiplier, I think?

gcm1 = new Item("gcm1", 1)
gcm1.unlock_condition = -> goomy.level >= 5
gcm1.cost = 1e4

gcm2 = new Item("gcm2", 2)
gcm2.unlock_condition = -> goomy.level >= 10
gcm2.cost = 1e5

gcm3 = new Item("gcm3", 3)
gcm3.unlock_condition = -> goomy.level >= 20
gcm3.cost = 1e7

gcm4 = new Item("gcm4", 4)
gcm4.unlock_condition = -> goomy.level >= 40
gcm4.cost = 1e10

gcm5 = new Item("gcm5", 5)
gcm5.unlock_condition = -> goomy.level >= 80
gcm5.cost = 1e14



click1 = new Item("click1", 6)
click1.unlock_condition = -> goomy.level >= 100
click1.cost = 1e16








# youngster ball upgrades
ball01 = new Item("ball01", 7)
ball01.unlock_condition = -> goomy.level >= 10 && gens["youngster"].count >= 10
ball01.cost = 1e4

ball02 = new Item("ball02", 8)
ball02.unlock_condition = -> goomy.level >= 30 && gens["youngster"].count >= 50
ball02.cost = 1e8

ball99 = new Item("ball99", 9)
ball99.unlock_condition = -> goomy.level >= 100
ball99.cost = 1e15






# youngster upgrades
youngster01 = new Item("youngster01", 51)
youngster01.unlock_condition = -> gens["daycare"].count >= 50 && gens["youngster"].count >= 100
youngster01.cost = 6e6
