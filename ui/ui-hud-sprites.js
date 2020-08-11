/*global game, gs, console, util*/
/*global NUM_DAMAGE_TEXT_SPRITES, LARGE_RED_FONT, SCALE_FACTOR, TILE_SIZE, FONT_NAME*/
/*global GREEN_TARGET_BOX_FRAME, RED_SELECT_BOX_FRAME, PURPLE_SELECT_BOX_FRAME, RED_TARGET_BOX_FRAME, X_FRAME*/
/*global FACTION*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CREATE_HUD_SPRITES:
// ************************************************************************************************
gs.createHUDSprites = function () {
    var i;
    
	// DAMAGE TEXT SPRITES:
    // ******************************************************************************************
    this.damageTextSprites = [];
    for (i = 0; i < NUM_DAMAGE_TEXT_SPRITES; i += 1) {
        this.damageTextSprites.push(this.createText(608, 340, '', LARGE_RED_FONT, this.popUpTextSpritesGroup));
        this.damageTextSprites[i].visible = false;
        this.damageTextSprites[i].isAlive = false;
    }
	
	// Mouse Cursor Sprite:
	this.cursorTileIndex = {x: 0, y: 0};
    this.cursorSprite = this.createSprite(0, 0, 'Tileset', this.hudTileSpritesGroup);
	this.cursorSprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
    this.cursorSprite.frame = GREEN_TARGET_BOX_FRAME;
	this.cursorSprite.visible = false;
    
	// Targeting Sprite:
    this.targetSprites = [];
    for (i = 0; i < 30; i += 1) {
        this.targetSprites[i] = this.createSprite(0, 0, 'Tileset', this.hudTileSpritesGroup);
		this.targetSprites[i].scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
        this.targetSprites[i].frame = RED_SELECT_BOX_FRAME;
		this.targetSprites[i].visible = false;
    }
	
	// Targeting Line Sprite:
	this.targetLineSprites = [];
	for (i = 0; i < 50; i += 1) {
		this.targetLineSprites[i] = this.createSprite(0, 0, 'Tileset', this.hudTileSpritesGroup);
		this.targetLineSprites[i].anchor.setTo(0.5, 0.5);
		this.targetLineSprites[i].scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
		this.targetLineSprites[i].frame = X_FRAME;
		this.targetLineSprites[i].visible = false;
	}
};


// UPDATE_HUD_TILE_SPRITES:
// ************************************************************************************************
gs.updateHUDTileSprites = function () {
    var i,
        isNPCTargeted,
        showAxeTarget,
        showSingleTarget,
        showMultiTarget,
        showBoltTarget;
    
    // IS NPC TARGETED:
    // ********************************************************************************************
    isNPCTargeted = function () {
        var tile = gs.getTile(gs.cursorTileIndex);
    
		return gs.isInBounds(gs.cursorTileIndex)
			&& tile.character !== null
			&& tile.character !== this
			&& gs.pc.canSeeCharacter(tile.character)
			&& tile.character.isAlive
			&& tile.character.faction === FACTION.HOSTILE;
    };
    
    // Hide all target sprites:
    for (i = 0; i < 30; i += 1) {
        this.targetSprites[i].visible = false;
    }
	
	// Hide all target line sprites:
	for (i = 0; i < 50; i += 1) {
		this.targetLineSprites[i].visible = false;
	}
	
	// Position the cursor at the tile index of the pointer:
	if (!this.keyBoardMode) {
		this.cursorTileIndex.x = this.pointerTileIndex().x;
		this.cursorTileIndex.y = this.pointerTileIndex().y;
	}
	
	// Position the cursor sprite under the pointer:
	this.cursorSprite.x = this.cursorTileIndex.x * TILE_SIZE;
	this.cursorSprite.y = this.cursorTileIndex.y * TILE_SIZE;
	this.cursorSprite.visible = true;
	
	// If we are in game:
    if ((this.state === 'GAME_STATE' || this.state === 'USE_ABILITY_STATE') && (gs.isPointerInWorld() || this.keyBoardMode)) {
		// USING AN ABILITY:
		if (this.state === 'USE_ABILITY_STATE') {
			this.cursorSprite.visible = false;
			this.pc.selectedAbility.type.showTarget(this.cursorTileIndex);
		}
		// ATTACKING MELEE:
		else if (this.pc.weaponSkill() === 'Melee' && this.pc.canAttack(this.cursorTileIndex)) {
			this.pc.inventory.getWeapon().type.attackEffect.showTarget(this.cursorTileIndex, this.pc.inventory.getWeapon());
        }
		// ATTACKING RANGED:
		else if (this.pc.weaponSkill() === 'Range' && (isNPCTargeted() || this.pc.canAttack(this.cursorTileIndex))) {
			this.pc.inventory.getWeapon().type.attackEffect.showTarget(this.cursorTileIndex, this.pc.inventory.getWeapon());
        }
		// MOVING:
		else if (this.isInBounds(this.cursorTileIndex)
				   && ((this.getTile(this.cursorTileIndex).explored && this.isPassable(this.cursorTileIndex))
				   || this.getChar(this.cursorTileIndex)
				   || this.getObj(this.cursorTileIndex, obj => obj.type.interactFunc))) {
			this.cursorSprite.visible = true;
			this.cursorSprite.frame = GREEN_TARGET_BOX_FRAME;
        } else {
            this.cursorSprite.visible = false;
        }
    } 
	else {
		this.cursorSprite.visible = false;
	}
	
	// Mouse over abilities:
	if (gs.HUD.abilityBar.getAbilityUnderPointer() &&
		gs.HUD.abilityBar.getAbilityUnderPointer().type.useImmediately &&
	    gs.HUD.abilityBar.getAbilityUnderPointer().type.showTarget) {
		gs.HUD.abilityBar.getAbilityUnderPointer().type.showTarget(gs.pc);
	}
	
	// Mouse over consumable:
	if (gs.HUD.consumableList.getItemUnderPointer()
		&& gs.HUD.consumableList.getItemUnderPointer().type.useEffect
	   	&& gs.HUD.consumableList.getItemUnderPointer().type.useEffect.showTarget) {
		
		gs.HUD.consumableList.getItemUnderPointer().type.useEffect.showTarget(gs.pc);
	}
};

// CREATE_POP_UP_TEXT:
// ************************************************************************************************
gs.createPopUpText = function (tileIndex, text, color = '#ffffff') {
	var pos = util.toPosition(tileIndex);
	pos.y -= 12;
	this.createPopUpTextAtPos(pos.x, pos.y, text, color);
};

// CREATE_POP_UP_TEXT_AT_POS:
// ************************************************************************************************
gs.createPopUpTextAtPos = function (x, y, text, color = '#ffffff') {
	for (let i = 0; i < NUM_DAMAGE_TEXT_SPRITES; i += 1) {
        if (!this.damageTextSprites[i].isAlive) {
            this.damageTextSprites[i].x = x;
    		this.damageTextSprites[i].y = y;
            this.damageTextSprites[i].setText(text);
            this.damageTextSprites[i].setStyle({font: '18px ' + FONT_NAME, fill: color, stroke: '#000000', strokeThickness: 4});
			this.initPopUpText(this.damageTextSprites[i]);
			this.centerText(this.damageTextSprites[i]);
			this.popUpTextSpritesGroup.bringToTop(this.damageTextSprites[i]);
            return this.damageTextSprites[i];
        }
    }
};

// Use this to start the texts movement
// Can be called again to pop text even higher
gs.initPopUpText = function (text) {
	
	text.life = 70;
	text.isAlive = true;
	text.visible = true;
	text.alpha = 1.0;
};

// UPDATE_DAMAGE_TEXT:
// ************************************************************************************************
gs.updateDamageText = function () {
    var i;
    
    for (i = 0; i < NUM_DAMAGE_TEXT_SPRITES; i += 1) {
        // Disapear:
        if (this.damageTextSprites[i].life === 0) {
            this.damageTextSprites[i].isAlive = false;
            this.damageTextSprites[i].visible = false;
        
		// Pause and fade:
        } else if (this.damageTextSprites[i].life < 20) {
            this.damageTextSprites[i].life -= 1;
        
		// Pause:
        } else if (this.damageTextSprites[i].life < 60) {
            this.damageTextSprites[i].life -= 1;
        
        // Move upwards:
        } else {
            this.damageTextSprites[i].life -= 1;
            this.damageTextSprites[i].y -= 1;
        }
    }
};

// SHOW_TARGET_LINE:
// ************************************************************************************************
gs.showTargetLine = function (tileIndex) {
	var x,
		y,
		stepSize = 20,
		distance = 0,
		finalDistance,
		normal,
		i = 0,
		j = 0;

	x = util.toPosition(gs.pc.tileIndex).x;
	y = util.toPosition(gs.pc.tileIndex).y;
	finalDistance = util.distance({x: x, y: y}, util.toPosition(tileIndex));
	normal = util.normal({x: x, y: y}, util.toPosition(tileIndex));

	while (distance < finalDistance - stepSize) {
		x += normal.x * stepSize;
		y += normal.y * stepSize;
		distance += stepSize;

		gs.targetLineSprites[i].x = x;
		gs.targetLineSprites[i].y = y;
		gs.targetLineSprites[i].visible = true;

		while (gs.targetLineSprites[i].visible) {
			i += 1;
		}
	}
};

