/*global game, gs, console, Phaser, util*/
/*global BaseGenerator, NUM_TILES_X, NUM_TILES_Y*/
/*jshint esversion: 6, loopfunc: true*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function SwampGenerator() {
	this.name = 'SwampGenerator';
}
SwampGenerator.prototype = new BaseGenerator();
var swampGenerator = new SwampGenerator();

// GENERATE:
// ************************************************************************************************
SwampGenerator.prototype.generate = function (flags = {}) {
	var area;
	
	this.flags = flags;
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.CaveWall);
	this.roomAreaList = [];
	
	// Cave fill:
	this.placeTileCave({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.CaveWall, this.chooseMask());
	
	// Water:
	this.createWater();
	
	// Folliage:
	this.createFolliage();
	
    // Area:
	area = this.createArea(0, 0, this.numTilesX, this.numTilesY);
	area.type = 'Swamp';
	this.roomAreaList.push(area);

	gs.areaList = this.roomAreaList;
	
	return true;
};

// CREATE_WATER:
// *****************************************************************************
SwampGenerator.prototype.createWater = function () {
	var waterDistance = 2.5,
		indexList;
	
	// Initial fill (distance to wall):
	gs.getAllIndex().forEach(function (tileIndex) {
		if (gs.isPassable(tileIndex) && this.distanceToTile(tileIndex, index => !gs.isPassable(index)) >= waterDistance) {
			gs.setTileType(tileIndex, gs.tileTypes.Water);
		}
	}, this);
	
	// Flooding individual water tiles:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => gs.getTile(index).type.name === 'Water');
	indexList = indexList.filter(index => gs.getIndexListCardinalAdjacent(index).reduce((pv, nv) => pv + (gs.getTile(nv).type.name === 'Water' ? 1 : 0), 0) < 2);
	
	indexList.forEach(function (index) {
		gs.getIndexInRadius(index, 2.5).forEach(function (idx) {
			if (gs.isPassable(idx)) {
				gs.setTileType(idx, gs.tileTypes.Water);
			}
		}, this);
		
	}, this);
};

// CREATE_FOLLIAGE:
SwampGenerator.prototype.createFolliage = function () {
	var indexList, num, i, tileIndex;
	
	// Tiki Torches:
	num = util.randInt(1, 12);
	for (i = 0; i < num; i += 1) {
		tileIndex = gs.getWideOpenIndexInLevel();
		if (tileIndex) {
			gs.createObject(tileIndex, 'TikiTorch');
		}
	}
	
	// Water Stalagemite:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => gs.getTile(index).type.name === 'Water');
	gs.randSubset(indexList, 12).forEach(function (index) {
		gs.createObject(index, 'WaterStalagmite');
	}, this);
	
	// Water Tree:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => gs.getTile(index).type.name === 'Water');
	indexList = indexList.filter(index => gs.isPassable(index));
	gs.randSubset(indexList, 12).forEach(function (index) {
		gs.createObject(index, 'WaterTree');
	}, this);
	
	// Trees:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => gs.getTile(index).type.name === 'CaveFloor');
	indexList = indexList.filter(index => gs.isWideOpen(index));
	gs.randSubset(indexList, Math.min(12, indexList.length)).forEach(function (index) {
		gs.createObject(index, 'Tree');
	}, this);
	
	
	// Water grass:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => gs.isIndexOpen(index));
	indexList = indexList.filter(index => gs.getIndexListCardinalAdjacent(index).reduce((pv, nv) => pv + (gs.getTile(nv).type.name === 'Water' ? 1 : 0), 0) >= 1);
	indexList.forEach(function (tileIndex) {
		if (util.frac() <= 0.1) {
			gs.createVinePatch(tileIndex, util.randInt(1, 2), 'LongGrass');
		}
	}, this);
	
	
};



// CHOOSE_MASK:
// *****************************************************************************
SwampGenerator.prototype.chooseMask = function () {
	
	
	
	if (util.frac() < 0.5) {
		return [[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0]];
	} 
	else {
		return util.randElem([
			[[1, 1, 0, 0],
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
	}
	
};


