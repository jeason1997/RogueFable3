/*global game, gs, localStorage, console, util*/
/*global TILE_SIZE, SCALE_FACTOR*/
/*global TIER_II_ZONES, TIER_III_ZONES, BRANCH_I_ZONES, BRANCH_II_ZONES, TIER_III_SPECIAL_ZONES*/
/*global DANGER_LEVEL*/
/*global NPC, Container, Shop, featureGenerator, Inventory, bspGenerator, SPAWN_ENEMY_TURNS, FACTION*/
/*jshint laxbreak: true, esversion: 6*/

'use strict';

// ZONE_TYPE:
// Returns the type of zone
// ************************************************************************************************
gs.zoneType = function () {
	return gs.zoneTypes[gs.zoneName];
};

// NEXT_LEVEL:
// Returns {zoneName, zoneLevel} of the next level (upon falling down a pit)
// Returns null if there is no next valid next level (in this case the player character will be killed by the fall)
// ************************************************************************************************
gs.nextLevel = function () {
	var nextZoneName, nextLevel;
	
	if (this.zoneLevel === 4) {
		nextLevel = 1;
		
		// TIER_I => TIER_II:
		if (this.zoneName === 'TheUpperDungeon') {
			nextZoneName = gs.arrayIntersect(this.branches, TIER_II_ZONES)[0];
		}
		// TIER_II => TIER_III:
		else if (gs.inArray(this.zoneName, TIER_II_ZONES)) {
			nextZoneName = gs.arrayIntersect(this.branches, TIER_III_ZONES)[0];
		}
		// TIER_III => TIER_IV:
		else if (gs.inArray(this.zoneName, TIER_III_ZONES)) {
			nextZoneName = 'VaultOfYendor';
		}
		else {
			return null;
		}
	}
	else {
		nextLevel = this.zoneLevel + 1;
		nextZoneName = this.zoneName;
	}
	
	return {zoneName: nextZoneName, zoneLevel: nextLevel};
};

// DESCEND_LEVEL:
// Called when falling down pits and pit traps.
// Will handle transitions between zones.
// ************************************************************************************************
gs.descendLevel = function () {
	var nextLevel = gs.nextLevel();
	
	if (!nextLevel) {
		throw 'Error: cannot descent on this level';
	}
	
	this.changeLevel(nextLevel.zoneName, nextLevel.zoneLevel);
};

// CHANGE_LEVEL:
// Called from: zoneTo, pitTrap, player.load and when starting a new game.
// ************************************************************************************************
gs.changeLevel = function (toDungeonName, toDungeonLevel, forceGenerate) {
	var prevZoneName = this.zoneName, success = false;
	
	forceGenerate = forceGenerate || false;
	
	// Save the previous level:
	if (prevZoneName && gs.debugProperties.saveLevels) {
		this.saveLevel();
		this.pc.save();
	}
	
	this.zoneName = toDungeonName;
	this.zoneLevel = toDungeonLevel;
	
	// Destroy stuff:
	this.destroyLevel();
	
	// Reset character list and push player:
    this.characterList = [];
    this.characterList.push(gs.pc);
    
	// Make sure player starts first:
	this.activeCharacterIndex = 0;
	this.activeCharacter = this.characterList[0];
	this.pc.waitTime = 0;
	
	// Load a previously visited level:
	if (this.canReloadLevel(toDungeonName, toDungeonLevel) && !forceGenerate) {
		this.reloadLevel(toDungeonName, toDungeonLevel);
		success = true;
	}
	// Generating level:
	else {
		success = this.generateLevel();
		
		// Exploration god heal:
		if (gs.pc.religion === 'Exploration' && gs.pc.currentHp < gs.pc.maxHp) {
			gs.pc.healHp(gs.pc.maxHp);
		}
		
		// Gargoyle Heals:
		if (gs.pc.race && gs.pc.race.name === 'Gargoyle') {
			gs.pc.healHp(gs.pc.maxHp);
			gs.pc.gainMp(gs.pc.maxMp);
		}
		
		
		
		// Lich Kings Lair:
		if (gs.state !== 'DIALOG_MENU_STATE' && gs.zoneName === 'TheLichKingsLair') {
			gs.dialogMenu.open(gs.dialog.TheLichKingsLair);
		}
		
		// Timed treasure room dialog:
		if (gs.state !== 'DIALOG_MENU_STATE' && featureGenerator.featureTypeCounts.TimedTreasureRoom > 0) {
			gs.dialogMenu.open(gs.dialog.TimedTreasureRoom);
		}
		
		// Notify the player he is in a branch:
		if (gs.state !== 'DIALOG_MENU_STATE' && this.atBranchEntrance()) {
			gs.dialogMenu.open(gs.dialog.BranchHelp);
		}
		
		
		
		// Log Event:
		this.logDungeonLevel();
	}
	
	// Camera:
	game.world.bounds.setTo(-1000, -1000, (this.numTilesX - 1) * TILE_SIZE + 2000, (this.numTilesY - 1) * TILE_SIZE + 3000);
	game.camera.setBoundsToWorld();
	
	// Stop music if the toZone has no music or if it is different then the current track: 
	if (!this.getZoneMusic(toDungeonName) || this.getZoneMusic(toDungeonName) !== this.getZoneMusic(prevZoneName)) {
		this.stopAllMusic();
	}
	
	// Start music if it exists:
	if (this.musicOn && this.getZoneMusic(toDungeonName) && this.getZoneMusic(toDungeonName) !== this.getZoneMusic(prevZoneName)) {
		this.getZoneMusic(toDungeonName).loopFull();
	}
	
	// Explore Level:
	if (this.debugProperties.mapExplored) {
		this.exploreMap();
	}
	
	gs.pc.statusEffects.onChangeLevel();
	
	return success;
};

// AT_BRANCH_ENTRANCE:
// ************************************************************************************************
gs.atBranchEntrance = function () {
	return gs.inArray(this.zoneName, BRANCH_I_ZONES.concat(BRANCH_II_ZONES))
		&& gs.zoneLevel === 1;
};

// GET_PULL_NPC_LIST:
// ************************************************************************************************
gs.getPullNPCList = function (zoneLine) {
	var list = [];
	
	// Pull Hostile NPCs
	this.getIndexInRadius(zoneLine.tileIndex, 1.5).forEach(function (index) {
		let char = this.getChar(index);
		if (char && char !== this.pc && char.isAgroed && char.faction === FACTION.HOSTILE && !char.isStunned && !char.isImmobile) {
			list.push(char.toData());
			char.destroy();
		}
	}, this);
	
	// Pull Friendly Allies from everywhere:
	this.getAllAllies().forEach(function (char) {
		list.push(char.toData());
		char.destroy();
	}, this);
	
	return list;
};

// ZONE_TO:
// Called when interacting with a zoneline.
// ************************************************************************************************
gs.zoneTo = function (zoneLine) {
	var i, tileIndex, prevZoneName, prevZoneLevel, char, pullNPCList;
	
	prevZoneName = this.zoneName;
	prevZoneLevel = this.zoneLevel;
	
	pullNPCList = this.getPullNPCList(zoneLine);
	
	// Change level:
	this.changeLevel(zoneLine.toZoneName, zoneLine.toZoneLevel);
	
	// Search for a connecting zoneLine in the new zone:
	if (this.getZoneLineTileIndex(prevZoneName, prevZoneLevel)) {
		let zoneLineTileIndex = this.getZoneLineTileIndex(prevZoneName, prevZoneLevel);
		this.pc.body.snapToTileIndex(gs.getNearestPassableIndex(zoneLineTileIndex));
	}
	else {
		throw 'Zoning from ' + prevZoneName + ' to ' + zoneLine.toZoneName + ', no valid zoneline';
	}
	
	
	// Now in new zone:
	this.pc.stopExploring();
	
	this.calculateLoS(true);
	gs.HUD.miniMap.refresh(true);
	
	// Dungeon Sense:
	if (gs.pc.hasTalent('DungeonSense')) {
		gs.revealDungeonSenese();
	}
	
	this.placePulledNPCs(pullNPCList);
	
	// Force it to be players turn:
	this.activeCharacterIndex = 0;
	this.activeCharacter = this.characterList[0];
	
	
	
	
	gs.pc.updateStats();
};

// PLACE_PULLED_NPCS:
// ************************************************************************************************
gs.placePulledNPCs = function (pullNPCList) {
	var tileIndex, char;
	
	// Pulled NPCS:
	for (let i = 0; i < pullNPCList.length; i += 1) {
		tileIndex = gs.getNearestPassableIndex(this.pc.tileIndex);
		
		if (!tileIndex) {
			throw 'Could not place pulled NPC';
		}
		
		pullNPCList[i].tileIndex = {x: tileIndex.x, y: tileIndex.y};
		char = this.loadNPC(pullNPCList[i]);
		
		char.isAgroed = true;
	}
};

// DESTROY_LEVEL:
// ************************************************************************************************
gs.destroyLevel = function () {
	this.destroyAllNPCs();
    this.destroyAllFloorItems();
	this.destroyAllObjects();
	this.destroyAllProjectiles();
	this.destroyAllClouds();
};

// GET_ZONE_LINE_TILE_INDEX:
// With no arguments this function will return the first zone line it finds
// ************************************************************************************************
gs.getZoneLineTileIndex = function (toZoneName, toZoneLevel) {	
	for (let x = 0; x < this.numTilesX; x += 1) {
		for (let y = 0; y < this.numTilesY; y += 1) {
			let obj = this.getObj(x, y, obj => obj.isZoneLine());
			
			
			if (obj && obj.toZoneName === toZoneName && obj.toZoneLevel === toZoneLevel) {
				return {x: x, y: y};
			}
		}
	}
	return null;
};

gs.niceZoneLevel = function (zoneName, zoneLevel) {
	zoneName = zoneName || this.zoneName;
	zoneLevel = zoneLevel || this.zoneLevel;
	
	if (zoneName === 'TheUpperDungeon') {
		return zoneLevel;
	}
	else if (gs.inArray(zoneName, TIER_II_ZONES)) {
		return zoneLevel + 4;
	}
	else if (gs.inArray(zoneName, TIER_III_ZONES)) {
		return zoneLevel + 8;
	}
	else if (zoneName === 'VaultOfYendor') {
		return zoneLevel + 12;
	}
	else {
		return zoneLevel;
	}
};

// DANGER_LEVEL:
// Because of branches we need to have an easy way to determine the dungeon level.
// This could be thought of as depth from the surface.
// This can be used to determine what objects, traps, features, and items to spawn.
// Can also be used for enchantment level and gold amount.
// ************************************************************************************************
gs.dangerLevel = function (zoneName, zoneLevel) {
	zoneName = zoneName || this.zoneName;
	zoneLevel = zoneLevel || this.zoneLevel;
	
	if (zoneName === 'TestLevel') {
		return 1;
	}
	else if (zoneName === 'TheUpperDungeon') {
		return DANGER_LEVEL.TIER_I[zoneLevel];
	}
	else if (gs.inArray(zoneName, TIER_II_ZONES)) {
		return DANGER_LEVEL.TIER_II[zoneLevel];
	}
	else if (gs.inArray(zoneName, TIER_III_ZONES)) {
		return DANGER_LEVEL.TIER_III[zoneLevel];
	}
	else if (gs.inArray(zoneName, BRANCH_I_ZONES)) {
		return DANGER_LEVEL.BRANCH_I[zoneLevel];
	}
	else if (gs.inArray(zoneName, BRANCH_II_ZONES)) {
		return DANGER_LEVEL.BRANCH_II[zoneLevel];
	}
	else if (zoneName === 'VaultOfYendor') {
		return DANGER_LEVEL.TIER_IV[zoneLevel];
	}
	else if (gs.inArray(zoneName, TIER_III_SPECIAL_ZONES)) {
		return DANGER_LEVEL.TIER_III_SPECIAL[zoneLevel];
	}
	else {
		throw 'dangerLevel() - not valid dangerLevel for zone: ' + zoneName;
	}
};

// DROP_GOLD_AMOUNT:
// How much gold should spawn on floor and be dropped by enemies.
// This will be based on the dangerLevel()
// ************************************************************************************************
gs.dropGoldAmount = function () {
	return Math.ceil(this.dangerLevel() / 2);

};


// GET_ZONE_MUSIC:
// ************************************************************************************************
gs.getZoneMusic = function (zoneName) {
	// No zone data:
	if (this.zoneTypes[zoneName]) {
		return this.zoneTypes[zoneName].musicTrack;
	} else {
		return null;
	}
};

// UNEXPLORED_TILES_REMAINING:
// ************************************************************************************************
gs.unexploredTilesRemaining = function () {
	var indexList = gs.getAllIndex();
	indexList = indexList.filter(index => !gs.getTile(index).explored && gs.getTile(index).type.passable && !gs.isPit(index));
	return indexList.length > 0;
};

// EXPLODE_WALL:
// Used by drop walls or triggered drop walls
// Requires a list of tileIndices
// ************************************************************************************************
gs.explodeWall = function (indexList) {
	indexList.forEach(function (index) {
		gs.setTileType(index, gs.tileTypes.Floor);
		if (gs.getObj(index)) {
			gs.destroyObject(gs.getObj(index));
		}
		gs.createParticlePoof(index, 'WHITE');
		
		gs.shout(index, FACTION.HOSTILE, true);
	}, this);
			
	game.camera.shake(0.020, 200);
	gs.playSound(gs.sounds.explosion, gs.pc.tileIndex);
	gs.calculateLoS();
	gs.hasNPCActed = true;
};