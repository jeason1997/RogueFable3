/*global game, gs, console, Phaser, util*/
/*global BaseGenerator*/
/*jshint laxbreak: true*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function CryptGenerator() {
	this.name = 'CryptGenerator';
}
CryptGenerator.prototype = new BaseGenerator();
var cryptGenerator = new CryptGenerator();

// GENERATE:
// ************************************************************************************************
CryptGenerator.prototype.generate = function (flags) {
	var x, y, i, baseArea;

	this.flags = flags || {};
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.Wall);
	this.placeTileSquare({x: 1, y: 1}, {x: this.numTilesX - 1, y: this.numTilesY - 1}, gs.tileTypes.Floor);
	
	// The crypt is divided into a grid into which rooms can be placed. Unlike the rogue generator the tiles between rooms are floors rather than walls.
	// The crypt therefore looks like a huge open space with individual 'crypts' placed within it. There is a boarder around each grid cell so that
	// movement is never restricted by the crypts. In this way we can technically place all sorts of interesting structures in a cell if we want.
	this.areaGridSize = 3;
	this.areaWidth = Math.floor(this.numTilesX / this.areaGridSize);
	this.areaHeight = Math.floor(this.numTilesY / this.areaGridSize);
	this.areaBoarder = 1;
	this.minRoomWidth = 6;
	this.minRoomHeight = 6;
	
	this.roomAreaList = [];
	this.createRooms();
	
	this.roomAreaList.forEach(function (area) {
		this.placeSideRoomDoor(area);
		if (area.width * area.height > 25) {
			area.type = 'Crypt';
		}
	}, this);
	
	// Room List:
	gs.areaList = this.roomAreaList;
	
	return true;
};

// CREATE_ROOMS:
// ************************************************************************************************
CryptGenerator.prototype.createRooms = function () {
	var x, y, area;
	
	for (x = 0; x < this.areaGridSize; x += 1) {
		for (y = 0; y < this.areaGridSize; y += 1) {
			area = {startX: x * this.areaWidth,
				    startY: y * this.areaHeight,
				    endX: (x + 1) * this.areaWidth - this.areaBoarder,
				    endY: (y + 1) * this.areaHeight - this.areaBoarder,
				   };
			area.width = area.endX - area.startX;
			area.height = area.endY - area.startY;
			this.createRoom(area, x, y);
		}
	}
};

// CREATE_ROOM:
// ************************************************************************************************
CryptGenerator.prototype.createRoom = function (area, gridX, gridY) {
	var rand = util.randInt(0, 5);
	
	if (rand === 0 || rand === 1) {
		this.fillGridCell(area, gridX, gridY);
	}
	else if (rand === 2) {
		this.bigSquareRoom(area, gridX, gridY);
	}
	else if (rand >= 3) {
		this.randSquareRoom(area, gridX, gridY);
	}
	
	
};

CryptGenerator.prototype.fillGridCell = function (area, gridX, gridY) {
	// Corners:
	if ((gridX === 0 && gridY === 0) 
	|| (gridX === 0 && gridY === this.areaGridSize - 1)
	|| (gridX === this.areaGridSize - 1 && gridY === 0)
	|| (gridX === this.areaGridSize - 1 && gridY === this.areaGridSize - 1)) {
		this.placeTileSquare({x: area.startX, y: area.startY}, {x: area.endX + 1, y: area.endY + 1}, gs.tileTypes.Wall);
	}
	// Center:
	else if (gridX === 1 && gridY === 1) {
		this.placeTileSquare({x: area.startX + 1, y: area.startY + 1}, {x: area.endX, y: area.endY}, gs.tileTypes.Wall);
	}
	// Left and Right Edges:
	else if (gridY === 1) {
		this.placeTileSquare({x: area.startX, y: area.startY + 3},
							 {x: area.endX + 1, y:area.endY - 2},
							 gs.tileTypes.Wall);
	}
	// Top and Bottom Edges:
	else if (gridX === 1) {
		this.placeTileSquare({x: area.startX + 3, y: area.startY},
							 {x: area.endX - 2, y:area.endY + 1},
							 gs.tileTypes.Wall);
	}
	
};

CryptGenerator.prototype.bigSquareRoom = function (area, gridX, gridY) {
	var roomArea;
	
	this.placeTileSquare({x: area.startX + 1, y: area.startY + 1}, {x: area.endX, y: area.endY}, gs.tileTypes.Wall);
	this.placeTileSquare({x: area.startX + 2, y: area.startY + 2}, {x: area.endX - 1, y: area.endY - 1}, gs.tileTypes.Floor);
	
	roomArea = this.createArea(area.startX + 1, area.startY + 1, area.endX - 1, area.endY - 1);
	roomArea.type = 'SideRoom';
	this.roomAreaList.push(roomArea);
};

CryptGenerator.prototype.randSquareRoom = function (area, gridX, gridY) {
	var x, y, startX, startY, width, height, roomArea;
	
	do {
		startX = util.randInt(area.startX, area.endX - 1);
		startY = util.randInt(area.startY, area.endY - 1);
		width = util.randInt(this.minRoomWidth, area.width);
		height = util.randInt(this.minRoomHeight, area.height);
	} while (startX + width >= area.endX || startY + height >= area.endY);
	
	this.placeTileSquare({x: startX, y: startY}, {x: startX + width, y: startY + height}, gs.tileTypes.Wall);
	this.placeTileSquare({x: startX + 1, y: startY + 1}, {x: startX + width - 1, y: startY + height - 1}, gs.tileTypes.Floor);
	
	roomArea = this.createArea(startX + 1, startY + 1, startX + width - 1, startY + height - 1);
	roomArea.type = 'SideRoom';
	this.roomAreaList.push(roomArea);
};