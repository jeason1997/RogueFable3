/*global gs, util*/
/*global Item*/

/*global BRANCH_I_ZONES, BRANCH_II_ZONES*/
/*global TIER_I_ZONES, TIER_II_ZONES, TIER_III_ZONES*/
/*global MAX_RECOVERY_MUSHROOMS, MAX_FIRE_MUSHROOMS*/
/*global NUM_GOLD_PER_LEVEL, DOUBLE_GOLD_CHANCE*/
/*global NUM_CHESTS_PER_LEVEL*/
/*global NUM_FOUNTAINS_PER_LEVEL*/
/*global NUM_CAMP_FIRES*/
/*global MERCHANT_MIN_LEVEL, MERCHANT_SPAWN_PERCENT*/
/*global TALENT_TRAINER_MIN_LEVEL, TALENT_TRAINER_PERCENT*/
/*global SKILL_TRAINER_MIN_LEVEL, SKILL_TRAINER_PERCENT*/
/*global PRIEST_MIN_LEVEL, PRIEST_PERCENT*/
/*global ENCHANTMENT_TABLE_MIN_LEVEL, ENCHANTMENT_TABLE_PERCENT*/
/*global TRANSFERANCE_TABLE_MIN_LEVEL, TRANSFERANCE_TABLE_PERCENT*/
/*global MAX_FIRE_POTS, SPAWN_FIRE_POTS_PERCENT*/
/*global MAX_BEAR_TRAPS, SPAWN_BEAR_TRAPS_PERCENT*/
/*global MAX_FIRE_VENTS, SPAWN_FIRE_VENTS_PERCENT*/
/*global MAX_GAS_VENTS, SPAWN_GAS_VENTS_PERCENT*/
/*global MAX_GAS_POTS, SPAWN_GAS_POTS_PERCENT*/
/*global MAX_SPIKE_TRAPS, SPAWN_SPIKE_TRAPS_PERCENT*/
/*global PIT_TRAP_MIN_LEVEL, MAX_PIT_TRAPS, SPAWN_PIT_TRAP_PERCENT*/
/*global TELEPORT_TRAP_MIN_LEVEL, MAX_TELEPORT_TRAPS, SPAWN_TELEPORT_TRAP_PERCENT*/
/*global ALTER_MIN_LEVEL, SPAWN_ALTER_PERCENT*/
/*global MAX_VINES, SPAWN_VINE_PERCENT, SUPER_VINE_PERCENT*/
/*global MAX_ICE*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// GENERATE_GLOBAL_STUFF:
// ************************************************************************************************
gs.generateGlobalStuff = function () {
	var num, i, tileIndex, indexList, religionName;
	
	
	// Guaranteed Food:
	if (this.zoneLevel % 4 === 0) {
		tileIndex = this.getOpenIndexInLevel();
		if (tileIndex) {
			this.createFloorItem(tileIndex, Item.createItem('Meat'));
		}
	}
	
	// Item Containers:
	num = NUM_CHESTS_PER_LEVEL;
	
	// Guaranteed food replaces one item:
	if (this.zoneLevel % 4 === 0) {
		num = NUM_CHESTS_PER_LEVEL - 1;
	}
	
	// Items:
	for (i = 0; i < num; i += 1) {
		tileIndex = this.getWideOpenIndexInLevel();
		if (tileIndex) {
			if (util.frac() <= 0.5) {
				this.createContainer(tileIndex, 'Chest');
			}
			else {
				this.createRandomFloorItem(tileIndex, null, true);
			}
		}
	}
	
	// Gold Piles:
	num = util.randInt(Math.ceil(NUM_GOLD_PER_LEVEL / 2), NUM_GOLD_PER_LEVEL);
	if (util.frac() <= DOUBLE_GOLD_CHANCE) {
		num = NUM_GOLD_PER_LEVEL * 2;
	}
	for (i = 0; i < num; i += 1) {
		tileIndex = this.getWideOpenIndexInLevel();
		if (tileIndex) {
			this.createFloorItem(tileIndex, Item.createItem('GoldCoin', {amount: util.randInt(Math.ceil(gs.dropGoldAmount() / 2), gs.dropGoldAmount())}));
		}
	}

	// Recovery Fountains:
	num = util.randInt(Math.ceil(NUM_FOUNTAINS_PER_LEVEL / 2), NUM_FOUNTAINS_PER_LEVEL);
	for (i = 0; i < num; i += 1) {
		tileIndex = this.getWideOpenIndexInLevel();
		if (tileIndex) {
			this.createObject(tileIndex, gs.chooseRandom([
				{name: 'HealthFountain', percent: 48},
				{name: 'EnergyFountain', percent: 28},
				{name: 'ExperienceFountain', percent: 18},
				{name: 'WellOfWishing', percent: 4},
				{name: 'AttributeFountain', percent: 2}
			]));
		}
	}

	// Camp Fires:
	if (this.zoneType().isCold) {
		for (i = 0; i < NUM_CAMP_FIRES; i += 1) {
			tileIndex = this.getWideOpenIndexInLevel();
			if (tileIndex) {
				this.createObject(tileIndex, 'CampFire');
			}
		}
	}
		
	// Merchants
	if (!gs.characterList.find(npc => npc.name === 'Merchant')) {
		if ((this.dangerLevel() >= MERCHANT_MIN_LEVEL && util.frac() < MERCHANT_SPAWN_PERCENT)
			|| (this.zoneLevel === 3 && this.inArray(this.zoneName, BRANCH_I_ZONES))
			|| (this.zoneLevel === 3 && this.inArray(this.zoneName, BRANCH_II_ZONES))
			|| (this.zoneLevel === 1 && this.inArray(this.zoneName, TIER_III_ZONES))) {

			tileIndex = this.getMerchantSpawnIndex();
			if (tileIndex) {
				this.createNPC(tileIndex, 'Merchant');
				this.stockMerchant();
			}
		}
	}
	
	// Talent Trainer:
	if (this.dangerLevel() >= TALENT_TRAINER_MIN_LEVEL && util.frac() < TALENT_TRAINER_PERCENT) {
		tileIndex = this.getMerchantSpawnIndex();
		if (tileIndex) {
			this.createNPC(tileIndex, 'TalentTrainer');
		}
	}
	
	// Skill Trainer:
	if (this.dangerLevel() >= SKILL_TRAINER_MIN_LEVEL && util.frac() < SKILL_TRAINER_PERCENT) {
		tileIndex = this.getMerchantSpawnIndex();
		if (tileIndex) {
			this.createNPC(tileIndex, 'SkillTrainer');
		}
	}
	
	// Priest:
	if (this.dangerLevel() >= PRIEST_MIN_LEVEL && util.frac() < PRIEST_PERCENT) {
		tileIndex = this.getMerchantSpawnIndex();
		if (tileIndex) {
			this.createNPC(tileIndex, 'Priest');
		}
	}

	// Enchantment Table:
	if (this.dangerLevel() >= ENCHANTMENT_TABLE_MIN_LEVEL && util.frac() < ENCHANTMENT_TABLE_PERCENT) {
		tileIndex = this.getWideOpenIndexInLevel();
		if (tileIndex) {
			this.createObject(tileIndex, 'EnchantmentTable');
		}
	}
	
	// Enchantment Table:
	if (this.dangerLevel() >= TRANSFERANCE_TABLE_MIN_LEVEL && util.frac() < TRANSFERANCE_TABLE_PERCENT) {
		tileIndex = this.getWideOpenIndexInLevel();
		if (tileIndex) {
			this.createObject(tileIndex, 'TransferanceTable');
		}
	}
	
	// Altar:
	if (this.dangerLevel() >= ALTER_MIN_LEVEL && this.remainingAltars.length > 0 && util.frac() < SPAWN_ALTER_PERCENT) {
		tileIndex = this.getWideOpenIndexInLevel();
		if (tileIndex) {
			religionName = util.randElem(this.remainingAltars);
			this.createAltar(tileIndex, 'AltarOf' + religionName);
			this.removeFromArray(religionName, this.remainingAltars);
		}
	}
	
	// Fire Mushrooms:
	if (this.zoneType().spawnFireShrooms) {
		num = util.randInt(Math.ceil(MAX_FIRE_MUSHROOMS / 2), MAX_FIRE_MUSHROOMS);
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getOpenIndexInLevel();
			if (tileIndex) {
				this.spawnShroomTrap(tileIndex);
			}
		}
	}
	
	// Fire Glyph:
	if (this.zoneType().spawnFireGlyphs) {
		num = util.randInt(Math.ceil(MAX_FIRE_MUSHROOMS / 2), MAX_FIRE_MUSHROOMS);
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getOpenIndexInLevel();
			if (tileIndex) {
				this.spawnShroomTrap(tileIndex, 'FireGlyph');
			}
		}
	}
	
	// Fire Pots:
	if (this.zoneType().spawnFirePots && util.frac() < SPAWN_FIRE_POTS_PERCENT) {
		num = util.randInt(Math.ceil(MAX_FIRE_POTS / 2), MAX_FIRE_POTS);
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getWideOpenIndexInLevel();
			if (tileIndex) {
				gs.createNPC(tileIndex, 'FirePot');
			}
		}
	}
	
	// Bear Traps:
	if (this.zoneType().spawnBearTraps && util.frac() < SPAWN_BEAR_TRAPS_PERCENT) {
		num = util.randInt(Math.ceil(MAX_BEAR_TRAPS / 2), MAX_BEAR_TRAPS);
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getWideOpenIndexInLevel();
			if (tileIndex) {
				gs.createObject(tileIndex, 'BearTrap');
			}
		}
	}
	
	// Fire Vents::
	if (this.zoneType().spawnFireVents && util.frac() < SPAWN_FIRE_VENTS_PERCENT) {
		num = util.randInt(Math.ceil(MAX_FIRE_VENTS / 2), MAX_FIRE_VENTS);
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getWideOpenIndexInLevel();
			if (tileIndex) {
				gs.createObject(tileIndex, 'FireVent');
			}
		}
	}
	
	// Gas Vents:
	if (this.zoneType().spawnGasVents && util.frac() < SPAWN_GAS_VENTS_PERCENT) {
		num = util.randInt(Math.ceil(MAX_GAS_VENTS / 2), MAX_GAS_VENTS);
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getWideOpenIndexInLevel();
			if (tileIndex) {
				gs.createObject(tileIndex, 'GasVent');
			}
		}
	}
	
	// Steam Vents:
	if (this.zoneType().spawnSteamVents && util.frac() < SPAWN_GAS_VENTS_PERCENT) {
		num = util.randInt(Math.ceil(MAX_GAS_VENTS / 2), MAX_GAS_VENTS);
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getWideOpenIndexInLevel();
			if (tileIndex) {
				gs.createObject(tileIndex, 'SteamVent');
			}
		}
	}
	
	// Gas Pots:
	if (this.zoneType().spawnGasPots && util.frac() < SPAWN_GAS_POTS_PERCENT) {
		num = util.randInt(Math.ceil(MAX_GAS_POTS / 2), MAX_GAS_POTS);
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getWideOpenIndexInLevel();
			if (tileIndex) {
				gs.createNPC(tileIndex, 'GasPot');
			}
		}
	}
	
	// Pit Traps:
	if (this.zoneLevel < this.zoneType().numLevels && this.dangerLevel() >= PIT_TRAP_MIN_LEVEL && util.frac() < SPAWN_PIT_TRAP_PERCENT) {
		for (i = 0; i < MAX_PIT_TRAPS; i += 1) {
			tileIndex = this.getWideOpenIndexInLevel();
			if (tileIndex) {
				gs.createObject(tileIndex, 'PitTrap');
			}
		}
	}
	
	// Teleport Traps:
	if (this.dangerLevel() >= TELEPORT_TRAP_MIN_LEVEL && util.frac() < SPAWN_TELEPORT_TRAP_PERCENT) {
		
		for (i = 0; i < MAX_TELEPORT_TRAPS; i += 1) {
			tileIndex = this.getWideOpenIndexInLevel();
			if (tileIndex) {
				gs.createObject(tileIndex, 'TeleportTrap');
			}
		}
	}
	
	// Spike Traps:
	if (this.zoneType().spawnSpikeTraps && util.frac() < SPAWN_SPIKE_TRAPS_PERCENT) {
		num = util.randInt(Math.ceil(MAX_SPIKE_TRAPS / 2), MAX_SPIKE_TRAPS);
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getWideOpenIndexInLevel();
			if (tileIndex) {
				gs.createObject(tileIndex, 'SpikeTrap');
			}
		}
	}
	
	
	
	// Vine Patch:
	if (this.zoneType().spawnVines && util.frac() < SPAWN_VINE_PERCENT) {
		num = util.randInt(Math.ceil(MAX_VINES / 2), MAX_VINES);
		
		// Super Vines:
		if (this.dangerLevel() >= 2 && util.frac() < SUPER_VINE_PERCENT) {
			num = MAX_VINES * 5;
		}
		
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getOpenIndexInLevel();
			if (tileIndex) {
				this.createVinePatch(tileIndex, util.randInt(2, 4), 'Vine');
			}
		}
	}
	
	// Oil Patch:
	if (this.zoneType().spawnOil && util.frac() < SPAWN_VINE_PERCENT) {
		num = util.randInt(Math.ceil(MAX_VINES / 2), MAX_VINES);
		
		// Super Oil:
		if (util.frac() < SUPER_VINE_PERCENT) {
			num = MAX_VINES * 5;
		}
		
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getOpenIndexInLevel();
			if (tileIndex) {
				this.createVinePatch(tileIndex, util.randInt(2, 4), 'Oil');
			}
		}
	}
	
	// Oil Patch:
	if (this.zoneType().spawnOil && util.frac() < SPAWN_VINE_PERCENT + 1) {
		num = util.randInt(Math.ceil(MAX_VINES / 2), MAX_VINES);
		
		
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getOpenIndexInLevel();
			if (tileIndex) {
				this.createVinePatch(tileIndex, util.randInt(2, 4), 'Scrap', 0.5);
			}
		}
	}
	
	// Ice Patch:
	if (this.zoneType().spawnIce) {
		num = util.randInt(Math.ceil(MAX_ICE / 2), MAX_ICE);
		
		// Super Vines:
		if (util.frac() < SUPER_VINE_PERCENT) {
			num = MAX_VINES * 5;
		}
		
		for (i = 0; i < num; i += 1) {
			tileIndex = this.getOpenIndexInLevel();
			if (tileIndex) {
				this.createVinePatch(tileIndex, util.randInt(2, 4), 'Ice');
			}
		}
	}
	
	// Blood:
	if (this.zoneType().spawnBlood) {
		indexList = this.getAllIndex();
		indexList = indexList.filter(index => gs.isPassable(index) && !gs.getObj(index) && gs.getTile(index).type !== gs.tileTypes.Water);
		indexList = indexList.filter(index => util.frac() < 0.02);
		indexList.forEach(function (index) {
			gs.createObject(index, 'Blood');
		});
	}
	

};

// PLACE_WALL_DRESSING:
// ************************************************************************************************
gs.placeWallDressing = function () {
	// Torches:
	let indexList = this.getAllIndex();
	indexList = indexList.filter(index => gs.isVisibleWall(index) && index.x % 2 === 0 && !gs.getObj(index) && util.frac() < 0.50);
	indexList.forEach(function (index) {
		gs.createObject(index, 'Torch');
	});
	
	// Wall Flags:
	if (this.zoneType().spawnWallFlags && util.frac() < 0.5) {
		indexList = this.getAllIndex();
		indexList = indexList.filter(index => gs.isVisibleWall(index) && gs.getTile(index).type.name === 'Wall' && index.x % 2 === 1 && !gs.getObj(index) && util.frac() < 0.10);
		indexList.forEach(function (index) {
			gs.createObject(index, 'WallFlag');
		});
	}
};

// SPAWN_SHROOM_TRAP:
// ************************************************************************************************
gs.spawnShroomTrap = function (tileIndex, objectTypeName) {
	objectTypeName = objectTypeName || 'FireShroom';
	
	gs.getIndexInRadius(tileIndex, 3).forEach(function (index) {
		if (gs.isIndexOpen(index) && util.frac() < 0.3) {
			gs.createObject(index, objectTypeName);
		}
	}, this);
};

// SPAWN_HEALING_SHROOM_PATCH:
// ************************************************************************************************
gs.spawnHealingShroomPatch = function (tileIndex) {
	gs.getIndexInRadius(tileIndex, 3).forEach(function (index) {
		if (gs.isIndexOpen(index) && util.frac() < 0.15) { // 0.3 Jan-19-2017
			gs.createObject(index, util.randElem(['HealingShroom', 'EnergyShroom']));
		}
	}, this);
};
