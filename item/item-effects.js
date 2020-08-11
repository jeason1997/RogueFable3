/*global game, gs, util, console*/
/*global TILE_SIZE, HELL_FIRE_DAMAGE, RED_TARGET_BOX_FRAME, SHROOM_HP, SHROOM_EP, FACTION, RED_BOX_FRAME*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_ITEM_EFFECTS:
// ************************************************************************************************
gs.createItemEffects = function () {
	
	this.itemEffects = {};
	
	// SCROLL_OF_TELEPORTATION:
	// ********************************************************************************************
	this.itemEffects.Teleportation = {};
	this.itemEffects.Teleportation.useImmediately = true;
	this.itemEffects.Teleportation.useOn = function (actingChar, targetTileIndex) {
		gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE');
		gs.playSound(gs.sounds.teleport, gs.pc.tileIndex);
		gs.pc.randomTeleport();
		gs.pc.popUpText('Teleport!', '#ffffff');
		gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE');
	};

	// SCROLL_OF_ENCHANTMENT:
	// ********************************************************************************************
	this.itemEffects.ScrollOfEnchantment = {};
	this.itemEffects.ScrollOfEnchantment.useImmediately = true;
	this.itemEffects.ScrollOfEnchantment.useOn = function () {
		gs.enchantmentMenu.open();
	};
	
	// SCROLL_OF_ACQUIREMENT:
	// ********************************************************************************************
	this.itemEffects.ScrollOfAcquirement = {};
	this.itemEffects.ScrollOfAcquirement.useImmediately = true;
	this.itemEffects.ScrollOfAcquirement.useOn = function () {
		gs.acquirementMenu.open();
	};
	
	// ********************************************************************************************
	// POTIONS:
	// ********************************************************************************************
	// HEALING_SHROOM:
	// ********************************************************************************************
	this.itemEffects.HealingShroom = {};
	this.itemEffects.HealingShroom.useImmediately = true;
	this.itemEffects.HealingShroom.useOn = function () {
		gs.pc.healHp(SHROOM_HP);
		gs.createParticlePoof(gs.pc.tileIndex, 'GREEN');
	};
	
	// ENERGY_SHROOM:
	// ********************************************************************************************
	this.itemEffects.EnergyShroom = {};
	this.itemEffects.EnergyShroom.useImmediately = true;
	this.itemEffects.EnergyShroom.useOn = function () {
		gs.pc.gainMp(SHROOM_EP);
		gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE');
	};

	// EAT:
	// ********************************************************************************************
	this.itemEffects.Eat = {};
	this.itemEffects.Eat.useImmediately = true;
	this.itemEffects.Eat.useOn = function (item) {
		gs.pc.currentFood = gs.pc.maxFood;
		gs.pc.healHp(Math.ceil(gs.pc.maxHp / 2));
		gs.pc.gainMp(Math.ceil(gs.pc.maxMp / 2));
	};

	// POTION_OF_HEALING:
	// ********************************************************************************************
	this.itemEffects.PotionOfHealing = {};
	this.itemEffects.PotionOfHealing.useImmediately = true;
	this.itemEffects.PotionOfHealing.useOn = function () {		
		if (gs.pc.currentHp === gs.pc.maxHp) {
			gs.pc.permanentHpBonus += 4;
			gs.pc.popUpText('+4 Max HP', '#ffffff');
			gs.pc.updateStats();
		}
		else {
			gs.pc.popUpText('Fully Healed', '#ffffff');
		}
		// Full Heal:
		gs.pc.healHp(gs.pc.maxHp);
		gs.pc.cure();
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	
		// Effect:
		gs.createHealingEffect(gs.pc.tileIndex);
		
	};
	
	// POTION_OF_ENERGY:
	// ********************************************************************************************
	this.itemEffects.PotionOfEnergy = {};
	this.itemEffects.PotionOfEnergy.useImmediately = true;
	this.itemEffects.PotionOfEnergy.useOn = function () {
		if (gs.pc.currentMp === gs.pc.maxMp) {
			gs.pc.permanentMpBonus += 1;
			gs.pc.popUpText('+1 Max MP', '#ffffff');
			gs.pc.updateStats();
		}
		else {
			gs.pc.popUpText('Full Energy', '#ffffff');
		}
		
		// Full Mana and cool Downs:
		gs.pc.gainMp(gs.pc.maxMp);
		gs.pc.mentalCure();
		gs.pc.resetAllCoolDowns();
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
		
		// Effect:
		gs.createManaEffect(gs.pc.tileIndex);
	};
	
	// POTION_OF_EXPERIENCE:
	// ********************************************************************************************
	this.itemEffects.PotionOfExperience = {};
	this.itemEffects.PotionOfExperience.useImmediately = true;
	this.itemEffects.PotionOfExperience.useOn = function () {
		// Status Effect:
		gs.pc.statusEffects.add('ExperienceBoost');
		
		// Spell Effect:
		gs.createEXPEffect(gs.pc.tileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};
	
	// POTION_OF_POWER:
	// ********************************************************************************************
	this.itemEffects.PotionOfPower = {};
	this.itemEffects.PotionOfPower.useImmediately = true;
	this.itemEffects.PotionOfPower.useOn = function () {
		// Full Mana and cool Downs:
		gs.pc.gainMp(gs.pc.maxMp);
		gs.pc.mentalCure();
		gs.pc.resetAllCoolDowns();
		
		// Status Effect:
		gs.pc.statusEffects.add('Power');
		
		// Spell Effect:
		gs.createIceEffect(gs.pc.tileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};
	
	// POTION_OF_RESISTANCE:
	// ********************************************************************************************
	this.itemEffects.PotionOfResistance = {};
	this.itemEffects.PotionOfResistance.useImmediately = true;
	this.itemEffects.PotionOfResistance.useOn = function () {
		// Full Heal:
		gs.pc.healHp(gs.pc.maxHp);
		gs.pc.cure();
		
		// Status Effect:
		gs.pc.statusEffects.add('Resistance');
		
		// Spell Effect:
		gs.createIceEffect(gs.pc.tileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};
	
	// POTION_OF_GAIN_ATTRIBUTE:
	// ********************************************************************************************
	this.itemEffects.PotionOfGainAttribute = {};
	this.itemEffects.PotionOfGainAttribute.useImmediately = true;
	this.itemEffects.PotionOfGainAttribute.useOn = function () {
		gs.openAttributeGainMenu();
		
		// Spell Effect:
		gs.createFireEffect(gs.pc.tileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};
};

