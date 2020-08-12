/*global game, gs, console, Phaser*/
/*global SHROOM_HP, SHROOM_EP, MAX_ENCHANTMENT*/
/*jshint white: true, laxbreak: true */
'use strict';

// CREATE_ITEM_TYPES:
// ************************************************************************************************
gs.createItemTypes = function () {
	var key,
		pct,
		LOW_ITEM_COST,
		MED_ITEM_COST,
		HIGH_ITEM_COST;

	this.createWeaponEffects();
	this.createItemEffects();
	
	// ITEM_TYPES:
	// ********************************************************************************************
	this.itemTypes = {
		// MISC_WEAPONS:
		Fists: 				{f: 0, slot: 'weapon', hands: 1, attackEffect: 'Melee', range: 1.5},
		MobFucker: 			{f: 0, slot: 'weapon', hands: 1, attackEffect: 'MobFucker', range: 1000},
		FlamingHands:		{f: 0, slot: 'weapon', hands: 1, attackEffect: 'MagicStaff', projectileName: 'FireArrow', range: 5.5},
		
		// MELEE_WEAPONS:
		Staff:				{f: 0, slot: 'weapon', hands: 1, attackEffect: 'Melee', range: 1.5},
		ShortSword:			{f: 1, slot: 'weapon', hands: 1, attackEffect: 'Melee', range: 1.5},
		LongSword: 			{f: 2, slot: 'weapon', hands: 1, attackEffect: 'Melee', range: 1.5},
		Spear: 				{f: 3, slot: 'weapon', hands: 1, attackEffect: 'PoleArm', range: 2.0},
		HandAxe:			{f: 4, slot: 'weapon', hands: 1, attackEffect: 'Cleave', range: 1.5},
        TwoHandSword: 		{f: 5, slot: 'weapon', hands: 2, attackEffect: 'Melee', range: 1.5},
		Halberd:			{f: 6, slot: 'weapon', hands: 2, attackEffect: 'PoleArm', range: 2.0},
		BattleAxe: 			{f: 7, slot: 'weapon', hands: 2, attackEffect: 'Cleave', range: 1.5},
		ShortBow:			{f: 8, slot: 'weapon', hands: 2, attackEffect: 'SingleProjectile', projectileName: 'Dart', range: 7.0, noAmmo: true},
		LongBow:			{f: 9, slot: 'weapon', hands: 2, attackEffect: 'SingleProjectile', projectileName: 'Dart', range: 7.0, noAmmo: true},
		Sling:				{f: 10, slot: 'weapon', hands: 1, attackEffect: 'SingleProjectile', projectileName: 'Stone', range: 7.0, noAmmo: true},
		Mace:				{f: 11, slot: 'weapon', hands: 1, attackEffect: 'Melee', knockBack: 1, range: 1.5},
		WarHammer:			{f: 12, slot: 'weapon', hands: 2, attackEffect: 'Melee', knockBack: 1, range: 1.5},
		BroadAxe:			{f: 13, slot: 'weapon', hands: 1, attackEffect: 'Cleave', range: 1.5},
		Rapier:				{f: 14, slot: 'weapon', hands: 1, attackEffect: 'Lunge', range: 1.5},
		
		// MAGIC_MELEE_WEAPONS:
		InfernoSword:		{f: 16, slot: 'weapon', hands: 1, attackEffect: 'Flame', range: 1.5},
		StormChopper:		{f: 17, slot: 'weapon', hands: 1, attackEffect: 'StormChopper', range: 1.5},
		PoisonDagger:		{f: 18, slot: 'weapon', hands: 1, attackEffect: 'PoisonDagger', range: 1.5},
		
		
		// MAGIC_STAVES:
		GreaterStaffOfFire:		{f: 32, slot: 'weapon', hands: 1, attackEffect: 'MagicStaff', projectileName: 'FireArrow', range: 5.5, shootEffect: 'FireShoot'},
		GreaterStaffOfStorms:	{f: 33, slot: 'weapon', hands: 1, attackEffect: 'MagicStaff', projectileName: 'SparkBall', range: 5.5, shootEffect: 'ElectricShoot'},
		GreaterStaffOfIce:		{f: 34, slot: 'weapon', hands: 1, attackEffect: 'MagicStaff', projectileName: 'IceArrow', range: 5.5, shootEffect: 'ColdShoot'},
		GreaterStaffOfPoison:	{f: 35, slot: 'weapon', hands: 1, attackEffect: 'MagicStaff', projectileName: 'StrongPoisonArrow', range: 5.5, shootEffect: 'ToxicShoot'},
		StaffOfEnergy:			{f: 36, slot: 'weapon', hands: 1, attackEffect: 'MagicStaff', projectileName: 'MagicMissile', range: 5.5, shootEffect: 'MagicShoot'},
		StaffOfPower:			{f: 38, slot: 'weapon', hands: 1, attackEffect: 'MagicStaff', projectileName: 'MagicMissile', range: 5.5, shootEffect: 'MagicShoot'},
		
		// LESSER_STAVES:
		StaffOfFire:			{f: 40, slot: 'weapon', hands: 1, attackEffect: 'MagicStaff', projectileName: 'FireArrow', range: 5.5, shootEffect: 'FireShoot'},
		StaffOfStorms:			{f: 41, slot: 'weapon', hands: 1, attackEffect: 'MagicStaff', projectileName: 'Spark', range: 5.5, shootEffect: 'ElectricShoot'},
		StaffOfIce:				{f: 42, slot: 'weapon', hands: 1, attackEffect: 'MagicStaff', projectileName: 'IceArrow', range: 5.5, shootEffect: 'ColdShoot'},
		StaffOfPoison:			{f: 43, slot: 'weapon', hands: 1, attackEffect: 'MagicStaff', projectileName: 'StrongPoisonArrow', range: 5.5, shootEffect: 'ToxicShoot'},
		StaffOfMagicMissiles:	{f: 37, slot: 'weapon', hands: 1, attackEffect: 'MagicStaff', projectileName: 'MagicMissile', range: 5.5, shootEffect: 'MagicShoot'},

		
		// RANGED_WEAPONS:
		Dart:				{f: 48, slot: 'weapon', hands: 1, attackEffect: 'SingleProjectile', projectileName: 'Dart', range: 7.0, dropAmount: 12, stackable: true},
		Javelin:			{f: 49, slot: 'weapon', hands: 1, attackEffect: 'SingleProjectile', projectileName: 'Dart', range: 7.0, dropAmount: 6, stackable: true},
		ThrowingNet:		{f: 50, slot: 'weapon', hands: 1, attackEffect: 'SingleProjectile', projectileName: 'Net', range: 7.0, cantEnchant: true, dropAmount: 6, stackable: true},
		Bomb:				{f: 51, slot: 'weapon', hands: 1, attackEffect: 'SingleProjectile', projectileName: 'PlayerBomb', range: 7.0, cantEnchant: true, dropAmount: 6, stackable: true},
        Chakram:            {f: 52, slot: 'weapon', hands: 1, attackEffect: 'SingleProjectile', projectileName: 'Chakram', range: 7.0, dropAmount: 6, stackable: true},
		
		// SHIELDS:
		WoodenShield:			{f: 64, slot: 'shield'},
		MetalShield:			{f: 65, slot: 'shield'},
		ShieldOfReflection:		{f: 66, slot: 'shield'},
		OrbOfMana:				{f: 67, slot: 'shield'},
		RedDragonScaleShield:	{f: 68, slot: 'shield'},
		GreenDragonScaleShield:	{f: 69, slot: 'shield'},
		BlueDragonScaleShield:	{f: 70, slot: 'shield'},
		WhiteDragonScaleShield:	{f: 71, slot: 'shield'},
		OrbOfPower:				{f: 72, slot: 'shield'},
		SpikyShield:			{f: 73, slot: 'shield'},
		
		// ARMOR (BODY):
		Robe:					{f: 80, slot: 'body'},
		LeatherArmor: 			{f: 81, slot: 'body'},
		PlateArmor: 			{f: 82, slot: 'body'},
		RobeOfWizardry:			{f: 83, slot: 'body'},
		CloakOfStealth:			{f: 84, slot: 'body'},
		RedDragonScaleArmor:	{f: 85, slot: 'body'},
		GreenDragonScaleArmor:	{f: 86, slot: 'body'},
		BlueDragonScaleArmor:	{f: 87, slot: 'body'},
		WhiteDragonScaleArmor:	{f: 88, slot: 'body'},
		CrystalArmor:			{f: 89, slot: 'body'},
		RobeOfFlames:			{f: 90, slot: 'body'},
		RobeOfStorms:			{f: 91, slot: 'body'},
		RobeOfIce:				{f: 92, slot: 'body'},
		RobeOfDeath:			{f: 93, slot: 'body'},
		
		// HELMETS (HEAD):
		Hat:					{f: 96, slot: 'head'},
		LeatherHelm:			{f: 97, slot: 'head'},
		PlateHelm:				{f: 98, slot: 'head'},
		HelmOfTelepathy:		{f: 99, slot: 'head', cantEnchant: true},
		CircletOfKnowledge:		{f: 100, slot: 'head'},
		ArcheryGoggles: 		{f: 101, slot: 'head'},
		
		// GLOVES (HANDS):
		ClothGloves:			{f: 112, slot: 'hands'},
		LeatherGloves: 			{f: 113, slot: 'hands'},
		PlateGloves: 			{f: 114, slot: 'hands'},
		GauntletsOfStrength:	{f: 115, slot: 'hands'},
		GlovesOfVampirism:		{f: 116, slot: 'hands', maxMod: 3},
		
		// BOOTS (FEET):
		Shoes:					{f: 128, slot: 'feet'},
		LeatherBoots: 			{f: 129, slot: 'feet'},
		PlateBoots: 			{f: 130, slot: 'feet'},
		BootsOfStealth: 		{f: 133, slot: 'feet'},
		BootsOfFlight:			{f: 131, slot: 'feet', cantEnchant: true},
		BootsOfSpeed: 			{f: 132, slot: 'feet', cantEnchant: true},
		
		// COMMON RINGS:
		RingOfFire: 			{f: 144, slot: 'ring'},
		RingOfToxic:			{f: 145, slot: 'ring'},
		RingOfStorm:			{f: 146, slot: 'ring'},
		RingOfIce:				{f: 147, slot: 'ring'},
		RingOfSustenance: 		{f: 148, slot: 'ring'},
		RingOfStealth:			{f: 149, slot: 'ring'},
		RingOfHealth:			{f: 150, slot: 'ring'},
		RingOfMana:				{f: 151, slot: 'ring'},
		RingOfProtection:		{f: 152, slot: 'ring'},
		RingOfEvasion:			{f: 153, slot: 'ring'},
		RingOfStrength:			{f: 154, slot: 'ring'},
		RingOfIntelligence:		{f: 155, slot: 'ring'},
		RingOfDexterity:		{f: 156, slot: 'ring'},
		
		// UNCOMMON RINGS:
		RingOfFlight:			{f: 160, slot: 'ring', cantEnchant: true},
		RingOfWizardry:			{f: 161, slot: 'ring'},
		RingOfTheVampire:		{f: 162, slot: 'ring', baseMod: 1, maxMod: 3},
		RingOfLearning: 		{f: 163, slot: 'ring', cantEnchant: true},
		
		// RARE_RINGS:
		InfernoRing:			{f: 176, slot: 'ring', cantEnchant: true},
		RingOfThunder:			{f: 177, slot: 'ring', cantEnchant: true},
		RingOfReflection:		{f: 178, slot: 'ring'},
		RingOfLifeSaving:		{f: 179, slot: 'ring', cantEnchant: true},
		RingOfSpeed:			{f: 180, slot: 'ring', cantEnchant: true},
		RingOfWealth:			{f: 181, slot: 'ring', cantEnchant: true},
		
		// CHARMS:
		CharmOfEnergy:			{f: 272, slot: 'charm', useEffect: 'Energy', 			chargeTime: 250, baseMod: 1, maxMod: 3},
		CharmOfHealing:			{f: 273, slot: 'charm', useEffect: 'Healing', 			chargeTime: 250, baseMod: 1, maxMod: 3},
		CharmOfFire:			{f: 274, slot: 'charm', useEffect: 'BurstOfFlame', 		chargeTime: 150, baseMod: 1, maxMod: 3},
		CharmOfLightning:		{f: 275, slot: 'charm', useEffect: 'Shock', 			chargeTime: 150, baseMod: 1, maxMod: 3},
		CharmOfDisease:			{f: 276, slot: 'charm', useEffect: 'InfectiousDisease', chargeTime: 150, baseMod: 1, maxMod: 3},
		CharmOfFreezing:		{f: 277, slot: 'charm', useEffect: 'Freeze', 			chargeTime: 150, baseMod: 1, maxMod: 3},
		//CharmOfBlinking:		{f: 278, slot: 'charm', useEffect: 'Blink', 			chargeTime: 250, baseMod: 1, maxMod: 3},
		CharmOfConfusion:		{f: 279, slot: 'charm', useEffect: 'Confusion',	 		chargeTime: 250, baseMod: 1, maxMod: 3},
		CharmOfSwiftness:		{f: 282, slot: 'charm', useEffect: 'Sprint',			chargeTime: 250, baseMod: 1, maxMod: 3},
		CharmOfClarity:			{f: 280, slot: 'charm', maxMod: 3},
		CharmOfRegeneration:	{f: 281, slot: 'charm', maxMod: 3},
		
		
		// WANDS:
		WandOfFire:				{f: 288, slot: 'consumable', useEffect: 'FireBall', stackable: false, sound: gs.sounds.jewlery},
		WandOfLightning:		{f: 289, slot: 'consumable', useEffect: 'LightningBolt', stackable: false, sound: gs.sounds.jewlery},
		WandOfCold:				{f: 290, slot: 'consumable', useEffect: 'ConeOfCold', stackable: false, sound: gs.sounds.jewlery},
		WandOfDraining:			{f: 291, slot: 'consumable', useEffect: 'LifeDrain', stackable: false, sound: gs.sounds.jewlery},
		WandOfConfusion:		{f: 292, slot: 'consumable', useEffect: 'Confusion', stackable: false, sound: gs.sounds.jewlery},
		WandOfBlades:			{f: 293, slot: 'consumable', useEffect: 'SummonBlades', stackable: false, sound: gs.sounds.jewlery},
		WandOfBlinking:			{f: 294, slot: 'consumable', useEffect: 'Blink', stackable: false, sound: gs.sounds.jewlery},
		
		// CONSUMABLES:
		PotionOfHealing:		{f: 192, slot: 'consumable', useEffect: 'PotionOfHealing', edible: true},
		PotionOfEnergy:			{f: 193, slot: 'consumable', useEffect: 'PotionOfEnergy', edible: true},
		PotionOfExperience:		{f: 194, slot: 'consumable', useEffect: 'PotionOfExperience', edible: true},
		PotionOfResistance: 	{f: 195, slot: 'consumable', useEffect: 'PotionOfResistance', edible: true},
		PotionOfPower:			{f: 196, slot: 'consumable', useEffect: 'PotionOfPower', edible: true},
		PotionOfLevitation:		{f: 197, slot: 'consumable', statusEffectName: 'Levitation', edible: true},
		PotionOfGainAttribute:	{f: 198, slot: 'consumable', useEffect: 'PotionOfGainAttribute', edible: true},
		
		// MISC_CONSUMABLES:
		Meat:					{f: 224, slot: 'consumable', useEffect: 'Eat', sound: gs.sounds.food, edible: true},
		HealingShroom:			{f: 225, slot: 'consumable', useEffect: 'HealingShroom', sound: gs.sounds.food, edible: true},
		EnergyShroom:			{f: 226, slot: 'consumable', useEffect: 'EnergyShroom', sound: gs.sounds.food, edible: true},
		EnergyShroomTea:		{f: 227, slot: 'consumable', statusEffectName: 'EnergyShroomTea', edible: true},

		// TRAPS:
		FireShroom:				{f: 352, slot: 'consumable', useEffect: 'PlaceTrap'},
		BearTrap:				{f: 353, slot: 'consumable', useEffect: 'PlaceTrap'},
		FirePot:				{f: 354, slot: 'consumable', useEffect: 'PlaceTrap'},
		GasPot:					{f: 355, slot: 'consumable', useEffect: 'PlaceTrap'},
		
		
		// SCROLLS:
		ScrollOfTeleportation:	{f: 208, slot: 'consumable', useEffect: 'Teleportation', sound: gs.sounds.scroll},
		ScrollOfBlink:			{f: 209, slot: 'consumable', useEffect: 'Blink', sound: gs.sounds.scroll},
		ScrollOfFear:			{f: 210, slot: 'consumable', useEffect: 'ScrollOfFear', sound: gs.sounds.scroll},
		ScrollOfEnchantment:	{f: 211, slot: 'consumable', useEffect: 'ScrollOfEnchantment', sound: gs.sounds.scroll},
		ScrollOfAcquirement:	{f: 212, slot: 'consumable', useEffect: 'ScrollOfAcquirement', sound: gs.sounds.scroll},
		ScrollOfHellFire:		{f: 213, slot: 'consumable', useEffect: 'HellFire', sound: gs.sounds.scroll},
		ScrollOfDomination:		{f: 214, slot: 'consumable', useEffect: 'Domination', sound: gs.sounds.scroll},
		
		// TALENT_BOOKS:
		TomeOfInferno:		{f: 256, slot: 'book', skillName: 'FireMagic'},
		TomeOfStorms:		{f: 257, slot: 'book', skillName: 'StormMagic'},
		TomeOfIce:			{f: 258, slot: 'book', skillName: 'ColdMagic'},
		TomeOfDeath:		{f: 259, slot: 'book', skillName: 'Necromancy'},
		TomeOfStealth:		{f: 260, slot: 'book', skillName: 'Stealth'},
		TomeOfDefense:		{f: 261, slot: 'book', skillName: 'Defense'},
		TomeOfWar:			{f: 262, slot: 'book', skillName: 'Melee'},
		TomeOfArchery:		{f: 263, slot: 'book', skillName: 'Range'},
		TomeOfAthletics:	{f: 264, slot: 'book', skillName: 'Athletics'},
		TomeOfPower:		{f: 265, slot: 'book', skillName: 'Focus'},
		TomeOfEnchantment:	{f: 265, slot: 'book', skillName: 'Enchantment'},
		
		// MISC:
		GoldCoin:			{f: 240, slot: 'none'},
		Key:				{f: 242, slot: 'none'},
		GobletOfYendor:		{f: 243, slot: 'none'},
		
	};
	this.nameTypes(this.itemTypes);
	
	
	// ITEM_ANIMS:
	// ********************************************************************************************
	this.itemTypes.GoldCoin.anim = [240, 241];

	this.setItemDescriptions();
	
	// ITEM_STATS:
	// ********************************************************************************************
	this.itemTypes.Fists.stats =					{damage: 1};
	this.itemTypes.MobFucker.stats =				{damage: 200};
	this.itemTypes.FlamingHands.stats =				{damage: 5};
	
	// MELEE_WEAPONS:
	this.itemTypes.ShortSword.stats =				{parryChance: 0.20, damage: 4};
	this.itemTypes.LongSword.stats =				{parryChance: 0.20, damage: 6};
	this.itemTypes.TwoHandSword.stats = 			{parryChance: 0.20, damage: 8};
	this.itemTypes.Rapier.stats =					{parryChange: 0.20, damage: 4};
	
	this.itemTypes.Spear.stats =					{damage: 6};
	this.itemTypes.Halberd.stats =					{damage: 8};
	
	this.itemTypes.HandAxe.stats =					{damage: 4};
	this.itemTypes.BroadAxe.stats =					{damage: 6};
	this.itemTypes.BattleAxe.stats =				{damage: 8};
	
	this.itemTypes.Mace.stats =						{damage: 8};
	this.itemTypes.WarHammer.stats =				{damage: 10};
	
	this.itemTypes.Sling.stats = 					{damage: 3};
	this.itemTypes.ShortBow.stats =					{damage: 3};
	this.itemTypes.LongBow.stats =					{damage: 5};
	
	this.itemTypes.Staff.stats =					{damage: 4};
	
	
	// MAGIC_MELEE_WEAPONS:
	this.itemTypes.InfernoSword.stats =				{damage: 10, parryChance: 0.20};
	this.itemTypes.StormChopper.stats =				{damage: 8};
	this.itemTypes.PoisonDagger.stats = 			{damage: 3};
	
	// LESSER_STAVES:
	this.itemTypes.StaffOfMagicMissiles.stats =		{damage: 3};
	this.itemTypes.StaffOfFire.stats =		{damage: 4};
	this.itemTypes.StaffOfStorms.stats =		{damage: 3};
	this.itemTypes.StaffOfIce.stats =			{damage: 3};
	this.itemTypes.StaffOfPoison.stats =		{damage: 2};
	
	// STAVES:
	this.itemTypes.GreaterStaffOfFire.stats =				{damage: 5, firePower: 2};
	this.itemTypes.GreaterStaffOfStorms.stats =			{damage: 3, stormPower: 2};
	this.itemTypes.GreaterStaffOfIce.stats =				{damage: 3, coldPower: 2};
	this.itemTypes.GreaterStaffOfPoison.stats =			{damage: 3, toxicPower: 2};
	this.itemTypes.StaffOfEnergy.stats =			{damage: 3, bonusMaxMp: 5};
	this.itemTypes.StaffOfPower.stats =				{damage: 3, spellPower: 4};
	
	// RANGE_WEAPONS:
	this.itemTypes.Dart.stats =						{damage: 6};
	this.itemTypes.Javelin.stats =					{damage: 12};
	this.itemTypes.ThrowingNet.stats =				{damage: 0};
	this.itemTypes.Bomb.stats =						{damage: 24};
    this.itemTypes.Chakram.stats =					{damage: 16};
	
	// SHIELDS:
	this.itemTypes.WoodenShield.stats =				{protection: 2, blockChance: 0.20};
	this.itemTypes.MetalShield.stats =				{protection: 4, blockChance: 0.20, spellPowerModifier: -0.25, stealthModifier: -0.20};
	this.itemTypes.ShieldOfReflection.stats =		{protection: 2, blockChance: 0.20, bonusReflection: 5};
	this.itemTypes.OrbOfMana.stats =				{bonusMaxMp: 3};
	this.itemTypes.RedDragonScaleShield.stats =		{protection: 4, blockChance: 0.20, fireResistance: 1, spellPowerModifier: -0.25, stealthModifier: -0.20};
	this.itemTypes.GreenDragonScaleShield.stats =	{protection: 4, blockChance: 0.20, toxicResistance: 1, spellPowerModifier: -0.25, stealthModifier: -0.20};
	this.itemTypes.BlueDragonScaleShield.stats =	{protection: 4, blockChance: 0.20, shockResistance: 1, spellPowerModifier: -0.25, stealthModifier: -0.20};
	this.itemTypes.WhiteDragonScaleShield.stats =	{protection: 4, blockChance: 0.20, coldResistance: 1, spellPowerModifier: -0.25, stealthModifier: -0.20};
	this.itemTypes.OrbOfPower.stats =				{spellPower: 5};
	this.itemTypes.SpikyShield.stats =				{protection: 2, blockChance: 0.20, bonusDamageShield: 3};
		
	// ARMOR (BODY):
	this.itemTypes.Robe.stats =						{bonusMaxMp: 5};
	this.itemTypes.LeatherArmor.stats =				{protection: 3};
	this.itemTypes.PlateArmor.stats =				{protection: 5, spellPowerModifier: -0.20, stealthModifier: -0.20};
	this.itemTypes.RedDragonScaleArmor.stats =		{protection: 5, fireResistance: 1, spellPowerModifier: -0.20, stealthModifier: -0.20};
	this.itemTypes.GreenDragonScaleArmor.stats =	{protection: 5, toxicResistance: 1, spellPowerModifier: -0.20, stealthModifier: -0.20};
	this.itemTypes.BlueDragonScaleArmor.stats =		{protection: 5, shockResistance: 1, spellPowerModifier: -0.20, stealthModifier: -0.20};
	this.itemTypes.WhiteDragonScaleArmor.stats =	{protection: 5, coldResistance: 1, spellPowerModifier: -0.20, stealthModifier: -0.20};
	this.itemTypes.CrystalArmor.stats =				{protection: 5, bonusReflection: 5};
	this.itemTypes.CloakOfStealth.stats =			{stealth: 5};
	this.itemTypes.RobeOfWizardry.stats =			{spellPower: 5, bonusMaxMp: 3};
	this.itemTypes.RobeOfFlames.stats =				{bonusMaxMp: 3, fireResistance: 1};
	this.itemTypes.RobeOfStorms.stats =				{bonusMaxMp: 3, shockResistance: 1};
	this.itemTypes.RobeOfIce.stats =				{bonusMaxMp: 3, coldResistance: 1};
	this.itemTypes.RobeOfDeath.stats =				{bonusMaxMp: 3, toxicResistance: 1};
	
	// BOOTS (FEET):
	this.itemTypes.Shoes.stats =					{bonusMaxMp: 3};
	this.itemTypes.LeatherBoots.stats =				{protection: 1};
	this.itemTypes.PlateBoots.stats =				{protection: 2, spellPowerModifier: -0.10, stealthModifier: -0.10};
	this.itemTypes.BootsOfStealth.stats =			{stealth: 3};
	this.itemTypes.BootsOfSpeed.stats =				{bonusMovementSpeed: 1, maxHpModifier: -0.30};
	this.itemTypes.BootsOfFlight.stats =			{isFlying: 1, maxHpModifier: -0.30};
	
	// HELMETS (HEAD):
	this.itemTypes.Hat.stats =						{bonusMaxMp: 3};
	this.itemTypes.LeatherHelm.stats =				{protection: 1};
	this.itemTypes.PlateHelm.stats =				{protection: 2, spellPowerModifier: -0.10, stealthModifier: -0.10};
	this.itemTypes.CircletOfKnowledge.stats =		{spellPower: 5};
	this.itemTypes.ArcheryGoggles.stats =			{rangePower: 5};
	this.itemTypes.HelmOfTelepathy.stats =			{isTelepathic: 1};
	
	// GLOVES (HANDS):
	this.itemTypes.ClothGloves.stats =				{bonusMaxMp: 3};
	this.itemTypes.LeatherGloves.stats =			{protection: 1};
	this.itemTypes.PlateGloves.stats =				{protection: 2, spellPowerModifier: -0.10, stealthModifier: -0.10};
	this.itemTypes.GauntletsOfStrength.stats =		{strength: 5};
	this.itemTypes.GlovesOfVampirism.stats =		{meleeLifeTap: 1};
		
	// CHARMS:
	this.itemTypes.CharmOfFire.stats =				{maxCharges: 1};	
	this.itemTypes.CharmOfLightning.stats =			{maxCharges: 1};		
	this.itemTypes.CharmOfDisease.stats =			{maxCharges: 1};	
	this.itemTypes.CharmOfFreezing.stats =			{maxCharges: 1};
	//this.itemTypes.CharmOfBlinking.stats =			{maxCharges: 1};		
	this.itemTypes.CharmOfHealing.stats =			{maxCharges: 1};			
	this.itemTypes.CharmOfEnergy.stats =			{maxCharges: 1};			
	this.itemTypes.CharmOfConfusion.stats =			{maxCharges: 1};		
	this.itemTypes.CharmOfSwiftness.stats =			{maxCharges: 1};
	this.itemTypes.CharmOfRegeneration.stats =		{bonusHpRegenTime: 1};
	this.itemTypes.CharmOfClarity.stats =			{bonusMpRegenTime: 1};
	
	// WANDS:	
	this.itemTypes.WandOfFire.stats =				{maxCharges: 5};
	this.itemTypes.WandOfLightning.stats =			{maxCharges: 5};
	this.itemTypes.WandOfCold.stats =				{maxCharges: 5};
	this.itemTypes.WandOfDraining.stats =			{maxCharges: 5};
	this.itemTypes.WandOfConfusion.stats =			{maxCharges: 5};
	this.itemTypes.WandOfBlades.stats =				{maxCharges: 5};
	this.itemTypes.WandOfBlinking.stats =			{maxCharges: 3};

	// COMMON RINGS:
	this.itemTypes.RingOfFire.stats =				{fireResistance: 1, firePower: 4};
	this.itemTypes.RingOfStorm.stats =				{shockResistance: 1, stormPower: 4};
	this.itemTypes.RingOfToxic.stats =				{toxicResistance: 1, toxicPower: 4};
	this.itemTypes.RingOfIce.stats =				{coldResistance: 1, coldPower: 4};
	this.itemTypes.RingOfSustenance.stats =			{bonusMaxFood: 20};
	this.itemTypes.RingOfStealth.stats =			{stealth: 3};
	this.itemTypes.RingOfHealth.stats =				{bonusMaxHp: 10};
	this.itemTypes.RingOfMana.stats =				{bonusMaxMp: 5};
	this.itemTypes.RingOfProtection.stats =			{protection: 3};
	this.itemTypes.RingOfEvasion.stats =			{bonusEvasion: 5};
	this.itemTypes.RingOfStrength.stats =			{strength: 3};
	this.itemTypes.RingOfIntelligence.stats =		{intelligence: 3};
	this.itemTypes.RingOfDexterity.stats =			{dexterity: 3};
	
	// UNCOMMON RINGS:
	this.itemTypes.RingOfFlight.stats =				{isFlying: 1, maxHpModifier: -0.30};
	this.itemTypes.RingOfWizardry.stats =			{spellPower: 5};
	this.itemTypes.RingOfTheVampire.stats =			{meleeLifeTap: 1};
	this.itemTypes.RingOfLearning.stats =			{bonusExpMod: 0.5, maxHpModifier: -0.30};
	
	// RARE_RINGS:
	this.itemTypes.RingOfLifeSaving.stats =			{hasLifeSaving: 1};
	this.itemTypes.InfernoRing.stats =				{fireResistance: 1, firePower: 4, hasInferno: 1};
	this.itemTypes.RingOfThunder.stats =			{shockResistance: 1, stormPower: 4, hasThunder: 1};
	this.itemTypes.RingOfReflection.stats =			{bonusReflection: 3};
	this.itemTypes.RingOfSpeed.stats =				{bonusMovementSpeed: 1, maxHpModifier: -0.30};
	this.itemTypes.RingOfWealth.stats =				{bonusGoldMod: 1.0, maxHpModifier: -0.30};
	
	
	
	// ITEM_COST:
	// ********************************************************************************************
	LOW_ITEM_COST = 40;
	MED_ITEM_COST = 80;
	HIGH_ITEM_COST = 120;
	
	
	// MELEE_WEAPONS:
	this.itemTypes.ShortSword.cost = LOW_ITEM_COST;
	this.itemTypes.Staff.cost = LOW_ITEM_COST;
	this.itemTypes.HandAxe.cost = LOW_ITEM_COST;
	this.itemTypes.ShortBow.cost = LOW_ITEM_COST;
	this.itemTypes.StaffOfFire.cost = LOW_ITEM_COST;
	this.itemTypes.StaffOfStorms.cost = LOW_ITEM_COST;
	this.itemTypes.StaffOfIce.cost = LOW_ITEM_COST;
	this.itemTypes.StaffOfPoison.cost = LOW_ITEM_COST;
	
	this.itemTypes.LongSword.cost = MED_ITEM_COST;
	this.itemTypes.TwoHandSword.cost = MED_ITEM_COST;
	this.itemTypes.Rapier.cost = MED_ITEM_COST;
	this.itemTypes.Spear.cost = MED_ITEM_COST;
	this.itemTypes.Halberd.cost = MED_ITEM_COST;
	this.itemTypes.BattleAxe.cost = MED_ITEM_COST;
	this.itemTypes.Mace.cost = MED_ITEM_COST;
	this.itemTypes.WarHammer.cost = MED_ITEM_COST;
	this.itemTypes.Sling.cost = MED_ITEM_COST;
	this.itemTypes.LongBow.cost = MED_ITEM_COST;
	this.itemTypes.BroadAxe.cost = MED_ITEM_COST;
	this.itemTypes.PoisonDagger.cost = MED_ITEM_COST;
	this.itemTypes.StormChopper.cost = HIGH_ITEM_COST;
	this.itemTypes.InfernoSword.cost = HIGH_ITEM_COST;
	this.itemTypes.GreaterStaffOfFire.cost = MED_ITEM_COST;
	this.itemTypes.GreaterStaffOfStorms.cost = MED_ITEM_COST;
	this.itemTypes.GreaterStaffOfIce.cost = MED_ITEM_COST;
	this.itemTypes.GreaterStaffOfPoison.cost = MED_ITEM_COST;
	this.itemTypes.StaffOfEnergy.cost = MED_ITEM_COST;
	this.itemTypes.StaffOfMagicMissiles.cost = MED_ITEM_COST;
	this.itemTypes.StaffOfPower.cost = MED_ITEM_COST;
	
	
	// RANGE_WEAPONS:
	this.itemTypes.Dart.cost = 1;
	this.itemTypes.Javelin.cost = 2;
	this.itemTypes.ThrowingNet.cost = 5;
	this.itemTypes.Bomb.cost = 5;
	this.itemTypes.Chakram.cost = 5;
	
	// SHIELDS:
	this.itemTypes.WoodenShield.cost = LOW_ITEM_COST;
	this.itemTypes.MetalShield.cost = LOW_ITEM_COST;
	this.itemTypes.ShieldOfReflection.cost = HIGH_ITEM_COST;
	this.itemTypes.OrbOfMana.cost = HIGH_ITEM_COST;
	this.itemTypes.RedDragonScaleShield.cost = HIGH_ITEM_COST;
	this.itemTypes.GreenDragonScaleShield.cost = HIGH_ITEM_COST;
	this.itemTypes.BlueDragonScaleShield.cost = HIGH_ITEM_COST;
	this.itemTypes.WhiteDragonScaleShield.cost = HIGH_ITEM_COST;
	this.itemTypes.OrbOfPower.cost = HIGH_ITEM_COST;
	this.itemTypes.SpikyShield.cost = HIGH_ITEM_COST;
	
	// ARMOR (BODY):
	this.itemTypes.Robe.cost = LOW_ITEM_COST;
	this.itemTypes.LeatherArmor.cost = LOW_ITEM_COST;
	this.itemTypes.PlateArmor.cost = LOW_ITEM_COST;
	this.itemTypes.CloakOfStealth.cost = HIGH_ITEM_COST;
	this.itemTypes.RobeOfWizardry.cost = HIGH_ITEM_COST;
	this.itemTypes.RedDragonScaleArmor.cost = HIGH_ITEM_COST;
	this.itemTypes.GreenDragonScaleArmor.cost = HIGH_ITEM_COST;
	this.itemTypes.BlueDragonScaleArmor.cost = HIGH_ITEM_COST;
	this.itemTypes.WhiteDragonScaleArmor.cost = HIGH_ITEM_COST;
	this.itemTypes.CrystalArmor.cost = HIGH_ITEM_COST;
	this.itemTypes.RobeOfFlames.cost = HIGH_ITEM_COST;
	this.itemTypes.RobeOfStorms.cost = HIGH_ITEM_COST;
	this.itemTypes.RobeOfIce.cost = HIGH_ITEM_COST;
	this.itemTypes.RobeOfDeath.cost = HIGH_ITEM_COST;
	
	// BOOTS (FEET):
	this.itemTypes.Shoes.cost = LOW_ITEM_COST;
	this.itemTypes.LeatherBoots.cost = LOW_ITEM_COST;
	this.itemTypes.PlateBoots.cost = LOW_ITEM_COST;
	this.itemTypes.BootsOfStealth.cost = HIGH_ITEM_COST;
	this.itemTypes.BootsOfSpeed.cost = HIGH_ITEM_COST;
	this.itemTypes.BootsOfFlight.cost = HIGH_ITEM_COST;

	// HELMETS (HEAD):
	this.itemTypes.Hat.cost = LOW_ITEM_COST;
	this.itemTypes.LeatherHelm.cost = LOW_ITEM_COST;
	this.itemTypes.PlateHelm.cost = LOW_ITEM_COST;
	this.itemTypes.CircletOfKnowledge.cost = HIGH_ITEM_COST;
	this.itemTypes.ArcheryGoggles.cost = HIGH_ITEM_COST;
	this.itemTypes.HelmOfTelepathy.cost = HIGH_ITEM_COST;
	
	// GLOVES (HANDS):
	this.itemTypes.ClothGloves.cost = LOW_ITEM_COST;
	this.itemTypes.LeatherGloves.cost = LOW_ITEM_COST;
	this.itemTypes.PlateGloves.cost = LOW_ITEM_COST;
	this.itemTypes.GauntletsOfStrength.cost = HIGH_ITEM_COST;
	this.itemTypes.GlovesOfVampirism.cost = HIGH_ITEM_COST;
	
	// Traps:
	this.itemTypes.FireShroom.cost = 0;
	this.itemTypes.BearTrap.cost = 0;
	this.itemTypes.FirePot.cost = 0;
	this.itemTypes.GasPot.cost = 0;
	
	// COMMON RINGS:
	this.itemTypes.RingOfFire.cost = LOW_ITEM_COST;
	this.itemTypes.RingOfStorm.cost = LOW_ITEM_COST;
	this.itemTypes.RingOfToxic.cost = LOW_ITEM_COST;
	this.itemTypes.RingOfIce.cost = LOW_ITEM_COST;
	this.itemTypes.RingOfSustenance.cost = LOW_ITEM_COST;
	this.itemTypes.RingOfStealth.cost = LOW_ITEM_COST;
	this.itemTypes.RingOfHealth.cost = LOW_ITEM_COST;
	this.itemTypes.RingOfMana.cost = LOW_ITEM_COST;
	this.itemTypes.RingOfProtection.cost = LOW_ITEM_COST;
	this.itemTypes.RingOfEvasion.cost = LOW_ITEM_COST;
	this.itemTypes.RingOfStrength.cost = LOW_ITEM_COST;
	this.itemTypes.RingOfIntelligence.cost = LOW_ITEM_COST;
	this.itemTypes.RingOfDexterity.cost = LOW_ITEM_COST;
	
	// UNCOMMON RINGS:
	this.itemTypes.RingOfFlight.cost = MED_ITEM_COST;
	this.itemTypes.RingOfWizardry.cost = MED_ITEM_COST;
	this.itemTypes.RingOfTheVampire.cost = MED_ITEM_COST;
	this.itemTypes.RingOfLearning.cost = MED_ITEM_COST;
	
	// RARE_RINGS:
	this.itemTypes.RingOfLifeSaving.cost = HIGH_ITEM_COST;
	this.itemTypes.InfernoRing.cost = HIGH_ITEM_COST;
	this.itemTypes.RingOfThunder.cost = HIGH_ITEM_COST;
	this.itemTypes.RingOfReflection.cost = HIGH_ITEM_COST;
	this.itemTypes.RingOfSpeed.cost = HIGH_ITEM_COST;
	this.itemTypes.RingOfWealth.cost = HIGH_ITEM_COST;
	
	// CHARMS:
	this.itemTypes.CharmOfFire.cost = MED_ITEM_COST;
	this.itemTypes.CharmOfLightning.cost = MED_ITEM_COST;
	this.itemTypes.CharmOfDisease.cost = MED_ITEM_COST;
	this.itemTypes.CharmOfFreezing.cost = MED_ITEM_COST;
	//this.itemTypes.CharmOfBlinking.cost = MED_ITEM_COST;
	this.itemTypes.CharmOfSwiftness.cost = MED_ITEM_COST;
	this.itemTypes.CharmOfHealing.cost = MED_ITEM_COST;
	this.itemTypes.CharmOfEnergy.cost = MED_ITEM_COST;
	this.itemTypes.CharmOfConfusion.cost = MED_ITEM_COST;
	this.itemTypes.CharmOfRegeneration.cost = MED_ITEM_COST;
	this.itemTypes.CharmOfClarity.cost = MED_ITEM_COST;
	
	// WANDS:
	this.itemTypes.WandOfFire.cost = MED_ITEM_COST;
	this.itemTypes.WandOfLightning.cost = MED_ITEM_COST;
	this.itemTypes.WandOfCold.cost = MED_ITEM_COST;
	this.itemTypes.WandOfDraining.cost = MED_ITEM_COST;
	this.itemTypes.WandOfConfusion.cost = MED_ITEM_COST;
	this.itemTypes.WandOfBlades.cost = MED_ITEM_COST;
	this.itemTypes.WandOfBlinking.cost = MED_ITEM_COST;
	
	// POTIONS:
	this.itemTypes.HealingShroom.cost = 1;
	this.itemTypes.EnergyShroom.cost = 1;
	this.itemTypes.Meat.cost = 30;
	this.itemTypes.PotionOfHealing.cost = 30;
	this.itemTypes.PotionOfEnergy.cost = 30;
	this.itemTypes.PotionOfExperience.cost = 30;
	this.itemTypes.PotionOfResistance.cost = 30;
	this.itemTypes.PotionOfLevitation.cost = 30;
	this.itemTypes.PotionOfGainAttribute.cost = 60;
	this.itemTypes.PotionOfPower.cost = 30;
	this.itemTypes.EnergyShroomTea.cost = 30;

	
	// SCROLLS:
	this.itemTypes.ScrollOfTeleportation.cost = 20;
	this.itemTypes.ScrollOfBlink.cost = 20;
	this.itemTypes.ScrollOfFear.cost = 30;
	this.itemTypes.ScrollOfHellFire.cost = 30;
	this.itemTypes.ScrollOfDomination.cost = 30;
	this.itemTypes.ScrollOfEnchantment.cost = 40;
	this.itemTypes.ScrollOfAcquirement.cost = 60;
	
	// TALENT_BOOKS:
	this.itemTypes.TomeOfInferno.cost = MED_ITEM_COST;
	this.itemTypes.TomeOfStorms.cost = MED_ITEM_COST;
	this.itemTypes.TomeOfIce.cost =	MED_ITEM_COST;
	this.itemTypes.TomeOfDeath.cost = MED_ITEM_COST;
	this.itemTypes.TomeOfStealth.cost = MED_ITEM_COST;
	this.itemTypes.TomeOfDefense.cost = MED_ITEM_COST;
	this.itemTypes.TomeOfWar.cost = MED_ITEM_COST;
	this.itemTypes.TomeOfArchery.cost = MED_ITEM_COST;
	this.itemTypes.TomeOfAthletics.cost = MED_ITEM_COST;
	this.itemTypes.TomeOfPower.cost = MED_ITEM_COST;
	this.itemTypes.TomeOfEnchantment.cost = MED_ITEM_COST;
	
	// MISC:
	this.itemTypes.GoldCoin.cost = 1;
	this.itemTypes.GobletOfYendor.cost = 1000;
	
	this.setItemTypeDefaultProperties();
};

// SET_ITEM_DESCRIPTIONS:
// ************************************************************************************************
gs.setItemDescriptions = function () {
	
	this.itemTypes.Meat.desc = "完全满足您的饥饿感。\n恢复一半的最大生命值和法力值。";
	this.itemTypes.HealingShroom.desc = "Heals " + SHROOM_HP + " hit points. Will also cure poison.";
	this.itemTypes.EnergyShroom.desc = "Restores " + SHROOM_EP + " mana points.";
	this.itemTypes.PotionOfHealing.desc = "Completely restores your HP and cures physical effects. Will raise your max HP by 4 if used at full health.";
	this.itemTypes.PotionOfEnergy.desc = "Completely restores your MP and cures mental effects. Will raise your max MP by 1 if used at full mana.";
	this.itemTypes.PotionOfExperience.desc = "Temporarily increases your rate of experience.";
	//this.itemTypes.PotionOfSpeed.desc = "Temporarily increases your movement speed.";
	this.itemTypes.PotionOfPower.desc = "Increases your melee, range and spell damage by 100% for 20 turns.";
	this.itemTypes.PotionOfPower.desc = "Increases your melee, range and spell damage by 100% for 20 turns.";
	this.itemTypes.PotionOfResistance.desc = "Completely restores your HP and cures physical effects. Increases your defense to all damage types for 50 turns.";
	this.itemTypes.PotionOfLevitation.desc = "Allows you to levitate for 50 turns.";
	this.itemTypes.PotionOfGainAttribute.desc = "Allows you to permenantly increase either strength, intelligence or dexterity";
	
	this.itemTypes.EnergyShroomTea.desc = "Regain 1MP every 5 turns for a total of 200 turns.";
	this.itemTypes.RingOfTheVampire.desc = "Heals 1 hit point every time you hit an enemy with a melee weapon.";
	this.itemTypes.RingOfFlight.desc = "Allows you to fly, avoiding all negative terrain effects.";
	this.itemTypes.RingOfLifeSaving.desc = "Grants you a one time resurrection upon death. The ring will be consumed in the process.";
	this.itemTypes.RingOfSpeed.desc = "Allows you to run at double normal movement speed.";
	this.itemTypes.RingOfWealth.desc = "You will pick up double gold.";
	this.itemTypes.InfernoRing.desc = "Burns anyone hitting you with melee.";
	this.itemTypes.RingOfThunder.desc = "Shocks anyone hitting you with melee.";
	
	this.itemTypes.BootsOfFlight.desc = "Allows you to fly, avoiding all negative terrain effects.";
	this.itemTypes.BootsOfSpeed.desc = "Allows you to run at double normal movement speed.";
	
	this.itemTypes.ScrollOfTeleportation.desc = "Immediately teleports you to a random location in the current level.";
	this.itemTypes.ScrollOfBlink.desc = "Allows you to immediately teleport to any visible tile.";
	this.itemTypes.ScrollOfFear.desc = "Fears all visible enemies, causing them to run away from you.";
	this.itemTypes.ScrollOfEnchantment.desc = "Allows you to enchant a piece of equipment.";
	this.itemTypes.ScrollOfAcquirement.desc = "Randomly summons an item. You can choose from weapons, armor, rings, scrolls, potions and food, but cannot select the exact item.";
	this.itemTypes.ScrollOfHellFire.desc = "Engulfs all visible enemies in hell fire.";
	this.itemTypes.ScrollOfDomination.desc = 'Allows you to permanently charm a creature, turning it to your side';
	
	// WANDS:
	this.itemTypes.WandOfBlades.desc = 'Summons a temporary swarm of spectral blades which will attack your enemies.';
	
	this.itemTypes.Key.desc = "允许您打开上锁的门";
    
    this.itemTypes.Chakram.desc = "Hits multiple enemies in a line";
	
	// CHARMS:
	this.itemTypes.CharmOfClarity.desc = 'Increases the rate at which you regenerate mana.';
	this.itemTypes.CharmOfRegeneration.desc = 'Increases the rate at which you regenerate hit points.';
	
	this.itemTypes.TwoHandSword.desc = 'A two handed weapon.';
    this.itemTypes.Mace.desc = 'Has a 25% chance to knock enemies back.';
	this.itemTypes.Rapier.desc = 'Will crit hit enemies when stepping towards them.';
    this.itemTypes.WarHammer.desc = 'A two handed weapon. Has a 25% chance to knock enemies back.';
	this.itemTypes.HandAxe.desc = 'Will cleave with every attack, hitting all adjacent enemies.';
	this.itemTypes.BattleAxe.desc = 'A two handed weapon. Will cleave with every attack, hitting all adjacent enemies.';
	this.itemTypes.BroadAxe.desc = 'Will cleave with every attack, hitting all adjacent enemies.';
	this.itemTypes.Spear.desc = 'Has an extra long reach, allowing you to hit enemies two tiles away.';
	this.itemTypes.Halberd.desc = 'A two handed weapon. Has an extra long reach, allowing you to hit enemies two tiles away.';
	//this.itemTypes.Staff.desc = 'Has an extra long reach, allowing you to hit enemies two tiles away.';
	this.itemTypes.GreaterStaffOfFire.desc = 'Damage is improved by increasing fire magic power.';
	this.itemTypes.GreaterStaffOfPoison.desc = 'Fires projectiles that will poison enemies. Damage is improved by increasing toxic magic power.';
	this.itemTypes.GreaterStaffOfStorms.desc = 'Damage is improved by increasing storm magic power.';
	this.itemTypes.GreaterStaffOfIce.desc = 'Fires freezing projectiles that will slow enemies. Power is improved by increasing ice magic power.';
	this.itemTypes.StormChopper.desc = 'Attacks all adjacent enemies with a powerful shocking attack.';
	this.itemTypes.InfernoSword.desc = 'Attacks with a powerful flaming attack. Gives a 20% chance to block incoming melee attacks.';	
	
	this.itemTypes.StaffOfFire.desc = 'Damage is improved by increasing fire magic power.';
	this.itemTypes.StaffOfPoison.desc = 'Fires projectiles that will poison enemies. Damage is improved by increasing toxic magic power.';
	this.itemTypes.StaffOfStorms.desc = 'Damage is improved by increasing storm magic power.';
	this.itemTypes.StaffOfIce.desc = 'Fires freezing projectiles that will slow enemies. Power is improved by increasing ice magic power.';
};

// SET_ITEM_TYPE_DEFAULT_PROPERTIES:
// ************************************************************************************************
gs.setItemTypeDefaultProperties = function () {
	var key;
	
	this.forEachType(this.itemTypes, function (itemType) {
		// Setting frame:
		if (itemType.hasOwnProperty('f')) {	
			itemType.frame = itemType.f;
		}
		else {
			throw 'itemType has no frame: ' + itemType.name;
		}
		
		// Weapon Effect:
		if (itemType.hasOwnProperty('attackEffect')) {
			if (!this.weaponEffects[itemType.attackEffect]) throw 'Invalid weaponEffect: ' + itemType.attackEffect;
			itemType.attackEffect = this.weaponEffects[itemType.attackEffect];
		}
		
		// Use Effect (Consumables):
		if (itemType.hasOwnProperty('useEffect')) {
			// Ability:
			if (this.abilityTypes[itemType.useEffect]) {
				itemType.useEffect = this.createItemAbilityType(itemType);
			}
			// Item Effect:
			else if (this.itemEffects[itemType.useEffect]) {
				itemType.useEffect = this.itemEffects[itemType.useEffect];
			}
			// Invalid:
			else {
				throw 'Invalid itemEffect: ' + itemType.useEffect;
			}
		}

		// Stackable:
		if (itemType.stackable === undefined) {
			if (this.inArray(itemType.slot, ['weapon', 'shield', 'ring', 'body', 'head', 'hands', 'feet', 'book', 'charm'])) {
				itemType.stackable = false;
			} 
			else {
				itemType.stackable = true;
			}
		}
		
		// Base Mod:
		if (itemType.baseMod === undefined) {
			itemType.baseMod = 0;
		}
		
		// Max Mod:
		if (itemType.maxMod === undefined) {
			itemType.maxMod = MAX_ENCHANTMENT;
		}

		// Drop Amount:
		if (itemType.dropAmount === undefined) {
			itemType.dropAmount = 1;
		}
		
		// Stats:
		if (!itemType.hasOwnProperty('stats')) {
			itemType.stats = {};
		}
		
		// Min Range:
		if (!itemType.hasOwnProperty('minRange')) {
			itemType.minRange = 0;
		}
		
		// Cost:
		if (!itemType.hasOwnProperty('cost')) {
			itemType.cost = 1;
		}
		
	}, this);
};

