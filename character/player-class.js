/*global gs, PlayerCharacter*/
/*global Item*/
/*global PLAYER_FRAMES*/
'use strict';
// SET_CLASS:
// ************************************************************************************************
PlayerCharacter.prototype.setClass = function (className) {
	var key;
	this.characterClass = className;
	
	// Starting Food:
	if (this.race.name !== 'Mummy') {
		this.inventory.addItem(Item.createItem('Meat'));
		
		if (gs.inArray(className, ['Necromancer', 'Enchanter', 'FireMage', 'IceMage', 'StormMage'])) {
			this.inventory.addItem(Item.createItem('PotionOfEnergy'));
		}
	}
	
	// WARRIOR:
	if (className === 'Warrior') {
		// Equipment:
		this.inventory.addItem(Item.createItem('ShortSword'));
		this.inventory.addItem(Item.createItem('Dart', {amount: 10}));
		this.inventory.equipmentSlot('shield').addItem(Item.createItem('WoodenShield'));
		
		// Talents:
		this.learnTalent('ShieldsUp');
		this.addAvailableTalents([
			'ShieldsUp', 'PowerStrike', 'Fortitude', 'WeaponMastery',		
			'ShieldWall', 'Deflect', 'Charge',
		]);
		
	}
	// BARBARIAN:
	else if (className === 'Barbarian') {
		// Equipment:
		this.inventory.addItem(Item.createItem('HandAxe'));
		this.inventory.addItem(Item.createItem('Dart', {amount: 10}));
		
		// Talents:
		this.learnTalent('PowerStrike');
		this.addAvailableTalents([
			'PowerStrike', 'Sprint', 'BloodLust', 'WeaponMastery',
			'Charge', 'StrafeAttack', 'WarCry'
		]);
	}
	// RANGER:
	else if (className === 'Ranger') {
		// Equipment:
		this.inventory.addItem(Item.createItem('ShortBow'));
		
		// Talents:
		this.learnTalent('PowerShot');
		this.addAvailableTalents([
			'PowerShot', 'Sprint', 'Evasive', 'RangeMastery',
			'TunnelShot', 'PerfectAim', 'StrafeAttack'
		]);
	}
	// ROGUE:
	else if (className === 'Rogue') {
		// Equipment:
		this.inventory.addItem(Item.createItem('ShortSword'));
		this.inventory.addItem(Item.createItem('Dart', {amount: 20}));
		
		// Talents:
		this.learnTalent('SleepingDart');
		this.addAvailableTalents([
			'SleepingDart', 'Sprint', 'Evasive', 'StealthMastery',
			'DungeonSense', 'NimbleFingers', 'SmokeBomb'
		]);
		
	}
	// DUELIST:
	else if (className === 'Duelist') {
		// Equipment:
		this.inventory.addItem(Item.createItem('Rapier'));
		this.inventory.addItem(Item.createItem('Dart', {amount: 20}));
		
		// Talents:
		this.learnTalent('Disengage');
		this.addAvailableTalents([
			'Disengage', 'Sprint', 'Evasive', 'WeaponMastery',
			'DungeonSense', 'StrafeAttack', 'Lunge'
		]);
		
	}
	// FIRE_MAGE:
	else if (className === 'FireMage') {
		// Equipment:
		this.inventory.addItem(Item.createItem('StaffOfFire'));
		
		// Talents:
		this.learnTalent('FireBall');
		this.addAvailableTalents([
			'FireBall', 'FireAttunement', 'MagicMastery', 'Focus',
			'BurstOfFlame', 'FlamingHands', 'FireBolt'
		]);
	}
	// ICE_MAGE:
	else if (className === 'IceMage') {
		// Equipment:
		this.inventory.addItem(Item.createItem('StaffOfIce'));
		
		// Talents:
		this.learnTalent('ConeOfCold');
		this.addAvailableTalents([
			'ConeOfCold', 'ColdAttunement', 'MagicMastery', 'Focus',
			'FreezingCloud', 'Freeze', 'IceArmor'
		]);
	}
	// STORM_MAGE:
	else if (className === 'StormMage') {
		// Equipment:
		this.inventory.addItem(Item.createItem('StaffOfStorms'));
		
		// Talents:
		this.learnTalent('LightningBolt');
		this.addAvailableTalents([
			'LightningBolt', 'StormAttunement',	'MagicMastery', 'Focus',
			'ThunderClap', 'Shock', 'Levitation'
		]);
	}
	// NECROMANCER:
	else if (className === 'Necromancer') {
		// Equipment:
		this.inventory.addItem(Item.createItem('StaffOfPoison'));
		
		// Talents:
		this.learnTalent('LifeSpike');
		this.addAvailableTalents([
			'LifeSpike', 'ToxicAttunement',	'MagicMastery', 'Focus',
			'InfectiousDisease', 'SummonSkeleton', 'Cannibalise'
		]);
	}
	// ENCHANTER:
	else if (className === 'Enchanter') {
		// Equipment:
		this.inventory.addItem(Item.createItem('StaffOfMagicMissiles'));
		
		// Talents:
		this.learnTalent('Confusion');
		this.addAvailableTalents([
			'Confusion', 'Fear', 'MagicMastery', 'Focus',
			'Charm', 'Mesmerize', 'Swiftness',
		]);
	} 
	else {
		throw 'Invalid className';
	}	
	
	this.inventory.lastWeaponIndex = 1;
	this.inventory.weaponIndex = 0;
	
	

	this.updateStats();
	this.talentPoints = 0;
	this.currentHp = this.maxHp;
	this.currentMp = this.maxMp;
	this.sprite.frame = PLAYER_FRAMES[className];
	this.type.frame = PLAYER_FRAMES[className];
};

gs.createPlayerClasses = function () {
	this.classEffects = {};
	
	// FIRE_MAGE:
	this.classEffects.FireMage = function (character) {
		character.intelligence += 3;
	};
	
	// STORM_MAGE:
	this.classEffects.StormMage = function (character) {
		character.intelligence += 3;
	};
	
	// NECROMANCER:
	this.classEffects.Necromancer = function (character) {
		character.intelligence += 3;
	};
	
	// ICE_MAGE:
	this.classEffects.IceMage = function (character) {
		character.intelligence += 3;
	};
	
	// ENCHANTER:
	this.classEffects.Enchanter = function (character) {
		character.intelligence += 3;
	};
	
	// WARRIOR:
	this.classEffects.Warrior = function (character) {
		character.strength += 3;
	};
	
	// BARBARIAN:
	this.classEffects.Barbarian = function (character) {
		character.strength += 3;
		character.hasRage += 1;
	};
	
	// RANGER:
	this.classEffects.Ranger = function (character) {
		character.dexterity += 3;
	};
	
	// ROGUE:
	this.classEffects.Rogue = function (character) {
		character.dexterity += 3;
	};
	
	// DUELIST:
	this.classEffects.Duelist = function (character) {
		character.dexterity += 3;
	};
};
