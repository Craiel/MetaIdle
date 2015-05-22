var Game = {
	overallStats: new Stats('overall'),
	currentStats: new Stats('current'),

	lastUpdateTime: new Date(),
		
	Init:function() 
	{
		Game.Reset();
		Game.Load();
		Game.UpdateCreatures();
		
		$('#dnaClick').off('click').on('click',Game.ClickDNA);
		$('#save').off('click').on('click',Game.Save);
		$('#load').off('click').on('click',Game.Load);
		$('#reset').off('click').on('click',Game.Reset);
		$('#version').text(Game.version);
		
		// Elements
		$('#mon001, #mon002, #mon011, #mon012, #mon021, #mon022, #mon031, #mon032').off('click').on('click',Game.BuyCreature);
		// $('#slime_repro, #improved_click,#master_click, #slime_power_1,#tavern,#den,#crypt,#lair,#portal,#workshop, #torture_room,#golem_power_1, #golem_power_2,#slime_power_2, #magic_collector, #imp_summoning,#imp_power_1, #imp_power_2, #zombie_power_1, #zombie_power_2, #orc_power_1, #orc_power_2, #dragon_power_1, #dragon_power_2, #demon_power_1, #demon_power_2, #mana_power_1, #mana_power_2, #warlock_power_1, #warlock_power_2,#lich_power_1,#lich_power_2').off('click').on('click',Game.BuyUpgrade).hide();
		
		setInterval(Utils.Save, Game.saveInterval);
		setInterval(Game.Update, Game.updateInterval);
		
		GameState.Recalculate();
	},
	
	Save:function()
	{
		Game.currentStats.Save();
		Game.overallStats.Save();
		
		GameState.Save();
	},
	
	Load:function() 
	{
		Game.currentStats.Load();
		Game.overallStats.Load();
		
		GameState.Load();
	},
	
	Reset:function()
	{		
		Game.currentStats.Reset();
		Game.overallStats.Reset();
		
		GameState.Reset();
		
		Data.Reload();
		
		Game.UpdateCreatures();
		GameState.Recalculate();
	},
	
	CheckAchievements:function() 
	{
		for(var i = 0, l = Game.achievements.length; i<l;i++) {
			var achievement = Game.achievements[i];
			if(achievement.won)
			{
				 continue;
			}
			else if(achievement.type === Const.AchievementTypeClick)
			{
				if(Game.currentStats.soulClicks >= achievement.count)
				{
					achievement.won = true;
				}
			}
			else if(achievement.type === Const.AchievementTypeSouls)
			{
				if(Game.overallStats.souls >= achievement.count)
				{
					achievement.won = true;
				}
			}
			else if(achievement.type === Const.AchievementTypeMonsters)
			{
				for(var j = 0, len =  GameState.monsters.length;j<len;j++)
				{
					var monster = GameState.monsters[j];
					if(monster.name === achievement.which && monster.current >= achievement.count)
					{
						a.won = true;
					}
				}
			}
			else if(achievement.type === Const.AchievementTypeLevel)
			{
				if(Game.currentStats.baseLevel >= achievement.count)
				{
					achievement.won = true;
				}
			}
		}
	},
	
	ClickDNA: function()
	{
		Game.currentStats.dnaClicks += 1;
		
		var addValue = GameState.GetDNAClickValue();
		Game.currentStats.dna += addValue;
		Game.overallStats.dna += addValue;
		
		Game.currentStats.baseExperience += 1;
	},
	
	BuyCreature:function(evt)
	{
		var what = evt.currentTarget.id;
		var creature = GameState.GetCreature(what);
		if(creature == undefined)
		{
			return;
		}
		
		if(GameState.dna >= creature.cost)
		{
			GameState.AddCreature(creature);
			GameState.dna -= creature.cost;
			Game.UpdateCreatures();
			GameState.Recalculate();
		}
	},
	
	UpdateCreatures:function()
	{
		for(var i=0, l= GameState.creatures.length;i<l;i++)
		{
			var creature = GameState.creatures[i];
			$('#'+creature.name+'_title').text(Utils.numberWithCommas(creature.title));
			$('#'+creature.name+'_count').text(Utils.numberWithCommas(creature.count));
			$('#'+creature.name+'_price').text(Utils.numberWithCommas(creature.cost));
		}
	},
	
	BuyResearch:function(evt)
	{
		var name = evt.currentTarget.id;
		var research = GameState.GetResearch(name);
		if (research == null)
		{
			return;
		}
		
		if(research.type === Const.ResearchTypeDNAPerSecond)
		{
			if(currentStats.dna >= research.cost)
			{
				currentStats.dna -= upgrade.cost;
				currentStats.researchPurchased += 1;
				overallStats.researchPurchased += 1;
				
				$('#'+what).hide();
				research.acquired = true;
			}
			else
			{
				return;
			}
		}
		else if(research.type === Const.ResearchTypeCreditsPerSecond)
		{
			if(currentStats.credits >= upgrade.cost)
			{
				currentStats.credits -= upgrade.cost;
				
				$('#'+what).hide();
				research.acquired = true;
			} 
			else
			{
				return;
			}
		}
		else if(research.type === Const.ResearchTypeFeature)
		{
			if(currentStats.souls >= upgrade.costSouls && currentStats.magic >= upgrade.costMagic)
			{
				currentStats.souls -= upgrade.costSouls;
				currentStats.magic -= upgrade.costMagic;
				
				upgrade.Execute();
				if(upgrade.interval > 0)
				{
					setInterval(upgrade.ExecuteInterval, upgrade.interval);
				}
				
				$('#'+what).hide();
				u.bought = true;
			}
			
			// No need to recalculate for features or proc's
			return;
		}
		
		GameState.Recalculate();
	},

	Update: function (){
		var time = new Date();
		delta = time.getTime() - Game.lastUpdateTime.getTime();
		Game.lastUpdateTime.setTime(time.getTime());
		
		var secondsPassed = delta / 1000;
		
		var dnaGained = GameState.GetDNAIntervalValue(secondsPassed);
		GameState.dna += dnaGained;
		Game.currentStats.dna += dnaGained;
		Game.overallStats.dna += dnaGained;
		
		Game.currentStats.baseExperience += GameState.GetBaseExperienceIntervalValue(secondsPassed);
		
		if(Game.currentStats.baseExperience >= Game.currentStats.baseLevel * 1000)
		{
			Game.BaseLevelUp();
		}
		
		Game.CheckAchievements();
		Game.UpdateStats();
	},
	
	UpdateStats: function()
	{
		document.title = Utils.numberWithCommas(Game.souls) + ' - ' + Const.Title;
		
		$("#dna_current").text(Utils.numberWithCommas(GameState.dna));
		$("#dna_second").text(Utils.numberWithCommas(GameState.GetDNAIntervalValue(1)));
		
		$("#currstat_dna").text(Utils.numberWithCommas(Game.currentStats.dna));
		$("#currstat_dpc").text(Utils.numberWithCommas(GameState.GetDNAClickValue(1)));
		
		/*$('#dungeon_level').text(Game.currentStats.dungeonLevel);
		$('#dungeon_xp').text(Utils.numberWithCommas(Game.currentStats.dungeonExperience));
		$('#total_souls').text(Utils.numberWithCommas(Game.overallStats.souls));
		$('#total_clicks').text(Game.overallStats.soulClicks);
		$('#current_magic').text(Utils.numberWithCommas(Game.currentStats.magic)+ " Magic");
		$('#total_magic').text(Utils.numberWithCommas(Game.overallStats.magic));
		$('#xps').text(Utils.numberWithCommas(GameState.experiencePerSecond));
		$('#spc').text(Utils.numberWithCommas(GameState.GetSoulClickValue()));
		$('#mpm').text(Utils.numberWithCommas(GameState.magicPerSecond) + " Magic per second");
		
		var str='';
		var str_room='';
		for(var i = 0, l=Game.research.length;i<l;i++){
			var u = Game.research[i];
			if(u.bought && u.unlock !== "random"){
				str += u.name_shown +' - '+u.desc+ '<br>';
			}
			else if(u.bought && u.unlock === "random"){
				str_room += u.name_shown +' - '+u.desc+'<br>';
			}
			if( u.price > Game.souls || u.price_magic > Game.magic){
				$('#'+u.name).prop('disabled',true);
			}
			else if( u.price <= Game.souls || u.price_magic <= Game.magic){
				$('#'+u.name).prop('disabled',false);
			}
		}
		$('#upgrades_bought').html(str);
		$('#rooms_unlocked').html(str_room);
		str= '';
		var count = 0;
		for(var j =0, len = Game.achievements.length;j<len;j++){
			var a = Game.achievements[j];
			if(a.won){
				str +=a.name + ' : ' + a.desc+'<br>';
				count +=1;
			}
		}
		$('#achiev_count').text('('+count+'/'+Game.achievements.length+')');
		$('#achievements_unlocked').html(str);*/
	},

	BaseLevelUp:function()
	{
		Game.currentStats.baseLevel += 1;
		Game.currentStats.baseExperience = 0;
	},
	
	UpdateResearch:function()
	{
		for(var i =0,l = GameState.research.length; i<l;i++)
		{
			var research = Game.research[i];
			if(research.acquired)
			{
				$('#'+research.name).hide();
			}
			else
			{
				if(research.unlock === Const.ResearvhUnlockBaseLevel && currentStats.baseLevel >= research.unlockValue)
				{
					$('#'+research.name).show();
				}
				else if(research.unlock === Const.ResearchUnlockRandom && research.unlockValue)
				{
					$('#'+research.name).show();
				}
				else
				{
					$('#'+research.name).hide();
				}
			}
		}
	},
};

$(document).ready(function()
{
	Game.Init();
});
