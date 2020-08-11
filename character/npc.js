/*global game, gs, console, util*/
/*global Character, ItemSlotList, StatusEffects, Item*/
/*global ASSERT_EQUAL*/
/*global TILE_SIZE, SCALE_FACTOR*/
/*global INVENTORY_SIZE*/
/*global MAX_AGRO_RANGE, SHOUT_RANGE, NPC_UNAGRO_TIME, LOS_DISTANCE*/
/*global RANDOM_MOVE_PERCENT, KITE_RANGE*/
/*global FONT_NAME, MOVE_TIME, DROP_GOLD_PERCENT*/
/*global ELITE_RING_FRAME, HP_REGEN_TIME*/
/*global FACTION, MAX_ABILITIES, MP_REGEN_TIME*/
/*global STRAFE_DODGE_PERCENT*/
/*jshint white: true, laxbreak: true, esversion: 6 */
'use strict';

// CREATE_NPC_POOL:
// ************************************************************************************************
gs.createNPCPool = function () {
	this.npcPool = [];
	for (let i = 0; i < 50; i += 1) {
		this.npcPool[i] = new NPC();
	}
	
	gs.nextCharacterID = 1;
};

// CREATE_NPC:
// Standard function for creating NPCs:
// ************************************************************************************************
gs.createNPC = function (tileIndex, typeName, flags) {
	if (gs.getChar(tileIndex)) {
		console.log('Trying to place ' + typeName + ' tileIndex is occupied by: ' + gs.getChar(tileIndex).type.name);
		return null;	
	}
	
	for (let i = 0; i < this.npcPool.length; i += 1) {
		if (!this.npcPool[i].isAlive && !this.inArray(this.npcPool[i], this.characterList)) {
			this.npcPool[i].init(tileIndex, typeName, flags);
			return this.npcPool[i];
		}
	}
	
	// Pool size exceeded:
	this.npcPool.push(new NPC());
	this.npcPool[this.npcPool.length - 1].init(tileIndex, typeName, flags);
	
	
	return this.npcPool[this.npcPool.length -1];
};

// CONSTRUCTOR:
// ************************************************************************************************
function NPC() {
	this.createSharedProperties();
	this.isAlive = false;
}
NPC.prototype = new Character();

// INIT:
// ************************************************************************************************
NPC.prototype.init = function (tileIndex, typeName, flags) {
	ASSERT_EQUAL(gs.npcTypes.hasOwnProperty(typeName), true, 'Invalid npcTypeName: ' + typeName);
	ASSERT_EQUAL(gs.getChar(tileIndex), null, 'TileIndex is already occupied');
	
	// Default Flags:
	flags = flags || {isAsleep: false, npcClassType: null, isWandering: false};
	
	// Type and name:
	this.type = gs.npcTypes[typeName];
	this.name = this.type.name;
	
	// Setting ID:
	if (flags.id) {
		this.id = flags.id;
	}
	else {
		this.id = gs.nextCharacterID;
		gs.nextCharacterID += 1;
	}
	
	// Negate Sleep:
	if (this.type.neverSleep) {
		flags.isAsleep = false;
	}
	
	// Negate Wandering:
	if (flags.isAsleep || this.type.neverWander) {
		flags.isWandering = false;
	}

	// Property Flags:
	this.isAlive = true;
	this.isAgroed = false;
	this.faction = this.type.faction;
	this.isAsleep = Boolean(flags.isAsleep);
	this.npcClassType = flags.npcClassType;
	this.isWandering = Boolean(flags.isWandering);
	this.isRunning = false;
	this.isFlying = Boolean(this.type.isFlying);
	this.burstDamage = flags.burstDamage || 0;
	this.actionQueue = [];
	this.moveDelta = {x: 0, y: 0};
	this.timeToHatch = 0;
	this.poisonDamage = 0;
	this.lightningRodTileIndex = null;
	
	// Summon Properties:
	this.summonerID = flags.summonerID || null; // Summoned creatures store their owner here
	this.summonIDList = []; 					// The summoner stores all summoned creatures so they can poof upon death.
	this.summonDuration = 20;				// The duration before a summon creature will naturally poof
	
	// Hiding (only used for submerged enemies right now)
	if (this.type.startHidden) {
		this.isHidden = true;
		this.isAsleep = false;
	} 
	else {
		this.isHidden = false;
	}
	
	// AI:
	this.unagroTimer = 0;
	this.wanderVector = {x: util.randInt(-1, 1), y: util.randInt(-1, 1)};
	
	
	// Set Level and stats:
	this.level = flags.level || this.type.level;
	if (this.type.hitPointType) {
		this.maxHp = gs.npcMaxHp(this.level, this.type.hitPointType);
	}
	else {
		this.maxHp = this.type.maxHp;
	}
	
	this.maxMp = this.type.maxMp;
	this.exp = this.type.exp;
	this.movementSpeed = this.type.movementSpeed;
	this.regenTimer = 0;

	
	
	// Elite:
	if (this.npcClassType) {
		this.name = this.npcClassType.name + ' ' + this.type.name;
		this.exp = this.type.exp * 4;	
	}
	
	// Abilities:
	this.abilities.clear();
	if (this.type.abilityTypes) {
		this.type.abilityTypes.forEach(function (abilityType) {
			this.abilities.addAbility(abilityType);
		}, this);
	}
	
	// Status effects:
	this.statusEffects = new StatusEffects(this);
	
	// Event Queue:
	this.eventQueue.clear();
	
	// Pop up queue:
	this.popUpTimer = 0;
	this.popUpQueue = [];
	
	// Sprite:
	this.sprite.frame = this.type.frame;
	this.sprite.angle = 0;
	this.ringSprite.frame = 0;
	
	// Light:
	if (this.type.light) {
		this.light = gs.createLightCircle(this.sprite.position, this.type.light.color, this.type.light.radius, 0, this.type.light.startAlpha);
		this.light.fade = false;
		this.light.noLife = true;
	}
	else {
		this.light = null;
	}
	
	// Push to lists:
	if (gs.inArray(this, gs.characterList)) {
		console.log('In characterList');
	}
	
	gs.characterList.push(this);

	// Place in tileMap:
	this.body.snapToTileIndex(tileIndex);
	this.facing = game.rnd.frac() <= 0.5 ? 'RIGHT' : 'LEFT';
	
	
	// Initial rotation facing:
	if (this.type.rotateAim) {
		this.rotFacing = util.randElem(['UP', 'DOWN', 'LEFT', 'RIGHT']);
		this.rotateToFace();
	}
	
	this.updateStats();
	this.currentHp = this.maxHp;
	this.currentMp = this.maxMp;

	
};


// DESTROY:
// ************************************************************************************************
NPC.prototype.destroy = function () {
	this.isAlive = false;
	
	this.sprite.visible = false;
	this.hpText.visible = false;
	this.ringSprite.visible = false;
	this.statusText.visible = false;
	
	this.statusEffects.removeAll();
	
	// Destroy Light:
	if (this.light) {
		this.light.destroy();
		this.light = null;
	}

	gs.getTile(this.tileIndex).character = null;
};

// USE_ABILITY:
// ************************************************************************************************
NPC.prototype.useAbility = function (ability) {
	var char;
	
	// Strafe dodging attacks:
	char = gs.getChar(ability.target);
	if (char && this.isHostileToMe(char) && 
		char.previousTileIndex && 
		util.frac() < char.evasion * STRAFE_DODGE_PERCENT &&
		ability.type.canUseOn(this, char.previousTileIndex)) {
		
		ability.type.useOn(this, char.previousTileIndex);
	}
	else {
		ability.type.useOn(this, ability.target);
	}
	
	ability.coolDown = ability.type.coolDown;
	this.currentMp -= ability.type.mana || 0;
	this.updateStats();
	
	
	this.endTurn(100);
};

// CAN_MOVE:
// ************************************************************************************************
NPC.prototype.canMove = function () {
	return !this.isImmobile && !this.type.cantMove;
};

// MOVE_TO:
// Call this function to either move to a tile index or open a door if one is there
// ************************************************************************************************
NPC.prototype.moveTo = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}

	// Moving:
	if (gs.isPassable(tileIndex)) {
		// Stick sprite if off screen:
		if (!gs.getTile(tileIndex).visible && !gs.getTile(this.tileIndex).visible) {
			this.body.snapToTileIndex(tileIndex);
		}
		else {
			this.body.moveToTileIndex(tileIndex);
		}
	} 
	// Opening Door:
	else if (gs.getObj(tileIndex, obj => obj.isDoor() && !obj.isOpen)) {
		gs.getObj(tileIndex).interact(this);
	} 
	else {
		throw 'moveTo failed';
	}
	
	// Has NPC Acted:
	if (gs.getTile(this.tileIndex).visible && this.faction === FACTION.HOSTILE) {
		gs.hasNPCActed = true;
	}
	
	this.endTurn(this.moveTime);
};

// CAN_MOVE_TO_TILE:
// Returns true if the NPC can move to the tile without regards to the tiles contents.
// This is just to test flying and swimming creatures
// ************************************************************************************************
NPC.prototype.canMoveToTile = function (tileIndex) {
	
	// Never move out of bounds:
	if (!gs.isInBounds(tileIndex)) {
		return false;
	}
	
	// Swimming enemies can't move out of water:
	if (this.type.isSwimming && gs.getTile(tileIndex).type.name !== 'Water' && gs.getTile(tileIndex).type.name !== 'Lava') {
		return false;
	}
	
	if (this.type.isSwimming && gs.getObj(tileIndex, obj => obj.type.name === 'Ice')) {
		return false;
	}
	
	// Non-flying enemies will not move to pits
	if (gs.isPit(tileIndex) && !this.isFlying) {
		return false;
	}
	
	return true;
};

// CAN_MOVE_TO:
// Call this function to see if the npc can move to the tile index or open a door there
// Important Note: this function does not consider whether the NPC can move to the tileIndex from their current position
// i.e. it simply tests if the tileIndex is valid given the NPCs behaviour type
// This means it can be passed into path finding to 'test ahead' of the NPC
// ************************************************************************************************
NPC.prototype.canMoveTo = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	if (!this.canMoveToTile(tileIndex)) {
		return false;
	}
	
	// Players allies will not move onto dangerous terrain:
	if (this.faction === FACTION.PLAYER && !gs.isIndexSafe(tileIndex)) {
		return false;
	}

	if (gs.isPassable(tileIndex)) {
		return true;
	} 
	else if (gs.getObj(tileIndex, obj => obj.isDoor() && !obj.isOpen) && !gs.getObj(tileIndex, obj => obj.isGuarded || obj.isLocked || obj.isSealed)) {
		return true;
	} 
	else {
		return false;
	}
};

// DETECT_PLAYER_PERCENT:
// ************************************************************************************************
NPC.prototype.detectPlayerPercent = function () {
	var pcStealth,
		npcPerception,
		detectPct;

	// Higher pcStealth means the pc is harder to spot:
	pcStealth = util.distance(gs.pc.tileIndex, this.tileIndex) + gs.pc.stealth * 2.6;

	
	// Can't see:
	if (util.distance(gs.pc.tileIndex, this.tileIndex) > MAX_AGRO_RANGE || !gs.isRayClear(this.tileIndex, gs.pc.tileIndex)) {
		return 0;		
	}
	// Deep Sleep:
	if (this.statusEffects.has('DeepSleep')) {
		return 0;
	}
	// Sleeping:
	else if (this.isAsleep) {
		if (util.distance(gs.pc.tileIndex, this.tileIndex) > 1) {
			return 0;
		}

		npcPerception = 1;

		
	}
	// Normal:
	else {
		npcPerception = MAX_AGRO_RANGE * 0.3 + (this.type.level - 1);
	}

	// perc === stealth => 0.5 chance to detect
	return Math.max(0, Math.min(0.95, (npcPerception / pcStealth) * 0.5));
};

// TRY_TO_AGRO_PLAYER:
// ************************************************************************************************
NPC.prototype.tryToAgroPlayer = function () {
	if (!gs.debugProperties.npcCanAgro) {
		return;
	}
	
	
	// Hidden mobs are a special case (player must be in their ambushDistance):
	if (this.isHidden) {
		if (util.distance(this.tileIndex, gs.pc.tileIndex) <= this.type.ambushDistance) {
			this.popUpText('Ambush!', '#ffffff');
			this.spotAgroPlayer();
		}

	// Other mobs agro normally:
	} else {
		this.spotAgroPlayer();
	}
	
};

// SPOT_AGRO_PLAYER:
// Call when the NPC spots the player for the first time
// This causes the NPC to miss a turn
// ************************************************************************************************
NPC.prototype.spotAgroPlayer = function () {
	gs.ASSERT(!this.isAgroed, 'spotAgroPlayer called on an already agroed NPC');
	
	this.waitTime = 100;
	
	this.agroPlayer();
};

// AGRO_PLAYER:
// ************************************************************************************************
NPC.prototype.agroPlayer = function () {
	if (this.faction !== FACTION.HOSTILE) {
		return;
	}
	
	this.isHidden = false;
	this.unagroTimer = 0;
	this.isAgroed = true;
	this.isAsleep = false;
	this.statusEffects.onAgroPlayer();
	
	
};

// SHOUT:
// ************************************************************************************************
NPC.prototype.shout = function () {
	gs.shout(this.tileIndex, this.faction);
};



// UPDATE_TURN:
// ************************************************************************************************
NPC.prototype.updateTurn = function () {
	// Don't update dead npcs:
	if (!this.isAlive) {
		return;
	}

	// Lose agro:
	if (this.isAgroed && !gs.getTile(this.tileIndex).visible) {
		this.unagroTimer += 1;
		if (this.unagroTimer >= NPC_UNAGRO_TIME) {
			this.isAgroed = false;
		}
	}
	
	// Special type updateTurn function:
	if (this.type.updateTurn) {
		this.type.updateTurn.call(this);
	}
	
	// An NPC may kill itself during its update turn call and we need to return before proceding:
	if (!this.isAlive) {
		return;
	}
	
	if (this.npcClassType && this.npcClassType.updateTurn) {
		this.npcClassType.updateTurn.call(this);
	}
	
	// Summon Duration:
	if (this.summonerID) {
		this.reduceSummonDuration();
	}

	this.updateTurnBase();
	this.updateStats();
};

// REDUCE_SUMMON_DURATION:
// ************************************************************************************************
NPC.prototype.reduceSummonDuration = function () {
	// Use summon duration -1 to indicate no duration
	if (this.summonDuration === -1) {
		return;
	}
	
	this.summonDuration -= 1;
	
	if (this.summonDuration <= 0) {
		// Poof:
		gs.createParticlePoof(this.tileIndex, 'PURPLE');
		this.popUpText('Poof', '#ffffff');
		
		// Tell summoner I'm dead:
		if (gs.getCharWithID(this.summonerID)) {
			gs.removeFromArray(this.id, gs.getCharWithID(this.summonerID).summonIDList);
		}
		
		this.destroy();
	}
};

// FALL_DOWN_PIT:
// ************************************************************************************************
NPC.prototype.fallDownPit = function () {
	this.death();
};

// ON_ENTER_TILE:
// Called once the character has actually finished moving and entered the tile
// Note that his tileIndex is already correct as it was set when beginning the move
// ************************************************************************************************
NPC.prototype.onEnterTile = function () {
	this.onEnterTileBase();
};

// ON_TAKE_DAMAGE:
// ************************************************************************************************
NPC.prototype.onTakeDamage = function () {
	// Damaged npc's always agro player:
	this.agroPlayer();

	// Does the NPC start to run:
	if (this.shouldStartRunning()) {
		this.isRunning = true;
		this.popUpText('Running!', '#ffffff');
	}

	// On Hit Functions:
	if (this.currentHp > 0) {
		if (this.type.onHit) {
			this.type.onHit(this);
		}
		
		if (this.npcClassType && this.npcClassType.onHit) {
			this.npcClassType.onHit(this);
		}
	}
};


// LOSE_EXP:
// ************************************************************************************************
NPC.prototype.loseExp = function () {
	
};

// KILLED_EXP:
// How much exp does the NPC give when killed
// ************************************************************************************************
NPC.prototype.killedExp = function () {
	let ability = this.abilities.getAbility('SpawnNPC'),
		exp = this.exp;
	
	// Handle granting exp for a spawners unspawned NPCs:
	if (ability) {
		exp += this.currentMp * ability.type.numSpawned * gs.npcTypes[ability.type.npcTypeName].exp;
	}
	
	// Summoned creatures give no exp:
	if (this.summonerID) {
		exp = 0;
	}
	
	return exp;
};

// DEATH:
// ************************************************************************************************
NPC.prototype.death = function (damageType, flags) {
	var itemName, dropIndex;
	flags = flags || {};

	
	this.destroy();
	
	// Random chance to shout upon death:
	if (game.rnd.frac() < 0.5) {
		this.shout();
	}
	
	// Gaining experience
	gs.pc.gainExperience(this.killedExp());

	// Blood:
	if (!gs.getObj(this.tileIndex) && !this.type.noBlood && !gs.isPit(this.tileIndex)) {
		gs.createObject(this.tileIndex, this.type.bloodTypeName);
	}
	
	// Rage:
	if (gs.pc.hasRage && flags.killer === gs.pc) {
		gs.pc.gainRage(1);
	}
	
	// Poof my summoned mobs:
	this.summonIDList.forEach(function (id) {
		if (gs.getCharWithID(id)) {
			gs.getCharWithID(id).popUpText('Poof', '#ffffff');
			gs.getCharWithID(id).death();
		}
	});
	
	// Tell my summoner I'm dead:
	if (this.summonerID && gs.getCharWithID(this.summonerID)) {
		gs.removeFromArray(this.id, gs.getCharWithID(this.summonerID).summonIDList);
	}
	
	// Remove Charm:
	if (gs.pc.statusEffects.has('NPCCharm') && gs.pc.statusEffects.get('NPCCharm').npcId === this.id) {
		gs.pc.statusEffects.remove('NPCCharm');
	}
	
	// Poof:
	gs.createParticlePoof(this.tileIndex);
	
	// Sound:
	gs.playSound(gs.sounds.death, this.tileIndex);
	
	// Shake:
	game.camera.shake(0.005, 100);
	game.camera.flash(0xffffff, 10);
	
	// onDeath Func:
	if (this.type.onDeath) {
		this.type.onDeath.use(this);
	}
	
	// Drop Loot:
	this.dropLoot();
	
	gs.hasNPCActed = true;
	
	// End turn:
	if (gs.activeCharacter === this) {
		this.endTurn(100);
	}
};

// DROP_LOOT:
// Call when an NPC dies to drop loot
// ************************************************************************************************
NPC.prototype.dropLoot = function () {
	var tileIndex;
	
	tileIndex = gs.getValidDropIndex(this.tileIndex);
	if (this.type.dropPercent && tileIndex) {
		if (game.rnd.frac() <= this.type.dropPercent) {
			if (game.rnd.frac() <= DROP_GOLD_PERCENT) {
				gs.createFloorItem(tileIndex, Item.createItem('GoldCoin', {amount: util.randInt(Math.ceil(gs.dropGoldAmount() / 2), gs.dropGoldAmount())}));
			} 
			else {
				gs.createRandomFloorItem(tileIndex);
			}
		}
	}
};

// GO_TO_SLEEP:
// ************************************************************************************************
NPC.prototype.goToSleep = function () {
	if (!this.type.damageImmune) {
		this.isAgroed = false;
		this.isAsleep = true;
	}
	
};

// TO_DATA:
// ************************************************************************************************
NPC.prototype.toData = function () {
	var data, i; 
	
	data = {
		id:						this.id,
		typeName: 				this.type.name,
		isAsleep: 				this.isAsleep,
		isAgroed:				this.isAgroed,
		isHidden:				this.isHidden,
		faction: 				this.faction,
		tileIndex: 				this.tileIndex,
		currentHp: 				this.currentHp,
		currentMp:				this.currentMp,
		summonerID:				this.summonerID,
		summonIDList:			this.summonIDList,
		summonDuration: 		this.summonDuration,
		actionQueue: 			this.actionQueue,
		timeToHatch:			this.timeToHatch,
		level:					this.level,
		lightningRodTileIndex:	this.lightningRodTileIndex,
		exp:					this.exp,
	};
	
	if (this.npcClassType) {
		data.npcClassName = this.npcClassType.name;
	}
	
	// Move Delta (for slow fire balls):
	if (this.moveDelta) {
		data.moveDelta = this.moveDelta;
	}
	
	if (this.burstDamage) {
		data.burstDamage = this.burstDamage;
	}
	
	// Abilities:
	data.coolDowns = [];
	for (i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.abilities.list[i]) {
			data.coolDowns[i] = this.abilities.list[i].coolDown;
		}
		else {
			data.coolDowns[i] = 0;
		}
	}
	
	// Status Effects:
	data.statusEffects = this.statusEffects.toData();
	
	return data;
};

// LOAD_NPC:
// ************************************************************************************************
gs.loadNPC = function (data) {
	var npc, flags;
	
	flags = {
		id:			data.id,
		isAsleep: 	data.isAsleep,
		level:		data.level,
		
	};
	
	if (data.npcClassName) {
		flags.npcClassType = gs.npcClassTypes[data.npcClassName];
	}
	
	// Create NPC:
	npc = this.createNPC(data.tileIndex, data.typeName, flags);
	
	
	// Test for failure:
	if (!npc) {
		throw 'Failed to create NPC';
	}
	
	// For slow fire ball:
	if (data.moveDelta) {
		npc.moveDelta = data.moveDelta;
	}
	
	if (data.burstDamage) {
		npc.burstDamage = data.burstDamage;
	}

	npc.isAgroed = data.isAgroed;
	npc.summonerID = data.summonerID;
	npc.summonIDList = data.summonIDList;
	npc.summonDuration = data.summonDuration;
	npc.actionQueue = data.actionQueue;
	npc.faction = data.faction;
	npc.isHidden = data.isHidden;
	npc.timeToHatch = data.timeToHatch;
	npc.lightningRodTileIndex = data.lightningRodTileIndex;
	
	// Dec 30th to not break old saves
	if (data.hasOwnProperty('exp')) {
		npc.exp = data.exp;
	}
	
	// Set HP																			
	npc.currentHp = data.currentHp;
	npc.currentMp = data.currentMp;

	// Load Ability Cooldowns:
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (npc.abilities.list[i]) {
			npc.abilities.list[i].coolDown = data.coolDowns[i];
		}
	}
	
	// Load Status Effects:
	npc.statusEffects.loadData(data.statusEffects);
	
	
	
	
	return npc;
};

// END_TURN:
// ************************************************************************************************
NPC.prototype.endTurn = function (waitTime) {
	// End Turn:
	// Need to add test in case enemies try to end their turn twice in a single turn
	// This occurs during kite projectile attacks where an enemies both fires and moves
	
	if (waitTime === 0) {
		throw 'Invalid waittime';
	}
	
	if (gs.activeCharacter === this) {
		
		this.waitTime = waitTime;
		
		// NPCs ending their turn visible to the player will halt his queued actions:
		if (gs.pc.canSeeCharacter(this) && this.faction === FACTION.HOSTILE && !this.type.isHidden) {
			gs.hasNPCActed = true;
		}
		
		gs.endTurn();
	}	
};


NPC.prototype.hasTalent = function (talentName) {
	return false;
};

NPC.prototype.loseExp = function () {
	// Pass
};

// DESTROY_ALL_NPCS:
// ************************************************************************************************
gs.destroyAllNPCs = function () {
	gs.getAllNPCs().forEach(function (npc) {
		npc.destroy();
	}, this);
	
	// Clear character list:
	gs.removeDeadCharacters();
};




