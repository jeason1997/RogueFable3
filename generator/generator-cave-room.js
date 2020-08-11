/*global gs, game, console, util*/
/*global BaseGenerator*/
/*global caveGenerator, roomGenerator*/
/*jshint esversion: 6, loopfunc: true, laxbreak: true*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function CaveRoomGenerator() {
	this.name = 'CaveRoomGenerator';
}
CaveRoomGenerator.prototype = new BaseGenerator();
var caveRoomGenerator = new CaveRoomGenerator();

// GENERATE:
// ************************************************************************************************
CaveRoomGenerator.prototype.generate = function (flags) {
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.CaveWall);
	
	// Cave fill:
	this.placeTileCave({x: 4, y: 4}, {x: this.numTilesX - 4, y: this.numTilesY - 4}, gs.tileTypes.CaveWall, this.chooseMask());
	this.mainCaveArea = this.createArea(0, 0, this.numTilesX, this.numTilesY);
	this.mainCaveArea.type = 'Cave';
	
	this.roomAreaList = [];
	
	this.placeRooms();
	
	this.connectRooms();
	
	this.placeDoors();
	
	this.roomAreaList.push(this.mainCaveArea);
	gs.areaList = this.roomAreaList;
	
	return true;
};

// PLACE_ROOMS:
// ************************************************************************************************
CaveRoomGenerator.prototype.placeRooms = function () {
	var tileIndex, roomArea, box, area, indexList, width, height;
	
	for (let i = 0; i < 20; i += 1) {
		width = util.randInt(8, 16);
		height = util.randInt(8, 16);
		
		tileIndex = this.findRoomLocation(width, height);
	
		if (tileIndex) {
			box = gs.createBox(tileIndex.x, tileIndex.y, tileIndex.x + width, tileIndex.y + height);

			/*
			this.placeTileSquare(box.startTileIndex, box.endTileIndex, gs.tileTypes.Wall);
			this.placeTileSquare({x: box.startX + 1, y: box.startY + 1}, {x: box.endX - 1, y: box.endY - 1}, gs.tileTypes.Floor);
			*/
			
			area = roomGenerator.placeRandomRoom(box);
			
			// Find nearest tileIndex in the cave:
			indexList = gs.getAllIndex();
			indexList = indexList.filter(index => gs.isHallIndex(index));
			indexList = indexList.filter(index => gs.getArea(index) === this.mainCaveArea);
			indexList = indexList.sort((a, b) => util.distance(a, area.centerTileIndex) - util.distance(b, area.centerTileIndex));
			
			this.placeAStarHall(gs.getHallIndex(area), indexList[0]);
			
			this.roomAreaList.push(area);
			
			if (this.roomAreaList.length > 5) {
				break;
			}
		}
	}
};


// CHOOSE_MASK:
// *****************************************************************************
CaveRoomGenerator.prototype.chooseMask = function () {

	return util.randElem(
		[[[1, 1, 0, 0],
		[1, 1, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]],

	   [[0, 0, 1, 1],
		[0, 0, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0]],

	   [[0, 0, 0, 0],
		[0, 0, 0, 0],
		[1, 1, 0, 0],
		[1, 1, 0, 0]],

	   [[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 1, 1],
		[0, 0, 1, 1]],

	   [[1, 0, 0, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[1, 0, 0, 1]],

	   [[0, 0, 1, 0],
		[1, 0, 0, 0],
		[0, 0, 0, 1],
		[0, 1, 0, 0]],

	   [[0, 0, 0, 0],
		[0, 1, 1, 0],
		[0, 1, 1, 0],
		[0, 0, 0, 0]]

	  ]);
	
};

// FIND_ROOM_LOCATION:
// ************************************************************************************************
CaveRoomGenerator.prototype.findRoomLocation = function (width, height) {
	var validList = [], indexList, numCaveWalls, numCaveFloors, numFloors;
	
	for (let x = 0; x < this.numTilesX - width - 1; x += 1) {
		for (let y = 0; y < this.numTilesY - height - 1; y += 1) {
			indexList = gs.getIndexInBox(x, y, x + width, y + height);
			numCaveWalls = indexList.filter(index => gs.getTile(index).type.name === 'CaveWall').length;
			numCaveFloors = indexList.filter(index => gs.getTile(index).type.name === 'CaveFloor').length;
			numFloors = indexList.filter(index => gs.getTile(index).type.name === 'Floor').length;
			
			if (indexList.length === width * height
				&& numCaveWalls > width * height / 2 
				&& numCaveFloors > 1 
				&& numCaveFloors < Math.min(width, height) 
				&& numFloors === 0) {
				
				
				
				validList.push({x: x, y: y});
			}
		}
	}
	
	return validList.length > 0 ? util.randElem(validList) : null;
};

// CONNECT_ROOMS:
// ************************************************************************************************
CaveRoomGenerator.prototype.connectRooms = function () {
	var i;
	
	if (this.roomAreaList.length > 1) {
		for (let i = 0; i < this.roomAreaList.length - 1; i += 1) {
			this.placeAStarHall(gs.getHallIndex(this.roomAreaList[i]), gs.getHallIndex(this.roomAreaList[i + 1]), 1);
		}		
	}

};