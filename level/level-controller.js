/*global gs, game, util, console*/
/*jshint esversion: 6*/
'use strict';

var levelController = {};

// UPDATE_TURN:
// ************************************************************************************************
levelController.updateTurn = function () {
	if (gs.zoneName === 'TheSunlessDesert') {
		for (let i = 0; i < this.dustStorms.length; i += 1) {
			this.updateDustStorm(this.dustStorms[i]);
		}
	}
};

// UPDATE_DUST_STORM:
// ************************************************************************************************
levelController.updateDustStorm = function (dustStorm) {
	// Creating dust:
	gs.getIndexInFlood(dustStorm.tileIndex, gs.isStaticPassable, 2).forEach(function (tileIndex) {
		if (!gs.getCloud(tileIndex)) {
			gs.createCloud(tileIndex, 'Dust', 0, 5);
		}
	}, this);
		
	
	
	// Only move every 3 turns:
	if (gs.turn % 3 === 0) {
		// Moving:
		var toTileIndex = {x: dustStorm.tileIndex.x + dustStorm.wanderVector.x,
						   y: dustStorm.tileIndex.y + dustStorm.wanderVector.y};

		if (gs.isStaticPassable(toTileIndex)) {
			// Changing direction:
			if (game.rnd.frac() < 0.05) {
				dustStorm.wanderVector = {x: util.randInt(-1, 1), y: util.randInt(-1, 1)};
			}

			dustStorm.tileIndex.x = toTileIndex.x;
			dustStorm.tileIndex.y = toTileIndex.y;
		}
		// Hit a wall:
		else {
			dustStorm.wanderVector = {x: util.randInt(-1, 1), y: util.randInt(-1, 1)};
		}
	}
	

};

// ON_GENERATE_LEVEL:
// ************************************************************************************************
levelController.onGenerateLevel = function () {
	if (gs.zoneName === 'TheSunlessDesert') {
		this.dustStorms = [];
		
		for (let i = 0; i < 3; i += 1) {
			this.dustStorms.push({
				tileIndex: gs.getPassableIndexInBox(0, 0, gs.numTilesX, gs.numTilesY),
				wanderVector: {x: util.randInt(-1, 1), y: util.randInt(-1, 1)}
			});
		}
	}
};

// TO_DATA:
// ************************************************************************************************
levelController.toData = function () {
	var data = {};
	
	if (gs.zoneName === 'TheSunlessDesert') {
		data.dustStorms = this.dustStorms;
	}
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
levelController.loadData = function (data) {
	if (gs.zoneName === 'TheSunlessDesert') {
		this.dustStorms = data.dustStorms;
	}
};

// ON_TRIGGER_GROUP:
// ************************************************************************************************
levelController.onTriggerGroup = function (groupId) {
	// Pass if the trigger has already been triggered
	if (gs.levelTriggers[groupId]) {
		return;
	}
	
	// Flag the trigger as triggered:
	gs.levelTriggers[groupId] = 1;
	
	if (gs.staticLevelName === 'VaultOfYendor-EndLevel01') {
		// Left Side:
		if (groupId === 1) {
			gs.explodeWall([{x: 5, y: 4}, {x: 6, y: 4}, {x: 7, y: 4}, {x: 8, y: 4}]);
			
		}
		
		// Right Side:
		if (groupId === 2) {
			gs.explodeWall([{x: 30, y: 4}, {x: 31, y: 4}, {x: 32, y: 4}, {x: 33, y: 4}]);
			
		}
	}
};

// ON_OPEN_DOOR:
// ************************************************************************************************
levelController.onOpenDoor = function (door) {
	if (gs.staticLevelName === 'TheSewers-EndLevel01' && door.type.name === 'StoneDoor') {
		gs.objectList.filter(obj => obj.type.name === 'StoneDoor').forEach(function (obj) {
			if (!obj.isOpen) {
				obj.openDoor();
			}
		}, this);
	}
	
	if (gs.staticLevelName === 'TheSewers-EndLevel02' && door.type.name === 'StoneDoor') {
		gs.objectList.filter(obj => obj.type.name === 'StoneDoor').forEach(function (obj) {
			if (!obj.isOpen) {
				obj.openDoor();
			}
		}, this);
	}
	
	if (gs.staticLevelName === 'TheCore-EndLevel01' && door.type.name === 'StoneDoor') {
		gs.objectList.filter(obj => obj.type.name === 'StoneDoor').forEach(function (obj) {
			if (!obj.isOpen) {
				obj.openDoor();
			}
		}, this);
	}
	
	if (gs.staticLevelName === 'TheIceCaves-EndLevel01' && door.type.name === 'StoneDoor') {
		gs.objectList.filter(obj => obj.type.name === 'StoneDoor').forEach(function (obj) {
			if (!obj.isOpen) {
				obj.openDoor();
			}
		}, this);
	}
	
	if (gs.staticLevelName === 'TheArcaneTower-EndLevel02' && door.type.name === 'StoneDoor') {
		gs.objectList.filter(obj => obj.type.name === 'StoneDoor').forEach(function (obj) {
			if (!obj.isOpen) {
				obj.openDoor();
			}
		}, this);
	}
	
	if (gs.staticLevelName === 'VaultOfYendor-EndLevel01' && door.type.name === 'StoneDoor') {
		gs.objectList.filter(obj => obj.type.name === 'StoneDoor').forEach(function (obj) {
			if (!obj.isOpen) {
				obj.openDoor();
			}
		}, this);
	}
	
	if (gs.staticLevelName === 'VaultOfYendor-EndLevel03' && door.type.name === 'StoneDoor') {
		gs.objectList.filter(obj => obj.type.name === 'StoneDoor').forEach(function (obj) {
			if (!obj.isOpen) {
				obj.openDoor();
			}
		}, this);
	}
};