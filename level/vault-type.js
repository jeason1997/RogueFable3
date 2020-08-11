/*global game, gs, console, util*/
/*global Item*/
/*global dungeonTunnelsGenerator, pitPathGenerator, templateLichKingsLair*/
/*jshint esversion: 6*/

'use strict';

// LOAD_VAULTS:
// Called from loader in order to load the json files for each vault
// ************************************************************************************************
gs.loadVaults = function () {
	this.createVaultGenerateFuncs();
	
	this.vaultTypes = {
		
		Library: 				{initFunc: this.vaultGenerateFuncs.Library},
		
		// GENERIC:
		GenericRoom01:			{tags: ['Generic']},
		GenericRoom02:			{tags: ['Generic']},
		GenericRoom03:			{tags: ['Generic']},
		GenericRoom04:			{tags: ['Generic']},
		GenericRoom05:			{tags: ['Generic']},
		GenericRoom06:			{tags: ['Generic']},
		GenericRoom07:			{tags: ['Generic']},
		GenericRoom08:			{tags: ['Generic']},
        GenericRoom09:			{tags: ['Generic']},
        GenericRoom10:			{tags: ['Generic']},
        GenericRoom11:			{tags: ['Generic']},
        GenericRoom12:			{tags: ['Generic']},
        GenericRoom13:			{tags: ['Generic']},
        GenericRoom14:			{tags: ['Generic']},
        GenericRoom15:			{tags: ['Generic']},
        GenericRoom16:			{tags: ['Generic']},
        GenericRoom17:			{tags: ['Generic'], hasPits: true},
        GenericRoom18:			{tags: ['Generic']},
		GenericRoom19:			{tags: ['Generic']},
        GenericRoom20:			{tags: ['Generic']},
        GenericRoom21:			{tags: ['Generic']},
        
        //Generic Traps:
        GenericTrap01:          {tags:['Generic']},
		
       /*
        GenericTrap12:          {tags:['Generic'], dontRotate: true},
        GenericTrap13:          {tags:['Generic'], dontRotate: true},
        GenericTrap14:          {tags:['Generic'], dontRotate: true},
        GenericTrap15:          {tags:['Generic']},
		GenericTrap16:			{tags:['Generic']},
		GenericTrap17:			{tags:['Generic']},
        GenericTrap18:			{tags:['Generic']},
		GenericTrap19:			{tags:['Generic']},
        GenericTrap20:			{tags:['Generic']},
        GenericTrap21:			{tags:['Generic']},
		*/
        
		// DUNGEON: (upper levels and orc fortress)
		Dungeon01: 				{tags: ['Dungeon']},
		Dungeon02:			 	{tags: ['Dungeon']},
		Dungeon03: 				{tags: ['Dungeon'], dontRotate: true},
		Dungeon04: 				{tags: ['Dungeon']},
		Dungeon05: 				{tags: ['Dungeon']},
		Dungeon06: 				{tags: ['Dungeon']},
		Dungeon07: 				{tags: ['Dungeon'], dontRotate: true},
		Dungeon08: 				{tags: ['Dungeon'], dontRotate: true},
		Dungeon09: 				{tags: ['Dungeon']},
		Dungeon10: 				{tags: ['Dungeon'], dontRotate: true},
		
		// IRON_FORTRESS:
		IronFortressBallista:	{tags: ['TheIronFortress'], isUnique: true},
		IronFortress01: 		{tags: ['TheIronFortress'], dontRotate: true},
		IronFortress02: 		{tags: ['TheIronFortress'], dontRotate: true},
		
		
		// THE_CRYPT:
		TheCrypt01: 			{tags: ['TheCrypt'], dontRotate: true},
		TheCrypt02: 			{tags: ['TheCrypt'], dontRotate: true},
		TheCrypt03: 			{tags: ['TheCrypt'], dontRotate: true},
		TheCrypt04: 			{tags: ['TheCrypt']},
		TheCrypt05: 			{tags: ['TheCrypt']},
		TheCrypt06: 			{tags: ['TheCrypt']},
		TheCrypt07: 			{tags: ['TheCrypt']},
		TheCrypt08: 			{tags: ['TheCrypt'], dontRotate: true},
		TheCrypt09: 			{tags: ['TheCrypt']},
		TheCrypt10: 			{tags: ['TheCrypt']},
		TheCrypt11: 			{tags: ['TheCrypt']},
		TheCrypt12: 			{tags: ['TheCrypt']},
		TheCrypt13: 			{tags: ['TheCrypt'], dontRotate: true},
		TheCrypt14: 			{tags: ['TheCrypt']},
		TheCrypt15: 			{tags: ['TheCrypt']},
		
		// THE_CORE:
		TheCore01:				{tags: ['TheCore'], dontRotate: true},
		TheCore02:				{tags: ['TheCore'], dontRotate: true},
		
		// THE_ARCANE_TOWER:
		GolemWorkshop: 			{tags: ['TheArcaneTower'], isUnique: true},
		TheArcaneTower01: 		{tags: ['TheArcaneTower']},
		TheArcaneTower02: 		{tags: ['TheArcaneTower']},
		
		// THE_UNDER_GROVE:
		TheUnderGrove01: 		{tags: ['TheUnderGrove'], placementType: 'FloatingOpenCave'},
		TheUnderGrove02:		{tags: ['TheUnderGrove'], placementType: 'FloatingOpenCave'},
		
		// THE_SUNLESS_DESERT:
		TheSunlessDesert01:		{tags: ['TheSunlessDesert'], placementType: 'FloatingOpenCave', isUnique: true},
		
		// THE_SEWERS:
		TheSewersTunnel01:		{tags: ['TheSewersTunnel']},
		TheSewersRoad01:		{tags: ['TheSewersRoad'], dontRotate: true},
		TheSewersRoad02:		{tags: ['TheSewersRoad'], dontRotate: true},
		TheSewersRoad03:		{tags: ['TheSewersRoad'], dontRotate: true},
		TheSewersRoad04:		{tags: ['TheSewersRoad']},
		TheSewersRoad05:		{tags: ['TheSewersRoad']},
		
		// VAULT_OF_YENDOR:
		VaultOfYendor01:		{tags: ['VaultOfYendor']},
		VaultOfYendor02:		{tags: ['VaultOfYendor']},
		VaultOfYendor03:		{tags: ['VaultOfYendor']},
		VaultOfYendor04:		{tags: ['VaultOfYendor']},
		VaultOfYendor05:		{tags: ['VaultOfYendor']},
		VaultOfYendor06:		{tags: ['VaultOfYendor']},
		VaultOfYendor07:		{tags: ['VaultOfYendor']},
		VaultOfYendor08:		{tags: ['VaultOfYendor']},
		VaultOfYendor09:		{tags: ['VaultOfYendor']},
		VaultOfYendor10:		{tags: ['VaultOfYendor']},
		
		// TEMPLE_TEMPLATES:
		TempleTop01:			{path: 'assets/maps/vaults/TempleTemplates/TempleTop01.json'},
		TempleTop02:			{path: 'assets/maps/vaults/TempleTemplates/TempleTop02.json'},
		TempleTop03:			{path: 'assets/maps/vaults/TempleTemplates/TempleTop03.json'},
		TempleMiddle01:			{path: 'assets/maps/vaults/TempleTemplates/TempleMiddle01.json'},
		TempleMiddle02:			{path: 'assets/maps/vaults/TempleTemplates/TempleMiddle02.json'},
		TempleMiddle03:			{path: 'assets/maps/vaults/TempleTemplates/TempleMiddle03.json'},
		TempleMiddle04:			{path: 'assets/maps/vaults/TempleTemplates/TempleMiddle04.json'},
		TempleMiddle05:			{path: 'assets/maps/vaults/TempleTemplates/TempleMiddle05.json'},
		TempleBottom01:			{path: 'assets/maps/vaults/TempleTemplates/TempleBottom01.json'},
		TempleBottom02:			{path: 'assets/maps/vaults/TempleTemplates/TempleBottom02.json'},
		TempleBottom03:			{path: 'assets/maps/vaults/TempleTemplates/TempleBottom03.json'},
		
		// IRON_FORGE_TEMPLATES:
		IronForgeTop01:			{path: 'assets/maps/vaults/IronForgeTemplates/IronForgeTop01.json'},
		IronForgeTop02:			{path: 'assets/maps/vaults/IronForgeTemplates/IronForgeTop02.json'},
		IronForgeTop03:			{path: 'assets/maps/vaults/IronForgeTemplates/IronForgeTop03.json'},
		IronForgeMiddle01:		{path: 'assets/maps/vaults/IronForgeTemplates/IronForgeMiddle01.json'},
		IronForgeMiddle02:		{path: 'assets/maps/vaults/IronForgeTemplates/IronForgeMiddle02.json'},
		IronForgeMiddle03:		{path: 'assets/maps/vaults/IronForgeTemplates/IronForgeMiddle03.json'},
		IronForgeBottom01:		{path: 'assets/maps/vaults/IronForgeTemplates/IronForgeBottom01.json'},
		IronForgeBottom02:		{path: 'assets/maps/vaults/IronForgeTemplates/IronForgeBottom02.json'},
		IronForgeBottom03:		{path: 'assets/maps/vaults/IronForgeTemplates/IronForgeBottom03.json'},
		
		// FLOATING_FEATURES:
		BallistaRoom: 			{isFloatingFeature: true},
		OrcPriestTemple:		{isFloatingFeature: true},
		OrcFortress:			{isFloatingFeature: true},
		TreasureTrap:			{isFloatingFeature: true},
        FireTrap:           	{isFloatingFeature: true},
        MerchantShop:       	{isFloatingFeature: true, initFunc: this.vaultGenerateFuncs.MerchantShop},
		TheSewersSlime:			{isFloatingFeature: true},
		TheCoreEels:			{isFloatingFeature: true},
		TheDarkTempleTemple:	{isFloatingFeature: true},
        GenericTrap09:          {isFloatingFeature: true, dontRotate:true},
        GenericTrap10:          {isFloatingFeature: true},
        SpikeTrap02:            {isFloatingFeature: true, dontRotate:true},
	};
	
	// Dungeon Tunnels Generator:
	dungeonTunnelsGenerator.middleVaultTypeNames.forEach(name => this.vaultTypes[name] = {path: 'assets/maps/vaults/DungeonTunnelsTemplates/' + name + '.json'});
	dungeonTunnelsGenerator.edgeVaultTypeNames.forEach(name => this.vaultTypes[name] = {path: 'assets/maps/vaults/DungeonTunnelsTemplates/' + name + '.json'});
	dungeonTunnelsGenerator.cornerVaultTypeNames.forEach(name => this.vaultTypes[name] = {path: 'assets/maps/vaults/DungeonTunnelsTemplates/' + name + '.json'});
	
	// Pit Path Generator:
	pitPathGenerator.middleVaultTypeNames.forEach(name => this.vaultTypes[name] = {path: 'assets/maps/vaults/PitPathsTemplates/' + name + '.json'});
	pitPathGenerator.edgeVaultTypeNames.forEach(name => this.vaultTypes[name] = {path: 'assets/maps/vaults/PitPathsTemplates/' + name + '.json'});
	pitPathGenerator.cornerVaultTypeNames.forEach(name => this.vaultTypes[name] = {path: 'assets/maps/vaults/PitPathsTemplates/' + name + '.json'});
	
	// Lich King Generator:
	templateLichKingsLair.topVaultTypeNames.forEach(name => this.vaultTypes[name] = {path: 'assets/maps/vaults/LichKingTemplates/' + name + '.json'});
	templateLichKingsLair.middleVaultTypeNames.forEach(name => this.vaultTypes[name] = {path: 'assets/maps/vaults/LichKingTemplates/' + name + '.json'});
	templateLichKingsLair.bottomVaultTypeNames.forEach(name => this.vaultTypes[name] = {path: 'assets/maps/vaults/LichKingTemplates/' + name + '.json'});
	templateLichKingsLair.sideVaultTypeNames.forEach(name => this.vaultTypes[name] = {path: 'assets/maps/vaults/LichKingTemplates/' + name + '.json'});
	
	this.nameTypes(this.vaultTypes);
	
	this.vaultTypeList = [];
	
	this.forEachType(this.vaultTypes, function (vaultType) {
		this.vaultTypeList.push(vaultType);
		
		if (vaultType.path) {
			game.load.json(vaultType.name, vaultType.path);
		}
		else if (vaultType.isFloatingFeature) {
			game.load.json(vaultType.name, 'assets/maps/floating-features/' + vaultType.name + '.json');
		}
		else {
			game.load.json(vaultType.name, 'assets/maps/vaults/' + vaultType.name + '.json');
		}
		
		
		if (!vaultType.tags) {
			vaultType.tags = [];
		}
		
		/*
		if (this.vaultGenFuncs.hasOwnProperty(vaultType.name)) {
			vaultType.genFunc = gs.vaultGenFuncs[vaultType.name];
		}
		*/
	}, this);
};

// CREATE_VAULT_TYPES:
// Called in gameState create, after the json for each vault has been loaded.
// ************************************************************************************************
gs.createVaultTypes = function () {
	this.forEachType(this.vaultTypes, function (vaultType) {
		var data = game.cache.getJSON(vaultType.name);
		vaultType.width = data.width;
		vaultType.height = data.height;
		vaultType.allowRotate = Boolean(!vaultType.dontRotate);
	}, this);
};

// CREATE_VAULT_GENERATE_FUNCS:
// ************************************************************************************************
gs.createVaultGenerateFuncs = function () {
	this.vaultGenerateFuncs = {};
	
	// Library:
	this.vaultGenerateFuncs.Library = function (area) {
		let itemNameList;
		
		gs.createCrystalChestGroup();
		
		// Select 3 different tomes:
		itemNameList = gs.itemTypeDropRate.Books.map(e => e.name);
		itemNameList = gs.randSubset(itemNameList, 3);
		
		
		gs.getIndexInBox(area).forEach(function (index) {
			if (gs.getObj(index, obj => obj.type.name === 'CrystalChest')) {
				let crystalChest = gs.getObj(index);
				
				crystalChest.groupId = gs.nextCrystalChestGroupId;
				crystalChest.item = Item.createItem(itemNameList.pop());
			}
		}, this);
	};
	
	// Merchant shop:
	this.vaultGenerateFuncs.MerchantShop = function (area) {
		gs.stockMerchant();
	};
};

// GET_VALID_VAULT_LIST:
// ************************************************************************************************
gs.getValidVaultList = function (minWidth, minHeight, maxWidth, maxHeight, tags) {
	var list = [];
	

	this.forEachType(this.vaultTypes, function (vaultType) {
		// Never double spawn vaults:
		if (vaultType.isUnique && gs.inArray(vaultType.name, gs.previouslySpawnedVaults)) {
			return;
		}
		
		// Skip pits on last levels:
		if (gs.zoneLevel === gs.zoneType().numLevels && vaultType.hasPits) {
			return;
		}
		if (!vaultType.neverChoose && (!tags || gs.arrayIntersect(tags, vaultType.tags).length > 0)) {
		
			if (vaultType.allowRotate) {
				if (vaultType.width >= minWidth && vaultType.width <= maxWidth && vaultType.height >= minHeight && vaultType.height <= maxHeight) {
					list.push({vaultTypeName: vaultType.name, rotate: 0});
					list.push({vaultTypeName: vaultType.name, rotate: 180});
				}
				
				if (vaultType.height >= minWidth && vaultType.height <= maxWidth && vaultType.width >= minHeight && vaultType.width <= maxHeight) {
					list.push({vaultTypeName: vaultType.name, rotate: 90});
					list.push({vaultTypeName: vaultType.name, rotate: 270});
				}
			}
			else {
				if (vaultType.width >= minWidth && vaultType.width <= maxWidth && vaultType.height >= minHeight && vaultType.height <= maxHeight) {
					list.push({vaultTypeName: vaultType.name});
				}
			}
			

			
		}
	}, this);
	
	return list;
};

// RAND_VAULT_TYPE:
// ************************************************************************************************
gs.randVaultType = function (minWidth, minHeight, maxWidth, maxHeight, tags) {
	var list = this.getValidVaultList(minWidth, minHeight, maxWidth, maxHeight, tags);
	return list.length > 0 ? util.randElem(list) : null;
};
