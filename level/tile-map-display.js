/*global gs, game, console, Phaser*/
/*global NUM_TILES_X, NUM_TILES_Y*/
/*global TILE_SIZE, SCALE_FACTOR, SHADOW_COLOR*/
/*global NUM_SCREEN_TILES_X, NUM_SCREEN_TILES_Y*/
/*global LOS_DISTANCE*/
/*jshint esversion: 6, laxbreak: true, loopfunc: true*/
'use strict';
// CREATE_TILE_MAP_SPRITES:
// ************************************************************************************************
gs.createTileMapSprites = function () {
    
    
    this.tileMapSprites = [];
    for (let x = 0; x < NUM_SCREEN_TILES_X; x += 1) {
        this.tileMapSprites[x] = [];
        for (let y = 0; y < NUM_SCREEN_TILES_Y; y += 1) {
			this.tileMapSprites[x][y] = gs.createSprite(x * TILE_SIZE, y * TILE_SIZE, 'MapTileset', this.tileMapSpritesGroup);
			this.tileMapSprites[x][y].scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
			this.tileMapSprites[x][y].anchor.setTo(0.5, 0.75);
			this.tileMapSprites[x][y].visible = false;
			//this.tileMapSprites[x][y].enableBody = false;
        }
    }
	
	
	this.createShadowMask();
};




// CREATE_SHADOW_MASK
// ************************************************************************************************
gs.createShadowMask = function () {
	var width = NUM_SCREEN_TILES_X * TILE_SIZE,
		height = NUM_SCREEN_TILES_Y * TILE_SIZE,
		radius = width / 2,
		gradient,
		color = SHADOW_COLOR,
		startAlpha = 'ff';
	
	// Creating Shadow Mask:
	this.shadowMaskBMP = game.add.bitmapData(width, width);
	
	gradient = this.shadowMaskBMP.context.createRadialGradient(radius, radius, radius * 2 * 0.05, radius, radius, radius * 2 * 0.5);
	gradient.addColorStop(0, color + '00');
	gradient.addColorStop(1, color + 'aa');
	this.shadowMaskBMP.context.fillStyle = gradient;
	this.shadowMaskBMP.context.fillRect(0, 0, radius * 2, radius * 2);
	
	this.shadowMaskSprite = this.createSprite(0, 0, this.shadowMaskBMP, this.shadowSpritesGroup);
	this.shadowMaskSprite.anchor.setTo(0.5, 0.5);
	
	this.shadowMaskBMP.dirty = true;
};

// UPDATE_TILE_MAP_SPRITES:
// ************************************************************************************************
gs.updateTileMapSprites = function () {
    var cameraTileIndex = this.toTileIndex(game.camera.position),
		tileIndex = {x: 0, y: 0},
		objectGroupArray = ['Wall', 'CaveWall', 'HalfWall'],
		tileSprite;
	
	
	
    for (let x = 0; x < NUM_SCREEN_TILES_X; x += 1) {
        for (let y = 0; y < NUM_SCREEN_TILES_Y; y += 1) {
			
			tileIndex.x = cameraTileIndex.x + x;
			tileIndex.y = cameraTileIndex.y + y;
			
			tileSprite = this.tileMapSprites[x][y];
			tileSprite.x = ((tileIndex.x + 0.5) * TILE_SIZE);
            tileSprite.y = ((tileIndex.y + 0.5) * TILE_SIZE);
			
			
            // If in bounds:
            if (this.isInBounds(tileIndex)) {
                // If explored:
                if (this.getTile(tileIndex).explored) {
					tileSprite.visible = true;
				
					// Tile Unique Frame:
					if (this.getTile(tileIndex).frame) {
						tileSprite.frame = this.getTile(tileIndex).frame;
					}
					// Tile Generic Frame:
					else {
						tileSprite.frame = this.getTile(tileIndex).type.frame;
					}
					
					// Moving tile to correct layer:
					if (gs.inArray(this.getTile(tileIndex).type.name, objectGroupArray)) {
						this.objectSpritesGroup.add(tileSprite);
					}
					else {
						this.tileMapSpritesGroup.add(tileSprite);
					}

					// Debug show areas (highlights areas in red):
					if (this.debugProperties.showAreas) {
						// Solid Wall:
						if (this.getTile(tileIndex).isSolidWall) {
							tileSprite.tint = 0xff0000;
						}
						// Closed:
						else if (this.getTile(tileIndex).isClosed) {
							tileSprite.tint = 0xaa0000;
						}
						else if (this.getTile(tileIndex).area) {
							tileSprite.tint = 0x00ff00;
						}
						else {
							tileSprite.tint = 0xffffff;
						}
					}
					
					// Make item visible:
					if (this.getItem(tileIndex)) {
						this.getItem(tileIndex).sprite.visible = true;
					}
					
					// Make objects visible:
					if (this.getObj(tileIndex, obj => !obj.type.isHidden)) {
						this.getObj(tileIndex).sprite.visible = true;
					}

					// Make effects visible:
					if (this.getCloud(tileIndex)) {
						this.getCloud(tileIndex).sprite.visible = true;
					}
					
                    // If explored and visible:
                    if (this.getTile(tileIndex).visible) {
						this.setSpriteKey(tileSprite, 'MapTileset');
						
						// Make item ligth:
						if (this.getItem(tileIndex)) {
							this.setSpriteKey(this.getItem(tileIndex).sprite, 'Tileset');
						}
						
						// Make objects light:
						if (this.getObj(tileIndex)) {
							this.setSpriteKey(this.getObj(tileIndex).sprite, 'MapTileset');
						}
						
						// Make effect light:
						if (this.getCloud(tileIndex)) {
							this.setSpriteKey(this.getCloud(tileIndex).sprite, 'Tileset');
						}
                    }
					// If explored and not visible:
					else {
						this.setSpriteKey(tileSprite, 'DarkMapTileset');
						
						// Make item dark:
						if (this.getItem(tileIndex)) {
							this.setSpriteKey(this.getItem(tileIndex).sprite, 'DarkTileset');
						}
						
						// Make objects dark:
						if (this.getObj(tileIndex)) {
							this.setSpriteKey(this.getObj(tileIndex).sprite, 'DarkMapTileset');
						}
						
						// Make effect dark:
						if (this.getCloud(tileIndex)) {
							this.setSpriteKey(this.getCloud(tileIndex).sprite, 'DarkTileset');
						}
                    }
					
					
                } 
				// If not explored:
				else {
                    tileSprite.visible = false;
                    
                    // Hide item:
                    if (this.getItem(tileIndex)) {
                        this.getItem(tileIndex).sprite.visible = false;
                    }
					
					// Hide Object:
					if (this.getObj(tileIndex)) {
						this.getObj(tileIndex).sprite.visible = false;
					}
					
					// Hide Effect:
					if (this.getCloud(tileIndex)) {
						this.getCloud(tileIndex).sprite.visible = false;
					}
                }
            }
			// If not in bounds:
			else {
                tileSprite.visible = false;
            }
        }
    }
};

// SET_SPRITE_KEY:
// ************************************************************************************************
gs.setSpriteKey = function (sprite, key) {
	var frame;
	
	if (sprite.key !== key) {
		frame = sprite.frame;
		sprite.loadTexture(key, frame, true);
		sprite.frame = frame;

		if (sprite.animations && sprite.animations.getAnimation("anim")) {
			sprite.play('anim', 5, true);
		}
	}
};

// CREATE_LOS_RAYS:
// ************************************************************************************************
gs.createLoSRays = function () {
	var angle = 0,
        angleDelta = Math.PI / 20,
        distance = 0,
        stepDelta = 4,
        sightDistance = TILE_SIZE * LOS_DISTANCE,
        point,
        tileIndex;
	
	this.losRays = [];

    point = new Phaser.Point(1, 0);
	
    for (angle = 0; angle < Math.PI * 2; angle += angleDelta) {
        point = Phaser.Point.rotate(point, 0, 0, angleDelta);
		let indexList = [];
		
        for (distance = 0; distance <= sightDistance; distance += stepDelta) {
			tileIndex = this.toTileIndex({x: 20 + point.x * distance, y: 20 + point.y * distance});
            
			if (!indexList.find(index => gs.vectorEqual(tileIndex, index))) {
				indexList.push({x: tileIndex.x, y: tileIndex.y});
			}
		}
		
		this.losRays.push(indexList);
    }
};

// CALCULATE_LOS:
// ************************************************************************************************
gs.calculateLoS = function (forceRefresh = false) {
    // Make all tiles not visible:
	if (forceRefresh) {
		for (let x = 0; x < this.numTilesX; x += 1) {
			for (let y = 0; y < this.numTilesY; y += 1) {
				this.tileMap[x][y].visible = this.debugProperties.mapVisible;
			}
    	}
	}
	else {
		for (let x = Math.max(0, gs.pc.tileIndex.x - LOS_DISTANCE - 3); x < Math.min(this.numTilesX, gs.pc.tileIndex.x + LOS_DISTANCE + 4); x += 1) {
			for (let y = Math.max(0, gs.pc.tileIndex.y - LOS_DISTANCE - 1); y < Math.min(this.numTilesY, gs.pc.tileIndex.y + LOS_DISTANCE + 2); y += 1) {
				this.tileMap[x][y].visible = this.debugProperties.mapVisible;
			}
    	}
	}
    
	
	// Tiles adjacent to player are always visible:
	this.getIndexInBox(this.pc.tileIndex.x - 1, this.pc.tileIndex.y - 1, this.pc.tileIndex.x + 2, this.pc.tileIndex.y + 2).forEach(function (tileIndex) {
		// Visible:
        this.tileMap[tileIndex.x][tileIndex.y].visible = true;
		
		// Explored:
		this.setTileIndexExplored(tileIndex);
	}, this);
	
	this.losRays.forEach(function (ray) {
		for (let i = 0; i < ray.length; i += 1) {
			let tileIndex = {x: ray[i].x + gs.pc.tileIndex.x, y: ray[i].y + gs.pc.tileIndex.y};
			
			if (this.isTileIndexTransparent(tileIndex)) {
				gs.setTileIndexVisible(tileIndex);
            } 
			else {
                break;
            }
		}
		
	}, this);
};



// SET_TILE_INDEX_VISIBLE:
// ************************************************************************************************
gs.setTileIndexVisible = function (tileIndex) {
	var indexList = this.getIndexInBox(tileIndex.x - 1, tileIndex.y -1, tileIndex.x + 2, tileIndex.y + 2);
	
	// Handling the tile itself:
    if (this.isInBounds(tileIndex)) {
		// Visible:
        this.tileMap[tileIndex.x][tileIndex.y].visible = true;
		
		// Explored:
		this.setTileIndexExplored(tileIndex);
    }
	
	// Handling adjacent wall tiles:
	indexList.forEach(function (index) {
		if (!this.isTileIndexTransparent(index)) {
			// Visible:
			this.tileMap[index.x][index.y].visible = true;

			// Explored:
			this.setTileIndexExplored(index);
		}
	}, this);
};

// SET_TILE_INDEX_EXPLORED:
// ************************************************************************************************
gs.setTileIndexExplored = function (tileIndex) {
	var objList, charList;
	
	// Explored:
	if (!this.tileMap[tileIndex.x][tileIndex.y].explored) {
		this.tileMap[tileIndex.x][tileIndex.y].explored = true;
		
		objList = [
			'UpStairs',  'DownStairs', 
			'HealthFountain', 'ManaFountain', 'ExperienceFountain', 'WellOfWishing', 'AttributeFountain',
			'EnchantmentTable', 'TransferanceTable',
			'StoneDoor', 'Gate',
		    'CrystalChest',
			'AltarOfTrog', 'AltarOfWealth', 'AltarOfTheArcher', 'AltarOfTheWizard', 'AltarOfHealth', 'AltarOfExploration',
		];
		
		charList = [
			'Merchant', 'TalentTrainer', 'SkillTrainer', 'Priest'
		];
		
		// Need to be very careful here so as not to fuck up charge and sprint w/ popup messages:
		if (gs.pc.isExploring && !gs.pc.isMultiMoving) {
			// Halting exploration if something interesting is discovered:
			if (this.getObj(tileIndex, objList)) {
				gs.pc.stopExploring();
				gs.pc.popUpText('Spotted ' + gs.capitalSplit(this.getObj(tileIndex).type.name), '#ffffff');
			} 
			else if (this.getChar(tileIndex) && this.inArray(this.getChar(tileIndex).name, charList)) {
				gs.pc.stopExploring();
				gs.pc.popUpText('Spotted ' + gs.capitalSplit(this.getChar(tileIndex).type.name), '#ffffff');
			}	
		}
		
	}
};

/*
gs.createTileMapSprites = function () {
	this.mapBMP = game.add.bitmapData(800, 800);
	
	//this.mapBMP.copy('MapTileset', 0, 0);
	
	this.mapSprite = game.add.sprite(0, 0, this.mapBMP, this.tileMapSpritesGroup);
	this.mapSprite.scale.setTo(2, 2);
	this.mapSprite.smoothed = false;
	this.mapSprite.fixedToCamera = true;
	

	this.frameMap = [];
	for (let x = 0; x < NUM_SCREEN_TILES_X; x += 1) {
		this.frameMap[x] = [];
		for (let y = 0; y < NUM_SCREEN_TILES_Y; y += 1) {
			this.frameMap[x][y] = -1;
		}
	}
	
	this.createShadowMask();
	
	
};

gs.updateTileMapSprites = function () {
	 var cameraTileIndex = this.toTileIndex(game.camera.position),
		 tileIndex = {x: 0, y: 0},
		 tile,
		 frame;
	
	this.mapSprite.x = ((cameraTileIndex.x + 0.5) * TILE_SIZE);
    this.mapSprite.y = ((cameraTileIndex.y + 0.5) * TILE_SIZE);
	
    for (let x = 0; x < NUM_SCREEN_TILES_X; x += 1) {
        for (let y = 0; y < NUM_SCREEN_TILES_Y; y += 1) {
			tileIndex.x = cameraTileIndex.x + x;
			tileIndex.y = cameraTileIndex.y + y;
			
			
			if (this.isInBounds(tileIndex)) {
				tile = this.tileMap[tileIndex.x][tileIndex.y];
				frame = tile.frame || tile.type.frame;
				
				if (this.frameMap[x][y] !== frame) {
					this.mapBMP.copy('MapTileset', (frame % 32) * 20, Math.floor(frame / 32) * 40, 20, 40, x * 20, y * 20);
					this.frameMap[x][y] = frame;
				}
				
				
			}
		}
	}
	this.mapBMP.dirty = true;
};
*/
