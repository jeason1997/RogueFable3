/*global gs, console, game*/
/*global SCREEN_HEIGHT, SCALE_FACTOR, SMALL_WHITE_FONT, HUGE_WHITE_FONT, HUD_START_X*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// UI_HELP_MENU:
// ************************************************************************************************
function UIHelpMenu() {
	var width = 580,
        height = 540,
		startX = HUD_START_X / 2 - width / 2,
		startY = (SCREEN_HEIGHT - height) / 2,
		sprite,
		str = '';
	
	this.group = game.add.group();
	this.group.fixedToCamera = true;
		
	// Menu:
    sprite = gs.createSprite(startX, startY, 'SmallMenu', this.group);
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Title:
	this.titleText = gs.createText(startX + width / 2, startY + 20, '控制', HUGE_WHITE_FONT, this.group);
	gs.centerText(this.titleText);
	
	// Help String:
	str += "- 数字键可用于移动\n";
	str += "- 按住Shift键并单击图块可移至危险地形\n";
	str += "- 点击你到角色可以等待一回合\n";
	str += "- 按住Shift键并单击您的角色将进行长时间的休息\n";
	str += "- 空格键，Enter键，小键盘数字键5是用于单击自己的快捷键键\n";
	str += "- 1，2，3等数字键是使用能力的快捷键\n";
	str += "- [a] 切换键盘定位模式\n";
	str += "- [w] 快速切换当前武器和上一把武器\n";
	str += "- [tab] 自动攻击距离最近的敌人\n";
	str += "- [q] 用快速槽的武器自动攻击最近的敌人\n";
	str += "- [esc] 关闭菜单并取消使用能力或物品\n";
	str += "- [s] 上下楼梯\n";
	str += "- [>] 下楼梯或快速走到楼梯口\n";
	str += "- [<] 上楼梯或快速走到楼梯口\n";
	str += "- [e] 自动探索\n";
	
	// Text:
	let lines = gs.wrapText(str, 61);
	this.text = gs.createText(startX + 4, startY + 40, lines.join('\n'), SMALL_WHITE_FONT, this.group);
	
	// Close button:
	this.closeButton = gs.createTextButton(startX + width / 2, startY + 520, '关闭', this.close, this, this.group);
	
	this.group.visible = false;
}

// OPEN:
// ************************************************************************************************
UIHelpMenu.prototype.open = function () {
	gs.state = 'HELP_MENU_STATE';
	gs.timer.pause();
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
UIHelpMenu.prototype.close = function () {
	this.group.visible = false;
	gs.gameMenu.open();
};