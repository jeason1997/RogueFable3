/*global gs, menuState, console, Phaser, window, document, navigator, nw*/
/*global SCREEN_WIDTH, SCREEN_HEIGHT, TILE_SIZE, SCALE_FACTOR, WIDE_SCREEN, SHADOW_COLOR, HUGE_WHITE_FONT, LARGE_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';

var game;
var loader = {};

// WINDOW_ON_LOAD:
// Called when the page is finished loading
// ************************************************************************************************
window.onload = function () {
	/*
	var gui = require('nw.gui');
	var win = gui.Window.get();
	var zoomPercent = 150;
	win.zoomLevel = Math.log(zoomPercent/100) / Math.log(1.2);
	*/
	
	//SCREEN_WIDTH = window.screen.width;
	//SCREEN_HEIGHT = window.screen.height;
	//nw.Window.get().showDevTools();
	
	/* nw.Window.get().on('close', function() {
  		gs.onWindowClose();
		this.close(true);  		
	}); */
	
	//nw.Window.get().setAlwaysOnTop(true);
	
	game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.OPEN_GL, 'gameDiv');
	game.state.add('game', gs);
	game.state.add('loader', loader);
	
	game.state.start('loader');
	
	
};

// CREATE:
// ************************************************************************************************
loader.create = function () {

	game.stage.backgroundColor = SHADOW_COLOR;
	
	game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
	//game.scale.setUserScale(3, 3);
	game.renderer.renderSession.roundPixels = true;
	Phaser.Canvas.setImageRenderingCrisp(game.canvas);
	
	// Capturing right click:
	game.canvas.oncontextmenu = function (e) {
		e.preventDefault();
	};
	
	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	//game.scale.setMinMax(100,100,2000,2000);
	
    //	You can listen for each of these events from Phaser.Loader
    game.load.onLoadStart.add(this.loadStart, this);
    game.load.onFileComplete.add(this.fileComplete, this);
    game.load.onLoadComplete.add(this.loadComplete, this);

    //	Progress report
	this.text = game.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, '', HUGE_WHITE_FONT);

	// Load stuff here:
	game.load.image('Title', 'assets/images/Title.png');
    game.load.spritesheet('Tileset', 'assets/images/Tileset.png', TILE_SIZE / SCALE_FACTOR, TILE_SIZE / SCALE_FACTOR);
	game.load.spritesheet('MapTileset', 'assets/images/MapTileset.png', TILE_SIZE / SCALE_FACTOR, 2 * TILE_SIZE / SCALE_FACTOR);
	game.load.spritesheet('EffectsTileset', 'assets/images/EffectsTileset.png', 2 * TILE_SIZE / SCALE_FACTOR, 2 * TILE_SIZE / SCALE_FACTOR);
	game.load.spritesheet('UISlot', 'assets/images/UISlot.png', 22, 22);
	
	// Fonts:
	game.load.bitmapFont('PixelFont5', 'assets/fonts/Font5x6-export.png', 'assets/fonts/Font5x6-export.xml');
	
	// HUD:
	if (WIDE_SCREEN) {
		game.load.spritesheet('HUD', 'assets/images/HUD-Wide.png', 640, 360);
	}
	else {
		game.load.spritesheet('HUD', 'assets/images/HUD.png', 512, 350);
	}
	
	// HUD_IMAGES:
	game.load.image('Menu', 'assets/images/Menu.png');
	game.load.image('Bar', 'assets/images/Bar.png');
	game.load.spritesheet('Button', 'assets/images/Button.png', 120, 15);
	game.load.spritesheet('TextBox', 'assets/images/TextBox.png', 240, 8);
	game.load.image('MiniMap', 'assets/images/MiniMap.png');
	game.load.image('SmallMenu', 'assets/images/SmallMenu.png');
	game.load.spritesheet('BigSlot', 'assets/images/BigSlot.png', 24, 24);
	game.load.spritesheet('SmallTextButton', 'assets/images/SmallTextButton.png', 100, 14);
	
	// JSON LEVELS:
	game.load.json('TestLevel', 'assets/maps/static-levels/TestLevel.json');
	gs.loadVaults();
	gs.loadStaticLevels();
	gs.loadEndLevels();
	
	// SOUNDS:
	game.load.audio('Armor', 'assets/audio/Armor.ogg');
	game.load.audio('Weapon', 'assets/audio/Weapon.ogg');
	game.load.audio('Potion', 'assets/audio/Potion.ogg');
	game.load.audio('Scroll', 'assets/audio/Scroll.ogg');
	game.load.audio('Coin', 'assets/audio/Coin.ogg');
	game.load.audio('Door', 'assets/audio/Door.ogg');
	game.load.audio('Fire', 'assets/audio/Fire.ogg');
	game.load.audio('Ice', 'assets/audio/Ice.ogg');
	game.load.audio('Melee', 'assets/audio/Melee.ogg');
	game.load.audio('Throw', 'assets/audio/Throw.ogg');
	game.load.audio('Point', 'assets/audio/Point.ogg');
	game.load.audio('PlayerHit', 'assets/audio/PlayerHit.ogg');
	game.load.audio('Book', 'assets/audio/Book.ogg');
	game.load.audio('Food', 'assets/audio/Food.ogg');
	game.load.audio('LevelUp', 'assets/audio/LevelUp.ogg');
	game.load.audio('Shock', 'assets/audio/Shock.ogg');
	game.load.audio('Spell', 'assets/audio/Spell.ogg');
	game.load.audio('Cure', 'assets/audio/Cure.ogg');
	game.load.audio('UIClick', 'assets/audio/UIClick.ogg');
	game.load.audio('Death', 'assets/audio/Death.ogg');
	game.load.audio('Explosion', 'assets/audio/Explosion.ogg');
	game.load.audio('Bolt', 'assets/audio/Bolt.ogg');
	game.load.audio('Jewlery', 'assets/audio/Jewlery.ogg');
	game.load.audio('Teleport', 'assets/audio/Teleport.ogg');
	game.load.audio('PitTrap', 'assets/audio/PitTrap.ogg');
	
	// Music:
	game.load.audio('MainMenu', 'assets/music/MainMenu.mp3');
	game.load.audio('MainDungeon', 'assets/music/MainDungeon.mp3');
	game.load.audio('TheUnderGrove', 'assets/music/UnderGrove.mp3');
	game.load.audio('TheIronFortress', 'assets/music/TheIronFortress.mp3');
	game.load.audio('TheCrypt', 'assets/music/TheCrypt.mp3');
	game.load.audio('TheCore', 'assets/music/TheCore.mp3');
	game.load.audio('TheIceCaves', 'assets/music/TheIceCaves.mp3');
	
    game.load.start();
};

// LOAD_START
// ************************************************************************************************
loader.loadStart = function () {
	this.text.setText("加载中 ...");
};

// FILE_COMPLETE:
// Called each time a file is completed loading
// ************************************************************************************************
loader.fileComplete = function (progress, cacheKey, success, totalLoaded, totalFiles) {
	this.text.setText('加载中: ' + progress + "%");
	gs.centerText(this.text);
};

// LOAD_COMPLETE:
// Called when all files are done loading
// ************************************************************************************************
loader.loadComplete = function () {
	var darkTileset, darkMapTileset;
	this.text.setText("Load Complete");
	
	// Dark Tileset:
	gs.darkTileset = game.add.bitmapData(game.cache.getImage('Tileset').width, game.cache.getImage('Tileset').height);
	gs.darkTileset.draw(game.cache.getImage('Tileset'));
	gs.darkTileset.update();
	gs.darkTileset.processPixelRGB(function (pixel) {
		if (pixel.a > 0 || pixel.g > 0 || pixel.b > 0 || pixel.r > 0) {
			pixel.r = Math.round(pixel.r * 0.5);
			pixel.g = Math.round(pixel.g * 0.5);
			pixel.b = Math.round(pixel.b * 0.5);
			return pixel;
		}
		
		return false;
	}, this);
	game.cache.addSpriteSheet('DarkTileset', null, gs.darkTileset.canvas, 20, 20);
	
	// Dark MapTileset:
	gs.darkMapTileset = game.add.bitmapData(game.cache.getImage('MapTileset').width, game.cache.getImage('MapTileset').height);
	gs.darkMapTileset.draw(game.cache.getImage('MapTileset'));
	gs.darkMapTileset.update();
	gs.darkMapTileset.processPixelRGB(function (pixel) {
		if (pixel.a > 0 || pixel.g > 0 || pixel.b > 0 || pixel.r > 0) {
			pixel.r = Math.round(pixel.r * 0.5);
			pixel.g = Math.round(pixel.g * 0.5);
			pixel.b = Math.round(pixel.b * 0.5);
			return pixel;
		}
		
		return false;
	}, this);
	game.cache.addSpriteSheet('DarkMapTileset', null, gs.darkMapTileset.canvas, 20, 40);
	
	
	gs.music = {};
	gs.music.MainMenu = game.add.audio('MainMenu');
	gs.music.MainDungeon = game.add.audio('MainDungeon');
	gs.music.TheUnderGrove = game.add.audio('TheUnderGrove');
	gs.music.TheIronFortress = game.add.audio('TheIronFortress');
	gs.music.TheCrypt = game.add.audio('TheCrypt');
	gs.music.TheCore = game.add.audio('TheCore');
	gs.music.TheIceCaves = game.add.audio('TheIceCaves');
	
	gs.musicList = [
		gs.music.MainMenu,
		gs.music.MainDungeon,
		gs.music.TheUnderGrove,
		gs.music.TheIronFortress,
		gs.music.TheCrypt,
		gs.music.TheCore,
		gs.music.TheIceCaves
	];
	
	gs.sounds = {};
	
	// Sound:
	gs.sounds.armor = game.add.audio('Armor');
	gs.sounds.weapon = game.add.audio('Weapon');
	gs.sounds.potion = game.add.audio('Potion');
	gs.sounds.scroll = game.add.audio('Scroll');
	gs.sounds.coin = game.add.audio('Coin');
	gs.sounds.door = game.add.audio('Door');
	gs.sounds.fire = game.add.audio('Fire');
	gs.sounds.ice = game.add.audio('Ice');
	gs.sounds.melee = game.add.audio('Melee');
	gs.sounds.throw = game.add.audio('Throw');
	gs.sounds.point = game.add.audio('Point');
	gs.sounds.playerHit = game.add.audio('PlayerHit');
	gs.sounds.food = game.add.audio('Food');
	gs.sounds.levelUp = game.add.audio('LevelUp');
	gs.sounds.shock = game.add.audio('Shock');
	gs.sounds.spell = game.add.audio('Spell');
	gs.sounds.cure = game.add.audio('Cure');
	gs.sounds.death = game.add.audio('Death');
	gs.sounds.explosion = game.add.audio('Explosion');
	gs.sounds.bolt = game.add.audio('Bolt');
	gs.sounds.jewlery = game.add.audio('Jewlery');
	gs.sounds.teleport = game.add.audio('Teleport');
	gs.sounds.pitTrap = game.add.audio('PitTrap');
	
	// Currently unused:
	gs.sounds.book = game.add.audio('Book');
	gs.sounds.uiClick = game.add.audio('UIClick');
	
	game.state.start('game');
};


