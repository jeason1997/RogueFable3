/*global game, gs, console, util*/
/*global LOS_DISTANCE, TILE_SIZE*/
/*global Particle, ParticleGenerator, SPREAD_DAMAGE_MOD, PROJECTILE_SPEED, SCALE_FACTOR, REFLECTION_PERCENT_PER_POINT*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';


// CREATE_PROJECTILE_POOL:
// ************************************************************************************************
gs.createProjectilePool = function () {
	this.projectilePool = [];
	for (let i = 0; i < 50; i += 1) {
		this.projectilePool[i] = new Projectile();
	}
};

// CREATE_PROJECTILE:
// ************************************************************************************************
gs.createProjectile = function (fromCharacter, targetTileIndex, typeName, damage, flags) {
	for (let i = 0; i < this.projectilePool.length; i += 1) {
		if (!this.projectilePool[i].isAlive) {
			this.projectilePool[i].init(fromCharacter, targetTileIndex, typeName, damage, flags);
			return this.projectilePool[i];
		}
	}
	
	// Pool size exceeded:
	this.projectilePool.push(new Projectile());
	this.projectilePool[this.projectilePool.length - 1].init(fromCharacter, targetTileIndex, typeName, damage, flags);
	return this.projectilePool[this.projectilePool.length -1];
};

// CONSTRUCTOR:
// ************************************************************************************************
function Projectile() {
	this.isAlive = false;
	
	// Sprite:
    this.sprite = gs.createSprite(0, 0, 'Tileset', gs.projectileSpritesGroup);
	this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.sprite.visible = false;
}

// INIT:
// *******************************************************************************
Projectile.prototype.init = function (fromCharacter, targetTileIndex, typeName, damage, flags) {
	 var startPosition = util.toPosition(fromCharacter.tileIndex), light;
    
    flags = flags || {};
    
    // Properties:
    this.normal = util.normal(startPosition, util.toPosition(targetTileIndex));
    this.ignoreCharacters = [fromCharacter];
    this.isAlive = true;
    this.type = gs.projectileTypes[typeName];
    this.targetTileIndex = {x: targetTileIndex.x, y: targetTileIndex.y};
    this.damage = damage;
    this.damageType = this.type.damageType;
    this.flags = flags;
    this.distance = 0;
    this.tileIndex = {x: fromCharacter.tileIndex.x, y: fromCharacter.tileIndex.y};
	this.isTunnelShot = flags.isTunnelShot || this.type.isTunnelShot;
	this.isCrit = flags.isCrit;
	this.knockBack = flags.knockBack || 0;
    this.particleTimer = 0;
	this.fromCharacter = fromCharacter;
	this.perfectAim = flags.perfectAim || this.type.perfectAim;

	// Sprite:
	this.sprite.x = startPosition.x;
	this.sprite.y = startPosition.y;
   	this.sprite.rotation = game.math.angleBetween(fromCharacter.tileIndex.x, fromCharacter.tileIndex.y, targetTileIndex.x, targetTileIndex.y) + Math.PI / 2;
	this.sprite.frame = this.type.frame;
	this.sprite.visible = true;
	
	// Light:
	if (this.type.light) {
		this.light = gs.createLightCircle(this.sprite.position, this.type.light.color, this.type.light.radius, 0, this.type.light.startAlpha);
		this.light.noLife = true;
		this.light.fade = false;
	}
		
	
    // Push to list:
    gs.projectileList.push(this);
};

// UPDATE:
// *******************************************************************************
Projectile.prototype.update = function () {
    var nextPos,
		tileIndex = gs.toTileIndex(this.sprite.position),
		didHit;
	
    // Hit characters:
    // Note the bit about passing solids is to handle perfect aim which passes through non-targets
    if (gs.getChar(tileIndex) && !gs.inArray(gs.getChar(tileIndex), this.ignoreCharacters) && (!this.perfectAim || this.isTunnelShot || gs.vectorEqual(tileIndex, this.targetTileIndex))) {
		
		didHit = this.hitCharacter(gs.getChar(tileIndex));
		this.ignoreCharacters.push(gs.getChar(tileIndex));
        
		// Destroy non tunnel shot projectiles:
		if (didHit && !this.isTunnelShot) {
			this.destroy();
			return;
		}
    }
	
	// Hit Trap:
	if (gs.vectorEqual(tileIndex, this.targetTileIndex) && gs.getObj(tileIndex) && gs.canShootTrap(tileIndex) && !gs.getChar(tileIndex)) {
        this.hitTrap(gs.getObj(tileIndex));
        this.destroy();
        return;
	}
	
	
	// Hit targetTileIndex:
	if (gs.vectorEqual(tileIndex, this.targetTileIndex) && this.type.hitTargetTileIndex && !this.isTunnelShot) {
		if (!gs.getChar(tileIndex) || didHit) {
			this.hitTargetTileIndex(tileIndex);
			this.destroy();
			return;
		}	
	}
	
	// Hit Wall
	if (!gs.getChar(tileIndex) && !gs.isPassable(tileIndex)) {
		this.destroy();
		return;
	}

    // Move:
    this.sprite.x += this.normal.x * PROJECTILE_SPEED;
    this.sprite.y += this.normal.y * PROJECTILE_SPEED;
	this.distance += PROJECTILE_SPEED;
	this.tileIndex = gs.toTileIndex(this.sprite.position);
    
	// Move Light:
	if (this.light) {
		this.light.sprite.x = this.sprite.x;
		this.light.sprite.y = this.sprite.y;
	}
	
	// Particles:
	if (this.type.particleFrame) {
		this.particleTimer += 1;
		
		/*
		if (this.particleTimer > 2) {
			gs.createParticle(this.sprite.position, {frame: this.type.particleFrame, acc: {x: 0, y: 0}, duration: 30, fadePct: 0.5});
			this.particleTimer = 0;
		}
		*/
		
		if (this.particleTimer > 0 && this.distance > 50) {
			gs.createParticle(this.sprite.position, {frame: this.type.particleFrame, acc: {x: 0, y: 0}, duration: 12, fadePct: 0.5});
			this.particleTimer = 0;
		}
	}
	
    // Destroy after distance or out of bounds:
	if (this.distance >= LOS_DISTANCE * TILE_SIZE || !gs.isInBounds(gs.toTileIndex(this.sprite.position))) {
		this.destroy();
	}
};

// HIT_CHARACTER:
// ************************************************************************************************
Projectile.prototype.hitCharacter = function (character) {
    var attackResult = character.attackResult(this.fromCharacter, 'Range'),
        tileIndex = gs.toTileIndex(this.sprite.position);
    
	
	
	// REFLECTION:
	if (game.rnd.frac() < character.reflectPercent()) {
		character.popUpText('REFLECT', '#ffffff');
		// Note how we effectively reset ignoreCharacters so that the shooter can be hit
		this.ignoreCharacters = [character];
		this.perfectAim = false;
		this.normal.x = -this.normal.x;
		this.normal.y = -this.normal.y;
		this.distance = 0;
		return false;
	}
    // MISS:
    else if (attackResult === 'MISS' && !this.isCrit && !this.type.neverMiss) {
        character.popUpText('MISS', '#ffffff');
        this.ignoreCharacters.push(character);
		return false;
    }
	// HIT or CRITICAL:
	else {
		// Projectile Effects:
		if (this.type.effect) {
			this.type.effect(character, this);
		}
        // Damaging projectiles hitting characters:
        else {
			if (character !== gs.pc && attackResult === 'CRITICAL') {
				this.flags.isCrit = true;
			}
            
			if (this.isCrit) {
				this.flags.isCrit = this.isCrit;
			}
			
			// Unaware crit:
			if (this.fromCharacter === gs.pc && !character.isAgroed && gs.pc.hasTalent('HeadShot')) {
				this.damage = Math.round(this.damage + this.damage * 0.05 * gs.pc.stealth);
				this.flags.isCrit = true;
				console.log('foo');
			}
			
            character.takeDamage(this.damage, this.damageType, this.flags);
        }
		
		if (this.knockBack > 0 && character.isAlive) {
			character.body.applyKnockBack(this.normal, this.knockBack);
		}
		return true;
    }
	
	// Hitting (or missing) someone with a projectile agros and wakes them up
	character.isAgroed = true;
	character.isAsleep = false;
};

// HIT_TARGET_TILE_INDEX:
// ************************************************************************************************
Projectile.prototype.hitTargetTileIndex = function (tileIndex) {
	if (this.type.effect) {
		this.type.effect({tileIndex: tileIndex}, this);
	}
};

// HIT_TRAP:
// ************************************************************************************************
Projectile.prototype.hitTrap = function (trap) {
	if (gs.canShootTrap(trap.tileIndex)) {
		trap.stepOn(null);
	}
	
	if (this.type.effect) {
		this.type.effect({tileIndex: trap.tileIndex}, this);
	}
};

// DESTROY:
// ************************************************************************************************
Projectile.prototype.destroy = function () {
	gs.createAnimEffect(this.sprite.position, 'Hit');
	
	if (this.type.hitEffect) {
		this.type.hitEffect.call(this);
	}
	
    this.isAlive = false;
    this.sprite.visible = false;
	
	if (this.light) {
		this.light.destroy();
		this.light = null;
	}
};

// UPDATE_PROJECTILES:
// ************************************************************************************************
gs.updateProjectiles = function () {
    // Remove dead projectiles:
    for (let i = this.projectileList.length - 1; i >= 0; i -= 1) {
        if (!this.projectileList[i].isAlive) {
            this.projectileList.splice(i, 1);
        }
    }
    
    for (let i = 0; i < this.projectileList.length; i += 1) {
        this.projectileList[i].update();
    }
};

// DESTROY_ALL_PROJECTILES:
// ************************************************************************************************
gs.destroyAllProjectiles = function () {
	// Destroy Projectiles:
	for (let i = 0; i < this.projectileList.length; i += 1) {
		this.projectileList[i].destroy();
	}
	
	// Destroy particles:
	for (let i = 0; i < this.particleList.length; i += 1) {
		this.particleList[i].destroy();
	}
	
	// Destroy particle generators:
	for (let i = 0; i < this.particleGeneratorList.length; i += 1) {
		this.particleGeneratorList[i].destroy();
	}
	
	this.projectileList = [];
	this.particleList = [];
	this.particleGeneratorList = [];
	
};

