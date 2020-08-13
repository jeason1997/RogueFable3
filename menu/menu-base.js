/*global game, Phaser, localStorage, gs, console, util, document, navigator*/
/*global ClassSelectMenu, RaceSelectMenu, UIRecordMenu, MainMenu*/
/*global LARGE_WHITE_FONT, TILE_SIZE, SCREEN_WIDTH, SCREEN_HEIGHT, SCALE_FACTOR*/
/*global PLAYER_FRAMES, HUGE_WHITE_FONT, ITEM_SLOT_FRAME, NUM_SCREEN_TILES_X, SMALL_WHITE_FONT, ZONE_FADE_TIME, LARGE_RED_FONT*/
/*global MUSIC_ON_BUTTON_FRAME, MUSIC_OFF_BUTTON_FRAME*/
/*jshint esversion: 6*/

'use strict';

var menuState = {};


// MAIN_MENU_BASE:
// ************************************************************************************************
function MainMenuBase () {
	let tileIndex;
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Game Title:
	gs.createSprite(120, 10, 'Title', this.group);
	
	// Version Text:
	this.versionText = gs.createText(4, 0, '版本: ' + gs.versionStr, SMALL_WHITE_FONT, this.group);
	
	// Credits Text:
	this.creditsText = gs.createText(4, SCREEN_HEIGHT, '汉化: Jeason1997\n程序及美术: Justin Wang\n音效: www.kenney.nl 和 ArtisticDude\n音乐: Nooskewl Games', SMALL_WHITE_FONT, this.group);
	this.creditsText.anchor.setTo(0, 1);
	
	// User Name Text:
	//this.userNameText = gs.createText(400, SCREEN_HEIGHT - 24, 'UserName: ', LARGE_WHITE_FONT, menuGroup);
	

	
	this.group.visible = false;
	
}

// UPDATE:
// ************************************************************************************************
MainMenuBase.prototype.update = function () {
	
	/*
	if (gs.globalData.userName && gs.globalData.userName.length >= 1) {
		this.userNameText.setText('User Name: ' + gs.globalData.userName);
		this.userNameText.setStyle(LARGE_WHITE_FONT);
	}
	else {
		this.userNameText.setText('Not logged in (see discord FAQ)');
		this.userNameText.setStyle(LARGE_RED_FONT);
	}
	*/
	
	
	gs.mainMenu.update();
	
	if (gs.classSelectMenu.isOpen()) {
		gs.classSelectMenu.update();
	}
	else if (gs.recordMenu.isOpen()) {
		gs.recordMenu.update();
	}
	else if (gs.raceSelectMenu.isOpen()) {	
		gs.raceSelectMenu.update();
	}
	
	if (gs.debugProperties.menuMap) {
		// Changing background levels:
		this.count += 1;
		if (gs.vectorEqual(gs.toTileIndex(this.camPos), this.camDestIndex)) {
			// Only change level if enough time has passed:
			if (this.count >= 300) {
				this.count = 0;
				gs.destroyLevel();
				gs.loadRandomMapAsBackground();
			}

			// Get new destIndex:
			this.camDestIndex = gs.getOpenIndexInLevel();
			while( gs.vectorEqual(this.camDestIndex, gs.toTileIndex(this.camPos))) {
				this.camDestIndex = gs.getOpenIndexInLevel();
			}
			this.camVelocity = util.normal(gs.toTileIndex(this.camPos), this.camDestIndex);

		}

		// Panning Camera:
		this.camPos.x += this.camVelocity.x * 2;
		this.camPos.y += this.camVelocity.y * 2;
		game.camera.focusOnXY(this.camPos.x + 124, this.camPos.y);
		gs.updateTileMapSprites();

		gs.objectSpritesGroup.sort('y', Phaser.Group.SORT_ASCENDING);
	}
	
	
};

// START_GAME:
// ************************************************************************************************
MainMenuBase.prototype.startGame = function () {
	var func;
	
	func = function () {
		this.close();
		gs.startGame();
		game.camera.flash('#ffffff', ZONE_FADE_TIME * 4);
		game.camera.onFadeComplete.removeAll();
	}.bind(this);
	
	// Starting a fade:
	game.camera.fade('#000000', ZONE_FADE_TIME * 2);
    game.camera.onFadeComplete.add(func, this);
};

// START_GAME:
// ************************************************************************************************
MainMenuBase.prototype.close = function () {
	gs.mainMenu.close();
	gs.raceSelectMenu.close();
	gs.recordMenu.close();
	gs.classSelectMenu.close();
	
	this.close();
};

// OPEN:
// ************************************************************************************************
MainMenuBase.prototype.open = function () {
	var tileIndex;
	
	// Random Map Background:
	if (gs.debugProperties.menuMap) {
		gs.loadRandomMapAsBackground();
		gs.shadowMaskSprite.visible = false;
	}
	
	
	// Music:
	gs.stopAllMusic();
	
	// Music On:
	if (gs.musicOn) {
		gs.music.MainMenu.loopFull();
	}
	// Music Off:
	else {
		gs.stopAllMusic();
	}
	
	if (gs.debugProperties.menuMap) {
		tileIndex = gs.getOpenIndexInLevel();
		this.camPos = {x: tileIndex.x * TILE_SIZE - TILE_SIZE / 2, y: tileIndex.y * TILE_SIZE - TILE_SIZE / 2};

		// Get dest (not same as pos):
		this.camDestIndex = gs.getOpenIndexInLevel();
		while (gs.vectorEqual(this.camDestIndex, gs.toTileIndex(this.camPos))) {
			this.camDestIndex = gs.getOpenIndexInLevel();
		}

		this.camVelocity = util.normal(gs.toTileIndex(this.camPos), this.camDestIndex);
		this.count = 0;
	}
	
	

	
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
MainMenuBase.prototype.close = function () {
	gs.mainMenu.close();
	gs.raceSelectMenu.close();
	gs.classSelectMenu.close();
	gs.recordMenu.close();
	gs.optionsMenu.close();
	this.group.visible = false;
};




