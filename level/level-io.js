/*global gs, game, console, localStorage, util*/
/*global levelController, Item, frameSelector*/
/*global TILE_SIZE, SCALE_FACTOR, PLAYER_FRAMES, FACTION*/
/*jshint esversion: 6, loopfunc: true*/
'use strict';

// LOAD_JSON_LEVEL:
// Load a level from a .json file
// ************************************************************************************************
gs.loadJSONLevel = function (levelName) {
	var tileTypeMap;
	
	this.initiateTileMap();
	tileTypeMap = this.parseJSONMap(levelName);
	this.createTileMap({x: 0, y: 0}, tileTypeMap);
};




// PARSE_JSON_MAP:
// Parses the data in a .JSON file, converting it to a tileTypeMap in the internal format
// This tileTypeMap is the same internal format as the game saves to and can then be passed to createTileMap to be created
// So the purpose of this function is simply to convert the static .JSON files produced by Tiled into our internal format
// It does not actually do any loading itself.
// ************************************************************************************************
gs.parseJSONMap = function (fileName, rotate = null, reflect = null) {
	var tileTypeMap,
		data,
		object,
		frame,
		frameOffset,
		objData,
		typeName;

	data = game.cache.getJSON(fileName);

	
	if (data.tilesets[1]) {
		frameOffset = data.tilesets[1].firstgid - 1;
	}
	
	// INIT_TILE_TYPE_MAP:
	// ********************************************************************************************
	tileTypeMap = [];
	for (let x = 0; x < data.width; x += 1) {
		tileTypeMap[x] = [];
		for (let y = 0; y < data.height; y += 1) {
			tileTypeMap[x][y] = {};
		}
	}
	tileTypeMap.width = data.width;
	tileTypeMap.height = data.height;
	
	// LOADING_TILE_LAYER:
	// ********************************************************************************************
	for (let x = 0; x < data.width; x += 1) {
		for (let y = 0; y < data.height; y += 1) {
			frame = data.layers[0].data[y * data.width + x] - 1;
			typeName = this.getNameFromFrame(frame, this.tileTypes);
			
			tileTypeMap[x][y].f = frame;
			
			if (frame === 480) {
				tileTypeMap[x][y].f = frameSelector.selectFrame(gs.tileTypes.Wall);
			}
			
			if (frame === 481) {
				tileTypeMap[x][y].f = frameSelector.selectFrame(gs.tileTypes.CaveWall);
			}
			
			if (frame === 482) {
				tileTypeMap[x][y].f = frameSelector.selectFrame(gs.tileTypes.Floor);
			}
			
			if (frame === 483) {
				tileTypeMap[x][y].f = frameSelector.selectFrame(gs.tileTypes.CaveFloor);
			}
			
			// Error Checking:
			if (!typeName) {
				throw 'parseJSONMap() failed, ' + frame + ' is not a valid frame. Index: ' + x + ',' + y;
			}
		}
	}
	
	// LOADING_FLAG_LAYER:
	// ********************************************************************************************
	if (data.layers[2]) {
		for (let y = 0; y < data.height; y += 1) {
			for (let x = 0; x < data.width; x += 1) {
				frame = data.layers[2].data[y * data.width + x] - 1;
				
				// isSolidWall flag:
				if (frame === 2016) {
					tileTypeMap[x][y].s = true;
				}
				
				// Zoo flag:
				if (frame === 2017) {
					tileTypeMap[x][y].spawnRandomZooNPC = true;
				}
				
				// Mob Flag:
				if (frame === 2020) {
					tileTypeMap[x][y].spawnRandomNPC = true;
				}
				
				// Closed:
				if (frame === 2019) {
					tileTypeMap[x][y].c = true;
				}
				
				// Trigger Tiles:
				if (frame >= 2023 && frame <= 2033) {
					tileTypeMap[x][y].t = frame - 2022;
				}
			}
		}
	}
	
	// LOADING_OBJECT_LAYER:
	// ********************************************************************************************
	if (data.layers[1]) {
		for (let i = 0; i < data.layers[1].objects.length; i += 1) {
			object = data.layers[1].objects[i];
			frame = object.gid - 1;
			let x = Math.round(object.x / (TILE_SIZE / SCALE_FACTOR));
			let y = Math.round(object.y / (TILE_SIZE / SCALE_FACTOR)) - 1;

			// Loading Objects
			if (this.getNameFromFrame(frame, this.objectTypes)) {
				// Creating objData:
				objData = {
					frame: frame,
					typeFrame: this.objectTypes[this.getNameFromFrame(frame, this.objectTypes)].frame
				};
				
				// Adding additional properties:
				if (object.properties) {
					for (let key in object.properties) {
						if (object.properties.hasOwnProperty(key)) {
							objData[key] = object.properties[key];
						}
					}
				}
				
				// Parse trigger:
				if (objData.hasOwnProperty('triggerTileIndex')) {
					objData.triggerTileIndex = JSON.parse(objData.triggerTileIndex);
				}
				
				// Parse toTileIndex:
				if (objData.hasOwnProperty('toTileIndex')) {
					objData.toTileIndex = JSON.parse(objData.toTileIndex);
				}
				
				tileTypeMap[x][y].obj = objData;
			}
			// Loading Characters:
			else if (data.tilesets[1] && this.getNameFromFrame(frame - frameOffset, this.npcTypes)) {
				tileTypeMap[x][y].npcTypeName = this.getNameFromFrame(frame - frameOffset, this.npcTypes);
				
				if (object.properties && object.properties.hasOwnProperty('isAlly')) {
					tileTypeMap[x][y].npcIsAlly = true;
				}
			}
			// Loading Items:
			else if (data.tilesets[1] && this.getNameFromFrame(frame - frameOffset, this.itemTypes)) {
				tileTypeMap[x][y].itemTypeName = this.getNameFromFrame(frame - frameOffset, this.itemTypes);
			}
			// Handle Mob Spawn object:
			else if (frame === 2020) {
				tileTypeMap[x][y].npcTypeList = JSON.parse(object.properties.npcTypeList);
			}
			// Unknown Frame:
			else {
				throw fileName + ' Unknown frame: ' + frame + ', at tileIndex: ' + x + ', ' + y;
			}
		}
	}
	
	// Rotate map:
	if (rotate) {
		tileTypeMap = this.rotateMap(tileTypeMap, rotate);
	}
	
	// Reflect map:
	if (reflect) {
		console.log('reflect');
		tileTypeMap = this.reflectMap(tileTypeMap);
	}
	
	
	return tileTypeMap;
};

// REFLECT_MAP:
// ************************************************************************************************
gs.reflectMap = function (map) {
	var newMap;
	
	newMap = [];
	for (let x = 0; x < map.width; x += 1) {
		newMap[x] = [];
		for (let y = 0; y < map.height; y += 1) {
			newMap[x][y] = map[x][y];
		}
	}
	newMap.width = map.width;
	newMap.height = map.height;
	
	// Reverse Tile Row:
	for (let y = 0; y < newMap.height; y += 1) {
		for (let x = 0; x < Math.floor(newMap.width / 2); x += 1) {
			let temp = newMap[x][y];
			newMap[x][y] = newMap[newMap.width - x - 1][y];
			newMap[newMap.width - x - 1][y] = temp;
		}
	}

	// Reverse tileIndex:
	for (let x = 0; x < newMap.width; x += 1) {
		for (let y = 0; y < newMap.height; y += 1) {
			if (newMap[x][y].obj) {
				// toTileIndex:
				if (newMap[x][y].obj.toTileIndex) {
					newMap[x][y].obj.toTileIndex.x = newMap.width - newMap[x][y].obj.toTileIndex.x - 1;
				}

				// triggerTileIndex:
				if (newMap[x][y].obj.triggerTileIndex) {
					for (let i = 0; i < newMap[x][y].obj.triggerTileIndex.length; i += 1) {
						newMap[x][y].obj.triggerTileIndex[i].x = newMap.width - newMap[x][y].obj.triggerTileIndex[i].x - 1;
					}
				}
			}
		}
	}
	
	// Reflecting object frames:
	for (let x = 0; x < newMap.width; x += 1) {
		for (let y = 0; y < newMap.height; y += 1) {
			if (newMap[x][y].obj) {
				newMap[x][y].obj.frame = gs.reflectObjectFrame(newMap[x][y].obj.frame);
			}
		}
	}
	
	return newMap;
};

// ROTATE_MAP:
// ************************************************************************************************
gs.rotateMap = function (map, angle) {
	var rotate90;
	
	rotate90 = function (map) {
		var newMap;
	
		// Transpose Tiles::
		newMap = [];
		for (let x = 0; x < map.height; x += 1) {
			newMap[x] = [];
			for (let y = 0; y < map.width; y += 1) {
				newMap[x][y] = map[y][x];
			}
		}
		newMap.width = map.height;
		newMap.height = map.width;
		
		// Transpose tileIndex:
		for (let x = 0; x < newMap.width; x += 1) {
			for (let y = 0; y < newMap.height; y += 1) {
				if (newMap[x][y].obj) {
					// toTileIndex:
					if (newMap[x][y].obj.toTileIndex) {
						newMap[x][y].obj.toTileIndex = {x: newMap[x][y].obj.toTileIndex.y, 
														y: newMap[x][y].obj.toTileIndex.x};
					}
					
					// triggerTileIndex:
					if (newMap[x][y].obj.triggerTileIndex) {
						for (let i = 0; i < newMap[x][y].obj.triggerTileIndex.length; i += 1) {
							newMap[x][y].obj.triggerTileIndex[i] = {x: newMap[x][y].obj.triggerTileIndex[i].y, 
																	y: newMap[x][y].obj.triggerTileIndex[i].x};
						}
					}
					
					
				}
			}
		}
			
		newMap = gs.reflectMap(newMap);
		
		return newMap;
	};
	
	if (angle === 90) {
		return rotate90(map);
	}
	else if (angle === 180) {
		map = rotate90(map);
		return rotate90(map);
	}
	else if (angle === 270) {
		map = rotate90(map);
		map = rotate90(map);
		return rotate90(map);
	}
	else {
		throw 'invalid angle';
	}
};




// SAVE_LEVEL:
// ************************************************************************************************
gs.saveLevel = function () {
    var x, y, i, j, data;
	
    data = {};
    data.numTilesX = this.numTilesX;
	data.numTilesY = this.numTilesY;
	data.levelController = levelController.toData();
	data.staticLevelName = gs.staticLevelName;
	data.levelTriggers = gs.levelTriggers;
	
	// Save tile map:
    data.tileMap = [];
    for (x = 0; x < this.numTilesX; x += 1) {
        data.tileMap[x] = [];
        for (y = 0; y < this.numTilesY; y += 1) {
            // Save Tile:
			data.tileMap[x][y] = {
				f: this.tileMap[x][y].frame,
			};
			
			// Optional Data (defaults to false on load):
			if (this.tileMap[x][y].explored)		data.tileMap[x][y].e = 1;
			if (this.tileMap[x][y].isClosed)		data.tileMap[x][y].c = 1;
			if (this.tileMap[x][y].triggerGroup) 	data.tileMap[x][y].t = this.tileMap[x][y].triggerGroup;
			
			// Save Objects:
			if (this.getObj(x, y)) {
				data.tileMap[x][y].obj = this.getObj(x, y).toData();
			}
        }
    }
	
	// Save npcs
    data.npcs = [];
	this.getAllNPCs().forEach(function (npc) {
		data.npcs.push(npc.toData());
	}, this);
    
    // Save items:
    data.items = [];
    for (i = 0; i < this.floorItemList.length; i += 1) {
        if (this.floorItemList[i].isAlive) {
            data.items.push(this.floorItemList[i].toData());
        }
    }
	
	// Save drop walls:
	data.dropWalls = [];
	for (i = 0; i < this.dropWallList.length; i += 1) {
		data.dropWalls.push(this.dropWallList[i]);
	}
	
	data.lastTurn = this.turn;
    localStorage.setItem(this.zoneName + this.zoneLevel, JSON.stringify(data));
};


// CAN_RELOAD_LEVEL:
// Can load previously saved level:
// ************************************************************************************************
gs.canReloadLevel = function (zoneName, zoneLevel) {
	return localStorage.getItem(zoneName + zoneLevel) !== null;
};

// RELOAD_LEVEL:
// Load previously saved level:
// ************************************************************************************************
gs.reloadLevel = function (zoneName, zoneLevel) {
    var i, data;
    
    data = JSON.parse(localStorage.getItem(zoneName + zoneLevel));
	this.numTilesX = data.numTilesX;
	this.numTilesY = data.numTilesY;
	levelController.loadData(data.levelController);
	gs.staticLevelName = data.staticLevelName;
	gs.levelTriggers = data.levelTriggers;
	
	// Create tile map:
	this.initiateTileMap();
	this.createTileMap({x: 0, y: 0}, data.tileMap);
	
    // load NPCs:
    for (i = 0; i < data.npcs.length; i += 1) {
		this.loadNPC(data.npcs[i]);		
    }
    
    // Load Items:
    for (i = 0; i < data.items.length; i += 1) {
		this.loadFloorItem(data.items[i]);
    }
	
	// Load Drop Walls:
	this.dropWallList = [];
	for (i = 0; i < data.dropWalls.length; i += 1) {
		this.dropWallList.push(data.dropWalls[i]);
	}
    
	this.lastTurn = data.lastTurn;
};


// CREATE_TILE_MAP:
// Given a tileTypeMap object, fill the tilemap with tiles and objects
// This function DOES NOT create NPCs
// This function DOES NOT create items
// ************************************************************************************************
gs.createTileMap = function (startTileIndex, tileTypeMap) {
    var tileIndex,
		numTilesX = tileTypeMap.length,
		numTilesY = tileTypeMap[0].length,
		obj,
		tileData;
	
    for (let x = 0; x < numTilesX; x += 1) {
        for (let y = 0; y < numTilesY; y += 1) {
			tileIndex = {x: startTileIndex.x + x, y: startTileIndex.y + y};
			tileData = tileTypeMap[x][y];
			
			// Tile Properties:
			this.getTile(tileIndex).explored = 		tileData.e || false;
			this.getTile(tileIndex).isClosed = 		tileData.c || false;
			this.getTile(tileIndex).isSolidWall = 	tileData.s || false;
			this.getTile(tileIndex).triggerGroup =	tileData.t || 0;
			
			// Tile Type:
			this.setTileType(tileIndex, this.tileTypes[this.getNameFromFrame(tileData.f, this.tileTypes)]);
			this.getTile(tileIndex).frame = tileData.f;
			
			// Objects:
			if (tileData.obj) {			
				// Offset triggerTileIndex:
				if (tileData.obj.triggerTileIndex) {
					tileData.obj.triggerTileIndex.forEach(function (index) {
						index.x = index.x + startTileIndex.x;
						index.y = index.y + startTileIndex.y;
					}, this);
				}
				
				// Offset toTileIndex:
				if (tileData.obj.toTileIndex) {
					tileData.obj.toTileIndex.x += startTileIndex.x;
					tileData.obj.toTileIndex.y += startTileIndex.y;
				}
				
				gs.loadObj(tileIndex, tileData.obj);
			}
			
			
			if (gs.debugProperties.spawnMobs || gs.zoneName === 'TestLevel') {
				// NPC (Given a specific NPC type):
				if (tileData.npcTypeName) {
					let npc = gs.createNPC(tileIndex, tileData.npcTypeName);
					
					if (tileData.npcIsAlly) {
						npc.faction = FACTION.PLAYER;
					}
				}

				// NPC (Given an npcTypeList):
				if (tileData.npcTypeList) {
					gs.createNPC(tileIndex, util.randElem(tileData.npcTypeList));
				}

				// spawnRandomNPC:
				if (tileData.spawnRandomNPC) {
					gs.spawnRandomNPC(tileIndex);
					gs.getChar(tileIndex).isAsleep = false;
				}

				// spawnRandomZooNPC:
				if (tileData.spawnRandomZooNPC) {
					gs.spawnMonsterZooNPC(tileIndex);
					gs.getChar(tileIndex).isAsleep = false;
				}
			}
			
			// Item:
			if (tileData.itemTypeName) {
				gs.createFloorItem(tileIndex, Item.createItem(tileData.itemTypeName));
			}
        }
    }
};


