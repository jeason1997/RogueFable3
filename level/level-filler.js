/*global gs, game, console*/
/*jshint esversion: 6*/
'use strict';
var levelFiller = {};


// SECOND_ROOM_DRESSING_PASS:
// This function can be used after most other generation has occured in order to add additional dressing to
// otherwise empty rooms. Note that this occurs after dressRooms, generateGlobalStuff and populateLevel
// ************************************************************************************************
levelFiller.secondRoomDressingPass = function () {
	var countObjects, indexList, tileIndex, fillTypes;
	
	
	
	if (!gs.inArray(gs.zoneName, ['TheOrcFortress']) || !gs.areaList) {
		return;
	}
	
	fillTypes = [
		this.fillAreaGrass,
		this.fillAreaRubble,
		this.fillAreaFireShrooms,
	];
	
	countObjects = function (area) {
		var indexList = gs.getIndexInBox(area);
		indexList = indexList.filter(index => gs.getObj(index) || gs.getTile(index).type.name === 'Water');
		return indexList.length;
	};
	
	gs.areaList.forEach(function (area) {
		if (area.type === 'LargeRoom' && countObjects(area) < area.width * area.height * 0.10) {
			util.randElem(fillTypes).call(this, area);
		}
	}, this);
};

// FILL_AREA_FIRE_SHROOMS:
// ************************************************************************************************
levelFiller.fillAreaFireShrooms = function (area) {
	var tileIndex;
	tileIndex = gs.getOpenIndexInArea(area);
	if (tileIndex) {
		gs.spawnShroomTrap(tileIndex);
	}
};

// FILL_AREA_GRASS:
// ************************************************************************************************
levelFiller.fillAreaGrass = function (area) {
	this.fillAreaBrokenFloor(area, 'LongGrass');
};

// FILL_AREA_RUBBLE:
// ************************************************************************************************
levelFiller.fillAreaRubble = function (area) {
	this.fillAreaBrokenFloor(area, 'Rubble');
};

// FILL_AREA_BROKEN_FLOOR:
// ************************************************************************************************
levelFiller.fillAreaBrokenFloor = function (area, objTypeName) {
	var tileIndex, indexList;
	
	tileIndex = gs.getOpenIndexInArea(area);
	if (tileIndex) {
		indexList = gs.getIndexInFlood(tileIndex, gs.isPassable.bind(gs), 5);
		indexList.forEach(function (index) {
			if (gs.getTile(index).type.name === 'Floor' && game.rnd.frac() < 1.0 / util.distance(index, tileIndex)) {
				gs.setTileType(index, gs.tileTypes.CaveFloor);

				if (!gs.getObj(index) && game.rnd.frac() < 0.75) {
					gs.createObject(index, objTypeName);
				}
			}

		}, this);
	}
};

