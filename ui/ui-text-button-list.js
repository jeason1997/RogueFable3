/*global game, gs, console, Phaser*/
/*global SMALL_WHITE_FONT, SCALE_FACTOR, LARGE_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';

// UI_TEXT_BUTTON_LIST
// ************************************************************************************************
function UITextButtonList(startX, startY, numButtons, group, context, callback) {
	var buttonSpace = 34;
	
	this.startIndex = 0;
	this.group = group;
	this.buttons = [];
	
	// Buttons:
	for (let i = 0; i < numButtons; i += 1) {
		this.buttons[i] =  this.createButton(startX, startY + i * buttonSpace, context, callback);
	}
	
	// Arrows:
	this.upArrow = game.add.button(startX + 120, startY - 20, 'Tileset', this.upClicked, this, 1296, 1295);
	this.upArrow.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.group.add(this.upArrow);
	
	this.downArrow = game.add.button(startX + 120, startY + (numButtons - 1) * buttonSpace - 20, 'Tileset', this.downClicked, this, 1294, 1293);
	this.downArrow.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.group.add(this.downArrow);
	
}

// CREATE_BUTTON:
// ************************************************************************************************
UITextButtonList.prototype.createButton = function (x, y, context, callback) {
	var button = {};
    
    // Create button group:
    button.group = game.add.group();
    
    // Create button:
    button.button = game.add.button(x, y, 'Button', callback, context, 1, 0, 0, 0);
	button.button.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
    button.button.smoothed = false;
    button.button.anchor.setTo(0.5, 0.5);
    button.group.add(button.button);
    
    // Create text:
    button.text = game.add.text(x - button.button.width / 2 + 4, y - button.button.height / 2 + 6, 'Default', LARGE_WHITE_FONT);
    button.group.add(button.text);
	
	// Num Text:
	button.numText = game.add.text(x + button.button.width / 2 - 4, y - button.button.height / 2 + 6, '5/5', LARGE_WHITE_FONT);
	button.numText.anchor.setTo(1, 0);
	button.group.add(button.numText);
	
	this.group.add(button.group);
    
    return button;
};

// DOWN_CLICKED:
// ************************************************************************************************
UITextButtonList.prototype.downClicked = function () {
	this.startIndex += 1;
	gs.characterMenu.refresh();
};

// UP_CLICKED:
// ************************************************************************************************
UITextButtonList.prototype.upClicked = function () {
	if (this.startIndex > 0) {
		this.startIndex -= 1;
		gs.characterMenu.refresh();
	}
};