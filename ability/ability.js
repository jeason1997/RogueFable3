/*global Phaser, game, gs, console, TILE_SIZE, HELL_FIRE_DAMAGE*/
/*global GREEN_TARGET_BOX_FRAME, RED_SELECT_BOX_FRAME, PURPLE_SELECT_BOX_FRAME*/
/*global MAX_ABILITIES, ITEM_ABILITY_MULTIPLIER_PER_LEVEL*/
/*jshint laxbreak: true, esversion: 6, loopfunc: true*/
'use strict';

// CONSTRUCTOR:
// Abilities is an object that can be added to characters to grant them abilities
// ************************************************************************************************
function Abilities(character) {
	this.character = character;
	this.list = [];
	this.clear();
}

// GET_ABILITY:
// Returns the ability if it exists or null
// ************************************************************************************************
Abilities.prototype.getAbility = function (abilityTypeName) {
	return this.list.find(ability => ability && ability.type.name === abilityTypeName);
};

// UPDATE_TURN:
// Ticks cooldowns:
// ************************************************************************************************
Abilities.prototype.updateTurn = function () {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		// Barbarian and duelist are special case:
		if (this.character.characterClass === 'Barbarian' || this.character.characterClass === 'Duelist') {
			if (this.list[i] && this.list[i].coolDown > 0 && this.list[i].type.coolDown >= 100) {
				this.list[i].coolDown -= 1;
			}
		}
		else {
			if (this.list[i] && this.list[i].coolDown > 0) {
				this.list[i].coolDown -= 1;
			}
		}
	}
};

// TICK_SHORT_COOL_DOWNS:
// Used by barbarian and duelist
// ************************************************************************************************
Abilities.prototype.tickShortCoolDowns = function (amount) {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.list[i] && this.list[i].coolDown > 0 && this.list[i].type.coolDown < 100) {
			this.list[i].coolDown -= amount;
			this.list[i].coolDown = Math.max(0, this.list[i].coolDown);
		}
	}
};

// RESET_ALL_COOLDOWNS:
// ************************************************************************************************
Abilities.prototype.resetAllCoolDowns = function () {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.list[i]) {
			this.list[i].coolDown = 0;
		}
	}
};

// HAS_COOL_DOWN:
Abilities.prototype.hasCoolDown = function () {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.list[i] && this.list[i].coolDown > 0) {
			return true;
		}
	}
	return false;
};

// ABILITY_IN_SLOT:
// Returns the ability in the slot or null if no ability
// ************************************************************************************************
Abilities.prototype.abilityInSlot = function (slot) {
	return this.list[slot];
};

// CLEAR:
// ************************************************************************************************
Abilities.prototype.clear = function () {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		this.list[i] = null;
	}
};

// ADD_ABILITY:
// Returns the slot
// ************************************************************************************************
Abilities.prototype.addAbility = function (type) {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.list[i] === null) {
			this.list[i] = {
				type: type, 
				coolDown: 0,
				isOn: false
			};
			return i;
		}
	}
	
	throw 'Max abilities exceeded: have not implemented checks for this yes';
};

// REMOVE_ABILITY:
// Returns the slot
// ************************************************************************************************
Abilities.prototype.removeAbility = function (type) {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.list[i].type === type) {
			this.list[i] = null;
			return i;
		}
	}
	
	throw 'Could not remove ability...';
};

// TO_DATA:
// ************************************************************************************************
Abilities.prototype.toData = function () {
	var data = [];
	
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.list[i]) {
			data[i] = {
				typeName: this.list[i].type.name,
				coolDown: this.list[i].coolDown,
				isOn: this.list[i].isOn
			};
		}
		else {
			data[i] = null;
		}
	}
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
Abilities.prototype.loadData = function (data) {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (data[i]) {
			this.list[i] = {
				type: gs.abilityTypes[data[i].typeName], 
				coolDown: data[i].coolDown,
				isOn: data[i].isOn
			};
		}
		else {
			this.list[i] = null;
		}
	}
};

// CREATE_NPC_ABILITY_TYPE:
// Used by NPCs to create unique abilityTypes giving them each their own unique abilities
// ************************************************************************************************
gs.createNPCAbilityType = function (npcType, abilityTypeName, abilityStats) {
	var abilityType, key;
	
	if (!this.abilityTypes[abilityTypeName]) {
		throw 'createNPCAbilityType - undefined abilityType: ' + abilityTypeName;
	}
	
	// abilityType is now a copy of the abilityType specified in the template:
	abilityType = Object.create(this.abilityTypes[abilityTypeName]);
	
	// We now grab whatever additional properties we need:
	for (key in abilityStats) {
		if (abilityStats.hasOwnProperty(key)) {
			
			if (key === 'range') {
				var range = abilityStats.range;
				abilityType.range = function () {
					return range;
				};
			}
			else {
				abilityType[key] = abilityStats[key];
			}
		}
	}
	
	// Attributes:
	if (abilityType.attributes) {
		let attributes = Object.create(abilityType.attributes);
		
		// Damage (scaled by level):
		if (attributes.damage) {
			let damage = Object.create(attributes.damage);
			
			// Damage Type i.e. LOW, MEDIUM, HIGH etc.
			if (abilityStats && abilityStats.damageType) {
				
				
				damage.damageType = abilityStats.damageType;
				
				damage.value = function (character) {
					return gs.npcDamage(character.level, this.damageType);
				};
			}
			// Setting damage directly:
			else if (abilityStats && abilityStats.baseDamage) {
				damage.value = function (character) {
					return abilityStats.baseDamage;
				};
			}
			// No Damage:
			else {
				damage.value = function (character) {
					return 0;
				};
			}
			
			attributes.damage = damage;
		}
		
		// Duration (defaults to min):
		if (attributes.duration) {
			let duration = Object.create(attributes.duration);
			duration.value = function (character) {
				return this.base[1];
			};
			attributes.duration = duration;
		}
		
		abilityType.attributes = attributes;
	}

	
	return abilityType;
};


// CREATE_ITEM_ABILITY_TYPE:
// ************************************************************************************************
gs.createItemAbilityType = function (itemType) {
	var abilityType;
	
	if (!this.abilityTypes[itemType.useEffect]) throw 'undefined abilityType: ' + itemType.useEffect;
	
	// abilityType is now a copy of the abilityType specified in the template:
	abilityType = Object.create(this.abilityTypes[itemType.useEffect]);
	
	abilityType.frame = itemType.f;
	abilityType.mana = 0;
	abilityType.name = itemType.name;
	abilityType.niceName = itemType.niceName;
	abilityType.itemType = itemType;
	
	// Attributes:
	if (abilityType.attributes) {
		let attributes = Object.create(abilityType.attributes);
		
		// Damage (scaled by level):
		if (attributes.damage) {
			let damage = Object.create(attributes.damage);
			
			damage.value = function (character) {
				return Math.ceil(this.base[1] + this.base[1] * (character.level - 1) * ITEM_ABILITY_MULTIPLIER_PER_LEVEL);
			};
			
			attributes.damage = damage;
		}

		// Duration (scaled by level):
		if (attributes.duration) {
			let duration = Object.create(attributes.duration);
			
			duration.value = function (character) {
				return Math.ceil(this.base[1] + this.base[1] * (character.level - 1) * ITEM_ABILITY_MULTIPLIER_PER_LEVEL);
			};
			
			attributes.duration = duration;
		}

		// Aoe Range (set to max):
		if (attributes.aoeRange) {
			let aoeRange = Object.create(attributes.aoeRange);
			
			aoeRange.value = function (character) {
				return this.base[this.base.length - 1];
			};
			
			attributes.aoeRange = aoeRange;
		}
		
		// maxPath (set to max):
		if (attributes.maxPath) {
			let maxPath = Object.create(attributes.maxPath);
			
			maxPath.value = function (character) {
				return this.base[this.base.length - 1];
			};
			
			attributes.maxPath = maxPath;
		}
		
		abilityType.attributes = attributes;
	}
	
	
	
	
	// If New ability (i.e. charm) need to add it to list:
	if (!gs.abilityTypes.hasOwnProperty(abilityType.name)) {
		gs.abilityTypes[abilityType.name] = abilityType;
	}
	
	return abilityType;
};


// ABILITY_DESC:
// ************************************************************************************************
gs.abilityDesc = function (ability, item) {
	var str = '', charm;
	
	// Need to know if the desc is refering to an ability, on the abilityBar that is generated by a charm.
	// If this is so, then we get a reference to the actual charm item that is generating the ability.
	if (ability.type.itemType && ability.type.itemType.slot === 'charm' && !item) {
		charm = gs.pc.inventory.getCharm();
	}
	
	// Ability Name:
	if (!item) {
		// Name of Charm:
		if (charm) {
			str += charm.toShortDesc() + '\n';
		}
		else {	
			str += translator.getText(ability.type.niceName) + '\n';
		}
	}
	
	// Sustained:
	if (ability.type.isSustained) {
		str += '持续效果' + '\n';
	}
	
	// Mana:
	if (ability.type.mana) {
		str += '消耗法力值: ' + gs.pc.manaCost(ability.type) + '\n';
	}
	
	// Hit Points:
	if (ability.type.hitPointCost) {
		str += '消耗生命值: ' + ability.type.hitPointCost + '\n';
	}
	
	// Cool Down:
	if (ability.type.coolDown) {
		str += '冷却: ' + ability.type.coolDown + '\n';
	}
	
	// Charges on Charm:
	if (charm) {
		str += '蓄力: ' + charm.charges + '/' + charm.getModdedStat('maxCharges');
		
		// Showing recharge:
		if (charm.charges < charm.getModdedStat('maxCharges')) {
			str += ' [' + charm.chargeTimer + '/' + charm.type.chargeTime + ']\n';
		}
		else {
			str += '\n';
		}
	}
	
	// Attributes:
	if (ability.type.attributes) {
		this.forEachType(ability.type.attributes, function (attribute) {
			str += translator.getText(attribute.name) + ': ';

			// Wands and Charm attributes (just show the final modified stat):
			if (item || charm) {
				str += attribute.value(gs.pc) + '\n';
			}
			// Modified attribute:
			else if (attribute.base[gs.pc.getTalentLevel(ability.type.name)] !== attribute.value(gs.pc)) {
				str += attribute.base[gs.pc.getTalentLevel(ability.type.name)] + ' [' + attribute.value(gs.pc) + ']\n';
			}
			// Unmodified attribute:
			else {
				str += attribute.base[gs.pc.getTalentLevel(ability.type.name)] +'\n';
			}
		}, this);
	}
	
	// Ability Desc:
	if (typeof ability.type.desc === 'function') {
		str += ability.type.desc();
	}
	else {	
		str += ability.type.desc;
	}
	
	return str;
};

// CREATE_ABILITY_TYPES:
// ********************************************************************************************
gs.createAbilityTypes = function () {
	this.abilityTypes = {};
	
	this.createAbilityHelpers();
	this.createPlayerAbilityTypes();
	this.createNPCAbilityTypes();
	this.createNPCOnDeathTypes();
	
	this.setAbilityStats();
};