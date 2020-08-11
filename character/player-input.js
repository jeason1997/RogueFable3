/*global gs, game, console, Phaser, nw*/
/*global SCREEN_HEIGHT, HUD_START_X*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';


// CREATE_KEYS:
// ************************************************************************************************
gs.createKeys = function () {
	this.keys = {
		a: game.input.keyboard.addKey(Phaser.Keyboard.A),
		w: game.input.keyboard.addKey(Phaser.Keyboard.W),
		s: game.input.keyboard.addKey(Phaser.Keyboard.S),
		d: game.input.keyboard.addKey(Phaser.Keyboard.D),
		e: game.input.keyboard.addKey(Phaser.Keyboard.E),
		r: game.input.keyboard.addKey(Phaser.Keyboard.R),
		t: game.input.keyboard.addKey(Phaser.Keyboard.T),
		i: game.input.keyboard.addKey(Phaser.Keyboard.I),
		c: game.input.keyboard.addKey(Phaser.Keyboard.C),
		o: game.input.keyboard.addKey(Phaser.Keyboard.O),
		q: game.input.keyboard.addKey(Phaser.Keyboard.Q),
		u: game.input.keyboard.addKey(Phaser.Keyboard.U),
		
		num1: game.input.keyboard.addKey(Phaser.Keyboard.ONE),
		num2: game.input.keyboard.addKey(Phaser.Keyboard.TWO),
		num3: game.input.keyboard.addKey(Phaser.Keyboard.THREE),
		num4: game.input.keyboard.addKey(Phaser.Keyboard.FOUR),
		num5: game.input.keyboard.addKey(Phaser.Keyboard.FIVE),
		num6: game.input.keyboard.addKey(Phaser.Keyboard.SIX),
		num7: game.input.keyboard.addKey(Phaser.Keyboard.SEVEN),
		num8: game.input.keyboard.addKey(Phaser.Keyboard.EIGHT),
		esc: game.input.keyboard.addKey(Phaser.Keyboard.ESC),
		space: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
		enter: game.input.keyboard.addKey(Phaser.Keyboard.ENTER),
		p: game.input.keyboard.addKey(Phaser.Keyboard.P),
		shift: game.input.keyboard.addKey(Phaser.Keyboard.SHIFT),
		period: game.input.keyboard.addKey(Phaser.Keyboard.PERIOD),
		comma: game.input.keyboard.addKey(Phaser.Keyboard.COMMA),
		tab: game.input.keyboard.addKey(Phaser.Keyboard.TAB),
		
		// NUMPAD:
		up: game.input.keyboard.addKey(Phaser.Keyboard.UP),
		down: game.input.keyboard.addKey(Phaser.Keyboard.DOWN),
		left: game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
		right: game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
		home: game.input.keyboard.addKey(Phaser.Keyboard.HOME),
		pageUp: game.input.keyboard.addKey(Phaser.Keyboard.PAGE_UP),
		pageDown: game.input.keyboard.addKey(Phaser.Keyboard.PAGE_DOWN),
		end: game.input.keyboard.addKey(Phaser.Keyboard.END),
		
		numPad1: game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_1),
		numPad2: game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_2),
		numPad3: game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_3),
		numPad4: game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_4),
		numPad5: game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_5),
		numPad6: game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_6),
		numPad7: game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_7),
		numPad8: game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_8),
		numPad9: game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_9),
		
		f12: game.input.keyboard.addKey(Phaser.Keyboard.F12),
	};
};


// TOGGLE_KEY_BOARD_MOVE:
// ************************************************************************************************
gs.toggleKeyBoardMode = function (b) {
	if (b) {
		var nearestNPC = this.getNearestVisibleNPC();

		this.keyBoardMode = true;

		if (nearestNPC) {
			this.cursorTileIndex.x = nearestNPC.tileIndex.x;
			this.cursorTileIndex.y = nearestNPC.tileIndex.y;
		} 
		else {
			this.cursorTileIndex.x = this.pc.tileIndex.x;
			this.cursorTileIndex.y = this.pc.tileIndex.y;
		}
	} 
	else {
		this.keyBoardMode = false;
	}
};

// ON_NUM_PAD_DOWN:
// Remember that this is seprate from holding the keys which is handled in an update funciton.
// Moves the character or moves the cursor when in keyBoardMode
// ************************************************************************************************
gs.onNumPadDown = function (vector) {
	this.lastInputType = 'KEYBOARD';
	gs.pc.keyHoldTime = 20;
	
	// Moving Cursor:
	if (this.keyBoardMode || gs.state === 'USE_ABILITY_STATE') {
		this.cursorTileIndex.x += vector.x;
		this.cursorTileIndex.y += vector.y;
	} 
	// Single stepping:
	else if (gs.state === 'GAME_STATE') {
		gs.pc.stopExploring();
		gs.pc.clickTileIndex({x: gs.pc.tileIndex.x + vector.x, y: gs.pc.tileIndex.y + vector.y}, false, 2);
	}
	
	/*
	// Multi stepping:
	else if (gs.state === 'GAME_STATE' && gs.keys.shift.isDown) {
		this.onMultiMove(vector);
	}
	*/
};

// ON_MULTI_MOVE:
// Return a tileIndex in the direction of vector from the player character.
// Try to move 10 total tiles
// Stop before dangerous terrain or when the 3x3 surroundings change i.e ends of halls, corners etc.
// ************************************************************************************************
gs.onMultiMove = function (vector) {
	var nextTileIndex,
		tileIndex = null;
	
	for (let i = 1; i < 10; i += 1) {
		nextTileIndex = {x: gs.pc.tileIndex.x + vector.x * i, y: gs.pc.tileIndex.y + vector.y * i};
		
		// Break conditions:
		if (!gs.isPassable(nextTileIndex)
		   || !gs.isIndexSafe(nextTileIndex)) {
			break;
		}
		
		tileIndex = {x: gs.pc.tileIndex.x + vector.x * i, y: gs.pc.tileIndex.y + vector.y * i};
	}
	
	if (tileIndex) {
		gs.pc.clickTileIndex(tileIndex, false, true);
	}
};

// ON_NUM_KEY_DOWN:
// Quick selects abilities
// ************************************************************************************************
gs.onNumKeyDown = function (index) {
	if (gs.state === 'USE_MENU_STATE') {
		gs.useMenu.handleKey(index + 1);
	}
	else if (gs.pc.isReadyForInput()) {	
		gs.HUD.abilityBar.slotClicked(gs.HUD.abilityBar.abilitySlots[index]);
		
		if (this.lastInputType === 'KEYBOARD' && gs.state === 'USE_ABILITY_STATE') {
			this.toggleKeyBoardMode(true);
		}
	}
};

// ON_ENTER:
// Used to confirm actions in keyboard mode, confirm dialog, or wait/rest
// ************************************************************************************************
gs.onEnter = function () {
	if (gs.pc.isReadyForInput()) {
		if (this.keyBoardMode || gs.state === 'USE_ABILITY_STATE') {
			gs.pc.clickTileIndex(this.cursorTileIndex);
		}
		else if (gs.state === 'GAME_STATE') {
			gs.pc.stopExploring();
			gs.pc.clickTileIndex(gs.pc.tileIndex);
		} 
		else if (gs.state === 'DIALOG_MENU_STATE') {
			gs.dialogMenu.buttonClicked({index: 0});	
		}
	}
};

// ON_CLICK:
// ************************************************************************************************
gs.onClick = function () {
	// Clicking a tile:
	if (gs.isPointerInWorld() && (gs.state === 'GAME_STATE' || gs.state === 'USE_ABILITY_STATE')) {
		gs.pc.clickTileIndex(gs.pointerTileIndex(), false, false);
	} 
	// Clicking the mini-map:
	else if (gs.HUD.miniMap.isPointerOver() && gs.state === 'GAME_STATE' && gs.isInBounds(gs.HUD.miniMap.indexUnderPointer()) && gs.getTile(gs.HUD.miniMap.indexUnderPointer()).explored) {
		gs.pc.clickTileIndex(gs.HUD.miniMap.indexUnderPointer(), true, true);
	}
};

// ON_RIGHT_CLICK:
// ************************************************************************************************
gs.onRightClick = function () {
	if (gs.isPointerInWorld() && (gs.state === 'GAME_STATE')) {
		gs.pc.clickTileIndex(gs.pointerTileIndex(), false, false, true);
	} 
};


// ON_ESCAPE:
// ************************************************************************************************
gs.onEscape = function () {
	// MAIN_MENU:
	if (gs.globalState === 'MAIN_MENU_STATE') {
		// Backing out of class select menu:
		if (gs.state === 'CLASS_SELECT_MENU_STATE') {
			gs.classSelectMenu.close();
			gs.mainMenu.open();
		}
		// Backing out of race select menu:
		else if (gs.state === 'RACE_SELECT_MENU_STATE') {
			gs.raceSelectMenu.close();
			gs.classSelectMenu.open();
		}
		// Backing out of record menu:
		else if (gs.state === 'RECORD_MENU_STATE') {
			gs.recordMenu.close();
			gs.mainMenu.open();
		}
		// Backing out of options menu:
		else if (gs.state === 'OPTIONS_MENU_STATE') {
			gs.optionsMenu.close();
			gs.mainMenu.open();
		}
		
		return;
	}
	
	if (gs.pc.isReadyForInput()) {
		
		
		if (gs.state === 'HELP_MENU_STATE') {
			gs.helpMenu.close();
		}
		else if (gs.state === 'USE_ABILITY_STATE') {
			gs.pc.cancelUseAbility();
		}
		else if (gs.state === 'USE_MENU_STATE') {
			gs.useMenu.close();
		}
		else if (gs.state === 'CHARACTER_MENU_STATE') {
			gs.characterMenu.close();
		}
		else if (gs.state === 'OPTIONS_MENU_STATE') {
			gs.optionsMenu.close();
		}
		else if (gs.state === 'ENCHANTMENT_MENU_STATE') {
			gs.enchantmentMenu.close();
		}
		else if (gs.state === 'ACQUIREMENT_MENU_STATE') {
			gs.acquirementMenu.close();
		}
		else if (gs.state === 'TRANSFERANCE_MENU_STATE') {
			gs.transferanceMenu.close();
		}
		else if (gs.state === 'SHOP_MENU_STATE') {
			gs.shopMenu.close();
		}
		else if (gs.state === 'GAME_MENU_STATE') {
			gs.gameMenu.close();
		}
		else if (gs.state === 'GAME_STATE' && !gs.keyBoardMode) {
			gs.gameMenu.open();
		}
		else if (gs.state === 'OPTIONS_MENU_STATE') {
			gs.optionsMenu.close();
			gs.gameMenu.open();
		}
		
		if (gs.keyBoardMode) {
			this.toggleKeyBoardMode(false);
		}

		gs.pc.stopExploring();
	}
	// Closing character menu from the death state
	else if (!gs.pc.isAlive && gs.state === 'CHARACTER_MENU_STATE') {
		gs.characterMenu.close();
	}
	
		
};

// ON_EXPLORE_CLICKED:
// ************************************************************************************************
gs.onExploreClicked = function () {
	if (gs.state === 'GAME_STATE' && gs.pc.isReadyForInput()) {
		if (gs.pc.isExploring) {
			gs.pc.stopExploring();
		}
		else {
			gs.pc.startExploring();
		}
		
	}
};

// ON_SWAP_WEAPON_CLICKED:
// ************************************************************************************************
gs.onSwapWeaponClicked = function () {
	if (gs.pc.isReadyForInput()) {
		gs.pc.inventory.swapWeapon();
	}
};

// ON_OPEN_CHARACTER_MENU:
// ************************************************************************************************
gs.onCharacterMenuClicked = function () {
	
	if (gs.state === 'GAME_STATE' && gs.pc.isReadyForInput()) {
		gs.characterMenu.open();
	} 
	else if (gs.state === 'CHARACTER_MENU_STATE') {
		gs.characterMenu.close();
	}
};

// ON_USE_MENU_CLICKED:
// ************************************************************************************************
gs.onUseMenuClicked = function () {
	if (gs.state === 'GAME_STATE' && gs.pc.isReadyForInput()) {
		gs.useMenu.open();
	} 
	else if (gs.state === 'USE_MENU_STATE') {
		gs.useMenu.close();
	}
};

// ON_DOWN_STAIRS_KEY:
// ************************************************************************************************
gs.onDownStairsKey = function () {
	var obj = gs.findObj(obj => obj.type === gs.objectTypes.DownStairs);

	// Use down stairs:
	if (gs.getObj(gs.pc.tileIndex, 'DownStairs')) {
		gs.pc.useZoneLine();
	}
	// Warp to stairs:
	else if (gs.debugProperties.warpStairs && obj) {
		gs.pc.body.snapToTileIndex(obj.tileIndex);
	}
	// Goto down stairs:
	else if (obj && gs.getTile(obj.tileIndex).explored) {
		gs.pc.clickTileIndex(obj.tileIndex, true, true);
	}
};

// ON_UP_STAIRS_KEY:
// ************************************************************************************************
gs.onUpStairsKey = function () {
	var obj = gs.findObj(obj => obj.type === gs.objectTypes.UpStairs);

	// Use up stairs:
	if (gs.getObj(gs.pc.tileIndex, 'UpStairs')) {
		gs.pc.useZoneLine();
	}
	// Warp to stairs:
	else if (gs.debugProperties.warpStairs && obj) {
		gs.pc.body.snapToTileIndex(obj.tileIndex);
	}
	// Goto up stairs:
	else if (obj && gs.getTile(obj.tileIndex).explored) {
		gs.pc.clickTileIndex(obj.tileIndex, true, true);
	}
};

// ON_STAIRS_KEY:
// ************************************************************************************************
gs.onStairsKey = function () {
	if (gs.getObj(gs.pc.tileIndex, ['UpStairs', 'DownStairs'])) {
		gs.pc.useZoneLine();
	}
};

// CREATE_PLAYER_CHARACTER_INPUT:
// ************************************************************************************************
gs.createPlayerCharacterInput = function () {
	// Clicking pointer:
	game.input.activePointer.leftButton.onDown.add(this.onClick, this);
	game.input.activePointer.rightButton.onDown.add(this.onRightClick, this);


	//game.input.activePointer.rightButton

	// Moving Pointer:
	game.input.addMoveCallback(function () {
		this.lastInputType = 'MOUSE';
	}, this);

	// E Key (Auto Explore):
	this.keys.e.onDown.add(this.onExploreClicked, this);

	// Space Key (Wait Turn):
	this.keys.space.onDown.add(this.onEnter, this);
	this.keys.enter.onDown.add(this.onEnter, this);
	this.keys.numPad5.onDown.add(this.onEnter, this);
	
	// Auto Attack:
	this.keys.tab.onDown.add(function () {
		gs.pc.autoAttack();
	}, this);
	this.keys.q.onDown.add(function () {
		gs.pc.autoAttack(true);
	}, this);
	
	// ESC Key (cancel casting)
	this.keys.esc.onDown.add(this.onEscape, this);
	
	// W Key (Swap Weapons):
	this.keys.w.onDown.add(this.onSwapWeaponClicked, this);

	// A Key (Keyboard Mode):
	this.keys.a.onDown.add(function () {
		this.toggleKeyBoardMode(true);
	}, this);

	// T Key (open talent menu):
	this.keys.t.onDown.add(this.onCharacterMenuClicked, this);
	this.keys.c.onDown.add(this.onCharacterMenuClicked, this);
	this.keys.i.onDown.add(this.onCharacterMenuClicked, this);
	//this.keys.u.onDown.add(this.onUseMenuClicked, this);
	
	// > Key (Goto Down Stairs):
	this.keys.period.onDown.add(this.onDownStairsKey, this);
	
	// < Key (Goto Up Stairs):
	this.keys.comma.onDown.add(this.onUpStairsKey, this);

	// s Key (use stairs):
	this.keys.s.onDown.add(this.onStairsKey, this);
	
	this.keys.f12.onDown.add(function () {
		//nw.Window.get().showDevTools();
	}, this);
	
	// NUM_PAD_KEYS:
	this.keys.numPad1.onDown.add(this.onNumPadDown.bind(this, {x: -1, y: 1}));
	this.keys.numPad2.onDown.add(this.onNumPadDown.bind(this, {x: 0, y: 1}));
	this.keys.numPad3.onDown.add(this.onNumPadDown.bind(this, {x: 1, y: 1}));
	this.keys.numPad4.onDown.add(this.onNumPadDown.bind(this, {x: -1, y: 0}));	
	this.keys.numPad6.onDown.add(this.onNumPadDown.bind(this, {x: 1, y: 0}));
	this.keys.numPad7.onDown.add(this.onNumPadDown.bind(this, {x: -1, y: -1}));
	this.keys.numPad8.onDown.add(this.onNumPadDown.bind(this, {x: 0, y: -1}));
	this.keys.numPad9.onDown.add(this.onNumPadDown.bind(this, {x: 1, y: -1}));
	
	this.keys.end.onDown.add(this.onNumPadDown.bind(this, {x: -1, y: 1}));
	this.keys.down.onDown.add(this.onNumPadDown.bind(this, {x: 0, y: 1}));
	this.keys.pageDown.onDown.add(this.onNumPadDown.bind(this, {x: 1, y: 1}));
	this.keys.left.onDown.add(this.onNumPadDown.bind(this, {x: -1, y: 0}));	
	this.keys.right.onDown.add(this.onNumPadDown.bind(this, {x: 1, y: 0}));
	this.keys.home.onDown.add(this.onNumPadDown.bind(this, {x: -1, y: -1}));
	this.keys.up.onDown.add(this.onNumPadDown.bind(this, {x: 0, y: -1}));
	this.keys.pageUp.onDown.add(this.onNumPadDown.bind(this, {x: 1, y: -1}));

	// NUM_KEYS:
	this.keys.num1.onDown.add(this.onNumKeyDown.bind(gs, 0), this);
	this.keys.num2.onDown.add(this.onNumKeyDown.bind(gs, 1), this);
	this.keys.num3.onDown.add(this.onNumKeyDown.bind(gs, 2), this);
	this.keys.num4.onDown.add(this.onNumKeyDown.bind(gs, 3), this);
	this.keys.num5.onDown.add(this.onNumKeyDown.bind(gs, 4), this);
	this.keys.num6.onDown.add(this.onNumKeyDown.bind(gs, 5), this);
	this.keys.num7.onDown.add(this.onNumKeyDown.bind(gs, 6), this);
	this.keys.num8.onDown.add(this.onNumKeyDown.bind(gs, 7), this);
};

// POINTER_TILE_INDEX:
// ************************************************************************************************
gs.pointerTileIndex = function () {
	return this.toTileIndex({x: game.input.activePointer.x + game.camera.x, y: game.input.activePointer.y + game.camera.y});
};

// IS POINTER IN WORLD:
// ********************************************************************************************
gs.isPointerInWorld = function () {
	return game.input.activePointer.x < HUD_START_X
		&& game.input.activePointer.x > 4
		&& game.input.activePointer.y < SCREEN_HEIGHT - 4
		&& game.input.activePointer.y > 4
		&& gs.isInBounds(gs.pointerTileIndex());
};