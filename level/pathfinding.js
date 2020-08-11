/*global gs, util, console*/
/*global LARGE_WHITE_FONT*/
/*global TILE_SIZE*/
/*global FACTION*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// FIND_UNEXPLORED_TILE_INDEX:
// Flood the entire level testing tileType passability until the nearest unexplored tile is found
// ************************************************************************************************
gs.findUnexploredTileIndex = function (fromTileIndex, unsafeMove = false) {
	var openList = [],
		closedList = [],
		currentTileIndex,
		tryToAddChild,
		addChild,
		isInOpenList,
		isInClosedList,
		isGoodTile,
		indexList,
		i,
		canPassDoor,
		isAllyAtIndex,
		nearestUnexploredTileIndex = null,
		allowDiagonal = gs.pc.movementSpeed > 0;
	
	// IS_GOOD_TILE:
	isGoodTile = function (tileIndex) {
		return (!gs.getTile(tileIndex).explored && gs.isPassable(tileIndex))
			|| (gs.getItem(tileIndex) && !gs.getItem(tileIndex).wasDropped)
			|| gs.getObj(tileIndex, ['HealingShroom', 'EnergyShroom'])
			|| gs.getObj(tileIndex, obj => obj.type.name === 'BookShelf' && obj.isFull)
			|| gs.getChar(tileIndex) && gs.getChar(tileIndex).type.name === 'Crate' && util.distance(tileIndex, gs.pc.tileIndex) >= gs.pc.inventory.getWeapon().type.minRange
			|| gs.getObj(tileIndex, obj => obj.isContainer() && !obj.isOpen && !obj.isGuarded);
	};
	
	isAllyAtIndex = function (tileIndex) {
		return gs.getChar(tileIndex) && gs.getChar(tileIndex).faction === FACTION.PLAYER;
	};
	
	canPassDoor = function (tileIndex) {
		return gs.getObj(tileIndex, obj => obj.isDoor())
			&& (gs.getObj(tileIndex).isOpen || !gs.getObj(tileIndex, obj => obj.isGuarded || obj.isLocked || obj.isSealed));
	};
	
	// TRY_TO_ADD_CHILD:
	tryToAddChild = function (tileIndex) {
		if (gs.isInBounds(tileIndex)
				&& (gs.isPassable(tileIndex) || isAllyAtIndex(tileIndex) || canPassDoor(tileIndex) || isGoodTile(tileIndex))
				&& (gs.isIndexSafe(tileIndex, gs.pc) || unsafeMove)
				&& gs.pc.canWalk(tileIndex)
				&& !isInOpenList(tileIndex)
				&& !isInClosedList(tileIndex)) {
			
			openList.push(tileIndex);
			
			if (isGoodTile(tileIndex)) {
				nearestUnexploredTileIndex = tileIndex;
			}
        }
	};
	
	// IS_IN_OPEN_LIST:
	isInOpenList = function (tileIndex) {
		return openList.find(function (index) {return index.x === tileIndex.x && index.y === tileIndex.y; });
	};
	
	// IS_IN_CLOSED_LIST:
	isInClosedList = function (tileIndex) {
		return closedList.find(function (index) {return index.x === tileIndex.x && index.y === tileIndex.y; });
	};
	
	
	// Return any items, shrooms or containers that have already been discovered before searching further:
	indexList = this.getAllIndex();
	indexList = indexList.filter(index => gs.getTile(index).explored);
	indexList = indexList.filter(index => isGoodTile(index));
	indexList = indexList.filter(index => gs.isIndexSafe(index, gs.pc));
	indexList = indexList.filter(index => util.distance(index, gs.pc.tileIndex) < 10);
	indexList = indexList.sort((indexA,indexB) => util.distance(indexA, gs.pc.tileIndex) - util.distance(indexB, gs.pc.tileIndex));
	for (i = 0; i < indexList.length; i += 1) {
		// Player must have a valid path to it:
		if (this.pc.getPathTo(indexList[i])) {
			return indexList[i];
		}
	}
	
	
	openList.push(fromTileIndex);
	
	while (openList.length > 0) {
		currentTileIndex = openList.shift();
		closedList.push(currentTileIndex);
		
		// Add adjacent:
		tryToAddChild({x: currentTileIndex.x + 1, y: currentTileIndex.y});
		tryToAddChild({x: currentTileIndex.x - 1, y: currentTileIndex.y});
		tryToAddChild({x: currentTileIndex.x, y: currentTileIndex.y + 1});
		tryToAddChild({x: currentTileIndex.x, y: currentTileIndex.y - 1});
		
		// Add adjacent diagonals:
		if (allowDiagonal) {
			tryToAddChild({x: currentTileIndex.x + 1, y: currentTileIndex.y - 1});
			tryToAddChild({x: currentTileIndex.x - 1, y: currentTileIndex.y - 1});
			tryToAddChild({x: currentTileIndex.x + 1, y: currentTileIndex.y + 1});
			tryToAddChild({x: currentTileIndex.x - 1, y: currentTileIndex.y + 1});
		}
		
		if (nearestUnexploredTileIndex) {
			break;
		}
	}
	
	// unsafe move (trim to first 
	if (unsafeMove && nearestUnexploredTileIndex) {
		
		let path = gs.findPath(fromTileIndex, nearestUnexploredTileIndex, {allowDiagonal: allowDiagonal});
		if (path && path.length > 0) {
			let index = path.indexOf(path.find(index => !gs.isIndexSafe(index, gs.pc)));
			
			if (index > -1 && index + 1 < path.length && gs.isIndexSafe(path[index + 1], gs.pc)) {
				nearestUnexploredTileIndex = path[index + 1];	
			}
			else {
				nearestUnexploredTileIndex = null;
			}
		}
		else {
			nearestUnexploredTileIndex = null;
		}
	}
	
	return nearestUnexploredTileIndex;
};


// FIND_PATH:
// ************************************************************************************************
gs.findPath = function (fromIndex, toIndex, flags) {
	var calculateH,
		tryToAddChild,
		addChild,
		isInOpenList,
		isInClosedList,
		getNodeFromOpenList,
		popOpenListF,
		createPath,
		openList = [],
		closedList = {},
		loopCount = 0,
		exitState = 0,
		currentNode,
		indexPath = [],
		canWalkFunc,
		passDoors,
		exploredOnly,
		avoidTraps,
		character,
		maxDepth,
		allowDiagonal,
		isValidTileIndex,
		accuracy,
		isAllyAtIndex;
	
	// Flags:
	flags = flags || {};
	passDoors = flags.passDoors || false;
	canWalkFunc = flags.canWalkFunc || null;
	exploredOnly = flags.exploredOnly || false;
	avoidTraps = flags.avoidTraps || false;
	character = flags.character || null;
	maxDepth = flags.maxDepth || 1000;
	allowDiagonal = flags.allowDiagonal || false;
	isValidTileIndex = flags.isValidTileIndex;
	calculateH = flags.calculateH;
	accuracy = flags.drunk ? 0.25 : 1.0;
	
	if (!canWalkFunc) {
		canWalkFunc = function () {
			return true;
		};
	}
	
	isAllyAtIndex = function (tileIndex) {
		return character === gs.pc && gs.getChar(tileIndex) && gs.getChar(tileIndex).faction === FACTION.PLAYER;
	};
	
	if (!isValidTileIndex) {
		isValidTileIndex = function (tileIndex) {
			return (gs.isPassable(tileIndex) || isAllyAtIndex(tileIndex) || (gs.getObj(tileIndex, obj => obj.isDoor() && !obj.isLocked && !obj.isGuarded && !obj.isSealed) && passDoors))
				&& (!exploredOnly || gs.getTile(tileIndex).explored)
				&& (!avoidTraps || gs.isIndexSafe(tileIndex, character))
				&& canWalkFunc(tileIndex);
		};
	}
	
	if (!calculateH) {
		calculateH = function (tileIndex) {
			return util.distance(tileIndex, toIndex); 
		};
	}
	
	addChild = function (parentNode, tileIndex, hCost, gCost) {
		var tempNode;
		
		// Node is not on the open list so create it:
		if (!isInOpenList(tileIndex)) {
			openList.push({tileIndex: tileIndex, 
						   parentNode: parentNode, 
						   g: parentNode.g + gCost, 
						   h: hCost, 
						   f: parentNode.g + gCost + hCost});
		} 
		// Node is on the open list, check if this is a shorter path:
		else {
			tempNode = getNodeFromOpenList(tileIndex);
			if (parentNode.g + gCost + hCost < tempNode.f) {
				tempNode.parentNode = parentNode;
				tempNode.g = parentNode.g + gCost;
				tempNode.f = tempNode.h + tempNode.g;
			}
		}
	};
	
	isInOpenList = function (tileIndex) {
		return openList.find(node => gs.vectorEqual(node.tileIndex, tileIndex));
	};
	
	isInClosedList = function (tileIndex) {
		//return closedList.find(node => gs.vectorEqual(node.tileIndex, tileIndex));
		return closedList.hasOwnProperty(tileIndex.x + ',' + tileIndex.y);
	};
	
	getNodeFromOpenList = function (tileIndex) {
		return openList.find(node => gs.vectorEqual(node.tileIndex, tileIndex));
	};
	
	popOpenListF = function () {
		var lowestNode = openList[0],
			lowestIndex = 0,
			i;
		
		
		for (i = 0; i < openList.length; i += 1) {
			if ((openList[i].f < lowestNode.f || openList[i].f === lowestNode.f && openList[i].h < lowestNode.h) && (accuracy === 1 || util.frac() <= accuracy)) {
				lowestNode = openList[i];
				lowestIndex = i;
			}
		}
		
		openList.splice(lowestIndex, 1);
		return lowestNode;
	};
	
	tryToAddChild = function (tileIndex) {
		if (gs.isInBounds(tileIndex) && isValidTileIndex(tileIndex) && !isInClosedList(tileIndex)) {
			addChild(currentNode, {x: tileIndex.x, y: tileIndex.y}, calculateH({x: tileIndex.x, y: tileIndex.y}), 1);
        } 
		// Always add the goal
		else if (gs.vectorEqual(tileIndex, toIndex)) {
            addChild(currentNode, {x: tileIndex.x, y: tileIndex.y}, calculateH({x: tileIndex.x, y: tileIndex.y}), 1);
        }
	};
	
	// Quick return if destination is invalid:
	let indexList = gs.getIndexInRadius(toIndex, 1.5);
	indexList = indexList.filter(index => isValidTileIndex(index));
	if (indexList.length === 0) {
		return null;
	}
	
	// Push first node:
	openList.push({tileIndex: fromIndex, parentNode: null, g: 0, h: calculateH(fromIndex), f: calculateH(fromIndex)});
	
	while (true) {
		// No path exists:
		if (openList.length === 0) {
			exitState = -1;
			break;
		}
		
		// Loop count exceeded:
		if (loopCount > maxDepth) {
			exitState = -2;
			break;
		}
		
		currentNode = popOpenListF();
		
		if (gs.debugProperties.logPathFinding) {
			gs.createText(currentNode.tileIndex.x * TILE_SIZE, currentNode.tileIndex.y * TILE_SIZE, '' + loopCount, LARGE_WHITE_FONT);
		}

		// Found goal:
		if (gs.vectorEqual(currentNode.tileIndex, toIndex)) { 
			exitState = 1;
			break;
		}
		
		// Add adjacent:
		tryToAddChild({x: currentNode.tileIndex.x + 1, y: currentNode.tileIndex.y});
		tryToAddChild({x: currentNode.tileIndex.x - 1, y: currentNode.tileIndex.y});
		tryToAddChild({x: currentNode.tileIndex.x, y: currentNode.tileIndex.y + 1});
		tryToAddChild({x: currentNode.tileIndex.x, y: currentNode.tileIndex.y - 1});
		
		if (allowDiagonal) {
			tryToAddChild({x: currentNode.tileIndex.x + 1, y: currentNode.tileIndex.y - 1});
			tryToAddChild({x: currentNode.tileIndex.x - 1, y: currentNode.tileIndex.y - 1});
			tryToAddChild({x: currentNode.tileIndex.x + 1, y: currentNode.tileIndex.y + 1});
			tryToAddChild({x: currentNode.tileIndex.x - 1, y: currentNode.tileIndex.y + 1});
		}
		
		//closedList.push(currentNode);
		closedList[currentNode.tileIndex.x + ',' + currentNode.tileIndex.y] = 1;
		loopCount += 1;
	}
	
	//console.log('loopCount: ' + loopCount);
	//console.log('closedList: ' + closedList.length);
	
	if (exitState === -1 || exitState === -2) {
		return null;
	} 
	else if (exitState === 1) {
		// Start at goal node and work backwords:
		while (currentNode.parentNode) {
			indexPath.push(currentNode.tileIndex);
			currentNode = currentNode.parentNode;
		}
		
		//console.log('pathLength: ' + indexPath.length);
		return indexPath;
	}
};