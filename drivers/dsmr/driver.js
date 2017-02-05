"use strict";

// Dutch Smart Meter Driver

var dsmr = require('dsmr-api');
	
var self = module.exports = {
	
	init: function(devices, callback) {
		devices.forEach(function(device_data) {
			self.getSettings(device_data, function(err, settings){
				// Get the Homey name of the device
				self.getName(device_data, function(err, name) {
					dsmr.addMeter(self, device_data, settings, name);
				});
			})
		});
		
		// we're ready
		callback();
	},
	
	capabilities: {
		measure_power: {
			get: function(device_data, callback) {
					if (typeof callback == 'function') {
						dsmr.getValue('measuredWatt', device_data.id, function(err, val) {
							dsmr.debug('measure_power ' + err + ':' + val);
							callback(err, val);
						});
					}
			}
		},
		meter_power: {
			get: function(device_data, callback) {
					if (typeof callback == 'function') {
						dsmr.getValue('sumKwh', device_data.id, function(err, val) {
							dsmr.debug('meter_power ' + err + ':' + val);
							callback(err, val);
						});
					}
			}
		},
		meter_gas: {
			get: function(device_data, callback) {
					if (typeof callback == 'function') {
						dsmr.getValue('sumGas', device_data.id, function(err, val) {
							dsmr.debug('meter_gas ' + err + ':' + val);
							callback(err, val);
						});
					}
			}
		},
		flow_gas: {
			get: function(device_data, callback) {
					if (typeof callback == 'function') {
						dsmr.getValue('flowGas', device_data.id, function(err, val) {
							dsmr.debug('flow_gas ' + err + ':' + val);
							callback(err, val || 0);
						});
					}
			}
		}
	},
	
	settings: function(device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
		// run when the user has changed the device's settings in Homey.
		// changedKeysArr contains an array of keys that have been changed, for your convenience :)
		dsmr.updateSettings(device_data.id, changedKeysArr, newSettingsObj);
		// always fire the callback, or the settings won't change!
		// if the settings must not be saved for whatever reason:
		// callback( "Your error message", null );
		// else
		callback(null, true);
	},
	
	pair: function(socket) {
		Homey.log('Dutch Smart Meter pairing has started...');

		// Search for the DSMR once we received IP address and port
		socket.on('search', function(data, callback) {
			dsmr.debug('Request to search for DSMR on ' + data.ip + ':' + data.port);
			// Add default settings
			var settings = {
				ip: data.ip,
				port: Number(data.port),
				dsmrV4: data.dsmrV4,
				compensate: true,
				onTime: true,
				timeOffset: 1000
			}
			dsmr.addMeter(self, null, settings);
			var dsmrV4 = data.dsmrV4;
			callback(null, true);
		});
		
		// Notify the front-end if a DSMR has been found
		Homey.on('found', function(data) {
			socket.emit('found', data);
		});
	},
	
	added: function(device_data, callback) {
		// Update driver administration when a device is added
		self.getName(device_data, function(err, name) {
			dsmr.addMeterActions(self, device_data, name);
		});

		callback();
	},
	
	renamed: function(device_data, new_name) {
		dsmr.updateMeterName(device_data.id, new_name);
	},
	
	deleted: function(device_data) {
		// run when the user has deleted the panel from Homey
		dsmr.deleteMeter(device_data.id);
	}
}
