/*global gs, localStorage*/
'use strict';

var help = {};

// LEVEL_UP_DIALOG:
// ************************************************************************************************
help.levelUpDialog = function () {
	var dialog;
	
	if (!gs.globalData.skills && gs.state !== 'DIALOG_MENU_STATE') {
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = '你已经升了一级!你现在有技能和天赋点数可以使用了。\n你的生命值和法力值也被完全恢复。';
		dialog[0].responses = [{text: '确定', nextLine: 'exit'}
							  ];

		gs.globalData.skills = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

// TALENT_DIALOG:
// ************************************************************************************************
help.talentDialog = function () {
	var dialog;
	
	if (!gs.globalData.talents && gs.state !== 'DIALOG_MENU_STATE') {
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = '你获得了一个天赋点!每升4级你将获得一个天赋点。\n游戏开始时你有一个职业自带的天赋。\n如果你找到了天赋书，你也可以从中学到一些天赋。\n所有天赋学习时都有最低等级要求。';
		dialog[0].responses = [{text: '确定', nextLine: 'exit'}
							  ];

		gs.globalData.talents = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

// ITEM_DIALOG:
// ************************************************************************************************
help.itemDialog = function () {
	var dialog;
	
	if (!gs.globalData.items && gs.state !== 'DIALOG_MENU_STATE') {
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = '你刚刚捡起一个装备，\n按C打开你的角色菜单，装备它!';
		dialog[0].responses = [{text: '确定', nextLine: 'exit'}
							  ];

		gs.globalData.items = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

// BOOK_DIALOG:
// ************************************************************************************************
help.bookDialog = function () {
	var dialog;
	
	if (!gs.globalData.books && gs.state !== 'DIALOG_MENU_STATE') {
		
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = '你刚刚捡起一本天赋书。\n按C打开你的角色菜单查看你可用的天赋。\n当你有天赋点可用时，你可以选择学习新的天赋。';
		dialog[0].responses = [{text: '确定', nextLine: 'exit'}
							  ];

		gs.globalData.books = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

// STAIRS_DIALOG:
// ************************************************************************************************
help.stairsDialog = function () {
	var dialog;
	
	if (!gs.globalData.stairs && gs.state !== 'DIALOG_MENU_STATE') {
		
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = '你发现了通往地牢更深处的一段楼梯。\n使用 < 或 > 键下楼或单击界面上的按钮。';
		dialog[0].responses = [{text: '确定', nextLine: 'exit'}];

		gs.globalData.stairs = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

// REST_DIALOG:
// ************************************************************************************************
help.restDialog = function () {
	var dialog;
	
	if (!gs.globalData.rest && gs.state !== 'DIALOG_MENU_STATE') {
		
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = '你的生命值很低，按住shift并点击你自己休息直到痊愈。';
		dialog[0].responses = [{text: '确定', nextLine: 'exit'}];

		gs.globalData.rest = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

// UNSAFE_MOVE_DIALOG:
// ************************************************************************************************
help.unsafeMoveDialog = function () {
	var dialog;
	
	if (!gs.globalData.unsafeMove && gs.state !== 'DIALOG_MENU_STATE') {
		
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = '此图块中存在危险地区，请按住Shift并单击以移动到危险地形。';
		dialog[0].responses = [{text: '确定', nextLine: 'exit'}];

		gs.globalData.unsafeMove = true;
		localStorage.setItem('globalData', JSON.stringify(gs.globalData));
		gs.dialogMenu.open(dialog);
	}	
};

