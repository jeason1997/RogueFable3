/*global game, gs, console, util*/
/*global FACTION, DAMAGE_TYPES*/
/*global NPC, NPC_INITIAL_HP, NPC_HP_PER_LEVEL, NPC_INITIAL_DAMAGE, NPC_DAMAGE_PER_LEVEL*/
/*global STANDARD_DROP_PERCENT, LOS_DISTANCE, ABILITY_RANGE, CHARACTER_SIZE*/
/*global DANGER_LEVEL*/
/*jshint white: true, laxbreak: true, esversion: 6*/
'use strict';

// CREATE_NPC_TYPES:
// ************************************************************************************************
gs.createNPCTypes = function () {
	this.npcTypes = {
		// THE_UPPER_DUNGEON:
		// ****************************************************************************************
		Rat: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'LOW'}}
			],
			moveSpeed: 'MEDIUM',
			maxHp: 5,
			isRandomMover: true,
			size: CHARACTER_SIZE.SMALL,
		},
		
		Bat: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'LOW'}}
			],
			moveSpeed: 'FAST',
			maxHp: 2,
			isRandomMover: true,
			isFlying: true,
			size: CHARACTER_SIZE.SMALL,
		},
		
		RatNest: {
			abilityTypes: [
				{typeName: 'SpawnNPC', stats: {numSpawned: 2, coolDown: 10, npcTypeName: 'Rat'}}
			],
			moveSpeed: 'NONE',
			hitPointType: 'MHIGH',
			maxMp: 3,
			
			isUnstableImmune: true,
			neverSleep: true,
			neverRespawn: true,
			neverRun: true,
			noBlood: true,
			noRegen: true,
			neverSpawnInZoo: true,
		},
		
		GoblinWarrior: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			size: CHARACTER_SIZE.SMALL,
		},
		
		GoblinArcher: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MLOW', projectileTypeName: 'Dart'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
			size: CHARACTER_SIZE.SMALL,
		},
		
		GoblinBrute: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MHIGH'}},
			],
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
		},
		
		GoblinFireMage: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 5, projectileTypeName: 'FireArrow', shootEffect: 'FireShoot'}},
				{typeName: 'OrbOfFire', stats: {damageType: 'HIGH', coolDown: 10, mana: 0}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
			size: CHARACTER_SIZE.SMALL,
			resistance: {Fire: 1},
		},
		
		GoblinStormMage: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 5, projectileTypeName: 'Spark', shootEffect: 'ElectricShoot'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
			size: CHARACTER_SIZE.SMALL,
			resistance: {Shock: 1},
		},
		
		Centipede: {
			abilityTypes: [
				{typeName: 'PoisonAttack', stats: {damageType: 'MEDIUM'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			size: CHARACTER_SIZE.SMALL,
		},
		
		GoblinShaman: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 5, projectileTypeName: 'IceArrow', shootEffect: 'ColdShoot'}},
				{typeName: 'Heal', stats: {coolDown: 6, healPercent: 0.25}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
			size: CHARACTER_SIZE.SMALL,
		},
		
		CaveBear: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MHIGH'}},
				{typeName: 'Berserk', stats: {coolDown: 100, mana: 0}}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
			size: CHARACTER_SIZE.LARGE,
		},
		
		// THE_UPPER_DUNGEON_UNIQUES:
		// ****************************************************************************************
		TheVampireBat: {
			abilityTypes: [
				{typeName: 'VampireAttack', stats: {damageType: 'MEDIUM'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'HIGH',
			isRandomMover: true,
			isFlying: true,
			isUnique: true,
			size: CHARACTER_SIZE.SMALL,
		},
		
		TheRatPiper: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MLOW', projectileTypeName: 'Dart'}},
				{typeName: 'SummonMonsters', stats: {npcTypeName: 'Rat', num: 4, coolDown: 10}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'HIGH',
			isKiter: true,
			isUnique: true,
		},
		
		TheBridgeGuardian: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MHIGH'}},
			],
			moveSpeed: 'SLOW',
			hitPointType: 'MHIGH',
			updateTurn: this.npcUpdateTurn.Regenerate,
			resistance: {Fire: -1},
			isUnique: true,
		},
		
		// THE_ORC_FORTRESS:
		// ****************************************************************************************
		Wolf: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'LOW'}},
			],
			moveSpeed: 'FAST',
			hitPointType: 'LOW',
		},
		
		WolfKennel:	{
			abilityTypes: [
				{typeName: 'SpawnNPC', stats: {numSpawned: 2, coolDown: 8, npcTypeName: 'Wolf'}}
			],
			moveSpeed: 'NONE',
			hitPointType: 'MEDIUM',
			maxMp: 3,
			neverSleep: true,
			neverRespawn: true,
			noBlood: true,
			neverRun: true,
			neverSpawnInZoo: true,
			noRegen: true,
			
		},
		
		OrcWarrior: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
		},
		
		OrcArcher: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MLOW', projectileTypeName: 'Dart', range: 6.0}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
		},
		
		Ogre: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MHIGH'}},
				{typeName: 'Berserk', stats: {coolDown: 100, mana: 0}}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
			size: CHARACTER_SIZE.LARGE,
		},
		
		OgreShaman: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 5, projectileTypeName: 'IceArrow', shootEffect: 'ColdShoot'}},
				{typeName: 'Heal', stats: {coolDown: 6, healPercent: 0.5}}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'MHIGH',
			isKiter: true,
			size: CHARACTER_SIZE.LARGE,
		},
		
		OrcFireMage: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 4, projectileTypeName: 'FireArrow', shootEffect: 'FireShoot'}},
				{typeName: 'OrbOfFire', stats: {damageType: 'HIGH', coolDown: 10, mana: 0}},
				{typeName: 'WallOfFire', stats: {damageType: 'MLOW', coolDown: 20, mana: 0}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
			resistance: {Fire: 1},
		},
		
		OrcStormMage: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 4, projectileTypeName: 'Spark', shootEffect: 'ElectricShoot'}},
				{typeName: 'LightningBolt',	stats: {damageType: 'MHIGH', coolDown: 8, mana: 0}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
			resistance: {Shock: 1},
		},
		
		OrcPriest: {
			abilityTypes: [
				{typeName: 'Smite', stats: {damageType: 'HIGH', coolDown: 4}},
				{typeName: 'Heal', stats: {coolDown: 6, healPercent: 0.5}},
				{typeName: 'Haste', stats: {coolDown: 10}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
		},
		
		CorrosiveSlime: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isCorrosive: true,
			noRegen: true,
			noBlood: true,
			resistance: {Toxic: 1},
			gasImmune: true,
		},
		
		AcidicSlime: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			noRegen: true,
			damageShield: 5,
			noBlood: true,
			resistance: {Toxic: 1},
			gasImmune: true,
		},
		
		OrcSummoner: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 4, projectileTypeName: 'MagicMissile', shootEffect: 'MagicShoot'}},
				{typeName: 'SummonMonsters', stats: {npcTypeName: 'SpectralBlade', num: 4, coolDown: 20}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
		},
		
		
		
		// THE_ORC_FORTRESS_UNIQUES:
		// ****************************************************************************************
		KingMonRacar: {
			niceName: "Mon'Racar The Orc King",
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MHIGH'}},
				{typeName: 'Berserk', stats: {coolDown: 100, mana: 0}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'HIGH',
			size: CHARACTER_SIZE.LARGE,
			isUnique: true,
		},
		
		// THE_DARK_TEMPLE:
		// ****************************************************************************************
		DarkElfWarden: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'SealDoors', stats: {coolDown: 40}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',	
		},
		
		DarkElfSentinel: {
			abilityTypes: [
				{typeName: 'ProjectileKite', stats: {damageType: 'MLOW', projectileTypeName: 'Dart', range: 7.0}},
				{typeName: 'WatchPlayer', stats: {coolDown: 20}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
		},
		
		DarkElfPyromancer: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 4, projectileTypeName: 'FireArrow', shootEffect: 'FireShoot'}},
				{typeName: 'FireStorm', stats: {damageType: 'HIGH', coolDown: 20, mana: 0}},
				{typeName: 'WallOfFire', stats: {damageType: 'MLOW', coolDown: 20, mana: 0}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
			resistance: {Fire: 1},
		},
		
		DarkElfStormologist: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 4, projectileTypeName: 'Spark', shootEffect: 'ElectricShoot'}},
				{typeName: 'LightningBolt',	stats: {damageType: 'MHIGH', coolDown: 8, mana: 0}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
			resistance: {Shock: 1},
		},
		
		DarkElfPriest: {
			abilityTypes: [
				{typeName: 'Smite', stats: {damageType: 'HIGH', coolDown: 3}},
				{typeName: 'Heal', stats: {coolDown: 6, healPercent: 0.75}},
				{typeName: 'Haste', stats: {coolDown: 10}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
		},
		
		DarkElfSummoner: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 3, projectileTypeName: 'MagicMissile', shootEffect: 'MagicShoot'}},
				{typeName: 'SummonMonsters', stats: {npcTypeName: 'GreaterSpectralBlade', num: 4, coolDown: 20}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
		},
		
		EvilEye: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 3, projectileTypeName: 'MagicMissile', shootEffect: 'MagicShoot'}},
				{typeName: 'NPCConfusion', stats: {coolDown: 20}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
			isFlying: true,
		},
		
		// THE_VAULT_OF_YENDOR:
		// ****************************************************************************************
		HellHound: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'LOW'}},
			],
			moveSpeed: 'FAST',
			hitPointType: 'LOW',
			onHit: this.npcOnHit.FireBlink,
			flamingCloudImmune: true,
			resistance: {Fire: 1},
		},
		
		DrachnidWarrior: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'SpiderWeb',	stats: {coolDown: 100, range: 5.0}}
			],
			moveSpeed: 'FAST',
			hitPointType: 'MEDIUM',
			isUnstableImmune: true,
		},
		
		DrachnidArcher: {
			abilityTypes: [
				{typeName: 'ProjectileKite', stats: {damageType: 'MLOW', projectileTypeName: 'Dart', range: 7.0}},
				{typeName: 'SpiderWeb',	stats: {coolDown: 100, range: 5.0}}
			],
			moveSpeed: 'FAST',
			hitPointType: 'MEDIUM',
			isKiter: true,
			isUnstableImmune: true,
		},
		
		FleshGolem: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'Constrict', stats: {coolDown: 10}},
				{typeName: 'Berserk', stats: {coolDown: 100, mana: 0}}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
			neverSleep: true,
			noRegen: true,
			size: CHARACTER_SIZE.LARGE,
		},
		
		TentacleTerror: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'TonguePull', stats: {coolDown: 10, tongueFrame: 1746}},
				{typeName: 'Berserk', stats: {coolDown: 100, mana: 0}}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
			size: CHARACTER_SIZE.LARGE,
		},
		
		DarkElfBladeDancer: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			reposteAttacks: true
		},
		
		CrystalGolem: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'Berserk', stats: {coolDown: 100, mana: 0}}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'MHIGH',
			noBlood: true,
			noRegen: true,
			reflection: 15,
			neverSleep: true,
			size: CHARACTER_SIZE.LARGE,
			
		},
		
		Succubus: {
			abilityTypes: [
				{typeName: 'VampireAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'NPCCharm', stats: {coolDown: 20}},
				
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
		},
		
		StormElemental: {
			abilityTypes: [
				{typeName: 'SummonLightningRod', stats: {coolDown: 10}},
				{typeName: 'UseLightningRod', stats: {damageType: 'MHIGH'}},
				{typeName: 'ProjectileAttack', stats: {damageType: 'MEDIUM', coolDown: 4, projectileTypeName: 'Spark', shootEffect: 'ElectricShoot'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
			noBlood: true,
			isLavaImmune: true,
			resistance: {Shock: 1},
		},
		
		/*
		Demonologist: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 4, projectileTypeName: 'MagicMissile'}},
				{typeName: 'SummonMonsters', stats: {npcTypeName: 'IceImp', num: 1, coolDown: 20}},
				{typeName: 'SummonMonsters', stats: {npcTypeName: 'FireImp', num: 1, coolDown: 20}},
				{typeName: 'SummonMonsters', stats: {npcTypeName: 'StormImp', num: 1, coolDown: 20}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
		},
		
		*/
		
		
		// THE_SUNLESS_DESERT:
		// ****************************************************************************************
		Scarab: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'LOW'}}
			],
			moveSpeed: 'MEDIUM',
			maxHp: 8,
			isRandomMover: true,
			size: CHARACTER_SIZE.SMALL,
		},
		
		SpittingViper: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MLOW', projectileTypeName: 'Acid'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
		},
		
		TrapDoorSpider: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			neverWander: true,
			startHidden: true,
			ambushDistance: 3,
			neverSpawnInZoo: true,
			neverRespondToShout: true,
		},
		
		Scorpion: {
			abilityTypes: [
				{typeName: 'PoisonAttack', stats: {damageType: 'MEDIUM'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
		},
		
		SunFlower: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 3, range: LOS_DISTANCE, projectileTypeName: 'FireArrow', shootEffect: 'FireShoot'}},
				{typeName: 'WallOfFire', stats: {damageType: 'MLOW', coolDown: 20, mana: 0}}
			],
			moveSpeed: 'NONE',
			hitPointType: 'MHIGH',
			neverRun: true,
			neverSpawnInZoo: true,
			noRegen: true,
			neverSleep: true,
			resistance: {Fire: 1, Cold: -1},
			
		},
		
		Goat: {
			abilityTypes: [
				{typeName: 'TrampleAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
		},
		
		Mummy: {
			abilityTypes: [
				{typeName: 'DrainingAttack', stats: {damageType: 'MHIGH'}},
				{typeName: 'Berserk', stats: {coolDown: 100, mana: 0}}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
			resistance: {Fire: -1},
			
		},
		
		MummyPriest: {
			abilityTypes: [
				{typeName: 'Smite', stats: {damageType: 'HIGH', coolDown: 4}},
				{typeName: 'Heal', stats: {coolDown: 6, healPercent: 0.5}},
				{typeName: 'Haste', stats: {coolDown: 10}},
			],
			moveSpeed: 'SLOW',
			hitPointType: 'MEDIUM',
			isKiter: true,
			resistance: {Fire: -1},
			
		},
		
		CylomarTheAncientPyromancer: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 4, projectileTypeName: 'FireArrow', shootEffect: 'FireShoot'}},
				{typeName: 'FireStorm', stats: {damageType: 'HIGH', coolDown: 20, mana: 0}},
				{typeName: 'WallOfFire', stats: {damageType: 'MLOW', coolDown: 20, mana: 0}}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'MEDIUM',
			isKiter: true,
			resistance: {Fire: -1},
			isUnique: true
		},
		
		// THE_UNDER_GROVE:
		// ****************************************************************************************
		Jaguar: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'FAST',
			hitPointType: 'MEDIUM',
		},
		
		Spider: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'SpiderWeb',	stats: {coolDown: 100}}
			],
			moveSpeed: 'MEDIUM',
			maxHp: 15, // hitPointType: 'MEDIUM', 20
			isUnstableImmune: true,
		},
		
		SpiderNest:	{
			abilityTypes: [
				{typeName: 'SpawnNPC', stats: {numSpawned: 1, coolDown: 8, npcTypeName: 'Spider'}}
			],
			moveSpeed: 'NONE',
			hitPointType: 'MEDIUM',
			maxMp: 3,
			isUnstableImmune: true,
			neverSleep: true,
			neverRun: true,
			noBlood: true,
			neverRespawn: true,
			neverSpawnInZoo: true,
			noRegen: true,
			
		},
		
		PoisonSpider: {
			abilityTypes: [
				{typeName: 'PoisonAttack', stats: {damageType: 'MEDIUM'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isUnstableImmune: true,
		},
		
		CentaurArcher: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MLOW', projectileTypeName: 'Dart' , range: 6.0}}
			],
			moveSpeed: 'FAST',
			maxHp: 16, // hitPointType: 'MEDIUM', 21
			isKiter: true,
		},
		
		CentaurWarrior: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MLOW'}},
				{typeName: 'TrampleAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'FAST',
			maxHp: 18, //hitPointType: 'MEDIUM', 21
		},
		
		Chameleon: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'TonguePull', stats: {coolDown: 10}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			neverWander: true,
			startHidden: true,
			ambushDistance: 5,
			neverSpawnInZoo: true,
			neverRespondToShout: true,
		},
		
		Elephant: {
			abilityTypes: [
				{typeName: 'TrampleAttack', stats: {damageType: 'MHIGH'}},
			],
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
			size: CHARACTER_SIZE.LARGE,
		},
		
		TheQueenSpider: {
			abilityTypes: [
				{typeName: 'PoisonAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'SpawnNPC', stats: {numSpawned: 1, coolDown: 6, mana: 1, npcTypeName: 'SpiderEgg'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'HIGH',
			isUnique: true,
			maxMp: 5,
		},
		
		GiantAnt: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MLOW'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isRandomMover: true,
		},
		
		GiantBee: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MLOW'}}
			],
			moveSpeed: 'FAST',
			hitPointType: 'MLOW',
			isFlying: true,
		},
		
		// THE_SWAMP:
		// ****************************************************************************************
		Pirahna: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'LOW'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'LOW',
			neverWander: true,
			startHidden: true,
			ambushDistance: 5.0,
			spawnInWater: true,
			isAquatic: true,
			isSwimming: true,
			neverRun: true,
			neverSpawnInZoo: true,
		},
		
		PoisonViper: {
			abilityTypes: [
				{typeName: 'PoisonAttack', stats: {damageType: 'MEDIUM'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
		},
		
		BlinkFrog: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MLOW'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			onHit: this.npcOnHit.BlinkFrog,
			isAquatic: true,
		},
		
		Mosquito: {
			abilityTypes: [
				{typeName: 'VampireAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'FAST',
			hitPointType: 'MEDIUM',
			isFlying: true,
		},
		
		SpinyFrog : {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			damageShield: 2,
			isAquatic: true,
		},
		
		ElectricEel: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MEDIUM', coolDown: 3, projectileTypeName: 'Spark', shootEffect: 'ElectricShoot'}},
			],
			resistance: {Shock: 1},
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			neverWander: true,
			startHidden: true,
			ambushDistance: 5.0,
			spawnInWater: true,
			isAquatic: true,
			isSwimming: true,
			neverRun: true,
			neverSpawnInZoo: true,
			neverRespawn: true,
		},
		
		BullFrog: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'SlowCharge', stats: {damageType: 'HIGH'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MHIGH',
			isAquatic: true,
		},
		
		SnappingTurtle: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'HideInShell'}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'MHIGH',
		},
		
		LickyToad: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'TonguePull', stats: {coolDown: 10}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isAquatic: true,
		},
		
		// THE_SWAMP_UNIQUES:
		// ****************************************************************************************
		KasicTheMosquitoPrince: {
			abilityTypes: [
				{typeName: 'VampireAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'LifeSpike', stats: {damageType: 'LOW', mana: 0, coolDown: 10}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isFlying: true,
			isUnique: true
		},
		
		// THE_IRON_FORTRESS:
		// ****************************************************************************************
		ClockworkRat: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'LOW'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'LOW',
			noRegen: true,
			neverRun: true,
			bloodTypeName: 'Oil',
			isRandomMover: true,
			neverSleep: true,
			size: CHARACTER_SIZE.SMALL,
			
		},
		
		Bombomber: {
			abilityTypes: [
				{typeName: 'Suicide'}
			],
			onDeath: {typeName: 'Explode', stats: {damageType: 'MEDIUM'}},
			moveSpeed: 'MEDIUM',
			hitPointType: 'LOW',
			noBlood: true,
			neverRun: true,
			noRegen: true,
			size: CHARACTER_SIZE.SMALL,
			
		},
		
		ClockworkWarrior: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			neverRun: true,
			bloodTypeName: 'Oil',
			noRegen: true,
			neverSleep: true,
			
		},
		
		ClockworkArcher: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MLOW', projectileTypeName: 'Dart', range: 6.0}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
			bloodTypeName: 'Oil',
			noRegen: true,
			neverSleep: true,
			
		},
		
		ClockworkFactory: {
			abilityTypes: [
				{typeName: 'SpawnNPC', stats: {numSpawned: 3, coolDown: 10, npcTypeName: 'ClockworkRat'}}
			],
			moveSpeed: 'NONE',
			hitPointType: 'MHIGH',
			maxMp: 3,
			
			isUnstableImmune: true,
			neverSleep: true,
			neverRespawn: true,
			neverRun: true,
			noBlood: true,
			noRegen: true,
			neverSpawnInZoo: true,
			
		},
		
		GoblinBomber: {
			abilityTypes: [
				{typeName: 'ThrowBomb', stats: {damageType: 'HIGH', coolDown: 4, range: 5}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
		},
		
		ClockworkPyro: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 5, projectileTypeName: 'FireArrow', shootEffect: 'FireShoot'}},
				{typeName: 'ProjectileAttack', stats: {coolDown: 10, projectileTypeName: 'Oil'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
			resistance: {Fire: 1},
			
		},
		
		ClockworkRhino: {
			abilityTypes: [
				{typeName: 'TrampleAttack', stats: {damageType: 'MHIGH'}},
				{typeName: 'SlowCharge', stats: {damageType: 'HIGH'}}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
			noRegen: true,
			neverSleep: true,
			size: CHARACTER_SIZE.LARGE,
			
		},
		
		Ballista: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', range: LOS_DISTANCE, projectileTypeName: 'Dart'}}
			],
			moveSpeed: 'NONE',
			hitPointType: 'HIGH',
			dontFace: true,
			neverRun: true,
			neverSpawnInZoo: true,
			neverRespawn: true,
			bloodTypeName: 'Oil',
			noRegen: true,
			neverSleep: true,
			rotateAim: true,
			isUnstableImmune: true,
			
		},
		
		
		
		// THE_ARCANE_TOWER:
		// ****************************************************************************************
		ManaViper: {
			abilityTypes: [
				{typeName: 'ManaDrainAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'FAST',
			hitPointType: 'MEDIUM',
		},
			
		FireImp: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MEDIUM', coolDown: 4, projectileTypeName: 'FireArrow', shootEffect: 'FireShoot'}},
				{typeName: 'OrbOfFire', stats: {damageType: 'HIGH', coolDown: 10, mana: 0}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isFlying: true,
			isKiter: true,
			onHit: this.npcOnHit.ImpBlink,
			size: CHARACTER_SIZE.SMALL,
			resistance: {Fire: 1},
			
		},
		
		StormImp: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MEDIUM', coolDown: 4, projectileTypeName: 'Spark', shootEffect: 'ElectricShoot'}},
				{typeName: 'LightningBolt',	stats: {damageType: 'MHIGH', coolDown: 10, mana: 0}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isFlying: true,
			isKiter: true,
			onHit: this.npcOnHit.ImpBlink,
			size: CHARACTER_SIZE.SMALL,
			resistance: {Shock: 1},
			
		},
		
		IceImp: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MEDIUM', coolDown: 4, projectileTypeName: 'IceArrow', shootEffect: 'ColdShoot'}},
				{typeName: 'SummonIceBomb', stats: {damageType: 'HIGH', coolDown: 10}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isFlying: true,
			isKiter: true,
			onHit: this.npcOnHit.ImpBlink,
			size: CHARACTER_SIZE.SMALL,
			resistance: {Cold: 1},
		},
		
		IronImp: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'FAST',
			hitPointType: 'MLOW',
			isFlying: true,
			onHit: this.npcOnHit.ImpBlink,
			size: CHARACTER_SIZE.SMALL,
		},
		
		StoneGolem: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MHIGH'}},
				{typeName: 'Berserk', stats: {coolDown: 100, mana: 0}}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
			noBlood: true,
			noRegen: true,
			neverSleep: true,
			size: CHARACTER_SIZE.LARGE,
			
		},
		
		FireStaffTurret: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 5, range: LOS_DISTANCE, projectileTypeName: 'FireArrow', shootEffect: 'FireShoot'}},
				{typeName: 'OrbOfFire', stats: {damageType: 'HIGH', coolDown: 10, mana: 0}}
			],
			moveSpeed: 'NONE',
			hitPointType: 'HIGH',
			dontFace: true,
			noBlood: true,
			neverRun: true,
			neverSpawnInZoo: true,
			neverRespawn: true,
			noRegen: true,
			neverSleep: true,
			rotateAim: true,
			
		},
		
		StormStatue: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 4, range: LOS_DISTANCE, projectileTypeName: 'Spark', shootEffect: 'ElectricShoot'}},
				{typeName: 'LightningBolt',	stats: {damageType: 'MHIGH', coolDown: 8, range: LOS_DISTANCE, mana: 0}},
				{typeName: 'Buffet', stats: {coolDown: 10}},
			],
			moveSpeed: 'NONE',
			hitPointType: 'MHIGH',
			noBlood: true,
			neverRun: true,
			neverSpawnInZoo: true,
			noRegen: true,
			neverSleep: true,
			resistance: {Shock: 1},
			
		},
		
		// THE_CRYPT:
		// ****************************************************************************************
		Maggot: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'LOW'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'LOW',
			
			isRandomMover: true,
			size: CHARACTER_SIZE.SMALL,
			isUnstableImmune: true,
		},
		
		RottingCorpse: {
			abilityTypes: [
				{typeName: 'SpawnNPC', stats: {numSpawned: 3, coolDown: 5, npcTypeName: 'Maggot'}}
			],
			moveSpeed: 'NONE',
			hitPointType: 'MHIGH',
			maxMp: 3,
			isUnstableImmune: true,
			neverSleep: true,
			neverRespawn: true,
			neverRun: true,
			neverSpawnInZoo: true,
			noRegen: true,
			
		},
		
		SkeletonWarrior: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
			],
			onDeath: {typeName: 'SkeletonCorpse'},
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			noBlood: true,
			neverRun: true,
			noRegen: true,
			neverSleep: true,
			resistance: {Toxic: 1},
			effectImmune: ['InfectiousDisease']
			
		},
		
		SkeletonArcher: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MLOW', projectileTypeName: 'Dart', range: 7.0}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
			onDeath: {typeName: 'SkeletonCorpse'},
			noBlood: true,
			neverRun: true,
			noRegen: true,
			neverSleep: true,
			resistance: {Toxic: 1},
			effectImmune: ['InfectiousDisease']
		},

		Necromancer: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 4, projectileTypeName: 'PoisonArrow', shootEffect: 'ToxicShoot'}},
				{typeName: 'NPCPoisonCloud', stats: {damageType: 'MLOW', coolDown: 10}},
				{typeName: 'ReviveSkeleton', stats: {coolDown: 10}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			isKiter: true,
			resistance: {Toxic: 1},
		},
		
		ZombieBloat: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MHIGH'}},
				{typeName: 'Berserk', stats: {coolDown: 100, mana: 0}}
			],
			onDeath: {typeName: 'Bloat', stats: {damageType: 'MLOW'}},
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
			neverRun: true,
			noRegen: true,
			neverSleep: true,
			resistance: {Toxic: 1},
			effectImmune: ['InfectiousDisease']
		},
		
		Wraith: {
			abilityTypes: [
				{typeName: 'EXPDrainAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			noBlood: true,
			neverRun: true,
			noRegen: true,
			neverSleep: true,
			effectImmune: ['InfectiousDisease']
		},
		
		// THE_CRYPT_UNIQUE_NPCS:
		// ****************************************************************************************
		TheLichKing: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MEDIUM', projectileTypeName: 'PoisonArrow', shootEffect: 'ToxicShoot'}},
				{typeName: 'SummonMonsters', stats: {coolDown: 4, num: 1, npcTypeName: 'SkeletonWarrior'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'HIGH',
			isKiter: true,
			isUnique: true,
			noRegen: true,
			neverRun: true,
			resistance: {Toxic: 1},
			effectImmune: ['InfectiousDisease']
		},
		
		// THE_SEWERS:
		// ****************************************************************************************
		GiantLeach: {
			abilityTypes: [
				{typeName: 'VampireAttack', stats: {damageType: 'MEDIUM'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MHIGH',
			isAquatic: true,
		},
		
		BoaConstrictor: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
				{typeName: 'Constrict', stats: {coolDown: 10}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			gasImmune: true,
		},
		
		Troll: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MHIGH'}},
			],
			moveSpeed: 'SLOW',
			hitPointType: 'MHIGH',
			updateTurn: this.npcUpdateTurn.Regenerate,
			resistance: {Fire: -1},
		},
		
		Crocodile: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			neverWander: true,
			startHidden: true,
			ambushDistance: 3,
			neverRespondToShout: true,
			spawnInWater: true,
			isAquatic: true,
		},
		
		TentacleSpitter: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MEDIUM', range: LOS_DISTANCE, coolDown: 3, projectileTypeName: 'Acid'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			neverWander: true,
			startHidden: true,
			ambushDistance: 5.0,
			spawnInWater: true,
			isAquatic: true,
			isSwimming: true,
			neverRun: true,
			gasImmune: true,
			neverSpawnInZoo: true,
			neverRespawn: true,
		},
		
		Bloat: {
			abilityTypes: [
				{typeName: 'Suicide'}
			],
			onDeath: {typeName: 'Bloat', stats: {damageType: 'MLOW'}},
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			noBlood: true,
			isFlying: true,
			neverRun: true,
			gasImmune: true,
		},
		
		Slime: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MLOW'}},
			],
			onHit: this.npcOnHit.SlimeSplit,
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
			noBlood: true,
			neverRun: true,
			gasImmune: true,
			noRegen: true,
			resistance: {Toxic: -1},
		},
		
		ToxicStatue: {
			abilityTypes: [
				{typeName: 'PoisonCloudBolt', stats: {damageType: 'MEDIUM', coolDown: 5}},
				{typeName: 'WallOfPoisonGas', stats: {damageType: 'MEDIUM', coolDown: 10}},
				
			],
			moveSpeed: 'NONE',
			hitPointType: 'MHIGH',
			noBlood: true,
			neverRun: true,
			neverSpawnInZoo: true,
			noRegen: true,
			neverSleep: true,
			resistance: {Toxic: 1},
			
		},
		

		// ICE_CAVES:
		// ****************************************************************************************
		DireWolf: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'LOW'}},
			],
			moveSpeed: 'FAST',
			hitPointType: 'LOW',
			resistance: {Cold: 1, Fire: -1},
		},
		
		DireWolfKennel:	{
			abilityTypes: [
				{typeName: 'SpawnNPC', stats: {numSpawned: 3, coolDown: 8, npcTypeName: 'DireWolf'}}
			],
			moveSpeed: 'NONE',
			hitPointType: 'MEDIUM',
			maxMp: 3,
			neverSleep: true,
			neverRespawn: true,
			noBlood: true,
			neverRun: true,
			neverSpawnInZoo: true,
			noRegen: true,
			
		},
		
		Penguin: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MLOW', projectileTypeName: 'Snowball'}},
				{typeName: 'Slide'},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
			resistance: {Cold: 1, Fire: -1},
		},
		
		Yak: {
			abilityTypes: [
				{typeName: 'TrampleAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			resistance: {Cold: 1, Fire: -1},
		},
		
		IceStatue: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', range: LOS_DISTANCE, coolDown: 3, projectileTypeName: 'IceArrow', shootEffect: 'ColdShoot'}},
				{typeName: 'SummonIceBomb', stats: {damageType: 'HIGH', coolDown: 15}}
			],
			moveSpeed: 'NONE',
			hitPointType: 'MHIGH',
			noBlood: true,
			neverRun: true,
			neverSpawnInZoo: true,
			noRegen: true,
			neverSleep: true,
			resistance: {Cold: 1, Fire: -1},
			
		},
		
		PolarBear: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MHIGH'}},
				{typeName: 'Berserk', stats: {coolDown: 100, mana: 0}}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
			size: CHARACTER_SIZE.LARGE,
			resistance: {Cold: 1, Fire: -1},
		},

		IceElemental: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', range: ABILITY_RANGE, coolDown: 3, projectileTypeName: 'IceArrow', shootEffect: 'ColdShoot'}},
				{typeName: 'SummonIceBomb', stats: {damageType: 'HIGH', coolDown: 15}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
			noBlood: true,
			resistance: {Cold: 1, Fire: -1},
		},
		
		// THE_CORE:
		// ****************************************************************************************
		FireBat: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'LOW'}},
			],
			moveSpeed: 'FAST',
			hitPointType: 'LOW',
			isRandomMover: true,
			isFlying: true,
			size: CHARACTER_SIZE.SMALL,
			resistance: {Fire: 1, Cold: -1},
		},
		
		FireBatNest: {
			abilityTypes: [
				{typeName: 'SpawnNPC', stats: {numSpawned: 3, coolDown: 8, npcTypeName: 'FireBat'}}
			],
			moveSpeed: 'NONE',
			hitPointType: 'MEDIUM',
			maxMp: 3,
			isUnstableImmune: true,
			neverSleep: true,
			neverRespawn: true,
			neverRun: true,
			neverSpawnInZoo: true,
			noBlood: true,
			noRegen: true,
			
		},
		
		FireLizard: {
			abilityTypes: [
				{typeName: 'FlamingCloudBolt', stats: {damageType: 'MLOW', coolDown: 5}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
			isLavaImmune: true,
			resistance: {Fire: 1, Cold: -1},
		},
		
		LavaEel: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', range: LOS_DISTANCE, projectileTypeName: 'FireArrow', coolDown: 3, shootEffect: 'FireShoot'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MLOW',
			neverWander: true,
			startHidden: true,
			ambushDistance: 5.0,
			spawnInLava: true,
			noBlood: true,
			isSwimming: true,
			isAquatic: true,
			isLavaImmune: true,
			neverRun: true,
			neverSpawnInZoo: true,
			neverRespawn: true,
			resistance: {Fire: 1, Cold: -1},
		},
		
		FireStatue: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 3, range: LOS_DISTANCE, projectileTypeName: 'FireArrow', shootEffect: 'FireShoot'}},
				{typeName: 'OrbOfFire', stats: {damageType: 'HIGH', coolDown: 10, mana: 0}}
			],
			moveSpeed: 'NONE',
			hitPointType: 'MHIGH',
			neverRun: true,
			neverSpawnInZoo: true,
			noRegen: true,
			neverSleep: true,
			resistance: {Fire: 1, Cold: -1},
			
		},
		
		FireElemental: {
			abilityTypes: [
				{typeName: 'ProjectileAttack', stats: {damageType: 'MHIGH', coolDown: 3, projectileTypeName: 'FireArrow', shootEffect: 'FireShoot'}},
				{typeName: 'SpawnNPC', stats: {coolDown: 8, numSpawned: 1, mana: 0, npcTypeName: 'FireBall', damageType: 'HIGH'}}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MEDIUM',
			isKiter: true,
			noBlood: true,
			isLavaImmune: true,
			resistance: {Fire: 1, Cold: -1},
		},
		
		ObsidianGolem: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MHIGH'}},
				{typeName: 'Berserk', stats: {coolDown: 100, mana: 0}}
			],
			moveSpeed: 'SLOW',
			hitPointType: 'HIGH',
			noBlood: true,
			noRegen: true,
			neverSleep: true,
			size: CHARACTER_SIZE.LARGE,
			resistance: {Fire: 1, Cold: -1},
		},
		
		FireBall: {
			abilityTypes: [
				{typeName: 'Suicide'}
			],
			onDeath: {typeName: 'Explode'}, // Set damage in SummonFireBall ability
			moveSpeed: 'MEDIUM',
			hitPointType: 'LOW',
			noBlood: true,
			isFlying: true,
			neverRun: true,
			isLavaImmune: true,
			noRegen: true,
			updateTurn: this.npcUpdateTurn.FireBall,
			light: {color: '#ff0000', radius: 120, startAlpha: 'aa'},
			resistance: {Fire: 1, Cold: -1},
			
		},
		
		
	
		// MISC:
		// ****************************************************************************************
		Skeleton: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'MEDIUM'}},
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'MHIGH',
			noBlood: true,
			neverRun: true,
			noRegen: true,
			resistance: {Toxic: 1},
			sustainedMpCost: 3,
			effectImmune: ['InfectiousDisease']
		},
		
		MagicEye: {
			abilityTypes: [
				{typeName: 'WatchPlayer'}
			],
			moveSpeed: 'MEDIUM',
			hitPointType: 'LOW',
			isKiter: true,
			noBlood: true,
			isFlying: true,
			neverSpawnInZoo: true,
		},
		
		OrbOfFire: {
			faction: FACTION.NEUTRAL,
			onDeath: {typeName: 'BigExplode'}, // Set damage in OrbOfFire ability
			damageImmune: true,
			maxHp: 100,
			dontFace: true,
			moveSpeed: 'FAST',
			isSlowProjectile: true,
			noBlood: true,
			neverRun: true,
			isFlying: true,
			light: {color: '#ff0000', radius: 120, startAlpha: 'aa'},
			isMindless: true,
			
			
		},
		
		InfernoOrb: {
			faction: FACTION.NEUTRAL,
			damageImmune: true,
			maxHp: 100,
			dontFace: true,
			moveSpeed: 'FAST',
			noBlood: true,
			neverRun: true,
			isFlying: true,
			light: {color: '#ff0000', radius: 120, startAlpha: 'aa'},
			isMindless: true,
		},
		
		FirePot: {
			faction: FACTION.DESTRUCTABLE,
			onDeath: {typeName: 'FirePotExplode'},
			maxHp: 1,
			moveSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			gasImmune: true,
			isMindless: true,
		},
		
		GasPot: {
			faction: FACTION.DESTRUCTABLE,
			onDeath: {typeName: 'BreakGasPot'},
			maxHp: 1,
			moveSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			gasImmune: true,
			isMindless: true,
		},
		
		Crate: {
			faction: FACTION.DESTRUCTABLE,
			maxHp: 1,
			moveSpeed: 'NONE',
			noBlood: true,
			gasImmune: true,
			neverRun: true,
			dropPercent: STANDARD_DROP_PERCENT,
			isMindless: true,
		},
		
		SpiderEgg: {
			faction: FACTION.DESTRUCTABLE,
			maxHp: 4,
			moveSpeed: 'NONE',
			noBlood: true,
			gasImmune: true,
			neverRun: true,
			updateTurn: this.npcUpdateTurn.SpiderEgg,
			isMindless: true,
		},
		
		SpectralBlade: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'LOW'}}
			],
			moveSpeed: 'FAST',
			hitPointType: 'LOW',
			isFlying: true,
			noCorpse: true,
			noBlood: true,
			neverSpawn: true,
			noRegen: true,
			neverRun: true,
			isMindless: true,
		},
		
		GreaterSpectralBlade: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damageType: 'LOW'}}
			],
			moveSpeed: 'FAST',
			hitPointType: 'LOW',
			isFlying: true,
			noCorpse: true,
			noBlood: true,
			neverSpawn: true,
			noRegen: true,
			neverRun: true,
			isMindless: true,
		},
		
		Merchant: {
			faction: FACTION.NEUTRAL,
			maxHp: 100,
			dontFace: true,
			moveSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			gasImmune: true,
			damageImmune: true,
		},

		SkillTrainer: {
			faction: FACTION.NEUTRAL,
			maxHp: 100,
			dontFace: true,
			moveSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			gasImmune: true,
			damageImmune: true,
		},
		
		TalentTrainer: {
			faction: FACTION.NEUTRAL,
			maxHp: 100,
			dontFace: true,
			moveSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			gasImmune: true,
			damageImmune: true,
		},
		
		Priest: {
			faction: FACTION.NEUTRAL,
			maxHp: 100,
			dontFace: true,
			moveSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			gasImmune: true,
			damageImmune: true,
		},
        
		PracticeDummy: {
			faction: FACTION.HOSTILE,
			maxHp: 10000,
			moveSpeed: 'NONE',
			gasImmune: true,
			noRegen: true,
		},
		
		CryptAltar: {
			faction: FACTION.DESTRUCTABLE,
			maxHp: 30,
			moveSpeed: 'NONE',
			gasImmune: true,
			noRegen: true,
			noBlood: true,
			neverRun: true,
			isMindless: true,
		}
	};
	
	this.setNPCTypeFrames();
	this.setNPCTypeLevels();
	this.setNPCTypeDefaultProperties();	
};

// SET_NPC_TYPE_LEVELS:
// ************************************************************************************************
gs.setNPCTypeLevels = function () {
	
	// TIER_I_ZONES:
	// ********************************************************************************************
	// THE_UPPER_DUNGEON (TIER_I):
	this.npcTypes.Rat.level = 						DANGER_LEVEL.TIER_I[1];
	this.npcTypes.Bat.level = 						DANGER_LEVEL.TIER_I[1];
	this.npcTypes.RatNest.level = 					DANGER_LEVEL.TIER_I[1];
	this.npcTypes.GoblinArcher.level = 				DANGER_LEVEL.TIER_I[1];
	this.npcTypes.GoblinWarrior.level = 			DANGER_LEVEL.TIER_I[1];
	this.npcTypes.GoblinBrute.level = 				DANGER_LEVEL.TIER_I[2];
	this.npcTypes.GoblinFireMage.level = 			DANGER_LEVEL.TIER_I[2];
	this.npcTypes.GoblinStormMage.level = 			DANGER_LEVEL.TIER_I[2];
	this.npcTypes.Centipede.level =					DANGER_LEVEL.TIER_I[2];
	this.npcTypes.GoblinShaman.level = 				DANGER_LEVEL.TIER_I[3];
	this.npcTypes.CaveBear.level = 					DANGER_LEVEL.TIER_I[3];
	
	// Uniques:
	this.npcTypes.TheVampireBat.level = 			DANGER_LEVEL.TIER_I[4] + 1;
	this.npcTypes.TheRatPiper.level = 				DANGER_LEVEL.TIER_I[4] + 1;
	this.npcTypes.TheBridgeGuardian.level =			DANGER_LEVEL.TIER_I[4] + 1;
	
	// TIER_II_ZONES:
	// ********************************************************************************************
	// THE_ORC_FORTRESS (TIER_II):
	this.npcTypes.Wolf.level =						DANGER_LEVEL.TIER_II[1] - 1;
	this.npcTypes.OrcArcher.level = 				DANGER_LEVEL.TIER_II[1];
	this.npcTypes.OrcWarrior.level = 				DANGER_LEVEL.TIER_II[1];
	this.npcTypes.WolfKennel.level =				DANGER_LEVEL.TIER_II[2];
	this.npcTypes.Ogre.level = 						DANGER_LEVEL.TIER_II[2];
	this.npcTypes.OrcFireMage.level = 				DANGER_LEVEL.TIER_II[2];
	this.npcTypes.OrcStormMage.level = 				DANGER_LEVEL.TIER_II[2];
	this.npcTypes.OrcPriest.level = 				DANGER_LEVEL.TIER_II[3];
	this.npcTypes.OgreShaman.level = 				DANGER_LEVEL.TIER_II[3];
	this.npcTypes.OrcSummoner.level =				DANGER_LEVEL.TIER_II[4];
	this.npcTypes.SpectralBlade.level =				3;
	
	// Uniques:
	this.npcTypes.KingMonRacar.level = 		DANGER_LEVEL.TIER_II[4] + 1;
	
	// THE_SUNLESS_DESERT (TIER_II):
	this.npcTypes.Scarab.level =						DANGER_LEVEL.TIER_II[1] - 1;
	this.npcTypes.SpittingViper.level =					DANGER_LEVEL.TIER_II[1];
	this.npcTypes.TrapDoorSpider.level =				DANGER_LEVEL.TIER_II[1];
	this.npcTypes.Scorpion.level =						DANGER_LEVEL.TIER_II[2];
	this.npcTypes.SunFlower.level =						DANGER_LEVEL.TIER_II[2];
	this.npcTypes.Goat.level = 							DANGER_LEVEL.TIER_II[2];
	this.npcTypes.Mummy.level =							DANGER_LEVEL.TIER_II[2];
	this.npcTypes.MummyPriest.level =					DANGER_LEVEL.TIER_II[3];
	
	this.npcTypes.CylomarTheAncientPyromancer.level = 	DANGER_LEVEL.TIER_II[4] + 1;
	
	// THE_UNDER_GROVE (TIER_II):
	this.npcTypes.GiantBee.level =					DANGER_LEVEL.TIER_II[1];
	this.npcTypes.GiantAnt.level = 					DANGER_LEVEL.TIER_II[1];
	this.npcTypes.Jaguar.level = 					DANGER_LEVEL.TIER_II[1];
	this.npcTypes.Spider.level = 					DANGER_LEVEL.TIER_II[1];
	this.npcTypes.SpiderNest.level = 				DANGER_LEVEL.TIER_II[2];
	this.npcTypes.PoisonSpider.level = 				DANGER_LEVEL.TIER_II[2];
	this.npcTypes.CentaurArcher.level =				DANGER_LEVEL.TIER_II[2];
	this.npcTypes.CentaurWarrior.level =			DANGER_LEVEL.TIER_II[2];
	this.npcTypes.Chameleon.level =					DANGER_LEVEL.TIER_II[2];
	this.npcTypes.Elephant.level =					DANGER_LEVEL.TIER_II[3];
	
	// Uniques:
	this.npcTypes.TheQueenSpider.level = 			DANGER_LEVEL.TIER_II[4] + 1;
	
	// THE_SWAMP (TIER_II):
	this.npcTypes.Pirahna.level =					DANGER_LEVEL.TIER_II[1] - 1;
	this.npcTypes.PoisonViper.level = 				DANGER_LEVEL.TIER_II[1];
	this.npcTypes.BlinkFrog.level = 				DANGER_LEVEL.TIER_II[1];
	this.npcTypes.Mosquito.level =					DANGER_LEVEL.TIER_II[2];
	this.npcTypes.SpinyFrog.level = 				DANGER_LEVEL.TIER_II[2];
	this.npcTypes.ElectricEel.level = 				DANGER_LEVEL.TIER_II[2];
	this.npcTypes.BullFrog.level =					DANGER_LEVEL.TIER_II[3];
	this.npcTypes.SnappingTurtle.level =			DANGER_LEVEL.TIER_II[3];
	this.npcTypes.LickyToad.level =					DANGER_LEVEL.TIER_II[3];
	
	// Uniques:
	this.npcTypes.KasicTheMosquitoPrince.level = 	DANGER_LEVEL.TIER_II[4];
	
	// TIER_III_ZONES:
	// ********************************************************************************************
	// THE_IRON_FORTRESS (TIER_III):
	this.npcTypes.ClockworkRat.level =				DANGER_LEVEL.TIER_III[1] - 1;
	this.npcTypes.Bombomber.level =					DANGER_LEVEL.TIER_III[1];
	this.npcTypes.ClockworkArcher.level = 			DANGER_LEVEL.TIER_III[1];
	this.npcTypes.ClockworkWarrior.level = 			DANGER_LEVEL.TIER_III[1];
	this.npcTypes.ClockworkFactory.level = 			DANGER_LEVEL.TIER_III[2];
	this.npcTypes.GoblinBomber.level = 				DANGER_LEVEL.TIER_III[2];
	this.npcTypes.CorrosiveSlime.level = 			DANGER_LEVEL.TIER_III[2];
	this.npcTypes.ClockworkPyro.level =				DANGER_LEVEL.TIER_III[3];
	this.npcTypes.Ballista.level = 					DANGER_LEVEL.TIER_III[3];
	this.npcTypes.ClockworkRhino.level =			DANGER_LEVEL.TIER_III[4];
	
	
	// THE_DARK_TEMPLE (TIER_III):
	this.npcTypes.DarkElfWarden.level =				DANGER_LEVEL.TIER_III[1];
	this.npcTypes.DarkElfSentinel.level =			DANGER_LEVEL.TIER_III[1];
	this.npcTypes.DarkElfPyromancer.level = 		DANGER_LEVEL.TIER_III[2];
	this.npcTypes.DarkElfStormologist.level = 		DANGER_LEVEL.TIER_III[2];
	this.npcTypes.DarkElfPriest.level =				DANGER_LEVEL.TIER_III[3];
	this.npcTypes.DarkElfSummoner.level =  			DANGER_LEVEL.TIER_III[3];
	this.npcTypes.EvilEye.level =					DANGER_LEVEL.TIER_III[4];
	
	this.npcTypes.GreaterSpectralBlade.level = 6;
	
	// THE_CRYPT (TIER_III):
	this.npcTypes.Maggot.level = 					DANGER_LEVEL.TIER_III[1] - 1;
	this.npcTypes.RottingCorpse.level = 			DANGER_LEVEL.TIER_III[1];
	this.npcTypes.SkeletonWarrior.level = 			DANGER_LEVEL.TIER_III[1];
	this.npcTypes.SkeletonArcher.level = 			DANGER_LEVEL.TIER_III[1];
	this.npcTypes.Necromancer.level = 				DANGER_LEVEL.TIER_III[2];
	this.npcTypes.ZombieBloat.level = 				DANGER_LEVEL.TIER_III[3];
	this.npcTypes.Wraith.level = 					DANGER_LEVEL.TIER_III[4];
	
	// Uniques:
	this.npcTypes.TheLichKing.level = 				DANGER_LEVEL.TIER_III[4] + 1;
	
	// BRANCH_I_ZONES:
	// ********************************************************************************************
	// THE_ARCANE_TOWER (BRANCH_I):
	this.npcTypes.ManaViper.level =					DANGER_LEVEL.BRANCH_I[1];
	this.npcTypes.FireImp.level = 					DANGER_LEVEL.BRANCH_I[1];
	this.npcTypes.StormImp.level = 					DANGER_LEVEL.BRANCH_I[1];
	this.npcTypes.IceImp.level = 					DANGER_LEVEL.BRANCH_I[1];
	this.npcTypes.IronImp.level =					DANGER_LEVEL.BRANCH_I[1];
	this.npcTypes.StoneGolem.level = 				DANGER_LEVEL.BRANCH_I[2];
	this.npcTypes.FireStaffTurret.level = 			DANGER_LEVEL.BRANCH_I[3];
	this.npcTypes.StormStatue.level = 				DANGER_LEVEL.BRANCH_I[4];
	
	// THE_SEWERS (BRANCH_I):
	this.npcTypes.GiantLeach.level =				DANGER_LEVEL.BRANCH_I[1];
	this.npcTypes.BoaConstrictor.level = 			DANGER_LEVEL.BRANCH_I[1];
	this.npcTypes.Troll.level =						DANGER_LEVEL.BRANCH_I[1];
	this.npcTypes.TentacleSpitter.level = 			DANGER_LEVEL.BRANCH_I[1];
	this.npcTypes.AcidicSlime.level = 				DANGER_LEVEL.BRANCH_I[2];
	this.npcTypes.Bloat.level = 					DANGER_LEVEL.BRANCH_I[2];
	this.npcTypes.Crocodile.level = 				DANGER_LEVEL.BRANCH_I[3];
	this.npcTypes.Slime.level = 					DANGER_LEVEL.BRANCH_I[4];
	this.npcTypes.ToxicStatue.level =				DANGER_LEVEL.BRANCH_I[4];
	
	// BRANCH_II_ZONES:
	// ********************************************************************************************
	// THE_CORE (BRANCH_II):
	this.npcTypes.FireBat.level = 					DANGER_LEVEL.BRANCH_II[1];
	this.npcTypes.FireBatNest.level = 				DANGER_LEVEL.BRANCH_II[1];
	this.npcTypes.FireLizard.level = 				DANGER_LEVEL.BRANCH_II[1];
	this.npcTypes.LavaEel.level = 					DANGER_LEVEL.BRANCH_II[2];
	this.npcTypes.FireStatue.level = 				DANGER_LEVEL.BRANCH_II[3];
	this.npcTypes.FireElemental.level = 			DANGER_LEVEL.BRANCH_II[4];
	this.npcTypes.ObsidianGolem.level =				DANGER_LEVEL.BRANCH_II[4];
	
	this.npcTypes.FireBall.level = 					8;
	
	// THE_ICE_CAVES (BRANCH_II):
	this.npcTypes.DireWolf.level = 					DANGER_LEVEL.BRANCH_II[1];
	this.npcTypes.DireWolfKennel.level = 			DANGER_LEVEL.BRANCH_II[1];
	this.npcTypes.Penguin.level =					DANGER_LEVEL.BRANCH_II[1];
	this.npcTypes.Yak.level =						DANGER_LEVEL.BRANCH_II[2];
	this.npcTypes.PolarBear.level = 				DANGER_LEVEL.BRANCH_II[2];
	this.npcTypes.IceStatue.level = 				DANGER_LEVEL.BRANCH_II[3];
	this.npcTypes.IceElemental.level = 				DANGER_LEVEL.BRANCH_II[4];
	
	// TIER_IV_ZONES:
	// ********************************************************************************************
	// THE_VAULT_OF_YENDOR:
	this.npcTypes.HellHound.level = 				DANGER_LEVEL.TIER_IV[1] - 1;
	this.npcTypes.DrachnidWarrior.level =			DANGER_LEVEL.TIER_IV[1];
	this.npcTypes.DrachnidArcher.level =			DANGER_LEVEL.TIER_IV[1];
	this.npcTypes.CrystalGolem.level =				DANGER_LEVEL.TIER_IV[2];
	this.npcTypes.DarkElfBladeDancer.level = 		DANGER_LEVEL.TIER_IV[2];
	this.npcTypes.FleshGolem.level =				DANGER_LEVEL.TIER_IV[3];
	this.npcTypes.TentacleTerror.level =			DANGER_LEVEL.TIER_IV[3];
	this.npcTypes.Succubus.level =					DANGER_LEVEL.TIER_IV[4];
	
	this.npcTypes.StormElemental.level = 			DANGER_LEVEL.BRANCH_II[4];
	
	// MISC:
	// ********************************************************************************************
	this.npcTypes.Skeleton.level = 4;
	this.npcTypes.OrbOfFire.level = 0;
	this.npcTypes.InfernoOrb.level = 0;
	this.npcTypes.MagicEye.level = 9;
	this.npcTypes.SpiderEgg.level = 1;
	this.npcTypes.FirePot.level = 1;
	this.npcTypes.GasPot.level = 1;
	this.npcTypes.Merchant.level = 1;
	this.npcTypes.SkillTrainer.level = 1;
	this.npcTypes.TalentTrainer.level = 1;
	this.npcTypes.Priest.level = 1;
	this.npcTypes.Crate.level = 1;
	this.npcTypes.PracticeDummy.level = 1;
	this.npcTypes.CryptAltar.level = 1;
};

// SET_NPC_TYPE_FRAMES:
// ************************************************************************************************
gs.setNPCTypeFrames = function () {
	// THE_UPPER_DUNGEON:
	// ********************************************************************************************
	this.npcTypes.Rat.frame = 512;
	this.npcTypes.Bat.frame = 513;
	this.npcTypes.RatNest.frame = 514;
	this.npcTypes.GoblinWarrior.frame = 515;
	this.npcTypes.GoblinArcher.frame = 516;
	this.npcTypes.GoblinBrute.frame = 517;
	this.npcTypes.GoblinFireMage.frame = 518;
	this.npcTypes.GoblinStormMage.frame = 519;
	this.npcTypes.GoblinShaman.frame = 520;
	this.npcTypes.TheRatPiper.frame = 521;
	this.npcTypes.TheVampireBat.frame = 522;
	this.npcTypes.Centipede.frame = 523;
	this.npcTypes.TheBridgeGuardian.frame = 524;
	this.npcTypes.CaveBear.frame = 525;
	
	// THE_ORC_FORTRESS:
	// ********************************************************************************************
	this.npcTypes.OrcWarrior.frame = 544;
	this.npcTypes.OrcArcher.frame = 545;
	this.npcTypes.Ogre.frame = 546;
	this.npcTypes.OrcFireMage.frame = 547;
	this.npcTypes.OrcStormMage.frame = 548;
	this.npcTypes.OrcPriest.frame = 549;
	this.npcTypes.OrcSummoner.frame = 550;
	this.npcTypes.OgreShaman.frame = 552;
	this.npcTypes.Wolf.frame = 554;
	this.npcTypes.WolfKennel.frame = 555;
	
	// Uniques:
	this.npcTypes.KingMonRacar.frame = 557;
	
	// THE_IRON_FORTRESS:
	// ********************************************************************************************
	this.npcTypes.ClockworkRat.frame = 640;
	this.npcTypes.ClockworkFactory.frame = 641;
	this.npcTypes.Bombomber.frame = 642;
	this.npcTypes.ClockworkWarrior.frame = 643;
	this.npcTypes.ClockworkArcher.frame = 644;
	this.npcTypes.GoblinBomber.frame = 645;
	this.npcTypes.Ballista.frame = 646;
	this.npcTypes.ClockworkRhino.frame = 647;
	this.npcTypes.ClockworkPyro.frame = 648;
	this.npcTypes.CorrosiveSlime.frame = 551;
	
	// THE_DARK_TEMPLE:
	// ********************************************************************************************
	this.npcTypes.DarkElfWarden.frame = 576;
	this.npcTypes.DarkElfSentinel.frame = 577;
	this.npcTypes.DarkElfPyromancer.frame = 578;
	this.npcTypes.DarkElfStormologist.frame = 579;
	this.npcTypes.DarkElfPriest.frame = 580;
	this.npcTypes.DarkElfSummoner.frame = 581;
	this.npcTypes.EvilEye.frame = 582;
	this.npcTypes.MagicEye.frame = 583;
	
	// THE_VAULT_OF_YENDOR:
	// ********************************************************************************************
	this.npcTypes.HellHound.frame = 960;
	this.npcTypes.DrachnidWarrior.frame = 961;
	this.npcTypes.DrachnidArcher.frame = 962;
	this.npcTypes.FleshGolem.frame = 963;
	this.npcTypes.CrystalGolem.frame = 964;
	this.npcTypes.DarkElfBladeDancer.frame = 965;
	this.npcTypes.Succubus.frame = 966;
	this.npcTypes.TentacleTerror.frame = 967;
	this.npcTypes.StormElemental.frame= 968;
	
	/*
	this.npcTypes.Demonologist.frame = 584;
	*/
	
	// THE_SUNLESS_DESERT:
	// ********************************************************************************************
	this.npcTypes.Scarab.frame = 928;
	this.npcTypes.SpittingViper.frame = 929;
	this.npcTypes.TrapDoorSpider.frame = 930;
	this.npcTypes.Scorpion.frame = 931;
	
	this.npcTypes.Mummy.frame = 932;
	this.npcTypes.Goat.frame = 933;
	this.npcTypes.MummyPriest.frame = 934;
	this.npcTypes.SunFlower.frame = 935;
	
	// Uniques:
	this.npcTypes.CylomarTheAncientPyromancer.frame = 936;
	
	//this.npcTypes.AncientWindCaller.frame =	933;
	
	// THE_UNDER_GROVE:
	// ********************************************************************************************
	this.npcTypes.Jaguar.frame = 608;
	this.npcTypes.Spider.frame = 609;
	this.npcTypes.SpiderNest.frame = 610;
	this.npcTypes.PoisonSpider.frame = 611;
	this.npcTypes.CentaurArcher.frame = 612;
	this.npcTypes.Elephant.frame = 613;
	this.npcTypes.GiantAnt.frame = 616;
	this.npcTypes.GiantBee.frame = 614;
	this.npcTypes.CentaurWarrior.frame = 617;
	this.npcTypes.Chameleon.frame = 618;
	
	
	this.npcTypes.TheQueenSpider.frame = 615;
	
	// THE_SWAMP:
	// ********************************************************************************************
	this.npcTypes.Pirahna.frame = 672;
	this.npcTypes.PoisonViper.frame = 673;
	this.npcTypes.BlinkFrog.frame = 674;
	this.npcTypes.Mosquito.frame = 675;
	this.npcTypes.SpinyFrog.frame = 676;
	this.npcTypes.ElectricEel.frame = 677;
	this.npcTypes.BullFrog.frame = 678;
	this.npcTypes.SnappingTurtle.frame = 680;
	this.npcTypes.LickyToad.frame = 682;
	
	// Uniques:
	this.npcTypes.KasicTheMosquitoPrince.frame = 679;
	
	
	
	// THE_CRYPT:
	// ********************************************************************************************
	this.npcTypes.Maggot.frame = 704;
	this.npcTypes.RottingCorpse.frame = 705;
	this.npcTypes.SkeletonWarrior.frame = 706;
	this.npcTypes.SkeletonArcher.frame = 707;
	this.npcTypes.Necromancer.frame = 708;
	this.npcTypes.ZombieBloat.frame = 709;
	this.npcTypes.Wraith.frame = 710;
	this.npcTypes.TheLichKing.frame = 711;
	
	// THE_ARCANE_TOWER:
	// ********************************************************************************************
	this.npcTypes.ManaViper.frame = 736;
	this.npcTypes.FireImp.frame = 737;
	this.npcTypes.StormImp.frame = 738;
	this.npcTypes.IceImp.frame = 739;
	this.npcTypes.StoneGolem.frame = 740;
	this.npcTypes.FireStaffTurret.frame = 741;
	this.npcTypes.StormStatue.frame = 742;
	this.npcTypes.IronImp.frame = 743;
	
	// THE_ICE_CAVES:
	// ********************************************************************************************
	this.npcTypes.DireWolf.frame = 800;
	this.npcTypes.DireWolfKennel.frame = 801;
	this.npcTypes.IceStatue.frame = 802;
	this.npcTypes.PolarBear.frame = 803;
	this.npcTypes.IceElemental.frame = 804;
	this.npcTypes.Penguin.frame = 805;
	this.npcTypes.Yak.frame = 807;
	
	// THE_CORE:
	// ********************************************************************************************
	this.npcTypes.FireBat.frame = 832;
	this.npcTypes.FireBatNest.frame = 833;
	this.npcTypes.LavaEel.frame = 834;
	this.npcTypes.FireStatue.frame = 835;
	this.npcTypes.FireElemental.frame = 836;
	this.npcTypes.FireLizard.frame = 837;
	this.npcTypes.ObsidianGolem.frame = 838;
	
	// THE_SEWERS:
	// ********************************************************************************************
	this.npcTypes.BoaConstrictor.frame = 768;
	this.npcTypes.Troll.frame = 769;
	this.npcTypes.Crocodile.frame = 770;
	this.npcTypes.TentacleSpitter.frame = 771;
	this.npcTypes.Bloat.frame = 772;
	this.npcTypes.Slime.frame = 773;
	this.npcTypes.AcidicSlime.frame = 553;
	this.npcTypes.GiantLeach.frame = 777;
	this.npcTypes.ToxicStatue.frame = 778;
	
	// MISC:
	this.npcTypes.Skeleton.frame = 706;
	this.npcTypes.Merchant.frame = 896;

	this.npcTypes.SkillTrainer.frame = 897;
	this.npcTypes.TalentTrainer.frame = 898;
	this.npcTypes.Priest.frame = 899;
	this.npcTypes.OrbOfFire.frame = 900;
	this.npcTypes.InfernoOrb.frame = 900;
	this.npcTypes.FireBall.frame = 900;
	this.npcTypes.SpectralBlade.frame = 902;
	this.npcTypes.FirePot.frame = 903;
	this.npcTypes.GasPot.frame = 904;
	this.npcTypes.Crate.frame = 905;
	this.npcTypes.SpiderEgg.frame = 906;
	this.npcTypes.GreaterSpectralBlade.frame = 907;
	this.npcTypes.PracticeDummy.frame = 908;
	this.npcTypes.CryptAltar.frame = 909;
};

// SET_NPC_TYPE_DEFAULT_PROPERTIES:
// ************************************************************************************************
gs.setNPCTypeDefaultProperties = function () {
	this.npcTypeList = [];
	
	this.nameTypes(this.npcTypes);
	
	gs.forEachType(this.npcTypes, function (npcType) {
		this.npcTypeList.push(npcType);
		
		if (!npcType.hasOwnProperty('level')) {
			throw 'npcType missing level: ' + npcType.name;
		}
		
		if (!npcType.hasOwnProperty('frame')) {
			throw 'npcType missing frame: ' + npcType.name;
		}
		
		if (!npcType.hasOwnProperty('faction')) {
			npcType.faction = FACTION.HOSTILE;
		}
		
		if (!npcType.hasOwnProperty('dropPercent')) {
			npcType.dropPercent = 0;
		}
		
		if (!npcType.hasOwnProperty('bloodTypeName')) {
			npcType.bloodTypeName = 'Blood';
		}
		
		if (!npcType.hasOwnProperty('isSlowProjectile')) {
			npcType.isSlowProjectile = false;
		}
		
		if (!npcType.hasOwnProperty('reflection')) {
			npcType.reflection = 0;
		}
		
		if (!npcType.hasOwnProperty('size')) {
			npcType.size = CHARACTER_SIZE.MEDIUM;
		}
		
		npcType.damageShield = npcType.damageShield || 0;
		
		// Max HP:
		if (!npcType.maxHp) {
			npcType.maxHp = this.npcMaxHp(npcType.level, npcType.hitPointType);
		}
		
		// Max EP:
		npcType.maxMp = npcType.maxMp || 0;
		
		// Abilities:
		if (npcType.abilityTypes) {
			for (let i = 0; i < npcType.abilityTypes.length; i += 1) {
				npcType.abilityTypes[i] = gs.createNPCAbilityType(npcType, npcType.abilityTypes[i].typeName, npcType.abilityTypes[i].stats);
			}
		}
		
		// On Death:
		if (npcType.onDeath) {
			npcType.onDeath = gs.createNPCAbilityType(npcType, npcType.onDeath.typeName, npcType.onDeath.stats);
		}
		
		// resistance:
		if (!npcType.hasOwnProperty('resistance')) {
			npcType.resistance = {};
		}
		
		npcType.protection = 0;
		DAMAGE_TYPES.forEach(function (damageType) {
			if (npcType.resistance[damageType]) {
				if (damageType === 'Physical') {
					npcType.protection = npcType.level;
				}
				else if (npcType.resistance[damageType] === 1) {
					npcType.resistance[damageType] = 2;
				}
				else if (npcType.resistance[damageType] === -1) {
					npcType.resistance[damageType] = -1;
				}
			}
			else {
				npcType.resistance[damageType] = 0;
			}
		}, this);
		
		npcType.evasion = 0;
		
		// Speed:
		npcType.movementSpeed = {NONE: 0, SLOW: 0, MEDIUM: 1, FAST: 2}[npcType.moveSpeed];
		if (npcType.moveSpeed === 'NONE') {
			npcType.cantMove = true;
		}
			
		// Exp:
		npcType.exp = npcType.level;
		
		npcType.effectImmune = npcType.effectImmune || [];
		
	}, this);
	
	// Some characters have no exp value:
	this.npcTypes.Skeleton.exp = 0;
	this.npcTypes.FirePot.exp = 0;
	this.npcTypes.OrbOfFire.exp = 0;
	this.npcTypes.InfernoOrb.exp = 0;
	this.npcTypes.FireBall.exp = 0;
	this.npcTypes.GasPot.exp = 0;
	this.npcTypes.Crate.exp = 0;
	
	this.npcTypes.Maggot.exp = Math.ceil(this.npcTypes.Maggot.exp / 2);
	this.npcTypes.FireBat.exp = Math.ceil(this.npcTypes.FireBat.exp / 2);
	this.npcTypes.DireWolf.exp = Math.ceil(this.npcTypes.DireWolf.exp / 2);
	this.npcTypes.Slime.exp = Math.ceil(this.npcTypes.Slime.exp / 2);
};

// NPC_DAMAGE:
// ************************************************************************************************
gs.npcDamage = function (level, type) {
	if (!NPC_INITIAL_DAMAGE[type]) throw 'Invalid damageType: ' + type;
	
	return Math.round(NPC_INITIAL_DAMAGE[type] + (level - 1) * NPC_DAMAGE_PER_LEVEL[type]);
};

// NPC_MAX_HP:
// ************************************************************************************************
gs.npcMaxHp = function (level, type) {
	if (!NPC_INITIAL_HP[type]) throw 'Invalid hpType: ' + type;
	
	return Math.round(NPC_INITIAL_HP[type] + (level - 1) * NPC_HP_PER_LEVEL[type]);
};

// CREATE_NPC_CLASS_TYPES:
// ************************************************************************************************
gs.createNPCClassTypes = function () {
	this.npcClassTypes = {};
	
	// TOUGH:
	this.npcClassTypes.Tough = {};
	this.npcClassTypes.Tough.effect = function (npc) {
		npc.bonusMaxHp += Math.ceil(npc.type.maxHp / 2);
	};
	
	// STRONG:
	this.npcClassTypes.Strong = {};
	this.npcClassTypes.Strong.effect = function (npc) {
		npc.meleePower += 10;
	};
	
	// BLINKING:
	this.npcClassTypes.Blinking = {};
	this.npcClassTypes.Blinking.onHit = this.npcOnHit.BlinkFrog;
	
	// REGENERATING:
	this.npcClassTypes.Regenerating = {};
	this.npcClassTypes.Regenerating.updateTurn = gs.npcUpdateTurn.Regenerate;
	
	// FAST:
	this.npcClassTypes.Fast = {};
	this.npcClassTypes.Fast.effect = function (npc) {
		npc.bonusMovementSpeed += 1;
	};
	
	// SPINY:
	this.npcClassTypes.Spiny = {};
	this.npcClassTypes.Spiny.effect = function (npc) {
		npc.bonusDamageShield += gs.npcDamage(npc.level, 'LOW');
	};
	
	this.nameTypes(this.npcClassTypes);
};

// GET_NPC_CLASS_TYPE:
// ************************************************************************************************
gs.getNPCClassType = function (npcTypeName) {
	var validList, type = this.npcTypes[npcTypeName];
	
	validList = ['Tough'];
	
	// Fast:
	if (type.movementSpeed < 2 && !type.cantMove) {
		validList.push('Fast');
	}
	
	// Strong:
	if (type.abilityTypes.find(e => e.name === 'MeleeAttack')) {
		validList.push('Strong');
	}
	
	// Regenerating:
	if (!type.noRegen && !type.updateTurn) {
		validList.push('Regenerating');
	}
	
	// Blinking:
	if (!type.onHit && !type.cantMove) {
		validList.push('Blinking');
	}
	
	// Spiny
	if (!type.damageShield) {
		validList.push('Spiny');
	}
	
	return this.npcClassTypes[util.randElem(validList)];
};