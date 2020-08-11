/*global game, gs, console, Phaser, util*/
/*global BaseGenerator, Item*/
/*jshint esversion: 6*/
'use strict';

// TEMPLATE_TEMPLE_GENERATOR:
// ************************************************************************************************
function TemplateTempleGenerator() {
	this.name = 'TempleTemplateGenerator';
}
TemplateTempleGenerator.prototype = new BaseGenerator();
var templateTempleGenerator = new TemplateTempleGenerator();

// GENERATE:
// ************************************************************************************************
TemplateTempleGenerator.prototype.generate = function () {
	var vaultTypeName;
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.CaveWall);
	
	// Top
	vaultTypeName = util.randElem(['TempleTop01', 'TempleTop02', 'TempleTop03']);
	this.placeVault({x: 0, y: 0}, {vaultTypeName: vaultTypeName});
	
	// Middle 1:
	vaultTypeName = util.randElem(['TempleMiddle01', 'TempleMiddle02', 'TempleMiddle03', 'TempleMiddle04', 'TempleMiddle05']);
	this.placeVault({x: 0, y: 10}, {vaultTypeName: vaultTypeName});
	
	// Middle 2:
	vaultTypeName = util.randElem(['TempleMiddle01', 'TempleMiddle02', 'TempleMiddle03', 'TempleMiddle04', 'TempleMiddle05']);
	this.placeVault({x: 0, y: 20}, {vaultTypeName: vaultTypeName});
	
	// Bottom:
	vaultTypeName = util.randElem(['TempleBottom01', 'TempleBottom02', 'TempleBottom03']);
	this.placeVault({x: 0, y: 30}, {vaultTypeName: vaultTypeName});
	
	return true;
};
	
// TEMPLATE_IRON_FORGE_GENERATOR:
// ************************************************************************************************
function TemplateIronForgeGenerator() {
	this.name = 'TemplateIronForgeGenerator';
}
TemplateIronForgeGenerator.prototype = new BaseGenerator();
var templateIronForgeGenerator = new TemplateIronForgeGenerator();

// GENERATE:
// ************************************************************************************************
TemplateIronForgeGenerator.prototype.generate = function () {
	var vaultTypeName;
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.CaveWall);
	
	// Top:
	vaultTypeName = util.randElem(['IronForgeTop01', 'IronForgeTop02', 'IronForgeTop03']);
	this.placeVault({x: 10, y: 0}, {vaultTypeName: vaultTypeName});
	
	// Middle:
	vaultTypeName = util.randElem(['IronForgeMiddle01', 'IronForgeMiddle02', 'IronForgeMiddle03']);
	this.placeVault({x: 0, y: 10}, {vaultTypeName: vaultTypeName});
	
	// Bottom:
	vaultTypeName = util.randElem(['IronForgeBottom01', 'IronForgeBottom02', 'IronForgeBottom03']);
	this.placeVault({x: 10, y: 30}, {vaultTypeName: vaultTypeName});
	
	return true;
};

// TEMPLATE_LICH_KINGS_LAIR:
// ************************************************************************************************
function TemplateLichKingsLair() {
	this.name = 'TemplateLichKingsLair';
}
TemplateLichKingsLair.prototype = new BaseGenerator();
var templateLichKingsLair = new TemplateLichKingsLair();

templateLichKingsLair.topVaultTypeNames = [
	'LichKingTop01',
	'LichKingTop02',
	'LichKingTop03',
];

templateLichKingsLair.middleVaultTypeNames = [
	'LichKingMiddle01',
	'LichKingMiddle02',
	'LichKingMiddle03',
	'LichKingMiddle04',
	'LichKingMiddle05',
];

templateLichKingsLair.bottomVaultTypeNames = [
	'LichKingBottom01',
	'LichKingBottom02',
];

templateLichKingsLair.sideVaultTypeNames = [
	'LichKingSide01',
	'LichKingSide02',
	'LichKingSide03',
	'LichKingSide04',
	'LichKingSide05',
	'LichKingSide06',
];

// GENERATE:
// ************************************************************************************************
TemplateLichKingsLair.prototype.generate = function () {
	var vaultTypeName, area;
	
	// Initial Fill:
	this.placeTileSquare({x: 0, y: 0}, {x: this.numTilesX, y: this.numTilesY}, gs.tileTypes.CaveWall);
	
	
	// Top:
	gs.createCrystalChestGroup();
	vaultTypeName = util.randElem(this.topVaultTypeNames);
	area = this.placeVault({x: 0, y: 0}, {vaultTypeName: vaultTypeName});
	
	// Crystal chests:
	let itemNameList = gs.randSubset([
		'TomeOfDeath', 
		'GreaterStaffOfPoison', 
		'RingOfToxic', 
		'ScrollOfEnchantment',
		'ScrollOfAcquirement',
		'PotionOfGainAttribute',
	], 3);
	
	gs.getIndexInBox(area).forEach(function (index) {
		if (gs.getObj(index, obj => obj.type.name === 'CrystalChest')) {
			let crystalChest = gs.getObj(index);
				
			crystalChest.groupId = gs.nextCrystalChestGroupId;
			crystalChest.item = Item.createItem(itemNameList.pop());
			
			if (crystalChest.item.canEnchant()) {
				crystalChest.item.mod = gs.dropItemModifier(crystalChest.item.type);
			}
		}
	}, this);
	
	// Middle:
	vaultTypeName = util.randElem(this.middleVaultTypeNames);
	this.placeVault({x: 10, y: 10}, {vaultTypeName: vaultTypeName});
	
	// Left Side:
	vaultTypeName = util.randElem(this.sideVaultTypeNames);
	this.placeVault({x: 0, y: 10}, {vaultTypeName: vaultTypeName});
	
	// Right Side:
	vaultTypeName = util.randElem(this.sideVaultTypeNames);
	this.placeVault({x: 29, y: 10}, {vaultTypeName: vaultTypeName, reflect: true});
	
	// Bottom:
	vaultTypeName = util.randElem(this.bottomVaultTypeNames);
	this.placeVault({x: 0, y: 30}, {vaultTypeName: vaultTypeName});
	
	return true;
};