/*global game, gs, Phaser, console, util*/
/*global GOOD_DROP_TABLE_LIST*/
/*jslint white: true */
'use strict';

// CREATE_UNIQUE_NPC_TYPES:
// ************************************************************************************************
gs.createUniqueNPCTypes = function () {
	this.dialog = {};
	this.dialogInit = {};
	this.npcInventories = {};
	this.dialogFuncs = {};


	// DEFAULT:
	this.dialog.Default = [
		{text: 'No Dialog',
		 responses: [{text: '[Done]', nextLine: 'exit'}]
		}
	];

	// MERCHANT:
	this.dialog.Merchant = [
		{text: "Greetings brave adventurer and welcome to my humble shop! Can I interest you in some items?",
		 responses: [
			 {text: "[View Items]", nextLine: 'barter'},
			 {text: "[Done]", nextLine: 'exit'}
		 ]
		}
	];
	
	// SKILL_TRAINER:
	this.dialog.SkillTrainer = [
		{text: "Hello brave adventurer. I can provide you with additional skill points for 25 gold each.",
		 responses: [
			 {text: 'Ok',
			  prereq: function () {
				  return gs.pc.inventory.gold >= 25;
			  },
			  func: function () {gs.pc.skillPoints += 1; gs.pc.inventory.gold -= 25;},
			  nextLine: 'exit'
			 },
			 {text: 'No thanks', 
			  nextLine: 'exit'
			 }
		 ]
		}
	];
	
	// TALENT_TRAINER:
	this.dialog.TalentTrainer = [
		{text: "Hello brave adventurer. I can provide you with additional talent points for 100 gold each.",
		 responses: [
			 {text: 'Ok',
			  prereq: function () {
				  return gs.pc.inventory.gold >= 100;
			  },
			  func: function () {
				  gs.pc.talentPoints += 1;
				  gs.pc.inventory.gold -= 100;
			  },
			  nextLine: 'exit'},
			 {text: 'No thanks', nextLine: 'exit'}
		 ]
		}
	];
	
	// PRIEST:
	this.dialog.Priest = [{text: "Hello brave adventurer. For a small donation of 10 gold I can fully restore your health and mana and provide you with a powerful blessing.",
								 responses: [{text: 'Ok',
											  prereq: function () {return gs.pc.inventory.gold >= 10;},
											  func: function () {
												  gs.pc.cure();
												  gs.pc.mentalCure();
												  gs.pc.healHp(gs.pc.maxHp);
												  gs.pc.gainMp(gs.pc.maxMp);
												  gs.pc.statusEffects.add('Bless');
												  gs.pc.inventory.gold -= 10;
											  },
											  nextLine: 'exit'},
											 {text: 'No thanks', nextLine: 'exit'}
											 ]
								}
							   ];
    
	// GUARDED_CONTAINER:
	this.dialog.GuardedContainer = [
		{text: 'Are you sure you want to open this container?',
		 responses: [
			 {text: 'Yes', nextLine: 'exit', func: function () {gs.openingContainer.openContainer(); }},
			 {text: 'No', nextLine: 'exit'}
		 ]
		}
	];

    //Cow:	
    this.dialog.Cow = [{text: 'Moo',
									 responses: [{text: 'Okay', nextLine: 'exit'},
												]
									}
								   ];
        
    //Chicken:	
    this.dialog.Chicken = [{text: 'Cluck Cluck',
									 responses: [{text: 'Okay', nextLine: 'exit'},
												]
									}
								   ];
    
    //Pig:	
    this.dialog.Pig = [{text: 'Oink Oink',
									 responses: [{text: 'Okay', nextLine: 'exit'},
												]
									}
								   ];
    
    //Sheep:	
    this.dialog.Sheep = [{text: 'Baa',
									 responses: [{text: 'Okay', nextLine: 'exit'},
												]
									}
								   ];
	// GUARDED_DOOR:
	this.dialog.GuardedDoor = [{text: 'This door is covered in warning glyphs. Really open it?',
								responses: [{text: 'Yes', nextLine: 'exit', func: function () {gs.openingDoor.openDoor(); }},
											{text: 'No', nextLine: 'exit'}
										   ]
							   }
							  ];
	
	// CRYSTAL_CHEST:
	this.dialog.CrystalChest = [
		{text: 'Opening this chest will permanently seal nearby crystal chests.',
		 responses: [
			 {text: 'Open chest.',
			  nextLine: 'exit',
			  func: function () {
				  gs.crystalChestGroupIsOpen[gs.openingContainer.groupId] = true;
				  gs.pc.inventory.addItem(gs.openingContainer.item);
				  gs.openingContainer.item = null;
				  gs.openingContainer.setIsFull(false);
				  gs.HUD.miniMap.refresh();
			  }
			 },
			 {text: 'Nevermind.',
			  nextLine: 'exit'
			 }
		 ]
		}
	];
	
	// SEALED_CRYSTAL_CHEST:
	this.dialog.SealedCrystalChest = [
		{text: 'This chest has been permanently sealed.',
		 responses: [
			 {text: 'Ok.', nextLine: 'exit'}
		 ]
		}
	];
	
	// LOCKED_DOOR:
	this.dialog.LockedDoor = [
		{text: 'This door is locked, would you like to use a key to open it?',
		 responses: [
			 {text: 'Yes', 
			  nextLine: 'exit',
			  prereq: function () {return gs.pc.inventory.keys > 0;},
			  func: function () {gs.pc.inventory.keys -= 1; gs.openingDoor.openDoor();}
			 },
			 {text: 'No', nextLine: 'exit'}
		 ]
		}
	];
	
	// PERMA_LOCKED_DOOR:
	this.dialog.PermaLockedDoor = [
		{text: 'The gate has closed and you can see no way of opening it.',
		 responses: [{text: 'Ok', nextLine: 'exit'}]
		}
	];
	
	// SWITCH_GATE:
	this.dialog.SwitchGate = [
		{text: 'This gate is sealed shut. There must be a switch somewhere on the level that opens it.',
		 responses: [{text: 'Ok', nextLine: 'exit'}]
		}
	];
	
	// TIMED_TREASURE_ROOM:
	this.dialog.TimedTreasureRoom = [
		{text: 'You hear the sound of a gate slowly grinding shut somewhere on this level.',
		 responses: [{text: 'Ok', nextLine: 'exit'}]
		}
	];
	
	// BRANCH_HELP:
	this.dialog.BranchHelp = [
		{text: 'You have entered an optional side branch of the dungeon. You can return to the previous level at any time in order to continue your quest.',
		 responses: [{text: 'Ok', nextLine: 'exit'}]
		}
	];
	
	// THE_LICH_KINGS_LAIR:
	this.dialog.TheLichKingsLair = [
		{text: 'A strange, ghostly chanting emanates from somewhere up ahead. Something is weakening the barrier between the world of the living and the world of the dead.',
		 responses: [{text: 'Ok', nextLine: 'exit'}]
		}
	];
	
	// SLAVE:
	this.dialog.Slave = [{text: '[PLACEHOLDER] Thank you for saving me!',
						  responses: [{text: "You're welcome!", nextLine: 'exit'}
									 ],
						  func: function () {
							  gs.dialogNPC.destroy();
						  }
						 }
						];
};