/*global game, gs, console, Phaser, util*/
/*global CaveGenerator*/
/*jshint esversion: 6, loopfunc: true*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function Cave2Generator() {
	this.name = 'Cave2Generator';
}
Cave2Generator.prototype = new CaveGenerator();
var cave2Generator = new Cave2Generator();

// CHOOSE_MASK:
// *****************************************************************************
Cave2Generator.prototype.chooseMask = function () {
	
	return [[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0]];
};



// PLACE_TILE_CAVE_FUNC:
// *****************************************************************************
Cave2Generator.prototype.placeTileCaveFunc = function (fromTileIndex, toTileIndex, wallTileType, mask, tileMask = null) {
    var areaMap,
        areaWidth = toTileIndex.x - fromTileIndex.x,
        areaHeight = toTileIndex.y - fromTileIndex.y,
        i,
        x,
        y,
		minOpenPercent = 0.40, // 0.40 (Sept 25 2018)
		initialWeight = 0.35, // 0.4 (sept 25)
        inBounds,
        countWalls,
        iterateFunc1,
        iterateFunc2,
        floodFunc,
        floodResult,
        success = false,
		removeDisconnectedAreas = true;
    
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
                if (!inBounds(x, y) || mapIn[x][y] === 'Wall' || mapIn[x][y] === 'SuperWall') {
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
				else if (countWalls(oldMap, x, y, 1) >= 5 || countWalls(oldMap, x, y, 2) <= 2) {
					newMap[x][y] = 'Wall';
				}
				else {
					newMap[x][y] = oldMap[x][y];
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
            } 
            else {
                areaMap[x][y] = 'Floor';
            }
        }
    }
	
	
	// Insert Super Wall:
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
    
        
	if (removeDisconnectedAreas) {
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
						} else {
							areaMap[x][y] = 'Wall';
						}
					}
				}
				success = true;
				break;
			}
		}
	} else {
		success = true;
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