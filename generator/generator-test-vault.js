/*global game, util, gs, console, Phaser*/
/*global BaseGenerator*/
/*global roomGenerator*/
/*jshint esversion: 6, laxbreak: true, loopfunc: true*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function TestVaultGenerator() {}
TestVaultGenerator.prototype = new BaseGenerator();
var testVaultGenerator = new TestVaultGenerator();

// GENERATE:
// ************************************************************************************************
TestVaultGenerator.prototype.generate = function () {
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.Wall);

	// 4 open areas:
	this.placeTileSquare({x: 1, y: 18}, {x: 5, y: 22}, gs.tileTypes.Floor);
	this.placeTileSquare({x: 35, y: 18}, {x: 39, y: 22}, gs.tileTypes.Floor);
	this.placeTileSquare({x: 18, y: 1}, {x: 22, y: 5}, gs.tileTypes.Floor);
	this.placeTileSquare({x: 18, y: 35}, {x: 22, y: 39}, gs.tileTypes.Floor);
	
	
	// Place vault centered:
	let vaultType = gs.vaultTypes[gs.debugProperties.testVault];
	//console.log(vaultType.name);
	//console.log(vaultType.width);
	
	let tileIndex = {x: 20 - Math.floor(vaultType.width / 2), y: 20 - Math.floor(vaultType.height / 2)};
	let area = this.placeVault(tileIndex, {vaultTypeName: vaultType.name});
	
	// Halls:
	this.placeAStarHall(gs.getHallIndex(area), {x: 3, y: 20});
	this.placeAStarHall(gs.getHallIndex(area), {x: 37, y: 20});
	this.placeAStarHall(gs.getHallIndex(area), {x: 20, y: 3});
	this.placeAStarHall(gs.getHallIndex(area), {x: 20, y: 37});
	
	gs.areaList = [];
	return true;
};

