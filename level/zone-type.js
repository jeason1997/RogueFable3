/*global game, gs, console, Phaser*/
/*global bspGenerator, rogueGenerator, cycleGenerator, caveRoomGenerator, caveGenerator, cave2Generator, swampGenerator, pitPathGenerator*/
/*global arcaneGenerator, ringGenerator, cryptGenerator, sewerTunnelsGenerator, sewerRoadsGenerator, templateTempleGenerator, dungeonTunnelsGenerator*/
/*global templateIronForgeGenerator, templateLichKingsLair*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_LEVEL_TYPES:
// ************************************************************************************************
gs.createLevelTypes = function () {
	this.zoneTypes = {};
	this.createNPCGroupTypes();
	this.createSpawnTables();
	this.createRoomDressingTables();
	this.createZoneDressingTables();
	this.createZoneSpecialFeaturesTables();
	this.createZoneTileFrames();

	// TEST_LEVEL:
	// ********************************************************************************************
	this.zoneTypes.TestLevel = {
		// Level Generation:
		numLevels: 4,
		tileFrames: this.zoneTileFrames.MainDungeon
	};
	
	// THE_UPPER_DUNGEON:
	// ********************************************************************************************
	this.zoneTypes.TheUpperDungeon = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheUpperDungeon,
		tileFrames: this.zoneTileFrames.MainDungeon,
		musicTrack: this.music.MainDungeon,
		specialFeatures: this.zoneSpecialFeaturesTables.EarlyGame,
		vaultTags: ['Dungeon', 'Generic'],
		roomTags: ['Square', 'Cross', 'Vault'],
		generators: [
			{name: bspGenerator, percent: 20},
			{name: rogueGenerator, percent: 25},
			{name: cycleGenerator, percent: 25},
			{name: caveRoomGenerator, percent: 20},
			{name: dungeonTunnelsGenerator, percent: 10},
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheUpperDungeon,
								 
		// Environment:
		spawnMushrooms: true,
		spawnWater: true,
		spawnVines: true,
		spawnFireShrooms: true,
		spawnWallFlags: true
	};
	
	// THE_UNDER_GROVE: (TIER I)
	// ********************************************************************************************
	this.zoneTypes.TheUnderGrove = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheUnderGrove,
		tileFrames: this.zoneTileFrames.TheUnderGrove,
		musicTrack: this.music.TheUnderGrove,
		distanceScalar: 0.035,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
		roomTags: ['Square', 'Cross', 'Vault'],
		generators: [
			{name: caveGenerator, percent: 50},
			{name: cave2Generator, percent: 50}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheUnderGrove,
							 
		// Environment:
		spawnMushrooms: true,
		spawnWater: true,
		spawnVines: true,
		spawnStreamers: true,
		spawnBearTraps: true,
		spawnFirePots: true,
		spawnFireShrooms: true
	};
	
	// THE_SUNLESS_DESERT: (TIER I)
	// ********************************************************************************************
	this.zoneTypes.TheSunlessDesert = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheSunlessDesert,
		tileFrames: this.zoneTileFrames.TheSunlessDesert,
		musicTrack: this.music.TheUnderGrove,
		distanceScalar: 0.035,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
		roomTags: ['Square', 'Cross', 'Vault'],
		generators: [
			{name: caveGenerator, percent: 50},
			{name: cave2Generator, percent: 50}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheSunlessDesert,
							 
		// Environment:
		spawnMushrooms: true,
		spawnStreamers: true,
		spawnFirePots: true,
		spawnFireShrooms: true
	};
	
	// THE_SWAMP: (TIER I)
	// ********************************************************************************************
	this.zoneTypes.TheSwamp = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheUnderGrove,
		tileFrames: this.zoneTileFrames.TheSwamp,
		musicTrack: this.music.TheUnderGrove,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
        roomTags: ['Square', 'Cross', 'Vault'],
		generators: [
			{name: swampGenerator, percent: 100}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheSwamp,
							 
		// Environment:
		spawnMushrooms: true,
		spawnWater: true,
		spawnVines: true,
		spawnStreamers: true,
		spawnBearTraps: true,
		spawnFirePots: true,
		spawnFireShrooms: true
	};
	
	// THE_ORC_FORTRESS:
	// ********************************************************************************************
	this.zoneTypes.TheOrcFortress = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheOrcFortress,
		tileFrames: this.zoneTileFrames.TheOrcFortress,
		musicTrack: this.music.MainDungeon,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
		vaultTags: ['Generic', 'Dungeon'],
		roomTags: ['Square', 'Cross', 'Vault'],
		generators: [
			{name: bspGenerator, percent: 25},
			{name: rogueGenerator, percent: 25},
			{name: cycleGenerator, percent: 25},
			{name: caveRoomGenerator, percent: 25}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheOrcFortress,
								 
		// Environment:
		spawnMushrooms: true,
		spawnWater: true,
		spawnVines: true,
		spawnStreamers: true,
		spawnFireShrooms: true,
		spawnFirePots: true,
		spawnWallFlags: true
	};
	
	
	// THE_IRON_FORTRESS: (TIER III)
	// ********************************************************************************************
	this.zoneTypes.TheIronFortress = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheIronFortress,
		tileFrames: this.zoneTileFrames.TheIronFortress,
		musicTrack: this.music.TheIronFortress,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
		vaultTags: ['Generic', 'TheIronFortress'],
		roomTags: ['Square', 'Cross', 'Vault'],
		generators: [
			{name: bspGenerator, percent: 30},
			{name: rogueGenerator, percent: 30},
			{name: cycleGenerator, percent: 30},
			{name: templateIronForgeGenerator, percent: 10},
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheIronFortress,
						 
		// Environment:
		spawnMushrooms: true,
		spawnWater: true,
		spawnOil: true,
		spawnStreamers: true,
		spawnFirePots: true,
		spawnFireVents: true,
		spawnFireShrooms: true,
		spawnSteamVents: true,
	};
	
	// THE_ARCANE_TOWER: (BRANCH_I)
	// ********************************************************************************************
	this.zoneTypes.TheArcaneTower = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheArcaneTower,
		tileFrames: this.zoneTileFrames.TheArcaneTower,
		musicTrack: this.music.TheIronFortress,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
		vaultTags: ['TheArcaneTower'],
		roomTags: ['Square', 'Circle', 'Vault'],
		generators: [
			{name: arcaneGenerator, percent: 75},
			{name: ringGenerator, percent: 25}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheArcaneTower,
						 
		// Environment:
		spawnMushrooms: true,
		spawnWater: true,
		spawnFirePots: true,
		spawnFireGlyphs: true
	};
	
	// THE_CRYPT: (TIER_III)
	// ********************************************************************************************
	this.zoneTypes.TheCrypt = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheCrypt,
		tileFrames: this.zoneTileFrames.TheCrypt,
		musicTrack: this.music.TheCrypt,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
		vaultTags: ['Generic', 'TheCrypt'],
		roomTags: ['Square', 'Cross', 'Vault'],
		generators: [
			{name: bspGenerator, percent: 25},
			{name: rogueGenerator, percent: 25},
			{name: cryptGenerator, percent: 50}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheCrypt,
		
		// Environment:
		spawnBlood: true,
		spawnMushrooms: true,
		spawnWater: true,
		spawnVines: true,
		spawnStreamers: true,
		spawnSpikeTraps: true,
		spawnGasPots: true,
		spawnFireShrooms: true
	};
	
	// THE_LICH_KINGS_LAIR: (TIER_III)
	// ********************************************************************************************
	this.zoneTypes.TheLichKingsLair = {
		// Level Generation:
		numLevels: 1,
		dressingTable: this.zoneDressingTables.TheCrypt,
		tileFrames: this.zoneTileFrames.TheCrypt,
		musicTrack: this.music.TheCrypt,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
		generators: [
			{name: templateLichKingsLair, percent: 100},
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheLichKingsLair,
		
		// Environment:
		spawnBlood: true,
		spawnMushrooms: true,
		spawnWater: true,
		spawnVines: true,
		spawnStreamers: false,
		spawnSpikeTraps: true,
		spawnGasPots: true,
		spawnFireShrooms: true
	};
	
	// THE_DARK_TEMPLE: (TIER_III)
	// ********************************************************************************************
	this.zoneTypes.TheDarkTemple = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheOrcFortress,
		tileFrames: this.zoneTileFrames.TheDarkTemple,
		musicTrack: this.music.MainDungeon,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
		vaultTags: ['Generic'],
        roomTags: ['Square', 'Cross', 'Circle', 'Vault'],
		
		generators: [
			{name: bspGenerator,			percent: 25},
			{name: rogueGenerator,			percent: 25},
			{name: cycleGenerator,			percent: 25},
			{name: templateTempleGenerator, percent: 15},
			{name: ringGenerator,			percent: 10}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheDarkTemple,
						 
		// Environment:
		spawnMushrooms: true,
		spawnWater: true,
		spawnVines: true,
		spawnFireShrooms: true,
		spawnStreamers: true,
		spawnPits: true,
		spawnFirePots: true
	};
	
	// THE_VAULT_OF_YENDOR:
	// ********************************************************************************************
	this.zoneTypes.VaultOfYendor = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheOrcFortress,
		tileFrames: this.zoneTileFrames.VaultOfYendor,
		musicTrack: this.music.MainDungeon,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
		vaultTags: ['Generic', 'VaultOfYendor'],
		roomTags: ['Square', 'Cross', 'Circle', 'Vault'],
		generators: [
			{name: bspGenerator,		percent: 20},
			{name: rogueGenerator,		percent: 20},
			{name: cycleGenerator,		percent: 25},
			{name: caveRoomGenerator,	percent: 15},
			{name: pitPathGenerator,	percent: 10},
			{name: ringGenerator,		percent: 10}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.VaultOfYendor,
						 
		// Environment:
		spawnMushrooms: true,
		spawnWater: true,
		spawnVines: true,
		spawnFireShrooms: true,
		spawnStreamers: true,
		spawnPits: true,
		spawnFirePots: true,
		spawnLava: true,
	};
	
	// THE_SEWERS: (TIER III)
	// ********************************************************************************************
	this.zoneTypes.TheSewers = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheSewers,
		tileFrames: this.zoneTileFrames.TheSewers,
		musicTrack: this.music.TheIronFortress,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
		roomTags: ['Square', 'Vault'],
		generators: [
			{name: sewerTunnelsGenerator, percent: 50},
			{name: sewerRoadsGenerator, percent: 50}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheSewers,
		
		// Environment:
		spawnMushrooms: true,
		spawnVines: true,
		spawnStreamers: false,
		spawnGasVents: true,
		spawnGasPots: true,
		spawnFireShrooms: true
	};

	
	// THE_CORE: (TIER III)
	// ********************************************************************************************
	this.zoneTypes.TheCore = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheCore,
		tileFrames: this.zoneTileFrames.TheCore,
		musicTrack: this.music.TheCore,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
		roomTags: ['Square', 'Cross', 'Vault'],
		vaultTags: ['Generic', 'TheCore'],
		generators: [
			{name: bspGenerator, percent: 20},
			{name: rogueGenerator, percent: 20},
			{name: caveGenerator, percent: 20},
			{name: cave2Generator, percent: 20},
			{name: caveRoomGenerator, percent: 20}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheCore,
		
		// Environment:
		spawnVines: true,
		spawnLava: true,
		spawnFireVents: true,
		spawnPits: true
	};

	// THE_ICE_CAVES: (TIER III)
	// ********************************************************************************************
	this.zoneTypes.TheIceCaves = {
		// Level Generation:
		numLevels: 4,
		dressingTable: this.zoneDressingTables.TheIceCaves,
		tileFrames: this.zoneTileFrames.TheIceCaves,
		musicTrack: this.music.TheIceCaves,
		specialFeatures: this.zoneSpecialFeaturesTables.LateGame,
		roomTags: ['Square', 'Cross', 'Vault'],
		generators: [
			{name: caveGenerator, percent: 33},
			{name: cave2Generator, percent: 33},
			{name: caveRoomGenerator, percent: 33}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheIceCaves,
		
		// Environment:
		spawnWater: true,
		spawnIce: true,
		isCold: true,
		spawnPits: true,
		spawnBearTraps: true
	};
	
	
	// Zone name list:
	this.nameTypes(this.zoneTypes);
	this.zoneNamesList = [];
	this.forEachType(this.zoneTypes, function (zoneType) {
		this.zoneNamesList.push(zoneType.name);
		
		zoneType.floatingFeatures = zoneType.floatingFeatures || [];
		
		zoneType.vaultTags = zoneType.vaultTags || ['Generic'];
	}, this);
	

	this.createZoneConnections();
	this.setZoneFloatingFeatures();
};

// SET_ZONE_FLOATING_FEATURES:
// ************************************************************************************************
gs.setZoneFloatingFeatures = function () {
	// THE_UPPER_DUNGEON:
	this.zoneTypes.TheUpperDungeon.floatingFeatures = [
		'RatCave'
	];
	
	// THE_UNDER_GROVE:
	this.zoneTypes.TheUnderGrove.floatingFeatures = [
		'OgreCave', 'AntCave', 'BeeHive'
	];
	
	// THE_SUNLESS_DESERT:
	this.zoneTypes.TheSunlessDesert.floatingFeatures = [
		'OgreCave'
	];
	
	// THE_SWAMP:
	this.zoneTypes.TheSwamp.floatingFeatures = [
		'AntCave'
	];
	
	// THE_ORC_FORTRESS:
	this.zoneTypes.TheOrcFortress.floatingFeatures = [
		'TreasureTrap', 'FireTrap', 'OgreCave', 'OrcPriestTemple', 'OrcFortress', 'MerchantShop'
	];
	
	// THE_IRON_FORTRESS:
	this.zoneTypes.TheIronFortress.floatingFeatures = [
		'BallistaRoom', 'TreasureTrap', 'MerchantShop'
	];
	
	// THE_DARK_TEMPLE:
	this.zoneTypes.TheDarkTemple.floatingFeatures = [
		'TheDarkTempleTemple'//'TreasureTrap', 'FireTrap', 'MerchantShop', 'TheDarkTempleTemple'
	];
	
	// THE_CORE:
	this.zoneTypes.TheCore.floatingFeatures = [
		'TheCoreEels'
	];
	
	// THE_SEWERS:
	this.zoneTypes.TheSewers.floatingFeatures = [
		'TheSewersSlime'
	];
	
	// THE_ICE_CAVES:
	this.zoneTypes.TheIceCaves.floatingFeatures = [
		'BearCave', 'OrcPriestTemple'
	];
	
	// VAULT_OF_YENDOR:
	this.zoneTypes.VaultOfYendor.floatingFeatures = [
		'TreasureTrap', 'FireTrap', 'MerchantShop'
	];
};

// CREATE_ZONE_CONNECTIONS:
// ************************************************************************************************
gs.createZoneConnections = function () {
	// Branches:
	
	this.zoneConnections = [
		// TIER_I => TIER_II:
		{fromZoneName: 'TheUpperDungeon',	fromZoneLevel: 4, toZoneName: 'TheOrcFortress',		toZoneLevel: 1},
		{fromZoneName: 'TheUpperDungeon',	fromZoneLevel: 4, toZoneName: 'TheSwamp',			toZoneLevel: 1},
		{fromZoneName: 'TheUpperDungeon',	fromZoneLevel: 4, toZoneName: 'TheSunlessDesert',	toZoneLevel: 1},
		{fromZoneName: 'TheUpperDungeon',	fromZoneLevel: 4, toZoneName: 'TheUnderGrove',		toZoneLevel: 1},
		
		// TIER_II => TIER_III:
		{fromZoneName: 'TheOrcFortress',	fromZoneLevel: 4, toZoneName: 'TheDarkTemple',		toZoneLevel: 1},
		{fromZoneName: 'TheOrcFortress',	fromZoneLevel: 4, toZoneName: 'TheCrypt',			toZoneLevel: 1},
		{fromZoneName: 'TheOrcFortress',	fromZoneLevel: 4, toZoneName: 'TheIronFortress',	toZoneLevel: 1},
		{fromZoneName: 'TheSwamp',			fromZoneLevel: 4, toZoneName: 'TheDarkTemple',		toZoneLevel: 1},
		{fromZoneName: 'TheSwamp',			fromZoneLevel: 4, toZoneName: 'TheCrypt',			toZoneLevel: 1},
		{fromZoneName: 'TheSwamp',			fromZoneLevel: 4, toZoneName: 'TheIronFortress',	toZoneLevel: 1},
		{fromZoneName: 'TheUnderGrove',		fromZoneLevel: 4, toZoneName: 'TheDarkTemple',		toZoneLevel: 1},
		{fromZoneName: 'TheUnderGrove',		fromZoneLevel: 4, toZoneName: 'TheCrypt',			toZoneLevel: 1},
		{fromZoneName: 'TheUnderGrove',		fromZoneLevel: 4, toZoneName: 'TheIronFortress',	toZoneLevel: 1},
		{fromZoneName: 'TheSunlessDesert',	fromZoneLevel: 4, toZoneName: 'TheDarkTemple',		toZoneLevel: 1},
		{fromZoneName: 'TheSunlessDesert',	fromZoneLevel: 4, toZoneName: 'TheCrypt',			toZoneLevel: 1},
		{fromZoneName: 'TheSunlessDesert',	fromZoneLevel: 4, toZoneName: 'TheIronFortress',	toZoneLevel: 1},
		
		// TIER_III => BRANCH_I:
		{fromZoneName: 'TheDarkTemple',		fromZoneLevel: 1, toZoneName: 'TheArcaneTower',		toZoneLevel: 1},
		{fromZoneName: 'TheDarkTemple',		fromZoneLevel: 1, toZoneName: 'TheSewers',			toZoneLevel: 1},
		{fromZoneName: 'TheCrypt',			fromZoneLevel: 1, toZoneName: 'TheArcaneTower',		toZoneLevel: 1},
		{fromZoneName: 'TheCrypt',			fromZoneLevel: 1, toZoneName: 'TheSewers',			toZoneLevel: 1},
		{fromZoneName: 'TheIronFortress',	fromZoneLevel: 1, toZoneName: 'TheArcaneTower',		toZoneLevel: 1},
		{fromZoneName: 'TheIronFortress',	fromZoneLevel: 1, toZoneName: 'TheSewers',			toZoneLevel: 1},
		
		// TIER_III => BRANCH_II:
		{fromZoneName: 'TheDarkTemple',		fromZoneLevel: 3, toZoneName: 'TheCore',			toZoneLevel: 1},
		{fromZoneName: 'TheDarkTemple',		fromZoneLevel: 3, toZoneName: 'TheIceCaves',		toZoneLevel: 1},
		{fromZoneName: 'TheCrypt',			fromZoneLevel: 3, toZoneName: 'TheCore',			toZoneLevel: 1},
		{fromZoneName: 'TheCrypt',			fromZoneLevel: 3, toZoneName: 'TheIceCaves',		toZoneLevel: 1},
		{fromZoneName: 'TheIronFortress',	fromZoneLevel: 3, toZoneName: 'TheCore',			toZoneLevel: 1},
		{fromZoneName: 'TheIronFortress',	fromZoneLevel: 3, toZoneName: 'TheIceCaves',		toZoneLevel: 1},
		
		// TIER_III => SPECIAL LEVELS:
		{fromZoneName: 'TheCrypt',			fromZoneLevel: 4, toZoneName: 'TheLichKingsLair',	toZoneLevel: 1},
		
		// TIER_III => TIER_IV:
		{fromZoneName: 'TheIronFortress',	fromZoneLevel: 4, toZoneName: 'VaultOfYendor',		toZoneLevel: 1},
		{fromZoneName: 'TheDarkTemple',		fromZoneLevel: 4, toZoneName: 'VaultOfYendor',		toZoneLevel: 1},
		{fromZoneName: 'TheCrypt',			fromZoneLevel: 4, toZoneName: 'VaultOfYendor',		toZoneLevel: 1}
	];
	
	// Verify:
	this.zoneConnections.forEach(function (branch) {
		if (!this.zoneTypes[branch.fromZoneName] || !this.zoneTypes[branch.toZoneName]) {
			throw 'Invalid branch: ' + branch.fromZoneName + ' - ' + branch.toZoneName;
		}
	}, this);
};

// CREATE_ZONE_SPECIAL_FEATURE_TABLES:
// ************************************************************************************************
gs.createZoneSpecialFeaturesTables = function () {
	this.zoneSpecialFeaturesTables = {};
	
	// EARLY_GAME (MDI and tier I branches):
	this.zoneSpecialFeaturesTables.EarlyGame = [
		{name: 'DropWallRoom',		percent: 20},
		{name: 'MonsterZoo',		percent: 25},
		{name: 'StorageRoom',		percent: 30},
		{name: 'Library',			percent: 21},
		
		{name: 'GoldRoom',			percent: 1},
		{name: 'PotionRoom',		percent: 1},
		{name: 'FoodRoom',			percent: 1},
		{name: 'ScrollRoom',		percent: 1}
	];
	
	// LATE_GAME (MDIII, MDIV, and tier III branches):
	this.zoneSpecialFeaturesTables.LateGame = [
		{name: 'DropWallRoom',			percent: 30},
		{name: 'MonsterZoo',			percent: 15},
		{name: 'Library',				percent: 15},
		{name: 'ChoiceTreasureRoom',	percent: 15},
		{name: 'TreasureRoom',			percent: 10},
		{name: 'StorageRoom',			percent: 5},
		
		{name: 'GoldRoom',				percent: 1},
		{name: 'PotionRoom',			percent: 1},
		{name: 'FoodRoom',				percent: 1},
		{name: 'ScrollRoom',			percent: 1},
		{name: 'TimedTreasureRoom',		percent: 5},
	];
};

// CREATE_ZONE_DRESSING_TABLES:
// Zone dressing tables are used to select which dressing functions can potentially be applied to areas in the zone.
// See level-dressing.js for implementation of dressing functions.
// ************************************************************************************************
gs.createZoneDressingTables = function () {
	this.zoneDressingTables = {};
	
	
	// THE_UPPER_DUNGEON_DRESSING_TABLE:
	this.zoneDressingTables.TheUpperDungeon = {
		// CAVE_AREA_TYPE:
		Cave: [
			{name: 'WaterCave', percent: 50},
			{name: 'GrassCave', percent: 50}
		],
	};
	
	
	// THE_ORC_FORTRESS_DRESSING_TABLE:
	this.zoneDressingTables.TheOrcFortress = {
		// CAVE_AREA_TYPE:
		Cave: [
			{name: 'WaterCave', percent: 50},
			{name: 'GrassCave', percent: 50}
		],
	};
	
	// THE_UNDER_GROVE_DRESSING_TABLE:
	this.zoneDressingTables.TheUnderGrove = {
		Cave: [
			{name: 'GroveWaterCave', percent: 50},
			{name: 'GroveCave', percent: 50}
		],
	};
	
	// THE_SUNLESS_DESERT:
	this.zoneDressingTables.TheSunlessDesert = {
		// CAVE_AREA_TYPE:
		Cave: [
			{name: 'DesertCave', percent: 100}
		]
	};
	
	// THE_IRON_FORTRESS:
	this.zoneDressingTables.TheIronFortress = {
		// CAVE_AREA_TYPE:
		Cave: [
			{name: 'WaterCave', percent: 50},
			{name: 'GrassCave', percent: 50}
		],
	};
	
	// THE_ARCANE_TOWER:
	this.zoneDressingTables.TheArcaneTower = {
		// CAVE_AREA_TYPE:
		Cave: [
			{name: 'WaterCave', percent: 50},
			{name: 'GrassCave', percent: 50}
		],
	};
	
	// THE_CRYPT_DRESSING_TABLE:
	this.zoneDressingTables.TheCrypt = {
		// CAVE_AREA_TYPE:
		Cave: [
			{name: 'WaterCave', percent: 50},
			{name: 'GrassCave', percent: 50}
		],
		
		// CRYPT_AREA_TYPE:
		Crypt: [
			{name: 'Tomb', percent: 100}
		],
		
		// LARGE_ROOM_AREA_TYPE:
		LargeRoom: [
			{name: 'Tomb', percent: 50},
			{name: 'PoolRoom', percent: 25},
			{name: 'NONE', percent: 25}
		]
	};
	
	// THE_CORE_DRESSING_TABLE:
	this.zoneDressingTables.TheCore = {
		// CAVE_AREA_TYPE:
		Cave: [
			{name: 'LavaCave', percent: 100}
		],
	};
	
	// THE_ICE_CAVES_DRESSING_TABLE:
	this.zoneDressingTables.TheIceCaves = {
		Cave: [
			{name: 'NONE', percent: 50},
			{name: 'SnowForest', percent: 50},
		]
	};
	
	// THE_SEWERS_DRESSING_TABLE:
	this.zoneDressingTables.TheSewers = {
	};
};

// IS_BASE_TILE_FRAME:
// ********************************************************************************************
gs.isBaseTileFrame = function (frame) {
	for (let i = 0; i < this.tilesetList.length; i += 1) {
		if (frame === this.tilesetList[i].base) {
			return true;
		}
	}
	
	return false;
};

// ZONE_TILE_FRAMES:
// zoneTileFrames are used so that each zone can have different frames for each tile.
// For example we may want slimy walls in the sewer and normal walls in the main dungeon.
// base: the basic frame used most of the time for the tile.
// alternate: a list of alternative tiles to use some small percentage of the time.
// ********************************************************************************************
gs.createZoneTileFrames = function () {
	this.tilesets = {};
	this.zoneTileFrames = {};
	
	// Duneon Floor Tilesets:
	this.tilesets.TheUpperDungeonFloor = 	{base: 0, alternate: [13, 14, 15, 16, 17]};
	this.tilesets.TheOrcFortressFloor =		{base: 128, alternate: [141, 142, 143, 144, 145]};
	this.tilesets.TheDarkTempleFloor =		{base: 160, alternate: [173, 174, 175, 176]};
	this.tilesets.IronFortressFloor =		{base: 32, alternate: [45, 46, 47, 48, 49, 50, 51, 52]};
	this.tilesets.ArcaneTowerFloor =		{base: 96};
	this.tilesets.TheCoreFloor =			{base: 64, alternate: [77, 78, 79, 80]};
	this.tilesets.IceCavesFloor =			{base: 64, alternate: [77, 78, 79, 80]};
	this.tilesets.SewersFloor =				{base: 0, alternate: [13, 14, 15, 16, 17]};
	this.tilesets.YendorFloor =				{base: 192, alternate: [205, 206, 207, 208]};
	
	// Dungeon Walls:
	this.tilesets.TheUpperDungeonWall = 	{base: 512, alternate: [530, 531]};
	this.tilesets.TheOrcFortressWall =		{base: 672, alternate: [690, 691]};
	this.tilesets.TheDarkTempleWall =		{base: 704, alternate: [722, 723, 724, 725]};
	this.tilesets.IronFortressWall =		{base: 608, alternate: [626, 627]};
	this.tilesets.ArcaneTowerWall =			{base: 640, alternate: [658, 659]};
	this.tilesets.TheCoreWall =				{base: 544, alternate: [562]};
	this.tilesets.IceCavesWall =			{base: 544, alternate: [562]};
	this.tilesets.SewersWall =				{base: 576, alternate: [594, 595, 596]};
	this.tilesets.YendorWall =				{base: 736, };//alternate: [754, 755, 756, 757]};
	
	// Cave Floor Tilesets:
	this.tilesets.TheUpperDungeonCaveFloor = 	{base: 256};
	this.tilesets.UnderGroveCaveFloor =		{base: 360};
	this.tilesets.SunlessDesertCaveFloor =	{base: 320};
	this.tilesets.SwampCaveFloor =			{base: 272, alternate: [273, 274]};
	this.tilesets.TheCoreCaveFloor =		{base: 352};
	this.tilesets.IceCavesCaveFloor =		{base: 288};
	this.tilesets.SewersCaveFloor =			{base: 256};
	this.tilesets.YendorCaveFloor =			{base: 258, alternate: [259, 260]};
		
	// Cave Walls:
	this.tilesets.TheUpperDungeonCaveWall = 	{base: 768};
	this.tilesets.UnderGroveCaveWall =		{base: 768};
	this.tilesets.SunlessDesertCaveWall =	{base: 928};
	this.tilesets.SwampCaveWall =			{base: 896};
	this.tilesets.TheCoreCaveWall =			{base: 800};
	this.tilesets.IceCavesCaveWall =		{base: 832};
	this.tilesets.SewersCaveWall =			{base: 768};
	
	// Dungeon Pit:
	this.tilesets.IceCavesPit =				{base: 1056};
	
	// Cave Pits:
	this.tilesets.TheCoreCavePit =			{base: 1072};
	this.tilesets.IceCavesCavePit =			{base: 1056};
	
	this.tilesetList = [];
	this.forEachType(this.tilesets, function (type) {
		this.tilesetList.push(type);
	}, this);
	
	
	// ZONE_TILESETS:
	// ********************************************************************************************
	// MAIN_DUNGEON:
	this.zoneTileFrames.MainDungeon = {
		Floor: 		this.tilesets.TheUpperDungeonFloor,
		Wall: 		this.tilesets.TheUpperDungeonWall,
		CaveFloor:	this.tilesets.TheUpperDungeonCaveFloor,
		CaveWall: 	this.tilesets.TheUpperDungeonCaveWall,
		Door: 		{base: 1584},
	};
	
	// VAULT_OF_YENDOR:
	this.zoneTileFrames.VaultOfYendor = {
		Floor: 		this.tilesets.YendorFloor,
		Wall: 		this.tilesets.YendorWall,
		CaveFloor: 	this.tilesets.YendorCaveFloor,
		CaveWall: 	this.tilesets.SwampCaveWall,
		Pillar:		{base: 1614},
		Door: 		{base: 1584},
	};
	
	// THE_ORC_FORTRESS:
	this.zoneTileFrames.TheOrcFortress = {
		Floor: 		this.tilesets.TheOrcFortressFloor,
		Wall: 		this.tilesets.TheOrcFortressWall,
		CaveFloor: 	this.tilesets.TheUpperDungeonCaveFloor,
		CaveWall: 	this.tilesets.TheUpperDungeonCaveWall,
		Pillar:		{base: 1610},
		Door: 		{base: 1584},
	};
	
	// THE_DARK_TEMPLE:
	this.zoneTileFrames.TheDarkTemple = {
		Floor: 		this.tilesets.TheDarkTempleFloor,
		Wall: 		this.tilesets.TheDarkTempleWall,
		CaveFloor: 	this.tilesets.TheUpperDungeonCaveFloor,
		CaveWall: 	this.tilesets.TheUpperDungeonCaveWall,
		Pillar:		{base: 1615},
		Door: 		{base: 1584},
	};
	
	// THE_IRON_FORTRESS:
	this.zoneTileFrames.TheIronFortress = {
		Floor: 		this.tilesets.IronFortressFloor,
		Wall: 		this.tilesets.IronFortressWall,
		CaveFloor: 	this.tilesets.TheUpperDungeonCaveFloor,
		CaveWall: 	this.tilesets.TheUpperDungeonCaveWall,
		Door: 		{base: 1584},
		Pillar: 	{base: 1609},
	};
	
	// THE_ARCANCE_TOWER:
	this.zoneTileFrames.TheArcaneTower = {
		Floor: 		this.tilesets.ArcaneTowerFloor,
		Wall: 		this.tilesets.ArcaneTowerWall,
		CaveFloor: 	this.tilesets.TheUpperDungeonCaveFloor,
		CaveWall: 	this.tilesets.TheUpperDungeonCaveWall,
		Door: 		{base: 1584},
		Pillar:		{base: 1613},
	};
	
	// THE_UNDER_GROVE:
	this.zoneTileFrames.TheUnderGrove = {
		Floor: 		this.tilesets.TheUpperDungeonFloor,
		Wall: 		this.tilesets.TheUpperDungeonWall,
		CaveFloor: 	this.tilesets.UnderGroveCaveFloor,
		CaveWall: 	this.tilesets.UnderGroveCaveWall,
		Door: 		{base: 1584},
	};
	
	// THE_SUNLESS_DESERT:
	this.zoneTileFrames.TheSunlessDesert = {
		Floor: 		this.tilesets.TheOrcFortressFloor,
		Wall: 		this.tilesets.TheOrcFortressWall,
		CaveFloor: 	this.tilesets.SunlessDesertCaveFloor,
		CaveWall: 	this.tilesets.SunlessDesertCaveWall,
		Door: 		{base: 1584},
	};
	
	// THE_SWAMP:
	this.zoneTileFrames.TheSwamp = {
		Floor: 		this.tilesets.TheUpperDungeonFloor,
		Wall: 		this.tilesets.TheUpperDungeonWall,
		CaveFloor: 	this.tilesets.SwampCaveFloor,
		CaveWall: 	this.tilesets.SwampCaveWall,
		Water:		{base: 1296},
		Door: 		{base: 1584},
	};
	
	// THE_CRYPT:
	this.zoneTileFrames.TheCrypt = {
		// Tiles:
		Floor: 		{base: 64, alternate: [77, 78, 79, 80]},
		CaveFloor: 	{base: 256},
		Wall: 		{base: 544, alternate: [562, 563, 564, 565]},
		CaveWall: 	{base: 768},
		
		// Objects:
		Door: 		{base: 1584},
		Pillar:		{base: 1611}
	};
	
	// THE_SEWERS:
	this.zoneTileFrames.TheSewers = {
		Floor: 		this.tilesets.SewersFloor,
		Wall: 		this.tilesets.SewersWall,
		CaveWall: 	this.tilesets.SewersCaveWall,
		CaveFloor: 	this.tilesets.SewersFloor,
		Door: 		{base: 1584},
	};
	
	// THE_ICE_CAVES:
	this.zoneTileFrames.TheIceCaves = {
		Floor: 		this.tilesets.IceCavesFloor,
		Wall: 		this.tilesets.IceCavesWall,
		Pit:		this.tilesets.IceCavesPit,
		CaveWall: 	this.tilesets.IceCavesCaveWall,
		CaveFloor: 	this.tilesets.IceCavesCaveFloor,
		CavePit:	this.tilesets.IceCavesCavePit,
		Door: 		{base: 1584},
		Stalagmite:	{base: 1601},
	};
	
	// THE_CORE:
	this.zoneTileFrames.TheCore = {
		Floor: 		this.tilesets.TheCoreFloor,
		Wall: 		this.tilesets.TheCoreWall,
		CaveFloor: 	this.tilesets.TheCoreCaveFloor,
		CaveWall: 	this.tilesets.TheCoreCaveWall,
		CavePit:	this.tilesets.TheCoreCavePit,
		Door: 		{base: 1584},
		Stalagmite:	{base: 1602},
		
		Pillar:		{base: 1611}
	};
};
	
