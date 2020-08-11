/*global game, gs, console, util*/
/*global TILE_SIZE, SCALE_FACTOR*/
/*global SPREAD_DAMAGE_MOD*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_SHOCK:
// ************************************************************************************************
gs.createShock = function (tileIndex, damage, flags) {
	return new Shock(tileIndex, damage, flags);
};

// CREATE_FIRE:
// ************************************************************************************************
gs.createFire = function (tileIndex, damage, flags) {
	return new Fire(tileIndex, damage, flags);
};


// CREATE_EXPLOSION_CROSS:
// ************************************************************************************************
gs.createExplosionCross = function (tileIndex, range, damage, flags) {
	var indexList;
	
	indexList = gs.getIndexInRadius(tileIndex, range);
	indexList = indexList.filter(index => gs.isStaticPassable(index));
	indexList = indexList.filter(index => gs.isRayStaticPassable(index, tileIndex));
	indexList = indexList.filter(index => index.x === tileIndex.x || index.y === tileIndex.y);
	
	indexList.forEach(function (index) {
		this.createFire(index, damage, flags);
	}, this);
	
	// Camera shake:
	if (gs.getTile(tileIndex).visible) {
		game.camera.shake(0.010, 100);
	}
	
	// Sound:
	gs.playSound(gs.sounds.explosion, tileIndex);
};

// CREATE_EXPLOSION:
// ************************************************************************************************
gs.createExplosion = function (atTileIndex, range, damage, flags) {
	var indexList;
	
	indexList = gs.getIndexInRadius(atTileIndex, range);
	indexList = indexList.filter(index => gs.isPassable(index) || gs.getChar(index));
	indexList = indexList.filter(index => gs.isRayStaticPassable(index, atTileIndex));
	indexList.forEach(function (index) {
		
		if (flags.damageDropOff && util.distance(atTileIndex, index) > 0) {
			this.createFire(index, Math.ceil(damage / 2), flags);
		}
		else {
			this.createFire(index, damage, flags);
		}
	}, this);
	
	// Camera shake:
	if (gs.getTile(atTileIndex).visible) {
		game.camera.shake(0.010, 100);
	}
	
	//game.camera.flash(0xff0000, 25);
	
	// Sound:
	gs.playSound(gs.sounds.explosion, atTileIndex);
};



// SHOCK_CONSTRUCTOR:
// ************************************************************************************************
function Shock (tileIndex, damage, flags = {}) {
	var startPos = util.toPosition(tileIndex),
		character;
	
    this.tileIndex = {x: tileIndex.x, y: tileIndex.y};
    this.damage = damage;
    this.isAlive = true;
    this.flags = flags;
	this.name = 'Electricity';
	this.life = 20;
	this.isTransparent = true;
	
	if (flags.hasOwnProperty('spread')) {
		this.spread = flags.spread;
	}
	else {
		this.spread = 4;
	}
	
	// Create sprite:
    this.sprite = gs.createSprite(startPos.x, startPos.y, 'Tileset', gs.projectileSpritesGroup);
    this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
    this.sprite.animations.add('Explode', [1637, 1638, 1639, 1640, 1641], 10);
    this.sprite.play('Explode');
    
	// Lighting
	gs.createLightCircle(this.sprite.position, '#ffffff', 120, 30, '66');
	
	// Sound:
	gs.playSound(gs.sounds.shock, this.tileIndex);
	
	// Damage characters:
	character = gs.getChar(this.tileIndex);
    if (character && character.isAlive && (this.spread === 4 || !character.isFlying)) {
        character.takeDamage(damage, 'Shock', flags);
    }
	
	gs.getTile(this.tileIndex).effect = this;
	gs.projectileList.push(this);
}

// STEP_ON:
// ************************************************************************************************
Shock.prototype.stepOn = function () {
	console.log('Shock.stepOn() should never be called (report this)');
};

// CAN_SPREAD_ON:
// ************************************************************************************************
Shock.prototype.canSpreadOn = function (tileIndex) {
	if (gs.getEffect(tileIndex)) {
		return false;
	}
	else {
		return gs.getTile(tileIndex).type.name === 'Water'
			|| gs.getCloud(tileIndex) && gs.getCloud(tileIndex).type.name === 'Steam'
			|| gs.getCloud(tileIndex) && gs.getCloud(tileIndex).type.name === 'FreezingCloud';
	}
};

// UPDATE_SHOCK:
// ************************************************************************************************
Shock.prototype.update = function () {
	var spreadDamage = Math.floor(this.damage * SPREAD_DAMAGE_MOD),
		shock;
	
	if (this.sprite.frame === 1638 && spreadDamage > 0 && this.spread > 0) {
		gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
			if (this.canSpreadOn(tileIndex)) {
				this.flags.spread = this.spread - 1;
				shock = gs.createShock(tileIndex, spreadDamage, this.flags);
			}
		}, this);
	}
			
	// Added life to make sure shock disapears
	this.life -= 1;
	if (this.sprite.frame >= 1641 || this.life <= 0) {
        this.destroy();
    }
};

// DESTROY:
// ************************************************************************************************
Shock.prototype.destroy = function () {
	this.sprite.destroy();
	gs.getTile(this.tileIndex).effect = null;
	this.isAlive = false;
};


// FIRE_CONSTRUCTOR:
// ************************************************************************************************
function Fire (tileIndex, damage, flags) {
    var startPos = util.toPosition(tileIndex);
    
    this.tileIndex = {x: tileIndex.x, y: tileIndex.y};
    this.damage = damage;
    this.isAlive = true;
    this.flags = flags;
	this.life = 20;
	this.isTransparent = true;
	this.spread = 6;
	
    // Create sprite:
    this.sprite = gs.createSprite(startPos.x, startPos.y, 'Tileset', gs.projectileSpritesGroup);
	this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.animations.add('Explode', [1632, 1633, 1634, 1635, 1636], 10);
    this.sprite.play('Explode');
	
	// Particle:
	//gs.createParticlePoof(this.tileIndex, 'RED', 10);
    
	// Light:
	gs.createLightCircle(this.sprite.position, '#ff0000', 120, 30, '66');
	
	// Sound:
	gs.playSound(gs.sounds.fire, this.tileIndex);
	
    // Damage characters:
    if (gs.getChar(this.tileIndex) && gs.getChar(this.tileIndex).isAlive) {
        gs.getChar(this.tileIndex).takeDamage(damage, 'Fire', flags);
    }
    
    // Destroy Flammable Objects:
	if (gs.getObj(this.tileIndex, obj => obj.type.isFlammable)) {
		gs.destroyObject(gs.getObj(this.tileIndex));
	}
	
	// Destroy Mushrooms:
	if (gs.getObj(this.tileIndex, obj => obj.type.name === 'FireShroom')) {
		gs.destroyObject(gs.getObj(this.tileIndex));
	}
	
	// Destroy Ice:
	if (gs.getObj(this.tileIndex, obj => obj.type.name === 'Ice')) {
		gs.destroyObject(gs.getObj(this.tileIndex));
	}
	
	// Destroy Flammable effects:
	if (gs.getCloud(this.tileIndex) && gs.getCloud(this.tileIndex).type.isFlammable) {
		gs.getCloud(this.tileIndex).destroy();
	}
	
	// Destroy Freezing Cloud:
	if (gs.getCloud(this.tileIndex) && gs.getCloud(this.tileIndex).type.name === 'FreezingCloud') {
		gs.getCloud(this.tileIndex).destroy();
	}
	
	// Create Steam:
	if (gs.getTile(this.tileIndex).type.name === 'Water' && !gs.getCloud(tileIndex)) {
		gs.createCloud(this.tileIndex, 'Steam', 0, 10);
		gs.calculateLoS();
	}
	
	
	gs.projectileList.push(this);
	/*
	// Only push to projectile list if needs to spread:
	if (gs.getIndexListCardinalAdjacent(this.tileIndex).filter(index => this.canSpreadOn(index)).length > 0) {
		gs.projectileList.push(this);
	}
	else {
		gs.particleList.push(this);
	}
	*/
}

// STEP_ON:
// ************************************************************************************************
Fire.prototype.stepOn = function () {
	console.log('Fire.stepOn() should never be called (report this)');
};

// CAN_SPREAD_ON:
// ************************************************************************************************
Fire.prototype.canSpreadOn = function (tileIndex) {
	return gs.getObj(tileIndex, obj => obj.type.isFlammable)
		|| gs.getCloud(tileIndex) && gs.getCloud(tileIndex).type.isFlammable;
};

// UPDATE_FIRE:
// ************************************************************************************************
Fire.prototype.update = function () {
	var spreadDamage = this.damage, //Math.floor(this.damage * SPREAD_DAMAGE_MOD),
		fire;
	
	this.life -= 1;
	
    // Set adjacent vines on fire:
    if (this.sprite.frame === 1633 && spreadDamage > 0 && this.spread > 0) {
		gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
			if (this.canSpreadOn(tileIndex)) {
				fire = gs.createFire(tileIndex, spreadDamage, this.flags);
				fire.spread = this.spread - 1;
			}
		}, this);
    }
	
	
	// Destroy fire:
	if (this.sprite.frame >= 1636 || this.life <= 0) {
       this.destroy();
    }
};

// DESTROY:
// ************************************************************************************************
Fire.prototype.destroy = function () {
	this.sprite.destroy();
	this.isAlive = false;
};




