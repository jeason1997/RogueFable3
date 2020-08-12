/*global gs, console, game*/
/*global SCREEN_HEIGHT, SCALE_FACTOR, SMALL_WHITE_FONT, HUGE_WHITE_FONT, HUD_START_X*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// UI_HELP_MENU:
// ************************************************************************************************
function UIHelpMenu() {
	var width = 580,
        height = 540,
		startX = HUD_START_X / 2 - width / 2,
		startY = (SCREEN_HEIGHT - height) / 2,
		sprite,
		str = '';
	
	this.group = game.add.group();
	this.group.fixedToCamera = true;
		
	// Menu:
    sprite = gs.createSprite(startX, startY, 'SmallMenu', this.group);
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Title:
	this.titleText = gs.createText(startX + width / 2, startY + 20, 'Controls', HUGE_WHITE_FONT, this.group);
	gs.centerText(this.titleText);
	
	// Help String:
	str += "- The Num Pad keys can be used for movement\n";
	str += "- Shift + click a tile to move into dangerous terrain\n";
	str += "- Click your character to wait a turn.\n";
	str += "- Shift + clicking your character will perform extended rest\n";
	str += "- Space, Enter, NumPad 5 are hotkeys for clicking yourself\n";
	str += "- 1, 2, 3 etc. are hotkeys for your abilities\n";
	str += "- [a] toggle keyboard targeting mode\n";
	str += "- [w] swap between current and previous weapon\n";
	str += "- [tab] auto attack nearest enemy\n";
	str += "- [q] auto attack nearest enemy with quick slot weapon\n";
	str += "- [esc] closes menus and cancels abilities or items\n";
	str += "- [s] to use any stairs\n";
	str += "- [>] to use down stairs or fast travel to them\n";
	str += "- [<] to use up stairs or fast travel to them\n";
	str += "- [e] to auto explore\n";
	
	// Text:
	let lines = gs.wrapText(str, 61);
	this.text = gs.createText(startX + 4, startY + 40, lines.join('\n'), SMALL_WHITE_FONT, this.group);
	
	// Close button:
	this.closeButton = gs.createTextButton(startX + width / 2, startY + 520, '关闭', this.close, this, this.group);
	
	this.group.visible = false;
}

// OPEN:
// ************************************************************************************************
UIHelpMenu.prototype.open = function () {
	gs.state = 'HELP_MENU_STATE';
	gs.timer.pause();
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
UIHelpMenu.prototype.close = function () {
	this.group.visible = false;
	gs.gameMenu.open();
};