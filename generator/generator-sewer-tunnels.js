/*global game, gs, console, Phaser, util*/
/*global BaseGenerator*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function SewerTunnelsGenerator() {
	this.name = 'SewerTunnelsGenerator';
}
SewerTunnelsGenerator.prototype = new BaseGenerator();
var sewerTunnelsGenerator = new SewerTunnelsGenerator();

// GENERATE:
// ************************************************************************************************
SewerTunnelsGenerator.prototype.generate = function (flags) {
	var area, nodes;

	this.flags = flags || {};
	this.roomAreaList = [];

	// Properties:
	this.NUM_NODES = util.randInt(3, 5); // 4
	this.TUNNEL_WIDTH = util.randInt(2, 4); // 4
	this.TUNNEL_WATER_PERCENT = util.randElem([0.25, 0.50, 0.75, 1.0]);
	this.HIGH_CONNECTIVITY = game.rnd.frac() <= 0.25;
	this.BLANK_PERCENT = util.randElem([0.5, 0.75]);
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.Wall);

	// Layout Map:
	this.layoutMap();

	// Place Tunnels
	this.placeTunnels();

	// Place Node Rooms:
	this.placeNodeRooms(nodes);
	
	this.fillBorderWall();
	
	gs.areaList = this.roomAreaList;
	
	return true;
};

// LAYOUT_MAP:
// ************************************************************************************************
SewerTunnelsGenerator.prototype.layoutMap = function () {
	var x, y, nodes, edges, getNextNode, createRandomPath, connectNode;

	// GET_NEXT_NODE:
	getNextNode = function (fromNode) {
		var list = [];
		if (fromNode.x < sewerTunnelsGenerator.NUM_NODES - 1) {
			list.push({x: fromNode.x + 1, y: fromNode.y});
		}
		if (fromNode.y < sewerTunnelsGenerator.NUM_NODES - 1) {
			list.push({x: fromNode.x, y: fromNode.y + 1});
		}
		return util.randElem(list);
	};

	// CREATE_RANDOM_PATH:
	createRandomPath = function () {
		var currentNode, nextNode;
		currentNode = nodes[0][0];
		nodes[0][0].isConnected = true;
		while (currentNode.x !== sewerTunnelsGenerator.NUM_NODES - 1 || currentNode.y !== sewerTunnelsGenerator.NUM_NODES - 1) {
			nextNode = getNextNode(currentNode);
			edges.push({node1: {x: currentNode.x, y: currentNode.y},
						node2: {x: nextNode.x, y: nextNode.y}});
			currentNode = nextNode;
			nodes[nextNode.x][nextNode.y].isConnected = true;
			nodes[nextNode.x][nextNode.y].partOfPath = true;
		}
	};

	// CONNECT_NODE:
	connectNode = function (node) {
		var list = [], node2;
		if (node.x > 0 && nodes[node.x - 1][node.y].isConnected) {
			list.push(nodes[node.x - 1][node.y]);
		}
		if (node.y > 0 && nodes[node.x][node.y - 1].isConnected) {
			list.push(nodes[node.x][node.y - 1]);
		}

		if (list.length > 0) {
			node2 = util.randElem(list);
			edges.push({node1: {x: node.x, y: node.y},
						node2: {x: node2.x, y: node2.y}});
			node.isConnected = true;
		}
	};

	// Create Nodes:
	nodes = [];
	for (x = 0;  x < this.NUM_NODES; x += 1) {
		nodes[x] = [];
		for (y = 0; y < this.NUM_NODES; y += 1) {
			nodes[x][y] = {x: x, y: y, isConnected: false};
		}
	}

	// Create initial random paths through nodes:
	edges = [];
	createRandomPath();
	createRandomPath();

	// Connect Remaining Nodes:
	for (x = 0;  x < this.NUM_NODES; x += 1) {
		for (y = 0; y < this.NUM_NODES; y += 1) {
			if (game.rnd.frac() < this.BLANK_PERCENT && !nodes[x][y].partOfPath) {
				nodes[x][y].isBlank = true;
			} else {
				if (!nodes[x][y].isConnected || this.HIGH_CONNECTIVITY) {
					connectNode(nodes[x][y]);
				}
			}
		}
	}

	// Make any unconnected node blank:
	for (x = 0;  x < this.NUM_NODES; x += 1) {
		for (y = 0; y < this.NUM_NODES; y += 1) {
			if (!nodes[x][y].isConnected) {
				nodes[x][y].isBlank = true;
			}
		}
	}
	
	this.nodes = nodes;
	this.edges = edges;
};

// PLACE_TUNNELS:
// ************************************************************************************************
SewerTunnelsGenerator.prototype.placeTunnels = function () {
	var i, func, width;

	func = function (tileIndex) {
		return gs.getTile(tileIndex).type.name === 'Wall';
	};

	// Connect with Tunnels:
	for (i = 0; i < this.edges.length; i += 1) {
		this.placeTileLine({x: Math.round((this.edges[i].node1.x + 0.5) * this.numTilesX / this.NUM_NODES), y: Math.round((this.edges[i].node1.y + 0.5) * this.numTilesY / this.NUM_NODES)},
						   {x: Math.round((this.edges[i].node2.x + 0.5) * this.numTilesX / this.NUM_NODES), y: Math.round((this.edges[i].node2.y + 0.5) * this.numTilesY / this.NUM_NODES)},
						   this.TUNNEL_WIDTH,
						   gs.tileTypes.Floor,
						   func);
	}


	// Connect with Water:
	for (i = 0; i < this.edges.length; i += 1) {
		if (game.rnd.frac() < this.TUNNEL_WATER_PERCENT) {
			
			if (game.rnd.frac() < 0.5) {
				width = this.TUNNEL_WIDTH / 2;
			} else {
				width = this.TUNNEL_WIDTH;
			}
			
			this.placeTileLine({x: Math.round((this.edges[i].node1.x + 0.5) * this.numTilesX / this.NUM_NODES), y: Math.round((this.edges[i].node1.y + 0.5) * this.numTilesY / this.NUM_NODES)},
							   {x: Math.round((this.edges[i].node2.x + 0.5) * this.numTilesX / this.NUM_NODES), y: Math.round((this.edges[i].node2.y + 0.5) * this.numTilesY / this.NUM_NODES)},
							   width,
							   gs.tileTypes.Water);
		}
	}
};

// PLACE_NODE_ROOMS:
// ************************************************************************************************
SewerTunnelsGenerator.prototype.placeNodeRooms = function (nodes) {
	var x, y;

	for (x = 0;  x < this.NUM_NODES; x += 1) {
		for (y = 0; y < this.NUM_NODES; y += 1) {
			if (!this.nodes[x][y].isBlank) {
				this.placeNodeRoom(this.nodes[x][y]);
			}
		}
	}
};

// PLACE_NODE_ROOM:
// ************************************************************************************************
SewerTunnelsGenerator.prototype.placeNodeRoom = function (node) {
	var testFunc, nodeCenter, size, area, waterBorderSize;

	// TEST_FUNC:
	testFunc = function (tileIndex) {
		return gs.getTile(tileIndex).type.name === 'Wall';
	};

	// Center of Node:
	nodeCenter = this.getNodeCenter(node);

	// Random room dimensions:
	//size = util.randInt(Math.ceil(this.TUNNEL_WIDTH / 2), Math.floor(this.TUNNEL_WIDTH * 1.25));

	size = Math.round(util.randInt(Math.ceil(this.numTilesX / (this.NUM_NODES * 3)), Math.floor(this.numTilesX / this.NUM_NODES) - 1) / 2 - 1);
	
	/*
	// Create wall and floor:
	if (size >= 5) {
		this.createCircleRoom({x: nodeCenter.x - size - 1, y: nodeCenter.y - size - 1}, {x: nodeCenter.x + size + 1, y: nodeCenter.y + size + 1}, 'Wall', this.WALL_FRAME, testFunc);
		this.createCircleRoom({x: nodeCenter.x - size, y: nodeCenter.y - size}, {x: nodeCenter.x + size, y: nodeCenter.y + size}, 'Floor', this.FLOOR_FRAME);

		// Water:
		if (size > Math.ceil(this.TUNNEL_WIDTH / 2) + 1 && game.rnd.frac() < 0.75) {
			this.createCircleRoom({x: nodeCenter.x - size + 2, y: nodeCenter.y - size + 2}, {x: nodeCenter.x + size - 2, y: nodeCenter.y + size - 2}, 'Water', this.WATER_FRAME);
		}

	} else {
	*/
	this.placeTileSquare({x: nodeCenter.x - size, y: nodeCenter.y - size}, {x: nodeCenter.x + size, y: nodeCenter.y + size}, gs.tileTypes.Floor);

	// Water:
	if (size > Math.ceil(this.TUNNEL_WIDTH / 2) + 1 && game.rnd.frac() < 0.75) {
		waterBorderSize = util.randElem([0, 1, 2, 3]);
		this.placeTileSquare({x: nodeCenter.x - size + waterBorderSize, y: nodeCenter.y - size + waterBorderSize}, {x: nodeCenter.x + size - waterBorderSize, y: nodeCenter.y + size - waterBorderSize}, gs.tileTypes.Water);
	
		// Island:
		
		if (size > 4) {
			this.placeTileSquare({x: nodeCenter.x - Math.floor(size  / 2), y: nodeCenter.y - Math.floor(size  / 2)},
								 {x: nodeCenter.x + Math.floor(size  / 2), y: nodeCenter.y + Math.floor(size  / 2)},
								 gs.tileTypes.Floor);
	
		}
	}

	//}

	// Define Area:
	area = this.createArea(nodeCenter.x - size, nodeCenter.y - size, nodeCenter.x + size, nodeCenter.y + size);
	area.type = 'Large';
	this.roomAreaList.push(area);
};

// GET_NODE_CENTER:
// ************************************************************************************************
SewerTunnelsGenerator.prototype.getNodeCenter = function (node) {
	return {x: Math.round((node.x + 0.5) * this.numTilesX / this.NUM_NODES),
			y: Math.round((node.y + 0.5) * this.numTilesY / this.NUM_NODES)};
};