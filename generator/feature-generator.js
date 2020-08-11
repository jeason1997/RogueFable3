/*global game, gs, console, util*/
/*global baseGenerator, Item*/
/*global GOOD_DROP_TABLE_LIST, MAX_MONSTER_ZOO_NPCS, TIMED_GATE_TIME, LOCKED_STAIRS_ROOM_CHANCE*/
/*global MAX_DROP_WALL_NPCS, FLOATING_FEATURE_PERCENT, TIER_III_ZONES, BRANCH_I_ZONES, BRANCH_II_ZONES*/
/*jshint esversion: 6, laxbreak: true, loopfunc: true*/
'use strict';
var featureGenerator = {};


// SIZES:
// minSize and maxSize refer to the total size of the room including its walls
// The floor space will generally be these sizes - 2

// SIDE_ROOMS:
// A side room must be placed adjacent to a non-side room. 
// One of its walls must overlap with an existing wall
// Doors will be placed on these overlapping walls
// minOverlap is used to control this overlapping and can be used to force a min number of doors to spawn

// ROOM_LOCATION:
// A tileIndex, width, height and overlap list representing a valid location for a room
// This is used b/c searching for a room generates enough data to pass to the actual generator
// This way the generator can use this data without recalculating it.

// RESET_FEATURE_TYPE_COUNTS:
// Call before generating a new level to reset all feature type counts
// ************************************************************************************************
featureGenerator.resetFeatureTypeCounts = function () {
	this.featureTypeCounts = {};
	gs.forEachType(this.specialFeatureTypes, function (type) {
		this.featureTypeCounts[type.name] = 0;
	}, this);
};

// PLACE_SPECIAL_FEATURES:
// ************************************************************************************************
featureGenerator.placeSpecialFeatures = function () {
	this.placeLockedStairs();
	this.placeFloatingFeatures();
	this.placeSideFeatures();
	
};

// PLACE_DRESSING_FEATURES:
// ************************************************************************************************
featureGenerator.placeDressingFeatures = function () {
	
	this.dressingFeatureTypeList.forEach(function (type) {
		if (gs.arrayIntersect(type.tags, gs.zoneType().vaultTags).length > 0 && game.rnd.frac() < type.spawnPercent) {
			this.placeDressingFeatureType(type);
		}
	}, this);
	
	
	

};

// PLACE_DRESSING_FEATURE_TYPE:
// ************************************************************************************************
featureGenerator.placeDressingFeatureType = function (type) {
	var indexList, maskIndex, maskList = [];
	
	for (let i = 0; i < type.maxPerLevel; i += 1) {
		indexList = gs.getAllIndex();
		maskList = [];
		
		indexList.forEach(function (tileIndex) {
			maskIndex = this.getDressingFeatureMask(tileIndex, type);
			if (maskIndex >= 0) {
				maskList.push({tileIndex: {x: tileIndex.x, y: tileIndex.y}, maskIndex: maskIndex});
			}
		}, this);

		if (maskList.length > 0) {
			let e = util.randElem(maskList);
			this.placeDressingFeatureMask(e.tileIndex, type, e.maskIndex);
		}
	}
};

// GET_DRESSING_FEATURE_MASK:
// ************************************************************************************************
featureGenerator.getDressingFeatureMask = function (tileIndex, featureType) {
	return this.predMask(tileIndex, featureType.predMasks, featureType.predFuncs);
};

// PLACE_DRESSING_FEATURE_MASK:
// ************************************************************************************************
featureGenerator.placeDressingFeatureMask = function (tileIndex, featureType, maskIndex) {
	var mask = featureType.genMasks[maskIndex];
	
	for (let y = 0; y < mask.length; y += 1) {
		for (let x = 0; x < mask[0].length; x += 1) {
			if (featureType.genFuncs[mask[y][x]]) {
				featureType.genFuncs[mask[y][x]].call(this, {x: tileIndex.x + x, y: tileIndex.y + y});
			}		
		}
	}
};

// PLACE_LOCKED_STAIRS:
// ************************************************************************************************
featureGenerator.placeLockedStairs = function () {
	var zones = TIER_III_ZONES.concat(BRANCH_I_ZONES).concat(BRANCH_II_ZONES);
	zones.push('VaultOfYendor');
	
	if (gs.inArray(gs.zoneName, zones) && gs.zoneLevel < 4 && util.frac() <= LOCKED_STAIRS_ROOM_CHANCE) {
		this.placeSpecialFeature(this.specialFeatureTypes.LockedStairsRoom);
	}
};

// PLACE_SIDE_FEATURES:
// ************************************************************************************************
featureGenerator.placeSideFeatures = function () {
	var num, featureType;
	
	// Random number of special features per level:
	num = util.randInt(0, Math.min(3, gs.zoneLevel));

	// Generate features:
	for (let i = 0; i < num; i += 1) {
		featureType = this.selectFeatureType();
		
		if (featureType ) {
			this.placeSpecialFeature(featureType);
		}
	}
	
	// Forcing side features from debugProperties:
	if (gs.debugProperties.forceSideFeature) {
		featureType = this.specialFeatureTypes[gs.debugProperties.forceSideFeature];
		this.placeSpecialFeature(featureType);
	}
};

// PLACE_FLOATING_FEATURES:
// ************************************************************************************************
featureGenerator.placeFloatingFeatures = function () {
	var type;
	
	type = this.selectFloatingFeature();
	
	
	if (type && util.frac() < FLOATING_FEATURE_PERCENT) {
		type.generate();
		gs.previouslySpawnedFeatures.push(type.name);
	}
};

// SELECT_FLOATING_FEATURE:
// Selects a floating feature that can be generated on the level
// Based on restriction of floating feature type
// Will never spawn features twice
// ************************************************************************************************
featureGenerator.selectFloatingFeature = function () {
	var featureList = this.floatingFeatureList;
	
	// Never double spawn:
	featureList = featureList.filter(type => !gs.inArray(type.name, gs.previouslySpawnedFeatures));
	
	// Restricted by zoneType:
	featureList = featureList.filter(type => gs.inArray(type.name, gs.zoneType().floatingFeatures));
	
	// Restircted by DL:
	featureList = featureList.filter(type => gs.dangerLevel() >= type.minDL);
	
	// Restrict by canGenerate:
	featureList = featureList.filter(type => type.canGenerate());
	
	return featureList.length > 0 ? util.randElem(featureList) : null;
};

// SELECT_FEATURE_TYPE:
// Randomly select a feature from the zoneType
// Handle features with a maxCount
// ************************************************************************************************
featureGenerator.selectFeatureType = function () {
	var table = gs.zoneType().specialFeatures.slice(0);
	
	// Dont exceed max count:
	table = table.filter(element => this.featureTypeCounts[element.name] < this.specialFeatureTypes[element.name].maxCount);
	
	// Min DL:
	table = table.filter(element => gs.dangerLevel() >= this.specialFeatureTypes[element.name].minDL);
	
	return table.length > 0 ? this.specialFeatureTypes[gs.chooseRandom(table)] : null;
};

// PLACE_SPECIAL_FEATURE:
// Returns false if unable to place the feature
// ************************************************************************************************
featureGenerator.placeSpecialFeature = function (type) {
	var roomLocationList,
		roomLocation;
	
	// Get all possible locations:
	roomLocationList = this.getSideRoomLocationList(type);
	
	if (roomLocationList.length === 0) {
		return false;
	}
	
	// Randomly select a location:
	roomLocation = util.randElem(roomLocationList);
	
	// Generate the feature:
	type.generate(roomLocation);
	
	// Close Tiles:
	// Including walls to disable tunneling through them
	gs.getIndexInBox(roomLocation.floorBox.startX - 1, roomLocation.floorBox.startY - 1, roomLocation.floorBox.endX + 1, roomLocation.floorBox.endY + 1).forEach(function (index) {
		gs.getTile(index).isClosed = true;
	}, this);
	
	// Count the feature:
	this.featureTypeCounts[type.name] += 1;
	
	return true;
};

// CREATING_DRESSING_FEATURE_TYPES:
// ************************************************************************************************
featureGenerator.createDressingFeatureTypes = function () {
	this.dressingFeatureTypes = {};
	
	// BARRELS:
	this.dressingFeatureTypes.Barrel = {
		maxPerLevel: 10,
		spawnPercent: 0.1,
		tags: ['TheUpperDungeon', 'TheOrcFortress']
	};
	this.dressingFeatureTypes.Barrel.predMasks = [
		[[1, 1, 1],
		 [0, 0, 1],
		 [0, 0, 1]
		],
		[[1, 1, 1],
		 [1, 0, 0],
		 [1, 0, 0]
		],
		[[1, 1, 1, 1],
		 [0, 0, 0, 0],
		 [0, 0, 0, 0]
		],
		[[0, 0, 0, 0],
		 [0, 0, 0, 0],
		 [0, 0, 0, 0],
		 [0, 0, 0, 0],
		],
		
	];
	this.dressingFeatureTypes.Barrel.genMasks = [
		[[1, 1, 1],
		 [1, 0, 1]
		],
		[[1, 1, 1],
		 [1, 0, 1]
		],
		[[1, 1, 1, 1],
		 [1, 0, 0, 1],
		 [1, 1, 1, 1]
		],
		[[1, 1, 1, 1],
		 [1, 2, 2, 1],
		 [1, 2, 2, 1],
		 [1, 1, 1, 1],
		],
	];
	this.dressingFeatureTypes.Barrel.predFuncs = [
		function (index) {
			return gs.isIndexOpen(index);
		},
			
		function (index) {
			return gs.isInBounds(index) && !gs.getTile(index).type.passable;
		}
	];
	this.dressingFeatureTypes.Barrel.genFuncs = [
		function (tileIndex) {
			gs.createObject({x: tileIndex.x, y: tileIndex.y}, 'Barrel');
		},
		
		null,
		
		function (tileIndex) {
			if (game.rnd.frac() < 0.75) {
				gs.createObject({x: tileIndex.x, y: tileIndex.y}, 'Barrel');
			}
		},
	];
	
	this.dressingFeatureTypeList = [];
	gs.forEachType(this.dressingFeatureTypes, function (type) {
		this.dressingFeatureTypeList.push(type);
	}, this);
};

// PRED_MASK:
// ************************************************************************************************
featureGenerator.predMask = function (tileIndex, masks, preds) {
	var func, list = [];
	
	func = function (mask) {
		for (let y = 0; y < mask.length; y += 1) {
			for (let x = 0; x < mask[0].length; x += 1) {
				if (gs.isInBounds({x: tileIndex.x + x, y: tileIndex.y + y}) &&  gs.getTile({x: tileIndex.x + x, y: tileIndex.y + y}).isClosed) {
					return false;
				}
				
				if (preds[mask[y][x]] && !preds[mask[y][x]].call(this, {x: tileIndex.x + x, y: tileIndex.y + y})) {
					return false;
				}
			}
		}
		
		return true;
	};
	
	for (let i = 0; i < masks.length; i += 1) {
		if (func(masks[i])) {
			list.push(i);
		}
	}
	
	
	
	return list.length > 0 ? util.randElem(list) : -1;
};



// CREATE_TYPES:
// ************************************************************************************************
featureGenerator.createTypes = function () {
	this.specialFeatureTypes = {};
	this.floatingFeatureTypes = {};
	
	// LOCKED_STAIRS:
	this.specialFeatureTypes.LockedStairsRoom = {};
	this.specialFeatureTypes.LockedStairsRoom.minSize = 5;
	this.specialFeatureTypes.LockedStairsRoom.maxSize = 6;
	this.specialFeatureTypes.LockedStairsRoom.minOverlap = 1;
	
	// MONSTER_ZOO:
	this.specialFeatureTypes.MonsterZoo = {};
	this.specialFeatureTypes.MonsterZoo.minSize = 5;
	this.specialFeatureTypes.MonsterZoo.maxSize = 6;
	this.specialFeatureTypes.MonsterZoo.minOverlap = 2;
	this.specialFeatureTypes.MonsterZoo.maxCount = 1;
	
	// DROP_WALL_ROOM:
	this.specialFeatureTypes.DropWallRoom = {};
	this.specialFeatureTypes.DropWallRoom.minSize = 5;
	this.specialFeatureTypes.DropWallRoom.maxSize = 6;
	this.specialFeatureTypes.DropWallRoom.minOverlap = 3;
	this.specialFeatureTypes.DropWallRoom.minDL = 2;
	
	// TREASURE_ROOM:
	this.specialFeatureTypes.TreasureRoom = {};
	this.specialFeatureTypes.TreasureRoom.minSize = 5;
	this.specialFeatureTypes.TreasureRoom.maxSize = 7;
	this.specialFeatureTypes.TreasureRoom.minOverlap = 1;
	
	// TIMED_TREASURE_ROOM:
	this.specialFeatureTypes.TimedTreasureRoom = {};
	this.specialFeatureTypes.TimedTreasureRoom.minSize = 5;
	this.specialFeatureTypes.TimedTreasureRoom.maxSize = 7;
	this.specialFeatureTypes.TimedTreasureRoom.minOverlap = 1;
	this.specialFeatureTypes.TimedTreasureRoom.maxCount = 1;
	
	// STORAGE_ROOM:
	this.specialFeatureTypes.StorageRoom = {};
	this.specialFeatureTypes.StorageRoom.minSize = 5;
	this.specialFeatureTypes.StorageRoom.maxSize = 8;
	this.specialFeatureTypes.StorageRoom.minOverlap = 1;
	
	// LIBRARY:
	this.specialFeatureTypes.Library = {};
	this.specialFeatureTypes.Library.minSize = 5;
	this.specialFeatureTypes.Library.maxSize = 6;
	this.specialFeatureTypes.Library.minOverlap = 1;
	
	// GOLD_ROOM:
	this.specialFeatureTypes.GoldRoom = {};
	this.specialFeatureTypes.GoldRoom.minSize = 5;
	this.specialFeatureTypes.GoldRoom.maxSize = 6;
	this.specialFeatureTypes.GoldRoom.minOverlap = 1;
	
	// FOOD_ROOM:
	this.specialFeatureTypes.FoodRoom = {};
	this.specialFeatureTypes.FoodRoom.minSize = 5;
	this.specialFeatureTypes.FoodRoom.maxSize = 6;
	this.specialFeatureTypes.FoodRoom.minOverlap = 1;
	
	// POTION_ROOM:
	this.specialFeatureTypes.PotionRoom = {};
	this.specialFeatureTypes.PotionRoom.minSize = 5;
	this.specialFeatureTypes.PotionRoom.maxSize = 6;
	this.specialFeatureTypes.PotionRoom.minOverlap = 1;
	
	// SCROLL_ROOM:
	this.specialFeatureTypes.ScrollRoom = {};
	this.specialFeatureTypes.ScrollRoom.minSize = 5;
	this.specialFeatureTypes.ScrollRoom.maxSize = 6;
	this.specialFeatureTypes.ScrollRoom.minOverlap = 1;
	
	// CHOICE_TREASURE_ROOM:
	this.specialFeatureTypes.ChoiceTreasureRoom = {};
	this.specialFeatureTypes.ChoiceTreasureRoom.minSize = 7;
	this.specialFeatureTypes.ChoiceTreasureRoom.maxSize = 7;
	this.specialFeatureTypes.ChoiceTreasureRoom.minOverlap = 1;
	
	// FLOATING_FEATURE_TYPES:
	// ************************************************************************************************
	// VAULT_ROOMS:
	this.floatingFeatureTypes.BallistaRoom = 		{vaultTypeName: 'BallistaRoom'};
	this.floatingFeatureTypes.OrcPriestTemple = 	{vaultTypeName: 'OrcPriestTemple'};
	this.floatingFeatureTypes.OrcFortress = 		{vaultTypeName: 'OrcFortress'};
	this.floatingFeatureTypes.TreasureTrap =		{vaultTypeName: 'TreasureTrap'};
    this.floatingFeatureTypes.FireTrap =        	{vaultTypeName: 'FireTrap'};
    this.floatingFeatureTypes.MerchantShop =    	{vaultTypeName: 'MerchantShop'};
	this.floatingFeatureTypes.TheSewersSlime =		{vaultTypeName: 'TheSewersSlime'};
	this.floatingFeatureTypes.TheCoreEels =			{vaultTypeName: 'TheCoreEels'};
	this.floatingFeatureTypes.TheDarkTempleTemple =	{vaultTypeName: 'TheDarkTempleTemple'};
    this.floatingFeatureTypes.GenericTrap09 =       {vaultTypeName: 'GenericTrap09'};
	this.floatingFeatureTypes.GenericTrap10 =       {vaultTypeName: 'GenericTrap10'};
    this.floatingFeatureTypes.SpikeTrap02 =         {vaultTypeName: 'SpikeTrap02'};
    
	// OGRE_CAVE:
	this.floatingFeatureTypes.OgreCave = {};
	this.floatingFeatureTypes.OgreCave.width = 10;
	this.floatingFeatureTypes.OgreCave.height = 10;
	
	// BEAR_CAVE:
	this.floatingFeatureTypes.BearCave = {};
	this.floatingFeatureTypes.BearCave.width = 11;
	this.floatingFeatureTypes.BearCave.height = 11;
	
	// RAT_CAVE:
	this.floatingFeatureTypes.RatCave = {};
	this.floatingFeatureTypes.RatCave.width = 11;
	this.floatingFeatureTypes.RatCave.height = 11;
	this.floatingFeatureTypes.RatCave.minDL = 2;
	
	// ANT_CAVE:
	this.floatingFeatureTypes.AntCave = {};
	this.floatingFeatureTypes.AntCave.width = 11;
	this.floatingFeatureTypes.AntCave.height = 11;
	
	// BEE_HIVE:
	this.floatingFeatureTypes.BeeHive = {};
	this.floatingFeatureTypes.BeeHive.width = 11;
	this.floatingFeatureTypes.BeeHive.height = 11;
	
	this.createTypeGenerators();
	gs.nameTypes(this.specialFeatureTypes);
	
	// Set special feature defaults:
	gs.forEachType(this.specialFeatureTypes, function (type) {
		if (!type.hasOwnProperty('maxCount')) {
			type.maxCount = 1000;
		}
		
		type.minDL = type.minDL || 0;
		
	}, this);
	
	// Set floating feature defaults:
	gs.nameTypes(this.floatingFeatureTypes);
	this.floatingFeatureList = [];
	gs.forEachType(this.floatingFeatureTypes, function (type) {
		this.floatingFeatureList.push(type);
		
		type.minDL = type.minDL || 0;
		
		if (type.vaultTypeName) {
			if (!gs.vaultTypes[type.vaultTypeName]) throw 'Invalid vaultTypeName: ' + type.vaultTypeName;
			
			type.width = gs.vaultTypes[type.vaultTypeName].width;
			type.height = gs.vaultTypes[type.vaultTypeName].height;
			
			type.generate = function () {
				featureGenerator.placeFloatingVault(this.vaultTypeName);
			};
			
			type.canGenerate = function () {
				return baseGenerator.getOpenBox(this.width, this.height);
			};
		}
	}, this);
	
	this.createDressingFeatureTypes();
};

// CREATE_TYPE_GENERATORS:
// ************************************************************************************************
featureGenerator.createTypeGenerators = function () {
	
	// LOCKED_STAIRS_ROOM:
	// ********************************************************************************************
	this.specialFeatureTypes.LockedStairsRoom.generate = function (roomLocation) {
		var tileIndex, indexList, obj;
		
		// Create side room:
		featureGenerator.createSideRoom(roomLocation, 'SwitchGate', true);
		
		// Lock Door:
		gs.getObj(roomLocation.doorTileIndex).isLocked = true;
		
		// Create Down Stairs:
		tileIndex = gs.getWideOpenIndexInBox(roomLocation.floorBox);
		gs.createObject(tileIndex, 'DownStairs');
		
		// Create internal safety switch:
		tileIndex = gs.getOpenIndexInBox(roomLocation.floorBox);
		obj = gs.createObject(tileIndex, 'Switch');
		obj.toTileIndex = {x: roomLocation.doorTileIndex.x, y: roomLocation.doorTileIndex.y};
		
		// Close tiles early (so switch doesn't get spawned in here):
		gs.getIndexInBox(roomLocation.floorBox.startX - 1, roomLocation.floorBox.startY - 1, roomLocation.floorBox.endX + 1, roomLocation.floorBox.endY + 1).forEach(function (index) {
			gs.getTile(index).isClosed = true;
		}, this);
		
		// Find a tileIndex as far from downStairs as possible:
		indexList = gs.getAllIndex();
		indexList = indexList.filter(index => gs.isWideOpen(index));
		indexList.sort((a, b) => util.distance(b, tileIndex) - util.distance(a, tileIndex));
	
		// Create a switch:
		obj = gs.createObject(indexList[0], 'Switch');
		obj.toTileIndex = {x: roomLocation.doorTileIndex.x, y: roomLocation.doorTileIndex.y};
	};
	
	// MONSTER_ZOO:
	// ********************************************************************************************
	this.specialFeatureTypes.MonsterZoo.generate = function (roomLocation) {
		var overlap,
			maxMobs;
		
		maxMobs = Math.ceil(MAX_MONSTER_ZOO_NPCS + gs.dangerLevel() / 3);
		
		featureGenerator.createMobClosest(roomLocation, maxMobs, true, GOOD_DROP_TABLE_LIST);
		
		// Placing doors on an overlap:
		overlap = util.randElem(roomLocation.overlapList);
		for (let i = 0; i < this.minOverlap; i += 1) {
			gs.setTileType(overlap[i], gs.tileTypes.Floor);
			gs.createDoor(overlap[i], 'StoneDoor', gs.objectTypes.StoneDoor.frame, false, true);
		}
	};
	
	// DROP_WALL_ROOM:
	// ********************************************************************************************
	this.specialFeatureTypes.DropWallRoom.generate = function (roomLocation) {
		var overlap;
		
		featureGenerator.createMobClosest(roomLocation, MAX_DROP_WALL_NPCS, false);
		
		// Placing drop walls on an overlap:
		gs.dropWallList.push(util.randElem(roomLocation.overlapList));
	};
	
	// TREASURE_ROOM:
	// ********************************************************************************************
	this.specialFeatureTypes.TreasureRoom.generate = function (roomLocation) {
		var door, indexList, doorTileIndex;
		
		door = featureGenerator.createSideRoom(roomLocation, 'Gate');
		door.isLocked = true;
		doorTileIndex = door.tileIndex;
		roomLocation.doorTileIndex = doorTileIndex; // Allows chaining to timed-treasure-room
		
		// Place item within view of the gate:
		indexList = gs.getIndexInBox(roomLocation.floorBox);
		indexList = indexList.filter(index => !gs.isPassable(doorTileIndex.x - 1, doorTileIndex.y) || gs.isRayClear(index, {x: doorTileIndex.x - 1, y: doorTileIndex.y}));
		indexList = indexList.filter(index => !gs.isPassable(doorTileIndex.x + 1, doorTileIndex.y) || gs.isRayClear(index, {x: doorTileIndex.x + 1, y: doorTileIndex.y}));
		indexList = indexList.filter(index => !gs.isPassable(doorTileIndex.x, doorTileIndex.y - 1) || gs.isRayClear(index, {x: doorTileIndex.x, y: doorTileIndex.y - 1}));
		indexList = indexList.filter(index => !gs.isPassable(doorTileIndex.x, doorTileIndex.y + 1) || gs.isRayClear(index, {x: doorTileIndex.x, y: doorTileIndex.y + 1}));
		gs.createRandomFloorItem(util.randElem(indexList), util.randElem(GOOD_DROP_TABLE_LIST));
		
		// Place some gold:
		indexList = gs.getIndexInBox(roomLocation.floorBox);
		indexList = indexList.filter(index => !gs.getItem(index));
		indexList = gs.randSubset(indexList, util.randInt(2, 4));
		indexList.forEach(function (index) {
			gs.createFloorItem(index, Item.createItem('GoldCoin', {amount: gs.dropGoldAmount()}));
		});
	};
	
	// TIMED_TREASURE_ROOM:
	// ********************************************************************************************
	this.specialFeatureTypes.TimedTreasureRoom.generate = function (roomLocation) {
		var door, tileIndex, obj;
		
		featureGenerator.specialFeatureTypes.TreasureRoom.generate(roomLocation);
		
		
		// Replace door with timed gate:
		gs.destroyObject(gs.getObj(roomLocation.doorTileIndex));
		door = gs.createDoor(roomLocation.doorTileIndex, 'TimedGate');

		// Start open:
		door.isOpen = true;
		door.sprite.frame += 1;
		door.timer = TIMED_GATE_TIME;
		
		// Place Switch:
		tileIndex = gs.getOpenIndexInBox(roomLocation.floorBox);
		if (tileIndex) {
			obj = gs.createObject(tileIndex, 'Switch');
			obj.toTileIndex = {x: door.tileIndex.x, y: door.tileIndex.y};
		}
	};
	
	// STORAGE_ROOM:
	// ********************************************************************************************
	this.specialFeatureTypes.StorageRoom.generate = function (roomLocation) {
		var modX, modY;
		
		featureGenerator.createSideRoom(roomLocation);
		
		modX = (roomLocation.floorBox.startX + 1) % 2;
		modY = (roomLocation.floorBox.startY + 1) % 2;
		
		gs.getIndexInBox(roomLocation.floorBox).forEach(function (tileIndex) {
			if (tileIndex.x % 2 === modX && tileIndex.y % 2 === modY && util.frac() < 0.50 ) {
				gs.createNPC(tileIndex, 'Crate');
			}
			
		}, this);
	};
	
	// LIBRARY:
	// ********************************************************************************************
	this.specialFeatureTypes.Library.generate = function (roomLocation) {
		featureGenerator.createSideRoom(roomLocation);
		
		var count = 0;
		
		gs.getIndexInBox(roomLocation.floorBox).forEach(function (index) {
			if (featureGenerator.isGoodWallIndex(index) && index.y === roomLocation.floorBox.startY && util.frac() < 0.50 && count < 2) {
				gs.createObject(index, 'BookShelf');
				count += 1;
			}
		}, this);
	};
	
	// GOLD_ROOM:
	// ********************************************************************************************
	this.specialFeatureTypes.GoldRoom.generate = function (roomLocation) {
		var num, tileIndex;
		
		featureGenerator.createSideRoom(roomLocation);
		
		num = util.randInt(3, 6);
		for (let i = 0; i < num; i += 1) {
			tileIndex = gs.getOpenIndexInBox(roomLocation.floorBox);
			if (tileIndex) {
				gs.createFloorItem(tileIndex, Item.createItem('GoldCoin', {amount: gs.dropGoldAmount()}));
			}
		}
	};
	
	// FOOD_ROOM:
	// ********************************************************************************************
	this.specialFeatureTypes.FoodRoom.generate = function (roomLocation) {
		var num, tileIndex;
		
		featureGenerator.createSideRoom(roomLocation);
		
		num = util.randInt(2, 3);
		for (let i = 0; i < num; i += 1) {
			tileIndex = gs.getOpenIndexInBox(roomLocation.floorBox);
			if (tileIndex) {
				gs.createFloorItem(tileIndex, Item.createItem('Meat'));
			}
		}
	};
	
	// POTION_ROOM:
	// ********************************************************************************************
	this.specialFeatureTypes.PotionRoom.generate = function (roomLocation) {
		var num, tileIndex;
		
		featureGenerator.createSideRoom(roomLocation);
		
		num = util.randInt(2, 3);
		for (let i = 0; i < num; i += 1) {
			tileIndex = gs.getOpenIndexInBox(roomLocation.floorBox);
			if (tileIndex) {
				gs.createRandomFloorItem(tileIndex, 'Potions');
			}
		}
	};
	
	// SCROLL_ROOM:
	// ********************************************************************************************
	this.specialFeatureTypes.ScrollRoom.generate = function (roomLocation) {
		var num, tileIndex;
		
		featureGenerator.createSideRoom(roomLocation);
		
		num = util.randInt(2, 3);
		for (let i = 0; i < num; i += 1) {
			tileIndex = gs.getOpenIndexInBox(roomLocation.floorBox);
			if (tileIndex) {
				gs.createRandomFloorItem(tileIndex, 'Scrolls');
			}
		}
	};
	
	// CHOICE_TREASURE_ROOM:
	// ********************************************************************************************
	this.specialFeatureTypes.ChoiceTreasureRoom.generate = function (roomLocation) {
		let dropTables = gs.randSubset(GOOD_DROP_TABLE_LIST, 3);
		
		featureGenerator.createSideRoom(roomLocation);
		
		gs.createCrystalChestGroup();
		
		for (let i = 0; i < 3; i += 1) {
			let tileIndex = gs.getWideOpenIndexInBox(roomLocation.floorBox);
			if (tileIndex) {
				let obj = gs.createCrystalChest(tileIndex);
				obj.item = gs.createRandomItem(dropTables[i], true);
			}
		}
	};
	
	
	// OGRE_CAVE:
	// ********************************************************************************************
	this.floatingFeatureTypes.OgreCave.generate = function () {
		var tileIndex, box, area, npcBox;
		
		tileIndex = baseGenerator.getOpenBox(this.width, this.height);
		box = gs.createBox(tileIndex.x, tileIndex.y, tileIndex.x + this.width, tileIndex.y + this.height);	
		area = featureGenerator.createCave(box);
		
		npcBox = gs.getOpenBoxInArea(area, 4, 4);
		if (npcBox) {
			gs.createObject({x: npcBox.centerX, y: npcBox.centerY}, 'CampFire');
			if (gs.debugProperties.spawnMobs) {
				gs.createNPC(gs.getOpenIndexInBox(npcBox), 'OgreShaman');
				gs.createNPC(gs.getOpenIndexInBox(npcBox), 'Ogre');
				gs.createNPC(gs.getOpenIndexInBox(npcBox), 'Ogre');
			}
		}
		else {
			return false;
		}
		
		// Meat rack:
		tileIndex = gs.getWideOpenIndexInArea(area);
		if (tileIndex) {
			gs.createObject(tileIndex, 'MeatRack');
		}
		
		// Chest:
		tileIndex = gs.getWideOpenIndexInArea(area);
		if (tileIndex) {
			gs.createContainer(tileIndex, 'Chest');
		}

		// Gold:
		for (let i = 0; i < 3; i += 1) {
			tileIndex = gs.getOpenIndexInArea(area);
			if (tileIndex) {
				gs.createFloorItem(tileIndex, Item.createItem('GoldCoin', {amount: util.randInt(Math.ceil(gs.dropGoldAmount() / 2), gs.dropGoldAmount())}));
			}
		}
		
		// Stallagmites:
		for (let i = 0; i < 4; i += 1) {
			tileIndex = gs.getWideOpenIndexInArea(area);
			if (tileIndex) {
				gs.createObject(tileIndex, 'Stalagmite');
			}
		}

		// Bones:	
		for (let i = 0; i < 3; i += 1) {
			tileIndex = gs.getOpenIndexInArea(area);
			if (tileIndex) {
				gs.createVinePatch(tileIndex, util.randInt(1, 3), 'Bones', 0.5);
			}
		}

		// Closing tiles:
		gs.getIndexInBox(area).forEach(function (tileIndex) {
			gs.getTile(tileIndex).isClosed = true;
		}, this);
	};
	
	this.floatingFeatureTypes.OgreCave.canGenerate = function () {
		return baseGenerator.getOpenBox(this.width, this.height);
	};
	
	// BEAR_CAVE:
	// ********************************************************************************************
	this.floatingFeatureTypes.BearCave.generate = function () {
		var tileIndex, box, area, npcBox;
		
		tileIndex = baseGenerator.getOpenBox(this.width, this.height);
		box = gs.createBox(tileIndex.x, tileIndex.y, tileIndex.x + this.width, tileIndex.y + this.height);	
		area = featureGenerator.createCave(box);
		
		npcBox = gs.getOpenBoxInArea(area, 4, 4);
		if (npcBox) {
			if (gs.debugProperties.spawnMobs) {
				gs.createNPC(gs.getOpenIndexInBox(npcBox), 'PolarBear');
				gs.createNPC(gs.getOpenIndexInBox(npcBox), 'PolarBear');
				gs.createNPC(gs.getOpenIndexInBox(npcBox), 'PolarBear');
			}
		}
		else {
			return false;
		}
		
		// Meat rack:
		tileIndex = gs.getWideOpenIndexInArea(area);
		if (tileIndex) {
			gs.createObject(tileIndex, 'MeatRack');
		}
	
		// Stallagmites:
		for (let i = 0; i < 4; i += 1) {
			tileIndex = gs.getWideOpenIndexInArea(area);
			if (tileIndex) {
				gs.createObject(tileIndex, 'Stalagmite');
			}
		}

		// Bones:	
		for (let i = 0; i < 3; i += 1) {
			tileIndex = gs.getOpenIndexInArea(area);
			if (tileIndex) {
				gs.createVinePatch(tileIndex, util.randInt(1, 3), 'Bones', 0.5);
			}
		}

		// Closing tiles:
		gs.getIndexInBox(area).forEach(function (tileIndex) {
			gs.getTile(tileIndex).isClosed = true;
		}, this);
	};
	
	this.floatingFeatureTypes.BearCave.canGenerate = function () {
		return baseGenerator.getOpenBox(this.width, this.height);
	};
	
	// RAT_CAVE:
	// ********************************************************************************************
	this.floatingFeatureTypes.RatCave.generate = function () {
		var tileIndex, box, area, npcBox;
		
		tileIndex = baseGenerator.getOpenBox(this.width, this.height);
		box = gs.createBox(tileIndex.x, tileIndex.y, tileIndex.x + this.width, tileIndex.y + this.height);	
		area = featureGenerator.createCave(box);
		
		for (let i = 0; i < 3; i += 1) {
			tileIndex = gs.getWideOpenIndexInArea(area);
			if (tileIndex) {
				gs.createNPC(tileIndex, 'RatNest');
				
			}
		}
		
		// Stallagmites:
		for (let i = 0; i < 4; i += 1) {
			tileIndex = gs.getWideOpenIndexInArea(area);
			if (tileIndex) {
				gs.createObject(tileIndex, 'Stalagmite');
			}
		}

		// Closing tiles:
		gs.getIndexInBox(area).forEach(function (tileIndex) {
			gs.getTile(tileIndex).isClosed = true;
		}, this);
	};
	
	this.floatingFeatureTypes.RatCave.canGenerate = function () {
		return baseGenerator.getOpenBox(this.width, this.height);
	};
	
	// ANT_CAVE:
	// ********************************************************************************************
	this.floatingFeatureTypes.AntCave.generate = function () {
		var tileIndex, box, area, npcBox;
		
		tileIndex = baseGenerator.getOpenBox(this.width, this.height);
		box = gs.createBox(tileIndex.x, tileIndex.y, tileIndex.x + this.width, tileIndex.y + this.height);	
		area = featureGenerator.createCave(box);
		
		for (let i = 0; i < 10; i += 1) {
			tileIndex = gs.getOpenIndexInArea(area);
			if (tileIndex) {
				gs.createNPC(tileIndex, 'GiantAnt');
				
			}
		}
		
		// Stallagmites:
		for (let i = 0; i < 4; i += 1) {
			tileIndex = gs.getWideOpenIndexInArea(area);
			if (tileIndex) {
				gs.createObject(tileIndex, 'Stalagmite');
			}
		}

		// Closing tiles:
		gs.getIndexInBox(area).forEach(function (tileIndex) {
			gs.getTile(tileIndex).isClosed = true;
		}, this);
	};
	
	this.floatingFeatureTypes.AntCave.canGenerate = function () {
		return baseGenerator.getOpenBox(this.width, this.height);
	};
	
	// BEE_HIVE:
	// ********************************************************************************************
	this.floatingFeatureTypes.BeeHive.generate = function () {
		var tileIndex, box, area, npcBox;
		
		tileIndex = baseGenerator.getOpenBox(this.width, this.height);
		box = gs.createBox(tileIndex.x, tileIndex.y, tileIndex.x + this.width, tileIndex.y + this.height);	
		area = featureGenerator.createCave(box);
		
		for (let i = 0; i < 10; i += 1) {
			tileIndex = gs.getOpenIndexInArea(area);
			if (tileIndex) {
				gs.createNPC(tileIndex, 'GiantBee');
				
			}
		}
		
		// Stallagmites:
		for (let i = 0; i < 4; i += 1) {
			tileIndex = gs.getWideOpenIndexInArea(area);
			if (tileIndex) {
				gs.createObject(tileIndex, 'Stalagmite');
			}
		}

		// Closing tiles:
		gs.getIndexInBox(area).forEach(function (tileIndex) {
			gs.getTile(tileIndex).isClosed = true;
		}, this);
	};
	
	this.floatingFeatureTypes.BeeHive.canGenerate = function () {
		return baseGenerator.getOpenBox(this.width, this.height);
	};
	
};

// PLACE_FLOATING_VAULT:
// Generic code used by floating features
// ************************************************************************************************
featureGenerator.placeFloatingVault = function (vaultTypeName) {
	var vaultType, area, indexList, tileIndex, centerTileIndex;
		
	vaultType = gs.vaultTypes[vaultTypeName];
	
	tileIndex = baseGenerator.getOpenBox(vaultType.width, vaultType.height);

	area = baseGenerator.placeVault(tileIndex, {vaultTypeName: vaultTypeName});

	// Find nearest tileIndex:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => gs.isHallIndex(index));
	indexList = indexList.filter(index => !gs.getArea(index) || gs.getArea(index) !== area);
	centerTileIndex = {x: area.centerX, y: area.centerY};
	indexList = indexList.sort((a, b) => util.distance(a, centerTileIndex) - util.distance(b, centerTileIndex));

	// Connect w/ hall
	baseGenerator.placeAStarHall(gs.getHallIndex(area), indexList[0]);

	// Close tiles:
	gs.getIndexInBox(area).forEach(function (index) {
		gs.getTile(index).isClosed = true;
	});
};

// CREATE_CAVE:
// Generic code used by many floating feature generators
// Returns the area
// ************************************************************************************************
featureGenerator.createCave = function (box) {
	var area, indexList;
	
	// Creating cave:
	baseGenerator.placeTileCave(box.startTileIndex, box.endTileIndex, gs.tileTypes.CaveWall);
		
	// Creating area:
	area = baseGenerator.createArea(box.startX, box.startY, box.endX, box.endY);
	area.type = 'FeatureCave';
	
	
	// Find nearest tileIndex:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => gs.isHallIndex(index));
	indexList = indexList.filter(index => !gs.getArea(index) || gs.getArea(index) !== area);
	indexList = indexList.sort((a, b) => util.distance(a, area.centerTileIndex) - util.distance(b, area.centerTileIndex));


	// Connecting to main cave:
	baseGenerator.createHall(gs.getOpenIndexInArea(area), indexList[0], 3, gs.tileTypes.CaveFloor);
	
	return area;
};

// CREATE_SIDE_ROOM:
// Generic code used by many side rooms
// Creates the room and door
// Returns the door for post processing
// ************************************************************************************************
featureGenerator.createSideRoom = function (roomLocation, doorTypeType = 'Door') {
	var floorBox, tileIndex, door;
	
	floorBox = gs.createBox(roomLocation.tileIndex.x + 1,
							roomLocation.tileIndex.y + 1,
							roomLocation.tileIndex.x + roomLocation.width - 1,
							roomLocation.tileIndex.y + roomLocation.height - 1);
	
	roomLocation.floorBox = floorBox;
	
	// Carving out floor:
	baseGenerator.placeTileSquare(floorBox.startTileIndex, floorBox.endTileIndex, gs.tileTypes.Floor);

	// Placing doors on an overlap:
	tileIndex = util.randElem(util.randElem(roomLocation.overlapList));
	gs.setTileType(tileIndex, gs.tileTypes.Floor);
	door = gs.createDoor(tileIndex, doorTypeType);
	roomLocation.doorTileIndex = {x: tileIndex.x, y: tileIndex.y};
	
	
	return door;
};

// CREATE_MOB_CLOSET:
// Generic code used by drop wall rooms and monster zoos:
// ************************************************************************************************
featureGenerator.createMobClosest = function (roomLocation, maxNPCs, hasChest, dropTable) {
	var floorBox, indexList;
		
	// Floor Box:
	floorBox = gs.createBox(roomLocation.tileIndex.x + 1,
							roomLocation.tileIndex.y + 1,
							roomLocation.tileIndex.x + roomLocation.width - 1,
							roomLocation.tileIndex.y + roomLocation.height - 1);
	roomLocation.floorBox = floorBox;
	
	// Carving out floor:
	baseGenerator.placeTileSquare(floorBox.startTileIndex, floorBox.endTileIndex, gs.tileTypes.Floor);

	
	if (!gs.getWideOpenIndexInBox(floorBox)) {
		console.log(floorBox);
		console.log(roomLocation);
		throw 'error';
	}
	
	// Placing chest:
	if (hasChest) {
		if (dropTable) {
			gs.createContainer(gs.getWideOpenIndexInBox(floorBox), 'Chest', false, false, util.randElem(dropTable));
		}
		else {
			gs.createContainer(gs.getWideOpenIndexInBox(floorBox), 'Chest', false, false);
		}
	}
	

	// Placing monsters:
	if (gs.debugProperties.spawnMobs) {
		indexList = gs.getIndexInBox(floorBox);
		indexList = indexList.filter(index => gs.isPassable(index));
		
		// Maximum number of monsters:
		indexList = gs.randSubset(indexList, Math.min(maxNPCs, indexList.length));

		for (let i = 0; i < indexList.length; i += 1) {
			gs.spawnMonsterZooNPC(indexList[i]);
			gs.getChar(indexList[i]).isAsleep = false;
		}
	}

	// Close Tiles:
	// Including walls to disable tunneling through them
	gs.getIndexInBox(floorBox.startX - 1, floorBox.startY - 1, floorBox.endX + 1, floorBox.endY + 1).forEach(function (index) {
		gs.getTile(index).isClosed = true;
	}, this);
};



// GET_SIDE_ROOM_LOCATION_LIST:
// Return a list of {tileIndex, width, height} which represent valid locations where a side room can be generated
// ************************************************************************************************
featureGenerator.getSideRoomLocationList = function (specialFeatureType) {
	var validList = [], roomLocation;
	
	// Iterating over all possible sizes of the room:
	for (let x = specialFeatureType.minSize; x <= specialFeatureType.maxSize; x += 1) {
		for (let y = specialFeatureType.minSize; y <= specialFeatureType.maxSize; y += 1) {
			
			// Iterating over all possible tileIndices:
			gs.getAllIndex().forEach(function (tileIndex) {
				roomLocation = this.getSideRoomLocation(tileIndex, x, y, specialFeatureType.minOverlap);
				if (roomLocation) {
					validList.push(roomLocation);
				}
			}, this);
			
		}
	}
	
	return validList;
};

// EFFICIENCY_NOTES:
// use a blockSideRoom flag that is reset on each pass
// by going from smallest to largest, if a tile is invalid for a small room it will be invalid for anything larger
// this will help to speed up generation

// IS_OVERLAP:
// Is tile cardinally adjacent to at least one passable tile
// ************************************************************************************************
featureGenerator.isOverlap = function (x, y) {
	return gs.isPassable(x - 1, y) && !gs.getTile(x - 1, y).isClosed
		|| gs.isPassable(x + 1, y) && !gs.getTile(x + 1, y).isClosed
		|| gs.isPassable(x, y - 1) && !gs.getTile(x, y - 1).isClosed
		|| gs.isPassable(x, y + 1) && !gs.getTile(x, y + 1).isClosed;
};

// GET_SIDE_ROOM_LOCATION:
// Will test if the position is valid (returns null if invalid)
// If it is valid it will return a validLocation obj
// validRoomLocation: {tileIndex, width, height, wallList}
// Wall list is a list of arrays containing contiguous overlaps
// ************************************************************************************************
featureGenerator.getSideRoomLocation = function (tileIndex, width, height, minOverlap) {
	var indexList, count, validRoomLocation, tempOverlap = [], overlapIterate;
	
	validRoomLocation = {
		tileIndex: {x: tileIndex.x, y: tileIndex.y},
		width: width,
		height: height,
		overlapList: []
	};
	
	// Testing that all tiles are not passable i.e. some type of wall:
	indexList = gs.getIndexInBox(tileIndex.x, tileIndex.y, tileIndex.x + width, tileIndex.y + height);
	indexList = indexList.filter(index => !gs.getTile(index).type.passable);
	indexList = indexList.filter(index => !gs.getTile(index).isClosed);
	if (indexList.length !== width * height) {
		return null;
	}
	
	
	
	// Test each wall of the potential side room to see what the overlap is:
	// Note that we are not testing the corners
	// Note that count is reset in order to guarantee continuous overlap
	// Upper Wall:
	
	overlapIterate = function (x, y) {
		if (this.isOverlap(x, y)) {
			count += 1;
			tempOverlap.push({x: x, y: y});
		}
		else {
			if (count >= minOverlap) {
				validRoomLocation.overlapList.push(tempOverlap);
			}
			tempOverlap = [];
			count = 0;
		}
	}.bind(this);
	
	// Upper Wall:
	count = 0;
	tempOverlap = [];
	for (let x = tileIndex.x + 1; x < tileIndex.x + width - 1; x += 1) {
		overlapIterate(x, tileIndex.y);
	}
	
	// Lower Wall:
	count = 0;
	tempOverlap = [];
	for (let x = tileIndex.x + 1; x < tileIndex.x + width - 1; x += 1) {
		overlapIterate(x, tileIndex.y + height - 1);
	}
	
	// Left Wall:
	count = 0;
	tempOverlap = [];
	for (let y = tileIndex.y + 1; y < tileIndex.y + height - 1; y += 1) {
		overlapIterate(tileIndex.x, y);
	}
	
	// Right Wall:
	count = 0;
	tempOverlap = [];
	for (let y = tileIndex.y + 1; y < tileIndex.y + height - 1; y += 1) {
		overlapIterate(tileIndex.x + width - 1, y);
	}
	
	if (validRoomLocation.overlapList.length > 0) {
		return validRoomLocation;
	}
	else {
		return null;
	}
	
};

// IS_GOOD_WALL_INDEX:
// Used for placing book shelves against walls
// ************************************************************************************************
featureGenerator.isGoodWallIndex = function (tileIndex) {
	// No adjacent wall:
	if (!gs.getIndexListCardinalAdjacent(tileIndex).some(tileIndex => gs.getTile(tileIndex).type.name === 'Wall')) {
		return false;	
	}
	
	// Has adjacent door:
	if (gs.getIndexListCardinalAdjacent(tileIndex).some(tileIndex => gs.getObj(tileIndex, obj => obj.isDoor()))) {
		return false;
	}
	
	return true;
};