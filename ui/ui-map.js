/*global game, gs, console, util*/
/*global MINI_MAP_SIZE_X, MINI_MAP_SIZE_Y, MINI_MAP_TILE_SIZE, SCALE_FACTOR, FACTION*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';



// CONSTRUCTOR:
// ************************************************************************************************
function UIMap(startX, startY, group) {
	var sprite;
	
	this.startX = startX;
	this.startY = startY;
	
	// Boarder:
	sprite = gs.createSprite(startX - 2, startY - 2, 'MiniMap', group);
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
    // Map sprite:
    this.miniMapBMP = game.add.bitmapData(MINI_MAP_SIZE_X * MINI_MAP_TILE_SIZE, MINI_MAP_SIZE_Y * MINI_MAP_TILE_SIZE);
    this.sprite = game.add.sprite(startX, startY, this.miniMapBMP);
    group.add(this.sprite);
	
	this.colorMap = gs.create2DArray(MINI_MAP_SIZE_X, MINI_MAP_SIZE_Y, (x, y) => 'rgb(0,0,0)');
	
	this.friendlyNPCNames = ['Merchant', 'SkillTrainer', 'TalentTrainer', 'Priest'];
}


// DESTROY:
// ************************************************************************************************
UIMap.prototype.destroy = function () {
	this.sprite.destroy();
};

// IS_POINTER_OVER:
// ************************************************************************************************
UIMap.prototype.isPointerOver = function () {
	return game.input.activePointer.x >= this.sprite.x
		&& game.input.activePointer.y >= this.sprite.y
		&& game.input.activePointer.x < this.sprite.x + this.sprite.width
		&& game.input.activePointer.y < this.sprite.y + this.sprite.height;
};

// INDEX_UNDER_POINTER:
// ************************************************************************************************
UIMap.prototype.indexUnderPointer = function () {
	var x = Math.floor((game.input.activePointer.x - this.sprite.x) / MINI_MAP_TILE_SIZE),
		y = Math.floor((game.input.activePointer.y - this.sprite.y) / MINI_MAP_TILE_SIZE),
		tileIndex;
	
	tileIndex = {x: x + gs.pc.tileIndex.x - Math.floor(MINI_MAP_SIZE_X / 2),
				 y: y + gs.pc.tileIndex.y - Math.floor(MINI_MAP_SIZE_Y / 2)};
			
	if (gs.numTilesX <= MINI_MAP_SIZE_X) {
		tileIndex.x = x - Math.floor((MINI_MAP_SIZE_X - gs.numTilesX) / 2);
	}

	if (gs.numTilesY <= MINI_MAP_SIZE_Y) {
		tileIndex.y = y - Math.floor((MINI_MAP_SIZE_Y - gs.numTilesY) / 2);
	}
	
	return tileIndex;
};

// REFRESH:
// ************************************************************************************************
UIMap.prototype.refresh = function (fullRefresh) {
	var color;
	
	if (gs.pc.hasTalent('KeenHearing')) {
		this.keenHearingRange = gs.talents.KeenHearing.range[gs.pc.getTalentLevel('KeenHearing') - 1];
	}

    // Draw dots:
    for (let x = 0; x < MINI_MAP_SIZE_X; x += 1) {
        for (let y = 0; y < MINI_MAP_SIZE_Y; y += 1) {
			color = this.getTileColor(x, y);

            // Inner Fill (player, upstairs, downstairs)
			if (color.color !== this.colorMap[x][y] || fullRefresh) {
				if (color.outline) {
					// Draw the outline:
					this.miniMapBMP.context.fillStyle = '#000000';
					this.miniMapBMP.context.fillRect(x * MINI_MAP_TILE_SIZE, y * MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE);
					
					// Draw the fill:
					this.miniMapBMP.context.fillStyle = color.color;
					this.miniMapBMP.context.fillRect(x * MINI_MAP_TILE_SIZE + 1, y * MINI_MAP_TILE_SIZE + 1, MINI_MAP_TILE_SIZE - 2, MINI_MAP_TILE_SIZE - 2);
				}
				else {
					this.miniMapBMP.context.fillStyle = color.color;
					this.miniMapBMP.context.fillRect(x * MINI_MAP_TILE_SIZE, y * MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE);
				}
				
				this.colorMap[x][y] = color.color;
			}
		}
    }
	
    this.miniMapBMP.dirty = true;
};


// GET_TILE_COLOR:
// ************************************************************************************************
UIMap.prototype.getTileColor = function (x, y) {
	var char, obj, tile;
	
	tile = gs.tileMap[x][y];
	char = tile.character;
	obj = tile.object;
	
	// Player:
	if (char && char === gs.pc) {
		return {color: 'rgb(0,255,0)', outline: true};
	}
	// Colored:
	else if (tile.color) {
		return {color: tile.color};
	} 
	// NPC:
	// Note that this must be placed above unexplored to let player see enemies 'through walls'
	else if (char && char.faction === FACTION.HOSTILE && (gs.debugProperties.showCharactersOnMap || gs.pc.isTelepathic)) {
		return {color: 'rgb(255,0,0)'};
	} 
	// KEEN_HEARING:
	else if (gs.pc.hasKeenHearing && char && char.faction === FACTION.HOSTILE && util.distance(gs.pc.tileIndex, {x: x, y: y}) < this.keenHearingRange) {
		return {color: 'rgb(255,0,0)'};
	} 
	// Unexplored (black):
	else if (!tile.explored) {
		return {color: 'rgb(0,0,0)'};
	}
	// Wall:
	else if (!tile.type.passable) {
		return {color: 'rgb(96,96,96)'};
	}
	// Friendly NPC:
	else if (char && gs.inArray(char.type.name, this.friendlyNPCNames)) {
		return {color: 'rgb(255,110,20)'};
	}
	// Water:
	else if (tile.type === gs.tileTypes.Water) {
		return {color: 'rgb(65,40,200)'};
	}
	// Lava:
	else if (tile.type === gs.tileTypes.Lava) {
		return {color: 'rgb(200, 24, 24)'};
	}
	// Toxic Waste:
	else if (tile.type === gs.tileTypes.ToxicWaste) {
		return {color: '#51af12'};
	}
	
	// Objects:
	if (obj) {
		// Stone Door:
		if (obj.type === gs.objectTypes.StoneDoor) {
			return {color: '#b62828'};
		}
		// Door:
		else if (obj.isDoor()) {
			return {color: 'rgb(140,90,34)'};
		}
		// Up Stair:
		else if (obj.type === gs.objectTypes.UpStairs) {
			return {color: 'rgb(0,255,255)', outline: true};
		}
		// Down Stair:
		else if (obj.type === gs.objectTypes.DownStairs) {
			return {color: 'rgb(255,0,255)', outline: true};
		}
		// Camp Fire:
		else if (obj.type === gs.objectTypes.CampFire) {
			return {color: 'rgb(255,0,0)'};
		}
		// Altar
		else if (obj.type.religion) {
			return {color: 'rgb(255,110,20)'};
		}
		
		if (obj.isFull) {
			// Healing Fountain:
			if (obj.type === gs.objectTypes.HealthFountain) {
				return {color: 'rgb(100,243,4)'};
			}
			// Mana Fountain:
			else if (obj.type === gs.objectTypes.EnergyFountain) {
				return {color: 'rgb(166,40,214)'};
			}
			// Experience Fountain:
			else if (obj.type === gs.objectTypes.ExperienceFountain) {
				return {color: 'rgb(255,255,0)'};
			}
			// Wishing Well:
			else if (obj.type === gs.objectTypes.WellOfWishing) {
				return {color: '#639bff'};
			}
			// Attribute Fountain:
			else if (obj.type === gs.objectTypes.AttributeFountain) {
				return {color: '#ea323c'};
			}
			// Enchantment Table:
			else if (obj.type === gs.objectTypes.EnchantmentTable) {
				return {color: '#8b9bb4'};
			}
			// TransferanceTable:
			else if (obj.type === gs.objectTypes.TransferanceTable) {
				return {color: '#feae34'};
			}
		}
		
		// Portal:
		if (obj.type === gs.objectTypes.Portal) {
			return {color: '#8be9ff'};
		}
		// Chest:
		else if (obj.type === gs.objectTypes.Chest && !obj.isOpen) {
			return {color: 'rgb(255,255,0)'};
		}
		// Crystal Chest:
		else if (obj.type === gs.objectTypes.CrystalChest && !gs.crystalChestGroupIsOpen[obj.groupId]) {
			return {color: 'rgb(255,255,0)'};
		}
	}
	
	
	// Item
	if (tile.item) {
		return {color: 'rgb(255,255,0)'};
	}
	// Pit:
	else if (tile.type.isPit) {
		return {color: 'rgb(32,32,32)'};
	}
	// Floor: 
	else if (!obj || obj.type.isPassable) {
		return {color: 'rgb(180,180,180)'};
	}
	else {
		return {color: 'rgb(96,96,96)'};
	}
	
};

// GET_DESC_OF_MINI_MAP:
// ************************************************************************************************
UIMap.prototype.getDescUnderPointer = function () {
	if (!this.isPointerOver()) {
		return null;
	}
	else {
		return gs.descriptionOfTileIndex(this.indexUnderPointer());
	}
};