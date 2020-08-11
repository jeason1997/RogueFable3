/*global gs, console*/
/*global Item*/
/*global FACTION*/
/*jshint esversion: 6*/
'use strict';

var debug = {};

// SPAWN_NEXT_NPC:
// Use for testing each NPC in the game, one by one
// ************************************************************************************************
debug.spawnNextNPC = function () {
	if (!this.nextNPCIndex) {
		this.nextNPCIndex = 0;
	}
	
	if (this.nextNPCIndex < gs.npcTypeList.length) {
		console.log(gs.debugNextNPCIndex);
		gs.spawnNPCOrGroup({x: gs.pc.tileIndex.x + 1, y: gs.pc.tileIndex.y}, gs.npcTypeList[gs.debugNextNPCIndex].name);
		gs.updateCharacterFrames();
		gs.updateTileMapSprites();
		gs.debugNextNPCIndex += 1;
	}
	else {
		console.log('No more NPCs');
	}
	
};

// CREATE_OBJECT:
// ************************************************************************************************
debug.createObject = function (typeName, tileIndex = {x: gs.pc.tileIndex.x + 1, y: gs.pc.tileIndex.y}) {
	var obj;
	obj = gs.createObject(tileIndex, typeName);
	
	gs.updateTileMapSprites();
	
	return obj;
};

// FLOOD_OBJECT:
// ************************************************************************************************
debug.floodObject = function () {
	var tileIndex = gs.getNearestPassableIndex(gs.pc.tileIndex);
	
	console.log(tileIndex.depth);
	
	gs.debugCreateObject('Table', tileIndex);
	
	gs.updateTileMapSprites();
};

// CREATE_PARTICLE_POOF
// ************************************************************************************************
debug.createParticlePoof = function() {
	gs.createParticlePoof({x: gs.pc.tileIndex.x + 1, y: gs.pc.tileIndex.y});
};

// CREATE_NPC:
// Quick debug function for creating NPCs adjacent to the player
// Generally called from the console during testing and debugging
// ************************************************************************************************
debug.createNPC = function (typeName, flags) {
	console.log('Creating NPC: ' + typeName);
    gs.createNPC({x: gs.pc.tileIndex.x + 1, y: gs.pc.tileIndex.y}, typeName, flags);
	gs.updateCharacterFrames();
	gs.updateTileMapSprites();
	
};

// AGRO_ALL_NPCS:
// ************************************************************************************************
debug.agroAllNPCs = function () {
	gs.characterList.forEach(function (npc) {
		if (npc.isAlive && npc.faction === FACTION.HOSTILE) {
			npc.agroPlayer();
		}
	}, this);
};

// ADD_ITEM:
// ************************************************************************************************
debug.addItem = function (typeName, flags) {
	gs.pc.inventory.addItem(Item.createItem(typeName, flags));
};

// CREATE_FLOOR_ITEM:
// ************************************************************************************************
debug.createFloorItem = function (typeName, flags) {
	var tileIndex = {x: gs.pc.tileIndex.x + 1, y: gs.pc.tileIndex.y};
	gs.createFloorItem(tileIndex, Item.createItem(typeName, flags)); 
};

// CREATE_RANDOM_FLOOR_ITEM:
// ************************************************************************************************
debug.createRandomFloorItem = function (dropTableName) {
	var tileIndex = {x: gs.pc.tileIndex.x + 1, y: gs.pc.tileIndex.y};
	gs.createRandomFloorItem(tileIndex, dropTableName);
};

// SET_LEVEL:
// Use this to hack the players level
// ************************************************************************************************
debug.setPlayerLevel = function (level) {
	gs.pc.level = level;
	gs.pc.exp = gs.expPerLevel[gs.pc.level];
};