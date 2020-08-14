/*global game, gs, console, util*/
/*global Item*/
/*global Door, Container, DefaultObject, ZoneLine, levelController*/
/*global TILE_SIZE, SCALE_FACTOR, FACTION*/


/*jshint white: true, laxbreak: true, esversion: 6*/
'use strict';



// CREATE_ZONE_LINE:
// ************************************************************************************************
gs.createZoneLine = function (tileIndex, typeName, toZoneName, toZoneLevel) {
	var obj = this.createObject(tileIndex, typeName);
	
	obj.toZoneName = toZoneName;
	obj.toZoneLevel = toZoneLevel;
	
	return obj;
};

// CREATE_DOOR:
// ************************************************************************************************
gs.createDoor = function (tileIndex, typeName, closedFrame, isOpen, isGuarded) {
	var obj = this.createObject(tileIndex, typeName);
	
	obj.closedFrame = closedFrame || obj.type.frame;
	obj.isOpen = isOpen || false;
	obj.isGuarded = isGuarded || false;
	obj.isSealed = false;
	
	obj.sprite.frame = obj.isOpen ? obj.closedFrame + 1 : obj.closedFrame;
	
	return obj;
};

// CREATE_CONTAINER:
// ************************************************************************************************
gs.createContainer = function (tileIndex, typeName, isOpen, isGuarded, itemDropTableName) {
	var obj = this.createObject(tileIndex, typeName);
	
	obj.isOpen = isOpen ? true : false;
	obj.isGuarded = isGuarded || false;
	
	// Select random item for container:
	obj.item = this.createRandomItem(itemDropTableName, false, true);
	
	// Set sprite open/closed:
	obj.sprite.frame = obj.isOpen ? obj.closedFrame + 1 : obj.closedFrame;
	
	
	return obj;
};

// CREATE_CRYSTAL_CHEST:
// ************************************************************************************************
gs.createCrystalChest = function (tileIndex) {
	var obj = this.createObject(tileIndex, 'CrystalChest');
	obj.groupId = gs.nextCrystalChestGroupId;
	
	return obj;
};

// CREATE_CRYSTAL_CHEST_GROUP:
// ************************************************************************************************
gs.createCrystalChestGroup = function () {
	gs.nextCrystalChestGroupId += 1;
	gs.crystalChestGroupIsOpen[gs.nextCrystalChestGroupId] = false;
};

// CREATE_OBJECT:
// ************************************************************************************************
gs.createObject = function (tileIndex, typeName, frame) {
	/*
	var i;
	for (i = 0; i < this.objectPool.length; i += 1) {
		if (!this.objectPool[i].isAlive) {
			this.objectPool[i].init(tileIndex, typeName, frame);
			return this.objectPool[i];
		}
	}
	
	// Pool size exceeded:
	this.objectPool.push(new DefaultObject());
	this.objectPool[this.objectPool.length - 1].init(tileIndex, typeName, frame);
	return this.objectPool[this.objectPool.length - 1];
	*/
	
	var obj = new DefaultObject();
	obj.init(tileIndex, typeName, frame);
	return obj;
};

// DEFAULT_OBJECT_CONSTRUCTOR:
// ************************************************************************************************
function DefaultObject() {
	this.isAlive = false;
	
	// Sprite:
	this.sprite = gs.createSprite(0, 0, 'MapTileset', gs.objectSpritesGroup);
	this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.sprite.anchor.setTo(0.5, 0.75);
	this.sprite.visible = false;
}

// DEFAULT_OBJECT_INIT:
// ************************************************************************************************
DefaultObject.prototype.init = function (tileIndex, typeName, frame) {
	var indexList, pos;
	
	if (gs.getObj(tileIndex)) {
		console.log('Existing object name: ' + gs.getObj(tileIndex).type.name);
		console.log('Creating object name: ' + typeName);
		throw 'Object already exists at: ' + tileIndex.x + ', ' + tileIndex.y;
	}
	
	
	gs.ASSERT(gs.objectTypes[typeName], 'Not a valid typeName: ' + typeName);

	// Generic Properties:
	this.type = gs.objectTypes[typeName];
	this.tileIndex = {x: tileIndex.x, y: tileIndex.y};
	this.currentTurn = 0; // For bear traps
	this.isAlive = true;
	this.isFull = true; // for fountains
	this.isSealed = false;
	
	// Zone Line Properties:
	this.toZoneName = null;
	this.toZoneLevel = null;
	
	// Sprite:
	pos = util.toPosition(tileIndex);
	this.sprite.x = pos.x;
	this.sprite.y = pos.y;
	this.sprite.frame = frame || this.type.frame;
	this.initAnimations();
	
	if (!gs.getTile(tileIndex).type.passable) {
		this.sprite.y += 2;
	}
		
	if (this.type.isPassable) {
		gs.floorObjectSpritesGroup.add(this.sprite);
		gs.objectSpritesGroup.remove(this.sprite);
	}
	else {
		gs.floorObjectSpritesGroup.remove(this.sprite);
		gs.objectSpritesGroup.add(this.sprite);
	}
	
	// Light:
	if (this.type.light) {
		this.light = gs.createLightCircle(this.sprite.position, this.type.light.color, this.type.light.radius, 0, this.type.light.startAlpha);
		this.light.noLife = true;
		this.light.fade = false;
	}
	
	// Lists:
	gs.objectList.push(this);
	gs.getTile(tileIndex).object = this;
};

// INIT_ANIMATIONS:
// ************************************************************************************************
DefaultObject.prototype.initAnimations = function () {
	// Destroy old animation:
	if (this.sprite.animations.getAnimation("anim")) {
		this.sprite.animations.getAnimation("anim").destroy();
	}
	
	if (this.type.anim) {
		this.sprite.animations.add('anim', this.type.anim);
		this.sprite.play('anim', 5, true);
		this.sprite.animations.currentAnim.setFrame(util.randElem(this.type.anim), true);
	}
};


// DEFAULT_OBJECT_DESTROY:
// ************************************************************************************************
DefaultObject.prototype.destroy = function () {
	this.isAlive = false;
	this.sprite.visible = false;
	this.sprite.destroy();
	
	if (this.light) {
		this.light.destroy();
	}
};

// UPDATE_TURN:
// ************************************************************************************************
DefaultObject.prototype.updateTurn = function () {
	if (this.isAlive && this.type.updateTurn) {
		this.type.updateTurn.call(this);
	}
	
	if (this.isAlive && this.timer > 0) {
		this.timer -= 1;
		
		if (this.timer === 0) {
			this.isOpen = false;
			this.sprite.frame = this.type.frame;
			this.isLocked = true;
			this.isPermaLocked = true;
		}
	}
};

// STEP_ON:
// ************************************************************************************************
DefaultObject.prototype.stepOn = function (character) {
	if (this.isAlive && this.type.activate) {
		this.type.activate.call(this, character);
	}
};

// CAN_INTERACT:
// ************************************************************************************************
DefaultObject.prototype.canInteract = function (character) {
	if (this.isDoor()) {
		return util.distance(character.tileIndex, this.tileIndex) <= 1.5 && !this.isOpen && !this.isSealed;
	}
	else if (this.isContainer()) {
		return util.distance(character.tileIndex, this.tileIndex) <= 1.5 && !this.isOpen;
	}
	else {
		return util.distance(character.tileIndex, this.tileIndex) <= 1.5
			&& this.type.interactFunc
			&& this.isFull
			&& !this.isSealed;
	}
};

// INTERACT:
// ************************************************************************************************
DefaultObject.prototype.interact = function (character) {
	this.type.interactFunc.call(this, character);
	
	
};

// OPEN_CONTAINER:
// ************************************************************************************************
DefaultObject.prototype.openContainer = function () {
	this.isOpen = true;
	this.sprite.frame = this.type.frame + 1;
	gs.createFloorItem(this.tileIndex, this.item);
	gs.playSound(this.type.openSound, this.tileIndex);

	if (this.isGuarded) {
		this.shout();
	}
		
	this.emitSignal();
	
};

// EMIT_SIGNAL:
// ************************************************************************************************
DefaultObject.prototype.emitSignal = function () {
	// Single Trigger:
	if (this.toTileIndex) {
		if (gs.getObj(this.toTileIndex)) {
			gs.getObj(this.toTileIndex).onTrigger();
		}
	}
	
	// Trigger List:
	if (this.triggerTileIndex) {
		this.triggerTileIndex.forEach(function (tileIndex) {
			if (gs.getObj(tileIndex)) {
				gs.getObj(tileIndex).onTrigger();
			}
		}, this);
	}
};

// ON_TRIGGER:
// ************************************************************************************************
DefaultObject.prototype.onTrigger = function () {
	// Type Trigger:
	if (this.type.onTrigger) {
		this.type.onTrigger.call(this);
	}
	
	// Door:
	if (this.isDoor() && this.isOpen) {
		this.closeDoor();
	}
	else if (this.isDoor() && !this.isOpen) {
		this.openDoor();
	}		
};

// SET_IS_FULL:
// ************************************************************************************************
DefaultObject.prototype.setIsFull = function (b) {
	this.isFull = b;
	
	if (!this.isFull) {
		if (this.type.emptyFrame) {
			this.sprite.frame = this.type.emptyFrame;
		}
		
		if (this.light) {
			this.light.destroy();
			this.light = null;
		}
	}
};

// OPEN_DOOR
// ************************************************************************************************
DefaultObject.prototype.openDoor = function () {
	if (!this.isOpen) {
		
		gs.playSound(gs.sounds.door, this.tileIndex);
		this.isOpen = true;
		this.sprite.frame += 1;
		gs.calculateLoS();
		gs.HUD.miniMap.refresh();

		if (this.isGuarded) {
			this.shout();
		}
		
		levelController.onOpenDoor(this);

		// Open Adjacent Doors:
		gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
			var obj = gs.getObj(tileIndex);
			if (obj && obj.isDoor() && !obj.isOpen) {
				obj.openDoor();
			}
		}, this);
	}
};

// CLOSE_DOOR
// ************************************************************************************************
DefaultObject.prototype.closeDoor = function () {
	if (this.isOpen) {
		gs.playSound(gs.sounds.door, this.tileIndex);
		this.isOpen = false;
		this.sprite.frame -= 1;
		gs.calculateLoS();
		
		// Close Adjacent Doors:
		gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
			var obj = gs.getObj(tileIndex);
			if (obj && obj.isDoor() && obj.isOpen) {
				obj.closeDoor();
			}
		}, this);
	}
};

// SHOUT:
// ************************************************************************************************
DefaultObject.prototype.shout = function () {
	gs.shout(this.tileIndex, FACTION.HOSTILE);
};

// IS_PASSABLE:
// ************************************************************************************************
DefaultObject.prototype.isPassable = function () {
	if (this.isDoor()) {
		return this.isOpen;
	}
	else {
		return this.type.isPassable;
	}
};

// IS_TRANSPARENT:
// ************************************************************************************************
DefaultObject.prototype.isTransparent = function () {
	if (this.isDoor()) {
		return this.isOpen || this.type.isTransparent;
	}
	else {
		return this.type.isTransparent;
	}
};

// IS_ZONE_LINE:
// ************************************************************************************************
DefaultObject.prototype.isZoneLine = function () {
	return this.type.name === 'DownStairs'
		|| this.type.name === 'UpStairs';
};

// IS_DOOR:
// ************************************************************************************************
DefaultObject.prototype.isDoor = function () {
	return this.type.interactFunc === gs.objectFuncs.useDoor;
};

// IS_CONTAINER:
// ************************************************************************************************
DefaultObject.prototype.isContainer = function () {
	return this.type.interactFunc === gs.objectFuncs.useContainer
		|| this.type.interactFunc === gs.objectFuncs.meatRack;
};

// SEAL:
// ************************************************************************************************
DefaultObject.prototype.seal = function () {
	this.isSealed = true;
	
	
	if (this.isDoor() && this.isOpen) {
		this.closeDoor();
	}
};

// TO_DATA:
// ************************************************************************************************
DefaultObject.prototype.toData = function () {
	var data = {};
	
	data.frame = this.sprite.frame;
	data.typeFrame = this.type.frame;
	data.isFull = this.isFull;
	
	// Zone Line:
	if (this.isZoneLine()) {
		data.toZoneName = this.toZoneName;
		data.toZoneLevel = this.toZoneLevel;
	}
	
	// Door:
	if (this.isDoor()) {
		data.closedFrame = this.closedFrame;
		data.isOpen = this.isOpen;
		data.isGuarded = this.isGuarded;
		data.isLocked = this.isLocked;
		data.timer = this.timer;
		data.isPermaLocked = this.isPermaLocked;
	}
	
	// Container:
	if (this.isContainer()) {
		data.isOpen = this.isOpen;
		data.isGuarded = this.isGuarded;
	}
	
	// Crystal Chest:
	if (this.item) {
		data.item = this.item.toData();
	}
	
	if (this.groupId) {
		data.groupId = this.groupId;
	}
	
	// Storing the name of corpses:
	if (this.npcTypeName) {
		data.npcTypeName = this.npcTypeName;
	}

	// Storing toTileIndex of portals:
	if (this.toTileIndex) {
		data.toTileIndex = this.toTileIndex;
	}
	
	// Storing triggerTileIndex:
	if (this.triggerTileIndex) {
		data.triggerTileIndex = this.triggerTileIndex;
	}

	// Storing damage of ice bombs:
	if (this.damage) {
		data.damage = this.damage;
	}
	
	// Loop Time:
	if (this.loopTurns) {
		data.loopTurns = this.loopTurns;
	}
	
	// Current Turn:
	if (this.currentTurn) {
		data.currentTurn = this.currentTurn;
	}
				
	return data;
};

// LOAD_OBJ:
// ************************************************************************************************
gs.loadObj = function (tileIndex, data) {
	var obj, typeName;
	
	typeName = this.getNameFromFrame(data.typeFrame, this.objectTypes);
	
	if (!typeName) {
		throw 'Cannot load object, unknown typeFrame: ' + data.typeFrame;
	}
	
	// Zone Line:
	if (gs.isFrameZoneLine(data.typeFrame)) {
		obj = this.createZoneLine(tileIndex, typeName, data.toZoneName, data.toZoneLevel);
	}
	// Door:
	else if (gs.isFrameDoor(data.typeFrame)) {
		obj = this.createDoor(tileIndex, typeName, data.closedFrame, data.isOpen, data.isGuarded);
		obj.isLocked = data.isLocked;
		obj.timer = data.timer;
		obj.isPermaLocked = data.isPermaLocked;
	}
	// Container:
	else if (gs.isFrameContainer(data.typeFrame)) {
		obj = this.createContainer(tileIndex, typeName, data.isOpen, data.isGuarded);
	}
	else {
		obj = this.createObject(tileIndex, typeName);
	}
	
	// Loop Time:
	if (data.loopTurns) {
		obj.loopTurns = data.loopTurns;
	}
	
	// Current Turn:
	if (data.currentTurn) {
		obj.currentTurn = data.currentTurn;
	}
	
	// Container contents:
	if (data.item) {
		obj.item = Item.createAndLoadItem(data.item);
	}
	
	// Creating Crystal chest item (used when loading from a static json file):
	if (obj.type.name === 'CrystalChest' && !data.item && data.itemDropTableName) {
		obj.item = gs.createRandomItem(data.itemDropTableName);
	}
	
	if (data.groupId) {
		obj.groupId = data.groupId;
	}
	
	if (data.hasOwnProperty('isFull')) {
		obj.isFull = data.isFull;
	}
	
	
	// Storing the name of corpses:
	if (data.npcTypeName) {
		obj.npcTypeName = data.npcTypeName;
	}

	// Storing toTileIndex of portals:
	if (data.toTileIndex) {
		obj.toTileIndex = data.toTileIndex;
	}
	
	// Storing triggerTileIndex:
	if (data.triggerTileIndex) {
		obj.triggerTileIndex = data.triggerTileIndex;
	}

	// Storing damage of ice bombs:
	if (data.damage) {
		obj.damage = data.damage;
	}
	
	obj.sprite.frame = data.frame;
	
	return obj;
};

// DESTROY_OBJECT:
// Call this from anywhere to safely destroy object and remove it from lists
// ************************************************************************************************
gs.destroyObject = function (obj) {
	this.removeFromArray(obj, this.objectList);
	this.getTile(obj.tileIndex).object = null;
	obj.destroy();
};

// DESTROY_ALL_OBJECTS:
// ************************************************************************************************
gs.destroyAllObjects = function () {
	for (let i = 0; i < this.objectList.length; i += 1) {
		this.objectList[i].destroy();
	}

	this.objectList = [];
};

// OBJECT_DESC:
// ************************************************************************************************
gs.objectDesc = function (object) {
	var str;
	
	// ZoneLine:
	if (object.isZoneLine()) {
		if (object.type.name === 'DownStairs') {
			str = '向下的楼梯\n';
			str += '通往' + translator.getText(object.toZoneName) + '的第' + gs.niceZoneLevel(object.toZoneName, object.toZoneLevel) + '层\n';
			str += '在楼梯上按下s或者>下楼，\n你也可以在发现楼梯后按>快速下楼。';
			return  str;
		} 
		else {
			str = '向上的楼梯\n';
			str += '通往' + translator.getText(object.toZoneName) + '的第' + gs.niceZoneLevel(object.toZoneName, object.toZoneLevel) + '层\n';
			str += '在楼梯上按下s或者<上楼，\n你也可以在发现楼梯后按<快速上楼。'; 
			return  str;
		}
	}
	// Object:
	else {
		str = translator.getText(object.type.niceName) + '\n';
		
		if (object.type.desc) {
			str += object.type.desc;
		}
		
		if (object.item && object.type.name === 'CrystalChest') {
			str += object.item.toLongDesc();
		}
		return str;
	}
};

gs.canShootTrap = function (tileIndex) {
	return this.getObj(tileIndex, ['FireShroom', 'BearTrap', 'SpikeTrap', 'FireVent', 'FireGlyph']);
};

// FIND_OBJECT:
// Find an object anywhere on the current level based on either a predicate or a typeName
// ************************************************************************************************
gs.findObj = function (pred) {
	if (typeof pred === 'string') {
		return gs.objectList.find(obj => obj.name === pred);
	}
	else {
		return gs.objectList.find(pred);
	}
};

// CREATE_OBJECT_POOL:
// ************************************************************************************************
gs.createObjectPool = function () {
	/*
	var i;
	this.objectPool = [];
	for (i = 0; i < 200; i += 1) {
		this.objectPool[i] = new DefaultObject();
	}
	*/
};

// IS_FRAME_ZONE_LINE:
// Used when loading when only available information is frame.
// ************************************************************************************************
gs.isFrameZoneLine = function (frame) {
	var type = this.objectTypes[this.getNameFromFrame(frame, this.objectTypes)];
	return type && type.interactFunc === this.objectFuncs.useZoneLine;
};

// IS_FRAME_DOOR:
// Used when loading when only available information is frame.
// ************************************************************************************************
gs.isFrameDoor = function (frame) {
	var type = this.objectTypes[this.getNameFromFrame(frame, this.objectTypes)];
	return type && type.interactFunc === this.objectFuncs.useDoor;
};

// IS_FRAME_CONTAINER:
// Used when loading when only available information is frame.
// ************************************************************************************************
gs.isFrameContainer = function (frame) {
	var type = this.objectTypes[this.getNameFromFrame(frame, this.objectTypes)];
	return type && (type.interactFunc === this.objectFuncs.useContainer || type.interactFunc === this.objectFuncs.meatRack);
};