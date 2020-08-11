/*global game, gs, util*/
/*global Item*/
/*global FIRE_SHROOM_MIN_DAMAGE, FIRE_SHROOM_MAX_DAMAGE*/
/*global BEAR_TRAP_MIN_DAMAGE, BEAR_TRAP_MAX_DAMAGE*/
/*global FIRE_GLYPH_MIN_DAMAGE, FIRE_GLYPH_MAX_DAMAGE*/
/*global SPIKE_TRAP_MIN_DAMAGE, SPIKE_TRAP_MAX_DAMAGE*/
/*global FIRE_VENT_MIN_DAMAGE, FIRE_VENT_MAX_DAMAGE*/
/*global GAS_VENT_MIN_DAMAGE, GAS_VENT_MAX_DAMAGE*/

/*global MAX_LEVEL, SKELETON_REVIVE_TIME, ZONE_FADE_TIME*/
/*jshint esversion: 6*/
'use strict';



// CREATE_OBJECT_TYPES:
// ************************************************************************************************
gs.createObjectTypes = function () {
	this.createObjectFuncs();
	
	// Object Types:
	this.objectTypes = {
		// Floor Objects:
		Bones:				{frame: 1536, isPassable: 1, isTransparent: 1, isUnstable: 1},
		Vine:				{frame: 1537, isPassable: 1, isTransparent: 1, isUnstable: 1, isFlammable: 1},
		SpiderWeb:			{frame: 1538, isPassable: 1, isTransparent: 1, isUnstable: 1, isFlammable: 1},
		LongGrass:			{frame: 1539, isPassable: 1, isTransparent: 1, isUnstable: 0, isFlammable: 1},
		Rubble:				{frame: 1540, isPassable: 1, isTransparent: 1, isUnstable: 1},
		Ice:				{frame: 1541, isPassable: 1, isTransparent: 1, isUnstable: 2, isSlippery: 1},
		Oil:				{frame: 1542, isPassable: 1, isTransparent: 1, isUnstable: 2, isSlippery: 1, isFlammable: 1},
		Blood:				{frame: 1543, isPassable: 1, isTransparent: 1, isUnstable: 0},
		StoneChips:			{frame: 1544, isPassable: 1, isTransparent: 1, isUnstable: 1},
		Slime:				{frame: 1545, isPassable: 1, isTransparent: 1, isUnstable: 1, isSlippery: 1},
        Scrap:				{frame: 1546, isPassable: 1, isTransparent: 1, isUnstable: 1},
		
		// Trap Objects:
		BearTrap:			{frame: 1552, isPassable: 1, isTransparent: 1, isDangerous: 1, activate: 'bearTrapActivate', updateTurn: 'bearTrapUpdateTurn'},
		SpikeTrap:			{frame: 1554, isPassable: 1, isTransparent: 1, isDangerous: 1, activate: 'spikeTrapActivate', updateTurn: 'spikeTrapUpdateTurn'},
		GasVent:			{frame: 1556, isPassable: 1, isTransparent: 1, isDangerous: 1, updateTurn: 'gasVentUpdateTurn'},
        InactiveGasVent:	{frame: 1551, isPassable: 1, isTransparent: 1, onTrigger: 'activateGasVent'},
		FireVent:			{frame: 1557, isPassable: 1, isTransparent: 1, isDangerous: 1, activate: 'fireVentActivate', updateTurn: 'FireVentUpdateTurn', canBurstOfFlame: true},
        InactiveFireVent:	{frame: 1550, isPassable: 1, isTransparent: 1, onTrigger: 'activateFireVent'},
		PitTrap:			{frame: 1548, isPassable: 1, isTransparent: 1, isHidden: 1, activate: 'pitTrapActivate'},
		TeleportTrap:		{frame: 1549, isPassable: 1, isTransparent: 1, isHidden: 1, activate: 'teleportTrapActivate'},
		FireGlyph:			{frame: 1558, isPassable: 1, isTransparent: 1, isDangerous: 1, activate: 'fireGlyphActivate', canBurstOfFlame: true},
		Portal:				{frame: 1559, isPassable: 1, isTransparent: 1, isDangerous: 1, interactFunc: 'portalActivate'},
		HealingShroom:		{frame: 1560, isPassable: 1, isTransparent: 1, activate: 'healingShroomActivate'},
		EnergyShroom:		{frame: 1562, isPassable: 1, isTransparent: 1, activate: 'manaShroomActivate'},
		FireShroom:			{frame: 1564, isPassable: 1, isTransparent: 1, isDangerous: 1, activate: 'fireShroomActivate', canBurstOfFlame: true},
		SteamVent:			{frame: 1566, isPassable: 1, isTransparent: 1, updateTurn: 'steamVentUpdateTurn'},
		
		// Time Traps:
		FireBallLauncher:	{frame: 1856, isPassable: 0, isTransparent: 1, updateTurn: 'fireBallLauncherUpdateTurn', frames: this.range(1856, 1859)},
		TimedSpikeTrack:	{frame: 1860, isPassable: 1, isTransparent: 1, updateTurn: 'timedSpikeTrapUpdateTurn'},
		PressurePlate:		{frame: 1862, isPassable: 1, isTransparent: 1, activate: 'pressurePlateActivate', updateTurn: 'pressurePlateUpdateTurn'},
		
							 
		// Wall Objects:
		Torch:				{frame: 1568, isPassable: 0, isTransparent: 1, canBurstOfFlame: true},
		WallFlag:			{frame: 1572, isPassable: 0, isTransparent: 1, frames: [1572, 1574]},
		Shackles:			{frame: 1573, isPassable: 0, isTransparent: 1},
		
		// Stalagmite and Pillar:
		Stalagmite:			{frame: 1600, isPassable: 0, isTransparent: 1, frames: [1600, 1601, 1602]},
		Pillar:				{frame: 1608, isPassable: 0, isTransparent: 1, frames: this.range(1608, 1614)},
		WaterStalagmite:	{frame: 1732, isPassable: 0, isTransparent: 1},
		
		// Fountains:
		WellOfWishing:		{frame: 1632, isPassable: 0, isTransparent: 1, interactFunc: 'wellOfWishing', emptyFrame: 1636},
		HealthFountain:		{frame: 1633, isPassable: 0, isTransparent: 1, interactFunc: 'drinkHealthFountain', emptyFrame: 1636},
		EnergyFountain:		{frame: 1634, isPassable: 0, isTransparent: 1, interactFunc: 'drinkEnergyFountain', emptyFrame: 1636},
		ExperienceFountain:	{frame: 1635, isPassable: 0, isTransparent: 1, interactFunc: 'drinkExperienceFountain', emptyFrame: 1636},
		AttributeFountain:	{frame: 1637, isPassable: 0, isTransparent: 1, interactFunc: 'drinkAttributeFountain', emptyFrame: 1636},
		
		// Altars:
		AltarOfTrog:		{frame: 1648, isPassable: 0, isTransparent: 1, interactFunc: 'useAltar', religion: 'Trog'},
		AltarOfWealth:		{frame: 1649, isPassable: 0, isTransparent: 1, interactFunc: 'useAltar', religion: 'Wealth'},
		AltarOfTheArcher:		{frame: 1650, isPassable: 0, isTransparent: 1, interactFunc: 'useAltar', religion: 'TheArcher'},
		AltarOfTheWizard:		{frame: 1651, isPassable: 0, isTransparent: 1, interactFunc: 'useAltar', religion: 'TheWizard'},
		AltarOfHealth:		{frame: 1652, isPassable: 0, isTransparent: 1, interactFunc: 'useAltar', religion: 'Health'},
		AltarOfExploration:	{frame: 1653, isPassable: 0, isTransparent: 1, interactFunc: 'useAltar', religion: 'Exploration'},

		// Interactable Objects: 
		BookShelf:			{frame: 1666, isPassable: 0, isTransparent: 1, interactFunc: 'readBookShelf', emptyFrame: 1667},
		MeatRack:			{frame: 1668, isPassable: 0, isTransparent: 1, interactFunc: 'meatRack', emptyFrame: 1669},
        FishRack:           {frame: 1675, isPassable: 0, isTransparent: 1, interactFunc: 'meatRack', emptyFrame: 1669},
		CampFire:			{frame: 1670, isPassable: 0, isTransparent: 1, updateTurn: 'campFireUpdateTurn', canBurstOfFlame: true},
		Switch:				{frame: 1671, isPassable: 0, isTransparent: 1, interactFunc: 'useSwitch', emptyFrame: 1672},
		CrystalChest:		{frame: 1673, isPassable: 0, isTransparent: 1, interactFunc: 'openCrystalChest', emptyFrame: 1674},
		EnchantmentTable:	{frame: 1724, isPassable: 0, isTransparent: 1, interactFunc: 'useEnchantmentTable', emptyFrame: 1725},
		TransferanceTable:	{frame: 1726, isPassable: 0, isTransparent: 1, interactFunc: 'useTransferanceTable', emptyFrame: 1727},
		
		// Timer Objects:
		Bomb:				{frame: 1680, isPassable: 1, isTransparent: 1, updateTurn: 'bombUpdateTurn'},
		IceBomb:			{frame: 1681, isPassable: 0, isTransparent: 1, updateTurn: 'IceBombUpdateTurn'},
		SkeletonCorpse:		{frame: 1682, isPassable: 1, isTransparent: 1, updateTurn: 'skeletonUpdateTurn', isUnstable: 1},
		LightningRod:		{frame: 1679, isPassable: 0, isTransparent: 1, updateTurn: 'lightningRodUpdateTurn'},
		
		// Non-Interactable Objects:
		Casket:				{frame: 1696, isPassable: 0, isTransparent: 1, frames: this.range(1773, 1776)},
		Table:				{frame: 1697, isPassable: 0, isTransparent: 1},
		WorkBench:			{frame: 1698, isPassable: 0, isTransparent: 1},
		UnfinishedGolem:	{frame: 1699, isPassable: 0, isTransparent: 1},
		StoneBlocks:		{frame: 1700, isPassable: 0, isTransparent: 1},
		StepLadder:			{frame: 1701, isPassable: 0, isTransparent: 1},
		PracticeDummy:		{frame: 1702, isPassable: 0, isTransparent: 1},
		Fern:				{frame: 1703, isPassable: 0, isTransparent: 1, isFlammable: 1},
		Bed:				{frame: 1704, isPassable: 0, isTransparent: 1, frames: [1683]},
		Flag:				{frame: 1705, isPassable: 0, isTransparent: 1},
		Stock:				{frame: 1707, isPassable: 0, isTransparent: 1},
		Bars:				{frame: 1708, isPassable: 0, isTransparent: 1, frames: this.range(1708, 1710)},
		TikiTorch:			{frame: 1728, isPassable: 0, isTransparent: 1, canBurstOfFlame: true},
		Tree:				{frame: 1733, isPassable: 0, isTransparent: 1, frames: [1733, 1706].concat(gs.range(1735, 1748))},
		WaterTree:			{frame: 1734, isPassable: 0, isTransparent: 1},
		Throne:				{frame: 1713, isPassable: 0, isTransparent: 1},
		Furnace:            {frame: 1714, isPassable: 0, isTransparent: 1},
        Shelf:              {frame: 1711, isPassable: 0, isTransparent: 1, frames: [1712]},
        Rock:               {frame: 1740, isPassable: 0, isTransparent: 1, frames: [1741, 1744, 1745]},
        Bench:              {frame: 1685, isPassable: 1, isTransparent: 1, frames: [1685, 1686, 1687]},
        LilyPads:           {frame: 1750, isPassable: 1, isTransparent: 1},
        Reeds:              {frame: 1751, isPassable: 1, isTransparent: 1},
        OilTank:			{frame: 1760, isPassable: 0, isTransparent: 1, frames: [1760, 1761, 1792, 1793, 1794, 1795]},
        GasLamp:			{frame: 1762, isPassable: 0, isTransparent: 1},
		Statue:				{frame: 1752, isPassable: 0, isTransparent: 1, frames: [1752, 1749]},
		Barrel:				{frame: 1753, isPassable: 0, isTransparent: 1},
		UnlitBrazer:		{frame: 1754, isPassable: 0, isTransparent: 1},
		Brazer:				{frame: 1755, isPassable: 0, isTransparent: 1, canBurstOfFlame: true},
		Chair:				{frame: 1764, isPassable: 1, isTransparent: 1, frames: [1764, 1765]},
		BigTable:			{frame: 1766, isPassable: 0, isTransparent: 1, frames: this.range(1766, 1771).concat([1798, 1799, 1800])},
		Pipe:				{frame: 1779, isPassable: 0, isTransparent: 1, frames: this.range(1779, 1791)},
		Altar:				{frame: 1777, isPassable: 0, isTransparent: 1, frames: [1777, 1778, 1808, 1809, 1810, 1811, 1812,1813]},
		SkullStatue:		{frame: 1772, isPassable: 0, isTransparent: 1, frames: [1772, 1798]},
		Cactus:				{frame: 1797, isPassable: 0, isTransparent: 1},
		Candlabra:			{frame: 1798, isPassable: 0, isTransparent: 1},
		SlimeTank:			{frame: 1802, isPassable: 0, isTransparent: 1, frames: [1802, 1803]},
		LavaTank:			{frame: 1804, isPassable: 0, isTransparent: 1, frames: [1804, 1805, 1806, 1807]},
		LavaSpout:			{frame: 1824, isPassable: 0, isTransparent: 1},
		StoneLavaSpout:		{frame: 1828, isPassable: 0, isTransparent: 1},
		TombStone:			{frame: 1720, isPassable: 0, isTransparent: 1},
		
		// Zone Lines:
		DownStairs:			{frame: 1616, 	isPassable: 1, isTransparent: 1},
		UpStairs:			{frame: 1617, 	isPassable: 1, isTransparent: 1},
		
		// Doors:
		Door:				{frame: 1584, frames: [1584, 1585], isTransparent: false, interactFunc: 'useDoor'},
		Gate: 				{frame: 1586, frames: [1586, 1587], isTransparent: true, interactFunc: 'useDoor'},
		StoneDoor: 			{frame: 1588, frames: [1588, 1589], isTransparent: false, interactFunc: 'useDoor'},
		TimedGate:			{frame: 1590, frames: [1590, 1591], isTransparent: true, interactFunc: 'useDoor'},
		SwitchGate:			{frame: 1592, frames: [1592, 1593], isTransparent: true, interactFunc: 'useDoor'},
		
		// Containers:		
		Chest:				{frame: 1664, isPassable: 0, isTransparent: true, openSound: gs.sounds.door, interactFunc: 'useContainer'},
		
		Generic:			{frame: 0,   isPassable: 1, isTransparent: 1}
	};
	
	// Animations:
	this.objectTypes.Torch.anim = [1568, 1569, 1570, 1571];
	this.objectTypes.HealingShroom.anim = [1560, 1561];
	this.objectTypes.EnergyShroom.anim = [1562, 1563];
	this.objectTypes.FireShroom.anim = [1564, 1565];
	this.objectTypes.TikiTorch.anim = [1728, 1729, 1730, 1731];
	this.objectTypes.GasLamp.anim = [1762, 1763];
	this.objectTypes.Brazer.anim = [1755, 1756, 1757, 1758];
	this.objectTypes.Candlabra.anim = [1798, 1799, 1800, 1801];
	this.objectTypes.LavaSpout.anim = [1824, 1825, 1826, 1827];
	this.objectTypes.StoneLavaSpout.anim = [1828, 1829, 1830, 1831];
	
	// Reflections:
	this.objectFrameReflections = [
		// Casket:
		{f1: 1773, f2: 1774}
	];
	
	// LIGHTS:
	//this.objectTypes.HealthFountain.light = {color: '#00ff00', radius: 160, startAlpha: '66'};
	//this.objectTypes.EnergyFountain.light = {color: '#ff00ff', radius: 120, startAlpha: '66'};
	//this.objectTypes.ExperienceFountain.light = {color: '#ffff00', radius: 120, startAlpha: '66'};
	//this.objectTypes.AttributeFountain.light = {color: '#ff0000', radius: 120, startAlpha: '66'};
	//this.objectTypes.WellOfWishing.light = {color: '#00ffff', radius: 120, startAlpha: '66'};
											 
											 
	// Set Default Properties:
	this.nameTypes(this.objectTypes);
	this.forEachType(this.objectTypes, function (type) {
		// Interact:
		if (type.interactFunc) {
			type.interactFunc = this.objectFuncs[type.interactFunc];
		}
		
		// Activate:
		if (type.activate) {
			type.activate = this.objectFuncs[type.activate];
		}
		
		// Update Turn:
		if (type.updateTurn) {
			type.updateTurn = this.objectFuncs[type.updateTurn];
		}
        
        //onTrigger:
        if (type.onTrigger) {
            type.onTrigger = this.objectFuncs[type.onTrigger];
        }
	}, this);


	
	
	
	this.objectTypes.HealthFountain.desc = 'Completely restores your hit points.';
	this.objectTypes.EnergyFountain.desc = 'Completely restores your mana points.';
	this.objectTypes.LongGrass.desc = 'Ignites and spreads fire.';
	this.objectTypes.FireShroom.desc = 'Dangerous mushrooms which explode in a burst of fire when stepped on.';
	this.objectTypes.HealingShroom.desc = 'Pick them to eat later and restore your hit points.';
	this.objectTypes.EnergyShroom.desc = 'Pick them to eat later and restore your mana points.';
	this.objectTypes.Vine.desc = 'Unstable Terrain\nPhysical attacks against unstable characters are always criticals.';
};

// REFLECT_OBJECT_FRAME:
// ************************************************************************************************
gs.reflectObjectFrame = function (frame) {
	var e;
	
	e = this.objectFrameReflections.find(e => e.f1 === frame);
	if (e) {
		return e.f2;
	}
	
	e = this.objectFrameReflections.find(e => e.f2 === frame);
	if (e) {
		return e.f1;
	}
	
	return frame;
	
};

// CREATE_OBJECT_FUNCS:
// ************************************************************************************************
gs.createObjectFuncs = function () {
	this.objectFuncs = {};
	
	this.objectFuncs.fireBallLauncherUpdateTurn = function () {
		var delta, proj, damage;
		
		damage = gs.getScaledTrapDamage(FIRE_GLYPH_MIN_DAMAGE, FIRE_GLYPH_MAX_DAMAGE);
		
		if (this.sprite.frame === 1856) delta = {x: 0, y: 1};
		if (this.sprite.frame === 1857) delta = {x: 1, y: 0};
		if (this.sprite.frame === 1858) delta = {x: 0, y: -1};
		if (this.sprite.frame === 1859) delta = {x: -1, y: 0};
		
		// Activate:
		if (this.currentTurn <= 0) {
			if (gs.isPassable(this.tileIndex.x + delta.x, this.tileIndex.y + delta.y)) {
				proj = gs.createNPC({x: this.tileIndex.x + delta.x, y: this.tileIndex.y + delta.y}, 'OrbOfFire', {burstDamage: damage});
				proj.moveDelta = {x: delta.x, y: delta.y};
				proj.waitTime = 100;
				proj.isAgroed = true;
			}
			this.currentTurn = this.loopTurns || 25;
		} 
		// Ticking Time:
		else {
			this.currentTurn -= 1;
		}
	};
	
	this.objectFuncs.pressurePlateActivate = function () {
		if (this.currentTurn === 0) {
			this.emitSignal();
			this.currentTurn = this.loopTurns || 0;
		}
	};
	
	this.objectFuncs.pressurePlateUpdateTurn = function () {
		if (this.currentTurn !== 0) {
			this.currentTurn -= 1;
			this.sprite.frame = this.type.frame + 1;
		}
		else {
			this.sprite.frame = this.type.frame;
		}
	};
	
	this.objectFuncs.timedSpikeTrapUpdateTurn = function () {
		var damage;
		
		damage = gs.getScaledTrapDamage(SPIKE_TRAP_MIN_DAMAGE, SPIKE_TRAP_MAX_DAMAGE);
		
		// Activate:
		if (this.currentTurn <= 0) {
			this.currentTurn = this.loopTurns || 5;
			if (gs.getChar(this.tileIndex)) {
				gs.playSound(gs.sounds.melee, this.tileIndex);
				gs.getChar(this.tileIndex).takeDamage(gs.getScaledTrapDamage(SPIKE_TRAP_MIN_DAMAGE, SPIKE_TRAP_MAX_DAMAGE), 'Physical', {killer: 'SpikeTrap'});
			}
			this.sprite.frame = this.type.frame + 1;
		}
		// Ticking Time:
		else {
			this.sprite.frame = this.type.frame;
			this.currentTurn -= 1;
		}
		
	};
	
	
	this.objectFuncs.drinkHealthFountain = function (character) {
		if (character.currentHp < character.maxHp || character.poisonDamage > 0) {
			character.healHp(character.maxHp);
			gs.pc.cure();

			gs.playSound(gs.sounds.cure, this.tileIndex);
			gs.pc.popUpText('Fully Healed', '#ffffff');
			//gs.createParticlePoof(character.tileIndex, 'GREEN');
			
			// Effect:
			gs.createHealingEffect(gs.pc.tileIndex);
			
			this.setIsFull(false);
			
			gs.HUD.miniMap.refresh();
		}
		else {
			gs.pc.popUpText('Already full health', '#ffffff');
		}
	};
	
	this.objectFuncs.drinkEnergyFountain = function (character) {
		if (character.currentMp < character.maxMp || character.hasCoolDown()) {	
			gs.pc.mentalCure();
			
			character.gainMp(character.maxMp);
			character.resetAllCoolDowns();
			
			gs.pc.popUpText('Full Energy', '#ffffff');
			
			// Sound:
			gs.playSound(gs.sounds.cure, this.tileIndex);
		
			// Effect:
			gs.createManaEffect(gs.pc.tileIndex);
			
			this.setIsFull(false);
			
			gs.HUD.miniMap.refresh();
		}
		else {
			gs.pc.popUpText('Already full energy', '#ffffff');
		}
	};

	this.objectFuncs.drinkExperienceFountain = function (character) {
		// Status Effect:
		character.statusEffects.add('ExperienceBoost');
		
		// Spell Effect:
		gs.createEXPEffect(character.tileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.cure, character.tileIndex);
		
		this.setIsFull(false);
		
		gs.HUD.miniMap.refresh();
	};
	
	this.objectFuncs.wellOfWishing = function (character) {
		gs.usingFountain = this;
		gs.acquirementMenu.open();
	};
	
	this.objectFuncs.useEnchantmentTable = function (character) {
		gs.usingFountain = this;
		gs.enchantmentMenu.open();
	};
	
	this.objectFuncs.useTransferanceTable = function (character) {
		gs.usingFountain = this;
		gs.transferanceMenu.open();
	};
	
	this.objectFuncs.drinkAttributeFountain = function (character) {
		gs.usingFountain = this;
		gs.openAttributeGainMenu();
		gs.playSound(gs.sounds.cure, this.tileIndex);
		this.setIsFull(false);
		
		// Spell Effect:
		gs.createFireEffect(gs.pc.tileIndex);
		
		gs.HUD.miniMap.refresh();
	};
	
	
	this.objectFuncs.readBookShelf = function (character) {
		var talent = gs.pc.getUnavailableTalent(),
			skillName = gs.pc.getRandomSkillName(),
			choice,
			list = [
				{name: 'Scroll', percent: 20}, 
				{name: 'Book', percent: 5}, 
				{name: 'TalentPoint', percent: 5},
				{name: 'SkillPoint', percent: 20},
			];
			
		
		if (skillName) {
			list.push({name: 'RandomSkill', percent: 40});
		}
		
		if (talent) {
			list.push({name: 'RandomTalent', percent: 10});
		}
		
		choice = gs.chooseRandom(list);
		
		if (choice === 'Scroll') {
			gs.pc.inventory.addItem(gs.createRandomItem('Scrolls'));
		}
		else if (choice === 'Book') {
			gs.pc.inventory.addItem(gs.createRandomItem('Books'));
		}
		else if (choice === 'SkillPoint') {
			gs.pc.skillPoints += 1;
			gs.pc.popUpText('+1 Skill Point', '#ffffff');
		}
		else if (choice === 'RandomSkill') {
			gs.pc.skillPoints += 1; // gainSkill will -1 skillPoints
			gs.pc.gainSkill(skillName);
			gs.pc.popUpText('+1 ' + gs.capitalSplit(skillName) + ' skill', '#ffffff');
		}
		else if (choice === 'TalentPoint') {
			gs.pc.talentPoints += 1;
			gs.pc.popUpText('+1 Talent Point', '#ffffff');
		}
		else if ( choice === 'RandomTalent') {
			gs.pc.availableTalents.push(talent.name);
			gs.pc.popUpText(gs.capitalSplit(talent.name) + ' available', '#ffffff');
		}
		
		// Stop exploration:
		gs.pc.stopExploring();
		
		gs.createParticlePoof(character.tileIndex, 'WHITE');
		gs.playSound(gs.sounds.point, this.tileIndex);
		
		this.setIsFull(false);
		
		gs.HUD.miniMap.refresh();
	};
	

	this.objectFuncs.meatRack = function (character) {
		gs.pc.inventory.addItem(Item.createItem('Meat'));
		gs.playSound(gs.sounds.food, this.tileIndex);
		this.setIsFull(false);
		this.isOpen = true;
		gs.pc.stopExploring();
		
		gs.HUD.miniMap.refresh();
	};
	
	this.objectFuncs.openCrystalChest = function (character) {
		// Sealed:
		if (gs.crystalChestGroupIsOpen[this.groupId]) {
			gs.openingContainer = this;
			gs.dialogMenu.open(gs.dialog.SealedCrystalChest);
		}
		// Not sealed:
		else {
			gs.openingContainer = this;
			gs.dialogMenu.open(gs.dialog.CrystalChest);
		}
	};
	
	this.objectFuncs.useDoor = function (character) {
		// Guarded (Zoo):
		if (this.isGuarded && character === gs.pc) {
			gs.dialogMenu.open(gs.dialog.GuardedDoor);
			gs.openingDoor = this;
			gs.pc.actionQueue = [];
		}
		// Locked (Closed Time Gate):
		else if (this.isLocked && character === gs.pc && this.isPermaLocked) {
			gs.dialogMenu.open(gs.dialog.PermaLockedDoor);
			gs.openingDoor = this;
			gs.pc.actionQueue = [];
		}
		// Locked (Switch):
		else if (this.isLocked && character === gs.pc && this.type.name === 'SwitchGate') {
			gs.dialogMenu.open(gs.dialog.SwitchGate);
			gs.openingDoor = this;
			gs.pc.actionQueue = [];
		}
		// Locked (Treasure Room):
		else if (this.isLocked && character === gs.pc) {
			gs.dialogMenu.open(gs.dialog.LockedDoor);
			gs.openingDoor = this;
			gs.pc.actionQueue = [];
		}
		else {
			this.openDoor();
		}
	};
	
	this.objectFuncs.useContainer = function (character) {
		if (this.isGuarded) {
			gs.dialogMenu.open(gs.dialog.GuardedContainer);
			gs.openingContainer = this;
		} 
		else {
			this.openContainer();
		}
	};
	

	this.objectFuncs.bearTrapActivate = function (character) {
		if (this.currentTurn === 0) {
			gs.playSound(gs.sounds.melee, this.tileIndex);
			this.currentTurn = 5;
			if (character) {
				
				character.statusEffects.add('Immobile', {duration: 5});
				
				character.takeDamage(gs.getScaledTrapDamage(BEAR_TRAP_MIN_DAMAGE, BEAR_TRAP_MAX_DAMAGE), 'Physical', {killer: 'BearTrap'});
			}
			this.sprite.frame = this.type.frame + 1;
		}
	};

	this.objectFuncs.bearTrapUpdateTurn = function () {
		if (this.currentTurn > 0) {
			this.currentTurn -= 1;
		} else {
			this.sprite.frame = this.type.frame;
		}
	};
	
	this.objectFuncs.IceBombUpdateTurn = function () {
		// Count Down:
		if (this.currentTurn < 3) {
			this.currentTurn += 1;
		} 
		// Explode:
		else {
			gs.getIndexInBox(this.tileIndex.x - 1, this.tileIndex.y - 1, this.tileIndex.x + 2, this.tileIndex.y + 2).forEach(function (index) {
				if (!gs.vectorEqual(this.tileIndex, index)) {
					gs.createProjectile(this, index, 'IceArrow', this.damage, {killer: this});
				}
			}, this);
			
			gs.playSound(gs.sounds.ice, this.tileIndex);
			gs.destroyObject(this);
		}
	};
	
	this.objectFuncs.bombUpdateTurn = function () {
		// Count Down:
		if (this.currentTurn < 1) {
			this.currentTurn += 1;
		} 
		// Explode:
		else {
			gs.destroyObject(this);
			gs.createExplosionCross(this.tileIndex, 3, this.damage || 4, {killer: 'Bomb'});
		}
	};
	
	
	this.objectFuncs.skeletonUpdateTurn = function () {
		if (gs.zoneName === 'TheLichKingsLair' && gs.findChar('CryptAltar')) {
			// Count Down:
			if (this.currentTurn < SKELETON_REVIVE_TIME) {
				this.currentTurn += 1;
			}
			// Revive:
			else if (gs.isPassable(this.tileIndex)) {
				let npc = gs.createNPC(this.tileIndex, this.npcTypeName || 'SkeletonWarrior');
				
				// Set exp to 0:
				npc.exp = 0;
				
				gs.destroyObject(this);
			}
		}
	};
	
	this.objectFuncs.lightningRodUpdateTurn = function () {
		// Count Down:
		if (this.currentTurn < 5) {
			this.currentTurn += 1;
		} 
		// Explode:
		else {
			gs.createPopUpText(this.tileIndex, 'Poof');
			gs.createParticlePoof(this.tileIndex, 'WHITE');
			gs.destroyObject(this);
		
		}
	};
	
	this.objectFuncs.spikeTrapActivate = function (character) {
		if (this.currentTurn === 0) {
			gs.playSound(gs.sounds.melee, this.tileIndex);
			this.currentTurn = 5;
			if (character) {
				character.takeDamage(gs.getScaledTrapDamage(SPIKE_TRAP_MIN_DAMAGE, SPIKE_TRAP_MAX_DAMAGE), 'Physical', {killer: 'SpikeTrap'});
			}
			this.sprite.frame = this.type.frame + 1;
		}
	};

	this.objectFuncs.spikeTrapUpdateTurn = function () {
		if (this.currentTurn > 0) {
			this.currentTurn -= 1;
		} else {
			this.sprite.frame = this.type.frame;
		}
	};
	
	this.objectFuncs.fireVentActivate = function () {
		if (this.currentTurn === 0) {
			gs.createExplosion(this.tileIndex, 1, gs.getScaledTrapDamage(FIRE_VENT_MIN_DAMAGE, FIRE_VENT_MAX_DAMAGE), {killer: 'FireVent'});
			this.currentTurn = 3;
			this.sprite.frame = this.type.frame - 1;
		}
	};
	
	this.objectFuncs.FireVentUpdateTurn = function () {
		if (this.currentTurn > 0) {
			this.currentTurn -= 1;
		} else {
			this.sprite.frame = this.type.frame;
		}
	};
    
	// Used for one time triggered fire vents (trap rooms):
    this.objectFuncs.activateFireVent = function () {
		gs.createExplosion(this.tileIndex, 1, gs.getScaledTrapDamage(FIRE_VENT_MIN_DAMAGE, FIRE_VENT_MAX_DAMAGE), {killer: 'FireVent'});
    };
	

	this.objectFuncs.healingShroomActivate = function (character) {
		if (character === gs.pc) {
			gs.pc.inventory.addItem(Item.createItem('HealingShroom'));
		} 
		
		gs.playSound(gs.sounds.point, this.tileIndex);
		gs.createParticlePoof(this.tileIndex, 'GREEN', 10);
		gs.destroyObject(this);
	};
	
	this.objectFuncs.manaShroomActivate = function (character) {
		if (character === gs.pc) {
			gs.pc.inventory.addItem(Item.createItem('EnergyShroom'));
		}
		
		gs.playSound(gs.sounds.point, this.tileIndex);
		gs.createParticlePoof(this.tileIndex, 'PURPLE', 10);
		gs.destroyObject(this);
	};

	this.objectFuncs.fireShroomActivate = function (character) {
		gs.destroyObject(this);
		gs.createFire(this.tileIndex, gs.getScaledTrapDamage(FIRE_SHROOM_MIN_DAMAGE, FIRE_SHROOM_MAX_DAMAGE), {killer: 'FireShroom'});
	};
	
	this.objectFuncs.fireGlyphActivate = function (character) {
		var damage = gs.getScaledTrapDamage(FIRE_GLYPH_MIN_DAMAGE, FIRE_GLYPH_MAX_DAMAGE);
		gs.destroyObject(this);
		gs.createFire(this.tileIndex, damage, {killer: 'FireGlyph'});
		
		gs.createCloud(this.tileIndex, 'FlamingCloud', Math.ceil(damage / 2), 10);
		
	};

	this.objectFuncs.gasVentUpdateTurn = function () {
		if (this.currentTurn <= 0) {
			gs.createCloud(this.tileIndex, 'PoisonGas', gs.getScaledTrapDamage(GAS_VENT_MIN_DAMAGE, GAS_VENT_MAX_DAMAGE), 15);
			this.currentTurn = 25;
		} else {
			this.currentTurn -= 1;
		}
	};
	
	this.objectFuncs.steamVentUpdateTurn = function () {
		if (this.currentTurn <= 0) {
			// Steam:
			let cloud = gs.createCloud(this.tileIndex, 'Steam', 15);
			cloud.updateTurn(); // Allow it to spread one space
			
			// Knockback:
			gs.getIndexInRadius(this.tileIndex, 1.5).forEach(function (tileIndex) {
				let char = gs.getChar(tileIndex);
				if (char) {
					char.body.applyKnockBack(util.normal(this.tileIndex, char.tileIndex), 2);
				}
			}, this);
			
			this.currentTurn = 25;
		} 
		else {
			this.currentTurn -= 1;
		}
	};
    
    this.objectFuncs.activateGasVent = function () {
        gs.createCloud(this.tileIndex, 'PoisonGas', gs.getScaledTrapDamage(GAS_VENT_MIN_DAMAGE, GAS_VENT_MAX_DAMAGE), 15);   
    };
	
	this.objectFuncs.pitTrapActivate = function (character) {
		if (character === gs.pc && !gs.pc.isFlying) {
			gs.destroyObject(this);
			gs.descendLevel();
			gs.playSound(gs.sounds.pitTrap, gs.pc.tileIndex);
			gs.pc.teleportTo(gs.getPitDropToIndex());
			gs.pc.popUpText('Pit Trap!', '#ffffff');
			gs.createParticlePoof(gs.pc.tileIndex, 'WHITE');
		}
	};
	
	this.objectFuncs.teleportTrapActivate = function (character) {
		if (character === gs.pc) {
			gs.destroyObject(this);
			gs.createParticlePoof(character.tileIndex, 'PURPLE');
			gs.playSound(gs.sounds.teleport, gs.pc.tileIndex);
			gs.pc.randomTeleport();
			gs.pc.popUpText('Teleport Trap!', '#ffffff');
			gs.createParticlePoof(character.tileIndex, 'PURPLE');
			
		}
	};
	
	this.objectFuncs.portalActivate = function (character) {
		var pos;
		
		if (character === gs.pc) {
			gs.createParticlePoof(character.tileIndex, 'PURPLE');
			gs.playSound(gs.sounds.teleport, character.tileIndex);
			gs.pc.teleportTo(gs.getNearestPassableIndex(this.toTileIndex));
			gs.createParticlePoof(character.tileIndex, 'PURPLE');
			
			pos = util.toPosition(character.tileIndex);
			gs.createLightCircle({x: pos.x, y: pos.y + 10}, '#ff00ff', 120, 50, '88');
			
			// Pull all allies to new position:
			gs.getAllAllies().forEach(function (char) {
				let tileIndex = gs.getNearestPassableIndex(gs.pc.tileIndex);
				
				if (tileIndex) {
					char.body.snapToTileIndex(tileIndex);
				}
		
			}, this);
		}
	};
	
	this.objectFuncs.useAltar = function (character) {
		gs.currentAltar = this;
		gs.openAltarMenu();
		
	};
	
	this.objectFuncs.campFireUpdateTurn = function () {
		if (util.distance(this.tileIndex, gs.pc.tileIndex) < 2 && gs.pc.coldLevel > 0) {
			gs.pc.coldLevel -= 1;
		}
	};
	
	this.objectFuncs.useSwitch = function () {
		if (!gs.getObj(this.toTileIndex).isOpen) {
			
			gs.getObj(this.toTileIndex).openDoor();
			this.setIsFull(false);
		}
		
	};

};

// GET_SCALED_TRAP_DAMAGE:
// ************************************************************************************************
gs.getScaledTrapDamage = function (min, max, DL) {
	DL = DL || gs.dangerLevel();
	
	return Math.ceil(min + (DL - 1) * ((max - min) / (MAX_LEVEL - 1)));
};