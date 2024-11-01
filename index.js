const MapService = require('./lib/map-service');
const Validator = require('./lib/validator');
const { version } = require('./package.json');


class MapSDK {
    constructor(config) {
        const validator = new Validator();

        
        validator.validateConfig(config);
        this.service = new MapService(config);
    }

    getService() {
        return this.service;
    }

    getVersion() {
        return version;
    }
}

module.exports = MapSDK;
