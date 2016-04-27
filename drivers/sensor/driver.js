"use strict";

// Dutch Smart Meter Driver - separate values

var dsmr = require('dsmr-api');
	
var self = module.exports = {
	
	init: function(devices, callback) {
		devices.forEach(function(device) {
			dsmr.addSensor(self, device);
		});
		
		// we're ready
		callback();
	},
	
	capabilities: {
		measure_power: {
			get: function(device, callback) {
					if (typeof callback == 'function') {
						dsmr.getValue(device.variable, device.meter, function(err, val) {
							dsmr.debug('measure_power ' + err + ':' + val);
							callback(err, val);
						});
					}
			}
		},
		meter_power: {
			get: function(device, callback) {
					if (typeof callback == 'function') {
						dsmr.getValue(device.variable, device.meter, function(err, val) {
							dsmr.debug('meter_power ' + err + ':' + val);
							callback(err, val);
						});
					}
			}
		}
	},
	
	deleted: function(device_data) {
		// run when the user has deleted the sensor from Homey
		dsmr.deleteSensor(device_data);
	},
	
	pair: function(socket) {
		Homey.log('Meter Value pairing has started...');
		var selectedMeter;

		// Let the front-end know which meters there are
		socket.emit('start', dsmr.getMeters());

		socket.on('selected', function(id, callback) {
			selectedMeter = id;
			callback(null, id);
		});

		socket.on('list_devices', function(data, callback) {
			var devices = dsmr.getSensors(selectedMeter, self);
			// err, result style
			callback(null, devices);
		});

		// Update driver administration when a device is added
		socket.on('add_device', function(device_data, callback) {
			var device = device_data.data;
			dsmr.addSensor(self, device);

			callback();
		});
	}
}
