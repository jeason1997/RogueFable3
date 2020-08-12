/*global gs, game, nw, localStorage, console*/
/*global menuState*/
/*global HUD_START_X, SCREEN_WIDTH, SCALE_FACTOR, ZONE_FADE_TIME, HUGE_WHITE_FONT, LARGE_WHITE_FONT*/
/*global SCREEN_HEIGHT, SMALL_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';




// CONSTRUCTOR:
// ************************************************************************************************
function MainMenu () {
	var startX = HUD_START_X, 
		startY = 0,
		width = SCREEN_WIDTH - startX,
		sprite;
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Menu Sprite:
	sprite = gs.createSprite(0, 0, 'HUD', this.group);
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Title Text:
	this.titleText = gs.createText(startX + width / 2, 0, '主菜单', HUGE_WHITE_FONT, this.group); 
	this.titleText.anchor.setTo(0.5, 0);
	
	// Buttons:
	let y = 65, spacing = 34, i = 0;
	
	this.newGameButton = 		gs.createTextButton(startX + width / 2, y + spacing * i++, '新游戏', this.onNewGameClicked, this, this.group);
	this.continueGameButton = 	gs.createTextButton(startX + width / 2, y + spacing * i++, '继续游戏', this.onContinueGameClicked, this, this.group);
	this.recordsButton = 		gs.createTextButton(startX + width / 2, y + spacing * i++, '成就', this.onRecordsClicked, this, this.group);
	this.optionsButton =		gs.createTextButton(startX + width / 2, y + spacing * i++, '设置', this.onOptionsClicked, this, this.group);	
	this.exitButton = 			gs.createTextButton(startX + width / 2, y + spacing * i++, '退出', this.onExitClicked, this, this.group);	
	
	// Text:
	this.text = gs.createText(startX + 8, SCREEN_HEIGHT, '', LARGE_WHITE_FONT, this.group);
	this.text.lineSpacing = -5;
	this.text.anchor.setTo(0, 1);
	
	this.group.visible = false;
}

// UPDATE:
// ************************************************************************************************
MainMenu.prototype.update = function () {
	let str = '';
	
	// Set Continue Text:
	if (gs.playerDataExists() && this.continueGameButton.button.input.checkPointerOver(game.input.activePointer)) {		
		str = 'level ' + this.saveData.level + ' ';
		str += gs.capitalSplit(this.saveData.race) + ' ';
		str += gs.capitalSplit(this.saveData.characterClass) + '\n';
		str += gs.capitalSplit(this.saveData.zoneName) + ' ';
		str += gs.niceZoneLevel(this.saveData.zoneName, this.saveData.zoneLevel);
	}
	
	this.text.setText(gs.wrapText(str, 32).join('\n'));
};

// OPEN:
// ************************************************************************************************
MainMenu.prototype.open = function () {
	let y = 65, spacing = 34, i = 0;

	
	gs.state = 'MAIN_MENU_STATE';
	
	// Player has a save:
	if (gs.playerDataExists()) {
		this.saveData = JSON.parse(localStorage.getItem('PlayerData'));
		
		this.continueGameButton.group.visible = true;
		
		this.newGameButton.group.y = y + spacing * i++;
		this.continueGameButton.group.y = y + spacing * i++;
		this.recordsButton.group.y = y + spacing * i++;
		this.optionsButton.group.y =y + spacing * i++;
		this.exitButton.group.y = y + spacing * i++;

		
	}
	// Player has no save:
	else {
		this.continueGameButton.group.visible = false;
		
		this.newGameButton.group.y = y + spacing * i++;
		this.recordsButton.group.y = y + spacing * i++;
		this.optionsButton.group.y = y + spacing * i++;
		this.exitButton.group.y = y + spacing * i++;
	}
	
	
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
MainMenu.prototype.close = function () {
	this.group.visible = false;
};

// ON_NEW_GAME_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onNewGameClicked = function () {
	var onYes, dialog = [{}];
	
	onYes = function () {
		this.close();
		gs.classSelectMenu.open();
	}.bind(this);
	
	
	dialog[0].text = '您当前存储了一个已保存的游戏，确定要开始新游戏吗？';
	dialog[0].responses = [
		{text: '确定', nextLine: 'exit', func: onYes},
		{text: '取消', nextLine: 'exit'},
	];
	
	if (gs.playerDataExists() && !gs.debugProperties.startClass) {
		gs.dialogMenu.open(dialog);
	}
	else {
		onYes();
	}
	
	
};

// ON_CONTINUE_GAME_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onContinueGameClicked = function () {
	if (gs.playerDataExists()) {
		gs.startDailyChallenge = false;
		gs.mainMenuBase.startGame();
	}
};

// ON_RECORDS_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onRecordsClicked = function () {
	gs.optionsMenu.close();
	
	if (gs.recordMenu.isOpen()) {
		gs.recordMenu.close();
	}
	else {
		gs.recordMenu.open();
	}
};

// ON_OPTIONS_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onOptionsClicked = function () {
	gs.recordMenu.close();
	
	if (gs.optionsMenu.isOpen()) {
		gs.optionsMenu.close();
	}
	else {
		gs.optionsMenu.open();
	}
};

// ON_EXIT_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onExitClicked = function () {
	gs.saveGlobalData();
	//nw.App.closeAllWindows();
};

// IS_OPEN:
// ************************************************************************************************
MainMenu.prototype.isOpen = function () {
	return this.group.visible;
};