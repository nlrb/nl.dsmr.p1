module.exports = [
    {
        description: 'Register a power producer',
        method: 'PUT',
        path: '/register/',
        requires_authorizaton: false,
        fn: function(callback, args) {
            var registerProducer = Homey.app.api.registerProducer;
			if (args.body != null) {
				var ok = registerProducer(args.body.id, args.body.callback);
				callback(null, ok);
			} else {
				callback('Invalid arguments', null);
			}
        }
    },
    {
        description: 'Receive producer power value',
        method: 'PUT',
        path: '/receive/',
        requires_authorizaton: false,
        fn: function(callback, args) {
            var receiveProducerValue = Homey.app.api.receiveProducerValue;
			if (args.body != null) {
				receiveProducerValue(args.body.id, args.body.value, args.body.err);
				callback(null, true);
			} else {
				callback('Invalid arguments', null);
			}
        }
    }
];