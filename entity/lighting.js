/*global game, gs, console, util, PIXI*/
/*global TILE_SIZE, SCALE_FACTOR*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_SUMMON_EFFECT:
// ************************************************************************************************
gs.createSummonEffect = function (tileIndex, callBack, context) {
	var effect, position = util.toPosition(tileIndex), callBackWrap;
	
	if (!gs.getTile(tileIndex).visible) {
		callBack.call(context);
		return;
	}
	
	callBackWrap = function () {
		callBack.call(context);
		
		// Light:
		gs.createLightCircle({x: position.x, y: position.y + 10}, '#94fdff', 120, 60, '66');
	};
			
	// Anim Effect:
	effect = gs.createAnimEffect({x: position.x, y: position.y + 5}, 'SummonCircle');
	gs.createAnimEffect({x: position.x, y: position.y + 5}, 'SummonParticles');
			
	// Call Back:		
	effect.setOnFrame(5, callBackWrap, context);
	
	
};

// CREATING_HEALING_EFFECT:
// ************************************************************************************************
gs.createHealingEffect = function (tileIndex) {
	var pos = util.toPosition(tileIndex);
	
	if (!gs.getTile(tileIndex).visible) {
		return;
	}
	
	gs.createAnimEffect({x: pos.x, y: pos.y + 15}, 'HealingCircle');
	gs.createAnimEffect({x: pos.x, y: pos.y + 15}, 'HealingParticles');
	
	// Light:
	gs.createLightCircle({x: pos.x, y: pos.y + 10}, '#00ff00', 120, 50, '88');
};

// CREATING_MANA_EFFECT:
// ************************************************************************************************
gs.createManaEffect = function (tileIndex) {
	var pos = util.toPosition(tileIndex);
	
	if (!gs.getTile(tileIndex).visible) {
		return;
	}
	
	gs.createAnimEffect({x: pos.x, y: pos.y + 15}, 'ManaCircle');
	gs.createAnimEffect({x: pos.x, y: pos.y + 15}, 'ManaParticles');
	
	// Light:
	gs.createLightCircle({x: pos.x, y: pos.y + 10}, '#ff00ff', 120, 50, '88');
};

// CREATING_EXP_EFFECT:
// ************************************************************************************************
gs.createEXPEffect = function (tileIndex) {
	var pos = util.toPosition(tileIndex);
	
	if (!gs.getTile(tileIndex).visible) {
		return;
	}
	
	// Effects:
	gs.createAnimEffect({x: pos.x, y: pos.y + 40}, 'EXPCircle');
	gs.createAnimEffect({x: pos.x, y: pos.y + 10}, 'EXPParticles');
	
	// Light:
	gs.createLightCircle({x: pos.x, y: pos.y + 10}, '#ffff00', 120, 90, '66');
};

// CREATE_DISEASE_EFFECT:
// ************************************************************************************************
gs.createDiseaseEffect = function (tileIndex) {
	var pos = util.toPosition(tileIndex);
	
	if (!gs.getTile(tileIndex).visible) {
		return;
	}
	
	// Effects:
	gs.createAnimEffect({x: pos.x, y: pos.y}, 'DiseaseParticles');
};

// CREATE_FIRE_EFFECT:
// ************************************************************************************************
gs.createFireEffect = function (tileIndex) {
	var pos = util.toPosition(tileIndex);
	
	if (!gs.getTile(tileIndex).visible) {
		return;
	}
	
	// Effects:
	gs.createAnimEffect({x: pos.x, y: pos.y + 15}, 'FireCircle');
	gs.createAnimEffect({x: pos.x, y: pos.y + 15}, 'FireParticles');
	
	// Light:
	gs.createLightCircle({x: pos.x, y: pos.y + 10}, '#ff0000', 120, 90, '88');
};

// CREATE_ICE_EFFECT::
// ************************************************************************************************
gs.createIceEffect = function (tileIndex) {
	var pos = util.toPosition(tileIndex);
	
	if (!gs.getTile(tileIndex).visible) {
		return;
	}
	
	// Effects:
	gs.createAnimEffect({x: pos.x, y: pos.y + 15}, 'IceCircle');
	gs.createAnimEffect({x: pos.x, y: pos.y + 15}, 'IceParticles');
	
	// Light:
	gs.createLightCircle({x: pos.x, y: pos.y + 10}, '#6666ff', 120, 90, '88');
};

// CREATE_YELLOW_MAGIC_EFFECT::
// ************************************************************************************************
gs.createYellowMagicEffect = function (tileIndex) {
	var pos = util.toPosition(tileIndex);
	
	if (!gs.getTile(tileIndex).visible) {
		return;
	}
	
	// Effects:
	gs.createAnimEffect({x: pos.x, y: pos.y + 15}, 'YellowCircle');
	gs.createAnimEffect({x: pos.x, y: pos.y + 15}, 'YellowParticles');
	
	// Light:
	gs.createLightCircle({x: pos.x, y: pos.y + 10}, '#ffff00', 120, 90, '88');
};

// CREATE_SMITE_EFFECT:
// ************************************************************************************************
gs.createSmiteEffect = function (tileIndex) {
	var pos = util.toPosition(tileIndex), effect;
	
	if (!gs.getTile(tileIndex).visible) {
		return;
	}
	
	effect = gs.createAnimEffect({x: pos.x, y: pos.y + 15}, 'Smite');	
	effect.setOnFrame(5, function () {
		gs.createLightCircle({x: pos.x, y: pos.y + 10}, '#ff0000', 120, 30, '88');
	}, this);
};

// CREATE_MAGIC_SHOOT_EFFECT:
// ************************************************************************************************
gs.createMagicShootEffect = function (fromChar, toTileIndex, shootEffect) {
	var pos, normal, angle, light, alpha, animEffect;
	
	if (!gs.getTile(fromChar.tileIndex).visible) {
		return;
	}
	
	// Position and angle:
	normal = util.normal(fromChar.tileIndex, toTileIndex);
	pos = {x: fromChar.body.position.x + fromChar.body.offset.x + normal.x * 8, y: fromChar.body.position.y + fromChar.body.offset.y + normal.y * 8};
	angle = 225 - util.angleToFace(fromChar.tileIndex, toTileIndex);
	
	// Effect:
	animEffect = gs.createAnimEffect(pos, shootEffect, angle);
	animEffect.setFollowSprite(fromChar.sprite);
	
	// Light:
	alpha = this.animEffectTypes[shootEffect].startAlpha || 'aa';
	light = gs.createLightCircle(pos, this.animEffectTypes[shootEffect].lightColor, 30, 10, alpha);
	light.fade = false;
	light.setFollowSprite(fromChar.sprite);
};

// CREATE_ANIM_EFFECT_TYPES:
// ************************************************************************************************
gs.createAnimEffectTypes = function () {
	this.animEffectTypes = {};
	
	// HIT:
	this.animEffectTypes.Hit = {
		startFrame: 1792,
		numFrames: 5,
		speed: 20,
		randAngle: true
	};
	
	// MAGIC_SHOOT:
	this.animEffectTypes.MagicShoot = {
		startFrame: 1798,
		numFrames: 4,
		speed: 20,
		lightColor: '#ff00ff'
	};
	
	// FIRE_SHOOT:
	this.animEffectTypes.FireShoot = {
		startFrame: 1802,
		numFrames: 4,
		speed: 20,
		lightColor: '#ff0000'
	};
	
	// ELECTRIC_SHOOT:
	this.animEffectTypes.ElectricShoot = {
		startFrame: 1806,
		numFrames: 4,
		speed: 20,
		lightColor: '#0238b3'
	};
	
	// COLD_SHOOT:
	this.animEffectTypes.ColdShoot = {
		startFrame: 1810,
		numFrames: 4,
		speed: 20,
		lightColor: '#ffffff',
		startAlpha: '11',
	};
	
	// TOXIC_SHOOT:
	this.animEffectTypes.ToxicShoot = {
		startFrame: 1814,
		numFrames: 4,
		speed: 20,
		lightColor: '#aaff00',
		startAlpha: '66',
	};
	
	// SUMMON_CIRCLE:
	this.animEffectTypes.SummonCircle = {
		tileset: 'EffectsTileset',
		startFrame: 64,
		numFrames: 16,
		speed: 20,
		pauseGame: true,
		backLayer: true,
	};
	
	// SUMMON_PARTICLES:
	this.animEffectTypes.SummonParticles = {
		tileset: 'EffectsTileset',
		startFrame: 96,
		numFrames: 16,
		speed: 20,
	};
	
	// HEALING_CIRCLE:
	this.animEffectTypes.HealingCircle = {
		tileset: 'EffectsTileset',
		startFrame: 128,
		numFrames: 12,
		speed: 20,
		pauseGame: true,
		backLayer: true,
	};
	
	// HEALING_PARTICLES:
	this.animEffectTypes.HealingParticles = {
		tileset: 'EffectsTileset',
		startFrame: 160,
		numFrames: 12,
		speed: 20,
		pauseGame: true,
	};
	
	// MANA_CIRCLE:
	this.animEffectTypes.ManaCircle = {
		tileset: 'EffectsTileset',
		startFrame: 192,
		numFrames: 12,
		speed: 20,
		pauseGame: true,
		backLayer: true,
	};
	
	// MANA_PARTICLES:
	this.animEffectTypes.ManaParticles = {
		tileset: 'EffectsTileset',
		startFrame: 224,
		numFrames: 12,
		speed: 20,
		pauseGame: true,
	};
	
	// EXP_CIRCLE:
	this.animEffectTypes.EXPCircle = {
		tileset: 'EffectsTileset',
		startFrame: 256,
		numFrames: 16,
		speed: 20,
		pauseGame: true,
		backLayer: true,
	};
	
	// EXP_PARTICLES:
	this.animEffectTypes.EXPParticles = {
		tileset: 'EffectsTileset',
		startFrame: 288,
		numFrames: 16,
		speed: 20,
		pauseGame: true,
	};
	
	// DISEASE_PARTICLES:
	this.animEffectTypes.DiseaseParticles = {
		tileset: 'EffectsTileset',
		startFrame: 416,
		numFrames: 16,
		speed: 15,
		pauseGame: true,
	};
	
	// FIRE_CIRCLE:
	this.animEffectTypes.FireCircle = {
		tileset: 'EffectsTileset',
		startFrame: 144	,
		numFrames: 12,
		speed: 15,
		pauseGame: true,
		backLayer: true,
	};
	
	// FIRE_PARTICLES:
	this.animEffectTypes.FireParticles = {
		tileset: 'EffectsTileset',
		startFrame: 176,
		numFrames: 12,
		speed: 15,
		pauseGame: true,
	};
	
	// ICE_CIRCLE:
	this.animEffectTypes.IceCircle = {
		tileset: 'EffectsTileset',
		startFrame: 208	,
		numFrames: 12,
		speed: 15,
		pauseGame: true,
		backLayer: true,
	};
	
	// ICE_PARTICLES:
	this.animEffectTypes.IceParticles = {
		tileset: 'EffectsTileset',
		startFrame: 240,
		numFrames: 12,
		speed: 15,
		pauseGame: true,
	};
	
	// YELLOW_CIRCLE:
	this.animEffectTypes.YellowCircle = {
		tileset: 'EffectsTileset',
		startFrame: 272	,
		numFrames: 12,
		speed: 15,
		pauseGame: true,
		backLayer: true,
	};
	
	// YELLOW_PARTICLES:
	this.animEffectTypes.YellowParticles = {
		tileset: 'EffectsTileset',
		startFrame: 304,
		numFrames: 12,
		speed: 15,
		pauseGame: true,
	};
	
	// SMITE:
	this.animEffectTypes.Smite = {
		tileset: 'EffectsTileset',
		startFrame: 640,
		numFrames: 8,
		speed: 15,
	};
	
	this.nameTypes(this.animEffectTypes);
	
};

// CREATE_ANIM_EFFECT:
// ************************************************************************************************
gs.createAnimEffect = function (position, typeName, angle) {
	return new AnimEffect(position, typeName, angle);
};

// ANIM_EFFECT:
// ************************************************************************************************
function AnimEffect (position, typeName, angle) {
	var tileset, group;
	
	
	// Properties:
	this.type = gs.animEffectTypes[typeName];
	this.isAlive = true;
	this.followSprite = null;
	
	// Sprite:
	tileset = this.type.tileset || 'Tileset';
	
	if (this.type.backLayer) {
		group = gs.floorObjectSpritesGroup;
	}
	else {
		group = gs.projectileSpritesGroup;
	}
	
	
	this.sprite = gs.createSprite(position.x, position.y, tileset, group);
    this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	if (tileset === 'EffectsTileset') {
		this.sprite.anchor.setTo(0.5, 0.75);
	}
	
	if (this.type.randAngle) {
		this.sprite.angle = util.randInt(0, 7) * 45;
	}
	
	if (angle) {
		this.sprite.angle = angle;
	}
	
	// Anim:
    this.sprite.animations.add('Anim', gs.range(this.type.startFrame, this.type.startFrame + this.type.numFrames), this.type.speed, false);
    this.sprite.play('Anim');
	
	if (this.type.pauseGame) {
		gs.projectileList.push(this);
	}
	else {
		gs.particleList.push(this);
	}
	
}

// SET_FOLLOW_SPRITE:
// Will follow the sprite with each update, maintaining the initial offset
// ************************************************************************************************
AnimEffect.prototype.setFollowSprite = function (sprite) {
	this.followSprite = sprite;
	this.offset = {x: this.sprite.x - sprite.x, y: this.sprite.y - sprite.y};
};

// SET_ON_FRAME:
// ************************************************************************************************
AnimEffect.prototype.setOnFrame = function (frame, func, context) {
	this.onFrame = frame;
	this.onFrameFunc = func;
	this.onFrameContext = context;
};

// UPDATE:
// ************************************************************************************************
AnimEffect.prototype.update = function () {
	// Follow Sprite:
	if (this.followSprite) {
		this.sprite.x = this.followSprite.x + this.offset.x;
		this.sprite.y = this.followSprite.y + this.offset.y;
	}
	
	// On Frame:
	if (this.sprite.frame === this.type.startFrame + this.onFrame) {
		this.onFrameFunc.call(this.onFrameContext);
		this.onFrame = -1;
	}
	
	if (this.animComplete()) {
		this.destroy();
	}
};

// ANIMATION_COMPLETE:
// ************************************************************************************************
AnimEffect.prototype.animComplete = function () {
	return this.sprite.frame >= this.type.startFrame + this.type.numFrames
		|| this.sprite.animations.getAnimation('Anim').isFinished;
};

// DESTROY:
// ************************************************************************************************
AnimEffect.prototype.destroy = function () {
	this.isAlive = false;
	this.sprite.destroy();
};

// CREATE_LIGHT_CIRCLE:
// ************************************************************************************************
gs.createLightCircle = function (position, color, radius, life, startAlpha) {
	return new LightCircle(position, color, radius, life, startAlpha);
};

// LIGHT_CIRCLE:
// ************************************************************************************************
function LightCircle (position, color, radius, life, startAlpha) {	
	
	startAlpha = startAlpha || 'aa';
	
	
	
	// Properties:
	this.isAlive = true;
	this.life = life;
	this.startLife = life;
	this.fade = true;
	this.followSprite = null;
	
	// Bitmap:
	this.bmp = game.add.bitmapData(radius * 2, radius * 2);
	var gradient = this.bmp.context.createRadialGradient(radius, radius, radius * 2 * 0.05, radius, radius, radius * 2 * 0.5);
	gradient.addColorStop(0, color + startAlpha);
	gradient.addColorStop(1, color + '00');
	this.bmp.context.fillStyle = gradient;
	this.bmp.context.fillRect(0, 0, radius * 2, radius * 2);
	
	
	
	// Sprite:
	this.sprite = gs.createSprite(position.x, position.y, this.bmp, gs.projectileSpritesGroup);
	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.blendMode = PIXI.blendModes.ADD;
	this.sprite.alpha = 1.0;
	
	
	
	gs.particleList.push(this);
	
}

// SET_FOLLOW_SPRITE:
// Will follow the sprite with each update, maintaining the initial offset
// ************************************************************************************************
LightCircle.prototype.setFollowSprite = function (sprite) {
	this.followSprite = sprite;
	this.offset = {x: this.sprite.x - sprite.x, y: this.sprite.y - sprite.y};
};

// UPDATE:
// ************************************************************************************************
LightCircle.prototype.update = function () {
	var alpha;
	
	// Follow Sprite:
	if (this.followSprite) {
		this.sprite.x = this.followSprite.x + this.offset.x;
		this.sprite.y = this.followSprite.y + this.offset.y;
	}
	
	if (!this.noLife) {
		this.life -= 1;
	}
	
	if (this.fade) {
		alpha = Math.min(1.0, (1.5 * this.life)  / this.startLife);
		this.sprite.alpha = Math.max(0, alpha * 1.0);
	}
	
	
	if (!this.noLife && this.life <= 0) {
		this.destroy();
	}
};

// DESTROY:
// ************************************************************************************************
LightCircle.prototype.destroy = function () {
	this.isAlive = false;
	this.bmp.destroy();
	this.sprite.destroy();
};