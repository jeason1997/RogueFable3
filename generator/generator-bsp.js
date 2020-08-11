/*global game, gs, console, Phaser, util*/
/*global BaseGenerator, roomGenerator*/
/*jshint laxbreak: true*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function BSPGenerator() {
	this.name = 'BSPGenerator';
}
BSPGenerator.prototype = new BaseGenerator();
var bspGenerator = new BSPGenerator();

// GENERATE:
// ************************************************************************************************
BSPGenerator.prototype.generate = function (flags) {
	var x, y, i, baseArea;

	this.flags = flags || {};
	
	// Properties:
	//this.PARTITION_FACTOR = [1.0, 1.0, 1.0, 0.70, 0.25, 0];
	this.PARTITION_FACTOR = [1.0, 0.80, 0.80, 0.50, 0.25, 0];
	this.ROOM_MARGIN = 1;
	this.MAX_HALL_WIDTH = util.randInt(1, 4);
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.Wall);
	
	// Partition Map:
	this.leafAreaList = [];
	baseArea = this.createArea(0, 0, this.numTilesX, this.numTilesY);
	baseArea.depth = 0;
	this.partitionArea(baseArea);
	this.removeAllAreaFlags();
	
	// Place Rooms:
	this.roomAreaList = [];
	this.placeRooms();
	
	
	// Connect Rooms:
	this.connectAreas(baseArea);
	
	// Place Doors:
	this.placeDoors();
	
	//this.fillBorderWall();
	this.cleanAreaTiles();
	
	// Room List:
	gs.areaList = this.roomAreaList;
	
	return true;
};

// PARTITION_AREA:
// The result of this function is that areaList will be populated with all the leaf areas.
// A binary tree has also been constructed starting from rootArea whose leaves are the leaf areas.
// *************************************************************************
BSPGenerator.prototype.partitionArea = function (area) {
	var partitionVertical, partitionHorizontal;
	
	partitionVertical = function () {
		// Create sub areas:
		area.subArea1 = this.createArea(area.startX, area.startY, area.centerX, area.endY);
		area.subArea1.depth = area.depth + 1;
		this.partitionArea(area.subArea1);
		
		area.subArea2 = this.createArea(area.centerX, area.startY, area.endX, area.endY);
		area.subArea2.depth = area.depth + 1;
		this.partitionArea(area.subArea2);
	}.bind(this);
	
	partitionHorizontal = function () {
		// Create sub areas:
		area.subArea1 = this.createArea(area.startX, area.startY, area.endX, area.centerY);
		area.subArea1.depth = area.depth + 1;
		this.partitionArea(area.subArea1);
		
		area.subArea2 = this.createArea(area.startX, area.centerY, area.endX, area.endY);
		area.subArea2.depth = area.depth + 1;
		this.partitionArea(area.subArea2);
	}.bind(this);
	
	// BASE CASE (minimum area size reached):
	if (game.rnd.frac() > this.PARTITION_FACTOR[area.depth]) {
		area.subArea1 = null;
		area.subArea2 = null;
		area.isLeaf = true;
		this.leafAreaList.push(area);

	
	} 
	// RANDOM_PARTITION:
	else if (area.width === area.height) {
		if (game.rnd.frac() <= 0.5) {
			partitionVertical();
		}
		else {
			partitionHorizontal();
		}
	}
	// PARTITION VERTICALLY:
	else if (area.width > area.height) {
		partitionVertical();
	} 
	// PARTITION HORIZONTALLY:
	else {
		partitionHorizontal();
	}
};

// PLACE_ROOMS:
// *************************************************************************
BSPGenerator.prototype.placeRooms = function () {
	var roomArea;
	
	this.leafAreaList.forEach(function (area) {
		if (area.depth > 2) {
			this.placeRoom(area);
		} else {
			this.placeTileCave({x: area.startX + 1,
								y: area.startY + 1},
							   {x: area.endX - 1,
								y: area.endY - 1},
							   gs.tileTypes.CaveWall);
			
			roomArea = this.createArea(area.startX, area.startY, area.endX, area.endY);
			roomArea.type = 'Cave';
			this.roomAreaList.push(roomArea);
		}
	}, this);
};

// PLACE_ROOM:
// *****************************************************************************
BSPGenerator.prototype.placeRoom = function (area) {
	/*
    var minRoomWidth = area.width / 2 + 1,
        minRoomHeight = area.height / 2 + 1,
        startX,
        startY,
        endX,
        endY,
		roomArea;
	
	// Get Room Dimensions:
    startX = util.randInt(area.startX + this.ROOM_MARGIN, area.endX - minRoomWidth - this.ROOM_MARGIN);
    startY = util.randInt(area.startY + this.ROOM_MARGIN, area.endY - minRoomHeight - this.ROOM_MARGIN);
    endX = util.randInt(startX + minRoomWidth, area.endX - this.ROOM_MARGIN);
    endY = util.randInt(startY + minRoomHeight, area.endY - this.ROOM_MARGIN);
	
	// Place Room Tiles:
	this.placeTileSquare({x: startX - 1, y: startY - 1}, {x: endX + 1, y: endY + 1}, gs.tileTypes.Wall);
	this.placeTileSquare({x: startX, y: startY}, {x: endX, y: endY}, gs.tileTypes.Floor);
	*/
	
	var roomArea;
	roomArea = roomGenerator.placeRandomRoom(area);
	roomArea.type = 'LargeRoom';
	this.roomAreaList.push(roomArea);
};

// CONNECT_AREA:
// *************************************************************************
BSPGenerator.prototype.connectAreas = function (area) {
	// Base case (area is leaf):
	if (area.isLeaf) {
		return;
	} 
	else {
		this.connectAreas(area.subArea1);
		this.connectAreas(area.subArea2);
	
		// DEPTH 0:
		if (area.depth === 0) {
			this.placeAStarHall(gs.getHallIndex(area.subArea1), gs.getHallIndex(area.subArea2));
			this.placeAStarHall(gs.getHallIndex(area.subArea1), gs.getHallIndex(area.subArea2));

			if (game.rnd.frac() < 0.5) {
				this.placeAStarHall(gs.getHallIndex(area.subArea1), gs.getHallIndex(area.subArea2));
			}
		} 
		// DEPTH 1:
		else if (area.depth === 1) {
			this.placeAStarHall(gs.getHallIndex(area.subArea1), gs.getHallIndex(area.subArea2));
			this.placeAStarHall(gs.getHallIndex(area.subArea1), gs.getHallIndex(area.subArea2));
		} 
		// DEPTH 2:
		else if (area.depth === 2) {
			this.placeAStarHall(gs.getHallIndex(area.subArea1), gs.getHallIndex(area.subArea2));

			if (game.rnd.frac() < 0.5) {
				this.placeAStarHall(gs.getHallIndex(area.subArea1), gs.getHallIndex(area.subArea2));
			}
		} 
		// DEPTH 3+:
		else {
			this.placeAStarHall(gs.getHallIndex(area.subArea1), gs.getOpenIndexInBox(area.subArea2));
		}
		
	}
};



