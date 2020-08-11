/*global Character*/
'use strict';
/*
Character events are used when a characters action requires some extended amount of time to finish animating
A character with events in his queue will block all character action and turn order until the events are finished
This can is mostly used for animating more complex attacks and behaviours.

The event queue is processed first-in-first-out so that abilities can build up a list in normal order

EVENT_TYPES:
Instant + delay: an instant effect + a delay before next event is processed

Extended effect w/ an update and halt condition
*/

// CHARACTER_EVENT_QUEUE:
// ************************************************************************************************
function CharacterEventQueue (character) {
	this.character = character;
	
	
	this.eventTimer = 0;
	this.eventQueue = [];
}

// UPDATE_FRAME
// ************************************************************************************************
CharacterEventQueue.prototype.updateFrame = function () {
	if (this.eventQueue.length > 0) {
		// Update current event:
		this.eventQueue[0].updateFrame();
		
		// Remove completed events:
		if (this.eventQueue[0].isComplete()) {
			if (this.eventQueue[0].destroy) {
				this.eventQueue[0].destroy();
			}
			this.eventQueue.shift();
		}
	}
};

// ADD_EVENT:
// ************************************************************************************************
CharacterEventQueue.prototype.addEvent = function (event) {
	this.eventQueue.push(event);
};

// IS_PROCESSING:
// ************************************************************************************************
CharacterEventQueue.prototype.isProcessing = function () {
	return this.eventQueue.length > 0;
};

// CLEAR:
// ************************************************************************************************
CharacterEventQueue.prototype.clear = function () {
	this.eventTimer = 0;
	this.eventQueue = [];
};