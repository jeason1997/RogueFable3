/*global gs, game, console*/
/*global UIItemSlotList*/
/*global HUD_START_X, SCREEN_HEIGHT, SCALE_FACTOR, HUGE_WHITE_FONT, SMALL_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIUseMenu() {
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
	this.titleText = gs.createText(startX + width / 2, startY + 20, 'Use Item', HUGE_WHITE_FONT, this.group);
	gs.centerText(this.titleText);
	
	
	// List containing all enchantable items:
	this.uiItemSlotList = new UIItemSlotList(startX + 6, startY + 40, 2, 10, null, this.slotClicked, this, this.group);
	
	// Adjust position of column 2:
	for (let i = 0; i < 20; i += 1) {
		if (i % 2 === 1) {
			this.uiItemSlotList.uiItemSlots[i].setPosition(this.uiItemSlotList.uiItemSlots[i].x + 240, this.uiItemSlotList.uiItemSlots[i].y);
		}
	}
	
	// Text:
	this.itemText = [];
	for (let i = 0; i < 20; i += 1) {
		this.itemText[i] = gs.createText(this.uiItemSlotList.uiItemSlots[i].x + 48,
										 this.uiItemSlotList.uiItemSlots[i].y + 24,
										 'Hello World',
										 SMALL_WHITE_FONT,
										 this.group);
		this.itemText[i].lineSpacing = -5;
		this.itemText[i].anchor.setTo(0, 0.5);
		
	}
	
	// Close button:
	this.closeButton = gs.createTextButton(startX + width / 2, startY + height - 20, '关闭', this.close, this, this.group);
	
	
	this.group.visible = false;
}

// SLOT_CLICKED:
// ************************************************************************************************
UIUseMenu.prototype.slotClicked = function (slot) {
	// Make sure to call close first to set to GAME_STATE:
	this.close();
	
	gs.pc.consumableSlotClicked(slot);
};

// HANDLE_KEY:
// ************************************************************************************************
UIUseMenu.prototype.handleKey = function (key) {
	
	
	if (this.uiItemSlotList.uiItemSlots[key - 1].slotSprite.visible) {
		this.slotClicked(this.uiItemSlotList.uiItemSlots[key - 1].itemSlot);
	}
};

// REFRESH:
// ************************************************************************************************
UIUseMenu.prototype.refresh = function () {
	this.uiItemSlotList.refresh();
	
	// Hide slots which contain no item:
	for (let i = 0; i < this.uiItemSlotList.uiItemSlots.length; i += 1) {
		if (!this.uiItemSlotList.uiItemSlots[i].itemSlot || this.uiItemSlotList.uiItemSlots[i].itemSlot.isEmpty()) {
			this.uiItemSlotList.uiItemSlots[i].slotSprite.visible = false;
			this.itemText[i].visible = false;
		} 
		else {
			this.uiItemSlotList.uiItemSlots[i].slotSprite.visible = true;
			this.itemText[i].visible = true;
		}
	}
	
	// Display text of remaining slots:
	for (let i = 0; i < this.uiItemSlotList.uiItemSlots.length; i += 1) {
		if (this.itemText[i].visible) {
			let str = '';
			
			str += '[' + (i + 1) + '] ';
			
			str += this.uiItemSlotList.uiItemSlots[i].itemSlot.item.toUseMenuDesc();
			this.itemText[i].setText(str);
		}
	}
	
};

// OPEN:
// ************************************************************************************************
UIUseMenu.prototype.open = function () {
	var playerItemSlots;
	
	// Get list of all enchantable items:
	playerItemSlots = gs.pc.inventory.consumableHotBar.allFullItemSlots();
	playerItemSlots = playerItemSlots.filter(slot => slot.item.type.slot === 'consumable');
	this.uiItemSlotList.setItemSlots(playerItemSlots);
	
	gs.pc.stopExploring();
	this.refresh();
	gs.state = 'USE_MENU_STATE';
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
UIUseMenu.prototype.close = function () {
	gs.state = 'GAME_STATE';
	this.group.visible = false;
};

// GET_EQUIPMENT_DESC_UNDER_POINTER:
// ************************************************************************************************
UIUseMenu.prototype.getItemUnderPointer = function () {
	return this.uiItemSlotList.getItemUnderPointer();
};