/*global game, gs*/
/*global TALENTS_PER_BOOK, MAX_RAGE, RAGE_DECREASE_TURNS*/
/*jshint esversion: 6*/
'use strict';


// CREATE_TALENTS:
// ************************************************************************************************
gs.createTalents = function () {
	this.talents = {};
	
	this.createTalentEffects();

	// NECROMANCY:
	// ********************************************************************************************
	// Active:
	this.talents.LifeSpike = 			{skillName: 'Necromancy', 	level: [1, 5, 9]};
	this.talents.ToxicAttunement = 		{skillName: 'Necromancy',	level: [1, 5, 9]};
	this.talents.SummonSkeleton =		{skillName: 'Necromancy',	level: [4, 8, 12]};
	this.talents.InfectiousDisease =	{skillName: 'Necromancy',	level: [4, 8, 12]};
	this.talents.Cannibalise = 			{skillName: 'Necromancy',	level: [8]};
	this.talents.PoisonCloud = 			{skillName: 'Necromancy',	level: [8, 12, 16]};
	
	// Passive:
	this.talents.ToxicMastery =			{skillName: 'Necromancy',	level: [1, 5, 9], bonus: [4, 3, 2]};
	
	// FIRE_MAGIC:
	// ********************************************************************************************
	// Active:
	this.talents.FireBall = 			{skillName: 'FireMagic',	level: [1, 5, 9]};
	this.talents.FireAttunement = 		{skillName: 'FireMagic',	level: [1, 5, 9]};
	this.talents.FlamingHands =			{skillName: 'FireMagic',	level: [4, 8, 12]};
	this.talents.BurstOfFlame = 		{skillName: 'FireMagic',	level: [4, 8, 12]};
	this.talents.FireBolt =				{skillName: 'FireMagic',	level: [4, 8, 12]};
	this.talents.InfernoOrb = 			{skillName: 'FireMagic',	level: [8, 12, 16]};
	
	// Passive:
	this.talents.FireMastery =			{skillName: 'FireMagic',	level: [1, 5, 9], bonus: [4, 3, 2]};
	
	
	// STORM_MAGIC:
	// ********************************************************************************************
	// TIER_I
	this.talents.LightningBolt = 		{skillName: 'StormMagic',	level: [1, 5, 9]};
	this.talents.StormAttunement = 		{skillName: 'StormMagic',	level: [1, 5, 9]};
	this.talents.StormMastery =			{skillName: 'StormMagic',	level: [1, 5, 9], bonus: [4, 3, 2]};
	
	// TIER_II:
	this.talents.Shock =				{skillName: 'StormMagic',	level: [4, 8, 12]};
	this.talents.ThunderClap = 			{skillName: 'StormMagic',	level: [4, 8, 12]};
	this.talents.Levitation =			{skillName: 'StormMagic',	level: [8]};
	
	// TIER_III:
	this.talents.StaticDischarge = 		{skillName: 'StormMagic',	level: [8, 12, 16]};
	
	// COLD_MAGIC:
	// ********************************************************************************************
	// TIER_I:
	this.talents.ConeOfCold =			{skillName: 'ColdMagic',	level: [1, 5, 9]};
	this.talents.ColdAttunement = 		{skillName: 'ColdMagic',	level: [1, 5, 9]};
	this.talents.ColdMastery =			{skillName: 'ColdMagic',	level: [1, 5, 9], bonus: [4, 3, 2]};
	
	// TIER_II:
	this.talents.FreezingCloud =		{skillName: 'ColdMagic',	level: [4, 8, 12]};
	this.talents.Freeze =				{skillName: 'ColdMagic',	level: [4, 8, 12]};
	this.talents.IceArmor =				{skillName: 'ColdMagic',	level: [8]};
	
	// TIER_III:
	this.talents.FlashFreeze =			{skillName: 'ColdMagic',	level: [8, 12, 16]};

	// ENCHANTMENT_MAGIC:
	// ********************************************************************************************
	// TIER_I:
	this.talents.Confusion =			{skillName: 'Enchantment',	level: [1, 5, 9]};
	this.talents.Fear =					{skillName: 'Enchantment',	level: [1, 5, 9]};
	
	// TIER_II:
	this.talents.Charm =				{skillName: 'Enchantment',	level: [4, 8, 12]};
	this.talents.Mesmerize =			{skillName: 'Enchantment',	level: [4, 8, 12]};
	this.talents.Swiftness =			{skillName: 'Enchantment',	level: [8]};
	
	// FOCUS:
	// ********************************************************************************************
	// Passive:
	this.talents.MagicMastery =			{skillName: 'Focus', 		level: [1, 5, 9], bonus: [4, 3, 2]};
	this.talents.Focus = 				{skillName: 'Focus', 		level: [1, 5, 9], bonusMp: [3, 2, 2]};
	this.talents.Tranquility =			{skillName: 'Focus', 		level: [4, 8, 12]};
	
	// DEFENSE:
	// ********************************************************************************************
	// Active:
	this.talents.ShieldsUp =			{skillName: 'Defense',		level: [1]};
	this.talents.Deflect =				{skillName: 'Defense',		level: [4, 8, 12]};
	// Defensive: like an extended shields up + deflect until you attack
	
	// Passive:
	this.talents.Fortitude = 			{skillName: 'Defense',		level: [1, 5, 9], bonusHp: [8, 6, 6]};
	this.talents.Regeneration =			{skillName: 'Defense',		level: [4, 8, 12]};
	this.talents.ShieldWall =			{skillName: 'Defense',		level: [4]};
	this.talents.FireResistance =		{skillName: 'Defense',		level: [4, 8, 12], resistance: [1, 2, 3]};
	this.talents.ColdResistance =		{skillName: 'Defense',		level: [4, 8, 12], resistance: [1, 2, 3]};
	this.talents.ShockResistance =		{skillName: 'Defense',		level: [4, 8, 12], resistance: [1, 2, 3]};
	this.talents.ToxicResistance =		{skillName: 'Defense',		level: [4, 8, 12], resistance: [1, 2, 3]};
	
	// MELEE:
	// ********************************************************************************************
	// TIER_I
	this.talents.PowerStrike = 			{skillName: 'Melee',		level: [1, 5, 9]};
	this.talents.WeaponMastery =		{skillName: 'Melee',		level: [1, 5, 9], bonus: [4, 3, 2]};
	this.talents.BloodLust =			{skillName: 'Melee',		level: [1, 5, 9], neverDrop: true};
	this.talents.Disengage =			{skillName: 'Melee',		level: [1, 5, 9]};
	
	// TIER_II:
	this.talents.Lunge =				{skillName: 'Melee',		level: [4, 8, 12]};
	this.talents.Charge = 				{skillName: 'Melee',		level: [4, 8, 12]};
	this.talents.WarCry =				{skillName: 'Melee',		level: [4], neverDrop: true};
	
	// TIER_III:
	this.talents.Berserk = 				{skillName: 'Melee',		level: [8, 12, 16]};

	// RANGE:
	// ********************************************************************************************
	// TIER_I:
	this.talents.PowerShot = 			{skillName: 'Range',		level: [1, 5, 9]};
	this.talents.RangeMastery =			{skillName: 'Range',		level: [1, 5, 9], bonus: [4, 3, 2]};
	
	// TIER_II:
	this.talents.TunnelShot = 			{skillName: 'Range',		level: [4, 8, 12]};
	this.talents.PerfectAim =			{skillName: 'Range',		level: [4]};
	
	// TIER_III:
	this.talents.DeadEye = 				{skillName: 'Range',		level: [8, 12, 16]};
		
	// STEALTH:
	// ********************************************************************************************
	// TIER_I:
	this.talents.SleepingDart = 		{skillName: 'Stealth',		level: [1, 5, 9]};
	this.talents.StealthMastery =		{skillName: 'Stealth',		level: [1, 5, 9], bonus: [4, 3, 2]};
	
	// TIER_II:
	this.talents.SmokeBomb =			{skillName: 'Stealth',		level: [4, 8, 12]};
	this.talents.NimbleFingers =		{skillName: 'Stealth',		level: [4, 8, 12]};
	this.talents.DungeonSense = 		{skillName: 'Stealth',		level: [4]};
	this.talents.KeenHearing = 			{skillName: 'Stealth',		level: [4, 8, 12], range: [10, 15, 20]};	
	
	// TIER_III:
	this.talents.HeadShot = 			{skillName: 'Stealth',		level: [8]};
	this.talents.Evade = 				{skillName: 'Stealth',		level: [8]};

	// ATHLETICS:
	// ********************************************************************************************
	// Active:
	this.talents.Sprint =				{skillName: 'Athletics',	level: [1, 5, 9]};
	this.talents.Evasive =				{skillName: 'Athletics',	level: [1, 5, 9], bonus: [4, 3, 2]};
	this.talents.StrafeAttack =			{skillName: 'Athletics',	level: [4]};

	// RACIAL_TALENTS:
	// ********************************************************************************************
	this.talents.StoneSkin =			{level: [1, 5, 9], bonus: [4, 3, 2], neverDrop: true};
	
	// Set Default Properties:
	this.talentList = [];
	this.nameTypes(this.talents);
	this.forEachType(this.talents, function (talent) {
		// Setting abilities:
		if (this.abilityTypes[talent.name]) {
			talent.ability = this.abilityTypes[talent.name];
		}
		
		// Setting effects:
		if (this.talentEffects[talent.name]) {
			talent.effect = this.talentEffects[talent.name];
		}
		
		// Setting onLearn:
		if (this.talentOnLearn[talent.name]) {
			talent.onLearn = this.talentOnLearn[talent.name];
		}
		
		this.talentList.push(talent);
	}, this);
	
	this.createTalentDesc();
};

// CREATE_TALENT_DESC:
// ************************************************************************************************
gs.createTalentDesc = function () {
	// NECROMANCY:
	this.talents.ToxicMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' toxic magic power.';
		}
		else {
			return '';
		}
	};	
	this.talents.LifeSpike.desc = 			'Drains the life of the target over time, healing the caster. Can be stacked multiple times.';
	this.talents.ToxicAttunement.desc = 	'Increases your toxic magic power and reduces toxic magic mana cost by 1MP for the duration of the effect.';
	this.talents.Cannibalise.desc = 		'Sacrifices 8 hit points to regain 6 points of mana.';
	this.talents.PoisonCloud.desc = 		'Summons a cloud of poison gas.';
	this.talents.SummonSkeleton.desc =		'Summons one or more skeletal minion to fight for you.';
	this.talents.InfectiousDisease.desc = 	'Infects a single target with a disease which will spread to nearby characters.';
	
	// FIRE_MAGIC:
	this.talents.FireMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' fire magic power.';
		}
		else {
			return '';
		}
	};	
	this.talents.FireBall.desc = 			'发射一个会爆炸的火球，伤害怪物并点燃可燃物。';
	this.talents.FireAttunement.desc = 		'Increases your fire magic power and reduces fire magic mana cost by 1MP for the duration of the effect.';
	this.talents.BurstOfFlame.desc = 		'Creates a burst of flame on a single tile. Will create a large burst if used on a torch or other flaming object.';
	this.talents.InfernoOrb.desc = 			'Summons a slow moving fire ball which bursts upon impact in a powerful explosion.';
	this.talents.FlamingHands.desc =		'You will throw flaming projectiles with every attack for the duration of the effect.';
	this.talents.FireBolt.desc = 			'Sends forth a bolt of fire, hitting multiple monsters in a straight line.';
	
	// STORM_MAGIC:
	this.talents.StormMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' storm magic power.';
		}
		else {
			return '';
		}
	};	
	this.talents.LightningBolt.desc = 		'Sends forth a bolt of lightning, hitting multiple monsters in a straight line.';
	this.talents.StormAttunement.desc = 	'Increases your storm magic power and reduces storm magic mana cost by 1MP for the duration of the effect.';
	this.talents.Shock.desc =				'Shocks your target and spreads to all adjacent characters.';
	this.talents.ThunderClap.desc = 		'Creates a massive boom of thunder stunning all enemies for the duration of the effect.';
	this.talents.StaticDischarge.desc = 	'Lets loose a powerful burst of electricity damaging all nearby monsters.';
	
	// ICE_MAGIC:
	this.talents.ColdMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' ice magic power.';
		}
		else {
			return '';
		}
	};	
	this.talents.ColdAttunement.desc = 		'Increases your cold magic power and reduces cold magic mana cost by 1MP for the duration of the effect.';
	this.talents.ConeOfCold.desc =			'Blasts a group of enemies with freezing cold, damaging, slowing and knocking them back.';
	this.talents.FreezingCloud.desc =		'Summons a cloud of freezing vapours that will damage characters standing within it.';
	this.talents.Freeze.desc =				'Freezes a character in a block of ice, rendering them unable to act for the duration of the effect.';
	this.talents.IceArmor.desc =			'Grants +5 protection while maintaining the effect.';
	this.talents.FlashFreeze.desc =			'Freezes every character in your line of sight in a block of ice, rendering them unable to act.';
	
	// ENCHANTMENT_MAGIC:
	this.talents.Confusion.desc =			'Confuses one or more creatures causing them to attack their nearest target.';
	this.talents.Fear.desc =				'Causes all enemies in a radius around you to run away in fear.';
	this.talents.Charm.desc =				'Charms a single creature, turning it temporarily to your side.';
	this.talents.Mesmerize.desc =			'Puts a group of enemies into a deep sleep.';
	this.talents.Swiftness.desc =			'Allows you to move at double speed while maintaining this effect.';
	
	// MELEE:
	this.talents.WeaponMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' melee weapon power.';
		}
		else {
			return '';
		}
	};	
	this.talents.PowerStrike.desc = 		'Delivers a powerful strike with your weapon dealing increased damage and knockback.';
	this.talents.Charge.desc = 				'Allows you to sprint towards an enemy and attack in a single turn.';
	this.talents.Berserk.desc = 			'You will deal critical hits with every melee attack for the duration of the effect.';
	
	this.talents.BloodLust.desc = 			'+1 max rage.';
	this.talents.WarCry.desc =				'Instantly fills your rage meter and stuns enemies around you. Also alerts nearby enemies.';
	
	// RANGE:
	this.talents.RangeMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' range weapon power.';
		}
		else {
			return '';
		}
	};	
	this.talents.PowerShot.desc = 			'Delivers a powerful shot with your ranged weapon dealing increased damage and knockback.';
	this.talents.TunnelShot.desc = 			'Allows you to throw a projectile clear through a number of monsters, dealing increased damage.';
	this.talents.DeadEye.desc = 			'When activated, you will deal critical hits with every ranged attack for the duration of the effect.';
	this.talents.PerfectAim.desc =			'Allows you to shoot at your desired target through other enemies.';
	this.talents.Disengage.desc =			'Attack an enemy and back up a step. No cooldown when dealing a killing blow.';
	this.talents.Lunge.desc =				'Lunge and attack an enemy. No cooldown when dealing a killing blow.';
	//this.talents.StrongArm.desc = 			'+1 range and +10% damage, with thrown weapons.';
	//this.talents.AmmoConservation.desc = 	'+10% chance to save ammo per talent level.';
	
	
	// DEFENSE:
	this.talents.ShieldsUp.desc =		'You will block and counterattack against every enemy that strikes you in the next turn';
	this.talents.ShieldWall.desc =		'Increases protection for every adjacent wall';
	this.talents.Deflect.desc =			'+10 reflection for the duration of the effect.';
	this.talents.Fortitude.desc = 		function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return 'Increases your max hit points by ' + this.bonusHp[talentLevel - 1] + '.';
		}
		else {
			return '';
		}
	};	
	this.talents.Regeneration.desc =	'+1 HP regeneration.';
	this.talents.FireResistance.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+1 Fire Resistance.';
		}
		else {
			return '';
		}
	};	
	this.talents.ColdResistance.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+1 Cold Resistance.';
		}
		else {
			return '';
		}
	};	
	this.talents.ShockResistance.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+1 Shock Resistance.';
		}
		else {
			return '';
		}
	};	
	this.talents.ToxicResistance.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+1 Toxic Resistance.';
		}
		else {
			return '';
		}
	};	
	
	
	// FOCUS:
	this.talents.MagicMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' magic power.';
		}
		else {
			return '';
		}
	};	
	this.talents.Focus.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return 'Increases your max mana points by ' + this.bonusMp[talentLevel - 1] + '.';
		}
		else {
			return '';
		}
	};	
	this.talents.Tranquility.desc =		'+1 MP regeneration.';
	//this.talents.Adrenaline.desc = 			'50% chance to save mana when less then 1/3 HP.';
	//this.talents.ManaConservation.desc = 	'There is a 20% chance when using an ability that mana will not be consumed.';


	// STEALTH:
	this.talents.StealthMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' stealth.';
		}
		else {
			return '';
		}
	};	
	this.talents.SleepingDart.desc = 	"Puts an enemy into a deep sleep.";
	this.talents.SmokeBomb.desc =		"Creates a cloud of opaque smoke, blocking line of sight.";
	this.talents.DungeonSense.desc = 	'Reveals the location of all treasure and stairs on your mini-map.';
	this.talents.NimbleFingers.desc =	'Allows you to pick up and place traps.';
	this.talents.Evade.desc = 			'When activated, all monsters will immediately forget about you.';
	this.talents.HeadShot.desc =		'Allows you to perform ranged sneak attacks.';
	this.talents.KeenHearing.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return 'Allows you to detect nearby monsters on your mini-map up to a range of  ' + this.range[talentLevel - 1] + ' tiles.';
		}
		else {
			return '';
		}
	};	
	
	//this.talents.SneakAttack.desc = 	'Allows you to sneak attack unaware enemies. Additional talent levels will raise sneak attack damage by 20%';
	//this.talents.Sneak.desc = 			'When activated, your stealth skill will be greatly increased';
	//this.talents.KeenHearing.desc = 	'You gain the permanent ability to detect nearby monsters on your mini-map.';
				
	// ATHLETICS:
	this.talents.Evasive.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' evasion.';
		}
		else {
			return '';
		}
	};	
	this.talents.Sprint.desc = 			'Allows you to sprint multiple tiles in a single turn.';
	this.talents.StrafeAttack.desc =		'You will automatically attack the nearest enemy when moving towards or strafing.';
	
	this.talents.StoneSkin.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' protection.';
		}
		else {
			return '';
		}
	};	
	
};

// CREATE_TALENT_EFFECTS:
// ************************************************************************************************
gs.createTalentEffects = function () {
	this.talentEffects = {};
	this.talentOnLearn = {};
	
	this.talentEffects.FireMastery = function (character) {
		for (let i = 0; i < character.getTalentLevel('FireMastery'); i += 1) {
			character.firePower += gs.talents.FireMastery.bonus[i];
		}
	};
	
	this.talentEffects.StormMastery = function (character) {
		for (let i = 0; i < character.getTalentLevel('StormMastery'); i += 1) {
			character.stormPower += gs.talents.StormMastery.bonus[i];
		}
	};
	
	this.talentEffects.ColdMastery = function (character) {
		for (let i = 0; i < character.getTalentLevel('ColdMastery'); i += 1) {
			character.coldPower += gs.talents.ColdMastery.bonus[i];
		}
	};
	this.talentEffects.ToxicMastery = function (character) {
		for (let i = 0; i < character.getTalentLevel('ToxicMastery'); i += 1) {
			character.toxicPower += gs.talents.ToxicMastery.bonus[i];
		}
	};
	
	this.talentEffects.Evasive = function (character) {
		for (let i = 0; i < character.getTalentLevel('Evasive'); i += 1) {
			character.bonusEvasion += gs.talents.Evasive.bonus[i];
		}
	};
	
	// FOCUS:
	// ********************************************************************************************
	this.talentEffects.MagicMastery = function (character) {
		for (let i = 0; i < character.getTalentLevel('MagicMastery'); i += 1) {
			character.spellPower += gs.talents.MagicMastery.bonus[i];
		}
	};
	
	this.talentEffects.Focus = function (character) {
		for (let i = 0; i < character.getTalentLevel('Focus'); i += 1) {
			character.bonusMaxMp += gs.talents.Focus.bonusMp[i];
		}
	};
	
	this.talentOnLearn.Focus = function (character) {
		character.gainMp(gs.talents.Focus.bonusMp[character.getTalentLevel('Focus') - 1]);	
	};
	
	this.talentEffects.ManaConservation = function (character) {
		character.bonusSaveManaChance += 0.2;
	};
	
	this.talentEffects.Tranquility = function (character) {
		character.bonusMpRegenTime += character.getTalentLevel('Tranquility');
	};
	
	// DEFENSE:
	// ********************************************************************************************
	this.talentEffects.Fortitude = function (character) {
		for (let i = 0; i < character.getTalentLevel('Fortitude'); i += 1) {
			character.bonusMaxHp += gs.talents.Fortitude.bonusHp[i];
		}
		
	};
	this.talentOnLearn.Fortitude = function (character) {
		character.healHp(gs.talents.Fortitude.bonusHp[character.getTalentLevel('Fortitude') - 1]);
	};
	
	this.talentEffects.Regeneration = function (character) {
		character.bonusHpRegenTime += character.getTalentLevel('Regeneration');
	};
	
	this.talentEffects.FireResistance = function (character) {
		character.resistance.Fire += gs.talents.FireResistance.resistance[character.getTalentLevel('FireResistance') - 1];
	};
	this.talentEffects.ColdResistance = function (character) {
		character.resistance.Cold += gs.talents.ColdResistance.resistance[character.getTalentLevel('ColdResistance') - 1];
	};
	this.talentEffects.ShockResistance = function (character) {
		character.resistance.Shock += gs.talents.ShockResistance.resistance[character.getTalentLevel('ShockResistance') - 1];
	};
	this.talentEffects.ToxicResistance = function (character) {
		character.resistance.Toxic += gs.talents.ToxicResistance.resistance[character.getTalentLevel('ToxicResistance') - 1];
	};
	
	
	// MELEE:
	// ********************************************************************************************
	this.talentEffects.WeaponMastery = function (character) {
		for (let i = 0; i < character.getTalentLevel('WeaponMastery'); i += 1) {
			character.meleePower += gs.talents.WeaponMastery.bonus[i];
		}
	};
	
	this.talentEffects.Rage = function (character) {
		character.hasRage += 1;
	};
	
	this.talentEffects.WeaponShield = function (character) {
		if (character.inventory.getWeapon().type.attackEffect.skill === 'Melee') {
			character.bonusReflection += 2;
		}
	};
	
	this.talentEffects.BloodLust = function (character) {
		character.maxRage += character.getTalentLevel('BloodLust');
	};

	
	// RANGE:
	// ********************************************************************************************
	this.talentEffects.RangeMastery = function (character) {
		for (let i = 0; i < character.getTalentLevel('RangeMastery'); i += 1) {
			character.rangePower += gs.talents.RangeMastery.bonus[i];
		}
	};
	
	/*
	this.talentEffects.AmmoConservation = function (character) {
		character.bonusSaveAmmoChance += 0.1 * character.getTalentLevel('AmmoConservation');
	};
	*/
	
	this.talentEffects.StrongArm = function (character) {
		character.bonusProjectileRange += 1;
		character.rangePower += 2;
	};
	
	// STEALTH:
	// ********************************************************************************************
	this.talentEffects.StealthMastery = function (character) {
		for (let i = 0; i < character.getTalentLevel('StealthMastery'); i += 1) {
			character.stealth += gs.talents.StealthMastery.bonus[i];
		}
	};
	this.talentOnLearn.DungeonSense = function () {
		gs.revealDungeonSenese();
	};
	
	this.talentEffects.KeenHearing = function (character) {
		character.hasKeenHearing += 1;
	};
	
	this.talentOnLearn.KeenHearing = function () {
		gs.HUD.miniMap.refresh();
	};
	
	// RACIAL_TALENTS:
	// ********************************************************************************************
	this.talentEffects.StoneSkin = function (character) {
		for (let i = 0; i < character.getTalentLevel('StoneSkin'); i += 1) {
			character.protection += gs.talents.StoneSkin.bonus[i];
		}
	};
};

// GET_TALENT_DESCRIPTION:
// ************************************************************************************************
gs.getTalentDescription = function (talentName) {
	var talent = this.talents[talentName],
		str = '',
		baseLevel,
		upgrading;
	
	// Mastered:
	if (gs.pc.getTalentLevel(talentName) === talent.level.length) {
		str += '精通 ' + translator.getText(talentName) + '\n';
		baseLevel = gs.pc.getTalentLevel(talentName);
		upgrading = false;
	}
	// Upgrading:
	else if (gs.pc.getTalentLevel(talentName)) {
		baseLevel = gs.pc.getTalentLevel(talentName);
		
		str += '学习 ' + translator.getText(talentName) + (baseLevel + 1) + '\n';
		
		upgrading = true;
	}
	// Learning for first time:
	else {
		str += '学习 ' + translator.getText(talentName) + '\n';
		baseLevel = 1;
		upgrading = false;
	}
	
	// Required Level:
	if (gs.pc.getTalentLevel(talentName) < talent.level.length) {
		str += '学习需求等级: ' + talent.level[gs.pc.getTalentLevel(talentName)] + '\n';
	}
	
	
	
	// Ability Description:
	if (talent.ability) {
		// Sustained:
		if (talent.ability.isSustained) {
			str += '持续效果' + '\n';
		}
		
		// Mana:
		if (talent.ability.mana) {
			str += '消耗法力值: ' + talent.ability.mana + '\n';
		}
		
		// Hit Point Cost:
		if (talent.ability.hitPointCost) {
			str += '消耗生命值: ' + talent.ability.hitPointCost + '\n';
		}
		
		// Cool Down:
		if (talent.ability.coolDown) {
			str += '冷却回合: ' + talent.ability.coolDown + '\n';
		}
		
		// Attributes:
		if (talent.ability.attributes) {
			this.forEachType(talent.ability.attributes, function (attribute) {
				str += translator.getText(attribute.name) + ': ';
				
				if (upgrading && attribute.base[baseLevel] !== attribute.base[baseLevel + 1]) {
					str += attribute.base[baseLevel] + ' -> ' + attribute.base[baseLevel + 1] + '\n';
				}
				else {
					str += attribute.base[baseLevel] + '\n';
				}	
			}, this);
		}
	}
	
	// Talent Description:
	if (talent.desc && typeof talent.desc === 'string') {
		str += talent.desc;
	}
	else if (talent.desc && typeof talent.desc === 'function') {
		str += talent.desc(gs.pc.getTalentLevel(talentName) + 1);
	}
	
	return str;
};

// GET_BOOK_TALENTS:
// Returns a list of talent names to be placed in a skill book
// ************************************************************************************************
gs.getBookTalents = function (skillName) {
	var list, newList, oldList, returnList;
	
	list = this.talentList.filter(talent => talent.skillName === skillName && !talent.neverDrop);
	list = list.map(talent => talent.name);
	
	// newList contains only talents the player does not have:
	newList = list.filter(talentName => !gs.pc.hasAvailableTalent(talentName));
	oldList = list.filter(talentName => gs.pc.hasAvailableTalent(talentName));
	
	// Return only new talents:
	if (newList.length >= TALENTS_PER_BOOK) {
		return gs.randSubset(newList, Math.min(newList.length, TALENTS_PER_BOOK));
	}
	// Return only repeat talents:
	else if (newList.length === 0) {
		return gs.randSubset(oldList, Math.min(oldList.length, TALENTS_PER_BOOK));
	}
	// Return a mix:
	else {
		return newList.concat(gs.randSubset(oldList, Math.min(oldList.length, TALENTS_PER_BOOK - newList.length)));
	}
};

// COUNT_PLAYER_ABILITIES:
// ************************************************************************************************
gs.countPlayerAbilities = function () {
	var key, count = 0;
	
	for (key in this.talents) {
		if (this.talents.hasOwnProperty(key)) {
			if (this.talents[key].ability) {
				count += 1;
			}
		}
	}
	
	return count;
};

/*
	// FIRE_MAGIC:
	this.talents.FireArrow = 		{level: 1};
	this.talents.FireBolt = 		{level: 6};
	this.talents.SummonOil = 		{level: 6};
	this.talents.FireArrow.desc = 'Shoots a flaming projectile which damages monsters and sets fire to flammable objects.';
	this.talents.SummonOil.desc = 'Summons a patch of flammable oil.';
	this.talents.FireBolt.desc = 'Sends forth a bolt of fire, hitting multiple monsters in a straight line.';

	// STORM_MAGIC:
	this.talents.Spark = 			{level: 1, skillName: 'StormMagic'};
	this.talents.Spark.desc = 'Shoots a spark of electricity which damages monsters and spreads across water.';
	
	// ICE_MAGIC:
	this.talents.IceArrow =			{level: 1, skillName: 'IceMagic'};
	this.talents.ColdResistance = 	{level: 1, skillName: 'IceMagic'};
	this.talents.Freeze = 			{level: 6, skillName: 'IceMagic'};
	this.talents.FreezingWind = 	{level: 12, skillName: 'IceMagic'};
	this.talents.IceArrow.desc = 		'Shoots a freezing projectile which damages monsters and reduces their movement speed.';
	this.talents.ColdResistance.desc = 	'+10% Cold Defense';
	this.talents.Freeze.desc = 			'Freezes a single monster in a block of ice rendering them unable to move or attack';
	this.talents.FreezingWind.desc = 	'Blasts all nearby monsters with a freezing wind, damaging them and knocking them back.';
	
	// FORTITUDE:
	this.talents.Shroomology = {level: 1, skillName: 'Fortitude'};
	this.talents.Shroomology.desc = '+5HP from healing mushrooms.';
	
	// HEAVY_HANDS:
	this.talents.HeavyHands = {};
	this.talents.HeavyHands.effect = function (character) {
		character.bonusMeleeCritChance += 0.05;
	};
	this.talents.HeavyHands.level = 2;
	this.talents.HeavyHands.skillName = 'Melee';
	this.talents.HeavyHands.desc = '+5% chance to strike a critical blow in melee combat.';
	
	// CLEAVE:
	this.talents.Cleave = {};
	this.talents.Cleave.ability = this.abilityTypes.Cleave;
	this.talents.Cleave.level = 8;
	this.talents.Cleave.skillName = 'Melee';
	this.talents.Cleave.desc = 'Hits every enemy around you for critical damage and knockback.';
	
	
*/