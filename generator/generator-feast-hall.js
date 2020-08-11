/*global game, gs, console, Phaser, util*/
/*global BaseGenerator, roomGenerator*/
/*jshint esversion: 6*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function FeastHallGenerator() {}
FeastHallGenerator.prototype = new BaseGenerator();
var feastHallGenerator = new FeastHallGenerator();

// GENERATE:
// ************************************************************************************************
FeastHallGenerator.prototype.generate = function (flags = {}) {
	
	this.flags = flags;
	
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.Wall);
	
	this.placeVault({x: 13, y: 5}, {vaultTypeName: 'FeastHallMain01'});
	
	
	
	// Place Doors:
	this.placeDoors();
	
	return true;
};