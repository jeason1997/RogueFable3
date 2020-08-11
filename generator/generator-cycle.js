/*global game, gs, console, Phaser, util*/
/*global BaseGenerator, roomGenerator*/
/*jshint esversion: 6*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function CycleGenerator() {
	this.name = 'CycleGenerator';
}
CycleGenerator.prototype = new BaseGenerator();
var cycleGenerator = new CycleGenerator();

// GENERATE:
// ************************************************************************************************
CycleGenerator.prototype.generate = function (flags = {}) {
	
	this.flags = flags;
	
	this.DUNGEON_PITS = util.frac() < 0.5;
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.Wall);
	this.roomAreaList = [];
	
	// Generation:
	this.selectRooms();
	this.createRooms();
	this.superConnectRooms();
	//this.replaceIslands(gs.createBox(0, 0, this.numTilesX, this.numTilesY));
	
	
	this.cleanAreaTiles();
	
	// Place Doors:
	this.placeDoors();
	
	gs.areaList = this.roomAreaList;
	
	return true;
};

// SELECT_ROOMS:
// ************************************************************************************************
CycleGenerator.prototype.selectRooms = function (vaultList) {
	this.roomDesc = [];
	
	// Can pass vaultList to force spawning of vaults:
	if (this.flags.includeVaults) {
		this.flags.includeVaults.forEach(function (name) {
			this.roomDesc.push({vault: name});
		}, this);
	}
	
	if (game.rnd.frac() < 0.25) {
		this.roomDesc.push({width: 16, height: 16, type: 'Cave'});
	}
	
	this.roomDesc.push({width: 16, height: 16});
	
	if (game.rnd.frac() < 0.5) {
		this.roomDesc.push({width: 16, height: 16});
	}
	else {
		this.roomDesc.push({width: 12, height: 12});
	}
	
	this.roomDesc.push({width: 12, height: 12});
	this.roomDesc.push({width: 12, height: 12});
	
	if (game.rnd.frac() < 0.5) {
		this.roomDesc.push({width: 12, height: 12});
	}
	else {
		this.roomDesc.push({width: 8, height: 8});
	}
	
	//this.roomDesc.push({width: 1, height: 1});
	this.roomDesc.push({width: 8, height: 8});
	this.roomDesc.push({width: 8, height: 8});
	this.roomDesc.push({width: 8, height: 8});
	this.roomDesc.push({width: 8, height: 8});
	
	
};

// CREATE_ROOMS:
// ************************************************************************************************
CycleGenerator.prototype.createRooms = function () {
	var i;
	
	for (i = 0; i < this.roomDesc.length; i += 1) {
		this.createRoom(this.roomDesc[i]);
	}
};

// CREATE_ROOM:
// ************************************************************************************************
CycleGenerator.prototype.createRoom = function (roomDesc) {
	var tileIndex, width, height, box, area;
	
	if (roomDesc.vault) {
		width = gs.vaultTypes[roomDesc.vault].width;
		height = gs.vaultTypes[roomDesc.vault].height;
	}
	else {
		width = roomDesc.width;
		height = roomDesc.height;
	}
	
	tileIndex = this.getOpenBox(width, height);
	if (tileIndex) {
		box = gs.createBox(tileIndex.x, tileIndex.y, tileIndex.x + width, tileIndex.y + height);
		
		// Vault:
		if (roomDesc.vault) {
			area = this.placeVault(box.startTileIndex, {vaultTypeName: roomDesc.vault, rotate: false, reflect: false});
		}
		// Cave:
		else if (roomDesc.type === 'Cave') {
			this.placeTileCave(box.startTileIndex, box.endTileIndex, gs.tileTypes.CaveWall);
			area = this.createArea(box.startX, box.startY, box.endX, box.endY);
			area.type = 'Cave';
		}
		// Room:
		else {
			if (box.width > 1 && box.height > 1) {
				area = roomGenerator.placeRandomRoom(box);
				area.type = 'LargeRoom';
			}
			else {
				this.placeTileSquare(box.startTileIndex, box.endTileIndex, gs.tileTypes.Floor);
				area = this.createArea(box.startX, box.startY, box.endX, box.endY);
				area.type = 'HallPoint';
			}
			
		}
		
		this.roomAreaList.push(area);
	}
};



// CONNECT_ROOMS:
// ************************************************************************************************
CycleGenerator.prototype.connectRooms = function () {
	var i;
	
	for (i = 0; i < this.roomAreaList.length - 1; i += 1) {
		this.placeAStarHall(gs.getHallIndex(this.roomAreaList[i]), gs.getHallIndex(this.roomAreaList[i + 1]));
	}
	
	this.placeAStarHall(gs.getHallIndex(this.roomAreaList[0]), gs.getHallIndex(this.roomAreaList[this.roomAreaList.length - 1]));
};

// SUPER_CONNECT_ROOMS:
// ************************************************************************************************
CycleGenerator.prototype.superConnectRooms = function () {
	this.connectRooms();
	
	for (let i = 0; i < this.roomAreaList.length; i += 1) {
		for (let j = i + 1; j < this.roomAreaList.length; j += 1) {
			if (game.rnd.frac() <= 0.025 * gs.dangerLevel()) {
				this.placeAStarHall(gs.getHallIndex(this.roomAreaList[i]), gs.getHallIndex(this.roomAreaList[j]), 1);
			}
		}
	}
	
	this.trimWalls();
};



// CONSTRUCTOR:
// ************************************************************************************************
function CenterGenerator() {}
CenterGenerator.prototype = new CycleGenerator();

// GENERATE:
// ************************************************************************************************
CenterGenerator.prototype.generate = function (numTilesX, numTilesY, vaultList = []) {
	var x, y;
	gs.numTilesX = this.numTilesX = numTilesX;
	gs.numTilesY = this.numTilesY = numTilesY;
	
	this.DUNGEON_PITS = util.frac() < 0.5;
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.Wall);
	this.roomAreaList = [];
	
	// Generation:
	this.placeCenterRoom();
	this.selectRooms(vaultList);
	this.createRooms();
	this.connectRooms();
	//this.replaceIslands(gs.createBox(0, 0, this.numTilesX, this.numTilesY));
	
	// Place Doors:
	this.placeDoors();
	
	gs.areaList = this.roomAreaList;
	
	return true;
};

// PLACE_CENTER_ROOM:
// ************************************************************************************************
CenterGenerator.prototype.placeCenterRoom = function () {
	var box,
		vaultName = 'Center01',
		vaultDesc = gs.vaultTypes[vaultName];
	
	box = gs.createBox((this.numTilesX - vaultDesc.width) / 2,
					   (this.numTilesX - vaultDesc.height) / 2,
					   (this.numTilesX - vaultDesc.width) / 2 + vaultDesc.width,
					   (this.numTilesX - vaultDesc.height) / 2 + vaultDesc.height);
				
	
	this.centerRoom = this.placeVault(box, {fileName: 'Center01', rotate: false, reflect: false});
};

// CONNECT_ROOMS:
// ************************************************************************************************
CenterGenerator.prototype.connectRooms = function () {
	var i;
	
	for (i = 0; i < this.roomAreaList.length - 1; i += 1) {
		this.placeAStarHall(gs.getHallIndex(this.roomAreaList[i]), gs.getHallIndex(this.roomAreaList[i + 1]));
	}
	
	this.placeAStarHall(gs.getHallIndex(this.roomAreaList[0]), gs.getHallIndex(this.roomAreaList[this.roomAreaList.length - 1]));
};