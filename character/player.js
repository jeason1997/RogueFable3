/*global Phaser, game, gs, localStorage, util*/
/*global levelController, Item, CharacterInventory, help*/
/*global console, isNaN, TILE_SIZE*/
/*global ItemSlot, ItemSlotList, Abilities, Character*/
/*global MAX_LEVEL, FOOD_TIME, INVENTORY_SIZE, EXTENDED_WAIT_TURNS, FONT_NAME, SKILL_NAMES, PLAYER_INITIAL_MAX_FOOD*/
/*global MIN_MOVE_TIME, MOVE_TIME, SKILL_POINTS_PER_LEVEL*/
/*global HP_PER_SKILL, MP_PER_SKILL, STEALTH_PER_SKILL, MAX_SKILL, COLD_TIME, MAX_COLD_LEVEL, FREEZING_DAMAGE*/
/*global PLAYER_FRAMES, TALENT_POINT_LEVELS, RAGE_DECREASE_TURNS, CONFUSION_RANDOM_MOVE_PERCENT*/
/*global FACTION, MAX_ABILITIES, MAX_PLAYER_SLEEP_TIME*/
/*global INVENTORY_WIDTH, INVENTORY_HEIGHT, CHARACTER_SIZE*/
/*global WEAPON_HOT_BAR_WIDTH, WEAPON_HOT_BAR_HEIGHT, ZONE_FADE_TIME*/
/*jshint white: true, laxbreak: true, esversion: 6, loopfunc: true*/
'use strict';

// CREATE_PLAYER_CHARACTER:
// ************************************************************************************************
gs.createPlayerCharacter = function () {
	this.pc = new PlayerCharacter();
	this.characterList.push(this.pc);
};

// CONSTRUCTOR:
// ************************************************************************************************
function PlayerCharacter() {
	this.type = gs.playerType;
	
	this.createSharedProperties();

	this.id = gs.nextCharacterID;
	gs.nextCharacterID += 1;
	
	// Inventory:
	this.inventory = new CharacterInventory(this);

	this.reset();
}
PlayerCharacter.prototype = new Character();

// RESET:
// ************************************************************************************************
PlayerCharacter.prototype.reset = function () {
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
	this.abilities.clear();
	this.statusEffects.clear();
	this.eventQueue.clear();
	this.inventory.clear();
	
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
	this.currentFood = PLAYER_INITIAL_MAX_FOOD;
	
	
	this.name = 'Player';
	this.isExploring = false;
	this.characterClass = null;
	this.numDeaths = 0;
	this.fastMove = false;
	this.faction = FACTION.PLAYER;
	this.previousTileIndex = null;
	this.summonIDList = [];
	this.keyHoldTime = 0;
	this.attackDelay = 0; // Use this in order to stop double speed strafe attacks
	
	
	// Exp:
	this.exp = gs.expPerLevel[1]; // Due to skills, level 1 actually requires 20 exp
	this.level = 1;
	
	// Talents:
	this.talentPoints = 0;
	this.talents = [];
	this.availableTalents = [];
	
	// Skill:
	this.skillPoints = 0;
	
	// Religion:
	this.religion = null;
	
	// Rage:
	this.rageTimer = 0;
	this.rage = 0;
	
	// Sleep:
	this.sleepTime = 0;

	// Permanent Bonuses:
	this.permanentHpBonus = 0;
	this.permanentMpBonus = 0;
	
	// Timers:
	this.starveTimer = 0;
	this.foodTimer = 0;
	this.foodTextTimer = 0;
	this.coldTimer = 0;
	this.regenTimer = 0;
	
	// Event Queue:

	
	// Cold Level: 0=Normal, 1=Cold, 2=Freezing (take damage)
	this.coldLevel = 0;

	// Click Queue:
	this.actionQueue = [];

	// Update stats before game begins:
	this.poisonDamage = 0;
};


// ON_ADD_ITEM:
// ************************************************************************************************
PlayerCharacter.prototype.onAddItem = function (item) {
	// Popup Text:
	if (gs.turn > 0 && !gs.inArray(item.name, ['HealingShroom', 'EnergyShroom'])) {
		this.queuePopUpText(item.toShortDesc(), '#ffffff');
	}
	
	gs.HUD.refresh();
};

// DROP_ITEM:
// Drops an item (from the cursor).
// This function does not actually remove the item from the inventory but rather places it below the players feet or as close as possible
// ************************************************************************************************
PlayerCharacter.prototype.dropItem = function (item) {
	var indexList, floorItem;
	
	indexList = gs.getIndexInFlood(this.tileIndex, gs.isStaticPassable.bind(gs), 10);
	indexList = indexList.filter(index => !gs.getItem(index));
	
	floorItem = gs.createFloorItem(indexList[0], item);
	floorItem.wasDropped = true;
};

// CAN_DROP_ITEM:
// ************************************************************************************************
PlayerCharacter.prototype.canDropItem = function () {
	var indexList;
	
	indexList = gs.getIndexInFlood(this.tileIndex, gs.isStaticPassable.bind(gs), 10);
	indexList = indexList.filter(index => !gs.getItem(index));
	
	return indexList.length > 0;
};

// UPDATE_TURN
// ************************************************************************************************
PlayerCharacter.prototype.updateTurn = function () {
	this.updateTurnFood();
	
	// Sleep:
	if (this.isAsleep) {
		this.popUpText('Sleeping', '#ffffff');
		this.sleepTime += 1;
		
		if (this.sleepTime > MAX_PLAYER_SLEEP_TIME) {
			this.sleepTime = 0;
			this.isAsleep = false;
		}
	}
	
	// Cold:
	if (gs.zoneType().isCold) {
		this.coldTimer += 1;
		if (this.coldTimer > COLD_TIME) {
			this.coldTimer = 0;
			if (this.coldLevel < MAX_COLD_LEVEL) {
				this.coldLevel += 1;
			} 
			else {
				this.takeDamage(FREEZING_DAMAGE, 'Cold', {killer: 'Freezing', neverCrit: true});
			}
		}
	} 
	else {
		this.coldLevel = 0;
	}
	
	// Religion:
	if (this.religion && gs.religionTypes[this.religion].onTurn) {
		gs.religionTypes[this.religion].onTurn(this);
	}

	// Rage:
	if (this.hasRage && this.rage > 0) {
		this.rageTimer += 1;
		if (this.rageTimer >= RAGE_DECREASE_TURNS) {
			this.rage -= 1;
			this.rageTimer = 0;
		}
	} 
	else {
		this.rageTimer = 0;
	}
	
	// Charging charms:
	this.inventory.onUpdateTurn();
	
	// Rest Help:
	if (!gs.globalData.rest && this.currentHp < this.maxHp / 2 && gs.numVisibleNPCs() === 0) {
		help.restDialog();
	}
	
	this.updateTurnBase();
	this.updateStats();
};

// UPDATE_TURN_FOOD:
// ************************************************************************************************
PlayerCharacter.prototype.updateTurnFood = function () {
	// Eat food:
	if (this.race.name !== 'Mummy') {
		if (this.foodTimer >= FOOD_TIME) {
			this.foodTimer = 0;
			// Eat food (don't die):  
			if (this.currentFood > 0) {
				this.currentFood -= 1;
			}
		} else {
			this.foodTimer += 1;
		}

		// Starving:
		this.starveTimer += 1;
		if (this.currentFood === 0 && this.starveTimer >= 3) {
			this.starveTimer = 0;
			this.takeDamage(1, 'None', {neverCrit: true});
		}

		// Show hunger messages:
		if (this.currentFood <= 3 && this.foodTextTimer >= 10) {
			this.foodTextTimer = 0;
			this.popUpText('HUNGRY',  '#ff0000');
		} 
		else if (this.currentFood <= 1 && this.foodTextTimer >= 10) {
			this.popUpText('VERY HUNGRY', '#ff0000');
			this.foodTextTimer = 0;
		} 
		else if (this.foodTextTimer < 10) {
			this.foodTextTimer += 1;
		}
	}
};

// IS_READY_FOR_INPUT:
// ************************************************************************************************
PlayerCharacter.prototype.isReadyForInput = function () {
	return gs.activeCharacter === this
		&& gs.projectileList.length === 0
		&& !this.isMultiMoving
		&& this.currentHp > 0;
};

// IS_SQUEEZE_MOVE:
// Returns true when the player is slow, the tileIndex is diagonally adjacent, and moving there would require a 'squeeze' move
// ************************************************************************************************
PlayerCharacter.prototype.isSqueezeMove = function (tileIndex) {
	var isDiagonal;
	
	isDiagonal = function (dx, dy) {
		return this.tileIndex.x === tileIndex.x - dx 
			&& this.tileIndex.y === tileIndex.y - dy 
			&& !gs.isStaticPassable(tileIndex.x - dx, tileIndex.y) 
			&& !gs.isStaticPassable(tileIndex.x, tileIndex.y - dy);
	}.bind(this);
	
	return this.movementSpeed === 0
		&& this.canMoveTo(tileIndex)
		&& (isDiagonal(-1, -1) || isDiagonal(-1, 1) || isDiagonal(1, -1) || isDiagonal(1, 1));
};

// CLICK_TILE_INDEX:
// ************************************************************************************************
PlayerCharacter.prototype.clickTileIndex = function (tileIndex, exploredOnly, fastMove = false, rightClick = false) {
	var path, i;

    // Skip if its not the players turn:
    if (gs.activeCharacter !== this || gs.projectileList.length > 0 || this.isMultiMoving) {
        return;
    }
	
	// Skip if tileIndex is out of bounds:
	if (!gs.isInBounds(tileIndex)) {
		return;
	}
	
	this.fastMove = fastMove;
	this.actionQueue = [];
	this.isExploring = false;
	this.attackOnEnterTile = false;
	
	// Confusion:
	if (!gs.vectorEqual(tileIndex, this.tileIndex) && this.isConfused ) {
		if (util.frac() <= CONFUSION_RANDOM_MOVE_PERCENT) {
			tileIndex = this.getConfusedClickTileIndex();
		}
		gs.hasNPCActed = true;
	}
	
	// Right click:
	if (rightClick) {
		if (this.inventory.getQuickWeapon() && this.canAttack(tileIndex, this.inventory.getQuickWeapon())) {
			this.quickWeaponAttack(tileIndex);
		}
	}
	// Use Ability:
	else if (gs.state === 'USE_ABILITY_STATE' && this.canZap(tileIndex)) {
		this.zap(tileIndex);
		gs.keyBoardMode = false;
	}
	// Waiting:
	else if (gs.getTile(tileIndex) && gs.getChar(tileIndex) === this && gs.state === 'GAME_STATE') {
		// Picking up item:
		if (gs.getItem(tileIndex) && this.inventory.canAddItem(gs.getItem(tileIndex).item)) {
			this.pickUpItem(gs.getItem(tileIndex));
		}
		// Waiting:
		else {
			this.waitClicked();
		}
		gs.keyBoardMode = false;	
	}
	// Attacking with range (out of range):
	else if (this.weaponSkill() === 'Range' && this.isVisibleHostileAt(tileIndex) && util.distance(this.tileIndex, tileIndex) > this.weaponRange()) {
		this.popUpText('超出范围', '#ff0000');
	}
	// Attacking with Range (out of mana):
	else if (this.weaponSkill() === 'Range' && this.isVisibleHostileAt(tileIndex) && this.inventory.getWeapon().type.mpCost && this.currentMp < this.inventory.getWeapon().type.mpCost) {
		this.popUpText('法力不足', '#ff0000');
	}
	// Attacking with range (too close):
	else if (this.weaponSkill() === 'Range' && this.isVisibleHostileAt(tileIndex) && util.distance(this.tileIndex, tileIndex) < this.weaponMinRange()) {
		this.popUpText('太近', '#ff0000');
	}
	// Attacking with Range (line blocked):
	else if (this.weaponSkill() === 'Range' && this.isVisibleHostileAt(tileIndex) && !this.canAttack(tileIndex)) {
		this.popUpText('与目标间有障碍', '#ff0000');
	}
	// Squeeze Move:
	else if (gs.state === 'GAME_STATE' && this.isSqueezeMove(tileIndex)) {
		this.moveTo(tileIndex, 200);
		this.popUpText('挤', '#ffffff');
	}
	// Stop Slow characters from accidently diagonally moving:
	else if (gs.state === 'GAME_STATE'
			 && this.movementSpeed === 0
			 && util.distance(this.tileIndex, tileIndex) > 1
			 && util.sqDistance(this.tileIndex, tileIndex) === 1
			 && gs.numVisibleNPCs() > 0
			 && this.canMoveTo(tileIndex)) {
		return;	
	}
	// Else we push a list of clicks ending in the index:
	else if (gs.state === 'GAME_STATE') {
		path = this.getPathTo(tileIndex, exploredOnly);
		if (path && path.length > 0) {
			for (i = 0; i < path.length; i += 1) {
				this.actionQueue[i] = {type: 'CLICK', tileIndex: path[i], shift: gs.keys.shift.isDown || this.isConfused};
			}
			gs.keyBoardMode = false;
		}
		// Attacking: (takes care of no path to target ex. ice, pit):
		else if (this.canAttack(tileIndex)) {
			this.actionQueue[0] = {type: 'CLICK', tileIndex: tileIndex};
			gs.keyBoardMode = false;
		}
	}
};

// 	QUICK_WEAPON_ATTACK:
// ************************************************************************************************
PlayerCharacter.prototype.quickWeaponAttack = function (tileIndex) {
	this.attack(tileIndex, true, this.inventory.getQuickWeapon());
	gs.keyBoardMode = false;
	this.inventory.quickWeaponEquipped = true;
	this.updateStats();
};

// IS_VISIBLE_HOSTILE_AT:
// ************************************************************************************************
PlayerCharacter.prototype.isVisibleHostileAt = function (tileIndex) {
	var char = gs.getChar(tileIndex);
	return char && char !== this && this.canSeeCharacter(char) && char.isAlive && char.faction === FACTION.HOSTILE;
};

// WEAPON_SKILL:
// ************************************************************************************************
PlayerCharacter.prototype.weaponSkill = function (weapon) {
	weapon = weapon || this.inventory.getWeapon();
	return weapon.type.attackEffect.skill;
};

// GET_CONFUSED_CLICK_TILE_INDEX:
// Used when the player is confused
// ************************************************************************************************
PlayerCharacter.prototype.getConfusedClickTileIndex = function () {
	var indexList = gs.getIndexInBox(this.tileIndex.x - 1, this.tileIndex.y - 1, this.tileIndex.x + 2, this.tileIndex.y + 2);
	indexList = indexList.filter(index => !gs.vectorEqual(index, this.tileIndex));
	indexList = indexList.filter(index => gs.isPassable(index) || this.canAttack(index));
	return util.randElem(indexList);
};

// GET_PATH_TO:
// ************************************************************************************************
PlayerCharacter.prototype.getPathTo = function (tileIndex, exploredOnly) {
	return gs.findPath(this.tileIndex, tileIndex, {
		allowDiagonal: this.movementSpeed > 0,
		avoidTraps: gs.isIndexSafe(this.tileIndex, this),
		exploredOnly: exploredOnly,
		passDoors: true,
		canWalkFunc: this.canWalk.bind(this),
		maxDepth: 1000,
		character: this
	});
};

// CAN_WALK:
// ************************************************************************************************
PlayerCharacter.prototype.canWalk = function (tileIndex) {
	if (gs.isPit(tileIndex) && !this.isFlying) {
		return false;
	}
	
	return true;
};

// CHOOSE_ACTION
// ************************************************************************************************
PlayerCharacter.prototype.chooseAction = function () {
	var path, tileIndex, click;

	// Frozen or trapped skips turn:
	if (this.isStunned || this.isAsleep) {
		gs.pauseTime = 30;
		this.endTurn(100);
		return;
	}
	
	// Exploration:
	// Grabbing new unexplored tile indices and 'clicking' on them:
	if (this.isExploring && this.body.state === 'WAITING' && this.actionQueue.length === 0) {
		this.startExploring();
	}
	
	this.keyBoardControls();

	// Process click queue:
	if (this.body.state === 'WAITING' && this.actionQueue.length > 0) {
		// If its possible to complete the click queue ahead of schedule:
		if (this.tryToCompleteactionQueue()) {
			this.actionQueue = [];
			return;
		}

		// Get the next action the player has queued:
		click = this.actionQueue.pop();

		// Waiting action:
		if (click.type === 'WAIT') {
			this.endTurn(100);
			return;
		}

		// Click tile Index action:
		tileIndex = click.tileIndex;

		// Attacking:
		if (!click.shift && this.canAttack(tileIndex)) {
			this.attack(tileIndex);
		}
		// Doors:
		else if (gs.getObj(tileIndex, obj => obj.isDoor()) && this.canInteract(tileIndex)) {
			this.interact(tileIndex);
			if (this.actionQueue.length > 0) {
				path = this.getPathTo(this.actionQueue[0].tileIndex, false);
				if (path && path.length > 0) {
					for (let i = 0; i < path.length; i += 1) {
						this.actionQueue[i] = {type: 'CLICK', tileIndex: path[i]};
					}
				}
			}
		}
		// Items:
		else if (this.canReachItem(tileIndex)) {
			this.tryToPickUpItem(tileIndex);
		}
		// Interact:
		else if (this.canInteract(tileIndex)) {
			this.interact(tileIndex);
		}
		// Dangerous Terrain:
		else if (this.canMoveTo(tileIndex) && gs.isIndexSafe(this.tileIndex, this) && !gs.isIndexSafe(tileIndex, this) && !click.shift) {
			this.stopExploring();
			
			if (!gs.globalData.unsafeMove) {
				help.unsafeMoveDialog();
			}
			else {	
				this.popUpText('Dangerous Terrain', '#ffffff');
			}
		}
		// Charmed moving:
		else if (this.cantMoveFromCharm(tileIndex)) {
			this.popUpText('Cant run!', '#ffffff');
		}
		// Pit:
		else if (this.canJumpInPit(tileIndex)) {
			this.jumpInPit(tileIndex);
		}
		// Dialog:
		else if (this.canTalk(tileIndex)) {
			this.talk(tileIndex);
		}
		
		// Moving:
		else if (this.canMoveTo(tileIndex)) {
			this.moveTo(tileIndex);
		}
	}
};

// CANT_MOVE_FROM_CHARM:
// ************************************************************************************************
PlayerCharacter.prototype.cantMoveFromCharm = function (tileIndex) {
	var npc;
	
	if (this.statusEffects.has('NPCCharm') && !this.isMultiMoving) {
		npc = gs.getCharWithID(this.statusEffects.get('NPCCharm').npcId);

		if (util.distance(tileIndex, npc.tileIndex) > util.distance(this.tileIndex, npc.tileIndex) + 0.5) {
			return true;
		}
	}
	
	return false;
};

// KEYBOARD_CONTROLS:
// ************************************************************************************************
PlayerCharacter.prototype.keyBoardControls = function () {
	if (this.keyHoldTime !== 0 || gs.state !== 'GAME_STATE') {
		this.keyHoldTime -= 1;
		return;
	}
	
	if (gs.keys.numPad1.isDown || gs.keys.end.isDown) {
		this.clickTileIndex({x: this.tileIndex.x - 1, y: this.tileIndex.y + 1}, false, 2);
		this.keyHoldTime = 10;
	}
	else if (gs.keys.numPad2.isDown || gs.keys.down.isDown) {
		this.clickTileIndex({x: this.tileIndex.x, y: this.tileIndex.y + 1}, false, 2);
		this.keyHoldTime = 10;
	}
	else if (gs.keys.numPad3.isDown || gs.keys.pageDown.isDown) {
		this.clickTileIndex({x: this.tileIndex.x + 1, y: this.tileIndex.y + 1}, false, 2);
		this.keyHoldTime = 10;
	}
	else if (gs.keys.numPad4.isDown || gs.keys.left.isDown) {
		this.clickTileIndex({x: this.tileIndex.x - 1, y: this.tileIndex.y}, false, 2);
		this.keyHoldTime = 10;
	}
	else if (gs.keys.numPad6.isDown || gs.keys.right.isDown) {
		this.clickTileIndex({x: this.tileIndex.x + 1, y: this.tileIndex.y}, false, 2);
		this.keyHoldTime = 10;
	}
	else if (gs.keys.numPad7.isDown || gs.keys.home.isDown) {
		this.clickTileIndex({x: this.tileIndex.x - 1, y: this.tileIndex.y - 1}, false, 2);
		this.keyHoldTime = 10;
	}
	else if (gs.keys.numPad8.isDown || gs.keys.up.isDown) {
		this.clickTileIndex({x: this.tileIndex.x, y: this.tileIndex.y - 1}, false, 2);
		this.keyHoldTime = 10;
	}
	else if (gs.keys.numPad9.isDown || gs.keys.pageUp.isDown) {
		this.clickTileIndex({x: this.tileIndex.x + 1, y: this.tileIndex.y - 1}, false, 2);
		this.keyHoldTime = 10;
	}
};

// TRY_TO_COMPLETE_CLICK_QUEUE:
// ************************************************************************************************
PlayerCharacter.prototype.tryToCompleteactionQueue = function () {
	if (this.actionQueue[0].type === 'WAIT') {
		return false;
	}

	var tileIndex = this.actionQueue[0].tileIndex;

	// Attacking:
	if (this.canAttack(tileIndex) && !this.actionQueue[0].shift) {
		this.attack(tileIndex);
		return true;
	}

	return false;
};

// FALL_DOWN_PIT:
// ************************************************************************************************
PlayerCharacter.prototype.fallDownPit = function () {
	if (gs.nextLevel()) {
		gs.descendLevel();
		this.randomTeleport();
		gs.pc.popUpText('Fell down pit!', '#ffffff');
		gs.createParticlePoof(gs.pc.tileIndex, 'WHITE');
	}
	else {
		gs.pc.death(null, {killer: 'Pit'});
	}
	
};

// ON_ENTER_TILE:
// Called once the character has actually finished moving and entered the tile
// Note that his tileIndex is already correct as it was set when beginning the move
// ************************************************************************************************
PlayerCharacter.prototype.onEnterTile = function () {
	this.onEnterTileBase();

	if (this.attackOnEnterTile) {
		this.attackOnEnterTile = false;
		this.moveAttack(this.prevTileIndex, this.tileIndex);
	}
	
	// Pick Up Items:
	if (gs.getItem(this.tileIndex) && !this.isMultiMoving && !gs.getItem(this.tileIndex).wasDropped) {
		if (this.inventory.canAddItem(gs.getItem(this.tileIndex).item)) {
			this.pickUpItem(gs.getItem(this.tileIndex));
		}
		else {
			this.stopExploring();
			this.popUpText('Inventory Full', '#ffffff');
			gs.getItem(this.tileIndex).wasDropped = true;
		}
	}
	
	// Trigger Groups:
	if (gs.getTile(this.tileIndex).triggerGroup) {
		levelController.onTriggerGroup(gs.getTile(this.tileIndex).triggerGroup);
	}

	// Calc LoS:
	gs.calculateLoS();
	
	// Drop Walls:
	for (let i = 0; i < gs.dropWallList.length; i += 1) {
		if (gs.dropWallList[i].filter(index => gs.getTile(index).visible && util.distance(this.tileIndex, index) <= 4).length === gs.dropWallList[i].length) {
			gs.explodeWall(gs.dropWallList[i]);
			gs.removeFromArray(gs.dropWallList[i], gs.dropWallList);
			break;
		}
	}
	
	// Interact with objects:
	if (this.canInteract(this.tileIndex)) {
		this.interact(this.tileIndex);
	}
	
	if (!gs.globalData.stairs && gs.getObj(this.tileIndex, 'DownStairs')) {
		help.stairsDialog();
	}
};

// CAN_REACH_ITEM:
// Seperate from walking over a tile and picking up an item
// ************************************************************************************************
PlayerCharacter.prototype.canReachItem = function (tileIndex) {
	return gs.getItem(tileIndex) 
		&& !gs.isPassable(tileIndex) 
		&& util.distance(tileIndex, this.tileIndex) <= 1.5 
		&& !this.isMultiMoving;
};

// TRY_TO_PICK_UP_ITEM:
// ************************************************************************************************
PlayerCharacter.prototype.tryToPickUpItem = function (tileIndex) {
	if (this.inventory.canAddItem(gs.getItem(tileIndex).item)) {
		this.pickUpItem(gs.getItem(tileIndex));
	}
	else {
		this.popUpText('Inventory Full', '#ffffff');
		this.stopExploring();
		gs.getItem(tileIndex).wasDropped = true;
	}
};

// PICK_UP_ITEM:
// ************************************************************************************************
PlayerCharacter.prototype.pickUpItem = function (floorItem) {
	var item = floorItem.item;
	if (item.type.name === 'GoldCoin') {
		item.amount = Math.ceil(item.amount * this.goldMod);	
	}
	
	this.inventory.addItem(item);
	
	if (!floorItem.wasDropped && item.type.name !== 'GobletOfYendor') {
		this.gainExperience(gs.dangerLevel());
	}
	
	this.actionQueue = [];
	
	if (item.getSound()) {
		gs.playSound(item.getSound(), gs.pc.tileIndex);
	}
	
	gs.destroyFloorItem(floorItem);
	
	this.stopExploring();
	
	if (item.type.name === 'GoldCoin') {
		gs.createParticlePoof(floorItem.tileIndex, 'YELLOW', 10);	
	}
	
	if (gs.inArray(item.type.slot, ['shield', 'ring', 'body', 'feet', 'hands', 'head'])) {
		help.itemDialog();
	}
	if (item.type.slot === 'book') {
		help.bookDialog();
	}
	
	// Test victory condition:
	if (item.type.name === 'GobletOfYendor') {
		gs.playSound(gs.sounds.levelUp, gs.pc.tileIndex);
		gs.openVictoryMenu();
	}
	
	gs.HUD.miniMap.refresh();
};

// CAN_SWAP_WITH:
// Returns true if there is an ally at the tileIndex, and that ally can swap places with the player.
// Takes into account swimming creatures that cannot leave lava or water
// ************************************************************************************************
PlayerCharacter.prototype.canSwapWith = function (tileIndex) {
	return gs.isStaticPassable(tileIndex)
		&& gs.getChar(tileIndex)
		&& gs.getChar(tileIndex).faction === FACTION.PLAYER
		&& !gs.getChar(tileIndex).isImmobile
		&& !gs.getChar(tileIndex).isStunned
		&& gs.getChar(tileIndex).canMoveToTile(this.tileIndex);
};

// CAN_MOVE_TO:
// ************************************************************************************************
PlayerCharacter.prototype.canMoveTo = function (tileIndex) {
	if (this.isImmobile) {
		return false;
	}
	
	if (this.cantMoveFromCharm(tileIndex)) {
		return false;
	}
	
	if (gs.isPit(tileIndex) && !this.isFlying) {
		return false;
	}
	
	return gs.isPassable(tileIndex) || this.canSwapWith(tileIndex);
};

// CAN_JUMP_IN_PIT:
// ************************************************************************************************
PlayerCharacter.prototype.canJumpInPit = function (tileIndex) {
	return gs.isPit(tileIndex) && !this.isFlying;
};

// JUMP_IN_PIT:
// Called when the player intentionally clicks a pit
// ************************************************************************************************
PlayerCharacter.prototype.jumpInPit = function (tileIndex) {
	var pitFunc, dialog;
	
	pitFunc = function () {
		this.body.moveToTileIndex(tileIndex);
	}.bind(this);
	
	// Setup Dialog:
	dialog = [{}];
	dialog[0].text = 'Really jump into the pit?';
	dialog[0].responses = [
		{text: 'Yes', nextLine: 'exit', func: pitFunc},
		{text: 'No', nextLine: 'exit'},
	];
	
	gs.dialogMenu.open(dialog);
};

// MOVE_TO:
// ************************************************************************************************
PlayerCharacter.prototype.moveTo = function (tileIndex, moveTime) {	
	// Halt exploration:
	if (this.isExploring && !gs.isIndexSafe(tileIndex, this)) {
		this.stopExploring();
		return;
	}
	
	// Duelist cooldowns:
	if (this.characterClass === 'Duelist') {
		this.abilities.tickShortCoolDowns(1);
	}
		
		
	// Swap places:
	if (this.canSwapWith(tileIndex)) {
		gs.getChar(tileIndex).body.moveToTileIndex(this.tileIndex);
	}
		
	// Move Attack:
	this.attackOnEnterTile = false;
	this.prevTileIndex = {x: this.tileIndex.x, y: this.tileIndex.y};
	if (this.hasTalent('StrafeAttack') && !this.isMultiMoving) {
		this.attackOnEnterTile = true;
	}
		
	this.body.moveToTileIndex(tileIndex);
		
	if (!this.isMultiMoving || this.actionQueue.length === 0) {
		this.endTurn(moveTime || this.moveTime);
	}
};

// CAN_TALK:
// ************************************************************************************************
PlayerCharacter.prototype.canTalk = function (tileIndex) {
	var character = gs.getChar(tileIndex);
	return character 
		&& character.faction === FACTION.NEUTRAL
		&& gs.dialog[character.type.name]
		&& util.distance(this.tileIndex, character.tileIndex) <= 1.5;
};

// TALK
// ************************************************************************************************
PlayerCharacter.prototype.talk = function (tileIndex) {
	gs.dialogNPC = gs.getChar(tileIndex);
	gs.dialogMenu.open();
};

// CAN_ATTACK:
// ************************************************************************************************
PlayerCharacter.prototype.canAttack = function (tileIndex, weapon) {
	var tile = gs.getTile(tileIndex),
		char = gs.getChar(tileIndex),
		canAttackChar,
		canShootTrap;
	
	weapon = weapon || this.inventory.getWeapon();
	
	// Out of mana:
	if (weapon.type.mpCost && this.currentMp < weapon.type.mpCost) {
		return false;
	}
	
	canAttackChar = char && char.isAlive &&  this.canSeeCharacter(char) && (char.faction === FACTION.HOSTILE || char.faction === FACTION.DESTRUCTABLE);
	canShootTrap = weapon.type.range > 1.5 && gs.canShootTrap(tileIndex) && tile.visible;
	
	return gs.isInBounds(tileIndex)
		&& (canAttackChar || canShootTrap)
		&& weapon.type.attackEffect.canAttack(tileIndex, weapon);
};

// ATTACK:
// ************************************************************************************************
PlayerCharacter.prototype.attack = function (tileIndex, endTurn = true, weapon = null) {
	weapon = weapon || this.inventory.getWeapon();
	
	// Attacking character (takes priority):
	if (gs.getChar(tileIndex)) {
		weapon.type.attackEffect.useOn(tileIndex, weapon);
	}
	// Attacking trap w/ range:
	else if (this.weaponSkill(weapon) === 'Range' && gs.canShootTrap(tileIndex)) {
		weapon.type.attackEffect.useOn(tileIndex, weapon);
	}
	// Attacking trap w/ melee:
	else if (this.weaponSkill(weapon) === 'Melee' && gs.canShootTrap(tileIndex)) {
		this.body.faceTileIndex(tileIndex);
		this.body.bounceTowards(tileIndex);
		gs.getObj(tileIndex).stepOn(null);
	}
	else {
		throw 'Cannot attack tileIndex';
	}
	
	// Consuming mana from weapon (generally used for staves)
	if (weapon.type.mpCost && !gs.debugProperties.disableMana) {
		this.currentMp -= 1;
	}
	
	// Facing the target:
	this.body.faceTileIndex(tileIndex);

	// End Turn:
	if (endTurn) {
		this.endTurn(100);
	}
};

// AUTO_ATTACK:
// ************************************************************************************************
PlayerCharacter.prototype.autoAttack = function (rightClick = false) {
	var nearestNPC;
	
	if (gs.activeCharacter !== this || gs.projectileList.length > 0) {
		return;
	}
	
	nearestNPC = gs.getNearestVisibleNPC();
	
	if (nearestNPC) {
		gs.hasNPCActed = true;
		this.clickTileIndex(nearestNPC.tileIndex, true, true, rightClick);
	}
};

// MOVE_ATTACK:
// ************************************************************************************************
PlayerCharacter.prototype.moveAttack = function (prevTileIndex, toTileIndex) {
	var list;
	
	if (this.attackDelay > 0) {
		return;
	}
	
	list = this.getAttackableNPCs();
	
	// Only move attacking visible and hostile npcs:
	list = list.filter(npc => this.isHostileToMe(npc) && this.canSeeCharacter(npc) && npc.isAgroed); 
	
	// Only move attack if in weaponRange (need to double check due to rapiers odd canAttack handling):
	list = list.filter(npc => util.distance(toTileIndex, npc.tileIndex) <= this.inventory.getWeapon().type.range);
	
	// Never attack reflective enemies:
	if (this.weaponSkill() === 'Range') {
		list = list.filter(npc => npc.reflection === 0);
	}
	
	// Only npcs that we are not moving away from:
	list = list.filter(npc => util.sqDistance(npc.tileIndex, prevTileIndex) - util.sqDistance(npc.tileIndex, toTileIndex) >= 0);
	
	// Targeting the nearest enemy:
	list.sort((a, b) => util.distance(prevTileIndex, a.tileIndex) - util.distance(prevTileIndex, b.tileIndex));
		
	if (list.length > 0) {
		gs.hasNPCActed = true;
		this.attack(list[0].tileIndex, false);
		this.attackDelay = 100;
	}
};

// GET_ATTACKABLE_NPCS:
// Return a list of attackable npcs
// ************************************************************************************************
PlayerCharacter.prototype.getAttackableNPCs = function () {	
	return gs.getAllNPCs().filter(npc => gs.pc.canAttack(npc.tileIndex));
};

// CANNOT_USE_ABILITY:
// Returns a string (true) as to why player cannot use ability
// Returns false otherwise
// ************************************************************************************************
PlayerCharacter.prototype.cannotUseAbility = function (abilityIndex) {
	var ability = this.abilities.list[abilityIndex];

	// Confused:
	if (this.isConfused) {
		return '混乱了!';
	}
	
	// Cooldown not done:
	if (ability.coolDown > 0) {
		return '还没冷却好';
	}
	
	// Sustained abilities:
	if (ability.type.isSustained) {
		// Can always turn an ability off:
		if (ability.isOn) {
			return false;
		}
		// Not enough max mana:
		else if (ability.type.isSustained && !ability.isOn && this.maxMp < this.manaCost(ability.type)) {
			return '法力不足';
		}
	} 
	// Mana no enough:
	else if (this.currentMp < this.manaCost(ability.type) && !gs.debugProperties.disableMana) {
		return '法力不足';
	}
	
	
	// Hit Points not enough:
	if (this.currentHp <= ability.type.hitPointCost) {
		return '生命不足';
	}
	
	// Basic canUse requirement not met:
	if (!ability.type.canUse(this)) {
		return '无法使用';
	}
	
	// Charm has no charge:
	if (ability.type.itemType && this.inventory.getCharm().charges === 0) {
		return 'No charge';
	}
	
	return false;
};

// CLICK_ABILITY:
// ************************************************************************************************
PlayerCharacter.prototype.clickAbility = function (abilityIndex) {
	if (gs.activeCharacter !== this || !this.isReadyForInput() || !this.abilities.abilityInSlot(abilityIndex)) {
		return;
	}

	if (gs.state === 'USE_ABILITY_STATE') {
		gs.pc.cancelUseAbility();
		return;		
	}

	if (gs.state !== 'GAME_STATE') {
		return;
	}
	
	if (this.cannotUseAbility(abilityIndex)) {
		this.popUpText(this.cannotUseAbility(abilityIndex), '#ffffff');
		return;
	}
	
	// Set selectedAbility and selectedItem:
	this.selectedAbility = this.abilities.list[abilityIndex];

	// Turn off a sustained ability:
	if (this.selectedAbility.isOn) {
		this.selectedAbility.isOn = false;
		this.updateStats();
		this.popUpText(gs.capitalSplit(this.selectedAbility.type.name) + ' off', '#ffffff');
		this.endTurn(100);
	}
	// Turn on sustained ability:
	else if (this.selectedAbility.type.isSustained) {
		this.selectedAbility.isOn = true;
		this.popUpText(gs.capitalSplit(this.selectedAbility.type.name) + ' on', '#ffffff');
		this.updateStats();
		this.endTurn(100);
	}
	// Use Immediately:
	else if (this.selectedAbility.type.useImmediately) {
		this.zap();
		gs.keyBoardMode = false;
	} 
	// Switching to ability targeting state:
	else {
		gs.state = 'USE_ABILITY_STATE';
		
		gs.playSound(gs.sounds.spell, gs.pc.tileIndex);

		// Popup Text:
		this.popUpText(gs.capitalSplit(this.selectedAbility.type.name), '#ffffff');

		// Particle Generator:
		if (this.particleGenerator) {
			this.particleGenerator.isAlive = false;
		}

		if (this.selectedAbility.type.particleColor) {
			this.particleGenerator = gs.createCastingParticle(this.tileIndex, this.selectedAbility.type.particleColor);
		}
	}
};

// IS_ABILITY_ON:
// Is the sustained ability turned on?
// ************************************************************************************************
PlayerCharacter.prototype.isAbilityOn = function (abilityName) {
	var isOn = false;
	
	this.abilities.abilityList.forEach(function (ability) {
		if (ability.type.name === abilityName && ability.isOn) {
			isOn = true;
		}
	}, this);
	
	return isOn;
};

// CAN_ZAP:
// ************************************************************************************************
PlayerCharacter.prototype.canZap = function (tileIndex) {
	return gs.state === 'USE_ABILITY_STATE'
		&& gs.isInBounds(gs.cursorTileIndex)
		&& this.selectedAbility.type.canUse(this)
		&& this.selectedAbility.type.canUseOn(this, tileIndex);
};

// CAN_CONSERVE_MANA:
// ************************************************************************************************
PlayerCharacter.prototype.canConserveMana = function (abilityType) {
	return abilityType.magicType
		&& !abilityType.isSustained
		&& !abilityType.isSummon;
};

// MANA_COST:
// ************************************************************************************************
PlayerCharacter.prototype.manaCost = function (abilityType) {
	if (this.canConserveMana(abilityType) && this.manaConservation[abilityType.magicType]) {
		return abilityType.mana - this.manaConservation[abilityType.magicType];
	}
	else {
		return abilityType.mana;
	}
};

// ZAP:
// ************************************************************************************************
PlayerCharacter.prototype.zap = function (tileIndex) {
	var abilityType = this.selectedAbility.type;
	
	if (!abilityType.useImmediately && abilityType.range && util.distance(this.tileIndex, tileIndex) > abilityType.range) {
		this.popUpText('', '#ff0000');
		gs.state = gs.state === 'USE_ABILITY_STATE' ? 'GAME_STATE' : gs.state;
	} 
	else {
		// Set cooldown:
		if (abilityType.coolDown && !gs.debugProperties.disableMana) {
			this.selectedAbility.coolDown = abilityType.coolDown;
		}
		
		// Use Mana:
		if (abilityType.mana && !gs.debugProperties.disableMana) {
			if (game.rnd.frac() <= this.saveManaChance) {
				this.popUpText('Saved Mana', '#ffffff');
			} 
			else {
				this.currentMp -= this.manaCost(abilityType);
			}
		}
		
		// Use Hit Points:
		if (abilityType.hitPointCost) {
			this.takeDamage(abilityType.hitPointCost, 'None', {killer: this, neverCrit: true});
		}
		
		// Use Ability:
		abilityType.useOn(this, tileIndex);

		// End Turn:
		gs.state = gs.state === 'USE_ABILITY_STATE' ? 'GAME_STATE' : gs.state;
		
		// Particles:
		if (abilityType.particleColor && !abilityType.noParticlePoof) {
			gs.createParticlePoof(this.tileIndex, abilityType.particleColor);
		}
		
		if (!abilityType.dontEndTurn) {
			this.endTurn(100);
		}
		
		
		
		// Consumables (wands and scrolls):
		if (this.selectedItem) {
			// Charged wands:
			if (this.selectedItem.type.stats && this.selectedItem.type.stats.maxCharges) {
				this.selectedItem.charges -= 1;
				
				// Destroying wand:
				if (this.selectedItem.charges === 0) {
					this.inventory.removeItem(this.selectedItem);
				}
			}
			
			// Scrolls:
			if (!abilityType.itemType.stats || !abilityType.itemType.stats.maxCharges) {
				this.inventory.removeItem(this.selectedItem);
			}
		}
		// Charm:
		else if (abilityType.itemType && abilityType.itemType.slot === 'charm') {
			this.inventory.getCharm().charges -= 1;
		}
	}

	if (this.particleGenerator) {
		this.particleGenerator.isAlive = false;
	}

	this.selectedItem = null;
};



// CAN_INTERACT:
// ************************************************************************************************
PlayerCharacter.prototype.canInteract = function (tileIndex) {
	return gs.isInBounds(tileIndex)
		&& gs.getObj(tileIndex, obj => obj.canInteract(this));
};

// INTERACT:
// ************************************************************************************************
PlayerCharacter.prototype.interact = function (tileIndex) {
	// Adding a test so that the player does not end his turn when zoning:
	if (gs.getObj(tileIndex, obj => obj.isZoneLine || obj.type.name === 'Portal')) {
		gs.getObj(tileIndex).interact(this);
		
	} 
	else {
		gs.getObj(tileIndex).interact(this);

		// End Turn:
		this.endTurn(100);
	}
};

// USE_ZONE_LINE:
// ************************************************************************************************
PlayerCharacter.prototype.useZoneLine = function () {
	var func, zoneLine;
	
	if (gs.activeCharacter !== this || gs.state !== 'GAME_STATE' || game.camera.onFadeComplete.getNumListeners() > 0) {
		return;
	}
	
	zoneLine = gs.getObj(this.tileIndex);
	
	// Sealed zone line:
	if (zoneLine.isSealed) {
		this.popUpText('Sealed', '#ffffff');
		return;
	}
	
	func = function () {
		gs.zoneTo(zoneLine);
		game.camera.flash('#ffffff', ZONE_FADE_TIME * 2);
		game.camera.onFlashComplete.addOnce(function () {
			if (gs.state === 'ZONING_STATE') {	
				gs.setState('GAME_STATE');
			}
		}, this);
	};

	game.camera.fade('#000000', ZONE_FADE_TIME);
	game.camera.onFadeComplete.addOnce(func, this);
	gs.setState('ZONING_STATE');
};

// WEAPON_SLOT_CLICKED:
// ************************************************************************************************
PlayerCharacter.prototype.weaponSlotClicked = function (slot) {
	if (gs.activeCharacter !== this || !this.isReadyForInput()) {
		return;
	}
	
	if (slot.hasItem()) {
		this.inventory.lastWeaponIndex = this.inventory.weaponIndex;
		this.inventory.weaponIndex = slot.index;
		gs.playSound(this.inventory.getWeapon().getSound(), this.tileIndex);
		
		this.updateStats();
		this.onEquipItem(this.inventory.getWeapon());
		
		if (gs.state === 'CHARACTER_MENU_STATE') {
			gs.characterMenu.refresh();
		}
		else {
			this.popUpText(gs.capitalSplit(this.inventory.getWeapon().type.name), '#ffffff');
		}
	}
};

// ON_EQUIP_ITEM:
// ************************************************************************************************
PlayerCharacter.prototype.onEquipItem = function (item) {
	
	
	if (item.type.slot === 'charm' && item.type.useEffect) {
		this.addAbility(item.type.useEffect);
		item.charges = 0;
		item.chargeTimer = 0;
		
		if (gs.debugProperties.disableMana) {
			item.charges = 1;
		}
	}
	
	this.statusEffects.onChangeEquipment();
	this.updateTerrainEffects();
};

// ON_UNEQUIP_ITEM:
// ************************************************************************************************
PlayerCharacter.prototype.onUnequipItem = function (item) {
	
	
	if (item.type.slot === 'charm' && item.type.useEffect) {
		this.removeAbility(item.type.useEffect);
		item.charges = 0;
		item.chargeTimer = 0;
	}
	
	this.statusEffects.onChangeEquipment();
	this.updateTerrainEffects();
};

// CONSUMABLE_SLOT_CLICKED:
// ************************************************************************************************
PlayerCharacter.prototype.consumableSlotClicked = function (slot) {
	var itemType = slot.item.type;
	
	if (gs.activeCharacter !== this || !this.isReadyForInput()) {
		return;
	}
	
	// Block mummy eating:
	if (this.race.name === 'Mummy' && itemType.edible) {
		this.popUpText('Cannot Eat', '#ffffff');	
		return;
	}
	
	// Cancel use ability:
	if (gs.state === 'USE_ABILITY_STATE') {
		gs.pc.cancelUseAbility();
		return;		
	}
	
	// Sound:
	if (itemType.sound) {
		gs.playSound(itemType.sound, this.tileIndex);
	} 
	else {
		gs.playSound(gs.sounds.potion, this.tileIndex); 
	}
		
	// Effect happens immediately:
	if (itemType.useEffect && itemType.useEffect.useImmediately) {
		itemType.useEffect.useOn(this, null, slot.item);
		
		this.endTurn(100);
	}
	// Status Effect:
	else if (itemType.statusEffectName) {
		this.statusEffects.add(itemType.statusEffectName);
		this.endTurn(100);
	}
	// Ability:
	else {
		this.selectedAbility = {type: itemType.useEffect};
		this.selectedItem = slot.item;

		gs.state = 'USE_ABILITY_STATE';

		gs.playSound(gs.sounds.spell, gs.pc.tileIndex);
		
		// Popup Text:
		this.popUpText(gs.capitalSplit(this.selectedAbility.type.name), '#ffffff');


		// Particle Generator:
		if (this.particleGenerator) {
			this.particleGenerator.isAlive = false;
		}

		if (this.selectedAbility.type.particleColor) {
			this.particleGenerator = gs.createCastingParticle(this.tileIndex, this.selectedAbility.type.particleColor);
		}
	}
	
	// Use charges:
	if (slot.item.charges && itemType.useEffect && itemType.useEffect.useImmediately) {
		slot.item.charges -= 1;
			
		// Wands:
		if (slot.item.charges === 0) {
			slot.removeItem(1);
		}
	}
	// Remove consumable (not charges)
	// Testing for USE_ABILITY_STATE so that targetable scrolls can be canceled
	else if (!slot.item.charges && slot.item.type.name !== 'ScrollOfEnchantment' && slot.item.type.name !== 'ScrollOfAcquirement' && gs.state !== 'USE_ABILITY_STATE') {
		slot.removeItem(1);
	}
	
	// Update stats:
	this.updateStats();
};

// CANCEL_USE_ABILITY:
// ************************************************************************************************
PlayerCharacter.prototype.cancelUseAbility = function () {
	gs.state = 'GAME_STATE';
	this.selectedScroll = null;
	this.selectedAbility = null;
	this.selectedItem = null;
	
	gs.playSound(gs.sounds.scroll, this.tileIndex);

	if (this.particleGenerator) {
		this.particleGenerator.isAlive = false;
	}
};

// WAIT_CLICKED:
// ************************************************************************************************
PlayerCharacter.prototype.waitClicked = function () {
	if (gs.activeCharacter !== this) {
		return;
	}
	
	// Rest:
	if (gs.keys.shift.isDown) {
		if (gs.numVisibleNPCs() === 0) {
			this.rest();
		}
		else {
			this.popUpText('附近有敌人!', '#ff0000');
		}
	}
	// Wait:
	else {
		this.actionQueue = [{type: 'WAIT'}];
		this.popUpText('等待', '#ffffff');
	}
};

// REST:
// Rest until either HP or EP is full (whichever takes less time)
// ************************************************************************************************
PlayerCharacter.prototype.rest = function () {
	var hpTime, epTime, min;
	
	// Rest until recovery:
	if (this.currentHp < this.maxHp || this.currentMp < this.maxMp) {
		hpTime = this.hpRegenTime * (this.maxHp - this.currentHp);
		epTime = this.mpRegenTime * (this.maxMp - this.currentMp);
	
		if (this.currentHp === this.maxHp) {
			min = epTime;
		}
		else if (this.currentMp === this.maxMp) {
			min = hpTime;
		}
		else {
			min = Math.min(hpTime, epTime);
		}
	}
	// Rest 10 turns:
	else {
		min = 10;
	}
	
		
	this.actionQueue = [];
	for (let i = 0; i < min; i += 1) {
		this.actionQueue.push({type: 'WAIT'});
	}
	
	this.popUpText('REST ' + min, '#ffffff');
};

// GAIN_EXPERIENCE:
// ************************************************************************************************
PlayerCharacter.prototype.gainExperience = function (amount) {
	if (!this.isAlive) {
		return;
	}
	
	// Apply exp modifiers:
	amount = Math.floor(amount * this.expMod);

	if (isNaN(amount)) {
		throw 'gainExperience NaN';
	}

	// Increase experience:
	if (this.level < MAX_LEVEL) {
		this.exp += amount;
	}

	// Check for level up:
	while (this.exp >= gs.expPerLevel[this.level + 1]) {
		this.gainLevel();
	}
};

// LOSE_EXP:
// ************************************************************************************************
PlayerCharacter.prototype.loseExp = function (amount) {
	if (this.exp - amount < gs.expPerLevel[this.level]) {
		this.exp = gs.expPerLevel[this.level];
	} else {
		this.exp -= amount;
	}
};

// GO_TO_SLEEP:
// ************************************************************************************************
PlayerCharacter.prototype.goToSleep = function () {};

// GAIN_LEVEL:
// ************************************************************************************************
PlayerCharacter.prototype.gainLevel = function () {
	if (!this.isAlive) {
		return;
	}
	
	// Sound:
	gs.playSound(gs.sounds.levelUp, this.tileIndex);

	this.level += 1;
	
	help.levelUpDialog();

	// Attributes:
	if (this.level % 3 === 0) {
		gs.openAttributeGainMenu();
	}
	// Talent Points:
	else {
		this.talentPoints += 1;
	}

	// Talent and Skill Points:
	this.skillPoints += SKILL_POINTS_PER_LEVEL;
	
	this.updateStats();

	
	// Restore HP and EP to full:
	this.currentHp = this.maxHp;
	this.currentMp = this.maxMp;
	this.resetAllCoolDowns();
	
	
	// Pop Up Text:
	this.queuePopUpText('LEVEL UP',  '#ffff00');
	
	// Effect:
	gs.createEXPEffect(this.tileIndex);
	
	gs.logExperienceLevel();
};

// CAN_GAIN_SKILL:
// ************************************************************************************************
PlayerCharacter.prototype.canGainSkill = function (skillName) {
	return this.skillPoints > 0 && this.skills[skillName] < MAX_SKILL;
};

// GAIN_SKILL:
// ************************************************************************************************
PlayerCharacter.prototype.gainSkill = function (skillName) {
	if (this.canGainSkill(skillName)) {
		this.skillPoints -= 1;
		this.skills[skillName] += 1;
		this.updateStats();
		
		if (skillName === 'Fortitude') {
			this.currentHp += HP_PER_SKILL;
		}
		else if (skillName === 'Focus') {
			this.currentMp += MP_PER_SKILL;
		}
		
		this.capStats();
	}
};

// GET_RANDOM_SKILL_NAME:
// Returns the name of a random, upgradable skill
// ************************************************************************************************
PlayerCharacter.prototype.getRandomSkillName = function () {
	let list = SKILL_NAMES.filter(skillName => this.skills[skillName] < MAX_SKILL);
	return list.length > 0 ? util.randElem(list) : null;
};

// AGRO_PLAYER:
// Called when a character is confused so must handle for player
// ************************************************************************************************
PlayerCharacter.prototype.agroPlayer = function () {};

// ON_TAKE_DAMAGE:
// ************************************************************************************************
PlayerCharacter.prototype.onTakeDamage = function () {
	gs.hasNPCActed = true;
	
	if (this.currentHp < this.maxHp * 0.25) {
		gs.logCriticalMoment();
	}
	
	if (this.isAsleep) {
		this.isAsleep = false;
	}
};

// DEATH:
// ************************************************************************************************
PlayerCharacter.prototype.death = function (damageType, flags) {
	// Avoid killing the player twice in a single turn:
	if (!this.isAlive) {
		return;
	}
	
	// Burning self to death:
	if (damageType === 'Fire' && flags.killer === this) {
		gs.deathText = '被烧死';
	} 
	// Fire Shroom:
	else if (flags.killer === 'FireShroom') {
		gs.deathText = '被烧死在火堆里';
	}
	//Fire Glyph:
	else if (flags.killer === 'FireGlyph') {
		gs.deathText = '被一个爆炸的字形烧死了';
	}
	// Spike Trap:
	else if (flags.killer === 'SpikeTrap') {
		gs.deathText = '被尖峰刺穿';
	}
	// Bear Trap:
	else if (flags.killer === 'BearTrap') {
		gs.deathText = '被熊陷阱杀死';
	}
	// Killed Self:
	else if (flags.killer === 'Lava') {
		gs.deathText = '在熔岩池中被烧死';
	}
	// Gas:
	else if (flags.killer === 'Gas') {
		gs.deathText = '在有毒的气体中窒息而死';	
	} 
	// Killed self:
	else if (flags.killer === this) {
		gs.deathText = '自杀了';
	}
	// Unique Killer:
	else if (flags.killer && flags.killer.type && flags.killer.type.isUnique) {
		gs.deathText = '被' + translator.getText(flags.killer.type.niceName) + '杀死了';
	}
	// Killer:
	else if (flags.killer && flags.killer.type) {
		gs.deathText = '被一只' + translator.getText(flags.killer.type.niceName) + '杀死了';
	}
	// Pit:
	else if (flags.killer && flags.killer === 'Pit') {
		gs.deathText = '摔死了';
	}
	// Generic:
	else {
		gs.deathText = '死掉了';
	}

	this.isAlive = false;
	this.currentHp = 0;
	this.poisonDamage = 0;
	
	this.updateUIFrame();
	
	// Life Saving:
	if (this.hasLifeSaving) {
		gs.openLifeSavingMenu();
	}
	// Actual death (clear save):
	else {
		if (!gs.debugProperties.allowRespawn) {
			gs.logGameRecord(gs.deathText, false);
			gs.clearGameData();
		}
		
		gs.openDeathMenu();
	}
};

// GAIN_RAGE:
// ************************************************************************************************
PlayerCharacter.prototype.gainRage = function (amount) {
	if (this.hasRage && this.rage < this.maxRage) {
		this.rage += amount;
		this.rageTimer = 0;
	}
	
	// Reduce Cooldowns:
	this.abilities.tickShortCoolDowns(this.rage);
};

// GAIN_FOOD:
// ************************************************************************************************
PlayerCharacter.prototype.gainFood = function (amount) {
	this.currentFood += 1;
	this.currentFood = Math.min(this.maxFood, this.currentFood);
};

// ON_KILL:
// ************************************************************************************************
PlayerCharacter.prototype.onKill = function (character) {};

// EXP_PERCENT:
// ************************************************************************************************
PlayerCharacter.prototype.expPercent = function () {
	var expToLevel = this.exp - gs.expPerLevel[this.level],
		totalExpToLevel = gs.expPerLevel[this.level + 1] - gs.expPerLevel[this.level];
	return Math.floor(expToLevel / totalExpToLevel * 100);

};

// START_EXPLORING:
// ************************************************************************************************
PlayerCharacter.prototype.startExploring = function () {
	var tileIndex;

	if (gs.activeCharacter !== this || gs.state !== 'GAME_STATE') {
		return;
	}
	
	if (gs.numVisibleNPCs() === 0) {
		tileIndex = gs.findUnexploredTileIndex(this.tileIndex);
		if (tileIndex) {
			this.clickTileIndex(tileIndex, false, true);
			this.isExploring = true;
		} 
		else if (gs.unexploredTilesRemaining()) {
			tileIndex = gs.findUnexploredTileIndex(this.tileIndex, true);
			if (tileIndex) {
				this.clickTileIndex(tileIndex, false, true);
				this.isExploring = true;
			} 
			else {
				this.popUpText('部分探索', '#ffffff');
				this.stopExploring();
			}
		}
		else {
			this.popUpText('全部探索完毕', '#ffffff');
			this.stopExploring();
		}
	} 
	else {
		this.popUpText('附近有敌人!', '#ff0000');
		this.stopExploring();
	}
};

// STOP_EXPLORING:
// ************************************************************************************************
PlayerCharacter.prototype.stopExploring = function () {
	this.isExploring = false;
	//this.fastMove = false;
	this.actionQueue = [];
	
	// Just in case something calls us while we're multimoving:
	this.statusEffects.remove('Sprint');
	this.statusEffects.remove('Charge');
};



// ADD_ABILITY:
// ************************************************************************************************
PlayerCharacter.prototype.addAbility = function (ability) {
	var abilitySlot;
	
	// Add ability to abilities:
	abilitySlot = this.abilities.addAbility(ability);
			
	// Add ability to UI:
	gs.HUD.abilityBar.addAbility(abilitySlot);
};

// REMOVE_ABILITY:
// ************************************************************************************************
PlayerCharacter.prototype.removeAbility = function (ability) {
	var abilitySlot;
	
	abilitySlot = this.abilities.removeAbility(ability);
	
	gs.HUD.abilityBar.removeAbility(abilitySlot);
};

// GET_UNAVAILABLE_TALENT:
// Returns a talent that the player does not currenctly have
// Used from book shelves
// ************************************************************************************************
PlayerCharacter.prototype.getUnavailableTalent = function () {
	var list = gs.talentList.slice(0);
	
	list = list.filter(talent => !this.hasTalent(talent.name));
	list = list.filter(talent => !gs.inArray(talent.name, this.availableTalents));
	list = list.filter(talent => !talent.neverDrop);
	
	return list.length > 0 ? util.randElem(list) : null;
};

// CAN_LEARN_TALENT:
// Can the player learn the next level of the talent
// ************************************************************************************************
PlayerCharacter.prototype.canLearnTalent = function (talentName) {
	var talentType = gs.talents[talentName],
		level;
	
	if (!talentType) throw talentName + ' is not a valid talent name';

	// Set the next level:
	if (this.hasTalent(talentName)) {
		level = this.getTalent(talentName).level + 1;
	}
	else {
		level = 1;
	}
	
	// Does the talent have a next level:
	if (level > talentType.level.length) {
		return false;
	}

	if (this.talentPoints <= 0) {
		return false;
	}
	
	if (this.level < talentType.level[level - 1]) {
		return false;
	}

	return true;
};

// LEARN_TALENT:
// ************************************************************************************************
PlayerCharacter.prototype.learnTalent = function (talentName, level) {
	var talentType = gs.talents[talentName];
	
	if (gs.inArray(talentName, this.availableTalents)) {
		gs.removeFromArray(talentName, this.availableTalents);
	}
	
	// Set the next level:
	if (!level) {
		if (this.hasTalent(talentName)) {
			level = this.getTalent(talentName).level + 1;
		}
		else {
			level = 1;
		}
	}
	
	// Learning a talent for the first time:
	if (!this.hasTalent(talentName)) {
		// Adding the associated ability:
		if (talentType.ability) {
			this.addAbility(talentType.ability);
		}
		
		this.talents.push({
			type: talentType,
			level: level
		});
	}
	// Upgrading an existing talent:
	else {
		this.getTalent(talentName).level = level;
	}
		
	this.talentPoints -= 1;

	this.updateStats();
	
	if (talentType.onLearn) {
		talentType.onLearn(this);
	}
};

// ADD_AVAILABLE_TALENTS:
// ************************************************************************************************
PlayerCharacter.prototype.addAvailableTalents = function (list) {
	list.forEach(function (talentName) {
		if (!gs.inArray(talentName, this.availableTalents) && !this.hasTalent(talentName)) {
			
			if (!gs.talents.hasOwnProperty(talentName)) {
				throw 'addAvailableTalents() - not a valid talentName: ' + talentName;
			}
			
			this.availableTalents.push(talentName);
		}
	}, this);
	
	// Sort the list by level:
	this.availableTalents.sort((a, b) => gs.talents[a].level[0] - gs.talents[b].level[0]);
};

// ADD_BOOK_TALENTS:
// ************************************************************************************************
PlayerCharacter.prototype.addBookTalents = function (book) {
	this.addAvailableTalents(book.talents);
};

// GET_TALENT:
// ************************************************************************************************
PlayerCharacter.prototype.getTalent = function (talentName) {
	return this.talents.find(talent => talent.type.name === talentName);
};

// GET_TALENT_LEVEL:
// ************************************************************************************************
PlayerCharacter.prototype.getTalentLevel = function (talentName) {
	if (this.getTalent(talentName)) {
		return this.getTalent(talentName).level;
	}
	else {
		return 0;
	}
};

// HAS_TALENT:
// Returns true if the player has learned the talent
// ************************************************************************************************
PlayerCharacter.prototype.hasTalent = function (talentName) {
	return Boolean(this.getTalent(talentName));
};

// HAS_AVAILABLE_TALENT:
// returns true if the player has learned the talent or has it available
// ************************************************************************************************
PlayerCharacter.prototype.hasAvailableTalent = function (talentName) {
	return this.hasTalent(talentName) || Boolean(this.availableTalents.find(name => name === talentName));
};
// SET_RELIGION:
// ************************************************************************************************
PlayerCharacter.prototype.setReligion = function (religionName) {
	if (!gs.religionTypes[religionName]) {
		throw 'Invalid religionName: ' + religionName;
	}

	this.religion = religionName;
	
	if (gs.religionTypes[this.religion].onSet) {
		gs.religionTypes[this.religion].onSet(this);
	}
};

// RANDOM_TELEPORT:
// Use this function to randomly teleport the player to a random open tileIndex in the level
// ************************************************************************************************
PlayerCharacter.prototype.randomTeleport = function () {
	this.teleportTo(gs.getOpenIndexInLevel());
};

// TELEPORT_TO:
// Use this function to teleport the player to a specified tileIndex
// ************************************************************************************************
PlayerCharacter.prototype.teleportTo = function (tileIndex) {
	this.stopExploring();
	
	this.body.snapToTileIndex(tileIndex);
	
	game.camera.focusOnXY(this.body.position.x + 104, this.body.position.y);
	gs.calculateLoS(true);
	
	gs.HUD.miniMap.refresh();
	
	this.statusEffects.onTeleport();
};

// GET_ACTIVE_SUMMON_LIST:
// Returns a list of characters that were summoned by the player and are present on the current level
// ************************************************************************************************
PlayerCharacter.prototype.getActiveSummonList = function () {
	return this.summonIDList.filter(id => gs.getCharWithID(id)).map(id => gs.getCharWithID(id));
};

// CORRODE_WEAPON:
// Will corrode the players weapon (subtract 1 mod)
// ************************************************************************************************
PlayerCharacter.prototype.corrodeWeapon = function () {
	if (this.inventory.getWeapon().type.name !== 'Fists' && this.inventory.getWeapon().type.name !== 'Staff' && this.inventory.getWeapon().mod > 0) {
		this.inventory.getWeapon().mod -= 1;
		this.queuePopUpText('Corroded ' + gs.capitalSplit(this.inventory.getWeapon().type.name), '#ffffff');
	}
};



// CREATE_PLAYER_TYPE:
// ************************************************************************************************
gs.createPlayerType = function () {
	var delta, i;

	// this.expPerLevel = [0, 0, 20];
	this.expPerLevel = [0, 0, 15];
	for (i = 3; i <= MAX_LEVEL; i += 1) {
		//this.expPerLevel[i] = this.expPerLevel[i - 1] + i * i * 3;
		if (i < 10) {
			this.expPerLevel[i] = this.expPerLevel[i - 1] + (i - 1) * (20 + i);
		}
		else {
			this.expPerLevel[i] = this.expPerLevel[i - 1] + (i - 1) * (20 + i * 2);
		}	
	}
	
	this.playerType = {
		name: 'Player',
		niceName: 'Player',
		frame: 656,
		movementSpeed: 1,
		protection: 0,
		resistance: {
			Fire: 0,
			Cold: 0,
			Toxic: 0,
			Shock: 0
		},
		bloodTypeName: 'Blood',
		damageShield: 0,
		evasion: 1,
		reflection: 0,
		size: CHARACTER_SIZE.MEDIUM,
		effectImmune: []
	};
};

// END_TURN:
// ************************************************************************************************
PlayerCharacter.prototype.endTurn = function (waitTime) {
	this.statusEffects.onEndTurn();
	this.waitTime = waitTime;
	this.attackDelay = Math.max(0, this.attackDelay - waitTime);
	gs.endTurn();
};

// SAVE:
// ************************************************************************************************
PlayerCharacter.prototype.save = function () {
	var data = {}, i;

	// Location:
	data.isDailyChallenge = gs.isDailyChallenge || false;
	data.seed = gs.seed;
	data.zoneName = gs.zoneName;
	data.zoneLevel = gs.zoneLevel;
	data.tileIndex = {x: this.tileIndex.x, y: this.tileIndex.y};
	data.branches = gs.branches;
	data.remainingAltars = gs.remainingAltars;
	data.nextCharacterID = gs.nextCharacterID;
	data.eventLog = gs.eventLog;
	data.nextCrystalChestGroupId = gs.nextCrystalChestGroupId;
	data.crystalChestGroupIsOpen = gs.crystalChestGroupIsOpen;
	
	// Keeping track of what has spawned already:
	data.previouslySpawnedUniques = gs.previouslySpawnedUniques;
	data.previouslySpawnedFeatures = gs.previouslySpawnedFeatures;
	data.previouslySpawnedStaticLevels = gs.previouslySpawnedStaticLevels;
	data.previouslySpawnedVaults = gs.previouslySpawnedVaults;
	data.previouslySpawnedItems = gs.previouslySpawnedItems;
	
	// Merchant Inventory:
	data.merchantInventory = gs.merchantInventory.toData();
	
	// Current Stats:
	data.currentHp = this.currentHp;
	data.currentMp = this.currentMp;
	data.currentFood = this.currentFood;
	data.baseStrength = this.baseStrength;
	data.baseIntelligence = this.baseIntelligence;
	data.baseDexterity = this.baseDexterity;
	data.permanentHpBonus = this.permanentHpBonus;
	data.permanentMpBonus = this.permanentMpBonus;
	data.rage = this.rage;
	data.summonIDList = this.summonIDList;
	data.poisonDamage = this.poisonDamage;
	
	// Level and Exp:
	data.exp = this.exp;
	data.level = this.level;
	
	
	data.savedTime = gs.gameTime();
	
	// Race, Class, and Religion:
	data.characterClass = this.characterClass;
	data.race = this.race.name;
	data.religion = this.religion;

	
	// Inventory:
	data.inventory = this.inventory.toData();
	
	// Abilities:
	data.abilities = this.abilities.toData();
	
	// Ability Bar:
	data.abilityBar = gs.HUD.abilityBar.toData();
	
	// Skills:
	data.skillPoints = this.skillPoints;
	data.skills = this.skills;
	
	// Talents:
	data.talentPoints = this.talentPoints;
	data.talentList = [];
	for (let i = 0; i < this.talents.length; i += 1) {
		data.talentList.push({
			name: this.talents[i].type.name,
			level: this.talents[i].level
		});
	}
	data.availableTalents = this.availableTalents;
	
	// Status Effects:
	data.statusEffects = this.statusEffects.toData();
	
	localStorage.setItem('PlayerData', JSON.stringify(data));
	
	gs.saveGlobalData();
};

// LOAD:
// ************************************************************************************************
PlayerCharacter.prototype.load = function () {
	var data = JSON.parse(localStorage.getItem('PlayerData'));

	gs.isDailyChallenge = data.isDailyChallenge || false;
	gs.seed = data.seed;
	gs.zoneName = null; // Need to add this to not save shit from the main menu level
	gs.changeLevel(data.zoneName, data.zoneLevel);
	gs.branches = data.branches;
	gs.savedTime = data.savedTime;
	gs.nextCharacterID = data.nextCharacterID;
	gs.eventLog = data.eventLog;
	gs.nextCrystalChestGroupId = data.nextCrystalChestGroupId;
	gs.crystalChestGroupIsOpen = data.crystalChestGroupIsOpen;
	
	// Keeping track of spawned stuff:
	gs.previouslySpawnedUniques = data.previouslySpawnedUniques;
	gs.previouslySpawnedFeatures = data.previouslySpawnedFeatures;
	gs.previouslySpawnedStaticLevels = data.previouslySpawnedStaticLevels;
	gs.previouslySpawnedVaults = data.previouslySpawnedVaults;
	gs.previouslySpawnedItems = data.previouslySpawnedItems;
	
	// Current Stats:
	this.currentHp = data.currentHp;
	this.currentMp = data.currentMp;
	this.currentFood = data.currentFood;
	this.baseStrength = data.baseStrength;
	this.baseIntelligence = data.baseIntelligence;
	this.baseDexterity = data.baseDexterity;
	this.permanentHpBonus = data.permanentHpBonus;
	this.permanentMpBonus = data.permanentMpBonus;
	this.summonIDList = data.summonIDList;
	this.poisonDamage = data.poisonDamage || 0;
	
	// Class and Race:
	this.characterClass = data.characterClass;
	this.race = gs.playerRaces[data.race];
	
	
	// Level and Exp:
	this.exp = data.exp;
	this.level = data.level;
	
	
	// Skills:
	this.skillPoints = data.skillPoints;
	this.skills = data.skills;
	
	// Religion:
	this.religion = data.religion;
	gs.remainingAltars = data.remainingAltars;
	
	// Rage:
	this.rage = data.rage || 0;
	
	// Merchent Inventory:
	gs.merchantInventory.loadData(data.merchantInventory);

	// Talents:
	this.talentPoints = data.talentPoints;
	for (let i = 0; i < data.talentList.length; i += 1) {
		this.talents.push({
			type: gs.talents[data.talentList[i].name],
			level: data.talentList[i].level
		});
	}
	this.availableTalents = data.availableTalents;

	// Inventory:
	this.inventory.loadData(data.inventory);
	
	// Abilities:
	this.abilities.loadData(data.abilities);
	
	// Ability Bar:
	gs.HUD.abilityBar.loadData(data.abilityBar);

	// Load Status Effects:
	this.statusEffects.loadData(data.statusEffects);
	
	this.sprite.frame = PLAYER_FRAMES[this.characterClass];
	this.type.frame = PLAYER_FRAMES[this.characterClass];
	this.updateStats();
	
	this.body.snapToTileIndex(data.tileIndex);
};

// GET_NEAREST_VISIBLE_NPC:
// ************************************************************************************************
gs.getNearestVisibleNPC = function () {
	var list = gs.getAllNPCs().filter(npc => npc.faction === FACTION.HOSTILE && gs.pc.canSeeCharacter(npc));
	list.sort((a, b) => util.distance(gs.pc.tileIndex, a.tileIndex) - util.distance(gs.pc.tileIndex, b.tileIndex));
	return list.length > 0 ? list[0] : null;
};