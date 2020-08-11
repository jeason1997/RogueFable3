/*global game, gs, console, Phaser, util*/
/*global PLAYER_INITIAL_HP, HP_PER_SKILL, DROP_GOLD_PERCENT, FACTION*/
/*jshint laxbreak: true, esversion: 6, loopfunc: true*/
'use strict';

var gameMetric = {};



// ANALYSE_ALL_SPAWN_TABLES:
// ************************************************************************************************
gameMetric.analyseAllSpawnTables = function () {
	// Setup:
	gs.clearGameData();
	gs.debugProperties.spawnMobs = true;
	gs.debugProperties.saveLevels = false;
	gs.debugProperties.dressRooms = false; // stops zoos, treasure rooms from spawning
	gs.debugProperties.testLevel = true;
	gs.debugProperties.generateGlobalStuff = false;
	gs.debugProperties.spawnUniques = false;
	
	this.showPerLevel = true;
	this.showLevelUps = false;
	
	console.log('Analysing Spawn Tables...');
	this.levelMetric('TheUpperDungeon', 1);
	this.levelMetric('TheUpperDungeon', 2);
	this.levelMetric('TheUpperDungeon', 3);
	this.levelMetric('TheUpperDungeon', 4);
	
	this.levelMetric('TheUnderGrove', 1);
	this.levelMetric('TheUnderGrove', 2);
	this.levelMetric('TheUnderGrove', 3);
	this.levelMetric('TheUnderGrove', 4);
	
	this.levelMetric('TheSwamp', 1);
	this.levelMetric('TheSwamp', 2);
	this.levelMetric('TheSwamp', 3);
	this.levelMetric('TheSwamp', 4);
	
	this.levelMetric('TheSunlessDesert', 1);
	this.levelMetric('TheSunlessDesert', 2);
	this.levelMetric('TheSunlessDesert', 3);
	this.levelMetric('TheSunlessDesert', 4);
	
	this.levelMetric('TheOrcFortress', 1);
	this.levelMetric('TheOrcFortress', 2);
	this.levelMetric('TheOrcFortress', 3);
	this.levelMetric('TheOrcFortress', 4);

	this.levelMetric('TheDarkTemple', 1);
	this.levelMetric('TheDarkTemple', 2);
	this.levelMetric('TheDarkTemple', 3);
	this.levelMetric('TheDarkTemple', 4);
	
	this.levelMetric('VaultOfYendor', 1);
	this.levelMetric('VaultOfYendor', 2);
	this.levelMetric('VaultOfYendor', 3);
	this.levelMetric('VaultOfYendor', 4);
	
	throw 'Complete';
};



// ZONE_METRICS:
// ************************************************************************************************
gameMetric.run = function () {
	var zones,
		bonusExp,
		level,
		i,
		success = true;


	// Setup:
	gs.clearGameData();
	gs.debugProperties.spawnMobs = true;
	gs.debugProperties.saveLevels = false;
	gs.debugProperties.dressRooms = false; // stops zoos, treasure rooms from spawning
	this.showPerLevel = true;
	this.showLevelUps = true;

	this.pcLevel = 1;
	this.gameTotalExp = 0;
	this.gameTotalGold = 0;
	this.gameTotalItems = 0;

	this.trials = 3;
	zones = gs.branches;
	//zones = ['TheUpperDungeon'];
	
	//zones = ['TheOrcFortress'];
	
	/*
	zones = ['TheUpperDungeon', 
			 'TheUnderGrove', 'TheIronFortress', // TIER I BRANCHES
			 'TheOrcFortress',
			 'TheSewers', 'TheIceCaves', 'TheCore', // TIER II BRANCHES
			 'TheArcaneTower', 'TheCrypt',
			 'TheDarkTemple',
			 'VaultOfYendor']; // TIER III BRANCHES
			 */
	
	
	console.log(zones);
	// Pass over every zone:
	for (i = 0; i < zones.length; i += 1) {
		console.log(zones[i] + ': -------------------------------------------------------------------- \n');
		
		// Per Level Metric:
		this.zoneTotalNPCs = 0;
		this.zoneTotalGold = 0;
		this.zoneTotalExp = 0;
		this.zoneTotalItems = 0;
		this.zoneTotalShrooms = 0;
		
		for (level = 1; level <= gs.zoneTypes[zones[i]].numLevels; level += 1) {
			console.log('Level: ' + level);
			if (!this.levelMetric(zones[i], level)) {
				success = false;
				break;
			}
			this.levelUp();
		}

		if (!success) {
			break;
		}
		this.levelUp();
	}

	console.log('GAME TOTAL: -------------------------------------------------------------------- \n');
	console.log('Gold: ' + this.gameTotalGold);
	console.log('Level: ' + this.pcLevel);
	console.log('Items: ' + this.gameTotalItems);

};

// LEVEL_METRIC:
// ************************************************************************************************
gameMetric.levelMetric = function (zoneName, zoneLevel) {
	var trial,
		TRIALS = this.trials,
		npcSum = 0,
		goldSum = 0,
		itemSum = 0,
		expSum = 0,
		shroomSum = 0,
		npcLevelSum = 0,
		npcHpSum = 0,
		avgNumNPCs,
		avgGold,
		avgExp,
		avgItems,
		avgShrooms,
		success,
		str = '';

	for (trial = 0; trial < TRIALS; trial += 1) {
		// Create Level:
		if (!gs.changeLevel(zoneName, zoneLevel, true)) {
			return false;
		}
		
		if (gs.getAllIndex().find(index => !gs.getTile(index).type)) {
			throw 'Tile has no type';
		}

		// Count NPCs:
		npcSum += this.countLiveNPCs();

		// Count Gold:
		goldSum += this.countGoldInZone();

		// Count EXP:
		expSum += this.countExpInZone();
		
		// Count Items:
		itemSum += this.countContainers();
		
		// Count Shrooms:
		shroomSum += this.countShroomsInZone();
		
		// Counting npc level:
		npcLevelSum += this.averageNPCLevel();
		npcHpSum += this.averageNPCHP();
		
		/*
		if (!(gs.zoneName === 'VaultOfYendor' && gs.zoneLevel === 4) && !gs.findObj(obj => obj.type.name === 'DownStairs')) {
			throw 'Could not find down stairs.';
		}

		if (!(gs.zoneName === 'TheUpperDungeon' && gs.zoneLevel === 1) && !gs.findObj(obj => obj.type.name === 'UpStairs')) {
			throw 'Could not find up stairs.';
		}
		*/
	}

	avgNumNPCs = Math.round(npcSum / TRIALS);
	avgGold = Math.round(goldSum / TRIALS);
	avgExp = Math.round(expSum / TRIALS);
	avgItems = Math.round(itemSum / TRIALS);
	avgShrooms = Math.round(shroomSum / TRIALS);
	
	if (this.showPerLevel) {
		//console.log(zoneName + '[' + zoneLevel + ']: NPCs: ' + avgNumNPCs + ', Gold: ' + avgGold + ', Exp: ' + avgExp);
		/*
		str = zoneName + '[' + zoneLevel + ']:\t';
		str += 'AvgNPCLevel: ' + gs.roundStr(npcLevelSum / TRIALS) + ', ';
		str += 'DangerLevel: ' + gs.dangerLevel(gs.zoneName, gs.zoneLevel) + ', ';
		str += 'AvgNPCHP: ' + gs.roundStr(npcHpSum / TRIALS) + ', ';
		console.log(str);
		*/
	}

	this.zoneTotalNPCs += avgNumNPCs;
	this.zoneTotalGold += avgGold;
	this.zoneTotalExp += avgExp;
	this.zoneTotalItems += avgItems;
	this.zoneTotalShrooms += avgShrooms;

	this.gameTotalExp += avgExp;
	this.gameTotalGold += avgGold;
	this.gameTotalItems += avgItems;
	
	
	
	
	return true;
};

// AVERAGE_NPC_LEVEL:
// Returns the average level of npcs in zone
// ************************************************************************************************
gameMetric.averageNPCLevel = function () {
	var sum = 0, count = 0;
	gs.getAllNPCs().forEach(function (npc) {
		if (npc.faction === FACTION.HOSTILE) {
			sum += npc.level;
			count += 1;
		}
	}, this);
	
	return sum / count;
};

// AVERAGE_NPC_HP:
// Returns the average hp of npcs in zone
// ************************************************************************************************
gameMetric.averageNPCHP = function () {
	var sum = 0, count = 0;
	gs.getAllNPCs().forEach(function (npc) {
		if (npc.faction === FACTION.HOSTILE) {
			sum += npc.maxHp;
			count += 1;
		}
	}, this);
	
	return sum / count;
};

// COUNT_SHROOMS_IN_ZONE:
// ************************************************************************************************
gameMetric.countShroomsInZone = function () {
	var x, y, count = 0;
	for (x = 0; x < gs.numTilesX; x += 1) {
		for (y = 0; y < gs.numTilesY; y += 1) {
			if (gs.getObj(x, y, 'HealingShroom')) {
				count += 1;
			}
		}
	}
	return count;
};

// COUNT_GOLD_IN_ZONE:
// ************************************************************************************************
gameMetric.countGoldInZone = function () {
	var i, count = 0;
	for (i = 0; i < gs.floorItemList.length; i += 1) {
		if (gs.floorItemList[i].item.type === gs.itemTypes.GoldCoin) {
			count += gs.floorItemList[i].item.amount;
		}
	}
	return count;
};

// COUNT_EXP_IN_ZONE:
// ************************************************************************************************
gameMetric.countExpInZone = function () {
	var i, count = 0;
	
	gs.getAllNPCs().forEach(function (npc) {
		if (npc.faction === FACTION.HOSTILE) {
			count += npc.exp;
			count += npc.type.dropPercent * gs.dangerLevel();
		}
	}, this);
	
	gs.getAllIndex().forEach(function (tileIndex) {
		// Count Containers:
		if (gs.getObj(tileIndex, obj => obj.isContainer())) {
			count += gs.dangerLevel();
		}
		
		// Count Items:
		if (gs.getItem(tileIndex)) {
			count += gs.dangerLevel();
		}
	}, this);
		
	return count;
};

// COUNT_CONTAINERS:
// ************************************************************************************************
gameMetric.countContainers = function () {
	var count = 0;
	
	
	gs.getAllIndex().forEach(function (tileIndex) {
		// Count Containers:
		if (gs.getObj(tileIndex, obj => obj.isContainer() && !obj.isOpen)) {
			count += 1;
		}
		
		// Count Items:
		if (gs.getItem(tileIndex) && gs.getItem(tileIndex).item.type.name !== 'GoldCoin') {
			count += 1;
		}
		
		// Count NPCs:
		if (gs.getChar(tileIndex) &&
			gs.getChar(tileIndex).type.dropPercent > 0) {
			count += gs.getChar(tileIndex).type.dropPercent * (1 - DROP_GOLD_PERCENT);
		}
	}, this);
	
	
	
	return Math.round(count);
};

// LEVEL_UP:
// ************************************************************************************************
gameMetric.levelUp = function () {
	while (this.gameTotalExp >= gs.expPerLevel[this.pcLevel + 1]) {
		this.pcLevel += 1;
		if (this.showLevelUps) {
			console.log('------- GAIN_LEVEL: ' + this.pcLevel + '-------');
		}
	}
};


// NPC_METRIC:
// ************************************************************************************************
gameMetric.npcMetric = function () {
	var i, key, str;
	
	for (i = 1; i < 30; i += 1) {
		str = '[' + i + '] ';
		str += 'PC:' + (PLAYER_INITIAL_HP + (HP_PER_SKILL / 2) * i);
		
		// NPCS:
		for (key in gs.npcTypes) {
			if (gs.npcTypes.hasOwnProperty(key) && gs.npcTypes[key].faction === FACTION.HOSTILE && gs.npcTypes[key].level === i) {
				str += ', ' + key + ':' + gs.npcTypes[key].maxHp;
			}
		}
		
		console.log(str);
	}
	
	throw 'DONE';
};
// COUNT_LIVE_NPCS
// ************************************************************************************************
gameMetric.countLiveNPCs = function () {
	return gs.getAllNPCs().filter(npc => npc.faction === FACTION.HOSTILE).length;
};

// TEST_LEVEL:
// ************************************************************************************************
gameMetric.testLevel = function () {
	var TRIALS = 1000,
		zoneName = 'TheUpperDungeon',
		zoneLevel = 3;
	
	console.log('Staring gameMetric.testLevel()');
	for (let trial = 0; trial < TRIALS; trial += 1) {
		if (trial % 5 === 0) {
			console.log('Trial: ' + trial);
		}
		
		gs.seed = '' + Date.now();
		
		gs.previouslySpawnedFeatures = [];
		gs.crystalChestGroupIsOpen = [];
		gs.remainingAltars = [];

		gs.previouslySpawnedUniques = [];	
		
		// Create Level:
		gs.changeLevel(zoneName, zoneLevel, true);
		
		//console.log(gs.currentGenerator.name);
		
		let success = this.verifyStairPath();
		
		if (!success) {
			console.log('FAILED');
			break;
		}
	}
	
	console.log('Finished');
};

// VERIFY_STAIR_PATH:
// ************************************************************************************************
gameMetric.verifyStairPath = function () {
	var upStairs = gs.findObj(obj => obj.type.name === 'UpStairs'),
		downStairs = gs.findObj(obj => obj.type.name === 'DownStairs'),
		path;
	
	/*
	gs.getIndexInBox(downStairs.tileIndex.x -1, downStairs.tileIndex.y - 1, downStairs.tileIndex.x + 2, downStairs.tileIndex.y + 2).forEach(function (index) {
		gs.setTileType(index, gs.tileTypes.Wall);
	}, this);
	*/
	
	if (!upStairs || !downStairs) {
		console.log('One of the stairs was not placed');
		return false;
	}
	
	path = gs.findPath(upStairs.tileIndex, downStairs.tileIndex, {allowDiagonal: true, canWalkFunc: gs.pc.canWalk.bind(gs.pc), passDoors: true});
	
	if (!path || path.length === 0) {
		console.log('No valid path between stairs');
		return false;
	}
	
	return true;
	
};

gameMetric.testLevels = function () {
	var branches;
	
	console.log('starting tests');
	
	branches = [
		'TheUpperDungeon', 
		'TheOrcFortress', 'TheIronFortress', 'TheUnderGrove', 'TheSunlessDesert', 'TheSwamp',
		'TheDarkTemple', 'TheCrypt',
		'TheArcaneTower', 'TheSewers', 'TheIceCaves', 'TheCore',
		'VaultOfYendor'
	];
	
	gs.zoneName = util.randElem(gs.branches);
	gs.zoneLevel = util.randInt(1, 4);
	
	for (let i = 0; i < 100; i += 1) {
		if (i % 10 === 0) {
			console.log('test: ' + i);
		}
		
		gs.seed = '' + Date.now();
		
		gs.previouslySpawnedFeatures = [];
		gs.crystalChestGroupIsOpen = [];
		gs.remainingAltars = [];

		gs.previouslySpawnedUniques = [];	
		
		gs.zoneName = util.randElem(branches);
		gs.zoneLevel = util.randInt(1, 4);
		gs.generateLevel();
		
		gs.destroyLevel();
		
	}
};