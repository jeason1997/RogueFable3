/*global game, gs, Phaser, console, */
/*global Item*/
/*global SCALE_FACTOR, HUGE_WHITE_FONT, SCREEN_HEIGHT, NUM_EQUIPMENT_SLOTS, HUD_START_X*/
/*global UIItemSlotList, ItemSlotList*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIEnchantmentMenu() {
	var width = 580,
        height = 540,
		startX = HUD_START_X / 2 - width / 2,
		startY = (SCREEN_HEIGHT - height) / 2,
		sprite;
	
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	sprite = gs.createSprite(startX, startY, 'SmallMenu', this.group);
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	
	// Title Text:
	this.titleText = gs.createText(startX + width / 2, startY + 20, 'Enchant Item', HUGE_WHITE_FONT, this.group);
	gs.centerText(this.titleText);
	
	// List containing all enchantable items:
	this.uiItemSlotList = new UIItemSlotList(startX + width / 2 - 42 * 3, startY + 40, 6, 6, null, this.slotClicked, this, this.group);
	
	// Close button:
	this.closeButton = gs.createTextButton(startX + width / 2, startY + height - 20, '关闭', this.close, this, this.group);
	
	
	this.group.visible = false;
}

// SLOT_CLICKED:
// ************************************************************************************************
UIEnchantmentMenu.prototype.slotClicked = function (slot) {
	
	slot.item.enchant();
	gs.pc.popUpText('Enchanted ' + gs.capitalSplit(slot.item.type.name), '#ffffff');
	gs.createParticlePoof(gs.pc.tileIndex, 'YELLOW');
	gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	
	// When using a fountaing:
	if (gs.usingFountain) {
		gs.usingFountain.setIsFull(false);
		gs.usingFountain = null;
	}
	// When using a scroll:
	else {
		gs.pc.inventory.removeItem(gs.pc.inventory.itemOfType(gs.itemTypes.ScrollOfEnchantment), 1);
	}
	
	
	
	this.close();
};

// REFRESH:
// ************************************************************************************************
UIEnchantmentMenu.prototype.refresh = function () {
	this.uiItemSlotList.refresh();
	
	
	// Hide slots which contain no item:
	for (let i = 0; i < this.uiItemSlotList.uiItemSlots.length; i += 1) {
		if (!this.uiItemSlotList.uiItemSlots[i].itemSlot || this.uiItemSlotList.uiItemSlots[i].itemSlot.isEmpty()) {
			this.uiItemSlotList.uiItemSlots[i].slotSprite.visible = false;
		} 
		else {
			this.uiItemSlotList.uiItemSlots[i].slotSprite.visible = true;
		}
	}
};

// OPEN:
// ************************************************************************************************
UIEnchantmentMenu.prototype.open = function () {
	var playerItemSlots;
	
	// Get list of all enchantable items:
	playerItemSlots = gs.pc.inventory.allFullItemSlots();
	playerItemSlots = playerItemSlots.filter(slot => slot.item.canEnchant());
	this.uiItemSlotList.setItemSlots(playerItemSlots);

	gs.pc.stopExploring();
	this.refresh();
	gs.state = 'ENCHANTMENT_MENU_STATE';
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
UIEnchantmentMenu.prototype.close = function () {
	gs.state = 'GAME_STATE';
	gs.usingFountain = null;
	this.group.visible = false;
};

// GET_EQUIPMENT_DESC_UNDER_POINTER:
// ************************************************************************************************
UIEnchantmentMenu.prototype.getItemUnderPointer = function () {
	return this.uiItemSlotList.getItemUnderPointer();
};