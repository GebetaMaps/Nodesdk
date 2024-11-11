const axios = require('axios'); // Import Axios
const { MapSDKError, NetworkError, AuthError } = require('./errors');
const Logger = require('./logger');
const Validator = require('./validator');
const constants = require('./constants.js');

class BaseClient {
    constructor(config) {
        this.config = {
            ...config,
            timeout: config.timeout || constants.DEFAULT_TIMEOUT
        };
        this.logger = new Logger({ debug: config.debug });
        this.validator = new Validator();
    }

    /**
     * Prepares request headers
     * @private
     * @returns {Object} Headers object
     */
    _getHeaders() {
        return {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            'X-SDK-Version': constants.SDK_VERSION,
            'User-Agent': `MapSDK/${constants.SDK_VERSION} Node.js`,
            ...this.config.headers
        };
    }

    /**
     * Handles API response
     * @private
     * @param {Object} response - Axios response object
     * @returns {Promise} Parsed response
     */
    async _handleResponse(response) {
        if (response.status !== 200) {
            this._handleErrorResponse(response.status, response.data);
        }
        return response.data;
    }

    /**
     * Handles error responses
     * @private
     * @param {number} status - HTTP status code
     * @param {Object} data - Response data
     */
    _handleErrorResponse(status, data) {
        const error = data.error || {};

        switch (status) {
            case 401:
                throw new AuthError(error.message || 'Authentication failed', error.details);
            case 403:
                throw new AuthError(error.message || 'Access forbidden', error.details);
            case 429:
                throw new MapSDKError('RATE_LIMIT_EXCEEDED', error.message || 'Rate limit exceeded', status, error.details);
            default:
                throw new MapSDKError(
                    error.code || 'API_ERROR',
                    error.message || 'API request failed',
                    status,
                    error.details
                );
        }
    }

    /**
     * Makes an HTTP request to the API
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method
     * @param {Object} [data] - Request body data
     * @param {Object} [queryParams] - Query parameters
     * @returns {Promise} API response
     */
    async makeRequest(endpoint, method, data = null, queryParams = {}) {
        try {
     
            
            const url = new URL(`${constants.BASE_URL}${endpoint}`);

            const response = await axios({
                method,
                url: url.toString(),
                headers: this._getHeaders(),
                data,
                params: queryParams,
                timeout: this.config.timeout,
            });

            const result = await this._handleResponse(response);
            this.logger.debug('Request successful', {
                endpoint,
                method,
                status: response.status,
            });

            return result;

        } catch (error) {
         
            if (error.response) {
               
                // Server responded with a status outside 2xx
                this.logger.error('Request failed', {
                    error: error.response.data,
                    endpoint,
                    method,
                });
                this._handleErrorResponse(error.response.status, error.response.data);
            } else if (error.request) {
                // No response was received
                this.logger.error('No response received', { endpoint, method });
                throw new NetworkError('Network request failed', { originalError: error.message });
            } else {
                // Something happened in setting up the request
                this.logger.error('Request error', { error, endpoint, method });
                throw new NetworkError('Network request failed', { originalError: error.message });
            }
        }
    }


}

module.exports = BaseClient;
