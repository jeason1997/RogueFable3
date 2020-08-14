/*global Phaser, game, gs, console, util*/
/*global SCALE_FACTOR, LARGE_WHITE_FONT, MAX_RAGE*/
/*global Abilities, StatusEffects, CharacterBody, CharacterEventQueue*/
/*global CHARACTER_HEALTH_FONT, CHARACTER_STATUS_FONT, SKILL_NAMES, RESISTANCE_MULTIPLIER*/
/*global MOVE_TIME, CRITICAL_PERCENT, CRIT_MULTIPLIER, TILE_SIZE*/
/*global SPELL_MULTIPLIER_PER_SKILL, RANGE_MULTIPLIER_PER_SKILL, INFERNO_RING_DAMAGE, SAVE_AMMO_PER_SKILL, MAX_DEFENSE*/
/*global PARTICLE_FRAMES, RAGE_POINT_PERCENT, RAGE_DECREASE_TURNS*/
/*global SUMMONED_RING_FRAME, ELITE_RING_FRAME, ALLY_RING_FRAME*/
/*global MOVEMENT_SPEED, FAST_MOVEMENT_SPEED, KNOCK_BACK_SPEED*/
/*global TIME_SCALAR, FACTION, CORRODE_PERCENT, CHARACTER_SIZE, MAX_EVASION_PERCENT, DAMAGE_TYPES, SHOUT_RANGE*/
/*jshint white: true, laxbreak: true, esversion: 6*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function Character() {
	// Cant add any properties here cause theres only one Character shared prototype
}

Character.prototype.createSharedProperties = function () {
	this.isAlive = true;
	this.state = 'WAITING';
	this.waitTime = 0; // The time the character must wait to take next turn
	
	// Attributes:
	this.baseStrength = 10;
	this.baseDexterity = 10;
	this.baseIntelligence = 10;
	
	// Skills:
	this.skills = {};
	SKILL_NAMES.forEach(function (skillName) {
		this.skills[skillName] = 0;
	}, this);
	
	// Components:
	this.abilities = new Abilities(this);
	this.statusEffects = new StatusEffects(this);
	this.body = new CharacterBody(this);
	this.eventQueue = new CharacterEventQueue(this);
	
	// Pop up text:
	this.popUpTimer = 0;
	this.popUpQueue = [];
	
	// Defense:
	this.protection = 0;
	this.resistance = {Fire: 0, Cold: 0, Shock: 0, Toxic: 0};
	
	// Health and Mana:
	this.maxHp = 0;
	this.currentHp = 0;
	this.poisonDamage = 0;
	this.hpRegenTime = 0;
	this.mpRegenTime = 0;
	this.hpRegenTimer = 0;
	this.mpRegenTimer = 0;
	
	// Create sprite:
	this.sprite = gs.createSprite(0, 0, 'Tileset', gs.objectSpritesGroup);
	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.sprite.visible = false;
	
	// Ring Sprite:
	this.ringSprite = gs.createSprite(0, 0, 'Tileset', gs.characterHUDGroup);
	this.ringSprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.ringSprite.anchor.setTo(0.5, 0.5);
	this.ringSprite.visible = false;
	
	// Text:
	this.hpText = gs.createText(0, 0, '', CHARACTER_HEALTH_FONT, gs.characterHUDGroup);
	this.statusText = gs.createText(0, 0, '', CHARACTER_STATUS_FONT, gs.characterHUDGroup);
	gs.centerText(this.statusText);
	this.hpText.visible = false;
	this.statusText.visible = false;
};


// UPDATE_TURN_BASE:
// ************************************************************************************************
Character.prototype.updateTurnBase = function () {
	this.onTurnRegeneration();
	this.statusEffects.onUpdateTurn();
	this.onTurnPoison();
	
	// Take damage from Lava:
	if (gs.getTile(this.tileIndex).type.name === 'Lava' && !this.isFlying && !this.type.isLavaImmune) {
		this.takeDamage(4, 'Fire', {killer: 'Lava', neverCrit: true});
	}
	
	// Take damage from Toxic Waste:
	if (gs.getTile(this.tileIndex).type.name === 'ToxicWaste' && !this.isFlying && !this.type.isToxicWasteImmune) {
		this.takeDamage(4, 'Toxic', {killer: 'ToxicWaste', neverCrit: true});
	}
	
	// Apply Cloud Effects:
	if (gs.getCloud(this.tileIndex) && gs.getCloud(this.tileIndex).characterTurnEffect) {
		gs.getCloud(this.tileIndex).characterTurnEffect(this);
	}
	
	this.updateTerrainEffects();
	
	// Reduce Cooldown:
	this.abilities.updateTurn();

	// ASSERT:
	if (this.isAlive && gs.getChar(this.tileIndex) !== this) {
		console.log(this);
		throw 'Not on tileindex';
	}
};

// ON_TURN_REGENERATION:
// ************************************************************************************************
Character.prototype.onTurnRegeneration = function () {
	// Draining prevents regeneration:
	if (this.statusEffects.has('Draining')) {
		return;
	}
		
	// Gargoyles cannot regen:
	if (this === gs.pc && this.race.name === 'Gargoyle') {
		return;
	}
	
	// Health Regeneration:
	if (!this.type.noRegen) {
		this.hpRegenTimer += 1;
		if (this.hpRegenTimer >= this.hpRegenTime) {
			this.healHp(1);
			this.hpRegenTimer = 0;
		}
	}

	// Mana Regeneration:
	if (this === gs.pc) {
		this.mpRegenTimer += 1;
		if (this.mpRegenTimer >= this.mpRegenTime) {
			this.gainMp(1);
			this.mpRegenTimer = 0;
		}
	}
};

// ON_TURN_POISON:
// ************************************************************************************************
Character.prototype.onTurnPoison = function () {
	var damage;
	
	// Apply poison damage:
	if (this.poisonDamage > 0) {
		damage = Math.min(this.poisonDamage, Math.ceil(this.poisonDamage * 0.25)); // Poison damage will deal at most 5 damage per turn
		
		this.takeDamage(damage, 'Toxic', {killer: 'Poison', neverCrit: true});
		
		this.poisonDamage -= damage;
		this.poisonDamage = Math.max(0, this.poisonDamage);
	}
};


// UPDATE_TERRAIN_EFFECTS:
// ************************************************************************************************
Character.prototype.updateTerrainEffects = function () {
	// Unstable:
	if (this.isTileIndexUnstable(this.tileIndex) && !this.isFlying) {
		this.statusEffects.add('Unstable');
	} 
	else {
		this.statusEffects.remove('Unstable');
	}

	// Wet:
	if (gs.isIndexUncoveredLiquid(this.tileIndex) && gs.getTile(this.tileIndex).type.name === 'Water' && !this.isFlying) {
		this.statusEffects.add('Wet');
	} 
	else {
		this.statusEffects.remove('Wet');
	}

	// Flammable:
	if (gs.getObj(this.tileIndex, 'Oil') && !this.isFlying) {
		this.statusEffects.add('Flammable');
	} 
	else {
		this.statusEffects.remove('Flammable');
	}
};

// UPDATE_FRAME:
// ************************************************************************************************
Character.prototype.updateFrame = function () {
    this.body.onUpdateFrame();
	
	// Update sprite position based on character position and offset:
	this.sprite.x = this.body.position.x + Math.round(this.body.offset.x);
	this.sprite.y = this.body.position.y + Math.round(this.body.offset.y);
	
	// Characters on solid objects (crypt altar):
	if (this.type.name === 'CryptAltar') {
		this.sprite.y += 1;
	}
	
	if (this.light) {
		this.light.sprite.x = this.sprite.x;
		this.light.sprite.y = this.sprite.y;
	}
	
	// Update sprite facing (some characters never face):
	if (this.body.facing === 'RIGHT' || this.type.dontFace) {
		this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	} 
	else {
		this.sprite.scale.setTo(-SCALE_FACTOR, SCALE_FACTOR);
	}

	// Crop sprite if submerged:
	if (gs.isIndexUncoveredLiquid(this.tileIndex) && !this.isFlying) {
		this.sprite.crop(new Phaser.Rectangle(0, 0, TILE_SIZE / 2, TILE_SIZE / 3));
	} 
	else {
		this.sprite.crop(new Phaser.Rectangle(0, 0, TILE_SIZE / 2, TILE_SIZE / 2));
	}
    
	// Hide in shell:
	if (this.statusEffects.has('HideInShell')) {
		this.sprite.frame = this.type.frame + 1;
	}
	else {
		this.sprite.frame = this.type.frame;
	}
	
	// Multi-moving particle trail:
	if ((this.isMultiMoving || this.body.isKnockBack) && gs.gameTime() % 2 === 0) {
		gs.createParticle(this.sprite.position, {frame: PARTICLE_FRAMES.WHITE, duration: 30, fadePct: 0.5});
	}
		
	// Set sprite visibility based on visibility of tile (Player is always visible):
	// Must test if gs.pc exists to know if we are in a randomMap i.e menu screen
	if (gs.pc) {
		this.setVisible(this.isAlive && gs.pc.canSeeCharacter(this) || this === gs.pc);
	}
	// Random maps:
	else {
		this.setVisible(true);
	}
	
	// Non-hostile mobs hide their interface sprites:
	if (this.faction === FACTION.NEUTRAL || this.faction === FACTION.DESTRUCTABLE) {
		this.hpText.visible = false;
		this.statusText.visible = false;
		this.ringSprite.visible = false;
	}
	
	this.updateUIFrame();
	this.processPopUpText();
	this.eventQueue.updateFrame();
};




// UPDATE_UI_FRAME:
// ************************************************************************************************
Character.prototype.updateUIFrame = function () {
	// Set Status:
	if (this.isHidden) {
		this.status = 'H';
	}
	else if (this.isAsleep) {
		this.status = 'ZZZ';
	} 
	else if (!this.isAgroed && this !== gs.pc) {
		this.status = '?';
	} 
	else if (this.isRunning) {
		this.status = '!';
	}
	else if (this !== gs.pc) {
		this.status = this.statusEffects.toUIString();
	}
	else {
		this.status = '';
	}
	
	// Text:
	if (this.hpText.visible) {
		this.hpText.setText(this.currentHp);
		this.statusText.setText(this.status);
	}
	
	// Position HP Text:
	this.hpText.x = this.body.position.x - 24;
	this.hpText.y = this.body.position.y + 4;
	

	// Position Status Text:
	this.statusText.x = this.body.position.x;
	this.statusText.y = this.body.position.y - 24;

	// Position elite sprite:
	this.ringSprite.x = this.body.position.x;
	this.ringSprite.y = this.body.position.y;
	
	// Set ring sprite:
	if (this.npcClassType || this.type.isUnique) {
		this.ringSprite.frame = ELITE_RING_FRAME;
	}
	else if (this.faction === FACTION.PLAYER && this !== gs.pc) {
		this.ringSprite.frame = ALLY_RING_FRAME;
	}
	else if (this.summonerID) {
		this.ringSprite.frame = SUMMONED_RING_FRAME;
	}
	else {
		this.ringSprite.frame = 0;
	}
};

// SET_VISIBLE:
// ************************************************************************************************
Character.prototype.setVisible = function (bool) {
	this.sprite.visible = bool;
	this.hpText.visible = bool;
	this.statusText.visible = bool;
	this.ringSprite.visible = bool;
	
	if (this.light) {
		this.light.sprite.visible = bool;
	}
	
	if (!this.ringSprite.frame) {
		this.ringSprite.visible = false;
	}
};


// ON_ENTER_TILE:
// Called once the character has actually finished moving and entered the tile
// Note that his tileIndex is already correct as it was set when beginning the move
// ************************************************************************************************
Character.prototype.onEnterTileBase = function () {
	
	// Fall down pit:
	if (gs.isPit(this.tileIndex) && !this.isFlying) {
		this.fallDownPit();
	}
	
	// Step on object if it exists:
	if (gs.getObj(this.tileIndex)) {
		gs.getObj(this.tileIndex).stepOn(this);
	}
	
	// Enter Effect:
	if (gs.getCloud(this.tileIndex)) {
		gs.getCloud(this.tileIndex).stepOn(this);
	}
	
	this.updateTerrainEffects();
};

// IS_TILE_INDEX_UNSTABLE:
// Is the tileIndex unstable, for the character calling the function:
// ************************************************************************************************
Character.prototype.isTileIndexUnstable = function (tileIndex) {
	// Unstable Objects:
	if (gs.getObj(this.tileIndex, obj => obj.type.hasOwnProperty('isUnstable') && this.size <= obj.type.isUnstable)
			&& !this.type.isUnstableImmune // Spiders
			&& !this.isFlying) {
		return true;
	}
	
	// Liquid:
	if (gs.isIndexUncoveredLiquid(this.tileIndex) && !this.isFlying && !this.type.isAquatic) {
		return true;
	}
	
	return false;
};

// HEAL_HP:
// ************************************************************************************************
Character.prototype.healHp = function (amount) {
	this.currentHp += amount;
	this.currentHp = Math.min(this.currentHp, this.maxHp);
};

// CURE:
// Called from healing effects to cure poison, infection etc.
// ************************************************************************************************
Character.prototype.cure = function () {
	this.poisonDamage = 0;
	this.statusEffects.onCure();
	
};

// MENTAL_CURE:
// ************************************************************************************************
Character.prototype.mentalCure = function () {
	this.statusEffects.onMentalCure();
};

// GAIN_MP:
// ************************************************************************************************
Character.prototype.gainMp = function (amount) {
	this.currentMp += amount;
	this.currentMp = Math.min(this.currentMp, this.maxMp);
};

// LOSE_MP:
// ************************************************************************************************
Character.prototype.loseMp = function (amount) {
	this.currentMp -= amount;
	this.currentMp = Math.max(0, this.currentMp);
};

// RESET_ALL_COOLDOWNS:
// ************************************************************************************************
Character.prototype.resetAllCoolDowns = function () {
	this.abilities.resetAllCoolDowns();
};

// HAS_COOL_DOWN:
// ************************************************************************************************
Character.prototype.hasCoolDown = function () {
	return this.abilities.hasCoolDown();
};

// POP_UP_TEXT:
// ************************************************************************************************
Character.prototype.popUpText = function (text, color) {
	gs.createPopUpText(this.tileIndex, text, color);
};

// QUEUE_POP_UP_TEXT:
// ************************************************************************************************
Character.prototype.queuePopUpText = function (text, color) {
	this.popUpQueue.unshift({text: text, color: color});
	this.processPopUpText();
};

// PROCESS_POP_UP_TEXT:
// ************************************************************************************************
Character.prototype.processPopUpText = function () {
	var element, pos;

	
	if (this.popUpQueue.length > 0 && this.popUpTimer === 0) {
		element = this.popUpQueue.pop();
		pos = this.body.position;
		
		// Pop prev text higher:
		if (this.lastPopUpText && this.lastPopUpText.isAlive) {
			this.lastPopUpText.y -= 8;
			gs.initPopUpText(this.lastPopUpText, 80);
		}
		
		this.lastPopUpText = gs.createPopUpTextAtPos(pos.x, pos.y - 12, element.text, element.color);
		this.popUpTimer = 10;
	}
	
	if (this.popUpTimer > 0) {
		this.popUpTimer -= 1;
	}
};

// ADD_POISON_DAMAGE:
// ************************************************************************************************
Character.prototype.addPoisonDamage = function (amount) {
	this.queuePopUpText('Poisoned!', '#ff0000');
	this.poisonDamage += amount;
	this.poisonDamage = Math.min(this.poisonDamage, this.maxHp);
};

// TAKE_DAMAGE:
// Flags: isCrit, neverCrit, isSpecialAttack
// ************************************************************************************************
Character.prototype.takeDamage = function (amount, damageType, flags = {}) {
	var isCrit = false,
		critMultiplier;
	
	this.updateStats();
	
	if (this.type.damageImmune) {
		return 0;
	}
	
	if (flags.killer === gs.pc) {
		critMultiplier = gs.pc.critMultiplier;
	}
	else {
		critMultiplier = CRIT_MULTIPLIER;
	}
	
    // Reduce fire damage when wet:
	if (damageType === 'Fire' && this.isWet) {
		amount = Math.ceil(amount * 0.5);
	}
	
	// Flammable Crit:
	if (damageType === 'Fire' && this.isFlammable) {
		amount = Math.round(amount * critMultiplier);
		isCrit = true;
	}
	
	// Wet Shock:
    if (damageType === 'Shock' && this.isWet) {
		amount = Math.round(amount * critMultiplier);
		isCrit = true;
    }
    
	// Unstable Crit:
	if (damageType === 'Physical' && this.isUnstable) {
		amount = Math.round(amount * critMultiplier);
		isCrit = true;
	}
	
	// Any attacker can force a crit hit:
	if (flags.isCrit) {
		amount = Math.round(amount * critMultiplier);
		isCrit = true;
	}
	// Random Critical Hit:
	// Only NPCs can be critically hit by the player randomly
	else if (this !== gs.pc && (game.rnd.frac() <= CRITICAL_PERCENT || flags.isCrit) && !flags.neverCrit) {
		amount = Math.round(amount * critMultiplier);
		isCrit = true;
	}
	
	// Random damage roll for non-crits:
	// Critical hits and 'None' damageType are always max damage
	if (!isCrit && damageType !== 'None') {
		// Special Attacks deal max damage:
		if (flags.isSpecialAttack) {
			amount = amount;
		}
		// Physical is 1->amount (weighted to center)
		else if (damageType === 'Physical') {
			amount = Math.ceil((util.randInt(1, amount) + util.randInt(1, amount)) / 2);
		}
		// Non-physical is amount / 2 -> amount
		else {
			amount = Math.floor(amount / 2) + util.randInt(1, Math.ceil(amount / 2));
		}
	}
	
    // Defense mitigates damage:
	amount = this.mitigateDamage(amount, damageType);
	
	// Pop Up Text:
	if (isCrit) {
		this.queuePopUpText('Crit -' + amount, '#ff0000');
		if (!this.type.noBlood) {
			this.bloodSplatter();
		}
	} 
	else {
		this.queuePopUpText('-' + amount, '#ff0000');
		
	}

    // Cap damage to currentHp (for lifetaps):
	amount = Math.min(amount, this.currentHp);

    // Apply damage:
	if (!(this === gs.pc && gs.debugProperties.noDamage)) {
		this.currentHp -= amount;
	}
	
    // Hit Sound:
	if (this.currentHp > 0) {
		gs.playSound(gs.sounds.playerHit, this.tileIndex);
	}
	
    // Death:
	if (this.currentHp <= 0) {
		if (flags.killer && flags.killer.onKill) {
			flags.killer.onKill(this);
		}
		this.death(damageType, flags);
	}
    
    this.onTakeDamage();
	this.statusEffects.onTakeDamage(damageType);

	
	return amount;
};

// BLOOD_SPLATTER:
// When a critical hit lands we splatter some blood randomly
// ************************************************************************************************
Character.prototype.bloodSplatter = function () {
	var indexList = gs.getIndexInRadius(this.tileIndex, 1.5);
	indexList = indexList.filter(index => gs.getTile(index).type.passable && !gs.isPit(index));
	indexList = indexList.filter(index => !gs.getObj(index));
	
	if (indexList.length > 0) {
		gs.createObject(util.randElem(indexList), this.type.bloodTypeName);
	}
};

// IS_HOSTILE_TO_ME:
// ************************************************************************************************
Character.prototype.isHostileToMe = function (character) {
	if (character === this) {
		return false;
	}
	else if (this.isConfused && character.faction !== FACTION.NEUTRAL && character.faction !== FACTION.DESTRUCTABLE) {
		return true;
	}
	else if (this.faction === FACTION.PLAYER && character.faction === FACTION.HOSTILE) {
		return true;
	}
	else if (this.faction === FACTION.HOSTILE && character.faction === FACTION.PLAYER) {
		return true;
	}
	else {
		return false;
	}
};

// CAN_SEE_CHARACTER:
// ************************************************************************************************
Character.prototype.canSeeCharacter = function (character) {
	return (gs.getTile(gs.toTileIndex(character.body.position)).visible && (!character.isHidden || this.isTelepathic))
		|| util.distance(character.tileIndex, this.tileIndex) < 1.5;
};

// UPDATE_CHARACTER_FRAMES:
// ************************************************************************************************
gs.updateCharacterFrames = function () {
    for (let i = 0; i < this.characterList.length; i += 1) {
        if (this.characterList[i].isAlive) {
            this.characterList[i].updateFrame();
        }
    }
};

// CHARACTER_DESC:
// ************************************************************************************************
gs.characterDesc = function (character) {
	var str = '';
	
	if (character === this.pc) {
		str = '玩家\n';
		str += '点击自己或者按Sapce键等待一回合，\n按住Shift并点击等待直到血量跟法力值恢复为止。';
		return str;
	}
	
	// Name:
	if (character.name) {
		str += translator.getText(character.name) + '\n';
	} else {
		str += translator.getText(character.type.niceName)+ '\n';
	}
	
	// Level:
	str += '等级: ' + character.level + '\n';
	
	// HP:
	str += '生命值: ' + character.currentHp + '/' + character.maxHp + '\n';
	
	// size:
	str += '身型: ' + ['矮小', '中等', '高大'][character.size] + '\n';

	// Defense:
	DAMAGE_TYPES.forEach(function (type) {
		if (character.resistance[type] > 0) {
			str += translator.getText(type) + '耐性\n';
		}
		else if (character.resistance[type] < 0) {
			str += '易受' + translator.getText(type) + '\n';
		}
	}, this);
	
	// Reflective:
	if (character.reflection > 0) {
		str += 'Reflective\n';
	}
	
	str += '被发现的概率: ' + gs.toPercentStr(character.detectPlayerPercent()) + '\n';
	
	
	return str;
};

// ATTACK_RESULT:
// When dealing physical damage, call this function to determine if the attack actually landed.
// Will return {'HIT', 'MISS', 'CRITICAL'}
// This should be called before takeDamage is called (so that missed projectilces can continue on their course)
// type = 'Range', 'Melee'
// ************************************************************************************************
Character.prototype.attackResult = function (attacker, type) {
    var result = game.rnd.frac(), critChance, blockChance, evasionChance;
	
	if (type !== 'Range' && type !== 'Melee') {
		throw 'Invalid attack type: ' + type;
	}
	
	if (type === 'Melee') {
		critChance = CRITICAL_PERCENT;
		blockChance = this.parryChance;
	} 
	else if (type === 'Range') {
		critChance = CRITICAL_PERCENT;
		blockChance = this.blockChance;
	}
	else {
		throw 'Invalid attackType: ' + type;
	}
	
	evasionChance = this.dodgePercent();
    
	if (this === gs.pc) {
		critChance = 0;
	}
	
	if (result < blockChance) {
		if (type === 'Melee') {
			return 'PARRY';
		}
		else {
			return 'BLOCK';
		}
	}
    else if (result <= evasionChance + blockChance) {
        return 'MISS';
    }
	else if (result <= evasionChance + blockChance + critChance) {
        return 'CRITICAL';
    }
	else {
        return 'HIT';
    }
};

// MITIGATE_DAMAGE:
// ************************************************************************************************
Character.prototype.mitigateDamage = function (amount, damageType) {
	// 'None' damageType is unmitigatable
	if (damageType === 'None') {
		return amount;
	}
	
	// Protection Mitigation:
	if (damageType === 'Physical') {
		amount -= util.randInt(0, this.protection);
	}
	// Resistance Mitigation
	else if (this.resistance[damageType] > 0) {
		let maxMitigate = amount * RESISTANCE_MULTIPLIER[this.resistance[damageType]];
		amount -= (util.randInt(1, maxMitigate) + util.randInt(1, maxMitigate)) / 2;
	}
	// Resistance Vulnerability:
	else if (this.resistance[damageType] < 0) {
		let maxVuln = amount * RESISTANCE_MULTIPLIER[Math.abs(this.resistance[damageType])];
		amount += (util.randInt(1, maxVuln) + util.randInt(1, maxVuln)) / 2;
	}
    	
    // Round and cap:
    amount = Math.round(amount);
    amount = Math.max(1, amount); 
    
	return amount;
};

// MELEE_ATTACK:
// A general purpose function whenever one character attacks another with melee
// Handles MISS, HIT and CRITICAL 
// Handles damage shields
// flags: {effectFunc, alwaysCrit, killer, neverMiss, knockBack, isSpecialAttack}
// effectFunc: has arguments (defender, damage)
// ************************************************************************************************
gs.meleeAttack = function (attacker, tileIndex, damage, flags = {}) {
    var attackResult, isCrit, damageAmount, knockBack, defender, animPos, animNormal;
	
	
	// Bounce and face:
	attacker.body.faceTileIndex(tileIndex);
	attacker.body.bounceTowards(tileIndex);
	
	
	defender = gs.getChar(tileIndex);
	
	

	// In case there is no character at the target tileIndex:
	if (!defender) {
		return;
	}
	
	// Hit Effect:
	animNormal = util.normal(defender.sprite.position, attacker.sprite.position);
	animPos = {x: defender.sprite.position.x + animNormal.x * 15, y: defender.sprite.position.y + animNormal.y * 15};
	gs.createAnimEffect(animPos, 'Hit');
	
	attackResult = defender.attackResult(attacker, 'Melee');
	isCrit = attackResult === 'CRITICAL' || flags.alwaysCrit || attacker.alwaysCrit;
	knockBack = attacker.knockBackOnHit || flags.knockBack || 0;

	// Unaware crit:
	if (attacker === gs.pc && !defender.isAgroed) {
		damage = Math.round(damage + damage * 0.05 * gs.pc.stealth);
		isCrit = true;
	}

	// Reposte (ShieldsUp):
	if (defender.statusEffects.has('ShieldsUp')) {
		gs.meleeAttack(defender, attacker.tileIndex, defender.weaponDamage(), {neverMiss: true, isSpecialAttack: true});
		defender.popUpText('Blocked!', '#ffffff');
	}
	// Reposte (Blade Dancers):
	else if (defender.canReposteAttacker(attacker) && util.frac() <= 0.5) {
		gs.meleeAttack(defender, attacker.tileIndex, defender.abilities.abilityInSlot(0).type.attributes.damage.value(defender), {neverMiss: true});
		defender.popUpText('Reposte!', '#ffffff');
	}
	// Block:
	else if (attackResult === 'PARRY' && !isCrit) {
		defender.popUpText('Parry', '#ffffff');
	}
	// Miss:
	else if (attackResult === 'MISS' && !isCrit && !flags.neverMiss) {
		defender.popUpText('Miss', '#ffffff');
	}
	// Hit or Critical:  
	else {
		// Damage:
		damageAmount = defender.takeDamage(damage, 'Physical', {
			killer: attacker,
			isCrit: isCrit,
			isSpecialAttack: flags.isSpecialAttack
		});

		// Vampire:
		if (attacker.meleeLifeTap && !defender.type.noBlood) {
			attacker.healHp(attacker.meleeLifeTap);
		}

		// Damage Shield:
		if (defender.damageShield > 0) {
			if (attacker !== gs.pc || gs.pc.inventory.getWeapon().attackEffect !== gs.weaponEffects.PoleArm) {
				attacker.takeDamage(defender.damageShield, 'None', {killer: defender, neverCrit: true});
			}
		}

		// Inferno:
		if (defender.hasInferno > 0) {
			gs.createFire(attacker.tileIndex, INFERNO_RING_DAMAGE, {killer: defender});
		}

		// Thunder:
		if (defender.hasThunder > 0) {
			gs.createShock(attacker.tileIndex, INFERNO_RING_DAMAGE, {killer: defender});
		}

		// Knockback:
		if (knockBack > 0 && defender.isAlive) {
			defender.body.applyKnockBack(util.normal(attacker.tileIndex, defender.tileIndex), knockBack);
		}

		// Ice Knockback:
		if (gs.getObj(defender.tileIndex, obj => obj.type.isSlippery) && defender.isAlive && !defender.isFlying) {
			defender.body.applyKnockBack(util.normal(attacker.tileIndex, defender.tileIndex), 1);
		}

		// Corrision:
		if (defender.type.isCorrosive && attacker === gs.pc && util.frac() < CORRODE_PERCENT) {
			gs.pc.corrodeWeapon();
		}

		// Additional Effect:
		if (flags.effectFunc && defender.isAlive) {
			flags.effectFunc(defender, attacker, damageAmount);
		}

	}
};

// CAN_REPOSTE_ATTACKER:
// ************************************************************************************************
Character.prototype.canReposteAttacker = function (attacker) {
	return this.type.reposteAttacks
		&& !this.shouldSkipTurn()
		&& (attacker !== gs.pc || gs.pc.inventory.getWeapon().type.attackEffect !== gs.weaponEffects.PoleArm);
};

// Overwritten in Player type
Character.prototype.getActiveSummonList = function () {
	return [];
};

// GET_CHARACTER_WITH_ID:
// Returns the character with the unique ID or null if that character no longer exists.
// It is entirely possible for the character to no longer exist (for example he is dead)
// ************************************************************************************************
gs.getCharWithID = function (id) {
	if (typeof id !== 'number') {
		throw 'getCharWithID: id is not a number';
	}
	
	for (let i = 0; i < this.characterList.length; i += 1) {
		if (this.characterList[i].id === id && this.characterList[i].isAlive) {
			return this.characterList[i];
		}
	}
	
	return null;
};

// NUM_VISIBLE_NPCS:
// Count the number of hostile NPCs visible to the player
// ************************************************************************************************
gs.numVisibleNPCs = function () {
	var count = 0;
	
	gs.getAllNPCs().forEach(function (npc) {
		if (npc.isAlive && npc.faction === FACTION.HOSTILE && !npc.isHidden && gs.pc.canSeeCharacter(npc)) {
			count += 1;
		}
	}, this);
	
	return count;
};

// SHOUT:
// A global shout function that can be used to agro NPCs
// ************************************************************************************************
gs.shout = function (tileIndex, faction, missTurn = false) {
	var shoutRange;
	
	gs.getAllNPCs().forEach(function (npc) {
		// Sleeping enemies:
		if (npc.statusEffects.has('DeepSleep')) {
			shoutRange = 0;
		}
		else if (npc.isAsleep) {
			shoutRange = SHOUT_RANGE / 2;
		} 
		else {
			shoutRange = SHOUT_RANGE;
		}

		if (!npc.isAgroed
			&& !npc.type.neverRespondToShout
			&& npc.faction === faction
			&& util.distance(tileIndex, npc.tileIndex) <= shoutRange
			&& gs.isRayClear(tileIndex, npc.tileIndex)) {
			
			npc.agroPlayer();
		}
	
	}, this);
};

// GET_ALL_NPCS:
// ************************************************************************************************
gs.getAllNPCs = function () {
	return this.characterList.filter(char => char.isAlive && char !== gs.pc);
};

// GET_ALL_ALLIES:
// ************************************************************************************************
gs.getAllAllies = function () {
	return this.characterList.filter(char => char !== this.pc && char.faction === FACTION.PLAYER);
};

// AGROED_HOSTILE_LIST:
// ************************************************************************************************
gs.agroedHostileList = function () {
	return gs.characterList.filter(char => char.isAlive && char.faction === FACTION.HOSTILE && char.isAgroed);
};

// FIND_CHAR:
// Find an object anywhere on the current level based on either a predicate or a typeName
// ************************************************************************************************
gs.findChar = function (pred) {
	if (typeof pred === 'string') {
		return gs.characterList.find(obj => obj.name === pred);
	}
	else {
		return gs.characterList.find(pred);
	}
};
