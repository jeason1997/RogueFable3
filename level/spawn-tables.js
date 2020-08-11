/*global gs, game, util, console*/
/*global NPC_COMMON_PERCENT, NPC_UNCOMMON_PERCENT, NPC_RARE_PERCENT*/
/*global NPC_ELITE_CHANCE, MIN_ELITE_LEVEL, SLEEPING_PERCENT, MOB_WANDER_PERCENT*/
/*global FACTION, NUM_NPCS, TIER_II_ZONES, TIER_III_ZONES, BRANCH_I_ZONES, BRANCH_II_ZONES, TIER_III_SPECIAL_ZONES*/
/*jshint esversion: 6*/
'use strict';

// CREATE_SPAWN_TABLES:
// ************************************************************************************************
gs.createSpawnTables = function () {
	this.spawnTables = {};
	this.uniqueSpawnTable = {};
	
	// MAIN_DUNGEON (TIER I):
	// ********************************************************************************************
	this.spawnTables.TheUpperDungeon = [
		// MAIN_DUNGEON_LEVEL_1:
		[{name: 'RatPack',				freq: 'COMMON'},
		 {name: 'RatNest',				freq: 'UNCOMMON'},
		 {name: 'Bat',					freq: 'COMMON'},
		 {name: 'BatPack',				freq: 'UNCOMMON'},
		 {name: 'GoblinArcher',			freq: 'UNCOMMON'},
		],
		
		// MAIN_DUNGEON_LEVEL_2:
		[{name: 'RatPack',				freq: 'COMMON'},
		 {name: 'RatNest',				freq: 'UNCOMMON'},
		 {name: 'Bat',					freq: 'COMMON'},
		 {name: 'BatPack',				freq: 'UNCOMMON'},
		 
		 {name: 'GoblinWarrior',		freq: 'COMMON'},
		 {name: 'GoblinArcher',			freq: 'UNCOMMON'},
		 {name: 'GoblinBrute',			freq: 'UNCOMMON'},
		 {name: 'GoblinFireMage',		freq: 'RARE'},
		 {name: 'GoblinStormMage',		freq: 'RARE'},
		],
		
		// MAIN_DUNGEON_LEVEL_3:
		[{name: 'RatPack',				freq: 'COMMON'},
		 {name: 'RatNest',				freq: 'UNCOMMON'},
		 {name: 'Bat',					freq: 'COMMON'},
		 {name: 'BatPack',				freq: 'COMMON'},
		 
		 {name: 'GoblinWarrior',		freq: 'COMMON'},
		 {name: 'GoblinArcher',			freq: 'COMMON'},
		 {name: 'GoblinBrute',			freq: 'COMMON'},
		 {name: 'GoblinFireMage',		freq: 'UNCOMMON'},
		 {name: 'GoblinStormMage',		freq: 'UNCOMMON'},
		 {name: 'GoblinShamanGroup',	freq: 'RARE'},
		 {name: 'Centipede',			freq: 'RARE'},
		 {name: 'CaveBear',				freq: 'RARE'},
		],
		
		// MAIN_DUNGEON_LEVEL_4:
		[{name: 'RatPack',				freq: 'COMMON'},
		 {name: 'RatNest',				freq: 'UNCOMMON'},
		 {name: 'BatPack',				freq: 'COMMON'},
		 
		 {name: 'GoblinWarrior',		freq: 'COMMON'},
		 {name: 'GoblinArcher',			freq: 'COMMON'},
		 {name: 'GoblinBrute',			freq: 'COMMON'},
		 {name: 'GoblinFireMage',		freq: 'UNCOMMON'},
		 {name: 'GoblinStormMage',		freq: 'UNCOMMON'},
		 {name: 'GoblinShamanGroup',	freq: 'UNCOMMON'},
		 {name: 'Centipede',			freq: 'RARE'},
		 {name: 'CaveBear',				freq: 'RARE'},
		],
	];
	
	this.uniqueSpawnTable.TheUpperDungeon = [
		{name: 'TheRatPiper',			minLevel: 3, maxLevel: 4, percent: 0.1},
		{name: 'TheVampireBat',			minLevel: 3, maxLevel: 4, percent: 0.1},
	];
	
	// THE_ORC_FORTRESS:
	// ********************************************************************************************
	this.spawnTables.TheOrcFortress = [
		// THE_ORC_FORTRESS_LEVEL_1:
		[{name: 'BatPack',				freq: 'RARE'},
		 {name: 'GoblinHoard',			freq: 'COMMON'},
		 
		 {name: 'WolfPack',				freq: 'COMMON'},
		 {name: 'OrcWarrior',			freq: 'COMMON'},
		 {name: 'OrcArcher',			freq: 'UNCOMMON'},
		 {name: 'WolfKennel',			freq: 'UNCOMMON'},
		 {name: 'Ogre',					freq: 'UNCOMMON'},
		 {name: 'OrcFireMage',			freq: 'RARE'},
		 {name: 'OrcStormMage',			freq: 'RARE'},
		],
		
		// THE_ORC_FORTRESS_LEVEL_2:
		[{name: 'GoblinHoard',			freq: 'UNCOMMON'},
		 
		 {name: 'WolfPack',				freq: 'COMMON'},
		 {name: 'OrcWarrior',			freq: 'COMMON'},
		 {name: 'OrcArcher',			freq: 'UNCOMMON'},
		 {name: 'WolfKennel',			freq: 'UNCOMMON'},
		 {name: 'Ogre',					freq: 'COMMON'},
		 {name: 'OrcFireMage',			freq: 'UNCOMMON'},
		 {name: 'OrcStormMage',			freq: 'UNCOMMON'},
		 {name: 'OrcPriestGroup',		freq: 'RARE'},
		],
		
		// THE_ORC_FORTRESS_LEVEL_3:
		[{name: 'GoblinHoard',			freq: 'RARE'},
		 
		 {name: 'WolfPack',				freq: 'COMMON'},
		 {name: 'OrcWarrior',			freq: 'COMMON'},
		 {name: 'OrcArcher',			freq: 'UNCOMMON'},
		 {name: 'WolfKennel',			freq: 'UNCOMMON'},
		 {name: 'Ogre',					freq: 'COMMON'},
		 {name: 'OrcFireMage',			freq: 'UNCOMMON'},
		 {name: 'OrcStormMage',			freq: 'UNCOMMON'},
		 {name: 'OrcPriestGroup',		freq: 'UNCOMMON'},
		 {name: 'OrcSummoner',			freq: 'RARE'},
		 
		 {name: 'ElectricEel',			freq: 'RARE'},
		],
		
		// THE_ORC_FORTRESS_LEVEL_4:
		[{name: 'WolfPack',				freq: 'COMMON'},	
		 {name: 'OrcWarrior',			freq: 'COMMON'},
		 {name: 'OrcArcher',			freq: 'COMMON'},
		 {name: 'WolfKennel',			freq: 'UNCOMMON'},
		 {name: 'Ogre',					freq: 'COMMON'},
		 {name: 'OrcFireMage',			freq: 'UNCOMMON'},
		 {name: 'OrcStormMage',			freq: 'UNCOMMON'},
		 {name: 'OrcPriestGroup',		freq: 'UNCOMMON'},
		 {name: 'OrcSummoner',			freq: 'UNCOMMON'},
		 
		 {name: 'OrcPack',				freq: 'RARE'},
		],
	];
	
	this.uniqueSpawnTable.TheOrcFortress = [
		{name: 'OrcKingPack', minLevel: 2, maxLevel: 4, percent: 0.1},
	];
	
	// THE_IRON_FORTRESS:
	// ********************************************************************************************
	this.spawnTables.TheIronFortress = [
		// THE_IRON_FORTRESS_LEVEL_1:
		[{name: 'ClockworkRatPack',		freq: 'COMMON'},
		 {name: 'ClockworkWarrior',		freq: 'COMMON'},
		 {name: 'ClockworkArcher',		freq: 'COMMON'},
		 {name: 'ClockworkFactory',		freq: 'RARE'},
		 {name: 'GoblinBomber',			freq: 'UNCOMMON'},
		],
		
		// THE_IRON_FORTRESS_LEVEL_2:
		[{name: 'ClockworkRatPack',		freq: 'COMMON'},
		 {name: 'ClockworkWarrior',		freq: 'COMMON'},
		 {name: 'ClockworkArcher',		freq: 'COMMON'},
		 {name: 'ClockworkFactory',		freq: 'RARE'},
		 {name: 'GoblinBomber',			freq: 'UNCOMMON'},
		 {name: 'ClockworkPyro',		freq: 'UNCOMMON'},
		 {name: 'Ballista',				freq: 'UNCOMMON'},
		 
		 {name: 'CorrosiveSlime',		freq: 'RARE'},
		],
		
		// THE_IRON_FORTRESS_LEVEL_3:
		[{name: 'ClockworkRatPack',		freq: 'COMMON'},
		 {name: 'ClockworkWarrior',		freq: 'COMMON'},
		 {name: 'ClockworkArcher',		freq: 'COMMON'},
		 {name: 'ClockworkFactory',		freq: 'RARE'},
		 {name: 'GoblinBomber',			freq: 'UNCOMMON'},
		 {name: 'ClockworkPyro',		freq: 'UNCOMMON'},
		 {name: 'Ballista',				freq: 'UNCOMMON'},
		 {name: 'ClockworkRhino',		freq: 'UNCOMMON'},
		 {name: 'BombomberPack',		freq: 'RARE'},
		 
		 {name: 'CorrosiveSlime',		freq: 'RARE'},
		],
		
		// THE_IRON_FORTRESS_LEVEL_4:
		[{name: 'ClockworkRatPack',		freq: 'COMMON'},
		 {name: 'ClockworkWarrior',		freq: 'COMMON'},
		 {name: 'ClockworkArcher',		freq: 'COMMON'},
		 {name: 'ClockworkFactory',		freq: 'RARE'},
		 {name: 'GoblinBomber',			freq: 'UNCOMMON'},
		 {name: 'ClockworkPyro',		freq: 'UNCOMMON'},
		 {name: 'Ballista',				freq: 'UNCOMMON'},
		 {name: 'ClockworkRhino',		freq: 'UNCOMMON'},
		 {name: 'BombomberPack',		freq: 'RARE'},
		 
		 {name: 'CorrosiveSlime',		freq: 'RARE'},
		],
	];
	
	
	// THE_SUNLESS_DESERT:
	// ********************************************************************************************
	this.spawnTables.TheSunlessDesert = [	
		// THE_SUNLESS_DESERT_LEVEL_1:
		[{name: 'RatNest',				freq: 'UNCOMMON'},
		 {name: 'BatPack',				freq: 'UNCOMMON'},
		 {name: 'GoblinHoard',			freq: 'COMMON'},
		 
		 {name: 'ScarabSwarm',			freq: 'COMMON'},
		 {name: 'SpittingViper',		freq: 'COMMON'},
		 {name: 'TrapDoorSpider',		freq: 'UNCOMMON'},
		],
		
		// THE_SUNLESS_DESERT_LEVEL_2:
		[{name: 'RatNest',				freq: 'UNCOMMON'},
		 {name: 'BatPack',				freq: 'UNCOMMON'},
		 {name: 'GoblinHoard',			freq: 'UNCOMMON'},
		 
		 {name: 'ScarabSwarm',			freq: 'COMMON'},
		 {name: 'SpittingViper',		freq: 'COMMON'},
		 {name: 'TrapDoorSpider',		freq: 'UNCOMMON'},
		 {name: 'Scorpion',				freq: 'UNCOMMON'},
		 {name: 'SunFlower',			freq: 'UNCOMMON'},
		],
		
		// THE_SUNLESS_DESERT_LEVEL_3:
		[{name: 'GoblinHoard',				freq: 'RARE'},
		 
		 {name: 'ScarabSwarm',				freq: 'COMMON'},
		 {name: 'SpittingViper',			freq: 'COMMON'},
		 {name: 'TrapDoorSpider',			freq: 'UNCOMMON'},
		 {name: 'Scorpion',					freq: 'COMMON'},
		 {name: 'SunFlower',				freq: 'UNCOMMON'},
		 {name: 'Mummy',					freq: 'COMMON'},
		 {name: 'GoatHerd',					freq: 'UNCOMMON'},
		 {name: 'MummyPriestGroup',			freq: 'UNCOMMON'},
		],
		
		// THE_SUNLESS_DESERT_LEVEL_4:
		[{name: 'ScarabSwarm',				freq: 'COMMON'},
		 {name: 'SpittingViper',			freq: 'COMMON'},
		 {name: 'TrapDoorSpider',			freq: 'UNCOMMON'},
		 {name: 'Scorpion',					freq: 'COMMON'},
		 {name: 'SunFlower',				freq: 'UNCOMMON'},
		 {name: 'Mummy',					freq: 'COMMON'},
		 {name: 'GoatHerd',					freq: 'UNCOMMON'},
		 {name: 'MummyPriestGroup',			freq: 'COMMON'},
		],
	];
	
	this.uniqueSpawnTable.TheSunlessDesert = [
		{name: 'CylomarTheAncientPyromancer', minLevel: 2, maxLevel: 4, percent: 1.1},
	];
	
	// THE_UNDER_GROVE:
	// ********************************************************************************************
	this.spawnTables.TheUnderGrove = [	
		// THE_UNDER_GROVE_LEVEL_1:
		[{name: 'RatNest',				freq: 'UNCOMMON'},
		 {name: 'BatPack',				freq: 'UNCOMMON'},
		 {name: 'GoblinHoard',			freq: 'COMMON'},
		 
		 {name: 'Jaguar',				freq: 'COMMON'},
		 {name: 'Spider',				freq: 'COMMON'},
		 {name: 'SpiderNest',			freq: 'UNCOMMON'},
		 {name: 'PoisonSpider',			freq: 'COMMON'},
		],
		
		// THE_UNDER_GROVE_LEVEL_2:
		[{name: 'RatPack',				freq: 'UNCOMMON'},
		 {name: 'RatNest',				freq: 'UNCOMMON'},
		 {name: 'BatPack',				freq: 'UNCOMMON'},
		 {name: 'GoblinHoard',			freq: 'UNCOMMON'},
		 
		 {name: 'Jaguar',				freq: 'COMMON'},
		 {name: 'Spider',				freq: 'COMMON'},
		 {name: 'SpiderNest',			freq: 'UNCOMMON'},
		 {name: 'PoisonSpider',			freq: 'COMMON'},
		 {name: 'CentaurArcher',		freq: 'UNCOMMON'},
		 {name: 'CentaurWarrior',		freq: 'COMMON'},
		 {name: 'GiantBeePack',			freq: 'UNCOMMON'},
		 
		 {name: 'ElectricEel',			freq: 'RARE'},
		 
		],
		
		// THE_UNDER_GROVE_LEVEL_3:
		[{name: 'GoblinHoard',			freq: 'RARE'},
		 
		 {name: 'Jaguar',				freq: 'COMMON'},
		 {name: 'Spider',				freq: 'COMMON'},
		 {name: 'SpiderNest',			freq: 'UNCOMMON'},
		 {name: 'PoisonSpider',			freq: 'COMMON'},
		 {name: 'CentaurArcher',		freq: 'UNCOMMON'},
		 {name: 'CentaurWarrior',		freq: 'COMMON'},
		 {name: 'Chameleon',			freq: 'UNCOMMON'},
		 {name: 'ElephantPack',			freq: 'RARE'},
		 {name: 'GiantBeePack',			freq: 'UNCOMMON'},
		 
		 {name: 'ElectricEel',			freq: 'RARE'},
		],
		
		// THE_UNDER_GROVE_LEVEL_4:
		[{name: 'Jaguar',				freq: 'COMMON'},
		 {name: 'Spider',				freq: 'COMMON'},
		 {name: 'SpiderNest',			freq: 'UNCOMMON'},
		 {name: 'PoisonSpider',			freq: 'COMMON'},
		 {name: 'CentaurArcher',		freq: 'UNCOMMON'},
		 {name: 'CentaurWarrior',		freq: 'COMMON'},
		 {name: 'Chameleon',			freq: 'UNCOMMON'},
		 {name: 'ElephantPack',			freq: 'UNCOMMON'},
		 {name: 'GiantBeePack',			freq: 'UNCOMMON'},
		 
		 {name: 'ElectricEel',			freq: 'RARE'},
		],
	];
	
	this.uniqueSpawnTable.TheUnderGrove = [
		{name: 'TheQueenSpider',		minLevel: 3, maxLevel: 6, percent: 0.1},
	];
	
	// THE_SWAMP:
	// ********************************************************************************************
	this.spawnTables.TheSwamp = [	
		// THE_SWAMP_LEVEL_1:
		[{name: 'RatNest',				freq: 'UNCOMMON'},
		 {name: 'BatPack',				freq: 'UNCOMMON'},
		 {name: 'GoblinHoard',			freq: 'COMMON'},
		 
		 {name: 'PirahnaPack',			freq: 'UNCOMMON'},
		 {name: 'FrogPack',				freq: 'COMMON'},
		 {name: 'PoisonViper',			freq: 'UNCOMMON'},
		 {name: 'SpinyFrog',			freq: 'UNCOMMON'},
		],
		
		// THE_SWAMP_LEVEL_2:
		[{name: 'RatNest',				freq: 'UNCOMMON'},
		 {name: 'BatPack',				freq: 'UNCOMMON'},
		 {name: 'GoblinHoard',			freq: 'UNCOMMON'},
		 
		 {name: 'PirahnaPack',			freq: 'UNCOMMON'},
		 {name: 'FrogPack',				freq: 'COMMON'},
		 {name: 'PoisonViper',			freq: 'UNCOMMON'},
		 {name: 'SpinyFrog',			freq: 'COMMON'},
		 
		 {name: 'ElectricEel',			freq: 'RARE'},
		],
		
		// THE_SWAMP_LEVEL_3:
		[{name: 'GoblinHoard',			freq: 'RARE'},
		 
		 {name: 'PirahnaPack',			freq: 'UNCOMMON'},
		 {name: 'FrogPack',				freq: 'COMMON'},
		 {name: 'PoisonViper',			freq: 'COMMON'},
		 {name: 'SpinyFrog',			freq: 'COMMON'},
		 {name: 'Mosquito',				freq: 'UNCOMMON'},
		 {name: 'BullFrog',				freq: 'UNCOMMON'},
		 {name: 'SnappingTurtle',		freq: 'UNCOMMON'},
		 {name: 'LickyToad',			freq: 'UNCOMMON'},
		 
		 {name: 'ElectricEel',			freq: 'UNCOMMON'},
		],
		
		// THE_SWAMP_LEVEL_4:
		[{name: 'PirahnaPack',			freq: 'UNCOMMON'},
		 {name: 'FrogPack',				freq: 'COMMON'},
		 {name: 'PoisonViper',			freq: 'COMMON'},
		 {name: 'SpinyFrog',			freq: 'COMMON'},
		 {name: 'Mosquito',				freq: 'UNCOMMON'},
		 {name: 'BullFrog',				freq: 'COMMON'},
		 {name: 'SnappingTurtle',		freq: 'COMMON'},
		 {name: 'LickyToad',			freq: 'UNCOMMON'},
		 
		 {name: 'ElectricEel',			freq: 'COMMON'},
		],
	];
	
	this.uniqueSpawnTable.TheSwamp = [
		{name: 'KasicTheMosquitoPrince',			minLevel: 2, maxLevel: 4, percent: 0.1},
	];
	
	// THE_DARK_TEMPLE:
	// ********************************************************************************************
	this.spawnTables.TheDarkTemple = [
		// THE_DARK_TEMPLE (LEVEL 1):
		[{name: 'OrcPack',				freq: 'COMMON'},
		 
		 {name: 'DarkElfWarden',		freq: 'COMMON'},
		 {name: 'DarkElfSentinel',		freq: 'COMMON'},
		 {name: 'DarkElfPyromancer',	freq: 'UNCOMMON'},
		 {name: 'DarkElfStormologist',	freq: 'UNCOMMON'},
		 {name: 'DarkElfPriestGroup',	freq: 'UNCOMMON'},
		 
		 {name: 'CorrosiveSlime',		freq: 'RARE'},
		 {name: 'TentacleSpitter',		freq: 'RARE'},
		 {name: 'ManaViper',			freq: 'RARE'},
		 {name: 'StoneGolem',			freq: 'RARE'},
		 {name: 'NecromancerPack',		freq: 'RARE'},
		],
		
		// THE_DARK_TEMPLE (LEVEL 2):
		[{name: 'OrcPack',				freq: 'UNCOMMON'},
		 
		 {name: 'DarkElfWarden',		freq: 'COMMON'},
		 {name: 'DarkElfSentinel',		freq: 'COMMON'},
		 {name: 'DarkElfPyromancer',	freq: 'UNCOMMON'},
		 {name: 'DarkElfStormologist',	freq: 'UNCOMMON'},
		 {name: 'DarkElfPriestGroup',	freq: 'UNCOMMON'},
		 {name: 'DarkElfSummoner',		freq: 'UNCOMMON'},
		 
		 {name: 'CorrosiveSlime',		freq: 'RARE'},
		 {name: 'TentacleSpitter',		freq: 'RARE'},
		 {name: 'ManaViper',			freq: 'RARE'},
		 {name: 'StoneGolem',			freq: 'RARE'},
		 {name: 'NecromancerPack',		freq: 'RARE'},
		],

		// THE_DARK_TEMPLE (LEVEL 3):
		[{name: 'OrcPack',				freq: 'RARE'},
	
		 {name: 'DarkElfWarden',		freq: 'COMMON'},
		 {name: 'DarkElfSentinel',		freq: 'COMMON'},
		 {name: 'DarkElfPyromancer',	freq: 'UNCOMMON'},
		 {name: 'DarkElfStormologist',	freq: 'UNCOMMON'},
		 {name: 'DarkElfPriestGroup',	freq: 'UNCOMMON'},
		 {name: 'DarkElfSummoner',		freq: 'UNCOMMON'},
		 {name: 'EvilEye',				freq: 'RARE'},
		 
		 {name: 'CorrosiveSlime',		freq: 'RARE'},
		 {name: 'TentacleSpitter',		freq: 'RARE'},
		 {name: 'ManaViper',			freq: 'RARE'},
		 {name: 'StoneGolem',			freq: 'RARE'},
		 {name: 'NecromancerPack',		freq: 'RARE'},
		],
		
		// THE_DARK_TEMPLE (LEVEL 4):
		[{name: 'DarkElfWarden',		freq: 'COMMON'},
		 {name: 'DarkElfSentinel',		freq: 'COMMON'},
		 {name: 'DarkElfPyromancer',	freq: 'UNCOMMON'},
		 {name: 'DarkElfStormologist',	freq: 'UNCOMMON'},
		 {name: 'DarkElfPriestGroup',	freq: 'UNCOMMON'},
		 {name: 'DarkElfSummoner',		freq: 'UNCOMMON'},
		 {name: 'EvilEye',				freq: 'RARE'},
		 
		 {name: 'CorrosiveSlime',		freq: 'RARE'},
		 {name: 'TentacleSpitter',		freq: 'RARE'},
		 {name: 'ManaViper',			freq: 'RARE'},
		 {name: 'StoneGolem',			freq: 'RARE'},
		 {name: 'NecromancerPack',		freq: 'RARE'},
		],
	];
	
	
	// THE_CRYPT:
	// ********************************************************************************************
	this.spawnTables.TheCrypt = [
		// THE_CRYPT_LEVEL 1:
		[{name: 'MaggotPack',			freq: 'COMMON'},
		 {name: 'RottingCorpse',		freq: 'UNCOMMON'},
		 {name: 'SkeletonWarrior',		freq: 'COMMON'},
		 {name: 'SkeletonArcher',		freq: 'COMMON'},
		 {name: 'SkeletonPack',			freq: 'UNCOMMON'},
		],
		
		// THE_CRYPT_LEVEL 2:
		[{name: 'MaggotPack',			freq: 'COMMON'},
		 {name: 'RottingCorpse',		freq: 'UNCOMMON'},
		 {name: 'SkeletonWarrior',		freq: 'COMMON'},
		 {name: 'SkeletonArcher',		freq: 'COMMON'},
		 {name: 'SkeletonPack',			freq: 'UNCOMMON'},
		 {name: 'NecromancerPack',		freq: 'COMMON'},
		],
		
		// THE_CRYPT_LEVEL 3:
		[{name: 'MaggotPack',			freq: 'COMMON'},
		 {name: 'RottingCorpse',		freq: 'UNCOMMON'},
		 {name: 'SkeletonWarrior',		freq: 'COMMON'},
		 {name: 'SkeletonArcher',		freq: 'COMMON'},
		 {name: 'SkeletonPack',			freq: 'UNCOMMON'},
		 {name: 'NecromancerPack',		freq: 'COMMON'},
		 {name: 'ZombieBloat',			freq: 'COMMON'},
		 {name: 'Wraith',				freq: 'RARE'},
		 {name: 'MagicEye',				freq: 'RARE'}
		],
		
		// THE_CRYPT_LEVEL 4:
		[{name: 'MaggotPack',			freq: 'UNCOMMON'},
		 {name: 'RottingCorpse',		freq: 'UNCOMMON'},
		 {name: 'SkeletonWarrior',		freq: 'COMMON'},
		 {name: 'SkeletonArcher',		freq: 'COMMON'},
		 {name: 'SkeletonPack',			freq: 'UNCOMMON'},
		 {name: 'NecromancerPack',		freq: 'COMMON'},
		 {name: 'ZombieBloat',			freq: 'COMMON'},
		 {name: 'Wraith',				freq: 'UNCOMMON'},
		 {name: 'MagicEye',				freq: 'RARE'}
		],	
	];
	
	// THE_LICH_KINGS_LAIR:
	this.spawnTables.TheLichKingsLair = [
		// THE_CRYPT_LEVEL 4:
		[{name: 'MaggotPack',			freq: 'UNCOMMON'},
		 {name: 'RottingCorpse',		freq: 'RARE'},
		 {name: 'SkeletonWarrior',		freq: 'COMMON'},
		 {name: 'SkeletonArcher',		freq: 'COMMON'},
		 {name: 'SkeletonPack',			freq: 'COMMON'},
		 {name: 'NecromancerPack',		freq: 'COMMON'},
		 {name: 'ZombieBloat',			freq: 'COMMON'},
		 {name: 'Wraith',				freq: 'UNCOMMON'},
		],	
	];
	
	// THE_VAULT_OF_YENDOR:
	// ********************************************************************************************
	this.spawnTables.VaultOfYendor = [
		// THE_VAULT_OF_YENDOR (LEVEL 1):
		[{name: 'DarkElfHoard',			freq: 'UNCOMMON'},
		 {name: 'DarkElfPriestGroup',	freq: 'UNCOMMON'},
		 
		 // Yendor Monsters:
		 {name: 'HellHoundPack',		freq: 'COMMON'},
		 {name: 'DrachnidWarrior',		freq: 'COMMON'},
		 {name: 'DrachnidArcher',		freq: 'COMMON'},
		 {name: 'DarkElfBladeDancer',	freq: 'UNCOMMON'},
		 {name: 'CrystalGolem',			freq: 'UNCOMMON'},
		 {name: 'FleshGolem',			freq: 'UNCOMMON'},
		 
		 // Branch Monsters:
		 {name: 'Troll',				freq: 'UNCOMMON'},
		 {name: 'IceElemental',			freq: 'UNCOMMON'},
		 {name: 'FireElemental',		freq: 'UNCOMMON'},
		 {name: 'StormElemental',		freq: 'UNCOMMON'},
		 {name: 'Slime',				freq: 'UNCOMMON'},
		 {name: 'ManaViper',			freq: 'UNCOMMON'},
		 
		 // Statues:
		 {name: 'IceStatue',			freq: 'RARE'},
		 {name: 'FireStatue',			freq: 'RARE'},
		 {name: 'StormStatue',			freq: 'RARE'},
		 {name: 'ToxicStatue',			freq: 'RARE'},
		 
		 // Liquid Monsters:
		 {name: 'TentacleSpitter',		freq: 'RARE'},
		 {name: 'LavaEel',				freq: 'RARE'},
		],
		
		// THE_VAULT_OF_YENDOR (LEVEL 2):
		[{name: 'DarkElfHoard',			freq: 'UNCOMMON'},
		 {name: 'DarkElfPriestGroup',	freq: 'UNCOMMON'},
		 
		 // Yendor Monsters:
		 {name: 'HellHoundPack',		freq: 'COMMON'},
		 {name: 'DrachnidWarrior',		freq: 'COMMON'},
		 {name: 'DrachnidArcher',		freq: 'COMMON'},
		 {name: 'DarkElfBladeDancer',	freq: 'COMMON'},
		 {name: 'CrystalGolem',			freq: 'UNCOMMON'},
		 {name: 'FleshGolem',			freq: 'UNCOMMON'},
		 {name: 'TentacleTerror',		freq: 'UNCOMMON'},
		 {name: 'Succubus',				freq: 'RARE'},
		 
		 // Branch Monsters:
		 {name: 'Troll',				freq: 'UNCOMMON'},
		 {name: 'IceElemental',			freq: 'UNCOMMON'},
		 {name: 'FireElemental',		freq: 'UNCOMMON'},
		 {name: 'StormElemental',		freq: 'UNCOMMON'},
		 {name: 'Slime',				freq: 'UNCOMMON'},
		 {name: 'ManaViper',			freq: 'UNCOMMON'},
		 
		 // Statues:
		 {name: 'IceStatue',			freq: 'RARE'},
		 {name: 'FireStatue',			freq: 'RARE'},
		 {name: 'StormStatue',			freq: 'RARE'},
		 {name: 'ToxicStatue',			freq: 'RARE'},
		 
		 // Liquid Monsters:
		 {name: 'TentacleSpitter',		freq: 'RARE'},
		 {name: 'LavaEel',				freq: 'RARE'},
		],

		// THE_VAULT_OF_YENDOR (LEVEL 3):
		[{name: 'DarkElfHoard',			freq: 'RARE'},
		 {name: 'DarkElfPriestGroup',	freq: 'RARE'},
		 
		 // Yendor Monsters:
		 {name: 'HellHoundPack',		freq: 'COMMON'},
		 {name: 'DrachnidWarrior',		freq: 'COMMON'},
		 {name: 'DrachnidArcher',		freq: 'COMMON'},
		 {name: 'DarkElfBladeDancer',	freq: 'COMMON'},
		 {name: 'CrystalGolem',			freq: 'COMMON'},
		 {name: 'FleshGolem',			freq: 'UNCOMMON'},
		 {name: 'TentacleTerror',		freq: 'UNCOMMON'},
		 {name: 'Succubus',				freq: 'RARE'},
		 
		 // Branch Monsters:
		 {name: 'Troll',				freq: 'UNCOMMON'},
		 {name: 'IceElemental',			freq: 'UNCOMMON'},
		 {name: 'FireElemental',		freq: 'UNCOMMON'},
		 {name: 'StormElemental',		freq: 'UNCOMMON'},
		 {name: 'Slime',				freq: 'UNCOMMON'},
		 {name: 'ManaViper',			freq: 'UNCOMMON'},
		 
		 // Statues:
		 {name: 'IceStatue',			freq: 'RARE'},
		 {name: 'FireStatue',			freq: 'RARE'},
		 {name: 'StormStatue',			freq: 'RARE'},
		 {name: 'ToxicStatue',			freq: 'RARE'},
		 
		 {name: 'TentacleSpitter',		freq: 'RARE'},
		 {name: 'LavaEel',				freq: 'RARE'},
		],
		
		// THE_VAULT_OF_YENDOR (LEVEL 4):
		// Yendor Monsters:
		[{name: 'HellHoundPack',		freq: 'COMMON'},
		 {name: 'DrachnidWarrior',		freq: 'COMMON'},
		 {name: 'DrachnidArcher',		freq: 'COMMON'},
		 {name: 'DarkElfBladeDancer',	freq: 'COMMON'},
		 {name: 'CrystalGolem',			freq: 'COMMON'},
		 {name: 'FleshGolem',			freq: 'UNCOMMON'},
		 {name: 'TentacleTerror',		freq: 'UNCOMMON'},
		 {name: 'Succubus',				freq: 'RARE'},
		 
		 // Branch Monsters:
		 {name: 'Troll',				freq: 'UNCOMMON'},
		 {name: 'IceElemental',			freq: 'UNCOMMON'},
		 {name: 'FireElemental',		freq: 'UNCOMMON'},
		 {name: 'StormElemental',		freq: 'UNCOMMON'},
		 {name: 'Slime',				freq: 'UNCOMMON'},
		 {name: 'ManaViper',			freq: 'UNCOMMON'},
		 
		 // Statues:
		 {name: 'IceStatue',			freq: 'RARE'},
		 {name: 'FireStatue',			freq: 'RARE'},
		 {name: 'StormStatue',			freq: 'RARE'},
		 {name: 'ToxicStatue',			freq: 'RARE'},
		 
		 // Liquid Monsters:
		 {name: 'TentacleSpitter',		freq: 'RARE'},
		 {name: 'LavaEel',				freq: 'RARE'},
		],
	];
	
	
	// THE_ARCANE_TOWER:
	// ********************************************************************************************
	this.spawnTables.TheArcaneTower = [	
		// LEVEL_1:
		[{name: 'ManaViper',			freq: 'UNCOMMON'},
		 {name: 'FireImp',				freq: 'COMMON'},
		 {name: 'StormImp',				freq: 'COMMON'},
		 {name: 'IceImp',				freq: 'COMMON'},
		 {name: 'StoneGolem',			freq: 'UNCOMMON'},
		 {name: 'FireStaffTurret',		freq: 'RARE'},
		],
		
		// LEVEL_2:
		[{name: 'ManaViper',			freq: 'UNCOMMON'},
		 {name: 'FireImp',				freq: 'COMMON'},
		 {name: 'StormImp',				freq: 'COMMON'},
		 {name: 'IceImp',				freq: 'COMMON'},
		 {name: 'StoneGolem',			freq: 'UNCOMMON'},
		 {name: 'FireStaffTurret',		freq: 'UNCOMMON'},
		 {name: 'StormStatue',			freq: 'RARE'},
		],
		
		// LEVEL_3:
		[{name: 'ManaViper',			freq: 'UNCOMMON'},
		 {name: 'FireImp',				freq: 'COMMON'},
		 {name: 'StormImp',				freq: 'COMMON'},
		 {name: 'IceImp',				freq: 'COMMON'},
		 {name: 'StoneGolem',			freq: 'COMMON'},
		 {name: 'FireStaffTurret',		freq: 'UNCOMMON'},
		 {name: 'StormStatue',			freq: 'RARE'},
		],
		
		// LEVEL_4:
		[{name: 'ManaViper',			freq: 'UNCOMMON'},
		 {name: 'FireImp',				freq: 'COMMON'},
		 {name: 'StormImp',				freq: 'COMMON'},
		 {name: 'IceImp',				freq: 'COMMON'},
		 {name: 'StoneGolem',			freq: 'COMMON'},
		 {name: 'FireStaffTurret',		freq: 'UNCOMMON'},
		 {name: 'StormStatue',			freq: 'UNCOMMON'},
		],
	];
	
	
	
	
	// THE_SEWERS:
	// ********************************************************************************************
	this.spawnTables.TheSewers = [
		// THE_SEWERS_LEVEL_1:
		[{name: 'MaggotPack',			freq: 'COMMON'},
		 {name: 'GiantLeach',			freq: 'COMMON'},
		 {name: 'RottingCorpse',		freq: 'UNCOMMON'},
		 {name: 'Troll',				freq: 'UNCOMMON'},
		 {name: 'TentacleSpitter',		freq: 'UNCOMMON'},
		 {name: 'Crocodile',			freq: 'UNCOMMON'},
		 {name: 'AcidicSlime',			freq: 'UNCOMMON'},
		 {name: 'BoaConstrictor',		freq: 'RARE'},
		 {name: 'Bloat',				freq: 'RARE'},
		 
		 {name: 'CorrosiveSlime',		freq: 'RARE'},
		],
		
		// THE_SEWERS_LEVEL_2:
		[{name: 'MaggotPack',			freq: 'COMMON'},
		 {name: 'GiantLeach',			freq: 'COMMON'},
		 
		 {name: 'RottingCorpse',		freq: 'UNCOMMON'},
		 {name: 'Troll',				freq: 'UNCOMMON'},
		 {name: 'TentacleSpitter',		freq: 'COMMON'},
		 {name: 'Crocodile',			freq: 'COMMON'},
		 {name: 'Bloat',				freq: 'UNCOMMON'},
		 {name: 'AcidicSlime',			freq: 'UNCOMMON'},
		 {name: 'BoaConstrictor',		freq: 'UNCOMMON'},
		 {name: 'Slime',				freq: 'RARE'},
		 {name: 'ToxicStatue',			freq: 'RARE'},
		 
		 {name: 'CorrosiveSlime',		freq: 'RARE'},
		],
		
		// THE_SEWERS_LEVEL_3:
		[{name: 'MaggotPack',			freq: 'COMMON'},
		 {name: 'GiantLeach',			freq: 'COMMON'},
		 {name: 'RottingCorpse',		freq: 'UNCOMMON'},
		 {name: 'Troll',				freq: 'UNCOMMON'},
		 {name: 'TentacleSpitter',		freq: 'COMMON'},
		 {name: 'Crocodile',			freq: 'COMMON'},
		 {name: 'Bloat',				freq: 'COMMON'},
		 {name: 'AcidicSlime',			freq: 'COMMON'},
		 {name: 'BoaConstrictor',		freq: 'COMMON'},
		 {name: 'Slime',				freq: 'UNCOMMON'},
		 {name: 'ToxicStatue',			freq: 'RARE'},
		 {name: 'MagicEye',				freq: 'RARE'},
		 
		 {name: 'CorrosiveSlime',		freq: 'RARE'},
		],
		 
		// THE_SEWERS_LEVEL_4:
		[{name: 'MaggotPack',			freq: 'UNCOMMON'},
		 {name: 'GiantLeach',			freq: 'COMMON'},
		 {name: 'RottingCorpse',		freq: 'UNCOMMON'},
		 {name: 'Troll',				freq: 'UNCOMMON'},
		 {name: 'TentacleSpitter',		freq: 'UNCOMMON'},
		 {name: 'Crocodile',			freq: 'COMMON'},
		 {name: 'Bloat',				freq: 'COMMON'},
		 {name: 'AcidicSlime',			freq: 'COMMON'},
		 {name: 'BoaConstrictor',		freq: 'COMMON'},
		 {name: 'Slime',				freq: 'COMMON'},
		 {name: 'ToxicStatue',			freq: 'UNCOMMON'},
		 {name: 'MagicEye',				freq: 'RARE'},
		 
		 {name: 'CorrosiveSlime',		freq: 'RARE'},
		],
	];
	
	
	
	
	
	// THE_CORE:
	// ********************************************************************************************
	this.spawnTables.TheCore = [
		// THE_CORE_LEVEL_1:
		[{name: 'FireBatPack',		freq: 'COMMON'},
		 {name: 'FireLizard',		freq: 'COMMON'},
		 {name: 'FireBatNest',		freq: 'UNCOMMON'},
		 {name: 'LavaEel',			freq: 'COMMON'},
		 {name: 'FireStatue',		freq: 'UNCOMMON'},
		 {name: 'FireElemental',	freq: 'RARE'},
		 {name: 'MagicEye',			freq: 'RARE'}
		],
		
		// THE_CORE_LEVEL_2:
		[{name: 'FireBatPack',		freq: 'COMMON'},
		 {name: 'FireLizard',		freq: 'COMMON'},
		 {name: 'FireBatNest',		freq: 'UNCOMMON'},
		 {name: 'LavaEel',			freq: 'COMMON'},
		 {name: 'FireStatue',		freq: 'UNCOMMON'},
		 {name: 'FireElemental',	freq: 'UNCOMMON'},
		 {name: 'ObsidianGolem',	freq: 'RARE'},
		 {name: 'MagicEye',			freq: 'RARE'}
		],
		
		// THE_CORE_LEVEL_3:
		[{name: 'FireBatPack',		freq: 'COMMON'},
		 {name: 'FireLizard',		freq: 'COMMON'},
		 {name: 'FireBatNest',		freq: 'UNCOMMON'},
		 {name: 'LavaEel',			freq: 'COMMON'},
		 {name: 'FireStatue',		freq: 'UNCOMMON'},
		 {name: 'FireElemental',	freq: 'COMMON'},
		 {name: 'ObsidianGolem',	freq: 'RARE'},
		 {name: 'MagicEye',			freq: 'RARE'}
		],
		
		// THE_CORE_LEVEL_4:
		[{name: 'FireBatPack',		freq: 'COMMON'},
		 {name: 'FireLizard',		freq: 'COMMON'},
		 {name: 'FireBatNest',		freq: 'UNCOMMON'},
		 {name: 'LavaEel',			freq: 'COMMON'},
		 {name: 'FireStatue',		freq: 'UNCOMMON'},
		 {name: 'FireElemental',	freq: 'COMMON'},
		 {name: 'ObsidianGolem',	freq: 'UNCOMMON'},
		 {name: 'MagicEye',			freq: 'RARE'}
		],
	];
	
	// THE_ICE_CAVES:
	// ********************************************************************************************
	this.spawnTables.TheIceCaves = [
		// THE_ICE_CAVES_LEVEL_1:
		[{name: 'DireWolfPack',			freq: 'COMMON'},
		 {name: 'Penguin',				freq: 'COMMON'},
		 {name: 'DireWolfKennel',		freq: 'UNCOMMON'},
		 {name: 'IceStatue',			freq: 'UNCOMMON'},
		 
		 {name: 'MagicEye',				freq: 'RARE'}
		],
		
		// THE_ICE_CAVES_LEVEL_2:
		[{name: 'DireWolfPack',			freq: 'COMMON'},
		 {name: 'Penguin',				freq: 'COMMON'},
		 {name: 'DireWolfKennel',		freq: 'UNCOMMON'},
		 {name: 'IceStatue',			freq: 'UNCOMMON'},
		 {name: 'PolarBear',			freq: 'COMMON'},
		 {name: 'YakPack',				freq: 'RARE'},
		 
		 {name: 'MagicEye',				freq: 'RARE'}
		],
		
		// THE_ICE_CAVES_LEVEL_3:
		[{name: 'DireWolfPack',			freq: 'COMMON'},
		 {name: 'Penguin',				freq: 'COMMON'},
		 {name: 'DireWolfKennel',		freq: 'UNCOMMON'},
		 {name: 'IceStatue',			freq: 'UNCOMMON'},
		 {name: 'PolarBear',			freq: 'COMMON'},
		 {name: 'YakPack',				freq: 'RARE'},
		 {name: 'IceElemental',			freq: 'UNCOMMON'},
		 
		 {name: 'MagicEye',				freq: 'RARE'}
		],
		
		// THE_ICE_CAVES_LEVEL_4:
		[{name: 'DireWolfPack',			freq: 'COMMON'},
		 {name: 'Penguin',				freq: 'COMMON'},
		 {name: 'DireWolfKennel',		freq: 'UNCOMMON'},
		 {name: 'IceStatue',			freq: 'UNCOMMON'},
		 {name: 'PolarBear',			freq: 'COMMON'},
		 {name: 'YakPack',				freq: 'UNCOMMON'},
		 {name: 'IceElemental',			freq: 'COMMON'},
		 
		 {name: 'MagicEye',				freq: 'RARE'}
		],
	];
	
	this.forEachType(this.spawnTables, function (spawnTable) {
		spawnTable.forEach(function (levelTable) {
			levelTable.forEach(function (e) {
				if (!this.npcTypes[e.name] && !this.npcGroupTypes[e.name]) {
					throw 'Invalid npcType or npcGroupType: ' + e.name;
				}
			}, this);
		}, this);
	}, this);
	
	this.forEachType(this.uniqueSpawnTable, function (spawnTable) {
		spawnTable.forEach(function (e) {
			if (!this.npcTypes[e.name] && !this.npcGroupTypes[e.name]) {
				throw 'Invalid uniqueNPC: ' + e.name;		
			}
		}, this);
	}, this);
};

// CREATE_NPC_GROUP_TYPES:
// ************************************************************************************************
gs.createNPCGroupTypes = function () {
	this.npcGroupTypes = {
		// THE_UPPER_DUNGEON_GROUPS:
		// ****************************************************************************************
		RatPack: {
			maxSize: 3,
			npcTypes: [{name: 'Rat', percent: 100}]
		},
		
		BatPack: {
			maxSize: 3,
			npcTypes: [{name: 'Bat', percent: 100}]
		},
		
		GoblinShamanGroup: {
			maxSize: 3,
			forceNPCTypes: ['GoblinShaman'],
			npcTypes: [
				{name: 'GoblinWarrior', percent: 50},
				{name: 'GoblinArcher', percent: 50},
			]
		},
		
		GoblinHoard: {
			maxSize: 6,
			npcTypes: [
				{name: 'GoblinWarrior', percent: 30},	   
				{name: 'GoblinBrute', percent: 20},   
				{name: 'GoblinArcher', percent: 20},   
				{name: 'GoblinFireMage', percent: 10},
				{name: 'GoblinStormMage', percent: 10},
				{name: 'GoblinShaman', percent: 10}
			]
		},
		
		// THE_ORC_FORTRESS_GROUPS:
		// ****************************************************************************************
		WolfPack: {
			maxSize: 3,
			npcTypes: [
				{name: 'Wolf', percent: 100}
			]
		},
		
		OrcPriestGroup: {
			maxSize: 3,
			forceNPCTypes: ['OrcPriest'],
			npcTypes: [
				{name: 'OrcWarrior', percent: 50},
				{name: 'OrcArcher', percent: 50},
			]
		},
		
		OrcPack: {
			maxSize: 6,
			npcTypes: [
				{name: 'OrcWarrior', percent: 30},
				{name: 'Ogre', percent: 10},
				{name: 'OrcArcher', percent: 20},
				{name: 'OrcFireMage', percent: 10},
				{name: 'OrcStormMage', percent: 10},
				{name: 'OrcPriest', percent: 10},
				{name: 'OrcSummoner', percent: 10},
			]
		},
		
		OrcKingPack: {
			maxSize: 6,
			forceNPCTypes: ['KingMonRacar'],
			npcTypes: [
				{name: 'OrcWarrior', percent: 30},
				{name: 'Ogre', percent: 10},
				{name: 'OrcArcher', percent: 20},
				{name: 'OrcFireMage', percent: 10},
				{name: 'OrcStormMage', percent: 10},
				{name: 'OrcPriest', percent: 10},
				{name: 'OrcSummoner', percent: 10},
			]
		},
		
		// THE_IRON_FORTRESS_GROUPS:
		// ****************************************************************************************
		ClockworkRatPack: {
			maxSize: 4,
			npcTypes: [{name: 'ClockworkRat', percent: 100}]
		},
		
		BombomberPack: {
			maxSize: 3,
			npcTypes: [{name: 'Bombomber', percent: 100}]
		},
		
		// THE_DARK_TEMPLE_GROUPS:
		// ****************************************************************************************
		DarkElfPriestGroup: {
			maxSize: 3,
			forceNPCTypes: ['DarkElfPriest'],
			npcTypes: [
				{name: 'DarkElfSentinel', percent: 50},
				{name: 'DarkElfWarden', percent: 50},
			]
		},
		
		DarkElfHoard: {
			maxSize: 6,
			npcTypes: [
				{name: 'DarkElfSentinel', 		percent: 30},
				{name: 'DarkElfWarden', 		percent: 40},
				{name: 'DarkElfPyromancer', 	percent: 5},
				{name: 'DarkElfStormologist', 	percent: 5},
				{name: 'DarkElfPriest', 		percent: 10},
				{name: 'DarkElfSummoner', 		percent: 10},
			]
		},
		
		// THE_VAULT_OF_YENDOR_GROUPS:
		// ****************************************************************************************
		HellHoundPack: {
			maxSize: 6,
			npcTypes: [
				{name: 'HellHound', percent: 100}
			]	
		},
		
		// THE_SUNLESS_DESERT:
		// ****************************************************************************************
		ScarabSwarm: {
			maxSize: 4,
			npcTypes: [{name: 'Scarab', percent: 100}],
		},
		
		GoatHerd: {
			maxSize: 4,
			npcTypes: [{name: 'Goat', percent: 100}],
		},
		
		MummyPriestGroup: {
			maxSize: 3,
			forceNPCTypes: ['MummyPriest'],
			npcTypes: [
				{name: 'Mummy', percent: 100},
			]
		},
		
		AncientWindCallerGroup: {
			maxSize: 3,
			forceNPCTypes: ['AncientWindCaller'],
			npcTypes: [
				{name: 'Mummy', percent: 100}
			]
		},
		
		// THE_SWAMP:
		// ****************************************************************************************
		PirahnaPack: {
			maxSize: 4,
			npcTypes: [{name: 'Pirahna', percent: 100}],
			spawnInWater: true,
		},
		
		FrogPack: {
			maxSize: 3,
			npcTypes: [{name: 'BlinkFrog', percent: 100}]
		},
		
		// THE_UNDERGROVE:
		// ****************************************************************************************
		ElephantPack: {
			maxSize: 3,
			npcTypes: [{name: 'Elephant', percent: 100}],
		},
		
		GiantBeePack: {
			maxSize: 3,
			npcTypes: [{name: 'GiantBee', percent: 100}],
		},
		
		// THE_CRYPT_GROUPS:
		// ****************************************************************************************
		MaggotPack: {
			maxSize: 6,
			npcTypes: [{name: 'Maggot', percent: 100}]
		},
		
		SkeletonPack: {
			maxSize: 3,
			npcTypes: [
				{name: 'SkeletonWarrior', percent: 75},
				{name: 'SkeletonArcher', percent: 25}
			]
		},
		
		NecromancerPack: {
			maxSize: 4,
			forceNPCTypes: ['Necromancer'],
			npcTypes: [
				{name: 'SkeletonWarrior', percent: 50},
				{name: 'SkeletonArcher', percent: 50}
			]
		},
		
		// THE CORE:
		// ****************************************************************************************
		FireBatPack: {
			maxSize: 6,
			npcTypes: [
				{name: 'FireBat', percent: 100}
			]
		},
		
		// THE_ICE_CAVES:
		// ****************************************************************************************
		DireWolfPack: {
			maxSize: 3,
			npcTypes: [
				{name: 'DireWolf', percent: 100}
			]
		},
		
		YakPack: {
			maxSize: 4,
			npcTypes: [{name: 'Yak', percent: 100}],
		},
	};
	
	this.nameTypes(this.npcGroupTypes);
};

// GET_PERCENT_SPAWN_TABLE:
// ************************************************************************************************
gs.getPercentSpawnTable = function (spawnTable) {
	var table = spawnTable.slice(0);
	for (let i = 0; i < table.length; i += 1) {
		if (table[i].freq === 'COMMON') {
			table[i].percent = NPC_COMMON_PERCENT;
		} 
		else if (table[i].freq === 'UNCOMMON') {
			table[i].percent = NPC_UNCOMMON_PERCENT;
		} 
		else if (table[i].freq === 'RARE') {
			table[i].percent = NPC_RARE_PERCENT;
		} 
		else {
			throw 'Unknown freq ' + table[i].freq;
		}
	}
	return table;
};

// GET_ZOO_SPAWN_TABLE:
// ************************************************************************************************
gs.getZooSpawnTable = function (spawnTable) {
	var table = [],
		percent = {COMMON: NPC_COMMON_PERCENT, UNCOMMON: NPC_UNCOMMON_PERCENT, RARE: NPC_RARE_PERCENT},
		group,
		addToTable;
	
	addToTable = function (name, percent) {
		var npcType = gs.npcTypes[name];
		
		if (!npcType.neverSpawnInZoo && !npcType.spawnInWater && !npcType.spawnInLava) {
			table.push({name: name, percent: percent});
		}
	};
	
	for (let i = 0; i < spawnTable.length; i += 1) {
		// NPC:
		if (gs.npcTypes[spawnTable[i].name]) {
			addToTable(spawnTable[i].name, percent[spawnTable[i].freq]);
		}
		// Group:
		else {
			group = gs.npcGroupTypes[spawnTable[i].name];
			
			// Force NPC Types:
			if (group.forceNPCTypes) {
				for (let j = 0; j < group.forceNPCTypes.length; j += 1) {
					addToTable(group.forceNPCTypes[j], percent[spawnTable[i].freq]);
				}
			}
			
			// Random:
			for (let j = 0; j < group.npcTypes.length; j += 1) {
				addToTable(group.npcTypes[j].name, percent[spawnTable[i].freq] * (group.npcTypes[j].percent / 100));
			}
		}
	}
	
	return table;
};


// NUM_SPAWNED_NPCS:
// ************************************************************************************************
gs.numSpawnedNPCs = function (zoneName, zoneLevel) {
	
	
	if (zoneName === 'TheUpperDungeon') {
		return NUM_NPCS.TIER_I[zoneLevel];
	}
	else if (gs.inArray(zoneName, TIER_II_ZONES)) {
		return NUM_NPCS.TIER_II[zoneLevel];
	}
	else if (gs.inArray(zoneName, TIER_III_ZONES)) {
		return NUM_NPCS.TIER_III[zoneLevel];
	}
	else if (gs.inArray(zoneName, BRANCH_I_ZONES)) {
		return NUM_NPCS.BRANCH_I[zoneLevel];
	}
	else if (gs.inArray(zoneName, BRANCH_II_ZONES)) {
		return NUM_NPCS.BRANCH_II[zoneLevel];
	}
	else if (zoneName === 'VaultOfYendor') {
		return NUM_NPCS.TIER_IV[zoneLevel];
	}
	else if (gs.inArray(zoneName, TIER_III_SPECIAL_ZONES)) {
		return NUM_NPCS.TIER_III_SPECIAL[zoneLevel];
	}
	else {
		throw 'invalid zoneName';
	}
};

// POPULATE_LEVEL:
// ************************************************************************************************
gs.populateLevel = function () {
	var totalNPCs;

	// Never spawn more than 1.5 x max NPCs (includes vaults, side rooms, etc)
	totalNPCs = Math.min(this.numSpawnedNPCs(this.zoneName, this.zoneLevel) * 1.5, 
						 this.numHostileNPCs() + this.numSpawnedNPCs(this.zoneName, this.zoneLevel));
	
	// Spawn Mobs:
	while (this.numHostileNPCs() < totalNPCs) {
		this.spawnRandomNPCOrGroup();
	}
};

// NUM_HOSTILE_NPCS:
// ************************************************************************************************
gs.numHostileNPCs = function () {
	return this.getAllNPCs().filter(npc => npc.faction === FACTION.HOSTILE).length;
};

// POPULATE_TEST_LEVEL:
// ************************************************************************************************
gs.populateTestLevel = function () {
	var start = 0,
		end = 70;
	
	end = Math.min(end, this.npcTypeList.length);
	
	for (let i = start; i < end; i += 1) {
		if (this.npcTypeList[i].faction === FACTION.HOSTILE) {
			this.spawnNPCOrGroup(null, this.npcTypeList[i].name);
		}
		
	}
};




// SPAWN_UNIQUES:
// This function is responsible for handling all the complexities of spawning uniques.
// Its important to keep track of which uniques have been spawned so we don't double spawn them.
// ************************************************************************************************
gs.spawnUniques = function () {
	var tileIndex, table = gs.uniqueSpawnTable[this.zoneName];
	
	if (!gs.debugProperties.spawnUniques) {
		return;
	}
	
	if (!table) {
		return;
	}
	
	//console.log(table);
	table = table.filter(e => gs.zoneLevel >= e.minLevel && gs.zoneLevel <= e.maxLevel);
	table = table.filter(e => !gs.inArray(e.name, gs.previouslySpawnedUniques));
	//console.log(table);
	
	table.forEach(function (e) {
		if (game.rnd.frac() < e.percent) {
			this.spawnNPCOrGroup(null, e.name);
			gs.previouslySpawnedUniques.push(e.name);
		}
	}, this);
};

// SPAWN_RANDOM_NPC_OR_GROUP
// Spawn a random NPC or npcGroup from the current zones spawn table.
// If passed a tileIndex will spawn at that location, otherwise a suitable tileIndex is randomly chosen.
// npcFlags can be passed, otherwise default (random) flags will be chosen.
// if isRespawn=true then npcTypes flagged as neverRespawn will not be spawned.
// ************************************************************************************************
gs.spawnRandomNPCOrGroup = function (tileIndex, npcFlags, isRespawn) {	
	var spawnTable,
		spawnTypeName;
		
	// Get random npcTypeName:
	spawnTable = this.getPercentSpawnTable(this.zoneType().spawnTable[this.zoneLevel - 1]);
	spawnTypeName = this.chooseRandom(spawnTable);
	
	// Handle the neverRespawn flag on npcTypes:
	// Note only individual npcTypes can be currently be set to never spawn (not npcGroups)
	while (isRespawn && this.npcTypes[spawnTypeName] && this.npcTypes[spawnTypeName].neverRespawn) {
		spawnTypeName = this.chooseRandom(spawnTable);
	}
	
	this.spawnNPCOrGroup(tileIndex, spawnTypeName, npcFlags);
};

// SPAWN_NPC_OR_GROUP:
// ************************************************************************************************
gs.spawnNPCOrGroup = function (tileIndex, spawnTypeName, flags) {
	var spawnType,
		isAsleep = game.rnd.frac() < SLEEPING_PERCENT,
		npcClassType = null,
		isWandering = game.rnd.frac() < MOB_WANDER_PERCENT;
	
	// Flags override default properties:
	if (flags) {
		isAsleep = flags.isAsleep;
		isWandering = flags.isWandering;
	}
	
	
	
	// Get the spawnType (either an npcType or a groupType)
	if (this.npcTypes[spawnTypeName]) {
		spawnType = this.npcTypes[spawnTypeName];
	}
	else if (this.npcGroupTypes[spawnTypeName]) {
		spawnType = this.npcGroupTypes[spawnTypeName];
	}
	else {
		throw 'Invalid spawnTypeName: ' + spawnTypeName;
	}
	
	// Get random spawn tileIndex:
	if (!tileIndex) {
		// Spawn In Water:
		if (spawnType.spawnInWater) {
			tileIndex = this.getWaterSpawnIndex();
		}
		// Spawn In Lava:
		else if (spawnType.spawnInLava) {
			tileIndex = this.getLavaSpawnIndex();
		}
		// Normal spawn:
		else {
        	tileIndex = this.getSpawnIndex();
		}
	}
	
	if (!tileIndex) {
		//console.log('Failed to find valid spawnIndex for: ' + npcTypeName);
		return;
	}
	
	// Spawn Group:
	if (this.npcGroupTypes.hasOwnProperty(spawnTypeName)) {
		this.spawnNPCGroup(tileIndex, spawnType);
	}
	// Spawn Single:
	else {
		// Elite:
		if (this.dangerLevel() >= MIN_ELITE_LEVEL && game.rnd.frac() < NPC_ELITE_CHANCE) {
			npcClassType = gs.getNPCClassType(spawnTypeName);
		}
		
		this.createNPC(tileIndex, spawnTypeName, {isAsleep: isAsleep, npcClassType: npcClassType, isWandering: isWandering});
		
		// Webs around spider nests:
		if (spawnTypeName === 'SpiderNest') {
			gs.createVinePatch({x: tileIndex.x - 1, y: tileIndex.y}, 2, 'SpiderWeb', 0.5);
		}

		// Bones around rat nests:
		if (spawnTypeName === 'RatNest') {
			gs.createVinePatch({x: tileIndex.x, y: tileIndex.y}, 2, 'Bones', 0.5);
		}

		// Blood around rotting corpses:
		if (spawnTypeName === 'RottingCorpse') {
			gs.createVinePatch(tileIndex, 2, 'Blood', 0.5);
		}
	}
};

// SPAWN_NPC_GROUP:
// ************************************************************************************************
gs.spawnNPCGroup = function (tileIndex, groupType) {
	var isAsleep, numNpcs, npcTileIndex, indexList, npcTypeName, npcClassType, forceNPCTypes;
	
	if (groupType.forceNPCTypes) {
		forceNPCTypes = groupType.forceNPCTypes.slice(0);
	}
	else {
		forceNPCTypes = [];
	}
	
	// Entire group will either sleep or not sleep:
	isAsleep = game.rnd.frac() < SLEEPING_PERCENT;

	// Random numNPCs in group:
	numNpcs = util.randInt(Math.ceil(groupType.maxSize / 2), groupType.maxSize);
	
	// Water Spawns:
	if (groupType.spawnInWater) {
		indexList = gs.getIndexInFlood(tileIndex, index => gs.isValidWaterSpawnIndex(index), 3);
	}
	// Lava Spawns:
	else if (groupType.spawnInLava) {
		indexList = gs.getIndexInFlood(tileIndex, index => gs.isValidLavaSpawnIndex(index), 3);
	}
	// Normal Spawns:
	else {
		indexList = gs.getIndexInFlood(tileIndex, index => gs.isValidSpawnIndex(index), 3);
	}
	
	for (let i = 0; i < numNpcs; i += 1) {
		if (indexList.length > 0) {
			npcTileIndex = indexList.shift();
			
			if (forceNPCTypes.length > 0) {
				npcTypeName = forceNPCTypes.pop();
			}
			else {
				npcTypeName =  this.chooseRandom(groupType.npcTypes);
			}
			
			if (this.dangerLevel() >= MIN_ELITE_LEVEL && game.rnd.frac() < NPC_ELITE_CHANCE) {
				npcClassType = gs.getNPCClassType(npcTypeName);
			}
			else {
				npcClassType = null;
			}
			
			this.createNPC(npcTileIndex, npcTypeName, {isAsleep: isAsleep, isWandering: false, npcClassType: npcClassType});
		}
	}
};

// SPAWN_RANDOM_NPC:
// Spawns a single NPC i.e. not group at the tileIndex
// ************************************************************************************************
gs.spawnRandomNPC = function (tileIndex) {
	var spawnTable, npcTypeName, flags = {};
	
	spawnTable = this.zoneType().spawnTable[this.zoneLevel - 1];
	
	// Filter only single:
	spawnTable = spawnTable.filter(e => gs.npcTypes[e.name]);
	
	// Only lava mobs:
	if (gs.getTile(tileIndex).type.name === 'Lava') {
		spawnTable = spawnTable.filter(e => gs.npcTypes[e.name].spawnInLava);
	}
	// Only water mobs:
	else if (gs.getTile(tileIndex).type.name === 'Water') {
		spawnTable = spawnTable.filter(e => gs.npcTypes[e.name].spawnInWater);
	}
	// Never lava or water mobs:
	else {
		spawnTable = spawnTable.filter(e => !gs.npcTypes[e.name].spawnInWater && !gs.npcTypes[e.name].spawnInLava);
	}
	
	// Get random npcTypeName:
	spawnTable = this.getPercentSpawnTable(spawnTable);
	npcTypeName = this.chooseRandom(spawnTable);
	
	// Elite:
	if (this.dangerLevel() >= MIN_ELITE_LEVEL && game.rnd.frac() < NPC_ELITE_CHANCE) {
		flags.npcClassType = gs.getNPCClassType(npcTypeName);
	}
	
	this.createNPC(tileIndex, npcTypeName, flags);
};


// SPAWN_MONSTER_ZOO_NPC:
// ************************************************************************************************
gs.spawnMonsterZooNPC = function (tileIndex) {
	var spawnTable = this.getZooSpawnTable(this.zoneType().spawnTable[this.zoneLevel - 1]),
		npcTypeName = this.chooseRandom(spawnTable),
		count = 0,
		flags = {};

	flags.isAsleep = true;
	
	// Elite:
	if (this.dangerLevel() >= MIN_ELITE_LEVEL && game.rnd.frac() < NPC_ELITE_CHANCE) {
		flags.npcClassType = gs.getNPCClassType(npcTypeName);
	}
	
	this.createNPC(tileIndex, npcTypeName, flags);
};