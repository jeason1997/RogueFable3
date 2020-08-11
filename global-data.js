/*global gs, localStorage*/
'use strict';

// LOAD_GLOBAL_DATA:
// ************************************************************************************************
gs.loadGlobalData = function () {
	// Achievements:
	gs.achievements = JSON.parse(localStorage.getItem('Achievements'));
	
	// First time creating achievements:
	// Achivements stores the fastest time the player has completed the game.
	// If an achievement is equal to 0 it means the player never won the game with that class.
	if (!gs.achievements) {
		gs.achievements = {};
	}
	
	// Fill missing achievements:
	if (!gs.achievements.hasOwnProperty('Warrior')) 	gs.achievements.Warrior = 0;
	if (!gs.achievements.hasOwnProperty('Barbarian')) 	gs.achievements.Barbarian = 0;
	if (!gs.achievements.hasOwnProperty('Ranger')) 		gs.achievements.Ranger = 0;
	if (!gs.achievements.hasOwnProperty('Rogue')) 		gs.achievements.Rogue = 0;
	if (!gs.achievements.hasOwnProperty('FireMage')) 	gs.achievements.FireMage = 0;
	if (!gs.achievements.hasOwnProperty('StormMage')) 	gs.achievements.StormMage = 0;
	if (!gs.achievements.hasOwnProperty('IceMage')) 	gs.achievements.IceMage = 0;
	if (!gs.achievements.hasOwnProperty('Necromancer')) gs.achievements.Necromancer = 0;
	if (!gs.achievements.hasOwnProperty('Enchanter')) 	gs.achievements.Enchanter = 0;
	if (!gs.achievements.hasOwnProperty('Duelist')) 	gs.achievements.Duelist = 0;
	
	
	
	// globalData (globalData)
	gs.globalData = JSON.parse(localStorage.getItem('globalData'));
	
	if (!gs.globalData) {
		gs.globalData = {};
	}
	
	// Fill missing globalData:
	if (!gs.globalData.hasOwnProperty('items')) 		gs.globalData.items = false;
	if (!gs.globalData.hasOwnProperty('skills')) 		gs.globalData.skills = false;
	if (!gs.globalData.hasOwnProperty('books')) 		gs.globalData.books = false;
	if (!gs.globalData.hasOwnProperty('stairs')) 		gs.globalData.stairs = false;
	if (!gs.globalData.hasOwnProperty('rest')) 			gs.globalData.rest = false;
	if (!gs.globalData.hasOwnProperty('unsafeMove')) 	gs.globalData.unsafeMove = false;
	if (!gs.globalData.hasOwnProperty('musicOn')) 		gs.globalData.musicOn = true;
	if (!gs.globalData.hasOwnProperty('soundOn')) 		gs.globalData.soundOn = true;
	if (!gs.globalData.hasOwnProperty('userName')) 		gs.globalData.userName = "";
	if (!gs.globalData.hasOwnProperty('musicVolume')) 	gs.globalData.musicVolume = 0.5;
	if (!gs.globalData.hasOwnProperty('soundVolume')) 	gs.globalData.soundVolume = 0.5;
	if (!gs.globalData.hasOwnProperty('fullScreen')) 	gs.globalData.fullScreen = false;
	
	
	if (!gs.globalData.userName) {
		gs.globalData.userName = "";
	}
	
	if (!gs.achievements.lastChallenge) {
		gs.achievements.lastChallenge = null;
	}
	
	// Game Records:
	gs.loadGameRecords();
};

// SAVE_GLOBAL_DATA:
// ************************************************************************************************
gs.saveGlobalData = function () {
	gs.globalData.soundOn = gs.soundOn;
	gs.globalData.musicOn = gs.musicOn;
	gs.globalData.soundVolume = gs.soundVolume;
	gs.globalData.musicVolume = gs.musicVolume;
	gs.globalData.fullScreen = gs.fullScreen;
	
	localStorage.setItem('globalData', JSON.stringify(gs.globalData));
};