/*global gs, console, util*/
/*global SCALE_FACTOR, MOVEMENT_SPEED*/
/*jshint esversion: 6*/

'use strict';

// CREATE_CLOUD_TYPES:
// ************************************************************************************************
gs.createCloudTypes = function () {
	this.cloudUpdateTurn = {};
	this.cloudCharacterTurnEffect = {};
	this.cloudOnEnterTile = {};
	this.cloudOnDestroy = {};
	
	// POISON_GAS_UPDATE_TURN:
	this.cloudUpdateTurn.PoisonGas = function () {
		var newGas;

		if (this.life > this.startLife * 0.75) { 
			gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
				if (gs.isTileIndexTransparent(tileIndex) && !gs.getCloud(tileIndex)) {
					newGas = gs.createCloud(tileIndex, this.type.name, this.damage, this.life - 1);
					newGas.startLife = this.startLife;
				}
			}, this);
		} 
	};
	
	// SMOKE_UPDATE_TURN:
	this.cloudUpdateTurn.Smoke = function () {
		if (this.sprite.frame === this.type.frame) {
			this.sprite.frame = this.type.frame + 1;
		}
	};
	
	// POISON_GAS_CHARACTER_TURN_EFFECT:
	this.cloudCharacterTurnEffect.PoisonGas = function (character) {
		if (!character.type.gasImmune) {
			character.takeDamage(this.damage, 'Toxic', {killer: 'Gas'});
		}
	};
	
	// FLAMING_CLOUD_CHARACTER_TURN_EFFECT:
	this.cloudCharacterTurnEffect.FlamingCloud = function (character) {
		if (!character.type.flamingCloudImmune) {
			character.takeDamage(this.damage, 'Fire', {killer: 'FlamingCloud'});
		}
	};
	
	// FREEZING_CLOUD_CHARACTER_TURN_EFFECT:
	this.cloudCharacterTurnEffect.FreezingCloud = function (character) {
		character.takeDamage(this.damage, 'Cold', {killer: 'FreezingCloud'});
	};
	
	// FLAMING_CLOUD_ON_DESTROY:
	this.cloudOnDestroy.FlamingCloud = function () {
		gs.createCloud(this.tileIndex, 'Smoke', 0, 2);
	};
	
	// Create Cloud Types:
	this.cloudTypes = {
		PoisonGas: {
			frame: 1600,
			alpha: 0.75,
			updateTurn: this.cloudUpdateTurn.PoisonGas,
			characterTurnEffect: this.cloudCharacterTurnEffect.PoisonGas,
			isFlammable: true
		},
		
		PoisonCloud: {
			frame: 1600,
			alpha: 0.75,
			characterTurnEffect: this.cloudCharacterTurnEffect.PoisonGas,
			isFlammable: true
		},
		
		FreezingCloud: {
			frame: 1601,
			alpha: 0.75,
			characterTurnEffect: this.cloudCharacterTurnEffect.FreezingCloud
		},
		
		FlamingCloud: {
			frame: 1603,
			alpha: 0.75,
			updateTurn: null,
			characterTurnEffect: this.cloudCharacterTurnEffect.FlamingCloud,
			onDestroy: this.cloudOnDestroy.FlamingCloud,
		},
		
		Smoke: {
			frame: 1604,
			alpha: 0.75,
			updateTurn: this.cloudUpdateTurn.Smoke,
			isSafe: true,
		},
		
		WhiteSmoke: {
			frame: 1606,
			alpha: 0.75,
			isTransparent: false,
			isSafe: true,
		},
		
		Steam: {
			frame: 1606,
			alpha: 0.75,
			isTransparent: false,
			isSafe: true,
			updateTurn: this.cloudUpdateTurn.PoisonGas,
		},
		
		Dust: {
			frame: 1608,
			alpha: 0.5,
			isTransparent: false,
			isSafe: true,
		}
	};
	
	this.nameTypes(this.cloudTypes);
	
	this.forEachType(this.cloudTypes, function (type) {
		if (!type.hasOwnProperty('isTransparent')) {
			type.isTransparent = true;
		}
	}, this);
};


// CREATE_CLOUD:
// ************************************************************************************************
gs.createCloud = function (tileIndex, typeName, damage, life) {
	// Clouds will overwrite existing clouds:
	if (gs.getCloud(tileIndex)) {
		gs.getCloud(tileIndex).destroy();
	}
	
    return new Cloud(tileIndex, typeName, damage, life);
};

// CLOUD_CONSTRUCTOR:
// ************************************************************************************************
function Cloud(tileIndex, typeName, damage, life) {
	var position = util.toPosition(tileIndex);
	
	// Properties:
	this.type = gs.cloudTypes[typeName];
	this.name = gs.capitalSplit(this.type.name);
	this.life = life || 20;
	this.startLife = this.life;
	this.damage = damage || 0;
	this.isAlive = true;
	this.isTransparent = this.type.isTransparent;
	this.isSafe = this.type.isSafe;
	
	this.tileIndex = {x: tileIndex.x, y: tileIndex.y};
	this.isPassable = true;
	
	// Sprite:
	this.sprite = gs.createSprite(position.x, position.y, 'Tileset', gs.projectileSpritesGroup);
	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.frame = this.type.frame;
	this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.sprite.alpha = this.type.alpha;
	
	// Creating ice object on water:
	if (this.type.name === 'FreezingCloud' && gs.getTile(this.tileIndex).type.name === 'Water' && !gs.getObj(this.tileIndex)) {
		gs.createObject(this.tileIndex, 'Ice');
	}
	
	// Place on map:
    gs.getTile(tileIndex).cloud = this;
    
	// Push to effect list:
    gs.cloudList.push(this);
}

// DESTROY:
// ************************************************************************************************
Cloud.prototype.destroy = function () {
	this.sprite.destroy();
	gs.getTile(this.tileIndex).cloud = null;
	this.isAlive = false;
		
	gs.removeFromArray(this, gs.cloudList);
};

// STEP_ON:
// Called when a character enters the tile:
// ************************************************************************************************
Cloud.prototype.stepOn = function (character) {
	if (this.type.onEnterTile) {
		this.type.onEnterTile.call(this, character);
	}
};

// UPDATE_TURN:
// ************************************************************************************************
Cloud.prototype.updateTurn = function () {
	this.life -= 1;
	
	if (this.type.updateTurn) {
		this.type.updateTurn.call(this);
	}
	
	// Running out of life:
	if (this.life === 0) {
		// Make sure to call destroy first to safely remove from tile
		this.destroy();
		
		if (this.type.onDestroy) {
			this.type.onDestroy.call(this);
		}
		
	}
};

// CHARACTER_TURN_EFFECT:
// ************************************************************************************************
Cloud.prototype.characterTurnEffect = function (character) {
	if (this.type.characterTurnEffect) {
		this.type.characterTurnEffect.call(this, character);
	}
};

// CREATE_ICE:
// ************************************************************************************************
gs.createIce = function (tileIndex, duration) {
   return new Ice(tileIndex, duration);
};

// ICE_CONSTRUCTOR:
// ************************************************************************************************
function Ice (tileIndex, duration) {
	var startPos = util.toPosition(tileIndex);
    
    // Create sprite:
    this.sprite = gs.createSprite(startPos.x, startPos.y, 'Tileset', gs.projectileSpritesGroup);
    this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
    this.sprite.frame = 1642;
    this.sprite.alpha = 0.75;
    
    // Properties:
    this.life = duration;
    this.tileIndex = {x: tileIndex.x, y: tileIndex.y};
    this.isAlive = true;
    this.name = 'Ice';
	this.isTransparent = true;
    this.type = {name: 'Ice'};
	
	// Sound:
	gs.playSound(gs.sounds.ice, tileIndex);
	
	// Stun:
	if (gs.getChar(tileIndex) && gs.getChar(tileIndex).isAlive) {
		gs.getChar(tileIndex).statusEffects.add('Frozen', {duration: duration}, {dontPopUpText: true});
		
		gs.getChar(tileIndex).popUpText('Frozen!', '#ffffff');
	}
	
    // Destroy existing Cloud:
	if (gs.getTile(tileIndex).cloud) {
		gs.getTile(tileIndex).cloud.destroy();
	}
	
	// Place on map:
    gs.getTile(tileIndex).cloud = this;
    
	// Push to ice list:
    gs.cloudList.push(this);
}

// UPDATE_ICE_TURN:
// ************************************************************************************************
Ice.prototype.updateTurn = function () {
    this.life -= 1;
    
	if (this.life === 0) {
        this.destroy();
    }
};

// DESTROY:
// ************************************************************************************************
Ice.prototype.destroy = function () {
	this.sprite.destroy();
	gs.getTile(this.tileIndex).cloud = null;
	this.isAlive = false;
};

// DESTROY_ALL_CLOUDS:
// ************************************************************************************************
gs.destroyAllClouds = function () {
	for (let i = this.cloudList.length - 1; i >= 0 ; i -= 1) {
		this.cloudList[i].destroy();
	}
	
	this.cloudList = [];
};