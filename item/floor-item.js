/*global gs, game, console, util*/
/*global Item*/
/*global TILE_SIZE, SCALE_FACTOR*/
/*global ITEM_ENCHANTED_PERCENT*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_FLOOR_ITEM:
// Creates an item on the floor of the dungeon
// ************************************************************************************************
gs.createFloorItem = function (tileIndex, item) {
	return new FloorItem(tileIndex, item);
};

// CREATE_RANDOM_FLOOR_ITEM:
// ************************************************************************************************
gs.createRandomFloorItem = function (tileIndex, itemDropTableName, isUnique) {
	return new FloorItem(tileIndex, this.createRandomItem(itemDropTableName, null, isUnique));
};



// CONSTRUCTOR:
// ************************************************************************************************
function FloorItem (tileIndex, item) {
	var position;
	
	// Constraints:
	if (gs.getItem(tileIndex)) throw 'Cannot create FloorItem, tileIndex already occupied';
	
	// Properties:
	this.isAlive = true;
	this.item = item;
	this.tileIndex = {x: tileIndex.x, y: tileIndex.y};
	
	// Sprite:
	position = util.toPosition(this.tileIndex);
	this.sprite = gs.createSprite(position.x, position.y - 1, 'Tileset', gs.objectSpritesGroup);
	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.sprite.frame = item.type.frame;
	
	// When spawning on an object, make sure to appear above the object.
	if (!gs.isStaticPassable(this.tileIndex)) {
		this.sprite.y += 2;
		this.sprite.anchor.setTo(0.5, 1.0);
	}
	
	// Sprite Anim:
	if (item.type.anim) {
		this.sprite.animations.add('anim', item.type.anim);
		this.sprite.play('anim', 5, true);
		this.sprite.animations.currentAnim.setFrame(util.randElem(item.type.anim), true);
	}
	
	// Place on tileMap:
	gs.getTile(tileIndex).item = this;
	
	// Push to global list:
	gs.floorItemList.push(this);
}

// TO_DATA:
// ************************************************************************************************
FloorItem.prototype.toData = function () {
	var data = this.item.toData();
	data.tileIndex = this.tileIndex;
	data.wasDropped = Boolean(this.wasDropped);
	return data;
};

// LOAD_FLOOR_ITEM:
// ************************************************************************************************
gs.loadFloorItem = function (data) {
	var item;
	item = this.createFloorItem(data.tileIndex, Item.createAndLoadItem(data));
	item.wasDropped = data.wasDropped;
	return item;
};

// DESTROY_FLOOR_ITEM:
// ************************************************************************************************
gs.destroyFloorItem = function (floorItem) {
	floorItem.isAlive = false;
	floorItem.sprite.destroy();
	this.getTile(floorItem.tileIndex).item = null;
};

// DESTROY_ALL_ITEMS:
// ************************************************************************************************
gs.destroyAllFloorItems = function () {
	for (let i = 0; i < this.floorItemList.length; i += 1) {
		this.destroyFloorItem(this.floorItemList[i]);
	}
	this.floorItemList = [];
};


// INVALID_ITEM_INDEX:
// returns true if items should not drop on the tileIndex
// This could be because of traps, stairs or portals
// ************************************************************************************************
gs.invalidItemIndex = function (tileIndex) {
	return (this.getObj(tileIndex) && !this.isIndexSafe(tileIndex)) 
		|| this.getObj(tileIndex, obj => obj.isZoneLine())
		|| this.getObj(tileIndex, 'Portal');
};

// GET_VALID_DROP_INDEX:
// Returns a tileIndex that is valid for dropping loop either at the input tileIndex or adjacent.
// Returns null if no valid drop index is available in which case loot should not drop.
// ************************************************************************************************
gs.getValidDropIndex = function (tileIndex) {
	var indexList;
	
	if (!this.invalidItemIndex(tileIndex) && !gs.getItem(tileIndex)) {
		return tileIndex;
	}
	
	indexList = this.getIndexInBox(tileIndex.x - 1, tileIndex.y - 1, tileIndex.x + 2, tileIndex.y + 2);
	indexList = indexList.filter(index => gs.isPassable(index));
	indexList = indexList.filter(index => !gs.getItem(index));
	indexList = indexList.filter(index => !gs.invalidItemIndex(index));
	
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

