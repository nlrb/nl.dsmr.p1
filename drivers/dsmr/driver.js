"use strict";

// Dutch Smart Meter Driver

var dsmr = require('dsmr-api');
	
var self = module.exports = {
	
	init: function(devices, callback) {
		devices.forEach(function(device) {
			self.getSettings(device, function(err, settings){
				dsmr.addMeter(self, device, settings);
			})
		});
		
		// we're ready
		callback();
	},
	
	capabilities: {
		measure_power: {
			get: function(device, callback) {
					if (typeof callback == 'function') {
						dsmr.getValue('measuredWatt', device.id, function(err, val) {
							dsmr.debug('measure_power ' + err + ':' + val);
							callback(err, val);
						});
					}
			}
		},
		meter_power: {
			get: function(device, callback) {
					if (typeof callback == 'function') {
						dsmr.getValue('sumKwh', device.id, function(err, val) {
							dsmr.debug('meter_power ' + err + ':' + val);
							callback(err, val);
						});
					}
			}
		},
		meter_gas: {
			get: function(device, callback) {
					if (typeof callback == 'function') {
						dsmr.getValue('sumGas', device.id, function(err, val) {
							dsmr.debug('meter_gas ' + err + ':' + val);
							callback(err, val);
						});
					}
			}
		},
		flow_gas: {
			get: function(device, callback) {
					if (typeof callback == 'function') {
						dsmr.getValue('flowGas', device.id, function(err, val) {
							dsmr.debug('flow_gas ' + err + ':' + val);
							callback(err, val || 0);
						});
					}
			}
		}
	},
	
	deleted: function(device_data) {
		// run when the user has deleted the panel from Homey
		dsmr.deleteMeter(device_data.id);
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
				compensate: true
			}
			dsmr.addMeter(self, null, settings);
			callback(null, true);
		});
		
		// Fully add panel when successful
		socket.on('completed', function(device_data) {
			var device = device_data.data;
			dsmr.addMeterActions(self, device);
		});
		
		// Notify the front-end if a DSMR has been found
		Homey.on('found', function(data) {
			socket.emit('found', data);
		});
	}
}