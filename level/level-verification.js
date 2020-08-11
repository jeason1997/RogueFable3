/*global gs, console*/
/*jshint laxbreak: true, esversion: 6*/

'use strict';

var levelVerification = {};

// RUN:
// ************************************************************************************************
levelVerification.run = function () {
	this.verifyConnectivity();
	this.verifyZoneLines();
};

// VERIFY_ZONE_LINES:
// ************************************************************************************************
levelVerification.verifyZoneLines = function () {
	if (!gs.findObj(obj => obj.type.name === 'DownStairs')) {
		console.log('Missing down stairs');
	}
	
	if (!gs.findObj(obj => obj.type.name === 'UpStairs')) {
		console.log('Missing up stairs');
	}
};

// IS_CONNECTED:
// Verify that all areas of the level are connected
// ************************************************************************************************
levelVerification.isConnected = function () {
	var tileIndex, floodList, indexList, testFunc;
	
	testFunc = function (index) {
		return gs.isStaticPassable(index)
			|| gs.getObj(index, obj => obj.isDoor())
			|| gs.isDropWall(index);
	};
	
	// Flood from a passable point:
	tileIndex = gs.getPassableIndexInBox(0, 0, gs.numTilesX, gs.numTilesY);
	floodList = gs.getIndexInFlood(tileIndex, testFunc, 1000, true);
	
	// Get list of all passable index:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => testFunc(index));
	
	if (floodList.length !== indexList.length) {
		// Color missing tiles:
		indexList.forEach(function (index) {
			if (!floodList.find(idx => gs.vectorEqual(idx, index))) {
				gs.getTile(index).color = '#ff0000';
			}
		}, this);
		
		return false;
	}
	
	return true;
};