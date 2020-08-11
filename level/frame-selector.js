/*global gs, game, util, console*/
/*jshint laxbreak: true, loopfunc: true, esversion: 6*/
'use strict';
var frameSelector = {};

frameSelector.init = function () {
	this.createWallMasks();
	this.createPitMasks();
};

// SELECT_FRAME:
// ************************************************************************************************
frameSelector.selectFrame = function (tileType) {
	if (!gs.zoneType().tileFrames) {
		throw gs.zoneName + 'does not have valid tileFrames';
	}
	
	if (!tileType) {
		throw 'selectFrame failed, invalid tileType: ' + tileType;
	}
	
	// Use zone specific frame:
	if (gs.zoneType().tileFrames[tileType.name]) {
		return gs.zoneType().tileFrames[tileType.name].base;
	}
	// Use Default Frame:
	else {
		return tileType.frame;
	}
};

// SET_ALTERNATE_TILE_FRAMES:
// ************************************************************************************************
frameSelector.setAlternateTileFrames = function (startX, startY, endX, endY) {
	var x, y;
	
	startX = startX || 0;
	startY = startY || 0;
	endX = endX || gs.numTilesX;
	endY = endY || gs.numTilesY;

	for (x = startX; x < endX; x += 1) {
		for (y = startY; y < endY; y += 1) {
			if (gs.isInBounds(x, y)) {
				// Wall Frames:
				if (gs.getTile(x, y).type === gs.tileTypes.Wall) {
					this.selectWallFrame(x, y);
				}
				
				// Cave Wall Frames:												  
				if (gs.getTile(x, y).type === gs.tileTypes.CaveWall) {
					this.selectWallFrame(x, y);
				}
				
				// Pit Frames:
				if (gs.getTile(x, y).type === gs.tileTypes.Pit || gs.getTile(x, y).type === gs.tileTypes.CavePit) {
					this.selectPitFrame(x, y);
				}

				// Alternate Frames:
				if (gs.getTile(x, y).frame === this.selectFrame(gs.getTile(x, y).type)
					&& gs.zoneType().tileFrames[gs.getTile(x, y).type.name]
					&& gs.zoneType().tileFrames[gs.getTile(x, y).type.name].alternate
					&& util.frac() <= 0.30) {

					gs.getTile(x, y).frame = util.randElem(gs.zoneType().tileFrames[gs.getTile(x, y).type.name].alternate);
				}

				if (isNaN(gs.getTile(x, y).frame)) {
					console.log(gs.zoneType().tileFrames[gs.getTile(x, y).type.name].alternate);
					console.log(gs.getTile(x, y));
					throw 'frame was set to NaN';
				}

				// Object Frames:
				if (gs.getObj(x, y) && gs.zoneType().tileFrames[gs.getObj(x, y).type.name]) {
					gs.getObj(x, y).sprite.frame = gs.zoneType().tileFrames[gs.getObj(x, y).type.name].base;
				}
			}
		}
	}
	
	
};



// SET_WATER_TILE_FRAMES:
// ************************************************************************************************
frameSelector.setWaterTileFrames = function (startX, startY, endX, endY) {
	var baseFrame = gs.tileTypes.Water.frame,
		isFloor,
		isCave,
		offset;
	
	startX = startX || 0;
	startY = startY || 0;
	endX = endX || gs.numTilesX;
	endY = endY || gs.numTilesY;
	
	isFloor = function (x, y) {
		return !gs.isInBounds(x, y) 
			|| gs.getTile(x, y).type.name === 'Floor' 
			|| gs.getTile(x, y).type.name === 'Wall'
			|| gs.getTile(x, y).type.name === 'Pit';
	};
	
	isCave = function (x, y) {
		return !gs.isInBounds(x, y) 
			|| gs.inArray(gs.getTile(x, y).type.name, ['CaveFloor', 'CavePit', 'CaveWall']);
	};
		
	
	gs.getIndexInBox(startX, startY, endX, endY).forEach(function (index) {
		if (gs.inArray(gs.getTile(index).type.name, ['Water', 'Lava', 'ToxicWaste'])) {
			if (gs.getTile(index).frame === 1280) {
				baseFrame = this.selectFrame(gs.getTile(index).type);
			}
			else {
				baseFrame = gs.getTile(index).frame;
			}
			offset = 0;
			
			// Dungeon:
			if (isFloor(index.x - 1, index.y) && isFloor(index.x + 1, index.y) && isFloor(index.x, index.y - 1)) {
				offset = 13;
			}
			else if (isFloor(index.x - 1, index.y) && isFloor(index.x + 1, index.y) && isFloor(index.x, index.y + 1)) {
				offset = 14;
			}
			else if (isFloor(index.x, index.y - 1) && isFloor(index.x, index.y + 1) && isFloor(index.x - 1, index.y)) {
				offset = 11;
			}
			else if (isFloor(index.x, index.y - 1) && isFloor(index.x, index.y + 1) && isFloor(index.x + 1, index.y)) {
				offset = 12;
			}
			else if (isFloor(index.x - 1, index.y) && isFloor(index.x + 1, index.y)) {
				offset = 10;
			}
			else if (isFloor(index.x, index.y - 1) && isFloor(index.x, index.y + 1)) {
				offset = 9;
			}
			else if (isFloor(index.x - 1, index.y) && isFloor(index.x, index.y - 1)) {
				offset = 5;
			}
			else if (isFloor(index.x + 1, index.y) && isFloor(index.x, index.y - 1)) {
				offset = 6;
			}
			else if (isFloor(index.x - 1, index.y) && isFloor(index.x, index.y + 1)) {
				offset = 7;
			}
			else if (isFloor(index.x + 1, index.y) && isFloor(index.x, index.y + 1)) {
				offset = 8;
			}
			else if (isFloor(index.x - 1, index.y)) {
				offset = 3;
			}
			else if (isFloor(index.x + 1, index.y)) {
				offset = 4;
			}
			else if (isFloor(index.x, index.y - 1)) {
				offset = 1;
			}
			else if (isFloor(index.x, index.y + 1)) {
				offset = 2;
			}
			
			// Cave
			if (isCave(index.x - 1, index.y) && isCave(index.x + 1, index.y) && isCave(index.x, index.y - 1)) {
				offset = 27 + 18;
			}
			else if (isCave(index.x - 1, index.y) && isCave(index.x + 1, index.y) && isCave(index.x, index.y + 1)) {
				offset = 28 + 18;
			}
			else if (isCave(index.x, index.y - 1) && isCave(index.x, index.y + 1) && isCave(index.x - 1, index.y)) {
				offset = 25 + 18;
			}
			else if (isCave(index.x, index.y - 1) && isCave(index.x, index.y + 1) && isCave(index.x + 1, index.y)) {
				offset = 26 + 18;
			}
			else if (isCave(index.x - 1, index.y) && isCave(index.x + 1, index.y)) {
				offset = 24 + 18;
			}
			else if (isCave(index.x, index.y - 1) && isCave(index.x, index.y + 1)) {
				offset = 23 + 18;
			}
			else if (isCave(index.x - 1, index.y) && isCave(index.x, index.y - 1)) {
				offset = 19 + 18;
			}
			else if (isCave(index.x + 1, index.y) && isCave(index.x, index.y - 1)) {
				offset = 20 + 18;
			}
			else if (isCave(index.x - 1, index.y) && isCave(index.x, index.y + 1)) {
				offset = 21 + 18;
			}
			else if (isCave(index.x + 1, index.y) && isCave(index.x, index.y + 1)) {
				offset = 22 + 18;
			}
			else if (isCave(index.x - 1, index.y)) {
				offset = 17 + 18;
			}
			else if (isCave(index.x + 1, index.y)) {
				offset = 18 + 18;
			}
			else if (isCave(index.x, index.y - 1)) {
				offset = 15 + 18;
			}
			else if (isCave(index.x, index.y + 1)) {
				offset = 16 + 18;
			}
			
			gs.getTile(index).frame = baseFrame + offset;
		}
	}, this);
};



// DRESS_FLOOR_BORDER_TILES:
// Based on the presence of solid walls
// ************************************************************************************************
frameSelector.dressFloorBorderTiles = function () {
	var isWall,
		isSolid,
		baseFrame;
		
	isSolid = function (x, y) {
		return !gs.getTile(x, y) || !gs.getTile(x, y).type.passable;
	};
		
	// Need to test if the index is a wall or a hallway
	isWall = function (x, y) {		
		return isSolid(x, y) || (isSolid(x + 1, y) && isSolid(x - 1, y)) || (isSolid(x, y + 1) && isSolid(x, y - 1));
	};
	
	
	gs.getAllIndex().forEach(function (index) {
		if (gs.getTile(index).type.name === 'Floor' && gs.getTile(index).type.passable && gs.getTile(index).frame === this.selectFrame(gs.tileTypes.Floor)) {
			baseFrame = gs.getTile(index).frame;
			
			
			
			if (isWall(index.x - 1, index.y) && isWall(index.x, index.y - 1) && !isWall(index.x + 1, index.y + 1) && !isWall(index.x + 1, index.y) && !isWall(index.x, index.y + 1)) {
				gs.getTile(index).frame = baseFrame + 10;
			}
			else if (isWall(index.x + 1, index.y) && isWall(index.x, index.y - 1) && !isWall(index.x - 1, index.y + 1) && !isWall(index.x - 1, index.y) && !isWall(index.x, index.y + 1)) {
				gs.getTile(index).frame = baseFrame + 11;
			}
			else if (isWall(index.x - 1, index.y) && isWall(index.x, index.y + 1) && !isWall(index.x + 1, index.y - 1) && !isWall(index.x + 1, index.y) && !isWall(index.x, index.y - 1)) {
				gs.getTile(index).frame = baseFrame + 8;
			}
			else if (isWall(index.x + 1, index.y) && isWall(index.x, index.y + 1) && !isWall(index.x - 1, index.y - 1) && !isWall(index.x - 1, index.y) && !isWall(index.x, index.y - 1)) {
				gs.getTile(index).frame = baseFrame + 9;
			}
			else if (isWall(index.x - 1, index.y) && !isWall(index.x + 1, index.y) && !isWall(index.x, index.y + 1) && !isWall(index.x, index.y - 1)) {
				gs.getTile(index).frame = baseFrame + 7;
			}
			else if (isWall(index.x + 1, index.y) && !isWall(index.x - 1, index.y) && !isWall(index.x, index.y + 1) && !isWall(index.x, index.y - 1)) {
				gs.getTile(index).frame = baseFrame + 6;
			}
			else if (isWall(index.x, index.y - 1) && !isWall(index.x, index.y + 1) && !isWall(index.x + 1, index.y) && !isWall(index.x - 1, index.y)) {
				gs.getTile(index).frame = baseFrame + 5;
			}
			else if (isWall(index.x, index.y + 1) && !isWall(index.x, index.y - 1) && !isWall(index.x + 1, index.y) && !isWall(index.x - 1, index.y)) {
				gs.getTile(index).frame = baseFrame + 4;
			}
		}
		
		// Doors and halls:
		if (gs.getTile(index).type.name === 'Floor' &&
		   ((isSolid(index.x + 1, index.y) && isSolid(index.x - 1, index.y)) ||
		   (isSolid(index.x, index.y + 1) && isSolid(index.x, index.y - 1)))) {
			
			gs.getTile(index).frame = baseFrame + 3;
		}
	}, this);
};

// CREATE_WALL_MASKS:
// During this function later masks can overwrite earlier masks
// Use later masks to specify more specific masks
// ************************************************************************************************
frameSelector.createWallMasks = function () {
	var X = 2;
	
	this.wallMasks = [
		{mask: [[X, 1, X],
				[0, 1, 1],
				[0, 0, X]],
		 offset: 1
		},
		{mask: [[X, 1, X],
			    [1, 1, 0],
				[X, 0, 0]],
		 offset: 2
		},
		{mask: [[X, 1, X],
			    [0, 1, 1],
				[X, 1, X]],
		 offset: 3
		},
		{mask: [[X, 1, X],
			    [1, 1, 0],
				[X, 1, X]],
		 offset: 4
		},
		{mask: [[0, 0, X],
			    [0, 1, 1],
				[X, 1, X]],
		 offset: 5
		},
		{mask: [[X, 0, X],
			    [1, 1, 1],
				[X, 1, X]],
		 offset: 6
		},
		{mask: [[X, 0, 0],
			    [1, 1, 0],
				[X, 1, X]],
		 offset: 7
		},
		
		{mask: [[1, 1, X],
			    [1, 1, 1],
				[X, 1, 0]],
		 offset: 4
		},
		{mask: [[X, 1, 1],
			    [1, 1, 1],
				[0, 1, X]],
		 offset: 3
		},
		
		{mask: [[X, 1, 0],
			    [1, 1, 1],
				[1, 1, X]],
		 offset: 10
		},
		{mask: [[0, 1, X],
			    [1, 1, 1],
				[X, 1, 1]],
		 offset: 11
		},
		{mask: [[X, 1, X],
			    [0, 1, 0],
				[X, 0, X]],
		 offset: 12
		},
		{mask: [[0, 1, 0],
			    [1, 1, 0],
				[0, 1, 0]],
		 offset: 13
		},
		{mask: [[0, 1, X],
			    [0, 1, 1],
				[0, 1, 0]],
		 offset: 13
		},
		{mask: [[X, 1, X],
			    [0, 1, 0],
				[X, 1, X]],
		 offset: 13
		},
		{mask: [[1, 1, X],
			    [1, 1, 0],
				[0, 1, 0]],
		 offset: 13
		},
		{mask: [[0, 1, 1],
			    [0, 1, 1],
				[1, 1, 0]],
		 offset: 13
		},
		{mask: [[X, 0, X],
			    [0, 1, 0],
				[X, 1, X]],
		 offset: 14
		},
		{mask: [[0, 0, 0],
			    [1, 1, 1],
				[0, 1, 0]],
		 offset: 14
		},
		{mask: [[0, 0, 0],
			    [1, 1, 0],
				[0, 1, 0]],
		 offset: 14
		},
		{mask: [[0, 1, 1],
			    [1, 1, 1],
				[0, 1, 1]],
		 offset: 3
		},
		{mask: [[0, 0, 0],
			    [1, 1, 1],
				[1, 1, 0]],
		 offset: 7
		},
		{mask: [[0, 0, X],
			    [1, 1, 1],
				[0, 1, 1]],
		 offset: 5
		},
		{mask: [[1, 1, 0],
			    [1, 1, 1],
				[1, 1, 0]],
		 offset: 4
		},
		{mask: [[0, 0, 1],
			    [1, 1, 1],
				[1, 1, 0]],
		 offset: 7
		},
		{mask: [[1, 0, 0],
			    [1, 1, 1],
				[0, 1, 0]],
		 offset: 14
		},
		{mask: [[1, 1, 1],
			    [0, 1, 1],
				[0, 1, 0]],
		 offset: 13
		},
		{mask: [[1, 1, 0],
			    [1, 1, 0],
				[0, 1, 1]],
		 offset: 13
		},
		{mask: [[0, 0, 1],
			    [1, 1, 1],
				[0, 1, 0]],
		 offset: 14
		},
		{mask: [[0, 1, 0],
			    [1, 1, 1],
				[0, 1, 0]],
		 offset: 13
		},
		{mask: [[1, 0, 0],
			    [1, 1, 0],
				[0, 1, 0]],
		 offset: 14
		},
		{mask: [[0, 1, 1],
			    [1, 1, 1],
				[1, 1, 0]],
		 offset: 7
		},
		{mask: [[1, 1, 1],
			    [1, 1, 1],
				[0, 1, 0]],
		 offset: 14
		},
		
		
		// Corner edge correction
		{mask: [[X, X, X],
			    [1, 1, X],
				[1, 0, 0]],
		 offset: 1
		},
		
		{mask: [[X, X, X],
			    [X, 1, 1],
				[0, 0, 1]],
		 offset: 2
		},
		
		// Corners:
		{mask: [[0, 1, 0],
			    [1, 1, 1],
				[1, 1, 1]],
		 offset: 9
		},
		
		// Etc:
		{mask: [[0, 0, 0],
			    [0, 1, 1],
				[0, 1, 0]],
		 offset: 14
		},
		
		{mask: [[0, 1, X],
			    [1, 1, 0],
				[1, 1, 0]],
		 offset: 15
		},
		
		{mask: [[X, 1, 0],
			    [0, 1, 1],
				[0, 1, 1]],
		 offset: 16
		},
		
		{mask: [[0, 1, 1],
			    [0, 1, 1],
				[0, 1, 0]],
		 offset: 13
		},
		
		{mask: [[0, 1, 0],
			    [0, 1, 1],
				[1, 1, 1]],
		 offset: 16
		},
	
		{mask: [[0, 1, 0],
			    [1, 1, 0],
				[1, 1, 1]],
		 offset: 15
		},
		
		{mask: [[1, 0, 0],
			    [1, 1, 1],
				[0, 1, 1]],
		 offset: 5
		},
		
		{mask: [[0, 0, 0],
			    [1, 1, 0],
				[0, 1, 1]],
		 offset: 14
		},
		
		{mask: [[1, 1, 0],
			    [1, 1, 1],
				[0, 1, 1]],
		 offset: 5
		},
		/*
		// Top and bottom wall:
		{mask: [[X, 0, X],
			    [X, 1, X],
				[X, 0, X]],
		 offset: 31
		},
		*/
		
	];
};

// SELECT_WALL_FRAMES
// ************************************************************************************************
frameSelector.selectWallFrame = function (x, y) {
	var i, frame;

	frame = gs.getTile(x, y).frame;
	
	if (!gs.isBaseTileFrame(frame)) {
		return;
	}
	
	if (!this.matchMask(x, y, [[1,1,1],[1,1,1],[1,1,1]])) {
		for (i = 0; i < this.wallMasks.length; i += 1) {
			if (this.matchMask(x, y, this.wallMasks[i].mask)) {
				frame = gs.getTile(x, y).frame + this.wallMasks[i].offset;
			}
		}
	}
	
	gs.getTile(x, y).frame = frame;
};

// CREATE_PIT_MASKS:
// During this function later masks can overwrite earlier masks
// Use later masks to specify more specific masks
// ************************************************************************************************
frameSelector.createPitMasks = function () {
	var X = 2;
	
	this.pitMasks = [
		// Straight:
		{mask: [[X, 0, X],
				[1, 1, 1],
				[X, 1, X]],
		 offset: 2
		},
		
		{mask: [[X, 1, X],
				[0, 1, 1],
				[X, 1, X]],
		 offset: 4
		},
		
		{mask: [[X, 1, X],
				[1, 1, 0],
				[X, 1, X]],
		 offset: 5
		},
		
		{mask: [[X, 1, X],
				[1, 1, 1],
				[X, 0, X]],
		 offset: 7
		},
		
		// Inner Corner:
		{mask: [[0, 0, X],
				[0, 1, X],
				[X, X, X]],
		 offset: 1
		},
		
		{mask: [[X, 0, 0],
				[X, 1, 0],
				[X, X, X]],
		 offset: 3
		},
		
		{mask: [[X, X, X],
				[0, 1, X],
				[0, 0, X]],
		 offset: 6
		},
		
		{mask: [[X, X, X],
				[X, 1, 0],
				[X, 0, 0]],
		 offset: 8
		},
		
		// Outter Corner:
		{mask: [[X, X, X],
				[X, 1, 1],
				[X, 1, 0]],
		 offset: 9
		},
		
		{mask: [[X, X, X],
				[1, 1, X],
				[0, 1, X]],
		 offset: 10
		},
		
		{mask: [[X, 1, 0],
				[X, 1, 1],
				[X, X, X]],
		 offset: 11
		},
		
		{mask: [[0, 1, X],
				[1, 1, X],
				[X, X, X]],
		 offset: 12
		},
	];
};

// SELECT_PIT_FRAME:
// ************************************************************************************************
frameSelector.selectPitFrame = function (x, y) {
	var i, frame, pred, name, baseFrame;
	
	baseFrame = this.selectFrame(gs.getTile(x, y).type);
	frame = baseFrame;
	name = gs.getTile(x, y).type.name;
	
	pred = function (x, y) {
		return !gs.isPit(x, y)
			&& gs.getTile(x, y).type.name !== 'Bridge' 
			&& gs.getTile(x, y).type.name !== 'HalfWall';
	};
	
	if (!this.matchMask(x, y, [[1,1,1],[1,1,1],[1,1,1]], pred)) {
		for (i = 0; i < this.pitMasks.length; i += 1) {
			if (this.matchMask(x, y, this.pitMasks[i].mask, pred)) {
				frame = baseFrame + this.pitMasks[i].offset;
			}
		}
	}
	
	gs.getTile(x, y).frame = frame;
};

// MATCH_MASK:
// ************************************************************************************************
frameSelector.matchMask = function (x, y, bitMask, pred) {
	var itX, itY;
	
	pred = pred || function (x, y) {
		return gs.getTile(x, y).type.passable || gs.getTile(x, y).type.name === 'Pit';
	};
	
	
	for (itX = 0; itX < 3; itX += 1) {
		for (itY = 0; itY < 3; itY += 1) {
			if (bitMask[itY][itX] === 1 && gs.isInBounds(x + itX - 1, y + itY - 1) && pred(x + itX - 1, y + itY - 1)) {
				return false;
			}
			if (bitMask[itY][itX] === 0 && (!gs.isInBounds(x + itX - 1, y + itY - 1) || !pred(x + itX - 1, y + itY - 1))) {
				return false;
			}
		}
	}
	
	return true;
};