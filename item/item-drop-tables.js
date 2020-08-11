/*global gs, game, util*/
/*global Item*/
/*global ITEM_ENCHANTED_PERCENT*/
/*global COMMON_ITEM_PERCENT, UNCOMMON_ITEM_PERCENT, RARE_ITEM_PERCENT*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

/*
	ITEM_DROP_TABLE:
	
	Everything that has to do with randomly creating items should be placed here.
	Items can enter the game in a number of ways:
		- Floor Spawns
		- Merchant Inventory
		- Good Items: zoos, endLevel treasure rooms
		- Crystal chests
		- Acquirement
*/

// GET_RANDOM_ITEM_NAME:
// itemDropTableName is optional, if ommited a table will be randomly chosen
// ************************************************************************************************
gs.getRandomItemName = function (itemDropTableName) {
	itemDropTableName = itemDropTableName || this.chooseRandom(this.itemDropTable);	
	return this.chooseRandom(this.getModifiedItemDropTable(itemDropTableName));
};

// FILTER_DROP_TABLE:
// Filters the drop table to only include items that have not already dropped.
// Note that unstackable items are not counted
// ************************************************************************************************
gs.filterDropTable = function (itemDropTableName) {
	return this.itemTypeDropRate[itemDropTableName].filter(e => !this.shouldFilterItem(e.name));
};

gs.shouldFilterItem = function (itemTypeName) {
	var itemType = this.itemTypes[itemTypeName];
		
	return gs.inArray(itemType.slot, ['weapon', 'hands', 'body', 'shield', 'head', 'ring', 'charm'])
		&& !itemType.stackable
		&& gs.inArray(itemType.name, this.previouslySpawnedItems);
};

// GET_RANDOM_UNIQUE_ITEM_NAME:
// ************************************************************************************************
gs.getRandomUniqueItemName = function () {
	var itemDropTableName,
		dropTable;
	
	itemDropTableName = this.chooseRandom(this.itemDropTable.filter(e => this.filterDropTable(e.name).length > 0));
	dropTable = this.getModifiedItemDropTable(itemDropTableName);
	
	dropTable = dropTable.filter(e => !this.shouldFilterItem(e.name));
	
	return this.chooseRandom(dropTable); 
};
												  
												  

// CREATE_RANDOM_ITEM:
// Creates a random item appropriate to the current zoneName and zoneLevel
// Used for generating floor spawns and enemy item drops
// itemDropTableName can refr to ['Melee', 'RangedWeapons', 'Armor', 'Rings'... etc.]
// ************************************************************************************************
gs.createRandomItem = function (itemDropTableName, forceEnchanted = false, isUnique = false) {
	var typeName, itemType, amount, mod;

	if (isUnique) {
		typeName = this.getRandomUniqueItemName();
		this.previouslySpawnedItems.push(typeName);
	}
	else {	
		typeName = this.getRandomItemName(itemDropTableName);
	}
	
	itemType = this.itemTypes[typeName];
	amount = itemType.dropAmount;
	mod = itemType.baseMod;

	// Mod:
	if (Item.canEnchantItemType(itemType) && game.rnd.frac() < (ITEM_ENCHANTED_PERCENT || forceEnchanted)) {
		mod = this.dropItemModifier(itemType);
	}
	
	// Upgrade: (Always drop one higher mod than player currently has)
	if (gs.pc && Item.canEnchantItemType(itemType) && gs.pc.inventory.itemOfType(itemType) && !itemType.stackable) {
		mod = gs.playerHighestMod(itemType) + 1;
	}

	return new Item.createItem(typeName, {mod: mod, amount: amount});
};



// STOCK_MERCHANT:
// Call during first generation of merchant to add to the global merchant inventory
// ************************************************************************************************
gs.stockMerchant = function () {
	var itemName, numAdded = 0, count = 0;
	
	// During main menu there is no merchant inventory:
	if (!gs.merchantInventory) {
		return;
	}
	
	// Merchant always sells one food (for emergencies):
	if (gs.merchantInventory.canAddItem({type: gs.itemTypes.Meat, mod: 0, amount: 1})) {
		gs.merchantInventory.addItem(Item.createItem('Meat'));
	}
	
	// Merchant always sells one potion:
	itemName = gs.getRandomItemName('Potions');
	if (gs.merchantInventory.canAddItem({type: gs.itemTypes[itemName], mod: 0, amount: 1})) {
		gs.merchantInventory.addItem(Item.createItem(itemName));
	}
	
	// Randomly choose items to stock the inventory:
	while (numAdded < 4 && count < 50) {
		if (this.addRandomItemToMerchant()) {
			numAdded += 1;
		}
		
		// Safety break:
		count += 1;
	}
};

// ADD_RANDOM_ITEM_TO_MERCHANT:
// Creates and tries to add a random item to merchant inventory.
// Returns true if succeeded, else false
// ************************************************************************************************
gs.addRandomItemToMerchant = function () {
	var itemTableName = util.randElem(['RangedWeapons', 'Melee', 'Staves', 'Armor', 'Shields', 'Rings', 'Charms', 'Potions', 'Scrolls', 'Books']),	
		itemName = gs.getRandomItemName(itemTableName),
		itemMod = 0,
		itemType = gs.itemTypes[itemName];

	// Mod:
	if (Item.canEnchantItemType(itemType)) {
		itemMod = gs.dropItemModifier(itemType);

		// When stocking, the merchant will try to stack upgrades
		if (gs.pc.inventory.itemOfType(itemType) && !itemType.stackable) {
			itemMod = gs.pc.inventory.itemOfType(itemType).mod + 1;
		}
	}

	// Always add stackable items:
	if (itemType.stackable && gs.merchantInventory.canAddItem({type: itemType, mod: itemMod, amount: itemType.dropAmount})) {
		gs.merchantInventory.addItem(Item.createItem(itemName, {mod: itemMod, amount: itemType.dropAmount}));
		return true;
	}
	// Adding new items:
	else if (!gs.merchantInventory.itemOfType(itemType) && gs.merchantInventory.canAddItem({type: itemType, mod: itemMod, amount: 1})) {
		gs.merchantInventory.addItem(Item.createItem(itemName, {mod: itemMod, amount: itemType.dropAmount}));
		return true;
	}
	// Replacing items w/ higher mods:
	else if (gs.merchantInventory.itemOfType(itemType) && Item.canEnchantItemType(itemType)) {
		gs.merchantInventory.itemOfType(itemType).mod = Math.max(itemMod, gs.merchantInventory.itemOfType(itemType).mod + 1);
		return true;
	}
	
	return false;
};

// DROP_ITEM_MODIFIER:
// What should the mod be on an item
// This will be based on the dangerLevel()
// Will randomly roll
// ************************************************************************************************
gs.dropItemModifier = function (itemType) {
	var maxMod = Math.ceil(this.dangerLevel() / 4),
		minMod = Math.ceil(maxMod / 2),
		mod;
	
	// Random roll:
	mod = util.randInt(minMod, maxMod);
	
	// Projectiles must have an odd multiple:
	if (itemType.attackEffect && itemType.attackEffect.skill === 'Range' && itemType.stackable && mod % 2 === 0) {
		mod += 1;
	}
	
	return mod;
};

// PLAYER_HIGHEST_MOD:
// Given an itemType, if the player has one or more of the items, return the highest mod.
// Returns 0 if the player does not have the item or his highest mod is 0.
// This can be used to force upgrades for the player.
// ************************************************************************************************
gs.playerHighestMod = function (itemType) {
	return gs.pc.inventory.highestMod(itemType);
};

// CREATE_ITEM_DROP_TABLES:
// ************************************************************************************************
gs.createItemDropTables = function () {
	
	// DROP_TYPE_TABLE:
	// ********************************************************************************************
	this.itemDropTable = [
		// Equipment: 40
		{name: 'Books',			percent: 3},
		{name: 'Melee',			percent: 6},
		{name: 'Staves',		percent: 1},
		{name: 'Rings',			percent: 8},
		{name: 'Armor',			percent: 14},
		{name: 'Shields',		percent: 4},
		{name: 'Charms',		percent: 4},
		
		// Consumable: 60
		{name: 'Wands',			percent: 6},
		{name: 'Keys',			percent: 5},
		{name: 'Scrolls',		percent: 12},
		{name: 'Food',			percent: 5},
		{name: 'RangedWeapons', percent: 10},
		{name: 'Potions',		percent: 22},
	];

	// The drop rate for individual item types within a class:
	this.itemTypeDropRate = {};

	// MELEE_WEAPONS:
	// ********************************************************************************************
	this.itemTypeDropRate.Melee = [
		{name: 'LongSword',				freq: 'COMMON'},
		{name: 'Spear',					freq: 'COMMON'},
		{name: 'BroadAxe',				freq: 'COMMON'},
		{name: 'Mace',					freq: 'COMMON'},
		{name: 'Rapier',				freq: 'COMMON'},
		
		{name: 'TwoHandSword',			freq: 'COMMON'},
		{name: 'Halberd',				freq: 'COMMON'},
		{name: 'BattleAxe',				freq: 'COMMON'},
		{name: 'WarHammer',				freq: 'COMMON'},
		
		{name: 'Sling',					freq: 'COMMON'},
		{name: 'LongBow',				freq: 'COMMON'},
		
		{name: 'InfernoSword',			freq: 'RARE'},
		{name: 'StormChopper',			freq: 'RARE'},
	];
	
	// STAVES:
	// ********************************************************************************************
	this.itemTypeDropRate.Staves = [
		{name: 'GreaterStaffOfFire',		freq: 'COMMON'},
		{name: 'GreaterStaffOfStorms',		freq: 'COMMON'},
		{name: 'GreaterStaffOfPoison',		freq: 'COMMON'},
		{name: 'GreaterStaffOfIce',			freq: 'COMMON'},
		{name: 'StaffOfPower',				freq: 'UNCOMMON'},
		{name: 'StaffOfEnergy',				freq: 'UNCOMMON'},
	];

	// RANGED_WEAPONS:
	// ********************************************************************************************
	this.itemTypeDropRate.RangedWeapons = [
		{name: 'Dart',				freq: 'COMMON'},
		{name: 'Javelin',			freq: 'COMMON'},
		{name: 'ThrowingNet',		freq: 'UNCOMMON'},
		{name: 'Bomb',				freq: 'UNCOMMON'},
        {name: 'Chakram',           freq: 'UNCOMMON'},
	];

	// ARMOR:
	// ********************************************************************************************
	this.itemTypeDropRate.Armor = [
		// MUNDANE ARMOR:
		{name: 'Robe',					freq: 'COMMON'},
		{name: 'Shoes',					freq: 'COMMON'},
		{name: 'Hat',					freq: 'COMMON'},
		{name: 'ClothGloves',			freq: 'COMMON'},
		{name: 'LeatherArmor',			freq: 'COMMON'},
		{name: 'LeatherBoots',			freq: 'COMMON'},
		{name: 'LeatherHelm',			freq: 'COMMON'},
		{name: 'LeatherGloves',			freq: 'COMMON'},
		{name: 'PlateArmor',			freq: 'COMMON'},
		{name: 'PlateBoots',			freq: 'COMMON'},
		{name: 'PlateHelm',				freq: 'COMMON'},
		{name: 'PlateGloves',			freq: 'COMMON'},
		
		// MAGIC ARMOR:
		{name: 'RedDragonScaleArmor',		freq: 'UNCOMMON'},
		{name: 'GreenDragonScaleArmor',		freq: 'UNCOMMON'},
		{name: 'BlueDragonScaleArmor',		freq: 'UNCOMMON'},
		{name: 'WhiteDragonScaleArmor',		freq: 'UNCOMMON'},
		{name: 'CrystalArmor',				freq: 'UNCOMMON'},
		{name: 'CloakOfStealth',			freq: 'UNCOMMON'},
		{name: 'RobeOfWizardry',			freq: 'UNCOMMON'},
		{name: 'BootsOfStealth',			freq: 'UNCOMMON'},
		{name: 'BootsOfSpeed',				freq: 'UNCOMMON'},
		{name: 'BootsOfFlight',				freq: 'UNCOMMON'},
		{name: 'CircletOfKnowledge',		freq: 'UNCOMMON'},
		{name: 'ArcheryGoggles',			freq: 'UNCOMMON'},
		{name: 'HelmOfTelepathy',			freq: 'UNCOMMON'},
		{name: 'GauntletsOfStrength',		freq: 'UNCOMMON'},
		{name: 'GlovesOfVampirism',			freq: 'UNCOMMON'},
		{name: 'RobeOfFlames',				freq: 'UNCOMMON'},
		{name: 'RobeOfStorms',				freq: 'UNCOMMON'},
		{name: 'RobeOfIce',					freq: 'UNCOMMON'},
		{name: 'RobeOfDeath',				freq: 'UNCOMMON'},
	];
	
	// SHIELDS:
	// ********************************************************************************************
	this.itemTypeDropRate.Shields = [
		// MUNDANE_SHIELDS:
		{name: 'WoodenShield',				freq: 'COMMON'},
		{name: 'MetalShield',				freq: 'COMMON'},
		
		// MAGIC_SHIELDS:
		{name: 'RedDragonScaleShield',		freq: 'UNCOMMON'},
		{name: 'GreenDragonScaleShield',	freq: 'UNCOMMON'},
		{name: 'BlueDragonScaleShield',		freq: 'UNCOMMON'},
		{name: 'WhiteDragonScaleShield',	freq: 'UNCOMMON'},
		{name: 'SpikyShield',				freq: 'UNCOMMON'},
		
		{name: 'ShieldOfReflection',		freq: 'RARE'},
		{name: 'OrbOfMana',					freq: 'RARE'},
		{name: 'OrbOfPower',				freq: 'RARE'},
	];

	// RINGS:
	// ********************************************************************************************
	this.itemTypeDropRate.Rings = [
		// COMMON:
		{name: 'RingOfFire',			freq: 'COMMON'},
		{name: 'RingOfStorm',			freq: 'COMMON'},
		{name: 'RingOfToxic',			freq: 'COMMON'},
		{name: 'RingOfIce',				freq: 'COMMON'},
		{name: 'RingOfSustenance',		freq: 'COMMON'},
		{name: 'RingOfStealth',			freq: 'COMMON'},
		{name: 'RingOfHealth',			freq: 'COMMON'},
		{name: 'RingOfMana',			freq: 'COMMON'},
		{name: 'RingOfProtection',		freq: 'COMMON'},
		{name: 'RingOfEvasion',			freq: 'COMMON'},
		{name: 'RingOfStrength',		freq: 'COMMON'},
		{name: 'RingOfIntelligence',	freq: 'COMMON'},
		{name: 'RingOfDexterity',		freq: 'COMMON'},
		
		// UNCOMMON:
		{name: 'RingOfFlight',			freq: 'UNCOMMON'},
		{name: 'RingOfWizardry',		freq: 'UNCOMMON'},
		{name: 'RingOfTheVampire',		freq: 'UNCOMMON'},
		{name: 'RingOfLearning',		freq: 'UNCOMMON'},
		
		// RARE:
		{name: 'RingOfLifeSaving',		freq: 'RARE'},
		{name: 'InfernoRing',			freq: 'RARE'},
		{name: 'RingOfThunder',			freq: 'RARE'},
		{name: 'RingOfReflection',		freq: 'RARE'},
		{name: 'RingOfSpeed',			freq: 'RARE'},
		{name: 'RingOfWealth',			freq: 'RARE'},

	];
	
	// CHARMS:
	// ********************************************************************************************
	this.itemTypeDropRate.Charms = [
		{name: 'CharmOfFire',			freq: 'COMMON'},
		{name: 'CharmOfLightning',		freq: 'COMMON'},
		{name: 'CharmOfDisease',		freq: 'COMMON'},
		{name: 'CharmOfFreezing',		freq: 'COMMON'},
		{name: 'CharmOfConfusion',		freq: 'COMMON'},
		{name: 'CharmOfRegeneration',	freq: 'COMMON'},
		{name: 'CharmOfClarity',		freq: 'COMMON'},
		
		//{name: 'CharmOfBlinking',		freq: 'UNCOMMON'},
		{name: 'CharmOfSwiftness',		freq: 'UNCOMMON'},
		{name: 'CharmOfHealing',		freq: 'UNCOMMON'},
		{name: 'CharmOfEnergy',			freq: 'UNCOMMON'},
	];
	
	// WANDS:
	// ********************************************************************************************
	this.itemTypeDropRate.Wands = [
		{name: 'WandOfFire',			freq: 'COMMON'},
		{name: 'WandOfLightning',		freq: 'COMMON'},
		{name: 'WandOfCold',			freq: 'COMMON'},
		{name: 'WandOfDraining',		freq: 'COMMON'},
		{name: 'WandOfConfusion',		freq: 'COMMON'},
		{name: 'WandOfBlades',			freq: 'COMMON'},
		{name: 'WandOfBlinking',		freq: 'COMMON'},
	];
	
	// POTIONS:
	// ********************************************************************************************
	this.itemTypeDropRate.Potions = [
		{name: 'PotionOfHealing',		freq: 'COMMON'},
		{name: 'PotionOfEnergy',		freq: 'COMMON'},
		{name: 'PotionOfResistance',	freq: 'UNCOMMON'},
		{name: 'PotionOfExperience', 	freq: 'UNCOMMON'},
		{name: 'PotionOfLevitation', 	freq: 'UNCOMMON'},
		{name: 'PotionOfPower',			freq: 'UNCOMMON'},
		{name: 'PotionOfGainAttribute', freq: 'RARE'},
		{name: 'EnergyShroomTea',		freq: 'RARE'},
	];

	// SCROLLS:
	// ********************************************************************************************
	this.itemTypeDropRate.Scrolls = [
		{name: 'ScrollOfTeleportation',		freq: 'COMMON'},
		{name: 'ScrollOfBlink',				freq: 'COMMON'},
		{name: 'ScrollOfFear',				freq: 'COMMON'},
		{name: 'ScrollOfHellFire',			freq: 'COMMON'},
		{name: 'ScrollOfDomination',		freq: 'UNCOMMON'},
		{name: 'ScrollOfEnchantment',		freq: 'UNCOMMON'},
		{name: 'ScrollOfAcquirement',		freq: 'RARE'}
	];
	
	this.itemTypeDropRate.GoodScrolls = [
		{name: 'ScrollOfEnchantment',		freq: 'COMMON'},
		{name: 'ScrollOfAcquirement',		freq: 'COMMON'}
	];
	
	// FOOD:
	// ********************************************************************************************
	this.itemTypeDropRate.Food = [
		{name: 'Meat',					freq: 'COMMON'}
	];
	
	// KEYS:
	// ********************************************************************************************
	this.itemTypeDropRate.Keys = [
		{name: 'Key',					freq: 'COMMON'}
	];
	
	// BOOKS:
	// ********************************************************************************************
	this.itemTypeDropRate.Books = [
		// SKILL_BOOKS:
		{name: 'TomeOfInferno',			freq: 'COMMON'},
		{name: 'TomeOfStorms',			freq: 'COMMON'},
		{name: 'TomeOfIce',				freq: 'COMMON'},
		{name: 'TomeOfDeath',			freq: 'COMMON'},
		{name: 'TomeOfStealth',			freq: 'COMMON'},
		{name: 'TomeOfDefense',			freq: 'COMMON'},
		{name: 'TomeOfWar',				freq: 'COMMON'},
		{name: 'TomeOfArchery',			freq: 'COMMON'},
		{name: 'TomeOfAthletics',		freq: 'COMMON'},
		{name: 'TomeOfPower',			freq: 'COMMON'},
		{name: 'TomeOfEnchantment',		freq: 'COMMON'},
	];
	
	// Setting default values:
	this.forEachType(this.itemTypeDropRate, function (table) {
		table.forEach(function (element) {
			element.minLevel = element.minLevel || 0;
			
			// Checking for unknown items:
			if (!this.itemTypes[element.name]) {
				throw 'Unknown item in dropTable: ' + element.name;
			}
		}, this);
	}, this);
};

// GET_MODIFIED_ITEM_DROP_TABLE:
// Use this function to get a modified (percent) based table of the item class
// This function will take into account the relative dungeon level and ommit certain items from the table
// Input: the name of a table with freq: ['COMMON', 'UNCOMMON', 'RARE']
// Output: a new table with percent: [1-100];
// ************************************************************************************************
gs.getModifiedItemDropTable = function (itemClassName) {
	var table, numCommon, numUncommon, numRare, i;

	// Create a new copy of the table:
	table = this.itemTypeDropRate[itemClassName].slice(0);
	
	// Count Common:
	numCommon = table.reduce(function (pv, nv) {
		return pv + (nv.freq === 'COMMON' && gs.dangerLevel() >= nv.minLevel ? 1 : 0);
	}, 0);
		
	// Count Uncommon:
	numUncommon = table.reduce(function (pv, nv) {
		return pv + (nv.freq === 'UNCOMMON' && gs.dangerLevel() >= nv.minLevel ? 1 : 0);
	}, 0);
		
	// Count Rare:
	numRare = table.reduce(function (pv, nv) {
		return pv + (nv.freq === 'RARE' && gs.dangerLevel() >= nv.minLevel ? 1 : 0);
	}, 0);
	
	// Create new percent table:
	for (i = 0; i < table.length; i += 1) {
		if (table[i].freq === 'COMMON' && gs.dangerLevel() >= table[i].minLevel) {
			table[i].percent = COMMON_ITEM_PERCENT / numCommon;
		} else if (table[i].freq === 'UNCOMMON' && gs.dangerLevel() >= table[i].minLevel) {
			table[i].percent = UNCOMMON_ITEM_PERCENT / numUncommon;
		} else if (table[i].freq === 'RARE' && gs.dangerLevel() >= table[i].minLevel) {
			table[i].percent = RARE_ITEM_PERCENT / numRare;
		} else {
			table[i].percent = 0;
		}
	}
	return table;
};