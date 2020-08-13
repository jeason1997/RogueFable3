/*global game, gs, console*/
/*global PlayerCharacter*/
'use strict';

// CREATE_PLAYER_RACES:
// ************************************************************************************************
gs.createPlayerRaces = function () {
	this.playerRaces = {};
	
	// HUMAN:
	this.playerRaces.Human = {};
	this.playerRaces.Human.effect = function (character) {
		
	};
	this.playerRaces.Human.desc = function () {
		var str = '人类\n';
		str += '中等身材';
		return str;
	};
	
	// OGRE:
	this.playerRaces.Ogre = {};
	this.playerRaces.Ogre.effect = function (character) {
		character.strength += 3;
		character.intelligence -= 3;
		
		character.bonusMovementSpeed -= 1;
		character.size += 1;
	};
	this.playerRaces.Ogre.desc = function () {
		var str = '兽人\n';
		str += '高大身材\n';
		str += '+3 力量\n';
		str += '-3 智力\n';
		str += '移动速度慢（不能斜向移动）';
		
		return str;
	};
	
	// TROLL:
	this.playerRaces.Troll = {};
	this.playerRaces.Troll.effect = function (character) {
		character.bonusHpRegenTime += 5;
		character.intelligence -= 3;
		character.resistance.Fire -= 1;
	};
	this.playerRaces.Troll.desc = function () {
		var str = '巨魔\n';
		str += '中等身材\n';
		str += '-3 智力\n';
		str += '-50% 火焰抗性\n';
		str += '两倍的恢复速度';
		return str;
	};
	
	// MUMMY:
	this.playerRaces.Mummy = {};
	this.playerRaces.Mummy.effect = function (character) {
		character.resistance.Fire -= 1;
		character.resistance.Toxic += 1;
	};
	this.playerRaces.Mummy.desc = function () {
		var str = '木乃伊\n';
		str += '中等身材\n';
		str += '不会饥饿\n';
		str += '-50% 火焰抗性\n';
		str += '+50% 毒抗性\n';
		str += '不能吃药水或者食物';
		return str;
	};
	
	// ELF:
	this.playerRaces.Elf = {};
	this.playerRaces.Elf.effect = function (character) {
		character.dexterity += 3;
		character.strength -= 3;
	};
	this.playerRaces.Elf.desc = function () {
		var str = '精灵\n';
		str += '中等身材\n';
		str += '+3 敏捷\n';
		str += '-3 力量\n';
		str += '弓箭没有最小射程';
		return str;
	};
	
	// GNOME:
	this.playerRaces.Gnome = {};
	this.playerRaces.Gnome.effect = function (character) {
		character.intelligence += 3;
		character.strength -= 3;
		character.size -= 1;
	};
	this.playerRaces.Gnome.desc = function () {
		var str = '侏儒\n';
		str += '矮小身材\n';
		str += '+3 智力\n';
		str += '-3 力量';
		return str;
	};
	
	// GARGOYLE:
	this.playerRaces.Gargoyle = {};
	this.playerRaces.Gargoyle.effect = function (character) {
		character.isFlying += 1;
	};
	this.playerRaces.Gargoyle.desc = function () {
		var str = '石像鬼\n';
		str += '中等身材\n';
		str += '可以飞行\n';
		str += '生命值/法力值 不会自动恢复\n';
		str += '生命值/法力值 将在进入下一层时恢复';
		return str;
	};
	this.playerRaces.Gargoyle.talents = ['StoneSkin'];
	
	
	this.playerRaceList = [];
	this.forEachType(this.playerRaces, function (playerRace) {
		this.playerRaceList.push(playerRace);
	}, this);
	
	this.nameTypes(this.playerRaces);
};

// SET_RACE:
// ************************************************************************************************
PlayerCharacter.prototype.setRace = function (race) {
	this.race = race;
	
	if (this.race.talents) {
		this.addAvailableTalents(this.race.talents);
	}
};