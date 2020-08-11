/*global game, gs, console, Phaser, util*/
/*global BaseGenerator, featureGenerator*/
/*jshint esversion: 6, loopfunc: true*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function LairGenerator() {
	this.name = 'LairGenerator';
}
LairGenerator.prototype = new BaseGenerator();
var lairGenerator = new LairGenerator();

// GENERATE:
// ************************************************************************************************
LairGenerator.prototype.generate = function (flags) {
	var area;
	
	flags = flags || {};
	this.flags = flags;
	
	this.roomAreaList = [];
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.CaveWall);
	
	// Cave fill:
	this.placeTileCave({x: 11, y: 11}, {x: this.numTilesX - 11, y: this.numTilesY - 11}, gs.tileTypes.CaveWall);
	
    // Area:
	this.mainCaveArea = this.createArea(0, 0, this.numTilesX, this.numTilesY);
	this.mainCaveArea.type = 'Cave';
	this.roomAreaList.push(this.mainCaveArea);
	
	// Lairs:
	for (let i = 0; i < 4; i += 1) {
		if (featureGenerator.floatingFeatureTypes.OgreCave.canGenerate()) {
			featureGenerator.floatingFeatureTypes.OgreCave.generate();
		}
	}
	
	gs.areaList = this.roomAreaList;
	
	return true;
};