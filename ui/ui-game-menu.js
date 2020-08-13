/*global game, gs, Phaser, console, nw*/
/*global Item*/
/*global SCALE_FACTOR, HUGE_WHITE_FONT, SCREEN_HEIGHT, NUM_EQUIPMENT_SLOTS, HUD_START_X*/
/*global UIItemSlotList, ItemSlotList*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIGameMenu() {
	var width = 580,
        height = 540,
		startX = HUD_START_X / 2 - width / 2,
		startY = (SCREEN_HEIGHT - height) / 2,
		sprite;
	
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Menu Sprite:
	sprite = gs.createSprite(startX, startY, 'SmallMenu', this.group);
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Buttons:
	let spacing = 34, y = startY + 60;
	
	this.helpButton = 		gs.createTextButton(startX + width / 2, y + spacing * 0, '帮助', this.onHelpClicked, this, this.group);
	this.optionsButton = 	gs.createTextButton(startX + width / 2, y + spacing * 1, '设置', this.onOptionsClicked, this, this.group);
	this.exitButton = 		gs.createTextButton(startX + width / 2, y + spacing * 2, '返回到主菜单', this.onMainMenuClicked, this, this.group);
	this.desktopButton =	gs.createTextButton(startX + width / 2, y + spacing * 3, '返回到桌面', this.onDesktopClicked, this, this.group);	
	
	// Title Text:
	this.titleText = gs.createText(startX + width / 2, startY + 20, '游戏菜单:', HUGE_WHITE_FONT, this.group);
	gs.centerText(this.titleText);

	// Close button:
	this.closeButton = gs.createTextButton(startX + width / 2, startY + height - 20, '关闭', this.close, this, this.group);
	
	this.group.visible = false;
}

// REFRESH:
// ************************************************************************************************
UIGameMenu.prototype.refresh = function () {
	
};

// OPEN:
// ************************************************************************************************
UIGameMenu.prototype.open = function () {
	gs.pc.stopExploring();
	gs.timer.pause();
	this.refresh();
	gs.state = 'GAME_MENU_STATE';
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
UIGameMenu.prototype.close = function () {
	gs.timer.resume();
	gs.state = 'GAME_STATE';
	this.group.visible = false;
};

// ON_HELP_CLICKED:
// ************************************************************************************************
UIGameMenu.prototype.onHelpClicked = function () {
	this.close();
	gs.helpMenu.open();
};

// ON_OPTIONS_CLICKED:
// ************************************************************************************************
UIGameMenu.prototype.onOptionsClicked = function () {
	this.close();
	gs.optionsMenu.open();
};

// ON_DESKTOP_CLICKED:
// ************************************************************************************************
UIGameMenu.prototype.onDesktopClicked = function () {
	gs.saveLevel();
	gs.pc.save();
	gs.saveGlobalData();
	
	//nw.App.closeAllWindows();
};

// ON_MAIN_MENU_CLICKED:
// ************************************************************************************************
UIGameMenu.prototype.onMainMenuClicked = function () {
	this.close();
	
	gs.saveLevel();
	gs.pc.save();
	
	gs.destroyLevel();
	gs.startMainMenu();
};

