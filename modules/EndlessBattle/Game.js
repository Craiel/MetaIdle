/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                 HELPER FUNCTIONS                                                      
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
// Enumerator Function
function Sigma(number) {
    total = 0;
    for (var x = 1; x <= number; x++) {
        total += x;
    }
    return total;
}

// Mouse position tracking
var mouseX = 0;
var mouseY = 0;
(function () {
    window.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        event = event || window.event; // IE-ism
        // event.clientX and event.clientY contain the mouse position
        mouseX = event.clientX;
        mouseY = event.clientY;
    }
})();

// Transforms a number so it contains commas
Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, ab
    s = n < 0 ? "-" : "", 
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                      PLAYER                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
 AttackType = new Object();
 AttackType.BASIC_ATTACK = "BASIC_ATTACK";
 AttackType.POWER_STRIKE = "POWER_STRIKE";
 AttackType.DOUBLE_STRIKE = "DOUBLE_STRIKE";

function StatsSet() {
    this.health = 0;
    this.hp5 = 0;
    this.minDamage = 0;
    this.maxDamage = 0;
    this.damageBonus = 0;
    this.armour = 0;
    this.evasion = 0;
    this.strength = 0;
    this.stamina = 0;
    this.agility = 0;
    this.critChance = 0;
    this.critDamage = 0;
    this.itemRarity = 0;
    this.goldGain = 0;
    this.experienceGain = 0;
}

function Player() {
    this.level = 1;
    this.health = 100;

    // Base values for all stats; these are static
    this.baseStats = new StatsSet();
    this.baseStats.health = this.health;
    this.baseStats.hp5 = 10;
    this.baseStats.minDamage = 1;
    this.baseStats.maxDamage = 1;
    this.baseStats.damageBonus = 0;
    this.baseStats.armour = 0;
    this.baseStats.evasion = 0;
    this.baseStats.strength = 0;
    this.baseStats.agility = 0;
    this.baseStats.stamina = 0;
    this.baseStats.critChance = 5;
    this.baseStats.critDamage = 200;
    this.baseStats.itemRarity = 0;
    this.baseStats.goldGain = 0;
    this.baseStats.experienceGain = 0;

    // Stat bonuses automatically gained when leveling up
    this.baseLevelUpBonuses = new StatsSet();
    this.baseLevelUpBonuses.health = 5;
    this.baseLevelUpBonuses.hp5 = 1;

    // The amount of stats the player has gained from leveling up
    this.levelUpBonuses = new StatsSet();

    // Stat bonuses chosen when leveling up
    this.chosenLevelUpBonuses = new StatsSet();

    // Item stat bonuses; this does not include increases to these stats
    this.baseItemBonuses = new StatsSet();

    // All the special effects from items the player has
    this.effects = new Array();

    // Combat
    this.lastDamageTaken = 0;
    this.alive = true;
    this.canAttack = true;
    this.attackType = AttackType.BASIC_ATTACK;

    // Resources
    this.gold = 0;
    this.lastGoldGained = 0;
    this.experience = 0;
    this.baseExperienceRequired = 10;
    this.experienceRequired = Math.ceil(Sigma(this.level * 2) * Math.pow(1.05, this.level) + this.baseExperienceRequired);
    this.lastExperienceGained = 0;
    this.powerShards = 0;

    // Death
    this.resurrecting = false;
    this.resurrectionTimer = 60;
    this.resurrectionTimeRemaining = 0;

    // Abilities
    this.skillPointsSpent = 0;
    this.skillPoints = 0;
    this.abilities = new Abilities();

    // Buffs/Debuffs
    this.buffs = new BuffManager();
    this.debuffs = new DebuffManager();

    // Stat calculation functions
    this.getMaxHealth = function getMaxHealth() {
        return Math.floor((this.getStrength() * 5) + (((this.baseStats.health + this.levelUpBonuses.health + this.baseItemBonuses.health) * (((game.mercenaryManager.getCommanderHealthPercentBonus() * game.mercenaryManager.commandersOwned) / 100) + 1)) * ((this.powerShards / 100) + 1)));
    }
    this.getHp5 = function getHp5() {
        return Math.floor(this.getStamina() + (((this.baseStats.hp5 + this.levelUpBonuses.hp5 + this.chosenLevelUpBonuses.hp5 + this.baseItemBonuses.hp5) * ((game.mercenaryManager.getClericHp5PercentBonus() * game.mercenaryManager.clericsOwned) / 100 + 1)) * ((this.powerShards / 100) + 1)));
    }
    this.getMinDamage = function getMinDamage() {
        // If the player has a weapon equipped then remove the 1 unarmed damage
        if (game.equipment.weapon() != null) {
            return Math.floor((((this.baseStats.minDamage + this.baseItemBonuses.minDamage - 1) * ((this.getDamageBonus() + 100) / 100)) * this.buffs.getDamageMultiplier()) * ((this.powerShards / 100) + 1));
        }
        else {
            return Math.floor((((this.baseStats.minDamage + this.baseItemBonuses.minDamage) * ((this.getDamageBonus() + 100) / 100)) * this.buffs.getDamageMultiplier()) * ((this.powerShards / 100) + 1));
        }
    }
    this.getMaxDamage = function getMaxDamage() {
        // If the player has a weapon equipped then remove the 2 unarmed damage
        if (game.equipment.weapon() != null) {
            return Math.floor((((this.baseStats.maxDamage + this.baseItemBonuses.maxDamage - 1) * ((this.getDamageBonus() + 100) / 100)) * this.buffs.getDamageMultiplier()) * ((this.powerShards / 100) + 1));
        }
        else {
            return Math.floor((((this.baseStats.maxDamage + this.baseItemBonuses.maxDamage) * ((this.getDamageBonus() + 100) / 100)) * this.buffs.getDamageMultiplier()) * ((this.powerShards / 100) + 1));
        }
    }
    this.getDamageBonus = function getDamageBonus() {
        return this.getStrength() + ((this.baseStats.damageBonus + this.chosenLevelUpBonuses.damageBonus + this.baseItemBonuses.damageBonus + (game.mercenaryManager.getMageDamagePercentBonus() * game.mercenaryManager.magesOwned)) * ((this.powerShards / 100) + 1));
    }
    this.getAverageDamage = function getAverageDamage() {
        var average = this.getMaxDamage() - this.getMinDamage();
        average += this.getMinDamage();
        return average;
    }
    this.getArmour = function getArmour() {
        return Math.floor(((this.baseStats.armour + this.chosenLevelUpBonuses.armour + this.baseItemBonuses.armour) * ((this.getStamina() / 100) + 1)) * ((this.powerShards / 100) + 1));
    }
    this.getEvasion = function getEvasion() {
        return Math.floor(((this.baseStats.evasion + this.chosenLevelUpBonuses.evasion + this.baseItemBonuses.evasion) * (((this.getAgility() + (game.mercenaryManager.getAssassinEvasionPercentBonus() * game.mercenaryManager.assassinsOwned)) / 100) + 1)) * ((this.powerShards / 100) + 1));
    }
    this.getStrength = function getStrength() {
        return Math.floor((this.baseStats.strength + this.chosenLevelUpBonuses.strength + this.baseItemBonuses.strength) * ((this.powerShards / 100) + 1));
    }
    this.getStamina = function getStamina() {
        return Math.floor((this.baseStats.stamina + this.chosenLevelUpBonuses.stamina + this.baseItemBonuses.stamina) * ((this.powerShards / 100) + 1));
    }
    this.getAgility = function getAgility() {
        return Math.floor((this.baseStats.agility + this.chosenLevelUpBonuses.agility + this.baseItemBonuses.agility) * ((this.powerShards / 100) + 1));
    }
    this.getCritChance = function getCritChance() {
        return ((this.baseStats.critChance + this.chosenLevelUpBonuses.critChance + this.baseItemBonuses.critChance)) * ((this.powerShards / 100) + 1);
    }
    this.getCritDamage = function getCritDamage() {
        return ((this.baseStats.critDamage + this.chosenLevelUpBonuses.critDamage + this.baseItemBonuses.critDamage) + (this.getAgility() * 0.2) + (game.mercenaryManager.getWarlockCritDamageBonus() * game.mercenaryManager.warlocksOwned)) * ((this.powerShards / 100) + 1);
    }
    this.getItemRarity = function getItemRarity() {
        return (this.baseStats.itemRarity + this.chosenLevelUpBonuses.itemRarity + this.baseItemBonuses.itemRarity) * ((this.powerShards / 100) + 1);
    }
    this.getGoldGain = function getGoldGain() {
        return (this.baseStats.goldGain + this.chosenLevelUpBonuses.goldGain + this.baseItemBonuses.goldGain) * ((this.powerShards / 100) + 1);
    }
    this.getExperienceGain = function getExperienceGain() {
        return (this.baseStats.experienceGain + this.chosenLevelUpBonuses.experienceGain + this.baseItemBonuses.experienceGain) * ((this.powerShards / 100) + 1);
    }

    // Get the power of a certain special effect
    this.getEffectsOfType = function getEffectsOfType(type) {
        var allEffects = new Array();
        for (var x = 0; x < this.effects.length; x++) {
            if (this.effects[x].type == type) {
                allEffects.push(this.effects[x]);
            }
        }
        return allEffects;
    }

    // Increase the power of an ability
    this.increaseAbilityPower = function increaseAbilityPower(name) {
        // Increase the level for the ability
        switch (name) {
            case AbilityName.REND:
                this.abilities.baseRendLevel++;
                break;
            case AbilityName.REJUVENATING_STRIKES:
                this.abilities.baseRejuvenatingStrikesLevel++;
                break;
            case AbilityName.ICE_BLADE:
                this.abilities.baseIceBladeLevel++;
                break;
            case AbilityName.FIRE_BLADE:
                this.abilities.baseFireBladeLevel++;
                break;
        }

        // Alter the player's skill points
        this.skillPoints--;
        this.skillPointsSpent++;

        // Show the Level Up button if there are still skill points remaining
        if (this.skillPoints > 0) {
            $("#levelUpButton").show();
        }
    }

    // Use all the abilities the player has
    this.useAbilities = function useAbilities() {
        var monstersDamageTaken = 0;
        var criticalHappened = false;
        // Use the abilities
        // REND
        if (this.abilities.getRendLevel() > 0) {
            // Apply the bleed effect to the monster
            game.monster.addDebuff(DebuffType.BLEED, this.abilities.getRendDamage(0), this.abilities.rendDuration);
        }
        // REJUVENATING STRIKES
        if (this.abilities.getRejuvenatingStrikesLevel() > 0) {
            // Heal the player
            this.heal(this.abilities.getRejuvenatingStrikesHealAmount(0));
        }
        // ICE BLADE
        if (this.abilities.getIceBladeLevel() > 0) {
            // Calculate the damage
            var damage = this.abilities.getIceBladeDamage(0);
            // See if the player will crit
            if (this.getCritChance() >= (Math.random() * 100)) {
                damage *= (this.getCritDamage() / 100);
                criticalHappened = true;
            }
            // Damage the monster
            game.monster.takeDamage(damage, criticalHappened, false);

            // Apply the chill effect to the monster
            game.monster.addDebuff(DebuffType.CHILL, 0, this.abilities.iceBladeChillDuration);
        }
        // FIRE BLADE
        if (this.abilities.getFireBladeLevel() > 0) {
            // Calculate the damage
            var damage = this.abilities.getFireBladeDamage(0);
            // See if the player will crit
            if (this.getCritChance() >= (Math.random() * 100)) {
                damage *= (this.getCritDamage() / 100);
                criticalHappened = true;
            }
            // Damage the monster
            game.monster.takeDamage(damage, criticalHappened, false);

            // Apply the burn effect to the monster
            game.monster.addDebuff(DebuffType.BURN, this.abilities.getFireBladeBurnDamage(0), this.abilities.fireBladeBurnDuration);
        }
    }

    // Change the player's attack
    this.changeAttack = function changeAttack(type) {
        switch (type) {
            case AttackType.BASIC_ATTACK:
                this.attackType = AttackType.BASIC_ATTACK;
                $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 0 0');
                break;
            case AttackType.POWER_STRIKE:
                this.attackType = AttackType.POWER_STRIKE;
                $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 0 100px');
                break;
            case AttackType.DOUBLE_STRIKE:
                this.attackType = AttackType.DOUBLE_STRIKE;
                $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 0 50px');
                break;
        }
    }

    // Gain an amount of gold, this can include bonuses from gold gain and it also can not
    this.gainGold = function gainGold(amount, includeBonuses) {
        if (includeBonuses) {
            amount *= 1 + (this.getGoldGain() / 100);
            amount *= this.buffs.getGoldMultiplier();
            this.gold += amount;
            this.lastGoldGained = amount;
        }
        else {
            this.gold += amount;
            this.lastGoldGained = amount;
        }
        game.stats.goldEarned += this.lastGoldGained;
    }

    // Gain an amount of experience, this can include bonuses from exp gain and it also can not
    this.gainExperience = function gainExperience(amount, includeBonuses) {
        if (includeBonuses) {
            amount *= 1 + (this.getExperienceGain() / 100);
            amount *= this.buffs.getExperienceMultiplier();
            this.experience += amount;
            this.lastExperienceGained = amount;
        }
        else {
            this.experience += amount;
            this.lastExperienceGained = amount;
        }
        game.stats.experienceEarned += this.lastExperienceGained;

        // Give the player a level if enough experience was gained
        while (this.experience >= this.experienceRequired) {
            this.experience -= this.experienceRequired;
            this.level++;
            this.skillPoints++;
            this.experienceRequired = Math.ceil(Sigma(this.level * 2) * Math.pow(1.05, this.level) + this.baseExperienceRequired);
            $("#levelUpButton").show();

            // If this number is not divisible by 5 then add a random stat upgrade
            if (this.level % 5 != 0) {
                game.statUpgradesManager.addRandomUpgrades(this.level);
            }

            // Add stats to the player for leveling up
            this.levelUpBonuses.health += Math.floor(this.baseLevelUpBonuses.health * (Math.pow(1.01, this.level - 1)));
            this.levelUpBonuses.hp5 += Math.floor(this.baseLevelUpBonuses.hp5 * (Math.pow(1.01, this.level - 1)));
        }
    }

    // Take an amount of damage
    this.takeDamage = function takeDamage(damage) {
        // Reduce the damage based on the amount of armour
        var damageReduction = this.calculateDamageReduction();
        var newDamage = damage - Math.floor(damage * (damageReduction / 100));
        if (newDamage < 0) { newDamage = 0; }

        // Take the damage
        this.health -= newDamage;
        this.lastDamageTaken = newDamage;
        game.stats.damageTaken += newDamage;

        // Reflect a percentage of the damage if the player has any Barrier effects
        var reflectAmount = 0;
        var barrierEffects = this.getEffectsOfType(EffectType.BARRIER);
        for (var x = 0; x < barrierEffects.length; x++) {
            reflectAmount += barrierEffects[x].value;
        }
        reflectAmount = this.lastDamageTaken * (reflectAmount / 100);
        if (reflectAmount > 0) {
            game.monster.takeDamage(reflectAmount, false, false);
        }

        // Check if the player is dead
        if (this.health <= 0) {
            this.alive = false;
        }

        // Create the monster's damage particle
        game.particleManager.createParticle(newDamage, ParticleType.MONSTER_DAMAGE);
    }

    // Calculate the amount of reduction granted by armour
    this.calculateDamageReduction = function calculateDamageReduction() {
        // Calculate the reduction
        var reduction = this.getArmour() / (this.getArmour() + 500) * 99

        // Cap the reduction at 99%
        if (reduction >= 99) {
            reduction = 99;
        }

        return reduction;
    }

    // Calculate the chance the player has of dodging an attack
    this.calculateEvasionChance = function calculateEvasionChance() {
        // Calculate the chance
        var chance = (this.getEvasion() / (this.getEvasion() + 375)) * 75;

        // Cap the dodge at 75%
        if (chance >= 75) {
            chance = 75;
        }

        return chance;
    }

    // Heal the player for a specified amount
    this.heal = function heal(amount) {
        this.health += amount;
        if (this.health > this.getMaxHealth()) {
            this.health = this.getMaxHealth();
        }
    }

    // Regenerate the players health depending on how much time has passed
    this.regenerateHealth = function regenerateHealth(ms) {
        this.health += ((this.getHp5() / 5) * (ms / 1000));
        if (this.health >= this.getMaxHealth()) {
            this.health = this.getMaxHealth();
        }
    }

    // Gain the stats from an item
    this.gainItemsStats = function gainItemsStats(item) {
        this.baseItemBonuses.minDamage += item.minDamage + item.damageBonus;
        this.baseItemBonuses.maxDamage += item.maxDamage + item.damageBonus;

        this.baseItemBonuses.strength += item.strength;
        this.baseItemBonuses.agility += item.agility;
        this.baseItemBonuses.stamina += item.stamina;

        this.baseItemBonuses.health += item.health;
        this.baseItemBonuses.hp5 += item.hp5;
        this.baseItemBonuses.armour += item.armour + item.armourBonus;
        this.baseItemBonuses.evasion += item.evasion;

        this.baseItemBonuses.critChance += item.critChance;
        this.baseItemBonuses.critDamage += item.critDamage;

        this.baseItemBonuses.itemRarity += item.itemRarity;
        this.baseItemBonuses.goldGain += item.goldGain;
        this.baseItemBonuses.experienceGain += item.experienceGain;
        for (var x = 0; x < item.effects.length; x++) {
            this.effects.push(item.effects[x]);
        }
    }

    // Lose the stats from an item
    this.loseItemsStats = function loseItemsStats(item) {
        this.baseItemBonuses.minDamage -= item.minDamage + item.damageBonus;
        this.baseItemBonuses.maxDamage -= item.maxDamage + item.damageBonus;

        this.baseItemBonuses.strength -= item.strength;
        this.baseItemBonuses.agility -= item.agility;
        this.baseItemBonuses.stamina -= item.stamina;

        this.baseItemBonuses.health -= item.health;
        this.baseItemBonuses.hp5 -= item.hp5;
        this.baseItemBonuses.armour -= item.armour + item.armourBonus;
        this.baseItemBonuses.evasion -= item.evasion;

        this.baseItemBonuses.critChance -= item.critChance;
        this.baseItemBonuses.critDamage -= item.critDamage;

        this.baseItemBonuses.itemRarity -= item.itemRarity;
        this.baseItemBonuses.goldGain -= item.goldGain;
        this.baseItemBonuses.experienceGain -= item.experienceGain;
        for (var x = item.effects.length - 1; x >= 0; x--) {
            for (var y = this.effects.length - 1; y >= 0; y--) {
                if (this.effects[y].type == item.effects[x].type &&
                    this.effects[y].chance == item.effects[x].chance &&
                    this.effects[y].value == item.effects[x].value) {
                    this.effects.splice(y, 1);
                    break;
                }
            }
        }
    }

    // Add a debuff to the player of the specified type, damage and duration
    this.addDebuff = function addDebuff(type, damage, duration) {
        switch (type) {
            case DebuffType.BLEED:
                this.debuffs.bleeding = true;
                this.debuffs.bleedDamage = damage;
                this.debuffs.bleedDuration = 0;
                this.debuffs.bleedMaxDuration = duration;
                this.debuffs.bleedStacks++;
                break;
            case DebuffType.CHILL:
                this.debuffs.chilled = true;
                this.debuffs.chillDuration = 0;
                this.debuffs.chillMaxDuration = duration;
                break;
            case DebuffType.BURN:
                this.debuffs.burning = true;
                this.debuffs.burningDamage = damage;
                this.debuffs.burningDuration = 0;
                this.debuffs.burningMaxDuration = duration;
                break;
        }
    }

    this.update = function update(ms) {
        this.buffs.update(ms);
    }

    // Update all the debuffs on the player
    this.updateDebuffs = function updateDebuffs() {
        // If the player is bleeding
        if (this.debuffs.bleeding) {
            // Cause the player to take damage
            this.takeDamage(this.debuffs.bleedDamage);
            // Increase the duration of this debuff
            this.debuffs.bleedDuration++;
            // If the debuff has expired then remove it
            if (this.debuffs.bleedDuration >= this.debuffs.bleedMaxDuration) {
                this.debuffs.bleeding = false;
                this.debuffs.bleedDamage = 0;
                this.debuffs.bleedDuration = 0;
                this.debuffs.bleedMaxDuration = 0;
                this.debuffs.bleedStacks = 0;
            }
        }

        // If the player is chilled
        if (this.debuffs.chilled) {
            // If the chill duration is even then the player can't attack this turn
            if (this.debuffs.chillDuration == 0 || (this.debuffs.chillDuration % 2 == 0)) {
                this.canAttack = false;
            }
            else { this.canAttack = true; }
            // Increase the duration of this debuff
            this.debuffs.chillDuration++;
            // If the debuff has expired then remove it
            if (this.debuffs.chillDuration >= this.debuffs.chillMaxDuration) {
                this.debuffs.chillDuration = 0;
                this.debuffs.chillMaxDuration = 0;
                this.debuffs.chilled = false;
            }
        }
        // If the player is not chilled then they can attack
        else { this.canAttack = true; }

        // If the player is burning
        if (this.debuffs.burning) {
            // Cause the player to take damage
            this.takeDamage(this.debuffs.burningDamage);
            // Increase the duration of this debuff
            this.debuffs.burningDuration++;
            // If the debuff has expired then remove it
            if (this.debuffs.burningDuration >= this.debuffs.burningMaxDuration) {
                this.debuffs.burningDamage = 0;
                this.debuffs.burningDuration = 0;
                this.debuffs.burningMaxDuration = 0;
                this.debuffs.burning = false;
            }
        }
    }

    // Save all the player's data
    this.save = function save() {
        localStorage.playerSaved = true;
        localStorage.playerLevel = this.level;
        localStorage.playerHealth = this.health;

        localStorage.chosenLevelUpBonuses = JSON.stringify(this.chosenLevelUpBonuses);
        localStorage.baseItemBonuses = JSON.stringify(this.baseItemBonuses);

        localStorage.playerGold = this.gold;
        localStorage.playerLevel = this.level;
        localStorage.playerExperience = this.experience;

        localStorage.playerSkillPointsSpent = this.skillPointsSpent;
        localStorage.playerSkillPoints = this.skillPoints;
        this.abilities.save();

        localStorage.playerAlive = this.alive;
        localStorage.attackType = this.attackType;
        localStorage.playerEffects = JSON.stringify(this.effects);

        localStorage.powerShards = this.powerShards;
    }

    // Load all the player's data
    this.load = function load() {
        if (localStorage.playerSaved != null) {
            this.level = parseInt(localStorage.playerLevel);
            this.health = parseFloat(localStorage.playerHealth);

            if (localStorage.version == null) {
                this.chosenLevelUpBonuses.health = parseFloat(localStorage.playerBaseHealthStatBonus);
                this.chosenLevelUpBonuses.hp5 = parseFloat(localStorage.playerBaseHp5StatBonus);
                this.chosenLevelUpBonuses.damageBonus = parseFloat(localStorage.playerBaseDamageBonusStatBonus);
                this.chosenLevelUpBonuses.armour = parseFloat(localStorage.playerBaseArmourStatBonus);
                this.chosenLevelUpBonuses.strength = parseFloat(localStorage.playerBaseStrengthStatBonus);
                this.chosenLevelUpBonuses.stamina = parseFloat(localStorage.playerBaseStaminaStatBonus);
                this.chosenLevelUpBonuses.agility = parseFloat(localStorage.playerBaseAgilityStatBonus);
                this.chosenLevelUpBonuses.critChance = parseFloat(localStorage.playerBaseCritChanceStatBonus);
                this.chosenLevelUpBonuses.critDamage = parseFloat(localStorage.playerBaseCritDamageStatBonus);
                this.chosenLevelUpBonuses.itemRarity = parseFloat(localStorage.playerBaseItemRarityStatBonus);
                this.chosenLevelUpBonuses.goldGain = parseFloat(localStorage.playerBaseGoldGainStatBonus);
                this.chosenLevelUpBonuses.experienceGain = parseFloat(localStorage.playerBaseExperienceGainStatBonus);

                this.baseItemBonuses.health = parseInt(localStorage.playerBaseHealthFromItems);
                this.baseItemBonuses.hp5 = parseInt(localStorage.playerBaseHp5FromItems);
                this.baseItemBonuses.minDamage = parseInt(localStorage.playerBaseMinDamageFromItems);
                this.baseItemBonuses.maxDamage = parseInt(localStorage.playerBaseMaxDamageFromItems);
                this.baseItemBonuses.damageBonus = parseFloat(localStorage.playerBaseDamageBonusFromItems);
                this.baseItemBonuses.armour = parseFloat(localStorage.playerBaseArmourFromItems);
                this.baseItemBonuses.strength = parseInt(localStorage.playerBaseStrengthFromItems);
                this.baseItemBonuses.stamina = parseInt(localStorage.playerBaseStaminaFromItems);
                this.baseItemBonuses.agility = parseInt(localStorage.playerBaseAgilityFromItems);
                this.baseItemBonuses.critChance = parseFloat(localStorage.playerBaseCritChanceFromItems);
                this.baseItemBonuses.critDamage = parseFloat(localStorage.playerBaseCritDamageFromItems);
                this.baseItemBonuses.itemRarity = parseFloat(localStorage.playerBaseItemRarityFromItems);
                this.baseItemBonuses.goldGain = parseFloat(localStorage.playerBaseGoldGainFromItems);
                this.baseItemBonuses.experienceGain = parseFloat(localStorage.playerBaseExperienceGainFromItems);
            }

            // Add stats to the player for leveling up
            for (var x = 1; x < this.level; x++) {
                this.levelUpBonuses.health += Math.floor(this.baseLevelUpBonuses.health * (Math.pow(1.01, x)));
                this.levelUpBonuses.hp5 += Math.floor(this.baseLevelUpBonuses.hp5 * (Math.pow(1.01, x)));
            }

            this.gold = parseFloat(localStorage.playerGold);
            this.level = parseInt(localStorage.playerLevel);
            this.experience = parseFloat(localStorage.playerExperience);
            this.experienceRequired = Math.ceil(Sigma(this.level * 2) * Math.pow(1.05, this.level) + this.baseExperienceRequired);

            this.skillPointsSpent = parseInt(localStorage.playerSkillPointsSpent);
            this.skillPoints = parseInt(localStorage.playerSkillPoints);
            if (this.skillPoints > 0) {
                $("#levelUpButton").show();
            }
            this.abilities.load();
            this.changeAttack(localStorage.attackType);

            if (localStorage.version != null) {
                this.chosenLevelUpBonuses = JSON.parse(localStorage.chosenLevelUpBonuses);
                this.baseItemBonuses = JSON.parse(localStorage.baseItemBonuses);
                this.changeAttack(localStorage.attackType);
                var newEffects = JSON.parse(localStorage.playerEffects);
                if (newEffects != null && newEffects.length > 0) {
                    for (var x = 0; x < newEffects.length; x++) {
                        this.effects.push(new Effect(newEffects[x].type, newEffects[x].chance, newEffects[x].value));
                    }
                }
            }

            if (localStorage.powerShards != null) { this.powerShards = parseInt(localStorage.powerShards); }
        }

        if (localStorage.playerAlive != null) { this.alive = JSON.parse(localStorage.playerAlive); }
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                     ABILITIES                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
AbilityName = new Object();
AbilityName.REND = "REND";
AbilityName.REJUVENATING_STRIKES = "REJUVENATING_STRIKES";
AbilityName.ICE_BLADE = "ICE_BLADE";
AbilityName.FIRE_BLADE = "FIRE_BLADE";

function Abilities() {
    this.baseRendLevel = 0;
    this.getRendLevel = function getRendLevel() {
        var level = this.baseRendLevel;
        var effects = game.player.getEffectsOfType(EffectType.WOUNDING);
        for (var x = 0; x < effects.length; x++) {
            level += effects[x].value;
        }
        return level;
    }
    this.rendDuration = 5;
    this.getRendDamage = function getRendDamage(levelBonus) {
        return Math.ceil((game.player.getAverageDamage() / 17) + (game.player.level / 1.5)) * (this.getRendLevel() + levelBonus);
    }

    this.baseRejuvenatingStrikesLevel = 0;
    this.getRejuvenatingStrikesLevel = function getRejuvenatingStrikesLevel() {
        var level = this.baseRejuvenatingStrikesLevel;
        var effects = game.player.getEffectsOfType(EffectType.CURING);
        for (var x = 0; x < effects.length; x++) {
            level += effects[x].value;
        }
        return level;
    }
    this.getRejuvenatingStrikesHealAmount = function getRejuvenatingStrikesHealAmount(levelBonus) {
        return Math.ceil((game.player.getAverageDamage() / 54) + (game.player.level / 2)) * (this.getRejuvenatingStrikesLevel() + levelBonus);
    }

    this.baseIceBladeLevel = 0;
    this.getIceBladeLevel = function getIceBladeLevel() {
        var level = this.baseIceBladeLevel;
        var effects = game.player.getEffectsOfType(EffectType.FROST_SHARDS);
        for (var x = 0; x < effects.length; x++) {
            level += effects[x].value;
        }
        return level;
    }
    this.iceBladeChillDuration = 5;
    this.getIceBladeDamage = function getIceBladeDamage(levelBonus) {
        return Math.ceil((game.player.getAverageDamage() / 12) + game.player.level) * (this.getIceBladeLevel() + levelBonus);
    }

    this.baseFireBladeLevel = 0;
    this.getFireBladeLevel = function getFireBladeLevel() {
        var level = this.baseFireBladeLevel;
        var effects = game.player.getEffectsOfType(EffectType.FLAME_IMBUED);
        for (var x = 0; x < effects.length; x++) {
            level += effects[x].value;
        }
        return level;
    }
    this.fireBladeBurnDuration = 5;
    this.getFireBladeDamage = function getFireBladeDamage(levelBonus) {
        return Math.ceil((game.player.getAverageDamage() / 12) + game.player.level) * (this.getFireBladeLevel() + levelBonus);
    }
    this.getFireBladeBurnDamage = function getFireBladeBurnDamage(levelBonus) {
        return Math.ceil((game.player.getAverageDamage() / 9) + game.player.level) * (this.getFireBladeLevel() + levelBonus);
    }

    this.save = function save() {
        localStorage.playerRendLevel = this.baseRendLevel;
        localStorage.playerRejuvenatingStrikesLevel = this.baseRejuvenatingStrikesLevel;
        localStorage.playerIceBladeLevel = this.baseIceBladeLevel;
        localStorage.playerFireBladeLevel = this.baseFireBladeLevel;
    }

    this.load = function load() {
        if (localStorage.playerRendLevel != null) { this.baseRendLevel = parseInt(localStorage.playerRendLevel); }
        if (localStorage.playerRejuvenatingStrikesLevel != null) { this.baseRejuvenatingStrikesLevel = parseInt(localStorage.playerRejuvenatingStrikesLevel); }
        if (localStorage.playerIceBladeLevel != null) { this.baseIceBladeLevel = parseInt(localStorage.playerIceBladeLevel); }
        if (localStorage.playerFireBladeLevel != null) { this.baseFireBladeLevel = parseInt(localStorage.playerFireBladeLevel); }
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                   STAT UPGRADES                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
StatUpgradeType = new Object();
StatUpgradeType.DAMAGE = "DAMAGE";
StatUpgradeType.STRENGTH = "STRENGTH";
StatUpgradeType.AGILITY = "AGILITY";
StatUpgradeType.STAMINA = "STAMINA";
StatUpgradeType.HP5 = "HP5";
StatUpgradeType.ARMOUR = "ARMOUR";
StatUpgradeType.EVASION = "EVASION";
StatUpgradeType.CRIT_DAMAGE = "CRIT_DAMAGE";
StatUpgradeType.ITEM_RARITY = "ITEM_RARITY";
StatUpgradeType.GOLD_GAIN = "GOLD_GAIN";
StatUpgradeType.EXPERIENCE_GAIN = "EXPERIENCE_GAIN";
StatUpgradeType.amount = 10;

// A random stat the player can choose when they level up
function StatUpgrade(type, amount) {
    this.type = type;
    this.amount = amount;
}

function StatUpgradesManager() {
    // The current possible stat upgrades
    this.upgrades = new Array();

    // Add 3 new stat upgrades for the player to choose from
    this.addNewUpgrades = function addNewUpgrades(upgrade1Type, upgrade1Amount, upgrade2Type, upgrade2Amount, upgrade3Type, upgrade3Amount) {
        var newUpgrades = new Array();
        newUpgrades.push(new StatUpgrade(upgrade1Type, upgrade1Amount));
        newUpgrades.push(new StatUpgrade(upgrade2Type, upgrade2Amount));
        newUpgrades.push(new StatUpgrade(upgrade3Type, upgrade3Amount));
        this.upgrades.push(newUpgrades);
    }

    // Add 3 random stat upgrades
    this.addRandomUpgrades = function addRandomUpgrades(level) {
        var upgradeTypes = new Array();
        var upgradeIds = new Array();
        var upgradeAmounts = new Array();

        // Assign 3 random stat upgrade types
        var idsRemaining = 3;
        var newId;
        while (idsRemaining >= 0) {
            // Create a random Id
            newId = Math.floor(Math.random() * (StatUpgradeType.amount + 1));

            // Check that the new Id hasn't already been generated
            if (upgradeIds.indexOf(newId) == -1) {
                // If it hasn't, add it to the array and reduce the amount of Ids we need to create
                upgradeIds.push(newId);
                idsRemaining--;
            }
        }

        // Asign the types and the amounts for all the Ids
        for (var x = 0; x < upgradeIds.length; x++) {
            switch (upgradeIds[x]) {
                case 0:
                    upgradeTypes.push(StatUpgradeType.DAMAGE);
                    upgradeAmounts.push(game.statGenerator.getRandomDamageBonus(level));
                    break;
                case 1:
                    upgradeTypes.push(StatUpgradeType.STRENGTH);
                    upgradeAmounts.push(game.statGenerator.getRandomStrengthBonus(level));
                    break;
                case 2:
                    upgradeTypes.push(StatUpgradeType.AGILITY);
                    upgradeAmounts.push(game.statGenerator.getRandomAgilityBonus(level));
                    break;
                case 3:
                    upgradeTypes.push(StatUpgradeType.STAMINA);
                    upgradeAmounts.push(game.statGenerator.getRandomStaminaBonus(level));
                    break;
                case 4:
                    upgradeTypes.push(StatUpgradeType.ARMOUR);
                    upgradeAmounts.push(game.statGenerator.getRandomArmourBonus(level));
                    break;
                case 5:
                    upgradeTypes.push(StatUpgradeType.HP5);
                    upgradeAmounts.push(game.statGenerator.getRandomHp5Bonus(level));
                    break;
                case 6:
                    upgradeTypes.push(StatUpgradeType.CRIT_DAMAGE);
                    upgradeAmounts.push(game.statGenerator.getRandomCritDamageBonus(level));
                    break;
                case 7:
                    upgradeTypes.push(StatUpgradeType.ITEM_RARITY);
                    upgradeAmounts.push(game.statGenerator.getRandomItemRarityBonus(level));
                    break;
                case 8:
                    upgradeTypes.push(StatUpgradeType.GOLD_GAIN);
                    upgradeAmounts.push(game.statGenerator.getRandomGoldGainBonus(level));
                    break;
                case 9:
                    upgradeTypes.push(StatUpgradeType.EXPERIENCE_GAIN);
                    upgradeAmounts.push(game.statGenerator.getRandomExperienceGainBonus(level));
                    break;
            }
        }

        // Add this new set of upgrades
        this.addNewUpgrades(upgradeTypes[0], upgradeAmounts[0], upgradeTypes[1], upgradeAmounts[1], upgradeTypes[2], upgradeAmounts[2]);
    }

    this.save = function save() {
        localStorage.statUpgradesSaved = true;
        localStorage.statUpgrades = JSON.stringify(this.upgrades);
    }

    this.load = function load() {
        if (localStorage.statUpgradesSaved != null) {
            this.upgrades = JSON.parse(localStorage.statUpgrades);
        }
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                      DEBUFFS                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
DebuffType = new Object();
DebuffType.BLEED = "BLEED";
DebuffType.CHILL = "CHILL";
DebuffType.BURN = "BURN";

function DebuffManager() {
    this.bleeding = false;
    this.bleedStacks = 0;
    this.bleedDamage = 0;
    this.bleedDuration = 0;
    this.bleedMaxDuration = 0;

    this.chilled = false;
    this.chillDuration = 0;
    this.chillMaxDuration = 0;

    this.burning = false;
    this.burningStacks = 0;
    this.burningDamage = 0;
    this.burningDuration = 0;
    this.burningMaxDuration = 0;
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                    MERCENARIES                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
MercenaryType = new Object();
MercenaryType.FOOTMAN = "FOOTMAN";
MercenaryType.CLERIC = "CLERIC";
MercenaryType.COMMANDER = "COMMANDER";
MercenaryType.MAGE = "MAGE";
MercenaryType.ASSASSIN = "ASSASSIN";
MercenaryType.WARLOCK = "WARLOCK";

function mercenary(type) {
    this.type = type;
}

function mercenaryManager() {
    // The interval at which mercenaries give gold, in miliseconds
    var gpsUpdateDelay = 100;
    var gpsUpdateTime = 0;

    // The base Gps values for each mercenary, these are static
    this.baseFootmanGps = 0.1;
    this.baseClericGps = 0.94;
    this.baseCommanderGps = 8.8;
    this.baseMageGps = 83;
    this.baseAssassinGps = 780;
    this.baseWarlockGps = 7339;

    // The amount of gps mercenaries will give without any buffs
    this.footmanGps = this.baseFootmanGps;
    this.clericGps = this.baseClericGps;
    this.commanderGps = this.baseCommanderGps;
    this.mageGps = this.baseMageGps;
    this.assassinGps = this.baseAssassinGps;
    this.warlockGps = this.baseWarlockGps;

    // The base effect levels of each mercenaries special effects
    this.baseClericHp5PercentBonus = 5;
    this.baseCommanderHealthPercentBonus = 5;
    this.baseMageDamagePercentBonus = 5;
    this.baseAssassinEvasionPercentBonus = 5;
    this.baseWarlockCritDamageBonus = 5;

    // The amount an upgrade to a mercenary's special effect will do
    this.clericHp5PercentUpgradeValue = 2.5;
    this.commanderHealthPercentUpgradeValue = 2.5;
    this.mageDamagePercentUpgradeValue = 2.5;
    this.assassinEvasionPercentUpgradeValue = 2.5;
    this.warlockCritDamageUpgradeValue = 2.5;

    // Base prices for each mercenary
    this.baseFootmanPrice = 10;
    this.baseClericPrice = 200;
    this.baseCommanderPrice = 4000;
    this.baseMagePrice = 80000;
    this.baseAssassinPrice = 1600000;
    this.baseWarlockPrice = 32000000;

    // Current prices of mercenaries and how many of each the player owns
    this.footmanPrice = this.baseFootmanPrice;
    this.footmenOwned = 0;
    this.clericPrice = this.baseClericPrice;
    this.clericsOwned = 0;
    this.commanderPrice = this.baseCommanderPrice;
    this.commandersOwned = 0;
    this.magePrice = this.baseMagePrice;
    this.magesOwned = 0;
    this.assassinPrice = this.baseAssassinPrice;
    this.assassinsOwned = 0;
    this.warlockPrice = this.baseWarlockPrice;
    this.warlocksOwned = 0;

    // Gps reduction when dead
    this.deathGpsReductionAmount = 50;
    this.deathGpsReductionDuration = 60;
    this.gpsReductionTimeRemaining = 0;
    this.gpsReduction = 0;

    // All the mercenaries the player owns
    this.mercenaries = new Array();

    this.initialize = function initialize() {
        document.getElementById("footmanCost").innerHTML = this.footmanPrice.formatMoney(0);
        document.getElementById("clericCost").innerHTML = this.clericPrice.formatMoney(0);
        document.getElementById("commanderCost").innerHTML = this.commanderPrice.formatMoney(0);
        document.getElementById("mageCost").innerHTML = this.magePrice.formatMoney(0);
        document.getElementById("assassinCost").innerHTML = this.assassinPrice.formatMoney(0);
        document.getElementById("warlockCost").innerHTML = this.warlockPrice.formatMoney(0);
    }

    // Add a new mercenary of a specified type for the player
    this.addMercenary = function addMercenary(type) {
        switch (type) {
            case MercenaryType.FOOTMAN: this.mercenaries.push(new mercenary(MercenaryType.FOOTMAN)); break;
            case MercenaryType.CLERIC: this.mercenaries.push(new mercenary(MercenaryType.CLERIC)); break;
            case MercenaryType.COMMANDER: this.mercenaries.push(new mercenary(MercenaryType.COMMANDER)); break;
            case MercenaryType.MAGE: this.mercenaries.push(new mercenary(MercenaryType.MAGE)); break;
            case MercenaryType.ASSASSIN: this.mercenaries.push(new mercenary(MercenaryType.ASSASSIN)); break;
            case MercenaryType.WARLOCK: this.mercenaries.push(new mercenary(MercenaryType.WARLOCK)); break;
        }
    }

    // Get the amount that a mercenary's special effect gives
    this.getClericHp5PercentBonus = function getClericHp5PercentBonus() {
        return this.baseClericHp5PercentBonus + (this.clericHp5PercentUpgradeValue * game.upgradeManager.clericSpecialUpgradesPurchased);
    }
    this.getCommanderHealthPercentBonus = function getCommanderHealthPercentBonus() {
        return this.baseCommanderHealthPercentBonus + (this.commanderHealthPercentUpgradeValue * game.upgradeManager.commanderSpecialUpgradesPurchased);
    }
    this.getMageDamagePercentBonus = function getMageDamagePercentBonus() {
        return this.baseMageDamagePercentBonus + (this.mageDamagePercentUpgradeValue * game.upgradeManager.mageSpecialUpgradesPurchased);
    }
    this.getAssassinEvasionPercentBonus = function getAssassinEvasionPercentBonus() {
        return this.baseAssassinEvasionPercentBonus + (this.assassinEvasionPercentUpgradeValue * game.upgradeManager.assassinSpecialUpgradesPurchased);
    }
    this.getWarlockCritDamageBonus = function getWarlockCritDamageBonus() {
        return this.baseWarlockCritDamageBonus + (this.warlockCritDamageUpgradeValue * game.upgradeManager.warlockSpecialUpgradesPurchased);
    }

    this.getMercenaryBaseGps = function getMercenaryBaseGps(type) {
        switch (type) {
            case MercenaryType.FOOTMAN:
                return (this.baseFootmanGps * Math.pow(2, game.upgradeManager.footmanUpgradesPurchased));
                break;
            case MercenaryType.CLERIC:
                return (this.baseClericGps * Math.pow(2, game.upgradeManager.clericUpgradesPurchased));
                break;
            case MercenaryType.COMMANDER:
                return (this.baseCommanderGps * Math.pow(2, game.upgradeManager.commanderUpgradesPurchased));
                break;
            case MercenaryType.MAGE:
                return (this.baseMageGps * Math.pow(2, game.upgradeManager.mageUpgradesPurchased));
                break;
            case MercenaryType.ASSASSIN:
                return (this.baseAssassinGps * Math.pow(2, game.upgradeManager.assassinUpgradesPurchased));
                break;
            case MercenaryType.WARLOCK:
                return (this.baseWarlockGps * Math.pow(2, game.upgradeManager.warlockUpgradesPurchased));
                break;
        }
    }

    // Get the amount of Gps a mercenary will grant
    this.getMercenariesGps = function getMercenariesGps(type) {
        switch (type) {
            case MercenaryType.FOOTMAN:
                return (this.getMercenaryBaseGps(type) * ((game.player.getGoldGain() / 100) + 1) * ((100 - this.gpsReduction) / 100)) * game.player.buffs.getGoldMultiplier();
                break;
            case MercenaryType.CLERIC:
                return (this.getMercenaryBaseGps(type) * ((game.player.getGoldGain() / 100) + 1) * ((100 - this.gpsReduction) / 100)) * game.player.buffs.getGoldMultiplier();
                break;
            case MercenaryType.COMMANDER:
                return (this.getMercenaryBaseGps(type) * ((game.player.getGoldGain() / 100) + 1) * ((100 - this.gpsReduction) / 100)) * game.player.buffs.getGoldMultiplier();
                break;
            case MercenaryType.MAGE:
                return (this.getMercenaryBaseGps(type) * ((game.player.getGoldGain() / 100) + 1) * ((100 - this.gpsReduction) / 100)) * game.player.buffs.getGoldMultiplier();
                break;
            case MercenaryType.ASSASSIN:
                return (this.getMercenaryBaseGps(type) * ((game.player.getGoldGain() / 100) + 1) * ((100 - this.gpsReduction) / 100)) * game.player.buffs.getGoldMultiplier();
                break;
            case MercenaryType.WARLOCK:
                return (this.getMercenaryBaseGps(type) * ((game.player.getGoldGain() / 100) + 1) * ((100 - this.gpsReduction) / 100)) * game.player.buffs.getGoldMultiplier();
                break;
        }
    }

    // Get the Gps
    this.getGps = function getGps() {
        var gps = 0;
        var gold = 0;

        // Go through all the mercenaries and add the gold they would generate to the gps
        for (var x = 0; x < this.mercenaries.length; x++) {
            // Reset the values
            gold = 0;

            // Get the gold gained from each mercenary
            gold += this.getMercenariesGps(this.mercenaries[x].type);

            // Add this mercenary's gold to the gps
            gps += gold;
        }

        return gps.formatMoney(2);
    }

    this.update = function update(ms) {
        // Update the gps reduction if there is a reduction active
        if (this.gpsReduction > 0) {
            this.gpsReductionTimeRemaining -= ms;

            if (this.gpsReductionTimeRemaining <= 0) {
                this.gpsReduction = 0;

                $("#gps").css('color', '#ffd800');
            }
        }

        // Give the player gold from each mercenary if enough time has passed
        gpsUpdateTime += ms;
        if (gpsUpdateTime >= gpsUpdateDelay) {
            var gainTimes = 0;
            while (gpsUpdateTime >= gpsUpdateDelay) {
                gpsUpdateTime -= gpsUpdateDelay;
                gainTimes++;
            }

            for (var x = 0; x < this.mercenaries.length; x++) {
                game.player.gainGold(((this.getMercenariesGps(this.mercenaries[x].type) / 1000) * gpsUpdateDelay) * gainTimes, false);
                game.stats.goldFromMercenaries += game.player.lastGoldGained;
            }
        }

        gps = this.getGps();

        // Update the gps amount on the screen and reposition it
        var element = document.getElementById('gps');
        element.innerHTML = gps + 'gps';
        var leftReduction = element.scrollWidth / 2;
        $("#gps").css('left', (($("#gameArea").width() / 2) - leftReduction) + 'px');
    }

    // Purchasing a new Footman
    this.purchaseMercenary = function purchaseMercenary(type) {
        var price;
        switch (type) {
            case MercenaryType.FOOTMAN: price = this.footmanPrice; break;
            case MercenaryType.CLERIC: price = this.clericPrice; break;
            case MercenaryType.COMMANDER: price = this.commanderPrice; break;
            case MercenaryType.MAGE: price = this.magePrice; break;
            case MercenaryType.ASSASSIN: price = this.assassinPrice; break;
            case MercenaryType.WARLOCK: price = this.warlockPrice; break;
        }
        // Can the player afford it?
        if (game.player.gold >= price) {
            // Remove the gold from the player
            game.player.gold -= price;

            // Add the mercenary
            this.addMercenary(type);
            switch (type) {
                case MercenaryType.FOOTMAN: this.footmenOwned++; break;
                case MercenaryType.CLERIC: this.clericsOwned++; break;
                case MercenaryType.COMMANDER: this.commandersOwned++; break;
                case MercenaryType.MAGE: this.magesOwned++; break;
                case MercenaryType.ASSASSIN: this.assassinsOwned++; break;
                case MercenaryType.WARLOCK: this.warlocksOwned++; break;
            }

            // Increase the price of the mercenary
            switch (type) {
                case MercenaryType.FOOTMAN: this.footmanPrice = Math.floor(this.baseFootmanPrice * Math.pow(1.15, this.footmenOwned)); break;
                case MercenaryType.CLERIC: this.clericPrice = Math.floor(this.baseClericPrice * Math.pow(1.15, this.clericsOwned)); break;
                case MercenaryType.COMMANDER: this.commanderPrice = Math.floor(this.baseCommanderPrice * Math.pow(1.15, this.commandersOwned)); break;
                case MercenaryType.MAGE: this.magePrice = Math.floor(this.baseMagePrice * Math.pow(1.15, this.magesOwned)); break;
                case MercenaryType.ASSASSIN: this.assassinPrice = Math.floor(this.baseAssassinPrice * Math.pow(1.15, this.assassinsOwned)); break;
                case MercenaryType.WARLOCK: this.warlockPrice = Math.floor(this.baseWarlockPrice * Math.pow(1.15, this.warlocksOwned)); break;
            }

            // Update the interface
            var leftReduction;
            switch (type) {
                case MercenaryType.FOOTMAN:
                    document.getElementById("footmanCost").innerHTML = this.footmanPrice.formatMoney(0);
                    document.getElementById("footmenOwned").innerHTML = this.footmenOwned;
                    break;
                case MercenaryType.CLERIC:
                    document.getElementById("clericCost").innerHTML = this.clericPrice.formatMoney(0);
                    document.getElementById("clericsOwned").innerHTML = this.clericsOwned;
                    break;
                case MercenaryType.COMMANDER:
                    document.getElementById("commanderCost").innerHTML = this.commanderPrice.formatMoney(0);
                    document.getElementById("commandersOwned").innerHTML = this.commandersOwned;
                    break;
                case MercenaryType.MAGE:
                    document.getElementById("mageCost").innerHTML = this.magePrice.formatMoney(0);
                    document.getElementById("magesOwned").innerHTML = this.magesOwned;
                    break;
                case MercenaryType.ASSASSIN:
                    document.getElementById("assassinCost").innerHTML = this.assassinPrice.formatMoney(0);
                    document.getElementById("assassinsOwned").innerHTML = this.assassinsOwned;
                    break;
                case MercenaryType.WARLOCK:
                    document.getElementById("warlockCost").innerHTML = this.warlockPrice.formatMoney(0);
                    document.getElementById("warlocksOwned").innerHTML = this.warlocksOwned;
                    break;
            }
        }
    }

    // Add a Gps reduction of a specified amount and duration
    this.addGpsReduction = function addGpsReduction(percentage, duration) {
        this.gpsReduction = percentage;
        this.gpsReductionTimeRemaining = (duration * 1000);

        $("#gps").css('color', '#ff0000');
    }

    this.save = function save() {
        localStorage.mercenaryManagerSaved = true;

        localStorage.footmenOwned = this.footmenOwned;
        localStorage.clericsOwned = this.clericsOwned;
        localStorage.commandersOwned = this.commandersOwned;
        localStorage.magesOwned = this.magesOwned;
        localStorage.assassinsOwned = this.assassinsOwned;
        localStorage.warlocksOwned = this.warlocksOwned;

        localStorage.mercenaries = JSON.stringify(this.mercenaries);
    }

    this.load = function load() {
        if (localStorage.mercenaryManagerSaved != null) {
            this.footmenOwned = parseInt(localStorage.footmenOwned);
            this.clericsOwned = parseInt(localStorage.clericsOwned);
            this.commandersOwned = parseInt(localStorage.commandersOwned);
            this.magesOwned = parseInt(localStorage.magesOwned);
            if (localStorage.version == null) {
                this.assassinsOwned = parseInt(localStorage.thiefsOwned);
            }
            else { this.assassinsOwned = parseInt(localStorage.assassinsOwned); }
            this.warlocksOwned = parseInt(localStorage.warlocksOwned);

            this.footmanPrice = Math.floor(this.baseFootmanPrice * Math.pow(1.15, this.footmenOwned));
            this.clericPrice = Math.floor(this.baseClericPrice * Math.pow(1.15, this.clericsOwned));
            this.commanderPrice = Math.floor(this.baseCommanderPrice * Math.pow(1.15, this.commandersOwned));
            this.magePrice = Math.floor(this.baseMagePrice * Math.pow(1.15, this.magesOwned));
            this.assassinPrice = Math.floor(this.baseAssassinPrice * Math.pow(1.15, this.assassinsOwned));
            this.warlockPrice = Math.floor(this.baseWarlockPrice * Math.pow(1.15, this.warlocksOwned));

            this.mercenaries = JSON.parse(localStorage.mercenaries);
            for (var x = 0; x < this.mercenaries.length; x++) {
                if (this.mercenaries[x].type == MercenaryType.THIEF) {
                    this.mercenaries[x].type = MercenaryType.ASSASSIN;
                }
            }

            // Update the mercenary purchase buttons
            document.getElementById("footmanCost").innerHTML = this.footmanPrice.formatMoney(0);
            document.getElementById("footmenOwned").innerHTML = this.footmenOwned;

            document.getElementById("clericCost").innerHTML = this.clericPrice.formatMoney(0);
            document.getElementById("clericsOwned").innerHTML = this.clericsOwned;

            document.getElementById("commanderCost").innerHTML = this.commanderPrice.formatMoney(0);
            document.getElementById("commandersOwned").innerHTML = this.commandersOwned;

            document.getElementById("mageCost").innerHTML = this.magePrice.formatMoney(0);
            document.getElementById("magesOwned").innerHTML = this.magesOwned;

            document.getElementById("assassinCost").innerHTML = this.assassinPrice.formatMoney(0);
            document.getElementById("assassinsOwned").innerHTML = this.assassinsOwned;

            document.getElementById("warlockCost").innerHTML = this.warlockPrice.formatMoney(0);
            document.getElementById("warlocksOwned").innerHTML = this.warlocksOwned;
        }
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                     EQUIPMENT                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
function Equipment() {
    this.slots = new Array();
    for (var x = 0; x < 10; x++) {
        this.slots[x] = null;
    }

    this.helm = function helm() { return this.slots[0]; };
    this.shoulders = function shoulders() { return this.slots[1]; };
    this.chest = function chest() { return this.slots[2]; };
    this.legs = function legs() { return this.slots[3]; };
    this.weapon = function weapon() { return this.slots[4]; };

    this.gloves = function gloves() { return this.slots[5]; };
    this.boots = function boots() { return this.slots[6]; };
    this.trinket1 = function trinket1() { return this.slots[7]; };
    this.trinket2 = function trinket2() { return this.slots[8]; };
    this.off_hand = function off_hand() { return this.slots[9]; };

    this.equipItem = function equipItem(item, currentSlotIndex) {
        if (item == null) { return; }

        // Check that the item can be equipped
        var equippable = false;
        if (item.type == ItemType.HELM || item.type == ItemType.SHOULDERS || item.type == ItemType.CHEST ||
            item.type == ItemType.LEGS || item.type == ItemType.WEAPON || item.type == ItemType.GLOVES ||
            item.type == ItemType.BOOTS || item.type == ItemType.TRINKET || item.type == ItemType.TRINKET ||
            item.type == ItemType.OFF_HAND) {
            equippable = true;
        }

        // Calculate which slot this item will go into
        var newSlotIndex = 0;
        switch (item.type) {
            case ItemType.HELM: newSlotIndex = 0; break;
            case ItemType.SHOULDERS: newSlotIndex = 1; break;
            case ItemType.CHEST: newSlotIndex = 2; break;
            case ItemType.LEGS: newSlotIndex = 3; break;
            case ItemType.WEAPON: newSlotIndex = 4; break;
            case ItemType.GLOVES: newSlotIndex = 5; break;
            case ItemType.BOOTS: newSlotIndex = 6; break;
            case ItemType.TRINKET:
                // Either select the first empty trinket slot, or the first one if both arre occupied
                if (this.slots[7] == null) {
                    newSlotIndex = 7;
                }
                else if (this.slots[8] == null) {
                    newSlotIndex = 8;
                }
                else {
                    newSlotIndex = 7;
                }
                break;
            case ItemType.OFF_HAND: newSlotIndex = 9; break;
        }

        // If the item is equippable then equip it
        if (equippable) {
            // If the slot is empty then just equip it
            if (this.slots[newSlotIndex] == null) {
                this.slots[newSlotIndex] = item;
                $(".equipItem" + (newSlotIndex + 1)).css('background', 'url("includes/images/itemSheet3.png") ' + item.iconSourceX + 'px ' + item.iconSourceY + 'px');
                game.inventory.removeItem(currentSlotIndex);

                game.player.gainItemsStats(item);
            }
            // If there is already an item in this slot, then swap the two items
            else {
                // Save the equipped item
                var savedItem = this.slots[newSlotIndex];

                // Change the equipped item
                this.slots[newSlotIndex] = item;
                $(".equipItem" + (newSlotIndex + 1)).css('background', 'url("includes/images/itemSheet3.png") ' + item.iconSourceX + 'px ' + item.iconSourceY + 'px');
                game.player.gainItemsStats(item);

                // Change the inventory item
                game.inventory.addItemToSlot(savedItem, currentSlotIndex);
                game.player.loseItemsStats(savedItem);
            }

            // If there is a new item in the old slot, change the tooltip
            if (game.inventory.slots[currentSlotIndex] != null) {
                var item = game.inventory.slots[currentSlotIndex];
                // If there is already an item equipped in the slot this item would go into, then get that item
                // Get the slot Id if there is an item equipped
                var equippedSlot = -1
                var twoTrinkets = false;
                switch (item.type) {
                    case ItemType.HELM:         if (game.equipment.helm() != null) { equippedSlot = 0 } break;
                    case ItemType.SHOULDERS:    if (game.equipment.shoulders() != null) { equippedSlot = 1; } break;
                    case ItemType.CHEST:        if (game.equipment.chest() != null) { equippedSlot = 2; } break;
                    case ItemType.LEGS:         if (game.equipment.legs() != null) { equippedSlot = 3; } break;
                    case ItemType.WEAPON:       if (game.equipment.weapon() != null) { equippedSlot = 4; } break;
                    case ItemType.GLOVES:       if (game.equipment.gloves() != null) { equippedSlot = 5; } break;
                    case ItemType.BOOTS:        if (game.equipment.boots() != null) { equippedSlot = 6; } break;
                    case ItemType.TRINKET:      if (game.equipment.trinket1() != null || game.equipment.trinket2() != null) {
                                                    equippedSlot = 7;
                                                    // Check to see if there are two trinkets equipped, then we will need to show two compare tooltips
                                                    if (game.equipment.trinket1() != null && game.equipment.trinket2() != null) {
                                                        twoTrinkets = true;
                                                    }
                                                }
                                                break;
                    case ItemType.OFF_HAND:     if (game.equipment.off_hand() != null) { equippedSlot = 9; } break;
                }
                var item2 = game.equipment.slots[equippedSlot];

                // If the item type is a trinket and there are two trinkets equipped then we need to display two compare tooltips
                if (twoTrinkets) {
                    var item3 = game.equipment.trinket2();
                }

                // Get the item slot's location
                var slot = document.getElementById("inventoryItem" + (currentSlotIndex + 1));
                var rect = slot.getBoundingClientRect();

                // Display the tooltip
                game.tooltipManager.displayItemTooltip(item, item2, item3, rect.left, rect.top, true);
            }
            // Else hide the tooltip
            else {
                $("#itemTooltip").hide();
                $("#itemCompareTooltip").hide();
                $("#itemCompareTooltip2").hide();
            }
        }
    }

    // Equip a trinket into the second slot
    this.equipSecondTrinket = function equipSecondTrinket(item, itemSlot) {
        if (item.type == ItemType.TRINKET) {
            this.equipItemInSlot(item, 8, itemSlot);

            // If there is a new item in the old slot, change the tooltip
            if (game.inventory.slots[itemSlot] != null) {
                var item = game.inventory.slots[itemSlot];
                // If there is already an item equipped in the slot this item would go into, then get that item
                // Get the slot Id if there is an item equipped
                var equippedSlot = -1
                var twoTrinkets = false;
                switch (item.type) {
                    case ItemType.HELM: if (game.equipment.helm() != null) { equippedSlot = 0 } break;
                    case ItemType.SHOULDERS: if (game.equipment.shoulders() != null) { equippedSlot = 1; } break;
                    case ItemType.CHEST: if (game.equipment.chest() != null) { equippedSlot = 2; } break;
                    case ItemType.LEGS: if (game.equipment.legs() != null) { equippedSlot = 3; } break;
                    case ItemType.WEAPON: if (game.equipment.weapon() != null) { equippedSlot = 4; } break;
                    case ItemType.GLOVES: if (game.equipment.gloves() != null) { equippedSlot = 5; } break;
                    case ItemType.BOOTS: if (game.equipment.boots() != null) { equippedSlot = 6; } break;
                    case ItemType.TRINKET: if (game.equipment.trinket1() != null || game.equipment.trinket2() != null) {
                            equippedSlot = 7;
                            // Check to see if there are two trinkets equipped, then we will need to show two compare tooltips
                            if (game.equipment.trinket1() != null && game.equipment.trinket2() != null) {
                                twoTrinkets = true;
                            }
                        }
                        break;
                    case ItemType.OFF_HAND: if (game.equipment.off_hand() != null) { equippedSlot = 9; } break;
                }
                var item2 = game.equipment.slots[equippedSlot];

                // If the item type is a trinket and there are two trinkets equipped then we need to display two compare tooltips
                if (twoTrinkets) {
                    var item3 = game.equipment.trinket2();
                }

                // Get the item slot's location
                var slot = document.getElementById("inventoryItem" + (itemSlot + 1));
                var rect = slot.getBoundingClientRect();

                // Display the tooltip
                game.tooltipManager.displayItemTooltip(item, item2, item3, rect.left, rect.top, true);
            }
            // Else hide the tooltip
            else {
                $("#itemTooltip").hide();
                $("#itemCompareTooltip").hide();
                $("#itemCompareTooltip2").hide();
            }
        }
    }

    this.equipItemInSlot = function equipItemInSlot(item, newSlotIndex, currentSlotIndex) {
        // Check that the item can be equipped in this slot
        var equippable = false;
        switch (newSlotIndex) {
            case 0: if (item.type == ItemType.HELM) { equippable = true; } break;
            case 1: if (item.type == ItemType.SHOULDERS) { equippable = true; } break;
            case 2: if (item.type == ItemType.CHEST) { equippable = true; } break;
            case 3: if (item.type == ItemType.LEGS) { equippable = true; } break;
            case 4: if (item.type == ItemType.WEAPON) { equippable = true; } break;
            case 5: if (item.type == ItemType.GLOVES) { equippable = true; } break;
            case 6: if (item.type == ItemType.BOOTS) { equippable = true; } break;
            case 7: if (item.type == ItemType.TRINKET) { equippable = true; } break;
            case 8: if (item.type == ItemType.TRINKET) { equippable = true; } break;
            case 9: if (item.type == ItemType.OFF_HAND) { equippable = true; } break;
        }

        // If the item is equippable then equip it
        if (equippable) {
            // If the slot is empty then just equip it
            if (this.slots[newSlotIndex] == null) {
                this.slots[newSlotIndex] = item;
                $(".equipItem" + (newSlotIndex + 1)).css('background', 'url("includes/images/itemSheet3.png") ' + item.iconSourceX + 'px ' + item.iconSourceY + 'px');
                game.inventory.removeItem(currentSlotIndex);

                game.player.gainItemsStats(item);
            }
            // If there is already an item in this slot, then swap the two items
            else {
                // Save the equipped item
                var savedItem = this.slots[newSlotIndex];

                // Change the equipped item
                this.slots[newSlotIndex] = item;
                $(".equipItem" + (newSlotIndex + 1)).css('background', 'url("includes/images/itemSheet3.png") ' + item.iconSourceX + 'px ' + item.iconSourceY + 'px');
                game.player.gainItemsStats(item);

                // Change the inventory item
                game.inventory.addItemToSlot(savedItem, currentSlotIndex);
                game.player.loseItemsStats(savedItem);
            }
        }
    }

    this.removeItem = function removeItem(index) {
        game.player.loseItemsStats(this.slots[index]);
        this.slots[index] = null;
        $(".equipItem" + (index + 1)).css('background', 'url("includes/images/NULL.png")');
    }

    // Unequip an item to the first available slot
    this.unequipItem = function unequipItem(slot) {
        // Find the first available slot
        var newSlot = -1;
        for (var x = 0; x < game.inventory.slots.length; x++) {
            if (game.inventory.slots[x] == null) {
                newSlot = x;
                break;
            }
        }

        // If there was an available slot; unequip the item
        if (newSlot != -1) {
            game.inventory.addItemToSlot(this.slots[slot], newSlot);
            this.removeItem(slot);
        }
    }

    // Attempt to remove an item from the equipment into a designated inventory slot
    this.unequipItemToSlot = function unequipItemToSlot(currentSlotIndex, newSlotIndex) {
        var inventorySlotItem = game.inventory.slots[newSlotIndex];

        // If the inventory slot contains no item, just send the item to it
        if (inventorySlotItem == null) {
            game.inventory.addItemToSlot(this.slots[currentSlotIndex], newSlotIndex);
            this.removeItem(currentSlotIndex);
        }
        // Else; check to see if the items are the same type
        else if (this.slots[currentSlotIndex].type == inventorySlotItem.type) {
            // If they are then swap them
            // Save the equipped item
            var savedItem = this.slots[currentSlotIndex];

            // Change the equipped item
            this.slots[currentSlotIndex] = inventorySlotItem;
            game.player.gainItemsStats(inventorySlotItem);
            $(".equipItem" + (currentSlotIndex + 1)).css('background', 'url("includes/images/itemSheet3.png") ' + inventorySlotItem.iconSourceX + 'px ' + inventorySlotItem.iconSourceY + 'px');

            // Change the inventory item
            game.inventory.addItemToSlot(savedItem, newSlotIndex);
            game.player.loseItemsStats(savedItem);
        }
    }

    // Swap the two trinket items
    this.swapTrinkets = function swapTrinkets() {
        // Save the first trinket
        var savedItem = this.slots[7];

        // Change the first slot item
        this.slots[7] = this.slots[8];
        if (this.slots[7] != null) {
            $(".equipItem" + 8).css('background', 'url("includes/images/itemSheet3.png") ' + this.slots[7].iconSourceX + 'px ' + this.slots[7].iconSourceY + 'px');
        }
        else {
            $(".equipItem" + 8).css('background', 'url("includes/images/NULL.png")');
        }

        // Change the second slot item
        this.slots[8] = savedItem;
        if (savedItem != null) {
            $(".equipItem" + 9).css('background', 'url("includes/images/itemSheet3.png") ' + savedItem.iconSourceX + 'px ' + savedItem.iconSourceY + 'px');
        }
        else {
            $(".equipItem" + 9).css('background', 'url("includes/images/NULL.png")');
        }
    }

    this.save = function save() {
        localStorage.equipmentSaved = true;
        localStorage.equipmentSlots = JSON.stringify(this.slots);
    }

    this.load = function load() {
        if (localStorage.equipmentSaved != null) {
            this.slots = JSON.parse(localStorage.equipmentSlots);
            for (var x = 0; x < this.slots.length; x++) {
                if (this.slots[x] != null) {
                    if (this.slots[x].effects != null) {
                        for (var y = 0; y < this.slots[x].effects.length; y++) {
                            this.slots[x].effects[y] = new Effect(this.slots[x].effects[y].type, this.slots[x].effects[y].chance, this.slots[x].effects[y].value);
                        }
                    }
                    else { this.slots[x].effects = new Array(); }
                    if (this.slots[x].evasion == null) {
                        this.slots[x].evasion = 0;
                    }
                }
            }

            // Display the equipment in the window for all these slots
            if (localStorage.version != null) {
                for (var x = 0; x < this.slots.length; x++) {
                    if (this.slots[x] != null) {
                        $(".equipItem" + (x + 1)).css('background', 'url("includes/images/itemSheet3.png") ' + this.slots[x].iconSourceX + 'px ' + this.slots[x].iconSourceY + 'px');
                    }
                }
            }
            else {
                for (var x = 0; x < this.slots.length; x++) {
                    if (this.slots[x] != null) {
                        this.slots[x].iconSourceX = (this.slots[x].iconSourceX / 4) * 3.5;
                        this.slots[x].iconSourceY = (this.slots[x].iconSourceY / 4) * 3.5;
                        $(".equipItem" + (x + 1)).css('background', 'url("includes/images/itemSheet3.png") ' + this.slots[x].iconSourceX + 'px ' + this.slots[x].iconSourceY + 'px');
                    }
                }
            }
        }
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                     INVENTORY                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
function Inventory() {
    this.slots = new Array();
    this.maxSlots = 25;
    this.autoSellCommons = false;
    this.autoSellUncommons = false;
    this.autoSellRares = false;
    this.autoSellEpics = false;
    this.autoSellLegendaries = false;
    this.autoSellTimeRemaining = 5000;
    this.autoSellInterval = 5000;

    // Initialize the slots
    for (var x = 0; x < this.maxSlots; x++) {
        this.slots[x] = null;
    }

    // Loot an item if there is room
    this.lootItem = function lootItem(item) {
        for (var x = 0; x < this.maxSlots; x++) {
            if (this.slots[x] == null) {
                this.slots[x] = item;
                $("#inventoryItem" + (x + 1)).css('background', ('url("includes/images/itemSheet3.png") ' + item.iconSourceX + 'px ' + item.iconSourceY + 'px'));
                game.stats.itemsLooted++;
                break;
            }
        }
    }

    // Swap the location of two items in the inventory
    this.swapItems = function swapItems(index1, index2) {
        var savedItem = this.slots[index1];

        this.slots[index1] = this.slots[index2];
        if (this.slots[index1] != null) {
            $("#inventoryItem" + (index1 + 1)).css('background', 'url("includes/images/itemSheet3.png") ' + this.slots[index1].iconSourceX + 'px ' + this.slots[index1].iconSourceY + 'px');
        }
        else {
            $("#inventoryItem" + (index1 + 1)).css('background', 'url("includes/images/NULL.png")');
        }

        this.slots[index2] = savedItem;
        if (this.slots[index2] != null) {
            $("#inventoryItem" + (index2 + 1)).css('background', 'url("includes/images/itemSheet3.png") ' + savedItem.iconSourceX + 'px ' + savedItem.iconSourceY + 'px');
        }
        else {
            $("#inventoryItem" + (index2 + 1)).css('background', 'url("includes/images/NULL.png")');
        }
    }

    // Remove an item from the inventory
    this.removeItem = function removeItem(index) {
        this.slots[index] = null;
        $("#inventoryItem" + (index + 1)).css('background', 'url("includes/images/NULL.png")');
    }

    // Add an item to a specified slot
    this.addItemToSlot = function addItemToSlot(item, index) {
        this.slots[index] = item;
        $("#inventoryItem" + (index + 1)).css('background', 'url("includes/images/itemSheet3.png") ' + item.iconSourceX + 'px ' + item.iconSourceY + 'px');
    }

    // Sell an item in a specified slot
    this.sellItem = function sellItem(slot) {
        if (this.slots[slot] != null) {
            // Get the sell value and give the gold to the player; don't use the gainGold function as it will include gold gain bonuses
            var value = this.slots[slot].sellValue;
            game.player.gold += value;
            // Remove the item and hide the tooltip
            this.removeItem(slot);
            $('#itemTooltip').hide();
            game.stats.itemsSold++;
            game.stats.goldFromItems += value;
        }
    }

    // Sell every item in the player's inventory
    this.sellAll = function sellAll() {
        for (var x = 0; x < this.slots.length; x++) {
            this.sellItem(x);
        }
    }

    // Unlock the ability to auto sell an item rarity
    this.unlockAutoSell = function unlockAutoSell(rarity) {
        switch (rarity) {
            case ItemRarity.COMMON: $("#checkboxWhite").show(); break;
            case ItemRarity.UNCOMMON: $("#checkboxGreen").show(); break;
            case ItemRarity.RARE: $("#checkboxBlue").show(); break;
            case ItemRarity.EPIC: $("#checkboxPurple").show(); break;
            case ItemRarity.LEGENDARY: $("#checkboxOrange").show(); break;
        }
    }

    this.save = function save() {
        localStorage.inventorySaved = true;
        localStorage.inventorySlots = JSON.stringify(this.slots);
    }

    this.load = function load() {
        if (localStorage.inventorySaved != null) {
            this.slots = JSON.parse(localStorage.inventorySlots);
            for (var x = 0; x < this.slots.length; x++) {
                if (this.slots[x] != null) {
                    if (this.slots[x].effects != null) {
                        for (var y = 0; y < this.slots[x].effects.length; y++) {
                            this.slots[x].effects[y] = new Effect(this.slots[x].effects[y].type, this.slots[x].effects[y].chance, this.slots[x].effects[y].value);
                        }
                    }
                    else { this.slots[x].effects = new Array(); }
                    if (this.slots[x].evasion == null) {
                        this.slots[x].evasion = 0;
                    }
                }
            }

            // Go through all the slots and show their image in the inventory
            if (localStorage.version != null) {
                for (var x = 0; x < this.slots.length; x++) {
                    if (this.slots[x] != null) {
                        $("#inventoryItem" + (x + 1)).css('background', 'url("includes/images/itemSheet3.png") ' + this.slots[x].iconSourceX + 'px ' + this.slots[x].iconSourceY + 'px');
                    }
                }
            }
            else {
                for (var x = 0; x < this.slots.length; x++) {
                    if (this.slots[x] != null) {
                        this.slots[x].iconSourceX = (this.slots[x].iconSourceX / 4) * 3.5;
                        this.slots[x].iconSourceY = (this.slots[x].iconSourceY / 4) * 3.5;
                        $("#inventoryItem" + (x + 1)).css('background', 'url("includes/images/itemSheet3.png") ' + this.slots[x].iconSourceX + 'px ' + this.slots[x].iconSourceY + 'px');
                    }
                }
            }
        }
    }

    this.update = function update(ms) {
        // If enough time has passed ell any items the player wants auto selling
        this.autoSellTimeRemaining -= ms;
        if (this.autoSellTimeRemaining <= 0) {
            this.autoSellTimeRemaining = this.autoSellInterval;
            for (var x = 0; x < this.slots.length; x++) {
                if (this.slots[x] != null) {
                    if ((this.slots[x].rarity == ItemRarity.COMMON && this.autoSellCommons) || (this.slots[x].rarity == ItemRarity.UNCOMMON && this.autoSellUncommons) ||
                    (this.slots[x].rarity == ItemRarity.RARE && this.autoSellRares) || (this.slots[x].rarity == ItemRarity.EPIC && this.autoSellEpics) ||
                    (this.slots[x].rarity == ItemRarity.LEGENDARY && this.autoSellLegendaries)) {
                        this.sellItem(x);
                    }
                }
            }
        }
    }
}

// When one of the sell all checkboxes are clicked, update the player's auto sell preferance
function sellAllCheckboxClicked(checkbox, id) {
    switch (id) {
        case 1: game.inventory.autoSellCommons = checkbox.checked; break;
        case 2: game.inventory.autoSellUncommons = checkbox.checked; break;
        case 3: game.inventory.autoSellRares = checkbox.checked; break;
        case 4: game.inventory.autoSellEpics = checkbox.checked; break;
        case 5: game.inventory.autoSellLegendaries = checkbox.checked; break;
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                      QUESTS                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
QuestType = new Object();
QuestType.KILL = "KILL";
QuestType.MERCENARIES = "MERCENARIES";
QuestType.UPGRADE = "UPGRADE";

function Quest(name, description, type, typeId, typeAmount, goldReward, expReward, buffReward) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.typeId = typeId;
    this.typeAmount = typeAmount;
    this.goldReward = goldReward;
    this.expReward = expReward;
    this.buffReward = buffReward;

    this.originalKillCount = 0;
    this.killCount = 0;

    this.complete = false;

    // The Id that this quest will use to display in the quests window
    this.displayId = game.questsManager.quests.length + 1;

    this.update = function update() {
        // Update this quest depending on the type that it is
        switch (this.type) {
            // Kill Quest - Check if the amount of monsters required has been met     
            case QuestType.KILL:
                if (this.killCount >= this.typeAmount) {
                    this.complete = true;
                }
                break;
            // Mercenary Quest - Check if the amount of mercenaries required has been met     
            case QuestType.MERCENARIES:
                switch (this.typeId) {
                    case 0:
                        if (game.mercenaryManager.footmenOwned >= this.typeAmount) {
                            this.complete = true;
                        }
                        break;
                    case 1:
                        if (game.mercenaryManager.clericsOwned >= this.typeAmount) {
                            this.complete = true;
                        }
                        break;
                    case 2:
                        if (game.mercenaryManager.commandersOwned >= this.typeAmount) {
                            this.complete = true;
                        }
                        break;
                    case 3:
                        if (game.mercenaryManager.magesOwned >= this.typeAmount) {
                            this.complete = true;
                        }
                        break;
                    case 4:
                        if (game.mercenaryManager.assassinsOwned >= this.typeAmount) {
                            this.complete = true;
                        }
                        break;
                    case 5:
                        if (game.mercenaryManager.warlocksOwned >= this.typeAmount) {
                            this.complete = true;
                        }
                        break;
                }
                break;
            // Upgrade Quest - Check if the required upgrade has been purchased  
            case QuestType.UPGRADE:
                if (game.upgradeManager.upgrades[this.typeId].purchased) {
                    this.complete = true;
                }
                break;
        }
    }

    this.grantReward = function grantReward() {
        game.player.gainGold(this.goldReward, false);
        game.stats.goldFromQuests += game.player.lastGoldGained;
        game.player.gainExperience(this.expReward, false);
        game.stats.experienceFromQuests += game.player.lastExperienceGained;
        if (this.buffReward != null) {
            game.player.buffs.addBuff(this.buffReward);
        }
    }
}

function QuestsManager() {
    this.quests = new Array();
    this.selectedQuest = 0;
    this.questsButtonGlowing = false;

    this.addQuest = function addQuest(quest) {
        this.quests.push(quest);
        game.displayAlert("New quest received!");
        this.glowQuestsButton();

        // Create the quest entry in the quest window for this quest
        var newDiv = document.createElement('div');
        newDiv.id = 'questName' + quest.displayId;
        newDiv.className = 'questName';
        var id = quest.displayId - 1;
        newDiv.onmousedown = function () { questNameClick(id); }
        newDiv.innerHTML = quest.name;
        var container = document.getElementById("questNamesArea");
        container.appendChild(newDiv);

        $("#questNamesArea").show();
        $("#questTextArea").show();
    }

    // Go through every quest and update it
    // If the quest is now complete, grant the reward and remove it
    this.update = function update() {
        for (var x = this.quests.length - 1; x >= 0; x--) {
            this.quests[x].update();
            if (this.quests[x].complete) {
                this.quests[x].grantReward();
                // If this is a tutorial quest then update the tutorial
                if (this.quests[x].name == "A Beginner's Task") {
                    game.tutorialManager.quest1Complete = true;
                }
                else if (this.quests[x].name == "A Helping Hand") {
                    game.tutorialManager.quest2Complete = true;
                }
                else if (this.quests[x].name == "Strengthening your Forces") {
                    game.tutorialManager.quest3Complete = true;
                }
                this.removeQuest(x);
                game.stats.questsCompleted++;
            }
        }
    }

    this.stopGlowingQuestsButton = function stopGlowingQuestsButton() {
        this.questsButtonGlowing = false;
        $("#questsWindowButtonGlow").stop(true);
        $("#questsWindowButtonGlow").css('opacity', 0);
        $("#questsWindowButtonGlow").css('background', 'url("includes/images/windowButtons.png") 78px 195px');
    }
    this.glowQuestsButton = function glowQuestsButton() {
        this.questsButtonGlowing = true;
        $("#questsWindowButtonGlow").animate({ opacity:'+=0.5' }, 400);
        $("#questsWindowButtonGlow").animate({ opacity:'-=0.5' }, 400, function() { glowQuestsButton(); });
    }

    // Go through every quest and if it is a kill quest and the level required is equal to this one; increase the kill count
    this.updateKillCounts = function updateKillCounts(level) {
        for (var x = 0; x < this.quests.length; x++) {
            if (this.quests[x].type == QuestType.KILL && this.quests[x].typeId == level) {
                this.quests[x].killCount++;
            }
        }
    }

    this.removeQuest = function removeQuest(id) {
        // Remove the quest and calculate the display id it had
        this.quests.splice(id, 1);
        var displayId = id + 1;

        // Update all the quests with their new ids and change the names in the quest window
        for (var x = id; x < this.quests.length; x++) {
            this.quests[x].displayId--;

            var element = document.getElementById("questName" + (x + 1));
            element.innerHTML = this.quests[x].name;
        }

        // Remove the last element as it is no longer used
        currentElement = document.getElementById('questName' + (this.quests.length + 1));
        currentElement.parentNode.removeChild(currentElement);

        // Reset the selected quest if the currently selected one is this one
        if (this.selectedQuest == id) {
            this.selectedQuest = 0;

            // If there are no quests then hide the current quest text
            $("#questTextArea").hide();
        }
    }

    this.getSelectedQuest = function getSelectedQuest() {
        if (this.quests.length >= 0) {
            return this.quests[this.selectedQuest];
        }
        else { return null; }
    }

    this.save = function save() {
        localStorage.questsManagerSaved = true;

        var questNames = new Array();
        var questDescriptions = new Array();
        var questTypes = new Array();
        var questTypeIds = new Array();
        var questTypeAmounts = new Array();
        var questGoldRewards = new Array();
        var questExpRewards = new Array();
        var questBuffRewards = new Array();

        for (var x = 0; x < this.quests.length; x++) {
            questNames.push(this.quests[x].name);
            questDescriptions.push(this.quests[x].description);
            questTypes.push(this.quests[x].type);
            questTypeIds.push(this.quests[x].typeId);
            questTypeAmounts.push(this.quests[x].typeAmount);
            questGoldRewards.push(this.quests[x].goldReward);
            questExpRewards.push(this.quests[x].expReward);
            questBuffRewards.push(this.quests[x].buffReward);
        }

        localStorage.setItem("questNames", JSON.stringify(questNames));
        localStorage.setItem("questDescriptions", JSON.stringify(questDescriptions));
        localStorage.setItem("questTypes", JSON.stringify(questTypes));
        localStorage.setItem("questTypeIds", JSON.stringify(questTypeIds));
        localStorage.setItem("questTypeAmounts", JSON.stringify(questTypeAmounts));
        localStorage.setItem("questGoldRewards", JSON.stringify(questGoldRewards));
        localStorage.setItem("questExpRewards", JSON.stringify(questExpRewards));
        localStorage.setItem("questBuffRewards", JSON.stringify(questBuffRewards));
    }

    this.load = function load() {
        if (localStorage.questsManagerSaved != null) {
            var questNames = JSON.parse(localStorage.getItem("questNames"));
            var questDescriptions = JSON.parse(localStorage.getItem("questDescriptions"));
            var questTypes = JSON.parse(localStorage.getItem("questTypes"));
            var questTypeIds = JSON.parse(localStorage.getItem("questTypeIds"));
            var questTypeAmounts = JSON.parse(localStorage.getItem("questTypeAmounts"));
            var questGoldRewards = JSON.parse(localStorage.getItem("questGoldRewards"));
            var questExpRewards = JSON.parse(localStorage.getItem("questExpRewards"));
            var questBuffRewards = JSON.parse(localStorage.getItem("questBuffRewards"));

            if (questBuffRewards == null) {
                for (var x = 0; x < questNames.length; x++) {
                    this.addQuest(new Quest(questNames[x], questDescriptions[x], questTypes[x], questTypeIds[x], questTypeAmounts[x], questGoldRewards[x], questExpRewards[x], null));
                }
            }
            else {
                for (var x = 0; x < questNames.length; x++) {
                    this.addQuest(new Quest(questNames[x], questDescriptions[x], questTypes[x], questTypeIds[x], questTypeAmounts[x], questGoldRewards[x], questExpRewards[x], null));
                }
            }
        }
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                       BUFFS                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
BuffType = new Object();
BuffType.DAMAGE = "DAMAGE";
BuffType.GOLD = "GOLD";
BuffType.EXPERIENCE = "EXPERIENCE";

function Buff(name, type, multiplier, duration, leftPos, topPos) {
    this.id = null;
    this.name = name;
    this.type = type;
    this.multiplier = multiplier;
    this.currentDuration = duration * 1000;
    this.maxDuration = duration * 1000;
    this.leftPos = leftPos;
    this.topPos = topPos;
}

function BuffManager() {
    this.buffs = new Array();

    this.addBuff = function addBuff(buff) {
        buff.id = this.buffs.length + 1;
        this.buffs.push(buff);
        game.displayAlert(buff.name);

        var newDiv = document.createElement('div');
        newDiv.id = 'buffContainer' + buff.id;
        newDiv.className = 'buffContainer';
        var container = document.getElementById("buffsArea");
        container.appendChild(newDiv);

        var newDiv2 = document.createElement('div');
        newDiv2.id = 'buffIcon' + buff.id;
        newDiv2.className = 'buffIcon';
        newDiv2.style.background = 'url("includes/images/buffIcons.png") ' + buff.leftPos + 'px ' + buff.topPos + 'px';
        newDiv.appendChild(newDiv2);

        var newDiv3 = document.createElement('div');
        newDiv3.id = 'buffBar' + buff.id;
        newDiv3.className = 'buffBar';
        newDiv3.style.width = '175px';
        newDiv.appendChild(newDiv3);
    }

    this.getDamageMultiplier = function getDamageMultiplier() {
        var multiplier = 0;
        for (var x = 0; x < this.buffs.length; x++) {
            if (this.buffs[x].type == BuffType.DAMAGE) {
                multiplier += this.buffs[x].multiplier;
            }
        }
        if (multiplier == 0) { multiplier = 1; }
        return multiplier;
    }
    this.getGoldMultiplier = function getGoldMultiplier() {
        var multiplier = 0;
        for (var x = 0; x < this.buffs.length; x++) {
            if (this.buffs[x].type == BuffType.GOLD) {
                multiplier += this.buffs[x].multiplier;
            }
        }
        if (multiplier == 0) { multiplier = 1; }
        return multiplier;
    }
    this.getExperienceMultiplier = function getExperienceMultiplier() {
        var multiplier = 0;
        for (var x = 0; x < this.buffs.length; x++) {
            if (this.buffs[x].type == BuffType.EXPERIENCE) {
                multiplier += this.buffs[x].multiplier;
            }
        }
        if (multiplier == 0) { multiplier = 1; }
        return multiplier;
    }

    this.update = function update(ms) {
        // Update all the buff durations
        for (var x = this.buffs.length - 1; x >= 0; x--) {
            this.buffs[x].currentDuration -= ms;
            // If the buff has expired, remove it and its elements, then update the id of all the other buffs that need updating
            if (this.buffs[x].currentDuration <= 0) {
                var buffContainer = document.getElementById('buffContainer' + (this.buffs.length));
                buffContainer.parentNode.removeChild(buffContainer);
                this.buffs.splice(x, 1);

                for (var y = x; y < this.buffs.length; y++) {
                    this.buffs[x].id--;
                }
            }
            else {
                var buffBar = document.getElementById('buffBar' + (x + 1));
                buffBar.style.width = (175 * (this.buffs[x].currentDuration / this.buffs[x].maxDuration)) + 'px';
            }
        }
    }

    this.getRandomQuestRewardBuff = function getRandomQuestRewardBuff() {
        switch (Math.floor(Math.random() * 9)) {
            case 0: return new Buff("Damage x2", BuffType.DAMAGE, 2, 60, 0, 0); break;
            case 1: return new Buff("Damage x4", BuffType.DAMAGE, 4, 60, 30, 0); break;
            case 2: return new Buff("Damage x7", BuffType.DAMAGE, 7, 60, 15, 0); break;
            case 3: return new Buff("Gold x2", BuffType.GOLD, 2, 60, 0, 30); break;
            case 4: return new Buff("Gold x4", BuffType.GOLD, 4, 60, 30, 30); break;
            case 5: return new Buff("Gold x7", BuffType.GOLD, 7, 60, 15, 30); break;
            case 6: return new Buff("Experience x2", BuffType.EXPERIENCE, 2, 60, 0, 15); break;
            case 7: return new Buff("Experience x4", BuffType.EXPERIENCE, 4, 60, 30, 15); break;
            case 8: return new Buff("Experience x7", BuffType.EXPERIENCE, 7, 60, 15, 15); break;
        }
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                      EVENTS                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
EventType = new Object();
EventType.QUEST = "QUEST";
EventType.amount = 1;

QuestNamePrefixes = new Array("Clearing", "Reaping", "Destroying", "Removing", "Obliterating");
QuestNameSuffixes = new Array("Threat", "Swarm", "Horde", "Pillagers", "Ravagers");

function Event(id) {
    this.id = id;
    this.type = null;
    this.quest = null;
    this.velY = 0;
}

function EventManager() {
    this.eventSpawnTime = 3600000;
    this.eventSpawnTimeRemaining = this.eventSpawnTime;
    this.events = new Array();

    this.addRandomEvent = function addRandomEvent(level) {
        var event = new Event(this.events.length + 1);
        event.type = EventType.QUEST;
        // Create a random quest
        var name = QuestNamePrefixes[Math.floor(Math.random() * 5)] + ' the ' + QuestNameSuffixes[Math.floor(Math.random() * 5)];
        var amount = Math.floor(Math.random() * 6) + 7;
        event.quest = new Quest(name, ("Kill " + amount + " level " + level + " monsters."), QuestType.KILL, level, amount, (level * 10), (level * 10), game.player.buffs.getRandomQuestRewardBuff());
        this.events.push(event);

        var newDiv = document.createElement('div');
        newDiv.id = 'eventButton' + event.id;
        newDiv.className = 'eventButton button';
        newDiv.onmousedown = function () { clickEventButton(newDiv, event.id); }
        var container = document.getElementById("eventsArea");
        container.appendChild(newDiv);
    }

    this.update = function update(ms) {
        // Add a new event if enough time has passed
        this.eventSpawnTimeRemaining -= ms;
        if (this.eventSpawnTimeRemaining <= 0) {
            this.eventSpawnTimeRemaining = this.eventSpawnTime;
            this.addRandomEvent(game.player.level);
        }

        // Keep all the event buttons falling down
        var elements = document.getElementsByClassName('eventButton');
        for (var x = 0; x < this.events.length; x++) {
            var element = elements[x]
            var parent = element.parentNode;
            var bottom = parent.clientHeight - element.offsetTop - element.clientHeight;
            var minBottom = x * 25;
            var newBottom = bottom - (this.events[x].velY * (ms / 1000));
            if (newBottom < minBottom) { newBottom = minBottom; this.events[x].velY = 0; }
            element.style.bottom = newBottom + 'px';
            this.events[x].velY += 10;
        }
    }

    this.startEvent = function startEvent(obj, id) {
        // Remove the event button
        obj.parentNode.removeChild(obj);
        game.questsManager.addQuest(this.events[id - 1].quest);
        this.events.splice(id - 1, 1);

        // Change all the ids of the events that need changing
        for (var x = id - 1; x < this.events.length; x++) {
            this.events[x].id--;
        }
    }
}

function clickEventButton(obj, id) {
    game.eventManager.startEvent(obj, id);
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                     TUTORIALS                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
function TutorialManager() {
    this.currentTutorial = 0;
    // If each of the tutorials have had the continue button pressed
    this.tutorialContinued = new Array();
    this.tutorialsAmount = 12;

    // Tutorial 1
    this.battleButtonClicked = false;
    // Tutorial 2
    this.monsterKilled = false;
    // Tutorial 4
    this.statUpgradeChosen = false;
    // Tutorial 5
    this.leaveBattleButtonPressed = false;
    // Tutorial 7
    this.quest1Complete = false;
    // Tutorial 8
    this.inventoryOpened = false;
    // Tutorial 9
    this.equipmentOpened = false;
    // Tutorial 10
    this.quest2Complete = false;
    // Tutorial 11
    this.quest3Complete = false;

    for (var x = 0; x < this.tutorialsAmount; x++) {
        this.tutorialContinued.push(false);
    }

    this.tutorialDescriptions = new Array(
        "Welcome to Endless Battle, to get started click the enter battle button.",
        "Entering battle will engage you with a random monster. If your current opponent is too strong, you can leave the battle and enter again. Let's get started with some combat, use your Attack ability to kill the monster.",
        "Well fought, keep killing monsters until you reach level 2.",
        "Congratulations! When you level up you get to choose a random upgrade. Click the level up button and choose an upgrade.",
        "Click the Leave Battle button so we can continue.",
        "When out of battle, you can increase the level of the monsters you will fight. However you can only fight monsters lower than or equal to your own level.",
        "It's time for your first quest. Open the quests window and complete that quest, then we shall continue.",
        "You've killed quite a few monsters now, open your inventory and see if you've gathered any loot.",
        "When you equip your loot you can view your stats and equipment here.",
        "Killing monsters for gold is good, but if you really want to get rich you should hire mercenaries. I've given you a new quest, purchase 5 footmen and then we'll continue.",
        "Mercenaries are good, but to make them more worth their money you can purchase upgrades. It's time for another quest, get a total of 10 Footmen to unlock the Footman Training upgrade and then purchase it.",
        "Well done! You're off to a great start, but there's dangerous monsters, powerful loot and riches ahead. This concludes the tutorial, good luck!");

    this.initialize = function initialize() {
        document.getElementById("tutorialDescription").innerHTML = this.tutorialDescriptions[0];
        $("#tutorialContinueButton").hide();

        // Animate the quest arrows
        this.animateRightArrow();

        $("#tutorialArea").css('left', '0');
        $("#tutorialArea").css('right', '0');
        $("#tutorialArea").css('top', '0');
        $("#tutorialArea").css('bottom', '0');
        $("#tutorialArea").css('margin', 'auto');
        $("#tutorialArea").css('padding-right', '660px');
        $("#tutorialArea").css('padding-bottom', '50px');
        $("#tutorialArea").show();

        $("#tutorialRightArrow").stop(true);
        $("#tutorialRightArrow").css('left', '290px');
        $("#tutorialRightArrow").css('top', '67px');
        this.animateRightArrow();
    }

    this.animateRightArrow = function animateRightArrow() {
        $("#tutorialRightArrow").animate({ left:'+=20px' }, 400);
        $("#tutorialRightArrow").animate({ left:'-=20px' }, 400, function() { animateRightArrow(); });
    }

    this.advanceTutorial = function advanceTutorial() {
        this.currentTutorial++;
        if (this.currentTutorial < this.tutorialsAmount) {
            document.getElementById("tutorialDescription").innerHTML = this.tutorialDescriptions[this.currentTutorial];
        }
        $("#tutorialWindow").show();
        $("#tutorialRightArrow").show();
    }

    this.continueTutorial = function continueTutorial() {
        this.tutorialContinued[this.currentTutorial] = true;
        this.hideTutorial();
    }

    this.hideTutorial = function hideTutorial() {
        $("#tutorialWindow").hide();
        $("#tutorialRightArrow").hide();
    }

    this.update = function update() {
        // Check the requirements of the current tutorial, if it is completed then start the next tutorial
        switch (this.currentTutorial) {
            case 0:
                if (this.battleButtonClicked) {
                    this.advanceTutorial();
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '137px');
                    this.animateRightArrow();
                }
                break;
            case 1:
                if (this.monsterKilled) {
                    this.advanceTutorial();
                    $("#expBarArea").show();
                }
                break;
            case 2:
                if (game.player.level >= 2) {
                    this.advanceTutorial();
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '137px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('top', '');
                    $("#tutorialArea").css('bottom', '-40px');
                }
                break;
            case 3:
                if (this.statUpgradeChosen) {
                    this.advanceTutorial();
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '97px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('top', '0');
                    $("#tutorialArea").css('bottom', '0');
                }
                break;
            case 4:
                if (this.leaveBattleButtonPressed) {
                    this.advanceTutorial();
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '67px');
                    $("#tutorialRightArrow").css('z-index', '3');
                    this.animateRightArrow();
                    $("#tutorialArea").css('padding-right', '200px');
                    $("#tutorialArea").css('z-index', '');
                    $("#tutorialWindow").css('z-index', '3');
                    $("#tutorialContinueButton").show();
                }
            case 5://
                if (this.tutorialContinued[5]) {
                    this.advanceTutorial();
                    game.questsManager.addQuest(new Quest("A Beginner's Task", "It's time for your first quest as well as more combat experience. Increase the battle level and slay a level 2 monster and the tutorial will continue.", QuestType.KILL, 2, 1, 5, 5, null));
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '67px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('left', '');
                    $("#tutorialArea").css('right', '50px');
                    $("#tutorialArea").css('top', '55px');
                    $("#tutorialArea").css('bottom', '');
                    $("#tutorialArea").css('margin', '');
                    $("#tutorialArea").css('padding-right', '');
                    $("#tutorialContinueButton").hide();
                    $(".questsWindowButton").show();
                    $("#questsWindowButtonGlow").show();
                }
            case 6://
                if (this.quest1Complete) {
                    this.advanceTutorial();
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").show();
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '137px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('top', '');
                    $("#tutorialArea").css('bottom', '5px');
                    $("#tutorialArea").css('padding-bottom', '');
                    $(".inventoryWindowButton").show();
                }
                break;
            case 7://
                if (this.inventoryOpened) {
                    this.advanceTutorial();
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '0px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('top', '5px');
                    $("#tutorialArea").css('bottom', '');
                    $(".characterWindowButton").show();
                }
                break;
            case 8://
                if (this.equipmentOpened) {
                    this.advanceTutorial();
                    game.questsManager.addQuest(new Quest("A Helping Hand", "You've slain monsters, but if you really want a lot of gold you'll need to hire mercenaries to help you. Hire 5 Footmen to continue the tutorial.", QuestType.MERCENARIES, 0, 5, 10, 10, null));
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '38px');
                    this.animateRightArrow();
                    $(".mercenariesWindowButton").show();
                }
                break;
            case 9:
                if (this.quest2Complete) {
                    this.advanceTutorial();
                    game.questsManager.addQuest(new Quest("Strengthening your Forces", "Purchasing those footmen is a good start, but they can get pricey. To negate this inflation you'll need to upgrade them. Hire a total of 10 Footmen and then buy the Footman Training upgrade.", QuestType.UPGRADE, 0, 0, 50, 50, null));
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '67px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('top', '14px');
                    $(".upgradesWindowButton").show();
                    $("#upgradesWindowButtonGlow").show();
                }
                break;
            case 10:
                if (this.quest3Complete) {
                    this.advanceTutorial();
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").hide();
                    $("#tutorialArea").css('left', '0');
                    $("#tutorialArea").css('right', '0');
                    $("#tutorialArea").css('top', '0');
                    $("#tutorialArea").css('bottom', '0');
                    $("#tutorialArea").css('margin', 'auto');
                    $("#tutorialArea").css('padding-right', '660px');
                    $("#tutorialArea").css('padding-bottom', '50px');
                    $("#tutorialContinueButton").show();
                }
                break;
        }
    }

    this.save = function save() {
        localStorage.tutorialSaved = true;
        localStorage.currentTutorial = this.currentTutorial;
    }

    this.load = function load() {
        if (localStorage.tutorialSaved != null) {
            this.currentTutorial = parseInt(localStorage.currentTutorial);

            switch (this.currentTutorial) {
                case 0:
                    break;
                case 1:
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '137px');
                    this.animateRightArrow();
                    document.getElementById("tutorialDescription").innerHTML = this.tutorialDescriptions[this.currentTutorial];
                    break;
                case 2:
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '137px');
                    this.animateRightArrow();
                    $("#expBarArea").show();
                    document.getElementById("tutorialDescription").innerHTML = this.tutorialDescriptions[this.currentTutorial];
                    break;
                case 3://
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '137px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('top', '');
                    $("#tutorialArea").css('bottom', '-40px');
                    $("#expBarArea").show();
                    document.getElementById("tutorialDescription").innerHTML = this.tutorialDescriptions[this.currentTutorial];
                    break;
                case 4:
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '97px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('top', '0');
                    $("#tutorialArea").css('bottom', '0');
                    $("#expBarArea").show();
                    document.getElementById("tutorialDescription").innerHTML = this.tutorialDescriptions[this.currentTutorial];
                    break;
                case 5:
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '67px');
                    $("#tutorialRightArrow").css('z-index', '3');
                    this.animateRightArrow();
                    $("#tutorialArea").css('padding-right', '200px');
                    $("#tutorialWindow").css('z-index', '3');
                    $("#tutorialContinueButton").show();
                    $("#expBarArea").show();
                    document.getElementById("tutorialDescription").innerHTML = this.tutorialDescriptions[this.currentTutorial];
                    break;
                case 6:
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '67px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('left', '');
                    $("#tutorialArea").css('right', '50px');
                    $("#tutorialArea").css('top', '55px');
                    $("#tutorialArea").css('bottom', '');
                    $("#tutorialArea").css('margin', '');
                    $("#tutorialArea").css('padding-right', '');
                    $("#expBarArea").show();
                    $(".questsWindowButton").show();
                    $("#questsWindowButtonGlow").show();
                    document.getElementById("tutorialDescription").innerHTML = this.tutorialDescriptions[this.currentTutorial];
                    break;
                case 7://
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").show();
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '137px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('left', '');
                    $("#tutorialArea").css('right', '50px');
                    $("#tutorialArea").css('top', '');
                    $("#tutorialArea").css('bottom', '5px');
                    $("#tutorialArea").css('margin', '');
                    $("#tutorialArea").css('padding-right', '');
                    $("#tutorialArea").css('padding-bottom', '');
                    $("#expBarArea").show();
                    $(".questsWindowButton").show();
                    $("#questsWindowButtonGlow").show();
                    $(".inventoryWindowButton").show();
                    document.getElementById("tutorialDescription").innerHTML = this.tutorialDescriptions[this.currentTutorial];
                    break;
                case 8://
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '0px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('left', '');
                    $("#tutorialArea").css('right', '50px');
                    $("#tutorialArea").css('top', '5px');
                    $("#tutorialArea").css('bottom', '');
                    $("#tutorialArea").css('margin', '');
                    $("#tutorialArea").css('padding-right', '');
                    $("#tutorialArea").css('padding-bottom', '');
                    $("#expBarArea").show();
                    $(".questsWindowButton").show();
                    $("#questsWindowButtonGlow").show();
                    $(".inventoryWindowButton").show();
                    $(".characterWindowButton").show();
                    document.getElementById("tutorialDescription").innerHTML = this.tutorialDescriptions[this.currentTutorial];
                    break;
                case 9:
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '38px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('left', '');
                    $("#tutorialArea").css('right', '50px');
                    $("#tutorialArea").css('top', '5px');
                    $("#tutorialArea").css('bottom', '');
                    $("#tutorialArea").css('margin', '');
                    $("#tutorialArea").css('padding-right', '');
                    $("#tutorialArea").css('padding-bottom', '');
                    $("#expBarArea").show();
                    $(".questsWindowButton").show();
                    $("#questsWindowButtonGlow").show();
                    $(".inventoryWindowButton").show();
                    $(".characterWindowButton").show();
                    $(".mercenariesWindowButton").show();
                    document.getElementById("tutorialDescription").innerHTML = this.tutorialDescriptions[this.currentTutorial];
                    break;
                case 10:
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialRightArrow").css('left', '290px');
                    $("#tutorialRightArrow").css('top', '67px');
                    this.animateRightArrow();
                    $("#tutorialArea").css('left', '');
                    $("#tutorialArea").css('right', '50px');
                    $("#tutorialArea").css('top', '14px');
                    $("#tutorialArea").css('bottom', '');
                    $("#tutorialArea").css('margin', '');
                    $("#tutorialArea").css('padding-right', '');
                    $("#tutorialArea").css('padding-bottom', '');
                    $("#expBarArea").show();
                    $(".questsWindowButton").show();
                    $("#questsWindowButtonGlow").show();
                    $(".inventoryWindowButton").show();
                    $(".characterWindowButton").show();
                    $(".mercenariesWindowButton").show();
                    $(".upgradesWindowButton").show();
                    $("#upgradesWindowButtonGlow").show();
                    document.getElementById("tutorialDescription").innerHTML = this.tutorialDescriptions[this.currentTutorial];
                    break;
                case 11:
                    $("#tutorialRightArrow").stop(true);
                    $("#tutorialArea").hide();
                    $("#expBarArea").show();
                    $(".questsWindowButton").show();
                    $("#questsWindowButtonGlow").show();
                    $(".inventoryWindowButton").show();
                    $(".characterWindowButton").show();
                    $(".mercenariesWindowButton").show();
                    $(".upgradesWindowButton").show();
                    $("#upgradesWindowButtonGlow").show();
                    break;
            }
        }
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                       STATS                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
function Stats() {
    this.getGold = function getGold() { return game.player.gold; }
    this.goldEarned = 0;
    this.startDate = new Date();
    this.getMercenariesOwned = function getMercenariesOwned() { return game.mercenaryManager.mercenaries.length; }
    this.getGps = function getGps() { return game.mercenaryManager.getGps(); }
    this.goldFromMonsters = 0;
    this.goldFromMercenaries = 0;
    this.goldFromQuests = 0;
    this.getUpgradesUnlocked = function getUpgradesUnlocked() { return game.upgradeManager.upgradesPurchased; }
    this.getExperience = function getExperience() { return game.player.experience; }
    this.experienceEarned = 0;
    this.experienceFromMonsters = 0;
    this.experienceFromQuests = 0;
    this.itemsLooted = 0;
    this.itemsSold = 0;
    this.goldFromItems = 0;
    this.questsCompleted = 0;
    this.monstersKilled = 0;
    this.damageDealt = 0;
    this.damageTaken = 0;

    this.update = function update() {
        // Update the stats window
        document.getElementById("statsWindowPowerShardsValue").innerHTML = game.player.powerShards.formatMoney(2);
        document.getElementById("statsWindowGoldValue").innerHTML = this.getGold().formatMoney(2);
        document.getElementById("statsWindowGoldEarnedValue").innerHTML = this.goldEarned.formatMoney(2);
        document.getElementById("statsWindowStartDateValue").innerHTML = this.startDate.toDateString() + " " + this.startDate.toLocaleTimeString();
        document.getElementById("statsWindowMercenariesOwnedValue").innerHTML = this.getMercenariesOwned().formatMoney(0);
        document.getElementById("statsWindowGpsValue").innerHTML = this.getGps();
        document.getElementById("statsWindowGoldFromMonstersValue").innerHTML = this.goldFromMonsters.formatMoney(2);
        document.getElementById("statsWindowGoldFromMercenariesValue").innerHTML = this.goldFromMercenaries.formatMoney(2);
        document.getElementById("statsWindowGoldFromQuestsValue").innerHTML = this.goldFromQuests.formatMoney(0);
        document.getElementById("statsWindowUpgradesUnlockedValue").innerHTML = this.getUpgradesUnlocked().formatMoney(0);
        document.getElementById("statsWindowExperienceValue").innerHTML = this.getExperience().formatMoney(2);
        document.getElementById("statsWindowExperienceEarnedValue").innerHTML = this.experienceEarned.formatMoney(2);
        document.getElementById("statsWindowExperienceFromMonstersValue").innerHTML = this.experienceFromMonsters.formatMoney(2);
        document.getElementById("statsWindowExperienceFromQuestsValue").innerHTML = this.experienceFromQuests.formatMoney(0);
        document.getElementById("statsWindowItemsLootedValue").innerHTML = this.itemsLooted.formatMoney(0);
        document.getElementById("statsWindowItemsSoldValue").innerHTML = this.itemsSold.formatMoney(0);
        document.getElementById("statsWindowGoldFromItemsValue").innerHTML = this.goldFromItems.formatMoney(0);
        document.getElementById("statsWindowQuestsCompletedValue").innerHTML = this.questsCompleted.formatMoney(0);
        document.getElementById("statsWindowMonstersKilledValue").innerHTML = this.monstersKilled.formatMoney(0);
        document.getElementById("statsWindowDamageDealtValue").innerHTML = (Math.floor(this.damageDealt)).formatMoney(0);
        document.getElementById("statsWindowDamageTakenValue").innerHTML = (Math.floor(this.damageTaken)).formatMoney(0);
    }

    this.save = function save() {
        localStorage.StatsSaved = true;
        localStorage.statsGoldEarned = this.goldEarned;
        localStorage.statsStartDate = this.startDate;
        localStorage.statsGoldFromMonsters = this.goldFromMonsters;
        localStorage.statsGoldFromMercenaries = this.goldFromMercenaries;
        localStorage.statsGoldFromQuests = this.goldFromQuests;
        localStorage.statsExperienceEarned = this.experienceEarned;
        localStorage.statsExperienceFromMonsters = this.experienceFromMonsters;
        localStorage.statsExperienceFromQuests = this.experienceFromQuests;
        localStorage.statsItemsLooted = this.itemsLooted;
        localStorage.statsItemsSold = this.itemsSold;
        localStorage.statsGoldFromItems = this.goldFromItems;
        localStorage.statsQuestsCompleted = this.questsCompleted;
        localStorage.statsMonstersKilled = this.monstersKilled;
        localStorage.statsDamageDealt = this.damageDealt;
        localStorage.statsDamageTaken = this.damageTaken;
    }

    this.load = function load() {
        if (localStorage.StatsSaved != null) {
            this.goldEarned = parseFloat(localStorage.statsGoldEarned);
            this.startDate = new Date(localStorage.statsStartDate);
            this.goldFromMonsters = parseFloat(localStorage.statsGoldFromMonsters);
            this.goldFromMercenaries = parseFloat(localStorage.statsGoldFromMercenaries);
            this.goldFromQuests = parseInt(localStorage.statsGoldFromQuests);
            this.experienceEarned = parseFloat(localStorage.statsExperienceEarned);
            this.experienceFromMonsters = parseFloat(localStorage.statsExperienceFromMonsters);
            this.experienceFromQuests = parseInt(localStorage.statsExperienceFromQuests);
            this.itemsLooted = parseInt(localStorage.statsItemsLooted);
            this.itemsSold = parseInt(localStorage.statsItemsSold);
            this.goldFromItems = parseInt(localStorage.statsGoldFromItems);
            this.questsCompleted = parseInt(localStorage.statsQuestsCompleted);
            this.monstersKilled = parseInt(localStorage.statsMonstersKilled);
            this.damageDealt = parseFloat(localStorage.statsDamageDealt);
            this.damageTaken = parseFloat(localStorage.statsDamageTaken);
        }
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                      MONSTER                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
MonsterRarity = new Object();
MonsterRarity.COMMON = "COMMON";
MonsterRarity.RARE = "RARE";
MonsterRarity.ELITE = "ELITE";
MonsterRarity.BOSS = "BOSS";

function Monster(name, level, rarity, health, damage, armour, goldWorth, experienceWorth) {
    this.name = name;
    this.level = level;
    this.rarity = rarity;
    this.health = health;
    this.maxHealth = health;
    this.canAttack = true;
    this.damage = damage;
    this.armour = armour;
    this.goldWorth = goldWorth;
    this.experienceWorth = experienceWorth;

    this.debuffs = new DebuffManager();
    this.debuffIconLeftPositionBase = 325;
    this.debuffIconTopPosition = 0;
    this.debuffLeftPositionIncrement = 30;

    this.lastDamageTaken = 0;
    this.alive = true;

    this.getRandomLoot = function getRandomLoot() {
        var loot = new Loot();
        loot.gold = this.goldWorth;
        loot.item = game.itemCreator.createRandomItem(this.level, game.itemCreator.getRandomItemRarity(this.rarity));
        return loot;
    }

    this.takeDamage = function takeDamage(damage, isCritical, displayParticle) {
        this.health -= damage;
        this.lastDamageTaken = damage;
        game.stats.damageDealt += damage;

        // Create the player's damage particle
        if (displayParticle) {
            if (isCritical) {
                game.particleManager.createParticle(Math.round(this.lastDamageTaken), ParticleType.PLAYER_CRITICAL);
            }
            else {
                game.particleManager.createParticle(Math.round(this.lastDamageTaken), ParticleType.PLAYER_DAMAGE);
            }
        }

        if (this.health <= 0) {
            this.alive = false;
            game.stats.monstersKilled++;
            // Update the 2nd tutorial
            game.tutorialManager.monsterKilled = true;
        }
    }

    // Add a debuff to this monster of the specified type, damage and duration
    this.addDebuff = function addDebuff(type, damage, duration) {
        switch (type) {
            case DebuffType.BLEED:
                // If the monster is not currently bleeding then show the bleeding icon
                if (this.debuffs.bleeding == false) {
                    $("#monsterBleedingIcon").show();

                    // Calculate the position of the icon depending on how many debuffs the monster has
                    var left = this.debuffIconLeftPositionBase;
                    if (this.debuffs.burning) { left += this.debuffLeftPositionIncrement; }
                    if (this.debuffs.chilled) { left += this.debuffLeftPositionIncrement; }

                    // Set the position
                    $("#monsterBleedingIcon").css('left', left + 'px');
                }
                // Check to see if the player has any Rupture effects
                var effects = game.player.getEffectsOfType(EffectType.RUPTURE);
                var maxStacks = 5;
                if (effects.length > 0) {
                    for (var x = 0; x < effects.length; x++) {
                        maxStacks += effects[x].value;
                    }
                }
                this.debuffs.bleeding = true;
                this.debuffs.bleedDamage = damage;
                this.debuffs.bleedDuration = 0;
                this.debuffs.bleedMaxDuration = duration;
                this.debuffs.bleedStacks += effects.length + 1
                if (this.debuffs.bleedStacks > maxStacks) { this.debuffs.bleedStacks = maxStacks; }
                document.getElementById("monsterBleedingStacks").innerHTML = this.debuffs.bleedStacks;
                break;
            case DebuffType.BURN:
                // If the monster is not currently burning then show the burning icon
                if (this.debuffs.burning == false) {
                    $("#monsterBurningIcon").show();

                    // Calculate the position of the icon depending on how many debuffs the monster has
                    var left = this.debuffIconLeftPositionBase;
                    if (this.debuffs.bleeding) { left += this.debuffLeftPositionIncrement; }
                    if (this.debuffs.chilled) { left += this.debuffLeftPositionIncrement; }

                    // Set the position
                    $("#monsterBurningIcon").css('left', left + 'px');
                }
                this.debuffs.burning = true;
                this.debuffs.burningDamage = damage;
                this.debuffs.burningDuration = 0;
                this.debuffs.burningMaxDuration = duration;
                // Check to see if the player has any Combustion effects allowing them to stack burning
                var effects = game.player.getEffectsOfType(EffectType.COMBUSTION);
                var maxStacks = 0;
                if (effects.length > 0) {
                    for (var x = 0; x < effects.length; x++) {
                        maxStacks += effects[x].value;
                    }
                }
                // Add a stack if possible
                if (maxStacks > this.debuffs.burningStacks) {
                    this.debuffs.burningStacks++;
                }
                if (this.debuffs.burningStacks == 0) { this.debuffs.burningStacks = 1; }
                document.getElementById("monsterBurningStacks").innerHTML = this.debuffs.burningStacks;
                break;
            case DebuffType.CHILL:
                // If the monster is not currently chilled then show the chilled icon
                if (this.debuffs.chilled == false) {
                    $("#monsterChilledIcon").show();

                    // Calculate the position of the icon depending on how many debuffs the monster has
                    var left = this.debuffIconLeftPositionBase;
                    if (this.debuffs.bleeding) { left += this.debuffLeftPositionIncrement; }
                    if (this.debuffs.burning) { left += this.debuffLeftPositionIncrement; }

                    // Set the position
                    $("#monsterChilledIcon").css('left', left + 'px');
                }
                this.debuffs.chilled = true;
                this.debuffs.chillDuration = 0;
                this.debuffs.chillMaxDuration = duration;
                break;
        }
    }

    // Update all the debuffs on this monster
    this.updateDebuffs = function updateDebuffs() {
        // Update all the debuffs on this monster
        // If there are bleed stacks on this monster
        if (this.debuffs.bleeding) {
            // Cause the monster to take damage
            this.takeDamage(this.debuffs.bleedDamage * this.debuffs.bleedStacks, false, false);
            // Increase the duration of this debuff
            this.debuffs.bleedDuration++;
            // If the debuff has expired then remove it
            if (this.debuffs.bleedDuration >= this.debuffs.bleedMaxDuration) {
                // Hide the icon and decrease the left position of the other icons
                $("#monsterBleedingIcon").hide();
                $("#monsterBurningIcon").css('left', ($("#monsterBurningIcon").position().left - this.debuffLeftPositionIncrement) + 'px');
                $("#monsterChilledIcon").css('left', ($("#monsterChilledIcon").position().left - this.debuffLeftPositionIncrement) + 'px');

                this.debuffs.bleeding = false;
                this.debuffs.bleedDamage = 0;
                this.debuffs.bleedDuration = 0;
                this.debuffs.bleedMaxDuration = 0;
                this.debuffs.bleedStacks = 0;
            }
        }

        // If this monster is burning
        if (this.debuffs.burning) {
            this.takeDamage(this.debuffs.burningDamage * this.debuffs.burningStacks, false, false);
            // Increase the duration of this debuff
            this.debuffs.burningDuration++;
            // If the debuff has expired then remove it
            if (this.debuffs.burningDuration >= this.debuffs.burningMaxDuration) {
                $("#monsterBurningIcon").hide();
                $("#monsterBleedingIcon").css('left', ($("#monsterBleedingIcon").position().left - this.debuffLeftPositionIncrement) + 'px');
                $("#monsterChilledIcon").css('left', ($("#monsterChilledIcon").position().left - this.debuffLeftPositionIncrement) + 'px');

                this.debuffs.burningStacks = 0;
                this.debuffs.burningDamage = 0;
                this.debuffs.burningDuration = 0;
                this.debuffs.burningMaxDuration = 0;
                this.debuffs.burning = false;
            }
        }

        // If this monster is chilled
        if (this.debuffs.chilled) {
            // If the chill duration is even then the monster can't attack this turn
            if (this.canAttack) {
                this.canAttack = false;
            }
            else { this.canAttack = true; }
            // Increase the duration of this debuff
            this.debuffs.chillDuration++;
            // If the debuff has expired then remove it
            if (this.debuffs.chillDuration >= this.debuffs.chillMaxDuration) {
                // Hide the icon and decrease the left position of the other icons
                $("#monsterChilledIcon").hide();
                $("#monsterBleedingIcon").css('left', ($("#monsterBleedingIcon").position().left - this.debuffLeftPositionIncrement) + 'px');
                $("#monsterBurningIcon").css('left', ($("#monsterBurningIcon").position().left - this.debuffLeftPositionIncrement) + 'px');

                this.debuffs.chillDuration = 0;
                this.debuffs.chillMaxDuration = 0;
                this.debuffs.chilled = false;
            }
        }
        // If the monster is not chilled then it can attack
        else { this.canAttack = true; }
    }
}

function Loot(gold, item) {
    this.gold = gold;
    this.item = item;
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                 MONSTER CREATOR                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
function MonsterCreator() {
    this.names = ["Zombie", "Skeleton", "Goblin", "Spider", "Troll", "Lizardman", "Ogre", "Orc"];
    this.monsterBaseHealth = 5;
    this.monsterBaseDamage = 0;
    this.monsterBaseGoldWorth = 1;
    this.monsterBaseExperienceWorth = 1;

    // Create a random monster of a specified level and rarity
    this.createRandomMonster = function createRandomMonster(level, rarity) {
        var name = this.names[Math.floor(Math.random() * this.names.length)];
        var health = this.calculateMonsterHealth(level, rarity);
        var damage = this.calculateMonsterDamage(level, rarity);
        var goldWorth = this.calculateMonsterGoldWorth(level, rarity);
        var experienceWorth = this.calculateMonsterExperienceWorth(level, rarity);

        return new Monster(name, level, rarity, health, damage, 0, goldWorth, experienceWorth);
    }

    // Calculate how much health a monster would have of a certain level and rarity
    this.calculateMonsterHealth = function calculateMonsterHealth(level, rarity) {
        var health = Sigma(level) * Math.pow(1.05, level) + this.monsterBaseHealth;
        health = Math.ceil(health);
        switch (rarity) {
            case "COMMON":
                break;
            case "RARE":
                health *= 3;
                break;
            case "ELITE":
                health *= 10;
                break;
            case "BOSS":
                health *= 30;
                break;
        }
        return health;
    }

    // Calculate how much damage a monster would have of a certain level and rarity
    this.calculateMonsterDamage = function calculateMonsterDamage(level, rarity) {
        var damage = (Sigma(level) * Math.pow(1.01, level)) / 3 + this.monsterBaseDamage;
        damage = Math.ceil(damage);
        switch (rarity) {
            case "COMMON":
                break;
            case "RARE":
                damage *= 2;
                break;
            case "ELITE":
                damage *= 4;
                break;
            case "BOSS":
                damage *= 8;
                break;
        }
        return damage;
    }

    // Calculate how much gold a monster would give of a certain level and rarity
    this.calculateMonsterGoldWorth = function calculateMonsterGoldWorth(level, rarity) {
        var goldWorth = (Sigma(level) * Math.pow(1.01, level)) / 4 + this.monsterBaseGoldWorth;
        goldWorth = Math.ceil(goldWorth);
        switch (rarity) {
            case "COMMON":
                break;
            case "RARE":
                goldWorth *= 1.5;
                break;
            case "ELITE":
                goldWorth *= 3;
                break;
            case "BOSS":
                goldWorth *= 6;
                break;
        }
        return goldWorth;
    }

    // Calculate how much experience a monster would give of a certain level and rarity
    this.calculateMonsterExperienceWorth = function calculateMonsterExperienceWorth(level, rarity) {
        var experienceWorth = (Sigma(level) * Math.pow(1.01, level)) / 5 + this.monsterBaseExperienceWorth;
        experienceWorth = Math.ceil(experienceWorth);
        switch (rarity) {
            case "COMMON":
                break;
            case "RARE":
                experienceWorth *= 1.5;
                break;
            case "ELITE":
                experienceWorth *= 3;
                break;
            case "BOSS":
                experienceWorth *= 6;
                break;
        }
        return experienceWorth;
    }

    // Calculate the rarity of a monster on a certain battle level at a certain battle depth
    this.calculateMonsterRarity = function calculateMonsterRarity(battleLevel, battleDepth) {
        // Calculate the chances for each monster rarity other than normal
        var rareChance = 0.001 + (battleLevel / 500);
        if (rareChance > 0.1) { rareChance = 0.1; }
        var eliteChance = 0;
        if (battleLevel >= 10) {
            eliteChance = 0.03 + (battleLevel / 12000);
            if (eliteChance > 0.05) { eliteChance = 0.05; }
        }
        var bossChance = 0;
        if (battleLevel >= 30) {
            bossChance = 0.03 + (battleLevel / 24000);
            if (bossChance > 0.01) { bossChance = 0.01; }
        }
        rareChance += eliteChance + bossChance;
        eliteChance += bossChance;

        // Choose the rarity randomly and return it
        var rand = Math.random();
        if (rand <= bossChance) {
            return MonsterRarity.BOSS;
        }
        else if (rand <= eliteChance) {
            return MonsterRarity.ELITE;
        }
        else if (rand <= rareChance) {
            return MonsterRarity.RARE;
        }
        else return MonsterRarity.COMMON;
    }

    // Get the name colour of a rarity
    this.getRarityColour = function getRarityColour(rarity) {
        switch (rarity) {
            case MonsterRarity.COMMON: return '#ffffff'; break;
            case MonsterRarity.RARE: return '#00fff0'; break;
            case MonsterRarity.ELITE: return '#ffd800'; break;
            case MonsterRarity.BOSS: return '#ff0000'; break;
        }
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                      OPTIONS                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
function Options() {
    this.displaySkullParticles = true;
    this.displayGoldParticles = true;
    this.displayExpParticles = true;
    this.displayPlayerDamageParticles = true;
    this.displayMonsterDamageParticles = true;

    this.alwaysDisplayPlayerHealth = false;
    this.alwaysDisplayMonsterHealth = false;
    this.alwaysDisplayExp = false;

    this.save = function save() {
        localStorage.optionsSaved = true;
        localStorage.displaySkullParticles = this.displaySkullParticles;
        localStorage.displayGoldParticles = this.displayGoldParticles;
        localStorage.displayExpParticles = this.displayExpParticles;
        localStorage.displayPlayerDamageParticles = this.displayPlayerDamageParticles;
        localStorage.displayMonsterDamageParticles = this.displayMonsterDamageParticles;

        localStorage.alwaysDisplayPlayerHealth = this.alwaysDisplayPlayerHealth;
        localStorage.alwaysDisplayMonsterHealth = this.alwaysDisplayMonsterHealth;
        localStorage.alwaysDisplayExp = this.alwaysDisplayExp;
    }

    this.load = function load() {
        if (localStorage.optionsSaved != null) {
            this.displaySkullParticles = JSON.parse(localStorage.displaySkullParticles);
            this.displayGoldParticles = JSON.parse(localStorage.displayGoldParticles);
            this.displayExpParticles = JSON.parse(localStorage.displayExpParticles);
            this.displayPlayerDamageParticles = JSON.parse(localStorage.displayPlayerDamageParticles);
            this.displayMonsterDamageParticles = JSON.parse(localStorage.displayMonsterDamageParticles);

            this.alwaysDisplayPlayerHealth = JSON.parse(localStorage.alwaysDisplayPlayerHealth);
            this.alwaysDisplayMonsterHealth = JSON.parse(localStorage.alwaysDisplayMonsterHealth);
            this.alwaysDisplayExp = JSON.parse(localStorage.alwaysDisplayExp);

            if (!this.displaySkullParticles) { document.getElementById("skullParticlesOption").innerHTML = "Monster death particles: OFF"; }
            if (!this.displayGoldParticles) { document.getElementById("goldParticlesOption").innerHTML = "Gold particles: OFF"; }
            if (!this.displayExpParticles) { document.getElementById("experienceParticlesOption").innerHTML = "Experience particles: OFF"; }
            if (!this.displayPlayerDamageParticles) { document.getElementById("playerDamageParticlesOption").innerHTML = "Player damage particles: OFF"; }
            if (!this.displayMonsterDamageParticles) { document.getElementById("monsterDamageParticlesOption").innerHTML = "Monster damage particles: OFF"; }

            if (this.alwaysDisplayPlayerHealth) {
                document.getElementById("playerHealthOption").innerHTML = "Always display player health: ON";
                $("#playerHealthBarText").show();
            }
            if (this.alwaysDisplayMonsterHealth) {
                document.getElementById("monsterHealthOption").innerHTML = "Always display monster health: ON";
                game.displayMonsterHealth = true;
            }
            if (this.alwaysDisplayExp) {
                document.getElementById("expBarOption").innerHTML = "Always display experience: ON";
                $("#expBarText").show();
            }
        }
    }
}

function skullParticlesOptionClick() {
    game.options.displaySkullParticles = !game.options.displaySkullParticles;
    if (game.options.displaySkullParticles) {
        document.getElementById("skullParticlesOption").innerHTML = "Monster death particles: ON";
    }
    else { document.getElementById("skullParticlesOption").innerHTML = "Monster death particles: OFF"; }
}
function goldParticlesOptionClick() {
    game.options.displayGoldParticles = !game.options.displayGoldParticles;
    if (game.options.displayGoldParticles) {
        document.getElementById("goldParticlesOption").innerHTML = "Gold particles: ON";
    }
    else { document.getElementById("goldParticlesOption").innerHTML = "Gold particles: OFF"; }
}
function experienceParticlesOptionClick() {
    game.options.displayExpParticles = !game.options.displayExpParticles;
    if (game.options.displayExpParticles) {
        document.getElementById("experienceParticlesOption").innerHTML = "Experience particles: ON";
    }
    else { document.getElementById("experienceParticlesOption").innerHTML = "Experience particles: OFF"; }
}
function playerDamageParticlesOptionClick() {
    game.options.displayPlayerDamageParticles = !game.options.displayPlayerDamageParticles;
    if (game.options.displayPlayerDamageParticles) {
        document.getElementById("playerDamageParticlesOption").innerHTML = "Player damage particles: ON";
    }
    else { document.getElementById("playerDamageParticlesOption").innerHTML = "Player damage particles: OFF"; }
}
function monsterDamageParticlesOptionClick() {
    game.options.displayMonsterDamageParticles = !game.options.displayMonsterDamageParticles;
    if (game.options.displayMonsterDamageParticles) {
        document.getElementById("monsterDamageParticlesOption").innerHTML = "Monster damage particles: ON";
    }
    else { document.getElementById("monsterDamageParticlesOption").innerHTML = "Monster damage particles: OFF"; }
}

function playerHealthOptionClick() {
    game.options.alwaysDisplayPlayerHealth = !game.options.alwaysDisplayPlayerHealth;
    if (game.options.alwaysDisplayPlayerHealth) {
        document.getElementById("playerHealthOption").innerHTML = "Always display player health: ON";
        $("#playerHealthBarText").show();
    }
    else { 
        document.getElementById("playerHealthOption").innerHTML = "Always display player health: OFF"; 
        $("#playerHealthBarText").hide();
    }
}
function monsterHealthOptionClick() {
    game.options.alwaysDisplayMonsterHealth = !game.options.alwaysDisplayMonsterHealth;
    if (game.options.alwaysDisplayMonsterHealth) {
        document.getElementById("monsterHealthOption").innerHTML = "Always display monster health: ON";
        game.displayMonsterHealth = true;
    }
    else { 
        document.getElementById("monsterHealthOption").innerHTML = "Always display monster health: OFF"; 
        game.displayMonsterHealth = false;
    }
}
function expBarOptionClick() {
    game.options.alwaysDisplayExp = !game.options.alwaysDisplayExp;
    if (game.options.alwaysDisplayExp) {
        document.getElementById("expBarOption").innerHTML = "Always display experience: ON";
        $("#expBarText").show();
    }
    else { 
        document.getElementById("expBarOption").innerHTML = "Always display experience: OFF"; 
        $("#expBarText").hide();
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                PARTICLE MANAGER                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
var ParticleType = new Object();
ParticleType.SKULL = "SKULL";
ParticleType.GOLD = "GOLD";
ParticleType.EXP_ORB = "EXP_ORB";
ParticleType.PLAYER_DAMAGE = "PLAYER_DAMAGE";
ParticleType.PLAYER_CRITICAL = "PLAYER_CRITICAL";
ParticleType.MONSTER_DAMAGE = "MONSTER_DAMAGE";

// duration in ms
function Particle(image, text, textColour, x, y, width, height, velocityX, velocityY, duration) {
    this.image = image;
    this.text = text;
    this.textColour = textColour;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.duration = duration;
    this.maxDuration = duration;

    this.update = function update(ms) {
        this.duration -= ms;
        var velX = (this.velocityX * (ms / 1000));
        var velY = (this.velocityY * (ms / 1000));
        this.x += velX;
        this.y += velY;
    }

    this.draw = function draw() {
        var canvas = document.getElementById("particleCanvas");
        var context = canvas.getContext("2d");
        if (this.duration <= this.maxDuration / 5) {
            var newAlpha = this.duration / (this.maxDuration / 5);
            if (newAlpha < 0) { newAlpha = 0; }
            context.globalAlpha = newAlpha;
        }
        if (this.image != null) {
            context.drawImage(this.image, this.x, this.y, 25, 25);
        }
        if (this.text != null) {
            context.shadowColor = "black";
            context.lineWidth = 3;
            context.strokeText(this.text, this.x + 12, this.y + 19);
            context.fillStyle = this.textColour;
            context.fillText(this.text, this.x + 12, this.y + 19);
        }
        context.globalAlpha = 1;
    }

    this.expired = function expired() {
        return this.duration <= 0;
    }
}

function ParticleManager() {
    this.maxParticles = 50;
    this.particles = new Array();
    this.particleSources = new Object();
    this.particleSources.SKULL = "includes/images/skull.png";
    this.particleSources.GOLD = "includes/images/goldCoin.png";
    this.particleSources.EXP_ORB = "includes/images/expOrb.png";
    this.particleSources.PLAYER_DAMAGE = "includes/images/sword.png";
    this.particleSources.PLAYER_CRITICAL = "includes/images/sword.png";

    this.initialize = function initialize() {
        var canvas = document.getElementById("particleCanvas");
        var context = canvas.getContext("2d");
        context.font = "20px Gentium Book Basic";
        context.textAlign = 'center';
    }

    this.createParticle = function createParticle(text, imageType) {
        // If the type should not be displayed, end this function
        switch (imageType) {
            case ParticleType.SKULL: if (game.options.displaySkullParticles == false) { return; } break;
            case ParticleType.GOLD: if (game.options.displayGoldParticles == false) { return; } break;
            case ParticleType.EXP_ORB: if (game.options.displayExpParticles == false) { return; } break;
            case ParticleType.PLAYER_DAMAGE: if (game.options.displayPlayerDamageParticles == false) { return; } break;
            case ParticleType.PLAYER_CRITICAL: if (game.options.displayPlayerDamageParticles == false) { return; } break;
            case ParticleType.MONSTER_DAMAGE: if (game.options.displayMonsterDamageParticles == false) { return; } break;
        }

        // Calculate the left and top positions
        var left = Math.random() * 325 + 175;
        var top = Math.random() * 425 + 100;
        var textColour;
        var source = null;

        // Set the text colour and image source
        switch (imageType) {
            case ParticleType.SKULL: source = this.particleSources.SKULL; break;
            case ParticleType.GOLD: textColour = '#fcd200'; source = this.particleSources.GOLD; break;
            case ParticleType.EXP_ORB: textColour = '#00ff00'; source = this.particleSources.EXP_ORB; break;
            case ParticleType.PLAYER_DAMAGE: textColour = '#ffffff'; source = this.particleSources.PLAYER_DAMAGE; break;
            case ParticleType.PLAYER_CRITICAL: textColour = '#fcff00'; source = this.particleSources.PLAYER_CRITICAL; break;
            case ParticleType.MONSTER_DAMAGE: textColour = '#ff0000'; source = this.particleSources.MONSTER_DAMAGE; break;
        }

        // If there is text; create it
        var finalText = null;
        if (text != null) {
            // Calcuate the final text and set it
            finalText = '';
            if (imageType == ParticleType.GOLD || imageType == ParticleType.EXP_ORB) {
                finalText += '+';
            }
            else if (imageType == ParticleType.MONSTER_DAMAGE) {
                finalText += '-';
            }
            finalText += text;

            // If this was a player critical add an exclamation on the end
            if (imageType == ParticleType.PLAYER_CRITICAL) {
                finalText += '!';
            }
        }

        // If there is an image; create one
        var image = null;
        if (source != null) {
            var image = new Image();
            image.src = source;
        }

        var canvas = document.getElementById("particleCanvas");
        var context = canvas.getContext("2d");

        var particle = new Particle(image, finalText, textColour, left, top, 25, 25, 0, -50, 2000);
        this.particles.push(particle);
        // If the maximum amount of particles has been exceeded, remove the first particle
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, 1);
        }
    }

    this.update = function update(ms) {
        var canvas = document.getElementById("particleCanvas");
        var context = canvas.getContext("2d");
        var image;
        var p;
        context.clearRect(0, 0, 675, 550);
        for (var x = this.particles.length - 1; x >= 0; x--) {
            p = this.particles[x];
            p.update(ms);
            p.draw();
            if (p.expired()) {
                this.particles.splice(x, 1);
            }
        }
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                       ITEM                                                      
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
var Prefixes = new Array("DAMAGE", "HEALTH", "ARMOUR", "CRIT_CHANCE", "ITEM_RARITY", "GOLD_GAIN");
var PREFIX_AMOUNT = 6;
var Suffixes = new Array("STRENGTH", "AGILITY", "STAMINA", "HP5", "CRIT_DAMAGE", "EXPERIENCE_GAIN", "EVASION");
var SUFFIX_AMOUNT = 7;

var DamageNames = new Array("Heavy", "Honed", "Fine", "Tempered", "Annealed", "Burnished", "Polished", "Shiny", "Glinting", "Shimmering",
"Sparkling", "Gleaming", "Dazzling", "Glistening", "Flaring", "Luminous", "Glowing", "Brilliant", "Radiant", "Glorious");
var HealthNames = new Array("Healthy", "Lively", "Athletic", "Brisk", "Tough", "Fecund", "Bracing", "Uplifting", "Stimulating", "Invigorating",
"Exhilarating", "Virile", "Stout", "Stalwart", "Sanguine", "Robust", "Rotund", "Spirited", "Potent", "Vigorous");
var ArmourNames = new Array("Lacquered", "Studded", "Ribbed", "Fortified", "Plated", "Carapaced", "Reinforced", "Strengthened", "Backed",
"Banded", "Bolstered", "Braced", "Thickened", "Spiked", "Barbed", "Layered", "Scaled", "Tightened", "Chained", "Supported");
var CritChanceNames = new Array("Dark", "Shadow", "Wilderness", "Night", "Bloodthirsty", "Black", "Cloudy", "Dim", "Grim", "Savage", "Deadly",
"Sharpened", "Razor Sharp", "Pincer", "Bloody", "Cruel", "Dangerous", "Fatal", "Harmful", "Lethal");
var ItemRarityNames = new Array("Bandit's", "Pillager's", "Thug's", "Magpie's", "Pirate's", "Captain's", "Raider's", "Corsair's", "Filibuster's",
"Freebooter's", "Marauder's", "Privateer's", "Rover's", "Criminal's", "Hooligan's", "Mobster's", "Outlaw's", "Robber's", "Crook's",
"Forager's");
var GoldGainNames = new Array("King's", "Queen's", "Prince's", "Emperor's", "Monarch's", "Sultan's", "Baron's", "Caeser's", "Caliph's",
"Czar's", "Kaiser's", "Khan's", "Magnate's", "Overlord's", "Lord's", "Ruler's", "Leader's", "Sovereign's", "Tycoon's", "Duke's");

var StrengthNames = new Array("of the Hippo", "of the Seal", "of the Bear", "of the Lion", "of the Gorrilla", "of the Goliath",
"of the Leviathan", "of the Titan", "of the Shark", "of the Yeti", "of the Tiger", "of the Elephant", "of the Beetle", "of the Ancient",
"of the Strong", "of the Rhino", "of the Whale", "of the Crocodile", "of the Aligator", "of the Tortoise");
var AgilityNames = new Array("of the Mongoose", "of the Lynx", "of the Fox", "of the Falcon", "of the Panther", "of the Leopard",
"of the Jaguar", "of the Phantasm", "of the Cougar", "of the Owl", "of the Eagle", "of the Cheetah", "of the Antelope", "of the Greyhound",
"of the Wolf", "of the Kangaroo", "of the Horse", "of the Coyote", "of the Zebra", "of the Hyena");
var StaminaNames = new Array("of the Guardian", "of the Protector", "of the Defender", "of the Keeper", "of the Overseer", "of the Paladin",
"of the Preserver", "of the Sentinel", "of the Warden", "of the Crusader", "of the Patron", "of the Savior", "of the Liberator",
"of the Zealot", "of the Safeguard", "of the Monk", "of the Vigilante", "of the Bodyguard", "of the Hero", "of the Supporter");
var Hp5Names = new Array("of Regeneration", "of Restoration", "of Healing", "of Rebirth", "of Resurrection", "of Reclamation", "of Growth",
"of Nourishment", "of Warding", "of Rejuvenation", "of Revitalisation", "of Recovery", "of Renewal", "of Revival", "of Curing",
"of Resurgance", "of Replenishment", "of Holyness", "of Prayer", "of Meditation");
var CritDamageNames = new Array("of the Berserker", "of the Insane", "of the Psychopath", "of the Ravager", "of the Breaker",
"of the Warrior", "of the Warlord", "of the Destructor", "of the Crazy", "of the Mad", "of the Champion", "of the Mercenary",
"of the Militant", "of the Assailent", "of the Gladiator", "of the Assassin", "of the Rogue", "of the Guerilla", "of the Destroyer",
"of the Hunter");
var ExperienceGainNames = new Array("of Wisdom", "of Experience", "of Foresight", "of Intelligence", "of Knowledge", "of Mastery",
"of Evolution", "of Brilliance", "of Perception", "of Senses", "of Understanding", "of Expansion", "of Growth", "of Progression",
"of Transformation", "of Advancement", "of Gain", "of Improvement", "of Success", "of Development");
var EvasionNames = new Array("of Dodging", "of Reflexes", "of Shadows", "of Acrobatics", "of Avoidance", "of Eluding",
"of Swerving", "of Deception", "of Juking", "of Reaction", "of Response", "of Elusion", "of Escape", "of Ducking",
"of Avoiding", "of Swerving", "of Trickery", "of Darkness", "of Blinding", "of Shuffling");
var namesAmount = 20;

var LevelOneNames = new Array("Leather Spaulders", "Leather Tunic", "Leather Trousers", "Wooden Club",
"Leather Gloves", "Leather Boots", "Talisman");

function NameGenerator() {
    var rand;
    // ----- Prefixes -----
    // Damage Bonus
    this.getRandomDamageBonusName = function getRandomDamageBonusName() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return DamageNames[rand];
    }
    // Health
    this.getRandomHealthName = function getRandomHealthName() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return HealthNames[rand];
    }
    // Armour Bonus
    this.getRandomArmourBonusName = function getRandomArmourBonusName() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return ArmourNames[rand];
    }
    // Crit Chance
    this.getRandomCritChanceName = function getRandomCritChanceName() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return CritChanceNames[rand];
    }
    // Item Rarity
    this.getRandomItemRarityName = function getRandomItemRarityName() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return ItemRarityNames[rand];
    }
    // Gold Gain
    this.getRandomGoldGainName = function getRandomGoldGainName() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return GoldGainNames[rand];
    }

    // ----- Suffixes -----
    // Strength
    this.getRandomStrengthName = function getRandomStrengthName() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return StrengthNames[rand];
    }
    // Agility
    this.getRandomAgilityName = function getRandomAgilityName() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return AgilityNames[rand];
    }
    // Stamina
    this.getRandomStaminaName = function getRandomStaminaName() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return StaminaNames[rand];
    }
    // Hp5
    this.getRandomHp5Name = function getRandomHp5Name() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return Hp5Names[rand];
    }
    // Crit Damage
    this.getRandomCritDamageName = function getRandomCritDamageName() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return CritDamageNames[rand];
    }
    // Experience Gain
    this.getRandomExperienceGainName = function getRandomExperienceGainName() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return ExperienceGainNames[rand];
    }
    // Evasion
    this.getRandomEvasionName = function getRandomEvasionName() {
        rand = Math.random() * namesAmount;
        rand = Math.floor(rand);
        return EvasionNames[rand];
    }
}

function StatGenerator() {
    var rand;
    // Random min damage
    this.getRandomMinDamage = function getRandomMinDamage(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return Math.ceil(level * Math.pow(1.001, level)); break;
            case 1: return Math.ceil(((level * Math.pow(1.001, level)) + (level / 10) + 1)); break;
            case 2: return Math.ceil(((level * Math.pow(1.001, level)) + (level / 5) + 2)); break;
        }
    }

    // Random max damage
    this.getRandomMaxDamage = function getRandomMaxDamage(level, minDamage) {
        return (minDamage + this.getRandomDamageBonus(level));
    }

    // Random damage bonus
    this.getRandomDamageBonus = function getRandomDamageBonus(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return Math.ceil((2 * level) * Math.pow(1.001, level) * 0.75); break;
            case 1: return Math.ceil(((2 * level) * Math.pow(1.001, level) * 0.75) + (level / 10) + 1); break;
            case 2: return Math.ceil(((2 * level) * Math.pow(1.001, level) * 0.75) + (level / 5) + 1); break;
        }
    }

    // Random strength bonus
    this.getRandomStrengthBonus = function getRandomStrengthBonus(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return Math.ceil(level * Math.pow(1.001, level) * 0.75); break;
            case 1: return Math.ceil((level * Math.pow(1.001, level) * 0.75) + (level / 10) + 1); break;
            case 2: return Math.ceil((level * Math.pow(1.001, level) * 0.75) + (level / 5) + 1); break;
        }
    }

    // Random agility bonus
    this.getRandomAgilityBonus = function getRandomAgilityBonus(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return Math.ceil(level * Math.pow(1.001, level) * 0.75); break;
            case 1: return Math.ceil((level * Math.pow(1.001, level) * 0.75) + (level / 10) + 1); break;
            case 2: return Math.ceil((level * Math.pow(1.001, level) * 0.75) + (level / 5) + 1); break;
        }
    }

    // Random stamina bonus
    this.getRandomStaminaBonus = function getRandomStaminaBonus(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return Math.ceil(level * Math.pow(1.001, level) * 0.75); break;
            case 1: return Math.ceil((level * Math.pow(1.001, level) * 0.75) + (level / 10) + 1); break;
            case 2: return Math.ceil((level * Math.pow(1.001, level) * 0.75) + (level / 5) + 1); break;
        }
    }

    // Random health bonus
    this.getRandomHealthBonus = function getRandomHealthBonus(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return Math.ceil((10 * level) * Math.pow(1.001, level) * 0.75); break;
            case 1: return Math.ceil(((10 * level) * Math.pow(1.001, level) * 0.75) + (level / 10) + 1); break;
            case 2: return Math.ceil(((10 * level) * Math.pow(1.001, level) * 0.75) + (level / 5) + 1); break;
        }
    }

    // Random hp5 bonus
    this.getRandomHp5Bonus = function getRandomHp5Bonus(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return Math.ceil((2 * level) * Math.pow(1.001, level) * 0.75); break;
            case 1: return Math.ceil(((2 * level) * Math.pow(1.001, level) * 0.75) + (level / 10) + 1); break;
            case 2: return Math.ceil(((2 * level) * Math.pow(1.001, level) * 0.75) + (level / 5) + 1); break;
        }
    }

    // Random base armour
    this.getRandomArmour = function getRandomArmour(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return Math.ceil(level * Math.pow(1.001, level) * 0.75); break;
            case 1: return Math.ceil((level * Math.pow(1.001, level) * 0.75) + (level / 10) + 1); break;
            case 2: return Math.ceil((level * Math.pow(1.001, level) * 0.75) + (level / 5) + 1); break;
        }
    }

    // Random bonus armour
    this.getRandomArmourBonus = function getRandomArmourBonus(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return Math.ceil((level * Math.pow(1.001, level) * 0.75) / 5); break;
            case 1: return Math.ceil(((level * Math.pow(1.001, level) * 0.75) + (level / 10) + 1) / 4); break;
            case 2: return Math.ceil(((level * Math.pow(1.001, level) * 0.75) + (level / 5) + 1) / 3); break;
        }
    }

    // Random crit chance bonus
    this.getRandomCritChanceBonus = function getRandomCritChanceBonus(level) {
        var critChance = 0;
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: critChance = parseFloat((((((0.3 * level) * Math.pow(1.001, level) * 0.75) + 0.00001) * 100) / 100).toFixed(2)); break;
            case 1: critChance = parseFloat((((((0.3 * level) * Math.pow(1.001, level) * 0.8) + 0.00001) * 100) / 100).toFixed(2)); break;
            case 2: critChance = parseFloat((((((0.3 * level) * Math.pow(1.001, level) * 0.85) + 0.00001) * 100) / 100).toFixed(2)); break;
        }
        // Cap the crit chance at 10%
        if (critChance > 10) {
            critChance = 10;
        }
        return critChance;
    }

    // Random crit damage bonus
    this.getRandomCritDamageBonus = function getRandomCritDamageBonus(level) {
        rand = Math.floor(Math.random() * 3);
        switch (rand) {
            case 0: return parseFloat((((((0.2 * level) * Math.pow(1.001, level) * 0.75) + 0.00001) * 100) / 100).toFixed(2)); break;
            case 1: return parseFloat((((((0.2 * level) * Math.pow(1.001, level) * 0.8) + 0.00001) * 100) / 100).toFixed(2)); break;
            case 2: return parseFloat((((((0.2 * level) * Math.pow(1.001, level) * 0.85) + 0.00001) * 100) / 100).toFixed(2)); break;
        }
    }

    // Random item rarity bonus
    this.getRandomItemRarityBonus = function getRandomItemRarityBonus(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return parseFloat((level * Math.pow(1.001, level) * 0.75).toFixed(2)); break;
            case 1: return parseFloat(((level * Math.pow(1.001, level) * 0.75) + (level / 10) + 1).toFixed(2)); break;
            case 2: return parseFloat(((level * Math.pow(1.001, level) * 0.75) + (level / 5) + 1).toFixed(2)); break;
        }
    }

    // Random gold gain bonus
    this.getRandomGoldGainBonus = function getRandomGoldGainBonus(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return parseFloat((level * Math.pow(1.001, level) * 0.75).toFixed(2)); break;
            case 1: return parseFloat(((level * Math.pow(1.001, level) * 0.75) + (level / 10) + 1).toFixed(2)); break;
            case 2: return parseFloat(((level * Math.pow(1.001, level) * 0.75) + (level / 5) + 1).toFixed(2)); break;
        }
    }

    // Random experience gain bonus
    this.getRandomExperienceGainBonus = function getRandomExperienceGainBonus(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return parseFloat((level * Math.pow(1.001, level) * 0.75).toFixed(2)); break;
            case 1: return parseFloat(((level * Math.pow(1.001, level) * 0.75) + (level / 10) + 1).toFixed(2)); break;
            case 2: return parseFloat(((level * Math.pow(1.001, level) * 0.75) + (level / 5) + 1).toFixed(2)); break;
        }
    }

    // Random evasion bonus
    this.getRandomEvasionBonus = function getRandomEvasionBonus(level) {
        rand = Math.random() * 3;
        rand = Math.floor(rand);
        switch (rand) {
            case 0: return Math.ceil(level * Math.pow(1.001, level) * 0.75); break;
            case 1: return Math.ceil((level * Math.pow(1.001, level) * 0.75) + (level / 10) + 1); break;
            case 2: return Math.ceil((level * Math.pow(1.001, level) * 0.75) + (level / 5) + 1); break;
        }
    }
}
var itemBonusesAmount = 14;

var ItemRarity = new Object();
ItemRarity.COMMON = "COMMON";
ItemRarity.UNCOMMON = "UNCOMMON";
ItemRarity.RARE = "RARE";
ItemRarity.EPIC = "EPIC";
ItemRarity.LEGENDARY = "LEGENDARY";
ItemRarity.count = 5;

var ItemType = new Object();
ItemType.HELM = "HELM";
ItemType.SHOULDERS = "SHOULDERS";
ItemType.CHEST = "CHEST";
ItemType.LEGS = "LEGS";
ItemType.WEAPON = "WEAPON";
ItemType.TRINKET = "TRINKET";
ItemType.OFF_HAND = "OFF_HAND";
ItemType.GLOVES = "GLOVES";
ItemType.BOOTS = "BOOTS";
ItemType.count = 9;

var EffectType = new Object();
EffectType.CRUSHING_BLOWS = "CRUSHING_BLOWS";
EffectType.COMBUSTION = "COMBUSTION";
EffectType.RUPTURE = "RUPTURE";
EffectType.WOUNDING = "WOUNDING";
EffectType.CURING = "CURING";
EffectType.FROST_SHARDS = "FROST_SHARDS";
EffectType.FLAME_IMBUED = "FLAME_IMBUED";
EffectType.BARRIER = "BARRIER";
EffectType.SWIFTNESS = "SWIFTNESS";
EffectType.PILLAGING = "PILLAGING";
EffectType.NOURISHMENT = "NOURISHMENT";
EffectType.BERSERKING = "BERSERKING";
function Effect(type, chance, value) {
    this.type = type;
    this.chance = chance;
    this.value = value;
    this.getDescription = function getDescription() {
        switch (this.type) {
            case EffectType.CRUSHING_BLOWS: 
                return "Crushing Blows: Your attack deal " + this.value + "% of your opponent's current health in damage"; 
                break;
            case EffectType.COMBUSTION: 
                return "Combustion: The debuff from Fire Blade can stack up to " + this.value + " more times"; 
                break;
            case EffectType.RUPTURE: 
                return "Rupture: Your attacks apply an additional stack of Rend. Also increases the maximum stacks of Rend by " + this.value; 
                break;
            case EffectType.WOUNDING: 
                return "Wounding: Increases the level of your Rend ability by " + this.value; 
                break;
            case EffectType.CURING: 
                return "Curing: Increases the level of your Rejuvenating Strikes ability by " + this.value;  
                break;
            case EffectType.FROST_SHARDS: 
                return "Frost Shards: Increases the level of your Ice Blade ability by " + this.value; 
                break;
            case EffectType.FLAME_IMBUED: 
                return "Flame Imbued: Increases the level of your Fire Blade ability by " + this.value; 
                break;
            case EffectType.BARRIER: 
                return "Barrier: You reflect " + this.value + "% of the damage you receive"; 
                break;
            case EffectType.SWIFTNESS: 
                return "Swiftness: Your attacks have a " + this.chance + "% chance to generate an additional attack"; 
                break;
            case EffectType.PILLAGING: 
                return "Pillaging: Your attacks have a " + this.chance + "% chance to grant you " + this.value + " gold"; 
                break;
            case EffectType.NOURISHMENT: 
                return "Nourishment: Your attacks have a " + this.chance + "% chance to heal you for " + this.value + " health"; 
                break;
            case EffectType.BERSERKING: 
                return "Berserking: Your attacks have a " + this.chance + "% chance to deal " + this.value + " damage"; 
                break;
        }
    }
}

function ItemBonuses() {
    this.minDamage = 0;
    this.maxDamage = 0;
    this.damageBonus = 0;

    this.strength = 0;
    this.agility = 0
    this.stamina = 0;

    this.health = 0;
    this.hp5 = 0;
    this.armour = 0;
    this.armourBonus = 0;
    this.evasion = 0;

    this.critChance = 0;
    this.critDamage = 0;

    this.itemRarity = 0;
    this.goldGain = 0;
    this.experienceGain = 0;
    this.effects = new Array();
}

function Item(name, level, rarity, type, sellValue, iconSourceX, iconSourceY, itemBonuses) {
    this.name = name;
    this.level = level;
    this.rarity = rarity;
    this.type = type;
    this.sellValue = sellValue * (Math.pow(2, game.upgradeManager.autoSellUpgradesPurchased));
    this.iconSourceX = iconSourceX;
    this.iconSourceY = iconSourceY;

    // Item Bonuses
    this.minDamage = itemBonuses.minDamage;
    this.maxDamage = itemBonuses.maxDamage;
    this.damageBonus = itemBonuses.damageBonus;

    this.strength = itemBonuses.strength;
    this.agility = itemBonuses.agility;
    this.stamina = itemBonuses.stamina;

    this.health = itemBonuses.health;
    this.hp5 = itemBonuses.hp5;
    this.armour = itemBonuses.armour;
    this.armourBonus = itemBonuses.armourBonus;
    this.evasion = itemBonuses.evasion;

    this.critChance = itemBonuses.critChance;
    this.critDamage = itemBonuses.critDamage;

    this.itemRarity = itemBonuses.itemRarity;
    this.goldGain = itemBonuses.goldGain;
    this.experienceGain = itemBonuses.experienceGain;
    this.effects = itemBonuses.effects;
}

function ItemCreator() {
    this.getRandomItemRarity = function getRandomItemRarity(monsterRarity) {
        var rand = Math.random();
        switch (monsterRarity) {
            case MonsterRarity.COMMON:
                if (rand < 0.20) {
                    rand = Math.random();
                    if (rand < (0.00001 * ((game.player.getItemRarity() / 100) + 1))) { return ItemRarity.LEGENDARY; }
                    else if (rand < (0.0001 * ((game.player.getItemRarity() / 100) + 1))) { return ItemRarity.EPIC; }
                    else if (rand < (0.001 * ((game.player.getItemRarity() / 100) + 1))) { return ItemRarity.RARE; }
                    else if (rand < (0.01 * ((game.player.getItemRarity() / 100) + 1))) { return ItemRarity.UNCOMMON; }
                    else { return ItemRarity.COMMON; }
                }
                break;
            case MonsterRarity.RARE:
                if (rand < (0.0001 * ((game.player.getItemRarity() / 100) + 1))) { return ItemRarity.LEGENDARY; }
                else if (rand < (0.001 * ((game.player.getItemRarity() / 100) + 1))) { return ItemRarity.EPIC; }
                else if (rand < (0.01 * ((game.player.getItemRarity() / 100) + 1))) { return ItemRarity.RARE; }
                else { return ItemRarity.UNCOMMON; }
                break;
            case MonsterRarity.ELITE:
                if (rand < (0.001 * ((game.player.getItemRarity() / 100) + 1))) { return ItemRarity.LEGENDARY; }
                else if (rand < (0.01 * ((game.player.getItemRarity() / 100) + 1))) { return ItemRarity.EPIC; }
                else { return ItemRarity.RARE; }
                break;
            case MonsterRarity.BOSS:
                if (rand < (0.01 * ((game.player.getItemRarity() / 100) + 1))) { return ItemRarity.LEGENDARY; }
                else { return ItemRarity.EPIC; }
                break;
        }
    }

    this.createRandomItem = function createRandomItem(level, rarity) {
        // If there is no rarity; do nothing
        if (rarity == null) {
            return null;
        }

        // Get a random item type
        var rand = Math.floor(Math.random() * ItemType.count);
        var type;
        switch (rand) {
            case 0: type = ItemType.HELM; break;
            case 1: type = ItemType.SHOULDERS; break;
            case 2: type = ItemType.CHEST; break;
            case 3: type = ItemType.LEGS; break;
            case 4: type = ItemType.WEAPON; break;
            case 5: type = ItemType.GLOVES; break;
            case 6: type = ItemType.BOOTS; break;
            case 7: type = ItemType.TRINKET; break;
            case 8: type = ItemType.OFF_HAND; break;
        }

        // Get a random rarity
        var prefixAmount;
        var suffixAmount;
        switch (rarity) {
            case ItemRarity.COMMON: prefixAmount = 1; suffixAmount = 0; break;
            case ItemRarity.UNCOMMON: prefixAmount = 1; suffixAmount = 1; break;
            case ItemRarity.RARE: prefixAmount = 2; suffixAmount = 1; break;
            case ItemRarity.EPIC: prefixAmount = 2; suffixAmount = 2; break;
            case ItemRarity.LEGENDARY: prefixAmount = 3; suffixAmount = 3; break;
        }

        // Add random item bonuses
        var itemBonuses = new ItemBonuses();
        var randBonus;
        var prefix = "";
        var suffix = "";

        // Create the prefixes
        var amount = prefixAmount;

        while (amount > 0) {
            // Get the ID of the bonuses; randomly
            randBonus = Math.floor(Math.random() * PREFIX_AMOUNT);
            var statGenerator = new StatGenerator();
            var nameGenerator = new NameGenerator();

            // Add the bonus to the item bonuses
            switch (randBonus) {
                case 0:
                    if (itemBonuses.damageBonus == 0 && type == ItemType.WEAPON) {
                        itemBonuses.damageBonus = statGenerator.getRandomDamageBonus(level);
                        if (prefix == "") { prefix = nameGenerator.getRandomDamageBonusName(); }
                        amount--;
                    }
                    break;
                case 1:
                    if (itemBonuses.health == 0) {
                        itemBonuses.health = statGenerator.getRandomHealthBonus(level);
                        if (prefix == "") { prefix = nameGenerator.getRandomHealthName(); }
                        amount--;
                    }
                    break;
                case 2:
                    if (itemBonuses.armourBonus == 0 && type != ItemType.WEAPON) {
                        itemBonuses.armourBonus = statGenerator.getRandomArmourBonus(level);
                        if (prefix == "") { prefix = nameGenerator.getRandomArmourBonusName(); }
                        amount--;
                    }
                    break;
                case 3:
                    if (itemBonuses.critChance == 0) {
                        itemBonuses.critChance = statGenerator.getRandomCritChanceBonus(level);
                        if (prefix == "") { prefix = nameGenerator.getRandomCritChanceName(); }
                        amount--;
                    }
                    break;
                case 4:
                    if (itemBonuses.itemRarity == 0) {
                        itemBonuses.itemRarity = statGenerator.getRandomItemRarityBonus(level);
                        if (prefix == "") { prefix = nameGenerator.getRandomItemRarityName(); }
                        amount--;
                    }
                    break;
                case 5:
                    if (itemBonuses.goldGain == 0) {
                        itemBonuses.goldGain = statGenerator.getRandomGoldGainBonus(level);
                        if (prefix == "") { prefix = nameGenerator.getRandomGoldGainName(); }
                        amount--;
                    }
                    break;
            }
        }

        // Create the suffixes
        amount = suffixAmount;
        while (amount > 0) {
            // Get the ID of the bonuses; randomly
            randBonus = Math.floor(Math.random() * SUFFIX_AMOUNT);

            // Add the bonus to the item bonuses
            switch (randBonus) {
                case 0:
                    if (itemBonuses.strength == 0) {
                        itemBonuses.strength = statGenerator.getRandomStrengthBonus(level);
                        if (suffix == "") { suffix = nameGenerator.getRandomStrengthName(); }
                        amount--;
                    }
                    break;
                case 1:
                    if (itemBonuses.agility == 0) {
                        itemBonuses.agility = statGenerator.getRandomAgilityBonus(level);
                        if (suffix == "") { suffix = nameGenerator.getRandomAgilityName(); }
                        amount--;
                    }
                    break;
                case 2:
                    if (itemBonuses.stamina == 0) {
                        itemBonuses.stamina = statGenerator.getRandomStaminaBonus(level);
                        if (suffix == "") { suffix = nameGenerator.getRandomStaminaName(); }
                        amount--;
                    }
                    break;
                case 3:
                    if (itemBonuses.hp5 == 0) {
                        itemBonuses.hp5 = statGenerator.getRandomHp5Bonus(level);
                        if (suffix == "") { suffix = nameGenerator.getRandomHp5Name(); }
                        amount--;
                    }
                    break;
                case 4:
                    if (itemBonuses.critDamage == 0) {
                        itemBonuses.critDamage = statGenerator.getRandomCritDamageBonus(level);
                        if (suffix == "") { suffix = nameGenerator.getRandomCritDamageName(); }
                        amount--;
                    }
                    break;
                case 5:
                    if (itemBonuses.experienceGain == 0) {
                        itemBonuses.experienceGain = statGenerator.getRandomExperienceGainBonus(level);
                        if (suffix == "") { suffix = nameGenerator.getRandomExperienceGainName(); }
                        amount--;
                    }
                    break;
                case 6:
                    if (itemBonuses.evasion == 0) {
                        itemBonuses.evasion = statGenerator.getRandomEvasionBonus(level);
                        if (suffix == "") { suffix = nameGenerator.getRandomEvasionName(); }
                        amount--;
                    }
                    break;
            }
        }

        // If it's a weapon; add weapon damage
        if (type == ItemType.WEAPON) {
            itemBonuses.minDamage = statGenerator.getRandomMinDamage(level);
            itemBonuses.maxDamage = statGenerator.getRandomMaxDamage(level, itemBonuses.minDamage);
            // Add damage depending on the rarity
            switch (rarity) {
                case ItemRarity.UNCOMMON: 
                    itemBonuses.minDamage += Math.ceil(((2 * level) * Math.pow(1.001, level) * 0.75) + (level / 5) + 1); 
                    itemBonuses.maxDamage += Math.ceil(((2 * level) * Math.pow(1.001, level) * 0.75) + (level / 5) + 1); 
                    break;
                case ItemRarity.RARE: 
                    itemBonuses.minDamage += Math.ceil(((2 * level) * Math.pow(1.001, level) * 0.75) + (level / 5) + 1) * 2; 
                    itemBonuses.maxDamage += Math.ceil(((2 * level) * Math.pow(1.001, level) * 0.75) + (level / 5) + 1) * 2; 
                    break;
                case ItemRarity.EPIC: 
                    itemBonuses.minDamage += Math.ceil(((2 * level) * Math.pow(1.001, level) * 0.75) + (level / 5) + 1) * 3;
                    itemBonuses.maxDamage += Math.ceil(((2 * level) * Math.pow(1.001, level) * 0.75) + (level / 5) + 1) * 3;  
                    break;
                case ItemRarity.LEGENDARY: 
                    itemBonuses.minDamage += Math.ceil(((2 * level) * Math.pow(1.001, level) * 0.75) + (level / 5) + 1) * 4; 
                    itemBonuses.maxDamage += Math.ceil(((2 * level) * Math.pow(1.001, level) * 0.75) + (level / 5) + 1) * 4; 
                    break;
            }
        }
        // Else; add armour
        else {
            itemBonuses.armour = statGenerator.getRandomArmour(level);
        }

        // Create the name
        var name = prefix;
        switch (type) {
            case ItemType.HELM: name += " Helmet "; break;
            case ItemType.SHOULDERS: name += " Shoulders "; break;
            case ItemType.CHEST: name += " Chest "; break;
            case ItemType.LEGS: name += " Legs "; break;
            case ItemType.WEAPON: name += " Weapon "; break;
            case ItemType.GLOVES: name += " Gloves "; break;
            case ItemType.BOOTS: name += " Boots "; break;
            case ItemType.TRINKET: name += " Trinket "; break;
            case ItemType.OFF_HAND: name += " Shield "; break;
        }
        name += suffix;

        // Calculate the icon coordinates
        var iconSourceX = 0;
        var iconSourceY = 0;
        // x coordinate
        switch (type) {
            case ItemType.HELM: iconSourceX = 0; break;
            case ItemType.SHOULDERS: iconSourceX = 280; break;
            case ItemType.CHEST: iconSourceX = 245; break;
            case ItemType.LEGS: iconSourceX = 210; break;
            case ItemType.WEAPON: iconSourceX = 175; break;
            case ItemType.GLOVES: iconSourceX = 140; break;
            case ItemType.BOOTS: iconSourceX = 105; break;
            case ItemType.TRINKET: iconSourceX = 70; break;
            case ItemType.OFF_HAND: iconSourceX = 35; break;
        }
        // y coordinate
        switch (rarity) {
            case ItemRarity.UNCOMMON: iconSourceY = 140; break;
            case ItemRarity.RARE: iconSourceY = 105; break;
            case ItemRarity.EPIC: iconSourceY = 70; break;
            case ItemRarity.LEGENDARY: iconSourceY = 35; break;
        }

        // Calculate the sell value
        var multiple = 0;
        switch (type) {
            case ItemType.HELM: multiple = 2.3; break;
            case ItemType.SHOULDERS: multiple = 2.5; break;
            case ItemType.CHEST: multiple = 3.3; break;
            case ItemType.LEGS: multiple = 3.1; break;
            case ItemType.WEAPON: multiple = 2.9; break;
            case ItemType.GLOVES: multiple = 2.1; break;
            case ItemType.BOOTS: multiple = 2.1; break;
            case ItemType.TRINKET: multiple = 2.9; break;
            case ItemType.OFF_HAND: multiple = 2.7; break;
        }
        var sellValue = Math.floor(level * multiple);

        // Add any special effects
        var effects = new Array();
        var newEffect = null;
        var effectOwned = false;
        var effectsAmount = 0;
        switch (rarity) {
            case ItemRarity.EPIC: effectsAmount = Math.floor(Math.random() * 2); break;
            case ItemRarity.LEGENDARY: effectsAmount = Math.floor(Math.random() * 2) + 1; break;
        }
        while (effectsAmount > 0) {
            effectOwned = false;
            // Get a new random effect
            switch (type) {
                case ItemType.WEAPON:
                    switch (Math.floor(Math.random() * 3)) {
                        case 0: newEffect = new Effect(EffectType.CRUSHING_BLOWS, 100, 5); break;
                        case 1: newEffect = new Effect(EffectType.COMBUSTION, 100, 5); break;
                        case 2: newEffect = new Effect(EffectType.RUPTURE, 100, 5); break;
                    }
                    break;
                case ItemType.TRINKET:
                    switch (Math.floor(Math.random() * 4)) {
                        case 0: newEffect = new Effect(EffectType.SWIFTNESS, 10, 0); break;
                        case 1: newEffect = new Effect(EffectType.PILLAGING, 10, Math.floor(((Sigma(level) * Math.pow(1.01, level)) / 4 + 1) * 15)); break;
                        case 2: newEffect = new Effect(EffectType.NOURISHMENT, 10, Math.floor((10 * level) * Math.pow(1.001, level) * 0.75)); break;
                        case 3: newEffect = new Effect(EffectType.BERSERKING, 10, Math.floor((level) * Math.pow(1.001, level) * 3)); break;
                    }
                    break;
                default:
                    switch (Math.floor(Math.random() * 5)) {
                        case 0: newEffect = new Effect(EffectType.WOUNDING, 100, Math.ceil(level / 35)); break;
                        case 1: newEffect = new Effect(EffectType.CURING, 100, Math.ceil(level / 35)); break;
                        case 2: newEffect = new Effect(EffectType.FROST_SHARDS, 100, Math.ceil(level / 35)); break;
                        case 3: newEffect = new Effect(EffectType.FLAME_IMBUED, 100, Math.ceil(level / 35)); break;
                        case 4: newEffect = new Effect(EffectType.BARRIER, 100, Math.floor((Math.random() * 15) + 20)); break;
                    }
                    break;
            }
            // Check to see if the item will already have this effect
            for (var x = 0; x < effects.length; x++) {
                if (effects[x].type == newEffect.type) {
                    effectOwned = true;
                }
            }
            // If it won't, add it to the effects
            if (!effectOwned) {
                effects.push(newEffect);
                effectsAmount--;
            }
        }
        itemBonuses.effects = effects;

        var newItem = new Item(name, level, rarity, type, sellValue, iconSourceX, iconSourceY, itemBonuses);
        return newItem;
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                     UPGRADES                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
var UpgradeType = new Object();
UpgradeType.GPS = "GPS";
UpgradeType.SPECIAL = "SPECIAL";
UpgradeType.ATTACK = "ATTACK";
UpgradeType.AUTO_SELL = "AUTO_SELL";

var UpgradeRequirementType = new Object();
UpgradeRequirementType.FOOTMAN = "FOOTMAN";
UpgradeRequirementType.CLERIC = "CLERIC";
UpgradeRequirementType.COMMANDER = "COMMANDER";
UpgradeRequirementType.MAGE = "MAGE";
UpgradeRequirementType.ASSASSIN = "ASSASSIN";
UpgradeRequirementType.WARLOCK = "WARLOCK";
UpgradeRequirementType.LEVEL = "LEVEL";
UpgradeRequirementType.ITEMS_LOOTED = "ITEMS_LOOTED";

function Upgrade(name, cost, type, requirementType, requirementAmount, description, iconSourceLeft, iconSourceTop) {
    this.name = name;
    this.cost = cost;
    this.type = type;
    this.requirementType = requirementType;
    this.requirementAmount = requirementAmount;
    this.description = description;
    this.iconSourceLeft = iconSourceLeft;
    this.iconSourceTop = iconSourceTop;

    this.available = false;
    this.purchased = false;
}

function UpgradeManager() {
    this.upgradesButtonGlowing = false;

    this.upgradesAvailable = 0;
    this.upgradesPurchased = 0;

    this.footmanUpgradesPurchased = 0;
    this.clericUpgradesPurchased = 0;
    this.commanderUpgradesPurchased = 0;
    this.mageUpgradesPurchased = 0;
    this.assassinUpgradesPurchased = 0;
    this.warlockUpgradesPurchased = 0;

    this.clericSpecialUpgradesPurchased = 0;
    this.commanderSpecialUpgradesPurchased = 0;
    this.mageSpecialUpgradesPurchased = 0;
    this.assassinSpecialUpgradesPurchased = 0;
    this.warlockSpecialUpgradesPurchased = 0;

    this.autoSellUpgradesPurchased = 0;

    // The Id of the upgrade that each button is linked to
    this.purchaseButtonUpgradeIds = new Array();

    this.upgrades = new Array();

    this.initialize = function initialize() {
        // Footman Basic Upgrades
        this.upgrades.push(new Upgrade("Footman Training", Math.floor((game.mercenaryManager.baseFootmanPrice * Math.pow(1.15, 9)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.FOOTMAN, 10, "Doubles the GPS of your Footmen", 0, 0));
        this.upgrades.push(new Upgrade("Footman Training II", Math.floor((game.mercenaryManager.baseFootmanPrice * Math.pow(1.15, 19)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.FOOTMAN, 20, "Doubles the GPS of your Footmen", 0, 0));
        this.upgrades.push(new Upgrade("Footman Training III", Math.floor((game.mercenaryManager.baseFootmanPrice * Math.pow(1.15, 29)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.FOOTMAN, 30, "Doubles the GPS of your Footmen", 0, 0));
        this.upgrades.push(new Upgrade("Footman Training IV", Math.floor((game.mercenaryManager.baseFootmanPrice * Math.pow(1.15, 49)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.FOOTMAN, 50, "Doubles the GPS of your Footmen", 0, 0));
        this.upgrades.push(new Upgrade("Footman Training V", Math.floor((game.mercenaryManager.baseFootmanPrice * Math.pow(1.15, 74)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.FOOTMAN, 75, "Doubles the GPS of your Footmen", 0, 0));
        this.upgrades.push(new Upgrade("Footman Training VI", Math.floor((game.mercenaryManager.baseFootmanPrice * Math.pow(1.15, 99)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.FOOTMAN, 100, "Doubles the GPS of your Footmen", 0, 0));
        this.upgrades.push(new Upgrade("Footman Training VII", Math.floor((game.mercenaryManager.baseFootmanPrice * Math.pow(1.15, 149)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.FOOTMAN, 150, "Doubles the GPS of your Footmen", 0, 0));
        this.upgrades.push(new Upgrade("Footman Training VIII", Math.floor((game.mercenaryManager.baseFootmanPrice * Math.pow(1.15, 199)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.FOOTMAN, 200, "Doubles the GPS of your Footmen", 0, 0));
        this.upgrades.push(new Upgrade("Footman Training IX", Math.floor((game.mercenaryManager.baseFootmanPrice * Math.pow(1.15, 249)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.FOOTMAN, 250, "Doubles the GPS of your Footmen", 0, 0));
        this.upgrades.push(new Upgrade("Footman Training X", Math.floor((game.mercenaryManager.baseFootmanPrice * Math.pow(1.15, 199)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.FOOTMAN, 300, "Doubles the GPS of your Footmen", 0, 0));

        // Cleric Basic Upgrades
        this.upgrades.push(new Upgrade("Cleric Training", Math.floor((game.mercenaryManager.baseClericPrice * Math.pow(1.15, 9)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.CLERIC, 10, "Doubles the GPS of your Clerics", 200, 0));
        this.upgrades.push(new Upgrade("Cleric Training II", Math.floor((game.mercenaryManager.baseClericPrice * Math.pow(1.15, 24)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.CLERIC, 25, "Doubles the GPS of your Clerics", 200, 0));
        this.upgrades.push(new Upgrade("Cleric Training III", Math.floor((game.mercenaryManager.baseClericPrice * Math.pow(1.15, 49)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.CLERIC, 50, "Doubles the GPS of your Clerics", 200, 0));
        this.upgrades.push(new Upgrade("Cleric Training IV", Math.floor((game.mercenaryManager.baseClericPrice * Math.pow(1.15, 99)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.CLERIC, 100, "Doubles the GPS of your Clerics", 200, 0));
        this.upgrades.push(new Upgrade("Cleric Training V", Math.floor((game.mercenaryManager.baseClericPrice * Math.pow(1.15, 149)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.CLERIC, 150, "Doubles the GPS of your Clerics", 200, 0));

        // Commander Basic Upgrades
        this.upgrades.push(new Upgrade("Commander Training", Math.floor((game.mercenaryManager.baseCommanderPrice * Math.pow(1.15, 9)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.COMMANDER, 10, "Doubles the GPS of your Commanders", 160, 0));
        this.upgrades.push(new Upgrade("Commander Training II", Math.floor((game.mercenaryManager.baseCommanderPrice * Math.pow(1.15, 24)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.COMMANDER, 25, "Doubles the GPS of your Commanders", 160, 0));
        this.upgrades.push(new Upgrade("Commander Training III", Math.floor((game.mercenaryManager.baseCommanderPrice * Math.pow(1.15, 49)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.COMMANDER, 50, "Doubles the GPS of your Commanders", 160, 0));
        this.upgrades.push(new Upgrade("Commander Training IV", Math.floor((game.mercenaryManager.baseCommanderPrice * Math.pow(1.15, 99)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.COMMANDER, 100, "Doubles the GPS of your Commanders", 160, 0));
        this.upgrades.push(new Upgrade("Commander Training V", Math.floor((game.mercenaryManager.baseCommanderPrice * Math.pow(1.15, 149)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.COMMANDER, 150, "Doubles the GPS of your Commanders", 160, 0));

        // Mage Basic Upgrades
        this.upgrades.push(new Upgrade("Mage Training", Math.floor((game.mercenaryManager.baseMagePrice * Math.pow(1.15, 9)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.MAGE, 10, "Doubles the GPS of your Mages", 120, 0));
        this.upgrades.push(new Upgrade("Mage Training II", Math.floor((game.mercenaryManager.baseMagePrice * Math.pow(1.15, 24)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.MAGE, 25, "Doubles the GPS of your Mages", 120, 0));
        this.upgrades.push(new Upgrade("Mage Training III", Math.floor((game.mercenaryManager.baseMagePrice * Math.pow(1.15, 49)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.MAGE, 50, "Doubles the GPS of your Mages", 120, 0));
        this.upgrades.push(new Upgrade("Mage Training IV", Math.floor((game.mercenaryManager.baseMagePrice * Math.pow(1.15, 99)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.MAGE, 100, "Doubles the GPS of your Mages", 120, 0));
        this.upgrades.push(new Upgrade("Mage Training V", Math.floor((game.mercenaryManager.baseMagePrice * Math.pow(1.15, 149)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.MAGE, 150, "Doubles the GPS of your Mages", 120, 0));

        // Assassin Basic Upgrades
        this.upgrades.push(new Upgrade("Assassin Training", Math.floor((game.mercenaryManager.baseAssassinPrice * Math.pow(1.15, 9)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.ASSASSIN, 10, "Doubles the GPS of your Assassin", 80, 0));
        this.upgrades.push(new Upgrade("Assassin Training II", Math.floor((game.mercenaryManager.baseAssassinPrice * Math.pow(1.15, 24)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.ASSASSIN, 25, "Doubles the GPS of your Assassin", 80, 0));
        this.upgrades.push(new Upgrade("Assassin Training III", Math.floor((game.mercenaryManager.baseAssassinPrice * Math.pow(1.15, 49)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.ASSASSIN, 50, "Doubles the GPS of your Assassin", 80, 0));
        this.upgrades.push(new Upgrade("Assassin Training IV", Math.floor((game.mercenaryManager.baseAssassinPrice * Math.pow(1.15, 99)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.ASSASSIN, 100, "Doubles the GPS of your Assassin", 80, 0));
        this.upgrades.push(new Upgrade("Assassin Training V", Math.floor((game.mercenaryManager.baseAssassinPrice * Math.pow(1.15, 149)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.ASSASSIN, 150, "Doubles the GPS of your Assassin", 80, 0));

        // Warlock Basic Upgrades
        this.upgrades.push(new Upgrade("Warlock Training", ((game.mercenaryManager.baseWarlockPrice * Math.pow(1.15, 9)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.WARLOCK, 10, "Doubles the GPS of your Warlocks", 40, 0));
        this.upgrades.push(new Upgrade("Warlock Training II", ((game.mercenaryManager.baseWarlockPrice * Math.pow(1.15, 24)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.WARLOCK, 25, "Doubles the GPS of your Warlocks", 40, 0));
        this.upgrades.push(new Upgrade("Warlock Training III", ((game.mercenaryManager.baseWarlockPrice * Math.pow(1.15, 49)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.WARLOCK, 50, "Doubles the GPS of your Warlocks", 40, 0));
        this.upgrades.push(new Upgrade("Warlock Training IV", ((game.mercenaryManager.baseWarlockPrice * Math.pow(1.15, 99)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.WARLOCK, 100, "Doubles the GPS of your Warlocks", 40, 0));
        this.upgrades.push(new Upgrade("Warlock Training V", ((game.mercenaryManager.baseWarlockPrice * Math.pow(1.15, 149)) * 1.5), UpgradeType.GPS, UpgradeRequirementType.WARLOCK, 150, "Doubles the GPS of your Warlocks", 40, 0));

        // Cleric Ability Upgrades
        this.upgrades.push(new Upgrade("Holy Imbuement", Math.floor((game.mercenaryManager.baseClericPrice * Math.pow(1.15, 49)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.CLERIC, 50, "Increases the hp5 bonus from your Clerics by 2.5%.", 200, 0));
        this.upgrades.push(new Upgrade("Holy Imbuement II", Math.floor((game.mercenaryManager.baseClericPrice * Math.pow(1.15, 99)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.CLERIC, 100, "Increases the hp5 bonus from your Clerics by 2.5%.", 200, 0));
        this.upgrades.push(new Upgrade("Holy Imbuement III", Math.floor((game.mercenaryManager.baseClericPrice * Math.pow(1.15, 149)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.CLERIC, 150, "Increases the hp5 bonus from your Clerics by 2.5%.", 200, 0));
        this.upgrades.push(new Upgrade("Holy Imbuement IV", Math.floor((game.mercenaryManager.baseClericPrice * Math.pow(1.15, 199)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.CLERIC, 200, "Increases the hp5 bonus from your Clerics by 2.5%.", 200, 0));

        // Commander Ability Upgrades
        this.upgrades.push(new Upgrade("Battle Morale", Math.floor((game.mercenaryManager.baseCommanderPrice * Math.pow(1.15, 49)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.COMMANDER, 50, "Increases the health bonus from your Commanders by " + game.mercenaryManager.commanderHealthPercentUpgradeValue + "%.", 160, 0));
        this.upgrades.push(new Upgrade("Battle Morale II", Math.floor((game.mercenaryManager.baseCommanderPrice * Math.pow(1.15, 99)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.COMMANDER, 100, "Increases the health bonus from your Commanders by " + game.mercenaryManager.commanderHealthPercentUpgradeValue + "%.", 160, 0));
        this.upgrades.push(new Upgrade("Battle Morale III", Math.floor((game.mercenaryManager.baseCommanderPrice * Math.pow(1.15, 149)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.COMMANDER, 150, "Increases the health bonus from your Commanders by " + game.mercenaryManager.commanderHealthPercentUpgradeValue + "%.", 160, 0));
        this.upgrades.push(new Upgrade("Battle Morale IV", Math.floor((game.mercenaryManager.baseCommanderPrice * Math.pow(1.15, 199)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.COMMANDER, 200, "Increases the health bonus from your Commanders by " + game.mercenaryManager.commanderHealthPercentUpgradeValue + "%.", 160, 0));

        // Mage Ability Upgrades
        this.upgrades.push(new Upgrade("Fire Mastery", Math.floor((game.mercenaryManager.baseMagePrice * Math.pow(1.15, 49)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.MAGE, 50, "Increases the damage bonus from your Mages by 2.5%.", 120, 0));
        this.upgrades.push(new Upgrade("Fire Mastery II", Math.floor((game.mercenaryManager.baseMagePrice * Math.pow(1.15, 99)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.MAGE, 100, "Increases the damage bonus from your Mages by 2.5%.", 120, 0));
        this.upgrades.push(new Upgrade("Fire Mastery III", Math.floor((game.mercenaryManager.baseMagePrice * Math.pow(1.15, 149)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.MAGE, 150, "Increases the damage bonus from your Mages by 2.5%.", 120, 0));
        this.upgrades.push(new Upgrade("Fire Mastery IV", Math.floor((game.mercenaryManager.baseMagePrice * Math.pow(1.15, 199)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.MAGE, 200, "Increases the damage bonus from your Mages by 2.5%.", 120, 0));

        // Assassin Ability Upgrades
        this.upgrades.push(new Upgrade("Shadow Mastery", Math.floor((game.mercenaryManager.baseAssassinPrice + Math.pow(1.15, 49)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.ASSASSIN, 50, "Increases the evasion bonus from your assassins by " + game.mercenaryManager.assassinEvasionPercentUpgradeValue + "%.", 80, 0));
        this.upgrades.push(new Upgrade("Shadow Mastery II", Math.floor((game.mercenaryManager.baseAssassinPrice + Math.pow(1.15, 99)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.ASSASSIN, 100, "Increases the evasion bonus from your assassins by " + game.mercenaryManager.assassinEvasionPercentUpgradeValue + "%.", 80, 0));
        this.upgrades.push(new Upgrade("Shadow Mastery III", Math.floor((game.mercenaryManager.baseAssassinPrice + Math.pow(1.15, 149)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.ASSASSIN, 150, "Increases the evasion bonus from your assassins by " + game.mercenaryManager.assassinEvasionPercentUpgradeValue + "%.", 80, 0));
        this.upgrades.push(new Upgrade("Shadow Mastery IV", Math.floor((game.mercenaryManager.baseAssassinPrice + Math.pow(1.15, 199)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.ASSASSIN, 200, "Increases the evasion bonus from your assassins by " + game.mercenaryManager.assassinEvasionPercentUpgradeValue + "%.", 80, 0));

        // Warlock Ability Upgrades
        this.upgrades.push(new Upgrade("Corruption", Math.floor((game.mercenaryManager.baseWarlockPrice * Math.pow(1.15, 49)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.WARLOCK, 50, "Increases the crit damage bonus from your Warlocks by 2.5%.", 40, 0));
        this.upgrades.push(new Upgrade("Corruption II", Math.floor((game.mercenaryManager.baseWarlockPrice * Math.pow(1.15, 99)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.WARLOCK, 100, "Increases the crit damage bonus from your Warlocks by 2.5%.", 40, 0));
        this.upgrades.push(new Upgrade("Corruption III", Math.floor((game.mercenaryManager.baseWarlockPrice * Math.pow(1.15, 149)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.WARLOCK, 150, "Increases the crit damage bonus from your Warlocks by 2.5%.", 40, 0));
        this.upgrades.push(new Upgrade("Corruption IV", Math.floor((game.mercenaryManager.baseWarlockPrice * Math.pow(1.15, 199)) * 3), UpgradeType.SPECIAL, UpgradeRequirementType.WARLOCK, 200, "Increases the crit damage bonus from Warlocks by 2.5%.", 40, 0));

        // Attack Upgrades
        this.upgrades.push(new Upgrade("Power Strike", game.monsterCreator.calculateMonsterGoldWorth(50, MonsterRarity.COMMON) * 400, UpgradeType.ATTACK, UpgradeRequirementType.LEVEL, 50, "Upgrades your attack to Power Strike", 0, 80));
        this.upgrades.push(new Upgrade("Double Strike", game.monsterCreator.calculateMonsterGoldWorth(100, MonsterRarity.COMMON) * 400, UpgradeType.ATTACK, UpgradeRequirementType.LEVEL, 100, "Upgrades your attack to Double Strike", 200, 80));

        // Auto Loot Upgrades
        this.upgrades.push(new Upgrade("Vendor", game.monsterCreator.calculateMonsterGoldWorth(25, MonsterRarity.COMMON) * 200, UpgradeType.AUTO_SELL, UpgradeRequirementType.ITEMS_LOOTED, 100, "Doubles the amount of gold items are worth and allows you to automatically sell common items. This can be set in your inventory.", 200, 40));
        this.upgrades.push(new Upgrade("Trader", game.monsterCreator.calculateMonsterGoldWorth(50, MonsterRarity.COMMON) * 200, UpgradeType.AUTO_SELL, UpgradeRequirementType.ITEMS_LOOTED, 200, "Doubles the amount of gold items are worth and allows you to automatically sell uncommon items. This can be set in your inventory.", 200, 40));
        this.upgrades.push(new Upgrade("Merchant", game.monsterCreator.calculateMonsterGoldWorth(100, MonsterRarity.COMMON) * 200, UpgradeType.AUTO_SELL, UpgradeRequirementType.ITEMS_LOOTED, 400, "Doubles the amount of gold items are worth and allows you to automatically sell rare items. This can be set in your inventory.", 200, 40));
        this.upgrades.push(new Upgrade("Storekeeper", game.monsterCreator.calculateMonsterGoldWorth(150, MonsterRarity.COMMON) * 200, UpgradeType.AUTO_SELL, UpgradeRequirementType.ITEMS_LOOTED, 800, "Doubles the amount of gold items are worth and allows you to automatically sell epic items. This can be set in your inventory.", 200, 40));
        this.upgrades.push(new Upgrade("Operator", game.monsterCreator.calculateMonsterGoldWorth(250, MonsterRarity.COMMON) * 200, UpgradeType.AUTO_SELL, UpgradeRequirementType.ITEMS_LOOTED, 1600, "Doubles the amount of gold items are worth and allows you to automatically sell legendary items. This can be set in your inventory.", 200, 40));
    }

    this.update = function update() {
        var currentUpgrade;
        var available = false;
        // Go through every upgrade
        for (var x = 0; x < this.upgrades.length; x++) {
            currentUpgrade = this.upgrades[x];
            // Check to see if this upgrade is already available
            if (!currentUpgrade.available && !currentUpgrade.purchased) {
                // If it isn't then see if it can be now
                available = false;

                // Find the matching requirement type, then see if it has been met
                switch (currentUpgrade.requirementType) {
                    case UpgradeRequirementType.FOOTMAN: if (game.mercenaryManager.footmenOwned >= currentUpgrade.requirementAmount) { available = true; } break;
                    case UpgradeRequirementType.CLERIC: if (game.mercenaryManager.clericsOwned >= currentUpgrade.requirementAmount) { available = true; } break;
                    case UpgradeRequirementType.COMMANDER: if (game.mercenaryManager.commandersOwned >= currentUpgrade.requirementAmount) { available = true; } break;
                    case UpgradeRequirementType.MAGE: if (game.mercenaryManager.magesOwned >= currentUpgrade.requirementAmount) { available = true; } break;
                    case UpgradeRequirementType.ASSASSIN: if (game.mercenaryManager.assassinsOwned >= currentUpgrade.requirementAmount) { available = true; } break;
                    case UpgradeRequirementType.WARLOCK: if (game.mercenaryManager.warlocksOwned >= currentUpgrade.requirementAmount) { available = true; } break;
                    case UpgradeRequirementType.ITEMS_LOOTED: if (game.stats.itemsLooted >= currentUpgrade.requirementAmount) { available = true; } break;
                    case UpgradeRequirementType.LEVEL: if (game.player.level >= currentUpgrade.requirementAmount) { available = true; } break;
                }
            }

            // If the upgrade is now available, then add it to the interface
            if (available) {
                game.displayAlert("New upgrade available!");
                // Set the upgrade to available
                currentUpgrade.available = true;
                this.upgradesAvailable++;
                this.purchaseButtonUpgradeIds.push(x);

                // Create the button
                var newDiv = document.createElement('div');
                newDiv.id = 'upgradePurchaseButton' + this.upgradesAvailable;
                newDiv.className = 'buyButton';
                var id = this.upgradesAvailable;
                newDiv.onmouseover = function () { upgradeButtonMouseOver(newDiv, id); }
                newDiv.onmousedown = function () { upgradeButtonMouseDown(id); }
                newDiv.onmouseup = function () { upgradeButtonMouseOver(newDiv, id); }
                newDiv.onmouseout = function () { upgradeButtonMouseOut(id); }
                var container = document.getElementById("upgradesBuyArea");
                container.appendChild(newDiv);

                // Create the text container
                var newDiv2 = document.createElement('div');
                newDiv2.className = 'buyButtonArea';
                newDiv.appendChild(newDiv2);

                // Create the icon
                var icon = document.createElement('div');
                icon.id = "upgradeIcon" + this.upgradesAvailable;
                icon.className = 'buyButtonIcon';
                icon.style.background = 'url("includes/images/bigIcons.png") ' + currentUpgrade.iconSourceLeft + 'px ' + currentUpgrade.iconSourceTop + 'px';
                newDiv2.appendChild(icon);

                // Create the name
                var newDiv3 = document.createElement('div');
                newDiv3.id = 'upgradeName' + this.upgradesAvailable;
                newDiv3.className = 'mercenaryName';
                newDiv3.innerHTML = currentUpgrade.name;
                newDiv2.appendChild(newDiv3);

                // Transform the cost
                var cost = currentUpgrade.cost;
                cost = cost.formatMoney(0);

                // Create the cost
                newDiv3 = document.createElement('div');
                newDiv3.id = 'upgradeCost' + this.upgradesAvailable;
                newDiv3.className = 'mercenaryAmount';
                newDiv3.innerHTML = cost;
                newDiv3.style.left = '53px';
                newDiv2.appendChild(newDiv3);

                // Create the gold coin
                newDiv3 = document.createElement('div');
                newDiv3.id = 'upgradeCoin' + this.upgradesAvailable;
                newDiv3.className = 'goldCoin';
                newDiv3.style.position = 'absolute';
                newDiv3.style.top = '28px';
                newDiv3.style.width = '12px';
                newDiv3.style.height = '12px';
                newDiv3.style.left = '41px';
                newDiv2.appendChild(newDiv3);

                // Make the Upgrades Button glow to tell the player a new upgrade is available
                this.glowUpgradesButton();

                break;
            }
        }
    }

    this.purchaseUpgrade = function purchaseUpgrade(id) {
        // If the player can afford the upgrade
        if (game.player.gold >= this.upgrades[this.purchaseButtonUpgradeIds[id]].cost) {
            // Purchase the upgrade
            var upgrade = this.upgrades[this.purchaseButtonUpgradeIds[id]];
            game.player.gold -= upgrade.cost;
            upgrade.purchased = true;
            upgrade.available = false;
            this.upgradesAvailable--;
            this.upgradesPurchased++;
            this.purchaseButtonUpgradeIds.splice(id, 1);

            var autoSellUpgradePurchased = false;
            // Apply the bonus
            switch (upgrade.type) {
                case UpgradeType.GPS:
                    switch (upgrade.requirementType) {
                        case UpgradeRequirementType.FOOTMAN: this.footmanUpgradesPurchased++; break;
                        case UpgradeRequirementType.CLERIC: this.clericUpgradesPurchased++; break;
                        case UpgradeRequirementType.COMMANDER: this.commanderUpgradesPurchased++; break;
                        case UpgradeRequirementType.MAGE: this.mageUpgradesPurchased++; break;
                        case UpgradeRequirementType.ASSASSIN: this.assassinUpgradesPurchased++; break;
                        case UpgradeRequirementType.WARLOCK: this.warlockUpgradesPurchased++; break;
                    }
                    break;
                case UpgradeType.SPECIAL:
                    switch (upgrade.requirementType) {
                        case UpgradeRequirementType.FOOTMAN: break;
                        case UpgradeRequirementType.CLERIC: this.clericSpecialUpgradesPurchased++; break;
                        case UpgradeRequirementType.COMMANDER: this.commanderSpecialUpgradesPurchased++; break;
                        case UpgradeRequirementType.MAGE: this.mageSpecialUpgradesPurchased++; break;
                        case UpgradeRequirementType.ASSASSIN: this.assassinSpecialUpgradesPurchased++; break;
                        case UpgradeRequirementType.WARLOCK: this.warlockSpecialUpgradesPurchased++; break;
                    }
                    break;
                case UpgradeType.AUTO_SELL:
                    autoSellUpgradePurchased = true;
                    this.autoSellUpgradesPurchased++;
                    switch (upgrade.name) {
                        case "Vendor": $("#checkboxWhite").show(); break;
                        case "Trader": $("#checkboxGreen").show(); break;
                        case "Merchant": $("#checkboxBlue").show(); break;
                        case "Storekeeper": $("#checkboxPurple").show(); break;
                        case "Operator": $("#checkboxOrange").show(); break;
                    }
                    break;
                case UpgradeType.ATTACK:
                    switch (upgrade.name) {
                        case "Power Strike": if (!this.upgrades[56].purchased) { game.player.changeAttack(AttackType.POWER_STRIKE); } break;
                        case "Double Strike": game.player.changeAttack(AttackType.DOUBLE_STRIKE); break;
                    }
            }

            // If an auto sell upgrade was purchased then upgrade the gold value on all items the player currently has
            if (autoSellUpgradePurchased) {
                for (var x = 0; x < game.inventory.slots.length; x++) {
                    if (game.inventory.slots[x] != null) {
                        game.inventory.slots[x].sellValue *= 2;
                    }
                }
                for (var x = 0; x < game.equipment.slots.length; x++) {
                    if (game.equipment.slots[x] != null) {
                        game.equipment.slots[x].sellValue *= 2;
                    }
                }
            }

            // Remove the button and organise the others
            var currentElement;
            var nextElement;
            var buttonId;
            for (var x = id; x < this.upgradesAvailable; x++) {
                // Change the button
                buttonId = x + 1;
                currentElement = document.getElementById('upgradePurchaseButton' + buttonId);
                nextElement = document.getElementById('upgradePurchaseButton' + (buttonId + 1));
                currentElement.className = nextElement.className;

                // Change the icon
                currentElement = document.getElementById('upgradeIcon' + buttonId);
                nextElement = document.getElementById('upgradeIcon' + (buttonId + 1));
                currentElement.style.background = nextElement.style.background;

                // Change the name
                currentElement = document.getElementById('upgradeName' + buttonId);
                nextElement = document.getElementById('upgradeName' + (buttonId + 1));
                currentElement.innerHTML = nextElement.innerHTML;

                // Change the cost
                currentElement = document.getElementById('upgradeCost' + buttonId);
                nextElement = document.getElementById('upgradeCost' + (buttonId + 1));
                currentElement.innerHTML = nextElement.innerHTML;
                currentElement.style.left = nextElement.style.left;
            }

            // Remove the last element and update the position for the next upgrade
            currentElement = document.getElementById('upgradePurchaseButton' + (this.upgradesAvailable + 1));
            currentElement.parentNode.removeChild(currentElement);
            this.nextTopPosition -= this.topIncrement;

            // Hide the tooltip
            $("#otherTooltip").hide();
        }
    }

    this.stopGlowingUpgradesButton = function stopGlowingUpgradesButton() {
        this.upgradesButtonGlowing = false;
        $("#upgradesWindowButtonGlow").stop(true);
        $("#upgradesWindowButtonGlow").css('opacity', 0);
        $("#upgradesWindowButtonGlow").css('background', 'url("includes/images/windowButtons.png") 78px 0');
    }
    this.glowUpgradesButton = function glowUpgradesButton() {
        this.upgradesButtonGlowing = true;
        $("#upgradesWindowButtonGlow").animate({ opacity:'+=0.5' }, 400);
        $("#upgradesWindowButtonGlow").animate({ opacity:'-=0.5' }, 400, function() { glowUpgradesButton(); });
    }

    this.save = function save() {
        localStorage.upgradesSaved = true;

        localStorage.footmanUpgradesPurchased = this.footmanUpgradesPurchased;
        localStorage.clericUpgradesPurchased = this.clericUpgradesPurchased;
        localStorage.commanderUpgradesPurchased = this.commanderUpgradesPurchased;
        localStorage.mageUpgradesPurchased = this.mageUpgradesPurchased;
        localStorage.assassinUpgradesPurchased = this.assassinUpgradesPurchased;
        localStorage.warlockUpgradesPurchased = this.warlockUpgradesPurchased;

        var upgradesPurchasedArray = new Array();
        var upgradesAvailableArray = new Array();

        for (var x = 0; x < this.upgrades.length; x++) {
            upgradesPurchasedArray.push(this.upgrades[x].purchased);
            upgradesAvailableArray.push(this.upgrades[x].available);
        }

        localStorage.upgradesPurchasedArray = JSON.stringify(upgradesPurchasedArray);
        localStorage.upgradesAvailableArray = JSON.stringify(upgradesAvailableArray);

        localStorage.clericSpecialUpgradesPurchased = this.clericSpecialUpgradesPurchased;
        localStorage.commanderSpecialUpgradesPurchased = this.commanderSpecialUpgradesPurchased;
        localStorage.mageSpecialUpgradesPurchased = this.mageSpecialUpgradesPurchased;
        localStorage.assassinSpecialUpgradesPurchased = this.assassinSpecialUpgradesPurchased;
        localStorage.warlockSpecialUpgradesPurchased = this.warlockSpecialUpgradesPurchased;

        localStorage.autoSellUpgradesPurchased = this.autoSellUpgradesPurchased;
    }

    this.load = function load() {
        if (localStorage.upgradesSaved != null) {
            this.footmanUpgradesPurchased = parseInt(localStorage.footmanUpgradesPurchased);
            this.clericUpgradesPurchased = parseInt(localStorage.clericUpgradesPurchased);
            this.commanderUpgradesPurchased = parseInt(localStorage.commanderUpgradesPurchased);
            this.mageUpgradesPurchased = parseInt(localStorage.mageUpgradesPurchased);
            if (localStorage.version == null) {
                this.assassinUpgradesPurchased = parseInt(localStorage.thiefUpgradesPurchased);
            }
            else {
                this.assassinUpgradesPurchased = parseInt(localStorage.assassinUpgradesPurchased);
            }
            this.warlockUpgradesPurchased = parseInt(localStorage.warlockUpgradesPurchased);

            var upgradesPurchasedArray = JSON.parse(localStorage.upgradesPurchasedArray);
            var upgradesAvailableArray = JSON.parse(localStorage.upgradesAvailableArray);

            if (localStorage.clericSpecialUpgradesPurchased != null) { this.clericSpecialUpgradesPurchased = localStorage.clericSpecialUpgradesPurchased; }
            if (localStorage.commanderSpecialUpgradesPurchased != null) { this.commanderSpecialUpgradesPurchased = localStorage.commanderSpecialUpgradesPurchased; }
            if (localStorage.mageSpecialUpgradesPurchased != null) { this.mageSpecialUpgradesPurchased = localStorage.mageSpecialUpgradesPurchased; }
            if (localStorage.assassinSpecialUpgradesPurchased != null) { this.assassinSpecialUpgradesPurchased = localStorage.assassinSpecialUpgradesPurchased; }
            else if (localStorage.thiefSpecialUpgradesPurchased != null) { this.assassinSpecialUpgradesPurchased = localStorage.thiefSpecialUpgradesPurchased; }
            if (localStorage.warlockSpecialUpgradesPurchased != null) { this.warlockSpecialUpgradesPurchased = localStorage.warlockSpecialUpgradesPurchased; }

            for (var x = 0; x < upgradesPurchasedArray.length; x++) {
                if (upgradesPurchasedArray[x]) {
                    this.upgradesPurchased++;
                    this.upgrades[x].purchased = upgradesPurchasedArray[x];
                }
                else if (upgradesAvailableArray[x]) {
                    this.upgrades[x].available = upgradesAvailableArray[x];
                }
            }

            // Show all the buttons for each available upgrade
            for (var x = 0; x < this.upgrades.length; x++) {
                if (this.upgrades[x].available && !this.upgrades[x].purchased) {
                    // Set the upgrade to available
                    var currentUpgrade = this.upgrades[x];
                    this.upgradesAvailable++;
                    this.purchaseButtonUpgradeIds.push(x);

                    // Create the button
                    var newDiv = document.createElement('div');
                    newDiv.id = 'upgradePurchaseButton' + this.upgradesAvailable;
                    newDiv.className = 'buyButton'
                    newDiv.style.top = this.nextTopPosition + 'px';
                    var id = this.upgradesAvailable;
                    newDiv.onmouseover = upgradeButtonMouseOverFactory(newDiv, id);
                    newDiv.onmousedown = upgradeButtonMouseDownFactory(id);
                    newDiv.onmouseup = upgradeButtonMouseOverFactory(newDiv, id);
                    newDiv.onmouseout = upgradeButtonMouseOutFactory(id)
                    var container = document.getElementById("upgradesBuyArea");
                    container.appendChild(newDiv);

                    this.nextTopPosition += this.topIncrement;

                    // Create the text container
                    var newDiv2 = document.createElement('div');
                    newDiv2.className = 'buyButtonArea';
                    newDiv.appendChild(newDiv2);

                    // Create the icon
                    var icon = document.createElement('div');
                    icon.className = 'buyButtonIcon button';
                    icon.style.background = 'url("includes/images/bigIcons.png") ' + currentUpgrade.iconSourceLeft + 'px ' + currentUpgrade.iconSourceTop + 'px';
                    newDiv2.appendChild(icon);

                    // Create the name
                    var newDiv3 = document.createElement('div');
                    newDiv3.id = 'upgradeName' + this.upgradesAvailable;
                    newDiv3.className = 'mercenaryName';
                    newDiv3.innerHTML = currentUpgrade.name;
                    newDiv2.appendChild(newDiv3);

                    // Transform the cost
                    var cost = currentUpgrade.cost;
                    cost = cost.formatMoney(0);

                    // Create the cost
                    newDiv3 = document.createElement('div');
                    newDiv3.id = 'upgradeCost' + this.upgradesAvailable;
                    newDiv3.className = 'mercenaryAmount';
                    newDiv3.innerHTML = cost;
                    newDiv3.style.left = '53px';
                    newDiv2.appendChild(newDiv3);

                    // Create the gold coin
                    newDiv3 = document.createElement('div');
                    newDiv3.id = 'upgradeCoin' + this.upgradesAvailable;
                    newDiv3.className = 'goldCoin';
                    newDiv3.style.position = 'absolute';
                    newDiv3.style.top = '28px';
                    newDiv3.style.width = '12px';
                    newDiv3.style.height = '12px';
                    newDiv3.style.left = '41px';
                    newDiv2.appendChild(newDiv3);
                }
            }

            // Show the auto selling checkboxes the player has unlocked
            if (this.upgrades[57].purchased) { $("#checkboxWhite").show(); }
            if (this.upgrades[58].purchased) { $("#checkboxGreen").show(); }
            if (this.upgrades[59].purchased) { $("#checkboxBlue").show(); }
            if (this.upgrades[60].purchased) { $("#checkboxPurple").show(); }
            if (this.upgrades[61].purchased) { $("#checkboxOrange").show(); }
            if (localStorage.autoSellUpgradesPurchased != null) { this.autoSellUpgradesPurchased = parseInt(localStorage.autoSellUpgradesPurchased); }
        }
    }
}

function upgradeButtonMouseOverFactory(obj, id) {
    return function () { upgradeButtonMouseOver(obj, id); }
}
function upgradeButtonMouseDownFactory(id) {
    return function () { upgradeButtonMouseDown(id); }
}
function upgradeButtonMouseOutFactory(id) {
    return function () { upgradeButtonMouseOut(id); }
}

function upgradeButtonMouseOver(obj, buttonId) {
    var upgradeId = game.upgradeManager.purchaseButtonUpgradeIds[buttonId - 1];
    var upgrade = game.upgradeManager.upgrades[upgradeId];
    $("#upgradePurchaseButton" + buttonId).css('background', 'url("includes/images/buyButtonBase.png") 0 92px');

    $("#otherTooltipTitle").html(upgrade.name);
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html(upgrade.description);
    $("#otherTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top - 70);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 40));
}

function upgradeButtonMouseDown(buttonId) {
    var upgradeId = game.upgradeManager.purchaseButtonUpgradeIds[buttonId - 1];
    var upgrade = game.upgradeManager.upgrades[upgradeId];
    $("#upgradePurchaseButton" + buttonId).css('background', 'url("includes/images/buyButtonBase.png") 0 46px');
    game.upgradeManager.purchaseUpgrade(buttonId - 1);
}

function upgradeButtonMouseOut(buttonId) {
    var upgradeId = game.upgradeManager.purchaseButtonUpgradeIds[buttonId - 1];
    var upgrade = game.upgradeManager.upgrades[upgradeId];
    $("#upgradePurchaseButton" + buttonId).css('background', 'url("includes/images/buyButtonBase.png") 0 0');
    $("#otherTooltip").hide();
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                     TOOLTIPS                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
function TooltipManager() {
    this.displayItemTooltip = function displayItemTooltip(item1, item2, item3, left, top, canSell) {
        // Get the item type
        var type = '';
        switch (item1.type) {
            case ItemType.HELM: type = "Helmet "; break;
            case ItemType.SHOULDERS: type = "Shoulders "; break;
            case ItemType.CHEST: type = "Chest "; break;
            case ItemType.LEGS: type = "Legs "; break;
            case ItemType.WEAPON: type = "Weapon "; break;
            case ItemType.GLOVES: type = "Gloves "; break;
            case ItemType.BOOTS: type = "Boots "; break;
            case ItemType.TRINKET: type = "Trinket "; break;
            case ItemType.OFF_HAND: type = "Off-Hand "; break;
        }

        // Get all the items stats
        var stats1 = '';
        var stats2 = '';
        if (item1.minDamage > 0) { stats1 += item1.minDamage + " - " + item1.maxDamage + " Damage"; }
        if (item1.armour > 0) { stats1 += (item1.armour + item1.armourBonus) + " Armour"; }
        if (item1.strength > 0) { stats2 += "<br>Strength: " + item1.strength; }
        if (item1.agility > 0) { stats2 += "<br>Agility: " + item1.agility; }
        if (item1.stamina > 0) { stats2 += "<br>Stamina: " + item1.stamina; }
        if (item1.health > 0) { stats2 += "<br>Health: " + item1.health; }
        if (item1.hp5 > 0) { stats2 += "<br>Hp5: " + item1.hp5; }
        if (item1.critChance > 0) { stats2 += "<br>Crit Chance: " + item1.critChance + "%"; }
        if (item1.critDamage > 0) { stats2 += "<br>Crit Damage: " + item1.critDamage + "%"; }
        if (item1.itemRarity > 0) { stats2 += "<br>Item Rarity: " + item1.itemRarity + "%"; }
        if (item1.goldGain > 0) { stats2 += "<br>Gold Gain: " + item1.goldGain + "%"; }
        if (item1.experienceGain > 0) { stats2 += "<br>Experience Gain: " + item1.experienceGain + "%"; }
        if (item1.evasion > 0) { stats2 += "<br>Evasion: " + item1.evasion; }
        var effect;
        var name;
        for (var x = 0; x < item1.effects.length; x++) {
            effect = item1.effects[x];
            stats2 += '<span class="yellowText">' + "<br>" + effect.getDescription();
        }

        // Set the item tooltip's colours to reflect the item's rarity
        if (item1.rarity == ItemRarity.COMMON) {
            $("#itemTooltip").css('border-color', '#fff'); $(".equipButton").css('border-color', '#fff');
            $("#itemTooltipTitle").html('<span class="whiteText">' + item1.name + '<br></span>');
        }
        if (item1.rarity == ItemRarity.UNCOMMON) {
            $("#itemTooltip").css('border-color', '#00ff05'); $(".equipButton").css('border-color', '#00ff05');
            $("#itemTooltipTitle").html('<span class="greenText">' + item1.name + '<br></span>');
        }
        if (item1.rarity == ItemRarity.RARE) {
            $("#itemTooltip").css('border-color', '#0005ff'); $(".equipButton").css('border-color', '#0005ff');
            $("#itemTooltipTitle").html('<span class="blueText">' + item1.name + '<br></span>');
        }
        if (item1.rarity == ItemRarity.EPIC) {
            $("#itemTooltip").css('border-color', '#b800af'); $(".equipButton").css('border-color', '#b800af');
            $("#itemTooltipTitle").html('<span class="purpleText">' + item1.name + '<br></span>');
        }
        if (item1.rarity == ItemRarity.LEGENDARY) {
            $("#itemTooltip").css('border-color', '#ff6a00'); $(".equipButton").css('border-color', '#ff6a00');
            $("#itemTooltipTitle").html('<span class="orangeText">' + item1.name + '<br></span>');
        }

        // Set the type
        $("#itemTooltipType").html(type + '<br>');
        // If there is an armour or damage bonus, change the armour/damage colour to green
        if (item1.armourBonus > 0) {
            $("#itemTooltipStats1").html('<span class="greenText">' + (item1.armour + item1.armourBonus) + '<span class="whiteText"> Armour<br></span></span>');
        }
        else if (item1.damageBonus > 0) {
            $("#itemTooltipStats1").html('<span class="greenText">' + (item1.minDamage + item1.damageBonus) + ' - ' + (item1.maxDamage + item1.damageBonus) + '<span class="whiteText"> Damage<br></span></span>');
        }
        else {
            $("#itemTooltipStats1").html(stats1 + '<br>');
        }
        // Set the rest of the tooltip
        $("#itemTooltipStats2").html(stats2);
        $("#itemTooltipSellValue").html(item1.sellValue);
        $("#itemTooltipLevel").html('Item Level ' + item1.level);
        $("#itemTooltipUseInfo").html('[Right-click to equip]');
        // If the player can sell this item from where it is then add that to the tooltip
        if (canSell) {
            $("#itemTooltipSellInfo").html('[Shift-click to sell]');
        }
        else { $("#itemTooltipSellInfo").html(''); }
        $("#itemTooltip").show();

        // Set the item tooltip's location
        var topReduction = document.getElementById("itemTooltip").scrollHeight;
        $("#itemTooltip").css('top', top - topReduction - 30);
        var leftReduction = document.getElementById("itemTooltip").scrollWidth;
        $("#itemTooltip").css('left', left - leftReduction - 30);

        // If there is another item then display the tooltip next to this one
        if (item2 != null) {
            // Set the text of the item tooltip
            var type2 = '';
            switch (item2.type) {
                case ItemType.HELM: type2 = "Helmet "; break;
                case ItemType.SHOULDERS: type2 = "Shoulders "; break;
                case ItemType.CHEST: type2 = "Chest "; break;
                case ItemType.LEGS: type2 = "Legs "; break;
                case ItemType.WEAPON: type2 = "Weapon "; break;
                case ItemType.GLOVES: type2 = "Gloves "; break;
                case ItemType.BOOTS: type2 = "Boots "; break;
                case ItemType.TRINKET: type2 = "Trinket "; break;
                case ItemType.OFF_HAND: type2 = "Off-Hand "; break;
            }
            stats1 = '';
            stats2 = '';
            if (item2.minDamage > 0) { stats1 += item2.minDamage + " - " + item2.maxDamage + " Damage"; }
            if (item2.armour > 0) { stats1 += (item2.armour + item2.armourBonus) + " Armour"; }
            if (item2.strength > 0) { stats2 += "<br>Strength: " + item2.strength; }
            if (item2.agility > 0) { stats2 += "<br>Agility: " + item2.agility; }
            if (item2.stamina > 0) { stats2 += "<br>Stamina: " + item2.stamina; }
            if (item2.health > 0) { stats2 += "<br>Health: " + item2.health; }
            if (item2.hp5 > 0) { stats2 += "<br>Hp5: " + item2.hp5; }
            if (item2.critChance > 0) { stats2 += "<br>Crit Chance: " + item2.critChance + "%"; }
            if (item2.critDamage > 0) { stats2 += "<br>Crit Damage: " + item2.critDamage + "%"; }
            if (item2.itemRarity > 0) { stats2 += "<br>Item Rarity: " + item2.itemRarity + "%"; }
            if (item2.goldGain > 0) { stats2 += "<br>Gold Gain: " + item2.goldGain + "%"; }
            if (item2.experienceGain > 0) { stats2 += "<br>Experience Gain: " + item2.experienceGain + "%"; }
            if (item2.evasion > 0) { stats2 += "<br>Evasion: " + item2.evasion; }
            var effect;
            var name;
            for (var x = 0; x < item2.effects.length; x++) {
                effect = item2.effects[x];
                stats2 += '<span class="yellowText">' + "<br>" + effect.getDescription();
            }

            $("#itemCompareTooltipExtra").html('Currently equipped');
            // Set the item tooltip's colours to reflect the item's rarity
            if (item2.rarity == ItemRarity.COMMON) {
                $("#itemCompareTooltip").css('border-color', '#fff'); $(".equipButton").css('border-color', '#fff');
                $("#itemCompareTooltipTitle").html('<span class="whiteText">' + item2.name + '<br></span>');
            }
            if (item2.rarity == ItemRarity.UNCOMMON) {
                $("#itemCompareTooltip").css('border-color', '#00ff05'); $(".equipButton").css('border-color', '#00ff05');
                $("#itemCompareTooltipTitle").html('<span class="greenText">' + item2.name + '<br></span>');
            }
            if (item2.rarity == ItemRarity.RARE) {
                $("#itemCompareTooltip").css('border-color', '#0005ff'); $(".equipButton").css('border-color', '#0005ff');
                $("#itemCompareTooltipTitle").html('<span class="blueText">' + item2.name + '<br></span>');
            }
            if (item2.rarity == ItemRarity.EPIC) {
                $("#itemCompareTooltip").css('border-color', '#b800af'); $(".equipButton").css('border-color', '#b800af');
                $("#itemCompareTooltipTitle").html('<span class="purpleText">' + item2.name + '<br></span>');
            }
            if (item2.rarity == ItemRarity.LEGENDARY) {
                $("#itemCompareTooltip").css('border-color', '#ff6a00'); $(".equipButton").css('border-color', '#ff6a00');
                $("#itemCompareTooltipTitle").html('<span class="orangeText">' + item2.name + '<br></span>');
            }

            $("#itemCompareTooltipType").html(type + '<br>');
            if (item2.armourBonus > 0) {
                $("#itemCompareTooltipStats1").html('<span class="greenText">' + (item2.armour + item2.armourBonus) + '<span class="whiteText"> Armour<br></span></span>');
            }
            else if (item2.damageBonus > 0) {
                $("#itemCompareTooltipStats1").html('<span class="greenText">' + (item2.minDamage + item2.damageBonus) + ' - ' + (item2.maxDamage + item2.damageBonus) + '<span class="whiteText"> Damage<br></span></span>');
            }
            else {
                $("#itemCompareTooltipStats1").html(stats1 + '<br>');
            }
            $("#itemCompareTooltipStats2").html(stats2);
            $("#itemCompareTooltipSellValue").html(item2.sellValue);
            $("#itemCompareTooltipLevel").html('Item Level ' + item2.level);
            $("#itemCompareTooltipUseInfo").html('');
            $("#itemCompareTooltipSellInfo").html('');
            $("#itemCompareTooltip").show();

            // Set the item tooltip's location
            $("#itemCompareTooltip").css('top', top - topReduction - 30);
            leftReduction += document.getElementById("itemCompareTooltip").scrollWidth;
            $("#itemCompareTooltip").css('left', (left - leftReduction - 40));

            // If there is a 3rd item display that tooltip next to the second one
            if (item3 != null) {
                // Set the text of the item tooltip
                var type3 = 'Trinket ';
                var item3 = game.equipment.trinket2();
                stats1 = '';
                stats2 = '';
                if (item3.minDamage > 0) { stats1 += item3.minDamage + " - " + item3.maxDamage + " Damage"; }
                if (item3.armour > 0) { stats1 += (item3.armour + item3.armourBonus) + " Armour"; }
                if (item3.strength > 0) { stats2 += "<br>Strength: " + item3.strength; }
                if (item3.agility > 0) { stats2 += "<br>Agility: " + item3.agility; }
                if (item3.stamina > 0) { stats2 += "<br>Stamina: " + item3.stamina; }
                if (item3.health > 0) { stats2 += "<br>Health: " + item3.health; }
                if (item3.hp5 > 0) { stats2 += "<br>Hp5: " + item3.hp5; }
                if (item3.critChance > 0) { stats2 += "<br>Crit Chance: " + item3.critChance + "%"; }
                if (item3.critDamage > 0) { stats2 += "<br>Crit Damage: " + item3.critDamage + "%"; }
                if (item3.itemRarity > 0) { stats2 += "<br>Item Rarity: " + item3.itemRarity + "%"; }
                if (item3.goldGain > 0) { stats2 += "<br>Gold Gain: " + item3.goldGain + "%"; }
                if (item3.experienceGain > 0) { stats2 += "<br>Experience Gain: " + item3.experienceGain + "%"; }
                if (item3.evasion > 0) { stats2 += "<br>Evasion: " + item3.evasion; }
                var effect;
                var name;
                for (var x = 0; x < item3.effects.length; x++) {
                    effect = item3.effects[x];
                    stats2 += '<span class="yellowText">' + "<br>" + effect.getDescription();
                }

                $("#itemCompareTooltip2Extra").html('Currently equipped');
                // Set the item tooltip's colours to reflect the item's rarity
                if (item3.rarity == ItemRarity.COMMON) {
                    $("#itemCompareTooltip2").css('border-color', '#fff'); $(".equipButton").css('border-color', '#fff');
                    $("#itemCompareTooltip2Title").html('<span class="whiteText">' + item3.name + '<br></span>');
                }
                if (item3.rarity == ItemRarity.UNCOMMON) {
                    $("#itemCompareTooltip2").css('border-color', '#00ff05'); $(".equipButton").css('border-color', '#00ff05');
                    $("#itemCompareTooltip2Title").html('<span class="greenText">' + item3.name + '<br></span>');
                }
                if (item3.rarity == ItemRarity.RARE) {
                    $("#itemCompareTooltip2").css('border-color', '#0005ff'); $(".equipButton").css('border-color', '#0005ff');
                    $("#itemCompareTooltip2Title").html('<span class="blueText">' + item3.name + '<br></span>');
                }
                if (item3.rarity == ItemRarity.EPIC) {
                    $("#itemCompareTooltip2").css('border-color', '#b800af'); $(".equipButton").css('border-color', '#b800af');
                    $("#itemCompareTooltip2Title").html('<span class="purpleText">' + item3.name + '<br></span>');
                }
                if (item3.rarity == ItemRarity.LEGENDARY) {
                    $("#itemCompareTooltip2").css('border-color', '#ff6a00'); $(".equipButton").css('border-color', '#ff6a00');
                    $("#itemCompareTooltip2Title").html('<span class="orangeText">' + item3.name + '<br></span>');
                }

                $("#itemCompareTooltip2Type").html(type + '<br>');
                if (item3.armourBonus > 0) {
                    $("#itemCompareTooltip2Stats1").html('<span class="greenText">' + (item3.armour + item3.armourBonus) + '<span class="whiteText"> Armour<br></span></span>');
                }
                else if (item3.damageBonus > 0) {
                    $("#itemCompareTooltip2Stats1").html('<span class="greenText">' + (item3.minDamage + item3.damageBonus) + ' - ' + (item3.maxDamage + item3.damageBonus) + '<span class="whiteText"> Damage<br></span></span>');
                }
                else {
                    $("#itemCompareTooltip2Stats1").html(stats1 + '<br>');
                }
                $("#itemCompareTooltip2Stats2").html(stats2);
                $("#itemCompareTooltip2SellValue").html(item3.sellValue);
                $("#itemCompareTooltip2Level").html('Item Level ' + item3.level);
                $("#itemCompareTooltip2UseInfo").html('');
                $("#itemCompareTooltip2SellInfo").html('');
                $("#itemCompareTooltip2").show();

                // Set the item tooltip's location
                $("#itemCompareTooltip2").css('top', top - topReduction - 30);
                leftReduction += document.getElementById("itemCompareTooltip2").scrollWidth;
                $("#itemCompareTooltip2").css('left', left - leftReduction - 50);
            }
        }
    }

    this.displayBasicTooltip = function displayBasicTooltip(obj, text) {
        $("#basicTooltipText").html(text);
        $("#basicTooltip").show();

        // Set the tooltip's location
        var rect = obj.getBoundingClientRect();
        $("#basicTooltip").css('top', rect.top - 70);
        var leftReduction = document.getElementById("basicTooltip").scrollWidth;
        $("#basicTooltip").css('left', (rect.left - leftReduction - 40));
    }
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                       GAME                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
function Game() {
    this.version = 0.2;
    this.loading = false;
    this.loadingTextInterval = 0;
    this.loadInterval = 0;

    // Player
    this.player = new Player();
    this.inventory = new Inventory();
    this.equipment = new Equipment();
    this.statGenerator = new StatGenerator();
    this.nameGenerator = new NameGenerator();
    this.statUpgradesManager = new StatUpgradesManager();

    // Other
    this.tooltipManager = new TooltipManager();
    this.questsManager = new QuestsManager();
    this.eventManager = new EventManager();
    this.tutorialManager = new TutorialManager();
    this.stats = new Stats();
    this.options = new Options();

    // Combat
    this.inBattle = false;
    this.battleLevel = 1;
    this.battleDepth = 1;

    // Mercenaries
    this.mercenaryManager = new mercenaryManager();

    // Upgrades
    this.upgradeManager = new UpgradeManager();

    // Particles
    this.particleManager = new ParticleManager();

    // Monsters
    this.monsterCreator = new MonsterCreator();
    this.monster = this.monsterCreator.createRandomMonster(
        this.battleLevel,
        this.monsterCreator.calculateMonsterRarity(this.battleLevel, this.battleDepth));
    this.displayMonsterHealth = false;

    // Items
    this.itemCreator = new ItemCreator();

    // Saving/Loading
    this.saveDelay = 10000;
    this.saveTimeRemaining = this.saveDelay;

    this.initialize = function initialize() {
        this.beginLoading();
        this.tutorialManager.initialize();
        this.mercenaryManager.initialize();
        this.upgradeManager.initialize();
        this.particleManager.initialize();

        this.load();

        document.getElementById("version").innerHTML = "Version " + this.version;
    }

    this.beginLoading = function beginLoading() {
        this.loading = true;
        this.loadingTextInterval = setInterval(function () {
            this.loadingInterval++;
            if (this.loadingInterval > 2) {
                this.loadingInterval = 0;
                $("#loadingText").html('Loading.');
            }
            else {
                $("#loadingText").append('.');
            }
        }, 500);
    }

    this.finishLoading = function finishLoading() {
        this.loading = false;
        clearInterval(this.loadingTextInterval);
        $("#loadingArea").hide();
    }

    this.allowBattle = function allowBattle() {
        enterBattleButtonReset();
    }

    this.disallowBattle = function disallowBattle() {
        this.leaveBattle();
        $("#enterBattleButton").css('background', 'url("includes/images/stoneButton1.png") 0 25px');
    }

    this.enterBattle = function enterBattle() {
        this.inBattle = true;
        // Create a new monster
        this.monster = this.monsterCreator.createRandomMonster(
            this.battleLevel,
            this.monsterCreator.calculateMonsterRarity(this.battleLevel, this.battleDepth));

        $("#enterBattleButton").css('background', 'url("includes/images/stoneButton1.png") 0 50px');
        $("#leaveBattleButton").show();
        $("#leaveBattleButton").css('background', 'url("includes/images/stoneButton1.png") 0 0px');
        $("#monsterHealthBarArea").show();
        game.tutorialManager.battleButtonClicked = true;

        // Hide the battle level buttons
        $("#battleLevelDownButton").hide();
        $("#battleLevelUpButton").hide();

        // Show the action buttons
        $("#attackButton").show();
    }

    this.leaveBattle = function leaveBattle() {
        // Leave the battle and update the interface
        $("#leaveBattleButton").css('background', 'url("includes/images/stoneButton1.png") 0 50px');
        this.inBattle = false;
        $("#enterBattleButton").css('background', 'url("includes/images/stoneButton1.png") 0 0px');
        $("#monsterHealthBarArea").hide();
        $("#leaveBattleButton").hide();

        // Reset the battle depth
        this.resetBattle();

        // Update the tutorial if it is active
        if (this.tutorialManager.currentTutorial == 4) {
            this.tutorialManager.leaveBattleButtonPressed = true;
        }

        // Show the battle level buttons if the player is higher than level 1
        if (this.player.level > 1) {
            $("#battleLevelDownButton").show();
            $("#battleLevelUpButton").show();
        }

        // Hide the attack button and debuffs
        $("#attackButton").hide();
        $("#monsterBleedingIcon").hide();
        $("#monsterBurningIcon").hide();
        $("#monsterChilledIcon").hide();
    }

    this.attack = function attack() {
        // Update the player and monster
        this.player.updateDebuffs();
        this.monster.updateDebuffs();

        // Attack the monster if the player can attack
        var monstersDamageTaken = 0;
        if (game.player.canAttack) {
            // Calculate how many attacks the player will do
            var attackAmount = 1;
            var successfulAttacks = 0;
            if (this.player.attackType == AttackType.DOUBLE_STRIKE) { attackAmount++; }

            for (var x = 0; x < attackAmount; x++) {
                // Calculate the damage
                var playerMinDamage = this.player.getMinDamage();
                var playerMaxDamage = this.player.getMaxDamage();
                var playerDamage = playerMinDamage + (Math.random() * (playerMaxDamage - playerMinDamage));

                // If the player is using power strike, multiply the damage
                if (this.player.attackType == AttackType.POWER_STRIKE) {
                    playerDamage *= 1.5;
                }

                // See if the player will crit
                var criticalHappened = false;
                if (this.player.getCritChance() >= (Math.random() * 100)) {
                    playerDamage *= (this.player.getCritDamage() / 100);
                    criticalHappened = true;
                }

                // If the player has any crushing blows effects then deal the damage from those effects
                var crushingBlowsEffects = game.player.getEffectsOfType(EffectType.CRUSHING_BLOWS);
                var crushingBlowsDamage = 0;
                if (crushingBlowsEffects.length > 0) {
                    for (var y = 0; y < crushingBlowsEffects.length; y++) {
                        crushingBlowsDamage += crushingBlowsEffects[y].value;
                    }
                    if (crushingBlowsDamage > 0) {
                        this.monster.takeDamage((crushingBlowsDamage / 100) * this.monster.health, false, false);
                    }
                }
                this.monster.takeDamage(playerDamage, criticalHappened, true);
                this.player.useAbilities();
                successfulAttacks++;

                // If the player has any Swiftness effects, see if the player generates any extra attacks
                var swiftnessEffects = game.player.getEffectsOfType(EffectType.SWIFTNESS);
                for (var z = 0; z < swiftnessEffects.length; z++) {
                    // Try to generate an extra attack
                    if (Math.random() < swiftnessEffects[z].chance / 100) {
                        // Calculate the damage
                        playerMinDamage = this.player.getMinDamage();
                        playerMaxDamage = this.player.getMaxDamage();
                        playerDamage = playerMinDamage + (Math.random() * (playerMaxDamage - playerMinDamage));

                        // If the player is using power strike, multiply the damage
                        if (this.player.attackType == AttackType.POWER_STRIKE) {
                            playerDamage *= 1.5;
                        }

                        // See if the player will crit
                        criticalHappened = false;
                        if (this.player.getCritChance() >= (Math.random() * 100)) {
                            playerDamage *= (this.player.getCritDamage() / 100);
                            criticalHappened = true;
                        }

                        // If the player has any crushing blows effects then deal the damage from those effects
                        crushingBlowsEffects = game.player.getEffectsOfType(EffectType.CRUSHING_BLOWS);
                        crushingBlowsDamage = 0;
                        if (crushingBlowsEffects.length > 0) {
                            for (var y = 0; y < crushingBlowsEffects.length; y++) {
                                crushingBlowsDamage += crushingBlowsEffects[y].value;
                            }
                            if (crushingBlowsDamage > 0) {
                                this.monster.takeDamage((crushingBlowsDamage / 100) * this.monster.health, false, false);
                            }
                        }
                        this.monster.takeDamage(playerDamage, criticalHappened, true);
                        this.player.useAbilities();
                        successfulAttacks++;
                    }
                }
            }

            // Try to trigger on-hit effects for every attack
            var pillagingEffects = this.player.getEffectsOfType(EffectType.PILLAGING);
            var nourishmentEffects = this.player.getEffectsOfType(EffectType.NOURISHMENT);
            var berserkingEffects = this.player.getEffectsOfType(EffectType.BERSERKING);
            for (var x = 0; x < successfulAttacks; x++) {
                for (var y = 0; y < pillagingEffects.length; y++) {
                    if (Math.random() < pillagingEffects[y].chance / 100) {
                        game.player.gainGold(pillagingEffects[y].value, true);
                    }
                }
                for (var y = 0; y < nourishmentEffects.length; y++) {
                    if (Math.random() < nourishmentEffects[y].chance / 100) {
                        game.player.heal(nourishmentEffects[y].value);
                    }
                }
                for (var y = 0; y < berserkingEffects.length; y++) {
                    if (Math.random() < berserkingEffects[y].chance / 100) {
                        game.monster.takeDamage(berserkingEffects[y].value, false, false);
                    }
                }
            }
        }

        // Have the monster attack if it can and did not die
        var playersDamageTaken = 0;
        if (this.monster.canAttack && this.monster.alive) {
            // See if the player will dodge the attack
            if (Math.random() >= (this.player.calculateEvasionChance() / 100)) {
                var monsterDamage = this.monster.damage;
                this.player.takeDamage(monsterDamage);
                playersDamageTaken = monsterDamage;
            }
        }

        if (this.monster.alive == false) {
            // Add the kill to any quests that require it
            this.questsManager.updateKillCounts(this.monster.level);

            // Get the loot and experience from the monster and reward it to the player
            var loot = this.monster.getRandomLoot();
            this.player.gainGold(loot.gold, true);
            this.stats.goldFromMonsters += this.player.lastGoldGained;
            this.player.gainExperience(this.monster.experienceWorth, true);
            this.stats.experienceFromMonsters += this.player.lastExperienceGained;
            if (loot.item != null) {
                this.inventory.lootItem(loot.item);
            }

            // Create particles for the loot, experience and kill
            this.particleManager.createParticle(this.player.lastGoldGained.toFixed(2), ParticleType.GOLD);
            this.particleManager.createParticle(this.player.lastExperienceGained.toFixed(2), ParticleType.EXP_ORB);
            this.particleManager.createParticle(null, ParticleType.SKULL);

            // Create a new monster
            this.monster = this.monsterCreator.createRandomMonster(
                this.battleLevel,
                this.monsterCreator.calculateMonsterRarity(this.battleLevel, this.battleDepth));

            // Hide the debuff icons for the monster
            $("#monsterBleedingIcon").hide();
            $("#monsterBurningIcon").hide();
            $("#monsterChilledIcon").hide();

            // Increase the depth of the battle
            this.battleDepth++;
        }
    }

    this.maxBattleLevelReached = function maxBattleLevelReached() {
        if (this.player.level == this.battleLevel) {
            return true;
        }
        else { return false; }
    }

    this.increaseBattleLevel = function increaseBattleLevel() {
        if (this.player.level > this.battleLevel) {
            this.battleLevel++;
            this.displayAlert("Battle Level " + game.battleLevel);
        }
    }

    this.decreaseBattleLevel = function decreaseBattleLevel() {
        if (this.battleLevel != 1) {
            this.battleLevel--;
            this.displayAlert("Battle Level " + game.battleLevel);
        }
    }

    this.resetBattle = function resetBattle() {
        this.battleDepth = 1;
    }

    this.displayAlert = function displayAlert(text) {
        $("#battleLevelText").stop(true);
        var battleLevelText = document.getElementById("battleLevelText");
        battleLevelText.style.opacity = '1';
        battleLevelText.style.top = '600px';
        battleLevelText.innerHTML = text;
        $("#battleLevelText").animate({ top:'-=50px', opacity:'0' }, 1000);
    }

    // Triggered when the Level Up button is clicked
    this.displayLevelUpWindow = function displayLevelUpWindow() {
        // Hide the Level Up button
        $("#levelUpButton").hide();

        // Display the stat upgrade window or the ability upgrade window depending on the level
        // If the number is divisible by 5 then the player can choose an ability
        if ((this.player.skillPointsSpent + 2) % 5 == 0) {
            $("#abilityUpgradesWindow").show();
        }
        // Else the player can upgrade a stat
        else {
            // Set the upgrade names on the window's buttons
            var upgrades = this.statUpgradesManager.upgrades[0];
            $("#statUpgradesWindow").show();

            switch (upgrades[0].type) {
                case StatUpgradeType.DAMAGE:            document.getElementById("statUpgradeName1").innerHTML = "+" + upgrades[0].amount + "% Damage"; break;
                case StatUpgradeType.STRENGTH:          document.getElementById("statUpgradeName1").innerHTML = "+" + upgrades[0].amount + " Strength"; break;
                case StatUpgradeType.AGILITY:           document.getElementById("statUpgradeName1").innerHTML = "+" + upgrades[0].amount + " Agility"; break;
                case StatUpgradeType.STAMINA:           document.getElementById("statUpgradeName1").innerHTML = "+" + upgrades[0].amount + " Stamina"; break;
                case StatUpgradeType.ARMOUR:            document.getElementById("statUpgradeName1").innerHTML = "+" + upgrades[0].amount + " Armour"; break;
                case StatUpgradeType.HP5:               document.getElementById("statUpgradeName1").innerHTML = "+" + upgrades[0].amount + " Hp5"; break;
                case StatUpgradeType.CRIT_DAMAGE:       document.getElementById("statUpgradeName1").innerHTML = "+" + upgrades[0].amount + "% Crit Damage"; break;
                case StatUpgradeType.ITEM_RARITY:         document.getElementById("statUpgradeName1").innerHTML = "+" + upgrades[0].amount + "% Item Rarity"; break;
                case StatUpgradeType.GOLD_GAIN:         document.getElementById("statUpgradeName1").innerHTML = "+" + upgrades[0].amount + "% Gold Gain"; break;
                case StatUpgradeType.EXPERIENCE_GAIN:   document.getElementById("statUpgradeName1").innerHTML = "+" + upgrades[0].amount + "% Experience Gain"; break;
            }

            switch (upgrades[1].type) {
                case StatUpgradeType.DAMAGE:            document.getElementById("statUpgradeName2").innerHTML = "+" + upgrades[1].amount + "% Damage"; break;
                case StatUpgradeType.STRENGTH:          document.getElementById("statUpgradeName2").innerHTML = "+" + upgrades[1].amount + " Strength"; break;
                case StatUpgradeType.AGILITY:           document.getElementById("statUpgradeName2").innerHTML = "+" + upgrades[1].amount + " Agility"; break;
                case StatUpgradeType.STAMINA:           document.getElementById("statUpgradeName2").innerHTML = "+" + upgrades[1].amount + " Stamina"; break;
                case StatUpgradeType.ARMOUR:            document.getElementById("statUpgradeName2").innerHTML = "+" + upgrades[1].amount + " Armour"; break;
                case StatUpgradeType.HP5:               document.getElementById("statUpgradeName2").innerHTML = "+" + upgrades[1].amount + " Hp5"; break;
                case StatUpgradeType.CRIT_DAMAGE:       document.getElementById("statUpgradeName2").innerHTML = "+" + upgrades[1].amount + "% Crit Damage"; break;
                case StatUpgradeType.ITEM_RARITY:         document.getElementById("statUpgradeName2").innerHTML = "+" + upgrades[1].amount + "% Item Rarity"; break;
                case StatUpgradeType.GOLD_GAIN:         document.getElementById("statUpgradeName2").innerHTML = "+" + upgrades[1].amount + "% Gold Gain"; break;
                case StatUpgradeType.EXPERIENCE_GAIN:   document.getElementById("statUpgradeName2").innerHTML = "+" + upgrades[1].amount + "% Experience Gain"; break;
            }

            switch (upgrades[2].type) {
                case StatUpgradeType.DAMAGE:            document.getElementById("statUpgradeName3").innerHTML = "+" + upgrades[2].amount + "% Damage"; break;
                case StatUpgradeType.STRENGTH:          document.getElementById("statUpgradeName3").innerHTML = "+" + upgrades[2].amount + " Strength"; break;
                case StatUpgradeType.AGILITY:           document.getElementById("statUpgradeName3").innerHTML = "+" + upgrades[2].amount + " Agility"; break;
                case StatUpgradeType.STAMINA:           document.getElementById("statUpgradeName3").innerHTML = "+" + upgrades[2].amount + " Stamina"; break;
                case StatUpgradeType.ARMOUR:            document.getElementById("statUpgradeName3").innerHTML = "+" + upgrades[2].amount + " Armour"; break;
                case StatUpgradeType.HP5:               document.getElementById("statUpgradeName3").innerHTML = "+" + upgrades[2].amount + " Hp5"; break;
                case StatUpgradeType.CRIT_DAMAGE:       document.getElementById("statUpgradeName3").innerHTML = "+" + upgrades[2].amount + "% Crit Damage"; break;
                case StatUpgradeType.ITEM_RARITY:         document.getElementById("statUpgradeName3").innerHTML = "+" + upgrades[2].amount + "% Item Rarity"; break;
                case StatUpgradeType.GOLD_GAIN:         document.getElementById("statUpgradeName3").innerHTML = "+" + upgrades[2].amount + "% Gold Gain"; break;
                case StatUpgradeType.EXPERIENCE_GAIN:   document.getElementById("statUpgradeName3").innerHTML = "+" + upgrades[2].amount + "% Experience Gain"; break;
            }
        }
    }

    this.calculatePowerShardReward = function calculatePowerShardReward() {
        var powerShardsTotal = Math.floor((Math.sqrt(1 + 8 * (this.stats.goldEarned / 1000000000000)) - 1) / 2);
        var powerShardsReward = powerShardsTotal - this.player.powerShards;
        if (powerShardsReward < 0) { powerShardsReward = 0; }
        return powerShardsReward;
    }

    this.save = function save() {
        if (typeof (Storage) !== "undefined") {
            localStorage.version = this.version;
            this.tutorialManager.save();
            this.inventory.save();
            this.equipment.save();
            this.player.save();
            this.questsManager.save();
            this.mercenaryManager.save();
            this.upgradeManager.save();
            this.statUpgradesManager.save();
            this.stats.save();
            this.options.save();

            localStorage.battleLevel = this.battleLevel;
        }
    }

    this.load = function load() {
        if (typeof (Storage) !== "undefined") {
            this.tutorialManager.load();
            this.inventory.load();
            this.equipment.load();
            this.player.load();
            this.questsManager.load();
            this.mercenaryManager.load();
            this.upgradeManager.load();
            this.statUpgradesManager.load();
            this.stats.load();
            this.options.load();

            // If the player is higher than level 2 then show the battle level buttons
            if (this.player.level > 1) {
                $("#battleLevelUpButton").show();
                $("#battleLevelDownButton").show();
            }

            if (localStorage.battleLevel != null) { this.battleLevel = parseInt(localStorage.battleLevel); }
            if (this.battleLevel > 1) {
                $("#battleLevelDownButton").css('background', 'url("includes/images/battleLevelButton.png") 0 0px');
            }
            if (this.maxBattleLevelReached()) {
                $("#battleLevelUpButton").css('background', 'url("includes/images/battleLevelButton.png") 0 25px');
            }

            this.monster = this.monsterCreator.createRandomMonster(
                this.battleLevel,
                this.monsterCreator.calculateMonsterRarity(this.battleLevel, this.battleDepth));
        }
    }

    this.reset = function reset() {
        localStorage.clear();
        // Player
        this.player = new Player();
        this.inventory = new Inventory();
        this.equipment = new Equipment();
        this.statGenerator = new StatGenerator();
        this.nameGenerator = new NameGenerator();
        this.statUpgradesManager = new StatUpgradesManager();

        // Other
        this.questsManager = new QuestsManager();
        this.eventManager = new EventManager();
        this.tutorialManager = new TutorialManager();
        this.stats = new Stats();

        // Combat
        this.inBattle = false;
        this.battleLevel = 1;
        this.battleDepth = 1;

        // Mercenaries
        this.mercenaryManager = new mercenaryManager();

        // Upgrades
        // Remove all the upgrade purchase buttons
        var currentElement;
        for (var x = 0; x < this.upgradeManager.upgradesAvailable; x++) {
            currentElement = document.getElementById('upgradePurchaseButton' + (x + 1));
            currentElement.parentNode.removeChild(currentElement);
        }
        this.upgradeManager = new UpgradeManager();

        // Particles
        this.particleManager = new ParticleManager();

        // Monsters
        this.monsterCreator = new MonsterCreator();
        this.monster = this.monsterCreator.createRandomMonster(
            this.battleLevel,
            this.monsterCreator.calculateMonsterRarity(this.battleLevel, this.battleDepth));

        // Items
        this.itemCreator = new ItemCreator();
        // Reset all the inventory and equipment slots
        for (var x = 0; x < this.inventory.slots.length; x++) {
            $("#inventoryItem" + (x + 1)).css('background', 'url("includes/images/NULL.png")');
        }
        for (var x = 0; x < this.equipment.slots.length; x++) {
            $(".equipItem" + (x + 1)).css('background', 'url("includes/images/NULL.png")');
        }

        this.initialize();

        $("#leaveBattleButton").hide();
        $("#battleLevelDownButton").hide();
        $("#battleLevelUpButton").hide();
        $("#monsterHealthBarArea").hide();
        $("#levelUpButton").hide();
        $("#expBarArea").hide();
        $("#attackButton").hide();
        $("#powerStrikeButton").hide();
        $(".characterWindowButton").hide();
        $(".mercenariesWindowButton").hide();
        $(".upgradesWindowButton").hide();
        $("#upgradesWindowButtonGlow").hide();
        $(".questsWindowButton").hide();
        $("#questsWindowButtonGlow").hide();
        $(".inventoryWindowButton").hide();
        $("#tutorialArea").show();

        $("#inventoryWindow").hide();
        $("#characterWindow").hide();
        $("#upgradesWindow").hide();
        $("#mercenariesWindow").hide();
        $("#questsWindow").hide();

        $("#resurrectionBarArea").hide();
        $("#gps").css('color', '#ffd800');
        $("#enterBattleButton").css('background', 'url("includes/images/stoneButton1.png") 0 0px');

        $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 150px 0');
        $("#checkboxWhite").hide();
        $("#checkboxGreen").hide();
        $("#checkboxBlue").hide();
        $("#checkboxPurple").hide();
        $("#checkboxOrange").hide();

        // Reset the mercenary amounts and prices to default
        document.getElementById("footmanCost").innerHTML = this.mercenaryManager.footmanPrice.formatMoney(0);
        document.getElementById("footmenOwned").innerHTML = this.mercenaryManager.footmenOwned;
        document.getElementById("clericCost").innerHTML = this.mercenaryManager.clericPrice.formatMoney(0);
        document.getElementById("clericsOwned").innerHTML = this.mercenaryManager.clericsOwned;
        document.getElementById("commanderCost").innerHTML = this.mercenaryManager.commanderPrice.formatMoney(0);
        document.getElementById("commandersOwned").innerHTML = this.mercenaryManager.commandersOwned;
        document.getElementById("mageCost").innerHTML = this.mercenaryManager.magePrice.formatMoney(0);
        document.getElementById("magesOwned").innerHTML = this.mercenaryManager.magesOwned;
        document.getElementById("assassinCost").innerHTML = this.mercenaryManager.assassinPrice.formatMoney(0);
        document.getElementById("assassinsOwned").innerHTML = this.mercenaryManager.assassinsOwned;
        document.getElementById("warlockCost").innerHTML = this.mercenaryManager.warlockPrice.formatMoney(0);
        document.getElementById("warlocksOwned").innerHTML = this.mercenaryManager.warlocksOwned;
    }

    this.update = function update() {
        var newDate = new Date();
        var ms = (newDate.getTime() - oldDate.getTime());

        // Check if the player is dead
        if (!this.player.alive) {
            // If the player is not already resurrecting then start resurrection
            if (!this.player.resurrecting) {
                $("#resurrectionBarArea").show();
                this.player.resurrecting = true;
                this.player.resurrectionTimeRemaining = this.player.resurrectionTimer;
                this.disallowBattle();
                this.player.health = 0;
                this.mercenaryManager.addGpsReduction(this.mercenaryManager.deathGpsReductionAmount, this.mercenaryManager.deathGpsReductionDuration);
            }
            // Else update the resurrecting
            else {
                // Update the timer
                this.player.resurrectionTimeRemaining -= (ms / 1000);

                // Update the bar
                $("#resurrectionBar").css('width', (200 * (this.player.resurrectionTimeRemaining / this.player.resurrectionTimer)));
                $("#resurrectionBar").css('height', '23');
                document.getElementById("resurrectionBarText").innerHTML = "Resurrecting: " + Math.floor((this.player.resurrectionTimeRemaining / this.player.resurrectionTimer) * 100) + "%";

                // Check if the player is now alive
                if (this.player.resurrectionTimeRemaining <= 0) {
                    // Make the player alive
                    this.player.resurrecting = false;
                    this.player.health = 1;
                    this.player.alive = true;

                    // Hide the resurrection bar
                    $("#resurrectionBarArea").hide();

                    // Display the other elements
                    this.allowBattle();
                }
            }
        }
        // Else if the player is alive
        else {
            // Regenerate the player's health
            this.player.regenerateHealth(ms);
        }

        this.mercenaryManager.update(ms);
        this.inventory.update(ms);
        this.updateInterface(ms);
        this.questsManager.update();
        this.eventManager.update(ms);
        this.tutorialManager.update();
        this.player.update(ms);

        // Save the progress if enough time has passed
        game.saveTimeRemaining -= ms;
        if (game.saveTimeRemaining <= 0) {
            game.saveTimeRemaining = game.saveDelay;
            game.save();
        }

        oldDate = newDate;
    }

    this.updateInterface = function updateInterface(ms) {
        // Update the player's health bar
        var hpBar = $("#playerHealthBar");
        hpBar.css('width', 198 * (this.player.health / this.player.getMaxHealth()));
        hpBar.css('height', '23');
        document.getElementById("playerHealthBarText").innerHTML = Math.floor(this.player.health) + '/' + Math.floor(this.player.getMaxHealth());

        // Update the player's exp bar
        var expBar = $("#expBar");
        expBar.css('width', 718 * (this.player.experience / this.player.experienceRequired));
        expBar.css('height', '13');
        document.getElementById("expBarText").innerHTML = Math.floor(this.player.experience) + '/' + this.player.experienceRequired;

        // Update the monster's health bar
        hpBar = $("#monsterHealthBar");
        hpBar.css('width', 198 * (this.monster.health / this.monster.maxHealth));
        hpBar.css('height', '23');
        hpBar.css('color', game.monsterCreator.getRarityColour(this.monster.rarity));

        // Set the monster's name or health on the screen
        if (this.displayMonsterHealth) {
            document.getElementById("monsterName").innerHTML = Math.floor(this.monster.health) + '/' + Math.floor(this.monster.maxHealth);
            // Set the colour
            $("#monsterName").css('color', game.monsterCreator.getRarityColour(this.monster.rarity));
        }
        else {
            document.getElementById("monsterName").innerHTML = "(Lv" + this.monster.level + ") " + this.monster.name;
            // Set the colour
            $("#monsterName").css('color', this.monsterCreator.getRarityColour(this.monster.rarity));
        }

        // Update the gold and experience amounts
        document.getElementById("goldAmount").innerHTML = this.player.gold.formatMoney(2);

        // Move the gold icon and gold depending on the amount of gold the player has
        var leftReduction = document.getElementById("goldAmount").scrollWidth / 2;
        $("#goldAmount").css('left', (($("#gameArea").width() / 2) - leftReduction) + 'px');
        $("#goldCoin").css('left', (($("#gameArea").width() / 2) - leftReduction - 21) + 'px');

        // Update the upgrades
        this.upgradeManager.update();

        // Update the particles
        this.particleManager.update(ms);

        // Update the player's stats
        document.getElementById("levelValue").innerHTML = this.player.level;
        document.getElementById("healthValue").innerHTML = Math.floor(this.player.health) + '/' + Math.floor(this.player.getMaxHealth());
        document.getElementById("hp5Value").innerHTML = this.player.getHp5().toFixed(2);
        document.getElementById("damageValue").innerHTML = Math.floor(this.player.getMinDamage()) + ' - ' + Math.floor(this.player.getMaxDamage());
        document.getElementById("damageBonusValue").innerHTML = this.player.getDamageBonus() + '%';
        document.getElementById("armourValue").innerHTML = this.player.getArmour().toFixed(2) + ' (' + this.player.calculateDamageReduction().toFixed(2) + '%)';
        document.getElementById("evasionValue").innerHTML = this.player.getEvasion().toFixed(2) + ' (' + this.player.calculateEvasionChance().toFixed(2) + '%)';

        document.getElementById("strengthValue").innerHTML = this.player.getStrength();
        document.getElementById("staminaValue").innerHTML = this.player.getStamina();
        document.getElementById("agilityValue").innerHTML = this.player.getAgility();
        document.getElementById("critChanceValue").innerHTML = this.player.getCritChance().toFixed(2) + '%';
        document.getElementById("critDamageValue").innerHTML = this.player.getCritDamage().toFixed(2) + '%';

        document.getElementById("itemRarityValue").innerHTML = this.player.getItemRarity().toFixed(2) + '%';
        document.getElementById("goldGainValue").innerHTML = this.player.getGoldGain().toFixed(2) + '%';
        document.getElementById("experienceGainValue").innerHTML = this.player.getExperienceGain().toFixed(2) + '%';

        // Update the select quest display
        var quest = this.questsManager.getSelectedQuest();
        if (quest != null) {
            var newText = '';
            // Name
            document.getElementById("questTitle").innerHTML = quest.name;
            // Create the quest goal
            switch (quest.type) {
                case QuestType.KILL:
                    if (quest.typeAmount == 1) {
                        newText = "Slay " + quest.typeAmount + " Level " + quest.typeId + " Monster.";
                    }
                    else {
                        newText = "Slay " + quest.typeAmount + " Level " + quest.typeId + " Monsters.";
                    }
                    break;
                case QuestType.MERCENARIES:
                    switch (quest.typeId) {
                        case 0:
                            newText = "Own " + quest.typeAmount + " Footmen.";
                            break;
                        case 1:
                            newText = "Own " + quest.typeAmount + " Clerics.";
                            break;
                        case 2:
                            newText = "Own " + quest.typeAmount + " Commanders.";
                            break;
                        case 3:
                            newText = "Own " + quest.typeAmount + " Mages.";
                            break;
                        case 4:
                            newText = "Own " + quest.typeAmount + " Assassins.";
                            break;
                        case 5:
                            newText = "Own " + quest.typeAmount + " Warlocks.";
                            break;
                    }
                    break;
                case QuestType.UPGRADE:
                    newText = "Purchase the " + this.upgradeManager.upgrades[quest.typeId].name + " upgrade.";
                    break;
            }
            document.getElementById("questGoal").innerHTML = newText;
            // Create the quest progress text
            switch (quest.type) {
                case QuestType.KILL:
                    newText = quest.killCount + "/" + quest.typeAmount + " Monsters slain.";
                    break;
                case QuestType.MERCENARIES:
                    switch (quest.typeId) {
                        case 0:
                            newText = this.mercenaryManager.footmenOwned + "/" + quest.typeAmount + " Footmen owned.";
                            break;
                        case 1:
                            newText = this.mercenaryManager.clericsOwned + "/" + quest.typeAmount + " Clerics owned.";
                            break;
                        case 2:
                            newText = this.mercenaryManager.commandersOwned + "/" + quest.typeAmount + " Commanders owned.";
                            break;
                        case 3:
                            newText = this.mercenaryManager.magesOwned + "/" + quest.typeAmount + " Mages owned.";
                            break;
                        case 4:
                            newText = this.mercenaryManager.assassinsOwned + "/" + quest.typeAmount + " Assassins owned.";
                            break;
                        case 5:
                            newText = this.mercenaryManager.warlocksOwned + "/" + quest.typeAmount + " Warlocks owned.";
                            break;
                    }
                    break;
                case QuestType.UPGRADE:
                    break;
            }
            document.getElementById("questProgress").innerHTML = newText;
            // Add the description
            document.getElementById("questDescription").innerHTML = "<br>" + quest.description;
            // Add the reward
            document.getElementById("questReward").innerHTML = "<br>Reward:";
            if (quest.buffReward != null) { document.getElementById("questRewardText").innerHTML = "Completing this quest will empower you with a powerful buff."; }
            document.getElementById("questGold").innerHTML = quest.goldReward;
            document.getElementById("questExperience").innerHTML = quest.expReward;
        }
        else {
            $("#questNamesArea").hide();
            $("#questTextArea").hide();
        }

        // Update the stats window
        this.stats.update();
    }
}

var game = new Game();

var intervalMS = 1000 / 60;
var oldDate = new Date();
setInterval(function () {
    game.update();
}, intervalMS);

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                      BUTTONS                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
var itemTooltipButtonHovered = false;

this.SLOT_TYPE = new Object();
SLOT_TYPE.EQUIP = "EQUIP";
SLOT_TYPE.INVENTORY = "INVENTORY";
SLOT_TYPE.SELL = "SELL";

var slotTypeSelected;
var slotNumberSelected;

function attackButtonHover(obj) {
    // Display a different tooltip depending on the player's attack
    switch (game.player.attackType) {
        case AttackType.BASIC_ATTACK:
            $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 150px 0');
            $("#otherTooltipTitle").html('Attack');
            $("#otherTooltipCooldown").html('');
            $("#otherTooltipLevel").html('');
            $("#otherTooltipDescription").html('A basic attack.');
            $("#otherTooltip").show();
            break;
        case AttackType.POWER_STRIKE:
            $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 150px 100px');
            $("#otherTooltipTitle").html('Power Strike');
            $("#otherTooltipCooldown").html('');
            $("#otherTooltipLevel").html('');
            $("#otherTooltipDescription").html('Strike your target with a powerful blow, dealing 1.5x normal damage.');
            $("#otherTooltip").show();
            break;
        case AttackType.DOUBLE_STRIKE:
            $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 150px 50px');
            $("#otherTooltipTitle").html('Double Strike');
            $("#otherTooltipCooldown").html('');
            $("#otherTooltipLevel").html('');
            $("#otherTooltipDescription").html('Attack your target with two fast strikes.');
            $("#otherTooltip").show();
            break;
    }

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top + 10);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 10));
}
function attackButtonReset() {
    switch (game.player.attackType) {
        case AttackType.BASIC_ATTACK: $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 0 0'); break;
        case AttackType.POWER_STRIKE: $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 0 100px'); break;
        case AttackType.DOUBLE_STRIKE: $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 0 50px'); break;
    }
    $("#otherTooltip").hide();
}
function attackButtonClick() {
    switch (game.player.attackType) {
        case AttackType.BASIC_ATTACK: $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 100px 0'); break;
        case AttackType.POWER_STRIKE: $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 100px 100px'); break;
        case AttackType.DOUBLE_STRIKE: $("#attackButton").css('background', 'url("includes/images/attackButtons.png") 100px 50px'); break;
    }
    if (game.inBattle == true) {
        game.attack();
    }
}

function enterBattleButtonHover(obj) {
    if (game.inBattle == false && game.player.alive) {
        $("#enterBattleButton").css('background', 'url("includes/images/stoneButton1.png") 0 75px');
    }
}
function enterBattleButtonReset(obj) {
    if (game.inBattle == false && game.player.alive) {
        $("#enterBattleButton").css('background', 'url("includes/images/stoneButton1.png") 0 0px');
    }
}
function enterBattleButtonClick(obj) {
    if (game.inBattle == false && game.player.alive) {
        game.enterBattle();
    }
}

function leaveBattleButtonHover(obj) {
    if (game.inBattle == true) {
        $("#leaveBattleButton").css('background', 'url("includes/images/stoneButton1.png") 0 75px');
    }
}
function leaveBattleButtonReset(obj) {
    if (game.inBattle == true) {
        $("#leaveBattleButton").css('background', 'url("includes/images/stoneButton1.png") 0 0px');
    }
}
function leaveBattleButtonClick(obj) {
    // If a battle is active
    if (game.inBattle == true) {
        game.leaveBattle();
    }
}

function battleLevelUpButtonHover(obj) {
    if (!game.maxBattleLevelReached()) {
        obj.style.background = 'url("includes/images/battleLevelButton.png") 0 75px';
    }
}
function battleLevelUpButtonClick(obj) {
    obj.style.background = 'url("includes/images/battleLevelButton.png") 0 50px';

    if (!game.maxBattleLevelReached()) { 
        game.increaseBattleLevel();
        $("#battleLevelDownButton").css('background', 'url("includes/images/battleLevelButton.png") 0 0px');
        if (game.maxBattleLevelReached()) {
            obj.style.background = 'url("includes/images/battleLevelButton.png") 0 25px';
        }
    }
}
function battleLevelUpButtonReset(obj) {
    if (!game.maxBattleLevelReached()) {
        obj.style.background = 'url("includes/images/battleLevelButton.png") 0 0px';
    }
}

function battleLevelDownButtonHover(obj) {
    if (game.battleLevel != 1) {
        obj.style.background = 'url("includes/images/battleLevelButton.png") 0 75px';
    }
}
function battleLevelDownButtonClick(obj) {
    obj.style.background = 'url("includes/images/battleLevelButton.png") 0 50px';

    if (game.battleLevel != 1) { 
        game.decreaseBattleLevel();
        $("#battleLevelUpButton").css('background', 'url("includes/images/battleLevelButton.png") 0 0px');
        if (game.battleLevel == 1) {
            obj.style.background = 'url("includes/images/battleLevelButton.png") 0 25px';
        }
    }
}
function battleLevelDownButtonReset(obj) {
    if (game.battleLevel != 1) {
        obj.style.background = 'url("includes/images/battleLevelButton.png") 0 0px';
    }
}

function equipItemHover(obj, index) {
    var item = game.equipment.slots[index - 1];
    // If there is an item in this slot then show the item tooltip
    if (item != null) {
        var rect = obj.getBoundingClientRect();
        game.tooltipManager.displayItemTooltip(item, null, null, rect.left, rect.top, false);
    }
}
function equipItemReset(obj, index) {
    $("#itemTooltip").hide();
    $(".equipItem" + index).css('z-index', '1');
}
function equipItemClick(obj, index) {
    // If the left mouse button was clicked
    if (event.which == 1) {
        // Store the information about this item
        slotTypeSelected = SLOT_TYPE.EQUIP;
        slotNumberSelected = index;

        var rect = $(".equipItem" + index).position();
        $(".equipItem" + index).css('z-index', '200');
    }
}

function inventoryItemHover(obj, index) {
    var item = game.inventory.slots[index - 1];
    // If there is an item in this slot then show the item tooltip
    if (item != null) {
        // If there is already an item equipped in the slot this item would go into, then get that item
        // Get the slot Id if there is an item equipped
        var equippedSlot = -1
        var twoTrinkets = false;
        switch (item.type) {
            case ItemType.HELM:         if (game.equipment.helm() != null) { equippedSlot = 0 } break;
            case ItemType.SHOULDERS:    if (game.equipment.shoulders() != null) { equippedSlot = 1; } break;
            case ItemType.CHEST:        if (game.equipment.chest() != null) { equippedSlot = 2; } break;
            case ItemType.LEGS:         if (game.equipment.legs() != null) { equippedSlot = 3; } break;
            case ItemType.WEAPON:       if (game.equipment.weapon() != null) { equippedSlot = 4; } break;
            case ItemType.GLOVES:       if (game.equipment.gloves() != null) { equippedSlot = 5; } break;
            case ItemType.BOOTS:        if (game.equipment.boots() != null) { equippedSlot = 6; } break;
            case ItemType.TRINKET:      if (game.equipment.trinket1() != null || game.equipment.trinket2() != null) {
                                            equippedSlot = 7;
                                            // Check to see if there are two trinkets equipped, then we will need to show two compare tooltips
                                            if (game.equipment.trinket1() != null && game.equipment.trinket2() != null) {
                                                twoTrinkets = true;
                                            }
                                        }
                                        break;
            case ItemType.OFF_HAND:     if (game.equipment.off_hand() != null) { equippedSlot = 9; } break;
        }
        var item2 = game.equipment.slots[equippedSlot];

        // If the item type is a trinket and there are two trinkets equipped then we need to display two compare tooltips
        if (twoTrinkets) {
            var item3 = game.equipment.trinket2();
        }

        // Get the item slot's location
        var rect = obj.getBoundingClientRect();

        // Display the tooltip
        game.tooltipManager.displayItemTooltip(item, item2, item3, rect.left, rect.top, true);
    }
}
function inventoryItemReset(obj, index) {
    $("#itemTooltip").hide();
    $("#itemCompareTooltip").hide();
    $("#itemCompareTooltip2").hide();
    $("#inventoryItem" + index).css('z-index', '1');
}
function inventoryItemClick(obj, index, event) {
    // If the shift key is down then sell this item
    if (event.shiftKey == 1) {
        game.inventory.sellItem(index - 1);
    }
    // If the left mouse button was clicked
    else if (event.which == 1) {
        // Store the information about this item
        slotTypeSelected = SLOT_TYPE.INVENTORY;
        slotNumberSelected = index;

        var rect = $("#inventoryItem" + index).position();
        $("#inventoryItem" + index).css('z-index', '200');
    }
}
function sellAllButtonClick() {
    game.inventory.sellAll();
}

function equipInventoryItem(event, index) {
    // If the alt key was pressed try to equip this item as a second trinket
    if (event.altKey == 1) {
        game.equipment.equipSecondTrinket(game.inventory.slots[index - 1], index - 1);
    }
    else {
        game.equipment.equipItem(game.inventory.slots[index - 1], index - 1);
    }
}
function equipItemRightClick(event, index) {
    game.equipment.unequipItem(index - 1);
}

var sellButtonActive = false;
function sellButtonHover(obj) {
    // If the button is not active, then highlight it
    if (!sellButtonActive) {
        obj.setAttribute("src", "includes/images/sellButtonHover.png");
    }
}
function sellButtonReset(obj) {
    // If the button is not active then reset it
    if (!sellButtonActive) {
        obj.setAttribute("src", "includes/images/sellButton.png");
    }
}
function sellButtonClick(obj) {
    // If the button is not active, then make it active
    if (!sellButtonActive) {
        sellButtonActive = true;
        obj.setAttribute("src", "includes/images/sellButtonDown.png");
    }
    // Else; make it not active
    else {
        sellButtonActive = false;
        obj.setAttribute("src", "includes/images/sellButtonHover.png");
    }
}

// Level Up Button
function levelUpButtonHover() {
    $("#levelUpButton").css('background', 'url("includes/images/stoneButton1.png") 0 75px');
}
function levelUpButtonReset() {
    $("#levelUpButton").css("background", 'url("includes/images/stoneButton1.png") 0 0px');
}
function levelUpButtonClick() {
    $("#levelUpButton").css("background", 'url("includes/images/stoneButton1.png") 0 50px');

    game.displayLevelUpWindow();
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                  WINDOW BUTTONS                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
var characterWindowShown = false;
var mercenariesWindowShown = false;
var upgradesWindowShown = false;
var questsWindowShown = false;
var inventoryWindowShown = false;

function characterWindowButtonHover(obj) {
    $(".characterWindowButton").css('background', 'url("includes/images/windowButtons.png") 117px 78px');
    game.tooltipManager.displayBasicTooltip(obj, "Character");
}
function characterWindowButtonClick(obj) {
    if (characterWindowShown) { $("#characterWindow").hide(); characterWindowShown = false; }
    else {
        updateWindowDepths(document.getElementById("characterWindow"));
        $("#characterWindow").show();
        characterWindowShown = true;
        // Update the tutorial
        game.tutorialManager.equipmentOpened = true;
    }
}
function characterWindowButtonReset(obj) {
    $(".characterWindowButton").css('background', 'url("includes/images/windowButtons.png") 0px 78px');
    $("#basicTooltip").hide();
}

function mercenariesWindowButtonHover(obj) {
    $(".mercenariesWindowButton").css('background', 'url("includes/images/windowButtons.png") 117px 117px');
    game.tooltipManager.displayBasicTooltip(obj, "Mercenaries");
}
function mercenariesWindowButtonClick(obj) {
    if (mercenariesWindowShown) { $("#mercenariesWindow").hide(); mercenariesWindowShown = false; }
    else { 
        $("#mercenariesWindow").show(); 
        mercenariesWindowShown = true; 
        updateWindowDepths(document.getElementById("mercenariesWindow")); 
    }

    if (game.tutorialManager.currentTutorial == 9) {
        game.tutorialManager.hideTutorial();
    }
}
function mercenariesWindowButtonReset(obj) {
    $(".mercenariesWindowButton").css('background', 'url("includes/images/windowButtons.png") 0px 117px');
    $("#basicTooltip").hide();
}

function upgradesWindowButtonHover(obj) {
    $("#upgradesWindowButtonGlow").css('background', 'url("includes/images/windowButtons.png") 39px 0');
    $(".upgradesWindowButton").css('background', 'url("includes/images/windowButtons.png") 117px 0');
    game.tooltipManager.displayBasicTooltip(obj, "Upgrades");
}
function upgradesWindowButtonClick(obj) {
    game.upgradeManager.stopGlowingUpgradesButton();
    if (upgradesWindowShown) { $("#upgradesWindow").hide(); upgradesWindowShown = false; }
    else { 
        $("#upgradesWindow").show(); 
        upgradesWindowShown = true; 
        updateWindowDepths(document.getElementById("upgradesWindow"));
    }

    if (game.tutorialManager.currentTutorial == 10) {
        game.tutorialManager.hideTutorial();
    }
}
function upgradesWindowButtonReset(obj) {
    $("#upgradesWindowButtonGlow").css('background', 'url("includes/images/windowButtons.png") 78px 0');
    $(".upgradesWindowButton").css('background', 'url("includes/images/windowButtons.png") 0px 0');
    $("#basicTooltip").hide();
}

function questsWindowButtonHover(obj) {
    $("#questsWindowButtonGlow").css('background', 'url("includes/images/windowButtons.png") 39px 195px');
    $(".questsWindowButton").css('background', 'url("includes/images/windowButtons.png") 117px 195px');
    game.tooltipManager.displayBasicTooltip(obj, "Quests");
}
function questsWindowButtonClick(obj) {
    game.questsManager.stopGlowingQuestsButton();
    if (questsWindowShown) { $("#questsWindow").hide(); questsWindowShown = false; }
    else { 
        $("#questsWindow").show(); 
        questsWindowShown = true; 
        updateWindowDepths(document.getElementById("questsWindow")); 
    }

    // Hide the tutorial if this is the first quests tutorial
    if (game.tutorialManager.currentTutorial == 6) {
        game.tutorialManager.hideTutorial();
    }
}
function questsWindowButtonReset(obj) {
    $("#questsWindowButtonGlow").css('background', 'url("includes/images/windowButtons.png") 78px 195px');
    $(".questsWindowButton").css('background', 'url("includes/images/windowButtons.png") 0px 195px');
    $("#basicTooltip").hide();
}

function questNameClick(id) {
    game.questsManager.selectedQuest = id;
}

var inventoryWindowVisible = false;
function inventoryWindowButtonHover(obj) {
    $(".inventoryWindowButton").css('background', 'url("includes/images/windowButtons.png") 117px 39px');
    game.tooltipManager.displayBasicTooltip(obj, "Inventory");
}
function inventoryWindowButtonClick(obj) {
    if (inventoryWindowShown) { $("#inventoryWindow").hide(); inventoryWindowShown = false; }
    else { 
        updateWindowDepths(document.getElementById("inventoryWindow"));
        $("#inventoryWindow").show(); 
        inventoryWindowShown = true;
        // Update the 6th tutorial
        game.tutorialManager.inventoryOpened = true;
    }
}
function inventoryWindowButtonReset(obj) {
    $(".inventoryWindowButton").css('background', 'url("includes/images/windowButtons.png") 0px 39px');
    $("#basicTooltip").hide();
}

function closeButtonHover(obj) {
    obj.style.background = 'url("includes/images/closeButton.png") 14px 0';
}
function closeButtonClick(obj) {
    switch (obj.id) {
        case "statUpgradesWindowCloseButton": $("#statUpgradesWindow").hide(); $("#levelUpButton").show(); break;
        case "abilityUpgradesWindowCloseButton": $("#abilityUpgradesWindow").hide(); $("#levelUpButton").show(); break;
        case "updatesWindowCloseButton": $("#updatesWindow").hide(); break;
        case "statsWindowCloseButton": $("#statsWindow").hide(); break;
        case "optionsWindowCloseButton": $("#optionsWindow").hide(); break;
        case "characterWindowCloseButton": $("#characterWindow").hide(); characterWindowShown = false; break;
        case "mercenariesWindowCloseButton": $("#mercenariesWindow").hide(); mercenariesWindowShown = false; break;
        case "upgradesWindowCloseButton": $("#upgradesWindow").hide(); upgradesWindowShown = false; break;
        case "questsWindowCloseButton": $("#questsWindow").hide(); questsWindowShown = false; break;
        case "inventoryWindowCloseButton": $("#inventoryWindow").hide(); inventoryWindowShown = false; break;
    }
}
function closeButtonReset(obj) {
    obj.style.background = 'url("includes/images/closeButton.png") 0 0';
}

var WindowOrder = new Array("characterWindow", "mercenariesWindow", "upgradesWindow", "questsWindow", "inventoryWindow");
var WindowIds = new Array("characterWindow", "mercenariesWindow", "upgradesWindow", "questsWindow", "inventoryWindow");
function updateWindowDepths(obj) {
    // Go through the window order and remove the id
    for (var x = 0; x < WindowOrder.length; x++) {
        if (WindowOrder[x] == obj.id) {
            WindowOrder.splice(x, 1);
            break;
        }
    }

    // Add the id again
    WindowOrder.push(obj.id);

    // Order the window depths
    for (var x = 0; x < WindowOrder.length; x++) {
        document.getElementById(WindowOrder[x]).style.zIndex = 5 + x;
    }
}


function footmanBuyButtonMouseOver(obj) {
    $("#footmanBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 92px');

    $("#otherTooltipTitle").html('Footman');
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html('GPS: ' + game.mercenaryManager.getMercenaryBaseGps(MercenaryType.FOOTMAN));
    $("#otherTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top - 70);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 40));
}
function footmanBuyButtonMouseDown(obj) {
    $("#footmanBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 46px');
    game.mercenaryManager.purchaseMercenary(MercenaryType.FOOTMAN);
}
function footmanBuyButtonMouseOut(obj) {
    $("#footmanBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 0');
    $("#otherTooltip").hide();
}

function clericBuyButtonMouseOver(obj) {
    $("#clericBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 92px');

    $("#otherTooltipTitle").html('Cleric');
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html('GPS: ' + game.mercenaryManager.getMercenaryBaseGps(MercenaryType.CLERIC).formatMoney() + 
        '<br>Clerics increase your hp5 by ' + game.mercenaryManager.getClericHp5PercentBonus() + '%.');
    $("#otherTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top - 70);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 40));
}
function clericBuyButtonMouseDown(obj) {
    $("#clericBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 46px');
    game.mercenaryManager.purchaseMercenary(MercenaryType.CLERIC);
}
function clericBuyButtonMouseOut(obj) {
    $("#clericBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 0');
    $("#otherTooltip").hide();
}

function commanderBuyButtonMouseOver(obj) {
    $("#commanderBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 92px');

    $("#otherTooltipTitle").html('Commander');
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html('GPS: ' + game.mercenaryManager.getMercenaryBaseGps(MercenaryType.COMMANDER).formatMoney() +
        '<br>Commanders increase your health by ' + game.mercenaryManager.getCommanderHealthPercentBonus() + '%.');
    $("#otherTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top - 70);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 40));
}
function commanderBuyButtonMouseDown(obj) {
    $("#commanderBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 46px');
    game.mercenaryManager.purchaseMercenary(MercenaryType.COMMANDER);
}
function commanderBuyButtonMouseOut(obj) {
    $("#commanderBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 0');
    $("#otherTooltip").hide();
}

function mageBuyButtonMouseOver(obj) {
    $("#mageBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 92px');

    $("#otherTooltipTitle").html('Mage');
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html('GPS: ' + game.mercenaryManager.getMercenaryBaseGps(MercenaryType.MAGE).formatMoney() +
        '<br>Mages increase your damage by ' + game.mercenaryManager.getMageDamagePercentBonus() + '%.');
    $("#otherTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top - 70);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 40));
}
function mageBuyButtonMouseDown(obj) {
    $("#mageBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 46px');
    game.mercenaryManager.purchaseMercenary(MercenaryType.MAGE);
}
function mageBuyButtonMouseOut(obj) {
    $("#mageBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 0');
    $("#otherTooltip").hide();
}

function assassinBuyButtonMouseOver(obj) {
    $("#assassinBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 92px');

    $("#otherTooltipTitle").html('Assassin');
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html('GPS: ' + game.mercenaryManager.getMercenaryBaseGps(MercenaryType.ASSASSIN).formatMoney() + 
        '<br>Assassins increase your evasion by ' + game.mercenaryManager.getAssassinEvasionPercentBonus() + '%.');
    $("#otherTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top - 70);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 40));
}
function assassinBuyButtonMouseDown(obj) {
    $("#assassinBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 46px');
    game.mercenaryManager.purchaseMercenary(MercenaryType.ASSASSIN);
}
function assassinBuyButtonMouseOut(obj) {
    $("#assassinBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 0');
    $("#otherTooltip").hide();
}

function warlockBuyButtonMouseOver(obj) {
    $("#warlockBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 92px');

    $("#otherTooltipTitle").html('Warlock');
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html('GPS: ' + game.mercenaryManager.getMercenaryBaseGps(MercenaryType.WARLOCK).formatMoney() +
        '<br>Warlocks increase your critical strike damage by ' + game.mercenaryManager.getWarlockCritDamageBonus() + '%.');
    $("#otherTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top - 70);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 40));
}
function warlockBuyButtonMouseDown(obj) {
    $("#warlockBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 46px');
    game.mercenaryManager.purchaseMercenary(MercenaryType.WARLOCK);
}
function warlockBuyButtonMouseOut(obj) {
    $("#warlockBuyButton").css('background', 'url("includes/images/buyButtonBase.png") 0 0');
    $("#otherTooltip").hide();
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                          STAT & ABILITY UPGRADE BUTTONS                                                       
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
function statUpgradeButtonHover(obj, index) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 92px';

    // Show a tooltip describing what the hovered stat does if neccessary
    var upgrade = game.statUpgradesManager.upgrades[0][index - 1];

    switch (upgrade.type) {
        case StatUpgradeType.DAMAGE:
            $("#otherTooltipTitle").html("Damage");
            $("#otherTooltipDescription").html("Increases the damage you deal with basic attacks.");
            break;
        case StatUpgradeType.STRENGTH:
            $("#otherTooltipTitle").html("Strength");
            $("#otherTooltipDescription").html("Increases your Health by 5 and Damage by 1%.");
            break;
        case StatUpgradeType.AGILITY:
            $("#otherTooltipTitle").html("Agility");
            $("#otherTooltipDescription").html("Increases your Crit Damage by 0.2% and Evasion by 1%.");
            break;
        case StatUpgradeType.STAMINA:
            $("#otherTooltipTitle").html("Stamina");
            $("#otherTooltipDescription").html("Increases your Hp5 by 1 and your Armour by 1%.");
            break;
        case StatUpgradeType.ARMOUR:
            $("#otherTooltipTitle").html("Armour");
            $("#otherTooltipDescription").html("Reduces the damage you take from monsters.");
            break;
        case StatUpgradeType.EVASION:
            $("#otherTooltipTitle").html("Evasion");
            $("#otherTooltipDescription").html("Increases your chance to dodge a monster's attack.");
            break;
        case StatUpgradeType.HP5:
            $("#otherTooltipTitle").html("Hp5");
            $("#otherTooltipDescription").html("The amount of health you regenerate over 5 seconds.");
            break;
        case StatUpgradeType.CRIT_DAMAGE:
            $("#otherTooltipTitle").html("Crit Damage");
            $("#otherTooltipDescription").html("The amount of damage your critical strikes will cause");
            break;
        case StatUpgradeType.ITEM_RARITY:
            $("#otherTooltipTitle").html("Item Rarity");
            $("#otherTooltipDescription").html("Increases the chance that rarer items will drop from monsters");
            break;
        case StatUpgradeType.EXPERIENCE_GAIN:
            $("#otherTooltipTitle").html("Experience Gain");
            $("#otherTooltipDescription").html("Increases the experience earned from killing monsters");
            break;
        case StatUpgradeType.GOLD_GAIN:
            $("#otherTooltipTitle").html("Gold Gain");
            $("#otherTooltipDescription").html("Increases the gold gained from monsters and mercenaries");
            break;
    }

    // Set the item tooltip's location
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltip").show();
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top - 70);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 40));
}
function statUpgradeButtonClick(obj, index) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 46px';
    $("#statUpgradesWindow").hide();

    // Upgrade a player's stat depending on which button was clicked
    var upgrade = game.statUpgradesManager.upgrades[0][index - 1];
    switch (upgrade.type) {
        case StatUpgradeType.DAMAGE:            game.player.chosenLevelUpBonuses.damageBonus += upgrade.amount;         break;
        case StatUpgradeType.STRENGTH:          game.player.chosenLevelUpBonuses.strength += upgrade.amount;            break;
        case StatUpgradeType.AGILITY:           game.player.chosenLevelUpBonuses.agility += upgrade.amount;             break;
        case StatUpgradeType.STAMINA:           game.player.chosenLevelUpBonuses.stamina += upgrade.amount;             break;
        case StatUpgradeType.ARMOUR:            game.player.chosenLevelUpBonuses.armour += upgrade.amount;              break;
        case StatUpgradeType.EVASION:           game.player.chosenLevelUpBonuses.evasion += upgrade.amount;             break;
        case StatUpgradeType.HP5:               game.player.chosenLevelUpBonuses.hp5 += upgrade.amount;                 break;
        case StatUpgradeType.CRIT_DAMAGE:       game.player.chosenLevelUpBonuses.critDamage += upgrade.amount;          break;
        case StatUpgradeType.ITEM_RARITY:       game.player.chosenLevelUpBonuses.itemRarity += upgrade.amount;          break;
        case StatUpgradeType.EXPERIENCE_GAIN:   game.player.chosenLevelUpBonuses.experienceGain += upgrade.amount;      break;
        case StatUpgradeType.GOLD_GAIN:         game.player.chosenLevelUpBonuses.goldGain += upgrade.amount;            break;
    }

    // Remove the upgrade
    game.statUpgradesManager.upgrades.splice(0, 1);

    // Alter the player's skill points
    game.player.skillPoints--;
    game.player.skillPointsSpent++;

    // Show the Level Up button if there are still skill points remaining
    if (game.player.skillPoints > 0) {
        $("#levelUpButton").show();
    }

    // Update the 4th tutorial
    game.tutorialManager.statUpgradeChosen = true;
}
function statUpgradeButtonReset(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 0';
    $("#otherTooltip").hide();
}

function rendUpgradeButtonHover(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 92px';

    $("#abilityUpgradeTooltipTitle").html('Rend');
    $("#abilityUpgradeTooltipCooldown").html('');
    // If there is already a level in this ability then show the current version as well
    if (game.player.abilities.getRendLevel() > 0) {
        $("#abilityUpgradeTooltipLevel").html('Level ' + game.player.abilities.getRendLevel());
        $("#abilityUpgradeTooltipDescription").html('Your attacks cause your opponent to bleed for <span class="yellowText">' + game.player.abilities.getRendDamage(0) + 
            '</span> damage after every round for ' + game.player.abilities.rendDuration + ' rounds. Stacks up to 5 times.');
        $("#abilityUpgradeTooltipLevel2").html('Next Level');
    }
    else {
        $("#abilityUpgradeTooltipLevel").html('');
        $("#abilityUpgradeTooltipDescription").html('');
        $("#abilityUpgradeTooltipLevel2").html('Level 1');
    }
    $("#abilityUpgradeTooltipDescription2").html('Your attacks cause your opponent to bleed for <span class="yellowText">' + game.player.abilities.getRendDamage(1) + 
        '</span> damage after every round for ' + game.player.abilities.rendDuration + ' rounds. Stacks up to 5 times.');
    $("#abilityUpgradeTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#abilityUpgradeTooltip").css('top', rect.top - 70);
    var leftReduction = document.getElementById("abilityUpgradeTooltip").scrollWidth;
    $("#abilityUpgradeTooltip").css('left', (rect.left - leftReduction - 40));
}
function rendUpgradeButtonClick(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 46px';
    $("#abilityUpgradesWindow").hide();
    game.player.increaseAbilityPower(AbilityName.REND);
}
function rendUpgradeButtonReset(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 0';
    $("#abilityUpgradeTooltip").hide();
}

function rejuvenatingStrikesUpgradeButtonHover(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 92px';

    $("#abilityUpgradeTooltipTitle").html('Rejuvenating Strikes');
    $("#abilityUpgradeTooltipCooldown").html('');
    // If there is already a level in this ability then show the current version as well
    if (game.player.abilities.getRejuvenatingStrikesLevel() > 0) {
        $("#abilityUpgradeTooltipLevel").html('Level ' + game.player.abilities.getRejuvenatingStrikesLevel());
        $("#abilityUpgradeTooltipDescription").html('Your attacks heal you for <span class="greenText">' + game.player.abilities.getRejuvenatingStrikesHealAmount(0) + 
            '</span> health.');
        $("#abilityUpgradeTooltipLevel2").html('Next Level');
    }
    else {
        $("#abilityUpgradeTooltipLevel").html('');
        $("#abilityUpgradeTooltipDescription").html('');
        $("#abilityUpgradeTooltipLevel2").html('Level 1');
    }
    $("#abilityUpgradeTooltipDescription2").html('Your attacks heal you for <span class="greenText">' + game.player.abilities.getRejuvenatingStrikesHealAmount(1) + 
        '</span> health.');
    $("#abilityUpgradeTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#abilityUpgradeTooltip").css('top', rect.top + 10);
    var leftReduction = document.getElementById("abilityUpgradeTooltip").scrollWidth;
    $("#abilityUpgradeTooltip").css('left', (rect.left - leftReduction - 10));
}
function rejuvenatingStrikesUpgradeButtonClick(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 46px';
    $("#abilityUpgradesWindow").hide();
    game.player.increaseAbilityPower(AbilityName.REJUVENATING_STRIKES);
}
function rejuvenatingStrikesUpgradeButtonReset(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 0';
    $("#abilityUpgradeTooltip").hide();
}

function iceBladeUpgradeButtonHover(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 92px';

    $("#abilityUpgradeTooltipTitle").html('Ice Blade');
    $("#abilityUpgradeTooltipCooldown").html('');
    // If there is already a level in this ability then show the current version as well
    if (game.player.abilities.getIceBladeLevel() > 0) {
        $("#abilityUpgradeTooltipLevel").html('Level ' + game.player.abilities.getIceBladeLevel());
        $("#abilityUpgradeTooltipDescription").html('Your attacks deal <span class="yellowText">' + game.player.abilities.getIceBladeDamage(0) + 
            '</span> bonus damage and chill them for ' + game.player.abilities.iceBladeChillDuration + ' rounds.');
        $("#abilityUpgradeTooltipLevel2").html('Next Level');
    }
    else {
        $("#abilityUpgradeTooltipLevel").html('');
        $("#abilityUpgradeTooltipDescription").html('');
        $("#abilityUpgradeTooltipLevel2").html('Level 1');
    }
    $("#abilityUpgradeTooltipDescription2").html('Your attacks deal <span class="yellowText">' + game.player.abilities.getIceBladeDamage(1) + 
        '</span> damage and chill them for ' + game.player.abilities.iceBladeChillDuration + ' rounds.');
    $("#abilityUpgradeTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#abilityUpgradeTooltip").css('top', rect.top + 10);
    var leftReduction = document.getElementById("abilityUpgradeTooltip").scrollWidth;
    $("#abilityUpgradeTooltip").css('left', (rect.left - leftReduction - 10));
}
function iceBladeUpgradeButtonClick(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 46px';
    $("#abilityUpgradesWindow").hide();
    game.player.increaseAbilityPower(AbilityName.ICE_BLADE);
}
function iceBladeUpgradeButtonReset(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 0';
    $("#abilityUpgradeTooltip").hide();
}

function fireBladeUpgradeButtonHover(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 92px';

    $("#abilityUpgradeTooltipTitle").html('Fire Blade');
    $("#abilityUpgradeTooltipCooldown").html('');
    // If there is already a level in this ability then show the current version as well
    if (game.player.abilities.getFireBladeLevel() > 0) {
        $("#abilityUpgradeTooltipLevel").html('Level ' + game.player.abilities.getFireBladeLevel());
        $("#abilityUpgradeTooltipDescription").html('Your attacks deal <span class="yellowText">' + game.player.abilities.getFireBladeDamage(0) + 
            '</span> bonus damage and burn them for <span class="yellowText">' + game.player.abilities.getFireBladeBurnDamage(0) + 
            '</span> damage after every round for ' + game.player.abilities.fireBladeBurnDuration + ' rounds.');
        $("#abilityUpgradeTooltipLevel2").html('Next Level');
    }
    else {
        $("#abilityUpgradeTooltipLevel").html('');
        $("#abilityUpgradeTooltipDescription").html('');
        $("#abilityUpgradeTooltipLevel2").html('Level 1');
    }
    $("#abilityUpgradeTooltipDescription2").html('Your attacks deal <span class="yellowText">' + game.player.abilities.getFireBladeDamage(1) + 
        '</span> bonus damage and burn them for <span class="yellowText">' + game.player.abilities.getFireBladeBurnDamage(1) + 
        '</span> damage after every round for ' + game.player.abilities.fireBladeBurnDuration + ' rounds.');
    $("#abilityUpgradeTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#abilityUpgradeTooltip").css('top', rect.top + 10);
    var leftReduction = document.getElementById("abilityUpgradeTooltip").scrollWidth;
    $("#abilityUpgradeTooltip").css('left', (rect.left - leftReduction - 10));
}
function fireBladeUpgradeButtonClick(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 46px';
    $("#abilityUpgradesWindow").hide();
    game.player.increaseAbilityPower(AbilityName.FIRE_BLADE);
}
function fireBladeUpgradeButtonReset(obj) {
    obj.style.background = 'url("includes/images/buyButtonBase.png") 0 0';
    $("#abilityUpgradeTooltip").hide();
}

/* ========== ========== ========== ========== ==========  ========== ========== ========== ========== ==========  /
/                                                       OTHER                                                      
/  ========== ========== ========== ========== ==========  ========== ========== ========== ========== ========== */
// Exp bar
function expBarAreaMouseOver() {
    $("#expBarText").show();
}
function expBarAreaMouseOut() {
    if (!game.options.alwaysDisplayExp) {
        $("#expBarText").hide();
    }
}

// Player health bar
function playerHealthBarAreaMouseOver() {
    $("#playerHealthBarText").show();
}
function playerHealthBarAreaMouseOut() {
    if (!game.options.alwaysDisplayPlayerHealth) {
        $("#playerHealthBarText").hide();
    }
}

// Monster health bar
function monsterHealthBarAreaMouseOver() {
    game.displayMonsterHealth = true;
}
function monsterHealthBarAreaMouseOut() {
    if (!game.options.alwaysDisplayMonsterHealth) {
        game.displayMonsterHealth = false;
    }
}

// Debuffs
// Bleeding
function bleedingIconMouseOver(obj) {
    $("#otherTooltipTitle").html("Bleeding");
    $("#otherTooltipCooldown").html((game.monster.debuffs.bleedMaxDuration - game.monster.debuffs.bleedDuration) + ' rounds remaining');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html('This monster is bleeding, causing damage at the end of every round');
    $("#otherTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top + 10);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 10));
}
function bleedingIconMouseOut() {
    $("#otherTooltip").hide();
}
// Burning
function burningIconMouseOver(obj) {
    $("#otherTooltipTitle").html("Burning");
    $("#otherTooltipCooldown").html((game.monster.debuffs.burningMaxDuration - game.monster.debuffs.burningDuration) + ' rounds remaining');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html('This monster is burning, causing damage at the end of every round');
    $("#otherTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top + 10);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 10));
}
function burningIconMouseOut() {
    $("#otherTooltip").hide();
}
// Chilled
function chilledIconMouseOver(obj) {
    $("#otherTooltipTitle").html("Chilled");
    $("#otherTooltipCooldown").html((game.monster.debuffs.chillMaxDuration - game.monster.debuffs.chillDuration) + ' rounds remaining');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html('This monster is chilled, causing it to attack twice as slow');
    $("#otherTooltip").show();

    // Set the item tooltip's location
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top + 10);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 10));
}
function chilledIconMouseOut() {
    $("#otherTooltip").hide();
}

// Stat Hover Tooltips
function damageBonusStatHover(obj) {
    $("#otherTooltipTitle").html("Damage Bonus");
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html("Increases the damage you deal with basic attacks.");
    $("#otherTooltip").show();
    setTooltipLocation(obj);
}
function hp5StatHover(obj) {
    $("#otherTooltipTitle").html("Hp5");
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html("The amount of health you regenerate over 5 seconds.");
    $("#otherTooltip").show();
    setTooltipLocation(obj);
}
function armourStatHover(obj) {
    $("#otherTooltipTitle").html("Armour");
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html("Reduces the damage you take from monsters.");
    $("#otherTooltip").show();
    setTooltipLocation(obj);
}
function evasionStatHover(obj) {
    $("#otherTooltipTitle").html("Evasion");
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html("Increases your chance to dodge a monster's attack.");
    $("#otherTooltip").show();
    setTooltipLocation(obj);
}
function strengthStatHover(obj) {
    $("#otherTooltipTitle").html("Strength");
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html("Increases your Health by 5 and Damage by 1%.");
    $("#otherTooltip").show();
    setTooltipLocation(obj);
}
function agilityStatHover(obj) {
    $("#otherTooltipTitle").html("Agility");
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html("Increases your Crit Damage by 0.2% and Evasion by 1%.");
    $("#otherTooltip").show();
    setTooltipLocation(obj);
}
function staminaStatHover(obj) {
    $("#otherTooltipTitle").html("Stamina");
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html("Increases your Hp5 by 1 and Armour by 1%.");
    $("#otherTooltip").show();
    setTooltipLocation(obj);
}
function critChanceStatHover(obj) {
    $("#otherTooltipTitle").html("Crit Chance");
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html("Increases your chance to get a critical strike.");
    $("#otherTooltip").show();
    setTooltipLocation(obj);
}
function critDamageStatHover(obj) {
    $("#otherTooltipTitle").html("Crit Damage");
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html("The amount of damage your critical strikes will cause.");
    $("#otherTooltip").show();
    setTooltipLocation(obj);
}
function itemRarityStatHover(obj) {
    $("#otherTooltipTitle").html("Item Rarity");
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html("Increases the chance that rarer items will drop from monsters.");
    $("#otherTooltip").show();
    setTooltipLocation(obj);
}
function goldGainStatHover(obj) {
    $("#otherTooltipTitle").html("Gold Gain");
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html("Increases the gold gained from monsters and mercenaries.");
    $("#otherTooltip").show();
    setTooltipLocation(obj);
}
function expGainStatHover(obj) {
    $("#otherTooltipTitle").html("Experience Gain");
    $("#otherTooltipCooldown").html('');
    $("#otherTooltipLevel").html('');
    $("#otherTooltipDescription").html("Increases the experience earned from killing monsters.");
    $("#otherTooltip").show();
    setTooltipLocation(obj);
}
function setTooltipLocation(obj) {
    var rect = obj.getBoundingClientRect();
    $("#otherTooltip").css('top', rect.top + 10);
    var leftReduction = document.getElementById("otherTooltip").scrollWidth;
    $("#otherTooltip").css('left', (rect.left - leftReduction - 10));
}
function statTooltipReset() {
    $("#otherTooltip").hide();
}

// Tutorials
function tutorialContinueButtonClick() {
    game.tutorialManager.continueTutorial();
}

var updatesWindowShown = false;
var statsWindowShown = false;
var optionsWindowShown = false;
// Updates Window
function updatesWindowButtonClick() {
    if (!updatesWindowShown) {
        updatesWindowShown = true;
        statsWindowShown = false;
        optionsWindowShown = false;
        $("#updatesWindow").show();
        $("#statsWindow").hide();
        $("#optionsWindow").hide();
    }
    else {
        updatesWindowShown = false;
        $("#updatesWindow").hide();
    }
}

// Stats Window
function statsWindowButtonClick() {
    if (!statsWindowShown) {
        updatesWindowShown = false;
        statsWindowShown = true;
        optionsWindowShown = false;
        $("#updatesWindow").hide();
        $("#statsWindow").show();
        $("#optionsWindow").hide();
    }
    else {
        statsWindowShown = false;
        $("#statsWindow").hide();
    }
}

// Options Window
function optionsWindowButtonClick() {
    if (!optionsWindowShown) {
        updatesWindowShown = false;
        statsWindowShown = false;
        optionsWindowShown = true;
        $("#updatesWindow").hide();
        $("#statsWindow").hide();
        $("#optionsWindow").show();
    }
    else {
        optionsWindowShown = false;
        $("#optionsWindow").hide();
    }
}

// Save Button
function saveButtonClick() {
    game.save();
}

// Reset Button
var fullReset = false;
function resetButtonClick() {
    fullReset = false;
    var powerShardsAvailable = game.calculatePowerShardReward();
    document.getElementById('resetDescription').innerHTML = 'This will erase all progress and not be recoverable. Are you sure you want to reset?';
    $("#resetConfirmWindowPowerShard").show();
    document.getElementById('powerShardsDescription').innerHTML = "You will earn " + powerShardsAvailable + " Power Shards from resetting.";
    $("#powerShardsDescription").show();
    $("#resetConfirmWindow").show();
}
function resetConfirmWindowYesButtonClick() {
    $("#resetConfirmWindow").hide();
    if (fullReset) {
        game.reset();
    }
    else {
        var powerShards = game.player.powerShards + game.calculatePowerShardReward();
        game.reset();
        game.player.powerShards = powerShards;
    }
}
function resetConfirmWindowNoButtonClick() {
    $("#resetConfirmWindow").hide();
}

function fullResetButtonClick() {
    fullReset = true;
    document.getElementById('resetDescription').innerHTML = 'This will erase all progress and not be recoverable, including Power Shards. Are you sure you want to reset?';
    $("#resetConfirmWindowPowerShard").hide();
    $("#powerShardsDescription").hide();

    $("#resetConfirmWindow").show();
}

// Options Menu
function optionsWindowExitButtonClick() {
    $("#optionsWindow").hide();
}


/*window.onload = function() {
    $("body").css('zoom', $(window).width() / 1280);
}
window.onresize = function () {
    $("body").css('zoom', $(window).width() / 1280);
}*/