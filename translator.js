'use strict';

var translator = {};

translator.getText = function (string) {
    var ret = dic[string];
    return (ret == undefined || ret == '') ? string : ret;
}

var dic = {
    //职业
    'Warrior': '战士',
    'Barbarian': '野蛮人',
	'Ranger': '游侠',
	'Rogue': '盗贼',
	'FireMage': '火法师',
	'StormMage': '风暴法师',
	'IceMage': '冰法师',
	'Necromancer': '死灵法师',
	'Enchanter': '幻术师',
    'Duelist': '决斗者',
    
    //种族
    'Human': '人类',
    'Ogre': '兽人',
    'Troll': '巨魔',
    'Mummy': '木乃伊',
    'Elf': '精灵',
    'Gnome': '侏儒',
    'Gargoyle': '石像鬼',

    //生物
    'Rat': '老鼠',

    //物品
    'Meat': '肉',
    'Dart': '飞镖',

    //技能
    'Melee': '近战',
    'Fortitude': '坚韧',
    'Range': '远程',
    'Stealth': '潜行',
    'SpellCasting': '施法',
    'Focus': '专注',

    //状态效果
    'Wet': '湿透',
    'Unstable': '站不稳',

    //地图
    'TheUpperDungeon': '顶层地牢',

    //地砖
    'Water': '水',
    'Wall': '墙壁',
    'Floor': '地板',
    'Cave Wall': '洞壁',
    'Cave Floor': '洞穴地板',

    //场景特效
    'Smoke': '雾气',

    //场景物件
    'Door': '门',
    'FireShroom': '火蘑菇',

    //天赋
    // NECROMANCY:
    'ToxicMastery': '毒系精通',
    'LifeSpike': '生命尖刺',
    'ToxicAttunement': '毒系调和',
    'Cannibalise': '食人',
    'PoisonCloud': '毒云',
    'SummonSkeleton': '召唤骷髅',
    'InfectiousDisease': '传染病',
    // FIRE_MAGIC:
    'FireMastery': '火系精通',
    'FireBall': '火球',
    'FireAttunement': '火系调和',
    'BurstOfFlame': '火焰爆发',
    'InfernoOrb': '地狱球',
    'FlamingHands': '炽热之手',
    'FireBolt': '火焰枪',
    // STORM_MAGIC:
    'StormMastery': '风暴精通',
    'LightningBolt': '闪电箭',
    'StormAttunement': '风暴调和',
    'Shock': '电击',
    'ThunderClap': '雷霆一击',
    'StaticDischarge': '静电放电',
    // ICE_MAGIC:
    'ColdMastery': '冰系精通',
    'ColdAttunement': '冰系调和',
    'ConeOfCold': '冷锥',
    'FreezingCloud': '冻结云',
    'Freeze': '冻结',
    'IceArmor': '冰甲',
    'FlashFreeze': '急冻光线',
    // ENCHANTMENT_MAGIC:
    'Confusion': '困惑',
    'Fear': '恐惧',
    'Charm': '魅惑',
    'Mesmerize': '催眠',
    'Swiftness': '迅捷',
    // MELEE:
    'WeaponMastery': '近战精通',
    'PowerStrike': '强袭',
    'Charge': '冲刺',
    'Berserk': '狂暴',
    'BloodLust': '嗜血',
    'WarCry': '战争的呐喊',
    // RANGE:
    'RangeMastery': '远程精通',
    'PowerShot': '强弩',
    'TunnelShot': '量子穿透',
    'DeadEye': '死亡之眼',
    'PerfectAim': '完美瞄准',
    'Disengage': '以退为进',
    'Lunge': '死吻',
    // DEFENSE:
    'ShieldsUp': '盾反',
    'ShieldWall': '盾墙',
    'Deflect': '偏转',
    'Fortitude': '坚韧不拔',
    'Regeneration': '再生',
    'FireResistance': '火抗性',
    'ColdResistance': '冰抗性',
    'ShockResistance': '电抗性',
    'ToxicResistance': '毒抗性',
    // FOCUS:
    'MagicMastery': '法力精通',
    'Tranquility': '宁静',
    // STEALTH:
    'StealthMastery': '潜行精通',
    'SleepingDart': '沉睡飞镖',
    'SmokeBomb': '烟雾弹',
    'DungeonSense': '地牢感知',
    'NimbleFingers': '灵活手指',
    'Evade': '金蝉脱壳',
    'HeadShot': '刺客',
    'KeenHearing': '千里眼',
    // ATHLETICS:
    'Evasive': '回避',
    'Sprint': '短跑冠军',
    'StrafeAttack': '扫射攻击',
    'StoneSkin': '岩石皮肤',


    //天赋属性
    'damage': '伤害',
    'duration': '持续',
    'numTraps': '陷阱数量',
    'maxPath': '最远距离',
    'aoeRange': '范围',
    'coldPower': '冰系威力',
    'damageMultiplier': '伤害倍数',
    'range': '范围',
    'stormPower': '风暴系威力',
    'stunTurns': '眩晕回合',
    'firePower': '火系威力',
    'skeletonLevel': '骷髅怪等级',
    'toxicPower': '毒系威力',
}