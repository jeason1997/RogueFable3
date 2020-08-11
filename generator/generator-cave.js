/*global game, gs, console, Phaser, util*/
/*global BaseGenerator*/
/*jshint esversion: 6, loopfunc: true*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function CaveGenerator() {
	this.name = 'CaveGenerator';
}
CaveGenerator.prototype = new BaseGenerator();
var caveGenerator = new CaveGenerator();

// GENERATE:
// ************************************************************************************************
CaveGenerator.prototype.generate = function (flags = {}) {
	this.flags = flags;
	this.roomAreaList = [];
	this.hasPlacedVault = false;
	
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.CaveWall);
	
	if (util.frac() < 0.25) {
		this.placeVaults();
	}
	
	// Cave fill:
	this.placeTileCave({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.CaveWall, this.chooseMask(), this.tileMask);
	
	
	// Make narrow tunnels:
	if (game.rnd.frac() < 0.5 && gs.zoneName !== 'TheSunlessDesert' && !flags.neverNarrow) {
		this.makeNarrowTunnels();
	}
	
    
    // Area:
	this.mainCaveArea = this.createArea(0, 0, this.numTilesX, this.numTilesY);
	this.mainCaveArea.type = 'Cave';
	this.roomAreaList.push(this.mainCaveArea);
	gs.areaList = this.roomAreaList;
	
	return true;
};

// PLACE_VAULTS:
// ************************************************************************************************
CaveGenerator.prototype.placeVaults = function () {
	var area, vaultTypeList, vaultType, tileIndex;
	
	vaultTypeList = gs.vaultTypeList.filter(type => gs.inArray(gs.zoneName, type.tags) && type.placementType === 'FloatingOpenCave');
	vaultTypeList = vaultTypeList.filter(type => !type.isUnique || !gs.inArray(type.name, gs.previouslySpawnedVaults));
	
	if (vaultTypeList.length > 0) {
		vaultType = util.randElem(vaultTypeList);
		tileIndex = {x: util.randInt(1, this.numTilesX - vaultType.width - 1),
					 y: util.randInt(1, this.numTilesY - vaultType.height - 1)};
									 
									 
		area = this.placeVault(tileIndex, {vaultTypeName: vaultType.name});
		
		// Flagging super floor:
		this.tileMask = gs.create2DArray(this.numTilesX, this.numTilesY, function (x, y) {
			if (util.isInBox({x: x, y: y}, area)) {
				return 1;
			}
			else {
				return 0;
			}
		}, this);
		
		this.hasPlacedVault = true;
	}
	else {
		this.hasPlacedVault = false;
	}
};


// CHOOSE_MASK:
// ************************************************************************************************
CaveGenerator.prototype.chooseMask = function () {
	if (game.rnd.frac() < 0.3 || this.hasPlacedVault) {
		return [[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0]];
	} 
	else {
		return util.randElem([[[1, 1, 0, 0],
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

// MAKE_NARROW_TUNNELS:
// ************************************************************************************************
CaveGenerator.prototype.makeNarrowTunnels = function () {
    var x, y, markedTiles, tileIndices;
    for (x = 0; x < this.numTilesX; x += 1) {
		for (y = 0; y < this.numTilesY; y += 1) {
			if (gs.isPassable(x, y) && this.clearToWall(x, y, 3) && !gs.getTile(x, y).isClosed) {
				gs.getTile(x, y).clearToWall = true;
				//gs.getTile(x, y).color = 'rgb(255,0,0)';
			}
		}
	}
    
    markedTiles = gs.create2DArray(this.numTilesX, this.numTilesY, index => false);

	
	for (x = 0; x < this.numTilesX; x += 1) {
		for (y = 0; y < this.numTilesY; y += 1) {
			if (gs.getTile(x, y).clearToWall && !markedTiles[x][y]) {
				tileIndices = gs.getIndexInFlood({x: x, y: y}, function (index) {
					return gs.getTile(index).clearToWall && !markedTiles[index.x][index.y];
				});
				
				if (tileIndices.length < 100 && tileIndices.length > 2) {
					tileIndices.forEach(function(index) {
						gs.setTileType(index, gs.tileTypes.CaveWall);
					}, this);
				}
				
				tileIndices.forEach(function(index) {
					markedTiles[index.x][index.y] = true;
				}, this);
			}
		}
	}
};
