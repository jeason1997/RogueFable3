/*global game, Phaser, localStorage, menuState, loseState, console, winState, XMLHttpRequest, util, nw, window*/
/*global ClassSelectMenu, RaceSelectMenu, UIRecordMenu, MainMenu, MainMenuBase*/
/*global PlayerCharacter, NPC, Container, Shop, gameMetric, ItemSlotList, frameSelector, levelController*/
/*global UIStatMenu, UICharacterMenu, UIShopMenu, UIDialogMenu, UIEnchantmentMenu, UIAcquirementMenu, UITransferanceMenu, HUD*/
/*global UIHelpMenu, UIGameMenu, UIOptionsMenu, UIUseMenu*/
/*global featureGenerator, roomGenerator*/
/*global SPAWN_ENEMY_TURNS*/
/*global NUM_SCREEN_TILES_X, PLAYER_FRAMES, TILE_SIZE, LOS_DISTANCE, HUGE_WHITE_FONT*/
/*global TIER_II_ZONES, TIER_III_ZONES, BRANCH_I_ZONES, BRANCH_II_ZONES*/
/*global MERCHANT_INVENTORY_WIDTH, MERCHANT_INVENTORY_HEIGHT*/
/*global HUD_WIDTH*/

/*jshint white: true, laxbreak: true, esversion: 6*/
'use strict';


var gs = {};

// PRELOAD:
// ************************************************************************************************
gs.preload = function () {
	game.time.advancedTiming = true;
};

// CREATE:
// ************************************************************************************************
gs.create = function () {
	this.setDebugProperties();
	
	this.timer = game.time.create(false);
	
	// Data (Achievements and Help):
	this.loadGlobalData();
	
	// Lists:
	this.floorItemList = [];
	this.characterList = [];
	this.projectileList = [];
	this.particleList = [];
	this.cloudList = [];
	this.damageText = [];
	this.objectList = [];
	this.particleGeneratorList = [];

	// Sprite Groups (for layering):
	this.tileMapSpritesGroup = game.add.spriteBatch();
	this.floorObjectSpritesGroup = game.add.spriteBatch();
	this.objectSpritesGroup = game.add.group();
	this.shadowSpritesGroup = game.add.group();
	this.projectileSpritesGroup = game.add.group();
	this.hudTileSpritesGroup = game.add.spriteBatch();
	this.characterHUDGroup = game.add.group();
	this.popUpTextSpritesGroup = game.add.group();
	
	// Performance:
	this.tileMapSpritesGroup.noPostUpdate = true;
	this.floorObjectSpritesGroup.noPostUpdate = true;
	this.objectSpritesGroup.noPostUpdate = true;
	this.projectileSpritesGroup.noPostUpdate = true;
	this.hudTileSpritesGroup.noPostUpdate = true;
	this.characterHUDGroup.noPostUpdate = true;
	this.popUpTextSpritesGroup.noPoseUpdate = true;

	this.tileMapSpritesGroup.noPreUpdate = true;
	
	// Can't set this to true as anims are placing on it
	//this.floorObjectSpritesGroup.noPreUpdate = true;
	
	// Create Types:
	this.createAbilityTypes();
	this.createPlayerType();
	this.createNPCTypes();
	this.createAnimEffectTypes();
	this.createStatusEffectTypes();
	this.createTileTypes();
	this.createProjectileTypes();
	this.createLevelTypes();
	this.createVaultTypes();
	this.createObjectTypes();
	this.createUniqueNPCTypes();
	this.createTalents();
	this.setAbilityTypeDefaults();
	this.createItemTypes();
	this.createItemDropTables();
	this.createReligionTypes();
	this.createCloudTypes();
	this.createPlayerClasses();
	this.createPlayerRaces();
	this.createNPCClassTypes();
	featureGenerator.createTypes();
	roomGenerator.createRoomTypes();
	frameSelector.init();
	
	// Create Pools:
	this.createParticlePool();
	this.createObjectPool();
	this.createNPCPool();
	this.createProjectilePool();
	
	// Initiate Zone:
	this.createTileMapSprites();
	
	this.dialogMenu = new UIDialogMenu();
	
	// Sound:
	this.soundOn = this.globalData.soundOn;
	this.musicOn = this.globalData.musicOn;
	this.soundVolume = this.globalData.soundVolume;
	this.musicVolume = this.globalData.musicVolume;
	this.fullScreen = this.globalData.fullScreen;
	this.setMusicVolume(this.musicVolume);
	
	/* if (this.fullScreen) {
		nw.Window.get().enterFullscreen();
	}
	else {
		nw.Window.get().leaveFullscreen();
	} */
	
	// Player:
	this.createKeys();
	this.createPlayerCharacter();
	this.createPlayerCharacterInput();
	this.createLoSRays();
	
	// Merchent Inventory (shared between all merchants):
	this.merchantInventory = new ItemSlotList(MERCHANT_INVENTORY_WIDTH * MERCHANT_INVENTORY_HEIGHT);
	
	// Interface:
	this.createHUDSprites();
	this.HUD = new HUD();
	
	// Create Game Menus:
	this.shopMenu = new UIShopMenu();
	this.characterMenu = new UICharacterMenu();
	this.enchantmentMenu = new UIEnchantmentMenu();
	this.acquirementMenu = new UIAcquirementMenu();
	this.transferanceMenu = new UITransferanceMenu();
	this.helpMenu = new UIHelpMenu();
	this.gameMenu = new UIGameMenu();
	this.useMenu = new UIUseMenu();
	
	
	// Create Main Menus:
	this.classSelectMenu = new ClassSelectMenu();
	this.raceSelectMenu = new RaceSelectMenu();
	this.mainMenu = new MainMenu();
	this.mainMenuBase = new MainMenuBase();
	this.recordMenu = new UIRecordMenu();
	this.optionsMenu = new UIOptionsMenu();
	
	// Forcing quick start:
	if (gs.debugProperties.startClass) {
		gs.clearGameData();
		gs.playerClass = gs.debugProperties.startClass;
		gs.playerRace = gs.playerRaces[gs.debugProperties.startRace];
		gs.startGame();
	}
	// Starting main menu as normal:
	else {
		this.startMainMenu();
	}
	
	
};

// START_MAIN_MENU:
// ************************************************************************************************
gs.startMainMenu = function () {
	// Distinguish between main menu and game:
	this.globalState = 'MAIN_MENU_STATE';
	
	this.state = 'MAIN_MENU_STATE';
	
	// Data (Achievements and Help):
	this.loadGlobalData();
	
	this.mainMenuBase.open();
	this.mainMenu.open();
	
	this.HUD.close();
	this.pc.sprite.visible = false;
	
	// Make sure to clear status effects in case stuff like web sprite must be destroyed
	this.pc.statusEffects.clear();
};

// START_GAME:
// ************************************************************************************************
gs.startGame = function () {
	gs.hasGameStarted = false;
	
	this.setDebugProperties();
	
	// Distinguish between main menu and game:
	this.globalState = 'GAME_STATE';
	
	// Game proporties:
	this.setState('GAME_STATE');
	this.turn = 0;
	this.globalTurnTimer = 0;
	this.activeCharacterIndex = 0;
	this.pauseTime = 0;
	
	// Reset Player:
	this.pc.reset();
	this.HUD.abilityBar.clear();
	
	// Reset Merchant:
	this.merchantInventory.clear();
	
	// Start Timer:
	this.timer = game.time.create(false);
	this.timer.start();
	
	// New Game or Load Game:
	if (this.playerDataExists()) {
		this.loadGame();
	} 
	else {
		this.newGame();
	}
	
	this.activeCharacter = this.characterList[0];
	
	this.pc.updateStats();
	this.HUD.open();
	this.HUD.refresh();
	this.HUD.miniMap.refresh(true);
	this.startTime = Date.now();
	
	gs.hasGameStarted = true;
};

// LOAD_GAME:
// ************************************************************************************************
gs.loadGame = function () {
	this.pc.load();
};

// NEW_GAME:
// ************************************************************************************************
gs.newGame = function () {
	// Force a seed from debugProperties:
	if (this.debugProperties.seed) {
		this.seed = this.debugProperties.seed;
		this.isDailyChallenge = false;
	}
	// Daily challenge seed:
	else if (this.startDailyChallenge) {
		let date = new Date();
		this.playerRace = this.playerRaces.Human;
		
		this.seed = "" + date.getFullYear() + date.getMonth() + date.getDate();
		this.achievements.lastChallenge = this.seed;
		this.isDailyChallenge = true;
		localStorage.setItem('Achievements', JSON.stringify(gs.achievements));
		
		game.rnd.sow(this.seed);
		this.playerClass = util.randElem(['Warrior', 'Barbarian', 'Ranger', 'Rogue', 'FireMage', 'IceMage', 'StormMage', 'Necromancer', 'Enchanter']);
	}
	// Random seed:
	else {	
		this.seed = '' + Date.now();
		this.isDailyChallenge = false;
	}
	
	// Logging:
	this.eventLog = [];
	
	this.nextCrystalChestGroupId = 0;
	this.crystalChestGroupIsOpen = [];
	this.selectNewGameBranches();
	
	
	// Altars:
	this.remainingAltars = [];
	this.forEachType(this.religionTypes, function (religionType) {
		gs.remainingAltars.push(religionType.name);
	});
	
	// Keeping track of generated stuff to never double gen:
	this.previouslySpawnedFeatures = [];
	this.previouslySpawnedUniques = [];
	this.previouslySpawnedStaticLevels = [];
	this.previouslySpawnedVaults = [];
	this.previouslySpawnedItems = [];
	

	// Setup Level:
	this.zoneName = null;
	if (gs.debugProperties.startZoneName) {
		this.changeLevel(gs.debugProperties.startZoneName, gs.debugProperties.startZoneLevel);
	}
	else {
		this.changeLevel('TheUpperDungeon', 1);
	}
	this.savedTime = 0;
	
	// Setup Player:
	if (gs.debugProperties.startTileIndex) {
		this.pc.body.snapToTileIndex(gs.debugProperties.startTileIndex);
	}
	else if (gs.zoneName === 'TestLevel') {
		this.pc.body.snapToTileIndex({x: 2, y: 20});
	}
	else {
		this.pc.body.snapToTileIndex(this.getSafestIndex());
	}
	
	
	// Set default class:
	this.pc.setRace(this.playerRace);
	this.pc.setClass(this.playerClass);
	this.pc.sprite.visible = true;
	
	// Save in case the player dies right away:
	this.saveLevel();
	this.pc.save();

	if (gs.debugProperties.onNewGame) {
		this.onNewGame();
	}
	
	//gameMetric.testLevel();
};

// SELECT_NEW_GAME_BRANCHES:
// ************************************************************************************************
gs.selectNewGameBranches = function () {
	// Branches:
	this.branches = [];
	
	// THE_UPPER_DUNGEON:
	this.branches.push('TheUpperDungeon');
	
	// TIER_II:
	if (this.debugProperties.tierIIZone) {
		this.branches.push(this.debugProperties.tierIIZone);
	}
	else {
		this.branches.push(util.randElem(TIER_II_ZONES));
	}
	
	// TIER_III:
	if (this.debugProperties.tierIIIZone) {
		this.branches.push(this.debugProperties.tierIIIZone);
	}
	else {
		this.branches.push(util.randElem(TIER_III_ZONES));
	}
	
	// BRANCH_I:
	if (this.debugProperties.branchIZone) {
		this.branches.push(this.debugProperties.branchIZone);
	}
	else {
		this.branches.push(util.randElem(BRANCH_I_ZONES));
	}
	
	// BRANCH_II:
	if (this.debugProperties.branchIIZone) {
		this.branches.push(this.debugProperties.branchIIZone);
	}
	else {
		this.branches.push(util.randElem(BRANCH_II_ZONES));
	}
	
	// VAULT_OF_YENDOR:
	this.branches.push('VaultOfYendor');
	
	// SPECIAL_ZONES:
	if (gs.inArray('TheCrypt', this.branches)) {
		this.branches.push('TheLichKingsLair'); 
	}
};

// CLEAR_GAME_DATA:
// Clear all game data from localStorage (use this instead of localStorage.clear()
// This DOES NOT clear the score table
// ************************************************************************************************
gs.clearGameData = function () {
	for (let key in localStorage) {
		if (localStorage.hasOwnProperty(key)) {
			if (key !== 'Achievements' && key !== 'globalData' && key !== 'GameRecords') {
				localStorage.removeItem(key);
			}
		}
	}
	
	// Just in case theres some fiddle fuckery here:
	game.camera.onFadeComplete.removeAll();
};

// START_MUSIC:
// Starts the appropriate music for the zone:
// ************************************************************************************************
gs.startMusic = function () {
	if (this.zoneType().musicTrack) {
		this.getZoneMusic(this.zoneName).fadeIn(1000, true);
	}
};

// STOP_ALL_MUSIC:
// ************************************************************************************************
gs.stopAllMusic = function () {
	this.musicList.forEach(function (track) {
		track.stop();
	}, this);
};

// DESCRIPTION_OF_TILE_INDEX:
// Return a textual description of the tile located at tileIndex
// ************************************************************************************************
gs.descriptionOfTileIndex = function (tileIndex) {
	// Offscreen:
    if (!gs.isInBounds(tileIndex)) {
        return null;
    }
	// Unexplored:
	else if (!gs.getTile(tileIndex).explored) {
        return '未探索';
    }
	// Character:
	else if (gs.getChar(tileIndex) && gs.pc.canSeeCharacter(gs.getChar(tileIndex))) {
		return gs.characterDesc(gs.getChar(tileIndex));
    }
	// Merchant:
	else if (gs.getChar(tileIndex) && gs.inArray(gs.getChar(tileIndex).type.name, ['Merchant', 'SkillTrainer', 'TalentTrainer', 'Priest'])) {
		return gs.characterDesc(gs.getChar(tileIndex));
    }
	// Effect:
	else if (gs.getCloud(tileIndex) && gs.getTile(tileIndex).visible) {
			return translator.getText(gs.getCloud(tileIndex).name) || 'Effect';
    }
	// Item:
	else if (gs.getItem(tileIndex)) {
        return gs.getItem(tileIndex).item.toLongDesc();
	}
	// Object:
	else if (gs.getTile(tileIndex).object && !gs.getTile(tileIndex).object.type.isHidden) {
		return gs.objectDesc(gs.getTile(tileIndex).object);
	}	
	// Tile:
	else {
		return gs.tileDesc(gs.getTile(tileIndex));
	}
};

// PLAY_SOUND:
// ************************************************************************************************
gs.playSound = function (sound, tileIndex) {
	if (!tileIndex || gs.getTile(tileIndex).visible || util.distance(gs.pc.tileIndex, tileIndex) < 10) {
		if (this.soundOn) {
			sound.play(null, null, gs.soundVolume);
		}
	}
};

// GAME_TIME:
// Returns the time since starting new game.
// Takes loading and continuing into account
// ************************************************************************************************
gs.gameTime = function () {
	return this.timer.ms + gs.savedTime;
};

// LOAD_RANDOM_MAP_AS_BACKGROUND:
// ************************************************************************************************
gs.loadRandomMapAsBackground = function () {	
	// Load Map:
	gs.debugProperties.mapExplored = true;
	gs.debugProperties.mapVisible = true;
	gs.debugProperties.dressRooms = true;
	gs.debugProperties.spawnMobs = true;
	gs.debugProperties.spawnZoos = true;
	gs.debugProperties.generateGlobalStuff = true;
	gs.debugProperties.useLighting = false;
	
	gs.previouslySpawnedFeatures = [];
	gs.previouslySpawnedVaults = [];
	gs.previouslySpawnedUniques = [];
	gs.previouslySpawnedStaticLevels = [];
	gs.previouslySpawnedItems = [];
	
	gs.crystalChestGroupIsOpen = [];
	gs.remainingAltars = [];
	
	gs.branches = [
		'TheUpperDungeon', 
		'TheOrcFortress', 'TheUnderGrove', 'TheSunlessDesert', 'TheSwamp',
		'TheDarkTemple', 'TheCrypt', 'TheIronFortress',
		'TheArcaneTower', 'TheSewers', 'TheIceCaves', 'TheCore',
		'VaultOfYendor'
	];
	
	gs.seed = '' + Date.now();
	gs.zoneName = util.randElem(gs.branches);
	gs.zoneLevel = util.randInt(1, 4);
	gs.generateLevel();
	
	// Set map visible:
	gs.exploreMap();
	gs.getAllIndex().forEach(function (tileIndex) {
		gs.getTile(tileIndex).visible = true;
	}, this);
	
	// Focus Camera:
	game.world.bounds.setTo(-1000, -1000, (this.numTilesX - 1) * TILE_SIZE + 2000, (this.numTilesY - 1) * TILE_SIZE + 3000);
	game.camera.setBoundsToWorld();

	
	// Make sure NPCs are visible and not displaying their hud info
	gs.updateTileMapSprites();
	gs.characterList.forEach(function (npc) {
		npc.updateFrame();
		npc.statusText.visible = false;
		npc.hpText.visible = false;
		npc.ringSprite.visible = false;
	}, this);
	
	this.pc.sprite.visible = false;
};


// LOCAL_STORAGE_SPACE:
// ************************************************************************************************
gs.localStorageSpace = function() {
	var allStrings = '';
	for(var key in localStorage){
		if (localStorage.hasOwnProperty(key)){
			allStrings += localStorage[key];
		}
	}
	return allStrings ? 3 + ((allStrings.length*16)/(8*1024)) + ' KB' : 'Empty (0 KB)';
};

// POST_STATS:
// ************************************************************************************************
gs.postStats = function (text) {
	if (!gs.globalData.userName || gs.globalData.userName.length <= 3 || gs.globalData.userName.length > 30 || !gs.debugProperties.logStats) {
		return;
	}
	console.log('attempting to send stats to server...');
	var xhttp = new XMLHttpRequest();
	var data = {
		playerName: gs.globalData.userName,
		zoneName: gs.capitalSplit(this.zoneName),
		zoneLevel: this.niceZoneLevel(this.zoneName, this.zoneLevel),
		text: text,
		playerClass: gs.pc.characterClass,
		playerLevel: gs.pc.level,
		time: gs.timeToString(gs.gameTime()),
	};
	xhttp.open('POST','https://justinwang123.pythonanywhere.com/stats/submit',true);
	xhttp.send(JSON.stringify(data));
};

// SET_STATE:
// ************************************************************************************************
gs.setState = function (newState) {
	this.state = newState;
};

// SET_MUSIC_VOLUME:
// ************************************************************************************************
gs.setMusicVolume = function (volume) {
	gs.musicList.forEach(function (music) {
		music.volume = volume;
	}, this);
};

// PLAYER_DATA_EXISTS:
// ************************************************************************************************
gs.playerDataExists = function () {
	return localStorage.getItem('PlayerData') !== null;
};

// ON_WINDOW_CLOSE:
// ************************************************************************************************
gs.onWindowClose = function () {
	if (gs.globalState === 'GAME_STATE' && gs.pc.isAlive) {
		gs.saveLevel();
		gs.pc.save();
	}
	
	gs.saveGlobalData();
};