/*global game, gs, console*/
/*global SCREEN_HEIGHT, LARGE_WHITE_FONT, INVENTORY_SIZE, HUD_START_X, HUGE_WHITE_FONT*/
/*global UIItemSlotList, LARGE_WHITE_FONT, SCALE_FACTOR, ItemSlotList, SELL_ITEM_PERCENT*/
/*global MERCHANT_INVENTORY_WIDTH, MERCHANT_INVENTORY_HEIGHT*/
'use strict';



// CONSTRUCTOR:
// ************************************************************************************************
function UIShopMenu() {
	var width = 580,
        height = 540,
		startX = HUD_START_X / 2 - width / 2,
		startY = (SCREEN_HEIGHT - height) / 2,
		x,
		y,
		slotSprite,
		text,
		sprite;
	
	this.startX = startX;
	this.startY = startY;
	this.width = width;
	this.height = height;
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Menu:
    sprite = gs.createSprite(startX, startY, 'SmallMenu', this.group);
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Shop Title:
	this.titleText = gs.createText(startX + width * 0.25, startY + 20, 'Shop Inventory', HUGE_WHITE_FONT, this.group);
	gs.centerText(this.titleText);
	
	// Player Title:
	this.titleText = gs.createText(startX + width * 0.75, startY + 20, 'Player Inventory', HUGE_WHITE_FONT, this.group);
	gs.centerText(this.titleText);
	
	// Shop Inventory Slots:
	this.shopItemSlots = new UIItemSlotList(startX + 8, startY + 30, MERCHANT_INVENTORY_WIDTH, MERCHANT_INVENTORY_HEIGHT, null, this.itemClicked, this, this.group);

	// Player Inventory Slots:
	this.playerInventory = new ItemSlotList(54);
	this.playerItemSlots = new UIItemSlotList(startX + 298, startY + 30, 6, 9, null, this.playerItemClicked, this, this.group);
	
	// Item Description:
	this.nameText = gs.createText(startX + width / 2, startY + 470, '', LARGE_WHITE_FONT, this.group);
	this.costText = gs.createText(startX + width / 2, startY + 490, '', LARGE_WHITE_FONT, this.group);
	
	// Close button:
	this.closeButton = gs.createTextButton(startX + width / 2, startY + height - 20, '关闭', this.close, this, this.group);
	
	this.group.visible = false;
}

// ITEM_CLICKED:
// Buying an item:
// ************************************************************************************************
UIShopMenu.prototype.itemClicked = function (slot) {
	var cost, item , newItem;
	
	if (!slot || slot.isEmpty()) {
		return;
	}

	item = slot.item;
	
	// Item Cost:
	cost = item.baseValue();
	
	// Buy Item:
	if (gs.pc.inventory.gold >= cost) {
		// Play Item Sound:
		gs.playSound(item.getSound());
		
		// Add item:
		newItem = Object.create(item);
		newItem.amount = 1;
		gs.pc.inventory.addItem(newItem);
		
		// Remove item:
		gs.pc.inventory.gold -= cost;
		
		// Update UI:
		gs.merchantInventory.removeItem(item, 1);
		
		// Refresh both inventories:
		this.open();
		
		this.nameText.setText('');
		this.costText.setText('');
		this.refresh();
	}
};

// PLAYER_ITEM_CLICKED:
// Selling an item:
// ************************************************************************************************
UIShopMenu.prototype.playerItemClicked = function (slot) {
	var cost, item;
	
	if (!slot || slot.isEmpty()) {
		return;
	}
	
	// Play Item Sound:
	gs.playSound(slot.item.getSound());

	// Make a copy of the item w/ amount = 1 to add to merchant:
	item = Object.create(slot.item);
	item.amount = 1;
	
	// Selling Item:
	cost = slot.item.sellValue();
	gs.pc.inventory.removeItem(slot.item, 1);
	gs.pc.inventory.gold += cost;
		
	// Update UI:
	if (gs.merchantInventory.canAddItem(item)) {
		gs.merchantInventory.addItem(item);
	}
	
	// Refresh both inventories:
	this.open();
	
	// Refresh player stats:
	gs.pc.updateStats();
	
	this.nameText.setText('');
	this.costText.setText('');
	this.refresh();
};
// REFRESH:
// ************************************************************************************************
UIShopMenu.prototype.refresh = function () {
	this.shopItemSlots.refresh();
	this.playerItemSlots.refresh();
};


// UPDATE:
// ************************************************************************************************
UIShopMenu.prototype.update = function () {
	var item, str, cost;
	
	// Buying Shop Item:
	if (this.getMerchantItemUnderPointer()) {
		item = this.getMerchantItemUnderPointer();
		str = 'Buy: ';
		if (item.mod > 0) {
			str += '+' + item.mod + ' ';
		}
		str += item.type.niceName;
		this.nameText.setText(str);
		gs.centerText(this.nameText);

		this.costText.setText('Cost: ' + item.baseValue() + (item.amount > 1 ? ' Gold Each' : ' Gold'));
		gs.centerText(this.costText);
	}
	// Selling Player Item:
	else if (this.getPlayerItemUnderPointer()) {
		item = this.getPlayerItemUnderPointer();
		str = 'Sell: ';
		if (item.mod > 0) {
			str += '+' + item.mod + ' ';
		}
		str += item.type.niceName;
		this.nameText.setText(str);
		gs.centerText(this.nameText);
		
		this.costText.setText("I'll give you " + item.sellValue() + (item.amount > 1 ? ' Gold Each' : ' Gold'));
		gs.centerText(this.costText);
	}
	// No Item:
	else {
		this.nameText.setText('');
		this.costText.setText('');
	}
};

// GET_ITEM_UNDER_POINTER:
// Returns either the shop or player item under pointer
// ************************************************************************************************
UIShopMenu.prototype.getItemUnderPointer = function () {
	if (this.shopItemSlots.getItemUnderPointer()) {
		return this.shopItemSlots.getItemUnderPointer();
	}
	else if (this.playerItemSlots.getItemUnderPointer()) {
		return this.playerItemSlots.getItemUnderPointer();
	}
	else {
		return null;
	}
};

// GET_ITEM_UNDER_POINTER:
// Refers to the shops items
// ************************************************************************************************
UIShopMenu.prototype.getMerchantItemUnderPointer = function () {
	return this.shopItemSlots.getItemUnderPointer();
};

// GET_PLAYER_ITEM_UNDER_POINTER:
// Refers to the players items
// ************************************************************************************************
UIShopMenu.prototype.getPlayerItemUnderPointer = function () {
	return this.playerItemSlots.getItemUnderPointer();
};

// CLOSE:
// ************************************************************************************************
UIShopMenu.prototype.close = function () {
	gs.state = 'GAME_STATE';
	this.group.visible = false;
};

// OPEN:
// ************************************************************************************************
UIShopMenu.prototype.open = function () {
	var i, playerItems;
	
	// Set shop to dialogNPC:
	this.shop = gs.dialogNPC;
	this.shopItemSlots.setItemSlots(gs.merchantInventory.allFullItemSlots());
	this.playerItemSlots.setItemSlots(gs.pc.inventory.allFullItemSlots());
	
	this.refresh();
	gs.state = 'SHOP_MENU_STATE';
	this.group.visible = true;
};