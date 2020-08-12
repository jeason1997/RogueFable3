/*global gs, console, game, menuState*/
/*global SCREEN_HEIGHT, SCALE_FACTOR, SMALL_WHITE_FONT, HUGE_WHITE_FONT, CLASS_LIST, PLAYER_FRAMES, HUD_START_X*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// UI_RECORD_MENU:
// ************************************************************************************************
function UIRecordMenu() {
	var width = HUD_START_X,
        height = 540,
		startX = 2,
		startY = 2,
		sprite;
	
	this.group = game.add.group();
	this.group.fixedToCamera = true;
		
	// Menu:
    sprite = gs.createSprite(0, 0, 'Menu', this.group);
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Title:
	this.titleText = gs.createText(startX + width / 2, startY + 20, '成就', HUGE_WHITE_FONT, this.group);
	gs.centerText(this.titleText);
	
	// Class Buttons:
	startX = (width - (12 * 54)) / 2;
	this.classButtons = {};
	['All'].concat(CLASS_LIST.concat(['Challenge'])).forEach(function (className, i) {
		let x = startX + i * 50 + 4,
			y = startY + 40;
		
		let button = gs.createButton(x, y, 'BigSlot', this.classClicked, this, this.group);
		button.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
		button.setFrames(1, 0);
		button.className = className;
		
		this.classButtons[className] = button;
		
		let sprite = gs.createSprite(x + 4, y + 4, 'Tileset',  this.group);
		sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
		
		
		if (className === 'Challenge') {
			sprite.frame = 1226;
		}
		else if (className === 'All') {
			sprite.frame = 1227;
		}
		else {
			sprite.frame = PLAYER_FRAMES[className];
		}
	}, this);
	
	startX = 2;
	
	
	// Text:
	this.text = gs.createText(startX + 4, startY + 100, '', SMALL_WHITE_FONT, this.group);
	
	// Close button:
	this.closeButton = gs.createTextButton(startX + width / 2, SCREEN_HEIGHT - 20, '关闭', this.close, this, this.group);
	
	
	// Start with All selected:
	this.classClicked({className: 'All'});
	
	
	this.group.visible = false;
}

// CLASS_CLICKED:
// ************************************************************************************************
UIRecordMenu.prototype.classClicked = function (button) {
	// Previous button:
	if (this.selectedClass) {
		this.classButtons[this.selectedClass].setFrames(1, 0);
	}
	
	this.selectedClass = button.className;
	this.classButtons[this.selectedClass].setFrames(2, 3);
	
	this.refresh();
};

// UPDATE:
UIRecordMenu.prototype.update = function () {
};

// REFRESH:
// ************************************************************************************************
UIRecordMenu.prototype.refresh = function () {
	var str = '',
		latestRecords,
		numWins,
		numDeaths;
	
	// WINS_LOSSES_AND_PERCENT:
	if (this.selectedClass === 'All') {
		numWins = gs.totalWins();
		numDeaths = gs.totalDeaths();
	}
	else if (this.selectedClass === 'Challenge') {
		numWins = gs.numChallengeWins();
		numDeaths = gs.numChallengeDeaths();
	}
	else {
		numWins = gs.numWinsWithClass(this.selectedClass);
		numDeaths = gs.numDeathsWithClass(this.selectedClass);
	}
	
	str += '通关次数: ' + numWins + '\n';
	str += '死亡次数: ' + numDeaths + '\n';

	if (numWins + numDeaths > 0) {
		str += '通关比例: ' + gs.toPercentStr(numWins / (numWins + numDeaths)) + '\n';
	}
	
	// FASTEST_TIME:
	if (this.selectedClass === 'All') {
		let obj = gs.fastestWinTime();
		if (obj) {
			str += 'Fastest Win Time: ' + gs.timeToString(obj.time) + ' - ' + gs.capitalSplit(obj.className) + '\n';
		}
		
	}
	else if (this.selectedClass === 'Challenge') {
		
	}
	else {
		if (gs.achievements[this.selectedClass] > 0) {
			str += 'Fastest win Time: ' + gs.timeToString(gs.achievements[this.selectedClass]) + '\n';
		}	
	}

	// WIN_STREAK:
	if (this.selectedClass === 'All') {
		if (gs.highestWinStreak() > 1) {
			str += '最佳连胜次数: ' + gs.highestWinStreak() + ' - ' + gs.highestWinStreakClass() +'\n';
		}
	}
	else if (this.selectedClass === 'Challenge') {
		if (gs.bestChallengeWinStreak() > 1) {
			str += '最佳连胜次数: ' + gs.bestChallengeWinStreak() + '\n';
		}
	}
	else {
		if (gs.bestWinStreakWithClass(this.selectedClass) > 1) {
			str += '最佳连胜次数: ' + gs.bestWinStreakWithClass(this.selectedClass) + '\n';
		}
	}
	str += '\n';
	
	
	// Get the last 7 games:
	if (this.selectedClass === 'All') {
		latestRecords = gs.gameRecords.slice(-7);
	}
	else if (this.selectedClass === 'Challenge') {
		latestRecords = gs.gameRecords.filter(record => record.isChallenge).slice(-7);
	}
	else {
		latestRecords = gs.gameRecords.filter(record => record.playerClass === this.selectedClass).slice(-7);
	}
	
	
	
	
	latestRecords.reverse();
	latestRecords.forEach(function (record) {
		str += record.toString() + '\n\n';
	}, this);
	
	let lines = gs.wrapText(str, 100);
	this.text.setText(lines.join('\n'));
};

// OPEN:
// ************************************************************************************************
UIRecordMenu.prototype.open = function () {
	gs.state = 'RECORD_MENU_STATE';
	this.refresh();
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
UIRecordMenu.prototype.close = function () {
	this.group.visible = false;
};

// IS_OPEN:
// ************************************************************************************************
UIRecordMenu.prototype.isOpen = function () {
	return this.group.visible;
};