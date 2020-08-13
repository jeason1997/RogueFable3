/*global game, gs, Phaser, console, localStorage*/
/*global LARGE_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';


// OPEN_OPTIONS_MENU:
// *****************************************************************************
gs.openOptionsMenu = function () {
	if (gs.state === 'GAME_STATE') {
		gs.optionsMenu.open();
	} else if (gs.state === 'OPTIONS_MENU_STATE') {
		gs.optionsMenu.close();
	}
};
	
// OPEN_DEATH_MENU:
// *****************************************************************************
gs.openDeathMenu = function () {
	var dialog,
		respawnClicked,
		mainMenuClicked,
		deathText,
		charClicked;
	
	deathText = '你的' + gs.pc.level + '级' + translator.getText(gs.pc.characterClass) + '在' + translator.getText(gs.zoneName) + gs.deathText + '。';
	
	respawnClicked = function () {
		gs.pc.healHp(1000);
		gs.pc.poisonDamage = 0;
		gs.pc.isAlive = true;
	};
	
	mainMenuClicked = function () {
		gs.dialogMenu.close();
		gs.destroyLevel();
		gs.startMainMenu();
	};
	
	charClicked = function () {
		gs.characterMenu.open();
	};
	
	// Setup Dialog:
	dialog = [{}];
	dialog[0].text = deathText;
	dialog[0].responses = [
		{text: 'Instant Respawn (Testing)', nextLine: 'exit', prereq: function () {return gs.debugProperties.allowRespawn; }, func: respawnClicked},
		{text: '查看角色', nextLine: 'exit', func: charClicked},
		{text: '主菜单', nextLine: 'exit', func: mainMenuClicked}
	];
	
	
	this.dialogMenu.open(dialog);
};

// LIFE_SAVING_MENU:
// *****************************************************************************
gs.openLifeSavingMenu = function () {
	var dialog;
	
	gs.pc.inventory.removeItem(gs.pc.inventory.itemOfType(gs.itemTypes.RingOfLifeSaving));
		
	gs.pc.isAlive = true;
	gs.pc.healHp(gs.pc.maxHp);
	gs.pc.gainMp(gs.pc.maxMp);
		
	// Force players turn:
	gs.pc.waitTime = 0;
	gs.activeCharacterIndex = 0;
	gs.activeCharacter = gs.pc;
	
	// Setup Dialog:
	dialog = [{}];
	dialog[0].text = '你被杀了。你的生命之环闪烁着明亮的光芒，让你复活。';
	dialog[0].responses = [
		{text: 'ok', nextLine: 'exit'}
	];
	
	this.dialogMenu.open(dialog);
};

// OPEN_ALTER_MENU:
// *****************************************************************************
gs.openAltarMenu = function () {
	var okClicked, dialog, religionName;
	
	religionName = gs.currentAltar.type.religion;
	
	okClicked = function () {
		gs.pc.setReligion(religionName);
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};
	
	dialog = [{}];
	
	if (gs.pc.religion) {
		dialog[0].text = 'You pray at the altar of ' + gs.capitalSplit(religionName) + '. You are already worshipping a god!';
		dialog[0].responses = [{text: 'Ok', nextLine: 'exit'}];
	}
	else {
		dialog[0].text = 'You pray at the altar of ' + gs.capitalSplit(religionName) + ". " + gs.religionTypes[religionName].desc + ' Would you like to join this religion?';
		dialog[0].responses = [{text: 'Yes', nextLine: 'exit', func: okClicked},
							   {text: 'No', nextLine: 'exit'}
							  ];
	}
	
	
	this.dialogMenu.open(dialog);
};



// OPEN_VICTORY_MENU:
// *****************************************************************************
gs.openVictoryMenu = function () {
	var dialog = [{}],
		okClicked,
		time,
		mins;
	
	time = gs.gameTime();
	
	if (gs.achievements[gs.pc.characterClass] === 0 || time < gs.achievements[gs.pc.characterClass]) {
		gs.achievements[gs.pc.characterClass] = time;
	}
	
	
	gs.clearGameData();
	

	//gs.postStats('successfully retrieved the Goblet of Yendor');
	this.logGameRecord('successfully retrieved the Goblet of Yendor', true);
	
	okClicked = function () {
		gs.stopAllMusic();
		localStorage.setItem('Achievements', JSON.stringify(gs.achievements));
		
		gs.dialogMenu.close();
		gs.destroyLevel();
		gs.startMainMenu();
	};

	dialog[0].text = 'Your level ' + gs.pc.level + ' ' + gs.pc.characterClass + ' successfully retrieved the Goblet of Yendor in ' + this.timeToString(time) + '.';
	dialog[0].responses = [{text: '[Done]', nextLine: 'exit', func: okClicked}
						  ];
	gs.createEXPEffect(gs.pc.tileIndex);
	this.dialogMenu.open(dialog);
};

// OPEN_INSTRUCTION_MENU:
// *****************************************************************************
gs.openInstructionMenu = function () {
	var dialog = [{}];
	

	
	dialog[0].text = "Welcome to the Karhakas Mountains. You have been tasked by the Societas Eruditorum to explore these blasted peaks and recover the Codex of Knowledge, the legendary repository of ancient wisdom. The societies scholars believe that the codex is located in a ruined vault to the east of here. Good luck and stay safe!";
	dialog[0].responses = [{text: 'Warrior', nextLine: 'exit', func: gs.pc.setClass.bind(gs.pc, 'Warrior')},
						   {text: 'Ranger', nextLine: 'exit', func: gs.pc.setClass.bind(gs.pc, 'Ranger')},
						   {text: 'Rogue', nextLine: 'exit', func: gs.pc.setClass.bind(gs.pc, 'Rogue')},
						   {text: 'Psyker', nextLine: 'exit', func: gs.pc.setClass.bind(gs.pc, 'Psyker')}
						  ];
	
	this.dialogMenu.open(dialog);
};


// OPEN_ATTRIBUTE_GAIN_MENU:
// *****************************************************************************
gs.openAttributeGainMenu = function () {
	var dialog = [{}], strFunc, dexFunc, intFunc;
	
	strFunc = function () {
		gs.pc.baseStrength += 1;
		gs.pc.popUpText('+1 Str', '#ffffff');
		gs.pc.updateStats();
		gs.pc.currentHp += 2;
		
		gs.usingFountain = null;
	};
	
	dexFunc = function () {
		gs.pc.baseDexterity += 1;
		gs.pc.popUpText('+1 Dex', '#ffffff');
		gs.pc.updateStats();
		
		gs.usingFountain = null;
	};
	
	intFunc = function () {
		gs.pc.baseIntelligence += 1;
		gs.pc.popUpText('+1 Int', '#ffffff');
		gs.pc.updateStats();
		gs.pc.currentEp += 1;
		
		gs.usingFountain = null;
	};
	

	dialog[0].text = '选择要增加的属性。';
	dialog[0].responses = [
		// Strength:
		{
			text: function () {
				return '力量: ' + gs.pc.strength + ' -> ' + (gs.pc.strength + 1); 
			}, 
			nextLine: 'exit', 
			func: strFunc,
			desc: '力量:\n增加你的近战力量和最大生命值。'
		},
		
		// Dexterity:
		{
			text: function () {
				return '敏捷: ' + gs.pc.dexterity + ' -> ' + (gs.pc.dexterity + 1);
			},
			nextLine: 'exit',
			func: dexFunc,
			desc: '敏捷:\n增加你的射程、潜行和闪避。'
		},
		
		// Intelligence:
		{
			text: function () {
				return '智力: ' + gs.pc.intelligence + ' -> ' + (gs.pc.intelligence + 1);
			},
			nextLine: 'exit',
			func: intFunc,
			desc: '智力:\n增加你的法术力量和最高法力值。'
		},
	];
	
	this.dialogMenu.open(dialog);
};

// OPEN_HELP_MENU:
// ************************************************************************************************
gs.openHelpMenu = function () {
	var dialog = [];
	
	dialog[0] = {};
	dialog[0].text = 'KEYBOARD CONTROLS:' + '\n\n';
	dialog[0].text += 'NumPad: 8-way move, attack, interact.' + '\n';
	dialog[0].text += 'NumPad[5]: wait a turn.' + '\n';
	dialog[0].text += '[A]: Ranged targeting, NumPad[5] to confirm.' + '\n';
	dialog[0].text += '[W]: Wield previous weapon.' + '\n';
	dialog[0].text += '[R]: Recast previous spell.' + '\n';
	dialog[0].text += '[E]: Explore automatically.' + '\n';
	dialog[0].responses = [{text: 'Keyboard Conrols', nextLine: 0},
						   {text: 'Mouse Controls', nextLine: 1},
						   {text: 'General Advice', nextLine: 2},
						   {text: '[Done]', nextLine: 'exit'}];
	
	dialog[1] = {};
	dialog[1].text = 'MOUSE CONTROLS:' + '\n\n';
	dialog[1].text += 'Click Tile: move, attack, interact.' + '\n';
	dialog[1].text += 'Click Self: wait a turn.' + '\n';
	dialog[1].text += 'Click Mini Map: move to.' + '\n';
	dialog[1].text += 'Click Inventory: use/equip an item.' + '\n';
	dialog[1].responses = dialog[0].responses;
	
	dialog[2] = {};
	dialog[2].text = 'Your spear has a 2 tile range, you should be able to get a free hit on most enemies.';
	dialog[2].responses = [{text: '[More]', nextLine: 3},
						   {text: 'Keyboard Conrols', nextLine: 0},
						   {text: 'Mouse Controls', nextLine: 1},
						   {text: '[Done]', nextLine: 'exit'}];
	
	dialog[3] = {};
	dialog[3].text = 'Waiting a turn is a good way to get enemies to position themselves optimally. Its often better to find a good position and let them come to you.';
	dialog[3].responses = [{text: '[More]', nextLine: 4},
						   {text: 'Keyboard Conrols', nextLine: 0},
						   {text: 'Mouse Controls', nextLine: 1},
						   {text: '[Done]', nextLine: 'exit'}];
	
	dialog[4] = {};
	dialog[4].text = 'Water, rubble, vines and other surfaces provide an unstable footing. Any character, including yourself who is unstable is automatically critically hit.';
	dialog[4].responses = [{text: '[More]', nextLine: 5},
						   {text: 'Keyboard Conrols', nextLine: 0},
						   {text: 'Mouse Controls', nextLine: 1},
						   {text: '[Done]', nextLine: 'exit'}];
	
	dialog[5] = {};
	dialog[5].text = 'Your healing items are precious. You get full hp upon leveling and also when you find restoration tanks in dungeons. Try to conserve your consumables as much as possible.';
	dialog[5].responses = [{text: '[More]', nextLine: 6},
						   {text: 'Keyboard Conrols', nextLine: 0},
						   {text: 'Mouse Controls', nextLine: 1},
						   {text: '[Done]', nextLine: 'exit'}];
	
	this.dialogMenu.open(dialog);
};

// UI_TOGGLE_BUTTON:
// ************************************************************************************************
function UIToggleButton(x, y, tileset, upFrame, downFrame, group) {
	
	gs.createSprite(x, y, 'Slot', group);
	this.button = gs.createButton(x + 2, y + 2, tileset, this.clicked, this, group);
	this.button.frame = upFrame;
	this.state = 'UP';
	this.upFrame = upFrame;
	this.downFrame = downFrame;
}

UIToggleButton.prototype.toggleUp = function () {
	this.state = 'UP';
	this.button.frame = this.upFrame;
};

UIToggleButton.prototype.toggleDown = function () {
	this.state = 'DOWN';
	this.button.frame = this.downFrame;
};

UIToggleButton.prototype.clicked = function () {
	if (this.state === 'UP') {
		this.toggleDown();
	} else {
		this.toggleUp();
	}
};

UIToggleButton.prototype.isDown = function () {
	return this.state === 'DOWN';
};