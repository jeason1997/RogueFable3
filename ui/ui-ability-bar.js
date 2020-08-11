/*global game, gs, console, Phaser*/
/*global ABILITY_SLOT_FRAME, ABILITY_SLOT_RED_FRAME*/
/*global SMALL_WHITE_FONT, SCALE_FACTOR, TILE_SIZE, SLOT_SELECT_BOX_FRAME, ABILITY_SLOT_GREEN_FRAME*/
/*jshint esversion: 6*/
'use strict';

function UIAbilityBar(startX, startY, numSlotsX, numSlotsY, group) {
	var i = 0,
		x,
		y;

	this.abilityList = gs.pc.abilities.list;
	this.group = game.add.group();
	this.abilitySlots = [];
	this.abilityIcons = [];
	this.abilityText = []; // cooldown
	
	this.numSlotsX = numSlotsX;
	this.numSlotsY = numSlotsY;

	// Create ability slots:
	for (y = 0; y < this.numSlotsY; y += 1) {
        for (x = 0; x < this.numSlotsX; x += 1) {
			let posX = startX + x * (44 + SCALE_FACTOR),
				posY = startY + y * (44 + SCALE_FACTOR);
			
			// AbilitySlots:
			this.abilitySlots[i] = game.add.button(posX, posY, 'UISlot', this.slotClicked, this, ABILITY_SLOT_FRAME + 1, ABILITY_SLOT_FRAME);
			this.abilitySlots[i].scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
			this.abilitySlots[i].smoothed = false;
			this.abilitySlots[i].slot = -1;
			this.group.add(this.abilitySlots[i]);

			// Ability Icons:
			this.abilityIcons[i] = gs.createSprite(posX + 2, posY + 2, 'Tileset', this.group);
			this.abilityIcons[i].scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
			
			// Ability Text:
			this.abilityText[i] = gs.createText(posX + 42, posY + 48, '10', SMALL_WHITE_FONT, this.group);
			this.abilityText[i].anchor.setTo(1, 1);
			
			i += 1;
		}
	}
	
	// Selected Ability Sprite:
	this.selectedAbilitySprite = gs.createSprite(0, 0, 'UISlot', this.group);
    this.selectedAbilitySprite.frame = SLOT_SELECT_BOX_FRAME;
	this.selectedAbilitySprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.selectedAbilitySprite.visible = false;

	group.add(this.group);
}

// CLEAR:
// ************************************************************************************************
UIAbilityBar.prototype.clear = function () {
	this.abilitySlots.forEach(function (slot) {
		slot.slot = -1;
	}, this);
};

// REFRESH:
// ************************************************************************************************
UIAbilityBar.prototype.refresh = function () {
	var slot;
	
	this.selectedAbilitySprite.visible = false;
	
	for (let i = 0; i < this.abilitySlots.length; i += 1) {
		slot = this.abilitySlots[i].slot;
		
		if (slot !== -1 && this.abilityList[slot]) {
			
			// Sustained on:
			if (this.abilityList[slot].type.isSustained && this.abilityList[slot].isOn) {
				this.abilitySlots[i].setFrames(ABILITY_SLOT_GREEN_FRAME + 1, ABILITY_SLOT_GREEN_FRAME);
			}
			// Red Frame (cannot use):
			else if (gs.pc.cannotUseAbility(slot)) {
				this.abilitySlots[i].setFrames(ABILITY_SLOT_RED_FRAME + 1, ABILITY_SLOT_RED_FRAME);
			}
			else {
				this.abilitySlots[i].setFrames(ABILITY_SLOT_FRAME + 1, ABILITY_SLOT_FRAME);
			}
			
			// Set item icons:
			this.abilityIcons[i].frame = this.abilityList[slot].type.frame;
			this.abilityIcons[i].visible = true;
			
			// Cooldown:
			if (this.abilityList[slot].coolDown > 0) {
				this.abilityText[i].setText(this.abilityList[slot].coolDown);
				this.abilityText[i].visible = true;
			} 
			// Charges:
			else if (this.abilityList[slot].type.itemType) {
				let item = gs.pc.inventory.getCharm();
				this.abilityText[i].setText(item.charges + '/' + item.getModdedStat('maxCharges'));
				this.abilityText[i].visible = true;
			}
			else {
				this.abilityText[i].visible = false;
			}
			
			
			if (gs.state === 'USE_ABILITY_STATE' && this.abilityList[slot] === gs.pc.selectedAbility) {
				this.selectedAbilitySprite.x = this.abilityIcons[i].x - 2;
				this.selectedAbilitySprite.y = this.abilityIcons[i].y - 2;
				this.selectedAbilitySprite.visible = true;
			}
			
			
		} 
		else {
			this.abilityIcons[i].visible = false;
			this.abilityText[i].visible = false;
			this.abilitySlots[i].setFrames(ABILITY_SLOT_FRAME + 1, ABILITY_SLOT_FRAME);
		}
	}
};

// SLOT_CLICKED:
// ************************************************************************************************
UIAbilityBar.prototype.slotClicked = function (button) {
	// Clicking in character menu will rearange abilities:
	if (gs.state === 'CHARACTER_MENU_STATE') {
		// Picking up ability:
		if (gs.characterMenu.abilityIndexOnCursor === -1 && this.abilityList[button.slot]) {
			gs.characterMenu.abilityIndexOnCursor = button.slot;
			button.slot = -1;
			this.refresh();
		}
		// Placing ability in occupied slot (swap):
		else if (gs.characterMenu.abilityIndexOnCursor !== -1 && this.abilityList[button.slot]) {
			let tempSlot = button.slot;
			button.slot = gs.characterMenu.abilityIndexOnCursor;
			gs.characterMenu.abilityIndexOnCursor = tempSlot;
			this.refresh();
			
		}
		// Placing ability in empty slot:
		else {
			button.slot = gs.characterMenu.abilityIndexOnCursor;
			gs.characterMenu.abilityIndexOnCursor = -1;
			this.refresh();
		}
	}
	// Clicking in game mode will toggle abilities:
	else if (this.abilityList[button.slot]){
		gs.pc.clickAbility(button.slot);
	}
};

// ADD_ABILITY:
// Adds ability at abilitySlot to the next open buttonSlot (slot = -1)
// ************************************************************************************************
UIAbilityBar.prototype.addAbility = function (abilitySlot) {
	for (let i = 0; i < this.abilitySlots.length; i += 1) {
		if (this.abilitySlots[i].slot === -1) {
			this.abilitySlots[i].slot = abilitySlot;
			return;
		}
	}
};

// REMOVE_ABILITY:
// Removes the ability at abilitySlot:
// ************************************************************************************************
UIAbilityBar.prototype.removeAbility = function (abilitySlot) {
	for (let i = 0; i < this.abilitySlots.length; i += 1) {
		if (this.abilitySlots[i].slot === abilitySlot) {
			this.abilitySlots[i].slot = -1;
			return;
		}
	}
	
	throw 'Could not remove ability from abilityBar';
};

// GET_ABILITY_UNDER_POINTER:
// ************************************************************************************************
UIAbilityBar.prototype.getAbilityUnderPointer = function () {
	
	var i;
	for (i = 0; i < this.abilitySlots.length; i += 1) {
		if (this.abilitySlots[i].input.checkPointerOver(game.input.activePointer) && this.abilitySlots[i].slot !== -1) {
			return this.abilityList[this.abilitySlots[i].slot];
		}
	}
	return null;
};

// TO_DATA:
// ************************************************************************************************
UIAbilityBar.prototype.toData = function () {
	var data = [];
	
	for (let i = 0; i < this.abilitySlots.length; i += 1) {
		data.push(this.abilitySlots[i].slot);
	}
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
UIAbilityBar.prototype.loadData = function (data) {
	for (let i = 0; i < this.abilitySlots.length; i += 1) {
		this.abilitySlots[i].slot = data[i];
	}
};
