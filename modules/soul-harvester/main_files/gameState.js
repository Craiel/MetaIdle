var GameState = {
	dna: 0,
	credits: 0,
	
	baseLevel: 1,
	baseExperience: 0,
	
	dnaPerSecond: 0,
	dnaPerClick: 1,
	
	experiencePerSecond: 1,
	
	magicPerSecond: 0,
	
	prestigeMultiplier: 1,
	achievementMultiplier: 1,
		
	creatures: [],
	technicians: [],
	research: [],
	crew: [],
	achievements: [],
	
	GetDNAClickValue: function()
	{
		return GameState.dnaPerClick;
	},
	
	GetDNAIntervalValue: function(secondsPassed)
	{
		return GameState.dnaPerSecond * secondsPassed;
	},
	
	GetBaseExperienceIntervalValue: function(secondsPassed)
	{
		var baseValue = GameState.experiencePerSecond * secondsPassed;
		var finalValue = baseValue * GameState.prestigeMultiplier * GameState.achievementMultiplier;
		return finalValue;
	},
	
	GetCreature: function(name)
	{
		for(var i = 0, count = GameState.creatures.length; i<count; i++)
		{
			var creature = GameState.creatures[i];
			if(creature.name === name)
			{
				return creature;
			}
		}
	},
	
	GetUpgrade: function(name)
	{
		for(var i = 0, count = GameState.upgrades.length; i<count; i++)
		{
			var upgrade = GameState.upgrades[i];
			if(upgrade.name === name)
			{
				return upgrade;
			}
		}
	},
	
	AddCreature: function(creature)
	{
		creature.count += 1;
		GameState.UpdateCreatures();
	},
	
	Save: function()
	{
		localStorage[Const.StoragePrefixGameState + 'dna'] = GameState.dna;
		localStorage[Const.StoragePrefixGameState + 'credits'] = GameState.credits;
		
		localStorage[Const.StoragePrefixGameState + 'BaseLevel'] = GameState.baseLevel;
		localStorage[Const.StoragePrefixGameState + 'BaseXP'] = GameState.baseExperience;
		
		for(var i=0,l=GameState.creatures.length;i<l;i++)
		{
			var creature = GameState.creatures[i];
			localStorage[Const.StoragePrefixCreatures + creature.name] = creature.count;
		}
		
		for(var i=0,l=GameState.research.length;i<l;i++)
		{
			var research = GameState.research[i];
			localStorage[Const.StoragePrefixResearch + research.name] = research.acquired;
			if(research.unlocked !== undefined && research.unlocked === true)
			{
				localStorage[Const.StoragePrefixResearch + research.name+'_unlocked']=true;
			}
		}
	},
	
	Load: function()
	{
		value = localStorage[Const.StoragePrefixGameState + 'dna'];
		if(value !== undefined)
		{
			GameState.dna = parseInt(value);
		}
		
		value = localStorage[Const.StoragePrefixGameState + 'credits'];
		if(value !== undefined)
		{
			GameState.credits = parseInt(value);
		}
		
		value = localStorage[Const.StoragePrefixGameState+'BaseLevel'];
		if(value !== undefined)
		{
			this.baseLevel = parseInt(value);
		}
	
		value = localStorage[Const.StoragePrefixGameState+'BaseXP'];
		if(value !== undefined)
		{
			this.baseExperience = parseInt(value);
		}
	
		for(var i = 0, l = GameState.creatures.length;i<l;i++)
		{
			var creature = GameState.creatures[i];
			if(localStorage[Const.StoragePrefixCreatures + creature.name] !== undefined)
			{
				creature.count = parseInt(localStorage[Const.StoragePrefixCreatures + creature.name]);
			}
		}
		
		GameState.UpdateCreatures();
		
		for(var j = 0,len = GameState.research.length; j < len; j++)
		{
			var research = GameState.research[j];
			if(localStorage[Const.StoragePrefixResearch + research.name] !== undefined)
			{
				if(localStorage[Const.StoragePrefixResearch + research.name] === "true")
				{
					research.acquired = true;
					if(research.unlock === Const.ResearchUnlockFeature)
					{
						research.Execute();
						if(research.interval > 0)
						{
							setInterval(research.ExecuteInterval, research.interval);
						}
					}
					else if(research.unlock === Const.ResearchUnlockRandom)
					{
						research.unlocked = true;
					}
				}
			}
		}
	},
	
	Reset: function()
	{
		GameState.dna = 0;
		GameState.credits = 0;
		
		GameState.soulsPerSecond = 0;
		GameState.soulsPerClick = 1;
	
		GameState.experiencePerSecond = 1;
	
		GameState.magicPerSecond = 0;
	
		GameState.prestigeMultiplier = 1;
		GameState.achievementMultiplier = 1;
			
		GameState.monsters = [];
		GameState.summoners = [];
		GameState.heros = [];
		GameState.upgrades = [];
	},
	
	Recalculate: function()
	{
		GameState.dnaPerSecond = 0;
		GameState.dnaPerClick = 1;
		
		for(var i = 0, count = GameState.creatures.length; i<count; i++)
		{
			var creature = GameState.creatures[i];
			if(creature.count < 1)
			{
				continue;
			}
			
			GameState.dnaPerSecond += (creature.count * creature.perSecond) * creature.multiplier;
			GameState.dnaPerClick += creature.count * creature.perClick;
		}
	},
	
	UpdateCreatures: function()
	{
	},
}
