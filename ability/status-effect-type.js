/*global game, gs, console, Phaser, util*/
/*global SCALE_FACTOR*/
/*global RED_BOX_FRAME, RED_SELECT_BOX_FRAME, FACTION*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// STATUS_EFFECT_TYPE:
// Status effect instances are cloned from the generic status effect type.
// Instances then overwrite default properties to set unique damage, duration etc.
// ************************************************************************************************
function StatusEffectType () {
	// Default values
	this.duration = 10; 
	this.addDuration = true;
	this.uiSymbol = '';
	this.desc = '';
}

// ON_CREATE:
// ************************************************************************************************
StatusEffectType.prototype.onCreate = function (character) {
	// Pass
};

// ON_UPDATE_TURN:
// Called when the character updates his global turn.
// character: the character who has the status effect.
// ************************************************************************************************
StatusEffectType.prototype.onUpdateTurn = function (character) {
	// Pass
};

// ON_UPDATE_STATS:
// Called when the player is updating his stats.
// character: the character who has the status effect.
// ************************************************************************************************
StatusEffectType.prototype.onUpdateStats = function (character) {
	// Pass
};

// SHOULD_DESTROY:
// Called when the character updates his global turn and determines if the status effect should be prematurely destroyed.
// ************************************************************************************************
StatusEffectType.prototype.shouldDestroy = function (character) {
	return false; // By default, status effects do not end prematurely
};

// ON_TAKE_DAMAGE:
// Called when the character takes damage
StatusEffectType.prototype.onTakeDamage = function (character, damageType) {
	// Pass
};

// DESTROY:
// Called when the status effect is removed from a character
// Duration ends, character dies, forcibly removed etc.
// character: the character who has the status effect.
// ************************************************************************************************
StatusEffectType.prototype.onDestroy = function (character) {
	// Pass
};


// TO_DATA:
// Serializes the status effect type for saving
// ************************************************************************************************
StatusEffectType.prototype.toData = function () {
	var data = {};
	
	data.typeName = this.name;
	data.properties = {};
	
	// Properties:
	this.propertyList.forEach(function (key) {
		data.properties[key] = this[key];
	}, this);
	
	return data;
};

// TO_SHORT_DESC:
// The short name + duration that shows up on the HUD
// ************************************************************************************************
StatusEffectType.prototype.toShortDesc = function () {
	var str = translator.getText(this.name);
	
	if (this.duration > 1 && !this.noDuration) {
		str += ': ' + this.duration;
	}
	
	return str;
};

// TO_LONG_DESC:
// Fills the players chat box when mousing over the status effect.
// ************************************************************************************************
StatusEffectType.prototype.toLongDesc = function () {
	var str = translator.getText(this.name) + ':\n';
	
	if (this.duration > 1 && !this.noDuration) {
		str += '持续回合: ' + this.duration + '\n';
	}
	
	str += this.desc;
			
	return str;
};


// CREATE_STATUS_EFFECT_TYPES:
// ************************************************************************************************
gs.createStatusEffectTypes = function () {
	this.statusEffectTypes = {};
	
	// HIDE_IN_SHELL:
	// ********************************************************************************************
	this.statusEffectTypes.HideInShell = new StatusEffectType();
	this.statusEffectTypes.HideInShell.noDuration = true;	
	this.statusEffectTypes.HideInShell.onUpdateStats = function (character) {
		character.protection += 10;
		character.isImmobile += 1;
	};
	this.statusEffectTypes.HideInShell.shouldDestroy = function (character) {
		var nearestHostile = character.getNearestHostile();
		return !nearestHostile || util.distance(character.tileIndex, nearestHostile.tileIndex) > 1.5;
	};
	
	// NPC_CHARM:
	// Cast by NPCs on the player, stops the player from moving away from the NPC.
	// ********************************************************************************************
	this.statusEffectTypes.NPCCharm = new StatusEffectType();
	this.statusEffectTypes.NPCCharm.duration = 10;
	this.statusEffectTypes.NPCCharm.destroyOnZoning = true;
	this.statusEffectTypes.NPCCharm.desc = 'You are unable to move away from the creature that has charmed you.';
	this.statusEffectTypes.NPCCharm.dontSave = true;
	
	
	// CHARM:
	// Cast by player on NPCs, converts the NPC to the players faction.
	// ********************************************************************************************
	this.statusEffectTypes.Charm = new StatusEffectType();
	this.statusEffectTypes.Charm.duration = 10;
	this.statusEffectTypes.Charm.onDestroy = function (character) {
		character.faction = FACTION.HOSTILE;
	};
	
	// DRAINING:
	// ********************************************************************************************
	this.statusEffectTypes.Draining = new StatusEffectType();
	this.statusEffectTypes.Draining.duration = 50;
	this.statusEffectTypes.Draining.addDuration = true;
	
	// DEEP_SLEEP:
	// ********************************************************************************************
	this.statusEffectTypes.DeepSleep = new StatusEffectType();
	this.statusEffectTypes.DeepSleep.duration = 20;
	this.statusEffectTypes.DeepSleep.onUpdateStats = function (character) {
		character.isAsleep = true;
	};
	this.statusEffectTypes.DeepSleep.neverOnPlayer = true;
	
	// SLOW_CHARGE:
	// ********************************************************************************************
	this.statusEffectTypes.SlowCharge = new StatusEffectType();
	this.statusEffectTypes.SlowCharge.noDuration = true;
	this.statusEffectTypes.SlowCharge.onUpdateStats = function (character) {
		character.isSlowProjectile += 1;
		character.bonusMovementSpeed += 2;
		character.knockBackOnHit += 2;
	};
	
	// WET:
	// ********************************************************************************************
	this.statusEffectTypes.Wet = new StatusEffectType();
	this.statusEffectTypes.Wet.onUpdateStats = function (character) {
		character.isWet = true;
	};
	this.statusEffectTypes.Wet.onUpdateTurn = function (character) {
		if (gs.zoneType().isCold) {
			character.coldTimer += 2;
		}
	};
	this.statusEffectTypes.Wet.noDuration = true;
	this.statusEffectTypes.Wet.dontPopUpText = true;
	this.statusEffectTypes.Wet.desc = '你受到的火属性伤害减半，同时电属性伤害增倍。';
	
	// FLAMMABLE:
	// ********************************************************************************************
	this.statusEffectTypes.Flammable = new StatusEffectType();
	this.statusEffectTypes.Flammable.onUpdateStats = function (character) {
		character.isFlammable = true;
	};
	this.statusEffectTypes.Flammable.noDuration = true;
	this.statusEffectTypes.Flammable.addDuration = false;
	this.statusEffectTypes.Flammable.dontPopUpText = true;
	this.statusEffectTypes.Flammable.desc = 'You will take double damage from all fire attacks.';
	
	// UNSTABLE:
	// ********************************************************************************************
	this.statusEffectTypes.Unstable = new StatusEffectType();
	this.statusEffectTypes.Unstable.onUpdateStats = function (character) {
		character.isUnstable += 1;
	};
	this.statusEffectTypes.Unstable.noDuration = true;
	this.statusEffectTypes.Unstable.addDuration = false;
	this.statusEffectTypes.Unstable.dontPopUpText = true;
	this.statusEffectTypes.Unstable.desc = '你不稳定的立足点会导致你受到所有\n物理攻击的致命一击。';
	
	// IMMOBILE:
	// ********************************************************************************************
	this.statusEffectTypes.Immobile = new StatusEffectType();
	this.statusEffectTypes.Immobile.onUpdateStats = function (character) {
		character.isUnstable += 1;
		character.isImmobile += 1;
	};
	this.statusEffectTypes.Immobile.duration = 5;
	this.statusEffectTypes.Immobile.addDuration = false;
	this.statusEffectTypes.Immobile.desc = 'You are unable to move ad will be critically hit by all physical attacks.';
	
	// CONSTRICTING:
	// When a character constricts another character, he adds this status effect to himself to prevent himself from moving
	// ********************************************************************************************
	this.statusEffectTypes.Constricting = new StatusEffectType();
	this.statusEffectTypes.Constricting.duration = 5;
	this.statusEffectTypes.Constricting.addDuration = false;
	this.statusEffectTypes.Constricting.dontPopUpText = true;
	this.statusEffectTypes.Constricting.onUpdateStats = function (character) {
		character.isImmobile += 1;
	};
	this.statusEffectTypes.Constricting.shouldDestroy = function (character) {
		var targetChar = gs.getCharWithID(this.targetCharId);
		return !targetChar || util.distance(character.tileIndex, targetChar.tileIndex) > 1.5; 
	};
	this.statusEffectTypes.Constricting.onDestroy = function (character) {
		var targetChar = gs.getCharWithID(this.targetCharId);
		
		if (targetChar) {
			targetChar.statusEffects.remove('Constricted');
		}
	};
	
	// CONSTRICTED:
	// ********************************************************************************************
	this.statusEffectTypes.Constricted = new StatusEffectType();
	this.statusEffectTypes.Constricted.duration = 5;
	this.statusEffectTypes.Constricted.addDuration = true;
	this.statusEffectTypes.Constricted.onUpdateStats = function (character) {
		character.isImmobile += 1;
		character.isUnstable += 1;
	};
	this.statusEffectTypes.Constricted.shouldDestroy = function (character) {
		var constrictingChar = gs.getCharWithID(this.constrictingCharId);
		return !constrictingChar || util.distance(character.tileIndex, constrictingChar.tileIndex) > 1.5; 
	};
	this.statusEffectTypes.Constricted.onDestroy = function (character) {
		var constrictingChar = gs.getCharWithID(this.constrictingCharId);
		
		if (constrictingChar) {
			constrictingChar.statusEffects.remove('Constricting');
		}
	};
	
	// FEARED:
	// ********************************************************************************************
	this.statusEffectTypes.Feared = new StatusEffectType();
	this.statusEffectTypes.Feared.duration = 10;
	this.statusEffectTypes.Feared.addDuration = true;
	this.statusEffectTypes.Feared.onCreate = function (character) {
		character.isRunning = true;
	};
	this.statusEffectTypes.Feared.onDestroy = function (character) {
		character.isRunning = false;
	};
	
	
	
	
	
	
	// EXPERIENCE_BOOST:
	// ********************************************************************************************
	this.statusEffectTypes.ExperienceBoost = new StatusEffectType();
	this.statusEffectTypes.ExperienceBoost.onUpdateStats = function (character) {
			character.bonusExpMod += 1.0;
	};
	this.statusEffectTypes.ExperienceBoost.duration = 100;
	this.statusEffectTypes.ExperienceBoost.addDuration = true;
	this.statusEffectTypes.ExperienceBoost.desc = 'Doubles the experience you gain from killing enemies.';
	
	// STUNNED:
	// ********************************************************************************************
	this.statusEffectTypes.Stunned = new StatusEffectType();
	this.statusEffectTypes.Stunned.onUpdateStats = function (character) {
			character.isStunned += 1;
	};
	this.statusEffectTypes.Stunned.duration = 3;
	this.statusEffectTypes.Stunned.addDuration = true;
	
	// FROZEN:
	this.statusEffectTypes.Frozen = new StatusEffectType();
	this.statusEffectTypes.Frozen.onUpdateStats = function (character) {
		character.isImmobile += 1;
		character.isStunned += 1;
	};
	this.statusEffectTypes.Frozen.addDuration = false;
	
	// NETTED:
	// ********************************************************************************************
	this.statusEffectTypes.Netted = new StatusEffectType();
	this.statusEffectTypes.Netted.duration = 3;
	this.statusEffectTypes.Netted.addDuration = false;
	this.statusEffectTypes.Netted.destroyOnZoning = true;
	this.statusEffectTypes.Netted.onUpdateStats = function (character) {
		character.isUnstable += 1;
		character.isImmobile += 1;
	};
	this.statusEffectTypes.Netted.onCreate = function (character) {
		var pos = util.toPosition(character.tileIndex);
		this.sprite = gs.createSprite(pos.x, pos.y, 'Tileset', gs.projectileSpritesGroup);
		this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
    	this.sprite.anchor.setTo(0.5, 0.5);
    	this.sprite.frame = gs.projectileTypes.Net.frame;
	};
	this.statusEffectTypes.Netted.onDestroy = function (character) {
		this.sprite.destroy();	
	};
	this.statusEffectTypes.Netted.onTakeDamage = function (character, damageType) {
		if (util.frac() <= 0.5 || damageType === 'Fire') {
			character.statusEffects.remove(this.name);
		}
	};
	
	
	// WEBBED:
	// ********************************************************************************************
	this.statusEffectTypes.Webbed = new StatusEffectType();
	this.statusEffectTypes.Webbed.duration = 3;
	this.statusEffectTypes.Webbed.addDuration = false;
	this.statusEffectTypes.Webbed.destroyOnZoning = true;
	this.statusEffectTypes.Webbed.onUpdateStats = function (character) {
		character.isUnstable += 1;
		character.isImmobile += 1;
	};
	this.statusEffectTypes.Webbed.onCreate = function (character) {
		var pos = util.toPosition(character.tileIndex);
	
		this.sprite = gs.createSprite(pos.x, pos.y, 'Tileset', gs.projectileSpritesGroup);
		this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
    	this.sprite.anchor.setTo(0.5, 0.5);
    	this.sprite.frame = gs.projectileTypes.SpiderWeb.frame;
		
		// Remember the tileIndex in which the character was webbed so can remove:
		this.tileIndex = {x: character.tileIndex.x, y: character.tileIndex.y};
	};
	this.statusEffectTypes.Webbed.shouldDestroy = function (character) {
		return !gs.vectorEqual(character.tileIndex, this.tileIndex);
	};
	this.statusEffectTypes.Webbed.onDestroy = function (character) {
		this.sprite.destroy();	
	};
	this.statusEffectTypes.Webbed.onTakeDamage = function (character, damageType) {
		if (util.frac() <= 0.5 || damageType === 'Fire') {
			character.statusEffects.remove(this.name);
		}
	};
	
	
	// SLOW:
	// ********************************************************************************************
	this.statusEffectTypes.Slow = new StatusEffectType();
	this.statusEffectTypes.Slow.onUpdateStats = function (character) {
		character.bonusMovementSpeed -= 1;
	};
	this.statusEffectTypes.Slow.duration = 5;
	this.statusEffectTypes.Slow.addDuration = false;
	
	
	// HEALING:
	// ********************************************************************************************
	this.statusEffectTypes.Healing = new StatusEffectType();
	this.statusEffectTypes.Healing.duration = 10;
	this.statusEffectTypes.Healing.onUpdateTurn = function (character) {
		character.healHp(character.maxHp / 10);
	};
	this.statusEffectTypes.Healing.addDuration = true;
	
	// MARKED:
	// ********************************************************************************************
	this.statusEffectTypes.Marked = new StatusEffectType();
	this.statusEffectTypes.Marked.onUpdateStats = function (character) {
			character.isMarked += 1;
	};
	this.statusEffectTypes.Marked.duration = 10;
	this.statusEffectTypes.Marked.addDuration = false;
	this.statusEffectTypes.Marked.desc = 'You have been magically marked causing all creatures to track you.';
	

	// SNEAK:
	// ********************************************************************************************
	this.statusEffectTypes.Sneak = new StatusEffectType();
	this.statusEffectTypes.Sneak.onUpdateStats = function (character) {
			character.stealth += 10;
	};
	this.statusEffectTypes.Sneak.duration = 20;
	this.statusEffectTypes.Sneak.addDuration = true;
	
	// DEAD_EYE:
	// ********************************************************************************************
	this.statusEffectTypes.DeadEye = new StatusEffectType();
	this.statusEffectTypes.DeadEye.onUpdateStats = function (character) {
			character.alwaysProjectileCrit += 1;
	};
	this.statusEffectTypes.DeadEye.duration = 10;
	this.statusEffectTypes.DeadEye.addDuration = true;
	
	// CHARGE:
	// ********************************************************************************************
	this.statusEffectTypes.Charge = new StatusEffectType();
	this.statusEffectTypes.Charge.destroyOnZoning = true;
	this.statusEffectTypes.Charge.onUpdateStats = function (character) {
		character.isMultiMoving += 1;
		character.meleePower += 20;
	};
	this.statusEffectTypes.Charge.duration = 1;
	this.statusEffectTypes.Charge.addDuration = true;
	this.statusEffectTypes.Charge.dontPopUpText = true;
	this.statusEffectTypes.Charge.dontShowOnHUD = true;
	this.statusEffectTypes.Charge.dontSave = true;
	
	// SPRINT:
	// ********************************************************************************************
	this.statusEffectTypes.Sprint = new StatusEffectType();
	this.statusEffectTypes.Sprint.destroyOnZoning = true;
	this.statusEffectTypes.Sprint.onUpdateStats = function (character) {
		character.isMultiMoving += 1;
	};
	
	this.statusEffectTypes.Sprint.duration = 1;
	this.statusEffectTypes.Sprint.addDuration = true;
	this.statusEffectTypes.Sprint.dontPopUpText = true;
	this.statusEffectTypes.Sprint.dontShowOnHUD = true;
	this.statusEffectTypes.Sprint.dontSave = true;
	
	// BERSERK:
	// ********************************************************************************************
	this.statusEffectTypes.Berserk = new StatusEffectType();
	this.statusEffectTypes.Berserk.onUpdateStats = function (character) {
		character.alwaysCrit += 1;
		character.knockBackOnHit += 1;
	};
	
	this.statusEffectTypes.Berserk.duration = 10;
	this.statusEffectTypes.Berserk.addDuration = true;
	
	// LIFE_SPIKE:
	// ********************************************************************************************
	this.statusEffectTypes.LifeSpike = new StatusEffectType();
	this.statusEffectTypes.LifeSpike.duration = 8;
	this.statusEffectTypes.LifeSpike.damage = 2;
	this.statusEffectTypes.LifeSpike.onUpdateTurn = function (character) {
		var amount, actingChar;
		
		actingChar = gs.getCharWithID(this.actingCharId);
		
		amount = character.takeDamage(this.damage, 'Toxic', {killer: actingChar, neverCrit: true});
		
		if (actingChar && actingChar.isAlive) {
			actingChar.healHp(Math.ceil(amount / 2));
		}
	};
	this.statusEffectTypes.LifeSpike.addDuration = false;
	this.statusEffectTypes.LifeSpike.canStack = true;
	
	// STRONG_POISON:
	// ********************************************************************************************
	this.statusEffectTypes.StrongPoison = new StatusEffectType();
	this.statusEffectTypes.StrongPoison.duration = 5; // Remember this will be 4 ticks
	this.statusEffectTypes.StrongPoison.onUpdateTurn = function (character) {
		character.takeDamage(this.damage, 'Toxic', {neverCrit: true});
	};
	this.statusEffectTypes.StrongPoison.addDuration = false;
	this.statusEffectTypes.StrongPoison.dontPopUpText = true;
	
	
	// RESISTANCE:
	// ********************************************************************************************
	this.statusEffectTypes.Resistance = new StatusEffectType();
	this.statusEffectTypes.Resistance.onUpdateStats = function (character) {
		character.resistance.Fire += 1;
		character.resistance.Cold += 1;
		character.resistance.Shock += 1;
		character.resistance.Toxic += 1;
		character.protection += 4;
	};
	this.statusEffectTypes.Resistance.duration = 50;
	this.statusEffectTypes.Resistance.addDuration = true;
	
	// BLESS:
	// ********************************************************************************************
	this.statusEffectTypes.Bless = new StatusEffectType();
	this.statusEffectTypes.Bless.onUpdateStats = function (character) {
		character.resistance.Fire += 1;
		character.resistance.Cold += 1;
		character.resistance.Shock += 1;
		character.resistance.Toxic += 1;
		character.protection += 2;
		character.meleePower += 5;
		character.spellPower += 5;
		character.rangePower += 5;
	};
	this.statusEffectTypes.Bless.duration = 100;
	this.statusEffectTypes.Bless.addDuration = true;
	
	// POWER:
	// ********************************************************************************************
	this.statusEffectTypes.Power = new StatusEffectType();
	this.statusEffectTypes.Power.onUpdateStats = function (character) {
		character.meleePower += 20;
		character.spellPower += 20;
		character.rangePower += 20;
	};
	this.statusEffectTypes.Power.duration = 20;
	this.statusEffectTypes.Power.addDuration = true;
	
	// LEVITATION:
	// ********************************************************************************************
	this.statusEffectTypes.Levitation = new StatusEffectType();
	this.statusEffectTypes.Levitation.onUpdateStats = function (character) {
		character.isFlying += 1;
	};
	this.statusEffectTypes.Levitation.duration = 50;
	this.statusEffectTypes.Levitation.addDuration = true;
	
	// ENERGY_SHROOM_TEA:
	// ********************************************************************************************
	this.statusEffectTypes.EnergyShroomTea = new StatusEffectType();
	this.statusEffectTypes.EnergyShroomTea.onUpdateTurn = function (character) {
		if (gs.turn % 5 === 0) {
			character.gainMp(1);
		}	
	};
	this.statusEffectTypes.EnergyShroomTea.duration = 200;
	this.statusEffectTypes.EnergyShroomTea.addDuration = true;
	
	// HASTE:
	// ********************************************************************************************
	this.statusEffectTypes.Haste = new StatusEffectType();
	this.statusEffectTypes.Haste.onUpdateStats = function (character) {
		character.bonusMovementSpeed += 1;
	};
	this.statusEffectTypes.Haste.duration = 20;
	this.statusEffectTypes.Haste.addDuration = true;
	
	// CASTING_SMITE:
	// ********************************************************************************************
	this.statusEffectTypes.CastingSmite = new StatusEffectType();
	this.statusEffectTypes.CastingSmite.onCreate = function (character) {
		var pos = util.toPosition(this.tileIndex);
		this.sprite = gs.createSprite(pos.x, pos.y, 'Tileset', gs.projectileSpritesGroup);
		this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
    	this.sprite.anchor.setTo(0.5, 0.5);
    	this.sprite.frame = RED_SELECT_BOX_FRAME;
	};
	this.statusEffectTypes.CastingSmite.onDestroy = function (character) {
		var targetChar;
		
		// Note that destroyFunc is called when the character dies, as well as when the status effect naturally ends.
		// Only want to cast the smite if the character is still alive
		if (character.isAlive) {
			gs.createParticlePoof(character.tileIndex, 'PURPLE');
		
			targetChar = gs.getChar(this.tileIndex);
			if (targetChar) {
				targetChar.takeDamage(this.damage, 'Physical', {killer: character});
			}
			gs.createSmiteEffect(this.tileIndex);
		}
		
		
		this.sprite.destroy();	
	};
	this.statusEffectTypes.CastingSmite.onUpdateStats = function (character) {
		character.isStunned += 1;
	};
	this.statusEffectTypes.CastingSmite.duration = 2;
	
	// CASTING_FIRE_STORM:
	// ********************************************************************************************
	this.statusEffectTypes.CastingFireStorm = new StatusEffectType();
	this.statusEffectTypes.CastingFireStorm.onCreate = function (character) {
		this.spriteList = [];	
		this.createSprite(this.tileIndex);
		this.skipFirstTurn = true;
		this.size = 0.5;
	};
	
	this.statusEffectTypes.CastingFireStorm.onUpdateTurn = function () {
		if (this.skipFirstTurn) {
			this.skipFirstTurn = false;
			return;
		}
		// Create Fire:
		gs.getIndexInRadius(this.tileIndex, this.size).forEach(function (index) {
			if (gs.isStaticPassable(index)) {
				gs.createFire(index, this.damage);
			}
		}, this);
		
		// Destroy existing sprites:
		this.onDestroy();
		
		if (this.size < 2) {
			this.size += 0.5;
		}
		
		// Move up:
		if (gs.isStaticPassable(this.tileIndex.x + this.delta.x, this.tileIndex.y + this.delta.y)) {
			this.tileIndex = {x: this.tileIndex.x + this.delta.x, y: this.tileIndex.y + this.delta.y};
			this.createSprites(this.tileIndex);
		}
		else {
			this.duration = 0;
		}
	};
	this.statusEffectTypes.CastingFireStorm.createSprites = function (tileIndex) {
		gs.getIndexInRadius(tileIndex, this.size).forEach(function (index) {
			if (gs.isStaticPassable(index)) {
				this.createSprite(index);
			}
		}, this);
	};
	this.statusEffectTypes.CastingFireStorm.createSprite = function (tileIndex) {
		var sprite,
			pos = util.toPosition(tileIndex);
		
		sprite = gs.createSprite(pos.x, pos.y, 'Tileset', gs.projectileSpritesGroup);
		sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
    	sprite.anchor.setTo(0.5, 0.5);
    	sprite.frame = RED_SELECT_BOX_FRAME;
		
		this.spriteList.push(sprite);
	};
	this.statusEffectTypes.CastingFireStorm.onDestroy = function (character) {
		this.spriteList.forEach(function (sprite) {
			sprite.destroy();
		}, this);
	};
	this.statusEffectTypes.CastingFireStorm.onUpdateStats = function (character) {
		character.isStunned += 1;
	};
	this.statusEffectTypes.CastingFireStorm.duration = 10;
	
	// SEAL_DOORS:
	// When an NPC seals doors they add this status effect to themselves to keep the doors sealed
	// The status effect will unseal the doors when it completes (either duration or when the npc is killed)
	// Make sure to set indexList when creating the status effect
	// ********************************************************************************************
	this.statusEffectTypes.SealDoors = new StatusEffectType();
	this.statusEffectTypes.SealDoors.onCreate = function (character) {
		this.spriteList = [];
		
		this.indexList.forEach(function (tileIndex) {
			var sprite;
			
			// Create sprite:
			sprite = gs.createSprite(util.toPosition(tileIndex).x, util.toPosition(tileIndex).y, 'Tileset', gs.projectileSpritesGroup);
			sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
    		sprite.anchor.setTo(0.5, 0.5);
    		sprite.frame = RED_SELECT_BOX_FRAME;
			this.spriteList.push(sprite);
			
			// Seal Doors:
			gs.getObj(tileIndex).seal();
			
		}, this);
		
	};
	this.statusEffectTypes.SealDoors.onDestroy = function (character) {
		// Destroy sprites:
		this.spriteList.forEach(function (sprite) {
			sprite.destroy();
		}, this);
		
		// Unseal doors:
		this.indexList.forEach(function (tileIndex) {
			gs.getObj(tileIndex).isSealed = false;
		}, this);
	};
	this.statusEffectTypes.SealDoors.duration = 20;
	this.statusEffectTypes.SealDoors.dontSave = true;
	
	// SHIELDS_UP:
	// ********************************************************************************************
	this.statusEffectTypes.ShieldsUp = new StatusEffectType();
	this.statusEffectTypes.ShieldsUp.duration = 1;
	this.statusEffectTypes.ShieldsUp.dontPopUpText = true;
	this.statusEffectTypes.ShieldsUp.dontShowOnHUD = true;
	
	// DEFLECT:
	// ********************************************************************************************
	this.statusEffectTypes.Deflect = new StatusEffectType();
	this.statusEffectTypes.Deflect.onUpdateStats = function (character) {
		character.bonusReflection += 10;
	};
	this.statusEffectTypes.Deflect.duration = 5;
	
	// FIRE_ATTUNEMENT:
	// ********************************************************************************************
	this.statusEffectTypes.FireAttunement = new StatusEffectType();
	this.statusEffectTypes.FireAttunement.onUpdateStats = function (character) {
		character.firePower += this.firePower;
		character.manaConservation.Fire += 1;
	};
	this.statusEffectTypes.FireAttunement.duration = 10;
	
	// STORM_ATTUNEMENT:
	// ********************************************************************************************
	this.statusEffectTypes.StormAttunement = new StatusEffectType();
	this.statusEffectTypes.StormAttunement.onUpdateStats = function (character) {
		character.stormPower += this.stormPower;
		character.manaConservation.Storm += 1;
	};
	this.statusEffectTypes.StormAttunement.duration = 10;
	
	// COLD_ATTUNEMENT:
	// ********************************************************************************************
	this.statusEffectTypes.ColdAttunement = new StatusEffectType();
	this.statusEffectTypes.ColdAttunement.onUpdateStats = function (character) {
		character.coldPower += this.coldPower;
		character.manaConservation.Cold += 1;
	};
	this.statusEffectTypes.ColdAttunement.duration = 10;
	
	
	// TOXIC_ATTUNEMENT:
	// ********************************************************************************************
	this.statusEffectTypes.ToxicAttunement = new StatusEffectType();
	this.statusEffectTypes.ToxicAttunement.onUpdateStats = function (character) {
		character.toxicPower += this.toxicPower;
		character.manaConservation.Toxic += 1;
	};
	this.statusEffectTypes.ToxicAttunement.duration = 10;
	
	// CONFUSION:
	// ********************************************************************************************
	this.statusEffectTypes.Confusion = new StatusEffectType();
	this.statusEffectTypes.Confusion.onUpdateStats = function (character) {
		character.isConfused += 1;
	};
	this.statusEffectTypes.Confusion.duration = 10;
	
	// INFECTIOUS_DISEASE:
	// ********************************************************************************************
	this.statusEffectTypes.InfectiousDisease = new StatusEffectType();
	this.statusEffectTypes.InfectiousDisease.onUpdateTurn = function (character) {
		character.takeDamage(this.damage, 'Toxic', {neverCrit: true});
		
		// Spread:
		gs.getIndexListCardinalAdjacent(character.tileIndex).forEach(function (tileIndex) {
			var char = gs.getChar(tileIndex);
			
			if (char && (char.faction === FACTION.PLAYER || char.faction === FACTION.HOSTILE) && !char.statusEffects.has('InfectiousDisease') && !gs.inArray('InfectiousDisease', char.type.effectImmune)) {
				char.statusEffects.add('InfectiousDisease', {damage: this.damage, duration: this.duration});
			}
		}, this);
	};
	this.statusEffectTypes.InfectiousDisease.duration = 15;
	
	// FLAMING_HANDS:
	// ********************************************************************************************
	this.statusEffectTypes.FlamingHands = new StatusEffectType();
	this.statusEffectTypes.FlamingHands.duration = 10;
	
	// UI_SYMBOLS:
	// ********************************************************************************************
	this.statusEffectTypes.Berserk.uiSymbol = 'B';
	this.statusEffectTypes.Slow.uiSymbol = 'S';
	this.statusEffectTypes.Stunned.uiSymbol = 'S';
	this.statusEffectTypes.Haste.uiSymbol = 'H';
	this.statusEffectTypes.Confusion.uiSymbol = 'C';
	this.statusEffectTypes.InfectiousDisease.uiSymbol = 'D';
	
	this.nameTypes(this.statusEffectTypes);
};





