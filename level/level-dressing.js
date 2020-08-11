/*global game, gs, Phaser, console, util*/
/*global Item*/
/*global NUM_TILES_X*/
/*global MIN_ELITE_LEVEL, NPC_ELITE_CHANCE, TIMED_GATE_TIME*/
/*global SPAWN_VINE_PERCENT, MAX_VINES, SUPER_VINE_PERCENT*/
/*jshint white: true, laxbreak: true, esversion: 6 */
'use strict';

// CREATE_ROOM_DRESSING_TABLES:
// ********************************************************************************************
gs.createRoomDressingTables = function () {
	
	
	this.roomDressingTypes = {
		// LargeRoom:
		Tomb:				{areaType: 'LargeRoom', func: this.dressTomb},
		
		// Cave:
	  	CrystalCave:		{areaType: 'Cave', func: this.dressCrystalCave},
	  	WaterCave:			{areaType: 'Cave', func: this.dressWaterCave},
	  	GrassCave:			{areaType: 'Cave', func: this.dressGrassCave},
		LavaCave:			{areaType: 'Cave', func: this.dressLavaCave},
		GroveCave:			{areaType: 'Cave', func: this.dressGroveCave},
		GroveWaterCave: 	{areaType: 'Cave', func: this.dressGroveWaterCave},
		DesertCave:			{areaType: 'Cave', func: this.dressDesertCave},
		SnowForest:			{areaType: 'Cave', func: this.dressSnowForeset},
		
	};

	// Default Dressing Properties:
	this.forEachType(this.roomDressingTypes, function (element) {
		element.minSize = element.minSize || 0;
		element.maxSize = element.maxSize || NUM_TILES_X;
		element.maxCount = element.maxCount || 1000;
	}, this);
	
	this.nameTypes(this.roomDressingTypes);
};

// DRESS_ROOMS:
// ************************************************************************************************
gs.dressRooms = function () {
	
	if (this.debugProperties.dressRooms && this.areaList) {
		for (let i = 0; i < this.areaList.length; i += 1) {
			if (this.areaList[i].type === 'Cave' || this.areaList[i].type === 'Crypt') {
				this.dressRoom(this.areaList[i]);
			}
			
		}
	}
};

// DRESS_ROOM:
// ************************************************************************************************
gs.dressRoom = function (area) {	
	var roomDressingType = this.getRoomDressingType(area);
	
	if (roomDressingType) {
		roomDressingType.func.call(this, area);
		
		if (!this.dressingTypeCounts[roomDressingType.name]) {
			this.dressingTypeCounts[roomDressingType.name] = 0;
		}
		this.dressingTypeCounts[roomDressingType.name] += 1;
	}
};

// GET_ROOM_DRESSING_TYPE:
// Given an area, determine based on its areaType what random roomDressing to use.
// This function uses the dressingTable specified and defined in level-type.js.
// If no appropriate dressingType is available or NONE is randomly chosen then return null indicating no dressing for the area.
// ************************************************************************************************
gs.getRoomDressingType = function (area) {
	var roomDressingTypeName, dressingTable;

	// The zone has no dressing table:
	if (!this.zoneType().dressingTable) {
		throw this.zoneName + ' does not have a valid dressing table';
	}

	// A valid dressing table exists based on the area type:
	if (this.zoneType().dressingTable[area.type] && this.zoneType().dressingTable[area.type].length > 0) {
		dressingTable = this.zoneType().dressingTable[area.type].filter(function (element) {
			var dressingType = this.roomDressingTypes[element.name];
			
			return element.name === 'NONE'
				|| ((!element.minLevel || this.dangerLevel() >= element.minLevel)
					&& area.width >= dressingType.minSize
					&& area.height >= dressingType.minSize
				   	&& area.width <= dressingType.maxSize
				   	&& area.height <= dressingType.maxSize
					&& (!this.dressingTypeCounts[element.name] || this.dressingTypeCounts[element.name] < dressingType.maxCount)
				   	&& (!dressingType.validFunc || dressingType.validFunc(area)));	
		}, this);
		
		if (dressingTable.length === 0) {
			return null;
		}
		
		roomDressingTypeName = this.chooseRandom(dressingTable);

		if (roomDressingTypeName === 'NONE') {
			return null;
		}
		else {
			return this.roomDressingTypes[roomDressingTypeName];
		}
	}
	// No valid dressing table exists based on the area type:
	else {
		return null;
	}
};

// DRESS_TOMB:
// The Tomb is a large room with caskets placed down the center in one or more columns providing cover from projectiles.
// ************************************************************************************************
gs.dressTomb = function (area) {
	var indexList;
	// end - 1 so that caskets do not spawn against end walls
	indexList = this.getIndexInBox(area.startX, area.startY, area.endX - 1, area.endY - 1);
	
	// startX + 1 so that caskets do not spawn against start walls
	indexList = indexList.filter(index => index.x % 2 === (area.startX + 1) % 2 && index.y % 2 === (area.startY + 1) % 2);
	
	indexList = indexList.filter(index => game.rnd.frac() < 0.5);
	
	indexList.forEach(function (index) {
		gs.createObject(index, 'Casket');
	});
};

// DRESS_WATER_CAVE:
// ************************************************************************************************
gs.dressWaterCave = function (area) {
	var tileArea, maxObjs, maxPatches;
	
	// The total tileArea will generally be 40x40 = 1600, 40x20 = 800, 20x20 = 400:
	tileArea = util.boxTileArea(area);
	maxObjs = Math.ceil(tileArea / 100);
	maxPatches = Math.ceil(tileArea / 400);

	this.createLakes(area, util.randInt(3, 6));

	// Stalagmites:
	gs.dressAreaObjects(area, 'Stalagmite', maxObjs);
	
	// Rubble:
	if (game.rnd.frac() < 0.25) {
		gs.dressAreaPatches(area, 'Rubble', maxPatches, 1, 4, 0.75);
	}
};


// DRESS_SNOW_FOREST:
// ************************************************************************************************
gs.dressSnowForeset = function (area) {
	var tileArea, maxObjs, maxPatches;
	
	// The total tileArea will generally be 40x40 = 1600, 40x20 = 800, 20x20 = 400:
	tileArea = util.boxTileArea(area);
	maxObjs = Math.ceil(tileArea / 100);
	maxPatches = Math.ceil(tileArea / 400);
	
	// Trees:
	gs.dressAreaObjects(area, 'Tree', maxObjs, 1739);
};

// DRESS_DESERT_CAVE:
// ************************************************************************************************
gs.dressDesertCave = function (area) {
	var tileArea, maxObjs, maxPatches;
	
	// The total tileArea will generally be 40x40 = 1600, 40x20 = 800, 20x20 = 400:
	tileArea = util.boxTileArea(area);
	maxObjs = Math.ceil(tileArea / 100);
	maxPatches = Math.ceil(tileArea / 400);
	
	// Stalagmites:
	gs.dressAreaObjects(area, 'Stalagmite', maxObjs);
	
	// Cactus:
	if (util.frac() < 0.5) {
		gs.dressAreaObjects(area, 'Cactus', maxObjs);
	}
	
	// Rubble:
	if (util.frac() < 0.5) {
		gs.dressAreaPatches(area, 'Rubble', maxPatches, 1, 4, 0.75);
	}
	
	// Bone Patch:
	if (util.frac() < SPAWN_VINE_PERCENT) {
		let num = util.randInt(Math.ceil(MAX_VINES / 2), MAX_VINES);
		
		// Super Vines:
		if (util.frac() < SUPER_VINE_PERCENT) {
			num = MAX_VINES * 5;
		}
		
		for (let i = 0; i < num; i += 1) {
			let tileIndex = this.getOpenIndexInLevel();
			if (tileIndex) {
				this.createVinePatch(tileIndex, util.randInt(2, 4), 'Bones', 0.5);
			}
		}
	}
};



// DRESS_GRASS_CAVE:
// ************************************************************************************************
gs.dressGrassCave = function (area) {
	var tileArea, maxObjs, maxPatches;

	// The total tileArea will generally be 40x40 = 1600, 40x20 = 800, 20x20 = 400:
	tileArea = util.boxTileArea(area);
	maxObjs = Math.ceil(tileArea / 100);
	maxPatches = Math.ceil(tileArea / 400);
	
	// Stalagmites:
	gs.dressAreaObjects(area, 'Stalagmite', maxObjs);
	
	// Grass:
	gs.dressAreaPatches(area, 'LongGrass', maxPatches, 2, 4, 0.50);
	
	// Rubble:
	if (game.rnd.frac() < 0.5) {
		gs.dressAreaPatches(area, 'Rubble', maxPatches, 1, 4, 0.75);
	}
};


// DRESS_GROVE_CAVE:
// An undergrove cave with folliage
// ************************************************************************************************
gs.dressGroveCave = function (area) {
	var tileArea, maxGrass, maxObjs;
	
	// The total tileArea will generally be 40x40 = 1600, 40x20 = 800, 20x20 = 400:
	tileArea = util.boxTileArea(area);
	maxObjs = Math.ceil(tileArea / 100);
	maxGrass = Math.ceil(tileArea / 400); // 4,3,2,1
	
	// Big Tree:
	if (util.frac() < 1.25) {
		for (let i = 0; i < maxGrass; i += 1) {
			let box = gs.getOpenBoxInArea(area, 4, 4);
			if (box) {
				gs.createObject({x: box.startX + 1, y: box.startY + 1}, 'Tree', 1737);
				gs.createObject({x: box.startX + 2, y: box.startY + 1}, 'Tree', 1738);
				gs.createObject({x: box.startX + 1, y: box.startY + 2}, 'Tree', 1735);
				gs.createObject({x: box.startX + 2, y: box.startY + 2}, 'Tree', 1736);
			}
		}
	}
	
	// Ferns:
	gs.dressAreaObjects(area, 'Fern', maxObjs);
	
	// Stalagmites
	if (util.frac() < 0.5) {
		gs.dressAreaObjects(area, 'Stalagmite', maxObjs);
	}
	// Trees:
	else {
		gs.dressAreaObjects(area, 'Tree', maxObjs, 1706);
	}
	
	// Grass Patches:
	gs.dressAreaPatches(area, 'LongGrass', maxGrass, 2, 6, 0.50);
};

// DRESS_GROVE_WATER_CAVE:
// An Under Grove cave with lakes, rivers and folliage
// ************************************************************************************************
gs.dressGroveWaterCave = function (area) {
	this.createLakes(area, util.randInt(3, 6));
	this.dressGroveCave(area);
};

// DRESS_LAVA_CAVE:
// ************************************************************************************************
gs.dressLavaCave = function (area) {
	var tileArea, maxObjs, maxPatches;
	
	// The total tileArea will generally be 40x40 = 1600, 40x20 = 800, 20x20 = 400:
	tileArea = util.boxTileArea(area);
	maxObjs = Math.ceil(tileArea / 100);
	maxPatches = Math.ceil(tileArea / 400);

	// Lava:
	this.createLavaLakes(area, util.randInt(3, 6));

	// Stalagmites:
	gs.dressAreaObjects(area, 'Stalagmite', maxObjs);
	
	// Rubble:
	if (game.rnd.frac() < 0.25) {
		gs.dressAreaPatches(area, 'Rubble', maxPatches, 1, 4, 0.75);
	}
};

// DRESS_AREA_OBJECTS:
// Places 1-max objects in the area on wideOpen tiles
// ************************************************************************************************
gs.dressAreaObjects = function (area, typeName, max, frame = null) {
	var tileIndex, num;
	
	num = util.randInt(1, max);
	
	for (let i = 0; i < num; i += 1) {
		tileIndex = this.getWideOpenIndexInArea(area);
		if (tileIndex) {
			gs.createObject(tileIndex, typeName, frame);
		}
	}
};

// DRESS_AREA_PATCHES:
// Places 1-maxPatches patches in the area on wideOpen tiles
// ************************************************************************************************
gs.dressAreaPatches = function (area, typeName, maxPatches, minSize, maxSize, percent) {
	var num, tileIndex;
	
	num = util.randInt(1, maxPatches);
	
	for (let i = 0; i < num; i += 1) {
		tileIndex = gs.getOpenIndexInArea(area);
		if (tileIndex) {
			this.createVinePatch(tileIndex, util.randInt(minSize, maxSize), typeName, percent);
		}
	}
};

// CREATE_LAKES:
// ************************************************************************************************
gs.createLakes = function (area, num) {
	var i, x, y, tileIndex, waterTileIndexes = [], path;

	// Water:
	for (i = 0; i < num; i += 1) {
		tileIndex = gs.getOpenIndexInArea(area);
		if (tileIndex) {
			this.floodTiletype(tileIndex, gs.tileTypes.Water, util.randInt(3, 7));
			waterTileIndexes.push(tileIndex);
		}
	}

	// First River:
	if (game.rnd.frac() < 0.75) {
		path = this.findPath(waterTileIndexes[0], waterTileIndexes[1], {allowDiagonal: false, maxDepth: 1000});
		if (path && path.length > 0) {
			for (i = 0; i < path.length; i += 1) {
				gs.setTileType(path[i], gs.tileTypes.Water);
			}
		}
	}

	// Second River:
	if (game.rnd.frac() < 0.50) {
		path = this.findPath(waterTileIndexes[1], waterTileIndexes[2], {allowDiagonal: false, maxDepth: 1000});
		if (path && path.length > 0) {
			for (i = 0; i < path.length; i += 1) {
				gs.setTileType(path[i], gs.tileTypes.Water);
			}
		}
	}

	// Grass around water:
	for (x = area.startX + 1; x < area.endX - 1; x += 1) {
		for (y = area.startY + 1; y < area.endY - 1; y += 1) {
			if (this.isIndexOpen(x, y)
				&& (this.tileMap[x + 1][y].type.name === 'Water'
					|| this.tileMap[x - 1][y].type.name === 'Water'
					|| this.tileMap[x][y + 1].type.name === 'Water'
					|| this.tileMap[x][y - 1].type.name === 'Water')) {
				this.createVinePatch({x: x, y: y}, util.randInt(1, 3), 'LongGrass');
			}
		}
	}
};

// CREATE_LAVA_LAKES:
// ************************************************************************************************
gs.createLavaLakes = function (area, num) {
	var i, x, y, tileIndex, lavaTileIndexes = [], path;

	// Lava Lake:
	for (i = 0; i < num; i += 1) {
		tileIndex = gs.getOpenIndexInArea(area);
		if (tileIndex) {
			this.floodTiletype(tileIndex, gs.tileTypes.Lava, util.randInt(3, 7));
			lavaTileIndexes.push(tileIndex);
		}
	}

	// First River:
	if (game.rnd.frac() < 0.75) {
		path = this.findPath(lavaTileIndexes[0], lavaTileIndexes[1], {allowDiagonal: false, maxDepth: 1000});
		if (path && path.length > 0) {
			for (i = 0; i < path.length; i += 1) {
				gs.setTileType(path[i], gs.tileTypes.Lava);
			}
		}
	}

	// Second River:
	if (game.rnd.frac() < 0.50) {
		path = this.findPath(lavaTileIndexes[1], lavaTileIndexes[2], {allowDiagonal: false, maxDepth: 1000});
		if (path && path.length > 0) {
			for (i = 0; i < path.length; i += 1) {
				gs.setTileType(path[i], gs.tileTypes.Lava);
			}
		}
	}
};



// CREATE_VINE_PATCH:
// ************************************************************************************************
gs.createVinePatch = function (tileIndex, maxDepth, objectName, percent) {
	var iterFunc;

	percent = percent || 1;
	
	// ITER FUNC:
	// *********************************************************************
	iterFunc = function (x, y, depth) {
		if (depth > maxDepth) {
			return;
		}

		if (gs.isInBounds(x, y)
			&& gs.getTile(x, y).type.passable
			&& !gs.getObj(x, y)
			&& gs.getTile(x, y).type.name !== 'Water'
			&& game.rnd.frac() <= percent) {
			
			if (objectName === 'Water') {
				gs.setTileType({x: x, y: y}, gs.tileTypes.Water);
			} else {
				gs.createObject({x: x, y: y}, objectName);
			}
		}

		if (gs.isIndexOpen(x + 1, y) || gs.getChar(x + 1, y)) {
			iterFunc(x + 1, y, depth + 1);
		}
		if (gs.isIndexOpen(x - 1, y) || gs.getChar(x - 1, y)) {
			iterFunc(x - 1, y, depth + 1);
		}
		if (gs.isIndexOpen(x, y + 1) || gs.getChar(x, y + 1)) {
			iterFunc(x, y + 1, depth + 1);
		}
		if (gs.isIndexOpen(x, y - 1) || gs.getChar(x, y - 1)) {
			iterFunc(x, y - 1, depth + 1);
		}
	};


	iterFunc(tileIndex.x, tileIndex.y, 0);
};


// FLOOD_TILE_TYPE:
// ************************************************************************************************
gs.floodTiletype = function (tileIndex, tileType, maxDepth) {
	var area = this.getTile(tileIndex).area,
		floodFunc,
		index,
		fillSpaces;


	// FLOOD FUNC:
	// *************************************************************************
	floodFunc = function (startX, startY) {
		var x, y, iterFunc;

		// ITER FUNC:
		// *********************************************************************
		iterFunc = function (x, y, depth) {
			if (depth > maxDepth) {
				return;
			}

			gs.setTileType({x: x, y: y}, tileType);

			if (gs.isIndexOpen(x + 1, y)) {
				iterFunc(x + 1, y, depth + 1);
			}
			if (gs.isIndexOpen(x - 1, y)) {
				iterFunc(x - 1, y, depth + 1);
			}
			if (gs.isIndexOpen(x, y + 1)) {
				iterFunc(x, y + 1, depth + 1);
			}
			if (gs.isIndexOpen(x, y - 1)) {
				iterFunc(x, y - 1, depth + 1);
			}
		};

		iterFunc(startX, startY, 0);
	};

	// FILL SPACES:
	// *************************************************************************
	fillSpaces = function () {
		var numWaterNeighbours, numWaterWallNeighbours, x, y;

		// NUM WATER WALL NEIGHBOURS:
		// *************************************************************************
		numWaterWallNeighbours = function (x, y) {
			var count = 0;
			count += gs.isInBounds(x + 1, y) && (gs.getTile(x + 1, y).type === tileType || !gs.isIndexOpen(x + 1, y)) ? 1 : 0;
			count += gs.isInBounds(x - 1, y) && (gs.getTile(x - 1, y).type === tileType || !gs.isIndexOpen(x - 1, y)) ? 1 : 0;
			count += gs.isInBounds(x, y + 1) && (gs.getTile(x, y + 1).type === tileType || !gs.isIndexOpen(x, y + 1)) ? 1 : 0;
			count += gs.isInBounds(x, y - 1) && (gs.getTile(x, y - 1).type === tileType || !gs.isIndexOpen(x, y - 1)) ? 1 : 0;
			return count;
		};

		// NUM WATER NEIGHBOURS:
		// *************************************************************************
		numWaterNeighbours = function (x, y) {
			var count = 0;
			count += gs.isInBounds(x + 1, y) && gs.getTile(x + 1, y).type === tileType ? 1 : 0;
			count += gs.isInBounds(x - 1, y) && gs.getTile(x - 1, y).type === tileType ? 1 : 0;
			count += gs.isInBounds(x, y + 1) && gs.getTile(x, y + 1).type === tileType ? 1 : 0;
			count += gs.isInBounds(x, y - 1) && gs.getTile(x, y - 1).type === tileType ? 1 : 0;
			return count;
		};

		
        for (x = 0; x < gs.numTilesX; x += 1) {
            for (y = 0; y < gs.numTilesY; y += 1) {
                if (gs.isIndexOpen(x, y) && numWaterNeighbours(x, y) >= 1 && numWaterWallNeighbours(x, y) >= 3) {
                    gs.setTileType({x: x, y: y}, tileType);
                }
            }
        }
		
	};

	floodFunc(tileIndex.x, tileIndex.y);
	fillSpaces();
};