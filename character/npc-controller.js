/*global gs, util*/
/*global NPC*/
/*global FACTION*/
/*global RANDOM_MOVE_PERCENT, KITE_RANGE, LOS_DISTANCE*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// SHOULD_SKIP_TURN:
// ************************************************************************************************
NPC.prototype.shouldSkipTurn = function () {
	// Dead npcs skip turn:
	if (!this.isAlive) {
		return true;
	}

	// Stunned and sleeping npcs skip turn:
	// Hidden enemies never take a turn (remember that spot agro checks are made before testing this):
	if (this.isStunned || this.isAsleep || this.isHidden) {
		return true;
	}

	// Non agroed npcs skip turn unless they are wandering around:
	if (!this.isAgroed && !this.isWandering) {
		return true;
	}

	if (!this.isSlowProjectile && (this.faction === FACTION.NEUTRAL || this.faction === FACTION.DESTRUCTABLE)) {
		return true;
	}
};



// GET_NEW_FACING:
// ************************************************************************************************
NPC.prototype.getNewFacing = function (tileIndex) {
	var targetFace = this.getFacingToTarget(tileIndex);
	if (this.rotFacing === 'UP' && (targetFace === 'LEFT' || targetFace === 'DOWN')) {
		return 'LEFT';
	}
	if (this.rotFacing === 'UP' && targetFace === 'RIGHT') {
		return 'RIGHT';
	}
	if (this.rotFacing === 'LEFT' && (targetFace === 'DOWN' || targetFace === 'RIGHT')) {
		return 'DOWN';
	}
	if (this.rotFacing === 'LEFT' && targetFace === 'UP') {
		return 'UP';
	}
	if (this.rotFacing === 'DOWN' && (targetFace === 'RIGHT' || targetFace === 'UP')) {
		return 'RIGHT';
	}
	if (this.rotFacing === 'DOWN' && targetFace === 'LEFT') {
		return 'LEFT';
	}
	if (this.rotFacing === 'RIGHT' && (targetFace === 'UP' || targetFace === 'LEFT')) {
		return 'UP';
	}
	if (this.rotFacing === 'RIGHT' && targetFace === 'DOWN') {
		return 'DOWN';
	}
};

// GET_FACING_TO_TARGET:
// ************************************************************************************************
NPC.prototype.getFacingToTarget = function (tileIndex) {
	var angle = util.angleToFace(this.tileIndex, tileIndex);
	
	if (angle <= 270 && angle > 180) {
		return 'UP';
	} else if (angle <= 180 && angle > 90) {
		return 'RIGHT';
	} else if (angle <= 90 && angle > 0) {
		return 'DOWN';
	} else {
		return 'LEFT';
	}
};

// ROTATE_TO_FACE:
// ************************************************************************************************
NPC.prototype.rotateToFace = function () {
	if (this.rotFacing === 'UP') {
		this.sprite.angle = 180;
	} else if (this.rotFacing === 'DOWN') {
		this.sprite.angle = 0;
	} else if (this.rotFacing === 'LEFT') {
		this.sprite.angle = 90;
	} else {
		this.sprite.angle = 270;
	}
};


// PROCESS_ACTION_QUEUE:
// ************************************************************************************************
NPC.prototype.processActionQueue = function () {
	var action, tileIndex;
	
	// Get the next action in the queue:
	action = this.actionQueue.pop();
	tileIndex = action.tileIndex;
	
	// Moving:
	if (this.canMoveTo(tileIndex)) {
		gs.createCloud(this.tileIndex, 'Smoke', 0, 2);
		this.moveTo(tileIndex);
		
		// Reaching destination:
		if (action.type === 'DEATH') {
			gs.createExplosion(tileIndex, 1.5, this.burstDamage, {killer: this});
			this.death();
		}
	}
	// Hitting a wall or character:
	else {
		gs.createExplosion(this.tileIndex, 1.5, this.burstDamage, {killer: this});
		this.death();
	}
};

// CHOOSE_ACTION:
// ************************************************************************************************
NPC.prototype.chooseAction = function () {
	var validAbilityList, tileIndex = null, nearestHostile, char;

	if (this.lightningRodTileIndex && !gs.getObj(this.lightningRodTileIndex, 'LightningRod')) {
		this.lightningRodTileIndex = null;
	}
	
	if (this.body.state === 'MOVING') {
		return;
	}

	// Following an existing actionQueue:
	if (this.actionQueue && this.actionQueue.length > 0) {
		this.processActionQueue();
		return;
	}
	
	// NPC's detect player:
	if (!this.isAgroed && this.faction === FACTION.HOSTILE && util.frac() < this.detectPlayerPercent()) {
		this.tryToAgroPlayer();
		
		if (this.waitTime > 0) {
			this.endTurn(this.waitTime);
			return;
		}
	}
	
	// Allies are always counted as agroed i.e. active:
	if (this.faction === FACTION.PLAYER) {
		this.isAgroed = true;
	}

	// Skip turn:
	if (this.shouldSkipTurn()) {
		this.endTurn(100);
		return;
	}
	
	// Monsters keep shouting for help when agroed:
	if (this.isAgroed && this.faction === FACTION.HOSTILE) {
		this.shout();
	}

	nearestHostile = this.getNearestHostile();
	
	// Stop running:
	if (this.isRunning && this.currentHp >= this.maxHp / 2 && !this.statusEffects.has('Feared')) {
		this.isRunning = false;
		this.agroPlayer();
	}
	
	// ROTATION:
	if (this.type.rotateAim && nearestHostile && this.rotFacing !== this.getFacingToTarget(nearestHostile.tileIndex)) {
		this.rotFacing = this.getNewFacing(nearestHostile.tileIndex);
		this.rotateToFace();
		this.endTurn(200);
		return;
	}
	
	// MOVEMENT:
	if (this.canMove()) {
		
		// SLOW_PROJECTILE:
		if (this.isSlowProjectile) {
			// Moving:
			if (this.canMoveTo(this.tileIndex.x + this.moveDelta.x, this.tileIndex.y + this.moveDelta.y)) {
				gs.createCloud(this.tileIndex, 'Smoke', 0, 2);
				this.moveTo(this.tileIndex.x + this.moveDelta.x, this.tileIndex.y + this.moveDelta.y);
			}
			// Hitting solid:
			else {
				if (this.statusEffects.has('SlowCharge')) {
					
					char = gs.getChar(this.tileIndex.x + this.moveDelta.x, this.tileIndex.y + this.moveDelta.y);
					if (char) {
						gs.meleeAttack(this, char.tileIndex, this.statusEffects.get('SlowCharge').damage, {neverMiss: true});
					}
					this.statusEffects.remove('SlowCharge');
					this.endTurn(100);
				}
				else {
					this.death();
				}
				
			}
			return;
		} 
		
		// RUN AWAY:
		if (this.isRunning && nearestHostile) {
			tileIndex = this.getMoveAwayIndex(nearestHostile);
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// SEEKING_MARKED_PLAYER:
		if (!this.isAgroed && this.isWandering && gs.pc.isMarked) {
			tileIndex = this.getMoveTowardsIndex(gs.pc.tileIndex);
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// WANDERING:
		if (!this.isAgroed && this.isWandering && !gs.pc.isMarked) {
			tileIndex = this.getWanderIndex();
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// MOVE_RANDOM:
		if (this.isAgroed && this.type.isRandomMover && util.frac() < RANDOM_MOVE_PERCENT) {
			tileIndex = this.getRandomMoveIndex();
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// MOVE_AWAY (KITING):
		if (this.isAgroed &&
			this.type.isKiter
			&& nearestHostile
			&& util.distance(nearestHostile.tileIndex, this.tileIndex) <= KITE_RANGE
			&& gs.isRayPassable(this.tileIndex, nearestHostile)
			&& gs.getTile(this.tileIndex).visible
			&& util.frac() < 0.5) { // Changed 0.75 -> 0.5
			
			tileIndex = this.getMoveAwayIndex(nearestHostile);
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
	}
	
	// Use ability:
	if (this.isAgroed) {
		validAbilityList = this.getValidAbility();
		if (validAbilityList.length > 0) {
			// Returning to wait for player to complete movement
			if (gs.pc.body.state === 'MOVING') {
				this.state = 'PAUSE';
				return;
			}
			
			this.useAbility(util.randElem(validAbilityList));
			return;
		}
	}
	
	// MOVE_TOWARDS:
	if (this.isAgroed && this.canMove() && !this.isRunning) {
		if (nearestHostile) {
		
			// Moving to valid attack index (ranged enemies only):
			if (this.type.isKiter) {
				tileIndex = this.getNearestAttackIndex(nearestHostile);
				if (tileIndex) {
					tileIndex = this.getMoveTowardsIndex(tileIndex);
					if (tileIndex) {
						this.moveTo(tileIndex);
						return;
					}
				}
			}
			
			// Kiters end their turn here:
			if (this.type.isKiter
				&& util.distance(nearestHostile.tileIndex, this.tileIndex) <= KITE_RANGE + 1
				&& gs.isRayPassable(this.tileIndex, nearestHostile.tileIndex)) {
				this.endTurn(100);
				return;
			}
			
			// Moving towards target:
			tileIndex = this.getMoveTowardsIndex(nearestHostile.tileIndex);
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// FOLLOW_PLAYER (ALLIES):
		if (this.faction === FACTION.PLAYER) {
			tileIndex = this.getMoveTowardsIndex(gs.pc.tileIndex);
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// As a last resort, agroed npcs try to move towards the player:
		tileIndex = this.getMoveTowardsIndex(gs.pc.tileIndex);
		if (tileIndex) {
			this.moveTo(tileIndex);
			return;
		}
		
	}

	// End Turn:
	this.endTurn(100);
};


// GET_NEAREST_HOSTILE:
// ************************************************************************************************
NPC.prototype.getNearestHostile = function () {
	var list = gs.characterList.slice(0);
	
	if (this.isConfused) {
		list = list.filter(char => char.faction === FACTION.HOSTILE || char.faction === FACTION.PLAYER);
	}
	else if (this.faction === FACTION.PLAYER) {
		list = list.filter(char => char.faction === FACTION.HOSTILE);
		list = list.filter(char => char.isAgroed);
	}
	else if (this.faction === FACTION.HOSTILE) {
		list = list.filter(char => char.faction === FACTION.PLAYER);
	}
	else {
		list = [];
	}
	
	list = list.filter(char => char !== this);
	list = list.filter(char => util.distance(char.tileIndex, this.tileIndex) <= LOS_DISTANCE + 1);
	list = list.filter(char => gs.isRayClear(char.tileIndex, this.tileIndex));
	
	// Sorting to find nearest:
	list.sort((a, b) => util.distance(this.tileIndex, a.tileIndex) - util.distance(this.tileIndex, b.tileIndex));
	
	return list.length > 0 ? list[0] : null;
};

// GET_VALID_ABILITY:
// ************************************************************************************************
NPC.prototype.getValidAbility = function () {
	var validAbilities;

	validAbilities = this.abilities.list.filter(ability => ability);
	
	// Checking Energy and Cooldowns:
	validAbilities = validAbilities.filter(ability => ability.coolDown === 0);
	validAbilities = validAbilities.filter(ability => ability.type.mana <= this.currentMp);
	validAbilities = validAbilities.filter(ability => ability.type.canUse(this));

	// Finding a valid target:
	// Note: storing target in case getTarget uses rnd as in the case of projectiles:
	// No possible target will simply return null i.e. will not pass the filter
	validAbilities = validAbilities.filter(function (ability) {	
		ability.target = ability.type.getTarget(this);
		
		// Special test when targeting the player to make sure he is actually visible:
		if (ability.target && gs.vectorEqual(ability.target, gs.pc.tileIndex) && !gs.getTile(this.tileIndex).visible) {
			return false;
		}
		
		return ability.target;
	}, this);

	validAbilities = validAbilities.filter(ability => !ability.type.shouldUseOn || ability.type.shouldUseOn(this, ability.target));
	return validAbilities;
	
};


// GET_WANDER_INDEX:
// ************************************************************************************************
NPC.prototype.getWanderIndex = function () {
	var toTileIndex = {x: this.tileIndex.x + this.wanderVector.x,
					   y: this.tileIndex.y + this.wanderVector.y};

	if (this.canMoveTo(toTileIndex) && gs.isIndexSafe(toTileIndex)) {
		// Changing direction:
		if (util.frac() < 0.05) {
			this.wanderVector = this.newWanderVector();
		}
		
		return toTileIndex;
	}
	// Hit a wall:
	else {
		this.wanderVector = this.newWanderVector();
	}
	
	return null;
};

// NEW_WANDER_VECTOR:
// ************************************************************************************************
NPC.prototype.newWanderVector = function () {
	var vec = {};

	// Move to player:
	if (util.frac() < 0.10) {
		if (this.tileIndex.x < gs.pc.tileIndex.x) {
			vec.x = 1;
		} else if (this.tileIndex.x > gs.pc.tileIndex.x) {
			vec.x = -1;
		} else {
			vec.x = 0;
		}

		if (this.tileIndex.y < gs.pc.tileIndex.y) {
			vec.y = 1;
		} else if (this.tileIndex.y > gs.pc.tileIndex.y) {
			vec.y = -1;
		} else {
			vec.y = 0;
		}

		// Random move:
	} else {
		vec = {x: util.randInt(-1, 1), y: util.randInt(-1, 1)};
	}
	return vec;
};

// GET_MOVE_TOWARDS_INDEX:
// Returns the tileIndex that will move the NPC closest towards targetTileIndex
// ************************************************************************************************
NPC.prototype.getMoveTowardsIndex = function (targetTileIndex) {
	var path;

	if (this.tileIndex.x !== targetTileIndex.x || this.tileIndex.y !== targetTileIndex.y) {
		path = gs.findPath(this.tileIndex, targetTileIndex, {
			allowDiagonal: this.movementSpeed !== 0,
			avoidTraps: false,
			exploredOnly: false,
			passDoors: true,
			canWalkFunc: this.canMoveTo.bind(this),
			maxDepth: 100
		});
		
		// A* Path:
		if (path && path.length > 0 && path.length < 20 && this.canMoveTo(path[path.length - 1])) {
			return path[path.length - 1];
		}
		// Niave Path:
		else {
			// Right:
			if (this.tileIndex.x < targetTileIndex.x && this.canMoveTo(this.tileIndex.x + 1, this.tileIndex.y)) {
				return {x: this.tileIndex.x + 1, y: this.tileIndex.y};
			}
			// Left:
			else if (this.tileIndex.x > targetTileIndex.x && this.canMoveTo(this.tileIndex.x - 1, this.tileIndex.y)) {
				return {x: this.tileIndex.x - 1, y: this.tileIndex.y};
			}
			// Up:
			else if (this.tileIndex.y > targetTileIndex.y && this.canMoveTo(this.tileIndex.x, this.tileIndex.y - 1)) {
				return {x: this.tileIndex.x, y: this.tileIndex.y - 1};
			}
			// Down:
			else if (this.tileIndex.y < targetTileIndex.y && this.canMoveTo(this.tileIndex.x, this.tileIndex.y + 1)) {
				return {x: this.tileIndex.x, y: this.tileIndex.y + 1};
			}
		}
	}
	
	return null;
};

// GET_MOVE_AWAY_INDEX:
// Get an index which will move this character away from hostileCharacter
// ************************************************************************************************
NPC.prototype.getMoveAwayIndex = function (hostileCharacter) {
	var indexList;
	
	indexList = gs.getIndexInRadius(this.tileIndex, 1);
	indexList = indexList.filter(index => this.canMoveTo(index));
	
	// No tiles to go to:
	if (indexList.length === 0) {
		return null;
	}
	
	// Find the tile thats furthest from the player:
	indexList.sort((a, b) => util.distance(hostileCharacter.tileIndex, b) - util.distance(hostileCharacter.tileIndex, a));
	
	if (util.distance(hostileCharacter.tileIndex, indexList[0]) > util.distance(hostileCharacter.tileIndex, this.tileIndex)) {
		return indexList[0];
	} 
	else {
		return null;
	}
};

// GET_RANDOM_MOVE_INDEX:
// ************************************************************************************************
NPC.prototype.getRandomMoveIndex = function () {
	var indexList;
	
	indexList = gs.getIndexListAdjacent(this.tileIndex);
	indexList = indexList.filter(index => this.canMoveTo(index));
	
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_NEAREST_ATTACK_INDEX:
// ************************************************************************************************
NPC.prototype.getNearestAttackIndex = function (nearestHostile) {
	var indexList, pred;
	
	// Override for lightning rod:
	if (this.lightningRodTileIndex) {
		return this.getLightningRodAttackIndex(nearestHostile);
	}
	
	pred = function (tileIndex) {
		return this.canMoveTo(tileIndex);
	}.bind(this);
	
	indexList = gs.getIndexInFlood(this.tileIndex, pred, 3);
	indexList = indexList.filter(index => gs.isRayPassable(index, nearestHostile.tileIndex));
	indexList.sort((a, b) => util.distance(this.tileIndex, a) - util.distance(this.tileIndex, b));
	
	return indexList.length > 0 ? indexList[0] : null;
};

// GET_LIGHTNING_ROD_ATTACK_INDEX:
// ************************************************************************************************
NPC.prototype.getLightningRodAttackIndex = function (nearestHostile) {
	var pred, indexList;
	
	pred = function (tileIndex) {
		return this.canMoveTo(tileIndex);
	}.bind(this);
	
	indexList = gs.getIndexInFlood(this.tileIndex, pred, 3);
	indexList = indexList.filter(index => gs.abilityTypes.SummonLightningRod.isTargetInPath(index, nearestHostile.tileIndex, this.lightningRodTileIndex));
	indexList.sort((a, b) => util.distance(this.tileIndex, a) - util.distance(this.tileIndex, b));
	
	if (indexList.length > 0) {
		console.log(indexList[0]);
	}
	
	return indexList.length > 0 ? indexList[0] : null;
};

// SHOULD_START_RUNNING:
// ************************************************************************************************
NPC.prototype.shouldStartRunning = function () {
	return this.currentHp > 0 
		&& this.currentHp <= Math.round(this.maxHp * 0.25) 
		&& util.frac() <= 0.25 
		&& !this.statusEffects.has('Berserk') 
		&& !this.type.neverRun;
};