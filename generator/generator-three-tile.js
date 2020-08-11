/*global game, gs, console, Phaser, util*/
/*global BaseGenerator*/
/*jshint esversion: 6*/
'use strict';

// DUNGEON_TUNNELS_GENERATOR:
// ************************************************************************************************
function DungeonTunnelsGenerator() {
	this.name = 'DungeonTunnelsGenerator';
}
DungeonTunnelsGenerator.prototype = new BaseGenerator();
var dungeonTunnelsGenerator = new DungeonTunnelsGenerator();

dungeonTunnelsGenerator.middleVaultTypeNames = [
	'ThreeTileMiddle01',
	'ThreeTileMiddle02',
	'ThreeTileMiddle03',
	'ThreeTileMiddle04',
	'ThreeTileMiddle05',
	'ThreeTileMiddle06',
	'ThreeTileMiddle07',
	'ThreeTileMiddle08',
];

dungeonTunnelsGenerator.cornerVaultTypeNames = [
	'ThreeTileCorner01',
	'ThreeTileCorner02',
	'ThreeTileCorner03',
	'ThreeTileCorner04',
	'ThreeTileCorner05',
	'ThreeTileCorner06',
	'ThreeTileCorner07',
	'ThreeTileCorner08',
];

dungeonTunnelsGenerator.edgeVaultTypeNames = [
	'ThreeTileEdge01', 
	'ThreeTileEdge02', 
	'ThreeTileEdge03',
	'ThreeTileEdge04',
	'ThreeTileEdge05',
	'ThreeTileEdge06',
	'ThreeTileEdge07',
	'ThreeTileEdge08',
	
];

// GENERATE:
// ************************************************************************************************
DungeonTunnelsGenerator.prototype.generate = function () {
	var vaultTypeName;
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.CaveWall);
	
	// Top Right Corner:
	vaultTypeName = util.randElem(this.cornerVaultTypeNames);
	this.placeVault({x: 0, y: 0}, {vaultTypeName: vaultTypeName});
	
	// Top Left Corner:
	vaultTypeName = util.randElem(this.cornerVaultTypeNames);
	this.placeVault({x: 26, y: 0}, {vaultTypeName: vaultTypeName, rotate: 90});
	
	// Bottom Right Corner:
	vaultTypeName = util.randElem(this.cornerVaultTypeNames);
	this.placeVault({x: 0, y: 26}, {vaultTypeName: vaultTypeName, rotate: 270});
	
	// Bottom Left Corner:
	vaultTypeName = util.randElem(this.cornerVaultTypeNames);
	this.placeVault({x: 26, y: 26}, {vaultTypeName: vaultTypeName, rotate: 180});
	
	
	// Middle:
	vaultTypeName = util.randElem(this.middleVaultTypeNames);
	this.placeVault({x: 13, y: 13}, {vaultTypeName: vaultTypeName});
	
	// Top Edge:
	vaultTypeName = util.randElem(this.edgeVaultTypeNames);
	this.placeVault({x: 13, y: 0}, {vaultTypeName: vaultTypeName});
	
	// Right Edge:
	vaultTypeName = util.randElem(this.edgeVaultTypeNames);
	this.placeVault({x: 26, y: 13}, {vaultTypeName: vaultTypeName, rotate: 90});
	
	// Bottom Edge:
	vaultTypeName = util.randElem(this.edgeVaultTypeNames);
	this.placeVault({x: 13, y: 26}, {vaultTypeName: vaultTypeName, rotate: 180});
	
	// Left Edge:
	vaultTypeName = util.randElem(this.edgeVaultTypeNames);
	this.placeVault({x: 0, y: 13}, {vaultTypeName: vaultTypeName, rotate: 270});
	
	
	return true;
};

// PIT_PATH_GENERATOR:
// ************************************************************************************************
function PitPathGenerator() {
	this.name = 'PitPathGenerator';
}
PitPathGenerator.prototype = new DungeonTunnelsGenerator();
var pitPathGenerator = new PitPathGenerator();

pitPathGenerator.cornerVaultTypeNames = [
	'PitPathCorner01',
	'PitPathCorner02',
	'PitPathCorner03',
	'PitPathCorner04',
	'PitPathCorner05',
	'PitPathCorner06',
	'PitPathCorner07',
	'PitPathCorner08',
];

pitPathGenerator.edgeVaultTypeNames = [
	'PitPathEdge01',
	'PitPathEdge02',
	'PitPathEdge03',
	'PitPathEdge04',
	'PitPathEdge05',
	'PitPathEdge06',
	'PitPathEdge07',
	'PitPathEdge08',
];

pitPathGenerator.middleVaultTypeNames = [
	'PitPathMiddle01',
	'PitPathMiddle02',
	'PitPathMiddle03',
	'PitPathMiddle04',
	'PitPathMiddle05',
	'PitPathMiddle06',
	'PitPathMiddle07',
	'PitPathMiddle08',
];