/*global gs, localStorage, console, LZString*/
/*jshint esversion: 6*/
'use strict';

// GAME_RECORD:
// ************************************************************************************************
function GameRecord () {}

// LOAD_GAME_RECORDS:
// ************************************************************************************************
gs.loadGameRecords = function () {
	var data;
	
	if (localStorage.getItem('GameRecords')) {
		data = JSON.parse(localStorage.getItem('GameRecords'));
	}
	
	gs.gameRecords = [];
	
	if (data) {
		data.forEach(function (e) {
			gs.gameRecords.push(gs.loadGameRecord(e));
		}, this);
	}
	
	console.log('loading game records');
};

// LOG_GAME_RECORD:
// Call this to create a new game record:
// ************************************************************************************************
gs.logGameRecord = function (text, isWin) {
	var gameRecord = new GameRecord();
	
	gameRecord.date = Date.now();
	gameRecord.isChallenge = gs.isDailyChallenge;
	gameRecord.gameTime = gs.gameTime();
	gameRecord.zoneName = gs.capitalSplit(gs.zoneName);
	gameRecord.zoneLevel = gs.niceZoneLevel(gs.zoneName, gs.zoneLevel);
	gameRecord.playerClass = gs.pc.characterClass;
	gameRecord.playerRace = gs.pc.race.name;
	gameRecord.playerLevel = gs.pc.level;
	gameRecord.isWin = isWin;
	gameRecord.text = text;
	
	this.gameRecords.push(gameRecord);
	
	console.log('creating game record...');
	
	localStorage.setItem('GameRecords', JSON.stringify(this.gameRecords));
};

// LOAD_GAME_RECORD:
// ************************************************************************************************
gs.loadGameRecord = function (data) {
	var gameRecord = new GameRecord();
	
	gameRecord.date = data.date;
	gameRecord.isChallenge = data.isChallenge;
	gameRecord.gameTime = data.gameTime;
	gameRecord.zoneName = data.zoneName;
	gameRecord.zoneLevel = data.zoneLevel;
	gameRecord.playerClass = data.playerClass;
	gameRecord.playerRace = data.playerRace;
	gameRecord.playerLevel = data.playerLevel;
	gameRecord.isWin = data.isWin;
	gameRecord.text = data.text || "";
	
	return gameRecord;
};



// TO_STRING:
// ************************************************************************************************
GameRecord.prototype.toString = function () {
	var str = '', date;
	
	// Date Title:
	date = new Date(this.date);
	str += date.toDateString();
	if (this.isChallenge) {
		str += ' - 每日挑战';
	}
	str += ':\n';
	
	
	str += this.playerLevel + '级的';
	str += translator.getText(this.playerClass);
	
	
	if (this.isWin) {
		str += '成功取回酒杯。';
	}
	else if (this.text && this.text.length > 0) {
	str += '在' + translator.getText(this.zoneName) + this.zoneLevel + '层' + this.text + '。';
	}
	else {
		str += '在' + translator.getText(this.zoneName) + this.zoneLevel + '层被杀死了。';
	}

	str += ' 耗时: ' + gs.timeToString(this.gameTime) + '';
	
	return str;
};
