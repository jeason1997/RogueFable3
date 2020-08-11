/*global gs*/
/*global FACTION*/
/*jshint esversion: 6*/
'use strict';

// STATUS_EFFECTS:
// Added to characters to maintain and manage their list of status effects
// ************************************************************************************************
function StatusEffects (character) {
	this.character = character;
	this.list = [];
}

// CLEAR:
// ************************************************************************************************
StatusEffects.prototype.clear = function () {
	this.list.forEach(function (statusEffect) {
		statusEffect.onDestroy(this.character);
	}, this);
	this.list = [];
};

// ON_UPDATE_TURN:
// ************************************************************************************************
StatusEffects.prototype.onUpdateTurn = function () {
	// Tick Duration and Destroy:
	for (let i = this.list.length - 1; i >= 0; i -= 1) {
		// Tick Duration:
		if (!this.list[i].noDuration) {
			this.list[i].duration -= 1;
		}
		
		// Destroy:
		if (this.list[i].duration <= 0 || this.list[i].shouldDestroy(this.character)) {
			this.list[i].onDestroy(this.character);
			this.list.splice(i, 1);
		}
	}
	
	// Apply status effects:
	for (let i = 0; i < this.list.length; i += 1) {
		this.list[i].onUpdateTurn(this.character);
		
		// Immediately halt if character was killed by one of his status effects:
		if (!this.character.isAlive) {
			break;
		}
	}
};


// ON_UPDATE_STATS:
// ************************************************************************************************
StatusEffects.prototype.onUpdateStats = function () {
	this.list.forEach(function (statusEffect) {
		statusEffect.onUpdateStats(this.character);
	}, this);
};

// HAS:
// Returns true if the character has the status effect of type name
// ************************************************************************************************
StatusEffects.prototype.has = function (typeName) {
	return Boolean(this.get(typeName));
};

// GET:
// Returns the status effect with the specified typeName:
// ************************************************************************************************
StatusEffects.prototype.get = function (typeName) {
	return this.list.find(statusEffect => statusEffect.name === typeName);
};

// ADD:
// Adds a status effect
// ************************************************************************************************
StatusEffects.prototype.add = function (typeName, properties, flags = {}) {
	var newStatusEffect;
	
	if (this.character.faction === FACTION.NEUTRAL || this.character.type.damageImmune) {
		return;
	}
	
	// Immune:
	if (gs.inArray(typeName, this.character.type.effectImmune)) {
		this.character.queuePopUpText('Immune', '#ffffff'); 
		return;
	}
	
	newStatusEffect = this.createStatusEffect(typeName, properties);
	
	// Existing status effect:
	if (this.has(newStatusEffect.name) && !newStatusEffect.canStack) {
		let oldStatusEffect = this.get(newStatusEffect.name);
		
		if (newStatusEffect.addDuration) {
			oldStatusEffect.duration += newStatusEffect.duration;
		}
		else {
			oldStatusEffect.duration = newStatusEffect.duration;
		}
	}
	// New status effect:
	else {
		newStatusEffect.onCreate(this.character);
		
		this.list.push(newStatusEffect);
		
		// Pop Up Text:
		if (gs.getTile(this.character.tileIndex).visible && !newStatusEffect.dontPopUpText && !flags.dontPopUpText) {
			this.character.queuePopUpText(gs.capitalSplit(newStatusEffect.name), '#ffffff'); 
		}
	}
	
	if (typeName === 'Immobile') {
		this.remove('Charge');
		this.remove('Sprint');
	}
	
	
	this.character.updateStats();
};

// CREATE_STATUS_EFFECT:
// ************************************************************************************************
StatusEffects.prototype.createStatusEffect = function (typeName, properties = {}) {
	var statusEffect;
	
	if (!gs.statusEffectTypes.hasOwnProperty(typeName)) {
		throw typeName + ' is not a valid statusEffectType';
	}
	
	// Create a copy of the base statusEffectType:
	statusEffect = Object.create(gs.statusEffectTypes[typeName]);
	
	// Property list remembers which properties to save when serializing toData (Always serialize duration):
	statusEffect.propertyList = ['duration'];
	
	for (let key in properties) {
		if (properties.hasOwnProperty(key)) {
			// First copying over the properties to the new statusEffect
			statusEffect[key] = properties[key];
				
			// Recording which properties to serialize:
			statusEffect.propertyList.push(key);
		}
	}
	
	return statusEffect;
};

// REMOVE:
// Removes and destroys all status effect
// ************************************************************************************************
StatusEffects.prototype.remove = function (typeName) {
	var statusEffect;
	
	// Remove from list:
	for (let i = 0; i < this.list.length; i += 1) {
		if (this.list[i].name === typeName) {
			statusEffect = this.list[i];
			this.list.splice(i, 1);
			break;
		}
	}
	
	// Destroy:
	if (statusEffect) {
		statusEffect.onDestroy(this.character);
		this.character.updateStats();
	}
};

// REMOVE_ALL:
// Removes and destroys all status effects
// ************************************************************************************************
StatusEffects.prototype.removeAll = function () {
	this.list.forEach(function (statusEffect) {
		statusEffect.onDestroy(this.character);
	}, this);
	
	this.list = [];
};

// ON_CHANGE_LEVEL:
// Called when the player is zoning to remove status effects that are destroyed on zoning:
// ************************************************************************************************
StatusEffects.prototype.onChangeLevel = function () {
	for (let i = this.list.length - 1; i >= 0; i -= 1) {
		if (this.list[i].destroyOnZoning) {
			this.remove(this.list[i].name);
		}
	}
};

// ON_AGRO_PLAYER:
// ************************************************************************************************
StatusEffects.prototype.onAgroPlayer = function () {
	if (this.has('DeepSleep')) {
		this.remove('DeepSleep');
	}
};

// ON_TELEPORT:
// Called when the character teleports
// ************************************************************************************************
StatusEffects.prototype.onTeleport = function () {
	if (this.has('Sprint')) {
		this.remove('Sprint');
	}
	
	if (this.has('Charge')) {
		this.remove('Charge');
	}
};

// ON_CHANGE_EQUIPMENT:
// Called when the character changes equipment
// ************************************************************************************************
StatusEffects.prototype.onChangeEquipment = function () {
	if (this.has('Deflect') && !this.character.inventory.hasShieldEquipped()) {
		this.remove('Deflect');
	}
};

// ON_END_TURN:
// Called when the character ends his turn
// ************************************************************************************************
StatusEffects.prototype.onEndTurn = function () {
	if (this.has('Charge')) {
		this.remove('Charge');
	}
	
	if (this.has('Sprint')) {
		this.remove('Sprint');
	}
};

// ON_OPEN_DIALOG:
// ************************************************************************************************
StatusEffects.prototype.onOpenDialog = function () {
	if (this.has('Charge')) {
		this.remove('Charge');
	}
	
	if (this.has('Sprint')) {
		this.remove('Sprint');
	}
};

// ON_TAKE_DAMAGE:
// ************************************************************************************************
StatusEffects.prototype.onTakeDamage = function (damageType) {
	if (!this.character.isAlive) {
		return;
	}
	
	// Cold attacks will slow:
	if (damageType === 'Cold' && this.character.resistance.Cold < 1) {
		this.add('Slow', {duration: 5});
	}
	
	// Remove Deep Sleep:
	if (this.has('DeepSleep')) {
		this.remove('DeepSleep');
	}
	
	// Run it backwards in case they want to remove themselves:
	for (let i = this.list.length - 1; i >= 0; i -= 1) {
		this.list[i].onTakeDamage(this.character, damageType);
	}
};

// ON_CURE:
// ************************************************************************************************
StatusEffects.prototype.onCure = function () {
	if (this.has('InfectiousDisease')) {
		this.remove('InfectiousDisease');
	}
	
	if (this.has('Draining')) {
		this.remove('Draining');
	}
};

// ON_MENTAL_CURE:
// ************************************************************************************************
StatusEffects.prototype.onMentalCure = function () {
	// Cure Confusion:
	if (this.has('Confusion')) {
		this.remove('Confusion');
	}
	
	if (this.has('NPCCharm')) {
		this.remove('NPCCharm');
	}
};

// TO_DATA:
// ************************************************************************************************
StatusEffects.prototype.toData = function () {
	var data = [];
	
	this.list.forEach(function (statusEffect) {
		if (!statusEffect.dontSave) {
			data.push(statusEffect.toData());
		}
	}, this);
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
StatusEffects.prototype.loadData = function (data) {
	for (let i = 0; i < data.length; i += 1) {
		this.add(data[i].typeName, data[i].properties, {dontPopUpText: true});
	}
};

// TO_UI_STRING:
// ************************************************************************************************
StatusEffects.prototype.toUIString = function () {
	var str = '';
	
	this.list.forEach(function (statusEffect) {
		str += statusEffect.uiSymbol;
	}, this);
	
	return str;
};