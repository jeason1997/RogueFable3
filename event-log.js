/*global gs, console*/
'use strict';

gs.logDungeonLevel = function () {
	var str = '';
	
	if (gs.zoneName === 'TheUpperDungeon' && gs.zoneLevel === 1) {
		return;
	}
	
	str += 'Entered: ' + gs.zoneName + '[' + gs.zoneLevel + '] ';
	str += 'Time: ' + gs.timeToString(gs.gameTime()) + ', ';
	str += 'Turn: ' + gs.turn;
	this.eventLog.push(str);
};

gs.logExperienceLevel = function () {
	var str = '';
	
	str += 'Gained XL: ' + gs.pc.level + ' ';
	str += 'Time: ' + gs.timeToString(gs.gameTime()) + ', ';
	str += 'Turn: ' + gs.turn;
	this.eventLog.push(str);
};

gs.logCriticalMoment = function () {
	var str = '';
	
	str += 'Critical Moment: ';
	str += 'Time: ' + gs.timeToString(gs.gameTime()) + ', ';
	str += 'Turn: ' + gs.turn;
	this.eventLog.push(str);
};

gs.printEventLog = function () {
	var str = '';
	
	this.eventLog.forEach(function (event) {
		str += event + '\n';
	}, this);
	
	console.log(str);
};