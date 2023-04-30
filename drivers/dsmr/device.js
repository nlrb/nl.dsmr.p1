'use strict';

const Homey = require('homey');
const DSMR = require('dsmr-api');

class DsmrDevice extends Homey.Device {

  onInit() {
    let settings = this.getSettings();
    this.meter = new DSMR(settings.ip, settings.port, this.log);

    // Register listeners
    let capabilities = this.getDriver().getCapabilityList();
    for (let c in capabilities) {
      this.meter.on(capabilities[c].var, value => {
        this.setCapabilityValue(capabilities[c].capability, value).catch(e => this.error(capabilities[c].capability, e));
      });
    }
  }

  onDeleted() {
    this.meter.closeConnection();
  }

}

module.exports = DsmrDevice;
