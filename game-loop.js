/*global gs, game, Phaser, console*/
/*global levelController*/
/*global HUD_WIDTH*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';
// UPDATE:
// ************************************************************************************************
gs.update = function () {
	if (this.state === 'OPTIONS_MENU_STATE') {
		this.optionsMenu.update();
	}
	
	if (this.globalState === 'MAIN_MENU_STATE') {
		this.mainMenuBase.update();
		return;
	}
	
	
	this.updateProjectiles();
	this.updateParticles();
	this.updateParticleGenerators();
	
	if (this.pauseTime > 0) {
		this.pauseTime -= 1;
	}
	
	// NPCs will pause before using abilities until the player finishes moving:
	if (this.activeCharacter.state === 'PAUSE' && gs.pc.body.state === 'WAITING') {
		this.activeCharacter.state = 'WAITING';
	}
	
	if (this.state === 'END_TURN') {
		if (this.allCharactersReady()) {
			this.startTurn();
			this.setState('GAME_STATE');
		}
	}
	else if (gs.pc.currentHp > 0 && gs.pauseTime === 0) {
		
		// Player chooseAction:
		if (this.activeCharacter === this.pc && this.canCharacterAct(this.pc)) {
			this.pc.chooseAction();
		}

		// NPC chooseAction:
		// As long as a character does not perform a blocking action, many characters can chooseAction in the same frame
		// This makes turns much faster
		while (this.canCharacterAct(this.activeCharacter) && (this.activeCharacter !== this.pc || this.pc.actionQueue.length > 0 && this.pc.actionQueue[0].type === 'WAIT')) {
			this.activeCharacter.chooseAction();
		}
	}
	
	// Update sprites:
	this.updateCharacterFrames();
	this.HUD.refresh();
	this.updateDamageText();
	this.updateHUDTileSprites();
	
	// Update Shop Menu:
	if (this.state === 'SHOP_MENU_STATE') {
		this.shopMenu.update();
	}
	
	if (this.state === 'CHARACTER_MENU_STATE') {
		this.characterMenu.update();
	}
	
	if (this.state === 'TRANSFERANCE_MENU_STATE') {
		this.transferanceMenu.update();
	}

	// Update camera:s
	game.camera.focusOnXY(this.pc.body.position.x + HUD_WIDTH / 2, this.pc.body.position.y);
	
	this.shadowMaskSprite.x = this.pc.body.position.x;//game.camera.x;
	this.shadowMaskSprite.y = this.pc.body.position.y;//game.camera.y;
	
	
	this.updateTileMapSprites();
	
	gs.objectSpritesGroup.sort('y', Phaser.Group.SORT_ASCENDING);
	
	
	
};


// CAN_CHARACTER_ACT:
// ************************************************************************************************
gs.canCharacterAct = function (character) {
	return this.projectileList.length === 0
		&& this.state === 'GAME_STATE'
		&& character.state === 'WAITING'
		&& character.body.state === 'WAITING';
};



// ALL_CHARACTERS_READY:
// Use this to determine if all characters have completed movement
// ************************************************************************************************
gs.allCharactersReady = function () {
	for (let i = 0; i < this.characterList.length; i += 1) {
		if (this.characterList[i].isAlive && (this.characterList[i].body.state !== 'WAITING' || this.characterList[i].eventQueue.isProcessing())) {
			return false;
		}
	}
	
	if (this.projectileList.length > 0) {
		return false;
	}

	
	return true;
};

// END_TURN:
// ************************************************************************************************
gs.endTurn = function () {
	if (this.state !== 'DIALOG_MENU_STATE' && (this.projectileList.length > 0 || this.activeCharacter.eventQueue.isProcessing())) {
		this.setState('END_TURN');
	}
	else {
		this.startTurn();
	}
};

gs.removeDeadCharacters = function () {
	// Remove dead Characters:
    for (let i = this.characterList.length - 1; i >= 0; i -= 1) {
        if (!this.characterList[i].isAlive && this.characterList[i] !== gs.pc) {
            this.characterList.splice(i, 1);
        }
    }
};

// START_TURN:
// ************************************************************************************************
gs.startTurn = function () {
	var lastActiveCharacter = this.activeCharacter;
	
	this.removeDeadCharacters();
	
	if (this.activeCharacterIndex >= this.characterList.length) {
		this.activeCharacterIndex = 0;
	}

	// Ticking the global clock:
	if (lastActiveCharacter === this.pc) {
		this.globalTurnTimer += gs.pc.waitTime;
	}

	// Dead player:
	if (!gs.pc.isAlive) {
		this.activeCharacterIndex = 0;
		this.activeCharacter = gs.pc;
		return;
	}
	
	// Find the next active character:
	while (this.characterList[this.activeCharacterIndex].waitTime > 0) {
		this.characterList[this.activeCharacterIndex].waitTime -= 50;
		this.activeCharacterIndex += 1;
		if (this.activeCharacterIndex >= this.characterList.length) {
			this.activeCharacterIndex = 0;
		}
	}

	this.activeCharacter = this.characterList[this.activeCharacterIndex];
	
	// Global Turns:
	if (this.activeCharacter === this.pc) {
		while (this.globalTurnTimer >= 100) {
			this.globalTurnTimer -= 100;
			this.updateGlobalTurn();
		}
	}
	
	// The player has just started his turn so we set hasNPCActed to false
	// If an npc acts in between then we stop the player from moving
	if (this.activeCharacter === this.pc) {
		gs.HUD.miniMap.refresh();
		gs.pc.previousTileIndex = {x: gs.pc.tileIndex.x, y: gs.pc.tileIndex.y};
		gs.pc.inventory.quickWeaponEquipped = false;
		
		if (this.hasNPCActed || this.numVisibleNPCs() > 0) {
			gs.pc.stopExploring();
		}
		this.hasNPCActed = false;
	}
};

// UPDATE_GLOBAL_TURN:
// ************************************************************************************************
gs.updateGlobalTurn = function () {
	
	gs.turn += 1;

	// Update effect:
	// Reverse order so that adding new effects won't immediately update
	for (let i = this.cloudList.length - 1; i >= 0 ; i -= 1) {
		if (this.cloudList[i].isAlive) {
			this.cloudList[i].updateTurn();
		}
	}

	// Update objects:
	this.objectList.forEach(function (object) {
		if (object.updateTurn) {
			object.updateTurn();
		}
	}, this);

	// Update Characters:
	for (let i = 0; i < this.characterList.length; i += 1) {
		if (this.characterList[i].isAlive) {
			this.characterList[i].updateTurn();
		}
	}
	
	// Level Controller:
	levelController.updateTurn();
	
	this.calculateLoS();
};