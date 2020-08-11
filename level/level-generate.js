/*global game, gs, Phaser, console, frameSelector, util*/
/*global Item*/
/*global levelFiller, roomGenerator, levelController, levelVerification*/
/*global NUM_TILES_X, NUM_TILES_Y, TIER_III_ZONES*/
/*global featureGenerator, baseGenerator*/
/*global bspGenerator, sewerRoadsGenerator, sewerTunnelsGenerator, caveGenerator, rogueGenerator, jungleGenerator, cryptGenerator, arcaneGenerator*/
/*global cycleGenerator, swampGenerator, caveRoomGenerator, ringGenerator, cave2Generator, lairGenerator, feastHallGenerator, testVaultGenerator*/
/*global STATIC_LEVEL_CHANCE, */
/*global SPAWN_STREAMER_PERCENT, DOUBLE_STREAMER_PERCENT, MIN_STREAMER_LENGTH, STREAMER_MIN_LEVEL*/
/*jshint white: true, esversion: 6, laxbreak: true, loopfunc: true*/

'use strict';

gs.generateLevel = function () {
	var success = false,
		attempt = 0;
	
	while (!success) {
		// Seed Generator:
		// Note we must add the attempt in order to not just keep regening same seed
		if (this.seed) {
			game.rnd.sow([this.seed + this.zoneName + this.zoneLevel + attempt]);
		}
		
		success = this.generateLevelFunc();
		
		if (!success) {
			console.log('Failed to generate level, attempting again');
			gs.destroyLevel();
			attempt += 1;
		}
	}
	
	return true;
};

// GENERATE_LEVEL:
// ************************************************************************************************
gs.generateLevelFunc = function () {
	this.isStaticLevel = false;
	this.dressingTypeCounts = {};
	this.staticLevelName = null;
	this.currentGenerator = null;
	this.levelTriggers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	this.areaList = [];
	this.shouldPopulateLevel = true;
	featureGenerator.resetFeatureTypeCounts();
	
	// TEST_VAULT:
	if (this.debugProperties.testVault) {
		gs.initiateTileMap();
		testVaultGenerator.generate();
	}
	// TEST_LEVEL:
	else if (this.zoneName === 'TestLevel') {
		this.loadJSONLevel('TestLevel');
		this.isStaticLevel = true;
	}
	// END_LEVEL:
	else if (this.shouldLoadEndLevel()) {
		this.loadEndLevel();
	}
	// STATIC_LEVEL:
	else if (this.shouldLoadStaticLevel()) {
		this.loadStaticLevel();
	}
	// RANDOM_LEVEL:
	else {
		if (!this.generateRandomLevel()) {
			return false;
		}
	}

	// Place Stairs:
	if (!this.generateStairs()) {
		console.log('failed to place stairs');
		return false;	
	}
	
	// Generate Global Stuff:
	if (this.debugProperties.generateGlobalStuff && this.zoneName !== 'TestLevel') {
		this.generateGlobalStuff();
	}
	
	// Trim Hazards (call before setting water frames):
	// Call before populating level (so lava spawning monsters can choose valid spawns)
	if (!this.isStaticLevel) {
		this.trimHazards();
	}
	
	// Populate Level (NPCs):
	if (this.debugProperties.spawnMobs && this.shouldPopulateLevel) {
		if (this.zoneName === 'TestLevel') {
			this.populateTestLevel();
		}
		else {	
			this.populateLevel();
			this.spawnUniques();
		}
	}
	
	// Calling before secondRoom pass (to maintain pool boarders)
	frameSelector.setWaterTileFrames();
	
	// Second Pass Room Dressing:
	levelFiller.secondRoomDressingPass();
	
	// Trim side rooms:
	this.trimDoors();
	this.trimObjects();
	
	// Set Alternate Tile Frames:
	frameSelector.setAlternateTileFrames();
	
	this.placeWallDressing();
	
	
	if (!this.isStaticLevel && this.zoneName !== 'TheArcaneTower' && this.zoneName !== 'TestLevel' && !levelVerification.isConnected()) {
		//console.log('Disconnected level detected. Seed: ' + this.seed + ', ' + this.zoneName + ', ' + this.zoneLevel);
		return false;
	}
	
	
	levelController.onGenerateLevel();
	
	return true;
};

// SHOULD_LOAD_STATIC_LEVEL:
// ************************************************************************************************
gs.shouldLoadStaticLevel = function () {
	// Never static level on first level of tierIII (to make room for library):
	if (gs.inArray(gs.zoneName, TIER_III_ZONES) && gs.zoneLevel === 1) {
		return false;
	}
	
	return this.dangerLevel() > 1 && this.getStaticLevelList().length > 0 && util.frac() < STATIC_LEVEL_CHANCE;
};

// LOAD_STATIC_LEVEL:
// Call to load a static level instead of proc-genning a dungeon:
// ************************************************************************************************
gs.loadStaticLevel = function () {
	this.staticLevelName = util.randElem(this.getStaticLevelList()).fileName;
	this.loadJSONLevel(this.staticLevelName);
	this.isStaticLevel = true;
	frameSelector.dressFloorBorderTiles();
	
	this.onLoadStaticLevel(this.staticLevelName);
	this.previouslySpawnedStaticLevels.push(this.staticLevelName);
};

// SHOULD_LOAD_END_LEVEL:
// ************************************************************************************************
gs.shouldLoadEndLevel = function () {
	return this.zoneLevel === 4 && gs.inArray(this.zoneName, ['TheSewers', 'TheArcaneTower', 'TheCore', 'TheIceCaves', 'VaultOfYendor']);
};

// LOAD_END_LEVEL:
// ************************************************************************************************
gs.loadEndLevel = function () {
	var endLevelType;
	
	// Select the end level:
	endLevelType = util.randElem(gs.getEndLevelList());
	this.staticLevelName = endLevelType.fileName;
	this.shouldPopulateLevel = endLevelType.populateLevel;
	
	// Load the static map:
	this.loadJSONLevel(this.staticLevelName);
	this.isStaticLevel = true;
	frameSelector.dressFloorBorderTiles();
	
	this.onLoadStaticLevel(this.staticLevelName);
};

// GENERATE_RANDOM_LEVEL:
// ************************************************************************************************
gs.generateRandomLevel = function () {
	var generator, generatorFlags = {};
	
	generator = this.chooseRandom(this.zoneType().generators);
	
	// THE_ORC_FORTRESS: OGRE_LAIR
	if (this.zoneName === 'TheOrcFortress' && gs.zoneLevel === 4 && util.frac() < 0.25) {
		generator = lairGenerator;
	}
	// THE_DARK_TEMPLE: LIBRARY
	else if (this.zoneName === 'TheDarkTemple' && gs.zoneLevel === 1) {
		generator = cycleGenerator;
		generatorFlags = {includeVaults: ['Library']};
	}
	// THE_CRYPT: LIBRARY
	else if (this.zoneName === 'TheCrypt' && gs.zoneLevel === 1) {
		generator = cycleGenerator;
		generatorFlags = {includeVaults: ['Library']};
	}
	// THE_IRON_FORTRESS: LIBRARY
	else if (this.zoneName === 'TheIronFortress' && gs.zoneLevel === 1) {
		generator = cycleGenerator;
		generatorFlags = {includeVaults: ['Library']};
	}
	
	gs.currentGenerator = generator;
	
	// Clear the tileMap before generation:
	gs.initiateTileMap();

	if (!generator.generate(generatorFlags)) {
		return false;
	}

	if (this.zoneType().spawnPits && this.zoneLevel < 4) {
		baseGenerator.replaceIslands(gs.createBox(0, 0, this.numTilesX, this.numTilesY));
	}
	
	

	this.trimDiagonalWalls();
	
	frameSelector.dressFloorBorderTiles();

	// Dress Rooms:
	featureGenerator.placeSpecialFeatures();
	this.dressRooms();
	roomGenerator.dressRooms();
	featureGenerator.placeDressingFeatures();
	
	// Streamers:
	this.streamer = false;
	if (this.dangerLevel() >= STREAMER_MIN_LEVEL && this.zoneType().spawnStreamers && game.rnd.frac() < SPAWN_STREAMER_PERCENT) {	
		this.createStreamer();
		this.streamer = true;

		if (game.rnd.frac() < DOUBLE_STREAMER_PERCENT) {
			this.createStreamer();
		}
	}
	
	this.trimPits();
	
	return true;
};

// GENERATE_STAIRS:
// Returns false upon failure
// ************************************************************************************************
gs.generateStairs = function () {
	var branches, success = true;
	
	// Brach Down Stairs:
	branches = gs.zoneConnections.filter(branch => branch.fromZoneName === gs.zoneName && branch.fromZoneLevel === gs.zoneLevel);
	branches = branches.filter(branch => gs.inArray(branch.toZoneName, gs.branches));
	branches.forEach(function (branch) {
		if (!gs.placeStairs('DownStairs', branch.toZoneName, branch.toZoneLevel, 0)) {
			success = false;
		}
	}, this);
	
	// Branch Up Stairs:
	branches = gs.zoneConnections.filter(branch => branch.toZoneName === gs.zoneName && branch.toZoneLevel === gs.zoneLevel);
	branches = branches.filter(branch => gs.inArray(branch.fromZoneName, gs.branches));
	branches.forEach(function (branch) {
		if (!gs.placeStairs('UpStairs', branch.fromZoneName, branch.fromZoneLevel, 3)) {
			success = false;
		}
	}, this);
	
	// Up stairs only if not first level:
	if (this.zoneLevel > 1) {
		if (!this.placeStairs('UpStairs', this.zoneName, this.zoneLevel - 1, 3)) {
			return false;
		}
	}
	
	// Down stairs only if not last level:
	if (this.zoneLevel < this.zoneType().numLevels) {
		if (!this.placeStairs('DownStairs', this.zoneName, this.zoneLevel + 1, 0)) {
			return false;
		}
	}
	
	return success;
};

// PLACE_STAIRS:
// ************************************************************************************************
gs.placeStairs = function (stairsType, toZoneName, toZoneLevel, closeRadius = 0) {
	var tileIndex, obj;
	
	// Find if unconnected stairs already exist (static level):
	obj = this.findObj(obj => obj.type.name === stairsType && !obj.toZoneName);
	if (obj) {
		tileIndex = obj.tileIndex;
		gs.destroyObject(obj);
	}
	else {
		tileIndex = this.getStairIndex();
	}
	
	// Cannot locate a valid location for stairs:
	if (!tileIndex) {
		return false;
	}
	
	this.createZoneLine(tileIndex, stairsType, toZoneName, toZoneLevel);
	
	// Close tiles to spawning:
	this.getIndexInRadius(tileIndex, closeRadius).forEach(function (index) {
		this.getTile(index).isClosed = true;
	}, this);
	
	return true;
};

// CREATE_STREAMER:
// ************************************************************************************************
gs.createStreamer = function () {
	var edgeNames, tileIndex1, tileIndex2, randPositionOnEdge, count = 0, width = 1, widthDelta = 1, MAX_WIDTH = 3, streamerType;
	
	streamerType = util.randElem(['WATER', 'RUBBLE']);
	streamerType = 'RUBBLE';
	
	randPositionOnEdge = function (edgeName) {
		if (edgeName === 'LEFT') {
			return {x: 2, y: util.randInt(2, gs.numTilesY - 3)};
		}
		if (edgeName === 'RIGHT') {
			return {x: gs.numTilesX - 3, y: util.randInt(2, gs.numTilesY - 3)};
		}
		if (edgeName === 'UP') {
			return {x: util.randInt(2, gs.numTilesX - 3), y: 2};
		}
		if (edgeName === 'DOWN') {
			return {x: util.randInt(2, gs.numTilesX - 3), y: gs.numTilesY - 3};
		}
	};
	
	do {
		// Select points on two edges of the map
		edgeNames = this.randSubset(['LEFT', 'RIGHT', 'DOWN'], 2);
		tileIndex1 = randPositionOnEdge(edgeNames[0]);
		tileIndex2 = randPositionOnEdge(edgeNames[1]);
		
		count += 1;
		if (count > 1000) {
			throw 'Loop count exceeded';
		}
	} while (util.distance(tileIndex1, tileIndex2) < MIN_STREAMER_LENGTH);
		
	// Lay down cave floor and destroy objects:
	this.getIndexInRay(tileIndex1, tileIndex2).forEach(function (index) {
		// Changing width:
		if (game.rnd.frac() < 0.1) {
			if (widthDelta === 1 && width === MAX_WIDTH) {
				widthDelta = -1;
				width -= 1;
			} else if (widthDelta === 1) {
				width += 1;
			} else if (widthDelta === -1 && width === 1) {
				widthDelta = 1;
				width += 1;
			} else if (widthDelta === -1) {
				width -= 1;
			}
		}
		
		this.getIndexInRadius(index, width).forEach(function (index) {
			if (index.x !== 0 && index.y !== 0 && index.x !== this.numTilesX - 1 && index.y !== this.numTilesY - 1) {
				if (!this.getTile(index).isClosed && !gs.isPit(index)) {
					this.setTileType(index, this.tileTypes.CaveFloor);
					if (this.getObj(index)) {
						this.destroyObject(this.getObj(index));
					}
				}
			}
		}, this);
	}, this);
	
	// Center:
	MAX_WIDTH -=1;
	this.getIndexInRay(tileIndex1, tileIndex2).forEach(function (index) {
		// Changing width:
		if (game.rnd.frac() < 0.1) {
			if (widthDelta === 1 && width === MAX_WIDTH) {
				widthDelta = -1;
				width -= 1;
			} else if (widthDelta === 1) {
				width += 1;
			} else if (widthDelta === -1 && width === 1) {
				widthDelta = 1;
				width += 1;
			} else if (widthDelta === -1) {
				width -= 1;
			}
		}
		
		this.getIndexInRadius(index, Math.max(1, Math.ceil(width / 2))).forEach(function (index) {
			if (index.x !== 0 && index.y !== 0 && index.x !== this.numTilesX - 1 && index.y !== this.numTilesY - 1) {
				if (!this.getTile(index).isClosed && !gs.isPit(index)) {
					if (streamerType === 'WATER') {
						this.setTileType(index, this.tileTypes.Water);
					} else if (streamerType === 'RUBBLE') {
						if (game.rnd.frac() < 0.05 && !this.getObj(index) && this.isPassable(index)) {
							this.createObject(index, 'Rubble');
						}
					} else if (streamerType === 'LAVA') {
						this.setTileType(index, this.tileTypes.Lava);
					}
				}
			}
		}, this);
	}, this);
};

// TRIM_HAZARDS:
// ************************************************************************************************
gs.trimHazards = function () {
	// Trimming Lava from walls:
	gs.getAllIndex().forEach(function (tileIndex) {
		var indexList;
		if (this.getTile(tileIndex).type.name === 'Lava') {
			indexList = this.getIndexListCardinalAdjacent(tileIndex);
			indexList = indexList.filter(index => this.getTile(index).type.name === 'CaveWall');
			
			if (indexList.length > 0) {
				this.setTileType(tileIndex, this.tileTypes.CaveFloor);
				
				if (gs.getChar(tileIndex) && gs.getChar(tileIndex).type.spawnInLava) {
					gs.getChar(tileIndex).destroy();
				}
				
			}
		}
	}, this);
	
	// Trimming single lava:
	gs.getAllIndex().forEach(function (tileIndex) {
		var indexList;
		if (this.getTile(tileIndex).type.name === 'Lava') {
			indexList = this.getIndexListCardinalAdjacent(tileIndex);
			indexList = indexList.filter(index => this.getTile(index).type.name === 'Lava');
			
			if (indexList.length === 0) {
				this.setTileType(tileIndex, this.tileTypes.CaveFloor);
			}
		}
			
	}, this);
};


// TRIM_OBJECTS:
// ************************************************************************************************
gs.trimObjects = function () {
	gs.getAllIndex().forEach(function (index) {
		if (gs.getObj(index, 'LongGrass') && gs.getTile(index).type.name === 'Water') {
			gs.destroyObject(gs.getObj(index));
		}
	}, this);
};

// TRIM_DOORS:
// Remove all short hall doors
// ************************************************************************************************
gs.trimDoors = function () {
	gs.getIndexInBox(1, 1, NUM_TILES_X - 1, NUM_TILES_Y - 1).forEach(function (index) {
		// Horizontal short halls:
		if (gs.isPassable(index) && 
			(!gs.getArea(index) || gs.getArea(index).isVault === false) &&
			gs.getObj(index.x + 1, index.y, obj => obj.type.name === 'Door') &&
			gs.getObj(index.x - 1, index.y, obj => obj.type.name === 'Door')) {
		
			gs.destroyObject(gs.getObj(index.x + 1, index.y));
			gs.destroyObject(gs.getObj(index.x - 1, index.y));
		}
		
		// Vertical short halls:
		if (gs.isPassable(index) && 
			(!gs.getArea(index) || gs.getArea(index).isVault === false) &&
			gs.getObj(index.x, index.y + 1, obj => obj.type.name === 'Door') &&
			gs.getObj(index.x, index.y - 1, obj => obj.type.name === 'Door')) {
		
			gs.destroyObject(gs.getObj(index.x, index.y + 1));
			gs.destroyObject(gs.getObj(index.x, index.y - 1));
		}
		
		// Freestanding doors:
		if (gs.getObj(index, obj => obj.type.name === 'Door') && gs.getIndexListCardinalAdjacent(index).filter(idx => !gs.isPassable(idx)).length <= 1) {
			gs.destroyObject(gs.getObj(index));
		}
		
		
		
	}, this);
};

// TRIM_DIAGONAL_WALLS:
// ************************************************************************************************
gs.trimDiagonalWalls = function () {
	for (let x = 0; x < gs.numTilesX - 1; x += 1) {
		for (let y = 0; y < gs.numTilesY - 1; y += 1) {
			// X O
			// O X
			if (!gs.getTile(x, y).type.passable &&
				!gs.getTile(x + 1, y + 1).type.passable  &&
				gs.getTile(x + 1, y).type.passable && 
				gs.getTile(x, y + 1).type.passable) {
				
				if (gs.getTile(x, y).type.name === 'Wall') {
					gs.setTileType({x: x, y: y}, gs.tileTypes.Floor);
				}
				else if (gs.getTile(x, y).type.name === 'CaveWall') {
					gs.setTileType({x: x, y: y}, gs.tileTypes.CaveFloor);
				}
			}
			
			// O X
			// X O
			if (gs.getTile(x, y).type.passable &&
				gs.getTile(x + 1, y + 1).type.passable  &&
				!gs.getTile(x + 1, y).type.passable && 
				!gs.getTile(x, y + 1).type.passable) {
				
				if (gs.getTile(x, y).type.name === 'Wall') {
					gs.setTileType({x: x, y: y}, gs.tileTypes.Floor);
				}
				else if (gs.getTile(x, y).type.name === 'CaveWall') {
					gs.setTileType({x: x, y: y}, gs.tileTypes.CaveFloor);
				}
			}
		}
	}
};

// TRIM_PITS:
// Remove single pits
// ************************************************************************************************
gs.trimPits = function () {
	var isSinglePit, change = true;
	
	isSinglePit = function (x, y) {
		if (gs.getTile(x, y).type.name === 'Pit') {
			if ((gs.getTile(x + 1, y).type.name !== 'Pit' && gs.getTile(x - 1, y).type.name !== 'Pit')
			|| 	(gs.getTile(x, y + 1).type.name !== 'Pit' && gs.getTile(x, y - 1).type.name !== 'Pit')) {
				return true;
			}
		}
	
		if (gs.getTile(x, y).type.name === 'CavePit') {
			if ((gs.getTile(x + 1, y).type.name !== 'CavePit' && gs.getTile(x - 1, y).type.name !== 'CavePit')
			|| 	(gs.getTile(x, y + 1).type.name !== 'CavePit' && gs.getTile(x, y - 1).type.name !== 'CavePit')) {
				return true;
			}
		}
		
		if (gs.getTile(x, y).type.name === 'Pit') {
			if (gs.getIndexListCardinalAdjacent({x: x, y: y}).filter(idx => gs.getTile(idx).type.name === 'Pit').length <= 1) {
				return true;
			}
		}
		
		return false;
	};
	
	while (change) {
		change = false;
		gs.getAllIndex().forEach(function (tileIndex) {
			if (isSinglePit(tileIndex.x, tileIndex.y)) {
				
				if (gs.getTile(tileIndex).type.name === 'CavePit') {
					gs.setTileType(tileIndex, gs.tileTypes.CaveFloor);
				}
				else {
					gs.setTileType(tileIndex, gs.tileTypes.Floor);
				}
				change = true;
			}
		}, this);
	}
};