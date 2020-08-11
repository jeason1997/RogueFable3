/*global game, gs, console*/
/*global LARGE_WHITE_FONT, INVENTORY_SIZE, UIItemSlot, SCALE_FACTOR, TILE_SIZE*/
/*jslint esversion: 6*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function UIItemSlotList(startX, startY, numSlotX, numSlotY, itemSlotList, callback, context, group, maxSlots) {
    var i = 0, button, slotSize = (44 + SCALE_FACTOR);
       
    this.group = game.add.group();
	this.callback = callback;
	this.context = context;
	
	maxSlots = maxSlots || numSlotX * numSlotY;

	// Create item slots:
	this.uiItemSlots = [];
    for (let y = 0; y < numSlotY; y += 1) {
        for (let x = 0; x < numSlotX; x += 1) {
			if (i < maxSlots) {
				this.uiItemSlots[i] = new UIItemSlot(startX + x * slotSize, startY + y * slotSize, null, 0, callback, context, group);
            	this.uiItemSlots[i].index = i;
            	i += 1;
			}
        }
    }
	
	if (itemSlotList) {
		this.setItemSlots(itemSlotList);
	}
	
	group.add(this.group);
}

// SET_ITEM_SLOTS:
// Sets the ItemSlotList which the UIItemSlotList displays and interacts with.
// Can be called post construction to change which ItemSlotList the UIItemSlotList is refering to.
// This is primarily used so that the UIShopMenu can display the inventories of different shops.
// ************************************************************************************************
UIItemSlotList.prototype.setItemSlots = function (list) {
	for (let i = 0; i < this.uiItemSlots.length; i += 1) {
		if (i < list.length) {
			this.uiItemSlots[i].itemSlot = list[i];
		}
		else {
			this.uiItemSlots[i].itemSlot = null;
		}
		
	}
};

// GET_ITEM_UNDER_POINTER:
// ************************************************************************************************
UIItemSlotList.prototype.getItemUnderPointer = function () {
	for (let i = 0; i < this.uiItemSlots.length; i += 1) {
		if (this.uiItemSlots[i].isPointerOver()) {
			return this.uiItemSlots[i].getItem();
		}
	}
	return null;
};

// REFRESH:
// ************************************************************************************************
UIItemSlotList.prototype.refresh = function () {
	for (let i = 0; i < this.uiItemSlots.length; i += 1) {
		this.uiItemSlots[i].refresh();
	}
};
