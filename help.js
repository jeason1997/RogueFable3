/*global gs, localStorage*/
'use strict';

var help = {};

// LEVEL_UP_DIALOG:
// ************************************************************************************************
help.levelUpDialog = function () {
	var dialog;
	
	if (!gs.globalData.skills && gs.state !== 'DIALOG_MENU_STATE') {
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = 'You have gained a level! You now have skill and talent points to spend. Your hit points and mana have also been restored to full.';
		dialog[0].responses = [{text: 'Ok', nextLine: 'exit'}
							  ];

		gs.globalData.skills = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

// TALENT_DIALOG:
// ************************************************************************************************
help.talentDialog = function () {
	var dialog;
	
	if (!gs.globalData.talents && gs.state !== 'DIALOG_MENU_STATE') {
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = 'You have gained a talent point!. You will gain a talent point every 4 levels. You began the game with a book specific to your class from which you can learn new talents. If you have found other books you can also learn talents from them. All talents have a minimum skill requirement.';
		dialog[0].responses = [{text: 'Ok', nextLine: 'exit'}
							  ];

		gs.globalData.talents = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

// ITEM_DIALOG:
// ************************************************************************************************
help.itemDialog = function () {
	var dialog;
	
	if (!gs.globalData.items && gs.state !== 'DIALOG_MENU_STATE') {
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = 'You have just picked up a piece of equipment, press C to open your character menu and equip it!';
		dialog[0].responses = [{text: 'Ok', nextLine: 'exit'}
							  ];

		gs.globalData.items = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

// BOOK_DIALOG:
// ************************************************************************************************
help.bookDialog = function () {
	var dialog;
	
	if (!gs.globalData.books && gs.state !== 'DIALOG_MENU_STATE') {
		
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = 'You have just picked up a talent book. Press C to open your character menu and view your available talents. When you have talent points available you can choose to learn new talents from it.';
		dialog[0].responses = [{text: 'Ok', nextLine: 'exit'}
							  ];

		gs.globalData.books = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

// STAIRS_DIALOG:
// ************************************************************************************************
help.stairsDialog = function () {
	var dialog;
	
	if (!gs.globalData.stairs && gs.state !== 'DIALOG_MENU_STATE') {
		
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = 'You have discovered a flight of stairs leading deeper into the dungeon. Use the < or > keys to descend or click the button on the HUD.';
		dialog[0].responses = [{text: 'Ok', nextLine: 'exit'}];

		gs.globalData.stairs = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

// REST_DIALOG:
// ************************************************************************************************
help.restDialog = function () {
	var dialog;
	
	if (!gs.globalData.rest && gs.state !== 'DIALOG_MENU_STATE') {
		
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = 'Your health is low, shift + click yourself to rest until healed.';
		dialog[0].responses = [{text: 'Ok', nextLine: 'exit'}];

		gs.globalData.rest = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

// UNSAFE_MOVE_DIALOG:
// ************************************************************************************************
help.unsafeMoveDialog = function () {
	var dialog;
	
	if (!gs.globalData.unsafeMove && gs.state !== 'DIALOG_MENU_STATE') {
		
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = 'There is a dangerous hazard in this tile, use shift + click to move onto hazardous terrain.';
		dialog[0].responses = [{text: 'Ok', nextLine: 'exit'}];

		gs.globalData.unsafeMove = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

