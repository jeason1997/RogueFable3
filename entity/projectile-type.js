/*global gs, game, console, util*/
/*global PARTICLE_FRAMES*/

'use strict';
// CREATE_PROJECTILE_TYPES:
// ************************************************************************************************
gs.createProjectileTypes = function () {
    this.createProjectileEffects();
    
    // Projectile Types:
    this.projectileTypes = {
		Dart: {
			frame: 1728,
			damageType: 'Physical',
			effect: null, 
			particleFrame: PARTICLE_FRAMES.WHITE
		},
		
		Stone: {
			frame: 1743,
			damageType: 'Physical',
			effect: null, 
			particleFrame: PARTICLE_FRAMES.WHITE
		},
		
		Oil: {
			frame: 1743,
			damageType: null,
			particleFrame: PARTICLE_FRAMES.WHITE,
			effect: this.projectileEffects.Oil,
			hitTargetTileIndex: true
		},
        
        Chakram: {
			frame: 52,
			damageType: 'Physical',
			effect: null,
            isTunnelShot: true,
			particleFrame: PARTICLE_FRAMES.WHITE
		},
		
		SleepingDart: {
			frame: 1728,
			damageType: null,
			effect: this.projectileEffects.SleepingDart,
			particleFrame: PARTICLE_FRAMES.WHITE,
			neverMiss: true
		},
		
		SmokeBomb: {
			frame: 1740,
			damageType: null,
			effect: this.projectileEffects.SmokeBomb,
			particleFrame: PARTICLE_FRAMES.WHITE,
			neverMiss: true,
			hitTargetTileIndex: true
		},
		
		SpiderWeb: {
			frame: 1730,
			damageType: null,
			effect: this.projectileEffects.Web,
			particleFrame: PARTICLE_FRAMES.WHITE,
			life: 5
		},
		
		Net: {
			frame: 1738,
			damageType: null,
			effect: this.projectileEffects.Net,
			particleFrame: PARTICLE_FRAMES.WHITE,
			life: 5
		},
		
		FireArrow: {
			frame: 1732,
			damageType: 'Fire',
			effect: this.projectileEffects.Fire,
			particleFrame: PARTICLE_FRAMES.RED,
			hitTargetTileIndex: true,
			neverMiss: true
		},
		
		FireBall: {
			frame: 1744,
			damageType: 'Fire',
			effect: this.projectileEffects.FireBall,
			particleFrame: PARTICLE_FRAMES.RED,
			hitTargetTileIndex: true,
			neverMiss: true,
			light: {color: '#ff0000', radius: 120, startAlpha: 66},
		},
		
		SparkBall: {
			frame: 1733,
			damageType: 'Shock',
			effect: this.projectileEffects.SparkBall,
			particleFrame: PARTICLE_FRAMES.WHITE,
			hitTargetTileIndex: true,
			neverMiss: true,
			light: {color: '#ffffff', radius: 30, startAlpha: 66},
		},
		
		Spark: {
			frame: 1733,
			damageType: 'Shock',
			effect: this.projectileEffects.Shock,
			particleFrame: PARTICLE_FRAMES.WHITE,
			hitTargetTileIndex: true,
			neverMiss: true,
			light: {color: '#ffffff', radius: 30, startAlpha: 66},
		},
		
		IceArrow: {
			frame: 1734,
			damageType: 'Cold',
			particleFrame: PARTICLE_FRAMES.WHITE,
			neverMiss: true,
			light: {color: '#ffffff', radius: 60, startAlpha: 44},
		},
		
		Snowball: {
			frame: 1742,
			damageType: 'Cold',
			particleFrame: PARTICLE_FRAMES.WHITE,
			neverMiss: true,
		},
		
		Acid: {
			frame: 1736,
			damageType: 'Toxic',
			particleFrame: PARTICLE_FRAMES.GREEN,
			neverMiss: true,
			light: {color: '#aaff00', radius: 60, startAlpha: 66},
		},
		
		PoisonArrow: {
			frame: 1736,
			damageType: 'Toxic',
			particleFrame: PARTICLE_FRAMES.GREEN,
			neverMiss: true,
			effect: this.projectileEffects.Poison,
			light: {color: '#aaff00', radius: 60, startAlpha: 66},
		},
		
		StrongPoisonArrow: {
			frame: 1736,
			damageType: 'Toxic',
			particleFrame: PARTICLE_FRAMES.GREEN,
			neverMiss: true,
			effect: this.projectileEffects.StrongPoison,
			light: {color: '#aaff00', radius: 60, startAlpha: 66},
		},
		
		LifeSpike: {
			frame: 1736,
			damageType: 'Toxic',
			particleFrame: PARTICLE_FRAMES.GREEN,
			neverMiss: true,
			effect: this.projectileEffects.LifeSpike,
			light: {color: '#aaff00', radius: 60, startAlpha: 66},
		},
		
		Bomb: {
			frame: 1740,
			hitTargetTileIndex: true,
			particleFrame: PARTICLE_FRAMES.WHITE,
			effect: this.projectileEffects.CreateBomb,
			perfectAim: true,
		},
		
		PlayerBomb: {
			frame: 1740,
			hitTargetTileIndex: true,
			particleFrame: PARTICLE_FRAMES.WHITE,
			effect: this.projectileEffects.FireBall,
		},
		
		PoisonGasBall: {
			frame: 1735,
			hitTargetTileIndex: true,
			particleFrame: PARTICLE_FRAMES.PURPLE,
			effect: this.projectileEffects.createPoisonGas
		},
		
		PlayerGasBall: {
			frame: 1735,
			hitTargetTileIndex: true,
			particleFrame: PARTICLE_FRAMES.PURPLE,
			effect: this.projectileEffects.createPlayerPoisonGas
		},
		
		MagicMissile: {
			frame: 1735,
			particleFrame: PARTICLE_FRAMES.PURPLE,
			damageType: 'Physical',
			effect: null,
			light: {color: '#ff00ff', radius: 60, startAlpha: 66},
			hitEffect: function () {
				var light = gs.createLightCircle(this.sprite.position, '#ff00ff', 30, 10);
				light.fade = false;
			}
		},
		
		SlimeBomb: {
			frame: 1736,
			particleFrame: PARTICLE_FRAMES.GREEN,
			neverMiss: true,
			effect: this.projectileEffects.createSlime
		},
	};
	gs.nameTypes(this.projectileTypes);
};

// CREATE_PROJECTILE_EFFECTS:
// ************************************************************************************************
gs.createProjectileEffects = function () {
    this.projectileEffects = {};
	
	// Web:
	this.projectileEffects.Web = function (targetChar, projectile) {
		targetChar.statusEffects.add('Webbed');
		gs.createVinePatch(targetChar.tileIndex, 1, 'SpiderWeb');
	};
	
	// Net:
	this.projectileEffects.Net = function (targetChar, projectile) {
		// Added test for traps:
		if (targetChar.statusEffects) {	
			targetChar.statusEffects.add('Netted', {duration: 8});
		}
	};
	
	// Fire:
	this.projectileEffects.Fire = function (targetChar, projectile) {
		gs.createFire(targetChar.tileIndex, projectile.damage, projectile.flags);
	};
	
	// Poison:
	this.projectileEffects.Poison = function (targetChar, projectile) {
		// Added test for traps:
		if (targetChar.statusEffects) {	
			targetChar.addPoisonDamage(projectile.damage);
		}
	};
	
	// Strong Poison:
	this.projectileEffects.StrongPoison = function (targetChar, projectile) {
		// Added test for traps:
		if (targetChar.statusEffects) {	
			targetChar.statusEffects.add('StrongPoison', {damage: projectile.damage});
		}
	};
	
	// Life Spike:
	this.projectileEffects.LifeSpike = function (targetChar, projectile) {
		
		gs.playSound(gs.sounds.playerHit, targetChar.tileIndex);
		targetChar.statusEffects.add('LifeSpike', {
			duration: projectile.flags.duration, 
			damage: projectile.damage, 
			actingCharId: projectile.fromCharacter.id
		});
		gs.createParticlePoof(targetChar.tileIndex, 'PURPLE');
	};
	
	// FireBall:
	this.projectileEffects.FireBall = function (targetChar, projectile) {
		//projectile.flags.damageDropOff = true;
		gs.createExplosion(targetChar.tileIndex, 1, projectile.damage, projectile.flags);
	};
	
	// SparkBall:
	this.projectileEffects.SparkBall = function (targetChar, projectile) {
		gs.getIndexInRadius(targetChar.tileIndex, 1.0).forEach(function (index) {
			if (gs.isStaticPassable(index)) {
				gs.createShock(index, projectile.damage, projectile.flags);
			}
		}, this);
	};
	
	
	
	// Shock:
	this.projectileEffects.Shock = function (targetChar, projectile) {
		gs.createShock(targetChar.tileIndex, projectile.damage, projectile.flags);
	};
	
	// Create Bomb:
	this.projectileEffects.CreateBomb = function (targetTile, projectile) {
		var bomb = gs.createObject(targetTile.tileIndex, 'Bomb');
		bomb.damage = projectile.damage;
	};
	
	// Smoke Bomb:
	this.projectileEffects.SmokeBomb = function (targetTile, projectile) {
		
		gs.createLightCircle(util.toPosition(targetTile.tileIndex), '#ffffff', 120, 10);
		
		gs.getIndexInRadius(targetTile.tileIndex, 1.5).forEach(function (tileIndex) {
			if (gs.isStaticPassable(tileIndex) && !gs.getCloud(tileIndex)) {
				gs.createCloud(tileIndex, 'WhiteSmoke', 0, projectile.flags.duration);
			}
		}, this);
		
		gs.calculateLoS();
	};
	
	// Oil:
	this.projectileEffects.Oil = function (targetTile, projectile) {
		gs.getIndexInRadius(targetTile.tileIndex, 1.5).forEach(function (tileIndex) {
			if (gs.isStaticPassable(tileIndex) && !gs.getObj(tileIndex)) {
				gs.createObject(tileIndex, 'Oil');
			}
		}, this);
	};
	
	// Sleeping Dart:
	this.projectileEffects.SleepingDart = function (targetChar, projectile) {
		targetChar.goToSleep();
		targetChar.statusEffects.add('DeepSleep', {duration: projectile.flags.duration});
	};
	
	// Poison Gas Ball:
	this.projectileEffects.createPoisonGas = function (targetTile, projectile) {
		gs.playSound(gs.sounds.fire, targetTile.tileIndex);
		gs.createCloud(targetTile.tileIndex, 'PoisonGas', projectile.damage, 15);	
	};
	
	// Player Gas Ball:
	this.projectileEffects.createPlayerPoisonGas = function (targetTile, projectile) {
		gs.playSound(gs.sounds.fire, targetTile.tileIndex);
		gs.createCloud(targetTile.tileIndex, 'PoisonGas', projectile.damage, 15);	
	};
	
	
	
	// Create Slime:
	this.projectileEffects.createSlime = function (targetChar, projectile) {
		gs.createVinePatch(targetChar.tileIndex, 2, 'Slime', 0.75);
		targetChar.onEnterTileBase();
	};
};