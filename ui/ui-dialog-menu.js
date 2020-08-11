/*global game, gs, console*/
/*global FONT_NAME, LARGE_WHITE_FONT, SCALE_FACTOR, HUD_START_X*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';


// CREATE_TEXT_BOX:
// **********************************************************************************
gs.createTextBox = function (position, numLines, group) {
    var textBox = {},
        i,
        sprite;
    
    // Group:
    textBox.group = game.add.group();
	
	if (group) {
		group.add(textBox.group);
	}
	
	
	// Create panel:
	sprite = gs.createSprite(position.x, position.y, 'TextBox', textBox.group);
	sprite.frame = 0;
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	sprite = gs.createSprite(position.x, position.y + 16, 'TextBox', textBox.group);
	sprite.frame = 1;
	sprite.scale.setTo(SCALE_FACTOR, (numLines - 2) * SCALE_FACTOR);
	
	sprite = gs.createSprite(position.x, position.y + (numLines - 1) * 16, 'TextBox', textBox.group);
	sprite.frame = 2;
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Create text:
	textBox.text = gs.createText(position.x + 8, position.y + 4, 'Default Text', LARGE_WHITE_FONT, textBox.group);
	
	
    textBox.setText = function (text) {
        var i, textArray, textSum = '';
		textArray = gs.wrapText(text, 43);
		
		for (i = 0; i < textArray.length; i += 1) {
			textSum += textArray[i] + '\n';
		}
		
		this.text.setText(textSum);
    };

    return textBox;
};


// UI_RESPONSE_BUTTON:
// *****************************************************************************
function UIResponseButton(x, y, callBack, context, group) {
	var i,
        sprite;
	
	this.group = game.add.group();
	group.add(this.group);
	
	this.x = x;
	this.y = y;
	this.callBack = callBack;
    this.context = context;
	
	// Create panel:
	this.boxTop = gs.createButton(x, y, 'TextBox', this.clicked, this, this.group);
	this.boxTop.frame = 0;
	this.boxTop.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	this.boxMid = gs.createButton(x, y + 16, 'TextBox', this.clicked, this, this.group);
	this.boxMid.frame = 1;
	this.boxMid.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	this.boxBottom = gs.createButton(x, y + 32, 'TextBox', this.clicked, this, this.group);
	this.boxBottom.frame = 2;
	this.boxBottom.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Create text:
	this.text = gs.createText(x + 8, y + 6, 'Default Text', LARGE_WHITE_FONT, this.group);
}

// SET_TEXT:
// *****************************************************************************
UIResponseButton.prototype.setText = function (text, y) {
	var i,
		textArray,
		textSum = '';
	
	this.y = y;
	
	// Text:
	textArray = gs.wrapText(text, 44);
	for (i = 0; i < textArray.length; i += 1) {
		textSum += textArray[i] + '\n';
	}
	this.text.setText(textSum);
	this.text.y = this.y + 6;
	
	// Box:
	this.numLines = textArray.length;
	this.boxTop.y = this.y;
	this.boxMid.y = this.y + 16;
	this.boxMid.scale.setTo(SCALE_FACTOR, (this.numLines - 1) * SCALE_FACTOR);
	this.boxBottom.y = this.y + this.numLines * 16;
	
};

// CLICKED:
// *****************************************************************************
UIResponseButton.prototype.clicked = function () {
	this.callBack.call(this.context, this);
};

UIResponseButton.prototype.isPointerOver = function () {
	return this.group.visible &&
		(this.boxTop.input.checkPointerOver(game.input.activePointer)
		|| this.boxMid.input.checkPointerOver(game.input.activePointer)
		|| this.boxBottom.input.checkPointerOver(game.input.activePointer));
};

// UI_DIALOG_MENU:
// *****************************************************************************
function UIDialogMenu() {
	var width = 480,
        height = 520,
		sprite,
		text,
		numLines = 9,
		startX = HUD_START_X / 2 - width / 2,
		startY = 370;
		 
    // Group:
    this.group = game.add.group();
    this.group.fixedToCamera = true;
    
	// Text Box:
    this.textBox = gs.createTextBox({x: startX + 20, y: startY + 20}, numLines); // 14 lines
    this.group.add(this.textBox.group);

	// Response Buttons:
	this.responseButtonsStartY = startY + numLines * 18 + 6;
	this.buttons = [];
	this.buttons[0] = new UIResponseButton(startX + 20, startY + 258, this.buttonClicked, this, this.group);
	this.buttons[1] = new UIResponseButton(startX + 20, startY + 358, this.buttonClicked, this, this.group);
	this.buttons[2] = new UIResponseButton(startX + 20, startY + 378, this.buttonClicked, this, this.group);
	this.buttons[3] = new UIResponseButton(startX + 20, startY + 438, this.buttonClicked, this, this.group);
	this.buttons[4] = new UIResponseButton(startX + 20, startY + 598, this.buttonClicked, this, this.group);
	
	this.buttons[0].index = 0;
	this.buttons[1].index = 1;
	this.buttons[2].index = 2;
	this.buttons[3].index = 3;
	this.buttons[4].index = 4;

	this.group.visible = false;
}

// SET_TITLE:
// ********************************
UIDialogMenu.prototype.setTitle = function (text) {
	//this.titleText.setText(text);
};

// SET_TEXT:
// ********************************
UIDialogMenu.prototype.setText = function (text) {
	this.textBox.setText(text);
};

// OPEN:
// ********************************
UIDialogMenu.prototype.open = function (dialog) {
	var lineIndex = 0;
	
	if (gs.pc) {
		gs.pc.statusEffects.onOpenDialog();
	}
	

	if (dialog) {
		this.setTitle('');
		this.setDialog(dialog[0]);
		
		// this.dialog is refering to the dialog from menus:
		this.dialog = dialog;
		
	} else {
		this.setTitle(gs.dialogNPC.name);

		// NPC Has Dialog:
		if (gs.dialog[gs.dialogNPC.name]) {
			// Has an init function:
			if (gs.dialogInit[gs.dialogNPC.name]) {
				this.setDialog(gs.dialog[gs.dialogNPC.name][gs.dialogInit[gs.dialogNPC.name]()]);

			// Does not have an init function:
			} else {
				this.setDialog(gs.dialog[gs.dialogNPC.name][0]);
			}

		// NPC Has No Dialog:
		} else {
			this.setDialog(gs.dialog.Default[0]);
		}
	}

	gs.state = 'DIALOG_MENU_STATE';
	this.group.visible = true;
};

// CLOSE:
// ********************************
UIDialogMenu.prototype.close = function () {
	gs.state = 'GAME_STATE';
	this.dialog = null;
	this.group.visible = false;
};

// SET_DIALOG:
// ************************************************************************************************
UIDialogMenu.prototype.setDialog = function (dialog) {
	var MAX_RESPONSES = 5,
		i,
		responseButtonIndex = 0,
		buttonY = this.responseButtonsStartY;

	if (!dialog) {
		throw 'No Dialog (did you forget a default in the init function?';
	}
	
	if (!dialog.text) {
		throw 'DialogError: Missing text list, did you spell it wrong AGAIN?';
	}
	
	
	
	this.currentDialog = dialog;
	
	// Setting Text:
	if (typeof dialog.text === 'function') {
		this.setText(dialog.text());
	}
	else {	
		this.setText(dialog.text);
	}

	for (i = 0; i < MAX_RESPONSES; i += 1) {
		this.buttons[i].group.visible = false;
	}

	if (!dialog.responses) {
		throw 'DialogError: Missing responses list, did you spell it wrong AGAIN?';
	}

	// Set Dialog Responses:
	for (i = 0; i < MAX_RESPONSES; i += 1) {
		if (i < dialog.responses.length && (!dialog.responses[i].prereq || dialog.responses[i].prereq())) {
			this.buttons[responseButtonIndex].group.visible = true;
			// Setting Text:
			if (typeof dialog.responses[i].text === 'function') {
				this.buttons[responseButtonIndex].setText(dialog.responses[i].text(), buttonY);
			}
			else {	
				this.buttons[responseButtonIndex].setText(dialog.responses[i].text, buttonY);
			}
			
			this.buttons[responseButtonIndex].index = i;
			
			if (dialog.responses[i].desc) {
				this.buttons[responseButtonIndex].desc = dialog.responses[i].desc;
			}
			else {
				this.buttons[responseButtonIndex].desc = null;
			}
			
			buttonY += (this.buttons[responseButtonIndex].numLines + 1) * 16 + 4;
			
			responseButtonIndex += 1;
		}
	}

	// Apply dialog function (if it exists):
	if (dialog.func) {
		dialog.func();
	}
};


// BUTTON_CLICKED:
// ********************************
UIDialogMenu.prototype.buttonClicked = function (button) {
	if (this.currentDialog.responses.length <= button.index) {
		return;
	}
	
	if (this.currentDialog.responses[button.index].prereq && !this.currentDialog.responses[button.index].prereq()) {
		return;
	}
	
	// Exiting:
	if (this.currentDialog.responses[button.index].nextLine === 'exit') {
		this.close();
	}
	// Opening Shop:
	else if (this.currentDialog.responses[button.index].nextLine === 'barter') {
		this.close();
		gs.shopMenu.open();
	}
	// Different Line:
	else {
		// Dialog from menus:
		if (this.dialog) {
			this.setDialog(this.dialog[this.currentDialog.responses[button.index].nextLine]);
		} 
		// Dialog from npcs:
		else {
			this.setDialog(gs.dialog[gs.dialogNPC.name][this.currentDialog.responses[button.index].nextLine]);
		}
	}
	
	// Call a function on a response
	if (this.currentDialog.responses[button.index].func) {
		this.currentDialog.responses[button.index].func();
	}
};

UIDialogMenu.prototype.getDescUnderPointer = function () {
	for (let i = 0; i < this.buttons.length; i += 1) {
		if (this.buttons[i].isPointerOver() && this.buttons[i].desc) {
			return this.buttons[i].desc;
		}
	}
	
	return null;
};