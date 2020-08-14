/*global game, gs, console, Phaser, localStorage*/
/*global LARGE_WHITE_FONT, SCALE_FACTOR, FACTION, NUM_TILES_X, NUM_TILES_Y, LARGE_BOLD_WHITE_FONT, SMALL_WHITE_FONT*/
/*global TILE_SIZE*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

var util = {};

// GET_NAME_FROM_FRAME:
// ************************************************************************************************
gs.getNameFromFrame = function (frame, typeList) {
	for (let key in typeList) {
		if (typeList.hasOwnProperty(key)) {
			if (typeList[key].frame === frame || (typeList[key].frames && this.inArray(frame, typeList[key].frames))) {
				return typeList[key].name;
			}
		}
	}

	return null;
};

// TO_POSITION:
// ************************************************************************************************
util.toPosition = function (tileIndex) {
    return {x: (tileIndex.x * TILE_SIZE) + (TILE_SIZE / 2),
            y: (tileIndex.y * TILE_SIZE) + (TILE_SIZE / 2)};
};

// TO_TILE_INDEX:
// ************************************************************************************************
gs.toTileIndex = function (position) {
    return {x: Math.floor(position.x / TILE_SIZE), y: Math.floor(position.y / TILE_SIZE)};
};

// TO_PERCENT_STRING:
// ************************************************************************************************
gs.toPercentStr = function (frac) {
	return Math.round(gs.roundValue(frac) * 100) + '%';
};

// IS_STRAIGHT:
// Are the two tileIndices on either an orthogonal or diagonal straight line
// ************************************************************************************************
gs.isStraight = function (t1, t2) {
	return t1.x === t2.x || t1.y === t2.y || Math.abs(t1.x - t2.x) === Math.abs(t1.y - t2.y);
};

// GET_8_WAY_VECTOR:
gs.get8WayVector = function (fromTileIndex, toTileIndex) {
	return {x: (toTileIndex.x - fromTileIndex.x) / (Math.abs(toTileIndex.x - fromTileIndex.x) || 1),
			y: (toTileIndex.y - fromTileIndex.y) / (Math.abs(toTileIndex.y - fromTileIndex.y) || 1)};	
};

// ARRAY_INTERSECT:
// Returns a new array that is the intersection of a1 and a2
// ************************************************************************************************
gs.arrayIntersect = function (a1, a2) {
	return a1.filter(e => a2.indexOf(e) !== -1);
};


// RAND_INT:
// ************************************************************************************************
util.randInt = function (min, max) {
	return game.rnd.integerInRange(Math.floor(min), Math.ceil(max));
};

// FRAC:
// ************************************************************************************************
util.frac = function () {
	return game.rnd.frac();
};

gs.forEachType = function (types, func, context) {
	var key;
	
	for (key in types) {
		if (types.hasOwnProperty(key)) {
			func.call(context, types[key]);
		}
	}
};


// CREATE_BOX:
// ************************************************************************************************
gs.createBox = function (startX, startY, endX, endY) {
	var box = {};
	box.startX = startX;
	box.startY = startY;
	box.endX = endX;
	box.endY = endY;
	box.width = endX - startX;
	box.height = endY - startY;
	box.centerX = box.startX + Math.floor(box.width / 2);
	box.centerY = box.startY + Math.floor(box.height / 2);
	
	box.startTileIndex = {x: startX, y: startY};
	box.endTileIndex = {x: endX, y: endY};
	box.centerTileIndex = {x: box.centerX, y: box.centerY};
	
	return box;
};

// BOX_TYPE:
// ************************************************************************************************
util.boxType = function (box) {
	if (Math.min(box.width, box.height) / Math.max(box.width, box.height) > 0.8) {
		return 'SQUARE';
	}
	else if (box.width > box.height) {
		return 'WIDE';
	}
	else {
		return 'TALL';
	}
};

// BOX_TILE_AREA:
// ************************************************************************************************
util.boxTileArea = function (box) {
	return box.width * box.height;
};

// INTERSECT_BOX:
// Returns the box that is the intersection of both boxes:
// ************************************************************************************************
util.intersectBox = function (box1, box2) {
	var minX = 1000, minY = 10000, maxX = -1, maxY = -1;
	
	gs.getIndexInBox(box1).forEach(function (tileIndex) {
		if (util.isInBox(tileIndex, box2)) {
			minX = Math.min(minX, tileIndex.x);
			minY = Math.min(minY, tileIndex.y);
			maxX = Math.max(maxX, tileIndex.x);
			maxY = Math.max(maxY, tileIndex.y);
		}
	}, this);
	
	if (minX < maxX && minY < maxY) {
		return gs.createBox(minX, minY, maxX + 1, maxY + 1);
	}
	else {
		return null;
	}
};

// IS_IN_BOX:
// Returns true if the tileIndex is inside the box:
// Remember that boxes are lower bounds inclusive and upper bounds exclusive
// ************************************************************************************************
util.isInBox = function (tileIndex, box) {
	return tileIndex.x >= box.startX
		&& tileIndex.y >= box.startY
		&& tileIndex.x < box.endX
		&& tileIndex.y < box.endY;
};

// IS_DIAGONALLY_ADJACENT:
// ************************************************************************************************
util.isDiagonallyAdjacent = function (tileIndex1, tileIndex2) {
	return tileIndex1.x === tileIndex2.x - 1 && tileIndex1.y === tileIndex2.y - 1
		|| tileIndex1.x === tileIndex2.x - 1 && tileIndex1.y === tileIndex2.y + 1
		|| tileIndex1.x === tileIndex2.x + 1 && tileIndex1.y === tileIndex2.y - 1
		|| tileIndex1.x === tileIndex2.x + 1 && tileIndex1.y === tileIndex2.y + 1;
};

// GET_BOUNDING_BOX:
// ************************************************************************************************
util.getBoundingBox = function (indexList) {
	var minX = NUM_TILES_X,
		minY = NUM_TILES_Y,
		maxX = 0,
		maxY = 0;
	
	indexList.forEach(function (index) {
		minX = Math.min(minX, index.x);
		minY = Math.min(minY, index.y);
		maxX = Math.max(maxX, index.x);
		maxY = Math.max(maxY, index.y);
	}, this);
	
	return gs.createBox(minX, minY, maxX + 1, maxY + 1);
};

// EDGE_BOX_INDEX_LIST:
// Returns a list of tileIndices that are on the edges of the box:
// ************************************************************************************************
util.edgeBoxIndexList = function (box) {
	var indexList = [];
	
	gs.getIndexInBox(box).forEach(function (tileIndex) {
		if (tileIndex.x === box.startX || tileIndex.y === box.startY || tileIndex.x === box.endX - 1 || tileIndex.y === box.endY - 1) {
			indexList.push({x: tileIndex.x, y: tileIndex.y});
		}
	}, this);
	
	return indexList;
};

// INNER_BOX:
// Returns the box that is 1 smaller on all edges
// ************************************************************************************************
util.innerBox = function (box) {
	return gs.createBox(box.startX + 1, box.startY + 1, box.endX - 1, box.endY - 1);
};

// INNER_AREA_INDEX_LIST:
// Returns a list of tileIndices that belong to the area and are at least 1 tile away from walls
// This is useful for dressing the interior of a room while guaranteeing traversability
// ************************************************************************************************
util.innerAreaIndexList = function (area) {
	var indexList;
	
	indexList = gs.getIndexInBox(area);
	indexList = indexList.filter(index => gs.getTile(index).area === area);
	
	indexList = indexList.filter(function (index) {
		return !gs.getIndexListCardinalAdjacent(index).some(idx => !gs.getTile(idx).type.passable)
			&& !gs.getIndexListCardinalAdjacent(index).some(idx => gs.getArea(idx) !== area);
	}, this);
	
	return indexList;
};


// CREATE_SPRITE:
// ************************************************************************************************
gs.createSprite = function (x, y, image, group) {
    var sprite;
	
    //sprite = game.add.sprite(x, y, image);
	sprite = game.add.image(x, y, image);
    sprite.smoothed = false;
 
    if (group) {
        group.add(sprite);
    }
    
    return sprite;
};

// CREATE TEXT:
// ************************************************************************************************
gs.createText = function (x, y, textStr, font, group) {
    var text, ref, ref2;
	
	
	text = game.add.text(x, y, textStr, font);
	//text = game.add.bitmapText(x, y, 'Silkscreen', textStr, 14);
	
	text.smoothed = false;
	
	// Overwrite setText:
	ref = text.setText;
	
	text.setText = function (str) {
		if (this.text != str) {
			ref.call(this, str);
		}
	};
	
	// Overwrite setStyle:
	ref2 = text.setStyle;
	
	text.setStyle = function (style) {
		if (this.style != style) {
			ref2.call(this, style);
		}
	};
	
	
    if (group) {
        group.add(text);
    }
    
    return text;
};

// CREATE_SMALL_BUTTON:
// ************************************************************************************************
gs.createSmallButton = function (x, y, frame, callBack, context, group) {
	var button;
	button = game.add.button(x, y, 'Tileset', callBack, context, frame + 1, frame);
	button.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	button.hitArea = new Phaser.Rectangle(4, 4, 12, 12);
	group.add(button);
	return button;
};


// CREATE_BUTTON:
// ************************************************************************************************
gs.createButton = function (x, y, image, callBack, context, group) {
    var button = game.add.button(x, y, image, callBack, context);
    button.smoothed = false;

	if (group) {
		group.add(button);
	}
    return button;
};

// CREATE_TEXT_BUTTON:
// ************************************************************************************************
gs.createTextButton = function (x, y, text, callBack, context, group) {
    var button = {};
    
    // Create button group:
    button.group = game.add.group();
    button.group.x = x;
	button.group.y = y;
	
    // Create button:
    button.button = game.add.button(0, 0, 'SmallTextButton', callBack, context, 1, 0, 0, 0);
	button.button.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
    button.button.smoothed = false;
    button.button.anchor.setTo(0.5, 0.5);
    button.group.add(button.button);
    
    // Create text:
    button.text = game.add.text(-1, 3, text, SMALL_WHITE_FONT);
	button.text.anchor.setTo(0.5, 0.5);
	
	//this.centerText(button.text);
    
	button.group.add(button.text);
	
	if (group) {
		group.add(button.group);
	}
    
    return button;
};



// CREATE_ICON_BUTTON:
gs.createIconButton = function (x, y, frame, callBack, context, group) {
	var button;
	
	this.createSprite(x, y, 'Slot', group);
	button = this.createButton(x + 2, y + 2, 'InterfaceTileset', callBack, context, group);
	button.frame = frame;
	
	return button;
};

// IN_ARRAY:
// ************************************************************************************************
gs.inArray =  function (element, array) {
    for (let i = 0; i < array.length; i += 1) {
        if (array[i] === element) {
            return true;
        }
    }

    return false;
};

// REMOVE_FROM_ARRAY:
// ************************************************************************************************
gs.removeFromArray = function (element, array) {
    for (let i = 0; i < array.length; i += 1) {
        if (array[i] === element) {
            array.splice(i, 1);
            return;
        }
    }
};

// RAND_ELEM:
// ************************************************************************************************
util.randElem = function (list) {
	if (list.length === 0) {
		throw 'list.length === 0';
	}
	if (list.length === 1) {
		return list[0];
	} else {
		return list[util.randInt(0, list.length - 1)];
	}
};

// CHOOSE_RANDOM:
// ************************************************************************************************
gs.chooseRandom = function (table) {
    var sum = table.reduce(function (pV, nV) {return pV + nV.percent; }, 0),
		percentSum = 0,
        rand = util.randInt(0, sum - 1),
        i;
	
    for (i = 0; i < table.length; i += 1) {
        percentSum += table[i].percent;
        if (rand < percentSum) {
            return table[i].name;
        }
    }
    
    return table[table.length - 1].name;
};

// RAND_SUBSET:
// ************************************************************************************************
gs.randSubset = function (list, size) {
	var copyList = list.slice(0),
		subset = [],
		i;
	
	if (size > list.length) {
		throw 'size > list.length';
	}
	
	for (i = 0; i < size; i += 1) {
		subset.push(copyList.splice(Math.floor(util.randInt(0, copyList.length - 1)), 1)[0]);
	}
	return subset;
};

// RANDOM_COLOR:
// ************************************************************************************************
gs.randomColor = function () {
	return 'rgb(' + util.randInt(0, 255) + ',' + util.randInt(0, 255) + ',' + util.randInt(0, 255) + ')';
};

// CAPITAL_SPLIT:
// ************************************************************************************************
gs.capitalSplit = function (string) {
	
	return string;
	
	var array;
	
	if (!string || string.length === 0) {
		return "";
	}
	
	// Make sure to capitalize first letter:
	string = string.charAt(0).toUpperCase() + string.slice(1);
	
	array = string.match(/[A-Z][a-z]+/g);
	return array.join(' ');
};

// WRAP_TEXT:
// ************************************************************************************************
gs.wrapText = function (text, maxWidth) {
    var i, j, lineStart = 0, lineEnd = 0, breaklines = [], lines = [];

    if (typeof (String.prototype.trim) === "undefined") {
        String.prototype.trim = function () {
            return String(this).replace(/^\s+|\s+$/g, '');
        };
    }

    breaklines = text.split('\n');

    for (j = 0; j < breaklines.length; j += 1) {
        lineStart = 0;
        lineEnd = 0;
        for (i = 0; i < breaklines[j].length; i += 1) {
            if (breaklines[j][i] === ' ') {
                lineEnd = i;
            }

            if (i - lineStart === maxWidth) {
                lines.push(breaklines[j].substring(lineStart, lineEnd));
                lineStart = lineEnd;
            }
        }

        // add remaining text:
        lines.push(breaklines[j].substring(lineStart, breaklines[j].length));
    }


    for (i = 0; i < lines.length; i += 1) {
        lines[i] = lines[i].trim();
    }

    return lines;
};

// COUNT_CHILDREN:
// ************************************************************************************************
gs.countChildren = function (group) {
	var i, sum = 0;
	// Base Case:
	if (!group.children || group.children.length === 0) {
		return 1;
	}
	
	// Recursive Case:
	for (i = 0; i < group.children.length; i += 1) {
		sum += gs.countChildren(group.children[i]);
	}
	return sum;
};

// NAME_TYPES:
// ************************************************************************************************
gs.nameTypes = function (types) {
	var key;
	
	for (key in types) {
		if (types.hasOwnProperty(key)) {
			types[key].name = key;
			types[key].niceName = this.capitalSplit(key);
		}
	}
};

// RANGE:
// ************************************************************************************************
gs.range = function (startNum, endNum, step) {
	var i, arr = [];
	
	step = step || 1;
	
	for (i = startNum; i <= endNum; i += step) {
		arr.push(i);
	}
	return arr;
};

// CREATE_2D_ARRAY:
// ************************************************************************************************
gs.create2DArray = function (numX, numY, createFunc, context) {
    var x, y, array;
    
    array = [];
    for (x = 0; x < numX; x += 1) {
        array[x] = [];
        for (y = 0; y < numY; y += 1) {
            array[x][y] = createFunc.call(context, x, y);
        }
    }
    return array;
};



gs.roundValue = function (value, numDec) {
	numDec = numDec || 2;
	return Math.round(value * Math.pow(10, numDec)) / Math.pow(10, numDec);
};

gs.roundStr = function (value, numDec) {
	numDec = numDec || 2;
	
	value = this.roundValue(value, numDec);
	value = String(value);
	
	while (value.length < 5) {
		value += ' ';
	}
	
	return value;
};

gs.countTypes = function (types) {
	var key, count = 0;
	
	for (key in types) {
		if (types.hasOwnProperty(key) && !types[key].hasOwnProperty('faction') || types[key].faction === FACTION.HOSTILE) {
			if (types[key].slot === undefined || types[key].slot !== 'none') {
				count += 1;
			}
			
		}
	}
	return count;
};

// CENTER_TEXT:
// ************************************************************************************************
gs.centerText = function (text) {
	text.anchor.x = Math.round(text.width * 0.5) / text.width;
	text.anchor.y = Math.round(text.height * 0.5) / text.height;
	
	if (text.anchor.x % 2 === 1) {
		text.anchor.x += 1;
	}
};

// CENTER_TEXT_X:
// ************************************************************************************************
gs.centerTextX = function (text) {
	text.anchor.x = Math.round(text.width * 0.5) / text.width;
	
	if (text.anchor.x % 2 === 1) {
		text.anchor.x += 1;
	}
};

// VECTOR_EQUAL:
// ************************************************************************************************
gs.vectorEqual = function (v1, v2) {
	return v1.x === v2.x && v1.y === v2.y;
};

// DISTANCE:
// ************************************************************************************************
util.distance = function (v1, v2) {
    return game.math.distance(v1.x, v1.y, v2.x, v2.y);
};

// SQ_DISTANCE:
// ************************************************************************************************
util.sqDistance = function (v1, v2) {
	return Math.max(Math.abs(v1.x - v2.x), Math.abs(v1.y - v2.y));
};

// GET_CARDINAL_VECTOR:
// This function returns a vector representing a cardinal direction
// [1, 0], [-1, 0], [0, 1], [0, -1]
// This represents the nearest cardinal direction between fromTileIndex and toTileIndex
// ************************************************************************************************
gs.getCardinalVector = function (fromTileIndex, toTileIndex) {
	if (this.vectorEqual(fromTileIndex, toTileIndex)) {
		return null;
	}
	
	// X-axis is longest:
	if (Math.abs(fromTileIndex.x - toTileIndex.x) > Math.abs(fromTileIndex.y - toTileIndex.y)) {
		return {x: fromTileIndex.x < toTileIndex.x ? 1 : -1, y: 0};
	} 
	// Y-axis is longest:
	else {
		return {x: 0, y: fromTileIndex.y < toTileIndex.y ? 1 : -1};
	}
};

// GET_NORMAL_FROM_ANGLE:
// ************************************************************************************************
gs.getNormalFromAngle = function (angle) {
	angle = angle * Math.PI / 180;
	return {x: Math.sin(angle), y: Math.cos(angle)};
};

// NORMAL:
// ************************************************************************************************
util.normal = function (startPosition, endPosition) {
    var length = game.math.distance(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
    
    return {x: (endPosition.x - startPosition.x) / length,
            y: (endPosition.y - startPosition.y) / length};
};

// GET_ORTHO_VECTOR:
// ************************************************************************************************
gs.getOrthoVector = function (vector) {
	return {x: -vector.y, y: vector.x};
};



// LAST_LINES:
// Return the last [num] lines:
// ************************************************************************************************
gs.lastLines = function (lines, num) {
	if (lines.length <= num) {
		return lines;
	} else {
		return lines.slice(lines.length - num);
	}
};

// ASSERT:
// ************************************************************************************************
gs.ASSERT = function (predicate, text) {
	if (this.debugProperties.throwExceps && !predicate) {
		throw text;
	}
};

// TIME_TO_STRING:
// ************************************************************************************************
gs.timeToString = function (time) {
	var seconds = Math.round(time / 1000) % 60,
		mins = Math.floor(Math.round(time / 1000) / 60);
		
	if (seconds < 10) {
		return '' + mins + ':0' + seconds;
	}
	else {
		return '' + mins + ':' + seconds;
	}
	
};

// ANGLE_TO_FACE:
// ************************************************************************************************
util.angleToFace = function (fromPos, toPos) {
    return (game.math.angleBetween(fromPos.x, -fromPos.y, toPos.x, -toPos.y)) * 180 / Math.PI + 135;
};

// FURTHEST_INDEX:
// Given an indexList get the index that is furthest from tileIndex:
// ************************************************************************************************
util.getFurthestIndex = function (tileIndex, indexList) {
	indexList.sort((a, b) => util.distance(b, tileIndex) - util.distance(a, tileIndex));
	return indexList[0];
};