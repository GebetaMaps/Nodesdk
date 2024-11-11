const BaseClient = require('./base-client');
const constants = require('./constants.js');
const {ValidationError} = require("./errors");

class MapService extends BaseClient {
    /**
     * Fetch directions between two points
     * @param {Object} origin - Origin point with latitude and longitude
     * @param {Object} destination - Destination point with latitude and longitude
     * @param {Array<Object>} waypoints - Optional waypoints for the route
     * @param instruction
     * @returns {Promise} Directions response
     */
    async getDirections(origin, destination, waypoints = [] , instruction = false) {
        this.validator.validateLatLng(origin);
        this.validator.validateLatLng(destination);
  
        const formattedOrigin = `{${origin.latitude},${origin.longitude}}`;
        const formattedDestination = `{${destination.latitude},${destination.longitude}}`;
        const formattedWaypoints = waypoints.map(wp => `{${wp.latitude},${wp.longitude}}`).join(',');
        let formattedInstruction = instruction ? "1" : "0" 
        
        const endpoint = '/api/route/direction';
        const params = new URLSearchParams({
            origin: formattedOrigin,
            destination: formattedDestination,
            apiKey: this.config.apiKey,
            waypoints: formattedWaypoints,
            instruction : formattedInstruction
        });
    
        
        return this.makeRequest(`${endpoint}/?${params.toString()}`, constants.HTTP_METHODS.GET);
    }



    /**
     * Fetch a distance matrix for a set of points
     * @param {Array<Object>} locations - Array of location points
     * @returns {Promise} Matrix response
     */
    async getRouteMatrix(locations) {
        if(!locations?.length || !Array.isArray(locations) ) {
            throw new ValidationError('getRouteMatrix: Invalid locations provided.', {locations});
        }
        locations.forEach(location => this.validator.validateLatLng(location));
    
        const formattedPoints = locations.map(wp => `{${wp.latitude},${wp.longitude}}`).join(',');

        const endpoint = '/api/route/matrix';
        const params = new URLSearchParams({
            json: formattedPoints,
            apiKey: this.config.apiKey
        });

        return this.makeRequest(`${endpoint}/?${params.toString()}`, constants.HTTP_METHODS.GET);
    }

    /**
     * Fetch one to many call 
     * @param {Object} origin - Origin point with latitude and longitude
     * @param {Array<Object>} locations - Array of location points
     * @returns {Promise} ONM response
     */
    async getRouteONM(origin, locations) {
        this.validator.validateLatLng(origin);
        if(!locations?.length || !Array.isArray(locations) ) {
            throw new ValidationError('getRouteONM: Invalid locations provided.', {locations});
        }
        locations.forEach(location => this.validator.validateLatLng(location));

        const formattedOrigin = `{${origin.latitude},${origin.longitude}}`;
        const formattedPoints = locations.map(wp => `{${wp.latitude},${wp.longitude}}`).join(',');

        const endpoint = '/api/route/onm';
        const params = new URLSearchParams({
            origin: formattedOrigin,
            json: formattedPoints,
            apiKey: this.config.apiKey
        });

        return this.makeRequest(`${endpoint}/?${params.toString()}`, constants.HTTP_METHODS.GET);
    }

        /**
     * fetch route optimization
     * @param {Array<Object>} locations - Array of location points
     * @returns {Promise} TSS response
     */
        async getRouteOptimization(locations) {
            if(!locations?.length || !Array.isArray(locations) ) {
                throw new ValidationError('getRouteOptimization: Invalid locations provided.', {locations});
            }
            locations.forEach(location => this.validator.validateLatLng(location));
            const formattedPoints = locations.map(wp => `{${wp.latitude},${wp.longitude}}`).join(',');

            const endpoint = '/api/route/tss';
            const params = new URLSearchParams({
                json: formattedPoints,
                apiKey: this.config.apiKey
            });
    
            return this.makeRequest(`${endpoint}/?${params.toString()}`, constants.HTTP_METHODS.GET);
        }
}

module.exports = MapService;
