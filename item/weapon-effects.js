/*global gs, util, game, console*/
/*global TILE_SIZE*/
/*global RED_TARGET_BOX_FRAME, GREEN_TARGET_BOX_FRAME, FACTION*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_WEAPON_EFFECTS:
// ********************************************************************************************
gs.createWeaponEffects = function () {
	this.weaponEffects = {};

    // WEAPON_EFFECT_MELEE:
    // ********************************************************************************************
	this.weaponEffects.Melee = {};
	this.weaponEffects.Melee.useOn = function (tileIndex, item) {
		var flags = {};
		
		if (item.type.knockBack && util.frac() < 0.25) {
			flags.knockBack = 1;
		}
		
		// Melee Attack:
        gs.meleeAttack(gs.pc, tileIndex, gs.pc.weaponDamage(item), flags);
		
		// Play Sound:
		gs.playSound(gs.sounds.melee, gs.pc.tileIndex);
	};
	this.weaponEffects.Melee.showTarget = function (tileIndex, weapon) {
		gs.targetSprites[0].x = tileIndex.x * TILE_SIZE;
		gs.targetSprites[0].y = tileIndex.y * TILE_SIZE;
		gs.targetSprites[0].frame = RED_TARGET_BOX_FRAME;
		gs.targetSprites[0].visible = true;
	};
	this.weaponEffects.Melee.skill = 'Melee';
	this.weaponEffects.Melee.canAttack = function (targetTileIndex, weapon) {
		return util.distance(gs.pc.tileIndex, targetTileIndex) <= weapon.type.range
			&& gs.isRayPassable(gs.pc.tileIndex, targetTileIndex);
	};
	
	// WEAPON_EFFECT_LUNGE:
    // ********************************************************************************************
	this.weaponEffects.Lunge = {};
	this.weaponEffects.Lunge.skill = 'Melee';
	this.weaponEffects.Lunge.useOn = function (tileIndex, item) {
		var flags = {};
		
		// Move to attack:
		if (util.distance(gs.pc.tileIndex, tileIndex) > 1.5 && !gs.pc.isImmobile) {
			flags.alwaysCrit = true;
			gs.pc.body.moveToTileIndex(this.getStepIndex(tileIndex));
		}
		
		// Melee Attack:
        gs.meleeAttack(gs.pc, tileIndex, gs.pc.weaponDamage(item), flags);
		
		// Play Sound:
		gs.playSound(gs.sounds.melee, gs.pc.tileIndex);
	};
	this.weaponEffects.Lunge.showTarget = function (tileIndex, weapon) {
		// Target enemy:
		gs.targetSprites[0].x = tileIndex.x * TILE_SIZE;
		gs.targetSprites[0].y = tileIndex.y * TILE_SIZE;
		gs.targetSprites[0].frame = RED_TARGET_BOX_FRAME;
		gs.targetSprites[0].visible = true;
		
		// Show step index:
		if (util.distance(gs.pc.tileIndex, tileIndex) > 1.5) {
			gs.targetSprites[1].x = this.getStepIndex(tileIndex).x * TILE_SIZE;
			gs.targetSprites[1].y = this.getStepIndex(tileIndex).y * TILE_SIZE;
			gs.targetSprites[1].frame = GREEN_TARGET_BOX_FRAME;
			gs.targetSprites[1].visible = true;
		}
	};
	this.weaponEffects.Lunge.canAttack = function (targetTileIndex, weapon) {
		var range = gs.pc.isImmobile ? 1.5 : 2.0;
		
		return util.sqDistance(gs.pc.tileIndex, targetTileIndex) <= range
			&& gs.isRayPassable(gs.pc.tileIndex, targetTileIndex);
	};
	this.weaponEffects.Lunge.getStepIndex = function (targetTileIndex) {
		return gs.getIndexInRay(gs.pc.tileIndex, targetTileIndex)[0];
	};
	
	
	// WEAPON_EFFECTS_POLEARM:
	// ********************************************************************************************
	this.weaponEffects.PoleArm = {};
	this.weaponEffects.PoleArm.useOn = function (tileIndex, item) {
		var flags = {};
		
		// Weapon Knock Back:
		if (item.type.knockBack && util.frac() < 0.25) {
			flags.knockBack = 1;
		}
		
		// Polearm Attack:
		this.getTargetList(tileIndex).forEach(function (index) {
			gs.meleeAttack(gs.pc, index, gs.pc.weaponDamage(item), flags);
		}, this);
		
		// Play Sound:
		gs.playSound(gs.sounds.melee, gs.pc.tileIndex);
	};
	this.weaponEffects.PoleArm.showTarget = function (tileIndex, weapon) {
		var i = 0;
		
		this.getTargetList(tileIndex).forEach(function (index) {
			gs.targetSprites[i].x = index.x * TILE_SIZE;
			gs.targetSprites[i].y = index.y * TILE_SIZE;
			gs.targetSprites[i].frame = RED_TARGET_BOX_FRAME;
			gs.targetSprites[i].visible = true;
			i += 1;
		}, this);
		
		if (i === 0 && gs.canShootTrap(tileIndex)) {
			gs.targetSprites[0].x = tileIndex.x * TILE_SIZE;
			gs.targetSprites[0].y = tileIndex.y * TILE_SIZE;
			gs.targetSprites[0].frame = RED_TARGET_BOX_FRAME;
			gs.targetSprites[0].visible = true;
		}
		
	};
	this.weaponEffects.PoleArm.getTargetList = function (tileIndex) {
		var list, normal, newTileIndex;
		
		normal = util.normal(gs.pc.tileIndex, tileIndex);
		newTileIndex = {x: gs.pc.tileIndex.x + normal.x * 2, y: gs.pc.tileIndex.y + normal.y * 2};
		
		list = gs.getIndexInRay(gs.pc.tileIndex, newTileIndex);
		list = list.filter(index => gs.getChar(index) && (gs.pc.isHostileToMe(gs.getChar(index)) || gs.getChar(index).faction === FACTION.DESTRUCTABLE));
		
		return list;
	};
	this.weaponEffects.PoleArm.skill = 'Melee';
	this.weaponEffects.PoleArm.canAttack = function (targetTileIndex, weapon) {
		return util.distance(gs.pc.tileIndex, targetTileIndex) <= weapon.type.range
			&& gs.isRayStaticPassable(gs.pc.tileIndex, targetTileIndex);
	};
	
	
	// WEAPON_EFFECT_FLAME:
	// Used by inferno sword
    // ********************************************************************************************
	this.weaponEffects.Flame = {};
	this.weaponEffects.Flame.useOn = function (tileIndex, item) {
		gs.playSound(gs.sounds.melee, gs.pc.tileIndex);
		
		// Crit unaware characters:
		let isCrit = false;
		if (!gs.getChar(tileIndex).isAgroed) {
			isCrit = true;
		}
		
		gs.createFire(tileIndex, Math.ceil(item.getModdedStat('damage') * gs.pc.meleeDamageMultiplier), {killer: gs.pc, isCrit: isCrit});
	};
	this.weaponEffects.Flame.showTarget = function (tileIndex, weapon) {
		gs.targetSprites[0].x = tileIndex.x * TILE_SIZE;
		gs.targetSprites[0].y = tileIndex.y * TILE_SIZE;
		gs.targetSprites[0].frame = RED_TARGET_BOX_FRAME;
		gs.targetSprites[0].visible = true;
	};
	this.weaponEffects.Flame.skill = 'Melee';
	this.weaponEffects.Flame.canAttack = this.weaponEffects.Melee.canAttack;
	
    // WEAPON_EFFECT_CLEAVE:
	// Axes
    // ************************************************************************************************
	this.weaponEffects.Cleave = {};
	this.weaponEffects.Cleave.useOn = function (tileIndex, item) {
        // Cleave Hit:
		this.getTargetList(tileIndex).forEach(function (index) {
			gs.meleeAttack(gs.pc, index, gs.pc.weaponDamage(item));
		}, this);
		
		// Sound:
        gs.playSound(gs.sounds.melee, gs.pc.tileIndex);
        
	};
	this.weaponEffects.Cleave.showTarget = function (tileIndex, weapon) {
		var i = 0;
		
		this.getTargetList(tileIndex).forEach(function (index) {
			gs.targetSprites[i].x = index.x * TILE_SIZE;
			gs.targetSprites[i].y = index.y * TILE_SIZE;
			gs.targetSprites[i].frame = RED_TARGET_BOX_FRAME;
			gs.targetSprites[i].visible = true;
			i += 1;
		}, this);
	};
	this.weaponEffects.Cleave.getTargetList = function (tileIndex) {
		var list = gs.getIndexInRadius(gs.pc.tileIndex, 1.5);
		list = list.filter(index => gs.getChar(index) && (gs.pc.isHostileToMe(gs.getChar(index)) || gs.getChar(index).faction === FACTION.DESTRUCTABLE));
		return list;
	};
	this.weaponEffects.Cleave.skill = 'Melee';
	this.weaponEffects.Cleave.canAttack = this.weaponEffects.Melee.canAttack;
	
	// WEAPON_EFFECT_STORM_CHOPPER:
    // ************************************************************************************************
	this.weaponEffects.StormChopper = {};
	this.weaponEffects.StormChopper.useOn = function (tileIndex, item) {
        // Cleave Hit:
		this.getTargetList(tileIndex).forEach(function (index) {
			let isCrit = false;
			
			// Crit unaware characters:
			// Must recheck for char existance in case he was killed by previous part of the cleave
			// Ex. consider hitting a bloat, that explodes, killing his friend, and then trying to hit the now dead
			if (gs.getChar(index) && !gs.getChar(index).isAgroed) {
				isCrit = true;
			}
			
			gs.createShock(index, Math.ceil(item.getModdedStat('damage') * gs.pc.meleeDamageMultiplier), {killer: gs.pc, isCrit: isCrit});
		}, this);
		
		// Sound:
        gs.playSound(gs.sounds.melee, gs.pc.tileIndex);
	};
	this.weaponEffects.StormChopper.showTarget = this.weaponEffects.Cleave.showTarget;
	this.weaponEffects.StormChopper.getTargetList = this.weaponEffects.Cleave.getTargetList;
	this.weaponEffects.StormChopper.skill = 'Melee';
	this.weaponEffects.StormChopper.canAttack = this.weaponEffects.Melee.canAttack;
	
	// WEAPON_EFFECT_MOB_FUCKER:
	// ********************************************************************************************
	this.weaponEffects.MobFucker = {};
	this.weaponEffects.MobFucker.useOn = function (tileIndex, item) {
		var i;

		for (i = 0; i < gs.characterList.length; i += 1) {
			if (gs.getTile(gs.characterList[i].tileIndex).visible && gs.characterList[i].isAlive && gs.characterList[i] !== gs.pc) {
				gs.createFire(gs.characterList[i].tileIndex, 100, {killer: gs.pc});
			}
		}
	};
	this.weaponEffects.MobFucker.showTarget = function (tileIndex, weapon) {
		gs.targetSprites[0].x = tileIndex.x * TILE_SIZE;
		gs.targetSprites[0].y = tileIndex.y * TILE_SIZE;
		gs.targetSprites[0].visible = true;
	};
	this.weaponEffects.MobFucker.skill = 'Range';
	this.weaponEffects.MobFucker.canAttack = function (targetTileIndex, weapon) {
		return true;
	};
	
	
	// WEAPON_EFFECT_POISON_DAGGER:
    // ********************************************************************************************
	this.weaponEffects.PoisonDagger = {};
	this.weaponEffects.PoisonDagger.useOn = function (tileIndex, item) {
		// Melee Attack:
        gs.meleeAttack(gs.pc, tileIndex, gs.pc.weaponDamage(item));
		
		// Play Sound:
		gs.playSound(gs.sounds.melee, gs.pc.tileIndex);
		
		// Apply Poison:
		if (gs.getChar(tileIndex) && gs.getChar(tileIndex).isAlive) {
			gs.getChar(tileIndex).addPoisonDamage(10);
		}
	};
	this.weaponEffects.PoisonDagger.showTarget = function (tileIndex, weapon) {
		gs.targetSprites[0].x = tileIndex.x * TILE_SIZE;
		gs.targetSprites[0].y = tileIndex.y * TILE_SIZE;
		gs.targetSprites[0].frame = RED_TARGET_BOX_FRAME;
		gs.targetSprites[0].visible = true;
	};
	this.weaponEffects.PoisonDagger.skill = 'Melee';
	this.weaponEffects.PoisonDagger.canAttack = this.weaponEffects.Melee.canAttack;
	


	// SINGLE_PROJECTILE_WEAPON_EFFECT:
	// ********************************************************************************************
	this.weaponEffects.SingleProjectile = {};
	this.weaponEffects.SingleProjectile.useOn = function (tileIndex, item, flags) {
		var projectile;
		
		flags = flags || {};
		flags.killer = gs.pc;
		flags.isCrit = flags.isCrit || gs.pc.alwaysProjectileCrit;
		
		if (gs.pc.hasTalent('PerfectAim')) {
			flags.perfectAim = true;
		}
		
		gs.playSound(item.type.shootSound || gs.sounds.throw, gs.pc.tileIndex);
		
		projectile = gs.createProjectile(gs.pc, tileIndex, item.type.projectileName, gs.pc.weaponDamage(item), flags);
			
		// Consuming Ammo:
		if (!item.type.noAmmo) {
			if (game.rnd.frac() <= gs.pc.saveAmmoChance) {
				gs.pc.popUpText('Saved Ammo', '#ffffff');
			} 
			else {
				if (item.amount === 1) {
					gs.pc.popUpText('Out of Ammo', '#ffffff');
				}

				gs.pc.inventory.removeItem(item, 1);
			}
		}
		
		// Character bounce:
		gs.pc.body.faceTileIndex(tileIndex);
		gs.pc.body.bounceTowards(tileIndex);
		
		return projectile;
		
	};
	this.weaponEffects.SingleProjectile.showTarget = function (tileIndex, weapon) {
		// Show red X line if target blocked:
		if (gs.pc.hasTalent('PerfectAim')) {
			if (util.distance(gs.pc.tileIndex, tileIndex) > gs.pc.weaponRange(weapon)
				|| !gs.isRayClear(gs.pc.tileIndex, tileIndex)
				|| !gs.isRayStaticPassable(gs.pc.tileIndex, tileIndex)) {
				gs.showTargetLine(tileIndex);
			}
		}
		else {
			if (util.distance(gs.pc.tileIndex, tileIndex) > gs.pc.weaponRange(weapon)
				|| util.distance(gs.pc.tileIndex, tileIndex) < gs.pc.weaponMinRange(weapon)
				|| (!gs.isRayClear(gs.pc.tileIndex, tileIndex) && !gs.getTile(tileIndex).visible)
				|| !gs.isRayPassable(gs.pc.tileIndex, tileIndex)) {
				gs.showTargetLine(tileIndex);
			}
		}
	
		// Show red target:
		gs.targetSprites[0].x = tileIndex.x * TILE_SIZE;
		gs.targetSprites[0].y = tileIndex.y * TILE_SIZE;
		gs.targetSprites[0].frame = RED_TARGET_BOX_FRAME;
		gs.targetSprites[0].visible = true;
	};
	this.weaponEffects.SingleProjectile.skill = 'Range';
	this.weaponEffects.SingleProjectile.canAttack = function (targetTileIndex, weapon) {
		var lineClear;
		
		// Handling perfect aim:
		if (gs.pc.hasTalent('PerfectAim')) {
			lineClear = gs.isRayStaticPassable(gs.pc.tileIndex, targetTileIndex);
		}
		else {
			lineClear = gs.isRayPassable(gs.pc.tileIndex, targetTileIndex);
		}
		
		return lineClear && util.distance(gs.pc.tileIndex, targetTileIndex) <= weapon.type.range;
	};
	
	
	// MAGIC_STAFF:
	// ********************************************************************************************
	this.weaponEffects.MagicStaff = {};
	this.weaponEffects.MagicStaff.skill = 'Range';
	this.weaponEffects.MagicStaff.useOn = function (tileIndex, item, flags = {}) {
		let proj;
		
		flags.killer = gs.pc;
		
		// Sound:
		gs.playSound(gs.sounds.throw, gs.pc.tileIndex);
		
		// Projectile:
		proj = gs.createProjectile(gs.pc, tileIndex, item.type.projectileName, gs.pc.weaponDamage(item), flags);
		
		// Character bounce:
		gs.pc.body.faceTileIndex(tileIndex);
		gs.pc.body.bounceTowards(tileIndex);
		
		// Shoot effect:
		if (item.type.shootEffect) {
			gs.createMagicShootEffect(gs.pc, tileIndex, item.type.shootEffect);
		}
		
		return proj;
	};
	this.weaponEffects.MagicStaff.showTarget = function (tileIndex, weapon) {
		var indexList, i = 0;
		
		// Show red X line if target blocked:
		if (util.distance(gs.pc.tileIndex, tileIndex) > gs.pc.weaponRange(weapon)
			|| (!gs.isRayClear(gs.pc.tileIndex, tileIndex) && !gs.getTile(tileIndex).visible)
			|| !gs.isRayPassable(gs.pc.tileIndex, tileIndex)) {
			gs.showTargetLine(tileIndex);
			
			// Show red target:
			gs.targetSprites[0].x = tileIndex.x * TILE_SIZE;
			gs.targetSprites[0].y = tileIndex.y * TILE_SIZE;
			gs.targetSprites[0].frame = RED_TARGET_BOX_FRAME;
			gs.targetSprites[0].visible = true;
		}
		// Staff of storms has special targeting:
		else if (weapon.type === gs.itemTypes.GreaterStaffOfStorms) {
			indexList = gs.getIndexInRadius(tileIndex, 1.0);
			indexList = indexList.filter(index => gs.isStaticPassable(index));
			
			indexList.forEach(function (index) {
				gs.targetSprites[i].x = index.x * TILE_SIZE;
				gs.targetSprites[i].y = index.y * TILE_SIZE;
				gs.targetSprites[i].visible = true;
				gs.targetSprites[i].frame = RED_TARGET_BOX_FRAME;
				i += 1;
			}, this);
		}
		else {
			// Show red target:
			gs.targetSprites[0].x = tileIndex.x * TILE_SIZE;
			gs.targetSprites[0].y = tileIndex.y * TILE_SIZE;
			gs.targetSprites[0].frame = RED_TARGET_BOX_FRAME;
			gs.targetSprites[0].visible = true;
		}
	};
	this.weaponEffects.MagicStaff.canAttack = this.weaponEffects.SingleProjectile.canAttack;
	
	gs.nameTypes(this.weaponEffects);
};