/*global game, gs, console, Phaser, menuState*/
/*global SCALE_FACTOR, SCREEN_WIDTH, ZONE_FADE_TIME, SMALL_WHITE_FONT, HUD_START_X, SCREEN_HEIGHT, HUD_WIDTH*/
/*global LARGE_WHITE_FONT, HUGE_WHITE_FONT*/

'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function RaceSelectMenu () {
	var sprite,
		startX = HUD_START_X,
		width = SCREEN_WIDTH - startX,
		iconSpaceY = 34;
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;

	// Menu Sprite:
	sprite = gs.createSprite(0, 0, 'HUD', this.group);
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Title Text:
	this.titleText = gs.createText(startX + width / 2, 0, '选择种族', HUGE_WHITE_FONT, this.group); 
	this.titleText.anchor.setTo(0.5, 0);
	
	// Text:
	this.text = gs.createText(startX + 8, SCREEN_HEIGHT, '', LARGE_WHITE_FONT, this.group); 
	this.text.lineSpacing = -5;
	this.text.wordWrapWidth = HUD_WIDTH;
	this.text.wordWrap = true;
	this.text.anchor.setTo(0, 1);
	
	// Create Race Buttons:
	this.raceButtons = [];
	gs.playerRaceList.forEach(function (playerRace, i) {
		var button;
		button = gs.createTextButton(startX + width / 2, 50 + i * iconSpaceY, translator.getText(playerRace.name), this.raceClicked, this, this.group);
		button.button.playerRace = playerRace;
		this.raceButtons.push(button);
	}, this);
	
	// Back button:
	this.backButton = gs.createTextButton(startX + width / 2, this.raceButtons[this.raceButtons.length - 1].group.y + iconSpaceY, '返回', this.onBackClicked, this, this.group);
	
	
	
	this.group.visible = false;
}

// UPDATE:
RaceSelectMenu.prototype.update = function () {
	this.raceButtons.forEach(function (textButton) {
		if (textButton.button.input.checkPointerOver(game.input.activePointer)) {
			this.text.setText(textButton.button.playerRace.desc());
		}
	}, this);
};

// RACE_CLICKED:
// ************************************************************************************************
RaceSelectMenu.prototype.raceClicked = function (button) {
	// Clearing game data to start the new game
	gs.clearGameData();
	
	gs.startDailyChallenge = false;
	
	// Set Race:
	gs.playerRace = button.playerRace;
	
	gs.mainMenuBase.startGame();
};


// OPEN:
// ************************************************************************************************
RaceSelectMenu.prototype.open = function () {
	gs.state = 'RACE_SELECT_MENU_STATE';
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
RaceSelectMenu.prototype.close = function () {
	this.group.visible = false;
};

// ON_BACK_CLICKED:
// ************************************************************************************************
RaceSelectMenu.prototype.onBackClicked = function () {
	this.close();
	gs.classSelectMenu.open();
};

// IS_OPEN:
// ************************************************************************************************
RaceSelectMenu.prototype.isOpen = function () {
	return this.group.visible;
};
