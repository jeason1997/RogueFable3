/*global Phaser, game, console, gs, util*/
/*global frameSelector*/
/*global NUM_TILES_X, NUM_TILES_Y, FACTION*/
/*jshint white: true, laxbreak: true, esversion: 6, loopfunc: true*/
'use strict';

// CREATE_TILE_TYPES:
// ************************************************************************************************
gs.createTileTypes = function () {
	// Tile Types:
    this.tileTypes = {
		Floor:		{frame: 0, 		passable: 1, transparent: 1, isPit: 0, frames: this.range(0, 255)},
		Bridge:		{frame: 384,	passable: 1, transparent: 1, isPit: 0, frames: [384, 385]},
		CaveFloor:	{frame: 256, 	passable: 1, transparent: 1, isPit: 0, frames: this.range(256, 511)},
		Wall:		{frame: 512, 	passable: 0, transparent: 0, isPit: 0, frames: this.range(512, 767)},
		CaveWall:	{frame: 768, 	passable: 0, transparent: 0, isPit: 0, frames: this.range(768, 1023)},
		Pit:		{frame: 1024, 	passable: 1, transparent: 1, isPit: 1, frames: this.range(1024, 1151)},
		CavePit:	{frame: 1152,	passable: 1, transparent: 1, isPit: 1, frames: this.range(1152, 1215)},
		HalfWall:	{frame: 1216,	passable: 0, transparent: 1, isPit: 0, frames: this.range(1216, 1279)},
		Water:		{frame: 1280, 	passable: 1, transparent: 1, isPit: 0, frames: this.range(1280, 1343)},
		Lava:		{frame: 1344, 	passable: 1, transparent: 1, isPit: 0, frames: this.range(1344, 1407)},
		ToxicWaste:	{frame: 1472,	passable: 1, transparent: 1, isPit: 0, frames: this.range(1472, 1486)},
	};
	
	// Tile Colors (minimap):
	this.tileTypes.Lava.color = 'rgb(200, 24, 24)';
	this.tileTypes.ToxicWaste.color = '#51af12';
	
	// Tile Desc:
this.tileTypes.Water.desc = '在水中你无法站稳脚因此容易被近战攻击到，\n同时由于身体湿透了，\n火焰属性伤害减半但电属性伤害增倍。';
	
	
	this.nameTypes(this.tileTypes);
};

// TILE_DESC:
// ************************************************************************************************
gs.tileDesc = function (tile) {
	var str = translator.getText(tile.type.niceName); 
	
	if (tile.type.desc) {
		str += '\n' + tile.type.desc;
	}
	
	return str;
};

// INITIATE_TILE_MAP:
// ************************************************************************************************
gs.initiateTileMap = function () {
	this.numTilesX = NUM_TILES_X;
	this.numTilesY = NUM_TILES_Y;
	
	// Create empty map:
    this.tileMap = [];
    for (let x = 0; x < this.numTilesX; x += 1) {
        this.tileMap[x] = [];
        for (let y = 0; y < this.numTilesY; y += 1) {
            this.tileMap[x][y] = {
				explored: false,   
				visible: false,  
				character: null,	  
				frame: null,       
				item: null,     
				effect: null,	  
				object: null,				  
				isClosed: false,
				cloud: null,
				tileIndex: {x: x, y: y},
				triggerGroup: 0, // Note that 0 implies no group
			};
		}
	}
	
	this.dropWallList = [];
};

// IS_RAY:
// ************************************************************************************************
gs.isRay = function (startTileIndex, endTileIndex, pred) {
	var startPosition = util.toPosition(startTileIndex),
        endPosition = util.toPosition(endTileIndex),
        length = util.distance(startPosition, endPosition),
        normal = util.normal(startPosition, endPosition),
        currentPosition = startPosition,
        currentTileIndex,
        step = 4,
        currentDistance = 0;
	
	for (currentDistance = 0; currentDistance < length; currentDistance += step) {
        currentPosition = {x: startPosition.x + normal.x * currentDistance,
                           y: startPosition.y + normal.y * currentDistance};
        currentTileIndex = this.toTileIndex(currentPosition);
		
		if (!this.vectorEqual(currentTileIndex, startTileIndex) && !this.vectorEqual(currentTileIndex, endTileIndex)) {
			if (!pred(currentTileIndex)) {
				return false;
			}
		}
	}
		
	return true;
};

// IS_RAY_CLEAR:
// ************************************************************************************************
gs.isRayClear = function (startTileIndex, endTileIndex) {
	return this.isRay(startTileIndex, endTileIndex, function (tileIndex) {
		return gs.isTileIndexTransparent(tileIndex);
	}, this);
};

// IS_RAY_SHOOTABLE:
// Used by NPCs so they shoot each other while still moving around terrain:
// ************************************************************************************************
gs.isRayShootable = function (startTileIndex, endTileIndex) {
    return this.isRay(startTileIndex, endTileIndex, function (tileIndex) {
		return gs.isTileIndexTransparent(tileIndex) && gs.isStaticPassable(tileIndex);
	}, this);
};

// IS_RAY_PASSABLE:
// ************************************************************************************************
gs.isRayPassable = function (startTileIndex, endTileIndex) {
	return this.isRay(startTileIndex, endTileIndex, function (tileIndex) {
		return gs.isPassable(tileIndex);
	}, this);
};

// IS_RAY_STATIC_PASSABLE:
// ************************************************************************************************
gs.isRayStaticPassable = function (startTileIndex, endTileIndex) {
	return this.isRay(startTileIndex, endTileIndex, function (tileIndex) {
		return gs.isStaticPassable(tileIndex);
	}, this);
};

// IS_B_RAY:
// Returns true if every tileIndex in the BRay satisfies the predicate
// ************************************************************************************************
gs.isBRay = function (startTileIndex, endTileIndex, pred) {
	var indexList = this.getIndexInBRay(startTileIndex, endTileIndex);
	
	for (let i = 0; i < indexList.length; i += 1) {
		if (!pred.call(this, indexList[i])) {
			return false;
		}
	}
	
	return true;
};

// GET_INDEX_IN_B_RAY:
// Returns a list of all tile indices in a line using Bresenhamâ€™s algorithm
// ************************************************************************************************
gs.getIndexInBRay = function (startTileIndex, endTileIndex) {
	var deltaX = endTileIndex.x - startTileIndex.x,
		deltaY = endTileIndex.y - startTileIndex.y,
		deltaErr,
		endPred,
		error = 0, // No error at start
		y,
		x,
		indexList = [],
		pushToList;
	
	pushToList = function (x, y) {
		if (!gs.vectorEqual({x: x, y: y}, startTileIndex)) {
			indexList.push({x: x, y: y});
		}
	};
	
	// Same start and end will simply return the startTileIndex:
	if (gs.vectorEqual(startTileIndex, endTileIndex)) {
		return [{x: startTileIndex.x, y: startTileIndex.y}];
	}
	

	// Vertical line is special case:
	if (startTileIndex.x === endTileIndex.x) {
		if (deltaY > 0) {
			for (y = startTileIndex.y; y <= endTileIndex.y; y += 1) {
				pushToList(startTileIndex.x, y);
			}
		}
		else {
			for (y = startTileIndex.y; y >= endTileIndex.y; y -= 1) {
				pushToList(startTileIndex.x, y);
			}
		}
	
		return indexList;
	}
	// Low (mostly horizontal):
	else if (Math.abs(deltaX) >= Math.abs(deltaY)) {
		deltaErr = Math.abs(deltaY / deltaX);
		y = startTileIndex.y;
	
		if (deltaX > 0) {
			endPred = function (x) {return x <= endTileIndex.x;};
		}
		else {
			endPred = function (x) {return x >= endTileIndex.x;};
		}

		for (x = startTileIndex.x; endPred(x); x += Math.sign(deltaX)) {
			pushToList(x, y);
			error += deltaErr;

			while (error > 0.5) {
				y += Math.sign(deltaY);
				error -= 1;
			}
		}

		return indexList;
	}
	// High (mostly vertical):
	else  {
		deltaErr = Math.abs(deltaX / deltaY);
		x = startTileIndex.x;
	
		if (deltaY > 0) {
			endPred = function (y) {return y <= endTileIndex.y;};
		}
		else {
			endPred = function (y) {return y >= endTileIndex.y;};
		}

		for (y = startTileIndex.y; endPred(y); y += Math.sign(deltaY)) {
			pushToList(x, y);
			error += deltaErr;

			while (error > 0.5) {
				x += Math.sign(deltaX);
				error -= 1;
			}
		}

		return indexList;
	}
};

// GET_STAIR_INDEX:
// Stairs can be spawned in any open tile index in the level as long as it is not a side room
// Returns null if no possible tile is found
// ************************************************************************************************
gs.getStairIndex = function () {
	var indexList = gs.getAllIndex();
	
	indexList = indexList.filter(index => this.isIndexOpen(index));
	indexList = indexList.filter(index => gs.getIndexListCardinalAdjacent(index).filter(idx => this.isIndexOpen(idx)).length >= 4);
	indexList = indexList.filter(index => !gs.getArea(index) || gs.getArea(index).type !== 'SideRoom');
	
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_OPEN_INDEX_IN_AREA:
// ************************************************************************************************
gs.getOpenIndexInArea = function (area) {
	var indexList = this.getAllIndex();
	
	indexList = indexList.filter(index => gs.isIndexOpen(index) && gs.getTile(index).area === area);
	
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_OPEN_BOX_IN_AREA:
// ************************************************************************************************
gs.getOpenBoxInArea = function (area, width, height) {
	var indexList = gs.getIndexInBox(area),
		list = [];
	
	indexList.forEach(function (tileIndex) {
		var boxList = gs.getIndexInBox(tileIndex.x, tileIndex.y, tileIndex.x + width, tileIndex.y + height);
		boxList = boxList.filter(index => gs.isIndexOpen(index));
		boxList = boxList.filter(index => gs.getTile(index).area = area);
		
		if (boxList.length === width * height) {
			list.push(gs.createBox(tileIndex.x, tileIndex.y, tileIndex.x + width, tileIndex.y + height));
		}
	}, this);
	
	return list.length > 0 ? util.randElem(list) : null;
};

// GET_WIDE_OPEN_INDEX_IN_AREA:
// ************************************************************************************************
gs.getWideOpenIndexInArea = function (area) {
	var indexList = this.getAllIndex();
	indexList = indexList.filter(index => gs.isWideOpen(index) && gs.getTile(index).area === area);
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_OPEN_INDEX_IN_BOX
// ************************************************************************************************
gs.getOpenIndexInBox = function (box, startY, endX, endY) {
	var indexList;

	// Handle argument conversion:
	if (typeof box === 'number') {
		box = {startX: box, startY: startY, endX: endX, endY: endY};
	}
	
	indexList = this.getIndexInBox(box);
	indexList = indexList.filter(index => gs.isIndexOpen(index));
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_WIDE_OPEN_INDEX_IN_BOX:
// ************************************************************************************************
gs.getWideOpenIndexInBox = function (box, startY, endX, endY) {
	var indexList;
	
	// Handle argument conversion:
	if (typeof box === 'number') {
		box = {startX: box, startY: startY, endX: endX, endY: endY};
	}
	
	indexList = this.getIndexInBox(box);
	indexList = indexList.filter(index => gs.isWideOpen(index));
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_HALL_INDEX:
// ************************************************************************************************
gs.getHallIndex = function (box, startY, endX, endY) {
	var indexList;
	
	// Handle argument conversion:
	if (typeof box === 'number') {
		box = {startX: box, startY: startY, endX: endX, endY: endY};
	}
	
	indexList = this.getIndexInBox(box);
	indexList = indexList.filter(index => gs.isHallIndex(index));
	
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_OPEN_INDEX_IN_LEVEL:
// ************************************************************************************************
gs.getOpenIndexInLevel = function () {
	return this.getOpenIndexInBox(0, 0, this.numTilesX, this.numTilesY);
};

// GET_WIDE_OPEN_INDEX_IN_LEVEL:
// ************************************************************************************************
gs.getWideOpenIndexInLevel = function () {
	return this.getWideOpenIndexInBox(0, 0, this.numTilesX, this.numTilesY);
};

// GET_PASSABLE_INDEX_IN_BOX:
// ************************************************************************************************
gs.getPassableIndexInBox = function (box, startY, endX, endY) {
	var indexList;
	
	// Handle argument conversion:
	if (typeof box === 'number') {
		box = {startX: box, startY: startY, endX: endX, endY: endY};
	}
	
	indexList = this.getIndexInBox(box);
	indexList = indexList.filter(index => gs.isPassable(index));
	return indexList.length > 0 ? util.randElem(indexList) : null;
};


// IS_VALID_SPAWN_INDEX:
// ************************************************************************************************
gs.isValidSpawnIndex = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return this.isPassable(tileIndex)
		&& !this.getTile(tileIndex).isClosed
		&& !this.isIndexUncoveredLiquid(tileIndex)
		&& !this.isPit(tileIndex)
		&& this.isIndexSafe(tileIndex)
		&& !this.getObj(tileIndex, obj => obj.isZoneLine())
		&& !this.getObj(tileIndex, obj => obj.type.activate);
};

// IS_VALID_WATER_SPAWN_INDEX:
// ************************************************************************************************
gs.isValidWaterSpawnIndex = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return gs.isPassable(tileIndex)
		&& !this.getTile(tileIndex).isClosed
		&& gs.getTile(tileIndex).type.name === 'Water'
		&& this.isIndexSafe(tileIndex)
		&& !this.getObj(tileIndex, obj => obj.isZoneLine())
		&& !this.getObj(tileIndex, obj => obj.type.activate);
};

// IS_VALID_LAVA_SPAWN_INDEX:
// ************************************************************************************************
gs.isValidLavaSpawnIndex = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return gs.isPassable(tileIndex)
		&& !this.getTile(tileIndex).isClosed
		&& gs.getTile(tileIndex).type.name === 'Lava'
		&& !this.getObj(tileIndex, obj => obj.isZoneLine())
		&& !this.getObj(tileIndex, obj => obj.type.activate);
};

// GET_WATER_SPAWN_INDEX:
// ************************************************************************************************
gs.getWaterSpawnIndex = function () {
    var indexList = this.getAllIndex();
	indexList = indexList.filter(index => this.isValidWaterSpawnIndex(index));
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_SPAWN_INDEX:
// ************************************************************************************************
gs.getSpawnIndex = function () {
	var indexList = this.getAllIndex();
	indexList = indexList.filter(index => this.isValidSpawnIndex(index));
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_LAVA_SPAWN_INDEX:
// ************************************************************************************************
gs.getLavaSpawnIndex = function () {
    var indexList = this.getAllIndex();
	indexList = indexList.filter(index => this.isValidLavaSpawnIndex(index));
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_MERCHANT_SPAWN_INDEX:
// ************************************************************************************************
gs.getMerchantSpawnIndex = function () {
	var indexList = gs.getAllIndex();
	
	indexList = indexList.filter(index => this.isValidSpawnIndex(index));
	indexList = indexList.filter(index => !this.getItem(index));
	indexList = indexList.filter(index => this.isWidePassable(index));
	
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_PASSABLE_ADJACENT_INDEX:
// ************************************************************************************************
gs.getPassableAdjacentIndex = function (tileIndex) {
	var indexList = this.getIndexListAdjacent(tileIndex);
	indexList = indexList.filter(index => gs.isPassable(index));
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// IS_ADJACENT_TO_TRANSPARENT:
// Returns a tileIndex that is adjacent that is also staticPassable
// ************************************************************************************************
gs.isAdjacentToTransparent = function (tileIndex) {
	var indexList = this.getIndexListAdjacent(tileIndex);
	indexList = indexList.filter(index => gs.isTileIndexTransparent(index));
	return indexList.length > 0 ? true : false;
};


// GET_INDEX_LIST_ADJACENT:
// ************************************************************************************************
gs.getIndexListAdjacent = function (tileIndex) {
	var indexList = this.getIndexInBox(tileIndex.x - 1, tileIndex.y - 1, tileIndex.x + 2, tileIndex.y + 2);
	indexList = indexList.filter(index => !gs.vectorEqual(tileIndex, index));
	return indexList;
};

// GET_INDEX_LIST_CARDINAL_ADJACENT:
// ************************************************************************************************
gs.getIndexListCardinalAdjacent = function (tileIndex) {
	var indexList = this.getIndexListAdjacent(tileIndex);
	indexList = indexList.filter(index => util.distance(index, tileIndex) === 1);
	return indexList;
};

// GET_INDEX_IN_RADIUS:
// Will return the centerTileIndex if tileRadius = 0
// ************************************************************************************************
gs.getIndexInRadius = function (centerTileIndex, tileRadius) {
	var x, y, indexList = [];
	
	if (tileRadius === 0) {
		return [{x: centerTileIndex.x, y: centerTileIndex.y}];
	}
	
	for (x = centerTileIndex.x - Math.ceil(tileRadius); x <= centerTileIndex.x + Math.ceil(tileRadius); x += 1) {
		for (y = centerTileIndex.y - Math.ceil(tileRadius); y <= centerTileIndex.y + Math.ceil(tileRadius); y += 1) {
			if (gs.isInBounds(x, y) && util.distance(centerTileIndex, {x: x, y: y}) <= tileRadius) {
				indexList.push({x: x, y: y});
			}
		}
	}
	return indexList;
};

// GET_INDEX_IN_RAY:
// Returns a list of all tile indices in a line
// If haltCondition is passed then the function will terminate when that condition evaluates to true
// ************************************************************************************************
gs.getIndexInRay = function (startTileIndex, endTileIndex, haltCondition) {
	var startPos = util.toPosition(startTileIndex),
		endPos = util.toPosition(endTileIndex),
		tiles = [],
		indexList = [],
		distance = 0,
		finalDistance = game.math.distance(startPos.x, startPos.y, endPos.x, endPos.y),
		normal = util.normal(startPos, endPos),
		stepSize = 4,
		tile,
		i,
		x = startPos.x,
		y = startPos.y;

	while (distance < finalDistance) {
        x += normal.x * stepSize;
        y += normal.y * stepSize;
        distance += stepSize;
		
		tile = this.getTile(this.toTileIndex({x: x, y: y}));
        
		if (haltCondition && haltCondition(this.toTileIndex({x: x, y: y}))) {
			break;
		}
		
		if (tile && !gs.inArray(tile, tiles)) {
            tiles.push(tile);
        }
    }
  
	for (i = 1; i < tiles.length; i += 1) {
		indexList.push(tiles[i].tileIndex);
	}
	return indexList;
};

// GET_ALL_INDEX:
// ************************************************************************************************
gs.getAllIndex = function () {
	return this.getIndexInBox(0, 0, this.numTilesX, this.numTilesY);
};

// GET_INDEX_IN_BOX:
// ************************************************************************************************
gs.getIndexInBox = function (box, startY, endX, endY) {
	var x, y, indexList = [];
	
	if (typeof box === 'number') {
		box = {startX: box, startY: startY, endX: endX, endY: endY};
	}
	
	for (x = box.startX; x < box.endX; x += 1) {
		for (y = box.startY; y < box.endY; y += 1) {
			if (gs.isInBounds(x, y)) {
				indexList.push({x: x, y: y});
			}
		}
	}
	
	return indexList;
};

// GET_INDEX_IN_FAN:
// Returns all tiles in a 90deg are originating at tileIndex and pointing in dirVector
// dirVector must be one of the major cardinal directions
// ************************************************************************************************
gs.getIndexInFan = function (tileIndex, range, dirVector) {
	var angle,
		indexList,
		arc = 30;
	
	angle = util.angleToFace({x: 0, y: 0}, dirVector);
	
	indexList = this.getIndexInRadius(tileIndex, range + 1);
	indexList = indexList.filter(index => !this.vectorEqual(index, tileIndex));
	indexList = indexList.filter(index => util.distance(tileIndex, index) < range + 1);
	
	if (angle >= 315 || angle <= 45) {
		indexList = indexList.filter(index => Math.abs(util.angleToFace(tileIndex, index) - angle) <= arc || Math.abs(util.angleToFace(tileIndex, index) - angle) >= 360 - arc);
	}
	else {
		indexList = indexList.filter(index => Math.abs(util.angleToFace(tileIndex, index) - angle) <= arc);
	}
	
	return indexList;
};

// GET_NEAREST_PASSABLE_INDEX:
// Used when dragging NPCs up stairs or when using a teleport pad
// Will conduct a large flood fill, sorted by depth and return the nearest passable tileIndex
// ************************************************************************************************
gs.getNearestPassableIndex = function (tileIndex) {
	var indexList;
	// Base Case:
	if (gs.isPassable(tileIndex)) {
		return tileIndex;
	}
	
	indexList = gs.getIndexInFlood(tileIndex, index => gs.getTile(index).type.passable, 5, true);
	indexList = indexList.filter(index => gs.isPassable(index));
	indexList.sort((a, b) => a.depth - b.depth);
	
	if (indexList.length === 0) {
		return null;
	}
	
	return indexList[0];
};

// GET_INDEX_IN_FLOOD:
// ************************************************************************************************
gs.getIndexInFlood = function (startTileIndex, func, maxDepth, allowDiagonal = false) {
	var openList = [],
		closedList = [],
		currentNode,
		tryToAddChild,
		isInOpenList,
		isInClosedList,
		loopCount = 0;
	
	maxDepth = maxDepth || 10000;

	// TRY_TO_ADD_CHILD:
	tryToAddChild = function (tileIndex, depth) {
		if (gs.isInBounds(tileIndex)
				&& depth <= maxDepth
				&& func(tileIndex)
				&& !isInOpenList(tileIndex)
				&& !isInClosedList(tileIndex)) {
			
			openList.push({x: tileIndex.x, y: tileIndex.y, depth: depth});
        }
	};
	
	// IS_IN_OPEN_LIST:
	isInOpenList = function (tileIndex) {
		return openList.find(node => gs.vectorEqual(node, tileIndex));
	};
	
	// IS_IN_CLOSED_LIST:
	isInClosedList = function (tileIndex) {
		return closedList.find(node => gs.vectorEqual(node, tileIndex));
	};
	
	openList.push({x: startTileIndex.x, y: startTileIndex.y, depth: 0});
	
	while (openList.length > 0) {
		currentNode = openList.shift();
		closedList.push(currentNode);
		
		// Add adjacent:
		tryToAddChild({x: currentNode.x + 1, y: currentNode.y}, currentNode.depth + 1);
		tryToAddChild({x: currentNode.x - 1, y: currentNode.y}, currentNode.depth + 1);
		tryToAddChild({x: currentNode.x, y: currentNode.y + 1}, currentNode.depth + 1);
		tryToAddChild({x: currentNode.x, y: currentNode.y - 1}, currentNode.depth + 1);
		
		if (allowDiagonal) {
			tryToAddChild({x: currentNode.x - 1, y: currentNode.y - 1}, currentNode.depth + 1);
			tryToAddChild({x: currentNode.x - 1, y: currentNode.y + 1}, currentNode.depth + 1);
			tryToAddChild({x: currentNode.x + 1, y: currentNode.y - 1}, currentNode.depth + 1);
			tryToAddChild({x: currentNode.x + 1, y: currentNode.y + 1}, currentNode.depth + 1);
		}
		
		loopCount += 1;
		if (loopCount > 10000) {
			throw 'getIndexInFlood: loopCount exceeded';
		}
	}
	
	return closedList;
};


// GET_TILE:
// ************************************************************************************************
gs.getTile = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    if (this.isInBounds(tileIndex)) {
        return this.tileMap[tileIndex.x][tileIndex.y];
    } 
	else {
        return null;
    }
};

// GET_ITEM:
// ************************************************************************************************
gs.getItem = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    if (this.isInBounds(tileIndex)) {
        return this.tileMap[tileIndex.x][tileIndex.y].item || null;
    } 
	else {
        return null;
    }
};

// GET_OBJ:
// ************************************************************************************************
gs.getObj = function (tileIndex, y, typeName) {
	var obj; 
	
	// x, y, typeName
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	// index, typeName
	else {
		typeName = y;
	}
	
	// Not in bounds:
	if (!this.isInBounds(tileIndex)) {
		return null;
	}
	
	obj = this.tileMap[tileIndex.x][tileIndex.y].object;
	
	// No Object:
	if (!obj) {
		return null;
	}
	
	// No Pred:
	if (!typeName) {
		return obj;
	}
    
	// With predicate:
	if (typeof typeName === 'function') {
		return typeName.call(this, obj) ? obj : null;
	}
	// With specified typeName list:
	else if (typeof typeName === 'object') {
		return this.inArray(obj.type.name, typeName) ? obj : null;
	}
	// With specified typeName:
	else if (typeName) {
		return obj.type.name === typeName ? obj : null;
	}
};

// GET_CHARACTER:
// ************************************************************************************************
gs.getChar = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    if (this.isInBounds(tileIndex)) {
        return this.tileMap[tileIndex.x][tileIndex.y].character || null;
    } 
	else {
        return null;
    }
};

// GET_EFFECT:
// ************************************************************************************************
gs.getEffect = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    if (this.isInBounds(tileIndex)) {
        return this.tileMap[tileIndex.x][tileIndex.y].effect || null;
    } 
	else {
        return null;
    }
};

// GET_CLOUD:
// ************************************************************************************************
gs.getCloud = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    if (this.isInBounds(tileIndex)) {
        return this.tileMap[tileIndex.x][tileIndex.y].cloud || null;
    } 
	else {
        return null;
    }
}; 

// GET_AREA:
// ************************************************************************************************
gs.getArea = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    if (this.isInBounds(tileIndex)) {
        return this.tileMap[tileIndex.x][tileIndex.y].area || null;
    } 
	else {
        return null;
    }
};

// SET_TILE_TYPE:
// ************************************************************************************************
gs.setTileType = function (tileIndex, tileType, frame) {	
    if (this.isInBounds(tileIndex)) {
        this.tileMap[tileIndex.x][tileIndex.y].type = tileType;
		this.tileMap[tileIndex.x][tileIndex.y].frame = frame || frameSelector.selectFrame(tileType);
		
		if (!tileType.passable) {
			this.getTile(tileIndex).area = null;
		}
    }
};

// IS_PIT:
// ************************************************************************************************
gs.isPit = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return this.isInBounds(tileIndex)
		&& this.getTile(tileIndex).type.isPit;
};
    
// IS_PASSABLE:
// ************************************************************************************************
gs.isPassable = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    return this.isInBounds(tileIndex)
            && this.getTile(tileIndex).type.passable
			&& !this.getObj(tileIndex, obj => !obj.isPassable())
            && this.getChar(tileIndex) === null
            && (!this.getCloud(tileIndex) || this.getCloud(tileIndex).isPassable);
};

// IS_DROP_WALL:
// ************************************************************************************************
gs.isDropWall = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return this.dropWallList.find(list => list.find(index => gs.vectorEqual(tileIndex, index)));
};

// IS_HALL_INDEX:
// ************************************************************************************************
gs.isHallIndex = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return this.isInBounds(tileIndex)
		&& this.isPassable(tileIndex)
		&& !this.isIndexUncoveredLiquid(tileIndex)
		&& !this.isPit(tileIndex)
		&& !this.getObj(tileIndex, obj => !obj.type.isPassable)
		&& !this.getChar(tileIndex)
		&& !this.getItem(tileIndex)
		&& !this.getTile(tileIndex).isSolidWall;
};

// IS_STATIC_PASSABLE:
// Returns true if the tileType and object are passable
// Ignores characters
// Useful for lots of ability targeting
// ************************************************************************************************
gs.isStaticPassable = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    return gs.isInBounds(tileIndex)
		&& gs.getTile(tileIndex).type.passable
		&& !gs.getObj(tileIndex, obj => !obj.isPassable());
};

// IS_INDEX_OPEN:
// ************************************************************************************************
gs.isIndexOpen = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return this.isInBounds(tileIndex)
		&& this.isPassable(tileIndex)
		&& !this.isIndexUncoveredLiquid(tileIndex)
		&& !this.isPit(tileIndex)
		&& !this.getObj(tileIndex)
		&& !this.getChar(tileIndex)
		&& !this.getItem(tileIndex)
		&& !this.getTile(tileIndex).isClosed;
};

// IS_INDEX_UNCOVERED_LIQUID:
// Determines if the tile is both a liquid and if it is uncovered
// Stuff like ice will stop a liquid from being uncovered
// Characters can use this to determine if they should show their submerged graphic.
// ************************************************************************************************
gs.isIndexUncoveredLiquid = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return gs.inArray(gs.getTile(tileIndex).type.name, ['Water', 'Lava', 'ToxicWaste'])
		&& !gs.getObj(tileIndex, 'Ice');
};

// IS_WIDE_OPEN:
// Returns true if the 3x3 box centered on tileIndex is all open
// ************************************************************************************************
gs.isWideOpen = function (tileIndex, y) {
	var indexList;
	
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	if (!gs.isIndexOpen(tileIndex)) {
		return false;
	}
	
	indexList = gs.getIndexListCardinalAdjacent(tileIndex);
	indexList = indexList.filter(index => this.isIndexOpen(index));
	return indexList.length === 4;
};
	
// IS_WIDE_PASSABLE:
// ************************************************************************************************
gs.isWidePassable = function (tileIndex, y) {
	var indexList;
	
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	if (!gs.isPassable(tileIndex)) {
		return false;
	}
	
	indexList = gs.getIndexListCardinalAdjacent(tileIndex);
	indexList = indexList.filter(index => this.isPassable(index));
	return indexList.length === 4;
};
	

// IS_INDEX_SAFE:
// ************************************************************************************************
gs.isIndexSafe = function (tileIndex, character) {
	character = character || {};
	
	return (this.getTile(tileIndex).type.name !== 'Lava' || character.isFlying)
		&& (this.getTile(tileIndex).type.name !== 'ToxicWaste' || character.isFlying)
		&& !this.getObj(tileIndex, obj => obj.type.isDangerous)
		&& (!this.getCloud(tileIndex) || this.getCloud(tileIndex).isSafe);
};

// IS_TILE_INDEX_TRANSPARENT:
// ************************************************************************************************
gs.isTileIndexTransparent = function (tileIndex) {
    return tileIndex.x >= 0 
		&& tileIndex.x < this.numTilesX 
		&& tileIndex.y >= 0 
		&& tileIndex.y < this.numTilesY
		&& this.tileMap[tileIndex.x][tileIndex.y].type.transparent
		&& (!this.tileMap[tileIndex.x][tileIndex.y].cloud || this.tileMap[tileIndex.x][tileIndex.y].cloud.isTransparent)
		&& (!this.tileMap[tileIndex.x][tileIndex.y].object || this.tileMap[tileIndex.x][tileIndex.y].object.isTransparent());
};

// IS_TILE_INDEX_IN_BOUNDS:
// ************************************************************************************************
gs.isInBounds = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    return tileIndex.x >= 0  && tileIndex.y >= 0 && tileIndex.x < this.numTilesX && tileIndex.y < this.numTilesY;
};

// IS_VISIBLE_WALL:
// Returns true if the tile at tileIndex is both a wall and has a frame in which the graphic shows the wall itself 
// ************************************************************************************************
gs.isVisibleWall = function (tileIndex) {
	var typeName = this.getTile(tileIndex).type.name;

	if (typeName !== 'Wall' && typeName !== 'CaveWall') {
		return false;
	}
	
	if (!gs.isPassable(tileIndex.x, tileIndex.y + 1)) {
		return false;
	}
	
	return true;
};

// EXPLORE_MAP:
// ************************************************************************************************
gs.exploreMap = function () {
    for (let x = 0; x < this.numTilesX; x += 1) {
        for (let y = 0; y < this.numTilesY; y += 1) {
            if (this.getChar(x, y) ||
				this.getObj(x, y) ||
				this.isPassable(x, y) ||
				this.isAdjacentToTransparent({x: x, y: y})) {
                this.getTile(x, y).explored = true;
            }
        }
    }
};

// REVEAL_DUNGEON_SENSE:
// Explore any tile with an item, chest, or down stair
// ************************************************************************************************
gs.revealDungeonSenese = function () {
	var x, y;
	
	for (x = 0; x < this.numTilesX; x += 1) {
        for (y = 0; y < this.numTilesY; y += 1) {
			if (gs.getItem(x, y) || gs.getObj(x, y, 'Chest') || gs.getObj(x, y, obj => obj.isZoneLine()))  {
				gs.getTile(x, y).explored = true;
			}
		}
	}
	this.HUD.miniMap.refresh(true);
};

// DISTANCE_TO_NEAREST_MONSTER:
// Return the tileIndex that is furthest away from any enemy
// ************************************************************************************************
gs.distanceToNearestMonster = function (tileIndex) {
	let npcList = gs.getAllNPCs();
	npcList = npcList.filter(npc => npc.faction === FACTION.HOSTILE);
	npcList.sort((a, b) => util.distance(a.tileIndex, tileIndex) - util.distance(b.tileIndex, tileIndex));
		
	return npcList.length > 0 ? util.distance(npcList[0].tileIndex, tileIndex) : 1000;
};

// GET_SAFEST_INDEX:
// Return the tileIndex that is furthest away from any enemy
// ************************************************************************************************
gs.getSafestIndex = function () {
	var list = [],
		indexList;
	

	
	indexList = this.getAllIndex();
	indexList = indexList.filter(index => gs.isIndexOpen(index) && !gs.isPit(index));
	
	
	indexList.forEach(function (tileIndex) {
		list.push({tileIndex: tileIndex, distance: this.distanceToNearestMonster(tileIndex)}); 
	}, this);
	
	list.sort((a, b) => b.distance - a.distance);
	
	return list.length > 0 ? list[0].tileIndex : null;
};

// GET_PIT_DROP_TO_INDEX:
// Finds a random tile that is approximately 10 tiles from the nearest enemy
// ************************************************************************************************
gs.getPitDropToIndex = function () {
	var indexList, list = [];
	
	indexList = this.getAllIndex();
	indexList = indexList.filter(index => gs.isIndexOpen(index) && !gs.isPit(index));
	
	indexList.forEach(function (tileIndex) {
		list.push({tileIndex: tileIndex, distance: this.distanceToNearestMonster(tileIndex)}); 
	}, this);
	
	for (let i = 10; i > 0; i -= 1) {
		if (list.filter(e => e.distance > i).length > 0) {
			return util.randElem(list.filter(e => e.distance > i)).tileIndex;
		}
	}
};