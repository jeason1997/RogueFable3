/*global game, gs, console, Phaser*/
/*global EQUIPMENT_SLOT_FRAMES*/
/*global LARGE_WHITE_FONT, SMALL_WHITE_FONT, SMALL_GREEN_FONT, SCALE_FACTOR, ITEM_SLOT_FRAME, ABILITY_SLOT_RED_FRAME*/
'use strict';

/*
// ************************************************************************************************
						UI_ITEM_SLOT:
// ************************************************************************************************	
- Used to give a visual and interactable representation of an ItemSlot
- Needs to be passed an itemSlot at construction
- By calling refresh the UIItemSlot will update its appearence to match the contents of the ItemSlot
- Can pass in a callback function for when the UIItemSlot is clicked
*/
function UIItemSlot(x, y, itemSlot, emptyFrame, callback, context, group) {
	this.itemSlot = itemSlot;
	this.callback = callback;
	this.context = context;
	this.emptyFrame = emptyFrame || 0;
	this.x = x;
	this.y = y;
	
	// Slot Sprite:
	this.slotSprite = game.add.button(x, y, 'UISlot', this.slotClicked, this, ITEM_SLOT_FRAME + 1, ITEM_SLOT_FRAME);
	this.slotSprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	group.add(this.slotSprite);
	
	
	// Item Sprite:
	this.itemSprite = gs.createSprite(x + 2, y + 2, 'Tileset');
	this.itemSprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	group.add(this.itemSprite);
	
	// Item text:
	this.amountText = gs.createText(x + 42, y + 48, '10', SMALL_WHITE_FONT, group);
	this.amountText.anchor.setTo(1, 1);
}

// SET_POSITION:
// ************************************************************************************************
UIItemSlot.prototype.setPosition = function (x, y) {
	this.x = x;
	this.y = y;
	
	this.slotSprite.x = x;
	this.slotSprite.y = y;
	this.itemSprite.x = x;
	this.itemSprite.y = y;
	this.amountText.x = x + 42;
	this.amountText.y = y + 48;
};

// REFRESH:
// ************************************************************************************************
UIItemSlot.prototype.refresh = function () {
	// Not connected to an item slot:
	if (!this.itemSlot) {
		this.itemSprite.visible = false;
		this.amountText.visible = false;
		return;
	}
	
	this.slotSprite.setFrames(ITEM_SLOT_FRAME + 1, ITEM_SLOT_FRAME);
	
	if (this.itemSlot.hasItem()) {
		this.refreshFullSlot();
	} 
	else {
		this.refreshEmptySlot();
	}
};

// REFRESH_EMPTY_SLOT:
// ************************************************************************************************
UIItemSlot.prototype.refreshEmptySlot = function () {
	// Set emptyFrame:
	if (this.itemSlot && EQUIPMENT_SLOT_FRAMES[this.itemSlot.itemTypeSlot]) {
		this.emptyFrame = EQUIPMENT_SLOT_FRAMES[this.itemSlot.itemTypeSlot];
	}

	if (this.emptyFrame) {
		this.itemSprite.frame = this.emptyFrame;
	} 
	else {
		this.itemSprite.visible = false;
	}
	this.amountText.visible = false;
};

// REFRESH_FULL_SLOT:
// ************************************************************************************************
UIItemSlot.prototype.refreshFullSlot = function () {
	var str = '';
	
	// Set shields red (two handed):
	if (this.itemSlot.itemTypeSlot === 'shield' && !gs.pc.inventory.canWieldShield()) {
		this.slotSprite.setFrames(ABILITY_SLOT_RED_FRAME + 1, ABILITY_SLOT_RED_FRAME);
	}

	// Set item icons:
	this.itemSprite.frame = this.itemSlot.item.type.frame;
	this.itemSprite.visible = true;


	// Color Modded items:
	if (this.itemSlot.item.mod > 0) {
		this.amountText.setStyle(SMALL_GREEN_FONT);
	} 
	else {
		this.amountText.setStyle(SMALL_WHITE_FONT);
	}

	// Set item count:
	if (this.itemSlot.item.amount > 1) {

		str = '' + this.itemSlot.item.amount;
		this.amountText.visible = true;
	} 
	else {
		if (this.itemSlot.item.mod > 0) {
			str = '+' + this.itemSlot.item.mod;
			this.amountText.visible = true;
		} 
		else {
			this.amountText.visible = false;
		}
	}
	
	this.amountText.setText(str);
};
// SLOT_CLICKED:
// ************************************************************************************************
UIItemSlot.prototype.slotClicked = function () {
	if (this.callback) {
		this.callback.call(this.context, this.itemSlot, this);
	}
};

// GET_ITEM:
// ************************************************************************************************
UIItemSlot.prototype.getItem = function () {
	if (this.itemSlot) {
		return this.itemSlot.item;
	}
	else {
		return null;
	}
	
};

// IS_POINTER_OVER:
// ************************************************************************************************
UIItemSlot.prototype.isPointerOver = function () {
	return this.slotSprite.input.checkPointerOver(game.input.activePointer);
};