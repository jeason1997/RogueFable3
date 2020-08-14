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
	'Rogue': '流氓',
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
    'Fire Shroom': '火蘑菇',

    //天赋
    'FireBall': '火球',
    'Fire Ball': '火球',

    //天赋属性
    'damage': '伤害',
    'duration': '持续',
    'numTraps': '',
    'maxPath': '',
    'aoeRange': '',
    'coldPower': '',
    'damageMultiplier': '',
    'range': '范围',
    'stormPower': '',
    'stunTurns': '',
    'firePower': '',
    'skeletonLevel': '',
    'toxicPower': '',
}