/*global gs, console*/
/*global ItemSlot, ItemSlotList, Item, PlayerCharacter*/
/*global ASSERT_EQUAL, ASSERT_THROW*/
/*global EQUIPMENT_SLOT_NAMES*/
/*global CHARACTER_SIZE*/
/*global INVENTORY_WIDTH, INVENTORY_HEIGHT*/
/*global WEAPON_HOT_BAR_WIDTH, WEAPON_HOT_BAR_HEIGHT*/
/*global CONSUMABLE_HOT_BAR_WIDTH, CONSUMABLE_HOT_BAR_HEIGHT*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CHARACTER_INVENTORY:
// ************************************************************************************************
function CharacterInventory (character) {	
	this.character = character;
	
	// Item Slot Lists:
	this.inventory = new ItemSlotList(INVENTORY_WIDTH * INVENTORY_HEIGHT);
	this.weaponHotBar = new ItemSlotList(WEAPON_HOT_BAR_WIDTH * WEAPON_HOT_BAR_HEIGHT - 1, 'weapon');
	this.consumableHotBar = new ItemSlotList(CONSUMABLE_HOT_BAR_WIDTH * CONSUMABLE_HOT_BAR_HEIGHT, 'consumable');
	this.equipment = new ItemSlotList(EQUIPMENT_SLOT_NAMES.length);
	this.quickWeaponSlot = new ItemSlot(null, 'weapon');
	
	// Set this to true to temporarily equip the quick weapon for a single turn to handle player stats
	this.quickWeaponEquipped = false;
	
	// Setting itemSlotTypes:
	EQUIPMENT_SLOT_NAMES.forEach(function (name, index) {
		this.equipment.itemSlots[index].itemTypeSlot = name;
	}, this);
	
	// Misc:
	this.gold = 0;
	this.keys = 0;
	this.weaponIndex = -1;
	this.lastWeaponIndex = -1;
	
	// Default Weapon:
	this.fists = Item.createItem('Fists');
	
	// Flaming Hands:
	this.flamingHands = Item.createItem('FlamingHands');
}

// CLEAR:
// ************************************************************************************************
CharacterInventory.prototype.clear = function () {
	this.gold = 0;
	this.keys = 0;
	this.weaponIndex = -1;
	this.lastWeaponIndex = -1;
	this.quickWeaponEquipped = false;
	
	this.inventory.clear();
	this.weaponHotBar.clear();
	this.consumableHotBar.clear();
	this.equipment.clear();
	this.quickWeaponSlot.clear();
};

// EQUIPMENT_SLOT:
// Easy access to equipment slots by name
// ************************************************************************************************
CharacterInventory.prototype.equipmentSlot = function (slotName) {
	ASSERT_EQUAL(EQUIPMENT_SLOT_NAMES.indexOf(slotName) > -1, true, 'Invalid slotName: ' + slotName);
	
	return this.equipment.itemSlots[EQUIPMENT_SLOT_NAMES.indexOf(slotName)];
};

// TO_DATA:
// ************************************************************************************************
CharacterInventory.prototype.toData = function () {
	var data = {};
	
	// Save ItemSlotLists:
	data.inventory = this.inventory.toData();
	data.weaponHotBar = this.weaponHotBar.toData();
	data.consumableHotBar = this.consumableHotBar.toData();
	data.equipment = this.equipment.toData();
	data.quickWeaponSlot = this.quickWeaponSlot.toData();
	
	// Misc:
	data.weaponIndex = this.weaponIndex;
	data.lastWeaponIndex = this.lastWeaponIndex;
	data.gold = this.gold;
	data.keys = this.keys;
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
CharacterInventory.prototype.loadData = function (data) {	
	// Load ItemSlotLists:
	this.inventory.loadData(data.inventory);
	this.weaponHotBar.loadData(data.weaponHotBar);
	this.consumableHotBar.loadData(data.consumableHotBar);
	this.equipment.loadData(data.equipment);
	this.quickWeaponSlot.loadData(data.quickWeaponSlot);
	
	
	// Load Misc:
	this.gold = data.gold;
	this.keys = data.keys;
	this.weaponIndex = data.weaponIndex;
	this.lastWeaponIndex = data.lastWeaponIndex;
};

// CAN_ADD_ITEM:
// ************************************************************************************************
CharacterInventory.prototype.canAddItem = function (item) {
	ASSERT_EQUAL(Item.isItem(item), true, 'Invalid item: ' + item);
	
	if (item.type.name === 'GoldCoin' || item.type.name === 'Key' || item.type.name === 'GobletOfYendor') {
		return true;
	}
	else if (this.consumableHotBar.canAddItem(item)) {
		return true;
	}
	else if (this.weaponHotBar.canAddItem(item)) {
		return true;
	}
	else if (this.quickWeaponSlot.canAddItem(item)) {
		return true;
	}
	else if (this.inventory.canAddItem(item)) {
		return true;
	}
	
	return false;
};


// ADD_ITEM:
// ************************************************************************************************
CharacterInventory.prototype.addItem = function (item) {	
	// Add Gold:
	if (item.type.name === 'GoldCoin') {
		this.gold += item.amount;
	}
	// Add Key:
	else if (item.type.name === 'Key') {
		this.keys += 1;
	}
	// Add Book Talents:
	else if (item.type.slot === 'book') {
		this.character.addBookTalents(item);
	}
	// First try to stack on quick slot:
	else if (this.quickWeaponSlot.canStackItem(item)) {
		this.quickWeaponSlot.addItem(item);
	}
	// First try to stack on consumable:
	else if (this.consumableHotBar.canStackItem(item)) {
		this.consumableHotBar.addItem(item);
	}
	// First try to stack on weapons:
	else if (this.weaponHotBar.canStackItem(item)) {
		this.weaponHotBar.addItem(item);
	}
	// First try to stack on inventory:
	else if (this.inventory.canStackItem(item)) {
		this.inventory.addItem(item);
	}
	// Add item to consumable hotbar:
	else if (this.consumableHotBar.canAddItem(item)) {
		this.consumableHotBar.addItem(item);
	}
	// Add item to weapon hotbar:
	else if (this.weaponHotBar.canAddItem(item)) {
		this.weaponHotBar.addItem(item);
	}
	// Adding to inventory:
	else if (this.inventory.canAddItem(item)) {
		this.inventory.addItem(item);
	}
	// Can't add item:
	else {
		this.character.dropItem(item);
	}
		
	this.character.onAddItem(item);
};

// REMOVE_ITEM:
// ************************************************************************************************
CharacterInventory.prototype.removeItem = function (item, amount) {
	ASSERT_EQUAL(Item.isItem(item), true, 'Invalid item: ' + item);
	
	// Try to remove from weaponHotBar:
	if (this.weaponHotBar.containsItem(item)) {
		this.weaponHotBar.removeItem(item, amount);
	}
	// Try to remove from consumableHotBar:
	else if (this.consumableHotBar.containsItem(item)) {
		this.consumableHotBar.removeItem(item, amount);
	}
	// Try to remove from inventory:
	else if (this.inventory.containsItem(item)) {
		this.inventory.removeItem(item, amount);
	}
	// Try to remove from equipment:
	else if (this.equipment.containsItem(item)) {
		this.equipment.removeItem(item, amount);
		this.character.onUnequipItem(item);
	}
	// Try to remove from quick slot
	else if (this.quickWeaponSlot.item === item) {
		this.quickWeaponSlot.removeItem(amount);
	}
	else {
		throw 'Failed to remove item: ' + item;
	}
	
	this.character.updateStats();
};


// ALL_FULL_ITEM_SLOTS:
// Used when we need to create a list of all the players slots for stuff like merchant, enchantment, transferance menus.
// ************************************************************************************************
CharacterInventory.prototype.allFullItemSlots = function () {
	var list = [];
	
	list = list.concat(this.equipment.allFullItemSlots());
	list = list.concat(this.consumableHotBar.allFullItemSlots());
	list = list.concat(this.weaponHotBar.allFullItemSlots());
	list = list.concat(this.inventory.allFullItemSlots());
	
	if (this.quickWeaponSlot.hasItem()) {
		list.push(this.quickWeaponSlot);
	}
	
	return list;
};

// HIGHEST_MOD:
// Returns the highest mod of the itemType in the inventory or 0 if no item
// ************************************************************************************************
CharacterInventory.prototype.highestMod = function (itemType) {
	var itemList;
	itemList = this.allFullItemSlots().map(slot => slot.item);
	itemList = itemList.filter(item => item.type === itemType);
	itemList.sort((a, b) => b.mod - a.mod);
	return itemList.length > 0 ? itemList[0].mod : 0;
};

// ITEM_OF_TYPE:
// Returns the item in the players inventory of the specified type
// ************************************************************************************************
CharacterInventory.prototype.itemOfType = function (type) {
	if (this.weaponHotBar.itemOfType(type)) {
		return this.weaponHotBar.itemOfType(type);
	}
	else if (this.consumableHotBar.itemOfType(type)) {
		return this.consumableHotBar.itemOfType(type);
	}
	else if (this.inventory.itemOfType(type)) {
		return this.inventory.itemOfType(type);
	}
	else if (this.equipment.itemOfType(type)) {
		return this.equipment.itemOfType(type);
	}
	else {
		return null;
	}
};

// COUNT_ITEM_OF_TYPE:
// ************************************************************************************************
CharacterInventory.prototype.countItemOfType = function (type) {
	var item = this.itemOfType(type);
	
	if (item) {
		return item.amount;
	}
	else {
		return 0;
	}
};

// GET_WEAPON:
// ************************************************************************************************
CharacterInventory.prototype.getWeapon = function () {
	if (this.quickWeaponEquipped) {
		if (this.quickWeaponSlot.item) {
			return this.quickWeaponSlot.item;
		}
		else {
			return this.fists;
		}
	}
	else if (this.character.statusEffects.has('FlamingHands')) {
		return this.flamingHands;
	}
	else if (this.weaponIndex === -1) {
		return this.fists;
	} 
	else if (this.weaponHotBar.itemAtIndex(this.weaponIndex) === null) {
		return this.fists;
	} 
	else {
		return this.weaponHotBar.itemAtIndex(this.weaponIndex);
	}
};

// GET_QUICK_WEAPON:
// ************************************************************************************************
CharacterInventory.prototype.getQuickWeapon = function () {
	return this.quickWeaponSlot.item;
};

// GET_CHARM:
// ************************************************************************************************
CharacterInventory.prototype.getCharm = function () {
	return this.equipmentSlot('charm').item;
};

// SWAP_WEAPON:
// ************************************************************************************************
CharacterInventory.prototype.swapWeapon = function () {
	// No last weapon:
	if (this.lastWeaponIndex === -1) {
		return;
	}

	// Still don't have weapon:
	if (!this.weaponHotBar.itemAtIndex(this.lastWeaponIndex)) {
		return;
	}

	gs.pc.weaponSlotClicked(this.weaponHotBar.itemSlots[this.lastWeaponIndex]);
};

// ON_UPDATE_TURN:
// ************************************************************************************************
CharacterInventory.prototype.onUpdateTurn = function () {
	if (this.equipmentSlot('charm').hasItem()) {
		this.equipmentSlot('charm').item.onUpdateTurn();
	}
};

// ON_UPDATE_STATS:
// ************************************************************************************************
CharacterInventory.prototype.onUpdateStats = function () {
	this.equipmentList().forEach(function(item) {
		item.applyEquipmentStats(this.character);
	}, this);
};

// EQUIPMENT_LIST:
// Return a list of all the items the character is currently wearing
// Returns a list of 'Items'
// ************************************************************************************************
CharacterInventory.prototype.equipmentList = function () {
	var list = [];
	
	this.equipment.forEachItem(function (item) {
		if (item.type.slot !== 'shield') {
			list.push(item);
		}
		// Only add shield if the player can wield it i.e. not wielding a two-hander
		else if (this.canWieldShield()) {
			list.push(item);
		}
		
	}, this);

	// Adding weapon:
	list.push(this.getWeapon());
	
	return list;
};

// CAN_WIELD_SHIELD:
// Determines if the player can validly equip an item in the shield slot.
// ************************************************************************************************
CharacterInventory.prototype.canWieldShield = function () {
	return this.getWeapon().type.hands === 1 || this.character.size === CHARACTER_SIZE.LARGE;
};

// HAS_SHIELD_EQUIPPED:
// Used for determining if the character can use shield abilities.
// Note that this will return false for items like orbs of power even though they fit in the shield slot
// ************************************************************************************************
CharacterInventory.prototype.hasShieldEquipped = function () {
	return this.equipmentSlot('shield').hasItem()
		&& this.equipmentSlot('shield').item.type.stats.protection > 0
		&& this.canWieldShield();
};

// UNIT_TESTS:
// ************************************************************************************************
CharacterInventory.UnitTests = function () {
	var pc = new PlayerCharacter(),
		inventory = pc.inventory,
		data;
	
	// EQUIPMENT_SLOT:
	// ********************************************************************************************
	EQUIPMENT_SLOT_NAMES.forEach(function (name) {
		ASSERT_EQUAL(inventory.equipmentSlot(name).isEmpty(), true, 'Test Failed');
	}, this);
	
	ASSERT_THROW(inventory.equipmentSlot.bind(inventory, 'foobar'), 'Test Failed');
	
	// CAN_ADD_ITEM:
	// ********************************************************************************************
	ASSERT_THROW(inventory.canAddItem.bind(inventory, 'foobar'));
	
	ASSERT_EQUAL(inventory.canAddItem(Item.createItem('GoldCoin')), true, 'Always add gold');
	ASSERT_EQUAL(inventory.canAddItem(Item.createItem('Key')), true, 'Always add keys');
	ASSERT_EQUAL(inventory.canAddItem(Item.createItem('GobletOfYendor')), true, 'Always add goblet');
	ASSERT_EQUAL(inventory.canAddItem(Item.createItem('PotionOfHealing')), true, 'Can add to consumable bar');
	ASSERT_EQUAL(inventory.canAddItem(Item.createItem('LongSword')), true, 'Can add to weapon bar');
	
	// Fill the weapon bar:
	while (inventory.weaponHotBar.canAddItem(Item.createItem('LongSword'))) {
		inventory.addItem(Item.createItem('LongSword'));
	}
	ASSERT_EQUAL(inventory.weaponHotBar.canAddItem(Item.createItem('LongSword')), false, 'Weapon hotbar should be full now');
	ASSERT_EQUAL(inventory.canAddItem(Item.createItem('LongSword')), true, 'Should add to general inventory even when full');
	
	// Fill the general inventory:
	while (inventory.inventory.canAddItem(Item.createItem('LongSword'))) {
		inventory.addItem(Item.createItem('LongSword'));
	}
	ASSERT_EQUAL(inventory.canAddItem(Item.createItem('LongSword')), false, 'Inventory should now be full');
	
	// ADD_ITEM:
	// ********************************************************************************************
	pc = new PlayerCharacter();
	inventory = pc.inventory;
	
	inventory.addItem(Item.createItem('GoldCoin', {amount: 10}));
	ASSERT_EQUAL(inventory.gold, 10, 'Adding gold item');
	
	inventory.addItem(Item.createItem('Key'));
	ASSERT_EQUAL(inventory.keys, 1, 'Adding key item');
	
	let numTalents = pc.availableTalents.length;
	inventory.addItem(Item.createItem('TomeOfInferno'));
	ASSERT_EQUAL(pc.availableTalents.length > numTalents, true, 'Successfully added talents');
	
	// Add to consumable bar:
	inventory.addItem(Item.createItem('PotionOfHealing'));
	ASSERT_EQUAL(inventory.consumableHotBar.countItemOfType(gs.itemTypes.PotionOfHealing), 1);
	
	// Stack on consumable bar:
	inventory.addItem(Item.createItem('PotionOfHealing'));
	ASSERT_EQUAL(inventory.consumableHotBar.countItemOfType(gs.itemTypes.PotionOfHealing), 2);
	
	// Add to weapon bar:
	inventory.addItem(Item.createItem('Dart', {amount: 1}));
	ASSERT_EQUAL(inventory.weaponHotBar.countItemOfType(gs.itemTypes.Dart), 1);
	
	// Stack on weapon bar:
	inventory.addItem(Item.createItem('Dart', {amount: 1}));
	ASSERT_EQUAL(inventory.weaponHotBar.countItemOfType(gs.itemTypes.Dart), 2);
	
	// Add to main inventory:
	inventory.inventory.addItem(Item.createItem('Javelin', {amount: 1}));
	ASSERT_EQUAL(inventory.inventory.countItemOfType(gs.itemTypes.Javelin), 1);
	
	// Stack on main inventory:
	inventory.addItem(Item.createItem('Javelin', {amount: 1}));
	ASSERT_EQUAL(inventory.inventory.countItemOfType(gs.itemTypes.Javelin), 2);
	
	// Make sure it wasn't added to weapons:
	ASSERT_EQUAL(inventory.weaponHotBar.countItemOfType(gs.itemTypes.Javelin), 0);
	
	// ADD / REMOVE EVERY ITEM:
	// ********************************************************************************************
	pc = new PlayerCharacter();
	inventory = pc.inventory;
	
	// Attempt to add and remove every item in the game:
	for (let key in gs.itemTypes) {
		if (gs.itemTypes.hasOwnProperty(key)) {
			let item = Item.createItem(key);
			inventory.addItem(item);
			
			if (inventory.itemOfType(item.type)) {
				inventory.removeItem(item);
			}
		}
	}
};
