/*global gs, util*/
/*global TIME_SCALAR, TILE_SIZE*/
/*global KNOCK_BACK_SPEED, FAST_MOVEMENT_SPEED, MOVEMENT_SPEED, KEYBOARD_MOVEMENT_SPEED*/
/*global CHARACTER_SIZE*/
/*jshint esversion: 6*/
'use strict';

var pcx, pcy;

// CHARACTER_BODY:
// ************************************************************************************************
function CharacterBody (character) {
	this.character = character;
	
	this.state = 'WAITING';
	this.tileIndex = {x: 0, y:  0};
	this.position = {x: 0, y: 0};
	this.offset = {x: 0, y: 0};
	this.walkBounce = 'UP';
	this.facing = 'RIGHT';
	this.isKnockBack = false;
	
	// Make sure to give player an initial tileIndex:
	this.character.tileIndex = {x: 0, y: 0};
}

// MOVE_TO_TILE_INDEX:
// Will perform a tween setting this.state to 'MOVING'
// ************************************************************************************************
CharacterBody.prototype.moveToTileIndex = function (tileIndex) {
	// Set facing:
	if (!this.isKnockBack) {
		if (tileIndex.x < this.tileIndex.x) {
        	this.facing = 'LEFT';
		} else if (tileIndex.x > this.tileIndex.x) {
			this.facing = 'RIGHT';
		}
	}
	
	
	this.setTileIndex(tileIndex);
	this.state = 'MOVING';
};

// SNAP_TO_TILE_INDEX:
// Will instantly snap position
// ************************************************************************************************
CharacterBody.prototype.snapToTileIndex = function (tileIndex) {
	this.setTileIndex(tileIndex);
	this.position.x = this.destinationPos().x;
    this.position.y = this.destinationPos().y;
	this.finishTween();
};

// SET_TILE_INDEX:
// ************************************************************************************************
CharacterBody.prototype.setTileIndex = function (tileIndex) {
	// Remove from previous tile:
	if (gs.getTile(this.tileIndex) && gs.getTile(this.tileIndex).character === this.character) {
		gs.getTile(this.tileIndex).character = null;
	}
	
	// Set new tileIndex:
    this.tileIndex.x = tileIndex.x;
    this.tileIndex.y = tileIndex.y;
	
	// Update characters tileIndex
	this.character.tileIndex.x = tileIndex.x;
	this.character.tileIndex.y = tileIndex.y;
	
	// Update global pc tileIndex (easy access when debugging):
	if (this.character === gs.pc) {
		pcx = this.tileIndex.x;
		pcy = this.tileIndex.y;
	}
	
	// Enter new tile:
	gs.getTile(this.tileIndex).character = this.character;
};

// ON_UPDATE_FRAME:
// ************************************************************************************************
CharacterBody.prototype.onUpdateFrame = function () {
	this.tweenPosition();
	this.handleKnockBack();
	this.updateFrameWalkBounce();
	
	// End turn if the sprite has arived at its destination:
	if (this.state === 'MOVING' && this.isAtDestination()) {
        this.finishTween();
    }
};

// FINISH_TWEEN:
// ************************************************************************************************
CharacterBody.prototype.finishTween = function () {
	this.state = 'WAITING';
	this.isKnockBack = false;
		
	this.character.onEnterTile();

	if (this.character.type.name === 'Penguin') {
		this.character.sprite.frame = this.character.type.frame; // resetting penguin slide
	}
};

// UPDATE_FRAME_WALK_BOUNCE:
// ************************************************************************************************
CharacterBody.prototype.updateFrameWalkBounce = function () {
	// Walk bounce:
	if (this.state === 'MOVING' && gs.pc.fastMove !== 2) {
		
		if (this.walkBounce === 'UP') {
			this.offset.y -= 0.4 * TIME_SCALAR;
			if (this.offset.y <= -3) {
				this.walkBounce = 'DOWN';
			}
		} 
		else if (this.walkBounce === 'DOWN') {
			this.offset.y += 0.4 * TIME_SCALAR;
			if (this.offset.y >= 0) {
				this.walkBounce = 'UP';
			}
		}
	} 
	else {
		this.offset.y *= 0.75 / TIME_SCALAR;
		this.offset.x *= 0.75 / TIME_SCALAR;
	}

	
};

// IS_AT_DESTINATION:
// ************************************************************************************************
CharacterBody.prototype.isAtDestination = function () {	
	return util.distance(this.position, this.destinationPos()) <= this.tweenSpeed();
};

// DESTINATION_POS:
// ************************************************************************************************
CharacterBody.prototype.destinationPos = function () {
	return util.toPosition(this.tileIndex);
};

// HANDLE_KNOCK_BACK:
// ************************************************************************************************
CharacterBody.prototype.handleKnockBack = function () {
	let tempTileIndex = gs.toTileIndex(this.position);
	
	// Handling knock back through traps:
	// Notice that we only handle the case in which the player is passing through a tile
	// The case in which the player has arived at the tile can be handled by standard method
	if (this.isKnockBack && !gs.vectorEqual(tempTileIndex, this.tileIndex)) {
		let obj = gs.getObj(tempTileIndex, obj => obj.type.activate);
		if (obj) {
			// We temporarily place the character on the tileIndex in order to trigger the trap
			gs.getTile(tempTileIndex).character = this.character;
			obj.stepOn(this.character);
			gs.getTile(tempTileIndex).character = null;
			
			// If the trap has immobalised the character he needs to halt movement:
			// This will stop his knockback completely
			if (this.character.isImmobile && this.character.isAlive) {
				this.snapToTileIndex(tempTileIndex);
			}
		}
	}
};

// TWEEN_POSITION:
// ************************************************************************************************
CharacterBody.prototype.tweenPosition = function () {
	var speed = this.tweenSpeed(),
		normal = util.normal(this.position, this.destinationPos());
	
	if (this.isAtDestination() || gs.pc.fastMove === 2) {
		this.position.x = this.destinationPos().x;
		this.position.y = this.destinationPos().y;
	}
	else {
		this.position.x += normal.x * speed;
		this.position.y += normal.y * speed;
	}
};

// TWEEN_SPEED:
// ************************************************************************************************
CharacterBody.prototype.tweenSpeed = function () {	
	if (this.isKnockBack) {
		return KNOCK_BACK_SPEED;
	}
	else if (gs.pc && gs.pc.fastMove) {
		return FAST_MOVEMENT_SPEED;
	}
	else {
		return MOVEMENT_SPEED;
	}
};

// APPLY_KNOCK_BACK:
// ************************************************************************************************
CharacterBody.prototype.applyKnockBack = function (normalVec, numTiles) {
	var toTileIndex;
	
	// Immobile enemies (nests, statues, etc.) can never be knocked back:
	if (this.character.type.cantMove || this.character.isImmobile) {
		return;
	}
	
	// Size multiplier:
	if (this.character.size === CHARACTER_SIZE.SMALL) {
		numTiles = numTiles * 2;
	}
	else if (this.character.size === CHARACTER_SIZE.LARGE) {
		numTiles = Math.floor(numTiles / 2);
	}
	
    toTileIndex = this.getKnockBackIndex(normalVec, numTiles);
    
	if (!gs.vectorEqual(toTileIndex, this.tileIndex)) {
		this.isKnockBack = true;
		
		if (this.character !== gs.pc) {
			this.character.waitTime = 100;
		}
		
		this.moveToTileIndex(toTileIndex);
	}
	
	if (this.character === gs.pc) {
		gs.hasNPCActed = true;
	}
};

// GET_KNOCK_BACK_INDEX:
// ************************************************************************************************
CharacterBody.prototype.getKnockBackIndex = function (normalVec, numTiles) {
	var startPosition = util.toPosition(this.tileIndex),
        currentPosition = {x: startPosition.x, y: startPosition.y},
		nextPosition,
        step = 4,
        currentDistance = 0,
		newTileIndex = this.tileIndex;
	
	for (currentDistance = 0; currentDistance <= numTiles * TILE_SIZE; currentDistance += step) {
		nextPosition = {x: startPosition.x + normalVec.x * currentDistance, y: startPosition.y + normalVec.y * currentDistance};
		
		if (!gs.vectorEqual(gs.toTileIndex(nextPosition), this.tileIndex) && !gs.isPassable(gs.toTileIndex(nextPosition))) {
			break;
		}
        currentPosition = nextPosition;
    }
	
	return gs.toTileIndex(currentPosition);
};

// FACE_TILE_INDEX:
// Used when attacking to face the direction of attack
// ************************************************************************************************
CharacterBody.prototype.faceTileIndex = function (tileIndex) {
	if (this.character.type.rotateAim) {
		return;
	}
	
	// Face target:
    if (tileIndex.x >= this.tileIndex.x) {
        this.facing = 'RIGHT';
    } else {
        this.facing = 'LEFT';
    }
};

// BOUNCE_TOWARDS:
// Used during attacks to give a bit of animation
// ************************************************************************************************
CharacterBody.prototype.bounceTowards = function (tileIndex) {
	var normal;
	
	if (gs.vectorEqual(tileIndex, this.tileIndex)) {
		normal = {x: 0, y: 0};
	}
	else {
		normal = util.normal(this.tileIndex, tileIndex);
	}
	
	this.offset.x = normal.x * 10;
	this.offset.y = normal.y * 10;
};