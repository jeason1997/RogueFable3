/*global gs, game, util*/
/*global TILE_SIZE*/
/*global GREEN_TARGET_BOX_FRAME, PURPLE_SELECT_BOX_FRAME, RED_SELECT_BOX_FRAME*/
/*global GREEN_BOX_FRAME, PURPLE_BOX_FRAME, RED_BOX_FRAME*/
/*global FACTION*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CREATE_ABILITY_HELPERS:
// ************************************************************************************************
gs.createAbilityHelpers = function () {
	this.createAbilityRange();
	this.createAbilityShowTarget();
	this.createAbilityCanUse();
	this.createAbilityCanUseOn();
	this.createAbilityGetTarget();
};

// CREATE_ABILITY_RANGE:
// ************************************************************************************************
gs.createAbilityRange = function () {
	this.abilityRange = {};
	
	// WEAPON:
	// Use the range of the characters currently equipped weapon
	// ********************************************************************************************
	this.abilityRange.Weapon = function () {
		return gs.pc.weaponRange();
	};
};

// CREATE_ABILITY_SHOW_TARGET:
// ************************************************************************************************
gs.createAbilityShowTarget = function () {
	this.abilityShowTarget = {};
	
	// SELF_TARGET:
	// ********************************************************************************************
	gs.abilityShowTarget.SelfTarget = function (targetTileIndex) {
		gs.targetSprites[0].x = gs.pc.tileIndex.x * TILE_SIZE;
		gs.targetSprites[0].y = gs.pc.tileIndex.y * TILE_SIZE;
		gs.targetSprites[0].visible = true;
		gs.targetSprites[0].frame = GREEN_TARGET_BOX_FRAME;
	};

	// SINGLE_TARGET:
	// ********************************************************************************************
	gs.abilityShowTarget.SingleTarget = function (targetTileIndex) {
		// Valid Target:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			gs.targetSprites[0].x = targetTileIndex.x * TILE_SIZE;
			gs.targetSprites[0].y = targetTileIndex.y * TILE_SIZE;
			gs.targetSprites[0].visible = true;
			gs.targetSprites[0].frame = PURPLE_SELECT_BOX_FRAME;
		}
		// Invalid Target:
		else {
			gs.targetSprites[0].x = targetTileIndex.x * TILE_SIZE;
			gs.targetSprites[0].y = targetTileIndex.y * TILE_SIZE;
			gs.targetSprites[0].visible = true;
			gs.targetSprites[0].frame = RED_SELECT_BOX_FRAME;
			gs.showTargetLine(targetTileIndex);
		}
	};
	
	// PATH:
	// ********************************************************************************************
	gs.abilityShowTarget.Path = function (targetTileIndex) {
		var path;
		
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			path = gs.pc.getPathTo(targetTileIndex, true);
		
			if (path && path.length > 0) {
				let i = 0;
				path.forEach(function (tileIndex) {
					gs.targetSprites[i].x = tileIndex.x * TILE_SIZE;
					gs.targetSprites[i].y = tileIndex.y * TILE_SIZE;
					gs.targetSprites[i].visible = true;
					gs.targetSprites[i].frame = PURPLE_BOX_FRAME;
					i += 1;
				}, this);
				
				gs.targetSprites[0].frame = PURPLE_SELECT_BOX_FRAME;
			}
		}
		else {
			gs.targetSprites[0].x = targetTileIndex.x * TILE_SIZE;
			gs.targetSprites[0].y = targetTileIndex.y * TILE_SIZE;
			gs.targetSprites[0].visible = true;
			gs.targetSprites[0].frame = RED_SELECT_BOX_FRAME;
		}
	};
	
	// TARGET_BASED_AOE:
	// ********************************************************************************************
	gs.abilityShowTarget.TBAoE = function (targetTileIndex) {
		var indexList, i = 0;
		
		// Valid Target:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			indexList = gs.getIndexInRadius(targetTileIndex, this.aoeRange(gs.pc));
			indexList = indexList.filter(index => gs.isStaticPassable(index));
			
			indexList.forEach(function (index) {
				gs.targetSprites[i].x = index.x * TILE_SIZE;
				gs.targetSprites[i].y = index.y * TILE_SIZE;
				gs.targetSprites[i].visible = true;
				if (gs.vectorEqual(targetTileIndex, index)) {
					gs.targetSprites[i].frame = PURPLE_SELECT_BOX_FRAME;
				}
				else {
					gs.targetSprites[i].frame = PURPLE_BOX_FRAME;
				}
				i += 1;
			}, this);
		}
		// Invalid Target:
		else {
			gs.targetSprites[0].x = targetTileIndex.x * TILE_SIZE;
			gs.targetSprites[0].y = targetTileIndex.y * TILE_SIZE;
			gs.targetSprites[0].visible = true;
			gs.targetSprites[0].frame = RED_SELECT_BOX_FRAME;
			gs.showTargetLine(targetTileIndex);
		}
	};
	
	// BOLT:
	// ********************************************************************************************
	gs.abilityShowTarget.Bolt = function (targetTileIndex) {
		var indexList, i = 0, frame, endFrame;
		
		// Valid Target:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			frame = PURPLE_BOX_FRAME;
			endFrame = PURPLE_SELECT_BOX_FRAME;
		}
		// Invalid Target:
		else {
			frame = RED_BOX_FRAME;
			endFrame = RED_SELECT_BOX_FRAME;
		}
			
		indexList = gs.getIndexInBRay(gs.pc.tileIndex, targetTileIndex);

		indexList.forEach(function (index) {
			gs.targetSprites[i].x = index.x * TILE_SIZE;
			gs.targetSprites[i].y = index.y * TILE_SIZE;
			gs.targetSprites[i].visible = true;
			gs.targetSprites[i].frame = gs.vectorEqual(targetTileIndex, index) ? endFrame : frame;
			i += 1;
		}, this);

	};

	// POINT_BLANK_AOE:
	// ********************************************************************************************
	gs.abilityShowTarget.PBAoE = function (targetTileIndex) {
		var indexList = gs.getIndexInRadius(gs.pc.tileIndex, this.aoeRange(gs.pc)),
			i = 0;
		
		indexList.forEach(function (index) {
			if (this.canUseOn(gs.pc, index)) {
				gs.targetSprites[i].x = index.x * TILE_SIZE;
				gs.targetSprites[i].y = index.y * TILE_SIZE;
				gs.targetSprites[i].visible = true;
				gs.targetSprites[i].frame = gs.getChar(index) ? PURPLE_SELECT_BOX_FRAME : PURPLE_BOX_FRAME;
				i += 1;
			}
		}, this);
	};
	
	// LINE_OF_SIGHT:
	// ********************************************************************************************
	gs.abilityShowTarget.LoS = function () {
		var i = 0;
		
		gs.characterList.forEach(function (character) {
			if (gs.getTile(character.tileIndex).visible && character.isAlive && character.faction === FACTION.HOSTILE) {
				gs.targetSprites[i].x = character.tileIndex.x * TILE_SIZE;
				gs.targetSprites[i].y = character.tileIndex.y * TILE_SIZE;
				gs.targetSprites[i].visible = true;
				gs.targetSprites[i].frame = PURPLE_SELECT_BOX_FRAME;
				i += 1;
			}	
		}, this);
	};

	// BOX:
	// ********************************************************************************************
	gs.abilityShowTarget.Box = function (targetTileIndex, width, height) {
		var indexList = gs.getIndexInBox(targetTileIndex.x, targetTileIndex.y, targetTileIndex.x + width, targetTileIndex.y + height),
			i = 0;

		indexList.forEach(function (index) {
			if (gs.isPassable(index) || gs.getChar(index)) {
				gs.targetSprites[i].x = index.x * TILE_SIZE;
				gs.targetSprites[i].y = index.y * TILE_SIZE;
				gs.targetSprites[i].visible = true;
				gs.targetSprites[i].frame = PURPLE_SELECT_BOX_FRAME;
				i += 1;
			}
		}, this);
	};
	

	
	// BURST_OF_FLAME:
	// ********************************************************************************************
	this.abilityShowTarget.BurstOfFlame = function (targetTileIndex) {
		var indexList;
		
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			// Burst Target:
			if (gs.getObj(targetTileIndex, obj => obj.type.canBurstOfFlame)) {
				var i = 0;

				this.getIndexList(gs.pc, targetTileIndex).forEach(function (tileIndex) {
					gs.targetSprites[i].x = tileIndex.x * TILE_SIZE;
					gs.targetSprites[i].y = tileIndex.y * TILE_SIZE;
					gs.targetSprites[i].visible = true;
					gs.targetSprites[i].frame = PURPLE_BOX_FRAME;
					i += 1;
				}, this);

				gs.targetSprites[i].x = targetTileIndex.x * TILE_SIZE;
				gs.targetSprites[i].y = targetTileIndex.y * TILE_SIZE;
				gs.targetSprites[i].visible = true;
				gs.targetSprites[i].frame = PURPLE_SELECT_BOX_FRAME;
			}
			// Single target:
			else {
				gs.abilityShowTarget.SingleTarget.call(this, targetTileIndex);
			}
		}
		else {
			gs.targetSprites[0].x = targetTileIndex.x * TILE_SIZE;
			gs.targetSprites[0].y = targetTileIndex.y * TILE_SIZE;
			gs.targetSprites[0].visible = true;
			gs.targetSprites[0].frame = RED_SELECT_BOX_FRAME;
			gs.showTargetLine(targetTileIndex);
		}
	};
	
	// FAN:
	// ********************************************************************************************
	this.abilityShowTarget.Fan = function (targetTileIndex) {
		var delta,
			indexList,
			i = 0;
		
		delta = gs.get8WayVector(gs.pc.tileIndex, targetTileIndex);
		indexList = gs.getIndexInFan(gs.pc.tileIndex, this.aoeRange(gs.pc), delta);
		
		indexList.forEach(function (index) {
			if (!gs.isRayClear(gs.pc.tileIndex, index) || !gs.isStaticPassable(index)) {
				return;
			}
			
			gs.targetSprites[i].x = index.x * TILE_SIZE;
			gs.targetSprites[i].y = index.y * TILE_SIZE;
			gs.targetSprites[i].visible = true;
			gs.targetSprites[i].frame = PURPLE_BOX_FRAME;
			
			if (util.distance(index, gs.pc.tileIndex) < 1.5) {
				gs.targetSprites[i].frame = PURPLE_SELECT_BOX_FRAME;
			}
			i += 1;
		}, this);
	};
	
	// CHARACTER_FLOOD:
	// ********************************************************************************************
	this.abilityShowTarget.CharacterFlood = function (targetTileIndex) {
		var pred, indexList;
		
		pred = function (tileIndex) {
			return gs.getChar(tileIndex) && gs.getChar(tileIndex) !== gs.pc;
		};
		
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			indexList = gs.getIndexInFlood(targetTileIndex, pred, this.depth);

			indexList.forEach(function (tileIndex, i) {
				gs.targetSprites[i].x = tileIndex.x * TILE_SIZE;
				gs.targetSprites[i].y = tileIndex.y * TILE_SIZE;
				gs.targetSprites[i].visible = true;
				gs.targetSprites[i].frame = gs.vectorEqual(tileIndex, targetTileIndex) ? PURPLE_SELECT_BOX_FRAME : PURPLE_BOX_FRAME;
			}, this);
		}
		else {
			gs.targetSprites[0].x = targetTileIndex.x * TILE_SIZE;
			gs.targetSprites[0].y = targetTileIndex.y * TILE_SIZE;
			gs.targetSprites[0].visible = true;
			gs.targetSprites[0].frame = RED_SELECT_BOX_FRAME;
			gs.showTargetLine(targetTileIndex);
		}
		
	};
};

// CREATE_ABILITY_CAN_USE:
// ************************************************************************************************
gs.createAbilityCanUse = function () {
	this.abilityCanUse = {};
	
	// SHIELD:
	// ********************************************************************************************
	this.abilityCanUse.Shield = function (actingChar) {
		return actingChar.inventory.hasShieldEquipped();
	};
	
	// MELEE_WEAPON:
	// ********************************************************************************************
	this.abilityCanUse.MeleeWeapon = function (actingChar) {
		return actingChar.inventory.getWeapon().type.attackEffect.skill === 'Melee';
	};
	
	// RANGE_WEAPON:
	// ********************************************************************************************
	this.abilityCanUse.RangeWeapon = function (actingChar) {
		return actingChar.inventory.getWeapon().type.attackEffect.skill === 'Range';
	};
};

// CREATE_ABILITY_CAN_USE_ON:
// ************************************************************************************************
gs.createAbilityCanUseOn = function () {
	this.abilityCanUseOn = {};
	// SINGLE_CHARACTER_STRAIGHT_RAY:
	// ********************************************************************************************
	this.abilityCanUseOn.SingleCharacterStraightRay = function (actingChar, targetTileIndex) {		
		return gs.getChar(targetTileIndex)
			&& gs.isInBounds(targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.isRayPassable(actingChar.tileIndex, targetTileIndex)
			&& gs.isStraight(actingChar.tileIndex, targetTileIndex)
			&& actingChar.isHostileToMe(gs.getChar(targetTileIndex));
			
	};
	
	// NPC_PROJECTILE_ATTACK:
	// Used by NPC projectile attacks to give them a chance of shooting their friends
	// ********************************************************************************************
	this.abilityCanUseOn.NPCProjectileAttack = function (actingChar, targetTileIndex) {
		var lineClear = true, normal;
		
		// If the ray is not passable (character or level):
		if (!gs.isRayPassable(actingChar.tileIndex, targetTileIndex)) {
			lineClear = false;
			
			// 25% chance to shoot through a friendly as long as not adjacent
			normal = gs.get8WayVector(actingChar.tileIndex, targetTileIndex);
			if (!gs.getChar(actingChar.tileIndex.x + normal.x, actingChar.tileIndex.y) && gs.isRayShootable(actingChar.tileIndex, targetTileIndex) && game.rnd.frac() < 0.25) {
				lineClear = true;
			}
		}
		
		return lineClear
			&& gs.isRayClear(actingChar.tileIndex, targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar);
	};
	
	// SINGLE_CHARACTER_RAY:
	// Must have a clear (passable) ray to the targetTileIndex
	// targetTileIndex must contain a hostile character
	// ********************************************************************************************
	this.abilityCanUseOn.SingleCharacterRay = function (actingChar, targetTileIndex) {
		return gs.isInBounds(targetTileIndex)
			&& gs.getChar(targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.isRayPassable(actingChar.tileIndex, targetTileIndex)
			&& gs.getChar(targetTileIndex) !== actingChar;
	};
	
	// SINGLE_CHARACTER_SMITE:
	// Must have clear (visible) ray to the targetTileIndex
	// targetTileIndex must contain a hostile character
	// ********************************************************************************************
	this.abilityCanUseOn.SingleCharacterSmite = function (actingChar, targetTileIndex) {		
		return gs.isInBounds(targetTileIndex)
			&& gs.getChar(targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.isRayClear(actingChar.tileIndex, targetTileIndex)
			&& gs.getChar(targetTileIndex) !== actingChar;
	};
	
	// SINGLE_TILE_RAY:
	// Must have a clear (passable) ray to the targetTileIndex
	// targetTileIndex can contain a hostile character or it can be passable (staticPassable)
	// ********************************************************************************************
	this.abilityCanUseOn.SingleTileRay = function (actingChar, targetTileIndex) {		
		return gs.isInBounds(targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.isRayPassable(actingChar.tileIndex, targetTileIndex)
			&& gs.isStaticPassable(targetTileIndex)
			&& gs.getChar(targetTileIndex) !== actingChar;
	};
	
	// SINGLE_TILE_SMITE:
	// Must have a clear (visible) ray to the targetTileIndex
	// targetTileIndex can contain a hostile character or it can be passable (staticPassable)
	// ********************************************************************************************
	this.abilityCanUseOn.SingleTileSmite = function (actingChar, targetTileIndex) {		
		return gs.isInBounds(targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.isRayClear(actingChar.tileIndex, targetTileIndex)
			&& gs.isStaticPassable(targetTileIndex)
			&& gs.getChar(targetTileIndex) !== actingChar;
	};
	
	// BOLT:
	// Must have a static passable BRay to the targetTileIndex
	// ********************************************************************************************
	this.abilityCanUseOn.Bolt = function (actingChar, targetTileIndex) {
		return gs.isInBounds(targetTileIndex)
			&& !gs.vectorEqual(actingChar.tileIndex, targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.isBRay(actingChar.tileIndex, targetTileIndex, gs.isStaticPassable);
	};

};

// CREATE_ABILITY_GET_TARGET:
// ************************************************************************************************
gs.createAbilityGetTarget = function () {
	this.abilityGetTarget = {};
	
	// SELF:
	// ********************************************************************************************
	this.abilityGetTarget.Self = function (actingChar) {
		return actingChar;
	};
	
	// SINGLE_TARGET:
	// ********************************************************************************************
	this.abilityGetTarget.SingleTarget = function (actingChar) {
		var indexList;
		
		// All targetable indices:
		indexList = gs.getIndexInRadius(actingChar.tileIndex, this.range(actingChar));
		
		// Only valid indices:
		indexList = indexList.filter(index => gs.getChar(index) && actingChar.isHostileToMe(gs.getChar(index)));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		// Sort by distance:
		indexList.sort((a, b) => util.distance(actingChar.tileIndex, a) - util.distance(actingChar.tileIndex, b));
		
		return indexList.length > 0 ? indexList[0] : null;
	};
	
	// SINGLE_ALLY:
	// ********************************************************************************************
	this.abilityGetTarget.SingleAlly = function (actingChar) {
		var indexList;
		
		// All targetable indices:
		indexList = gs.getIndexInRadius(actingChar.tileIndex, this.range(actingChar));
		
		// Only valid indices:
		indexList = indexList.filter(index => gs.getChar(index) && !actingChar.isHostileToMe(gs.getChar(index)));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		// Sort by distance:
		indexList.sort((a, b) => util.distance(actingChar.tileIndex, a) - util.distance(actingChar.tileIndex, b));
		
		return indexList.length > 0 ? indexList[0] : null;
	};
	
	// BOLT:
	// ********************************************************************************************
	this.abilityGetTarget.Bolt = function (actingChar) {
		var indexList,
			potentialTargetList = [];
		
		// All targetable indices:
		indexList = gs.getIndexInRadius(actingChar.tileIndex, this.range(actingChar));
		
		// Only valid indices:
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		// Count number of hostile and friendly characters in each ray:
		indexList.forEach(function (index) {
			var list;
			
			list = gs.getIndexInBRay(actingChar.tileIndex, index);
			list = list.filter(index => gs.getChar(index) && actingChar.canSeeCharacter(gs.getChar(index)));
			
			potentialTargetList.push({
				tileIndex: index, 
				hostileCount: list.reduce((sum, idx) => sum + (actingChar.isHostileToMe(gs.getChar(idx)) ? 1 : 0), 0),
				allyCount: list.reduce((sum, idx) => sum + (actingChar.faction === gs.getChar(idx).faction ? 1 : 0), 0)
			});
		}, this);
		
		
		// Only consider targets with more hostiles than allies:
		potentialTargetList = potentialTargetList.filter(target => target.hostileCount > target.allyCount);
		
		// Sort by hostile count:
		potentialTargetList.sort((a, b) => b.hostileCount - a.hostileCount);
		
		return potentialTargetList.length > 0 ? potentialTargetList[0].tileIndex : null;
	};
	
	// TARGET_BASED_AOE:
	// More hostiles than allies in AoE
	// ********************************************************************************************
	this.abilityGetTarget.TBAoE = function (actingChar) {
		var indexList, potentialTargetList = [];
		
		// All targetable indices:
		indexList = gs.getIndexInRadius(actingChar.tileIndex, this.range(actingChar));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		// Count number of hostile and friendly characters in AoE
		indexList.forEach(function (index) {
			var list;
			
			list = gs.getIndexInRadius(index, this.aoeRange(actingChar));
			list = list.filter(index => gs.getChar(index) && actingChar.canSeeCharacter(gs.getChar(index)));
			
			potentialTargetList.push({
				tileIndex: index, 
				hostileCount: list.reduce((sum, idx) => sum + (actingChar.isHostileToMe(gs.getChar(idx)) ? 1 : 0), 0),
				allyCount: list.reduce((sum, idx) => sum + (actingChar.faction === gs.getChar(idx).faction ? 1 : 0), 0)
			});
		}, this);
		
		// Only consider targets with more hostiles than allies:
		potentialTargetList = potentialTargetList.filter(target => target.hostileCount > target.allyCount);
		
		// Sort by distance:
		potentialTargetList.sort((a, b) => util.distance(actingChar.tileIndex, a.tileIndex) - util.distance(actingChar.tileIndex, b.tileIndex));
		
		return potentialTargetList.length > 0 ? potentialTargetList[0].tileIndex : null;
	};
	
	// POINT_BLANK_AOE:
	// Returns actingChar.tileIndex if more hostiles than allies in AoE
	// Otherwise returns null.
	// In this way NPCs know if its a good idea to use the ability i.e. they won't use it if it returns null
	// ********************************************************************************************
	this.abilityGetTarget.PBAoE = function (actingChar) {
		var indexList, hostileCount, allyCount;
		
		// Get all index around actingChar:
		indexList = gs.getIndexInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		
		// Make sure its visible:
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		// Count the effected hostiles and allies:
		hostileCount = indexList.reduce((sum, idx) => sum + (actingChar.isHostileToMe(gs.getChar(idx)) ? 1 : 0), 0);
		allyCount = indexList.reduce((sum, idx) => sum + (actingChar.faction === gs.getChar(idx).faction ? 1 : 0), 0);
			
		return hostileCount > allyCount ? actingChar.tileIndex : null;
	};
	
	// FLOOD:
	// More hostiles than allies in flood.
	// ********************************************************************************************
	this.abilityGetTarget.Flood = function (actingChar) {
		var indexList, potentialTargetList = [], pred;
			
		pred = function (tileIndex) {
			return gs.isStaticPassable(tileIndex) && !gs.getCloud(tileIndex);
		};
		
		// All targetable indices:
		indexList = gs.getIndexInRadius(actingChar.tileIndex, this.range(actingChar));
		
		// Only valid indices:
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		// Count number of hostile and friendly characters in AoE
		indexList.forEach(function (index) {
			var list;
			
			list = gs.getIndexInFlood(index, pred, this.floodDepth);
			list = list.filter(index => gs.getChar(index));
			
			potentialTargetList.push({
				tileIndex: index, 
				hostileCount: list.reduce((sum, idx) => sum + (actingChar.isHostileToMe(gs.getChar(idx)) ? 1 : 0), 0),
				allyCount: list.reduce((sum, idx) => sum + (actingChar.faction === gs.getChar(idx).faction ? 1 : 0), 0)
			});
		}, this);
		
		// Only consider targets with more hostiles than allies:
		potentialTargetList = potentialTargetList.filter(target => target.hostileCount > target.allyCount);
		
		// Sort by distance:
		potentialTargetList.sort((a, b) => util.distance(actingChar.tileIndex, a.tileIndex) - util.distance(actingChar.tileIndex, b.tileIndex));
		
		return potentialTargetList.length > 0 ? potentialTargetList[0].tileIndex : null;
	};
	
};

/*
	// FAN:
	// ********************************************************************************************
	gs.abilityShowTarget.Fan.getIndexList = function (actingChar, targetTileIndex) {
		var direction, indexList = [], func, haltCondition;
		
		haltCondition = function (index) {
			return !gs.isPassable(index) && !gs.getChar(index);
		};
		
		func = function (dir, fanRange) {
			gs.getIndexInRay(actingChar.tileIndex,
							 {x: actingChar.tileIndex.x + dir.x * fanRange, y: actingChar.tileIndex.y + dir.y * fanRange},
							 haltCondition).forEach(function (index) {
				if (!indexList.find(i => gs.vectorEqual(i, index))) {
					indexList.push(index);
				}
			});
		};
		
		// Decide which of the 4 cardinal directions the ability will be used
		direction = gs.getCardinalVector(actingChar.tileIndex, targetTileIndex);
		
		// Cast 3 rays and collect the tiles that are acceptable
		if (direction) {
			func(direction, 3);
			func({x: direction.x + gs.getOrthoVector(direction).x, y: direction.y + gs.getOrthoVector(direction).y}, 2);
			func({x: direction.x - gs.getOrthoVector(direction).x, y: direction.y - gs.getOrthoVector(direction).y}, 2);
			
			
			return indexList;
		}
		else {
			return null;
		}
	};
	
	gs.abilityShowTarget.Fan = function (targetTileIndex) {
		var indexList = gs.abilityShowTarget.Fan.getIndexList(gs.pc, targetTileIndex),
			i = 0;
		
		gs.targetSprites.forEach(function (targetSprite) {
			targetSprite.visible = false;
		});
		
		indexList.forEach(function (index) {
			gs.targetSprites[i].x = index.x * TILE_SIZE;
			gs.targetSprites[i].y = index.y * TILE_SIZE;
			gs.targetSprites[i].visible = true;
			gs.targetSprites[i].frame = PURPLE_SELECT_BOX_FRAME;
			i += 1;
		}, this);
	};
	*/
