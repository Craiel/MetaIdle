var Data = {
	Reload:function()
	{
		GameState.creatures = 
		[
			{name:'mon001', baseCost:0, count:0, cost:0, perSecond:0.1, perClick:0, multiplier:1, title:'Green Ooze'},
			{name:'mon002', baseCost:50, count:0, cost:50, perSecond:1.5, perClick:0, multiplier:1, title:'Radioactive Ooze'},
			
			{name:'mon011', baseCost:1000, count:0, cost:1000, perSecond:10, perClick:0, multiplier:1, title:'Incubated Slime'},
			{name:'mon012', baseCost:50000, count:0, cost:50000, perSecond:200, perClick:0, multiplier:1, title:'Evolved Slime'},
			
			{name:'mon021', baseCost:100000, count:0, cost:100000, perSecond:2500, perClick:0, multiplier:1, title:'Energy Golem'},
			{name:'mon022', baseCost:800000, count:0, cost:800000, perSecond:8000, perClick:0, multiplier:1, title:'Plasma Golem'},
			
			{name:'mon031', baseCost:40000000, count:0, cost:40000000, perSecond:200000, perClick:0, multiplier:1, title:'Reaper'},
			{name:'mon032', baseCost:100000000, count:0, cost:100000000, perSecond:500000, perClick:0, multiplier:1, title:'Cybernetic Reaper'},
		];
		
		GameState.technicians = 
		[
			{name:'tech000', baseCost:10, count:0, cost:10, perSecond:0.001, multiplier:1, title:'Alchemist'},
			{name:'tech010', baseCost:500, count:0, cost:500, perSecond:0.00001, multiplier:1, title:'Incubation Tank'},
			{name:'tech020', baseCost:20000, count:0, cost:20000, perSecond:0.000001, multiplier:1, title:'Golem Factory'},
			{name:'tech030', baseCost:200000, count:0, cost:200000, perSecond:0.0000001, multiplier:1, title:'Repear Plant'},
		];
		
		Game.research=[
			{name:'slime_repro',fn: '', type:'special', price:100000, price_magic:0, interval:600000, bought:false, level: 4, name_shown:'Slime Reproduction', unlock:'level', desc:'Periodically create a free slime'},
			{name:'magic_collector', type:'activation',fn:'',price_magic:0, price:1000000, fn_interval:'',interval:60000, bought:false, level: 6, name_shown:'Magic Collector', unlock:'level',special:false, desc:'Start collecting magic'},
			{name:'imp_summoning',fn:'', type:'special', price:2000000, interval:600000, bought:false, level: 8, name_shown:'Imp Summoning', price_magic: 10000, special: true, who: 'warlock', count: 5, unlock:'level',desc:'Warlocks will now try to summon imps periodically'},
			{name:'slime_power_1', type:'sps', what:'slime',increase:2,price_magic:0, price: 5000, bought:false, level: 2, name_shown:'Green Slime', unlock:'level',desc:'Slimes are twice as powerful'},
			{name:'slime_power_2', type:'sps', what:'slime',increase:2,price_magic:0, price: 20000, bought:false, level: 3, name_shown:'Metal Slime', unlock:'level',desc:'Slimes are twice as powerful'},
			{name:'imp_power_1', type:'sps', what:'imp',increase:2, price_magic:0,price: 50000, bought:false, level: 2, name_shown:'Improved Fireball', unlock:'level',desc:'Imps are twice as powerful'},
			{name:'imp_power_2', type:'sps', what:'imp',increase:2,price_magic:0, price: 200000, bought:false, level: 4, name_shown:'Unnamed(Imp 2)', unlock:'level',desc:'Imps are twice as powerful'},
			{name:'zombie_power_1', type:'sps', what:'zombie',increase:2, price_magic:0,price: 200000, bought:false, level: 3, name_shown:'Unnamed(Zombie 1)', unlock:'level',desc:'Zombies are twice as powerful'},
			{name:'zombie_power_2', type:'sps', what:'zombie',increase:2, price_magic:0,price: 1000000, bought:false, level: 5, name_shown:'Unnamed(Zombie 2)', unlock:'level',desc:'Zombies are twice as powerful'},
			{name:'orc_power_1', type:'sps', what:'orc',increase:2, price_magic:0,price: 500000, bought:false, level: 4, name_shown:'Leather armor', unlock:'level',desc:'Orcs are twice as powerful'},
			{name:'orc_power_2', type:'sps', what:'orc',increase:2, price_magic:0,price: 2000000, bought:false, level: 6, name_shown:'Steel sword', unlock:'level',desc:'Orcs are twice as powerful'},
			{name:'golem_power_1', type:'sps', what:'golem',increase:2,price_magic:0, price: 2000000, bought:false, level: 5, name_shown:'Improved Clay', unlock:'level',desc:'Golems are twice as powerful'},
			{name:'golem_power_2', type:'sps', what:'golem',increase:2,price_magic:0, price: 5000000, bought:false, level: 8, name_shown:'Superior Clay', unlock:'level',desc:'Golems are twice as powerful'},
			{name:'dragon_power_1', type:'sps', what:'dragon',increase:2,price_magic:0, price: 5000000, bought:false, level: 7, name_shown:'Blue Dragons', unlock:'level',desc:'Dragons are twice as powerful'},
			{name:'dragon_power_2', type:'sps', what:'dragon',increase:2,price_magic:0, price: 10000000, bought:false, level: 8, name_shown:'Red Dragons', unlock:'level',desc:'Dragons are twice as powerful'},
			{name:'demon_power_1', type:'sps', what:'demon',increase:2,price_magic:0, price: 10000000, bought:false, level: 9, name_shown:'Unnamed(Demon 1)', unlock:'level',desc:'Demons are twice as powerful'},
			{name:'demon_power_2', type:'sps', what:'demon',increase:2, price_magic:0,price: 100000000, bought:false, level: 10, name_shown:'Unnamed(Demon 2)', unlock:'level',desc:'Demons are twice as powerful'},
	
			{name:'mana_power_1', type:'mpm', what:'mana_beast',increase:2,price_magic:1000, price: 2000000, bought:false, level: 7, name_shown:'Unnamed(Mana Beasts 1)', unlock:'level',desc:'Mana beasts are twice as powerful'},
			{name:'mana_power_2', type:'mpm', what:'mana_beast',increase:2, price_magic:5000,price: 20000000, bought:false, level: 9, name_shown:'Unnamed(Mana Beasts 2)', unlock:'level',desc:'Mana beasts are twice as powerful'},
			{name:'warlock_power_1', type:'mpm', what:'warlock',increase:2,price_magic:10000, price: 20000000, bought:false, level: 11, name_shown:'Book of Eibon', unlock:'level',desc:'Warlocks are twice as powerful'},
			{name:'warlock_power_2', type:'mpm', what:'warlock',increase:2, price_magic:50000,price: 350000000, bought:false, level: 12, name_shown:'Necronomicon', unlock:'level',desc:'Warlocks are twice as powerful'},
			{name:'lich_power_1', type:'mpm', what:'lich',increase:2,price_magic:50000, price: 500000000, bought:false, level: 12, name_shown:'Cult of the Damned', unlock:'level',desc:'Liches are twice as powerful'},
			{name:'lich_power_2', type:'mpm', what:'lich',increase:2, price_magic:100000,price: 1000000000, bought:false, level: 13, name_shown:'Lich King', unlock:'level',desc:'Liches are twice as powerful'},
	
			{name:'improved_click', type:'cpct',increase:1, price: 100000,price_magic:0, bought:false, level: 4, name_shown:'Improved click', unlock:'level', desc:'Increase click power by 1% of sps'},
			{name:'master_click', type:'cpct',increase:2, price: 1000000,price_magic:0, bought:false, level: 10, name_shown:'Master click', unlock:'level', desc:'Increase click power by 2% of sps'},
			{name:'torture_room', type:'cpct',increase:3, price: 10000000,price_magic:0, bought:false, name_shown:'Torture room', unlock:'random',unlocked:false,desc:'You can now torture some heroes. Increase click by 3% of sps'},
			{name:'tavern', type:'cpct',increase:4, price: 100000000, price_magic:0,bought:false, name_shown:'Tavern', unlock:'random',unlocked:false,desc:'Your monsters can now rest and drink. Increase click by 4% of sps'},
			{name:'den', type:'sps', what:'orc',increase:2, price: 5000000,price_magic:0, bought:false, name_shown:'Den', unlock:'random',unlocked:false,desc:'Orcs live here. Orcs are twice as powerful'},
			{name:'crypt', type:'sps', what:'zombie',increase:2, price: 12000000, price_magic:0,bought:false, name_shown:'Crypt', unlock:'random',unlocked:false,desc:'Zombies live here. Zombies are twice as powerful'},
			{name:'lair', type:'sps', what:'dragon',increase:2, price: 50000000,price_magic:0, bought:false, name_shown:'Dragon\'s Lair', unlock:'random',unlocked:false,desc:'Dragons live here. Dragons are twice as powerful'},
			{name:'portal', type:'sps', what:'demon',increase:2, price: 500000000,price_magic:0, bought:false, name_shown:'Portal to Hell', unlock:'random',unlocked:false,desc:'Demons live here. Demons are twice as powerful'},
			{name:'workshop', type:'sps', what:'golem',increase:2, price: 15000000,price_magic:0, bought:false, name_shown:'Workshop', unlock:'random',unlocked:false,desc:'Golems live here. Golems are twice as powerful'},
		];
		
		Game.achievements=[
			{name:'Click master',type:'click',count:1000,won:false, desc:'You clicked 1000 times!'},
			{name:'Click expert',type:'click',count:10000,won:false, desc:'You clicked 10,000 times!'},
	
			{name:'State harvester',type:'souls',count:100000,won:false, desc:'You harvested 100K souls!'},
			{name:'Small nation harvester',type:'souls',count:1000000,won:false, desc:'You harvested 1M souls!'},
			{name:'Huge nation harvester',type:'souls',count:1000000000,won:false, desc:'You harvested 1B souls!'},
			{name:'World harvester',type:'souls',count:7188380897,won:false, desc:'You harvested 7,188,380,897 souls!'},
			
			{name:'Slime breeder',type:'monsters',which:'slime', count:10,won:false, desc:'You have a total of 10 slimes!'},
			{name:'Imp summoner',type:'monsters',which:'imp', count:10,won:false, desc:'You have a total of 10 imps!'},
			{name:'Night of the Living Dead',type:'monsters',which:'zombie', count:10,won:false, desc:'You have a total of 10 zombies!'},
			{name:'Orc mercenaries',type:'monsters',which:'orc', count:10,won:false, desc:'You have a total of 10 orcs!'},
			{name:'Apprentice potter',type:'monsters',which:'golem', count:10,won:false, desc:'You have a total of 10 golems!'},
			{name:'How to train your dragon',type:'monsters',which:'dragon', count:10,won:false, desc:'You have a total of 10 dragons!'},
			{name:'Demonic presence',type:'monsters',which:'demon', count:10,won:false, desc:'You have a total of 10 demons!'},
	
			{name:'The Blob',type:'monsters',which:'slime', count:25,won:false, desc:'You have a total of 25 slimes!'},
			{name:'Imp summoner 2',type:'monsters',which:'imp', count:25,won:false, desc:'You have a total of 25 imps!'},
			{name:'Dawn of the Dead',type:'monsters',which:'zombie', count:25,won:false, desc:'You have a total of 25 zombies!'},
			{name:'Small army',type:'monsters',which:'orc', count:25,won:false, desc:'You have a total of 25 orcs!'},
			{name:'Apprentice potter',type:'monsters',which:'golem', count:25,won:false, desc:'You have a total of 25 golems!'},
			{name:'How to speak Dragonese',type:'monsters',which:'dragon', count:25,won:false, desc:'You have a total of 25 dragons!'},
			{name:'Demonic portal',type:'monsters',which:'demon', count:25,won:false, desc:'You have a total of 25 demons!'},
	
			{name:'Oh gods, so much slime!',type:'monsters',which:'slime', count:50,won:false, desc:'You have a total of 50 slimes!'},
			{name:'Imp invasion',type:'monsters',which:'imp', count:50,won:false, desc:'You have a total of 50 imps!'},
			{name:'Day of the Dead',type:'monsters',which:'zombie', count:50,won:false, desc:'You have a total of 50 zombies!'},
			{name:'Big army',type:'monsters',which:'orc', count:50,won:false, desc:'You have a total of 50 orcs!'},
			{name:'Harry potter',type:'monsters',which:'golem', count:50,won:false, desc:'You have a total of 50 golems!'},
			{name:'How to cheat a Dragon\'s curse',type:'monsters',which:'dragon', count:50,won:false, desc:'You have a total of 50 dragons!'},
			{name:'Demonic realm',type:'monsters',which:'demon', count:50,won:false, desc:'You have a total of 50 demons!'},
	
			{name:'Apprentice Dungeon Master', type:'level',count:2,won:false,desc:'You got to level 2!'},
			{name:'Dungeon Master', type:'level',count:5,won:false,desc:'You got to level 5!'},
			{name:'Local dictator', type:'level',count:10,won:false,desc:'You got to level 10!'},
			{name:'Warlord', type:'level',count:15,won:false,desc:'You got to level 15!'},
			{name:'Death', type:'level',count:20,won:false,desc:'You got to level 20!'},
			{name:'Demigod', type:'level',count:25,won:false,desc:'You got to level 25!'},
			{name:'God', type:'level',count:30,won:false,desc:'You got to level 30!'},
			{name:'Master of the Solar System', type:'level',count:35,won:false,desc:'You got to level 35!'},
			{name:'Master of the Galaxy', type:'level',count:40,won:false,desc:'You got to level 40!'},
			{name:'Master of the Universe', type:'level',count:45,won:false,desc:'You got to level 45!'},
			{name:'Master of the Multiverse', type:'level',count:50,won:false,desc:'You got to level 50!'},
			{name:'Maybe it\'s time to start over?', type:'level',count:55,won:false,desc:'You got to level 55!'},
		]
		
		/*Game.upgrades[0].fn = Game.reproduce_slime;
		Game.upgrades[1].fn = Game.activate_magic;
		Game.upgrades[1].fn_interval = Game.make_magic;
		Game.upgrades[2].fn = Game.imp_summoning;
		Game.upgrades[3].fn = Game.activate_trader;*/
	},
};
