/*global game, gs, console, Phaser, util*/
/*global BaseGenerator, roomGenerator*/
/*jshint esversion: 6, loopfunc: true*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function ArcaneGenerator() {
	this.name = 'ArcaneGenerator';
}
ArcaneGenerator.prototype = new BaseGenerator();
var arcaneGenerator = new ArcaneGenerator();

// GENERATE:
// ************************************************************************************************
ArcaneGenerator.prototype.generate = function (flags) {
	var x, y;
	
	this.flags = flags || {};
	
	// Properties:
	this.areaGridSize = 3;
	this.areaWidth = Math.floor(this.numTilesX / this.areaGridSize);
	this.areaHeight = Math.floor(this.numTilesY / this.areaGridSize);
	this.areaBoarder = 0;
	this.minRoomWidth = util.randInt(8, this.areaWidth - 3);
	this.minRoomHeight = util.randInt(8, this.areaHeight - 3);
	
	this.MAX_HALL_WIDTH = util.randInt(2, 4);
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.Wall);
	this.roomAreaList = [];
	
	this.roomAreaGrid = [];
	for (x = 0; x < this.areaGridSize; x += 1) {
		this.roomAreaGrid[x] = [];
		for (y = 0; y < this.areaGridSize; y += 1) {
			this.roomAreaGrid[x][y] = null;
		}
	}
	
	this.selectMask();
	this.createRooms();
	this.selectConnectionTypes();
	this.portalConnectRooms();
	this.hallwayConnectRooms();
	this.placeDoors();
	this.fillBorderWall();
	
	// Room List:
	gs.areaList = this.roomAreaList;
	
	return true;
};

// CREATE_ROOMS:
// ************************************************************************************************
ArcaneGenerator.prototype.createRooms = function () {
	var x, y, area, vaultIndex;
	
	if (this.flags.GolemWorkshop) {
		vaultIndex = {x: util.randInt(0, 2), y: util.randInt(0, 2)};
	}
	
	for (x = 0; x < this.areaGridSize; x += 1) {
		for (y = 0; y < this.areaGridSize; y += 1) {
			if (this.mask[x][y]) {
				if (this.flags.GolemWorkshop && x === vaultIndex.x && y === vaultIndex.y) {
					area = this.placeVault({x: x * this.areaWidth + this.areaBoarder,
											y: y * this.areaHeight + this.areaBoarder},
										   {vaultTypeName: 'GolemWorkshop'});
					this.roomAreaList.push(area);
					this.roomAreaGrid[x][y] = area;
				}
				else {
					area = this.createArea(x * this.areaWidth + this.areaBoarder,
									   y * this.areaHeight + this.areaBoarder,
									   (x + 1) * this.areaWidth - this.areaBoarder,
									   (y + 1) * this.areaHeight - this.areaBoarder);
					this.createRoom(area, x, y);
				}
			}
		}
	}
};

// CREATE_ROOM:
// ************************************************************************************************
ArcaneGenerator.prototype.createRoom = function (area, gridX, gridY) {
	var x, y, startX, startY, width, height, roomArea, box;
	
	
	do {
		startX = util.randInt(area.startX, area.endX - 1);
		startY = util.randInt(area.startY, area.endY - 1);
		width = util.randInt(this.minRoomWidth, area.width);
		height = util.randInt(this.minRoomHeight, area.height);
	} while (startX + width > area.endX || startY + height > area.endY);
		
	box = gs.createBox(startX, startY, startX + width, startY + height);
	
	
	
	//roomArea = roomGenerator.roomTypes.Square.generate(box, null, true);
	
	roomArea = roomGenerator.placeRandomRoom(box, null, true);
	gs.getTile(roomArea.centerX, roomArea.centerY).isClosed = true;
	
	this.roomAreaList.push(roomArea);
	this.roomAreaGrid[gridX][gridY] = roomArea;
	
};

// SELECT_CONNECTION_TYPES:
// First select how we will connect each room. Make the decision first so that all portals can all be placed first.
// Then all hallways can be placed in a second pass in such a way as to never cross over a portal.
// ************************************************************************************************
ArcaneGenerator.prototype.selectConnectionTypes = function () {
	var portalPercent = 0.75;
	
	for (let x = 0; x < this.areaGridSize; x += 1) {
		for (let y = 0; y < this.areaGridSize; y += 1) {
			if (this.roomAreaGrid[x][y]) {
				// Connecting left to right:
				if (x < this.areaGridSize - 1 && this.roomAreaGrid[x + 1][y]) {
					if (game.rnd.frac() < portalPercent) {
						this.roomAreaGrid[x][y].connectRight = 'PORTAL';
					}
					else {
						this.roomAreaGrid[x][y].connectRight = 'HALLWAY';
					}
				}
				
				// Connecting top to bottom:
				if (y < this.areaGridSize - 1 && this.roomAreaGrid[x][y + 1]) {
					if (game.rnd.frac() < portalPercent) {
						this.roomAreaGrid[x][y].connectDown = 'PORTAL';
					}
					else {
						this.roomAreaGrid[x][y].connectDown = 'HALLWAY';
					}
				}
			}
		}
	}
};

// PORTAL_CONNECT_ROOMS:
// ************************************************************************************************
ArcaneGenerator.prototype.portalConnectRooms = function () {
	var indexList, object;
	
	for (let x = 0; x < this.areaGridSize; x += 1) {
		for (let y = 0; y < this.areaGridSize; y += 1) {
			// Horizontal Portals:
			if (this.roomAreaGrid[x][y] && this.roomAreaGrid[x][y].connectRight === 'PORTAL') {
				// Portal right:
				indexList = gs.getIndexInBox(this.roomAreaGrid[x][y]);
				indexList = indexList.filter(index => gs.isIndexOpen(index));
				indexList = indexList.sort((a, b) => b.x - a.x);
				indexList = indexList.filter(index => index.x === indexList[0].x);
				indexList = indexList.sort((a, b) => Math.abs(a.y - this.roomAreaGrid[x][y].centerY) - Math.abs(b.y - this.roomAreaGrid[x][y].centerY));
				object = gs.createObject(indexList[0], 'Portal');
				gs.getTile(indexList[0]).isSolidWall = true; // Stops hallways from tunneling over portals
				object.toTileIndex = {x: this.roomAreaGrid[x + 1][y].centerX, y: this.roomAreaGrid[x + 1][y].centerY};
				gs.setTileType(object.toTileIndex, gs.tileTypes.Floor);
				gs.getTile(object.toTileIndex).mustBeFloor = true;


				// Portal left:
				indexList = gs.getIndexInBox(this.roomAreaGrid[x + 1][y]);
				indexList = indexList.filter(index => gs.isIndexOpen(index));
				indexList = indexList.sort((a, b) => a.x - b.x);
				indexList = indexList.filter(index => index.x === indexList[0].x);
				indexList = indexList.sort((a, b) => Math.abs(a.y - this.roomAreaGrid[x + 1][y].centerY) - Math.abs(b.y - this.roomAreaGrid[x + 1][y].centerY));
				object = gs.createObject(indexList[0], 'Portal');
				gs.getTile(indexList[0]).isSolidWall = true; // Stops hallways from tunneling over portals
				object.toTileIndex = {x: this.roomAreaGrid[x][y].centerX, y: this.roomAreaGrid[x][y].centerY};
				gs.setTileType(object.toTileIndex, gs.tileTypes.Floor);
				gs.getTile(object.toTileIndex).mustBeFloor = true;
			}
			
			// Vertical Portals:
			if (this.roomAreaGrid[x][y] && this.roomAreaGrid[x][y].connectDown === 'PORTAL') {
				// Portal down:
				indexList = gs.getIndexInBox(this.roomAreaGrid[x][y]);
				indexList = indexList.filter(index => gs.isIndexOpen(index));
				indexList = indexList.sort((a, b) => b.y - a.y);
				indexList = indexList.filter(index => index.y === indexList[0].y);
				indexList = indexList.sort((a, b) => Math.abs(a.x - this.roomAreaGrid[x][y].centerX) - Math.abs(b.x - this.roomAreaGrid[x][y].centerX));
				object = gs.createObject(indexList[0], 'Portal');
				gs.getTile(indexList[0]).isSolidWall = true; // Stops hallways from tunneling over portals
				object.toTileIndex = {x: this.roomAreaGrid[x][y + 1].centerX, y: this.roomAreaGrid[x][y + 1].centerY};
				gs.setTileType(object.toTileIndex, gs.tileTypes.Floor);
				gs.getTile(object.toTileIndex).mustBeFloor = true;

				// Portal up:
				indexList = gs.getIndexInBox(this.roomAreaGrid[x][y + 1]);
				indexList = indexList.filter(index => gs.isIndexOpen(index));
				indexList = indexList.sort((a, b) => a.y - b.y);
				indexList = indexList.filter(index => index.y === indexList[0].y);
				indexList = indexList.sort((a, b) => Math.abs(a.x - this.roomAreaGrid[x][y + 1].centerX) - Math.abs(b.x - this.roomAreaGrid[x][y + 1].centerX));
				object = gs.createObject(indexList[0], 'Portal');
				gs.getTile(indexList[0]).isSolidWall = true; // Stops hallways from tunneling over portals
				object.toTileIndex = {x: this.roomAreaGrid[x][y].centerX, y: this.roomAreaGrid[x][y].centerY};
				gs.setTileType(object.toTileIndex, gs.tileTypes.Floor);
				gs.getTile(object.toTileIndex).mustBeFloor = true;
			
			}
		}
	}
};

// HALLWAY_CONNECT_ROOMS:
// ************************************************************************************************
ArcaneGenerator.prototype.hallwayConnectRooms = function () {
	for (let x = 0; x < this.areaGridSize; x += 1) {
		for (let y = 0; y < this.areaGridSize; y += 1) {
			// Horizontal Hallways:
			if (this.roomAreaGrid[x][y] && this.roomAreaGrid[x][y].connectRight === 'HALLWAY') {
				this.placeAStarHall(gs.getHallIndex(this.roomAreaGrid[x][y]), gs.getHallIndex(this.roomAreaGrid[x + 1][y]));

			}
			
			// Vertical Hallways:
			if (this.roomAreaGrid[x][y] && this.roomAreaGrid[x][y].connectDown === 'HALLWAY') {
				this.placeAStarHall(gs.getHallIndex(this.roomAreaGrid[x][y]), gs.getHallIndex(this.roomAreaGrid[x][y + 1]));
			}
		}
	}
			
};

// SELECT_MASK:
// ************************************************************************************************
ArcaneGenerator.prototype.selectMask = function () {
	if (this.flags.GolemWorkshop) {
		this.mask = [[1, 1, 1],
					 [1, 1, 1],
					 [1, 1, 1]];
		return;
	}
	if (game.rnd.frac() < 0.25) {
		this.mask = [[1, 1, 1],
					 [1, 1, 1],
					 [1, 1, 1]];
		return;
	}
	
	this.mask = util.randElem([[[1, 1, 1],
									 [1, 0, 1],
									 [1, 1, 1]],
									
									[[1, 1, 1],
									 [1, 0, 0],
									 [1, 1, 1]],
									 
									[[1, 1, 1],
									 [0, 0, 1],
									 [1, 1, 1]],
									
									[[1, 0, 1],
									 [1, 0, 1],
									 [1, 1, 1]],
									
									[[1, 1, 1],
									 [1, 0, 1],
									 [1, 0, 1]],
									
									[[0, 1, 1],
									 [1, 1, 1],
									 [1, 1, 1]],
									
									[[1, 1, 1],
									 [1, 1, 1],
									 [1, 1, 0]],
									
									[[1, 1, 0],
									 [1, 1, 1],
									 [1, 1, 1]],
									
									[[1, 1, 1],
									 [1, 1, 1],
									 [0, 1, 1]],
									
									[[0, 1, 0],
									 [1, 1, 1],
									 [0, 1, 0]],
									
									[[0, 1, 0],
									 [0, 1, 0],
									 [1, 1, 1]],
									
									[[1, 1, 1],
									 [0, 1, 0],
									 [0, 1, 0]],
									
									[[1, 0, 0],
									 [1, 1, 1],
									 [1, 0, 0]],
									
									[[0, 0, 1],
									 [1, 1, 1],
									 [0, 0, 1]]
								   ]);
	
};