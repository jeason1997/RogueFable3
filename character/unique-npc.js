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
		{text: "你好，勇敢的冒险家，欢迎来到我的小店!\n看看你对哪些产品感兴趣。",
		 responses: [
			 {text: "[View Items]", nextLine: 'barter'},
			 {text: "[Done]", nextLine: 'exit'}
		 ]
		}
	];
	
	// SKILL_TRAINER:
	this.dialog.SkillTrainer = [
		{text: "你好勇敢的冒险家。\n我可以为你提供额外的技能点，每个25金币。",
		 responses: [
			 {text: '好',
			  prereq: function () {
				  return gs.pc.inventory.gold >= 25;
			  },
			  func: function () {gs.pc.skillPoints += 1; gs.pc.inventory.gold -= 25;},
			  nextLine: 'exit'
			 },
			 {text: '不用了', 
			  nextLine: 'exit'
			 }
		 ]
		}
	];
	
	// TALENT_TRAINER:
	this.dialog.TalentTrainer = [
		{text: "你好勇敢的冒险家。\n我可以为你提供额外的天赋点，每点花费100金币。",
		 responses: [
			 {text: '好',
			  prereq: function () {
				  return gs.pc.inventory.gold >= 100;
			  },
			  func: function () {
				  gs.pc.talentPoints += 1;
				  gs.pc.inventory.gold -= 100;
			  },
			  nextLine: 'exit'},
			 {text: '不用了', nextLine: 'exit'}
		 ]
		}
	];
	
	// PRIEST:
	this.dialog.Priest = [{text: "你好勇敢的冒险家。只要捐出10金币，\n我就可以完全恢复你的生命值和法力值，并为你提供强大的祝福。",
								 responses: [{text: '好',
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
											 {text: '不用了', nextLine: 'exit'}
											 ]
								}
							   ];
    
	// GUARDED_CONTAINER:
	this.dialog.GuardedContainer = [
		{text: '您确定要打开此容器吗？',
		 responses: [
			 {text: '是', nextLine: 'exit', func: function () {gs.openingContainer.openContainer(); }},
			 {text: '否', nextLine: 'exit'}
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
	this.dialog.GuardedDoor = [{text: '这扇门上画着警告的符号。确定要打开它吗?',
								responses: [{text: '是', nextLine: 'exit', func: function () {gs.openingDoor.openDoor(); }},
											{text: '否', nextLine: 'exit'}
										   ]
							   }
							  ];
	
	// CRYSTAL_CHEST:
	this.dialog.CrystalChest = [
		{text: '打开这个箱子将永久密封附近的水晶箱子。',
		 responses: [
			 {text: '打开箱子',
			  nextLine: 'exit',
			  func: function () {
				  gs.crystalChestGroupIsOpen[gs.openingContainer.groupId] = true;
				  gs.pc.inventory.addItem(gs.openingContainer.item);
				  gs.openingContainer.item = null;
				  gs.openingContainer.setIsFull(false);
				  gs.HUD.miniMap.refresh();
			  }
			 },
			 {text: '取消',
			  nextLine: 'exit'
			 }
		 ]
		}
	];
	
	// SEALED_CRYSTAL_CHEST:
	this.dialog.SealedCrystalChest = [
		{text: '这个箱子已经被永久密封了。',
		 responses: [
			 {text: '确定', nextLine: 'exit'}
		 ]
		}
	];
	
	// LOCKED_DOOR:
	this.dialog.LockedDoor = [
		{text: '这扇门是锁着的，你要用钥匙打开吗?',
		 responses: [
			 {text: '是', 
			  nextLine: 'exit',
			  prereq: function () {return gs.pc.inventory.keys > 0;},
			  func: function () {gs.pc.inventory.keys -= 1; gs.openingDoor.openDoor();}
			 },
			 {text: '否', nextLine: 'exit'}
		 ]
		}
	];
	
	// PERMA_LOCKED_DOOR:
	this.dialog.PermaLockedDoor = [
		{text: '大门已经关上了，你看不出有什么办法打开它。',
		 responses: [{text: '确定', nextLine: 'exit'}]
		}
	];
	
	// SWITCH_GATE:
	this.dialog.SwitchGate = [
		{text: '该门被封上了。这一层在某处一定有一个开关可以打开它。',
		 responses: [{text: '确定', nextLine: 'exit'}]
		}
	];
	
	// TIMED_TREASURE_ROOM:
	this.dialog.TimedTreasureRoom = [
		{text: '你可以听到在这一层的某个地方，一扇门慢慢地关闭的声音。',
		 responses: [{text: '确定', nextLine: 'exit'}]
		}
	];
	
	// BRANCH_HELP:
	this.dialog.BranchHelp = [
		{text: '你进入了一个可选的地牢分支。\n你可以在任何时候回到上一关继续你的任务。',
		 responses: [{text: '确定', nextLine: 'exit'}]
		}
	];
	
	// THE_LICH_KINGS_LAIR:
	this.dialog.TheLichKingsLair = [
		{text: '一种奇怪的、幽灵般的吟唱从前方某处发出。\n有些东西正在削弱生者世界和死者世界之间的屏障。',
		 responses: [{text: '确定', nextLine: 'exit'}]
		}
	];
	
	// SLAVE:
	this.dialog.Slave = [{text: '[PLACEHOLDER] 谢谢你救了我!',
						  responses: [{text: "不用客气!", nextLine: 'exit'}
									 ],
						  func: function () {
							  gs.dialogNPC.destroy();
						  }
						 }
						];
};