'use strict';

// Dutch Smart Meter Driver

const Homey = require('homey')
const DSMR = require('dsmr-api');

const sensor_list = [
	{ var: 'actualWattDel', capability: 'measure_power.used' },
	{ var: 'actualWattRec', capability: 'measure_power.returned' },
	{ var: 'actualWatt', capability: 'measure_power' },
	{ var: 'sumKwhDelT1', capability: 'meter_power.t1.used' },
	{ var: 'sumKwhRecT1', capability: 'meter_power.t1.returned' },
	{ var: 'sumKwhT1', capability: 'meter_power.t1' },
	{ var: 'sumKwhDelT2', capability: 'meter_power.t2.used' },
	{ var: 'sumKwhRecT2', capability: 'meter_power.t2.returned' },
	{ var: 'sumKwhT2', capability: 'meter_power.t2' },
	{ var: 'sumKwhDel', capability: 'meter_power.used' },
	{ var: 'sumKwhRec', capability: 'meter_power.returned' },
	{ var: 'sumKwh', capability: 'meter_power' },
	{ var: 'actualVoltL1', capability: 'measure_voltage.l1' },
	{ var: 'actualVoltL2', capability: 'measure_voltage.l2' },
	{ var: 'actualVoltL3', capability: 'measure_voltage.l3' },
	{ var: 'actualCurrL1', capability: 'measure_current.l1' },
	{ var: 'actualCurrL2', capability: 'measure_current.l2' },
	{ var: 'actualCurrL3', capability: 'measure_current.l3' },
	{ var: 'actualWattDelL1', capability: 'measure_power.l1.used' },
	{ var: 'actualWattDelL2', capability: 'measure_power.l2.used' },
	{ var: 'actualWattDelL3', capability: 'measure_power.l3.used' },
	{ var: 'actualWattRecL1', capability: 'measure_power.l1.returned' },
	{ var: 'actualWattRecL2', capability: 'measure_power.l2.returned' },
	{ var: 'actualWattRecL3', capability: 'measure_power.l3.returned' },
	{ var: 'actualWattL1', capability: 'measure_power.l1' },
	{ var: 'actualWattL2', capability: 'measure_power.l2' },
	{ var: 'actualWattL3', capability: 'measure_power.l3' },
	{ var: 'flowGas', capability: 'measure_gas' },
	{ var: 'sumGas', capability: 'meter_gas' },
	{ var: 'tsGas', capability: 'timestamp.gas' }
]


class DsmrDriver extends Homey.Driver {

	onInit() {
		let manifest = Homey.ManagerDrivers.getDriver('dsmr').getManifest();
		this.titles = manifest.capabilitiesOptions;
		let locale = Homey.ManagerI18n.getLanguage();
		this.locale = (locale === 'en' || locale === 'nl' ? locale : 'en');
	}

	onPair(socket) {
		this.log('Dutch Smart Meter pairing has started...');
		let meter;

		// Search for the DSMR once we received IP address and port
		socket.on('search', (data) => {
			this.log('Request to search for DSMR on', data.ip + ':' + data.port);
			// Add default settings
			let settings = {
				ip: data.ip,
				port: Number(data.port)
			}
			meter = new DSMR(settings.ip, settings.port, this.log);
			// Add event handlers
			meter.on('found', (data) => {
				this.log(data, this.getDevice({ id: data.config.id }));
				if (data.found) {
					let id = data.config.id;
					if (this.getDevice({ id: id }) instanceof Error) {
						// Add read-only data
						settings.name = data.config.name,
						settings.version = data.config.version,
						settings.eid = data.config.id,
						settings.gid = data.config.gid
						let device = {
							name: data.config.name,
							data: {	id: id },
							settings: settings,
							capabilities: [],
							capabilitiesOptions: {}
						}
						data.device = device;
					} else {
						// Meter already present
						data.found = false;
					}
				}
				// Notify the front-end if a DSMR has been found
				this.log(data);
				socket.emit('found', data);
			});
		});

		// Selection of sensors to display
		socket.on('list_devices', async (data, callback) => {
			// Get list of sensors of type <sort>
			let devices = []
			for (let s in sensor_list) {
				let capability = sensor_list[s].capability;
				let sensor = {
					name: this.titles[capability].title[this.locale],
					// not a real device, put all information in the data element
					data: {
						id: sensor_list[s].var,
						capability: capability
					}
				};
				if (sensor_list[s].var.includes('.')) {
					data.options = {};
					data.options.sensor_list[s].var = { preventInsights: true };
				}
				devices.push(sensor);
			}
			// err, result style
			callback(null, devices)
		})

		socket.on('completed', (data) => {
			meter.closeConnection();
		})

		// Check if the pairing was finished, otherwise close connection
		socket.on('disconnect', () => {
			this.log('Pairing not completed, closing connection')
			if (meter) {
				meter.closeConnection();
			}
		});

	}

	getCapabilityList() {
		return sensor_list;
	}

}

module.exports = DsmrDriver;
