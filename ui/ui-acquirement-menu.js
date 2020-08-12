/*global game, gs, Phaser, console, */
/*global Item*/
/*global SCALE_FACTOR, HUGE_WHITE_FONT, SCREEN_HEIGHT, LARGE_WHITE_FONT, HUD_START_X*/
/*global MAX_ENCHANTMENT*/
/*global UIItemSlotList, ItemSlotList*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIAcquirementMenu() {
	var width = 580,
        height = 540,
		startX = HUD_START_X / 2 - width / 2,
		startY = (SCREEN_HEIGHT - height) / 2,
		sprite,
		spacing = 30;
	
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	sprite = gs.createSprite(startX, startY, 'SmallMenu', this.group);
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Title Text:
	this.titleText = gs.createText(startX + width / 2, startY + 20, 'Summon Item', HUGE_WHITE_FONT, this.group);
	gs.centerText(this.titleText);
	
	this.buttons = [];
	this.buttons[0] = gs.createTextButton(startX + width / 2, startY + 60, 'Weapon', this.meleeWeaponClicked, this, this.group);
	this.buttons[1] = gs.createTextButton(startX + width / 2, startY + 60 + spacing, 'Staff', this.staffClicked, this, this.group);
	this.buttons[2] = gs.createTextButton(startX + width / 2, startY + 60 + spacing * 2, 'Projectiles', this.rangeWeaponClicked, this, this.group);
	this.buttons[3] = gs.createTextButton(startX + width / 2, startY + 60 + spacing * 3, 'Armor', this.armorClicked, this, this.group);
	this.buttons[4] = gs.createTextButton(startX + width / 2, startY + 60 + spacing * 4, 'Shield', this.shieldClicked, this, this.group);
	this.buttons[5] = gs.createTextButton(startX + width / 2, startY + 60 + spacing * 5, 'Ring', this.ringClicked, this, this.group);
	this.buttons[6] = gs.createTextButton(startX + width / 2, startY + 60 + spacing * 6, 'Charm', this.charmClicked, this, this.group);
	this.buttons[7] = gs.createTextButton(startX + width / 2, startY + 60 + spacing * 7, 'Wand', this.wandClicked, this, this.group);
	this.buttons[8] = gs.createTextButton(startX + width / 2, startY + 60 + spacing * 8, 'Potion', this.potionClicked, this, this.group);
	this.buttons[9] = gs.createTextButton(startX + width / 2, startY + 60 + spacing * 9, 'Scroll', this.scrollClicked, this, this.group);
	this.buttons[10] = gs.createTextButton(startX + width / 2, startY + 60 + spacing * 10, 'Food', this.foodClicked, this, this.group);
	this.buttons[11] = gs.createTextButton(startX + width / 2, startY + 60 + spacing * 11, 'Book', this.summonBook, this, this.group);
	
	this.descText = gs.createText(startX + width / 2, startY + 420, 'Select an item type to randomly summon.', LARGE_WHITE_FONT, this.group);
	gs.centerText(this.descText);
	
	// Close button:
	this.closeButton = gs.createTextButton(startX + width / 2, startY + height - 20, '关闭', this.close, this, this.group);
	
	
	this.group.visible = false;
}

// REFRESH:
// ************************************************************************************************
UIAcquirementMenu.prototype.refresh = function () {};

// OPEN:
// ************************************************************************************************
UIAcquirementMenu.prototype.open = function () {
	gs.pc.stopExploring();
	
	this.refresh();
	gs.state = 'ACQUIREMENT_MENU_STATE';
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
UIAcquirementMenu.prototype.close = function () {
	gs.usingFountain = null;
	gs.state = 'GAME_STATE';
	this.group.visible = false;
};

// CONSUME_SCROLL_OR_FOUNTAIN:
// ************************************************************************************************
UIAcquirementMenu.prototype.consumeScrollOrFountain = function () {
	// Using Scroll:
	if (!gs.usingFountain) {
		gs.pc.inventory.removeItem(gs.pc.inventory.itemOfType(gs.itemTypes.ScrollOfAcquirement), 1);
	}
	// Using Fountain:
	else {
		gs.usingFountain.setIsFull(false);
		gs.usingFountain = null;
	}
};

// SUMMON_BOOK:
// ************************************************************************************************
UIAcquirementMenu.prototype.summonBook = function () {
	var itemName;
	
	while (!itemName) {
		itemName = gs.getRandomItemName('Books');
	}
	
	this.consumeScrollOrFountain();
	
	gs.pc.inventory.addItem(Item.createItem(itemName));
	
	this.close();
	gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE');
	gs.playSound(gs.sounds.cure);
};

// SUMMON_EQUIPMENT:
// ************************************************************************************************
UIAcquirementMenu.prototype.summonEquipment = function (tableName) {
	var itemName, mod, itemType;
	
	while (!itemType) {
		itemType = gs.itemTypes[gs.getRandomItemName(tableName)];
	}
	
	mod = this.getMod();
	if (gs.pc.inventory.itemOfType(itemType) && gs.pc.inventory.itemOfType(itemType).mod >= mod) {
		mod = gs.pc.inventory.itemOfType(itemType).mod + 1;
	}
	
	if (itemType.cantEnchant) {
		mod = 0;
	}
	
	this.consumeScrollOrFountain();
	
	gs.pc.inventory.addItem(Item.createItem(itemType.name, {mod: mod}));
	
	this.close();
	gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE');
	gs.playSound(gs.sounds.cure);
};

// MELEE_WEAPON_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.meleeWeaponClicked = function () {
	this.summonEquipment('Melee');
};

// STAFF_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.staffClicked = function () {
	this.summonEquipment('Staves');
};

// ARMOR_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.armorClicked = function () {
	this.summonEquipment('Armor');
};

// SHIELD_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.shieldClicked = function () {
	this.summonEquipment('Shields');
};

// RING_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.ringClicked = function () {
	this.summonEquipment('Rings');
};

// CHARM_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.charmClicked = function () {
	this.summonEquipment('Charms');
};

// WAND_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.wandClicked = function () {
	this.summonEquipment('Wands');
};

// RANGE_WEAPON_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.rangeWeaponClicked = function () {
	var itemName, mod;
	
	while (!itemName) {
		itemName = gs.getRandomItemName('RangedWeapons');
	}
	
	mod = this.getMod();
	
	this.consumeScrollOrFountain();
	
	gs.pc.inventory.addItem(Item.createItem(itemName, {mod: mod, amount: 30}));
	
	this.close();
	gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE');
	gs.playSound(gs.sounds.cure);
};

// POTION_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.potionClicked = function () {
	var itemName;
	
	while (!itemName) {
		itemName = gs.getRandomItemName('Potions');
	}
	
	this.consumeScrollOrFountain();
	
	if (itemName === 'PotionOfGainAttribute') {
		gs.pc.inventory.addItem(Item.createItem(itemName, {amount: 2}));
	} else {
		gs.pc.inventory.addItem(Item.createItem(itemName, {amount: 3}));
	}
	
	this.close();
	gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE');
	gs.playSound(gs.sounds.cure);
};

// SCROLL_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.scrollClicked = function () {
	var itemName;
	
	while (!itemName || itemName === 'ScrollOfAcquirement') {
		itemName = gs.getRandomItemName('Scrolls');
	}
	
	this.consumeScrollOrFountain();
	
	if (itemName === 'ScrollOfEnchantment') {
		gs.pc.inventory.addItem(Item.createItem(itemName, {amount: 2}));
	} else {
		gs.pc.inventory.addItem(Item.createItem(itemName, {amount: 3}));
	}
	
	this.close();
	gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE');
	gs.playSound(gs.sounds.cure);
	
};

// FOOD_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.foodClicked = function () {
	this.consumeScrollOrFountain();
	
	gs.pc.inventory.addItem(Item.createItem('Meat', {amount: 3}));
	
	this.close();
	gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE');
	gs.playSound(gs.sounds.cure);
};

UIAcquirementMenu.prototype.getMod = function () {
	return Math.min(MAX_ENCHANTMENT, Math.ceil(gs.pc.level / 3));
};