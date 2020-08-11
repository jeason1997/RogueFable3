/*global game, gs, console, util, Phaser*/
/*global TILE_SIZE, SCALE_FACTOR, NUM_TILES_X, NUM_TILES_Y*/
/*jshint white: true, laxbreak: true, esversion: 6, loopfunc: true*/
'use strict';

var baseGenerator = new BaseGenerator();

// CONSTRUCTOR:
// ************************************************************************************************
function BaseGenerator() {
	this.numTilesX = NUM_TILES_X;
	this.numTilesY = NUM_TILES_Y;
}

// CREATE_AREA:
// ************************************************************************************************
BaseGenerator.prototype.createArea = function (startX, startY, endX, endY) {
	var x, y, area = gs.createBox(startX, startY, endX, endY);
	
	// Flag tiles as belonging to area:
	for (x = area.startX; x < area.endX; x += 1) {
		for (y = area.startY; y < area.endY; y += 1) {
			if (gs.isPassable(x, y)) {
				gs.getTile(x, y).area = area;
			}
		}
	}
	
	return area;
};

// REMOVE_ALL_AREA_FLAGS:
// ************************************************************************************************
BaseGenerator.prototype.removeAllAreaFlags = function () {
	var x, y;
	for (x = 0; x < this.numTilesX; x += 1) {
		for (y = 0; y < this.numTilesY; y += 1) {
			gs.getTile(x, y).area = null;
		}
	}
};

// GET_OPEN_BOX:
// Return the top left tileIndex of a box of size width/height such that non of the tiles are isSolidWalls
// ************************************************************************************************
BaseGenerator.prototype.getOpenBox = function (width, height) {
	var x, y, list = [];
	
	gs.getAllIndex().forEach(function (tileIndex) {
		var indexList;
		
		indexList = gs.getIndexInBox(tileIndex.x - 1, tileIndex.y - 1, tileIndex.x + width + 1, tileIndex.y + height + 1);
		
		indexList = indexList.filter(index => !gs.getTile(index).isSolidWall && !gs.getTile(index).isClosed && !gs.getTile(index).area);
		indexList = indexList.filter(index => !gs.isPassable(index));
	
		if (indexList.length === (width + 2) * (height + 2)) {
			list.push(tileIndex);
		}
	}, this);
	
	return list.length > 0 ? util.randElem(list) : null;
};

// PLACE_DOOR:
// ************************************************************************************************
BaseGenerator.prototype.placeDoor = function (tileIndex) {
	if ((gs.isPassable(tileIndex.x + 1, tileIndex.y) && gs.isPassable(tileIndex.x - 1, tileIndex.y))
	 || (gs.isPassable(tileIndex.x, tileIndex.y + 1) && gs.isPassable(tileIndex.x, tileIndex.y - 1))) {
		gs.setTileType(tileIndex, gs.tileTypes.Floor);
		gs.createDoor(tileIndex, 'Door');
	}
};

// PLACE_DOOR_ON_BOX:
// Given a box representing a wall square
// Place a door on one of its edges such that the interior of the box and the exterior are connected
// ************************************************************************************************
BaseGenerator.prototype.placeDoorOnBox = function (box) {
	var x, y, canPlaceDoor;
	
	canPlaceDoor = function (x, y) {
		return (gs.isPassable(x, y - 1) && gs.isPassable(x, y + 1))
			|| (gs.isPassable(x - 1, y) && gs.isPassable(x + 1, y));
	};
	
	for (x = box.startX; x < box.endX; x += 1) {
		for (y = box.startY; y < box.endY; y += 1) {
			if (x === box.startX || y === box.startY || x === box.endX - 1 || y === box.endY - 1) {
				if (canPlaceDoor(x, y)) {
					this.placeDoor({x: x, y: y});
					return;
				}
			}
		}
	}
};


// PLACE_TILE_LINE:
// Place a straight line of tiles
// ************************************************************************************************
BaseGenerator.prototype.placeTileLine = function (fromTileIndex, toTileIndex, width, tileType, func) {
	var deltaVec = util.normal(fromTileIndex, toTileIndex),
		perpVec = {x: -deltaVec.y, y: deltaVec.x},
		currentTileIndex = {x: fromTileIndex.x, y: fromTileIndex.y},
		count = 0,
		i;

	
	func = func || function (tileIndex) {return true; };
	
	while (!gs.vectorEqual(currentTileIndex, toTileIndex)) {
		for (i = -Math.floor(width / 2); i < Math.ceil(width / 2); i += 1) {
			if (func({x: currentTileIndex.x + perpVec.x * i, y: currentTileIndex.y + perpVec.y * i})) {
				if (currentTileIndex.x + perpVec.x * i > 0
				   && currentTileIndex.x + perpVec.x * i < NUM_TILES_X - 1
				   && currentTileIndex.y + perpVec.y * i > 0
				   && currentTileIndex.y + perpVec.y * i < NUM_TILES_Y - 1) {
					gs.setTileType({x: currentTileIndex.x + perpVec.x * i,
									y: currentTileIndex.y + perpVec.y * i},
								   tileType);
				}
				
			}
		}
		
		currentTileIndex.x += deltaVec.x;
		currentTileIndex.y += deltaVec.y;
		
		count += 1;
		if (count > 1000) {
			throw 'break';
		}
	}
	
	// Make sure we catch the last one:
	for (i = -Math.floor(width / 2); i < Math.ceil(width / 2); i += 1) {
		if (func({x: currentTileIndex.x + perpVec.x * i, y: currentTileIndex.y + perpVec.y * i})) {
			gs.setTileType({x: currentTileIndex.x + perpVec.x * i, y: currentTileIndex.y + perpVec.y * i}, tileType);
		}
	}
};


// PLACE_TILE_SQUARE:
// ************************************************************************************************
// Place a square of tiles fromTileIndex (inclusive) to toTileIndex (exclusive):
BaseGenerator.prototype.placeTileSquare = function (fromTileIndex, toTileIndex, tileType, onlyEdge) {
	var x, y;
	for (x = fromTileIndex.x;  x < toTileIndex.x; x += 1) {
        for (y = fromTileIndex.y; y < toTileIndex.y; y += 1) {
			if (!onlyEdge || x === fromTileIndex.x || x === toTileIndex.x - 1 || y === fromTileIndex.y || y === toTileIndex.y -1) {
				gs.setTileType({x: x, y: y}, tileType);
			}
		}
	}
};

// PLACE_TILE_CIRCLE:
// // ************************************************************************************************
BaseGenerator.prototype.placeTileCircle = function (centerTileIndex, radius, tileType) {
    gs.getIndexInRadius(centerTileIndex, radius + 1).forEach(function (index) {
		
		if (util.distance(centerTileIndex, index) < radius + 1) {
			gs.setTileType(index, tileType);
		}
    }, this);
};

// PLACE_TILE_CAVE:
// *****************************************************************************
BaseGenerator.prototype.placeTileCave = function (fromTileIndex, toTileIndex, wallTileType, mask, tileMask = null) {
	var count = 0;
	
	mask = mask || [[0, 0, 0, 0],
					[0, 0, 0, 0],
					[0, 0, 0, 0],
					[0, 0, 0, 0]];
	
	// Make the caller responsible for prefilling if needed
	// We're going to set every tile anyway (except superFloors)
	/*
	// Fill with cave wall:
	gs.getIndexInBox(fromTileIndex.x - 1, fromTileIndex.y - 1, toTileIndex.x + 1, toTileIndex.y + 1).forEach(function (index) {
		gs.setTileType(index, gs.tileTypes.CaveWall);
	}, this);
	*/
	
    while (true) {
        if (this.placeTileCaveFunc(fromTileIndex, toTileIndex, wallTileType, mask, tileMask)) {
			break;
		}
		
		count += 1;
		if (count > 100) {
			throw 'unable to fill cave';
		}
    }
};


// PLACE_TILE_CAVE_FUNC:
// For tileMask let 0=null, 1=superFloor, 2=superWall
// Never change a tile in superFloor or superWall passed in tileMask
// *****************************************************************************
BaseGenerator.prototype.placeTileCaveFunc = function (fromTileIndex, toTileIndex, wallTileType, mask, tileMask = null) {
    var areaMap,
        areaWidth = toTileIndex.x - fromTileIndex.x,
        areaHeight = toTileIndex.y - fromTileIndex.y,
        i,
        x,
        y,
		minOpenPercent = 0.40, // 0.10
		initialWeight = 0.40,
        inBounds,
        countWalls,
        iterateFunc1,
        iterateFunc2,
        floodFunc,
        floodResult,
        success = false;
    
    // IN BOUNDS:
    // *************************************************************************
    inBounds = function (x, y) {
        return x >= 1 &&  y >= 1 && x < areaWidth - 1 && y < areaHeight - 1;
    };
    
    // COUNT WALLS:
    // *************************************************************************
    countWalls = function (mapIn, xIn, yIn, dist) {
        var x, y, count = 0;
        for (x = xIn - dist; x <= xIn + dist; x += 1) {
            for (y = yIn - dist; y <= yIn + dist; y += 1) {
				
                if (inBounds(x, y)) {
					count += mapIn[x][y] === 'Wall' || mapIn[x][y] === 'SuperWall' ? 1 : 0;
				} 
				else {
					count += 1;
				}
            }
        }
        return count;
    };
    
    // ITERATE FUNC 1:
    // *************************************************************************
    iterateFunc1 = function (oldMap) {
        var newMap = [];
        for (x = 0;  x < areaWidth; x += 1) {
            newMap[x] = [];
            for (y = 0; y < areaHeight; y += 1) {
				if (oldMap[x][y] === 'SuperFloor') {
					newMap[x][y] = 'SuperFloor';
				}
				else if (countWalls(oldMap, x, y, 1) < 5 && countWalls(oldMap, x, y, 2) > 2 && oldMap[x][y] !== 'SuperWall') {
					newMap[x][y] = 'Floor';
				} 
				else {
					newMap[x][y] = 'Wall';
				}
            }
        }
        return newMap;
    };
    
    // ITERATE FUNC 2:
    // *************************************************************************
    iterateFunc2 = function (oldMap) {
        var newMap = [];
        for (x = 0;  x < areaWidth; x += 1) {
            newMap[x] = [];
            for (y = 0; y < areaHeight; y += 1) {
				if (oldMap[x][y] === 'SuperFloor') {
					newMap[x][y] = 'SuperFloor';
				}
				else if (countWalls(oldMap, x, y, 1) < 5 && oldMap[x][y] !== 'SuperWall') {
					newMap[x][y] = 'Floor';
				} 
				else {
					newMap[x][y] = 'Wall';
				}
            }
        }
        return newMap;
    };
    
    // FLOOD FUNC:
	// Returns a count of all floor tiles
	// Returns a floodMap in which 2 indicates a floor tile
    // *************************************************************************
    floodFunc = function (map, startX, startY) {
        var x, y, floodMap, count = 0, iterFunc;
        
        // Trivial case:
        if (map[startX][startY] === 'Wall') {
            return 0;
        }
        
        floodMap = [];
        for (x = 0; x < areaWidth; x += 1) {
            floodMap[x] = [];
            for (y = 0; y < areaHeight; y += 1) {
                floodMap[x][y] = map[x][y] === 'Wall' ? 1 : 0;
            }
        }
        
        iterFunc = function (x, y) {
            count += 1;
            floodMap[x][y] = 2;
            if (inBounds(x + 1, y) && floodMap[x + 1][y] === 0) {
                iterFunc(x + 1, y);
            }
            if (inBounds(x - 1, y) && floodMap[x - 1][y] === 0) {
                iterFunc(x - 1, y);
            }
            if (inBounds(x, y + 1) && floodMap[x][y + 1] === 0) {
                iterFunc(x, y + 1);
            }
            if (inBounds(x, y - 1) && floodMap[x][y - 1] === 0) {
                iterFunc(x, y - 1);
            }
        };
        
        iterFunc(startX, startY);
        return {count: count, map: floodMap};
    };
    
    // FILL CAVE:
    // *************************************************************************
    // Initial Noise:
    areaMap = [];
    for (x = 0; x < areaWidth; x += 1) {
        areaMap[x] = [];
        for (y = 0; y < areaHeight; y += 1) {
            if (game.rnd.frac() <= initialWeight) {
                areaMap[x][y] = 'Wall';
            } else {
                areaMap[x][y] = 'Floor';
            }
        }
    }
	
	
	// Handle mask:
	for (x = 0; x < areaWidth; x += 1) {
        for (y = 0; y < areaHeight; y += 1) {
			// Note: flipping mask here as its easier to input the masks in reverse order:
			if (mask[Math.floor(y / (areaHeight / 4))][Math.floor(x / (areaWidth / 4))]) {
				areaMap[x][y] = 'SuperWall';
			}
		}
	}
	
	// Handle tileMask:
	// Note that since tileMasks are proc genned, we don't need to flip here:
	if (tileMask) {
		for (x = 0; x < areaWidth; x += 1) {
			for (y = 0; y < areaHeight; y += 1) {
				if (tileMask[x][y] === 1) {
					areaMap[x][y] = 'SuperFloor';
				}
			}
		}
	}
	
    
    // First Iteration:
    for (i = 0; i < 4; i += 1) {
        areaMap = iterateFunc1(areaMap);
    }
    
    // Second Iteration:
    for (i = 0; i < 3; i += 1) {
        areaMap = iterateFunc2(areaMap);
    }
    
	// Find an area which has a high enough number of floor tiles:
	// We try 50 times to find such an area before giving up.
	for (i = 0; i < 50; i += 1) {
		// Select a random position:
		x = util.randInt(0, areaWidth - 1);
		y = util.randInt(0, areaHeight - 1);

		// Flood from that position (gives us a count of floors, and a map in which 2 indicates a floor):
		floodResult = floodFunc(areaMap, x, y);

		// If we have found a large enough area then copy it into the area map (all other areas become solid):
		if (floodResult.count > areaWidth * areaHeight * minOpenPercent) {
			for (x = 0; x < areaWidth; x += 1) {
				for (y = 0; y < areaHeight; y += 1) {
					// 2 Indicates a floor in the largest open area:
					if (floodResult.map[x][y] === 2) {
						areaMap[x][y] = 'Floor';
					} 
					else {
						areaMap[x][y] = 'Wall';
					}
				}
			}
			success = true;
			break;
		}
	}
	
	if (!success) {
		return false;
	}
	

    // Copy area map back to map:
    for (x = 0; x < areaWidth; x += 1) {
        for (y = 0; y < areaHeight; y += 1) {
			// Handle tileMask superFloor by not doing anything (don't want to mess up a vault):
			if (tileMask && tileMask[x][y] === 1) {
				// Pass for SuperFloor
			}
			else if (areaMap[x][y] === 'Wall') {
				gs.setTileType({x: fromTileIndex.x + x, y: fromTileIndex.y + y}, wallTileType);
			} 
			else {
				gs.setTileType({x: fromTileIndex.x + x, y: fromTileIndex.y + y}, gs.tileTypes.CaveFloor);
			}
        }
    }
    
    return success;
};

// PLACE_VAULT:
// Places a vault at the tileIndex by destroying all existing objects and replacing all existing tiles.
// Will create and return a new area.
// Will flag all tiles as belonging to that area.
// vaultDesc: {vaultTypeName, [rotate], [reflect]}
// ************************************************************************************************
BaseGenerator.prototype.placeVault = function (tileIndex, vaultDesc) {
	var vaultType, area, tileTypeMap;
	
	
	vaultType = gs.vaultTypes[vaultDesc.vaultTypeName];
	
	// Placing vault:
	tileTypeMap = gs.parseJSONMap(vaultDesc.vaultTypeName, vaultDesc.rotate, vaultDesc.reflect);
	gs.createTileMap(tileIndex, tileTypeMap);
	
	// Flagging area:
	area = this.createArea(tileIndex.x, tileIndex.y, tileIndex.x + tileTypeMap.width, tileIndex.y + tileTypeMap.height);	
	area.type = vaultDesc.vaultTypeName;
	area.isVault = true;
	
	// Init:
	if (vaultType.initFunc) {
		vaultType.initFunc(area);
	}
	
	// Mark as used:
	if (vaultType.isUnique) {
		gs.previouslySpawnedVaults.push(vaultType.name);
	}

	return area;
};

// FILL_BORDER_WALL:
// ************************************************************************************************
BaseGenerator.prototype.fillBorderWall = function () {
	var x, y;
	for (x = 0; x < this.numTilesX; x += 1) {
		for (y = 0; y < this.numTilesY; y += 1) {
			if (x === 0 || y === 0 || x === this.numTilesX - 1 || y === this.numTilesY - 1) {
				gs.setTileType({x: x, y: y}, gs.tileTypes.Wall);
			}
		}
	}
};

// PLACE_SIDE_ROOM_DOOR:
// Given a box representing a wall square
// Place a door on one of its edges such that the interior of the box and the exterior are connected
// ************************************************************************************************
BaseGenerator.prototype.placeSideRoomDoor = function (area) {
	var x, y, canPlaceDoor, isSideRoom, box, indexList = [], tileIndex;
	
	box = {startX: area.startX - 1, startY: area.startY - 1, endX: area.endX + 1, endY: area.endY + 1};
	
	isSideRoom = function (x, y) {
		return gs.getTile(x, y).area && gs.getTile(x, y).area.type === 'SideRoom';
	};
	
	canPlaceDoor = function (x, y) {
		if (gs.isPassable(x, y - 1) && gs.isPassable(x, y + 1)) {
			if (!isSideRoom(x, y - 1) && isSideRoom(x, y + 1)) {
				return true;
			}
			
			if (!isSideRoom(x, y + 1) && isSideRoom(x, y - 1)) {
				return true;
			}
		}
		
		if (gs.isPassable(x - 1, y) && gs.isPassable(x + 1, y)) {
			if (!isSideRoom(x - 1, y) && isSideRoom(x + 1, y)) {
				return true;
			}
			
			if (!isSideRoom(x + 1, y) && isSideRoom(x - 1, y)) {
				return true;
			}
		}
		return false;
	};
	
	for (x = box.startX; x < box.endX; x += 1) {
		for (y = box.startY; y < box.endY; y += 1) {
			if (x === box.startX || y === box.startY || x === box.endX - 1 || y === box.endY - 1) {
				if (canPlaceDoor(x, y)) {
					indexList.push({x: x, y: y});
				}
			}
		}
	}
	
	// Choose a random door:
	if (indexList.length > 0) {
		tileIndex = util.randElem(indexList);
		area.doorTileIndex = tileIndex;
		this.placeDoor(tileIndex);
		return true;
	}
	// No possible door:
	else {
		return false;
	}
};

// CREATE_HALL:
// *************************************************************************
BaseGenerator.prototype.createHall = function (startTileIndex, endTileIndex, width, tileType) {
    var rand, func;
	
	width = width || util.randElem(gs.range(1, this.MAX_HALL_WIDTH));
	tileType = tileType || gs.tileTypes.Floor;
	
	if (!startTileIndex || !endTileIndex) {
		console.log('Failed to create hall');
		return;
	}
	
	func = function (tileIndex) {
		return gs.isInBounds(tileIndex) && !gs.isPit(tileIndex);
	};
	
	this.placeTileLine(startTileIndex, {x: endTileIndex.x, y: startTileIndex.y}, width, tileType, func);
	this.placeTileLine({x: endTileIndex.x, y: startTileIndex.y}, endTileIndex, width, tileType, func);
};

// CLEAR_TO_WALL:
// Return true if there is at least 'distance' tiles of open space between center and the nearest solid
// ************************************************************************************************
BaseGenerator.prototype.clearToWall = function (centerX, centerY, distance) {
	var x, y;
	for (x = centerX - distance; x < centerX + distance; x += 1) {
		for (y = centerY - distance; y < centerY + distance; y += 1) {
			if (game.math.distance(x, y, centerX, centerY) <= distance && gs.isInBounds(x, y) && !gs.isPassable(x, y)) {
				return false;
			}
		}
	}
	
	return true;
};

// CREATE_MASKS
// Call in order to create a huge list of masks for FA to use when generating caves and jungle
// ************************************************************************************************
BaseGenerator.prototype.createMasks = function () {
    this.masks = [];
    
    this.masks = this.masks.concat(this.getMaskRotations([[1, 1, 0, 1],
                                                          [1, 1, 0, 0],
                                                          [0, 0, 0, 0],
                                                          [1, 0, 0, 1]]));
    
    this.masks = this.masks.concat(this.getMaskRotations([[1, 0, 0, 1],
                                                          [0, 1, 0, 0],
                                                          [0, 0, 0, 1],
                                                          [1, 0, 1, 1]]));
    
    this.masks = this.masks.concat(this.getMaskRotations([[1, 0, 0, 1],
                                                          [0, 0, 0, 0],
                                                          [0, 0, 0, 0],
                                                          [1, 0, 0, 1]]));
    
    this.masks = this.masks.concat(this.getMaskRotations([[1, 1, 0, 1],
                                                          [0, 0, 0, 1],
                                                          [1, 0, 0, 0],
                                                          [1, 0, 1, 1]]));
    
    this.masks = this.masks.concat(this.getMaskRotations([[1, 0, 0, 1],
                                                          [0, 1, 0, 0],
                                                          [0, 0, 0, 0],
                                                          [1, 0, 0, 1]]));
    
    this.masks = this.masks.concat(this.getMaskRotations([[0, 0, 0, 1],
                                                          [0, 1, 0, 0],
                                                          [0, 0, 1, 0],
                                                          [1, 0, 0, 0]]));
    
    this.masks = this.masks.concat(this.getMaskRotations([[0, 0, 0, 0],
                                                          [0, 1, 0, 0],
                                                          [0, 1, 1, 0],
                                                          [0, 0, 0, 0]]));
};

// GET_MASK_ROTATIONS:
// ************************************************************************************************
BaseGenerator.prototype.getMaskRotations = function (mask) {
    var rotations = [mask], x, y, newMask;
    
    // Y-Axis Flip:
    newMask = gs.create2DArray(4, 4, (x,y) => 0);
    for (x = 0; x < 4; x += 1) {
        for (y = 0; y < 4; y += 1) {
            newMask[x][y] = mask[3-x][y];
        }
    }
    rotations.push(newMask);
    
    // X-Axis Flip:
    newMask = gs.create2DArray(4, 4, (x,y) => 0);
    for (x = 0; x < 4; x += 1) {
        for (y = 0; y < 4; y += 1) {
            newMask[x][y] = mask[x][3-y];
        }
    }
    rotations.push(newMask);
    
    // XY-Axis Flip:
    newMask = gs.create2DArray(4, 4, (x,y) => 0);
    for (x = 0; x < 4; x += 1) {
        for (y = 0; y < 4; y += 1) {
            newMask[x][y] = mask[3-x][3-y];
        }
    }
    rotations.push(newMask);
    
    return rotations;
};

// TRIM_WALLS:
// ************************************************************************************************
BaseGenerator.prototype.trimWalls = function () {
	for (let i = 0; i < 10; i += 1) {
		let indexList = gs.getAllIndex();
		
		indexList = indexList.filter(function (index) {
			return gs.getTile(index).type.name === 'Wall'
				&& !gs.getTile(index).isClosed
				&& !gs.getTile(index).isSolidWall
				&& gs.getIndexListCardinalAdjacent(index).filter(idx => gs.isPassable(idx)).length >= 3;
		});
		
		indexList.forEach(function (index) {
			gs.setTileType(index, gs.tileTypes.Floor);
		}, this);
	}
	
};

// PLACE_A_STAR_HALL:
// *************************************************************************
BaseGenerator.prototype.placeAStarHall = function (startTileIndex, endTileIndex, width) {
	var isValidTileIndex, calculateH, path, i, tileIndex, color = gs.randomColor(), inArea;
	
	width = width || util.randElem([1, 1, 1, 1, 2, 2, 3]);
	
	
	
	/*
	gs.getTile(startTileIndex).color = color;
	gs.getTile(endTileIndex).color = color;
	*/
	
	if (!startTileIndex) {
		console.log('createAStarHall: invalid startTileIndex');
		gs.haltGen = true;
		return;
		//throw 'createAStarHall: invalid startTileIndex';
	}
	
	if (!endTileIndex) {
		console.log('createAStarHall: invalid endTileIndex');
		gs.haltGen = true;
		return;
		//throw 'createAStarHall: invalid endTileIndex';
	}
	
	
	if (gs.debugProperties.logAStarTunnels) {
		gs.getTile(startTileIndex).color = color;
		gs.getTile(endTileIndex).color = color;
	}
	
	
	if (util.distance(startTileIndex, endTileIndex) > 20 ) {
		width = 1;
	}
	
	isValidTileIndex = function (tileIndex) {
		return !gs.getTile(tileIndex).isSolidWall 
			&& tileIndex.x >= 1
			&& tileIndex.y >= 1
			&& tileIndex.x < NUM_TILES_X - 1
			&& tileIndex.y < NUM_TILES_Y - 1;
	};
	
	calculateH = function (tileIndex) {
		return Math.abs(tileIndex.x - endTileIndex.x) + Math.abs(tileIndex.y - endTileIndex.y);
	};

	path = gs.findPath(startTileIndex, endTileIndex, {isValidTileIndex: isValidTileIndex, calculateH: calculateH});
		
	if (path) {
		for (i = 0; i < path.length; i += 1) {
			tileIndex = path[i];
			
			// Setting floor:
			if (!gs.getArea(tileIndex) && !gs.getTile(tileIndex).type.passable) {

				if (gs.getTile(tileIndex).type.name === 'Wall') {
					gs.setTileType(tileIndex, gs.tileTypes.Floor);
				}
				else if (gs.getTile(tileIndex).type.name === 'CaveWall') {
					gs.setTileType(tileIndex, gs.tileTypes.CaveFloor);
				}

			}

			if (width > 1) {
				gs.getIndexInBox(Math.floor(tileIndex.x - width / 2),
								 Math.floor(tileIndex.y - width / 2),
								 Math.ceil(tileIndex.x + width / 2), 
								 Math.ceil(tileIndex.y + width / 2)).forEach(function (index) {
					if (index.x > 1 &&
						index.y > 1 &&
						index.x < NUM_TILES_X - 1 &&
						index.y < NUM_TILES_Y - 1 &&
						!gs.getArea(index) && !gs.getArea(tileIndex) && !gs.getTile(index).type.passable && !gs.getTile(index).isSolidWall) {

						if (gs.getTile(index).type.name === 'Wall') {
							gs.setTileType(index, gs.tileTypes.Floor);
						}
						else if (gs.getTile(index).type.name === 'CaveWall') {
							gs.setTileType(index, gs.tileTypes.CaveFloor);
						}
					}
				}, this);
			}

		}
	}
	else {
		console.log('AStarPath failed');
		if (gs.debugProperties.logAStarTunnels) {
			gs.getTile(startTileIndex).color = color;
			gs.getTile(endTileIndex).color = color;
		}
		
		
	}
};

// CLEAN_TILE_AREAS:
// *****************************************************************************
BaseGenerator.prototype.cleanAreaTiles = function () {
	// Clean Area Tiles:
	gs.getAllIndex().forEach(function (tileIndex) {
		if (gs.getTile(tileIndex).type.name === 'Floor' && gs.getTile(tileIndex).area && gs.getTile(tileIndex).area.type === 'Cave') {
			gs.setTileType(tileIndex, gs.tileTypes.CaveFloor);
		}
		
		if (gs.getTile(tileIndex).type.name === 'Wall' && gs.getTile(tileIndex).area && gs.getTile(tileIndex).area.type === 'Cave') {
			gs.setTileType(tileIndex, gs.tileTypes.CaveWall);
		}
	});
};

// PLACE_DOORS:
// *****************************************************************************
BaseGenerator.prototype.placeDoors = function () {
	var x, y, isRoom;
	
	for (x = 0; x < this.numTilesX; x += 1) {
		for (y = 0; y < this.numTilesY; y += 1) {
			if (this.canPlaceDoor(x, y)) {
				this.placeDoor({x: x, y: y});
			}
		}
	}
};

// CAN_PLACE_DOOR:
// *****************************************************************************
BaseGenerator.prototype.canPlaceDoor = function (x, y) {
	var isRoom, isWall;
	
	isWall = function (x, y) {
		return !gs.isInBounds(x, y) || gs.getTile(x, y).type.name === 'Wall';
	};
	
	isRoom = function (x, y) {
		return gs.isInBounds(x, y) && gs.getTile(x, y).area && gs.getTile(x, y).area.type !== 'HallPoint';
	};
	
	return gs.getTile(x, y).type.name === 'Floor'
		&& !gs.getObj(x, y)
		&& !isRoom(x, y)
		&& ((isWall(x + 1, y) && isWall(x - 1, y) && (isRoom(x, y - 1) || isRoom(x, y + 1)))
		   || ((isWall(x, y + 1) && isWall(x, y - 1) && (isRoom(x + 1, y) || isRoom(x - 1, y)))));
};

// DISTANCE_TO_TILE:
// Return the distance (in tiles) to the nearest tile that satisfies the predicate function.
// If no such tile exists then return null;
// ************************************************************************************************
BaseGenerator.prototype.distanceToTile = function (tileIndex, func) {
    var list;
    list = gs.getAllIndex();
    list = list.filter(func);
    list = list.sort((a, b) => util.distance(a, tileIndex) - util.distance(b, tileIndex));
    
    return list.length > 0 ? util.distance(tileIndex, list[0]) : null;
};


// FIND_ISLANDS:
// ************************************************************************************************
BaseGenerator.prototype.findIslands = function (area) {
	var mask, x, y, i = 0, islandList = [], func;
	
	mask = [];
	for (x = 0; x < area.width; x += 1) {
		mask[x] = [];
		for (y = 0; y < area.height; y += 1) {
			mask[x][y] = 0;
		}
	}
	
	func = function (idx) {
		return (gs.getTile(idx).type.name === 'Wall' || gs.getTile(idx).type.name === 'CaveWall')
			&& util.isInBox(idx, area);
	};
	
	
	gs.getIndexInBox(area).forEach(function (tileIndex) {
		var indexList;
		
		if (func(tileIndex) && !mask[tileIndex.x - area.startX][tileIndex.y - area.startY]) {
			islandList[i] = [];
			
			indexList = gs.getIndexInFlood(tileIndex, func);
			indexList.forEach(function (index) {
				mask[index.x - area.startX][index.y - area.startY] = 1;
				islandList[i].push(index);
			}, this);
			
			i += 1;
		}
	}, this);
	
	return islandList;
};

// REPLACE_ISLANDS:
// *****************************************************************************
BaseGenerator.prototype.replaceIslands = function (area) {
	var islandList, getType;
	
	getType = function (indexList) {
		if (indexList.reduce((pv, nv) => pv + (gs.getTile(nv).type.name === 'Wall' ? 1 : 0), 0) > indexList.length / 2) {
			return 'Wall';
		}
		else {
			return 'CaveWall';
		}
	};
	
	islandList = this.findIslands(area);
	
	// Remove any islands touching the map boarders:
	islandList = islandList.filter(function (list) {
		return !list.find(index => index.x === 0 || index.y === 0 || index.x === NUM_TILES_X - 1 || index.y === NUM_TILES_Y - 1)
			&& !list.find(index => gs.getTile(index).isClosed);
	});
	
	islandList.forEach(function (indexList) {
		var box, type;
		
		box = util.getBoundingBox(indexList);
		type = getType(indexList);
		
		if (indexList.length > 16 
			&& indexList.length < 100
			&& box.width > 3 && box.height > 3 // Min bounds
			&& (Math.min(box.width, box.height) / Math.max(box.width, box.height)) > 0.5 // Must be mostly square
			&& indexList.length > box.width * box.height * 0.5 // Must be mostly full
		   	&& util.frac() < 0.25) {
			
			indexList.forEach(function (index) {
				if (type === 'CaveWall') {
					gs.setTileType(index, gs.tileTypes.CavePit);
				}
				else {
					gs.setTileType(index, gs.tileTypes.Pit);
				}
			}, this);
		}
	}, this);
	
	
};