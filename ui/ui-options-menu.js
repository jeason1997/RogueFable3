/*global game, gs, console, nw, window*/
/*global LARGE_WHITE_FONT, HUGE_WHITE_FONT, SCALE_FACTOR, HEALTH_BAR_FRAME*/
/*global HUD_START_X, SCREEN_HEIGHT*/
/*jshint esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIOptionsMenu() {
	var width = 580,
        height = 540,
		startX = HUD_START_X / 2 - width / 2,
		startY = (SCREEN_HEIGHT - height) / 2,
		sprite;
	
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	sprite = gs.createSprite(startX, startY, 'SmallMenu', this.group);
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Title Text:
	this.titleText = gs.createText(startX + width / 2, startY + 20, '游戏设置', HUGE_WHITE_FONT, this.group);
	gs.centerText(this.titleText);
	
	// Sound:
	this.soundVolumeSlider = gs.createBar(startX + 6, startY + 50, HEALTH_BAR_FRAME, this.group);
	
	// Music:
	this.musicVolumeSlider = gs.createBar(startX + 6, startY + 80, HEALTH_BAR_FRAME, this.group);
	
	// Full Screen:
	this.fullScreenButton = gs.createTextButton(startX + 100 + 6, startY + 124, '切换全屏', this.onFullScreenClicked, this, this.group);
	
	// Close button:
	this.closeButton = gs.createTextButton(startX + width / 2, startY + height - 20, '关闭', this.close, this, this.group);
	
	
	this.group.visible = false;
}

// UPDATE:
// ************************************************************************************************
UIOptionsMenu.prototype.update = function () {
	// Sound Volume:
	if (this.soundVolumeSlider.isPointerOver() && game.input.activePointer.isDown) {
		let percent = (game.input.activePointer.x - this.soundVolumeSlider.frame.x) / this.soundVolumeSlider.frame.width,
			prevPercent = gs.soundVolume;
		percent = Math.round(percent * 10) / 10;
		
		
		
		gs.soundVolume = percent;
		
		if (gs.soundVolume !== prevPercent) {
			gs.playSound(gs.sounds.melee);
		}
		
		this.refresh();
	}
	
	if (this.musicVolumeSlider.isPointerOver() && game.input.activePointer.isDown) {
		let percent = (game.input.activePointer.x - this.musicVolumeSlider.frame.x) / this.musicVolumeSlider.frame.width;
		percent = Math.round(percent * 10) / 10;
		gs.musicVolume = percent;
		gs.setMusicVolume(gs.musicVolume);
		this.refresh();
	}
};

// REFRESH:
// ************************************************************************************************
UIOptionsMenu.prototype.refresh = function () {
	// Sound Slider:
	this.soundVolumeSlider.setPercent(gs.soundVolume);
	this.soundVolumeSlider.setText('音效: ' + gs.toPercentStr(gs.soundVolume));
	
	// Music Slider:
	this.musicVolumeSlider.setPercent(gs.musicVolume);
	this.musicVolumeSlider.setText('音乐: ' + gs.toPercentStr(gs.musicVolume));
};

// OPEN:
// ************************************************************************************************
UIOptionsMenu.prototype.open = function () {
	this.refresh();
	gs.timer.pause();
	gs.state = 'OPTIONS_MENU_STATE';
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
UIOptionsMenu.prototype.close = function () {
	gs.saveGlobalData();
	
	// Game:
	if (gs.globalState === 'GAME_STATE') {
		gs.gameMenu.open();
	}
	// Main Menu:
	else {
		gs.state = 'MAIN_MENU_STATE';
	}
	
	this.group.visible = false;
};

// IS_OPEN:
// ************************************************************************************************
UIOptionsMenu.prototype.isOpen = function () {
	return this.group.visible;
};

// ON_FULL_SCREEN_CLICKED:
// ************************************************************************************************
UIOptionsMenu.prototype.onFullScreenClicked = function () {
	if (gs.fullScreen) {
		gs.fullScreen = false;
		//nw.Window.get().leaveFullscreen();
	}
	else {
		gs.fullScreen = true;
		//nw.Window.get().enterFullscreen();
	}
};