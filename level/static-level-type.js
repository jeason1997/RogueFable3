/*global gs, game, console, util*/
/*global Item*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_END_LEVEL_TYPES:
// ************************************************************************************************
gs.createEndLevelTypes = function () {
	gs.endLevelTypes = [
		// THE_SEWERS:
		{zoneName: 'TheSewers',			fileName: 'TheSewers-EndLevel01'},
		{zoneName: 'TheSewers',			fileName: 'TheSewers-EndLevel02'},
		
		// THE_ARCANE_TOWER:
		{zoneName: 'TheArcaneTower',	fileName: 'TheArcaneTower-EndLevel01',	populateLevel: false},
		{zoneName: 'TheArcaneTower',	fileName: 'TheArcaneTower-EndLevel02',	populateLevel: false},
		
		// THE_CORE:
		{zoneName: 'TheCore',			fileName: 'TheCore-EndLevel01'},
		{zoneName: 'TheCore',			fileName: 'TheCore-EndLevel02'},
		
		// THE_ICE_CAVES:
		{zoneName: 'TheIceCaves',		fileName: 'TheIceCaves-EndLevel01'},
		{zoneName: 'TheIceCaves',		fileName: 'TheIceCaves-EndLevel02'},
		
		// VAULT_OF_YENDOR:
		{zoneName: 'VaultOfYendor',		fileName: 'VaultOfYendor-EndLevel01',	populateLevel: false},
		{zoneName: 'VaultOfYendor',		fileName: 'VaultOfYendor-EndLevel02',	populateLevel: false},
		{zoneName: 'VaultOfYendor',		fileName: 'VaultOfYendor-EndLevel03',	populateLevel: false},
		{zoneName: 'VaultOfYendor',		fileName: 'VaultOfYendor-EndLevel04',	populateLevel: false},
	];
	
	// DEFAULTS:
	gs.forEachType(gs.endLevelTypes, function (type) {
		if (!type.hasOwnProperty('populateLevel')) {
			type.populateLevel = true;
		}
	}, this);
};

// LOAD_END_LEVELS:
// ************************************************************************************************
gs.loadEndLevels = function () {
	this.createEndLevelTypes();
	
	this.forEachType(this.endLevelTypes, function (type) {
		game.load.json(type.fileName, 'assets/maps/end-levels/' + type.fileName + '.json');
	}, this);
};

// GET_END_LEVEL_LIST:
// Get a list of end levels for the current zone
// ************************************************************************************************
gs.getEndLevelList = function () {
	return this.endLevelTypes.filter(type => type.zoneName === gs.zoneName);
};

// CREATE_STATIC_LEVEL_TYPES:
// ************************************************************************************************
gs.createStaticLevelTypes = function () {
	gs.staticLevelTypes = [
		// TIER_I_ZONES:
		// ****************************************************************************************
		// THE_UPPER_DUNGEON:
		{zoneName: 'TheUpperDungeon', 		fileName: 'TheUpperDungeon-01'},
		{zoneName: 'TheUpperDungeon', 		fileName: 'TheUpperDungeon-02'},
		{zoneName: 'TheUpperDungeon', 		fileName: 'TheUpperDungeon-03'},
		{zoneName: 'TheUpperDungeon', 		fileName: 'TheUpperDungeon-04'},
		{zoneName: 'TheUpperDungeon', 		fileName: 'TheUpperDungeon-OrcEntrance01', pred: () => gs.zoneLevel === 4 && gs.inArray('TheOrcFortress', gs.branches)},
		{zoneName: 'TheUpperDungeon', 		fileName: 'TheUpperDungeon-TheSwamp01', pred: () => gs.zoneLevel === 4 && gs.inArray('TheSwamp', gs.branches)},
		
		// THE_ORC_FORTRESS:
		{zoneName: 'TheOrcFortress', 		fileName: 'TheOrcFortress-01'},
		{zoneName: 'TheOrcFortress', 		fileName: 'TheOrcFortress-02'},
		{zoneName: 'TheOrcFortress', 		fileName: 'TheOrcFortress-03'},
        
		// THE_SUNLESS_DESERT:
		{zoneName: 'TheSunlessDesert',		fileName: 'TheSunlessDesert-01'},
		{zoneName: 'TheSunlessDesert',		fileName: 'TheSunlessDesert-TheCryptEntrance01', pred: () => gs.zoneLevel === 4 && gs.inArray('TheCrypt', gs.branches)},
		
		// THE_SWAMP:
		
		// THE_UNDER_GROVE:
		{zoneName: 'TheUnderGrove',			fileName: 'TheUnderGrove-01'},
		{zoneName: 'TheUnderGrove',			fileName: 'TheUnderGrove-02'},
		
		// THE_IRON_FORTRESS:
		{zoneName: 'TheIronFortress', 		fileName: 'TheIronFortress-01'},
		{zoneName: 'TheIronFortress', 		fileName: 'TheIronFortress-02'},
		
		// THE_DARK_TEMPLE:
		{zoneName: 'TheDarkTemple', 		fileName: 'TheDarkTemple-01'},
        {zoneName: 'TheDarkTemple', 		fileName: 'TheDarkTemple-02'},
        
		// THE_CRYPT:
		{zoneName: 'TheCrypt', 				fileName: 'TheCrypt-01'},
		{zoneName: 'TheCrypt', 				fileName: 'TheCrypt-02'},
		
		// THE_SEWERS:
		{zoneName: 'TheSewers', 			fileName: 'TheSewers-01'},
		{zoneName: 'TheSewers',				fileName: 'TheSewers-02'},
		{zoneName: 'TheSewers',				fileName: 'TheSewers-03'},
		
		// THE_ARCANE_TOWER:
		{zoneName: 'TheArcaneTower',		fileName: 'TheArcaneTower-01'},
		{zoneName: 'TheArcaneTower',		fileName: 'TheArcaneTower-02'},
		
		// THE_CORE:
		{zoneName: 'TheCore', 				fileName: 'TheCore-01'},
		{zoneName: 'TheCore',				fileName: 'TheCore-02'},
		
		// THE_ICE_CAVES:
		{zoneName: 'TheIceCaves', 			fileName: 'TheIceCaves-01'},
		{zoneName: 'TheIceCaves', 			fileName: 'TheIceCaves-02'},
		
		// THE_VAULT_OF_YENDOR:
		{zoneName: 'VaultOfYendor',			fileName: 'VaultOfYendor-01'}
	];
	
	this.staticLevelList = [];
	
	// SET_DEFAULTS_AND_ERROR_CHECK:
	this.staticLevelTypes.forEach(function (type) {
		this.staticLevelList.push(type);
		
		// Default min and max level:
		type.minLevel = type.minLevel || 1;
		type.maxLevel = type.maxLevel || 4;
		
		if (!type.hasOwnProperty('pred')) {
			type.pred = function () {
				return true;
			};
		}
	}, this);
};

// LOAD_STATIC_LEVELS:
// Call during preload to load all static levels:
// ************************************************************************************************
gs.loadStaticLevels = function () {
	this.createStaticLevelTypes();
	
	this.forEachType(this.staticLevelTypes, function (type) {
		game.load.json(type.fileName, 'assets/maps/static-levels/' + type.fileName + '.json');
	}, this);
};

// GET_STATIC_LEVEL_LIST:
// Returns a list of valid static levels
// ************************************************************************************************
gs.getStaticLevelList = function () {
	var list = [];
	
	// Hacky fix:
	// For some reason some players lose this
	if (!this.previouslySpawnedStaticLevels) {
		this.previouslySpawnedStaticLevels = [];
	}
	
	this.staticLevelTypes.forEach(function (type) {
		if (type.zoneName === this.zoneName
				&& !this.inArray(type.fileName, this.previouslySpawnedStaticLevels)
				&& this.zoneLevel >= type.minLevel
				&& this.zoneLevel <= type.maxLevel
				&& type.pred()) {
			
			list.push(type);
		}
	}, this);
	
	return list;
};

// ON_LOAD_STATIC_LEVEL:
// Called when a static level is loaded/created in order to do last minute randomization
// ************************************************************************************************
gs.onLoadStaticLevel = function (staticLevelName) {
	if (staticLevelName === 'VaultOfYendor-EndLevel03') {
		let tileIndex = util.randElem([
			{x: 20, y: 1},
			{x: 2, y: 19},
			{x: 20, y: 37},
			{x: 38, y: 19}
		]);
		gs.createFloorItem(tileIndex, Item.createItem('GobletOfYendor'));
	}
	
	if (staticLevelName === 'VaultOfYendor-EndLevel04') {
		let tileIndex = util.randElem([
			{x: 9, y: 13},
			{x: 30, y: 13},
			{x: 9, y: 26},
			{x: 30, y: 26}
		]);
		gs.createFloorItem(tileIndex, Item.createItem('GobletOfYendor'));
	}
};