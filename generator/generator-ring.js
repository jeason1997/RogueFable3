/*global game, gs, console, Phaser, util*/
/*global BaseGenerator*/
/*jshint esversion: 6, loopfunc: true*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function RingGenerator() {
	this.name = 'RingGenerator';
}
RingGenerator.prototype = new BaseGenerator();
var ringGenerator = new RingGenerator();

// GENERATE:
// ************************************************************************************************
RingGenerator.prototype.generate = function (flags) {
	var area;
	
	flags = flags || {};
	this.flags = flags;
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.Wall);

	this.createRings();
	//this.placeDoors();
	
	return true;
};

// CREATE_RINGS:
// ************************************************************************************************
RingGenerator.prototype.createRings = function () {
	var ringList = [
		{inner: 0, outer: 4, angles: []},
		{inner: 7, outer: 12, angles: []},
		{inner: 15, outer: 19, angles: []}
	];
	
	// Rings:
	ringList.forEach(function (ring) {
		this.createRing(ring.inner, ring.outer);
	}, this);
	
	// Wall Segments:
	ringList.forEach(function (ring) {
		if (ring.inner !== 0) {
			this.createSegmentWall(ring);
			this.createSegmentWall(ring);
		}
		
	}, this);
	
	// Ring Doors:
	this.createRingDoor(ringList[0], ringList[1]);
	this.createRingDoor(ringList[1], ringList[2]);
	
};

// CREATE_RING_DOORS:
// ************************************************************************************************
RingGenerator.prototype.createRingDoor = function (ring1, ring2) {
	var centerTileIndex, angle, normal, startTileIndex, endTileIndex, placeWall, placedDoor = 0;

	centerTileIndex = {x: this.numTilesX / 2, y: this.numTilesY / 2};
	
	[0, 90, 180, 270].forEach( function (angle) {
		if (!gs.inArray(angle, ring1.angles) && !gs.inArray(angle, ring2.angles)) {
			normal = gs.getNormalFromAngle(angle);
			startTileIndex = {x: Math.round(centerTileIndex.x + normal.x * ring1.outer),
							  y: Math.round(centerTileIndex.y + normal.y * ring1.outer)};
			endTileIndex = {x: Math.round(centerTileIndex.x + normal.x * ring2.inner),
							y: Math.round(centerTileIndex.y + normal.y * ring2.inner)};

			gs.setTileType(startTileIndex, gs.tileTypes.Floor);
			gs.createObject(startTileIndex, 'Door');
			gs.getIndexInRay(startTileIndex, endTileIndex).forEach(function (index) {
				gs.setTileType(index, gs.tileTypes.Floor);
			}, this);
			
			placedDoor += 1;
		}
		
	}, this);
	

	[45, 135, 225, 315].forEach( function (angle) {
		if (placedDoor < 2 && !gs.inArray(angle, ring1.angles) && !gs.inArray(angle, ring2.angles)) {
			normal = gs.getNormalFromAngle(angle);
			startTileIndex = {x: Math.round(centerTileIndex.x + normal.x * ring1.outer),
							  y: Math.round(centerTileIndex.y + normal.y * ring1.outer)};
			endTileIndex = {x: Math.round(centerTileIndex.x + normal.x * ring2.inner),
							y: Math.round(centerTileIndex.y + normal.y * ring2.inner)};

			gs.setTileType(startTileIndex, gs.tileTypes.Floor);
			gs.getIndexInRay(startTileIndex, endTileIndex).forEach(function (index) {
				gs.getIndexInRadius(index, 1.0).forEach(function (idx) {
					gs.setTileType(idx, gs.tileTypes.Floor);
				}, this);

			}, this);

			placedDoor += 1;
		}
		
	}, this);
	
};

// CREATE_RING:
// ************************************************************************************************
RingGenerator.prototype.createRing = function (innerRadius, outerRadius) {
	var centerTileIndex = {x: this.numTilesX / 2, y: this.numTilesY / 2};
	
	gs.getIndexInRadius(centerTileIndex, outerRadius).forEach(function (index) {
		if (util.distance(centerTileIndex, index) < outerRadius && util.distance(centerTileIndex, index) >= innerRadius) {
			gs.setTileType(index, gs.tileTypes.Floor);
		}
		
	}, this);
};

// CREATE_SEGMENT_WALL:
// ************************************************************************************************
RingGenerator.prototype.createSegmentWall = function (ring) {
	var centerTileIndex, angle, normal, startTileIndex, endTileIndex, placeWall, hallIndex, perp;

	centerTileIndex = {x: this.numTilesX / 2, y: this.numTilesY / 2};
	
	do {
		angle = util.randElem([0, 90, 180, 270]);
	} while (gs.inArray(angle, ring.angles));
	
	ring.angles.push(angle);
	
	normal = gs.getNormalFromAngle(angle);
	startTileIndex = {x: Math.round(centerTileIndex.x + normal.x * ring.inner),
					  y: Math.round(centerTileIndex.y + normal.y * ring.inner)};
	endTileIndex = {x: Math.round(centerTileIndex.x + normal.x * ring.outer),
					y: Math.round(centerTileIndex.y + normal.y * ring.outer)};
		
	
	placeWall = function (tileIndex) {
		gs.getIndexInRadius(tileIndex, 1).forEach(function (index) {
			gs.setTileType(index, gs.tileTypes.Wall);
		}, this);
	};
		
	placeWall(startTileIndex);
	placeWall(endTileIndex);
	gs.getIndexInRay(startTileIndex, endTileIndex).forEach(function (index) {
		placeWall(index);
	}, this);
	
	// Hall:
	hallIndex = {x: Math.round(startTileIndex.x + normal.x * (ring.outer - ring.inner) / 2),
				 y: Math.round(startTileIndex.y + normal.y * (ring.outer - ring.inner) / 2)};
	perp = gs.getOrthoVector(normal);
	gs.setTileType(hallIndex, gs.tileTypes.Floor);
	gs.createObject(hallIndex, 'Door');
	gs.setTileType({x: hallIndex.x + perp.x, y: hallIndex.y + perp.y}, gs.tileTypes.Floor);
	gs.setTileType({x: hallIndex.x - perp.x, y: hallIndex.y - perp.y}, gs.tileTypes.Floor);
};