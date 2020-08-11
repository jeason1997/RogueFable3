/*global game, util, gs, console, Phaser*/
/*global BaseGenerator*/
/*global roomGenerator*/
/*jshint esversion: 6, laxbreak: true, loopfunc: true*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function RogueGenerator() {
	this.name = 'RogueGenerator';
}
RogueGenerator.prototype = new BaseGenerator();
var rogueGenerator = new RogueGenerator();

// GENERATE:
// ************************************************************************************************
RogueGenerator.prototype.generate = function (flags) {
	var x, y;
	
	this.flags = flags || {};

	
	// Properties:
	this.areaGridSize = 3;
	this.areaWidth = Math.floor(this.numTilesX / this.areaGridSize);
	this.areaHeight = Math.floor(this.numTilesY / this.areaGridSize);
	this.minRoomWidth = util.randInt(4, this.areaWidth - 4);
	this.minRoomHeight = util.randInt(4, this.areaHeight - 4);
	this.MAX_HALL_WIDTH = util.randInt(1, 4);
	
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
	//this.connectRooms();
	
	this.superConnectRooms();
	
	this.fillBorderWall();
	
	// Place Doors:
	this.placeDoors();
	
	// Room List:
	gs.areaList = this.roomAreaList;
	
	return true;
};

// CREATE_ROOMS:
// ************************************************************************************************
RogueGenerator.prototype.createRooms = function () {
	var area, box;
	
	for (let x = 0; x < this.areaGridSize; x += 1) {
		for (let y = 0; y < this.areaGridSize; y += 1) {
			if (this.mask[x][y]) {
				// Bounding box for the room:
				box = gs.createBox(x * this.areaWidth, y * this.areaHeight, (x + 1) * this.areaWidth,  (y + 1) * this.areaHeight);
				
				this.createRoom(box, x, y);
			}
		}
	}
};

// CREATE_ROOM:
// ************************************************************************************************
RogueGenerator.prototype.createRoom = function (box, gridX, gridY) {
	var roomArea;
	
	roomArea = roomGenerator.placeRandomRoom(box);
	//roomArea.type = 'LargeRoom';
	
	this.roomAreaList.push(roomArea);
	this.roomAreaGrid[gridX][gridY] = roomArea;
	
};

// CONNECT_ROOMS:
// ************************************************************************************************
RogueGenerator.prototype.connectRooms = function () {
	var x, y;
	// Horizontal Halls:
	for (x = 0; x < this.areaGridSize - 1; x += 1) {
		for (y = 0; y < this.areaGridSize; y += 1) {
			if (this.roomAreaGrid[x][y] && this.roomAreaGrid[x + 1][y]) {
				this.placeAStarHall(gs.getHallIndex(this.roomAreaGrid[x][y]), gs.getHallIndex(this.roomAreaGrid[x + 1][y]));
			}
		}
	}
	
	// Vertical Halls:
	for (x = 0; x < this.areaGridSize; x += 1) {
		for (y = 0; y < this.areaGridSize - 1; y += 1) {
			if (this.roomAreaGrid[x][y] && this.roomAreaGrid[x][y + 1]) {
				this.placeAStarHall(gs.getHallIndex(this.roomAreaGrid[x][y]), gs.getHallIndex(this.roomAreaGrid[x][y + 1]));
			}
		}
	}
};

// SUPER_CONNECT_ROOMS:
// ************************************************************************************************
RogueGenerator.prototype.superConnectRooms = function () {	
	this.connectRooms();
	
	for (let i = 0; i < this.roomAreaList.length; i += 1) {
		for (let j = i + 1; j < this.roomAreaList.length; j += 1) {
			if (game.rnd.frac() <= 0.05 * gs.dangerLevel()) {
				this.placeAStarHall(gs.getHallIndex(this.roomAreaList[i]), gs.getHallIndex(this.roomAreaList[j]), 1);
			}
		}
	}
	
	this.trimWalls();
};



// SELECT_MASK:
// ************************************************************************************************
RogueGenerator.prototype.selectMask = function () {
	if (this.flags.PitTurret) {
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