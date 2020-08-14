/*global game, gs, console, Phaser, util*/
/*global ASSERT_EQUAL, ASSERT_THROW*/
/*global NICE_STAT_NAMES, STAT_AS_PERCENT, STAT_AS_FLAG, MAX_ENCHANTMENT, LINEAR_MODDED_STATS, SELL_ITEM_PERCENT*/
/*jshint white: true, laxbreak: true, esversion: 6*/
'use strict';

// ITEM_CONSTRUCTOR:
// ************************************************************************************************
function Item (typeName, flags = {}) {
	ASSERT_EQUAL(gs.itemTypes.hasOwnProperty(typeName), true, 'Invalid typeName: ' + typeName);
	
	this.type = gs.itemTypes[typeName];
	
	this.mod = flags.mod || this.type.baseMod;
	this.amount =  flags.amount || this.type.dropAmount;
	this.charges = flags.charges || 0;
	this.chargeTimer = flags.chargeTimer || 0;
	this.talents = flags.talents || null;
	
	Object.seal(this);
}

// TO_SHORT_DESC:
// ************************************************************************************************
Item.prototype.toShortDesc = function () {
	var str = '';
	
	if (this.mod > 0) {
		str += '+' + this.mod + ' ';
	}
	
	str += translator.getText(this.type.niceName);
	
	if (this.amount > 1) {
		str += ' x ' + this.amount;
	}

	return str;
};

// TO_USE_DESC:
// UIUseMenu uses this to create its string:
// ************************************************************************************************
Item.prototype.toUseMenuDesc = function () {
	var str = '';
	
	if (this.mod > 0) {
		str += '+' + this.mod + ' ';
	}
	
	str += this.type.niceName;
	
	if (this.charges > 0) {
		str += '\nCharges: ' + this.charges + '/' + this.getModdedStat('maxCharges');
	}
	
	return str;
};

// TO_LONG_DESC:
// ************************************************************************************************
Item.prototype.toLongDesc = function () {
	var str = '', statName, val, niceName;

	// Name of item:
	str +=  this.toShortDesc() + '\n';
	
	// Damage of Melee Weapons:
	if (this.type.slot === 'weapon' && this.type.stats.damage > 0) {
		str += '伤害: ' + this.getModdedStat('damage') + ' [' + gs.pc.weaponDamage(this) + ']\n';
	}

	// Range:
	if (this.type.slot === 'weapon') {
		str += '攻击范围: ' + Math.floor(gs.pc.weaponRange(this)) + '\n';
	}

	// Equipment Stats:
	for (statName in this.type.stats) {
		if (this.type.stats.hasOwnProperty(statName) && statName !== 'damage') {
			niceName = NICE_STAT_NAMES[statName];
			val = this.getModdedStat(statName);
			
			if (niceName) {
				// Display the stat as a percent:
				if (STAT_AS_PERCENT[statName]) {
					str +=  niceName + ': ' + (val > 0 ? '+' : '') + gs.toPercentStr(val) + '\n';
				}
				// Display just the stat name:
				else if (STAT_AS_FLAG[statName]) {
					str += niceName + '\n';
				}
				// Display as value:
				else {
					str += niceName + ': ' + (val > 0 ? '+' : '') + val + '\n';
				}
			}
			
		}
	}
	
	
	// Charges:
	if (this.type.stats.maxCharges) {
		str += '蓄力: ' + this.charges + '/' + this.getModdedStat('maxCharges') + '\n';
	}
	
	// Ability Desc:
	if (this.type.useEffect && gs.abilityTypes[this.type.useEffect.name]) {
		if (gs.abilityDesc({type: this.type.useEffect}, this)) {
			str += gs.abilityDesc({type: this.type.useEffect}, this);
		}
		
	}
	
	// Talents:
	if (this.talents) {
		for (let i = 0; i < this.talents.length; i += 1) {
			str += '- ' + translator.getText(this.talents[i]) + '\n';
		}
	}

	// Item Desc:
	if (this.type.desc) {
		str += this.type.desc;
	}

	return str;
};

// TO_STRING:
// ************************************************************************************************
Item.prototype.toString = function () {
	var str = this.type.name;
	str += this.mod ? ', mod: ' + this.mod : '';
	str += this.amount > 1 ? ', amount: ' + this.amount : '';
	str += this.charges ? ', charges: ' + this.charges : '';
	str += this.chargeTimer ? ', chargeTimer: ' + this.chargeTimer : '';
	str += this.talents ? ', talents: ' + this.talents : '';
	
	return str;
};

// CAN_STACK_ITEM:
// Returns true if this item can stack with otherItem
// ************************************************************************************************
Item.prototype.canStackItem = function (otherItem) {
	ASSERT_EQUAL(Item.isItem(otherItem), true, 'Not a valid item: ' + otherItem);
	
	return this.type === otherItem.type && this.mod === otherItem.mod && this.type.stackable;
};

// CAN_ENCHANT_ITEM:
// ************************************************************************************************
Item.prototype.canEnchant = function () {
	// Cannot enchant the itemType:
	if (!Item.canEnchantItemType(this.type)) {
		return false;
	}
	
	// Exceeded MAX_ENCHANTMENT:
	if (this.mod >= MAX_ENCHANTMENT) {
		return false;
	}
	
	// Weapons can be maximally enchanted to 2x their base damage
	if (this.type.slot === 'weapon' && this.mod >= this.type.stats.damage) {
		return false;
	}
	
	return true;
};

// ON_UPDATE_TURN:
// ************************************************************************************************
Item.prototype.onUpdateTurn = function () {
	if (this.type.slot === 'charm' && this.charges < this.getModdedStat('maxCharges')) {
		this.chargeTimer += 1;
		
		// Gaining a charge:
		if (this.chargeTimer >= this.type.chargeTime) {
			this.charges += 1;
			this.chargeTimer = 0;
			gs.pc.popUpText(this.type.niceName + ' charged', '#ffffff');
		}
	}
};

// TO_DATA:
// ************************************************************************************************
Item.prototype.toData = function () {
	var data = {};
	
	data.typeName = this.type.name;
	data.mod = this.mod;
	data.amount = this.amount;
	data.charges = this.charges;
	data.chargeTimer = this.chargeTimer;
	data.talents = this.talents;
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
Item.prototype.loadData = function (data) {
	this.type = gs.itemTypes[data.typeName];
	this.mod = data.mod;
	this.amount = data.amount;
	this.charges = data.charges;
	this.chargeTimer = data.chargeTimer;
	this.talents = data.talents;
};


// GET_MODDED_STAT:
// ************************************************************************************************
Item.prototype.getModdedStat = function (statName) {
	var baseVal = this.type.stats[statName];
	
	// Don't mod negative stats:
	if (baseVal < 0) {
		return baseVal;
	}
	// Linear increase (1 stat per mod):
	else if (gs.inArray(statName, LINEAR_MODDED_STATS)) {
		return baseVal + this.mod - this.type.baseMod;
	} 
	// Capped linear:
	else if (gs.inArray(statName, ['fireResistance', 'coldResistance', 'shockResistance', 'toxicResistance'])) {
		return Math.min(3, baseVal + this.mod);	 
	}
	// Large fraction increase (0.2 stat per mod and rounded to whole):
	else if (gs.inArray(statName, ['bonusMaxHp', 'bonusMaxFood'])) {
		return Math.ceil(baseVal + (baseVal * this.mod * 0.2));
	}
	// Default:
	else {
		return baseVal;
	}		
};

// APPLY_EQUIPMENT_STATS:
// Add the stats of an equipped item to the character
// ********************************************************************************************
Item.prototype.applyEquipmentStats = function (character) {
	var statName;

	for (statName in this.type.stats) {
		if (this.type.stats.hasOwnProperty(statName)) {
			// Damage:
			if (statName == 'damage') {
				// Damage is not added to player
			}
			// Adding resistance:
			else if (statName === 'fireResistance') {
				character.resistance.Fire += this.getModdedStat(statName);
			}
			else if (statName === 'coldResistance') {
				character.resistance.Cold += this.getModdedStat(statName);
			}
			else if (statName === 'shockResistance') {
				character.resistance.Shock += this.getModdedStat(statName);
			}
			else if (statName === 'toxicResistance') {
				character.resistance.Toxic += this.getModdedStat(statName);
			}
			// Everything Else:
			else {
				character[statName] += this.getModdedStat(statName);
			}			
		}
	}
};

// ENCHANT:
// ************************************************************************************************
Item.prototype.enchant = function () {
	this.mod += 1;
	
	// Fully recharge wands when enchanting:
	if (this.type.stats.maxCharges) {
		this.charges = this.getModdedStat('maxCharges');
	}
};

// GET_SOUND:
// ************************************************************************************************
Item.prototype.getSound = function () {
	if (this.type.sound) {
		return this.type.sound;
	}
	else if (gs.inArray(this.type.slot, ['body', 'head', 'feet', 'hands', 'shield'])) {
		return gs.sounds.armor;
	}
	else if (gs.inArray(this.type.slot, ['ring', 'charm']) || this.type.name === 'Key') {
		return gs.sounds.jewlery;
	}
	else if (this.type.slot === 'weapon') {
		return gs.sounds.weapon;
	}
	else if (this.type.slot === 'consumable') {
		return gs.sounds.potion;
	}
	else if (this.type.name === 'GoldCoin') {
		return gs.sounds.coin;
	}
	else if (this.type.slot === 'book') {
		return gs.sounds.scroll;
	}
	
};

// BASE_VALUE:
// ************************************************************************************************
Item.prototype.baseValue = function () {
	var cost = Math.ceil(this.type.cost + (0.4 * this.mod * this.type.cost));
	
	// Wand:
	if (this.type.slot === 'consumable' && this.type.stats.maxCharges) {
		cost = Math.ceil(cost * (this.charges / this.type.stats.maxCharges));
	}
	
	return cost;
};


// SELL_VALUE:
// How much does the player get when selling the item
// ************************************************************************************************
Item.prototype.sellValue = function () {
	if (this.type.cost === 0) {
		return 0;
	}
	else {
		return Math.max(1, Math.floor(SELL_ITEM_PERCENT * this.baseValue()));
	}
};

// ************************************************************************************************
// ITEM_STATIC_FUNCTIONS:
// ************************************************************************************************
// ************************************************************************************************
// CREATE_ITEM:
// ************************************************************************************************
Item.createItem = function (typeName, flags = {}) {
	ASSERT_EQUAL(gs.itemTypes.hasOwnProperty(typeName), true, 'Invalid typeName: ' + typeName);
	
	var item;
	
	// Unspecified amount for gold:
	if (typeName === 'GoldCoin' && !flags.amount) {
		flags.amount = util.randInt(Math.ceil(gs.dropGoldAmount() / 2), gs.dropGoldAmount());
	}
	
	item = new Item(typeName, flags);
	
	// Wands have their charges set to max by default:
	if (item.type.stats.maxCharges && item.type.slot === 'consumable' && !flags.charges) {
		item.charges = item.getModdedStat('maxCharges');
	}
	
	// Book talents:
	if (item.type.slot === 'book' && gs.pc) {
		item.talents = gs.getBookTalents(item.type.skillName);
	}
	
	return item;
};

// CREATE_AND_LOAD_ITEM:
// Creates and loads an item from data
// ************************************************************************************************
Item.createAndLoadItem = function (data) {
	return new Item(data.typeName, data);
};

// IS_ITEM:
// Used to confirm that the object in question is actually a valid item
// ************************************************************************************************
Item.isItem = function (item) {
	return Boolean(typeof item === 'object' && item.type && gs.itemTypes[item.type.name]);
};

// CAN_ENCHANT_ITEM_TYPE:
// Note the test for maxCharges to catch wands.
// ************************************************************************************************
Item.canEnchantItemType = function (itemType) {
	var equipmentSlots = ['body', 'ring', 'feet', 'head', 'hands', 'weapon', 'shield', 'charm'];
	return !itemType.cantEnchant && (gs.inArray(itemType.slot, equipmentSlots) || itemType.stats.maxCharges);
};