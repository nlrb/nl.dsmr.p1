const DSMR = require('../node_modules/dsmr-api/lib/core.js');
const telegrams = ['example-telegram.txt', 'example-v4.txt', 'example-v3.txt', 'example-v5.txt'];
const path = '../node_modules/node-dsmr-parser/';

var meter = new DSMR({ ip: 0, port: 0 }, console.log);

for (var i = 0; i < telegrams.length; i++) {
   var tst = path + telegrams[i];
   console.log('>>>', tst);
   var tel = require('fs').readFileSync(tst);
   meter.processData(tel);
}
