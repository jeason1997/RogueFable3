/*global gs, game, console, Phaser, util*/
/*global baseGenerator*/
/*global VAULT_ROOM_PERCENT*/
/*jshint esversion: 6, laxbreak: true, loopfunc: true*/
'use strict';

// PLACE VS PLACE RANDOM:
// Generally, generators will use placeRandom and pass it an area

// ROOM_TYPE:
// Each room type handles the initial generation of tiles
// It then has custom functions for handling the placement of pillars and water that fit its unique shape
// Each room types generator will return the roomArea correctly filled in with tiles

// GENERATE:
// Given a box, place a room of random size within its bounds.
// Will create and return an area with tiles correctly set

// BOXS:
// Note: all boxes are lower bound inclusive and upper bound exclusive
// Note: all sizes of rooms include the walls i.e. floor space is width - 2, height - 2

var roomGenerator = {};

var MIN_ROOM_SIZE = 5;

// CREATE_ROOM_TYPES:
// ************************************************************************************************
roomGenerator.createRoomTypes = function () {
	this.roomTypes = {};
	this.roomTypeList = [];
	
	this.createSquareRoomType();
	this.createCrossRoomType();
	
	
	// CIRCLE:
	// ********************************************************************************************
	this.roomTypes.Circle = {};
	this.roomTypes.Circle.generate = function (boundsBox, roomDesc, useMaxSize) {
		var box, radius;
		
		if (useMaxSize) {
			box = boundsBox;
		}
		else {
			box = roomGenerator.randomBox(boundsBox);
		}
		
		radius = Math.floor(Math.max(box.width, box.height) / 2) - 1;
		baseGenerator.placeTileCircle(box.centerTileIndex, radius, gs.tileTypes.Wall);
		baseGenerator.placeTileCircle(box.centerTileIndex, radius - 1, gs.tileTypes.Floor);
		
		
		return baseGenerator.createArea(box.startX, box.startY, box.endX, box.endY);
	};
	
	// VAULT:
	// ********************************************************************************************
	this.roomTypes.Vault = {};
	this.roomTypes.Vault.generate = function (boundsBox, roomDesc, maxSize) {
		var tileIndex, roomArea;
		
		
		roomArea = baseGenerator.placeVault(boundsBox.startTileIndex, roomDesc.vaultDesc);
		
		return roomArea;
	};
	
	gs.nameTypes(this.roomTypes);
	gs.forEachType(this.roomTypes, function (roomType) {
		this.roomTypeList.push(roomType);
	}, this);
};

// PLACE_RANDOM_ROOM:
// Returns the area
// ************************************************************************************************
roomGenerator.placeRandomRoom = function (boundsBox, vaultTags, useMaxSize) {
	var roomTypeList = [], vaultDesc;
	
	vaultTags = vaultTags || gs.zoneType().vaultTags;
	
	// All rooms can be square:
	roomTypeList.push({roomType: 'Square'});
	
	// Only square bounds can be crosses:
	if (util.boxType(boundsBox) === 'SQUARE') {
		roomTypeList.push({roomType: 'Cross'});
	}
	
	if (util.boxType(boundsBox) === 'SQUARE' && boundsBox.width >= 7) {
		roomTypeList.push({roomType: 'Circle'});
	}
	
	
	// Vault:
	vaultDesc = gs.randVaultType(boundsBox.width / 2, boundsBox.height / 2, boundsBox.width, boundsBox.height, vaultTags);
	if (vaultDesc && util.frac() < VAULT_ROOM_PERCENT) {
		roomTypeList.push({roomType: 'Vault', vaultDesc: vaultDesc});
	}
	
	
	roomTypeList = roomTypeList.filter(type => gs.inArray(type.roomType, gs.zoneType().roomTags));

	return this.placeRoom(boundsBox, util.randElem(roomTypeList), useMaxSize);
};

// PLACE_ROOM:
// Returns the area
// ************************************************************************************************
roomGenerator.placeRoom = function (boundsBox, roomDesc, useMaxSize) {
	var roomArea;
	
	if (!this.roomTypes.hasOwnProperty(roomDesc.roomType)) {
		throw 'Invalid roomTypeName: ' + roomDesc.roomType;
	} 
	
	roomArea = this.roomTypes[roomDesc.roomType].generate(boundsBox, roomDesc, useMaxSize);
	
	return roomArea;
};

// DRESS_ROOMS:
// ************************************************************************************************
roomGenerator.dressRooms = function () {
	gs.areaList.forEach(function (area) {
		this.dressRoom(area);
	}, this);
};

// DRESS_ROOM:
// ************************************************************************************************
roomGenerator.dressRoom = function (area) {
	if (area.roomType) {
		this.roomTypes[area.roomType].dressRoom(area);
	}
};

// RANDOM_BOX:
// Given a box in which a room will be placed, return a new box with random width and height
// Also with a random position within the box that does not exceed the bounds
// Width and height can vary from half to full size
// ************************************************************************************************
roomGenerator.randomBox = function (box) {
	var startX, startY, width, height;
	
	width = Math.max(MIN_ROOM_SIZE, util.randInt(box.width / 2 + 1, box.width));
	height = Math.max(MIN_ROOM_SIZE, util.randInt(box.height / 2 + 1, box.height));
	
	// Don't allow super long narrow rooms:
	width = Math.min(box.width, Math.max(Math.floor(height * 0.5), width));
	height = Math.min(box.height, Math.max(Math.floor(width * 0.5), height));
	
	
	startX = box.startX + util.randInt(0, box.width - width);
	startY = box.startY + util.randInt(0, box.height - height);
	
	return gs.createBox(startX, startY, startX + width, startY + height);
};

// RANDOM_TALL_BOX
// ************************************************************************************************
roomGenerator.randomTallBox = function (box) {
	var startX, startY, width, height;
	
	width = Math.max(MIN_ROOM_SIZE, util.randInt(box.width * 0.4, box.width * 0.6));
	height = Math.max(MIN_ROOM_SIZE, Math.ceil(box.height * 0.5) + util.randInt(box.height * 0.25, box.height * 0.5));
	
	startX = box.startX + Math.round((util.randInt(0, box.width - width) + util.randInt(0, box.width - width)) / 2);
	startY = box.startY + util.randInt(0, box.height - height);
	
	return gs.createBox(startX, startY, startX + width, startY + height);
};

// RANDOM_WIDE_BOX
// ************************************************************************************************
roomGenerator.randomWideBox = function (box) {
	var startX, startY, width, height;
	
	width = Math.max(MIN_ROOM_SIZE, Math.ceil(box.width * 0.5) + util.randInt(box.width * 0.25, box.width * 0.5));
	height = Math.max(MIN_ROOM_SIZE, util.randInt(box.height * 0.4, box.height * 0.60));
	
	startX = box.startX + util.randInt(0, box.width - width);
	startY = box.startY + Math.round((util.randInt(0, box.height - height) + util.randInt(0, box.height - height)) / 2);
	
	return gs.createBox(startX, startY, startX + width, startY + height);
};

// CREATE_SQUARE_ROOM_TYPE:
// A square or rectangular room
// ************************************************************************************************
roomGenerator.createSquareRoomType = function () {
	this.roomTypes.Square = {};
	
	// GENERATE:
	// ********************************************************************************************
	this.roomTypes.Square.generate = function (boundsBox, roomDesc, maxSize) {
		var area, box;
		
		if (maxSize) {
			box = boundsBox;
		}
		else {
			box = roomGenerator.randomBox(boundsBox);
		}
		
		// Wall:
		baseGenerator.placeTileSquare(box.startTileIndex, box.endTileIndex, gs.tileTypes.Wall);
		
		// Floor:
		baseGenerator.placeTileSquare({x: box.startX + 1, y: box.startY + 1}, {x: box.endX - 1, y: box.endY - 1}, gs.tileTypes.Floor);
		
		// Solid Walls:
		gs.getTile(box.startX, box.startY).isSolidWall = true;
		gs.getTile(box.startX, box.endY - 1).isSolidWall = true;
		gs.getTile(box.endX - 1, box.startY).isSolidWall = true;
		gs.getTile(box.endX - 1, box.endY - 1).isSolidWall = true;
		
		area = baseGenerator.createArea(box.startX, box.startY, box.endX, box.endY);
		area.roomType = 'Square';
		
		return area;
	};
	
	// DRESS_ROOM:
	// ********************************************************************************************
	this.roomTypes.Square.dressRoom = function (area) {
		var list = [], objectTypeName = 'Pillar';
		
		if (gs.zoneName === 'TheIronFortress' && game.rnd.frac() < 0.25) {
			objectTypeName = 'GasLamp';
		}
		
		if (gs.zoneName === 'TheDarkTemple' && game.rnd.frac() < 0.25) {
			objectTypeName = 'Brazer';
		}
		
		// Pillars:
		if (Math.min(area.width, area.height) > 7 && util.frac() < 0.25) {
			this.placePillars(area, objectTypeName);
		}
		
		// Water:
		if (Math.min(area.width, area.height) > 5 && util.frac() < 0.25 && !gs.zoneType().spawnLava) {
			this.placeWater(area);
		}
		
		// Lava:
		if (Math.min(area.width, area.height) > 5 && util.frac() < 0.25 && gs.zoneType().spawnLava) {
			this.placeLava(area);
		}
		
		// Pit:
		if (!area.hasWater && Math.min(area.width, area.height) > 5 && util.frac() < 0.25 && gs.zoneLevel < 4 && gs.zoneType().spawnPits) {
			this.placePit(area);
		}
		
		// Other Dressing Types:
		if (!area.hasWater && !area.hasPillars && util.frac() < 0.25) {
			
			if (gs.zoneName === 'TheCrypt') {
				if (Math.min(area.width, area.height) > 6) {
					list.push(roomGenerator.dressCrypt);
				}
			}
			else {
				if (Math.min(area.width, area.height) > 7) {
					list.push(roomGenerator.dressDiningRoom);
					list.push(roomGenerator.dressPracticeRoom);
				}

				if (Math.min(area.width, area.height) > 7 && util.boxType(area) === 'SQUARE') {
					list.push(roomGenerator.dressBedRoom);
				}
			}
		
			if (list.length > 0) {
				util.randElem(list).call(this, area);
			}
			
		}
	};
	
	// PLACE_PILLARS:
	// ********************************************************************************************
	this.roomTypes.Square.placePillars = function (area, objectTypeName = 'Pillar') {
		var type;
		
		if (util.boxType(area) === 'TALL') {
			type = 'SIDES';
		}
		else if (util.boxType(area) === 'WIDE') {
			type = 'TOP';
		}
		else {
			type = 'BOX';
		}
		
		// Pillars are along left and right walls:
		for (let x = area.startX + 2; x < area.endX - 2; x += 1) {
			for (let y = area.startY + 2; y < area.endY - 2; y += 1) {
				// Left and Right walls:
				if (type === 'SIDES' && (x === area.startX + 2 || x === area.endX - 3) && y % 3 === 0) {
					if (!gs.getObj(x, y)) {
						gs.createObject({x: x, y: y}, objectTypeName);
					}
				}

				// Top and Bottom walls:
				if (type === 'TOP' && (y === area.startY + 2 || y === area.endY - 3) && x % 3 === 0) {
					if (!gs.getObj(x, y)) {
						gs.createObject({x: x, y: y}, objectTypeName);
					}
				}
			}
		}
		
		// Box:
		if (type === 'BOX') {
			if (!gs.getObj(area.startX + 2, area.startY + 2)) {
				gs.createObject({x: area.startX + 2, y: area.startY + 2}, objectTypeName);
			}
			if (!gs.getObj(area.startX + 2, area.endY - 3)) {
				gs.createObject({x: area.startX + 2, y: area.endY - 3}, objectTypeName);
			}
			if (!gs.getObj(area.endX - 3, area.startY + 2)) {
				gs.createObject({x: area.endX - 3, y: area.startY + 2}, objectTypeName);
			}
			if (!gs.getObj(area.endX - 3, area.endY - 3)) {
				gs.createObject({x: area.endX - 3, y: area.endY - 3}, objectTypeName);
			}
		}
		
		area.hasPillars = true;
	};
	
	// PLACE_FILL_TILE:
	// Used to place pits or water
	// ********************************************************************************************
	this.roomTypes.Square.placeFillTile = function (area, tileType) {
		var indexList,
			fillTypes,
			fillType,
			radius;
		
		
		fillTypes = [
			{name: 'STANDARD', percent: 80},
		];
		
		if (!area.hasPillars) {
			fillTypes.push({name: 'RANDOM', percent: 20});
		}
		
		if (util.boxType(area) === 'SQUARE' && Math.min(area.width, area.height) > 7 && area.width % 2 === 1 && area.height % 2 === 1) {
			fillTypes.push({name: 'CIRCLE', percent: 25000});
		}
		
		fillType = gs.chooseRandom(fillTypes);
		
	
	
		// Random Size:
		if (fillType === 'RANDOM') {
			indexList = gs.getIndexInBox(area.startX + 2 + util.randInt(0, Math.floor(area.width / 4)), 
									 area.startY + 2 + util.randInt(0, Math.floor(area.height / 4)), 
									 area.endX - 2 - util.randInt(0, Math.floor(area.width / 4)), 
									 area.endY - 2 - util.randInt(0, Math.floor(area.height / 4)));
		}
		// Standard Size:
		else if (fillType === 'STANDARD') {
			indexList = gs.getIndexInBox(area.startX + 2, area.startY + 2, area.endX - 2, area.endY - 2);
		}
		// Circle
		else if (fillType === 'CIRCLE') {
			radius = Math.floor(Math.min(area.width, area.height) / 2) - 3;
			gs.getIndexInRadius(area.centerTileIndex, radius + 1).forEach(function (index) {
				if (!gs.getTile(index).mustBeFloor && gs.isPassable(index) && util.distance(area.centerTileIndex, index) < radius + 1) {
					gs.setTileType(index, gs.tileTypes.Water);
				}
			}, this);
			
			return;
		}
		

		indexList.forEach(function (index) {
			if (!gs.getTile(index).mustBeFloor && gs.isPassable(index)) {
				gs.setTileType(index, tileType);
			}
		}, this);
	};	
	
	// PLACE_WATER:
	// ********************************************************************************************
	this.roomTypes.Square.placeWater = function (area) {
		area.hasWater = true;
		this.placeFillTile(area, gs.tileTypes.Water);
	};
	
	// PLACE_LAVA:
	// ********************************************************************************************
	this.roomTypes.Square.placeLava = function (area) {
		area.hasWater = true;
		this.placeFillTile(area, gs.tileTypes.Lava);
	};
	
	// PLACE_PIT:
	// ********************************************************************************************
	this.roomTypes.Square.placePit = function (area) {
		area.hasPit = true;
		this.placeFillTile(area, gs.tileTypes.Pit);
	};
	
};

// CREATE_CROSS_ROOM_TYPE:
// ************************************************************************************************
roomGenerator.createCrossRoomType = function () {
	this.roomTypes.Cross = {};
	
	// GENERATE:
	// ********************************************************************************************
	this.roomTypes.Cross.generate = function (boundsBox, roomDesc, maxSize) {
		var area,
			tallBox = roomGenerator.randomTallBox(boundsBox),
			wideBox = roomGenerator.randomWideBox(boundsBox);
		
		// Walls:
		baseGenerator.placeTileSquare(tallBox.startTileIndex, tallBox.endTileIndex, gs.tileTypes.Wall);
		baseGenerator.placeTileSquare(wideBox.startTileIndex, wideBox.endTileIndex, gs.tileTypes.Wall);
		
		// Floors:
		baseGenerator.placeTileSquare({x: tallBox.startX + 1, y: tallBox.startY + 1}, {x: tallBox.endX - 1, y: tallBox.endY - 1}, gs.tileTypes.Floor);
		baseGenerator.placeTileSquare({x: wideBox.startX + 1, y: wideBox.startY + 1}, {x: wideBox.endX - 1, y: wideBox.endY - 1}, gs.tileTypes.Floor);
		
		// Create Area:
		area = baseGenerator.createArea(boundsBox.startX, boundsBox.startY, boundsBox.endX, boundsBox.endY);
		area.roomType = 'Cross';
		area.tallBox = tallBox;
		area.wideBox = wideBox;
		area.centerBox = util.intersectBox(tallBox, wideBox);
		
		return area;
	};
	
	// DRESS_ROOM:
	// ********************************************************************************************
	this.roomTypes.Cross.dressRoom = function (area) {
		var objectTypeName = 'Pillar';
		
		if (gs.zoneName === 'TheIronFortress' && game.rnd.frac() < 0.25) {
			objectTypeName = 'GasLamp';
		}
		
		if (gs.zoneName === 'TheDarkTemple' && game.rnd.frac() < 0.25) {
			objectTypeName = 'Brazer';
		}
		
		if (Math.min(area.tallBox.width, area.tallBox.height) > 7 || Math.min(area.wideBox.width, area.wideBox.height) > 7 && util.frac() < 0.25) {	
			this.placePillars(area, objectTypeName);
		}
		
		if (util.frac() < 0.25 && !gs.zoneType().spawnLava) {
			this.placeWater(area);
		}
		
		if (util.frac() < 0.25 && gs.zoneType().spawnLava) {
			this.placeLava(area);
		}
	};
	
	// PLACE_PILLARS:
	// ********************************************************************************************
	this.roomTypes.Cross.placePillars = function (area, objectTypeName = 'Pillar') {
		var innerWideBox = gs.createBox(area.wideBox.startX + 2, area.wideBox.startY + 2, area.wideBox.endX - 2, area.wideBox.endY - 2),
			innerTallBox = gs.createBox(area.tallBox.startX + 2, area.tallBox.startY + 2, area.tallBox.endX - 2, area.tallBox.endY - 2),
			innerCenterBox = gs.createBox(area.centerBox.startX + 1, area.centerBox.startY + 1, area.centerBox.endX - 1, area.centerBox.endY - 1);
		
		util.edgeBoxIndexList(innerWideBox).forEach(function (tileIndex) {
			if (!util.isInBox(tileIndex, innerCenterBox) && tileIndex.x % 3 === innerWideBox.startX % 3 && tileIndex.y % 3 === innerWideBox.startY % 3) {
				if (!gs.getObj(tileIndex)) {
					gs.createObject(tileIndex, objectTypeName);
				}
			}
		}, this);
		
		util.edgeBoxIndexList(innerTallBox).forEach(function (tileIndex) {
			if (!util.isInBox(tileIndex, innerCenterBox) && tileIndex.x % 3 === innerTallBox.startX % 3 && tileIndex.y % 3 === innerTallBox.startY % 3) {
				if (!gs.getObj(tileIndex)) {
					gs.createObject(tileIndex, objectTypeName);
				}
				
			}
		}, this);
		
		area.hasPillars = true;
			
	};
	
	// PLACE_WATER:
	// ********************************************************************************************
	this.roomTypes.Cross.placeFillTile = function (area, tileType) {
			var indexList;
		
		area.hasWater = true;
		
		// Center water:
		if (util.frac() < 0.5) {
			indexList = gs.getIndexInBox(area.centerBox.startX + 1, area.centerBox.startY + 1, area.centerBox.endX - 1, area.centerBox.endY - 1);
			indexList.forEach(function (tileIndex) {
				if (!gs.getTile(tileIndex).mustBeFloor && gs.isPassable(tileIndex)) {
					gs.setTileType(tileIndex, tileType);
				}
			}, this);
		}
		else {
			if (area.tallBox.width > 5) {
				indexList = gs.getIndexInBox(area.tallBox.startX + 2, area.tallBox.startY + 2, area.tallBox.endX - 2, area.tallBox.endY - 2);
				indexList.forEach(function (tileIndex) {
					if (!gs.getTile(tileIndex).mustBeFloor && gs.isPassable(tileIndex)) {
						gs.setTileType(tileIndex, tileType);
					}
				}, this);
			}

			if (area.wideBox.height > 5) {
				indexList = gs.getIndexInBox(area.wideBox.startX + 2, area.wideBox.startY + 2, area.wideBox.endX - 2, area.wideBox.endY - 2);
				indexList.forEach(function (tileIndex) {
					if (!gs.getTile(tileIndex).mustBeFloor && gs.isPassable(tileIndex)) {
						gs.setTileType(tileIndex, tileType);
					}
				}, this);
			}
		}
	};
	
	
	// PLACE_WATER:
	// ********************************************************************************************
	this.roomTypes.Cross.placeWater = function (area) {
		area.hasWater = true;
		this.placeFillTile(area, gs.tileTypes.Water);
	};
	
	// PLACE_LAVA:
	this.roomTypes.Cross.placeLava = function (area) {
		area.hasWater = true;
		this.placeFillTile(area, gs.tileTypes.Lava);
	};
	
	// PLACE_PIT:
	// ********************************************************************************************
	this.roomTypes.Cross.placePit = function (area) {
		area.hasPit = true;
		this.placeFillTile(area, gs.tileTypes.Pit);
	};
	
};

// IS_GOOD_OBJ_INDEX:
// ************************************************************************************************
roomGenerator.isGoodObjIndex = function (tileIndex) {
	return gs.isPassable(tileIndex)
		&& !gs.isPit(tileIndex)
		&& !gs.getObj(tileIndex)
		&& !gs.getTile(tileIndex).isClosed;
};

// DRESS_DINING_ROOM:
// ************************************************************************************************
roomGenerator.dressDiningRoom = function (area) {
	util.innerAreaIndexList(area).forEach(function (tileIndex) {
		if (tileIndex.y % 2 === 0 && roomGenerator.isGoodObjIndex(tileIndex) && game.rnd.frac() < 0.50) {
			gs.createObject(tileIndex, 'Table');
		}
	}, this);
};

// DRESS_PRACTICE_ROOM:
// ************************************************************************************************
roomGenerator.dressPracticeRoom = function (area) {
	util.innerAreaIndexList(area).forEach(function (tileIndex) {
		
		gs.setTileType(tileIndex, gs.tileTypes.CaveFloor, 320);
		
		if (tileIndex.y % 2 === 0 && tileIndex.x % 2 === 0 && roomGenerator.isGoodObjIndex(tileIndex) && game.rnd.frac() < 0.50) {
			gs.createObject(tileIndex, 'PracticeDummy');
		}
	}, this);
};

// DRESS_BED_ROOM:
// ************************************************************************************************
roomGenerator.dressBedRoom = function (area) {
	util.innerAreaIndexList(area).forEach(function (tileIndex) {		
		if (tileIndex.y % 2 === 0 && tileIndex.x % 2 === 0 && roomGenerator.isGoodObjIndex(tileIndex) && game.rnd.frac() < 0.50) {
			gs.createObject(tileIndex, 'Bed');
		}
	}, this);
};

// DRESS_CRYPT:
// large room with caskets placed down the center in one or more columns providing cover from projectiles.
// ************************************************************************************************
roomGenerator.dressCrypt = function (area) {
	util.innerAreaIndexList(area).forEach(function (tileIndex) {		
		if (tileIndex.y % 2 === 0 && tileIndex.x % 2 === 0 && roomGenerator.isGoodObjIndex(tileIndex) && game.rnd.frac() < 0.50) {
			gs.createObject(tileIndex, 'Casket');
		}
	}, this);
};