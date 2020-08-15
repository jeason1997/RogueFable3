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
			return '+' + this.bonus[talentLevel - 1] + ' 毒法力威力';
		}
		else {
			return '';
		}
	};	
	this.talents.LifeSpike.desc = 			'持续吸取目标的生命，治疗施法者。可以堆叠多次';
	this.talents.ToxicAttunement.desc = 	'在此效果持续期间，增加你的毒法力威力并在\n施放毒法力的时候降低一点法力值消耗。';
	this.talents.Cannibalise.desc = 		'牺牲8点生命，来恢复6点法力值。';
	this.talents.PoisonCloud.desc = 		'召唤出一团毒气';
	this.talents.SummonSkeleton.desc =		'召唤出一个或者多个骷髅怪为你战斗。';
	this.talents.InfectiousDisease.desc = 	'用一种疾病感染单个目标，该疾病会传染给附近的角色。';
	
	// FIRE_MAGIC:
	this.talents.FireMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' 火法力威力';
		}
		else {
			return '';
		}
		};	
	this.talents.FireBall.desc = 			'发射一个会爆炸的火球，伤害怪物并点燃可燃物。';
	this.talents.FireAttunement.desc = 		'在此效果持续期间，增加你的火法力威力并在\n施放火法力的时候降低一点法力值消耗。';
	this.talents.BurstOfFlame.desc = 		'在地板上施放一坨火焰。如果放在火炬或其他\n燃烧的物体上，会产生大爆炸。';
	this.talents.InfernoOrb.desc = 			'召唤一个缓慢移动的火球，一旦撞击就会产生\n强烈的爆炸。';
	this.talents.FlamingHands.desc =		'在此效果持续期间，你将在每次攻击中投掷燃\n烧的炮弹。';
	this.talents.FireBolt.desc = 			'发射出一道火焰，击中途径中的多个怪物。';
	
	// STORM_MAGIC:
	this.talents.StormMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' 风暴法力威力';
		}
		else {
			return '';
		}
	};	
	this.talents.LightningBolt.desc = 		'发射出一道闪电，击中途径中的多个怪物。';
	this.talents.StormAttunement.desc = 	'在此效果持续期间，增加你的风暴法力威力并在\n施放风暴法力的时候降低一点法力值消耗。';
	this.talents.Shock.desc =				'电击目标并传导给所有相邻的角色。';
	this.talents.ThunderClap.desc = 		'产生一个巨大的雷电，在此效果持续期间电轰所有敌人';
	this.talents.StaticDischarge.desc = 	'释放出一股强大的电流，伤害附近所有的怪物。';
	
	// ICE_MAGIC:
	this.talents.ColdMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' 冰法力威力';
		}
		else {
			return '';
		}
	};	
	this.talents.ColdAttunement.desc = 		'在此效果持续期间，增加你的冰系法力威力并在\n施放冰系法力的时候降低一点法力值消耗。';
	this.talents.ConeOfCold.desc =			'用冰霜攻击一群敌人，伤害，减速并击退他们。';
	this.talents.FreezingCloud.desc =		'召唤一团冰冻的蒸汽云，它会伤害站在里面的角色。';
	this.talents.Freeze.desc =				'将目标冰冻起来，使其在此效果持续期间无法行动。';
	this.talents.IceArmor.desc =			'效果持续期间给予+5点守护。';
	this.talents.FlashFreeze.desc =			'将视线中的每个角色冻结在冰块中，使其无法行动。';
	
	// ENCHANTMENT_MAGIC:
	this.talents.Confusion.desc =			'迷惑范围内一个或多个角色，使其攻击离它最近的目标。';
	this.talents.Fear.desc =				'使你身边范围内的所有敌人恐惧地逃跑。';
	this.talents.Charm.desc =				'魅惑一个目标，使它暂时为你战斗。';
	this.talents.Mesmerize.desc =			'使一群敌人陷入沉睡。';
	this.talents.Swiftness.desc =			'效果持续期间，移动速度变为两倍。';
	
	// MELEE:
	this.talents.WeaponMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' 近战武器威力';
		}
		else {
			return '';
		}
	};	
	this.talents.PowerStrike.desc = 		'用你的近战武器发出强力一击，\n造成更大的伤害和击退敌人';
	this.talents.Charge.desc = 				'冲刺到一个敌人身边并攻击它';
	this.talents.Berserk.desc = 			'效果持续期间，你的每一次近战攻击都会造成暴击。';
	
	this.talents.BloodLust.desc = 			'+1 最大怒气值';
	this.talents.WarCry.desc =				'瞬间充满你的怒气槽并打晕你周围的敌人。\n但同时会使附近的所有敌人察觉你。';
	
	// RANGE:
	this.talents.RangeMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' 远程武器威力';
		}
		else {
			return '';
		}
	};	
	this.talents.PowerShot.desc = 			'用你的远程武器发出强力一击，\n造成更大的伤害和击退敌人。';
	this.talents.TunnelShot.desc = 			'允许你的投掷物穿过大量的怪物，造成额外的伤害。';
	this.talents.DeadEye.desc = 			'使用后，在生效期间你的每一次远程攻击都会造成暴击。';
	this.talents.PerfectAim.desc =			'允许你绕过其他敌人射击你想要攻击的目标。';
	this.talents.Disengage.desc =			'攻击敌人并后退一步，若造成致命一击则立刻冷却完毕。';
	this.talents.Lunge.desc =				'猛冲并攻击敌人，若造成致命一击则立刻冷却完毕。';
	//this.talents.StrongArm.desc = 			'+1 range and +10% damage, with thrown weapons.';
	//this.talents.AmmoConservation.desc = 	'+10% chance to save ammo per talent level.';
	
	
	// DEFENSE:
	this.talents.ShieldsUp.desc =		'您将在下一回合中对每一个击中您的敌人\n进行阻挡和反击。';
	this.talents.ShieldWall.desc =		'增加对每一面相邻的墙的保护。';
	this.talents.Deflect.desc =			'在效果持续期间内给予+10点反击。';
	this.talents.Fortitude.desc = 		function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '提高你的最大生命值 ' + this.bonusHp[talentLevel - 1] + '点。';
		}
		else {
			return '';
		}
	};	
	this.talents.Regeneration.desc =	'+1 生命值恢复速度';
	this.talents.FireResistance.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+1 火抗性';
		}
		else {
			return '';
		}
	};	
	this.talents.ColdResistance.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+1 冰抗性';
		}
		else {
			return '';
		}
	};	
	this.talents.ShockResistance.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+1 电抗性';
		}
		else {
			return '';
		}
	};	
	this.talents.ToxicResistance.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+1 毒抗性';
		}
		else {
			return '';
		}
	};	
	
	
	// FOCUS:
	this.talents.MagicMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' 法术威力';
		}
		else {
			return '';
		}
	};	
	this.talents.Focus.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '提高你的最大法力值' + this.bonusMp[talentLevel - 1] + '点。';
		}
		else {
			return '';
		}
	};	
	this.talents.Tranquility.desc =		'+1 法力值恢复速度';
	//this.talents.Adrenaline.desc = 			'50% chance to save mana when less then 1/3 HP.';
	//this.talents.ManaConservation.desc = 	'There is a 20% chance when using an ability that mana will not be consumed.';


	// STEALTH:
	this.talents.StealthMastery.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' 潜行';
		}
		else {
			return '';
		}
	};	
	this.talents.SleepingDart.desc = 	"使敌人陷入沉睡。";
	this.talents.SmokeBomb.desc =		"产生一团浓烟阻挡视线。";
	this.talents.DungeonSense.desc = 	'在小地图上显示所有宝箱和楼梯的位置。';
	this.talents.NimbleFingers.desc =	'允许你捡起和放置陷阱。';
	this.talents.Evade.desc = 			'使用后，所有的怪物都会立刻忘记你。';
	this.talents.HeadShot.desc =		'允许你执行远程偷袭。';
	this.talents.KeenHearing.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '允许你在小地图上检测到附近' + this.range[talentLevel - 1] + '格范围内的怪物。';
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
			return '+' + this.bonus[talentLevel - 1] + ' 回避';
		}
		else {
			return '';
		}
	};	
	this.talents.Sprint.desc = 			'一回合内冲刺到某地';
	this.talents.StrafeAttack.desc =	'走向或横扫时，您将自动攻击最近的敌人。';
	
	this.talents.StoneSkin.desc = function (talentLevel) {
		if (talentLevel <= this.level.length) {
			return '+' + this.bonus[talentLevel - 1] + ' 守护';
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