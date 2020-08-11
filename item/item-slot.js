/*global game, gs, console, Phaser*/
/*global Item*/
/*global ASSERT_EQUAL, ASSERT_THROW*/
/*jslint white: true, esversion: 6 */
'use strict';

// ITEM_SLOT:
// - Item slots used by characters and containers for holding items.
// - Item slots can be made generic by setting itemTypeSlot to null.
// - Item slots can be restricted to only hold certain items by setting itemTypeSlot to: 'weapon', 'body', feet' etc. This is used for player equipment slots.
// ************************************************************************************************
function ItemSlot(item = null, itemTypeSlot = null) {
	this.item = null;
	this.itemTypeSlot = itemTypeSlot;
	this.index = -1; // Use when the item slot is part of a list;
	
	if (item) {
		this.addItem(item);
	}
	
	Object.seal(this);
}

// CLEAR:
// ************************************************************************************************
ItemSlot.prototype.clear = function () {
	this.item = null;
};

// HAS_ITEM:
// ************************************************************************************************
ItemSlot.prototype.hasItem = function () {
	return Boolean(this.item);
};

// IS_EMPTY:
// ************************************************************************************************
ItemSlot.prototype.isEmpty = function () {
	return !this.hasItem();
};

// CAN_ADD_ITEM:
// ************************************************************************************************
ItemSlot.prototype.canAddItem = function (item) {
	ASSERT_EQUAL(Item.isItem(item), true, 'Not a valid item: ' + item);
	
	// Slot mismatch:
	if (this.itemTypeSlot && this.itemTypeSlot !== item.type.slot) {
		return false;
	}
	// Stackable:
	else if (this.hasItem() && this.item.canStackItem(item)) {
		return true;
	}
	// Full:
	else if (this.hasItem()) {
		return false;
	}
	// Empty:
	else {
		return true;
	}
};

// CAN_STACK_ITEM:
// ************************************************************************************************
ItemSlot.prototype.canStackItem = function (item) {
	return this.hasItem() && this.item.canStackItem(item);
};

// ADD_ITEM:
// ************************************************************************************************
ItemSlot.prototype.addItem = function (item) {
	ASSERT_EQUAL(Item.isItem(item), true, 'Not a valid item: ' + item);
	ASSERT_EQUAL(this.canAddItem(item), true, 'Cannot add item: ' + item);
	
	// Adding to empty slot:
	if (this.isEmpty()) {
		this.item = item;
	}
	// Adding to stack:
	else if (this.item.canStackItem(item)) {
		this.item.amount += item.amount;
	}
	else {
		throw 'failed to add item';
	}
};

// REMOVE_ITEM:
// ************************************************************************************************
ItemSlot.prototype.removeItem = function (amount) {
	if (!amount) {
		this.item = null;
	} 
	else {
		this.item.amount -= amount;
		if (this.item.amount <= 0) {
			this.item = null;
		}
	}
};

// TO_DATA:
// ************************************************************************************************
ItemSlot.prototype.toData = function () {
	var data = {};
	
	data.itemTypeSlot = this.itemTypeSlot;
	data.item = this.hasItem() ? this.item.toData() : null;
	data.index = this.index;
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
ItemSlot.prototype.loadData = function (data) {
	
	this.itemTypeSlot = data.itemTypeSlot;
	this.item = data.item ? Item.createAndLoadItem(data.item) : null;
	this.index = data.index;
};

// UNIT_TESTS:
// ************************************************************************************************
ItemSlot.UnitTests = function () {
	var itemSlot, data;
	
	// HAS_ITEM / IS_EMPTY:
	// ********************************************************************************************
	itemSlot = new ItemSlot(null, null);
	ASSERT_EQUAL(itemSlot.hasItem(), false, 'hasItem() [1]');
	ASSERT_EQUAL(itemSlot.isEmpty(), true, 'hasItem() [2]');
	
	itemSlot.addItem(Item.createItem('PotionOfHealing'));
	ASSERT_EQUAL(itemSlot.hasItem(), true, 'hasItem() [3]');
	ASSERT_EQUAL(itemSlot.isEmpty(), false, 'hasItem() [4]');
	
	itemSlot.removeItem();
	ASSERT_EQUAL(itemSlot.hasItem(), false, 'hasItem() [5]');
	ASSERT_EQUAL(itemSlot.isEmpty(), true, 'hasItem() [6]');
	
	// CAN_ADD_ITEM:
	// ********************************************************************************************
	itemSlot = new ItemSlot(null, null);
	ASSERT_EQUAL(itemSlot.canAddItem(Item.createItem('PotionOfHealing')), true, 'canAddItem() [1]');
	itemSlot.addItem(Item.createItem('PotionOfHealing'));
	ASSERT_EQUAL(itemSlot.canAddItem(Item.createItem('PotionOfHealing')), true, 'canAddItem() [2]');
	ASSERT_EQUAL(itemSlot.canAddItem(Item.createItem('LongSword')), false, 'canAddItem() [3]');
	
	itemSlot = new ItemSlot(null, 'weapon');
	ASSERT_EQUAL(itemSlot.canAddItem(Item.createItem('PotionOfHealing')), false, 'canAddItem() [4]');
	ASSERT_EQUAL(itemSlot.canAddItem(Item.createItem('LongSword')), true, 'canAddItem() [5]');
	
	// ADD_ITEM:
	// ********************************************************************************************
	itemSlot = new ItemSlot(null, null);
	itemSlot.addItem(Item.createItem('PotionOfHealing'));
	itemSlot.addItem(Item.createItem('PotionOfHealing'));
	ASSERT_EQUAL(itemSlot.item.amount, 2, 'addItem() [1]');
	
	// REMOVE_ITEM:
	// ********************************************************************************************
	itemSlot = new ItemSlot(null, null);
	itemSlot.addItem(Item.createItem('PotionOfHealing'));
	itemSlot.addItem(Item.createItem('PotionOfHealing'));
	itemSlot.removeItem(1);
	ASSERT_EQUAL(itemSlot.isEmpty(), false, 'removeItem() [1]');
	itemSlot.removeItem(1);
	ASSERT_EQUAL(itemSlot.isEmpty(), true, 'removeItem() [2]');
	
	// TO_DATA / LOAD_DATA:
	// ********************************************************************************************
	itemSlot = new ItemSlot(Item.createItem('LongSword', {mod: 5}), 'weapon');
	data = itemSlot.toData();
	
	itemSlot = new ItemSlot(null, null);
	itemSlot.loadData(data);
	
	ASSERT_EQUAL(itemSlot.itemTypeSlot, 'weapon');
	ASSERT_EQUAL(itemSlot.item.type.name, 'LongSword');
	ASSERT_EQUAL(itemSlot.item.mod, 5);
	
};