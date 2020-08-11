/*global game, gs, Phaser, console, util*/
/*global Item*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CREATE_RELIGION_TYPES:
// ************************************************************************************************
gs.createReligionTypes = function () {
	this.religionTypes = {};
	
	// TROG:
	// Player will always crit when less then half hp
	this.religionTypes.Trog = {};
	this.religionTypes.Trog.desc = "You will go berserk and deal automatic critical hits whenever you are less then 1/3 HP.";
	this.religionTypes.Trog.effect = function (character) {
		if (character.currentHp <= character.maxHp / 3) {
			character.alwaysCrit += 1;
		}
	};
	
	// Wealth:
	// Player gains tons of gold when joining:
	this.religionTypes.Wealth = {};
	this.religionTypes.Wealth.desc = "You will immediately be giften with a hoard of gold coins.";
	this.religionTypes.Wealth.onSet = function (character) {
		gs.getIndexInBox(character.tileIndex.x - 1, character.tileIndex.y - 1, character.tileIndex.x + 2, character.tileIndex.y + 2).forEach(function (index) {
			if ((gs.isPassable(index) || gs.getChar(index)) && !gs.getItem(index)) {
				gs.createFloorItem(index, Item.createItem('GoldCoin', {amount: util.randInt(10, 20)}));
			}
		});
	};
	
	// ARCHER:
	// Player is occasionally gifted with projectiles
	this.religionTypes.TheArcher = {};
	this.religionTypes.TheArcher.desc = "The Archer will occasionally grant you a gift of projectiles.";
	this.religionTypes.TheArcher.onTurn = function (character) {
		var itemType;
		
		// Approx every 500 turns
		if (game.rnd.frac() < (1 / 500)) {
			itemType = util.randElem([gs.itemTypes.Dart, gs.itemTypes.Javelin]);
			gs.pc.inventory.addItem(Item.createItem(itemType.name, {mod: gs.dropItemModifier(itemType)}));
		}
	};
	
	// WIZARD:
	// Gives the player a chance to save mana on casting
	this.religionTypes.TheWizard = {};
	this.religionTypes.TheWizard.desc = "Your abilities will occasionally use no mana.";
	this.religionTypes.TheWizard.effect = function (character) {
		character.bonusSaveManaChance += 0.05;	
	};
	
	// HEALTH:
	// Player is occasionaly healed
	this.religionTypes.Health = {};
	this.religionTypes.Health.desc = "You will occasionally be healed when your health is less than 50%.";
	this.religionTypes.Health.onTurn = function (character) {
		// Every 200 turns
		if (gs.pc.currentHp < gs.pc.maxHp / 2 && game.rnd.frac() < (1 / 200)) {
			gs.pc.healHp(Math.ceil(gs.pc.maxHp / 2));
			gs.createParticlePoof(gs.pc.tileIndex, 'GREEN');
		}
	};
	
	// EXPLORATION:
	// Players health and mana is restored whenever a new level is generated
	this.religionTypes.Exploration = {};
	this.religionTypes.Exploration.desc = "If you are below 50% health when descending to a new, unexplored level, you will be healed to full.";
	
	this.nameTypes(this.religionTypes);
};

// CREATE_ALTER:
// ************************************************************************************************
gs.createAltar = function (tileIndex, typeName) {
	var indexList;
	this.createObject(tileIndex, typeName);
	
	indexList = gs.getIndexInBox(tileIndex.x - 1, tileIndex.y - 1, tileIndex.x + 2, tileIndex.y + 2);
	indexList = indexList.filter(index => game.rnd.frac() < 0.4);
	if (typeName === 'AltarOfTrog') {
		/*
		indexList = indexList.filter(index => gs.isValidSpawnIndex(index));
		if (gs.debugProperties.spawnMobs) {
			indexList.forEach(function (index) {
				gs.createNPC(index, 'GoblinBrute');
			}, this);
		}
		*/
	} 
	else if (typeName === 'AltarOfHealth') {
		/*
		indexList = indexList.filter(index => !gs.getItem(index) && gs.isPassable(index));
		indexList.forEach(function (index) {
			gs.createFloorItem(index, Item.createItem('PotionOfHealing'));
		}, this);
		*/
	} 
	else if (typeName === 'AltarOfTheWizard') {
		/*
		indexList = indexList.filter(index => !gs.getItem(index) && gs.isPassable(index));
		indexList.forEach(function (index) {
			gs.createFloorItem(index, Item.createItem('PotionOfEnergy'));
		}, this);
		*/
	} 
	else if (typeName === 'AltarOfWealth') {
		/*
		indexList = indexList.filter(index => !gs.getItem(index) && gs.isPassable(index));
		indexList.forEach(function (index) {
			gs.createFloorItem(index, Item.createItem('GoldCoin', {amount: gs.dropGoldAmount()}));
		}, this);
		*/
	} 
	else if (typeName === 'AltarOfTheArcher') {
		/*
		indexList = indexList.filter(index => !gs.getItem(index) && gs.isPassable(index));
		indexList.forEach(function (index) {
			gs.createFloorItem(index, Item.createItem('Javelin'));
		}, this);
		*/
	}
};