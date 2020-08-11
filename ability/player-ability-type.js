
/*global gs, game, util, console*/
/*global Item*/
/*global RED_SELECT_BOX_FRAME, PURPLE_SELECT_BOX_FRAME, PURPLE_BOX_FRAME*/
/*global LOS_DISTANCE, TILE_SIZE, FACTION, ABILITY_RANGE, HELL_FIRE_DAMAGE*/
/*global SPREAD_DAMAGE_MOD*/
/*jshint esversion: 6, laxbreak: true, loopfunc: true*/
'use strict';

// CREATE_PLAYER_ABILITY_TYPES:
// ************************************************************************************************
gs.createPlayerAbilityTypes = function () {
	// ********************************************************************************************
	// DEFENSIVE_ABILITIES:
	// ********************************************************************************************
	// SHIELDS_UP:
	// ********************************************************************************************
	this.abilityTypes.ShieldsUp = {};
	this.abilityTypes.ShieldsUp.useImmediately = true;
	this.abilityTypes.ShieldsUp.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.ShieldsUp.canUse = this.abilityCanUse.Shield;
	this.abilityTypes.ShieldsUp.useOn = function (actingChar) {
		actingChar.statusEffects.add('ShieldsUp');
	};
	
	// DEFLECT:
	// ********************************************************************************************
	this.abilityTypes.Deflect = {};
	this.abilityTypes.Deflect.useImmediately = true;
	this.abilityTypes.Deflect.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Deflect.canUse = this.abilityCanUse.Shield;
	this.abilityTypes.Deflect.useOn = function (actingChar) {
		var duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		actingChar.statusEffects.add('Deflect', {duration: duration});
	};
	
	
	// ********************************************************************************************
	// MELEE_ABILITIES:
	// ********************************************************************************************
	// DISENGAGE:
	// Deals a critical hit and steps back a tile
	// Will not set a cooldown if a killstrike is landed
	// ********************************************************************************************
	this.abilityTypes.Disengage = {};
	this.abilityTypes.Disengage.range = this.abilityRange.Weapon;
	this.abilityTypes.Disengage.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Disengage.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterRay.call(this, actingChar, targetTileIndex)
			&& actingChar.canMoveTo(this.getBackIndex(actingChar, targetTileIndex));
	};
	this.abilityTypes.Disengage.canUse = function (actingChar) {
		return gs.abilityCanUse.MeleeWeapon.call(this, actingChar)
			&& !actingChar.isImmobile;
	};
	this.abilityTypes.Disengage.getBackIndex = function (actingChar, targetTileIndex) {
		var normal = util.normal(targetTileIndex, actingChar.tileIndex);
		if (normal.x > 0) 	normal.x = 1;
		if (normal.x < 0) 	normal.x = -1;
		if (normal.y > 0)	normal.y = 1;
		if (normal.y < 0)	normal.y = -1;
		
		return {x: actingChar.tileIndex.x + normal.x, y: actingChar.tileIndex.y + normal.y};
	};
	this.abilityTypes.Disengage.useOn = function (actingChar, targetTileIndex) {
		var flags, damage, targetChar;
		
		// Attributes:
		damage = Math.ceil(actingChar.weaponDamage() * this.attributes.damageMultiplier.value(actingChar));
		
		// Flags:
		flags = {
			isSpecialAttack: true,
		};
		
		// Back Peddle:
		// Perform the back peddle first:
		// Blinking enemies will not blink into the tile
		// Wont take damage from explosions
		if (gs.isPassable(this.getBackIndex(actingChar, targetTileIndex))) {
			actingChar.body.moveToTileIndex(this.getBackIndex(actingChar, targetTileIndex));
			actingChar.body.faceTileIndex(targetTileIndex);
		}
		
		// Melee Attack:
		targetChar = gs.getChar(targetTileIndex);
		gs.meleeAttack(actingChar, targetTileIndex, damage, flags);
		
		// No cooldown on kill strike:
		if (targetChar && !targetChar.isAlive) {
			actingChar.selectedAbility.coolDown = 0;
		}
		
		
		
		// Shake Screen:
		game.camera.shake(0.010, 100);
	};
	
	// POWER_STRIKE:
	// Deals a critical hit and knocks the target back two tiles
	// ********************************************************************************************
	this.abilityTypes.PowerStrike = {};
	this.abilityTypes.PowerStrike.range = this.abilityRange.Weapon;
	this.abilityTypes.PowerStrike.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.PowerStrike.canUseOn = this.abilityCanUseOn.SingleCharacterRay;
	this.abilityTypes.PowerStrike.canUse = this.abilityCanUse.MeleeWeapon;
	this.abilityTypes.PowerStrike.useOn = function (actingChar, targetTileIndex) {
		var flags, damage;
		
		// Attributes:
		damage = Math.ceil(actingChar.weaponDamage() * this.attributes.damageMultiplier.value(actingChar));
		
		// Flags:
		flags = {
			isSpecialAttack: true,
			effectFunc: function (targetChar) {
				targetChar.body.applyKnockBack(util.normal(actingChar.tileIndex, targetTileIndex), 2);
			}
		};
		
		// Melee Attack:
		gs.meleeAttack(actingChar, targetTileIndex, damage, flags);
		
		// Shake Screen:
		game.camera.shake(0.010, 100);
	};
	
	// WAR_CRY:
	// Instantly fills rage bar, stuns in a short range, agroes in a large range
	// ********************************************************************************************
	this.abilityTypes.WarCry = {};
	this.abilityTypes.WarCry.useImmediately = true;
	this.abilityTypes.WarCry.aoeRange = 2.5;
	this.abilityTypes.WarCry.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.WarCry.showTarget = this.abilityShowTarget.PBAoE;
	this.abilityTypes.WarCry.useOn = function (actingChar) {
		var indexList;
		
		// Fill Rage:
		actingChar.rage = actingChar.maxRage;
		
		// Stun:
		indexList = gs.getIndexInRadius(actingChar.tileIndex, 2.5);
		indexList = indexList.filter(index => gs.getChar(index) && this.canUseOn(actingChar, index));
		indexList.forEach(function (tileIndex) {
			gs.getChar(tileIndex).statusEffects.add('Stunned', {duration: 3});
			gs.createParticlePoof(tileIndex, 'WHITE');
		}, this);
		
		// Agro distant:
		gs.getAllNPCs().forEach(function (character) {
			if (util.distance(actingChar.tileIndex, character.tileIndex) < 20 && character.faction === FACTION.HOSTILE) {
				character.agroPlayer();
			}
		}, this);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 59);
	};

	
	// CHARGE:
	// Sprints towards a target and deals a critical hit + knockback
	// ********************************************************************************************
	this.abilityTypes.Charge = {};
	this.abilityTypes.Charge.dontEndTurn = true;
	this.abilityTypes.Charge.range = LOS_DISTANCE;
	this.abilityTypes.Charge.showTarget = this.abilityShowTarget.Path;
	this.abilityTypes.Charge.canUse = function (actingChar) {
		return gs.abilityCanUse.MeleeWeapon.call(this, actingChar)
			&& !actingChar.isImmobile;
	};
	
	this.abilityTypes.Charge.canUseOn = function (actingChar, targetTileIndex) {
		var path = actingChar.getPathTo(targetTileIndex, true);
		
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& gs.getChar(targetTileIndex).faction !== FACTION.NEUTRAL
			&& gs.getChar(targetTileIndex).faction !== FACTION.PLAYER
			&& !actingChar.cantMoveFromCharm(targetTileIndex)
			&& path
			&& path.length > 0
			&& path.length <= this.attributes.maxPath.value(actingChar) + 1;
	};
	this.abilityTypes.Charge.useOn = function (actingChar, targetTileIndex) {
		var path = actingChar.getPathTo(targetTileIndex, true);

		for (let i = 0; i < path.length; i += 1) {
			actingChar.actionQueue[i] = {type: 'CLICK', tileIndex: path[i]};
		}
		
		actingChar.fastMove = 1;
		actingChar.statusEffects.remove('Slow');
		actingChar.statusEffects.add('Charge');
		gs.keyBoardMode = false;
	};
	
	// LUNGE:
	// ********************************************************************************************
	this.abilityTypes.Lunge = {};
	this.abilityTypes.Lunge.dontEndTurn = true;
	this.abilityTypes.Lunge.range = function (actingChar) {
		return this.attributes.range.value(actingChar);
	};
	this.abilityTypes.Lunge.showTarget = this.abilityShowTarget.Path;
	this.abilityTypes.Lunge.canUse = function (actingChar) {
		return gs.abilityCanUse.MeleeWeapon.call(this, actingChar)
			&& !actingChar.isImmobile;
	};
	this.abilityTypes.Lunge.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterRay.call(this, actingChar, targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) > 1.5;
	};
	this.abilityTypes.Lunge.useOn = function (actingChar, targetTileIndex) {
		var indexList, moveToIndex, event, damage, flags;
		
		// Attributes:
		damage = Math.ceil(actingChar.weaponDamage() * this.attributes.damageMultiplier.value(actingChar));
		flags = {isSpecialAttack: true};
		
		indexList = gs.getIndexInRay(actingChar.tileIndex, targetTileIndex);
		moveToIndex = indexList[indexList.length - 2];
		
		// Move player:
		actingChar.body.moveToTileIndex(moveToIndex);
		actingChar.body.isKnockBack = true;
		
		// Add the attack event:
		event = {};
		event.updateFrame = function () {
			
		};
		event.isComplete = function () {
			if (actingChar.body.isAtDestination()) {
				let targetChar = gs.getChar(targetTileIndex);
				
				gs.meleeAttack(actingChar, targetTileIndex, damage, flags);
				
				actingChar.endTurn(100);
				
				// No cooldown on kill strike:
				if (targetChar && !targetChar.isAlive) {
					actingChar.selectedAbility.coolDown = 0;
				}
				
				return true;
			}
			else {
				return false;
			}
		};
		
		actingChar.eventQueue.addEvent(event);
	};
	
	// BERSERK:
	// Doubles the characters damage and movement speed
	// ********************************************************************************************
	this.abilityTypes.Berserk = {};
	this.abilityTypes.Berserk.useImmediately = true;
	this.abilityTypes.Berserk.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Berserk.getTarget = this.abilityGetTarget.Self;
	this.abilityTypes.Berserk.shouldUseOn = function (actingChar) {
		return actingChar.currentHp <= actingChar.maxHp / 2
			&& !actingChar.statusEffects.has('Berserk')
			&& game.rnd.frac() <= 0.5;
	};
	this.abilityTypes.Berserk.useOn = function (actingChar) {
		var duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Status Effect:
		actingChar.statusEffects.add('Berserk', {duration: duration});
	};
	
	
	
	// ********************************************************************************************
	// RANGE_ABILITIES:
	// ********************************************************************************************
	// POWER_SHOT:
	// Fires a single projectile from the players weapon which crit hits and deals knock back
	// ********************************************************************************************
	this.abilityTypes.PowerShot = {};
	this.abilityTypes.PowerShot.range = this.abilityRange.Weapon;
	this.abilityTypes.PowerShot.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.PowerShot.canUseOn = this.abilityCanUseOn.SingleCharacterRay;
	this.abilityTypes.PowerShot.canUse = this.abilityCanUse.RangeWeapon;
	this.abilityTypes.PowerShot.useOn = function (actingChar, targetTileIndex) {
		var proj, flags, damage;
		
		// Attributes:
		damage = Math.ceil(actingChar.weaponDamage() * this.attributes.damageMultiplier.value(actingChar));
		
		// Projectile Flags:
		flags = {
			knockBack: 2,
			isSpecialAttack: true
		};
		
		// Create Projectile:
		proj = actingChar.inventory.getWeapon().type.attackEffect.useOn(targetTileIndex, actingChar.inventory.getWeapon(), flags);
		proj.damage = damage;
	};

	
	// TUNNEL_SHOT:
	// Fires a single projectile from the players weapon which passes through targets crit hitting all of them
	// ********************************************************************************************
	this.abilityTypes.TunnelShot = {};
	this.abilityTypes.TunnelShot.range = this.abilityRange.Weapon;
	this.abilityTypes.TunnelShot.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.TunnelShot.canUseOn = this.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.TunnelShot.canUse = this.abilityCanUse.RangeWeapon;
	this.abilityTypes.TunnelShot.useOn = function (actingChar, targetTileIndex) {
		var flags, proj, damage;
		
		// Attributes:
		damage = Math.ceil(actingChar.weaponDamage() * this.attributes.damageMultiplier.value(actingChar));
		
		// Projectile Flags:
		flags = {
			isTunnelShot: true,
			isSpecialAttack: true,
		};
		
		proj = actingChar.inventory.getWeapon().type.attackEffect.useOn(targetTileIndex, actingChar.inventory.getWeapon(), flags);
		proj.damage = damage;
	};
	
	// DEAD_EYE:
	// ********************************************************************************************
	this.abilityTypes.DeadEye = {};
	this.abilityTypes.DeadEye.useImmediately = true;
	this.abilityTypes.DeadEye.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.DeadEye.useOn = function (actingChar) {
		var duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Status Effect:
		actingChar.statusEffects.add('DeadEye', {duration: duration});
	};
	
	// ********************************************************************************************
	// STEALTH_ABILITIES:
	// ********************************************************************************************
	// SLEEPING_DART:
	// ************************************************************************************************
	this.abilityTypes.SleepingDart = {};
	this.abilityTypes.SleepingDart.range = ABILITY_RANGE;
	this.abilityTypes.SleepingDart.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.SleepingDart.canUseOn = this.abilityCanUseOn.SingleCharacterRay;
	this.abilityTypes.SleepingDart.useOn = function (actingChar, targetTileIndex) {
		var flags;
		
		flags = {
			duration: this.attributes.duration.value(actingChar)
		};
		
		// Create projectile:
		gs.createProjectile(actingChar, targetTileIndex, 'SleepingDart', 0, flags);
		
		// Play sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
	}; 
	
	// SMOKE_BOMB:
	// ************************************************************************************************
	this.abilityTypes.SmokeBomb = {};
	//this.abilityTypes.SmokeBomb.dontEndTurn = true;
	this.abilityTypes.SmokeBomb.range = ABILITY_RANGE;
	this.abilityTypes.SmokeBomb.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.SmokeBomb.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleTileRay.call(this, actingChar, targetTileIndex)
			|| gs.vectorEqual(targetTileIndex, actingChar.tileIndex);
	};
	this.abilityTypes.SmokeBomb.useOn = function (actingChar, targetTileIndex) {
		var flags;
		
		flags = {
			duration: this.attributes.duration.value(actingChar)
		};
		
		// Create projectile:
		if (gs.vectorEqual(actingChar.tileIndex, targetTileIndex)) {
			gs.projectileEffects.SmokeBomb(gs.getTile(targetTileIndex), {flags: flags});
		}
		else {
			gs.createProjectile(actingChar, targetTileIndex, 'SmokeBomb', 0, flags);
			
			// Bounce and Face:
			actingChar.body.faceTileIndex(targetTileIndex);
			actingChar.body.bounceTowards(targetTileIndex);
		}
		
		// Play sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
	}; 
	
	// NIMBLE_FINGERS:
	// ************************************************************************************************
	gs.isTrap = function (obj) {
		return obj.type.name === 'FireShroom'
			|| obj.type.name === 'BearTrap'
			|| obj.type.name === 'FirePot'
			|| obj.type.name === 'GasPot';
	};
	
	this.abilityTypes.NimbleFingers = {};
	this.abilityTypes.NimbleFingers.range = 1.5;
	this.abilityTypes.NimbleFingers.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.NimbleFingers.canUseOn = function (actingChar, targetTileIndex) {
		return util.distance(actingChar.tileIndex, targetTileIndex) < this.range()
			&& (gs.getObj(targetTileIndex, obj => gs.isTrap(obj))
				|| gs.getChar(targetTileIndex) && gs.isTrap(gs.getChar(targetTileIndex)));
	};
	this.abilityTypes.NimbleFingers.canUse = function (actingChar) {
		var count = 0;
		
		count += actingChar.inventory.countItemOfType(gs.itemTypes.FireShroom);
		count += actingChar.inventory.countItemOfType(gs.itemTypes.BearTrap);
		count += actingChar.inventory.countItemOfType(gs.itemTypes.FirePot);
		count += actingChar.inventory.countItemOfType(gs.itemTypes.GasPot);
		
		return count < this.attributes.numTraps.value(actingChar);
	};
	this.abilityTypes.NimbleFingers.useOn = function (actingChar, targetTileIndex) {
		// Char:
		if (gs.getChar(targetTileIndex) && gs.isTrap(gs.getChar(targetTileIndex))) {
			
			gs.pc.inventory.addItem(Item.createItem(gs.getChar(targetTileIndex).type.name));
			gs.getChar(targetTileIndex).destroy();
		}
		// Object:
		else {
			gs.pc.inventory.addItem(Item.createItem(gs.getObj(targetTileIndex).type.name));
			
			gs.destroyObject(gs.getObj(targetTileIndex));
		}
	};
	
	// PLACE_TRAP:
	// ************************************************************************************************
	this.abilityTypes.PlaceTrap = {};
	this.abilityTypes.PlaceTrap.range = 1.5;
	this.abilityTypes.PlaceTrap.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.PlaceTrap.canUseOn = function (actingChar, targetTileIndex) {
		return util.distance(actingChar.tileIndex, targetTileIndex) < this.range()
			&& !gs.getObj(targetTileIndex) 
			&& gs.isPassable(targetTileIndex)
			&& !gs.isPit(targetTileIndex);
	};
	this.abilityTypes.PlaceTrap.useOn = function (actingChar, targetTileIndex) {
		// Char:
		if (gs.inArray(gs.pc.selectedItem.type.name, ['FireShroom', 'BearTrap'])) {
			gs.createObject(targetTileIndex, gs.pc.selectedItem.type.name);
		}
		// Object:
		else if (gs.inArray(gs.pc.selectedItem.type.name, ['FirePot', 'GasPot'])) {
			gs.createNPC(targetTileIndex, gs.pc.selectedItem.type.name);
		}
	};
	
	// SNEAK:
	// ************************************************************************************************
	this.abilityTypes.Sneak = {};
	this.abilityTypes.Sneak.useImmediately = true;
	this.abilityTypes.Sneak.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Sneak.useOn = function (actingChar) {
		actingChar.statusEffects.add('Sneak', {duration: 21});
	};

	// EVADE:
	// ************************************************************************************************
	this.abilityTypes.Evade = {};
	this.abilityTypes.Evade.useImmediately = true;
	this.abilityTypes.Evade.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Evade.useOn = function (actingChar) {
		for (let i = 0; i < gs.characterList.length; i += 1) {
			if (gs.characterList[i].isAgroed) {
				gs.characterList[i].isAgroed = false;
			}
		}
		gs.createParticlePoof(actingChar.tileIndex, 'SMOKE');
		actingChar.statusEffects.add('Sneak', {duration: 11});
	};
	
	// ********************************************************************************************
	// FIRE_MAGIC_ABILITIES:
	// ********************************************************************************************
	// FIRE_BALL:
	// ********************************************************************************************
	this.abilityTypes.FireBall = {};
	this.abilityTypes.FireBall.magicType = 'Fire';
	this.abilityTypes.FireBall.range = 5.5;
	this.abilityTypes.FireBall.aoeRange = 1.0;
	this.abilityTypes.FireBall.noParticlePoof = true;
	this.abilityTypes.FireBall.showTarget = this.abilityShowTarget.TBAoE;
	this.abilityTypes.FireBall.canUseOn = this.abilityCanUseOn.SingleTileRay;
	this.abilityTypes.FireBall.useOn = function (actingChar, targetTileIndex) {
		var damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Create projectile:
		gs.createProjectile(actingChar, targetTileIndex, 'FireBall', damage, {killer: actingChar});
	
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Effect:
		gs.createMagicShootEffect(actingChar, targetTileIndex, 'FireShoot');
		
		// Play sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
	};

	
	// FIRE_ATTUNEMENT:
	// ********************************************************************************************
	this.abilityTypes.FireAttunement = {};
	this.abilityTypes.FireAttunement.useImmediately = true;
	this.abilityTypes.FireAttunement.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.FireAttunement.useOn = function (actingChar) {
		var firePower, duration;
		
		// Attributes:
		firePower = this.attributes.firePower.value(actingChar);
		duration = this.attributes.duration.value(actingChar);
		
		// Status Effect:
		actingChar.statusEffects.add('FireAttunement', {firePower: firePower, duration: duration});
		
		// Particles:
		gs.createFireEffect(actingChar.tileIndex);
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// FLAMING_HANDS:
	// ********************************************************************************************
	this.abilityTypes.FlamingHands = {};
	this.abilityTypes.FlamingHands.magicType = 'Fire';
	this.abilityTypes.FlamingHands.useImmediately = true;
	this.abilityTypes.FlamingHands.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.FlamingHands.useOn = function (actingChar) {
		var duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Status Effect:
		actingChar.statusEffects.add('FlamingHands', {duration: duration});
		
		// Particles:
		gs.createFireEffect(actingChar.tileIndex);
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// FIRE_BOLT:
	// ********************************************************************************************
	this.abilityTypes.FireBolt = {};
	this.abilityTypes.FireBolt.magicType = 'Fire';
	this.abilityTypes.FireBolt.range = 5.5;
	this.abilityTypes.FireBolt.showTarget = this.abilityShowTarget.Bolt;
	this.abilityTypes.FireBolt.canUseOn = this.abilityCanUseOn.Bolt;
	this.abilityTypes.FireBolt.getTarget = this.abilityGetTarget.Bolt;
	this.abilityTypes.FireBolt.useOn = function (actingChar, targetTileIndex) {
		var indexList, damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		indexList = gs.getIndexInBRay(actingChar.tileIndex, targetTileIndex);
		
		indexList.forEach(function (tileIndex) {
			gs.createFire(tileIndex, damage, {killer: actingChar});
		}, this);
	
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
	};
	
	// BURST_OF_FLAME:
	// ********************************************************************************************
	this.abilityTypes.BurstOfFlame = {};
	this.abilityTypes.BurstOfFlame.magicType = 'Fire';
	this.abilityTypes.BurstOfFlame.range = ABILITY_RANGE;
	this.abilityTypes.BurstOfFlame.aoeRange = 3;
	this.abilityTypes.BurstOfFlame.showTarget = this.abilityShowTarget.BurstOfFlame;
	this.abilityTypes.BurstOfFlame.canUseOn = function (actingChar, targetTileIndex) {
		return gs.getTile(targetTileIndex).visible
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& (gs.isPassable(targetTileIndex) || gs.getChar(targetTileIndex) || gs.getObj(targetTileIndex, obj => obj.type.canBurstOfFlame));
	};
	this.abilityTypes.BurstOfFlame.useOn = function (actingChar, targetTileIndex) {
		var damage, objName;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Used on flaming object:
		if (gs.getObj(targetTileIndex, obj => obj.type.canBurstOfFlame)) {
			this.getIndexList(actingChar, targetTileIndex).forEach(function (tileIndex) {
				gs.createFire(tileIndex, damage, {killer: actingChar});
			}, this);
			
			// Must check for obj (in case a shroom was destroyed by the fire):
			if (gs.getObj(targetTileIndex)) {
				objName = gs.getObj(targetTileIndex).type.name;
				gs.destroyObject(gs.getObj(targetTileIndex));
				
				if (objName === 'Brazer') {
					gs.createObject(targetTileIndex, 'UnlitBrazer');
				}
			}
			
		}
		// Used on ground or enemy:
		else {
			gs.createFire(targetTileIndex, damage, {killer: actingChar});
		}
	};
	this.abilityTypes.BurstOfFlame.getIndexList = function (actingChar, targetTileIndex) {
		var indexList = gs.getIndexInRadius(targetTileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => gs.isStaticPassable(index));
		indexList = indexList.filter(index => gs.isRayStaticPassable(index, targetTileIndex));
		
		// Used on flaming objects on walls will only spread downwards:
		if (!gs.getTile(targetTileIndex).type.passable) {
			indexList = indexList.filter(index => index.y > targetTileIndex.y);
		}
		return indexList;
	};
	
	// INFERNO_ORB:
	// ********************************************************************************************
	this.abilityTypes.InfernoOrb = {};
	this.abilityTypes.InfernoOrb.magicType = 'Fire';
	this.abilityTypes.InfernoOrb.range = LOS_DISTANCE;
	this.abilityTypes.InfernoOrb.showTarget = this.abilityShowTarget.Bolt;
	this.abilityTypes.InfernoOrb.canUseOn = this.abilityCanUseOn.Bolt;
	this.abilityTypes.InfernoOrb.useOn = function (actingChar, targetTileIndex) {
		var orb, indexList, damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		indexList = gs.getIndexInBRay(actingChar.tileIndex, targetTileIndex);
		
		// Create Orb:
		orb = gs.createNPC(indexList[0], 'InfernoOrb', {burstDamage: damage});
		orb.waitTime = 100;
		
		// Setup orbs actionQueue:
		orb.actionQueue = [];
		for (let i = 1; i < indexList.length; i += 1) {
			orb.actionQueue.unshift({type: 'MOVE', tileIndex: indexList[i]});
		}
		orb.actionQueue.unshift({tileIndex: targetTileIndex, type: 'DEATH'});

		
	};
	

	
	// ********************************************************************************************
	// STORM_MAGIC_ABILITIES:
	// ********************************************************************************************	
	// LIGHTNING_BOLT:
	// ********************************************************************************************
	this.abilityTypes.LightningBolt = {};
	this.abilityTypes.LightningBolt.magicType = 'Storm';
	this.abilityTypes.LightningBolt.range = 5.5;
	this.abilityTypes.LightningBolt.showTarget = this.abilityShowTarget.Bolt;
	this.abilityTypes.LightningBolt.canUseOn = this.abilityCanUseOn.Bolt;
	this.abilityTypes.LightningBolt.getTarget = this.abilityGetTarget.Bolt;
	this.abilityTypes.LightningBolt.useOn = function (actingChar, targetTileIndex) {
		var indexList, damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		indexList = gs.getIndexInBRay(actingChar.tileIndex, targetTileIndex);
		
		indexList.forEach(function (tileIndex) {
			gs.createShock(tileIndex, damage, {killer: actingChar});
		}, this);
	
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 50);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
	};

	// STORM_ATTUNEMENT:
	// ********************************************************************************************
	this.abilityTypes.StormAttunement = {};
	this.abilityTypes.StormAttunement.useImmediately = true;
	this.abilityTypes.StormAttunement.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.StormAttunement.useOn = function (actingChar) {
		var duration, stormPower;
		
		// Attributes:
		stormPower = this.attributes.stormPower.value(actingChar);
		duration = this.attributes.duration.value(actingChar);
		
		// Status Effect:
		actingChar.statusEffects.add('StormAttunement', {stormPower: stormPower, duration: duration});
		
		// Particles:
		gs.createParticlePoof(actingChar.tileIndex, 'BLUE');
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// SHOCK:
	// ********************************************************************************************
	this.abilityTypes.Shock = {};
	this.abilityTypes.Shock.magicType = 'Storm';
	this.abilityTypes.Shock.range = 5;
	this.abilityTypes.Shock.depth = 2;
	this.abilityTypes.Shock.showTarget = this.abilityShowTarget.CharacterFlood;
	this.abilityTypes.Shock.canUseOn = this.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.Shock.useOn = function (actingChar, targetTileIndex) {
		var indexList, pred, damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		pred = function (tileIndex) {
			return gs.getChar(tileIndex) && gs.getChar(tileIndex) !== gs.pc;
		};
		
		indexList = gs.getIndexInFlood(targetTileIndex, pred, this.depth);
		
		indexList.forEach(function (tileIndex) {
			let modDamage;
			
			if (tileIndex.depth === 0) {
				modDamage = damage;
			}
			else {
				modDamage = Math.floor(damage * Math.pow(SPREAD_DAMAGE_MOD, tileIndex.depth));
			}
			
			gs.createShock(tileIndex, modDamage, {killer: actingChar});
		}, this);
	
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 50);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
		
	};

	// THUNDER_CLAP:
	// ********************************************************************************************
	this.abilityTypes.ThunderClap = {};
	this.abilityTypes.ThunderClap.magicType = 'Storm';
	this.abilityTypes.ThunderClap.useImmediately = true;
	this.abilityTypes.ThunderClap.aoeRange = 3;
	this.abilityTypes.ThunderClap.showTarget = this.abilityShowTarget.PBAoE;
	this.abilityTypes.ThunderClap.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.ThunderClap.useOn = function (actingChar, targetTileIndex) {
		var indexList, stunTurns;
		
		// Attributes:
		stunTurns = this.attributes.stunTurns.value(actingChar);
		
		indexList = gs.getIndexInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		indexList = indexList.filter(index => gs.getChar(index));
		
		indexList.forEach(function (tileIndex) {
			gs.getChar(tileIndex).statusEffects.add('Stunned', {duration: stunTurns + 1});
			gs.createParticlePoof(tileIndex, 'WHITE');
		}, this);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 300);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
	};
	
	// LEVITATION:
	// ********************************************************************************************
	this.abilityTypes.Levitation = {};
	this.abilityTypes.Levitation.magicType = 'Storm';
	this.abilityTypes.Levitation.useImmediately = true;
	this.abilityTypes.Levitation.isSustained = true;
	this.abilityTypes.Levitation.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Levitation.canUseOn = null;
	this.abilityTypes.Levitation.sustainedEffect = function (character) {
		character.isFlying += 1;
	};
	
	// STATIC_DISCHARGE:
	// ********************************************************************************************
	this.abilityTypes.StaticDischarge = {};
	this.abilityTypes.StaticDischarge.magicType = 'Storm';
	this.abilityTypes.StaticDischarge.useImmediately = true;
	this.abilityTypes.StaticDischarge.aoeRange = 3.0;
	this.abilityTypes.StaticDischarge.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.StaticDischarge.showTarget = this.abilityShowTarget.PBAoE;
	this.abilityTypes.StaticDischarge.useOn = function (actingChar) {
		var indexList, damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		indexList = gs.getIndexInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		indexList.forEach(function (tileIndex) {
			gs.createShock(tileIndex, damage, {killer: actingChar});
		}, this);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 59);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
		
	};
	
	
	// ********************************************************************************************
	// NECROMANCER_ABILITIES:
	// ********************************************************************************************
	// LIFE_SPIKE:
	this.abilityTypes.LifeSpike = {};
	this.abilityTypes.LifeSpike.magicType = 'Toxic';
	this.abilityTypes.LifeSpike.range = ABILITY_RANGE;
	this.abilityTypes.LifeSpike.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.LifeSpike.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.LifeSpike.canUseOn = this.abilityCanUseOn.SingleCharacterRay;
	this.abilityTypes.LifeSpike.useOn = function (actingChar, targetTileIndex) {
		var damage, duration;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		duration = this.attributes.duration.value(actingChar);
		
		// Create Projectile:
		gs.createProjectile(actingChar, targetTileIndex, 'LifeSpike', damage, {killer: actingChar, duration: duration});
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Effect:
		gs.createMagicShootEffect(actingChar, targetTileIndex, 'ToxicShoot');
		
		
		// Play Sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
	};

	
	// TOXIC_ATTUNEMENT:
	// ********************************************************************************************
	this.abilityTypes.ToxicAttunement = {};
	this.abilityTypes.ToxicAttunement.magicType = 'Toxic';
	this.abilityTypes.ToxicAttunement.useImmediately = true;
	this.abilityTypes.ToxicAttunement.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.ToxicAttunement.useOn = function (actingChar) {
		var toxicPower, duration;
		
		// Attributes:
		toxicPower = this.attributes.toxicPower.value(actingChar);
		duration = this.attributes.duration.value(actingChar);
		
		// Status Effect:
		actingChar.statusEffects.add('ToxicAttunement', {toxicPower: toxicPower, duration: duration});
		
		// Particles:
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// SUMMON_SKELETON:
	// ********************************************************************************************
	this.abilityTypes.SummonSkeleton = {};
	this.abilityTypes.SummonSkeleton.magicType = 'Toxic';
	this.abilityTypes.SummonSkeleton.isSummon = true;
	this.abilityTypes.SummonSkeleton.useImmediately = true;
	this.abilityTypes.SummonSkeleton.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.SummonSkeleton.getIndexList = function (actingChar) {
		var indexList;
		
		indexList = gs.getIndexInRadius(actingChar.tileIndex, 1.5);
		indexList = indexList.filter(index => gs.isPassable(index));
		indexList = indexList.filter(index => gs.isIndexSafe(index));
		indexList = indexList.filter(index => !gs.isPit(index));
		return indexList;
	};
	
	this.abilityTypes.SummonSkeleton.canUse = function (actingChar) {
		return this.getIndexList(actingChar).length > 0;	
	};
	this.abilityTypes.SummonSkeleton.useOn = function (actingChar) {
		var indexList, num, skeletonLevel;
		
		// Attributes:
		skeletonLevel = this.attributes.skeletonLevel.value(actingChar);
		
		// Get valid tileIndex:
		indexList = this.getIndexList(actingChar);
		
		gs.createSummonEffect(indexList[0], function () {
			let npc = gs.createNPC(indexList[0], 'Skeleton', {level: skeletonLevel});
			npc.faction = FACTION.PLAYER;
			npc.popUpText('Summoned', '#ffffff');
			npc.isAgroed = true;
			actingChar.summonIDList.push(npc.id);
			npc.summonerID = actingChar.id;
			npc.summonDuration = -1; // No duration
		}, this);

		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// INFECTIOUS_DISEASE:
	// ************************************************************************************************
	this.abilityTypes.InfectiousDisease = {};
	this.abilityTypes.InfectiousDisease.magicType = 'Toxic';
	this.abilityTypes.InfectiousDisease.range = 5.0;
	this.abilityTypes.InfectiousDisease.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.InfectiousDisease.canUseOn = this.abilityCanUseOn.SingleCharacterRay;
	this.abilityTypes.InfectiousDisease.useOn = function (actingChar, targetTileIndex) {
		var damage, duration;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		duration = this.attributes.duration.value(actingChar);
		
		gs.getChar(targetTileIndex).statusEffects.add('InfectiousDisease', {damage: damage, duration: duration});
		
	};

	
	// CANNIBALISE:
	// ************************************************************************************************
	this.abilityTypes.Cannibalise = {};
	this.abilityTypes.Cannibalise.useImmediately = true;
	this.abilityTypes.Cannibalise.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Cannibalise.useOn = function (actingChar) {
		actingChar.gainMp(6);
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
	};
	
	// POISON_CLOUD:
	// ********************************************************************************************
	this.abilityTypes.PoisonCloud = {};
	this.abilityTypes.PoisonCloud.magicType = 'Toxic';
	this.abilityTypes.PoisonCloud.range = ABILITY_RANGE;
	this.abilityTypes.PoisonCloud.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.PoisonCloud.canUseOn = this.abilityCanUseOn.SingleTileRay;
	this.abilityTypes.PoisonCloud.useOn = function (actingChar, targetTileIndex) {
		var damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Create Projectile:
		gs.createProjectile(actingChar, targetTileIndex, 'PlayerGasBall', damage, {killer: actingChar});
	
		// Play Sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
	};

	
	// ********************************************************************************************
	// ICE_MAGIC_ABILITIES:
	// ********************************************************************************************
	
	// CONE_OF_COLD:
	// ********************************************************************************************
	this.abilityTypes.ConeOfCold = {};
	this.abilityTypes.ConeOfCold.magicType = 'Cold';
	this.abilityTypes.ConeOfCold.range = ABILITY_RANGE;
	this.abilityTypes.ConeOfCold.aoeRange = 3;
	this.abilityTypes.ConeOfCold.showTarget = this.abilityShowTarget.Fan;
	this.abilityTypes.ConeOfCold.canUseOn = function () {return true;};
	this.abilityTypes.ConeOfCold.useOn = function (actingChar, targetTileIndex) {
		var indexList, delta, charList = [], damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		delta = gs.get8WayVector(actingChar.tileIndex, targetTileIndex);
		
		// Handle all tiles:
		indexList = gs.getIndexInFan(actingChar.tileIndex, this.aoeRange(actingChar), delta);
		indexList.forEach(function (tileIndex) {
			if (!gs.isRayClear(actingChar.tileIndex, tileIndex)) {
				return;
			}
			
			if (gs.getChar(tileIndex)) {
				charList.push(gs.getChar(tileIndex));
			}
			
			// Random Ice:
			if (!gs.getObj(tileIndex) && gs.getTile(tileIndex).type.name === 'Water') {
				gs.createObject(tileIndex, 'Ice');
			}
		}, this);
		
		// Sort to handle furthest characters first:
		charList.sort((a, b) => util.distance(actingChar.tileIndex, b.tileIndex) - util.distance(actingChar.tileIndex, a.tileIndex));
		
		// Handle all characters:
		charList.forEach(function (char) {
			var distance;
			
			if (util.distance(char.tileIndex, actingChar.tileIndex) < 1.5) {
				distance = 2;
			}
			else {
				distance = 1;
			}
			gs.createParticleBurst(char.sprite.position, delta, 'WHITE');
			char.body.applyKnockBack(delta, distance);
			char.takeDamage(damage, 'Cold', {killer: actingChar});
		}, this);
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		gs.createParticleBurst(actingChar.sprite.position, delta, 'WHITE');
		
	};

	
	// COLD_ATTUNEMENT:
	// ********************************************************************************************
	this.abilityTypes.ColdAttunement = {};
	this.abilityTypes.ColdAttunement.magicType = 'Cold';
	this.abilityTypes.ColdAttunement.useImmediately = true;
	this.abilityTypes.ColdAttunement.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.ColdAttunement.useOn = function (actingChar) {
		var coldPower, duration;
		
		// Attributes:
		coldPower = this.attributes.coldPower.value(actingChar);
		duration = this.attributes.duration.value(actingChar);
		
		// Status Effect:
		actingChar.statusEffects.add('ColdAttunement', {coldPower: coldPower, duration: duration});
		
		// Particles:
		gs.createIceEffect(actingChar.tileIndex);
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// FREEZING_CLOUD:
	// ********************************************************************************************
	this.abilityTypes.FreezingCloud = {};
	this.abilityTypes.FreezingCloud.magicType = 'Cold';
	this.abilityTypes.FreezingCloud.range = 4.0;
	this.abilityTypes.FreezingCloud.aoeRange = 1.5;
	this.abilityTypes.FreezingCloud.showTarget = this.abilityShowTarget.TBAoE;
	this.abilityTypes.FreezingCloud.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.FreezingCloud.useOn = function (actingChar, targetTileIndex) {
		var indexList, damage, duration;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		duration = this.attributes.duration.value(actingChar);
		
		indexList = gs.getIndexInRadius(targetTileIndex, this.aoeRange(actingChar));
		
		indexList.forEach(function (tileIndex) {
			if (gs.isStaticPassable(tileIndex) && !gs.getCloud(tileIndex)) {
				gs.createCloud(tileIndex, 'FreezingCloud', damage, duration);
			}
		}, this);
	};
	
	
	// FREEZE:
	// ********************************************************************************************
	this.abilityTypes.Freeze = {};
	this.abilityTypes.Freeze.magicType = 'Cold';
	this.abilityTypes.Freeze.range = 4.0;
	this.abilityTypes.Freeze.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Freeze.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleTileSmite.call(this, actingChar, targetTileIndex)
			&& !gs.getCloud(targetTileIndex);
	};
	this.abilityTypes.Freeze.useOn = function (actingChar, targetTileIndex) {
		var duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		gs.createParticlePoof(targetTileIndex, 'WHITE');
		gs.createIce(targetTileIndex, duration);
	};
	
	// ICE_ARMOR:
	// ********************************************************************************************
	this.abilityTypes.IceArmor = {};
	this.abilityTypes.IceArmor.magicType = 'Cold';
	this.abilityTypes.IceArmor.useImmediately = true;
	this.abilityTypes.IceArmor.isSustained = true;
	this.abilityTypes.IceArmor.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.IceArmor.canUseOn = null;
	this.abilityTypes.IceArmor.sustainedEffect = function (character) {
		character.protection += 5;
	};
	
	// FLASH_FREEZE:
	// ********************************************************************************************
	this.abilityTypes.FlashFreeze = {};
	this.abilityTypes.FlashFreeze.magicType = 'Cold';
	this.abilityTypes.FlashFreeze.useImmediately = true;
	this.abilityTypes.FlashFreeze.range = LOS_DISTANCE;
	this.abilityTypes.FlashFreeze.showTarget = this.abilityShowTarget.LoS;
	this.abilityTypes.FlashFreeze.canUseOn = this.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.FlashFreeze.useOn = function (actingChar, targetTileIndex) {
		var duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		gs.characterList.forEach(function (character) {
			if (gs.getTile(character.tileIndex).visible && character.isAlive && character.faction === FACTION.HOSTILE) {
				gs.createParticlePoof(character.tileIndex, 'WHITE');
				gs.createIce(character.tileIndex, duration);
			}	
		}, this);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 300);
	};
	
	// ********************************************************************************************
	// ENCHANTER_ABILITIES:
	// ********************************************************************************************
	// CONFUSION:
	// ********************************************************************************************
	this.abilityTypes.Confusion = {};
	this.abilityTypes.Confusion.range = 5.5;
	this.abilityTypes.Confusion.showTarget = this.abilityShowTarget.TBAoE;
	this.abilityTypes.Confusion.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.Confusion.useOn = function (actingChar, targetTileIndex) {
		var indexList, duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Targets:
		indexList = gs.getIndexInRadius(targetTileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => gs.getChar(index) && !gs.getChar(index).type.isMindless);
		
		// Effect:
		indexList.forEach(function (tileIndex) {
			gs.getChar(tileIndex).agroPlayer();
			gs.getChar(tileIndex).statusEffects.add('Confusion', {duration: duration});
			gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE'); 
		}, this);
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	this.abilityTypes.Confusion.aoeRange = function (actingChar) {
		return this.attributes.aoeRange.value(actingChar);
	};
	
	// FEAR:
	// ********************************************************************************************
	this.abilityTypes.Fear = {};
	this.abilityTypes.Fear.useImmediately = true;
	this.abilityTypes.Fear.showTarget = this.abilityShowTarget.PBAoE;
	this.abilityTypes.Fear.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.Fear.useOn = function (actingChar, targetTileIndex) {
		var indexList, duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Targets:
		indexList = gs.getIndexInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		indexList = indexList.filter(index => gs.getChar(index) && actingChar.isHostileToMe(gs.getChar(index)));
		
		// Effect:
		indexList.forEach(function (tileIndex) {
			if (gs.getChar(tileIndex).type.neverRun) {
				gs.getChar(tileIndex).popUpText('Immune', '#ffffff');
			}
			else {
				gs.createParticlePoof(tileIndex, 'PURPLE');
				gs.getChar(tileIndex).agroPlayer();
				gs.getChar(tileIndex).statusEffects.add('Feared', {duration: duration});
			}
			
		}, this);
		
		// Caster particles and text:
		gs.pc.popUpText('Fear!', '#ffffff');
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
	};
	this.abilityTypes.Fear.aoeRange = function (actingChar) {
		return this.attributes.aoeRange.value(actingChar);
	};

	
	// CHARM:
	// ********************************************************************************************
	this.abilityTypes.Charm = {};
	this.abilityTypes.Charm.range = 5.5;
	this.abilityTypes.Charm.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Charm.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& !gs.getChar(targetTileIndex).type.cantMove
			&& !gs.getChar(targetTileIndex).type.isMindless
			&& gs.getChar(targetTileIndex).faction !== actingChar.faction;
	};
	this.abilityTypes.Charm.useOn = function (actingChar, targetTileIndex) {
		var char, duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Effect:
		char = gs.getChar(targetTileIndex);
		char.agroPlayer();
		char.faction = FACTION.PLAYER;
		char.statusEffects.add('Charm', {duration: duration});
		
		// Pop Up:
		char.popUpText('Charmed!', '#ffffff');
		
		// Particles:
		gs.createParticlePoof(targetTileIndex, 'PURPLE'); 
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};

	
	// MESMERIZE:
	// ********************************************************************************************
	this.abilityTypes.Mesmerize = {};
	this.abilityTypes.Mesmerize.range = 5.5;
	this.abilityTypes.Mesmerize.aoeRange = 1.5;
	this.abilityTypes.Mesmerize.showTarget = this.abilityShowTarget.TBAoE;
	this.abilityTypes.Mesmerize.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.Mesmerize.useOn = function (actingChar, targetTileIndex) {
		var indexList, duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Targets:
		indexList = gs.getIndexInRadius(targetTileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => gs.getChar(index) && !gs.getChar(index).type.isMindless);
		
		// Effect:
		indexList.forEach(function (tileIndex) {
			gs.getChar(tileIndex).agroPlayer();
			gs.getChar(tileIndex).goToSleep();
			gs.getChar(tileIndex).statusEffects.add('DeepSleep', {duration: duration});
			gs.createParticlePoof(tileIndex, 'MEZ', 10); 
		}, this);
		
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};

	this.abilityTypes.Swiftness = {};
	this.abilityTypes.Swiftness.useImmediately = true;
	this.abilityTypes.Swiftness.isSustained = true;
	this.abilityTypes.Swiftness.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Swiftness.canUseOn = null;
	this.abilityTypes.Swiftness.sustainedEffect = function (character) {
		character.bonusMovementSpeed += 1;
	};
	
	// ********************************************************************************************
	// MISC_ABILITIES:
	// Many of these are attached to charms, wands or scrolls:
	// ********************************************************************************************
	// SCROLL_OF_FEAR:
	// ********************************************************************************************
	this.abilityTypes.ScrollOfFear = {};
	this.abilityTypes.ScrollOfFear.useImmediately = true;
	this.abilityTypes.ScrollOfFear.range = LOS_DISTANCE;
	this.abilityTypes.ScrollOfFear.showTarget = this.abilityShowTarget.LoS;
	this.abilityTypes.ScrollOfFear.useOn = function (actingChar, targetTileIndex) {
	
		gs.characterList.forEach(function (character) {
			if (gs.getTile(character.tileIndex).visible && character.isAlive && character.faction === FACTION.HOSTILE) {
				if (character.type.neverRun) {
					character.popUpText('Immune', '#ffffff');
				}
				else {
					gs.createParticlePoof(character.tileIndex, 'PURPLE');
					character.agroPlayer();
					character.statusEffects.add('Feared', {duration: 20});
				}
			}	
		}, this);
		
		// Caster particles and text:
		gs.pc.popUpText('Fear!', '#ffffff');
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
	};
	
	// HELL_FIRE:
	// ********************************************************************************************
	this.abilityTypes.HellFire = {};
	this.abilityTypes.HellFire.range = LOS_DISTANCE;
	this.abilityTypes.HellFire.showTarget = this.abilityShowTarget.LoS;
	this.abilityTypes.HellFire.useImmediately = true;
	this.abilityTypes.HellFire.useOn = function (actingChar, targetTileIndex) {
		var damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		gs.characterList.forEach(function (character) {
			if (gs.getTile(character.tileIndex).visible && character.isAlive && character.faction === FACTION.HOSTILE) {
				gs.createFire(character.tileIndex, damage, {killer:gs.pc});
			}	
		}, this);
		
		game.camera.shake(0.02, 300);
		game.camera.flash(0xff0000, 20);
		gs.playSound(gs.sounds.explosion, gs.pc.tileIndex);
	};
	
	// BLINK:
	// ********************************************************************************************
	this.abilityTypes.Blink = {};
	this.abilityTypes.Blink.range = LOS_DISTANCE;
	this.abilityTypes.Blink.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Blink.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleTileSmite.call(this, actingChar, targetTileIndex)
			&& gs.isPassable(targetTileIndex);
	};
	this.abilityTypes.Blink.useOn = function (actingChar, targetTileIndex) {
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		gs.playSound(gs.sounds.teleport, gs.pc.tileIndex);
		actingChar.teleportTo(targetTileIndex);
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
	};
	
	// HEALING:
	// ********************************************************************************************
	this.abilityTypes.Healing = {};
	this.abilityTypes.Healing.useImmediately = true;
	this.abilityTypes.Healing.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Healing.useOn = function (actingChar) {
		gs.pc.cure();
		
		gs.pc.healHp(gs.pc.maxHp);
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	
		// Effect:
		gs.createHealingEffect(gs.pc.tileIndex);
		
	};
	this.abilityTypes.Healing.desc = "Completely restores your HP and cures physical effects.";
	
	// ENERGY:
	// ********************************************************************************************
	this.abilityTypes.Energy = {};
	this.abilityTypes.Energy.useImmediately = true;
	this.abilityTypes.Energy.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Energy.useOn = function (actingChar) {
		gs.pc.mentalCure();
		
		gs.pc.gainMp(gs.pc.maxMp);
		gs.pc.resetAllCoolDowns();
		
		// Sound:
		gs.playSound(gs.sounds.cure, this.tileIndex);
		
		// Effect:
		gs.createManaEffect(gs.pc.tileIndex);
	};
	this.abilityTypes.Energy.desc = "Completely restores your MP and cures mental effects.";
	
	// DOMINATION:
	// ********************************************************************************************
	this.abilityTypes.Domination = {};
	this.abilityTypes.Domination.range = 5.5;
	this.abilityTypes.Domination.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Domination.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& !gs.getChar(targetTileIndex).type.cantMove
			&& !gs.getChar(targetTileIndex).type.isMindless;
	};
	this.abilityTypes.Domination.useOn = function (actingChar, targetTileIndex) {
		var char;
		
		char = gs.getChar(targetTileIndex);
		char.faction = FACTION.PLAYER;
		char.isAsleep = false;
		
		// Pop Up:
		char.popUpText('Charmed!', '#ffffff');
		
		// Particles:
		gs.createParticlePoof(targetTileIndex, 'PURPLE'); 
	};
	
	// SPRINT:
	// Sprints towards a target and deals a critical hit + knockback
	// ********************************************************************************************
	this.abilityTypes.Sprint = {};
	this.abilityTypes.Sprint.dontEndTurn = true;
	this.abilityTypes.Sprint.range = LOS_DISTANCE;
	this.abilityTypes.Sprint.showTarget = this.abilityShowTarget.Path;
	this.abilityTypes.Sprint.canUse = function (actingChar) {
		return !actingChar.isImmobile;
	};
	
	this.abilityTypes.Sprint.canUseOn = function (actingChar, targetTileIndex) {
		var path = actingChar.getPathTo(targetTileIndex, true);
		return gs.isPassable(targetTileIndex)
			&& !actingChar.cantMoveFromCharm(targetTileIndex)
			&& path
			&& path.length > 0
			&& path.length <= this.attributes.maxPath.value(actingChar);
	};
	this.abilityTypes.Sprint.useOn = function (actingChar, targetTileIndex) {
		var path = actingChar.getPathTo(targetTileIndex, true);
		
		for (let i = 0; i < path.length; i += 1) {
			actingChar.actionQueue[i] = {type: 'CLICK', tileIndex: path[i], shift: true};
		}
		
		actingChar.fastMove = 1;
		actingChar.statusEffects.remove('Slow');
		actingChar.statusEffects.add('Sprint', {tileIndex: {x: targetTileIndex.x, y: targetTileIndex.y}});
		gs.keyBoardMode = false;
	};
	
	
	// SUMMON_BLADES:
	// ********************************************************************************************
	this.abilityTypes.SummonBlades = {};
	this.abilityTypes.SummonBlades.useImmediately = true;
	this.abilityTypes.SummonBlades.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.SummonBlades.canUse = function (actingChar) {
		return gs.getIndexInRadius(actingChar.tileIndex, 1.5).filter(index => gs.isPassable(index)).length > 0;	
	};
	this.abilityTypes.SummonBlades.useOn = function (actingChar) {
		var indexList, npc, num, level;
		
		// Get valid tileIndex:
		indexList = gs.getIndexInRadius(actingChar.tileIndex, 1.5);
		indexList = indexList.filter(index => gs.isPassable(index));
		indexList = indexList.filter(index => gs.isIndexSafe(index));
		
		// Scale base on player level:
		if (actingChar.level >= 12) {
			num = 8;
			level = 8;
		}
		else if (actingChar.level >= 6) {
			num = 6;
			level = 6;
		}
		else {
			num = 4;
			level = 4;
		}
		
		
		for (let i = 0; i < Math.min(num, indexList.length); i += 1) {
			gs.createSummonEffect(indexList[i], function () {
				let npc = gs.createNPC(indexList[i], 'SpectralBlade', {summonerID: actingChar.id, level: level});
				npc.faction = FACTION.PLAYER;
				actingChar.summonIDList.push(npc.id);
				npc.summonerID = actingChar.id;
				npc.isAgroed = true;
				npc.popUpText('Summoned', '#ffffff');
			}, this);
		}
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// LIFE_DRAIN:
	// ********************************************************************************************
	this.abilityTypes.LifeDrain = {};
	this.abilityTypes.LifeDrain.useImmediately = true;
	this.abilityTypes.LifeDrain.aoeRange = 3.0;
	this.abilityTypes.LifeDrain.showTarget = this.abilityShowTarget.PBAoE;
	this.abilityTypes.LifeDrain.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.LifeDrain.useOn = function (actingChar, targetTileIndex) {
		var indexList, damage, totalDamage = 0;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Targets:
		indexList = gs.getIndexInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		indexList = indexList.filter(index => gs.getChar(index) && actingChar.isHostileToMe(gs.getChar(index)));
		
		// Effect:
		indexList.forEach(function (tileIndex) {
			let char = gs.getChar(tileIndex);
			
			totalDamage += char.takeDamage(damage, 'Toxic');
			
			
			char.popUpText('Life Drain', '#ffffff');
			gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
			
		}, this);
		
		actingChar.healHp(totalDamage);
		
		// Caster particles and text:
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
	};
};

// SET_ABILITY_STATS:
// ************************************************************************************************
gs.setAbilityStats = function () {
	// MANA:
	// ********************************************************************************************
	// Fire Magic:
	this.abilityTypes.FireBall.mana = 3;
	this.abilityTypes.BurstOfFlame.mana = 4;
	this.abilityTypes.FireBolt.mana = 4;
	this.abilityTypes.FlamingHands.mana = 4;
	this.abilityTypes.InfernoOrb.mana = 5;
	
	// Storm Magic:
	this.abilityTypes.LightningBolt.mana = 3;
	this.abilityTypes.ThunderClap.mana = 4;
	this.abilityTypes.Shock.mana = 4;
	this.abilityTypes.Levitation.mana = 6;
	this.abilityTypes.StaticDischarge.mana = 5;
	
	// Necromancer Magic:
	this.abilityTypes.LifeSpike.mana = 3;
	this.abilityTypes.Cannibalise.mana = 0;
	this.abilityTypes.Cannibalise.hitPointCost = 8;
	this.abilityTypes.InfectiousDisease.mana = 4;
	this.abilityTypes.SummonSkeleton.mana = 3;
	this.abilityTypes.PoisonCloud.mana = 5;
	
	// Cold Magic:
	this.abilityTypes.ConeOfCold.mana = 3;
	this.abilityTypes.FreezingCloud.mana = 4;
	this.abilityTypes.Freeze.mana = 4;
	this.abilityTypes.IceArmor.mana = 6;
	this.abilityTypes.FlashFreeze.mana = 5;
	
	// Enchantment Magic:
	this.abilityTypes.Confusion.mana = 3;
	this.abilityTypes.Fear.mana = 3;
	this.abilityTypes.Charm.mana = 4;
	this.abilityTypes.Mesmerize.mana = 4;
	this.abilityTypes.Swiftness.mana = 6;
	
	
	// COOL_DOWNS:
	// ********************************************************************************************
	// Fire Magic:
	this.abilityTypes.FireAttunement.coolDown = 250;
	
	// Storm Magic:
	this.abilityTypes.StormAttunement.coolDown = 250;
	
	// Necromancy:
	this.abilityTypes.ToxicAttunement.coolDown = 250;
	
	// Ice Magic:
	this.abilityTypes.ColdAttunement.coolDown = 250;
	
	// Armor:
	this.abilityTypes.ShieldsUp.coolDown = 10;
	this.abilityTypes.Deflect.coolDown = 20;
	
	// Melee:
	this.abilityTypes.PowerStrike.coolDown = 10;
	this.abilityTypes.Disengage.coolDown = 10;
	this.abilityTypes.Charge.coolDown = 20;
	this.abilityTypes.Lunge.coolDown = 20;
	this.abilityTypes.WarCry.coolDown = 250;
	this.abilityTypes.Berserk.coolDown = 250;
	
	// Range:
	this.abilityTypes.PowerShot.coolDown = 10;
	this.abilityTypes.TunnelShot.coolDown = 20;
	this.abilityTypes.DeadEye.coolDown = 250;
	
	// Stealth:
	this.abilityTypes.SleepingDart.coolDown = 10;
	this.abilityTypes.SmokeBomb.coolDown = 20;
	this.abilityTypes.Sneak.coolDown = 20;
	this.abilityTypes.Evade.coolDown = 100;
	
	// Athletics:
	this.abilityTypes.Sprint.coolDown = 20;
	
	// NECROMANCY_ATTRIBUTES:
	// ********************************************************************************************
	this.abilityTypes.LifeSpike.attributes = {
		damage: 			{base: [null, 4, 6, 7], modifier: 'toxicDamageMultiplier'},
		duration: 			{base: [null, 5, 5, 5], modifier: 'toxicDamageMultiplier'},
	};
	this.abilityTypes.InfectiousDisease.attributes = {
		damage:				{base: [null, 3, 5, 6], modifier: 'toxicDamageMultiplier'},
		duration:			{base: [null, 15, 15, 15], modifier: 'toxicDamageMultiplier'},
	};
	this.abilityTypes.PoisonCloud.attributes = {
		damage:				{base: [null, 6, 8, 9], modifier: 'toxicDamageMultiplier'},
	};
	this.abilityTypes.ToxicAttunement.attributes = {
		toxicPower:			{base: [null, 10, 14, 16], modifier: null},
		duration:			{base: [null, 10, 10, 10], modifier: null},
	};
	this.abilityTypes.SummonSkeleton.attributes = {
		skeletonLevel:		{base: [null, 6, 10, 12], modifier: null},
	};
	
	// FIRE_MAGIC_ATTRIBUTES:
	// ********************************************************************************************
	this.abilityTypes.FireBall.attributes = {
		damage:				{base: [null, 14, 18, 20], modifier: 'fireDamageMultiplier'},
	};
	this.abilityTypes.BurstOfFlame.attributes = {
		damage:				{base: [null, 22, 28, 32], modifier: 'fireDamageMultiplier'},
	};
	this.abilityTypes.FireBolt.attributes = {
		damage:				{base: [null, 16, 20, 22], modifier: 'fireDamageMultiplier'},
	};
	this.abilityTypes.InfernoOrb.attributes = {
		damage:				{base: [null, 26, 34, 40], modifier: 'fireDamageMultiplier'},
	};
	this.abilityTypes.FireAttunement.attributes = {
		firePower:			{base: [null, 10, 14, 16], modifier: null},
		duration:			{base: [null, 10, 10, 10], modifier: null},
	};
	this.abilityTypes.FlamingHands.attributes = {
		damage:				{base: [null, 5, 5, 5], modifier: 'fireDamageMultiplier'},
		duration:			{base: [null, 10, 15, 20], modifier: 'fireDamageMultiplier'},
	};
	
	// STORM_MAGIC_ATTRIBUTES:
	// ********************************************************************************************
	this.abilityTypes.LightningBolt.attributes = {
		damage:				{base: [null, 14, 18, 20], modifier: 'shockDamageMultiplier'}
	};
	this.abilityTypes.Shock.attributes = {
		damage:				{base: [null, 18, 22, 24], modifier: 'shockDamageMultiplier'}
	};
	this.abilityTypes.ThunderClap.attributes = {
		stunTurns:			{base: [null, 3, 5, 6], nodifier: null}
	};
	this.abilityTypes.StaticDischarge.attributes = {
		damage:				{base: [null, 22, 30, 36], modifier: 'shockDamageMultiplier'}
	};	
	this.abilityTypes.StormAttunement.attributes = {
		stormPower:			{base: [null, 10, 14, 16], modifier: null},
		duration:			{base: [null, 10, 10, 10], modifier: null},
	};
	
	// MELEE_ATTRIBUTES:
	// ********************************************************************************************
	this.abilityTypes.PowerStrike.attributes = {
		damageMultiplier:	{base: [null, 2.0, 2.2, 2.4], modifier: null}
	};
	this.abilityTypes.Disengage.attributes = {
		damageMultiplier:	{base: [null, 2.0, 2.2, 2.4], modifier: null}
	};
	this.abilityTypes.Charge.attributes = {
		maxPath:			{base: [null, 4, 5, 6], modifier: null}
	};
	this.abilityTypes.Lunge.attributes = {
		range:				{base: [null, 3, 4, 5], modifier: null},
		damageMultiplier:	{base: [null, 2.0, 2.2, 2.4], modifier: null}
	};
	this.abilityTypes.Berserk.attributes = {
		duration:			{base: [null, 12, 16, 20], modifier: null}
	};
	
	// RANGE_ATTRIBUTES:
	// ********************************************************************************************
	this.abilityTypes.PowerShot.attributes = {
		damageMultiplier:	{base: [null, 2.0, 2.2, 2.4], modifier: null}
	};
	this.abilityTypes.TunnelShot.attributes = {
		damageMultiplier:	{base: [null, 2.0, 2.2, 2.4], modifier: null}
	};
	this.abilityTypes.DeadEye.attributes = {
		duration:			{base: [null, 12, 16, 20], modifier: null}
	};
	
	// DEFENSE_ATTRIBUTES:
	// ********************************************************************************************
	this.abilityTypes.Deflect.attributes = {
		duration:			{base: [null, 8, 10, 12], modifier: null}
	};
	
	// COLD_MAGIC_ATTRIBUTES:
	// ********************************************************************************************
	this.abilityTypes.ConeOfCold.attributes = {
		damage:				{base: [null, 10, 14, 16], modifier: 'coldDamageMultiplier'}
	};
	this.abilityTypes.FreezingCloud.attributes = {
		damage:				{base: [null, 3, 5, 6], modifier: 'coldDamageMultiplier'},
		duration:			{base: [null, 10, 10, 10], modifier: 'coldDamageMultiplier'}
	};
	this.abilityTypes.Freeze.attributes = {
		duration:			{base: [null, 8, 12, 14], modifier: 'coldDamageMultiplier'}
	};
	this.abilityTypes.ColdAttunement.attributes = {
		coldPower:			{base: [null, 10, 14, 16], modifier: null},
		duration:			{base: [null, 10, 10, 10], modifier: null},
	};
	this.abilityTypes.FlashFreeze.attributes = {
		duration:			{base: [null, 5, 7, 8]},
	};
	
	// ENCHANTMENT_MAGIC_ATTRIBUTES:
	// ********************************************************************************************
	this.abilityTypes.Confusion.attributes = {
		duration:			{base: [null, 10, 14, 16], modifier: 'spellDamageMultiplier'},
		aoeRange:			{base: [null, 0, 1, 1.5], modifier: null},
	};
	this.abilityTypes.Fear.attributes = {
		duration:			{base: [null, 6, 8, 10], modifier: 'spellDamageMultiplier'},
		aoeRange:			{base: [null, 1.5, 2.0, 2.5], modifier: null}
	};
	this.abilityTypes.Charm.attributes = {
		duration:			{base: [null, 20, 28, 34], modifier: 'spellDamageMultiplier'},
	};
	this.abilityTypes.Mesmerize.attributes = {
		duration:			{base: [null, 5, 7, 8], modifier: 'spellDamageMultiplier'},
	};

	// ATHLETICS_ATTRIBUTES:
	// ********************************************************************************************
	this.abilityTypes.Sprint.attributes = {
		maxPath:			{base: [null, 5, 6, 7], modifier: null}
	};
	

	// STEALTH_ATTRIBUTES:
	// ********************************************************************************************
	this.abilityTypes.SleepingDart.attributes = {
		duration:			{base: [null, 5, 7, 8], modifier: null}
	};
	this.abilityTypes.SmokeBomb.attributes = {
		duration:			{base: [null, 5, 8, 10], modifier: null}
	};
	this.abilityTypes.NimbleFingers.attributes = {
		numTraps:			{base: [null, 3, 5, 7], modifier: null}
	};
	
	// MISC_ATTRIBUTES:
	this.abilityTypes.HellFire.attributes = {
		damage:				{base: [null, HELL_FIRE_DAMAGE], modifier: null}	
	};
	
	this.abilityTypes.LifeDrain.attributes = {
		damage:				{base: [null, 10], modifier: null}
	};
	
	
	// Create Attribute Value funcs:
	this.forEachType(this.abilityTypes, function (talentType) {
		if (talentType.attributes) {			
			for (let key in talentType.attributes) {
				if (talentType.attributes.hasOwnProperty(key)) {
					let attribute = talentType.attributes[key];
					
					attribute.name = key;
					
					// Value Func:
					if (attribute.base) {
						attribute.value = function (actingChar) {
						
							if (this.modifier) {
								return Math.ceil(this.base[actingChar.getTalentLevel(talentType.name)] * actingChar[this.modifier]);
							}
							else {
								return this.base[actingChar.getTalentLevel(talentType.name)];
							}
						};
					}
					
				}
				
			}
		}
	}, this);
	
	
	// PARTICLE:
	// ********************************************************************************************
	// Fire Magic:
	this.abilityTypes.FireBall.particleColor = 'RED';
	this.abilityTypes.BurstOfFlame.particleColor = 'RED';
	this.abilityTypes.InfernoOrb.particleColor = 'RED';
	this.abilityTypes.FireBolt.particleColor = 'RED';
	
	// Storm Magic:
	this.abilityTypes.LightningBolt.particleColor = 'BLUE';
	this.abilityTypes.Shock.particleColor = 'BLUE';
	this.abilityTypes.ThunderClap.particleColor = 'BLUE';
	this.abilityTypes.StaticDischarge.particleColor = 'BLUE';
	
	// Necromancy:
	this.abilityTypes.LifeSpike.particleColor = 'PURPLE';
	this.abilityTypes.Cannibalise.particleColor = 'PURPLE';
	this.abilityTypes.PoisonCloud.particleColor = 'PURPLE';
	this.abilityTypes.InfectiousDisease.particleColor = 'PURPLE';
	
	// Cold:
	this.abilityTypes.ConeOfCold.particleColor = 'WHITE';
	this.abilityTypes.FreezingCloud.particleColor = 'WHITE';
	this.abilityTypes.Freeze.particleColor = 'WHITE';
	this.abilityTypes.FlashFreeze.particleColor = 'WHITE';
	
	// Enchantment:
	this.abilityTypes.Confusion.particleColor = 'PURPLE';
	this.abilityTypes.Charm.particleColor = 'PURPLE';
	this.abilityTypes.Mesmerize.particleColor = 'PURPLE';
	this.abilityTypes.Fear.particleColor = 'PURPLE';
	
	// IMAGE_INDEX:
	// ********************************************************************************************
	// Armor and Shields:
	this.abilityTypes.ShieldsUp.frame = 1488;
	this.abilityTypes.Deflect.frame = 1489;
	
	// Fire Magic:
	this.abilityTypes.FireBall.frame = 1376;
	this.abilityTypes.FireAttunement.frame = 1377;
	this.abilityTypes.BurstOfFlame.frame = 1378;
	this.abilityTypes.InfernoOrb.frame = 1379;
	this.abilityTypes.FlamingHands.frame = 1380;
	this.abilityTypes.FireBolt.frame = 1381;

	// Storm Magic:
	this.abilityTypes.LightningBolt.frame = 1392;
	this.abilityTypes.StormAttunement.frame = 1393;
	this.abilityTypes.Shock.frame = 1395;
	this.abilityTypes.ThunderClap.frame = 1394;
	this.abilityTypes.StaticDischarge.frame = 1395;
	this.abilityTypes.Levitation.frame = 1396;
	
	// Necromancy:
	this.abilityTypes.LifeSpike.frame = 1424;
	this.abilityTypes.ToxicAttunement.frame = 1425;
	this.abilityTypes.SummonSkeleton.frame = 1426;
	this.abilityTypes.Cannibalise.frame = 1427;
	this.abilityTypes.PoisonCloud.frame = 1428;
	this.abilityTypes.InfectiousDisease.frame = 1429;
	
	// Cold Magic:
	this.abilityTypes.ConeOfCold.frame = 1408;
	this.abilityTypes.FreezingCloud.frame = 1409;
	this.abilityTypes.ColdAttunement.frame = 1410;
	this.abilityTypes.Freeze.frame = 1411;
	this.abilityTypes.FlashFreeze.frame = 1412;
	this.abilityTypes.IceArmor.frame = 1413;
	
	// Enchantment:
	this.abilityTypes.Confusion.frame = 1520;
	this.abilityTypes.Charm.frame = 1521;
	this.abilityTypes.Mesmerize.frame = 1522;
	this.abilityTypes.Fear.frame = 1523;
	this.abilityTypes.Swiftness.frame = 1524;
	
	// Melee:
	this.abilityTypes.PowerStrike.frame = 1440;
	this.abilityTypes.Charge.frame = 1441;
	this.abilityTypes.Berserk.frame = 1442;
	this.abilityTypes.WarCry.frame  = 1443;
	this.abilityTypes.Disengage.frame = 1444;
	this.abilityTypes.Lunge.frame = 1445;
	
	// Range:
	this.abilityTypes.PowerShot.frame = 1456;
	this.abilityTypes.TunnelShot.frame = 1458;
	this.abilityTypes.DeadEye.frame = 1459;
	
	// Stealth:
	//this.abilityTypes.Sneak.frame = 1472;
	this.abilityTypes.SleepingDart.frame = 1472;
	this.abilityTypes.SmokeBomb.frame = 1473;
	this.abilityTypes.NimbleFingers.frame = 1474;
	this.abilityTypes.Evade.frame = 1475;
	
	// Athletics:
	this.abilityTypes.Sprint.frame = 1504;

	
};

// SET_ABILITY_TYPE_DEFAULTS:
// ************************************************************************************************
gs.setAbilityTypeDefaults = function () {
	var trueFunc = function () {return true;},
		rangeFunc = function () {return ABILITY_RANGE;};
	
	
	this.nameTypes(this.abilityTypes);
	this.forEachType(this.abilityTypes, function (abilityType) {

		// RANGE:
		// ****************************************************************************************
		
		// Converting numbers to range() func:
		if (typeof abilityType.range === 'number') {
			var range = abilityType.range;
			abilityType.range = function (actingChar) {
				return range;
			};
		}
		// Default to max range:
		else if (!abilityType.range){
			abilityType.range = rangeFunc;
		}
		
		// Converting aoeRange numbers to func:
		if (typeof abilityType.aoeRange === 'number') {
			var aoeRange = abilityType.aoeRange;
			abilityType.aoeRange = function (actingChar) {
				return aoeRange;
			};
		}
		
	
		abilityType.canUse = abilityType.canUse || trueFunc;
		abilityType.mana = abilityType.mana || 0;
		abilityType.coolDown = abilityType.coolDown || 0;
		abilityType.hitPointCost = abilityType.hitPointCost || 0;
		
		// Desc:
		if (gs.talents[abilityType.name] && gs.talents[abilityType.name].desc) {
			abilityType.desc = gs.talents[abilityType.name].desc;
		}
		else if (!abilityType.desc) {
			abilityType.desc = '';
		}
	}, this);
};