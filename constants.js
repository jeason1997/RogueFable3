/*jshint esversion: 6*/
'use strict';

var WIDE_SCREEN = true;


if (WIDE_SCREEN) {
	var SCREEN_WIDTH = 1280; //1024;
	var SCREEN_HEIGHT = 720; //700;
	var NUM_SCREEN_TILES_X = 25;
	var NUM_SCREEN_TILES_Y = 20;
	
	var HUD_START_X = 950;
	var HUD_WIDTH = SCREEN_WIDTH - HUD_START_X;
	var HUD_START_Y = 2;
}
else {
	var SCREEN_WIDTH = 1024;
	var SCREEN_HEIGHT = 700;
	var NUM_SCREEN_TILES_X = 20;
	var NUM_SCREEN_TILES_Y = 20;
	var HUD_START_X = 720;
}

var SHADOW_COLOR = '#030006';
var SCALE_FACTOR = 2;
var TILE_SIZE = 40;

var NUM_TILES_X = 40;
var NUM_TILES_Y = 40;

var LOS_DISTANCE = 8;
var ABILITY_RANGE = 7;

// TIMING:
// ************************************************************************************************
var FPS = 50;
var TIME_SCALAR = 60 / FPS;
var PROJECTILE_SPEED = 12 * TIME_SCALAR;
var MOVEMENT_SPEED = 7 * TIME_SCALAR;
var FAST_MOVEMENT_SPEED = 14 * TIME_SCALAR;
var KEYBOARD_MOVEMENT_SPEED = 20 * TIME_SCALAR;
var KNOCK_BACK_SPEED = 14 * TIME_SCALAR;

// WORLD:
// ************************************************************************************************
var DANGER_LEVEL = {
	TIER_I:				[null,  1,  2,  3,  4],
	TIER_II:			[null,  5,  6,  7,  8],
	TIER_III:			[null, 9, 10, 11, 12],
	TIER_III_SPECIAL:	[null, 14],
	BRANCH_I:			[null, 9, 10, 11, 12],
	BRANCH_II:			[null, 11, 12, 13, 14],
	TIER_IV:			[null, 15, 16, 17, 18],
};

var NUM_NPCS = {
	TIER_I: 			[null, 10, 15, 15, 20],
	TIER_II:			[null, 10, 15, 15, 20],
	TIER_III:			[null, 15, 20, 20, 25],
	TIER_III_SPECIAL:	[null, 25],
	BRANCH_I:			[null, 15, 20, 20, 25],
	BRANCH_II:			[null, 15, 20, 20, 25],
	TIER_IV:			[null, 18, 22, 22, 30],
};

var TIER_II_ZONES = 			['TheSwamp', 'TheUnderGrove', 'TheSunlessDesert', 'TheOrcFortress'];
var TIER_III_ZONES =			['TheCrypt', 'TheDarkTemple', 'TheIronFortress'];
var TIER_III_SPECIAL_ZONES = 	['TheLichKingsLair'];
var BRANCH_I_ZONES =			['TheArcaneTower', 'TheSewers'];
var BRANCH_II_ZONES =			['TheCore', 'TheIceCaves'];

// PLAYER_BALANCE:
// ************************************************************************************************
var CLASS_LIST = ['Warrior', 'Barbarian', 'Rogue', 'Ranger', 'Duelist', 'FireMage', 'StormMage', 'IceMage', 'Necromancer', 'Enchanter'];
var MAX_LEVEL = 20;
var MAX_SKILL = 10;
var PLAYER_INITIAL_MAX_FOOD = 20;
var SKILL_POINTS_PER_LEVEL = 1;
var MAX_DEFENSE = 0.75;
var MAX_RAGE = 5;
var RAGE_DECREASE_TURNS = 10;
var RAGE_POINT_PERCENT = 0.1;
var TALENT_POINT_LEVELS = 3; // At what levels does the player gain a new talent point
var MAX_ABILITIES = 8;
var TALENTS_PER_BOOK = 3;

// INVENTORY:
var INVENTORY_WIDTH = 6;
var INVENTORY_HEIGHT = 3;
var WEAPON_HOT_BAR_WIDTH = 3;
var WEAPON_HOT_BAR_HEIGHT = 2;
var CONSUMABLE_HOT_BAR_WIDTH = 7;
var CONSUMABLE_HOT_BAR_HEIGHT = 2;
var MERCHANT_INVENTORY_WIDTH = 6;
var MERCHANT_INVENTORY_HEIGHT = 9;

// PLAYER_STARTING_STATS:
// ************************************************************************************************
var PLAYER_INITIAL_HP = {
	Warrior: 24,
	Barbarian: 24,
	Ranger: 24,
	Rogue: 24,
	FireMage: 24,
	StormMage: 24,
	IceMage: 24,
	Necromancer: 24,
	Enchanter: 24,
	Duelist: 24,
	
};
var PLAYER_INITIAL_MP = {
	Warrior: 3,
	Barbarian: 3,
	Ranger: 3,
	Rogue: 3,
	FireMage: 3,
	StormMage: 3,
	IceMage: 3,
	Necromancer: 3,
	Enchanter: 3,
	Duelist: 3
};

var PLAYER_HP_PER_LEVEL = {
	Warrior: 		PLAYER_INITIAL_HP.Warrior / 19,
	Barbarian: 		PLAYER_INITIAL_HP.Barbarian / 19,
	Ranger: 		PLAYER_INITIAL_HP.Ranger / 19,
	Rogue: 			PLAYER_INITIAL_HP.Rogue / 19,
	FireMage: 		PLAYER_INITIAL_HP.FireMage / 19,
	StormMage: 		PLAYER_INITIAL_HP.StormMage / 19,
	Necromancer: 	PLAYER_INITIAL_HP.Necromancer / 19,
	IceMage:		PLAYER_INITIAL_HP.IceMage / 19,
	Enchanter: 		PLAYER_INITIAL_HP.Enchanter / 19,
	Duelist:		PLAYER_INITIAL_HP.Duelist / 19,
};
var PLAYER_MP_PER_LEVEL = {
	Warrior: 		0,//PLAYER_INITIAL_MP.Warrior / 19,
	Barbarian: 		0,//PLAYER_INITIAL_MP.Barbarian / 19,
	Ranger: 		0,//PLAYER_INITIAL_MP.Ranger / 19,
	Rogue: 			0,//PLAYER_INITIAL_MP.Rogue / 19,
	FireMage: 		0,//PLAYER_INITIAL_MP.FireMage / 19,
	StormMage: 		0,//PLAYER_INITIAL_MP.StormMage / 19,
	Necromancer: 	0,//PLAYER_INITIAL_MP.Necromancer / 19,
	IceMage:		0,
	Enchanter:		0,
	Duelist:		0,
};

// SKILL_BALANCE:
// ************************************************************************************************
var HP_PER_SKILL = 2;
var MP_PER_SKILL = 1;
var STEALTH_PER_SKILL = 1;
var SPELL_MULTIPLIER_PER_SKILL = 0.05;
var RANGE_MULTIPLIER_PER_SKILL = 0.05;
var SAVE_AMMO_PER_SKILL = 0.01;
var ITEM_ABILITY_MULTIPLIER_PER_LEVEL = 0.15;


var EVASION_PERCENT_PER_POINT = 0.05;
var MAX_EVASION_PERCENT = 0.75;
var STRAFE_DODGE_PERCENT = 0.05;

var REFLECTION_PERCENT_PER_POINT = 0.05;
var MAX_REFLECTION_PERCENT = 0.75;
var CRIT_PERCENT_PER_STEALTH = 0.05;

// SKILLS:
// ************************************************************************************************
var SKILL_NAMES = [
	'Melee', 
	'Fortitude', 
	'Range', 
	'Stealth',
	//'Evasion',
	'SpellCasting',
	'Focus'
];

var SKILL_DESC = {
	// Strength:
	Melee: '近战技能:\n+1近战威力 (提高5%近战伤害)。',
	Fortitude: '坚韧技能:\n+' + HP_PER_SKILL + '生命值。',
	
	Range: '远程技能:\n+1远程威力 (提高5%远程伤害)。',
	Stealth: '潜行技能:\n+1潜行 减少敌人发现你的机会。',
	Evasion: '闪避技能:\n+1闪避 (提高5%闪避几率)。',
	
	// Intelligence:
	SpellCasting: '施法技能:\n+1法术威力 (提高5%法术伤害)。',
	Focus: '专注技能:\n+' + MP_PER_SKILL + '法力值。',
};

// NPC BALANCE:
// ************************************************************************************************
var NPC_INITIAL_HP = {LOW: 6, MLOW: 9, MEDIUM: 12, MHIGH: 18, HIGH: 24};
var NPC_MAX_HP = {LOW: 24, MLOW: 36, MEDIUM: 48, MHIGH: 72, HIGH: 96};
var NPC_HP_PER_LEVEL = {
	LOW: (NPC_MAX_HP.LOW - NPC_INITIAL_HP.LOW) / (MAX_LEVEL - 1),
	MLOW: (NPC_MAX_HP.MLOW - NPC_INITIAL_HP.MLOW) / (MAX_LEVEL - 1),
	MEDIUM: (NPC_MAX_HP.MEDIUM - NPC_INITIAL_HP.MEDIUM) / (MAX_LEVEL - 1),
	MHIGH: (NPC_MAX_HP.MHIGH - NPC_INITIAL_HP.MHIGH) / (MAX_LEVEL - 1),
	HIGH: (NPC_MAX_HP.HIGH - NPC_INITIAL_HP.HIGH) / (MAX_LEVEL - 1)
};

var NPC_INITIAL_DAMAGE = {LOW: 2, MLOW: 3, MEDIUM: 4, MHIGH: 6, HIGH: 8};
var NPC_MAX_DAMAGE = {LOW: 8, MLOW: 12, MEDIUM: 16, MHIGH: 24, HIGH: 32};
var NPC_DAMAGE_PER_LEVEL = {
	LOW: (NPC_MAX_DAMAGE.LOW - NPC_INITIAL_DAMAGE.LOW) / (MAX_LEVEL - 1),
	MLOW: (NPC_MAX_DAMAGE.MLOW - NPC_INITIAL_DAMAGE.MLOW) / (MAX_LEVEL - 1),
	MEDIUM: (NPC_MAX_DAMAGE.MEDIUM - NPC_INITIAL_DAMAGE.MEDIUM) / (MAX_LEVEL - 1),
	MHIGH: (NPC_MAX_DAMAGE.MHIGH - NPC_INITIAL_DAMAGE.MHIGH) / (MAX_LEVEL - 1),
	HIGH: (NPC_MAX_DAMAGE.HIGH - NPC_INITIAL_DAMAGE.HIGH) / (MAX_LEVEL - 1)
};



var NPC_COMMON_PERCENT = 70;
var NPC_UNCOMMON_PERCENT = 25;
var NPC_RARE_PERCENT  = 5;
var SPAWN_ENEMY_TURNS = 60; // How many turns between respawn
var SLEEPING_PERCENT = 0.1; // What is the chance for a mob to be spawned asleep
var MOB_WANDER_PERCENT = 0.20; // What is the chance for a mob to be spawned wandering


// NPC_AI:
// ************************************************************************************************
var FACTION = {
	NEUTRAL: 0,
	PLAYER: 1,
	HOSTILE: 2,
	DESTRUCTABLE: 3,
};

var MAX_AGRO_RANGE = LOS_DISTANCE;
var SHOUT_RANGE = 8;
var NPC_UNAGRO_TIME = 20;
var RANDOM_MOVE_PERCENT = 0.1;
var KITE_RANGE = 3.0;

// ITEMS_AND_EQUIPMENT:
// ************************************************************************************************
var COMMON_ITEM_PERCENT = 70;
var UNCOMMON_ITEM_PERCENT = 25; // 15 -> 25 (August 16 2018)
var RARE_ITEM_PERCENT = 5;
var NUM_EQUIPMENT_SLOTS = 14;
var SELL_ITEM_PERCENT = 0.25; // The percentage at which items are sold to merchants
var GOOD_DROP_TABLE_LIST = ['Melee', 'Staves', 'Armor', 'Shields', 'Rings', 'Charms', 'GoodScrolls']; // Used for monster zoos, drop wall rooms, branch ends etc.
var MAX_ENCHANTMENT = 5;
var EQUIPMENT_SLOT_NAMES = ['shield', 'body', 'head', 'hands', 'feet', 'ring', 'ring', 'charm'];
var LINEAR_MODDED_STATS = [
	'damage', 
	'stealth', 
	'protection', 
	'maxCharges', 
	'firePower',
	'coldPower',
	'toxicPower',
	'stormPower',
	'spellPower',
	'bonusMpRegenTime',
	'bonusHpRegenTime',
	'meleeLifeTap',
	'strength',
	'dexterity',
	'intelligence',
	'bonusMaxMp',
	'bonusReflection',
	'bonusEvasion',
	'meleePower',
	'rangePower'
];

// UI:
// ************************************************************************************************
var NUM_DAMAGE_TEXT_SPRITES = 10;
var MINI_MAP_TILE_SIZE = 7;
var MINI_MAP_SIZE_X = NUM_TILES_X;
var MINI_MAP_SIZE_Y = NUM_TILES_Y;
var MAX_STATUS_EFFECTS = 10;

// FONTS:
// ************************************************************************************************
var FONT_NAME = 'silkscreennormal'; // Inconsolata, Monospace

var SMALL_WHITE_FONT = {font: '14px ' + FONT_NAME, fill: '#ffffff'};
var LARGE_WHITE_FONT = {font: '16px ' + FONT_NAME, fill: '#ffffff'};
var LARGE_BOLD_WHITE_FONT = {font: '16px ' + FONT_NAME, fill: '#ffffff', stroke: '#000000', strokeThickness: 4};
var HUGE_WHITE_FONT = {font: '24px ' + FONT_NAME, fill: '#ffffff', stroke: '#000000', strokeThickness: 4};
var SMALL_GREEN_FONT = {font: '14px ' + FONT_NAME, fill: '#00ff00'};
var LARGE_GREEN_FONT = {font: '16px ' + FONT_NAME, fill: '#00ff00'};
var LARGE_RED_FONT = {font: '16px ' + FONT_NAME, fill: '#ff0000', stroke: '#000000', strokeThickness: 4};
var CHARACTER_HEALTH_FONT = {font: '14px ' + FONT_NAME, fill: '#00ff00', stroke: '#111111', strokeThickness: 3};
var CHARACTER_STATUS_FONT = {font: '14px ' + FONT_NAME, fill: '#ffffff', stroke: '#111111', strokeThickness: 3};

// GENERATION:
// ************************************************************************************************
var LOCKED_STAIRS_ROOM_CHANCE = 0.10;
var STATIC_LEVEL_CHANCE = 0.10; // 0.10 chance to spawn a static level instead of a generated level
var DOUBLE_GOLD_CHANCE = 0.10; // chance to spawn double max gold on a level
var MAX_MONSTER_ZOO_NPCS = 9;
var MAX_DROP_WALL_NPCS = 6;
var VAULT_ROOM_PERCENT = 0.5; // Chance a vault will potentially spawn in place of a standard room

// Floating Features:
var FLOATING_FEATURE_PERCENT = 0.25;

// Enchantment Table:
var ENCHANTMENT_TABLE_MIN_LEVEL = 5;
var ENCHANTMENT_TABLE_PERCENT = 4 / 28;

// Transferance Table:
var TRANSFERANCE_TABLE_MIN_LEVEL = 9;
var TRANSFERANCE_TABLE_PERCENT = 4 / 28;

// Altars:
var ALTER_MIN_LEVEL = 3;
var SPAWN_ALTER_PERCENT = 4 / 28; // 4 Altars in 28 dungeon levels

// Good Stuff (stuff that helps the player):
var NUM_CHESTS_PER_LEVEL = 2;
var NUM_GOLD_PER_LEVEL = 4;
var MAX_RECOVERY_MUSHROOMS = 5;
var NUM_FOUNTAINS_PER_LEVEL = 2;
var ITEM_ENCHANTED_PERCENT = 0.25;
var STANDARD_DROP_PERCENT = 0.25; // 0.30 What is the chance for an NPC to drop either gold or an item 0.25->0.40 Feb 19, 0.40->0.35Feb21
var DROP_GOLD_PERCENT = 0.75; // What is the chance to drop gold, otherwise drop an item

// Skill Trainer:
var SKILL_TRAINER_MIN_LEVEL = 9;
var SKILL_TRAINER_PERCENT = 0.10;

// Talent Trainer:
var TALENT_TRAINER_MIN_LEVEL = 9;
var TALENT_TRAINER_PERCENT = 0.10;

// PRIEST:
var PRIEST_MIN_LEVEL = 13;
var PRIEST_PERCENT = 0.25;

// Double Monsters:
var DOUBLE_MONSTER_MIN_LEVEL = 5;
var DOUBLE_MONSTER_CHANCE = 0.0;//0.10; // chance to spawn double max monsters on a level

// Merchant:
var MERCHANT_MIN_LEVEL = 5;
var MERCHANT_SPAWN_PERCENT = 0.10;

// Fire Mushrooms:
var MAX_FIRE_MUSHROOMS = 4;

// Streamers:
var STREAMER_MIN_LEVEL = 5;
var SPAWN_STREAMER_PERCENT = 0.05;
var DOUBLE_STREAMER_PERCENT = 0.25;
var MIN_STREAMER_LENGTH = 24;

// Vines:
var SPAWN_VINE_PERCENT = 0.50;
var MAX_VINES = 4;
var SUPER_VINE_PERCENT = 0.05;

// Ice:
var MAX_ICE = 4;
var SUPER_ICE_PERCENT = 0.05;

// Water:
var SPAWN_WATER_PERCENT = 0.50;
var MAX_WATER = 4;
var SUPER_WATER_PERCENT = 0.05;

// Lava:
var MAX_LAVA = 6;
var SUPER_LAVA_PERCENT = 0.05;

// Teleport Trap:
var TELEPORT_TRAP_MIN_LEVEL = 2;
var SPAWN_TELEPORT_TRAP_PERCENT = 0.20;
var MAX_TELEPORT_TRAPS = 2;

// Pit Traps:
var PIT_TRAP_MIN_LEVEL = 3;
var SPAWN_PIT_TRAP_PERCENT = 0.1;
var MAX_PIT_TRAPS = 2;

// Bear Traps:
var SPAWN_BEAR_TRAPS_PERCENT = 0.25;
var MAX_BEAR_TRAPS = 10;

// Fire Traps:
var SPAWN_FIRE_VENTS_PERCENT = 0.25;
var MAX_FIRE_VENTS = 10;

// Spike Traps:
var SPAWN_SPIKE_TRAPS_PERCENT = 0.25;
var MAX_SPIKE_TRAPS = 10;

// Fire Pots:
var SPAWN_FIRE_POTS_PERCENT = 0.25;
var MAX_FIRE_POTS = 10;

// Gas Barrels:
var SPAWN_GAS_POTS_PERCENT = 0.25;
var MAX_GAS_POTS = 10;

// Gas Vents:
var SPAWN_GAS_VENTS_PERCENT = 0.5;
var MAX_GAS_VENTS = 5;

// Camp fires:
var NUM_CAMP_FIRES = 2;

// Elites:
var MIN_ELITE_LEVEL = 4;
var NPC_ELITE_CHANCE = 0.05;

// MECHANICS:
// ************************************************************************************************
var CHARACTER_SIZE = {
	SMALL: 0,
	MEDIUM: 1,
	LARGE: 2
};

var DAMAGE_TYPES = [
	'Fire',
	'Cold',
	'Shock',
	'Toxic',
	'Physical'
];

var RESISTANCE_MULTIPLIER = [0, 0.8, 1.0, 1.2];


var MAX_PLAYER_SLEEP_TIME = 10;
var MP_REGEN_TIME = 100; // How many turns to regenerate 0->max hp or ep?
var HP_REGEN_TIME = 200;
var MIN_HP_REGEN_TIME = 5;
var CRIT_MULTIPLIER = 1.5; // How much are critical hits multiplied by
var INVENTORY_SIZE = 15; // Number of slots in character inventories
var SPREAD_DAMAGE_MOD = 0.9;
var TIMED_GATE_TIME = 200; 
var CORRODE_PERCENT = 0.5;
var EXTENDED_WAIT_TURNS = 200;
var MIN_MOVE_TIME = 50;
var CRITICAL_PERCENT = 0.05;
var TELEPORT_PER_TURN_PERCENT = 0.3;
var MOVE_TIME = [100, 100, 50]; // SLOW, NORMAL, FAST
var SKELETON_REVIVE_TIME = 60;
var COLD_TIME = 10;
var MAX_COLD_LEVEL = 10; // 0=NORMAL, 1=COLD, 2=FREEZING
var FREEZING_DAMAGE = 10;
var SPIDER_EGG_HATCH_TURNS = 5;
var HELL_FIRE_DAMAGE = 30;
var INFERNO_RING_DAMAGE = 2;
var FOOD_TIME = 50;
var SHROOM_HP = 10;
var SHROOM_EP = 4;
var ZONE_FADE_TIME = 250; // 250
var CONFUSION_RANDOM_MOVE_PERCENT = 0.75;

// TRAPS:
// ************************************************************************************************
var FIRE_SHROOM_MIN_DAMAGE = 8;
var FIRE_SHROOM_MAX_DAMAGE = 24;

// (will be x1.5 due to immobile crit)
var BEAR_TRAP_MIN_DAMAGE = 6; 
var BEAR_TRAP_MAX_DAMAGE = 18;

var FIRE_GLYPH_MIN_DAMAGE = 10;
var FIRE_GLYPH_MAX_DAMAGE = 30;

var SPIKE_TRAP_MIN_DAMAGE = 10;
var SPIKE_TRAP_MAX_DAMAGE = 30;

var FIRE_VENT_MIN_DAMAGE = 8;
var FIRE_VENT_MAX_DAMAGE = 24;

var FIRE_POT_MIN_DAMAGE = 15;
var FIRE_POT_MAX_DAMAGE = 45;

var GAS_VENT_MIN_DAMAGE = 4;
var GAS_VENT_MAX_DAMAGE = 12;

var GAS_POT_MIN_DAMAGE = 6;
var GAS_POT_MAX_DAMAGE = 18;





	


// DESIGN_FLAGS:
// ************************************************************************************************
var NICE_STAT_NAMES = {
	blockChance: 'Block Projectile',
	parryChance: 'Parry Melee',
	bonusMaxHp: 'Hit Points',
	bonusMaxMp: 'Mana Points',
	bonusMaxFood: 'Max Food',
	bonusExpMod: 'EXP',
	protection: 'Protection',
	fireResistance: 'Fire Resistance',
	coldResistance: 'Cold Resistance',
	toxicResistance: 'Toxic Resistance',
	shockResistance: 'Shock Resistance',
	bonusEvasion: 'Evasion',
	stealth: 'Stealth',
	stealthModifier: 'Stealth',
	meleePower: 'Melee Power',
	rangePower: 'Range Power',
	firePower: 'Fire Magic Power',
	coldPower: 'Cold Magic Power',
	toxicPower: 'Toxic Magic Power',
	stormPower: 'Storm Magic Power',
	spellPower: 'Spell Power',
	spellPowerModifier: 'Spell Power',
	bonusReflection: 'Reflection',
	isTelepathic: 'Telepathy',
	maxHpModifier: 'Hit Points',
	bonusMpRegenTime: 'Mana Regen',
	bonusHpRegenTime: 'Health Regen',
	meleeLifeTap: 'Melee Life Tap',
	strength: 'Strength',
	dexterity: 'Dexterity',
	intelligence: 'Intelligence',
	bonusDamageShield: 'Damage Shield',
};

var STAT_AS_PERCENT = {
	bonusExpMod: true,
	spellPowerModifier: true,
	maxHpModifier: true,
	stealthModifier: true,
	blockChance: true,
	parryChance: true,
};

var STAT_AS_FLAG = {
	bonusMovementSpeed: true,
	isFlying: true,
	isTelepathic: true,
	hasLifeSaving: true,
};

// FRAMES:
// ************************************************************************************************
var EQUIPMENT_SLOT_FRAMES = {
	body: 1280,
	hands: 1282,
	feet: 1283,
	head: 1284,
	ring: 1285,
	shield: 1286,
	charm: 1287,
	
};

// Targeting:
var GREEN_TARGET_BOX_FRAME = 1152;
var RED_TARGET_BOX_FRAME = 1153; // For targeting standard attacks
var PURPLE_TARGET_BOX_FRAME = 1154;
	
var GREEN_SELECT_BOX_FRAME = 1157;
var RED_SELECT_BOX_FRAME = 1158;
var PURPLE_SELECT_BOX_FRAME = 1159;

var GREEN_BOX_FRAME = 1162;
var RED_BOX_FRAME = 1163;
var PURPLE_BOX_FRAME = 1164;

var X_FRAME = 1167;

// Bars:
var HEALTH_BAR_FRAME = 1184;
var MANA_BAR_FRAME = 1185;
var FOOD_BAR_FRAME = 1186;
var EXP_BAR_FRAME = 1187;
var COLD_BAR_FRAME = 1188;
var POISON_BAR_FRAME = 1189;

// Rings:
var ELITE_RING_FRAME = 1200;
var SUMMONED_RING_FRAME = 1201;
var ALLY_RING_FRAME = 1202;

// Slots:
var ITEM_SLOT_FRAME = 0;
var ABILITY_SLOT_FRAME = 2;
var ABILITY_SLOT_RED_FRAME = 4;
var ABILITY_SLOT_GREEN_FRAME = 6;
var SLOT_SELECT_BOX_FRAME = 10;
var RIGHT_RING_SELECT_BOX_FRAME = 1233;
var LEFT_RING_SELECT_BOX_FRAME = 1234;

// UI_BUTTONS:
var CHARACTER_BUTTON_FRAME = 1248;
var CLOSE_BUTTON_FRAME = 1250;
var OPTIONS_BUTTON_FRAME = 1252;
var SOUND_ON_BUTTON_FRAME = 1254;
var MUSIC_ON_BUTTON_FRAME = 1256;
var QUIT_BUTTON_FRAME = 1258;
var EXPLORE_BUTTON_FRAME = 1260;
var SOUND_OFF_BUTTON_FRAME = 1262;
var MUSIC_OFF_BUTTON_FRAME = 1264;



var PARTICLE_FRAMES = {
	RED:	1666,
	BLUE:	1667,
	GREEN:	1668,
	PURPLE:	1669,
	WHITE:	1670,
	YELLOW:	1671,
	SMOKE:	1672,
	MEZ:	1673,
};

var PLAYER_FRAMES = {
	Barbarian:		864,
	Necromancer:	865,
	Rogue:			866,
	Ranger:			867,
	FireMage:		868,
	StormMage:		869,
	IceMage:		870,
	Warrior:		871,
	Enchanter:		872,
	Duelist:		873,
};