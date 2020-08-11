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
		var str = 'Human\n';
		str += 'Medium Size';
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
		var str = 'Ogre\n';
		str += 'Large Size\n';
		str += '+3 Strength\n';
		str += '-3 Intelligence\n';
		str += 'Slow Movement speed (cannot move diagonally)';
		
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
		var str = 'Troll\n';
		str += 'Medium Size\n';
		str += '-3 Intelligence\n';
		str += '-50% Fire Resistance\n';
		str += 'Double regen speed';
		return str;
	};
	
	// MUMMY:
	this.playerRaces.Mummy = {};
	this.playerRaces.Mummy.effect = function (character) {
		character.resistance.Fire -= 1;
		character.resistance.Toxic += 1;
	};
	this.playerRaces.Mummy.desc = function () {
		var str = 'Mummy\n';
		str += 'Medium Size\n';
		str += 'No hunger\n';
		str += '-50% Fire Resistance\n';
		str += '+50% Toxic Resistance\n';
		str += 'Cannot consume potions or food';
		return str;
	};
	
	// ELF:
	this.playerRaces.Elf = {};
	this.playerRaces.Elf.effect = function (character) {
		character.dexterity += 3;
		character.strength -= 3;
	};
	this.playerRaces.Elf.desc = function () {
		var str = 'Elf\n';
		str += 'Medium Size\n';
		str += '+3 Dexterity\n';
		str += '-3 Strength\n';
		str += 'No min range for bows';
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
		var str = 'Gnome\n';
		str += 'Small Size\n';
		str += '+3 Intelligence\n';
		str += '-3 Strength';
		return str;
	};
	
	// GARGOYLE:
	this.playerRaces.Gargoyle = {};
	this.playerRaces.Gargoyle.effect = function (character) {
		character.isFlying += 1;
	};
	this.playerRaces.Gargoyle.desc = function () {
		var str = 'Gargoyle\n';
		str += 'Medium Size\n';
		str += 'Flying\n';
		str += 'No HP/MP regen\n';
		str += 'HP/MP will be restored when descending to a new level.';
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