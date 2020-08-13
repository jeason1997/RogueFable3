/*global game, gs, console, Phaser, localStorage*/
/*global menuState*/
/*global SMALL_WHITE_FONT, LARGE_WHITE_FONT, CLASS_LIST, HUD_START_X, HUGE_WHITE_FONT*/
/*global SCALE_FACTOR, ITEM_SLOT_FRAME, PLAYER_FRAMES, SCREEN_WIDTH, SCREEN_HEIGHT, ZONE_FADE_TIME*/
/*jshint esversion: 6*/

'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function ClassSelectMenu () {
	var sprite, 
		iconSpaceY, 
		i = 0, 
		startX = HUD_START_X, 
		startY = 0,
		width = SCREEN_WIDTH - startX,
		str;
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;

	// Menu Sprite:
	sprite = gs.createSprite(0, 0, 'HUD', this.group);
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Title Text:
	this.titleText = gs.createText(startX + width / 2, 0, '选择职业', HUGE_WHITE_FONT, this.group); 
	this.titleText.anchor.setTo(0.5, 0);
	
	iconSpaceY = 50;
	
	// Create class panels:
	this.classPanelList = [];
	CLASS_LIST.forEach(function (className, i) {
		this.classPanelList.push(this.createClassPanel(startX + 6, startY + 34 + i * iconSpaceY, className));
	}, this);
	
	
	// Daily Challenge:
	this.createChallengePanel(startX + 6, 534);
	
	// Back button:
	this.backButton = gs.createTextButton(startX + width / 2, 534 + 70, '返回', this.onBackClicked, this, this.group);
	
	// Achievement Text:
	this.achievementText = gs.createText(startX + 8, SCREEN_HEIGHT, '', LARGE_WHITE_FONT, this.group);
	this.achievementText.lineSpacing = -5;
	this.achievementText.anchor.setTo(0, 1);
	
	this.group.visible = false;
}

// RECORDS_CLICKED:
// ************************************************************************************************
ClassSelectMenu.prototype.recordsClicked = function () {
	if (menuState.recordMenu.group.visible) {
		menuState.recordMenu.close();
	}
	else {
		menuState.recordMenu.open();
	}
};

// CREATE_CHALLENGE_PANEL:
// ************************************************************************************************
ClassSelectMenu.prototype.createChallengePanel = function (x, y) {
	this.challengeButton = gs.createButton(x, y, 'BigSlot', this.challengeClicked, this, this.group);
	this.challengeButton.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.challengeButton.setFrames(1, 0);
	
	this.challengeSprite = gs.createSprite(x + 4, y + 4, 'Tileset', this.group);
	this.challengeSprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.challengeSprite.frame = 1226;
	
	this.challengeText = gs.createText(x + 60, y - 2, 'Daily Challenge', LARGE_WHITE_FONT, this.group);
	
	this.challengeAchivements = [];
	for (let i = 0; i < 3; i += 1) {
		this.challengeAchivements[i] = gs.createSprite(x + 54 + i * 32, y + 14, 'Tileset', this.group);
		this.challengeAchivements[i].frame = 1269 + i;
		this.challengeAchivements[i].scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
		this.challengeAchivements[i].inputEnabled = true;
	}
	

};

// CREATE_CLASS_PANEL:
// ************************************************************************************************
ClassSelectMenu.prototype.createClassPanel = function (x, y, className) {
	var classPanel = {}, str;
	
	classPanel.className = className;
	
	classPanel.button = gs.createButton(x, y, 'BigSlot', this.classClicked, this, this.group);
	classPanel.button.className = className;
	classPanel.button.scale.setTo(2, 2);
	classPanel.button.setFrames(1, 0);

	// Class Image: 
	classPanel.image =  gs.createSprite(x + 4, y + 4, 'Tileset', this.group);
	classPanel.image.scale.setTo(2, 2);
	classPanel.image.frame = PLAYER_FRAMES[className];

	// Class Name Text:
	str = translator.getText(className);
	if (gs.achievements[className] > 0) {
		str += ' [' + gs.timeToString(gs.achievements[className]) + ']';
	}
	classPanel.text = gs.createText(x + 60, y - 2, str, LARGE_WHITE_FONT, this.group);

	
	// Achievements:
	classPanel.achievementIcons = [];
	classPanel.achievementIcons[0] = gs.createSprite(x + 54, y + 14, 'Tileset', this.group);
	classPanel.achievementIcons[0].frame = 1266;
	classPanel.achievementIcons[0].scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	classPanel.achievementIcons[0].inputEnabled = true;
	


	classPanel.achievementIcons[1] = gs.createSprite(x + 54 + 32, y + 14, 'Tileset', this.group);
	classPanel.achievementIcons[1].frame = 1267;
	classPanel.achievementIcons[1].scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	classPanel.achievementIcons[1].inputEnabled = true;
	


	classPanel.achievementIcons[2] = gs.createSprite(x + 54 + 64, y + 14, 'Tileset', this.group);
	classPanel.achievementIcons[2].frame = 1268;
	classPanel.achievementIcons[2].scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	classPanel.achievementIcons[2].inputEnabled = true;


	return classPanel;
};

// UPDATE:
// ************************************************************************************************
ClassSelectMenu.prototype.update = function () {
	var str = '';
	this.achievementText.setText('');
	
	
	this.classPanelList.forEach(function (panel) {
		// Set Achievement Text:
		if (panel.achievementIcons[0].input.checkPointerOver(game.input.activePointer)) {
			str = '首次胜利。';
		}
		if (panel.achievementIcons[1].input.checkPointerOver(game.input.activePointer)) {
			str = '在60分钟内获胜。';
		}
		if (panel.achievementIcons[2].input.checkPointerOver(game.input.activePointer)) {
			str = '在45分钟内获胜。';
		}
		
		// Set Class Text:
		if (panel.button.input.checkPointerOver(game.input.activePointer)) {
			str = translator.getText(panel.button.className);
			
			if (panel.button.className === 'Barbarian') {
				str += '\n杀死敌人时，能力会冷却。';
			}
			
			str += this.getStatsFor(panel.button.className);
		}
	}, this);
	
	// Set Daily Challenge Text:
	if (this.challengeButton.input.checkPointerOver(game.input.activePointer)) {
		let date = new Date();
		
		// Already completed challenge:
		if (this.isChallengeComplete()) {
			str = "Daily Challenge Complete for: " + date.toDateString();
		}
		// Challenge not started:
		else {
			str = "开始每日挑战: " + date.toDateString();
		}
		
		str += '\n最佳连胜次数: ' + gs.bestChallengeWinStreak();
		str += '\n当前连胜次数: ' + gs.currentChallengeWinStreak();
	}
	
	// Set Achievement Text:
	if (this.challengeAchivements[0].input.checkPointerOver(game.input.activePointer)) {
		str = 'Win 2 daily challenges in a row.';
	}
	if (this.challengeAchivements[1].input.checkPointerOver(game.input.activePointer)) {
		str = 'Win 3 daily challenges in a row.';
	}
	if (this.challengeAchivements[2].input.checkPointerOver(game.input.activePointer)) {
		str = 'Win 5 daily challenges in a row.';
	}
	
	this.achievementText.setText(gs.wrapText(str, 30).join('\n'));
};

// GET_STATS_FOR:
// ************************************************************************************************
ClassSelectMenu.prototype.getStatsFor = function (className) {
	var str = '\n';
	if (gs.achievements[className] > 0) {
		str += 'Best Win Time: ' + gs.timeToString(gs.achievements[className]) + '\n';
	}
	
	//str += 'Num Wins: ' + gs.numWinsWithClass(className) + '\n';
	//str += 'Num Deaths: ' + gs.numDeathsWithClass(className) + '\n';
	str += '最佳连胜次数: ' + gs.bestWinStreakWithClass(className) + '\n';
	str += '当前连胜次数: ' + gs.currentWinStreakWithClass(className);
	return str;
};

// IS_CHALLENGE_COMPLETE:
// ************************************************************************************************
ClassSelectMenu.prototype.isChallengeComplete = function () {
	let date = new Date();
	return gs.achievements.lastChallenge === "" + date.getFullYear() + date.getMonth() + date.getDate();
};

// CLASS_CLICKED:
// ************************************************************************************************
ClassSelectMenu.prototype.classClicked = function (button) {
	gs.playerClass = button.className;
	this.close();
	gs.raceSelectMenu.open();
};

// OPEN:
// ************************************************************************************************
ClassSelectMenu.prototype.open = function () {
	gs.state = 'CLASS_SELECT_MENU_STATE';
	
	this.classPanelList.forEach(function (panel) {
		// Locked:
		if (gs.achievements[panel.className] === 0) {
			panel.achievementIcons[0].tint = 0x555555;
		}
		else {
			panel.achievementIcons[0].tint = 0xffffff;
		}
		
		// Locked:
		if (gs.achievements[panel.className] === 0 || gs.achievements[panel.className] > 60 * 60 * 1000) {
			panel.achievementIcons[1].tint = 0x555555;
		}
		else {
			panel.achievementIcons[1].tint = 0xffffff;
		}
		
		// Locked:
		if (gs.achievements[panel.className] === 0 || gs.achievements[panel.className] > 45 * 60 * 1000) {
			panel.achievementIcons[2].tint = 0x555555;
		}
		else {
			panel.achievementIcons[2].tint = 0xffffff;
		}
	}, this);
	
	
	if (gs.bestChallengeWinStreak() < 2) {
		this.challengeAchivements[0].tint = 0x555555;
	}
	else {
		this.challengeAchivements[0].tint = 0xffffff;
	}
	
	if (gs.bestChallengeWinStreak() < 3) {
		this.challengeAchivements[1].tint = 0x555555;
	}
	else {
		this.challengeAchivements[1].tint = 0xffffff;
	}
	
	if (gs.bestChallengeWinStreak() < 5) {
		this.challengeAchivements[2].tint = 0x555555;
	}
	else {
		this.challengeAchivements[2].tint = 0xffffff;
	}
	
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
ClassSelectMenu.prototype.close = function () {
	this.group.visible = false;
};

// CHALLENGE_CLICKED:
// ************************************************************************************************
ClassSelectMenu.prototype.challengeClicked = function () {
	if (!this.isChallengeComplete()) {
		// Clearing game data to start the new game:
		gs.clearGameData();

		gs.startDailyChallenge = true;
		
		gs.mainMenuBase.startGame();
	}
};

// ON_BACK_CLICKED
// ************************************************************************************************
ClassSelectMenu.prototype.onBackClicked = function () {
	this.close();
	gs.mainMenu.open();
};

// IS_OPEN:
// ************************************************************************************************
ClassSelectMenu.prototype.isOpen = function () {
	return this.group.visible;
};
