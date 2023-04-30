'use strict';

const Homey = require('homey');

class DsmrApp extends Homey.App {
	onInit() {
		this.log("Dutch Smart Meter application started");
	}
}

module.exports = DsmrApp;
