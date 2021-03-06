"use strict";

var dsmr = require('dsmr-api');

function init() {
	Homey.log("Dutch Smart Meter application started");
	//dsmr.setDebug(true);
}

module.exports = { 
	api: { 
		registerProducer: dsmr.registerProducer,
		receiveProducerValue: dsmr.receiveProducerValue
	},
	init: init
};