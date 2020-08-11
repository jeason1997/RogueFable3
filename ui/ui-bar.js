/*global gs, game, console*/
/*global SCALE_FACTOR, LARGE_BOLD_WHITE_FONT*/
'use strict';

// CREATE_BAR:
// ************************************************************************************************
gs.createBar = function (x, y, frame, group) {
	var bar = new UIBar(x, y, frame);
	
	if (group) {
		group.add(bar.group);
	}
	
	return bar;
};

// BAR_CONSTRUCTOR:
// ************************************************************************************************
function UIBar (x, y, frame) {
	this.group = game.add.group();
	
	
	// The bar outline:
	this.frame = gs.createSprite(x, y, 'Bar', this.group);
	this.frame.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.frame.inputEnabled = true;
	
	// The actual slider bar:
	this.bar = gs.createSprite(x + SCALE_FACTOR, y + SCALE_FACTOR, 'Tileset', this.group);
	this.bar.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.bar.frame = frame;
	
	
	// The text:
	this.text = gs.createText(x + this.frame.width / 2, y + 14, '', LARGE_BOLD_WHITE_FONT, this.group);
	this.text.anchor.setTo(0.5, 0.5);
}

// SET_PERCENT:
// ************************************************************************************************
UIBar.prototype.setPercent = function (percent) {
	if (percent === 0) {
		this.bar.visible = false;
	}
	else {
		this.bar.visible = true;
		this.bar.scale.setTo(Math.max(0, percent * 62 * SCALE_FACTOR), SCALE_FACTOR);
	}
};

// SET_TEXT:
// ************************************************************************************************
UIBar.prototype.setText = function (str) {
	this.text.setText(str);
};

// IS_POINTER_OVER:
// ************************************************************************************************
UIBar.prototype.isPointerOver = function () {
	return this.frame.input.checkPointerOver(game.input.activePointer);
};