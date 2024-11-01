const { ValidationError } = require('./errors');

class Validator {
    validateLatLng(point) {
        if (!point || typeof point !== 'object') {
            throw new ValidationError('Invalid LatLng object');
        }

        if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
            throw new ValidationError('Latitude and longitude must be numbers');
        }

        if (point.latitude < -90 || point.latitude > 90) {
            throw new ValidationError('Latitude must be between -90 and 90');
        }

        if (point.longitude < -180 || point.longitude > 180) {
            throw new ValidationError('Longitude must be between -180 and 180');
        }
    }

    validateConfig(config) {
    
        if (!config.apiKey) {
            throw new ValidationError('API key is required');
        }

      

        if (config.timeout && typeof config.timeout !== 'number') {
            throw new ValidationError('Timeout must be a number');
        }
    }

    validateOptions(options, allowedOptions) {
        const invalidOptions = Object.keys(options).filter(
            key => !allowedOptions.includes(key)
        );

        if (invalidOptions.length > 0) {
            throw new ValidationError(
                `Invalid options: ${invalidOptions.join(', ')}`
            );
        }
    }
}

module.exports = Validator;